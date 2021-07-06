import {
  Dictionary,
  Entity,
  OptionItem,
  OptionParamsInterface,
  PopAuth, PopLog,
  PopRouteAliasMap,
  PopTemplate,
  ServiceInjector
} from './pop-common.model';
import {PopLogService} from './services/pop-log.service';
import {PhonePipe} from './pipes/phone.pipe';
import {ToActiveOrArchivedPipe} from './pipes/toActiveOrArchived.pipe';
import {LabelPipe} from './pipes/label.pipe';
import {isDevMode} from '@angular/core';


/************************************************************************************************
 *                                                                                              *
 *                                      Local Storage                                           *
 *                                                                                              *
 ************************************************************************************************/

/**
 * Store a value in localStorage for the site
 * @param siteVarPath - This should always follow a dot notation that represents the structure of an object App.Setting.value
 * @param siteVal
 */
export function SetSiteVar(siteVarPath: string, siteVal: any) {
  if (IsString(siteVarPath, true) && siteVarPath.includes('.') && IsDefined(siteVal)) {
    // if( IsObject(siteVal) || IsArray(siteVal) ) siteVal = JSON.stringify(siteVal);
    const steps: string[] = siteVarPath.split('.');
    const basePath = steps.shift();
    if (basePath) {
      const baseStorage = JSON.parse(localStorage.getItem(basePath) || '{}');
      const key = steps.length ? steps.pop() : basePath;
      const pathStorage = steps.length ? StorageSetter(baseStorage, steps) : baseStorage;
      if (pathStorage && key) {
        if (siteVal === null) {
          delete pathStorage[key];
        } else {
          pathStorage[key] = siteVal;
        }
        localStorage.setItem(basePath, JSON.stringify(baseStorage));
      }
    }
  }

}


/**
 * Get stored value in localStorage for the site
 * @param siteVarPath - This should always follow a dot notation that represents the structure of an object App.Setting.value
 * @param defaultValue
 * @constructor
 */
export function GetSiteVar(siteVarPath: string, defaultValue: any = null) {
  if (IsString(siteVarPath, true) && siteVarPath.includes('.')) {
    const steps = siteVarPath.split('.');
    const basePath = steps.shift();
    if (basePath) {
      const key = steps.length ? steps.pop() : basePath;
      // console.log('basePath ', basePath, ' key', key);
      const baseStorage = JSON.parse(localStorage.getItem(basePath) || '{}');
      // console.log('baseStorage', basePath, baseStorage);
      const pathStorage = steps.length ? StorageSetter(baseStorage, steps) : baseStorage;
      // console.log('pathStorage', pathStorage);
      if (pathStorage && key) {
        const value = typeof pathStorage[key] !== 'undefined' ? pathStorage[key] : defaultValue;
        // console.log('GetSiteVar', siteVarPath, value, typeof value);
        return value;
      } else {
        return defaultValue;
      }
    }

  }
  return defaultValue;
}


export function GetRouteAlias(internal_name, type: 'plural' | 'singular' = 'plural'): string {
  if (IsString(internal_name, true)) {
    if (IsObject(PopRouteAliasMap, [internal_name])) {
      return PopRouteAliasMap[internal_name][type];
    } else {
      let alias = SnakeToPascal(internal_name);
      alias = SpaceToHyphenLower(alias);
      if (type === 'plural') {
        if (alias.slice(-1) !== 's') alias = `${alias}s`;
      }
      return alias;
    }
  }
  return internal_name;

}


/************************************************************************************************
 *                                                                                              *
 *                                      Session Storage                                         *
 *                                                                                              *
 ************************************************************************************************/


/**
 * Set a session variable for the site
 * @param siteVarPath - This should always follow a dot notation that represents the structure of an object App.Setting.value
 * @param siteVal
 * @constructor
 */
export function SetSessionSiteVar(siteVarPath: string, siteVal): void {
  if (IsString(siteVarPath, true) && siteVarPath.includes('.') && IsDefined(siteVal)) {
    // if( IsObject(siteVal) || IsArray(siteVal) ) siteVal = JSON.stringify(siteVal);
    const steps: string[] = siteVarPath.split('.');
    const basePath = steps.shift();
    if (basePath) {
      const key = steps.length ? steps.pop() : basePath;
      const baseStorage = JSON.parse(sessionStorage.getItem(basePath) || '{}');
      const pathStorage = steps.length ? StorageSetter(baseStorage, steps) : baseStorage;
      if (pathStorage && key) {
        if (siteVal === null) {
          delete pathStorage[key];
        } else {
          pathStorage[key] = siteVal;
        }
        sessionStorage.setItem(basePath, JSON.stringify(baseStorage));
        // console.log('SetSessionSiteVar', basePath, baseStorage);
      }
    }

  }
}

/**
 * Get a stored session variable for the site
 * @param siteVarPath - This should always follow a dot notation that represents the structure of an object App.Setting.value
 * @param defaultValue - Return this value if a stored value is not found
 * @constructor
 */
export function GetSessionSiteVar(siteVarPath: string, defaultValue: any = null) {
  if (IsString(siteVarPath, true) && siteVarPath.includes('.')) {
    const steps = siteVarPath.split('.');
    const basePath = steps.shift();
    if (basePath) {
      const key = steps.length ? steps.pop() : basePath;
      const baseStorage = JSON.parse(sessionStorage.getItem(basePath) || '{}');
      const pathStorage = steps.length ? StorageSetter(baseStorage, steps) : baseStorage;
      if (pathStorage && key) {
        const value = typeof pathStorage[key] !== 'undefined' ? pathStorage[key] : defaultValue;
        // console.log('GetSessionSiteVar', siteVarPath, value, typeof value);
        return value;
      } else {
        return defaultValue;
      }
    }
  }
  return defaultValue;
}

/**
 * Get a stored session variable for the site that has been base64 encoded
 * @param siteVarPath
 * @param defaultValue
 * @constructor
 */
export function GetEncodedSessionSiteVar(siteVarPath: string, defaultValue: any = null) {
  let siteVar = GetSessionSiteVar(siteVarPath, defaultValue);
  if (IsString(siteVar, true)) {
    try {
      siteVar = JSON.parse(atob(siteVar));
    } catch (e) {
      siteVar = null;
    }
  } else {
    siteVar = null;
  }
  return siteVar;
}

/**
 * Deep Copy an Object
 * @param obj
 */
export function DeepCopy(obj) {
  let copy;

  // Handle the 3 simple types, and null or undefined
  if (null == obj || 'object' != typeof obj) return obj;

  // Handle Date
  if (obj instanceof Date) {
    copy = new Date();
    copy.setTime(obj.getTime());
    return copy;
  }

  // Handle Array
  if (obj instanceof Array) {
    copy = [];
    for (let i = 0, len = obj.length; i < len; i++) {
      copy[i] = DeepCopy(obj[i]);
    }
    return copy;
  }

  // Handle Object
  if (obj instanceof Object) {
    copy = {};
    for (const attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = DeepCopy(obj[attr]);
    }
    return copy;
  }

  throw new Error('Unable to copy obj! Its type isn\'t supported.');
}

export function RandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function JsonCopy(x: any) {
  return JSON.parse(JSON.stringify(x));
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
export function DeepMerge(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (IsObject(target) && IsObject(source)) {
    for (const key in source) {
      if (IsObject(source[key])) {
        if (!target[key]) Object.assign(target, {[key]: {}});
        DeepMerge(target[key], source[key]);
      } else {
        Object.assign(target, {[key]: source[key]});
      }
    }
  }

  return DeepMerge(target, ...sources);
}

/**
 * Helper Function to prepare an array to used as an option set for a field item
 * @param arr
 * @param params
 */
export function ConvertArrayToOptionList(arr: OptionItem[], params: OptionParamsInterface = {}) {
  if (!params.key) params.key = 'id';
  if (!params.setKey) params.setKey = 'value';
  if (!params.nameKey) params.nameKey = 'name';
  if (!params.tags) params.tags = null;
  if (!params.prevent) params.prevent = [];
  if (!params.parent) params.parent = null;
  if (!params.groupKey) params.groupKey = 'group';
  if (!params.activeKey) params.activeKey = 'active';
  if (!params.preserveKeys) params.preserveKeys = [];

  // if( typeof params.level === 'undefined') params.level = 1;

  if (params.converted) return arr.slice();

  let optionList = [];
  let listOption;
  let ensureOptionFound = false;
  if (Array.isArray(arr) && arr.length) {
    // check if this list has already be converted to the option list structure, so it does not get re-run
    let tmpArr = [...arr];
    const first = tmpArr[0];

    if (params.key === 'id' && typeof first.id === 'undefined' && typeof first.value !== 'undefined') params.key = 'value';
    if (typeof first[params.activeKey] !== 'undefined') {
      tmpArr = tmpArr.filter((item) => item[params.activeKey]);
    }

    if (typeof first[params.nameKey] === 'undefined' && first.name) {
      params.nameKey = 'name';
    }

    tmpArr.map((item) => {
      if (item && params.key in item && params.prevent.indexOf(item[params.key]) === -1) {
        if (params.parent) {
          if (params.parent.field in item && +item[params.parent.field] === +params.parent.value) {
            // continue
          } else {
            return false;
          }
        }
        listOption = {name: item[params.nameKey], sort_order: item.sort};
        listOption[params.setKey] = item[params.key];
        if (params.preserveKeys.length) {
          params.preserveKeys.map(preserveKey => {
            listOption[preserveKey] = item[preserveKey] ? item[preserveKey] : undefined;
          });
        }
        if (typeof item['level'] === 'number') {
          listOption.level = item['level'];
        } else if (params.level) {
          listOption.level = params.level;
        }

        if (typeof item[params.groupKey] === 'string') {
          listOption.group = item[params.groupKey] ? item[params.groupKey] : params.group ? item[params.groupKey] : '';
        }
        if (typeof params.groupFkKey === 'string') {
          listOption.groupFk = item[params.groupFkKey] ? item[params.groupFkKey] : 0;
        }
        if (params.ensure && params.ensure.id && !ensureOptionFound && params.ensure[params.setKey] === item[params.setKey]) {
          ensureOptionFound = true;
        }
        if (params.tags) {
          params.tags.map((tag) => {
            if (tag in item) {
              listOption[tag] = item[tag];
            }
          });
        }
        if (listOption[params.setKey]) optionList.push(listOption);
      }
    });
    if (params.ensure && !ensureOptionFound) {
      optionList.push(params.ensure);
    }
    if (params.sort && optionList.length > 1) {
      if (typeof optionList[0].sort_order !== 'undefined') {
        optionList.sort((a, b) => {
          if (a.sort_order < b.sort_order) return -1;
          if (a.sort_order > b.sort_order) return 1;
          return 0;
        });
      } else {
        optionList.sort((a, b) => {
          if (a.name < b.name) return -1;
          if (a.name > b.name) return 1;
          return 0;
        });
      }
    }
  }
  // add empty option only if the optionList is empty !IsArray(optionList,true)


  // remove any duplicates

  // return optionList;

  return [...new Map(optionList.map(item => [item['name'], item])).values()];
}

/**
 * Helper to get an nested value out of an object
 * @param storage - The base object you want to reach into
 * @param steps  - the nested path to the find the value you are looking for
 * @param defaultValue Set a default value to return if value is not found
 */
export function StorageGetter(storage, steps: string[], defaultValue: any = null): any {
  if (IsObject(storage, true)) {
    let pathLength = steps.length;
    let path: string;
    while (pathLength) {
      path = steps.shift();
      if (!storage[path]) {
        return defaultValue;
      }
      storage = storage[path];
      pathLength--;
    }
    if (!storage) {
      return defaultValue;
    }
  } else {
    return defaultValue;
  }

  return storage;
}

/**
 * Helper to set a storage container into a nested location in an object
 * @param storage - The base object you want to reach into
 * @param steps  - the nested path to the find the value you are looking for
 * @param defaultValue Set a default value to return if value is not found
 */
export function StorageSetter(storage, steps: string[]): object | null {
  let pathLength = steps.length;
  let path: string;
  while (pathLength) {
    path = steps.shift();
    if (!storage[path]) {
      storage[path] = {};
    }
    storage = storage[path];
    pathLength--;
  }
  return storage;
}

export function Sleep(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}


/**
 * Sort helper for a list of objects where the sort needs to be done on a specific property
 * @param key
 * @param order
 */
export function DynamicSort(key, order = 'asc') {
  return function (a, b) {
    if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
      // property doesn't exist on either object
      return 0;
    }
    const varA = (typeof a[key] === 'string') ?
      a[key].toUpperCase() : a[key];
    const varB = (typeof b[key] === 'string') ?
      b[key].toUpperCase() : b[key];

    let comparison = 0;
    if (varA > varB) {
      comparison = 1;
    } else if (varA < varB) {
      comparison = -1;
    }
    return (
      (order == 'desc') ? (comparison * -1) : comparison
    );
  };
}

/**
 * Check if the values of two arrays contain the same items
 * This is way to get around the order not being the same, but the items are the same
 * @param arr1
 * @param arr2
 * @param field
 */
export function ArraysMatch(arr1: any[], arr2: any[], field: string) {
  if (arr1.length !== arr2.length)
    return false;
  if (field) {
    for (let i = arr1.length; i--;) {
      if (arr1[i][field] !== arr2[i][field])
        return false;
    }
  } else {
    for (let i = arr1.length; i--;) {
      if (arr1[i] !== arr2[i])
        return false;
    }
  }


  return true;
}

/**
 * Check if an array contains a list of key:value pairs
 * @param needles
 * @param haystack
 * @param strict
 */
export function ArrayContainsAll(needles: Array<string>, haystack: Array<string>, strict: boolean = false) {
  haystack = haystack.map(function (hay) {
    return String(hay).toLowerCase().trim();
  });
  if (strict) {
    for (let i = 0, len = needles.length; i < len; i++) {
      needles[i] = String(needles[i]).toLowerCase().trim();
      if (haystack.indexOf(needles[i]) === -1) return false;
    }
  } else {
    const need = needles.length;
    let match: boolean;
    let met = 0;
    needles.forEach(function (needle) {
      // loop over the blacklisted terms
      match = null;
      haystack.some(function (str) {
        if (String(str).toLowerCase().trim().indexOf(needle) > -1) {
          match = true;
          return true;
        }
      });
      if (match) {
        met++;
      }
    });
    return met >= need;
  }
  return true;
}

/**
 * Create a map of an array of objects using a specific property
 * @param arr
 * @param array_key_field
 */
export function ArrayMapSetter(arr: any[], array_key_field) {
  const map = {};
  if (Array.isArray(arr)) {
    arr.forEach((value, index) => {
      if (value[array_key_field]) map[value[array_key_field]] = index;
    });
  }

  return map;
}

/**
 * Sort an array by a parent_id
 * @param arr
 * @param parentId
 * @param result
 * @param itemKey
 * @param parentKey
 * @constructor
 */
export function ArrayParentSort(arr: any[], parentId = 0, result = [], itemKey = 'id', parentKey = 'parent_id') {
  if (IsArray(arr, true)) {
    arr.map(item => {
      if (+item[parentKey] === +parentId) {
        result.push(item);
        ArrayParentSort(arr, item[itemKey], result, itemKey, parentKey);
      }
    });
  }
  return result;
}

/**
 * Convert an array to a nested array
 * @param data
 * @param itemKey
 * @param parentKey
 * @constructor
 */
export function ArrayTreeList(data: any[], itemKey = 'id', parentKey = 'parent_id') {
  const map = {};
  const roots = [];
  let node;
  let i;

  for (i = 0; i < data.length; i += 1) {
    map[data[i][itemKey]] = i; // initialize the map
    data[i].children = []; // initialize the children
  }

  for (i = 0; i < data.length; i += 1) {
    node = data[i];
    if (node[parentKey] !== 0) {
      // if you have dangling branches check that map[node.parentId] exists
      data[map[node[parentKey]]].children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

/**
 * Flatten an array that has parent/child relationship
 * @param list
 * @param result
 * @param level
 * @param itemKey
 * @param parentKey
 * @constructor
 */
export function ArrayParentTreeFlatten(list: any[], result = [], level = 0, itemKey = 'id', parentKey = 'parent_id') {
  let children;
  if (IsArray(list, true)) {
    list.map((item) => {
      children = item.children;
      delete item.children;
      item.level = level;
      result.push(item);
      if (IsArray(children, true)) {
        ArrayParentTreeFlatten(children, result, level + 1);
      }
    });
  }
  return result;
}

/**
 * Create an array with parent child relations
 * @param data
 * @param parentId
 * @param result
 * @param tree
 * @param itemKey
 * @param parentKey
 * @param flatten
 * @constructor
 */
export function ArrayParentTree(data: any[], parentId = 0, result = [], tree?: any[], itemKey = 'id', parentKey = 'parent_id', flatten = false) {
  data = ArrayParentSort(data, parentId, result, itemKey, parentKey);
  data = ArrayTreeList(data, itemKey, parentKey);
  return data;
}

/**
 * Create a map of list of object keyed by an object property
 * @param arr
 * @param array_key_field
 */
export function ArrayKeyBy(arr: any[], key: string) {
  const keyBy = {};
  if (IsArray(arr, true) && IsString(key, true)) {
    arr.map(x => {
      if (IsDefined(x[key])) keyBy[x[key]] = x;
    });
  }
  return keyBy;
}


/**
 * Determine if an object is an array
 * @param arr
 * @param requireLength - Requires that it is an array but also has values
 */
export function IsArray(arr: any, requireLength = false): boolean {
  if (Array.isArray(arr)) {
    if (requireLength) {
      if (arr.length) {
        return true;
      } else {
        return false;
      }
    }
    return true;
  }
  return false;
}

export function IsArrayThrowError(arr: any, requireLength = false, throwError: string): boolean {
  const isArray = IsArray(arr, requireLength);
  if (!isArray) {
    if (IsObject(PopLog)) {
      if (PopLog.enabled('error')) {
        console.log(PopLog.message(`IsArrayError: Fail`), PopLog.color('error'), {
          data: arr,
          requireLength: requireLength,
          name: throwError
        });
      }
    }

    throw new Error(throwError);
  }
  return isArray;
}


/**
 * Convert an Object to an Array
 * @param obj
 */
export function ToArray(obj: object): any[] {
  if (typeof obj === 'object' && Object.keys(obj).length) {
    return Object.keys(obj).map(function (key) {
      return obj[key];
    });
  }
  return [];
}

/**
 * Check if a var is undefined
 * @param x
 */
export function IsUndefined(x: any): boolean {
  if (typeof x === 'undefined') return true;
  return false;
}

/**
 * Check if a var is defined
 * @param x
 */
export function IsDefined(x: any, allowNull = true): boolean {
  if (x === null && !allowNull) return false;
  if (typeof x === 'undefined') return false;
  return true;
}

/**
 * Convert an Array to an object
 * @param obj
 */
export function ToObject(arr: any[]) {
  if (arr && Array.isArray(arr) && arr.length) {
    const rv = {};
    for (let i = 0; i < arr.length; ++i)
      rv[i] = arr[i];
    return rv;
  }
  return arr;
}

export function ObjectsMatch(x, y) {
  if (x === null || x === undefined || y === null || y === undefined) {
    return x === y;
  }
  // after this just checking type of one would be enough
  if (x.constructor !== y.constructor) {
    return false;
  }
  // if they are functions, they should exactly refer to same one (because of closures)
  if (x instanceof Function) {
    return x === y;
  }
  // if they are regexps, they should exactly refer to same one (it is hard to better equality check on current ES)
  if (x instanceof RegExp) {
    return x === y;
  }
  if (x === y || x.valueOf() === y.valueOf()) {
    return true;
  }
  if (Array.isArray(x) && x.length !== y.length) {
    return false;
  }

  // if they are dates, they must had equal valueOf
  if (x instanceof Date) {
    return false;
  }

  // if they are strictly equal, they both need to be object at least
  if (!(x instanceof Object)) {
    return false;
  }
  if (!(y instanceof Object)) {
    return false;
  }

  // recursive object equality check
  const p = Object.keys(x);
  return Object.keys(y).every(function (i) {
      return p.indexOf(i) !== -1;
    }) &&
    p.every(function (i) {
      return ObjectsMatch(x[i], y[i]);
    });
}

/**
 * Check for a qualified object
 * @param value
 * @param requireKeys
 * @constructor
 */
export function IsObject(value: any, requireKeys: boolean | string[] = false): boolean {
  if (!Array.isArray(value) && value !== null && typeof value === 'object') {
    if (requireKeys) {
      if (typeof requireKeys === 'boolean' && Object.keys(value).length) {
        return true;
      } else if (IsArray(requireKeys, true)) {
        let pass = true;
        const keys = <string[]>requireKeys;
        keys.some((key) => {
          if (!(key in value)) pass = false;
          return true;
        });
        if (!pass) return false;
      } else {
        return false;
      }
    }
    return true;
  }
  return false;
}


/**
 * Check for a qualified function
 * @param value
 * @param requireKeys
 * @constructor
 */
export function IsCallableFunction(fn: any): boolean {
  return typeof fn === 'function';
}

/**
 * Remove empty values from an object
 * @param obj
 * @constructor
 */
export function CleanObject(obj: Object, options: { whitelist?: string[], blacklist?: string[], alias?: Dictionary<string> } = {}) {
  if (!(IsArray(options.whitelist))) options.whitelist = [];
  if (!(IsArray(options.blacklist))) options.blacklist = [];
  if (!(IsObject(options.alias))) options.alias = {};
  for (const propName in obj) {
    if (!(options.whitelist.includes(propName)) && (obj[propName] === null || obj[propName] === undefined || options.blacklist.includes(propName))) {
      delete obj[propName];
    }
    if (propName in options.alias && IsString(options.alias[propName], true)) {
      obj[options.alias[propName]] = obj[propName];
      delete obj[propName];
    }
  }
  return obj;
}

/**
 * A helper function to determine if a variable is a qualified object
 *
 * @param value
 * @param requireKeys
 * @param throwError
 */
export function IsObjectThrowError(value: any, requireKeys: boolean | string[] = false, throwError: string): boolean {
  const isObject = IsObject(value, requireKeys);
  if (!isObject && throwError) {
    if (IsObject(PopLog)) {
      if (PopLog.enabled('error')) {
        if (PopTemplate) {
          if (isDevMode() && !(IsObject(PopAuth, ['token']))) {
            PopTemplate.error({message: `${throwError}, this may be due to not being authenticated.`, code: 500});
          }
        }
        console.log(PopLog.message(`IsObjectError: Fail`), PopLog.color('error'), {
          data: value,
          requireKeys: requireKeys,
          name: throwError
        });
      }
    }

    throw new Error(throwError);
  }

  return isObject;
}

/**
 * Check for a qualified number
 * @param value
 * @param requireTruthy
 * @constructor
 */

export function IsNumber(value: any, requireTruthy?: boolean): boolean {
  if ((typeof value === 'number' || typeof value === 'string') && String(value).length && !isNaN(Number(value.toString()))) {
    if (requireTruthy) {
      if (+value) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  }
  return false;
}


/**
 * Check for a qualified string
 * @param value
 * @param requireLength
 * @constructor
 */
export function IsString(value: any, requireLength = false): boolean {
  if (value && typeof value === 'string' && !(IsNumber(value))) {
    if (requireLength) {
      if (String(value).length) {
        return true;
      } else {
        return false;
      }
    }
    return true;
  }
  return false;
}

/**
 *
 * A helper function to determine if a variable is a qualified string
 * @param value
 * @param requireLength
 * @param throwError
 */
export function IsStringError(value: any, requireLength = false, throwError: string): boolean {
  const isString = IsString(value, requireLength);
  if (!isString && throwError) {
    if (IsObject(PopLog)) {
      if (PopLog.enabled('error')) {
        console.log(PopLog.message(`IsStringError: Fail`), PopLog.color('error'), {
          data: value,
          requireLength: requireLength,
          name: throwError
        });
      }
    }
    throw new Error(throwError);
  }
  return isString;
}

/**
 * Capitalize the first Letter of every word in a string
 * @param str
 * @returns str
 */
export function TitleCase(str: string) {
  if (IsString(str, true)) {
    str = StringReplaceAll(str, '_', ' ');  // convert underscores to spaces
    str = String(str).replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); // capitalize first letter of words
    });
    str = str.replace(/(^|[\s-])\S/g, function (match) { // capitalize letters after hyphens
      return match.toUpperCase();
    });
  }
  return str;
}

/**
 * Capitalize the first Letter of every word in a string
 * @param str
 * @returns str
 */
export function Capitalize(str: string) {
  if (IsString(str, true)) {
    str = str.trim();
    str = StringReplaceAll(str, '_', ' ');  // convert underscores to spaces
    str = StringReplaceAll(str, '\'', '');  // convert ' to spaces
    str = str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
  return str;
}

/**
 * Convert a string from snake case to Pascal Case
 * @param field
 * @returns string
 */
export function SnakeToPascal(field: string): string {
  if (IsString(field, true)) {
    const words = field.split('_');
    let validField = '';
    for (const word of words) {
      validField += word.charAt(0).toUpperCase() + word.slice(1) + ' ';
    }
    return String(validField).trim();
  }
  return field;

}

/**
 * Convert a string with spaces to snake case .. 'this is snake case' to 'this_is_snake_case'
 * @param field
 * @returns string
 */
export function SpaceToSnake(pascal: string): string {
  const words = pascal.split(' ');
  for (let word of words) {
    word = String(word).toLowerCase();
  }
  return words.join('_');
}


/**
 * Convert a string with hyphens to Pascal Case
 * @param field
 * @returns string
 */
export function HyphenToPascal(field: string): string {
  const words = field.split('-');
  let validField = '';
  for (const word of words) {
    validField += word.charAt(0).toUpperCase() + word.slice(1) + ' ';
  }
  return validField;
}

/**
 * Convert a string with spaces to Pascal Case
 * @param field
 * @returns string
 */
export function SpaceToHyphenLower(str: string): string {
  const tmp = str.trim();
  return String(StringReplaceAll(tmp, ' ', '-')).toLowerCase();
}


/**
 * String replace all
 * @param str
 * @param find
 * @param replace
 * @constructor
 */
export function StringReplaceAll(str: string, find: string, replace: string): string {
  return str.replace(new RegExp(find, 'g'), replace);
}


/**
 * Search filter helper to see if an object contains tags
 * @param obj
 * @param tags
 * @param match
 * @param values
 * @param has
 * @param not
 * @constructor
 */
export function ObjectContainsTagSearch(obj, tags: string, match = null, values = null, has = null, not = null) {
  if (String(tags).length) {
    has = String(tags).toLowerCase().split(',').map(function (str) {
      return str.trim();
    }).filter(
      item => {
        return String(item).length && String(item).charAt(0) !== '!';
      }
    );

    not = String(tags).toLowerCase().split(',').map((str) => {
      return str.trim();
    }).filter(
      item => {
        return String(item).length >= 2 && String(item).charAt(0) === '!';
      }
    );
    not = not.map((tag) => {
      return StringReplaceAll(tag, '!', '');
    }).filter((tag) => {
      return tag.length >= 1;
    });

    match = true;
    values = Object.values(obj).filter(
      val => {
        return String(val).length > 0;
      });

    if (Array.isArray(not) && not.length) {
      match = true;
      not.some(tag => {
        values.some((val) => {
          if (String(val).toLowerCase().indexOf(tag) > -1) {
            match = null;
            return true;
          }
        });
        if (!match) {
          return true;
        }
      });
    }
    if (match === true) {
      match = null;
      if (Array.isArray(has) && has.length) {
        has.some((tag) => {
          if (tag.indexOf('&') > -1) {
            const has2 = String(tag).toLowerCase().split('&').map((str) => {
              return str.trim();
            }).filter(item => {
              return String(item).length && String(item).charAt(0) !== '!';
            });

            let not2 = String(tag).toLowerCase().split('&').map((str) => {
              return str.trim();
            }).filter(
              item => {
                return String(item).length >= 1 && String(item).charAt(0) === '!';
              });

            not2 = not2.map(firstTag => {
              return StringReplaceAll(firstTag, '!', '');
            }).filter(nextTag => {
              return nextTag.length >= 1;
            });

            match = true;
            if (Array.isArray(not2) && not2.length) {
              match = true;
              not2.some((firstTag) => {
                values.some((val) => {
                  if (String(val).toLowerCase().indexOf(firstTag) > -1) {
                    match = null;
                    return true;
                  }
                });
                if (!match) {
                  return true;
                }
              });
            }
            if (match === true) {
              match = null;
              if (Array.isArray(has2) && has2.length) {
                if (ArrayContainsAll(has2, values)) {
                  match = true;
                }
                return match;
              }
            }
            return match;
          } else {
            values.some((val) => {
              if (String(val).toLowerCase().indexOf(tag) > -1) {
                match = true;
                return true;
              }
            });
          }
          if (match) {
            return true;
          }
        });
      }
    }
    return match;
  }

  return true;
}

export function ConvertDateToDateTimeFormat(value): string {
  const dt = new Date(value);
  dt.setHours(dt.getHours() + Math.round(dt.getMinutes() / 60));
  dt.setMinutes(0);

  let date: any = dt.getDate();
  if (String(date).length === 1) {
    date = '0' + date;
  }

  let month: any = dt.getMonth() + 1;
  if (String(month).length === 1) {
    month = '0' + month;
  }

  const year = dt.getFullYear();
  let h: any = dt.getHours();
  if (String(h).length === 1) {
    h = '0' + h;
  }

  return year + '-' + month + '-' + date + ' ' + h + ':' + '00' + ':' + '00';
}

export function ConvertDateFormat(value: string, format = 'yyyy-mm-dd'): string {
  const dt = new Date(value);
  let dateFormat;

  let date: any = dt.getDate();
  if (String(date).length === 1) {
    date = '0' + date;
  }

  let month: any = dt.getMonth() + 1;
  if (String(month).length === 1) {
    month = '0' + month;
  }

  const year = dt.getFullYear();

  switch (String(format).toLowerCase()) {
    case 'mm-dd-yyyy':
      dateFormat = month + '-' + date + '-' + year;
      break;
    case 'mm/dd/yyyy':
      dateFormat = month + '/' + date + '/' + year;
      break;
    case 'yyyy-mm-dd':
      dateFormat = year + '-' + month + '-' + date;
      break;
    default:
      dateFormat = year + '-' + month + '-' + date;
      break;
  }
  return dateFormat;
}

export function ConvertDateToTimeFormat(value): string {
  const dt = new Date(value);
  const h = dt.getHours().toString(10).padStart(2, '0');
  const m = dt.getMinutes().toString(10).padStart(2, '0');
  const s = dt.getSeconds().toString(10).padStart(2, '0');
  return h + ':' + m + ':' + s;
}

export function PopUid() {
  return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
}

export function ConvertObjectToUri(obj: object | any[]) {
  if (Array.isArray(obj)) {
    obj = ToObject(obj);
  }
  return Object.entries(obj).map(([key, val]) => `${key}=${encodeURIComponent(val)}`).join('&');
}


/**
 * Group a list of objects inside of an array
 * @param arr
 * @param key
 * @constructor
 */
export function ArrayGroupBy(arr: Dictionary<any>[], key) {
  if (IsArray(arr, true)) {
    return arr.reduce(function (rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  } else {
    return arr;
  }

}


/**
 * Pick a random element from an array
 * @param arr
 * @constructor
 */
export function RandomArrayElement(arr: any[]) {
  if (IsArrayThrowError(arr, true, `RandomArrayElement: Invalid Array`)) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}

/**
 * Helper method to remove duplicate items from a  flat array [1,2,3,1,1], [['a','b','c','a']
 * @param arr
 */
export function ArrayOnlyUnique(arr: any[]) {
  if (IsArray(arr, true)) {
    return arr.filter(function (elem, index, self) {
      return index === self.indexOf(elem);
    });
  }
  return arr;
}

export function ArrayRemoveDupliates(array: object[], prop) {
  return array.filter((obj, pos, arr) => {
    return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
  });
}

/**
 * Pass in a state verb to resolve to a color theme ... use case would be color of buttons, icons, and notifications
 * @param state
 */
export function GetVerbStateTheme(stateVerb: string | boolean | number): string {

  const successVerbs = ['active', 'success', 'on', '1'];
  const dangerVerbs = ['err', 'off', 'remove', '0', 'fail', 'archived'];
  const warningVerbs = ['warn', 'pend', 'remove'];
  const infoVerbs = ['new', 'info', 'add'];
  let theme = null;
  successVerbs.some((verb) => {
    if (String(stateVerb).toLowerCase().search(verb) > -1) {
      theme = 'success';
      return true;
    }
  });
  if (!theme) {
    dangerVerbs.some(function (verb) {
      if (String(stateVerb).toLowerCase().search(verb) > -1) {
        theme = 'danger';
        return true;
      }
    });
  }
  if (!theme) {
    warningVerbs.some(function (verb) {
      if (String(stateVerb).toLowerCase().search(verb) > -1) {
        theme = 'warn';
        return true;
      }
    });
  }
  if (!theme) {
    infoVerbs.some(function (verb) {
      if (String(stateVerb).toLowerCase().search(verb) > -1) {
        theme = 'info';
        return true;
      }
    });
  }
  if (!theme) theme = 'default';

  return theme;
}


/**
 * Helper for getting a message string from an http error
 * @param err
 * @constructor
 */
export function GetHttpErrorMsg(err: any) {
  let errorMessage = '';
  let location = err;
  if (IsObject(location, true)) {
    if (IsObject(err.error, true)) {
      location = err.error;
      if (IsObject(location.errors, true)) {
        Object.keys(location.errors).map((key) => {
          if (IsArray(location.errors[key], true)) {
            location.errors[key].map((errorMsg, index) => {
              if (index) errorMessage += `<br/>`;
              errorMessage += errorMsg + `<br/>`;
            });
          } else if (IsString(location.errors[key])) {
            errorMessage += err.errors[key] + `<br/>`;
          }
          errorMessage += `<br/>`;
        });
      } else if (IsString(location.message, true)) {
        errorMessage = location.message;
      }
    } else if (IsString(location.message, true)) {
      errorMessage = err.message;
    } else if (StorageGetter(location, ['data', 'message'])) {
      errorMessage = location.data.message;
    }
  } else if (IsObject(location, ['message'])) {
    errorMessage = location.message;
  } else if (IsString(location, true)) {
    errorMessage = String(location);
  }
  if (!errorMessage) {
    if (IsObject(PopLog)) {
      console.log(PopLog.message(`GetHttpErrorMsg: Fail`), PopLog.color('error'), {
        data: location,
      });
    }
    errorMessage = `Server Error: Code ${err.status + (err.statusText ? ' - ' + err.statusText : '') + '.'}`;
  }

  return errorMessage;
}


/**
 * Helper for getting an array from a response
 * @param err
 * @constructor
 */
export function GetHttpResult(res: any): any {
  if (res) {
    if (res.data) res = res.data;
  } else {
    console.log(`Undefined response: ${JSON.stringify(res)}`);
  }
  return res;
}

/**
 * Helper for getting an array from a response
 * @param err
 * @constructor
 */
export function GetHttpArrayResult(res: Response, requireLength = false): Entity[] {
  let result = <any>res;
  if (result && result.data) {
    result = result.data;
  }
  return IsArrayThrowError(result, requireLength, `Api Result was not an array as expected`) ? result : null;
}

/**
 * Helper for getting an object from a response
 * @param err
 * @constructor
 */
export function GetHttpObjectResult(res: Response, requireKeys: boolean | string[] = false): Entity {
  let result = <any>res;
  if (result && result.data) {
    result = result.data;
  }
  return IsObjectThrowError(result, requireKeys, `Api Result was not an object as expected`) ? result : null;
}


/**
 * Replace { var } in a string with the corresponding data value of an object
 * @param str
 * @param obj
 * @constructor
 */
export function InterpolateString(str: string, obj: Object) { // recursive
  if (typeof (str) === 'string' && str.includes('{') && IsObject(obj, true)) {
    const start = str.indexOf('{');
    const end = str.indexOf('}', start) !== -1 ? str.indexOf('}', start) : str.length;
    const fieldName = str.substring(start + 1, end);
    const varName = fieldName.trim();
    if (varName in obj) {
      str = str.replace('{' + fieldName + '}', obj[varName]);
      if (str && str.includes('{')) {
        str = InterpolateString(str, obj);
      }
    }

  }
  return str;
}

export function GetStringAbbrv(str: string): string {
  let abbrv = '';
  if (IsString(str, true)) {
    const strArray = String(str).trim().split(' ');
    let word;
    while (strArray.length) {
      word = strArray.shift();
      abbrv += String(word).trim().charAt(0).toLocaleUpperCase();
    }
  }
  return abbrv;
}


export function PopTransform(value: string | number | boolean, transformation: string | object): any {

  switch (String(transformation).toLowerCase()) {
    case 'toRelationName':
      if (IsObject(value)) {
        const val = <any>value;
        const location = val.label ? 'label' : 'name';
        const name = <string>StorageGetter(value, [location]);
        if (name) value = name;
      }
      break;
    case 'totitlecase':
    case 'title':
      value = TitleCase(String(value));
      break;
    case 'tolowercase':
    case 'lower':
      value = String(value).toLowerCase();
      break;
    case 'label':
      const label = new LabelPipe();
      value = label.transform(value + '');
      break;
    case 'todigits':
    case 'digits':
      value = String(value).match(/\d+/g).map(Number).join('');
      break;
    case 'tophonepipe':
    case 'phone':
      const phone = new PhonePipe();
      value = phone.transform(value);
      break;
    case 'active':
    case 'archived':
    case 'toactiveararchived':
      const active = new ToActiveOrArchivedPipe();
      value = active.transform(value);
      break;
    case 'touppercase':
    case 'upper':
      value = String(value).toUpperCase();
      break;
    case 'convertemptytonull':
      if (!String(value).length) value = null;
      break;
    case 'convertemptyzero':
      if (!String(value).length) value = 0;
      break;
    case 'tocurrency':
    case 'currency':
    case 'dollar':
      if (IsNumber(value)) {
        value = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2
        }).format(Number(value));
      }
      break;
    case 'amount':
      value = IsNumber(value) ? parseFloat(String(value)).toFixed(2) : '0.00';
      break;
    default:
      break;
  }

  return value;
}
