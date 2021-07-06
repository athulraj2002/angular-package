import { ElementRef, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { SwitchConfig } from './switch-config.model';
import { PopBaseEventInterface } from '../../../../pop-common.model';
import { PopFieldItemComponent } from '../pop-field-item.component';
export declare class PopSwitchComponent extends PopFieldItemComponent implements OnInit, OnDestroy {
    el: ElementRef;
    private switchRef;
    private feedbackRef;
    config: SwitchConfig;
    events: EventEmitter<PopBaseEventInterface>;
    name: string;
    constructor(el: ElementRef);
    /**
     * This component should have a specific purpose
     */
    ngOnInit(): void;
    onEnter(event: any): void;
    onSelection(change: {
        checked: boolean;
    }): void;
    /************************************************************************************************
     *                                                                                              *
     *                                    Base Class Overrides                                      *
     *                                    ( Protected Method )                                      *
     *               These are protected instead of private so that they can be overridden          *
     *                                                                                              *
     ************************************************************************************************/
    protected _beforePatch(): Promise<boolean>;
    /**
     * Called after a successful patch
     */
    protected _afterPatch(): Promise<boolean>;
    /**
     * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
     */
    ngOnDestroy(): void;
}
