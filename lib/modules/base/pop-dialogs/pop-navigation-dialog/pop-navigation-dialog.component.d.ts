import { OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { PopNavigationDialogDataInterface, PopNavigationDialogItemInterface } from '../pop-dialogs.model';
import { Router } from '@angular/router';
export declare class PopNavigationDialogComponent implements OnInit {
    data: PopNavigationDialogDataInterface;
    dialog: MatDialogRef<PopNavigationDialogComponent>;
    private router;
    constructor(data: PopNavigationDialogDataInterface, dialog: MatDialogRef<PopNavigationDialogComponent>, router: Router);
    ngOnInit(): void;
    navigate(item: PopNavigationDialogItemInterface): void;
    cancel(): void;
}
