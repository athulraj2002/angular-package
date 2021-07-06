import { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { DatePickerConfig } from './datepicker-config.model';
import { PopFieldItemComponent } from '../pop-field-item.component';
export declare class PopDatePickerComponent extends PopFieldItemComponent implements OnInit, OnDestroy {
    el: ElementRef;
    config: DatePickerConfig;
    name: string;
    constructor(el: ElementRef);
    /**
     * This component should have a specific purpose
     */
    ngOnInit(): void;
    /**
     * On Change event
     * @param value
     * @param force
     */
    onChange(value?: any, force?: boolean): void;
    onResetForm(): void;
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
    protected _setFilter(): void;
}
