import { ChangeDetectorRef, EventEmitter, OnInit } from '@angular/core';
import { TextareaConfig } from '../../../../base/pop-field-item/pop-textarea/textarea-config.model';
import { FieldSettingInterface } from '../../pop-entity-scheme.model';
import { PopBaseEventInterface } from '../../../../../pop-common.model';
export declare class FieldTextareaSettingComponent implements OnInit {
    private changeDetectorRef;
    config: FieldSettingInterface;
    events: EventEmitter<PopBaseEventInterface>;
    param: TextareaConfig;
    constructor(changeDetectorRef: ChangeDetectorRef);
    ngOnInit(): void;
}
