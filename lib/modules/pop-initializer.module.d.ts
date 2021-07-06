import { ComponentFactoryResolver, ModuleWithProviders } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { PopBaseService } from '../services/pop-base.service';
import { PopCacFilterBarService } from './app/pop-cac-filter/pop-cac-filter.service';
import { PopDatetimeService } from '../services/pop-datetime.service';
import { PopEntityService } from './entity/services/pop-entity.service';
import { PopLogService } from '../services/pop-log.service';
import { PopRouteHistoryResolver } from '../services/pop-route-history.resolver';
import { PopPipeService } from '../services/pop-pipe.service';
import { PopEntityUtilPortalService } from './entity/services/pop-entity-util-portal.service';
import { PopRequestService } from '../services/pop-request.service';
import { PopTemplateService } from './app/pop-template.service';
import { PlatformLocation } from '@angular/common';
import { PopTask, AppMenusInterface, AppGlobalInterface, AppWidgetsInterface, AppGlobalParamInterface, AppThemeInterface } from '../pop-common.model';
import { Router } from '@angular/router';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { PopCredentialService } from '../services/pop-credential.service';
import { EntityMenu } from './app/pop-left-menu/entity-menu.model';
import { PopRequestExternalService } from '../services/pop-request-external.service';
import { PopEntitySchemeComponentService } from "./entity/services/pop-entity-scheme-component.service";
export declare class AppMenus implements AppMenusInterface {
    private _menus;
    get(): EntityMenu[];
    set(menus: EntityMenu[]): void;
    init(menus: EntityMenu[]): EntityMenu[];
}
export declare class AppWidgets implements AppWidgetsInterface {
    private _widgets;
    get(): any[];
    set(widgets: any[]): void;
}
export declare class AppTheme implements AppThemeInterface {
    private _theme;
    private _contrast;
    private _name;
    init: BehaviorSubject<boolean>;
    get(): string;
    set(theme?: string, contrast?: 'light' | 'dark'): void;
    isLoaded(): boolean;
}
export declare class AppGlobal implements AppGlobalInterface {
    private _verified;
    private _modals;
    private _filter;
    private _pipes;
    private _aliases;
    private _entities;
    private _security;
    private _permissions;
    private _open;
    init: BehaviorSubject<boolean>;
    verification: Subject<boolean>;
    _unload: Subject<boolean>;
    isVerified(): Promise<boolean>;
    setVerified(): void;
    setModal(): void;
    isModal(): number;
    removeModal(): void;
    isFilterBar(): boolean;
    setFilterBar(value: boolean): void;
    isPipes(): boolean;
    setPipes(value: boolean): void;
    isAliases(): boolean;
    setAliases(value: boolean): void;
    isEntities(): boolean;
    setEntities(value: boolean): void;
    setSecurity(value: boolean): void;
    isSecurity(): boolean;
    isPermissions(): boolean;
    setPermissions(value: boolean): void;
    isOpen(): boolean;
    setOpen(value: boolean): void;
}
export declare class PopInitializerModule {
    private base;
    private cacFilter;
    private componentFactoryResolver;
    private credential;
    private date;
    private entity;
    private externalApi;
    private log;
    private history;
    private iconRegistry;
    private pipe;
    private portal;
    private request;
    private router;
    private sanitizer;
    private schemeComponent;
    private template;
    private platform;
    private injector;
    tasks: PopTask[];
    APP_GLOBAL: AppGlobalInterface;
    APP_GLOBAL_PARAMS: AppGlobalParamInterface;
    APP_THEME: AppThemeInterface;
    private env?;
    private name;
    private businessId;
    private verification;
    private unload;
    static forRoot(tasks?: PopTask[], appGlobalsParams?: AppGlobalParamInterface): ModuleWithProviders<PopInitializerModule>;
    constructor(base: PopBaseService, cacFilter: PopCacFilterBarService, componentFactoryResolver: ComponentFactoryResolver, credential: PopCredentialService, date: PopDatetimeService, entity: PopEntityService, externalApi: PopRequestExternalService, log: PopLogService, history: PopRouteHistoryResolver, iconRegistry: MatIconRegistry, pipe: PopPipeService, portal: PopEntityUtilPortalService, request: PopRequestService, router: Router, sanitizer: DomSanitizer, schemeComponent: PopEntitySchemeComponentService, template: PopTemplateService, platform: PlatformLocation, injector: any, tasks: PopTask[], APP_GLOBAL: AppGlobalInterface, APP_GLOBAL_PARAMS: AppGlobalParamInterface, APP_THEME: AppThemeInterface, env?: any);
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    /**
     * Load the app dependencies
     * @param business
     */
    private _setDependencies;
    private _init;
    private _setAncillary;
    private _configure;
    private _tasks;
    private _setAuthGlobal;
    private _setBusinessId;
    /**
     * Verify that the current auth storage is still relevant
     * @private
     */
    private _verifyAuthStorage;
    /**
     * This fx will set up all the necessary business assets that are needed
     * @param auth
     * @private
     */
    private _setBusinessAssets;
    /**
     * This fx will loop through all the apps in the current business, and for each entity in that business register the details
     */
    private _setBusinessAppEntities;
    /**
     * Load the client,account,campaign data required for the filter bar
     * @param business
     */
    private _setBusinessUserSettings;
    private _welcome;
    /**
     * Load the client,account,campaign data required for the filter bar
     * @param business
     */
    private _loadFilterData;
    /**
     * Load the resources needed for the PopPipe service
     * @param business
     */
    private _loadPipeResources;
    /**
     * Set any aliases on the filter columns
     * @private
     */
    private _setFilterAliases;
    /**
     * Create a map lookup for route aliases
     * @private
     */
    private _setRouteAliasMap;
    /**
     * Get the router.config and load all lazy module using the configLoader
     */
    private _setRouteAliases;
    /**
     * Get the router.config and load all lazy module using the configLoader
     */
    private _setRouteCacheClear;
    /**
     * Get the router.config and load all lazy module using the configLoader
     */
    private _setRouteErrorHandling;
    /**
     * Load the theme of the business and apply the theme contrast the user has specified
     * @param business
     */
    private _loadAppTheme;
    /**
     * Set a default set of tabs that an entity should have, intended to be overridden
     * @param business
     */
    private _setDefaultTabs;
}
