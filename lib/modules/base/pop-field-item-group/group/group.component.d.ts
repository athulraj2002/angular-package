import { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { FieldItemGroupConfig } from '../pop-field-item-group.model';
import { Subscription } from 'rxjs';
import { PopExtendDynamicComponent } from '../../../../pop-extend-dynamic.component';
export declare class GroupComponent extends PopExtendDynamicComponent implements OnInit, OnDestroy {
    el: ElementRef;
    private container;
    config: FieldItemGroupConfig;
    subscribers: Subscription[];
    name: string;
    constructor(el: ElementRef);
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
    private _triggerParentChildUpdates;
    /**
     * Whenever a update to the core entity happens the fields in the group should be re-evaluated if there are when conditionals set
     * @private
     */
    private _resetComponentListHidden;
}
