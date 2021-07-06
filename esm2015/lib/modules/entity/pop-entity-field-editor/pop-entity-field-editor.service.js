import { __awaiter } from "tslib";
import { Injectable } from '@angular/core';
import { PopExtendService } from '../../../services/pop-extend.service';
import { PopLog, PopRequest, } from '../../../pop-common.model';
import { ArrayMapSetter, CleanObject, ConvertArrayToOptionList, DynamicSort, GetHttpErrorMsg, GetHttpObjectResult, GetHttpResult, IsArray, IsDefined, IsObject, IsObjectThrowError, IsString, SnakeToPascal, StorageSetter, TitleCase } from '../../../pop-common-utility';
import { EntityFieldSetting } from '../pop-entity-field/pop-entity-field.setting';
import { PopSwitchComponent } from '../../base/pop-field-item/pop-switch/pop-switch.component';
import { SwitchConfig } from '../../base/pop-field-item/pop-switch/switch-config.model';
import { FieldItemRules, GetCustomFieldSettings, IsValidFieldPatchEvent } from '../pop-entity-utility';
import { PopSelectComponent } from '../../base/pop-field-item/pop-select/pop-select.component';
import { SelectConfig } from '../../base/pop-field-item/pop-select/select-config.model';
import { AddressFieldSetting } from '../pop-entity-field/pop-entity-address/address.setting';
import { EmailFieldSetting } from '../pop-entity-field/pop-entity-email/email.setting';
import { NameFieldSetting } from '../pop-entity-field/pop-entity-name/name.setting';
import { PhoneFieldSetting } from '../pop-entity-field/pop-entity-phone/phone.setting';
import { SelectMultiFieldSetting } from '../pop-entity-field/pop-entity-select-multi/select-mulit.setting';
import * as data from './MOCK_DATA.json';
import * as i0 from "@angular/core";
export class PopFieldEditorService extends PopExtendService {
    constructor() {
        super();
        this.name = 'PopFieldEditorService';
        this.asset = {
            data: data.default,
            core: undefined,
            field: undefined,
            viewParams: {
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
                        { value: 1, name: 'Option 1' },
                        { value: 2, name: 'Option 2' },
                        { value: 3, name: 'Option 3' },
                    ]
                },
                select_multi: {
                    enum: false,
                    defaultValue: [],
                    values: [
                        { value: 1, name: 'Option 1' },
                        { value: 2, name: 'Option 2' },
                        { value: 3, name: 'Option 3' },
                    ]
                },
                radio: {
                    enum: false,
                    defaultValue: 'yes',
                    values: [
                        { value: 'yes', name: 'Yes' },
                        { value: 'no', name: 'No' },
                    ]
                },
            },
            viewRequired: {
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
            viewIgnored: {
                address: {
                    street: 1,
                    u_s_state_id: 1
                },
            },
            viewTemplate: {
                selection: 1,
            },
            labelTypes: {
                defaultValue: 'provided',
                options: [{ value: 'provided', name: 'Provided' }, { value: 'custom', name: 'Custom' }],
            },
        };
    }
    /**
     * Register the field to make sure that any needed attributes are added
     * @param core
     * @param dom
     */
    register(core, dom, scheme) {
        return new Promise((resolve) => {
            if (IsObjectThrowError(core, ['entity'], `Invalid Core`) && IsObjectThrowError(core.entity, true, `Invalid Core`)) {
                this.asset.core = core;
                // console.log('field is ', core.entity);
                this.asset.core.entity.items.map((item) => {
                    FieldItemRules(item);
                });
                this._setFieldCustomSettings(core.entity);
                if (IsObject(core.entity.custom_setting, true)) {
                    if (!dom.ui.customSetting)
                        dom.ui.customSetting = {};
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
    getDefaultValues(internal_name) {
        let defaultValues = {};
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
                defaultValues = { value: null };
                break;
        }
        return defaultValues;
    }
    isSchemePrimaryField(scheme, field) {
        if (IsObject(scheme, ['id', 'mapping']) && IsObject(field, ['id', 'fieldgroup'])) {
            const primary = this.getSchemePrimary(scheme);
            const groupName = field.fieldgroup.name;
            if (groupName in primary && +primary[groupName] === +field.id) {
            }
        }
        return false;
    }
    isSchemeFieldItemDisabled(scheme, fieldId, itemId) {
        if (IsObject(scheme, ['id', 'mapping']) && +fieldId && +itemId) {
            const setting = this.getSchemeFieldItemMapping(scheme, fieldId, itemId);
            if (IsDefined(setting.active, false)) {
                return +setting.active === 1 ? false : true;
            }
        }
        return false;
    }
    isSchemeFieldEntryDisabled(scheme, fieldId, entryId) {
        if (IsObject(scheme, ['id', 'mapping']) && +fieldId && +entryId) {
            const setting = this.getSchemeFieldSetting(scheme, fieldId);
            return IsArray(setting.disabled_entries, true) && setting.disabled_entries.includes(entryId);
        }
        return false;
    }
    getSchemeFieldSetting(scheme, fieldId) {
        if (IsObject(scheme, true) && +fieldId) {
            this.ensureSchemeFieldMapping(scheme, fieldId);
            let storage = this.getSchemeFieldMapping(scheme);
            if (IsObject(storage, true)) {
                storage = StorageSetter(storage, [`field_${fieldId}`]);
                return storage;
            }
        }
        return null;
    }
    getSchemeFieldSection(scheme, fieldId, sectionName) {
        if (IsObject(scheme, true) && +fieldId) {
            const storage = this.getSchemeFieldSetting(scheme, fieldId);
            if (IsObject(storage)) {
                return StorageSetter(storage, [sectionName]);
            }
        }
        return null;
    }
    ensureSchemeFieldMapping(scheme, fieldId) {
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
    getSchemeFieldItemMapping(scheme, fieldId, itemId) {
        if (IsObject(scheme, true) && +fieldId && +itemId) {
            let storage = this.getSchemeFieldSetting(scheme, fieldId);
            if (IsObject(storage, true)) {
                if (!(IsObject(storage.item))) {
                    storage.item = {};
                }
                if (!(IsObject(storage.item[`item_${itemId}`]))) {
                    storage.item[`item_${itemId}`] = {};
                }
                storage = StorageSetter(storage, ['item', `item_${itemId}`]);
                return storage;
            }
        }
        return null;
    }
    getSchemeFieldItemSection(scheme, fieldId, itemId, sectionName) {
        if (IsObject(scheme, true) && +fieldId && +itemId && IsString(sectionName, true)) {
            const storage = this.getSchemeFieldItemMapping(scheme, fieldId, itemId);
            if (storage && IsString(sectionName, true)) {
                return StorageSetter(storage, [sectionName]);
            }
        }
        return null;
    }
    getFieldTraits(fieldGroupName) {
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
            Object.keys(setting).map((settingName) => {
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
    getSchemePrimary(scheme) {
        return StorageSetter(scheme, ['mapping', 'primary']);
    }
    getSchemeRequired(scheme) {
        return StorageSetter(scheme, ['mapping', 'required']);
    }
    getSchemeFieldMapping(scheme) {
        return StorageSetter(scheme, ['mapping', 'field']);
    }
    updateSchemeFieldMapping(scheme) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            if (IsObject(scheme, ['id'])) {
                const res = yield this._updateSchemeFieldMapping(scheme, 'field');
                return resolve(res);
            }
        }));
    }
    updateSchemePrimaryMapping(scheme) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            if (IsObject(scheme, ['id'])) {
                const res = yield this._updateSchemeFieldMapping(scheme, 'primary');
                return resolve(res);
            }
        }));
    }
    updateSchemeRequiredMapping(scheme) {
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
    getViewParams(key = null) {
        if (key && key in this.asset.viewParams) {
            return JSON.parse(JSON.stringify(this.asset.viewParams[key]));
        }
        return JSON.parse(JSON.stringify(this.asset.viewParams));
    }
    /**
     * Check what param options apply to a specific field
     * @param key
     */
    getViewMultiple(key = null) {
        if (key) {
            if (key in this.asset.viewMultiple) {
                return this.asset.viewMultiple[key];
            }
            else {
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
    getViewRequired(fieldGroupName, fieldItemName) {
        return fieldGroupName in this.asset.viewRequired && fieldItemName in this.asset.viewRequired[fieldGroupName];
    }
    /**
     * Check what fields items are ingnored under a fieldgroup type
     * @param fieldGroupName
     * @param fieldItemName
     */
    getViewIgnored(fieldGroupName, fieldItemName, scheme) {
        if (fieldGroupName in this.asset.viewIgnored && fieldItemName in this.asset.viewIgnored[fieldGroupName]) {
            return true;
        }
        return false;
    }
    /**
     * Get a set of default options to for a specific view , ie.. a radio, select need options
     * @param key
     */
    getViewOptions(key = null) {
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
    getCustomSettingComponent(core, field, setting, scheme) {
        let component;
        const hasAccess = core.access.can_update && !core.entity.system ? true : false;
        switch (String(setting.type).toLowerCase()) {
            case 'boolean':
                component = {
                    type: PopSwitchComponent,
                    inputs: {
                        core: core,
                        config: new SwitchConfig({
                            name: setting.name,
                            label: setting.label ? setting.label : TitleCase(SnakeToPascal(setting.name)),
                            helpText: setting.helpText ? setting.helpText : null,
                            value: typeof setting.value !== 'undefined' ? setting.value : setting.defaultValue,
                            facade: true,
                            disabled: !hasAccess,
                            metadata: {
                                setting: setting
                            },
                            patch: {
                                field: ``,
                                path: ``,
                                callback: (ignore, event) => {
                                    if (IsValidFieldPatchEvent(core, event)) {
                                        if (IsObject(scheme, true)) {
                                            const session = this.getSchemeFieldSection(scheme, +field.id, 'setting');
                                            if (IsObject(session)) {
                                                session[setting.name] = event.config.control.value;
                                                this._updateSchemeFieldMapping(scheme, 'field');
                                            }
                                        }
                                        else {
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
                component = {
                    type: PopSelectComponent,
                    inputs: {
                        core: core,
                        config: new SelectConfig({
                            name: setting.name,
                            label: setting.label ? setting.label : TitleCase(SnakeToPascal(setting.name)),
                            helpText: setting.helpText ? setting.helpText : null,
                            value: setting.value ? setting.value : setting.defaultValue,
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
                                callback: (core2, event) => {
                                    if (IsValidFieldPatchEvent(core, event)) {
                                        if (IsObject(scheme, true)) {
                                            const session = this.getSchemeFieldSection(scheme, +field.id, 'setting');
                                            if (IsObject(session)) {
                                                session[setting.name] = event.config.control.value;
                                                this._updateSchemeFieldMapping(scheme, 'field');
                                            }
                                        }
                                        else {
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
                component = {
                    type: PopSwitchComponent,
                    inputs: {
                        core: core,
                        config: new SwitchConfig({
                            name: setting.name,
                            label: setting.label ? setting.label : TitleCase(SnakeToPascal(setting.name)),
                            helpText: setting.helpText ? setting.helpText : null,
                            value: typeof setting.value !== 'undefined' ? setting.value : setting.defaultValue,
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
    storeCustomSetting(core, event) {
        return new Promise((resolve) => {
            // PopTemplate.buffer();
            PopLog.event(this.name, `storeCustomSetting`, event);
            const setting = event.config.metadata.setting;
            const body = {
                value: event.config.control.value
            };
            if (+setting.field_id)
                body.field_id = +setting.field_id;
            if (+setting.field_item_id)
                body.field_item_id = +setting.field_item_id;
            const fieldId = +setting.field_id ? +setting.field_id : core.entity.id;
            let request = undefined;
            if (setting.id) {
                request = PopRequest.doPatch(`apps/fields/${fieldId}/configs/${setting.id}`, body, 1, false);
            }
            else {
                body.name = setting.name;
                body.type = setting.type;
                request = PopRequest.doPost(`apps/fields/${fieldId}/configs`, body, 1, false);
            }
            request.subscribe((res) => {
                if (res.data)
                    res = res.data;
                if (IsObject(res, ['id'])) {
                    event.config.metadata.setting = Object.assign(Object.assign({}, event.config.metadata.setting), CleanObject(res));
                    if (setting.item) {
                        // ToDo:: Store a seting on to a field item
                        // console.log('save on item', core.entity);
                        // console.log('setting', res);
                    }
                    else {
                        core.entity.custom_setting[setting.name].value = body.value;
                        core.entity.setting[setting.name] = body.value;
                        const nameLookup = ArrayMapSetter(core.entity.configs.field_configs, 'name');
                        if (setting.name in nameLookup) {
                            core.entity.configs.field_configs[nameLookup[setting.name]] = Object.assign({}, event.config.metadata.setting);
                        }
                        else {
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
    storeFieldItemRule(core, fieldItem, event) {
        return new Promise((resolve) => {
            let request = undefined;
            const rule = event.config.metadata.rule;
            const fieldItemId = fieldItem.id;
            const value = event.config.control.value;
            const body = {
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
            }
            else {
                rule.value = value;
                // pass
            }
            if (rule.field_id) { // patch
                request = PopRequest.doPatch(`fields/${fieldItemId}/rules/${rule.id}`, body, 1, false);
            }
            else {
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
    _updateSchemeFieldMapping(scheme, key) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            if (IsObject(scheme, ['id', 'mapping']) && IsString(key, true) && key in scheme.mapping) {
                this.dom.setTimeout(`update-scheme-field-${key}`, () => {
                    const body = { mapping: {} };
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
            }
            else {
                return resolve(false);
            }
        }));
    }
    /**
     * Assign the custom setting values and config that exist for this field
     * @param field
     * @param stored
     */
    _setFieldCustomSettings(field, scheme) {
        if (IsObject(field, ['fieldgroup', 'configs'])) {
            const stored = field.configs;
            const fieldSettings = GetCustomFieldSettings(field);
            const customSettings = JSON.parse(JSON.stringify(Object.assign(Object.assign({}, EntityFieldSetting), fieldSettings)));
            // console.log( 'customSettings', customSettings );
            // console.log('stored', stored);
            if (IsObject(customSettings, true)) {
                const itemIdLookup = ArrayMapSetter(field.items, 'id');
                const itemNameLookup = ArrayMapSetter(field.items, 'name');
                // console.log('itemNameLookup', itemNameLookup);
                Object.keys(customSettings).map((settingName) => {
                    const setting = customSettings[settingName];
                    if (IsObject(setting, true)) {
                        if (setting.item) {
                            if (setting.item in itemNameLookup) {
                                // console.log('setting', setting);
                                const item = field.items[itemNameLookup[setting.item]];
                                if (!item.custom_setting)
                                    item.custom_setting = {};
                                if (!item.setting)
                                    item.setting = {};
                                setting.field_item_id = item.field_item_id;
                                setting.field_id = item.id;
                                // console.log('item', item);
                                const value = setting.value ? setting.value : setting.defaultValue;
                                item.custom_setting[settingName] = setting;
                                item.setting[settingName] = value;
                            }
                        }
                        else {
                            if (!field.custom_setting)
                                field.custom_setting = {};
                            if (!field.setting)
                                field.setting = {};
                            if (!field.trait)
                                field.trait = {};
                            let value;
                            if (IsObject(scheme, true)) {
                                const storage = this.getSchemeFieldSection(scheme, +field.id, 'setting');
                                if (IsObject(storage, true) && setting.name in storage) {
                                    value = storage[setting.name];
                                }
                                else {
                                    value = setting.value ? setting.value : setting.defaultValue;
                                }
                            }
                            else {
                                value = setting.value ? setting.value : setting.defaultValue;
                            }
                            if (setting.type === 'trait') {
                                field.trait[settingName] = value;
                            }
                            else {
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
                        }
                        else {
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
                                    if (!item.custom_setting)
                                        item.custom_setting = {};
                                    if (!item.custom_setting[setting.name]) {
                                        item.custom_setting[setting.name] = setting;
                                    }
                                    else {
                                        item.custom_setting[setting.name].id = setting.id;
                                        item.custom_setting[setting.name].value = setting.value;
                                    }
                                    if (!item.setting)
                                        item.setting = {};
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
    _setFieldEntryValues(core, scheme) {
        return new Promise((resolve) => {
            const field = core.entity;
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
            }
            else {
                return resolve(true);
            }
        });
    }
}
PopFieldEditorService.ɵprov = i0.ɵɵdefineInjectable({ factory: function PopFieldEditorService_Factory() { return new PopFieldEditorService(); }, token: PopFieldEditorService, providedIn: "root" });
PopFieldEditorService.decorators = [
    { type: Injectable, args: [{
                providedIn: 'root'
            },] }
];
PopFieldEditorService.ctorParameters = () => [];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS1maWVsZC1lZGl0b3Iuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2VudGl0eS9wb3AtZW50aXR5LWZpZWxkLWVkaXRvci9wb3AtZW50aXR5LWZpZWxkLWVkaXRvci5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUMsVUFBVSxFQUFZLE1BQU0sZUFBZSxDQUFDO0FBQ3BELE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLHNDQUFzQyxDQUFDO0FBQ3RFLE9BQU8sRUFNa0IsTUFBTSxFQUFFLFVBQVUsR0FDMUMsTUFBTSwyQkFBMkIsQ0FBQztBQUNuQyxPQUFPLEVBQ0wsY0FBYyxFQUNkLFdBQVcsRUFBRSx3QkFBd0IsRUFBRSxXQUFXLEVBQ2xELGVBQWUsRUFBRSxtQkFBbUIsRUFBRSxhQUFhLEVBQ25ELE9BQU8sRUFBRSxTQUFTLEVBQ2xCLFFBQVEsRUFDUixrQkFBa0IsRUFBRSxRQUFRLEVBQzVCLGFBQWEsRUFBRSxhQUFhLEVBQzVCLFNBQVMsRUFDVixNQUFNLDZCQUE2QixDQUFDO0FBRXJDLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLDhDQUE4QyxDQUFDO0FBRWhGLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLDJEQUEyRCxDQUFDO0FBQzdGLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSwwREFBMEQsQ0FBQztBQUN0RixPQUFPLEVBQUMsY0FBYyxFQUFFLHNCQUFzQixFQUFFLHNCQUFzQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDckcsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sMkRBQTJELENBQUM7QUFDN0YsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLDBEQUEwRCxDQUFDO0FBRXRGLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLHdEQUF3RCxDQUFD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RSxTQUFTLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztvQkFDdkUsSUFBSSxFQUFFLFVBQVU7b0JBQ2hCLFVBQVUsRUFBRSxDQUFDO2lCQUNkLENBQUM7Z0JBQ0YsVUFBVSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEtBQUssQ0FBQyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO29CQUNqRixHQUFHLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO29CQUNoQyxLQUFLLENBQUMsT0FBTyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ3RCLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUN2QixDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRTtvQkFDVCxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsc0JBQXNCLEVBQUUsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQ3RFLE9BQU8sT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUN4QixDQUFDLENBQUMsQ0FBQzthQUNKO2lCQUFNO2dCQUNMLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ3RCO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDOzs7O1lBNStCRixVQUFVLFNBQUM7Z0JBQ1YsVUFBVSxFQUFFLE1BQU07YUFDbkIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGUsIE9uRGVzdHJveX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge1BvcEV4dGVuZFNlcnZpY2V9IGZyb20gJy4uLy4uLy4uL3NlcnZpY2VzL3BvcC1leHRlbmQuc2VydmljZSc7XG5pbXBvcnQge1xuICBDb3JlQ29uZmlnLCBEaWN0aW9uYXJ5LFxuICBEeW5hbWljQ29tcG9uZW50SW50ZXJmYWNlLFxuICBGaWVsZENvbmZpZyxcbiAgRmllbGRDdXN0b21TZXR0aW5nSW50ZXJmYWNlLFxuICBGaWVsZEludGVyZmFjZSwgRmllbGRJdGVtSW50ZXJmYWNlLFxuICBQb3BCYXNlRXZlbnRJbnRlcmZhY2UsIFBvcExvZywgUG9wUmVxdWVzdCxcbn0gZnJvbSAnLi4vLi4vLi4vcG9wLWNvbW1vbi5tb2RlbCc7XG5pbXBvcnQge1xuICBBcnJheU1hcFNldHRlcixcbiAgQ2xlYW5PYmplY3QsIENvbnZlcnRBcnJheVRvT3B0aW9uTGlzdCwgRHluYW1pY1NvcnQsXG4gIEdldEh0dHBFcnJvck1zZywgR2V0SHR0cE9iamVjdFJlc3VsdCwgR2V0SHR0cFJlc3VsdCxcbiAgSXNBcnJheSwgSXNEZWZpbmVkLFxuICBJc09iamVjdCxcbiAgSXNPYmplY3RUaHJvd0Vycm9yLCBJc1N0cmluZywgUmFuZG9tSW50LFxuICBTbmFrZVRvUGFzY2FsLCBTdG9yYWdlU2V0dGVyLFxuICBUaXRsZUNhc2Vcbn0gZnJvbSAnLi4vLi4vLi4vcG9wLWNvbW1vbi11dGlsaXR5JztcbmltcG9ydCB7UG9wRG9tU2VydmljZX0gZnJvbSAnLi4vLi4vLi4vc2VydmljZXMvcG9wLWRvbS5zZXJ2aWNlJztcbmltcG9ydCB7RW50aXR5RmllbGRTZXR0aW5nfSBmcm9tICcuLi9wb3AtZW50aXR5LWZpZWxkL3BvcC1lbnRpdHktZmllbGQuc2V0dGluZyc7XG5pbXBvcnQge2Zyb20sIE9ic2VydmFibGV9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtQb3BTd2l0Y2hDb21wb25lbnR9IGZyb20gJy4uLy4uL2Jhc2UvcG9wLWZpZWxkLWl0ZW0vcG9wLXN3aXRjaC9wb3Atc3dpdGNoLmNvbXBvbmVudCc7XG5pbXBvcnQge1N3aXRjaENvbmZpZ30gZnJvbSAnLi4vLi4vYmFzZS9wb3AtZmllbGQtaXRlbS9wb3Atc3dpdGNoL3N3aXRjaC1jb25maWcubW9kZWwnO1xuaW1wb3J0IHtGaWVsZEl0ZW1SdWxlcywgR2V0Q3VzdG9tRmllbGRTZXR0aW5ncywgSXNWYWxpZEZpZWxkUGF0Y2hFdmVudH0gZnJvbSAnLi4vcG9wLWVudGl0eS11dGlsaXR5JztcbmltcG9ydCB7UG9wU2VsZWN0Q29tcG9uZW50fSBmcm9tICcuLi8uLi9iYXNlL3BvcC1maWVsZC1pdGVtL3BvcC1zZWxlY3QvcG9wLXNlbGVjdC5jb21wb25lbnQnO1xuaW1wb3J0IHtTZWxlY3RDb25maWd9IGZyb20gJy4uLy4uL2Jhc2UvcG9wLWZpZWxkLWl0ZW0vcG9wLXNlbGVjdC9zZWxlY3QtY29uZmlnLm1vZGVsJztcbmltcG9ydCB7RW50aXR5U2NoZW1lU2VjdGlvbkludGVyZmFjZX0gZnJvbSAnLi4vcG9wLWVudGl0eS1zY2hlbWUvcG9wLWVudGl0eS1zY2hlbWUubW9kZWwnO1xuaW1wb3J0IHtBZGRyZXNzRmllbGRTZXR0aW5nfSBmcm9tICcuLi9wb3AtZW50aXR5LWZpZWxkL3BvcC1lbnRpdHktYWRkcmVzcy9hZGRyZXNzLnNldHRpbmcnO1xuaW1wb3J0IHtFbWFpbEZpZWxkU2V0dGluZ30gZnJvbSAnLi4vcG9wLWVudGl0eS1maWVsZC9wb3AtZW50aXR5LWVtYWlsL2VtYWlsLnNldHRpbmcnO1xuaW1wb3J0IHtOYW1lRmllbGRTZXR0aW5nfSBmcm9tICcuLi9wb3AtZW50aXR5LWZpZWxkL3BvcC1lbnRpdHktbmFtZS9uYW1lLnNldHRpbmcnO1xuaW1wb3J0IHtQaG9uZUZpZWxkU2V0dGluZ30gZnJvbSAnLi4vcG9wLWVudGl0eS1maWVsZC9wb3AtZW50aXR5LXBob25lL3Bob25lLnNldHRpbmcnO1xuaW1wb3J0IHtTZWxlY3RNdWx0aUZpZWxkU2V0dGluZ30gZnJvbSAnLi4vcG9wLWVudGl0eS1maWVsZC9wb3AtZW50aXR5LXNlbGVjdC1tdWx0aS9zZWxlY3QtbXVsaXQuc2V0dGluZyc7XG5pbXBvcnQgKiBhcyBkYXRhIGZyb20gJy4vTU9DS19EQVRBLmpzb24nO1xuXG5ASW5qZWN0YWJsZSh7XG4gIHByb3ZpZGVkSW46ICdyb290J1xufSlcbmV4cG9ydCBjbGFzcyBQb3BGaWVsZEVkaXRvclNlcnZpY2UgZXh0ZW5kcyBQb3BFeHRlbmRTZXJ2aWNlIGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgcHVibGljIG5hbWUgPSAnUG9wRmllbGRFZGl0b3JTZXJ2aWNlJztcblxuICBwcm90ZWN0ZWQgYXNzZXQgPSB7XG4gICAgZGF0YTogPGFueT4gKGRhdGEgYXMgYW55KS5kZWZhdWx0LFxuICAgIGNvcmU6IDxDb3JlQ29uZmlnPnVuZGVmaW5lZCxcbiAgICBmaWVsZDogPEZpZWxkQ29uZmlnPnVuZGVmaW5lZCxcbiAgICB2aWV3UGFyYW1zOiB7IC8vIFRoZXNlIGFyZSB0aGUgcmVwcmVzZW50IHRoZSBwYXJhbXMgdGhhdCB3ZSB3YW50IHRvIGRpc3BsYXkgZm9yIGEgc3BlY2lmaWMgZm9ybVxuICAgICAgc2VsZWN0OiB7XG4gICAgICAgIGRpc2FibGVkOiAxLFxuICAgICAgICBkaXNwbGF5OiAxLFxuICAgICAgICByZXF1aXJlZDogMSxcbiAgICAgICAgLy8gcmVxdWlyZWQ6IDFcbiAgICAgIH0sXG4gICAgICBzZWxlY3RfbXVsdGk6IHtcbiAgICAgICAgZGlzYWJsZWQ6IDEsXG4gICAgICAgIGRpc3BsYXk6IDEsXG4gICAgICAgIGhlbHBUZXh0OiAxLFxuICAgICAgICAvLyByZXF1aXJlZDogMVxuICAgICAgfSxcbiAgICAgIGlucHV0OiB7XG4gICAgICAgIGRpc3BsYXk6IDEsXG4gICAgICAgIHJlYWRvbmx5OiAxLFxuICAgICAgICByZXF1aXJlZDogMSxcbiAgICAgICAgcGF0dGVybjogMSxcbiAgICAgICAgdmFsaWRhdGlvbjogMSxcbiAgICAgICAgdHJhbnNmb3JtYXRpb246IDEsXG4gICAgICAgIG1heGxlbmd0aDogMSxcbiAgICAgICAgbWlubGVuZ3RoOiAxLFxuICAgICAgICBtYXNrOiAxLFxuICAgICAgICBkaXNhYmxlZDogMSxcbiAgICAgICAgYWxsb3dfY2FuYWRhOiAxLFxuICAgICAgICBhdXRvX2ZpbGw6IDFcbiAgICAgIH0sXG4gICAgICBwaG9uZToge1xuICAgICAgICBkaXNwbGF5OiAxLFxuICAgICAgICByZWFkb25seTogMSxcbiAgICAgICAgcmVxdWlyZWQ6IDEsXG4gICAgICAgIG1hc2s6IDFcbiAgICAgIH0sXG4gICAgICBjaGVja2JveDoge1xuICAgICAgICBkaXNwbGF5OiAxLFxuICAgICAgICByZWFkb25seTogMSxcbiAgICAgIH0sXG4gICAgICBidXR0b246IHtcbiAgICAgICAgZGlzcGxheTogMSxcbiAgICAgICAgZGlzYWJsZWQ6IDEsXG4gICAgICB9LFxuICAgICAgcmFkaW86IHtcbiAgICAgICAgZGlzcGxheTogMSxcbiAgICAgICAgZGlzYWJsZWQ6IDEsXG4gICAgICAgIGxheW91dDogMVxuICAgICAgfSxcbiAgICAgIHN3aXRjaDoge1xuICAgICAgICBkaXNwbGF5OiAxLFxuICAgICAgICBkaXNhYmxlZDogMSxcbiAgICAgICAgYWxsb3dfY2FuYWRhOiAxLFxuICAgICAgICBhdXRvX2ZpbGw6IDFcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgdmlld0xhYmVsczoge1xuICAgICAgYWRkcmVzczoge1xuICAgICAgICBkZWZhdWx0VmFsdWU6ICdBZGRyZXNzJyxcbiAgICAgIH0sXG4gICAgICBwaG9uZToge1xuICAgICAgICBkZWZhdWx0VmFsdWU6ICdQaG9uZScsXG4gICAgICB9LFxuICAgIH0sXG5cbiAgICB2aWV3TXVsdGlwbGU6IHtcbiAgICAgIGFkZHJlc3M6IDEsXG4gICAgICBwaG9uZTogMSxcbiAgICAgIGVtYWlsOiAxLFxuICAgICAgc3dpdGNoOiAxXG4gICAgICAvLyBpbnB1dDogMSxcbiAgICAgIC8vIHNlbGVjdDogMSxcbiAgICAgIC8vIG5hbWU6IDFcbiAgICB9LFxuXG4gICAgdmlld09wdGlvbnM6IHtcbiAgICAgIHNlbGVjdDoge1xuICAgICAgICBlbnVtOiBmYWxzZSxcbiAgICAgICAgZGVmYXVsdFZhbHVlOiAxLFxuICAgICAgICB2YWx1ZXM6IFtcbiAgICAgICAgICB7dmFsdWU6IDEsIG5hbWU6ICdPcHRpb24gMSd9LFxuICAgICAgICAgIHt2YWx1ZTogMiwgbmFtZTogJ09wdGlvbiAyJ30sXG4gICAgICAgICAge3ZhbHVlOiAzLCBuYW1lOiAnT3B0aW9uIDMnfSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICAgIHNlbGVjdF9tdWx0aToge1xuICAgICAgICBlbnVtOiBmYWxzZSxcbiAgICAgICAgZGVmYXVsdFZhbHVlOiBbXSxcbiAgICAgICAgdmFsdWVzOiBbXG4gICAgICAgICAge3ZhbHVlOiAxLCBuYW1lOiAnT3B0aW9uIDEnfSxcbiAgICAgICAgICB7dmFsdWU6IDIsIG5hbWU6ICdPcHRpb24gMid9LFxuICAgICAgICAgIHt2YWx1ZTogMywgbmFtZTogJ09wdGlvbiAzJ30sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgICByYWRpbzoge1xuICAgICAgICBlbnVtOiBmYWxzZSxcbiAgICAgICAgZGVmYXVsdFZhbHVlOiAneWVzJyxcbiAgICAgICAgdmFsdWVzOiBbXG4gICAgICAgICAge3ZhbHVlOiAneWVzJywgbmFtZTogJ1llcyd9LFxuICAgICAgICAgIHt2YWx1ZTogJ25vJywgbmFtZTogJ05vJ30sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgfSxcblxuICAgIHZpZXdSZXF1aXJlZDogeyAvLyBUaGlzIHJlcHJlc2VudHMgZmllbGQgaXRlbXMgdGhhdCB3ZSB3YW50IHRvIGZvcmNlIHRvIHRvIGJlIGFsd2F5cyBhY3RpdmVcbiAgICAgIGFkZHJlc3M6IHtcbiAgICAgICAgbGFiZWw6IDEsXG4gICAgICAgIHppcDogMVxuICAgICAgfSxcbiAgICAgIGlucHV0OiB7XG4gICAgICAgIHZhbHVlOiAxXG4gICAgICB9LFxuICAgICAgc2VsZWN0OiB7XG4gICAgICAgIHZhbHVlOiAxXG4gICAgICB9LFxuICAgICAgc2VsZWN0X211bHRpOiB7XG4gICAgICAgIHZhbHVlOiAxXG4gICAgICB9LFxuICAgICAgbXVsdGlfc2VsZWN0aW9uOiB7XG4gICAgICAgIHZhbHVlOiAxXG4gICAgICB9LFxuICAgICAgc3dpdGNoOiB7XG4gICAgICAgIHZhbHVlOiAxXG4gICAgICB9LFxuICAgICAgcGhvbmU6IHtcbiAgICAgICAgbGFiZWw6IDEsXG4gICAgICAgIG51bWJlcjogMVxuICAgICAgfSxcbiAgICAgIGVtYWlsOiB7XG4gICAgICAgIGFkZHJlc3M6IDFcbiAgICAgIH0sXG4gICAgICBuYW1lOiB7XG4gICAgICAgIGZpcnN0OiAxLFxuICAgICAgICBsYXN0OiAxXG4gICAgICB9XG4gICAgfSxcblxuICAgIHZpZXdJZ25vcmVkOiB7IC8vIFRoaXMgcmVwcmVzZW50cyBmaWVsZCBpdGVtcyB0aGF0IHdlIHdhbnQgdG8gZm9yY2UgdG8gdG8gYmUgYWx3YXlzIGFjdGl2ZVxuICAgICAgYWRkcmVzczoge1xuICAgICAgICBzdHJlZXQ6IDEsXG4gICAgICAgIHVfc19zdGF0ZV9pZDogMVxuICAgICAgfSxcbiAgICB9LFxuXG4gICAgdmlld1RlbXBsYXRlOiB7IC8vIGdpdmVzIHVzZXIgdGhlIGFiaWxpdHkgdG8gc2VlIGRhdGEgd2l0aCBhIGRpZmZlcmVudCBodG1sIGZvcm1hdFxuICAgICAgc2VsZWN0aW9uOiAxLFxuICAgIH0sXG5cbiAgICBsYWJlbFR5cGVzOiB7XG4gICAgICBkZWZhdWx0VmFsdWU6ICdwcm92aWRlZCcsXG4gICAgICBvcHRpb25zOiBbe3ZhbHVlOiAncHJvdmlkZWQnLCBuYW1lOiAnUHJvdmlkZWQnfSwge3ZhbHVlOiAnY3VzdG9tJywgbmFtZTogJ0N1c3RvbSd9XSxcbiAgICB9LFxuICB9O1xuXG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVyIHRoZSBmaWVsZCB0byBtYWtlIHN1cmUgdGhhdCBhbnkgbmVlZGVkIGF0dHJpYnV0ZXMgYXJlIGFkZGVkXG4gICAqIEBwYXJhbSBjb3JlXG4gICAqIEBwYXJhbSBkb21cbiAgICovXG4gIHJlZ2lzdGVyKGNvcmU6IENvcmVDb25maWcsIGRvbTogUG9wRG9tU2VydmljZSwgc2NoZW1lPzogRW50aXR5U2NoZW1lU2VjdGlvbkludGVyZmFjZSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgaWYgKElzT2JqZWN0VGhyb3dFcnJvcihjb3JlLCBbJ2VudGl0eSddLCBgSW52YWxpZCBDb3JlYCkgJiYgSXNPYmplY3RUaHJvd0Vycm9yKGNvcmUuZW50aXR5LCB0cnVlLCBgSW52YWxpZCBDb3JlYCkpIHtcbiAgICAgICAgdGhpcy5hc3NldC5jb3JlID0gY29yZTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ2ZpZWxkIGlzICcsIGNvcmUuZW50aXR5KTtcbiAgICAgICAgdGhpcy5hc3NldC5jb3JlLmVudGl0eS5pdGVtcy5tYXAoKGl0ZW0pID0+IHtcbiAgICAgICAgICBGaWVsZEl0ZW1SdWxlcyhpdGVtKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuX3NldEZpZWxkQ3VzdG9tU2V0dGluZ3MoY29yZS5lbnRpdHkpO1xuICAgICAgICBpZiAoSXNPYmplY3QoY29yZS5lbnRpdHkuY3VzdG9tX3NldHRpbmcsIHRydWUpKSB7XG4gICAgICAgICAgaWYgKCFkb20udWkuY3VzdG9tU2V0dGluZykgZG9tLnVpLmN1c3RvbVNldHRpbmcgPSB7fTtcbiAgICAgICAgICBPYmplY3Qua2V5cyhjb3JlLmVudGl0eS5jdXN0b21fc2V0dGluZykubWFwKChzZXR0aW5nTmFtZSkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc2V0dGluZyA9IGNvcmUuZW50aXR5LmN1c3RvbV9zZXR0aW5nW3NldHRpbmdOYW1lXTtcbiAgICAgICAgICAgIGNvbnN0IGNvbXBvbmVudCA9IHRoaXMuZ2V0Q3VzdG9tU2V0dGluZ0NvbXBvbmVudChjb3JlLCBjb3JlLmVudGl0eSwgc2V0dGluZywgc2NoZW1lKTtcbiAgICAgICAgICAgIGRvbS51aS5jdXN0b21TZXR0aW5nW3NldHRpbmcubmFtZV0gPSBjb21wb25lbnQ7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmFzc2V0LmNvcmUuZW50aXR5LnRyYWl0ID0gdGhpcy5nZXRGaWVsZFRyYWl0cyh0aGlzLmFzc2V0LmNvcmUuZW50aXR5LmZpZWxkZ3JvdXAubmFtZSk7XG4gICAgICAgIHRoaXMuX3NldEZpZWxkRW50cnlWYWx1ZXMoY29yZSwgc2NoZW1lKS50aGVuKCgpID0+IHtcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuXG4gIC8vIC8qKlxuICAvLyAgKiBXaGVuIHdlIHB1bGwgZmllbGQgdXAgaW4gdGhlIGVkaXRvciB0byBtYWtlIGNoYW5nZXMsIGNsZWFyIG91dCB0aGUgY2FjaGUgb2YgdGhhdCBmaWVsZCBzbyB3aGVuIHRoZSBmaWVsZCBpcyB2aWV3ZWQgaXQgd2lsbCBwdWxsIGluIGFueSBjaGFuZ2VzXG4gIC8vICAqIEBwYXJhbSBpbnRlcm5hbF9uYW1lXG4gIC8vICAqIEBwYXJhbSBmaWVsZElkXG4gIC8vICAqL1xuICAvLyBjbGVhckN1c3RvbUZpZWxkQ2FjaGUoIGludGVybmFsX25hbWU6IHN0cmluZywgZmllbGRJZDogbnVtYmVyICl7XG4gIC8vICAgdGhpcy5zcnYuZmllbGQuY2xlYXJDdXN0b21GaWVsZENhY2hlKCBmaWVsZElkICk7XG4gIC8vIH1cblxuXG4gIC8qKlxuICAgKiBHZXQgYSBzZXQgb2YgbW9jayBkYXRhIGZvciBhIGdpdmVuIGZpZWxkXG4gICAqIEBwYXJhbSBpbnRlcm5hbF9uYW1lXG4gICAqL1xuICBnZXREZWZhdWx0VmFsdWVzKGludGVybmFsX25hbWU6IHN0cmluZykge1xuICAgIGxldCBkZWZhdWx0VmFsdWVzID0gPGFueT57fTtcbiAgICBzd2l0Y2ggKGludGVybmFsX25hbWUpIHtcbiAgICAgIGNhc2UgJ2FkZHJlc3MnOlxuICAgICAgICBkZWZhdWx0VmFsdWVzID0gdGhpcy5nZXRBZGRyZXNzVmFsdWVzKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAncGhvbmUnOlxuICAgICAgICBkZWZhdWx0VmFsdWVzID0gdGhpcy5nZXRQaG9uZVZhbHVlcygpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ25hbWUnOlxuICAgICAgICBkZWZhdWx0VmFsdWVzID0gdGhpcy5nZXROYW1lVmFsdWVzKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgZGVmYXVsdFZhbHVlcyA9IHt2YWx1ZTogbnVsbH07XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICByZXR1cm4gZGVmYXVsdFZhbHVlcztcbiAgfVxuXG5cbiAgaXNTY2hlbWVQcmltYXJ5RmllbGQoc2NoZW1lOiBFbnRpdHlTY2hlbWVTZWN0aW9uSW50ZXJmYWNlLCBmaWVsZDogRmllbGRJbnRlcmZhY2UsKSB7XG4gICAgaWYgKElzT2JqZWN0KHNjaGVtZSwgWydpZCcsICdtYXBwaW5nJ10pICYmIElzT2JqZWN0KGZpZWxkLCBbJ2lkJywgJ2ZpZWxkZ3JvdXAnXSkpIHtcbiAgICAgIGNvbnN0IHByaW1hcnkgPSB0aGlzLmdldFNjaGVtZVByaW1hcnkoc2NoZW1lKTtcbiAgICAgIGNvbnN0IGdyb3VwTmFtZSA9IGZpZWxkLmZpZWxkZ3JvdXAubmFtZTtcbiAgICAgIGlmIChncm91cE5hbWUgaW4gcHJpbWFyeSAmJiArcHJpbWFyeVtncm91cE5hbWVdID09PSArZmllbGQuaWQpIHtcblxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuXG4gIGlzU2NoZW1lRmllbGRJdGVtRGlzYWJsZWQoc2NoZW1lOiBFbnRpdHlTY2hlbWVTZWN0aW9uSW50ZXJmYWNlLCBmaWVsZElkOiBudW1iZXIsIGl0ZW1JZDogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgaWYgKElzT2JqZWN0KHNjaGVtZSwgWydpZCcsICdtYXBwaW5nJ10pICYmICtmaWVsZElkICYmICtpdGVtSWQpIHtcbiAgICAgIGNvbnN0IHNldHRpbmcgPSB0aGlzLmdldFNjaGVtZUZpZWxkSXRlbU1hcHBpbmcoc2NoZW1lLCBmaWVsZElkLCBpdGVtSWQpO1xuICAgICAgaWYgKElzRGVmaW5lZChzZXR0aW5nLmFjdGl2ZSwgZmFsc2UpKSB7XG4gICAgICAgIHJldHVybiArc2V0dGluZy5hY3RpdmUgPT09IDEgPyBmYWxzZSA6IHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG5cbiAgaXNTY2hlbWVGaWVsZEVudHJ5RGlzYWJsZWQoc2NoZW1lOiBFbnRpdHlTY2hlbWVTZWN0aW9uSW50ZXJmYWNlLCBmaWVsZElkOiBudW1iZXIsIGVudHJ5SWQ6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgIGlmIChJc09iamVjdChzY2hlbWUsIFsnaWQnLCAnbWFwcGluZyddKSAmJiArZmllbGRJZCAmJiArZW50cnlJZCkge1xuICAgICAgY29uc3Qgc2V0dGluZyA9IHRoaXMuZ2V0U2NoZW1lRmllbGRTZXR0aW5nKHNjaGVtZSwgZmllbGRJZCk7XG4gICAgICByZXR1cm4gSXNBcnJheShzZXR0aW5nLmRpc2FibGVkX2VudHJpZXMsIHRydWUpICYmIHNldHRpbmcuZGlzYWJsZWRfZW50cmllcy5pbmNsdWRlcyhlbnRyeUlkKTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cblxuICBnZXRTY2hlbWVGaWVsZFNldHRpbmcoc2NoZW1lOiBFbnRpdHlTY2hlbWVTZWN0aW9uSW50ZXJmYWNlLCBmaWVsZElkOiBudW1iZXIpOiBEaWN0aW9uYXJ5PGFueT4ge1xuICAgIGlmIChJc09iamVjdChzY2hlbWUsIHRydWUpICYmICtmaWVsZElkKSB7XG4gICAgICB0aGlzLmVuc3VyZVNjaGVtZUZpZWxkTWFwcGluZyhzY2hlbWUsIGZpZWxkSWQpO1xuICAgICAgbGV0IHN0b3JhZ2UgPSB0aGlzLmdldFNjaGVtZUZpZWxkTWFwcGluZyhzY2hlbWUpO1xuICAgICAgaWYgKElzT2JqZWN0KHN0b3JhZ2UsIHRydWUpKSB7XG4gICAgICAgIHN0b3JhZ2UgPSAoPERpY3Rpb25hcnk8YW55Pj5TdG9yYWdlU2V0dGVyKHN0b3JhZ2UsIFtgZmllbGRfJHtmaWVsZElkfWBdKSk7XG4gICAgICAgIHJldHVybiBzdG9yYWdlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG5cbiAgZ2V0U2NoZW1lRmllbGRTZWN0aW9uKHNjaGVtZTogRW50aXR5U2NoZW1lU2VjdGlvbkludGVyZmFjZSwgZmllbGRJZDogbnVtYmVyLCBzZWN0aW9uTmFtZTogc3RyaW5nKSB7XG4gICAgaWYgKElzT2JqZWN0KHNjaGVtZSwgdHJ1ZSkgJiYgK2ZpZWxkSWQpIHtcblxuICAgICAgY29uc3Qgc3RvcmFnZSA9IHRoaXMuZ2V0U2NoZW1lRmllbGRTZXR0aW5nKHNjaGVtZSwgZmllbGRJZCk7XG4gICAgICBpZiAoSXNPYmplY3Qoc3RvcmFnZSkpIHtcbiAgICAgICAgcmV0dXJuICg8RmllbGRJdGVtSW50ZXJmYWNlPlN0b3JhZ2VTZXR0ZXIoc3RvcmFnZSwgW3NlY3Rpb25OYW1lXSkpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG5cbiAgZW5zdXJlU2NoZW1lRmllbGRNYXBwaW5nKHNjaGVtZTogRW50aXR5U2NoZW1lU2VjdGlvbkludGVyZmFjZSwgZmllbGRJZDogbnVtYmVyKTogdm9pZCB7XG4gICAgaWYgKCEoSXNPYmplY3Qoc2NoZW1lLm1hcHBpbmcpKSkge1xuICAgICAgc2NoZW1lLm1hcHBpbmcgPSB7fTtcbiAgICB9XG4gICAgaWYgKCEoSXNPYmplY3Qoc2NoZW1lLm1hcHBpbmcuZmllbGQpKSkge1xuICAgICAgc2NoZW1lLm1hcHBpbmcuZmllbGQgPSB7fTtcbiAgICB9XG4gICAgaWYgKCEoSXNPYmplY3Qoc2NoZW1lLm1hcHBpbmcuZmllbGRbYGZpZWxkXyR7ZmllbGRJZH1gXSkpKSB7XG4gICAgICBzY2hlbWUubWFwcGluZy5maWVsZFtgZmllbGRfJHtmaWVsZElkfWBdID0ge307XG4gICAgfVxuICAgIGlmICghKElzT2JqZWN0KHNjaGVtZS5tYXBwaW5nLmZpZWxkW2BmaWVsZF8ke2ZpZWxkSWR9YF0udHJhaXRfZW50cnkpKSkge1xuICAgICAgc2NoZW1lLm1hcHBpbmcuZmllbGRbYGZpZWxkXyR7ZmllbGRJZH1gXS50cmFpdF9lbnRyeSA9IHt9O1xuICAgIH1cbiAgICBpZiAoIShJc0FycmF5KHNjaGVtZS5tYXBwaW5nLmZpZWxkW2BmaWVsZF8ke2ZpZWxkSWR9YF0uZGlzYWJsZWRfZW50cmllcykpKSB7XG4gICAgICBzY2hlbWUubWFwcGluZy5maWVsZFtgZmllbGRfJHtmaWVsZElkfWBdLmRpc2FibGVkX2VudHJpZXMgPSBbXTtcbiAgICB9XG4gIH1cblxuXG4gIGdldFNjaGVtZUZpZWxkSXRlbU1hcHBpbmcoc2NoZW1lOiBFbnRpdHlTY2hlbWVTZWN0aW9uSW50ZXJmYWNlLCBmaWVsZElkOiBudW1iZXIsIGl0ZW1JZDogbnVtYmVyKTogRGljdGlvbmFyeTxhbnk+IHtcbiAgICBpZiAoSXNPYmplY3Qoc2NoZW1lLCB0cnVlKSAmJiArZmllbGRJZCAmJiAraXRlbUlkKSB7XG4gICAgICBsZXQgc3RvcmFnZSA9IDxEaWN0aW9uYXJ5PGFueT4+dGhpcy5nZXRTY2hlbWVGaWVsZFNldHRpbmcoc2NoZW1lLCBmaWVsZElkKTtcbiAgICAgIGlmIChJc09iamVjdChzdG9yYWdlLCB0cnVlKSkge1xuICAgICAgICBpZiAoIShJc09iamVjdChzdG9yYWdlLml0ZW0pKSkge1xuICAgICAgICAgIHN0b3JhZ2UuaXRlbSA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIGlmICghKElzT2JqZWN0KHN0b3JhZ2UuaXRlbVtgaXRlbV8ke2l0ZW1JZH1gXSkpKSB7XG4gICAgICAgICAgc3RvcmFnZS5pdGVtW2BpdGVtXyR7aXRlbUlkfWBdID0ge307XG4gICAgICAgIH1cbiAgICAgICAgc3RvcmFnZSA9IDxGaWVsZEl0ZW1JbnRlcmZhY2U+U3RvcmFnZVNldHRlcihzdG9yYWdlLCBbJ2l0ZW0nLCBgaXRlbV8ke2l0ZW1JZH1gXSk7XG5cbiAgICAgICAgcmV0dXJuIDxEaWN0aW9uYXJ5PGFueT4+c3RvcmFnZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuXG4gIGdldFNjaGVtZUZpZWxkSXRlbVNlY3Rpb24oc2NoZW1lOiBFbnRpdHlTY2hlbWVTZWN0aW9uSW50ZXJmYWNlLCBmaWVsZElkOiBudW1iZXIsIGl0ZW1JZDogbnVtYmVyLCBzZWN0aW9uTmFtZTogc3RyaW5nKSB7XG4gICAgaWYgKElzT2JqZWN0KHNjaGVtZSwgdHJ1ZSkgJiYgK2ZpZWxkSWQgJiYgK2l0ZW1JZCAmJiBJc1N0cmluZyhzZWN0aW9uTmFtZSwgdHJ1ZSkpIHtcbiAgICAgIGNvbnN0IHN0b3JhZ2UgPSB0aGlzLmdldFNjaGVtZUZpZWxkSXRlbU1hcHBpbmcoc2NoZW1lLCBmaWVsZElkLCBpdGVtSWQpO1xuICAgICAgaWYgKHN0b3JhZ2UgJiYgSXNTdHJpbmcoc2VjdGlvbk5hbWUsIHRydWUpKSB7XG4gICAgICAgIHJldHVybiBTdG9yYWdlU2V0dGVyKHN0b3JhZ2UsIFtzZWN0aW9uTmFtZV0pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG5cbiAgZ2V0RmllbGRUcmFpdHMoZmllbGRHcm91cE5hbWU6IHN0cmluZyk6IEZpZWxkQ3VzdG9tU2V0dGluZ0ludGVyZmFjZVtdIHtcbiAgICBjb25zdCB0cmFpdHMgPSBbXTtcbiAgICBsZXQgc2V0dGluZyA9IHt9O1xuICAgIHN3aXRjaCAoU3RyaW5nKGZpZWxkR3JvdXBOYW1lKS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICBjYXNlICdhZGRyZXNzJzpcbiAgICAgICAgc2V0dGluZyA9IEFkZHJlc3NGaWVsZFNldHRpbmc7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnZW1haWwnOlxuICAgICAgICBzZXR0aW5nID0gRW1haWxGaWVsZFNldHRpbmc7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnbmFtZSc6XG4gICAgICAgIHNldHRpbmcgPSBOYW1lRmllbGRTZXR0aW5nO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3Bob25lJzpcbiAgICAgICAgc2V0dGluZyA9IFBob25lRmllbGRTZXR0aW5nO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3NlbGVjdC1tdWx0aSc6XG4gICAgICAgIHNldHRpbmcgPSBTZWxlY3RNdWx0aUZpZWxkU2V0dGluZztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdyYWRpbyc6XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBpZiAoSXNPYmplY3Qoc2V0dGluZywgdHJ1ZSkpIHtcbiAgICAgIE9iamVjdC5rZXlzKHNldHRpbmcpLm1hcCgoc2V0dGluZ05hbWU6IHN0cmluZykgPT4ge1xuICAgICAgICBjb25zdCB0bXAgPSBzZXR0aW5nW3NldHRpbmdOYW1lXTtcbiAgICAgICAgaWYgKElzT2JqZWN0KHRtcCwgWyd0eXBlJ10pKSB7XG4gICAgICAgICAgaWYgKHRtcC50eXBlID09PSAndHJhaXQnKSB7XG4gICAgICAgICAgICB0cmFpdHMucHVzaCh0bXApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiB0cmFpdHM7XG4gIH1cblxuXG4gIGdldFNjaGVtZVByaW1hcnkoc2NoZW1lOiBFbnRpdHlTY2hlbWVTZWN0aW9uSW50ZXJmYWNlKSB7XG4gICAgcmV0dXJuIFN0b3JhZ2VTZXR0ZXIoc2NoZW1lLCBbJ21hcHBpbmcnLCAncHJpbWFyeSddKTtcbiAgfVxuXG5cbiAgZ2V0U2NoZW1lUmVxdWlyZWQoc2NoZW1lOiBFbnRpdHlTY2hlbWVTZWN0aW9uSW50ZXJmYWNlKSB7XG4gICAgcmV0dXJuIFN0b3JhZ2VTZXR0ZXIoc2NoZW1lLCBbJ21hcHBpbmcnLCAncmVxdWlyZWQnXSk7XG4gIH1cblxuXG4gIGdldFNjaGVtZUZpZWxkTWFwcGluZyhzY2hlbWU6IEVudGl0eVNjaGVtZVNlY3Rpb25JbnRlcmZhY2UpIHtcbiAgICByZXR1cm4gU3RvcmFnZVNldHRlcihzY2hlbWUsIFsnbWFwcGluZycsICdmaWVsZCddKTtcbiAgfVxuXG5cbiAgdXBkYXRlU2NoZW1lRmllbGRNYXBwaW5nKHNjaGVtZTogRW50aXR5U2NoZW1lU2VjdGlvbkludGVyZmFjZSkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxib29sZWFuPihhc3luYyAocmVzb2x2ZSkgPT4ge1xuICAgICAgaWYgKElzT2JqZWN0KHNjaGVtZSwgWydpZCddKSkge1xuICAgICAgICBjb25zdCByZXMgPSBhd2FpdCB0aGlzLl91cGRhdGVTY2hlbWVGaWVsZE1hcHBpbmcoc2NoZW1lLCAnZmllbGQnKTtcbiAgICAgICAgcmV0dXJuIHJlc29sdmUocmVzKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG5cbiAgdXBkYXRlU2NoZW1lUHJpbWFyeU1hcHBpbmcoc2NoZW1lOiBFbnRpdHlTY2hlbWVTZWN0aW9uSW50ZXJmYWNlKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGJvb2xlYW4+KGFzeW5jIChyZXNvbHZlKSA9PiB7XG4gICAgICBpZiAoSXNPYmplY3Qoc2NoZW1lLCBbJ2lkJ10pKSB7XG4gICAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IHRoaXMuX3VwZGF0ZVNjaGVtZUZpZWxkTWFwcGluZyhzY2hlbWUsICdwcmltYXJ5Jyk7XG4gICAgICAgIHJldHVybiByZXNvbHZlKHJlcyk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuXG4gIHVwZGF0ZVNjaGVtZVJlcXVpcmVkTWFwcGluZyhzY2hlbWU6IEVudGl0eVNjaGVtZVNlY3Rpb25JbnRlcmZhY2UpIHtcbiAgICBpZiAoSXNPYmplY3Qoc2NoZW1lLCBbJ2lkJ10pKSB7XG4gICAgICB0aGlzLl91cGRhdGVTY2hlbWVGaWVsZE1hcHBpbmcoc2NoZW1lLCAncmVxdWlyZWQnKTtcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBXaGVuIGEgZW50cnkgaXMgYWRkZWQgLCB3ZSBuZWVkIHRvIHNldCBhIGRlZmF1bHQgdHlwZVxuICAgKi9cbiAgZ2V0RGVmYXVsdExhYmVsVHlwZU9wdGlvbnMoKSB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5hc3NldC5sYWJlbFR5cGVzKSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBDaGVjayB3aGF0IHBhcmFtIG9wdGlvbnMgYXBwbHkgdG8gYSBzcGVjaWZpYyBmaWVsZFxuICAgKiBAcGFyYW0ga2V5XG4gICAqL1xuICBnZXRWaWV3UGFyYW1zKGtleTogc3RyaW5nID0gbnVsbCkge1xuICAgIGlmIChrZXkgJiYga2V5IGluIHRoaXMuYXNzZXQudmlld1BhcmFtcykge1xuICAgICAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5hc3NldC52aWV3UGFyYW1zW2tleV0pKTtcbiAgICB9XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5hc3NldC52aWV3UGFyYW1zKSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBDaGVjayB3aGF0IHBhcmFtIG9wdGlvbnMgYXBwbHkgdG8gYSBzcGVjaWZpYyBmaWVsZFxuICAgKiBAcGFyYW0ga2V5XG4gICAqL1xuICBnZXRWaWV3TXVsdGlwbGUoa2V5OiBzdHJpbmcgPSBudWxsKSB7XG4gICAgaWYgKGtleSkge1xuICAgICAgaWYgKGtleSBpbiB0aGlzLmFzc2V0LnZpZXdNdWx0aXBsZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5hc3NldC52aWV3TXVsdGlwbGVba2V5XTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLmFzc2V0LnZpZXdNdWx0aXBsZSkpO1xuICB9XG5cblxuICAvKipcbiAgICogQ2hlY2sgd2hhdCBmaWVsZHMgaXRlbXMgYXJlIHJlcXVpcmVkIHVuZGVyIGEgZmllbGRncm91cCB0eXBlXG4gICAqIEBwYXJhbSBmaWVsZEdyb3VwTmFtZVxuICAgKiBAcGFyYW0gZmllbGRJdGVtTmFtZVxuICAgKi9cbiAgZ2V0Vmlld1JlcXVpcmVkKGZpZWxkR3JvdXBOYW1lOiBzdHJpbmcsIGZpZWxkSXRlbU5hbWU6IHN0cmluZykge1xuICAgIHJldHVybiBmaWVsZEdyb3VwTmFtZSBpbiB0aGlzLmFzc2V0LnZpZXdSZXF1aXJlZCAmJiBmaWVsZEl0ZW1OYW1lIGluIHRoaXMuYXNzZXQudmlld1JlcXVpcmVkW2ZpZWxkR3JvdXBOYW1lXTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIENoZWNrIHdoYXQgZmllbGRzIGl0ZW1zIGFyZSBpbmdub3JlZCB1bmRlciBhIGZpZWxkZ3JvdXAgdHlwZVxuICAgKiBAcGFyYW0gZmllbGRHcm91cE5hbWVcbiAgICogQHBhcmFtIGZpZWxkSXRlbU5hbWVcbiAgICovXG4gIGdldFZpZXdJZ25vcmVkKGZpZWxkR3JvdXBOYW1lOiBzdHJpbmcsIGZpZWxkSXRlbU5hbWU6IHN0cmluZywgc2NoZW1lPzogRW50aXR5U2NoZW1lU2VjdGlvbkludGVyZmFjZSkge1xuICAgIGlmIChmaWVsZEdyb3VwTmFtZSBpbiB0aGlzLmFzc2V0LnZpZXdJZ25vcmVkICYmIGZpZWxkSXRlbU5hbWUgaW4gdGhpcy5hc3NldC52aWV3SWdub3JlZFtmaWVsZEdyb3VwTmFtZV0pIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBHZXQgYSBzZXQgb2YgZGVmYXVsdCBvcHRpb25zIHRvIGZvciBhIHNwZWNpZmljIHZpZXcgLCBpZS4uIGEgcmFkaW8sIHNlbGVjdCBuZWVkIG9wdGlvbnNcbiAgICogQHBhcmFtIGtleVxuICAgKi9cbiAgZ2V0Vmlld09wdGlvbnMoa2V5OiBzdHJpbmcgPSBudWxsKSB7XG4gICAgaWYgKGtleSAmJiBrZXkgaW4gdGhpcy5hc3NldC52aWV3T3B0aW9ucykge1xuICAgICAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5hc3NldC52aWV3T3B0aW9uc1trZXldKSk7XG4gICAgfVxuICAgIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMuYXNzZXQudmlld09wdGlvbnMpKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEFkZHJlc3MgRGF0YSBGYWN0b3J5XG4gICAqL1xuICBnZXRBZGRyZXNzVmFsdWVzKCkge1xuXG4gICAgY29uc3QgcmFuZG9tID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNTApO1xuICAgIHJldHVybiB7XG4gICAgICAvLyBidXNpbmVzczogY29tcGFueS5jb21wYW55TmFtZSgpLFxuICAgICAgbGluZV8xOiB0aGlzLmFzc2V0LmRhdGFbcmFuZG9tXS5saW5lXzEsXG4gICAgICBsaW5lXzI6IHRoaXMuYXNzZXQuZGF0YVtyYW5kb21dLmxpbmVfMixcbiAgICAgIGxpbmVfMzogJ0F0dG46ICcgKyB0aGlzLmFzc2V0LmRhdGFbcmFuZG9tXS5saW5lXzMsXG4gICAgICBjaXR5OiB0aGlzLmFzc2V0LmRhdGFbcmFuZG9tXS5jaXR5LFxuICAgICAgcmVnaW9uX2lkOiB0aGlzLmFzc2V0LmRhdGFbcmFuZG9tXS5yZWdpb25faWQsXG4gICAgICBjb3VudHk6ICdPaGlvJyxcbiAgICAgIGNvdW50cnlfaWQ6IDEsXG4gICAgICB6aXA6IFN0cmluZyh0aGlzLmFzc2V0LmRhdGFbcmFuZG9tXS56aXApLnNsaWNlKDAsIDUpLFxuICAgICAgemlwXzQ6ICcwMDAwJyxcbiAgICB9O1xuICB9XG5cblxuICAvKipcbiAgICogTmFtZSBEYXRhIEZhY3RvcnlcbiAgICovXG4gIGdldE5hbWVWYWx1ZXMoKSB7XG4gICAgY29uc3QgcmFuZG9tID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNTApO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHByZWZpeDogdGhpcy5hc3NldC5kYXRhW3JhbmRvbV0ucHJlZml4LFxuICAgICAgZmlyc3Q6IHRoaXMuYXNzZXQuZGF0YVtyYW5kb21dLmZpcnN0LFxuICAgICAgbWlkZGxlOiB0aGlzLmFzc2V0LmRhdGFbcmFuZG9tXS5taWRkbGUsXG4gICAgICBsYXN0OiB0aGlzLmFzc2V0LmRhdGFbcmFuZG9tXS5sYXN0LFxuICAgICAgc3VmZml4OiB0aGlzLmFzc2V0LmRhdGFbcmFuZG9tXS5zdWZmaXgsXG4gICAgfTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFBob25lIERhdGEgRmFjdG9yeVxuICAgKi9cbiAgZ2V0UGhvbmVWYWx1ZXMoKSB7XG4gICAgY29uc3QgcmFuZG9tID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNTApO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHRpdGxlOiB1bmRlZmluZWQsXG4gICAgICBjb3VudHJ5X2lkOiAxLFxuICAgICAgbnVtYmVyOiB0aGlzLmFzc2V0LmRhdGFbcmFuZG9tXS5udW1iZXIsXG4gICAgICBleHRlbnNpb246ICcxMjM0NTYnLFxuICAgICAgdm9pY2VfYnV0dG9uOiBudWxsLFxuICAgICAgc21zX2J1dHRvbjogbnVsbCxcbiAgICAgIGNhbl9jYWxsOiAxLFxuICAgICAgY2FuX3RleHQ6IDEsXG4gICAgfTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgd2FzIGJ1aWx0IGZvciByZW5kZXJpbmcgYSBkeW5hbWljIGxpc3Qgb2YgY3VzdG9tIHNldHRpbmdzLCBQcm9iYWJseSBub3QgdGhlIHJpZ2h0IGFwcHJvYWNoIHNpbmNlIHNldHRpbmdzIHNvIGZhciBoYXZlIGJlZW4gc3BvcmFkaWNhbGx5IHBsYWNlZCBzbyBmYXJcbiAgICogQHBhcmFtIGNvcmVcbiAgICogQHBhcmFtIGZpZWxkXG4gICAqIEBwYXJhbSBzZXR0aW5nXG4gICAqL1xuICBnZXRDdXN0b21TZXR0aW5nQ29tcG9uZW50KGNvcmU6IENvcmVDb25maWcsIGZpZWxkOiBGaWVsZEludGVyZmFjZSwgc2V0dGluZzogRmllbGRDdXN0b21TZXR0aW5nSW50ZXJmYWNlLCBzY2hlbWU/OiBFbnRpdHlTY2hlbWVTZWN0aW9uSW50ZXJmYWNlKSB7XG4gICAgbGV0IGNvbXBvbmVudDtcbiAgICBjb25zdCBoYXNBY2Nlc3MgPSBjb3JlLmFjY2Vzcy5jYW5fdXBkYXRlICYmICFjb3JlLmVudGl0eS5zeXN0ZW0gPyB0cnVlIDogZmFsc2U7XG4gICAgc3dpdGNoIChTdHJpbmcoc2V0dGluZy50eXBlKS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICBjYXNlICdib29sZWFuJzpcbiAgICAgICAgY29tcG9uZW50ID0gPER5bmFtaWNDb21wb25lbnRJbnRlcmZhY2U+e1xuICAgICAgICAgIHR5cGU6IFBvcFN3aXRjaENvbXBvbmVudCxcbiAgICAgICAgICBpbnB1dHM6IHtcbiAgICAgICAgICAgIGNvcmU6IGNvcmUsXG4gICAgICAgICAgICBjb25maWc6IG5ldyBTd2l0Y2hDb25maWcoe1xuICAgICAgICAgICAgICBuYW1lOiBzZXR0aW5nLm5hbWUsXG4gICAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nLmxhYmVsID8gc2V0dGluZy5sYWJlbCA6IFRpdGxlQ2FzZShTbmFrZVRvUGFzY2FsKHNldHRpbmcubmFtZSkpLFxuICAgICAgICAgICAgICBoZWxwVGV4dDogc2V0dGluZy5oZWxwVGV4dCA/IHNldHRpbmcuaGVscFRleHQgOiBudWxsLFxuICAgICAgICAgICAgICB2YWx1ZTogdHlwZW9mIHNldHRpbmcudmFsdWUgIT09ICd1bmRlZmluZWQnID8gPGJvb2xlYW4+c2V0dGluZy52YWx1ZSA6IDxib29sZWFuPnNldHRpbmcuZGVmYXVsdFZhbHVlLFxuICAgICAgICAgICAgICBmYWNhZGU6IHRydWUsXG4gICAgICAgICAgICAgIGRpc2FibGVkOiAhaGFzQWNjZXNzLFxuICAgICAgICAgICAgICBtZXRhZGF0YToge1xuICAgICAgICAgICAgICAgIHNldHRpbmc6IHNldHRpbmdcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgcGF0Y2g6IHtcbiAgICAgICAgICAgICAgICBmaWVsZDogYGAsXG4gICAgICAgICAgICAgICAgcGF0aDogYGAsXG4gICAgICAgICAgICAgICAgY2FsbGJhY2s6IChpZ25vcmU6IENvcmVDb25maWcsIGV2ZW50OiBQb3BCYXNlRXZlbnRJbnRlcmZhY2UpID0+IHtcbiAgICAgICAgICAgICAgICAgIGlmIChJc1ZhbGlkRmllbGRQYXRjaEV2ZW50KGNvcmUsIGV2ZW50KSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoSXNPYmplY3Qoc2NoZW1lLCB0cnVlKSkge1xuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlc3Npb24gPSB0aGlzLmdldFNjaGVtZUZpZWxkU2VjdGlvbihzY2hlbWUsICtmaWVsZC5pZCwgJ3NldHRpbmcnKTtcbiAgICAgICAgICAgICAgICAgICAgICBpZiAoSXNPYmplY3Qoc2Vzc2lvbikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25bc2V0dGluZy5uYW1lXSA9IGV2ZW50LmNvbmZpZy5jb250cm9sLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlU2NoZW1lRmllbGRNYXBwaW5nKHNjaGVtZSwgJ2ZpZWxkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdG9yZUN1c3RvbVNldHRpbmcoY29yZSwgZXZlbnQpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgUG9wTG9nLmV2ZW50KHRoaXMubmFtZSwgYEN1c3RvbSBTZXR0aW5nIFNhdmVkOmAsIGV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBoaWRkZW46IDAsXG4gICAgICAgICAgICB3aGVuOiBzZXR0aW5nLndoZW4gPyBzZXR0aW5nLndoZW4gOiBudWxsLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgcG9zaXRpb246IGZpZWxkLnBvc2l0aW9uLFxuICAgICAgICAgIGFuY2lsbGFyeTogdHJ1ZSxcbiAgICAgICAgICBzb3J0OiBmaWVsZC5zb3J0LFxuICAgICAgICB9O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3RyYW5zZm9ybWF0aW9uJzpcbiAgICAgICAgY29tcG9uZW50ID0gPER5bmFtaWNDb21wb25lbnRJbnRlcmZhY2U+e1xuICAgICAgICAgIHR5cGU6IFBvcFNlbGVjdENvbXBvbmVudCxcbiAgICAgICAgICBpbnB1dHM6IHtcbiAgICAgICAgICAgIGNvcmU6IGNvcmUsXG4gICAgICAgICAgICBjb25maWc6IG5ldyBTZWxlY3RDb25maWcoe1xuICAgICAgICAgICAgICBuYW1lOiBzZXR0aW5nLm5hbWUsXG4gICAgICAgICAgICAgIGxhYmVsOiBzZXR0aW5nLmxhYmVsID8gc2V0dGluZy5sYWJlbCA6IFRpdGxlQ2FzZShTbmFrZVRvUGFzY2FsKHNldHRpbmcubmFtZSkpLFxuICAgICAgICAgICAgICBoZWxwVGV4dDogc2V0dGluZy5oZWxwVGV4dCA/IHNldHRpbmcuaGVscFRleHQgOiBudWxsLFxuICAgICAgICAgICAgICB2YWx1ZTogc2V0dGluZy52YWx1ZSA/IDxhbnk+c2V0dGluZy52YWx1ZSA6IHNldHRpbmcuZGVmYXVsdFZhbHVlLFxuICAgICAgICAgICAgICBkaXNhYmxlZDogIWhhc0FjY2VzcyxcbiAgICAgICAgICAgICAgZmFjYWRlOiB0cnVlLFxuICAgICAgICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgdmFsdWVzOiBDb252ZXJ0QXJyYXlUb09wdGlvbkxpc3Qoc2V0dGluZy5vcHRpb25zLnZhbHVlcywge1xuICAgICAgICAgICAgICAgICAgZW1wdHk6IHNldHRpbmcub3B0aW9ucy5lbXB0eSxcbiAgICAgICAgICAgICAgICAgIHNvcnQ6IHRydWUsXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgbWV0YWRhdGE6IHtcbiAgICAgICAgICAgICAgICBzZXR0aW5nOiBzZXR0aW5nXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHBhdGNoOiB7XG4gICAgICAgICAgICAgICAgZHVyYXRpb246IDUwMCxcbiAgICAgICAgICAgICAgICBmaWVsZDogYGAsXG4gICAgICAgICAgICAgICAgcGF0aDogYGAsXG4gICAgICAgICAgICAgICAgY2FsbGJhY2s6IChjb3JlMjogQ29yZUNvbmZpZywgZXZlbnQ6IFBvcEJhc2VFdmVudEludGVyZmFjZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgaWYgKElzVmFsaWRGaWVsZFBhdGNoRXZlbnQoY29yZSwgZXZlbnQpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChJc09iamVjdChzY2hlbWUsIHRydWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2Vzc2lvbiA9IHRoaXMuZ2V0U2NoZW1lRmllbGRTZWN0aW9uKHNjaGVtZSwgK2ZpZWxkLmlkLCAnc2V0dGluZycpO1xuICAgICAgICAgICAgICAgICAgICAgIGlmIChJc09iamVjdChzZXNzaW9uKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbltzZXR0aW5nLm5hbWVdID0gZXZlbnQuY29uZmlnLmNvbnRyb2wudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGVTY2hlbWVGaWVsZE1hcHBpbmcoc2NoZW1lLCAnZmllbGQnKTtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdG9yZUN1c3RvbVNldHRpbmcoY29yZSwgZXZlbnQpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgUG9wTG9nLmV2ZW50KHRoaXMubmFtZSwgYEN1c3RvbSBTZXR0aW5nIFNhdmVkOmAsIGV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIGhpZGRlbjogMCxcbiAgICAgICAgICAgIHdoZW46IHNldHRpbmcud2hlbiA/IHNldHRpbmcud2hlbiA6IG51bGwsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBwb3NpdGlvbjogZmllbGQucG9zaXRpb24sXG4gICAgICAgICAgYW5jaWxsYXJ5OiB0cnVlLFxuICAgICAgICAgIHNvcnQ6IGZpZWxkLnNvcnQsXG4gICAgICAgIH07XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAndHJhaXQnOlxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2ZpeGVkJzpcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBjb21wb25lbnQgPSA8RHluYW1pY0NvbXBvbmVudEludGVyZmFjZT57XG4gICAgICAgICAgdHlwZTogUG9wU3dpdGNoQ29tcG9uZW50LFxuICAgICAgICAgIGlucHV0czoge1xuICAgICAgICAgICAgY29yZTogY29yZSxcbiAgICAgICAgICAgIGNvbmZpZzogbmV3IFN3aXRjaENvbmZpZyh7XG4gICAgICAgICAgICAgIG5hbWU6IHNldHRpbmcubmFtZSxcbiAgICAgICAgICAgICAgbGFiZWw6IHNldHRpbmcubGFiZWwgPyBzZXR0aW5nLmxhYmVsIDogVGl0bGVDYXNlKFNuYWtlVG9QYXNjYWwoc2V0dGluZy5uYW1lKSksXG4gICAgICAgICAgICAgIGhlbHBUZXh0OiBzZXR0aW5nLmhlbHBUZXh0ID8gc2V0dGluZy5oZWxwVGV4dCA6IG51bGwsXG4gICAgICAgICAgICAgIHZhbHVlOiB0eXBlb2Ygc2V0dGluZy52YWx1ZSAhPT0gJ3VuZGVmaW5lZCcgPyA8Ym9vbGVhbj5zZXR0aW5nLnZhbHVlIDogPGJvb2xlYW4+c2V0dGluZy5kZWZhdWx0VmFsdWUsXG4gICAgICAgICAgICAgIGZhY2FkZTogdHJ1ZSxcbiAgICAgICAgICAgICAgbWV0YWRhdGE6IHtcbiAgICAgICAgICAgICAgICBzZXR0aW5nOiBzZXR0aW5nXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIGhpZGRlbjogMCxcbiAgICAgICAgICAgIHdoZW46IHNldHRpbmcud2hlbiA/IHNldHRpbmcud2hlbiA6IG51bGwsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBwb3NpdGlvbjogZmllbGQucG9zaXRpb24sXG4gICAgICAgICAgYW5jaWxsYXJ5OiB0cnVlLFxuICAgICAgICAgIHNvcnQ6IGZpZWxkLnNvcnQsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbXBvbmVudDtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFN0b3JlIGEgY3VzdG9tIHNldHRpbmdcbiAgICogRGV0ZXJtaW5lIHdoZXRoZXIgdGhlIHNldHRpbmcgYWxyZWFkeSBleGlzdHMgaW4gdGhlIGRhdGFiYXNlLCBwb3N0IG9yIHBhdGNoIGFjY29yZGluZ2x5XG4gICAqIEBwYXJhbSBjb3JlXG4gICAqIEBwYXJhbSBldmVudFxuICAgKi9cbiAgc3RvcmVDdXN0b21TZXR0aW5nKGNvcmU6IENvcmVDb25maWcsIGV2ZW50OiBQb3BCYXNlRXZlbnRJbnRlcmZhY2UpOiBQcm9taXNlPGJvb2xlYW4gfCBzdHJpbmc+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8Ym9vbGVhbiB8IHN0cmluZz4oKHJlc29sdmUpID0+IHtcbiAgICAgIC8vIFBvcFRlbXBsYXRlLmJ1ZmZlcigpO1xuICAgICAgUG9wTG9nLmV2ZW50KHRoaXMubmFtZSwgYHN0b3JlQ3VzdG9tU2V0dGluZ2AsIGV2ZW50KTtcbiAgICAgIGNvbnN0IHNldHRpbmcgPSBldmVudC5jb25maWcubWV0YWRhdGEuc2V0dGluZztcbiAgICAgIGNvbnN0IGJvZHkgPSA8YW55PntcbiAgICAgICAgdmFsdWU6IGV2ZW50LmNvbmZpZy5jb250cm9sLnZhbHVlXG4gICAgICB9O1xuICAgICAgaWYgKCtzZXR0aW5nLmZpZWxkX2lkKSBib2R5LmZpZWxkX2lkID0gK3NldHRpbmcuZmllbGRfaWQ7XG4gICAgICBpZiAoK3NldHRpbmcuZmllbGRfaXRlbV9pZCkgYm9keS5maWVsZF9pdGVtX2lkID0gK3NldHRpbmcuZmllbGRfaXRlbV9pZDtcbiAgICAgIGNvbnN0IGZpZWxkSWQgPSArc2V0dGluZy5maWVsZF9pZCA/ICtzZXR0aW5nLmZpZWxkX2lkIDogY29yZS5lbnRpdHkuaWQ7XG4gICAgICBsZXQgcmVxdWVzdCA9IDxPYnNlcnZhYmxlPGFueT4+dW5kZWZpbmVkO1xuICAgICAgaWYgKHNldHRpbmcuaWQpIHtcbiAgICAgICAgcmVxdWVzdCA9IFBvcFJlcXVlc3QuZG9QYXRjaChgYXBwcy9maWVsZHMvJHtmaWVsZElkfS9jb25maWdzLyR7c2V0dGluZy5pZH1gLCBib2R5LCAxLCBmYWxzZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBib2R5Lm5hbWUgPSBzZXR0aW5nLm5hbWU7XG4gICAgICAgIGJvZHkudHlwZSA9IHNldHRpbmcudHlwZTtcbiAgICAgICAgcmVxdWVzdCA9IFBvcFJlcXVlc3QuZG9Qb3N0KGBhcHBzL2ZpZWxkcy8ke2ZpZWxkSWR9L2NvbmZpZ3NgLCBib2R5LCAxLCBmYWxzZSk7XG4gICAgICB9XG5cbiAgICAgIHJlcXVlc3Quc3Vic2NyaWJlKChyZXMpID0+IHtcbiAgICAgICAgaWYgKHJlcy5kYXRhKSByZXMgPSByZXMuZGF0YTtcbiAgICAgICAgaWYgKElzT2JqZWN0KHJlcywgWydpZCddKSkge1xuXG4gICAgICAgICAgZXZlbnQuY29uZmlnLm1ldGFkYXRhLnNldHRpbmcgPSB7Li4uZXZlbnQuY29uZmlnLm1ldGFkYXRhLnNldHRpbmcsIC4uLkNsZWFuT2JqZWN0KHJlcyl9O1xuICAgICAgICAgIGlmIChzZXR0aW5nLml0ZW0pIHtcbiAgICAgICAgICAgIC8vIFRvRG86OiBTdG9yZSBhIHNldGluZyBvbiB0byBhIGZpZWxkIGl0ZW1cbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdzYXZlIG9uIGl0ZW0nLCBjb3JlLmVudGl0eSk7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnc2V0dGluZycsIHJlcyk7XG5cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29yZS5lbnRpdHkuY3VzdG9tX3NldHRpbmdbc2V0dGluZy5uYW1lXS52YWx1ZSA9IGJvZHkudmFsdWU7XG4gICAgICAgICAgICBjb3JlLmVudGl0eS5zZXR0aW5nW3NldHRpbmcubmFtZV0gPSBib2R5LnZhbHVlO1xuICAgICAgICAgICAgY29uc3QgbmFtZUxvb2t1cCA9IEFycmF5TWFwU2V0dGVyKGNvcmUuZW50aXR5LmNvbmZpZ3MuZmllbGRfY29uZmlncywgJ25hbWUnKTtcbiAgICAgICAgICAgIGlmIChzZXR0aW5nLm5hbWUgaW4gbmFtZUxvb2t1cCkge1xuICAgICAgICAgICAgICBjb3JlLmVudGl0eS5jb25maWdzLmZpZWxkX2NvbmZpZ3NbbmFtZUxvb2t1cFtzZXR0aW5nLm5hbWVdXSA9IHsuLi5ldmVudC5jb25maWcubWV0YWRhdGEuc2V0dGluZ307XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjb3JlLmVudGl0eS5jb25maWdzLmZpZWxkX2NvbmZpZ3MucHVzaChldmVudC5jb25maWcubWV0YWRhdGEuc2V0dGluZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMudHJpZ2dlckZpZWxkUHJldmlld1VwZGF0ZSgpO1xuICAgICAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgICAgICB9XG4gICAgICB9LCAoZXJyKSA9PiB7XG4gICAgICAgIHJldHVybiByZXNvbHZlKEdldEh0dHBFcnJvck1zZyhlcnIpKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHJlc29sdmUodHJ1ZSk7XG4gICAgfSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBTdG9yZSBhIGN1c3RvbSBzZXR0aW5nXG4gICAqIERldGVybWluZSB3aGV0aGVyIHRoZSBzZXR0aW5nIGFscmVhZHkgZXhpc3RzIGluIHRoZSBkYXRhYmFzZSwgcG9zdCBvciBwYXRjaCBhY2NvcmRpbmdseVxuICAgKiBAcGFyYW0gY29yZVxuICAgKiBAcGFyYW0gZXZlbnRcbiAgICovXG4gIHN0b3JlRmllbGRJdGVtUnVsZShjb3JlOiBDb3JlQ29uZmlnLCBmaWVsZEl0ZW06IEZpZWxkSXRlbUludGVyZmFjZSwgZXZlbnQ6IFBvcEJhc2VFdmVudEludGVyZmFjZSk6IFByb21pc2U8Ym9vbGVhbiB8IHN0cmluZz4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxib29sZWFuIHwgc3RyaW5nPigocmVzb2x2ZSkgPT4ge1xuICAgICAgbGV0IHJlcXVlc3QgPSA8T2JzZXJ2YWJsZTxhbnk+PnVuZGVmaW5lZDtcbiAgICAgIGNvbnN0IHJ1bGUgPSBldmVudC5jb25maWcubWV0YWRhdGEucnVsZTtcbiAgICAgIGNvbnN0IGZpZWxkSXRlbUlkID0gZmllbGRJdGVtLmlkO1xuICAgICAgY29uc3QgdmFsdWUgPSBldmVudC5jb25maWcuY29udHJvbC52YWx1ZTtcblxuICAgICAgY29uc3QgYm9keSA9IDxhbnk+e1xuICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICB9O1xuXG4gICAgICBpZiAoSXNPYmplY3QocnVsZS52YWxpZGF0aW9uTWFwLCB0cnVlKSkge1xuICAgICAgICBydWxlLnZhbGlkYXRpb24gPSBydWxlLnZhbGlkYXRpb25NYXBbU3RyaW5nKHZhbHVlKV07XG4gICAgICB9XG4gICAgICBpZiAocnVsZS52YWxpZGF0aW9uKSB7XG4gICAgICAgIGJvZHkuZmllbGRfdmFsaWRhdGlvbl9pZCA9IHJ1bGUudmFsaWRhdGlvbi5pZDtcbiAgICAgICAgaWYgKHJ1bGUudmFsaWRhdGlvbi5maXhlZCkge1xuICAgICAgICAgIHJ1bGUudmFsdWUgPSBydWxlLnZhbGlkYXRpb24udmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJ1bGUudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgLy8gcGFzc1xuICAgICAgfVxuXG5cbiAgICAgIGlmIChydWxlLmZpZWxkX2lkKSB7IC8vIHBhdGNoXG4gICAgICAgIHJlcXVlc3QgPSBQb3BSZXF1ZXN0LmRvUGF0Y2goYGZpZWxkcy8ke2ZpZWxkSXRlbUlkfS9ydWxlcy8ke3J1bGUuaWR9YCwgYm9keSwgMSwgZmFsc2UpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYm9keS5maWVsZF9pdGVtX2lkID0gbnVsbDtcbiAgICAgICAgYm9keS5uYW1lID0gcnVsZS5uYW1lO1xuICAgICAgICByZXF1ZXN0ID0gUG9wUmVxdWVzdC5kb1Bvc3QoYGZpZWxkcy8ke2ZpZWxkSXRlbUlkfS9ydWxlc2AsIGJvZHksIDEsIGZhbHNlKTtcbiAgICAgIH1cblxuICAgICAgcmVxdWVzdC5zdWJzY3JpYmUoKHJlcykgPT4ge1xuICAgICAgICByZXMgPSBHZXRIdHRwT2JqZWN0UmVzdWx0KHJlcyk7XG4gICAgICAgIGlmIChJc09iamVjdChyZXMsIFsndmFsdWUnXSkpIHtcbiAgICAgICAgICAvLyBldmVudC5jb25maWcubWV0YWRhdGEucnVsZSA9IHJlcztcbiAgICAgICAgICBmaWVsZEl0ZW0ucnVsZVtydWxlLm5hbWVdID0gdmFsdWU7XG4gICAgICAgICAgdGhpcy50cmlnZ2VyRmllbGRQcmV2aWV3VXBkYXRlKCk7XG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9LCAoZXJyKSA9PiB7XG4gICAgICAgIHJldHVybiByZXNvbHZlKEdldEh0dHBFcnJvck1zZyhlcnIpKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cblxuICAvKipcbiAgICogVHJpZ2dlciB0aGUgZmllbGQgcHJ2aWV3IGNvbXBvbmVudCB0byB1cGRhdGVcbiAgICovXG4gIHRyaWdnZXJGaWVsZFByZXZpZXdVcGRhdGUoKSB7XG4gICAgaWYgKElzT2JqZWN0KHRoaXMuYXNzZXQuY29yZSwgWydjaGFubmVsJ10pKSB7XG4gICAgICB0aGlzLmRvbS5zZXRUaW1lb3V0KCd0cmlnZ2VyLXByZXZpZXcnLCAoKSA9PiB7XG4gICAgICAgIHRoaXMuYXNzZXQuY29yZS5jaGFubmVsLm5leHQoe1xuICAgICAgICAgIHNvdXJjZTogdGhpcy5uYW1lLFxuICAgICAgICAgIHRhcmdldDogJ1BvcEVudGl0eUZpZWxkUHJldmlld0NvbXBvbmVudCcsXG4gICAgICAgICAgdHlwZTogJ2NvbXBvbmVudCcsXG4gICAgICAgICAgbmFtZTogJ3VwZGF0ZSdcbiAgICAgICAgfSk7XG4gICAgICB9LCAwKTtcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBDbGVhbnVwIHRpbWVvdXRzLCBpbnRlcnZhbHMsIHN1YnNjcmlwdGlvbnMsIGV0Y1xuICAgKi9cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgc3VwZXIubmdPbkRlc3Ryb3koKTtcbiAgfVxuXG5cbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBVbmRlciBUaGUgSG9vZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIFByaXZhdGUgTWV0aG9kICkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiAgLy8gcHJpdmF0ZSBfdXBkYXRlU2NoZW1lRmllbGRNYXBwaW5nKCBzY2hlbWU6IEVudGl0eVNjaGVtZVNlY3Rpb25JbnRlcmZhY2UsIGtleTogc3RyaW5nICl7XG4gIC8vICAgaWYoIElzT2JqZWN0KCBzY2hlbWUsIFsgJ2lkJywgJ21hcHBpbmcnIF0gKSAmJiBJc1N0cmluZygga2V5LCB0cnVlICkgJiYga2V5IGluIHNjaGVtZS5tYXBwaW5nICl7XG4gIC8vICAgICB0aGlzLmRvbS5zZXRUaW1lb3V0KCBgdXBkYXRlLXNjaGVtZS1maWVsZC0ke2tleX1gLCAoKSA9PiB7XG4gIC8vICAgICAgIGNvbnN0IGJvZHkgPSB7IG1hcHBpbmc6IHt9IH07XG4gIC8vICAgICAgIC8vIGJvZHkubWFwcGluZ1sga2V5IF0gPSBzY2hlbWUubWFwcGluZ1sga2V5IF07XG4gIC8vICAgICAgIGJvZHkubWFwcGluZyA9IHNjaGVtZS5tYXBwaW5nO1xuICAvLyAgICAgICB0aGlzLmRvbS5zZXRTdWJzY3JpYmVyKCBgdXBkYXRlLXNjaGVtZS1maWVsZC0ke2tleX1gLCBQb3BSZXF1ZXN0LmRvUGF0Y2goIGBwcm9maWxlLXNjaGVtZXMvJHtzY2hlbWUuaWR9YCwgYm9keSwgMSwgZmFsc2UgKS5zdWJzY3JpYmUoICggcmVzICkgPT4ge1xuICAvLyAgICAgICAgIHJlcyA9IEdldEh0dHBSZXN1bHQoIHJlcyApO1xuICAvLyAgICAgICAgIGNvbnNvbGUubG9nKCAnX3VwZGF0ZVNjaGVtZUZpZWxkTWFwcGluZycsIHJlcyApO1xuICAvLyAgICAgICB9LCAoIGVyciApID0+IHtcbiAgLy8gICAgICAgICBQb3BMb2cuZXJyb3IoIHRoaXMubmFtZSwgYF9zZXRGaWVsZEVudHJ5VmFsdWVzYCwgR2V0SHR0cEVycm9yTXNnKCBlcnIgKSApO1xuICAvLyAgICAgICB9ICkgKTtcbiAgLy8gICAgIH0sIDAgKTtcbiAgLy8gICB9XG4gIC8vIH1cblxuXG4gIHByaXZhdGUgX3VwZGF0ZVNjaGVtZUZpZWxkTWFwcGluZyhzY2hlbWU6IEVudGl0eVNjaGVtZVNlY3Rpb25JbnRlcmZhY2UsIGtleTogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGJvb2xlYW4+KGFzeW5jIChyZXNvbHZlKSA9PiB7XG4gICAgICBpZiAoSXNPYmplY3Qoc2NoZW1lLCBbJ2lkJywgJ21hcHBpbmcnXSkgJiYgSXNTdHJpbmcoa2V5LCB0cnVlKSAmJiBrZXkgaW4gc2NoZW1lLm1hcHBpbmcpIHtcbiAgICAgICAgdGhpcy5kb20uc2V0VGltZW91dChgdXBkYXRlLXNjaGVtZS1maWVsZC0ke2tleX1gLCAoKSA9PiB7XG4gICAgICAgICAgY29uc3QgYm9keSA9IHttYXBwaW5nOiB7fX07XG4gICAgICAgICAgLy8gYm9keS5tYXBwaW5nWyBrZXkgXSA9IHNjaGVtZS5tYXBwaW5nWyBrZXkgXTtcbiAgICAgICAgICBib2R5Lm1hcHBpbmcgPSBzY2hlbWUubWFwcGluZztcbiAgICAgICAgICB0aGlzLmRvbS5zZXRTdWJzY3JpYmVyKGB1cGRhdGUtc2NoZW1lLWZpZWxkLSR7a2V5fWAsIFBvcFJlcXVlc3QuZG9QYXRjaChgcHJvZmlsZS1zY2hlbWVzLyR7c2NoZW1lLmlkfWAsIGJvZHksIDEsIGZhbHNlKS5zdWJzY3JpYmUoKHJlcykgPT4ge1xuICAgICAgICAgICAgcmVzID0gR2V0SHR0cFJlc3VsdChyZXMpO1xuLy8gICAgICAgICAgICAgY29uc29sZS5sb2coICdfdXBkYXRlU2NoZW1lRmllbGRNYXBwaW5nJywgcmVzICk7XG4gICAgICAgICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICB9LCAoZXJyKSA9PiB7XG4gICAgICAgICAgICBQb3BMb2cuZXJyb3IodGhpcy5uYW1lLCBgX3NldEZpZWxkRW50cnlWYWx1ZXNgLCBHZXRIdHRwRXJyb3JNc2coZXJyKSk7XG4gICAgICAgICAgICByZXR1cm4gcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgfSkpO1xuICAgICAgICB9LCAwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiByZXNvbHZlKGZhbHNlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEFzc2lnbiB0aGUgY3VzdG9tIHNldHRpbmcgdmFsdWVzIGFuZCBjb25maWcgdGhhdCBleGlzdCBmb3IgdGhpcyBmaWVsZFxuICAgKiBAcGFyYW0gZmllbGRcbiAgICogQHBhcmFtIHN0b3JlZFxuICAgKi9cbiAgcHJpdmF0ZSBfc2V0RmllbGRDdXN0b21TZXR0aW5ncyhmaWVsZDogRmllbGRJbnRlcmZhY2UsIHNjaGVtZT86IEVudGl0eVNjaGVtZVNlY3Rpb25JbnRlcmZhY2UpIHtcbiAgICBpZiAoSXNPYmplY3QoZmllbGQsIFsnZmllbGRncm91cCcsICdjb25maWdzJ10pKSB7XG4gICAgICBjb25zdCBzdG9yZWQgPSBmaWVsZC5jb25maWdzO1xuICAgICAgY29uc3QgZmllbGRTZXR0aW5ncyA9IEdldEN1c3RvbUZpZWxkU2V0dGluZ3MoZmllbGQpO1xuXG4gICAgICBjb25zdCBjdXN0b21TZXR0aW5ncyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoey4uLkVudGl0eUZpZWxkU2V0dGluZywgLi4uZmllbGRTZXR0aW5nc30pKTtcblxuICAgICAgLy8gY29uc29sZS5sb2coICdjdXN0b21TZXR0aW5ncycsIGN1c3RvbVNldHRpbmdzICk7XG4gICAgICAvLyBjb25zb2xlLmxvZygnc3RvcmVkJywgc3RvcmVkKTtcblxuICAgICAgaWYgKElzT2JqZWN0KGN1c3RvbVNldHRpbmdzLCB0cnVlKSkge1xuICAgICAgICBjb25zdCBpdGVtSWRMb29rdXAgPSBBcnJheU1hcFNldHRlcig8YW55W10+ZmllbGQuaXRlbXMsICdpZCcpO1xuICAgICAgICBjb25zdCBpdGVtTmFtZUxvb2t1cCA9IEFycmF5TWFwU2V0dGVyKDxhbnlbXT5maWVsZC5pdGVtcywgJ25hbWUnKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ2l0ZW1OYW1lTG9va3VwJywgaXRlbU5hbWVMb29rdXApO1xuXG4gICAgICAgIE9iamVjdC5rZXlzKGN1c3RvbVNldHRpbmdzKS5tYXAoKHNldHRpbmdOYW1lOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICBjb25zdCBzZXR0aW5nID0gY3VzdG9tU2V0dGluZ3Nbc2V0dGluZ05hbWVdO1xuICAgICAgICAgIGlmIChJc09iamVjdChzZXR0aW5nLCB0cnVlKSkge1xuICAgICAgICAgICAgaWYgKHNldHRpbmcuaXRlbSkge1xuXG4gICAgICAgICAgICAgIGlmIChzZXR0aW5nLml0ZW0gaW4gaXRlbU5hbWVMb29rdXApIHtcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnc2V0dGluZycsIHNldHRpbmcpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSBmaWVsZC5pdGVtc1tpdGVtTmFtZUxvb2t1cFtzZXR0aW5nLml0ZW1dXTtcblxuICAgICAgICAgICAgICAgIGlmICghaXRlbS5jdXN0b21fc2V0dGluZykgaXRlbS5jdXN0b21fc2V0dGluZyA9IHt9O1xuICAgICAgICAgICAgICAgIGlmICghaXRlbS5zZXR0aW5nKSBpdGVtLnNldHRpbmcgPSB7fTtcbiAgICAgICAgICAgICAgICBzZXR0aW5nLmZpZWxkX2l0ZW1faWQgPSBpdGVtLmZpZWxkX2l0ZW1faWQ7XG4gICAgICAgICAgICAgICAgc2V0dGluZy5maWVsZF9pZCA9IGl0ZW0uaWQ7XG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ2l0ZW0nLCBpdGVtKTtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHNldHRpbmcudmFsdWUgPyBzZXR0aW5nLnZhbHVlIDogc2V0dGluZy5kZWZhdWx0VmFsdWU7XG4gICAgICAgICAgICAgICAgaXRlbS5jdXN0b21fc2V0dGluZ1tzZXR0aW5nTmFtZV0gPSBzZXR0aW5nO1xuICAgICAgICAgICAgICAgIGl0ZW0uc2V0dGluZ1tzZXR0aW5nTmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBpZiAoIWZpZWxkLmN1c3RvbV9zZXR0aW5nKSBmaWVsZC5jdXN0b21fc2V0dGluZyA9IHt9O1xuICAgICAgICAgICAgICBpZiAoIWZpZWxkLnNldHRpbmcpIGZpZWxkLnNldHRpbmcgPSB7fTtcbiAgICAgICAgICAgICAgaWYgKCFmaWVsZC50cmFpdCkgZmllbGQudHJhaXQgPSB7fTtcbiAgICAgICAgICAgICAgbGV0IHZhbHVlO1xuICAgICAgICAgICAgICBpZiAoSXNPYmplY3Qoc2NoZW1lLCB0cnVlKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHN0b3JhZ2UgPSB0aGlzLmdldFNjaGVtZUZpZWxkU2VjdGlvbihzY2hlbWUsICtmaWVsZC5pZCwgJ3NldHRpbmcnKTtcbiAgICAgICAgICAgICAgICBpZiAoSXNPYmplY3Qoc3RvcmFnZSwgdHJ1ZSkgJiYgc2V0dGluZy5uYW1lIGluIHN0b3JhZ2UpIHtcbiAgICAgICAgICAgICAgICAgIHZhbHVlID0gc3RvcmFnZVtzZXR0aW5nLm5hbWVdO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICB2YWx1ZSA9IHNldHRpbmcudmFsdWUgPyBzZXR0aW5nLnZhbHVlIDogc2V0dGluZy5kZWZhdWx0VmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhbHVlID0gc2V0dGluZy52YWx1ZSA/IHNldHRpbmcudmFsdWUgOiBzZXR0aW5nLmRlZmF1bHRWYWx1ZTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGlmIChzZXR0aW5nLnR5cGUgPT09ICd0cmFpdCcpIHtcbiAgICAgICAgICAgICAgICBmaWVsZC50cmFpdFtzZXR0aW5nTmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmaWVsZC5jdXN0b21fc2V0dGluZ1tzZXR0aW5nTmFtZV0gPSBzZXR0aW5nO1xuICAgICAgICAgICAgICAgIGZpZWxkLnNldHRpbmdbc2V0dGluZ05hbWVdID0gdmFsdWU7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cblxuICAgICAgICBpZiAoSXNBcnJheShzdG9yZWQuZmllbGRfY29uZmlncywgdHJ1ZSkpIHtcbiAgICAgICAgICBzdG9yZWQuZmllbGRfY29uZmlncy5tYXAoKHNldHRpbmcpID0+IHtcbiAgICAgICAgICAgIGlmICghZmllbGQuY3VzdG9tX3NldHRpbmdbc2V0dGluZy5uYW1lXSkge1xuICAgICAgICAgICAgICAvLyBUb0RvOjogRG8gV2Ugd2FudCB0byBhbGxvdyB0aGUgZGF0YWJhc2UgdG8gcGFzcyBpbiBjb25maWdzIHRoYXQgYXJlIG5vdCBsb2NhbFxuICAgICAgICAgICAgICAvLyBmaWVsZC5jdXN0b21fc2V0dGluZ1sgc2V0dGluZy5uYW1lIF0gPSBzZXR0aW5nO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgZmllbGQuY3VzdG9tX3NldHRpbmdbc2V0dGluZy5uYW1lXS5pZCA9IHNldHRpbmcuaWQ7XG4gICAgICAgICAgICAgIGZpZWxkLmN1c3RvbV9zZXR0aW5nW3NldHRpbmcubmFtZV0udmFsdWUgPSBzZXR0aW5nLnZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmllbGQuc2V0dGluZ1tzZXR0aW5nLm5hbWVdID0gc2V0dGluZy52YWx1ZTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChJc09iamVjdChzdG9yZWQuaXRlbV9jb25maWdzLCB0cnVlKSkge1xuICAgICAgICAgIE9iamVjdC5rZXlzKHN0b3JlZC5pdGVtX2NvbmZpZ3MpLm1hcCgoZmllbGRJdGVtSWQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGZpZWxkSXRlbUNvbmZpZ3MgPSBzdG9yZWQuaXRlbV9jb25maWdzW2ZpZWxkSXRlbUlkXTtcbiAgICAgICAgICAgIGlmIChJc0FycmF5KGZpZWxkSXRlbUNvbmZpZ3MsIHRydWUpKSB7XG4gICAgICAgICAgICAgIGZpZWxkSXRlbUNvbmZpZ3MubWFwKChzZXR0aW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHNldHRpbmcuZmllbGRfaWQgaW4gaXRlbUlkTG9va3VwKSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCBpdGVtID0gZmllbGQuaXRlbXNbaXRlbUlkTG9va3VwW3NldHRpbmcuZmllbGRfaWRdXTtcblxuICAgICAgICAgICAgICAgICAgaWYgKCFpdGVtLmN1c3RvbV9zZXR0aW5nKSBpdGVtLmN1c3RvbV9zZXR0aW5nID0ge307XG4gICAgICAgICAgICAgICAgICBpZiAoIWl0ZW0uY3VzdG9tX3NldHRpbmdbc2V0dGluZy5uYW1lXSkge1xuICAgICAgICAgICAgICAgICAgICBpdGVtLmN1c3RvbV9zZXR0aW5nW3NldHRpbmcubmFtZV0gPSBzZXR0aW5nO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5jdXN0b21fc2V0dGluZ1tzZXR0aW5nLm5hbWVdLmlkID0gc2V0dGluZy5pZDtcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5jdXN0b21fc2V0dGluZ1tzZXR0aW5nLm5hbWVdLnZhbHVlID0gc2V0dGluZy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIGlmICghaXRlbS5zZXR0aW5nKSBpdGVtLnNldHRpbmcgPSB7fTtcbiAgICAgICAgICAgICAgICAgIGl0ZW0uc2V0dGluZ1tzZXR0aW5nLm5hbWVdID0gc2V0dGluZy52YWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIGNvbnNvbGUubG9nKCdzdG9yZWQgY3VzdG9tIHNldGluZ3MnLCBmaWVsZCwgc3RvcmVkKTtcbiAgICAgIC8vIGRlbGV0ZSBmaWVsZC5jb25maWdzO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIEVuc3VyZSB0aGF0IGF0IGxlYXN0IDEgbGFiZWwgZXhpc3RzXG4gICAqIEBwYXJhbSBmaWVsZFxuICAgKi9cbiAgcHJpdmF0ZSBfc2V0RmllbGRFbnRyeVZhbHVlcyhjb3JlOiBDb3JlQ29uZmlnLCBzY2hlbWU/OiBFbnRpdHlTY2hlbWVTZWN0aW9uSW50ZXJmYWNlKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGJvb2xlYW4+KChyZXNvbHZlKSA9PiB7XG4gICAgICBjb25zdCBmaWVsZCA9IDxGaWVsZEludGVyZmFjZT5jb3JlLmVudGl0eTtcbiAgICAgIGlmIChJc0FycmF5KGZpZWxkLmVudHJpZXMsIHRydWUpKSB7XG4gICAgICAgIGZpZWxkLmVudHJpZXMuc29ydChEeW5hbWljU29ydCgnc29ydF9vcmRlcicpKTtcbiAgICAgIH1cbiAgICAgIGlmICghKElzQXJyYXkoZmllbGQuZW50cmllcywgdHJ1ZSkpKSB7XG4gICAgICAgIGNvbnN0IGVudHJ5ID0ge1xuICAgICAgICAgIG5hbWU6IFRpdGxlQ2FzZShgJHsoZmllbGQubmFtZSA/IGZpZWxkLm5hbWUgOiBmaWVsZC5maWVsZGdyb3VwLm5hbWUpfWApLFxuICAgICAgICAgIHR5cGU6ICdwcm92aWRlZCcsXG4gICAgICAgICAgc29ydF9vcmRlcjogMCxcbiAgICAgICAgfTtcbiAgICAgICAgUG9wUmVxdWVzdC5kb1Bvc3QoYGZpZWxkcy8ke2ZpZWxkLmlkfS9lbnRyaWVzYCwgZW50cnksIDEsIGZhbHNlKS5zdWJzY3JpYmUoKHJlcykgPT4ge1xuICAgICAgICAgIHJlcyA9IHJlcy5kYXRhID8gcmVzLmRhdGEgOiByZXM7XG4gICAgICAgICAgZmllbGQuZW50cmllcyA9IFtyZXNdO1xuICAgICAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgICAgICB9LCAoZXJyKSA9PiB7XG4gICAgICAgICAgUG9wTG9nLmVycm9yKHRoaXMubmFtZSwgYF9zZXRGaWVsZEVudHJ5VmFsdWVzYCwgR2V0SHR0cEVycm9yTXNnKGVycikpO1xuICAgICAgICAgIHJldHVybiByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuIl19