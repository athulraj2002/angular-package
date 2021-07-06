import { ChangeDetectorRef, EventEmitter, OnInit } from '@angular/core';
import { SwitchConfig } from '../../../../base/pop-field-item/pop-switch/switch-config.model';
import { PopCommonService } from '../../../../../services/pop-common.service';
import { FieldSettingInterface } from '../../pop-entity-scheme.model';
import { PopBaseEventInterface } from '../../../../../pop-common.model';
export declare class FieldSwitchSettingComponent implements OnInit {
    private commonRepo;
    private changeDetectorRef;
    config: FieldSettingInterface;
    events: EventEmitter<PopBaseEventInterface>;
    param: SwitchConfig;
    constructor(commonRepo: PopCommonService, changeDetectorRef: ChangeDetectorRef);
    ngOnInit(): void;
}
