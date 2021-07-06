import { OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { PopMessageDialogDataInterface } from '../pop-dialogs.model';
export declare class PopMessageDialogComponent implements OnInit {
    config: PopMessageDialogDataInterface;
    dialog: MatDialogRef<PopMessageDialogComponent>;
    constructor(config: PopMessageDialogDataInterface, dialog: MatDialogRef<PopMessageDialogComponent>);
    ngOnInit(): void;
    onCancel(): void;
}
