import { EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { ButtonConfig } from './button-config.model';
import { PopBaseEventInterface } from '../../../../pop-common.model';
export declare class PopButtonComponent implements OnInit, OnDestroy {
    config: ButtonConfig;
    events: EventEmitter<PopBaseEventInterface>;
    name: string;
    ngOnInit(): void;
    onClick(event: any): void;
    emitInputEvent(name: any, message?: string): void;
    ngOnDestroy(): void;
}
