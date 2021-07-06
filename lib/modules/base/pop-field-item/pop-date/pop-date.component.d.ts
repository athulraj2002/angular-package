import { ElementRef, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { MatDatepicker } from "@angular/material/datepicker";
import { DateConfig } from './date-config.model';
import { PopFieldItemComponent } from '../pop-field-item.component';
import { ExpansionItemsComponent } from './datepicker-expansion-items/expansion-items.component';
import { OverlayContainer } from '@angular/cdk/overlay';
export declare class PopDateComponent extends PopFieldItemComponent implements OnInit, OnDestroy, AfterViewInit {
    el: ElementRef;
    private overlayContainer;
    config: DateConfig;
    picker: MatDatepicker<any>;
    name: string;
    ExpansionItems: typeof ExpansionItemsComponent;
    private selfClose;
    constructor(el: ElementRef, overlayContainer: OverlayContainer);
    /**
     * On init hook
     */
    ngOnInit(): void;
    /**
     * After view init hook
     *  Backup picker close method
     */
    ngAfterViewInit(): void;
    /**
     * on Open Event
     * Overwrite picker close to prevent auto closing
     */
    onOpen(): void;
    /**
     * Removes Expanded Class from the Overlay Container if needed
     */
    removeExpandedClass(): void;
    /**
     * On Change event
     * @param value
     * @param force
     */
    onChange(value?: any, force?: boolean): void;
    /**
     * Reset the Form
     */
    onResetForm(): void;
    /**
     * Determine where the click happened. Return picker close to original state
     * @param $click
     */
    onOutsideCLick($click: any): void;
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
    protected _setFilter(): void;
}
