import {Injectable, OnDestroy} from '@angular/core';
import {PopExtendService} from '../../../services/pop-extend.service';
import {
  CoreConfig, Dictionary,
  DynamicComponentInterface,
  FieldConfig,
  FieldCustomSettingInterface,
  FieldInterface, FieldItemInterface,
  PopBaseEventInterface, PopLog, PopRequest,
} from '../../../pop-common.model';
import {
  ArrayMapSetter,
  CleanObject, ConvertArrayToOptionList, DynamicSort,
  GetHttpErrorMsg, GetHttpObjectResult, GetHttpResult,
  IsArray, IsDefined,
  IsObject,
  IsObjectThrowError, IsString, RandomInt,
  SnakeToPascal, StorageSetter,
  TitleCase
} from '../../../pop-common-utility';
import {PopDomService} from '../../../services/pop-dom.service';
import {EntityFieldSetting} from '../pop-entity-field/pop-entity-field.setting';
import {from, Observable} from 'rxjs';
import {PopSwitchComponent} from '../../base/pop-field-item/pop-switch/pop-switch.component';
import {SwitchConfig} from '../../base/pop-field-item/pop-switch/switch-config.model';
import {FieldItemRules, GetCustomFieldSettings, IsValidFieldPatchEvent} from '../pop-entity-utility';
import {PopSelectComponent} from '../../base/pop-field-item/pop-select/pop-select.component';
import {SelectConfig} from '../../base/pop-field-item/pop-select/select-config.model';
import {EntitySchemeSectionInterface} from '../pop-entity-scheme/pop-entity-scheme.model';
import {AddressFieldSetting} from '../pop-entity-field/pop-entity-address/address.setting';
import {EmailFieldSetting} from '../pop-entity-field/pop-entity-email/email.setting';
import {NameFieldSetting} from '../pop-entity-field/pop-entity-name/name.setting';
import {PhoneFieldSetting} from '../pop-entity-field/pop-entity-phone/phone.setting';
import {SelectMultiFieldSetting} from '../pop-entity-field/pop-entity-select-multi/select-mulit.setting';
import * as data from './MOCK_DATA.json';

@Injectable({
  providedIn: 'root'
})
export class PopFieldEditorService extends PopExtendService implements OnDestroy {
  public name = 'PopFieldEditorService';

  protected asset = {
    data: <any> (data as any).default,
    core: <CoreConfig>undefined,
    field: <FieldConfig>undefined,
    viewParams: { // These are the represent the params that we want to display for a specific form
      select: {
        disabled: 1,
        display: 1,
        required: 1,
        // required: 1
      },
      select_multi: {
        disabled: 1,
        display: 1,
        helpText: 1,
        // required: 1
      },
      input: {
        display: 1,
        readonly: 1,
        required: 1,
        pattern: 1,
        validation: 1,
        transformation: 1,
        maxlength: 1,
        minlength: 1,
        mask: 1,
        disabled: 1,
        allow_canada: 1,
        auto_fill: 1
      },
      phone: {
        display: 1,
        readonly: 1,
        required: 1,
        mask: 1
      },
      checkbox: {
        display: 1,
        readonly: 1,
      },
      button: {
        display: 1,
        disabled: 1,
      },
      radio: {
        display: 1,
        disabled: 1,
        layout: 1
      },
      switch: {
        display: 1,
        disabled: 1,
        allow_canada: 1,
        auto_fill: 1
      }
    },

    viewLabels: {
      address: {
        defaultValue: 'Address',
      },
      phone: {
        defaultValue: 'Phone',
      },
    },

    viewMultiple: {
      address: 1,
      phone: 1,
      email: 1,
      switch: 1
      // input: 1,
      // select: 1,
      // name: 1
    },

    viewOptions: {
      select: {
        enum: false,
        defaultValue: 1,
        values: [
          {value: 1, name: 'Option 1'},
          {value: 2, name: 'Option 2'},
          {value: 3, name: 'Option 3'},
        ]
      },
      select_multi: {
        enum: false,
        defaultValue: [],
        values: [
          {value: 1, name: 'Option 1'},
          {value: 2, name: 'Option 2'},
          {value: 3, name: 'Option 3'},
        ]
      },
      radio: {
        enum: false,
        defaultValue: 'yes',
        values: [
          {value: 'yes', name: 'Yes'},
          {value: 'no', name: 'No'},
        ]
      },
    },

    viewRequired: { // This represents field items that we want to force to to be always active
      address: {
        label: 1,
        zip: 1
      },
      input: {
        value: 1
      },
      select: {
        value: 1
      },
      select_multi: {
        value: 1
      },
      multi_selection: {
        value: 1
      },
      switch: {
        value: 1
      },
      phone: {
        label: 1,
        number: 1
      },
      email: {
        address: 1
      },
      name: {
        first: 1,
        last: 1
      }
    },

    viewIgnored: { // This represents field items that we want to force to to be always active
      address: {
        street: 1,
        u_s_state_id: 1
      },
    },

    viewTemplate: { // gives user the ability to see data with a different html format
      selection: 1,
    },

    labelTypes: {
      defaultValue: 'provided',
      options: [{value: 'provided', name: 'Provided'}, {value: 'custom', name: 'Custom'}],
    },
  };


  constructor() {
    super();
  }


  /**
   * Register the field to make sure that any needed attributes are added
   * @param core
   * @param dom
   */
  register(core: CoreConfig, dom: PopDomService, scheme?: EntitySchemeSectionInterface): Promise<boolean> {
    return new Promise((resolve) => {
      if (IsObjectThrowError(core, ['entity'], `Invalid Core`) && IsObjectThrowError(core.entity, true, `Invalid Core`)) {
        this.asset.core = core;
        // console.log('field is ', core.entity);
        this.asset.core.entity.items.map((item) => {
          FieldItemRules(item);
        });
        this._setFieldCustomSettings(core.entity);
        if (IsObject(core.entity.custom_setting, true)) {
          if (!dom.ui.customSetting) dom.ui.customSetting = {};
          Object.keys(core.entity.custom_setting).map((settingName) => {
            const setting = core.entity.custom_setting[settingName];
            const component = this.getCustomSettingComponent(core, core.entity, setting, scheme);
            dom.ui.customSetting[setting.name] = component;
          });
        }

        this.asset.core.entity.trait = this.getFieldTraits(this.asset.core.entity.fieldgroup.name);
        this._setFieldEntryValues(core, scheme).then(() => {
          return resolve(true);
        });
      }
    });
  }


  // /**
  //  * When we pull field up in the editor to make changes, clear out the cache of that field so when the field is viewed it will pull in any changes
  //  * @param internal_name
  //  * @param fieldId
  //  */
  // clearCustomFieldCache( internal_name: string, fieldId: number ){
  //   this.srv.field.clearCustomFieldCache( fieldId );
  // }


  /**
   * Get a set of mock data for a given field
   * @param internal_name
   */
  getDefaultValues(internal_name: string) {
    let defaultValues = <any>{};
    switch (internal_name) {
      case 'address':
        defaultValues = this.getAddressValues();
        break;
      case 'phone':
        defaultValues = this.getPhoneValues();
        break;
      case 'name':
        defaultValues = this.getNameValues();
        break;
      default:
        defaultValues = {value: null};
        break;
    }
    return defaultValues;
  }


  isSchemePrimaryField(scheme: EntitySchemeSectionInterface, field: FieldInterface,) {
    if (IsObject(scheme, ['id', 'mapping']) && IsObject(field, ['id', 'fieldgroup'])) {
      const primary = this.getSchemePrimary(scheme);
      const groupName = field.fieldgroup.name;
      if (groupName in primary && +primary[groupName] === +field.id) {

      }
    }
    return false;
  }


  isSchemeFieldItemDisabled(scheme: EntitySchemeSectionInterface, fieldId: number, itemId: number): boolean {
    if (IsObject(scheme, ['id', 'mapping']) && +fieldId && +itemId) {
      const setting = this.getSchemeFieldItemMapping(scheme, fieldId, itemId);
      if (IsDefined(setting.active, false)) {
        return +setting.active === 1 ? false : true;
      }
    }
    return false;
  }


  isSchemeFieldEntryDisabled(scheme: EntitySchemeSectionInterface, fieldId: number, entryId: number): boolean {
    if (IsObject(scheme, ['id', 'mapping']) && +fieldId && +entryId) {
      const setting = this.getSchemeFieldSetting(scheme, fieldId);
      return IsArray(setting.disabled_entries, true) && setting.disabled_entries.includes(entryId);
    }
    return false;
  }


  getSchemeFieldSetting(scheme: EntitySchemeSectionInterface, fieldId: number): Dictionary<any> {
    if (IsObject(scheme, true) && +fieldId) {
      this.ensureSchemeFieldMapping(scheme, fieldId);
      let storage = this.getSchemeFieldMapping(scheme);
      if (IsObject(storage, true)) {
        storage = (<Dictionary<any>>StorageSetter(storage, [`field_${fieldId}`]));
        return storage;
      }
    }
    return null;
  }


  getSchemeFieldSection(scheme: EntitySchemeSectionInterface, fieldId: number, sectionName: string) {
    if (IsObject(scheme, true) && +fieldId) {

      const storage = this.getSchemeFieldSetting(scheme, fieldId);
      if (IsObject(storage)) {
        return (<FieldItemInterface>StorageSetter(storage, [sectionName]));
      }
    }
    return null;
  }


  ensureSchemeFieldMapping(scheme: EntitySchemeSectionInterface, fieldId: number): void {
    if (!(IsObject(scheme.mapping))) {
      scheme.mapping = {};
    }
    if (!(IsObject(scheme.mapping.field))) {
      scheme.mapping.field = {};
    }
    if (!(IsObject(scheme.mapping.field[`field_${fieldId}`]))) {
      scheme.mapping.field[`field_${fieldId}`] = {};
    }
    if (!(IsObject(scheme.mapping.field[`field_${fieldId}`].trait_entry))) {
      scheme.mapping.field[`field_${fieldId}`].trait_entry = {};
    }
    if (!(IsArray(scheme.mapping.field[`field_${fieldId}`].disabled_entries))) {
      scheme.mapping.field[`field_${fieldId}`].disabled_entries = [];
    }
  }


  getSchemeFieldItemMapping(scheme: EntitySchemeSectionInterface, fieldId: number, itemId: number): Dictionary<any> {
    if (IsObject(scheme, true) && +fieldId && +itemId) {
      let storage = <Dictionary<any>>this.getSchemeFieldSetting(scheme, fieldId);
      if (IsObject(storage, true)) {
        if (!(IsObject(storage.item))) {
          storage.item = {};
        }
        if (!(IsObject(storage.item[`item_${itemId}`]))) {
          storage.item[`item_${itemId}`] = {};
        }
        storage = <FieldItemInterface>StorageSetter(storage, ['item', `item_${itemId}`]);

        return <Dictionary<any>>storage;
      }
    }
    return null;
  }


  getSchemeFieldItemSection(scheme: EntitySchemeSectionInterface, fieldId: number, itemId: number, sectionName: string) {
    if (IsObject(scheme, true) && +fieldId && +itemId && IsString(sectionName, true)) {
      const storage = this.getSchemeFieldItemMapping(scheme, fieldId, itemId);
      if (storage && IsString(sectionName, true)) {
        return StorageSetter(storage, [sectionName]);
      }
    }
    return null;
  }


  getFieldTraits(fieldGroupName: string): FieldCustomSettingInterface[] {
    const traits = [];
    let setting = {};
    switch (String(fieldGroupName).toLowerCase()) {
      case 'address':
        setting = AddressFieldSetting;
        break;
      case 'email':
        setting = EmailFieldSetting;
        break;
      case 'name':
        setting = NameFieldSetting;
        break;
      case 'phone':
        setting = PhoneFieldSetting;
        break;
      case 'select-multi':
        setting = SelectMultiFieldSetting;
        break;
      case 'radio':
        break;
    }
    if (IsObject(setting, true)) {
      Object.keys(setting).map((settingName: string) => {
        const tmp = setting[settingName];
        if (IsObject(tmp, ['type'])) {
          if (tmp.type === 'trait') {
            traits.push(tmp);
          }
        }
      });
    }
    return traits;
  }


  getSchemePrimary(scheme: EntitySchemeSectionInterface) {
    return StorageSetter(scheme, ['mapping', 'primary']);
  }


  getSchemeRequired(scheme: EntitySchemeSectionInterface) {
    return StorageSetter(scheme, ['mapping', 'required']);
  }


  getSchemeFieldMapping(scheme: EntitySchemeSectionInterface) {
    return StorageSetter(scheme, ['mapping', 'field']);
  }


  updateSchemeFieldMapping(scheme: EntitySchemeSectionInterface) {
    return new Promise<boolean>(async (resolve) => {
      if (IsObject(scheme, ['id'])) {
        const res = await this._updateSchemeFieldMapping(scheme, 'field');
        return resolve(res);
      }
    });
  }


  updateSchemePrimaryMapping(scheme: EntitySchemeSectionInterface) {
    return new Promise<boolean>(async (resolve) => {
      if (IsObject(scheme, ['id'])) {
        const res = await this._updateSchemeFieldMapping(scheme, 'primary');
        return resolve(res);
      }
    });
  }


  updateSchemeRequiredMapping(scheme: EntitySchemeSectionInterface) {
    if (IsObject(scheme, ['id'])) {
      this._updateSchemeFieldMapping(scheme, 'required');
    }
  }


  /**
   * When a entry is added , we need to set a default type
   */
  getDefaultLabelTypeOptions() {
    return JSON.parse(JSON.stringify(this.asset.labelTypes));
  }


  /**
   * Check what param options apply to a specific field
   * @param key
   */
  getViewParams(key: string = null) {
    if (key && key in this.asset.viewParams) {
      return JSON.parse(JSON.stringify(this.asset.viewParams[key]));
    }
    return JSON.parse(JSON.stringify(this.asset.viewParams));
  }


  /**
   * Check what param options apply to a specific field
   * @param key
   */
  getViewMultiple(key: string = null) {
    if (key) {
      if (key in this.asset.viewMultiple) {
        return this.asset.viewMultiple[key];
      } else {
        return null;
      }
    }
    return JSON.parse(JSON.stringify(this.asset.viewMultiple));
  }


  /**
   * Check what fields items are required under a fieldgroup type
   * @param fieldGroupName
   * @param fieldItemName
   */
  getViewRequired(fieldGroupName: string, fieldItemName: string) {
    return fieldGroupName in this.asset.viewRequired && fieldItemName in this.asset.viewRequired[fieldGroupName];
  }


  /**
   * Check what fields items are ingnored under a fieldgroup type
   * @param fieldGroupName
   * @param fieldItemName
   */
  getViewIgnored(fieldGroupName: string, fieldItemName: string, scheme?: EntitySchemeSectionInterface) {
    if (fieldGroupName in this.asset.viewIgnored && fieldItemName in this.asset.viewIgnored[fieldGroupName]) {
      return true;
    }
    return false;
  }


  /**
   * Get a set of default options to for a specific view , ie.. a radio, select need options
   * @param key
   */
  getViewOptions(key: string = null) {
    if (key && key in this.asset.viewOptions) {
      return JSON.parse(JSON.stringify(this.asset.viewOptions[key]));
    }
    return JSON.parse(JSON.stringify(this.asset.viewOptions));
  }


  /**
   * Address Data Factory
   */
  getAddressValues() {

    const random = Math.floor(Math.random() * 50);
    return {
      // business: company.companyName(),
      line_1: this.asset.data[random].line_1,
      line_2: this.asset.data[random].line_2,
      line_3: 'Attn: ' + this.asset.data[random].line_3,
      city: this.asset.data[random].city,
      region_id: this.asset.data[random].region_id,
      county: 'Ohio',
      country_id: 1,
      zip: String(this.asset.data[random].zip).slice(0, 5),
      zip_4: '0000',
    };
  }


  /**
   * Name Data Factory
   */
  getNameValues() {
    const random = Math.floor(Math.random() * 50);

    return {
      prefix: this.asset.data[random].prefix,
      first: this.asset.data[random].first,
      middle: this.asset.data[random].middle,
      last: this.asset.data[random].last,
      suffix: this.asset.data[random].suffix,
    };
  }


  /**
   * Phone Data Factory
   */
  getPhoneValues() {
    const random = Math.floor(Math.random() * 50);

    return {
      title: undefined,
      country_id: 1,
      number: this.asset.data[random].number,
      extension: '123456',
      voice_button: null,
      sms_button: null,
      can_call: 1,
      can_text: 1,
    };
  }


  /**
   * This was built for rendering a dynamic list of custom settings, Probably not the right approach since settings so far have been sporadically placed so far
   * @param core
   * @param field
   * @param setting
   */
  getCustomSettingComponent(core: CoreConfig, field: FieldInterface, setting: FieldCustomSettingInterface, scheme?: EntitySchemeSectionInterface) {
    let component;
    const hasAccess = core.access.can_update && !core.entity.system ? true : false;
    switch (String(setting.type).toLowerCase()) {
      case 'boolean':
        component = <DynamicComponentInterface>{
          type: PopSwitchComponent,
          inputs: {
            core: core,
            config: new SwitchConfig({
              name: setting.name,
              label: setting.label ? setting.label : TitleCase(SnakeToPascal(setting.name)),
              helpText: setting.helpText ? setting.helpText : null,
              value: typeof setting.value !== 'undefined' ? <boolean>setting.value : <boolean>setting.defaultValue,
              facade: true,
              disabled: !hasAccess,
              metadata: {
                setting: setting
              },
              patch: {
                field: ``,
                path: ``,
                callback: (ignore: CoreConfig, event: PopBaseEventInterface) => {
                  if (IsValidFieldPatchEvent(core, event)) {
                    if (IsObject(scheme, true)) {
                      const session = this.getSchemeFieldSection(scheme, +field.id, 'setting');
                      if (IsObject(session)) {
                        session[setting.name] = event.config.control.value;
                        this._updateSchemeFieldMapping(scheme, 'field');
                      }

                    } else {
                      this.storeCustomSetting(core, event).then(() => {
                        PopLog.event(this.name, `Custom Setting Saved:`, event);
                      });
                    }
                  }
                }
              }
            }),
            hidden: 0,
            when: setting.when ? setting.when : null,
          },
          position: field.position,
          ancillary: true,
          sort: field.sort,
        };
        break;
      case 'transformation':
        component = <DynamicComponentInterface>{
          type: PopSelectComponent,
          inputs: {
            core: core,
            config: new SelectConfig({
              name: setting.name,
              label: setting.label ? setting.label : TitleCase(SnakeToPascal(setting.name)),
              helpText: setting.helpText ? setting.helpText : null,
              value: setting.value ? <any>setting.value : setting.defaultValue,
              disabled: !hasAccess,
              facade: true,
              options: {
                values: ConvertArrayToOptionList(setting.options.values, {
                  empty: setting.options.empty,
                  sort: true,
                })
              },
              metadata: {
                setting: setting
              },
              patch: {
                duration: 500,
                field: ``,
                path: ``,
                callback: (core2: CoreConfig, event: PopBaseEventInterface) => {
                  if (IsValidFieldPatchEvent(core, event)) {
                    if (IsObject(scheme, true)) {
                      const session = this.getSchemeFieldSection(scheme, +field.id, 'setting');
                      if (IsObject(session)) {
                        session[setting.name] = event.config.control.value;
                        this._updateSchemeFieldMapping(scheme, 'field');
                      }
                    } else {
                      this.storeCustomSetting(core, event).then(() => {
                        PopLog.event(this.name, `Custom Setting Saved:`, event);
                      });
                    }

                  }
                }
              }
            }),
            hidden: 0,
            when: setting.when ? setting.when : null,
          },
          position: field.position,
          ancillary: true,
          sort: field.sort,
        };
        break;
      case 'trait':
        break;
      case 'fixed':
        break;
      default:
        component = <DynamicComponentInterface>{
          type: PopSwitchComponent,
          inputs: {
            core: core,
            config: new SwitchConfig({
              name: setting.name,
              label: setting.label ? setting.label : TitleCase(SnakeToPascal(setting.name)),
              helpText: setting.helpText ? setting.helpText : null,
              value: typeof setting.value !== 'undefined' ? <boolean>setting.value : <boolean>setting.defaultValue,
              facade: true,
              metadata: {
                setting: setting
              },
            }),
            hidden: 0,
            when: setting.when ? setting.when : null,
          },
          position: field.position,
          ancillary: true,
          sort: field.sort,
        };
    }

    return component;
  }


  /**
   * Store a custom setting
   * Determine whether the setting already exists in the database, post or patch accordingly
   * @param core
   * @param event
   */
  storeCustomSetting(core: CoreConfig, event: PopBaseEventInterface): Promise<boolean | string> {
    return new Promise<boolean | string>((resolve) => {
      // PopTemplate.buffer();
      PopLog.event(this.name, `storeCustomSetting`, event);
      const setting = event.config.metadata.setting;
      const body = <any>{
        value: event.config.control.value
      };
      if (+setting.field_id) body.field_id = +setting.field_id;
      if (+setting.field_item_id) body.field_item_id = +setting.field_item_id;
      const fieldId = +setting.field_id ? +setting.field_id : core.entity.id;
      let request = <Observable<any>>undefined;
      if (setting.id) {
        request = PopRequest.doPatch(`apps/fields/${fieldId}/configs/${setting.id}`, body, 1, false);
      } else {
        body.name = setting.name;
        body.type = setting.type;
        request = PopRequest.doPost(`apps/fields/${fieldId}/configs`, body, 1, false);
      }

      request.subscribe((res) => {
        if (res.data) res = res.data;
        if (IsObject(res, ['id'])) {

          event.config.metadata.setting = {...event.config.metadata.setting, ...CleanObject(res)};
          if (setting.item) {
            // ToDo:: Store a seting on to a field item
            // console.log('save on item', core.entity);
            // console.log('setting', res);

          } else {
            core.entity.custom_setting[setting.name].value = body.value;
            core.entity.setting[setting.name] = body.value;
            const nameLookup = ArrayMapSetter(core.entity.configs.field_configs, 'name');
            if (setting.name in nameLookup) {
              core.entity.configs.field_configs[nameLookup[setting.name]] = {...event.config.metadata.setting};
            } else {
              core.entity.configs.field_configs.push(event.config.metadata.setting);
            }
          }
          this.triggerFieldPreviewUpdate();
          return resolve(true);
        }
      }, (err) => {
        return resolve(GetHttpErrorMsg(err));
      });
      return resolve(true);
    });
  }


  /**
   * Store a custom setting
   * Determine whether the setting already exists in the database, post or patch accordingly
   * @param core
   * @param event
   */
  storeFieldItemRule(core: CoreConfig, fieldItem: FieldItemInterface, event: PopBaseEventInterface): Promise<boolean | string> {
    return new Promise<boolean | string>((resolve) => {
      let request = <Observable<any>>undefined;
      const rule = event.config.metadata.rule;
      const fieldItemId = fieldItem.id;
      const value = event.config.control.value;

      const body = <any>{
        value: value,
      };

      if (IsObject(rule.validationMap, true)) {
        rule.validation = rule.validationMap[String(value)];
      }
      if (rule.validation) {
        body.field_validation_id = rule.validation.id;
        if (rule.validation.fixed) {
          rule.value = rule.validation.value;
        }
      } else {
        rule.value = value;
        // pass
      }


      if (rule.field_id) { // patch
        request = PopRequest.doPatch(`fields/${fieldItemId}/rules/${rule.id}`, body, 1, false);
      } else {
        body.field_item_id = null;
        body.name = rule.name;
        request = PopRequest.doPost(`fields/${fieldItemId}/rules`, body, 1, false);
      }

      request.subscribe((res) => {
        res = GetHttpObjectResult(res);
        if (IsObject(res, ['value'])) {
          // event.config.metadata.rule = res;
          fieldItem.rule[rule.name] = value;
          this.triggerFieldPreviewUpdate();
          return resolve(true);
        }
        return resolve(true);
      }, (err) => {
        return resolve(GetHttpErrorMsg(err));
      });
    });
  }


  /**
   * Trigger the field prview component to update
   */
  triggerFieldPreviewUpdate() {
    if (IsObject(this.asset.core, ['channel'])) {
      this.dom.setTimeout('trigger-preview', () => {
        this.asset.core.channel.next({
          source: this.name,
          target: 'PopEntityFieldPreviewComponent',
          type: 'component',
          name: 'update'
        });
      }, 0);
    }
  }


  /**
   * Cleanup timeouts, intervals, subscriptions, etc
   */
  ngOnDestroy() {
    super.ngOnDestroy();
  }


  /************************************************************************************************
   *                                                                                              *
   *                                      Under The Hood                                          *
   *                                    ( Private Method )                                        *
   *                                                                                              *
   ************************************************************************************************/

  // private _updateSchemeFieldMapping( scheme: EntitySchemeSectionInterface, key: string ){
  //   if( IsObject( scheme, [ 'id', 'mapping' ] ) && IsString( key, true ) && key in scheme.mapping ){
  //     this.dom.setTimeout( `update-scheme-field-${key}`, () => {
  //       const body = { mapping: {} };
  //       // body.mapping[ key ] = scheme.mapping[ key ];
  //       body.mapping = scheme.mapping;
  //       this.dom.setSubscriber( `update-scheme-field-${key}`, PopRequest.doPatch( `profile-schemes/${scheme.id}`, body, 1, false ).subscribe( ( res ) => {
  //         res = GetHttpResult( res );
  //         console.log( '_updateSchemeFieldMapping', res );
  //       }, ( err ) => {
  //         PopLog.error( this.name, `_setFieldEntryValues`, GetHttpErrorMsg( err ) );
  //       } ) );
  //     }, 0 );
  //   }
  // }


  private _updateSchemeFieldMapping(scheme: EntitySchemeSectionInterface, key: string): Promise<boolean> {
    return new Promise<boolean>(async (resolve) => {
      if (IsObject(scheme, ['id', 'mapping']) && IsString(key, true) && key in scheme.mapping) {
        this.dom.setTimeout(`update-scheme-field-${key}`, () => {
          const body = {mapping: {}};
          // body.mapping[ key ] = scheme.mapping[ key ];
          body.mapping = scheme.mapping;
          this.dom.setSubscriber(`update-scheme-field-${key}`, PopRequest.doPatch(`profile-schemes/${scheme.id}`, body, 1, false).subscribe((res) => {
            res = GetHttpResult(res);
//             console.log( '_updateSchemeFieldMapping', res );
            return resolve(true);
          }, (err) => {
            PopLog.error(this.name, `_setFieldEntryValues`, GetHttpErrorMsg(err));
            return resolve(false);
          }));
        }, 0);
      } else {
        return resolve(false);
      }
    });
  }


  /**
   * Assign the custom setting values and config that exist for this field
   * @param field
   * @param stored
   */
  private _setFieldCustomSettings(field: FieldInterface, scheme?: EntitySchemeSectionInterface) {
    if (IsObject(field, ['fieldgroup', 'configs'])) {
      const stored = field.configs;
      const fieldSettings = GetCustomFieldSettings(field);

      const customSettings = JSON.parse(JSON.stringify({...EntityFieldSetting, ...fieldSettings}));

      // console.log( 'customSettings', customSettings );
      // console.log('stored', stored);

      if (IsObject(customSettings, true)) {
        const itemIdLookup = ArrayMapSetter(<any[]>field.items, 'id');
        const itemNameLookup = ArrayMapSetter(<any[]>field.items, 'name');
        // console.log('itemNameLookup', itemNameLookup);

        Object.keys(customSettings).map((settingName: string) => {
          const setting = customSettings[settingName];
          if (IsObject(setting, true)) {
            if (setting.item) {

              if (setting.item in itemNameLookup) {
                // console.log('setting', setting);
                const item = field.items[itemNameLookup[setting.item]];

                if (!item.custom_setting) item.custom_setting = {};
                if (!item.setting) item.setting = {};
                setting.field_item_id = item.field_item_id;
                setting.field_id = item.id;
                // console.log('item', item);
                const value = setting.value ? setting.value : setting.defaultValue;
                item.custom_setting[settingName] = setting;
                item.setting[settingName] = value;
              }

            } else {
              if (!field.custom_setting) field.custom_setting = {};
              if (!field.setting) field.setting = {};
              if (!field.trait) field.trait = {};
              let value;
              if (IsObject(scheme, true)) {
                const storage = this.getSchemeFieldSection(scheme, +field.id, 'setting');
                if (IsObject(storage, true) && setting.name in storage) {
                  value = storage[setting.name];
                } else {
                  value = setting.value ? setting.value : setting.defaultValue;
                }
              } else {
                value = setting.value ? setting.value : setting.defaultValue;
              }

              if (setting.type === 'trait') {
                field.trait[settingName] = value;
              } else {
                field.custom_setting[settingName] = setting;
                field.setting[settingName] = value;
              }

            }
          }
        });


        if (IsArray(stored.field_configs, true)) {
          stored.field_configs.map((setting) => {
            if (!field.custom_setting[setting.name]) {
              // ToDo:: Do We want to allow the database to pass in configs that are not local
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
                if (setting.field_id in itemIdLookup) {
                  const item = field.items[itemIdLookup[setting.field_id]];

                  if (!item.custom_setting) item.custom_setting = {};
                  if (!item.custom_setting[setting.name]) {
                    item.custom_setting[setting.name] = setting;
                  } else {
                    item.custom_setting[setting.name].id = setting.id;
                    item.custom_setting[setting.name].value = setting.value;
                  }
                  if (!item.setting) item.setting = {};
                  item.setting[setting.name] = setting.value;
                }
              });
            }
          });

        }
      }
      // console.log('stored custom setings', field, stored);
      // delete field.configs;
    }
  }


  /**
   * Ensure that at least 1 label exists
   * @param field
   */
  private _setFieldEntryValues(core: CoreConfig, scheme?: EntitySchemeSectionInterface): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const field = <FieldInterface>core.entity;
      if (IsArray(field.entries, true)) {
        field.entries.sort(DynamicSort('sort_order'));
      }
      if (!(IsArray(field.entries, true))) {
        const entry = {
          name: TitleCase(`${(field.name ? field.name : field.fieldgroup.name)}`),
          type: 'provided',
          sort_order: 0,
        };
        PopRequest.doPost(`fields/${field.id}/entries`, entry, 1, false).subscribe((res) => {
          res = res.data ? res.data : res;
          field.entries = [res];
          return resolve(true);
        }, (err) => {
          PopLog.error(this.name, `_setFieldEntryValues`, GetHttpErrorMsg(err));
          return resolve(false);
        });
      } else {
        return resolve(true);
      }
    });
  }
}
