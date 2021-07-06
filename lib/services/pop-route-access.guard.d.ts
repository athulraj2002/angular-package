import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
export declare class PopAccessGuardService implements CanActivate {
    private router;
    constructor(router: Router);
    canActivate(route: ActivatedRouteSnapshot): boolean;
    private _exit;
    private _exitWithMessage;
}
