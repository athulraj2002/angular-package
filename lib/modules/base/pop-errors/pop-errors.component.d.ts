import { AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
export declare class PopErrorsComponent implements AfterViewInit {
    dialog: MatDialog;
    error: {
        code: number;
        message: string;
    };
    constructor(dialog: MatDialog);
    ngAfterViewInit(): void;
    loadErrorDialog(): void;
}
