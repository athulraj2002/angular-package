import { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { PopEntitySchemeService } from './pop-entity-scheme.service';
import { PopExtendComponent } from '../../../pop-extend.component';
import { PopDomService } from '../../../services/pop-dom.service';
import { PopTabMenuService } from '../../base/pop-tab-menu/pop-tab-menu.service';
export declare class PopEntitySchemeComponent extends PopExtendComponent implements OnInit, OnDestroy {
    el: ElementRef;
    protected _domRepo: PopDomService;
    protected _schemeRepo: PopEntitySchemeService;
    protected _tabRepo: PopTabMenuService;
    name: string;
    protected srv: {
        scheme: PopEntitySchemeService;
        tab: PopTabMenuService;
    };
    /**
     *
     * @param el
     * @param _domRepo - transfer
     * @param _schemeRepo - transfer
     * @param _tabRepo - transfer
     */
    constructor(el: ElementRef, _domRepo: PopDomService, _schemeRepo: PopEntitySchemeService, _tabRepo: PopTabMenuService);
    ngOnInit(): void;
    ngOnDestroy(): void;
}
