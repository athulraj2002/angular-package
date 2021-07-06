import { ElementRef, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { EntityMenu } from './pop-left-menu/entity-menu.model';
import { PopTemplateService } from './pop-template.service';
import { AppGlobalInterface, AppThemeInterface } from '../../pop-common.model';
import { PopExtendComponent } from '../../pop-extend.component';
import { Router } from '@angular/router';
export declare class PopTemplateComponent extends PopExtendComponent implements OnInit, OnDestroy {
    el: ElementRef;
    private router;
    private template;
    private renderer;
    private APP_GLOBAL;
    private APP_THEME;
    header: ElementRef;
    content: ElementRef;
    backdrop: boolean;
    menus: EntityMenu[];
    widgets: any[];
    filter: boolean;
    left: boolean;
    right: boolean;
    displayMenu: boolean;
    name: string;
    constructor(el: ElementRef, router: Router, template: PopTemplateService, renderer: Renderer2, APP_GLOBAL: AppGlobalInterface, APP_THEME: AppThemeInterface);
    ngOnInit(): void;
    ngOnDestroy(): void;
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    private _initialize;
}
