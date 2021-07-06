import { Component, Input, ViewChild, ElementRef, ChangeDetectorRef, HostListener } from '@angular/core';
import { InputConfig } from '../pop-input/input-config.model';
import { SelectionModel } from '@angular/cdk/collections';
import { debounceTime } from 'rxjs/operators';
import { ValidationErrorMessages } from '../../../../services/pop-validators';
import { PopFieldItemComponent } from '../pop-field-item.component';
import { IsObject, IsObjectThrowError, JsonCopy, ObjectContainsTagSearch } from '../../../../pop-common-utility';
export class PopSelectFilterComponent extends PopFieldItemComponent {
    constructor(el, cdr) {
        super();
        this.el = el;
        this.cdr = cdr;
        this.name = 'PopSelectFilterComponent';
        this.asset = {
            filteredOptions: undefined,
            groups: [],
            onFocusValue: undefined
        };
        this.ui = {
            selected: {
                config: undefined,
                count: 0
            },
            search: {
                config: undefined,
                count: 0
            }
        };
        this.dom.configure = () => {
            return new Promise((resolve) => {
                this.config = IsObjectThrowError(this.config, true, `${this.name}:configure: - this.config`) ? this.config : null;
                this._setInitialDomState();
                this._filterOptionsList('');
                this._setUpFilterObservable();
                return resolve(true);
            });
        };
        this.dom.proceed = () => {
            return new Promise((resolve) => {
                return resolve(true);
            });
        };
    }
    onEscapeHandler(event) {
        if (this.dom.state.filterActivated) {
            console.log('esc', event);
            this._closeOptionList();
        }
    }
    ngOnInit() {
        super.ngOnInit();
    }
    /**
     * Set the inital dom state of the component
     * @private
     */
    _setInitialDomState() {
        this.dom.state.filter = undefined;
        this.dom.state.filterActivated = false;
        this.dom.state.above = undefined;
        this.dom.state.below = undefined;
        this.dom.state.list = undefined;
        this.dom.state.position = 'below';
        this.dom.state.active = undefined;
        this.dom.state.checkboxPosition = this.config.checkboxPosition === 'before' ? 'before' : 'after';
        if (!this.config.multiple) {
            this.selectionListRef.selectedOptions = new SelectionModel(false);
        }
        this.ui.selected.config = new InputConfig({
            value: this.config.strVal,
            helpText: this.config.helpText,
            displayErrors: false,
            label: this.config.label,
            readonly: true,
            selectMode: true,
            maxlength: 65000
        });
        this.ui.search.config = new InputConfig({
            value: this.config.strVal,
            helpText: this.config.helpText,
            displayErrors: false,
            label: this.config.label,
            readonly: true,
            maxlength: 255
        });
        if (!this.config.multiple && +this.config.value) {
            const activeOption = IsObject(this.config.options, ['values']) ? this.config.options.values.find((option) => +option.value === +this.config.value) : null;
            if (IsObject(activeOption, ['value', 'name'])) {
                this.config.selectedOptions = [+activeOption.value];
                this.asset.onFocusValue = JSON.stringify(this.config.selectedOptions);
                this.dom.active.optionId = +activeOption.value;
                this.ui.selected.config.control.setValue(activeOption.name, { emitEvent: false });
            }
        }
        else {
            this.asset.onFocusValue = JSON.stringify(this.config.selectedOptions);
            this._updateSelectedOptions();
        }
        delete this.config.options;
    }
    /**************************************
     * Public methods invoked by the view
     * ************************************/
    /**
     * Turn the dropdown on or off. If it is turned off,
     * it will emit the close event
     * @returns void
     */
    onToggleFilter(event, list) {
        if (this.config.patch.running)
            return false;
        this.dom.state.filterActivated = !this.dom.state.filterActivated;
        if (this.dom.state.filterActivated) {
            if (this.config.float) {
                if (this.config.offsetSession) {
                    this.config.offset = this.config.offsetSession;
                }
                else if (this.config.height) {
                    this.config.offset = this.config.height;
                }
            }
            else {
                this.config.offset = null;
            }
        }
        else {
            this.config.offset = null;
        }
        this.dom.setTimeout('open-close', () => {
            if (!this.config.position)
                this._setOptionListPosition({ above: event.pageY - 280, below: window.innerHeight - event.pageY - 20, height: list.clientHeight });
            if (!this.dom.state.filterActivated) {
                this.onBubbleEvent('close');
            }
            else {
                this.asset.onFocusValue = JSON.stringify(this.config.selectedOptions);
                this.config.message = '';
                this.onBubbleEvent('open');
            }
            if (this.dom.state.filterActivated) {
                if (this.config.float) {
                    const offsetHeight = this.listRef.nativeElement.offsetHeight;
                    if (offsetHeight) {
                        this.config.offset = offsetHeight * (-1);
                        if (this.config.offset)
                            this.config.offsetSession = this.config.offset;
                    }
                }
            }
        }, 0);
        return true;
    }
    /**
     * The client user can toggle a specific grouping to be open/close
     * @param group
     */
    onToggleGroup(group) {
        if (this.config.groups.length > 1) {
            group.open = !group.open;
        }
    }
    /**
     * Closes the dropdown if it is active.
     * This method is called from the ClickOutside directive.
     * If the user clicks outside of the component, it will close
     * @param event
     * @returns void
     */
    onOutsideCLick() {
        this._closeOptionList();
    }
    /**
     * Checks/Unchecks all of the filtered options within a specific group
     * @param  FieldOption option
     * @returns boolean
     */
    onAllChange(checked) {
        if (!this.config.multiple)
            return false;
        this.config.groups.map((group) => {
            group.options.values.map((option) => {
                option.selected = checked;
            });
            group.all = checked;
            group.indeterminate = false;
        });
        setTimeout(() => {
            this._updateSelectedOptions();
        }, 0);
        return false;
    }
    /**
     * Checks/Unchecks all of the filtered options within a specific group
     * @param  FieldOption option
     * @returns boolean
     */
    onGroupChange(checked, group) {
        if (!this.config.multiple)
            return false;
        group.options.values.map((option) => {
            if (!option.hidden) {
                option.selected = checked;
            }
        });
        setTimeout(() => {
            this._checkGroupState(checked, group);
            this._updateSelectedOptions();
        }, 0);
        return false;
    }
    /**
     * Update's the list of selected options inside of the config
     * and emits a change event. This method will be called by the view
     * whenever an option is selected
     * @param MatSelectionListChange event
     * @returns void
     */
    onOptionChange(event, option, group) {
        setTimeout(() => {
            option.selected = event.target.className.search('mat-pseudo-checkbox-checked') > -1 ? true : false;
            this._checkGroupState(option.selected, group);
            this._updateSelectedOptions();
        }, 0);
    }
    onLink() {
        console.log('LINK STUB: Link to Entity', this.config.control.value);
    }
    /**
     * Checks if the given option is in the list of selected options
     * in the config. Used by the view to set the checkbox's on the initial state of the dropdown
     * @param  FieldOption option
     * @returns boolean
     */
    isOptionSelected(option) {
        return option.selected;
    }
    ngOnDestroy() {
        super.ngOnDestroy();
    }
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
    _setUpFilterObservable() {
        this.ui.search.config.control.valueChanges
            .pipe(debounceTime(200)).subscribe((value) => {
            this._filterOptionsList(value);
        });
    }
    /**
     * Close the option list
     * @private
     */
    _closeOptionList() {
        if (this.dom.state.filterActivated) {
            // this.config.control.setValue( '', { emitEvent: true } );
            this.dom.state.filterActivated = false;
            this.cdr.detectChanges();
            this._checkSelectedValue(this.dom.state.filterActivated);
            this._filterOptionsList('');
            this.onBubbleEvent('close');
            this.config.offset = null;
        }
    }
    /**
     * Check the selected value to see if it needs to be stored
     * @param open
     * @private
     */
    _checkSelectedValue(open) {
        // if( !open ){
        if (this.ui.selected.config.control.invalid) {
            if (this.config.displayErrors)
                this.config.message = ValidationErrorMessages(this.ui.selected.config.control.errors);
        }
        else if (this.config.patch && (this.config.patch.path || this.config.facade)) {
            if (JSON.stringify(this.config.selectedOptions) !== this.asset.onFocusValue) {
                this.onChange();
            }
        }
    }
    /**
     * Detects if the list of options should appear above or below the select input
     * @param height
     */
    _setOptionListPosition(params) {
        if (params.height > 0) {
            this.config.offset = null;
            this.dom.state.above = params.above;
            this.dom.state.below = params.below;
            this.dom.state.list = params.height;
            // if( this.config.allowAll ) this.dom.state.list += 60;
            // if( this.config.filter ) this.dom.state.list += 58;
            this.config.position = this.dom.state.below >= this.dom.state.above ? 'below' : 'above';
            this.config.height = this.config.defaultHeight;
            if (this.config.position === 'above') {
                if (this.config.height > this.dom.state.above)
                    this.config.height = this.dom.state.above;
                this.config.minHeight = this.config.height;
            }
            else {
                if (this.config.height > this.dom.state.below)
                    this.config.height = this.dom.state.below;
                // this.config.minHeight = this.config.defaultMinHeight;
                this.config.minHeight = this.config.height;
            }
            this.dom.setTimeout(`search-focus`, () => {
                if (this.searchRef) {
                    this.searchRef.nativeElement.focus();
                    // this.onBubbleEvent( 'focus' );
                }
            }, 200);
        }
    }
    /**
     * Detects whether the check all  box for a group should be unchecked, checked, or indeterminate
     * @param checked
     * @param group
     */
    _checkGroupState(checked, group) {
        let indeterminate = false;
        let all = true;
        if (!checked) {
            all = false;
            group.options.values.some((option) => {
                if (!option.hidden && option.selected) {
                    indeterminate = true;
                    return true;
                }
            });
        }
        else {
            group.options.values.some(option => {
                if (!option.hidden && !option.selected) {
                    all = false;
                    indeterminate = true;
                    return true;
                }
            });
        }
        group.all = all;
        group.indeterminate = indeterminate;
    }
    /**
     * Finds only the options from the config's options that match
     * the string passed in, and returns those options.
     * Used as the filter when setting up the filteredOptions observable
     * @param string value
     * @returns FieldItemOption
     */
    _filterOptionsList(search) {
        this.config.groups.map((group) => {
            group.options.values.map((option) => {
                option.hidden = ObjectContainsTagSearch(option, search) ? false : true;
            });
            group.selected = group.options.values.filter((option) => {
                return !option.hidden && option.selected;
            }).length;
            group.visible = group.options.values.filter((option) => {
                return !option.hidden;
            }).length;
            const checked = group.visible === group.selected;
            this._checkGroupState(checked, group);
        });
        this.cdr.detectChanges();
    }
    /**
     * Update's the selection options in config
     * by looping through all of the currently selected items
     * in the selectionListRef.
     * @param number id
     */
    _updateSelectedOptions() {
        const selected = this.selectionListRef.selectedOptions.selected;
        let str = [];
        if (this.config.multiple) {
            this.config.selectedOptions = [];
            for (const option of selected) {
                str.push(option._text.nativeElement.innerText);
                this.config.selectedOptions.push(String(option.value).trim());
            }
            str = str.sort();
            this.config.strVal = str.join(', ');
            this.ui.selected.config.control.setValue(this.config.strVal, { emitEvent: false });
            const value = JsonCopy(this.config.selectedOptions);
            this.config.control.setValue(value, { emitEvent: false });
        }
        else {
            let value;
            for (const option of selected) {
                str.push(option._text.nativeElement.innerText);
                value = option.value;
            }
            str = str.sort();
            this.config.strVal = str.join(', ');
            this.ui.selected.config.control.setValue(this.config.strVal, { emitEvent: false });
            this.dom.active.optionId = value;
            this.config.control.setValue(value, { emitEvent: false });
            this.config.value = value;
            this._closeOptionList();
        }
    }
}
PopSelectFilterComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-select-filter',
                template: "<div class=\"pop-select-filter-container import-field-item-container\" [ngClass]=\"{'pop-select-filter-single': !config.multiple, 'pop-select-filter-multiple':config.multiple}\" (libClickOutside)=\"onOutsideCLick();\" [style.marginBottom.px]=\"config.offset\">\n  <lib-pop-input\n    class=\"pop-select-filter-values\"\n    *ngIf=\"ui.selected?.config\"\n    [class.filter-selected]=\"dom.state.filterActivated\"\n    [config]=ui.selected.config\n    (click)=\"onToggleFilter($event, list);\">\n  </lib-pop-input>\n  <lib-pop-field-item-loader [show]=\"config.patch.displayIndicator && config.patch.running\"></lib-pop-field-item-loader>\n\n  <!--<div [ngClass]=\"{'sw-hidden':!config.selectedOptions.length}\" class=\"pop-select-filer-count\">{{config.selectedOptions.length}}</div>-->\n\n  <!--<mat-icon class=\"select-filter-button-icon sw-pointer\" (click)=\"onToggleFilter($event, list);\">arrow_drop_down</mat-icon>-->\n\n  <!--<div class=\"pop-select-filter-feedback\">-->\n    <!--<div *ngIf=\"config.message\"-->\n         <!--class=\"pop-select-error\"-->\n         <!--matTooltipPosition=\"left\"-->\n         <!--[matTooltip]=config.message>-->\n      <!--<mat-icon color=\"warn\">info</mat-icon>-->\n    <!--</div>-->\n  <!--</div>-->\n\n  <div class=\"select-filter-content select-filter-items-{{config.position}}\" [ngClass]=\"{'sw-hidden': !dom.state.filterActivated}\" #list>\n\n    <div class=\"pop-select-search-header\">\n      <mat-checkbox\n        *ngIf=\"config.multiple\"\n        [(ngModel)]=\"config.all\"\n        [color]=\"'primary'\"\n        matTooltip=\"Toggle All\"\n        matTooltipPosition=\"above\"\n        (change)=\"onAllChange($event.checked);\">\n      </mat-checkbox>\n\n      <mat-form-field *ngIf=\"config.filter && ui.search.config\" appearance=\"none\" floatLabel=\"never\" class=\"sw-search\">\n        <a matPrefix>\n          <mat-icon>search</mat-icon>\n        </a>\n        <input matInput placeholder=\"Search\"\n               class=\"sw-pointer\"\n               #search\n               type=\"text\"\n               [formControl]=\"ui.search.config.control\">\n        <mat-icon class=\"sw-cursor-pointer sw-pointer\" matSuffix (click)=\"ui.search.config.control.setValue('');\">close</mat-icon>\n      </mat-form-field>\n\n    </div>\n\n    <mat-selection-list [style.minHeight.px]=config.minHeight [style.maxHeight.px]=config.height #selectionList>\n      <div *ngFor=\"let group of config.groups\">\n        <div class=\"pop-select-option-header\" *ngIf=\"group.label && group.visible\">\n          <mat-checkbox\n            *ngIf=\"config.multiple\"\n            [(ngModel)]=\"group.all\"\n            [color]=\"'primary'\"\n            [indeterminate]=group.indeterminate\n            matTooltip=\"Toggle Group\"\n            matTooltipPosition=\"above\"\n            (change)=\"onGroupChange($event.checked, group);\">\n          </mat-checkbox>\n          <div class=\"pop-select-header-label\" (click)=\"onToggleGroup(group);\">{{group.label}} ({{group.options.values.length}})</div>\n\n        </div>\n        <mat-list-option\n          [checkboxPosition]=dom.state.checkboxPosition\n          class=\"pop-select-filter-option\"\n          *ngFor=\"let option of group.options.values\"\n          [ngClass]=\"{'sw-hidden': option.hidden || !group.open, 'pop-select-filter-active': dom.active.optionId && option.value === dom.active.optionId}\"\n          [style.paddingLeft]=\"option.level+'px'\"\n          [selected]=isOptionSelected(option)\n          (click)=\"onOptionChange($event, option, group);\"\n          [value]=\"option.value\">\n          {{option.name}}\n        </mat-list-option>\n      </div>\n      <lib-pop-field-item-loader [show]=\"config.patch.displayIndicator && config.patch.running\"></lib-pop-field-item-loader>\n    </mat-selection-list>\n  </div>\n</div>\n",
                styles: [".pop-select-filter-container{position:relative;display:block;padding:0;margin:var(--gap-s) 0}.select-filter-button{border:1px solid var(--text-2);border-radius:.25em;position:relative;display:flex;justify-content:space-between;height:40px}.select-filter-button .select-filter-button-left-items{display:flex;justify-content:flex-start;align-items:center}.select-filter-button .select-filter-button-left-items .select-filter-button-bar{width:4px;background-color:var(--background-base);height:100%;border-radius:2px 0 0 2px}.select-filter-button .select-filter-button-left-items .select-filter-button-text{display:inline-block;margin-left:var(--gap-sm)}.pop-select-search-header{display:flex;flex-direction:row;min-height:40px;align-items:center;justify-content:stretch;border-bottom:1px solid var(--border)}.sw-search{margin-top:-20px}.sw-search,.sw-search .mat-form-field-flex{display:flex;flex-grow:1}.pop-select-filer-count{position:absolute;bottom:-5px;right:2px;font-size:.7em;text-align:right}.select-filter-button-icon{pointer-events:none;z-index:1;position:absolute;display:flex;top:var(--gap-s);right:7px;color:var(--text-disabled);outline:0}.select-filter-button:hover{background-color:var(--background-base);cursor:pointer}.select-filter-items-above{border:1px solid var(--border);position:absolute;bottom:47px;border-radius:5px}.select-filter-items-above,.select-filter-items-below{left:0;right:0;height:-webkit-fit-content;height:-moz-fit-content;height:fit-content;z-index:3;background-color:var(--background-base);min-height:30px}.select-filter-items-below{border:1px solid var(--border);position:relative;top:1px;border-radius:3px;z-index:99}.mat-form-field{display:block;height:30px}.pop-select-filter-option{box-sizing:border-box;background:var(--background-base);height:30px}.expand-to-container{position:absolute!important;top:0;left:0;bottom:0;right:0;box-sizing:border-box!important;-moz-box-sizing:border-box}.pop-select-filter-feedback{z-index:3;position:absolute;top:8px;right:9px;display:flex;flex-flow:row;align-items:center;justify-content:center}.pop-select-option-header{display:flex;flex-direction:row;-webkit-tap-highlight-color:transparent;width:100%;padding:0;justify-content:flex-start;padding-left:var(--xs);align-items:center;box-sizing:border-box;cursor:pointer;height:30px;border-top:1px solid var(--border)!important;border-bottom:1px solid var(--border)!important;outline:0;background:var(--background-2)}.pop-select-option-header:hover{background:var(--bg-1)}.pop-select-header-label{position:relative;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-style:italic;font-weight:700;font-size:16px;padding-left:5px}.pop-select-filter-active{background:var(--background-2)}.select-filter-error{position:absolute;top:13px;left:0;font-size:.8em}:host ::ng-deep .checkbox-after{direction:rtl}:host ::ng-deep .checkbox-after .mat-checkbox-layout{width:100%}:host ::ng-deep .checkbox-after .mat-checkbox-layout .mat-checkbox-inner-container{margin:0 9px 0 auto}:host ::ng-deep .mat-checkbox-inner-container{margin:0 0 0 var(--gap-sm)}:host ::ng-deep .mat-checkbox-label{padding:0 0 0 var(--gap-sm)}:host ::ng-deep .mat-list-item-content-reverse{padding:0 var(--gap-s) 0 var(--gap-xs)!important}:host ::ng-deep mat-selection-list{overflow-y:auto;overflow-x:hidden;outline:0!important;padding-bottom:var(--gap-xs)}:host ::ng-deep mat-list-option{border:none!important}.pop-select-filter-option:focus,.pop-select-filter-option:hover{background:var(--accent-shade)}.pop-select-all-header:hover{background:var(--bg-1)}:host ::ng-deep .mat-form-field-infix{padding:8px 0 13px!important}:host ::ng-deep .pop-select-filter-values .mat-form-field-infix{padding:8px 40px 13px 0!important}:host ::ng-deep .pop-select-filter-values input{display:flex;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;width:100%;z-index:2;padding-right:40px}:host ::ng-deep .pop-select-filter-values .mat-form-field-infix{pointer-events:none!important}:host ::ng-deep .pop-select-filter-single mat-pseudo-checkbox{display:none!important}:host ::ng-deep .pop-select-filter-single .mat-list-text{padding-left:0!important}:host ::ng-deep .pop-select-option-header mat-checkbox{margin-left:-1px!important}:host ::ng-deep .pop-select-filter-single .sw-search{padding-left:var(--gap-s)}:host ::ng-deep .pop-select-option-header .mat-checkbox-inner-container{width:16px!important;height:16px!important}:host ::ng-deep .pop-select-option-header .mat-checkbox-label{padding:0 var(--gap-s) 0 0}:host ::ng-deep .pop-input-container{margin:0!important}:host ::ng-deep .filter-option-selected .pop-input-container{background-color:var(--accent-shade)!important}:host ::ng-deep mat-list-base{padding:0!important}:host ::ng-deep .mat-list-text{display:block;text-overflow:ellipsis;white-space:nowrap;overflow:hidden}"]
            },] }
];
PopSelectFilterComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: ChangeDetectorRef }
];
PopSelectFilterComponent.propDecorators = {
    config: [{ type: Input }],
    listRef: [{ type: ViewChild, args: ['list', { static: true },] }],
    selectionListRef: [{ type: ViewChild, args: ['selectionList', { static: true },] }],
    searchRef: [{ type: ViewChild, args: ['search',] }],
    onEscapeHandler: [{ type: HostListener, args: ['document:keydown.escape', ['$event'],] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLXNlbGVjdC1maWx0ZXIuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvYmFzZS9wb3AtZmllbGQtaXRlbS9wb3Atc2VsZWN0LWZpbHRlci9wb3Atc2VsZWN0LWZpbHRlci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBVSxLQUFLLEVBQXdCLFNBQVMsRUFBRSxVQUFVLEVBQUUsaUJBQWlCLEVBQWEsWUFBWSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBSWxKLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUM5RCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDMUQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQzlDLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBRTlFLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQ3BFLE9BQU8sRUFBRSxRQUFRLEVBQUUsa0JBQWtCLEVBQUUsUUFBUSxFQUFFLHVCQUF1QixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFRakgsTUFBTSxPQUFPLHdCQUF5QixTQUFRLHFCQUFxQjtJQW1DakUsWUFDUyxFQUFjLEVBQ1gsR0FBc0I7UUFFaEMsS0FBSyxFQUFFLENBQUM7UUFIRCxPQUFFLEdBQUYsRUFBRSxDQUFZO1FBQ1gsUUFBRyxHQUFILEdBQUcsQ0FBbUI7UUFoQ2xDLFNBQUksR0FBRywwQkFBMEIsQ0FBQztRQUl4QixVQUFLLEdBQUc7WUFDaEIsZUFBZSxFQUFpQyxTQUFTO1lBQ3pELE1BQU0sRUFBRSxFQUFFO1lBQ1YsWUFBWSxFQUFFLFNBQVM7U0FDeEIsQ0FBQztRQUVLLE9BQUUsR0FBRztZQUNWLFFB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QUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLENBQUUsQ0FBQztZQUNyRixJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO1lBQ2pDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBRSxLQUFLLEVBQUUsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLENBQUUsQ0FBQztZQUM1RCxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7WUFDMUIsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7U0FDekI7SUFDSCxDQUFDOzs7WUE1Y0YsU0FBUyxTQUFFO2dCQUNWLFFBQVEsRUFBRSx1QkFBdUI7Z0JBQ2pDLDJ4SEFBaUQ7O2FBRWxEOzs7WUFqQm1FLFVBQVU7WUFBRSxpQkFBaUI7OztxQkFtQjlGLEtBQUs7c0JBQ0wsU0FBUyxTQUFFLE1BQU0sRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUU7K0JBQ25DLFNBQVMsU0FBRSxlQUFlLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFO3dCQUM1QyxTQUFTLFNBQUUsUUFBUTs4QkFzQm5CLFlBQVksU0FBQyx5QkFBeUIsRUFBRSxDQUFDLFFBQVEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgT25Jbml0LCBJbnB1dCwgT3V0cHV0LCBFdmVudEVtaXR0ZXIsIFZpZXdDaGlsZCwgRWxlbWVudFJlZiwgQ2hhbmdlRGV0ZWN0b3JSZWYsIE9uRGVzdHJveSwgSG9zdExpc3RlbmVyIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBTZWxlY3RGaWx0ZXJDb25maWcsIFNlbGVjdEZpbHRlckdyb3VwSW50ZXJmYWNlIH0gZnJvbSAnLi9zZWxlY3QtZmlsdGVyLWNvbmZpZy5tb2RlbCc7XG5pbXBvcnQgeyBNYXRTZWxlY3Rpb25MaXN0LCBNYXRMaXN0T3B0aW9uIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvbGlzdCc7XG5pbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBJbnB1dENvbmZpZyB9IGZyb20gJy4uL3BvcC1pbnB1dC9pbnB1dC1jb25maWcubW9kZWwnO1xuaW1wb3J0IHsgU2VsZWN0aW9uTW9kZWwgfSBmcm9tICdAYW5ndWxhci9jZGsvY29sbGVjdGlvbnMnO1xuaW1wb3J0IHsgZGVib3VuY2VUaW1lIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHsgVmFsaWRhdGlvbkVycm9yTWVzc2FnZXMgfSBmcm9tICcuLi8uLi8uLi8uLi9zZXJ2aWNlcy9wb3AtdmFsaWRhdG9ycyc7XG5pbXBvcnQgeyBGaWVsZEl0ZW1PcHRpb24gfSBmcm9tICcuLi8uLi8uLi8uLi9wb3AtY29tbW9uLm1vZGVsJztcbmltcG9ydCB7IFBvcEZpZWxkSXRlbUNvbXBvbmVudCB9IGZyb20gJy4uL3BvcC1maWVsZC1pdGVtLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBJc09iamVjdCwgSXNPYmplY3RUaHJvd0Vycm9yLCBKc29uQ29weSwgT2JqZWN0Q29udGFpbnNUYWdTZWFyY2ggfSBmcm9tICcuLi8uLi8uLi8uLi9wb3AtY29tbW9uLXV0aWxpdHknO1xuXG5cbkBDb21wb25lbnQoIHtcbiAgc2VsZWN0b3I6ICdsaWItcG9wLXNlbGVjdC1maWx0ZXInLFxuICB0ZW1wbGF0ZVVybDogJy4vcG9wLXNlbGVjdC1maWx0ZXIuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsgJy4vcG9wLXNlbGVjdC1maWx0ZXIuY29tcG9uZW50LnNjc3MnIF1cbn0gKVxuZXhwb3J0IGNsYXNzIFBvcFNlbGVjdEZpbHRlckNvbXBvbmVudCBleHRlbmRzIFBvcEZpZWxkSXRlbUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcbiAgQElucHV0KCkgY29uZmlnOiBTZWxlY3RGaWx0ZXJDb25maWc7IC8vIGNvbmZpZ3VyYXRpb24gZm9yIGNvbXBvbmVudFxuICBAVmlld0NoaWxkKCAnbGlzdCcsIHsgc3RhdGljOiB0cnVlIH0gKSBsaXN0UmVmOiBFbGVtZW50UmVmOyAvLyBHZXR0aW5nIGEgcmVmZXJlbmNlIHRvIHRoZSBzZWxlY3Rpb24gbGlzdCBpbiB0aGUgdmlldyBzbyB0aGF0IEkgY2FuIGtub3cgd2hpY2ggb3B0aW9ucyBhcmUgc2VsZWN0ZWRcbiAgQFZpZXdDaGlsZCggJ3NlbGVjdGlvbkxpc3QnLCB7IHN0YXRpYzogdHJ1ZSB9ICkgc2VsZWN0aW9uTGlzdFJlZjogTWF0U2VsZWN0aW9uTGlzdDsgLy8gR2V0dGluZyBhIHJlZmVyZW5jZSB0byB0aGUgc2VsZWN0aW9uIGxpc3QgaW4gdGhlIHZpZXcgc28gdGhhdCBJIGNhbiBrbm93IHdoaWNoIG9wdGlvbnMgYXJlIHNlbGVjdGVkXG4gIEBWaWV3Q2hpbGQoICdzZWFyY2gnICkgc2VhcmNoUmVmOiBFbGVtZW50UmVmO1xuICBuYW1lID0gJ1BvcFNlbGVjdEZpbHRlckNvbXBvbmVudCc7XG5cblxuXG4gIHByb3RlY3RlZCBhc3NldCA9IHtcbiAgICBmaWx0ZXJlZE9wdGlvbnM6IDxPYnNlcnZhYmxlPEZpZWxkSXRlbU9wdGlvbltdPj51bmRlZmluZWQsXG4gICAgZ3JvdXBzOiBbXSxcbiAgICBvbkZvY3VzVmFsdWU6IHVuZGVmaW5lZFxuICB9O1xuXG4gIHB1YmxpYyB1aSA9IHtcbiAgICBzZWxlY3RlZDoge1xuICAgICAgY29uZmlnOiB1bmRlZmluZWQsXG4gICAgICBjb3VudDogMFxuICAgIH0sXG4gICAgc2VhcmNoOiB7XG4gICAgICBjb25maWc6IHVuZGVmaW5lZCxcbiAgICAgIGNvdW50OiAwXG4gICAgfVxuICB9O1xuXG4gIEBIb3N0TGlzdGVuZXIoJ2RvY3VtZW50OmtleWRvd24uZXNjYXBlJywgWyckZXZlbnQnXSkgb25Fc2NhcGVIYW5kbGVyKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG4gICAgaWYodGhpcy5kb20uc3RhdGUuZmlsdGVyQWN0aXZhdGVkKXtcbiAgICAgIGNvbnNvbGUubG9nKCdlc2MnLGV2ZW50KTtcbiAgICAgIHRoaXMuX2Nsb3NlT3B0aW9uTGlzdCgpO1xuICAgIH1cbiAgfVxuXG5cblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgZWw6IEVsZW1lbnRSZWYsXG4gICAgcHJvdGVjdGVkIGNkcjogQ2hhbmdlRGV0ZWN0b3JSZWZcbiAgKXtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5kb20uY29uZmlndXJlID0gKCk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCAoIHJlc29sdmUgKSA9PiB7XG5cbiAgICAgICAgdGhpcy5jb25maWcgPSBJc09iamVjdFRocm93RXJyb3IoIHRoaXMuY29uZmlnLCB0cnVlLCBgJHt0aGlzLm5hbWV9OmNvbmZpZ3VyZTogLSB0aGlzLmNvbmZpZ2AgKSA/IHRoaXMuY29uZmlnIDogbnVsbDtcbiAgICAgICAgdGhpcy5fc2V0SW5pdGlhbERvbVN0YXRlKCk7XG4gICAgICAgIHRoaXMuX2ZpbHRlck9wdGlvbnNMaXN0KCAnJyApO1xuICAgICAgICB0aGlzLl9zZXRVcEZpbHRlck9ic2VydmFibGUoKTtcblxuICAgICAgICByZXR1cm4gcmVzb2x2ZSggdHJ1ZSApO1xuICAgICAgfSApO1xuICAgIH07XG5cbiAgICB0aGlzLmRvbS5wcm9jZWVkID0gKCk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCAoIHJlc29sdmUgKSA9PiB7XG5cblxuICAgICAgICByZXR1cm4gcmVzb2x2ZSggdHJ1ZSApO1xuICAgICAgfSApO1xuICAgIH07XG5cblxuXG4gIH1cblxuXG5cbiAgbmdPbkluaXQoKTogdm9pZHtcbiAgICBzdXBlci5uZ09uSW5pdCgpO1xuICB9XG5cblxuICAvKipcbiAgICogU2V0IHRoZSBpbml0YWwgZG9tIHN0YXRlIG9mIHRoZSBjb21wb25lbnRcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHByaXZhdGUgX3NldEluaXRpYWxEb21TdGF0ZSgpe1xuICAgIHRoaXMuZG9tLnN0YXRlLmZpbHRlciA9IDxib29sZWFuPiB1bmRlZmluZWQ7XG4gICAgdGhpcy5kb20uc3RhdGUuZmlsdGVyQWN0aXZhdGVkID0gZmFsc2U7XG4gICAgdGhpcy5kb20uc3RhdGUuYWJvdmUgPSA8bnVtYmVyPiB1bmRlZmluZWQ7XG4gICAgdGhpcy5kb20uc3RhdGUuYmVsb3cgPSA8bnVtYmVyPiB1bmRlZmluZWQ7XG4gICAgdGhpcy5kb20uc3RhdGUubGlzdCA9IDxhbnk+IHVuZGVmaW5lZDtcbiAgICB0aGlzLmRvbS5zdGF0ZS5wb3NpdGlvbiA9IDwnYmVsb3cnIHwgJ2Fib3ZlJz4nYmVsb3cnO1xuICAgIHRoaXMuZG9tLnN0YXRlLmFjdGl2ZSA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLmRvbS5zdGF0ZS5jaGVja2JveFBvc2l0aW9uID0gdGhpcy5jb25maWcuY2hlY2tib3hQb3NpdGlvbiA9PT0gJ2JlZm9yZScgPyAnYmVmb3JlJyA6ICdhZnRlcic7XG5cbiAgICBpZiggIXRoaXMuY29uZmlnLm11bHRpcGxlICl7XG4gICAgICB0aGlzLnNlbGVjdGlvbkxpc3RSZWYuc2VsZWN0ZWRPcHRpb25zID0gbmV3IFNlbGVjdGlvbk1vZGVsPE1hdExpc3RPcHRpb24+KCBmYWxzZSApO1xuICAgIH1cblxuICAgIHRoaXMudWkuc2VsZWN0ZWQuY29uZmlnID0gbmV3IElucHV0Q29uZmlnKCB7XG4gICAgICB2YWx1ZTogdGhpcy5jb25maWcuc3RyVmFsLFxuICAgICAgaGVscFRleHQ6IHRoaXMuY29uZmlnLmhlbHBUZXh0LFxuICAgICAgZGlzcGxheUVycm9yczogZmFsc2UsXG4gICAgICBsYWJlbDogdGhpcy5jb25maWcubGFiZWwsXG4gICAgICByZWFkb25seTogdHJ1ZSxcbiAgICAgIHNlbGVjdE1vZGU6IHRydWUsXG4gICAgICBtYXhsZW5ndGg6IDY1MDAwXG4gICAgfSApO1xuXG4gICAgdGhpcy51aS5zZWFyY2guY29uZmlnID0gbmV3IElucHV0Q29uZmlnKCB7XG4gICAgICB2YWx1ZTogdGhpcy5jb25maWcuc3RyVmFsLFxuICAgICAgaGVscFRleHQ6IHRoaXMuY29uZmlnLmhlbHBUZXh0LFxuICAgICAgZGlzcGxheUVycm9yczogZmFsc2UsXG4gICAgICBsYWJlbDogdGhpcy5jb25maWcubGFiZWwsXG4gICAgICByZWFkb25seTogdHJ1ZSxcbiAgICAgIG1heGxlbmd0aDogMjU1XG4gICAgfSApO1xuXG4gICAgaWYoICF0aGlzLmNvbmZpZy5tdWx0aXBsZSAmJiArdGhpcy5jb25maWcudmFsdWUgKXtcbiAgICAgIGNvbnN0IGFjdGl2ZU9wdGlvbiA9IElzT2JqZWN0KHRoaXMuY29uZmlnLm9wdGlvbnMsIFsndmFsdWVzJ10pID8gIHRoaXMuY29uZmlnLm9wdGlvbnMudmFsdWVzLmZpbmQoICggb3B0aW9uICkgPT4gK29wdGlvbi52YWx1ZSA9PT0gK3RoaXMuY29uZmlnLnZhbHVlICkgOiBudWxsO1xuICAgICAgaWYoIElzT2JqZWN0KCBhY3RpdmVPcHRpb24sIFsgJ3ZhbHVlJywgJ25hbWUnIF0gKSApe1xuICAgICAgICB0aGlzLmNvbmZpZy5zZWxlY3RlZE9wdGlvbnMgPSBbICthY3RpdmVPcHRpb24udmFsdWUgXTtcbiAgICAgICAgdGhpcy5hc3NldC5vbkZvY3VzVmFsdWUgPSBKU09OLnN0cmluZ2lmeSggdGhpcy5jb25maWcuc2VsZWN0ZWRPcHRpb25zICk7XG4gICAgICAgIHRoaXMuZG9tLmFjdGl2ZS5vcHRpb25JZCA9ICthY3RpdmVPcHRpb24udmFsdWU7XG4gICAgICAgIHRoaXMudWkuc2VsZWN0ZWQuY29uZmlnLmNvbnRyb2wuc2V0VmFsdWUoIGFjdGl2ZU9wdGlvbi5uYW1lLCB7IGVtaXRFdmVudDogZmFsc2UgfSApO1xuICAgICAgfVxuICAgIH1lbHNle1xuICAgICAgdGhpcy5hc3NldC5vbkZvY3VzVmFsdWUgPSBKU09OLnN0cmluZ2lmeSggdGhpcy5jb25maWcuc2VsZWN0ZWRPcHRpb25zICk7XG4gICAgICB0aGlzLl91cGRhdGVTZWxlY3RlZE9wdGlvbnMoKTtcbiAgICB9XG4gICAgZGVsZXRlIHRoaXMuY29uZmlnLm9wdGlvbnM7XG4gIH1cblxuXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgKiBQdWJsaWMgbWV0aG9kcyBpbnZva2VkIGJ5IHRoZSB2aWV3XG4gICAqICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuICAvKipcbiAgICogVHVybiB0aGUgZHJvcGRvd24gb24gb3Igb2ZmLiBJZiBpdCBpcyB0dXJuZWQgb2ZmLFxuICAgKiBpdCB3aWxsIGVtaXQgdGhlIGNsb3NlIGV2ZW50XG4gICAqIEByZXR1cm5zIHZvaWRcbiAgICovXG4gIHB1YmxpYyBvblRvZ2dsZUZpbHRlciggZXZlbnQsIGxpc3Q6IHsgY2xpZW50SGVpZ2h0OiBudW1iZXIgfSApOiBib29sZWFue1xuICAgIGlmKCB0aGlzLmNvbmZpZy5wYXRjaC5ydW5uaW5nICkgcmV0dXJuIGZhbHNlO1xuICAgIHRoaXMuZG9tLnN0YXRlLmZpbHRlckFjdGl2YXRlZCA9ICF0aGlzLmRvbS5zdGF0ZS5maWx0ZXJBY3RpdmF0ZWQ7XG4gICAgaWYodGhpcy5kb20uc3RhdGUuZmlsdGVyQWN0aXZhdGVkKXtcbiAgICAgIGlmKHRoaXMuY29uZmlnLmZsb2F0KXtcbiAgICAgICAgaWYodGhpcy5jb25maWcub2Zmc2V0U2Vzc2lvbikge1xuICAgICAgICAgIHRoaXMuY29uZmlnLm9mZnNldCA9IHRoaXMuY29uZmlnLm9mZnNldFNlc3Npb247XG4gICAgICAgIH0gZWxzZSBpZih0aGlzLmNvbmZpZy5oZWlnaHQpe1xuICAgICAgICAgIHRoaXMuY29uZmlnLm9mZnNldCA9IHRoaXMuY29uZmlnLmhlaWdodDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNle1xuICAgICAgICB0aGlzLmNvbmZpZy5vZmZzZXQgPSBudWxsO1xuICAgICAgfVxuXG4gICAgfSBlbHNle1xuICAgICAgdGhpcy5jb25maWcub2Zmc2V0ID0gbnVsbDtcbiAgICB9XG5cbiAgICB0aGlzLmRvbS5zZXRUaW1lb3V0KCdvcGVuLWNsb3NlJywgKCkgPT4ge1xuICAgICAgaWYoICF0aGlzLmNvbmZpZy5wb3NpdGlvbiApIHRoaXMuX3NldE9wdGlvbkxpc3RQb3NpdGlvbiggeyBhYm92ZTogZXZlbnQucGFnZVkgLSAyODAsIGJlbG93OiB3aW5kb3cuaW5uZXJIZWlnaHQgLSBldmVudC5wYWdlWSAtIDIwLCBoZWlnaHQ6IGxpc3QuY2xpZW50SGVpZ2h0IH0gKTtcbiAgICAgIGlmKCAhdGhpcy5kb20uc3RhdGUuZmlsdGVyQWN0aXZhdGVkICl7XG4gICAgICAgIHRoaXMub25CdWJibGVFdmVudCggJ2Nsb3NlJyApO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHRoaXMuYXNzZXQub25Gb2N1c1ZhbHVlID0gSlNPTi5zdHJpbmdpZnkoIHRoaXMuY29uZmlnLnNlbGVjdGVkT3B0aW9ucyApO1xuICAgICAgICB0aGlzLmNvbmZpZy5tZXNzYWdlID0gJyc7XG4gICAgICAgIHRoaXMub25CdWJibGVFdmVudCggJ29wZW4nICk7XG4gICAgICB9XG4gICAgICBpZih0aGlzLmRvbS5zdGF0ZS5maWx0ZXJBY3RpdmF0ZWQpe1xuICAgICAgICBpZih0aGlzLmNvbmZpZy5mbG9hdCl7XG4gICAgICAgICAgY29uc3Qgb2Zmc2V0SGVpZ2h0ID0gdGhpcy5saXN0UmVmLm5hdGl2ZUVsZW1lbnQub2Zmc2V0SGVpZ2h0O1xuICAgICAgICAgIGlmKG9mZnNldEhlaWdodCl7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZy5vZmZzZXQgPSBvZmZzZXRIZWlnaHQgKiAoLTEpO1xuICAgICAgICAgICAgaWYodGhpcy5jb25maWcub2Zmc2V0KSB0aGlzLmNvbmZpZy5vZmZzZXRTZXNzaW9uID0gdGhpcy5jb25maWcub2Zmc2V0O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgfSwgMCApO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cblxuICAvKipcbiAgICogVGhlIGNsaWVudCB1c2VyIGNhbiB0b2dnbGUgYSBzcGVjaWZpYyBncm91cGluZyB0byBiZSBvcGVuL2Nsb3NlXG4gICAqIEBwYXJhbSBncm91cFxuICAgKi9cbiAgcHVibGljIG9uVG9nZ2xlR3JvdXAoIGdyb3VwOiBTZWxlY3RGaWx0ZXJHcm91cEludGVyZmFjZSApe1xuICAgIGlmKCB0aGlzLmNvbmZpZy5ncm91cHMubGVuZ3RoID4gMSApe1xuICAgICAgZ3JvdXAub3BlbiA9ICFncm91cC5vcGVuO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIENsb3NlcyB0aGUgZHJvcGRvd24gaWYgaXQgaXMgYWN0aXZlLlxuICAgKiBUaGlzIG1ldGhvZCBpcyBjYWxsZWQgZnJvbSB0aGUgQ2xpY2tPdXRzaWRlIGRpcmVjdGl2ZS5cbiAgICogSWYgdGhlIHVzZXIgY2xpY2tzIG91dHNpZGUgb2YgdGhlIGNvbXBvbmVudCwgaXQgd2lsbCBjbG9zZVxuICAgKiBAcGFyYW0gZXZlbnRcbiAgICogQHJldHVybnMgdm9pZFxuICAgKi9cbiAgcHVibGljIG9uT3V0c2lkZUNMaWNrKCk6IHZvaWR7XG4gICAgdGhpcy5fY2xvc2VPcHRpb25MaXN0KCk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBDaGVja3MvVW5jaGVja3MgYWxsIG9mIHRoZSBmaWx0ZXJlZCBvcHRpb25zIHdpdGhpbiBhIHNwZWNpZmljIGdyb3VwXG4gICAqIEBwYXJhbSAgRmllbGRPcHRpb24gb3B0aW9uXG4gICAqIEByZXR1cm5zIGJvb2xlYW5cbiAgICovXG4gIHB1YmxpYyBvbkFsbENoYW5nZSggY2hlY2tlZDogYm9vbGVhbiApOiBib29sZWFue1xuICAgIGlmKCAhdGhpcy5jb25maWcubXVsdGlwbGUgKSByZXR1cm4gZmFsc2U7XG4gICAgdGhpcy5jb25maWcuZ3JvdXBzLm1hcCggKCBncm91cCApID0+IHtcbiAgICAgIGdyb3VwLm9wdGlvbnMudmFsdWVzLm1hcCggKCBvcHRpb246IEZpZWxkSXRlbU9wdGlvbiApID0+IHtcbiAgICAgICAgb3B0aW9uLnNlbGVjdGVkID0gY2hlY2tlZDtcbiAgICAgIH0gKTtcbiAgICAgIGdyb3VwLmFsbCA9IGNoZWNrZWQ7XG4gICAgICBncm91cC5pbmRldGVybWluYXRlID0gZmFsc2U7XG4gICAgfSApO1xuICAgIHNldFRpbWVvdXQoICgpID0+IHtcbiAgICAgIHRoaXMuX3VwZGF0ZVNlbGVjdGVkT3B0aW9ucygpO1xuICAgIH0sIDAgKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBDaGVja3MvVW5jaGVja3MgYWxsIG9mIHRoZSBmaWx0ZXJlZCBvcHRpb25zIHdpdGhpbiBhIHNwZWNpZmljIGdyb3VwXG4gICAqIEBwYXJhbSAgRmllbGRPcHRpb24gb3B0aW9uXG4gICAqIEByZXR1cm5zIGJvb2xlYW5cbiAgICovXG4gIHB1YmxpYyBvbkdyb3VwQ2hhbmdlKCBjaGVja2VkOiBib29sZWFuLCBncm91cCApOiBib29sZWFue1xuICAgIGlmKCAhdGhpcy5jb25maWcubXVsdGlwbGUgKSByZXR1cm4gZmFsc2U7XG4gICAgZ3JvdXAub3B0aW9ucy52YWx1ZXMubWFwKCAoIG9wdGlvbjogRmllbGRJdGVtT3B0aW9uICkgPT4ge1xuICAgICAgaWYoICFvcHRpb24uaGlkZGVuICl7XG4gICAgICAgIG9wdGlvbi5zZWxlY3RlZCA9IGNoZWNrZWQ7XG4gICAgICB9XG4gICAgfSApO1xuICAgIHNldFRpbWVvdXQoICgpID0+IHtcbiAgICAgIHRoaXMuX2NoZWNrR3JvdXBTdGF0ZSggY2hlY2tlZCwgZ3JvdXAgKTtcbiAgICAgIHRoaXMuX3VwZGF0ZVNlbGVjdGVkT3B0aW9ucygpO1xuICAgIH0sIDAgKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBVcGRhdGUncyB0aGUgbGlzdCBvZiBzZWxlY3RlZCBvcHRpb25zIGluc2lkZSBvZiB0aGUgY29uZmlnXG4gICAqIGFuZCBlbWl0cyBhIGNoYW5nZSBldmVudC4gVGhpcyBtZXRob2Qgd2lsbCBiZSBjYWxsZWQgYnkgdGhlIHZpZXdcbiAgICogd2hlbmV2ZXIgYW4gb3B0aW9uIGlzIHNlbGVjdGVkXG4gICAqIEBwYXJhbSBNYXRTZWxlY3Rpb25MaXN0Q2hhbmdlIGV2ZW50XG4gICAqIEByZXR1cm5zIHZvaWRcbiAgICovXG4gIHB1YmxpYyBvbk9wdGlvbkNoYW5nZSggZXZlbnQsIG9wdGlvbiwgZ3JvdXAgKTogdm9pZHtcbiAgICBzZXRUaW1lb3V0KCAoKSA9PiB7XG4gICAgICBvcHRpb24uc2VsZWN0ZWQgPSBldmVudC50YXJnZXQuY2xhc3NOYW1lLnNlYXJjaCggJ21hdC1wc2V1ZG8tY2hlY2tib3gtY2hlY2tlZCcgKSA+IC0xID8gdHJ1ZSA6IGZhbHNlO1xuICAgICAgdGhpcy5fY2hlY2tHcm91cFN0YXRlKCBvcHRpb24uc2VsZWN0ZWQsIGdyb3VwICk7XG4gICAgICB0aGlzLl91cGRhdGVTZWxlY3RlZE9wdGlvbnMoKTtcbiAgICB9LCAwICk7XG4gIH1cblxuXG4gIHB1YmxpYyBvbkxpbmsoKXtcbiAgICBjb25zb2xlLmxvZyggJ0xJTksgU1RVQjogTGluayB0byBFbnRpdHknLCB0aGlzLmNvbmZpZy5jb250cm9sLnZhbHVlICk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgdGhlIGdpdmVuIG9wdGlvbiBpcyBpbiB0aGUgbGlzdCBvZiBzZWxlY3RlZCBvcHRpb25zXG4gICAqIGluIHRoZSBjb25maWcuIFVzZWQgYnkgdGhlIHZpZXcgdG8gc2V0IHRoZSBjaGVja2JveCdzIG9uIHRoZSBpbml0aWFsIHN0YXRlIG9mIHRoZSBkcm9wZG93blxuICAgKiBAcGFyYW0gIEZpZWxkT3B0aW9uIG9wdGlvblxuICAgKiBAcmV0dXJucyBib29sZWFuXG4gICAqL1xuICBwdWJsaWMgaXNPcHRpb25TZWxlY3RlZCggb3B0aW9uOiBGaWVsZEl0ZW1PcHRpb24gKTogYm9vbGVhbntcbiAgICByZXR1cm4gb3B0aW9uLnNlbGVjdGVkO1xuICB9XG5cblxuICBuZ09uRGVzdHJveSgpe1xuICAgIHN1cGVyLm5nT25EZXN0cm95KCk7XG4gIH1cblxuXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVW5kZXIgVGhlIEhvb2QgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBQcml2YXRlIE1ldGhvZCApICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4gIC8qKlxuICAgKiBPYnNlcnZlcyB0aGUgdmFsdWUgY2hhbmdlcyB0byB0aGUgc2VhcmNoIGFuZCB0cmlnZ2VycyB0aGUgZmlsdGVyIG9mIHRoZSBvcHRpb25zXG4gICAqIEByZXR1cm5zIHZvaWRcbiAgICovXG4gIHByaXZhdGUgX3NldFVwRmlsdGVyT2JzZXJ2YWJsZSgpOiB2b2lke1xuICAgIHRoaXMudWkuc2VhcmNoLmNvbmZpZy5jb250cm9sLnZhbHVlQ2hhbmdlc1xuICAgICAgLnBpcGUoXG4gICAgICAgIGRlYm91bmNlVGltZSggMjAwIClcbiAgICAgICkuc3Vic2NyaWJlKCAoIHZhbHVlOiBzdHJpbmcgKSA9PiB7XG4gICAgICB0aGlzLl9maWx0ZXJPcHRpb25zTGlzdCggdmFsdWUgKTtcbiAgICB9ICk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBDbG9zZSB0aGUgb3B0aW9uIGxpc3RcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHByaXZhdGUgX2Nsb3NlT3B0aW9uTGlzdCgpe1xuICAgIGlmKCB0aGlzLmRvbS5zdGF0ZS5maWx0ZXJBY3RpdmF0ZWQgKXtcbiAgICAgIC8vIHRoaXMuY29uZmlnLmNvbnRyb2wuc2V0VmFsdWUoICcnLCB7IGVtaXRFdmVudDogdHJ1ZSB9ICk7XG4gICAgICB0aGlzLmRvbS5zdGF0ZS5maWx0ZXJBY3RpdmF0ZWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuY2RyLmRldGVjdENoYW5nZXMoKTtcbiAgICAgIHRoaXMuX2NoZWNrU2VsZWN0ZWRWYWx1ZSggdGhpcy5kb20uc3RhdGUuZmlsdGVyQWN0aXZhdGVkICk7XG4gICAgICB0aGlzLl9maWx0ZXJPcHRpb25zTGlzdCgnJyk7XG4gICAgICB0aGlzLm9uQnViYmxlRXZlbnQoICdjbG9zZScgKTtcbiAgICAgIHRoaXMuY29uZmlnLm9mZnNldCA9IG51bGw7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogQ2hlY2sgdGhlIHNlbGVjdGVkIHZhbHVlIHRvIHNlZSBpZiBpdCBuZWVkcyB0byBiZSBzdG9yZWRcbiAgICogQHBhcmFtIG9wZW5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHByaXZhdGUgX2NoZWNrU2VsZWN0ZWRWYWx1ZSggb3BlbjogYm9vbGVhbiApe1xuICAgIC8vIGlmKCAhb3BlbiApe1xuICAgIGlmKCB0aGlzLnVpLnNlbGVjdGVkLmNvbmZpZy5jb250cm9sLmludmFsaWQgKXtcbiAgICAgIGlmKCB0aGlzLmNvbmZpZy5kaXNwbGF5RXJyb3JzICkgdGhpcy5jb25maWcubWVzc2FnZSA9IFZhbGlkYXRpb25FcnJvck1lc3NhZ2VzKCB0aGlzLnVpLnNlbGVjdGVkLmNvbmZpZy5jb250cm9sLmVycm9ycyApO1xuICAgIH1lbHNlIGlmKCB0aGlzLmNvbmZpZy5wYXRjaCAmJiAoIHRoaXMuY29uZmlnLnBhdGNoLnBhdGggfHwgdGhpcy5jb25maWcuZmFjYWRlICkgKXtcbiAgICAgIGlmKCBKU09OLnN0cmluZ2lmeSggdGhpcy5jb25maWcuc2VsZWN0ZWRPcHRpb25zICkgIT09IHRoaXMuYXNzZXQub25Gb2N1c1ZhbHVlICl7XG4gICAgICAgIHRoaXMub25DaGFuZ2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuXG5cbiAgLyoqXG4gICAqIERldGVjdHMgaWYgdGhlIGxpc3Qgb2Ygb3B0aW9ucyBzaG91bGQgYXBwZWFyIGFib3ZlIG9yIGJlbG93IHRoZSBzZWxlY3QgaW5wdXRcbiAgICogQHBhcmFtIGhlaWdodFxuICAgKi9cbiAgcHJpdmF0ZSBfc2V0T3B0aW9uTGlzdFBvc2l0aW9uKCBwYXJhbXM6IHsgYWJvdmU6IG51bWJlciwgYmVsb3c6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIgfSApOiB2b2lke1xuICAgIGlmKCBwYXJhbXMuaGVpZ2h0ID4gMCApe1xuICAgICAgdGhpcy5jb25maWcub2Zmc2V0ID0gbnVsbDtcbiAgICAgIHRoaXMuZG9tLnN0YXRlLmFib3ZlID0gcGFyYW1zLmFib3ZlO1xuICAgICAgdGhpcy5kb20uc3RhdGUuYmVsb3cgPSBwYXJhbXMuYmVsb3c7XG4gICAgICB0aGlzLmRvbS5zdGF0ZS5saXN0ID0gcGFyYW1zLmhlaWdodDtcbiAgICAgIC8vIGlmKCB0aGlzLmNvbmZpZy5hbGxvd0FsbCApIHRoaXMuZG9tLnN0YXRlLmxpc3QgKz0gNjA7XG4gICAgICAvLyBpZiggdGhpcy5jb25maWcuZmlsdGVyICkgdGhpcy5kb20uc3RhdGUubGlzdCArPSA1ODtcbiAgICAgIHRoaXMuY29uZmlnLnBvc2l0aW9uID0gdGhpcy5kb20uc3RhdGUuYmVsb3cgPj0gdGhpcy5kb20uc3RhdGUuYWJvdmUgPyAnYmVsb3cnIDogJ2Fib3ZlJztcbiAgICAgIHRoaXMuY29uZmlnLmhlaWdodCA9IHRoaXMuY29uZmlnLmRlZmF1bHRIZWlnaHQ7XG4gICAgICBpZiggdGhpcy5jb25maWcucG9zaXRpb24gPT09ICdhYm92ZScgKXtcbiAgICAgICAgaWYoIHRoaXMuY29uZmlnLmhlaWdodCA+IHRoaXMuZG9tLnN0YXRlLmFib3ZlICkgdGhpcy5jb25maWcuaGVpZ2h0ID0gdGhpcy5kb20uc3RhdGUuYWJvdmU7XG4gICAgICAgIHRoaXMuY29uZmlnLm1pbkhlaWdodCA9IHRoaXMuY29uZmlnLmhlaWdodDtcbiAgICAgIH1lbHNle1xuICAgICAgICBpZiggdGhpcy5jb25maWcuaGVpZ2h0ID4gdGhpcy5kb20uc3RhdGUuYmVsb3cgKSB0aGlzLmNvbmZpZy5oZWlnaHQgPSB0aGlzLmRvbS5zdGF0ZS5iZWxvdztcbiAgICAgICAgLy8gdGhpcy5jb25maWcubWluSGVpZ2h0ID0gdGhpcy5jb25maWcuZGVmYXVsdE1pbkhlaWdodDtcbiAgICAgICAgdGhpcy5jb25maWcubWluSGVpZ2h0ID0gdGhpcy5jb25maWcuaGVpZ2h0O1xuICAgICAgfVxuICAgICAgdGhpcy5kb20uc2V0VGltZW91dCggYHNlYXJjaC1mb2N1c2AsICgpID0+IHtcbiAgICAgICAgaWYoIHRoaXMuc2VhcmNoUmVmICl7XG4gICAgICAgICAgdGhpcy5zZWFyY2hSZWYubmF0aXZlRWxlbWVudC5mb2N1cygpO1xuICAgICAgICAgIC8vIHRoaXMub25CdWJibGVFdmVudCggJ2ZvY3VzJyApO1xuICAgICAgICB9XG4gICAgICB9LCAyMDAgKTtcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBEZXRlY3RzIHdoZXRoZXIgdGhlIGNoZWNrIGFsbCAgYm94IGZvciBhIGdyb3VwIHNob3VsZCBiZSB1bmNoZWNrZWQsIGNoZWNrZWQsIG9yIGluZGV0ZXJtaW5hdGVcbiAgICogQHBhcmFtIGNoZWNrZWRcbiAgICogQHBhcmFtIGdyb3VwXG4gICAqL1xuICBwcml2YXRlIF9jaGVja0dyb3VwU3RhdGUoIGNoZWNrZWQ6IGJvb2xlYW4sIGdyb3VwICk6IHZvaWR7XG4gICAgbGV0IGluZGV0ZXJtaW5hdGUgPSBmYWxzZTtcbiAgICBsZXQgYWxsID0gdHJ1ZTtcbiAgICBpZiggIWNoZWNrZWQgKXtcbiAgICAgIGFsbCA9IGZhbHNlO1xuICAgICAgZ3JvdXAub3B0aW9ucy52YWx1ZXMuc29tZSggKCBvcHRpb24gKSA9PiB7XG4gICAgICAgIGlmKCAhb3B0aW9uLmhpZGRlbiAmJiBvcHRpb24uc2VsZWN0ZWQgKXtcbiAgICAgICAgICBpbmRldGVybWluYXRlID0gdHJ1ZTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSApO1xuICAgIH1lbHNle1xuICAgICAgZ3JvdXAub3B0aW9ucy52YWx1ZXMuc29tZSggb3B0aW9uID0+IHtcbiAgICAgICAgaWYoICFvcHRpb24uaGlkZGVuICYmICFvcHRpb24uc2VsZWN0ZWQgKXtcbiAgICAgICAgICBhbGwgPSBmYWxzZTtcbiAgICAgICAgICBpbmRldGVybWluYXRlID0gdHJ1ZTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSApO1xuICAgIH1cbiAgICBncm91cC5hbGwgPSBhbGw7XG4gICAgZ3JvdXAuaW5kZXRlcm1pbmF0ZSA9IGluZGV0ZXJtaW5hdGU7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBGaW5kcyBvbmx5IHRoZSBvcHRpb25zIGZyb20gdGhlIGNvbmZpZydzIG9wdGlvbnMgdGhhdCBtYXRjaFxuICAgKiB0aGUgc3RyaW5nIHBhc3NlZCBpbiwgYW5kIHJldHVybnMgdGhvc2Ugb3B0aW9ucy5cbiAgICogVXNlZCBhcyB0aGUgZmlsdGVyIHdoZW4gc2V0dGluZyB1cCB0aGUgZmlsdGVyZWRPcHRpb25zIG9ic2VydmFibGVcbiAgICogQHBhcmFtIHN0cmluZyB2YWx1ZVxuICAgKiBAcmV0dXJucyBGaWVsZEl0ZW1PcHRpb25cbiAgICovXG4gIHByaXZhdGUgX2ZpbHRlck9wdGlvbnNMaXN0KCBzZWFyY2g6IHN0cmluZyApOiB2b2lke1xuICAgIHRoaXMuY29uZmlnLmdyb3Vwcy5tYXAoICggZ3JvdXA6IFNlbGVjdEZpbHRlckdyb3VwSW50ZXJmYWNlICkgPT4ge1xuICAgICAgZ3JvdXAub3B0aW9ucy52YWx1ZXMubWFwKCAoIG9wdGlvbiApID0+IHtcbiAgICAgICAgb3B0aW9uLmhpZGRlbiA9IE9iamVjdENvbnRhaW5zVGFnU2VhcmNoKCBvcHRpb24sIHNlYXJjaCApID8gZmFsc2UgOiB0cnVlO1xuICAgICAgfSApO1xuICAgICAgZ3JvdXAuc2VsZWN0ZWQgPSBncm91cC5vcHRpb25zLnZhbHVlcy5maWx0ZXIoICggb3B0aW9uICkgPT4ge1xuICAgICAgICByZXR1cm4gIW9wdGlvbi5oaWRkZW4gJiYgb3B0aW9uLnNlbGVjdGVkO1xuICAgICAgfSApLmxlbmd0aDtcblxuICAgICAgZ3JvdXAudmlzaWJsZSA9IGdyb3VwLm9wdGlvbnMudmFsdWVzLmZpbHRlciggKCBvcHRpb24gKSA9PiB7XG4gICAgICAgIHJldHVybiAhb3B0aW9uLmhpZGRlbjtcbiAgICAgIH0gKS5sZW5ndGg7XG4gICAgICBjb25zdCBjaGVja2VkID0gZ3JvdXAudmlzaWJsZSA9PT0gZ3JvdXAuc2VsZWN0ZWQ7XG4gICAgICB0aGlzLl9jaGVja0dyb3VwU3RhdGUoIGNoZWNrZWQsIGdyb3VwICk7XG4gICAgfSApO1xuICAgIHRoaXMuY2RyLmRldGVjdENoYW5nZXMoKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFVwZGF0ZSdzIHRoZSBzZWxlY3Rpb24gb3B0aW9ucyBpbiBjb25maWdcbiAgICogYnkgbG9vcGluZyB0aHJvdWdoIGFsbCBvZiB0aGUgY3VycmVudGx5IHNlbGVjdGVkIGl0ZW1zXG4gICAqIGluIHRoZSBzZWxlY3Rpb25MaXN0UmVmLlxuICAgKiBAcGFyYW0gbnVtYmVyIGlkXG4gICAqL1xuICBwcml2YXRlIF91cGRhdGVTZWxlY3RlZE9wdGlvbnMoKXtcbiAgICBjb25zdCBzZWxlY3RlZCA9IHRoaXMuc2VsZWN0aW9uTGlzdFJlZi5zZWxlY3RlZE9wdGlvbnMuc2VsZWN0ZWQ7XG4gICAgbGV0IHN0cjogc3RyaW5nW10gPSBbXTtcbiAgICBpZiggdGhpcy5jb25maWcubXVsdGlwbGUgKXtcbiAgICAgIHRoaXMuY29uZmlnLnNlbGVjdGVkT3B0aW9ucyA9IFtdO1xuICAgICAgZm9yKCBjb25zdCBvcHRpb24gb2Ygc2VsZWN0ZWQgKXtcbiAgICAgICAgc3RyLnB1c2goIG9wdGlvbi5fdGV4dC5uYXRpdmVFbGVtZW50LmlubmVyVGV4dCApO1xuICAgICAgICB0aGlzLmNvbmZpZy5zZWxlY3RlZE9wdGlvbnMucHVzaCggU3RyaW5nKCBvcHRpb24udmFsdWUgKS50cmltKCkgKTtcbiAgICAgIH1cbiAgICAgIHN0ciA9IHN0ci5zb3J0KCk7XG4gICAgICB0aGlzLmNvbmZpZy5zdHJWYWwgPSBzdHIuam9pbiggJywgJyApO1xuICAgICAgdGhpcy51aS5zZWxlY3RlZC5jb25maWcuY29udHJvbC5zZXRWYWx1ZSggdGhpcy5jb25maWcuc3RyVmFsLCB7IGVtaXRFdmVudDogZmFsc2UgfSApO1xuICAgICAgY29uc3QgdmFsdWUgPSBKc29uQ29weSggdGhpcy5jb25maWcuc2VsZWN0ZWRPcHRpb25zICk7XG4gICAgICB0aGlzLmNvbmZpZy5jb250cm9sLnNldFZhbHVlKCB2YWx1ZSwgeyBlbWl0RXZlbnQ6IGZhbHNlIH0gKTtcbiAgICB9ZWxzZXtcbiAgICAgIGxldCB2YWx1ZTtcbiAgICAgIGZvciggY29uc3Qgb3B0aW9uIG9mIHNlbGVjdGVkICl7XG4gICAgICAgIHN0ci5wdXNoKCBvcHRpb24uX3RleHQubmF0aXZlRWxlbWVudC5pbm5lclRleHQgKTtcbiAgICAgICAgdmFsdWUgPSBvcHRpb24udmFsdWU7XG4gICAgICB9XG4gICAgICBzdHIgPSBzdHIuc29ydCgpO1xuICAgICAgdGhpcy5jb25maWcuc3RyVmFsID0gc3RyLmpvaW4oICcsICcgKTtcbiAgICAgIHRoaXMudWkuc2VsZWN0ZWQuY29uZmlnLmNvbnRyb2wuc2V0VmFsdWUoIHRoaXMuY29uZmlnLnN0clZhbCwgeyBlbWl0RXZlbnQ6IGZhbHNlIH0gKTtcbiAgICAgIHRoaXMuZG9tLmFjdGl2ZS5vcHRpb25JZCA9IHZhbHVlO1xuICAgICAgdGhpcy5jb25maWcuY29udHJvbC5zZXRWYWx1ZSggdmFsdWUsIHsgZW1pdEV2ZW50OiBmYWxzZSB9ICk7XG4gICAgICB0aGlzLmNvbmZpZy52YWx1ZSA9IHZhbHVlO1xuICAgICAgdGhpcy5fY2xvc2VPcHRpb25MaXN0KCk7XG4gICAgfVxuICB9XG59XG4iXX0=