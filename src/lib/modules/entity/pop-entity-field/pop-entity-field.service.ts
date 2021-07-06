import {Injectable} from '@angular/core';
import {PopRequestService} from '../../../services/pop-request.service';
import {
  CoreConfig,
  Dictionary,
  FieldConfig,
  FieldCustomSettingInterface,
  FieldItemPatchInterface,
  PopBaseEventInterface,
  PopLog,
  ServiceInjector
} from '../../../pop-common.model';
import {PopExtendService} from '../../../services/pop-extend.service';
import {
  ConvertObjectToUri,
  GetHttpErrorMsg,
  IsArray,
  IsDefined,
  IsObject,
  JsonCopy, StorageGetter,
  StringReplaceAll
} from '../../../pop-common-utility';
import {EntityFieldSetting} from './pop-entity-field.setting';
import {FieldItemModelConfig, IsValidFieldPatchEvent, ParseUrlForParams} from '../pop-entity-utility';
import {FormControl} from "@angular/forms";


@Injectable({providedIn: 'root'})
export class PopEntityFieldService extends PopExtendService {
  protected name = 'PopEntityFieldService';

  protected srv: {
    request: PopRequestService,
  } = {
    request: ServiceInjector.get(PopRequestService)
  };


  constructor() {
    super();
    PopLog.init(this.name, 'init', this);
  }


  // /**
  //  * Ensure that at least 1 label exists
  //  * @param field
  //  */
  // setFieldEntries(field: FieldInterface): Promise<boolean>{
  //   return new Promise<boolean>((resolve) => {
  //     if( !( IsArray(field.entries, true) ) ){
  //       const entry = {
  //         name: TitleCase(`${field.fieldgroup.name} 1`),
  //         type: 'provided'
  //       };
  //       this.srv.request.doPost(`fields/${field.id}/entries`, entry, 1, false).subscribe((res) => {
  //         res = res.data ? res.data : res;
  //         field.entries = [ res ];
  //         return resolve(true);
  //       }, (err) => {
  //         PopLog.error(this.name, `_setFieldEntryValues`, GetHttpErrorMsg(err));
  //         return resolve(false);
  //       });
  //     }else{
  //       return resolve(true);
  //     }
  //   });
  // }


  // /**
  //  * Ensure that the field has the correct amount of values
  //  * @param field
  //  */
  // setFieldValues(field: FieldInterface): Promise<boolean>{
  //   return new Promise<boolean>((resolve) => {
  //
  //     if( IsArray(field.entries, true) ){
  //       const realDataKeys = Object.keys(field.data).filter((id) => +id > 0);
  //       const api = [];
  //       if( !realDataKeys.length ){
  //         console.log('create default value for  ', realDataKeys, field);
  //         api.push(1);
  //       }
  //       if(field.multiple){
  //         let neededValues = field.multiple_min - realDataKeys.length;
  //         console.log('needed', neededValues);
  //         while(neededValues){
  //           api.push(1);
  //           neededValues--;
  //         }
  //
  //       }
  //       console.log('should have values', api)
  //
  //       return resolve(true);
  //     }else{
  //       return resolve(false);
  //     }
  //   });
  // }

  addEntryValue(core: CoreConfig, field: FieldConfig) {

    const dataIndex = field.data_keys.length;
    const entry = dataIndex in field.entries ? field.entries[dataIndex] : null;
    if (IsObject(entry, ['id'])) {
      console.log('entry', entry);
      const item = {
        data: {},
        entry: entry,
        config: {},
        index: dataIndex
      };
      Object.keys(field.children).map((name) => {
        const fieldItem = JsonCopy(field.children[name]);
        fieldItem.model.value = null; // clear any value that might have been stored from previous entry
        item.data[name] = null;
        fieldItem.model.facade = true;
        item.config[name] = FieldItemModelConfig(core, fieldItem.model);
      });
      return item;
    } else {
      console.log('fail', entry);
      return null;
    }
  }


  removeEntryValue(core: CoreConfig, field: FieldConfig, dataKey: number): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      console.log('removeEntryValue', core, field, dataKey);
      const data = field.data[dataKey];
      if (IsObject(data, ['id'])) {
        const body = {};
        const path = StringReplaceAll(ParseUrlForParams(`#path/#entityId`, core.params), '//', '/');
        body[field.name] = {
          field_entry_id: dataKey,
          id: data.id
        };
        this.srv.request.doDelete(path, body, 1, false).subscribe((res) => {
          if (res.data) res = res.data;
          console.log('removeEntryValue', res);
          return resolve(true);
        }, () => {
          return resolve(false);
        });
      } else {
        return resolve(true);
      }
    });

  }


  /**
   * Update a value for a single field item column of a field record
   * @param core
   * @param field
   * @param event
   */
  updateFieldItem(core: CoreConfig, field: FieldConfig, event: PopBaseEventInterface): Promise<boolean> {
    return new Promise((resolve) => {
      if (IsValidFieldPatchEvent(core, event)) {
        const patch = {};
        const path = StringReplaceAll(ParseUrlForParams(`#path/#entityId`, core.params), '//', '/');
        patch[field.name] = {
          field_entry_id: +event.data_key,
          field_id: +field.id,
          id: field.data[event.data_key].id ? field.data[event.data_key].id : null
        };
        patch[field.name][event.column] = event.config.control.value;
        this.srv.request.doPatch(path, patch, 1, false).subscribe((res) => {
          if (res.data) res = res.data;
          const value = res[field.name].record[event.column];
          field.data[event.data_key].id = res[field.name].record.id;
          field.data[event.data_key][event.column] = value;


          // if( IsObject(core.entity[ field.name ], true) ){
          //   core.entity[ field.name ][ event.column ] = value;
          // }else if( IsArray(core.entity[ field.name ], true) ){
          //   console.log('session the data', core.entity[ field.name ], value);
          // }

          return resolve(true);
        }, (err) => {
          const fieldPatch = <FieldItemPatchInterface>event.config.patch;
          const control = <FormControl>event.config.control;
          fieldPatch.running = false;
          control.markAsDirty();
          control.setValue(this.asset.storedValue);
          control.setErrors({server: true});
          event.config.message = GetHttpErrorMsg(err);
          return resolve(false);
        });
      }
    });

  }


  /**
   * Set any field settings for this field & field items, and apply and stored values
   * @param field
   * @param settings
   */
  setFieldCustomSetting(field: FieldConfig, settings: Dictionary<FieldCustomSettingInterface>) {
    const stored = field.configs;
    if (IsObject(field, ['fieldgroup', 'configs']) && IsObject(settings)) {
      settings = JSON.parse(JSON.stringify({...EntityFieldSetting, ...settings}));
      Object.keys(settings).map((name: string) => {
        const setting = settings[name];
        if (IsObject(setting, true)) {
          const value = IsDefined(setting.value, false) ? setting.value : setting.defaultValue;
          setting.value = <any>value;
          if (setting.item && IsObject(field.children, [setting.item])) {
            field.children[setting.item].custom_setting[name] = setting;
            field.children[setting.item].setting[name] = value;
          } else {
            field.custom_setting[name] = setting;
            field.setting[name] = value;
          }
        }
      });

      const childrenIdLookup = {};
      Object.keys(field.children).map((name) => {
        childrenIdLookup[field.children[name].id] = name;
      });

      if (IsArray(stored.field_configs, true)) {
        stored.field_configs.map((setting) => {
          if (!field.custom_setting[setting.name]) {
            // ToDo:: Do We want to allow the database to pass in configs that are not local?
            PopLog.warn(this.name, `setFieldCustomSettingDefaults: setting no longer defined`, setting);
            // field.custom_setting[ setting.name ] = setting;
          } else {
            field.custom_setting[setting.name].id = setting.id;
            field.custom_setting[setting.name].value = setting.value;
          }
          field.setting[setting.name] = setting.value;
        });
      }


      if (IsObject(stored.item_configs, true)) {
        Object.keys(stored.item_configs).map((fieldItemId) => {
          const fieldItemConfigs = stored.item_configs[fieldItemId];
          if (IsArray(fieldItemConfigs, true)) {
            fieldItemConfigs.map((setting) => {
              if (setting.field_id in childrenIdLookup) {
                const item = field.children[childrenIdLookup[setting.field_id]];

                // if( !item.custom_setting ) item.custom_setting = {};
                if (!item.custom_setting[setting.name]) {
                  // ToDo:: Do We want to allow the database to pass in configs that are not local
                  PopLog.warn(this.name, `setFieldCustomSettingDefaults: setting no longer defined`, setting);
                  // item.custom_setting[ setting.name ] = setting;
                } else {
                  item.custom_setting[setting.name].id = setting.id;
                  item.custom_setting[setting.name].value = setting.value;
                }
                // if( !item.setting ) item.setting = {};
                item.setting[setting.name] = setting.value;
                console.log('here', setting.name, {item: item, setting: setting});
              }
            });
          }
        });
      }
    }
  }


  /************************************************************************************************
   *                                                                                              *
   *                                      Under The Hood                                          *
   *                                    ( Private Method )                                        *
   *                                                                                              *
   ************************************************************************************************/

  private _my() {
    return true;
  }
}
