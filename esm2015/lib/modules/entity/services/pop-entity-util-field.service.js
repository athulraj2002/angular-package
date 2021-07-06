import { __awaiter } from "tslib";
import { Injectable } from '@angular/core';
import { FieldConfig, PopEntity, PopLog, PopPipe, } from '../../../pop-common.model';
import { PopEntityFieldComponent } from '../pop-entity-field/pop-entity-field.component';
import { PopSideBySideComponent } from '../../base/pop-side-by-side/pop-side-by-side.component';
import { PopSelectComponent } from '../../base/pop-field-item/pop-select/pop-select.component';
import { PopSelectMultiComponent } from '../../base/pop-field-item/pop-select-multi/pop-select-multi.component';
import { PopInputComponent } from '../../base/pop-field-item/pop-input/pop-input.component';
import { PopDateComponent } from '../../base/pop-field-item/pop-date/pop-date.component';
import { PopTimeComponent } from '../../base/pop-field-item/pop-time/pop-time.component';
import { PopCheckboxComponent } from '../../base/pop-field-item/pop-checkbox/pop-checkbox.component';
import { PopSwitchComponent } from '../../base/pop-field-item/pop-switch/pop-switch.component';
import { PopRadioComponent } from '../../base/pop-field-item/pop-radio/pop-radio.component';
import { PopTextareaComponent } from '../../base/pop-field-item/pop-textarea/pop-textarea.component';
import { PopLabelComponent } from '../../base/pop-field-item/pop-label/pop-label.component';
import { PopButtonComponent } from '../../base/pop-field-item/pop-button/pop-button.component';
import { PopEntityNameComponent } from '../pop-entity-field/pop-entity-name/pop-entity-name.component';
import { PopEntityDatetimeComponent } from '../pop-entity-field/pop-entity-datetime/pop-entity-datetime.component';
import { PopEntityEmailComponent } from '../pop-entity-field/pop-entity-email/pop-entity-email.component';
import { PopEntityPhoneComponent } from '../pop-entity-field/pop-entity-phone/pop-entity-phone.component';
import { PopEntityAddressComponent } from '../pop-entity-field/pop-entity-address/pop-entity-address.component';
import { PopEntityInputComponent } from '../pop-entity-field/pop-entity-input/pop-entity-input.component';
import { PopEntitySelectComponent } from '../pop-entity-field/pop-entity-select/pop-entity-select.component';
import { PopEntityRadioComponent } from '../pop-entity-field/pop-entity-radio/pop-entity-radio.component';
import { PopEntityCheckboxComponent } from '../pop-entity-field/pop-entity-checkbox/pop-entity-checkbox.component';
import { EvaluateWhenConditions, FieldItemModel, FieldItemModelConfig, FieldItemView, GetCustomFieldSettings, ParseModelValue, } from '../pop-entity-utility';
import { ArrayKeyBy, ArrayMapSetter, CleanObject, ConvertArrayToOptionList, DeepCopy, DynamicSort, GetHttpResult, IsArray, IsDefined, IsObject, IsString, JsonCopy, SpaceToSnake, StorageGetter } from '../../../pop-common-utility';
import { PopMinMaxComponent } from '../../base/pop-field-item/pop-min-max/pop-min-max.component';
import { PopNumberComponent } from '../../base/pop-field-item/pop-number/pop-number.component';
import { PopCacheService } from '../../../services/pop-cache.service';
import { forkJoin } from 'rxjs';
import { PopEntitySwitchComponent } from '../pop-entity-field/pop-entity-switch/pop-entity-switch.component';
import { PopEntitySelectMultiComponent } from '../pop-entity-field/pop-entity-select-multi/pop-entity-select-multi.component';
import { PopEntityTextareaComponent } from '../pop-entity-field/pop-entity-textarea/pop-entity-textarea.component';
import { PopSelectFilterComponent } from '../../base/pop-field-item/pop-select-filter/pop-select-filter.component';
import { PopTextComponent } from '../../base/pop-field-item/pop-text/pop-text.component';
import { PopFieldEditorService } from '../pop-entity-field-editor/pop-entity-field-editor.service';
import { PopSelectListComponent } from '../../base/pop-field-item/pop-select-list/pop-select-list.component';
import { PopDatePickerComponent } from '../../base/pop-field-item/pop-datepicker/pop-datepicker.component';
import { PopSelectModalComponent } from "../../base/pop-field-item/pop-select-modal/pop-select-modal.component";
import * as i0 from "@angular/core";
import * as i1 from "../pop-entity-field-editor/pop-entity-field-editor.service";
export class PopEntityUtilFieldService {
    constructor(field) {
        this.field = field;
        this.name = 'PopEntityUtilFieldService';
        this.cache = new PopCacheService();
    }
    /**
     * Build out the necessary configs for a custom field group and all of this field items involved
     * Fields may have multiple values , so a unique set of configs mut be created for each data entry
     * @param core
     * @param field
     */
    buildCustomField(core, field) {
        let items;
        if (!field.metadata)
            field.metadata = {};
        if (!field.multiple_min)
            field.multiple_min = 1;
        if (!field.multiple_max || field.multiple_max > 10)
            field.multiple_max = 10;
        if (!field.multiple_max_limit)
            field.multiple_max_limit = 10;
        const scheme = StorageGetter(core, ['entity', 'scheme']);
        const useScheme = IsObject(scheme, ['id', 'mapping']) ? true : false;
        field.primary = useScheme ? this.field.isSchemePrimaryField(scheme, field) : false;
        const fieldCustomSettings = GetCustomFieldSettings(field);
        const itemCustomModels = {};
        if (IsObject(fieldCustomSettings, true)) {
            Object.keys(fieldCustomSettings).map((key) => {
                const setting = fieldCustomSettings[key];
                if (IsObject(setting, ['item', 'model']) && setting.item && setting.type === 'model') {
                    if (!itemCustomModels[setting.item])
                        itemCustomModels[setting.item] = {};
                    itemCustomModels[setting.item][setting.model] = setting.value;
                }
            });
        }
        // console.log( itemCustomModels, 'itemCustomModels' );
        field.children = {};
        // make a copy of the field items to use as a pattern
        let fieldItemSet = JsonCopy(field.items);
        fieldItemSet = fieldItemSet.filter((fieldItem) => {
            return +fieldItem.active;
        }).filter((fieldItem) => {
            return useScheme ? !(this.field.isSchemeFieldItemDisabled(scheme, +field.id, +fieldItem.id)) : true;
        }).map((fieldItem) => {
            const itemCustomModel = IsObject(itemCustomModels[fieldItem.name]) ? itemCustomModels[fieldItem.name] : {};
            fieldItem = JsonCopy(Object.assign(Object.assign({}, fieldItem), itemCustomModel));
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
                table: fieldItem.table ? fieldItem.table : { sort: 99, visible: false },
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
            field.entries.map((entry, index) => {
                dataSort[entry.id] = index;
            });
        }
        field.items = {};
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
                }
                else if (varA < varB) {
                    return -1;
                }
                return 0;
            });
        }
        else {
            field.data_keys = IsArray(field.entries, true) ? [field.entries[0].id] : [];
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
                }
                else {
                    // console.log('fail', fieldItem);
                }
            });
        });
        const coreField = {
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
    _setSchemeFieldSettings(scheme, field) {
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
    buildCoreFieldItem(core, model) {
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
    setFieldItemRules(fieldId, fieldItem, scheme) {
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
                if (!(IsObject(rule.options)))
                    rule.options = {};
                rule.options.values = ConvertArrayToOptionList(rule.validations, {
                    nameKey: 'label',
                });
                rule.validationMap = ArrayKeyBy(rule.validations, 'id');
                rule.value = +rule.validation.id;
            }
            else {
                rule.value = rule.raw_value;
            }
            if (!rule.value && rule.default_value)
                rule.value = rule.default_value;
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
        fieldItem.rules.map((rule) => {
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
    buildDomFields(core, dom) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            let coreField, component;
            // dom.ui.fields.clear();
            const baseFields = core.repo.model.field;
            const baseList = Object.values(baseFields).sort(DynamicSort('sort'));
            const customFields = yield this._getEntityCustomFields(core);
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
                allFields.map((field) => {
                    const name = field.model ? field.model.name : field.name;
                    // console.log(name, field.onLoad);
                    if (+core.entity.scheme_id && !(IsObject(core.entity.scheme_assets)))
                        core.entity.scheme_assets = {};
                    const customFieldAssetLocation = +core.entity.scheme_id && IsObject(core.entity.scheme_assets, false) ? core.entity.scheme_assets : core.entity;
                    if (IsObject(field, true) && name) {
                        if (field.when) {
                            if (IsString(field.when))
                                field.when = [field.when];
                            field.hidden = !EvaluateWhenConditions(core, field.when, core);
                        }
                        if (IsObject(field, ['fieldgroup']) && name in customFieldAssetLocation) {
                            coreField = this.buildCustomField(core, field);
                            if (coreField) {
                                component = {
                                    type: PopEntityFieldComponent,
                                    inputs: CleanObject({
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
                        }
                        else if (IsObject(field, ['model']) && ((name in core.entity) || field.preserve)) {
                            field.model.view = { name: field.model.form };
                            if (field.model.transformation)
                                field.model.value = this._getModelValue(core, field, field.model);
                            const model = FieldItemModel(core, field.model);
                            const coreItem = {
                                model: model,
                                table: IsObject(field.table, true) ? field.table : { sort: 99, visible: false },
                                component: this._getFormComponent(field.model.view.name),
                                config: FieldItemModelConfig(core, model)
                            };
                            if (coreItem && coreItem.config) {
                                if (typeof coreItem.config.setControl === 'function')
                                    coreItem.config.setControl(); // build the control now so that the control can be the defacto session value
                                component = {
                                    type: coreItem.component,
                                    inputs: CleanObject({
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
        }));
    }
    /**
     * A method that builds entity fieldset from the server models
     * @param entityConfig
     * @param fieldPosition
     */
    getDomFields(fieldPosition = 1, dom) {
        const componentList = [];
        dom.ui.fields.forEach((component, key) => {
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
    _getEntityCustomFields(core) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            const tmp = {};
            const customFields = {};
            if (core && core.params.can_extend) {
                if (IsObject(core.entity)) {
                    Object.keys(core.entity).map((key) => {
                        if (IsObject(core.entity[key], ['@metadata'])) {
                            tmp[key] = core.entity[key];
                        }
                        else if (IsArray(core.entity[key], true) && IsObject(core.entity[key][0], ['@metadata'])) {
                            tmp[key] = core.entity[key];
                        }
                    });
                }
                if (+core.entity.scheme_id && IsObject(core.entity.scheme_assets, true)) {
                    Object.keys(core.entity.scheme_assets).map((key) => {
                        if (IsObject(core.entity.scheme_assets[key], ['@metadata'])) {
                            tmp[key] = core.entity.scheme_assets[key];
                        }
                        else if (IsArray(core.entity.scheme_assets[key], true) && IsObject(core.entity.scheme_assets[key][0], ['@metadata'])) {
                            tmp[key] = core.entity.scheme_assets[key];
                        }
                    });
                }
                const requests = [];
                const names = [];
                let fieldId;
                const fieldRepo = yield PopEntity.getEntityRepo('field');
                Object.keys(tmp).map((name) => {
                    if (IsObject(tmp[name])) { // field only has a single value
                        if (IsObject(tmp[name]['@metadata'], ['@field_id'])) {
                            const record = tmp[name];
                            const metadata = record['@metadata'];
                            // delete record[ '@metadata' ];
                            fieldId = metadata['@field_id'];
                            tmp[name] = [record];
                        }
                    }
                    else if (IsArray(tmp[name], true)) { // field has multiple values
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
                        results.map((result, index) => __awaiter(this, void 0, void 0, function* () {
                            if (IsDefined(result, false)) {
                                result = GetHttpResult(result);
                                const fieldName = names[index];
                                result.name = fieldName;
                                result.data = fieldName in tmp ? tmp[fieldName] : {};
                                const customField = yield this._setFieldEntries(result);
                                const field = yield this._setEntityCustomFieldDataStructure(customField);
                                customFields[fieldName] = field;
                                if (index === (results.length - 1)) {
                                    return resolve(customFields);
                                }
                            }
                            else {
                                if (index === (results.length - 1)) {
                                    return resolve(customFields);
                                }
                            }
                        }));
                    }, (err) => {
                        return resolve(customFields);
                    });
                }
                else {
                    return resolve(customFields);
                }
            }
            else {
                return resolve(customFields);
            }
        }));
    }
    clearCustomFieldCache(fieldId) {
        this.cache.clear('custom_field', String(fieldId));
    }
    /**
     * Field Entries are a way to define the value structure of a field
     * By default a field will have a single value, but a field can be configured to have multiple values
     * Field entries provide a template of a specific amount of values a field should have
     * @param field
     * @private
     */
    _setFieldEntries(field) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
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
        }));
    }
    /**
     * Field data should come in as an array of records
     * Ensure that each each record has a unique entry id, and index data by field_entry_id;
     * @param customField
     */
    _setEntityCustomFieldDataStructure(customField) {
        return new Promise((resolve) => {
            const data = {};
            // console.log('customField', customField);
            if (IsArray(customField.data, true)) {
                if (IsArray(customField.entries, true)) {
                    customField.data.map((record, index) => {
                        if (!record.field_entry_id)
                            record.field_entry_id = customField.entries[index].id;
                        // console.log("is diff ? ", record.field_entry_id , ' - ', customField.entries[index].id);
                        // delete record[ '@metadata' ];
                        data[record.field_entry_id] = record;
                    });
                }
            }
            else {
                if (IsArray(customField.entries)) {
                    customField.entries.map((entry) => {
                        data[entry.id] = {};
                        const items = customField.items;
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
    _getFieldItemSetting(fieldItem) {
        return {};
    }
    /**
     * A field entry is used to identity a specific value in a set of multiple values
     * @param field
     * @param dataKey
     * @param index
     * @private
     */
    _getFieldItemEntry(field, dataKey, index) {
        let entry = {};
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
            }
            else if (data.field_entry_id && data.field_entry_id in customIdLookup) {
                entry = customEntries[customIdLookup[data.field_entry_id]];
                // ToDo:: Find the cutstom label that should be inserted here
            }
            else if (entryIndex in field.entries) {
                entry = providedEntries[entryIndex];
            }
            else {
                entry = providedEntries[0];
            }
        }
        else {
            entry = null;
        }
        return entry;
    }
    /**
     * Map the form in a field model to the angular component that will be used to render the field
     * @param form
     * @private
     */
    _getFormComponent(form) {
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
    _getModelValue(core, field, model, dataKey) {
        let value = null;
        if (dataKey) {
            if (IsObject(field.data, true) && IsObject(model, true)) {
                if (dataKey in field.data && model.name in field.data[dataKey]) {
                    value = field.data[dataKey][model.name];
                    if (model.transformation)
                        value = PopPipe.transform(value, model.transformation, core);
                }
            }
        }
        else if (model.name in core.entity) {
            value = core.entity[model.name];
            if (model.transformation)
                value = PopPipe.transform(value, model.transformation, core);
        }
        return value;
    }
    /**
     * Get the custom field template that is made for the field group
     * @param name
     * @private
     */
    _getEntityFieldComponent(name) {
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
PopEntityUtilFieldService.ɵprov = i0.ɵɵdefineInjectable({ factory: function PopEntityUtilFieldService_Factory() { return new PopEntityUtilFieldService(i0.ɵɵinject(i1.PopFieldEditorService)); }, token: PopEntityUtilFieldService, providedIn: "root" });
PopEntityUtilFieldService.decorators = [
    { type: Injectable, args: [{
                providedIn: 'root'
            },] }
];
PopEntityUtilFieldService.ctorParameters = () => [
    { type: PopFieldEditorService }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS11dGlsLWZpZWxkLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9lbnRpdHkvc2VydmljZXMvcG9wLWVudGl0eS11dGlsLWZpZWxkLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDekMsT0FBTyxFQUdMLFdBQVcsRUFJWCxTQUFTLEVBQUUsTUFBTSxFQUFFLE9BQU8sR0FDM0IsTUFBTSwyQkFBMkIsQ0FBQztBQUduQyxPQUFPLEVBQUMsdUJBQXVCLEVBQUMsTUFBTSxnREFBZ0QsQ0FBQztBQUN2RixPQUFPLEVBQUMsc0JBQXNCLEVBQUMsTUFBTSx3REFBd0QsQ0FBQztBQUM5RixPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSwyREFBMkQsQ0FBQztBQUM3RixPQUFPLEVBQUMsdUJBQXVCLEVBQUMsTUFBTSx1RUFBdUUsQ0FBQztBQUM5RyxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSx5REFBeUQsQ0FBQztBQUMxRixPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSx1REFBdUQsQ0FBQztBQUN2RixPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSx1REFBdUQsQ0FBQztBQUN2RixPQUFPLEVBQUMsb0JBQW9CLEVBQUMsTUFBTSwrREFBK0QsQ0FBQztBQUNuRyxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSwyREFBMkQsQ0FBQztBQUM3RixPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSx5REFBeUQsQ0FBQztBQUMxRixPQUFPLEVBQUMsb0JBQW9CLEVBQUMsTUFBTSwrREFBK0QsQ0FBQztBQUNuRyxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSx5REFBeUQsQ0FBQztBQUMxRixPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFB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LHFCQUFxQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge1xuICBDb3JlQ29uZmlnLFxuICBEaWN0aW9uYXJ5LCBEeW5hbWljQ29tcG9uZW50SW50ZXJmYWNlLFxuICBGaWVsZENvbmZpZywgRmllbGRFbnRyeSxcbiAgRmllbGRJbnRlcmZhY2UsXG4gIEZpZWxkSXRlbUludGVyZmFjZSxcbiAgRmllbGRJdGVtTW9kZWxJbnRlcmZhY2UsXG4gIFBvcEVudGl0eSwgUG9wTG9nLCBQb3BQaXBlLCBQb3BSZXF1ZXN0LCBTZXJ2aWNlSW5qZWN0b3IsXG59IGZyb20gJy4uLy4uLy4uL3BvcC1jb21tb24ubW9kZWwnO1xuXG5pbXBvcnQge1BvcERvbVNlcnZpY2V9IGZyb20gJy4uLy4uLy4uL3NlcnZpY2VzL3BvcC1kb20uc2VydmljZSc7XG5pbXBvcnQge1BvcEVudGl0eUZpZWxkQ29tcG9uZW50fSBmcm9tICcuLi9wb3AtZW50aXR5LWZpZWxkL3BvcC1lbnRpdHktZmllbGQuY29tcG9uZW50JztcbmltcG9ydCB7UG9wU2lkZUJ5U2lkZUNvbXBvbmVudH0gZnJvbSAnLi4vLi4vYmFzZS9wb3Atc2lkZS1ieS1zaWRlL3BvcC1zaWRlLWJ5LXNpZGUuY29tcG9uZW50JztcbmltcG9ydCB7UG9wU2VsZWN0Q29tcG9uZW50fSBmcm9tICcuLi8uLi9iYXNlL3BvcC1maWVsZC1pdGVtL3BvcC1zZWxlY3QvcG9wLXNlbGVjdC5jb21wb25lbnQnO1xuaW1wb3J0IHtQb3BTZWxlY3RNdWx0aUNvbXBvbmVudH0gZnJvbSAnLi4vLi4vYmFzZS9wb3AtZmllbGQtaXRlbS9wb3Atc2VsZWN0LW11bHRpL3BvcC1zZWxlY3QtbXVsdGkuY29tcG9uZW50JztcbmltcG9ydCB7UG9wSW5wdXRDb21wb25lbnR9IGZyb20gJy4uLy4uL2Jhc2UvcG9wLWZpZWxkLWl0ZW0vcG9wLWlucHV0L3BvcC1pbnB1dC5jb21wb25lbnQnO1xuaW1wb3J0IHtQb3BEYXRlQ29tcG9uZW50fSBmcm9tICcuLi8uLi9iYXNlL3BvcC1maWVsZC1pdGVtL3BvcC1kYXRlL3BvcC1kYXRlLmNvbXBvbmVudCc7XG5pbXBvcnQge1BvcFRpbWVDb21wb25lbnR9IGZyb20gJy4uLy4uL2Jhc2UvcG9wLWZpZWxkLWl0ZW0vcG9wLXRpbWUvcG9wLXRpbWUuY29tcG9uZW50JztcbmltcG9ydCB7UG9wQ2hlY2tib3hDb21wb25lbnR9IGZyb20gJy4uLy4uL2Jhc2UvcG9wLWZpZWxkLWl0ZW0vcG9wLWNoZWNrYm94L3BvcC1jaGVja2JveC5jb21wb25lbnQnO1xuaW1wb3J0IHtQb3BTd2l0Y2hDb21wb25lbnR9IGZyb20gJy4uLy4uL2Jhc2UvcG9wLWZpZWxkLWl0ZW0vcG9wLXN3aXRjaC9wb3Atc3dpdGNoLmNvbXBvbmVudCc7XG5pbXBvcnQge1BvcFJhZGlvQ29tcG9uZW50fSBmcm9tICcuLi8uLi9iYXNlL3BvcC1maWVsZC1pdGVtL3BvcC1yYWRpby9wb3AtcmFkaW8uY29tcG9uZW50JztcbmltcG9ydCB7UG9wVGV4dGFyZWFDb21wb25lbnR9IGZyb20gJy4uLy4uL2Jhc2UvcG9wLWZpZWxkLWl0ZW0vcG9wLXRleHRhcmVhL3BvcC10ZXh0YXJlYS5jb21wb25lbnQnO1xuaW1wb3J0IHtQb3BMYWJlbENvbXBvbmVudH0gZnJvbSAnLi4vLi4vYmFzZS9wb3AtZmllbGQtaXRlbS9wb3AtbGFiZWwvcG9wLWxhYmVsLmNvbXBvbmVudCc7XG5pbXBvcnQge1BvcEJ1dHRvbkNvbXBvbmVudH0gZnJvbSAnLi4vLi4vYmFzZS9wb3AtZmllbGQtaXRlbS9wb3AtYnV0dG9uL3BvcC1idXR0b24uY29tcG9uZW50JztcbmltcG9ydCB7UG9wRW50aXR5TmFtZUNvbXBvbmVudH0gZnJvbSAnLi4vcG9wLWVudGl0eS1maWVsZC9wb3AtZW50aXR5LW5hbWUvcG9wLWVudGl0eS1uYW1lLmNvbXBvbmVudCc7XG5pbXBvcnQge1BvcEVudGl0eURhdGV0aW1lQ29tcG9uZW50fSBmcm9tICcuLi9wb3AtZW50aXR5LWZpZWxkL3BvcC1lbnRpdHktZGF0ZXRpbWUvcG9wLWVudGl0eS1kYXRldGltZS5jb21wb25lbnQnO1xuaW1wb3J0IHtQb3BFbnRpdHlFbWFpbENvbXBvbmVudH0gZnJvbSAnLi4vcG9wLWVudGl0eS1maWVsZC9wb3AtZW50aXR5LWVtYWlsL3BvcC1lbnRpdHktZW1haWwuY29tcG9uZW50JztcbmltcG9ydCB7UG9wRW50aXR5UGhvbmVDb21wb25lbnR9IGZyb20gJy4uL3BvcC1lbnRpdHktZmllbGQvcG9wLWVudGl0eS1waG9uZS9wb3AtZW50aXR5LXBob25lLmNvbXBvbmVudCc7XG5pbXBvcnQge1BvcEVudGl0eUFkZHJlc3NDb21wb25lbnR9IGZyb20gJy4uL3BvcC1lbnRpdHktZmllbGQvcG9wLWVudGl0eS1hZGRyZXNzL3BvcC1lbnRpdHktYWRkcmVzcy5jb21wb25lbnQnO1xuaW1wb3J0IHtQb3BFbnRpdHlJbnB1dENvbXBvbmVudH0gZnJvbSAnLi4vcG9wLWVudGl0eS1maWVsZC9wb3AtZW50aXR5LWlucHV0L3BvcC1lbnRpdHktaW5wdXQuY29tcG9uZW50JztcbmltcG9ydCB7UG9wRW50aXR5U2VsZWN0Q29tcG9uZW50fSBmcm9tICcuLi9wb3AtZW50aXR5LWZpZWxkL3BvcC1lbnRpdHktc2VsZWN0L3BvcC1lbnRpdHktc2VsZWN0LmNvbXBvbmVudCc7XG5pbXBvcnQge1BvcEVudGl0eVJhZGlvQ29tcG9uZW50fSBmcm9tICcuLi9wb3AtZW50aXR5LWZpZWxkL3BvcC1lbnRpdHktcmFkaW8vcG9wLWVudGl0eS1yYWRpby5jb21wb25lbnQnO1xuaW1wb3J0IHtQb3BFbnRpdHlDaGVja2JveENvbXBvbmVudH0gZnJvbSAnLi4vcG9wLWVudGl0eS1maWVsZC9wb3AtZW50aXR5LWNoZWNrYm94L3BvcC1lbnRpdHktY2hlY2tib3guY29tcG9uZW50JztcbmltcG9ydCB7XG4gIEV2YWx1YXRlV2hlbkNvbmRpdGlvbnMsIEZpZWxkSXRlbU1vZGVsLFxuICBGaWVsZEl0ZW1Nb2RlbENvbmZpZywgRmllbGRJdGVtVmlldywgR2V0Q3VzdG9tRmllbGRTZXR0aW5ncywgUGFyc2VNb2RlbFZhbHVlLFxufSBmcm9tICcuLi9wb3AtZW50aXR5LXV0aWxpdHknO1xuXG5pbXBvcnQge1xuICBBcnJheUtleUJ5LFxuICBBcnJheU1hcFNldHRlciwgQ2xlYW5PYmplY3QsIENvbnZlcnRBcnJheVRvT3B0aW9uTGlzdCwgRGVlcENvcHksXG4gIER5bmFtaWNTb3J0LCBHZXRIdHRwUmVzdWx0LFxuICBJc0FycmF5LCBJc0RlZmluZWQsXG4gIElzT2JqZWN0LFxuICBJc1N0cmluZywgSnNvbkNvcHksIFNwYWNlVG9TbmFrZSwgU3RvcmFnZUdldHRlcixcbiAgVGl0bGVDYXNlXG59IGZyb20gJy4uLy4uLy4uL3BvcC1jb21tb24tdXRpbGl0eSc7XG5pbXBvcnQge1BvcE1pbk1heENvbXBvbmVudH0gZnJvbSAnLi4vLi4vYmFzZS9wb3AtZmllbGQtaXRlbS9wb3AtbWluLW1heC9wb3AtbWluLW1heC5jb21wb25lbnQnO1xuaW1wb3J0IHtQb3BOdW1iZXJDb21wb25lbnR9IGZyb20gJy4uLy4uL2Jhc2UvcG9wLWZpZWxkLWl0ZW0vcG9wLW51bWJlci9wb3AtbnVtYmVyLmNvbXBvbmVudCc7XG5pbXBvcnQge1BvcENhY2hlU2VydmljZX0gZnJvbSAnLi4vLi4vLi4vc2VydmljZXMvcG9wLWNhY2hlLnNlcnZpY2UnO1xuaW1wb3J0IHtmb3JrSm9pbn0gZnJvbSAncnhqcyc7XG5pbXBvcnQge0NvbXBvbmVudFR5cGV9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wb3J0YWwnO1xuaW1wb3J0IHtQb3BFbnRpdHlTd2l0Y2hDb21wb25lbnR9IGZyb20gJy4uL3BvcC1lbnRpdHktZmllbGQvcG9wLWVudGl0eS1zd2l0Y2gvcG9wLWVudGl0eS1zd2l0Y2guY29tcG9uZW50JztcbmltcG9ydCB7UG9wRW50aXR5U2VsZWN0TXVsdGlDb21wb25lbnR9IGZyb20gJy4uL3BvcC1lbnRpdHktZmllbGQvcG9wLWVudGl0eS1zZWxlY3QtbXVsdGkvcG9wLWVudGl0eS1zZWxlY3QtbXVsdGkuY29tcG9uZW50JztcbmltcG9ydCB7UG9wRW50aXR5VGV4dGFyZWFDb21wb25lbnR9IGZyb20gJy4uL3BvcC1lbnRpdHktZmllbGQvcG9wLWVudGl0eS10ZXh0YXJlYS9wb3AtZW50aXR5LXRleHRhcmVhLmNvbXBvbmVudCc7XG5pbXBvcnQge1BvcFNlbGVjdEZpbHRlckNvbXBvbmVudH0gZnJvbSAnLi4vLi4vYmFzZS9wb3AtZmllbGQtaXRlbS9wb3Atc2VsZWN0LWZpbHRlci9wb3Atc2VsZWN0LWZpbHRlci5jb21wb25lbnQnO1xuaW1wb3J0IHtQb3BUZXh0Q29tcG9uZW50fSBmcm9tICcuLi8uLi9iYXNlL3BvcC1maWVsZC1pdGVtL3BvcC10ZXh0L3BvcC10ZXh0LmNvbXBvbmVudCc7XG5pbXBvcnQge0VudGl0eVNjaGVtZVNlY3Rpb25JbnRlcmZhY2V9IGZyb20gJy4uL3BvcC1lbnRpdHktc2NoZW1lL3BvcC1lbnRpdHktc2NoZW1lLm1vZGVsJztcbmltcG9ydCB7UG9wRmllbGRFZGl0b3JTZXJ2aWNlfSBmcm9tICcuLi9wb3AtZW50aXR5LWZpZWxkLWVkaXRvci9wb3AtZW50aXR5LWZpZWxkLWVkaXRvci5zZXJ2aWNlJztcbmltcG9ydCB7UG9wU2VsZWN0TGlzdENvbXBvbmVudH0gZnJvbSAnLi4vLi4vYmFzZS9wb3AtZmllbGQtaXRlbS9wb3Atc2VsZWN0LWxpc3QvcG9wLXNlbGVjdC1saXN0LmNvbXBvbmVudCc7XG5pbXBvcnQge1BvcERhdGVQaWNrZXJDb21wb25lbnR9IGZyb20gJy4uLy4uL2Jhc2UvcG9wLWZpZWxkLWl0ZW0vcG9wLWRhdGVwaWNrZXIvcG9wLWRhdGVwaWNrZXIuY29tcG9uZW50JztcbmltcG9ydCB7UG9wU2VsZWN0TW9kYWxDb21wb25lbnR9IGZyb20gXCIuLi8uLi9iYXNlL3BvcC1maWVsZC1pdGVtL3BvcC1zZWxlY3QtbW9kYWwvcG9wLXNlbGVjdC1tb2RhbC5jb21wb25lbnRcIjtcblxuXG5ASW5qZWN0YWJsZSh7XG4gIHByb3ZpZGVkSW46ICdyb290J1xufSlcbmV4cG9ydCBjbGFzcyBQb3BFbnRpdHlVdGlsRmllbGRTZXJ2aWNlIHtcblxuICBwcml2YXRlIG5hbWUgPSAnUG9wRW50aXR5VXRpbEZpZWxkU2VydmljZSc7XG5cbiAgcHJpdmF0ZSBjYWNoZSA9IG5ldyBQb3BDYWNoZVNlcnZpY2UoKTtcblxuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZmllbGQ6IFBvcEZpZWxkRWRpdG9yU2VydmljZSkge1xuICB9XG5cblxuICAvKipcbiAgICogQnVpbGQgb3V0IHRoZSBuZWNlc3NhcnkgY29uZmlncyBmb3IgYSBjdXN0b20gZmllbGQgZ3JvdXAgYW5kIGFsbCBvZiB0aGlzIGZpZWxkIGl0ZW1zIGludm9sdmVkXG4gICAqIEZpZWxkcyBtYXkgaGF2ZSBtdWx0aXBsZSB2YWx1ZXMgLCBzbyBhIHVuaXF1ZSBzZXQgb2YgY29uZmlncyBtdXQgYmUgY3JlYXRlZCBmb3IgZWFjaCBkYXRhIGVudHJ5XG4gICAqIEBwYXJhbSBjb3JlXG4gICAqIEBwYXJhbSBmaWVsZFxuICAgKi9cbiAgYnVpbGRDdXN0b21GaWVsZChjb3JlOiBDb3JlQ29uZmlnLCBmaWVsZDogRmllbGRJbnRlcmZhY2UpIHtcbiAgICBsZXQgaXRlbXM7XG4gICAgaWYgKCFmaWVsZC5tZXRhZGF0YSkgZmllbGQubWV0YWRhdGEgPSB7fTtcbiAgICBpZiAoIWZpZWxkLm11bHRpcGxlX21pbikgZmllbGQubXVsdGlwbGVfbWluID0gMTtcbiAgICBpZiAoIWZpZWxkLm11bHRpcGxlX21heCB8fCBmaWVsZC5tdWx0aXBsZV9tYXggPiAxMCkgZmllbGQubXVsdGlwbGVfbWF4ID0gMTA7XG4gICAgaWYgKCFmaWVsZC5tdWx0aXBsZV9tYXhfbGltaXQpIGZpZWxkLm11bHRpcGxlX21heF9saW1pdCA9IDEwO1xuXG5cbiAgICBjb25zdCBzY2hlbWUgPSBTdG9yYWdlR2V0dGVyKGNvcmUsIFsnZW50aXR5JywgJ3NjaGVtZSddKTtcbiAgICBjb25zdCB1c2VTY2hlbWUgPSBJc09iamVjdChzY2hlbWUsIFsnaWQnLCAnbWFwcGluZyddKSA/IHRydWUgOiBmYWxzZTtcblxuICAgIGZpZWxkLnByaW1hcnkgPSB1c2VTY2hlbWUgPyB0aGlzLmZpZWxkLmlzU2NoZW1lUHJpbWFyeUZpZWxkKHNjaGVtZSwgZmllbGQpIDogZmFsc2U7XG5cbiAgICBjb25zdCBmaWVsZEN1c3RvbVNldHRpbmdzID0gR2V0Q3VzdG9tRmllbGRTZXR0aW5ncyhmaWVsZCk7XG4gICAgY29uc3QgaXRlbUN1c3RvbU1vZGVscyA9IHt9O1xuICAgIGlmIChJc09iamVjdChmaWVsZEN1c3RvbVNldHRpbmdzLCB0cnVlKSkge1xuICAgICAgT2JqZWN0LmtleXMoZmllbGRDdXN0b21TZXR0aW5ncykubWFwKChrZXk6IHN0cmluZykgPT4ge1xuICAgICAgICBjb25zdCBzZXR0aW5nID0gZmllbGRDdXN0b21TZXR0aW5nc1trZXldO1xuICAgICAgICBpZiAoSXNPYmplY3Qoc2V0dGluZywgWydpdGVtJywgJ21vZGVsJ10pICYmIHNldHRpbmcuaXRlbSAmJiBzZXR0aW5nLnR5cGUgPT09ICdtb2RlbCcpIHtcbiAgICAgICAgICBpZiAoIWl0ZW1DdXN0b21Nb2RlbHNbc2V0dGluZy5pdGVtXSkgaXRlbUN1c3RvbU1vZGVsc1tzZXR0aW5nLml0ZW1dID0ge307XG4gICAgICAgICAgaXRlbUN1c3RvbU1vZGVsc1tzZXR0aW5nLml0ZW1dW3NldHRpbmcubW9kZWxdID0gc2V0dGluZy52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gY29uc29sZS5sb2coIGl0ZW1DdXN0b21Nb2RlbHMsICdpdGVtQ3VzdG9tTW9kZWxzJyApO1xuXG4gICAgZmllbGQuY2hpbGRyZW4gPSB7fTtcbiAgICAvLyBtYWtlIGEgY29weSBvZiB0aGUgZmllbGQgaXRlbXMgdG8gdXNlIGFzIGEgcGF0dGVyblxuICAgIGxldCBmaWVsZEl0ZW1TZXQgPSBKc29uQ29weShmaWVsZC5pdGVtcyk7XG4gICAgZmllbGRJdGVtU2V0ID0gZmllbGRJdGVtU2V0LmZpbHRlcigoZmllbGRJdGVtOiBGaWVsZEl0ZW1JbnRlcmZhY2UpID0+IHtcbiAgICAgIHJldHVybiArZmllbGRJdGVtLmFjdGl2ZTtcbiAgICB9KS5maWx0ZXIoKGZpZWxkSXRlbTogRmllbGRJdGVtSW50ZXJmYWNlKSA9PiB7XG4gICAgICByZXR1cm4gdXNlU2NoZW1lID8gISh0aGlzLmZpZWxkLmlzU2NoZW1lRmllbGRJdGVtRGlzYWJsZWQoc2NoZW1lLCArZmllbGQuaWQsICtmaWVsZEl0ZW0uaWQpKSA6IHRydWU7XG4gICAgfSkubWFwKChmaWVsZEl0ZW06IEZpZWxkSXRlbUludGVyZmFjZSkgPT4ge1xuICAgICAgY29uc3QgaXRlbUN1c3RvbU1vZGVsID0gSXNPYmplY3QoaXRlbUN1c3RvbU1vZGVsc1tmaWVsZEl0ZW0ubmFtZV0pID8gaXRlbUN1c3RvbU1vZGVsc1tmaWVsZEl0ZW0ubmFtZV0gOiB7fTtcbiAgICAgIGZpZWxkSXRlbSA9IEpzb25Db3B5KHsuLi5maWVsZEl0ZW0sIC4uLml0ZW1DdXN0b21Nb2RlbH0pO1xuICAgICAgZmllbGRJdGVtID0gQ2xlYW5PYmplY3QoZmllbGRJdGVtLCB7XG4gICAgICAgIGJsYWNrbGlzdDogWydjaGlsZHJlbicsICdlbnRyaWVzJywgJ2l0ZW1zJywgJ3N0b3JhZ2UnLCAnd2ViaG9vaycsICdvYmplY3RfbmFtZScsICdkZXB0aF9sZXZlbCddXG4gICAgICB9KTtcblxuICAgICAgLy8gZmllbGRJdGVtLm1vZGVsLnZhbHVlID0gaXRlbS5tb2RlbC5vcHRpb25zLmRlZmF1bHRWYWx1ZSB8fCBudWxsO1xuICAgICAgLy8gVG9Ebzo6IEluamVjdCBzY2hlbWUgcnVsZSB2YWx1ZXNcbiAgICAgIHRoaXMuc2V0RmllbGRJdGVtUnVsZXMoK2ZpZWxkLmlkLCBmaWVsZEl0ZW0sIHNjaGVtZSk7XG5cbiAgICAgIC8vIGNvbnNvbGUubG9nKCdmaWVsZEl0ZW0nLCBmaWVsZEl0ZW0pO1xuXG5cbiAgICAgIGNvbnN0IG1vZGVsID0gRmllbGRJdGVtTW9kZWwoY29yZSwgZmllbGRJdGVtKTtcblxuXG5cbiAgICAgIGlmIChJc0FycmF5KGZpZWxkSXRlbS5zb3VyY2UsIHRydWUpICYmICFJc0FycmF5KG1vZGVsLm9wdGlvbnMudmFsdWVzLCB0cnVlKSkge1xuICAgICAgICBtb2RlbC5vcHRpb25zLnJhd1ZhbHVlcyA9IGZpZWxkSXRlbS5zb3VyY2U7XG4gICAgICAgIG1vZGVsLm9wdGlvbnMudmFsdWVzID0gZmllbGRJdGVtLnNvdXJjZTtcbiAgICAgIH1cblxuICAgICAgLy8gaWYgKElzQXJyYXkoZmllbGRJdGVtLnNvdXJjZSkpIHtcbiAgICAgIC8vICAgY29uc29sZS5sb2coJ2ZpZWxkaXRlbSBzb3VyY2UnLCBmaWVsZEl0ZW0pO1xuICAgICAgLy8gICBjb25zb2xlLmxvZygnb3B0aW9ucycsIG1vZGVsLm9wdGlvbnMpO1xuICAgICAgLy8gfVxuXG4gICAgICBjb25zdCB2aWV3ID0gRmllbGRJdGVtVmlldyhmaWVsZEl0ZW0udmlldyk7XG4gICAgICBjb25zdCBpdGVtID0gQ2xlYW5PYmplY3Qoe1xuICAgICAgICBpZDogZmllbGRJdGVtLmlkLFxuICAgICAgICBjdXN0b21fc2V0dGluZzoge30sXG4gICAgICAgIG1vZGVsOiBtb2RlbCxcbiAgICAgICAgdGFibGU6IGZpZWxkSXRlbS50YWJsZSA/IGZpZWxkSXRlbS50YWJsZSA6IHtzb3J0OiA5OSwgdmlzaWJsZTogZmFsc2V9LFxuICAgICAgICB2aWV3OiB2aWV3LFxuICAgICAgICBjb21wb25lbnQ6IHZpZXcubmFtZSxcbiAgICAgICAgc2V0dGluZzogdGhpcy5fZ2V0RmllbGRJdGVtU2V0dGluZyhmaWVsZEl0ZW0pLFxuICAgICAgICBydWxlczogZmllbGRJdGVtLnJ1bGVzLFxuICAgICAgICBydWxlOiBmaWVsZEl0ZW0ucnVsZSxcbiAgICAgICAgc291cmNlOiBJc0FycmF5KGZpZWxkSXRlbS5zb3VyY2UsIHRydWUpID8gZmllbGRJdGVtLnNvdXJjZSA6IG51bGwsXG4gICAgICAgIHNvdXJjZU1hcDogSXNBcnJheShmaWVsZEl0ZW0uc291cmNlLCB0cnVlKSA/IEFycmF5TWFwU2V0dGVyKGZpZWxkSXRlbS5zb3VyY2UsICdpZCcpIDogbnVsbFxuICAgICAgfSk7XG5cbiAgICAgIGZpZWxkLmNoaWxkcmVuW2ZpZWxkSXRlbS5uYW1lXSA9IGl0ZW07XG4gICAgICByZXR1cm4gaXRlbTtcbiAgICB9KTtcblxuICAgIGNvbnN0IGRhdGFTb3J0ID0ge307XG4gICAgaWYgKElzQXJyYXkoZmllbGQuZW50cmllcywgdHJ1ZSkpIHtcbiAgICAgIGZpZWxkLmVudHJpZXMuc29ydChEeW5hbWljU29ydCgnc29ydF9vcmRlcicpKTtcbiAgICAgIGZpZWxkLmVudHJpZXMubWFwKChlbnRyeTogRmllbGRFbnRyeSwgaW5kZXgpID0+IHtcbiAgICAgICAgZGF0YVNvcnRbZW50cnkuaWRdID0gaW5kZXg7XG4gICAgICB9KTtcblxuICAgIH1cblxuXG4gICAgZmllbGQuaXRlbXMgPSA8YW55Pnt9O1xuICAgIGl0ZW1zID0ge307XG4gICAgZmllbGQuZGF0YSA9IElzT2JqZWN0KGZpZWxkLmRhdGEsIHRydWUpID8gZmllbGQuZGF0YSA6IHt9O1xuICAgIGlmICh1c2VTY2hlbWUpIHtcbiAgICAgIE9iamVjdC5rZXlzKGZpZWxkLmRhdGEpLm1hcCgoZGF0YUtleSkgPT4ge1xuICAgICAgICBpZiAodGhpcy5maWVsZC5pc1NjaGVtZUZpZWxkRW50cnlEaXNhYmxlZChzY2hlbWUsICtmaWVsZC5pZCwgK2RhdGFLZXkpKSB7XG4gICAgICAgICAgZGVsZXRlIGZpZWxkLmRhdGFbZGF0YUtleV07XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIGdldCBpZCBvZiBrZXlzIGZyb20gZmllbGQgZW50cmllc1xuICAgIC8vIGNvbnNvbGUubG9nKGZpZWxkLmVudHJpZXMpO1xuICAgIGlmIChmaWVsZC5tdWx0aXBsZSkge1xuICAgICAgY29uc3QgZGF0YUtleXMgPSBmaWVsZC5lbnRyaWVzLm1hcChpID0+IGkuaWQpO1xuICAgICAgZmllbGQuZGF0YV9rZXlzID0gZGF0YUtleXMuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICBjb25zdCB2YXJBID0gK2RhdGFTb3J0W2FdO1xuICAgICAgICBjb25zdCB2YXJCID0gK2RhdGFTb3J0W2JdO1xuICAgICAgICBpZiAodmFyQSA+IHZhckIpIHtcbiAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgfSBlbHNlIGlmICh2YXJBIDwgdmFyQikge1xuICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gMDtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBmaWVsZC5kYXRhX2tleXMgPSBJc0FycmF5KGZpZWxkLmVudHJpZXMsIHRydWUpID8gW2ZpZWxkLmVudHJpZXNbMF0uaWRdOiBbXTtcbiAgICB9XG5cblxuICAgIGNvbnN0IGVudHJ5TG9va3VwID0gQXJyYXlNYXBTZXR0ZXIoZmllbGQuZW50cmllcywgJ2lkJyk7XG4gICAgZmllbGQuZGF0YV9rZXlzLm1hcCgoZGF0YUtleSwgaW5kZXgpID0+IHtcbiAgICAgIGl0ZW1zW2RhdGFLZXldID0ge1xuICAgICAgICBlbnRyeTogZGF0YUtleSBpbiBlbnRyeUxvb2t1cCA/IGZpZWxkLmVudHJpZXNbZW50cnlMb29rdXBbZGF0YUtleV1dIDogdGhpcy5fZ2V0RmllbGRJdGVtRW50cnkoZmllbGQsIGRhdGFLZXksIGluZGV4KSxcbiAgICAgICAgY29uZmlnOiB7fVxuICAgICAgfTtcbiAgICAgIGZpZWxkSXRlbVNldC5tYXAoKGZpZWxkSXRlbSkgPT4ge1xuICAgICAgICAvLyBUb0RvOjogRGV0ZXJtaW5lIHdoZXRoZXIgcGF0Y2ggc2hvdWxkIGFsd2F5cyBiZSBjcmVhdGVkOyBBLkMuXG4gICAgICAgIGlmIChJc09iamVjdChmaWVsZEl0ZW0ubW9kZWwsIFsnbmFtZSddKSkge1xuICAgICAgICAgIGZpZWxkSXRlbS5tb2RlbC52YWx1ZSA9IHRoaXMuX2dldE1vZGVsVmFsdWUoY29yZSwgZmllbGQsIGZpZWxkSXRlbS5tb2RlbCwgZGF0YUtleSk7XG4gICAgICAgICAgZmllbGRJdGVtLm1vZGVsLmZhY2FkZSA9IDE7XG4gICAgICAgICAgY29uc3QgY29uZmlnID0gRmllbGRJdGVtTW9kZWxDb25maWcoY29yZSwgZmllbGRJdGVtLm1vZGVsKTtcbiAgICAgICAgICBpdGVtc1tkYXRhS2V5XS5jb25maWdbZmllbGRJdGVtLm1vZGVsLm5hbWVdID0gY29uZmlnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdmYWlsJywgZmllbGRJdGVtKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgY29uc3QgY29yZUZpZWxkID0gPGFueT57XG4gICAgICBpZDogK2ZpZWxkLmlkLFxuICAgICAgYW5jaWxsYXJ5OiBmaWVsZC5hbmNpbGxhcnkgPyAxIDogMCxcbiAgICAgIGNhbkFkZDogZmllbGQuY2FuQWRkLFxuICAgICAgY2FuUmVtb3ZlOiBmaWVsZC5jYW5SZW1vdmUsXG4gICAgICBjb25maWdzOiBmaWVsZC5jb25maWdzIHx8IHt9LFxuICAgICAgY3VzdG9tX3NldHRpbmc6IGZpZWxkLmN1c3RvbV9zZXR0aW5nIHx8IHt9LFxuICAgICAgbWV0YWRhdGE6IGZpZWxkLm1ldGFkYXRhLFxuICAgICAgbXVsdGlwbGU6ICEhZmllbGQubXVsdGlwbGUsXG4gICAgICBtdWx0aXBsZV9taW46IGZpZWxkLm11bHRpcGxlX21pbixcbiAgICAgIG11bHRpcGxlX21heDogZmllbGQubXVsdGlwbGVfbWF4LFxuICAgICAgbXVsdGlwbGVfbWF4X2xpbWl0OiBmaWVsZC5tdWx0aXBsZV9tYXhfbGltaXQgPyBmaWVsZC5tdWx0aXBsZV9tYXhfbGltaXQgOiAxMCxcbiAgICAgIGRhdGE6IGZpZWxkLmRhdGEsXG4gICAgICBkYXRhX2tleXM6IGZpZWxkLmRhdGFfa2V5cyxcbiAgICAgIGZhY2FkZTogISFmaWVsZC5mYWNhZGUsXG4gICAgICBmaWVsZGdyb3VwOiBmaWVsZC5maWVsZGdyb3VwLFxuICAgICAgZW50cmllczogSXNBcnJheShmaWVsZC5lbnRyaWVzKSA/IGZpZWxkLmVudHJpZXMgOiBbXSxcbiAgICAgIGhpZGRlbjogZmllbGQuaGlkZGVuID8gdHJ1ZSA6IGZhbHNlLFxuICAgICAgaW50ZXJuYWxfbmFtZTogZmllbGQuZmllbGRncm91cC5uYW1lLFxuICAgICAgbmFtZTogU3RyaW5nKFNwYWNlVG9TbmFrZShmaWVsZC5uYW1lKSkudG9Mb3dlckNhc2UoKSxcbiAgICAgIGxhYmVsOiBmaWVsZC5sYWJlbCxcbiAgICAgIHBvc2l0aW9uOiBmaWVsZC5wb3NpdGlvbixcbiAgICAgIHNldHRpbmc6IGZpZWxkLnNldHRpbmcgfHwge30sXG4gICAgICBzaG93X25hbWU6ICEhZmllbGQuc2hvd19uYW1lLFxuICAgICAgc29ydDogZmllbGQuc29ydCxcbiAgICAgIHN0YXRlOiBmaWVsZC5zdGF0ZSA/IGZpZWxkLnN0YXRlIDogJ3RlbXBsYXRlX2VkaXQnLFxuICAgICAgd2hlbjogZmllbGQud2hlbiA/IGZpZWxkLndoZW4gOiBudWxsLFxuICAgICAgY2hpbGRyZW46IGZpZWxkLmNoaWxkcmVuLFxuICAgICAgaXRlbXM6IGl0ZW1zLFxuICAgIH07XG5cbiAgICBjb25zdCBmb3JtTmFtZSA9IGZpZWxkLmZpZWxkZ3JvdXAubmFtZSA9PT0gJ3NlbGVjdGlvbicgPyBmaWVsZC5jaGlsZHJlbi52YWx1ZS52aWV3Lm5hbWUgOiBmaWVsZC5maWVsZGdyb3VwLm5hbWUgPyBmaWVsZC5maWVsZGdyb3VwLm5hbWUgOiAnc2VsZWN0JztcblxuICAgIGNvcmVGaWVsZC5jb21wb25lbnQgPSB0aGlzLl9nZXRFbnRpdHlGaWVsZENvbXBvbmVudChmb3JtTmFtZSk7XG5cbiAgICByZXR1cm4gbmV3IEZpZWxkQ29uZmlnKGNvcmVGaWVsZCk7XG4gIH1cblxuXG4gIHByaXZhdGUgX3NldFNjaGVtZUZpZWxkU2V0dGluZ3Moc2NoZW1lOiBFbnRpdHlTY2hlbWVTZWN0aW9uSW50ZXJmYWNlLCBmaWVsZDogRmllbGRJbnRlcmZhY2UpIHtcbiAgICBpZiAoSXNPYmplY3Qoc2NoZW1lLCBbJ2lkJywgJ21hcHBpbmcnXSkgJiYgSXNPYmplY3QoZmllbGQsIHRydWUpKSB7XG4gICAgICAvLyBjb25zb2xlLmxvZyggJ19zZXRTY2hlbWVGaWVsZFNldHRpbmdzJywgc2NoZW1lLCBmaWVsZCApO1xuICAgIH1cbiAgICByZXR1cm4gZmllbGQ7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBCdWlsZCBvdXQgYSBjb25maWcgZm9yIGEgZmllbGQgaXRlbVxuICAgKiBAcGFyYW0gY29yZVxuICAgKiBAcGFyYW0gbW9kZWxcbiAgICovXG4gIGJ1aWxkQ29yZUZpZWxkSXRlbShjb3JlOiBDb3JlQ29uZmlnLCBtb2RlbDogRmllbGRJdGVtTW9kZWxJbnRlcmZhY2UpOiB7IG1vZGVsOiBGaWVsZEl0ZW1Nb2RlbEludGVyZmFjZSwgY29tcG9uZW50OiBDb21wb25lbnRUeXBlPGFueT4sIGNvbmZpZzogYW55IH0ge1xuICAgIHJldHVybiB7XG4gICAgICBtb2RlbDogbW9kZWwsXG4gICAgICBjb21wb25lbnQ6IHRoaXMuX2dldEZvcm1Db21wb25lbnQobW9kZWwuZm9ybSksXG4gICAgICBjb25maWc6IEZpZWxkSXRlbU1vZGVsQ29uZmlnKGNvcmUsIG1vZGVsKVxuICAgIH07XG4gIH1cblxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHJ1bGVzIHRoYXQgc2hvdWxkIGJlIGFwcGxpZWQgb24gdGhpcyBmaWVsZFxuICAgKiBAcGFyYW0gZmllbGRJdGVtXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBzZXRGaWVsZEl0ZW1SdWxlcyhmaWVsZElkOiBudW1iZXIsIGZpZWxkSXRlbTogYW55LCBzY2hlbWU/OiBFbnRpdHlTY2hlbWVTZWN0aW9uSW50ZXJmYWNlKTogdm9pZCB7XG4gICAgY29uc3QgUnVsZVNldCA9IHt9O1xuICAgIGZpZWxkSXRlbS5ydWxlID0ge307XG4gICAgY29uc3QgaXRlbVJ1bGVzID0gSXNBcnJheShmaWVsZEl0ZW0uaXRlbXJ1bGVzLCB0cnVlKSA/IGZpZWxkSXRlbS5pdGVtcnVsZXMgOiBbXTsgLy8gZGVmYXVsdCBydWxlcyBpbmhlcml0ZWQgZnJvbSB0aGUgZmllbGRfaXRlbV9pZFxuICAgIC8vIGNvbnN0IG1hcHBpbmcgPSB0aGlzLmZpZWxkLmdldFNjaGVtZUZpZWxkSXRlbU1hcHBpbmcoc2NoZW1lLCBmaWVsZElkLCArZmllbGRJdGVtLmlkKTtcbiAgICAvLyBjb25zb2xlLmxvZygnbWFwcGluZycsIG1hcHBpbmcpO1xuICAgIGNvbnN0IGZpZWxkUnVsZXMgPSBJc0FycmF5KGZpZWxkSXRlbS5maWVsZHJ1bGVzLCB0cnVlKSA/IGZpZWxkSXRlbS5maWVsZHJ1bGVzIDogW107IC8vIHJ1bGVzIHNwZWNpZmljIHRvIHRoaXMgZmllbGQgaXRlbVxuICAgIGNvbnN0IHNjaGVtZVJ1bGVzID0gSXNPYmplY3Qoc2NoZW1lLCBbJ2lkJywgJ21hcHBpbmcnXSkgPyB0aGlzLmZpZWxkLmdldFNjaGVtZUZpZWxkSXRlbVNlY3Rpb24oc2NoZW1lLCBmaWVsZElkLCArZmllbGRJdGVtLmlkLCAncnVsZScpIDoge307XG4gICAgLy8gd2Ugd2FudCBmaWVsZCBydWxlcyB0byBvdmVycmlkZSBpdGVtcyBydWxlcyB3aGVuIHRoZXJlIGlzIG92ZXJsYXAgaWUuLiB0aGUgaXRlbSBtaWdodCBjb21lIHdpdGggYSBkZWZhdWx0IHJ1bGUgYnV0IHRoZSBpdGVtcyBydWxlcyBzaG91bGQgb3ZlcnJpZGUgaXRcbiAgICBpdGVtUnVsZXMubWFwKChydWxlKSA9PiB7XG4gICAgICBpZiAoSXNBcnJheShydWxlLnZhbGlkYXRpb25zLCB0cnVlKSkge1xuICAgICAgICBpZiAoIShJc09iamVjdChydWxlLm9wdGlvbnMpKSkgcnVsZS5vcHRpb25zID0ge307XG4gICAgICAgIHJ1bGUub3B0aW9ucy52YWx1ZXMgPSBDb252ZXJ0QXJyYXlUb09wdGlvbkxpc3QocnVsZS52YWxpZGF0aW9ucywge1xuICAgICAgICAgIG5hbWVLZXk6ICdsYWJlbCcsXG4gICAgICAgIH0pO1xuICAgICAgICBydWxlLnZhbGlkYXRpb25NYXAgPSBBcnJheUtleUJ5KHJ1bGUudmFsaWRhdGlvbnMsICdpZCcpO1xuICAgICAgICBydWxlLnZhbHVlID0gK3J1bGUudmFsaWRhdGlvbi5pZDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJ1bGUudmFsdWUgPSBydWxlLnJhd192YWx1ZTtcbiAgICAgIH1cbiAgICAgIGlmICghcnVsZS52YWx1ZSAmJiBydWxlLmRlZmF1bHRfdmFsdWUpIHJ1bGUudmFsdWUgPSBydWxlLmRlZmF1bHRfdmFsdWU7XG4gICAgICBSdWxlU2V0W3J1bGUubmFtZV0gPSBydWxlO1xuICAgIH0pO1xuXG4gICAgZmllbGRSdWxlcy5tYXAoKHJ1bGUpID0+IHtcbiAgICAgIGlmIChJc09iamVjdChSdWxlU2V0W3J1bGUubmFtZV0pKSB7XG4gICAgICAgIFJ1bGVTZXRbcnVsZS5uYW1lXS5pZCA9IHJ1bGUuaWQ7XG4gICAgICAgIFJ1bGVTZXRbcnVsZS5uYW1lXS52YWx1ZSA9IElzQXJyYXkoUnVsZVNldFtydWxlLm5hbWVdLnZhbGlkYXRpb25zLCB0cnVlKSA/IHJ1bGUudmFsaWRhdGlvbi5pZCA6IHJ1bGUucmF3X3ZhbHVlO1xuICAgICAgICBSdWxlU2V0W3J1bGUubmFtZV0uZmllbGRfaWQgPSBydWxlLmZpZWxkX2lkO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgZmllbGRJdGVtLnJ1bGVzID0gT2JqZWN0LnZhbHVlcyhSdWxlU2V0KTtcbiAgICBmaWVsZEl0ZW0ucnVsZXMubWFwKChydWxlOiBhbnkpID0+IHtcbiAgICAgIGlmICghcnVsZS52YWxpZGF0aW9uLmZpeGVkKSB7XG4gICAgICAgIGZpZWxkSXRlbS5ydWxlW3J1bGUubmFtZV0gPSBQYXJzZU1vZGVsVmFsdWUocnVsZS52YWx1ZSk7XG4gICAgICAgIGlmIChJc09iamVjdChzY2hlbWVSdWxlcywgW3J1bGUubmFtZV0pKSB7XG4gICAgICAgICAgZmllbGRJdGVtLnJ1bGVbcnVsZS5uYW1lXSA9IHNjaGVtZVJ1bGVzW3J1bGUubmFtZV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIGRlbGV0ZSBmaWVsZEl0ZW0uZmllbGRydWxlcztcbiAgICAvLyBkZWxldGUgZmllbGRJdGVtLml0ZW1ydWxlcztcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEEgbWV0aG9kIHRoYXQgYnVpbGRzIGVudGl0eSBmaWVsZHNldCBmcm9tIHRoZSBzZXJ2ZXIgbW9kZWxzXG4gICAqIEBwYXJhbSBlbnRpdHlDb25maWdcbiAgICogQHBhcmFtIGZpZWxkUG9zaXRpb25cbiAgICovXG4gIGJ1aWxkRG9tRmllbGRzKGNvcmU6IENvcmVDb25maWcsIGRvbTogUG9wRG9tU2VydmljZSk6IFByb21pc2U8Ym9vbGVhbj4geyAvLyBhIGZpZWxkIGlzIHdyYXBwZXIgYXJvdW5kIGZpZWxkIGl0ZW1zXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jIChyZXNvbHZlKSA9PiB7XG4gICAgICBsZXQgY29yZUZpZWxkLCBjb21wb25lbnQ7XG4gICAgICAvLyBkb20udWkuZmllbGRzLmNsZWFyKCk7XG4gICAgICBjb25zdCBiYXNlRmllbGRzID0gY29yZS5yZXBvLm1vZGVsLmZpZWxkO1xuICAgICAgY29uc3QgYmFzZUxpc3QgPSBPYmplY3QudmFsdWVzKGJhc2VGaWVsZHMpLnNvcnQoRHluYW1pY1NvcnQoJ3NvcnQnKSk7XG4gICAgICBjb25zdCBjdXN0b21GaWVsZHMgPSA8RGljdGlvbmFyeTxGaWVsZEludGVyZmFjZT4+YXdhaXQgdGhpcy5fZ2V0RW50aXR5Q3VzdG9tRmllbGRzKGNvcmUpO1xuICAgICAgUG9wTG9nLmluZm8odGhpcy5uYW1lLCBgYnVpbGREb21GaWVsZHNgLCB7XG4gICAgICAgIGJhc2U6IGJhc2VGaWVsZHMsXG4gICAgICAgIGN1c3RvbTogY3VzdG9tRmllbGRzXG4gICAgICB9KTtcbiAgICAgIGNvbnN0IGN1c3RvbUxpc3QgPSBPYmplY3QudmFsdWVzKGN1c3RvbUZpZWxkcykuc29ydCgoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgaWYgKGEuZmllbGRncm91cC5pZCA9PT0gYi5maWVsZGdyb3VwLmlkKSB7XG4gICAgICAgICAgcmV0dXJuIGIubGFiZWwgPCBhLmxhYmVsID8gMSA6IC0xO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhLmZpZWxkZ3JvdXAuaWQgPiBiLmZpZWxkZ3JvdXAuaWQgPyAxIDogLTE7XG4gICAgICB9KSk7XG4gICAgICAvLyBQbGFjZSBiYXNlIGZpZWxkIGluZiBmcm9udCBvZiBiYXNlIGZpZWxkcywgYW5kIHRoZW4gcHV0IGN1c3RvbSBmaWVsZHMgKHNvcnRlZCBieSB0eXBlLG5hbWUpXG4gICAgICBjb25zdCBhbGxGaWVsZHMgPSBbLi4uYmFzZUxpc3QsIC4uLmN1c3RvbUxpc3RdLm1hcCgoZmllbGQsIGluZGV4KSA9PiB7XG4gICAgICAgIGZpZWxkLnNvcnQgPSBpbmRleDtcbiAgICAgICAgLy8gcmV0dXJuIEpTT04ucGFyc2UoIEpTT04uc3RyaW5naWZ5KCBmaWVsZCApICk7XG4gICAgICAgIHJldHVybiBEZWVwQ29weShmaWVsZCk7XG4gICAgICB9KTtcblxuICAgICAgaWYgKElzQXJyYXkoYWxsRmllbGRzLCB0cnVlKSkge1xuICAgICAgICBhbGxGaWVsZHMubWFwKChmaWVsZDogYW55KSA9PiB7XG5cbiAgICAgICAgICBjb25zdCBuYW1lID0gZmllbGQubW9kZWwgPyBmaWVsZC5tb2RlbC5uYW1lIDogZmllbGQubmFtZTtcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZyhuYW1lLCBmaWVsZC5vbkxvYWQpO1xuICAgICAgICAgIGlmICgrY29yZS5lbnRpdHkuc2NoZW1lX2lkICYmICEoSXNPYmplY3QoY29yZS5lbnRpdHkuc2NoZW1lX2Fzc2V0cykpKSBjb3JlLmVudGl0eS5zY2hlbWVfYXNzZXRzID0ge307XG4gICAgICAgICAgY29uc3QgY3VzdG9tRmllbGRBc3NldExvY2F0aW9uID0gK2NvcmUuZW50aXR5LnNjaGVtZV9pZCAmJiBJc09iamVjdChjb3JlLmVudGl0eS5zY2hlbWVfYXNzZXRzLCBmYWxzZSkgPyBjb3JlLmVudGl0eS5zY2hlbWVfYXNzZXRzIDogY29yZS5lbnRpdHk7XG4gICAgICAgICAgaWYgKElzT2JqZWN0KGZpZWxkLCB0cnVlKSAmJiBuYW1lKSB7XG4gICAgICAgICAgICBpZiAoZmllbGQud2hlbikge1xuICAgICAgICAgICAgICBpZiAoSXNTdHJpbmcoZmllbGQud2hlbikpIGZpZWxkLndoZW4gPSBbZmllbGQud2hlbl07XG4gICAgICAgICAgICAgIGZpZWxkLmhpZGRlbiA9ICFFdmFsdWF0ZVdoZW5Db25kaXRpb25zKGNvcmUsIGZpZWxkLndoZW4sIGNvcmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKElzT2JqZWN0KGZpZWxkLCBbJ2ZpZWxkZ3JvdXAnXSkgJiYgbmFtZSBpbiBjdXN0b21GaWVsZEFzc2V0TG9jYXRpb24pIHtcbiAgICAgICAgICAgICAgY29yZUZpZWxkID0gdGhpcy5idWlsZEN1c3RvbUZpZWxkKGNvcmUsIGZpZWxkKTtcbiAgICAgICAgICAgICAgaWYgKGNvcmVGaWVsZCkge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudCA9IDxEeW5hbWljQ29tcG9uZW50SW50ZXJmYWNlPntcbiAgICAgICAgICAgICAgICAgIHR5cGU6IFBvcEVudGl0eUZpZWxkQ29tcG9uZW50LFxuICAgICAgICAgICAgICAgICAgaW5wdXRzOiA8RGljdGlvbmFyeTxudW1iZXIgfCBzdHJpbmcgfCBib29sZWFuIHwgb2JqZWN0IHwgYW55W10+PkNsZWFuT2JqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgY29yZTogY29yZSxcbiAgICAgICAgICAgICAgICAgICAgZmllbGQ6IG5ldyBGaWVsZENvbmZpZyhjb3JlRmllbGQpLFxuICAgICAgICAgICAgICAgICAgICBoaWRkZW46IGZpZWxkLmhpZGRlbiA/IDEgOiAwLFxuICAgICAgICAgICAgICAgICAgICB3aGVuOiBmaWVsZC53aGVuLFxuICAgICAgICAgICAgICAgICAgICBvbkxvYWQ6IGZpZWxkLm9uTG9hZCxcbiAgICAgICAgICAgICAgICAgICAgb25FdmVudDogZmllbGQub25FdmVudCxcbiAgICAgICAgICAgICAgICAgICAgb25VbmxvYWQ6IGZpZWxkLm9uVW5sb2FkLFxuICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICBjdXN0b206IHRydWUsXG4gICAgICAgICAgICAgICAgICBwb3NpdGlvbjogZmllbGQucG9zaXRpb24gPyBmaWVsZC5wb3NpdGlvbiA6IDEsXG4gICAgICAgICAgICAgICAgICBhbmNpbGxhcnk6IGZpZWxkLmFuY2lsbGFyeSxcbiAgICAgICAgICAgICAgICAgIHNvcnQ6IGZpZWxkLnNvcnQsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBkb20udWkuZmllbGRzLnNldCgrZmllbGQuaWQsIGNvbXBvbmVudCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgLy8gfWVsc2UgaWYoIElzT2JqZWN0KCBmaWVsZCwgWyAnbW9kZWwnIF0gKSAmJiBuYW1lIGluIGNvcmUuZW50aXR5ICl7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKElzT2JqZWN0KGZpZWxkLCBbJ21vZGVsJ10pICYmICgobmFtZSBpbiBjb3JlLmVudGl0eSkgfHwgZmllbGQucHJlc2VydmUpKSB7XG4gICAgICAgICAgICAgIGZpZWxkLm1vZGVsLnZpZXcgPSB7bmFtZTogZmllbGQubW9kZWwuZm9ybX07XG4gICAgICAgICAgICAgIGlmIChmaWVsZC5tb2RlbC50cmFuc2Zvcm1hdGlvbikgZmllbGQubW9kZWwudmFsdWUgPSB0aGlzLl9nZXRNb2RlbFZhbHVlKGNvcmUsIGZpZWxkLCBmaWVsZC5tb2RlbCk7XG4gICAgICAgICAgICAgIGNvbnN0IG1vZGVsID0gRmllbGRJdGVtTW9kZWwoY29yZSwgZmllbGQubW9kZWwpO1xuXG4gICAgICAgICAgICAgIGNvbnN0IGNvcmVJdGVtID0ge1xuICAgICAgICAgICAgICAgIG1vZGVsOiBtb2RlbCxcbiAgICAgICAgICAgICAgICB0YWJsZTogSXNPYmplY3QoZmllbGQudGFibGUsIHRydWUpID8gZmllbGQudGFibGUgOiB7c29ydDogOTksIHZpc2libGU6IGZhbHNlfSxcbiAgICAgICAgICAgICAgICBjb21wb25lbnQ6IHRoaXMuX2dldEZvcm1Db21wb25lbnQoZmllbGQubW9kZWwudmlldy5uYW1lKSxcbiAgICAgICAgICAgICAgICBjb25maWc6IEZpZWxkSXRlbU1vZGVsQ29uZmlnKGNvcmUsIG1vZGVsKVxuICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgIGlmIChjb3JlSXRlbSAmJiBjb3JlSXRlbS5jb25maWcpIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNvcmVJdGVtLmNvbmZpZy5zZXRDb250cm9sID09PSAnZnVuY3Rpb24nKSBjb3JlSXRlbS5jb25maWcuc2V0Q29udHJvbCgpOyAvLyBidWlsZCB0aGUgY29udHJvbCBub3cgc28gdGhhdCB0aGUgY29udHJvbCBjYW4gYmUgdGhlIGRlZmFjdG8gc2Vzc2lvbiB2YWx1ZVxuICAgICAgICAgICAgICAgIGNvbXBvbmVudCA9IDxEeW5hbWljQ29tcG9uZW50SW50ZXJmYWNlPntcbiAgICAgICAgICAgICAgICAgIHR5cGU6IGNvcmVJdGVtLmNvbXBvbmVudCxcbiAgICAgICAgICAgICAgICAgIGlucHV0czogPERpY3Rpb25hcnk8bnVtYmVyIHwgc3RyaW5nIHwgYm9vbGVhbiB8IG9iamVjdCB8IGFueVtdPj5DbGVhbk9iamVjdCh7XG4gICAgICAgICAgICAgICAgICAgIGNvcmU6IGNvcmUsXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZzogY29yZUl0ZW0uY29uZmlnLFxuICAgICAgICAgICAgICAgICAgICBoaWRkZW46IGZpZWxkLmhpZGRlbiA/IDEgOiAwLFxuICAgICAgICAgICAgICAgICAgICB3aGVuOiBmaWVsZC53aGVuLFxuICAgICAgICAgICAgICAgICAgICBvbkxvYWQ6IGZpZWxkLm9uTG9hZCxcbiAgICAgICAgICAgICAgICAgICAgb25FdmVudDogZmllbGQub25FdmVudCxcbiAgICAgICAgICAgICAgICAgICAgb25VbmxvYWQ6IGZpZWxkLm9uVW5sb2FkLFxuICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICBjdXN0b206IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgcG9zaXRpb246IGZpZWxkLnBvc2l0aW9uID8gZmllbGQucG9zaXRpb24gOiAxLFxuICAgICAgICAgICAgICAgICAgYW5jaWxsYXJ5OiBmaWVsZC5hbmNpbGxhcnkgPyB0cnVlIDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICB3aGVuOiBJc0FycmF5KGZpZWxkLndoZW4sIHRydWUpID8gZmllbGQud2hlbiA6IG51bGwsXG4gICAgICAgICAgICAgICAgICBzb3J0OiBmaWVsZC5zb3J0ID8gZmllbGQuc29ydCA6IDk5LFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgZG9tLnVpLmZpZWxkcy5zZXQoY29yZUl0ZW0ubW9kZWwubmFtZSwgY29tcG9uZW50KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICB9KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEEgbWV0aG9kIHRoYXQgYnVpbGRzIGVudGl0eSBmaWVsZHNldCBmcm9tIHRoZSBzZXJ2ZXIgbW9kZWxzXG4gICAqIEBwYXJhbSBlbnRpdHlDb25maWdcbiAgICogQHBhcmFtIGZpZWxkUG9zaXRpb25cbiAgICovXG4gIGdldERvbUZpZWxkcyhmaWVsZFBvc2l0aW9uOiBudW1iZXIgPSAxLCBkb206IFBvcERvbVNlcnZpY2UpIHsgLy8gYSBmaWVsZCBpcyB3cmFwcGVyIGFyb3VuZCBmaWVsZCBpdGVtc1xuICAgIGNvbnN0IGNvbXBvbmVudExpc3QgPSBbXTtcbiAgICBkb20udWkuZmllbGRzLmZvckVhY2goKGNvbXBvbmVudDogRHluYW1pY0NvbXBvbmVudEludGVyZmFjZSwga2V5OiBudW1iZXIgfCBzdHJpbmcpID0+IHtcbiAgICAgIGlmICghY29tcG9uZW50LmFuY2lsbGFyeSAmJiBjb21wb25lbnQucG9zaXRpb24gPT09IGZpZWxkUG9zaXRpb24pIHtcbiAgICAgICAgY29tcG9uZW50TGlzdC5wdXNoKGNvbXBvbmVudCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGNvbXBvbmVudExpc3Q7XG4gIH1cblxuXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVW5kZXIgVGhlIEhvb2QgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBQcml2YXRlIE1ldGhvZCApICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4gIC8qKlxuICAgKiBMb29wIHRocm91Z2ggdGhlIGRhdGEgZm9yIHRoZSBlbnRpdHkgYW5kIGlkZW50aWZ5IHdoYXQgcmVmZXJzIHRvIGN1c3RvbSBmaWVsZHNcbiAgICogUmV0cmlldmUgdGhlIGZpZWxkIGRhdGEgZm9yIGVhY2ggb2YgdGhlIGN1c3RvbSBmaWVsZHMgdGhhdCBleGlzdFxuICAgKiBAcGFyYW0gY29yZVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcHJpdmF0ZSBfZ2V0RW50aXR5Q3VzdG9tRmllbGRzKGNvcmU6IENvcmVDb25maWcpOiBQcm9taXNlPERpY3Rpb25hcnk8RmllbGRJbnRlcmZhY2U+PiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPERpY3Rpb25hcnk8RmllbGRJbnRlcmZhY2U+Pihhc3luYyAocmVzb2x2ZSkgPT4ge1xuICAgICAgY29uc3QgdG1wID0ge307XG4gICAgICBjb25zdCBjdXN0b21GaWVsZHMgPSA8RGljdGlvbmFyeTxGaWVsZEludGVyZmFjZT4+e307XG5cbiAgICAgIGlmIChjb3JlICYmIGNvcmUucGFyYW1zLmNhbl9leHRlbmQpIHtcblxuICAgICAgICBpZiAoSXNPYmplY3QoY29yZS5lbnRpdHkpKSB7XG4gICAgICAgICAgT2JqZWN0LmtleXMoY29yZS5lbnRpdHkpLm1hcCgoa2V5OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIGlmIChJc09iamVjdChjb3JlLmVudGl0eVtrZXldLCBbJ0BtZXRhZGF0YSddKSkge1xuICAgICAgICAgICAgICB0bXBba2V5XSA9IGNvcmUuZW50aXR5W2tleV07XG4gICAgICAgICAgICB9IGVsc2UgaWYgKElzQXJyYXkoY29yZS5lbnRpdHlba2V5XSwgdHJ1ZSkgJiYgSXNPYmplY3QoY29yZS5lbnRpdHlba2V5XVswXSwgWydAbWV0YWRhdGEnXSkpIHtcbiAgICAgICAgICAgICAgdG1wW2tleV0gPSBjb3JlLmVudGl0eVtrZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmICgrY29yZS5lbnRpdHkuc2NoZW1lX2lkICYmIElzT2JqZWN0KGNvcmUuZW50aXR5LnNjaGVtZV9hc3NldHMsIHRydWUpKSB7XG4gICAgICAgICAgT2JqZWN0LmtleXMoY29yZS5lbnRpdHkuc2NoZW1lX2Fzc2V0cykubWFwKChrZXk6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgaWYgKElzT2JqZWN0KGNvcmUuZW50aXR5LnNjaGVtZV9hc3NldHNba2V5XSwgWydAbWV0YWRhdGEnXSkpIHtcbiAgICAgICAgICAgICAgdG1wW2tleV0gPSBjb3JlLmVudGl0eS5zY2hlbWVfYXNzZXRzW2tleV07XG4gICAgICAgICAgICB9IGVsc2UgaWYgKElzQXJyYXkoY29yZS5lbnRpdHkuc2NoZW1lX2Fzc2V0c1trZXldLCB0cnVlKSAmJiBJc09iamVjdChjb3JlLmVudGl0eS5zY2hlbWVfYXNzZXRzW2tleV1bMF0sIFsnQG1ldGFkYXRhJ10pKSB7XG4gICAgICAgICAgICAgIHRtcFtrZXldID0gY29yZS5lbnRpdHkuc2NoZW1lX2Fzc2V0c1trZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJlcXVlc3RzID0gW107XG4gICAgICAgIGNvbnN0IG5hbWVzID0gW107XG4gICAgICAgIGxldCBmaWVsZElkO1xuICAgICAgICBjb25zdCBmaWVsZFJlcG8gPSBhd2FpdCBQb3BFbnRpdHkuZ2V0RW50aXR5UmVwbygnZmllbGQnKTtcbiAgICAgICAgT2JqZWN0LmtleXModG1wKS5tYXAoKG5hbWUpID0+IHtcbiAgICAgICAgICBpZiAoSXNPYmplY3QodG1wW25hbWVdKSkgeyAvLyBmaWVsZCBvbmx5IGhhcyBhIHNpbmdsZSB2YWx1ZVxuXG4gICAgICAgICAgICBpZiAoSXNPYmplY3QodG1wW25hbWVdWydAbWV0YWRhdGEnXSwgWydAZmllbGRfaWQnXSkpIHtcbiAgICAgICAgICAgICAgY29uc3QgcmVjb3JkID0gdG1wW25hbWVdO1xuICAgICAgICAgICAgICBjb25zdCBtZXRhZGF0YSA9IHJlY29yZFsnQG1ldGFkYXRhJ107XG4gICAgICAgICAgICAgIC8vIGRlbGV0ZSByZWNvcmRbICdAbWV0YWRhdGEnIF07XG4gICAgICAgICAgICAgIGZpZWxkSWQgPSBtZXRhZGF0YVsnQGZpZWxkX2lkJ107XG4gICAgICAgICAgICAgIHRtcFtuYW1lXSA9IFtyZWNvcmRdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAoSXNBcnJheSh0bXBbbmFtZV0sIHRydWUpKSB7IC8vIGZpZWxkIGhhcyBtdWx0aXBsZSB2YWx1ZXNcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBbXTtcbiAgICAgICAgICAgIGNvbnN0IGZpcnN0UmVjb3JkID0gdG1wW25hbWVdWzBdO1xuICAgICAgICAgICAgZmllbGRJZCA9IGZpcnN0UmVjb3JkWydAbWV0YWRhdGEnXVsnQGZpZWxkX2lkJ107XG4gICAgICAgICAgICAvLyB0bXBbIG5hbWUgXS5tYXAoKHJlY29yZCwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIC8vICAgLy8gY29uc3QgZGF0YUtleSA9IGZpZWxkX2VudHJ5X2lkID8gZmllbGRfZW50cnlfaWQgOiAoIG1ldGFkYXRhMlsgJ0ByZWNvcmRfaWQnIF0gPyArbWV0YWRhdGEyWyAnQHJlY29yZF9pZCcgXSA6IGluZGV4ICk7XG4gICAgICAgICAgICAvLyAgIGRlbGV0ZSByZWNvcmRbICdAbWV0YWRhdGEnIF07XG4gICAgICAgICAgICAvLyAgIGRhdGEucHVzaChyZWNvcmQpO1xuICAgICAgICAgICAgLy8gfSk7XG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gdG1wWyBuYW1lIF0gPSBkYXRhO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoK2ZpZWxkSWQpIHtcbiAgICAgICAgICAgIG5hbWVzLnB1c2gobmFtZSk7XG4gICAgICAgICAgICByZXF1ZXN0cy5wdXNoKHRoaXMuY2FjaGUuZ2V0KCdjdXN0b21fZmllbGQnLCBTdHJpbmcoZmllbGRJZCksIGZpZWxkUmVwby5nZXRFbnRpdHkoZmllbGRJZCkpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAocmVxdWVzdHMubGVuZ3RoKSB7XG4gICAgICAgICAgZm9ya0pvaW4ocmVxdWVzdHMpLnN1YnNjcmliZSgocmVzdWx0cykgPT4ge1xuICAgICAgICAgICAgcmVzdWx0cy5tYXAoYXN5bmMgKHJlc3VsdDogYW55LCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICAgIGlmIChJc0RlZmluZWQocmVzdWx0LCBmYWxzZSkpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBHZXRIdHRwUmVzdWx0KHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgY29uc3QgZmllbGROYW1lID0gbmFtZXNbaW5kZXhdO1xuICAgICAgICAgICAgICAgIHJlc3VsdC5uYW1lID0gZmllbGROYW1lO1xuICAgICAgICAgICAgICAgIHJlc3VsdC5kYXRhID0gZmllbGROYW1lIGluIHRtcCA/IHRtcFtmaWVsZE5hbWVdIDoge307XG4gICAgICAgICAgICAgICAgY29uc3QgY3VzdG9tRmllbGQgPSBhd2FpdCB0aGlzLl9zZXRGaWVsZEVudHJpZXMocmVzdWx0KTtcbiAgICAgICAgICAgICAgICBjb25zdCBmaWVsZCA9IGF3YWl0IHRoaXMuX3NldEVudGl0eUN1c3RvbUZpZWxkRGF0YVN0cnVjdHVyZShjdXN0b21GaWVsZCk7XG4gICAgICAgICAgICAgICAgY3VzdG9tRmllbGRzW2ZpZWxkTmFtZV0gPSBmaWVsZDtcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggPT09IChyZXN1bHRzLmxlbmd0aCAtIDEpKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gcmVzb2x2ZShjdXN0b21GaWVsZHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggPT09IChyZXN1bHRzLmxlbmd0aCAtIDEpKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gcmVzb2x2ZShjdXN0b21GaWVsZHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSwgKGVycikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoY3VzdG9tRmllbGRzKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZShjdXN0b21GaWVsZHMpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcmVzb2x2ZShjdXN0b21GaWVsZHMpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cblxuICBjbGVhckN1c3RvbUZpZWxkQ2FjaGUoZmllbGRJZDogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5jYWNoZS5jbGVhcignY3VzdG9tX2ZpZWxkJywgU3RyaW5nKGZpZWxkSWQpKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEZpZWxkIEVudHJpZXMgYXJlIGEgd2F5IHRvIGRlZmluZSB0aGUgdmFsdWUgc3RydWN0dXJlIG9mIGEgZmllbGRcbiAgICogQnkgZGVmYXVsdCBhIGZpZWxkIHdpbGwgaGF2ZSBhIHNpbmdsZSB2YWx1ZSwgYnV0IGEgZmllbGQgY2FuIGJlIGNvbmZpZ3VyZWQgdG8gaGF2ZSBtdWx0aXBsZSB2YWx1ZXNcbiAgICogRmllbGQgZW50cmllcyBwcm92aWRlIGEgdGVtcGxhdGUgb2YgYSBzcGVjaWZpYyBhbW91bnQgb2YgdmFsdWVzIGEgZmllbGQgc2hvdWxkIGhhdmVcbiAgICogQHBhcmFtIGZpZWxkXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBwcml2YXRlIF9zZXRGaWVsZEVudHJpZXMoZmllbGQ6IEZpZWxkSW50ZXJmYWNlKTogUHJvbWlzZTxGaWVsZEludGVyZmFjZT4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxGaWVsZEludGVyZmFjZT4oYXN5bmMgKHJlc29sdmUpID0+IHtcbiAgICAgIC8vIGlmKCBJc09iamVjdCggZmllbGQsIFsgJ2RhdGEnIF0gKSAmJiBJc0FycmF5KCBmaWVsZC5kYXRhICkgKXtcbiAgICAgIC8vICAgLy8gY29uc29sZS5sb2coJ2ZpZWxkJywgZmllbGQpO1xuICAgICAgLy8gICBsZXQgdmFsdWVzID0gZmllbGQuZGF0YS5sZW5ndGg7XG4gICAgICAvLyAgIGNvbnN0IGVudHJpZXMgPSBmaWVsZC5lbnRyaWVzLmZpbHRlciggKCB4ICkgPT4geC50eXBlICE9PSAnY3VzdG9tJyApLmxlbmd0aDtcbiAgICAgIC8vICAgbGV0IGVudHJpZXNOZWVkZWQgPSAwO1xuICAgICAgLy8gICBpZiggZW50cmllcyA8IHZhbHVlcyApe1xuICAgICAgLy8gICAgIGVudHJpZXNOZWVkZWQgPSArdmFsdWVzIC0gK2VudHJpZXM7XG4gICAgICAvLyAgIH1cbiAgICAgIC8vXG4gICAgICAvLyAgIGNvbnN0IHJlcXVlc3RzID0gW107XG4gICAgICAvLyAgIGxldCBsaW1pdCA9IDEwMDtcbiAgICAgIC8vICAgd2hpbGUoIGVudHJpZXNOZWVkZWQgPiAwICYmIGxpbWl0ICl7XG4gICAgICAvLyAgICAgbGltaXQtLTtcbiAgICAgIC8vICAgICB2YWx1ZXMrKztcbiAgICAgIC8vICAgICByZXF1ZXN0cy5wdXNoKCBQb3BSZXF1ZXN0LmRvUG9zdCggYGZpZWxkcy8ke2ZpZWxkLmlkfS9lbnRyaWVzYCwge1xuICAgICAgLy8gICAgICAgbmFtZTogVGl0bGVDYXNlKCBgJHtmaWVsZC5maWVsZGdyb3VwLm5hbWV9ICR7dmFsdWVzfWAgKSxcbiAgICAgIC8vICAgICAgIHR5cGU6ICdwcm92aWRlZCdcbiAgICAgIC8vICAgICB9LCAxLCBmYWxzZSApICk7XG4gICAgICAvLyAgICAgZW50cmllc05lZWRlZC0tO1xuICAgICAgLy8gICB9XG4gICAgICAvLyAgIGlmKCByZXF1ZXN0cy5sZW5ndGggKXtcbiAgICAgIC8vICAgICBmb3JrSm9pbiggcmVxdWVzdHMgKS5zdWJzY3JpYmUoICggcmVzdWx0cyApID0+IHtcbiAgICAgIC8vICAgICAgIHJlc3VsdHMubWFwKCAoIHJlc3VsdDogYW55LCBpbmRleDogbnVtYmVyICkgPT4ge1xuICAgICAgLy8gICAgICAgICBpZiggcmVzdWx0LmRhdGEgKSByZXN1bHQgPSByZXN1bHQuZGF0YTtcbiAgICAgIC8vICAgICAgICAgZmllbGQuZW50cmllcy5wdXNoKCByZXN1bHQgKTtcbiAgICAgIC8vICAgICAgIH0gKTtcbiAgICAgIC8vICAgICAgIHJldHVybiByZXNvbHZlKCBmaWVsZCApO1xuICAgICAgLy8gICAgIH0sICgpID0+IHtcbiAgICAgIC8vICAgICAgIHJldHVybiByZXNvbHZlKCBmaWVsZCApO1xuICAgICAgLy8gICAgIH0gKTtcbiAgICAgIC8vXG4gICAgICAvLyAgIH1lbHNle1xuICAgICAgLy8gICAgIHJldHVybiByZXNvbHZlKCBmaWVsZCApO1xuICAgICAgLy8gICB9XG4gICAgICAvLyB9ZWxzZXtcbiAgICAgIC8vICAgcmV0dXJuIHJlc29sdmUoIGZpZWxkICk7XG4gICAgICAvLyB9XG5cbiAgICAgIHJldHVybiByZXNvbHZlKGZpZWxkKTtcblxuICAgIH0pO1xuICB9XG5cblxuICAvKipcbiAgICogRmllbGQgZGF0YSBzaG91bGQgY29tZSBpbiBhcyBhbiBhcnJheSBvZiByZWNvcmRzXG4gICAqIEVuc3VyZSB0aGF0IGVhY2ggZWFjaCByZWNvcmQgaGFzIGEgdW5pcXVlIGVudHJ5IGlkLCBhbmQgaW5kZXggZGF0YSBieSBmaWVsZF9lbnRyeV9pZDtcbiAgICogQHBhcmFtIGN1c3RvbUZpZWxkXG4gICAqL1xuICBwcml2YXRlIF9zZXRFbnRpdHlDdXN0b21GaWVsZERhdGFTdHJ1Y3R1cmUoY3VzdG9tRmllbGQ6IEZpZWxkSW50ZXJmYWNlKTogUHJvbWlzZTxGaWVsZEludGVyZmFjZT4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxGaWVsZEludGVyZmFjZT4oKHJlc29sdmUpID0+IHtcbiAgICAgIGNvbnN0IGRhdGEgPSB7fTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdjdXN0b21GaWVsZCcsIGN1c3RvbUZpZWxkKTtcbiAgICAgIGlmIChJc0FycmF5KGN1c3RvbUZpZWxkLmRhdGEsIHRydWUpKSB7XG4gICAgICAgIGlmIChJc0FycmF5KGN1c3RvbUZpZWxkLmVudHJpZXMsIHRydWUpKSB7XG4gICAgICAgICAgY3VzdG9tRmllbGQuZGF0YS5tYXAoKHJlY29yZCwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIGlmICghcmVjb3JkLmZpZWxkX2VudHJ5X2lkKSByZWNvcmQuZmllbGRfZW50cnlfaWQgPSBjdXN0b21GaWVsZC5lbnRyaWVzW2luZGV4XS5pZDtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiaXMgZGlmZiA/IFwiLCByZWNvcmQuZmllbGRfZW50cnlfaWQgLCAnIC0gJywgY3VzdG9tRmllbGQuZW50cmllc1tpbmRleF0uaWQpO1xuICAgICAgICAgICAgLy8gZGVsZXRlIHJlY29yZFsgJ0BtZXRhZGF0YScgXTtcbiAgICAgICAgICAgIGRhdGFbcmVjb3JkLmZpZWxkX2VudHJ5X2lkXSA9IHJlY29yZDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoSXNBcnJheShjdXN0b21GaWVsZC5lbnRyaWVzKSkge1xuICAgICAgICAgIGN1c3RvbUZpZWxkLmVudHJpZXMubWFwKChlbnRyeTogRmllbGRFbnRyeSkgPT4ge1xuICAgICAgICAgICAgZGF0YVtlbnRyeS5pZF0gPSB7fTtcbiAgICAgICAgICAgIGNvbnN0IGl0ZW1zID0gPGFueT5jdXN0b21GaWVsZC5pdGVtcztcbiAgICAgICAgICAgIGlmIChJc0FycmF5KGN1c3RvbUZpZWxkLml0ZW1zLCB0cnVlKSkge1xuICAgICAgICAgICAgICBpdGVtcy5tYXAoKGl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICBkYXRhW2VudHJ5LmlkXVtpdGVtLm5hbWVdID0gbnVsbDtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGN1c3RvbUZpZWxkLmRhdGEgPSBkYXRhO1xuXG4gICAgICByZXR1cm4gcmVzb2x2ZShjdXN0b21GaWVsZCk7XG4gICAgfSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHNldHRpbmdzIHRoYXQgc2hvdWxkIGJlIGFwcGxpZWQgb24gdGhpcyBmaWVsZCBpdGVtXG4gICAqIEBwYXJhbSBmaWVsZEl0ZW1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHByaXZhdGUgX2dldEZpZWxkSXRlbVNldHRpbmcoZmllbGRJdGVtOiBhbnkpIHtcbiAgICByZXR1cm4ge307XG4gIH1cblxuXG4gIC8qKlxuICAgKiBBIGZpZWxkIGVudHJ5IGlzIHVzZWQgdG8gaWRlbnRpdHkgYSBzcGVjaWZpYyB2YWx1ZSBpbiBhIHNldCBvZiBtdWx0aXBsZSB2YWx1ZXNcbiAgICogQHBhcmFtIGZpZWxkXG4gICAqIEBwYXJhbSBkYXRhS2V5XG4gICAqIEBwYXJhbSBpbmRleFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcHJpdmF0ZSBfZ2V0RmllbGRJdGVtRW50cnkoZmllbGQ6IEZpZWxkSW50ZXJmYWNlLCBkYXRhS2V5OiBudW1iZXIsIGluZGV4OiBudW1iZXIpOiBGaWVsZEVudHJ5IHtcbiAgICBsZXQgZW50cnkgPSA8RmllbGRFbnRyeT57fTtcbiAgICBjb25zdCBkYXRhID0gZmllbGQuZGF0YVtkYXRhS2V5XTtcblxuICAgIGlmIChJc0FycmF5KGZpZWxkLmVudHJpZXMsIHRydWUpKSB7XG4gICAgICBjb25zdCBjdXN0b21FbnRyaWVzID0gZmllbGQuZW50cmllcy5maWx0ZXIoKGl0ZW0pID0+IHtcbiAgICAgICAgcmV0dXJuIGl0ZW0udHlwZSAhPT0gJ2N1c3RvbSc7XG4gICAgICB9KTtcbiAgICAgIGNvbnN0IGN1c3RvbUlkTG9va3VwID0gQXJyYXlNYXBTZXR0ZXIoY3VzdG9tRW50cmllcywgJ2lkJyk7XG5cbiAgICAgIGNvbnN0IHByb3ZpZGVkRW50cmllcyA9IGZpZWxkLmVudHJpZXMuZmlsdGVyKChpdGVtKSA9PiB7XG4gICAgICAgIHJldHVybiBpdGVtLnR5cGUgIT09ICdjdXN0b20nO1xuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IGVudHJ5SW5kZXggPSBpbmRleCAlIHByb3ZpZGVkRW50cmllcy5sZW5ndGg7XG4gICAgICBjb25zdCBwcm92aWRlZElkTG9va3VwID0gQXJyYXlNYXBTZXR0ZXIocHJvdmlkZWRFbnRyaWVzLCAnaWQnKTtcbiAgICAgIGlmIChkYXRhLmZpZWxkX2VudHJ5X2lkICYmIGRhdGEuZmllbGRfZW50cnlfaWQgaW4gcHJvdmlkZWRJZExvb2t1cCkge1xuICAgICAgICBlbnRyeSA9IHByb3ZpZGVkRW50cmllc1twcm92aWRlZElkTG9va3VwW2RhdGEuZmllbGRfZW50cnlfaWRdXTtcbiAgICAgIH0gZWxzZSBpZiAoZGF0YS5maWVsZF9lbnRyeV9pZCAmJiBkYXRhLmZpZWxkX2VudHJ5X2lkIGluIGN1c3RvbUlkTG9va3VwKSB7XG4gICAgICAgIGVudHJ5ID0gY3VzdG9tRW50cmllc1tjdXN0b21JZExvb2t1cFtkYXRhLmZpZWxkX2VudHJ5X2lkXV07XG4gICAgICAgIC8vIFRvRG86OiBGaW5kIHRoZSBjdXRzdG9tIGxhYmVsIHRoYXQgc2hvdWxkIGJlIGluc2VydGVkIGhlcmVcbiAgICAgIH0gZWxzZSBpZiAoZW50cnlJbmRleCBpbiBmaWVsZC5lbnRyaWVzKSB7XG4gICAgICAgIGVudHJ5ID0gcHJvdmlkZWRFbnRyaWVzW2VudHJ5SW5kZXhdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZW50cnkgPSBwcm92aWRlZEVudHJpZXNbMF07XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGVudHJ5ID0gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIGVudHJ5O1xuICB9XG5cblxuICAvKipcbiAgICogTWFwIHRoZSBmb3JtIGluIGEgZmllbGQgbW9kZWwgdG8gdGhlIGFuZ3VsYXIgY29tcG9uZW50IHRoYXQgd2lsbCBiZSB1c2VkIHRvIHJlbmRlciB0aGUgZmllbGRcbiAgICogQHBhcmFtIGZvcm1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHByaXZhdGUgX2dldEZvcm1Db21wb25lbnQoZm9ybTogc3RyaW5nKSB7XG4gICAgbGV0IGNvbXBvbmVudCA9IG51bGw7XG4gICAgaWYgKElzU3RyaW5nKGZvcm0sIHRydWUpKSB7XG4gICAgICBzd2l0Y2ggKFN0cmluZyhmb3JtKS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICAgIGNhc2UgJ3NpZGVieXNpZGUnOlxuICAgICAgICAgIGNvbXBvbmVudCA9IFBvcFNpZGVCeVNpZGVDb21wb25lbnQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3NlbGVjdCc6XG4gICAgICAgICAgY29tcG9uZW50ID0gUG9wU2VsZWN0Q29tcG9uZW50O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdzZWxlY3QtZmlsdGVyJzpcbiAgICAgICAgICBjb21wb25lbnQgPSBQb3BTZWxlY3RGaWx0ZXJDb21wb25lbnQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3NlbGVjdC1saXN0JzpcbiAgICAgICAgICBjb21wb25lbnQgPSBQb3BTZWxlY3RMaXN0Q29tcG9uZW50O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdzZWxlY3QtbXVsdGknOlxuICAgICAgICBjYXNlICdzZWxlY3RfbXVsdGknOlxuICAgICAgICAgIGNvbXBvbmVudCA9IFBvcFNlbGVjdE11bHRpQ29tcG9uZW50O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdzZWxlY3QtbW9kYWwnOlxuICAgICAgICAgIGNvbXBvbmVudCA9IFBvcFNlbGVjdE1vZGFsQ29tcG9uZW50O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICd0ZXh0JzpcbiAgICAgICAgY2FzZSAnaW5wdXQnOlxuICAgICAgICAgIGNvbXBvbmVudCA9IFBvcElucHV0Q29tcG9uZW50O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICd0ZXh0c3RyaW5nJzpcbiAgICAgICAgICBjb21wb25lbnQgPSBQb3BUZXh0Q29tcG9uZW50O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdudW1iZXInOlxuICAgICAgICAgIGNvbXBvbmVudCA9IFBvcE51bWJlckNvbXBvbmVudDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZGF0ZSc6XG4gICAgICAgICAgY29tcG9uZW50ID0gUG9wRGF0ZUNvbXBvbmVudDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZGF0ZXBpY2tlcic6XG4gICAgICAgICAgY29tcG9uZW50ID0gUG9wRGF0ZVBpY2tlckNvbXBvbmVudDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAndGltZSc6XG4gICAgICAgICAgY29tcG9uZW50ID0gUG9wVGltZUNvbXBvbmVudDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnY2hlY2tib3gnOlxuICAgICAgICAgIGNvbXBvbmVudCA9IFBvcENoZWNrYm94Q29tcG9uZW50O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdzd2l0Y2gnOlxuICAgICAgICAgIGNvbXBvbmVudCA9IFBvcFN3aXRjaENvbXBvbmVudDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnbWlubWF4JzpcbiAgICAgICAgICBjb21wb25lbnQgPSBQb3BNaW5NYXhDb21wb25lbnQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3JhZGlvJzpcbiAgICAgICAgICBjb21wb25lbnQgPSBQb3BSYWRpb0NvbXBvbmVudDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAndGV4dGFyZWEnOlxuICAgICAgICAgIGNvbXBvbmVudCA9IFBvcFRleHRhcmVhQ29tcG9uZW50O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdsYWJlbCc6XG4gICAgICAgICAgY29tcG9uZW50ID0gUG9wTGFiZWxDb21wb25lbnQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2J1dHRvbic6XG4gICAgICAgICAgY29tcG9uZW50ID0gUG9wQnV0dG9uQ29tcG9uZW50O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIFBvcExvZy53YXJuKHRoaXMubmFtZSwgYF9nZXRGb3JtQ29tcG9uZW50OiBmYWlsYCwgZm9ybSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjb21wb25lbnQ7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBSZXNvbHZlIHRoZSB2YWx1ZSB0aGF0IGxpbmVzIHVwIHdpdGggdGhlIGNvbHVtbi9uYW1lIG9mIHRoZSBmaWVsZCBpdGVtIGZyb20gdGhlIGRhdGEgc2V0XG4gICAqIFRoZSBpZGVhIGhlcmUgaXMgdGhhdCBhIHZhbHVlIG1heSBoYXZlIGFscmVhZHkgY3JlYXRlZCBmb3IgdGhpcyBmaWVsZCBpdGVtIGFuZCB3ZSBuZWVkIHRvIG1ha2Ugc3VyZSB0aGUgZmllbGQgaXRlbSBpbml0aWFsaXplcyB3aXRoIHRoZSB2YWx1ZVxuICAgKiBAcGFyYW0gY29yZVxuICAgKiBAcGFyYW0gZmllbGRcbiAgICogQHBhcmFtIG1vZGVsXG4gICAqIEBwYXJhbSBkYXRhS2V5XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBwcml2YXRlIF9nZXRNb2RlbFZhbHVlKGNvcmU6IENvcmVDb25maWcsIGZpZWxkOiBGaWVsZEludGVyZmFjZSwgbW9kZWw6IEZpZWxkSXRlbU1vZGVsSW50ZXJmYWNlLCBkYXRhS2V5PzogbnVtYmVyKSB7XG4gICAgbGV0IHZhbHVlID0gbnVsbDtcbiAgICBpZiAoZGF0YUtleSkge1xuICAgICAgaWYgKElzT2JqZWN0KGZpZWxkLmRhdGEsIHRydWUpICYmIElzT2JqZWN0KG1vZGVsLCB0cnVlKSkge1xuICAgICAgICBpZiAoZGF0YUtleSBpbiBmaWVsZC5kYXRhICYmIG1vZGVsLm5hbWUgaW4gZmllbGQuZGF0YVtkYXRhS2V5XSkge1xuICAgICAgICAgIHZhbHVlID0gZmllbGQuZGF0YVtkYXRhS2V5XVttb2RlbC5uYW1lXTtcbiAgICAgICAgICBpZiAobW9kZWwudHJhbnNmb3JtYXRpb24pIHZhbHVlID0gUG9wUGlwZS50cmFuc2Zvcm0odmFsdWUsIG1vZGVsLnRyYW5zZm9ybWF0aW9uLCBjb3JlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAobW9kZWwubmFtZSBpbiBjb3JlLmVudGl0eSkge1xuICAgICAgdmFsdWUgPSBjb3JlLmVudGl0eVttb2RlbC5uYW1lXTtcblxuICAgICAgaWYgKG1vZGVsLnRyYW5zZm9ybWF0aW9uKSB2YWx1ZSA9IFBvcFBpcGUudHJhbnNmb3JtKHZhbHVlLCBtb2RlbC50cmFuc2Zvcm1hdGlvbiwgY29yZSk7XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEdldCB0aGUgY3VzdG9tIGZpZWxkIHRlbXBsYXRlIHRoYXQgaXMgbWFkZSBmb3IgdGhlIGZpZWxkIGdyb3VwXG4gICAqIEBwYXJhbSBuYW1lXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBwcml2YXRlIF9nZXRFbnRpdHlGaWVsZENvbXBvbmVudChuYW1lOiBzdHJpbmcpIHtcbiAgICBsZXQgY29tcG9uZW50ID0gbnVsbDtcbiAgICBzd2l0Y2ggKFN0cmluZyhuYW1lKS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICBjYXNlICduYW1lJzpcbiAgICAgICAgY29tcG9uZW50ID0gUG9wRW50aXR5TmFtZUNvbXBvbmVudDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdlbWFpbCc6XG4gICAgICAgIGNvbXBvbmVudCA9IFBvcEVudGl0eUVtYWlsQ29tcG9uZW50O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3Bob25lJzpcbiAgICAgICAgY29tcG9uZW50ID0gUG9wRW50aXR5UGhvbmVDb21wb25lbnQ7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnYWRkcmVzcyc6XG4gICAgICAgIGNvbXBvbmVudCA9IFBvcEVudGl0eUFkZHJlc3NDb21wb25lbnQ7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnZGF0ZSc6XG4gICAgICBjYXNlICdkYXRldGltZSc6XG4gICAgICAgIGNvbXBvbmVudCA9IFBvcEVudGl0eURhdGV0aW1lQ29tcG9uZW50O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3RleHRmaWVsZCc6XG4gICAgICBjYXNlICdpbnB1dCc6XG4gICAgICAgIGNvbXBvbmVudCA9IFBvcEVudGl0eUlucHV0Q29tcG9uZW50O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3NlbGVjdGlvbic6XG4gICAgICBjYXNlICdzZWxlY3QnOlxuICAgICAgICBjb21wb25lbnQgPSBQb3BFbnRpdHlTZWxlY3RDb21wb25lbnQ7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnc2VsZWN0LW11bHRpJzpcbiAgICAgIGNhc2UgJ3NlbGVjdF9tdWx0aSc6XG4gICAgICBjYXNlICdtdWx0aV9zZWxlY3Rpb24nOlxuICAgICAgICBjb21wb25lbnQgPSBQb3BFbnRpdHlTZWxlY3RNdWx0aUNvbXBvbmVudDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdyYWRpbyc6XG4gICAgICAgIGNvbXBvbmVudCA9IFBvcEVudGl0eVJhZGlvQ29tcG9uZW50O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2NoZWNrYm94JzpcbiAgICAgICAgY29tcG9uZW50ID0gUG9wRW50aXR5Q2hlY2tib3hDb21wb25lbnQ7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAndG9nZ2xlJzpcbiAgICAgIGNhc2UgJ3N3aXRjaCc6XG4gICAgICAgIGNvbXBvbmVudCA9IFBvcEVudGl0eVN3aXRjaENvbXBvbmVudDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICd0ZXh0ZWRpdG9yJzpcbiAgICAgIGNhc2UgJ3RleHRhcmVhJzpcbiAgICAgICAgY29tcG9uZW50ID0gUG9wRW50aXR5VGV4dGFyZWFDb21wb25lbnQ7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDoge1xuICAgICAgICBQb3BMb2cud2Fybih0aGlzLm5hbWUsIGBfZ2V0RW50aXR5RmllbGRDb21wb25lbnQ6IGZhaWxgLCBuYW1lKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjb21wb25lbnQ7XG4gIH1cblxufVxuIl19