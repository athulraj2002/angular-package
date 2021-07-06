import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { Inject, Injectable } from '@angular/core';
import { AppGlobalInterface } from '../pop-common.model';


@Injectable( {
  providedIn: 'root',
} )
export class PopRouteVerifiedGuard implements CanActivate {
  constructor(
    @Inject( 'APP_GLOBAL' ) private APP_GLOBAL: AppGlobalInterface
  ){
  }


  canActivate( route: ActivatedRouteSnapshot ): Promise<boolean>{
    return new Promise<boolean>( async( resolve ) => {
      const verified = await this.APP_GLOBAL.isVerified();
      return resolve( verified );
    } );
  }
}
