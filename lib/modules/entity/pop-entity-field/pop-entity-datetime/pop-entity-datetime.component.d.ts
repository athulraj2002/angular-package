import { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { PopExtendComponent } from '../../../../pop-extend.component';
import { FieldConfig, PopBaseEventInterface } from '../../../../pop-common.model';
export declare class PopEntityDatetimeComponent extends PopExtendComponent implements OnInit, OnDestroy {
    el: ElementRef;
    field: FieldConfig;
    name: string;
    constructor(el: ElementRef);
    /**
     * This component should have a specific purpose
     */
    ngOnInit(): void;
    setDateItem(): void;
    setTimeItem(): void;
    emitInputEvent(name: any, config: any, message?: string, success?: boolean): void;
    handleDateEvent(event: any): void;
    handleEvent(event: PopBaseEventInterface): void;
    handleTimeEvent(event: any): void;
    /**
     * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
     */
    ngOnDestroy(): void;
}
