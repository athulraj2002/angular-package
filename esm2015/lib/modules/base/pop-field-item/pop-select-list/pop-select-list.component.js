import { __awaiter } from "tslib";
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, Output, ViewChild, } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { InputConfig } from '../pop-input/input-config.model';
import { debounceTime } from 'rxjs/operators';
import { PopFieldItemComponent } from '../pop-field-item.component';
import { IsArray, IsCallableFunction, IsDefined, IsNumber, IsObject, ObjectContainsTagSearch } from '../../../../pop-common-utility';
import { SwitchConfig } from '../pop-switch/switch-config.model';
export class PopSelectListComponent extends PopFieldItemComponent {
    constructor(el, cdr) {
        super();
        this.el = el;
        this.cdr = cdr;
        // emitted every time there is an option selection, search focus, or the filter options close
        this.events = new EventEmitter();
        this.name = 'PopSelectListComponent';
        this.asset = {
            filteredOptions: undefined,
            groups: [],
            onFocusValue: undefined,
            filterActivated: false,
            disabled: {}
        };
        this.ui = {
            search: {
                config: undefined,
            },
            all: {
                overlay: undefined,
            }
        };
        this.dom.configure = () => {
            return new Promise((resolve) => {
                this._setInitialDomState();
                this._setUpFilterObservable();
                this._setListPosition();
                this._filterOptionList('');
                this._setConfigHooks();
                return resolve(true);
            });
        };
        this.dom.proceed = () => {
            return new Promise((resolve) => {
                this._setInitialValue();
                return resolve(true);
            });
        };
    }
    ngOnInit() {
        super.ngOnInit();
    }
    triggerOnChange(wait = 1000) {
        this.dom.setTimeout('api-fetch', () => {
            this.onChange();
        }, wait);
    }
    /**
     * Checks/Unchecks all of the filtered options within a specific group
     * @param  FieldOption option
     * @returns boolean
     */
    onGroupChange(checked, group) {
        if (!this.config.multiple)
            return false;
        if (!checked)
            this.config.all = false;
        group.options.values.map((option) => {
            if (!option.hidden)
                option.selected = checked;
        });
        setTimeout(() => {
            this._checkGroupState(checked, group);
            this._updateSelectedOptions();
            this.onBubbleEvent('groupAllChange', 'Group Change', { data: group });
            this.onBubbleEvent('groupChange', 'Group Change', { data: group });
        }, 0);
        return false;
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
     * Allow the user to clear the search text
     */
    onClearSearch() {
        this.ui.search.config.control.setValue('');
    }
    /**
     * Update's the list of selected options inside of the config
     * and emits a change event. This method will be called by the view
     * whenever an option is selected
     * @param MatSelectionListChange event
     * @returns void
     */
    onOptionChange(event, option, group) {
        if (this.config.multiple) {
            // option.selected = event.target.className.search( 'mat-pseudo-checkbox-checked' ) > -1 ? true : false;
            option.selected = !option.selected;
            if (!option.selected)
                this.config.all = false;
            this._checkGroupState(option.selected, group);
            this._updateSelectedOptions();
            this.onBubbleEvent('optionChange', 'Option Change', { data: option });
            setTimeout(() => {
                this.onBubbleEvent('groupChange', 'Group Change', { data: group });
            }, 0);
        }
        else {
            this.dom.active.optionId = option.value;
            this.config.control.setValue(option.value);
            this.config.strVal = option.name;
            this.triggerOnChange(0);
        }
    }
    /**
     * Add on to set toggle special custom property
     * @param event
     * @param option
     */
    onOptionModeChange(event, option) {
        if (this.config.multiple) {
            setTimeout(() => {
                this.onBubbleEvent('optionModeChange', 'Option Mode Change', { data: option });
            }, 0);
        }
    }
    /**
     * On link click stub
     */
    onLinkClick() {
        console.log('LINK STUB: Link to Entity', this.config.control.value);
    }
    /**
     * Allow user to open close a group section
     * @param group
     */
    onToggleGroup(group) {
        if (this.config.groups.length > 1) {
            group.open = !group.open;
        }
    }
    /**
     * Checks if the given option is in the list of selected options
     * in the config. Used by the view to set the checkboxe's on the
     * initial state of the dropdown
     * @param  FieldOption option
     * @returns boolean
     */
    isOptionSelected(option) {
        return option.selected;
    }
    isSearchValue() {
        if (IsObject(this.ui.search.config, ['control']) && this.ui.search.config.control.value) {
            return true;
        }
        return false;
    }
    /**
     * Template logic to determine if a option is hidden
     * @param option
     */
    isOptionHidden(group, option) {
        if (!group.open && !(this.isSearchValue())) {
            return true;
        }
        if (option.hidden) {
            return true;
        }
        return false;
    }
    /**
     * Template logic to determine if a option is active
     * @param option
     */
    isOptionActive(option) {
        return this.dom.active.optionId && option.value === this.dom.active.optionId;
    }
    /**
     * Template logic to determine if a option is disabled
     * @param option
     */
    isOptionDisabled(option) {
        return this.asset.disabled[option.value];
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
    _setConfigHooks() {
        this.config.triggerOnChange = (value) => {
            this.config.control.setValue(value);
            this.config.control.markAsPristine();
            this.config.message = '';
            this.config.control.updateValueAndValidity();
            this.onChange();
        };
        this.config.disableOption = (optionId) => {
            if (IsDefined(optionId)) {
                this.asset.disabled[optionId] = true;
            }
        };
        this.config.enableOption = (optionId) => {
            if (IsDefined(optionId)) {
                delete this.asset.disabled[optionId];
            }
        };
        this.config.setDisabled = (optionsIds = null) => {
            this.dom.setTimeout(`set-disabled`, () => {
                this.config.disabledIds = optionsIds;
                this._setDisabledIds();
            }, 0);
        };
        this.config.focusSearch = () => {
            this.dom.setTimeout(`search-focus`, () => {
                if (this.searchRef) {
                    this.searchRef.nativeElement.focus();
                    // this.onBubbleEvent( 'focus' );
                }
            }, 200);
        };
        this.config.setActive = (optionId) => {
            this.dom.setTimeout(`set-disabled`, () => {
                if (+optionId) {
                    this.dom.active.optionId = optionId;
                    delete this.asset.disabled[optionId];
                }
            }, 5);
        };
        this.config.setHeight = (height) => {
            this.dom.setTimeout(`set-height`, () => {
                if (+height) {
                    this.config.minHeight = height;
                    this.config.height = height;
                }
            }, 5);
        };
        this.config.clearSelected = () => {
            this.dom.setTimeout(`clear-selected`, () => {
                this.onAllChange(false);
            }, 0);
        };
    }
    /**
     * Set the inital dom state of the component
     * @private
     */
    _setInitialDomState() {
        this.dom.state.helper = false;
        this.dom.state.filter = undefined;
        this.dom.state.allOverlayEnabled = this.config.allOverlayEnabled ? true : false;
        this.dom.state.filterActivated = false;
        this.dom.state.above = undefined;
        this.dom.state.below = undefined;
        this.dom.state.list = undefined;
        this.asset.filterActivated = false;
        this.dom.state.checkboxPosition = this.config.checkboxPosition === 'left' ? 'before' : 'after';
        this.ui.search.config = new InputConfig({
            value: '',
            helpText: this.config.helpText,
            displayErrors: false,
            label: this.config.label,
            readonly: true,
            maxlength: 255
        });
        this.ui.all.overlay = this.config.allOverlay ? new SwitchConfig({
            value: this.config.allOverlayEnabled,
            displayErrors: false,
            label: this.config.allOverlayLabel,
            disabled: this.config.disabled,
            facade: true,
            labelPosition: this.config.checkboxPosition === 'after' ? 'before' : 'after',
            patch: {
                path: '',
                field: '',
                callback: (core, event) => {
                    this.dom.setTimeout(`overlay-callback`, () => __awaiter(this, void 0, void 0, function* () {
                        this.dom.state.allOverlayEnabled = event.config.control.value === true;
                        if (IsCallableFunction(this.config.allOverlayCallback)) {
                            yield this.config.allOverlayCallback(core, event);
                        }
                    }), 0);
                }
            }
        }) : null;
        if (!this.config.multiple) {
            this.selectionListRef.selectedOptions = new SelectionModel(false);
        }
        this.asset.onFocusValue = JSON.stringify(this.config.selectedOptions);
        this._setDisabledIds();
    }
    /**
     * Set the lead mapping options that are disabled;
     * @private
     */
    _setDisabledIds() {
        this.asset.disabled = {};
        if (IsArray(this.config.disabledIds)) {
            this.config.disabledIds.map((optionId) => {
                if (IsNumber(optionId)) {
                    this.asset.disabled[optionId] = true;
                }
            });
        }
    }
    _setInitialValue() {
        if (!this.config.multiple && !this.dom.active.optionId) {
            if (IsDefined(this.config.value, false)) {
                this.dom.active.optionId = this.config.value;
                if (!(IsDefined(this.config.control.value, false))) {
                    this.config.control.setValue(this.config.value);
                }
            }
        }
        else {
            if (!(IsArray(this.config.control.value))) {
                this.config.control.setValue([]);
            }
        }
    }
    /**
     * Observes the value changes to the search and triggers the filter of the options
     * @returns void
     */
    _setUpFilterObservable() {
        this.ui.search.config.control.valueChanges
            .pipe(debounceTime(200)).subscribe((value) => {
            this._filterOptionList(value);
        });
    }
    /**
     * Detects if the list of options should appear above or below the select input
     * @param height
     */
    _setListPosition() {
        // this.config.minHeight = this.config.minHeight;
        // this.config.minHeight = 200;
        // this.config.height = this.config.defaultHeight;
    }
    /**
     * Detects where the check all  box for a group should be unchecked, checked, or indeterminate
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
    _filterOptionList(search) {
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
            try {
                this.cdr.detectChanges();
            }
            catch (e) {
            }
        });
    }
    /**
     * Update's the selection options in config
     * by looping through all of the currently selected items
     * in the selectionListRef.
     * @param number id
     */
    _updateSelectedOptions() {
        this.dom.setTimeout('update-selected-options', () => {
            const selected = this.selectionListRef.selectedOptions.selected;
            let str = [];
            this.config.selectedOptions = [];
            for (const option of selected) {
                str.push(option._text.nativeElement.innerText);
                this.config.selectedOptions.push(option.value);
            }
            this.config.control.setValue(this.config.selectedOptions.slice());
            str = str.sort();
            this.config.strVal = str.join(', ');
            this.triggerOnChange();
        }, 50);
    }
    /**
     * Set up the body of the api patch
     * @param value
     * @private
     */
    _getPatchBody(value) {
        const patch = this.config.patch;
        const body = {};
        if (this.config.all) {
            if (typeof this.config.allValue !== 'undefined') {
                body[this.config.patch.field] = this.config.allValue;
            }
            else if (this.config.patchGroupFk) {
                body[this.config.patch.field] = [];
                this.config.groups.map((group) => {
                    body[this.config.patch.field].push(`0:${group.groupFk}`);
                });
            }
            else {
                body[this.config.patch.field] = this.config.selectedOptions.length ? this.config.selectedOptions : [];
            }
        }
        else {
            if (this.config.multiple) {
                if (!this.config.control.value.length && typeof this.config.emptyValue !== 'undefined') {
                    body[this.config.patch.field] = this.config.emptyValue;
                }
                else if (this.config.patchGroupFk) {
                    body[this.config.patch.field] = [];
                    this.config.groups.map((group) => {
                        if (group.all) {
                            body[this.config.patch.field].push(`0:${group.groupFk}`);
                        }
                        else {
                            group.options.values.filter((option) => {
                                return option.selected;
                            }).map((option) => {
                                body[this.config.patch.field].push(`${option.value}:${group.groupFk}`);
                            });
                        }
                    });
                }
                else {
                    body[this.config.patch.field] = this.config.control.value.length ? this.config.control.value : [];
                }
            }
            else {
                value = typeof value !== 'undefined' ? value : this.config.control.value;
                body[this.config.patch.field] = value;
            }
            if (patch && patch.metadata) {
                for (const i in patch.metadata) {
                    if (!patch.metadata.hasOwnProperty(i))
                        continue;
                    body[i] = patch.metadata[i];
                }
            }
        }
        if (IsArray(body[this.config.patch.field], true))
            body[this.config.patch.field].sort(function (a, b) {
                return a - b;
            });
        if (this.config.patch.metadata) {
            for (const i in this.config.patch.metadata) {
                if (!this.config.patch.metadata.hasOwnProperty(i))
                    continue;
                body[i] = this.config.patch.metadata[i];
            }
        }
        if (this.config.patch.json)
            body[this.config.patch.field] = JSON.stringify(body[this.config.patch.field]);
        return body;
    }
}
PopSelectListComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-select-list',
                template: "<div class=\"pop-select-list-container import-field-item-container\">\n  <div class=\"pop-select-list-label\" *ngIf=\"config.label\">\n    {{config.label}}\n  </div>\n  <div *ngIf=\"config.helpText && !config.message && ( !config.patch || !config.patch.running )\"\n       class=\"sw-pop-icon sw-pointer pop-select-list-helper-icon\"\n       (mouseenter)=\"dom.state.helper = true\"\n       (mouseleave)=\"dom.state.helper = false\"\n       matTooltip=\"{{config.helpText}}\"\n       matTooltipPosition=\"above\">X\n  </div>\n  <div class=\"pop-select-list-feedback\">\n    <div *ngIf=\"config.message\"\n         class=\"pop-select-error-icon\"\n         matTooltipPosition=\"left\"\n         [matTooltip]=config.message>\n      <mat-icon color=\"warn\">info</mat-icon>\n    </div>\n  </div>\n  <div class=\"pop-select-list-items\" #list>\n\n    <div class=\"import-flex-row pop-select-list-overlay pop-select-list-option-header-open\" *ngIf=\"ui.all.overlay\">\n      <lib-pop-switch [config]=\"ui.all.overlay\"></lib-pop-switch>\n    </div>\n\n    <div class=\"pop-select-search-header\">\n      <mat-checkbox\n        *ngIf=\"config.multiple && config.allowAll && config.checkboxPosition === 'before'\"\n        class=\"pop-select-list-checkbox-before\"\n        [ngClass]=\"{'sw-hidden': dom.state.allOverlayEnabled}\"\n        [(ngModel)]=\"config.all\"\n        [disabled]=\"config.disabled\"\n        [color]=\"'primary'\"\n        matTooltip=\"Toggle All\"\n        matTooltipPosition=\"above\"\n        (change)=\"onAllChange($event.checked);\">\n      </mat-checkbox>\n\n      <mat-form-field *ngIf=\"config.filter && ui.search.config\" appearance=\"none\" floatLabel=\"never\" class=\"sw-search\"\n                      [ngClass]=\"{'sw-hidden': dom.state.allOverlayEnabled}\">\n        <a matPrefix>\n          <mat-icon>search</mat-icon>\n        </a>\n        <input matInput placeholder=\"Search\"\n               #search\n               type=\"text\"\n               [formControl]=\"ui.search.config.control\">\n        <mat-icon *ngIf=\"ui.search.config.control.value\" class=\"pop-select-list-clear sw-pointer\" matSuffix\n                  (click)=\"onClearSearch();\">\n          close\n        </mat-icon>\n      </mat-form-field>\n\n      <mat-checkbox\n        *ngIf=\"config.multiple && config.allowAll && config.checkboxPosition === 'after'\"\n        class=\"pop-select-list-checkbox-after\"\n        [ngClass]=\"{'sw-hidden': dom.state.allOverlayEnabled}\"\n        [(ngModel)]=\"config.all\"\n        [color]=\"'primary'\"\n        [disabled]=\"config.disabled\"\n        matTooltip=\"Toggle All\"\n        matTooltipPosition=\"above\"\n        (change)=\"onAllChange($event.checked);\">\n      </mat-checkbox>\n      <div *ngIf=\"dom.state.allOverlayEnabled && config.allOverlayMessage\" class=\"pop-select-list-overlay-message\"\n           [innerHTML]=config.allOverlayMessage></div>\n    </div>\n\n\n    <mat-selection-list [style.minHeight.px]=config.minHeight [style.maxHeight.px]=config.height #selectionList [multiple]=config.multiple>\n      <div *ngFor=\"let group of config.groups\" [ngClass]=\"{'sw-hidden': dom.state.allOverlayEnabled}\">\n        <div class=\"pop-select-list-option-header\" [ngClass]=\"{'pop-select-list-option-header-open': group.open, 'pop-select-list-option-header-before': config.checkboxPosition === 'before', 'pop-select-list-option-header-after': config.checkboxPosition !== 'before'}\" *ngIf=\"group.label && group.visible\">\n          <mat-checkbox\n            *ngIf=\"config.multiple && config.checkboxPosition === 'before'\"\n            [ngClass]=\"{'sw-disabled': !config.allowGroupAll}\"\n            [(ngModel)]=\"group.all\"\n            [color]=\"'primary'\"\n            [indeterminate]=group.indeterminate\n            matTooltip=\"Toggle Group\"\n            matTooltipPosition=\"above\"\n            (change)=\"onGroupChange($event.checked, group);\">\n          </mat-checkbox>\n          <div class=\"pop-select-list-header-label\" (click)=\"onToggleGroup(group);\">{{group.label}}\n            ({{group.options.values.length}})\n          </div>\n          <mat-checkbox\n            *ngIf=\"config.multiple && config.checkboxPosition === 'after'\"\n            [ngClass]=\"{'sw-disabled': !config.allowGroupAll}\"\n            [(ngModel)]=\"group.all\"\n            [color]=\"'primary'\"\n            [indeterminate]=group.indeterminate\n            matTooltip=\"Toggle Group\"\n            matTooltipPosition=\"above\"\n            (change)=\"onGroupChange($event.checked, group);\">\n          </mat-checkbox>\n        </div>\n\n        <mat-list-option\n          *ngFor=\"let option of group.options.values\"\n          [checkboxPosition]=config.checkboxPosition\n          [disabled]=\"config.disabled\"\n          class=\"pop-select-list-option\"\n          [ngClass]=\"{'pop-select-list-active': isOptionActive(option), 'sw-disabled': isOptionDisabled(option),'sw-hidden': isOptionHidden(group, option), 'pop-select-list-checkbox-before': config.checkboxPosition === 'before', 'pop-select-list-checkbox-after': config.checkboxPosition === 'after'}\"\n          [style.paddingLeft]=\"option.indentation+'px'\"\n          [selected]=isOptionSelected(option)\n          (click)=\"onOptionChange($event, option, group);\"\n          [value]=\"option.value\">\n          {{option.name}}\n          <div *ngIf=\"config.multiple && config.mode\" class=\"pop-select-list-mode-toggle\"\n               (click)=\"$event.stopPropagation()\">\n            <mat-button-toggle-group [(ngModel)]=\"option.mode\" (ngModelChange)=\"onOptionModeChange($event, option)\"\n                                     name=\"model\" aria-label=\"Mode\">\n              <mat-button-toggle *ngFor=\"let mode of config.mode\"\n                                 value=\"{{mode.value}}\">{{mode.name}}</mat-button-toggle>\n            </mat-button-toggle-group>\n          </div>\n        </mat-list-option>\n\n      </div>\n      <lib-pop-field-item-loader\n        [show]=\"config.patch.displayIndicator && config.patch.running\"></lib-pop-field-item-loader>\n    </mat-selection-list>\n  </div>\n</div>\n",
                styles: [".pop-select-list-container{position:relative;display:block;padding:5px 0 0;margin:10px 0 0;box-sizing:border-box;border-top-style:none;border-radius:3px}.pop-select-list-items{border:1px solid var(--border)}.pop-select-list-label{height:15px;margin-bottom:var(--gap-s)}.pop-select-search-header{display:flex;flex-direction:row;min-height:40px;align-items:center;justify-content:stretch;border-bottom:1px solid var(--border);background:var(--background-base);padding-left:5px}.mat-form-field{padding:0 10px}.sw-search{margin-top:-16px}.sw-search,.sw-search .mat-form-field-flex{display:flex;flex-grow:1}.pop-select-all-header{display:flex;flex-direction:row;-webkit-tap-highlight-color:transparent;width:100%;justify-content:space-between;align-items:center;box-sizing:border-box;padding:0 10px 0 15px;cursor:pointer;height:30px;outline:0;background:var(--bg-3)}.pop-select-header-label{position:relative;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-style:italic;font-weight:700;font-size:16px}.pop-select-list-helper-icon{position:absolute;right:1px;top:4px;font-size:.7em;z-index:2}.mat-form-field{display:block;height:30px}.pop-select-list-option{box-sizing:border-box;background:var(--background-2);height:30px;padding:0 5px}.expand-to-container{position:absolute!important;top:0;left:0;bottom:0;right:0;box-sizing:border-box!important;-moz-box-sizing:border-box}.pop-select-list-feedback{z-index:4;position:absolute;top:0;right:0;display:flex;flex-flow:row;align-items:center;justify-content:center}.pop-select-list-option-header{display:flex;flex-direction:row;-webkit-tap-highlight-color:transparent;padding:0;justify-content:flex-start;align-items:center;box-sizing:border-box;cursor:pointer;height:30px;border-top:1px solid var(--border)!important;background:var(--background-item-menu);outline:0}.pop-select-list-option-header ::ng-deep .mat-checkbox{margin-right:1px!important}.pop-select-list-option-header-before{padding:0 4px 0 20px!important}.pop-select-list-option-header-after{padding:0 4px!important}.pop-select-list-option-header-open{border-bottom:1px solid var(--border)!important}.pop-select-option-header:hover{background:var(--background-hover)}.pop-select-list-header-label{position:relative;flex:1;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:700;font-size:16px;padding-left:var(--gap-xs)}.pop-select-list-clear{position:relative;top:3px}.pop-select-list-overlay{background:var(--background-base);padding:0 var(--gap-xs)!important}.pop-select-list-overlay ::ng-deep .import-field-item-container{margin:0}.pop-select-list-overlay:hover:not(:focus){background:var(--accent-shade)!important}.pop-select-list-overlay-message{display:flex;align-items:center;justify-content:center;height:40px;width:100%}.select-list-error-icon{position:absolute;top:13px;left:2px}.pop-select-list-mode-toggle{position:absolute;top:5px;min-width:50px;padding:2px;right:40px}.pop-select-list-mode-toggle ::ng-deep .mat-button-toggle-group{height:20px;background:var(--background-base)}.pop-select-list-mode-toggle ::ng-deep .mat-button-toggle-label-content{line-height:12px;font-size:12px;color:var(--foreground-base)!important}.pop-select-list-mode-toggle ::ng-deep .mat-button-toggle-checked{background:var(--accent-background)!important}.select-ajax-spinner{position:absolute;z-index:2}.pop-select-list-active{background:var(--background-code)!important;color:var(--background-base)!important}.pop-select-list-checkbox-after{margin-right:-2px}:host ::ng-deep .checkbox-after{direction:rtl}:host ::ng-deep .checkbox-after .mat-checkbox-layout{width:100%}:host ::ng-deep .checkbox-after .mat-checkbox-layout .mat-checkbox-inner-container{margin:0 9px 0 auto}:host ::ng-deep .mat-checkbox-inner-container{margin:0 0 0 16px}:host ::ng-deep .pop-select-search-header .mat-checkbox-inner-container{margin:0 0 0 16px!important}:host ::ng-deep .mat-checkbox-label{padding:0 0 0 16px}:host ::ng-deep .mat-list-item-content-reverse{padding:0 10px 0 5px!important}:host ::ng-deep mat-selection-list{overflow-y:scroll;overflow-x:hidden;outline:0!important;background:transparent!important}:host ::ng-deep mat-list-option{border:none!important}.pop-select-list-option:hover:not(:focus){background:var(--accent-shade)!important}:host ::ng-deep .pop-select-list-checkbox-before .mat-pseudo-checkbox{margin-right:16px}:host ::ng-deep .pop-select-list-checkbox-before .mat-list-text{flex:1}:host ::ng-deep .pop-select-list-option-header .mat-checkbox-inner-container{width:16px!important;height:16px!important;margin:0 0 0 1px!important}:host ::ng-deep .pop-select-list-option-header .mat-checkbox-label{padding:0 10px 0 0}:host ::ng-deep .filter-selected .pop-input-container{background-color:var(--bg-3)!important}:host ::ng-deep .pop-input-container{margin:0!important}:host ::ng-deep .filter-option-selected .pop-input-container{background-color:var(--accent-shade)!important}:host ::ng-deep .mat-list-base{padding:0!important;margin:0!important;border:0!important}:host ::ng-deep .mat-list-text{display:block;text-overflow:ellipsis;white-space:nowrap;overflow:hidden;padding:0!important;padding-left:var(--gap-s)}"]
            },] }
];
PopSelectListComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: ChangeDetectorRef }
];
PopSelectListComponent.propDecorators = {
    config: [{ type: Input }],
    events: [{ type: Output }],
    selectionListRef: [{ type: ViewChild, args: ['selectionList', { static: true },] }],
    searchRef: [{ type: ViewChild, args: ['search',] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLXNlbGVjdC1saXN0LmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2Jhc2UvcG9wLWZpZWxkLWl0ZW0vcG9wLXNlbGVjdC1saXN0L3BvcC1zZWxlY3QtbGlzdC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFDTCxpQkFBaUIsRUFDakIsU0FBUyxFQUNULFVBQVUsRUFDVixZQUFZLEVBQ1osS0FBSyxFQUVMLE1BQU0sRUFDTixTQUFTLEdBQ1YsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLDBCQUEwQixDQUFDO0FBSXhELE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxpQ0FBaUMsQ0FBQztBQUU1RCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFVNUMsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sNkJBQTZCLENBQUM7QUFDbEUsT0FBTyxFQUNMLE9BQU8sRUFDUCxrQkFBa0IsRUFDbEIsU0FBUyxFQUNULFFBQVEsRUFDUixRQUFRLEVBQ1IsdUJBQXVCLEVBQ3hCLE1BQU0sZ0NBQWdDLENBQUM7QUFDeEMsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLG1DQUFtQyxDQUFDO0FBUS9ELE1BQU0sT0FBTyxzQkFBdUIsU0FBUSxxQkFBcUI7SUFnQy9ELFlBQ1MsRUFBYyxFQUNYLEdBQXNCO1FBQ2hDLEtBQUssRUFBRSxDQUFDO1FBRkQsT0FBRSxHQUFGLEVBQUUsQ0FBWTtRQUNYLFFBQUcsR0FBSCxHQUFHLENBQW1CO1FBOUJsQyw2RkFBNkY7UUFDbkYsV0FBTSxHQUF3QyxJQUFJLFlBQVksRUFBeUIsQ0FBQztRQU0zRixTQUFJLEdBQUcsd0JBQXdCLENBQUM7UUFHN0IsVUFBSyxHQUFHO1lBQ2hCLGVBQWUsRUFBaUMsU0FB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LENBQUMsQ0FBQztRQUNILElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFO1lBQzlCLEtBQUssTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFO2dCQUMxQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7b0JBQUUsU0FBUztnQkFDNUQsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUN6QztTQUNGO1FBQ0QsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJO1lBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDMUcsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDOzs7WUFua0JGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUscUJBQXFCO2dCQUMvQixvaU1BQStDOzthQUVoRDs7O1lBdkNDLFVBQVU7WUFGVixpQkFBaUI7OztxQkE0Q2hCLEtBQUs7cUJBR0wsTUFBTTsrQkFHTixTQUFTLFNBQUMsZUFBZSxFQUFFLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQzt3QkFDekMsU0FBUyxTQUFDLFFBQVEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBDaGFuZ2VEZXRlY3RvclJlZixcbiAgQ29tcG9uZW50LFxuICBFbGVtZW50UmVmLFxuICBFdmVudEVtaXR0ZXIsXG4gIElucHV0LCBPbkRlc3Ryb3ksXG4gIE9uSW5pdCxcbiAgT3V0cHV0LFxuICBWaWV3Q2hpbGQsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtTZWxlY3Rpb25Nb2RlbH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvbGxlY3Rpb25zJztcbmltcG9ydCB7TWF0TGlzdE9wdGlvbiwgTWF0U2VsZWN0aW9uTGlzdH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvbGlzdCc7XG5pbXBvcnQge09ic2VydmFibGV9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtTZWxlY3RMaXN0Q29uZmlnLCBTZWxlY3RMaXN0R3JvdXBJbnRlcmZhY2V9IGZyb20gJy4vc2VsZWN0LWxpc3QtY29uZmlnLm1vZGVsJztcbmltcG9ydCB7SW5wdXRDb25maWd9IGZyb20gJy4uL3BvcC1pbnB1dC9pbnB1dC1jb25maWcubW9kZWwnO1xuXG5pbXBvcnQge2RlYm91bmNlVGltZX0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHtTZWxlY3RGaWx0ZXJHcm91cEludGVyZmFjZX0gZnJvbSAnLi4vcG9wLXNlbGVjdC1maWx0ZXIvc2VsZWN0LWZpbHRlci1jb25maWcubW9kZWwnO1xuaW1wb3J0IHtcbiAgQ29yZUNvbmZpZyxcbiAgRW50aXR5LFxuICBGaWVsZEl0ZW1PcHRpb24sXG4gIEZpZWxkSXRlbVBhdGNoSW50ZXJmYWNlLFxuICBLZXlNYXAsXG4gIFBvcEJhc2VFdmVudEludGVyZmFjZVxufSBmcm9tICcuLi8uLi8uLi8uLi9wb3AtY29tbW9uLm1vZGVsJztcbmltcG9ydCB7UG9wRmllbGRJdGVtQ29tcG9uZW50fSBmcm9tICcuLi9wb3AtZmllbGQtaXRlbS5jb21wb25lbnQnO1xuaW1wb3J0IHtcbiAgSXNBcnJheSxcbiAgSXNDYWxsYWJsZUZ1bmN0aW9uLFxuICBJc0RlZmluZWQsXG4gIElzTnVtYmVyLFxuICBJc09iamVjdCxcbiAgT2JqZWN0Q29udGFpbnNUYWdTZWFyY2hcbn0gZnJvbSAnLi4vLi4vLi4vLi4vcG9wLWNvbW1vbi11dGlsaXR5JztcbmltcG9ydCB7U3dpdGNoQ29uZmlnfSBmcm9tICcuLi9wb3Atc3dpdGNoL3N3aXRjaC1jb25maWcubW9kZWwnO1xuXG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2xpYi1wb3Atc2VsZWN0LWxpc3QnLFxuICB0ZW1wbGF0ZVVybDogJy4vcG9wLXNlbGVjdC1saXN0LmNvbXBvbmVudC5odG1sJyxcbiAgc3R5bGVVcmxzOiBbJy4vcG9wLXNlbGVjdC1saXN0LmNvbXBvbmVudC5zY3NzJ10sXG59KVxuZXhwb3J0IGNsYXNzIFBvcFNlbGVjdExpc3RDb21wb25lbnQgZXh0ZW5kcyBQb3BGaWVsZEl0ZW1Db21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG4gIC8vIGNvbmZpZ3VyYXRpb24gZm9yIGNvbXBvbmVudFxuICBASW5wdXQoKSBjb25maWc6IFNlbGVjdExpc3RDb25maWc7XG5cbiAgLy8gZW1pdHRlZCBldmVyeSB0aW1lIHRoZXJlIGlzIGFuIG9wdGlvbiBzZWxlY3Rpb24sIHNlYXJjaCBmb2N1cywgb3IgdGhlIGZpbHRlciBvcHRpb25zIGNsb3NlXG4gIEBPdXRwdXQoKSBldmVudHM6IEV2ZW50RW1pdHRlcjxQb3BCYXNlRXZlbnRJbnRlcmZhY2U+ID0gbmV3IEV2ZW50RW1pdHRlcjxQb3BCYXNlRXZlbnRJbnRlcmZhY2U+KCk7XG5cbiAgLy8gR2V0dGluZyBhIHJlZmVyZW5jZSB0byB0aGUgc2VsZWN0aW9uIGxpc3QgaW4gdGhlIHZpZXcgc28gdGhhdCBJIGNhbiBrbm93IHdoaWNoIG9wdGlvbnMgYXJlIHNlbGVjdGVkXG4gIEBWaWV3Q2hpbGQoJ3NlbGVjdGlvbkxpc3QnLCB7c3RhdGljOiB0cnVlfSkgc2VsZWN0aW9uTGlzdFJlZjogTWF0U2VsZWN0aW9uTGlzdDtcbiAgQFZpZXdDaGlsZCgnc2VhcmNoJykgc2VhcmNoUmVmOiBFbGVtZW50UmVmO1xuXG4gIHB1YmxpYyBuYW1lID0gJ1BvcFNlbGVjdExpc3RDb21wb25lbnQnO1xuXG5cbiAgcHJvdGVjdGVkIGFzc2V0ID0ge1xuICAgIGZpbHRlcmVkT3B0aW9uczogPE9ic2VydmFibGU8RmllbGRJdGVtT3B0aW9uW10+PnVuZGVmaW5lZCxcbiAgICBncm91cHM6IFtdLFxuICAgIG9uRm9jdXNWYWx1ZTogdW5kZWZpbmVkLFxuICAgIGZpbHRlckFjdGl2YXRlZDogZmFsc2UsXG4gICAgZGlzYWJsZWQ6IDxLZXlNYXA8Ym9vbGVhbj4+e31cbiAgfTtcblxuICBwdWJsaWMgdWkgPSB7XG4gICAgc2VhcmNoOiB7XG4gICAgICBjb25maWc6IHVuZGVmaW5lZCxcbiAgICB9LFxuICAgIGFsbDoge1xuICAgICAgb3ZlcmxheTogdW5kZWZpbmVkLFxuICAgIH1cbiAgfTtcblxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBlbDogRWxlbWVudFJlZixcbiAgICBwcm90ZWN0ZWQgY2RyOiBDaGFuZ2VEZXRlY3RvclJlZikge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLmRvbS5jb25maWd1cmUgPSAoKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcblxuICAgICAgICB0aGlzLl9zZXRJbml0aWFsRG9tU3RhdGUoKTtcbiAgICAgICAgdGhpcy5fc2V0VXBGaWx0ZXJPYnNlcnZhYmxlKCk7XG4gICAgICAgIHRoaXMuX3NldExpc3RQb3NpdGlvbigpO1xuICAgICAgICB0aGlzLl9maWx0ZXJPcHRpb25MaXN0KCcnKTtcbiAgICAgICAgdGhpcy5fc2V0Q29uZmlnSG9va3MoKTtcblxuICAgICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICB0aGlzLmRvbS5wcm9jZWVkID0gKCk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG5cbiAgICAgICAgdGhpcy5fc2V0SW5pdGlhbFZhbHVlKCk7XG5cbiAgICAgICAgcmV0dXJuIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gIH1cblxuXG4gIG5nT25Jbml0KCk6IHZvaWQge1xuICAgIHN1cGVyLm5nT25Jbml0KCk7XG4gIH1cblxuXG4gIHRyaWdnZXJPbkNoYW5nZSh3YWl0ID0gMTAwMCkge1xuICAgIHRoaXMuZG9tLnNldFRpbWVvdXQoJ2FwaS1mZXRjaCcsICgpID0+IHtcbiAgICAgIHRoaXMub25DaGFuZ2UoKTtcbiAgICB9LCB3YWl0KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIENoZWNrcy9VbmNoZWNrcyBhbGwgb2YgdGhlIGZpbHRlcmVkIG9wdGlvbnMgd2l0aGluIGEgc3BlY2lmaWMgZ3JvdXBcbiAgICogQHBhcmFtICBGaWVsZE9wdGlvbiBvcHRpb25cbiAgICogQHJldHVybnMgYm9vbGVhblxuICAgKi9cbiAgb25Hcm91cENoYW5nZShjaGVja2VkOiBib29sZWFuLCBncm91cCk6IGJvb2xlYW4ge1xuICAgIGlmICghdGhpcy5jb25maWcubXVsdGlwbGUpIHJldHVybiBmYWxzZTtcbiAgICBpZiAoIWNoZWNrZWQpIHRoaXMuY29uZmlnLmFsbCA9IGZhbHNlO1xuICAgIGdyb3VwLm9wdGlvbnMudmFsdWVzLm1hcCgob3B0aW9uOiBGaWVsZEl0ZW1PcHRpb24pID0+IHtcbiAgICAgIGlmICghb3B0aW9uLmhpZGRlbikgb3B0aW9uLnNlbGVjdGVkID0gY2hlY2tlZDtcbiAgICB9KTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMuX2NoZWNrR3JvdXBTdGF0ZShjaGVja2VkLCBncm91cCk7XG4gICAgICB0aGlzLl91cGRhdGVTZWxlY3RlZE9wdGlvbnMoKTtcbiAgICAgIHRoaXMub25CdWJibGVFdmVudCgnZ3JvdXBBbGxDaGFuZ2UnLCAnR3JvdXAgQ2hhbmdlJywge2RhdGE6IGdyb3VwfSk7XG4gICAgICB0aGlzLm9uQnViYmxlRXZlbnQoJ2dyb3VwQ2hhbmdlJywgJ0dyb3VwIENoYW5nZScsIHtkYXRhOiBncm91cH0pO1xuICAgIH0sIDApO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIENoZWNrcy9VbmNoZWNrcyBhbGwgb2YgdGhlIGZpbHRlcmVkIG9wdGlvbnMgd2l0aGluIGEgc3BlY2lmaWMgZ3JvdXBcbiAgICogQHBhcmFtICBGaWVsZE9wdGlvbiBvcHRpb25cbiAgICogQHJldHVybnMgYm9vbGVhblxuICAgKi9cbiAgb25BbGxDaGFuZ2UoY2hlY2tlZDogYm9vbGVhbik6IGJvb2xlYW4ge1xuICAgIGlmICghdGhpcy5jb25maWcubXVsdGlwbGUpIHJldHVybiBmYWxzZTtcbiAgICB0aGlzLmNvbmZpZy5ncm91cHMubWFwKChncm91cCkgPT4ge1xuICAgICAgZ3JvdXAub3B0aW9ucy52YWx1ZXMubWFwKChvcHRpb246IEZpZWxkSXRlbU9wdGlvbikgPT4ge1xuICAgICAgICBvcHRpb24uc2VsZWN0ZWQgPSBjaGVja2VkO1xuICAgICAgfSk7XG4gICAgICBncm91cC5hbGwgPSBjaGVja2VkO1xuICAgICAgZ3JvdXAuaW5kZXRlcm1pbmF0ZSA9IGZhbHNlO1xuICAgIH0pO1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5fdXBkYXRlU2VsZWN0ZWRPcHRpb25zKCk7XG4gICAgfSwgMCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEFsbG93IHRoZSB1c2VyIHRvIGNsZWFyIHRoZSBzZWFyY2ggdGV4dFxuICAgKi9cbiAgb25DbGVhclNlYXJjaCgpOiB2b2lkIHtcbiAgICB0aGlzLnVpLnNlYXJjaC5jb25maWcuY29udHJvbC5zZXRWYWx1ZSgnJyk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBVcGRhdGUncyB0aGUgbGlzdCBvZiBzZWxlY3RlZCBvcHRpb25zIGluc2lkZSBvZiB0aGUgY29uZmlnXG4gICAqIGFuZCBlbWl0cyBhIGNoYW5nZSBldmVudC4gVGhpcyBtZXRob2Qgd2lsbCBiZSBjYWxsZWQgYnkgdGhlIHZpZXdcbiAgICogd2hlbmV2ZXIgYW4gb3B0aW9uIGlzIHNlbGVjdGVkXG4gICAqIEBwYXJhbSBNYXRTZWxlY3Rpb25MaXN0Q2hhbmdlIGV2ZW50XG4gICAqIEByZXR1cm5zIHZvaWRcbiAgICovXG4gIG9uT3B0aW9uQ2hhbmdlKGV2ZW50LCBvcHRpb24sIGdyb3VwKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuY29uZmlnLm11bHRpcGxlKSB7XG4gICAgICAvLyBvcHRpb24uc2VsZWN0ZWQgPSBldmVudC50YXJnZXQuY2xhc3NOYW1lLnNlYXJjaCggJ21hdC1wc2V1ZG8tY2hlY2tib3gtY2hlY2tlZCcgKSA+IC0xID8gdHJ1ZSA6IGZhbHNlO1xuICAgICAgb3B0aW9uLnNlbGVjdGVkID0gIW9wdGlvbi5zZWxlY3RlZDtcbiAgICAgIGlmICghb3B0aW9uLnNlbGVjdGVkKSB0aGlzLmNvbmZpZy5hbGwgPSBmYWxzZTtcbiAgICAgIHRoaXMuX2NoZWNrR3JvdXBTdGF0ZShvcHRpb24uc2VsZWN0ZWQsIGdyb3VwKTtcbiAgICAgIHRoaXMuX3VwZGF0ZVNlbGVjdGVkT3B0aW9ucygpO1xuXG4gICAgICB0aGlzLm9uQnViYmxlRXZlbnQoJ29wdGlvbkNoYW5nZScsICdPcHRpb24gQ2hhbmdlJywge2RhdGE6IG9wdGlvbn0pO1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMub25CdWJibGVFdmVudCgnZ3JvdXBDaGFuZ2UnLCAnR3JvdXAgQ2hhbmdlJywge2RhdGE6IGdyb3VwfSk7XG4gICAgICB9LCAwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5kb20uYWN0aXZlLm9wdGlvbklkID0gb3B0aW9uLnZhbHVlO1xuICAgICAgdGhpcy5jb25maWcuY29udHJvbC5zZXRWYWx1ZShvcHRpb24udmFsdWUpO1xuICAgICAgdGhpcy5jb25maWcuc3RyVmFsID0gb3B0aW9uLm5hbWU7XG4gICAgICB0aGlzLnRyaWdnZXJPbkNoYW5nZSgwKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQWRkIG9uIHRvIHNldCB0b2dnbGUgc3BlY2lhbCBjdXN0b20gcHJvcGVydHlcbiAgICogQHBhcmFtIGV2ZW50XG4gICAqIEBwYXJhbSBvcHRpb25cbiAgICovXG4gIG9uT3B0aW9uTW9kZUNoYW5nZShldmVudCwgb3B0aW9uKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuY29uZmlnLm11bHRpcGxlKSB7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5vbkJ1YmJsZUV2ZW50KCdvcHRpb25Nb2RlQ2hhbmdlJywgJ09wdGlvbiBNb2RlIENoYW5nZScsIHtkYXRhOiBvcHRpb259KTtcbiAgICAgIH0sIDApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBPbiBsaW5rIGNsaWNrIHN0dWJcbiAgICovXG4gIG9uTGlua0NsaWNrKCkge1xuICAgIGNvbnNvbGUubG9nKCdMSU5LIFNUVUI6IExpbmsgdG8gRW50aXR5JywgdGhpcy5jb25maWcuY29udHJvbC52YWx1ZSk7XG4gIH1cblxuICAvKipcbiAgICogQWxsb3cgdXNlciB0byBvcGVuIGNsb3NlIGEgZ3JvdXAgc2VjdGlvblxuICAgKiBAcGFyYW0gZ3JvdXBcbiAgICovXG4gIG9uVG9nZ2xlR3JvdXAoZ3JvdXA6IFNlbGVjdExpc3RHcm91cEludGVyZmFjZSkge1xuICAgIGlmICh0aGlzLmNvbmZpZy5ncm91cHMubGVuZ3RoID4gMSkge1xuICAgICAgZ3JvdXAub3BlbiA9ICFncm91cC5vcGVuO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB0aGUgZ2l2ZW4gb3B0aW9uIGlzIGluIHRoZSBsaXN0IG9mIHNlbGVjdGVkIG9wdGlvbnNcbiAgICogaW4gdGhlIGNvbmZpZy4gVXNlZCBieSB0aGUgdmlldyB0byBzZXQgdGhlIGNoZWNrYm94ZSdzIG9uIHRoZVxuICAgKiBpbml0aWFsIHN0YXRlIG9mIHRoZSBkcm9wZG93blxuICAgKiBAcGFyYW0gIEZpZWxkT3B0aW9uIG9wdGlvblxuICAgKiBAcmV0dXJucyBib29sZWFuXG4gICAqL1xuICBpc09wdGlvblNlbGVjdGVkKG9wdGlvbjogRmllbGRJdGVtT3B0aW9uKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIG9wdGlvbi5zZWxlY3RlZDtcbiAgfVxuXG5cbiAgaXNTZWFyY2hWYWx1ZSgpIHtcbiAgICBpZiAoSXNPYmplY3QodGhpcy51aS5zZWFyY2guY29uZmlnLCBbJ2NvbnRyb2wnXSkgJiYgdGhpcy51aS5zZWFyY2guY29uZmlnLmNvbnRyb2wudmFsdWUpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUZW1wbGF0ZSBsb2dpYyB0byBkZXRlcm1pbmUgaWYgYSBvcHRpb24gaXMgaGlkZGVuXG4gICAqIEBwYXJhbSBvcHRpb25cbiAgICovXG4gIGlzT3B0aW9uSGlkZGVuKGdyb3VwOiBTZWxlY3RMaXN0R3JvdXBJbnRlcmZhY2UsIG9wdGlvbjogRmllbGRJdGVtT3B0aW9uKTogYm9vbGVhbiB7XG4gICAgaWYgKCFncm91cC5vcGVuICYmICEodGhpcy5pc1NlYXJjaFZhbHVlKCkpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbi5oaWRkZW4pIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUZW1wbGF0ZSBsb2dpYyB0byBkZXRlcm1pbmUgaWYgYSBvcHRpb24gaXMgYWN0aXZlXG4gICAqIEBwYXJhbSBvcHRpb25cbiAgICovXG4gIGlzT3B0aW9uQWN0aXZlKG9wdGlvbjogRmllbGRJdGVtT3B0aW9uKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuZG9tLmFjdGl2ZS5vcHRpb25JZCAmJiBvcHRpb24udmFsdWUgPT09IHRoaXMuZG9tLmFjdGl2ZS5vcHRpb25JZDtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRlbXBsYXRlIGxvZ2ljIHRvIGRldGVybWluZSBpZiBhIG9wdGlvbiBpcyBkaXNhYmxlZFxuICAgKiBAcGFyYW0gb3B0aW9uXG4gICAqL1xuICBpc09wdGlvbkRpc2FibGVkKG9wdGlvbjogRmllbGRJdGVtT3B0aW9uKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuYXNzZXQuZGlzYWJsZWRbb3B0aW9uLnZhbHVlXTtcbiAgfVxuXG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgc3VwZXIubmdPbkRlc3Ryb3koKTtcbiAgfVxuXG5cbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBVbmRlciBUaGUgSG9vZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIFByaXZhdGUgTWV0aG9kICkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiAgcHJpdmF0ZSBfc2V0Q29uZmlnSG9va3MoKSB7XG4gICAgdGhpcy5jb25maWcudHJpZ2dlck9uQ2hhbmdlID0gKHZhbHVlOiBzdHJpbmcgfCBudW1iZXIgfCBudWxsKSA9PiB7XG4gICAgICB0aGlzLmNvbmZpZy5jb250cm9sLnNldFZhbHVlKHZhbHVlKTtcbiAgICAgIHRoaXMuY29uZmlnLmNvbnRyb2wubWFya0FzUHJpc3RpbmUoKTtcbiAgICAgIHRoaXMuY29uZmlnLm1lc3NhZ2UgPSAnJztcbiAgICAgIHRoaXMuY29uZmlnLmNvbnRyb2wudXBkYXRlVmFsdWVBbmRWYWxpZGl0eSgpO1xuICAgICAgdGhpcy5vbkNoYW5nZSgpO1xuICAgIH07XG5cblxuICAgIHRoaXMuY29uZmlnLmRpc2FibGVPcHRpb24gPSAob3B0aW9uSWQ6IG51bWJlcikgPT4ge1xuICAgICAgaWYgKElzRGVmaW5lZChvcHRpb25JZCkpIHtcbiAgICAgICAgdGhpcy5hc3NldC5kaXNhYmxlZFtvcHRpb25JZF0gPSB0cnVlO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLmNvbmZpZy5lbmFibGVPcHRpb24gPSAob3B0aW9uSWQ6IG51bWJlcikgPT4ge1xuICAgICAgaWYgKElzRGVmaW5lZChvcHRpb25JZCkpIHtcbiAgICAgICAgZGVsZXRlIHRoaXMuYXNzZXQuZGlzYWJsZWRbb3B0aW9uSWRdO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLmNvbmZpZy5zZXREaXNhYmxlZCA9IChvcHRpb25zSWRzOiBudW1iZXJbXSA9IG51bGwpID0+IHtcbiAgICAgIHRoaXMuZG9tLnNldFRpbWVvdXQoYHNldC1kaXNhYmxlZGAsICgpID0+IHtcbiAgICAgICAgdGhpcy5jb25maWcuZGlzYWJsZWRJZHMgPSBvcHRpb25zSWRzO1xuICAgICAgICB0aGlzLl9zZXREaXNhYmxlZElkcygpO1xuICAgICAgfSwgMCk7XG4gICAgfTtcblxuICAgIHRoaXMuY29uZmlnLmZvY3VzU2VhcmNoID0gKCkgPT4ge1xuICAgICAgdGhpcy5kb20uc2V0VGltZW91dChgc2VhcmNoLWZvY3VzYCwgKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5zZWFyY2hSZWYpIHtcbiAgICAgICAgICB0aGlzLnNlYXJjaFJlZi5uYXRpdmVFbGVtZW50LmZvY3VzKCk7XG4gICAgICAgICAgLy8gdGhpcy5vbkJ1YmJsZUV2ZW50KCAnZm9jdXMnICk7XG4gICAgICAgIH1cbiAgICAgIH0sIDIwMCk7XG4gICAgfTtcblxuICAgIHRoaXMuY29uZmlnLnNldEFjdGl2ZSA9IChvcHRpb25JZCkgPT4ge1xuICAgICAgdGhpcy5kb20uc2V0VGltZW91dChgc2V0LWRpc2FibGVkYCwgKCkgPT4ge1xuICAgICAgICBpZiAoK29wdGlvbklkKSB7XG4gICAgICAgICAgdGhpcy5kb20uYWN0aXZlLm9wdGlvbklkID0gb3B0aW9uSWQ7XG4gICAgICAgICAgZGVsZXRlIHRoaXMuYXNzZXQuZGlzYWJsZWRbb3B0aW9uSWRdO1xuICAgICAgICB9XG4gICAgICB9LCA1KTtcbiAgICB9O1xuXG4gICAgdGhpcy5jb25maWcuc2V0SGVpZ2h0ID0gKGhlaWdodDogbnVtYmVyKSA9PiB7XG4gICAgICB0aGlzLmRvbS5zZXRUaW1lb3V0KGBzZXQtaGVpZ2h0YCwgKCkgPT4ge1xuICAgICAgICBpZiAoK2hlaWdodCkge1xuICAgICAgICAgIHRoaXMuY29uZmlnLm1pbkhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgICB0aGlzLmNvbmZpZy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIH1cbiAgICAgIH0sIDUpO1xuICAgIH07XG5cbiAgICB0aGlzLmNvbmZpZy5jbGVhclNlbGVjdGVkID0gKCkgPT4ge1xuICAgICAgdGhpcy5kb20uc2V0VGltZW91dChgY2xlYXItc2VsZWN0ZWRgLCAoKSA9PiB7XG4gICAgICAgIHRoaXMub25BbGxDaGFuZ2UoZmFsc2UpO1xuICAgICAgfSwgMCk7XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIGluaXRhbCBkb20gc3RhdGUgb2YgdGhlIGNvbXBvbmVudFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcHJpdmF0ZSBfc2V0SW5pdGlhbERvbVN0YXRlKCkge1xuICAgIHRoaXMuZG9tLnN0YXRlLmhlbHBlciA9IGZhbHNlO1xuICAgIHRoaXMuZG9tLnN0YXRlLmZpbHRlciA9IDxib29sZWFuPnVuZGVmaW5lZDtcbiAgICB0aGlzLmRvbS5zdGF0ZS5hbGxPdmVybGF5RW5hYmxlZCA9IHRoaXMuY29uZmlnLmFsbE92ZXJsYXlFbmFibGVkID8gdHJ1ZSA6IGZhbHNlO1xuICAgIHRoaXMuZG9tLnN0YXRlLmZpbHRlckFjdGl2YXRlZCA9IGZhbHNlO1xuICAgIHRoaXMuZG9tLnN0YXRlLmFib3ZlID0gPG51bWJlcj51bmRlZmluZWQ7XG4gICAgdGhpcy5kb20uc3RhdGUuYmVsb3cgPSA8bnVtYmVyPnVuZGVmaW5lZDtcbiAgICB0aGlzLmRvbS5zdGF0ZS5saXN0ID0gPGFueT51bmRlZmluZWQ7XG4gICAgdGhpcy5hc3NldC5maWx0ZXJBY3RpdmF0ZWQgPSBmYWxzZTtcbiAgICB0aGlzLmRvbS5zdGF0ZS5jaGVja2JveFBvc2l0aW9uID0gdGhpcy5jb25maWcuY2hlY2tib3hQb3NpdGlvbiA9PT0gJ2xlZnQnID8gJ2JlZm9yZScgOiAnYWZ0ZXInO1xuXG5cbiAgICB0aGlzLnVpLnNlYXJjaC5jb25maWcgPSBuZXcgSW5wdXRDb25maWcoe1xuICAgICAgdmFsdWU6ICcnLFxuICAgICAgaGVscFRleHQ6IHRoaXMuY29uZmlnLmhlbHBUZXh0LFxuICAgICAgZGlzcGxheUVycm9yczogZmFsc2UsXG4gICAgICBsYWJlbDogdGhpcy5jb25maWcubGFiZWwsXG4gICAgICByZWFkb25seTogdHJ1ZSxcbiAgICAgIG1heGxlbmd0aDogMjU1XG4gICAgfSk7XG5cblxuICAgIHRoaXMudWkuYWxsLm92ZXJsYXkgPSB0aGlzLmNvbmZpZy5hbGxPdmVybGF5ID8gbmV3IFN3aXRjaENvbmZpZyh7XG4gICAgICB2YWx1ZTogdGhpcy5jb25maWcuYWxsT3ZlcmxheUVuYWJsZWQsXG4gICAgICBkaXNwbGF5RXJyb3JzOiBmYWxzZSxcbiAgICAgIGxhYmVsOiB0aGlzLmNvbmZpZy5hbGxPdmVybGF5TGFiZWwsXG4gICAgICBkaXNhYmxlZDp0aGlzLmNvbmZpZy5kaXNhYmxlZCxcbiAgICAgIGZhY2FkZTogdHJ1ZSxcbiAgICAgIGxhYmVsUG9zaXRpb246IHRoaXMuY29uZmlnLmNoZWNrYm94UG9zaXRpb24gPT09ICdhZnRlcicgPyAnYmVmb3JlJyA6ICdhZnRlcicsXG4gICAgICBwYXRjaDoge1xuICAgICAgICBwYXRoOiAnJyxcbiAgICAgICAgZmllbGQ6ICcnLFxuICAgICAgICBjYWxsYmFjazogKGNvcmU6IENvcmVDb25maWcsIGV2ZW50OiBQb3BCYXNlRXZlbnRJbnRlcmZhY2UpID0+IHtcbiAgICAgICAgICB0aGlzLmRvbS5zZXRUaW1lb3V0KGBvdmVybGF5LWNhbGxiYWNrYCwgYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5kb20uc3RhdGUuYWxsT3ZlcmxheUVuYWJsZWQgPSBldmVudC5jb25maWcuY29udHJvbC52YWx1ZSA9PT0gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChJc0NhbGxhYmxlRnVuY3Rpb24odGhpcy5jb25maWcuYWxsT3ZlcmxheUNhbGxiYWNrKSkge1xuICAgICAgICAgICAgICBhd2FpdCB0aGlzLmNvbmZpZy5hbGxPdmVybGF5Q2FsbGJhY2soY29yZSwgZXZlbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sIDApO1xuXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KSA6IG51bGw7XG5cblxuICAgIGlmICghdGhpcy5jb25maWcubXVsdGlwbGUpIHtcbiAgICAgIHRoaXMuc2VsZWN0aW9uTGlzdFJlZi5zZWxlY3RlZE9wdGlvbnMgPSBuZXcgU2VsZWN0aW9uTW9kZWw8TWF0TGlzdE9wdGlvbj4oZmFsc2UpO1xuICAgIH1cblxuICAgIHRoaXMuYXNzZXQub25Gb2N1c1ZhbHVlID0gSlNPTi5zdHJpbmdpZnkodGhpcy5jb25maWcuc2VsZWN0ZWRPcHRpb25zKTtcblxuICAgIHRoaXMuX3NldERpc2FibGVkSWRzKCk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIGxlYWQgbWFwcGluZyBvcHRpb25zIHRoYXQgYXJlIGRpc2FibGVkO1xuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcHJpdmF0ZSBfc2V0RGlzYWJsZWRJZHMoKSB7XG4gICAgdGhpcy5hc3NldC5kaXNhYmxlZCA9IHt9O1xuICAgIGlmIChJc0FycmF5KHRoaXMuY29uZmlnLmRpc2FibGVkSWRzKSkge1xuICAgICAgdGhpcy5jb25maWcuZGlzYWJsZWRJZHMubWFwKChvcHRpb25JZDogbnVtYmVyKSA9PiB7XG4gICAgICAgIGlmIChJc051bWJlcihvcHRpb25JZCkpIHtcbiAgICAgICAgICB0aGlzLmFzc2V0LmRpc2FibGVkW29wdGlvbklkXSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG5cbiAgcHJpdmF0ZSBfc2V0SW5pdGlhbFZhbHVlKCkge1xuICAgIGlmICghdGhpcy5jb25maWcubXVsdGlwbGUgJiYgIXRoaXMuZG9tLmFjdGl2ZS5vcHRpb25JZCkge1xuICAgICAgaWYgKElzRGVmaW5lZCh0aGlzLmNvbmZpZy52YWx1ZSwgZmFsc2UpKSB7XG4gICAgICAgIHRoaXMuZG9tLmFjdGl2ZS5vcHRpb25JZCA9IHRoaXMuY29uZmlnLnZhbHVlO1xuICAgICAgICBpZiAoIShJc0RlZmluZWQodGhpcy5jb25maWcuY29udHJvbC52YWx1ZSwgZmFsc2UpKSkge1xuICAgICAgICAgIHRoaXMuY29uZmlnLmNvbnRyb2wuc2V0VmFsdWUodGhpcy5jb25maWcudmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghKElzQXJyYXkodGhpcy5jb25maWcuY29udHJvbC52YWx1ZSkpKSB7XG4gICAgICAgIHRoaXMuY29uZmlnLmNvbnRyb2wuc2V0VmFsdWUoW10pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIE9ic2VydmVzIHRoZSB2YWx1ZSBjaGFuZ2VzIHRvIHRoZSBzZWFyY2ggYW5kIHRyaWdnZXJzIHRoZSBmaWx0ZXIgb2YgdGhlIG9wdGlvbnNcbiAgICogQHJldHVybnMgdm9pZFxuICAgKi9cbiAgcHJpdmF0ZSBfc2V0VXBGaWx0ZXJPYnNlcnZhYmxlKCk6IHZvaWQge1xuICAgIHRoaXMudWkuc2VhcmNoLmNvbmZpZy5jb250cm9sLnZhbHVlQ2hhbmdlc1xuICAgICAgLnBpcGUoXG4gICAgICAgIGRlYm91bmNlVGltZSgyMDApXG4gICAgICApLnN1YnNjcmliZSgodmFsdWU6IHN0cmluZykgPT4ge1xuICAgICAgdGhpcy5fZmlsdGVyT3B0aW9uTGlzdCh2YWx1ZSk7XG4gICAgfSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBEZXRlY3RzIGlmIHRoZSBsaXN0IG9mIG9wdGlvbnMgc2hvdWxkIGFwcGVhciBhYm92ZSBvciBiZWxvdyB0aGUgc2VsZWN0IGlucHV0XG4gICAqIEBwYXJhbSBoZWlnaHRcbiAgICovXG4gIHByaXZhdGUgX3NldExpc3RQb3NpdGlvbigpOiB2b2lkIHtcbiAgICAvLyB0aGlzLmNvbmZpZy5taW5IZWlnaHQgPSB0aGlzLmNvbmZpZy5taW5IZWlnaHQ7XG4gICAgLy8gdGhpcy5jb25maWcubWluSGVpZ2h0ID0gMjAwO1xuICAgIC8vIHRoaXMuY29uZmlnLmhlaWdodCA9IHRoaXMuY29uZmlnLmRlZmF1bHRIZWlnaHQ7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBEZXRlY3RzIHdoZXJlIHRoZSBjaGVjayBhbGwgIGJveCBmb3IgYSBncm91cCBzaG91bGQgYmUgdW5jaGVja2VkLCBjaGVja2VkLCBvciBpbmRldGVybWluYXRlXG4gICAqIEBwYXJhbSBjaGVja2VkXG4gICAqIEBwYXJhbSBncm91cFxuICAgKi9cbiAgcHJpdmF0ZSBfY2hlY2tHcm91cFN0YXRlKGNoZWNrZWQ6IGJvb2xlYW4sIGdyb3VwKTogdm9pZCB7XG4gICAgbGV0IGluZGV0ZXJtaW5hdGUgPSBmYWxzZTtcbiAgICBsZXQgYWxsID0gdHJ1ZTtcbiAgICBpZiAoIWNoZWNrZWQpIHtcbiAgICAgIGFsbCA9IGZhbHNlO1xuICAgICAgZ3JvdXAub3B0aW9ucy52YWx1ZXMuc29tZSgob3B0aW9uKSA9PiB7XG4gICAgICAgIGlmICghb3B0aW9uLmhpZGRlbiAmJiBvcHRpb24uc2VsZWN0ZWQpIHtcbiAgICAgICAgICBpbmRldGVybWluYXRlID0gdHJ1ZTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGdyb3VwLm9wdGlvbnMudmFsdWVzLnNvbWUob3B0aW9uID0+IHtcbiAgICAgICAgaWYgKCFvcHRpb24uaGlkZGVuICYmICFvcHRpb24uc2VsZWN0ZWQpIHtcbiAgICAgICAgICBhbGwgPSBmYWxzZTtcbiAgICAgICAgICBpbmRldGVybWluYXRlID0gdHJ1ZTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIGdyb3VwLmFsbCA9IGFsbDtcbiAgICBncm91cC5pbmRldGVybWluYXRlID0gaW5kZXRlcm1pbmF0ZTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEZpbmRzIG9ubHkgdGhlIG9wdGlvbnMgZnJvbSB0aGUgY29uZmlnJ3Mgb3B0aW9ucyB0aGF0IG1hdGNoXG4gICAqIHRoZSBzdHJpbmcgcGFzc2VkIGluLCBhbmQgcmV0dXJucyB0aG9zZSBvcHRpb25zLlxuICAgKiBVc2VkIGFzIHRoZSBmaWx0ZXIgd2hlbiBzZXR0aW5nIHVwIHRoZSBmaWx0ZXJlZE9wdGlvbnMgb2JzZXJ2YWJsZVxuICAgKiBAcGFyYW0gc3RyaW5nIHZhbHVlXG4gICAqIEByZXR1cm5zIEZpZWxkSXRlbU9wdGlvblxuICAgKi9cbiAgcHJpdmF0ZSBfZmlsdGVyT3B0aW9uTGlzdChzZWFyY2g6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuY29uZmlnLmdyb3Vwcy5tYXAoKGdyb3VwOiBTZWxlY3RMaXN0R3JvdXBJbnRlcmZhY2UpID0+IHtcbiAgICAgIGdyb3VwLm9wdGlvbnMudmFsdWVzLm1hcCgob3B0aW9uKSA9PiB7XG4gICAgICAgIG9wdGlvbi5oaWRkZW4gPSBPYmplY3RDb250YWluc1RhZ1NlYXJjaChvcHRpb24sIHNlYXJjaCkgPyBmYWxzZSA6IHRydWU7XG4gICAgICB9KTtcbiAgICAgIGdyb3VwLnNlbGVjdGVkID0gZ3JvdXAub3B0aW9ucy52YWx1ZXMuZmlsdGVyKChvcHRpb24pID0+IHtcbiAgICAgICAgcmV0dXJuICFvcHRpb24uaGlkZGVuICYmIG9wdGlvbi5zZWxlY3RlZDtcbiAgICAgIH0pLmxlbmd0aDtcblxuICAgICAgZ3JvdXAudmlzaWJsZSA9IGdyb3VwLm9wdGlvbnMudmFsdWVzLmZpbHRlcigob3B0aW9uKSA9PiB7XG4gICAgICAgIHJldHVybiAhb3B0aW9uLmhpZGRlbjtcbiAgICAgIH0pLmxlbmd0aDtcblxuICAgICAgY29uc3QgY2hlY2tlZCA9IGdyb3VwLnZpc2libGUgPT09IGdyb3VwLnNlbGVjdGVkO1xuICAgICAgdGhpcy5fY2hlY2tHcm91cFN0YXRlKGNoZWNrZWQsIGdyb3VwKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIHRoaXMuY2RyLmRldGVjdENoYW5nZXMoKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFVwZGF0ZSdzIHRoZSBzZWxlY3Rpb24gb3B0aW9ucyBpbiBjb25maWdcbiAgICogYnkgbG9vcGluZyB0aHJvdWdoIGFsbCBvZiB0aGUgY3VycmVudGx5IHNlbGVjdGVkIGl0ZW1zXG4gICAqIGluIHRoZSBzZWxlY3Rpb25MaXN0UmVmLlxuICAgKiBAcGFyYW0gbnVtYmVyIGlkXG4gICAqL1xuICBwcml2YXRlIF91cGRhdGVTZWxlY3RlZE9wdGlvbnMoKSB7XG4gICAgdGhpcy5kb20uc2V0VGltZW91dCgndXBkYXRlLXNlbGVjdGVkLW9wdGlvbnMnLCAoKSA9PiB7XG4gICAgICBjb25zdCBzZWxlY3RlZCA9IHRoaXMuc2VsZWN0aW9uTGlzdFJlZi5zZWxlY3RlZE9wdGlvbnMuc2VsZWN0ZWQ7XG4gICAgICBsZXQgc3RyOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgICB0aGlzLmNvbmZpZy5zZWxlY3RlZE9wdGlvbnMgPSBbXTtcbiAgICAgIGZvciAoY29uc3Qgb3B0aW9uIG9mIHNlbGVjdGVkKSB7XG4gICAgICAgIHN0ci5wdXNoKG9wdGlvbi5fdGV4dC5uYXRpdmVFbGVtZW50LmlubmVyVGV4dCk7XG4gICAgICAgIHRoaXMuY29uZmlnLnNlbGVjdGVkT3B0aW9ucy5wdXNoKG9wdGlvbi52YWx1ZSk7XG4gICAgICB9XG4gICAgICB0aGlzLmNvbmZpZy5jb250cm9sLnNldFZhbHVlKHRoaXMuY29uZmlnLnNlbGVjdGVkT3B0aW9ucy5zbGljZSgpKTtcbiAgICAgIHN0ciA9IHN0ci5zb3J0KCk7XG4gICAgICB0aGlzLmNvbmZpZy5zdHJWYWwgPSBzdHIuam9pbignLCAnKTtcbiAgICAgIHRoaXMudHJpZ2dlck9uQ2hhbmdlKCk7XG4gICAgfSwgNTApO1xuICB9XG5cblxuICAvKipcbiAgICogU2V0IHVwIHRoZSBib2R5IG9mIHRoZSBhcGkgcGF0Y2hcbiAgICogQHBhcmFtIHZhbHVlXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBwcm90ZWN0ZWQgX2dldFBhdGNoQm9keSh2YWx1ZT86IG51bWJlciB8IHN0cmluZyB8IGJvb2xlYW4gfCBudWxsIHwgT2JqZWN0KTogRW50aXR5IHtcbiAgICBjb25zdCBwYXRjaCA9IDxGaWVsZEl0ZW1QYXRjaEludGVyZmFjZT50aGlzLmNvbmZpZy5wYXRjaDtcbiAgICBjb25zdCBib2R5ID0gPEVudGl0eT57fTtcbiAgICBpZiAodGhpcy5jb25maWcuYWxsKSB7XG4gICAgICBpZiAodHlwZW9mIHRoaXMuY29uZmlnLmFsbFZhbHVlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBib2R5W3RoaXMuY29uZmlnLnBhdGNoLmZpZWxkXSA9IHRoaXMuY29uZmlnLmFsbFZhbHVlO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLmNvbmZpZy5wYXRjaEdyb3VwRmspIHtcbiAgICAgICAgYm9keVt0aGlzLmNvbmZpZy5wYXRjaC5maWVsZF0gPSBbXTtcbiAgICAgICAgdGhpcy5jb25maWcuZ3JvdXBzLm1hcCgoZ3JvdXA6IFNlbGVjdEZpbHRlckdyb3VwSW50ZXJmYWNlKSA9PiB7XG4gICAgICAgICAgYm9keVt0aGlzLmNvbmZpZy5wYXRjaC5maWVsZF0ucHVzaChgMDoke2dyb3VwLmdyb3VwRmt9YCk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYm9keVt0aGlzLmNvbmZpZy5wYXRjaC5maWVsZF0gPSB0aGlzLmNvbmZpZy5zZWxlY3RlZE9wdGlvbnMubGVuZ3RoID8gdGhpcy5jb25maWcuc2VsZWN0ZWRPcHRpb25zIDogW107XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLmNvbmZpZy5tdWx0aXBsZSkge1xuICAgICAgICBpZiAoIXRoaXMuY29uZmlnLmNvbnRyb2wudmFsdWUubGVuZ3RoICYmIHR5cGVvZiB0aGlzLmNvbmZpZy5lbXB0eVZhbHVlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIGJvZHlbdGhpcy5jb25maWcucGF0Y2guZmllbGRdID0gdGhpcy5jb25maWcuZW1wdHlWYWx1ZTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmNvbmZpZy5wYXRjaEdyb3VwRmspIHtcbiAgICAgICAgICBib2R5W3RoaXMuY29uZmlnLnBhdGNoLmZpZWxkXSA9IFtdO1xuICAgICAgICAgIHRoaXMuY29uZmlnLmdyb3Vwcy5tYXAoKGdyb3VwOiBTZWxlY3RGaWx0ZXJHcm91cEludGVyZmFjZSkgPT4ge1xuICAgICAgICAgICAgaWYgKGdyb3VwLmFsbCkge1xuICAgICAgICAgICAgICBib2R5W3RoaXMuY29uZmlnLnBhdGNoLmZpZWxkXS5wdXNoKGAwOiR7Z3JvdXAuZ3JvdXBGa31gKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGdyb3VwLm9wdGlvbnMudmFsdWVzLmZpbHRlcigob3B0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbi5zZWxlY3RlZDtcbiAgICAgICAgICAgICAgfSkubWFwKChvcHRpb24pID0+IHtcbiAgICAgICAgICAgICAgICBib2R5W3RoaXMuY29uZmlnLnBhdGNoLmZpZWxkXS5wdXNoKGAke29wdGlvbi52YWx1ZX06JHtncm91cC5ncm91cEZrfWApO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBib2R5W3RoaXMuY29uZmlnLnBhdGNoLmZpZWxkXSA9IHRoaXMuY29uZmlnLmNvbnRyb2wudmFsdWUubGVuZ3RoID8gdGhpcy5jb25maWcuY29udHJvbC52YWx1ZSA6IFtdO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWx1ZSA9IHR5cGVvZiB2YWx1ZSAhPT0gJ3VuZGVmaW5lZCcgPyB2YWx1ZSA6IHRoaXMuY29uZmlnLmNvbnRyb2wudmFsdWU7XG4gICAgICAgIGJvZHlbdGhpcy5jb25maWcucGF0Y2guZmllbGRdID0gdmFsdWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChwYXRjaCAmJiBwYXRjaC5tZXRhZGF0YSkge1xuICAgICAgICBmb3IgKGNvbnN0IGkgaW4gcGF0Y2gubWV0YWRhdGEpIHtcbiAgICAgICAgICBpZiAoIXBhdGNoLm1ldGFkYXRhLmhhc093blByb3BlcnR5KGkpKSBjb250aW51ZTtcbiAgICAgICAgICBib2R5W2ldID0gcGF0Y2gubWV0YWRhdGFbaV07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgIH1cblxuXG4gICAgaWYgKElzQXJyYXkoYm9keVt0aGlzLmNvbmZpZy5wYXRjaC5maWVsZF0sIHRydWUpKSBib2R5W3RoaXMuY29uZmlnLnBhdGNoLmZpZWxkXS5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICByZXR1cm4gYSAtIGI7XG4gICAgfSk7XG4gICAgaWYgKHRoaXMuY29uZmlnLnBhdGNoLm1ldGFkYXRhKSB7XG4gICAgICBmb3IgKGNvbnN0IGkgaW4gdGhpcy5jb25maWcucGF0Y2gubWV0YWRhdGEpIHtcbiAgICAgICAgaWYgKCF0aGlzLmNvbmZpZy5wYXRjaC5tZXRhZGF0YS5oYXNPd25Qcm9wZXJ0eShpKSkgY29udGludWU7XG4gICAgICAgIGJvZHlbaV0gPSB0aGlzLmNvbmZpZy5wYXRjaC5tZXRhZGF0YVtpXTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRoaXMuY29uZmlnLnBhdGNoLmpzb24pIGJvZHlbdGhpcy5jb25maWcucGF0Y2guZmllbGRdID0gSlNPTi5zdHJpbmdpZnkoYm9keVt0aGlzLmNvbmZpZy5wYXRjaC5maWVsZF0pO1xuICAgIHJldHVybiBib2R5O1xuICB9XG59XG4iXX0=