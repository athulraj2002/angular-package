import { __awaiter } from "tslib";
import { EventEmitter, Injectable } from '@angular/core';
import { forkJoin } from 'rxjs';
import { PopEntityRepoService } from './pop-entity-repo.service';
import { CoreConfig, PopHistory, PopLog } from '../../../pop-common.model';
import { PopEntityUtilFieldService } from './pop-entity-util-field.service';
import { DeepMerge, IsArray, IsObject, IsObjectThrowError, IsString, JsonCopy, IsNumber, IsCallableFunction, StorageGetter, GetHttpObjectResult } from '../../../pop-common-utility';
import { PopEntityUtilParamService } from './pop-entity-util-param.service';
import { DefaultEntityAction } from '../models/pop-entity-default.action';
import { DefaultEntityTable } from '../models/pop-entity-default.table';
import { DefaultEntityField } from '../models/pop-entity-default.field';
import { DefaultEntityResource } from '../models/pop-entity-default.resource';
import { DefaultEntityMenu } from '../models/pop-entity-default.menu';
import { DefaultEntityRoute } from '../models/pop-entity-default.route';
import { EvaluateWhenConditions, InterpolateEntityRoutes, IsAliasable } from '../pop-entity-utility';
import * as i0 from "@angular/core";
import * as i1 from "./pop-entity-util-field.service";
import * as i2 from "./pop-entity-util-param.service";
export class PopEntityService {
    /**
     * This srv is used in the
     * @param env
     */
    constructor(fieldUtil, paramUtil) {
        this.fieldUtil = fieldUtil;
        this.paramUtil = paramUtil;
        this.name = 'PopEntityService';
        this.asset = {
            access: new Map(),
            base: new Map(),
            dataSetter: new Map(),
            entryAccess: new Map(),
            lastDataSetter: new Map(),
            decorator: new Map(),
            filter: new Map(),
            params: new Map(),
            repo: new Map(),
            tabs: new Map(),
            resources: new Map(),
            actions: new Map(),
            fields: new Map(),
            tables: new Map(),
            menus: new Map(),
            routes: new Map(),
        };
        this.asset.tabs.set('default', []);
    }
    /**
     * Check a specific crud access against an entity
     * @param internal_name
     * @param accessType
     */
    checkAccess(internal_name, accessType) {
        return this.paramUtil.checkAccess(internal_name, accessType);
    }
    /**
     * Configure/Extend the default behavior of an entity
     * @param internal_name
     * @param extend
     */
    configure(internal_name, extend) {
        if (IsArray(extend.tab, true))
            this.setEntityTabs(internal_name, extend.tab);
        if (IsObject(extend.action, true))
            this.setEntityAction(internal_name, extend.action);
        if (IsArray(extend.entryAccess, true))
            this.setEntityEntryAccess(internal_name, extend.entryAccess);
        if (IsObject(extend.resource, true))
            this.setEntityResource(internal_name, extend.resource);
        if (IsCallableFunction(extend.dataSetter))
            this.setEntityDataSetter(internal_name, extend.dataSetter);
        if (IsCallableFunction(extend.lastDataSetter))
            this.setLastEntityDataSetter(internal_name, extend.lastDataSetter);
        if (IsCallableFunction(extend.decorator))
            this.setEntityDecorator(internal_name, extend.decorator);
        if (IsCallableFunction(extend.filter))
            this.setEntityFilter(internal_name, extend.filter);
        if (IsObject(extend.table, true))
            this.setEntityTable(internal_name, extend.table);
        if (IsObject(extend.route, true))
            this.setEntityRoute(internal_name, extend.route);
        if (IsObject(extend.field, true))
            this.setEntityField(internal_name, extend.field);
        if (IsObject(extend.menu, true))
            this.setEntityMenu(internal_name, extend.menu);
    }
    /**
     * A method to get a Core Config for an entity
     * Uses cache service to improve performance
     * ALL ENTITY RELATED COMPONENTS RELY ON THIS !!!!
     * @param entityParams
     * @param metadata
     */
    getCoreConfig(internal_name, entityId = 0, dom) {
        return new Promise((resolve) => {
            //       console.log('internal_name', entityId);
            this._getBaseCoreConfig(internal_name).then((baseConfig) => {
                if (+entityId > 0) {
                    baseConfig.params.entityId = +entityId;
                    baseConfig.repo.getEntity(baseConfig.params.entityId, {}).subscribe((res) => __awaiter(this, void 0, void 0, function* () {
                        baseConfig.entity = res.data ? res.data : res;
                        yield this.setCoreDomAssets(baseConfig, dom);
                        // await this.setCoreDomAssets(baseConfig, dom);
                        return resolve(baseConfig);
                    }), () => {
                        if (PopHistory.isPreviousHistory())
                            PopHistory.goBack();
                        return resolve(null);
                    });
                }
                else {
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
    updateBaseCoreConfig(internal_name, key, value) {
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
                }
                else {
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
    getEntityParams(internal_name, entityId = null) {
        let entityParams;
        if (this.asset.params.has(internal_name)) {
            entityParams = Object.assign({}, this.asset.params.get(internal_name));
            entityParams.entity = entityId;
        }
        else {
            entityParams = this.paramUtil.getEntityParams(internal_name);
            if (entityParams) {
                this.asset.params.set(internal_name, Object.assign({}, entityParams));
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
    getEntityRepo(internal_name) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            const baseConfig = yield this._getBaseCoreConfig(internal_name);
            if (IsObject(baseConfig), ['repo']) {
                return resolve(baseConfig.repo);
            }
            else {
                return resolve(null);
            }
        }));
    }
    /**
     * Get the entity params that are associated with a angular route ie.. /admin/accounts should resolve to the account params
     * @param api_path
     * @param id
     */
    getEntityParamsWithPath(api_path, id = null) {
        return this.paramUtil.getEntityParamsWithPath(api_path, id);
    }
    /**
     * A helper function that fetches an entity internal name from an Active Route
     * This is a way to ask based of the current route what entity am I dealing with
     * @param route
     * @param extension
     */
    getRouteInternalName(route, extension) {
        let internal_name = 'user';
        if (route.snapshot.params && route.snapshot.params.internal_name) {
            internal_name = route.snapshot.params.internal_name;
        }
        else if (extension && IsString(extension.internal_name, true)) {
            internal_name = extension.internal_name;
        }
        else if (IsString(route.snapshot.data.internal_name, true)) {
            internal_name = route.snapshot.data.internal_name;
        }
        else if (IsString(route.snapshot.data.can_read, true)) {
            internal_name = route.snapshot.data.can_read;
        }
        else {
            let pathEntityParams;
            if (route.snapshot.routeConfig && route.snapshot.routeConfig.path) {
                pathEntityParams = this.paramUtil.getEntityParamsWithPath(route.snapshot.routeConfig.path);
            }
            if (pathEntityParams) {
                internal_name = pathEntityParams.internal_name;
            }
            else {
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
    getRouteParentId(route, extension) {
        let parentId = null;
        if (route.snapshot.params && route.snapshot.params.id) {
            parentId = route.snapshot.params.id;
        }
        else {
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
    getEntityTabs(core) {
        if (IsObject(core, ['params', 'entity']) && this.asset.tabs.has(core.params.internal_name)) {
            const tabs = this.asset.tabs.get(core.params.internal_name).filter((tab) => {
                return EvaluateWhenConditions(core, tab.when, core);
            });
            return [...tabs];
        }
        else {
            return [...this.asset.tabs.get('default')];
        }
    }
    /**
     * A method that refreshes just the entity on an CoreConfig
     * Will automatically update the entity on the entity config
     * @param config
     * @param queryParams
     */
    refreshCoreEntity(core, dom, queryParams) {
        return new Promise((resolve) => {
            if (core.params.entityId)
                core.repo.clearCache('entity', String(core.params.entityId), 'PopEntityService:refreshEntity');
            if (!IsObject(queryParams))
                queryParams = {};
            if (core && core.repo) {
                queryParams.bypassCache = true;
                core.repo.getEntity(core.params.entityId, queryParams).subscribe((res) => __awaiter(this, void 0, void 0, function* () {
                    const entity = GetHttpObjectResult(res);
                    Object.keys(entity).map((key) => {
                        core.entity[key] = entity[key];
                    });
                    yield this.setCoreDomAssets(core, dom);
                    PopLog.info(this.name, `refreshCoreEntity`, core.entity);
                    return resolve(entity);
                }), (err) => {
                    return resolve(null);
                });
            }
            else {
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
    setCoreDomAssets(core, dom) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            core.resource = yield core.repo.getUiResource(core);
            if (IsObject(core.entity, true)) {
                const dataSetter = StorageGetter(core.repo, ['model', 'dataSetter'], null);
                if (IsCallableFunction(dataSetter)) {
                    core.entity = dataSetter(core, core.entity, dom);
                }
                if (IsObject(dom, true)) {
                    yield this.fieldUtil.buildDomFields(core, dom);
                }
                const lastDataSetter = StorageGetter(core.repo, ['model', 'lastDataSetter'], null);
                if (IsCallableFunction(lastDataSetter)) {
                    core.entity = lastDataSetter(core, core.entity, dom);
                }
            }
            return resolve(true);
        }));
    }
    /**
     * Set the base definitions for an entity
     * Each entity needs to define these so we know how to talk to the api in regards to it
     * The api should provide this details as part of the auth token
     * @param internal_name
     * @param entityId
     */
    setEntityParams(params) {
        PopLog.info(this.name, `Entity Params set for ${params.internal_name}`, params);
        this.paramUtil.setEntityParams(params);
    }
    /**
     * Attach a set of tab configs to an entity
     * @param internal_name
     * @param tabs
     */
    setEntityTabs(internal_name, tabs) {
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
    setEntityAction(internal_name, action) {
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
    setEntityEntryAccess(internal_name, entryAccess) {
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
    setEntityTable(internal_name, table) {
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
    setEntityRoute(internal_name, route) {
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
    setEntityMenu(internal_name, menu) {
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
    setEntityResource(internal_name, resource) {
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
    setEntityDecorator(internal_name, decorator) {
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
    setEntityDataSetter(internal_name, dataSetter) {
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
    setLastEntityDataSetter(internal_name, dataSetter) {
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
    setEntityFilter(internal_name, filter) {
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
    setEntityField(internal_name, field) {
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
    getEntityField(internal_name) {
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
    getEntityEntryAccess(internal_name) {
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
    getEntityResource(internal_name) {
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
    getEntityDecorator(internal_name) {
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
    getEntityDataSetter(internal_name) {
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
    getEntityLastDataSetter(internal_name) {
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
    getEntityFilter(internal_name) {
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
    getEntityAction(internal_name) {
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
    getEntityTable(internal_name) {
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
    getEntityRoute(internal_name) {
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
    getEntityMenu(internal_name) {
        if (IsString(internal_name, true)) {
            const action = this.asset.menus.get(internal_name);
            return action ? action : {};
        }
    }
    bustAllCache() {
        this.asset.repo.forEach((repo, key) => {
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
    _getBaseCoreConfig(internal_name) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            if (!this.asset.base.has(internal_name)) {
                const params = this.getEntityParams(internal_name);
                const core = new CoreConfig({
                    params: IsObjectThrowError(params, true, `Could not resolve params for ${internal_name}`) ? params : null,
                });
                core.flag = { routeCheck: IsAliasable(internal_name), assetCheck: true, modalCheck: false, refreshCheck: false };
                core.access = this._getEntityAccess(core.params);
                core.channel = new EventEmitter();
                core.repo = this._getEntityRepo(core.params);
                core.repo.model = {
                    action: DeepMerge(JsonCopy(DefaultEntityAction), this.getEntityAction(core.params.internal_name)),
                    dataSetter: this.getEntityDataSetter(core.params.internal_name),
                    lastDataSetter: this.getEntityLastDataSetter(core.params.internal_name),
                    decorator: this.getEntityDecorator(core.params.internal_name),
                    filter: this.getEntityFilter(core.params.internal_name),
                    table: DeepMerge(JsonCopy(DefaultEntityTable), this.getEntityTable(core.params.internal_name)),
                    field: Object.assign(Object.assign({}, DeepMerge(DefaultEntityField)), this.getEntityField(core.params.internal_name)),
                    resource: DeepMerge(JsonCopy(DefaultEntityResource), this.getEntityResource(core.params.internal_name)),
                    route: DeepMerge(JsonCopy(DefaultEntityRoute), this.getEntityRoute(core.params.internal_name)),
                    menu: DeepMerge(JsonCopy(DefaultEntityMenu), this.getEntityMenu(core.params.internal_name))
                };
                core.repo.setRoutes(InterpolateEntityRoutes(core.repo.model.route, core.params));
                yield forkJoin([this._getEntityConfig(core, internal_name), core.repo.getPreferences(core)]).subscribe(() => {
                    this.asset.base.set(internal_name, core);
                    return resolve(Object.assign({}, this.asset.base.get(internal_name)));
                }, () => {
                    return resolve(Object.assign({}, this.asset.base.get(internal_name)));
                });
            }
            else {
                return resolve(Object.assign({}, this.asset.base.get(internal_name)));
            }
        }));
    }
    /**
     * Get the an entity repo class for a specific entity
     * This is intended to be run when a CoreConfig is requested for an entity, once created it will be stored and reused
     *
     * @param entityParams
     * @param routes
     */
    _getEntityRepo(entityParams) {
        let repo = null;
        if (IsObject(entityParams, true)) {
            if (this.asset.repo.has(entityParams.internal_name)) {
                repo = this.asset.repo.get(entityParams.internal_name);
            }
            else {
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
    _getEntityAccess(entityParams) {
        let entityAccess = null;
        if (IsObject(entityParams, true)) {
            entityAccess = this.paramUtil.getAccess(entityParams.internal_name);
            if (this.asset.access.has(entityParams.internal_name)) {
                entityAccess = Object.assign({}, this.asset.access.get(entityParams.internal_name));
            }
            else {
                entityAccess = this.paramUtil.getAccess(entityParams.internal_name);
                if (entityAccess) {
                    this.asset.access.set(entityParams.internal_name, Object.assign({}, entityAccess));
                }
            }
        }
        return entityAccess;
    }
    _getEntityConfig(core, internal_name) {
        return new Promise((resolve) => {
            core.repo.getConfig().subscribe((res) => {
                // this.getJsonModel(internal_name).then((res: any) => {
                let ApiModels = res.data ? res.data : res;
                ApiModels = ApiModels.model ? ApiModels.model : ApiModels;
                if (!IsObject(ApiModels)) {
                    ApiModels = {};
                }
                core.repo.model = Object.assign(Object.assign({}, core.repo.model), ApiModels //  Gives the api the ability to send over data, stub for future features
                );
                return resolve(true);
            }, () => {
                return resolve(false);
            });
        });
    }
}
PopEntityService.ɵprov = i0.ɵɵdefineInjectable({ factory: function PopEntityService_Factory() { return new PopEntityService(i0.ɵɵinject(i1.PopEntityUtilFieldService), i0.ɵɵinject(i2.PopEntityUtilParamService)); }, token: PopEntityService, providedIn: "root" });
PopEntityService.decorators = [
    { type: Injectable, args: [{
                providedIn: 'root'
            },] }
];
PopEntityService.ctorParameters = () => [
    { type: PopEntityUtilFieldService },
    { type: PopEntityUtilParamService }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvZW50aXR5L3NlcnZpY2VzL3BvcC1lbnRpdHkuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFDLFlBQVksRUFBRSxVQUFVLEVBQVksTUFBTSxlQUFlLENBQUM7QUFFbEUsT0FBTyxFQUFDLFFBQVEsRUFBaUIsTUFBTSxNQUFNLENBQUM7QUFFOUMsT0FBTyxFQUFDLG9CQUFvQixFQUFDLE1BQU0sMkJBQTJCLENBQUM7QUFJL0QsT0FBTyxFQUNMLFVBQVUsRUFXYSxVQUFVLEVBQUUsTUFBTSxFQUkxQyxNQUFNLDJCQUEyQixDQUFDO0FBQ25DLE9BQU8sRUFBQyx5QkFBeUIsRUFBQyxNQUFNLGlDQUFpQyxDQUFDO0FBQzFFLE9BQU8sRUFDTCxTQUFTLEVBQ1QsT0FBTyxFQUNQLFFBQVEsRUFDUixrQkFBa0IsRUFDbEIsUUFBUSxFQUNSLFFBQVEsRUFDUixRQUFRLEVBQ1Isa0JBQWtCLEVBQ2xCLGFBQWEsRUFDYixtQkFBbUIsRUFDcEIsTUFBTSw2QkFBNkIsQ0FBQztBQUVyQyxPQUFPLEVBQUMseUJBQXlCLEVBQUMsTUFBTSxpQ0FBaUMsQ0FBQztBQUMxRSxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSxxQ0FBcUMsQ0FBQztBQUN4RSxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSxvQ0FBb0MsQ0FBQztBQUN0RSxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSxvQ0FBb0MsQ0FBQztBQUN0RSxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSx1Q0FBdUMsQ0FBQztBQUM1RSxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxtQ0FBbUMsQ0FBQztBQUNwRSxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSxvQ0FBb0MsQ0FBQztBQUN0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SyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7Z0JBQzFELElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEVBQUU7b0JBQ3hCLFNBQVMsR0FBRyxFQUFFLENBQUM7aUJBQ2hCO2dCQUNELElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxtQ0FDVixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssR0FDZixTQUFTLENBQUMseUVBQXlFO2lCQUN2RixDQUFDO2dCQUNGLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3ZCLENBQUMsRUFBRSxHQUFHLEVBQUU7Z0JBQ04sT0FBTyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDeEIsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7Ozs7WUFsd0JGLFVBQVUsU0FBQztnQkFDVixVQUFVLEVBQUUsTUFBTTthQUNuQjs7O1lBL0JPLHlCQUF5QjtZQWN6Qix5QkFBeUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0V2ZW50RW1pdHRlciwgSW5qZWN0YWJsZSwgT25EZXN0cm95fSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7dGFwfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQge2ZvcmtKb2luLCBPYnNlcnZhYmxlLCBvZn0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7UG9wRW50aXR5UmVwb1NlcnZpY2V9IGZyb20gJy4vcG9wLWVudGl0eS1yZXBvLnNlcnZpY2UnO1xuaW1wb3J0IHtUYWJDb25maWd9IGZyb20gJy4uLy4uL2Jhc2UvcG9wLXRhYi1tZW51L3RhYi1tZW51Lm1vZGVsJztcblxuaW1wb3J0IHtBY3RpdmF0ZWRSb3V0ZX0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcbmltcG9ydCB7XG4gIENvcmVDb25maWcsIERhdGFEZWNvcmF0b3IsIERhdGFGaWx0ZXIsIERhdGFTZXR0ZXIsXG4gIERpY3Rpb25hcnksXG4gIEVudGl0eSxcbiAgRW50aXR5QWNjZXNzSW50ZXJmYWNlLFxuICBFbnRpdHlFeHRlbmRJbnRlcmZhY2UsXG4gIEVudGl0eU1vZGVsSW50ZXJmYWNlLFxuICBFbnRpdHlNb2RlbE1lbnVJbnRlcmZhY2UsXG4gIEVudGl0eU1vZGVsVGFibGVJbnRlcmZhY2UsXG4gIEVudGl0eVBhcmFtcyxcbiAgRW50aXR5UGFyYW1zSW50ZXJmYWNlLFxuICBFbnRpdHlQcmVmZXJlbmNlLFxuICBQb3BCYXNlRXZlbnRJbnRlcmZhY2UsIFBvcEhpc3RvcnksIFBvcExvZyxcbiAgUXVlcnlQYXJhbXNJbnRlcmZhY2UsXG4gIFJlc291cmNlSW50ZXJmYWNlLFxuICBTZXJ2aWNlUm91dGVzSW50ZXJmYWNlXG59IGZyb20gJy4uLy4uLy4uL3BvcC1jb21tb24ubW9kZWwnO1xuaW1wb3J0IHtQb3BFbnRpdHlVdGlsRmllbGRTZXJ2aWNlfSBmcm9tICcuL3BvcC1lbnRpdHktdXRpbC1maWVsZC5zZXJ2aWNlJztcbmltcG9ydCB7XG4gIERlZXBNZXJnZSxcbiAgSXNBcnJheSxcbiAgSXNPYmplY3QsXG4gIElzT2JqZWN0VGhyb3dFcnJvcixcbiAgSXNTdHJpbmcsXG4gIEpzb25Db3B5LFxuICBJc051bWJlcixcbiAgSXNDYWxsYWJsZUZ1bmN0aW9uLFxuICBTdG9yYWdlR2V0dGVyLFxuICBHZXRIdHRwT2JqZWN0UmVzdWx0XG59IGZyb20gJy4uLy4uLy4uL3BvcC1jb21tb24tdXRpbGl0eSc7XG5pbXBvcnQge1BvcERvbVNlcnZpY2V9IGZyb20gJy4uLy4uLy4uL3NlcnZpY2VzL3BvcC1kb20uc2VydmljZSc7XG5pbXBvcnQge1BvcEVudGl0eVV0aWxQYXJhbVNlcnZpY2V9IGZyb20gJy4vcG9wLWVudGl0eS11dGlsLXBhcmFtLnNlcnZpY2UnO1xuaW1wb3J0IHtEZWZhdWx0RW50aXR5QWN0aW9ufSBmcm9tICcuLi9tb2RlbHMvcG9wLWVudGl0eS1kZWZhdWx0LmFjdGlvbic7XG5pbXBvcnQge0RlZmF1bHRFbnRpdHlUYWJsZX0gZnJvbSAnLi4vbW9kZWxzL3BvcC1lbnRpdHktZGVmYXVsdC50YWJsZSc7XG5pbXBvcnQge0RlZmF1bHRFbnRpdHlGaWVsZH0gZnJvbSAnLi4vbW9kZWxzL3BvcC1lbnRpdHktZGVmYXVsdC5maWVsZCc7XG5pbXBvcnQge0RlZmF1bHRFbnRpdHlSZXNvdXJjZX0gZnJvbSAnLi4vbW9kZWxzL3BvcC1lbnRpdHktZGVmYXVsdC5yZXNvdXJjZSc7XG5pbXBvcnQge0RlZmF1bHRFbnRpdHlNZW51fSBmcm9tICcuLi9tb2RlbHMvcG9wLWVudGl0eS1kZWZhdWx0Lm1lbnUnO1xuaW1wb3J0IHtEZWZhdWx0RW50aXR5Um91dGV9IGZyb20gJy4uL21vZGVscy9wb3AtZW50aXR5LWRlZmF1bHQucm91dGUnO1xuaW1wb3J0IHtcbiAgRXZhbHVhdGVXaGVuQ29uZGl0aW9ucyxcbiAgSW50ZXJwb2xhdGVFbnRpdHlSb3V0ZXMsXG4gIElzQWxpYXNhYmxlLFxuICBTZXNzaW9uRW50aXR5RmllbGRVcGRhdGVcbn0gZnJvbSAnLi4vcG9wLWVudGl0eS11dGlsaXR5JztcblxuXG5ASW5qZWN0YWJsZSh7XG4gIHByb3ZpZGVkSW46ICdyb290J1xufSlcbmV4cG9ydCBjbGFzcyBQb3BFbnRpdHlTZXJ2aWNlIGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgcHJpdmF0ZSBuYW1lID0gJ1BvcEVudGl0eVNlcnZpY2UnO1xuICBwcml2YXRlIGlkO1xuXG4gIHByaXZhdGUgYXNzZXQgPSB7XG4gICAgYWNjZXNzOiA8TWFwPHN0cmluZywgRW50aXR5QWNjZXNzSW50ZXJmYWNlPj5uZXcgTWFwPHN0cmluZywgRW50aXR5QWNjZXNzSW50ZXJmYWNlPigpLFxuICAgIGJhc2U6IDxNYXA8c3RyaW5nLCBDb3JlQ29uZmlnPj5uZXcgTWFwPHN0cmluZywgQ29yZUNvbmZpZz4oKSxcbiAgICBkYXRhU2V0dGVyOiA8TWFwPHN0cmluZywgRGF0YVNldHRlcj4+bmV3IE1hcDxzdHJpbmcsIERhdGFTZXR0ZXI+KCksXG4gICAgZW50cnlBY2Nlc3M6IDxNYXA8c3RyaW5nLCBzdHJpbmdbXT4+bmV3IE1hcDxzdHJpbmcsIHN0cmluZ1tdPigpLFxuICAgIGxhc3REYXRhU2V0dGVyOiA8TWFwPHN0cmluZywgRGF0YVNldHRlcj4+bmV3IE1hcDxzdHJpbmcsIERhdGFTZXR0ZXI+KCksXG4gICAgZGVjb3JhdG9yOiA8TWFwPHN0cmluZywgRGF0YURlY29yYXRvcj4+bmV3IE1hcDxzdHJpbmcsIERhdGFEZWNvcmF0b3I+KCksXG4gICAgZmlsdGVyOiA8TWFwPHN0cmluZywgRGF0YUZpbHRlcj4+bmV3IE1hcDxzdHJpbmcsIERhdGFGaWx0ZXI+KCksXG4gICAgcGFyYW1zOiA8TWFwPHN0cmluZywgRW50aXR5UGFyYW1zPj5uZXcgTWFwPHN0cmluZywgRW50aXR5UGFyYW1zPigpLFxuICAgIHJlcG86IDxNYXA8c3RyaW5nLCBQb3BFbnRpdHlSZXBvU2VydmljZT4+bmV3IE1hcDxzdHJpbmcsIFBvcEVudGl0eVJlcG9TZXJ2aWNlPigpLFxuICAgIHRhYnM6IDxNYXA8c3RyaW5nLCBUYWJDb25maWdbXT4+bmV3IE1hcDxzdHJpbmcsIFRhYkNvbmZpZ1tdPigpLFxuICAgIHJlc291cmNlczogPE1hcDxzdHJpbmcsIERpY3Rpb25hcnk8UmVzb3VyY2VJbnRlcmZhY2U+Pj5uZXcgTWFwPHN0cmluZywgRGljdGlvbmFyeTxSZXNvdXJjZUludGVyZmFjZT4+KCksXG4gICAgYWN0aW9uczogPE1hcDxzdHJpbmcsIERpY3Rpb25hcnk8YW55Pj4+bmV3IE1hcDxzdHJpbmcsIERpY3Rpb25hcnk8YW55Pj4oKSxcbiAgICBmaWVsZHM6IDxNYXA8c3RyaW5nLCBEaWN0aW9uYXJ5PGFueT4+Pm5ldyBNYXA8c3RyaW5nLCBEaWN0aW9uYXJ5PGFueT4+KCksXG4gICAgdGFibGVzOiA8TWFwPHN0cmluZywgRW50aXR5TW9kZWxUYWJsZUludGVyZmFjZT4+bmV3IE1hcDxzdHJpbmcsIEVudGl0eU1vZGVsVGFibGVJbnRlcmZhY2U+KCksXG4gICAgbWVudXM6IDxNYXA8c3RyaW5nLCBFbnRpdHlNb2RlbE1lbnVJbnRlcmZhY2U+Pm5ldyBNYXA8c3RyaW5nLCBFbnRpdHlNb2RlbE1lbnVJbnRlcmZhY2U+KCksXG4gICAgcm91dGVzOiA8TWFwPHN0cmluZywgU2VydmljZVJvdXRlc0ludGVyZmFjZT4+bmV3IE1hcDxzdHJpbmcsIFNlcnZpY2VSb3V0ZXNJbnRlcmZhY2U+KCksXG4gIH07XG5cblxuICAvKipcbiAgICogVGhpcyBzcnYgaXMgdXNlZCBpbiB0aGVcbiAgICogQHBhcmFtIGVudlxuICAgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBmaWVsZFV0aWw6IFBvcEVudGl0eVV0aWxGaWVsZFNlcnZpY2UsXG4gICAgcHJpdmF0ZSBwYXJhbVV0aWw6IFBvcEVudGl0eVV0aWxQYXJhbVNlcnZpY2UsXG4gICkge1xuICAgIHRoaXMuYXNzZXQudGFicy5zZXQoJ2RlZmF1bHQnLCBbXSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBDaGVjayBhIHNwZWNpZmljIGNydWQgYWNjZXNzIGFnYWluc3QgYW4gZW50aXR5XG4gICAqIEBwYXJhbSBpbnRlcm5hbF9uYW1lXG4gICAqIEBwYXJhbSBhY2Nlc3NUeXBlXG4gICAqL1xuICBjaGVja0FjY2VzcyhpbnRlcm5hbF9uYW1lOiBzdHJpbmcsIGFjY2Vzc1R5cGU6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLnBhcmFtVXRpbC5jaGVja0FjY2VzcyhpbnRlcm5hbF9uYW1lLCBhY2Nlc3NUeXBlKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIENvbmZpZ3VyZS9FeHRlbmQgdGhlIGRlZmF1bHQgYmVoYXZpb3Igb2YgYW4gZW50aXR5XG4gICAqIEBwYXJhbSBpbnRlcm5hbF9uYW1lXG4gICAqIEBwYXJhbSBleHRlbmRcbiAgICovXG4gIGNvbmZpZ3VyZShpbnRlcm5hbF9uYW1lOiBzdHJpbmcsIGV4dGVuZDogRW50aXR5TW9kZWxJbnRlcmZhY2UpIHtcbiAgICBpZiAoSXNBcnJheShleHRlbmQudGFiLCB0cnVlKSkgdGhpcy5zZXRFbnRpdHlUYWJzKGludGVybmFsX25hbWUsIGV4dGVuZC50YWIpO1xuICAgIGlmIChJc09iamVjdChleHRlbmQuYWN0aW9uLCB0cnVlKSkgdGhpcy5zZXRFbnRpdHlBY3Rpb24oaW50ZXJuYWxfbmFtZSwgZXh0ZW5kLmFjdGlvbik7XG4gICAgaWYgKElzQXJyYXkoZXh0ZW5kLmVudHJ5QWNjZXNzLCB0cnVlKSkgdGhpcy5zZXRFbnRpdHlFbnRyeUFjY2VzcyhpbnRlcm5hbF9uYW1lLCBleHRlbmQuZW50cnlBY2Nlc3MpO1xuICAgIGlmIChJc09iamVjdChleHRlbmQucmVzb3VyY2UsIHRydWUpKSB0aGlzLnNldEVudGl0eVJlc291cmNlKGludGVybmFsX25hbWUsIGV4dGVuZC5yZXNvdXJjZSk7XG4gICAgaWYgKElzQ2FsbGFibGVGdW5jdGlvbihleHRlbmQuZGF0YVNldHRlcikpIHRoaXMuc2V0RW50aXR5RGF0YVNldHRlcihpbnRlcm5hbF9uYW1lLCBleHRlbmQuZGF0YVNldHRlcik7XG4gICAgaWYgKElzQ2FsbGFibGVGdW5jdGlvbihleHRlbmQubGFzdERhdGFTZXR0ZXIpKSB0aGlzLnNldExhc3RFbnRpdHlEYXRhU2V0dGVyKGludGVybmFsX25hbWUsIGV4dGVuZC5sYXN0RGF0YVNldHRlcik7XG4gICAgaWYgKElzQ2FsbGFibGVGdW5jdGlvbihleHRlbmQuZGVjb3JhdG9yKSkgdGhpcy5zZXRFbnRpdHlEZWNvcmF0b3IoaW50ZXJuYWxfbmFtZSwgZXh0ZW5kLmRlY29yYXRvcik7XG4gICAgaWYgKElzQ2FsbGFibGVGdW5jdGlvbihleHRlbmQuZmlsdGVyKSkgdGhpcy5zZXRFbnRpdHlGaWx0ZXIoaW50ZXJuYWxfbmFtZSwgZXh0ZW5kLmZpbHRlcik7XG4gICAgaWYgKElzT2JqZWN0KGV4dGVuZC50YWJsZSwgdHJ1ZSkpIHRoaXMuc2V0RW50aXR5VGFibGUoaW50ZXJuYWxfbmFtZSwgZXh0ZW5kLnRhYmxlKTtcbiAgICBpZiAoSXNPYmplY3QoZXh0ZW5kLnJvdXRlLCB0cnVlKSkgdGhpcy5zZXRFbnRpdHlSb3V0ZShpbnRlcm5hbF9uYW1lLCBleHRlbmQucm91dGUpO1xuICAgIGlmIChJc09iamVjdChleHRlbmQuZmllbGQsIHRydWUpKSB0aGlzLnNldEVudGl0eUZpZWxkKGludGVybmFsX25hbWUsIGV4dGVuZC5maWVsZCk7XG4gICAgaWYgKElzT2JqZWN0KGV4dGVuZC5tZW51LCB0cnVlKSkgdGhpcy5zZXRFbnRpdHlNZW51KGludGVybmFsX25hbWUsIGV4dGVuZC5tZW51KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEEgbWV0aG9kIHRvIGdldCBhIENvcmUgQ29uZmlnIGZvciBhbiBlbnRpdHlcbiAgICogVXNlcyBjYWNoZSBzZXJ2aWNlIHRvIGltcHJvdmUgcGVyZm9ybWFuY2VcbiAgICogQUxMIEVOVElUWSBSRUxBVEVEIENPTVBPTkVOVFMgUkVMWSBPTiBUSElTICEhISFcbiAgICogQHBhcmFtIGVudGl0eVBhcmFtc1xuICAgKiBAcGFyYW0gbWV0YWRhdGFcbiAgICovXG4gIGdldENvcmVDb25maWcoaW50ZXJuYWxfbmFtZTogc3RyaW5nLCBlbnRpdHlJZDogbnVtYmVyID0gMCwgZG9tPzogUG9wRG9tU2VydmljZSk6IFByb21pc2U8Q29yZUNvbmZpZz4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxDb3JlQ29uZmlnPigocmVzb2x2ZSkgPT4ge1xuLy8gICAgICAgY29uc29sZS5sb2coJ2ludGVybmFsX25hbWUnLCBlbnRpdHlJZCk7XG4gICAgICB0aGlzLl9nZXRCYXNlQ29yZUNvbmZpZyhpbnRlcm5hbF9uYW1lKS50aGVuKChiYXNlQ29uZmlnOiBDb3JlQ29uZmlnKSA9PiB7XG4gICAgICAgIGlmICgrZW50aXR5SWQgPiAwKSB7XG4gICAgICAgICAgYmFzZUNvbmZpZy5wYXJhbXMuZW50aXR5SWQgPSArZW50aXR5SWQ7XG5cbiAgICAgICAgICBiYXNlQ29uZmlnLnJlcG8uZ2V0RW50aXR5KGJhc2VDb25maWcucGFyYW1zLmVudGl0eUlkLCB7fSkuc3Vic2NyaWJlKGFzeW5jIChyZXM6IGFueSkgPT4ge1xuICAgICAgICAgICAgYmFzZUNvbmZpZy5lbnRpdHkgPSByZXMuZGF0YSA/IDxFbnRpdHk+cmVzLmRhdGEgOiA8RW50aXR5PnJlcztcblxuICAgICAgICAgICAgYXdhaXQgdGhpcy5zZXRDb3JlRG9tQXNzZXRzKGJhc2VDb25maWcsIGRvbSk7XG4gICAgICAgICAgICAvLyBhd2FpdCB0aGlzLnNldENvcmVEb21Bc3NldHMoYmFzZUNvbmZpZywgZG9tKTtcblxuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoYmFzZUNvbmZpZyk7XG4gICAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgaWYgKFBvcEhpc3RvcnkuaXNQcmV2aW91c0hpc3RvcnkoKSkgUG9wSGlzdG9yeS5nb0JhY2soKTtcbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlKG51bGwpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiByZXNvbHZlKGJhc2VDb25maWcpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFByZWZlcmVuY2VzIGFyZSBzb21ldGhpbmcgdGhhdCBtaWdodCBjaGFuZ2UgaW4gdGhlIGJhc2UgY29uZmlncywga2VlcCB0aGVtIHRoZXJlIGZvciBub3cgc2luY2UgdGhleSB3aWxsIG5vdCBjaGFuZ2Ugb2Z0ZW5cbiAgICogTm90ZTogTW92ZWQgcHJlZmVyZW5jZXMgdG8gYmFzZSBjb25maWdzIHNpbmNlIHRoZXkgYXJlIG5vdCBwbGF5aW5nIG5pY2Ugd2l0aCBjYWNoZSBhbmQgSSB3YW50IHRvIHVwZGF0ZSB0aGVtIGRpcmVjdGx5XG4gICAqIEBwYXJhbSBpbnRlcm5hbF9uYW1lXG4gICAqIEBwYXJhbSBrZXlcbiAgICogQHBhcmFtIHZhbHVlXG4gICAqL1xuICB1cGRhdGVCYXNlQ29yZUNvbmZpZyhpbnRlcm5hbF9uYW1lOiBzdHJpbmcsIGtleTogc3RyaW5nLCB2YWx1ZTogYW55KSB7XG4gICAgY29uc3QgYmFzZSA9IHRoaXMuYXNzZXQuYmFzZS5nZXQoaW50ZXJuYWxfbmFtZSk7XG4gICAgbGV0IHN1YktleTtcbiAgICBpZiAoYmFzZSkge1xuICAgICAgaWYgKGtleS5pbmNsdWRlcygnOicpKSB7XG4gICAgICAgIGNvbnN0IGtleXMgPSBrZXkuc3BsaXQoJzonKTtcbiAgICAgICAga2V5ID0gU3RyaW5nKGtleXNbMF0pLnRyaW0oKTtcbiAgICAgICAgc3ViS2V5ID0gU3RyaW5nKGtleXNbMV0pLnRyaW0oKTtcbiAgICAgIH1cbiAgICAgIGlmIChrZXkgaW4gYmFzZSkge1xuICAgICAgICBpZiAoc3ViS2V5KSB7XG4gICAgICAgICAgaWYgKHN1YktleSBpbiBiYXNlW2tleV0pIHtcbiAgICAgICAgICAgIGJhc2Vba2V5XVtzdWJLZXldID0gdmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGJhc2Vba2V5XSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLmFzc2V0LmJhc2Uuc2V0KGludGVybmFsX25hbWUsIGJhc2UpO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cblxuICAvKipcbiAgICogR2V0IHRoZSBiYXNlIHNldCBvZiB0aGUgZW50aXR5IGRlZmluaXRpb25zXG4gICAqIFRoZXNlIGlzIHRoZSBzdGFydGluZyBwb2ludCB3aGVuIGl0IGNvbWVzIHRvIGVudGl0aWVzXG4gICAqIEBwYXJhbSBpbnRlcm5hbF9uYW1lXG4gICAqIEBwYXJhbSBlbnRpdHlJZFxuICAgKi9cbiAgZ2V0RW50aXR5UGFyYW1zKGludGVybmFsX25hbWU6IHN0cmluZywgZW50aXR5SWQ6IG51bWJlciA9IG51bGwpOiBFbnRpdHlQYXJhbXMge1xuICAgIGxldCBlbnRpdHlQYXJhbXM7XG4gICAgaWYgKHRoaXMuYXNzZXQucGFyYW1zLmhhcyhpbnRlcm5hbF9uYW1lKSkge1xuICAgICAgZW50aXR5UGFyYW1zID0gey4uLnRoaXMuYXNzZXQucGFyYW1zLmdldChpbnRlcm5hbF9uYW1lKX07XG4gICAgICBlbnRpdHlQYXJhbXMuZW50aXR5ID0gZW50aXR5SWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVudGl0eVBhcmFtcyA9IHRoaXMucGFyYW1VdGlsLmdldEVudGl0eVBhcmFtcyhpbnRlcm5hbF9uYW1lKTtcbiAgICAgIGlmIChlbnRpdHlQYXJhbXMpIHtcbiAgICAgICAgdGhpcy5hc3NldC5wYXJhbXMuc2V0KGludGVybmFsX25hbWUsIDxFbnRpdHlQYXJhbXM+ey4uLmVudGl0eVBhcmFtc30pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZW50aXR5UGFyYW1zO1xuICB9XG5cblxuICAvKipcbiAgICogR2V0IHRoZSBlbnRpdHkgcmVwb1xuICAgKiBUaGVzZSBpcyB0aGUgc3RhcnRpbmcgcG9pbnQgd2hlbiBpdCBjb21lcyB0byBlbnRpdGllc1xuICAgKiBAcGFyYW0gaW50ZXJuYWxfbmFtZVxuICAgKiBAcGFyYW0gZW50aXR5SWRcbiAgICovXG4gIGdldEVudGl0eVJlcG8oaW50ZXJuYWxfbmFtZTogc3RyaW5nKTogUHJvbWlzZTxQb3BFbnRpdHlSZXBvU2VydmljZT4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxQb3BFbnRpdHlSZXBvU2VydmljZT4oYXN5bmMgKHJlc29sdmUpID0+IHtcbiAgICAgIGNvbnN0IGJhc2VDb25maWcgPSBhd2FpdCB0aGlzLl9nZXRCYXNlQ29yZUNvbmZpZyhpbnRlcm5hbF9uYW1lKTtcbiAgICAgIGlmIChJc09iamVjdChiYXNlQ29uZmlnKSwgWydyZXBvJ10pIHtcbiAgICAgICAgcmV0dXJuIHJlc29sdmUoYmFzZUNvbmZpZy5yZXBvKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiByZXNvbHZlKG51bGwpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cblxuICAvKipcbiAgICogR2V0IHRoZSBlbnRpdHkgcGFyYW1zIHRoYXQgYXJlIGFzc29jaWF0ZWQgd2l0aCBhIGFuZ3VsYXIgcm91dGUgaWUuLiAvYWRtaW4vYWNjb3VudHMgc2hvdWxkIHJlc29sdmUgdG8gdGhlIGFjY291bnQgcGFyYW1zXG4gICAqIEBwYXJhbSBhcGlfcGF0aFxuICAgKiBAcGFyYW0gaWRcbiAgICovXG4gIGdldEVudGl0eVBhcmFtc1dpdGhQYXRoKGFwaV9wYXRoOiBzdHJpbmcsIGlkID0gbnVsbCk6IEVudGl0eVBhcmFtcyB7XG4gICAgcmV0dXJuIHRoaXMucGFyYW1VdGlsLmdldEVudGl0eVBhcmFtc1dpdGhQYXRoKGFwaV9wYXRoLCBpZCk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBBIGhlbHBlciBmdW5jdGlvbiB0aGF0IGZldGNoZXMgYW4gZW50aXR5IGludGVybmFsIG5hbWUgZnJvbSBhbiBBY3RpdmUgUm91dGVcbiAgICogVGhpcyBpcyBhIHdheSB0byBhc2sgYmFzZWQgb2YgdGhlIGN1cnJlbnQgcm91dGUgd2hhdCBlbnRpdHkgYW0gSSBkZWFsaW5nIHdpdGhcbiAgICogQHBhcmFtIHJvdXRlXG4gICAqIEBwYXJhbSBleHRlbnNpb25cbiAgICovXG4gIGdldFJvdXRlSW50ZXJuYWxOYW1lKHJvdXRlOiBBY3RpdmF0ZWRSb3V0ZSwgZXh0ZW5zaW9uPzogRW50aXR5RXh0ZW5kSW50ZXJmYWNlKSB7XG4gICAgbGV0IGludGVybmFsX25hbWUgPSAndXNlcic7XG4gICAgaWYgKHJvdXRlLnNuYXBzaG90LnBhcmFtcyAmJiByb3V0ZS5zbmFwc2hvdC5wYXJhbXMuaW50ZXJuYWxfbmFtZSkge1xuICAgICAgaW50ZXJuYWxfbmFtZSA9IHJvdXRlLnNuYXBzaG90LnBhcmFtcy5pbnRlcm5hbF9uYW1lO1xuICAgIH0gZWxzZSBpZiAoZXh0ZW5zaW9uICYmIElzU3RyaW5nKGV4dGVuc2lvbi5pbnRlcm5hbF9uYW1lLCB0cnVlKSkge1xuICAgICAgaW50ZXJuYWxfbmFtZSA9IGV4dGVuc2lvbi5pbnRlcm5hbF9uYW1lO1xuICAgIH0gZWxzZSBpZiAoSXNTdHJpbmcocm91dGUuc25hcHNob3QuZGF0YS5pbnRlcm5hbF9uYW1lLCB0cnVlKSkge1xuICAgICAgaW50ZXJuYWxfbmFtZSA9IHJvdXRlLnNuYXBzaG90LmRhdGEuaW50ZXJuYWxfbmFtZTtcbiAgICB9IGVsc2UgaWYgKElzU3RyaW5nKHJvdXRlLnNuYXBzaG90LmRhdGEuY2FuX3JlYWQsIHRydWUpKSB7XG4gICAgICBpbnRlcm5hbF9uYW1lID0gcm91dGUuc25hcHNob3QuZGF0YS5jYW5fcmVhZDtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHBhdGhFbnRpdHlQYXJhbXM7XG4gICAgICBpZiAocm91dGUuc25hcHNob3Qucm91dGVDb25maWcgJiYgcm91dGUuc25hcHNob3Qucm91dGVDb25maWcucGF0aCkge1xuICAgICAgICBwYXRoRW50aXR5UGFyYW1zID0gdGhpcy5wYXJhbVV0aWwuZ2V0RW50aXR5UGFyYW1zV2l0aFBhdGgocm91dGUuc25hcHNob3Qucm91dGVDb25maWcucGF0aCk7XG4gICAgICB9XG4gICAgICBpZiAocGF0aEVudGl0eVBhcmFtcykge1xuICAgICAgICBpbnRlcm5hbF9uYW1lID0gcGF0aEVudGl0eVBhcmFtcy5pbnRlcm5hbF9uYW1lO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IGF0dGVtcHQ7XG4gICAgICAgIGNvbnN0IHBhcnRzID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnNwbGl0KCcvJyk7XG4gICAgICAgIHdoaWxlICghaW50ZXJuYWxfbmFtZSB8fCBwYXJ0cy5sZW5ndGgpIHtcbiAgICAgICAgICBhdHRlbXB0ID0gcGFydHMucG9wKCk7XG4gICAgICAgICAgaWYgKGlzTmFOKGF0dGVtcHQpICYmIHRoaXMucGFyYW1VdGlsLmdldEVudGl0eVBhcmFtcyhhdHRlbXB0KSkge1xuICAgICAgICAgICAgaW50ZXJuYWxfbmFtZSA9IGF0dGVtcHQ7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFpbnRlcm5hbF9uYW1lICYmIGlzTmFOKGF0dGVtcHQpICYmIHRoaXMucGFyYW1VdGlsLmdldEVudGl0eVBhcmFtc1dpdGhQYXRoKGF0dGVtcHQpKSB7XG4gICAgICAgICAgICBpbnRlcm5hbF9uYW1lID0gYXR0ZW1wdDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gaW50ZXJuYWxfbmFtZTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEEgaGVscGVyIGZ1bmN0aW9uIHRoYXQgZmV0Y2hlcyBhbiBlbnRpdHkgSWQgZnJvbSBhbiBBY3RpdmUgUm91dGVcbiAgICogVGhpcyBpcyBhIHdheSB0byBhc2sgYmFzZWQgb2YgdGhlIGN1cnJlbnQgcm91dGUgd2hhdCBlbnRpdHkgYW0gSSBkZWFsaW5nIHdpdGhcbiAgICogQHBhcmFtIHJvdXRlXG4gICAqIEBwYXJhbSBleHRlbnNpb25cbiAgICovXG4gIGdldFJvdXRlUGFyZW50SWQocm91dGU6IEFjdGl2YXRlZFJvdXRlLCBleHRlbnNpb24/OiBFbnRpdHlFeHRlbmRJbnRlcmZhY2UpIHtcbiAgICBsZXQgcGFyZW50SWQgPSBudWxsO1xuICAgIGlmIChyb3V0ZS5zbmFwc2hvdC5wYXJhbXMgJiYgcm91dGUuc25hcHNob3QucGFyYW1zLmlkKSB7XG4gICAgICBwYXJlbnRJZCA9IHJvdXRlLnNuYXBzaG90LnBhcmFtcy5pZDtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IGF0dGVtcHQ7XG4gICAgICBjb25zdCBwYXJ0cyA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5zcGxpdCgnLycpO1xuICAgICAgd2hpbGUgKCFwYXJlbnRJZCB8fCBwYXJ0cy5sZW5ndGgpIHtcbiAgICAgICAgYXR0ZW1wdCA9IHBhcnRzLnBvcCgpO1xuICAgICAgICBpZiAoSXNOdW1iZXIoYXR0ZW1wdCwgdHJ1ZSkpIHtcbiAgICAgICAgICBwYXJlbnRJZCA9IGF0dGVtcHQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHBhcmVudElkO1xuICB9XG5cblxuICAvKipcbiAgICogR2V0IHRoZSBzZXQgb2YgdGFiIGNvbmZpZ3MgdGhhdCBiZWxvbmcgdG8gYW4gZW50aXR5XG4gICAqL1xuICBnZXRFbnRpdHlUYWJzKGNvcmU/OiBDb3JlQ29uZmlnKTogVGFiQ29uZmlnW10ge1xuICAgIGlmIChJc09iamVjdChjb3JlLCBbJ3BhcmFtcycsICdlbnRpdHknXSkgJiYgdGhpcy5hc3NldC50YWJzLmhhcyhjb3JlLnBhcmFtcy5pbnRlcm5hbF9uYW1lKSkge1xuICAgICAgY29uc3QgdGFicyA9IHRoaXMuYXNzZXQudGFicy5nZXQoY29yZS5wYXJhbXMuaW50ZXJuYWxfbmFtZSkuZmlsdGVyKCh0YWIpID0+IHtcbiAgICAgICAgcmV0dXJuIEV2YWx1YXRlV2hlbkNvbmRpdGlvbnMoY29yZSwgdGFiLndoZW4sIGNvcmUpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gWy4uLnRhYnNdO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gWy4uLnRoaXMuYXNzZXQudGFicy5nZXQoJ2RlZmF1bHQnKV07XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogQSBtZXRob2QgdGhhdCByZWZyZXNoZXMganVzdCB0aGUgZW50aXR5IG9uIGFuIENvcmVDb25maWdcbiAgICogV2lsbCBhdXRvbWF0aWNhbGx5IHVwZGF0ZSB0aGUgZW50aXR5IG9uIHRoZSBlbnRpdHkgY29uZmlnXG4gICAqIEBwYXJhbSBjb25maWdcbiAgICogQHBhcmFtIHF1ZXJ5UGFyYW1zXG4gICAqL1xuICByZWZyZXNoQ29yZUVudGl0eShjb3JlOiBDb3JlQ29uZmlnLCBkb206IFBvcERvbVNlcnZpY2UsIHF1ZXJ5UGFyYW1zOiBRdWVyeVBhcmFtc0ludGVyZmFjZSk6IFByb21pc2U8RW50aXR5PiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPEVudGl0eT4oKHJlc29sdmUpID0+IHtcbiAgICAgIGlmIChjb3JlLnBhcmFtcy5lbnRpdHlJZCkgY29yZS5yZXBvLmNsZWFyQ2FjaGUoJ2VudGl0eScsIFN0cmluZyhjb3JlLnBhcmFtcy5lbnRpdHlJZCksICdQb3BFbnRpdHlTZXJ2aWNlOnJlZnJlc2hFbnRpdHknKTtcbiAgICAgIGlmICghSXNPYmplY3QocXVlcnlQYXJhbXMpKSBxdWVyeVBhcmFtcyA9IHt9O1xuICAgICAgaWYgKGNvcmUgJiYgY29yZS5yZXBvKSB7XG4gICAgICAgIHF1ZXJ5UGFyYW1zLmJ5cGFzc0NhY2hlID0gdHJ1ZTtcbiAgICAgICAgY29yZS5yZXBvLmdldEVudGl0eShjb3JlLnBhcmFtcy5lbnRpdHlJZCwgcXVlcnlQYXJhbXMpLnN1YnNjcmliZShhc3luYyAocmVzOiBhbnkpID0+IHtcbiAgICAgICAgICBjb25zdCBlbnRpdHkgPSA8RW50aXR5PkdldEh0dHBPYmplY3RSZXN1bHQocmVzKTtcbiAgICAgICAgICBPYmplY3Qua2V5cyhlbnRpdHkpLm1hcCgoa2V5OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIGNvcmUuZW50aXR5W2tleV0gPSBlbnRpdHlba2V5XTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBhd2FpdCB0aGlzLnNldENvcmVEb21Bc3NldHMoY29yZSwgZG9tKTtcbiAgICAgICAgICBQb3BMb2cuaW5mbyh0aGlzLm5hbWUsIGByZWZyZXNoQ29yZUVudGl0eWAsIGNvcmUuZW50aXR5KTtcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZShlbnRpdHkpO1xuICAgICAgICB9LCAoZXJyKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUobnVsbCk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHJlc29sdmUobnVsbCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIGZ1bmN0aW9uIGlzIHJlc3BvbnNpYmxlIHRvIG1ha2Ugc3VyZSB0aGUgQ29yZUNvbmZpZyBoYXMgcmVzb3VyY2VzIHRvIGRvIGl0cyBqb2JcbiAgICogSUUuLi4gSWYgYSBmaWVsZCByZXF1ZXN0IGEgZGF0YSBzZXQgLCB0aGlzIGZ1bmN0aW9uIHNob3VsZCBtYWtlIHN1cmUgdGhhdCBpdCBpcyBhdmFpbGFibGVcbiAgICogQHBhcmFtIGNvcmVcbiAgICogQHBhcmFtIGRvbVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgc2V0Q29yZURvbUFzc2V0cyhjb3JlOiBDb3JlQ29uZmlnLCBkb20/OiBQb3BEb21TZXJ2aWNlKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jIChyZXNvbHZlKSA9PiB7XG5cblxuICAgICAgY29yZS5yZXNvdXJjZSA9IGF3YWl0IGNvcmUucmVwby5nZXRVaVJlc291cmNlKGNvcmUpO1xuICAgICAgaWYgKElzT2JqZWN0KGNvcmUuZW50aXR5LCB0cnVlKSkge1xuICAgICAgICBjb25zdCBkYXRhU2V0dGVyID0gU3RvcmFnZUdldHRlcihjb3JlLnJlcG8sIFsnbW9kZWwnLCAnZGF0YVNldHRlciddLCBudWxsKTtcbiAgICAgICAgaWYgKElzQ2FsbGFibGVGdW5jdGlvbihkYXRhU2V0dGVyKSkge1xuICAgICAgICAgIGNvcmUuZW50aXR5ID0gZGF0YVNldHRlcihjb3JlLCBjb3JlLmVudGl0eSwgZG9tKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoSXNPYmplY3QoZG9tLCB0cnVlKSkge1xuICAgICAgICAgIGF3YWl0IHRoaXMuZmllbGRVdGlsLmJ1aWxkRG9tRmllbGRzKGNvcmUsIGRvbSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbGFzdERhdGFTZXR0ZXIgPSBTdG9yYWdlR2V0dGVyKGNvcmUucmVwbywgWydtb2RlbCcsICdsYXN0RGF0YVNldHRlciddLCBudWxsKTtcbiAgICAgICAgaWYgKElzQ2FsbGFibGVGdW5jdGlvbihsYXN0RGF0YVNldHRlcikpIHtcbiAgICAgICAgICBjb3JlLmVudGl0eSA9IGxhc3REYXRhU2V0dGVyKGNvcmUsIGNvcmUuZW50aXR5LCBkb20pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgIH0pO1xuICB9XG5cblxuICAvKipcbiAgICogU2V0IHRoZSBiYXNlIGRlZmluaXRpb25zIGZvciBhbiBlbnRpdHlcbiAgICogRWFjaCBlbnRpdHkgbmVlZHMgdG8gZGVmaW5lIHRoZXNlIHNvIHdlIGtub3cgaG93IHRvIHRhbGsgdG8gdGhlIGFwaSBpbiByZWdhcmRzIHRvIGl0XG4gICAqIFRoZSBhcGkgc2hvdWxkIHByb3ZpZGUgdGhpcyBkZXRhaWxzIGFzIHBhcnQgb2YgdGhlIGF1dGggdG9rZW5cbiAgICogQHBhcmFtIGludGVybmFsX25hbWVcbiAgICogQHBhcmFtIGVudGl0eUlkXG4gICAqL1xuICBzZXRFbnRpdHlQYXJhbXMocGFyYW1zOiBFbnRpdHlQYXJhbXNJbnRlcmZhY2UpIHtcbiAgICBQb3BMb2cuaW5mbyh0aGlzLm5hbWUsIGBFbnRpdHkgUGFyYW1zIHNldCBmb3IgJHtwYXJhbXMuaW50ZXJuYWxfbmFtZX1gLCBwYXJhbXMpO1xuICAgIHRoaXMucGFyYW1VdGlsLnNldEVudGl0eVBhcmFtcyhwYXJhbXMpO1xuICB9XG5cblxuICAvKipcbiAgICogQXR0YWNoIGEgc2V0IG9mIHRhYiBjb25maWdzIHRvIGFuIGVudGl0eVxuICAgKiBAcGFyYW0gaW50ZXJuYWxfbmFtZVxuICAgKiBAcGFyYW0gdGFic1xuICAgKi9cbiAgc2V0RW50aXR5VGFicyhpbnRlcm5hbF9uYW1lOiBzdHJpbmcsIHRhYnM6IFRhYkNvbmZpZ1tdKSB7XG4gICAgaWYgKElzU3RyaW5nKGludGVybmFsX25hbWUsIHRydWUpICYmIEFycmF5LmlzQXJyYXkodGFicykpIHtcbiAgICAgIFBvcExvZy5pbmZvKHRoaXMubmFtZSwgYEVudGl0eSBUYWJzIHNldCBmb3IgJHtpbnRlcm5hbF9uYW1lfWAsIHRhYnMpO1xuICAgICAgdGhpcy5hc3NldC50YWJzLnNldChpbnRlcm5hbF9uYW1lLCB0YWJzKTtcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBBdHRhY2ggYSBzZXQgb2YgYWN0aW9ucyB0byBhbiBlbnRpdHlcbiAgICogQHBhcmFtIGludGVybmFsX25hbWVcbiAgICogQHBhcmFtIHRhYnNcbiAgICovXG4gIHNldEVudGl0eUFjdGlvbihpbnRlcm5hbF9uYW1lOiBzdHJpbmcsIGFjdGlvbjogRGljdGlvbmFyeTxhbnk+KTogdm9pZCB7XG4gICAgaWYgKElzU3RyaW5nKGludGVybmFsX25hbWUsIHRydWUpICYmIElzT2JqZWN0KGFjdGlvbikpIHtcbiAgICAgIFBvcExvZy5pbmZvKHRoaXMubmFtZSwgYEVudGl0eSBBY3Rpb24gc2V0IGZvciAke2ludGVybmFsX25hbWV9YCwgYWN0aW9uKTtcbiAgICAgIHRoaXMuYXNzZXQuYWN0aW9ucy5zZXQoaW50ZXJuYWxfbmFtZSwgYWN0aW9uKTtcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBBdHRhY2ggYSBzZXQgb2YgYWN0aW9ucyB0byBhbiBlbnRpdHlcbiAgICogQHBhcmFtIGludGVybmFsX25hbWVcbiAgICogQHBhcmFtIHRhYnNcbiAgICovXG4gIHNldEVudGl0eUVudHJ5QWNjZXNzKGludGVybmFsX25hbWU6IHN0cmluZywgZW50cnlBY2Nlc3M6IHN0cmluZ1tdKTogdm9pZCB7XG4gICAgaWYgKElzU3RyaW5nKGludGVybmFsX25hbWUsIHRydWUpICYmIElzQXJyYXkoZW50cnlBY2Nlc3MsIHRydWUpKSB7XG4gICAgICBQb3BMb2cuaW5mbyh0aGlzLm5hbWUsIGBFbnRpdHkgZW50cnlBY2Nlc3Mgc2V0IGZvciAke2ludGVybmFsX25hbWV9YCwgZW50cnlBY2Nlc3MpO1xuICAgICAgdGhpcy5hc3NldC5lbnRyeUFjY2Vzcy5zZXQoaW50ZXJuYWxfbmFtZSwgZW50cnlBY2Nlc3MpO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIEF0dGFjaCBhIHNldCBvZiB0YWJsZSBvcHRpb25zIGZvciBhbiBlbnRpdHlcbiAgICogQHBhcmFtIGludGVybmFsX25hbWVcbiAgICogQHBhcmFtIHRhYnNcbiAgICovXG4gIHNldEVudGl0eVRhYmxlKGludGVybmFsX25hbWU6IHN0cmluZywgdGFibGU6IEVudGl0eU1vZGVsVGFibGVJbnRlcmZhY2UpOiB2b2lkIHtcbiAgICBpZiAoSXNTdHJpbmcoaW50ZXJuYWxfbmFtZSwgdHJ1ZSkgJiYgSXNPYmplY3QodGFibGUpKSB7XG4gICAgICBQb3BMb2cuaW5mbyh0aGlzLm5hbWUsIGBFbnRpdHkgQWN0aW9uIHNldCBmb3IgJHtpbnRlcm5hbF9uYW1lfWAsIHRhYmxlKTtcbiAgICAgIHRoaXMuYXNzZXQudGFibGVzLnNldChpbnRlcm5hbF9uYW1lLCB0YWJsZSk7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogQXR0YWNoIGEgc2V0IG9mIHRhYmxlIG9wdGlvbnMgZm9yIGFuIGVudGl0eVxuICAgKiBAcGFyYW0gaW50ZXJuYWxfbmFtZVxuICAgKiBAcGFyYW0gdGFic1xuICAgKi9cbiAgc2V0RW50aXR5Um91dGUoaW50ZXJuYWxfbmFtZTogc3RyaW5nLCByb3V0ZTogU2VydmljZVJvdXRlc0ludGVyZmFjZSk6IHZvaWQge1xuICAgIGlmIChJc1N0cmluZyhpbnRlcm5hbF9uYW1lLCB0cnVlKSAmJiBJc09iamVjdChyb3V0ZSkpIHtcbiAgICAgIFBvcExvZy5pbmZvKHRoaXMubmFtZSwgYEVudGl0eSBSb3V0ZSBzZXQgZm9yICR7aW50ZXJuYWxfbmFtZX1gLCByb3V0ZSk7XG4gICAgICB0aGlzLmFzc2V0LnJvdXRlcy5zZXQoaW50ZXJuYWxfbmFtZSwgcm91dGUpO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIEF0dGFjaCBhIHNldCBvZiB0YWIgbWVudSBjb25maWdzIHRvIGFuIGVudGl0eVxuICAgKiBAcGFyYW0gaW50ZXJuYWxfbmFtZVxuICAgKiBAcGFyYW0gdGFic1xuICAgKi9cbiAgc2V0RW50aXR5TWVudShpbnRlcm5hbF9uYW1lOiBzdHJpbmcsIG1lbnU6IEVudGl0eU1vZGVsTWVudUludGVyZmFjZSk6IHZvaWQge1xuICAgIGlmIChJc1N0cmluZyhpbnRlcm5hbF9uYW1lLCB0cnVlKSAmJiBJc09iamVjdChtZW51LCB0cnVlKSkge1xuICAgICAgUG9wTG9nLmluZm8odGhpcy5uYW1lLCBgRW50aXR5IE1lbnUgc2V0IGZvciAke2ludGVybmFsX25hbWV9YCwgbWVudSk7XG4gICAgICB0aGlzLmFzc2V0Lm1lbnVzLnNldChpbnRlcm5hbF9uYW1lLCBtZW51KTtcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBBdHRhY2ggYSBzZXQgb2YgcmVzb3VyY2VzIHRvIGFuIGVudGl0eVxuICAgKiBAcGFyYW0gaW50ZXJuYWxfbmFtZVxuICAgKiBAcGFyYW0gdGFic1xuICAgKi9cbiAgc2V0RW50aXR5UmVzb3VyY2UoaW50ZXJuYWxfbmFtZTogc3RyaW5nLCByZXNvdXJjZTogRGljdGlvbmFyeTxSZXNvdXJjZUludGVyZmFjZT4pOiB2b2lkIHtcbiAgICBpZiAoSXNTdHJpbmcoaW50ZXJuYWxfbmFtZSwgdHJ1ZSkgJiYgSXNPYmplY3QocmVzb3VyY2UpKSB7XG4gICAgICBQb3BMb2cuaW5mbyh0aGlzLm5hbWUsIGBFbnRpdHkgUmVzb3VyY2Ugc2V0IGZvciAke2ludGVybmFsX25hbWV9YCwgcmVzb3VyY2UpO1xuICAgICAgdGhpcy5hc3NldC5yZXNvdXJjZXMuc2V0KGludGVybmFsX25hbWUsIHJlc291cmNlKTtcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBBdHRhY2ggYSBkYXRhIGRlY29yYXRvciB0aGF0IG11dGF0ZXMgZW50aXR5IGRhdGEgcmVzcG9uc2VcbiAgICogQHBhcmFtIGludGVybmFsX25hbWVcbiAgICogQHBhcmFtIHRhYnNcbiAgICovXG4gIHNldEVudGl0eURlY29yYXRvcihpbnRlcm5hbF9uYW1lOiBzdHJpbmcsIGRlY29yYXRvcjogRGF0YURlY29yYXRvcik6IHZvaWQge1xuICAgIGlmIChJc1N0cmluZyhpbnRlcm5hbF9uYW1lLCB0cnVlKSAmJiBJc0NhbGxhYmxlRnVuY3Rpb24oZGVjb3JhdG9yKSkge1xuICAgICAgUG9wTG9nLmluZm8odGhpcy5uYW1lLCBgRW50aXR5IERlY29yYXRvciBzZXQgZm9yICR7aW50ZXJuYWxfbmFtZX1gLCBkZWNvcmF0b3IudG9TdHJpbmcoKSk7XG4gICAgICB0aGlzLmFzc2V0LmRlY29yYXRvci5zZXQoaW50ZXJuYWxfbmFtZSwgZGVjb3JhdG9yKTtcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBBdHRhY2ggYSBkYXRhIGRlY29yYXRvciB0aGF0IG11dGF0ZXMgZW50aXR5IGRhdGEgcmVzcG9uc2VcbiAgICogQHBhcmFtIGludGVybmFsX25hbWVcbiAgICogQHBhcmFtIHRhYnNcbiAgICovXG4gIHNldEVudGl0eURhdGFTZXR0ZXIoaW50ZXJuYWxfbmFtZTogc3RyaW5nLCBkYXRhU2V0dGVyOiBEYXRhU2V0dGVyKTogdm9pZCB7XG4gICAgaWYgKElzU3RyaW5nKGludGVybmFsX25hbWUsIHRydWUpICYmIElzQ2FsbGFibGVGdW5jdGlvbihkYXRhU2V0dGVyKSkge1xuICAgICAgUG9wTG9nLmluZm8odGhpcy5uYW1lLCBgRW50aXR5IERhdGEgU2V0dGVyIHNldCBmb3IgJHtpbnRlcm5hbF9uYW1lfWAsIGRhdGFTZXR0ZXIudG9TdHJpbmcoKSk7XG4gICAgICB0aGlzLmFzc2V0LmRhdGFTZXR0ZXIuc2V0KGludGVybmFsX25hbWUsIGRhdGFTZXR0ZXIpO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIEF0dGFjaCBhIGRhdGEgZGVjb3JhdG9yIHRoYXQgbXV0YXRlcyBlbnRpdHkgZGF0YSByZXNwb25zZVxuICAgKiBAcGFyYW0gaW50ZXJuYWxfbmFtZVxuICAgKiBAcGFyYW0gdGFic1xuICAgKi9cbiAgc2V0TGFzdEVudGl0eURhdGFTZXR0ZXIoaW50ZXJuYWxfbmFtZTogc3RyaW5nLCBkYXRhU2V0dGVyOiBEYXRhU2V0dGVyKTogdm9pZCB7XG4gICAgaWYgKElzU3RyaW5nKGludGVybmFsX25hbWUsIHRydWUpICYmIElzQ2FsbGFibGVGdW5jdGlvbihkYXRhU2V0dGVyKSkge1xuICAgICAgUG9wTG9nLmluZm8odGhpcy5uYW1lLCBgRW50aXR5IExhc3QgRGF0YSBTZXR0ZXIgIHNldCBmb3IgJHtpbnRlcm5hbF9uYW1lfWAsIGRhdGFTZXR0ZXIudG9TdHJpbmcoKSk7XG4gICAgICB0aGlzLmFzc2V0Lmxhc3REYXRhU2V0dGVyLnNldChpbnRlcm5hbF9uYW1lLCBkYXRhU2V0dGVyKTtcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBBdHRhY2ggYSBkYXRhIGZpbHRlciB0byBsaW1pdCB0aGUgZW50aXR5IGRhdGEgcmVzcG9uc2VcbiAgICogQHBhcmFtIGludGVybmFsX25hbWVcbiAgICogQHBhcmFtIHRhYnNcbiAgICovXG4gIHNldEVudGl0eUZpbHRlcihpbnRlcm5hbF9uYW1lOiBzdHJpbmcsIGZpbHRlcjogRGF0YUZpbHRlcik6IHZvaWQge1xuICAgIGlmIChJc1N0cmluZyhpbnRlcm5hbF9uYW1lLCB0cnVlKSAmJiBJc0NhbGxhYmxlRnVuY3Rpb24oZmlsdGVyKSkge1xuICAgICAgUG9wTG9nLmluZm8odGhpcy5uYW1lLCBgRW50aXR5IEZpbHRlciBzZXQgZm9yICR7aW50ZXJuYWxfbmFtZX1gLCBmaWx0ZXIudG9TdHJpbmcoKSk7XG4gICAgICB0aGlzLmFzc2V0LmZpbHRlci5zZXQoaW50ZXJuYWxfbmFtZSwgZmlsdGVyKTtcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBBdHRhY2ggYSBzZXQgb2YgZmllbGRzIHRvIGFuIGVudGl0eVxuICAgKiBAcGFyYW0gaW50ZXJuYWxfbmFtZVxuICAgKiBAcGFyYW0gdGFic1xuICAgKi9cbiAgc2V0RW50aXR5RmllbGQoaW50ZXJuYWxfbmFtZTogc3RyaW5nLCBmaWVsZDogRGljdGlvbmFyeTxhbnk+KTogdm9pZCB7XG4gICAgaWYgKElzU3RyaW5nKGludGVybmFsX25hbWUsIHRydWUpICYmIElzT2JqZWN0KGZpZWxkKSkge1xuICAgICAgUG9wTG9nLmluZm8odGhpcy5uYW1lLCBgRW50aXR5IEZpZWxkIHNldCBmb3IgJHtpbnRlcm5hbF9uYW1lfWAsIGZpZWxkKTtcbiAgICAgIHRoaXMuYXNzZXQuZmllbGRzLnNldChpbnRlcm5hbF9uYW1lLCBmaWVsZCk7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogR2V0IGV4dGVuZGVkIGZpZWxkcyBhdHRhY2hlZCB0byBhbiBlbnRpdHlcbiAgICogQHBhcmFtIGludGVybmFsX25hbWVcbiAgICogQHBhcmFtIHRhYnNcbiAgICovXG4gIGdldEVudGl0eUZpZWxkKGludGVybmFsX25hbWU6IHN0cmluZyk6IERpY3Rpb25hcnk8YW55PiB7XG4gICAgaWYgKElzU3RyaW5nKGludGVybmFsX25hbWUsIHRydWUpKSB7XG4gICAgICBjb25zdCBmaWVsZCA9IHRoaXMuYXNzZXQuZmllbGRzLmdldChpbnRlcm5hbF9uYW1lKTtcbiAgICAgIHJldHVybiBmaWVsZCA/IGZpZWxkIDoge307XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBlbnRyeSBhY2Nlc3MgZm9yIGFuIGVudGl0eVxuICAgKiBAcGFyYW0gaW50ZXJuYWxfbmFtZVxuICAgKiBAcGFyYW0gdGFic1xuICAgKi9cbiAgZ2V0RW50aXR5RW50cnlBY2Nlc3MoaW50ZXJuYWxfbmFtZTogc3RyaW5nKTogRGljdGlvbmFyeTxhbnk+IHtcbiAgICBpZiAoSXNTdHJpbmcoaW50ZXJuYWxfbmFtZSwgdHJ1ZSkpIHtcbiAgICAgIGNvbnN0IGVudHJ5QWNjZXNzID0gdGhpcy5hc3NldC5lbnRyeUFjY2Vzcy5nZXQoaW50ZXJuYWxfbmFtZSk7XG4gICAgICByZXR1cm4gSXNBcnJheShlbnRyeUFjY2VzcywgdHJ1ZSkgPyBlbnRyeUFjY2VzcyA6IFtdO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIEdldCBleHRlbmRlZCBmaWVsZHMgYXR0YWNoZWQgdG8gYW4gZW50aXR5XG4gICAqIEBwYXJhbSBpbnRlcm5hbF9uYW1lXG4gICAqIEBwYXJhbSB0YWJzXG4gICAqL1xuICBnZXRFbnRpdHlSZXNvdXJjZShpbnRlcm5hbF9uYW1lOiBzdHJpbmcpOiBEaWN0aW9uYXJ5PFJlc291cmNlSW50ZXJmYWNlPiB7XG4gICAgaWYgKElzU3RyaW5nKGludGVybmFsX25hbWUsIHRydWUpKSB7XG4gICAgICBjb25zdCByZXNvdXJjZSA9IHRoaXMuYXNzZXQucmVzb3VyY2VzLmdldChpbnRlcm5hbF9uYW1lKTtcbiAgICAgIHJldHVybiByZXNvdXJjZSA/IHJlc291cmNlIDoge307XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogR2V0IGVudGl0eSBkYXRhIGRlY29yYXRvclxuICAgKiBAcGFyYW0gaW50ZXJuYWxfbmFtZVxuICAgKiBAcGFyYW0gdGFic1xuICAgKi9cbiAgZ2V0RW50aXR5RGVjb3JhdG9yKGludGVybmFsX25hbWU6IHN0cmluZyk6IERhdGFEZWNvcmF0b3Ige1xuICAgIGlmIChJc1N0cmluZyhpbnRlcm5hbF9uYW1lLCB0cnVlKSkge1xuICAgICAgY29uc3QgZGVjb3JhdG9yID0gdGhpcy5hc3NldC5kZWNvcmF0b3IuZ2V0KGludGVybmFsX25hbWUpO1xuICAgICAgcmV0dXJuIElzQ2FsbGFibGVGdW5jdGlvbihkZWNvcmF0b3IpID8gZGVjb3JhdG9yIDogbnVsbDtcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBHZXQgZW50aXR5IGRhdGEgZGVjb3JhdG9yXG4gICAqIEBwYXJhbSBpbnRlcm5hbF9uYW1lXG4gICAqIEBwYXJhbSB0YWJzXG4gICAqL1xuICBnZXRFbnRpdHlEYXRhU2V0dGVyKGludGVybmFsX25hbWU6IHN0cmluZyk6IERhdGFTZXR0ZXIge1xuICAgIGlmIChJc1N0cmluZyhpbnRlcm5hbF9uYW1lLCB0cnVlKSkge1xuICAgICAgY29uc3QgZGF0YVNldHRlciA9IHRoaXMuYXNzZXQuZGF0YVNldHRlci5nZXQoaW50ZXJuYWxfbmFtZSk7XG4gICAgICByZXR1cm4gSXNDYWxsYWJsZUZ1bmN0aW9uKGRhdGFTZXR0ZXIpID8gZGF0YVNldHRlciA6IG51bGw7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogR2V0IGVudGl0eSBkYXRhIGRlY29yYXRvclxuICAgKiBAcGFyYW0gaW50ZXJuYWxfbmFtZVxuICAgKiBAcGFyYW0gdGFic1xuICAgKi9cbiAgZ2V0RW50aXR5TGFzdERhdGFTZXR0ZXIoaW50ZXJuYWxfbmFtZTogc3RyaW5nKTogRGF0YVNldHRlciB7XG4gICAgaWYgKElzU3RyaW5nKGludGVybmFsX25hbWUsIHRydWUpKSB7XG4gICAgICBjb25zdCBsYXN0RGF0YVNldHRlciA9IHRoaXMuYXNzZXQubGFzdERhdGFTZXR0ZXIuZ2V0KGludGVybmFsX25hbWUpO1xuICAgICAgcmV0dXJuIElzQ2FsbGFibGVGdW5jdGlvbihsYXN0RGF0YVNldHRlcikgPyBsYXN0RGF0YVNldHRlciA6IG51bGw7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogR2V0IGVudGl0eSBkYXRhIGRlY29yYXRvclxuICAgKiBAcGFyYW0gaW50ZXJuYWxfbmFtZVxuICAgKiBAcGFyYW0gdGFic1xuICAgKi9cbiAgZ2V0RW50aXR5RmlsdGVyKGludGVybmFsX25hbWU6IHN0cmluZyk6IERhdGFGaWx0ZXIge1xuICAgIGlmIChJc1N0cmluZyhpbnRlcm5hbF9uYW1lLCB0cnVlKSkge1xuICAgICAgY29uc3QgZmlsdGVyID0gdGhpcy5hc3NldC5maWx0ZXIuZ2V0KGludGVybmFsX25hbWUpO1xuICAgICAgcmV0dXJuIElzQ2FsbGFibGVGdW5jdGlvbihmaWx0ZXIpID8gZmlsdGVyIDogbnVsbDtcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBHZXQgZXh0ZW5kZWQgYWN0aW9ucyBhdHRhY2hlZCB0byBhbiBlbnRpdHlcbiAgICogQHBhcmFtIGludGVybmFsX25hbWVcbiAgICogQHBhcmFtIHRhYnNcbiAgICovXG4gIGdldEVudGl0eUFjdGlvbihpbnRlcm5hbF9uYW1lOiBzdHJpbmcpOiBEaWN0aW9uYXJ5PGFueT4ge1xuICAgIGlmIChJc1N0cmluZyhpbnRlcm5hbF9uYW1lLCB0cnVlKSkge1xuICAgICAgY29uc3QgYWN0aW9uID0gdGhpcy5hc3NldC5hY3Rpb25zLmdldChpbnRlcm5hbF9uYW1lKTtcbiAgICAgIHJldHVybiBhY3Rpb24gPyBhY3Rpb24gOiB7fTtcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBHZXQgZXh0ZW5kZWQgdGFibGUgYXR0YWNoZWQgdG8gYW4gZW50aXR5XG4gICAqIEBwYXJhbSBpbnRlcm5hbF9uYW1lXG4gICAqIEBwYXJhbSB0YWJzXG4gICAqL1xuICBnZXRFbnRpdHlUYWJsZShpbnRlcm5hbF9uYW1lOiBzdHJpbmcpOiBFbnRpdHlNb2RlbFRhYmxlSW50ZXJmYWNlIHtcbiAgICBpZiAoSXNTdHJpbmcoaW50ZXJuYWxfbmFtZSwgdHJ1ZSkpIHtcbiAgICAgIGNvbnN0IHRhYmxlID0gdGhpcy5hc3NldC50YWJsZXMuZ2V0KGludGVybmFsX25hbWUpO1xuICAgICAgcmV0dXJuIHRhYmxlID8gdGFibGUgOiB7fTtcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBHZXQgZXh0ZW5kZWQgdGFibGUgYXR0YWNoZWQgdG8gYW4gZW50aXR5XG4gICAqIEBwYXJhbSBpbnRlcm5hbF9uYW1lXG4gICAqIEBwYXJhbSB0YWJzXG4gICAqL1xuICBnZXRFbnRpdHlSb3V0ZShpbnRlcm5hbF9uYW1lOiBzdHJpbmcpOiBTZXJ2aWNlUm91dGVzSW50ZXJmYWNlIHtcbiAgICBpZiAoSXNTdHJpbmcoaW50ZXJuYWxfbmFtZSwgdHJ1ZSkpIHtcbiAgICAgIGNvbnN0IHJvdXRlID0gdGhpcy5hc3NldC5yb3V0ZXMuZ2V0KGludGVybmFsX25hbWUpO1xuICAgICAgcmV0dXJuIHJvdXRlID8gcm91dGUgOiB7fTtcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBHZXQgZXh0ZW5kZWQgdGFibGUgYXR0YWNoZWQgdG8gYW4gZW50aXR5XG4gICAqIEBwYXJhbSBpbnRlcm5hbF9uYW1lXG4gICAqIEBwYXJhbSB0YWJzXG4gICAqL1xuICBnZXRFbnRpdHlNZW51KGludGVybmFsX25hbWU6IHN0cmluZyk6IEVudGl0eU1vZGVsTWVudUludGVyZmFjZSB7XG4gICAgaWYgKElzU3RyaW5nKGludGVybmFsX25hbWUsIHRydWUpKSB7XG4gICAgICBjb25zdCBhY3Rpb24gPSB0aGlzLmFzc2V0Lm1lbnVzLmdldChpbnRlcm5hbF9uYW1lKTtcbiAgICAgIHJldHVybiBhY3Rpb24gPyBhY3Rpb24gOiB7fTtcbiAgICB9XG4gIH1cblxuXG4gIGJ1c3RBbGxDYWNoZSgpIHtcbiAgICB0aGlzLmFzc2V0LnJlcG8uZm9yRWFjaCgocmVwbzogUG9wRW50aXR5UmVwb1NlcnZpY2UsIGtleTogc3RyaW5nKSA9PiB7XG4gICAgICBQb3BMb2cuaW5pdCh0aGlzLm5hbWUsIGBCdXN0IGNhY2hlIGZvciAke3JlcG8uZ2V0SW50ZXJuYWxOYW1lKCl9YCk7XG4gICAgICByZXBvLmNsZWFyQWxsQ2FjaGUoJ2J1c3RBbGxDYWNoZScpO1xuICAgIH0pO1xuICB9XG5cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICBjb25zb2xlLmxvZyh0aGlzLm5hbWUsIGBkZXN0cm95ZWQ6JHt0aGlzLmlkfWApO1xuICB9XG5cblxuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFVuZGVyIFRoZSBIb29kICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICggUHJpdmF0ZSBNZXRob2QgKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuXG4gIC8qKlxuICAgKiBUaGlzIHdpbGwgZG8gYWxsIG9mIHRoZSB3b3JrIG9mIGJ1aWxkaW5nIGFuZCBzdG9yaW5nIHRoZSBiYXNlIGNvbmZpZyBmb3IgZWFjaCBlbnRpdHlcbiAgICogQHBhcmFtIGludGVybmFsX25hbWVcbiAgICogQHBhcmFtIHJvdXRlc1xuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcHJpdmF0ZSBfZ2V0QmFzZUNvcmVDb25maWcoaW50ZXJuYWxfbmFtZTogc3RyaW5nKTogUHJvbWlzZTxDb3JlQ29uZmlnPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jIChyZXNvbHZlKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuYXNzZXQuYmFzZS5oYXMoaW50ZXJuYWxfbmFtZSkpIHtcbiAgICAgICAgY29uc3QgcGFyYW1zID0gdGhpcy5nZXRFbnRpdHlQYXJhbXMoaW50ZXJuYWxfbmFtZSk7XG4gICAgICAgIGNvbnN0IGNvcmUgPSBuZXcgQ29yZUNvbmZpZyh7XG4gICAgICAgICAgcGFyYW1zOiBJc09iamVjdFRocm93RXJyb3IocGFyYW1zLCB0cnVlLCBgQ291bGQgbm90IHJlc29sdmUgcGFyYW1zIGZvciAke2ludGVybmFsX25hbWV9YCkgPyBwYXJhbXMgOiBudWxsLFxuICAgICAgICB9KTtcbiAgICAgICAgY29yZS5mbGFnID0ge3JvdXRlQ2hlY2s6IElzQWxpYXNhYmxlKGludGVybmFsX25hbWUpLCBhc3NldENoZWNrOiB0cnVlLCBtb2RhbENoZWNrOiBmYWxzZSwgcmVmcmVzaENoZWNrOiBmYWxzZX07XG4gICAgICAgIGNvcmUuYWNjZXNzID0gdGhpcy5fZ2V0RW50aXR5QWNjZXNzKGNvcmUucGFyYW1zKTtcbiAgICAgICAgY29yZS5jaGFubmVsID0gbmV3IEV2ZW50RW1pdHRlcjxQb3BCYXNlRXZlbnRJbnRlcmZhY2U+KCk7XG4gICAgICAgIGNvcmUucmVwbyA9IHRoaXMuX2dldEVudGl0eVJlcG8oY29yZS5wYXJhbXMpO1xuICAgICAgICBjb3JlLnJlcG8ubW9kZWwgPSB7XG4gICAgICAgICAgYWN0aW9uOiBEZWVwTWVyZ2UoSnNvbkNvcHkoRGVmYXVsdEVudGl0eUFjdGlvbiksIHRoaXMuZ2V0RW50aXR5QWN0aW9uKGNvcmUucGFyYW1zLmludGVybmFsX25hbWUpKSxcbiAgICAgICAgICBkYXRhU2V0dGVyOiB0aGlzLmdldEVudGl0eURhdGFTZXR0ZXIoY29yZS5wYXJhbXMuaW50ZXJuYWxfbmFtZSksXG4gICAgICAgICAgbGFzdERhdGFTZXR0ZXI6IHRoaXMuZ2V0RW50aXR5TGFzdERhdGFTZXR0ZXIoY29yZS5wYXJhbXMuaW50ZXJuYWxfbmFtZSksXG4gICAgICAgICAgZGVjb3JhdG9yOiB0aGlzLmdldEVudGl0eURlY29yYXRvcihjb3JlLnBhcmFtcy5pbnRlcm5hbF9uYW1lKSxcbiAgICAgICAgICBmaWx0ZXI6IHRoaXMuZ2V0RW50aXR5RmlsdGVyKGNvcmUucGFyYW1zLmludGVybmFsX25hbWUpLFxuICAgICAgICAgIHRhYmxlOiBEZWVwTWVyZ2UoSnNvbkNvcHkoRGVmYXVsdEVudGl0eVRhYmxlKSwgdGhpcy5nZXRFbnRpdHlUYWJsZShjb3JlLnBhcmFtcy5pbnRlcm5hbF9uYW1lKSksXG4gICAgICAgICAgZmllbGQ6IHsuLi5EZWVwTWVyZ2UoRGVmYXVsdEVudGl0eUZpZWxkKSwgLi4udGhpcy5nZXRFbnRpdHlGaWVsZChjb3JlLnBhcmFtcy5pbnRlcm5hbF9uYW1lKX0sXG4gICAgICAgICAgcmVzb3VyY2U6IERlZXBNZXJnZShKc29uQ29weShEZWZhdWx0RW50aXR5UmVzb3VyY2UpLCB0aGlzLmdldEVudGl0eVJlc291cmNlKGNvcmUucGFyYW1zLmludGVybmFsX25hbWUpKSxcbiAgICAgICAgICByb3V0ZTogRGVlcE1lcmdlKEpzb25Db3B5KERlZmF1bHRFbnRpdHlSb3V0ZSksIHRoaXMuZ2V0RW50aXR5Um91dGUoY29yZS5wYXJhbXMuaW50ZXJuYWxfbmFtZSkpLFxuICAgICAgICAgIG1lbnU6IERlZXBNZXJnZShKc29uQ29weShEZWZhdWx0RW50aXR5TWVudSksIHRoaXMuZ2V0RW50aXR5TWVudShjb3JlLnBhcmFtcy5pbnRlcm5hbF9uYW1lKSlcbiAgICAgICAgfTtcbiAgICAgICAgY29yZS5yZXBvLnNldFJvdXRlcyhJbnRlcnBvbGF0ZUVudGl0eVJvdXRlcyhjb3JlLnJlcG8ubW9kZWwucm91dGUsIGNvcmUucGFyYW1zKSk7XG5cbiAgICAgICAgYXdhaXQgZm9ya0pvaW4oW3RoaXMuX2dldEVudGl0eUNvbmZpZyhjb3JlLCBpbnRlcm5hbF9uYW1lKSwgY29yZS5yZXBvLmdldFByZWZlcmVuY2VzKGNvcmUpXSkuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgICB0aGlzLmFzc2V0LmJhc2Uuc2V0KGludGVybmFsX25hbWUsIGNvcmUpO1xuICAgICAgICAgIHJldHVybiByZXNvbHZlKHsuLi50aGlzLmFzc2V0LmJhc2UuZ2V0KGludGVybmFsX25hbWUpfSk7XG4gICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZSh7Li4udGhpcy5hc3NldC5iYXNlLmdldChpbnRlcm5hbF9uYW1lKX0pO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiByZXNvbHZlKHsuLi50aGlzLmFzc2V0LmJhc2UuZ2V0KGludGVybmFsX25hbWUpfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGFuIGVudGl0eSByZXBvIGNsYXNzIGZvciBhIHNwZWNpZmljIGVudGl0eVxuICAgKiBUaGlzIGlzIGludGVuZGVkIHRvIGJlIHJ1biB3aGVuIGEgQ29yZUNvbmZpZyBpcyByZXF1ZXN0ZWQgZm9yIGFuIGVudGl0eSwgb25jZSBjcmVhdGVkIGl0IHdpbGwgYmUgc3RvcmVkIGFuZCByZXVzZWRcbiAgICpcbiAgICogQHBhcmFtIGVudGl0eVBhcmFtc1xuICAgKiBAcGFyYW0gcm91dGVzXG4gICAqL1xuICBwcml2YXRlIF9nZXRFbnRpdHlSZXBvKGVudGl0eVBhcmFtczogRW50aXR5UGFyYW1zKTogUG9wRW50aXR5UmVwb1NlcnZpY2Uge1xuICAgIGxldCByZXBvID0gbnVsbDtcbiAgICBpZiAoSXNPYmplY3QoZW50aXR5UGFyYW1zLCB0cnVlKSkge1xuICAgICAgaWYgKHRoaXMuYXNzZXQucmVwby5oYXMoZW50aXR5UGFyYW1zLmludGVybmFsX25hbWUpKSB7XG4gICAgICAgIHJlcG8gPSB0aGlzLmFzc2V0LnJlcG8uZ2V0KGVudGl0eVBhcmFtcy5pbnRlcm5hbF9uYW1lKTtcbiAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgcmVwbyA9IG5ldyBQb3BFbnRpdHlSZXBvU2VydmljZSgpO1xuICAgICAgICByZXBvLnJlZ2lzdGVyKGVudGl0eVBhcmFtcyk7XG4gICAgICAgIHRoaXMuYXNzZXQucmVwby5zZXQoZW50aXR5UGFyYW1zLmludGVybmFsX25hbWUsIHJlcG8pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXBvO1xuICB9XG5cblxuICAvKipcbiAgICogR2V0IHRoZSBjcnVkIGFjY2VzcyB0aGF0IGlzIGFzc29jaWF0ZWQgdG8gYSBzcGVjaWZpYyBlbnRpdHlcbiAgICogVGhpcyBpcyBpbnRlbmRlZCB0byBiZSBydW4gd2hlbiBhIENvcmVDb25maWcgaXMgcmVxdWVzdGVkIGZvciBhbiBlbnRpdHksIG9uY2UgY3JlYXRlZCBpdCB3aWxsIGJlIHN0b3JlZCBhbmQgcmV1c2VkXG4gICAqIEBwYXJhbSBlbnRpdHlQYXJhbXNcbiAgICovXG5cbiAgcHJpdmF0ZSBfZ2V0RW50aXR5QWNjZXNzKGVudGl0eVBhcmFtczogRW50aXR5UGFyYW1zKTogRW50aXR5QWNjZXNzSW50ZXJmYWNlIHtcbiAgICBsZXQgZW50aXR5QWNjZXNzID0gbnVsbDtcbiAgICBpZiAoSXNPYmplY3QoZW50aXR5UGFyYW1zLCB0cnVlKSkge1xuICAgICAgZW50aXR5QWNjZXNzID0gdGhpcy5wYXJhbVV0aWwuZ2V0QWNjZXNzKGVudGl0eVBhcmFtcy5pbnRlcm5hbF9uYW1lKTtcbiAgICAgIGlmICh0aGlzLmFzc2V0LmFjY2Vzcy5oYXMoZW50aXR5UGFyYW1zLmludGVybmFsX25hbWUpKSB7XG4gICAgICAgIGVudGl0eUFjY2VzcyA9IHsuLi50aGlzLmFzc2V0LmFjY2Vzcy5nZXQoZW50aXR5UGFyYW1zLmludGVybmFsX25hbWUpfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVudGl0eUFjY2VzcyA9IHRoaXMucGFyYW1VdGlsLmdldEFjY2VzcyhlbnRpdHlQYXJhbXMuaW50ZXJuYWxfbmFtZSk7XG4gICAgICAgIGlmIChlbnRpdHlBY2Nlc3MpIHtcbiAgICAgICAgICB0aGlzLmFzc2V0LmFjY2Vzcy5zZXQoZW50aXR5UGFyYW1zLmludGVybmFsX25hbWUsIDxFbnRpdHlBY2Nlc3NJbnRlcmZhY2U+ey4uLmVudGl0eUFjY2Vzc30pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGVudGl0eUFjY2VzcztcbiAgfVxuXG5cbiAgcHJpdmF0ZSBfZ2V0RW50aXR5Q29uZmlnKGNvcmU6IENvcmVDb25maWcsIGludGVybmFsX25hbWU6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgY29yZS5yZXBvLmdldENvbmZpZygpLnN1YnNjcmliZSgocmVzOiBhbnkpID0+IHtcbiAgICAgICAgLy8gdGhpcy5nZXRKc29uTW9kZWwoaW50ZXJuYWxfbmFtZSkudGhlbigocmVzOiBhbnkpID0+IHtcbiAgICAgICAgbGV0IEFwaU1vZGVscyA9IHJlcy5kYXRhID8gcmVzLmRhdGEgOiByZXM7XG4gICAgICAgIEFwaU1vZGVscyA9IEFwaU1vZGVscy5tb2RlbCA/IEFwaU1vZGVscy5tb2RlbCA6IEFwaU1vZGVscztcbiAgICAgICAgaWYgKCFJc09iamVjdChBcGlNb2RlbHMpKSB7XG4gICAgICAgICAgQXBpTW9kZWxzID0ge307XG4gICAgICAgIH1cbiAgICAgICAgY29yZS5yZXBvLm1vZGVsID0ge1xuICAgICAgICAgIC4uLmNvcmUucmVwby5tb2RlbCxcbiAgICAgICAgICAuLi5BcGlNb2RlbHMgLy8gIEdpdmVzIHRoZSBhcGkgdGhlIGFiaWxpdHkgdG8gc2VuZCBvdmVyIGRhdGEsIHN0dWIgZm9yIGZ1dHVyZSBmZWF0dXJlc1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH0sICgpID0+IHtcbiAgICAgICAgcmV0dXJuIHJlc29sdmUoZmFsc2UpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxufVxuXG5cbiJdfQ==