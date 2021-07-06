import { ChangeDetectorRef, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { TableConfig } from '../../base/pop-table/pop-table.model';
import { PopExtendComponent } from '../../../pop-extend.component';
import { PopBaseEventInterface } from '../../../pop-common.model';
export declare class PopEntityHistoryComponent extends PopExtendComponent implements OnInit, OnDestroy {
    el: ElementRef;
    cdr: ChangeDetectorRef;
    config: TableConfig;
    name: string;
    constructor(el: ElementRef, cdr: ChangeDetectorRef);
    /**
     * This component should have a specific purpose
     */
    ngOnInit(): void;
    buildTable(): Promise<boolean>;
    eventHandler(event: PopBaseEventInterface): void;
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
     * A method that preps entityId list data for tables
     * @param dataSet
     * @param fieldMap
     */
    private _prepareTableData;
}
