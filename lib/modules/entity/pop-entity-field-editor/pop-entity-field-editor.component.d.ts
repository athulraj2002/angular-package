import { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { PopExtendComponent } from '../../../pop-extend.component';
import { PopFieldEditorService } from './pop-entity-field-editor.service';
import { PopDomService } from '../../../services/pop-dom.service';
import { PopTabMenuService } from '../../base/pop-tab-menu/pop-tab-menu.service';
import { PopRouteHistoryResolver } from '../../../services/pop-route-history.resolver';
import { PopEntityUtilFieldService } from '../services/pop-entity-util-field.service';
export declare class PopEntityFieldEditorComponent extends PopExtendComponent implements OnInit, OnDestroy {
    el: ElementRef;
    protected _domRepo: PopDomService;
    protected _fieldRepo: PopFieldEditorService;
    protected _utilFieldRepo: PopEntityUtilFieldService;
    protected _tabRepo: PopTabMenuService;
    name: string;
    protected srv: {
        field: PopFieldEditorService;
        utilField: PopEntityUtilFieldService;
        history: PopRouteHistoryResolver;
        tab: PopTabMenuService;
    };
    /**
     * @param el
     * @param _domRepo
     * @param _fieldRepo
     * @param _tabRepo
     */
    constructor(el: ElementRef, _domRepo: PopDomService, _fieldRepo: PopFieldEditorService, _utilFieldRepo: PopEntityUtilFieldService, _tabRepo: PopTabMenuService);
    /**
     * This component should have a specific purpose
     */
    ngOnInit(): void;
    /**
     * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
     */
    ngOnDestroy(): void;
}
