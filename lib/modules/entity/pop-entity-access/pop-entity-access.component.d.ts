import { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { PopExtendComponent } from '../../../pop-extend.component';
import { PopBaseEventInterface } from '../../../pop-common.model';
export declare class PopEntityAccessComponent extends PopExtendComponent implements OnInit, OnDestroy {
    el: ElementRef;
    protected srv: import("../../../pop-common-dom.models").ServiceContainerInterface;
    name: string;
    protected extendServiceContainer(): void;
    constructor(el: ElementRef);
    /**
     * This component should have a specific purpose
     */
    ngOnInit(): void;
    checkAll(app: any, access: any): void;
    setExpansionState(state?: string): void;
    handleInputEvents(event: any): void;
    checkAppAll(app: any, access: any, val: any): void;
    sessionChanges(event: PopBaseEventInterface): boolean;
    toggleApp(app: any): void;
    /**
     * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
     */
    ngOnDestroy(): void;
}
