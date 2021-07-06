import { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { LabelConfig } from './label-config.model';
import { PopFieldItemComponent } from '../pop-field-item.component';
export declare class PopLabelComponent extends PopFieldItemComponent implements OnInit, OnDestroy {
    el: ElementRef;
    config: LabelConfig;
    name: string;
    constructor(el: ElementRef);
    /**
     * This component should have a specific purpose
     */
    ngOnInit(): void;
    /**
     * The user can click on a link to route to another part of the app
     */
    onRouteLink(): Promise<boolean> | import("../../../../pop-common.model").PopBaseEventInterface;
    /**
     * The user can click on a label button to copy a value into the clipboard
     */
    onLabelCopy(): void;
    /**
     * The user can click on a button value and copy a value to the clipboard
     */
    onValueCopy(): void;
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
     * This fx basically checks the label value to sees if it can be associated with a color scheme aka warning, success, error
     */
    protected _setValueButtonTheme(): void;
}
