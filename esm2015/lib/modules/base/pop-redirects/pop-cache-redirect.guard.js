import { __awaiter } from "tslib";
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { PopCacheRedirectUrl } from '../../../pop-common.model';
import { IsString } from '../../../pop-common-utility';
import * as i0 from "@angular/core";
import * as i1 from "@angular/router";
export class PopCacheRedirectGuard {
    constructor(router) {
        this.router = router;
    }
    canActivate(route) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            if (IsString(PopCacheRedirectUrl, true)) {
                return resolve(true);
            }
            else {
                return this.router.navigateByUrl('system/route');
            }
        }));
    }
}
PopCacheRedirectGuard.ɵprov = i0.ɵɵdefineInjectable({ factory: function PopCacheRedirectGuard_Factory() { return new PopCacheRedirectGuard(i0.ɵɵinject(i1.Router)); }, token: PopCacheRedirectGuard, providedIn: "root" });
PopCacheRedirectGuard.decorators = [
    { type: Injectable, args: [{
                providedIn: 'root',
            },] }
];
PopCacheRedirectGuard.ctorParameters = () => [
    { type: Router }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWNhY2hlLXJlZGlyZWN0Lmd1YXJkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvYmFzZS9wb3AtcmVkaXJlY3RzL3BvcC1jYWNoZS1yZWRpcmVjdC5ndWFyZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQXVDLE1BQU0sRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQzlFLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ2hFLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQzs7O0FBTXZELE1BQU0sT0FBTyxxQkFBcUI7SUFDaEMsWUFBcUIsTUFBYztRQUFkLFdBQU0sR0FBTixNQUFNLENBQVE7SUFFbkMsQ0FBQztJQUdELFdBQVcsQ0FBRSxLQUE2QjtRQUN4QyxPQUFPLElBQUksT0FBTyxDQUFXLENBQU8sT0FBTyxFQUFHLEVBQUU7WUFDOUMsSUFBSSxRQUFRLENBQUUsbUJBQW1CLEVBQUUsSUFBSSxDQUFFLEVBQUU7Z0JBQ3pDLE9BQU8sT0FBTyxDQUFFLElBQUksQ0FBRSxDQUFDO2FBQ3hCO2lCQUFJO2dCQUNILE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUUsY0FBYyxDQUFFLENBQUM7YUFDcEQ7UUFDSCxDQUFDLENBQUEsQ0FBRSxDQUFDO0lBQ04sQ0FBQzs7OztZQWpCRixVQUFVLFNBQUU7Z0JBQ1gsVUFBVSxFQUFFLE1BQU07YUFDbkI7OztZQVA2QyxNQUFNIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQWN0aXZhdGVkUm91dGVTbmFwc2hvdCwgQ2FuQWN0aXZhdGUsIFJvdXRlciB9IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XG5pbXBvcnQgeyBQb3BDYWNoZVJlZGlyZWN0VXJsIH0gZnJvbSAnLi4vLi4vLi4vcG9wLWNvbW1vbi5tb2RlbCc7XG5pbXBvcnQgeyBJc1N0cmluZyB9IGZyb20gJy4uLy4uLy4uL3BvcC1jb21tb24tdXRpbGl0eSc7XG5cblxuQEluamVjdGFibGUoIHtcbiAgcHJvdmlkZWRJbjogJ3Jvb3QnLFxufSApXG5leHBvcnQgY2xhc3MgUG9wQ2FjaGVSZWRpcmVjdEd1YXJkIGltcGxlbWVudHMgQ2FuQWN0aXZhdGUge1xuICBjb25zdHJ1Y3RvciggcHJpdmF0ZSByb3V0ZXI6IFJvdXRlciApe1xuXG4gIH1cblxuXG4gIGNhbkFjdGl2YXRlKCByb3V0ZTogQWN0aXZhdGVkUm91dGVTbmFwc2hvdCApOiBQcm9taXNlPGJvb2xlYW4+e1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxib29sZWFuPiggYXN5bmMoIHJlc29sdmUgKSA9PiB7XG4gICAgICBpZiggSXNTdHJpbmcoIFBvcENhY2hlUmVkaXJlY3RVcmwsIHRydWUgKSApe1xuICAgICAgICByZXR1cm4gcmVzb2x2ZSggdHJ1ZSApO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHJldHVybiB0aGlzLnJvdXRlci5uYXZpZ2F0ZUJ5VXJsKCAnc3lzdGVtL3JvdXRlJyApO1xuICAgICAgfVxuICAgIH0gKTtcbiAgfVxufVxuIl19