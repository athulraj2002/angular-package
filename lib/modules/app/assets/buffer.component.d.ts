import { OnDestroy, OnInit } from '@angular/core';
export declare class PopTemplateBufferComponent implements OnInit, OnDestroy {
    data: any;
    expression: any;
    color: string;
    mode: string;
    bufferValue: number;
    value: number;
    interval: any;
    constructor(data: any);
    ngOnInit(): void;
    ngOnDestroy(): void;
    private _meterProgress;
}
