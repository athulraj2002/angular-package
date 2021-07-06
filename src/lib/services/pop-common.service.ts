import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ArrayContainsAll,
  ArrayMapSetter,
  ArrayOnlyUnique,
  ArraysMatch,
  ConvertDateFormat, ConvertDateToDateTimeFormat,
  ConvertObjectToUri, DeepCopy,
  DynamicSort, GetHttpErrorMsg, HyphenToPascal,
  IsArray,
  IsNumber,
  IsObject,
  IsString, ObjectContainsTagSearch,
  PopUid, SnakeToPascal, SpaceToSnake, StorageGetter, StringReplaceAll, TitleCase,
  ToArray, ToObject
} from '../pop-common-utility';


@Injectable({
  providedIn: 'root'
})
export class PopCommonService {

  public name = 'PopCommonService';


  arrayContainsAll(needles: Array<string>, haystack: Array<string>, strict: boolean = false){
    return ArrayContainsAll(needles, haystack, strict);
  }


  // function for dynamic sorting an array of objects.
  // - Usage: someArray.sort(dynamicSort('key'));
  // @param key: The name of the key in each object to sort on.
  // @param order: asc (Ascending) or desc (Descending)
  // @return: sorted array.
  dynamicSort(key, order = 'asc'){
    return DynamicSort(key, order);
  }


  /**
   * Sorts on sort
   * @param a
   * @param b
   * returns int
   */
  sortBySort(a, b){
    if( a.sort < b.sort ) return -1;
    if( a.sort > b.sort ) return 1;
    return 0;
  }


  /**
   * Sorts on name field
   * @param a
   * @param b
   * returns int
   */
  sortByName(a, b){
    if( a.name < b.name ) return -1;
    if( a.name > b.name ) return 1;
    return 0;
  }


  /**
   * Sorts on position field
   * @param a
   * @param b
   * returns int
   */
  sortByPosition(a, b){
    if( +a.position < +b.position ) return -1;
    if( +a.position > +b.position ) return 1;
    return 0;
  }


  /**
   * Sorts on entityId field
   * @param a
   * @param b
   * returns int
   */

  sortById(a, b){
    if( a.id < b.id ) return -1;
    if( a.id > b.id ) return 1;
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
  arraysMatch(arr1: any[], arr2: any[], field: string){
    return ArraysMatch(arr1, arr2, field);
  }


  /**
   * Convert an object into an array
   * @param obj
   * @returns array
   */
  toArray(obj: object){
    return ToArray(obj);
  }


  /**
   * A helper function to determine if a variable is numreric
   * @param value
   */
  isNumber(value: any, requireTruthy?: boolean): boolean{
    return IsNumber(value, requireTruthy);
  }


  isArray(arr: any, requireLength = false): boolean{
    return IsArray(arr, requireLength);
  }


  /**
   * A helper function to determine if a variable is a qualified object
   *
   * @param value
   * @param requireKeys
   * @param throwError
   */
  isObject(value: any, requireKeys = false): boolean{
    return IsObject(value, requireKeys);
  }


  /**
   *
   * A helper function to determine if a variable is a qualified string
   * @param value
   * @param requireLength
   * @param throwError
   */
  isString(value: any, requireLength = false): boolean{
    return IsString(value, requireLength);
  }


  /**
   * Helper method to remove duplicate items from a  flat array [1,2,3,1,1], [['a','b','c','a']
   * @param arr
   */
  onlyArrayUnique(arr: any[]){
    return ArrayOnlyUnique(arr);
  }


  /**
   * Helper method to remove duplicate objects in an array that share a specific property [{entityId:1, ...},{entityId:2, ...},{entityId:3, ...},{entityId:1, ...}, ]
   * @param arr
   */
  removeArrayDuplicates(array: object[], prop){
    return array.filter((obj, pos, arr) => {
      return arr.map(mapObj => mapObj[ prop ]).indexOf(obj[ prop ]) === pos;
    });
  }


  /**
   * Map an array by a array key field
   * @param obj
   * @returns array
   */
  mapArrayWithKey(array, array_key_field: string){
    return ArrayMapSetter(array, array_key_field);
  }


  /**
   * Convert an Array to Object
   * @param arr
   * @returns Object
   */
  toObject(arr: any[]){
    return ToObject(arr);
  }


  /**
   * Convert an Array of objects  to Dictionary(object)
   * @param arr
   * @returns Object
   */
  toDictionary(arr: any[], key: string){
    const dictionary = {};
    if( arr && Array.isArray(arr) && arr.length ){
      arr.map((item) => {
        if( typeof item[ key ] !== undefined ) dictionary[ item[ key ] ] = item;
      });
    }
    return dictionary;
  }


  toUri(obj: object | any[]){
    return ConvertObjectToUri(obj);
  }


  /**
   * Capitalize the first Letter of every word in a string
   * @param str
   * @returns str
   */
  toTitleCase(str: string){
    return TitleCase(str);
  }


  /**
   * Convert a date to yyyy:mm:dd 00:00:00
   * @param value date
   */
  dateTimeFormat(value){
    return ConvertDateToDateTimeFormat(value);
  }


  /**
   * Convert a date to yyyy:mm:dd
   * @param value date
   */
  dateFormat(value, format = 'yyyy-mm-dd'){
    return ConvertDateFormat(value, format);
  }


  today(format = 'yyyy-mm-dd'): string{
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();

    return this.dateFormat(mm + '/' + dd + '/' + yyyy);
  }


  addDays(date, days){
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
  replaceAll(str: string, find: string, replace: string){
    return StringReplaceAll(str, find, replace);
  }


  /**
   * Convert a string from snake case to Pascal Case
   * @param field
   * @returns string
   */
  snakeToPascal(field: string): string{
    return SnakeToPascal(field);

  }


  /**
   * Convert a string with hyphens to Pascal Case
   * @param field
   * @returns string
   */
  hyphenToPascal(field: string): string{
    return HyphenToPascal(field);
  }


  /**
   * Convert a string with spaces to snake case .. 'this is snake case' to 'this_is_snake_case'
   * @param field
   * @returns string
   */
  spaceToSnake(pascal: string): string{
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
  hasFilter(obj: object, tags: string){
    return ObjectContainsTagSearch(obj, tags);
  }


  deepCopy(obj: object){
    return DeepCopy(obj);
  }


  getHttpErrorMsg(err: HttpErrorResponse){
    return GetHttpErrorMsg(err);

  }


  getStoragePath(storage: object, steps: string[], defaultValue = null): any{
    return StorageGetter(storage, steps, defaultValue);
  }


  uid(){
    return PopUid();
  }


}
