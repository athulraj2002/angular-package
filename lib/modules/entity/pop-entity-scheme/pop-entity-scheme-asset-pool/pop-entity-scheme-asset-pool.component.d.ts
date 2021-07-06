import { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { PopEntitySchemeService } from '../pop-entity-scheme.service';
import { ButtonConfig } from '../../../base/pop-field-item/pop-button/button-config.model';
import { PopExtendComponent } from '../../../../pop-extend.component';
import { PopDomService } from '../../../../services/pop-dom.service';
import { EntitySchemeSectionInterface, ProfileSchemeAssetPoolInterface } from '../pop-entity-scheme.model';
import { Dictionary, KeyMap } from '../../../../pop-common.model';
import { CheckboxConfig } from '../../../base/pop-field-item/pop-checkbox/checkbox-config.model';
import { PopTabMenuService } from '../../../base/pop-tab-menu/pop-tab-menu.service';
import { Router } from '@angular/router';
export declare class PopEntitySchemeAssetPoolComponent extends PopExtendComponent implements OnInit, OnDestroy {
    el: ElementRef;
    protected _domRepo: PopDomService;
    protected _schemeRepo: PopEntitySchemeService;
    protected _tabRepo: PopTabMenuService;
    name: string;
    ui: {
        sections: EntitySchemeSectionInterface[];
        assignBtnConfigs: ButtonConfig[];
        assignableConfigs: Dictionary<KeyMap<CheckboxConfig>>;
        assetPool: ProfileSchemeAssetPoolInterface[];
        section_keys: number[];
    };
    protected asset: {
        primaryIds: number[];
    };
    protected srv: {
        scheme: PopEntitySchemeService;
        tab: PopTabMenuService;
        router: Router;
    };
    /**
     *
     * @param el
     * @param _domRepo - transfer
     * @param _schemeRepo - transfer
     * @param _tabRepo - transfer
     */
    constructor(el: ElementRef, _domRepo: PopDomService, _schemeRepo: PopEntitySchemeService, _tabRepo: PopTabMenuService);
    /**
     * The purpose of this component is to provide the user with lists of all available types that they can assign into a scheme layout
     */
    ngOnInit(): void;
    private _setUiAssets;
    /**
     * Cear the search input and reset the asset pool list
     */
    onUiSearchValueClear(): void;
    /**
     * Apply the search value the user entered to the asset pool list
     * @param searchValue
     * @param col
     */
    onApplyUiSearch(searchValue: string, col?: string): void;
    /**
     * The user can expand an asset pool type to be open or closed
     * @param pool
     */
    onTogglePoolExpansion(pool: any): void;
    /**
     * This is triggered when a user selects a checkbox indicating that it will be assigned to a position of the layout
     * @param asset_type
     * @param itemId
     * @param value
     */
    onAssetPoolItemAttaching(asset_type: string, itemId: number, value: boolean): void;
    /**
     * This is triggered when a user selects a position button indicating they want the selected asset pool items moved to a position of the layout
     * @param section
     * @param $event
     */
    onSectionAttachingItems(section: EntitySchemeSectionInterface, $event: any): void;
    /**
     * This is triggered every time the user selects a checkbox of an asset pool item
     * This should determine which positions of the layout are eligible base on the set of the items selected
     * Asset Pool items should be designated as compact or not, the last position of the layout is reserved for larger modules and compact items should not go in it
     */
    onEnableUiAssignButtons(): void;
    /**
     * This will disable or clear the position assign buttons
     */
    onDisableUiAssignButtons(): void;
    onAssetLink(type: string, id: number): void;
    /**
     * A user can click on an item in the asset pool to view a modal of that specific entityId item
     * @param internal_namea
     * @param id
     */
    onViewEntityPortal(internal_name: string, id: number): void;
    /**
     * Clean up the dom of this component
     */
    ngOnDestroy(): void;
}
