import { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { TabPositionInterface } from '../../base/pop-tab-menu/tab-menu.model';
import { EntityExtendInterface, PopBaseEventInterface } from '../../../pop-common.model';
import { PopTabMenuService } from '../../base/pop-tab-menu/pop-tab-menu.service';
import { PopExtendDynamicComponent } from '../../../pop-extend-dynamic.component';
import { PopDomService } from '../../../services/pop-dom.service';
export declare class PopEntityTabColumnComponent extends PopExtendDynamicComponent implements OnInit, OnDestroy {
    el: ElementRef;
    protected _domRepo: PopDomService;
    protected _tabRepo: PopTabMenuService;
    column: TabPositionInterface;
    container: any;
    extension: EntityExtendInterface;
    name: string;
    protected srv: {
        tab: PopTabMenuService;
    };
    ui: {
        tabId: number;
    };
    constructor(el: ElementRef, _domRepo: PopDomService, _tabRepo: PopTabMenuService);
    /**
     * The component should take a specific section/column of a defined tab, and dynamically render all of the components that belong in that section
     */
    ngOnInit(): void;
    /**
     * Event handler for the parent tab to tell this column to reset itself
     * @param reset
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
    /**
     * Event handler for the parent tab to tell this column to reset itself
     * @param reset
     */
    private _onColumnResetEvent;
    /**
     * Helper function that determines what the height of this component should be
     *
     */
    private _determineHeight;
    /**
     * Helper function that renders the list of dynamic components
     *
     */
    private _templateRender;
    /**
     * Reaches up to the parent container and sets the current scroll position
     * The parent container component uses an *ngIf that prevents using @viewChild to do this
     */
    private _applyScrollTop;
    /**
     * Reaches up to the parent container and stores the current scroll position
     * The parent container component uses an *ngIf that prevents using @viewChild to do this
     */
    private _setScrollTop;
}
