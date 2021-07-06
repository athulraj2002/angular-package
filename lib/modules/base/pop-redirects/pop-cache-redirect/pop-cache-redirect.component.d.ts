import { OnDestroy, OnInit } from '@angular/core';
import { PopEntityService } from '../../../entity/services/pop-entity.service';
import { PopExtendComponent } from '../../../../pop-extend.component';
import { Router } from '@angular/router';
export declare class PopCacheRedirectComponent extends PopExtendComponent implements OnInit, OnDestroy {
    name: string;
    protected srv: {
        router: Router;
        entity: PopEntityService;
    };
    ui: {
        code: number;
        message: string;
    };
    constructor();
    /**
     * This component allows a redirect that will clear all cache and then return back to the url
     */
    ngOnInit(): void;
    /**
     * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
     */
    ngOnDestroy(): void;
}
