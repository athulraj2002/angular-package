import { ChangeDetectorRef, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { PopEntityEventService } from '../services/pop-entity-event.service';
import { PopEntityService } from '../services/pop-entity.service';
import { PopTabMenuService } from '../../base/pop-tab-menu/pop-tab-menu.service';
import { TabConfig } from '../../base/pop-tab-menu/tab-menu.model';
import { EntityExtendInterface, PopBaseEventInterface } from '../../../pop-common.model';
import { PopExtendComponent } from '../../../pop-extend.component';
import { PopDomService } from '../../../services/pop-dom.service';
import { EntitySchemeSectionInterface } from '../pop-entity-scheme/pop-entity-scheme.model';
export declare class PopEntityTabComponent extends PopExtendComponent implements OnInit, OnDestroy {
    el: ElementRef;
    cdr: ChangeDetectorRef;
    route: ActivatedRoute;
    protected _tabRepo: PopTabMenuService;
    protected _domRepo: PopDomService;
    tab: TabConfig;
    extension: EntityExtendInterface;
    name: string;
    protected srv: {
        dialog: MatDialog;
        router: Router;
        events: PopEntityEventService;
        entity: PopEntityService;
        tab: PopTabMenuService;
    };
    protected asset: {
        scheme: EntitySchemeSectionInterface;
    };
    /**
     * @param el
     * @param cdr
     * @param route
     * @param _tabRepo - transfer
     * @param _domRepo - transfer
     */
    constructor(el: ElementRef, cdr: ChangeDetectorRef, route: ActivatedRoute, _tabRepo: PopTabMenuService, _domRepo: PopDomService);
    /**
     * Setup this component
     */
    ngOnInit(): void;
    /**
     * Bubble event handler
     * @param event
     */
    onBubbleEvent(event: PopBaseEventInterface): void;
    /**
     * Triggers when the window is resized
     */
    onWindowResize(): void;
    /**
     * Triggers when a user clicks on an entityId link to see the details of that entityId in a modal
     * @param internal_name
     * @param id
     */
    onViewEntityPortal(internalName: string, entityId: number): void;
    /**
     * Trigger to reset the view
     * @param position
     */
    onResetView(position?: number): void;
    /**
     * Clean up the dom of this component
     */
    ngOnDestroy(): void;
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Protected Method )                                      *
     *                                                                                              *
     ************************************************************************************************/
    /**
     * Tie in hook that is called when ever a event if fired
     *
     */
    private _callOnEvent;
    /**
     * Tie in hook that is called when the tab is initialized
     *
     */
    private _callOnLoadEvent;
    /**
     * Tie in hook that is called when the tab is destroyed
     *
     */
    private _callUnloadEvent;
    /**
     * Helper funtion to determine the correct header to display
     * @param header
     */
    private _getHeaderText;
    /**
     * Core Event Handler
     * @param event
     */
    private _coreEventHandler;
    /**
     * Detects if a mobile layout should be used based on the width of the screen
     */
    private _determineLayout;
    /**
     * Determines if an event should cause a view reset
     * @param event
     */
    private _needsPositionReset;
    /**
     * Allows for a pre built core to be passed in else it will build the core itself
     */
    _setCore(): Promise<boolean>;
    /**
     * Allows for a pre built tab to be passed in else it will find try to find one
     */
    _setTab(): Promise<boolean>;
    /**
     * Determine the structure of the tab view
     *
     */
    _buildTabView(): any[];
    /**
     * Gather all the assets that should be rendered in a specific section
     * @param core
     * @param assets
     */
    private _getSchemeSectionAssetComponents;
    /**
     * Retrieve the default columns tht exist on an entity table
     * @param section
     */
    private _getSectionTableFieldsAssets;
}
