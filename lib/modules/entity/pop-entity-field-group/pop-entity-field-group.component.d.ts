import { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { PopExtendDynamicComponent } from '../../../pop-extend-dynamic.component';
import { FieldGroupInterface, PopBaseEventInterface } from '../../../pop-common.model';
import { PopEntityUtilFieldService } from '../services/pop-entity-util-field.service';
import { PopDomService } from '../../../services/pop-dom.service';
import { PopTabMenuService } from '../../base/pop-tab-menu/pop-tab-menu.service';
export declare class PopEntityFieldGroupComponent extends PopExtendDynamicComponent implements OnInit, OnDestroy {
    el: ElementRef;
    protected _domRepo: PopDomService;
    protected _tabRepo: PopTabMenuService;
    name: string;
    position: number;
    fieldType: 'custom' | 'table';
    interface: FieldGroupInterface;
    private container;
    protected srv: {
        field: PopEntityUtilFieldService;
        tab: PopTabMenuService;
    };
    constructor(el: ElementRef, _domRepo: PopDomService, _tabRepo: PopTabMenuService);
    /**
     * This component receives a list of fields to render
     */
    ngOnInit(): void;
    /**
     * Clean up the dom of this component
     */
    ngOnDestroy(): void;
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    /**
     * This will retrieve any fields that have been marked for the position of this field group
     */
    private _getFieldComponentList;
    /**
     * The fields will trigger a slew of events
     * @param event
     */
    onBubbleEvent(event: PopBaseEventInterface): void;
    /**
     * Whenever a _update to the core entity happens the fields in the group should be re-evaluated if there are when conditionals set
     * @private
     */
    private _resetComponentListHidden;
    /**
     * This will update the option values of related parent/child fields
     * @param name
     * @private
     */
    private _triggerParentChildUpdates;
    /**
     * Get a linear list of the parent child relations from a given point
     * @param self the name to start from (usually the field that has just been changed by user)
     * @param list
     */
    private _getRelationList;
    /**
     * Determine if field has a child relation in the list
     * @param name
     */
    private _fieldHasChild;
    /**
     * Determine if field should be auto filled with the first item in the list
     * @param name
     */
    private _fieldHasAutoFill;
}
