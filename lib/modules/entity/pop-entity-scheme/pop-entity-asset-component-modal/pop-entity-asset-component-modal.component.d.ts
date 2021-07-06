import { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { EntitySchemeSectionInterface } from '../pop-entity-scheme.model';
import { PopExtendComponent } from '../../../../pop-extend.component';
export declare class PopEntityAssetComponentModalComponent extends PopExtendComponent implements OnInit, OnDestroy {
    el: ElementRef;
    config: EntitySchemeSectionInterface;
    name: string;
    constructor(el: ElementRef);
    /**
     * This component should have a purpose
     */
    ngOnInit(): void;
    /**
     * Clean up the dom of this component
     */
    ngOnDestroy(): void;
}
