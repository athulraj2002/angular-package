import { ChangeDetectorRef, Component, ElementRef, Input } from '@angular/core';
import { ValidationErrorMessages } from '../../../../services/pop-validators';
import { PopFieldItemComponent } from '../pop-field-item.component';
import { NumberConfig } from './number-config.model';
export class PopNumberComponent extends PopFieldItemComponent {
    constructor(el, cdr) {
        super();
        this.el = el;
        this.cdr = cdr;
        this.config = new NumberConfig();
        this.name = 'PopNumberComponent';
        /**
         * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
         */
        this.dom.configure = () => {
            return new Promise((resolve) => {
                this.config.triggerOnChange = (value, forcePatch = false) => {
                    this.cdr.detectChanges();
                    this.onChange(value, forcePatch);
                };
                this.config.triggerDirectPatch = (value) => {
                    this._onPatch(value, true);
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
    /**
     * Test
     * @param event
     */
    onKeyUp(event) {
        if (event.code === 'Enter') {
            if (this.config.control.invalid) {
                if (this.config.displayErrors)
                    this._setMessage(ValidationErrorMessages(this.config.control.errors));
            }
            else {
                if (this.config.patch && (this.config.patch.path || this.config.facade)) {
                    if (this.config.control.value !== this.asset.storedValue) {
                        if (this._isFieldPatchable()) {
                            this.onChange();
                        }
                    }
                }
            }
        }
        else {
            this.onBubbleEvent('onKeyUp');
        }
    }
    /**
     * Hook that is called right before a patch
     */
    _beforePatch() {
        return new Promise((resolve) => {
            const patch = this.config.patch;
            const control = this.config.control;
            this._checkValue();
            control.disable();
            patch.running = true;
            return resolve(true);
        });
    }
    /**
     * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
     */
    ngOnDestroy() {
        super.ngOnDestroy();
    }
    _checkValue() {
        const control = this.config.control;
        if (control.value > this.config.max) {
            control.setValue(this.config.max, { emitEvent: false });
        }
        else if (control.value < this.config.min) {
            control.setValue(this.config.min, { emitEvent: false });
        }
    }
}
PopNumberComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-number',
                template: "<div class=\"import-field-item-container pop-number-container\" [ngClass]=\"{'sw-hidden': config.hidden, 'pop-number-minimal': config.minimal, 'pop-number-container-tooltip-adjust': config.tooltip && dom.state.tooltip}\">\n  <div *ngIf=\"config.tooltip && dom.state.tooltip\" [@slideInOut] class=\"pop-number-tooltip-container\" [innerHTML]=config.tooltip></div>\n  <mat-form-field appearance=\"outline\" color=\"accent\" class=\"import-field-item-container-expansion\">\n    <mat-label *ngIf=\"config.label\">{{config.label}}</mat-label>\n\n    <input\n      type=\"number\"\n      matInput\n      matTooltipClass=\"pop-number-tooltip-background\"\n      [hidden]=config.hidden\n      [min]=config.min\n      [max]=config.max\n      [step]=config.step\n      [formControl]=config.control\n      (keyup)=\"onKeyUp($event);\"\n      (blur)=\"dom.state.tooltip=false; onBlur();\"\n      (focus)=\"dom.state.tooltip= true; onFocus();\"\n      [maxlength]=config.maxlength\n    >\n    <div class=\"pop-number-feedback-container\" matSuffix *ngIf=\"!config.minimal && ( config.message || config.helpText)\">\n      <lib-pop-field-item-error class=\"pop-number-error-icon\" [hidden]=\"!config.message\" [message]=\"config.message\"></lib-pop-field-item-error>\n      <lib-pop-field-item-helper class=\"pop-number-helper-icon\" [hidden]=\"config.message\" [helpText]=config.helpText></lib-pop-field-item-helper>\n    </div>\n  </mat-form-field>\n\n  <lib-pop-field-item-loader [show]=\"config.patch.displayIndicator && config.patch.running\"></lib-pop-field-item-loader>\n</div>\n",
                styles: [".pop-number-container ::ng-deep .mat-form-field-appearance-outline .mat-form-field-infix{padding:8px 0 13px}.pop-number-container ::ng-deep .pop-number-container-minimal .mat-form-field-appearance-outline .mat-form-field-infix{padding:8px 0 13px}.pop-number-container .pop-number-container-minimal .mat-form-field-appearance-outline .mat-form-field-wrapper,.pop-number-container ::ng-deep .mat-form-field-appearance-outline .mat-form-field-wrapper{padding-bottom:0;margin:0!important}.pop-number-container ::ng-deep .mat-form-field-appearance-outline .mat-form-field-subscript-wrapper{display:none}.pop-number-container ::ng-deep input[type=number]{text-align:left;min-width:40px;padding-right:5px}.pop-number-feedback-container{top:-4px}.pop-number-error-icon,.pop-number-feedback-container{position:relative;display:flex;justify-content:center;align-items:center;width:20px;height:20px}.pop-number-error-icon{top:5px;font-size:.8em}.pop-number-helper-icon{position:relative;font-size:.8em;top:3px;z-index:2}.pop-number-select-icon{position:absolute;z-index:2;margin-top:3px;color:var(--text-disabled)}.pop-number-ajax-spinner{position:absolute;z-index:1}.pop-number-container-tooltip-adjust{padding-top:45px}.pop-number-tooltip-container{position:absolute;display:block;right:0;left:0;top:0;height:40px;background:var(--accent);border-radius:.25em;padding:.75em;z-index:2;color:var(--primary-text);height:-webkit-fit-content;height:-moz-fit-content;height:fit-content;overflow:hidden;text-align:center}:host ::ng-deep .pop-number-minimal .mat-form-field-infix{padding-right:2px!important}"]
            },] }
];
PopNumberComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: ChangeDetectorRef }
];
PopNumberComponent.propDecorators = {
    config: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLW51bWJlci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9iYXNlL3BvcC1maWVsZC1pdGVtL3BvcC1udW1iZXIvcG9wLW51bWJlci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGlCQUFpQixFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFxQixNQUFNLGVBQWUsQ0FBQztBQUNuRyxPQUFPLEVBQXFCLHVCQUF1QixFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFDakcsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDcEUsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBVXJELE1BQU0sT0FBTyxrQkFBbUIsU0FBUSxxQkFBcUI7SUFLM0QsWUFDUyxFQUFjLEVBQ1gsR0FBc0I7UUFFaEMsS0FBSyxFQUFFLENBQUM7UUFIRCxPQUFFLEdBQUYsRUFBRSxDQUFZO1FBQ1gsUUFBRyxHQUFILEdBQUcsQ0FBbUI7UUFOekIsV0FBTSxHQUFpQixJQUFJLFlBQVksRUFBRSxDQUFDO1FBQzVDLFNBQUksR0FBRyxvQkFBb0IsQ0FBQztRQVNqQzs7V0FFRztRQUNILElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLEdBQXFCLEVBQUU7WUFDMUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO2dCQUU3QixJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsR0FBRyxDQUFDLEtBQTZCLEVBQUUsVUFBVSxHQUFHLEtBQUssRUFBRSxFQUFFO29CQUNsRixJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxDQUFDO29CQUN6QixJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQztnQkFD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b3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDaGFuZ2VEZXRlY3RvclJlZiwgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBJbnB1dCwgT25EZXN0cm95LCBPbkluaXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFBhdHRlcm5WYWxpZGF0aW9uLCBWYWxpZGF0aW9uRXJyb3JNZXNzYWdlcyB9IGZyb20gJy4uLy4uLy4uLy4uL3NlcnZpY2VzL3BvcC12YWxpZGF0b3JzJztcbmltcG9ydCB7IFBvcEZpZWxkSXRlbUNvbXBvbmVudCB9IGZyb20gJy4uL3BvcC1maWVsZC1pdGVtLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBOdW1iZXJDb25maWcgfSBmcm9tICcuL251bWJlci1jb25maWcubW9kZWwnO1xuaW1wb3J0IHsgRmllbGRJdGVtUGF0Y2hJbnRlcmZhY2UgfSBmcm9tICcuLi8uLi8uLi8uLi9wb3AtY29tbW9uLm1vZGVsJztcbmltcG9ydCB7IEZvcm1Db250cm9sIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuXG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2xpYi1wb3AtbnVtYmVyJyxcbiAgdGVtcGxhdGVVcmw6ICcuL3BvcC1udW1iZXIuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsgJy4vcG9wLW51bWJlci5jb21wb25lbnQuc2NzcycgXVxufSlcbmV4cG9ydCBjbGFzcyBQb3BOdW1iZXJDb21wb25lbnQgZXh0ZW5kcyBQb3BGaWVsZEl0ZW1Db21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG4gIEBJbnB1dCgpIGNvbmZpZzogTnVtYmVyQ29uZmlnID0gbmV3IE51bWJlckNvbmZpZygpO1xuICBwdWJsaWMgbmFtZSA9ICdQb3BOdW1iZXJDb21wb25lbnQnO1xuXG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIGVsOiBFbGVtZW50UmVmLFxuICAgIHByb3RlY3RlZCBjZHI6IENoYW5nZURldGVjdG9yUmVmLFxuICApe1xuICAgIHN1cGVyKCk7XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIHNob3VsZCB0cmFuc2Zvcm0gYW5kIHZhbGlkYXRlIHRoZSBkYXRhLiBUaGUgdmlldyBzaG91bGQgdHJ5IHRvIG9ubHkgdXNlIGRhdGEgdGhhdCBpcyBzdG9yZWQgb24gdWkgc28gdGhhdCBpdCBpcyBub3QgZGVwZW5kZW50IG9uIHRoZSBzdHJ1Y3R1cmUgb2YgZGF0YSB0aGF0IGNvbWVzIGZyb20gb3RoZXIgc291cmNlcy4gVGhlIHVpIHNob3VsZCBiZSB0aGUgc291cmNlIG9mIHRydXRoIGhlcmUuXG4gICAgICovXG4gICAgdGhpcy5kb20uY29uZmlndXJlID0gKCk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG5cbiAgICAgICAgdGhpcy5jb25maWcudHJpZ2dlck9uQ2hhbmdlID0gKHZhbHVlOiBzdHJpbmcgfCBudW1iZXIgfCBudWxsLCBmb3JjZVBhdGNoID0gZmFsc2UpID0+IHtcbiAgICAgICAgICB0aGlzLmNkci5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgICAgICAgdGhpcy5vbkNoYW5nZSh2YWx1ZSwgZm9yY2VQYXRjaCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5jb25maWcudHJpZ2dlckRpcmVjdFBhdGNoID0gKHZhbHVlOiBzdHJpbmcgfCBudW1iZXIgfCBudWxsKSA9PiB7XG4gICAgICAgICAgdGhpcy5fb25QYXRjaCh2YWx1ZSwgdHJ1ZSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cblxuICAvKipcbiAgICogVGhpcyBjb21wb25lbnQgc2hvdWxkIGhhdmUgYSBzcGVjaWZpYyBwdXJwb3NlXG4gICAqL1xuICBuZ09uSW5pdCgpe1xuICAgIHN1cGVyLm5nT25Jbml0KCk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUZXN0XG4gICAqIEBwYXJhbSBldmVudFxuICAgKi9cbiAgb25LZXlVcChldmVudCk6IHZvaWR7XG4gICAgaWYoIGV2ZW50LmNvZGUgPT09ICdFbnRlcicgKXtcbiAgICAgIGlmKCB0aGlzLmNvbmZpZy5jb250cm9sLmludmFsaWQgKXtcbiAgICAgICAgaWYoIHRoaXMuY29uZmlnLmRpc3BsYXlFcnJvcnMgKSB0aGlzLl9zZXRNZXNzYWdlKFZhbGlkYXRpb25FcnJvck1lc3NhZ2VzKHRoaXMuY29uZmlnLmNvbnRyb2wuZXJyb3JzKSk7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgaWYoIHRoaXMuY29uZmlnLnBhdGNoICYmICggdGhpcy5jb25maWcucGF0Y2gucGF0aCB8fCB0aGlzLmNvbmZpZy5mYWNhZGUgKSApe1xuICAgICAgICAgIGlmKCB0aGlzLmNvbmZpZy5jb250cm9sLnZhbHVlICE9PSB0aGlzLmFzc2V0LnN0b3JlZFZhbHVlICl7XG4gICAgICAgICAgICBpZiggdGhpcy5faXNGaWVsZFBhdGNoYWJsZSgpICl7XG4gICAgICAgICAgICAgIHRoaXMub25DaGFuZ2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9ZWxzZXtcbiAgICAgIHRoaXMub25CdWJibGVFdmVudCgnb25LZXlVcCcpO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIEhvb2sgdGhhdCBpcyBjYWxsZWQgcmlnaHQgYmVmb3JlIGEgcGF0Y2hcbiAgICovXG4gIHByb3RlY3RlZCBfYmVmb3JlUGF0Y2goKTogUHJvbWlzZTxib29sZWFuPntcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgIGNvbnN0IHBhdGNoID0gPEZpZWxkSXRlbVBhdGNoSW50ZXJmYWNlPnRoaXMuY29uZmlnLnBhdGNoO1xuICAgICAgY29uc3QgY29udHJvbCA9IDxGb3JtQ29udHJvbD50aGlzLmNvbmZpZy5jb250cm9sO1xuXG4gICAgICB0aGlzLl9jaGVja1ZhbHVlKCk7XG5cblxuICAgICAgY29udHJvbC5kaXNhYmxlKCk7XG4gICAgICBwYXRjaC5ydW5uaW5nID0gdHJ1ZTtcblxuICAgICAgcmV0dXJuIHJlc29sdmUodHJ1ZSk7XG4gICAgfSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGUgZG9tIGRlc3Ryb3kgZnVuY3Rpb24gbWFuYWdlcyBhbGwgdGhlIGNsZWFuIHVwIHRoYXQgaXMgbmVjZXNzYXJ5IGlmIHN1YnNjcmlwdGlvbnMsIHRpbWVvdXRzLCBldGMgYXJlIHN0b3JlZCBwcm9wZXJseVxuICAgKi9cbiAgbmdPbkRlc3Ryb3koKXtcbiAgICBzdXBlci5uZ09uRGVzdHJveSgpO1xuICB9XG5cblxuICBwcml2YXRlIF9jaGVja1ZhbHVlKCl7XG4gICAgY29uc3QgY29udHJvbCA9IDxGb3JtQ29udHJvbD50aGlzLmNvbmZpZy5jb250cm9sO1xuICAgIGlmKCBjb250cm9sLnZhbHVlID4gdGhpcy5jb25maWcubWF4ICl7XG4gICAgICBjb250cm9sLnNldFZhbHVlKHRoaXMuY29uZmlnLm1heCwgeyBlbWl0RXZlbnQ6IGZhbHNlIH0pO1xuICAgIH1lbHNlIGlmKCBjb250cm9sLnZhbHVlIDwgdGhpcy5jb25maWcubWluICl7XG4gICAgICBjb250cm9sLnNldFZhbHVlKHRoaXMuY29uZmlnLm1pbiwgeyBlbWl0RXZlbnQ6IGZhbHNlIH0pO1xuICAgIH1cbiAgfVxuXG59XG4iXX0=