import { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { PopExtendComponent } from '../../../../pop-extend.component';
import { PopDomService } from '../../../../services/pop-dom.service';
import { PopFieldEditorService } from '../pop-entity-field-editor.service';
import { Dictionary, FieldInterface } from '../../../../pop-common.model';
import { EntitySchemeSectionInterface } from '../../pop-entity-scheme/pop-entity-scheme.model';
export declare class PopEntityFieldSettingsComponent extends PopExtendComponent implements OnInit, OnDestroy {
    el: ElementRef;
    protected _domRepo: PopDomService;
    protected _fieldRepo: PopFieldEditorService;
    field: FieldInterface;
    scheme: EntitySchemeSectionInterface;
    name: string;
    protected srv: {
        field: PopFieldEditorService;
    };
    protected asset: {
        schemeFieldSetting: Dictionary<any>;
    };
    /**
     * @param el
     * @param _domRepo - transfer
     * @param _fieldRepo - transfer
     */
    constructor(el: ElementRef, _domRepo: PopDomService, _fieldRepo: PopFieldEditorService);
    /**
     * This component should have a specific purpose
     */
    ngOnInit(): void;
    /**
     * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
     */
    ngOnDestroy(): void;
}
