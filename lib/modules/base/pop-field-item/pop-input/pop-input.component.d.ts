import { OnInit, OnDestroy, ElementRef } from '@angular/core';
import { InputConfig } from './input-config.model';
import { PopFieldItemComponent } from '../pop-field-item.component';
export declare class PopInputComponent extends PopFieldItemComponent implements OnInit, OnDestroy {
    el: ElementRef;
    config: InputConfig;
    inputField: any;
    name: string;
    constructor(el: ElementRef);
    /**
     * This component should have a specific purpose
     */
    ngOnInit(): void;
    onKeyUp(event: any): void;
    /**
     * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
     */
    ngOnDestroy(): void;
}
