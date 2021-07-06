import { EventEmitter, OnInit } from '@angular/core';
import { FieldParamInterface, PopBaseEventInterface } from '../../../../../../pop-common.model';
import { SelectConfig } from '../../../../../base/pop-field-item/pop-select/select-config.model';
export declare class FieldSelectParamComponent implements OnInit {
    config: FieldParamInterface;
    events: EventEmitter<PopBaseEventInterface>;
    hidden: boolean;
    param: SelectConfig;
    ngOnInit(): void;
}
