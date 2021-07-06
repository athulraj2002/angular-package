import { HttpErrorResponse } from '@angular/common/http';
export declare class PopCommonService {
    name: string;
    arrayContainsAll(needles: Array<string>, haystack: Array<string>, strict?: boolean): boolean;
    dynamicSort(key: any, order?: string): (a: any, b: any) => number;
    /**
     * Sorts on sort
     * @param a
     * @param b
     * returns int
     */
    sortBySort(a: any, b: any): 1 | 0 | -1;
    /**
     * Sorts on name field
     * @param a
     * @param b
     * returns int
     */
    sortByName(a: any, b: any): 1 | 0 | -1;
    /**
     * Sorts on position field
     * @param a
     * @param b
     * returns int
     */
    sortByPosition(a: any, b: any): 1 | 0 | -1;
    /**
     * Sorts on entityId field
     * @param a
     * @param b
     * returns int
     */
    sortById(a: any, b: any): 1 | 0 | -1;
    /**
     * Checks if two arrays match
     *
     * @param arr1
     * @param arr2
     * @param field -optional
     *
     * - if field is passed - check to see if the field is the same in both arrays
     *
     * @returns boolean
     */
    arraysMatch(arr1: any[], arr2: any[], field: string): boolean;
    /**
     * Convert an object into an array
     * @param obj
     * @returns array
     */
    toArray(obj: object): any[];
    /**
     * A helper function to determine if a variable is numreric
     * @param value
     */
    isNumber(value: any, requireTruthy?: boolean): boolean;
    isArray(arr: any, requireLength?: boolean): boolean;
    /**
     * A helper function to determine if a variable is a qualified object
     *
     * @param value
     * @param requireKeys
     * @param throwError
     */
    isObject(value: any, requireKeys?: boolean): boolean;
    /**
     *
     * A helper function to determine if a variable is a qualified string
     * @param value
     * @param requireLength
     * @param throwError
     */
    isString(value: any, requireLength?: boolean): boolean;
    /**
     * Helper method to remove duplicate items from a  flat array [1,2,3,1,1], [['a','b','c','a']
     * @param arr
     */
    onlyArrayUnique(arr: any[]): any[];
    /**
     * Helper method to remove duplicate objects in an array that share a specific property [{entityId:1, ...},{entityId:2, ...},{entityId:3, ...},{entityId:1, ...}, ]
     * @param arr
     */
    removeArrayDuplicates(array: object[], prop: any): object[];
    /**
     * Map an array by a array key field
     * @param obj
     * @returns array
     */
    mapArrayWithKey(array: any, array_key_field: string): {};
    /**
     * Convert an Array to Object
     * @param arr
     * @returns Object
     */
    toObject(arr: any[]): {};
    /**
     * Convert an Array of objects  to Dictionary(object)
     * @param arr
     * @returns Object
     */
    toDictionary(arr: any[], key: string): {};
    toUri(obj: object | any[]): string;
    /**
     * Capitalize the first Letter of every word in a string
     * @param str
     * @returns str
     */
    toTitleCase(str: string): string;
    /**
     * Convert a date to yyyy:mm:dd 00:00:00
     * @param value date
     */
    dateTimeFormat(value: any): string;
    /**
     * Convert a date to yyyy:mm:dd
     * @param value date
     */
    dateFormat(value: any, format?: string): string;
    today(format?: string): string;
    addDays(date: any, days: any): Date;
    /**
     * Replace all occurrences of an sequence within a string
     * @param str
     * @param find
     * @param replace
     */
    replaceAll(str: string, find: string, replace: string): string;
    /**
     * Convert a string from snake case to Pascal Case
     * @param field
     * @returns string
     */
    snakeToPascal(field: string): string;
    /**
     * Convert a string with hyphens to Pascal Case
     * @param field
     * @returns string
     */
    hyphenToPascal(field: string): string;
    /**
     * Convert a string with spaces to snake case .. 'this is snake case' to 'this_is_snake_case'
     * @param field
     * @returns string
     */
    spaceToSnake(pascal: string): string;
    /**
     * A complex fuzzy search to determine if an object's values contains a series of filter "tags"
     * @param object obj: The Object that you want to see if the fieldItems match the filter
     * @param string tags: The filter string you want to match against obj.
     *                       Uses (!)not, (&)and, (,)or syntax for complex chaining.
     *                       example: 'john' returns true if a field value contains 'john'
     *                       example: 'john,jane,doe' returns true if a field value contains any of the values
     *                       example: 'john&doe' returns true only if obj contains 'john' and  contains 'doe'
     *                       example: 'john,!doe' returns true only if obj contains 'john' and does not contain 'doe'
     *
     *
     * @returns boolean
     */
    hasFilter(obj: object, tags: string): any;
    deepCopy(obj: object): any;
    getHttpErrorMsg(err: HttpErrorResponse): string;
    getStoragePath(storage: object, steps: string[], defaultValue?: any): any;
    uid(): string;
}
