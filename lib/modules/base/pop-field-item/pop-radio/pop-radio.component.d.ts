import { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { MatRadioChange } from '@angular/material/radio';
import { RadioConfig } from './radio-config.model';
import { PopFieldItemComponent } from '../pop-field-item.component';
export declare class PopRadioComponent extends PopFieldItemComponent implements OnInit, OnDestroy {
    el: ElementRef;
    config: RadioConfig;
    name: string;
    constructor(el: ElementRef);
    /**
     * This component should have a specific purpose
     */
    ngOnInit(): void;
    onSelection(change: MatRadioChange): void;
    /**
     * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
     */
    ngOnDestroy(): void;
}
