import { AfterViewInit, ChangeDetectorRef, ElementRef, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { CheckboxConfig } from './checkbox-config.model';
import { PopFieldItemComponent } from '../pop-field-item.component';
export declare class PopCheckboxComponent extends PopFieldItemComponent implements OnInit, AfterViewInit, OnDestroy {
    el: ElementRef;
    private renderer;
    protected cdr: ChangeDetectorRef;
    config: CheckboxConfig;
    name: string;
    constructor(el: ElementRef, renderer: Renderer2, cdr: ChangeDetectorRef);
    /**
     * This component should have a specific purpose
     */
    ngOnInit(): void;
    /**
     * This will position the feedback container in the right spot
     */
    ngAfterViewInit(): void;
    onEnter(event: any): void;
    _beforePatch(): Promise<boolean>;
    _afterPatch(): Promise<boolean>;
    protected _onPatchSuccessAdditional(): boolean;
    protected _onPatchFailAdditional(): boolean;
    /**
     * This will trigger when the user click the checkbox to subject its value
     * This updates the config value since that is auto-handled with this input type
     */
    onToggleValue(): void;
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
     * This will make the checkbox hidden in the view
     */
    private _onHideCheckbox;
    /**
     * This will make the checkbox visible in the view
     */
    private _displayCheckbox;
}
