import { OnDestroy, OnInit } from '@angular/core';
import { AppGlobalInterface, AppWidgetsInterface } from '../../../pop-common.model';
import { PopExtendDynamicComponent } from '../../../pop-extend-dynamic.component';
export declare class PopWidgetBarComponent extends PopExtendDynamicComponent implements OnInit, OnDestroy {
    private APP_GLOBAL;
    private APP_WIDGETS;
    hidden: boolean;
    widgets: any[];
    name: string;
    ui: {};
    protected asset: {};
    constructor(APP_GLOBAL: AppGlobalInterface, APP_WIDGETS: AppWidgetsInterface);
    ngOnInit(): void;
    onToggleMenu(): void;
    ngOnDestroy(): void;
    private _initialize;
}
