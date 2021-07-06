import { EventEmitter, OnInit } from '@angular/core';
import { FieldParamInterface, PopBaseEventInterface } from '../../../../../../pop-common.model';
import { InputConfig } from '../../../../../base/pop-field-item/pop-input/input-config.model';
export declare class FieldInputParamComponent implements OnInit {
    config: FieldParamInterface;
    events: EventEmitter<PopBaseEventInterface>;
    param: InputConfig;
    constructor();
    ngOnInit(): void;
}
