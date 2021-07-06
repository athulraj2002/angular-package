import { Injectable } from '@angular/core';
import { ArrayContainsAll, ArrayMapSetter, ArrayOnlyUnique, ArraysMatch, ConvertDateFormat, ConvertDateToDateTimeFormat, ConvertObjectToUri, DeepCopy, DynamicSort, GetHttpErrorMsg, HyphenToPascal, IsArray, IsNumber, IsObject, IsString, ObjectContainsTagSearch, PopUid, SnakeToPascal, SpaceToSnake, StorageGetter, StringReplaceAll, TitleCase, ToArray, ToObject } from '../pop-common-utility';
import * as i0 from "@angular/core";
export class PopCommonService {
    constructor() {
        this.name = 'PopCommonService';
    }
    arrayContainsAll(needles, haystack, strict = false) {
        return ArrayContainsAll(needles, haystack, strict);
    }
    // function for dynamic sorting an array of objects.
    // - Usage: someArray.sort(dynamicSort('key'));
    // @param key: The name of the key in each object to sort on.
    // @param order: asc (Ascending) or desc (Descending)
    // @return: sorted array.
    dynamicSort(key, order = 'asc') {
        return DynamicSort(key, order);
    }
    /**
     * Sorts on sort
     * @param a
     * @param b
     * returns int
     */
    sortBySort(a, b) {
        if (a.sort < b.sort)
            return -1;
        if (a.sort > b.sort)
            return 1;
        return 0;
    }
    /**
     * Sorts on name field
     * @param a
     * @param b
     * returns int
     */
    sortByName(a, b) {
        if (a.name < b.name)
            return -1;
        if (a.name > b.name)
            return 1;
        return 0;
    }
    /**
     * Sorts on position field
     * @param a
     * @param b
     * returns int
     */
    sortByPosition(a, b) {
        if (+a.position < +b.position)
            return -1;
        if (+a.position > +b.position)
            return 1;
        return 0;
    }
    /**
     * Sorts on entityId field
     * @param a
     * @param b
     * returns int
     */
    sortById(a, b) {
        if (a.id < b.id)
            return -1;
        if (a.id > b.id)
            return 1;
        return 0;
    }
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
    arraysMatch(arr1, arr2, field) {
        return ArraysMatch(arr1, arr2, field);
    }
    /**
     * Convert an object into an array
     * @param obj
     * @returns array
     */
    toArray(obj) {
        return ToArray(obj);
    }
    /**
     * A helper function to determine if a variable is numreric
     * @param value
     */
    isNumber(value, requireTruthy) {
        return IsNumber(value, requireTruthy);
    }
    isArray(arr, requireLength = false) {
        return IsArray(arr, requireLength);
    }
    /**
     * A helper function to determine if a variable is a qualified object
     *
     * @param value
     * @param requireKeys
     * @param throwError
     */
    isObject(value, requireKeys = false) {
        return IsObject(value, requireKeys);
    }
    /**
     *
     * A helper function to determine if a variable is a qualified string
     * @param value
     * @param requireLength
     * @param throwError
     */
    isString(value, requireLength = false) {
        return IsString(value, requireLength);
    }
    /**
     * Helper method to remove duplicate items from a  flat array [1,2,3,1,1], [['a','b','c','a']
     * @param arr
     */
    onlyArrayUnique(arr) {
        return ArrayOnlyUnique(arr);
    }
    /**
     * Helper method to remove duplicate objects in an array that share a specific property [{entityId:1, ...},{entityId:2, ...},{entityId:3, ...},{entityId:1, ...}, ]
     * @param arr
     */
    removeArrayDuplicates(array, prop) {
        return array.filter((obj, pos, arr) => {
            return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
        });
    }
    /**
     * Map an array by a array key field
     * @param obj
     * @returns array
     */
    mapArrayWithKey(array, array_key_field) {
        return ArrayMapSetter(array, array_key_field);
    }
    /**
     * Convert an Array to Object
     * @param arr
     * @returns Object
     */
    toObject(arr) {
        return ToObject(arr);
    }
    /**
     * Convert an Array of objects  to Dictionary(object)
     * @param arr
     * @returns Object
     */
    toDictionary(arr, key) {
        const dictionary = {};
        if (arr && Array.isArray(arr) && arr.length) {
            arr.map((item) => {
                if (typeof item[key] !== undefined)
                    dictionary[item[key]] = item;
            });
        }
        return dictionary;
    }
    toUri(obj) {
        return ConvertObjectToUri(obj);
    }
    /**
     * Capitalize the first Letter of every word in a string
     * @param str
     * @returns str
     */
    toTitleCase(str) {
        return TitleCase(str);
    }
    /**
     * Convert a date to yyyy:mm:dd 00:00:00
     * @param value date
     */
    dateTimeFormat(value) {
        return ConvertDateToDateTimeFormat(value);
    }
    /**
     * Convert a date to yyyy:mm:dd
     * @param value date
     */
    dateFormat(value, format = 'yyyy-mm-dd') {
        return ConvertDateFormat(value, format);
    }
    today(format = 'yyyy-mm-dd') {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        return this.dateFormat(mm + '/' + dd + '/' + yyyy);
    }
    addDays(date, days) {
        const copy = new Date(Number(date));
        copy.setDate(date.getDate() + days);
        return copy;
    }
    /**
     * Replace all occurrences of an sequence within a string
     * @param str
     * @param find
     * @param replace
     */
    replaceAll(str, find, replace) {
        return StringReplaceAll(str, find, replace);
    }
    /**
     * Convert a string from snake case to Pascal Case
     * @param field
     * @returns string
     */
    snakeToPascal(field) {
        return SnakeToPascal(field);
    }
    /**
     * Convert a string with hyphens to Pascal Case
     * @param field
     * @returns string
     */
    hyphenToPascal(field) {
        return HyphenToPascal(field);
    }
    /**
     * Convert a string with spaces to snake case .. 'this is snake case' to 'this_is_snake_case'
     * @param field
     * @returns string
     */
    spaceToSnake(pascal) {
        return SpaceToSnake(pascal);
    }
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
    hasFilter(obj, tags) {
        return ObjectContainsTagSearch(obj, tags);
    }
    deepCopy(obj) {
        return DeepCopy(obj);
    }
    getHttpErrorMsg(err) {
        return GetHttpErrorMsg(err);
    }
    getStoragePath(storage, steps, defaultValue = null) {
        return StorageGetter(storage, steps, defaultValue);
    }
    uid() {
        return PopUid();
    }
}
PopCommonService.ɵprov = i0.ɵɵdefineInjectable({ factory: function PopCommonService_Factory() { return new PopCommonService(); }, token: PopCommonService, providedIn: "root" });
PopCommonService.decorators = [
    { type: Injectable, args: [{
                providedIn: 'root'
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWNvbW1vbi5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL3NlcnZpY2VzL3BvcC1jb21tb24uc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTNDLE9BQU8sRUFDTCxnQkFBZ0IsRUFDaEIsY0FBYyxFQUNkLGVBQWUsRUFDZixXQUFXLEVBQ1gsaUJBQWlCLEVBQUUsMkJBQTJCLEVBQzlDLGtCQUFrQixFQUFFLFFBQVEsRUFDNUIsV0FBVyxFQUFFLGVBQWUsRUFBRSxjQUFjLEVBQzVDLE9BQU8sRUFDUCxRQUFRLEVBQ1IsUUFBUSxFQUNSLFFBQVEsRUFBRSx1QkFBdUIsRUFDakMsTUFBTSxFQUFFLGFBQWEsRUFBRSxZQUFZLEVBQUUsYUFBYSxFQUFFLGdCQUFnQixFQUFFLFNBQVMsRUFDL0UsT0FBTyxFQUFFLFFBQVEsRUFDbEIsTUFBTSx1QkFBdUIsQ0FBQzs7QUFNL0IsTUFBTSxPQUFPLGdCQUFnQjtJQUg3QjtRQUtTLFNBQUksR0FBRyxrQkFBa0IsQ0FBQztLQWtVbEM7SUEvVEMsZ0JBQWdCLENBQUMsT0FBc0IsRUFBRSxRQUF1QixFQUFFLFNBQWtCLEtBQUs7UUFDdkYsT0FBTyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ3JELENBQUM7SUFHRCxvREFBb0Q7SUFDcEQsK0NBQStDO0lBQy9DLDZEQUE2RDtJQUM3RCxxREFBcUQ7SUFDckQseUJBQXlCO0lBQ3pCLFdBQVcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxHQUFHLEtBQUs7UUFDNUIsT0FBTyxXQUFXLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ2pDLENBQUM7SUFHRDs7Ozs7T0FLRztJQUNILFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUNiLElB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UUFDekIsT0FBTyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUdEOzs7Ozs7Ozs7Ozs7T0FZRztJQUNILFNBQVMsQ0FBQyxHQUFXLEVBQUUsSUFBWTtRQUNqQyxPQUFPLHVCQUF1QixDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBR0QsUUFBUSxDQUFDLEdBQVc7UUFDbEIsT0FBTyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDdkIsQ0FBQztJQUdELGVBQWUsQ0FBQyxHQUFzQjtRQUNwQyxPQUFPLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUU5QixDQUFDO0lBR0QsY0FBYyxDQUFDLE9BQWUsRUFBRSxLQUFlLEVBQUUsWUFBWSxHQUFHLElBQUk7UUFDbEUsT0FBTyxhQUFhLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxZQUFZLENBQUMsQ0FBQztJQUNyRCxDQUFDO0lBR0QsR0FBRztRQUNELE9BQU8sTUFBTSxFQUFFLENBQUM7SUFDbEIsQ0FBQzs7OztZQXBVRixVQUFVLFNBQUM7Z0JBQ1YsVUFBVSxFQUFFLE1BQU07YUFDbkIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBIdHRwRXJyb3JSZXNwb25zZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcbmltcG9ydCB7XG4gIEFycmF5Q29udGFpbnNBbGwsXG4gIEFycmF5TWFwU2V0dGVyLFxuICBBcnJheU9ubHlVbmlxdWUsXG4gIEFycmF5c01hdGNoLFxuICBDb252ZXJ0RGF0ZUZvcm1hdCwgQ29udmVydERhdGVUb0RhdGVUaW1lRm9ybWF0LFxuICBDb252ZXJ0T2JqZWN0VG9VcmksIERlZXBDb3B5LFxuICBEeW5hbWljU29ydCwgR2V0SHR0cEVycm9yTXNnLCBIeXBoZW5Ub1Bhc2NhbCxcbiAgSXNBcnJheSxcbiAgSXNOdW1iZXIsXG4gIElzT2JqZWN0LFxuICBJc1N0cmluZywgT2JqZWN0Q29udGFpbnNUYWdTZWFyY2gsXG4gIFBvcFVpZCwgU25ha2VUb1Bhc2NhbCwgU3BhY2VUb1NuYWtlLCBTdG9yYWdlR2V0dGVyLCBTdHJpbmdSZXBsYWNlQWxsLCBUaXRsZUNhc2UsXG4gIFRvQXJyYXksIFRvT2JqZWN0XG59IGZyb20gJy4uL3BvcC1jb21tb24tdXRpbGl0eSc7XG5cblxuQEluamVjdGFibGUoe1xuICBwcm92aWRlZEluOiAncm9vdCdcbn0pXG5leHBvcnQgY2xhc3MgUG9wQ29tbW9uU2VydmljZSB7XG5cbiAgcHVibGljIG5hbWUgPSAnUG9wQ29tbW9uU2VydmljZSc7XG5cblxuICBhcnJheUNvbnRhaW5zQWxsKG5lZWRsZXM6IEFycmF5PHN0cmluZz4sIGhheXN0YWNrOiBBcnJheTxzdHJpbmc+LCBzdHJpY3Q6IGJvb2xlYW4gPSBmYWxzZSl7XG4gICAgcmV0dXJuIEFycmF5Q29udGFpbnNBbGwobmVlZGxlcywgaGF5c3RhY2ssIHN0cmljdCk7XG4gIH1cblxuXG4gIC8vIGZ1bmN0aW9uIGZvciBkeW5hbWljIHNvcnRpbmcgYW4gYXJyYXkgb2Ygb2JqZWN0cy5cbiAgLy8gLSBVc2FnZTogc29tZUFycmF5LnNvcnQoZHluYW1pY1NvcnQoJ2tleScpKTtcbiAgLy8gQHBhcmFtIGtleTogVGhlIG5hbWUgb2YgdGhlIGtleSBpbiBlYWNoIG9iamVjdCB0byBzb3J0IG9uLlxuICAvLyBAcGFyYW0gb3JkZXI6IGFzYyAoQXNjZW5kaW5nKSBvciBkZXNjIChEZXNjZW5kaW5nKVxuICAvLyBAcmV0dXJuOiBzb3J0ZWQgYXJyYXkuXG4gIGR5bmFtaWNTb3J0KGtleSwgb3JkZXIgPSAnYXNjJyl7XG4gICAgcmV0dXJuIER5bmFtaWNTb3J0KGtleSwgb3JkZXIpO1xuICB9XG5cblxuICAvKipcbiAgICogU29ydHMgb24gc29ydFxuICAgKiBAcGFyYW0gYVxuICAgKiBAcGFyYW0gYlxuICAgKiByZXR1cm5zIGludFxuICAgKi9cbiAgc29ydEJ5U29ydChhLCBiKXtcbiAgICBpZiggYS5zb3J0IDwgYi5zb3J0ICkgcmV0dXJuIC0xO1xuICAgIGlmKCBhLnNvcnQgPiBiLnNvcnQgKSByZXR1cm4gMTtcbiAgICByZXR1cm4gMDtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFNvcnRzIG9uIG5hbWUgZmllbGRcbiAgICogQHBhcmFtIGFcbiAgICogQHBhcmFtIGJcbiAgICogcmV0dXJucyBpbnRcbiAgICovXG4gIHNvcnRCeU5hbWUoYSwgYil7XG4gICAgaWYoIGEubmFtZSA8IGIubmFtZSApIHJldHVybiAtMTtcbiAgICBpZiggYS5uYW1lID4gYi5uYW1lICkgcmV0dXJuIDE7XG4gICAgcmV0dXJuIDA7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBTb3J0cyBvbiBwb3NpdGlvbiBmaWVsZFxuICAgKiBAcGFyYW0gYVxuICAgKiBAcGFyYW0gYlxuICAgKiByZXR1cm5zIGludFxuICAgKi9cbiAgc29ydEJ5UG9zaXRpb24oYSwgYil7XG4gICAgaWYoICthLnBvc2l0aW9uIDwgK2IucG9zaXRpb24gKSByZXR1cm4gLTE7XG4gICAgaWYoICthLnBvc2l0aW9uID4gK2IucG9zaXRpb24gKSByZXR1cm4gMTtcbiAgICByZXR1cm4gMDtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFNvcnRzIG9uIGVudGl0eUlkIGZpZWxkXG4gICAqIEBwYXJhbSBhXG4gICAqIEBwYXJhbSBiXG4gICAqIHJldHVybnMgaW50XG4gICAqL1xuXG4gIHNvcnRCeUlkKGEsIGIpe1xuICAgIGlmKCBhLmlkIDwgYi5pZCApIHJldHVybiAtMTtcbiAgICBpZiggYS5pZCA+IGIuaWQgKSByZXR1cm4gMTtcbiAgICByZXR1cm4gMDtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB0d28gYXJyYXlzIG1hdGNoXG4gICAqXG4gICAqIEBwYXJhbSBhcnIxXG4gICAqIEBwYXJhbSBhcnIyXG4gICAqIEBwYXJhbSBmaWVsZCAtb3B0aW9uYWxcbiAgICpcbiAgICogLSBpZiBmaWVsZCBpcyBwYXNzZWQgLSBjaGVjayB0byBzZWUgaWYgdGhlIGZpZWxkIGlzIHRoZSBzYW1lIGluIGJvdGggYXJyYXlzXG4gICAqXG4gICAqIEByZXR1cm5zIGJvb2xlYW5cbiAgICovXG4gIGFycmF5c01hdGNoKGFycjE6IGFueVtdLCBhcnIyOiBhbnlbXSwgZmllbGQ6IHN0cmluZyl7XG4gICAgcmV0dXJuIEFycmF5c01hdGNoKGFycjEsIGFycjIsIGZpZWxkKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIENvbnZlcnQgYW4gb2JqZWN0IGludG8gYW4gYXJyYXlcbiAgICogQHBhcmFtIG9ialxuICAgKiBAcmV0dXJucyBhcnJheVxuICAgKi9cbiAgdG9BcnJheShvYmo6IG9iamVjdCl7XG4gICAgcmV0dXJuIFRvQXJyYXkob2JqKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEEgaGVscGVyIGZ1bmN0aW9uIHRvIGRldGVybWluZSBpZiBhIHZhcmlhYmxlIGlzIG51bXJlcmljXG4gICAqIEBwYXJhbSB2YWx1ZVxuICAgKi9cbiAgaXNOdW1iZXIodmFsdWU6IGFueSwgcmVxdWlyZVRydXRoeT86IGJvb2xlYW4pOiBib29sZWFue1xuICAgIHJldHVybiBJc051bWJlcih2YWx1ZSwgcmVxdWlyZVRydXRoeSk7XG4gIH1cblxuXG4gIGlzQXJyYXkoYXJyOiBhbnksIHJlcXVpcmVMZW5ndGggPSBmYWxzZSk6IGJvb2xlYW57XG4gICAgcmV0dXJuIElzQXJyYXkoYXJyLCByZXF1aXJlTGVuZ3RoKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEEgaGVscGVyIGZ1bmN0aW9uIHRvIGRldGVybWluZSBpZiBhIHZhcmlhYmxlIGlzIGEgcXVhbGlmaWVkIG9iamVjdFxuICAgKlxuICAgKiBAcGFyYW0gdmFsdWVcbiAgICogQHBhcmFtIHJlcXVpcmVLZXlzXG4gICAqIEBwYXJhbSB0aHJvd0Vycm9yXG4gICAqL1xuICBpc09iamVjdCh2YWx1ZTogYW55LCByZXF1aXJlS2V5cyA9IGZhbHNlKTogYm9vbGVhbntcbiAgICByZXR1cm4gSXNPYmplY3QodmFsdWUsIHJlcXVpcmVLZXlzKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqXG4gICAqIEEgaGVscGVyIGZ1bmN0aW9uIHRvIGRldGVybWluZSBpZiBhIHZhcmlhYmxlIGlzIGEgcXVhbGlmaWVkIHN0cmluZ1xuICAgKiBAcGFyYW0gdmFsdWVcbiAgICogQHBhcmFtIHJlcXVpcmVMZW5ndGhcbiAgICogQHBhcmFtIHRocm93RXJyb3JcbiAgICovXG4gIGlzU3RyaW5nKHZhbHVlOiBhbnksIHJlcXVpcmVMZW5ndGggPSBmYWxzZSk6IGJvb2xlYW57XG4gICAgcmV0dXJuIElzU3RyaW5nKHZhbHVlLCByZXF1aXJlTGVuZ3RoKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEhlbHBlciBtZXRob2QgdG8gcmVtb3ZlIGR1cGxpY2F0ZSBpdGVtcyBmcm9tIGEgIGZsYXQgYXJyYXkgWzEsMiwzLDEsMV0sIFtbJ2EnLCdiJywnYycsJ2EnXVxuICAgKiBAcGFyYW0gYXJyXG4gICAqL1xuICBvbmx5QXJyYXlVbmlxdWUoYXJyOiBhbnlbXSl7XG4gICAgcmV0dXJuIEFycmF5T25seVVuaXF1ZShhcnIpO1xuICB9XG5cblxuICAvKipcbiAgICogSGVscGVyIG1ldGhvZCB0byByZW1vdmUgZHVwbGljYXRlIG9iamVjdHMgaW4gYW4gYXJyYXkgdGhhdCBzaGFyZSBhIHNwZWNpZmljIHByb3BlcnR5IFt7ZW50aXR5SWQ6MSwgLi4ufSx7ZW50aXR5SWQ6MiwgLi4ufSx7ZW50aXR5SWQ6MywgLi4ufSx7ZW50aXR5SWQ6MSwgLi4ufSwgXVxuICAgKiBAcGFyYW0gYXJyXG4gICAqL1xuICByZW1vdmVBcnJheUR1cGxpY2F0ZXMoYXJyYXk6IG9iamVjdFtdLCBwcm9wKXtcbiAgICByZXR1cm4gYXJyYXkuZmlsdGVyKChvYmosIHBvcywgYXJyKSA9PiB7XG4gICAgICByZXR1cm4gYXJyLm1hcChtYXBPYmogPT4gbWFwT2JqWyBwcm9wIF0pLmluZGV4T2Yob2JqWyBwcm9wIF0pID09PSBwb3M7XG4gICAgfSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBNYXAgYW4gYXJyYXkgYnkgYSBhcnJheSBrZXkgZmllbGRcbiAgICogQHBhcmFtIG9ialxuICAgKiBAcmV0dXJucyBhcnJheVxuICAgKi9cbiAgbWFwQXJyYXlXaXRoS2V5KGFycmF5LCBhcnJheV9rZXlfZmllbGQ6IHN0cmluZyl7XG4gICAgcmV0dXJuIEFycmF5TWFwU2V0dGVyKGFycmF5LCBhcnJheV9rZXlfZmllbGQpO1xuICB9XG5cblxuICAvKipcbiAgICogQ29udmVydCBhbiBBcnJheSB0byBPYmplY3RcbiAgICogQHBhcmFtIGFyclxuICAgKiBAcmV0dXJucyBPYmplY3RcbiAgICovXG4gIHRvT2JqZWN0KGFycjogYW55W10pe1xuICAgIHJldHVybiBUb09iamVjdChhcnIpO1xuICB9XG5cblxuICAvKipcbiAgICogQ29udmVydCBhbiBBcnJheSBvZiBvYmplY3RzICB0byBEaWN0aW9uYXJ5KG9iamVjdClcbiAgICogQHBhcmFtIGFyclxuICAgKiBAcmV0dXJucyBPYmplY3RcbiAgICovXG4gIHRvRGljdGlvbmFyeShhcnI6IGFueVtdLCBrZXk6IHN0cmluZyl7XG4gICAgY29uc3QgZGljdGlvbmFyeSA9IHt9O1xuICAgIGlmKCBhcnIgJiYgQXJyYXkuaXNBcnJheShhcnIpICYmIGFyci5sZW5ndGggKXtcbiAgICAgIGFyci5tYXAoKGl0ZW0pID0+IHtcbiAgICAgICAgaWYoIHR5cGVvZiBpdGVtWyBrZXkgXSAhPT0gdW5kZWZpbmVkICkgZGljdGlvbmFyeVsgaXRlbVsga2V5IF0gXSA9IGl0ZW07XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGRpY3Rpb25hcnk7XG4gIH1cblxuXG4gIHRvVXJpKG9iajogb2JqZWN0IHwgYW55W10pe1xuICAgIHJldHVybiBDb252ZXJ0T2JqZWN0VG9Vcmkob2JqKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIENhcGl0YWxpemUgdGhlIGZpcnN0IExldHRlciBvZiBldmVyeSB3b3JkIGluIGEgc3RyaW5nXG4gICAqIEBwYXJhbSBzdHJcbiAgICogQHJldHVybnMgc3RyXG4gICAqL1xuICB0b1RpdGxlQ2FzZShzdHI6IHN0cmluZyl7XG4gICAgcmV0dXJuIFRpdGxlQ2FzZShzdHIpO1xuICB9XG5cblxuICAvKipcbiAgICogQ29udmVydCBhIGRhdGUgdG8geXl5eTptbTpkZCAwMDowMDowMFxuICAgKiBAcGFyYW0gdmFsdWUgZGF0ZVxuICAgKi9cbiAgZGF0ZVRpbWVGb3JtYXQodmFsdWUpe1xuICAgIHJldHVybiBDb252ZXJ0RGF0ZVRvRGF0ZVRpbWVGb3JtYXQodmFsdWUpO1xuICB9XG5cblxuICAvKipcbiAgICogQ29udmVydCBhIGRhdGUgdG8geXl5eTptbTpkZFxuICAgKiBAcGFyYW0gdmFsdWUgZGF0ZVxuICAgKi9cbiAgZGF0ZUZvcm1hdCh2YWx1ZSwgZm9ybWF0ID0gJ3l5eXktbW0tZGQnKXtcbiAgICByZXR1cm4gQ29udmVydERhdGVGb3JtYXQodmFsdWUsIGZvcm1hdCk7XG4gIH1cblxuXG4gIHRvZGF5KGZvcm1hdCA9ICd5eXl5LW1tLWRkJyk6IHN0cmluZ3tcbiAgICBjb25zdCB0b2RheSA9IG5ldyBEYXRlKCk7XG4gICAgY29uc3QgZGQgPSBTdHJpbmcodG9kYXkuZ2V0RGF0ZSgpKS5wYWRTdGFydCgyLCAnMCcpO1xuICAgIGNvbnN0IG1tID0gU3RyaW5nKHRvZGF5LmdldE1vbnRoKCkgKyAxKS5wYWRTdGFydCgyLCAnMCcpO1xuICAgIGNvbnN0IHl5eXkgPSB0b2RheS5nZXRGdWxsWWVhcigpO1xuXG4gICAgcmV0dXJuIHRoaXMuZGF0ZUZvcm1hdChtbSArICcvJyArIGRkICsgJy8nICsgeXl5eSk7XG4gIH1cblxuXG4gIGFkZERheXMoZGF0ZSwgZGF5cyl7XG4gICAgY29uc3QgY29weSA9IG5ldyBEYXRlKE51bWJlcihkYXRlKSk7XG4gICAgY29weS5zZXREYXRlKGRhdGUuZ2V0RGF0ZSgpICsgZGF5cyk7XG4gICAgcmV0dXJuIGNvcHk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBSZXBsYWNlIGFsbCBvY2N1cnJlbmNlcyBvZiBhbiBzZXF1ZW5jZSB3aXRoaW4gYSBzdHJpbmdcbiAgICogQHBhcmFtIHN0clxuICAgKiBAcGFyYW0gZmluZFxuICAgKiBAcGFyYW0gcmVwbGFjZVxuICAgKi9cbiAgcmVwbGFjZUFsbChzdHI6IHN0cmluZywgZmluZDogc3RyaW5nLCByZXBsYWNlOiBzdHJpbmcpe1xuICAgIHJldHVybiBTdHJpbmdSZXBsYWNlQWxsKHN0ciwgZmluZCwgcmVwbGFjZSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBDb252ZXJ0IGEgc3RyaW5nIGZyb20gc25ha2UgY2FzZSB0byBQYXNjYWwgQ2FzZVxuICAgKiBAcGFyYW0gZmllbGRcbiAgICogQHJldHVybnMgc3RyaW5nXG4gICAqL1xuICBzbmFrZVRvUGFzY2FsKGZpZWxkOiBzdHJpbmcpOiBzdHJpbmd7XG4gICAgcmV0dXJuIFNuYWtlVG9QYXNjYWwoZmllbGQpO1xuXG4gIH1cblxuXG4gIC8qKlxuICAgKiBDb252ZXJ0IGEgc3RyaW5nIHdpdGggaHlwaGVucyB0byBQYXNjYWwgQ2FzZVxuICAgKiBAcGFyYW0gZmllbGRcbiAgICogQHJldHVybnMgc3RyaW5nXG4gICAqL1xuICBoeXBoZW5Ub1Bhc2NhbChmaWVsZDogc3RyaW5nKTogc3RyaW5ne1xuICAgIHJldHVybiBIeXBoZW5Ub1Bhc2NhbChmaWVsZCk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBDb252ZXJ0IGEgc3RyaW5nIHdpdGggc3BhY2VzIHRvIHNuYWtlIGNhc2UgLi4gJ3RoaXMgaXMgc25ha2UgY2FzZScgdG8gJ3RoaXNfaXNfc25ha2VfY2FzZSdcbiAgICogQHBhcmFtIGZpZWxkXG4gICAqIEByZXR1cm5zIHN0cmluZ1xuICAgKi9cbiAgc3BhY2VUb1NuYWtlKHBhc2NhbDogc3RyaW5nKTogc3RyaW5ne1xuICAgIHJldHVybiBTcGFjZVRvU25ha2UocGFzY2FsKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEEgY29tcGxleCBmdXp6eSBzZWFyY2ggdG8gZGV0ZXJtaW5lIGlmIGFuIG9iamVjdCdzIHZhbHVlcyBjb250YWlucyBhIHNlcmllcyBvZiBmaWx0ZXIgXCJ0YWdzXCJcbiAgICogQHBhcmFtIG9iamVjdCBvYmo6IFRoZSBPYmplY3QgdGhhdCB5b3Ugd2FudCB0byBzZWUgaWYgdGhlIGZpZWxkSXRlbXMgbWF0Y2ggdGhlIGZpbHRlclxuICAgKiBAcGFyYW0gc3RyaW5nIHRhZ3M6IFRoZSBmaWx0ZXIgc3RyaW5nIHlvdSB3YW50IHRvIG1hdGNoIGFnYWluc3Qgb2JqLlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgVXNlcyAoISlub3QsICgmKWFuZCwgKCwpb3Igc3ludGF4IGZvciBjb21wbGV4IGNoYWluaW5nLlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgZXhhbXBsZTogJ2pvaG4nIHJldHVybnMgdHJ1ZSBpZiBhIGZpZWxkIHZhbHVlIGNvbnRhaW5zICdqb2huJ1xuICAgKiAgICAgICAgICAgICAgICAgICAgICAgZXhhbXBsZTogJ2pvaG4samFuZSxkb2UnIHJldHVybnMgdHJ1ZSBpZiBhIGZpZWxkIHZhbHVlIGNvbnRhaW5zIGFueSBvZiB0aGUgdmFsdWVzXG4gICAqICAgICAgICAgICAgICAgICAgICAgICBleGFtcGxlOiAnam9obiZkb2UnIHJldHVybnMgdHJ1ZSBvbmx5IGlmIG9iaiBjb250YWlucyAnam9obicgYW5kICBjb250YWlucyAnZG9lJ1xuICAgKiAgICAgICAgICAgICAgICAgICAgICAgZXhhbXBsZTogJ2pvaG4sIWRvZScgcmV0dXJucyB0cnVlIG9ubHkgaWYgb2JqIGNvbnRhaW5zICdqb2huJyBhbmQgZG9lcyBub3QgY29udGFpbiAnZG9lJ1xuICAgKlxuICAgKlxuICAgKiBAcmV0dXJucyBib29sZWFuXG4gICAqL1xuICBoYXNGaWx0ZXIob2JqOiBvYmplY3QsIHRhZ3M6IHN0cmluZyl7XG4gICAgcmV0dXJuIE9iamVjdENvbnRhaW5zVGFnU2VhcmNoKG9iaiwgdGFncyk7XG4gIH1cblxuXG4gIGRlZXBDb3B5KG9iajogb2JqZWN0KXtcbiAgICByZXR1cm4gRGVlcENvcHkob2JqKTtcbiAgfVxuXG5cbiAgZ2V0SHR0cEVycm9yTXNnKGVycjogSHR0cEVycm9yUmVzcG9uc2Upe1xuICAgIHJldHVybiBHZXRIdHRwRXJyb3JNc2coZXJyKTtcblxuICB9XG5cblxuICBnZXRTdG9yYWdlUGF0aChzdG9yYWdlOiBvYmplY3QsIHN0ZXBzOiBzdHJpbmdbXSwgZGVmYXVsdFZhbHVlID0gbnVsbCk6IGFueXtcbiAgICByZXR1cm4gU3RvcmFnZUdldHRlcihzdG9yYWdlLCBzdGVwcywgZGVmYXVsdFZhbHVlKTtcbiAgfVxuXG5cbiAgdWlkKCl7XG4gICAgcmV0dXJuIFBvcFVpZCgpO1xuICB9XG5cblxufVxuIl19