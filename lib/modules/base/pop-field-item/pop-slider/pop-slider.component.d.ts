import { EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { PopFieldItemComponent } from '../pop-field-item.component';
import { SliderConfig } from './pop-slider.model';
import { PopBaseEventInterface } from '../../../../pop-common.model';
export declare class PopSliderComponent extends PopFieldItemComponent implements OnInit, OnDestroy {
    config: SliderConfig;
    events: EventEmitter<PopBaseEventInterface>;
    name: string;
    constructor();
    ngOnInit(): void;
    /**
     * On Change event
     * @param value
     * @param force
     */
    onChange(value?: any, force?: boolean): void;
    getSliderTickInterval(): number | 'auto';
    /**
     * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
     */
    ngOnDestroy(): void;
}
