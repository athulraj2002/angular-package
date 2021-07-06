import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { PopBaseService } from './pop-base.service';
import * as i0 from "@angular/core";
import * as i1 from "./pop-base.service";
import * as i2 from "@angular/router";
export class PopAuthGuardService {
    constructor(base, router) {
        this.base = base;
        this.router = router;
    }
    canActivate() {
        if (this.base.isAuthExpired()) {
            this.router.navigate(['login']).catch((e) => console.log(e));
            return false;
        }
        return true;
    }
}
PopAuthGuardService.ɵprov = i0.ɵɵdefineInjectable({ factory: function PopAuthGuardService_Factory() { return new PopAuthGuardService(i0.ɵɵinject(i1.PopBaseService), i0.ɵɵinject(i2.Router)); }, token: PopAuthGuardService, providedIn: "root" });
PopAuthGuardService.decorators = [
    { type: Injectable, args: [{
                providedIn: 'root'
            },] }
];
PopAuthGuardService.ctorParameters = () => [
    { type: PopBaseService },
    { type: Router }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWF1dGgtZ3VhcmQuZ3VhcmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvc2VydmljZXMvcG9wLWF1dGgtZ3VhcmQuZ3VhcmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQWUsTUFBTSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDdEQsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLG9CQUFvQixDQUFDOzs7O0FBS3BELE1BQU0sT0FBTyxtQkFBbUI7SUFFOUIsWUFBbUIsSUFBb0IsRUFBUyxNQUFjO1FBQTNDLFNBQUksR0FBSixJQUFJLENBQWdCO1FBQVMsV0FBTSxHQUFOLE1BQU0sQ0FBUTtJQUM5RCxDQUFDO0lBRUQsV0FBVztRQUNULElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsRUFBRTtZQUM3QixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDN0QsT0FBTyxLQUFLLENBQUM7U0FDZDtRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQzs7OztZQWRGLFVBQVUsU0FBQztnQkFDVixVQUFVLEVBQUUsTUFBTTthQUNuQjs7O1lBSlEsY0FBYztZQURELE1BQU0iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBDYW5BY3RpdmF0ZSwgUm91dGVyIH0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcbmltcG9ydCB7IFBvcEJhc2VTZXJ2aWNlIH0gZnJvbSAnLi9wb3AtYmFzZS5zZXJ2aWNlJztcblxuQEluamVjdGFibGUoe1xuICBwcm92aWRlZEluOiAncm9vdCdcbn0pXG5leHBvcnQgY2xhc3MgUG9wQXV0aEd1YXJkU2VydmljZSBpbXBsZW1lbnRzIENhbkFjdGl2YXRlIHtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgYmFzZTogUG9wQmFzZVNlcnZpY2UsIHB1YmxpYyByb3V0ZXI6IFJvdXRlcikge1xuICB9XG5cbiAgY2FuQWN0aXZhdGUoKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMuYmFzZS5pc0F1dGhFeHBpcmVkKCkpIHtcbiAgICAgIHRoaXMucm91dGVyLm5hdmlnYXRlKFsnbG9naW4nXSkuY2F0Y2goKGUpID0+IGNvbnNvbGUubG9nKGUpKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn1cbiJdfQ==