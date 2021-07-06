import { ElementRef, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { CoreConfig, EntityExtendInterface, EventPromiseCallback, PopBaseEventInterface } from './pop-common.model';
import { HasEvents, HasCore, ComponentTraitContainerInterface, ComponentDomInterface, ComponentLogInterface } from './pop-common-dom.models';
import { PopDomService } from './services/pop-dom.service';
import { PopTabMenuService } from './modules/base/pop-tab-menu/pop-tab-menu.service';
export declare class PopExtendComponent implements HasEvents, HasCore, OnInit, OnDestroy {
    position: number;
    core: CoreConfig;
    events: EventEmitter<PopBaseEventInterface>;
    extension: EntityExtendInterface;
    onLoad?: EventPromiseCallback;
    onEvent?: EventPromiseCallback;
    onUnload?: EventPromiseCallback;
    when: any[];
    hidden: boolean;
    name: string;
    internal_name: string;
    protected id: string | number;
    protected el: ElementRef;
    protected trait: ComponentTraitContainerInterface;
    protected asset: any;
    protected srv: any;
    protected _domRepo: PopDomService;
    protected _tabRepo: PopTabMenuService;
    /**
     * The Dom is boiler plate for managing the state and assets of the html view
     */
    dom: ComponentDomInterface;
    log: ComponentLogInterface;
    /**
     * The ui is a container for assets that are created for the html view specifically
     */
    ui: any;
    constructor();
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
    private _initializeDom;
    private _initializeLogSystem;
}
