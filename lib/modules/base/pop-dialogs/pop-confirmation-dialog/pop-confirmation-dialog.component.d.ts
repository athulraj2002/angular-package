import { OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { PopConfirmationDialogDataInterface } from '../pop-dialogs.model';
export declare class PopConfirmationDialogComponent implements OnInit {
    config: PopConfirmationDialogDataInterface;
    dialog: MatDialogRef<PopConfirmationDialogComponent>;
    constructor(config: PopConfirmationDialogDataInterface, dialog: MatDialogRef<PopConfirmationDialogComponent>);
    ngOnInit(): void;
    onConfirm(): void;
    onCancel(): void;
}
