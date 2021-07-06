import { ElementRef, EventEmitter, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { MatDateRangePicker } from "@angular/material/datepicker";
import { PopFieldItemComponent } from '../../pop-field-item.component';
import { DateRangeExpansionItemsComponent } from './expansion-items/date-range-expansion-items.component';
import { DateRangeConfig } from './date-range-config.models';
import { OverlayContainer } from '@angular/cdk/overlay';
export declare class PopDateRangeComponent extends PopFieldItemComponent implements OnInit, OnDestroy, AfterViewInit {
    el: ElementRef;
    private overlayContainer;
    config: DateRangeConfig;
    apply: EventEmitter<any>;
    ExpansionItems: typeof DateRangeExpansionItemsComponent;
    picker: MatDateRangePicker<any>;
    name: string;
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
     * Get the date control name for start or end
     * @param type: start or end
     */
    getDateControlName(type: 'start' | 'end'): string;
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
     * Determine where the click happened. Return picker close to original state
     * @param $click
     */
    onOutsideCLick($click: any): void;
    /**
     * On Change event
     * @param controlName
     * @param value
     * @param force
     */
    onChange(controlName: 'start' | 'end', value?: any, force?: boolean): void;
    /**
     * Check to see if change is valid
     * @param controlName: start or end
     * @protected
     */
    protected isChangeValid(controlName: 'start' | 'end'): boolean;
    /**
     * Reset Form event
     */
    onResetForm(): void;
    ngOnDestroy(): void;
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    protected _setFilter(): void;
}
