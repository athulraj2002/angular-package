import { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { ProfileSchemeFieldInterface } from '../../../pop-entity-scheme.model';
import { PopExtendComponent } from '../../../../../../pop-extend.component';
export declare class EntitySchemeTableContentComponent extends PopExtendComponent implements OnInit, OnDestroy {
    el: ElementRef;
    config: ProfileSchemeFieldInterface;
    name: string;
    constructor(el: ElementRef);
    /**
     * This component is responsible to render the inner contents of table asset
     * A table asset is basically a column that exists on the base table of an entity, ..ie: id, name, description ...
     */
    ngOnInit(): void;
    /**
     * Clean up the dom of this component
     */
    ngOnDestroy(): void;
}
