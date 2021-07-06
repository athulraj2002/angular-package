import { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { PopExtendDynamicComponent } from '../../../../../pop-extend-dynamic.component';
import { PopEntityService } from '../../../services/pop-entity.service';
import { PopFieldEditorService } from '../../pop-entity-field-editor.service';
import { PopRequestService } from '../../../../../services/pop-request.service';
import { Dictionary, DynamicComponentInterface, FieldConfig, FieldInterface, PopBaseEventInterface } from '../../../../../pop-common.model';
import { PopDomService } from '../../../../../services/pop-dom.service';
import { EntitySchemeSectionInterface } from '../../../pop-entity-scheme/pop-entity-scheme.model';
export declare class PopEntityFieldItemParamsComponent extends PopExtendDynamicComponent implements OnInit, OnDestroy {
    el: ElementRef;
    protected _domRepo: PopDomService;
    protected _fieldRepo: PopFieldEditorService;
    field: FieldInterface;
    scheme: EntitySchemeSectionInterface;
    private container;
    name: string;
    protected asset: {
        field: FieldConfig;
        viewParams: Dictionary<any>;
        viewOptions: Dictionary<any>;
        viewTemplate: Dictionary<any>;
    };
    protected srv: {
        entity: PopEntityService;
        field: PopFieldEditorService;
        request: PopRequestService;
    };
    constructor(el: ElementRef, _domRepo: PopDomService, _fieldRepo: PopFieldEditorService);
    /**
     * We expect the core to represent a field
     * This component allows the user to configure the settings of the specific field attribute item
     * The FieldBuilderItemsComponent is responsible to communicate which field attribute item is active
     */
    ngOnInit(): void;
    /**
     * This handler handles any events that come up from the settings fields
     * @param event
     */
    onBubbleEvent(event: PopBaseEventInterface): void;
    /**
     * This is action that initiates setting up the preview
     */
    setActiveFieldItem(): void;
    /**
     * This is action that initiates setting up the preview
     */
    setLabelSettings(): void;
    /**
     * The user can add entries in to the options that this field should use
     */
    addFieldItemOption(): void;
    /**
     * The user can remove an existing option that this field is using
     * @param index
     */
    removeFieldItemOption(index: number): void;
    /**
     * This will allow the user to make consecutive changes with minimal api calls
     * @param event
     */
    triggerSaveFieldOptions(event: PopBaseEventInterface): void;
    /**
     * Reset the option values with the root source
     * @param event
     */
    onOptionSourceReset(event: PopBaseEventInterface): void;
    /**
     * This will store the option changes that the user makes
     */
    saveFieldItemOptions(): void;
    /**
     * This allows the user to sort the list of options that this field uses
     * @param event
     */
    onOptionSortDrop(event: CdkDragDrop<string[]>): void;
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
     * This handler is for managing any cross-communication between components on the core channel
     * @param event
     */
    private coreEventHandler;
    /**
     * This handles rendering the dynamic list of  param settings into the view
     * @param form
     * @param fieldItem
     * @param params
     */
    private _setFieldItemParams;
    /**
     * This will return a list of all the inputs that the settings require
     * @param fieldItem
     * @param params
     */
    _configureParamList(): Promise<DynamicComponentInterface[]>;
    /**
     * This will return a list of all the inputs that the label settings require
     * @param fieldItem
     * @param params
     */
    _configureLabelList(): Promise<DynamicComponentInterface[]>;
    private _setHeight;
    /**
     * Return the the field input component that should be used for the type of setting param;
     * @param form
     */
    private _getParamComponent;
    /**
     * This will make sure the options will get set up properly if the active items uses them
     * @param form
     * @param options
     * @param params
     */
    private _setFieldItemOptions;
}
