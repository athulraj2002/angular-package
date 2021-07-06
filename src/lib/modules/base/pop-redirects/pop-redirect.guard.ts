import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { PopMessage } from '../../../pop-common.model';
import { IsString } from '../../../pop-common-utility';


@Injectable( {
  providedIn: 'root',
} )
export class PopRedirectGuard implements CanActivate {
  constructor(
    private router: Router
  ){
  }


  canActivate( route: ActivatedRouteSnapshot ): Promise<boolean>{
    return new Promise<boolean>( async(resolve) => {
      if( IsString( PopMessage, true ) ){
        return resolve(true);
      }else{
        return this.router.navigateByUrl('system/route');
      }
    } );
  }
}
