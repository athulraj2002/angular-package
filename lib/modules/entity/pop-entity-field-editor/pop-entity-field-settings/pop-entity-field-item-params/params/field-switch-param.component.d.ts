import { EventEmitter, OnInit } from '@angular/core';
import { FieldParamInterface, PopBaseEventInterface } from '../../../../../../pop-common.model';
import { SwitchConfig } from '../../../../../base/pop-field-item/pop-switch/switch-config.model';
export declare class FieldSwitchParamComponent implements OnInit {
    config: FieldParamInterface;
    events: EventEmitter<PopBaseEventInterface>;
    param: SwitchConfig;
    ngOnInit(): void;
}
