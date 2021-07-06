import { OnInit, ElementRef, OnDestroy } from '@angular/core';
import { TabMenuConfig, TabButtonInterface, TabConfig } from './tab-menu.model';
import { ActivatedRoute, Router } from '@angular/router';
import { PopTabMenuService } from './pop-tab-menu.service';
import { PopExtendComponent } from '../../../pop-extend.component';
import { PopBaseEventInterface } from '../../../pop-common.model';
import { PopDomService } from '../../../services/pop-dom.service';
import { PopRouteHistoryResolver } from '../../../services/pop-route-history.resolver';
export declare class PopTabMenuComponent extends PopExtendComponent implements OnInit, OnDestroy {
    el: ElementRef;
    private route;
    protected _domRepo: PopDomService;
    protected _tabRepo: PopTabMenuService;
    config: TabMenuConfig;
    header: ElementRef;
    outletRef: ElementRef;
    name: string;
    protected srv: {
        history: PopRouteHistoryResolver;
        router: Router;
        tab: PopTabMenuService;
    };
    constructor(el: ElementRef, route: ActivatedRoute, _domRepo: PopDomService, _tabRepo: PopTabMenuService);
    /**
     * This component should have a purpose
     */
    ngOnInit(): void;
    /**
     * Go back in history
     * @returns void
     */
    onBackButtonClick(): void;
    /**
     * Trigger a menu click event
     * @returns void
     */
    onMenuButtonClick(button: TabButtonInterface): void;
    /**
     * Trigger a tab click event
     * @returns void
     */
    onTabMenuClick(tab: TabConfig): void;
    /**
     * Event Emitter
     * @returns void
     */
    onBubbleEvent(eventData: PopBaseEventInterface): void;
    /**
     * Clean up the dom of this component
     *
     * Clear out data stored for this Tab Menu out of the global service
     */
    ngOnDestroy(): void;
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    private _registerConfig;
}
