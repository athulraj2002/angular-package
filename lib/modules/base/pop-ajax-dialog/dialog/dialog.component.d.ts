import { OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { PopAjaxDialogComponent } from '../pop-ajax-dialog.component';
import { PopRouteHistoryResolver } from '../../../../services/pop-route-history.resolver';
import { PopAjaxDialogConfigInterface } from '../pop-ajax-dialog.model';
import { MainSpinner } from '../../pop-indicators/pop-indicators.model';
import { PopRequestService } from '../../../../services/pop-request.service';
export declare class DialogComponent implements OnInit {
    data: PopAjaxDialogConfigInterface;
    private dialog;
    private history;
    private requestService;
    mainSpinner: MainSpinner;
    loading: boolean;
    httpError: {
        error: string;
        code: number;
    };
    constructor(data: PopAjaxDialogConfigInterface, dialog: MatDialogRef<PopAjaxDialogComponent>, history: PopRouteHistoryResolver, requestService: PopRequestService);
    ngOnInit(): void;
    private makeRequest;
    private doPatch;
    private doDelete;
    private doPost;
    private doGet;
    close(): void;
    private closeDialogAfterDelay;
    private setSpinnerOptions;
}
