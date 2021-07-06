import { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { PopExtendComponent } from '../../../../pop-extend.component';
import { Subject } from 'rxjs';
import { PopPipeService } from '../../../../services/pop-pipe.service';
import { Dictionary } from '../../../../pop-common.model';
import { PopCacFilterBarService } from '../pop-cac-filter.service';
import { CacFilterBarConfig, CacFilterBarEntityConfig } from '../pop-cac-filter.model';
export declare class PopCacFilterViewComponent extends PopExtendComponent implements OnInit, OnDestroy {
    el: ElementRef;
    channel: Subject<CacFilterBarEntityConfig[]>;
    name: string;
    ui: {
        config: CacFilterBarConfig;
        entities: CacFilterBarEntityConfig[];
        map: Dictionary<any>;
    };
    protected asset: {
        filter: any;
    };
    protected srv: {
        filter: PopCacFilterBarService;
        pipe: PopPipeService;
    };
    constructor(el: ElementRef);
    /**
     * This component should have a specific purpose
     */
    ngOnInit(): void;
    /**
     * Trigger an entity column to apply search
     * @param entity
     */
    onApplySearch(entity: CacFilterBarEntityConfig): void;
    /**
     * Checks/Unchecks all the options within an entity column
     * @param entity
     */
    onCheckAll(entity: CacFilterBarEntityConfig): void;
    /**
     * Handle when an option selection has changed
     * Detects progmatic changes
     * @param entity
     */
    onCheckboxChange(event: any, entity: any, id: number): void;
    /**
     * Handle when an option selection has changed
     * Detects manual changes
     * @param entity
     */
    onRadioChange(event: any, entity: any, id: any): void;
    /**
     * The menu bar has been opened or closed
     * @param entity
     */
    onToggleOpen(entity?: string): void;
    /**
     * Event handler for the click of the reset button
     * @returns void
     */
    resetFilter(): void;
    /**
     * Emits the apply filter event, called
     * when the apply filter button is clicked.
     * @returns void
     */
    applyFilter(): void;
    trackByFn(index: any, item: any): any;
    ngOnDestroy(): void;
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    /**
     * Determne if all the visible options are either all checked or unchecked
     * @param entity
     * @private
     */
    private _checkForIndeterminate;
    /**
     * Trigger the column list to update with filtered options
     * @param entity
     */
    private _onEntityFeedUpdate;
    /**
     * Updates the select configurations based on the filter bar configurations
     * @returns void
     */
    private _setEntityConfig;
    /**
     * Configure a radio enity config
     * @param entity
     * @param index
     * @private
     */
    private _setSingleEntityConfig;
    /**
     * Configure a multiple checkbox entity config
     * @param entity
     * @param index
     * @private
     */
    private _setMultipleEntityConfig;
    /**
     * Cascade changes to all columns of the right of the column that made changes
     * @param entityName
     */
    onUpdateOptionsDisplay(changedIndex: any): void;
    private _setDefaultState;
    /**
     * Update the text appears in the header of each entity column
     * @param entity
     */
    private _updateEntitySelectedText;
    /**
     * Determine if all the visible options in an entity column have been selected
     * @param entity
     */
    private _checkVisibleForAll;
    /**
     * Create a payload for what the filter has generated
     */
    private _getCurrentFilter;
    /**
     * Determine which entity columns are having a filtering effect
     */
    private _isCurrentFilterRelevant;
}
