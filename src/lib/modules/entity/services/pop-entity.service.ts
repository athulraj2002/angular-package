import {EventEmitter, Injectable, OnDestroy} from '@angular/core';
import {tap} from 'rxjs/operators';
import {forkJoin, Observable, of} from 'rxjs';

import {PopEntityRepoService} from './pop-entity-repo.service';
import {TabConfig} from '../../base/pop-tab-menu/tab-menu.model';

import {ActivatedRoute} from '@angular/router';
import {
  CoreConfig, DataDecorator, DataFilter, DataSetter,
  Dictionary,
  Entity,
  EntityAccessInterface,
  EntityExtendInterface,
  EntityModelInterface,
  EntityModelMenuInterface,
  EntityModelTableInterface,
  EntityParams,
  EntityParamsInterface,
  EntityPreference,
  PopBaseEventInterface, PopHistory, PopLog,
  QueryParamsInterface,
  ResourceInterface,
  ServiceRoutesInterface
} from '../../../pop-common.model';
import {PopEntityUtilFieldService} from './pop-entity-util-field.service';
import {
  DeepMerge,
  IsArray,
  IsObject,
  IsObjectThrowError,
  IsString,
  JsonCopy,
  IsNumber,
  IsCallableFunction,
  StorageGetter,
  GetHttpObjectResult
} from '../../../pop-common-utility';
import {PopDomService} from '../../../services/pop-dom.service';
import {PopEntityUtilParamService} from './pop-entity-util-param.service';
import {DefaultEntityAction} from '../models/pop-entity-default.action';
import {DefaultEntityTable} from '../models/pop-entity-default.table';
import {DefaultEntityField} from '../models/pop-entity-default.field';
import {DefaultEntityResource} from '../models/pop-entity-default.resource';
import {DefaultEntityMenu} from '../models/pop-entity-default.menu';
import {DefaultEntityRoute} from '../models/pop-entity-default.route';
import {
  EvaluateWhenConditions,
  InterpolateEntityRoutes,
  IsAliasable,
  SessionEntityFieldUpdate
} from '../pop-entity-utility';


@Injectable({
  providedIn: 'root'
})
export class PopEntityService implements OnDestroy {
  private name = 'PopEntityService';
  private id;

  private asset = {
    access: <Map<string, EntityAccessInterface>>new Map<string, EntityAccessInterface>(),
    base: <Map<string, CoreConfig>>new Map<string, CoreConfig>(),
    dataSetter: <Map<string, DataSetter>>new Map<string, DataSetter>(),
    entryAccess: <Map<string, string[]>>new Map<string, string[]>(),
    lastDataSetter: <Map<string, DataSetter>>new Map<string, DataSetter>(),
    decorator: <Map<string, DataDecorator>>new Map<string, DataDecorator>(),
    filter: <Map<string, DataFilter>>new Map<string, DataFilter>(),
    params: <Map<string, EntityParams>>new Map<string, EntityParams>(),
    repo: <Map<string, PopEntityRepoService>>new Map<string, PopEntityRepoService>(),
    tabs: <Map<string, TabConfig[]>>new Map<string, TabConfig[]>(),
    resources: <Map<string, Dictionary<ResourceInterface>>>new Map<string, Dictionary<ResourceInterface>>(),
    actions: <Map<string, Dictionary<any>>>new Map<string, Dictionary<any>>(),
    fields: <Map<string, Dictionary<any>>>new Map<string, Dictionary<any>>(),
    tables: <Map<string, EntityModelTableInterface>>new Map<string, EntityModelTableInterface>(),
    menus: <Map<string, EntityModelMenuInterface>>new Map<string, EntityModelMenuInterface>(),
    routes: <Map<string, ServiceRoutesInterface>>new Map<string, ServiceRoutesInterface>(),
  };


  /**
   * This srv is used in the
   * @param env
   */
  constructor(
    private fieldUtil: PopEntityUtilFieldService,
    private paramUtil: PopEntityUtilParamService,
  ) {
    this.asset.tabs.set('default', []);
  }


  /**
   * Check a specific crud access against an entity
   * @param internal_name
   * @param accessType
   */
  checkAccess(internal_name: string, accessType: string) {
    return this.paramUtil.checkAccess(internal_name, accessType);
  }


  /**
   * Configure/Extend the default behavior of an entity
   * @param internal_name
   * @param extend
   */
  configure(internal_name: string, extend: EntityModelInterface) {
    if (IsArray(extend.tab, true)) this.setEntityTabs(internal_name, extend.tab);
    if (IsObject(extend.action, true)) this.setEntityAction(internal_name, extend.action);
    if (IsArray(extend.entryAccess, true)) this.setEntityEntryAccess(internal_name, extend.entryAccess);
    if (IsObject(extend.resource, true)) this.setEntityResource(internal_name, extend.resource);
    if (IsCallableFunction(extend.dataSetter)) this.setEntityDataSetter(internal_name, extend.dataSetter);
    if (IsCallableFunction(extend.lastDataSetter)) this.setLastEntityDataSetter(internal_name, extend.lastDataSetter);
    if (IsCallableFunction(extend.decorator)) this.setEntityDecorator(internal_name, extend.decorator);
    if (IsCallableFunction(extend.filter)) this.setEntityFilter(internal_name, extend.filter);
    if (IsObject(extend.table, true)) this.setEntityTable(internal_name, extend.table);
    if (IsObject(extend.route, true)) this.setEntityRoute(internal_name, extend.route);
    if (IsObject(extend.field, true)) this.setEntityField(internal_name, extend.field);
    if (IsObject(extend.menu, true)) this.setEntityMenu(internal_name, extend.menu);
  }


  /**
   * A method to get a Core Config for an entity
   * Uses cache service to improve performance
   * ALL ENTITY RELATED COMPONENTS RELY ON THIS !!!!
   * @param entityParams
   * @param metadata
   */
  getCoreConfig(internal_name: string, entityId: number = 0, dom?: PopDomService): Promise<CoreConfig> {
    return new Promise<CoreConfig>((resolve) => {
//       console.log('internal_name', entityId);
      this._getBaseCoreConfig(internal_name).then((baseConfig: CoreConfig) => {
        if (+entityId > 0) {
          baseConfig.params.entityId = +entityId;

          baseConfig.repo.getEntity(baseConfig.params.entityId, {}).subscribe(async (res: any) => {
            baseConfig.entity = res.data ? <Entity>res.data : <Entity>res;

            await this.setCoreDomAssets(baseConfig, dom);
            // await this.setCoreDomAssets(baseConfig, dom);

            return resolve(baseConfig);
          }, () => {
            if (PopHistory.isPreviousHistory()) PopHistory.goBack();
            return resolve(null);
          });
        } else {
          return resolve(baseConfig);
        }
      });
    });
  }


  /**
   * Preferences are something that might change in the base configs, keep them there for now since they will not change often
   * Note: Moved preferences to base configs since they are not playing nice with cache and I want to update them directly
   * @param internal_name
   * @param key
   * @param value
   */
  updateBaseCoreConfig(internal_name: string, key: string, value: any) {
    const base = this.asset.base.get(internal_name);
    let subKey;
    if (base) {
      if (key.includes(':')) {
        const keys = key.split(':');
        key = String(keys[0]).trim();
        subKey = String(keys[1]).trim();
      }
      if (key in base) {
        if (subKey) {
          if (subKey in base[key]) {
            base[key][subKey] = value;
          }
        } else {
          base[key] = value;
        }
      }
      this.asset.base.set(internal_name, base);
    }

    return true;
  }


  /**
   * Get the base set of the entity definitions
   * These is the starting point when it comes to entities
   * @param internal_name
   * @param entityId
   */
  getEntityParams(internal_name: string, entityId: number = null): EntityParams {
    let entityParams;
    if (this.asset.params.has(internal_name)) {
      entityParams = {...this.asset.params.get(internal_name)};
      entityParams.entity = entityId;
    } else {
      entityParams = this.paramUtil.getEntityParams(internal_name);
      if (entityParams) {
        this.asset.params.set(internal_name, <EntityParams>{...entityParams});
      }
    }
    return entityParams;
  }


  /**
   * Get the entity repo
   * These is the starting point when it comes to entities
   * @param internal_name
   * @param entityId
   */
  getEntityRepo(internal_name: string): Promise<PopEntityRepoService> {
    return new Promise<PopEntityRepoService>(async (resolve) => {
      const baseConfig = await this._getBaseCoreConfig(internal_name);
      if (IsObject(baseConfig), ['repo']) {
        return resolve(baseConfig.repo);
      } else {
        return resolve(null);
      }
    });
  }


  /**
   * Get the entity params that are associated with a angular route ie.. /admin/accounts should resolve to the account params
   * @param api_path
   * @param id
   */
  getEntityParamsWithPath(api_path: string, id = null): EntityParams {
    return this.paramUtil.getEntityParamsWithPath(api_path, id);
  }


  /**
   * A helper function that fetches an entity internal name from an Active Route
   * This is a way to ask based of the current route what entity am I dealing with
   * @param route
   * @param extension
   */
  getRouteInternalName(route: ActivatedRoute, extension?: EntityExtendInterface) {
    let internal_name = 'user';
    if (route.snapshot.params && route.snapshot.params.internal_name) {
      internal_name = route.snapshot.params.internal_name;
    } else if (extension && IsString(extension.internal_name, true)) {
      internal_name = extension.internal_name;
    } else if (IsString(route.snapshot.data.internal_name, true)) {
      internal_name = route.snapshot.data.internal_name;
    } else if (IsString(route.snapshot.data.can_read, true)) {
      internal_name = route.snapshot.data.can_read;
    } else {
      let pathEntityParams;
      if (route.snapshot.routeConfig && route.snapshot.routeConfig.path) {
        pathEntityParams = this.paramUtil.getEntityParamsWithPath(route.snapshot.routeConfig.path);
      }
      if (pathEntityParams) {
        internal_name = pathEntityParams.internal_name;
      } else {
        let attempt;
        const parts = window.location.pathname.split('/');
        while (!internal_name || parts.length) {
          attempt = parts.pop();
          if (isNaN(attempt) && this.paramUtil.getEntityParams(attempt)) {
            internal_name = attempt;
            break;
          }
          if (!internal_name && isNaN(attempt) && this.paramUtil.getEntityParamsWithPath(attempt)) {
            internal_name = attempt;
            break;
          }
        }
      }
    }
    return internal_name;
  }


  /**
   * A helper function that fetches an entity Id from an Active Route
   * This is a way to ask based of the current route what entity am I dealing with
   * @param route
   * @param extension
   */
  getRouteParentId(route: ActivatedRoute, extension?: EntityExtendInterface) {
    let parentId = null;
    if (route.snapshot.params && route.snapshot.params.id) {
      parentId = route.snapshot.params.id;
    } else {
      let attempt;
      const parts = window.location.pathname.split('/');
      while (!parentId || parts.length) {
        attempt = parts.pop();
        if (IsNumber(attempt, true)) {
          parentId = attempt;
          break;
        }
      }
    }
    return parentId;
  }


  /**
   * Get the set of tab configs that belong to an entity
   */
  getEntityTabs(core?: CoreConfig): TabConfig[] {
    if (IsObject(core, ['params', 'entity']) && this.asset.tabs.has(core.params.internal_name)) {
      const tabs = this.asset.tabs.get(core.params.internal_name).filter((tab) => {
        return EvaluateWhenConditions(core, tab.when, core);
      });
      return [...tabs];
    } else {
      return [...this.asset.tabs.get('default')];
    }
  }


  /**
   * A method that refreshes just the entity on an CoreConfig
   * Will automatically update the entity on the entity config
   * @param config
   * @param queryParams
   */
  refreshCoreEntity(core: CoreConfig, dom: PopDomService, queryParams: QueryParamsInterface): Promise<Entity> {
    return new Promise<Entity>((resolve) => {
      if (core.params.entityId) core.repo.clearCache('entity', String(core.params.entityId), 'PopEntityService:refreshEntity');
      if (!IsObject(queryParams)) queryParams = {};
      if (core && core.repo) {
        queryParams.bypassCache = true;
        core.repo.getEntity(core.params.entityId, queryParams).subscribe(async (res: any) => {
          const entity = <Entity>GetHttpObjectResult(res);
          Object.keys(entity).map((key: string) => {
            core.entity[key] = entity[key];
          });
          await this.setCoreDomAssets(core, dom);
          PopLog.info(this.name, `refreshCoreEntity`, core.entity);
          return resolve(entity);
        }, (err) => {
          return resolve(null);
        });
      } else {
        return resolve(null);
      }
    });
  }


  /**
   * This function is responsible to make sure the CoreConfig has resources to do its job
   * IE... If a field request a data set , this function should make sure that it is available
   * @param core
   * @param dom
   * @private
   */
  setCoreDomAssets(core: CoreConfig, dom?: PopDomService): Promise<boolean> {
    return new Promise(async (resolve) => {


      core.resource = await core.repo.getUiResource(core);
      if (IsObject(core.entity, true)) {
        const dataSetter = StorageGetter(core.repo, ['model', 'dataSetter'], null);
        if (IsCallableFunction(dataSetter)) {
          core.entity = dataSetter(core, core.entity, dom);
        }
        if (IsObject(dom, true)) {
          await this.fieldUtil.buildDomFields(core, dom);
        }
        const lastDataSetter = StorageGetter(core.repo, ['model', 'lastDataSetter'], null);
        if (IsCallableFunction(lastDataSetter)) {
          core.entity = lastDataSetter(core, core.entity, dom);
        }
      }

      return resolve(true);
    });
  }


  /**
   * Set the base definitions for an entity
   * Each entity needs to define these so we know how to talk to the api in regards to it
   * The api should provide this details as part of the auth token
   * @param internal_name
   * @param entityId
   */
  setEntityParams(params: EntityParamsInterface) {
    PopLog.info(this.name, `Entity Params set for ${params.internal_name}`, params);
    this.paramUtil.setEntityParams(params);
  }


  /**
   * Attach a set of tab configs to an entity
   * @param internal_name
   * @param tabs
   */
  setEntityTabs(internal_name: string, tabs: TabConfig[]) {
    if (IsString(internal_name, true) && Array.isArray(tabs)) {
      PopLog.info(this.name, `Entity Tabs set for ${internal_name}`, tabs);
      this.asset.tabs.set(internal_name, tabs);
    }
  }


  /**
   * Attach a set of actions to an entity
   * @param internal_name
   * @param tabs
   */
  setEntityAction(internal_name: string, action: Dictionary<any>): void {
    if (IsString(internal_name, true) && IsObject(action)) {
      PopLog.info(this.name, `Entity Action set for ${internal_name}`, action);
      this.asset.actions.set(internal_name, action);
    }
  }


  /**
   * Attach a set of actions to an entity
   * @param internal_name
   * @param tabs
   */
  setEntityEntryAccess(internal_name: string, entryAccess: string[]): void {
    if (IsString(internal_name, true) && IsArray(entryAccess, true)) {
      PopLog.info(this.name, `Entity entryAccess set for ${internal_name}`, entryAccess);
      this.asset.entryAccess.set(internal_name, entryAccess);
    }
  }


  /**
   * Attach a set of table options for an entity
   * @param internal_name
   * @param tabs
   */
  setEntityTable(internal_name: string, table: EntityModelTableInterface): void {
    if (IsString(internal_name, true) && IsObject(table)) {
      PopLog.info(this.name, `Entity Action set for ${internal_name}`, table);
      this.asset.tables.set(internal_name, table);
    }
  }


  /**
   * Attach a set of table options for an entity
   * @param internal_name
   * @param tabs
   */
  setEntityRoute(internal_name: string, route: ServiceRoutesInterface): void {
    if (IsString(internal_name, true) && IsObject(route)) {
      PopLog.info(this.name, `Entity Route set for ${internal_name}`, route);
      this.asset.routes.set(internal_name, route);
    }
  }


  /**
   * Attach a set of tab menu configs to an entity
   * @param internal_name
   * @param tabs
   */
  setEntityMenu(internal_name: string, menu: EntityModelMenuInterface): void {
    if (IsString(internal_name, true) && IsObject(menu, true)) {
      PopLog.info(this.name, `Entity Menu set for ${internal_name}`, menu);
      this.asset.menus.set(internal_name, menu);
    }
  }


  /**
   * Attach a set of resources to an entity
   * @param internal_name
   * @param tabs
   */
  setEntityResource(internal_name: string, resource: Dictionary<ResourceInterface>): void {
    if (IsString(internal_name, true) && IsObject(resource)) {
      PopLog.info(this.name, `Entity Resource set for ${internal_name}`, resource);
      this.asset.resources.set(internal_name, resource);
    }
  }


  /**
   * Attach a data decorator that mutates entity data response
   * @param internal_name
   * @param tabs
   */
  setEntityDecorator(internal_name: string, decorator: DataDecorator): void {
    if (IsString(internal_name, true) && IsCallableFunction(decorator)) {
      PopLog.info(this.name, `Entity Decorator set for ${internal_name}`, decorator.toString());
      this.asset.decorator.set(internal_name, decorator);
    }
  }


  /**
   * Attach a data decorator that mutates entity data response
   * @param internal_name
   * @param tabs
   */
  setEntityDataSetter(internal_name: string, dataSetter: DataSetter): void {
    if (IsString(internal_name, true) && IsCallableFunction(dataSetter)) {
      PopLog.info(this.name, `Entity Data Setter set for ${internal_name}`, dataSetter.toString());
      this.asset.dataSetter.set(internal_name, dataSetter);
    }
  }


  /**
   * Attach a data decorator that mutates entity data response
   * @param internal_name
   * @param tabs
   */
  setLastEntityDataSetter(internal_name: string, dataSetter: DataSetter): void {
    if (IsString(internal_name, true) && IsCallableFunction(dataSetter)) {
      PopLog.info(this.name, `Entity Last Data Setter  set for ${internal_name}`, dataSetter.toString());
      this.asset.lastDataSetter.set(internal_name, dataSetter);
    }
  }


  /**
   * Attach a data filter to limit the entity data response
   * @param internal_name
   * @param tabs
   */
  setEntityFilter(internal_name: string, filter: DataFilter): void {
    if (IsString(internal_name, true) && IsCallableFunction(filter)) {
      PopLog.info(this.name, `Entity Filter set for ${internal_name}`, filter.toString());
      this.asset.filter.set(internal_name, filter);
    }
  }


  /**
   * Attach a set of fields to an entity
   * @param internal_name
   * @param tabs
   */
  setEntityField(internal_name: string, field: Dictionary<any>): void {
    if (IsString(internal_name, true) && IsObject(field)) {
      PopLog.info(this.name, `Entity Field set for ${internal_name}`, field);
      this.asset.fields.set(internal_name, field);
    }
  }


  /**
   * Get extended fields attached to an entity
   * @param internal_name
   * @param tabs
   */
  getEntityField(internal_name: string): Dictionary<any> {
    if (IsString(internal_name, true)) {
      const field = this.asset.fields.get(internal_name);
      return field ? field : {};
    }
  }

  /**
   * Get entry access for an entity
   * @param internal_name
   * @param tabs
   */
  getEntityEntryAccess(internal_name: string): Dictionary<any> {
    if (IsString(internal_name, true)) {
      const entryAccess = this.asset.entryAccess.get(internal_name);
      return IsArray(entryAccess, true) ? entryAccess : [];
    }
  }


  /**
   * Get extended fields attached to an entity
   * @param internal_name
   * @param tabs
   */
  getEntityResource(internal_name: string): Dictionary<ResourceInterface> {
    if (IsString(internal_name, true)) {
      const resource = this.asset.resources.get(internal_name);
      return resource ? resource : {};
    }
  }


  /**
   * Get entity data decorator
   * @param internal_name
   * @param tabs
   */
  getEntityDecorator(internal_name: string): DataDecorator {
    if (IsString(internal_name, true)) {
      const decorator = this.asset.decorator.get(internal_name);
      return IsCallableFunction(decorator) ? decorator : null;
    }
  }


  /**
   * Get entity data decorator
   * @param internal_name
   * @param tabs
   */
  getEntityDataSetter(internal_name: string): DataSetter {
    if (IsString(internal_name, true)) {
      const dataSetter = this.asset.dataSetter.get(internal_name);
      return IsCallableFunction(dataSetter) ? dataSetter : null;
    }
  }


  /**
   * Get entity data decorator
   * @param internal_name
   * @param tabs
   */
  getEntityLastDataSetter(internal_name: string): DataSetter {
    if (IsString(internal_name, true)) {
      const lastDataSetter = this.asset.lastDataSetter.get(internal_name);
      return IsCallableFunction(lastDataSetter) ? lastDataSetter : null;
    }
  }


  /**
   * Get entity data decorator
   * @param internal_name
   * @param tabs
   */
  getEntityFilter(internal_name: string): DataFilter {
    if (IsString(internal_name, true)) {
      const filter = this.asset.filter.get(internal_name);
      return IsCallableFunction(filter) ? filter : null;
    }
  }


  /**
   * Get extended actions attached to an entity
   * @param internal_name
   * @param tabs
   */
  getEntityAction(internal_name: string): Dictionary<any> {
    if (IsString(internal_name, true)) {
      const action = this.asset.actions.get(internal_name);
      return action ? action : {};
    }
  }


  /**
   * Get extended table attached to an entity
   * @param internal_name
   * @param tabs
   */
  getEntityTable(internal_name: string): EntityModelTableInterface {
    if (IsString(internal_name, true)) {
      const table = this.asset.tables.get(internal_name);
      return table ? table : {};
    }
  }


  /**
   * Get extended table attached to an entity
   * @param internal_name
   * @param tabs
   */
  getEntityRoute(internal_name: string): ServiceRoutesInterface {
    if (IsString(internal_name, true)) {
      const route = this.asset.routes.get(internal_name);
      return route ? route : {};
    }
  }


  /**
   * Get extended table attached to an entity
   * @param internal_name
   * @param tabs
   */
  getEntityMenu(internal_name: string): EntityModelMenuInterface {
    if (IsString(internal_name, true)) {
      const action = this.asset.menus.get(internal_name);
      return action ? action : {};
    }
  }


  bustAllCache() {
    this.asset.repo.forEach((repo: PopEntityRepoService, key: string) => {
      PopLog.init(this.name, `Bust cache for ${repo.getInternalName()}`);
      repo.clearAllCache('bustAllCache');
    });
  }


  ngOnDestroy() {
    console.log(this.name, `destroyed:${this.id}`);
  }


  /************************************************************************************************
   *                                                                                              *
   *                                      Under The Hood                                          *
   *                                    ( Private Method )                                        *
   *                                                                                              *
   ************************************************************************************************/


  /**
   * This will do all of the work of building and storing the base config for each entity
   * @param internal_name
   * @param routes
   * @private
   */
  private _getBaseCoreConfig(internal_name: string): Promise<CoreConfig> {
    return new Promise(async (resolve) => {
      if (!this.asset.base.has(internal_name)) {
        const params = this.getEntityParams(internal_name);
        const core = new CoreConfig({
          params: IsObjectThrowError(params, true, `Could not resolve params for ${internal_name}`) ? params : null,
        });
        core.flag = {routeCheck: IsAliasable(internal_name), assetCheck: true, modalCheck: false, refreshCheck: false};
        core.access = this._getEntityAccess(core.params);
        core.channel = new EventEmitter<PopBaseEventInterface>();
        core.repo = this._getEntityRepo(core.params);
        core.repo.model = {
          action: DeepMerge(JsonCopy(DefaultEntityAction), this.getEntityAction(core.params.internal_name)),
          dataSetter: this.getEntityDataSetter(core.params.internal_name),
          lastDataSetter: this.getEntityLastDataSetter(core.params.internal_name),
          decorator: this.getEntityDecorator(core.params.internal_name),
          filter: this.getEntityFilter(core.params.internal_name),
          table: DeepMerge(JsonCopy(DefaultEntityTable), this.getEntityTable(core.params.internal_name)),
          field: {...DeepMerge(DefaultEntityField), ...this.getEntityField(core.params.internal_name)},
          resource: DeepMerge(JsonCopy(DefaultEntityResource), this.getEntityResource(core.params.internal_name)),
          route: DeepMerge(JsonCopy(DefaultEntityRoute), this.getEntityRoute(core.params.internal_name)),
          menu: DeepMerge(JsonCopy(DefaultEntityMenu), this.getEntityMenu(core.params.internal_name))
        };
        core.repo.setRoutes(InterpolateEntityRoutes(core.repo.model.route, core.params));

        await forkJoin([this._getEntityConfig(core, internal_name), core.repo.getPreferences(core)]).subscribe(() => {
          this.asset.base.set(internal_name, core);
          return resolve({...this.asset.base.get(internal_name)});
        }, () => {
          return resolve({...this.asset.base.get(internal_name)});
        });
      } else {
        return resolve({...this.asset.base.get(internal_name)});
      }
    });
  }


  /**
   * Get the an entity repo class for a specific entity
   * This is intended to be run when a CoreConfig is requested for an entity, once created it will be stored and reused
   *
   * @param entityParams
   * @param routes
   */
  private _getEntityRepo(entityParams: EntityParams): PopEntityRepoService {
    let repo = null;
    if (IsObject(entityParams, true)) {
      if (this.asset.repo.has(entityParams.internal_name)) {
        repo = this.asset.repo.get(entityParams.internal_name);
      } else {

        repo = new PopEntityRepoService();
        repo.register(entityParams);
        this.asset.repo.set(entityParams.internal_name, repo);
      }
    }

    return repo;
  }


  /**
   * Get the crud access that is associated to a specific entity
   * This is intended to be run when a CoreConfig is requested for an entity, once created it will be stored and reused
   * @param entityParams
   */

  private _getEntityAccess(entityParams: EntityParams): EntityAccessInterface {
    let entityAccess = null;
    if (IsObject(entityParams, true)) {
      entityAccess = this.paramUtil.getAccess(entityParams.internal_name);
      if (this.asset.access.has(entityParams.internal_name)) {
        entityAccess = {...this.asset.access.get(entityParams.internal_name)};
      } else {
        entityAccess = this.paramUtil.getAccess(entityParams.internal_name);
        if (entityAccess) {
          this.asset.access.set(entityParams.internal_name, <EntityAccessInterface>{...entityAccess});
        }
      }
    }

    return entityAccess;
  }


  private _getEntityConfig(core: CoreConfig, internal_name: string): Promise<boolean> {
    return new Promise((resolve) => {
      core.repo.getConfig().subscribe((res: any) => {
        // this.getJsonModel(internal_name).then((res: any) => {
        let ApiModels = res.data ? res.data : res;
        ApiModels = ApiModels.model ? ApiModels.model : ApiModels;
        if (!IsObject(ApiModels)) {
          ApiModels = {};
        }
        core.repo.model = {
          ...core.repo.model,
          ...ApiModels //  Gives the api the ability to send over data, stub for future features
        };
        return resolve(true);
      }, () => {
        return resolve(false);
      });
    });
  }

}


