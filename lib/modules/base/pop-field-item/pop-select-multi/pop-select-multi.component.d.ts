import { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { SelectMultiConfig } from './select-mulit-config.model';
import { PopFieldItemComponent } from '../pop-field-item.component';
export declare class PopSelectMultiComponent extends PopFieldItemComponent implements OnInit, OnDestroy {
    el: ElementRef;
    config: SelectMultiConfig;
    name: string;
    constructor(el: ElementRef);
    /**
     * This component should have a specific purpose
     */
    ngOnInit(): void;
    /**
     * On Blur Event
     */
    onBlur(): void;
    onClose(open: boolean): void;
    /**
     * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
     */
    ngOnDestroy(): void;
}
