import { OnInit, OnDestroy, ElementRef, ChangeDetectorRef } from '@angular/core';
import { TableConfig } from './pop-table.model';
import { MatPaginator } from '@angular/material/paginator';
import { PopBaseEventInterface } from '../../../pop-common.model';
import { PopBaseService } from '../../../services/pop-base.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PopExtendComponent } from '../../../pop-extend.component';
import { PopDomService } from '../../../services/pop-dom.service';
import { PopPipeService } from "../../../services/pop-pipe.service";
export declare class PopTableComponent extends PopExtendComponent implements OnInit, OnDestroy {
    el: ElementRef;
    cdr: ChangeDetectorRef;
    protected _baseRepo: PopBaseService;
    protected _dialogRepo: MatDialog;
    protected _domRepo: PopDomService;
    protected _routerRepo: Router;
    protected _pipeRepo: PopPipeService;
    config: TableConfig;
    wrapper: ElementRef;
    footer: ElementRef;
    matPaginator: MatPaginator;
    name: string;
    srv: {
        base: PopBaseService;
        dialog: MatDialog;
        router: Router;
        pipe: PopPipeService;
    };
    asset: {
        data: any;
        filter: {
            column: {};
            predicate: any;
            search: any;
        };
    };
    /**
     * @param el
     * @param cdr
     * @param _baseRepo
     * @param _dialogRepo
     * @param _domRepo
     * @param _routerRepo
     * @param _pipeRepo
     */
    constructor(el: ElementRef, cdr: ChangeDetectorRef, _baseRepo: PopBaseService, _dialogRepo: MatDialog, _domRepo: PopDomService, _routerRepo: Router, _pipeRepo: PopPipeService);
    /**
     * This component should have a purpose
     */
    ngOnInit(): void;
    /**
     * The table will generate a slew of action and event triggers that need passed up the chain
     * @param name
     * @param event
     */
    onBubbleEvent(name: any, event: any): void;
    /**
     * This will apply the search value that the user enters behind a debouncer
     * @param searchValue
     * @param col
     */
    onApplySearchValue(searchValue: string, col: string): void;
    /**
     * The user can click on a button to edit their preferences for this table in a modal
     */
    onEditTablePreferencesClick(): void;
    /**
     * Clean up the dom of this component
     */
    ngOnDestroy(): void;
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Protected Method )                                      *
     *                                                                                              *
     ************************************************************************************************/
    /**
     * Setup an intial config for this component here
     * @private
     */
    protected _setInitialConfig(): Promise<boolean>;
    /**
     * Handle table events
     * @param event
     */
    protected _onTableEvent(event: PopBaseEventInterface): boolean;
    /**
     * This determine what the height of the table should be
     * @param height
     */
    protected _setHeight(height?: number): Promise<boolean>;
    /**
     * The user can choose from a global search or a column search
     */
    private _setFilterPredicate;
    protected _updateData(data: Array<object>): void;
    protected _resetTable(data?: Array<object>): void;
    /**
     * This will bring in the table config,user preferences,data set and tie it all together
     * The structure of the data set is important to what the table will render
     */
    protected _configureTable(): Promise<boolean>;
    protected _setTablePagination(): void;
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    private _updateColumnDefinitions;
    /**
     * This function will attach and configure a paginator if it is needed
     */
    private _attachPaginator;
    /**
     * This will manage the button interface
     * Buttons can have a dependency on what the user has currently selected(list items have a checkbox selection)
     */
    private _updateButtonControl;
    /**
     * The table config has its own event emitter that need to be handled
     */
    private _handleConfigEvents;
    /**
     * This will allow an outside component to trigger specific functionality through the config of this component
     */
    private _setConfigHooks;
    /**
     * Initialize and manage the filter predicates that this table will use
     */
    private _initSearchFilter;
    private _setTableLayout;
    private _setTableHeight;
    private _parseGoToUrl;
}
