import { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { EntitySchemeSectionInterface } from '../pop-entity-scheme.model';
import { PopExtendDynamicComponent } from "../../../../pop-extend-dynamic.component";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { Dictionary, PopBaseEventInterface, SchemeComponentConfig } from "../../../../pop-common.model";
import { PopEntityActionService } from "../../services/pop-entity-action.service";
import { PopTabMenuService } from "../../../base/pop-tab-menu/pop-tab-menu.service";
import { PopDomService } from "../../../../services/pop-dom.service";
export declare class PopEntitySchemeCustomComponent extends PopExtendDynamicComponent implements OnInit, OnDestroy {
    el: ElementRef;
    protected _domRepo: PopDomService;
    protected _tabRepo: PopTabMenuService;
    private container;
    componentId: number;
    config: SchemeComponentConfig;
    section: EntitySchemeSectionInterface;
    name: string;
    protected srv: {
        dialog: MatDialog;
        action: PopEntityActionService;
        tab: PopTabMenuService;
    };
    protected asset: {
        dialogRef: MatDialogRef<any, any>;
    };
    constructor(el: ElementRef, _domRepo: PopDomService, _tabRepo: PopTabMenuService);
    /**
     * INit
     */
    ngOnInit(): void;
    /**
     * This fx will present a pop up for the user to configure the options of this widget
     */
    onEditComponentOptions(): void;
    /**
     * This user can click on a refresh icon to refresh the widget
     */
    onRefreshComponent(): void;
    /**
     * Handle the bubble events that come up
     * @param event
     */
    onBubbleEvent(name: string, extension?: Dictionary<any>, event?: PopBaseEventInterface): boolean;
    /**
     * Clean up the dom of this component
     */
    ngOnDestroy(): void;
    /************************************************************************************************
     *                                                                                              *
     *                                   Base Protected Methods                                     *
     *                                    ( Protected Method )                                      *
     *                                                                                              *
     ************************************************************************************************/
    /**
     * Set the initial config
     * Intended to be overridden per field
     */
    protected _setInitialConfig(): Promise<boolean>;
    /**
     * Set the initial config
     * Intended to be overridden per field
     */
    protected _setInitialState(): Promise<boolean>;
    /**
     * Set the initial config
     * Intended to be overridden per field
     */
    protected _setInitialProceed(): Promise<boolean>;
    /**
     * This fx will render the custom component for this widget
     * @private
     */
    private _renderComponent;
}
