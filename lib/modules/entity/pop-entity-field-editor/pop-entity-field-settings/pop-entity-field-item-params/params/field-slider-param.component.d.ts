import { EventEmitter, OnInit } from '@angular/core';
import { FieldParamInterface, PopBaseEventInterface } from '../../../../../../pop-common.model';
import { SliderConfig } from '../../../../../base/pop-field-item/pop-slider/pop-slider.model';
export declare class FieldSliderParamComponent implements OnInit {
    config: FieldParamInterface;
    events: EventEmitter<PopBaseEventInterface>;
    name: string;
    param: SliderConfig;
    /**
     * This component expects config to be a Label config
     */
    ngOnInit(): void;
}
