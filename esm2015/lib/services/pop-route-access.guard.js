import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { PopEntity, SetPopMessage } from '../pop-common.model';
import { IsArray, IsObject, TitleCase } from '../pop-common-utility';
import * as i0 from "@angular/core";
import * as i1 from "@angular/router";
export class PopAccessGuardService {
    constructor(router) {
        this.router = router;
    }
    canActivate(route) {
        var _a;
        if (IsObject(route, ['data']) && IsObject(PopEntity, true) && route.data.can_read && !(PopEntity.checkAccess(route.data.can_read, 'can_read'))) {
            this._exit();
        }
        if (IsObject(route, ['data']) && IsObject(PopEntity, true) && route.data.can_update && !(PopEntity.checkAccess(route.data.can_update, 'can_update'))) {
            this._exit();
        }
        // to check if the entity has entry access
        if (IsObject(route, ['data'])) {
            const internalName = (_a = route.data.internal_name) !== null && _a !== void 0 ? _a : route.data.can_read;
            const entityNames = PopEntity.getEntityEntryAccess(internalName);
            if (IsArray(entityNames, true)) {
                const inaccessible = [];
                entityNames.map((entityName) => {
                    if (!PopEntity.checkAccess(entityName, 'can_read')) {
                        inaccessible.push(TitleCase(entityName.split('_').join(" ")));
                    }
                });
                if (IsArray(inaccessible, true)) {
                    this._exitWithMessage(inaccessible.join(', '));
                    return false;
                }
            }
            else {
                return true;
            }
        }
        return true;
    }
    _exit() {
        SetPopMessage('Access Denied.');
        this.router.navigateByUrl('system/error/403').then(() => true);
    }
    _exitWithMessage(entityName) {
        SetPopMessage(`Access Denied. You need permission for ${entityName}`);
        this.router.navigateByUrl('system/error/403').then(() => true);
    }
}
PopAccessGuardService.ɵprov = i0.ɵɵdefineInjectable({ factory: function PopAccessGuardService_Factory() { return new PopAccessGuardService(i0.ɵɵinject(i1.Router)); }, token: PopAccessGuardService, providedIn: "root" });
PopAccessGuardService.decorators = [
    { type: Injectable, args: [{
                providedIn: 'root'
            },] }
];
PopAccessGuardService.ctorParameters = () => [
    { type: Router }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLXJvdXRlLWFjY2Vzcy5ndWFyZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9zZXJ2aWNlcy9wb3Atcm91dGUtYWNjZXNzLmd1YXJkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBc0MsTUFBTSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDNUUsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUMsU0FBUyxFQUFlLGFBQWEsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQzFFLE9BQU8sRUFBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBQyxNQUFNLHVCQUF1QixDQUFDOzs7QUFNbkUsTUFBTSxPQUFPLHFCQUFxQjtJQUNoQyxZQUFvQixNQUFjO1FBQWQsV0FBTSxHQUFOLE1BQU0sQ0FBUTtJQUVsQyxDQUFDO0lBRUQsV0FBVyxDQUFDLEtBQTZCOztRQUV2QyxJQUFJLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUMsRUFBRTtZQUM5SSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7U0FDZDtRQUNELElBQUksUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksUUFBUSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxZQUFZLENBQUMsQ0FBQyxFQUFFO1lBQ3BKLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztTQUNkO1FBQ0QsMENBQTBDO1FBQzFDLElBQUksUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUU7WUFDN0IsTUFBTSxZQUFZLEdBQUcsTUFBQSxLQUFLLENBQUMsSUFBSSxDQUFDLGFBQWEsbUNBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7WUFDckUsTUFBTSxXQUFXLEdBQUcsU0FBUyxDQUFDLG9CQUFvQixDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRWpFLElBQUksT0FBTyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsRUFBRTtnQkFDOUIsTUFBTSxZQUFZLEdBQUcsRUFBRSxDQUFDO2dCQUN4QixXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsVUFBVSxFQUFFLEVBQUU7b0JBQzdCLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsRUFBRTt3QkFDbEQsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUMvRDtnQkFDSCxDQUFDLENBQUMsQ0FBQztnQkFDSCxJQUFJLE9BQU8sQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLEVBQUU7b0JBQy9CLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBQy9DLE9BQU8sS0FBSyxDQUFDO2lCQUNkO2FBQ0Y7aUJBQU07Z0JBQ0wsT0FBTyxJQUFJLENBQUM7YUFDYjtTQUNGO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBR08sS0FBSztRQUNYLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ2hDLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLGtCQUFrQixDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2pFLENBQUM7SUFFTyxnQkFBZ0IsQ0FBQyxVQUFrQjtRQUN6QyxhQUFhLENBQUMsMENBQTBDLFVBQVUsRUFBRSxDQUFDLENBQUM7UUFDdEUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDakUsQ0FBQzs7OztZQWhERixVQUFVLFNBQUM7Z0JBQ1YsVUFBVSxFQUFFLE1BQU07YUFDbkI7OztZQVI0QyxNQUFNIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90LCBDYW5BY3RpdmF0ZSwgUm91dGVyfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xuaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7UG9wRW50aXR5LCBQb3BUZW1wbGF0ZSwgU2V0UG9wTWVzc2FnZX0gZnJvbSAnLi4vcG9wLWNvbW1vbi5tb2RlbCc7XG5pbXBvcnQge0lzQXJyYXksIElzT2JqZWN0LCBUaXRsZUNhc2V9IGZyb20gJy4uL3BvcC1jb21tb24tdXRpbGl0eSc7XG5cblxuQEluamVjdGFibGUoe1xuICBwcm92aWRlZEluOiAncm9vdCdcbn0pXG5leHBvcnQgY2xhc3MgUG9wQWNjZXNzR3VhcmRTZXJ2aWNlIGltcGxlbWVudHMgQ2FuQWN0aXZhdGUge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJvdXRlcjogUm91dGVyKSB7XG5cbiAgfVxuXG4gIGNhbkFjdGl2YXRlKHJvdXRlOiBBY3RpdmF0ZWRSb3V0ZVNuYXBzaG90KSB7XG5cbiAgICBpZiAoSXNPYmplY3Qocm91dGUsIFsnZGF0YSddKSAmJiBJc09iamVjdChQb3BFbnRpdHksIHRydWUpICYmIHJvdXRlLmRhdGEuY2FuX3JlYWQgJiYgIShQb3BFbnRpdHkuY2hlY2tBY2Nlc3Mocm91dGUuZGF0YS5jYW5fcmVhZCwgJ2Nhbl9yZWFkJykpKSB7XG4gICAgICB0aGlzLl9leGl0KCk7XG4gICAgfVxuICAgIGlmIChJc09iamVjdChyb3V0ZSwgWydkYXRhJ10pICYmIElzT2JqZWN0KFBvcEVudGl0eSwgdHJ1ZSkgJiYgcm91dGUuZGF0YS5jYW5fdXBkYXRlICYmICEoUG9wRW50aXR5LmNoZWNrQWNjZXNzKHJvdXRlLmRhdGEuY2FuX3VwZGF0ZSwgJ2Nhbl91cGRhdGUnKSkpIHtcbiAgICAgIHRoaXMuX2V4aXQoKTtcbiAgICB9XG4gICAgLy8gdG8gY2hlY2sgaWYgdGhlIGVudGl0eSBoYXMgZW50cnkgYWNjZXNzXG4gICAgaWYgKElzT2JqZWN0KHJvdXRlLCBbJ2RhdGEnXSkpIHtcbiAgICAgIGNvbnN0IGludGVybmFsTmFtZSA9IHJvdXRlLmRhdGEuaW50ZXJuYWxfbmFtZSA/PyByb3V0ZS5kYXRhLmNhbl9yZWFkO1xuICAgICAgY29uc3QgZW50aXR5TmFtZXMgPSBQb3BFbnRpdHkuZ2V0RW50aXR5RW50cnlBY2Nlc3MoaW50ZXJuYWxOYW1lKTtcblxuICAgICAgaWYgKElzQXJyYXkoZW50aXR5TmFtZXMsIHRydWUpKSB7XG4gICAgICAgIGNvbnN0IGluYWNjZXNzaWJsZSA9IFtdO1xuICAgICAgICBlbnRpdHlOYW1lcy5tYXAoKGVudGl0eU5hbWUpID0+IHtcbiAgICAgICAgICBpZiAoIVBvcEVudGl0eS5jaGVja0FjY2VzcyhlbnRpdHlOYW1lLCAnY2FuX3JlYWQnKSkge1xuICAgICAgICAgICAgaW5hY2Nlc3NpYmxlLnB1c2goVGl0bGVDYXNlKGVudGl0eU5hbWUuc3BsaXQoJ18nKS5qb2luKFwiIFwiKSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChJc0FycmF5KGluYWNjZXNzaWJsZSwgdHJ1ZSkpIHtcbiAgICAgICAgICB0aGlzLl9leGl0V2l0aE1lc3NhZ2UoaW5hY2Nlc3NpYmxlLmpvaW4oJywgJykpO1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cblxuICBwcml2YXRlIF9leGl0KCkge1xuICAgIFNldFBvcE1lc3NhZ2UoJ0FjY2VzcyBEZW5pZWQuJyk7XG4gICAgdGhpcy5yb3V0ZXIubmF2aWdhdGVCeVVybCgnc3lzdGVtL2Vycm9yLzQwMycpLnRoZW4oKCkgPT4gdHJ1ZSk7XG4gIH1cblxuICBwcml2YXRlIF9leGl0V2l0aE1lc3NhZ2UoZW50aXR5TmFtZTogc3RyaW5nKSB7XG4gICAgU2V0UG9wTWVzc2FnZShgQWNjZXNzIERlbmllZC4gWW91IG5lZWQgcGVybWlzc2lvbiBmb3IgJHtlbnRpdHlOYW1lfWApO1xuICAgIHRoaXMucm91dGVyLm5hdmlnYXRlQnlVcmwoJ3N5c3RlbS9lcnJvci80MDMnKS50aGVuKCgpID0+IHRydWUpO1xuICB9XG59XG4iXX0=