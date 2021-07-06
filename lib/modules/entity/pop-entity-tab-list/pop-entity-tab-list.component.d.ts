import { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EntityTabListExtendInterface } from './pop-entity-tab-list.model';
import { PopDomService } from '../../../services/pop-dom.service';
import { AppGlobalInterface } from '../../../pop-common.model';
import { PopEntityListComponent } from '../pop-entity-list/pop-entity-list.component';
import { PopTabMenuService } from '../../base/pop-tab-menu/pop-tab-menu.service';
export declare class PopEntityTabListComponent extends PopEntityListComponent implements OnInit, OnDestroy {
    el: ElementRef;
    protected route: ActivatedRoute;
    protected _domRepo: PopDomService;
    protected _tabRepo: PopTabMenuService;
    APP_GLOBAL: AppGlobalInterface;
    internal_name: string;
    parentId: number;
    parent: string;
    param: string;
    extension: EntityTabListExtendInterface;
    name: string;
    constructor(el: ElementRef, route: ActivatedRoute, _domRepo: PopDomService, _tabRepo: PopTabMenuService, APP_GLOBAL: AppGlobalInterface);
    /**
     * This component will display a list of entities that the user can interact with
     */
    ngOnInit(): void;
    /**
     * Clean up the dom of this component
     */
    ngOnDestroy(): void;
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Protected Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    /**
     * Allow for a CoreConfig to be passed in
     * If a CoreConfig does not exits this component needs to be able to create it for itself, uses the internal_name that comes directly for the route
     * or tries to extrapolate it from the current url of the app
     *
     */
    protected _setCoreConfig(): Promise<boolean>;
    /**
     * Setup basic config
     * Intended to be overridden
     * @private
     */
    protected _setConfig(): Promise<boolean>;
    /**
     * Manage the sessionStorage settings
     * @private
     */
    protected _setSessionSettings(): Promise<boolean>;
    /**z
     * Determine the height of the table
     * @private
     */
    protected _setHeight(): Promise<boolean>;
    protected _fetchData(update?: boolean): Promise<unknown>;
    protected _transformData(data: any[]): any[];
    /**
     * Retrieves the data set that this view will represent
     * @param hardReset
     *
     */
    protected _getTableData(hardReset?: boolean): Promise<unknown>;
    protected _configureFilterBar(): Promise<boolean>;
    /**
     * Generates a table config that will be used by the nested view component
     * @param reset
     *
     */
    protected _configureTable(reset?: boolean): Promise<boolean>;
}
