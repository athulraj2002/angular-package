import { PopPipe, PopLog, PopApp, PopRouteAliasMap } from '../../pop-common.model';
import { ArrayKeyBy, CleanObject, ConvertArrayToOptionList, DeepCopy, DeepMerge, GetRouteAlias, InterpolateString, IsArray, IsDefined, IsNumber, IsObject, IsString, IsUndefined, PopTransform, SpaceToHyphenLower, StorageGetter, StringReplaceAll, TitleCase, ToObject } from '../../pop-common-utility';
import { TabMenuConfig } from '../base/pop-tab-menu/tab-menu.model';
import { SideBySideConfig } from '../base/pop-side-by-side/pop-side-by-side.model';
import { Validators } from '@angular/forms';
import { SelectConfig } from '../base/pop-field-item/pop-select/select-config.model';
import { SelectMultiConfig } from '../base/pop-field-item/pop-select-multi/select-mulit-config.model';
import { InputConfig } from '../base/pop-field-item/pop-input/input-config.model';
import { NumberConfig } from '../base/pop-field-item/pop-number/number-config.model';
import { DateConfig } from '../base/pop-field-item/pop-date/date-config.model';
import { TimeConfig } from '../base/pop-field-item/pop-time/time-config.model';
import { CheckboxConfig } from '../base/pop-field-item/pop-checkbox/checkbox-config.model';
import { SwitchConfig } from '../base/pop-field-item/pop-switch/switch-config.model';
import { MinMaxConfig } from '../base/pop-field-item/pop-min-max/min-max.models';
import { RadioConfig } from '../base/pop-field-item/pop-radio/radio-config.model';
import { TextareaConfig } from '../base/pop-field-item/pop-textarea/textarea-config.model';
import { LabelConfig, MetadataConfig } from '../base/pop-field-item/pop-label/label-config.model';
import { ButtonConfig } from '../base/pop-field-item/pop-button/button-config.model';
import { EmailFieldSetting } from './pop-entity-field/pop-entity-email/email.setting';
import { AddressFieldSetting } from './pop-entity-field/pop-entity-address/address.setting';
import { PhoneFieldSetting } from './pop-entity-field/pop-entity-phone/phone.setting';
import { NameFieldSetting } from './pop-entity-field/pop-entity-name/name.setting';
import { InputFieldSetting } from './pop-entity-field/pop-entity-input/input.settings';
import { RadioFieldSetting } from './pop-entity-field/pop-entity-radio/radio.setting';
import { SwitchFieldSetting } from './pop-entity-field/pop-entity-switch/switch.setting';
import { SelectFieldSetting } from './pop-entity-field/pop-entity-select/select.setting';
import { CheckboxFieldSetting } from './pop-entity-field/pop-entity-checkbox/checkbox.setting';
import { TextareaFieldSetting } from './pop-entity-field/pop-entity-textarea/textarea.setting';
import { SelectFilterConfig } from '../base/pop-field-item/pop-select-filter/select-filter-config.model';
import { ValidatePassword, ValidatePhone, ValidateUrl, ValidateUsername } from '../../services/pop-validators';
import { TextConfig } from '../base/pop-field-item/pop-text/text-config.model';
import { SelectListConfig } from '../base/pop-field-item/pop-select-list/select-list-config.model';
import { DatePickerConfig } from '../base/pop-field-item/pop-datepicker/datepicker-config.model';
import { SelectModalConfig } from "../base/pop-field-item/pop-select-modal/select-modal-config.model";
/**
 * A helper method that will build out TabMenuConfig off of an entityConfig
 * @param entityConfig
 * @param tabs
 */
export function GetTabMenuConfig(core, tabs = []) {
    const tabMenuConfig = new TabMenuConfig({
        name: DetermineEntityName(core.entity),
        goBack: true,
        portal: false,
        tabs: tabs,
        buttons: GetTabMenuButtons(core),
    });
    return tabMenuConfig;
}
/**
 * Determine the buttons that should be shown for this entity
 * @param core
 */
export function GetTabMenuButtons(core) {
    let buttons = [];
    const defaultButtons = [
        { id: 'clone', name: 'Clone', accessType: 'can_update', hidden: false },
        // { id: 'archive', name: 'Archive', accessType: 'can_update', hidden: true },
        // { id: 'activate', name: 'Activate', accessType: 'can_update', hidden: true },
        { id: 'delete', name: 'Delete', accessType: 'can_delete', hidden: true },
        { id: 'close', name: 'Close', hidden: false },
    ];
    if (IsObject(core.repo.model.table.button, true)) {
        buttons = defaultButtons.filter((button) => {
            if (button.id === 'clone' && !core.repo.model.menu.button.clone)
                return false;
            // if( button.id === 'archive' && !core.repo.model.menu.button.archive ) return false;
            // if( button.id === 'activate' && !core.repo.model.menu.button.archive ) return false;
            if (button.id === 'delete' && !core.repo.model.menu.button.delete)
                return false;
            if (!button.accessType)
                return true;
            if (!core.access[button.accessType])
                return false;
            return true;
        });
    }
    return buttons;
}
/**
 * A helper method that sets up a FieldGroupConfig for a create/new pop-table-dialog
 * @param entityConfig
 * @param goToUrl
 */
export function GetObjectVar(obj, path) {
    const steps = path.split('.');
    const key = steps.pop();
    const pathStorage = StorageGetter(obj, steps);
    if (pathStorage) {
        return typeof pathStorage[key] !== 'undefined' ? pathStorage[key] : undefined;
    }
    else {
        return undefined;
    }
}
/**
 * Get a list of the transformations that are within a field set
 * @param obj
 * @constructor
 */
export function GetObjectTransformations(obj) {
    const transformations = [];
    Object.keys(obj).map((key) => {
        const field = obj[key];
        if (IsObject(field, ['model'])) {
            if (field.model && field.model.name && field.model.transformation) {
                transformations[field.model.name] = CleanObject({
                    type: field.model.transformation.type,
                    arg1: field.model.transformation.arg1 ? field.model.transformation.arg1 : null,
                    arg2: field.model.transformation.arg2 ? field.model.transformation.arg2 : null,
                    arg3: field.model.transformation.arg3 ? field.model.transformation.arg3 : null,
                });
            }
        }
        else if (IsObject(field, ['id', 'name'])) {
            console.log('with relation', key, obj[key]);
        }
        else {
            console.log('fail', key);
        }
    });
    return transformations;
}
export function SetCoreValue(core, entity_path, value) {
    const steps = entity_path.split('.');
    const key = steps.pop();
    const pathStorage = StorageGetter(core, steps);
    if (value === null) {
        delete pathStorage[key];
    }
    else {
        pathStorage[key] = value;
    }
}
/**
 * Parse a value with any mutations that need to be applied
 * @param value
 * @param core
 * @param blockEntity
 * @constructor
 */
export function ParseModelValue(value = '', core, blockEntity = false) {
    // console.log('ParseModelValue', value);
    let tmp = value;
    if (typeof tmp === 'undefined') {
        // console.log('zzz')
        return tmp;
    }
    if (tmp === 'null' || tmp === null) {
        // console.log( 'a', tmp );
        tmp = null;
    }
    else if (typeof tmp === 'boolean') {
        tmp = +tmp;
        // console.log( 'b', tmp );
    }
    else if (IsString(tmp, true)) {
        if (tmp.includes('/')) { // url
            if (core && core.params && IsString(tmp, true) && tmp.includes('#')) {
                tmp = ParseUrlForParams(tmp, core.params);
                // console.log( 'd', tmp );
            }
            if (!blockEntity && core && core.entity && IsString(tmp, true) && tmp.includes(':')) {
                const entityField = ParseStringForEntityField(tmp, core.entity);
                if (IsDefined(entityField, false)) {
                    tmp = entityField;
                }
                // console.log( 'e', tmp );
            }
            return tmp;
        }
        else {
            if (IsString(tmp, true) && tmp.includes('alias:')) {
                tmp = ParseForAlias(tmp);
                // console.log( 'f', tmp );
            }
            if (core) {
                if (tmp.includes('.') && !(tmp.includes('@')) && !(tmp.includes(' '))) { // object location
                    const coreVar = GetObjectVar(core, tmp);
                    if (typeof coreVar !== 'undefined')
                        tmp = coreVar;
                    // console.log( 'g', tmp );
                }
                if (core.params && IsString(tmp, true) && tmp.includes('#')) {
                    const paramsField = ParseStringForParams(tmp, core.params);
                    if (IsDefined(paramsField, false)) {
                        tmp = paramsField;
                    }
                    // console.log( 'h', tmp );
                }
                if (!blockEntity && core.entity && IsString(tmp, true) && tmp.includes(':')) {
                    const entityField = ParseStringForEntityField(tmp, core.entity);
                    if (IsDefined(entityField, false)) {
                        tmp = entityField;
                    }
                    // console.log( 'i', tmp );
                }
            }
        }
    }
    else if (IsNumber(tmp)) {
        // console.log( 'ca', tmp );
        tmp = Number(tmp);
        // console.log( 'c', tmp );
    }
    // console.log( 'after', tmp );
    return tmp;
}
/**
 * Look through an entire object and make the necessary mutations
 * @param obj
 * @param entityConfig
 * @constructor
 */
export function ParseObjectDefinitions(obj, entityConfig) {
    const definitions = {};
    let value;
    if (typeof obj !== 'undefined') {
        if (obj && Array.isArray(obj))
            obj = ToObject(obj);
        if (typeof obj === 'object') {
            Object.keys(obj).map((key) => {
                value = ParseModelValue(obj[key], entityConfig);
                definitions[key] = value;
            });
        }
    }
    return definitions;
}
/**
 * A method to translate entityId fields out of a url /#app/#plural_name/:entityId, (#) indicates a entityId param, (:) indicates a entityId field
 */
export function ParseUrlForEntityFields(url, entity) {
    if (url && url.includes(':')) {
        const start = url.indexOf(':');
        const end = url.indexOf('/', start) !== -1 ? url.indexOf('/', start) : url.length;
        const fieldName = url.substring(start + 1, end);
        url = url.replace(':' + fieldName, entity[fieldName]);
        if (url && url.includes(':')) {
            url = ParseUrlForEntityFields(url, entity);
        }
    }
    return url;
}
/**
 * Translate an aliases or mutations within a url
 * @param url
 * @param entity
 * @param ignore
 * @constructor
 */
export function ParseLinkUrl(url, entity = null, ignore = []) {
    if (url) {
        return url.split('/').map((part) => {
            if (part.includes('alias:')) {
                part = PopPipe.label.getAlias((part.split(':')[1]));
            }
            else if (part.includes(':') && entity) {
                if (!(ignore.includes(part))) {
                    part = part.split(':')[1];
                    if (part in entity)
                        part = entity[part];
                }
            }
            return part;
        }).join('/');
    }
    return url;
}
/**
 * A method to translate entityId params out of a url /#app/#plural_name/:entityId, (#) indicates a entityId param, (:) indicates a entityId field
 */
export function ParseUrlForParams(url, entityParams) {
    if (url && url.includes('#') && !(url.includes(' '))) {
        const start = url.indexOf('#');
        const end = url.indexOf('/', start) !== -1 ? url.indexOf('/', start) : url.length;
        const paramName = url.substring(start + 1, end);
        url = url.replace('#' + paramName, entityParams[paramName]);
        if (url && url.includes('#')) {
            url = ParseUrlForParams(url, entityParams);
        }
    }
    return url;
}
/**
 * A methid that replaces entityId aliases found in a string
 * @param string
 */
export function ParseForAlias(string) {
    if (IsString(string, true)) {
        let alias = false;
        const parts = [];
        string.split(':').map((part) => {
            if (part.includes('alias')) {
                alias = true;
            }
            else {
                parts.push(alias ? TitleCase(PopPipe.label.getAlias((part))) : part);
                alias = false;
            }
            return part;
        });
        return parts.join(' ');
    }
    return string;
}
/**
 * A method to translate entityId fields out of a string ':entityId' (:) indicates a entityId field
 */
export function ParseStringForEntityField(str, entity) {
    if (typeof (str) === 'string' && str.includes(':') && !(str.includes(' '))) {
        const start = str.indexOf(':');
        const end = str.indexOf('.', start) !== -1 ? str.indexOf('.', start) : str.length;
        const fieldName = str.substring(start + 1, end);
        if (IsDefined(entity[fieldName], false)) {
            str = str.replace(':' + fieldName, entity[fieldName]);
            if (str && str.includes(':')) {
                str = ParseStringForEntityField(str, entity);
            }
        }
    }
    else if (typeof (str) === 'string' && str.includes(':') && str.includes(' ')) {
        const parts = str.trim().split(' ');
        const partials = [];
        parts.map((part) => {
            const start = part.indexOf(':');
            const end = part.indexOf('.', start) !== -1 ? part.indexOf('.', start) : part.length;
            const fieldName = part.substring(start + 1, end);
            if (IsDefined(entity[fieldName], false)) {
                part = part.replace(':' + fieldName, entity[fieldName]);
                if (part && part.includes(':')) {
                    part = ParseStringForEntityField(part, entity);
                }
            }
            partials.push(part);
        });
        str = partials.join(' ').trim();
    }
    return str;
}
/**
 * A method that replaces entityId params found in a string
 * @param str
 * @param entityParams
 */
export function ParseStringForParams(str, entityParams, separator = '.') {
    if (typeof (str) === 'string' && str.includes('#')) {
        const start = str.indexOf('#');
        const end = str.indexOf(separator, start) !== -1 ? str.indexOf(separator, start) : str.length;
        const paramName = str.substring(start + 1, end);
        if (entityParams[paramName]) {
            str = str.replace('#' + paramName, entityParams[paramName]);
            if (str && str.includes('#')) {
                str = ParseStringForParams(str, entityParams);
            }
        }
    }
    return str;
}
/**
 * Helper function to set routes for an entity
 * @param routes
 * @param params
 * @constructor
 */
export function InterpolateEntityRoutes(routes, params) {
    if (IsObject(routes)) {
        const set = {};
        Object.keys(routes).map((method) => {
            set[method] = {};
            Object.keys(routes[method]).map((route) => {
                if (!set[method][route])
                    set[method][route] = {};
                set[method][route].path = String(ParseUrlForParams(routes[method][route].path, params)).trim();
                set[method][route].params = routes[method][route].params;
            });
        });
        return set;
    }
    else {
        return routes;
    }
}
/**
 * Helper function to set routes for an entity
 * @param routes
 * @param params
 * @constructor
 */
export function InterpolateEntityRoute(route, obj) {
    let path = InterpolateString(route, obj);
    path = StringReplaceAll(path, '\\/\\/', '\\/');
    return path;
}
/**
 * Remove all the empty values from an object
 * @param model
 * @constructor
 */
export function ClearEmptyValues(model) {
    const pointless = [null, undefined, ''];
    Object.getOwnPropertyNames(model).map((key) => {
        if (typeof key === 'string' && key.includes('_') == false && pointless.includes(model[key]) && key !== 'value') {
            delete model[key];
        }
        if (model[key] !== null && !Array.isArray(model[key]) && typeof model[key] === 'object') {
            model[key] = ClearEmptyValues(model[key]);
        }
    });
    return model;
}
/**
 * Get a name to display for an entity, use fall backs if necessary
 * @param entity
 * @constructor
 */
export function DetermineEntityName(entity) {
    let name = '';
    if (entity) {
        if (IsString(entity.label, true)) {
            name = entity.label;
        }
        else if (IsString(entity.name, true)) {
            name = entity.name;
        }
        else if (IsString(entity.display_name, true)) {
            name = entity.display_name;
        }
        else if (IsString(entity.first_name, true)) { //code change by Chetu Development Team on 17-05-2021
            name = entity.first_name + ' ' + entity.last_name;
        }
        else if (IsString(entity.email, true)) {
            name = entity.email;
        }
        else if (typeof entity.id !== 'undefined') {
            name = String(entity.id);
        }
    }
    return name;
}
/**
 * Parse conditional logic of a when statement
 * [
 *    first level is OR statements
 *    [ ...Every thing in the second level is an AND statement..., ['name', '=', 'user'], ['age', '>', 21] ],
 *    [key, '=', 'value ],
 *    [key, 'in', [1,2,3,45] ],
 * ]
 * @param obj
 * @param when
 * @param core
 * @constructor
 */
export function EvaluateWhenConditions(obj, when = null, core) {
    if (!when || when === null)
        return true;
    let pass = true;
    if (IsArray(when, true)) { // conditional logic to display fields
        let block;
        when = DeepCopy(when).filter((section) => IsArray(section, true));
        const isOrStatement = when.length > 1;
        if (isOrStatement) {
            // console.log('or check', obj, when, core);
            when.reverse();
            while (when.length) {
                block = when.pop().filter((section) => IsArray(section, true));
                pass = EvaluateWhenCondition(obj, block, core);
                if (pass)
                    break;
            }
        }
        else {
            // console.log('check', obj, when, core);
            pass = EvaluateWhenCondition(obj, when, core);
        }
    }
    else {
        pass = false;
    }
    return pass;
}
/**
 * Evaluate a single conditional block: [location, operator, value]
 * @param obj
 * @param block
 * @param core
 * @constructor
 */
export function EvaluateWhenCondition(obj, block, core) {
    const operators = ['=', '>', '>=', '<', 'truthy', 'falsey', 'length', 'contains'];
    let pass = true;
    let location;
    let operator;
    let value;
    if (IsArray(block, true)) {
        // expects array of arrays
        block.some((section) => {
            section.some((rule) => {
                // console.log('rule', rule);
                // console.log('has core', core);
                if (IsArray(rule, true)) {
                    location = rule[0];
                    if (rule.length === 1) {
                        operator = 'truthy';
                        value = undefined;
                    }
                    else if (rule.length === 2) {
                        operator = '=';
                        value = rule[1];
                        if (['truthy', 'falsey', 'length'].includes(value)) {
                            operator = value;
                            value = undefined;
                        }
                    }
                    else if (rule.length >= 2) {
                        operator = rule[1];
                        value = rule[2];
                    }
                    if (location && operator && operators.includes(operator)) {
                        if (IsString(location, true) && location in obj && obj[location]) {
                            location = obj[location];
                        }
                        else if (IsString(location, true) && location.includes('.')) {
                            location = GetObjectVar(obj, location);
                        }
                        else {
                            location = ParseModelValue(location, core);
                        }
                        if (IsString(value, true) && IsObject(core, [value])) {
                            value = ParseModelValue(value, core);
                        }
                        else if (IsString(value, true) && IsObject(obj, [value])) {
                            value = GetObjectVar(obj, value);
                        }
                        // console.log('location', location);
                        // console.log('operator', operator);
                        // console.log('value', value);
                        switch (operator) {
                            case 'contains':
                                if (IsArray(location)) {
                                    if (!(location.includes(value))) {
                                        pass = false;
                                        return true;
                                    }
                                }
                                else if (IsString(location)) {
                                    if (!(location.search(value) > -1)) {
                                        pass = false;
                                        return true;
                                    }
                                }
                                else if (IsObject(location)) {
                                    if (!(value in location)) {
                                        pass = false;
                                        return true;
                                    }
                                }
                                else {
                                    pass = false;
                                    return true;
                                }
                                break;
                            case 'length':
                                if (!(IsArray(location, true))) {
                                    pass = false;
                                    return true;
                                }
                                break;
                            case 'truthy':
                                if (!location) {
                                    pass = false;
                                    return true;
                                }
                                break;
                            case 'falsey':
                                if (location) {
                                    pass = false;
                                    return true;
                                }
                                break;
                            case '=':
                                if (location != value) {
                                    pass = false;
                                    return true;
                                }
                                break;
                            case '!=':
                                if (location == value) {
                                    pass = false;
                                    return true;
                                }
                                break;
                            case '>':
                                if (!(location > value)) {
                                    pass = false;
                                    return true;
                                }
                                break;
                            case '>=':
                                if (!(location >= value)) {
                                    pass = false;
                                    return true;
                                }
                                break;
                            case '<':
                                if (!(location < value)) {
                                    pass = false;
                                    return true;
                                }
                                break;
                            case '<=':
                                if (!(location <= value)) {
                                    pass = false;
                                    return true;
                                }
                                break;
                            default:
                                pass = false;
                                return true;
                                break;
                        }
                    }
                    else {
                        pass = false;
                        return true;
                    }
                }
                else {
                    pass = false;
                    return true;
                }
            });
            return pass === false;
        });
    }
    else {
        pass = false;
    }
    return pass;
}
/**
 * check if event matches the signature for a field patch
 * @param core
 * @param event
 * @constructor
 */
export function IsValidFieldPatchEvent(core, event) {
    if (IsObject(event, true)) {
        if (event.type === 'field' && event.name === 'patch' && event.success) {
            return true;
        }
        if (event.type === 'field' && event.name === 'onChange' && event.config.facade) {
            return true;
        }
    }
    return false;
}
/**
 * check if event matches the signature for a field patch
 * @param core
 * @param event
 * @constructor
 */
export function IsValidChangeEvent(core, event) {
    if (IsObject(event, true)) {
        if (event.type === 'field' && event.name === 'onChange') {
            return true;
        }
    }
    return false;
}
/**
 * Check if a event matches the same core signature of a core that belongs to a component
 * @param core
 * @param event
 * @constructor
 */
export function IsValidCoreSignature(core, event = null) {
    console.log(' IsValidCoreSignature core', core);
    console.log(' IsValidCoreSignature event', event);
    if (IsObject(core, true) && IsObject(core.entity)) {
        if (IsObject(event, true) && IsObject(event.core)) {
            return core === event.core;
        }
        return true;
    }
    console.log('IsValidCoreSignature, fail');
    return false;
}
export function GetCustomFieldSettings(field) {
    let fieldSettings = {};
    switch (String(field.fieldgroup.name).toLowerCase()) {
        case 'email':
            fieldSettings = EmailFieldSetting;
            break;
        case 'address':
            fieldSettings = AddressFieldSetting;
            break;
        case 'phone':
            fieldSettings = PhoneFieldSetting;
            break;
        case 'name':
            fieldSettings = NameFieldSetting;
            break;
        case 'textfield':
        case 'input':
            fieldSettings = InputFieldSetting;
            break;
        case 'radio':
            fieldSettings = RadioFieldSetting;
            break;
        case 'switch':
            fieldSettings = SwitchFieldSetting;
            break;
        case 'select':
            fieldSettings = SelectFieldSetting;
            break;
        case 'select-multi':
        case 'select_multi':
        case 'multi_selection':
            fieldSettings = SelectFieldSetting;
            break;
        case 'checkbox':
            fieldSettings = CheckboxFieldSetting;
            break;
        case 'textarea':
            fieldSettings = TextareaFieldSetting;
            break;
        default:
            fieldSettings = {};
    }
    return fieldSettings;
}
/**
 * Selection type fields require a list of options to present the user
 * The option values may be directly assigned on the field, point to a specific location in the entity data, or reference a resource that may exists in the entity models
 * ...
 * options:{
 *   ...
 *   values: FieldItemOptions[], resolve what is in this list
 *   ...
 * }
 * ...
 * @param core
 * @param options
 * @private
 */
export function ModelOptionValues(core, options) {
    if (IsObject(options, true)) {
        if (IsString(options.resource, true)) {
            if (IsObject(core.resource, true) && options.resource in core.resource && IsObject(core.resource[options.resource], ['data_values']) && IsArray(core.resource[options.resource].data_values, true)) {
                options.converted = false;
                options.rawValues = DeepCopy(core.resource[options.resource].data_values);
                // options.values = DeepCopy( core.resource[ options.resource ].data_values );
            }
        }
        else if (IsArray(options.values, true)) {
            options.converted = false;
            const tmp = DeepCopy(options.values);
            options.values = null;
            options.rawValues = tmp;
        }
        else if (IsString(options.values)) {
            const tmpOptions = GetObjectVar(core, options.values);
            if (IsArray(tmpOptions)) {
                options.converted = false;
                options.rawValues = DeepCopy(tmpOptions);
            }
            else {
                const tmp = ParseModelValue(options.values, core);
                if (IsArray(tmp, true)) {
                    options.converted = false;
                    options.rawValues = DeepCopy(tmp);
                }
            }
        }
    }
    return options;
}
/**
 * Get the rules that should be applied on this field
 * @param fieldItem
 * @private
 */
export function FieldItemRules(fieldItem) {
    const RuleSet = {};
    fieldItem.rule = {};
    const itemRules = IsArray(fieldItem.itemrules, true) ? fieldItem.itemrules : []; // default rules inherited from the field_item_id
    const fieldRules = IsArray(fieldItem.fieldrules, true) ? fieldItem.fieldrules : []; // rules specific to this field item
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
        }
    });
    // delete fieldItem.fieldrules;
    // delete fieldItem.itemrules;
}
export function FieldItemModel(core, fieldItem, checkAccess = true) {
    if (IsObject(fieldItem, true)) {
        let hasAccess = true;
        if (checkAccess) {
            hasAccess = core.access.can_update ? true : false;
            if (IsObject(core.entity, ['system']) && core.entity.system)
                hasAccess = false;
        }
        const showAsReadonly = +fieldItem.readonly ? true : (!hasAccess ? true : false);
        const allowPatch = IsObject(core.entity, ['id']) && IsObject(fieldItem.patch, ['path']) && !fieldItem.facade && hasAccess && !showAsReadonly ? true : false;
        if (!fieldItem.metadata) {
            fieldItem.metadata = {};
        }
        fieldItem.metadata = DeepMerge(fieldItem.metadata, { internal_name: core.params.internal_name });
        // ToDo:: Optimize this part, currently uses catch-all method to accommodate all field item types, need to run checks on some and not others which prevents simply merging
        let model = Object.assign({}, CleanObject({
            access: hasAccess,
            align: fieldItem.align,
            all: fieldItem.all,
            allValue: fieldItem.allValue,
            allowAll: fieldItem.allowAll,
            allowGroupAll: fieldItem.allowGroupAll,
            allOverlay: fieldItem.allOverlay,
            allOverlayEnabled: fieldItem.allOverlayEnabled,
            allOverlayLabel: fieldItem.allOverlayLabel,
            allOverlayMessage: fieldItem.allOverlayMessage,
            allOverlayCallback: fieldItem.allOverlayCallback,
            autoFill: +fieldItem.autoFill ? true : null,
            autoSize: +fieldItem.autoSize ? true : null,
            autofocus: +fieldItem.autofocus ? true : null,
            autoselect: +fieldItem.autoselect ? true : null,
            border: fieldItem.border,
            bubble: fieldItem.bubble,
            button: fieldItem.button,
            checkboxPosition: fieldItem.checkboxPosition,
            className: fieldItem.className,
            color: fieldItem.color,
            collapsed: fieldItem.collapsed,
            control: fieldItem.control,
            defaultHeight: fieldItem.defaultHeight,
            disabled: +fieldItem.disabled ? true : false,
            displayErrors: +fieldItem.displayErrors ? true : false,
            dropSpecial: fieldItem.dropSpecial,
            event: +fieldItem.event,
            empty: fieldItem.empty,
            facade: fieldItem.facade ? true : false,
            filterPredicate: fieldItem.filterPredicate,
            form: fieldItem.view ? String(fieldItem.view.name).toLowerCase() : fieldItem.form ? fieldItem.form : 'label',
            header: fieldItem.header,
            hidden: fieldItem.hidden,
            hint: fieldItem.hint,
            hintText: fieldItem.hintText,
            height: fieldItem.height,
            helpText: fieldItem.helpText,
            helper: fieldItem.helper,
            html: fieldItem.html,
            icon: fieldItem.icon,
            iconColor: fieldItem.iconColor,
            interval: fieldItem.interval,
            layout: fieldItem.setting && fieldItem.setting.layout,
            level: fieldItem.level,
            levelGap: fieldItem.levelGap,
            link: fieldItem.link,
            label: fieldItem.label,
            list: fieldItem.list,
            maxHeight: fieldItem.maxHeight,
            multiple: fieldItem.multiple,
            message: fieldItem.message,
            minimal: fieldItem.minimal,
            mode: fieldItem.mode,
            noInitialValue: fieldItem.noInitialValue,
            labelPosition: fieldItem.labelPosition,
            mask: fieldItem.mask,
            metadata: fieldItem.metadata ? fieldItem.metadata : {},
            min: fieldItem.min,
            max: fieldItem.max,
            minColumn: fieldItem.minColumn,
            maxColumn: fieldItem.maxColumn,
            minHeight: fieldItem.minHeight,
            minlength: IsObject(fieldItem.rule) && IsDefined(fieldItem.rule.minlength) ? fieldItem.rule.minlength : (fieldItem.minlength ? fieldItem.minlength : null),
            maxlength: IsObject(fieldItem.rule) && IsDefined(fieldItem.rule.maxlength) ? fieldItem.rule.maxlength : (fieldItem.maxlength ? fieldItem.maxlength : 128),
            minValue: fieldItem.minValue,
            maxValue: fieldItem.maxValue,
            name: fieldItem.name,
            options: ModelOptionValues(core, fieldItem.options),
            pattern: fieldItem.rule && fieldItem.rule.pattern ? fieldItem.rule.pattern : (fieldItem.pattern ? fieldItem.pattern : null),
            patch: allowPatch && fieldItem.patch ? fieldItem.patch : null,
            patchGroupFk: fieldItem.patchGroupFk,
            padding: fieldItem.padding,
            position: fieldItem.position,
            preserve: fieldItem.preserve,
            prevent: fieldItem.prevent,
            prefix: fieldItem.prefix ? fieldItem.prefix : null,
            suffix: fieldItem.suffix ? fieldItem.suffix : null,
            radius: fieldItem.radius,
            readonly: showAsReadonly,
            reset: fieldItem.reset,
            route: fieldItem.route,
            required: fieldItem.rule && fieldItem.rule.required ? true : fieldItem.required ? true : false,
            session: fieldItem.session,
            sessionPath: fieldItem.sessionPath,
            showMask: fieldItem.showMask,
            showTooltip: fieldItem.showTooltip,
            size: fieldItem.size,
            sort: fieldItem.sort,
            sort_order: fieldItem.sort_order,
            specialChars: fieldItem.specialChars,
            tooltip: fieldItem.tooltip,
            toolTipDirection: fieldItem.toolTipDirection,
            textOverflow: fieldItem.textOverflow,
            transformation: fieldItem.transformation,
            truncate: fieldItem.truncate,
            type: fieldItem.type,
            value: fieldItem.value,
            validators: fieldItem.validators,
            width: fieldItem.width,
            warning: fieldItem.warning,
            when: IsArray(fieldItem.when, true) ? fieldItem.when : null
        }));
        if (model.form === 'label') { // label specific params
            model = Object.assign(Object.assign({}, model), CleanObject({
                subLabel: fieldItem.subLabel ? fieldItem.subLabel : null,
                subValue: fieldItem.subValue ? fieldItem.subValue : null,
                truncate: fieldItem.truncate ? fieldItem.truncate : null,
                copyLabel: fieldItem.copyLabel ? fieldItem.copyLabel : null,
                labelButton: fieldItem.labelButton ? fieldItem.labelButton : null,
                valueButton: fieldItem.valueButton ? fieldItem.valueButton : null,
                copyLabelBody: fieldItem.copyLabelBody ? fieldItem.copyLabelBody : null,
                copyLabelDisplay: fieldItem.copyLabelDisplay ? fieldItem.copyLabelDisplay : null,
                valueButtonDisplay: fieldItem.valueButtonDisplay ? fieldItem.valueButtonDisplay : null,
                valueButtonDisabled: fieldItem.valueButtonDisabled ? fieldItem.valueButtonDisabled : null,
                valueButtonDisplayTransformation: fieldItem.valueButtonDisplayTransformation ? fieldItem.valueButtonDisplayTransformation : null,
            }));
        }
        delete fieldItem.patch;
        if (model.patch) {
            if (model.patch.path)
                model.patch.path = StringReplaceAll(ParseUrlForParams(model.patch.path, core.params), '//', '/');
            if (model.patch.metadata)
                model.patch.metadata = ParseObjectDefinitions(model.patch.metadata, core);
        }
        return model;
    }
    return {};
}
/**
 * When patches are made, we need to update the entity in the core config
 * ToDo:: Hoping to be able to improve this, and have each component be responsible to manage their own updates. My hesitation right now is I want the least amount of components as possible manipulating the core config
 * @param core
 * @param event
 */
export function SessionEntityFieldUpdate(core, event, path = null) {
    PopLog.event(`SessionEntityFieldUpdate`, `Session Detected`, event);
    if (IsValidCoreSignature(core, event)) {
        if (IsValidFieldPatchEvent(core, event)) {
            let value;
            if (!(IsString(path, true)))
                path = 'entity';
            const session = StorageGetter(core, String(path).trim().split('.'));
            if (event.config.name in session || event.config.facade) {
                value = event.config.control ? event.config.control.value : event.data;
                value = ParseModelValue(value);
                console.log('SessionEntityFieldUpdate', session, event.config.name, value);
                session[event.config.name] = value;
                core.repo.clearCache('active', `SessionEntityFieldUpdate`);
                core.repo.clearCache('all', `SessionEntityFieldUpdate`);
                event.session = true;
            }
            return true;
        }
    }
    return false;
}
export function GetSingularName(value) {
    if (IsString(value, true) && String(value).length > 3) {
        let tmp = SpaceToHyphenLower(String(value).toLowerCase().trim());
        if (String(tmp).slice(-3) === 'ies') {
            tmp = String(tmp).slice(0, -3);
            tmp += 'y';
        }
        else if (String(tmp).slice(-1) === 's') {
            tmp = String(tmp).slice(0, -1);
        }
        return tmp;
    }
    return value;
}
export function IsAliasable(value) {
    if (IsString(value, true) && String(value).length > 3) {
        const tmp = SpaceToHyphenLower(String(value).toLowerCase().trim());
        if (IsObject(PopRouteAliasMap, true) && tmp in PopRouteAliasMap) {
            return true;
        }
    }
    return false;
}
export function IsEntity(entityValue) {
    if (IsString(entityValue, true)) {
        if (IsObject(PopApp, ['entities']) && entityValue in PopApp.entities) {
            return true;
        }
    }
    return false;
}
export function ParseModuleRoutes(parent, config, routes = []) {
    for (let i = 0; i < config.length; i++) {
        const route = config[i];
        // console.log(parent + '/' + route.path);
        routes.push(route);
        if (route.children) {
            const currentPath = route.path ? parent + '/' + route.path : parent;
            ParseModuleRoutes(currentPath, route.children, routes);
        }
    }
    return routes;
}
export function ParseModuleRoutesForAliases(routes) {
    if (IsArray(routes, true)) {
        routes.map((route) => {
            if (IsObject(route.data, ['alias', 'internal_name'])) {
                const alias = route.data.alias;
                if (IsObject(alias, ['target', 'type']) && !route.data.masterPath) {
                    route.data.masterPath = route.path;
                    if (IsString(alias.target, true) && IsString(alias.type, true)) {
                        route.path = String(StringReplaceAll(route.path, alias.target, GetRouteAlias((IsString(alias.internal_name, true) ? alias.internal_name : route.data.internal_name), alias.type))).trim();
                        if (route.data.masterPath !== route.path)
                            routes.push({
                                path: route.data.masterPath,
                                redirectTo: route.path,
                                pathMatch: 'prefix'
                            });
                    }
                    if (IsObject(route.data.table, true)) {
                        if (IsString(route.data.table.route, true)) {
                            const tableRoute = route.data.table.route;
                            if (String(tableRoute).includes(alias.target)) {
                                route.data.table.route = String(StringReplaceAll(tableRoute, alias.target, GetRouteAlias((IsString(alias.internal_name, true) ? alias.internal_name : route.data.internal_name), alias.type))).trim();
                            }
                        }
                        if (IsString(route.data.table.goToUrl)) {
                            const goToUrl = route.data.table.goToUrl;
                            if (String(goToUrl).includes(route.data.alias)) {
                                route.data.table.goToUrl = String(StringReplaceAll(goToUrl, route.data.alias, GetRouteAlias((IsString(alias.internal_name, true) ? alias.internal_name : route.data.internal_name), alias.type))).trim();
                            }
                        }
                    }
                }
                else if (IsString(route.data.alias, true) && !route.data.masterPath) {
                    route.data.masterPath = route.path;
                    route.path = String(StringReplaceAll(route.path, route.data.alias, GetRouteAlias(route.data.internal_name, 'plural'))).trim();
                    if (route.data.masterPath !== route.path)
                        routes.push({
                            path: route.data.masterPath,
                            redirectTo: route.path,
                            pathMatch: 'prefix'
                        });
                    if (IsObject(route.data.table, true)) {
                        if (IsString(route.data.table.route, true)) {
                            const tableRoute = route.data.table.route;
                            if (String(tableRoute).includes(route.data.alias)) {
                                route.data.table.route = String(StringReplaceAll(tableRoute, route.data.alias, GetRouteAlias(route.data.internal_name, 'plural'))).trim();
                            }
                        }
                        if (IsString(route.data.table.goToUrl)) {
                            const goToUrl = route.data.table.goToUrl;
                            if (String(goToUrl).includes(route.data.alias)) {
                                route.data.table.goToUrl = String(StringReplaceAll(goToUrl, route.data.alias, GetRouteAlias(route.data.internal_name, 'plural'))).trim();
                            }
                        }
                    }
                }
            }
            if (IsArray(route.children, true)) {
                route.children = ParseModuleRoutesForAliases(route.children);
            }
            if (IsObject(route._loadedConfig, ['routes'])) {
                route._loadedConfig.routes = ParseModuleRoutesForAliases(route._loadedConfig.routes);
            }
        });
    }
    return routes;
}
export function FieldItemView(view) {
    const tmp = IsObject(view) ? view : null;
    return CleanObject({
        id: tmp ? tmp.id : 0,
        name: tmp ? tmp.name : 'label',
        type: tmp && String(tmp.html).includes('[') ? String(tmp.html).split('[')[1].split(']')[0] : 'text',
        description: tmp ? tmp.description : null
    });
}
export function FieldItemBooleanValue(model, core) {
    PopLog.debug('FieldItemBooleanValue', `convert:`, { name: name, model: model, core: core });
    let result;
    if (IsDefined(model.value, false)) {
        if (typeof model.value === 'boolean') {
            result = model.value;
        }
        else if (IsString(model.value, true)) {
            result = ParseModelValue(model.value, core);
        }
        else if (IsNumber(model.value, false)) {
            result = +core.entity[model.name] > 0;
        }
    }
    if (!(IsDefined(result, false)) && model.name && IsObject(core.entity, true) && IsDefined(core.entity[model.name])) {
        result = +core.entity[model.name] > 0;
    }
    if (!(IsDefined(result, false)))
        result = false;
    PopLog.debug('FieldItemBooleanValue', `result:`, { initial: model.value, result: result });
    return result;
}
export function FieldItemTextValue(model, core) {
    let result;
    if (+model.value > 0) {
        result = model.value;
    }
    else if (IsDefined(model.value, false) && IsString(model.value, true)) {
        result = ParseModelValue(model.value, core);
        // console.log( 'belongs to parse', model.value, result );
    }
    if (!(IsDefined(result, false)) && model.name && IsObject(core.entity, true) && IsDefined(core.entity[model.name]) && IsString(core.entity[model.name], true)) {
        result = core.entity[model.name];
        // console.log( 'belongs to entity', model.value, result );
    }
    if (!(IsDefined(result, false)) || result === 'Null')
        result = '';
    return result;
}
export function FieldItemArrayValue(model, core) {
    let result;
    if (IsDefined(model.value, false)) {
        if (IsArray(model.value, false)) {
            result = model.value;
        }
        else if (IsString(model.value, true)) {
            result = ParseModelValue(model.value, core);
        }
    }
    if (!(IsArray(result, false)) && model.name && IsObject(core.entity, true) && IsArray(core.entity[model.name], false)) {
        result = core.entity[model.name];
    }
    if (!(IsArray(result, false)))
        result = [];
    return result;
}
export function GetPatternValidator(pattern) {
    // ToDo:: Add all of the options that are built for this, numeric, alpha, ....
    switch (String(pattern).toLowerCase()) {
        case 'url':
            return ValidateUrl;
            break;
        case 'phone':
            return ValidatePhone;
            break;
        case 'email':
            return Validators.email;
            break;
        case 'zip':
            return ValidatePhone;
            break;
        case 'password':
            return ValidatePassword;
            break;
        case 'username':
            return ValidateUsername;
            break;
        default:
            return null;
    }
}
export function FieldItemOptionValues(model, core) {
    if (IsUndefined(model.options)) {
        model.options = {
            rawValues: [],
            values: []
        };
    }
    // console.log('model', model.options);
    if (!IsArray(model.options.rawValues, true)) {
        const optionValues = IsArray(model.options.values, true) ? model.options.values : [];
        model.options.rawValues = [...new Map(optionValues.map(item => [item['name'], item])).values()];
    }
    const list = ConvertArrayToOptionList(model.options.rawValues, {
        converted: model.options.converted ? true : false,
        // ensure that an option shows up in list in case other conditions remove it, aka it has been archived
        nameKey: model.options.nameKey ? model.options.nameKey : 'name',
        ensure: model.options.ensure && IsObject(core.entity, true) ? {
            name: core.entity[model.options.ensure.name],
            value: core.entity[model.name]
        } : undefined,
        prevent: IsArray(model.options.prevent, true) ? model.options.prevent : [],
        preserveKeys: IsArray(model.options.preserveKeys, true) ? model.options.preserveKeys : [],
        // parent means this options should all have a common field trait like client_fk, account_fk ....
        parent: model.options.parent && IsObject(core.entity, true) ? {
            field: model.options.parent,
            value: core.entity[model.options.parent]
        } : undefined,
        // empty is the blank or null option that you want to have
        empty: null,
        sort: IsDefined(model.options.sort) ? model.options.sort : true,
    });
    return list;
}
/**
 * Generatea form config from the field item model;
 * @param core
 * @param model
 * @constructor
 */
export function FieldItemModelConfig(core, model) {
    let value;
    let assigned;
    let configInterface;
    let validators;
    //   const isDialogLimit = this.srv.dialog.openDialogs.length > 3;
    const isDialogLimit = false;
    let config = null;
    // const metadata = { ...GetCoreParamsAsMetadata(core.params), ...model.metadata };
    switch (model.form) {
        case 'sidebyside':
            assigned = Array.isArray(model.options.assigned) && model.options.assigned.length ? model.options.assigned : typeof model.options.assigned === 'string' && IsObject(core.entity.assignments, true) && Array.isArray(core.entity.assignments[model.options.assigned]) ? core.entity.assignments[model.options.assigned] : [];
            model.options.values = FieldItemOptionValues(model, core);
            model.options.converted = true;
            configInterface = {
                assigned: assigned,
                assignAll: typeof model.assign_all === 'boolean' ? model.assign_all : false,
                assignedLabel: typeof model.assignedLabel === 'string' ? model.assignedLabel : 'Assigned',
                bubble: model.bubble ? true : false,
                disabled: model.disabled,
                displayHelper: typeof model.displayHelper === 'boolean' ? model.displayHelper : false,
                displayTitle: typeof model.displayTitle === 'boolean' ? model.displayTitle : false,
                facade: true,
                filter: typeof model.filter === 'boolean' ? model.filter : true,
                helpText: typeof model.helpText === 'string' ? model.helpText : undefined,
                id: model.id ? model.id : undefined,
                label: model.label ? ParseForAlias(model.label) : '',
                metadata: model.metadata,
                noInitialValue: model.noInitialValue ? model.noInitialValue : false,
                name: model.name ? model.name : null,
                optionsLabel: typeof model.optionsLabel === 'string' ? model.optionsLabel : 'Available',
                options: model.options,
                // bucketHeight: typeof model.bucketHeight === 'string' ? model.bucketHeight : undefined,
                parentHeight: 'mat-grid-tile',
                patch: model.patch,
                route: typeof model.route === 'string' ? model.route : undefined,
                removeAll: typeof model.removeAll === 'boolean' ? model.removeAll : false,
                session: model.session,
                sessionPath: model.sessionPath,
                validators: model.required ? [Validators.required] : undefined,
            };
            config = new SideBySideConfig(CleanObject(configInterface));
            break;
        case 'select':
            model.options.values = FieldItemOptionValues(model, core);
            model.options.converted = true;
            configInterface = {
                autoFill: model.autoFill,
                bubble: model.bubble ? true : false,
                disabled: model.disabled,
                empty: model.empty ? model.empty : null,
                facade: model.facade ? true : false,
                height: model.height ? model.height : undefined,
                helpText: model.helpText ? model.helpText : undefined,
                id: model.id ? model.id : undefined,
                label: model.label ? ParseForAlias(model.label) : '',
                mode: model.mode ? model.mode : 'select',
                metadata: model.metadata,
                name: model.name ? model.name : null,
                noInitialValue: model.noInitialValue ? model.noInitialValue : false,
                options: model.options,
                patch: model.patch,
                readonly: model.readonly ? true : false,
                session: model.session,
                sessionPath: model.sessionPath,
                required: model.required ? true : false,
                validators: model.required ? [Validators.required] : undefined,
                value: typeof model.value !== 'undefined' && model.value !== null ? ParseModelValue(model.value, core) : IsObject(core.entity, true) && typeof core.entity[(model.name ? model.name : null)] !== 'undefined' ? core.entity[(model.name ? model.name : null)] : null,
            };
            config = new SelectConfig(CleanObject(configInterface));
            break;
        case 'select-modal':
            model.options.values = FieldItemOptionValues(model, core);
            model.options.converted = true;
            const configListInterface = {
                autoFill: model.autoFill,
                bubble: model.bubble ? true : false,
                disabled: model.disabled,
                empty: model.empty ? model.empty : null,
                facade: model.facade ? true : false,
                height: model.height ? model.height : undefined,
                helpText: model.helpText ? model.helpText : undefined,
                id: model.id ? model.id : undefined,
                label: model.subLabel ? ParseForAlias(model.subLabel) : '',
                mode: model.mode ? model.mode : 'select',
                metadata: model.metadata,
                name: model.name ? model.name : null,
                noInitialValue: model.noInitialValue ? model.noInitialValue : false,
                options: model.options,
                patch: model.patch,
                readonly: model.readonly ? true : false,
                session: model.session,
                sessionPath: model.sessionPath,
                required: model.required,
                validators: model.required ? [Validators.required] : undefined,
                value: typeof model.value !== 'undefined' && model.value !== null ? ParseModelValue(model.value, core) : IsObject(core.entity, true) && typeof core.entity[(model.name ? model.name : null)] !== 'undefined' ? core.entity[(model.name ? model.name : null)] : null,
            };
            config = new SelectModalConfig({
                facade: false,
                header: model.header ? model.header : null,
                label: model.label ? model.label : null,
                metadata: {},
                name: model.name,
                required: model.required,
                validators: model.required ? [Validators.required] : undefined,
                list: new SelectListConfig(CleanObject(configListInterface))
            });
            break;
        case 'select-filter':
            model.options.values = FieldItemOptionValues(model, core);
            model.options.converted = true;
            configInterface = {
                autoFill: model.autoFill,
                bubble: model.bubble ? true : false,
                disabled: model.disabled,
                facade: model.facade ? true : false,
                helpText: model.helpText ? model.helpText : undefined,
                height: model.height ? model.height : undefined,
                id: model.id ? model.id : undefined,
                label: model.label ? ParseForAlias(model.label) : '',
                mode: model.mode ? model.mode : 'select',
                minHeight: model.minHeight ? model.minHeight : undefined,
                multiple: model.multiple ? true : false,
                metadata: model.metadata,
                name: model.name ? model.name : null,
                noInitialValue: model.noInitialValue ? model.noInitialValue : false,
                options: model.options,
                patch: model.patch,
                readonly: model.readonly ? true : false,
                session: model.session,
                sessionPath: model.sessionPath,
                validators: model.required ? [Validators.required] : undefined,
                value: typeof model.value !== 'undefined' && model.value !== null ? ParseModelValue(model.value, core) : IsObject(core.entity, true) && typeof core.entity[(model.name ? model.name : null)] !== 'undefined' ? core.entity[(model.name ? model.name : null)] : null,
            };
            config = new SelectFilterConfig(CleanObject(configInterface));
            break;
        case 'select-list':
            model.options.values = FieldItemOptionValues(model, core);
            model.options.converted = true;
            configInterface = {
                autoFill: model.autoFill,
                all: model.all,
                allowAll: model.allowAll,
                allowGroupAll: model.allowGroupAll,
                allOverlay: model.allOverlay,
                allOverlayEnabled: model.allOverlayEnabled,
                allOverlayLabel: model.allOverlayLabel,
                allOverlayMessage: model.allOverlayMessage,
                allOverlayCallback: model.allOverlayCallback,
                bubble: model.bubble ? true : false,
                disabled: model.disabled,
                facade: model.facade ? true : false,
                helpText: model.helpText ? model.helpText : undefined,
                height: model.height ? model.height : undefined,
                id: model.id ? model.id : undefined,
                label: model.label ? ParseForAlias(model.label) : '',
                mode: model.mode ? model.mode : null,
                multiple: model.multiple ? true : false,
                minHeight: model.minHeight ? model.minHeight : undefined,
                metadata: model.metadata,
                name: model.name ? model.name : null,
                noInitialValue: model.noInitialValue ? model.noInitialValue : false,
                options: model.options,
                patch: model.patch,
                required: model.required,
                readonly: model.readonly ? true : false,
                session: model.session,
                sessionPath: model.sessionPath,
                validators: model.required ? [Validators.required] : undefined,
                value: typeof model.value !== 'undefined' && model.value !== null ? ParseModelValue(model.value, core) : IsObject(core.entity, true) && typeof core.entity[(model.name ? model.name : null)] !== 'undefined' ? core.entity[(model.name ? model.name : null)] : null,
            };
            config = new SelectListConfig(CleanObject(configInterface));
            break;
        case 'select-multi':
        case 'select_multi':
            model.options.values = FieldItemOptionValues(model, core);
            model.options.converted = true;
            configInterface = {
                bubble: model.bubble ? true : false,
                disabled: model.disabled,
                facade: model.facade ? true : false,
                helpText: model.helpText ? model.helpText : undefined,
                id: model.id ? model.id : undefined,
                label: model.label ? ParseForAlias(model.label) : '',
                metadata: model.metadata,
                name: model.name ? model.name : null,
                noInitialValue: model.noInitialValue ? model.noInitialValue : false,
                options: model.options,
                patch: model.patch,
                readonly: model.readonly ? true : false,
                session: model.session,
                sessionPath: model.sessionPath,
                validators: model.required ? [Validators.required] : undefined,
                value: FieldItemArrayValue(model, core),
            };
            model.options.converted = true;
            config = new SelectMultiConfig(CleanObject(configInterface));
            break;
        case 'textfield':
        case 'text':
        case 'input':
            validators = [];
            if (!model.mask)
                validators.push(Validators.maxLength(+model.maxlength || 64));
            if (model.mask)
                model.maxlength = null;
            if (model.required)
                validators.push(Validators.required);
            if (model.pattern) {
                const patternValidator = GetPatternValidator(model.pattern);
                if (patternValidator) {
                    validators.push(patternValidator);
                }
            }
            if (+model.minlength)
                validators.push(Validators.minLength(+model.minlength));
            configInterface = {
                autofocus: model.autofocus ? true : null,
                autoselect: model.autoselect ? true : null,
                bubble: model.bubble ? true : false,
                disabled: model.disabled ? true : false,
                empty: model.empty ? model.empty : null,
                facade: model.facade ? true : null,
                hint: model.hint ? true : null,
                hintText: model.hintText ? model.hintText : null,
                helpText: model.helpText ? model.helpText : null,
                hidden: model.hidden ? true : false,
                id: model.id ? model.id : undefined,
                label: ParseForAlias(model.label),
                metadata: model.metadata,
                maxlength: model.maxlength || 64,
                mask: typeof model.mask === 'string' && model.mask.length ? model.mask : null,
                name: model.name ? model.name : null,
                noInitialValue: model.noInitialValue ? model.noInitialValue : false,
                patch: model.patch,
                pattern: typeof model.pattern === 'string' && model.pattern.length ? model.pattern : null,
                prefix: IsString(model.prefix, true) ? model.prefix : null,
                prevent: IsArray(model.prevent, true) ? model.prevent : null,
                readonly: model.readonly ? true : false,
                session: model.session,
                sessionPath: model.sessionPath,
                suffix: typeof model.suffix === 'string' && model.suffix.length ? model.suffix : null,
                transformation: IsString(model.transformation, true) ? model.transformation : null,
                validators: validators,
                value: FieldItemTextValue(model, core),
            };
            config = new InputConfig(CleanObject(configInterface));
            break;
        case 'number':
            validators = [];
            if (model.min)
                validators.push(Validators.max(model.min));
            if (model.max)
                validators.push(Validators.max(model.max));
            if (model.required)
                validators.push(Validators.required);
            configInterface = {
                bubble: model.bubble ? true : false,
                facade: model.facade ? true : false,
                helpText: model.helpText ? model.helpText : null,
                hidden: model.hidden ? true : false,
                id: model.id ? model.id : undefined,
                label: ParseForAlias(model.label),
                metadata: model.metadata,
                min: typeof model.min !== 'undefined' ? model.min : 1,
                noInitialValue: model.noInitialValue ? model.noInitialValue : false,
                name: model.name ? model.name : null,
                prefix: IsString(model.prefix, true) ? model.prefix : '',
                patch: model.patch,
                readonly: model.readonly ? true : false,
                session: model.session,
                sessionPath: model.sessionPath,
                suffix: typeof model.suffix === 'string' && model.suffix.length ? model.suffix : '',
                step: typeof model.step ? model.step : 1,
                transformation: IsString(model.transformation, true) ? model.transformation : null,
                validators: validators,
                value: FieldItemTextValue(model, core),
            };
            config = new NumberConfig(CleanObject(configInterface));
            break;
        case 'date':
            configInterface = {
                bubble: model.bubble ? true : false,
                disabled: model.disabled,
                facade: model.facade ? true : false,
                helpText: model.helpText ? model.helpText : null,
                id: model.id ? model.id : undefined,
                label: ParseForAlias(model.label),
                min: IsString(model.min, true) ? model.min : null,
                // min: isNaN( model.min ) === false ? model.min : null,
                max: isNaN(model.max) === false ? model.max : null,
                metadata: model.metadata,
                noInitialValue: model.noInitialValue ? model.noInitialValue : false,
                name: model.name ? model.name : null,
                patch: model.patch,
                required: model.required,
                readonly: model.readonly ? true : false,
                session: model.session,
                sessionPath: model.sessionPath,
                transformation: IsString(model.transformation, true) ? model.transformation : null,
                type: IsString(model.type, true) ? model.type : "Basic",
                value: FieldItemTextValue(model, core),
                validators: model.required ? [Validators.required] : undefined,
            };
            configInterface = CleanObject(configInterface);
            if (IsDefined(model.filterPredicate))
                configInterface.filterPredicate = model.filterPredicate;
            config = new DateConfig(configInterface);
            break;
        case 'datepicker':
            configInterface = {
                bubble: model.bubble ? true : false,
                disabled: model.disabled,
                facade: model.facade ? true : false,
                helpText: model.helpText ? model.helpText : null,
                id: model.id ? model.id : undefined,
                label: ParseForAlias(model.label),
                min: IsString(model.min, true) ? model.min : null,
                // min: isNaN( model.min ) === false ? model.min : null,
                max: isNaN(model.max) === false ? model.max : null,
                metadata: model.metadata,
                noInitialValue: model.noInitialValue ? model.noInitialValue : false,
                name: model.name ? model.name : null,
                patch: model.patch,
                required: model.required,
                transformation: IsString(model.transformation, true) ? model.transformation : null,
                readonly: model.readonly ? true : false,
                session: model.session,
                sessionPath: model.sessionPath,
                value: FieldItemTextValue(model, core),
                validators: model.required ? [Validators.required] : undefined,
            };
            configInterface = CleanObject(configInterface);
            if (IsDefined(model.filterPredicate))
                configInterface.filterPredicate = model.filterPredicate;
            config = new DatePickerConfig(configInterface);
            break;
        case 'time':
            configInterface = {
                bubble: model.bubble ? true : false,
                disabled: model.disabled,
                facade: model.facade ? true : false,
                helpText: model.helpText ? model.helpText : null,
                interval: model.interval ? model.interval : 15,
                id: model.id ? model.id : undefined,
                label: ParseForAlias(model.label),
                metadata: model.metadata,
                min: typeof model.min === 'string' ? model.min : null,
                max: typeof model.max === 'string' ? model.max : null,
                name: model.name ? model.name : null,
                noInitialValue: model.noInitialValue ? model.noInitialValue : false,
                patch: model.patch,
                readonly: model.readonly ? true : false,
                session: model.session,
                sessionPath: model.sessionPath,
                time: model.time ? model.time : 12,
                transformation: IsString(model.transformation, true) ? model.transformation : null,
                value: FieldItemTextValue(model, core),
                validators: model.required ? [Validators.required] : undefined,
            };
            config = new TimeConfig(CleanObject(configInterface));
            break;
        case 'checkbox':
            model.options.values = FieldItemOptionValues(model, core);
            model.options.converted = true;
            configInterface = {
                bubble: model.bubble ? true : false,
                disabled: model.disabled,
                facade: model.facade ? true : false,
                helpText: model.helpText ? model.helpText : undefined,
                id: model.id ? model.id : undefined,
                label: model.label ? ParseForAlias(model.label) : '',
                labelPosition: typeof model.labelPosition !== 'undefined' ? model.labelPosition : 'after',
                metadata: model.metadata,
                name: model.name ? model.name : null,
                noInitialValue: model.noInitialValue ? model.noInitialValue : false,
                options: model.options,
                patch: model.patch,
                session: model.session,
                sessionPath: model.sessionPath,
                textOverflow: model.textOverflow ? model.textOverflow : 'wrap',
                value: FieldItemBooleanValue(model, core),
            };
            config = new CheckboxConfig(CleanObject(configInterface));
            break;
        case 'switch':
            configInterface = {
                bubble: model.bubble ? true : false,
                disabled: model.disabled,
                facade: model.facade ? true : false,
                helpText: model.helpText ? model.helpText : undefined,
                id: model.id ? model.id : undefined,
                label: model.label ? ParseForAlias(model.label) : '',
                labelPosition: typeof model.labelPosition !== 'undefined' ? model.labelPosition : 'after',
                metadata: model.metadata,
                name: model.name ? model.name : null,
                noInitialValue: model.noInitialValue ? model.noInitialValue : false,
                patch: model.patch,
                session: model.session,
                sessionPath: model.sessionPath,
                textOverflow: model.textOverflow ? model.textOverflow : 'wrap',
                value: FieldItemBooleanValue(model, core),
            };
            config = new SwitchConfig(CleanObject(configInterface));
            break;
        case 'minmax':
            const minColumn = model.minColumn ? model.minColumn : 'min';
            const maxColumn = model.maxColumn ? model.maxColumn : 'max';
            const minValue = typeof model.minValue !== 'undefined' && model.minValue !== null ? ParseModelValue(model.minValue, core) : IsObject(core.entity, true) && typeof core.entity[minColumn] !== 'undefined' ? core.entity[minColumn] : 1;
            const maxValue = typeof model.maxValue !== 'undefined' && model.maxValue !== null ? ParseModelValue(model.maxValue, core) : IsObject(core.entity, true) && typeof core.entity[maxColumn] !== 'undefined' ? core.entity[maxColumn] : 10;
            configInterface = {
                bubble: model.bubble ? true : false,
                disabled: model.disabled,
                facade: model.facade ? true : false,
                helpText: model.helpText ? model.helpText : undefined,
                id: model.id ? model.id : undefined,
                label: model.label ? ParseForAlias(model.label) : '',
                minColumn: model.minColumn ? model.minColumn : 'min',
                maxColumn: model.maxColumn ? model.maxColumn : 'max',
                minValue: minValue,
                maxValue: maxValue,
                metadata: model.metadata,
                name: model.name ? model.name : null,
                noInitialValue: model.noInitialValue ? model.noInitialValue : false,
                patch: model.patch,
                readonly: model.readonly ? true : false,
                session: model.session,
                sessionPath: model.sessionPath,
            };
            config = new MinMaxConfig(CleanObject(configInterface));
            break;
        case 'radio':
            model.options.values = FieldItemOptionValues(model, core);
            model.options.converted = true;
            configInterface = {
                bubble: model.bubble ? true : false,
                disabled: model.disabled,
                facade: model.facade ? true : false,
                helpText: model.helpText ? model.helpText : '',
                id: model.id ? model.id : undefined,
                labelPosition: typeof model.labelPosition !== 'undefined' ? model.labelPosition : 'above',
                label: model.label ? ParseForAlias(model.label) : '',
                layout: typeof model.layout !== 'undefined' ? model.layout : 'row',
                metadata: model.metadata,
                name: model.name ? model.name : null,
                noInitialValue: model.noInitialValue ? model.noInitialValue : false,
                options: model.options,
                patch: model.patch,
                reset: model.reset ? true : false,
                readonly: model.readonly ? true : false,
                session: model.session,
                sessionPath: model.sessionPath,
                sort: typeof model.labelPosition !== 'undefined' ? model.sort : false,
                value: FieldItemTextValue(model, core),
            };
            model.options.converted = true;
            config = new RadioConfig(CleanObject(configInterface));
            break;
        case 'textarea':
            configInterface = {
                autoSize: model.autoSize ? true : false,
                bubble: model.bubble ? true : false,
                facade: model.facade ? true : false,
                height: model.height || 70,
                helpText: model.helpText ? model.helpText : '',
                id: model.id ? model.id : undefined,
                label: ParseForAlias(model.label),
                maxlength: model.maxlength || 255,
                metadata: model.metadata,
                maxHeight: model.maxHeight || null,
                name: model.name ? model.name : null,
                noInitialValue: model.noInitialValue ? model.noInitialValue : false,
                pattern: typeof model.pattern === 'string' && model.pattern.length ? model.pattern : null,
                patch: model.patch,
                readonly: model.readonly,
                session: model.session,
                sessionPath: model.sessionPath,
                validators: model.required ? [Validators.required, Validators.maxLength(model.maxlength || 255)] : [Validators.maxLength(model.maxlength || 255)],
                value: FieldItemTextValue(model, core),
            };
            config = new TextareaConfig(CleanObject(configInterface));
            break;
        case 'label':
            value = typeof model.value !== 'undefined' && model.value !== null ? ParseModelValue(model.value, core) : IsObject(core.entity, true) && IsObject(core.entity, true) && typeof core.entity[(model.name ? model.name : null)] !== 'undefined' ? core.entity[(model.name ? model.name : null)] : '';
            if (model.transformation && typeof (value) !== 'undefined') {
                value = PopTransform(value, model.transformation);
            }
            if (typeof (model.copyLabelDisplay) !== 'undefined') {
                model.copyLabelDisplay = ParseModelValue(model.copyLabelDisplay, core);
                if (model.copyLabelDisplay && model.copyLabelDisplayTransformation) {
                    model.copyLabelDisplay = PopTransform(model.copyLabelDisplay, model.copyLabelDisplayTransformation);
                }
            }
            if (typeof (model.copyLabelBody) !== 'undefined') {
                model.copyLabelBody = ParseModelValue(model.copyLabelBody, core);
                if (model.copyLabelBody && model.copyLabelBodyTransformation) {
                    model.copyLabelBody = PopTransform(model.copyLabelBody, model.copyLabelBodyTransformation);
                }
            }
            if (typeof (model.copyValueDisplay) !== 'undefined') {
                model.copyValueDisplay = model.copyValueDisplay !== null ? ParseModelValue(model.copyValueDisplay, core) : '';
                if (model.copyValueDisplay && model.copyValueDisplayTransformation) {
                    model.copyValueDisplay = PopTransform(model.copyValueDisplay, model.copyValueDisplayTransformation);
                }
            }
            if (typeof (model.copyValueBody) !== 'undefined') {
                model.copyValueBody = model.copyValueBody !== null ? ParseModelValue(model.copyValueBody, core) : '';
                if (model.copyValueBody && model.copyValueBodyTransformation) {
                    model.copyValueBody = PopTransform(model.copyValueBody, model.copyValueBodyTransformation);
                }
            }
            if (typeof (model.valueButtonDisplay) !== 'undefined') {
                model.valueButtonDisplay = ParseModelValue(model.valueButtonDisplay, core);
                if (model.valueButtonDisplay && model.valueButtonDisplayTransformation) {
                    model.valueButtonDisplay = PopTransform(model.valueButtonDisplay, model.valueButtonDisplayTransformation);
                }
            }
            configInterface = CleanObject({
                name: model.name ? model.name : null,
                label: ParseForAlias(model.label),
                button: model.button,
                border: model.border,
                icon: model.icon,
                iconType: model.iconType,
                html: model.html,
                textOverflow: model.textOverflow ? model.textOverflow : 'wrap',
                labelButton: !!model.labelButton,
                copyLabel: !!model.copyLabel,
                copyLabelBody: model.copyLabelBody ? model.copyLabelBody : null,
                copyLabelBodyTransformation: model.copyLabelBodyTransformation ? model.copyLabelBodyTransformation : null,
                copyLabelDisplay: model.copyLabelDisplay ? model.copyLabelDisplay : null,
                copyLabelDisplayTransformation: model.copyLabelDisplayTransformation ? model.copyLabelDisplayTransformation : null,
                copyValue: !!model.copyValue,
                copyValueBody: model.copyValueBody ? model.copyValueBody : null,
                copyValueBodyTransformation: model.copyValueBodyTransformation ? model.copyValueBodyTransformation : null,
                copyValueDisplay: model.copyValueDisplay ? model.copyValueDisplay : null,
                copyValueDisplayTransformation: model.copyValueDisplayTransformation ? model.copyValueDisplayTransformation : null,
                valueButton: !!model.valueButton,
                valueButtonDisabled: !!model.valueButtonDisabled,
                valueButtonDisplay: model.valueButtonDisplay ? model.valueButtonDisplay : null,
                valueButtonDisplayTransformation: model.valueButtonDisplayTransformation ? model.valueButtonDisplayTransformation : null,
                value: value,
                link: model.link || false,
                helpText: model.helpText ? model.helpText : undefined,
                route: model.route && !isDialogLimit ? ParseModelValue(model.route, core) : '',
                metadata: model.metadata,
            });
            config = new LabelConfig(CleanObject(configInterface));
            break;
        case 'textstring':
            configInterface = {
                border: model.border,
                className: model.className,
                header: model.header,
                id: model.id ? model.id : undefined,
                name: model.name ? model.name : null,
                size: model.size,
                textOverflow: model.textOverflow,
                value: model.value ? model.value : '',
                warning: model.warning
            };
            config = new TextConfig(CleanObject(configInterface));
            break;
        case 'button':
            configInterface = {
                bubble: model.bubble ? true : false,
                disabled: model.disabled,
                facade: model.facade ? true : false,
                icon: model.icon ? model.icon : 'help_outline',
                helpText: model.helpText ? model.helpText : undefined,
                id: model.id ? model.id : undefined,
                metadata: model.metadata,
                name: model.name ? model.name : null,
                patch: model.patch,
                value: FieldItemTextValue(model, core),
            };
            config = new ButtonConfig(CleanObject(configInterface));
            break;
        case 'metadata':
            const val = IsDefined(model.value) ? model.value : IsObject(core.entity, true) && model.name in core.entity ? core.entity[model.name] : null;
            config = new MetadataConfig(model.name, val);
            break;
        default:
            PopLog.warn(`FieldItemModelConfig`, `buildCoreFieldItemConfig`, model.form);
            break;
    }
    return config;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS11dGlsaXR5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvZW50aXR5L3BvcC1lbnRpdHktdXRpbGl0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBT0wsT0FBTyxFQUNQLE1BQU0sRUFDa0IsTUFBTSxFQUF1QixnQkFBZ0IsRUFDdEUsTUFBTSx3QkFBd0IsQ0FBQztBQUNoQyxPQUFPLEVBQ0wsVUFBVSxFQUNWLFdBQVcsRUFDWCx3QkFBd0IsRUFDeEIsUUFBUSxFQUFFLFNBQVMsRUFBRSxhQUFhLEVBQ2xDLGlCQUFpQixFQUNqQixPQUFPLEVBQUUsU0FBUyxFQUNsQixRQUFRLEVBQ1IsUUFBUSxFQUNSLFFBQVEsRUFBRSxXQUFXLEVBQVksWUFBWSxFQUFFLGtCQUFrQixFQUNqRSxhQUFhLEVBQUUsZ0JBQWdCLEVBQy9CLFNBQVMsRUFDVCxRQUFRLEVBQ1QsTUFBTSwwQkFBMEIsQ0FBQztBQUNsQyxPQUFPLEVBQWdDLGFBQWEsRUFBQyxNQUFNLHFDQUFxQyxDQUFDO0FBQ2pHLE9BQU8sRUFBQyxnQkFBZ0IsRUFBc0IsTUFBTSxpREFBaUQsQ0FBQztBQUN0RyxPQUFPLEVBQVksVUFBVSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDckQsT0FBTyxFQUFDLFlBQVksRUFBd0IsTUFBTSx1REFBdUQsQ0FBQztBQUMxRyxPQUFPLEVBQ0wsaUJBQWlCLEVBRWxCLE1BQU0sbUVBQW1FLENBQUM7QUFDM0UsT0FBTyxFQUFDLFdBQVcsRUFBdUIsTUFBTSxxREFBcUQsQ0FBQztBQUN0RyxPQUFPLEVBQUMsWUFBWSxFQUF3QixNQUFNLHVEQUF1RCxDQUFDO0FBQzFHLE9BQU8sRUFBQyxVQUFVLEVBQXNCLE1BQU0sbURBQW1ELENBQUM7QUFDbEcsT0FBTyxFQUFDLFVBQVUsRUFBc0IsTUFBTSxtREFBbUQsQ0FBQztBQUNsRyxP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LEtBQUssQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUM3SSxNQUFNLEdBQUcsSUFBSSxjQUFjLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztZQUM3QyxNQUFNO1FBQ1I7WUFDRSxNQUFNLENBQUMsSUFBSSxDQUFDLHNCQUFzQixFQUFFLDBCQUEwQixFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM1RSxNQUFNO0tBQ1Q7SUFFRCxPQUFPLE1BQU0sQ0FBQztBQUNoQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQ29yZUNvbmZpZyxcbiAgRGljdGlvbmFyeSxcbiAgRW50aXR5LFxuICBFbnRpdHlQYXJhbXMsXG4gIEZpZWxkSXRlbU1vZGVsSW50ZXJmYWNlLFxuICBQb3BCYXNlRXZlbnRJbnRlcmZhY2UsXG4gIFBvcFBpcGUsXG4gIFBvcExvZyxcbiAgU2VydmljZVJvdXRlc0ludGVyZmFjZSwgUG9wQXBwLCBTZXRQb3BSb3V0ZUFsaWFzTWFwLCBQb3BSb3V0ZUFsaWFzTWFwLCBGaWVsZEl0ZW1JbnRlcmZhY2UsIEZpZWxkSW50ZXJmYWNlXG59IGZyb20gJy4uLy4uL3BvcC1jb21tb24ubW9kZWwnO1xuaW1wb3J0IHtcbiAgQXJyYXlLZXlCeSxcbiAgQ2xlYW5PYmplY3QsXG4gIENvbnZlcnRBcnJheVRvT3B0aW9uTGlzdCxcbiAgRGVlcENvcHksIERlZXBNZXJnZSwgR2V0Um91dGVBbGlhcyxcbiAgSW50ZXJwb2xhdGVTdHJpbmcsXG4gIElzQXJyYXksIElzRGVmaW5lZCxcbiAgSXNOdW1iZXIsXG4gIElzT2JqZWN0LFxuICBJc1N0cmluZywgSXNVbmRlZmluZWQsIEpzb25Db3B5LCBQb3BUcmFuc2Zvcm0sIFNwYWNlVG9IeXBoZW5Mb3dlcixcbiAgU3RvcmFnZUdldHRlciwgU3RyaW5nUmVwbGFjZUFsbCxcbiAgVGl0bGVDYXNlLFxuICBUb09iamVjdFxufSBmcm9tICcuLi8uLi9wb3AtY29tbW9uLXV0aWxpdHknO1xuaW1wb3J0IHtUYWJCdXR0b25JbnRlcmZhY2UsIFRhYkNvbmZpZywgVGFiTWVudUNvbmZpZ30gZnJvbSAnLi4vYmFzZS9wb3AtdGFiLW1lbnUvdGFiLW1lbnUubW9kZWwnO1xuaW1wb3J0IHtTaWRlQnlTaWRlQ29uZmlnLCBTaWRlQnlTaWRlSW50ZXJmYWNlfSBmcm9tICcuLi9iYXNlL3BvcC1zaWRlLWJ5LXNpZGUvcG9wLXNpZGUtYnktc2lkZS5tb2RlbCc7XG5pbXBvcnQge1ZhbGlkYXRvciwgVmFsaWRhdG9yc30gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHtTZWxlY3RDb25maWcsIFNlbGVjdENvbmZpZ0ludGVyZmFjZX0gZnJvbSAnLi4vYmFzZS9wb3AtZmllbGQtaXRlbS9wb3Atc2VsZWN0L3NlbGVjdC1jb25maWcubW9kZWwnO1xuaW1wb3J0IHtcbiAgU2VsZWN0TXVsdGlDb25maWcsXG4gIFNlbGVjdE11bHRpQ29uZmlnSW50ZXJmYWNlXG59IGZyb20gJy4uL2Jhc2UvcG9wLWZpZWxkLWl0ZW0vcG9wLXNlbGVjdC1tdWx0aS9zZWxlY3QtbXVsaXQtY29uZmlnLm1vZGVsJztcbmltcG9ydCB7SW5wdXRDb25maWcsIElucHV0Q29uZmlnSW50ZXJmYWNlfSBmcm9tICcuLi9iYXNlL3BvcC1maWVsZC1pdGVtL3BvcC1pbnB1dC9pbnB1dC1jb25maWcubW9kZWwnO1xuaW1wb3J0IHtOdW1iZXJDb25maWcsIE51bWJlckNvbmZpZ0ludGVyZmFjZX0gZnJvbSAnLi4vYmFzZS9wb3AtZmllbGQtaXRlbS9wb3AtbnVtYmVyL251bWJlci1jb25maWcubW9kZWwnO1xuaW1wb3J0IHtEYXRlQ29uZmlnLCBEYXRlQ29uZmlnSW50ZXJmYWNlfSBmcm9tICcuLi9iYXNlL3BvcC1maWVsZC1pdGVtL3BvcC1kYXRlL2RhdGUtY29uZmlnLm1vZGVsJztcbmltcG9ydCB7VGltZUNvbmZpZywgVGltZUNvbmZpZ0ludGVyZmFjZX0gZnJvbSAnLi4vYmFzZS9wb3AtZmllbGQtaXRlbS9wb3AtdGltZS90aW1lLWNvbmZpZy5tb2RlbCc7XG5pbXBvcnQge0NoZWNrYm94Q29uZmlnLCBDaGVja2JveENvbmZpZ0ludGVyZmFjZX0gZnJvbSAnLi4vYmFzZS9wb3AtZmllbGQtaXRlbS9wb3AtY2hlY2tib3gvY2hlY2tib3gtY29uZmlnLm1vZGVsJztcbmltcG9ydCB7U3dpdGNoQ29uZmlnLCBTd2l0Y2hDb25maWdJbnRlcmZhY2V9IGZyb20gJy4uL2Jhc2UvcG9wLWZpZWxkLWl0ZW0vcG9wLXN3aXRjaC9zd2l0Y2gtY29uZmlnLm1vZGVsJztcbmltcG9ydCB7TWluTWF4Q29uZmlnLCBNaW5NYXhDb25maWdJbnRlcmZhY2V9IGZyb20gJy4uL2Jhc2UvcG9wLWZpZWxkLWl0ZW0vcG9wLW1pbi1tYXgvbWluLW1heC5tb2RlbHMnO1xuaW1wb3J0IHtSYWRpb0NvbmZpZywgUmFkaW9Db25maWdJbnRlcmZhY2V9IGZyb20gJy4uL2Jhc2UvcG9wLWZpZWxkLWl0ZW0vcG9wLXJhZGlvL3JhZGlvLWNvbmZpZy5tb2RlbCc7XG5pbXBvcnQge1RleHRhcmVhQ29uZmlnLCBUZXh0YXJlYUNvbmZpZ0ludGVyZmFjZX0gZnJvbSAnLi4vYmFzZS9wb3AtZmllbGQtaXRlbS9wb3AtdGV4dGFyZWEvdGV4dGFyZWEtY29uZmlnLm1vZGVsJztcbmltcG9ydCB7TGFiZWxDb25maWcsIExhYmVsQ29uZmlnSW50ZXJmYWNlLCBNZXRhZGF0YUNvbmZpZ30gZnJvbSAnLi4vYmFzZS9wb3AtZmllbGQtaXRlbS9wb3AtbGFiZWwvbGFiZWwtY29uZmlnLm1vZGVsJztcbmltcG9ydCB7QnV0dG9uQ29uZmlnLCBCdXR0b25Db25maWdJbnRlcmZhY2V9IGZyb20gJy4uL2Jhc2UvcG9wLWZpZWxkLWl0ZW0vcG9wLWJ1dHRvbi9idXR0b24tY29uZmlnLm1vZGVsJztcbmltcG9ydCB7Um91dGUsIFJvdXRlc30gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcbmltcG9ydCB7RW1haWxGaWVsZFNldHRpbmd9IGZyb20gJy4vcG9wLWVudGl0eS1maWVsZC9wb3AtZW50aXR5LWVtYWlsL2VtYWlsLnNldHRpbmcnO1xuaW1wb3J0IHtBZGRyZXNzRmllbGRTZXR0aW5nfSBmcm9tICcuL3BvcC1lbnRpdHktZmllbGQvcG9wLWVudGl0eS1hZGRyZXNzL2FkZHJlc3Muc2V0dGluZyc7XG5pbXBvcnQge1Bob25lRmllbGRTZXR0aW5nfSBmcm9tICcuL3BvcC1lbnRpdHktZmllbGQvcG9wLWVudGl0eS1waG9uZS9waG9uZS5zZXR0aW5nJztcbmltcG9ydCB7TmFtZUZpZWxkU2V0dGluZ30gZnJvbSAnLi9wb3AtZW50aXR5LWZpZWxkL3BvcC1lbnRpdHktbmFtZS9uYW1lLnNldHRpbmcnO1xuaW1wb3J0IHtJbnB1dEZpZWxkU2V0dGluZ30gZnJvbSAnLi9wb3AtZW50aXR5LWZpZWxkL3BvcC1lbnRpdHktaW5wdXQvaW5wdXQuc2V0dGluZ3MnO1xuaW1wb3J0IHtSYWRpb0ZpZWxkU2V0dGluZ30gZnJvbSAnLi9wb3AtZW50aXR5LWZpZWxkL3BvcC1lbnRpdHktcmFkaW8vcmFkaW8uc2V0dGluZyc7XG5pbXBvcnQge1N3aXRjaEZpZWxkU2V0dGluZ30gZnJvbSAnLi9wb3AtZW50aXR5LWZpZWxkL3BvcC1lbnRpdHktc3dpdGNoL3N3aXRjaC5zZXR0aW5nJztcbmltcG9ydCB7U2VsZWN0RmllbGRTZXR0aW5nfSBmcm9tICcuL3BvcC1lbnRpdHktZmllbGQvcG9wLWVudGl0eS1zZWxlY3Qvc2VsZWN0LnNldHRpbmcnO1xuaW1wb3J0IHtDaGVja2JveEZpZWxkU2V0dGluZ30gZnJvbSAnLi9wb3AtZW50aXR5LWZpZWxkL3BvcC1lbnRpdHktY2hlY2tib3gvY2hlY2tib3guc2V0dGluZyc7XG5pbXBvcnQge1RleHRhcmVhRmllbGRTZXR0aW5nfSBmcm9tICcuL3BvcC1lbnRpdHktZmllbGQvcG9wLWVudGl0eS10ZXh0YXJlYS90ZXh0YXJlYS5zZXR0aW5nJztcbmltcG9ydCB7XG4gIFNlbGVjdEZpbHRlckNvbmZpZyxcbiAgU2VsZWN0RmlsdGVyQ29uZmlnSW50ZXJmYWNlXG59IGZyb20gJy4uL2Jhc2UvcG9wLWZpZWxkLWl0ZW0vcG9wLXNlbGVjdC1maWx0ZXIvc2VsZWN0LWZpbHRlci1jb25maWcubW9kZWwnO1xuaW1wb3J0IHtWYWxpZGF0ZVBhc3N3b3JkLCBWYWxpZGF0ZVBob25lLCBWYWxpZGF0ZVVybCwgVmFsaWRhdGVVc2VybmFtZX0gZnJvbSAnLi4vLi4vc2VydmljZXMvcG9wLXZhbGlkYXRvcnMnO1xuaW1wb3J0IHtUZXh0Q29uZmlnLCBUZXh0Q29uZmlnSW50ZXJmYWNlfSBmcm9tICcuLi9iYXNlL3BvcC1maWVsZC1pdGVtL3BvcC10ZXh0L3RleHQtY29uZmlnLm1vZGVsJztcbmltcG9ydCB7XG4gIFNlbGVjdExpc3RDb25maWcsXG4gIFNlbGVjdExpc3RDb25maWdJbnRlcmZhY2Vcbn0gZnJvbSAnLi4vYmFzZS9wb3AtZmllbGQtaXRlbS9wb3Atc2VsZWN0LWxpc3Qvc2VsZWN0LWxpc3QtY29uZmlnLm1vZGVsJztcbmltcG9ydCB7XG4gIERhdGVQaWNrZXJDb25maWcsXG4gIERhdGVQaWNrZXJDb25maWdJbnRlcmZhY2Vcbn0gZnJvbSAnLi4vYmFzZS9wb3AtZmllbGQtaXRlbS9wb3AtZGF0ZXBpY2tlci9kYXRlcGlja2VyLWNvbmZpZy5tb2RlbCc7XG5pbXBvcnQge1xuICBTZWxlY3RNb2RhbENvbmZpZyxcbiAgU2VsZWN0TW9kYWxDb25maWdJbnRlcmZhY2Vcbn0gZnJvbSBcIi4uL2Jhc2UvcG9wLWZpZWxkLWl0ZW0vcG9wLXNlbGVjdC1tb2RhbC9zZWxlY3QtbW9kYWwtY29uZmlnLm1vZGVsXCI7XG5pbXBvcnQge2lzQXJyYXl9IGZyb20gXCJyeGpzL2ludGVybmFsLWNvbXBhdGliaWxpdHlcIjtcblxuXG4vKipcbiAqIEEgaGVscGVyIG1ldGhvZCB0aGF0IHdpbGwgYnVpbGQgb3V0IFRhYk1lbnVDb25maWcgb2ZmIG9mIGFuIGVudGl0eUNvbmZpZ1xuICogQHBhcmFtIGVudGl0eUNvbmZpZ1xuICogQHBhcmFtIHRhYnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEdldFRhYk1lbnVDb25maWcoY29yZTogQ29yZUNvbmZpZywgdGFiczogVGFiQ29uZmlnW10gPSBbXSk6IFRhYk1lbnVDb25maWcge1xuICBjb25zdCB0YWJNZW51Q29uZmlnID0gbmV3IFRhYk1lbnVDb25maWcoe1xuICAgIG5hbWU6IERldGVybWluZUVudGl0eU5hbWUoY29yZS5lbnRpdHkpLFxuICAgIGdvQmFjazogdHJ1ZSxcbiAgICBwb3J0YWw6IGZhbHNlLFxuICAgIHRhYnM6IHRhYnMsXG4gICAgYnV0dG9uczogR2V0VGFiTWVudUJ1dHRvbnMoY29yZSksXG4gIH0pO1xuICByZXR1cm4gdGFiTWVudUNvbmZpZztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgdGhlIGJ1dHRvbnMgdGhhdCBzaG91bGQgYmUgc2hvd24gZm9yIHRoaXMgZW50aXR5XG4gKiBAcGFyYW0gY29yZVxuICovXG5leHBvcnQgZnVuY3Rpb24gR2V0VGFiTWVudUJ1dHRvbnMoY29yZTogQ29yZUNvbmZpZykge1xuICBsZXQgYnV0dG9ucyA9IFtdO1xuICBjb25zdCBkZWZhdWx0QnV0dG9ucyA9IDxUYWJCdXR0b25JbnRlcmZhY2VbXT5bXG4gICAge2lkOiAnY2xvbmUnLCBuYW1lOiAnQ2xvbmUnLCBhY2Nlc3NUeXBlOiAnY2FuX3VwZGF0ZScsIGhpZGRlbjogZmFsc2V9LFxuICAgIC8vIHsgaWQ6ICdhcmNoaXZlJywgbmFtZTogJ0FyY2hpdmUnLCBhY2Nlc3NUeXBlOiAnY2FuX3VwZGF0ZScsIGhpZGRlbjogdHJ1ZSB9LFxuICAgIC8vIHsgaWQ6ICdhY3RpdmF0ZScsIG5hbWU6ICdBY3RpdmF0ZScsIGFjY2Vzc1R5cGU6ICdjYW5fdXBkYXRlJywgaGlkZGVuOiB0cnVlIH0sXG4gICAge2lkOiAnZGVsZXRlJywgbmFtZTogJ0RlbGV0ZScsIGFjY2Vzc1R5cGU6ICdjYW5fZGVsZXRlJywgaGlkZGVuOiB0cnVlfSxcbiAgICB7aWQ6ICdjbG9zZScsIG5hbWU6ICdDbG9zZScsIGhpZGRlbjogZmFsc2V9LFxuICBdO1xuICBpZiAoSXNPYmplY3QoY29yZS5yZXBvLm1vZGVsLnRhYmxlLmJ1dHRvbiwgdHJ1ZSkpIHtcbiAgICBidXR0b25zID0gZGVmYXVsdEJ1dHRvbnMuZmlsdGVyKChidXR0b24pID0+IHtcblxuICAgICAgaWYgKGJ1dHRvbi5pZCA9PT0gJ2Nsb25lJyAmJiAhY29yZS5yZXBvLm1vZGVsLm1lbnUuYnV0dG9uLmNsb25lKSByZXR1cm4gZmFsc2U7XG4gICAgICAvLyBpZiggYnV0dG9uLmlkID09PSAnYXJjaGl2ZScgJiYgIWNvcmUucmVwby5tb2RlbC5tZW51LmJ1dHRvbi5hcmNoaXZlICkgcmV0dXJuIGZhbHNlO1xuICAgICAgLy8gaWYoIGJ1dHRvbi5pZCA9PT0gJ2FjdGl2YXRlJyAmJiAhY29yZS5yZXBvLm1vZGVsLm1lbnUuYnV0dG9uLmFyY2hpdmUgKSByZXR1cm4gZmFsc2U7XG4gICAgICBpZiAoYnV0dG9uLmlkID09PSAnZGVsZXRlJyAmJiAhY29yZS5yZXBvLm1vZGVsLm1lbnUuYnV0dG9uLmRlbGV0ZSkgcmV0dXJuIGZhbHNlO1xuICAgICAgaWYgKCFidXR0b24uYWNjZXNzVHlwZSkgcmV0dXJuIHRydWU7XG4gICAgICBpZiAoIWNvcmUuYWNjZXNzW2J1dHRvbi5hY2Nlc3NUeXBlXSkgcmV0dXJuIGZhbHNlO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gYnV0dG9ucztcbn1cblxuLyoqXG4gKiBBIGhlbHBlciBtZXRob2QgdGhhdCBzZXRzIHVwIGEgRmllbGRHcm91cENvbmZpZyBmb3IgYSBjcmVhdGUvbmV3IHBvcC10YWJsZS1kaWFsb2dcbiAqIEBwYXJhbSBlbnRpdHlDb25maWdcbiAqIEBwYXJhbSBnb1RvVXJsXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBHZXRPYmplY3RWYXIob2JqOiBEaWN0aW9uYXJ5PGFueT4sIHBhdGg6IHN0cmluZykge1xuICBjb25zdCBzdGVwcyA9IHBhdGguc3BsaXQoJy4nKTtcbiAgY29uc3Qga2V5ID0gc3RlcHMucG9wKCk7XG4gIGNvbnN0IHBhdGhTdG9yYWdlID0gU3RvcmFnZUdldHRlcihvYmosIHN0ZXBzKTtcbiAgaWYgKHBhdGhTdG9yYWdlKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBwYXRoU3RvcmFnZVtrZXldICE9PSAndW5kZWZpbmVkJyA/IHBhdGhTdG9yYWdlW2tleV0gOiB1bmRlZmluZWQ7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxufVxuXG5cbi8qKlxuICogR2V0IGEgbGlzdCBvZiB0aGUgdHJhbnNmb3JtYXRpb25zIHRoYXQgYXJlIHdpdGhpbiBhIGZpZWxkIHNldFxuICogQHBhcmFtIG9ialxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBHZXRPYmplY3RUcmFuc2Zvcm1hdGlvbnMob2JqOiBPYmplY3QpIHtcbiAgY29uc3QgdHJhbnNmb3JtYXRpb25zID0gW107XG4gIE9iamVjdC5rZXlzKG9iaikubWFwKChrZXkpID0+IHtcbiAgICBjb25zdCBmaWVsZCA9IG9ialtrZXldO1xuICAgIGlmIChJc09iamVjdChmaWVsZCwgWydtb2RlbCddKSkge1xuICAgICAgaWYgKGZpZWxkLm1vZGVsICYmIGZpZWxkLm1vZGVsLm5hbWUgJiYgZmllbGQubW9kZWwudHJhbnNmb3JtYXRpb24pIHtcbiAgICAgICAgdHJhbnNmb3JtYXRpb25zW2ZpZWxkLm1vZGVsLm5hbWVdID0gQ2xlYW5PYmplY3Qoe1xuICAgICAgICAgIHR5cGU6IGZpZWxkLm1vZGVsLnRyYW5zZm9ybWF0aW9uLnR5cGUsXG4gICAgICAgICAgYXJnMTogZmllbGQubW9kZWwudHJhbnNmb3JtYXRpb24uYXJnMSA/IGZpZWxkLm1vZGVsLnRyYW5zZm9ybWF0aW9uLmFyZzEgOiBudWxsLFxuICAgICAgICAgIGFyZzI6IGZpZWxkLm1vZGVsLnRyYW5zZm9ybWF0aW9uLmFyZzIgPyBmaWVsZC5tb2RlbC50cmFuc2Zvcm1hdGlvbi5hcmcyIDogbnVsbCxcbiAgICAgICAgICBhcmczOiBmaWVsZC5tb2RlbC50cmFuc2Zvcm1hdGlvbi5hcmczID8gZmllbGQubW9kZWwudHJhbnNmb3JtYXRpb24uYXJnMyA6IG51bGwsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoSXNPYmplY3QoZmllbGQsIFsnaWQnLCAnbmFtZSddKSkge1xuICAgICAgY29uc29sZS5sb2coJ3dpdGggcmVsYXRpb24nLCBrZXksIG9ialtrZXldKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coJ2ZhaWwnLCBrZXkpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiB0cmFuc2Zvcm1hdGlvbnM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBTZXRDb3JlVmFsdWUoY29yZTogQ29yZUNvbmZpZyB8IFRhYk1lbnVDb25maWcsIGVudGl0eV9wYXRoOiBzdHJpbmcsIHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgY29uc3Qgc3RlcHM6IHN0cmluZ1tdID0gZW50aXR5X3BhdGguc3BsaXQoJy4nKTtcbiAgY29uc3Qga2V5ID0gc3RlcHMucG9wKCk7XG4gIGNvbnN0IHBhdGhTdG9yYWdlID0gU3RvcmFnZUdldHRlcihjb3JlLCBzdGVwcyk7XG4gIGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuICAgIGRlbGV0ZSBwYXRoU3RvcmFnZVtrZXldO1xuICB9IGVsc2Uge1xuICAgIHBhdGhTdG9yYWdlW2tleV0gPSB2YWx1ZTtcbiAgfVxufVxuXG4vKipcbiAqIFBhcnNlIGEgdmFsdWUgd2l0aCBhbnkgbXV0YXRpb25zIHRoYXQgbmVlZCB0byBiZSBhcHBsaWVkXG4gKiBAcGFyYW0gdmFsdWVcbiAqIEBwYXJhbSBjb3JlXG4gKiBAcGFyYW0gYmxvY2tFbnRpdHlcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5leHBvcnQgZnVuY3Rpb24gUGFyc2VNb2RlbFZhbHVlKHZhbHVlOiBhbnkgPSAnJywgY29yZT86IENvcmVDb25maWcsIGJsb2NrRW50aXR5ID0gZmFsc2UpIHtcbiAgLy8gY29uc29sZS5sb2coJ1BhcnNlTW9kZWxWYWx1ZScsIHZhbHVlKTtcbiAgbGV0IHRtcCA9IHZhbHVlO1xuICBpZiAodHlwZW9mIHRtcCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAvLyBjb25zb2xlLmxvZygnenp6JylcbiAgICByZXR1cm4gdG1wO1xuICB9XG4gIGlmICh0bXAgPT09ICdudWxsJyB8fCB0bXAgPT09IG51bGwpIHtcbiAgICAvLyBjb25zb2xlLmxvZyggJ2EnLCB0bXAgKTtcbiAgICB0bXAgPSBudWxsO1xuICB9IGVsc2UgaWYgKHR5cGVvZiB0bXAgPT09ICdib29sZWFuJykge1xuICAgIHRtcCA9ICt0bXA7XG4gICAgLy8gY29uc29sZS5sb2coICdiJywgdG1wICk7XG4gIH0gZWxzZSBpZiAoSXNTdHJpbmcodG1wLCB0cnVlKSkge1xuICAgIGlmICh0bXAuaW5jbHVkZXMoJy8nKSkgeyAvLyB1cmxcbiAgICAgIGlmIChjb3JlICYmIGNvcmUucGFyYW1zICYmIElzU3RyaW5nKHRtcCwgdHJ1ZSkgJiYgdG1wLmluY2x1ZGVzKCcjJykpIHtcbiAgICAgICAgdG1wID0gUGFyc2VVcmxGb3JQYXJhbXModG1wLCBjb3JlLnBhcmFtcyk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCAnZCcsIHRtcCApO1xuICAgICAgfVxuICAgICAgaWYgKCFibG9ja0VudGl0eSAmJiBjb3JlICYmIGNvcmUuZW50aXR5ICYmIElzU3RyaW5nKHRtcCwgdHJ1ZSkgJiYgdG1wLmluY2x1ZGVzKCc6JykpIHtcbiAgICAgICAgY29uc3QgZW50aXR5RmllbGQgPSBQYXJzZVN0cmluZ0ZvckVudGl0eUZpZWxkKHRtcCwgY29yZS5lbnRpdHkpO1xuICAgICAgICBpZiAoSXNEZWZpbmVkKGVudGl0eUZpZWxkLCBmYWxzZSkpIHtcbiAgICAgICAgICB0bXAgPSBlbnRpdHlGaWVsZDtcbiAgICAgICAgfVxuICAgICAgICAvLyBjb25zb2xlLmxvZyggJ2UnLCB0bXAgKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0bXA7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChJc1N0cmluZyh0bXAsIHRydWUpICYmIHRtcC5pbmNsdWRlcygnYWxpYXM6JykpIHtcbiAgICAgICAgdG1wID0gUGFyc2VGb3JBbGlhcyh0bXApO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyggJ2YnLCB0bXAgKTtcbiAgICAgIH1cbiAgICAgIGlmIChjb3JlKSB7XG4gICAgICAgIGlmICh0bXAuaW5jbHVkZXMoJy4nKSAmJiAhKHRtcC5pbmNsdWRlcygnQCcpKSAmJiAhKHRtcC5pbmNsdWRlcygnICcpKSkgeyAvLyBvYmplY3QgbG9jYXRpb25cbiAgICAgICAgICBjb25zdCBjb3JlVmFyID0gR2V0T2JqZWN0VmFyKGNvcmUsIHRtcCk7XG4gICAgICAgICAgaWYgKHR5cGVvZiBjb3JlVmFyICE9PSAndW5kZWZpbmVkJykgdG1wID0gY29yZVZhcjtcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZyggJ2cnLCB0bXAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjb3JlLnBhcmFtcyAmJiBJc1N0cmluZyh0bXAsIHRydWUpICYmIHRtcC5pbmNsdWRlcygnIycpKSB7XG4gICAgICAgICAgY29uc3QgcGFyYW1zRmllbGQgPSBQYXJzZVN0cmluZ0ZvclBhcmFtcyh0bXAsIGNvcmUucGFyYW1zKTtcbiAgICAgICAgICBpZiAoSXNEZWZpbmVkKHBhcmFtc0ZpZWxkLCBmYWxzZSkpIHtcbiAgICAgICAgICAgIHRtcCA9IHBhcmFtc0ZpZWxkO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBjb25zb2xlLmxvZyggJ2gnLCB0bXAgKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWJsb2NrRW50aXR5ICYmIGNvcmUuZW50aXR5ICYmIElzU3RyaW5nKHRtcCwgdHJ1ZSkgJiYgdG1wLmluY2x1ZGVzKCc6JykpIHtcbiAgICAgICAgICBjb25zdCBlbnRpdHlGaWVsZCA9IFBhcnNlU3RyaW5nRm9yRW50aXR5RmllbGQodG1wLCBjb3JlLmVudGl0eSk7XG4gICAgICAgICAgaWYgKElzRGVmaW5lZChlbnRpdHlGaWVsZCwgZmFsc2UpKSB7XG4gICAgICAgICAgICB0bXAgPSBlbnRpdHlGaWVsZDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBjb25zb2xlLmxvZyggJ2knLCB0bXAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIGlmIChJc051bWJlcih0bXApKSB7XG4gICAgLy8gY29uc29sZS5sb2coICdjYScsIHRtcCApO1xuICAgIHRtcCA9IE51bWJlcih0bXApO1xuICAgIC8vIGNvbnNvbGUubG9nKCAnYycsIHRtcCApO1xuICB9XG4gIC8vIGNvbnNvbGUubG9nKCAnYWZ0ZXInLCB0bXAgKTtcbiAgcmV0dXJuIHRtcDtcbn1cblxuXG4vKipcbiAqIExvb2sgdGhyb3VnaCBhbiBlbnRpcmUgb2JqZWN0IGFuZCBtYWtlIHRoZSBuZWNlc3NhcnkgbXV0YXRpb25zXG4gKiBAcGFyYW0gb2JqXG4gKiBAcGFyYW0gZW50aXR5Q29uZmlnXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFBhcnNlT2JqZWN0RGVmaW5pdGlvbnMob2JqOiBvYmplY3QsIGVudGl0eUNvbmZpZzogQ29yZUNvbmZpZykge1xuICBjb25zdCBkZWZpbml0aW9ucyA9IHt9O1xuICBsZXQgdmFsdWU7XG4gIGlmICh0eXBlb2Ygb2JqICE9PSAndW5kZWZpbmVkJykge1xuICAgIGlmIChvYmogJiYgQXJyYXkuaXNBcnJheShvYmopKSBvYmogPSBUb09iamVjdChvYmopO1xuICAgIGlmICh0eXBlb2Ygb2JqID09PSAnb2JqZWN0Jykge1xuICAgICAgT2JqZWN0LmtleXMob2JqKS5tYXAoKGtleSkgPT4ge1xuICAgICAgICB2YWx1ZSA9IFBhcnNlTW9kZWxWYWx1ZShvYmpba2V5XSwgZW50aXR5Q29uZmlnKTtcbiAgICAgICAgZGVmaW5pdGlvbnNba2V5XSA9IHZhbHVlO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGRlZmluaXRpb25zO1xufVxuXG4vKipcbiAqIEEgbWV0aG9kIHRvIHRyYW5zbGF0ZSBlbnRpdHlJZCBmaWVsZHMgb3V0IG9mIGEgdXJsIC8jYXBwLyNwbHVyYWxfbmFtZS86ZW50aXR5SWQsICgjKSBpbmRpY2F0ZXMgYSBlbnRpdHlJZCBwYXJhbSwgKDopIGluZGljYXRlcyBhIGVudGl0eUlkIGZpZWxkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBQYXJzZVVybEZvckVudGl0eUZpZWxkcyh1cmw6IHN0cmluZywgZW50aXR5OiBFbnRpdHkpIHsgLy8gcmVjdXJzaXZlXG4gIGlmICh1cmwgJiYgdXJsLmluY2x1ZGVzKCc6JykpIHtcbiAgICBjb25zdCBzdGFydCA9IHVybC5pbmRleE9mKCc6Jyk7XG4gICAgY29uc3QgZW5kID0gdXJsLmluZGV4T2YoJy8nLCBzdGFydCkgIT09IC0xID8gdXJsLmluZGV4T2YoJy8nLCBzdGFydCkgOiB1cmwubGVuZ3RoO1xuICAgIGNvbnN0IGZpZWxkTmFtZSA9IHVybC5zdWJzdHJpbmcoc3RhcnQgKyAxLCBlbmQpO1xuICAgIHVybCA9IHVybC5yZXBsYWNlKCc6JyArIGZpZWxkTmFtZSwgZW50aXR5W2ZpZWxkTmFtZV0pO1xuICAgIGlmICh1cmwgJiYgdXJsLmluY2x1ZGVzKCc6JykpIHtcbiAgICAgIHVybCA9IFBhcnNlVXJsRm9yRW50aXR5RmllbGRzKHVybCwgZW50aXR5KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHVybDtcbn1cblxuXG4vKipcbiAqIFRyYW5zbGF0ZSBhbiBhbGlhc2VzIG9yIG11dGF0aW9ucyB3aXRoaW4gYSB1cmxcbiAqIEBwYXJhbSB1cmxcbiAqIEBwYXJhbSBlbnRpdHlcbiAqIEBwYXJhbSBpZ25vcmVcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5leHBvcnQgZnVuY3Rpb24gUGFyc2VMaW5rVXJsKHVybDogc3RyaW5nLCBlbnRpdHk6IE9iamVjdCA9IG51bGwsIGlnbm9yZTogc3RyaW5nW10gPSBbXSkge1xuICBpZiAodXJsKSB7XG4gICAgcmV0dXJuIHVybC5zcGxpdCgnLycpLm1hcCgocGFydCkgPT4ge1xuICAgICAgaWYgKHBhcnQuaW5jbHVkZXMoJ2FsaWFzOicpKSB7XG4gICAgICAgIHBhcnQgPSBQb3BQaXBlLmxhYmVsLmdldEFsaWFzKChwYXJ0LnNwbGl0KCc6JylbMV0pKTtcbiAgICAgIH0gZWxzZSBpZiAocGFydC5pbmNsdWRlcygnOicpICYmIGVudGl0eSkge1xuICAgICAgICBpZiAoIShpZ25vcmUuaW5jbHVkZXMocGFydCkpKSB7XG4gICAgICAgICAgcGFydCA9IHBhcnQuc3BsaXQoJzonKVsxXTtcbiAgICAgICAgICBpZiAocGFydCBpbiBlbnRpdHkpIHBhcnQgPSBlbnRpdHlbcGFydF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBwYXJ0O1xuICAgIH0pLmpvaW4oJy8nKTtcbiAgfVxuICByZXR1cm4gdXJsO1xufVxuXG5cbi8qKlxuICogQSBtZXRob2QgdG8gdHJhbnNsYXRlIGVudGl0eUlkIHBhcmFtcyBvdXQgb2YgYSB1cmwgLyNhcHAvI3BsdXJhbF9uYW1lLzplbnRpdHlJZCwgKCMpIGluZGljYXRlcyBhIGVudGl0eUlkIHBhcmFtLCAoOikgaW5kaWNhdGVzIGEgZW50aXR5SWQgZmllbGRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFBhcnNlVXJsRm9yUGFyYW1zKHVybDogc3RyaW5nLCBlbnRpdHlQYXJhbXM6IEVudGl0eVBhcmFtcyk6IHN0cmluZyB7IC8vIHJlY3Vyc2l2ZVxuICBpZiAodXJsICYmIHVybC5pbmNsdWRlcygnIycpICYmICEodXJsLmluY2x1ZGVzKCcgJykpKSB7XG4gICAgY29uc3Qgc3RhcnQgPSB1cmwuaW5kZXhPZignIycpO1xuICAgIGNvbnN0IGVuZCA9IHVybC5pbmRleE9mKCcvJywgc3RhcnQpICE9PSAtMSA/IHVybC5pbmRleE9mKCcvJywgc3RhcnQpIDogdXJsLmxlbmd0aDtcbiAgICBjb25zdCBwYXJhbU5hbWUgPSB1cmwuc3Vic3RyaW5nKHN0YXJ0ICsgMSwgZW5kKTtcbiAgICB1cmwgPSB1cmwucmVwbGFjZSgnIycgKyBwYXJhbU5hbWUsIGVudGl0eVBhcmFtc1twYXJhbU5hbWVdKTtcbiAgICBpZiAodXJsICYmIHVybC5pbmNsdWRlcygnIycpKSB7XG4gICAgICB1cmwgPSBQYXJzZVVybEZvclBhcmFtcyh1cmwsIGVudGl0eVBhcmFtcyk7XG4gICAgfVxuICB9XG4gIHJldHVybiB1cmw7XG59XG5cblxuLyoqXG4gKiBBIG1ldGhpZCB0aGF0IHJlcGxhY2VzIGVudGl0eUlkIGFsaWFzZXMgZm91bmQgaW4gYSBzdHJpbmdcbiAqIEBwYXJhbSBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFBhcnNlRm9yQWxpYXMoc3RyaW5nOiBzdHJpbmcpIHtcbiAgaWYgKElzU3RyaW5nKHN0cmluZywgdHJ1ZSkpIHtcbiAgICBsZXQgYWxpYXMgPSBmYWxzZTtcbiAgICBjb25zdCBwYXJ0cyA9IFtdO1xuICAgIHN0cmluZy5zcGxpdCgnOicpLm1hcCgocGFydCkgPT4ge1xuICAgICAgaWYgKHBhcnQuaW5jbHVkZXMoJ2FsaWFzJykpIHtcbiAgICAgICAgYWxpYXMgPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGFydHMucHVzaChhbGlhcyA/IFRpdGxlQ2FzZShQb3BQaXBlLmxhYmVsLmdldEFsaWFzKChwYXJ0KSkpIDogcGFydCk7XG4gICAgICAgIGFsaWFzID0gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gcGFydDtcbiAgICB9KTtcbiAgICByZXR1cm4gcGFydHMuam9pbignICcpO1xuICB9XG4gIHJldHVybiBzdHJpbmc7XG59XG5cblxuLyoqXG4gKiBBIG1ldGhvZCB0byB0cmFuc2xhdGUgZW50aXR5SWQgZmllbGRzIG91dCBvZiBhIHN0cmluZyAnOmVudGl0eUlkJyAoOikgaW5kaWNhdGVzIGEgZW50aXR5SWQgZmllbGRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFBhcnNlU3RyaW5nRm9yRW50aXR5RmllbGQoc3RyOiBzdHJpbmcsIGVudGl0eTogRW50aXR5KSB7IC8vIHJlY3Vyc2l2ZVxuICBpZiAodHlwZW9mIChzdHIpID09PSAnc3RyaW5nJyAmJiBzdHIuaW5jbHVkZXMoJzonKSAmJiAhKHN0ci5pbmNsdWRlcygnICcpKSkge1xuICAgIGNvbnN0IHN0YXJ0ID0gc3RyLmluZGV4T2YoJzonKTtcbiAgICBjb25zdCBlbmQgPSBzdHIuaW5kZXhPZignLicsIHN0YXJ0KSAhPT0gLTEgPyBzdHIuaW5kZXhPZignLicsIHN0YXJ0KSA6IHN0ci5sZW5ndGg7XG4gICAgY29uc3QgZmllbGROYW1lID0gc3RyLnN1YnN0cmluZyhzdGFydCArIDEsIGVuZCk7XG4gICAgaWYgKElzRGVmaW5lZChlbnRpdHlbZmllbGROYW1lXSwgZmFsc2UpKSB7XG4gICAgICBzdHIgPSBzdHIucmVwbGFjZSgnOicgKyBmaWVsZE5hbWUsIGVudGl0eVtmaWVsZE5hbWVdKTtcbiAgICAgIGlmIChzdHIgJiYgc3RyLmluY2x1ZGVzKCc6JykpIHtcbiAgICAgICAgc3RyID0gUGFyc2VTdHJpbmdGb3JFbnRpdHlGaWVsZChzdHIsIGVudGl0eSk7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2UgaWYgKHR5cGVvZiAoc3RyKSA9PT0gJ3N0cmluZycgJiYgc3RyLmluY2x1ZGVzKCc6JykgJiYgc3RyLmluY2x1ZGVzKCcgJykpIHtcbiAgICBjb25zdCBwYXJ0cyA9IHN0ci50cmltKCkuc3BsaXQoJyAnKTtcbiAgICBjb25zdCBwYXJ0aWFscyA9IFtdO1xuICAgIHBhcnRzLm1hcCgocGFydCkgPT4ge1xuICAgICAgY29uc3Qgc3RhcnQgPSBwYXJ0LmluZGV4T2YoJzonKTtcbiAgICAgIGNvbnN0IGVuZCA9IHBhcnQuaW5kZXhPZignLicsIHN0YXJ0KSAhPT0gLTEgPyBwYXJ0LmluZGV4T2YoJy4nLCBzdGFydCkgOiBwYXJ0Lmxlbmd0aDtcbiAgICAgIGNvbnN0IGZpZWxkTmFtZSA9IHBhcnQuc3Vic3RyaW5nKHN0YXJ0ICsgMSwgZW5kKTtcbiAgICAgIGlmIChJc0RlZmluZWQoZW50aXR5W2ZpZWxkTmFtZV0sIGZhbHNlKSkge1xuICAgICAgICBwYXJ0ID0gcGFydC5yZXBsYWNlKCc6JyArIGZpZWxkTmFtZSwgZW50aXR5W2ZpZWxkTmFtZV0pO1xuICAgICAgICBpZiAocGFydCAmJiBwYXJ0LmluY2x1ZGVzKCc6JykpIHtcbiAgICAgICAgICBwYXJ0ID0gUGFyc2VTdHJpbmdGb3JFbnRpdHlGaWVsZChwYXJ0LCBlbnRpdHkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBwYXJ0aWFscy5wdXNoKHBhcnQpO1xuICAgIH0pO1xuICAgIHN0ciA9IHBhcnRpYWxzLmpvaW4oJyAnKS50cmltKCk7XG5cbiAgfVxuICByZXR1cm4gc3RyO1xufVxuXG5cbi8qKlxuICogQSBtZXRob2QgdGhhdCByZXBsYWNlcyBlbnRpdHlJZCBwYXJhbXMgZm91bmQgaW4gYSBzdHJpbmdcbiAqIEBwYXJhbSBzdHJcbiAqIEBwYXJhbSBlbnRpdHlQYXJhbXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFBhcnNlU3RyaW5nRm9yUGFyYW1zKHN0cjogc3RyaW5nLCBlbnRpdHlQYXJhbXM6IEVudGl0eVBhcmFtcywgc2VwYXJhdG9yID0gJy4nKTogc3RyaW5nIHsgLy8gcmVjdXJzaXZlXG4gIGlmICh0eXBlb2YgKHN0cikgPT09ICdzdHJpbmcnICYmIHN0ci5pbmNsdWRlcygnIycpKSB7XG4gICAgY29uc3Qgc3RhcnQgPSBzdHIuaW5kZXhPZignIycpO1xuICAgIGNvbnN0IGVuZCA9IHN0ci5pbmRleE9mKHNlcGFyYXRvciwgc3RhcnQpICE9PSAtMSA/IHN0ci5pbmRleE9mKHNlcGFyYXRvciwgc3RhcnQpIDogc3RyLmxlbmd0aDtcbiAgICBjb25zdCBwYXJhbU5hbWUgPSBzdHIuc3Vic3RyaW5nKHN0YXJ0ICsgMSwgZW5kKTtcbiAgICBpZiAoZW50aXR5UGFyYW1zW3BhcmFtTmFtZV0pIHtcbiAgICAgIHN0ciA9IHN0ci5yZXBsYWNlKCcjJyArIHBhcmFtTmFtZSwgZW50aXR5UGFyYW1zW3BhcmFtTmFtZV0pO1xuICAgICAgaWYgKHN0ciAmJiBzdHIuaW5jbHVkZXMoJyMnKSkge1xuICAgICAgICBzdHIgPSBQYXJzZVN0cmluZ0ZvclBhcmFtcyhzdHIsIGVudGl0eVBhcmFtcyk7XG4gICAgICB9XG4gICAgfVxuXG4gIH1cbiAgcmV0dXJuIHN0cjtcbn1cblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdG8gc2V0IHJvdXRlcyBmb3IgYW4gZW50aXR5XG4gKiBAcGFyYW0gcm91dGVzXG4gKiBAcGFyYW0gcGFyYW1zXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEludGVycG9sYXRlRW50aXR5Um91dGVzKHJvdXRlczogU2VydmljZVJvdXRlc0ludGVyZmFjZSwgcGFyYW1zOiBFbnRpdHlQYXJhbXMpIHtcbiAgaWYgKElzT2JqZWN0KHJvdXRlcykpIHtcbiAgICBjb25zdCBzZXQgPSA8U2VydmljZVJvdXRlc0ludGVyZmFjZT57fTtcbiAgICBPYmplY3Qua2V5cyhyb3V0ZXMpLm1hcCgobWV0aG9kKSA9PiB7XG4gICAgICBzZXRbbWV0aG9kXSA9IHt9O1xuICAgICAgT2JqZWN0LmtleXMocm91dGVzW21ldGhvZF0pLm1hcCgocm91dGUpID0+IHtcbiAgICAgICAgaWYgKCFzZXRbbWV0aG9kXVtyb3V0ZV0pIHNldFttZXRob2RdW3JvdXRlXSA9IHt9O1xuICAgICAgICBzZXRbbWV0aG9kXVtyb3V0ZV0ucGF0aCA9IFN0cmluZyhQYXJzZVVybEZvclBhcmFtcyhyb3V0ZXNbbWV0aG9kXVtyb3V0ZV0ucGF0aCwgcGFyYW1zKSkudHJpbSgpO1xuICAgICAgICBzZXRbbWV0aG9kXVtyb3V0ZV0ucGFyYW1zID0gcm91dGVzW21ldGhvZF1bcm91dGVdLnBhcmFtcztcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiBzZXQ7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHJvdXRlcztcbiAgfVxufVxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0byBzZXQgcm91dGVzIGZvciBhbiBlbnRpdHlcbiAqIEBwYXJhbSByb3V0ZXNcbiAqIEBwYXJhbSBwYXJhbXNcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5leHBvcnQgZnVuY3Rpb24gSW50ZXJwb2xhdGVFbnRpdHlSb3V0ZShyb3V0ZTogc3RyaW5nLCBvYmo6IE9iamVjdCkge1xuICBsZXQgcGF0aCA9IEludGVycG9sYXRlU3RyaW5nKHJvdXRlLCBvYmopO1xuICBwYXRoID0gU3RyaW5nUmVwbGFjZUFsbChwYXRoLCAnXFxcXC9cXFxcLycsICdcXFxcLycpO1xuICByZXR1cm4gcGF0aDtcbn1cblxuXG4vKipcbiAqIFJlbW92ZSBhbGwgdGhlIGVtcHR5IHZhbHVlcyBmcm9tIGFuIG9iamVjdFxuICogQHBhcmFtIG1vZGVsXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIENsZWFyRW1wdHlWYWx1ZXMobW9kZWw6IG9iamVjdCkge1xuICBjb25zdCBwb2ludGxlc3MgPSBbbnVsbCwgdW5kZWZpbmVkLCAnJ107XG4gIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKG1vZGVsKS5tYXAoKGtleSkgPT4ge1xuICAgIGlmICh0eXBlb2Yga2V5ID09PSAnc3RyaW5nJyAmJiBrZXkuaW5jbHVkZXMoJ18nKSA9PSBmYWxzZSAmJiBwb2ludGxlc3MuaW5jbHVkZXMobW9kZWxba2V5XSkgJiYga2V5ICE9PSAndmFsdWUnKSB7XG4gICAgICBkZWxldGUgbW9kZWxba2V5XTtcbiAgICB9XG4gICAgaWYgKG1vZGVsW2tleV0gIT09IG51bGwgJiYgIUFycmF5LmlzQXJyYXkobW9kZWxba2V5XSkgJiYgdHlwZW9mIG1vZGVsW2tleV0gPT09ICdvYmplY3QnKSB7XG4gICAgICBtb2RlbFtrZXldID0gQ2xlYXJFbXB0eVZhbHVlcyhtb2RlbFtrZXldKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gbW9kZWw7XG59XG5cbi8qKlxuICogR2V0IGEgbmFtZSB0byBkaXNwbGF5IGZvciBhbiBlbnRpdHksIHVzZSBmYWxsIGJhY2tzIGlmIG5lY2Vzc2FyeVxuICogQHBhcmFtIGVudGl0eVxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBEZXRlcm1pbmVFbnRpdHlOYW1lKGVudGl0eTogRW50aXR5KSB7XG4gIGxldCBuYW1lID0gJyc7XG4gIGlmIChlbnRpdHkpIHtcbiAgICBpZiAoSXNTdHJpbmcoZW50aXR5LmxhYmVsLCB0cnVlKSkge1xuICAgICAgbmFtZSA9IGVudGl0eS5sYWJlbDtcblxuICAgIH0gZWxzZSBpZiAoSXNTdHJpbmcoZW50aXR5Lm5hbWUsIHRydWUpKSB7XG4gICAgICBuYW1lID0gZW50aXR5Lm5hbWU7XG5cbiAgICB9IGVsc2UgaWYgKElzU3RyaW5nKGVudGl0eS5kaXNwbGF5X25hbWUsIHRydWUpKSB7XG4gICAgICBuYW1lID0gZW50aXR5LmRpc3BsYXlfbmFtZTtcblxuICAgIH0gZWxzZSBpZiAoSXNTdHJpbmcoZW50aXR5LmZpcnN0X25hbWUsIHRydWUpKSB7ICAvL2NvZGUgY2hhbmdlIGJ5IENoZXR1IERldmVsb3BtZW50IFRlYW0gb24gMTctMDUtMjAyMVxuICAgICAgbmFtZSA9IGVudGl0eS5maXJzdF9uYW1lICsgJyAnICsgZW50aXR5Lmxhc3RfbmFtZTtcblxuICAgIH0gZWxzZSBpZiAoSXNTdHJpbmcoZW50aXR5LmVtYWlsLCB0cnVlKSkge1xuICAgICAgbmFtZSA9IGVudGl0eS5lbWFpbDtcblxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGVudGl0eS5pZCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIG5hbWUgPSBTdHJpbmcoZW50aXR5LmlkKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG5hbWU7XG59XG5cbi8qKlxuICogUGFyc2UgY29uZGl0aW9uYWwgbG9naWMgb2YgYSB3aGVuIHN0YXRlbWVudFxuICogW1xuICogICAgZmlyc3QgbGV2ZWwgaXMgT1Igc3RhdGVtZW50c1xuICogICAgWyAuLi5FdmVyeSB0aGluZyBpbiB0aGUgc2Vjb25kIGxldmVsIGlzIGFuIEFORCBzdGF0ZW1lbnQuLi4sIFsnbmFtZScsICc9JywgJ3VzZXInXSwgWydhZ2UnLCAnPicsIDIxXSBdLFxuICogICAgW2tleSwgJz0nLCAndmFsdWUgXSxcbiAqICAgIFtrZXksICdpbicsIFsxLDIsMyw0NV0gXSxcbiAqIF1cbiAqIEBwYXJhbSBvYmpcbiAqIEBwYXJhbSB3aGVuXG4gKiBAcGFyYW0gY29yZVxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBFdmFsdWF0ZVdoZW5Db25kaXRpb25zKG9iajogRGljdGlvbmFyeTxhbnk+LCB3aGVuOiBhbnlbXSA9IG51bGwsIGNvcmU/OiBDb3JlQ29uZmlnKSB7XG4gIGlmICghd2hlbiB8fCB3aGVuID09PSBudWxsKSByZXR1cm4gdHJ1ZTtcbiAgbGV0IHBhc3MgPSB0cnVlO1xuICBpZiAoSXNBcnJheSh3aGVuLCB0cnVlKSkgeyAvLyBjb25kaXRpb25hbCBsb2dpYyB0byBkaXNwbGF5IGZpZWxkc1xuICAgIGxldCBibG9jaztcbiAgICB3aGVuID0gRGVlcENvcHkod2hlbikuZmlsdGVyKChzZWN0aW9uKSA9PiBJc0FycmF5KHNlY3Rpb24sIHRydWUpKTtcbiAgICBjb25zdCBpc09yU3RhdGVtZW50ID0gd2hlbi5sZW5ndGggPiAxO1xuICAgIGlmIChpc09yU3RhdGVtZW50KSB7XG4gICAgICAvLyBjb25zb2xlLmxvZygnb3IgY2hlY2snLCBvYmosIHdoZW4sIGNvcmUpO1xuICAgICAgd2hlbi5yZXZlcnNlKCk7XG4gICAgICB3aGlsZSAod2hlbi5sZW5ndGgpIHtcbiAgICAgICAgYmxvY2sgPSB3aGVuLnBvcCgpLmZpbHRlcigoc2VjdGlvbikgPT4gSXNBcnJheShzZWN0aW9uLCB0cnVlKSk7XG4gICAgICAgIHBhc3MgPSBFdmFsdWF0ZVdoZW5Db25kaXRpb24ob2JqLCBibG9jaywgY29yZSk7XG4gICAgICAgIGlmIChwYXNzKSBicmVhaztcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gY29uc29sZS5sb2coJ2NoZWNrJywgb2JqLCB3aGVuLCBjb3JlKTtcbiAgICAgIHBhc3MgPSBFdmFsdWF0ZVdoZW5Db25kaXRpb24ob2JqLCB3aGVuLCBjb3JlKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcGFzcyA9IGZhbHNlO1xuICB9XG4gIHJldHVybiBwYXNzO1xufVxuXG4vKipcbiAqIEV2YWx1YXRlIGEgc2luZ2xlIGNvbmRpdGlvbmFsIGJsb2NrOiBbbG9jYXRpb24sIG9wZXJhdG9yLCB2YWx1ZV1cbiAqIEBwYXJhbSBvYmpcbiAqIEBwYXJhbSBibG9ja1xuICogQHBhcmFtIGNvcmVcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5leHBvcnQgZnVuY3Rpb24gRXZhbHVhdGVXaGVuQ29uZGl0aW9uKG9iajogRGljdGlvbmFyeTxhbnk+LCBibG9jazogYW55W10sIGNvcmU/OiBDb3JlQ29uZmlnKTogYm9vbGVhbiB7XG4gIGNvbnN0IG9wZXJhdG9ycyA9IFsnPScsICc+JywgJz49JywgJzwnLCAndHJ1dGh5JywgJ2ZhbHNleScsICdsZW5ndGgnLCAnY29udGFpbnMnXTtcbiAgbGV0IHBhc3MgPSB0cnVlO1xuICBsZXQgbG9jYXRpb247XG4gIGxldCBvcGVyYXRvcjtcbiAgbGV0IHZhbHVlO1xuICBpZiAoSXNBcnJheShibG9jaywgdHJ1ZSkpIHtcbiAgICAvLyBleHBlY3RzIGFycmF5IG9mIGFycmF5c1xuICAgIGJsb2NrLnNvbWUoKHNlY3Rpb246IGFueSkgPT4ge1xuXG4gICAgICBzZWN0aW9uLnNvbWUoKHJ1bGUpID0+IHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ3J1bGUnLCBydWxlKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ2hhcyBjb3JlJywgY29yZSk7XG4gICAgICAgIGlmIChJc0FycmF5KHJ1bGUsIHRydWUpKSB7XG4gICAgICAgICAgbG9jYXRpb24gPSBydWxlWzBdO1xuICAgICAgICAgIGlmIChydWxlLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgb3BlcmF0b3IgPSAndHJ1dGh5JztcbiAgICAgICAgICAgIHZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICAgIH0gZWxzZSBpZiAocnVsZS5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgICAgIG9wZXJhdG9yID0gJz0nO1xuICAgICAgICAgICAgdmFsdWUgPSBydWxlWzFdO1xuICAgICAgICAgICAgaWYgKFsndHJ1dGh5JywgJ2ZhbHNleScsICdsZW5ndGgnXS5pbmNsdWRlcyh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgb3BlcmF0b3IgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgdmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmIChydWxlLmxlbmd0aCA+PSAyKSB7XG4gICAgICAgICAgICBvcGVyYXRvciA9IHJ1bGVbMV07XG4gICAgICAgICAgICB2YWx1ZSA9IHJ1bGVbMl07XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChsb2NhdGlvbiAmJiBvcGVyYXRvciAmJiBvcGVyYXRvcnMuaW5jbHVkZXMob3BlcmF0b3IpKSB7XG4gICAgICAgICAgICBpZiAoSXNTdHJpbmcobG9jYXRpb24sIHRydWUpICYmIGxvY2F0aW9uIGluIG9iaiAmJiBvYmpbbG9jYXRpb25dKSB7XG4gICAgICAgICAgICAgIGxvY2F0aW9uID0gb2JqW2xvY2F0aW9uXTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoSXNTdHJpbmcobG9jYXRpb24sIHRydWUpICYmIGxvY2F0aW9uLmluY2x1ZGVzKCcuJykpIHtcbiAgICAgICAgICAgICAgbG9jYXRpb24gPSBHZXRPYmplY3RWYXIob2JqLCBsb2NhdGlvbik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBsb2NhdGlvbiA9IFBhcnNlTW9kZWxWYWx1ZShsb2NhdGlvbiwgY29yZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoSXNTdHJpbmcodmFsdWUsIHRydWUpICYmIElzT2JqZWN0KGNvcmUsIFt2YWx1ZV0pKSB7XG4gICAgICAgICAgICAgIHZhbHVlID0gUGFyc2VNb2RlbFZhbHVlKHZhbHVlLCBjb3JlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoSXNTdHJpbmcodmFsdWUsIHRydWUpICYmIElzT2JqZWN0KG9iaiwgW3ZhbHVlXSkpIHtcbiAgICAgICAgICAgICAgdmFsdWUgPSBHZXRPYmplY3RWYXIob2JqLCB2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnbG9jYXRpb24nLCBsb2NhdGlvbik7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnb3BlcmF0b3InLCBvcGVyYXRvcik7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygndmFsdWUnLCB2YWx1ZSk7XG4gICAgICAgICAgICBzd2l0Y2ggKG9wZXJhdG9yKSB7XG4gICAgICAgICAgICAgIGNhc2UgJ2NvbnRhaW5zJzpcbiAgICAgICAgICAgICAgICBpZiAoSXNBcnJheShsb2NhdGlvbikpIHtcbiAgICAgICAgICAgICAgICAgIGlmICghKGxvY2F0aW9uLmluY2x1ZGVzKHZhbHVlKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcGFzcyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKElzU3RyaW5nKGxvY2F0aW9uKSkge1xuICAgICAgICAgICAgICAgICAgaWYgKCEobG9jYXRpb24uc2VhcmNoKHZhbHVlKSA+IC0xKSkge1xuICAgICAgICAgICAgICAgICAgICBwYXNzID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoSXNPYmplY3QobG9jYXRpb24pKSB7XG4gICAgICAgICAgICAgICAgICBpZiAoISh2YWx1ZSBpbiBsb2NhdGlvbikpIHtcbiAgICAgICAgICAgICAgICAgICAgcGFzcyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgcGFzcyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICBjYXNlICdsZW5ndGgnOlxuICAgICAgICAgICAgICAgIGlmICghKElzQXJyYXkobG9jYXRpb24sIHRydWUpKSkge1xuICAgICAgICAgICAgICAgICAgcGFzcyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICBjYXNlICd0cnV0aHknOlxuICAgICAgICAgICAgICAgIGlmICghbG9jYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgIHBhc3MgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgY2FzZSAnZmFsc2V5JzpcbiAgICAgICAgICAgICAgICBpZiAobG9jYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgIHBhc3MgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgY2FzZSAnPSc6XG4gICAgICAgICAgICAgICAgaWYgKGxvY2F0aW9uICE9IHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICBwYXNzID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIGNhc2UgJyE9JzpcbiAgICAgICAgICAgICAgICBpZiAobG9jYXRpb24gPT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgIHBhc3MgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgY2FzZSAnPic6XG4gICAgICAgICAgICAgICAgaWYgKCEobG9jYXRpb24gPiB2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgIHBhc3MgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgY2FzZSAnPj0nOlxuICAgICAgICAgICAgICAgIGlmICghKGxvY2F0aW9uID49IHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgcGFzcyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICBjYXNlICc8JzpcbiAgICAgICAgICAgICAgICBpZiAoIShsb2NhdGlvbiA8IHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgcGFzcyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICBjYXNlICc8PSc6XG4gICAgICAgICAgICAgICAgaWYgKCEobG9jYXRpb24gPD0gdmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICBwYXNzID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcGFzcyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwYXNzID0gZmFsc2U7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcGFzcyA9IGZhbHNlO1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBwYXNzID09PSBmYWxzZTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBwYXNzID0gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gcGFzcztcbn1cblxuXG4vKipcbiAqIGNoZWNrIGlmIGV2ZW50IG1hdGNoZXMgdGhlIHNpZ25hdHVyZSBmb3IgYSBmaWVsZCBwYXRjaFxuICogQHBhcmFtIGNvcmVcbiAqIEBwYXJhbSBldmVudFxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBJc1ZhbGlkRmllbGRQYXRjaEV2ZW50KGNvcmU6IENvcmVDb25maWcsIGV2ZW50OiBQb3BCYXNlRXZlbnRJbnRlcmZhY2UpIHtcbiAgaWYgKElzT2JqZWN0KGV2ZW50LCB0cnVlKSkge1xuICAgIGlmIChldmVudC50eXBlID09PSAnZmllbGQnICYmIGV2ZW50Lm5hbWUgPT09ICdwYXRjaCcgJiYgZXZlbnQuc3VjY2Vzcykge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGlmIChldmVudC50eXBlID09PSAnZmllbGQnICYmIGV2ZW50Lm5hbWUgPT09ICdvbkNoYW5nZScgJiYgZXZlbnQuY29uZmlnLmZhY2FkZSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBjaGVjayBpZiBldmVudCBtYXRjaGVzIHRoZSBzaWduYXR1cmUgZm9yIGEgZmllbGQgcGF0Y2hcbiAqIEBwYXJhbSBjb3JlXG4gKiBAcGFyYW0gZXZlbnRcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5leHBvcnQgZnVuY3Rpb24gSXNWYWxpZENoYW5nZUV2ZW50KGNvcmU6IENvcmVDb25maWcsIGV2ZW50OiBQb3BCYXNlRXZlbnRJbnRlcmZhY2UpIHtcbiAgaWYgKElzT2JqZWN0KGV2ZW50LCB0cnVlKSkge1xuICAgIGlmIChldmVudC50eXBlID09PSAnZmllbGQnICYmIGV2ZW50Lm5hbWUgPT09ICdvbkNoYW5nZScpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cblxuLyoqXG4gKiBDaGVjayBpZiBhIGV2ZW50IG1hdGNoZXMgdGhlIHNhbWUgY29yZSBzaWduYXR1cmUgb2YgYSBjb3JlIHRoYXQgYmVsb25ncyB0byBhIGNvbXBvbmVudFxuICogQHBhcmFtIGNvcmVcbiAqIEBwYXJhbSBldmVudFxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBJc1ZhbGlkQ29yZVNpZ25hdHVyZShjb3JlOiBDb3JlQ29uZmlnLCBldmVudDogUG9wQmFzZUV2ZW50SW50ZXJmYWNlID0gbnVsbCkge1xuICBjb25zb2xlLmxvZygnIElzVmFsaWRDb3JlU2lnbmF0dXJlIGNvcmUnLCBjb3JlKTtcbiAgY29uc29sZS5sb2coJyBJc1ZhbGlkQ29yZVNpZ25hdHVyZSBldmVudCcsIGV2ZW50KTtcbiAgaWYgKElzT2JqZWN0KGNvcmUsIHRydWUpICYmIElzT2JqZWN0KGNvcmUuZW50aXR5KSkge1xuICAgIGlmIChJc09iamVjdChldmVudCwgdHJ1ZSkgJiYgSXNPYmplY3QoZXZlbnQuY29yZSkpIHtcbiAgICAgIHJldHVybiBjb3JlID09PSBldmVudC5jb3JlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBjb25zb2xlLmxvZygnSXNWYWxpZENvcmVTaWduYXR1cmUsIGZhaWwnKTtcbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gR2V0Q3VzdG9tRmllbGRTZXR0aW5ncyhmaWVsZDogRmllbGRJbnRlcmZhY2UpIHtcbiAgbGV0IGZpZWxkU2V0dGluZ3MgPSB7fTtcbiAgc3dpdGNoIChTdHJpbmcoZmllbGQuZmllbGRncm91cC5uYW1lKS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgY2FzZSAnZW1haWwnOlxuICAgICAgZmllbGRTZXR0aW5ncyA9IEVtYWlsRmllbGRTZXR0aW5nO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnYWRkcmVzcyc6XG4gICAgICBmaWVsZFNldHRpbmdzID0gQWRkcmVzc0ZpZWxkU2V0dGluZztcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3Bob25lJzpcbiAgICAgIGZpZWxkU2V0dGluZ3MgPSBQaG9uZUZpZWxkU2V0dGluZztcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ25hbWUnOlxuICAgICAgZmllbGRTZXR0aW5ncyA9IE5hbWVGaWVsZFNldHRpbmc7XG4gICAgICBicmVhaztcbiAgICBjYXNlICd0ZXh0ZmllbGQnOlxuICAgIGNhc2UgJ2lucHV0JzpcbiAgICAgIGZpZWxkU2V0dGluZ3MgPSBJbnB1dEZpZWxkU2V0dGluZztcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3JhZGlvJzpcbiAgICAgIGZpZWxkU2V0dGluZ3MgPSBSYWRpb0ZpZWxkU2V0dGluZztcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3N3aXRjaCc6XG4gICAgICBmaWVsZFNldHRpbmdzID0gU3dpdGNoRmllbGRTZXR0aW5nO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnc2VsZWN0JzpcbiAgICAgIGZpZWxkU2V0dGluZ3MgPSBTZWxlY3RGaWVsZFNldHRpbmc7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdzZWxlY3QtbXVsdGknOlxuICAgIGNhc2UgJ3NlbGVjdF9tdWx0aSc6XG4gICAgY2FzZSAnbXVsdGlfc2VsZWN0aW9uJzpcbiAgICAgIGZpZWxkU2V0dGluZ3MgPSBTZWxlY3RGaWVsZFNldHRpbmc7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdjaGVja2JveCc6XG4gICAgICBmaWVsZFNldHRpbmdzID0gQ2hlY2tib3hGaWVsZFNldHRpbmc7XG4gICAgICBicmVhaztcbiAgICBjYXNlICd0ZXh0YXJlYSc6XG4gICAgICBmaWVsZFNldHRpbmdzID0gVGV4dGFyZWFGaWVsZFNldHRpbmc7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgZmllbGRTZXR0aW5ncyA9IHt9O1xuICB9XG5cbiAgcmV0dXJuIGZpZWxkU2V0dGluZ3M7XG59XG5cbi8qKlxuICogU2VsZWN0aW9uIHR5cGUgZmllbGRzIHJlcXVpcmUgYSBsaXN0IG9mIG9wdGlvbnMgdG8gcHJlc2VudCB0aGUgdXNlclxuICogVGhlIG9wdGlvbiB2YWx1ZXMgbWF5IGJlIGRpcmVjdGx5IGFzc2lnbmVkIG9uIHRoZSBmaWVsZCwgcG9pbnQgdG8gYSBzcGVjaWZpYyBsb2NhdGlvbiBpbiB0aGUgZW50aXR5IGRhdGEsIG9yIHJlZmVyZW5jZSBhIHJlc291cmNlIHRoYXQgbWF5IGV4aXN0cyBpbiB0aGUgZW50aXR5IG1vZGVsc1xuICogLi4uXG4gKiBvcHRpb25zOntcbiAqICAgLi4uXG4gKiAgIHZhbHVlczogRmllbGRJdGVtT3B0aW9uc1tdLCByZXNvbHZlIHdoYXQgaXMgaW4gdGhpcyBsaXN0XG4gKiAgIC4uLlxuICogfVxuICogLi4uXG4gKiBAcGFyYW0gY29yZVxuICogQHBhcmFtIG9wdGlvbnNcbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBNb2RlbE9wdGlvblZhbHVlcyhjb3JlOiBDb3JlQ29uZmlnLCBvcHRpb25zOiBhbnkpIHtcbiAgaWYgKElzT2JqZWN0KG9wdGlvbnMsIHRydWUpKSB7XG4gICAgaWYgKElzU3RyaW5nKG9wdGlvbnMucmVzb3VyY2UsIHRydWUpKSB7XG4gICAgICBpZiAoSXNPYmplY3QoY29yZS5yZXNvdXJjZSwgdHJ1ZSkgJiYgb3B0aW9ucy5yZXNvdXJjZSBpbiBjb3JlLnJlc291cmNlICYmIElzT2JqZWN0KGNvcmUucmVzb3VyY2Vbb3B0aW9ucy5yZXNvdXJjZV0sIFsnZGF0YV92YWx1ZXMnXSkgJiYgSXNBcnJheShjb3JlLnJlc291cmNlW29wdGlvbnMucmVzb3VyY2VdLmRhdGFfdmFsdWVzLCB0cnVlKSkge1xuICAgICAgICBvcHRpb25zLmNvbnZlcnRlZCA9IGZhbHNlO1xuICAgICAgICBvcHRpb25zLnJhd1ZhbHVlcyA9IERlZXBDb3B5KGNvcmUucmVzb3VyY2Vbb3B0aW9ucy5yZXNvdXJjZV0uZGF0YV92YWx1ZXMpO1xuICAgICAgICAvLyBvcHRpb25zLnZhbHVlcyA9IERlZXBDb3B5KCBjb3JlLnJlc291cmNlWyBvcHRpb25zLnJlc291cmNlIF0uZGF0YV92YWx1ZXMgKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKElzQXJyYXkob3B0aW9ucy52YWx1ZXMsIHRydWUpKSB7XG4gICAgICBvcHRpb25zLmNvbnZlcnRlZCA9IGZhbHNlO1xuICAgICAgY29uc3QgdG1wID0gRGVlcENvcHkob3B0aW9ucy52YWx1ZXMpO1xuICAgICAgb3B0aW9ucy52YWx1ZXMgPSBudWxsO1xuICAgICAgb3B0aW9ucy5yYXdWYWx1ZXMgPSB0bXA7XG4gICAgfSBlbHNlIGlmIChJc1N0cmluZyhvcHRpb25zLnZhbHVlcykpIHtcbiAgICAgIGNvbnN0IHRtcE9wdGlvbnMgPSBHZXRPYmplY3RWYXIoY29yZSwgb3B0aW9ucy52YWx1ZXMpO1xuICAgICAgaWYgKElzQXJyYXkodG1wT3B0aW9ucykpIHtcbiAgICAgICAgb3B0aW9ucy5jb252ZXJ0ZWQgPSBmYWxzZTtcbiAgICAgICAgb3B0aW9ucy5yYXdWYWx1ZXMgPSBEZWVwQ29weSh0bXBPcHRpb25zKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHRtcCA9IFBhcnNlTW9kZWxWYWx1ZShvcHRpb25zLnZhbHVlcywgY29yZSk7XG4gICAgICAgIGlmIChJc0FycmF5KHRtcCwgdHJ1ZSkpIHtcbiAgICAgICAgICBvcHRpb25zLmNvbnZlcnRlZCA9IGZhbHNlO1xuICAgICAgICAgIG9wdGlvbnMucmF3VmFsdWVzID0gRGVlcENvcHkodG1wKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gb3B0aW9ucztcbn1cblxuLyoqXG4gKiBHZXQgdGhlIHJ1bGVzIHRoYXQgc2hvdWxkIGJlIGFwcGxpZWQgb24gdGhpcyBmaWVsZFxuICogQHBhcmFtIGZpZWxkSXRlbVxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEZpZWxkSXRlbVJ1bGVzKGZpZWxkSXRlbTogYW55KTogdm9pZCB7XG4gIGNvbnN0IFJ1bGVTZXQgPSB7fTtcbiAgZmllbGRJdGVtLnJ1bGUgPSB7fTtcbiAgY29uc3QgaXRlbVJ1bGVzID0gSXNBcnJheShmaWVsZEl0ZW0uaXRlbXJ1bGVzLCB0cnVlKSA/IGZpZWxkSXRlbS5pdGVtcnVsZXMgOiBbXTsgLy8gZGVmYXVsdCBydWxlcyBpbmhlcml0ZWQgZnJvbSB0aGUgZmllbGRfaXRlbV9pZFxuICBjb25zdCBmaWVsZFJ1bGVzID0gSXNBcnJheShmaWVsZEl0ZW0uZmllbGRydWxlcywgdHJ1ZSkgPyBmaWVsZEl0ZW0uZmllbGRydWxlcyA6IFtdOyAvLyBydWxlcyBzcGVjaWZpYyB0byB0aGlzIGZpZWxkIGl0ZW1cbi8vIHdlIHdhbnQgZmllbGQgcnVsZXMgdG8gb3ZlcnJpZGUgaXRlbXMgcnVsZXMgd2hlbiB0aGVyZSBpcyBvdmVybGFwIGllLi4gdGhlIGl0ZW0gbWlnaHQgY29tZSB3aXRoIGEgZGVmYXVsdCBydWxlIGJ1dCB0aGUgaXRlbXMgcnVsZXMgc2hvdWxkIG92ZXJyaWRlIGl0XG4gIGl0ZW1SdWxlcy5tYXAoKHJ1bGUpID0+IHtcbiAgICBpZiAoSXNBcnJheShydWxlLnZhbGlkYXRpb25zLCB0cnVlKSkge1xuICAgICAgaWYgKCEoSXNPYmplY3QocnVsZS5vcHRpb25zKSkpIHJ1bGUub3B0aW9ucyA9IHt9O1xuICAgICAgcnVsZS5vcHRpb25zLnZhbHVlcyA9IENvbnZlcnRBcnJheVRvT3B0aW9uTGlzdChydWxlLnZhbGlkYXRpb25zLCB7XG4gICAgICAgIG5hbWVLZXk6ICdsYWJlbCcsXG4gICAgICB9KTtcbiAgICAgIHJ1bGUudmFsaWRhdGlvbk1hcCA9IEFycmF5S2V5QnkocnVsZS52YWxpZGF0aW9ucywgJ2lkJyk7XG4gICAgICBydWxlLnZhbHVlID0gK3J1bGUudmFsaWRhdGlvbi5pZDtcbiAgICB9IGVsc2Uge1xuICAgICAgcnVsZS52YWx1ZSA9IHJ1bGUucmF3X3ZhbHVlO1xuICAgIH1cbiAgICBpZiAoIXJ1bGUudmFsdWUgJiYgcnVsZS5kZWZhdWx0X3ZhbHVlKSBydWxlLnZhbHVlID0gcnVsZS5kZWZhdWx0X3ZhbHVlO1xuICAgIFJ1bGVTZXRbcnVsZS5uYW1lXSA9IHJ1bGU7XG4gIH0pO1xuICBmaWVsZFJ1bGVzLm1hcCgocnVsZSkgPT4ge1xuXG4gICAgaWYgKElzT2JqZWN0KFJ1bGVTZXRbcnVsZS5uYW1lXSkpIHtcbiAgICAgIFJ1bGVTZXRbcnVsZS5uYW1lXS5pZCA9IHJ1bGUuaWQ7XG4gICAgICBSdWxlU2V0W3J1bGUubmFtZV0udmFsdWUgPSBJc0FycmF5KFJ1bGVTZXRbcnVsZS5uYW1lXS52YWxpZGF0aW9ucywgdHJ1ZSkgPyBydWxlLnZhbGlkYXRpb24uaWQgOiBydWxlLnJhd192YWx1ZTtcbiAgICAgIFJ1bGVTZXRbcnVsZS5uYW1lXS5maWVsZF9pZCA9IHJ1bGUuZmllbGRfaWQ7XG4gICAgfVxuICB9KTtcblxuICBmaWVsZEl0ZW0ucnVsZXMgPSBPYmplY3QudmFsdWVzKFJ1bGVTZXQpO1xuICBmaWVsZEl0ZW0ucnVsZXMubWFwKChydWxlOiBhbnkpID0+IHtcbiAgICBpZiAoIXJ1bGUudmFsaWRhdGlvbi5maXhlZCkge1xuICAgICAgZmllbGRJdGVtLnJ1bGVbcnVsZS5uYW1lXSA9IFBhcnNlTW9kZWxWYWx1ZShydWxlLnZhbHVlKTtcbiAgICB9XG4gIH0pO1xuXG4vLyBkZWxldGUgZmllbGRJdGVtLmZpZWxkcnVsZXM7XG4vLyBkZWxldGUgZmllbGRJdGVtLml0ZW1ydWxlcztcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gRmllbGRJdGVtTW9kZWwoY29yZTogQ29yZUNvbmZpZywgZmllbGRJdGVtOiBhbnksIGNoZWNrQWNjZXNzID0gdHJ1ZSk6IEZpZWxkSXRlbU1vZGVsSW50ZXJmYWNlIHtcbiAgaWYgKElzT2JqZWN0KGZpZWxkSXRlbSwgdHJ1ZSkpIHtcbiAgICBsZXQgaGFzQWNjZXNzID0gdHJ1ZTtcbiAgICBpZiAoY2hlY2tBY2Nlc3MpIHtcbiAgICAgIGhhc0FjY2VzcyA9IGNvcmUuYWNjZXNzLmNhbl91cGRhdGUgPyB0cnVlIDogZmFsc2U7XG4gICAgICBpZiAoSXNPYmplY3QoY29yZS5lbnRpdHksIFsnc3lzdGVtJ10pICYmIGNvcmUuZW50aXR5LnN5c3RlbSkgaGFzQWNjZXNzID0gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IHNob3dBc1JlYWRvbmx5ID0gK2ZpZWxkSXRlbS5yZWFkb25seSA/IHRydWUgOiAoIWhhc0FjY2VzcyA/IHRydWUgOiBmYWxzZSk7XG4gICAgY29uc3QgYWxsb3dQYXRjaCA9IElzT2JqZWN0KGNvcmUuZW50aXR5LCBbJ2lkJ10pICYmIElzT2JqZWN0KGZpZWxkSXRlbS5wYXRjaCwgWydwYXRoJ10pICYmICFmaWVsZEl0ZW0uZmFjYWRlICYmIGhhc0FjY2VzcyAmJiAhc2hvd0FzUmVhZG9ubHkgPyB0cnVlIDogZmFsc2U7XG4gICAgaWYgKCFmaWVsZEl0ZW0ubWV0YWRhdGEpIHtcbiAgICAgIGZpZWxkSXRlbS5tZXRhZGF0YSA9IHt9O1xuICAgIH1cblxuXG4gICAgZmllbGRJdGVtLm1ldGFkYXRhID0gRGVlcE1lcmdlKGZpZWxkSXRlbS5tZXRhZGF0YSwge2ludGVybmFsX25hbWU6IGNvcmUucGFyYW1zLmludGVybmFsX25hbWV9KTtcbiAgICAvLyBUb0RvOjogT3B0aW1pemUgdGhpcyBwYXJ0LCBjdXJyZW50bHkgdXNlcyBjYXRjaC1hbGwgbWV0aG9kIHRvIGFjY29tbW9kYXRlIGFsbCBmaWVsZCBpdGVtIHR5cGVzLCBuZWVkIHRvIHJ1biBjaGVja3Mgb24gc29tZSBhbmQgbm90IG90aGVycyB3aGljaCBwcmV2ZW50cyBzaW1wbHkgbWVyZ2luZ1xuICAgIGxldCBtb2RlbCA9IDxGaWVsZEl0ZW1Nb2RlbEludGVyZmFjZT57XG4gICAgICAuLi5DbGVhbk9iamVjdCh7IC8vIGFueSBlbXB0eSB2YWx1ZXMgd2lsbCBiZSBwdXJnZWRcbiAgICAgICAgYWNjZXNzOiBoYXNBY2Nlc3MsXG4gICAgICAgIGFsaWduOiBmaWVsZEl0ZW0uYWxpZ24sXG4gICAgICAgIGFsbDogZmllbGRJdGVtLmFsbCxcbiAgICAgICAgYWxsVmFsdWU6IGZpZWxkSXRlbS5hbGxWYWx1ZSxcbiAgICAgICAgYWxsb3dBbGw6IGZpZWxkSXRlbS5hbGxvd0FsbCxcbiAgICAgICAgYWxsb3dHcm91cEFsbDogZmllbGRJdGVtLmFsbG93R3JvdXBBbGwsXG4gICAgICAgIGFsbE92ZXJsYXk6IGZpZWxkSXRlbS5hbGxPdmVybGF5LFxuICAgICAgICBhbGxPdmVybGF5RW5hYmxlZDogZmllbGRJdGVtLmFsbE92ZXJsYXlFbmFibGVkLFxuICAgICAgICBhbGxPdmVybGF5TGFiZWw6IGZpZWxkSXRlbS5hbGxPdmVybGF5TGFiZWwsXG4gICAgICAgIGFsbE92ZXJsYXlNZXNzYWdlOiBmaWVsZEl0ZW0uYWxsT3ZlcmxheU1lc3NhZ2UsXG4gICAgICAgIGFsbE92ZXJsYXlDYWxsYmFjazogZmllbGRJdGVtLmFsbE92ZXJsYXlDYWxsYmFjayxcbiAgICAgICAgYXV0b0ZpbGw6ICtmaWVsZEl0ZW0uYXV0b0ZpbGwgPyB0cnVlIDogbnVsbCxcbiAgICAgICAgYXV0b1NpemU6ICtmaWVsZEl0ZW0uYXV0b1NpemUgPyB0cnVlIDogbnVsbCxcbiAgICAgICAgYXV0b2ZvY3VzOiArZmllbGRJdGVtLmF1dG9mb2N1cyA/IHRydWUgOiBudWxsLFxuICAgICAgICBhdXRvc2VsZWN0OiArZmllbGRJdGVtLmF1dG9zZWxlY3QgPyB0cnVlIDogbnVsbCxcbiAgICAgICAgYm9yZGVyOiBmaWVsZEl0ZW0uYm9yZGVyLFxuICAgICAgICBidWJibGU6IGZpZWxkSXRlbS5idWJibGUsXG4gICAgICAgIGJ1dHRvbjogZmllbGRJdGVtLmJ1dHRvbixcbiAgICAgICAgY2hlY2tib3hQb3NpdGlvbjogZmllbGRJdGVtLmNoZWNrYm94UG9zaXRpb24sXG4gICAgICAgIGNsYXNzTmFtZTogZmllbGRJdGVtLmNsYXNzTmFtZSxcbiAgICAgICAgY29sb3I6IGZpZWxkSXRlbS5jb2xvcixcbiAgICAgICAgY29sbGFwc2VkOiBmaWVsZEl0ZW0uY29sbGFwc2VkLFxuICAgICAgICBjb250cm9sOiBmaWVsZEl0ZW0uY29udHJvbCxcbiAgICAgICAgZGVmYXVsdEhlaWdodDogZmllbGRJdGVtLmRlZmF1bHRIZWlnaHQsXG4gICAgICAgIGRpc2FibGVkOiArZmllbGRJdGVtLmRpc2FibGVkID8gdHJ1ZSA6IGZhbHNlLFxuICAgICAgICBkaXNwbGF5RXJyb3JzOiArZmllbGRJdGVtLmRpc3BsYXlFcnJvcnMgPyB0cnVlIDogZmFsc2UsXG4gICAgICAgIGRyb3BTcGVjaWFsOiBmaWVsZEl0ZW0uZHJvcFNwZWNpYWwsXG4gICAgICAgIGV2ZW50OiArZmllbGRJdGVtLmV2ZW50LFxuICAgICAgICBlbXB0eTogZmllbGRJdGVtLmVtcHR5LFxuICAgICAgICBmYWNhZGU6IGZpZWxkSXRlbS5mYWNhZGUgPyB0cnVlIDogZmFsc2UsXG4gICAgICAgIGZpbHRlclByZWRpY2F0ZTogZmllbGRJdGVtLmZpbHRlclByZWRpY2F0ZSxcbiAgICAgICAgZm9ybTogZmllbGRJdGVtLnZpZXcgPyBTdHJpbmcoZmllbGRJdGVtLnZpZXcubmFtZSkudG9Mb3dlckNhc2UoKSA6IGZpZWxkSXRlbS5mb3JtID8gZmllbGRJdGVtLmZvcm0gOiAnbGFiZWwnLFxuICAgICAgICBoZWFkZXI6IGZpZWxkSXRlbS5oZWFkZXIsXG4gICAgICAgIGhpZGRlbjogZmllbGRJdGVtLmhpZGRlbixcbiAgICAgICAgaGludDogZmllbGRJdGVtLmhpbnQsXG4gICAgICAgIGhpbnRUZXh0OiBmaWVsZEl0ZW0uaGludFRleHQsXG4gICAgICAgIGhlaWdodDogZmllbGRJdGVtLmhlaWdodCxcbiAgICAgICAgaGVscFRleHQ6IGZpZWxkSXRlbS5oZWxwVGV4dCxcbiAgICAgICAgaGVscGVyOiBmaWVsZEl0ZW0uaGVscGVyLFxuICAgICAgICBodG1sOiBmaWVsZEl0ZW0uaHRtbCxcbiAgICAgICAgaWNvbjogZmllbGRJdGVtLmljb24sXG4gICAgICAgIGljb25Db2xvcjogZmllbGRJdGVtLmljb25Db2xvcixcbiAgICAgICAgaW50ZXJ2YWw6IGZpZWxkSXRlbS5pbnRlcnZhbCxcbiAgICAgICAgbGF5b3V0OiBmaWVsZEl0ZW0uc2V0dGluZyAmJiBmaWVsZEl0ZW0uc2V0dGluZy5sYXlvdXQsXG4gICAgICAgIGxldmVsOiBmaWVsZEl0ZW0ubGV2ZWwsXG4gICAgICAgIGxldmVsR2FwOiBmaWVsZEl0ZW0ubGV2ZWxHYXAsXG4gICAgICAgIGxpbms6IGZpZWxkSXRlbS5saW5rLFxuICAgICAgICBsYWJlbDogZmllbGRJdGVtLmxhYmVsLFxuICAgICAgICBsaXN0OiBmaWVsZEl0ZW0ubGlzdCxcbiAgICAgICAgbWF4SGVpZ2h0OiBmaWVsZEl0ZW0ubWF4SGVpZ2h0LFxuICAgICAgICBtdWx0aXBsZTogZmllbGRJdGVtLm11bHRpcGxlLFxuICAgICAgICBtZXNzYWdlOiBmaWVsZEl0ZW0ubWVzc2FnZSxcbiAgICAgICAgbWluaW1hbDogZmllbGRJdGVtLm1pbmltYWwsXG4gICAgICAgIG1vZGU6IGZpZWxkSXRlbS5tb2RlLFxuICAgICAgICBub0luaXRpYWxWYWx1ZTogZmllbGRJdGVtLm5vSW5pdGlhbFZhbHVlLFxuICAgICAgICBsYWJlbFBvc2l0aW9uOiBmaWVsZEl0ZW0ubGFiZWxQb3NpdGlvbixcbiAgICAgICAgbWFzazogZmllbGRJdGVtLm1hc2ssXG4gICAgICAgIG1ldGFkYXRhOiBmaWVsZEl0ZW0ubWV0YWRhdGEgPyBmaWVsZEl0ZW0ubWV0YWRhdGEgOiB7fSxcbiAgICAgICAgbWluOiBmaWVsZEl0ZW0ubWluLFxuICAgICAgICBtYXg6IGZpZWxkSXRlbS5tYXgsXG4gICAgICAgIG1pbkNvbHVtbjogZmllbGRJdGVtLm1pbkNvbHVtbixcbiAgICAgICAgbWF4Q29sdW1uOiBmaWVsZEl0ZW0ubWF4Q29sdW1uLFxuICAgICAgICBtaW5IZWlnaHQ6IGZpZWxkSXRlbS5taW5IZWlnaHQsXG4gICAgICAgIG1pbmxlbmd0aDogSXNPYmplY3QoZmllbGRJdGVtLnJ1bGUpICYmIElzRGVmaW5lZChmaWVsZEl0ZW0ucnVsZS5taW5sZW5ndGgpID8gZmllbGRJdGVtLnJ1bGUubWlubGVuZ3RoIDogKGZpZWxkSXRlbS5taW5sZW5ndGggPyBmaWVsZEl0ZW0ubWlubGVuZ3RoIDogbnVsbCksXG4gICAgICAgIG1heGxlbmd0aDogSXNPYmplY3QoZmllbGRJdGVtLnJ1bGUpICYmIElzRGVmaW5lZChmaWVsZEl0ZW0ucnVsZS5tYXhsZW5ndGgpID8gZmllbGRJdGVtLnJ1bGUubWF4bGVuZ3RoIDogKGZpZWxkSXRlbS5tYXhsZW5ndGggPyBmaWVsZEl0ZW0ubWF4bGVuZ3RoIDogMTI4KSxcbiAgICAgICAgbWluVmFsdWU6IGZpZWxkSXRlbS5taW5WYWx1ZSxcbiAgICAgICAgbWF4VmFsdWU6IGZpZWxkSXRlbS5tYXhWYWx1ZSxcbiAgICAgICAgbmFtZTogZmllbGRJdGVtLm5hbWUsXG4gICAgICAgIG9wdGlvbnM6IE1vZGVsT3B0aW9uVmFsdWVzKGNvcmUsIGZpZWxkSXRlbS5vcHRpb25zKSxcbiAgICAgICAgcGF0dGVybjogZmllbGRJdGVtLnJ1bGUgJiYgZmllbGRJdGVtLnJ1bGUucGF0dGVybiA/IGZpZWxkSXRlbS5ydWxlLnBhdHRlcm4gOiAoZmllbGRJdGVtLnBhdHRlcm4gPyBmaWVsZEl0ZW0ucGF0dGVybiA6IG51bGwpLFxuICAgICAgICBwYXRjaDogYWxsb3dQYXRjaCAmJiBmaWVsZEl0ZW0ucGF0Y2ggPyBmaWVsZEl0ZW0ucGF0Y2ggOiBudWxsLFxuICAgICAgICBwYXRjaEdyb3VwRms6IGZpZWxkSXRlbS5wYXRjaEdyb3VwRmssXG4gICAgICAgIHBhZGRpbmc6IGZpZWxkSXRlbS5wYWRkaW5nLFxuICAgICAgICBwb3NpdGlvbjogZmllbGRJdGVtLnBvc2l0aW9uLFxuICAgICAgICBwcmVzZXJ2ZTogZmllbGRJdGVtLnByZXNlcnZlLFxuICAgICAgICBwcmV2ZW50OiBmaWVsZEl0ZW0ucHJldmVudCxcbiAgICAgICAgcHJlZml4OiBmaWVsZEl0ZW0ucHJlZml4ID8gZmllbGRJdGVtLnByZWZpeCA6IG51bGwsXG4gICAgICAgIHN1ZmZpeDogZmllbGRJdGVtLnN1ZmZpeCA/IGZpZWxkSXRlbS5zdWZmaXggOiBudWxsLFxuICAgICAgICByYWRpdXM6IGZpZWxkSXRlbS5yYWRpdXMsXG4gICAgICAgIHJlYWRvbmx5OiBzaG93QXNSZWFkb25seSxcbiAgICAgICAgcmVzZXQ6IGZpZWxkSXRlbS5yZXNldCxcbiAgICAgICAgcm91dGU6IGZpZWxkSXRlbS5yb3V0ZSxcbiAgICAgICAgcmVxdWlyZWQ6IGZpZWxkSXRlbS5ydWxlICYmIGZpZWxkSXRlbS5ydWxlLnJlcXVpcmVkID8gdHJ1ZSA6IGZpZWxkSXRlbS5yZXF1aXJlZCA/IHRydWUgOiBmYWxzZSxcbiAgICAgICAgc2Vzc2lvbjogZmllbGRJdGVtLnNlc3Npb24sXG4gICAgICAgIHNlc3Npb25QYXRoOiBmaWVsZEl0ZW0uc2Vzc2lvblBhdGgsXG4gICAgICAgIHNob3dNYXNrOiBmaWVsZEl0ZW0uc2hvd01hc2ssXG4gICAgICAgIHNob3dUb29sdGlwOiBmaWVsZEl0ZW0uc2hvd1Rvb2x0aXAsXG4gICAgICAgIHNpemU6IGZpZWxkSXRlbS5zaXplLFxuICAgICAgICBzb3J0OiBmaWVsZEl0ZW0uc29ydCxcbiAgICAgICAgc29ydF9vcmRlcjogZmllbGRJdGVtLnNvcnRfb3JkZXIsXG4gICAgICAgIHNwZWNpYWxDaGFyczogZmllbGRJdGVtLnNwZWNpYWxDaGFycyxcbiAgICAgICAgdG9vbHRpcDogZmllbGRJdGVtLnRvb2x0aXAsXG4gICAgICAgIHRvb2xUaXBEaXJlY3Rpb246IGZpZWxkSXRlbS50b29sVGlwRGlyZWN0aW9uLFxuICAgICAgICB0ZXh0T3ZlcmZsb3c6IGZpZWxkSXRlbS50ZXh0T3ZlcmZsb3csXG4gICAgICAgIHRyYW5zZm9ybWF0aW9uOiBmaWVsZEl0ZW0udHJhbnNmb3JtYXRpb24sXG4gICAgICAgIHRydW5jYXRlOiBmaWVsZEl0ZW0udHJ1bmNhdGUsXG4gICAgICAgIHR5cGU6IGZpZWxkSXRlbS50eXBlLFxuICAgICAgICB2YWx1ZTogZmllbGRJdGVtLnZhbHVlLFxuICAgICAgICB2YWxpZGF0b3JzOiBmaWVsZEl0ZW0udmFsaWRhdG9ycyxcbiAgICAgICAgd2lkdGg6IGZpZWxkSXRlbS53aWR0aCxcbiAgICAgICAgd2FybmluZzogZmllbGRJdGVtLndhcm5pbmcsXG4gICAgICAgIHdoZW46IElzQXJyYXkoZmllbGRJdGVtLndoZW4sIHRydWUpID8gZmllbGRJdGVtLndoZW4gOiBudWxsXG4gICAgICB9KVxuICAgIH07XG5cbiAgICBpZiAobW9kZWwuZm9ybSA9PT0gJ2xhYmVsJykgeyAvLyBsYWJlbCBzcGVjaWZpYyBwYXJhbXNcbiAgICAgIG1vZGVsID0ge1xuICAgICAgICAuLi5tb2RlbCxcbiAgICAgICAgLi4uQ2xlYW5PYmplY3Qoey8vIGxhYmVsIHN0dWZmXG4gICAgICAgICAgc3ViTGFiZWw6IGZpZWxkSXRlbS5zdWJMYWJlbCA/IGZpZWxkSXRlbS5zdWJMYWJlbCA6IG51bGwsXG4gICAgICAgICAgc3ViVmFsdWU6IGZpZWxkSXRlbS5zdWJWYWx1ZSA/IGZpZWxkSXRlbS5zdWJWYWx1ZSA6IG51bGwsXG4gICAgICAgICAgdHJ1bmNhdGU6IGZpZWxkSXRlbS50cnVuY2F0ZSA/IGZpZWxkSXRlbS50cnVuY2F0ZSA6IG51bGwsXG4gICAgICAgICAgY29weUxhYmVsOiBmaWVsZEl0ZW0uY29weUxhYmVsID8gZmllbGRJdGVtLmNvcHlMYWJlbCA6IG51bGwsXG4gICAgICAgICAgbGFiZWxCdXR0b246IGZpZWxkSXRlbS5sYWJlbEJ1dHRvbiA/IGZpZWxkSXRlbS5sYWJlbEJ1dHRvbiA6IG51bGwsXG4gICAgICAgICAgdmFsdWVCdXR0b246IGZpZWxkSXRlbS52YWx1ZUJ1dHRvbiA/IGZpZWxkSXRlbS52YWx1ZUJ1dHRvbiA6IG51bGwsXG4gICAgICAgICAgY29weUxhYmVsQm9keTogZmllbGRJdGVtLmNvcHlMYWJlbEJvZHkgPyBmaWVsZEl0ZW0uY29weUxhYmVsQm9keSA6IG51bGwsXG4gICAgICAgICAgY29weUxhYmVsRGlzcGxheTogZmllbGRJdGVtLmNvcHlMYWJlbERpc3BsYXkgPyBmaWVsZEl0ZW0uY29weUxhYmVsRGlzcGxheSA6IG51bGwsXG4gICAgICAgICAgdmFsdWVCdXR0b25EaXNwbGF5OiBmaWVsZEl0ZW0udmFsdWVCdXR0b25EaXNwbGF5ID8gZmllbGRJdGVtLnZhbHVlQnV0dG9uRGlzcGxheSA6IG51bGwsXG4gICAgICAgICAgdmFsdWVCdXR0b25EaXNhYmxlZDogZmllbGRJdGVtLnZhbHVlQnV0dG9uRGlzYWJsZWQgPyBmaWVsZEl0ZW0udmFsdWVCdXR0b25EaXNhYmxlZCA6IG51bGwsXG4gICAgICAgICAgdmFsdWVCdXR0b25EaXNwbGF5VHJhbnNmb3JtYXRpb246IGZpZWxkSXRlbS52YWx1ZUJ1dHRvbkRpc3BsYXlUcmFuc2Zvcm1hdGlvbiA/IGZpZWxkSXRlbS52YWx1ZUJ1dHRvbkRpc3BsYXlUcmFuc2Zvcm1hdGlvbiA6IG51bGwsXG4gICAgICAgIH0pXG4gICAgICB9O1xuICAgIH1cblxuICAgIGRlbGV0ZSBmaWVsZEl0ZW0ucGF0Y2g7XG4gICAgaWYgKG1vZGVsLnBhdGNoKSB7XG4gICAgICBpZiAobW9kZWwucGF0Y2gucGF0aCkgbW9kZWwucGF0Y2gucGF0aCA9IFN0cmluZ1JlcGxhY2VBbGwoUGFyc2VVcmxGb3JQYXJhbXMobW9kZWwucGF0Y2gucGF0aCwgY29yZS5wYXJhbXMpLCAnLy8nLCAnLycpO1xuICAgICAgaWYgKG1vZGVsLnBhdGNoLm1ldGFkYXRhKSBtb2RlbC5wYXRjaC5tZXRhZGF0YSA9IFBhcnNlT2JqZWN0RGVmaW5pdGlvbnMobW9kZWwucGF0Y2gubWV0YWRhdGEsIGNvcmUpO1xuICAgIH1cbiAgICByZXR1cm4gbW9kZWw7XG4gIH1cblxuICByZXR1cm4ge307XG5cbn1cblxuLyoqXG4gKiBXaGVuIHBhdGNoZXMgYXJlIG1hZGUsIHdlIG5lZWQgdG8gdXBkYXRlIHRoZSBlbnRpdHkgaW4gdGhlIGNvcmUgY29uZmlnXG4gKiBUb0RvOjogSG9waW5nIHRvIGJlIGFibGUgdG8gaW1wcm92ZSB0aGlzLCBhbmQgaGF2ZSBlYWNoIGNvbXBvbmVudCBiZSByZXNwb25zaWJsZSB0byBtYW5hZ2UgdGhlaXIgb3duIHVwZGF0ZXMuIE15IGhlc2l0YXRpb24gcmlnaHQgbm93IGlzIEkgd2FudCB0aGUgbGVhc3QgYW1vdW50IG9mIGNvbXBvbmVudHMgYXMgcG9zc2libGUgbWFuaXB1bGF0aW5nIHRoZSBjb3JlIGNvbmZpZ1xuICogQHBhcmFtIGNvcmVcbiAqIEBwYXJhbSBldmVudFxuICovXG5leHBvcnQgZnVuY3Rpb24gU2Vzc2lvbkVudGl0eUZpZWxkVXBkYXRlKGNvcmU6IENvcmVDb25maWcsIGV2ZW50OiBQb3BCYXNlRXZlbnRJbnRlcmZhY2UsIHBhdGg6IHN0cmluZyA9IG51bGwpIHtcbiAgUG9wTG9nLmV2ZW50KGBTZXNzaW9uRW50aXR5RmllbGRVcGRhdGVgLCBgU2Vzc2lvbiBEZXRlY3RlZGAsIGV2ZW50KTtcbiAgaWYgKElzVmFsaWRDb3JlU2lnbmF0dXJlKGNvcmUsIGV2ZW50KSkge1xuICAgIGlmIChJc1ZhbGlkRmllbGRQYXRjaEV2ZW50KGNvcmUsIGV2ZW50KSkge1xuXG4gICAgICBsZXQgdmFsdWU7XG4gICAgICBpZiAoIShJc1N0cmluZyhwYXRoLCB0cnVlKSkpIHBhdGggPSAnZW50aXR5JztcbiAgICAgIGNvbnN0IHNlc3Npb24gPSBTdG9yYWdlR2V0dGVyKGNvcmUsIFN0cmluZyhwYXRoKS50cmltKCkuc3BsaXQoJy4nKSk7XG4gICAgICBpZiAoZXZlbnQuY29uZmlnLm5hbWUgaW4gc2Vzc2lvbiB8fCBldmVudC5jb25maWcuZmFjYWRlKSB7XG4gICAgICAgIHZhbHVlID0gZXZlbnQuY29uZmlnLmNvbnRyb2wgPyBldmVudC5jb25maWcuY29udHJvbC52YWx1ZSA6IGV2ZW50LmRhdGE7XG4gICAgICAgIHZhbHVlID0gUGFyc2VNb2RlbFZhbHVlKHZhbHVlKTtcbiAgICAgICAgY29uc29sZS5sb2coJ1Nlc3Npb25FbnRpdHlGaWVsZFVwZGF0ZScsIHNlc3Npb24sIGV2ZW50LmNvbmZpZy5uYW1lLCB2YWx1ZSk7XG4gICAgICAgIHNlc3Npb25bZXZlbnQuY29uZmlnLm5hbWVdID0gdmFsdWU7XG4gICAgICAgIGNvcmUucmVwby5jbGVhckNhY2hlKCdhY3RpdmUnLCBgU2Vzc2lvbkVudGl0eUZpZWxkVXBkYXRlYCk7XG4gICAgICAgIGNvcmUucmVwby5jbGVhckNhY2hlKCdhbGwnLCBgU2Vzc2lvbkVudGl0eUZpZWxkVXBkYXRlYCk7XG4gICAgICAgIGV2ZW50LnNlc3Npb24gPSB0cnVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEdldFNpbmd1bGFyTmFtZSh2YWx1ZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgaWYgKElzU3RyaW5nKHZhbHVlLCB0cnVlKSAmJiBTdHJpbmcodmFsdWUpLmxlbmd0aCA+IDMpIHtcbiAgICBsZXQgdG1wID0gU3BhY2VUb0h5cGhlbkxvd2VyKFN0cmluZyh2YWx1ZSkudG9Mb3dlckNhc2UoKS50cmltKCkpO1xuICAgIGlmIChTdHJpbmcodG1wKS5zbGljZSgtMykgPT09ICdpZXMnKSB7XG4gICAgICB0bXAgPSBTdHJpbmcodG1wKS5zbGljZSgwLCAtMyk7XG4gICAgICB0bXAgKz0gJ3knO1xuICAgIH0gZWxzZSBpZiAoU3RyaW5nKHRtcCkuc2xpY2UoLTEpID09PSAncycpIHtcbiAgICAgIHRtcCA9IFN0cmluZyh0bXApLnNsaWNlKDAsIC0xKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdG1wO1xuICB9XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gSXNBbGlhc2FibGUodmFsdWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBpZiAoSXNTdHJpbmcodmFsdWUsIHRydWUpICYmIFN0cmluZyh2YWx1ZSkubGVuZ3RoID4gMykge1xuICAgIGNvbnN0IHRtcCA9IFNwYWNlVG9IeXBoZW5Mb3dlcihTdHJpbmcodmFsdWUpLnRvTG93ZXJDYXNlKCkudHJpbSgpKTtcbiAgICBpZiAoSXNPYmplY3QoUG9wUm91dGVBbGlhc01hcCwgdHJ1ZSkgJiYgdG1wIGluIFBvcFJvdXRlQWxpYXNNYXApIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIElzRW50aXR5KGVudGl0eVZhbHVlOiBzdHJpbmcpIHtcbiAgaWYgKElzU3RyaW5nKGVudGl0eVZhbHVlLCB0cnVlKSkge1xuICAgIGlmIChJc09iamVjdChQb3BBcHAsIFsnZW50aXRpZXMnXSkgJiYgZW50aXR5VmFsdWUgaW4gUG9wQXBwLmVudGl0aWVzKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gUGFyc2VNb2R1bGVSb3V0ZXMocGFyZW50OiBzdHJpbmcsIGNvbmZpZzogUm91dGVbXSwgcm91dGVzID0gW10pIHtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb25maWcubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCByb3V0ZSA9IGNvbmZpZ1tpXTtcbiAgICAvLyBjb25zb2xlLmxvZyhwYXJlbnQgKyAnLycgKyByb3V0ZS5wYXRoKTtcbiAgICByb3V0ZXMucHVzaChyb3V0ZSk7XG4gICAgaWYgKHJvdXRlLmNoaWxkcmVuKSB7XG4gICAgICBjb25zdCBjdXJyZW50UGF0aCA9IHJvdXRlLnBhdGggPyBwYXJlbnQgKyAnLycgKyByb3V0ZS5wYXRoIDogcGFyZW50O1xuICAgICAgUGFyc2VNb2R1bGVSb3V0ZXMoY3VycmVudFBhdGgsIHJvdXRlLmNoaWxkcmVuLCByb3V0ZXMpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcm91dGVzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gUGFyc2VNb2R1bGVSb3V0ZXNGb3JBbGlhc2VzKHJvdXRlczogUm91dGVzKTogUm91dGVzIHtcbiAgaWYgKElzQXJyYXkocm91dGVzLCB0cnVlKSkge1xuICAgIHJvdXRlcy5tYXAoKHJvdXRlOiBhbnkpID0+IHtcbiAgICAgIGlmIChJc09iamVjdChyb3V0ZS5kYXRhLCBbJ2FsaWFzJywgJ2ludGVybmFsX25hbWUnXSkpIHtcbiAgICAgICAgY29uc3QgYWxpYXMgPSByb3V0ZS5kYXRhLmFsaWFzO1xuICAgICAgICBpZiAoSXNPYmplY3QoYWxpYXMsIFsndGFyZ2V0JywgJ3R5cGUnXSkgJiYgIXJvdXRlLmRhdGEubWFzdGVyUGF0aCkge1xuICAgICAgICAgIHJvdXRlLmRhdGEubWFzdGVyUGF0aCA9IHJvdXRlLnBhdGg7XG4gICAgICAgICAgaWYgKElzU3RyaW5nKGFsaWFzLnRhcmdldCwgdHJ1ZSkgJiYgSXNTdHJpbmcoYWxpYXMudHlwZSwgdHJ1ZSkpIHtcbiAgICAgICAgICAgIHJvdXRlLnBhdGggPSBTdHJpbmcoU3RyaW5nUmVwbGFjZUFsbChyb3V0ZS5wYXRoLCBhbGlhcy50YXJnZXQsIEdldFJvdXRlQWxpYXMoKElzU3RyaW5nKGFsaWFzLmludGVybmFsX25hbWUsIHRydWUpID8gYWxpYXMuaW50ZXJuYWxfbmFtZSA6IHJvdXRlLmRhdGEuaW50ZXJuYWxfbmFtZSksIGFsaWFzLnR5cGUpKSkudHJpbSgpO1xuICAgICAgICAgICAgaWYgKHJvdXRlLmRhdGEubWFzdGVyUGF0aCAhPT0gcm91dGUucGF0aCkgcm91dGVzLnB1c2goe1xuICAgICAgICAgICAgICBwYXRoOiByb3V0ZS5kYXRhLm1hc3RlclBhdGgsXG4gICAgICAgICAgICAgIHJlZGlyZWN0VG86IHJvdXRlLnBhdGgsXG4gICAgICAgICAgICAgIHBhdGhNYXRjaDogJ3ByZWZpeCdcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoSXNPYmplY3Qocm91dGUuZGF0YS50YWJsZSwgdHJ1ZSkpIHtcbiAgICAgICAgICAgIGlmIChJc1N0cmluZyhyb3V0ZS5kYXRhLnRhYmxlLnJvdXRlLCB0cnVlKSkge1xuICAgICAgICAgICAgICBjb25zdCB0YWJsZVJvdXRlID0gcm91dGUuZGF0YS50YWJsZS5yb3V0ZTtcbiAgICAgICAgICAgICAgaWYgKFN0cmluZyh0YWJsZVJvdXRlKS5pbmNsdWRlcyhhbGlhcy50YXJnZXQpKSB7XG4gICAgICAgICAgICAgICAgcm91dGUuZGF0YS50YWJsZS5yb3V0ZSA9IFN0cmluZyhTdHJpbmdSZXBsYWNlQWxsKHRhYmxlUm91dGUsIGFsaWFzLnRhcmdldCwgR2V0Um91dGVBbGlhcygoSXNTdHJpbmcoYWxpYXMuaW50ZXJuYWxfbmFtZSwgdHJ1ZSkgPyBhbGlhcy5pbnRlcm5hbF9uYW1lIDogcm91dGUuZGF0YS5pbnRlcm5hbF9uYW1lKSwgYWxpYXMudHlwZSkpKS50cmltKCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChJc1N0cmluZyhyb3V0ZS5kYXRhLnRhYmxlLmdvVG9VcmwpKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGdvVG9VcmwgPSByb3V0ZS5kYXRhLnRhYmxlLmdvVG9Vcmw7XG4gICAgICAgICAgICAgIGlmIChTdHJpbmcoZ29Ub1VybCkuaW5jbHVkZXMocm91dGUuZGF0YS5hbGlhcykpIHtcbiAgICAgICAgICAgICAgICByb3V0ZS5kYXRhLnRhYmxlLmdvVG9VcmwgPSBTdHJpbmcoU3RyaW5nUmVwbGFjZUFsbChnb1RvVXJsLCByb3V0ZS5kYXRhLmFsaWFzLCBHZXRSb3V0ZUFsaWFzKChJc1N0cmluZyhhbGlhcy5pbnRlcm5hbF9uYW1lLCB0cnVlKSA/IGFsaWFzLmludGVybmFsX25hbWUgOiByb3V0ZS5kYXRhLmludGVybmFsX25hbWUpLCBhbGlhcy50eXBlKSkpLnRyaW0oKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICB9IGVsc2UgaWYgKElzU3RyaW5nKHJvdXRlLmRhdGEuYWxpYXMsIHRydWUpICYmICFyb3V0ZS5kYXRhLm1hc3RlclBhdGgpIHtcbiAgICAgICAgICByb3V0ZS5kYXRhLm1hc3RlclBhdGggPSByb3V0ZS5wYXRoO1xuICAgICAgICAgIHJvdXRlLnBhdGggPSBTdHJpbmcoU3RyaW5nUmVwbGFjZUFsbChyb3V0ZS5wYXRoLCByb3V0ZS5kYXRhLmFsaWFzLCBHZXRSb3V0ZUFsaWFzKHJvdXRlLmRhdGEuaW50ZXJuYWxfbmFtZSwgJ3BsdXJhbCcpKSkudHJpbSgpO1xuICAgICAgICAgIGlmIChyb3V0ZS5kYXRhLm1hc3RlclBhdGggIT09IHJvdXRlLnBhdGgpIHJvdXRlcy5wdXNoKHtcbiAgICAgICAgICAgIHBhdGg6IHJvdXRlLmRhdGEubWFzdGVyUGF0aCxcbiAgICAgICAgICAgIHJlZGlyZWN0VG86IHJvdXRlLnBhdGgsXG4gICAgICAgICAgICBwYXRoTWF0Y2g6ICdwcmVmaXgnXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgaWYgKElzT2JqZWN0KHJvdXRlLmRhdGEudGFibGUsIHRydWUpKSB7XG4gICAgICAgICAgICBpZiAoSXNTdHJpbmcocm91dGUuZGF0YS50YWJsZS5yb3V0ZSwgdHJ1ZSkpIHtcbiAgICAgICAgICAgICAgY29uc3QgdGFibGVSb3V0ZSA9IHJvdXRlLmRhdGEudGFibGUucm91dGU7XG4gICAgICAgICAgICAgIGlmIChTdHJpbmcodGFibGVSb3V0ZSkuaW5jbHVkZXMocm91dGUuZGF0YS5hbGlhcykpIHtcbiAgICAgICAgICAgICAgICByb3V0ZS5kYXRhLnRhYmxlLnJvdXRlID0gU3RyaW5nKFN0cmluZ1JlcGxhY2VBbGwodGFibGVSb3V0ZSwgcm91dGUuZGF0YS5hbGlhcywgR2V0Um91dGVBbGlhcyhyb3V0ZS5kYXRhLmludGVybmFsX25hbWUsICdwbHVyYWwnKSkpLnRyaW0oKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKElzU3RyaW5nKHJvdXRlLmRhdGEudGFibGUuZ29Ub1VybCkpIHtcbiAgICAgICAgICAgICAgY29uc3QgZ29Ub1VybCA9IHJvdXRlLmRhdGEudGFibGUuZ29Ub1VybDtcbiAgICAgICAgICAgICAgaWYgKFN0cmluZyhnb1RvVXJsKS5pbmNsdWRlcyhyb3V0ZS5kYXRhLmFsaWFzKSkge1xuICAgICAgICAgICAgICAgIHJvdXRlLmRhdGEudGFibGUuZ29Ub1VybCA9IFN0cmluZyhTdHJpbmdSZXBsYWNlQWxsKGdvVG9VcmwsIHJvdXRlLmRhdGEuYWxpYXMsIEdldFJvdXRlQWxpYXMocm91dGUuZGF0YS5pbnRlcm5hbF9uYW1lLCAncGx1cmFsJykpKS50cmltKCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChJc0FycmF5KHJvdXRlLmNoaWxkcmVuLCB0cnVlKSkge1xuICAgICAgICByb3V0ZS5jaGlsZHJlbiA9IFBhcnNlTW9kdWxlUm91dGVzRm9yQWxpYXNlcyhyb3V0ZS5jaGlsZHJlbik7XG4gICAgICB9XG4gICAgICBpZiAoSXNPYmplY3Qocm91dGUuX2xvYWRlZENvbmZpZywgWydyb3V0ZXMnXSkpIHtcbiAgICAgICAgcm91dGUuX2xvYWRlZENvbmZpZy5yb3V0ZXMgPSBQYXJzZU1vZHVsZVJvdXRlc0ZvckFsaWFzZXMocm91dGUuX2xvYWRlZENvbmZpZy5yb3V0ZXMpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIHJldHVybiByb3V0ZXM7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIEZpZWxkSXRlbVZpZXcodmlldzogYW55KTogeyBpZDogbnVtYmVyLCBuYW1lOiBzdHJpbmcsIHR5cGU6IHN0cmluZywgZGVzY3JpcHRpb246IHN0cmluZyB9IHtcbiAgY29uc3QgdG1wID0gSXNPYmplY3QodmlldykgPyB2aWV3IDogbnVsbDtcbiAgcmV0dXJuIDx7IGlkOiBudW1iZXIsIG5hbWU6IHN0cmluZywgdHlwZTogc3RyaW5nLCBkZXNjcmlwdGlvbjogc3RyaW5nIH0+Q2xlYW5PYmplY3Qoe1xuICAgIGlkOiB0bXAgPyB0bXAuaWQgOiAwLFxuICAgIG5hbWU6IHRtcCA/IHRtcC5uYW1lIDogJ2xhYmVsJyxcbiAgICB0eXBlOiB0bXAgJiYgU3RyaW5nKHRtcC5odG1sKS5pbmNsdWRlcygnWycpID8gU3RyaW5nKHRtcC5odG1sKS5zcGxpdCgnWycpWzFdLnNwbGl0KCddJylbMF0gOiAndGV4dCcsXG4gICAgZGVzY3JpcHRpb246IHRtcCA/IHRtcC5kZXNjcmlwdGlvbiA6IG51bGxcbiAgfSk7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIEZpZWxkSXRlbUJvb2xlYW5WYWx1ZShtb2RlbDogRmllbGRJdGVtTW9kZWxJbnRlcmZhY2UsIGNvcmU6IENvcmVDb25maWcpOiBib29sZWFuIHtcbiAgUG9wTG9nLmRlYnVnKCdGaWVsZEl0ZW1Cb29sZWFuVmFsdWUnLCBgY29udmVydDpgLCB7bmFtZTogbmFtZSwgbW9kZWw6IG1vZGVsLCBjb3JlOiBjb3JlfSk7XG4gIGxldCByZXN1bHQ7XG4gIGlmIChJc0RlZmluZWQobW9kZWwudmFsdWUsIGZhbHNlKSkge1xuICAgIGlmICh0eXBlb2YgbW9kZWwudmFsdWUgPT09ICdib29sZWFuJykge1xuICAgICAgcmVzdWx0ID0gbW9kZWwudmFsdWU7XG4gICAgfSBlbHNlIGlmIChJc1N0cmluZyhtb2RlbC52YWx1ZSwgdHJ1ZSkpIHtcbiAgICAgIHJlc3VsdCA9IFBhcnNlTW9kZWxWYWx1ZShtb2RlbC52YWx1ZSwgY29yZSk7XG4gICAgfSBlbHNlIGlmIChJc051bWJlcihtb2RlbC52YWx1ZSwgZmFsc2UpKSB7XG4gICAgICByZXN1bHQgPSArY29yZS5lbnRpdHlbbW9kZWwubmFtZV0gPiAwO1xuICAgIH1cbiAgfVxuICBpZiAoIShJc0RlZmluZWQocmVzdWx0LCBmYWxzZSkpICYmIG1vZGVsLm5hbWUgJiYgSXNPYmplY3QoY29yZS5lbnRpdHksIHRydWUpICYmIElzRGVmaW5lZChjb3JlLmVudGl0eVttb2RlbC5uYW1lXSkpIHtcbiAgICByZXN1bHQgPSArY29yZS5lbnRpdHlbbW9kZWwubmFtZV0gPiAwO1xuICB9XG5cbiAgaWYgKCEoSXNEZWZpbmVkKHJlc3VsdCwgZmFsc2UpKSkgcmVzdWx0ID0gZmFsc2U7XG4gIFBvcExvZy5kZWJ1ZygnRmllbGRJdGVtQm9vbGVhblZhbHVlJywgYHJlc3VsdDpgLCB7aW5pdGlhbDogbW9kZWwudmFsdWUsIHJlc3VsdDogcmVzdWx0fSk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBGaWVsZEl0ZW1UZXh0VmFsdWUobW9kZWw6IEZpZWxkSXRlbU1vZGVsSW50ZXJmYWNlLCBjb3JlOiBDb3JlQ29uZmlnKTogc3RyaW5nIHtcbiAgbGV0IHJlc3VsdDtcbiAgaWYgKCttb2RlbC52YWx1ZSA+IDApIHtcbiAgICByZXN1bHQgPSBtb2RlbC52YWx1ZTtcbiAgfSBlbHNlIGlmIChJc0RlZmluZWQobW9kZWwudmFsdWUsIGZhbHNlKSAmJiBJc1N0cmluZyhtb2RlbC52YWx1ZSwgdHJ1ZSkpIHtcbiAgICByZXN1bHQgPSBQYXJzZU1vZGVsVmFsdWUobW9kZWwudmFsdWUsIGNvcmUpO1xuICAgIC8vIGNvbnNvbGUubG9nKCAnYmVsb25ncyB0byBwYXJzZScsIG1vZGVsLnZhbHVlLCByZXN1bHQgKTtcbiAgfVxuICBpZiAoIShJc0RlZmluZWQocmVzdWx0LCBmYWxzZSkpICYmIG1vZGVsLm5hbWUgJiYgSXNPYmplY3QoY29yZS5lbnRpdHksIHRydWUpICYmIElzRGVmaW5lZChjb3JlLmVudGl0eVttb2RlbC5uYW1lXSkgJiYgSXNTdHJpbmcoY29yZS5lbnRpdHlbbW9kZWwubmFtZV0sIHRydWUpKSB7XG4gICAgcmVzdWx0ID0gY29yZS5lbnRpdHlbbW9kZWwubmFtZV07XG4gICAgLy8gY29uc29sZS5sb2coICdiZWxvbmdzIHRvIGVudGl0eScsIG1vZGVsLnZhbHVlLCByZXN1bHQgKTtcbiAgfVxuICBpZiAoIShJc0RlZmluZWQocmVzdWx0LCBmYWxzZSkpIHx8IHJlc3VsdCA9PT0gJ051bGwnKSByZXN1bHQgPSAnJztcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEZpZWxkSXRlbUFycmF5VmFsdWUobW9kZWw6IEZpZWxkSXRlbU1vZGVsSW50ZXJmYWNlLCBjb3JlOiBDb3JlQ29uZmlnKTogYW55W10ge1xuICBsZXQgcmVzdWx0O1xuICBpZiAoSXNEZWZpbmVkKG1vZGVsLnZhbHVlLCBmYWxzZSkpIHtcbiAgICBpZiAoSXNBcnJheShtb2RlbC52YWx1ZSwgZmFsc2UpKSB7XG4gICAgICByZXN1bHQgPSBtb2RlbC52YWx1ZTtcbiAgICB9IGVsc2UgaWYgKElzU3RyaW5nKG1vZGVsLnZhbHVlLCB0cnVlKSkge1xuICAgICAgcmVzdWx0ID0gUGFyc2VNb2RlbFZhbHVlKG1vZGVsLnZhbHVlLCBjb3JlKTtcbiAgICB9XG4gIH1cbiAgaWYgKCEoSXNBcnJheShyZXN1bHQsIGZhbHNlKSkgJiYgbW9kZWwubmFtZSAmJiBJc09iamVjdChjb3JlLmVudGl0eSwgdHJ1ZSkgJiYgSXNBcnJheShjb3JlLmVudGl0eVttb2RlbC5uYW1lXSwgZmFsc2UpKSB7XG4gICAgcmVzdWx0ID0gY29yZS5lbnRpdHlbbW9kZWwubmFtZV07XG4gIH1cbiAgaWYgKCEoSXNBcnJheShyZXN1bHQsIGZhbHNlKSkpIHJlc3VsdCA9IFtdO1xuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIEdldFBhdHRlcm5WYWxpZGF0b3IocGF0dGVybjogc3RyaW5nKSB7XG4gIC8vIFRvRG86OiBBZGQgYWxsIG9mIHRoZSBvcHRpb25zIHRoYXQgYXJlIGJ1aWx0IGZvciB0aGlzLCBudW1lcmljLCBhbHBoYSwgLi4uLlxuICBzd2l0Y2ggKFN0cmluZyhwYXR0ZXJuKS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgY2FzZSAndXJsJzpcbiAgICAgIHJldHVybiBWYWxpZGF0ZVVybDtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3Bob25lJzpcbiAgICAgIHJldHVybiBWYWxpZGF0ZVBob25lO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZW1haWwnOlxuICAgICAgcmV0dXJuIFZhbGlkYXRvcnMuZW1haWw7XG4gICAgICBicmVhaztcbiAgICBjYXNlICd6aXAnOlxuICAgICAgcmV0dXJuIFZhbGlkYXRlUGhvbmU7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdwYXNzd29yZCc6XG4gICAgICByZXR1cm4gVmFsaWRhdGVQYXNzd29yZDtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3VzZXJuYW1lJzpcbiAgICAgIHJldHVybiBWYWxpZGF0ZVVzZXJuYW1lO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIEZpZWxkSXRlbU9wdGlvblZhbHVlcyhtb2RlbDogRmllbGRJdGVtTW9kZWxJbnRlcmZhY2UsIGNvcmU6IENvcmVDb25maWcpOiBhbnlbXSB7XG4gIGlmIChJc1VuZGVmaW5lZChtb2RlbC5vcHRpb25zKSkge1xuICAgIG1vZGVsLm9wdGlvbnMgPSB7XG4gICAgICByYXdWYWx1ZXM6IFtdLFxuICAgICAgdmFsdWVzOiBbXVxuICAgIH07XG4gIH1cbiAgLy8gY29uc29sZS5sb2coJ21vZGVsJywgbW9kZWwub3B0aW9ucyk7XG4gIGlmICghSXNBcnJheShtb2RlbC5vcHRpb25zLnJhd1ZhbHVlcywgdHJ1ZSkpIHtcbiAgICBjb25zdCBvcHRpb25WYWx1ZXMgPSBJc0FycmF5KG1vZGVsLm9wdGlvbnMudmFsdWVzLCB0cnVlKSA/IG1vZGVsLm9wdGlvbnMudmFsdWVzIDogW107XG4gICAgbW9kZWwub3B0aW9ucy5yYXdWYWx1ZXMgPSBbLi4ubmV3IE1hcChvcHRpb25WYWx1ZXMubWFwKGl0ZW0gPT4gW2l0ZW1bJ25hbWUnXSwgaXRlbV0pKS52YWx1ZXMoKV07XG4gIH1cbiAgY29uc3QgbGlzdCA9IENvbnZlcnRBcnJheVRvT3B0aW9uTGlzdChtb2RlbC5vcHRpb25zLnJhd1ZhbHVlcywge1xuICAgIGNvbnZlcnRlZDogbW9kZWwub3B0aW9ucy5jb252ZXJ0ZWQgPyB0cnVlIDogZmFsc2UsIC8vIGlmIHRydWUsIHRoaXMgd2lsbCByZXR1cm4gZGVmYXVsdCB2YWx1ZXNcbiAgICAvLyBlbnN1cmUgdGhhdCBhbiBvcHRpb24gc2hvd3MgdXAgaW4gbGlzdCBpbiBjYXNlIG90aGVyIGNvbmRpdGlvbnMgcmVtb3ZlIGl0LCBha2EgaXQgaGFzIGJlZW4gYXJjaGl2ZWRcbiAgICBuYW1lS2V5OiBtb2RlbC5vcHRpb25zLm5hbWVLZXkgPyBtb2RlbC5vcHRpb25zLm5hbWVLZXkgOiAnbmFtZScsXG4gICAgZW5zdXJlOiBtb2RlbC5vcHRpb25zLmVuc3VyZSAmJiBJc09iamVjdChjb3JlLmVudGl0eSwgdHJ1ZSkgPyB7XG4gICAgICBuYW1lOiBjb3JlLmVudGl0eVttb2RlbC5vcHRpb25zLmVuc3VyZS5uYW1lXSxcbiAgICAgIHZhbHVlOiBjb3JlLmVudGl0eVttb2RlbC5uYW1lXVxuICAgIH0gOiB1bmRlZmluZWQsXG4gICAgcHJldmVudDogSXNBcnJheShtb2RlbC5vcHRpb25zLnByZXZlbnQsIHRydWUpID8gbW9kZWwub3B0aW9ucy5wcmV2ZW50IDogW10sIC8vIGEgbGlzdCBvZiBpZHMgdGhhdCBzaG91bGQgbm90IGFwcGVhciBpbiB0aGUgbGlzdCBmb3Igd2hhdGV2ZXIgcmVhc29uXG4gICAgcHJlc2VydmVLZXlzOiBJc0FycmF5KG1vZGVsLm9wdGlvbnMucHJlc2VydmVLZXlzLCB0cnVlKSA/IG1vZGVsLm9wdGlvbnMucHJlc2VydmVLZXlzIDogW10sIC8vIGEgbGlzdCBvZiBrZXlzIHRoYXQgbmVlZCB0byBiZSBwcmVzZXJ2ZWQgd2lsZSBjb25zdHJ1Y3RpbmcgdGhlIG9iamVjdFxuICAgIC8vIHBhcmVudCBtZWFucyB0aGlzIG9wdGlvbnMgc2hvdWxkIGFsbCBoYXZlIGEgY29tbW9uIGZpZWxkIHRyYWl0IGxpa2UgY2xpZW50X2ZrLCBhY2NvdW50X2ZrIC4uLi5cbiAgICBwYXJlbnQ6IG1vZGVsLm9wdGlvbnMucGFyZW50ICYmIElzT2JqZWN0KGNvcmUuZW50aXR5LCB0cnVlKSA/IHtcbiAgICAgIGZpZWxkOiBtb2RlbC5vcHRpb25zLnBhcmVudCxcbiAgICAgIHZhbHVlOiBjb3JlLmVudGl0eVttb2RlbC5vcHRpb25zLnBhcmVudF1cbiAgICB9IDogdW5kZWZpbmVkLFxuICAgIC8vIGVtcHR5IGlzIHRoZSBibGFuayBvciBudWxsIG9wdGlvbiB0aGF0IHlvdSB3YW50IHRvIGhhdmVcbiAgICBlbXB0eTogbnVsbCxcbiAgICBzb3J0OiBJc0RlZmluZWQobW9kZWwub3B0aW9ucy5zb3J0KSA/IG1vZGVsLm9wdGlvbnMuc29ydCA6IHRydWUsXG4gIH0pO1xuXG4gIHJldHVybiBsaXN0O1xufVxuXG5cbi8qKlxuICogR2VuZXJhdGVhIGZvcm0gY29uZmlnIGZyb20gdGhlIGZpZWxkIGl0ZW0gbW9kZWw7XG4gKiBAcGFyYW0gY29yZVxuICogQHBhcmFtIG1vZGVsXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEZpZWxkSXRlbU1vZGVsQ29uZmlnKGNvcmU6IENvcmVDb25maWcsIG1vZGVsOiBGaWVsZEl0ZW1Nb2RlbEludGVyZmFjZSkge1xuICBsZXQgdmFsdWU7XG4gIGxldCBhc3NpZ25lZDtcbiAgbGV0IGNvbmZpZ0ludGVyZmFjZTtcbiAgbGV0IHZhbGlkYXRvcnM7XG4vLyAgIGNvbnN0IGlzRGlhbG9nTGltaXQgPSB0aGlzLnNydi5kaWFsb2cub3BlbkRpYWxvZ3MubGVuZ3RoID4gMztcbiAgY29uc3QgaXNEaWFsb2dMaW1pdCA9IGZhbHNlO1xuXG4gIGxldCBjb25maWcgPSBudWxsO1xuXG4gIC8vIGNvbnN0IG1ldGFkYXRhID0geyAuLi5HZXRDb3JlUGFyYW1zQXNNZXRhZGF0YShjb3JlLnBhcmFtcyksIC4uLm1vZGVsLm1ldGFkYXRhIH07XG4gIHN3aXRjaCAobW9kZWwuZm9ybSkge1xuICAgIGNhc2UgJ3NpZGVieXNpZGUnOlxuICAgICAgYXNzaWduZWQgPSBBcnJheS5pc0FycmF5KG1vZGVsLm9wdGlvbnMuYXNzaWduZWQpICYmIG1vZGVsLm9wdGlvbnMuYXNzaWduZWQubGVuZ3RoID8gbW9kZWwub3B0aW9ucy5hc3NpZ25lZCA6IHR5cGVvZiBtb2RlbC5vcHRpb25zLmFzc2lnbmVkID09PSAnc3RyaW5nJyAmJiBJc09iamVjdChjb3JlLmVudGl0eS5hc3NpZ25tZW50cywgdHJ1ZSkgJiYgQXJyYXkuaXNBcnJheShjb3JlLmVudGl0eS5hc3NpZ25tZW50c1ttb2RlbC5vcHRpb25zLmFzc2lnbmVkXSkgPyBjb3JlLmVudGl0eS5hc3NpZ25tZW50c1ttb2RlbC5vcHRpb25zLmFzc2lnbmVkXSA6IFtdO1xuICAgICAgbW9kZWwub3B0aW9ucy52YWx1ZXMgPSBGaWVsZEl0ZW1PcHRpb25WYWx1ZXMobW9kZWwsIGNvcmUpO1xuICAgICAgbW9kZWwub3B0aW9ucy5jb252ZXJ0ZWQgPSB0cnVlO1xuICAgICAgY29uZmlnSW50ZXJmYWNlID0gPFNpZGVCeVNpZGVJbnRlcmZhY2U+e1xuICAgICAgICBhc3NpZ25lZDogYXNzaWduZWQsXG4gICAgICAgIGFzc2lnbkFsbDogdHlwZW9mIG1vZGVsLmFzc2lnbl9hbGwgPT09ICdib29sZWFuJyA/IG1vZGVsLmFzc2lnbl9hbGwgOiBmYWxzZSxcbiAgICAgICAgYXNzaWduZWRMYWJlbDogdHlwZW9mIG1vZGVsLmFzc2lnbmVkTGFiZWwgPT09ICdzdHJpbmcnID8gbW9kZWwuYXNzaWduZWRMYWJlbCA6ICdBc3NpZ25lZCcsXG4gICAgICAgIGJ1YmJsZTogbW9kZWwuYnViYmxlID8gdHJ1ZSA6IGZhbHNlLFxuICAgICAgICBkaXNhYmxlZDogbW9kZWwuZGlzYWJsZWQsXG4gICAgICAgIGRpc3BsYXlIZWxwZXI6IHR5cGVvZiBtb2RlbC5kaXNwbGF5SGVscGVyID09PSAnYm9vbGVhbicgPyBtb2RlbC5kaXNwbGF5SGVscGVyIDogZmFsc2UsXG4gICAgICAgIGRpc3BsYXlUaXRsZTogdHlwZW9mIG1vZGVsLmRpc3BsYXlUaXRsZSA9PT0gJ2Jvb2xlYW4nID8gbW9kZWwuZGlzcGxheVRpdGxlIDogZmFsc2UsXG4gICAgICAgIGZhY2FkZTogdHJ1ZSxcbiAgICAgICAgZmlsdGVyOiB0eXBlb2YgbW9kZWwuZmlsdGVyID09PSAnYm9vbGVhbicgPyBtb2RlbC5maWx0ZXIgOiB0cnVlLFxuICAgICAgICBoZWxwVGV4dDogdHlwZW9mIG1vZGVsLmhlbHBUZXh0ID09PSAnc3RyaW5nJyA/IG1vZGVsLmhlbHBUZXh0IDogdW5kZWZpbmVkLFxuICAgICAgICBpZDogbW9kZWwuaWQgPyBtb2RlbC5pZCA6IHVuZGVmaW5lZCxcbiAgICAgICAgbGFiZWw6IG1vZGVsLmxhYmVsID8gUGFyc2VGb3JBbGlhcyhtb2RlbC5sYWJlbCkgOiAnJyxcbiAgICAgICAgbWV0YWRhdGE6IG1vZGVsLm1ldGFkYXRhLFxuICAgICAgICBub0luaXRpYWxWYWx1ZTogbW9kZWwubm9Jbml0aWFsVmFsdWUgPyBtb2RlbC5ub0luaXRpYWxWYWx1ZSA6IGZhbHNlLFxuICAgICAgICBuYW1lOiBtb2RlbC5uYW1lID8gbW9kZWwubmFtZSA6IG51bGwsXG4gICAgICAgIG9wdGlvbnNMYWJlbDogdHlwZW9mIG1vZGVsLm9wdGlvbnNMYWJlbCA9PT0gJ3N0cmluZycgPyBtb2RlbC5vcHRpb25zTGFiZWwgOiAnQXZhaWxhYmxlJyxcbiAgICAgICAgb3B0aW9uczogbW9kZWwub3B0aW9ucyxcbiAgICAgICAgLy8gYnVja2V0SGVpZ2h0OiB0eXBlb2YgbW9kZWwuYnVja2V0SGVpZ2h0ID09PSAnc3RyaW5nJyA/IG1vZGVsLmJ1Y2tldEhlaWdodCA6IHVuZGVmaW5lZCxcbiAgICAgICAgcGFyZW50SGVpZ2h0OiAnbWF0LWdyaWQtdGlsZScsXG4gICAgICAgIHBhdGNoOiBtb2RlbC5wYXRjaCxcbiAgICAgICAgcm91dGU6IHR5cGVvZiBtb2RlbC5yb3V0ZSA9PT0gJ3N0cmluZycgPyBtb2RlbC5yb3V0ZSA6IHVuZGVmaW5lZCxcbiAgICAgICAgcmVtb3ZlQWxsOiB0eXBlb2YgbW9kZWwucmVtb3ZlQWxsID09PSAnYm9vbGVhbicgPyBtb2RlbC5yZW1vdmVBbGwgOiBmYWxzZSxcbiAgICAgICAgc2Vzc2lvbjogbW9kZWwuc2Vzc2lvbixcbiAgICAgICAgc2Vzc2lvblBhdGg6IG1vZGVsLnNlc3Npb25QYXRoLFxuICAgICAgICB2YWxpZGF0b3JzOiBtb2RlbC5yZXF1aXJlZCA/IFtWYWxpZGF0b3JzLnJlcXVpcmVkXSA6IHVuZGVmaW5lZCxcbiAgICAgIH07XG4gICAgICBjb25maWcgPSBuZXcgU2lkZUJ5U2lkZUNvbmZpZyg8U2lkZUJ5U2lkZUludGVyZmFjZT5DbGVhbk9iamVjdChjb25maWdJbnRlcmZhY2UpKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3NlbGVjdCc6XG4gICAgICBtb2RlbC5vcHRpb25zLnZhbHVlcyA9IEZpZWxkSXRlbU9wdGlvblZhbHVlcyhtb2RlbCwgY29yZSk7XG4gICAgICBtb2RlbC5vcHRpb25zLmNvbnZlcnRlZCA9IHRydWU7XG4gICAgICBjb25maWdJbnRlcmZhY2UgPSA8U2VsZWN0Q29uZmlnSW50ZXJmYWNlPntcbiAgICAgICAgYXV0b0ZpbGw6IG1vZGVsLmF1dG9GaWxsLFxuICAgICAgICBidWJibGU6IG1vZGVsLmJ1YmJsZSA/IHRydWUgOiBmYWxzZSxcbiAgICAgICAgZGlzYWJsZWQ6IG1vZGVsLmRpc2FibGVkLFxuICAgICAgICBlbXB0eTogbW9kZWwuZW1wdHkgPyBtb2RlbC5lbXB0eSA6IG51bGwsXG4gICAgICAgIGZhY2FkZTogbW9kZWwuZmFjYWRlID8gdHJ1ZSA6IGZhbHNlLFxuICAgICAgICBoZWlnaHQ6IG1vZGVsLmhlaWdodCA/IG1vZGVsLmhlaWdodCA6IHVuZGVmaW5lZCxcbiAgICAgICAgaGVscFRleHQ6IG1vZGVsLmhlbHBUZXh0ID8gbW9kZWwuaGVscFRleHQgOiB1bmRlZmluZWQsXG4gICAgICAgIGlkOiBtb2RlbC5pZCA/IG1vZGVsLmlkIDogdW5kZWZpbmVkLFxuICAgICAgICBsYWJlbDogbW9kZWwubGFiZWwgPyBQYXJzZUZvckFsaWFzKG1vZGVsLmxhYmVsKSA6ICcnLFxuICAgICAgICBtb2RlOiBtb2RlbC5tb2RlID8gbW9kZWwubW9kZSA6ICdzZWxlY3QnLFxuICAgICAgICBtZXRhZGF0YTogbW9kZWwubWV0YWRhdGEsXG4gICAgICAgIG5hbWU6IG1vZGVsLm5hbWUgPyBtb2RlbC5uYW1lIDogbnVsbCxcbiAgICAgICAgbm9Jbml0aWFsVmFsdWU6IG1vZGVsLm5vSW5pdGlhbFZhbHVlID8gbW9kZWwubm9Jbml0aWFsVmFsdWUgOiBmYWxzZSxcbiAgICAgICAgb3B0aW9uczogbW9kZWwub3B0aW9ucyxcbiAgICAgICAgcGF0Y2g6IG1vZGVsLnBhdGNoLFxuICAgICAgICByZWFkb25seTogbW9kZWwucmVhZG9ubHkgPyB0cnVlIDogZmFsc2UsXG4gICAgICAgIHNlc3Npb246IG1vZGVsLnNlc3Npb24sXG4gICAgICAgIHNlc3Npb25QYXRoOiBtb2RlbC5zZXNzaW9uUGF0aCxcbiAgICAgICAgcmVxdWlyZWQ6IG1vZGVsLnJlcXVpcmVkID8gdHJ1ZSA6IGZhbHNlLFxuICAgICAgICB2YWxpZGF0b3JzOiBtb2RlbC5yZXF1aXJlZCA/IFtWYWxpZGF0b3JzLnJlcXVpcmVkXSA6IHVuZGVmaW5lZCxcbiAgICAgICAgdmFsdWU6IHR5cGVvZiBtb2RlbC52YWx1ZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kZWwudmFsdWUgIT09IG51bGwgPyBQYXJzZU1vZGVsVmFsdWUobW9kZWwudmFsdWUsIGNvcmUpIDogSXNPYmplY3QoY29yZS5lbnRpdHksIHRydWUpICYmIHR5cGVvZiBjb3JlLmVudGl0eVsobW9kZWwubmFtZSA/IG1vZGVsLm5hbWUgOiBudWxsKV0gIT09ICd1bmRlZmluZWQnID8gY29yZS5lbnRpdHlbKG1vZGVsLm5hbWUgPyBtb2RlbC5uYW1lIDogbnVsbCldIDogbnVsbCxcbiAgICAgIH07XG4gICAgICBjb25maWcgPSBuZXcgU2VsZWN0Q29uZmlnKDxTZWxlY3RDb25maWdJbnRlcmZhY2U+Q2xlYW5PYmplY3QoY29uZmlnSW50ZXJmYWNlKSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdzZWxlY3QtbW9kYWwnOlxuICAgICAgbW9kZWwub3B0aW9ucy52YWx1ZXMgPSBGaWVsZEl0ZW1PcHRpb25WYWx1ZXMobW9kZWwsIGNvcmUpO1xuICAgICAgbW9kZWwub3B0aW9ucy5jb252ZXJ0ZWQgPSB0cnVlO1xuICAgICAgY29uc3QgY29uZmlnTGlzdEludGVyZmFjZSA9IDxTZWxlY3RMaXN0Q29uZmlnSW50ZXJmYWNlPntcbiAgICAgICAgYXV0b0ZpbGw6IG1vZGVsLmF1dG9GaWxsLFxuICAgICAgICBidWJibGU6IG1vZGVsLmJ1YmJsZSA/IHRydWUgOiBmYWxzZSxcbiAgICAgICAgZGlzYWJsZWQ6IG1vZGVsLmRpc2FibGVkLFxuICAgICAgICBlbXB0eTogbW9kZWwuZW1wdHkgPyBtb2RlbC5lbXB0eSA6IG51bGwsXG4gICAgICAgIGZhY2FkZTogbW9kZWwuZmFjYWRlID8gdHJ1ZSA6IGZhbHNlLFxuICAgICAgICBoZWlnaHQ6IG1vZGVsLmhlaWdodCA/IG1vZGVsLmhlaWdodCA6IHVuZGVmaW5lZCxcbiAgICAgICAgaGVscFRleHQ6IG1vZGVsLmhlbHBUZXh0ID8gbW9kZWwuaGVscFRleHQgOiB1bmRlZmluZWQsXG4gICAgICAgIGlkOiBtb2RlbC5pZCA/IG1vZGVsLmlkIDogdW5kZWZpbmVkLFxuICAgICAgICBsYWJlbDogbW9kZWwuc3ViTGFiZWwgPyBQYXJzZUZvckFsaWFzKG1vZGVsLnN1YkxhYmVsKSA6ICcnLFxuICAgICAgICBtb2RlOiBtb2RlbC5tb2RlID8gbW9kZWwubW9kZSA6ICdzZWxlY3QnLFxuICAgICAgICBtZXRhZGF0YTogbW9kZWwubWV0YWRhdGEsXG4gICAgICAgIG5hbWU6IG1vZGVsLm5hbWUgPyBtb2RlbC5uYW1lIDogbnVsbCxcbiAgICAgICAgbm9Jbml0aWFsVmFsdWU6IG1vZGVsLm5vSW5pdGlhbFZhbHVlID8gbW9kZWwubm9Jbml0aWFsVmFsdWUgOiBmYWxzZSxcbiAgICAgICAgb3B0aW9uczogbW9kZWwub3B0aW9ucyxcbiAgICAgICAgcGF0Y2g6IG1vZGVsLnBhdGNoLFxuICAgICAgICByZWFkb25seTogbW9kZWwucmVhZG9ubHkgPyB0cnVlIDogZmFsc2UsXG4gICAgICAgIHNlc3Npb246IG1vZGVsLnNlc3Npb24sXG4gICAgICAgIHNlc3Npb25QYXRoOiBtb2RlbC5zZXNzaW9uUGF0aCxcbiAgICAgICAgcmVxdWlyZWQ6IG1vZGVsLnJlcXVpcmVkLFxuICAgICAgICB2YWxpZGF0b3JzOiBtb2RlbC5yZXF1aXJlZCA/IFtWYWxpZGF0b3JzLnJlcXVpcmVkXSA6IHVuZGVmaW5lZCxcbiAgICAgICAgdmFsdWU6IHR5cGVvZiBtb2RlbC52YWx1ZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kZWwudmFsdWUgIT09IG51bGwgPyBQYXJzZU1vZGVsVmFsdWUobW9kZWwudmFsdWUsIGNvcmUpIDogSXNPYmplY3QoY29yZS5lbnRpdHksIHRydWUpICYmIHR5cGVvZiBjb3JlLmVudGl0eVsobW9kZWwubmFtZSA/IG1vZGVsLm5hbWUgOiBudWxsKV0gIT09ICd1bmRlZmluZWQnID8gY29yZS5lbnRpdHlbKG1vZGVsLm5hbWUgPyBtb2RlbC5uYW1lIDogbnVsbCldIDogbnVsbCxcbiAgICAgIH07XG4gICAgICBjb25maWcgPSBuZXcgU2VsZWN0TW9kYWxDb25maWcoPFNlbGVjdE1vZGFsQ29uZmlnSW50ZXJmYWNlPntcbiAgICAgICAgZmFjYWRlOiBmYWxzZSxcbiAgICAgICAgaGVhZGVyOiBtb2RlbC5oZWFkZXIgPyBtb2RlbC5oZWFkZXIgOiBudWxsLFxuICAgICAgICBsYWJlbDogbW9kZWwubGFiZWwgPyBtb2RlbC5sYWJlbCA6IG51bGwsXG4gICAgICAgIG1ldGFkYXRhOiB7fSxcbiAgICAgICAgbmFtZTogbW9kZWwubmFtZSxcbiAgICAgICAgcmVxdWlyZWQ6IG1vZGVsLnJlcXVpcmVkLFxuICAgICAgICB2YWxpZGF0b3JzOiBtb2RlbC5yZXF1aXJlZCA/IFtWYWxpZGF0b3JzLnJlcXVpcmVkXSA6IHVuZGVmaW5lZCxcbiAgICAgICAgbGlzdDogbmV3IFNlbGVjdExpc3RDb25maWcoPFNlbGVjdExpc3RDb25maWdJbnRlcmZhY2U+Q2xlYW5PYmplY3QoY29uZmlnTGlzdEludGVyZmFjZSkpXG4gICAgICB9KTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3NlbGVjdC1maWx0ZXInOlxuICAgICAgbW9kZWwub3B0aW9ucy52YWx1ZXMgPSBGaWVsZEl0ZW1PcHRpb25WYWx1ZXMobW9kZWwsIGNvcmUpO1xuICAgICAgbW9kZWwub3B0aW9ucy5jb252ZXJ0ZWQgPSB0cnVlO1xuICAgICAgY29uZmlnSW50ZXJmYWNlID0gPFNlbGVjdEZpbHRlckNvbmZpZ0ludGVyZmFjZT57XG4gICAgICAgIGF1dG9GaWxsOiBtb2RlbC5hdXRvRmlsbCxcbiAgICAgICAgYnViYmxlOiBtb2RlbC5idWJibGUgPyB0cnVlIDogZmFsc2UsXG4gICAgICAgIGRpc2FibGVkOiBtb2RlbC5kaXNhYmxlZCxcbiAgICAgICAgZmFjYWRlOiBtb2RlbC5mYWNhZGUgPyB0cnVlIDogZmFsc2UsXG4gICAgICAgIGhlbHBUZXh0OiBtb2RlbC5oZWxwVGV4dCA/IG1vZGVsLmhlbHBUZXh0IDogdW5kZWZpbmVkLFxuICAgICAgICBoZWlnaHQ6IG1vZGVsLmhlaWdodCA/IG1vZGVsLmhlaWdodCA6IHVuZGVmaW5lZCxcbiAgICAgICAgaWQ6IG1vZGVsLmlkID8gbW9kZWwuaWQgOiB1bmRlZmluZWQsXG4gICAgICAgIGxhYmVsOiBtb2RlbC5sYWJlbCA/IFBhcnNlRm9yQWxpYXMobW9kZWwubGFiZWwpIDogJycsXG4gICAgICAgIG1vZGU6IG1vZGVsLm1vZGUgPyBtb2RlbC5tb2RlIDogJ3NlbGVjdCcsXG4gICAgICAgIG1pbkhlaWdodDogbW9kZWwubWluSGVpZ2h0ID8gbW9kZWwubWluSGVpZ2h0IDogdW5kZWZpbmVkLFxuICAgICAgICBtdWx0aXBsZTogbW9kZWwubXVsdGlwbGUgPyB0cnVlIDogZmFsc2UsXG4gICAgICAgIG1ldGFkYXRhOiBtb2RlbC5tZXRhZGF0YSxcbiAgICAgICAgbmFtZTogbW9kZWwubmFtZSA/IG1vZGVsLm5hbWUgOiBudWxsLFxuICAgICAgICBub0luaXRpYWxWYWx1ZTogbW9kZWwubm9Jbml0aWFsVmFsdWUgPyBtb2RlbC5ub0luaXRpYWxWYWx1ZSA6IGZhbHNlLFxuICAgICAgICBvcHRpb25zOiBtb2RlbC5vcHRpb25zLFxuICAgICAgICBwYXRjaDogbW9kZWwucGF0Y2gsXG4gICAgICAgIHJlYWRvbmx5OiBtb2RlbC5yZWFkb25seSA/IHRydWUgOiBmYWxzZSxcbiAgICAgICAgc2Vzc2lvbjogbW9kZWwuc2Vzc2lvbixcbiAgICAgICAgc2Vzc2lvblBhdGg6IG1vZGVsLnNlc3Npb25QYXRoLFxuICAgICAgICB2YWxpZGF0b3JzOiBtb2RlbC5yZXF1aXJlZCA/IFtWYWxpZGF0b3JzLnJlcXVpcmVkXSA6IHVuZGVmaW5lZCxcbiAgICAgICAgdmFsdWU6IHR5cGVvZiBtb2RlbC52YWx1ZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kZWwudmFsdWUgIT09IG51bGwgPyBQYXJzZU1vZGVsVmFsdWUobW9kZWwudmFsdWUsIGNvcmUpIDogSXNPYmplY3QoY29yZS5lbnRpdHksIHRydWUpICYmIHR5cGVvZiBjb3JlLmVudGl0eVsobW9kZWwubmFtZSA/IG1vZGVsLm5hbWUgOiBudWxsKV0gIT09ICd1bmRlZmluZWQnID8gY29yZS5lbnRpdHlbKG1vZGVsLm5hbWUgPyBtb2RlbC5uYW1lIDogbnVsbCldIDogbnVsbCxcbiAgICAgIH07XG4gICAgICBjb25maWcgPSBuZXcgU2VsZWN0RmlsdGVyQ29uZmlnKDxTZWxlY3RGaWx0ZXJDb25maWdJbnRlcmZhY2U+Q2xlYW5PYmplY3QoY29uZmlnSW50ZXJmYWNlKSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdzZWxlY3QtbGlzdCc6XG4gICAgICBtb2RlbC5vcHRpb25zLnZhbHVlcyA9IEZpZWxkSXRlbU9wdGlvblZhbHVlcyhtb2RlbCwgY29yZSk7XG4gICAgICBtb2RlbC5vcHRpb25zLmNvbnZlcnRlZCA9IHRydWU7XG4gICAgICBjb25maWdJbnRlcmZhY2UgPSA8U2VsZWN0TGlzdENvbmZpZ0ludGVyZmFjZT57XG4gICAgICAgIGF1dG9GaWxsOiBtb2RlbC5hdXRvRmlsbCxcbiAgICAgICAgYWxsOiBtb2RlbC5hbGwsXG4gICAgICAgIGFsbG93QWxsOiBtb2RlbC5hbGxvd0FsbCxcbiAgICAgICAgYWxsb3dHcm91cEFsbDogbW9kZWwuYWxsb3dHcm91cEFsbCxcbiAgICAgICAgYWxsT3ZlcmxheTogbW9kZWwuYWxsT3ZlcmxheSxcbiAgICAgICAgYWxsT3ZlcmxheUVuYWJsZWQ6IG1vZGVsLmFsbE92ZXJsYXlFbmFibGVkLFxuICAgICAgICBhbGxPdmVybGF5TGFiZWw6IG1vZGVsLmFsbE92ZXJsYXlMYWJlbCxcbiAgICAgICAgYWxsT3ZlcmxheU1lc3NhZ2U6IG1vZGVsLmFsbE92ZXJsYXlNZXNzYWdlLFxuICAgICAgICBhbGxPdmVybGF5Q2FsbGJhY2s6IG1vZGVsLmFsbE92ZXJsYXlDYWxsYmFjayxcbiAgICAgICAgYnViYmxlOiBtb2RlbC5idWJibGUgPyB0cnVlIDogZmFsc2UsXG4gICAgICAgIGRpc2FibGVkOiBtb2RlbC5kaXNhYmxlZCxcbiAgICAgICAgZmFjYWRlOiBtb2RlbC5mYWNhZGUgPyB0cnVlIDogZmFsc2UsXG4gICAgICAgIGhlbHBUZXh0OiBtb2RlbC5oZWxwVGV4dCA/IG1vZGVsLmhlbHBUZXh0IDogdW5kZWZpbmVkLFxuICAgICAgICBoZWlnaHQ6IG1vZGVsLmhlaWdodCA/IG1vZGVsLmhlaWdodCA6IHVuZGVmaW5lZCxcbiAgICAgICAgaWQ6IG1vZGVsLmlkID8gbW9kZWwuaWQgOiB1bmRlZmluZWQsXG4gICAgICAgIGxhYmVsOiBtb2RlbC5sYWJlbCA/IFBhcnNlRm9yQWxpYXMobW9kZWwubGFiZWwpIDogJycsXG4gICAgICAgIG1vZGU6IG1vZGVsLm1vZGUgPyBtb2RlbC5tb2RlIDogbnVsbCxcbiAgICAgICAgbXVsdGlwbGU6IG1vZGVsLm11bHRpcGxlID8gdHJ1ZSA6IGZhbHNlLFxuICAgICAgICBtaW5IZWlnaHQ6IG1vZGVsLm1pbkhlaWdodCA/IG1vZGVsLm1pbkhlaWdodCA6IHVuZGVmaW5lZCxcbiAgICAgICAgbWV0YWRhdGE6IG1vZGVsLm1ldGFkYXRhLFxuICAgICAgICBuYW1lOiBtb2RlbC5uYW1lID8gbW9kZWwubmFtZSA6IG51bGwsXG4gICAgICAgIG5vSW5pdGlhbFZhbHVlOiBtb2RlbC5ub0luaXRpYWxWYWx1ZSA/IG1vZGVsLm5vSW5pdGlhbFZhbHVlIDogZmFsc2UsXG4gICAgICAgIG9wdGlvbnM6IG1vZGVsLm9wdGlvbnMsXG4gICAgICAgIHBhdGNoOiBtb2RlbC5wYXRjaCxcbiAgICAgICAgcmVxdWlyZWQ6IG1vZGVsLnJlcXVpcmVkLFxuICAgICAgICByZWFkb25seTogbW9kZWwucmVhZG9ubHkgPyB0cnVlIDogZmFsc2UsXG4gICAgICAgIHNlc3Npb246IG1vZGVsLnNlc3Npb24sXG4gICAgICAgIHNlc3Npb25QYXRoOiBtb2RlbC5zZXNzaW9uUGF0aCxcbiAgICAgICAgdmFsaWRhdG9yczogbW9kZWwucmVxdWlyZWQgPyBbVmFsaWRhdG9ycy5yZXF1aXJlZF0gOiB1bmRlZmluZWQsXG4gICAgICAgIHZhbHVlOiB0eXBlb2YgbW9kZWwudmFsdWUgIT09ICd1bmRlZmluZWQnICYmIG1vZGVsLnZhbHVlICE9PSBudWxsID8gUGFyc2VNb2RlbFZhbHVlKG1vZGVsLnZhbHVlLCBjb3JlKSA6IElzT2JqZWN0KGNvcmUuZW50aXR5LCB0cnVlKSAmJiB0eXBlb2YgY29yZS5lbnRpdHlbKG1vZGVsLm5hbWUgPyBtb2RlbC5uYW1lIDogbnVsbCldICE9PSAndW5kZWZpbmVkJyA/IGNvcmUuZW50aXR5Wyhtb2RlbC5uYW1lID8gbW9kZWwubmFtZSA6IG51bGwpXSA6IG51bGwsXG4gICAgICB9O1xuICAgICAgY29uZmlnID0gbmV3IFNlbGVjdExpc3RDb25maWcoPFNlbGVjdExpc3RDb25maWdJbnRlcmZhY2U+Q2xlYW5PYmplY3QoY29uZmlnSW50ZXJmYWNlKSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdzZWxlY3QtbXVsdGknOlxuICAgIGNhc2UgJ3NlbGVjdF9tdWx0aSc6XG4gICAgICBtb2RlbC5vcHRpb25zLnZhbHVlcyA9IEZpZWxkSXRlbU9wdGlvblZhbHVlcyhtb2RlbCwgY29yZSk7XG4gICAgICBtb2RlbC5vcHRpb25zLmNvbnZlcnRlZCA9IHRydWU7XG4gICAgICBjb25maWdJbnRlcmZhY2UgPSA8U2VsZWN0TXVsdGlDb25maWdJbnRlcmZhY2U+e1xuICAgICAgICBidWJibGU6IG1vZGVsLmJ1YmJsZSA/IHRydWUgOiBmYWxzZSxcbiAgICAgICAgZGlzYWJsZWQ6IG1vZGVsLmRpc2FibGVkLFxuICAgICAgICBmYWNhZGU6IG1vZGVsLmZhY2FkZSA/IHRydWUgOiBmYWxzZSxcbiAgICAgICAgaGVscFRleHQ6IG1vZGVsLmhlbHBUZXh0ID8gbW9kZWwuaGVscFRleHQgOiB1bmRlZmluZWQsXG4gICAgICAgIGlkOiBtb2RlbC5pZCA/IG1vZGVsLmlkIDogdW5kZWZpbmVkLFxuICAgICAgICBsYWJlbDogbW9kZWwubGFiZWwgPyBQYXJzZUZvckFsaWFzKG1vZGVsLmxhYmVsKSA6ICcnLFxuICAgICAgICBtZXRhZGF0YTogbW9kZWwubWV0YWRhdGEsXG4gICAgICAgIG5hbWU6IG1vZGVsLm5hbWUgPyBtb2RlbC5uYW1lIDogbnVsbCxcbiAgICAgICAgbm9Jbml0aWFsVmFsdWU6IG1vZGVsLm5vSW5pdGlhbFZhbHVlID8gbW9kZWwubm9Jbml0aWFsVmFsdWUgOiBmYWxzZSxcbiAgICAgICAgb3B0aW9uczogbW9kZWwub3B0aW9ucyxcbiAgICAgICAgcGF0Y2g6IG1vZGVsLnBhdGNoLFxuICAgICAgICByZWFkb25seTogbW9kZWwucmVhZG9ubHkgPyB0cnVlIDogZmFsc2UsXG4gICAgICAgIHNlc3Npb246IG1vZGVsLnNlc3Npb24sXG4gICAgICAgIHNlc3Npb25QYXRoOiBtb2RlbC5zZXNzaW9uUGF0aCxcbiAgICAgICAgdmFsaWRhdG9yczogbW9kZWwucmVxdWlyZWQgPyBbVmFsaWRhdG9ycy5yZXF1aXJlZF0gOiB1bmRlZmluZWQsXG4gICAgICAgIHZhbHVlOiBGaWVsZEl0ZW1BcnJheVZhbHVlKG1vZGVsLCBjb3JlKSxcbiAgICAgIH07XG4gICAgICBtb2RlbC5vcHRpb25zLmNvbnZlcnRlZCA9IHRydWU7XG4gICAgICBjb25maWcgPSBuZXcgU2VsZWN0TXVsdGlDb25maWcoPFNlbGVjdE11bHRpQ29uZmlnSW50ZXJmYWNlPkNsZWFuT2JqZWN0KGNvbmZpZ0ludGVyZmFjZSkpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAndGV4dGZpZWxkJzpcbiAgICBjYXNlICd0ZXh0JzpcbiAgICBjYXNlICdpbnB1dCc6XG4gICAgICB2YWxpZGF0b3JzID0gW107XG4gICAgICBpZiAoIW1vZGVsLm1hc2spIHZhbGlkYXRvcnMucHVzaChWYWxpZGF0b3JzLm1heExlbmd0aCgrbW9kZWwubWF4bGVuZ3RoIHx8IDY0KSk7XG4gICAgICBpZiAobW9kZWwubWFzaykgbW9kZWwubWF4bGVuZ3RoID0gbnVsbDtcbiAgICAgIGlmIChtb2RlbC5yZXF1aXJlZCkgdmFsaWRhdG9ycy5wdXNoKFZhbGlkYXRvcnMucmVxdWlyZWQpO1xuICAgICAgaWYgKG1vZGVsLnBhdHRlcm4pIHtcbiAgICAgICAgY29uc3QgcGF0dGVyblZhbGlkYXRvciA9IEdldFBhdHRlcm5WYWxpZGF0b3IobW9kZWwucGF0dGVybik7XG4gICAgICAgIGlmIChwYXR0ZXJuVmFsaWRhdG9yKSB7XG4gICAgICAgICAgdmFsaWRhdG9ycy5wdXNoKHBhdHRlcm5WYWxpZGF0b3IpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICgrbW9kZWwubWlubGVuZ3RoKSB2YWxpZGF0b3JzLnB1c2goVmFsaWRhdG9ycy5taW5MZW5ndGgoK21vZGVsLm1pbmxlbmd0aCkpO1xuICAgICAgY29uZmlnSW50ZXJmYWNlID0gPElucHV0Q29uZmlnSW50ZXJmYWNlPntcbiAgICAgICAgYXV0b2ZvY3VzOiBtb2RlbC5hdXRvZm9jdXMgPyB0cnVlIDogbnVsbCxcbiAgICAgICAgYXV0b3NlbGVjdDogbW9kZWwuYXV0b3NlbGVjdCA/IHRydWUgOiBudWxsLFxuICAgICAgICBidWJibGU6IG1vZGVsLmJ1YmJsZSA/IHRydWUgOiBmYWxzZSxcbiAgICAgICAgZGlzYWJsZWQ6IG1vZGVsLmRpc2FibGVkID8gdHJ1ZSA6IGZhbHNlLFxuICAgICAgICBlbXB0eTogbW9kZWwuZW1wdHkgPyBtb2RlbC5lbXB0eSA6IG51bGwsXG4gICAgICAgIGZhY2FkZTogbW9kZWwuZmFjYWRlID8gdHJ1ZSA6IG51bGwsXG4gICAgICAgIGhpbnQ6IG1vZGVsLmhpbnQgPyB0cnVlIDogbnVsbCxcbiAgICAgICAgaGludFRleHQ6IG1vZGVsLmhpbnRUZXh0ID8gbW9kZWwuaGludFRleHQgOiBudWxsLFxuICAgICAgICBoZWxwVGV4dDogbW9kZWwuaGVscFRleHQgPyBtb2RlbC5oZWxwVGV4dCA6IG51bGwsXG4gICAgICAgIGhpZGRlbjogbW9kZWwuaGlkZGVuID8gdHJ1ZSA6IGZhbHNlLFxuICAgICAgICBpZDogbW9kZWwuaWQgPyBtb2RlbC5pZCA6IHVuZGVmaW5lZCxcbiAgICAgICAgbGFiZWw6IFBhcnNlRm9yQWxpYXMobW9kZWwubGFiZWwpLFxuICAgICAgICBtZXRhZGF0YTogbW9kZWwubWV0YWRhdGEsXG4gICAgICAgIG1heGxlbmd0aDogbW9kZWwubWF4bGVuZ3RoIHx8IDY0LFxuICAgICAgICBtYXNrOiB0eXBlb2YgbW9kZWwubWFzayA9PT0gJ3N0cmluZycgJiYgbW9kZWwubWFzay5sZW5ndGggPyBtb2RlbC5tYXNrIDogbnVsbCxcbiAgICAgICAgbmFtZTogbW9kZWwubmFtZSA/IG1vZGVsLm5hbWUgOiBudWxsLFxuICAgICAgICBub0luaXRpYWxWYWx1ZTogbW9kZWwubm9Jbml0aWFsVmFsdWUgPyBtb2RlbC5ub0luaXRpYWxWYWx1ZSA6IGZhbHNlLFxuICAgICAgICBwYXRjaDogbW9kZWwucGF0Y2gsXG4gICAgICAgIHBhdHRlcm46IHR5cGVvZiBtb2RlbC5wYXR0ZXJuID09PSAnc3RyaW5nJyAmJiBtb2RlbC5wYXR0ZXJuLmxlbmd0aCA/IG1vZGVsLnBhdHRlcm4gOiBudWxsLFxuICAgICAgICBwcmVmaXg6IElzU3RyaW5nKG1vZGVsLnByZWZpeCwgdHJ1ZSkgPyBtb2RlbC5wcmVmaXggOiBudWxsLFxuICAgICAgICBwcmV2ZW50OiBJc0FycmF5KG1vZGVsLnByZXZlbnQsIHRydWUpID8gbW9kZWwucHJldmVudCA6IG51bGwsXG4gICAgICAgIHJlYWRvbmx5OiBtb2RlbC5yZWFkb25seSA/IHRydWUgOiBmYWxzZSxcbiAgICAgICAgc2Vzc2lvbjogbW9kZWwuc2Vzc2lvbixcbiAgICAgICAgc2Vzc2lvblBhdGg6IG1vZGVsLnNlc3Npb25QYXRoLFxuICAgICAgICBzdWZmaXg6IHR5cGVvZiBtb2RlbC5zdWZmaXggPT09ICdzdHJpbmcnICYmIG1vZGVsLnN1ZmZpeC5sZW5ndGggPyBtb2RlbC5zdWZmaXggOiBudWxsLFxuICAgICAgICB0cmFuc2Zvcm1hdGlvbjogSXNTdHJpbmcobW9kZWwudHJhbnNmb3JtYXRpb24sIHRydWUpID8gbW9kZWwudHJhbnNmb3JtYXRpb24gOiBudWxsLFxuICAgICAgICB2YWxpZGF0b3JzOiB2YWxpZGF0b3JzLFxuICAgICAgICB2YWx1ZTogRmllbGRJdGVtVGV4dFZhbHVlKG1vZGVsLCBjb3JlKSxcbiAgICAgIH07XG4gICAgICBjb25maWcgPSBuZXcgSW5wdXRDb25maWcoPElucHV0Q29uZmlnSW50ZXJmYWNlPkNsZWFuT2JqZWN0KGNvbmZpZ0ludGVyZmFjZSkpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgIHZhbGlkYXRvcnMgPSBbXTtcbiAgICAgIGlmIChtb2RlbC5taW4pIHZhbGlkYXRvcnMucHVzaChWYWxpZGF0b3JzLm1heChtb2RlbC5taW4pKTtcbiAgICAgIGlmIChtb2RlbC5tYXgpIHZhbGlkYXRvcnMucHVzaChWYWxpZGF0b3JzLm1heChtb2RlbC5tYXgpKTtcbiAgICAgIGlmIChtb2RlbC5yZXF1aXJlZCkgdmFsaWRhdG9ycy5wdXNoKFZhbGlkYXRvcnMucmVxdWlyZWQpO1xuICAgICAgY29uZmlnSW50ZXJmYWNlID0gPE51bWJlckNvbmZpZ0ludGVyZmFjZT57XG4gICAgICAgIGJ1YmJsZTogbW9kZWwuYnViYmxlID8gdHJ1ZSA6IGZhbHNlLFxuICAgICAgICBmYWNhZGU6IG1vZGVsLmZhY2FkZSA/IHRydWUgOiBmYWxzZSxcbiAgICAgICAgaGVscFRleHQ6IG1vZGVsLmhlbHBUZXh0ID8gbW9kZWwuaGVscFRleHQgOiBudWxsLFxuICAgICAgICBoaWRkZW46IG1vZGVsLmhpZGRlbiA/IHRydWUgOiBmYWxzZSxcbiAgICAgICAgaWQ6IG1vZGVsLmlkID8gbW9kZWwuaWQgOiB1bmRlZmluZWQsXG4gICAgICAgIGxhYmVsOiBQYXJzZUZvckFsaWFzKG1vZGVsLmxhYmVsKSxcbiAgICAgICAgbWV0YWRhdGE6IG1vZGVsLm1ldGFkYXRhLFxuICAgICAgICBtaW46IHR5cGVvZiBtb2RlbC5taW4gIT09ICd1bmRlZmluZWQnID8gbW9kZWwubWluIDogMSxcbiAgICAgICAgbm9Jbml0aWFsVmFsdWU6IG1vZGVsLm5vSW5pdGlhbFZhbHVlID8gbW9kZWwubm9Jbml0aWFsVmFsdWUgOiBmYWxzZSxcbiAgICAgICAgbmFtZTogbW9kZWwubmFtZSA/IG1vZGVsLm5hbWUgOiBudWxsLFxuICAgICAgICBwcmVmaXg6IElzU3RyaW5nKG1vZGVsLnByZWZpeCwgdHJ1ZSkgPyBtb2RlbC5wcmVmaXggOiAnJyxcbiAgICAgICAgcGF0Y2g6IG1vZGVsLnBhdGNoLFxuICAgICAgICByZWFkb25seTogbW9kZWwucmVhZG9ubHkgPyB0cnVlIDogZmFsc2UsXG4gICAgICAgIHNlc3Npb246IG1vZGVsLnNlc3Npb24sXG4gICAgICAgIHNlc3Npb25QYXRoOiBtb2RlbC5zZXNzaW9uUGF0aCxcbiAgICAgICAgc3VmZml4OiB0eXBlb2YgbW9kZWwuc3VmZml4ID09PSAnc3RyaW5nJyAmJiBtb2RlbC5zdWZmaXgubGVuZ3RoID8gbW9kZWwuc3VmZml4IDogJycsXG4gICAgICAgIHN0ZXA6IHR5cGVvZiBtb2RlbC5zdGVwID8gbW9kZWwuc3RlcCA6IDEsXG4gICAgICAgIHRyYW5zZm9ybWF0aW9uOiBJc1N0cmluZyhtb2RlbC50cmFuc2Zvcm1hdGlvbiwgdHJ1ZSkgPyBtb2RlbC50cmFuc2Zvcm1hdGlvbiA6IG51bGwsXG4gICAgICAgIHZhbGlkYXRvcnM6IHZhbGlkYXRvcnMsXG4gICAgICAgIHZhbHVlOiBGaWVsZEl0ZW1UZXh0VmFsdWUobW9kZWwsIGNvcmUpLFxuICAgICAgfTtcbiAgICAgIGNvbmZpZyA9IG5ldyBOdW1iZXJDb25maWcoPE51bWJlckNvbmZpZ0ludGVyZmFjZT5DbGVhbk9iamVjdChjb25maWdJbnRlcmZhY2UpKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2RhdGUnOlxuICAgICAgY29uZmlnSW50ZXJmYWNlID0gPERhdGVDb25maWdJbnRlcmZhY2U+e1xuICAgICAgICBidWJibGU6IG1vZGVsLmJ1YmJsZSA/IHRydWUgOiBmYWxzZSxcbiAgICAgICAgZGlzYWJsZWQ6IG1vZGVsLmRpc2FibGVkLFxuICAgICAgICBmYWNhZGU6IG1vZGVsLmZhY2FkZSA/IHRydWUgOiBmYWxzZSxcbiAgICAgICAgaGVscFRleHQ6IG1vZGVsLmhlbHBUZXh0ID8gbW9kZWwuaGVscFRleHQgOiBudWxsLFxuICAgICAgICBpZDogbW9kZWwuaWQgPyBtb2RlbC5pZCA6IHVuZGVmaW5lZCxcbiAgICAgICAgbGFiZWw6IFBhcnNlRm9yQWxpYXMobW9kZWwubGFiZWwpLFxuICAgICAgICBtaW46IElzU3RyaW5nKG1vZGVsLm1pbiwgdHJ1ZSkgPyBtb2RlbC5taW4gOiBudWxsLFxuICAgICAgICAvLyBtaW46IGlzTmFOKCBtb2RlbC5taW4gKSA9PT0gZmFsc2UgPyBtb2RlbC5taW4gOiBudWxsLFxuICAgICAgICBtYXg6IGlzTmFOKG1vZGVsLm1heCkgPT09IGZhbHNlID8gbW9kZWwubWF4IDogbnVsbCxcbiAgICAgICAgbWV0YWRhdGE6IG1vZGVsLm1ldGFkYXRhLFxuICAgICAgICBub0luaXRpYWxWYWx1ZTogbW9kZWwubm9Jbml0aWFsVmFsdWUgPyBtb2RlbC5ub0luaXRpYWxWYWx1ZSA6IGZhbHNlLFxuICAgICAgICBuYW1lOiBtb2RlbC5uYW1lID8gbW9kZWwubmFtZSA6IG51bGwsXG4gICAgICAgIHBhdGNoOiBtb2RlbC5wYXRjaCxcbiAgICAgICAgcmVxdWlyZWQ6IG1vZGVsLnJlcXVpcmVkLFxuXG4gICAgICAgIHJlYWRvbmx5OiBtb2RlbC5yZWFkb25seSA/IHRydWUgOiBmYWxzZSxcbiAgICAgICAgc2Vzc2lvbjogbW9kZWwuc2Vzc2lvbixcbiAgICAgICAgc2Vzc2lvblBhdGg6IG1vZGVsLnNlc3Npb25QYXRoLFxuICAgICAgICB0cmFuc2Zvcm1hdGlvbjogSXNTdHJpbmcobW9kZWwudHJhbnNmb3JtYXRpb24sIHRydWUpID8gbW9kZWwudHJhbnNmb3JtYXRpb24gOiBudWxsLFxuICAgICAgICB0eXBlOiBJc1N0cmluZyhtb2RlbC50eXBlLCB0cnVlKSA/IG1vZGVsLnR5cGUgOiBcIkJhc2ljXCIsXG4gICAgICAgIHZhbHVlOiBGaWVsZEl0ZW1UZXh0VmFsdWUobW9kZWwsIGNvcmUpLFxuICAgICAgICB2YWxpZGF0b3JzOiBtb2RlbC5yZXF1aXJlZCA/IFtWYWxpZGF0b3JzLnJlcXVpcmVkXSA6IHVuZGVmaW5lZCxcbiAgICAgIH07XG4gICAgICBjb25maWdJbnRlcmZhY2UgPSBDbGVhbk9iamVjdChjb25maWdJbnRlcmZhY2UpO1xuICAgICAgaWYgKElzRGVmaW5lZChtb2RlbC5maWx0ZXJQcmVkaWNhdGUpKSBjb25maWdJbnRlcmZhY2UuZmlsdGVyUHJlZGljYXRlID0gbW9kZWwuZmlsdGVyUHJlZGljYXRlO1xuICAgICAgY29uZmlnID0gbmV3IERhdGVDb25maWcoPERhdGVDb25maWdJbnRlcmZhY2U+Y29uZmlnSW50ZXJmYWNlKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2RhdGVwaWNrZXInOlxuICAgICAgY29uZmlnSW50ZXJmYWNlID0gPERhdGVQaWNrZXJDb25maWdJbnRlcmZhY2U+e1xuICAgICAgICBidWJibGU6IG1vZGVsLmJ1YmJsZSA/IHRydWUgOiBmYWxzZSxcbiAgICAgICAgZGlzYWJsZWQ6IG1vZGVsLmRpc2FibGVkLFxuICAgICAgICBmYWNhZGU6IG1vZGVsLmZhY2FkZSA/IHRydWUgOiBmYWxzZSxcbiAgICAgICAgaGVscFRleHQ6IG1vZGVsLmhlbHBUZXh0ID8gbW9kZWwuaGVscFRleHQgOiBudWxsLFxuICAgICAgICBpZDogbW9kZWwuaWQgPyBtb2RlbC5pZCA6IHVuZGVmaW5lZCxcbiAgICAgICAgbGFiZWw6IFBhcnNlRm9yQWxpYXMobW9kZWwubGFiZWwpLFxuICAgICAgICBtaW46IElzU3RyaW5nKG1vZGVsLm1pbiwgdHJ1ZSkgPyBtb2RlbC5taW4gOiBudWxsLFxuICAgICAgICAvLyBtaW46IGlzTmFOKCBtb2RlbC5taW4gKSA9PT0gZmFsc2UgPyBtb2RlbC5taW4gOiBudWxsLFxuICAgICAgICBtYXg6IGlzTmFOKG1vZGVsLm1heCkgPT09IGZhbHNlID8gbW9kZWwubWF4IDogbnVsbCxcbiAgICAgICAgbWV0YWRhdGE6IG1vZGVsLm1ldGFkYXRhLFxuICAgICAgICBub0luaXRpYWxWYWx1ZTogbW9kZWwubm9Jbml0aWFsVmFsdWUgPyBtb2RlbC5ub0luaXRpYWxWYWx1ZSA6IGZhbHNlLFxuICAgICAgICBuYW1lOiBtb2RlbC5uYW1lID8gbW9kZWwubmFtZSA6IG51bGwsXG4gICAgICAgIHBhdGNoOiBtb2RlbC5wYXRjaCxcbiAgICAgICAgcmVxdWlyZWQ6IG1vZGVsLnJlcXVpcmVkLFxuICAgICAgICB0cmFuc2Zvcm1hdGlvbjogSXNTdHJpbmcobW9kZWwudHJhbnNmb3JtYXRpb24sIHRydWUpID8gbW9kZWwudHJhbnNmb3JtYXRpb24gOiBudWxsLFxuICAgICAgICByZWFkb25seTogbW9kZWwucmVhZG9ubHkgPyB0cnVlIDogZmFsc2UsXG4gICAgICAgIHNlc3Npb246IG1vZGVsLnNlc3Npb24sXG4gICAgICAgIHNlc3Npb25QYXRoOiBtb2RlbC5zZXNzaW9uUGF0aCxcbiAgICAgICAgdmFsdWU6IEZpZWxkSXRlbVRleHRWYWx1ZShtb2RlbCwgY29yZSksXG4gICAgICAgIHZhbGlkYXRvcnM6IG1vZGVsLnJlcXVpcmVkID8gW1ZhbGlkYXRvcnMucmVxdWlyZWRdIDogdW5kZWZpbmVkLFxuICAgICAgfTtcbiAgICAgIGNvbmZpZ0ludGVyZmFjZSA9IENsZWFuT2JqZWN0KGNvbmZpZ0ludGVyZmFjZSk7XG4gICAgICBpZiAoSXNEZWZpbmVkKG1vZGVsLmZpbHRlclByZWRpY2F0ZSkpIGNvbmZpZ0ludGVyZmFjZS5maWx0ZXJQcmVkaWNhdGUgPSBtb2RlbC5maWx0ZXJQcmVkaWNhdGU7XG4gICAgICBjb25maWcgPSBuZXcgRGF0ZVBpY2tlckNvbmZpZyg8RGF0ZVBpY2tlckNvbmZpZ0ludGVyZmFjZT5jb25maWdJbnRlcmZhY2UpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAndGltZSc6XG4gICAgICBjb25maWdJbnRlcmZhY2UgPSA8VGltZUNvbmZpZ0ludGVyZmFjZT57XG4gICAgICAgIGJ1YmJsZTogbW9kZWwuYnViYmxlID8gdHJ1ZSA6IGZhbHNlLFxuICAgICAgICBkaXNhYmxlZDogbW9kZWwuZGlzYWJsZWQsXG4gICAgICAgIGZhY2FkZTogbW9kZWwuZmFjYWRlID8gdHJ1ZSA6IGZhbHNlLFxuICAgICAgICBoZWxwVGV4dDogbW9kZWwuaGVscFRleHQgPyBtb2RlbC5oZWxwVGV4dCA6IG51bGwsXG4gICAgICAgIGludGVydmFsOiBtb2RlbC5pbnRlcnZhbCA/IG1vZGVsLmludGVydmFsIDogMTUsXG4gICAgICAgIGlkOiBtb2RlbC5pZCA/IG1vZGVsLmlkIDogdW5kZWZpbmVkLFxuICAgICAgICBsYWJlbDogUGFyc2VGb3JBbGlhcyhtb2RlbC5sYWJlbCksXG4gICAgICAgIG1ldGFkYXRhOiBtb2RlbC5tZXRhZGF0YSxcbiAgICAgICAgbWluOiB0eXBlb2YgbW9kZWwubWluID09PSAnc3RyaW5nJyA/IG1vZGVsLm1pbiA6IG51bGwsXG4gICAgICAgIG1heDogdHlwZW9mIG1vZGVsLm1heCA9PT0gJ3N0cmluZycgPyBtb2RlbC5tYXggOiBudWxsLFxuICAgICAgICBuYW1lOiBtb2RlbC5uYW1lID8gbW9kZWwubmFtZSA6IG51bGwsXG4gICAgICAgIG5vSW5pdGlhbFZhbHVlOiBtb2RlbC5ub0luaXRpYWxWYWx1ZSA/IG1vZGVsLm5vSW5pdGlhbFZhbHVlIDogZmFsc2UsXG4gICAgICAgIHBhdGNoOiBtb2RlbC5wYXRjaCxcbiAgICAgICAgcmVhZG9ubHk6IG1vZGVsLnJlYWRvbmx5ID8gdHJ1ZSA6IGZhbHNlLFxuICAgICAgICBzZXNzaW9uOiBtb2RlbC5zZXNzaW9uLFxuICAgICAgICBzZXNzaW9uUGF0aDogbW9kZWwuc2Vzc2lvblBhdGgsXG4gICAgICAgIHRpbWU6IG1vZGVsLnRpbWUgPyBtb2RlbC50aW1lIDogMTIsXG4gICAgICAgIHRyYW5zZm9ybWF0aW9uOiBJc1N0cmluZyhtb2RlbC50cmFuc2Zvcm1hdGlvbiwgdHJ1ZSkgPyBtb2RlbC50cmFuc2Zvcm1hdGlvbiA6IG51bGwsXG4gICAgICAgIHZhbHVlOiBGaWVsZEl0ZW1UZXh0VmFsdWUobW9kZWwsIGNvcmUpLFxuICAgICAgICB2YWxpZGF0b3JzOiBtb2RlbC5yZXF1aXJlZCA/IFtWYWxpZGF0b3JzLnJlcXVpcmVkXSA6IHVuZGVmaW5lZCxcbiAgICAgIH07XG4gICAgICBjb25maWcgPSBuZXcgVGltZUNvbmZpZyg8VGltZUNvbmZpZ0ludGVyZmFjZT5DbGVhbk9iamVjdChjb25maWdJbnRlcmZhY2UpKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2NoZWNrYm94JzpcbiAgICAgIG1vZGVsLm9wdGlvbnMudmFsdWVzID0gRmllbGRJdGVtT3B0aW9uVmFsdWVzKG1vZGVsLCBjb3JlKTtcbiAgICAgIG1vZGVsLm9wdGlvbnMuY29udmVydGVkID0gdHJ1ZTtcbiAgICAgIGNvbmZpZ0ludGVyZmFjZSA9IDxDaGVja2JveENvbmZpZ0ludGVyZmFjZT57XG4gICAgICAgIGJ1YmJsZTogbW9kZWwuYnViYmxlID8gdHJ1ZSA6IGZhbHNlLFxuICAgICAgICBkaXNhYmxlZDogbW9kZWwuZGlzYWJsZWQsXG4gICAgICAgIGZhY2FkZTogbW9kZWwuZmFjYWRlID8gdHJ1ZSA6IGZhbHNlLFxuICAgICAgICBoZWxwVGV4dDogbW9kZWwuaGVscFRleHQgPyBtb2RlbC5oZWxwVGV4dCA6IHVuZGVmaW5lZCxcbiAgICAgICAgaWQ6IG1vZGVsLmlkID8gbW9kZWwuaWQgOiB1bmRlZmluZWQsXG4gICAgICAgIGxhYmVsOiBtb2RlbC5sYWJlbCA/IFBhcnNlRm9yQWxpYXMobW9kZWwubGFiZWwpIDogJycsXG4gICAgICAgIGxhYmVsUG9zaXRpb246IHR5cGVvZiBtb2RlbC5sYWJlbFBvc2l0aW9uICE9PSAndW5kZWZpbmVkJyA/IG1vZGVsLmxhYmVsUG9zaXRpb24gOiAnYWZ0ZXInLFxuICAgICAgICBtZXRhZGF0YTogbW9kZWwubWV0YWRhdGEsXG4gICAgICAgIG5hbWU6IG1vZGVsLm5hbWUgPyBtb2RlbC5uYW1lIDogbnVsbCxcbiAgICAgICAgbm9Jbml0aWFsVmFsdWU6IG1vZGVsLm5vSW5pdGlhbFZhbHVlID8gbW9kZWwubm9Jbml0aWFsVmFsdWUgOiBmYWxzZSxcbiAgICAgICAgb3B0aW9uczogbW9kZWwub3B0aW9ucyxcbiAgICAgICAgcGF0Y2g6IG1vZGVsLnBhdGNoLFxuICAgICAgICBzZXNzaW9uOiBtb2RlbC5zZXNzaW9uLFxuICAgICAgICBzZXNzaW9uUGF0aDogbW9kZWwuc2Vzc2lvblBhdGgsXG4gICAgICAgIHRleHRPdmVyZmxvdzogbW9kZWwudGV4dE92ZXJmbG93ID8gbW9kZWwudGV4dE92ZXJmbG93IDogJ3dyYXAnLFxuICAgICAgICB2YWx1ZTogRmllbGRJdGVtQm9vbGVhblZhbHVlKG1vZGVsLCBjb3JlKSxcbiAgICAgIH07XG4gICAgICBjb25maWcgPSBuZXcgQ2hlY2tib3hDb25maWcoPENoZWNrYm94Q29uZmlnSW50ZXJmYWNlPkNsZWFuT2JqZWN0KGNvbmZpZ0ludGVyZmFjZSkpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnc3dpdGNoJzpcbiAgICAgIGNvbmZpZ0ludGVyZmFjZSA9IDxTd2l0Y2hDb25maWdJbnRlcmZhY2U+e1xuICAgICAgICBidWJibGU6IG1vZGVsLmJ1YmJsZSA/IHRydWUgOiBmYWxzZSxcbiAgICAgICAgZGlzYWJsZWQ6IG1vZGVsLmRpc2FibGVkLFxuICAgICAgICBmYWNhZGU6IG1vZGVsLmZhY2FkZSA/IHRydWUgOiBmYWxzZSxcbiAgICAgICAgaGVscFRleHQ6IG1vZGVsLmhlbHBUZXh0ID8gbW9kZWwuaGVscFRleHQgOiB1bmRlZmluZWQsXG4gICAgICAgIGlkOiBtb2RlbC5pZCA/IG1vZGVsLmlkIDogdW5kZWZpbmVkLFxuICAgICAgICBsYWJlbDogbW9kZWwubGFiZWwgPyBQYXJzZUZvckFsaWFzKG1vZGVsLmxhYmVsKSA6ICcnLFxuICAgICAgICBsYWJlbFBvc2l0aW9uOiB0eXBlb2YgbW9kZWwubGFiZWxQb3NpdGlvbiAhPT0gJ3VuZGVmaW5lZCcgPyBtb2RlbC5sYWJlbFBvc2l0aW9uIDogJ2FmdGVyJyxcbiAgICAgICAgbWV0YWRhdGE6IG1vZGVsLm1ldGFkYXRhLFxuICAgICAgICBuYW1lOiBtb2RlbC5uYW1lID8gbW9kZWwubmFtZSA6IG51bGwsXG4gICAgICAgIG5vSW5pdGlhbFZhbHVlOiBtb2RlbC5ub0luaXRpYWxWYWx1ZSA/IG1vZGVsLm5vSW5pdGlhbFZhbHVlIDogZmFsc2UsXG4gICAgICAgIHBhdGNoOiBtb2RlbC5wYXRjaCxcbiAgICAgICAgc2Vzc2lvbjogbW9kZWwuc2Vzc2lvbixcbiAgICAgICAgc2Vzc2lvblBhdGg6IG1vZGVsLnNlc3Npb25QYXRoLFxuICAgICAgICB0ZXh0T3ZlcmZsb3c6IG1vZGVsLnRleHRPdmVyZmxvdyA/IG1vZGVsLnRleHRPdmVyZmxvdyA6ICd3cmFwJyxcbiAgICAgICAgdmFsdWU6IEZpZWxkSXRlbUJvb2xlYW5WYWx1ZShtb2RlbCwgY29yZSksXG4gICAgICB9O1xuICAgICAgY29uZmlnID0gbmV3IFN3aXRjaENvbmZpZyg8U3dpdGNoQ29uZmlnSW50ZXJmYWNlPkNsZWFuT2JqZWN0KGNvbmZpZ0ludGVyZmFjZSkpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbWlubWF4JzpcbiAgICAgIGNvbnN0IG1pbkNvbHVtbiA9IG1vZGVsLm1pbkNvbHVtbiA/IG1vZGVsLm1pbkNvbHVtbiA6ICdtaW4nO1xuICAgICAgY29uc3QgbWF4Q29sdW1uID0gbW9kZWwubWF4Q29sdW1uID8gbW9kZWwubWF4Q29sdW1uIDogJ21heCc7XG5cbiAgICAgIGNvbnN0IG1pblZhbHVlID0gdHlwZW9mIG1vZGVsLm1pblZhbHVlICE9PSAndW5kZWZpbmVkJyAmJiBtb2RlbC5taW5WYWx1ZSAhPT0gbnVsbCA/IFBhcnNlTW9kZWxWYWx1ZShtb2RlbC5taW5WYWx1ZSwgY29yZSkgOiBJc09iamVjdChjb3JlLmVudGl0eSwgdHJ1ZSkgJiYgdHlwZW9mIGNvcmUuZW50aXR5W21pbkNvbHVtbl0gIT09ICd1bmRlZmluZWQnID8gY29yZS5lbnRpdHlbbWluQ29sdW1uXSA6IDE7XG4gICAgICBjb25zdCBtYXhWYWx1ZSA9IHR5cGVvZiBtb2RlbC5tYXhWYWx1ZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kZWwubWF4VmFsdWUgIT09IG51bGwgPyBQYXJzZU1vZGVsVmFsdWUobW9kZWwubWF4VmFsdWUsIGNvcmUpIDogSXNPYmplY3QoY29yZS5lbnRpdHksIHRydWUpICYmIHR5cGVvZiBjb3JlLmVudGl0eVttYXhDb2x1bW5dICE9PSAndW5kZWZpbmVkJyA/IGNvcmUuZW50aXR5W21heENvbHVtbl0gOiAxMDtcblxuICAgICAgY29uZmlnSW50ZXJmYWNlID0gPE1pbk1heENvbmZpZ0ludGVyZmFjZT57XG4gICAgICAgIGJ1YmJsZTogbW9kZWwuYnViYmxlID8gdHJ1ZSA6IGZhbHNlLFxuICAgICAgICBkaXNhYmxlZDogbW9kZWwuZGlzYWJsZWQsXG4gICAgICAgIGZhY2FkZTogbW9kZWwuZmFjYWRlID8gdHJ1ZSA6IGZhbHNlLFxuICAgICAgICBoZWxwVGV4dDogbW9kZWwuaGVscFRleHQgPyBtb2RlbC5oZWxwVGV4dCA6IHVuZGVmaW5lZCxcbiAgICAgICAgaWQ6IG1vZGVsLmlkID8gbW9kZWwuaWQgOiB1bmRlZmluZWQsXG4gICAgICAgIGxhYmVsOiBtb2RlbC5sYWJlbCA/IFBhcnNlRm9yQWxpYXMobW9kZWwubGFiZWwpIDogJycsXG4gICAgICAgIG1pbkNvbHVtbjogbW9kZWwubWluQ29sdW1uID8gbW9kZWwubWluQ29sdW1uIDogJ21pbicsXG4gICAgICAgIG1heENvbHVtbjogbW9kZWwubWF4Q29sdW1uID8gbW9kZWwubWF4Q29sdW1uIDogJ21heCcsXG4gICAgICAgIG1pblZhbHVlOiBtaW5WYWx1ZSxcbiAgICAgICAgbWF4VmFsdWU6IG1heFZhbHVlLFxuICAgICAgICBtZXRhZGF0YTogbW9kZWwubWV0YWRhdGEsXG4gICAgICAgIG5hbWU6IG1vZGVsLm5hbWUgPyBtb2RlbC5uYW1lIDogbnVsbCxcbiAgICAgICAgbm9Jbml0aWFsVmFsdWU6IG1vZGVsLm5vSW5pdGlhbFZhbHVlID8gbW9kZWwubm9Jbml0aWFsVmFsdWUgOiBmYWxzZSxcbiAgICAgICAgcGF0Y2g6IG1vZGVsLnBhdGNoLFxuICAgICAgICByZWFkb25seTogbW9kZWwucmVhZG9ubHkgPyB0cnVlIDogZmFsc2UsXG4gICAgICAgIHNlc3Npb246IG1vZGVsLnNlc3Npb24sXG4gICAgICAgIHNlc3Npb25QYXRoOiBtb2RlbC5zZXNzaW9uUGF0aCxcbiAgICAgIH07XG4gICAgICBjb25maWcgPSBuZXcgTWluTWF4Q29uZmlnKDxNaW5NYXhDb25maWdJbnRlcmZhY2U+Q2xlYW5PYmplY3QoY29uZmlnSW50ZXJmYWNlKSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdyYWRpbyc6XG4gICAgICBtb2RlbC5vcHRpb25zLnZhbHVlcyA9IEZpZWxkSXRlbU9wdGlvblZhbHVlcyhtb2RlbCwgY29yZSk7XG4gICAgICBtb2RlbC5vcHRpb25zLmNvbnZlcnRlZCA9IHRydWU7XG4gICAgICBjb25maWdJbnRlcmZhY2UgPSA8UmFkaW9Db25maWdJbnRlcmZhY2U+e1xuICAgICAgICBidWJibGU6IG1vZGVsLmJ1YmJsZSA/IHRydWUgOiBmYWxzZSxcbiAgICAgICAgZGlzYWJsZWQ6IG1vZGVsLmRpc2FibGVkLFxuICAgICAgICBmYWNhZGU6IG1vZGVsLmZhY2FkZSA/IHRydWUgOiBmYWxzZSxcbiAgICAgICAgaGVscFRleHQ6IG1vZGVsLmhlbHBUZXh0ID8gbW9kZWwuaGVscFRleHQgOiAnJyxcbiAgICAgICAgaWQ6IG1vZGVsLmlkID8gbW9kZWwuaWQgOiB1bmRlZmluZWQsXG4gICAgICAgIGxhYmVsUG9zaXRpb246IHR5cGVvZiBtb2RlbC5sYWJlbFBvc2l0aW9uICE9PSAndW5kZWZpbmVkJyA/IG1vZGVsLmxhYmVsUG9zaXRpb24gOiAnYWJvdmUnLFxuICAgICAgICBsYWJlbDogbW9kZWwubGFiZWwgPyBQYXJzZUZvckFsaWFzKG1vZGVsLmxhYmVsKSA6ICcnLFxuICAgICAgICBsYXlvdXQ6IHR5cGVvZiBtb2RlbC5sYXlvdXQgIT09ICd1bmRlZmluZWQnID8gbW9kZWwubGF5b3V0IDogJ3JvdycsXG4gICAgICAgIG1ldGFkYXRhOiBtb2RlbC5tZXRhZGF0YSxcbiAgICAgICAgbmFtZTogbW9kZWwubmFtZSA/IG1vZGVsLm5hbWUgOiBudWxsLFxuICAgICAgICBub0luaXRpYWxWYWx1ZTogbW9kZWwubm9Jbml0aWFsVmFsdWUgPyBtb2RlbC5ub0luaXRpYWxWYWx1ZSA6IGZhbHNlLFxuICAgICAgICBvcHRpb25zOiBtb2RlbC5vcHRpb25zLFxuICAgICAgICBwYXRjaDogbW9kZWwucGF0Y2gsXG4gICAgICAgIHJlc2V0OiBtb2RlbC5yZXNldCA/IHRydWUgOiBmYWxzZSxcbiAgICAgICAgcmVhZG9ubHk6IG1vZGVsLnJlYWRvbmx5ID8gdHJ1ZSA6IGZhbHNlLFxuICAgICAgICBzZXNzaW9uOiBtb2RlbC5zZXNzaW9uLFxuICAgICAgICBzZXNzaW9uUGF0aDogbW9kZWwuc2Vzc2lvblBhdGgsXG4gICAgICAgIHNvcnQ6IHR5cGVvZiBtb2RlbC5sYWJlbFBvc2l0aW9uICE9PSAndW5kZWZpbmVkJyA/IG1vZGVsLnNvcnQgOiBmYWxzZSxcbiAgICAgICAgdmFsdWU6IEZpZWxkSXRlbVRleHRWYWx1ZShtb2RlbCwgY29yZSksXG4gICAgICB9O1xuICAgICAgbW9kZWwub3B0aW9ucy5jb252ZXJ0ZWQgPSB0cnVlO1xuICAgICAgY29uZmlnID0gbmV3IFJhZGlvQ29uZmlnKDxSYWRpb0NvbmZpZ0ludGVyZmFjZT5DbGVhbk9iamVjdChjb25maWdJbnRlcmZhY2UpKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3RleHRhcmVhJzpcbiAgICAgIGNvbmZpZ0ludGVyZmFjZSA9IDxUZXh0YXJlYUNvbmZpZ0ludGVyZmFjZT57XG4gICAgICAgIGF1dG9TaXplOiBtb2RlbC5hdXRvU2l6ZSA/IHRydWUgOiBmYWxzZSxcbiAgICAgICAgYnViYmxlOiBtb2RlbC5idWJibGUgPyB0cnVlIDogZmFsc2UsXG4gICAgICAgIGZhY2FkZTogbW9kZWwuZmFjYWRlID8gdHJ1ZSA6IGZhbHNlLFxuICAgICAgICBoZWlnaHQ6IG1vZGVsLmhlaWdodCB8fCA3MCxcbiAgICAgICAgaGVscFRleHQ6IG1vZGVsLmhlbHBUZXh0ID8gbW9kZWwuaGVscFRleHQgOiAnJyxcbiAgICAgICAgaWQ6IG1vZGVsLmlkID8gbW9kZWwuaWQgOiB1bmRlZmluZWQsXG4gICAgICAgIGxhYmVsOiBQYXJzZUZvckFsaWFzKG1vZGVsLmxhYmVsKSxcbiAgICAgICAgbWF4bGVuZ3RoOiBtb2RlbC5tYXhsZW5ndGggfHwgMjU1LFxuICAgICAgICBtZXRhZGF0YTogbW9kZWwubWV0YWRhdGEsXG4gICAgICAgIG1heEhlaWdodDogbW9kZWwubWF4SGVpZ2h0IHx8IG51bGwsXG4gICAgICAgIG5hbWU6IG1vZGVsLm5hbWUgPyBtb2RlbC5uYW1lIDogbnVsbCxcbiAgICAgICAgbm9Jbml0aWFsVmFsdWU6IG1vZGVsLm5vSW5pdGlhbFZhbHVlID8gbW9kZWwubm9Jbml0aWFsVmFsdWUgOiBmYWxzZSxcbiAgICAgICAgcGF0dGVybjogdHlwZW9mIG1vZGVsLnBhdHRlcm4gPT09ICdzdHJpbmcnICYmIG1vZGVsLnBhdHRlcm4ubGVuZ3RoID8gbW9kZWwucGF0dGVybiA6IG51bGwsXG4gICAgICAgIHBhdGNoOiBtb2RlbC5wYXRjaCxcbiAgICAgICAgcmVhZG9ubHk6IG1vZGVsLnJlYWRvbmx5LFxuICAgICAgICBzZXNzaW9uOiBtb2RlbC5zZXNzaW9uLFxuICAgICAgICBzZXNzaW9uUGF0aDogbW9kZWwuc2Vzc2lvblBhdGgsXG4gICAgICAgIHZhbGlkYXRvcnM6IG1vZGVsLnJlcXVpcmVkID8gW1ZhbGlkYXRvcnMucmVxdWlyZWQsIFZhbGlkYXRvcnMubWF4TGVuZ3RoKG1vZGVsLm1heGxlbmd0aCB8fCAyNTUpXSA6IFtWYWxpZGF0b3JzLm1heExlbmd0aChtb2RlbC5tYXhsZW5ndGggfHwgMjU1KV0sXG4gICAgICAgIHZhbHVlOiBGaWVsZEl0ZW1UZXh0VmFsdWUobW9kZWwsIGNvcmUpLFxuICAgICAgfTtcbiAgICAgIGNvbmZpZyA9IG5ldyBUZXh0YXJlYUNvbmZpZyg8VGV4dGFyZWFDb25maWdJbnRlcmZhY2U+Q2xlYW5PYmplY3QoY29uZmlnSW50ZXJmYWNlKSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdsYWJlbCc6XG4gICAgICB2YWx1ZSA9IHR5cGVvZiBtb2RlbC52YWx1ZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kZWwudmFsdWUgIT09IG51bGwgPyBQYXJzZU1vZGVsVmFsdWUobW9kZWwudmFsdWUsIGNvcmUpIDogSXNPYmplY3QoY29yZS5lbnRpdHksIHRydWUpICYmIElzT2JqZWN0KGNvcmUuZW50aXR5LCB0cnVlKSAmJiB0eXBlb2YgY29yZS5lbnRpdHlbKG1vZGVsLm5hbWUgPyBtb2RlbC5uYW1lIDogbnVsbCldICE9PSAndW5kZWZpbmVkJyA/IGNvcmUuZW50aXR5Wyhtb2RlbC5uYW1lID8gbW9kZWwubmFtZSA6IG51bGwpXSA6ICcnO1xuICAgICAgaWYgKG1vZGVsLnRyYW5zZm9ybWF0aW9uICYmIHR5cGVvZiAodmFsdWUpICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICB2YWx1ZSA9IFBvcFRyYW5zZm9ybSh2YWx1ZSwgbW9kZWwudHJhbnNmb3JtYXRpb24pO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIChtb2RlbC5jb3B5TGFiZWxEaXNwbGF5KSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgbW9kZWwuY29weUxhYmVsRGlzcGxheSA9IFBhcnNlTW9kZWxWYWx1ZShtb2RlbC5jb3B5TGFiZWxEaXNwbGF5LCBjb3JlKTtcbiAgICAgICAgaWYgKG1vZGVsLmNvcHlMYWJlbERpc3BsYXkgJiYgbW9kZWwuY29weUxhYmVsRGlzcGxheVRyYW5zZm9ybWF0aW9uKSB7XG4gICAgICAgICAgbW9kZWwuY29weUxhYmVsRGlzcGxheSA9IFBvcFRyYW5zZm9ybShtb2RlbC5jb3B5TGFiZWxEaXNwbGF5LCBtb2RlbC5jb3B5TGFiZWxEaXNwbGF5VHJhbnNmb3JtYXRpb24pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgKG1vZGVsLmNvcHlMYWJlbEJvZHkpICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBtb2RlbC5jb3B5TGFiZWxCb2R5ID0gUGFyc2VNb2RlbFZhbHVlKG1vZGVsLmNvcHlMYWJlbEJvZHksIGNvcmUpO1xuICAgICAgICBpZiAobW9kZWwuY29weUxhYmVsQm9keSAmJiBtb2RlbC5jb3B5TGFiZWxCb2R5VHJhbnNmb3JtYXRpb24pIHtcbiAgICAgICAgICBtb2RlbC5jb3B5TGFiZWxCb2R5ID0gUG9wVHJhbnNmb3JtKG1vZGVsLmNvcHlMYWJlbEJvZHksIG1vZGVsLmNvcHlMYWJlbEJvZHlUcmFuc2Zvcm1hdGlvbik7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiAobW9kZWwuY29weVZhbHVlRGlzcGxheSkgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIG1vZGVsLmNvcHlWYWx1ZURpc3BsYXkgPSBtb2RlbC5jb3B5VmFsdWVEaXNwbGF5ICE9PSBudWxsID8gUGFyc2VNb2RlbFZhbHVlKG1vZGVsLmNvcHlWYWx1ZURpc3BsYXksIGNvcmUpIDogJyc7XG4gICAgICAgIGlmIChtb2RlbC5jb3B5VmFsdWVEaXNwbGF5ICYmIG1vZGVsLmNvcHlWYWx1ZURpc3BsYXlUcmFuc2Zvcm1hdGlvbikge1xuICAgICAgICAgIG1vZGVsLmNvcHlWYWx1ZURpc3BsYXkgPSBQb3BUcmFuc2Zvcm0obW9kZWwuY29weVZhbHVlRGlzcGxheSwgbW9kZWwuY29weVZhbHVlRGlzcGxheVRyYW5zZm9ybWF0aW9uKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIChtb2RlbC5jb3B5VmFsdWVCb2R5KSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgbW9kZWwuY29weVZhbHVlQm9keSA9IG1vZGVsLmNvcHlWYWx1ZUJvZHkgIT09IG51bGwgPyBQYXJzZU1vZGVsVmFsdWUobW9kZWwuY29weVZhbHVlQm9keSwgY29yZSkgOiAnJztcbiAgICAgICAgaWYgKG1vZGVsLmNvcHlWYWx1ZUJvZHkgJiYgbW9kZWwuY29weVZhbHVlQm9keVRyYW5zZm9ybWF0aW9uKSB7XG4gICAgICAgICAgbW9kZWwuY29weVZhbHVlQm9keSA9IFBvcFRyYW5zZm9ybShtb2RlbC5jb3B5VmFsdWVCb2R5LCBtb2RlbC5jb3B5VmFsdWVCb2R5VHJhbnNmb3JtYXRpb24pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgKG1vZGVsLnZhbHVlQnV0dG9uRGlzcGxheSkgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIG1vZGVsLnZhbHVlQnV0dG9uRGlzcGxheSA9IFBhcnNlTW9kZWxWYWx1ZShtb2RlbC52YWx1ZUJ1dHRvbkRpc3BsYXksIGNvcmUpO1xuICAgICAgICBpZiAobW9kZWwudmFsdWVCdXR0b25EaXNwbGF5ICYmIG1vZGVsLnZhbHVlQnV0dG9uRGlzcGxheVRyYW5zZm9ybWF0aW9uKSB7XG4gICAgICAgICAgbW9kZWwudmFsdWVCdXR0b25EaXNwbGF5ID0gUG9wVHJhbnNmb3JtKG1vZGVsLnZhbHVlQnV0dG9uRGlzcGxheSwgbW9kZWwudmFsdWVCdXR0b25EaXNwbGF5VHJhbnNmb3JtYXRpb24pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbmZpZ0ludGVyZmFjZSA9IDxMYWJlbENvbmZpZ0ludGVyZmFjZT5DbGVhbk9iamVjdCh7XG4gICAgICAgIG5hbWU6IG1vZGVsLm5hbWUgPyBtb2RlbC5uYW1lIDogbnVsbCxcbiAgICAgICAgbGFiZWw6IFBhcnNlRm9yQWxpYXMobW9kZWwubGFiZWwpLFxuICAgICAgICBidXR0b246IG1vZGVsLmJ1dHRvbixcbiAgICAgICAgYm9yZGVyOiBtb2RlbC5ib3JkZXIsXG4gICAgICAgIGljb246IG1vZGVsLmljb24sXG4gICAgICAgIGljb25UeXBlOiBtb2RlbC5pY29uVHlwZSxcbiAgICAgICAgaHRtbDogbW9kZWwuaHRtbCxcbiAgICAgICAgdGV4dE92ZXJmbG93OiBtb2RlbC50ZXh0T3ZlcmZsb3cgPyBtb2RlbC50ZXh0T3ZlcmZsb3cgOiAnd3JhcCcsXG5cbiAgICAgICAgbGFiZWxCdXR0b246ICEhbW9kZWwubGFiZWxCdXR0b24sXG4gICAgICAgIGNvcHlMYWJlbDogISFtb2RlbC5jb3B5TGFiZWwsXG4gICAgICAgIGNvcHlMYWJlbEJvZHk6IG1vZGVsLmNvcHlMYWJlbEJvZHkgPyBtb2RlbC5jb3B5TGFiZWxCb2R5IDogbnVsbCxcbiAgICAgICAgY29weUxhYmVsQm9keVRyYW5zZm9ybWF0aW9uOiBtb2RlbC5jb3B5TGFiZWxCb2R5VHJhbnNmb3JtYXRpb24gPyBtb2RlbC5jb3B5TGFiZWxCb2R5VHJhbnNmb3JtYXRpb24gOiBudWxsLFxuICAgICAgICBjb3B5TGFiZWxEaXNwbGF5OiBtb2RlbC5jb3B5TGFiZWxEaXNwbGF5ID8gbW9kZWwuY29weUxhYmVsRGlzcGxheSA6IG51bGwsXG4gICAgICAgIGNvcHlMYWJlbERpc3BsYXlUcmFuc2Zvcm1hdGlvbjogbW9kZWwuY29weUxhYmVsRGlzcGxheVRyYW5zZm9ybWF0aW9uID8gbW9kZWwuY29weUxhYmVsRGlzcGxheVRyYW5zZm9ybWF0aW9uIDogbnVsbCxcblxuXG4gICAgICAgIGNvcHlWYWx1ZTogISFtb2RlbC5jb3B5VmFsdWUsXG4gICAgICAgIGNvcHlWYWx1ZUJvZHk6IG1vZGVsLmNvcHlWYWx1ZUJvZHkgPyBtb2RlbC5jb3B5VmFsdWVCb2R5IDogbnVsbCxcbiAgICAgICAgY29weVZhbHVlQm9keVRyYW5zZm9ybWF0aW9uOiBtb2RlbC5jb3B5VmFsdWVCb2R5VHJhbnNmb3JtYXRpb24gPyBtb2RlbC5jb3B5VmFsdWVCb2R5VHJhbnNmb3JtYXRpb24gOiBudWxsLFxuICAgICAgICBjb3B5VmFsdWVEaXNwbGF5OiBtb2RlbC5jb3B5VmFsdWVEaXNwbGF5ID8gbW9kZWwuY29weVZhbHVlRGlzcGxheSA6IG51bGwsXG4gICAgICAgIGNvcHlWYWx1ZURpc3BsYXlUcmFuc2Zvcm1hdGlvbjogbW9kZWwuY29weVZhbHVlRGlzcGxheVRyYW5zZm9ybWF0aW9uID8gbW9kZWwuY29weVZhbHVlRGlzcGxheVRyYW5zZm9ybWF0aW9uIDogbnVsbCxcblxuICAgICAgICB2YWx1ZUJ1dHRvbjogISFtb2RlbC52YWx1ZUJ1dHRvbixcbiAgICAgICAgdmFsdWVCdXR0b25EaXNhYmxlZDogISFtb2RlbC52YWx1ZUJ1dHRvbkRpc2FibGVkLFxuICAgICAgICB2YWx1ZUJ1dHRvbkRpc3BsYXk6IG1vZGVsLnZhbHVlQnV0dG9uRGlzcGxheSA/IG1vZGVsLnZhbHVlQnV0dG9uRGlzcGxheSA6IG51bGwsXG4gICAgICAgIHZhbHVlQnV0dG9uRGlzcGxheVRyYW5zZm9ybWF0aW9uOiBtb2RlbC52YWx1ZUJ1dHRvbkRpc3BsYXlUcmFuc2Zvcm1hdGlvbiA/IG1vZGVsLnZhbHVlQnV0dG9uRGlzcGxheVRyYW5zZm9ybWF0aW9uIDogbnVsbCxcblxuICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgIGxpbms6IG1vZGVsLmxpbmsgfHwgZmFsc2UsXG4gICAgICAgIGhlbHBUZXh0OiBtb2RlbC5oZWxwVGV4dCA/IG1vZGVsLmhlbHBUZXh0IDogdW5kZWZpbmVkLFxuICAgICAgICByb3V0ZTogbW9kZWwucm91dGUgJiYgIWlzRGlhbG9nTGltaXQgPyBQYXJzZU1vZGVsVmFsdWUobW9kZWwucm91dGUsIGNvcmUpIDogJycsXG4gICAgICAgIG1ldGFkYXRhOiBtb2RlbC5tZXRhZGF0YSxcbiAgICAgIH0pO1xuICAgICAgY29uZmlnID0gbmV3IExhYmVsQ29uZmlnKDxMYWJlbENvbmZpZ0ludGVyZmFjZT5DbGVhbk9iamVjdChjb25maWdJbnRlcmZhY2UpKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3RleHRzdHJpbmcnOlxuICAgICAgY29uZmlnSW50ZXJmYWNlID0gPFRleHRDb25maWdJbnRlcmZhY2U+e1xuICAgICAgICBib3JkZXI6IG1vZGVsLmJvcmRlcixcbiAgICAgICAgY2xhc3NOYW1lOiBtb2RlbC5jbGFzc05hbWUsXG4gICAgICAgIGhlYWRlcjogbW9kZWwuaGVhZGVyLFxuICAgICAgICBpZDogbW9kZWwuaWQgPyBtb2RlbC5pZCA6IHVuZGVmaW5lZCxcbiAgICAgICAgbmFtZTogbW9kZWwubmFtZSA/IG1vZGVsLm5hbWUgOiBudWxsLFxuICAgICAgICBzaXplOiBtb2RlbC5zaXplLFxuICAgICAgICB0ZXh0T3ZlcmZsb3c6IG1vZGVsLnRleHRPdmVyZmxvdyxcbiAgICAgICAgdmFsdWU6IG1vZGVsLnZhbHVlID8gbW9kZWwudmFsdWUgOiAnJyxcbiAgICAgICAgd2FybmluZzogbW9kZWwud2FybmluZ1xuICAgICAgfTtcbiAgICAgIGNvbmZpZyA9IG5ldyBUZXh0Q29uZmlnKDxUZXh0Q29uZmlnSW50ZXJmYWNlPkNsZWFuT2JqZWN0KGNvbmZpZ0ludGVyZmFjZSkpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnYnV0dG9uJzpcbiAgICAgIGNvbmZpZ0ludGVyZmFjZSA9IDxCdXR0b25Db25maWdJbnRlcmZhY2U+e1xuICAgICAgICBidWJibGU6IG1vZGVsLmJ1YmJsZSA/IHRydWUgOiBmYWxzZSxcbiAgICAgICAgZGlzYWJsZWQ6IG1vZGVsLmRpc2FibGVkLFxuICAgICAgICBmYWNhZGU6IG1vZGVsLmZhY2FkZSA/IHRydWUgOiBmYWxzZSxcbiAgICAgICAgaWNvbjogbW9kZWwuaWNvbiA/IG1vZGVsLmljb24gOiAnaGVscF9vdXRsaW5lJyxcbiAgICAgICAgaGVscFRleHQ6IG1vZGVsLmhlbHBUZXh0ID8gbW9kZWwuaGVscFRleHQgOiB1bmRlZmluZWQsXG4gICAgICAgIGlkOiBtb2RlbC5pZCA/IG1vZGVsLmlkIDogdW5kZWZpbmVkLFxuICAgICAgICBtZXRhZGF0YTogbW9kZWwubWV0YWRhdGEsXG4gICAgICAgIG5hbWU6IG1vZGVsLm5hbWUgPyBtb2RlbC5uYW1lIDogbnVsbCxcbiAgICAgICAgcGF0Y2g6IG1vZGVsLnBhdGNoLFxuICAgICAgICB2YWx1ZTogRmllbGRJdGVtVGV4dFZhbHVlKG1vZGVsLCBjb3JlKSxcbiAgICAgIH07XG4gICAgICBjb25maWcgPSBuZXcgQnV0dG9uQ29uZmlnKDxCdXR0b25Db25maWdJbnRlcmZhY2U+Q2xlYW5PYmplY3QoY29uZmlnSW50ZXJmYWNlKSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdtZXRhZGF0YSc6XG4gICAgICBjb25zdCB2YWwgPSBJc0RlZmluZWQobW9kZWwudmFsdWUpID8gbW9kZWwudmFsdWUgOiBJc09iamVjdChjb3JlLmVudGl0eSwgdHJ1ZSkgJiYgbW9kZWwubmFtZSBpbiBjb3JlLmVudGl0eSA/IGNvcmUuZW50aXR5W21vZGVsLm5hbWVdIDogbnVsbDtcbiAgICAgIGNvbmZpZyA9IG5ldyBNZXRhZGF0YUNvbmZpZyhtb2RlbC5uYW1lLCB2YWwpO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIFBvcExvZy53YXJuKGBGaWVsZEl0ZW1Nb2RlbENvbmZpZ2AsIGBidWlsZENvcmVGaWVsZEl0ZW1Db25maWdgLCBtb2RlbC5mb3JtKTtcbiAgICAgIGJyZWFrO1xuICB9XG5cbiAgcmV0dXJuIGNvbmZpZztcbn1cblxuXG4iXX0=