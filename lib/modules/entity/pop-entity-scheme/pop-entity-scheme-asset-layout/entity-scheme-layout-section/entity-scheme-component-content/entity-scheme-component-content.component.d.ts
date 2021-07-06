import { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { PopExtendComponent } from '../../../../../../pop-extend.component';
export declare class EntitySchemeComponentContentComponent extends PopExtendComponent implements OnInit, OnDestroy {
    el: ElementRef;
    config: any;
    name: string;
    constructor(el: ElementRef);
    /**
     * This component is responsible to render the inner contents of component asset
     * A component asset is custom widget that has been created for the entityId
     */
    ngOnInit(): void;
    /**
     * Clean up the dom of this component
     */
    ngOnDestroy(): void;
}
