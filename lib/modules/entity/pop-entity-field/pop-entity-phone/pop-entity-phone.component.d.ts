import { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { EntityFieldComponentInterface } from '../pop-entity-field.model';
import { FieldConfig } from '../../../../pop-common.model';
import { PopDomService } from '../../../../services/pop-dom.service';
import { PopEntityFieldBoilerComponent as FieldTemplate } from '../pop-entity-field-boiler.component';
export declare class PopEntityPhoneComponent extends FieldTemplate implements EntityFieldComponentInterface, OnInit, OnDestroy {
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
    /************************************************************************************************
     *                                                                                              *
     *                                  Override Inherited Methods                                  *
     *                                    ( Protected Methods )                                     *
     *                                                                                              *
     ************************************************************************************************/
    /**
     * Builds the display string
     * @param dataKey
     */
    protected _getAssetDisplayStr(dataKey: number): string;
    /**
     * This will setup this field to handle changes and transformations
     */
    protected _setFieldAttributes(): boolean;
    protected _setFieldItemAttribute(dataKey: number, index: number): boolean;
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    private _updateCountry;
    private _updateNumber;
    private _updateExtension;
    private _updateNumberLabel;
    private _updateNumberLabelToMatchEntry;
    /**
     * The label of value entry should match the type
     * @param dataKey
     */
    private _updateNumberLabelToMatchType;
}
