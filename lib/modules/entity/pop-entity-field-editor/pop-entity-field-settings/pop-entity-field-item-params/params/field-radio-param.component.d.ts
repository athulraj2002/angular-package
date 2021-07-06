import { ChangeDetectorRef, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { PopCommonService } from '../../../../../../services/pop-common.service';
import { FieldParamInterface, PopBaseEventInterface } from '../../../../../../pop-common.model';
import { RadioConfig } from '../../../../../base/pop-field-item/pop-radio/radio-config.model';
export declare class FieldRadioParamComponent implements OnInit, OnDestroy {
    private commonRepo;
    private changeDetectorRef;
    config: FieldParamInterface;
    events: EventEmitter<PopBaseEventInterface>;
    param: RadioConfig;
    constructor(commonRepo: PopCommonService, changeDetectorRef: ChangeDetectorRef);
    ngOnInit(): void;
    ngOnDestroy(): void;
}
