import { Observable } from 'rxjs';
import { PopBaseService } from '../../../services/pop-base.service';
import { CoreConfig, Dictionary, Entity, EntityModelInterface, EntityParamsInterface, QueryParamsInterface, ResourceConfig, ServiceRoutesInterface } from '../../../pop-common.model';
import { Router } from '@angular/router';
import { PopLogService } from '../../../services/pop-log.service';
import { PopDisplayService } from '../../../services/pop-display.service';
import { PopRequestService } from '../../../services/pop-request.service';
import { PopEntityUtilFieldService } from './pop-entity-util-field.service';
import { PopResourceService } from '../../../services/pop-resource.service';
import { PopCacheService } from '../../../services/pop-cache.service';
export declare class PopEntityRepoService implements PopEntityServiceInterface {
    private readonly env?;
    private name;
    private id;
    protected params: EntityParamsInterface;
    private activated;
    protected apiVersion: number;
    model: EntityModelInterface;
    protected srv: {
        base: PopBaseService;
        cache: PopCacheService;
        display: PopDisplayService;
        field: PopEntityUtilFieldService;
        log: PopLogService;
        request: PopRequestService;
        resource: PopResourceService;
        router: Router;
    };
    protected routes: ServiceRoutesInterface;
    protected setServiceContainer(): void;
    constructor(env?: any);
    /**
     * Pass in in the EntityParams to tie this to a specific type of entity
     * (Moved out of constructor die to build issues)
     * @param entityParams
     */
    register(entityParams: EntityParamsInterface): void;
    /**
     * Pass in a route config for this entity
     * @param routes
     */
    setRoutes(routes: ServiceRoutesInterface): void;
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
     * A Http call that gets the entity configs
     * @param id Primary Key of the entity
     */
    getConfig(): Observable<any>;
    /**
     *  A http call that gets a list of entities
     * @param queryParams '?archived=1', '?archived=0'
     */
    getEntities(body?: Object, queryParams?: QueryParamsInterface): Promise<Entity[]>;
    /**
     * A method that clears any cache for this entity type
     */
    clearAllCache(caller?: string): void;
    /**
     * A method that clears any cache for this entity type
     */
    clearCache(cacheType: string, cacheKey?: string, caller?: string): void;
    setCache(cacheType: string, cacheKey: string, data: any, minutes?: number): void;
    getCache(cacheType: string, cacheKey: string): Promise<Entity[]>;
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
     * @param id Primary Key of the entity
     */
    getUiResource(core: CoreConfig): Promise<any>;
    /**
     * A Http call that gets the entity metadata
     * @param id Primary Key of the entity
     */
    reloadResource(core: CoreConfig, resourceName: string): Promise<boolean>;
    /**
     * A Http call that gets the entity metadata
     * @param id Primary Key of the entity
     */
    injectResource(core: CoreConfig, resource: ResourceConfig, reload?: boolean): Promise<boolean>;
    /**
     * A method that gets the entity singular name for entity
     * @param field
     */
    getInternalName(): string;
    /**
     * Get the alias display for this entity;
     * @param alias 'singular | 'plural';
     */
    getDisplayName(alias?: string): string;
    /**
     * A method that gets the base api path for the entity
     * @param field
     */
    getApiPath(): string;
    /**
     * A http call that gets the preferences of a user
     */
    getPreferences(core: CoreConfig, cache?: boolean): Promise<boolean>;
    /**
     * A http call that gets the preferences of a user
     */
    deletePreference(id: number, type: string): Promise<any>;
    /**
     * An Http call to save a preference
     * @param id
     * @param type
     * @param body
     */
    savePreference(id: number, type: string, body: Dictionary<any>): Observable<any>;
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
    /**
     * A method that update an entity relation
     * Method should take into consideration the aliases that the entity might have
     * @param id Primary Key of the entity
     * @param tab
     */
    updateEntity(id: number | string, entity: any, queryParams?: QueryParamsInterface): Observable<any>;
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
