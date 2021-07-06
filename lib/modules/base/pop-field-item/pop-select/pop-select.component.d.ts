import { ElementRef, OnDestroy, OnInit } from '@angular/core';
import { SelectConfig } from './select-config.model';
import { PopFieldItemComponent } from '../pop-field-item.component';
export declare class PopSelectComponent extends PopFieldItemComponent implements OnInit, OnDestroy {
    el: ElementRef;
    config: SelectConfig;
    name: string;
    optionsTopPos: string;
    ui: {
        selected: {
            config: any;
        };
    };
    constructor(el: ElementRef);
    ngOnInit(): void;
    /**
     * SelectsOption
     * @param optionValue: option value selected
     */
    onOptionSelected(optionValue: string | number): void;
    /**
     *  Select Box clicked
     *  @returns void
     */
    onSelectionClick($event: any): void;
    /**
     * Closes the dropdown if it is active.
     * This method is called from the ClickOutside directive.
     * If the user clicks outside of the component, it will close
     * @returns void
     */
    onOutsideCLick(): void;
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
     * Set the initial config for this component
     * @private
     */
    private _setInitialConfig;
    /**
     * Set the config hooks for this component
     * @private
     */
    private _setConfigHooks;
    /**
     * Initialize Faux control ( used to display string value of select ). Subscribes to actual control value changes to update value.
     */
    private _initialFauxControl;
    private _setStrVal;
}
