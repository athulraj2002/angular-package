import {Injectable} from '@angular/core';
import {EntityAccessInterface, EntityParams, EntityParamsInterface} from '../../../pop-common.model';
import {DeepMerge, IsNumber, IsObject, SpaceToHyphenLower} from '../../../pop-common-utility';


@Injectable({
  providedIn: 'root'
})
export class PopEntityUtilParamService {

  private store = <Map<string, EntityParamsInterface>>new Map<string, EntityParamsInterface>();
  private mapById = <Map<number, string>>new Map<number, string>();
  private mapByRoute = <Map<string, string>>new Map<string, string>();


  constructor() {
    this.setEntityParams({
      id: 0,
      alias: null,
      access: {
        can_create: 1,
        can_read: 1,
        can_update: 1,
        can_delete: 0,
        can_destroy: 0,
      },
      can_extend: false,
      path: '/auth/user',
      param: '',
      api: '/auth/user',
      internal_name: 'prime_user',
      name: 'Prime User',
    });
  }


  public getEntityParamsWithPath(path: string, entityId: number = null,): EntityParams {
    let entity;
    let entityParams = <EntityParams>undefined;
    const internal_name = this.mapByRoute.get(path);
    if (internal_name && this.store.has(internal_name)) entity = this.store.get(internal_name);
    if (entity) {
      entityParams = <EntityParams>{
        alias: entity.alias,
        api: entity.api,
        app: entity.app,
        id: entity.id,
        can_extend: entity.can_extend,
        internal_name: entity.internal_name,
        name: entity.name,
        path: entity.path,
        param: entity.param,
      };
      if (entityId) entityParams.entityId = entityId;
    }

    return entityParams;
  }


  public setEntityParams(params: EntityParamsInterface): void {
    if (IsObject(params, true)) {
      if (!(IsObject(params.access, true))) {
        params.access = {can_create: 0, can_read: 0, can_update: 0, can_delete: 0, can_destroy: 0};
      } else {
        Object.keys(params.access).map((accessName) => {
          params.access[accessName] = +params.access[accessName];
        });
      }
      this.mapById.set(+params.id, params.internal_name);
      this.mapByRoute.set(SpaceToHyphenLower(params.name), params.internal_name);
      if (this.store.has(params.internal_name)) {
        let existingParams = this.store.get(params.internal_name);
        existingParams = DeepMerge(existingParams, params);
        this.store.set(params.internal_name, existingParams);
      } else {
        this.store.set(params.internal_name, params);
      }
    }
  }


  public getEntityParams(internal_name: string | number, entityId: number = null,): EntityParamsInterface {
    let entityParams = <EntityParams>undefined;
    if (IsNumber(internal_name)) {
      internal_name = this.mapById.get(+internal_name);
    }
    const entity = this.store.get(internal_name + '');
    if (entity) {
      entityParams = <EntityParams>{
        alias: entity.alias,
        api: entity.api,
        app: entity.app,
        id: entity.id,
        can_extend: entity.can_extend,
        internal_name: entity.internal_name,
        name: entity.name,
        path: entity.path,
        param: entity.param,
      };
      if (entityId) entityParams.entityId = entityId;
    }
    return entityParams;
  }


  public getAccess(internal_name: string | number, accessType?: string): EntityAccessInterface | null {
    let access = null;
    if (IsNumber(internal_name)) internal_name = this.mapById.get(+internal_name);
    if (this.store.has(internal_name + '')) {
      const entity = this.store.get(internal_name + '');
      if (accessType && accessType in entity.access) {
        access = entity.access[accessType];
      } else {
        access = entity.access;
      }
    }
    return access;
  }

  public getAlias(internal_name: string | number, accessType?: string): EntityAccessInterface | null {
    let alias = null;
    if (IsNumber(internal_name)) internal_name = this.mapById.get(+internal_name);
    if (this.store.has(internal_name + '')) {
      const entity = this.store.get(internal_name + '');
      if (IsObject(entity.alias, true)) {
        alias = entity.alias;
      }
    }
    return alias;
  }


  /**
   * Checks if the user has permissons to the specific type of an entity depending upon the local token details.
   *
   * @param appName - The name of the app to check. IE: admin, cis, etc...
   * @param entityName - The name of the entity inside the app to check: IE: For the admin app, users.
   * @param accessType - The type of permissons to check. Enum [can_create, can_read, can_update, can_delete]
   */
  public checkAccess(internal_name: string | number, accessType: string): boolean {
    if (IsNumber(internal_name)) internal_name = this.mapById.get(+internal_name);
    if (this.store.has(internal_name + '')) {
      const entity = this.store.get(internal_name + '');
      return !!entity.access[accessType];
    }
    return false;
  }


}
