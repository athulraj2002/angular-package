import { ChangeDetectorRef, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { RadioConfig } from '../../../../base/pop-field-item/pop-radio/radio-config.model';
import { PopCommonService } from '../../../../../services/pop-common.service';
import { FieldSettingInterface } from '../../pop-entity-scheme.model';
import { PopBaseEventInterface } from '../../../../../pop-common.model';
export declare class FieldRadioSettingComponent implements OnInit, OnDestroy {
    private commonRepo;
    private changeDetectorRef;
    config: FieldSettingInterface;
    events: EventEmitter<PopBaseEventInterface>;
    param: RadioConfig;
    constructor(commonRepo: PopCommonService, changeDetectorRef: ChangeDetectorRef);
    ngOnInit(): void;
    ngOnDestroy(): void;
}
