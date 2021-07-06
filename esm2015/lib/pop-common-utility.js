import { PopAuth, PopLog, PopRouteAliasMap, PopTemplate } from './pop-common.model';
import { PhonePipe } from './pipes/phone.pipe';
import { ToActiveOrArchivedPipe } from './pipes/toActiveOrArchived.pipe';
import { LabelPipe } from './pipes/label.pipe';
import { isDevMode } from '@angular/core';
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
export function SetSiteVar(siteVarPath, siteVal) {
    if (IsString(siteVarPath, true) && siteVarPath.includes('.') && IsDefined(siteVal)) {
        // if( IsObject(siteVal) || IsArray(siteVal) ) siteVal = JSON.stringify(siteVal);
        const steps = siteVarPath.split('.');
        const basePath = steps.shift();
        if (basePath) {
            const baseStorage = JSON.parse(localStorage.getItem(basePath) || '{}');
            const key = steps.length ? steps.pop() : basePath;
            const pathStorage = steps.length ? StorageSetter(baseStorage, steps) : baseStorage;
            if (pathStorage && key) {
                if (siteVal === null) {
                    delete pathStorage[key];
                }
                else {
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
export function GetSiteVar(siteVarPath, defaultValue = null) {
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
            }
            else {
                return defaultValue;
            }
        }
    }
    return defaultValue;
}
export function GetRouteAlias(internal_name, type = 'plural') {
    if (IsString(internal_name, true)) {
        if (IsObject(PopRouteAliasMap, [internal_name])) {
            return PopRouteAliasMap[internal_name][type];
        }
        else {
            let alias = SnakeToPascal(internal_name);
            alias = SpaceToHyphenLower(alias);
            if (type === 'plural') {
                if (alias.slice(-1) !== 's')
                    alias = `${alias}s`;
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
export function SetSessionSiteVar(siteVarPath, siteVal) {
    if (IsString(siteVarPath, true) && siteVarPath.includes('.') && IsDefined(siteVal)) {
        // if( IsObject(siteVal) || IsArray(siteVal) ) siteVal = JSON.stringify(siteVal);
        const steps = siteVarPath.split('.');
        const basePath = steps.shift();
        if (basePath) {
            const key = steps.length ? steps.pop() : basePath;
            const baseStorage = JSON.parse(sessionStorage.getItem(basePath) || '{}');
            const pathStorage = steps.length ? StorageSetter(baseStorage, steps) : baseStorage;
            if (pathStorage && key) {
                if (siteVal === null) {
                    delete pathStorage[key];
                }
                else {
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
export function GetSessionSiteVar(siteVarPath, defaultValue = null) {
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
            }
            else {
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
export function GetEncodedSessionSiteVar(siteVarPath, defaultValue = null) {
    let siteVar = GetSessionSiteVar(siteVarPath, defaultValue);
    if (IsString(siteVar, true)) {
        try {
            siteVar = JSON.parse(atob(siteVar));
        }
        catch (e) {
            siteVar = null;
        }
    }
    else {
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
    if (null == obj || 'object' != typeof obj)
        return obj;
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
            if (obj.hasOwnProperty(attr))
                copy[attr] = DeepCopy(obj[attr]);
        }
        return copy;
    }
    throw new Error('Unable to copy obj! Its type isn\'t supported.');
}
export function RandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
export function JsonCopy(x) {
    return JSON.parse(JSON.stringify(x));
}
/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
export function DeepMerge(target, ...sources) {
    if (!sources.length)
        return target;
    const source = sources.shift();
    if (IsObject(target) && IsObject(source)) {
        for (const key in source) {
            if (IsObject(source[key])) {
                if (!target[key])
                    Object.assign(target, { [key]: {} });
                DeepMerge(target[key], source[key]);
            }
            else {
                Object.assign(target, { [key]: source[key] });
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
export function ConvertArrayToOptionList(arr, params = {}) {
    if (!params.key)
        params.key = 'id';
    if (!params.setKey)
        params.setKey = 'value';
    if (!params.nameKey)
        params.nameKey = 'name';
    if (!params.tags)
        params.tags = null;
    if (!params.prevent)
        params.prevent = [];
    if (!params.parent)
        params.parent = null;
    if (!params.groupKey)
        params.groupKey = 'group';
    if (!params.activeKey)
        params.activeKey = 'active';
    if (!params.preserveKeys)
        params.preserveKeys = [];
    // if( typeof params.level === 'undefined') params.level = 1;
    if (params.converted)
        return arr.slice();
    let optionList = [];
    let listOption;
    let ensureOptionFound = false;
    if (Array.isArray(arr) && arr.length) {
        // check if this list has already be converted to the option list structure, so it does not get re-run
        let tmpArr = [...arr];
        const first = tmpArr[0];
        if (params.key === 'id' && typeof first.id === 'undefined' && typeof first.value !== 'undefined')
            params.key = 'value';
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
                    }
                    else {
                        return false;
                    }
                }
                listOption = { name: item[params.nameKey], sort_order: item.sort };
                listOption[params.setKey] = item[params.key];
                if (params.preserveKeys.length) {
                    params.preserveKeys.map(preserveKey => {
                        listOption[preserveKey] = item[preserveKey] ? item[preserveKey] : undefined;
                    });
                }
                if (typeof item['level'] === 'number') {
                    listOption.level = item['level'];
                }
                else if (params.level) {
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
                if (listOption[params.setKey])
                    optionList.push(listOption);
            }
        });
        if (params.ensure && !ensureOptionFound) {
            optionList.push(params.ensure);
        }
        if (params.sort && optionList.length > 1) {
            if (typeof optionList[0].sort_order !== 'undefined') {
                optionList.sort((a, b) => {
                    if (a.sort_order < b.sort_order)
                        return -1;
                    if (a.sort_order > b.sort_order)
                        return 1;
                    return 0;
                });
            }
            else {
                optionList.sort((a, b) => {
                    if (a.name < b.name)
                        return -1;
                    if (a.name > b.name)
                        return 1;
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
export function StorageGetter(storage, steps, defaultValue = null) {
    if (IsObject(storage, true)) {
        let pathLength = steps.length;
        let path;
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
    }
    else {
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
export function StorageSetter(storage, steps) {
    let pathLength = steps.length;
    let path;
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
        }
        else if (varA < varB) {
            comparison = -1;
        }
        return ((order == 'desc') ? (comparison * -1) : comparison);
    };
}
/**
 * Check if the values of two arrays contain the same items
 * This is way to get around the order not being the same, but the items are the same
 * @param arr1
 * @param arr2
 * @param field
 */
export function ArraysMatch(arr1, arr2, field) {
    if (arr1.length !== arr2.length)
        return false;
    if (field) {
        for (let i = arr1.length; i--;) {
            if (arr1[i][field] !== arr2[i][field])
                return false;
        }
    }
    else {
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
export function ArrayContainsAll(needles, haystack, strict = false) {
    haystack = haystack.map(function (hay) {
        return String(hay).toLowerCase().trim();
    });
    if (strict) {
        for (let i = 0, len = needles.length; i < len; i++) {
            needles[i] = String(needles[i]).toLowerCase().trim();
            if (haystack.indexOf(needles[i]) === -1)
                return false;
        }
    }
    else {
        const need = needles.length;
        let match;
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
export function ArrayMapSetter(arr, array_key_field) {
    const map = {};
    if (Array.isArray(arr)) {
        arr.forEach((value, index) => {
            if (value[array_key_field])
                map[value[array_key_field]] = index;
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
export function ArrayParentSort(arr, parentId = 0, result = [], itemKey = 'id', parentKey = 'parent_id') {
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
export function ArrayTreeList(data, itemKey = 'id', parentKey = 'parent_id') {
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
        }
        else {
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
export function ArrayParentTreeFlatten(list, result = [], level = 0, itemKey = 'id', parentKey = 'parent_id') {
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
export function ArrayParentTree(data, parentId = 0, result = [], tree, itemKey = 'id', parentKey = 'parent_id', flatten = false) {
    data = ArrayParentSort(data, parentId, result, itemKey, parentKey);
    data = ArrayTreeList(data, itemKey, parentKey);
    return data;
}
/**
 * Create a map of list of object keyed by an object property
 * @param arr
 * @param array_key_field
 */
export function ArrayKeyBy(arr, key) {
    const keyBy = {};
    if (IsArray(arr, true) && IsString(key, true)) {
        arr.map(x => {
            if (IsDefined(x[key]))
                keyBy[x[key]] = x;
        });
    }
    return keyBy;
}
/**
 * Determine if an object is an array
 * @param arr
 * @param requireLength - Requires that it is an array but also has values
 */
export function IsArray(arr, requireLength = false) {
    if (Array.isArray(arr)) {
        if (requireLength) {
            if (arr.length) {
                return true;
            }
            else {
                return false;
            }
        }
        return true;
    }
    return false;
}
export function IsArrayThrowError(arr, requireLength = false, throwError) {
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
export function ToArray(obj) {
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
export function IsUndefined(x) {
    if (typeof x === 'undefined')
        return true;
    return false;
}
/**
 * Check if a var is defined
 * @param x
 */
export function IsDefined(x, allowNull = true) {
    if (x === null && !allowNull)
        return false;
    if (typeof x === 'undefined')
        return false;
    return true;
}
/**
 * Convert an Array to an object
 * @param obj
 */
export function ToObject(arr) {
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
export function IsObject(value, requireKeys = false) {
    if (!Array.isArray(value) && value !== null && typeof value === 'object') {
        if (requireKeys) {
            if (typeof requireKeys === 'boolean' && Object.keys(value).length) {
                return true;
            }
            else if (IsArray(requireKeys, true)) {
                let pass = true;
                const keys = requireKeys;
                keys.some((key) => {
                    if (!(key in value))
                        pass = false;
                    return true;
                });
                if (!pass)
                    return false;
            }
            else {
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
export function IsCallableFunction(fn) {
    return typeof fn === 'function';
}
/**
 * Remove empty values from an object
 * @param obj
 * @constructor
 */
export function CleanObject(obj, options = {}) {
    if (!(IsArray(options.whitelist)))
        options.whitelist = [];
    if (!(IsArray(options.blacklist)))
        options.blacklist = [];
    if (!(IsObject(options.alias)))
        options.alias = {};
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
export function IsObjectThrowError(value, requireKeys = false, throwError) {
    const isObject = IsObject(value, requireKeys);
    if (!isObject && throwError) {
        if (IsObject(PopLog)) {
            if (PopLog.enabled('error')) {
                if (PopTemplate) {
                    if (isDevMode() && !(IsObject(PopAuth, ['token']))) {
                        PopTemplate.error({ message: `${throwError}, this may be due to not being authenticated.`, code: 500 });
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
export function IsNumber(value, requireTruthy) {
    if ((typeof value === 'number' || typeof value === 'string') && String(value).length && !isNaN(Number(value.toString()))) {
        if (requireTruthy) {
            if (+value) {
                return true;
            }
            else {
                return false;
            }
        }
        else {
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
export function IsString(value, requireLength = false) {
    if (value && typeof value === 'string' && !(IsNumber(value))) {
        if (requireLength) {
            if (String(value).length) {
                return true;
            }
            else {
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
export function IsStringError(value, requireLength = false, throwError) {
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
export function TitleCase(str) {
    if (IsString(str, true)) {
        str = StringReplaceAll(str, '_', ' '); // convert underscores to spaces
        str = String(str).replace(/\w\S*/g, (txt) => {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); // capitalize first letter of words
        });
        str = str.replace(/(^|[\s-])\S/g, function (match) {
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
export function Capitalize(str) {
    if (IsString(str, true)) {
        str = str.trim();
        str = StringReplaceAll(str, '_', ' '); // convert underscores to spaces
        str = StringReplaceAll(str, '\'', ''); // convert ' to spaces
        str = str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
    return str;
}
/**
 * Convert a string from snake case to Pascal Case
 * @param field
 * @returns string
 */
export function SnakeToPascal(field) {
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
export function SpaceToSnake(pascal) {
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
export function HyphenToPascal(field) {
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
export function SpaceToHyphenLower(str) {
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
export function StringReplaceAll(str, find, replace) {
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
export function ObjectContainsTagSearch(obj, tags, match = null, values = null, has = null, not = null) {
    if (String(tags).length) {
        has = String(tags).toLowerCase().split(',').map(function (str) {
            return str.trim();
        }).filter(item => {
            return String(item).length && String(item).charAt(0) !== '!';
        });
        not = String(tags).toLowerCase().split(',').map((str) => {
            return str.trim();
        }).filter(item => {
            return String(item).length >= 2 && String(item).charAt(0) === '!';
        });
        not = not.map((tag) => {
            return StringReplaceAll(tag, '!', '');
        }).filter((tag) => {
            return tag.length >= 1;
        });
        match = true;
        values = Object.values(obj).filter(val => {
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
                        }).filter(item => {
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
                    }
                    else {
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
export function ConvertDateToDateTimeFormat(value) {
    const dt = new Date(value);
    dt.setHours(dt.getHours() + Math.round(dt.getMinutes() / 60));
    dt.setMinutes(0);
    let date = dt.getDate();
    if (String(date).length === 1) {
        date = '0' + date;
    }
    let month = dt.getMonth() + 1;
    if (String(month).length === 1) {
        month = '0' + month;
    }
    const year = dt.getFullYear();
    let h = dt.getHours();
    if (String(h).length === 1) {
        h = '0' + h;
    }
    return year + '-' + month + '-' + date + ' ' + h + ':' + '00' + ':' + '00';
}
export function ConvertDateFormat(value, format = 'yyyy-mm-dd') {
    const dt = new Date(value);
    let dateFormat;
    let date = dt.getDate();
    if (String(date).length === 1) {
        date = '0' + date;
    }
    let month = dt.getMonth() + 1;
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
export function ConvertDateToTimeFormat(value) {
    const dt = new Date(value);
    const h = dt.getHours().toString(10).padStart(2, '0');
    const m = dt.getMinutes().toString(10).padStart(2, '0');
    const s = dt.getSeconds().toString(10).padStart(2, '0');
    return h + ':' + m + ':' + s;
}
export function PopUid() {
    return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
}
export function ConvertObjectToUri(obj) {
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
export function ArrayGroupBy(arr, key) {
    if (IsArray(arr, true)) {
        return arr.reduce(function (rv, x) {
            (rv[x[key]] = rv[x[key]] || []).push(x);
            return rv;
        }, {});
    }
    else {
        return arr;
    }
}
/**
 * Pick a random element from an array
 * @param arr
 * @constructor
 */
export function RandomArrayElement(arr) {
    if (IsArrayThrowError(arr, true, `RandomArrayElement: Invalid Array`)) {
        return arr[Math.floor(Math.random() * arr.length)];
    }
}
/**
 * Helper method to remove duplicate items from a  flat array [1,2,3,1,1], [['a','b','c','a']
 * @param arr
 */
export function ArrayOnlyUnique(arr) {
    if (IsArray(arr, true)) {
        return arr.filter(function (elem, index, self) {
            return index === self.indexOf(elem);
        });
    }
    return arr;
}
export function ArrayRemoveDupliates(array, prop) {
    return array.filter((obj, pos, arr) => {
        return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
    });
}
/**
 * Pass in a state verb to resolve to a color theme ... use case would be color of buttons, icons, and notifications
 * @param state
 */
export function GetVerbStateTheme(stateVerb) {
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
    if (!theme)
        theme = 'default';
    return theme;
}
/**
 * Helper for getting a message string from an http error
 * @param err
 * @constructor
 */
export function GetHttpErrorMsg(err) {
    let errorMessage = '';
    let location = err;
    if (IsObject(location, true)) {
        if (IsObject(err.error, true)) {
            location = err.error;
            if (IsObject(location.errors, true)) {
                Object.keys(location.errors).map((key) => {
                    if (IsArray(location.errors[key], true)) {
                        location.errors[key].map((errorMsg, index) => {
                            if (index)
                                errorMessage += `<br/>`;
                            errorMessage += errorMsg + `<br/>`;
                        });
                    }
                    else if (IsString(location.errors[key])) {
                        errorMessage += err.errors[key] + `<br/>`;
                    }
                    errorMessage += `<br/>`;
                });
            }
            else if (IsString(location.message, true)) {
                errorMessage = location.message;
            }
        }
        else if (IsString(location.message, true)) {
            errorMessage = err.message;
        }
        else if (StorageGetter(location, ['data', 'message'])) {
            errorMessage = location.data.message;
        }
    }
    else if (IsObject(location, ['message'])) {
        errorMessage = location.message;
    }
    else if (IsString(location, true)) {
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
export function GetHttpResult(res) {
    if (res) {
        if (res.data)
            res = res.data;
    }
    else {
        console.log(`Undefined response: ${JSON.stringify(res)}`);
    }
    return res;
}
/**
 * Helper for getting an array from a response
 * @param err
 * @constructor
 */
export function GetHttpArrayResult(res, requireLength = false) {
    let result = res;
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
export function GetHttpObjectResult(res, requireKeys = false) {
    let result = res;
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
export function InterpolateString(str, obj) {
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
export function GetStringAbbrv(str) {
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
export function PopTransform(value, transformation) {
    switch (String(transformation).toLowerCase()) {
        case 'toRelationName':
            if (IsObject(value)) {
                const val = value;
                const location = val.label ? 'label' : 'name';
                const name = StorageGetter(value, [location]);
                if (name)
                    value = name;
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
            if (!String(value).length)
                value = null;
            break;
        case 'convertemptyzero':
            if (!String(value).length)
                value = 0;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWNvbW1vbi11dGlsaXR5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL3BvcC1jb21tb24tdXRpbGl0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBS0wsT0FBTyxFQUFFLE1BQU0sRUFDZixnQkFBZ0IsRUFDaEIsV0FBVyxFQUVaLE1BQU0sb0JBQW9CLENBQUM7QUFFNUIsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBQzdDLE9BQU8sRUFBQyxzQkFBc0IsRUFBQyxNQUFNLGlDQUFpQyxDQUFDO0FBQ3ZFLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUM3QyxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBR3hDOzs7O2tHQUlrRztBQUVsRzs7OztHQUlHO0FBQ0gsTUFBTSxVQUFVLFVBQVUsQ0FBQyxXQUFtQixFQUFFLE9BQVk7SUFDMUQsSUFBSSxRQUFRLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxJQUFJLFdBQVcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksU0FBUyxDQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ2xGLGlGQUFpRjtRQUNqRixNQUFNLEtBQUssR0FBYSxXQUFXLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQy9DLE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUMvQixJQUFJLFFBQVEsRUFBRTtZQUNaLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQztZQUN2RSxNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEs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UTtZQUNYLEtBQUssR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztZQUN4RSxNQUFNO1FBQ1I7WUFDRSxNQUFNO0tBQ1Q7SUFFRCxPQUFPLEtBQUssQ0FBQztBQUNmLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBEaWN0aW9uYXJ5LFxuICBFbnRpdHksXG4gIE9wdGlvbkl0ZW0sXG4gIE9wdGlvblBhcmFtc0ludGVyZmFjZSxcbiAgUG9wQXV0aCwgUG9wTG9nLFxuICBQb3BSb3V0ZUFsaWFzTWFwLFxuICBQb3BUZW1wbGF0ZSxcbiAgU2VydmljZUluamVjdG9yXG59IGZyb20gJy4vcG9wLWNvbW1vbi5tb2RlbCc7XG5pbXBvcnQge1BvcExvZ1NlcnZpY2V9IGZyb20gJy4vc2VydmljZXMvcG9wLWxvZy5zZXJ2aWNlJztcbmltcG9ydCB7UGhvbmVQaXBlfSBmcm9tICcuL3BpcGVzL3Bob25lLnBpcGUnO1xuaW1wb3J0IHtUb0FjdGl2ZU9yQXJjaGl2ZWRQaXBlfSBmcm9tICcuL3BpcGVzL3RvQWN0aXZlT3JBcmNoaXZlZC5waXBlJztcbmltcG9ydCB7TGFiZWxQaXBlfSBmcm9tICcuL3BpcGVzL2xhYmVsLnBpcGUnO1xuaW1wb3J0IHtpc0Rldk1vZGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBMb2NhbCBTdG9yYWdlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbi8qKlxuICogU3RvcmUgYSB2YWx1ZSBpbiBsb2NhbFN0b3JhZ2UgZm9yIHRoZSBzaXRlXG4gKiBAcGFyYW0gc2l0ZVZhclBhdGggLSBUaGlzIHNob3VsZCBhbHdheXMgZm9sbG93IGEgZG90IG5vdGF0aW9uIHRoYXQgcmVwcmVzZW50cyB0aGUgc3RydWN0dXJlIG9mIGFuIG9iamVjdCBBcHAuU2V0dGluZy52YWx1ZVxuICogQHBhcmFtIHNpdGVWYWxcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNldFNpdGVWYXIoc2l0ZVZhclBhdGg6IHN0cmluZywgc2l0ZVZhbDogYW55KSB7XG4gIGlmIChJc1N0cmluZyhzaXRlVmFyUGF0aCwgdHJ1ZSkgJiYgc2l0ZVZhclBhdGguaW5jbHVkZXMoJy4nKSAmJiBJc0RlZmluZWQoc2l0ZVZhbCkpIHtcbiAgICAvLyBpZiggSXNPYmplY3Qoc2l0ZVZhbCkgfHwgSXNBcnJheShzaXRlVmFsKSApIHNpdGVWYWwgPSBKU09OLnN0cmluZ2lmeShzaXRlVmFsKTtcbiAgICBjb25zdCBzdGVwczogc3RyaW5nW10gPSBzaXRlVmFyUGF0aC5zcGxpdCgnLicpO1xuICAgIGNvbnN0IGJhc2VQYXRoID0gc3RlcHMuc2hpZnQoKTtcbiAgICBpZiAoYmFzZVBhdGgpIHtcbiAgICAgIGNvbnN0IGJhc2VTdG9yYWdlID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbShiYXNlUGF0aCkgfHwgJ3t9Jyk7XG4gICAgICBjb25zdCBrZXkgPSBzdGVwcy5sZW5ndGggPyBzdGVwcy5wb3AoKSA6IGJhc2VQYXRoO1xuICAgICAgY29uc3QgcGF0aFN0b3JhZ2UgPSBzdGVwcy5sZW5ndGggPyBTdG9yYWdlU2V0dGVyKGJhc2VTdG9yYWdlLCBzdGVwcykgOiBiYXNlU3RvcmFnZTtcbiAgICAgIGlmIChwYXRoU3RvcmFnZSAmJiBrZXkpIHtcbiAgICAgICAgaWYgKHNpdGVWYWwgPT09IG51bGwpIHtcbiAgICAgICAgICBkZWxldGUgcGF0aFN0b3JhZ2Vba2V5XTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwYXRoU3RvcmFnZVtrZXldID0gc2l0ZVZhbDtcbiAgICAgICAgfVxuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShiYXNlUGF0aCwgSlNPTi5zdHJpbmdpZnkoYmFzZVN0b3JhZ2UpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxufVxuXG5cbi8qKlxuICogR2V0IHN0b3JlZCB2YWx1ZSBpbiBsb2NhbFN0b3JhZ2UgZm9yIHRoZSBzaXRlXG4gKiBAcGFyYW0gc2l0ZVZhclBhdGggLSBUaGlzIHNob3VsZCBhbHdheXMgZm9sbG93IGEgZG90IG5vdGF0aW9uIHRoYXQgcmVwcmVzZW50cyB0aGUgc3RydWN0dXJlIG9mIGFuIG9iamVjdCBBcHAuU2V0dGluZy52YWx1ZVxuICogQHBhcmFtIGRlZmF1bHRWYWx1ZVxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBHZXRTaXRlVmFyKHNpdGVWYXJQYXRoOiBzdHJpbmcsIGRlZmF1bHRWYWx1ZTogYW55ID0gbnVsbCkge1xuICBpZiAoSXNTdHJpbmcoc2l0ZVZhclBhdGgsIHRydWUpICYmIHNpdGVWYXJQYXRoLmluY2x1ZGVzKCcuJykpIHtcbiAgICBjb25zdCBzdGVwcyA9IHNpdGVWYXJQYXRoLnNwbGl0KCcuJyk7XG4gICAgY29uc3QgYmFzZVBhdGggPSBzdGVwcy5zaGlmdCgpO1xuICAgIGlmIChiYXNlUGF0aCkge1xuICAgICAgY29uc3Qga2V5ID0gc3RlcHMubGVuZ3RoID8gc3RlcHMucG9wKCkgOiBiYXNlUGF0aDtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdiYXNlUGF0aCAnLCBiYXNlUGF0aCwgJyBrZXknLCBrZXkpO1xuICAgICAgY29uc3QgYmFzZVN0b3JhZ2UgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKGJhc2VQYXRoKSB8fCAne30nKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdiYXNlU3RvcmFnZScsIGJhc2VQYXRoLCBiYXNlU3RvcmFnZSk7XG4gICAgICBjb25zdCBwYXRoU3RvcmFnZSA9IHN0ZXBzLmxlbmd0aCA/IFN0b3JhZ2VTZXR0ZXIoYmFzZVN0b3JhZ2UsIHN0ZXBzKSA6IGJhc2VTdG9yYWdlO1xuICAgICAgLy8gY29uc29sZS5sb2coJ3BhdGhTdG9yYWdlJywgcGF0aFN0b3JhZ2UpO1xuICAgICAgaWYgKHBhdGhTdG9yYWdlICYmIGtleSkge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IHR5cGVvZiBwYXRoU3RvcmFnZVtrZXldICE9PSAndW5kZWZpbmVkJyA/IHBhdGhTdG9yYWdlW2tleV0gOiBkZWZhdWx0VmFsdWU7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdHZXRTaXRlVmFyJywgc2l0ZVZhclBhdGgsIHZhbHVlLCB0eXBlb2YgdmFsdWUpO1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZGVmYXVsdFZhbHVlO1xuICAgICAgfVxuICAgIH1cblxuICB9XG4gIHJldHVybiBkZWZhdWx0VmFsdWU7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIEdldFJvdXRlQWxpYXMoaW50ZXJuYWxfbmFtZSwgdHlwZTogJ3BsdXJhbCcgfCAnc2luZ3VsYXInID0gJ3BsdXJhbCcpOiBzdHJpbmcge1xuICBpZiAoSXNTdHJpbmcoaW50ZXJuYWxfbmFtZSwgdHJ1ZSkpIHtcbiAgICBpZiAoSXNPYmplY3QoUG9wUm91dGVBbGlhc01hcCwgW2ludGVybmFsX25hbWVdKSkge1xuICAgICAgcmV0dXJuIFBvcFJvdXRlQWxpYXNNYXBbaW50ZXJuYWxfbmFtZV1bdHlwZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBhbGlhcyA9IFNuYWtlVG9QYXNjYWwoaW50ZXJuYWxfbmFtZSk7XG4gICAgICBhbGlhcyA9IFNwYWNlVG9IeXBoZW5Mb3dlcihhbGlhcyk7XG4gICAgICBpZiAodHlwZSA9PT0gJ3BsdXJhbCcpIHtcbiAgICAgICAgaWYgKGFsaWFzLnNsaWNlKC0xKSAhPT0gJ3MnKSBhbGlhcyA9IGAke2FsaWFzfXNgO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGFsaWFzO1xuICAgIH1cbiAgfVxuICByZXR1cm4gaW50ZXJuYWxfbmFtZTtcblxufVxuXG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTZXNzaW9uIFN0b3JhZ2UgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cblxuLyoqXG4gKiBTZXQgYSBzZXNzaW9uIHZhcmlhYmxlIGZvciB0aGUgc2l0ZVxuICogQHBhcmFtIHNpdGVWYXJQYXRoIC0gVGhpcyBzaG91bGQgYWx3YXlzIGZvbGxvdyBhIGRvdCBub3RhdGlvbiB0aGF0IHJlcHJlc2VudHMgdGhlIHN0cnVjdHVyZSBvZiBhbiBvYmplY3QgQXBwLlNldHRpbmcudmFsdWVcbiAqIEBwYXJhbSBzaXRlVmFsXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNldFNlc3Npb25TaXRlVmFyKHNpdGVWYXJQYXRoOiBzdHJpbmcsIHNpdGVWYWwpOiB2b2lkIHtcbiAgaWYgKElzU3RyaW5nKHNpdGVWYXJQYXRoLCB0cnVlKSAmJiBzaXRlVmFyUGF0aC5pbmNsdWRlcygnLicpICYmIElzRGVmaW5lZChzaXRlVmFsKSkge1xuICAgIC8vIGlmKCBJc09iamVjdChzaXRlVmFsKSB8fCBJc0FycmF5KHNpdGVWYWwpICkgc2l0ZVZhbCA9IEpTT04uc3RyaW5naWZ5KHNpdGVWYWwpO1xuICAgIGNvbnN0IHN0ZXBzOiBzdHJpbmdbXSA9IHNpdGVWYXJQYXRoLnNwbGl0KCcuJyk7XG4gICAgY29uc3QgYmFzZVBhdGggPSBzdGVwcy5zaGlmdCgpO1xuICAgIGlmIChiYXNlUGF0aCkge1xuICAgICAgY29uc3Qga2V5ID0gc3RlcHMubGVuZ3RoID8gc3RlcHMucG9wKCkgOiBiYXNlUGF0aDtcbiAgICAgIGNvbnN0IGJhc2VTdG9yYWdlID0gSlNPTi5wYXJzZShzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKGJhc2VQYXRoKSB8fCAne30nKTtcbiAgICAgIGNvbnN0IHBhdGhTdG9yYWdlID0gc3RlcHMubGVuZ3RoID8gU3RvcmFnZVNldHRlcihiYXNlU3RvcmFnZSwgc3RlcHMpIDogYmFzZVN0b3JhZ2U7XG4gICAgICBpZiAocGF0aFN0b3JhZ2UgJiYga2V5KSB7XG4gICAgICAgIGlmIChzaXRlVmFsID09PSBudWxsKSB7XG4gICAgICAgICAgZGVsZXRlIHBhdGhTdG9yYWdlW2tleV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcGF0aFN0b3JhZ2Vba2V5XSA9IHNpdGVWYWw7XG4gICAgICAgIH1cbiAgICAgICAgc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbShiYXNlUGF0aCwgSlNPTi5zdHJpbmdpZnkoYmFzZVN0b3JhZ2UpKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ1NldFNlc3Npb25TaXRlVmFyJywgYmFzZVBhdGgsIGJhc2VTdG9yYWdlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgfVxufVxuXG4vKipcbiAqIEdldCBhIHN0b3JlZCBzZXNzaW9uIHZhcmlhYmxlIGZvciB0aGUgc2l0ZVxuICogQHBhcmFtIHNpdGVWYXJQYXRoIC0gVGhpcyBzaG91bGQgYWx3YXlzIGZvbGxvdyBhIGRvdCBub3RhdGlvbiB0aGF0IHJlcHJlc2VudHMgdGhlIHN0cnVjdHVyZSBvZiBhbiBvYmplY3QgQXBwLlNldHRpbmcudmFsdWVcbiAqIEBwYXJhbSBkZWZhdWx0VmFsdWUgLSBSZXR1cm4gdGhpcyB2YWx1ZSBpZiBhIHN0b3JlZCB2YWx1ZSBpcyBub3QgZm91bmRcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5leHBvcnQgZnVuY3Rpb24gR2V0U2Vzc2lvblNpdGVWYXIoc2l0ZVZhclBhdGg6IHN0cmluZywgZGVmYXVsdFZhbHVlOiBhbnkgPSBudWxsKSB7XG4gIGlmIChJc1N0cmluZyhzaXRlVmFyUGF0aCwgdHJ1ZSkgJiYgc2l0ZVZhclBhdGguaW5jbHVkZXMoJy4nKSkge1xuICAgIGNvbnN0IHN0ZXBzID0gc2l0ZVZhclBhdGguc3BsaXQoJy4nKTtcbiAgICBjb25zdCBiYXNlUGF0aCA9IHN0ZXBzLnNoaWZ0KCk7XG4gICAgaWYgKGJhc2VQYXRoKSB7XG4gICAgICBjb25zdCBrZXkgPSBzdGVwcy5sZW5ndGggPyBzdGVwcy5wb3AoKSA6IGJhc2VQYXRoO1xuICAgICAgY29uc3QgYmFzZVN0b3JhZ2UgPSBKU09OLnBhcnNlKHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oYmFzZVBhdGgpIHx8ICd7fScpO1xuICAgICAgY29uc3QgcGF0aFN0b3JhZ2UgPSBzdGVwcy5sZW5ndGggPyBTdG9yYWdlU2V0dGVyKGJhc2VTdG9yYWdlLCBzdGVwcykgOiBiYXNlU3RvcmFnZTtcbiAgICAgIGlmIChwYXRoU3RvcmFnZSAmJiBrZXkpIHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSB0eXBlb2YgcGF0aFN0b3JhZ2Vba2V5XSAhPT0gJ3VuZGVmaW5lZCcgPyBwYXRoU3RvcmFnZVtrZXldIDogZGVmYXVsdFZhbHVlO1xuICAgICAgICAvLyBjb25zb2xlLmxvZygnR2V0U2Vzc2lvblNpdGVWYXInLCBzaXRlVmFyUGF0aCwgdmFsdWUsIHR5cGVvZiB2YWx1ZSk7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBkZWZhdWx0VmFsdWU7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBkZWZhdWx0VmFsdWU7XG59XG5cbi8qKlxuICogR2V0IGEgc3RvcmVkIHNlc3Npb24gdmFyaWFibGUgZm9yIHRoZSBzaXRlIHRoYXQgaGFzIGJlZW4gYmFzZTY0IGVuY29kZWRcbiAqIEBwYXJhbSBzaXRlVmFyUGF0aFxuICogQHBhcmFtIGRlZmF1bHRWYWx1ZVxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBHZXRFbmNvZGVkU2Vzc2lvblNpdGVWYXIoc2l0ZVZhclBhdGg6IHN0cmluZywgZGVmYXVsdFZhbHVlOiBhbnkgPSBudWxsKSB7XG4gIGxldCBzaXRlVmFyID0gR2V0U2Vzc2lvblNpdGVWYXIoc2l0ZVZhclBhdGgsIGRlZmF1bHRWYWx1ZSk7XG4gIGlmIChJc1N0cmluZyhzaXRlVmFyLCB0cnVlKSkge1xuICAgIHRyeSB7XG4gICAgICBzaXRlVmFyID0gSlNPTi5wYXJzZShhdG9iKHNpdGVWYXIpKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBzaXRlVmFyID0gbnVsbDtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgc2l0ZVZhciA9IG51bGw7XG4gIH1cbiAgcmV0dXJuIHNpdGVWYXI7XG59XG5cbi8qKlxuICogRGVlcCBDb3B5IGFuIE9iamVjdFxuICogQHBhcmFtIG9ialxuICovXG5leHBvcnQgZnVuY3Rpb24gRGVlcENvcHkob2JqKSB7XG4gIGxldCBjb3B5O1xuXG4gIC8vIEhhbmRsZSB0aGUgMyBzaW1wbGUgdHlwZXMsIGFuZCBudWxsIG9yIHVuZGVmaW5lZFxuICBpZiAobnVsbCA9PSBvYmogfHwgJ29iamVjdCcgIT0gdHlwZW9mIG9iaikgcmV0dXJuIG9iajtcblxuICAvLyBIYW5kbGUgRGF0ZVxuICBpZiAob2JqIGluc3RhbmNlb2YgRGF0ZSkge1xuICAgIGNvcHkgPSBuZXcgRGF0ZSgpO1xuICAgIGNvcHkuc2V0VGltZShvYmouZ2V0VGltZSgpKTtcbiAgICByZXR1cm4gY29weTtcbiAgfVxuXG4gIC8vIEhhbmRsZSBBcnJheVxuICBpZiAob2JqIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICBjb3B5ID0gW107XG4gICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IG9iai5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgY29weVtpXSA9IERlZXBDb3B5KG9ialtpXSk7XG4gICAgfVxuICAgIHJldHVybiBjb3B5O1xuICB9XG5cbiAgLy8gSGFuZGxlIE9iamVjdFxuICBpZiAob2JqIGluc3RhbmNlb2YgT2JqZWN0KSB7XG4gICAgY29weSA9IHt9O1xuICAgIGZvciAoY29uc3QgYXR0ciBpbiBvYmopIHtcbiAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoYXR0cikpIGNvcHlbYXR0cl0gPSBEZWVwQ29weShvYmpbYXR0cl0pO1xuICAgIH1cbiAgICByZXR1cm4gY29weTtcbiAgfVxuXG4gIHRocm93IG5ldyBFcnJvcignVW5hYmxlIHRvIGNvcHkgb2JqISBJdHMgdHlwZSBpc25cXCd0IHN1cHBvcnRlZC4nKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFJhbmRvbUludChtaW4sIG1heCkge1xuICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpKSArIG1pbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEpzb25Db3B5KHg6IGFueSkge1xuICByZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh4KSk7XG59XG5cbi8qKlxuICogRGVlcCBtZXJnZSB0d28gb2JqZWN0cy5cbiAqIEBwYXJhbSB0YXJnZXRcbiAqIEBwYXJhbSAuLi5zb3VyY2VzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBEZWVwTWVyZ2UodGFyZ2V0LCAuLi5zb3VyY2VzKSB7XG4gIGlmICghc291cmNlcy5sZW5ndGgpIHJldHVybiB0YXJnZXQ7XG4gIGNvbnN0IHNvdXJjZSA9IHNvdXJjZXMuc2hpZnQoKTtcblxuICBpZiAoSXNPYmplY3QodGFyZ2V0KSAmJiBJc09iamVjdChzb3VyY2UpKSB7XG4gICAgZm9yIChjb25zdCBrZXkgaW4gc291cmNlKSB7XG4gICAgICBpZiAoSXNPYmplY3Qoc291cmNlW2tleV0pKSB7XG4gICAgICAgIGlmICghdGFyZ2V0W2tleV0pIE9iamVjdC5hc3NpZ24odGFyZ2V0LCB7W2tleV06IHt9fSk7XG4gICAgICAgIERlZXBNZXJnZSh0YXJnZXRba2V5XSwgc291cmNlW2tleV0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgT2JqZWN0LmFzc2lnbih0YXJnZXQsIHtba2V5XTogc291cmNlW2tleV19KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gRGVlcE1lcmdlKHRhcmdldCwgLi4uc291cmNlcyk7XG59XG5cbi8qKlxuICogSGVscGVyIEZ1bmN0aW9uIHRvIHByZXBhcmUgYW4gYXJyYXkgdG8gdXNlZCBhcyBhbiBvcHRpb24gc2V0IGZvciBhIGZpZWxkIGl0ZW1cbiAqIEBwYXJhbSBhcnJcbiAqIEBwYXJhbSBwYXJhbXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIENvbnZlcnRBcnJheVRvT3B0aW9uTGlzdChhcnI6IE9wdGlvbkl0ZW1bXSwgcGFyYW1zOiBPcHRpb25QYXJhbXNJbnRlcmZhY2UgPSB7fSkge1xuICBpZiAoIXBhcmFtcy5rZXkpIHBhcmFtcy5rZXkgPSAnaWQnO1xuICBpZiAoIXBhcmFtcy5zZXRLZXkpIHBhcmFtcy5zZXRLZXkgPSAndmFsdWUnO1xuICBpZiAoIXBhcmFtcy5uYW1lS2V5KSBwYXJhbXMubmFtZUtleSA9ICduYW1lJztcbiAgaWYgKCFwYXJhbXMudGFncykgcGFyYW1zLnRhZ3MgPSBudWxsO1xuICBpZiAoIXBhcmFtcy5wcmV2ZW50KSBwYXJhbXMucHJldmVudCA9IFtdO1xuICBpZiAoIXBhcmFtcy5wYXJlbnQpIHBhcmFtcy5wYXJlbnQgPSBudWxsO1xuICBpZiAoIXBhcmFtcy5ncm91cEtleSkgcGFyYW1zLmdyb3VwS2V5ID0gJ2dyb3VwJztcbiAgaWYgKCFwYXJhbXMuYWN0aXZlS2V5KSBwYXJhbXMuYWN0aXZlS2V5ID0gJ2FjdGl2ZSc7XG4gIGlmICghcGFyYW1zLnByZXNlcnZlS2V5cykgcGFyYW1zLnByZXNlcnZlS2V5cyA9IFtdO1xuXG4gIC8vIGlmKCB0eXBlb2YgcGFyYW1zLmxldmVsID09PSAndW5kZWZpbmVkJykgcGFyYW1zLmxldmVsID0gMTtcblxuICBpZiAocGFyYW1zLmNvbnZlcnRlZCkgcmV0dXJuIGFyci5zbGljZSgpO1xuXG4gIGxldCBvcHRpb25MaXN0ID0gW107XG4gIGxldCBsaXN0T3B0aW9uO1xuICBsZXQgZW5zdXJlT3B0aW9uRm91bmQgPSBmYWxzZTtcbiAgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSAmJiBhcnIubGVuZ3RoKSB7XG4gICAgLy8gY2hlY2sgaWYgdGhpcyBsaXN0IGhhcyBhbHJlYWR5IGJlIGNvbnZlcnRlZCB0byB0aGUgb3B0aW9uIGxpc3Qgc3RydWN0dXJlLCBzbyBpdCBkb2VzIG5vdCBnZXQgcmUtcnVuXG4gICAgbGV0IHRtcEFyciA9IFsuLi5hcnJdO1xuICAgIGNvbnN0IGZpcnN0ID0gdG1wQXJyWzBdO1xuXG4gICAgaWYgKHBhcmFtcy5rZXkgPT09ICdpZCcgJiYgdHlwZW9mIGZpcnN0LmlkID09PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgZmlyc3QudmFsdWUgIT09ICd1bmRlZmluZWQnKSBwYXJhbXMua2V5ID0gJ3ZhbHVlJztcbiAgICBpZiAodHlwZW9mIGZpcnN0W3BhcmFtcy5hY3RpdmVLZXldICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdG1wQXJyID0gdG1wQXJyLmZpbHRlcigoaXRlbSkgPT4gaXRlbVtwYXJhbXMuYWN0aXZlS2V5XSk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBmaXJzdFtwYXJhbXMubmFtZUtleV0gPT09ICd1bmRlZmluZWQnICYmIGZpcnN0Lm5hbWUpIHtcbiAgICAgIHBhcmFtcy5uYW1lS2V5ID0gJ25hbWUnO1xuICAgIH1cblxuICAgIHRtcEFyci5tYXAoKGl0ZW0pID0+IHtcbiAgICAgIGlmIChpdGVtICYmIHBhcmFtcy5rZXkgaW4gaXRlbSAmJiBwYXJhbXMucHJldmVudC5pbmRleE9mKGl0ZW1bcGFyYW1zLmtleV0pID09PSAtMSkge1xuICAgICAgICBpZiAocGFyYW1zLnBhcmVudCkge1xuICAgICAgICAgIGlmIChwYXJhbXMucGFyZW50LmZpZWxkIGluIGl0ZW0gJiYgK2l0ZW1bcGFyYW1zLnBhcmVudC5maWVsZF0gPT09ICtwYXJhbXMucGFyZW50LnZhbHVlKSB7XG4gICAgICAgICAgICAvLyBjb250aW51ZVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGxpc3RPcHRpb24gPSB7bmFtZTogaXRlbVtwYXJhbXMubmFtZUtleV0sIHNvcnRfb3JkZXI6IGl0ZW0uc29ydH07XG4gICAgICAgIGxpc3RPcHRpb25bcGFyYW1zLnNldEtleV0gPSBpdGVtW3BhcmFtcy5rZXldO1xuICAgICAgICBpZiAocGFyYW1zLnByZXNlcnZlS2V5cy5sZW5ndGgpIHtcbiAgICAgICAgICBwYXJhbXMucHJlc2VydmVLZXlzLm1hcChwcmVzZXJ2ZUtleSA9PiB7XG4gICAgICAgICAgICBsaXN0T3B0aW9uW3ByZXNlcnZlS2V5XSA9IGl0ZW1bcHJlc2VydmVLZXldID8gaXRlbVtwcmVzZXJ2ZUtleV0gOiB1bmRlZmluZWQ7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBpdGVtWydsZXZlbCddID09PSAnbnVtYmVyJykge1xuICAgICAgICAgIGxpc3RPcHRpb24ubGV2ZWwgPSBpdGVtWydsZXZlbCddO1xuICAgICAgICB9IGVsc2UgaWYgKHBhcmFtcy5sZXZlbCkge1xuICAgICAgICAgIGxpc3RPcHRpb24ubGV2ZWwgPSBwYXJhbXMubGV2ZWw7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZW9mIGl0ZW1bcGFyYW1zLmdyb3VwS2V5XSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBsaXN0T3B0aW9uLmdyb3VwID0gaXRlbVtwYXJhbXMuZ3JvdXBLZXldID8gaXRlbVtwYXJhbXMuZ3JvdXBLZXldIDogcGFyYW1zLmdyb3VwID8gaXRlbVtwYXJhbXMuZ3JvdXBLZXldIDogJyc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBwYXJhbXMuZ3JvdXBGa0tleSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBsaXN0T3B0aW9uLmdyb3VwRmsgPSBpdGVtW3BhcmFtcy5ncm91cEZrS2V5XSA/IGl0ZW1bcGFyYW1zLmdyb3VwRmtLZXldIDogMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGFyYW1zLmVuc3VyZSAmJiBwYXJhbXMuZW5zdXJlLmlkICYmICFlbnN1cmVPcHRpb25Gb3VuZCAmJiBwYXJhbXMuZW5zdXJlW3BhcmFtcy5zZXRLZXldID09PSBpdGVtW3BhcmFtcy5zZXRLZXldKSB7XG4gICAgICAgICAgZW5zdXJlT3B0aW9uRm91bmQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwYXJhbXMudGFncykge1xuICAgICAgICAgIHBhcmFtcy50YWdzLm1hcCgodGFnKSA9PiB7XG4gICAgICAgICAgICBpZiAodGFnIGluIGl0ZW0pIHtcbiAgICAgICAgICAgICAgbGlzdE9wdGlvblt0YWddID0gaXRlbVt0YWddO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsaXN0T3B0aW9uW3BhcmFtcy5zZXRLZXldKSBvcHRpb25MaXN0LnB1c2gobGlzdE9wdGlvbik7XG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYgKHBhcmFtcy5lbnN1cmUgJiYgIWVuc3VyZU9wdGlvbkZvdW5kKSB7XG4gICAgICBvcHRpb25MaXN0LnB1c2gocGFyYW1zLmVuc3VyZSk7XG4gICAgfVxuICAgIGlmIChwYXJhbXMuc29ydCAmJiBvcHRpb25MaXN0Lmxlbmd0aCA+IDEpIHtcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9uTGlzdFswXS5zb3J0X29yZGVyICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBvcHRpb25MaXN0LnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgICBpZiAoYS5zb3J0X29yZGVyIDwgYi5zb3J0X29yZGVyKSByZXR1cm4gLTE7XG4gICAgICAgICAgaWYgKGEuc29ydF9vcmRlciA+IGIuc29ydF9vcmRlcikgcmV0dXJuIDE7XG4gICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb3B0aW9uTGlzdC5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgICAgaWYgKGEubmFtZSA8IGIubmFtZSkgcmV0dXJuIC0xO1xuICAgICAgICAgIGlmIChhLm5hbWUgPiBiLm5hbWUpIHJldHVybiAxO1xuICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgLy8gYWRkIGVtcHR5IG9wdGlvbiBvbmx5IGlmIHRoZSBvcHRpb25MaXN0IGlzIGVtcHR5ICFJc0FycmF5KG9wdGlvbkxpc3QsdHJ1ZSlcblxuXG4gIC8vIHJlbW92ZSBhbnkgZHVwbGljYXRlc1xuXG4gIC8vIHJldHVybiBvcHRpb25MaXN0O1xuXG4gIHJldHVybiBbLi4ubmV3IE1hcChvcHRpb25MaXN0Lm1hcChpdGVtID0+IFtpdGVtWyduYW1lJ10sIGl0ZW1dKSkudmFsdWVzKCldO1xufVxuXG4vKipcbiAqIEhlbHBlciB0byBnZXQgYW4gbmVzdGVkIHZhbHVlIG91dCBvZiBhbiBvYmplY3RcbiAqIEBwYXJhbSBzdG9yYWdlIC0gVGhlIGJhc2Ugb2JqZWN0IHlvdSB3YW50IHRvIHJlYWNoIGludG9cbiAqIEBwYXJhbSBzdGVwcyAgLSB0aGUgbmVzdGVkIHBhdGggdG8gdGhlIGZpbmQgdGhlIHZhbHVlIHlvdSBhcmUgbG9va2luZyBmb3JcbiAqIEBwYXJhbSBkZWZhdWx0VmFsdWUgU2V0IGEgZGVmYXVsdCB2YWx1ZSB0byByZXR1cm4gaWYgdmFsdWUgaXMgbm90IGZvdW5kXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTdG9yYWdlR2V0dGVyKHN0b3JhZ2UsIHN0ZXBzOiBzdHJpbmdbXSwgZGVmYXVsdFZhbHVlOiBhbnkgPSBudWxsKTogYW55IHtcbiAgaWYgKElzT2JqZWN0KHN0b3JhZ2UsIHRydWUpKSB7XG4gICAgbGV0IHBhdGhMZW5ndGggPSBzdGVwcy5sZW5ndGg7XG4gICAgbGV0IHBhdGg6IHN0cmluZztcbiAgICB3aGlsZSAocGF0aExlbmd0aCkge1xuICAgICAgcGF0aCA9IHN0ZXBzLnNoaWZ0KCk7XG4gICAgICBpZiAoIXN0b3JhZ2VbcGF0aF0pIHtcbiAgICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcbiAgICAgIH1cbiAgICAgIHN0b3JhZ2UgPSBzdG9yYWdlW3BhdGhdO1xuICAgICAgcGF0aExlbmd0aC0tO1xuICAgIH1cbiAgICBpZiAoIXN0b3JhZ2UpIHtcbiAgICAgIHJldHVybiBkZWZhdWx0VmFsdWU7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBkZWZhdWx0VmFsdWU7XG4gIH1cblxuICByZXR1cm4gc3RvcmFnZTtcbn1cblxuLyoqXG4gKiBIZWxwZXIgdG8gc2V0IGEgc3RvcmFnZSBjb250YWluZXIgaW50byBhIG5lc3RlZCBsb2NhdGlvbiBpbiBhbiBvYmplY3RcbiAqIEBwYXJhbSBzdG9yYWdlIC0gVGhlIGJhc2Ugb2JqZWN0IHlvdSB3YW50IHRvIHJlYWNoIGludG9cbiAqIEBwYXJhbSBzdGVwcyAgLSB0aGUgbmVzdGVkIHBhdGggdG8gdGhlIGZpbmQgdGhlIHZhbHVlIHlvdSBhcmUgbG9va2luZyBmb3JcbiAqIEBwYXJhbSBkZWZhdWx0VmFsdWUgU2V0IGEgZGVmYXVsdCB2YWx1ZSB0byByZXR1cm4gaWYgdmFsdWUgaXMgbm90IGZvdW5kXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTdG9yYWdlU2V0dGVyKHN0b3JhZ2UsIHN0ZXBzOiBzdHJpbmdbXSk6IG9iamVjdCB8IG51bGwge1xuICBsZXQgcGF0aExlbmd0aCA9IHN0ZXBzLmxlbmd0aDtcbiAgbGV0IHBhdGg6IHN0cmluZztcbiAgd2hpbGUgKHBhdGhMZW5ndGgpIHtcbiAgICBwYXRoID0gc3RlcHMuc2hpZnQoKTtcbiAgICBpZiAoIXN0b3JhZ2VbcGF0aF0pIHtcbiAgICAgIHN0b3JhZ2VbcGF0aF0gPSB7fTtcbiAgICB9XG4gICAgc3RvcmFnZSA9IHN0b3JhZ2VbcGF0aF07XG4gICAgcGF0aExlbmd0aC0tO1xuICB9XG4gIHJldHVybiBzdG9yYWdlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gU2xlZXAobWlsbGlzZWNvbmRzKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgbWlsbGlzZWNvbmRzKSk7XG59XG5cblxuLyoqXG4gKiBTb3J0IGhlbHBlciBmb3IgYSBsaXN0IG9mIG9iamVjdHMgd2hlcmUgdGhlIHNvcnQgbmVlZHMgdG8gYmUgZG9uZSBvbiBhIHNwZWNpZmljIHByb3BlcnR5XG4gKiBAcGFyYW0ga2V5XG4gKiBAcGFyYW0gb3JkZXJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIER5bmFtaWNTb3J0KGtleSwgb3JkZXIgPSAnYXNjJykge1xuICByZXR1cm4gZnVuY3Rpb24gKGEsIGIpIHtcbiAgICBpZiAoIWEuaGFzT3duUHJvcGVydHkoa2V5KSB8fCAhYi5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAvLyBwcm9wZXJ0eSBkb2Vzbid0IGV4aXN0IG9uIGVpdGhlciBvYmplY3RcbiAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICBjb25zdCB2YXJBID0gKHR5cGVvZiBhW2tleV0gPT09ICdzdHJpbmcnKSA/XG4gICAgICBhW2tleV0udG9VcHBlckNhc2UoKSA6IGFba2V5XTtcbiAgICBjb25zdCB2YXJCID0gKHR5cGVvZiBiW2tleV0gPT09ICdzdHJpbmcnKSA/XG4gICAgICBiW2tleV0udG9VcHBlckNhc2UoKSA6IGJba2V5XTtcblxuICAgIGxldCBjb21wYXJpc29uID0gMDtcbiAgICBpZiAodmFyQSA+IHZhckIpIHtcbiAgICAgIGNvbXBhcmlzb24gPSAxO1xuICAgIH0gZWxzZSBpZiAodmFyQSA8IHZhckIpIHtcbiAgICAgIGNvbXBhcmlzb24gPSAtMTtcbiAgICB9XG4gICAgcmV0dXJuIChcbiAgICAgIChvcmRlciA9PSAnZGVzYycpID8gKGNvbXBhcmlzb24gKiAtMSkgOiBjb21wYXJpc29uXG4gICAgKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBDaGVjayBpZiB0aGUgdmFsdWVzIG9mIHR3byBhcnJheXMgY29udGFpbiB0aGUgc2FtZSBpdGVtc1xuICogVGhpcyBpcyB3YXkgdG8gZ2V0IGFyb3VuZCB0aGUgb3JkZXIgbm90IGJlaW5nIHRoZSBzYW1lLCBidXQgdGhlIGl0ZW1zIGFyZSB0aGUgc2FtZVxuICogQHBhcmFtIGFycjFcbiAqIEBwYXJhbSBhcnIyXG4gKiBAcGFyYW0gZmllbGRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEFycmF5c01hdGNoKGFycjE6IGFueVtdLCBhcnIyOiBhbnlbXSwgZmllbGQ6IHN0cmluZykge1xuICBpZiAoYXJyMS5sZW5ndGggIT09IGFycjIubGVuZ3RoKVxuICAgIHJldHVybiBmYWxzZTtcbiAgaWYgKGZpZWxkKSB7XG4gICAgZm9yIChsZXQgaSA9IGFycjEubGVuZ3RoOyBpLS07KSB7XG4gICAgICBpZiAoYXJyMVtpXVtmaWVsZF0gIT09IGFycjJbaV1bZmllbGRdKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGZvciAobGV0IGkgPSBhcnIxLmxlbmd0aDsgaS0tOykge1xuICAgICAgaWYgKGFycjFbaV0gIT09IGFycjJbaV0pXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuXG4gIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIENoZWNrIGlmIGFuIGFycmF5IGNvbnRhaW5zIGEgbGlzdCBvZiBrZXk6dmFsdWUgcGFpcnNcbiAqIEBwYXJhbSBuZWVkbGVzXG4gKiBAcGFyYW0gaGF5c3RhY2tcbiAqIEBwYXJhbSBzdHJpY3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEFycmF5Q29udGFpbnNBbGwobmVlZGxlczogQXJyYXk8c3RyaW5nPiwgaGF5c3RhY2s6IEFycmF5PHN0cmluZz4sIHN0cmljdDogYm9vbGVhbiA9IGZhbHNlKSB7XG4gIGhheXN0YWNrID0gaGF5c3RhY2subWFwKGZ1bmN0aW9uIChoYXkpIHtcbiAgICByZXR1cm4gU3RyaW5nKGhheSkudG9Mb3dlckNhc2UoKS50cmltKCk7XG4gIH0pO1xuICBpZiAoc3RyaWN0KSB7XG4gICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IG5lZWRsZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIG5lZWRsZXNbaV0gPSBTdHJpbmcobmVlZGxlc1tpXSkudG9Mb3dlckNhc2UoKS50cmltKCk7XG4gICAgICBpZiAoaGF5c3RhY2suaW5kZXhPZihuZWVkbGVzW2ldKSA9PT0gLTEpIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgbmVlZCA9IG5lZWRsZXMubGVuZ3RoO1xuICAgIGxldCBtYXRjaDogYm9vbGVhbjtcbiAgICBsZXQgbWV0ID0gMDtcbiAgICBuZWVkbGVzLmZvckVhY2goZnVuY3Rpb24gKG5lZWRsZSkge1xuICAgICAgLy8gbG9vcCBvdmVyIHRoZSBibGFja2xpc3RlZCB0ZXJtc1xuICAgICAgbWF0Y2ggPSBudWxsO1xuICAgICAgaGF5c3RhY2suc29tZShmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgIGlmIChTdHJpbmcoc3RyKS50b0xvd2VyQ2FzZSgpLnRyaW0oKS5pbmRleE9mKG5lZWRsZSkgPiAtMSkge1xuICAgICAgICAgIG1hdGNoID0gdHJ1ZTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgbWV0Kys7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIG1ldCA+PSBuZWVkO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIG1hcCBvZiBhbiBhcnJheSBvZiBvYmplY3RzIHVzaW5nIGEgc3BlY2lmaWMgcHJvcGVydHlcbiAqIEBwYXJhbSBhcnJcbiAqIEBwYXJhbSBhcnJheV9rZXlfZmllbGRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEFycmF5TWFwU2V0dGVyKGFycjogYW55W10sIGFycmF5X2tleV9maWVsZCkge1xuICBjb25zdCBtYXAgPSB7fTtcbiAgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkge1xuICAgIGFyci5mb3JFYWNoKCh2YWx1ZSwgaW5kZXgpID0+IHtcbiAgICAgIGlmICh2YWx1ZVthcnJheV9rZXlfZmllbGRdKSBtYXBbdmFsdWVbYXJyYXlfa2V5X2ZpZWxkXV0gPSBpbmRleDtcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiBtYXA7XG59XG5cbi8qKlxuICogU29ydCBhbiBhcnJheSBieSBhIHBhcmVudF9pZFxuICogQHBhcmFtIGFyclxuICogQHBhcmFtIHBhcmVudElkXG4gKiBAcGFyYW0gcmVzdWx0XG4gKiBAcGFyYW0gaXRlbUtleVxuICogQHBhcmFtIHBhcmVudEtleVxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBBcnJheVBhcmVudFNvcnQoYXJyOiBhbnlbXSwgcGFyZW50SWQgPSAwLCByZXN1bHQgPSBbXSwgaXRlbUtleSA9ICdpZCcsIHBhcmVudEtleSA9ICdwYXJlbnRfaWQnKSB7XG4gIGlmIChJc0FycmF5KGFyciwgdHJ1ZSkpIHtcbiAgICBhcnIubWFwKGl0ZW0gPT4ge1xuICAgICAgaWYgKCtpdGVtW3BhcmVudEtleV0gPT09ICtwYXJlbnRJZCkge1xuICAgICAgICByZXN1bHQucHVzaChpdGVtKTtcbiAgICAgICAgQXJyYXlQYXJlbnRTb3J0KGFyciwgaXRlbVtpdGVtS2V5XSwgcmVzdWx0LCBpdGVtS2V5LCBwYXJlbnRLZXkpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogQ29udmVydCBhbiBhcnJheSB0byBhIG5lc3RlZCBhcnJheVxuICogQHBhcmFtIGRhdGFcbiAqIEBwYXJhbSBpdGVtS2V5XG4gKiBAcGFyYW0gcGFyZW50S2V5XG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEFycmF5VHJlZUxpc3QoZGF0YTogYW55W10sIGl0ZW1LZXkgPSAnaWQnLCBwYXJlbnRLZXkgPSAncGFyZW50X2lkJykge1xuICBjb25zdCBtYXAgPSB7fTtcbiAgY29uc3Qgcm9vdHMgPSBbXTtcbiAgbGV0IG5vZGU7XG4gIGxldCBpO1xuXG4gIGZvciAoaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgbWFwW2RhdGFbaV1baXRlbUtleV1dID0gaTsgLy8gaW5pdGlhbGl6ZSB0aGUgbWFwXG4gICAgZGF0YVtpXS5jaGlsZHJlbiA9IFtdOyAvLyBpbml0aWFsaXplIHRoZSBjaGlsZHJlblxuICB9XG5cbiAgZm9yIChpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpICs9IDEpIHtcbiAgICBub2RlID0gZGF0YVtpXTtcbiAgICBpZiAobm9kZVtwYXJlbnRLZXldICE9PSAwKSB7XG4gICAgICAvLyBpZiB5b3UgaGF2ZSBkYW5nbGluZyBicmFuY2hlcyBjaGVjayB0aGF0IG1hcFtub2RlLnBhcmVudElkXSBleGlzdHNcbiAgICAgIGRhdGFbbWFwW25vZGVbcGFyZW50S2V5XV1dLmNoaWxkcmVuLnB1c2gobm9kZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJvb3RzLnB1c2gobm9kZSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByb290cztcbn1cblxuLyoqXG4gKiBGbGF0dGVuIGFuIGFycmF5IHRoYXQgaGFzIHBhcmVudC9jaGlsZCByZWxhdGlvbnNoaXBcbiAqIEBwYXJhbSBsaXN0XG4gKiBAcGFyYW0gcmVzdWx0XG4gKiBAcGFyYW0gbGV2ZWxcbiAqIEBwYXJhbSBpdGVtS2V5XG4gKiBAcGFyYW0gcGFyZW50S2V5XG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEFycmF5UGFyZW50VHJlZUZsYXR0ZW4obGlzdDogYW55W10sIHJlc3VsdCA9IFtdLCBsZXZlbCA9IDAsIGl0ZW1LZXkgPSAnaWQnLCBwYXJlbnRLZXkgPSAncGFyZW50X2lkJykge1xuICBsZXQgY2hpbGRyZW47XG4gIGlmIChJc0FycmF5KGxpc3QsIHRydWUpKSB7XG4gICAgbGlzdC5tYXAoKGl0ZW0pID0+IHtcbiAgICAgIGNoaWxkcmVuID0gaXRlbS5jaGlsZHJlbjtcbiAgICAgIGRlbGV0ZSBpdGVtLmNoaWxkcmVuO1xuICAgICAgaXRlbS5sZXZlbCA9IGxldmVsO1xuICAgICAgcmVzdWx0LnB1c2goaXRlbSk7XG4gICAgICBpZiAoSXNBcnJheShjaGlsZHJlbiwgdHJ1ZSkpIHtcbiAgICAgICAgQXJyYXlQYXJlbnRUcmVlRmxhdHRlbihjaGlsZHJlbiwgcmVzdWx0LCBsZXZlbCArIDEpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogQ3JlYXRlIGFuIGFycmF5IHdpdGggcGFyZW50IGNoaWxkIHJlbGF0aW9uc1xuICogQHBhcmFtIGRhdGFcbiAqIEBwYXJhbSBwYXJlbnRJZFxuICogQHBhcmFtIHJlc3VsdFxuICogQHBhcmFtIHRyZWVcbiAqIEBwYXJhbSBpdGVtS2V5XG4gKiBAcGFyYW0gcGFyZW50S2V5XG4gKiBAcGFyYW0gZmxhdHRlblxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBBcnJheVBhcmVudFRyZWUoZGF0YTogYW55W10sIHBhcmVudElkID0gMCwgcmVzdWx0ID0gW10sIHRyZWU/OiBhbnlbXSwgaXRlbUtleSA9ICdpZCcsIHBhcmVudEtleSA9ICdwYXJlbnRfaWQnLCBmbGF0dGVuID0gZmFsc2UpIHtcbiAgZGF0YSA9IEFycmF5UGFyZW50U29ydChkYXRhLCBwYXJlbnRJZCwgcmVzdWx0LCBpdGVtS2V5LCBwYXJlbnRLZXkpO1xuICBkYXRhID0gQXJyYXlUcmVlTGlzdChkYXRhLCBpdGVtS2V5LCBwYXJlbnRLZXkpO1xuICByZXR1cm4gZGF0YTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBtYXAgb2YgbGlzdCBvZiBvYmplY3Qga2V5ZWQgYnkgYW4gb2JqZWN0IHByb3BlcnR5XG4gKiBAcGFyYW0gYXJyXG4gKiBAcGFyYW0gYXJyYXlfa2V5X2ZpZWxkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBBcnJheUtleUJ5KGFycjogYW55W10sIGtleTogc3RyaW5nKSB7XG4gIGNvbnN0IGtleUJ5ID0ge307XG4gIGlmIChJc0FycmF5KGFyciwgdHJ1ZSkgJiYgSXNTdHJpbmcoa2V5LCB0cnVlKSkge1xuICAgIGFyci5tYXAoeCA9PiB7XG4gICAgICBpZiAoSXNEZWZpbmVkKHhba2V5XSkpIGtleUJ5W3hba2V5XV0gPSB4O1xuICAgIH0pO1xuICB9XG4gIHJldHVybiBrZXlCeTtcbn1cblxuXG4vKipcbiAqIERldGVybWluZSBpZiBhbiBvYmplY3QgaXMgYW4gYXJyYXlcbiAqIEBwYXJhbSBhcnJcbiAqIEBwYXJhbSByZXF1aXJlTGVuZ3RoIC0gUmVxdWlyZXMgdGhhdCBpdCBpcyBhbiBhcnJheSBidXQgYWxzbyBoYXMgdmFsdWVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBJc0FycmF5KGFycjogYW55LCByZXF1aXJlTGVuZ3RoID0gZmFsc2UpOiBib29sZWFuIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkge1xuICAgIGlmIChyZXF1aXJlTGVuZ3RoKSB7XG4gICAgICBpZiAoYXJyLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gSXNBcnJheVRocm93RXJyb3IoYXJyOiBhbnksIHJlcXVpcmVMZW5ndGggPSBmYWxzZSwgdGhyb3dFcnJvcjogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGNvbnN0IGlzQXJyYXkgPSBJc0FycmF5KGFyciwgcmVxdWlyZUxlbmd0aCk7XG4gIGlmICghaXNBcnJheSkge1xuICAgIGlmIChJc09iamVjdChQb3BMb2cpKSB7XG4gICAgICBpZiAoUG9wTG9nLmVuYWJsZWQoJ2Vycm9yJykpIHtcbiAgICAgICAgY29uc29sZS5sb2coUG9wTG9nLm1lc3NhZ2UoYElzQXJyYXlFcnJvcjogRmFpbGApLCBQb3BMb2cuY29sb3IoJ2Vycm9yJyksIHtcbiAgICAgICAgICBkYXRhOiBhcnIsXG4gICAgICAgICAgcmVxdWlyZUxlbmd0aDogcmVxdWlyZUxlbmd0aCxcbiAgICAgICAgICBuYW1lOiB0aHJvd0Vycm9yXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRocm93IG5ldyBFcnJvcih0aHJvd0Vycm9yKTtcbiAgfVxuICByZXR1cm4gaXNBcnJheTtcbn1cblxuXG4vKipcbiAqIENvbnZlcnQgYW4gT2JqZWN0IHRvIGFuIEFycmF5XG4gKiBAcGFyYW0gb2JqXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBUb0FycmF5KG9iajogb2JqZWN0KTogYW55W10ge1xuICBpZiAodHlwZW9mIG9iaiA9PT0gJ29iamVjdCcgJiYgT2JqZWN0LmtleXMob2JqKS5sZW5ndGgpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMob2JqKS5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgICAgcmV0dXJuIG9ialtrZXldO1xuICAgIH0pO1xuICB9XG4gIHJldHVybiBbXTtcbn1cblxuLyoqXG4gKiBDaGVjayBpZiBhIHZhciBpcyB1bmRlZmluZWRcbiAqIEBwYXJhbSB4XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBJc1VuZGVmaW5lZCh4OiBhbnkpOiBib29sZWFuIHtcbiAgaWYgKHR5cGVvZiB4ID09PSAndW5kZWZpbmVkJykgcmV0dXJuIHRydWU7XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBDaGVjayBpZiBhIHZhciBpcyBkZWZpbmVkXG4gKiBAcGFyYW0geFxuICovXG5leHBvcnQgZnVuY3Rpb24gSXNEZWZpbmVkKHg6IGFueSwgYWxsb3dOdWxsID0gdHJ1ZSk6IGJvb2xlYW4ge1xuICBpZiAoeCA9PT0gbnVsbCAmJiAhYWxsb3dOdWxsKSByZXR1cm4gZmFsc2U7XG4gIGlmICh0eXBlb2YgeCA9PT0gJ3VuZGVmaW5lZCcpIHJldHVybiBmYWxzZTtcbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogQ29udmVydCBhbiBBcnJheSB0byBhbiBvYmplY3RcbiAqIEBwYXJhbSBvYmpcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFRvT2JqZWN0KGFycjogYW55W10pIHtcbiAgaWYgKGFyciAmJiBBcnJheS5pc0FycmF5KGFycikgJiYgYXJyLmxlbmd0aCkge1xuICAgIGNvbnN0IHJ2ID0ge307XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyArK2kpXG4gICAgICBydltpXSA9IGFycltpXTtcbiAgICByZXR1cm4gcnY7XG4gIH1cbiAgcmV0dXJuIGFycjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIE9iamVjdHNNYXRjaCh4LCB5KSB7XG4gIGlmICh4ID09PSBudWxsIHx8IHggPT09IHVuZGVmaW5lZCB8fCB5ID09PSBudWxsIHx8IHkgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiB4ID09PSB5O1xuICB9XG4gIC8vIGFmdGVyIHRoaXMganVzdCBjaGVja2luZyB0eXBlIG9mIG9uZSB3b3VsZCBiZSBlbm91Z2hcbiAgaWYgKHguY29uc3RydWN0b3IgIT09IHkuY29uc3RydWN0b3IpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgLy8gaWYgdGhleSBhcmUgZnVuY3Rpb25zLCB0aGV5IHNob3VsZCBleGFjdGx5IHJlZmVyIHRvIHNhbWUgb25lIChiZWNhdXNlIG9mIGNsb3N1cmVzKVxuICBpZiAoeCBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG4gICAgcmV0dXJuIHggPT09IHk7XG4gIH1cbiAgLy8gaWYgdGhleSBhcmUgcmVnZXhwcywgdGhleSBzaG91bGQgZXhhY3RseSByZWZlciB0byBzYW1lIG9uZSAoaXQgaXMgaGFyZCB0byBiZXR0ZXIgZXF1YWxpdHkgY2hlY2sgb24gY3VycmVudCBFUylcbiAgaWYgKHggaW5zdGFuY2VvZiBSZWdFeHApIHtcbiAgICByZXR1cm4geCA9PT0geTtcbiAgfVxuICBpZiAoeCA9PT0geSB8fCB4LnZhbHVlT2YoKSA9PT0geS52YWx1ZU9mKCkpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBpZiAoQXJyYXkuaXNBcnJheSh4KSAmJiB4Lmxlbmd0aCAhPT0geS5sZW5ndGgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBpZiB0aGV5IGFyZSBkYXRlcywgdGhleSBtdXN0IGhhZCBlcXVhbCB2YWx1ZU9mXG4gIGlmICh4IGluc3RhbmNlb2YgRGF0ZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIGlmIHRoZXkgYXJlIHN0cmljdGx5IGVxdWFsLCB0aGV5IGJvdGggbmVlZCB0byBiZSBvYmplY3QgYXQgbGVhc3RcbiAgaWYgKCEoeCBpbnN0YW5jZW9mIE9iamVjdCkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKCEoeSBpbnN0YW5jZW9mIE9iamVjdCkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyByZWN1cnNpdmUgb2JqZWN0IGVxdWFsaXR5IGNoZWNrXG4gIGNvbnN0IHAgPSBPYmplY3Qua2V5cyh4KTtcbiAgcmV0dXJuIE9iamVjdC5rZXlzKHkpLmV2ZXJ5KGZ1bmN0aW9uIChpKSB7XG4gICAgICByZXR1cm4gcC5pbmRleE9mKGkpICE9PSAtMTtcbiAgICB9KSAmJlxuICAgIHAuZXZlcnkoZnVuY3Rpb24gKGkpIHtcbiAgICAgIHJldHVybiBPYmplY3RzTWF0Y2goeFtpXSwgeVtpXSk7XG4gICAgfSk7XG59XG5cbi8qKlxuICogQ2hlY2sgZm9yIGEgcXVhbGlmaWVkIG9iamVjdFxuICogQHBhcmFtIHZhbHVlXG4gKiBAcGFyYW0gcmVxdWlyZUtleXNcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5leHBvcnQgZnVuY3Rpb24gSXNPYmplY3QodmFsdWU6IGFueSwgcmVxdWlyZUtleXM6IGJvb2xlYW4gfCBzdHJpbmdbXSA9IGZhbHNlKTogYm9vbGVhbiB7XG4gIGlmICghQXJyYXkuaXNBcnJheSh2YWx1ZSkgJiYgdmFsdWUgIT09IG51bGwgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgIGlmIChyZXF1aXJlS2V5cykge1xuICAgICAgaWYgKHR5cGVvZiByZXF1aXJlS2V5cyA9PT0gJ2Jvb2xlYW4nICYmIE9iamVjdC5rZXlzKHZhbHVlKS5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9IGVsc2UgaWYgKElzQXJyYXkocmVxdWlyZUtleXMsIHRydWUpKSB7XG4gICAgICAgIGxldCBwYXNzID0gdHJ1ZTtcbiAgICAgICAgY29uc3Qga2V5cyA9IDxzdHJpbmdbXT5yZXF1aXJlS2V5cztcbiAgICAgICAga2V5cy5zb21lKChrZXkpID0+IHtcbiAgICAgICAgICBpZiAoIShrZXkgaW4gdmFsdWUpKSBwYXNzID0gZmFsc2U7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoIXBhc3MpIHJldHVybiBmYWxzZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5cbi8qKlxuICogQ2hlY2sgZm9yIGEgcXVhbGlmaWVkIGZ1bmN0aW9uXG4gKiBAcGFyYW0gdmFsdWVcbiAqIEBwYXJhbSByZXF1aXJlS2V5c1xuICogQGNvbnN0cnVjdG9yXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBJc0NhbGxhYmxlRnVuY3Rpb24oZm46IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gdHlwZW9mIGZuID09PSAnZnVuY3Rpb24nO1xufVxuXG4vKipcbiAqIFJlbW92ZSBlbXB0eSB2YWx1ZXMgZnJvbSBhbiBvYmplY3RcbiAqIEBwYXJhbSBvYmpcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5leHBvcnQgZnVuY3Rpb24gQ2xlYW5PYmplY3Qob2JqOiBPYmplY3QsIG9wdGlvbnM6IHsgd2hpdGVsaXN0Pzogc3RyaW5nW10sIGJsYWNrbGlzdD86IHN0cmluZ1tdLCBhbGlhcz86IERpY3Rpb25hcnk8c3RyaW5nPiB9ID0ge30pIHtcbiAgaWYgKCEoSXNBcnJheShvcHRpb25zLndoaXRlbGlzdCkpKSBvcHRpb25zLndoaXRlbGlzdCA9IFtdO1xuICBpZiAoIShJc0FycmF5KG9wdGlvbnMuYmxhY2tsaXN0KSkpIG9wdGlvbnMuYmxhY2tsaXN0ID0gW107XG4gIGlmICghKElzT2JqZWN0KG9wdGlvbnMuYWxpYXMpKSkgb3B0aW9ucy5hbGlhcyA9IHt9O1xuICBmb3IgKGNvbnN0IHByb3BOYW1lIGluIG9iaikge1xuICAgIGlmICghKG9wdGlvbnMud2hpdGVsaXN0LmluY2x1ZGVzKHByb3BOYW1lKSkgJiYgKG9ialtwcm9wTmFtZV0gPT09IG51bGwgfHwgb2JqW3Byb3BOYW1lXSA9PT0gdW5kZWZpbmVkIHx8IG9wdGlvbnMuYmxhY2tsaXN0LmluY2x1ZGVzKHByb3BOYW1lKSkpIHtcbiAgICAgIGRlbGV0ZSBvYmpbcHJvcE5hbWVdO1xuICAgIH1cbiAgICBpZiAocHJvcE5hbWUgaW4gb3B0aW9ucy5hbGlhcyAmJiBJc1N0cmluZyhvcHRpb25zLmFsaWFzW3Byb3BOYW1lXSwgdHJ1ZSkpIHtcbiAgICAgIG9ialtvcHRpb25zLmFsaWFzW3Byb3BOYW1lXV0gPSBvYmpbcHJvcE5hbWVdO1xuICAgICAgZGVsZXRlIG9ialtwcm9wTmFtZV07XG4gICAgfVxuICB9XG4gIHJldHVybiBvYmo7XG59XG5cbi8qKlxuICogQSBoZWxwZXIgZnVuY3Rpb24gdG8gZGV0ZXJtaW5lIGlmIGEgdmFyaWFibGUgaXMgYSBxdWFsaWZpZWQgb2JqZWN0XG4gKlxuICogQHBhcmFtIHZhbHVlXG4gKiBAcGFyYW0gcmVxdWlyZUtleXNcbiAqIEBwYXJhbSB0aHJvd0Vycm9yXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBJc09iamVjdFRocm93RXJyb3IodmFsdWU6IGFueSwgcmVxdWlyZUtleXM6IGJvb2xlYW4gfCBzdHJpbmdbXSA9IGZhbHNlLCB0aHJvd0Vycm9yOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgY29uc3QgaXNPYmplY3QgPSBJc09iamVjdCh2YWx1ZSwgcmVxdWlyZUtleXMpO1xuICBpZiAoIWlzT2JqZWN0ICYmIHRocm93RXJyb3IpIHtcbiAgICBpZiAoSXNPYmplY3QoUG9wTG9nKSkge1xuICAgICAgaWYgKFBvcExvZy5lbmFibGVkKCdlcnJvcicpKSB7XG4gICAgICAgIGlmIChQb3BUZW1wbGF0ZSkge1xuICAgICAgICAgIGlmIChpc0Rldk1vZGUoKSAmJiAhKElzT2JqZWN0KFBvcEF1dGgsIFsndG9rZW4nXSkpKSB7XG4gICAgICAgICAgICBQb3BUZW1wbGF0ZS5lcnJvcih7bWVzc2FnZTogYCR7dGhyb3dFcnJvcn0sIHRoaXMgbWF5IGJlIGR1ZSB0byBub3QgYmVpbmcgYXV0aGVudGljYXRlZC5gLCBjb2RlOiA1MDB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coUG9wTG9nLm1lc3NhZ2UoYElzT2JqZWN0RXJyb3I6IEZhaWxgKSwgUG9wTG9nLmNvbG9yKCdlcnJvcicpLCB7XG4gICAgICAgICAgZGF0YTogdmFsdWUsXG4gICAgICAgICAgcmVxdWlyZUtleXM6IHJlcXVpcmVLZXlzLFxuICAgICAgICAgIG5hbWU6IHRocm93RXJyb3JcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhyb3cgbmV3IEVycm9yKHRocm93RXJyb3IpO1xuICB9XG5cbiAgcmV0dXJuIGlzT2JqZWN0O1xufVxuXG4vKipcbiAqIENoZWNrIGZvciBhIHF1YWxpZmllZCBudW1iZXJcbiAqIEBwYXJhbSB2YWx1ZVxuICogQHBhcmFtIHJlcXVpcmVUcnV0aHlcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBJc051bWJlcih2YWx1ZTogYW55LCByZXF1aXJlVHJ1dGh5PzogYm9vbGVhbik6IGJvb2xlYW4ge1xuICBpZiAoKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgfHwgdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykgJiYgU3RyaW5nKHZhbHVlKS5sZW5ndGggJiYgIWlzTmFOKE51bWJlcih2YWx1ZS50b1N0cmluZygpKSkpIHtcbiAgICBpZiAocmVxdWlyZVRydXRoeSkge1xuICAgICAgaWYgKCt2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuXG4vKipcbiAqIENoZWNrIGZvciBhIHF1YWxpZmllZCBzdHJpbmdcbiAqIEBwYXJhbSB2YWx1ZVxuICogQHBhcmFtIHJlcXVpcmVMZW5ndGhcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5leHBvcnQgZnVuY3Rpb24gSXNTdHJpbmcodmFsdWU6IGFueSwgcmVxdWlyZUxlbmd0aCA9IGZhbHNlKTogYm9vbGVhbiB7XG4gIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmICEoSXNOdW1iZXIodmFsdWUpKSkge1xuICAgIGlmIChyZXF1aXJlTGVuZ3RoKSB7XG4gICAgICBpZiAoU3RyaW5nKHZhbHVlKS5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKlxuICogQSBoZWxwZXIgZnVuY3Rpb24gdG8gZGV0ZXJtaW5lIGlmIGEgdmFyaWFibGUgaXMgYSBxdWFsaWZpZWQgc3RyaW5nXG4gKiBAcGFyYW0gdmFsdWVcbiAqIEBwYXJhbSByZXF1aXJlTGVuZ3RoXG4gKiBAcGFyYW0gdGhyb3dFcnJvclxuICovXG5leHBvcnQgZnVuY3Rpb24gSXNTdHJpbmdFcnJvcih2YWx1ZTogYW55LCByZXF1aXJlTGVuZ3RoID0gZmFsc2UsIHRocm93RXJyb3I6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBjb25zdCBpc1N0cmluZyA9IElzU3RyaW5nKHZhbHVlLCByZXF1aXJlTGVuZ3RoKTtcbiAgaWYgKCFpc1N0cmluZyAmJiB0aHJvd0Vycm9yKSB7XG4gICAgaWYgKElzT2JqZWN0KFBvcExvZykpIHtcbiAgICAgIGlmIChQb3BMb2cuZW5hYmxlZCgnZXJyb3InKSkge1xuICAgICAgICBjb25zb2xlLmxvZyhQb3BMb2cubWVzc2FnZShgSXNTdHJpbmdFcnJvcjogRmFpbGApLCBQb3BMb2cuY29sb3IoJ2Vycm9yJyksIHtcbiAgICAgICAgICBkYXRhOiB2YWx1ZSxcbiAgICAgICAgICByZXF1aXJlTGVuZ3RoOiByZXF1aXJlTGVuZ3RoLFxuICAgICAgICAgIG5hbWU6IHRocm93RXJyb3JcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcih0aHJvd0Vycm9yKTtcbiAgfVxuICByZXR1cm4gaXNTdHJpbmc7XG59XG5cbi8qKlxuICogQ2FwaXRhbGl6ZSB0aGUgZmlyc3QgTGV0dGVyIG9mIGV2ZXJ5IHdvcmQgaW4gYSBzdHJpbmdcbiAqIEBwYXJhbSBzdHJcbiAqIEByZXR1cm5zIHN0clxuICovXG5leHBvcnQgZnVuY3Rpb24gVGl0bGVDYXNlKHN0cjogc3RyaW5nKSB7XG4gIGlmIChJc1N0cmluZyhzdHIsIHRydWUpKSB7XG4gICAgc3RyID0gU3RyaW5nUmVwbGFjZUFsbChzdHIsICdfJywgJyAnKTsgIC8vIGNvbnZlcnQgdW5kZXJzY29yZXMgdG8gc3BhY2VzXG4gICAgc3RyID0gU3RyaW5nKHN0cikucmVwbGFjZSgvXFx3XFxTKi9nLCAodHh0KSA9PiB7XG4gICAgICByZXR1cm4gdHh0LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgdHh0LnN1YnN0cigxKS50b0xvd2VyQ2FzZSgpOyAvLyBjYXBpdGFsaXplIGZpcnN0IGxldHRlciBvZiB3b3Jkc1xuICAgIH0pO1xuICAgIHN0ciA9IHN0ci5yZXBsYWNlKC8oXnxbXFxzLV0pXFxTL2csIGZ1bmN0aW9uIChtYXRjaCkgeyAvLyBjYXBpdGFsaXplIGxldHRlcnMgYWZ0ZXIgaHlwaGVuc1xuICAgICAgcmV0dXJuIG1hdGNoLnRvVXBwZXJDYXNlKCk7XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIHN0cjtcbn1cblxuLyoqXG4gKiBDYXBpdGFsaXplIHRoZSBmaXJzdCBMZXR0ZXIgb2YgZXZlcnkgd29yZCBpbiBhIHN0cmluZ1xuICogQHBhcmFtIHN0clxuICogQHJldHVybnMgc3RyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBDYXBpdGFsaXplKHN0cjogc3RyaW5nKSB7XG4gIGlmIChJc1N0cmluZyhzdHIsIHRydWUpKSB7XG4gICAgc3RyID0gc3RyLnRyaW0oKTtcbiAgICBzdHIgPSBTdHJpbmdSZXBsYWNlQWxsKHN0ciwgJ18nLCAnICcpOyAgLy8gY29udmVydCB1bmRlcnNjb3JlcyB0byBzcGFjZXNcbiAgICBzdHIgPSBTdHJpbmdSZXBsYWNlQWxsKHN0ciwgJ1xcJycsICcnKTsgIC8vIGNvbnZlcnQgJyB0byBzcGFjZXNcbiAgICBzdHIgPSBzdHIuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdHIuc2xpY2UoMSkudG9Mb3dlckNhc2UoKTtcbiAgfVxuICByZXR1cm4gc3RyO1xufVxuXG4vKipcbiAqIENvbnZlcnQgYSBzdHJpbmcgZnJvbSBzbmFrZSBjYXNlIHRvIFBhc2NhbCBDYXNlXG4gKiBAcGFyYW0gZmllbGRcbiAqIEByZXR1cm5zIHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gU25ha2VUb1Bhc2NhbChmaWVsZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgaWYgKElzU3RyaW5nKGZpZWxkLCB0cnVlKSkge1xuICAgIGNvbnN0IHdvcmRzID0gZmllbGQuc3BsaXQoJ18nKTtcbiAgICBsZXQgdmFsaWRGaWVsZCA9ICcnO1xuICAgIGZvciAoY29uc3Qgd29yZCBvZiB3b3Jkcykge1xuICAgICAgdmFsaWRGaWVsZCArPSB3b3JkLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgd29yZC5zbGljZSgxKSArICcgJztcbiAgICB9XG4gICAgcmV0dXJuIFN0cmluZyh2YWxpZEZpZWxkKS50cmltKCk7XG4gIH1cbiAgcmV0dXJuIGZpZWxkO1xuXG59XG5cbi8qKlxuICogQ29udmVydCBhIHN0cmluZyB3aXRoIHNwYWNlcyB0byBzbmFrZSBjYXNlIC4uICd0aGlzIGlzIHNuYWtlIGNhc2UnIHRvICd0aGlzX2lzX3NuYWtlX2Nhc2UnXG4gKiBAcGFyYW0gZmllbGRcbiAqIEByZXR1cm5zIHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gU3BhY2VUb1NuYWtlKHBhc2NhbDogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3Qgd29yZHMgPSBwYXNjYWwuc3BsaXQoJyAnKTtcbiAgZm9yIChsZXQgd29yZCBvZiB3b3Jkcykge1xuICAgIHdvcmQgPSBTdHJpbmcod29yZCkudG9Mb3dlckNhc2UoKTtcbiAgfVxuICByZXR1cm4gd29yZHMuam9pbignXycpO1xufVxuXG5cbi8qKlxuICogQ29udmVydCBhIHN0cmluZyB3aXRoIGh5cGhlbnMgdG8gUGFzY2FsIENhc2VcbiAqIEBwYXJhbSBmaWVsZFxuICogQHJldHVybnMgc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBIeXBoZW5Ub1Bhc2NhbChmaWVsZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3Qgd29yZHMgPSBmaWVsZC5zcGxpdCgnLScpO1xuICBsZXQgdmFsaWRGaWVsZCA9ICcnO1xuICBmb3IgKGNvbnN0IHdvcmQgb2Ygd29yZHMpIHtcbiAgICB2YWxpZEZpZWxkICs9IHdvcmQuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyB3b3JkLnNsaWNlKDEpICsgJyAnO1xuICB9XG4gIHJldHVybiB2YWxpZEZpZWxkO1xufVxuXG4vKipcbiAqIENvbnZlcnQgYSBzdHJpbmcgd2l0aCBzcGFjZXMgdG8gUGFzY2FsIENhc2VcbiAqIEBwYXJhbSBmaWVsZFxuICogQHJldHVybnMgc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTcGFjZVRvSHlwaGVuTG93ZXIoc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCB0bXAgPSBzdHIudHJpbSgpO1xuICByZXR1cm4gU3RyaW5nKFN0cmluZ1JlcGxhY2VBbGwodG1wLCAnICcsICctJykpLnRvTG93ZXJDYXNlKCk7XG59XG5cblxuLyoqXG4gKiBTdHJpbmcgcmVwbGFjZSBhbGxcbiAqIEBwYXJhbSBzdHJcbiAqIEBwYXJhbSBmaW5kXG4gKiBAcGFyYW0gcmVwbGFjZVxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTdHJpbmdSZXBsYWNlQWxsKHN0cjogc3RyaW5nLCBmaW5kOiBzdHJpbmcsIHJlcGxhY2U6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBzdHIucmVwbGFjZShuZXcgUmVnRXhwKGZpbmQsICdnJyksIHJlcGxhY2UpO1xufVxuXG5cbi8qKlxuICogU2VhcmNoIGZpbHRlciBoZWxwZXIgdG8gc2VlIGlmIGFuIG9iamVjdCBjb250YWlucyB0YWdzXG4gKiBAcGFyYW0gb2JqXG4gKiBAcGFyYW0gdGFnc1xuICogQHBhcmFtIG1hdGNoXG4gKiBAcGFyYW0gdmFsdWVzXG4gKiBAcGFyYW0gaGFzXG4gKiBAcGFyYW0gbm90XG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE9iamVjdENvbnRhaW5zVGFnU2VhcmNoKG9iaiwgdGFnczogc3RyaW5nLCBtYXRjaCA9IG51bGwsIHZhbHVlcyA9IG51bGwsIGhhcyA9IG51bGwsIG5vdCA9IG51bGwpIHtcbiAgaWYgKFN0cmluZyh0YWdzKS5sZW5ndGgpIHtcbiAgICBoYXMgPSBTdHJpbmcodGFncykudG9Mb3dlckNhc2UoKS5zcGxpdCgnLCcpLm1hcChmdW5jdGlvbiAoc3RyKSB7XG4gICAgICByZXR1cm4gc3RyLnRyaW0oKTtcbiAgICB9KS5maWx0ZXIoXG4gICAgICBpdGVtID0+IHtcbiAgICAgICAgcmV0dXJuIFN0cmluZyhpdGVtKS5sZW5ndGggJiYgU3RyaW5nKGl0ZW0pLmNoYXJBdCgwKSAhPT0gJyEnO1xuICAgICAgfVxuICAgICk7XG5cbiAgICBub3QgPSBTdHJpbmcodGFncykudG9Mb3dlckNhc2UoKS5zcGxpdCgnLCcpLm1hcCgoc3RyKSA9PiB7XG4gICAgICByZXR1cm4gc3RyLnRyaW0oKTtcbiAgICB9KS5maWx0ZXIoXG4gICAgICBpdGVtID0+IHtcbiAgICAgICAgcmV0dXJuIFN0cmluZyhpdGVtKS5sZW5ndGggPj0gMiAmJiBTdHJpbmcoaXRlbSkuY2hhckF0KDApID09PSAnISc7XG4gICAgICB9XG4gICAgKTtcbiAgICBub3QgPSBub3QubWFwKCh0YWcpID0+IHtcbiAgICAgIHJldHVybiBTdHJpbmdSZXBsYWNlQWxsKHRhZywgJyEnLCAnJyk7XG4gICAgfSkuZmlsdGVyKCh0YWcpID0+IHtcbiAgICAgIHJldHVybiB0YWcubGVuZ3RoID49IDE7XG4gICAgfSk7XG5cbiAgICBtYXRjaCA9IHRydWU7XG4gICAgdmFsdWVzID0gT2JqZWN0LnZhbHVlcyhvYmopLmZpbHRlcihcbiAgICAgIHZhbCA9PiB7XG4gICAgICAgIHJldHVybiBTdHJpbmcodmFsKS5sZW5ndGggPiAwO1xuICAgICAgfSk7XG5cbiAgICBpZiAoQXJyYXkuaXNBcnJheShub3QpICYmIG5vdC5sZW5ndGgpIHtcbiAgICAgIG1hdGNoID0gdHJ1ZTtcbiAgICAgIG5vdC5zb21lKHRhZyA9PiB7XG4gICAgICAgIHZhbHVlcy5zb21lKCh2YWwpID0+IHtcbiAgICAgICAgICBpZiAoU3RyaW5nKHZhbCkudG9Mb3dlckNhc2UoKS5pbmRleE9mKHRhZykgPiAtMSkge1xuICAgICAgICAgICAgbWF0Y2ggPSBudWxsO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKCFtYXRjaCkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgaWYgKG1hdGNoID09PSB0cnVlKSB7XG4gICAgICBtYXRjaCA9IG51bGw7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShoYXMpICYmIGhhcy5sZW5ndGgpIHtcbiAgICAgICAgaGFzLnNvbWUoKHRhZykgPT4ge1xuICAgICAgICAgIGlmICh0YWcuaW5kZXhPZignJicpID4gLTEpIHtcbiAgICAgICAgICAgIGNvbnN0IGhhczIgPSBTdHJpbmcodGFnKS50b0xvd2VyQ2FzZSgpLnNwbGl0KCcmJykubWFwKChzdHIpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIHN0ci50cmltKCk7XG4gICAgICAgICAgICB9KS5maWx0ZXIoaXRlbSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiBTdHJpbmcoaXRlbSkubGVuZ3RoICYmIFN0cmluZyhpdGVtKS5jaGFyQXQoMCkgIT09ICchJztcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBsZXQgbm90MiA9IFN0cmluZyh0YWcpLnRvTG93ZXJDYXNlKCkuc3BsaXQoJyYnKS5tYXAoKHN0cikgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gc3RyLnRyaW0oKTtcbiAgICAgICAgICAgIH0pLmZpbHRlcihcbiAgICAgICAgICAgICAgaXRlbSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFN0cmluZyhpdGVtKS5sZW5ndGggPj0gMSAmJiBTdHJpbmcoaXRlbSkuY2hhckF0KDApID09PSAnISc7XG4gICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBub3QyID0gbm90Mi5tYXAoZmlyc3RUYWcgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gU3RyaW5nUmVwbGFjZUFsbChmaXJzdFRhZywgJyEnLCAnJyk7XG4gICAgICAgICAgICB9KS5maWx0ZXIobmV4dFRhZyA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiBuZXh0VGFnLmxlbmd0aCA+PSAxO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIG1hdGNoID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KG5vdDIpICYmIG5vdDIubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIG1hdGNoID0gdHJ1ZTtcbiAgICAgICAgICAgICAgbm90Mi5zb21lKChmaXJzdFRhZykgPT4ge1xuICAgICAgICAgICAgICAgIHZhbHVlcy5zb21lKCh2YWwpID0+IHtcbiAgICAgICAgICAgICAgICAgIGlmIChTdHJpbmcodmFsKS50b0xvd2VyQ2FzZSgpLmluZGV4T2YoZmlyc3RUYWcpID4gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgbWF0Y2ggPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAoIW1hdGNoKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG1hdGNoID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgIG1hdGNoID0gbnVsbDtcbiAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoaGFzMikgJiYgaGFzMi5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBpZiAoQXJyYXlDb250YWluc0FsbChoYXMyLCB2YWx1ZXMpKSB7XG4gICAgICAgICAgICAgICAgICBtYXRjaCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBtYXRjaDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YWx1ZXMuc29tZSgodmFsKSA9PiB7XG4gICAgICAgICAgICAgIGlmIChTdHJpbmcodmFsKS50b0xvd2VyQ2FzZSgpLmluZGV4T2YodGFnKSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgbWF0Y2ggPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbWF0Y2g7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIENvbnZlcnREYXRlVG9EYXRlVGltZUZvcm1hdCh2YWx1ZSk6IHN0cmluZyB7XG4gIGNvbnN0IGR0ID0gbmV3IERhdGUodmFsdWUpO1xuICBkdC5zZXRIb3VycyhkdC5nZXRIb3VycygpICsgTWF0aC5yb3VuZChkdC5nZXRNaW51dGVzKCkgLyA2MCkpO1xuICBkdC5zZXRNaW51dGVzKDApO1xuXG4gIGxldCBkYXRlOiBhbnkgPSBkdC5nZXREYXRlKCk7XG4gIGlmIChTdHJpbmcoZGF0ZSkubGVuZ3RoID09PSAxKSB7XG4gICAgZGF0ZSA9ICcwJyArIGRhdGU7XG4gIH1cblxuICBsZXQgbW9udGg6IGFueSA9IGR0LmdldE1vbnRoKCkgKyAxO1xuICBpZiAoU3RyaW5nKG1vbnRoKS5sZW5ndGggPT09IDEpIHtcbiAgICBtb250aCA9ICcwJyArIG1vbnRoO1xuICB9XG5cbiAgY29uc3QgeWVhciA9IGR0LmdldEZ1bGxZZWFyKCk7XG4gIGxldCBoOiBhbnkgPSBkdC5nZXRIb3VycygpO1xuICBpZiAoU3RyaW5nKGgpLmxlbmd0aCA9PT0gMSkge1xuICAgIGggPSAnMCcgKyBoO1xuICB9XG5cbiAgcmV0dXJuIHllYXIgKyAnLScgKyBtb250aCArICctJyArIGRhdGUgKyAnICcgKyBoICsgJzonICsgJzAwJyArICc6JyArICcwMCc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBDb252ZXJ0RGF0ZUZvcm1hdCh2YWx1ZTogc3RyaW5nLCBmb3JtYXQgPSAneXl5eS1tbS1kZCcpOiBzdHJpbmcge1xuICBjb25zdCBkdCA9IG5ldyBEYXRlKHZhbHVlKTtcbiAgbGV0IGRhdGVGb3JtYXQ7XG5cbiAgbGV0IGRhdGU6IGFueSA9IGR0LmdldERhdGUoKTtcbiAgaWYgKFN0cmluZyhkYXRlKS5sZW5ndGggPT09IDEpIHtcbiAgICBkYXRlID0gJzAnICsgZGF0ZTtcbiAgfVxuXG4gIGxldCBtb250aDogYW55ID0gZHQuZ2V0TW9udGgoKSArIDE7XG4gIGlmIChTdHJpbmcobW9udGgpLmxlbmd0aCA9PT0gMSkge1xuICAgIG1vbnRoID0gJzAnICsgbW9udGg7XG4gIH1cblxuICBjb25zdCB5ZWFyID0gZHQuZ2V0RnVsbFllYXIoKTtcblxuICBzd2l0Y2ggKFN0cmluZyhmb3JtYXQpLnRvTG93ZXJDYXNlKCkpIHtcbiAgICBjYXNlICdtbS1kZC15eXl5JzpcbiAgICAgIGRhdGVGb3JtYXQgPSBtb250aCArICctJyArIGRhdGUgKyAnLScgKyB5ZWFyO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbW0vZGQveXl5eSc6XG4gICAgICBkYXRlRm9ybWF0ID0gbW9udGggKyAnLycgKyBkYXRlICsgJy8nICsgeWVhcjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3l5eXktbW0tZGQnOlxuICAgICAgZGF0ZUZvcm1hdCA9IHllYXIgKyAnLScgKyBtb250aCArICctJyArIGRhdGU7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgZGF0ZUZvcm1hdCA9IHllYXIgKyAnLScgKyBtb250aCArICctJyArIGRhdGU7XG4gICAgICBicmVhaztcbiAgfVxuICByZXR1cm4gZGF0ZUZvcm1hdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIENvbnZlcnREYXRlVG9UaW1lRm9ybWF0KHZhbHVlKTogc3RyaW5nIHtcbiAgY29uc3QgZHQgPSBuZXcgRGF0ZSh2YWx1ZSk7XG4gIGNvbnN0IGggPSBkdC5nZXRIb3VycygpLnRvU3RyaW5nKDEwKS5wYWRTdGFydCgyLCAnMCcpO1xuICBjb25zdCBtID0gZHQuZ2V0TWludXRlcygpLnRvU3RyaW5nKDEwKS5wYWRTdGFydCgyLCAnMCcpO1xuICBjb25zdCBzID0gZHQuZ2V0U2Vjb25kcygpLnRvU3RyaW5nKDEwKS5wYWRTdGFydCgyLCAnMCcpO1xuICByZXR1cm4gaCArICc6JyArIG0gKyAnOicgKyBzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gUG9wVWlkKCkge1xuICByZXR1cm4gTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikucmVwbGFjZSgvW15hLXpdKy9nLCAnJykuc3Vic3RyKDAsIDUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gQ29udmVydE9iamVjdFRvVXJpKG9iajogb2JqZWN0IHwgYW55W10pIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkob2JqKSkge1xuICAgIG9iaiA9IFRvT2JqZWN0KG9iaik7XG4gIH1cbiAgcmV0dXJuIE9iamVjdC5lbnRyaWVzKG9iaikubWFwKChba2V5LCB2YWxdKSA9PiBgJHtrZXl9PSR7ZW5jb2RlVVJJQ29tcG9uZW50KHZhbCl9YCkuam9pbignJicpO1xufVxuXG5cbi8qKlxuICogR3JvdXAgYSBsaXN0IG9mIG9iamVjdHMgaW5zaWRlIG9mIGFuIGFycmF5XG4gKiBAcGFyYW0gYXJyXG4gKiBAcGFyYW0ga2V5XG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEFycmF5R3JvdXBCeShhcnI6IERpY3Rpb25hcnk8YW55PltdLCBrZXkpIHtcbiAgaWYgKElzQXJyYXkoYXJyLCB0cnVlKSkge1xuICAgIHJldHVybiBhcnIucmVkdWNlKGZ1bmN0aW9uIChydiwgeCkge1xuICAgICAgKHJ2W3hba2V5XV0gPSBydlt4W2tleV1dIHx8IFtdKS5wdXNoKHgpO1xuICAgICAgcmV0dXJuIHJ2O1xuICAgIH0sIHt9KTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gYXJyO1xuICB9XG5cbn1cblxuXG4vKipcbiAqIFBpY2sgYSByYW5kb20gZWxlbWVudCBmcm9tIGFuIGFycmF5XG4gKiBAcGFyYW0gYXJyXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFJhbmRvbUFycmF5RWxlbWVudChhcnI6IGFueVtdKSB7XG4gIGlmIChJc0FycmF5VGhyb3dFcnJvcihhcnIsIHRydWUsIGBSYW5kb21BcnJheUVsZW1lbnQ6IEludmFsaWQgQXJyYXlgKSkge1xuICAgIHJldHVybiBhcnJbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogYXJyLmxlbmd0aCldO1xuICB9XG59XG5cbi8qKlxuICogSGVscGVyIG1ldGhvZCB0byByZW1vdmUgZHVwbGljYXRlIGl0ZW1zIGZyb20gYSAgZmxhdCBhcnJheSBbMSwyLDMsMSwxXSwgW1snYScsJ2InLCdjJywnYSddXG4gKiBAcGFyYW0gYXJyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBBcnJheU9ubHlVbmlxdWUoYXJyOiBhbnlbXSkge1xuICBpZiAoSXNBcnJheShhcnIsIHRydWUpKSB7XG4gICAgcmV0dXJuIGFyci5maWx0ZXIoZnVuY3Rpb24gKGVsZW0sIGluZGV4LCBzZWxmKSB7XG4gICAgICByZXR1cm4gaW5kZXggPT09IHNlbGYuaW5kZXhPZihlbGVtKTtcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gYXJyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gQXJyYXlSZW1vdmVEdXBsaWF0ZXMoYXJyYXk6IG9iamVjdFtdLCBwcm9wKSB7XG4gIHJldHVybiBhcnJheS5maWx0ZXIoKG9iaiwgcG9zLCBhcnIpID0+IHtcbiAgICByZXR1cm4gYXJyLm1hcChtYXBPYmogPT4gbWFwT2JqW3Byb3BdKS5pbmRleE9mKG9ialtwcm9wXSkgPT09IHBvcztcbiAgfSk7XG59XG5cbi8qKlxuICogUGFzcyBpbiBhIHN0YXRlIHZlcmIgdG8gcmVzb2x2ZSB0byBhIGNvbG9yIHRoZW1lIC4uLiB1c2UgY2FzZSB3b3VsZCBiZSBjb2xvciBvZiBidXR0b25zLCBpY29ucywgYW5kIG5vdGlmaWNhdGlvbnNcbiAqIEBwYXJhbSBzdGF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gR2V0VmVyYlN0YXRlVGhlbWUoc3RhdGVWZXJiOiBzdHJpbmcgfCBib29sZWFuIHwgbnVtYmVyKTogc3RyaW5nIHtcblxuICBjb25zdCBzdWNjZXNzVmVyYnMgPSBbJ2FjdGl2ZScsICdzdWNjZXNzJywgJ29uJywgJzEnXTtcbiAgY29uc3QgZGFuZ2VyVmVyYnMgPSBbJ2VycicsICdvZmYnLCAncmVtb3ZlJywgJzAnLCAnZmFpbCcsICdhcmNoaXZlZCddO1xuICBjb25zdCB3YXJuaW5nVmVyYnMgPSBbJ3dhcm4nLCAncGVuZCcsICdyZW1vdmUnXTtcbiAgY29uc3QgaW5mb1ZlcmJzID0gWyduZXcnLCAnaW5mbycsICdhZGQnXTtcbiAgbGV0IHRoZW1lID0gbnVsbDtcbiAgc3VjY2Vzc1ZlcmJzLnNvbWUoKHZlcmIpID0+IHtcbiAgICBpZiAoU3RyaW5nKHN0YXRlVmVyYikudG9Mb3dlckNhc2UoKS5zZWFyY2godmVyYikgPiAtMSkge1xuICAgICAgdGhlbWUgPSAnc3VjY2Vzcyc7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH0pO1xuICBpZiAoIXRoZW1lKSB7XG4gICAgZGFuZ2VyVmVyYnMuc29tZShmdW5jdGlvbiAodmVyYikge1xuICAgICAgaWYgKFN0cmluZyhzdGF0ZVZlcmIpLnRvTG93ZXJDYXNlKCkuc2VhcmNoKHZlcmIpID4gLTEpIHtcbiAgICAgICAgdGhlbWUgPSAnZGFuZ2VyJztcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbiAgaWYgKCF0aGVtZSkge1xuICAgIHdhcm5pbmdWZXJicy5zb21lKGZ1bmN0aW9uICh2ZXJiKSB7XG4gICAgICBpZiAoU3RyaW5nKHN0YXRlVmVyYikudG9Mb3dlckNhc2UoKS5zZWFyY2godmVyYikgPiAtMSkge1xuICAgICAgICB0aGVtZSA9ICd3YXJuJztcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbiAgaWYgKCF0aGVtZSkge1xuICAgIGluZm9WZXJicy5zb21lKGZ1bmN0aW9uICh2ZXJiKSB7XG4gICAgICBpZiAoU3RyaW5nKHN0YXRlVmVyYikudG9Mb3dlckNhc2UoKS5zZWFyY2godmVyYikgPiAtMSkge1xuICAgICAgICB0aGVtZSA9ICdpbmZvJztcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbiAgaWYgKCF0aGVtZSkgdGhlbWUgPSAnZGVmYXVsdCc7XG5cbiAgcmV0dXJuIHRoZW1lO1xufVxuXG5cbi8qKlxuICogSGVscGVyIGZvciBnZXR0aW5nIGEgbWVzc2FnZSBzdHJpbmcgZnJvbSBhbiBodHRwIGVycm9yXG4gKiBAcGFyYW0gZXJyXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEdldEh0dHBFcnJvck1zZyhlcnI6IGFueSkge1xuICBsZXQgZXJyb3JNZXNzYWdlID0gJyc7XG4gIGxldCBsb2NhdGlvbiA9IGVycjtcbiAgaWYgKElzT2JqZWN0KGxvY2F0aW9uLCB0cnVlKSkge1xuICAgIGlmIChJc09iamVjdChlcnIuZXJyb3IsIHRydWUpKSB7XG4gICAgICBsb2NhdGlvbiA9IGVyci5lcnJvcjtcbiAgICAgIGlmIChJc09iamVjdChsb2NhdGlvbi5lcnJvcnMsIHRydWUpKSB7XG4gICAgICAgIE9iamVjdC5rZXlzKGxvY2F0aW9uLmVycm9ycykubWFwKChrZXkpID0+IHtcbiAgICAgICAgICBpZiAoSXNBcnJheShsb2NhdGlvbi5lcnJvcnNba2V5XSwgdHJ1ZSkpIHtcbiAgICAgICAgICAgIGxvY2F0aW9uLmVycm9yc1trZXldLm1hcCgoZXJyb3JNc2csIGluZGV4KSA9PiB7XG4gICAgICAgICAgICAgIGlmIChpbmRleCkgZXJyb3JNZXNzYWdlICs9IGA8YnIvPmA7XG4gICAgICAgICAgICAgIGVycm9yTWVzc2FnZSArPSBlcnJvck1zZyArIGA8YnIvPmA7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGVsc2UgaWYgKElzU3RyaW5nKGxvY2F0aW9uLmVycm9yc1trZXldKSkge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlICs9IGVyci5lcnJvcnNba2V5XSArIGA8YnIvPmA7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVycm9yTWVzc2FnZSArPSBgPGJyLz5gO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSBpZiAoSXNTdHJpbmcobG9jYXRpb24ubWVzc2FnZSwgdHJ1ZSkpIHtcbiAgICAgICAgZXJyb3JNZXNzYWdlID0gbG9jYXRpb24ubWVzc2FnZTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKElzU3RyaW5nKGxvY2F0aW9uLm1lc3NhZ2UsIHRydWUpKSB7XG4gICAgICBlcnJvck1lc3NhZ2UgPSBlcnIubWVzc2FnZTtcbiAgICB9IGVsc2UgaWYgKFN0b3JhZ2VHZXR0ZXIobG9jYXRpb24sIFsnZGF0YScsICdtZXNzYWdlJ10pKSB7XG4gICAgICBlcnJvck1lc3NhZ2UgPSBsb2NhdGlvbi5kYXRhLm1lc3NhZ2U7XG4gICAgfVxuICB9IGVsc2UgaWYgKElzT2JqZWN0KGxvY2F0aW9uLCBbJ21lc3NhZ2UnXSkpIHtcbiAgICBlcnJvck1lc3NhZ2UgPSBsb2NhdGlvbi5tZXNzYWdlO1xuICB9IGVsc2UgaWYgKElzU3RyaW5nKGxvY2F0aW9uLCB0cnVlKSkge1xuICAgIGVycm9yTWVzc2FnZSA9IFN0cmluZyhsb2NhdGlvbik7XG4gIH1cbiAgaWYgKCFlcnJvck1lc3NhZ2UpIHtcbiAgICBpZiAoSXNPYmplY3QoUG9wTG9nKSkge1xuICAgICAgY29uc29sZS5sb2coUG9wTG9nLm1lc3NhZ2UoYEdldEh0dHBFcnJvck1zZzogRmFpbGApLCBQb3BMb2cuY29sb3IoJ2Vycm9yJyksIHtcbiAgICAgICAgZGF0YTogbG9jYXRpb24sXG4gICAgICB9KTtcbiAgICB9XG4gICAgZXJyb3JNZXNzYWdlID0gYFNlcnZlciBFcnJvcjogQ29kZSAke2Vyci5zdGF0dXMgKyAoZXJyLnN0YXR1c1RleHQgPyAnIC0gJyArIGVyci5zdGF0dXNUZXh0IDogJycpICsgJy4nfWA7XG4gIH1cblxuICByZXR1cm4gZXJyb3JNZXNzYWdlO1xufVxuXG5cbi8qKlxuICogSGVscGVyIGZvciBnZXR0aW5nIGFuIGFycmF5IGZyb20gYSByZXNwb25zZVxuICogQHBhcmFtIGVyclxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBHZXRIdHRwUmVzdWx0KHJlczogYW55KTogYW55IHtcbiAgaWYgKHJlcykge1xuICAgIGlmIChyZXMuZGF0YSkgcmVzID0gcmVzLmRhdGE7XG4gIH0gZWxzZSB7XG4gICAgY29uc29sZS5sb2coYFVuZGVmaW5lZCByZXNwb25zZTogJHtKU09OLnN0cmluZ2lmeShyZXMpfWApO1xuICB9XG4gIHJldHVybiByZXM7XG59XG5cbi8qKlxuICogSGVscGVyIGZvciBnZXR0aW5nIGFuIGFycmF5IGZyb20gYSByZXNwb25zZVxuICogQHBhcmFtIGVyclxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBHZXRIdHRwQXJyYXlSZXN1bHQocmVzOiBSZXNwb25zZSwgcmVxdWlyZUxlbmd0aCA9IGZhbHNlKTogRW50aXR5W10ge1xuICBsZXQgcmVzdWx0ID0gPGFueT5yZXM7XG4gIGlmIChyZXN1bHQgJiYgcmVzdWx0LmRhdGEpIHtcbiAgICByZXN1bHQgPSByZXN1bHQuZGF0YTtcbiAgfVxuICByZXR1cm4gSXNBcnJheVRocm93RXJyb3IocmVzdWx0LCByZXF1aXJlTGVuZ3RoLCBgQXBpIFJlc3VsdCB3YXMgbm90IGFuIGFycmF5IGFzIGV4cGVjdGVkYCkgPyByZXN1bHQgOiBudWxsO1xufVxuXG4vKipcbiAqIEhlbHBlciBmb3IgZ2V0dGluZyBhbiBvYmplY3QgZnJvbSBhIHJlc3BvbnNlXG4gKiBAcGFyYW0gZXJyXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEdldEh0dHBPYmplY3RSZXN1bHQocmVzOiBSZXNwb25zZSwgcmVxdWlyZUtleXM6IGJvb2xlYW4gfCBzdHJpbmdbXSA9IGZhbHNlKTogRW50aXR5IHtcbiAgbGV0IHJlc3VsdCA9IDxhbnk+cmVzO1xuICBpZiAocmVzdWx0ICYmIHJlc3VsdC5kYXRhKSB7XG4gICAgcmVzdWx0ID0gcmVzdWx0LmRhdGE7XG4gIH1cbiAgcmV0dXJuIElzT2JqZWN0VGhyb3dFcnJvcihyZXN1bHQsIHJlcXVpcmVLZXlzLCBgQXBpIFJlc3VsdCB3YXMgbm90IGFuIG9iamVjdCBhcyBleHBlY3RlZGApID8gcmVzdWx0IDogbnVsbDtcbn1cblxuXG4vKipcbiAqIFJlcGxhY2UgeyB2YXIgfSBpbiBhIHN0cmluZyB3aXRoIHRoZSBjb3JyZXNwb25kaW5nIGRhdGEgdmFsdWUgb2YgYW4gb2JqZWN0XG4gKiBAcGFyYW0gc3RyXG4gKiBAcGFyYW0gb2JqXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEludGVycG9sYXRlU3RyaW5nKHN0cjogc3RyaW5nLCBvYmo6IE9iamVjdCkgeyAvLyByZWN1cnNpdmVcbiAgaWYgKHR5cGVvZiAoc3RyKSA9PT0gJ3N0cmluZycgJiYgc3RyLmluY2x1ZGVzKCd7JykgJiYgSXNPYmplY3Qob2JqLCB0cnVlKSkge1xuICAgIGNvbnN0IHN0YXJ0ID0gc3RyLmluZGV4T2YoJ3snKTtcbiAgICBjb25zdCBlbmQgPSBzdHIuaW5kZXhPZignfScsIHN0YXJ0KSAhPT0gLTEgPyBzdHIuaW5kZXhPZignfScsIHN0YXJ0KSA6IHN0ci5sZW5ndGg7XG4gICAgY29uc3QgZmllbGROYW1lID0gc3RyLnN1YnN0cmluZyhzdGFydCArIDEsIGVuZCk7XG4gICAgY29uc3QgdmFyTmFtZSA9IGZpZWxkTmFtZS50cmltKCk7XG4gICAgaWYgKHZhck5hbWUgaW4gb2JqKSB7XG4gICAgICBzdHIgPSBzdHIucmVwbGFjZSgneycgKyBmaWVsZE5hbWUgKyAnfScsIG9ialt2YXJOYW1lXSk7XG4gICAgICBpZiAoc3RyICYmIHN0ci5pbmNsdWRlcygneycpKSB7XG4gICAgICAgIHN0ciA9IEludGVycG9sYXRlU3RyaW5nKHN0ciwgb2JqKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgfVxuICByZXR1cm4gc3RyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gR2V0U3RyaW5nQWJicnYoc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICBsZXQgYWJicnYgPSAnJztcbiAgaWYgKElzU3RyaW5nKHN0ciwgdHJ1ZSkpIHtcbiAgICBjb25zdCBzdHJBcnJheSA9IFN0cmluZyhzdHIpLnRyaW0oKS5zcGxpdCgnICcpO1xuICAgIGxldCB3b3JkO1xuICAgIHdoaWxlIChzdHJBcnJheS5sZW5ndGgpIHtcbiAgICAgIHdvcmQgPSBzdHJBcnJheS5zaGlmdCgpO1xuICAgICAgYWJicnYgKz0gU3RyaW5nKHdvcmQpLnRyaW0oKS5jaGFyQXQoMCkudG9Mb2NhbGVVcHBlckNhc2UoKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGFiYnJ2O1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBQb3BUcmFuc2Zvcm0odmFsdWU6IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4sIHRyYW5zZm9ybWF0aW9uOiBzdHJpbmcgfCBvYmplY3QpOiBhbnkge1xuXG4gIHN3aXRjaCAoU3RyaW5nKHRyYW5zZm9ybWF0aW9uKS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgY2FzZSAndG9SZWxhdGlvbk5hbWUnOlxuICAgICAgaWYgKElzT2JqZWN0KHZhbHVlKSkge1xuICAgICAgICBjb25zdCB2YWwgPSA8YW55PnZhbHVlO1xuICAgICAgICBjb25zdCBsb2NhdGlvbiA9IHZhbC5sYWJlbCA/ICdsYWJlbCcgOiAnbmFtZSc7XG4gICAgICAgIGNvbnN0IG5hbWUgPSA8c3RyaW5nPlN0b3JhZ2VHZXR0ZXIodmFsdWUsIFtsb2NhdGlvbl0pO1xuICAgICAgICBpZiAobmFtZSkgdmFsdWUgPSBuYW1lO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAndG90aXRsZWNhc2UnOlxuICAgIGNhc2UgJ3RpdGxlJzpcbiAgICAgIHZhbHVlID0gVGl0bGVDYXNlKFN0cmluZyh2YWx1ZSkpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAndG9sb3dlcmNhc2UnOlxuICAgIGNhc2UgJ2xvd2VyJzpcbiAgICAgIHZhbHVlID0gU3RyaW5nKHZhbHVlKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbGFiZWwnOlxuICAgICAgY29uc3QgbGFiZWwgPSBuZXcgTGFiZWxQaXBlKCk7XG4gICAgICB2YWx1ZSA9IGxhYmVsLnRyYW5zZm9ybSh2YWx1ZSArICcnKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3RvZGlnaXRzJzpcbiAgICBjYXNlICdkaWdpdHMnOlxuICAgICAgdmFsdWUgPSBTdHJpbmcodmFsdWUpLm1hdGNoKC9cXGQrL2cpLm1hcChOdW1iZXIpLmpvaW4oJycpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAndG9waG9uZXBpcGUnOlxuICAgIGNhc2UgJ3Bob25lJzpcbiAgICAgIGNvbnN0IHBob25lID0gbmV3IFBob25lUGlwZSgpO1xuICAgICAgdmFsdWUgPSBwaG9uZS50cmFuc2Zvcm0odmFsdWUpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnYWN0aXZlJzpcbiAgICBjYXNlICdhcmNoaXZlZCc6XG4gICAgY2FzZSAndG9hY3RpdmVhcmFyY2hpdmVkJzpcbiAgICAgIGNvbnN0IGFjdGl2ZSA9IG5ldyBUb0FjdGl2ZU9yQXJjaGl2ZWRQaXBlKCk7XG4gICAgICB2YWx1ZSA9IGFjdGl2ZS50cmFuc2Zvcm0odmFsdWUpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAndG91cHBlcmNhc2UnOlxuICAgIGNhc2UgJ3VwcGVyJzpcbiAgICAgIHZhbHVlID0gU3RyaW5nKHZhbHVlKS50b1VwcGVyQ2FzZSgpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnY29udmVydGVtcHR5dG9udWxsJzpcbiAgICAgIGlmICghU3RyaW5nKHZhbHVlKS5sZW5ndGgpIHZhbHVlID0gbnVsbDtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2NvbnZlcnRlbXB0eXplcm8nOlxuICAgICAgaWYgKCFTdHJpbmcodmFsdWUpLmxlbmd0aCkgdmFsdWUgPSAwO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAndG9jdXJyZW5jeSc6XG4gICAgY2FzZSAnY3VycmVuY3knOlxuICAgIGNhc2UgJ2RvbGxhcic6XG4gICAgICBpZiAoSXNOdW1iZXIodmFsdWUpKSB7XG4gICAgICAgIHZhbHVlID0gbmV3IEludGwuTnVtYmVyRm9ybWF0KCdlbi1VUycsIHtcbiAgICAgICAgICBzdHlsZTogJ2N1cnJlbmN5JyxcbiAgICAgICAgICBjdXJyZW5jeTogJ1VTRCcsXG4gICAgICAgICAgbWluaW11bUZyYWN0aW9uRGlnaXRzOiAyXG4gICAgICAgIH0pLmZvcm1hdChOdW1iZXIodmFsdWUpKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2Ftb3VudCc6XG4gICAgICB2YWx1ZSA9IElzTnVtYmVyKHZhbHVlKSA/IHBhcnNlRmxvYXQoU3RyaW5nKHZhbHVlKSkudG9GaXhlZCgyKSA6ICcwLjAwJztcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBicmVhaztcbiAgfVxuXG4gIHJldHVybiB2YWx1ZTtcbn1cbiJdfQ==