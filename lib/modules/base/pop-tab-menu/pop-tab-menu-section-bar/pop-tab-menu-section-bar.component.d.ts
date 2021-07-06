import { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Dictionary, SectionConfig, SectionInterface } from '../../../../pop-common.model';
import { PopExtendDynamicComponent } from '../../../../pop-extend-dynamic.component';
import { TabConfig } from '../tab-menu.model';
import { PopDomService } from '../../../../services/pop-dom.service';
import { PopTabMenuService } from '../pop-tab-menu.service';
import { PopTabMenuSectionBarService } from './pop-tab-menu-section-bar.service';
export declare class PopTabMenuSectionBarComponent extends PopExtendDynamicComponent implements OnInit, OnDestroy {
    el: ElementRef;
    protected _domRepo: PopDomService;
    protected _routeRepo: ActivatedRoute;
    protected _tabRepo: PopTabMenuService;
    sections: SectionConfig[];
    overflow: boolean;
    container: any;
    name: string;
    protected srv: {
        location: Location;
        router: Router;
        route: ActivatedRoute;
        section: PopTabMenuSectionBarService;
        tab: PopTabMenuService;
    };
    ui: {};
    protected asset: {
        tab: TabConfig;
        baseUrl: string;
        urlSection: string;
        map: Dictionary<any>;
    };
    constructor(el: ElementRef, _domRepo: PopDomService, _routeRepo: ActivatedRoute, _tabRepo: PopTabMenuService);
    /**
     * Setup this component
     */
    ngOnInit(): void;
    /**
     * This will load the comonent of the selected section into the view container
     * @param section
     */
    onViewSection(section: SectionInterface): void;
    /**
     * Clean up the dom of this component
     */
    ngOnDestroy(): void;
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Protected Method )                                      *
     *                                                                                              *
     ************************************************************************************************/
    protected _setCore(): Promise<boolean>;
    protected _setRoute(): Promise<boolean>;
    protected _setSections(): Promise<boolean>;
    protected _setHeight(): Promise<boolean>;
    protected _attachContainer(): Promise<boolean>;
}
