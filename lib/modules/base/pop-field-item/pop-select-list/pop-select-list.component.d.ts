import { ChangeDetectorRef, ElementRef, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { MatSelectionList } from '@angular/material/list';
import { Observable } from 'rxjs';
import { SelectListConfig, SelectListGroupInterface } from './select-list-config.model';
import { Entity, FieldItemOption, KeyMap, PopBaseEventInterface } from '../../../../pop-common.model';
import { PopFieldItemComponent } from '../pop-field-item.component';
export declare class PopSelectListComponent extends PopFieldItemComponent implements OnInit, OnDestroy {
    el: ElementRef;
    protected cdr: ChangeDetectorRef;
    config: SelectListConfig;
    events: EventEmitter<PopBaseEventInterface>;
    selectionListRef: MatSelectionList;
    searchRef: ElementRef;
    name: string;
    protected asset: {
        filteredOptions: Observable<FieldItemOption[]>;
        groups: any[];
        onFocusValue: any;
        filterActivated: boolean;
        disabled: KeyMap<boolean>;
    };
    ui: {
        search: {
            config: any;
        };
        all: {
            overlay: any;
        };
    };
    constructor(el: ElementRef, cdr: ChangeDetectorRef);
    ngOnInit(): void;
    triggerOnChange(wait?: number): void;
    /**
     * Checks/Unchecks all of the filtered options within a specific group
     * @param  FieldOption option
     * @returns boolean
     */
    onGroupChange(checked: boolean, group: any): boolean;
    /**
     * Checks/Unchecks all of the filtered options within a specific group
     * @param  FieldOption option
     * @returns boolean
     */
    onAllChange(checked: boolean): boolean;
    /**
     * Allow the user to clear the search text
     */
    onClearSearch(): void;
    /**
     * Update's the list of selected options inside of the config
     * and emits a change event. This method will be called by the view
     * whenever an option is selected
     * @param MatSelectionListChange event
     * @returns void
     */
    onOptionChange(event: any, option: any, group: any): void;
    /**
     * Add on to set toggle special custom property
     * @param event
     * @param option
     */
    onOptionModeChange(event: any, option: any): void;
    /**
     * On link click stub
     */
    onLinkClick(): void;
    /**
     * Allow user to open close a group section
     * @param group
     */
    onToggleGroup(group: SelectListGroupInterface): void;
    /**
     * Checks if the given option is in the list of selected options
     * in the config. Used by the view to set the checkboxe's on the
     * initial state of the dropdown
     * @param  FieldOption option
     * @returns boolean
     */
    isOptionSelected(option: FieldItemOption): boolean;
    isSearchValue(): boolean;
    /**
     * Template logic to determine if a option is hidden
     * @param option
     */
    isOptionHidden(group: SelectListGroupInterface, option: FieldItemOption): boolean;
    /**
     * Template logic to determine if a option is active
     * @param option
     */
    isOptionActive(option: FieldItemOption): boolean;
    /**
     * Template logic to determine if a option is disabled
     * @param option
     */
    isOptionDisabled(option: FieldItemOption): boolean;
    ngOnDestroy(): void;
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    private _setConfigHooks;
    /**
     * Set the inital dom state of the component
     * @private
     */
    private _setInitialDomState;
    /**
     * Set the lead mapping options that are disabled;
     * @private
     */
    private _setDisabledIds;
    private _setInitialValue;
    /**
     * Observes the value changes to the search and triggers the filter of the options
     * @returns void
     */
    private _setUpFilterObservable;
    /**
     * Detects if the list of options should appear above or below the select input
     * @param height
     */
    private _setListPosition;
    /**
     * Detects where the check all  box for a group should be unchecked, checked, or indeterminate
     * @param checked
     * @param group
     */
    private _checkGroupState;
    /**
     * Finds only the options from the config's options that match
     * the string passed in, and returns those options.
     * Used as the filter when setting up the filteredOptions observable
     * @param string value
     * @returns FieldItemOption
     */
    private _filterOptionList;
    /**
     * Update's the selection options in config
     * by looping through all of the currently selected items
     * in the selectionListRef.
     * @param number id
     */
    private _updateSelectedOptions;
    /**
     * Set up the body of the api patch
     * @param value
     * @private
     */
    protected _getPatchBody(value?: number | string | boolean | null | Object): Entity;
}
