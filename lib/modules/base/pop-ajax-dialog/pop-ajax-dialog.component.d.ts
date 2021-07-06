import { AfterViewInit, OnInit, EventEmitter } from '@angular/core';
import { PopAjaxDialogConfigInterface } from './pop-ajax-dialog.model';
import { MatDialog } from '@angular/material/dialog';
import { PopBaseService } from '../../../services/pop-base.service';
import { Router } from '@angular/router';
export declare class PopAjaxDialogComponent implements OnInit, AfterViewInit {
    dialog: MatDialog;
    private baseService;
    private router;
    ajaxDialogConfig: PopAjaxDialogConfigInterface;
    close: EventEmitter<any>;
    constructor(dialog: MatDialog, baseService: PopBaseService, router: Router);
    ngOnInit(): void;
    ngAfterViewInit(): void;
    private loadDialog;
    private redirect;
}
