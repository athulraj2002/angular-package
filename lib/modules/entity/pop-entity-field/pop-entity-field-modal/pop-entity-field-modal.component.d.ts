import { OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { PopExtendDynamicComponent } from '../../../../pop-extend-dynamic.component';
export declare class PopEntityFieldModalComponent extends PopExtendDynamicComponent implements OnInit, OnDestroy {
    dialog: MatDialogRef<PopEntityFieldModalComponent>;
    data: any;
    name: string;
    constructor(dialog: MatDialogRef<PopEntityFieldModalComponent>, data: any);
    ngOnInit(): void;
    onFormSubmit(): void;
    onFormCancel(): void;
    ngOnDestroy(): void;
}
