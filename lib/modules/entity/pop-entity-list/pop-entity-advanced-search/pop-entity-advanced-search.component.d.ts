import { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { PopExtendComponent } from '../../../../pop-extend.component';
export declare class PopEntityAdvancedSearchComponent extends PopExtendComponent implements OnInit, OnDestroy {
    el: ElementRef;
    private advancedSearchDialogRef;
    private route;
    data: any;
    name: string;
    internal_name: string;
    constructor(el: ElementRef, advancedSearchDialogRef: MatDialogRef<PopEntityAdvancedSearchComponent>, route: ActivatedRoute, data: any);
    /**
     * This component should have a specific purpose
     */
    ngOnInit(): void;
    onSearch(): void;
    onCancel(): void;
    /**
     * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
     */
    ngOnDestroy(): void;
}
