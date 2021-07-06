import { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PopExtendDynamicComponent } from '../../../pop-extend-dynamic.component';
import { EntityFieldComponentInterface } from './pop-entity-field.model';
import { Dictionary, FieldConfig, PopBaseEventInterface } from '../../../pop-common.model';
import { PopEntityFieldService } from './pop-entity-field.service';
export declare class PopEntityFieldComponent extends PopExtendDynamicComponent implements EntityFieldComponentInterface, OnInit, OnDestroy {
    el: ElementRef;
    field: FieldConfig;
    private container;
    name: string;
    protected srv: {
        field: PopEntityFieldService;
        router: Router;
    };
    constructor(el: ElementRef);
    /**
     * This component should have a purpose
     */
    ngOnInit(): void;
    /**
     * The user can call actions on this field
     * @param event
     */
    onActionButtonClick(event: PopBaseEventInterface): boolean;
    /**
     * User wants to add a value entry into the field
     * @param event
     */
    onAdd(event: PopBaseEventInterface): boolean;
    /**
     * User wants to make edits to the value entries
     * @param event
     */
    onEdit(event?: PopBaseEventInterface, dataKey?: number): boolean;
    /**
     * User wants to remove a value entry
     * @param event
     */
    onRemove(event: PopBaseEventInterface): boolean;
    /**
     * User closes the edit ability of the value entries
     * @param event
     */
    onClose(event: PopBaseEventInterface): boolean;
    /**
     * The user can click on a link to view the config setup of this field
     */
    onNavigateToField(): void;
    /**
     * Handle the bubble events that come up
     * @param event
     */
    onBubbleEvent(name?: string, extension?: Dictionary<any>, event?: PopBaseEventInterface): boolean;
    /**
     * Clean up the dom of this component
     */
    ngOnDestroy(): void;
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    /**
     * Set internal state flags of a field
     * @private
     */
    private _setFieldState;
    /**
     * Interept the mouse right click to show a context menu for this field
     * @param event
     */
    private _attachContextMenu;
}
