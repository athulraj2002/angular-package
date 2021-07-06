import { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { FieldParamInterface, PopBaseEventInterface } from '../../../../../pop-common.model';
import { PopExtendComponent } from '../../../../../pop-extend.component';
export declare class FieldInputSettingComponent extends PopExtendComponent implements OnInit, OnDestroy {
    el: ElementRef;
    config: FieldParamInterface;
    name: string;
    constructor(el: ElementRef);
    /**
     * This component will product an html field to capture a field item setting value
     */
    ngOnInit(): void;
    /**
     * Handle events from the data capture
     * @param event
     */
    onBubbleEvent(event: PopBaseEventInterface): void;
    /**
     * Clean up the dom of this component
     */
    ngOnDestroy(): void;
}
