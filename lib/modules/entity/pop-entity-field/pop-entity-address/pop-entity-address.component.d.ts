import { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { EntityFieldComponentInterface } from '../pop-entity-field.model';
import { FieldConfig } from '../../../../pop-common.model';
import { PopDomService } from '../../../../services/pop-dom.service';
import { PopEntityFieldBoilerComponent as FieldTemplate } from '../pop-entity-field-boiler.component';
export declare class PopEntityAddressComponent extends FieldTemplate implements EntityFieldComponentInterface, OnInit, OnDestroy {
    el: ElementRef;
    protected _domRepo: PopDomService;
    field: FieldConfig;
    name: string;
    protected asset: {
        extensionKeys: any[];
        states: any[];
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
     * Set the initial config
     * Intended to be overridden per field
     */
    protected _setInitialConfig(): void;
    /**
     * This will be different for each type of field group
     * Intended to be overridden in each class, gives the chance to mutate/transform resources if needed
     */
    protected _transformChildren(): void;
    /**
     * This will be different for each type of field group
     * Intended to be overridden in each class
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
    private _updateRegionId;
    private _updateZip;
    /**
     *
     * @param countryConfig
     * @returns
     */
    private _isUSA;
    private _getAddressFromZip;
}
