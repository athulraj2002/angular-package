import { OnDestroy } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { PopTabMenuService } from '../../base/pop-tab-menu/pop-tab-menu.service';
import { TabConfig } from '../../base/pop-tab-menu/tab-menu.model';
import { PopExtendService } from '../../../services/pop-extend.service';
import { CoreConfig, Dictionary, FieldInterface, KeyMap } from '../../../pop-common.model';
import { EntitySchemeSectionConfig, EntitySchemeSectionInterface } from './pop-entity-scheme.model';
import { Subject } from 'rxjs';
import { PopEntityActionService } from '../services/pop-entity-action.service';
export declare class PopEntitySchemeService extends PopExtendService implements OnDestroy {
    private tabRepo;
    name: string;
    protected srv: {
        action: PopEntityActionService;
        dialog: MatDialog;
        tab: PopTabMenuService;
    };
    ui: {
        refresh: Subject<string>;
        attachedMap: {};
        assetPool: Dictionary<any>;
        assignableConfigs: {};
        primary: Dictionary<number>;
        primaryIds: number[];
        sections_keys: any[];
        sections: any[];
    };
    protected asset: {
        attachingSet: {};
        assetMap: {
            field: Map<number, FieldInterface>;
            component: Map<number, any>;
        };
        core: CoreConfig;
        tab: TabConfig;
    };
    private _setServiceContainer;
    constructor(// This service is unique to every component, provided in the PopEntityTabComponent
    tabRepo: PopTabMenuService);
    /**
     * This fx takes the initial data and configures it to the expected structure and sets up all the ancillary assets needed
     * @param core
     * @param tab
     */
    init(core: CoreConfig, tab: TabConfig): Promise<boolean>;
    /**
     * This fx is used to remove an asset/child from the scheme
     * @param position
     * @param asset
     */
    onRemoveChildFromLayout(position: number, child: EntitySchemeSectionInterface): Promise<boolean>;
    /**
     * A user can dragSort aassets from one column to another in the scheme layout
     * @param event
     */
    onAssetSortDrop(event: CdkDragDrop<string[]>): void;
    /**
     * This fx used to register that a user has check an asset in the asset poll intending to attach it to a column in the scheme
     * @param asset_type
     * @param itemId
     * @param value
     */
    onAssetAttaching(asset_type: any, itemId: number, value: boolean): void;
    /**
     * This fx is used to attach assets to a column in the scheme
     * The user will select which assets from a pool and then click a button representing the column where the assets should be pushed into
     * @param section
     */
    onAttachingAssetsToPosition(section: EntitySchemeSectionInterface): Promise<EntitySchemeSectionConfig[]>;
    /**
     * This fx will take an array of sections an update any of the modified sections
     * @param sections
     */
    onUpdate(sections: EntitySchemeSectionInterface[]): Promise<boolean>;
    /**
     * This fx is used to trigger an api call to save the current state of the scheme
     * @param delay
     */
    onTriggerUpdate(delay?: number): void;
    /**   * A user can click on an edit button an edit the config settings of an asset
  
     * @param asset
     */
    onEditAsset(asset: any): Promise<boolean>;
    getFieldMapping(fieldId: number): object;
    ngOnDestroy(): void;
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    /**
     * There a by default 3 columns, 1,2,3, this fx allows to find the section that represent one of those columns with
     * @param position number 1,2,3
     * @private
     */
    private _getSectionByPosition;
    /**
     * This fx is used to map the the sort_order of all a section's children
     * @param section
     * @private
     */
    private _storePositionSortOrder;
    /**
     * This fx will extract the data attributes stored on a html element
     * @param container
     * @private
     */
    private _getEventContainerData;
    /**
     * Ensure that a section has an id that is stored int the api database
     * @param section
     */
    private _resolveSectionId;
    /**
     * This fx will make the api call to remove a section in the api database
     * @param section
     */
    private _removeSection;
    /**
     * This fx is used to make api call to the backend to save the scheme
     * @param store
     * @private
     */
    private _update;
    /**
     * This fx is used to pull out all the scheme sections that need to be saved
     * @param sections
     * @private
     */
    private _extractModifiedSections;
    /**
     * This fx extracts the data off a section that should be store in the api database
     * @param section
     * @private
     */
    private _extractSectionData;
    /**
     * Determine what assets have been set from the asset pool
     * This fx is called when a user click on a <column button> intending to attach assets into a specific column of the scheme
     */
    _getAssetsToAttach(): Dictionary<KeyMap<any>>;
    /**
     * Retrieve the default columns tht exist on an entity table
     * @param section
     */
    private _getSectionTableFieldsAssets;
    /**
     * Convert child sections to the expected structure
     * @param child
     * @private
     */
    private _transformSection;
    /**
     * Convert child of a section to the expected structure
     * @param child
     */
    private _transformChild;
    /**
     * This fx is used ensures that an asset type has the all ancillary assets needed
     * @param assetType
     */
    private _ensureAssetTypeContainers;
    /**
     * Clear out all the attaching set data
     */
    private _resetAssetAttachingData;
    /**
     * Refresh the core entity
     * @param dom
     */
    private _refreshEntity;
    /**
     * This fx is used to mark an asset in the asset pool as attachable
     * @param asset
     */
    private _setChildAsAttachable;
    /**
     * This fx is used to mark an asset in as attached, setting it up to be transferred to a column in the scheme
     * @param asset
     */
    private _setChildAsAttached;
    /**
     * This fx is used to pull out all the scheme sections that need to be saved
     * @param sections
     * @private
     */
    private _checkForTraits;
}
