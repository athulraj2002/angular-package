import { ChangeDetectorRef, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { PopFieldItemComponent } from '../pop-field-item.component';
import { MinMaxConfig } from './min-max.models';
import { PopBaseEventInterface } from '../../../../pop-common.model';
export declare class PopMinMaxComponent extends PopFieldItemComponent implements OnInit, OnDestroy {
    el: ElementRef;
    protected cdr: ChangeDetectorRef;
    config: MinMaxConfig;
    name: string;
    constructor(el: ElementRef, cdr: ChangeDetectorRef);
    /**
     * This component should have a specific purpose
     */
    ngOnInit(): void;
    onIsMaxEvent(event: PopBaseEventInterface): void;
    onIsMinEvent(event: PopBaseEventInterface): void;
    onMinEvent(event: PopBaseEventInterface): void;
    onMaxEvent(event: PopBaseEventInterface): void;
    onDecrementMin(): void;
    onIncrementMin(): void;
    onDecrementMax(): void;
    onIncrementMax(): void;
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
    private _triggerMinChange;
    private _triggerMaxChange;
    private _updateMinOptions;
    private _setControlValue;
}
