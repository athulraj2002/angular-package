import { ChangeDetectorRef, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { TabMenuConfig, TabMenuPortalInterface } from '../../base/pop-tab-menu/tab-menu.model';
import { PopTabMenuService } from '../../base/pop-tab-menu/pop-tab-menu.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { AppGlobalInterface, EntityExtendInterface, PopBaseEventInterface } from '../../../pop-common.model';
import { PopEntityEventService } from '../services/pop-entity-event.service';
import { PopDomService } from '../../../services/pop-dom.service';
import { PopExtendDynamicComponent } from '../../../pop-extend-dynamic.component';
import { PopEntityActionService } from '../services/pop-entity-action.service';
export declare class PopEntityTabMenuComponent extends PopExtendDynamicComponent implements OnInit, OnDestroy {
    el: ElementRef;
    cdr: ChangeDetectorRef;
    route: ActivatedRoute;
    protected _domRepo: PopDomService;
    protected _tabRepo: PopTabMenuService;
    APP_GLOBAL: AppGlobalInterface;
    dialogRef: MatDialogRef<PopEntityTabMenuComponent>;
    config: TabMenuConfig;
    extension: EntityExtendInterface;
    portal: TabMenuPortalInterface;
    private container;
    name: string;
    protected srv: {
        action: PopEntityActionService;
        dialog: MatDialog;
        events: PopEntityEventService;
        tab: PopTabMenuService;
    };
    constructor(el: ElementRef, cdr: ChangeDetectorRef, route: ActivatedRoute, _domRepo: PopDomService, _tabRepo: PopTabMenuService, APP_GLOBAL: AppGlobalInterface, dialogRef: MatDialogRef<PopEntityTabMenuComponent>);
    /**
     * Helper function that renders the list of dynamic components
     *
     */
    private _templateRender;
    ngOnInit(): void;
    /**
     * Tie in for a parent component to pass in a TabMenuConfig
     * @param config
     */
    registerTabMenuConfig(config: TabMenuConfig): void;
    /**
     * A TabMenu  will generate a slew of action and event triggers
     * @param event
     */
    onBubbleEvent(event: PopBaseEventInterface): void;
    /**
     * A user can click on an archive/active button to change the status of this active entity
     * @param archive
     */
    onArchiveButtonClicked(archive: boolean): void;
    /**
     * A user can click a clone button to trigger this active entity to be cloned
     */
    onCloneButtonClicked(): void;
    /**
     * When the modal to clone the active entity is closed the asset needs to be cleared
     */
    onActionModalClose(): void;
    /**
     * Cleanup the do of this component
     */
    ngOnDestroy(): void;
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    /**
     * This allows a CoreConfig to be passed in else it will generate one
     *
     */
    private _setCore;
    /**
     * This allows a TabMenuConfig to be passed in else it will generate one
     *
     */
    private _setTabMenuConfig;
    /**
     * This will transfer the TabMenuConfig up to the tabRepo so other components can communicate with it
     *
     */
    private _registerTabMenuConfig;
}
