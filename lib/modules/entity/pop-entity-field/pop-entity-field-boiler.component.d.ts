import { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { EntityFieldComponentInterface } from './pop-entity-field.model';
import { Dictionary, FieldConfig, FieldCustomSettingInterface, FieldEntry, KeyMap, PopBaseEventInterface } from '../../../pop-common.model';
import { PopExtendComponent } from '../../../pop-extend.component';
import { SelectConfig } from '../../base/pop-field-item/pop-select/select-config.model';
import { InputConfig } from '../../base/pop-field-item/pop-input/input-config.model';
import { PopDomService } from '../../../services/pop-dom.service';
import { PopEntityFieldService } from './pop-entity-field.service';
import { ButtonConfig } from '../../base/pop-field-item/pop-button/button-config.model';
import { MatDialog } from '@angular/material/dialog';
export declare class PopEntityFieldBoilerComponent extends PopExtendComponent implements EntityFieldComponentInterface, OnInit, OnDestroy {
    el: ElementRef;
    protected _domRepo: PopDomService;
    custom_setting: Dictionary<FieldCustomSettingInterface>;
    field: FieldConfig;
    name: string;
    protected srv: {
        dialog: MatDialog;
        field: PopEntityFieldService;
    };
    ui: {
        actionBtnWidth: number;
        asset: KeyMap<{
            display: InputConfig;
            entry: SelectConfig;
            customLabel: InputConfig;
            actionBtnWidth?: number;
            canCallBtn?: ButtonConfig;
            canTextBtn?: ButtonConfig;
        }>;
    };
    constructor(el: ElementRef, _domRepo: PopDomService, custom_setting?: Dictionary<FieldCustomSettingInterface>);
    ngOnInit(): void;
    /**
     * Handle click of action button
     * @param event
     * @param dataKey
     */
    onActionEvent(event: PopBaseEventInterface, dataKey?: number): boolean;
    /**
     * handle Input Changes from the field items
     * @param event
     * @param dataKey
     * @param name
     */
    onFieldItemEvent(event: PopBaseEventInterface, dataKey?: number, name?: string): boolean;
    /**
     * User wants to add a value entry  into the field
     * @param event
     */
    onAdd(event: PopBaseEventInterface): boolean;
    /**
     * User wants to open the value entry and make edits
     * @param event
     */
    onEdit(event?: PopBaseEventInterface, dataKey?: number): boolean;
    /**
     * User wants to remove a value entry
     * @param event
     */
    onRemove(event: PopBaseEventInterface, dataKey: number): boolean;
    /**
     * User closes the edit ability of the value entries
     * @param event
     */
    onClose(event: PopBaseEventInterface, dataKey?: number): boolean;
    /**
     * A method to remove an additional values from this field
     * @param id
     * @param archive
     */
    onPatch(event: PopBaseEventInterface, dataKey?: number, name?: string): Promise<boolean>;
    /**
     * Handle the bubble events that come up
     * @param event
     */
    onBubbleEvent(name: string, extension?: Dictionary<any>, event?: PopBaseEventInterface): boolean;
    /**
     * Clean up dom subscribers, interval, timeouts, ..etc
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
    protected _setInitialConfig(): void;
    /**
     * Pass in any session changes
     * The user may change tabs and the state should be restored
     */
    protected _restoreDomSession(): void;
    /**
     * Build the default configs that are across all the fieelds
     */
    protected _setAssetConfigs(): void;
    /**
     * Labels are a built in method that all fields should need
     * @param dataKey
     * @param index
     * @private
     */
    protected _setAssetConfig(dataKey: number, index: number): void;
    /**
     * Updates when a values changes it label/entry
     * @param dataKey
     * @param entryId
     */
    protected _updateFieldEntry(dataKey: number, entryId: number): void;
    /**
     * Updates the custom label if the user chooses to make a custom entry label
     * @param dataKey
     * @param value
     */
    protected _updateCustomEntryLabel(dataKey: number, value: string): void;
    /**
     * Ensure the state of the view matches up according to the stored entry/label
     * Custom Labels need special handling
     * @param dataKey
     * @param entry
     */
    protected _updateCustomLabelState(dataKey: number, entry: FieldEntry): void;
    /**
     * Update the display label of the value config
     * Some fields only use a single field item that is defaulted to the value column
     * @param dataKey
     * @param value
     */
    protected _updateDisplayLabel(dataKey: number, value: string): void;
    /**
     * Set the Display of a specific value entry
     * Sometime a display input is used to combine all the values into one, it appears in the readonly state
     * @param dataKey
     */
    protected _updateAssetDisplay(dataKey: number): void;
    /**
     * Debounce requests for set phone display
     * @param dataKey
     */
    protected _triggerUpdateAssetDisplay(dataKey: number): void;
    /**
     * Session the display value for a field item change
     * In some cases the value that is selected is not necessarily what should be presented, so we track it separately just in case
     * Ie ... when an id is selected when need to show the appropriate label that should go with it not the id itself
     * @param dataKey
     * @param field
     * @param value
     */
    protected _updateDisplayField(dataKey: number, field: string, value: string): void;
    /**
     * Get the actual data object for a specific key
     * Pass in a field key if you want a only a certain field value
     * @param dataKey
     * @param fieldKey
     */
    protected _getDataKey(dataKey: number, fieldKey?: string): any;
    /**
     * Builds the display string
     * Override in each field component as necessary
     * @param dataKey
     */
    protected _getAssetDisplayStr(dataKey: number): string;
    /**
     * This will be different for each type of field group
     * Intended to be overridden in each class, gives the mutate/transform resources if needed
     */
    protected _transformChildren(): void;
    /**
     * This will be different for each type of field group
     * Intended to be overridden in each class
     */
    protected _setFieldAttributes(): boolean;
    /**
     * This will be different for each type of field group
     * Intended to be overridden in each class
     */
    protected _setFieldItemAttribute(dataKey: number, index: number): boolean;
    /**
     * Get the item configs for a of a dataKey
     * Pass in a fieldKey if you only want the item config of a certain field
     * @param dataKey
     * @param fieldKey
     */
    protected _getDataKeyItemConfig(dataKey: number, fieldKey?: string): any;
    /**
     * Resolve a value to the name that goes with it from the option list
     * @param value
     * @param index
     */
    protected _getTypeOptionName(value: string, index: number): string;
    /**
     * Resolve a value to the name that goes with it from the option list
     * @param value
     * @param index
     */
    protected _getEntryOptionName(value: string, index: number): string;
    /**
     * Get the value entry of a specific index
     * @param index
     */
    protected _getValueEntry(index: number): FieldEntry;
    /**
     * Helper method to update a state variable, and make sure that a state object exits for each data key
     * @param dataKey
     * @param field
     * @param value
     */
    protected _updateState(dataKey: number, field: string, value: string | boolean | number): void;
}
