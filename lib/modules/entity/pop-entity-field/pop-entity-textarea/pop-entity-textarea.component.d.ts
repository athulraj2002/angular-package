import { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { FieldConfig } from '../../../../pop-common.model';
import { PopDomService } from '../../../../services/pop-dom.service';
import { PopEntityFieldBoilerComponent as FieldTemplate } from '../pop-entity-field-boiler.component';
import { EntityFieldComponentInterface } from '../pop-entity-field.model';
export declare class PopEntityTextareaComponent extends FieldTemplate implements EntityFieldComponentInterface, OnInit, OnDestroy {
    el: ElementRef;
    protected _domRepo: PopDomService;
    field: FieldConfig;
    name: string;
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
     * This will setup this field to handle changes and transformations
     */
    protected _setFieldAttributes(): boolean;
}
