import { OnDestroy, OnInit } from '@angular/core';
import { PopExtendComponent } from '../../../../pop-extend.component';
import { Route, Router } from '@angular/router';
import { PopBaseService } from "../../../../services/pop-base.service";
import { MainSpinner } from "../../pop-indicators/pop-indicators.model";
export declare class PopGuardRedirectComponent extends PopExtendComponent implements OnInit, OnDestroy {
    protected _baseRepo: PopBaseService;
    protected _routerRepo: Router;
    protected srv: {
        base: PopBaseService;
        router: Router;
    };
    protected asset: {
        sentimentIndex: number;
        sentiments: string[];
        exclamations: string[];
        route: Route;
    };
    ui: {
        exclamation: string;
        sentiment: string;
        spinner: MainSpinner;
    };
    constructor(_baseRepo: PopBaseService, _routerRepo: Router);
    ngOnInit(): void;
    ngOnDestroy(): void;
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    private setInitialConfig;
    private _improveSentiment;
    /**
     *
     * @private
     */
    private _routeApp;
}
