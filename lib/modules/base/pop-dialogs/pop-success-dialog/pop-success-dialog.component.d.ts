import { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { EntitySuccessDataInterface } from '../../../../pop-common.model';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PopExtendComponent } from '../../../../pop-extend.component';
export declare class PopSuccessDialogComponent extends PopExtendComponent implements OnInit, OnDestroy {
    el: ElementRef;
    dialog: MatDialogRef<PopSuccessDialogComponent>;
    data: EntitySuccessDataInterface;
    name: string;
    protected srv: {
        dialog: MatDialog;
    };
    protected asset: {};
    ui: {
        submitText: string;
        header: string;
        message: string;
    };
    constructor(el: ElementRef, dialog: MatDialogRef<PopSuccessDialogComponent>, data: EntitySuccessDataInterface);
    /**
     * This component should have a specific purpose
     */
    ngOnInit(): void;
    /**
     * The user can click a cancel btn to close the action dialog
     */
    onFormClose(): void;
    /**
     * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
     */
    ngOnDestroy(): void;
}
