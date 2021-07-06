import { OnDestroy, OnInit } from '@angular/core';
import { PopExtendComponent } from '../../../../pop-extend.component';
import { PopDomService } from '../../../../services/pop-dom.service';
import { PopEntitySchemeService } from '../pop-entity-scheme.service';
import { PopTabMenuService } from '../../../base/pop-tab-menu/pop-tab-menu.service';
import { PopBaseEventInterface } from '../../../../pop-common.model';
export declare class PopEntitySchemeDetailsComponent extends PopExtendComponent implements OnInit, OnDestroy {
    protected _domRepo: PopDomService;
    protected _tabRepo: PopTabMenuService;
    protected _schemeRepo: PopEntitySchemeService;
    name: string;
    protected srv: {
        scheme: PopEntitySchemeService;
        tab: PopTabMenuService;
    };
    ui: {};
    constructor(_domRepo: PopDomService, _tabRepo: PopTabMenuService, _schemeRepo: PopEntitySchemeService);
    ngOnInit(): void;
    onBubbleEvent(event: PopBaseEventInterface): void;
    ngOnDestroy(): void;
}
