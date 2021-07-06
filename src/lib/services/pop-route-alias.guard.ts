import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { Inject, Injectable } from '@angular/core';
import { AppGlobalInterface } from '../pop-common.model';
import { ParseModuleRoutesForAliases } from '../modules/entity/pop-entity-utility';
import { IsObject, Sleep } from '../pop-common-utility';


@Injectable( {
  providedIn: 'root',
} )

export class PopRouteAliasGuard implements CanActivate {
  constructor(
    @Inject( 'APP_GLOBAL' ) private APP_GLOBAL: AppGlobalInterface
  ){
  }


  canActivate( route: ActivatedRouteSnapshot ): Promise<boolean>{
    return new Promise<boolean>(async (resolve)=>{
      await Sleep(200);
      if( IsObject( route.routeConfig, [ '_loadedConfig' ] ) ){
        ( <any> route.routeConfig )._loadedConfig.routes = ParseModuleRoutesForAliases( ( <any> route.routeConfig )._loadedConfig.routes );
      }
      return resolve(true);
    });

  }
}
