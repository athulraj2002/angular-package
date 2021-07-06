import { __awaiter } from "tslib";
import { Inject, Injectable } from '@angular/core';
import * as i0 from "@angular/core";
export class PopRouteVerifiedGuard {
    constructor(APP_GLOBAL) {
        this.APP_GLOBAL = APP_GLOBAL;
    }
    canActivate(route) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            const verified = yield this.APP_GLOBAL.isVerified();
            return resolve(verified);
        }));
    }
}
PopRouteVerifiedGuard.ɵprov = i0.ɵɵdefineInjectable({ factory: function PopRouteVerifiedGuard_Factory() { return new PopRouteVerifiedGuard(i0.ɵɵinject("APP_GLOBAL")); }, token: PopRouteVerifiedGuard, providedIn: "root" });
PopRouteVerifiedGuard.decorators = [
    { type: Injectable, args: [{
                providedIn: 'root',
            },] }
];
PopRouteVerifiedGuard.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: ['APP_GLOBAL',] }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLXJvdXRlLXZlcmlmaWVkLmd1YXJkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL3NlcnZpY2VzL3BvcC1yb3V0ZS12ZXJpZmllZC5ndWFyZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsT0FBTyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7O0FBT25ELE1BQU0sT0FBTyxxQkFBcUI7SUFDaEMsWUFDa0MsVUFBOEI7UUFBOUIsZUFBVSxHQUFWLFVBQVUsQ0FBb0I7SUFFaEUsQ0FBQztJQUdELFdBQVcsQ0FBRSxLQUE2QjtRQUN4QyxPQUFPLElBQUksT0FBTyxDQUFXLENBQU8sT0FBTyxFQUFHLEVBQUU7WUFDOUMsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ3BELE9BQU8sT0FBTyxDQUFFLFFBQVEsQ0FBRSxDQUFDO1FBQzdCLENBQUMsQ0FBQSxDQUFFLENBQUM7SUFDTixDQUFDOzs7O1lBZkYsVUFBVSxTQUFFO2dCQUNYLFVBQVUsRUFBRSxNQUFNO2FBQ25COzs7NENBR0ksTUFBTSxTQUFFLFlBQVkiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90LCBDYW5BY3RpdmF0ZSB9IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XG5pbXBvcnQgeyBJbmplY3QsIEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEFwcEdsb2JhbEludGVyZmFjZSB9IGZyb20gJy4uL3BvcC1jb21tb24ubW9kZWwnO1xuXG5cbkBJbmplY3RhYmxlKCB7XG4gIHByb3ZpZGVkSW46ICdyb290Jyxcbn0gKVxuZXhwb3J0IGNsYXNzIFBvcFJvdXRlVmVyaWZpZWRHdWFyZCBpbXBsZW1lbnRzIENhbkFjdGl2YXRlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgQEluamVjdCggJ0FQUF9HTE9CQUwnICkgcHJpdmF0ZSBBUFBfR0xPQkFMOiBBcHBHbG9iYWxJbnRlcmZhY2VcbiAgKXtcbiAgfVxuXG5cbiAgY2FuQWN0aXZhdGUoIHJvdXRlOiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90ICk6IFByb21pc2U8Ym9vbGVhbj57XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGJvb2xlYW4+KCBhc3luYyggcmVzb2x2ZSApID0+IHtcbiAgICAgIGNvbnN0IHZlcmlmaWVkID0gYXdhaXQgdGhpcy5BUFBfR0xPQkFMLmlzVmVyaWZpZWQoKTtcbiAgICAgIHJldHVybiByZXNvbHZlKCB2ZXJpZmllZCApO1xuICAgIH0gKTtcbiAgfVxufVxuIl19