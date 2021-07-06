import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
export declare class PopRedirectGuard implements CanActivate {
    private router;
    constructor(router: Router);
    canActivate(route: ActivatedRouteSnapshot): Promise<boolean>;
}
