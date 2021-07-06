import { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { SelectModalConfig } from '../select-modal-config.model';
import { PopFieldItemComponent } from '../../pop-field-item.component';
import { Dictionary } from '../../../../../pop-common.model';
export declare class PopSelectModalDialogComponent extends PopFieldItemComponent implements OnInit, OnDestroy {
    el: ElementRef;
    dialog: MatDialogRef<PopSelectModalDialogComponent>;
    data: Dictionary<any>;
    config: SelectModalConfig;
    name: string;
    constructor(el: ElementRef, dialog: MatDialogRef<PopSelectModalDialogComponent>, data: Dictionary<any>);
    /**
     * This component should have a specific purpose
     */
    ngOnInit(): void;
    confirm(): void;
    cancel(): void;
    /**
     * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
     */
    ngOnDestroy(): void;
}
