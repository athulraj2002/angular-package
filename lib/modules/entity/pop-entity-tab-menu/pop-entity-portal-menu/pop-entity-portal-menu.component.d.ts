import { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { CdkPortalOutlet } from '@angular/cdk/portal';
import { PopBaseEventInterface } from '../../../../pop-common.model';
import { TabButtonInterface, TabConfig, TabMenuConfig } from '../../../base/pop-tab-menu/tab-menu.model';
import { PopTabMenuService } from '../../../base/pop-tab-menu/pop-tab-menu.service';
import { PopDomService } from '../../../../services/pop-dom.service';
import { PopExtendComponent } from '../../../../pop-extend.component';
import { PopEntityEventService } from '../../services/pop-entity-event.service';
export declare class PopEntityPortalMenuComponent extends PopExtendComponent implements OnInit, OnDestroy {
    el: ElementRef;
    protected _domRepo: PopDomService;
    protected _tabRepo: PopTabMenuService;
    config: TabMenuConfig;
    outlet: ElementRef;
    portal: CdkPortalOutlet;
    name: string;
    protected srv: {
        crud: PopEntityEventService;
        tab: PopTabMenuService;
    };
    constructor(el: ElementRef, _domRepo: PopDomService, _tabRepo: PopTabMenuService);
    /**
     * Setup this component
     */
    ngOnInit(): void;
    /**
     * Trigger a portal tab click event
     * @returns void
     */
    onMenuClick(tab: TabConfig): void;
    /**
     * Whenever a user click on tab av button, the portal needs reset to that tab
     * Has specific render so does not use the built-in render intentionally
     * @param tab
     */
    onSetPortal(tab: TabConfig): void;
    /**
     * Trigger a button click event
     * @returns void
     */
    onButtonClick(button: TabButtonInterface): void;
    /**
     * This will bubble a event up to a parent component
     * @param event
     */
    onBubbleEvent(event: PopBaseEventInterface): void;
    /**
     * Clean up the dom of this component
     */
    ngOnDestroy(): void;
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    private _onCrudEvent;
}
