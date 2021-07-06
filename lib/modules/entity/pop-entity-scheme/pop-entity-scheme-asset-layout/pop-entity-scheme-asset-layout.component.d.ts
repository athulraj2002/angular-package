import { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { PopEntitySchemeService } from '../pop-entity-scheme.service';
import { PopExtendComponent } from '../../../../pop-extend.component';
import { PopDomService } from '../../../../services/pop-dom.service';
export declare class PopEntitySchemeAssetLayoutComponent extends PopExtendComponent implements OnInit, OnDestroy {
    el: ElementRef;
    protected _domRepo: PopDomService;
    protected _schemeRepo: PopEntitySchemeService;
    name: string;
    protected srv: {
        scheme: PopEntitySchemeService;
    };
    constructor(el: ElementRef, _domRepo: PopDomService, _schemeRepo: PopEntitySchemeService);
    /**
     * Setup this component
     */
    ngOnInit(): void;
    /**
     * Clean up the dom of this component
     */
    ngOnDestroy(): void;
}
