import { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { PopExtendComponent } from '../../../../pop-extend.component';
import { ActivatedRoute, Router } from '@angular/router';
import { PopDomService } from '../../../../services/pop-dom.service';
export declare class PopErrorRedirectComponent extends PopExtendComponent implements OnInit, OnDestroy {
    el: ElementRef;
    protected _domRepo: PopDomService;
    private route;
    name: string;
    protected srv: {
        router: Router;
    };
    ui: {
        code: number;
        message: string;
    };
    constructor(el: ElementRef, _domRepo: PopDomService, route: ActivatedRoute);
    /**
     * This component should have a specific purpose
     */
    ngOnInit(): void;
    /**
     * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
     */
    ngOnDestroy(): void;
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    private _setRoute;
}
