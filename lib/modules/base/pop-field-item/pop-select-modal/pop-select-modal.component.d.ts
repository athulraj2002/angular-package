import { EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SelectModalConfig } from './select-modal-config.model';
import { PopSelectModalDialogComponent } from './pop-select-modal-dialog/pop-select-modal-dialog.component';
import { InputConfig } from '../pop-input/input-config.model';
import { Entity, PopBaseEventInterface } from '../../../../pop-common.model';
import { PopFieldItemComponent } from '../pop-field-item.component';
export declare class PopSelectModalComponent extends PopFieldItemComponent implements OnInit, OnDestroy {
    config: SelectModalConfig;
    events: EventEmitter<PopBaseEventInterface>;
    name: string;
    protected srv: {
        dialog: MatDialog;
    };
    protected asset: {
        original: any;
        dialogRef: MatDialogRef<PopSelectModalDialogComponent, any>;
    };
    ui: {
        anchorInput: InputConfig;
        dialogRef: MatDialogRef<PopSelectModalDialogComponent, any>;
    };
    constructor();
    /**
     * This component should have a specific purpose
     */
    ngOnInit(): void;
    onChangeOptions(): void;
    /**
     * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
     */
    ngOnDestroy(): void;
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Protected Method )                                      *
     *                                                                                              *
     ************************************************************************************************/
    /**
     * Set up the body of the api patch
     * @param value
     * @private
     */
    protected _getPatchBody(value?: number | string | boolean | null | Object): Entity;
}
