import { __awaiter } from "tslib";
import { forkJoin, of } from 'rxjs';
import { PopBaseService } from '../../../services/pop-base.service';
import { Inject } from '@angular/core';
import { PopBusiness, PopFilter, PopPipe, ServiceInjector } from '../../../pop-common.model';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';
import { PopLogService } from '../../../services/pop-log.service';
import { ArrayGroupBy, InterpolateString, IsArray, IsDefined, IsObject, IsString, SpaceToHyphenLower, StringReplaceAll, TitleCase, DeepMerge, JsonCopy, DeepCopy, } from '../../../pop-common-utility';
import { PopDisplayService } from '../../../services/pop-display.service';
import { PopRequestService } from '../../../services/pop-request.service';
import { PopEntityUtilFieldService } from './pop-entity-util-field.service';
import { PopResourceService } from '../../../services/pop-resource.service';
import { map } from 'rxjs/operators';
import { InterpolateEntityRoute } from '../pop-entity-utility';
import { PopCacheService } from '../../../services/pop-cache.service';
export class PopEntityRepoService {
    constructor(env) {
        this.env = env;
        this.name = 'PopEntityRepoService';
        this.activated = false;
        this.apiVersion = 1;
        if (!this.env)
            this.env = environment;
        this.setServiceContainer();
    }
    setServiceContainer() {
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
    /**
     * Pass in in the EntityParams to tie this to a specific type of entity
     * (Moved out of constructor die to build issues)
     * @param entityParams
     */
    register(entityParams) {
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
    setRoutes(routes) {
        this.routes = routes;
    }
    /**
     * A http call to archive a single entity
     * @param id
     * @param archive
     */
    archiveEntity(id, archive) {
        this.srv.cache.clearAll();
        let path = InterpolateEntityRoute(this.routes.archive.entity.path, { id: id });
        let body = {};
        if (archive) {
            if (IsObject(this.routes.archive.entity.params, true))
                body = DeepMerge(JsonCopy(body), this.routes.archive.entity.params);
            body = Object.assign(Object.assign({}, body), { business_id: PopBusiness.id, archived: -1 });
            return this.srv.request.doDelete(path, body, this.apiVersion);
        }
        else {
            path = InterpolateEntityRoute(this.routes.restore.entity.path, { id: id });
            if (IsObject(this.routes.restore.entity.params, true))
                body = DeepMerge(JsonCopy(body), this.routes.restore.entity.params);
            body = Object.assign(Object.assign({}, body), { business_id: PopBusiness.id, archived: -1 });
            return this.srv.request.doPost(path, body, this.apiVersion);
        }
    }
    /**
     * A http call to archive  multiple entities that passes a  {xx: {archive: 1}, xx: {archive: 1}, } structure
     * @param ids Primary Keys of the entities .[ 1 or 1,2,3,4,5 ]
     * @param archive
     */
    archiveEntities(ids, archive) {
        this.srv.cache.clearAll();
        const requests = [];
        if (archive) {
            String(ids).split(',').map((id) => {
                const path = InterpolateEntityRoute(this.routes.archive.entity.path, { id: id });
                requests.push(this.srv.request.doDelete(path, null, this.apiVersion));
            });
        }
        else {
            String(ids).split(',').map((id) => {
                let path = InterpolateString(this.routes.restore.entity.path, { id: id });
                path = StringReplaceAll(path, '\\?', '');
                path = StringReplaceAll(path, '\\/\\/', '\\/');
                requests.push(this.srv.request.doPost(path, { archived: -1 }, this.apiVersion));
            });
        }
        return forkJoin(requests);
    }
    /**
     *  A method that returns the configured app
     */
    getAppName() {
        return this.params.app;
    }
    /**
     * A Http call that gets the entity configs
     * @param id Primary Key of the entity
     */
    getConfig() {
        const path = `${this.routes.get.config.path}?entity_id=${this.params.id}`;
        if (this.params.id) {
            const body = IsObject(this.routes.get.config.params, true) ? this.routes.get.config.params : {};
            return this.srv.request.doGet(path, body, this.apiVersion).pipe(map((res) => {
                res = res.data ? res.data : res;
                res = ArrayGroupBy(res, 'type');
                if (IsObject(res, true)) {
                    Object.keys(res).map((type) => {
                        if (IsArray(res[type], true)) {
                            const tmp = {};
                            res[type].map((setting) => {
                                tmp[setting.name] = setting.config;
                            });
                            res[type] = tmp;
                        }
                    });
                }
                else {
                    res = {};
                }
                return res;
            }));
        }
        else {
            return of({});
        }
    }
    /**
     *  A http call that gets a list of entities
     * @param queryParams '?archived=1', '?archived=0'
     */
    getEntities(body = {}, queryParams) {
        return new Promise((resolve) => {
            let data = [];
            if (!(IsObject(queryParams)))
                queryParams = { archived: 0 };
            if (!(IsObject(body)))
                body = { archived: IsDefined(queryParams.archived) ? queryParams.archived : 0 };
            if (this.model.table.filter && this.model.table.filter.active && IsObject(this.model.table.filter.query, true)) {
                if (!queryParams.bypassFilters) {
                    Object.keys(this.model.table.filter.query).map((filterName) => {
                        if (filterName in PopFilter && IsArray(PopFilter[filterName], true))
                            body[this.model.table.filter.query[filterName]] = PopFilter[filterName];
                    });
                    // queryParams.limit = 100;
                }
            }
            const path = `${this.routes.get.entities.path}`;
            if (IsObject(this.routes.get.entities.params, true) && !queryParams.bypassParams) {
                body = DeepMerge(JsonCopy(body), this.routes.get.entities.params);
            }
            let page = 1;
            this.srv.request.doGet(`${path}`, body, this.apiVersion).subscribe((res) => {
                data = res.data;
                if (IsObject(res.meta, true)) {
                    const requests = [];
                    const lastPage = res.meta.last_page;
                    while (page < lastPage) {
                        page++;
                        requests.push(this.srv.request.doGet(`${path}?page=${page}`, body, this.apiVersion));
                    }
                    if (requests.length) {
                        forkJoin(requests).subscribe((pages) => {
                            pages.map((nextPage) => {
                                data.push(...nextPage.data);
                            });
                            return resolve(data);
                        });
                    }
                    else {
                        return resolve(data);
                    }
                }
                else {
                    return resolve(data);
                }
            });
        });
    }
    /**
     * A method that clears any cache for this entity type
     */
    clearAllCache(caller = '') {
        this.srv.cache.clearAll();
    }
    /**
     * A method that clears any cache for this entity type
     */
    clearCache(cacheType, cacheKey, caller = '') {
        this.srv.cache.clear(cacheType, cacheKey);
    }
    setCache(cacheType, cacheKey, data, minutes = 1) {
        if (IsString(cacheType, true) && IsString(cacheKey) && IsDefined(data)) {
            if (minutes > 60)
                minutes = 60;
            this.srv.cache.set(cacheType, cacheKey, data, (minutes * 60 * 1000));
        }
    }
    getCache(cacheType, cacheKey) {
        return new Promise((resolve) => {
            if (IsString(cacheType, true) && IsString(cacheKey)) {
                this.srv.cache.get(cacheType, cacheKey).subscribe((cacheData) => {
                    if (IsDefined(cacheData)) {
                        return resolve(cacheData);
                    }
                    else {
                        resolve(null);
                    }
                });
            }
            else {
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
    getEntity(id, queryParams) {
        if (!queryParams || typeof (queryParams) !== 'object')
            queryParams = {};
        let body = { archived: IsDefined(queryParams.archived) ? queryParams.archived : -1 };
        if (+id) {
            const path = `${InterpolateString(this.routes.get.entity.path, { id: id })}`;
            if (IsObject(this.routes.get.entity.params, true) && !queryParams.bypassParams)
                body = DeepMerge(JsonCopy(body), this.routes.get.entity.params);
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
    getHistory(id) {
        return of([]);
        // const path = InterpolateString(this.routes.get.history, { id: id });
        // return this.srv.request.doGet(path, {}, this.apiVersion);
    }
    /**
     * A Http call that gets the entity metadata
     * @param id Primary Key of the entity
     */
    getUiResource(core) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            let ui = {};
            if (IsObject(this.model.resource, true)) {
                const success = yield this.srv.resource.setCollection(this.model.resource, core);
                if (success) {
                    ui = this.srv.resource.getCollection(this.model.resource);
                    return resolve(ui);
                }
                else {
                    resolve(false);
                }
            }
            else {
                resolve(ui);
            }
        }));
    }
    /**
     * A Http call that gets the entity metadata
     * @param id Primary Key of the entity
     */
    reloadResource(core, resourceName) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            if (resourceName && IsObject(this.model.resource, [resourceName])) {
                if (!IsObject(core.resource))
                    core.resource = {};
                core.resource[resourceName] = yield this.srv.resource.reloadResource(core, this.model.resource[resourceName]);
                return resolve(true);
            }
            else {
                return resolve(false);
            }
        }));
    }
    /**
     * A Http call that gets the entity metadata
     * @param id Primary Key of the entity
     */
    injectResource(core, resource, reload = false) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            if (IsObject(resource, ['name'])) {
                if (!(IsObject(this.model.resource[resource.name]))) {
                    if (!IsObject(this.model.resource))
                        this.model.resource = {};
                    if (!IsObject(core.resource))
                        core.resource = {};
                    this.model.resource[resource.name] = Object.assign({}, DeepCopy(resource));
                    if (resource.api_path && IsString(resource.api_path, true)) {
                        core.resource[resource.name] = yield this.srv.resource.reloadResource(core, resource);
                    }
                    else {
                        core.resource[resource.name] = resource;
                    }
                    return resolve(true);
                }
                else if (IsObject(this.model.resource[resource.name], true) && resource.api_path && reload) {
                    yield this.reloadResource(core, resource.name);
                    return resolve(true);
                }
                else {
                    return resolve(true);
                }
            }
            else {
                return resolve(false);
            }
        }));
    }
    /**
     * A method that gets the entity singular name for entity
     * @param field
     */
    getInternalName() {
        return this.params.internal_name;
    }
    /**
     * Get the alias display for this entity;
     * @param alias 'singular | 'plural';
     */
    getDisplayName(alias = 'singular') {
        return PopPipe.transform(this.params.internal_name, { type: 'entity', arg1: 'alias', arg2: alias });
    }
    /**
     * A method that gets the base api path for the entity
     * @param field
     */
    getApiPath() {
        return this.params.path;
    }
    /**
     * A http call that gets the preferences of a user
     */
    getPreferences(core, cache = false) {
        return new Promise((resolve) => {
            const buUserId = this.srv.base.getCurrentBusinessUserId();
            if (buUserId) {
                const path = `${this.routes.get.preference.path}`;
                let body = { path: this.params.internal_name, bu_user_id: buUserId };
                if (IsObject(this.routes.get.preference.params, true))
                    body = DeepMerge(JsonCopy(body), this.routes.get.preference.params);
                const request = this.srv.request.doGet(path, body, this.apiVersion, true).pipe(map((res) => {
                    const preferences = {};
                    const tmp = res.data ? res.data : res;
                    if (IsArray(tmp, true)) {
                        tmp.map((preference) => {
                            preferences[preference.type] = Object.assign(Object.assign({}, preference.settings), { id: preference.id });
                        });
                    }
                    return preferences;
                }));
                if (cache) {
                    this.srv.cache.get(this.params.internal_name, 'preference', request, 600000).subscribe((res) => {
                        if (!IsObject(core.preference))
                            core.preference = {};
                        core.preference = Object.assign(Object.assign({}, core.preference), res);
                        return resolve(true);
                    }, (err) => {
                        return resolve(false);
                    });
                }
                else {
                    request.subscribe((res) => {
                        if (!IsObject(core.preference))
                            core.preference = {};
                        core.preference = Object.assign(Object.assign({}, core.preference), res);
                        return resolve(true);
                    }, () => {
                        return resolve(false);
                    });
                }
            }
            else {
                return resolve(false);
            }
        });
    }
    /**
     * A http call that gets the preferences of a user
     */
    deletePreference(id, type) {
        return new Promise((resolve) => {
            const path = `${this.routes.get.preference.path}/${id}`;
            this.srv.request.doDelete(path, null, this.apiVersion, true).pipe().subscribe(() => {
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
    savePreference(id = null, type, body) {
        let request;
        if (+id) {
            const path = `${this.routes.get.preference.path}/${id}`;
            if (IsObject(this.routes.get.preference.params, true))
                body = DeepMerge(JsonCopy(body), this.routes.get.preference.params);
            request = this.srv.request.doPatch(path, body, this.apiVersion, true).pipe(map((res) => {
                let preference = {};
                const tmp = res.data ? res.data : res;
                if (IsObject(tmp, true)) {
                    preference = Object.assign(Object.assign({}, tmp.settings), { id: tmp.id });
                }
                return preference;
            }));
        }
        else {
            const buUserId = this.srv.base.getCurrentBusinessUserId();
            const path = `${this.routes.get.preference.path}`;
            if (IsObject(this.routes.get.preference.params, true))
                body = DeepMerge(JsonCopy(body), this.routes.get.preference.params);
            body = Object.assign(Object.assign({}, body), {
                path: this.params.internal_name,
                type: type,
                bu_user_id: buUserId,
                name: `${TitleCase(this.params.name)} ${TitleCase(type)} Setting`
            });
            request = this.srv.request.doPost(path, body, this.apiVersion, true).pipe(map((res) => {
                let preference = {};
                const tmp = res.data ? res.data : res;
                if (IsObject(tmp, true)) {
                    preference = Object.assign(Object.assign({}, tmp.settings), { id: tmp.id });
                }
                return preference;
            }));
        }
        return request;
    }
    /**
     * A method that will navigate the user to the Tab View of an entity
     * Method should take into consideration the aliases that the entity might have
     * @param id Primary Key of the entity
     * @param tab
     */
    navigateToEntity(id, tab) {
        return this.srv.router.navigateByUrl(`${this.srv.display.alias(SpaceToHyphenLower(this.params.name))}/${id}/${tab}`);
    }
    /**
     * A method that will navigate the user to the List View of an entity
     * Method should take into consideration the aliases that the entity might have
     * @param id Primary Key of the entity
     * @param tab
     */
    navigateToEntities() {
        return this.srv.router.navigateByUrl(this.srv.display.alias(SpaceToHyphenLower(this.params.name)));
    }
    /**
     * A method that update an entity relation
     * Method should take into consideration the aliases that the entity might have
     * @param id Primary Key of the entity
     * @param tab
     */
    updateEntity(id, entity, queryParams) {
        const path = InterpolateString(this.routes.patch.entity.path, { id: id });
        return this.srv.request.doPatch(path, entity, this.apiVersion);
    }
}
PopEntityRepoService.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: ['env',] }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS1yZXBvLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9lbnRpdHkvc2VydmljZXMvcG9wLWVudGl0eS1yZXBvLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBQyxRQUFRLEVBQWMsRUFBRSxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQzlDLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxvQ0FBb0MsQ0FBQztBQUNsRSxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3JDLE9BQU8sRUFHb0MsV0FBVyxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBRXhFLGVBQWUsRUFDaEIsTUFBTSwyQkFBMkIsQ0FBQztBQUNuQyxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sc0NBQXNDLENBQUM7QUFDakUsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ3ZDLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxtQ0FBbUMsQ0FBQztBQUNoRSxPQUFPLEVBQ0wsWUFBWSxFQUNaLGlCQUFpQixFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQ3JDLFFBQVEsRUFBRSxRQUFRLEVBQ2xCLGtCQUFrQixFQUFFLGdCQUFnQixFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLFFBQVEsR0FDL0UsTUFBTSw2QkFBNkIsQ0FBQztBQUNyQyxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSx1Q0FBdUMsQ0FBQztBQUN4RSxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSx1Q0FBdUMsQ0FBQztBQUN4RSxPQUFPLEVBQUMseUJBQXlCLEVBQUMsTUFBTSxpQ0FBaUMsQ0FBQztBQUMxRSxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSx3Q0FBd0MsQ0FBQztBQUMxRSxPQUFPLEVBQUMsR0FBRyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDbkMsT0FBTyxFQUFDLHNCQUFzQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDN0QsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLHFDQUFxQyxDQUFDO0FBR3BFLE1BQU0sT0FBTyxvQkFBb0I7SUF1Qy9CLFlBQ2tDLEdBQUk7UUFBSixRQUFHLEdBQUgsR0FBRyxDQUFDO1FBdkM5QixTQUFJLEdBQUcsc0JBQXNCLENBQUM7UUFHOUIsY0FBUyxHQUFHLEtBQUssQ0FBQztRQUNoQixlQUFVLEdBQUcsQ0FBQyxDQUFDO1FBcUN2QixJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUc7WUFBRSxJQUFJLENBQUMsR0FBRyxHQUFRLFdBQVcsQ0FBQztRQUMzQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztJQUM3QixDQUFDO0lBcEJTLG1CQUFtQjtRQUUzQixJQUFJLENBQUMsR0FBRyxHQUFHO1lBQ1QsSUFBSSxFQUFFLGVBQWUsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDO1lBQ3pDLEtBQUssRUFBRSxJQUFJLGVBQWUsRUFBRTtZQUM1QixPQUFPLEVBQUUsZUFBZSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQztZQUMvQyxLQUFLLEVBQUUsZUFBZSxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQztZQUNyRCxHQUFHLEVBQUUsZUFBZSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUM7WUFDdkMsT0FBTyxFQUFFLGVBQWUsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUM7WUFDL0MsUUFBUSxFQUFFLGVBQWUsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUM7WUFDakQsTUFBTSxFQUFFLGVBQWUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDO1NBQ3BDLENBQUM7SUFDSixDQUFDO0lBV0Q7Ozs7T0FJRztJQUNILFFBQVEsQ0FBQyxZQUFtQztRQUMxQyxJQUFJLFlBQVksSUFBSSxZQUFZLENBQUMsYUFBYSxFQUFFO1lBQzlDLElBQUksQ0FBQyxFQUFFLEdBQUcsWUFBWSxDQUFDLGFBQWEsQ0FBQztZQUNyQyxJQUFJLENBQUMsTUFBTSxHQUFHLFlBQVksQ0FBQztZQUMzQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztZQUN0QixJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxXQUFXLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQ3BEO0lBQ0gsQ0FBQztJQUdEOzs7T0FHRztJQUNILFNBQVMsQ0FBQyxNQUE4QjtRQUN0QyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztJQUN2QixDQUFDO0lBR0Q7Ozs7T0FJRztJQUNILGFBQWEsQ0FBQyxFQUFtQixFQUFFLE9BQWdCO1FBQ2pELElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzFCLElBQUksSUFBSSxHQUFHLHNCQUFzQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFBQyxFQUFFLEVBQUUsRUFBRSxFQUFDLENBQUMsQ0FBQztRQUM3RSxJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7UUFDZCxJQUFJLE9BQU8sRUFBRTtZQUNYLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDO2dCQUFFLElBQUksR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMzSCxJQUFJLG1DQUFPLElBQUksR0FBSyxFQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsRUFBRSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7WUFDakUsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDL0Q7YUFBTTtZQUNMLElBQUksR0FBRyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQUMsRUFBRSxFQUFFLEVBQUUsRUFBQyxDQUFDLENBQUM7WUFDekUsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUM7Z0JBQUUsSUFBSSxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzNILElBQUksbUNBQU8sSUFBSSxHQUFLLEVBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxFQUFFLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQztZQUNqRSxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztTQUM3RDtJQUVILENBQUM7SUFHRDs7OztPQUlHO0lBQ0gsZUFBZSxDQUFDLEdBQW9CLEVBQUUsT0FBZ0I7UUFDcEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDMUIsTUFBTSxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLElBQUksT0FBTyxFQUFFO1lBQ1gsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRTtnQkFDaEMsTUFBTSxJQUFJLEdBQUcsc0JBQXNCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxFQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUMsQ0FBQyxDQUFDO2dCQUMvRSxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQ3hFLENBQUMsQ0FBQyxDQUFDO1NBQ0o7YUFBTTtZQUNMLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUU7Z0JBQ2hDLElBQUksSUFBSSxHQUFHLGlCQUFpQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFBQyxFQUFFLEVBQUUsRUFBRSxFQUFDLENBQUMsQ0FBQztnQkFDeEUsSUFBSSxHQUFHLGdCQUFnQixDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQ3pDLElBQUksR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUMvQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUMsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUNoRixDQUFDLENBQUMsQ0FBQztTQUNKO1FBQ0QsT0FBTyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDNUIsQ0FBQztJQUdEOztPQUVHO0lBQ0gsVUFBVTtRQUNSLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUM7SUFDekIsQ0FBQztJQUdEOzs7T0FHRztJQUNILFNBQVM7UUFDUCxNQUFNLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLGNBQWMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUMxRSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFO1lBQ2xCLE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDaEcsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUM3RCxHQUFHLENBQUMsQ0FBQyxHQUFRLEVBQUUsRUFBRTtnQkFDZixHQUFHLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO2dCQUNoQyxHQUFHLEdBQUcsWUFBWSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDaEMsSUFBSSxRQUFRLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxFQUFFO29CQUN2QixNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQVksRUFBRSxFQUFFO3dCQUNwQyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUU7NEJBQzVCLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQzs0QkFDZixHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7Z0NBQ3hCLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQzs0QkFDckMsQ0FBQyxDQUFDLENBQUM7NEJBQ0gsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQzt5QkFDakI7b0JBQ0gsQ0FBQyxDQUFDLENBQUM7aUJBQ0o7cUJBQU07b0JBQ0wsR0FBRyxHQUFHLEVBQUUsQ0FBQztpQkFDVjtnQkFDRCxPQUFPLEdBQUcsQ0FBQztZQUNiLENBQUMsQ0FBQyxDQUNILENBQUM7U0FDSDthQUFNO1lBQ0wsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDZjtJQUNILENBQUM7SUFHRDs7O09BR0c7SUFDSCxXQUFXLENBQUMsT0FBZSxFQUFFLEVBQUUsV0FBa0M7UUFDL0QsT0FBTyxJQUFJLE9BQU8sQ0FBVyxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQ3ZDLElBQUksSUFBSSxHQUFhLEVBQUUsQ0FBQztZQUN4QixJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQUUsV0FBVyxHQUFHLEVBQUMsUUFBUSxFQUFFLENBQUMsRUFBQyxDQUFDO1lBQzFELElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFBRSxJQUFJLEdBQUcsRUFBQyxRQUFRLEVBQUUsU0FBUyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUM7WUFFckcsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRTtnQkFDOUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLEVBQUU7b0JBQzlCLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFVBQWtCLEVBQUUsRUFBRTt3QkFDcEUsSUFBSSxVQUFVLElBQUksU0FBUyxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEVBQUUsSUFBSSxDQUFDOzRCQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO29CQUMvSSxDQUFDLENBQUMsQ0FBQztvQkFDSCwyQkFBMkI7aUJBQzVCO2FBQ0Y7WUFDRCxNQUFNLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNoRCxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksRUFBRTtnQkFDaEYsSUFBSSxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQ25FO1lBQ0QsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDO1lBQ2IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxTQUFTLENBQ2hFLENBQUMsR0FBUSxFQUFFLEVBQUU7Z0JBQ1gsSUFBSSxHQUFhLEdBQUcsQ0FBQyxJQUFJLENBQUM7Z0JBQzFCLElBQUksUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUU7b0JBQzVCLE1BQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQztvQkFDcEIsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7b0JBQ3BDLE9BQU8sSUFBSSxHQUFHLFFBQVEsRUFBRTt3QkFDdEIsSUFBSSxFQUFFLENBQUM7d0JBQ1AsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLFNBQVMsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO3FCQUN0RjtvQkFDRCxJQUFJLFFBQVEsQ0FBQyxNQUFNLEVBQUU7d0JBQ25CLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTs0QkFDckMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQWEsRUFBRSxFQUFFO2dDQUMxQixJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDOzRCQUM5QixDQUFDLENBQUMsQ0FBQzs0QkFDSCxPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQzt3QkFDdkIsQ0FBQyxDQUFDLENBQUM7cUJBQ0o7eUJBQU07d0JBQ0wsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQ3RCO2lCQUNGO3FCQUFNO29CQUNMLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUN0QjtZQUNILENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBR0Q7O09BRUc7SUFDSCxhQUFhLENBQUMsTUFBTSxHQUFHLEVBQUU7UUFDdkIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDNUIsQ0FBQztJQUdEOztPQUVHO0lBQ0gsVUFBVSxDQUFDLFNBQWlCLEVBQUUsUUFBaUIsRUFBRSxNQUFNLEdBQUcsRUFBRTtRQUMxRCxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFHRCxRQUFRLENBQUMsU0FBaUIsRUFBRSxRQUFnQixFQUFFLElBQVMsRUFBRSxPQUFPLEdBQUcsQ0FBQztRQUNsRSxJQUFJLFFBQVEsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLElBQUksUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUN0RSxJQUFJLE9BQU8sR0FBRyxFQUFFO2dCQUFFLE9BQU8sR0FBRyxFQUFFLENBQUM7WUFDL0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUMsT0FBTyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1NBQ3RFO0lBQ0gsQ0FBQztJQUdELFFBQVEsQ0FBQyxTQUFpQixFQUFFLFFBQWdCO1FBQzFDLE9BQU8sSUFBSSxPQUFPLENBQVcsQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUN2QyxJQUFJLFFBQVEsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLElBQUksUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUNuRCxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxFQUFFO29CQUM5RCxJQUFJLFNBQVMsQ0FBQyxTQUFTLENBQUMsRUFBRTt3QkFDeEIsT0FBTyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7cUJBQzNCO3lCQUFNO3dCQUNMLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDZjtnQkFDSCxDQUFDLENBQUMsQ0FBQzthQUNKO2lCQUFNO2dCQUNMLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUNmO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBR0Q7Ozs7O09BS0c7SUFDSCxTQUFTLENBQUMsRUFBbUIsRUFBRSxXQUFrQztRQUMvRCxJQUFJLENBQUMsV0FBVyxJQUFJLE9BQU8sQ0FBQyxXQUFXLENBQUMsS0FBSyxRQUFRO1lBQUUsV0FBVyxHQUFHLEVBQUUsQ0FBQztRQUN4RSxJQUFJLElBQUksR0FBRyxFQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDO1FBQ25GLElBQUksQ0FBQyxFQUFFLEVBQUU7WUFDUCxNQUFNLElBQUksR0FBRyxHQUFHLGlCQUFpQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFBQyxFQUFFLEVBQUUsRUFBRSxFQUFDLENBQUMsRUFBRSxDQUFDO1lBQzNFLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWTtnQkFBRSxJQUFJLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDaEosSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3pDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNwRSxPQUFPLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7U0FDOUY7UUFDRCxPQUFPLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN2QixDQUFDO0lBR0Q7OztPQUdHO0lBQ0gsVUFBVSxDQUFDLEVBQVU7UUFDbkIsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDZCx1RUFBdUU7UUFDdkUsNERBQTREO0lBQzlELENBQUM7SUFHRDs7O09BR0c7SUFDSCxhQUFhLENBQUMsSUFBZ0I7UUFDNUIsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFPLE9BQU8sRUFBRSxFQUFFO1lBQ25DLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQztZQUNaLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxFQUFFO2dCQUN2QyxNQUFNLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDakYsSUFBSSxPQUFPLEVBQUU7b0JBQ1gsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUMxRCxPQUFPLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztpQkFDcEI7cUJBQU07b0JBQ0wsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUNoQjthQUNGO2lCQUFNO2dCQUNMLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUNiO1FBQ0gsQ0FBQyxDQUFBLENBQUMsQ0FBQztJQUNMLENBQUM7SUFHRDs7O09BR0c7SUFDSCxjQUFjLENBQUMsSUFBZ0IsRUFBRSxZQUFvQjtRQUNuRCxPQUFPLElBQUksT0FBTyxDQUFDLENBQU8sT0FBTyxFQUFFLEVBQUU7WUFDbkMsSUFBSSxZQUFZLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsWUFBWSxDQUFDLENBQUMsRUFBRTtnQkFDakUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO29CQUFFLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO2dCQUNqRCxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxHQUFHLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO2dCQUM5RyxPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUN0QjtpQkFBTTtnQkFDTCxPQUFPLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUN2QjtRQUNILENBQUMsQ0FBQSxDQUFDLENBQUM7SUFDTCxDQUFDO0lBR0Q7OztPQUdHO0lBQ0gsY0FBYyxDQUFDLElBQWdCLEVBQUUsUUFBd0IsRUFBRSxNQUFNLEdBQUcsS0FBSztRQUN2RSxPQUFPLElBQUksT0FBTyxDQUFDLENBQU8sT0FBTyxFQUFFLEVBQUU7WUFDbkMsSUFBSSxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRTtnQkFDaEMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUU7b0JBQ25ELElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUM7d0JBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO29CQUM3RCxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7d0JBQUUsSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7b0JBRWpELElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMscUJBQU8sUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7b0JBQzdELElBQUksUUFBUSxDQUFDLFFBQVEsSUFBSSxRQUFRLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsRUFBRTt3QkFDMUQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO3FCQUN2Rjt5QkFBTTt3QkFDTCxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxRQUFRLENBQUM7cUJBQ3pDO29CQUNELE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUN0QjtxQkFBTSxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksUUFBUSxDQUFDLFFBQVEsSUFBSSxNQUFNLEVBQUU7b0JBQzVGLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUMvQyxPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDdEI7cUJBQU07b0JBQ0wsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ3RCO2FBQ0Y7aUJBQU07Z0JBQ0wsT0FBTyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDdkI7UUFDSCxDQUFDLENBQUEsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUdEOzs7T0FHRztJQUNILGVBQWU7UUFDYixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDO0lBQ25DLENBQUM7SUFHRDs7O09BR0c7SUFDSCxjQUFjLENBQUMsUUFBZ0IsVUFBVTtRQUN2QyxPQUFPLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBQyxDQUFDLENBQUM7SUFDcEcsQ0FBQztJQUdEOzs7T0FHRztJQUNILFVBQVU7UUFFUixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQzFCLENBQUM7SUFHRDs7T0FFRztJQUNILGNBQWMsQ0FBQyxJQUFnQixFQUFFLEtBQUssR0FBRyxLQUFLO1FBQzVDLE9BQU8sSUFBSSxPQUFPLENBQVUsQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUN0QyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO1lBQzFELElBQUksUUFBUSxFQUFFO2dCQUNaLE1BQU0sSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNsRCxJQUFJLElBQUksR0FBRyxFQUFDLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFDLENBQUM7Z0JBQ25FLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDO29CQUFFLElBQUksR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDM0gsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQzVFLEdBQUcsQ0FBQyxDQUFDLEdBQVEsRUFBRSxFQUFFO29CQUNmLE1BQU0sV0FBVyxHQUFHLEVBQUUsQ0FBQztvQkFDdkIsTUFBTSxHQUFHLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQVMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQVMsR0FBRyxDQUFDO29CQUN0RCxJQUFJLE9BQU8sQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEVBQUU7d0JBQ3RCLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxVQUFVLEVBQUUsRUFBRTs0QkFDckIsV0FBVyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsbUNBQU8sVUFBVSxDQUFDLFFBQVEsR0FBSyxFQUFDLEVBQUUsRUFBRSxVQUFVLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQzt3QkFDbEYsQ0FBQyxDQUFDLENBQUM7cUJBQ0o7b0JBQ0QsT0FBTyxXQUFXLENBQUM7Z0JBQ3JCLENBQUMsQ0FBQyxDQUNILENBQUM7Z0JBQ0YsSUFBSSxLQUFLLEVBQUU7b0JBQ1QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBUSxFQUFFLEVBQUU7d0JBQ2xHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQzs0QkFBRSxJQUFJLENBQUMsVUFBVSxHQUFxQixFQUFFLENBQUM7d0JBQ3ZFLElBQUksQ0FBQyxVQUFVLG1DQUFPLElBQUksQ0FBQyxVQUFVLEdBQUssR0FBRyxDQUFDLENBQUM7d0JBQy9DLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUN2QixDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRTt3QkFDVCxPQUFPLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDeEIsQ0FBQyxDQUFDLENBQUM7aUJBQ0o7cUJBQU07b0JBQ0wsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQVEsRUFBRSxFQUFFO3dCQUU3QixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7NEJBQUUsSUFBSSxDQUFDLFVBQVUsR0FBcUIsRUFBRSxDQUFDO3dCQUN2RSxJQUFJLENBQUMsVUFBVSxtQ0FBTyxJQUFJLENBQUMsVUFBVSxHQUFLLEdBQUcsQ0FBQyxDQUFDO3dCQUMvQyxPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDdkIsQ0FBQyxFQUFFLEdBQUcsRUFBRTt3QkFDTixPQUFPLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDeEIsQ0FBQyxDQUFDLENBQUM7aUJBQ0o7YUFDRjtpQkFBTTtnQkFDTCxPQUFPLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUN2QjtRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUdEOztPQUVHO0lBQ0gsZ0JBQWdCLENBQUMsRUFBVSxFQUFFLElBQVk7UUFDdkMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQzdCLE1BQU0sSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksSUFBSSxFQUFFLEVBQUUsQ0FBQztZQUN4RCxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDLElBQUksRUFDaEUsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFO2dCQUNmLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDO2dCQUMvQixPQUFPLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2dCQUNsQyx1RUFBdUU7Z0JBQ3ZFLDhDQUE4QztnQkFDOUMsa0ZBQWtGO2dCQUNsRixvQ0FBb0M7Z0JBQ3BDLHVDQUF1QztnQkFDdkMsTUFBTTtZQUNSLENBQUMsRUFBRSxHQUFHLEVBQUU7Z0JBQ04sT0FBTyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDeEIsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFHRDs7Ozs7T0FLRztJQUNILGNBQWMsQ0FBQyxLQUFhLElBQUksRUFBRSxJQUFZLEVBQUUsSUFBcUI7UUFDbkUsSUFBSSxPQUFPLENBQUM7UUFDWixJQUFJLENBQUMsRUFBRSxFQUFFO1lBQ1AsTUFBTSxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsSUFBSSxJQUFJLEVBQUUsRUFBRSxDQUFDO1lBQ3hELElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDO2dCQUFFLElBQUksR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMzSCxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQ3hFLEdBQUcsQ0FBQyxDQUFDLEdBQVEsRUFBRSxFQUFFO2dCQUNmLElBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQztnQkFDcEIsTUFBTSxHQUFHLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQVMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQVMsR0FBRyxDQUFDO2dCQUN0RCxJQUFJLFFBQVEsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEVBQUU7b0JBQ3ZCLFVBQVUsbUNBQU8sR0FBRyxDQUFDLFFBQVEsR0FBSyxFQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQztpQkFDakQ7Z0JBQ0QsT0FBTyxVQUFVLENBQUM7WUFDcEIsQ0FBQyxDQUFDLENBQ0gsQ0FBQztTQUNIO2FBQU07WUFDTCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO1lBQzFELE1BQU0sSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2xELElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDO2dCQUFFLElBQUksR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMzSCxJQUFJLG1DQUNDLElBQUksR0FBSztnQkFDVixJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhO2dCQUMvQixJQUFJLEVBQUUsSUFBSTtnQkFDVixVQUFVLEVBQUUsUUFBUTtnQkFDcEIsSUFBSSxFQUFFLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVO2FBQ2xFLENBQ0YsQ0FBQztZQUNGLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDLElBQUksQ0FDdkUsR0FBRyxDQUFDLENBQUMsR0FBUSxFQUFFLEVBQUU7Z0JBQ2YsSUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDO2dCQUNwQixNQUFNLEdBQUcsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBUyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBUyxHQUFHLENBQUM7Z0JBQ3RELElBQUksUUFBUSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsRUFBRTtvQkFDdkIsVUFBVSxtQ0FBTyxHQUFHLENBQUMsUUFBUSxHQUFLLEVBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDO2lCQUNqRDtnQkFDRCxPQUFPLFVBQVUsQ0FBQztZQUNwQixDQUFDLENBQUMsQ0FDSCxDQUFDO1NBQ0g7UUFDRCxPQUFPLE9BQU8sQ0FBQztJQUNqQixDQUFDO0lBR0Q7Ozs7O09BS0c7SUFDSCxnQkFBZ0IsQ0FBQyxFQUFtQixFQUFFLEdBQVk7UUFDaEQsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0lBQ3ZILENBQUM7SUFHRDs7Ozs7T0FLRztJQUNILGtCQUFrQjtRQUNoQixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDckcsQ0FBQztJQUdEOzs7OztPQUtHO0lBQ0gsWUFBWSxDQUFDLEVBQW1CLEVBQUUsTUFBVyxFQUFFLFdBQWtDO1FBQy9FLE1BQU0sSUFBSSxHQUFHLGlCQUFpQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFBQyxFQUFFLEVBQUUsRUFBRSxFQUFDLENBQUMsQ0FBQztRQUV4RSxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNqRSxDQUFDOzs7NENBNWVFLE1BQU0sU0FBQyxLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtmb3JrSm9pbiwgT2JzZXJ2YWJsZSwgb2Z9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtQb3BCYXNlU2VydmljZX0gZnJvbSAnLi4vLi4vLi4vc2VydmljZXMvcG9wLWJhc2Uuc2VydmljZSc7XG5pbXBvcnQge0luamVjdH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge1xuICBDb3JlQ29uZmlnLFxuICBEaWN0aW9uYXJ5LCBFbnRpdHksIEVudGl0eU1vZGVsSW50ZXJmYWNlLFxuICBFbnRpdHlQYXJhbXNJbnRlcmZhY2UsIEVudGl0eVByZWZlcmVuY2UsIFBvcEJ1c2luZXNzLCBQb3BGaWx0ZXIsIFBvcFBpcGUsXG4gIFF1ZXJ5UGFyYW1zSW50ZXJmYWNlLCBSZXNvdXJjZUNvbmZpZyxcbiAgU2VydmljZUluamVjdG9yLCBTZXJ2aWNlUm91dGVzSW50ZXJmYWNlXG59IGZyb20gJy4uLy4uLy4uL3BvcC1jb21tb24ubW9kZWwnO1xuaW1wb3J0IHtlbnZpcm9ubWVudH0gZnJvbSAnLi4vLi4vLi4vLi4vZW52aXJvbm1lbnRzL2Vudmlyb25tZW50JztcbmltcG9ydCB7Um91dGVyfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xuaW1wb3J0IHtQb3BMb2dTZXJ2aWNlfSBmcm9tICcuLi8uLi8uLi9zZXJ2aWNlcy9wb3AtbG9nLnNlcnZpY2UnO1xuaW1wb3J0IHtcbiAgQXJyYXlHcm91cEJ5LFxuICBJbnRlcnBvbGF0ZVN0cmluZywgSXNBcnJheSwgSXNEZWZpbmVkLCBJc0NhbGxhYmxlRnVuY3Rpb24sXG4gIElzT2JqZWN0LCBJc1N0cmluZyxcbiAgU3BhY2VUb0h5cGhlbkxvd2VyLCBTdHJpbmdSZXBsYWNlQWxsLCBUaXRsZUNhc2UsIERlZXBNZXJnZSwgSnNvbkNvcHksIERlZXBDb3B5LFxufSBmcm9tICcuLi8uLi8uLi9wb3AtY29tbW9uLXV0aWxpdHknO1xuaW1wb3J0IHtQb3BEaXNwbGF5U2VydmljZX0gZnJvbSAnLi4vLi4vLi4vc2VydmljZXMvcG9wLWRpc3BsYXkuc2VydmljZSc7XG5pbXBvcnQge1BvcFJlcXVlc3RTZXJ2aWNlfSBmcm9tICcuLi8uLi8uLi9zZXJ2aWNlcy9wb3AtcmVxdWVzdC5zZXJ2aWNlJztcbmltcG9ydCB7UG9wRW50aXR5VXRpbEZpZWxkU2VydmljZX0gZnJvbSAnLi9wb3AtZW50aXR5LXV0aWwtZmllbGQuc2VydmljZSc7XG5pbXBvcnQge1BvcFJlc291cmNlU2VydmljZX0gZnJvbSAnLi4vLi4vLi4vc2VydmljZXMvcG9wLXJlc291cmNlLnNlcnZpY2UnO1xuaW1wb3J0IHttYXB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7SW50ZXJwb2xhdGVFbnRpdHlSb3V0ZX0gZnJvbSAnLi4vcG9wLWVudGl0eS11dGlsaXR5JztcbmltcG9ydCB7UG9wQ2FjaGVTZXJ2aWNlfSBmcm9tICcuLi8uLi8uLi9zZXJ2aWNlcy9wb3AtY2FjaGUuc2VydmljZSc7XG5cblxuZXhwb3J0IGNsYXNzIFBvcEVudGl0eVJlcG9TZXJ2aWNlIGltcGxlbWVudHMgUG9wRW50aXR5U2VydmljZUludGVyZmFjZSB7XG4gIHByaXZhdGUgbmFtZSA9ICdQb3BFbnRpdHlSZXBvU2VydmljZSc7XG4gIHByaXZhdGUgaWQ6IHN0cmluZztcbiAgcHJvdGVjdGVkIHBhcmFtczogRW50aXR5UGFyYW1zSW50ZXJmYWNlO1xuICBwcml2YXRlIGFjdGl2YXRlZCA9IGZhbHNlO1xuICBwcm90ZWN0ZWQgYXBpVmVyc2lvbiA9IDE7XG5cblxuICBwdWJsaWMgbW9kZWw6IEVudGl0eU1vZGVsSW50ZXJmYWNlO1xuXG4gIHByb3RlY3RlZCBzcnY6IHtcbiAgICBiYXNlOiBQb3BCYXNlU2VydmljZSxcbiAgICBjYWNoZTogUG9wQ2FjaGVTZXJ2aWNlLFxuICAgIGRpc3BsYXk6IFBvcERpc3BsYXlTZXJ2aWNlLFxuICAgIGZpZWxkOiBQb3BFbnRpdHlVdGlsRmllbGRTZXJ2aWNlLFxuICAgIGxvZzogUG9wTG9nU2VydmljZSxcbiAgICByZXF1ZXN0OiBQb3BSZXF1ZXN0U2VydmljZSxcbiAgICByZXNvdXJjZTogUG9wUmVzb3VyY2VTZXJ2aWNlLFxuICAgIHJvdXRlcjogUm91dGVyLFxuICB9O1xuXG4gIHByb3RlY3RlZCByb3V0ZXM6IFNlcnZpY2VSb3V0ZXNJbnRlcmZhY2U7XG5cblxuICBwcm90ZWN0ZWQgc2V0U2VydmljZUNvbnRhaW5lcigpIHtcblxuICAgIHRoaXMuc3J2ID0ge1xuICAgICAgYmFzZTogU2VydmljZUluamVjdG9yLmdldChQb3BCYXNlU2VydmljZSksXG4gICAgICBjYWNoZTogbmV3IFBvcENhY2hlU2VydmljZSgpLFxuICAgICAgZGlzcGxheTogU2VydmljZUluamVjdG9yLmdldChQb3BEaXNwbGF5U2VydmljZSksXG4gICAgICBmaWVsZDogU2VydmljZUluamVjdG9yLmdldChQb3BFbnRpdHlVdGlsRmllbGRTZXJ2aWNlKSxcbiAgICAgIGxvZzogU2VydmljZUluamVjdG9yLmdldChQb3BMb2dTZXJ2aWNlKSxcbiAgICAgIHJlcXVlc3Q6IFNlcnZpY2VJbmplY3Rvci5nZXQoUG9wUmVxdWVzdFNlcnZpY2UpLFxuICAgICAgcmVzb3VyY2U6IFNlcnZpY2VJbmplY3Rvci5nZXQoUG9wUmVzb3VyY2VTZXJ2aWNlKSxcbiAgICAgIHJvdXRlcjogU2VydmljZUluamVjdG9yLmdldChSb3V0ZXIpLFxuICAgIH07XG4gIH1cblxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIEBJbmplY3QoJ2VudicpIHByaXZhdGUgcmVhZG9ubHkgZW52P1xuICApIHtcbiAgICBpZiAoIXRoaXMuZW52KSB0aGlzLmVudiA9IDxhbnk+ZW52aXJvbm1lbnQ7XG4gICAgdGhpcy5zZXRTZXJ2aWNlQ29udGFpbmVyKCk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBQYXNzIGluIGluIHRoZSBFbnRpdHlQYXJhbXMgdG8gdGllIHRoaXMgdG8gYSBzcGVjaWZpYyB0eXBlIG9mIGVudGl0eVxuICAgKiAoTW92ZWQgb3V0IG9mIGNvbnN0cnVjdG9yIGRpZSB0byBidWlsZCBpc3N1ZXMpXG4gICAqIEBwYXJhbSBlbnRpdHlQYXJhbXNcbiAgICovXG4gIHJlZ2lzdGVyKGVudGl0eVBhcmFtczogRW50aXR5UGFyYW1zSW50ZXJmYWNlKSB7XG4gICAgaWYgKGVudGl0eVBhcmFtcyAmJiBlbnRpdHlQYXJhbXMuaW50ZXJuYWxfbmFtZSkge1xuICAgICAgdGhpcy5pZCA9IGVudGl0eVBhcmFtcy5pbnRlcm5hbF9uYW1lO1xuICAgICAgdGhpcy5wYXJhbXMgPSBlbnRpdHlQYXJhbXM7XG4gICAgICB0aGlzLmFjdGl2YXRlZCA9IHRydWU7XG4gICAgICB0aGlzLnNydi5sb2cuaW5pdCh0aGlzLm5hbWUsIGBjcmVhdGVkOiR7dGhpcy5pZH1gKTtcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBQYXNzIGluIGEgcm91dGUgY29uZmlnIGZvciB0aGlzIGVudGl0eVxuICAgKiBAcGFyYW0gcm91dGVzXG4gICAqL1xuICBzZXRSb3V0ZXMocm91dGVzOiBTZXJ2aWNlUm91dGVzSW50ZXJmYWNlKSB7XG4gICAgdGhpcy5yb3V0ZXMgPSByb3V0ZXM7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBBIGh0dHAgY2FsbCB0byBhcmNoaXZlIGEgc2luZ2xlIGVudGl0eVxuICAgKiBAcGFyYW0gaWRcbiAgICogQHBhcmFtIGFyY2hpdmVcbiAgICovXG4gIGFyY2hpdmVFbnRpdHkoaWQ6IG51bWJlciB8IHN0cmluZywgYXJjaGl2ZTogYm9vbGVhbik6IE9ic2VydmFibGU8YW55PiB7XG4gICAgdGhpcy5zcnYuY2FjaGUuY2xlYXJBbGwoKTtcbiAgICBsZXQgcGF0aCA9IEludGVycG9sYXRlRW50aXR5Um91dGUodGhpcy5yb3V0ZXMuYXJjaGl2ZS5lbnRpdHkucGF0aCwge2lkOiBpZH0pO1xuICAgIGxldCBib2R5ID0ge307XG4gICAgaWYgKGFyY2hpdmUpIHtcbiAgICAgIGlmIChJc09iamVjdCh0aGlzLnJvdXRlcy5hcmNoaXZlLmVudGl0eS5wYXJhbXMsIHRydWUpKSBib2R5ID0gRGVlcE1lcmdlKEpzb25Db3B5KGJvZHkpLCB0aGlzLnJvdXRlcy5hcmNoaXZlLmVudGl0eS5wYXJhbXMpO1xuICAgICAgYm9keSA9IHsuLi5ib2R5LCAuLi57YnVzaW5lc3NfaWQ6IFBvcEJ1c2luZXNzLmlkLCBhcmNoaXZlZDogLTF9fTtcbiAgICAgIHJldHVybiB0aGlzLnNydi5yZXF1ZXN0LmRvRGVsZXRlKHBhdGgsIGJvZHksIHRoaXMuYXBpVmVyc2lvbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhdGggPSBJbnRlcnBvbGF0ZUVudGl0eVJvdXRlKHRoaXMucm91dGVzLnJlc3RvcmUuZW50aXR5LnBhdGgsIHtpZDogaWR9KTtcbiAgICAgIGlmIChJc09iamVjdCh0aGlzLnJvdXRlcy5yZXN0b3JlLmVudGl0eS5wYXJhbXMsIHRydWUpKSBib2R5ID0gRGVlcE1lcmdlKEpzb25Db3B5KGJvZHkpLCB0aGlzLnJvdXRlcy5yZXN0b3JlLmVudGl0eS5wYXJhbXMpO1xuICAgICAgYm9keSA9IHsuLi5ib2R5LCAuLi57YnVzaW5lc3NfaWQ6IFBvcEJ1c2luZXNzLmlkLCBhcmNoaXZlZDogLTF9fTtcbiAgICAgIHJldHVybiB0aGlzLnNydi5yZXF1ZXN0LmRvUG9zdChwYXRoLCBib2R5LCB0aGlzLmFwaVZlcnNpb24pO1xuICAgIH1cblxuICB9XG5cblxuICAvKipcbiAgICogQSBodHRwIGNhbGwgdG8gYXJjaGl2ZSAgbXVsdGlwbGUgZW50aXRpZXMgdGhhdCBwYXNzZXMgYSAge3h4OiB7YXJjaGl2ZTogMX0sIHh4OiB7YXJjaGl2ZTogMX0sIH0gc3RydWN0dXJlXG4gICAqIEBwYXJhbSBpZHMgUHJpbWFyeSBLZXlzIG9mIHRoZSBlbnRpdGllcyAuWyAxIG9yIDEsMiwzLDQsNSBdXG4gICAqIEBwYXJhbSBhcmNoaXZlXG4gICAqL1xuICBhcmNoaXZlRW50aXRpZXMoaWRzOiBzdHJpbmcgfCBudW1iZXIsIGFyY2hpdmU6IGJvb2xlYW4pOiBPYnNlcnZhYmxlPGFueT4ge1xuICAgIHRoaXMuc3J2LmNhY2hlLmNsZWFyQWxsKCk7XG4gICAgY29uc3QgcmVxdWVzdHMgPSBbXTtcbiAgICBpZiAoYXJjaGl2ZSkge1xuICAgICAgU3RyaW5nKGlkcykuc3BsaXQoJywnKS5tYXAoKGlkKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhdGggPSBJbnRlcnBvbGF0ZUVudGl0eVJvdXRlKHRoaXMucm91dGVzLmFyY2hpdmUuZW50aXR5LnBhdGgsIHtpZDogaWR9KTtcbiAgICAgICAgcmVxdWVzdHMucHVzaCh0aGlzLnNydi5yZXF1ZXN0LmRvRGVsZXRlKHBhdGgsIG51bGwsIHRoaXMuYXBpVmVyc2lvbikpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIFN0cmluZyhpZHMpLnNwbGl0KCcsJykubWFwKChpZCkgPT4ge1xuICAgICAgICBsZXQgcGF0aCA9IEludGVycG9sYXRlU3RyaW5nKHRoaXMucm91dGVzLnJlc3RvcmUuZW50aXR5LnBhdGgsIHtpZDogaWR9KTtcbiAgICAgICAgcGF0aCA9IFN0cmluZ1JlcGxhY2VBbGwocGF0aCwgJ1xcXFw/JywgJycpO1xuICAgICAgICBwYXRoID0gU3RyaW5nUmVwbGFjZUFsbChwYXRoLCAnXFxcXC9cXFxcLycsICdcXFxcLycpO1xuICAgICAgICByZXF1ZXN0cy5wdXNoKHRoaXMuc3J2LnJlcXVlc3QuZG9Qb3N0KHBhdGgsIHthcmNoaXZlZDogLTF9LCB0aGlzLmFwaVZlcnNpb24pKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gZm9ya0pvaW4ocmVxdWVzdHMpO1xuICB9XG5cblxuICAvKipcbiAgICogIEEgbWV0aG9kIHRoYXQgcmV0dXJucyB0aGUgY29uZmlndXJlZCBhcHBcbiAgICovXG4gIGdldEFwcE5hbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5wYXJhbXMuYXBwO1xuICB9XG5cblxuICAvKipcbiAgICogQSBIdHRwIGNhbGwgdGhhdCBnZXRzIHRoZSBlbnRpdHkgY29uZmlnc1xuICAgKiBAcGFyYW0gaWQgUHJpbWFyeSBLZXkgb2YgdGhlIGVudGl0eVxuICAgKi9cbiAgZ2V0Q29uZmlnKCk6IE9ic2VydmFibGU8YW55PiB7XG4gICAgY29uc3QgcGF0aCA9IGAke3RoaXMucm91dGVzLmdldC5jb25maWcucGF0aH0/ZW50aXR5X2lkPSR7dGhpcy5wYXJhbXMuaWR9YDtcbiAgICBpZiAodGhpcy5wYXJhbXMuaWQpIHtcbiAgICAgIGNvbnN0IGJvZHkgPSBJc09iamVjdCh0aGlzLnJvdXRlcy5nZXQuY29uZmlnLnBhcmFtcywgdHJ1ZSkgPyB0aGlzLnJvdXRlcy5nZXQuY29uZmlnLnBhcmFtcyA6IHt9O1xuICAgICAgcmV0dXJuIHRoaXMuc3J2LnJlcXVlc3QuZG9HZXQocGF0aCwgYm9keSwgdGhpcy5hcGlWZXJzaW9uKS5waXBlKFxuICAgICAgICBtYXAoKHJlczogYW55KSA9PiB7XG4gICAgICAgICAgcmVzID0gcmVzLmRhdGEgPyByZXMuZGF0YSA6IHJlcztcbiAgICAgICAgICByZXMgPSBBcnJheUdyb3VwQnkocmVzLCAndHlwZScpO1xuICAgICAgICAgIGlmIChJc09iamVjdChyZXMsIHRydWUpKSB7XG4gICAgICAgICAgICBPYmplY3Qua2V5cyhyZXMpLm1hcCgodHlwZTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgIGlmIChJc0FycmF5KHJlc1t0eXBlXSwgdHJ1ZSkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0bXAgPSB7fTtcbiAgICAgICAgICAgICAgICByZXNbdHlwZV0ubWFwKChzZXR0aW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgICB0bXBbc2V0dGluZy5uYW1lXSA9IHNldHRpbmcuY29uZmlnO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJlc1t0eXBlXSA9IHRtcDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlcyA9IHt9O1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICB9KVxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG9mKHt9KTtcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiAgQSBodHRwIGNhbGwgdGhhdCBnZXRzIGEgbGlzdCBvZiBlbnRpdGllc1xuICAgKiBAcGFyYW0gcXVlcnlQYXJhbXMgJz9hcmNoaXZlZD0xJywgJz9hcmNoaXZlZD0wJ1xuICAgKi9cbiAgZ2V0RW50aXRpZXMoYm9keTogT2JqZWN0ID0ge30sIHF1ZXJ5UGFyYW1zPzogUXVlcnlQYXJhbXNJbnRlcmZhY2UpOiBQcm9taXNlPEVudGl0eVtdPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPEVudGl0eVtdPigocmVzb2x2ZSkgPT4ge1xuICAgICAgbGV0IGRhdGEgPSA8RW50aXR5W10+W107XG4gICAgICBpZiAoIShJc09iamVjdChxdWVyeVBhcmFtcykpKSBxdWVyeVBhcmFtcyA9IHthcmNoaXZlZDogMH07XG4gICAgICBpZiAoIShJc09iamVjdChib2R5KSkpIGJvZHkgPSB7YXJjaGl2ZWQ6IElzRGVmaW5lZChxdWVyeVBhcmFtcy5hcmNoaXZlZCkgPyBxdWVyeVBhcmFtcy5hcmNoaXZlZCA6IDB9O1xuXG4gICAgICBpZiAodGhpcy5tb2RlbC50YWJsZS5maWx0ZXIgJiYgdGhpcy5tb2RlbC50YWJsZS5maWx0ZXIuYWN0aXZlICYmIElzT2JqZWN0KHRoaXMubW9kZWwudGFibGUuZmlsdGVyLnF1ZXJ5LCB0cnVlKSkge1xuICAgICAgICBpZiAoIXF1ZXJ5UGFyYW1zLmJ5cGFzc0ZpbHRlcnMpIHtcbiAgICAgICAgICBPYmplY3Qua2V5cyh0aGlzLm1vZGVsLnRhYmxlLmZpbHRlci5xdWVyeSkubWFwKChmaWx0ZXJOYW1lOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIGlmIChmaWx0ZXJOYW1lIGluIFBvcEZpbHRlciAmJiBJc0FycmF5KFBvcEZpbHRlcltmaWx0ZXJOYW1lXSwgdHJ1ZSkpIGJvZHlbdGhpcy5tb2RlbC50YWJsZS5maWx0ZXIucXVlcnlbZmlsdGVyTmFtZV1dID0gUG9wRmlsdGVyW2ZpbHRlck5hbWVdO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIC8vIHF1ZXJ5UGFyYW1zLmxpbWl0ID0gMTAwO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjb25zdCBwYXRoID0gYCR7dGhpcy5yb3V0ZXMuZ2V0LmVudGl0aWVzLnBhdGh9YDtcbiAgICAgIGlmIChJc09iamVjdCh0aGlzLnJvdXRlcy5nZXQuZW50aXRpZXMucGFyYW1zLCB0cnVlKSAmJiAhcXVlcnlQYXJhbXMuYnlwYXNzUGFyYW1zKSB7XG4gICAgICAgIGJvZHkgPSBEZWVwTWVyZ2UoSnNvbkNvcHkoYm9keSksIHRoaXMucm91dGVzLmdldC5lbnRpdGllcy5wYXJhbXMpO1xuICAgICAgfVxuICAgICAgbGV0IHBhZ2UgPSAxO1xuICAgICAgdGhpcy5zcnYucmVxdWVzdC5kb0dldChgJHtwYXRofWAsIGJvZHksIHRoaXMuYXBpVmVyc2lvbikuc3Vic2NyaWJlKFxuICAgICAgICAocmVzOiBhbnkpID0+IHtcbiAgICAgICAgICBkYXRhID0gPEVudGl0eVtdPnJlcy5kYXRhO1xuICAgICAgICAgIGlmIChJc09iamVjdChyZXMubWV0YSwgdHJ1ZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlcXVlc3RzID0gW107XG4gICAgICAgICAgICBjb25zdCBsYXN0UGFnZSA9IHJlcy5tZXRhLmxhc3RfcGFnZTtcbiAgICAgICAgICAgIHdoaWxlIChwYWdlIDwgbGFzdFBhZ2UpIHtcbiAgICAgICAgICAgICAgcGFnZSsrO1xuICAgICAgICAgICAgICByZXF1ZXN0cy5wdXNoKHRoaXMuc3J2LnJlcXVlc3QuZG9HZXQoYCR7cGF0aH0/cGFnZT0ke3BhZ2V9YCwgYm9keSwgdGhpcy5hcGlWZXJzaW9uKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocmVxdWVzdHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIGZvcmtKb2luKHJlcXVlc3RzKS5zdWJzY3JpYmUoKHBhZ2VzKSA9PiB7XG4gICAgICAgICAgICAgICAgcGFnZXMubWFwKChuZXh0UGFnZTogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICBkYXRhLnB1c2goLi4ubmV4dFBhZ2UuZGF0YSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoZGF0YSk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoZGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlKGRhdGEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBBIG1ldGhvZCB0aGF0IGNsZWFycyBhbnkgY2FjaGUgZm9yIHRoaXMgZW50aXR5IHR5cGVcbiAgICovXG4gIGNsZWFyQWxsQ2FjaGUoY2FsbGVyID0gJycpOiB2b2lkIHtcbiAgICB0aGlzLnNydi5jYWNoZS5jbGVhckFsbCgpO1xuICB9XG5cblxuICAvKipcbiAgICogQSBtZXRob2QgdGhhdCBjbGVhcnMgYW55IGNhY2hlIGZvciB0aGlzIGVudGl0eSB0eXBlXG4gICAqL1xuICBjbGVhckNhY2hlKGNhY2hlVHlwZTogc3RyaW5nLCBjYWNoZUtleT86IHN0cmluZywgY2FsbGVyID0gJycpOiB2b2lkIHtcbiAgICB0aGlzLnNydi5jYWNoZS5jbGVhcihjYWNoZVR5cGUsIGNhY2hlS2V5KTtcbiAgfVxuXG5cbiAgc2V0Q2FjaGUoY2FjaGVUeXBlOiBzdHJpbmcsIGNhY2hlS2V5OiBzdHJpbmcsIGRhdGE6IGFueSwgbWludXRlcyA9IDEpIHtcbiAgICBpZiAoSXNTdHJpbmcoY2FjaGVUeXBlLCB0cnVlKSAmJiBJc1N0cmluZyhjYWNoZUtleSkgJiYgSXNEZWZpbmVkKGRhdGEpKSB7XG4gICAgICBpZiAobWludXRlcyA+IDYwKSBtaW51dGVzID0gNjA7XG4gICAgICB0aGlzLnNydi5jYWNoZS5zZXQoY2FjaGVUeXBlLCBjYWNoZUtleSwgZGF0YSwgKG1pbnV0ZXMgKiA2MCAqIDEwMDApKTtcbiAgICB9XG4gIH1cblxuXG4gIGdldENhY2hlKGNhY2hlVHlwZTogc3RyaW5nLCBjYWNoZUtleTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPEVudGl0eVtdPigocmVzb2x2ZSkgPT4ge1xuICAgICAgaWYgKElzU3RyaW5nKGNhY2hlVHlwZSwgdHJ1ZSkgJiYgSXNTdHJpbmcoY2FjaGVLZXkpKSB7XG4gICAgICAgIHRoaXMuc3J2LmNhY2hlLmdldChjYWNoZVR5cGUsIGNhY2hlS2V5KS5zdWJzY3JpYmUoKGNhY2hlRGF0YSkgPT4ge1xuICAgICAgICAgIGlmIChJc0RlZmluZWQoY2FjaGVEYXRhKSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoY2FjaGVEYXRhKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzb2x2ZShudWxsKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzb2x2ZShudWxsKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqXG4gICAqIEBwYXJhbSBpZCBQcmltYXJ5IEtleSBvZiB0aGUgZW50aXR5XG4gICAqIEBwYXJhbSBwYXJhbXMgJz9tZXRhZGF0YT0xJywgJz9tZXRhZGF0YT0wJywgJz9tZXRhZGF0YT0xJmZpbHRlcj1pZCxuYW1lJ1xuICAgKiBAcmV0dXJuIE9ic2VydmFibGVcbiAgICovXG4gIGdldEVudGl0eShpZDogbnVtYmVyIHwgc3RyaW5nLCBxdWVyeVBhcmFtcz86IFF1ZXJ5UGFyYW1zSW50ZXJmYWNlKTogT2JzZXJ2YWJsZTxhbnk+IHtcbiAgICBpZiAoIXF1ZXJ5UGFyYW1zIHx8IHR5cGVvZiAocXVlcnlQYXJhbXMpICE9PSAnb2JqZWN0JykgcXVlcnlQYXJhbXMgPSB7fTtcbiAgICBsZXQgYm9keSA9IHthcmNoaXZlZDogSXNEZWZpbmVkKHF1ZXJ5UGFyYW1zLmFyY2hpdmVkKSA/IHF1ZXJ5UGFyYW1zLmFyY2hpdmVkIDogLTF9O1xuICAgIGlmICgraWQpIHtcbiAgICAgIGNvbnN0IHBhdGggPSBgJHtJbnRlcnBvbGF0ZVN0cmluZyh0aGlzLnJvdXRlcy5nZXQuZW50aXR5LnBhdGgsIHtpZDogaWR9KX1gO1xuICAgICAgaWYgKElzT2JqZWN0KHRoaXMucm91dGVzLmdldC5lbnRpdHkucGFyYW1zLCB0cnVlKSAmJiAhcXVlcnlQYXJhbXMuYnlwYXNzUGFyYW1zKSBib2R5ID0gRGVlcE1lcmdlKEpzb25Db3B5KGJvZHkpLCB0aGlzLnJvdXRlcy5nZXQuZW50aXR5LnBhcmFtcyk7XG4gICAgICB0aGlzLnNydi5sb2cuaW5mbyh0aGlzLm5hbWUsIHBhdGgsIGJvZHkpO1xuICAgICAgY29uc3QgcmVxdWVzdCA9IHRoaXMuc3J2LnJlcXVlc3QuZG9HZXQocGF0aCwgYm9keSwgdGhpcy5hcGlWZXJzaW9uKTtcbiAgICAgIHJldHVybiBxdWVyeVBhcmFtcy5ieXBhc3NDYWNoZSA/IHJlcXVlc3QgOiB0aGlzLnNydi5jYWNoZS5nZXQoJ2VudGl0eScsIFN0cmluZyhpZCksIHJlcXVlc3QpO1xuICAgIH1cbiAgICByZXR1cm4gb2YodW5kZWZpbmVkKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEEgSHR0cCBjYWxsIHRoYXQgZ2V0cyB0aGUgZW50aXR5IGhpc3RvcnlcbiAgICogQHBhcmFtIGlkIFByaW1hcnkgS2V5IG9mIHRoZSBlbnRpdHlcbiAgICovXG4gIGdldEhpc3RvcnkoaWQ6IG51bWJlcik6IE9ic2VydmFibGU8YW55PiB7XG4gICAgcmV0dXJuIG9mKFtdKTtcbiAgICAvLyBjb25zdCBwYXRoID0gSW50ZXJwb2xhdGVTdHJpbmcodGhpcy5yb3V0ZXMuZ2V0Lmhpc3RvcnksIHsgaWQ6IGlkIH0pO1xuICAgIC8vIHJldHVybiB0aGlzLnNydi5yZXF1ZXN0LmRvR2V0KHBhdGgsIHt9LCB0aGlzLmFwaVZlcnNpb24pO1xuICB9XG5cblxuICAvKipcbiAgICogQSBIdHRwIGNhbGwgdGhhdCBnZXRzIHRoZSBlbnRpdHkgbWV0YWRhdGFcbiAgICogQHBhcmFtIGlkIFByaW1hcnkgS2V5IG9mIHRoZSBlbnRpdHlcbiAgICovXG4gIGdldFVpUmVzb3VyY2UoY29yZTogQ29yZUNvbmZpZyk6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jIChyZXNvbHZlKSA9PiB7XG4gICAgICBsZXQgdWkgPSB7fTtcbiAgICAgIGlmIChJc09iamVjdCh0aGlzLm1vZGVsLnJlc291cmNlLCB0cnVlKSkge1xuICAgICAgICBjb25zdCBzdWNjZXNzID0gYXdhaXQgdGhpcy5zcnYucmVzb3VyY2Uuc2V0Q29sbGVjdGlvbih0aGlzLm1vZGVsLnJlc291cmNlLCBjb3JlKTtcbiAgICAgICAgaWYgKHN1Y2Nlc3MpIHtcbiAgICAgICAgICB1aSA9IHRoaXMuc3J2LnJlc291cmNlLmdldENvbGxlY3Rpb24odGhpcy5tb2RlbC5yZXNvdXJjZSk7XG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUodWkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXNvbHZlKHVpKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEEgSHR0cCBjYWxsIHRoYXQgZ2V0cyB0aGUgZW50aXR5IG1ldGFkYXRhXG4gICAqIEBwYXJhbSBpZCBQcmltYXJ5IEtleSBvZiB0aGUgZW50aXR5XG4gICAqL1xuICByZWxvYWRSZXNvdXJjZShjb3JlOiBDb3JlQ29uZmlnLCByZXNvdXJjZU5hbWU6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShhc3luYyAocmVzb2x2ZSkgPT4ge1xuICAgICAgaWYgKHJlc291cmNlTmFtZSAmJiBJc09iamVjdCh0aGlzLm1vZGVsLnJlc291cmNlLCBbcmVzb3VyY2VOYW1lXSkpIHtcbiAgICAgICAgaWYgKCFJc09iamVjdChjb3JlLnJlc291cmNlKSkgY29yZS5yZXNvdXJjZSA9IHt9O1xuICAgICAgICBjb3JlLnJlc291cmNlW3Jlc291cmNlTmFtZV0gPSBhd2FpdCB0aGlzLnNydi5yZXNvdXJjZS5yZWxvYWRSZXNvdXJjZShjb3JlLCB0aGlzLm1vZGVsLnJlc291cmNlW3Jlc291cmNlTmFtZV0pO1xuICAgICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiByZXNvbHZlKGZhbHNlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEEgSHR0cCBjYWxsIHRoYXQgZ2V0cyB0aGUgZW50aXR5IG1ldGFkYXRhXG4gICAqIEBwYXJhbSBpZCBQcmltYXJ5IEtleSBvZiB0aGUgZW50aXR5XG4gICAqL1xuICBpbmplY3RSZXNvdXJjZShjb3JlOiBDb3JlQ29uZmlnLCByZXNvdXJjZTogUmVzb3VyY2VDb25maWcsIHJlbG9hZCA9IGZhbHNlKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jIChyZXNvbHZlKSA9PiB7XG4gICAgICBpZiAoSXNPYmplY3QocmVzb3VyY2UsIFsnbmFtZSddKSkge1xuICAgICAgICBpZiAoIShJc09iamVjdCh0aGlzLm1vZGVsLnJlc291cmNlW3Jlc291cmNlLm5hbWVdKSkpIHtcbiAgICAgICAgICBpZiAoIUlzT2JqZWN0KHRoaXMubW9kZWwucmVzb3VyY2UpKSB0aGlzLm1vZGVsLnJlc291cmNlID0ge307XG4gICAgICAgICAgaWYgKCFJc09iamVjdChjb3JlLnJlc291cmNlKSkgY29yZS5yZXNvdXJjZSA9IHt9O1xuXG4gICAgICAgICAgdGhpcy5tb2RlbC5yZXNvdXJjZVtyZXNvdXJjZS5uYW1lXSA9IHsuLi5EZWVwQ29weShyZXNvdXJjZSl9O1xuICAgICAgICAgIGlmIChyZXNvdXJjZS5hcGlfcGF0aCAmJiBJc1N0cmluZyhyZXNvdXJjZS5hcGlfcGF0aCwgdHJ1ZSkpIHtcbiAgICAgICAgICAgIGNvcmUucmVzb3VyY2VbcmVzb3VyY2UubmFtZV0gPSBhd2FpdCB0aGlzLnNydi5yZXNvdXJjZS5yZWxvYWRSZXNvdXJjZShjb3JlLCByZXNvdXJjZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvcmUucmVzb3VyY2VbcmVzb3VyY2UubmFtZV0gPSByZXNvdXJjZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoSXNPYmplY3QodGhpcy5tb2RlbC5yZXNvdXJjZVtyZXNvdXJjZS5uYW1lXSwgdHJ1ZSkgJiYgcmVzb3VyY2UuYXBpX3BhdGggJiYgcmVsb2FkKSB7XG4gICAgICAgICAgYXdhaXQgdGhpcy5yZWxvYWRSZXNvdXJjZShjb3JlLCByZXNvdXJjZS5uYW1lKTtcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHJlc29sdmUoZmFsc2UpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cblxuICAvKipcbiAgICogQSBtZXRob2QgdGhhdCBnZXRzIHRoZSBlbnRpdHkgc2luZ3VsYXIgbmFtZSBmb3IgZW50aXR5XG4gICAqIEBwYXJhbSBmaWVsZFxuICAgKi9cbiAgZ2V0SW50ZXJuYWxOYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMucGFyYW1zLmludGVybmFsX25hbWU7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGFsaWFzIGRpc3BsYXkgZm9yIHRoaXMgZW50aXR5O1xuICAgKiBAcGFyYW0gYWxpYXMgJ3Npbmd1bGFyIHwgJ3BsdXJhbCc7XG4gICAqL1xuICBnZXREaXNwbGF5TmFtZShhbGlhczogc3RyaW5nID0gJ3Npbmd1bGFyJyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIFBvcFBpcGUudHJhbnNmb3JtKHRoaXMucGFyYW1zLmludGVybmFsX25hbWUsIHt0eXBlOiAnZW50aXR5JywgYXJnMTogJ2FsaWFzJywgYXJnMjogYWxpYXN9KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEEgbWV0aG9kIHRoYXQgZ2V0cyB0aGUgYmFzZSBhcGkgcGF0aCBmb3IgdGhlIGVudGl0eVxuICAgKiBAcGFyYW0gZmllbGRcbiAgICovXG4gIGdldEFwaVBhdGgoKTogc3RyaW5nIHtcblxuICAgIHJldHVybiB0aGlzLnBhcmFtcy5wYXRoO1xuICB9XG5cblxuICAvKipcbiAgICogQSBodHRwIGNhbGwgdGhhdCBnZXRzIHRoZSBwcmVmZXJlbmNlcyBvZiBhIHVzZXJcbiAgICovXG4gIGdldFByZWZlcmVuY2VzKGNvcmU6IENvcmVDb25maWcsIGNhY2hlID0gZmFsc2UpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8Ym9vbGVhbj4oKHJlc29sdmUpID0+IHtcbiAgICAgIGNvbnN0IGJ1VXNlcklkID0gdGhpcy5zcnYuYmFzZS5nZXRDdXJyZW50QnVzaW5lc3NVc2VySWQoKTtcbiAgICAgIGlmIChidVVzZXJJZCkge1xuICAgICAgICBjb25zdCBwYXRoID0gYCR7dGhpcy5yb3V0ZXMuZ2V0LnByZWZlcmVuY2UucGF0aH1gO1xuICAgICAgICBsZXQgYm9keSA9IHtwYXRoOiB0aGlzLnBhcmFtcy5pbnRlcm5hbF9uYW1lLCBidV91c2VyX2lkOiBidVVzZXJJZH07XG4gICAgICAgIGlmIChJc09iamVjdCh0aGlzLnJvdXRlcy5nZXQucHJlZmVyZW5jZS5wYXJhbXMsIHRydWUpKSBib2R5ID0gRGVlcE1lcmdlKEpzb25Db3B5KGJvZHkpLCB0aGlzLnJvdXRlcy5nZXQucHJlZmVyZW5jZS5wYXJhbXMpO1xuICAgICAgICBjb25zdCByZXF1ZXN0ID0gdGhpcy5zcnYucmVxdWVzdC5kb0dldChwYXRoLCBib2R5LCB0aGlzLmFwaVZlcnNpb24sIHRydWUpLnBpcGUoXG4gICAgICAgICAgbWFwKChyZXM6IGFueSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcHJlZmVyZW5jZXMgPSB7fTtcbiAgICAgICAgICAgIGNvbnN0IHRtcCA9IHJlcy5kYXRhID8gPEVudGl0eT5yZXMuZGF0YSA6IDxFbnRpdHk+cmVzO1xuICAgICAgICAgICAgaWYgKElzQXJyYXkodG1wLCB0cnVlKSkge1xuICAgICAgICAgICAgICB0bXAubWFwKChwcmVmZXJlbmNlKSA9PiB7XG4gICAgICAgICAgICAgICAgcHJlZmVyZW5jZXNbcHJlZmVyZW5jZS50eXBlXSA9IHsuLi5wcmVmZXJlbmNlLnNldHRpbmdzLCAuLi57aWQ6IHByZWZlcmVuY2UuaWR9fTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJlZmVyZW5jZXM7XG4gICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKGNhY2hlKSB7XG4gICAgICAgICAgdGhpcy5zcnYuY2FjaGUuZ2V0KHRoaXMucGFyYW1zLmludGVybmFsX25hbWUsICdwcmVmZXJlbmNlJywgcmVxdWVzdCwgNjAwMDAwKS5zdWJzY3JpYmUoKHJlczogYW55KSA9PiB7XG4gICAgICAgICAgICBpZiAoIUlzT2JqZWN0KGNvcmUucHJlZmVyZW5jZSkpIGNvcmUucHJlZmVyZW5jZSA9IDxFbnRpdHlQcmVmZXJlbmNlPnt9O1xuICAgICAgICAgICAgY29yZS5wcmVmZXJlbmNlID0gey4uLmNvcmUucHJlZmVyZW5jZSwgLi4ucmVzfTtcbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgICAgICAgIH0sIChlcnIpID0+IHtcbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXF1ZXN0LnN1YnNjcmliZSgocmVzOiBhbnkpID0+IHtcblxuICAgICAgICAgICAgaWYgKCFJc09iamVjdChjb3JlLnByZWZlcmVuY2UpKSBjb3JlLnByZWZlcmVuY2UgPSA8RW50aXR5UHJlZmVyZW5jZT57fTtcbiAgICAgICAgICAgIGNvcmUucHJlZmVyZW5jZSA9IHsuLi5jb3JlLnByZWZlcmVuY2UsIC4uLnJlc307XG4gICAgICAgICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiByZXNvbHZlKGZhbHNlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEEgaHR0cCBjYWxsIHRoYXQgZ2V0cyB0aGUgcHJlZmVyZW5jZXMgb2YgYSB1c2VyXG4gICAqL1xuICBkZWxldGVQcmVmZXJlbmNlKGlkOiBudW1iZXIsIHR5cGU6IHN0cmluZyk6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICBjb25zdCBwYXRoID0gYCR7dGhpcy5yb3V0ZXMuZ2V0LnByZWZlcmVuY2UucGF0aH0vJHtpZH1gO1xuICAgICAgdGhpcy5zcnYucmVxdWVzdC5kb0RlbGV0ZShwYXRoLCBudWxsLCB0aGlzLmFwaVZlcnNpb24sIHRydWUpLnBpcGUoXG4gICAgICApLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgIGNvbnN0IGRlZmF1bHRQcmVmZXJlbmNlID0gbnVsbDtcbiAgICAgICAgcmV0dXJuIHJlc29sdmUoZGVmYXVsdFByZWZlcmVuY2UpO1xuICAgICAgICAvLyB0aGlzLnNydi5jYWNoZS5jbGVhcihbIGAke3RoaXMucGFyYW1zLmludGVybmFsX25hbWV9OnByZWZlcmVuY2VgIF0pO1xuICAgICAgICAvLyB0aGlzLmdldFByZWZlcmVuY2VzKHRydWUpLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgIC8vICAgLy8gVG9Ebzo6IENoZWNrIGluc2lkZSBlbnRpdHkgbW9kZWxzIHRvIHNlZSBpZiBhIGRlZmF1bHQgdGFibGUgc2V0dGluZ3MgZXhpc3RcbiAgICAgICAgLy8gICBjb25zdCBkZWZhdWx0UHJlZmVyZW5jZSA9IG51bGw7XG4gICAgICAgIC8vICAgcmV0dXJuIHJlc29sdmUoZGVmYXVsdFByZWZlcmVuY2UpO1xuICAgICAgICAvLyB9KTtcbiAgICAgIH0sICgpID0+IHtcbiAgICAgICAgcmV0dXJuIHJlc29sdmUoZmFsc2UpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBBbiBIdHRwIGNhbGwgdG8gc2F2ZSBhIHByZWZlcmVuY2VcbiAgICogQHBhcmFtIGlkXG4gICAqIEBwYXJhbSB0eXBlXG4gICAqIEBwYXJhbSBib2R5XG4gICAqL1xuICBzYXZlUHJlZmVyZW5jZShpZDogbnVtYmVyID0gbnVsbCwgdHlwZTogc3RyaW5nLCBib2R5OiBEaWN0aW9uYXJ5PGFueT4pOiBPYnNlcnZhYmxlPGFueT4ge1xuICAgIGxldCByZXF1ZXN0O1xuICAgIGlmICgraWQpIHtcbiAgICAgIGNvbnN0IHBhdGggPSBgJHt0aGlzLnJvdXRlcy5nZXQucHJlZmVyZW5jZS5wYXRofS8ke2lkfWA7XG4gICAgICBpZiAoSXNPYmplY3QodGhpcy5yb3V0ZXMuZ2V0LnByZWZlcmVuY2UucGFyYW1zLCB0cnVlKSkgYm9keSA9IERlZXBNZXJnZShKc29uQ29weShib2R5KSwgdGhpcy5yb3V0ZXMuZ2V0LnByZWZlcmVuY2UucGFyYW1zKTtcbiAgICAgIHJlcXVlc3QgPSB0aGlzLnNydi5yZXF1ZXN0LmRvUGF0Y2gocGF0aCwgYm9keSwgdGhpcy5hcGlWZXJzaW9uLCB0cnVlKS5waXBlKFxuICAgICAgICBtYXAoKHJlczogYW55KSA9PiB7XG4gICAgICAgICAgbGV0IHByZWZlcmVuY2UgPSB7fTtcbiAgICAgICAgICBjb25zdCB0bXAgPSByZXMuZGF0YSA/IDxFbnRpdHk+cmVzLmRhdGEgOiA8RW50aXR5PnJlcztcbiAgICAgICAgICBpZiAoSXNPYmplY3QodG1wLCB0cnVlKSkge1xuICAgICAgICAgICAgcHJlZmVyZW5jZSA9IHsuLi50bXAuc2V0dGluZ3MsIC4uLntpZDogdG1wLmlkfX07XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBwcmVmZXJlbmNlO1xuICAgICAgICB9KVxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgYnVVc2VySWQgPSB0aGlzLnNydi5iYXNlLmdldEN1cnJlbnRCdXNpbmVzc1VzZXJJZCgpO1xuICAgICAgY29uc3QgcGF0aCA9IGAke3RoaXMucm91dGVzLmdldC5wcmVmZXJlbmNlLnBhdGh9YDtcbiAgICAgIGlmIChJc09iamVjdCh0aGlzLnJvdXRlcy5nZXQucHJlZmVyZW5jZS5wYXJhbXMsIHRydWUpKSBib2R5ID0gRGVlcE1lcmdlKEpzb25Db3B5KGJvZHkpLCB0aGlzLnJvdXRlcy5nZXQucHJlZmVyZW5jZS5wYXJhbXMpO1xuICAgICAgYm9keSA9IHtcbiAgICAgICAgLi4uYm9keSwgLi4ue1xuICAgICAgICAgIHBhdGg6IHRoaXMucGFyYW1zLmludGVybmFsX25hbWUsXG4gICAgICAgICAgdHlwZTogdHlwZSxcbiAgICAgICAgICBidV91c2VyX2lkOiBidVVzZXJJZCxcbiAgICAgICAgICBuYW1lOiBgJHtUaXRsZUNhc2UodGhpcy5wYXJhbXMubmFtZSl9ICR7VGl0bGVDYXNlKHR5cGUpfSBTZXR0aW5nYFxuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgcmVxdWVzdCA9IHRoaXMuc3J2LnJlcXVlc3QuZG9Qb3N0KHBhdGgsIGJvZHksIHRoaXMuYXBpVmVyc2lvbiwgdHJ1ZSkucGlwZShcbiAgICAgICAgbWFwKChyZXM6IGFueSkgPT4ge1xuICAgICAgICAgIGxldCBwcmVmZXJlbmNlID0ge307XG4gICAgICAgICAgY29uc3QgdG1wID0gcmVzLmRhdGEgPyA8RW50aXR5PnJlcy5kYXRhIDogPEVudGl0eT5yZXM7XG4gICAgICAgICAgaWYgKElzT2JqZWN0KHRtcCwgdHJ1ZSkpIHtcbiAgICAgICAgICAgIHByZWZlcmVuY2UgPSB7Li4udG1wLnNldHRpbmdzLCAuLi57aWQ6IHRtcC5pZH19O1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcHJlZmVyZW5jZTtcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiByZXF1ZXN0O1xuICB9XG5cblxuICAvKipcbiAgICogQSBtZXRob2QgdGhhdCB3aWxsIG5hdmlnYXRlIHRoZSB1c2VyIHRvIHRoZSBUYWIgVmlldyBvZiBhbiBlbnRpdHlcbiAgICogTWV0aG9kIHNob3VsZCB0YWtlIGludG8gY29uc2lkZXJhdGlvbiB0aGUgYWxpYXNlcyB0aGF0IHRoZSBlbnRpdHkgbWlnaHQgaGF2ZVxuICAgKiBAcGFyYW0gaWQgUHJpbWFyeSBLZXkgb2YgdGhlIGVudGl0eVxuICAgKiBAcGFyYW0gdGFiXG4gICAqL1xuICBuYXZpZ2F0ZVRvRW50aXR5KGlkOiBudW1iZXIgfCBzdHJpbmcsIHRhYj86IHN0cmluZyk6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIHRoaXMuc3J2LnJvdXRlci5uYXZpZ2F0ZUJ5VXJsKGAke3RoaXMuc3J2LmRpc3BsYXkuYWxpYXMoU3BhY2VUb0h5cGhlbkxvd2VyKHRoaXMucGFyYW1zLm5hbWUpKX0vJHtpZH0vJHt0YWJ9YCk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBBIG1ldGhvZCB0aGF0IHdpbGwgbmF2aWdhdGUgdGhlIHVzZXIgdG8gdGhlIExpc3QgVmlldyBvZiBhbiBlbnRpdHlcbiAgICogTWV0aG9kIHNob3VsZCB0YWtlIGludG8gY29uc2lkZXJhdGlvbiB0aGUgYWxpYXNlcyB0aGF0IHRoZSBlbnRpdHkgbWlnaHQgaGF2ZVxuICAgKiBAcGFyYW0gaWQgUHJpbWFyeSBLZXkgb2YgdGhlIGVudGl0eVxuICAgKiBAcGFyYW0gdGFiXG4gICAqL1xuICBuYXZpZ2F0ZVRvRW50aXRpZXMoKTogUHJvbWlzZTxhbnk+IHtcbiAgICByZXR1cm4gdGhpcy5zcnYucm91dGVyLm5hdmlnYXRlQnlVcmwodGhpcy5zcnYuZGlzcGxheS5hbGlhcyhTcGFjZVRvSHlwaGVuTG93ZXIodGhpcy5wYXJhbXMubmFtZSkpKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEEgbWV0aG9kIHRoYXQgdXBkYXRlIGFuIGVudGl0eSByZWxhdGlvblxuICAgKiBNZXRob2Qgc2hvdWxkIHRha2UgaW50byBjb25zaWRlcmF0aW9uIHRoZSBhbGlhc2VzIHRoYXQgdGhlIGVudGl0eSBtaWdodCBoYXZlXG4gICAqIEBwYXJhbSBpZCBQcmltYXJ5IEtleSBvZiB0aGUgZW50aXR5XG4gICAqIEBwYXJhbSB0YWJcbiAgICovXG4gIHVwZGF0ZUVudGl0eShpZDogbnVtYmVyIHwgc3RyaW5nLCBlbnRpdHk6IGFueSwgcXVlcnlQYXJhbXM/OiBRdWVyeVBhcmFtc0ludGVyZmFjZSkge1xuICAgIGNvbnN0IHBhdGggPSBJbnRlcnBvbGF0ZVN0cmluZyh0aGlzLnJvdXRlcy5wYXRjaC5lbnRpdHkucGF0aCwge2lkOiBpZH0pO1xuXG4gICAgcmV0dXJuIHRoaXMuc3J2LnJlcXVlc3QuZG9QYXRjaChwYXRoLCBlbnRpdHksIHRoaXMuYXBpVmVyc2lvbik7XG4gIH1cblxufVxuXG5cbmV4cG9ydCBpbnRlcmZhY2UgUG9wRW50aXR5U2VydmljZUludGVyZmFjZSB7XG5cbiAgLyoqXG4gICAqIEEgaHR0cCBjYWxsIHRvIGFyY2hpdmUgYSBzaW5nbGUgZW50aXR5XG4gICAqIEBwYXJhbSBpZFxuICAgKiBAcGFyYW0gYXJjaGl2ZVxuICAgKi9cbiAgYXJjaGl2ZUVudGl0eShpZDogbnVtYmVyIHwgc3RyaW5nLCBhcmNoaXZlOiBib29sZWFuKTogT2JzZXJ2YWJsZTxhbnk+O1xuXG4gIC8qKlxuICAgKiBBIGh0dHAgY2FsbCB0byBhcmNoaXZlICBtdWx0aXBsZSBlbnRpdGllcyB0aGF0IHBhc3NlcyBhICB7eHg6IHthcmNoaXZlOiAxfSwgeHg6IHthcmNoaXZlOiAxfSwgfSBzdHJ1Y3R1cmVcbiAgICogQHBhcmFtIGlkcyBQcmltYXJ5IEtleXMgb2YgdGhlIGVudGl0aWVzIC5bIDEgb3IgMSwyLDMsNCw1IF1cbiAgICogQHBhcmFtIGFyY2hpdmVcbiAgICovXG4gIGFyY2hpdmVFbnRpdGllcyhpZHM6IHN0cmluZyB8IG51bWJlciwgYXJjaGl2ZTogYm9vbGVhbik6IE9ic2VydmFibGU8YW55PjtcblxuXG4gIC8qKlxuICAgKiAgQSBtZXRob2QgdGhhdCByZXR1cm5zIHRoZSBjb25maWd1cmVkIGFwcFxuICAgKi9cbiAgZ2V0QXBwTmFtZSgpOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqICBBIGh0dHAgY2FsbCB0aGF0IGdldHMgYSBsaXN0IG9mIGVudGl0aWVzXG4gICAqIEBwYXJhbSBxdWVyeVBhcmFtcyAnP2FyY2hpdmVkPTEnLCAnP2FyY2hpdmVkPTAnXG4gICAqL1xuICBnZXRFbnRpdGllcyhxdWVyeVBhcmFtcz86IFF1ZXJ5UGFyYW1zSW50ZXJmYWNlKTogUHJvbWlzZTxFbnRpdHlbXT47XG5cbiAgLyoqXG4gICAqXG4gICAqIEBwYXJhbSBpZCBQcmltYXJ5IEtleSBvZiB0aGUgZW50aXR5XG4gICAqIEBwYXJhbSBwYXJhbXMgJz9tZXRhZGF0YT0xJywgJz9tZXRhZGF0YT0wJywgJz9tZXRhZGF0YT0xJmZpbHRlcj1pZCxuYW1lJ1xuICAgKiBAcmV0dXJuIE9ic2VydmFibGVcbiAgICovXG4gIGdldEVudGl0eShpZDogbnVtYmVyIHwgc3RyaW5nLCBxdWVyeVBhcmFtcz86IFF1ZXJ5UGFyYW1zSW50ZXJmYWNlKTogT2JzZXJ2YWJsZTxhbnk+O1xuXG4gIC8qKlxuICAgKiBBIEh0dHAgY2FsbCB0aGF0IGdldHMgdGhlIGVudGl0eSBoaXN0b3J5XG4gICAqIEBwYXJhbSBpZCBQcmltYXJ5IEtleSBvZiB0aGUgZW50aXR5XG4gICAqL1xuICBnZXRIaXN0b3J5KGlkOiBudW1iZXIpOiBPYnNlcnZhYmxlPGFueT47XG5cblxuICAvKipcbiAgICogQSBIdHRwIGNhbGwgdGhhdCBnZXRzIHRoZSBlbnRpdHkgbWV0YWRhdGFcbiAgICovXG4gIGdldFVpUmVzb3VyY2UoY29yZTogQ29yZUNvbmZpZyk6IFByb21pc2U8YW55PjtcblxuICAvKipcbiAgICogQSBIdHRwIGNhbGwgdGhhdCBnZXRzIHRoZSBlbnRpdHkgY29uZmlnc1xuICAgKiBAcGFyYW0gaWQgUHJpbWFyeSBLZXkgb2YgdGhlIGVudGl0eVxuICAgKi9cbiAgZ2V0Q29uZmlnKCk6IE9ic2VydmFibGU8YW55PjtcblxuXG4gIC8qKlxuICAgKiBBIG1ldGhvZCB0aGF0IGdldHMgdGhlIEludGVybWFsIG5hbWUgZm9yIGFuIGVudGl0eVxuICAgKiBAcGFyYW0gZmllbGRcbiAgICovXG4gIGdldEludGVybmFsTmFtZSgpOiBzdHJpbmc7XG5cblxuICAvKipcbiAgICogQSBtZXRob2QgdGhhdCBnZXRzIHRoZSBEaXNwbGF5IG5hbWUgZm9yIGEgc2luZ3VsYXIgZW50aXR5XG4gICAqIEBwYXJhbSBmaWVsZFxuICAgKi9cbiAgZ2V0RGlzcGxheU5hbWUoKTogc3RyaW5nO1xuXG5cbiAgLyoqXG4gICAqIEEgbWV0aG9kIHRoYXQgZ2V0cyB0aGUgYmFzZSBhcGkgcGF0aCBmb3IgdGhlIGVudGl0eVxuICAgKiBAcGFyYW0gZmllbGRcbiAgICovXG4gIGdldEFwaVBhdGgoKTogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBBIGh0dHAgY2FsbCB0aGF0IGdldHMgdGhlIHVzZXIgcHJlZmVyZW5jZXMgb2YgYW4gRW50aXR5XG4gICAqL1xuICBnZXRQcmVmZXJlbmNlcyhjb3JlPzogQ29yZUNvbmZpZywgY2FjaGU/OiBib29sZWFuKTogUHJvbWlzZTxhbnk+O1xuXG4gIC8qKlxuICAgKiBBIGh0dHAgY2FsbCB0aGF0IHJlbG9hZHMgYW4gZXhpc3RpbmcgcmVzb3VyY2VcbiAgICovXG4gIHJlbG9hZFJlc291cmNlKGNvcmU6IENvcmVDb25maWcsIHJlc291cmNlTmFtZTogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPjtcblxuICAvKipcbiAgICogQSBtZXRob2QgdGhhdCB3aWxsIG5hdmlnYXRlIHRoZSB1c2VyIHRvIHRoZSBUYWIgVmlldyBvZiBhbiBlbnRpdHlcbiAgICogTWV0aG9kIHNob3VsZCB0YWtlIGludG8gY29uc2lkZXJhdGlvbiB0aGUgYWxpYXNlcyB0aGF0IHRoZSBlbnRpdHkgbWlnaHQgaGF2ZVxuICAgKiBAcGFyYW0gaWQgUHJpbWFyeSBLZXkgb2YgdGhlIGVudGl0eVxuICAgKiBAcGFyYW0gdGFiXG4gICAqL1xuICBuYXZpZ2F0ZVRvRW50aXR5KGlkOiBudW1iZXIgfCBzdHJpbmcsIHRhYj86IHN0cmluZyk6IFByb21pc2U8YW55PjtcblxuICAvKipcbiAgICogQSBtZXRob2QgdGhhdCB3aWxsIG5hdmlnYXRlIHRoZSB1c2VyIHRvIHRoZSBMaXN0IFZpZXcgb2YgYW4gZW50aXR5XG4gICAqIE1ldGhvZCBzaG91bGQgdGFrZSBpbnRvIGNvbnNpZGVyYXRpb24gdGhlIGFsaWFzZXMgdGhhdCB0aGUgZW50aXR5IG1pZ2h0IGhhdmVcbiAgICogQHBhcmFtIGlkIFByaW1hcnkgS2V5IG9mIHRoZSBlbnRpdHlcbiAgICogQHBhcmFtIHRhYlxuICAgKi9cbiAgbmF2aWdhdGVUb0VudGl0aWVzKCk6IFByb21pc2U8YW55Pjtcbn1cblxuIl19