import { TabButtonInterface, TabConfig, TabMenuConfig, TabMenuInterface } from './tab-menu.model';
import { ElementRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { PopEntityService } from '../../entity/services/pop-entity.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CoreConfig, Dictionary, OutletReset, QueryParamsInterface } from '../../../pop-common.model';
import { PopLogService } from '../../../services/pop-log.service';
import { PopDomService } from '../../../services/pop-dom.service';
import { PopExtendService } from '../../../services/pop-extend.service';
export declare class PopTabMenuService extends PopExtendService implements OnDestroy {
    protected id: string;
    name: string;
    protected asset: {
        core: CoreConfig;
        config: TabMenuConfig;
        dom: PopDomService;
        id: string | number;
        map: Dictionary<any>;
        outlet: ElementRef<any>;
        resetOutlet: OutletReset;
        route: ActivatedRoute;
        path: string;
        clearCache: boolean;
    };
    protected srv: {
        dialog: MatDialog;
        entity: PopEntityService;
        log: PopLogService;
        router: Router;
    };
    ui: {
        entityParams: Dictionary<any>;
    };
    change: Subject<unknown>;
    constructor();
    private _initSession;
    /**
     * Add Buttons to the Tab Menu
     * @param buttons Array<TabButtonInterface>)
     * @returns void
     */
    addButtons(buttons: Array<TabButtonInterface>): void;
    /**
     * Add Tabs to the Tab Menu
     * @param tabs Array<TabInterface>
     * @returns void
     */
    addTabs(tabs: Array<TabConfig>): void;
    /**
     * This fx will cause this srv to remove the cache when it is destroyed
     */
    clearCache(): void;
    /**
     * Remove all Buttons from the Tab Menu
     * @param buttons Array<TabButtonInterface>)
     * @returns void
     */
    clearButtons(buttons: Array<TabButtonInterface>): void;
    /**
     * Get latest path
     */
    getPathSession(): any;
    /**
     * Clear the tab system session
     * Auto called on go back button click
     * @param name
     * @returns void
     */
    clearSession(): void;
    /**
     * Get Misc Data for each tab
     * @param path
     * @returns object
     */
    getTab(id?: string | number): any;
    /**
     * Get the global metadata stored for the Tab Menu
     * If key is passed, return that specific data else entire object
     * @param key string
     * @returns boolean
     */
    getCore(): CoreConfig;
    /**
     * Set the TabMenuConfig of the Tab Menu
     * The Tab Menu Component auto calls this on creation
     * @param config TabMenuConfig
     * @returns void
     */
    registerConfig(core: CoreConfig, config: TabMenuConfig | TabMenuInterface, dom?: PopDomService): TabMenuConfig;
    /**
     * Register an outlet to enable scroll session
     * @param outlet ElementRef
     * @returns void
     */
    registerOutlet(outlet: ElementRef): void;
    /**
     * Register a route to enable entity change detection and enforce the id on the route
     * @param outlet ElementRef
     * @returns void
     */
    registerRoute(route: ActivatedRoute): void;
    /**
     * Register a outletReset function that you want called when on crud operations
     * @param outlet ElementRef
     * @returns void
     */
    registerOutletReset(resetOutlet: OutletReset): void;
    /**
     * This fx will refresh the entity that exist on the this.asset.core
     * @param entityId
     * @param dom
     * @param queryParams
     * @param caller
     */
    refreshEntity(entityId: number, dom: PopDomService, queryParams: QueryParamsInterface, caller: string): Promise<boolean>;
    /**
     * This fx will reset the current tab
     * @param clearCache
     */
    resetTab(clearCache?: boolean): void;
    /**
     * This fx will reset a specific position of the current tab
     * @param position
     */
    reloadTabPosition(position?: number): void;
    /**
     * This will set a flag the the tab will need to refresh
     */
    setTabRefresh(): void;
    /**
     * This fx will set the scroll position of the current tab if was was previously visited
     */
    setTabScrollPosition(): void;
    /**
     * This fx will trigger a loading indicator in the current tab
     * @param value
     */
    showAsLoading(value: boolean): void;
    /**
     * Store the current tab into session memory
     * @param name
     * @returns void
     */
    setPathSession(tab: TabConfig): void;
    /**
     * Add Tabs to the Tab Menu
     * @param path string
     * @returns void
     */
    removeTab(path: string): void;
    /**
     * Toggle whether a Button is hidden
     * If value is set to true(show), false(hide), else toggle
     * @param buttons Array<TabButtonInterface>)
     * @returns boolean
     */
    toggleButton(id: string, value?: boolean): boolean;
    /**
     * This fx will update main header of the current Tab Menu
     * @param name
     */
    updateName(name: string): void;
    ngOnDestroy(): void;
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    /**
     * If you do not extend of an extension service these have to be set manually
     */
    private _setDomExtensions;
    /**
     * Return to last active tab
     * @returns void
     */
    private _isPathSession;
    /**
     * Store current tab scroll position
     * @returns void
     */
    private _storeTabScrollPosition;
    /**
     * Set current tab scroll position
     * @returns void
     */
    private _setTabScrollPosition;
    /**
     * Get the current tab scroll position
     * @returns number
     */
    private _getTabScrollPosition;
    /**
     * Verify the id on the route matches the id of the configuration entity
     * @returns number
     */
    private _checkId;
    /**
     * This fx will track the current scroll position of the current tab when navigating away, and session it
     * @param event
     * @private
     */
    private _navigationHandler;
    /**
     * This fx will reseet the current menu options
     * @private
     */
    private _resetMenu;
    /**
     * Change detection Emitter
     * @param type strings
     * @returns void
     */
    _emitChange(name: string, data?: any): void;
}
