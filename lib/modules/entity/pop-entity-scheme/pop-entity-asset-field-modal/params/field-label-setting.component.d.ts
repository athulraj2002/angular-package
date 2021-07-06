import { ChangeDetectorRef, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { PopCommonService } from '../../../../../services/pop-common.service';
import { FieldSettingInterface } from '../../pop-entity-scheme.model';
export declare class FieldLabelSettingComponent implements OnInit {
    private commonRepo;
    private changeDetectorRef;
    config: FieldSettingInterface;
    state: {
        selected: number;
        system: boolean;
        loaded: boolean;
        loading: boolean;
        error: {
            code: number;
            message: string;
        };
    };
    subscriber: {
        data: Subscription;
    };
    field: {
        type: string;
        items: any;
        active: {};
    };
    active: {
        item: any;
    };
    models: {};
    configs: {};
    constructor(commonRepo: PopCommonService, changeDetectorRef: ChangeDetectorRef);
    ngOnInit(): void;
}
