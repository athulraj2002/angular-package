import {
  CoreConfig,
  Dictionary,
  Entity,
  EntityParams,
  FieldItemModelInterface,
  PopBaseEventInterface,
  PopPipe,
  PopLog,
  ServiceRoutesInterface, PopApp, SetPopRouteAliasMap, PopRouteAliasMap, FieldItemInterface, FieldInterface
} from '../../pop-common.model';
import {
  ArrayKeyBy,
  CleanObject,
  ConvertArrayToOptionList,
  DeepCopy, DeepMerge, GetRouteAlias,
  InterpolateString,
  IsArray, IsDefined,
  IsNumber,
  IsObject,
  IsString, IsUndefined, JsonCopy, PopTransform, SpaceToHyphenLower,
  StorageGetter, StringReplaceAll,
  TitleCase,
  ToObject
} from '../../pop-common-utility';
import {TabButtonInterface, TabConfig, TabMenuConfig} from '../base/pop-tab-menu/tab-menu.model';
import {SideBySideConfig, SideBySideInterface} from '../base/pop-side-by-side/pop-side-by-side.model';
import {Validator, Validators} from '@angular/forms';
import {SelectConfig, SelectConfigInterface} from '../base/pop-field-item/pop-select/select-config.model';
import {
  SelectMultiConfig,
  SelectMultiConfigInterface
} from '../base/pop-field-item/pop-select-multi/select-mulit-config.model';
import {InputConfig, InputConfigInterface} from '../base/pop-field-item/pop-input/input-config.model';
import {NumberConfig, NumberConfigInterface} from '../base/pop-field-item/pop-number/number-config.model';
import {DateConfig, DateConfigInterface} from '../base/pop-field-item/pop-date/date-config.model';
import {TimeConfig, TimeConfigInterface} from '../base/pop-field-item/pop-time/time-config.model';
import {CheckboxConfig, CheckboxConfigInterface} from '../base/pop-field-item/pop-checkbox/checkbox-config.model';
import {SwitchConfig, SwitchConfigInterface} from '../base/pop-field-item/pop-switch/switch-config.model';
import {MinMaxConfig, MinMaxConfigInterface} from '../base/pop-field-item/pop-min-max/min-max.models';
import {RadioConfig, RadioConfigInterface} from '../base/pop-field-item/pop-radio/radio-config.model';
import {TextareaConfig, TextareaConfigInterface} from '../base/pop-field-item/pop-textarea/textarea-config.model';
import {LabelConfig, LabelConfigInterface, MetadataConfig} from '../base/pop-field-item/pop-label/label-config.model';
import {ButtonConfig, ButtonConfigInterface} from '../base/pop-field-item/pop-button/button-config.model';
import {Route, Routes} from '@angular/router';
import {EmailFieldSetting} from './pop-entity-field/pop-entity-email/email.setting';
import {AddressFieldSetting} from './pop-entity-field/pop-entity-address/address.setting';
import {PhoneFieldSetting} from './pop-entity-field/pop-entity-phone/phone.setting';
import {NameFieldSetting} from './pop-entity-field/pop-entity-name/name.setting';
import {InputFieldSetting} from './pop-entity-field/pop-entity-input/input.settings';
import {RadioFieldSetting} from './pop-entity-field/pop-entity-radio/radio.setting';
import {SwitchFieldSetting} from './pop-entity-field/pop-entity-switch/switch.setting';
import {SelectFieldSetting} from './pop-entity-field/pop-entity-select/select.setting';
import {CheckboxFieldSetting} from './pop-entity-field/pop-entity-checkbox/checkbox.setting';
import {TextareaFieldSetting} from './pop-entity-field/pop-entity-textarea/textarea.setting';
import {
  SelectFilterConfig,
  SelectFilterConfigInterface
} from '../base/pop-field-item/pop-select-filter/select-filter-config.model';
import {ValidatePassword, ValidatePhone, ValidateUrl, ValidateUsername} from '../../services/pop-validators';
import {TextConfig, TextConfigInterface} from '../base/pop-field-item/pop-text/text-config.model';
import {
  SelectListConfig,
  SelectListConfigInterface
} from '../base/pop-field-item/pop-select-list/select-list-config.model';
import {
  DatePickerConfig,
  DatePickerConfigInterface
} from '../base/pop-field-item/pop-datepicker/datepicker-config.model';
import {
  SelectModalConfig,
  SelectModalConfigInterface
} from "../base/pop-field-item/pop-select-modal/select-modal-config.model";
import {isArray} from "rxjs/internal-compatibility";


/**
 * A helper method that will build out TabMenuConfig off of an entityConfig
 * @param entityConfig
 * @param tabs
 */
export function GetTabMenuConfig(core: CoreConfig, tabs: TabConfig[] = []): TabMenuConfig {
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
export function GetTabMenuButtons(core: CoreConfig) {
  let buttons = [];
  const defaultButtons = <TabButtonInterface[]>[
    {id: 'clone', name: 'Clone', accessType: 'can_update', hidden: false},
    // { id: 'archive', name: 'Archive', accessType: 'can_update', hidden: true },
    // { id: 'activate', name: 'Activate', accessType: 'can_update', hidden: true },
    {id: 'delete', name: 'Delete', accessType: 'can_delete', hidden: true},
    {id: 'close', name: 'Close', hidden: false},
  ];
  if (IsObject(core.repo.model.table.button, true)) {
    buttons = defaultButtons.filter((button) => {

      if (button.id === 'clone' && !core.repo.model.menu.button.clone) return false;
      // if( button.id === 'archive' && !core.repo.model.menu.button.archive ) return false;
      // if( button.id === 'activate' && !core.repo.model.menu.button.archive ) return false;
      if (button.id === 'delete' && !core.repo.model.menu.button.delete) return false;
      if (!button.accessType) return true;
      if (!core.access[button.accessType]) return false;
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
export function GetObjectVar(obj: Dictionary<any>, path: string) {
  const steps = path.split('.');
  const key = steps.pop();
  const pathStorage = StorageGetter(obj, steps);
  if (pathStorage) {
    return typeof pathStorage[key] !== 'undefined' ? pathStorage[key] : undefined;
  } else {
    return undefined;
  }
}


/**
 * Get a list of the transformations that are within a field set
 * @param obj
 * @constructor
 */
export function GetObjectTransformations(obj: Object) {
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
    } else if (IsObject(field, ['id', 'name'])) {
      console.log('with relation', key, obj[key]);
    } else {
      console.log('fail', key);
    }
  });
  return transformations;
}

export function SetCoreValue(core: CoreConfig | TabMenuConfig, entity_path: string, value: any): void {
  const steps: string[] = entity_path.split('.');
  const key = steps.pop();
  const pathStorage = StorageGetter(core, steps);
  if (value === null) {
    delete pathStorage[key];
  } else {
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
export function ParseModelValue(value: any = '', core?: CoreConfig, blockEntity = false) {
  // console.log('ParseModelValue', value);
  let tmp = value;
  if (typeof tmp === 'undefined') {
    // console.log('zzz')
    return tmp;
  }
  if (tmp === 'null' || tmp === null) {
    // console.log( 'a', tmp );
    tmp = null;
  } else if (typeof tmp === 'boolean') {
    tmp = +tmp;
    // console.log( 'b', tmp );
  } else if (IsString(tmp, true)) {
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
    } else {
      if (IsString(tmp, true) && tmp.includes('alias:')) {
        tmp = ParseForAlias(tmp);
        // console.log( 'f', tmp );
      }
      if (core) {
        if (tmp.includes('.') && !(tmp.includes('@')) && !(tmp.includes(' '))) { // object location
          const coreVar = GetObjectVar(core, tmp);
          if (typeof coreVar !== 'undefined') tmp = coreVar;
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
  } else if (IsNumber(tmp)) {
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
export function ParseObjectDefinitions(obj: object, entityConfig: CoreConfig) {
  const definitions = {};
  let value;
  if (typeof obj !== 'undefined') {
    if (obj && Array.isArray(obj)) obj = ToObject(obj);
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
export function ParseUrlForEntityFields(url: string, entity: Entity) { // recursive
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
export function ParseLinkUrl(url: string, entity: Object = null, ignore: string[] = []) {
  if (url) {
    return url.split('/').map((part) => {
      if (part.includes('alias:')) {
        part = PopPipe.label.getAlias((part.split(':')[1]));
      } else if (part.includes(':') && entity) {
        if (!(ignore.includes(part))) {
          part = part.split(':')[1];
          if (part in entity) part = entity[part];
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
export function ParseUrlForParams(url: string, entityParams: EntityParams): string { // recursive
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
export function ParseForAlias(string: string) {
  if (IsString(string, true)) {
    let alias = false;
    const parts = [];
    string.split(':').map((part) => {
      if (part.includes('alias')) {
        alias = true;
      } else {
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
export function ParseStringForEntityField(str: string, entity: Entity) { // recursive
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
  } else if (typeof (str) === 'string' && str.includes(':') && str.includes(' ')) {
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
export function ParseStringForParams(str: string, entityParams: EntityParams, separator = '.'): string { // recursive
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
export function InterpolateEntityRoutes(routes: ServiceRoutesInterface, params: EntityParams) {
  if (IsObject(routes)) {
    const set = <ServiceRoutesInterface>{};
    Object.keys(routes).map((method) => {
      set[method] = {};
      Object.keys(routes[method]).map((route) => {
        if (!set[method][route]) set[method][route] = {};
        set[method][route].path = String(ParseUrlForParams(routes[method][route].path, params)).trim();
        set[method][route].params = routes[method][route].params;
      });
    });
    return set;
  } else {
    return routes;
  }
}

/**
 * Helper function to set routes for an entity
 * @param routes
 * @param params
 * @constructor
 */
export function InterpolateEntityRoute(route: string, obj: Object) {
  let path = InterpolateString(route, obj);
  path = StringReplaceAll(path, '\\/\\/', '\\/');
  return path;
}


/**
 * Remove all the empty values from an object
 * @param model
 * @constructor
 */
export function ClearEmptyValues(model: object) {
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
export function DetermineEntityName(entity: Entity) {
  let name = '';
  if (entity) {
    if (IsString(entity.label, true)) {
      name = entity.label;

    } else if (IsString(entity.name, true)) {
      name = entity.name;

    } else if (IsString(entity.display_name, true)) {
      name = entity.display_name;

    } else if (IsString(entity.first_name, true)) {  //code change by Chetu Development Team on 17-05-2021
      name = entity.first_name + ' ' + entity.last_name;

    } else if (IsString(entity.email, true)) {
      name = entity.email;

    } else if (typeof entity.id !== 'undefined') {
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
export function EvaluateWhenConditions(obj: Dictionary<any>, when: any[] = null, core?: CoreConfig) {
  if (!when || when === null) return true;
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
        if (pass) break;
      }
    } else {
      // console.log('check', obj, when, core);
      pass = EvaluateWhenCondition(obj, when, core);
    }
  } else {
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
export function EvaluateWhenCondition(obj: Dictionary<any>, block: any[], core?: CoreConfig): boolean {
  const operators = ['=', '>', '>=', '<', 'truthy', 'falsey', 'length', 'contains'];
  let pass = true;
  let location;
  let operator;
  let value;
  if (IsArray(block, true)) {
    // expects array of arrays
    block.some((section: any) => {

      section.some((rule) => {
        // console.log('rule', rule);
        // console.log('has core', core);
        if (IsArray(rule, true)) {
          location = rule[0];
          if (rule.length === 1) {
            operator = 'truthy';
            value = undefined;
          } else if (rule.length === 2) {
            operator = '=';
            value = rule[1];
            if (['truthy', 'falsey', 'length'].includes(value)) {
              operator = value;
              value = undefined;
            }
          } else if (rule.length >= 2) {
            operator = rule[1];
            value = rule[2];
          }
          if (location && operator && operators.includes(operator)) {
            if (IsString(location, true) && location in obj && obj[location]) {
              location = obj[location];
            } else if (IsString(location, true) && location.includes('.')) {
              location = GetObjectVar(obj, location);
            } else {
              location = ParseModelValue(location, core);
            }
            if (IsString(value, true) && IsObject(core, [value])) {
              value = ParseModelValue(value, core);
            } else if (IsString(value, true) && IsObject(obj, [value])) {
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
                } else if (IsString(location)) {
                  if (!(location.search(value) > -1)) {
                    pass = false;
                    return true;
                  }
                } else if (IsObject(location)) {
                  if (!(value in location)) {
                    pass = false;
                    return true;
                  }
                } else {
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
          } else {
            pass = false;
            return true;
          }
        } else {
          pass = false;
          return true;
        }
      });
      return pass === false;
    });
  } else {
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
export function IsValidFieldPatchEvent(core: CoreConfig, event: PopBaseEventInterface) {
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
export function IsValidChangeEvent(core: CoreConfig, event: PopBaseEventInterface) {
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
export function IsValidCoreSignature(core: CoreConfig, event: PopBaseEventInterface = null) {
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

export function GetCustomFieldSettings(field: FieldInterface) {
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
export function ModelOptionValues(core: CoreConfig, options: any) {
  if (IsObject(options, true)) {
    if (IsString(options.resource, true)) {
      if (IsObject(core.resource, true) && options.resource in core.resource && IsObject(core.resource[options.resource], ['data_values']) && IsArray(core.resource[options.resource].data_values, true)) {
        options.converted = false;
        options.rawValues = DeepCopy(core.resource[options.resource].data_values);
        // options.values = DeepCopy( core.resource[ options.resource ].data_values );
      }
    } else if (IsArray(options.values, true)) {
      options.converted = false;
      const tmp = DeepCopy(options.values);
      options.values = null;
      options.rawValues = tmp;
    } else if (IsString(options.values)) {
      const tmpOptions = GetObjectVar(core, options.values);
      if (IsArray(tmpOptions)) {
        options.converted = false;
        options.rawValues = DeepCopy(tmpOptions);
      } else {
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
export function FieldItemRules(fieldItem: any): void {
  const RuleSet = {};
  fieldItem.rule = {};
  const itemRules = IsArray(fieldItem.itemrules, true) ? fieldItem.itemrules : []; // default rules inherited from the field_item_id
  const fieldRules = IsArray(fieldItem.fieldrules, true) ? fieldItem.fieldrules : []; // rules specific to this field item
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
    }
  });

// delete fieldItem.fieldrules;
// delete fieldItem.itemrules;
}


export function FieldItemModel(core: CoreConfig, fieldItem: any, checkAccess = true): FieldItemModelInterface {
  if (IsObject(fieldItem, true)) {
    let hasAccess = true;
    if (checkAccess) {
      hasAccess = core.access.can_update ? true : false;
      if (IsObject(core.entity, ['system']) && core.entity.system) hasAccess = false;
    }
    const showAsReadonly = +fieldItem.readonly ? true : (!hasAccess ? true : false);
    const allowPatch = IsObject(core.entity, ['id']) && IsObject(fieldItem.patch, ['path']) && !fieldItem.facade && hasAccess && !showAsReadonly ? true : false;
    if (!fieldItem.metadata) {
      fieldItem.metadata = {};
    }


    fieldItem.metadata = DeepMerge(fieldItem.metadata, {internal_name: core.params.internal_name});
    // ToDo:: Optimize this part, currently uses catch-all method to accommodate all field item types, need to run checks on some and not others which prevents simply merging
    let model = <FieldItemModelInterface>{
      ...CleanObject({ // any empty values will be purged
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
      })
    };

    if (model.form === 'label') { // label specific params
      model = {
        ...model,
        ...CleanObject({// label stuff
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
        })
      };
    }

    delete fieldItem.patch;
    if (model.patch) {
      if (model.patch.path) model.patch.path = StringReplaceAll(ParseUrlForParams(model.patch.path, core.params), '//', '/');
      if (model.patch.metadata) model.patch.metadata = ParseObjectDefinitions(model.patch.metadata, core);
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
export function SessionEntityFieldUpdate(core: CoreConfig, event: PopBaseEventInterface, path: string = null) {
  PopLog.event(`SessionEntityFieldUpdate`, `Session Detected`, event);
  if (IsValidCoreSignature(core, event)) {
    if (IsValidFieldPatchEvent(core, event)) {

      let value;
      if (!(IsString(path, true))) path = 'entity';
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

export function GetSingularName(value: string): string {
  if (IsString(value, true) && String(value).length > 3) {
    let tmp = SpaceToHyphenLower(String(value).toLowerCase().trim());
    if (String(tmp).slice(-3) === 'ies') {
      tmp = String(tmp).slice(0, -3);
      tmp += 'y';
    } else if (String(tmp).slice(-1) === 's') {
      tmp = String(tmp).slice(0, -1);
    }

    return tmp;
  }
  return value;
}


export function IsAliasable(value: string): boolean {
  if (IsString(value, true) && String(value).length > 3) {
    const tmp = SpaceToHyphenLower(String(value).toLowerCase().trim());
    if (IsObject(PopRouteAliasMap, true) && tmp in PopRouteAliasMap) {
      return true;
    }
  }
  return false;
}


export function IsEntity(entityValue: string) {
  if (IsString(entityValue, true)) {
    if (IsObject(PopApp, ['entities']) && entityValue in PopApp.entities) {
      return true;
    }
  }
  return false;
}

export function ParseModuleRoutes(parent: string, config: Route[], routes = []) {
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

export function ParseModuleRoutesForAliases(routes: Routes): Routes {
  if (IsArray(routes, true)) {
    routes.map((route: any) => {
      if (IsObject(route.data, ['alias', 'internal_name'])) {
        const alias = route.data.alias;
        if (IsObject(alias, ['target', 'type']) && !route.data.masterPath) {
          route.data.masterPath = route.path;
          if (IsString(alias.target, true) && IsString(alias.type, true)) {
            route.path = String(StringReplaceAll(route.path, alias.target, GetRouteAlias((IsString(alias.internal_name, true) ? alias.internal_name : route.data.internal_name), alias.type))).trim();
            if (route.data.masterPath !== route.path) routes.push({
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

        } else if (IsString(route.data.alias, true) && !route.data.masterPath) {
          route.data.masterPath = route.path;
          route.path = String(StringReplaceAll(route.path, route.data.alias, GetRouteAlias(route.data.internal_name, 'plural'))).trim();
          if (route.data.masterPath !== route.path) routes.push({
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


export function FieldItemView(view: any): { id: number, name: string, type: string, description: string } {
  const tmp = IsObject(view) ? view : null;
  return <{ id: number, name: string, type: string, description: string }>CleanObject({
    id: tmp ? tmp.id : 0,
    name: tmp ? tmp.name : 'label',
    type: tmp && String(tmp.html).includes('[') ? String(tmp.html).split('[')[1].split(']')[0] : 'text',
    description: tmp ? tmp.description : null
  });
}


export function FieldItemBooleanValue(model: FieldItemModelInterface, core: CoreConfig): boolean {
  PopLog.debug('FieldItemBooleanValue', `convert:`, {name: name, model: model, core: core});
  let result;
  if (IsDefined(model.value, false)) {
    if (typeof model.value === 'boolean') {
      result = model.value;
    } else if (IsString(model.value, true)) {
      result = ParseModelValue(model.value, core);
    } else if (IsNumber(model.value, false)) {
      result = +core.entity[model.name] > 0;
    }
  }
  if (!(IsDefined(result, false)) && model.name && IsObject(core.entity, true) && IsDefined(core.entity[model.name])) {
    result = +core.entity[model.name] > 0;
  }

  if (!(IsDefined(result, false))) result = false;
  PopLog.debug('FieldItemBooleanValue', `result:`, {initial: model.value, result: result});
  return result;
}

export function FieldItemTextValue(model: FieldItemModelInterface, core: CoreConfig): string {
  let result;
  if (+model.value > 0) {
    result = model.value;
  } else if (IsDefined(model.value, false) && IsString(model.value, true)) {
    result = ParseModelValue(model.value, core);
    // console.log( 'belongs to parse', model.value, result );
  }
  if (!(IsDefined(result, false)) && model.name && IsObject(core.entity, true) && IsDefined(core.entity[model.name]) && IsString(core.entity[model.name], true)) {
    result = core.entity[model.name];
    // console.log( 'belongs to entity', model.value, result );
  }
  if (!(IsDefined(result, false)) || result === 'Null') result = '';
  return result;
}

export function FieldItemArrayValue(model: FieldItemModelInterface, core: CoreConfig): any[] {
  let result;
  if (IsDefined(model.value, false)) {
    if (IsArray(model.value, false)) {
      result = model.value;
    } else if (IsString(model.value, true)) {
      result = ParseModelValue(model.value, core);
    }
  }
  if (!(IsArray(result, false)) && model.name && IsObject(core.entity, true) && IsArray(core.entity[model.name], false)) {
    result = core.entity[model.name];
  }
  if (!(IsArray(result, false))) result = [];

  return result;
}


export function GetPatternValidator(pattern: string) {
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


export function FieldItemOptionValues(model: FieldItemModelInterface, core: CoreConfig): any[] {
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
    converted: model.options.converted ? true : false, // if true, this will return default values
    // ensure that an option shows up in list in case other conditions remove it, aka it has been archived
    nameKey: model.options.nameKey ? model.options.nameKey : 'name',
    ensure: model.options.ensure && IsObject(core.entity, true) ? {
      name: core.entity[model.options.ensure.name],
      value: core.entity[model.name]
    } : undefined,
    prevent: IsArray(model.options.prevent, true) ? model.options.prevent : [], // a list of ids that should not appear in the list for whatever reason
    preserveKeys: IsArray(model.options.preserveKeys, true) ? model.options.preserveKeys : [], // a list of keys that need to be preserved wile constructing the object
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
export function FieldItemModelConfig(core: CoreConfig, model: FieldItemModelInterface) {
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
      configInterface = <SideBySideInterface>{
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
      config = new SideBySideConfig(<SideBySideInterface>CleanObject(configInterface));
      break;
    case 'select':
      model.options.values = FieldItemOptionValues(model, core);
      model.options.converted = true;
      configInterface = <SelectConfigInterface>{
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
      config = new SelectConfig(<SelectConfigInterface>CleanObject(configInterface));
      break;
    case 'select-modal':
      model.options.values = FieldItemOptionValues(model, core);
      model.options.converted = true;
      const configListInterface = <SelectListConfigInterface>{
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
      config = new SelectModalConfig(<SelectModalConfigInterface>{
        facade: false,
        header: model.header ? model.header : null,
        label: model.label ? model.label : null,
        metadata: {},
        name: model.name,
        required: model.required,
        validators: model.required ? [Validators.required] : undefined,
        list: new SelectListConfig(<SelectListConfigInterface>CleanObject(configListInterface))
      });
      break;
    case 'select-filter':
      model.options.values = FieldItemOptionValues(model, core);
      model.options.converted = true;
      configInterface = <SelectFilterConfigInterface>{
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
      config = new SelectFilterConfig(<SelectFilterConfigInterface>CleanObject(configInterface));
      break;
    case 'select-list':
      model.options.values = FieldItemOptionValues(model, core);
      model.options.converted = true;
      configInterface = <SelectListConfigInterface>{
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
      config = new SelectListConfig(<SelectListConfigInterface>CleanObject(configInterface));
      break;
    case 'select-multi':
    case 'select_multi':
      model.options.values = FieldItemOptionValues(model, core);
      model.options.converted = true;
      configInterface = <SelectMultiConfigInterface>{
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
      config = new SelectMultiConfig(<SelectMultiConfigInterface>CleanObject(configInterface));
      break;
    case 'textfield':
    case 'text':
    case 'input':
      validators = [];
      if (!model.mask) validators.push(Validators.maxLength(+model.maxlength || 64));
      if (model.mask) model.maxlength = null;
      if (model.required) validators.push(Validators.required);
      if (model.pattern) {
        const patternValidator = GetPatternValidator(model.pattern);
        if (patternValidator) {
          validators.push(patternValidator);
        }
      }

      if (+model.minlength) validators.push(Validators.minLength(+model.minlength));
      configInterface = <InputConfigInterface>{
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
      config = new InputConfig(<InputConfigInterface>CleanObject(configInterface));
      break;
    case 'number':
      validators = [];
      if (model.min) validators.push(Validators.max(model.min));
      if (model.max) validators.push(Validators.max(model.max));
      if (model.required) validators.push(Validators.required);
      configInterface = <NumberConfigInterface>{
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
      config = new NumberConfig(<NumberConfigInterface>CleanObject(configInterface));
      break;
    case 'date':
      configInterface = <DateConfigInterface>{
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
      if (IsDefined(model.filterPredicate)) configInterface.filterPredicate = model.filterPredicate;
      config = new DateConfig(<DateConfigInterface>configInterface);
      break;
    case 'datepicker':
      configInterface = <DatePickerConfigInterface>{
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
      if (IsDefined(model.filterPredicate)) configInterface.filterPredicate = model.filterPredicate;
      config = new DatePickerConfig(<DatePickerConfigInterface>configInterface);
      break;
    case 'time':
      configInterface = <TimeConfigInterface>{
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
      config = new TimeConfig(<TimeConfigInterface>CleanObject(configInterface));
      break;
    case 'checkbox':
      model.options.values = FieldItemOptionValues(model, core);
      model.options.converted = true;
      configInterface = <CheckboxConfigInterface>{
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
      config = new CheckboxConfig(<CheckboxConfigInterface>CleanObject(configInterface));
      break;
    case 'switch':
      configInterface = <SwitchConfigInterface>{
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
      config = new SwitchConfig(<SwitchConfigInterface>CleanObject(configInterface));
      break;
    case 'minmax':
      const minColumn = model.minColumn ? model.minColumn : 'min';
      const maxColumn = model.maxColumn ? model.maxColumn : 'max';

      const minValue = typeof model.minValue !== 'undefined' && model.minValue !== null ? ParseModelValue(model.minValue, core) : IsObject(core.entity, true) && typeof core.entity[minColumn] !== 'undefined' ? core.entity[minColumn] : 1;
      const maxValue = typeof model.maxValue !== 'undefined' && model.maxValue !== null ? ParseModelValue(model.maxValue, core) : IsObject(core.entity, true) && typeof core.entity[maxColumn] !== 'undefined' ? core.entity[maxColumn] : 10;

      configInterface = <MinMaxConfigInterface>{
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
      config = new MinMaxConfig(<MinMaxConfigInterface>CleanObject(configInterface));
      break;
    case 'radio':
      model.options.values = FieldItemOptionValues(model, core);
      model.options.converted = true;
      configInterface = <RadioConfigInterface>{
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
      config = new RadioConfig(<RadioConfigInterface>CleanObject(configInterface));
      break;
    case 'textarea':
      configInterface = <TextareaConfigInterface>{
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
      config = new TextareaConfig(<TextareaConfigInterface>CleanObject(configInterface));
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

      configInterface = <LabelConfigInterface>CleanObject({
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
      config = new LabelConfig(<LabelConfigInterface>CleanObject(configInterface));
      break;
    case 'textstring':
      configInterface = <TextConfigInterface>{
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
      config = new TextConfig(<TextConfigInterface>CleanObject(configInterface));
      break;
    case 'button':
      configInterface = <ButtonConfigInterface>{
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
      config = new ButtonConfig(<ButtonConfigInterface>CleanObject(configInterface));
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


