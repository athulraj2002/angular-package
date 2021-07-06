import { __awaiter } from "tslib";
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { PopMessage } from '../../../pop-common.model';
import { IsString } from '../../../pop-common-utility';
import * as i0 from "@angular/core";
import * as i1 from "@angular/router";
export class PopRedirectGuard {
    constructor(router) {
        this.router = router;
    }
    canActivate(route) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            if (IsString(PopMessage, true)) {
                return resolve(true);
            }
            else {
                return this.router.navigateByUrl('system/route');
            }
        }));
    }
}
PopRedirectGuard.ɵprov = i0.ɵɵdefineInjectable({ factory: function PopRedirectGuard_Factory() { return new PopRedirectGuard(i0.ɵɵinject(i1.Router)); }, token: PopRedirectGuard, providedIn: "root" });
PopRedirectGuard.decorators = [
    { type: Injectable, args: [{
                providedIn: 'root',
            },] }
];
PopRedirectGuard.ctorParameters = () => [
    { type: Router }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLXJlZGlyZWN0Lmd1YXJkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvYmFzZS9wb3AtcmVkaXJlY3RzL3BvcC1yZWRpcmVjdC5ndWFyZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQXVDLE1BQU0sRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQzlFLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUN2RCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sNkJBQTZCLENBQUM7OztBQU12RCxNQUFNLE9BQU8sZ0JBQWdCO0lBQzNCLFlBQ1UsTUFBYztRQUFkLFdBQU0sR0FBTixNQUFNLENBQVE7SUFFeEIsQ0FBQztJQUdELFdBQVcsQ0FBRSxLQUE2QjtRQUN4QyxPQUFPLElBQUksT0FBTyxDQUFXLENBQU0sT0FBTyxFQUFFLEVBQUU7WUFDNUMsSUFBSSxRQUFRLENBQUUsVUFBVSxFQUFFLElBQUksQ0FBRSxFQUFFO2dCQUNoQyxPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUN0QjtpQkFBSTtnQkFDSCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxDQUFDO2FBQ2xEO1FBQ0gsQ0FBQyxDQUFBLENBQUUsQ0FBQztJQUNOLENBQUM7Ozs7WUFsQkYsVUFBVSxTQUFFO2dCQUNYLFVBQVUsRUFBRSxNQUFNO2FBQ25COzs7WUFQNkMsTUFBTSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEFjdGl2YXRlZFJvdXRlU25hcHNob3QsIENhbkFjdGl2YXRlLCBSb3V0ZXIgfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xuaW1wb3J0IHsgUG9wTWVzc2FnZSB9IGZyb20gJy4uLy4uLy4uL3BvcC1jb21tb24ubW9kZWwnO1xuaW1wb3J0IHsgSXNTdHJpbmcgfSBmcm9tICcuLi8uLi8uLi9wb3AtY29tbW9uLXV0aWxpdHknO1xuXG5cbkBJbmplY3RhYmxlKCB7XG4gIHByb3ZpZGVkSW46ICdyb290Jyxcbn0gKVxuZXhwb3J0IGNsYXNzIFBvcFJlZGlyZWN0R3VhcmQgaW1wbGVtZW50cyBDYW5BY3RpdmF0ZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgcm91dGVyOiBSb3V0ZXJcbiAgKXtcbiAgfVxuXG5cbiAgY2FuQWN0aXZhdGUoIHJvdXRlOiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90ICk6IFByb21pc2U8Ym9vbGVhbj57XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGJvb2xlYW4+KCBhc3luYyhyZXNvbHZlKSA9PiB7XG4gICAgICBpZiggSXNTdHJpbmcoIFBvcE1lc3NhZ2UsIHRydWUgKSApe1xuICAgICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH1lbHNle1xuICAgICAgICByZXR1cm4gdGhpcy5yb3V0ZXIubmF2aWdhdGVCeVVybCgnc3lzdGVtL3JvdXRlJyk7XG4gICAgICB9XG4gICAgfSApO1xuICB9XG59XG4iXX0=