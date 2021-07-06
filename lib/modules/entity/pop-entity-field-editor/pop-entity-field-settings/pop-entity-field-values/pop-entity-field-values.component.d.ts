import { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { PopExtendComponent } from '../../../../../pop-extend.component';
import { PopDomService } from '../../../../../services/pop-dom.service';
import { Dictionary, FieldInterface, FieldItemOption, PopBaseEventInterface } from '../../../../../pop-common.model';
import { PopRequestService } from '../../../../../services/pop-request.service';
import { PopFieldEditorService } from '../../pop-entity-field-editor.service';
export declare class PopEntityFieldValuesComponent extends PopExtendComponent implements OnInit, OnDestroy {
    el: ElementRef;
    private domRepo;
    private fieldRepo;
    name: string;
    protected srv: {
        field: PopFieldEditorService;
        request: PopRequestService;
    };
    protected asset: {
        basePath: string;
        field: FieldInterface;
        type: string;
        typeOption: Dictionary<{
            defaultValue: string | number;
            options: FieldItemOption[];
        }>;
    };
    /**
     * Nest all service related classes under srv
     */
    protected transformSrvContainer(): void;
    constructor(el: ElementRef, domRepo: PopDomService, fieldRepo: PopFieldEditorService);
    /**
     * This component should have a specific purpose
     */
    ngOnInit(): void;
    /**
     * When the type of an entry is changed in the database, make sure the changes is updated locally
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
     * Listen for when the min_multiple && max_multiple values change
     * @param event
     * @private
     */
    private _coreEventHandler;
    /**
     * Produce a list of the entry values for this field
     * @private
     */
    private _showEntries;
    /**
     * Ensure that the database records match the min/max settings
     * This will remove any excess records in the database that exceed the multiple_min
     * This will create records for an entries that are needed in the database
     * @param patch
     * @private
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
    private _getTypeConfig;
    /**
     * Manage the display of each entry
     * @param index
     * @private
     */
    private _getDisplayConfig;
    private _triggerFieldPreviewUpdate;
}
