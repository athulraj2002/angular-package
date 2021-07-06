import { ChangeDetectorRef, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { PopFieldItemComponent } from '../pop-field-item.component';
import { NumberConfig } from './number-config.model';
export declare class PopNumberComponent extends PopFieldItemComponent implements OnInit, OnDestroy {
    el: ElementRef;
    protected cdr: ChangeDetectorRef;
    config: NumberConfig;
    name: string;
    constructor(el: ElementRef, cdr: ChangeDetectorRef);
    /**
     * This component should have a specific purpose
     */
    ngOnInit(): void;
    /**
     * Test
     * @param event
     */
    onKeyUp(event: any): void;
    /**
     * Hook that is called right before a patch
     */
    protected _beforePatch(): Promise<boolean>;
    /**
     * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
     */
    ngOnDestroy(): void;
    private _checkValue;
}
