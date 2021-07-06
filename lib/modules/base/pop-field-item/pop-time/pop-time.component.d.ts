import { ChangeDetectorRef, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { TimeConfig } from './time-config.model';
import { PopFieldItemComponent } from '../pop-field-item.component';
export declare class PopTimeComponent extends PopFieldItemComponent implements OnInit, OnDestroy {
    el: ElementRef;
    protected cdr: ChangeDetectorRef;
    config: TimeConfig;
    name: string;
    constructor(el: ElementRef, cdr: ChangeDetectorRef);
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
    protected setSelectedValues(): void;
    protected setHoursAndMinutes(): void;
    protected setTimeValue(): void;
}
