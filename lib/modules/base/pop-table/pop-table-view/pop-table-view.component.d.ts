import { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatSort } from '@angular/material/sort';
import { TableConfig } from '../pop-table.model';
import { PopExtendComponent } from '../../../../pop-extend.component';
import { PopDomService } from '../../../../services/pop-dom.service';
import { PopDisplayService } from '../../../../services/pop-display.service';
export declare class PopTableViewComponent extends PopExtendComponent implements OnInit, OnDestroy {
    el: ElementRef;
    protected _displayRepo: PopDisplayService;
    protected _domRepo: PopDomService;
    config: TableConfig;
    tableSort: MatSort;
    checkbox: MatCheckbox;
    name: string;
    srv: {
        display: PopDisplayService;
    };
    ui: {
        helperText: any[];
    };
    /**
     * @param el
     * @param _displayRepo
     * @param _domRepo
     */
    constructor(el: ElementRef, _displayRepo: PopDisplayService, _domRepo: PopDomService);
    sortDisplay(col: any): string;
    sort(col: any): void;
    /**
     * This component is a child component of pop table
     * This component specifically handles the view that renders the data
     */
    ngOnInit(): void;
    /**
     * Trigger an event when the user click on a name
     * @param name
     * @param row
     */
    onColumnStandardClick(name: any, row: any): void;
    /**
     * Trigger an event when the user click on a name that is linked to a route
     * @param name
     * @param row
     */
    onColumnRouteClick(name: any, row: any): void;
    /**
     * Create a helper text for a name
     * @param index
     * @param col
     * @param row
     */
    onHelperText(index: any, col: any, row: any): any;
    /**
     * Trigger an doAction when a name link is clicked
     * @param name
     * @param row
     */
    onColumnLinkClick(name: any, row: any): void;
    /**
     * Selects all rows if they are not all selected; otherwise clear all row selections.
     */
    onMasterRowToggleClick(): void;
    /**
     * This will pass up to the table component
     * @param filter
     * @param col
     */
    onApplySearchValue(filter: string, col: string): void;
    /**
     * Asks whether the number of selected elements matches the total number of rows.
     */
    isAllRowsSelected(): boolean;
    /**
     * This will bubble events with the table signature
     * @param name
     * @param event
     */
    onBubbleEvent(name: any, event: any): void;
    /**
     * *ngFor track by for columns
     * Prevents columns from re-rendering when the item is the same
     * @param index
     * @param item
     */
    trackColumnByItem(index: any, item: any): any;
    /**
     * *ngFor track by for rows
     * Prevents rows from re-rendering when the item entityId is still the same
     * @param index
     * @param item
     */
    trackRowByItemId(index: any, item: any): any;
    /**
     * Clean up the dom of this component
     */
    ngOnDestroy(): void;
    /**
     * This will a build a context-menu that can used when user right clicks a certain element
     */
    private _attachContextMenu;
}
