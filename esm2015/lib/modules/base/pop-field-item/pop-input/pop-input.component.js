import { __awaiter } from "tslib";
import { Component, Input, ElementRef, ViewChild } from '@angular/core';
import { InputConfig } from './input-config.model';
import { PatternValidation, ValidationErrorMessages } from '../../../../services/pop-validators';
import { PopFieldItemComponent } from '../pop-field-item.component';
import { slideInOut } from '../../../../pop-common-animations.model';
import { IsArray, IsCallableFunction } from '../../../../pop-common-utility';
export class PopInputComponent extends PopFieldItemComponent {
    constructor(el) {
        super();
        this.el = el;
        this.config = new InputConfig();
        this.name = 'PopInputComponent';
        /**
         * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
         */
        this.dom.configure = () => {
            return new Promise((resolve) => {
                if (this.config.autofocus) {
                    this.inputField.nativeElement.focus();
                }
                else if (this.config.autoselect) {
                    this.inputField.nativeElement.focus();
                    this.inputField.nativeElement.select();
                }
                this.config.triggerOnChange = (value, forcePatch = false) => {
                    this.dom.setTimeout(`config-trigger-change`, () => {
                        // this.cdr.detectChanges();
                        this.onChange(value, forcePatch);
                    }, 0);
                };
                this.config.triggerDirectPatch = (value) => {
                    this.dom.setTimeout(`config-trigger-patch`, () => {
                        this._onPatch(value, true);
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
                this.config.setType = (type) => {
                    this.dom.setTimeout(`config-set-type`, () => {
                        this.config.type = type;
                        // this.cdr.detectChanges();
                    }, 0);
                };
                return resolve(true);
            });
        };
    }
    /**
     * This component should have a specific purpose
     */
    ngOnInit() {
        super.ngOnInit();
    }
    onKeyUp(event) {
        if (event.code === 'Enter') {
            if (this.config.control.invalid) {
                if (this.config.displayErrors)
                    this._setMessage(ValidationErrorMessages(this.config.control.errors));
            }
            else {
                this._clearMessage();
                if (this.config.patch && (this.config.patch.path || this.config.facade)) {
                    if (this.config.control.value !== this.asset.storedValue) {
                        if (this._isFieldPatchable()) {
                            this.onChange();
                        }
                    }
                }
                if (this.config.tabOnEnter) {
                    this.dom.focusNextInput(this.el);
                }
                else {
                    this.onBubbleEvent('onEnter');
                }
                if (IsCallableFunction(this.config.onEnter)) {
                    this.dom.setTimeout(`on-enter`, () => __awaiter(this, void 0, void 0, function* () {
                        yield this.config.onEnter(this.core, event);
                    }), 250);
                }
            }
        }
        else if (!this.config.mask && this.config.pattern && this.config.pattern.length) {
            const val = PatternValidation(this.config.pattern, 'value', this.config.control.value);
            if (val !== this.config.control.value)
                this.config.control.setValue(val);
            if (this.config.control.touched && this._isChangeValid()) {
                this._clearMessage();
            }
            else if (IsArray(this.config.prevent, true)) {
                this._isChangeValid();
            }
            this.onBubbleEvent('onKeyUp');
        }
        else {
            if (this.config.control.touched && this._isChangeValid()) {
                this._clearMessage();
            }
            else if (IsArray(this.config.prevent, true)) {
                this._isChangeValid();
            }
            this.onBubbleEvent('onKeyUp');
        }
    }
    /**
     * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
     */
    ngOnDestroy() {
        super.ngOnDestroy();
    }
}
PopInputComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-input',
                template: "<div class=\"import-field-item-container pop-input-container\" [ngClass]=\"{'sw-hidden': config.hidden, 'pop-input-minimal': config.minimal, 'pop-input-hint': config.hint, 'pop-input-default': !config.hint && !config.minimal, 'pop-input-readonly': config.readonly, 'pop-input-select': config.selectMode}\">\n  <mat-form-field appearance=\"outline\" color=\"accent\" class=\"import-field-item-container-expansion\" [title]=\"config?.tooltip\">\n    <mat-label *ngIf=\"config?.label\">{{config?.label}} <span *ngIf=\"config?.required\" >*</span>   </mat-label>\n    <input\n      matInput\n      [ngClass]=\"{'sw-dot-font': config.conceal, 'sw-pointer': (config.selectMode && config?.control?.status !== 'DISABLED'), 'pop-input-select': (config.selectMode && config?.control?.status !== 'DISABLED')}\"\n      matTooltipClass=\"pop-input-tooltip-background\"\n      [hidden]=config.hidden\n      [maxlength]=config.maxlength\n      [readonly]=config.readonly\n      [type]=config.type\n      [formControl]=config.control\n      (keyup)=\"onKeyUp($event);\"\n      (blur)=\"dom.state.hint=false; onBlur();\"\n      (focus)=\"dom.state.hint= true; onFocus();\"\n      [prefix]=config.prefix\n      [suffix]=config.suffix\n      [mask]=config.mask\n      [specialCharacters]=config.specialChars\n      [dropSpecialCharacters]=config.dropSpecial\n      [showMaskTyped]=config.showMask\n      #inputField\n    >\n    <div class=\"pop-input-select-icon\" [ngClass]=\"{'sw-pointer': config?.control?.status !== 'DISABLED'}\"  *ngIf=\"config.selectMode\">\n      <mat-icon>arrow_drop_{{config?.selectModeOptionsDirection}}</mat-icon>\n<!--      <mat-icon>arrow_drop_up</mat-icon>-->\n    </div>\n    <mat-hint class=\"pop-input-btm-rgt-hint\" *ngIf=\"config.hint && dom.state.hint\" align=\"end\">{{config.control.value?.length || 0}}/{{config.maxlength}}</mat-hint>\n\n    <div class=\"pop-input-feedback-container\" matSuffix *ngIf=\"!config.minimal\" >\n      <lib-pop-field-item-error class=\"pop-input-error\" [hidden]=\"!config.message\" [message]=\"config.message\"></lib-pop-field-item-error>\n      <lib-pop-field-item-helper class=\"pop-input-helper\" [hidden]=\"config.message && !config.selectMode\" [helpText]=config.helpText></lib-pop-field-item-helper>\n    </div>\n    <mat-hint class=\"pop-input-btm-lft-hint\" [ngClass]=\"{'hint-disabled': config.control.status === 'DISABLED'}\"  *ngIf=\"config.hint && config.hintText\">{{config.hintText}}</mat-hint>\n    <mat-hint class=\"pop-input-btm-lft-hint\"  *ngIf=\"config.hint && config.required && !config.hintText\">*Required</mat-hint>\n    <mat-error class=\"pop-input-btm-lft-error\" *ngIf=\"config.hint && config.message\">\n      {{config.message}}\n    </mat-error>\n  </mat-form-field>\n\n\n  <lib-pop-field-item-loader [show]=\"config.patch.displayIndicator && config.patch.running\"></lib-pop-field-item-loader>\n</div>\n",
                animations: [
                    slideInOut
                ],
                styles: [".pop-input-feedback-container{position:relative;display:flex;justify-content:center;align-items:center;top:2px;width:20px;height:20px}.pop-input-select-icon{position:absolute;right:-2px;top:0;z-index:2;color:var(--text-disabled)}.pop-input-error{top:2px;z-index:2}.pop-input-error,.pop-input-helper{position:absolute;font-size:.8em;left:2px}.pop-input-helper{top:3px;z-index:1}.pop-input-btm-lft-error,.pop-input-btm-lft-hint{position:relative;color:var(--foreground-disabled);font-size:12px;right:5px;padding-left:var(--gap-s)}.pop-input-btm-rgt-hint{color:var(--foreground-disabled);font-size:12px}.pop-input-btm-lft-error{color:var(--warn)}.pop-input-container-minimal .mat-form-field-appearance-outline .mat-form-field-wrapper,:host ::ng-deep .mat-form-field-appearance-outline .mat-form-field-wrapper{padding-bottom:0;margin:0!important}:host ::ng-deep .mat-form-field-appearance-outline .mat-form-field-subscript-wrapper{margin-top:5px!important}:host ::ng-deep .mat-form-field-infix{width:0!important}:host ::ng-deep .mat-form-field-flex{margin-top:0!important}:host ::ng-deep .pop-input-default .mat-form-field-appearance-outline .mat-form-field-infix{padding:8px 0 13px}:host ::ng-deep .pop-input-minimal .mat-form-field-appearance-outline .mat-form-field-infix{padding:8px 0 13px}:host ::ng-deep .pop-input-hint .mat-form-field-appearance-outline .mat-form-field-infix{padding:8px 0 30px!important}:host ::ng-deep .pop-input-minimal .mat-form-field-infix{padding-right:2px!important}:host ::ng-deep .pop-input-select .pop-input-helper{left:-46px}:host ::ng-deep .mat-form-field-appearance-outline .mat-form-field-outline{max-height:40px;background-color:var(--background-base)}:host ::ng-deep .mat-form-field-label-wrapper{overflow:visible}:host ::ng-deep .pop-input-readonly input:not(.pop-input-select){color:var(--text-disabled)}"]
            },] }
];
PopInputComponent.ctorParameters = () => [
    { type: ElementRef }
];
PopInputComponent.propDecorators = {
    config: [{ type: Input }],
    inputField: [{ type: ViewChild, args: ['inputField', { static: true },] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWlucHV0LmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2Jhc2UvcG9wLWZpZWxkLWl0ZW0vcG9wLWlucHV0L3BvcC1pbnB1dC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUF3QyxVQUFVLEVBQUUsU0FBUyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzlHLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUNuRCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUNqRyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUNwRSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFDckUsT0FBTyxFQUFFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBVzdFLE1BQU0sT0FBTyxpQkFBa0IsU0FBUSxxQkFBcUI7SUFNMUQsWUFDUyxFQUFjO1FBR3JCLEtBQUssRUFBRSxDQUFDO1FBSEQsT0FBRSxHQUFGLEVBQUUsQ0FBWTtRQU5kLFdBQU0sR0FBZ0IsSUFBSSxXQUFXLEVBQUUsQ0FBQztRQUUxQyxTQUFJLEdBQUcsbUJBQW1CLENBQUM7UUFRaEM7O1dBRUc7UUFDSCxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxHQUFxQixFQUFFO1lBQzFDLE9BQU8sSUFBSSxPQUFPLENBQUUsQ0FBRSxPQUFPLEVBQUcsRUFBRTtnQkFDaEMsSUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRTtvQkFDekIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLENBQUM7aUJBQ3RDO3FCQUFNLElB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RSxFQUFFO2dCQUN4RCxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7YUFDdEI7aUJBQUssSUFBSSxPQUFPLENBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFFLEVBQUU7Z0JBQzlDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQzthQUN2QjtZQUVELElBQUksQ0FBQyxhQUFhLENBQUUsU0FBUyxDQUFFLENBQUM7U0FDakM7YUFBSTtZQUNILElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxjQUFjLEVBQUUsRUFBRTtnQkFDeEQsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO2FBQ3RCO2lCQUFLLElBQUksT0FBTyxDQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBRSxFQUFFO2dCQUM5QyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7YUFDdkI7WUFDRCxJQUFJLENBQUMsYUFBYSxDQUFFLFNBQVMsQ0FBRSxDQUFDO1NBQ2pDO0lBQ0gsQ0FBQztJQUdEOztPQUVHO0lBQ0gsV0FBVztRQUNULEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN0QixDQUFDOzs7WUFoSUYsU0FBUyxTQUFFO2dCQUNWLFFBQVEsRUFBRSxlQUFlO2dCQUN6QixnMUZBQXlDO2dCQUV6QyxVQUFVLEVBQUU7b0JBQ1YsVUFBVTtpQkFDWDs7YUFDRjs7O1lBZmdFLFVBQVU7OztxQkFpQnhFLEtBQUs7eUJBQ0wsU0FBUyxTQUFDLFlBQVksRUFBRSxFQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIElucHV0LCBPbkluaXQsIENoYW5nZURldGVjdG9yUmVmLCBPbkRlc3Ryb3ksIEVsZW1lbnRSZWYsIFZpZXdDaGlsZCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgSW5wdXRDb25maWcgfSBmcm9tICcuL2lucHV0LWNvbmZpZy5tb2RlbCc7XG5pbXBvcnQgeyBQYXR0ZXJuVmFsaWRhdGlvbiwgVmFsaWRhdGlvbkVycm9yTWVzc2FnZXMgfSBmcm9tICcuLi8uLi8uLi8uLi9zZXJ2aWNlcy9wb3AtdmFsaWRhdG9ycyc7XG5pbXBvcnQgeyBQb3BGaWVsZEl0ZW1Db21wb25lbnQgfSBmcm9tICcuLi9wb3AtZmllbGQtaXRlbS5jb21wb25lbnQnO1xuaW1wb3J0IHsgc2xpZGVJbk91dCB9IGZyb20gJy4uLy4uLy4uLy4uL3BvcC1jb21tb24tYW5pbWF0aW9ucy5tb2RlbCc7XG5pbXBvcnQgeyBJc0FycmF5LCBJc0NhbGxhYmxlRnVuY3Rpb24gfSBmcm9tICcuLi8uLi8uLi8uLi9wb3AtY29tbW9uLXV0aWxpdHknO1xuXG5cbkBDb21wb25lbnQoIHtcbiAgc2VsZWN0b3I6ICdsaWItcG9wLWlucHV0JyxcbiAgdGVtcGxhdGVVcmw6ICcuL3BvcC1pbnB1dC5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWyAnLi9wb3AtaW5wdXQuY29tcG9uZW50LnNjc3MnIF0sXG4gIGFuaW1hdGlvbnM6IFtcbiAgICBzbGlkZUluT3V0XG4gIF1cbn0gKVxuZXhwb3J0IGNsYXNzIFBvcElucHV0Q29tcG9uZW50IGV4dGVuZHMgUG9wRmllbGRJdGVtQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xuICBASW5wdXQoKSBjb25maWc6IElucHV0Q29uZmlnID0gbmV3IElucHV0Q29uZmlnKCk7XG4gIEBWaWV3Q2hpbGQoJ2lucHV0RmllbGQnLCB7c3RhdGljOiB0cnVlfSkgaW5wdXRGaWVsZDphbnk7XG4gIHB1YmxpYyBuYW1lID0gJ1BvcElucHV0Q29tcG9uZW50JztcblxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBlbDogRWxlbWVudFJlZixcbiAgICAvLyBwcm90ZWN0ZWQgY2RyOiBDaGFuZ2VEZXRlY3RvclJlZixcbiAgKXtcbiAgICBzdXBlcigpO1xuICAgIC8qKlxuICAgICAqIFRoaXMgc2hvdWxkIHRyYW5zZm9ybSBhbmQgdmFsaWRhdGUgdGhlIGRhdGEuIFRoZSB2aWV3IHNob3VsZCB0cnkgdG8gb25seSB1c2UgZGF0YSB0aGF0IGlzIHN0b3JlZCBvbiB1aSBzbyB0aGF0IGl0IGlzIG5vdCBkZXBlbmRlbnQgb24gdGhlIHN0cnVjdHVyZSBvZiBkYXRhIHRoYXQgY29tZXMgZnJvbSBvdGhlciBzb3VyY2VzLiBUaGUgdWkgc2hvdWxkIGJlIHRoZSBzb3VyY2Ugb2YgdHJ1dGggaGVyZS5cbiAgICAgKi9cbiAgICB0aGlzLmRvbS5jb25maWd1cmUgPSAoKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoICggcmVzb2x2ZSApID0+IHtcbiAgICAgICAgaWYodGhpcy5jb25maWcuYXV0b2ZvY3VzKSB7XG4gICAgICAgICB0aGlzLmlucHV0RmllbGQubmF0aXZlRWxlbWVudC5mb2N1cygpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuY29uZmlnLmF1dG9zZWxlY3QpIHtcbiAgICAgICAgICB0aGlzLmlucHV0RmllbGQubmF0aXZlRWxlbWVudC5mb2N1cygpO1xuICAgICAgICAgICB0aGlzLmlucHV0RmllbGQubmF0aXZlRWxlbWVudC5zZWxlY3QoKTtcbiAgICAgICAgfSBcbiAgICAgICBcbiAgICAgICAgdGhpcy5jb25maWcudHJpZ2dlck9uQ2hhbmdlID0gKCB2YWx1ZTogc3RyaW5nIHwgbnVtYmVyIHwgbnVsbCwgZm9yY2VQYXRjaCA9IGZhbHNlICkgPT4ge1xuICAgICAgICAgIHRoaXMuZG9tLnNldFRpbWVvdXQoIGBjb25maWctdHJpZ2dlci1jaGFuZ2VgLCAoKSA9PiB7XG4gICAgICAgICAgICAvLyB0aGlzLmNkci5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgICAgICAgICB0aGlzLm9uQ2hhbmdlKCB2YWx1ZSwgZm9yY2VQYXRjaCApO1xuICAgICAgICAgIH0sIDAgKTtcblxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuY29uZmlnLnRyaWdnZXJEaXJlY3RQYXRjaCA9ICggdmFsdWU6IHN0cmluZyB8IG51bWJlciB8IG51bGwgKSA9PiB7XG4gICAgICAgICAgdGhpcy5kb20uc2V0VGltZW91dCggYGNvbmZpZy10cmlnZ2VyLXBhdGNoYCwgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5fb25QYXRjaCggdmFsdWUsIHRydWUgKTtcbiAgICAgICAgICB9LCAwICk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5jb25maWcuY2xlYXJNZXNzYWdlID0gKCkgPT4ge1xuXG4gICAgICAgICAgdGhpcy5kb20uc2V0VGltZW91dCggYGNvbmZpZy1jbGVhci1tZXNzYWdlYCwgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5jb25maWcubWVzc2FnZSA9ICcnO1xuICAgICAgICAgICAgdGhpcy5jb25maWcuY29udHJvbC5tYXJrQXNQcmlzdGluZSgpO1xuICAgICAgICAgICAgdGhpcy5jb25maWcuY29udHJvbC5tYXJrQXNVbnRvdWNoZWQoKTtcbiAgICAgICAgICAgIC8vIHRoaXMuY2RyLmRldGVjdENoYW5nZXMoKTtcbiAgICAgICAgICB9LCAwICk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5jb25maWcuc2V0VHlwZSA9ICggdHlwZTogJ3RleHQnIHwgJ3Bhc3N3b3JkJyApID0+IHtcbiAgICAgICAgICB0aGlzLmRvbS5zZXRUaW1lb3V0KCBgY29uZmlnLXNldC10eXBlYCwgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5jb25maWcudHlwZSA9IHR5cGU7XG4gICAgICAgICAgICAvLyB0aGlzLmNkci5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgICAgICAgfSwgMCApO1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiByZXNvbHZlKCB0cnVlICk7XG4gICAgICB9ICk7XG4gICAgfTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgY29tcG9uZW50IHNob3VsZCBoYXZlIGEgc3BlY2lmaWMgcHVycG9zZVxuICAgKi9cbiAgbmdPbkluaXQoKXtcbiAgICBzdXBlci5uZ09uSW5pdCgpO1xuICB9XG5cblxuICBvbktleVVwKCBldmVudCApOiB2b2lke1xuICAgIGlmKCBldmVudC5jb2RlID09PSAnRW50ZXInICl7XG4gICAgICBpZiggdGhpcy5jb25maWcuY29udHJvbC5pbnZhbGlkICl7XG4gICAgICAgIGlmKCB0aGlzLmNvbmZpZy5kaXNwbGF5RXJyb3JzICkgdGhpcy5fc2V0TWVzc2FnZSggVmFsaWRhdGlvbkVycm9yTWVzc2FnZXMoIHRoaXMuY29uZmlnLmNvbnRyb2wuZXJyb3JzICkgKTtcbiAgICAgIH1lbHNle1xuICAgICAgICB0aGlzLl9jbGVhck1lc3NhZ2UoKTtcbiAgICAgICAgaWYoIHRoaXMuY29uZmlnLnBhdGNoICYmICggdGhpcy5jb25maWcucGF0Y2gucGF0aCB8fCB0aGlzLmNvbmZpZy5mYWNhZGUgKSApe1xuICAgICAgICAgIGlmKCB0aGlzLmNvbmZpZy5jb250cm9sLnZhbHVlICE9PSB0aGlzLmFzc2V0LnN0b3JlZFZhbHVlICl7XG4gICAgICAgICAgICBpZiggdGhpcy5faXNGaWVsZFBhdGNoYWJsZSgpICl7XG4gICAgICAgICAgICAgIHRoaXMub25DaGFuZ2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYoIHRoaXMuY29uZmlnLnRhYk9uRW50ZXIgKXtcbiAgICAgICAgICB0aGlzLmRvbS5mb2N1c05leHRJbnB1dCggdGhpcy5lbCApO1xuXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHRoaXMub25CdWJibGVFdmVudCggJ29uRW50ZXInICk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiggSXNDYWxsYWJsZUZ1bmN0aW9uKCB0aGlzLmNvbmZpZy5vbkVudGVyICkgKXtcbiAgICAgICAgICB0aGlzLmRvbS5zZXRUaW1lb3V0KCBgb24tZW50ZXJgLCBhc3luYygpID0+IHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuY29uZmlnLm9uRW50ZXIoIHRoaXMuY29yZSwgZXZlbnQgKTtcbiAgICAgICAgICB9LCAyNTAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1lbHNlIGlmKCAhdGhpcy5jb25maWcubWFzayAmJiB0aGlzLmNvbmZpZy5wYXR0ZXJuICYmIHRoaXMuY29uZmlnLnBhdHRlcm4ubGVuZ3RoICl7XG4gICAgICBjb25zdCB2YWwgPSBQYXR0ZXJuVmFsaWRhdGlvbiggdGhpcy5jb25maWcucGF0dGVybiwgJ3ZhbHVlJywgdGhpcy5jb25maWcuY29udHJvbC52YWx1ZSApO1xuICAgICAgaWYoIHZhbCAhPT0gdGhpcy5jb25maWcuY29udHJvbC52YWx1ZSApIHRoaXMuY29uZmlnLmNvbnRyb2wuc2V0VmFsdWUoIHZhbCApO1xuICAgICAgaWYoIHRoaXMuY29uZmlnLmNvbnRyb2wudG91Y2hlZCAmJiB0aGlzLl9pc0NoYW5nZVZhbGlkKCkgKXtcbiAgICAgICAgdGhpcy5fY2xlYXJNZXNzYWdlKCk7XG4gICAgICB9ZWxzZSBpZiggSXNBcnJheSggdGhpcy5jb25maWcucHJldmVudCwgdHJ1ZSApICl7XG4gICAgICAgIHRoaXMuX2lzQ2hhbmdlVmFsaWQoKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5vbkJ1YmJsZUV2ZW50KCAnb25LZXlVcCcgKTtcbiAgICB9ZWxzZXtcbiAgICAgIGlmKCB0aGlzLmNvbmZpZy5jb250cm9sLnRvdWNoZWQgJiYgdGhpcy5faXNDaGFuZ2VWYWxpZCgpICl7XG4gICAgICAgIHRoaXMuX2NsZWFyTWVzc2FnZSgpO1xuICAgICAgfWVsc2UgaWYoIElzQXJyYXkoIHRoaXMuY29uZmlnLnByZXZlbnQsIHRydWUgKSApe1xuICAgICAgICB0aGlzLl9pc0NoYW5nZVZhbGlkKCk7XG4gICAgICB9XG4gICAgICB0aGlzLm9uQnViYmxlRXZlbnQoICdvbktleVVwJyApO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoZSBkb20gZGVzdHJveSBmdW5jdGlvbiBtYW5hZ2VzIGFsbCB0aGUgY2xlYW4gdXAgdGhhdCBpcyBuZWNlc3NhcnkgaWYgc3Vic2NyaXB0aW9ucywgdGltZW91dHMsIGV0YyBhcmUgc3RvcmVkIHByb3Blcmx5XG4gICAqL1xuICBuZ09uRGVzdHJveSgpe1xuICAgIHN1cGVyLm5nT25EZXN0cm95KCk7XG4gIH1cblxuXG59XG4iXX0=