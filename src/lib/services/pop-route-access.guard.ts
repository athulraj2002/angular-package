import {ActivatedRouteSnapshot, CanActivate, Router} from '@angular/router';
import {Injectable} from '@angular/core';
import {PopEntity, PopTemplate, SetPopMessage} from '../pop-common.model';
import {IsArray, IsObject, TitleCase} from '../pop-common-utility';


@Injectable({
  providedIn: 'root'
})
export class PopAccessGuardService implements CanActivate {
  constructor(private router: Router) {

  }

  canActivate(route: ActivatedRouteSnapshot) {

    if (IsObject(route, ['data']) && IsObject(PopEntity, true) && route.data.can_read && !(PopEntity.checkAccess(route.data.can_read, 'can_read'))) {
      this._exit();
    }
    if (IsObject(route, ['data']) && IsObject(PopEntity, true) && route.data.can_update && !(PopEntity.checkAccess(route.data.can_update, 'can_update'))) {
      this._exit();
    }
    // to check if the entity has entry access
    if (IsObject(route, ['data'])) {
      const internalName = route.data.internal_name ?? route.data.can_read;
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
      } else {
        return true;
      }
    }
    return true;
  }


  private _exit() {
    SetPopMessage('Access Denied.');
    this.router.navigateByUrl('system/error/403').then(() => true);
  }

  private _exitWithMessage(entityName: string) {
    SetPopMessage(`Access Denied. You need permission for ${entityName}`);
    this.router.navigateByUrl('system/error/403').then(() => true);
  }
}
