import { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { PopFieldEditorService } from '../../pop-entity-field-editor.service';
import { Dictionary, FieldEntry, FieldInterface, FieldItemOption, KeyMap, PopBaseEventInterface } from '../../../../../pop-common.model';
import { PopExtendComponent } from '../../../../../pop-extend.component';
import { PopDomService } from '../../../../../services/pop-dom.service';
import { MinMaxConfig } from '../../../../base/pop-field-item/pop-min-max/min-max.models';
import { SelectConfig } from '../../../../base/pop-field-item/pop-select/select-config.model';
import { InputConfig } from '../../../../base/pop-field-item/pop-input/input-config.model';
import { PopRequestService } from '../../../../../services/pop-request.service';
import { CheckboxConfig } from '../../../../base/pop-field-item/pop-checkbox/checkbox-config.model';
import { SwitchConfig } from '../../../../base/pop-field-item/pop-switch/switch-config.model';
import { MatDialog } from '@angular/material/dialog';
import { PopEntityActionService } from '../../../services/pop-entity-action.service';
import { PopTabMenuService } from '../../../../base/pop-tab-menu/pop-tab-menu.service';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { EntitySchemeSectionInterface } from '../../../pop-entity-scheme/pop-entity-scheme.model';
export declare class PopEntityFieldEntriesComponent extends PopExtendComponent implements OnInit, OnDestroy {
    el: ElementRef;
    protected _domRepo: PopDomService;
    protected _fieldRepo: PopFieldEditorService;
    protected _tabRepo: PopTabMenuService;
    field: FieldInterface;
    scheme: EntitySchemeSectionInterface;
    name: string;
    protected srv: {
        action: PopEntityActionService;
        dialog: MatDialog;
        field: PopFieldEditorService;
        request: PopRequestService;
        tab: PopTabMenuService;
    };
    protected asset: {
        basePath: string;
        entries: FieldEntry[];
        entriesMap: KeyMap<number>;
        schemeFieldStorage: any;
        type: string;
        typeOption: Dictionary<{
            defaultValue: string | number;
            options: FieldItemOption[];
        }>;
    };
    ui: {
        label: InputConfig;
        minMax: MinMaxConfig;
        editLabel: SwitchConfig;
        uniqueLabel: CheckboxConfig;
        customLabel: CheckboxConfig;
        entries: FieldEntrySession[];
        map: Dictionary<any>;
        entryLimit: number;
    };
    protected extendServiceContainer(): void;
    constructor(el: ElementRef, _domRepo: PopDomService, _fieldRepo: PopFieldEditorService, _tabRepo: PopTabMenuService);
    /**
     * This component should have a specific purpose
     */
    ngOnInit(): void;
    /**
     * This allows the user to sort the list of options that this field uses
     * @param event
     */
    onOptionSortDrop(event: CdkDragDrop<string[]>): void;
    /**
     * When the type of an entry is changed in the database, make sure the changes is updated locally
     * This is will  be removed since we don't want to do types
     * @param index
     * @param event
     */
    onEntryTypeChange(index: number, event: PopBaseEventInterface): void;
    /**
     * When the display/label of an entry is changed in the database, make sure the changes is updated locally
     * @param index
     * @param event
     */
    onEntryDisplayChange(index: number, event: PopBaseEventInterface): void;
    /**
     * When the display/label of an entry is changed in the database, make sure the changes is updated locally
     * @param index
     * @param event
     */
    onEntryActiveChange(index: number, event: PopBaseEventInterface): void;
    onEntryTraitChange(index: number, trait: {
        name: string;
        selected: boolean;
    }): void;
    private _handleMultipleEntries;
    /**
     * A User will be able to add as many labels as they like
     */
    onAddEntryValue(): void;
    private _addEntry;
    private _collectNewEntryName;
    /**
     * A User will be able to remove labels as they like
     */
    onRemoveEntryValue(entry: FieldEntrySession): void;
    onMinMaxSetting(event: PopBaseEventInterface): void;
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
    private _setCustomTraits;
    /**
     * Build the configs for the set of custom settings that this component uses
     * @private
     */
    private _buildCustomSettings;
    /**
     * A User will be able to add as many labels as they like
     */
    private _onCustomLabelChange;
    /**
     * Produce a list of the entry values for this field
     */
    private _showEntries;
    /**
     * Ensure that the database records match the min/max settings
     * This will remove any excess records in the database that exceed the multiple_min
     * This will create records for an entries that are needed in the database
     * @param patch
     */
    private _setValueEntries;
    /**
     * Will make all of the needed api requests
     * @param requests
     * @private
     */
    private _makeApiRequests;
    /**
     * Store a set of controls that can store values as the user changes the settings
     * @private
     */
    private _setEntrySessionControls;
    /**
     * Update the entry config to use the stored record, and update the sessions for it
     * @param index
     * @param session
     * @param entry
     * @private
     */
    private _updateSessionControl;
    /**
     * Update the entry type config to use correct value and path
     * @param config
     * @param entry
     * @private
     */
    private _updateEntryTypeSession;
    /**
     * Update the entry display config to use correct value and path
     * @param config
     * @param entry
     * @private
     */
    private _updateEntryDisplaySession;
    /**
     * Update the entry active config to use correct value and path
     * @param config
     * @param entry
     * @private
     */
    private _updateEntryActiveSession;
    /**
     * Store each entry config in a dom session so that it can be restored when the users is switching tabs
     * @param index
     * @param session
     */
    private setDomSession;
    /**
     * Set entry config objects that will be used in the html template
     * @private
     */
    private _setEntries;
    /**
     * Manage the type of each entry
     * @param ind
     * @private
     */
    private _getEntryTypeConfig;
    /**
     * Manage the type of each entry
     * @param ind
     * @private
     */
    private _getSessionEntryTraits;
    private _checkFieldEntryTraits;
    /**
     * Manage the type of each entry
     * @param ind
     * @private
     */
    private _getEntryActiveConfig;
    /**
     * Manage the display of each entry
     * @param index
     * @private
     */
    private _getEntryDisplayConfig;
    private _isMultipleActiveEntries;
    private _disableActiveEntries;
    private _enableActiveEntries;
}
export interface FieldEntrySession {
    id: number;
    type: SelectConfig;
    display: InputConfig;
    active: SwitchConfig;
    traits?: {
        name: string;
        selected: boolean;
    }[];
    increment: number;
}
