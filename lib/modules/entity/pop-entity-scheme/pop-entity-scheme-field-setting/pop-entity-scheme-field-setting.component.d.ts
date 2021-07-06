import { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { PopExtendDynamicComponent } from '../../../../pop-extend-dynamic.component';
import { PopDomService } from '../../../../services/pop-dom.service';
import { EntitySchemeSectionInterface } from '../pop-entity-scheme.model';
import { InputConfig } from '../../../base/pop-field-item/pop-input/input-config.model';
import { CoreConfig, FieldInterface } from '../../../../pop-common.model';
import { PopFieldEditorService } from '../../pop-entity-field-editor/pop-entity-field-editor.service';
import { SwitchConfig } from '../../../base/pop-field-item/pop-switch/switch-config.model';
import { MatDialogRef } from '@angular/material/dialog';
import { PopEntityUtilFieldService } from '../../services/pop-entity-util-field.service';
export declare class PopEntitySchemeFieldSettingComponent extends PopExtendDynamicComponent implements OnInit, OnDestroy {
    el: ElementRef;
    dialog: MatDialogRef<PopEntitySchemeFieldSettingComponent>;
    protected _domRepo: PopDomService;
    protected _fieldRepo: PopFieldEditorService;
    protected _utilFieldRepo: PopEntityUtilFieldService;
    container: any;
    config: EntitySchemeSectionInterface;
    name: string;
    protected srv: {
        field: PopFieldEditorService;
        utilField: PopEntityUtilFieldService;
    };
    protected asset: {
        currentFieldTraitEntryMapping: any;
        currentPrimary: any;
        fieldTraitEntryMapping: any;
        fieldCore: CoreConfig;
        field: FieldInterface;
        scheme: EntitySchemeSectionInterface;
        storage: any;
    };
    ui: {
        name: InputConfig;
        makePrimary: SwitchConfig;
        showName: SwitchConfig;
        showNameCore: CoreConfig;
        profileRequired: SwitchConfig;
    };
    onEscapeHandler(event: KeyboardEvent): void;
    constructor(el: ElementRef, dialog: MatDialogRef<PopEntitySchemeFieldSettingComponent>, _domRepo: PopDomService, _fieldRepo: PopFieldEditorService, _utilFieldRepo: PopEntityUtilFieldService);
    onFormClose(): void;
    onOutsideCLick(): void;
    /**
     * This component should have a specific purpose
     */
    ngOnInit(): void;
    /**
     * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
     */
    ngOnDestroy(): void;
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    private _setInitialConfig;
    /**
     * Helper function that renders the list of dynamic components
     *
     */
    private _templateRender;
}
