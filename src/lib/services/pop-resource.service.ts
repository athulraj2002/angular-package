import { Injectable, OnDestroy } from '@angular/core';
import { forkJoin } from 'rxjs';
import { PopCacheService } from './pop-cache.service';
import {
  CoreConfig,
  Dictionary,
  PopEntity,
  PopLog,
  PopRequest,
  ResourceConfig,
  ResourceInterface,
  ServiceInjector
} from '../pop-common.model';
import { CleanObject, GetHttpResult, IsArray, IsCallableFunction, IsObject, IsString, StorageGetter, StringReplaceAll } from '../pop-common-utility';
import { EvaluateWhenConditions, ParseModelValue } from '../modules/entity/pop-entity-utility';
import { PopExtendService } from './pop-extend.service';


@Injectable( {
  providedIn: 'root'
} )
export class PopResourceService extends PopExtendService implements OnDestroy {

  public name = 'PopResourceService';

  private cache = new PopCacheService();


  constructor(){
    super();
  }


  /**
   * This fx will map the api calls for a collection of resources
   * @param collection
   * @param core
   */
  setCollection( collection: Dictionary<ResourceInterface>, core?: CoreConfig ): Promise<boolean>{
    return new Promise( async( resolve ) => {
      const api_requests = [];
      const request_map = [];
      let resource;
      if( IsObject( collection, true ) ){
        Object.keys( collection ).map( ( resourceKey ) => {
          resource = <ResourceConfig>collection[ resourceKey ];
          if( resource.api_path ){
            if(!resource.can_read || PopEntity.checkAccess(resource.can_read, 'can_read')){
              // break;
              let path = resource.api_path;
              if( IsArray( resource.api_when, true ) && IsObject( core, true ) ){
                const when = EvaluateWhenConditions( core, resource.api_when );
                if( !when ){
                  PopLog.info( this.name, `setCollection: condition not met`, resource );
                  return false;
                }
              }
              request_map.push( resourceKey );
              if( IsObject( resource.api_path_vars, true ) && core ){
                Object.keys( resource.api_path_vars ).map( ( varKey ) => {
                  let value = '';
                  if( String( resource.api_path_vars[ varKey ] ).includes( '.' ) ){
                    value = <any>StorageGetter( core, String( resource.api_path_vars[ varKey ] ).split( '.' ) );
                  }
                  if( !value ) value = ParseModelValue( String( resource.api_path_vars[ varKey ] ) );
                  if( value ){
                    path = StringReplaceAll( path, `:${varKey}`, value );
                  }
                } );
              }
              const body = IsObject( resource.api_params, true ) ? resource.api_params : {};
              if( IsObject( body ) ){
                Object.keys( body ).map( ( key: string ) => {
                  body[ key ] = ParseModelValue( body[ key ], core );
                } );
              }

              if( +resource.api_cache ){
                PopLog.info( this.name, `cached resource`, resource );
                api_requests.push( this.cache.get( 'resource', path, PopRequest.doGet( path, body, resource.api_version ), 3600000 ) );
              }else{
                api_requests.push( PopRequest.doGet( path, body, resource.api_version ) );
              }
            }
          }
        } );
      }
      if( api_requests.length ){
        forkJoin( api_requests ).subscribe( ( results ) => {
          results.map( ( res: any, index ) => {
            res = res.data ? res.data : res;
            resource = <ResourceConfig>collection[ request_map[ index ] ];
            let dataTarget;
            if( IsArray( res, false ) ){
              dataTarget = resource.data_storage ? resource.data_storage : 'data_values';
              if( IsObject( collection[ request_map[ index ] ].data_filter, true ) ){
                try{
                  Object.keys( resource.data_filter ).map( ( filterKey: string ) => {
                    res = res.filter( ( item ) => {
                      let filterKeyValue = resource.data_filter[ filterKey ];
                      if( String( filterKeyValue ).includes( '.' ) ){
                        filterKeyValue = <any>StorageGetter( core, String( filterKeyValue ).split( '.' ) );
                      }
                      if( !filterKeyValue ) filterKeyValue = ParseModelValue( String( resource.data_filter[ filterKey ] ) );
                      return item[ filterKey ] == filterKeyValue;
                    } );
                  } );
                }catch( e ){
                  PopLog.warn( this.name, `setCollection`, e );
                }
              }

              res = IsCallableFunction( resource.data_decorator ) ? res.map( x => resource.data_decorator( core, x ) ) : res;

              if( IsArray( resource.data_when, true ) ){
                // EvaluateModelConditionals();
                try{
                  res = res.filter( ( item ) => {
                    return EvaluateWhenConditions( item, resource.data_when, core );
                  } );
                }catch( e ){
                  PopLog.warn( this.name, `setCollection`, e );
                }
              }

              if( IsCallableFunction( resource.data_setter ) ) res = <any[]>resource.data_setter( core, res );
              resource[ dataTarget ] = res;
            }else{
              dataTarget = resource.data_storage ? resource.data_storage : 'data';
              resource[ dataTarget ] = IsCallableFunction( resource.data_decorator ) ? resource.data_decorator( core, res ) : res;
              if( IsCallableFunction( resource.data_setter ) ) resource[ dataTarget ] = <any[]>resource.data_setter( core, resource[ dataTarget ] );
            }
          } );
          resolve( true );
        }, err => {
          resolve( false );
        } );
      }else{
        resolve( true );
      }
    } );
  }



  /**
   * This fx will extract the data from a resource collection
   * @param collection
   * @param core
   */
  getCollection( collection: Dictionary<ResourceConfig>, ){
    const store = {};
    if( IsObject( collection, true ) ){
      Object.keys( collection ).map( ( resourceKey ) => {
        const resource = collection[ resourceKey ];
        store[ resource.name ] = CleanObject( new ResourceConfig( resource ) );
      } );
    }
    return store;
  }


  /**
   * This fx will reload a single existing resource
   * @param collection
   */
  reloadResource( core: CoreConfig, resource: ResourceConfig ): Promise<ResourceConfig>{
    return new Promise<ResourceConfig>( ( resolve ) => {
      if( IsObject( resource, [ 'api_path' ] && resource.api_path && IsString( resource.api_path, true ) ) ){
        let path = resource.api_path;
        if(resource.can_read && !PopEntity.checkAccess(resource.can_read, 'can_read')) {
          PopLog.debug( this.name, `reloadResource: Cannot read resource:${resource.can_read}` );
          return resolve( resource );
        }
        if( IsArray( resource.api_when, true ) && IsObject( core, true ) ){
          const when = EvaluateWhenConditions( core, resource.api_when );
          if( !when ){
            PopLog.debug( this.name, 'reloadResource: condition not met' );
            return resolve( resource );
          }
        }
        if( IsObject( resource.api_path_vars, true ) && core ){
          Object.keys( resource.api_path_vars ).map( ( varKey ) => {
            let value = '';
            if( String( resource.api_path_vars[ varKey ] ).includes( '.' ) ){
              value = <any>StorageGetter( core, String( resource.api_path_vars[ varKey ] ).split( '.' ) );
            }
            if( !value ) value = ParseModelValue( String( resource.api_path_vars[ varKey ] ) );
            if( value ){
              path = StringReplaceAll( path, `:${varKey}`, value );
            }
          } );
        }
        const body = IsObject( resource.api_params, true ) ? resource.api_params : {};
        if( IsObject( body ) ){
          Object.keys( body ).map( ( key: string ) => {
            body[ key ] = ParseModelValue( body[ key ], core );
          } );
        }

        PopRequest.doGet( path, body, resource.api_version ).subscribe( ( res ) => {
          res = GetHttpResult( res );
          let dataTarget;
          PopLog.debug( this.name, 'reloadResource: pass 4' );
          if( IsArray( res, false ) ){
            dataTarget = resource.data_storage ? resource.data_storage : 'data_values';
            if( IsObject( resource.data_filter, true ) ){
              try{
                Object.keys( resource.data_filter ).map( ( filterKey: string ) => {
                  res = res.filter( ( item ) => {
                    let filterKeyValue = resource.data_filter[ filterKey ];
                    if( String( filterKeyValue ).includes( '.' ) ){
                      filterKeyValue = <any>StorageGetter( core, String( filterKeyValue ).split( '.' ) );
                    }
                    if( !filterKeyValue ) filterKeyValue = ParseModelValue( String( resource.data_filter[ filterKey ] ) );
                    return item[ filterKey ] == filterKeyValue;
                  } );
                } );
              }catch( e ){
                PopLog.warn( this.name, `setCollection`, e );
              }
            }

            if( IsArray( resource.data_when, true ) ){
              // EvaluateModelConditionals();
              try{
                res = res.filter( ( item ) => {
                  return EvaluateWhenConditions( item, resource.data_when, core );
                } );
              }catch( e ){
                PopLog.warn( this.name, `setCollection`, e );
              }
            }
            resource[ dataTarget ] = IsCallableFunction( resource.data_decorator ) ? res.map( x => resource.data_decorator( core, x ) ) : res;
            if( IsCallableFunction( resource.data_setter ) ) resource[ dataTarget ] = <any[]>resource.data_setter( core, resource[ dataTarget ] );
          }else{
            dataTarget = resource.data_storage ? resource.data_storage : 'data';
            resource[ dataTarget ] = IsCallableFunction( resource.data_decorator ) ? resource.data_decorator( core, res ) : res;
          }
          return resolve( resource );
        }, () => {
          return resolve( resource );
        } );
      }else{
        return resolve( resource );
      }
    } );
  }


  ngOnDestroy(){
    super.ngOnDestroy();
  }
}
