import { Dictionary, Entity, OptionItem, OptionParamsInterface } from './pop-common.model';
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
export declare function SetSiteVar(siteVarPath: string, siteVal: any): void;
/**
 * Get stored value in localStorage for the site
 * @param siteVarPath - This should always follow a dot notation that represents the structure of an object App.Setting.value
 * @param defaultValue
 * @constructor
 */
export declare function GetSiteVar(siteVarPath: string, defaultValue?: any): any;
export declare function GetRouteAlias(internal_name: any, type?: 'plural' | 'singular'): string;
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
export declare function SetSessionSiteVar(siteVarPath: string, siteVal: any): void;
/**
 * Get a stored session variable for the site
 * @param siteVarPath - This should always follow a dot notation that represents the structure of an object App.Setting.value
 * @param defaultValue - Return this value if a stored value is not found
 * @constructor
 */
export declare function GetSessionSiteVar(siteVarPath: string, defaultValue?: any): any;
/**
 * Get a stored session variable for the site that has been base64 encoded
 * @param siteVarPath
 * @param defaultValue
 * @constructor
 */
export declare function GetEncodedSessionSiteVar(siteVarPath: string, defaultValue?: any): any;
/**
 * Deep Copy an Object
 * @param obj
 */
export declare function DeepCopy(obj: any): any;
export declare function RandomInt(min: any, max: any): any;
export declare function JsonCopy(x: any): any;
/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
export declare function DeepMerge(target: any, ...sources: any[]): any;
/**
 * Helper Function to prepare an array to used as an option set for a field item
 * @param arr
 * @param params
 */
export declare function ConvertArrayToOptionList(arr: OptionItem[], params?: OptionParamsInterface): any[];
/**
 * Helper to get an nested value out of an object
 * @param storage - The base object you want to reach into
 * @param steps  - the nested path to the find the value you are looking for
 * @param defaultValue Set a default value to return if value is not found
 */
export declare function StorageGetter(storage: any, steps: string[], defaultValue?: any): any;
/**
 * Helper to set a storage container into a nested location in an object
 * @param storage - The base object you want to reach into
 * @param steps  - the nested path to the find the value you are looking for
 * @param defaultValue Set a default value to return if value is not found
 */
export declare function StorageSetter(storage: any, steps: string[]): object | null;
export declare function Sleep(milliseconds: any): Promise<unknown>;
/**
 * Sort helper for a list of objects where the sort needs to be done on a specific property
 * @param key
 * @param order
 */
export declare function DynamicSort(key: any, order?: string): (a: any, b: any) => number;
/**
 * Check if the values of two arrays contain the same items
 * This is way to get around the order not being the same, but the items are the same
 * @param arr1
 * @param arr2
 * @param field
 */
export declare function ArraysMatch(arr1: any[], arr2: any[], field: string): boolean;
/**
 * Check if an array contains a list of key:value pairs
 * @param needles
 * @param haystack
 * @param strict
 */
export declare function ArrayContainsAll(needles: Array<string>, haystack: Array<string>, strict?: boolean): boolean;
/**
 * Create a map of an array of objects using a specific property
 * @param arr
 * @param array_key_field
 */
export declare function ArrayMapSetter(arr: any[], array_key_field: any): {};
/**
 * Sort an array by a parent_id
 * @param arr
 * @param parentId
 * @param result
 * @param itemKey
 * @param parentKey
 * @constructor
 */
export declare function ArrayParentSort(arr: any[], parentId?: number, result?: any[], itemKey?: string, parentKey?: string): any[];
/**
 * Convert an array to a nested array
 * @param data
 * @param itemKey
 * @param parentKey
 * @constructor
 */
export declare function ArrayTreeList(data: any[], itemKey?: string, parentKey?: string): any[];
/**
 * Flatten an array that has parent/child relationship
 * @param list
 * @param result
 * @param level
 * @param itemKey
 * @param parentKey
 * @constructor
 */
export declare function ArrayParentTreeFlatten(list: any[], result?: any[], level?: number, itemKey?: string, parentKey?: string): any[];
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
export declare function ArrayParentTree(data: any[], parentId?: number, result?: any[], tree?: any[], itemKey?: string, parentKey?: string, flatten?: boolean): any[];
/**
 * Create a map of list of object keyed by an object property
 * @param arr
 * @param array_key_field
 */
export declare function ArrayKeyBy(arr: any[], key: string): {};
/**
 * Determine if an object is an array
 * @param arr
 * @param requireLength - Requires that it is an array but also has values
 */
export declare function IsArray(arr: any, requireLength?: boolean): boolean;
export declare function IsArrayThrowError(arr: any, requireLength: boolean, throwError: string): boolean;
/**
 * Convert an Object to an Array
 * @param obj
 */
export declare function ToArray(obj: object): any[];
/**
 * Check if a var is undefined
 * @param x
 */
export declare function IsUndefined(x: any): boolean;
/**
 * Check if a var is defined
 * @param x
 */
export declare function IsDefined(x: any, allowNull?: boolean): boolean;
/**
 * Convert an Array to an object
 * @param obj
 */
export declare function ToObject(arr: any[]): {};
export declare function ObjectsMatch(x: any, y: any): any;
/**
 * Check for a qualified object
 * @param value
 * @param requireKeys
 * @constructor
 */
export declare function IsObject(value: any, requireKeys?: boolean | string[]): boolean;
/**
 * Check for a qualified function
 * @param value
 * @param requireKeys
 * @constructor
 */
export declare function IsCallableFunction(fn: any): boolean;
/**
 * Remove empty values from an object
 * @param obj
 * @constructor
 */
export declare function CleanObject(obj: Object, options?: {
    whitelist?: string[];
    blacklist?: string[];
    alias?: Dictionary<string>;
}): Object;
/**
 * A helper function to determine if a variable is a qualified object
 *
 * @param value
 * @param requireKeys
 * @param throwError
 */
export declare function IsObjectThrowError(value: any, requireKeys: boolean | string[], throwError: string): boolean;
/**
 * Check for a qualified number
 * @param value
 * @param requireTruthy
 * @constructor
 */
export declare function IsNumber(value: any, requireTruthy?: boolean): boolean;
/**
 * Check for a qualified string
 * @param value
 * @param requireLength
 * @constructor
 */
export declare function IsString(value: any, requireLength?: boolean): boolean;
/**
 *
 * A helper function to determine if a variable is a qualified string
 * @param value
 * @param requireLength
 * @param throwError
 */
export declare function IsStringError(value: any, requireLength: boolean, throwError: string): boolean;
/**
 * Capitalize the first Letter of every word in a string
 * @param str
 * @returns str
 */
export declare function TitleCase(str: string): string;
/**
 * Capitalize the first Letter of every word in a string
 * @param str
 * @returns str
 */
export declare function Capitalize(str: string): string;
/**
 * Convert a string from snake case to Pascal Case
 * @param field
 * @returns string
 */
export declare function SnakeToPascal(field: string): string;
/**
 * Convert a string with spaces to snake case .. 'this is snake case' to 'this_is_snake_case'
 * @param field
 * @returns string
 */
export declare function SpaceToSnake(pascal: string): string;
/**
 * Convert a string with hyphens to Pascal Case
 * @param field
 * @returns string
 */
export declare function HyphenToPascal(field: string): string;
/**
 * Convert a string with spaces to Pascal Case
 * @param field
 * @returns string
 */
export declare function SpaceToHyphenLower(str: string): string;
/**
 * String replace all
 * @param str
 * @param find
 * @param replace
 * @constructor
 */
export declare function StringReplaceAll(str: string, find: string, replace: string): string;
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
export declare function ObjectContainsTagSearch(obj: any, tags: string, match?: any, values?: any, has?: any, not?: any): any;
export declare function ConvertDateToDateTimeFormat(value: any): string;
export declare function ConvertDateFormat(value: string, format?: string): string;
export declare function ConvertDateToTimeFormat(value: any): string;
export declare function PopUid(): string;
export declare function ConvertObjectToUri(obj: object | any[]): string;
/**
 * Group a list of objects inside of an array
 * @param arr
 * @param key
 * @constructor
 */
export declare function ArrayGroupBy(arr: Dictionary<any>[], key: any): Dictionary<any>;
/**
 * Pick a random element from an array
 * @param arr
 * @constructor
 */
export declare function RandomArrayElement(arr: any[]): any;
/**
 * Helper method to remove duplicate items from a  flat array [1,2,3,1,1], [['a','b','c','a']
 * @param arr
 */
export declare function ArrayOnlyUnique(arr: any[]): any[];
export declare function ArrayRemoveDupliates(array: object[], prop: any): object[];
/**
 * Pass in a state verb to resolve to a color theme ... use case would be color of buttons, icons, and notifications
 * @param state
 */
export declare function GetVerbStateTheme(stateVerb: string | boolean | number): string;
/**
 * Helper for getting a message string from an http error
 * @param err
 * @constructor
 */
export declare function GetHttpErrorMsg(err: any): string;
/**
 * Helper for getting an array from a response
 * @param err
 * @constructor
 */
export declare function GetHttpResult(res: any): any;
/**
 * Helper for getting an array from a response
 * @param err
 * @constructor
 */
export declare function GetHttpArrayResult(res: Response, requireLength?: boolean): Entity[];
/**
 * Helper for getting an object from a response
 * @param err
 * @constructor
 */
export declare function GetHttpObjectResult(res: Response, requireKeys?: boolean | string[]): Entity;
/**
 * Replace { var } in a string with the corresponding data value of an object
 * @param str
 * @param obj
 * @constructor
 */
export declare function InterpolateString(str: string, obj: Object): string;
export declare function GetStringAbbrv(str: string): string;
export declare function PopTransform(value: string | number | boolean, transformation: string | object): any;
