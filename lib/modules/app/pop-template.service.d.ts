import { ElementRef } from '@angular/core';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { PopCacFilterBarService } from './pop-cac-filter/pop-cac-filter.service';
import { AppGlobalInterface } from '../../pop-common.model';
export declare class PopTemplateService {
    private filter;
    private snackbar;
    private APP_GLOBAL;
    private env?;
    protected asset: {
        notification: MatSnackBarRef<any>;
        contentEl: ElementRef<any>;
    };
    constructor(filter: PopCacFilterBarService, snackbar: MatSnackBar, APP_GLOBAL: AppGlobalInterface, env?: any);
    turnOffFilter(): void;
    welcome(): void;
    buffer(expression?: string, duration?: number): void;
    error(error: {
        message: string;
        code: number;
    }, duration?: number): void;
    goodbye(): void;
    lookBusy(duration?: number): void;
    notify(message: string, action?: string, duration?: number): void;
    clear(): void;
    setContentEl(el: ElementRef): void;
    verify(): void;
    getContentHeight(modal?: boolean, overhead?: number): number;
}
