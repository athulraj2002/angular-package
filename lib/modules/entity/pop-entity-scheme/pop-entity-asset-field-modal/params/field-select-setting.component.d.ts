import { EventEmitter, OnInit } from '@angular/core';
import { SelectConfig } from '../../../../base/pop-field-item/pop-select/select-config.model';
import { Subscription } from 'rxjs';
import { FieldSettingInterface } from '../../pop-entity-scheme.model';
import { PopBaseEventInterface } from '../../../../../pop-common.model';
export declare class FieldSelectSettingComponent implements OnInit {
    config: FieldSettingInterface;
    events: EventEmitter<PopBaseEventInterface>;
    param: SelectConfig;
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
    ngOnInit(): void;
}
