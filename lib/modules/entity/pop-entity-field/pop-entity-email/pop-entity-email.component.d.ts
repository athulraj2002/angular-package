import { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { EntityFieldComponentInterface } from '../pop-entity-field.model';
import { FieldConfig } from '../../../../pop-common.model';
import { PopEntityFieldBoilerComponent as FieldTemplate } from '../pop-entity-field-boiler.component';
import { PopDomService } from '../../../../services/pop-dom.service';
export declare class PopEntityEmailComponent extends FieldTemplate implements EntityFieldComponentInterface, OnInit, OnDestroy {
    el: ElementRef;
    protected _domRepo: PopDomService;
    field: FieldConfig;
    name: string;
    protected asset: {
        extensionKeys: string[];
    };
    constructor(el: ElementRef, _domRepo: PopDomService);
    /**
     * This component should have a specific purpose
     */
    ngOnInit(): void;
    /**
     * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
     */
    ngOnDestroy(): void;
    /**
     * This will setup this field to handle changes and transformations
     */
    protected _setFieldAttributes(): boolean;
    /**
     * This will be different for each type of field group
     * Intended to be overridden in each class
     */
    protected _setFieldItemAttribute(dataKey: number, index: number): boolean;
    private _updateAddress;
}
