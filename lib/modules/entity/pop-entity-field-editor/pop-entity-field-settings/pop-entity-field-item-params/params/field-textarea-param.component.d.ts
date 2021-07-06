import { EventEmitter, OnInit } from '@angular/core';
import { FieldParamInterface, PopBaseEventInterface } from '../../../../../../pop-common.model';
import { TextareaConfig } from '../../../../../base/pop-field-item/pop-textarea/textarea-config.model';
export declare class FieldTextareaParamComponent implements OnInit {
    config: FieldParamInterface;
    events: EventEmitter<PopBaseEventInterface>;
    param: TextareaConfig;
    ngOnInit(): void;
}
