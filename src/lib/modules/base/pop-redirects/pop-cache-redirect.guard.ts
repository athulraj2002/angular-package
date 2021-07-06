import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { PopCacheRedirectUrl } from '../../../pop-common.model';
import { IsString } from '../../../pop-common-utility';


@Injectable( {
  providedIn: 'root',
} )
export class PopCacheRedirectGuard implements CanActivate {
  constructor( private router: Router ){

  }


  canActivate( route: ActivatedRouteSnapshot ): Promise<boolean>{
    return new Promise<boolean>( async( resolve ) => {
      if( IsString( PopCacheRedirectUrl, true ) ){
        return resolve( true );
      }else{
        return this.router.navigateByUrl( 'system/route' );
      }
    } );
  }
}
