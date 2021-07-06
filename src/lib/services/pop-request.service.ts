import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable, isDevMode } from '@angular/core';
import { Observable } from 'rxjs';
import { ConvertObjectToUri, IsArray, IsObject, IsString } from '../pop-common-utility';
import { PopBusiness } from '../pop-common.model';


@Injectable({
  providedIn: 'root'
})
export class PopRequestService {

  private readonly offsetLimit = 2000;
  private baseUrl: string;


  constructor(
    private http: HttpClient,
    @Inject('env') private env?,
  ){
    // if( +this.env.offsetLimit ) this.offsetLimit = this.env.offsetLimit;
    if( !this.baseUrl ){
      const envUrl = isDevMode() && this.env && this.env.apiBaseUrl ? this.env.apiBaseUrl : null;
      this.baseUrl = ( envUrl ? envUrl : `${ window.location.protocol }//api.${ window.location.host }` );
    }
  }


  public getHeaders(version, businessId = 0){
    return {
      'X-Popcx-Business': +businessId ? String(businessId): PopBusiness ? String(PopBusiness.id) : String(0),
      'Content-Type': 'application/json',
      'Api-Version': ( typeof version !== 'undefined' ? version : 1 ).toString()
    };
  }


  public getBaseUrl(){
    return this.baseUrl.slice();
  }


  public setBaseUrl(baseUrl: string): void{
    if( IsString(baseUrl, true) ){
      this.baseUrl = baseUrl;
    }
  }


  public getOffsetLimit(){
    return this.offsetLimit;
  }


  doGet(url: string, params: object = {}, version: number = 1, ignore401: boolean = false, businessId = 0): Observable<any>{
    const options = {
      headers: new HttpHeaders(this.getHeaders(version, businessId)),
      params: this._setParams(params)
    };
    if( ignore401 ) options.headers.set('SkipResponse401Interceptor', '1');

    if( url[ 0 ] !== '/' ) url = `/${url}`;

    return this.http.get<any>(`${ this.getBaseUrl() }${ url }`, options);
  }


  doDelete(url: string, body: object = null, version: number = 1, ignore401: boolean = null, businessId = 0): Observable<any>{
    const options = {
      headers: new HttpHeaders(this.getHeaders(version, businessId)),
      body: body,
    };
    if( ignore401 ) options.headers.set('SkipResponse401Interceptor', '1');
    if( url[ 0 ] !== '/' ) url = `/${url}`;
    // if( data ) options.params = new HttpParams(data);
    return this.http.delete<any>(`${ this.getBaseUrl() }${ url }`, options);
  }


  doPatch(url: string, data: object, version: number = 1, ignore401: boolean = false, businessId = 0): Observable<any>{
    const headers = new HttpHeaders(this.getHeaders(version, businessId));
    if( ignore401 ) headers.set('SkipResponse401Interceptor', '1');
    if( url[ 0 ] !== '/' ) url = `/${url}`;
    return this.http.patch(this.getBaseUrl() + url, JSON.stringify(data), { headers: headers });
  }


  doPost(url: string, data: object, version: number = 1, ignore401: boolean = false, businessId = 0): Observable<any>{
    const headers = new HttpHeaders(this.getHeaders(version, businessId));
    if( ignore401 ) headers.set('SkipResponse401Interceptor', '1');
    if( url[ 0 ] !== '/' ) url = `/${url}`;
    return this.http.post<any>(`${ this.getBaseUrl() }${ url }`, JSON.stringify(data), { headers: headers });
  }


  transform(value: string | number, transformation: any){
    if( IsArray(transformation, true) ){
      transformation.map((transKey) => {
        // value = this.commonRepo.transform(value, transKey);
      });
    }else if( IsString(transformation, true) ){
      // value = this.commonRepo.transform(value, transformation);
    }
    return value;
  }


  private _setParams(body){
    let params: HttpParams = new HttpParams();
    for( const key of Object.keys(body) ){
      if( body[ key ] ){
        if( body[ key ] instanceof Array ){
          body[ key ].forEach((item) => {
            params = params.append(`${key.toString()}[]`, item);
          });
        }else{
          params = params.append(key.toString(), body[ key ]);
        }
      }
    }
    return params;
  }
}

