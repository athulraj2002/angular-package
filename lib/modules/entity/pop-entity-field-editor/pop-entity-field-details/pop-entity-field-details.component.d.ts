import { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { PopDomService } from '../../../../services/pop-dom.service';
import { PopExtendComponent } from '../../../../pop-extend.component';
import { PopFieldEditorService } from '../pop-entity-field-editor.service';
import { Dictionary, FieldInterface, PopBaseEventInterface } from '../../../../pop-common.model';
import { SwitchConfig } from '../../../base/pop-field-item/pop-switch/switch-config.model';
export declare class PopEntityFieldDetailsComponent extends PopExtendComponent implements OnInit, OnDestroy {
    el: ElementRef;
    protected _domRepo: PopDomService;
    private fieldRepo;
    field: FieldInterface;
    name: string;
    protected srv: {
        field: PopFieldEditorService;
    };
    protected asset: {};
    ui: {
        field: FieldInterface;
        customSetting: Dictionary<any>;
        multiple: SwitchConfig;
    };
    protected extendServiceContainer(): void;
    constructor(el: ElementRef, _domRepo: PopDomService, fieldRepo: PopFieldEditorService);
    ngOnInit(): void;
    /**
     * Event handler for the parent tab to tell this name to reset itself
     * @param reset
     */
    onBubbleEvent(event: PopBaseEventInterface): void;
    ngOnDestroy(): void;
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    private _buildCustomSettings;
}
