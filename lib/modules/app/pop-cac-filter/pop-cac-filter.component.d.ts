import { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { PopExtendComponent } from '../../../pop-extend.component';
import { AppGlobalInterface, EntityFilterInterface, PopBaseEventInterface } from '../../../pop-common.model';
import { PopCacFilterBarService } from './pop-cac-filter.service';
import { CacFilterBarConfig } from './pop-cac-filter.model';
export declare class PopCacFilterComponent extends PopExtendComponent implements OnInit, OnDestroy {
    el: ElementRef;
    private APP_GLOBAL;
    hidden: boolean;
    config: CacFilterBarConfig;
    name: string;
    protected srv: {
        filter: PopCacFilterBarService;
    };
    protected asset: {
        filter: any;
    };
    ui: {
        config: CacFilterBarConfig;
        entities: EntityFilterInterface[];
    };
    constructor(el: ElementRef, APP_GLOBAL: AppGlobalInterface);
    /**
     * This component should have a specific purpose
     */
    ngOnInit(): void;
    /**
     * Event Emitter
     */
    onBubbleEvent(event: PopBaseEventInterface): void;
    /**
     * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
     */
    ngOnDestroy(): void;
}
