import {Injectable} from '@angular/core';
import {
  CoreConfig,
  Dictionary, DynamicComponentInterface,
  FieldConfig, FieldEntry,
  FieldInterface,
  FieldItemInterface,
  FieldItemModelInterface,
  PopEntity, PopLog, PopPipe, PopRequest, ServiceInjector,
} from '../../../pop-common.model';

import {PopDomService} from '../../../services/pop-dom.service';
import {PopEntityFieldComponent} from '../pop-entity-field/pop-entity-field.component';
import {PopSideBySideComponent} from '../../base/pop-side-by-side/pop-side-by-side.component';
import {PopSelectComponent} from '../../base/pop-field-item/pop-select/pop-select.component';
import {PopSelectMultiComponent} from '../../base/pop-field-item/pop-select-multi/pop-select-multi.component';
import {PopInputComponent} from '../../base/pop-field-item/pop-input/pop-input.component';
import {PopDateComponent} from '../../base/pop-field-item/pop-date/pop-date.component';
import {PopTimeComponent} from '../../base/pop-field-item/pop-time/pop-time.component';
import {PopCheckboxComponent} from '../../base/pop-field-item/pop-checkbox/pop-checkbox.component';
import {PopSwitchComponent} from '../../base/pop-field-item/pop-switch/pop-switch.component';
import {PopRadioComponent} from '../../base/pop-field-item/pop-radio/pop-radio.component';
import {PopTextareaComponent} from '../../base/pop-field-item/pop-textarea/pop-textarea.component';
import {PopLabelComponent} from '../../base/pop-field-item/pop-label/pop-label.component';
import {PopButtonComponent} from '../../base/pop-field-item/pop-button/pop-button.component';
import {PopEntityNameComponent} from '../pop-entity-field/pop-entity-name/pop-entity-name.component';
import {PopEntityDatetimeComponent} from '../pop-entity-field/pop-entity-datetime/pop-entity-datetime.component';
import {PopEntityEmailComponent} from '../pop-entity-field/pop-entity-email/pop-entity-email.component';
import {PopEntityPhoneComponent} from '../pop-entity-field/pop-entity-phone/pop-entity-phone.component';
import {PopEntityAddressComponent} from '../pop-entity-field/pop-entity-address/pop-entity-address.component';
import {PopEntityInputComponent} from '../pop-entity-field/pop-entity-input/pop-entity-input.component';
import {PopEntitySelectComponent} from '../pop-entity-field/pop-entity-select/pop-entity-select.component';
import {PopEntityRadioComponent} from '../pop-entity-field/pop-entity-radio/pop-entity-radio.component';
import {PopEntityCheckboxComponent} from '../pop-entity-field/pop-entity-checkbox/pop-entity-checkbox.component';
import {
  EvaluateWhenConditions, FieldItemModel,
  FieldItemModelConfig, FieldItemView, GetCustomFieldSettings, ParseModelValue,
} from '../pop-entity-utility';

import {
  ArrayKeyBy,
  ArrayMapSetter, CleanObject, ConvertArrayToOptionList, DeepCopy,
  DynamicSort, GetHttpResult,
  IsArray, IsDefined,
  IsObject,
  IsString, JsonCopy, SpaceToSnake, StorageGetter,
  TitleCase
} from '../../../pop-common-utility';
import {PopMinMaxComponent} from '../../base/pop-field-item/pop-min-max/pop-min-max.component';
import {PopNumberComponent} from '../../base/pop-field-item/pop-number/pop-number.component';
import {PopCacheService} from '../../../services/pop-cache.service';
import {forkJoin} from 'rxjs';
import {ComponentType} from '@angular/cdk/portal';
import {PopEntitySwitchComponent} from '../pop-entity-field/pop-entity-switch/pop-entity-switch.component';
import {PopEntitySelectMultiComponent} from '../pop-entity-field/pop-entity-select-multi/pop-entity-select-multi.component';
import {PopEntityTextareaComponent} from '../pop-entity-field/pop-entity-textarea/pop-entity-textarea.component';
import {PopSelectFilterComponent} from '../../base/pop-field-item/pop-select-filter/pop-select-filter.component';
import {PopTextComponent} from '../../base/pop-field-item/pop-text/pop-text.component';
import {EntitySchemeSectionInterface} from '../pop-entity-scheme/pop-entity-scheme.model';
import {PopFieldEditorService} from '../pop-entity-field-editor/pop-entity-field-editor.service';
import {PopSelectListComponent} from '../../base/pop-field-item/pop-select-list/pop-select-list.component';
import {PopDatePickerComponent} from '../../base/pop-field-item/pop-datepicker/pop-datepicker.component';
import {PopSelectModalComponent} from "../../base/pop-field-item/pop-select-modal/pop-select-modal.component";


@Injectable({
  providedIn: 'root'
})
export class PopEntityUtilFieldService {

  private name = 'PopEntityUtilFieldService';

  private cache = new PopCacheService();


  constructor(private field: PopFieldEditorService) {
  }


  /**
   * Build out the necessary configs for a custom field group and all of this field items involved
   * Fields may have multiple values , so a unique set of configs mut be created for each data entry
   * @param core
   * @param field
   */
  buildCustomField(core: CoreConfig, field: FieldInterface) {
    let items;
    if (!field.metadata) field.metadata = {};
    if (!field.multiple_min) field.multiple_min = 1;
    if (!field.multiple_max || field.multiple_max > 10) field.multiple_max = 10;
    if (!field.multiple_max_limit) field.multiple_max_limit = 10;


    const scheme = StorageGetter(core, ['entity', 'scheme']);
    const useScheme = IsObject(scheme, ['id', 'mapping']) ? true : false;

    field.primary = useScheme ? this.field.isSchemePrimaryField(scheme, field) : false;

    const fieldCustomSettings = GetCustomFieldSettings(field);
    const itemCustomModels = {};
    if (IsObject(fieldCustomSettings, true)) {
      Object.keys(fieldCustomSettings).map((key: string) => {
        const setting = fieldCustomSettings[key];
        if (IsObject(setting, ['item', 'model']) && setting.item && setting.type === 'model') {
          if (!itemCustomModels[setting.item]) itemCustomModels[setting.item] = {};
          itemCustomModels[setting.item][setting.model] = setting.value;
        }
      });
    }

    // console.log( itemCustomModels, 'itemCustomModels' );

    field.children = {};
    // make a copy of the field items to use as a pattern
    let fieldItemSet = JsonCopy(field.items);
    fieldItemSet = fieldItemSet.filter((fieldItem: FieldItemInterface) => {
      return +fieldItem.active;
    }).filter((fieldItem: FieldItemInterface) => {
      return useScheme ? !(this.field.isSchemeFieldItemDisabled(scheme, +field.id, +fieldItem.id)) : true;
    }).map((fieldItem: FieldItemInterface) => {
      const itemCustomModel = IsObject(itemCustomModels[fieldItem.name]) ? itemCustomModels[fieldItem.name] : {};
      fieldItem = JsonCopy({...fieldItem, ...itemCustomModel});
      fieldItem = CleanObject(fieldItem, {
        blacklist: ['children', 'entries', 'items', 'storage', 'webhook', 'object_name', 'depth_level']
      });

      // fieldItem.model.value = item.model.options.defaultValue || null;
      // ToDo:: Inject scheme rule values
      this.setFieldItemRules(+field.id, fieldItem, scheme);

      // console.log('fieldItem', fieldItem);


      const model = FieldItemModel(core, fieldItem);



      if (IsArray(fieldItem.source, true) && !IsArray(model.options.values, true)) {
        model.options.rawValues = fieldItem.source;
        model.options.values = fieldItem.source;
      }

      // if (IsArray(fieldItem.source)) {
      //   console.log('fielditem source', fieldItem);
      //   console.log('options', model.options);
      // }

      const view = FieldItemView(fieldItem.view);
      const item = CleanObject({
        id: fieldItem.id,
        custom_setting: {},
        model: model,
        table: fieldItem.table ? fieldItem.table : {sort: 99, visible: false},
        view: view,
        component: view.name,
        setting: this._getFieldItemSetting(fieldItem),
        rules: fieldItem.rules,
        rule: fieldItem.rule,
        source: IsArray(fieldItem.source, true) ? fieldItem.source : null,
        sourceMap: IsArray(fieldItem.source, true) ? ArrayMapSetter(fieldItem.source, 'id') : null
      });

      field.children[fieldItem.name] = item;
      return item;
    });

    const dataSort = {};
    if (IsArray(field.entries, true)) {
      field.entries.sort(DynamicSort('sort_order'));
      field.entries.map((entry: FieldEntry, index) => {
        dataSort[entry.id] = index;
      });

    }


    field.items = <any>{};
    items = {};
    field.data = IsObject(field.data, true) ? field.data : {};
    if (useScheme) {
      Object.keys(field.data).map((dataKey) => {
        if (this.field.isSchemeFieldEntryDisabled(scheme, +field.id, +dataKey)) {
          delete field.data[dataKey];
        }
      });
    }

    // get id of keys from field entries
    // console.log(field.entries);
    if (field.multiple) {
      const dataKeys = field.entries.map(i => i.id);
      field.data_keys = dataKeys.sort(function (a, b) {
        const varA = +dataSort[a];
        const varB = +dataSort[b];
        if (varA > varB) {
          return 1;
        } else if (varA < varB) {
          return -1;
        }
        return 0;
      });
    } else {
      field.data_keys = IsArray(field.entries, true) ? [field.entries[0].id]: [];
    }


    const entryLookup = ArrayMapSetter(field.entries, 'id');
    field.data_keys.map((dataKey, index) => {
      items[dataKey] = {
        entry: dataKey in entryLookup ? field.entries[entryLookup[dataKey]] : this._getFieldItemEntry(field, dataKey, index),
        config: {}
      };
      fieldItemSet.map((fieldItem) => {
        // ToDo:: Determine whether patch should always be created; A.C.
        if (IsObject(fieldItem.model, ['name'])) {
          fieldItem.model.value = this._getModelValue(core, field, fieldItem.model, dataKey);
          fieldItem.model.facade = 1;
          const config = FieldItemModelConfig(core, fieldItem.model);
          items[dataKey].config[fieldItem.model.name] = config;
        } else {
          // console.log('fail', fieldItem);
        }
      });
    });
    const coreField = <any>{
      id: +field.id,
      ancillary: field.ancillary ? 1 : 0,
      canAdd: field.canAdd,
      canRemove: field.canRemove,
      configs: field.configs || {},
      custom_setting: field.custom_setting || {},
      metadata: field.metadata,
      multiple: !!field.multiple,
      multiple_min: field.multiple_min,
      multiple_max: field.multiple_max,
      multiple_max_limit: field.multiple_max_limit ? field.multiple_max_limit : 10,
      data: field.data,
      data_keys: field.data_keys,
      facade: !!field.facade,
      fieldgroup: field.fieldgroup,
      entries: IsArray(field.entries) ? field.entries : [],
      hidden: field.hidden ? true : false,
      internal_name: field.fieldgroup.name,
      name: String(SpaceToSnake(field.name)).toLowerCase(),
      label: field.label,
      position: field.position,
      setting: field.setting || {},
      show_name: !!field.show_name,
      sort: field.sort,
      state: field.state ? field.state : 'template_edit',
      when: field.when ? field.when : null,
      children: field.children,
      items: items,
    };

    const formName = field.fieldgroup.name === 'selection' ? field.children.value.view.name : field.fieldgroup.name ? field.fieldgroup.name : 'select';

    coreField.component = this._getEntityFieldComponent(formName);

    return new FieldConfig(coreField);
  }


  private _setSchemeFieldSettings(scheme: EntitySchemeSectionInterface, field: FieldInterface) {
    if (IsObject(scheme, ['id', 'mapping']) && IsObject(field, true)) {
      // console.log( '_setSchemeFieldSettings', scheme, field );
    }
    return field;
  }


  /**
   * Build out a config for a field item
   * @param core
   * @param model
   */
  buildCoreFieldItem(core: CoreConfig, model: FieldItemModelInterface): { model: FieldItemModelInterface, component: ComponentType<any>, config: any } {
    return {
      model: model,
      component: this._getFormComponent(model.form),
      config: FieldItemModelConfig(core, model)
    };
  }


  /**
   * Get the rules that should be applied on this field
   * @param fieldItem
   * @private
   */
  setFieldItemRules(fieldId: number, fieldItem: any, scheme?: EntitySchemeSectionInterface): void {
    const RuleSet = {};
    fieldItem.rule = {};
    const itemRules = IsArray(fieldItem.itemrules, true) ? fieldItem.itemrules : []; // default rules inherited from the field_item_id
    // const mapping = this.field.getSchemeFieldItemMapping(scheme, fieldId, +fieldItem.id);
    // console.log('mapping', mapping);
    const fieldRules = IsArray(fieldItem.fieldrules, true) ? fieldItem.fieldrules : []; // rules specific to this field item
    const schemeRules = IsObject(scheme, ['id', 'mapping']) ? this.field.getSchemeFieldItemSection(scheme, fieldId, +fieldItem.id, 'rule') : {};
    // we want field rules to override items rules when there is overlap ie.. the item might come with a default rule but the items rules should override it
    itemRules.map((rule) => {
      if (IsArray(rule.validations, true)) {
        if (!(IsObject(rule.options))) rule.options = {};
        rule.options.values = ConvertArrayToOptionList(rule.validations, {
          nameKey: 'label',
        });
        rule.validationMap = ArrayKeyBy(rule.validations, 'id');
        rule.value = +rule.validation.id;
      } else {
        rule.value = rule.raw_value;
      }
      if (!rule.value && rule.default_value) rule.value = rule.default_value;
      RuleSet[rule.name] = rule;
    });

    fieldRules.map((rule) => {
      if (IsObject(RuleSet[rule.name])) {
        RuleSet[rule.name].id = rule.id;
        RuleSet[rule.name].value = IsArray(RuleSet[rule.name].validations, true) ? rule.validation.id : rule.raw_value;
        RuleSet[rule.name].field_id = rule.field_id;
      }
    });

    fieldItem.rules = Object.values(RuleSet);
    fieldItem.rules.map((rule: any) => {
      if (!rule.validation.fixed) {
        fieldItem.rule[rule.name] = ParseModelValue(rule.value);
        if (IsObject(schemeRules, [rule.name])) {
          fieldItem.rule[rule.name] = schemeRules[rule.name];
        }
      }
    });

    // delete fieldItem.fieldrules;
    // delete fieldItem.itemrules;
  }


  /**
   * A method that builds entity fieldset from the server models
   * @param entityConfig
   * @param fieldPosition
   */
  buildDomFields(core: CoreConfig, dom: PopDomService): Promise<boolean> { // a field is wrapper around field items
    return new Promise(async (resolve) => {
      let coreField, component;
      // dom.ui.fields.clear();
      const baseFields = core.repo.model.field;
      const baseList = Object.values(baseFields).sort(DynamicSort('sort'));
      const customFields = <Dictionary<FieldInterface>>await this._getEntityCustomFields(core);
      PopLog.info(this.name, `buildDomFields`, {
        base: baseFields,
        custom: customFields
      });
      const customList = Object.values(customFields).sort((function (a, b) {
        if (a.fieldgroup.id === b.fieldgroup.id) {
          return b.label < a.label ? 1 : -1;
        }
        return a.fieldgroup.id > b.fieldgroup.id ? 1 : -1;
      }));
      // Place base field inf front of base fields, and then put custom fields (sorted by type,name)
      const allFields = [...baseList, ...customList].map((field, index) => {
        field.sort = index;
        // return JSON.parse( JSON.stringify( field ) );
        return DeepCopy(field);
      });

      if (IsArray(allFields, true)) {
        allFields.map((field: any) => {

          const name = field.model ? field.model.name : field.name;
          // console.log(name, field.onLoad);
          if (+core.entity.scheme_id && !(IsObject(core.entity.scheme_assets))) core.entity.scheme_assets = {};
          const customFieldAssetLocation = +core.entity.scheme_id && IsObject(core.entity.scheme_assets, false) ? core.entity.scheme_assets : core.entity;
          if (IsObject(field, true) && name) {
            if (field.when) {
              if (IsString(field.when)) field.when = [field.when];
              field.hidden = !EvaluateWhenConditions(core, field.when, core);
            }
            if (IsObject(field, ['fieldgroup']) && name in customFieldAssetLocation) {
              coreField = this.buildCustomField(core, field);
              if (coreField) {
                component = <DynamicComponentInterface>{
                  type: PopEntityFieldComponent,
                  inputs: <Dictionary<number | string | boolean | object | any[]>>CleanObject({
                    core: core,
                    field: new FieldConfig(coreField),
                    hidden: field.hidden ? 1 : 0,
                    when: field.when,
                    onLoad: field.onLoad,
                    onEvent: field.onEvent,
                    onUnload: field.onUnload,
                  }),
                  custom: true,
                  position: field.position ? field.position : 1,
                  ancillary: field.ancillary,
                  sort: field.sort,
                };
                dom.ui.fields.set(+field.id, component);
              }
              // }else if( IsObject( field, [ 'model' ] ) && name in core.entity ){
            } else if (IsObject(field, ['model']) && ((name in core.entity) || field.preserve)) {
              field.model.view = {name: field.model.form};
              if (field.model.transformation) field.model.value = this._getModelValue(core, field, field.model);
              const model = FieldItemModel(core, field.model);

              const coreItem = {
                model: model,
                table: IsObject(field.table, true) ? field.table : {sort: 99, visible: false},
                component: this._getFormComponent(field.model.view.name),
                config: FieldItemModelConfig(core, model)
              };

              if (coreItem && coreItem.config) {
                if (typeof coreItem.config.setControl === 'function') coreItem.config.setControl(); // build the control now so that the control can be the defacto session value
                component = <DynamicComponentInterface>{
                  type: coreItem.component,
                  inputs: <Dictionary<number | string | boolean | object | any[]>>CleanObject({
                    core: core,
                    config: coreItem.config,
                    hidden: field.hidden ? 1 : 0,
                    when: field.when,
                    onLoad: field.onLoad,
                    onEvent: field.onEvent,
                    onUnload: field.onUnload,
                  }),
                  custom: false,
                  position: field.position ? field.position : 1,
                  ancillary: field.ancillary ? true : false,
                  when: IsArray(field.when, true) ? field.when : null,
                  sort: field.sort ? field.sort : 99,
                };
                dom.ui.fields.set(coreItem.model.name, component);
              }
            }
          }
        });
      }
      return resolve(true);
    });
  }


  /**
   * A method that builds entity fieldset from the server models
   * @param entityConfig
   * @param fieldPosition
   */
  getDomFields(fieldPosition: number = 1, dom: PopDomService) { // a field is wrapper around field items
    const componentList = [];
    dom.ui.fields.forEach((component: DynamicComponentInterface, key: number | string) => {
      if (!component.ancillary && component.position === fieldPosition) {
        componentList.push(component);
      }
    });
    return componentList;
  }


  /************************************************************************************************
   *                                                                                              *
   *                                      Under The Hood                                          *
   *                                    ( Private Method )                                        *
   *                                                                                              *
   ************************************************************************************************/

  /**
   * Loop through the data for the entity and identify what refers to custom fields
   * Retrieve the field data for each of the custom fields that exist
   * @param core
   * @private
   */
  private _getEntityCustomFields(core: CoreConfig): Promise<Dictionary<FieldInterface>> {
    return new Promise<Dictionary<FieldInterface>>(async (resolve) => {
      const tmp = {};
      const customFields = <Dictionary<FieldInterface>>{};

      if (core && core.params.can_extend) {

        if (IsObject(core.entity)) {
          Object.keys(core.entity).map((key: string) => {
            if (IsObject(core.entity[key], ['@metadata'])) {
              tmp[key] = core.entity[key];
            } else if (IsArray(core.entity[key], true) && IsObject(core.entity[key][0], ['@metadata'])) {
              tmp[key] = core.entity[key];
            }
          });
        }
        if (+core.entity.scheme_id && IsObject(core.entity.scheme_assets, true)) {
          Object.keys(core.entity.scheme_assets).map((key: string) => {
            if (IsObject(core.entity.scheme_assets[key], ['@metadata'])) {
              tmp[key] = core.entity.scheme_assets[key];
            } else if (IsArray(core.entity.scheme_assets[key], true) && IsObject(core.entity.scheme_assets[key][0], ['@metadata'])) {
              tmp[key] = core.entity.scheme_assets[key];
            }
          });
        }
        const requests = [];
        const names = [];
        let fieldId;
        const fieldRepo = await PopEntity.getEntityRepo('field');
        Object.keys(tmp).map((name) => {
          if (IsObject(tmp[name])) { // field only has a single value

            if (IsObject(tmp[name]['@metadata'], ['@field_id'])) {
              const record = tmp[name];
              const metadata = record['@metadata'];
              // delete record[ '@metadata' ];
              fieldId = metadata['@field_id'];
              tmp[name] = [record];
            }
          } else if (IsArray(tmp[name], true)) { // field has multiple values
            const data = [];
            const firstRecord = tmp[name][0];
            fieldId = firstRecord['@metadata']['@field_id'];
            // tmp[ name ].map((record, index) => {
            //   // const dataKey = field_entry_id ? field_entry_id : ( metadata2[ '@record_id' ] ? +metadata2[ '@record_id' ] : index );
            //   delete record[ '@metadata' ];
            //   data.push(record);
            // });
            //
            // tmp[ name ] = data;
          }
          if (+fieldId) {
            names.push(name);
            requests.push(this.cache.get('custom_field', String(fieldId), fieldRepo.getEntity(fieldId)));
          }
        });
        if (requests.length) {
          forkJoin(requests).subscribe((results) => {
            results.map(async (result: any, index: number) => {
              if (IsDefined(result, false)) {
                result = GetHttpResult(result);
                const fieldName = names[index];
                result.name = fieldName;
                result.data = fieldName in tmp ? tmp[fieldName] : {};
                const customField = await this._setFieldEntries(result);
                const field = await this._setEntityCustomFieldDataStructure(customField);
                customFields[fieldName] = field;
                if (index === (results.length - 1)) {
                  return resolve(customFields);
                }
              } else {
                if (index === (results.length - 1)) {
                  return resolve(customFields);
                }
              }
            });
          }, (err) => {
            return resolve(customFields);
          });
        } else {
          return resolve(customFields);
        }
      } else {
        return resolve(customFields);
      }
    });
  }


  clearCustomFieldCache(fieldId: number): void {
    this.cache.clear('custom_field', String(fieldId));
  }


  /**
   * Field Entries are a way to define the value structure of a field
   * By default a field will have a single value, but a field can be configured to have multiple values
   * Field entries provide a template of a specific amount of values a field should have
   * @param field
   * @private
   */
  private _setFieldEntries(field: FieldInterface): Promise<FieldInterface> {
    return new Promise<FieldInterface>(async (resolve) => {
      // if( IsObject( field, [ 'data' ] ) && IsArray( field.data ) ){
      //   // console.log('field', field);
      //   let values = field.data.length;
      //   const entries = field.entries.filter( ( x ) => x.type !== 'custom' ).length;
      //   let entriesNeeded = 0;
      //   if( entries < values ){
      //     entriesNeeded = +values - +entries;
      //   }
      //
      //   const requests = [];
      //   let limit = 100;
      //   while( entriesNeeded > 0 && limit ){
      //     limit--;
      //     values++;
      //     requests.push( PopRequest.doPost( `fields/${field.id}/entries`, {
      //       name: TitleCase( `${field.fieldgroup.name} ${values}` ),
      //       type: 'provided'
      //     }, 1, false ) );
      //     entriesNeeded--;
      //   }
      //   if( requests.length ){
      //     forkJoin( requests ).subscribe( ( results ) => {
      //       results.map( ( result: any, index: number ) => {
      //         if( result.data ) result = result.data;
      //         field.entries.push( result );
      //       } );
      //       return resolve( field );
      //     }, () => {
      //       return resolve( field );
      //     } );
      //
      //   }else{
      //     return resolve( field );
      //   }
      // }else{
      //   return resolve( field );
      // }

      return resolve(field);

    });
  }


  /**
   * Field data should come in as an array of records
   * Ensure that each each record has a unique entry id, and index data by field_entry_id;
   * @param customField
   */
  private _setEntityCustomFieldDataStructure(customField: FieldInterface): Promise<FieldInterface> {
    return new Promise<FieldInterface>((resolve) => {
      const data = {};
      // console.log('customField', customField);
      if (IsArray(customField.data, true)) {
        if (IsArray(customField.entries, true)) {
          customField.data.map((record, index) => {
            if (!record.field_entry_id) record.field_entry_id = customField.entries[index].id;
            // console.log("is diff ? ", record.field_entry_id , ' - ', customField.entries[index].id);
            // delete record[ '@metadata' ];
            data[record.field_entry_id] = record;
          });
        }

      } else {
        if (IsArray(customField.entries)) {
          customField.entries.map((entry: FieldEntry) => {
            data[entry.id] = {};
            const items = <any>customField.items;
            if (IsArray(customField.items, true)) {
              items.map((item) => {
                data[entry.id][item.name] = null;
              });
            }
          });
        }
      }
      customField.data = data;

      return resolve(customField);
    });
  }


  /**
   * Get the settings that should be applied on this field item
   * @param fieldItem
   * @private
   */
  private _getFieldItemSetting(fieldItem: any) {
    return {};
  }


  /**
   * A field entry is used to identity a specific value in a set of multiple values
   * @param field
   * @param dataKey
   * @param index
   * @private
   */
  private _getFieldItemEntry(field: FieldInterface, dataKey: number, index: number): FieldEntry {
    let entry = <FieldEntry>{};
    const data = field.data[dataKey];

    if (IsArray(field.entries, true)) {
      const customEntries = field.entries.filter((item) => {
        return item.type !== 'custom';
      });
      const customIdLookup = ArrayMapSetter(customEntries, 'id');

      const providedEntries = field.entries.filter((item) => {
        return item.type !== 'custom';
      });

      const entryIndex = index % providedEntries.length;
      const providedIdLookup = ArrayMapSetter(providedEntries, 'id');
      if (data.field_entry_id && data.field_entry_id in providedIdLookup) {
        entry = providedEntries[providedIdLookup[data.field_entry_id]];
      } else if (data.field_entry_id && data.field_entry_id in customIdLookup) {
        entry = customEntries[customIdLookup[data.field_entry_id]];
        // ToDo:: Find the cutstom label that should be inserted here
      } else if (entryIndex in field.entries) {
        entry = providedEntries[entryIndex];
      } else {
        entry = providedEntries[0];
      }
    } else {
      entry = null;
    }
    return entry;
  }


  /**
   * Map the form in a field model to the angular component that will be used to render the field
   * @param form
   * @private
   */
  private _getFormComponent(form: string) {
    let component = null;
    if (IsString(form, true)) {
      switch (String(form).toLowerCase()) {
        case 'sidebyside':
          component = PopSideBySideComponent;
          break;
        case 'select':
          component = PopSelectComponent;
          break;
        case 'select-filter':
          component = PopSelectFilterComponent;
          break;
        case 'select-list':
          component = PopSelectListComponent;
          break;
        case 'select-multi':
        case 'select_multi':
          component = PopSelectMultiComponent;
          break;
        case 'select-modal':
          component = PopSelectModalComponent;
          break;
        case 'text':
        case 'input':
          component = PopInputComponent;
          break;
        case 'textstring':
          component = PopTextComponent;
          break;
        case 'number':
          component = PopNumberComponent;
          break;
        case 'date':
          component = PopDateComponent;
          break;
        case 'datepicker':
          component = PopDatePickerComponent;
          break;
        case 'time':
          component = PopTimeComponent;
          break;
        case 'checkbox':
          component = PopCheckboxComponent;
          break;
        case 'switch':
          component = PopSwitchComponent;
          break;
        case 'minmax':
          component = PopMinMaxComponent;
          break;
        case 'radio':
          component = PopRadioComponent;
          break;
        case 'textarea':
          component = PopTextareaComponent;
          break;
        case 'label':
          component = PopLabelComponent;
          break;
        case 'button':
          component = PopButtonComponent;
          break;
        default:
          PopLog.warn(this.name, `_getFormComponent: fail`, form);
          break;
      }
    }
    return component;
  }


  /**
   * Resolve the value that lines up with the column/name of the field item from the data set
   * The idea here is that a value may have already created for this field item and we need to make sure the field item initializes with the value
   * @param core
   * @param field
   * @param model
   * @param dataKey
   * @private
   */
  private _getModelValue(core: CoreConfig, field: FieldInterface, model: FieldItemModelInterface, dataKey?: number) {
    let value = null;
    if (dataKey) {
      if (IsObject(field.data, true) && IsObject(model, true)) {
        if (dataKey in field.data && model.name in field.data[dataKey]) {
          value = field.data[dataKey][model.name];
          if (model.transformation) value = PopPipe.transform(value, model.transformation, core);
        }
      }
    } else if (model.name in core.entity) {
      value = core.entity[model.name];

      if (model.transformation) value = PopPipe.transform(value, model.transformation, core);
    }
    return value;
  }


  /**
   * Get the custom field template that is made for the field group
   * @param name
   * @private
   */
  private _getEntityFieldComponent(name: string) {
    let component = null;
    switch (String(name).toLowerCase()) {
      case 'name':
        component = PopEntityNameComponent;
        break;
      case 'email':
        component = PopEntityEmailComponent;
        break;
      case 'phone':
        component = PopEntityPhoneComponent;
        break;
      case 'address':
        component = PopEntityAddressComponent;
        break;
      case 'date':
      case 'datetime':
        component = PopEntityDatetimeComponent;
        break;
      case 'textfield':
      case 'input':
        component = PopEntityInputComponent;
        break;
      case 'selection':
      case 'select':
        component = PopEntitySelectComponent;
        break;
      case 'select-multi':
      case 'select_multi':
      case 'multi_selection':
        component = PopEntitySelectMultiComponent;
        break;
      case 'radio':
        component = PopEntityRadioComponent;
        break;
      case 'checkbox':
        component = PopEntityCheckboxComponent;
        break;
      case 'toggle':
      case 'switch':
        component = PopEntitySwitchComponent;
        break;
      case 'texteditor':
      case 'textarea':
        component = PopEntityTextareaComponent;
        break;
      default: {
        PopLog.warn(this.name, `_getEntityFieldComponent: fail`, name);
        break;
      }
    }
    return component;
  }

}
