import { OnDestroy, OnInit } from '@angular/core';
import { ComponentTemplateInterface } from './pop-common-dom.models';
import { PopExtendComponent } from './pop-extend.component';
export declare class PopExtendDynamicComponent extends PopExtendComponent implements OnInit, OnDestroy {
    protected template: ComponentTemplateInterface;
    constructor();
    ngOnInit(): void;
    ngOnDestroy(): void;
}
