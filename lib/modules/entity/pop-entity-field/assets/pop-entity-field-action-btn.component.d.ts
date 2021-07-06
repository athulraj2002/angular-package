import { EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { FieldConfig, PopBaseEventInterface } from '../../../../pop-common.model';
export declare class PopEntityFieldActionBtnComponent implements OnInit, OnDestroy {
    readonly env?: any;
    field: FieldConfig;
    action: 'add' | 'remove';
    events: EventEmitter<PopBaseEventInterface>;
    icon: string;
    tooltip: string;
    constructor(env?: any);
    ngOnInit(): void;
    callAction(): void;
    ngOnDestroy(): void;
}
