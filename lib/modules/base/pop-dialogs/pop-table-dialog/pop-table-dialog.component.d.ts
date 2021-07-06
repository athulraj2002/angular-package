import { OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TableConfig } from '../../pop-table/pop-table.model';
export declare class PopTableDialogComponent implements OnInit {
    dialog: MatDialogRef<PopTableDialogComponent>;
    data: any;
    ui: {
        table: TableConfig;
    };
    constructor(dialog: MatDialogRef<PopTableDialogComponent>, data: any);
    ngOnInit(): void;
    private _buildTable;
    onClose(): void;
}
