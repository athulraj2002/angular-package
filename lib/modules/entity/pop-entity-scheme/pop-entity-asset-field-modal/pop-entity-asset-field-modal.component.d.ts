import { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { Dictionary, FieldInterface, FieldItemInterface, PopBaseEventInterface, SectionInterface } from '../../../../pop-common.model';
import { InputConfig } from '../../../base/pop-field-item/pop-input/input-config.model';
import { MatDialogRef } from '@angular/material/dialog';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { PopContainerService } from '../../../../services/pop-container.service';
import { PopExtendDynamicComponent } from '../../../../pop-extend-dynamic.component';
import { PopFieldEditorService } from '../../pop-entity-field-editor/pop-entity-field-editor.service';
import { PopDomService } from '../../../../services/pop-dom.service';
import { EntitySchemeSectionInterface } from '../pop-entity-scheme.model';
export declare class PopEntityAssetFieldModalComponent extends PopExtendDynamicComponent implements OnInit, OnDestroy {
    el: ElementRef;
    dialogRef: MatDialogRef<PopEntityAssetFieldModalComponent>;
    protected _containerRepo: PopContainerService;
    protected _domRepo: PopDomService;
    config: EntitySchemeSectionInterface;
    name: string;
    protected srv: {
        container: PopContainerService;
        field: PopFieldEditorService;
    };
    protected asset: {
        defaultContentHeight: number;
        model: Map<any, any>;
        config: Map<any, any>;
        coreField: FieldInterface;
        coreFields: Dictionary<FieldInterface>;
        coreFieldItems: Dictionary<FieldItemInterface>;
        params: Dictionary<any>;
        map: Dictionary<any>;
    };
    ui: {
        activeConfigs: Dictionary<any>;
        field: FieldInterface;
        name: InputConfig;
        items: any[];
        sections: SectionInterface[];
        map: {
            items: Dictionary<number>;
        };
    };
    protected extendServiceContainer(): void;
    constructor(el: ElementRef, dialogRef: MatDialogRef<PopEntityAssetFieldModalComponent>, _containerRepo: PopContainerService, _domRepo: PopDomService);
    /**
     * This component will allow a user to configure custom settings for each of items that it holds
     * The CoreConfig of this component will be a specific scheme
     * The config of this component is expected to be a scheme asset that is of type field
     */
    ngOnInit(): void;
    /**
     * The user will be able to active/deactive a specific item in the list of items for this field
     * @param item
     */
    onItemStatusChange(event: PopBaseEventInterface): void;
    /**
     * The user will be able to select from a list of item an active item in which to configure settings
     * @param item
     */
    onActiveItemSelection(item: any): void;
    /**
     * The user needs the changes it active item options to be saved to the database
     * @param event
     */
    onSaveActiveItemOptions(event: PopBaseEventInterface): void;
    /**
     * There might be multiple tab sections to the setting of this active item
     * @param section
     */
    onActiveItemSettingSectionSelection(section: SectionInterface): void;
    /**
     * The user is able to sort the options that should be used to populate the field, if applicable
     */
    onActiveItemOptionSortDrop(event: CdkDragDrop<string[]>): void;
    /**
     * The user should be able to click a button to close the modal
     */
    onModalClose(): void;
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
    private _setActiveItemParamConfiguration;
    private _getParamConfigurationComponentList;
    /**
     * Determine the correct component for the form type
     * @param form
     */
    private _determineParamSettingComponent;
    private _setActiveItemOptionConfiguration;
}
