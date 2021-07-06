import { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { SideBySideConfig, SideBySideOptionInterface } from './pop-side-by-side.model';
import { PopExtendComponent } from '../../../pop-extend.component';
import { Dictionary, PopBaseEventInterface } from '../../../pop-common.model';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { PopDomService } from '../../../services/pop-dom.service';
import { PopEntityUtilParamService } from '../../entity/services/pop-entity-util-param.service';
export declare class PopSideBySideComponent extends PopExtendComponent implements OnInit, OnDestroy {
    el: ElementRef;
    protected _domRepo: PopDomService;
    config: SideBySideConfig;
    name: string;
    protected srv: {
        dialog: MatDialog;
        router: Router;
        param: PopEntityUtilParamService;
    };
    availableFilterValue: string;
    assignedFilterValue: string;
    constructor(el: ElementRef, _domRepo: PopDomService);
    /**
     * This component should have a purpose
     */
    ngOnInit(): void;
    /**
     * Filter Utility
     * @param type
     * @param filter
     */
    onApplyFilter(type: string, filter: string): void;
    /**
     * Filter both columns
     */
    onFilterBoth(filter: string): void;
    /**
     * Assign a specific option
     */
    onOptionAssign(option: SideBySideOptionInterface, confirmed?: boolean): Promise<boolean>;
    /**
     * Assign all options
     */
    onAssignAllOptions(confirmed?: boolean): Promise<boolean>;
    /**
     * Remove an option that is assigned
     * @param option
     * @param confirmed
     */
    onRemoveOption(option: SideBySideOptionInterface, confirmed?: boolean): Promise<boolean>;
    /**
     * Remove all options that are assigned
     */
    onRemoveAllOptions(confirmed?: boolean): Promise<boolean>;
    /**
     * Go to linked route of option
     * @param option
     */
    onNavigateToOptionRoute(option: SideBySideOptionInterface): void;
    /**
     * Intercept the user right mouse click to show a context menu for this component
     * @param option
     * @param event
     */
    onMouseRightClick(option: any, event: MouseEvent): boolean;
    onBubbleEvent(eventName: string, message?: string, extend?: Dictionary<any>, force?: boolean): PopBaseEventInterface;
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
    private _assign;
    private _remove;
    private _getRequestBody;
    private _getRequest;
    private _handleAssignError;
    private _handleRemoveError;
    private _onAssignSuccess;
    private _beforePatch;
    private _formatConflictData;
    private _confirmAction;
    private _onAssignFail;
    private _onRemoveFail;
    private _onRemoveSuccess;
    /**
     * Helper function that naivgates the complexity of the setting the heights needed in this component
     */
    private _setHeight;
    /**
     * This will block certain options from being available
     * @param bucket
     * @param ids
     */
    private _blockBucketOptions;
    /**
     * This will un-block certain options from being available
     * @param bucket
     * @param ids
     */
    private _unblockBucketOptions;
    /**
     * Allow other modules to trigger certain functionality
     * @param option
     * @param event
     */
    private _setHooks;
    /**
     * Intercept the user right mouse click to show a context menu for this component
     * @param option
     * @param event
     */
    private _setContextMenu;
    /**
     * Get the count of assigned options
     */
    private _checkForAssignedOptions;
    /**
     * Filter assigned options
     * @param filter
     */
    private _filterAssignedOptions;
    /**
     * Filter un-assigned options
     * @param filter
     */
    private _filterAvailableOptions;
    /**
     * Set the intial state of the assigned options
     */
    private _trackAssignedOptions;
}
