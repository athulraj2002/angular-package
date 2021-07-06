import { EventEmitter, OnInit } from '@angular/core';
import { FieldConfig, PopBaseEventInterface } from '../../../../../pop-common.model';
export declare class PopEntityFieldEditIconComponent implements OnInit {
    dom: any;
    field: FieldConfig;
    events: EventEmitter<PopBaseEventInterface>;
    constructor();
    ngOnInit(): void;
    onEdit(): void;
}
