import { Component, ElementRef, Input } from '@angular/core';
import { DatePickerConfig } from './datepicker-config.model';
import { PopFieldItemComponent } from '../pop-field-item.component';
import { IsObject } from '../../../../pop-common-utility';
import { PopDate } from '../../../../pop-common.model';
export class PopDatePickerComponent extends PopFieldItemComponent {
    constructor(el) {
        super();
        this.el = el;
        this.config = new DatePickerConfig();
        this.name = 'PopDateComponent';
        /**
         * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
         */
        this.dom.configure = () => {
            return new Promise((resolve) => {
                this.config.max = null;
                this.config.triggerOnChange = (value, forcePatch = false) => {
                    this.dom.setTimeout(`config-trigger-change`, () => {
                        // this.cdr.detectChanges();
                        this.onChange(value, forcePatch);
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
                // this.config.helpText = 'sdfsdafsadf';
                this._setFilter();
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
     * On Change event
     * @param value
     * @param force
     */
    onChange(value, force = false) {
        if (value) {
            value = PopDate.toIso(value);
        }
        else {
            value = null;
        }
        if (IsObject(this.config, ['control'])) {
            this.log.info(`onChange`, value);
            const control = this.config.control;
            if (typeof value !== 'undefined') {
                control.setValue(value);
                control.markAsDirty();
                control.updateValueAndValidity();
            }
            if (this._isChangeValid()) {
                value = typeof value !== 'undefined' ? value : this.config.control.value;
                value = this._applyTransformation(value);
                if (this.config.patch && (this.config.patch.path || this.config.facade)) {
                    this._onPatch(value, force);
                }
                else {
                    this.onBubbleEvent('onChange');
                }
            }
            else {
                // console.log( 'invalid change', this.config.control.value );
            }
        }
    }
    onResetForm() {
        this.dom.setTimeout(`reset-form`, () => {
            this.config.control.setValue(null, { emitEvent: true });
            this.config.control.updateValueAndValidity();
            this.onChange();
        }, 0);
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
    _setFilter() {
        if (typeof this.config.filterPredicate === 'string') {
            switch (String(this.config.filterPredicate).toLowerCase()) {
                case 'weekday':
                    this.config.filterPredicate = (d) => {
                        const day = d.getDay();
                        // Prevent Saturday and Sunday from being selected.
                        return day !== 0 && day !== 6;
                    };
                    break;
                case 'weekday':
                    this.config.filterPredicate = (d) => {
                        const day = d.getDay();
                        // Prevent Saturday and Sunday from being selected.
                        return day >= 1 && day <= 5;
                    };
                    break;
                case 'monday':
                    this.config.filterPredicate = (d) => {
                        const day = d.getDay();
                        // monday
                        return day === 1;
                    };
                    break;
                default:
                    this.config.filterPredicate = null;
                    break;
            }
        }
    }
}
PopDatePickerComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-datepicker',
                template: "<div class=\"import-field-item-container pop-date-container\">\n\n  <mat-form-field appearance=\"outline\" color=\"accent\" class=\"import-field-item-container-expansion\">\n    <mat-label *ngIf=\"config.label\">{{config.label}}</mat-label>\n    <div *ngIf=\"config.tooltip && config.showTooltip\" class=\"field-tooltip-msg\" [innerHTML]=config.tooltip></div>\n    <input\n      type=\"text\"\n      matTooltipClass=\"input-tooltip-background\"\n      matInput\n      [matDatepicker]=\"datePicker\"\n      [readonly]=\"config.disabled\"\n      [min]=config.min\n      [max]=config.max\n      [matDatepickerFilter]=config.filterPredicate\n      [formControl]=config.control\n      (blur)=\"config.showTooltip=false; onBlur();\"\n      (focus)=\"config.showTooltip=true; onFocus();\"\n      (dateChange)=\"onChange($event.value);\"\n      placeholder=\"\"\n    >\n  </mat-form-field>\n  <mat-datepicker #datePicker></mat-datepicker>\n  <mat-icon *ngIf=\"!config.disabled\" class=\"sw-pointer date-clear-icon\" (click)=\"onResetForm();\">clear</mat-icon>\n  <mat-datepicker-toggle class=\"date-toggle-icon\" [for]=\"datePicker\"></mat-datepicker-toggle>\n  <lib-pop-field-item-helper class=\"date-helper-icon\" [hidden]=\"!config.helpText\" [helpText]=config.helpText></lib-pop-field-item-helper>\n\n  <div class=\"date-feedback-container\">\n    <lib-pop-field-item-error class=\"date-error-icon\" [hidden]=\"!config.message\" [message]=\"config.message\"></lib-pop-field-item-error>\n  </div>\n  <lib-pop-field-item-loader [show]=\"config.patch.displayIndicator && config.patch.running\"></lib-pop-field-item-loader>\n</div>\n",
                styles: [".pop-date-container{position:relative;display:block;padding:0;margin:10px 0}.pop-date-container ::ng-deep .mat-form-field-appearance-outline .mat-form-field-subscript-wrapper{display:none}.pop-date-container ::ng-deep .mat-form-field-appearance-outline .mat-form-field-wrapper{padding-bottom:0;margin:0!important}.pop-date-container ::ng-deep .mat-form-field-appearance-outline .mat-form-field-infix{padding:8px 20px 13px 0}.date-feedback-container{position:absolute;top:5px;right:5px;width:20px;bottom:5px;display:flex;padding-top:2px;flex-flow:row;align-items:center;justify-content:center;pointer-events:none}.date-clear-icon{right:42px;top:13px;font-size:1em}.date-clear-icon,.date-toggle-icon{position:absolute!important;width:25px;height:25px;z-index:1}.date-toggle-icon{right:20px;top:8px}.date-toggle-icon ::ng-deep .mat-icon-button{line-height:25px!important}.date-toggle-icon ::ng-deep button{width:25px;height:25px}.date-toggle-icon ::ng-deep button mat-icon{font-size:.9em}.date-error-icon{position:relative;pointer-events:all;left:2px}.date-error-icon ::ng-deep .mat-icon{font-size:1em!important}.date-helper-icon{position:absolute!important;width:25px;height:25px;right:67px;pointer-events:all;font-size:.8em;top:11px}.date-helper-icon ::ng-deep .mat-icon{font-size:.9em!important}.date-ajax-spinner{position:absolute;z-index:1}.field-tooltip-msg{position:absolute;display:block;bottom:50px;width:100%;right:-10px;left:-10px;background:#3d72ea!important;border-radius:.25em;padding:.75em;z-index:2;color:#fff;height:-webkit-fit-content;height:-moz-fit-content;height:fit-content;overflow:hidden;text-align:center}:host ::ng-deep .mat-datepicker-content{position:relative;left:150px!important;border-radius:0!important;height:425px;background:var(--background-base);border:1px solid #d3d3d3!important}"]
            },] }
];
PopDatePickerComponent.ctorParameters = () => [
    { type: ElementRef }
];
PopDatePickerComponent.propDecorators = {
    config: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWRhdGVwaWNrZXIuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvYmFzZS9wb3AtZmllbGQtaXRlbS9wb3AtZGF0ZXBpY2tlci9wb3AtZGF0ZXBpY2tlci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFxQixNQUFNLGVBQWUsQ0FBQztBQUNoRixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUM3RCxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUVwRSxPQUFPLEVBQUUsUUFBUSxFQUFlLE1BQU0sZ0NBQWdDLENBQUM7QUFDdkUsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBUXZELE1BQU0sT0FBTyxzQkFBdUIsU0FBUSxxQkFBcUI7SUFLL0QsWUFDUyxFQUFjO1FBRXJCLEtBQUssRUFBRSxDQUFDO1FBRkQsT0FBRSxHQUFGLEVBQUUsQ0FBWTtRQUxkLFdBQU0sR0FBcUIsSUFBSSxnQkFBZ0IsRUFBRSxDQUFDO1FBQ3BELFNBQUksR0FBRyxrQkFBa0IsQ0FBQztRQVEvQjs7V0FFRztRQUNILElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLEdBQXFCLEVBQUU7WUFDMUMsT0FBTyxJQUFJLE9BQU8sQ0FBRSxDQUFFLE9BQU8sRUFBRyxFQUFFO2dCQUVoQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUM7Z0JBRXZCLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxHQUFHLENBQUUsS0FBNkIsRUFBRSxVQUFVLEdBQUcsS0FBSyxFQUFHLEVBQUU7b0JBQ3BGLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFFLHVCQUF1QixF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bkIsQ0FBQyxDQUFDO29CQUNGLE1BQU07Z0JBQ1I7b0JBQ0UsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO29CQUNuQyxNQUFNO2FBQ1Q7U0FDRjtJQUNILENBQUM7OztZQWxKRixTQUFTLFNBQUU7Z0JBQ1YsUUFBUSxFQUFFLG9CQUFvQjtnQkFDOUIscW1EQUE4Qzs7YUFFL0M7OztZQVptQixVQUFVOzs7cUJBYzNCLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEVsZW1lbnRSZWYsIElucHV0LCBPbkRlc3Ryb3ksIE9uSW5pdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgRGF0ZVBpY2tlckNvbmZpZyB9IGZyb20gJy4vZGF0ZXBpY2tlci1jb25maWcubW9kZWwnO1xuaW1wb3J0IHsgUG9wRmllbGRJdGVtQ29tcG9uZW50IH0gZnJvbSAnLi4vcG9wLWZpZWxkLWl0ZW0uY29tcG9uZW50JztcbmltcG9ydCB7IEZvcm1Db250cm9sIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHsgSXNPYmplY3QsIElzVW5kZWZpbmVkIH0gZnJvbSAnLi4vLi4vLi4vLi4vcG9wLWNvbW1vbi11dGlsaXR5JztcbmltcG9ydCB7IFBvcERhdGUgfSBmcm9tICcuLi8uLi8uLi8uLi9wb3AtY29tbW9uLm1vZGVsJztcblxuXG5AQ29tcG9uZW50KCB7XG4gIHNlbGVjdG9yOiAnbGliLXBvcC1kYXRlcGlja2VyJyxcbiAgdGVtcGxhdGVVcmw6ICcuL3BvcC1kYXRlcGlja2VyLmNvbXBvbmVudC5odG1sJyxcbiAgc3R5bGVVcmxzOiBbICcuL3BvcC1kYXRlcGlja2VyLmNvbXBvbmVudC5zY3NzJyBdXG59IClcbmV4cG9ydCBjbGFzcyBQb3BEYXRlUGlja2VyQ29tcG9uZW50IGV4dGVuZHMgUG9wRmllbGRJdGVtQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xuICBASW5wdXQoKSBjb25maWc6IERhdGVQaWNrZXJDb25maWcgPSBuZXcgRGF0ZVBpY2tlckNvbmZpZygpO1xuICBwdWJsaWMgbmFtZSA9ICdQb3BEYXRlQ29tcG9uZW50JztcblxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBlbDogRWxlbWVudFJlZixcbiAgKXtcbiAgICBzdXBlcigpO1xuXG4gICAgLyoqXG4gICAgICogVGhpcyBzaG91bGQgdHJhbnNmb3JtIGFuZCB2YWxpZGF0ZSB0aGUgZGF0YS4gVGhlIHZpZXcgc2hvdWxkIHRyeSB0byBvbmx5IHVzZSBkYXRhIHRoYXQgaXMgc3RvcmVkIG9uIHVpIHNvIHRoYXQgaXQgaXMgbm90IGRlcGVuZGVudCBvbiB0aGUgc3RydWN0dXJlIG9mIGRhdGEgdGhhdCBjb21lcyBmcm9tIG90aGVyIHNvdXJjZXMuIFRoZSB1aSBzaG91bGQgYmUgdGhlIHNvdXJjZSBvZiB0cnV0aCBoZXJlLlxuICAgICAqL1xuICAgIHRoaXMuZG9tLmNvbmZpZ3VyZSA9ICgpOiBQcm9taXNlPGJvb2xlYW4+ID0+IHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSggKCByZXNvbHZlICkgPT4ge1xuXG4gICAgICAgIHRoaXMuY29uZmlnLm1heCA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5jb25maWcudHJpZ2dlck9uQ2hhbmdlID0gKCB2YWx1ZTogc3RyaW5nIHwgbnVtYmVyIHwgbnVsbCwgZm9yY2VQYXRjaCA9IGZhbHNlICkgPT4ge1xuICAgICAgICAgIHRoaXMuZG9tLnNldFRpbWVvdXQoIGBjb25maWctdHJpZ2dlci1jaGFuZ2VgLCAoKSA9PiB7XG4gICAgICAgICAgICAvLyB0aGlzLmNkci5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgICAgICAgICB0aGlzLm9uQ2hhbmdlKCB2YWx1ZSwgZm9yY2VQYXRjaCApO1xuICAgICAgICAgIH0sIDAgKTtcbiAgICAgICAgfTtcblxuXG4gICAgICAgIHRoaXMuY29uZmlnLmNsZWFyTWVzc2FnZSA9ICgpID0+IHtcbiAgICAgICAgICB0aGlzLmRvbS5zZXRUaW1lb3V0KCBgY29uZmlnLWNsZWFyLW1lc3NhZ2VgLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZy5tZXNzYWdlID0gJyc7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZy5jb250cm9sLm1hcmtBc1ByaXN0aW5lKCk7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZy5jb250cm9sLm1hcmtBc1VudG91Y2hlZCgpO1xuICAgICAgICAgICAgLy8gdGhpcy5jZHIuZGV0ZWN0Q2hhbmdlcygpO1xuICAgICAgICAgIH0sIDAgKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyB0aGlzLmNvbmZpZy5oZWxwVGV4dCA9ICdzZGZzZGFmc2FkZic7XG5cbiAgICAgICAgdGhpcy5fc2V0RmlsdGVyKCk7XG5cbiAgICAgICAgcmV0dXJuIHJlc29sdmUoIHRydWUgKTtcbiAgICAgIH0gKTtcbiAgICB9O1xuICB9XG5cblxuICAvKipcbiAgICogVGhpcyBjb21wb25lbnQgc2hvdWxkIGhhdmUgYSBzcGVjaWZpYyBwdXJwb3NlXG4gICAqL1xuICBuZ09uSW5pdCgpe1xuICAgIHN1cGVyLm5nT25Jbml0KCk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBPbiBDaGFuZ2UgZXZlbnRcbiAgICogQHBhcmFtIHZhbHVlXG4gICAqIEBwYXJhbSBmb3JjZVxuICAgKi9cbiAgb25DaGFuZ2UoIHZhbHVlPzogYW55LCBmb3JjZSA9IGZhbHNlICl7XG4gICAgaWYoIHZhbHVlICl7XG4gICAgICB2YWx1ZSA9IFBvcERhdGUudG9Jc28oIHZhbHVlICk7XG4gICAgfWVsc2V7XG4gICAgICB2YWx1ZSA9IG51bGw7XG4gICAgfVxuICAgIGlmKCBJc09iamVjdCggdGhpcy5jb25maWcsIFsgJ2NvbnRyb2wnIF0gKSApe1xuICAgICAgdGhpcy5sb2cuaW5mbyggYG9uQ2hhbmdlYCwgdmFsdWUgKVxuICAgICAgY29uc3QgY29udHJvbCA9IDxGb3JtQ29udHJvbD50aGlzLmNvbmZpZy5jb250cm9sO1xuICAgICAgaWYoIHR5cGVvZiB2YWx1ZSAhPT0gJ3VuZGVmaW5lZCcgKXtcbiAgICAgICAgY29udHJvbC5zZXRWYWx1ZSggdmFsdWUgKTtcbiAgICAgICAgY29udHJvbC5tYXJrQXNEaXJ0eSgpO1xuICAgICAgICBjb250cm9sLnVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoKTtcbiAgICAgIH1cbiAgICAgIGlmKCB0aGlzLl9pc0NoYW5nZVZhbGlkKCkgKXtcbiAgICAgICAgdmFsdWUgPSB0eXBlb2YgdmFsdWUgIT09ICd1bmRlZmluZWQnID8gdmFsdWUgOiB0aGlzLmNvbmZpZy5jb250cm9sLnZhbHVlO1xuICAgICAgICB2YWx1ZSA9IHRoaXMuX2FwcGx5VHJhbnNmb3JtYXRpb24oIHZhbHVlICk7XG4gICAgICAgIGlmKCB0aGlzLmNvbmZpZy5wYXRjaCAmJiAoIHRoaXMuY29uZmlnLnBhdGNoLnBhdGggfHwgdGhpcy5jb25maWcuZmFjYWRlICkgKXtcbiAgICAgICAgICB0aGlzLl9vblBhdGNoKCB2YWx1ZSwgZm9yY2UgKTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgdGhpcy5vbkJ1YmJsZUV2ZW50KCAnb25DaGFuZ2UnICk7XG4gICAgICAgIH1cbiAgICAgIH1lbHNle1xuICAgICAgICAvLyBjb25zb2xlLmxvZyggJ2ludmFsaWQgY2hhbmdlJywgdGhpcy5jb25maWcuY29udHJvbC52YWx1ZSApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cbiAgb25SZXNldEZvcm0oKTogdm9pZHtcbiAgICB0aGlzLmRvbS5zZXRUaW1lb3V0KCBgcmVzZXQtZm9ybWAsICgpID0+IHtcbiAgICAgIHRoaXMuY29uZmlnLmNvbnRyb2wuc2V0VmFsdWUoIG51bGwsIHsgZW1pdEV2ZW50OiB0cnVlIH0gKTtcbiAgICAgIHRoaXMuY29uZmlnLmNvbnRyb2wudXBkYXRlVmFsdWVBbmRWYWxpZGl0eSgpO1xuICAgICAgdGhpcy5vbkNoYW5nZSgpO1xuICAgIH0sIDAgKTtcblxuICB9XG5cblxuICAvKipcbiAgICogVGhlIGRvbSBkZXN0cm95IGZ1bmN0aW9uIG1hbmFnZXMgYWxsIHRoZSBjbGVhbiB1cCB0aGF0IGlzIG5lY2Vzc2FyeSBpZiBzdWJzY3JpcHRpb25zLCB0aW1lb3V0cywgZXRjIGFyZSBzdG9yZWQgcHJvcGVybHlcbiAgICovXG4gIG5nT25EZXN0cm95KCl7XG4gICAgc3VwZXIubmdPbkRlc3Ryb3koKTtcbiAgfVxuXG5cbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBVbmRlciBUaGUgSG9vZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIFByaXZhdGUgTWV0aG9kICkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiAgcHJvdGVjdGVkIF9zZXRGaWx0ZXIoKTogdm9pZHtcbiAgICBpZiggdHlwZW9mIHRoaXMuY29uZmlnLmZpbHRlclByZWRpY2F0ZSA9PT0gJ3N0cmluZycgKXtcbiAgICAgIHN3aXRjaCggU3RyaW5nKCB0aGlzLmNvbmZpZy5maWx0ZXJQcmVkaWNhdGUgKS50b0xvd2VyQ2FzZSgpICl7XG4gICAgICAgIGNhc2UgJ3dlZWtkYXknOlxuICAgICAgICAgIHRoaXMuY29uZmlnLmZpbHRlclByZWRpY2F0ZSA9ICggZDogRGF0ZSApOiBib29sZWFuID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGRheSA9IGQuZ2V0RGF5KCk7XG4gICAgICAgICAgICAvLyBQcmV2ZW50IFNhdHVyZGF5IGFuZCBTdW5kYXkgZnJvbSBiZWluZyBzZWxlY3RlZC5cbiAgICAgICAgICAgIHJldHVybiBkYXkgIT09IDAgJiYgZGF5ICE9PSA2O1xuICAgICAgICAgIH07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3dlZWtkYXknOlxuICAgICAgICAgIHRoaXMuY29uZmlnLmZpbHRlclByZWRpY2F0ZSA9ICggZDogRGF0ZSApOiBib29sZWFuID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGRheSA9IGQuZ2V0RGF5KCk7XG4gICAgICAgICAgICAvLyBQcmV2ZW50IFNhdHVyZGF5IGFuZCBTdW5kYXkgZnJvbSBiZWluZyBzZWxlY3RlZC5cbiAgICAgICAgICAgIHJldHVybiBkYXkgPj0gMSAmJiBkYXkgPD0gNTtcbiAgICAgICAgICB9O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdtb25kYXknOlxuICAgICAgICAgIHRoaXMuY29uZmlnLmZpbHRlclByZWRpY2F0ZSA9ICggZDogRGF0ZSApOiBib29sZWFuID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGRheSA9IGQuZ2V0RGF5KCk7XG4gICAgICAgICAgICAvLyBtb25kYXlcbiAgICAgICAgICAgIHJldHVybiBkYXkgPT09IDE7XG4gICAgICAgICAgfTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICB0aGlzLmNvbmZpZy5maWx0ZXJQcmVkaWNhdGUgPSBudWxsO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG59XG4iXX0=