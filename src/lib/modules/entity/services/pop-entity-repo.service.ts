import {forkJoin, Observable, of} from 'rxjs';
import {PopBaseService} from '../../../services/pop-base.service';
import {Inject} from '@angular/core';
import {
  CoreConfig,
  Dictionary, Entity, EntityModelInterface,
  EntityParamsInterface, EntityPreference, PopBusiness, PopFilter, PopPipe,
  QueryParamsInterface, ResourceConfig,
  ServiceInjector, ServiceRoutesInterface
} from '../../../pop-common.model';
import {environment} from '../../../../environments/environment';
import {Router} from '@angular/router';
import {PopLogService} from '../../../services/pop-log.service';
import {
  ArrayGroupBy,
  InterpolateString, IsArray, IsDefined, IsCallableFunction,
  IsObject, IsString,
  SpaceToHyphenLower, StringReplaceAll, TitleCase, DeepMerge, JsonCopy, DeepCopy,
} from '../../../pop-common-utility';
import {PopDisplayService} from '../../../services/pop-display.service';
import {PopRequestService} from '../../../services/pop-request.service';
import {PopEntityUtilFieldService} from './pop-entity-util-field.service';
import {PopResourceService} from '../../../services/pop-resource.service';
import {map} from 'rxjs/operators';
import {InterpolateEntityRoute} from '../pop-entity-utility';
import {PopCacheService} from '../../../services/pop-cache.service';


export class PopEntityRepoService implements PopEntityServiceInterface {
  private name = 'PopEntityRepoService';
  private id: string;
  protected params: EntityParamsInterface;
  private activated = false;
  protected apiVersion = 1;


  public model: EntityModelInterface;

  protected srv: {
    base: PopBaseService,
    cache: PopCacheService,
    display: PopDisplayService,
    field: PopEntityUtilFieldService,
    log: PopLogService,
    request: PopRequestService,
    resource: PopResourceService,
    router: Router,
  };

  protected routes: ServiceRoutesInterface;


  protected setServiceContainer() {

    this.srv = {
      base: ServiceInjector.get(PopBaseService),
      cache: new PopCacheService(),
      display: ServiceInjector.get(PopDisplayService),
      field: ServiceInjector.get(PopEntityUtilFieldService),
      log: ServiceInjector.get(PopLogService),
      request: ServiceInjector.get(PopRequestService),
      resource: ServiceInjector.get(PopResourceService),
      router: ServiceInjector.get(Router),
    };
  }


  constructor(
    @Inject('env') private readonly env?
  ) {
    if (!this.env) this.env = <any>environment;
    this.setServiceContainer();
  }


  /**
   * Pass in in the EntityParams to tie this to a specific type of entity
   * (Moved out of constructor die to build issues)
   * @param entityParams
   */
  register(entityParams: EntityParamsInterface) {
    if (entityParams && entityParams.internal_name) {
      this.id = entityParams.internal_name;
      this.params = entityParams;
      this.activated = true;
      this.srv.log.init(this.name, `created:${this.id}`);
    }
  }


  /**
   * Pass in a route config for this entity
   * @param routes
   */
  setRoutes(routes: ServiceRoutesInterface) {
    this.routes = routes;
  }


  /**
   * A http call to archive a single entity
   * @param id
   * @param archive
   */
  archiveEntity(id: number | string, archive: boolean): Observable<any> {
    this.srv.cache.clearAll();
    let path = InterpolateEntityRoute(this.routes.archive.entity.path, {id: id});
    let body = {};
    if (archive) {
      if (IsObject(this.routes.archive.entity.params, true)) body = DeepMerge(JsonCopy(body), this.routes.archive.entity.params);
      body = {...body, ...{business_id: PopBusiness.id, archived: -1}};
      return this.srv.request.doDelete(path, body, this.apiVersion);
    } else {
      path = InterpolateEntityRoute(this.routes.restore.entity.path, {id: id});
      if (IsObject(this.routes.restore.entity.params, true)) body = DeepMerge(JsonCopy(body), this.routes.restore.entity.params);
      body = {...body, ...{business_id: PopBusiness.id, archived: -1}};
      return this.srv.request.doPost(path, body, this.apiVersion);
    }

  }


  /**
   * A http call to archive  multiple entities that passes a  {xx: {archive: 1}, xx: {archive: 1}, } structure
   * @param ids Primary Keys of the entities .[ 1 or 1,2,3,4,5 ]
   * @param archive
   */
  archiveEntities(ids: string | number, archive: boolean): Observable<any> {
    this.srv.cache.clearAll();
    const requests = [];
    if (archive) {
      String(ids).split(',').map((id) => {
        const path = InterpolateEntityRoute(this.routes.archive.entity.path, {id: id});
        requests.push(this.srv.request.doDelete(path, null, this.apiVersion));
      });
    } else {
      String(ids).split(',').map((id) => {
        let path = InterpolateString(this.routes.restore.entity.path, {id: id});
        path = StringReplaceAll(path, '\\?', '');
        path = StringReplaceAll(path, '\\/\\/', '\\/');
        requests.push(this.srv.request.doPost(path, {archived: -1}, this.apiVersion));
      });
    }
    return forkJoin(requests);
  }


  /**
   *  A method that returns the configured app
   */
  getAppName(): string {
    return this.params.app;
  }


  /**
   * A Http call that gets the entity configs
   * @param id Primary Key of the entity
   */
  getConfig(): Observable<any> {
    const path = `${this.routes.get.config.path}?entity_id=${this.params.id}`;
    if (this.params.id) {
      const body = IsObject(this.routes.get.config.params, true) ? this.routes.get.config.params : {};
      return this.srv.request.doGet(path, body, this.apiVersion).pipe(
        map((res: any) => {
          res = res.data ? res.data : res;
          res = ArrayGroupBy(res, 'type');
          if (IsObject(res, true)) {
            Object.keys(res).map((type: string) => {
              if (IsArray(res[type], true)) {
                const tmp = {};
                res[type].map((setting) => {
                  tmp[setting.name] = setting.config;
                });
                res[type] = tmp;
              }
            });
          } else {
            res = {};
          }
          return res;
        })
      );
    } else {
      return of({});
    }
  }


  /**
   *  A http call that gets a list of entities
   * @param queryParams '?archived=1', '?archived=0'
   */
  getEntities(body: Object = {}, queryParams?: QueryParamsInterface): Promise<Entity[]> {
    return new Promise<Entity[]>((resolve) => {
      let data = <Entity[]>[];
      if (!(IsObject(queryParams))) queryParams = {archived: 0};
      if (!(IsObject(body))) body = {archived: IsDefined(queryParams.archived) ? queryParams.archived : 0};

      if (this.model.table.filter && this.model.table.filter.active && IsObject(this.model.table.filter.query, true)) {
        if (!queryParams.bypassFilters) {
          Object.keys(this.model.table.filter.query).map((filterName: string) => {
            if (filterName in PopFilter && IsArray(PopFilter[filterName], true)) body[this.model.table.filter.query[filterName]] = PopFilter[filterName];
          });
          // queryParams.limit = 100;
        }
      }
      const path = `${this.routes.get.entities.path}`;
      if (IsObject(this.routes.get.entities.params, true) && !queryParams.bypassParams) {
        body = DeepMerge(JsonCopy(body), this.routes.get.entities.params);
      }
      let page = 1;
      this.srv.request.doGet(`${path}`, body, this.apiVersion).subscribe(
        (res: any) => {
          data = <Entity[]>res.data;
          if (IsObject(res.meta, true)) {
            const requests = [];
            const lastPage = res.meta.last_page;
            while (page < lastPage) {
              page++;
              requests.push(this.srv.request.doGet(`${path}?page=${page}`, body, this.apiVersion));
            }
            if (requests.length) {
              forkJoin(requests).subscribe((pages) => {
                pages.map((nextPage: any) => {
                  data.push(...nextPage.data);
                });
                return resolve(data);
              });
            } else {
              return resolve(data);
            }
          } else {
            return resolve(data);
          }
        });
    });
  }


  /**
   * A method that clears any cache for this entity type
   */
  clearAllCache(caller = ''): void {
    this.srv.cache.clearAll();
  }


  /**
   * A method that clears any cache for this entity type
   */
  clearCache(cacheType: string, cacheKey?: string, caller = ''): void {
    this.srv.cache.clear(cacheType, cacheKey);
  }


  setCache(cacheType: string, cacheKey: string, data: any, minutes = 1) {
    if (IsString(cacheType, true) && IsString(cacheKey) && IsDefined(data)) {
      if (minutes > 60) minutes = 60;
      this.srv.cache.set(cacheType, cacheKey, data, (minutes * 60 * 1000));
    }
  }


  getCache(cacheType: string, cacheKey: string) {
    return new Promise<Entity[]>((resolve) => {
      if (IsString(cacheType, true) && IsString(cacheKey)) {
        this.srv.cache.get(cacheType, cacheKey).subscribe((cacheData) => {
          if (IsDefined(cacheData)) {
            return resolve(cacheData);
          } else {
            resolve(null);
          }
        });
      } else {
        resolve(null);
      }
    });
  }


  /**
   *
   * @param id Primary Key of the entity
   * @param params '?metadata=1', '?metadata=0', '?metadata=1&filter=id,name'
   * @return Observable
   */
  getEntity(id: number | string, queryParams?: QueryParamsInterface): Observable<any> {
    if (!queryParams || typeof (queryParams) !== 'object') queryParams = {};
    let body = {archived: IsDefined(queryParams.archived) ? queryParams.archived : -1};
    if (+id) {
      const path = `${InterpolateString(this.routes.get.entity.path, {id: id})}`;
      if (IsObject(this.routes.get.entity.params, true) && !queryParams.bypassParams) body = DeepMerge(JsonCopy(body), this.routes.get.entity.params);
      this.srv.log.info(this.name, path, body);
      const request = this.srv.request.doGet(path, body, this.apiVersion);
      return queryParams.bypassCache ? request : this.srv.cache.get('entity', String(id), request);
    }
    return of(undefined);
  }


  /**
   * A Http call that gets the entity history
   * @param id Primary Key of the entity
   */
  getHistory(id: number): Observable<any> {
    return of([]);
    // const path = InterpolateString(this.routes.get.history, { id: id });
    // return this.srv.request.doGet(path, {}, this.apiVersion);
  }


  /**
   * A Http call that gets the entity metadata
   * @param id Primary Key of the entity
   */
  getUiResource(core: CoreConfig): Promise<any> {
    return new Promise(async (resolve) => {
      let ui = {};
      if (IsObject(this.model.resource, true)) {
        const success = await this.srv.resource.setCollection(this.model.resource, core);
        if (success) {
          ui = this.srv.resource.getCollection(this.model.resource);
          return resolve(ui);
        } else {
          resolve(false);
        }
      } else {
        resolve(ui);
      }
    });
  }


  /**
   * A Http call that gets the entity metadata
   * @param id Primary Key of the entity
   */
  reloadResource(core: CoreConfig, resourceName: string): Promise<boolean> {
    return new Promise(async (resolve) => {
      if (resourceName && IsObject(this.model.resource, [resourceName])) {
        if (!IsObject(core.resource)) core.resource = {};
        core.resource[resourceName] = await this.srv.resource.reloadResource(core, this.model.resource[resourceName]);
        return resolve(true);
      } else {
        return resolve(false);
      }
    });
  }


  /**
   * A Http call that gets the entity metadata
   * @param id Primary Key of the entity
   */
  injectResource(core: CoreConfig, resource: ResourceConfig, reload = false): Promise<boolean> {
    return new Promise(async (resolve) => {
      if (IsObject(resource, ['name'])) {
        if (!(IsObject(this.model.resource[resource.name]))) {
          if (!IsObject(this.model.resource)) this.model.resource = {};
          if (!IsObject(core.resource)) core.resource = {};

          this.model.resource[resource.name] = {...DeepCopy(resource)};
          if (resource.api_path && IsString(resource.api_path, true)) {
            core.resource[resource.name] = await this.srv.resource.reloadResource(core, resource);
          } else {
            core.resource[resource.name] = resource;
          }
          return resolve(true);
        } else if (IsObject(this.model.resource[resource.name], true) && resource.api_path && reload) {
          await this.reloadResource(core, resource.name);
          return resolve(true);
        } else {
          return resolve(true);
        }
      } else {
        return resolve(false);
      }
    });
  }


  /**
   * A method that gets the entity singular name for entity
   * @param field
   */
  getInternalName(): string {
    return this.params.internal_name;
  }


  /**
   * Get the alias display for this entity;
   * @param alias 'singular | 'plural';
   */
  getDisplayName(alias: string = 'singular'): string {
    return PopPipe.transform(this.params.internal_name, {type: 'entity', arg1: 'alias', arg2: alias});
  }


  /**
   * A method that gets the base api path for the entity
   * @param field
   */
  getApiPath(): string {

    return this.params.path;
  }


  /**
   * A http call that gets the preferences of a user
   */
  getPreferences(core: CoreConfig, cache = false): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const buUserId = this.srv.base.getCurrentBusinessUserId();
      if (buUserId) {
        const path = `${this.routes.get.preference.path}`;
        let body = {path: this.params.internal_name, bu_user_id: buUserId};
        if (IsObject(this.routes.get.preference.params, true)) body = DeepMerge(JsonCopy(body), this.routes.get.preference.params);
        const request = this.srv.request.doGet(path, body, this.apiVersion, true).pipe(
          map((res: any) => {
            const preferences = {};
            const tmp = res.data ? <Entity>res.data : <Entity>res;
            if (IsArray(tmp, true)) {
              tmp.map((preference) => {
                preferences[preference.type] = {...preference.settings, ...{id: preference.id}};
              });
            }
            return preferences;
          })
        );
        if (cache) {
          this.srv.cache.get(this.params.internal_name, 'preference', request, 600000).subscribe((res: any) => {
            if (!IsObject(core.preference)) core.preference = <EntityPreference>{};
            core.preference = {...core.preference, ...res};
            return resolve(true);
          }, (err) => {
            return resolve(false);
          });
        } else {
          request.subscribe((res: any) => {

            if (!IsObject(core.preference)) core.preference = <EntityPreference>{};
            core.preference = {...core.preference, ...res};
            return resolve(true);
          }, () => {
            return resolve(false);
          });
        }
      } else {
        return resolve(false);
      }
    });
  }


  /**
   * A http call that gets the preferences of a user
   */
  deletePreference(id: number, type: string): Promise<any> {
    return new Promise((resolve) => {
      const path = `${this.routes.get.preference.path}/${id}`;
      this.srv.request.doDelete(path, null, this.apiVersion, true).pipe(
      ).subscribe(() => {
        const defaultPreference = null;
        return resolve(defaultPreference);
        // this.srv.cache.clear([ `${this.params.internal_name}:preference` ]);
        // this.getPreferences(true).subscribe(() => {
        //   // ToDo:: Check inside entity models to see if a default table settings exist
        //   const defaultPreference = null;
        //   return resolve(defaultPreference);
        // });
      }, () => {
        return resolve(false);
      });
    });
  }


  /**
   * An Http call to save a preference
   * @param id
   * @param type
   * @param body
   */
  savePreference(id: number = null, type: string, body: Dictionary<any>): Observable<any> {
    let request;
    if (+id) {
      const path = `${this.routes.get.preference.path}/${id}`;
      if (IsObject(this.routes.get.preference.params, true)) body = DeepMerge(JsonCopy(body), this.routes.get.preference.params);
      request = this.srv.request.doPatch(path, body, this.apiVersion, true).pipe(
        map((res: any) => {
          let preference = {};
          const tmp = res.data ? <Entity>res.data : <Entity>res;
          if (IsObject(tmp, true)) {
            preference = {...tmp.settings, ...{id: tmp.id}};
          }
          return preference;
        })
      );
    } else {
      const buUserId = this.srv.base.getCurrentBusinessUserId();
      const path = `${this.routes.get.preference.path}`;
      if (IsObject(this.routes.get.preference.params, true)) body = DeepMerge(JsonCopy(body), this.routes.get.preference.params);
      body = {
        ...body, ...{
          path: this.params.internal_name,
          type: type,
          bu_user_id: buUserId,
          name: `${TitleCase(this.params.name)} ${TitleCase(type)} Setting`
        }
      };
      request = this.srv.request.doPost(path, body, this.apiVersion, true).pipe(
        map((res: any) => {
          let preference = {};
          const tmp = res.data ? <Entity>res.data : <Entity>res;
          if (IsObject(tmp, true)) {
            preference = {...tmp.settings, ...{id: tmp.id}};
          }
          return preference;
        })
      );
    }
    return request;
  }


  /**
   * A method that will navigate the user to the Tab View of an entity
   * Method should take into consideration the aliases that the entity might have
   * @param id Primary Key of the entity
   * @param tab
   */
  navigateToEntity(id: number | string, tab?: string): Promise<any> {
    return this.srv.router.navigateByUrl(`${this.srv.display.alias(SpaceToHyphenLower(this.params.name))}/${id}/${tab}`);
  }


  /**
   * A method that will navigate the user to the List View of an entity
   * Method should take into consideration the aliases that the entity might have
   * @param id Primary Key of the entity
   * @param tab
   */
  navigateToEntities(): Promise<any> {
    return this.srv.router.navigateByUrl(this.srv.display.alias(SpaceToHyphenLower(this.params.name)));
  }


  /**
   * A method that update an entity relation
   * Method should take into consideration the aliases that the entity might have
   * @param id Primary Key of the entity
   * @param tab
   */
  updateEntity(id: number | string, entity: any, queryParams?: QueryParamsInterface) {
    const path = InterpolateString(this.routes.patch.entity.path, {id: id});

    return this.srv.request.doPatch(path, entity, this.apiVersion);
  }

}


export interface PopEntityServiceInterface {

  /**
   * A http call to archive a single entity
   * @param id
   * @param archive
   */
  archiveEntity(id: number | string, archive: boolean): Observable<any>;

  /**
   * A http call to archive  multiple entities that passes a  {xx: {archive: 1}, xx: {archive: 1}, } structure
   * @param ids Primary Keys of the entities .[ 1 or 1,2,3,4,5 ]
   * @param archive
   */
  archiveEntities(ids: string | number, archive: boolean): Observable<any>;


  /**
   *  A method that returns the configured app
   */
  getAppName(): string;

  /**
   *  A http call that gets a list of entities
   * @param queryParams '?archived=1', '?archived=0'
   */
  getEntities(queryParams?: QueryParamsInterface): Promise<Entity[]>;

  /**
   *
   * @param id Primary Key of the entity
   * @param params '?metadata=1', '?metadata=0', '?metadata=1&filter=id,name'
   * @return Observable
   */
  getEntity(id: number | string, queryParams?: QueryParamsInterface): Observable<any>;

  /**
   * A Http call that gets the entity history
   * @param id Primary Key of the entity
   */
  getHistory(id: number): Observable<any>;


  /**
   * A Http call that gets the entity metadata
   */
  getUiResource(core: CoreConfig): Promise<any>;

  /**
   * A Http call that gets the entity configs
   * @param id Primary Key of the entity
   */
  getConfig(): Observable<any>;


  /**
   * A method that gets the Intermal name for an entity
   * @param field
   */
  getInternalName(): string;


  /**
   * A method that gets the Display name for a singular entity
   * @param field
   */
  getDisplayName(): string;


  /**
   * A method that gets the base api path for the entity
   * @param field
   */
  getApiPath(): string;

  /**
   * A http call that gets the user preferences of an Entity
   */
  getPreferences(core?: CoreConfig, cache?: boolean): Promise<any>;

  /**
   * A http call that reloads an existing resource
   */
  reloadResource(core: CoreConfig, resourceName: string): Promise<boolean>;

  /**
   * A method that will navigate the user to the Tab View of an entity
   * Method should take into consideration the aliases that the entity might have
   * @param id Primary Key of the entity
   * @param tab
   */
  navigateToEntity(id: number | string, tab?: string): Promise<any>;

  /**
   * A method that will navigate the user to the List View of an entity
   * Method should take into consideration the aliases that the entity might have
   * @param id Primary Key of the entity
   * @param tab
   */
  navigateToEntities(): Promise<any>;
}

