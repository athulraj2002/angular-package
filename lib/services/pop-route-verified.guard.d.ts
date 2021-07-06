import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { AppGlobalInterface } from '../pop-common.model';
export declare class PopRouteVerifiedGuard implements CanActivate {
    private APP_GLOBAL;
    constructor(APP_GLOBAL: AppGlobalInterface);
    canActivate(route: ActivatedRouteSnapshot): Promise<boolean>;
}
