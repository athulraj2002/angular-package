import { AfterViewInit, ElementRef, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FieldItemGroupConfig } from './pop-field-item-group.model';
import { PopExtendComponent } from '../../../pop-extend.component';
import { Entity, PopBaseEventInterface } from '../../../pop-common.model';
export declare class PopFieldItemGroupComponent extends PopExtendComponent implements OnInit, OnDestroy, AfterViewInit {
    el: ElementRef;
    config: FieldItemGroupConfig;
    close: EventEmitter<Entity>;
    name: string;
    protected srv: {
        dialog: MatDialog;
    };
    constructor(el: ElementRef);
    /**
     * This component will take a list of field item configs and render them in a column list
     */
    ngOnInit(): void;
    ngAfterViewInit(): void;
    /**
     * This fx will bubble events up the pipeline
     * @param event
     */
    onBubbleEvent(event: PopBaseEventInterface): void;
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
     * This fx will load the field item list in a dialog modal, this is for typically for creating entities and such actions.
     * This will allow all the fields items to be placed in an angular form so all the data can be validated collectively.
     * @private
     */
    private _loadGroupInDialogBox;
}
