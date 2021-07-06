import { EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { FieldParamInterface, PopBaseEventInterface } from '../../../../../../pop-common.model';
import { NumberConfig } from '../../../../../base/pop-field-item/pop-number/number-config.model';
export declare class FieldNumberParamComponent implements OnInit, OnDestroy {
    config: FieldParamInterface;
    events: EventEmitter<PopBaseEventInterface>;
    param: NumberConfig;
    constructor();
    ngOnInit(): void;
    ngOnDestroy(): void;
}
