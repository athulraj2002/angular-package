import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { PopBaseService } from './pop-base.service';
import { PopRequestService } from './pop-request.service';
import { Observable } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class PopPreferenceService {

  constructor(
    private http: HttpClient,
    private request: PopRequestService
  ){
  }


  /**
   * Get preferences at specified level.
   *  - IE: getPreferences('admin', 'users', 'table');
   *
   * @param level1
   * @param level2
   * @param level3
   * @param level4
   * @returns
   */
  public getPreferences(level1: string, level2 = '', level3 = '', level4 = ''): Observable<any>{
    let path = '/preferences/' + level1;
    if( level2 ) path += '/' + level2;
    if( level3 ) path += '/' + level3;
    if( level4 ) path += '/' + level4;
    return this.request.doGet(path, {}, 1);
  }


  /**
   * Saves a preferences at the specified level.
   *  - IE: savePreferences('TablePreferences', {some:object}, 'admin', 'users', 'table');
   *
   * @param name
   * @param data
   * @param level1
   * @param level2
   * @param level3
   * @param level4
   * @returns
   */
  public savePreferences(name: string, data: any, level1: string, level2 = '', level3 = '', level4 = ''): Observable<any>{
    let path = '/preferences/' + level1;
    if( level2 ) path += '/' + level2;
    if( level3 ) path += '/' + level3;
    if( level4 ) path += '/' + level4;

    return this.request.doPost(path, { name: name, data: data });
  }


  /**
   * Deletes a specified preference. Typically used when resetting to default.
   *  - IE: deletePreferences('TablePreferences', 'admin', 'users', 'table');
   *
   * @param name
   * @param level1
   * @param level2
   * @param level3
   * @param level4
   * @returns
   */
  public deletePreferences(name: string, level1: string, level2 = '', level3 = '', level4 = ''): Observable<any>{
    let path = '/preferences/' + level1;
    if( level2 ) path += '/' + level2;
    if( level3 ) path += '/' + level3;
    if( level4 ) path += '/' + level4;
    path += '/' + name;

    return this.request.doDelete(path);
  }
}
