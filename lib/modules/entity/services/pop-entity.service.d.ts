import { OnDestroy } from '@angular/core';
import { PopEntityRepoService } from './pop-entity-repo.service';
import { TabConfig } from '../../base/pop-tab-menu/tab-menu.model';
import { ActivatedRoute } from '@angular/router';
import { CoreConfig, DataDecorator, DataFilter, DataSetter, Dictionary, Entity, EntityExtendInterface, EntityModelInterface, EntityModelMenuInterface, EntityModelTableInterface, EntityParams, EntityParamsInterface, QueryParamsInterface, ResourceInterface, ServiceRoutesInterface } from '../../../pop-common.model';
import { PopEntityUtilFieldService } from './pop-entity-util-field.service';
import { PopDomService } from '../../../services/pop-dom.service';
import { PopEntityUtilParamService } from './pop-entity-util-param.service';
export declare class PopEntityService implements OnDestroy {
    private fieldUtil;
    private paramUtil;
    private name;
    private id;
    private asset;
    /**
     * This srv is used in the
     * @param env
     */
    constructor(fieldUtil: PopEntityUtilFieldService, paramUtil: PopEntityUtilParamService);
    /**
     * Check a specific crud access against an entity
     * @param internal_name
     * @param accessType
     */
    checkAccess(internal_name: string, accessType: string): boolean;
    /**
     * Configure/Extend the default behavior of an entity
     * @param internal_name
     * @param extend
     */
    configure(internal_name: string, extend: EntityModelInterface): void;
    /**
     * A method to get a Core Config for an entity
     * Uses cache service to improve performance
     * ALL ENTITY RELATED COMPONENTS RELY ON THIS !!!!
     * @param entityParams
     * @param metadata
     */
    getCoreConfig(internal_name: string, entityId?: number, dom?: PopDomService): Promise<CoreConfig>;
    /**
     * Preferences are something that might change in the base configs, keep them there for now since they will not change often
     * Note: Moved preferences to base configs since they are not playing nice with cache and I want to update them directly
     * @param internal_name
     * @param key
     * @param value
     */
    updateBaseCoreConfig(internal_name: string, key: string, value: any): boolean;
    /**
     * Get the base set of the entity definitions
     * These is the starting point when it comes to entities
     * @param internal_name
     * @param entityId
     */
    getEntityParams(internal_name: string, entityId?: number): EntityParams;
    /**
     * Get the entity repo
     * These is the starting point when it comes to entities
     * @param internal_name
     * @param entityId
     */
    getEntityRepo(internal_name: string): Promise<PopEntityRepoService>;
    /**
     * Get the entity params that are associated with a angular route ie.. /admin/accounts should resolve to the account params
     * @param api_path
     * @param id
     */
    getEntityParamsWithPath(api_path: string, id?: any): EntityParams;
    /**
     * A helper function that fetches an entity internal name from an Active Route
     * This is a way to ask based of the current route what entity am I dealing with
     * @param route
     * @param extension
     */
    getRouteInternalName(route: ActivatedRoute, extension?: EntityExtendInterface): string;
    /**
     * A helper function that fetches an entity Id from an Active Route
     * This is a way to ask based of the current route what entity am I dealing with
     * @param route
     * @param extension
     */
    getRouteParentId(route: ActivatedRoute, extension?: EntityExtendInterface): any;
    /**
     * Get the set of tab configs that belong to an entity
     */
    getEntityTabs(core?: CoreConfig): TabConfig[];
    /**
     * A method that refreshes just the entity on an CoreConfig
     * Will automatically update the entity on the entity config
     * @param config
     * @param queryParams
     */
    refreshCoreEntity(core: CoreConfig, dom: PopDomService, queryParams: QueryParamsInterface): Promise<Entity>;
    /**
     * This function is responsible to make sure the CoreConfig has resources to do its job
     * IE... If a field request a data set , this function should make sure that it is available
     * @param core
     * @param dom
     * @private
     */
    setCoreDomAssets(core: CoreConfig, dom?: PopDomService): Promise<boolean>;
    /**
     * Set the base definitions for an entity
     * Each entity needs to define these so we know how to talk to the api in regards to it
     * The api should provide this details as part of the auth token
     * @param internal_name
     * @param entityId
     */
    setEntityParams(params: EntityParamsInterface): void;
    /**
     * Attach a set of tab configs to an entity
     * @param internal_name
     * @param tabs
     */
    setEntityTabs(internal_name: string, tabs: TabConfig[]): void;
    /**
     * Attach a set of actions to an entity
     * @param internal_name
     * @param tabs
     */
    setEntityAction(internal_name: string, action: Dictionary<any>): void;
    /**
     * Attach a set of actions to an entity
     * @param internal_name
     * @param tabs
     */
    setEntityEntryAccess(internal_name: string, entryAccess: string[]): void;
    /**
     * Attach a set of table options for an entity
     * @param internal_name
     * @param tabs
     */
    setEntityTable(internal_name: string, table: EntityModelTableInterface): void;
    /**
     * Attach a set of table options for an entity
     * @param internal_name
     * @param tabs
     */
    setEntityRoute(internal_name: string, route: ServiceRoutesInterface): void;
    /**
     * Attach a set of tab menu configs to an entity
     * @param internal_name
     * @param tabs
     */
    setEntityMenu(internal_name: string, menu: EntityModelMenuInterface): void;
    /**
     * Attach a set of resources to an entity
     * @param internal_name
     * @param tabs
     */
    setEntityResource(internal_name: string, resource: Dictionary<ResourceInterface>): void;
    /**
     * Attach a data decorator that mutates entity data response
     * @param internal_name
     * @param tabs
     */
    setEntityDecorator(internal_name: string, decorator: DataDecorator): void;
    /**
     * Attach a data decorator that mutates entity data response
     * @param internal_name
     * @param tabs
     */
    setEntityDataSetter(internal_name: string, dataSetter: DataSetter): void;
    /**
     * Attach a data decorator that mutates entity data response
     * @param internal_name
     * @param tabs
     */
    setLastEntityDataSetter(internal_name: string, dataSetter: DataSetter): void;
    /**
     * Attach a data filter to limit the entity data response
     * @param internal_name
     * @param tabs
     */
    setEntityFilter(internal_name: string, filter: DataFilter): void;
    /**
     * Attach a set of fields to an entity
     * @param internal_name
     * @param tabs
     */
    setEntityField(internal_name: string, field: Dictionary<any>): void;
    /**
     * Get extended fields attached to an entity
     * @param internal_name
     * @param tabs
     */
    getEntityField(internal_name: string): Dictionary<any>;
    /**
     * Get entry access for an entity
     * @param internal_name
     * @param tabs
     */
    getEntityEntryAccess(internal_name: string): Dictionary<any>;
    /**
     * Get extended fields attached to an entity
     * @param internal_name
     * @param tabs
     */
    getEntityResource(internal_name: string): Dictionary<ResourceInterface>;
    /**
     * Get entity data decorator
     * @param internal_name
     * @param tabs
     */
    getEntityDecorator(internal_name: string): DataDecorator;
    /**
     * Get entity data decorator
     * @param internal_name
     * @param tabs
     */
    getEntityDataSetter(internal_name: string): DataSetter;
    /**
     * Get entity data decorator
     * @param internal_name
     * @param tabs
     */
    getEntityLastDataSetter(internal_name: string): DataSetter;
    /**
     * Get entity data decorator
     * @param internal_name
     * @param tabs
     */
    getEntityFilter(internal_name: string): DataFilter;
    /**
     * Get extended actions attached to an entity
     * @param internal_name
     * @param tabs
     */
    getEntityAction(internal_name: string): Dictionary<any>;
    /**
     * Get extended table attached to an entity
     * @param internal_name
     * @param tabs
     */
    getEntityTable(internal_name: string): EntityModelTableInterface;
    /**
     * Get extended table attached to an entity
     * @param internal_name
     * @param tabs
     */
    getEntityRoute(internal_name: string): ServiceRoutesInterface;
    /**
     * Get extended table attached to an entity
     * @param internal_name
     * @param tabs
     */
    getEntityMenu(internal_name: string): EntityModelMenuInterface;
    bustAllCache(): void;
    ngOnDestroy(): void;
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
    private _getBaseCoreConfig;
    /**
     * Get the an entity repo class for a specific entity
     * This is intended to be run when a CoreConfig is requested for an entity, once created it will be stored and reused
     *
     * @param entityParams
     * @param routes
     */
    private _getEntityRepo;
    /**
     * Get the crud access that is associated to a specific entity
     * This is intended to be run when a CoreConfig is requested for an entity, once created it will be stored and reused
     * @param entityParams
     */
    private _getEntityAccess;
    private _getEntityConfig;
}
