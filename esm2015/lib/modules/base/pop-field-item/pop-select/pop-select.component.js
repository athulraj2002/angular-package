import { __awaiter } from "tslib";
import { Component, ElementRef, Input } from '@angular/core';
import { SelectConfig } from './select-config.model';
import { PopFieldItemComponent } from '../pop-field-item.component';
import { InputConfig } from '../pop-input/input-config.model';
import { IsCallableFunction, IsObject, IsObjectThrowError } from '../../../../pop-common-utility';
export class PopSelectComponent extends PopFieldItemComponent {
    constructor(el) {
        super();
        this.el = el;
        this.config = new SelectConfig();
        this.name = 'PopSelectComponent';
        this.optionsTopPos = '-5px';
        this.ui = { selected: { config: undefined } };
        this.dom.configure = () => {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                yield Promise.all([
                    this._setInitialConfig(),
                    this._setConfigHooks(),
                    this._initialFauxControl()
                ]);
                resolve(true);
            }));
        };
        this.dom.proceed = () => {
            return new Promise((resolve) => {
                this.dom.setTimeout('check-existing-value', () => {
                    if (!this.config.control.value && this.config.autoFill && this.config.required) {
                        if (this.config.options.values.length === 1) {
                            if (IsCallableFunction(this.config.triggerOnChange)) {
                                const existingValue = this.config.options.values[0].value;
                                this.config.triggerOnChange(existingValue);
                            }
                        }
                    }
                }, 0);
                resolve(true);
            });
        };
    }
    ngOnInit() {
        super.ngOnInit();
    }
    /**
     * SelectsOption
     * @param optionValue: option value selected
     */
    onOptionSelected(optionValue) {
        this.config.control.setValue(optionValue);
        this.dom.state.displayItems = false;
        this.ui.selected.config.label = this.config.label;
        this.onBlur();
    }
    /**
     *  Select Box clicked
     *  @returns void
     */
    onSelectionClick($event) {
        if (!this.config.readonly && this.config.control.status !== 'DISABLED') {
            // determine display direction and top offset
            const thirdHeight = window.innerHeight / 3;
            if ($event.clientY < (thirdHeight * 2)) {
                this.dom.state.displayBottom = true;
                this.optionsTopPos = '-5px';
                this.ui.selected.config.selectModeOptionsDirection = 'down';
            }
            else {
                this.dom.state.displayBottom = false;
                let offset = (44 + (this.config.options.values.length * 48));
                offset = offset > 284 ? 284 : offset;
                this.optionsTopPos = `-${offset}px`;
                this.ui.selected.config.label = ' ';
                this.ui.selected.config.selectModeOptionsDirection = 'up';
            }
            if (this.dom.state.displayItems) {
                this.dom.state.displayItems = false;
                this.ui.selected.config.label = this.config.label;
                this.onBlur();
            }
            else {
                this.dom.state.displayItems = true;
                this.onFocus();
            }
        }
    }
    /**
     * Closes the dropdown if it is active.
     * This method is called from the ClickOutside directive.
     * If the user clicks outside of the component, it will close
     * @returns void
     */
    onOutsideCLick() {
        this.dom.state.displayItems = false;
        this.ui.selected.config.label = this.config.label;
    }
    /**
     * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
     */
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
     * Set the initial config for this component
     * @private
     */
    _setInitialConfig() {
        return new Promise((resolve) => {
            this.dom.state.displayItems = false;
            this.dom.state.displayBottom = true;
            this.config = IsObjectThrowError(this.config, true, `Config required`) ? this.config : null;
            this.id = this.config.name;
            return resolve(true);
        });
    }
    /**
     * Set the config hooks for this component
     * @private
     */
    _setConfigHooks() {
        return new Promise((resolve) => {
            this.config.triggerOnChange = (value) => {
                this.dom.setTimeout(`config-trigger-change`, () => {
                    // this.cdr.detectChanges();
                    this._setStrVal(value);
                    this.onChange(value, true);
                }, 0);
            };
            this.config.clearMessage = () => {
                this.dom.setTimeout(`config-clear-message`, () => {
                    this.config.message = '';
                    this.config.control.markAsPristine();
                    this.config.control.markAsUntouched();
                    // this.cdr.detectChanges();
                }, 0);
            };
            return resolve(true);
        });
    }
    /**
     * Initialize Faux control ( used to display string value of select ). Subscribes to actual control value changes to update value.
     */
    _initialFauxControl() {
        return new Promise((resolve) => {
            this.ui.selected.config = new InputConfig({
                value: '',
                disabled: this.config.disabled ? this.config.disabled : null,
                helpText: this.config.helpText,
                displayErrors: false,
                label: this.config.label,
                readonly: true,
                selectMode: true,
                minimal: this.config.minimal,
                maxlength: 65000
            });
            this._setStrVal(this.config.value);
            this.dom.setSubscriber(`value-changes`, this.config.control.valueChanges.subscribe((value) => {
                this._setStrVal(value);
            }));
            this.dom.setSubscriber(`status-changes`, this.config.control.statusChanges.subscribe((status) => {
                this.ui.selected.config.control.status = status;
            }));
            return resolve(true);
        });
    }
    _setStrVal(value) {
        if (value || value == '') { // code change by chetu developer on 16-05-2021
            const selected = this.config.options.values.find((o) => o.value === value);
            if (IsObject(selected, ['name'])) {
                this.ui.selected.config.control.setValue(selected.name);
            }
            else {
                this.ui.selected.config.control.setValue('');
            }
        }
        else {
            this.ui.selected.config.control.setValue(null);
        }
    }
}
PopSelectComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-select',
                template: "<div class=\"import-field-item-container pop-select-container pop-select-mode-{{this.config.mode}} \"\n  [ngClass]=\"{'pop-select-container-minimal': this.config.minimal, 'pop-select-readonly': this.config.readonly, 'pop-select-opened-top': (dom.state.displayItems && !dom.state.displayBottom), 'pop-select-opened-bottom': (dom.state.displayItems && dom.state.displayBottom)}\"\n  (libClickOutside)=\"onOutsideCLick();\"\n>\n\n  <lib-pop-input\n    (click)=\"onSelectionClick($event)\"\n    class=\"pop-select-faux\"\n    *ngIf=\"ui?.selected?.config\"\n    [config]=ui?.selected?.config\n    >\n  </lib-pop-input>\n\n<!--  <mat-form-field appearance=\"outline\" class=\"pop-select-container-expansion\" [title]=\"config?.tooltip\" (click)=\"selectClick()\">-->\n<!--    <mat-label *ngIf=\"config.label\">{{config.label}}</mat-label>-->\n<!--&lt;!&ndash;    <div *ngIf=\"config.tooltip && config.showTooltip\" class=\"pop-select-tooltip-msg\" [innerHTML]=config.tooltip></div>&ndash;&gt;-->\n<!--    <mat-select anelClass=\"item-box\"-->\n<!--      [formControl]=\"config?.control\"-->\n<!--      (openedChange)=\"onOpenChange($event);\">-->\n<!--&lt;!&ndash;      <div class=\"item-box\"><mat-option class=\"items\"  *ngFor=\"let option of config.options.values\" [value]=\"option.value\">{{option.name}}</mat-option></div>&ndash;&gt;-->\n<!--    </mat-select>-->\n\n<!--    <div class=\"pop-select-feedback\" matSuffix *ngIf=\"!config.minimal\">-->\n<!--      <lib-pop-field-item-error class=\"pop-select-error\" [hidden]=\"!config.message\" [message]=\"config.message\"></lib-pop-field-item-error>-->\n<!--    </div>-->\n<!--    <lib-pop-field-item-helper class=\"pop-select-helper\" [helpText]=config.helpText></lib-pop-field-item-helper>-->\n<!--  </mat-form-field>-->\n  <!--<a *ngIf=\"config.route && config.control.value\" class=\"sw-pop-icon pop-select-goto-icon sw-pointer\" (click)=\"link(); $event.stopPropagation();\">M</a>-->\n\n  <lib-pop-field-item-loader [show]=\"config?.patch.displayIndicator && config?.patch.running\"></lib-pop-field-item-loader>\n  <div [style.maxHeight.px]=\"config.height\" [ngClass]=\"{'pop-select-items-box-bottom' : dom.state.displayBottom, 'pop-select-items-box-top': !dom.state.displayBottom}\" *ngIf=\"dom.state.displayItems\" [style.top]=\"optionsTopPos\">\n    <div class=\"pop-select-items\" *ngFor=\"let option of config?.options.values\" (click)=\"onOptionSelected(option.value)\"\n         [ngClass]=\"{'pop-select-level-1': option.level === 1, 'pop-select-level-2': option.level === 2}\">{{option.name}}</div>\n  </div>\n</div>\n\n",
                styles: [".pop-select-opened-top{box-shadow:-1px -4px 5px 0 rgba(0,0,0,.14),0 -5px 0 0 rgba(0,0,0,.12),1px -1px 4px -1px rgba(0,0,0,.2)}.pop-select-opened-bottom{box-shadow:0 4px 5px 0 rgba(0,0,0,.14),0 1px 0 0 rgba(0,0,0,.12),0 2px 4px -1px rgba(0,0,0,.2)}.pop-select-container{position:relative;display:block;top:1px;height:45px}.pop-select-container-expansion{position:absolute!important;top:-1px;left:0;bottom:0;right:0;box-sizing:border-box!important;-moz-box-sizing:border-box}.pop-select-feedback{position:relative;display:flex;justify-content:center;align-items:center;top:0;width:12px;height:20px}.pop-select-helper{position:absolute;top:7px;right:30px;font-size:.8em}.pop-select-error{top:-1px;position:relative;font-size:.8em;left:4px}:host ::ng-deep .pop-input-readonly input:not(.pop-input-select){color:red}:host ::ng-deep .mat-form-field-appearance-outline .mat-form-field-wrapper{padding-bottom:0;margin:0!important}:host ::ng-deep .mat-form-field-appearance-outline .mat-select-value{padding-right:40px}:host ::ng-deep .mat-form-field-appearance-outline .mat-form-field-infix .mat-select-arrow{margin-top:5px}:host ::ng-deep .pop-select-mode-label .mat-select-arrow{display:none!important}:host ::ng-deep .mat-form-field-infix{width:0!important}.pop-select-items-box-bottom{box-shadow:0 4px 5px 0 rgba(0,0,0,.14),0 1px 0 0 rgba(0,0,0,.12),0 2px 4px -1px rgba(0,0,0,.2)}.pop-select-items-box-bottom,.pop-select-items-box-top{display:flex;flex-direction:column;position:relative;min-height:var(--field-min-height);max-width:var(--field-max-width);border:1px solid var(--background-border);z-index:1000;background-color:var(--background-base);overflow-y:scroll}.pop-select-items-box-top{box-shadow:-1px -4px 5px 0 rgba(0,0,0,.14),1px 1px 0 0 rgba(0,0,0,.12),1px -1px 4px -1px rgba(0,0,0,.2)}.pop-select-items{padding:var(--gap-sm);background-color:var(--background-base);cursor:pointer}.pop-select-level-1{padding-left:var(--gap-lm)}.pop-select-level-2{padding-left:var(--gap-xl)}.pop-select-items:hover{background-color:var(--background-main-menu)}"]
            },] }
];
PopSelectComponent.ctorParameters = () => [
    { type: ElementRef }
];
PopSelectComponent.propDecorators = {
    config: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLXNlbGVjdC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9iYXNlL3BvcC1maWVsZC1pdGVtL3BvcC1zZWxlY3QvcG9wLXNlbGVjdC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBb0IsTUFBTSxlQUFlLENBQUM7QUFDOUUsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ25ELE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLDZCQUE2QixDQUFDO0FBQ2xFLE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxpQ0FBaUMsQ0FBQztBQUM1RCxPQUFPLEVBQUMsa0JBQWtCLEVBQUUsUUFBUSxFQUFFLGtCQUFrQixFQUFDLE1BQU0sZ0NBQWdDLENBQUM7QUFRaEcsTUFBTSxPQUFPLGtCQUFtQixTQUFRLHFCQUFxQjtJQVMzRCxZQUNTLEVBQWM7UUFFckIsS0FBSyxFQUFFLENBQUM7UUFGRCxPQUFFLEdBQUYsRUFBRSxDQUFZO1FBVGQsV0FBTSxHQUFpQixJQUFJLFlBQVksRUFBRSxDQUFDO1FBQ25ELFNBQUksR0FBRyxvQkFBb0IsQ0FBQztRQUU1QixrQkFBYSxHQUFHLE1BQU0sQ0FBQztRQUV2QixPQUFFLEdBQUcsRUFBQyxRQUFRLEVBQUUsRUFBQyxNQUFNLEVBQUUsU0FBUyxFQUFDLEVBQUMsQ0FBQztRQVFuQyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxHQUFxQixFQUFFO1lBQzFDLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBTyxPQUFPLEVBQUUsRUFBRTtnQkFFbkMsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDO29CQUNoQixJQUFJLENBQUMsaUJBQWlCLEVBQUU7b0JBQ3hCLElBQUksQ0FBQyxl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QWExQixLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDb21wb25lbnQsIEVsZW1lbnRSZWYsIElucHV0LCBPbkRlc3Ryb3ksIE9uSW5pdH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge1NlbGVjdENvbmZpZ30gZnJvbSAnLi9zZWxlY3QtY29uZmlnLm1vZGVsJztcbmltcG9ydCB7UG9wRmllbGRJdGVtQ29tcG9uZW50fSBmcm9tICcuLi9wb3AtZmllbGQtaXRlbS5jb21wb25lbnQnO1xuaW1wb3J0IHtJbnB1dENvbmZpZ30gZnJvbSAnLi4vcG9wLWlucHV0L2lucHV0LWNvbmZpZy5tb2RlbCc7XG5pbXBvcnQge0lzQ2FsbGFibGVGdW5jdGlvbiwgSXNPYmplY3QsIElzT2JqZWN0VGhyb3dFcnJvcn0gZnJvbSAnLi4vLi4vLi4vLi4vcG9wLWNvbW1vbi11dGlsaXR5JztcblxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdsaWItcG9wLXNlbGVjdCcsXG4gIHRlbXBsYXRlVXJsOiAnLi9wb3Atc2VsZWN0LmNvbXBvbmVudC5odG1sJyxcbiAgc3R5bGVVcmxzOiBbJy4vcG9wLXNlbGVjdC5jb21wb25lbnQuc2NzcyddXG59KVxuZXhwb3J0IGNsYXNzIFBvcFNlbGVjdENvbXBvbmVudCBleHRlbmRzIFBvcEZpZWxkSXRlbUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcbiAgQElucHV0KCkgY29uZmlnOiBTZWxlY3RDb25maWcgPSBuZXcgU2VsZWN0Q29uZmlnKCk7XG4gIG5hbWUgPSAnUG9wU2VsZWN0Q29tcG9uZW50JztcblxuICBvcHRpb25zVG9wUG9zID0gJy01cHgnO1xuXG4gIHVpID0ge3NlbGVjdGVkOiB7Y29uZmlnOiB1bmRlZmluZWR9fTtcblxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBlbDogRWxlbWVudFJlZixcbiAgKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuZG9tLmNvbmZpZ3VyZSA9ICgpOiBQcm9taXNlPGJvb2xlYW4+ID0+IHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZShhc3luYyAocmVzb2x2ZSkgPT4ge1xuXG4gICAgICAgIGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgICB0aGlzLl9zZXRJbml0aWFsQ29uZmlnKCksXG4gICAgICAgICAgdGhpcy5fc2V0Q29uZmlnSG9va3MoKSxcbiAgICAgICAgICB0aGlzLl9pbml0aWFsRmF1eENvbnRyb2woKVxuICAgICAgICBdKTtcblxuICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgfSk7XG4gICAgfTtcblxuXG4gICAgdGhpcy5kb20ucHJvY2VlZCA9ICgpOiBQcm9taXNlPGJvb2xlYW4+ID0+IHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICB0aGlzLmRvbS5zZXRUaW1lb3V0KCdjaGVjay1leGlzdGluZy12YWx1ZScsICgpID0+IHtcbiAgICAgICAgICBpZiAoIXRoaXMuY29uZmlnLmNvbnRyb2wudmFsdWUgJiYgdGhpcy5jb25maWcuYXV0b0ZpbGwgJiYgdGhpcy5jb25maWcucmVxdWlyZWQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZy5vcHRpb25zLnZhbHVlcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgICAgaWYgKElzQ2FsbGFibGVGdW5jdGlvbih0aGlzLmNvbmZpZy50cmlnZ2VyT25DaGFuZ2UpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXhpc3RpbmdWYWx1ZSA9IHRoaXMuY29uZmlnLm9wdGlvbnMudmFsdWVzWzBdLnZhbHVlO1xuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlnLnRyaWdnZXJPbkNoYW5nZShleGlzdGluZ1ZhbHVlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSwgMCk7XG4gICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gIH1cblxuXG4gIG5nT25Jbml0KCkge1xuICAgIHN1cGVyLm5nT25Jbml0KCk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBTZWxlY3RzT3B0aW9uXG4gICAqIEBwYXJhbSBvcHRpb25WYWx1ZTogb3B0aW9uIHZhbHVlIHNlbGVjdGVkXG4gICAqL1xuXG4gIG9uT3B0aW9uU2VsZWN0ZWQob3B0aW9uVmFsdWU6IHN0cmluZyB8IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuY29uZmlnLmNvbnRyb2wuc2V0VmFsdWUob3B0aW9uVmFsdWUpO1xuICAgIHRoaXMuZG9tLnN0YXRlLmRpc3BsYXlJdGVtcyA9IGZhbHNlO1xuICAgIHRoaXMudWkuc2VsZWN0ZWQuY29uZmlnLmxhYmVsID0gdGhpcy5jb25maWcubGFiZWw7XG4gICAgdGhpcy5vbkJsdXIoKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqICBTZWxlY3QgQm94IGNsaWNrZWRcbiAgICogIEByZXR1cm5zIHZvaWRcbiAgICovXG4gIG9uU2VsZWN0aW9uQ2xpY2soJGV2ZW50KTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmNvbmZpZy5yZWFkb25seSAmJiB0aGlzLmNvbmZpZy5jb250cm9sLnN0YXR1cyAhPT0gJ0RJU0FCTEVEJykge1xuXG4gICAgICAvLyBkZXRlcm1pbmUgZGlzcGxheSBkaXJlY3Rpb24gYW5kIHRvcCBvZmZzZXRcbiAgICAgIGNvbnN0IHRoaXJkSGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0IC8gMztcblxuICAgICAgaWYgKCRldmVudC5jbGllbnRZIDwgKHRoaXJkSGVpZ2h0ICogMikpIHtcbiAgICAgICAgdGhpcy5kb20uc3RhdGUuZGlzcGxheUJvdHRvbSA9IHRydWU7XG4gICAgICAgIHRoaXMub3B0aW9uc1RvcFBvcyA9ICctNXB4JztcbiAgICAgICAgdGhpcy51aS5zZWxlY3RlZC5jb25maWcuc2VsZWN0TW9kZU9wdGlvbnNEaXJlY3Rpb24gPSAnZG93bic7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmRvbS5zdGF0ZS5kaXNwbGF5Qm90dG9tID0gZmFsc2U7XG4gICAgICAgIGxldCBvZmZzZXQgPSAoNDQgKyAodGhpcy5jb25maWcub3B0aW9ucy52YWx1ZXMubGVuZ3RoICogNDgpKTtcblxuICAgICAgICBvZmZzZXQgPSBvZmZzZXQgPiAyODQgPyAyODQgOiBvZmZzZXQ7XG5cbiAgICAgICAgdGhpcy5vcHRpb25zVG9wUG9zID0gYC0ke29mZnNldH1weGA7XG4gICAgICAgIHRoaXMudWkuc2VsZWN0ZWQuY29uZmlnLmxhYmVsID0gJyAnO1xuICAgICAgICB0aGlzLnVpLnNlbGVjdGVkLmNvbmZpZy5zZWxlY3RNb2RlT3B0aW9uc0RpcmVjdGlvbiA9ICd1cCc7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmRvbS5zdGF0ZS5kaXNwbGF5SXRlbXMpIHtcbiAgICAgICAgdGhpcy5kb20uc3RhdGUuZGlzcGxheUl0ZW1zID0gZmFsc2U7XG4gICAgICAgIHRoaXMudWkuc2VsZWN0ZWQuY29uZmlnLmxhYmVsID0gdGhpcy5jb25maWcubGFiZWw7XG4gICAgICAgIHRoaXMub25CbHVyKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmRvbS5zdGF0ZS5kaXNwbGF5SXRlbXMgPSB0cnVlO1xuICAgICAgICB0aGlzLm9uRm9jdXMoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBDbG9zZXMgdGhlIGRyb3Bkb3duIGlmIGl0IGlzIGFjdGl2ZS5cbiAgICogVGhpcyBtZXRob2QgaXMgY2FsbGVkIGZyb20gdGhlIENsaWNrT3V0c2lkZSBkaXJlY3RpdmUuXG4gICAqIElmIHRoZSB1c2VyIGNsaWNrcyBvdXRzaWRlIG9mIHRoZSBjb21wb25lbnQsIGl0IHdpbGwgY2xvc2VcbiAgICogQHJldHVybnMgdm9pZFxuICAgKi9cbiAgcHVibGljIG9uT3V0c2lkZUNMaWNrKCk6IHZvaWQge1xuICAgIHRoaXMuZG9tLnN0YXRlLmRpc3BsYXlJdGVtcyA9IGZhbHNlO1xuICAgIHRoaXMudWkuc2VsZWN0ZWQuY29uZmlnLmxhYmVsID0gdGhpcy5jb25maWcubGFiZWw7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGUgZG9tIGRlc3Ryb3kgZnVuY3Rpb24gbWFuYWdlcyBhbGwgdGhlIGNsZWFuIHVwIHRoYXQgaXMgbmVjZXNzYXJ5IGlmIHN1YnNjcmlwdGlvbnMsIHRpbWVvdXRzLCBldGMgYXJlIHN0b3JlZCBwcm9wZXJseVxuICAgKi9cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgc3VwZXIubmdPbkRlc3Ryb3koKTtcbiAgfVxuXG5cbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBVbmRlciBUaGUgSG9vZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIFByaXZhdGUgTWV0aG9kICkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiAgLyoqXG4gICAqIFNldCB0aGUgaW5pdGlhbCBjb25maWcgZm9yIHRoaXMgY29tcG9uZW50XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBwcml2YXRlIF9zZXRJbml0aWFsQ29uZmlnKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxib29sZWFuPigocmVzb2x2ZSkgPT4ge1xuICAgICAgdGhpcy5kb20uc3RhdGUuZGlzcGxheUl0ZW1zID0gZmFsc2U7XG4gICAgICB0aGlzLmRvbS5zdGF0ZS5kaXNwbGF5Qm90dG9tID0gdHJ1ZTtcbiAgICAgIHRoaXMuY29uZmlnID0gSXNPYmplY3RUaHJvd0Vycm9yKHRoaXMuY29uZmlnLCB0cnVlLCBgQ29uZmlnIHJlcXVpcmVkYCkgPyB0aGlzLmNvbmZpZyA6IG51bGw7XG4gICAgICB0aGlzLmlkID0gdGhpcy5jb25maWcubmFtZTtcbiAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgY29uZmlnIGhvb2tzIGZvciB0aGlzIGNvbXBvbmVudFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcHJpdmF0ZSBfc2V0Q29uZmlnSG9va3MoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGJvb2xlYW4+KChyZXNvbHZlKSA9PiB7XG4gICAgICB0aGlzLmNvbmZpZy50cmlnZ2VyT25DaGFuZ2UgPSAodmFsdWU6IHN0cmluZyB8IG51bWJlciB8IG51bGwpID0+IHtcblxuICAgICAgICB0aGlzLmRvbS5zZXRUaW1lb3V0KGBjb25maWctdHJpZ2dlci1jaGFuZ2VgLCAoKSA9PiB7XG4gICAgICAgICAgLy8gdGhpcy5jZHIuZGV0ZWN0Q2hhbmdlcygpO1xuICAgICAgICAgIHRoaXMuX3NldFN0clZhbCh2YWx1ZSk7XG4gICAgICAgICAgdGhpcy5vbkNoYW5nZSh2YWx1ZSwgdHJ1ZSk7XG4gICAgICAgIH0sIDApO1xuICAgICAgfTtcblxuICAgICAgdGhpcy5jb25maWcuY2xlYXJNZXNzYWdlID0gKCkgPT4ge1xuICAgICAgICB0aGlzLmRvbS5zZXRUaW1lb3V0KGBjb25maWctY2xlYXItbWVzc2FnZWAsICgpID0+IHtcbiAgICAgICAgICB0aGlzLmNvbmZpZy5tZXNzYWdlID0gJyc7XG4gICAgICAgICAgdGhpcy5jb25maWcuY29udHJvbC5tYXJrQXNQcmlzdGluZSgpO1xuICAgICAgICAgIHRoaXMuY29uZmlnLmNvbnRyb2wubWFya0FzVW50b3VjaGVkKCk7XG4gICAgICAgICAgLy8gdGhpcy5jZHIuZGV0ZWN0Q2hhbmdlcygpO1xuICAgICAgICB9LCAwKTtcbiAgICAgIH07XG4gICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICB9KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemUgRmF1eCBjb250cm9sICggdXNlZCB0byBkaXNwbGF5IHN0cmluZyB2YWx1ZSBvZiBzZWxlY3QgKS4gU3Vic2NyaWJlcyB0byBhY3R1YWwgY29udHJvbCB2YWx1ZSBjaGFuZ2VzIHRvIHVwZGF0ZSB2YWx1ZS5cbiAgICovXG5cbiAgcHJpdmF0ZSBfaW5pdGlhbEZhdXhDb250cm9sKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxib29sZWFuPigocmVzb2x2ZSkgPT4ge1xuICAgICAgdGhpcy51aS5zZWxlY3RlZC5jb25maWcgPSBuZXcgSW5wdXRDb25maWcoe1xuICAgICAgICB2YWx1ZTogJycsXG4gICAgICAgIGRpc2FibGVkOiB0aGlzLmNvbmZpZy5kaXNhYmxlZCA/IHRoaXMuY29uZmlnLmRpc2FibGVkIDogbnVsbCxcbiAgICAgICAgaGVscFRleHQ6IHRoaXMuY29uZmlnLmhlbHBUZXh0LFxuICAgICAgICBkaXNwbGF5RXJyb3JzOiBmYWxzZSxcbiAgICAgICAgbGFiZWw6IHRoaXMuY29uZmlnLmxhYmVsLFxuICAgICAgICByZWFkb25seTogdHJ1ZSxcbiAgICAgICAgc2VsZWN0TW9kZTogdHJ1ZSxcbiAgICAgICAgbWluaW1hbDogdGhpcy5jb25maWcubWluaW1hbCxcbiAgICAgICAgbWF4bGVuZ3RoOiA2NTAwMFxuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuX3NldFN0clZhbCgoPGFueT50aGlzLmNvbmZpZy52YWx1ZSkpO1xuXG5cbiAgICAgIHRoaXMuZG9tLnNldFN1YnNjcmliZXIoYHZhbHVlLWNoYW5nZXNgLCB0aGlzLmNvbmZpZy5jb250cm9sLnZhbHVlQ2hhbmdlcy5zdWJzY3JpYmUoKHZhbHVlKSA9PiB7XG4gICAgICAgIHRoaXMuX3NldFN0clZhbCgoPGFueT52YWx1ZSkpO1xuICAgICAgfSkpO1xuXG4gICAgICB0aGlzLmRvbS5zZXRTdWJzY3JpYmVyKGBzdGF0dXMtY2hhbmdlc2AsIHRoaXMuY29uZmlnLmNvbnRyb2wuc3RhdHVzQ2hhbmdlcy5zdWJzY3JpYmUoKHN0YXR1cykgPT4ge1xuICAgICAgICB0aGlzLnVpLnNlbGVjdGVkLmNvbmZpZy5jb250cm9sLnN0YXR1cyA9IHN0YXR1cztcbiAgICAgIH0pKTtcblxuICAgICAgcmV0dXJuIHJlc29sdmUodHJ1ZSk7XG4gICAgfSk7XG4gIH1cblxuXG4gIHByaXZhdGUgX3NldFN0clZhbCh2YWx1ZTogbnVtYmVyIHwgc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKHZhbHVlIHx8IHZhbHVlID09ICcnKSB7IC8vIGNvZGUgY2hhbmdlIGJ5IGNoZXR1IGRldmVsb3BlciBvbiAxNi0wNS0yMDIxXG4gICAgICBjb25zdCBzZWxlY3RlZCA9IHRoaXMuY29uZmlnLm9wdGlvbnMudmFsdWVzLmZpbmQoKG8pID0+IG8udmFsdWUgPT09IHZhbHVlKTtcbiAgICAgIGlmIChJc09iamVjdChzZWxlY3RlZCwgWyduYW1lJ10pKSB7XG4gICAgICAgIHRoaXMudWkuc2VsZWN0ZWQuY29uZmlnLmNvbnRyb2wuc2V0VmFsdWUoc2VsZWN0ZWQubmFtZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnVpLnNlbGVjdGVkLmNvbmZpZy5jb250cm9sLnNldFZhbHVlKCcnKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy51aS5zZWxlY3RlZC5jb25maWcuY29udHJvbC5zZXRWYWx1ZShudWxsKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==