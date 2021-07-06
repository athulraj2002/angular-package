import { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { PopExtendComponent } from '../../../../../pop-extend.component';
import { Dictionary, Entity, FieldInterface, PopBaseEventInterface } from '../../../../../pop-common.model';
import { PopDomService } from '../../../../../services/pop-dom.service';
import { PopFieldEditorService } from '../../pop-entity-field-editor.service';
import { EntitySchemeSectionInterface } from '../../../pop-entity-scheme/pop-entity-scheme.model';
export declare class PopEntityFieldItemsComponent extends PopExtendComponent implements OnInit, OnDestroy {
    el: ElementRef;
    protected _domRepo: PopDomService;
    protected _fieldRepo: PopFieldEditorService;
    field: FieldInterface;
    scheme: EntitySchemeSectionInterface;
    name: string;
    protected srv: {
        field: PopFieldEditorService;
    };
    protected asset: {
        fieldgroup: Entity;
    };
    ui: {
        field: FieldInterface;
        coreItems: any[];
        items: any[];
        fieldItemHelper: string;
        map: Dictionary<any>;
        customSetting: Dictionary<any>;
    };
    /**
     * @param el
     * @param _domRepo - transfer
     * @param _fieldRepo - transfer
     */
    constructor(el: ElementRef, _domRepo: PopDomService, _fieldRepo: PopFieldEditorService);
    /**
     * We expect the core to represent a field
     * This component lists out all of the field attributes that this field has, and allows for the user to active/deactivate specific items.
     */
    ngOnInit(): void;
    /**
     * This handles when a user click on a checkbox to activate/deactivate a specific field attribute
     * @param event
     */
    onItemActiveChange(event: PopBaseEventInterface): void;
    /**
     * This handles when a user click on a checkbox to activate/deactivate a specific field attribute
     * @param event
     */
    onEditLabelChange(event: PopBaseEventInterface): void;
    /**
     * On selection is an event when a user click on a specific field attribute to manage its settings
     * @param item
     */
    onActiveItemSelection(item: any): void;
    /**
     * On selection is an event when a user click on a specific field attribute to manage its settings
     * @param item
     */
    onActiveLabelSelection(): void;
    /**
     * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
     */
    ngOnDestroy(): void;
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    /**
     * Select the the first field item available
     */
    private _selectDefaultItem;
    /**
     * This handler is for managing an cross-communication between components on the core channel
     * @param event
     */
    private _coreEventHandler;
    /**
     * Build configs that control the active state for each field item
     */
    private _buildActiveItems;
    /**
     * Build the configs for any relevant custom settings
     * @private
     */
    private _buildCustomSettings;
    /**
     * Determine the layout height to control overflow
     *
     */
    private _setHeight;
}
