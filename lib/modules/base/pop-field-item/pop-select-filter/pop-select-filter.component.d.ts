import { OnInit, ElementRef, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { SelectFilterConfig, SelectFilterGroupInterface } from './select-filter-config.model';
import { MatSelectionList } from '@angular/material/list';
import { Observable } from 'rxjs';
import { FieldItemOption } from '../../../../pop-common.model';
import { PopFieldItemComponent } from '../pop-field-item.component';
export declare class PopSelectFilterComponent extends PopFieldItemComponent implements OnInit, OnDestroy {
    el: ElementRef;
    protected cdr: ChangeDetectorRef;
    config: SelectFilterConfig;
    listRef: ElementRef;
    selectionListRef: MatSelectionList;
    searchRef: ElementRef;
    name: string;
    protected asset: {
        filteredOptions: Observable<FieldItemOption[]>;
        groups: any[];
        onFocusValue: any;
    };
    ui: {
        selected: {
            config: any;
            count: number;
        };
        search: {
            config: any;
            count: number;
        };
    };
    onEscapeHandler(event: KeyboardEvent): void;
    constructor(el: ElementRef, cdr: ChangeDetectorRef);
    ngOnInit(): void;
    /**
     * Set the inital dom state of the component
     * @private
     */
    private _setInitialDomState;
    /**************************************
     * Public methods invoked by the view
     * ************************************/
    /**
     * Turn the dropdown on or off. If it is turned off,
     * it will emit the close event
     * @returns void
     */
    onToggleFilter(event: any, list: {
        clientHeight: number;
    }): boolean;
    /**
     * The client user can toggle a specific grouping to be open/close
     * @param group
     */
    onToggleGroup(group: SelectFilterGroupInterface): void;
    /**
     * Closes the dropdown if it is active.
     * This method is called from the ClickOutside directive.
     * If the user clicks outside of the component, it will close
     * @param event
     * @returns void
     */
    onOutsideCLick(): void;
    /**
     * Checks/Unchecks all of the filtered options within a specific group
     * @param  FieldOption option
     * @returns boolean
     */
    onAllChange(checked: boolean): boolean;
    /**
     * Checks/Unchecks all of the filtered options within a specific group
     * @param  FieldOption option
     * @returns boolean
     */
    onGroupChange(checked: boolean, group: any): boolean;
    /**
     * Update's the list of selected options inside of the config
     * and emits a change event. This method will be called by the view
     * whenever an option is selected
     * @param MatSelectionListChange event
     * @returns void
     */
    onOptionChange(event: any, option: any, group: any): void;
    onLink(): void;
    /**
     * Checks if the given option is in the list of selected options
     * in the config. Used by the view to set the checkbox's on the initial state of the dropdown
     * @param  FieldOption option
     * @returns boolean
     */
    isOptionSelected(option: FieldItemOption): boolean;
    ngOnDestroy(): void;
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    /**
     * Observes the value changes to the search and triggers the filter of the options
     * @returns void
     */
    private _setUpFilterObservable;
    /**
     * Close the option list
     * @private
     */
    private _closeOptionList;
    /**
     * Check the selected value to see if it needs to be stored
     * @param open
     * @private
     */
    private _checkSelectedValue;
    /**
     * Detects if the list of options should appear above or below the select input
     * @param height
     */
    private _setOptionListPosition;
    /**
     * Detects whether the check all  box for a group should be unchecked, checked, or indeterminate
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
    private _filterOptionsList;
    /**
     * Update's the selection options in config
     * by looping through all of the currently selected items
     * in the selectionListRef.
     * @param number id
     */
    private _updateSelectedOptions;
}
