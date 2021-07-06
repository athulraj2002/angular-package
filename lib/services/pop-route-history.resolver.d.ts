import { Resolve, RouterStateSnapshot, ActivatedRouteSnapshot, Router } from '@angular/router';
export interface RouteHistoryInterface {
    name: string;
    base: string;
    path: string;
}
export declare class PopRouteHistoryResolver implements Resolve<any> {
    private router;
    sessionVar: string;
    constructor(router: Router);
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean;
    saveNavigationHistory(history: RouteHistoryInterface): void;
    isPreviousHistory(): boolean;
    goBack(count?: number): void;
}
