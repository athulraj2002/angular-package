import { HttpBackend, HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable, isDevMode } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ConvertObjectToUri, IsArray, IsObject, IsString } from '../pop-common-utility';
import { PopBusiness } from '../pop-common.model';
import { PopExtendService } from './pop-extend.service';


@Injectable( {
  providedIn: 'root'
} )
export class PopRequestExternalService extends PopExtendService {
  protected name = 'PopRequestExternalService';
  private baseUrl: string;
  private http: HttpClient;

  private urlRegex = new RegExp( '^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$', 'i' );


  constructor(
    private httpBackend: HttpBackend
  ){
    super();
    this.http = new HttpClient( this.httpBackend );
  }


  public getBaseUrl(){
    return this.baseUrl.slice();
  }


  public setBaseUrl( baseUrl: string ): void{
    if( IsString( baseUrl, true ) ){
      this.baseUrl = baseUrl;
    }
  }


  doGet( url: string, params: object = {}, headers: { [ name: string ]: string | string[] } = {} ): Observable<any>{
    if( this._checkUrl( url ) ){
      const options = {
        headers: new HttpHeaders( headers ),
        params: this._setParams( params )
      };

      return this.http.get<any>( `${ url }`, options );
    }else{
      return of( null );
    }
  }


  doDelete( url: string, body: object = null, headers: { [ name: string ]: string | string[] } = {} ): Observable<any>{
    if( this._checkUrl( url ) ){
      const options = {
        headers: new HttpHeaders( headers ),
        body: body,
      };
      return this.http.delete<any>( url, options );
    }else{
      return of( null );
    }
  }


  doPatch( url: string, data: object, headers: { [ name: string ]: string | string[] } = {} ): Observable<any>{
    if( this._checkUrl( url ) ){
      const options = {
        headers: new HttpHeaders( headers ),
      };
      return this.http.patch( url, JSON.stringify( data ), options );
    }else{
      return of( null );
    }
  }


  doPost( url: string, data: object, headers: { [ name: string ]: string | string[] } = {} ): Observable<any>{
    if( this._checkUrl( url ) ){
      const options = {
        headers: new HttpHeaders( headers ),
      };
      return this.http.post<any>( url, JSON.stringify( data ), options );
    }else{
      return of( null );
    }

  }


  private _setParams( body ){
    let params: HttpParams = new HttpParams();
    for( const key of Object.keys( body ) ){
      if( body[ key ] ){
        if( body[ key ] instanceof Array ){
          body[ key ].forEach( ( item ) => {
            params = params.append( `${key.toString()}[]`, item );
          } );
        }else{
          params = params.append( key.toString(), body[ key ] );
        }
      }
    }
    return params;
  }


  private _checkUrl( url: string ): boolean{
    const valid = !!this.urlRegex.test( url );
    if( !valid ){
      throw new Error( `Invalid Url: ${url}` );
    }
    return true;
  }
}

