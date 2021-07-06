import { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { PopExtendDynamicComponent } from '../../../../pop-extend-dynamic.component';
import { PopEntityService } from '../../services/pop-entity.service';
import { PopFieldEditorService } from '../pop-entity-field-editor.service';
import { Entity, FieldConfig, FieldInterface, PopBaseEventInterface } from '../../../../pop-common.model';
import { SelectConfig } from '../../../base/pop-field-item/pop-select/select-config.model';
import { PopDomService } from '../../../../services/pop-dom.service';
import { PopEntityUtilFieldService } from '../../services/pop-entity-util-field.service';
export declare class PopEntityFieldPreviewComponent extends PopExtendDynamicComponent implements OnInit, OnDestroy {
    el: ElementRef;
    protected _domRepo: PopDomService;
    field: FieldInterface;
    private container;
    name: string;
    protected asset: {
        field: FieldInterface;
        fieldgroup: Entity;
        columnKeys: string[];
    };
    ui: {
        stateSelector: SelectConfig;
        field: FieldConfig;
    };
    protected srv: {
        entity: PopEntityService;
        editor: PopFieldEditorService;
        field: PopEntityUtilFieldService;
    };
    constructor(el: ElementRef, _domRepo: PopDomService);
    /**
     * We expect the core to represent a field
     * This component represents what the view of the current field will look like
     * The component relies upon the FieldBuilderItemsComponent && FieldBuilderItemSettingsComponent to communicate when settings are changed so that the view can render the changes
     */
    ngOnInit(): void;
    /**
     * This handler manages events that come up from the preview fields, mostly just to session any values that the user enters, and simulate adding removing value entries
     * The field input is saved because the setFieldPreview destroys the component and is called often, and the user should not have to re-enter test data every time a setting is changed
     * @param event
     */
    onBubbleEvent(event: PopBaseEventInterface): void;
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
     * Create a new field label
     */
    private _addFieldValue;
    /**
     * Remove an existing label
     */
    private _removeFieldValue;
    /**
     * Create sets of mock data for the fields entries
     */
    private _setDataSession;
    /**
     * Debounce the requests to reset the preview
     * @param delay
     */
    private _triggerFieldPreview;
    /**
     * This will create a facade field that will a dynamically try to replicate how the field will look when it is in use
     */
    private _setFieldPreview;
}
