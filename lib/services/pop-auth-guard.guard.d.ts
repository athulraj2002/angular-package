import { CanActivate, Router } from '@angular/router';
import { PopBaseService } from './pop-base.service';
export declare class PopAuthGuardService implements CanActivate {
    base: PopBaseService;
    router: Router;
    constructor(base: PopBaseService, router: Router);
    canActivate(): boolean;
}
