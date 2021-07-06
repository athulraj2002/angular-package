import { Component, ElementRef, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { PopFieldItemComponent } from '../../pop-field-item.component';
import { PopDate } from '../../../../../pop-common.model';
import { IsObject } from '../../../../../pop-common-utility';
import { DateRangeExpansionItemsComponent } from './expansion-items/date-range-expansion-items.component';
import { DateRangeConfig } from './date-range-config.models';
import { ValidationErrorMessages } from '../../../../../services/pop-validators';
import { OverlayContainer } from '@angular/cdk/overlay';
export class PopDateRangeComponent extends PopFieldItemComponent {
    constructor(el, overlayContainer) {
        super();
        this.el = el;
        this.overlayContainer = overlayContainer;
        this.config = new DateRangeConfig();
        this.apply = new EventEmitter();
        this.ExpansionItems = DateRangeExpansionItemsComponent;
        this.name = 'PopDateRangeComponent';
        /**
         * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
         */
        this.dom.configure = () => {
            return new Promise((resolve) => {
                this.config.triggerOnChange = (value, forcePatch = false) => {
                    this.dom.setTimeout(`config-trigger-change`, () => {
                        // this.cdr.detectChanges();
                        this.onChange('start', value.start, forcePatch);
                        this.onChange('end', value.end, forcePatch);
                    }, 0);
                };
                this.config.clearMessage = () => {
                    this.dom.setTimeout(`config-clear-message`, () => {
                        this.config.message = '';
                        this.config.formGroup.get('start').markAsPristine();
                        this.config.formGroup.get('start').markAsPristine();
                        this.config.formGroup.get('end').markAsPristine();
                        this.config.formGroup.get('end').markAsPristine();
                        // this.cdr.detectChanges();
                    }, 0);
                };
                this._setFilter();
                return resolve(true);
            });
        };
    }
    /**
     * On init hook
     */
    ngOnInit() {
        super.ngOnInit();
        if (this.config.type === 'Basic') {
            this.ExpansionItems = null;
        }
    }
    /**
     * After view init hook
     *  Backup picker close method
     */
    ngAfterViewInit() {
        this.selfClose = this.picker.close;
    }
    /**
     * Get the date control name for start or end
     * @param type: start or end
     */
    getDateControlName(type) {
        if (type === 'start')
            return Object.keys(this.config.formGroup.controls)[0];
        else if (type === 'end')
            return Object.keys(this.config.formGroup.controls)[1];
    }
    /**
     * on Open Event
     * Overwrite picker close to prevent auto closing
     */
    onOpen() {
        const olcClasses = this.overlayContainer.getContainerElement().classList;
        if (this.config.type === 'Expanded') {
            this.picker.close = () => { };
            olcClasses.add('expanded');
        }
        else {
            this.removeExpandedClass();
        }
    }
    /**
     * Removes Expanded Class from the Overlay Container if needed
     */
    removeExpandedClass() {
        const olcClasses = this.overlayContainer.getContainerElement().classList;
        if (olcClasses.contains('expanded')) {
            setTimeout(() => olcClasses.remove('expanded'), 100);
        }
    }
    /**
     * Determine where the click happened. Return picker close to original state
     * @param $click
     */
    onOutsideCLick($click) {
        let isDatepickerAreaClick = $click.path.some(path => {
            if (path.className) {
                return path.className.includes('mat-datepicker');
            }
        });
        if (isDatepickerAreaClick) {
            const r = $click.path.some(path => {
                if (path.className) {
                    return path.className.includes('mat-overlay');
                }
            });
            if (r) {
                isDatepickerAreaClick = false;
            }
        }
        const isDatepickerCancel = $click.path.some(ele => {
            if (ele.id) {
                return ele.id.includes('datepicker-cancel');
            }
        });
        const isDatepickerApply = $click.path.some(ele => {
            if (ele.id) {
                return ele.id.includes('datepicker-apply');
            }
        });
        if (isDatepickerCancel || isDatepickerApply) {
            this.onChange('start');
            this.onChange('end');
            this.picker.close = this.selfClose;
            this.picker.close();
            this.removeExpandedClass();
            if (isDatepickerApply) {
                this.apply.emit({ start: this.config.formGroup.get('start').value, end: this.config.formGroup.get('end').value });
            }
        }
        else if (!isDatepickerAreaClick) {
            this.picker.close = this.selfClose;
            this.picker.close();
            this.removeExpandedClass();
        }
    }
    /**
     * On Change event
     * @param controlName
     * @param value
     * @param force
     */
    onChange(controlName, value, force = false) {
        value = this.config.formGroup.get(this.getDateControlName(controlName)).value;
        if (value) {
            value = PopDate.toIso(value);
        }
        else {
            value = null;
        }
        if (IsObject(this.config, ['formGroup'])) {
            this.log.info(`onChange`, value);
            const control = this.config.formGroup.get(controlName);
            if (typeof value !== 'undefined') {
                control.setValue(value);
                control.markAsDirty();
                control.updateValueAndValidity();
            }
            if (this.isChangeValid(controlName)) {
                value = typeof value !== 'undefined' ? value : this.config.formGroup.get(this.getDateControlName(controlName)).value;
                value = this._applyTransformation(value);
                if (this.config.patch && (this.config.patch.path || this.config.facade)) {
                    this._onPatch(value, force);
                }
                else {
                    this.onBubbleEvent('onChange');
                }
            }
            else {
            }
        }
    }
    /**
     * Check to see if change is valid
     * @param controlName: start or end
     * @protected
     */
    isChangeValid(controlName) {
        const control = this.config.formGroup.get(this.getDateControlName(controlName)).value;
        if (control) {
            if (control.invalid) {
                if (this.config.displayErrors)
                    this._setMessage(ValidationErrorMessages(control.errors));
                return false;
            }
        }
        return this._checkPrevent();
    }
    /**
     * Reset Form event
     */
    onResetForm() {
        this.dom.setTimeout(`reset-form`, () => {
            this.config.formGroup.get('start').setValue(null, { emitEvent: true });
            this.config.formGroup.get('start').updateValueAndValidity();
            this.config.formGroup.get('end').setValue(null, { emitEvent: true });
            this.config.formGroup.get('end').updateValueAndValidity();
            this.onChange('start');
            this.apply.emit({ start: null, end: null });
        }, 0);
    }
    ngOnDestroy() {
        super.ngOnDestroy();
        this.removeExpandedClass();
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
PopDateRangeComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-date-range',
                template: "<div\n  class=\"import-field-item-container pop-date-container\"\n  [ngClass]=\"{'disabled': config.disabled, 'ng-invalid': this.config.formGroup.status === 'INVALID' }\"\n  (libClickOutside)=\"onOutsideCLick($event);\">\n  <mat-form-field   appearance=\"outline\" color=\"accent\" class=\"import-field-item-container-expansion\">\n    <mat-label *ngIf=\"config?.label\">{{config?.label}}</mat-label>\n    <div *ngIf=\"config.tooltip && config.showTooltip\" class=\"field-tooltip-msg\" [innerHTML]=config.tooltip></div>\n\n    <mat-date-range-input\n      [ngClass]=\"{'disabled': config.disabled}\"\n      [rangePicker]=\"dateRangePicker\"\n      [formGroup]=\"config.formGroup\"\n      [min]=config.min\n      [max]=config.max\n      matTooltipClass=\"input-tooltip-background\"\n      (change)=\"onChange('start')\"\n    >\n      <input\n        matStartDate\n        [formControlName]=\"getDateControlName('start')\"\n        [readonly]=\"config.disabled\"\n        (focus)=\"config.showTooltip=true; onFocus();\"\n        (blur)=\"config.showTooltip=false; onBlur();\"\n        placeholder=\"\"\n         >\n      <input\n        type=\"text\"\n        matEndDate\n        [formControlName]=\"getDateControlName('end')\"\n        (focus)=\"config.showTooltip=true; onFocus();\"\n        (blur)=\"config.showTooltip=false; onBlur();\"\n        [readonly]=\"config.disabled\"\n\n        placeholder=\"\"\n        >\n    </mat-date-range-input>\n    <mat-icon *ngIf=\"!config.disabled\" class=\"sw-pointer date-clear-icon\" (click)=\"onResetForm();\">clear</mat-icon>\n    <mat-date-range-picker #dateRangePicker [ngClass]=\"{'expanded': config?.type === 'Expanded' }\" [calendarHeaderComponent]=\"ExpansionItems\" (opened)=\"onOpen()\"    ></mat-date-range-picker>\n    <lib-pop-field-item-helper class=\"date-helper-icon\" [hidden]=\"!config.helpText\" [helpText]=config.helpText></lib-pop-field-item-helper>\n\n\n    <mat-datepicker-toggle  class=\"date-toggle-icon\"  [for]=\"dateRangePicker\" [disabled]=\"config.disabled\" ></mat-datepicker-toggle>\n    <div class=\"date-feedback-container\">\n      <lib-pop-field-item-error class=\"date-error-icon\" [hidden]=\"!config.message\" [message]=\"config.message\"></lib-pop-field-item-error>\n    </div>\n    <lib-pop-field-item-loader [show]=\"config.patch.displayIndicator && config.patch.running\"></lib-pop-field-item-loader>\n  </mat-form-field>\n</div>\n\n\n",
                styles: [".disabled,div.disabled ::ng-deep .mat-date-range-input-inner,div.disabled ::ng-deep div.mat-date-range-input-inner mat-datepicker-toggle,div.disabled mat-datepicker-toggle,div.disabled mat-datepicker-toggle ::ng-deep .mat-icon-button,div.disabled mat-datepicker-toggle ::ng-deep div.mat-icon-button ::ng-deep .mat-date-range-input-inner,div.disabled mat-datepicker-toggle ::ng-deep div.mat-icon-button mat-datepicker-toggle{cursor:not-allowed!important;color:var(--foreground-disabled)!important}div.disabled ::ng-deep .mat-form-field-appearance-outline .mat-form-field-outline{color:var(--background-border)}div.ng-invalid ::ng-deep .mat-form-field-appearance-outline .mat-form-field-outline{color:red}.pop-date-container{position:relative;display:block;padding:0;margin:var(--gap-s) 0}.pop-date-container ::ng-deep .mat-form-field-appearance-outline .mat-form-field-subscript-wrapper{display:none}.pop-date-container ::ng-deep .mat-form-field-appearance-outline .mat-form-field-wrapper{padding-bottom:0;margin:0!important}.date-feedback-container{position:absolute;top:var(--gap=xxs);right:var(--gap=xxs);width:var(--gap-m);bottom:var(--gap=xxs);display:flex;padding-top:2px;flex-flow:row;align-items:center;justify-content:center;pointer-events:none}.date-clear-icon{right:31px;top:6px}.date-clear-icon,.date-toggle-icon{position:absolute!important;width:25px;height:25px;z-index:1;font-size:16px}.date-toggle-icon{right:10px;top:0}.date-toggle-icon ::ng-deep .mat-icon-button{line-height:25px!important}.date-toggle-icon ::ng-deep button{width:25px;height:25px}.date-toggle-icon ::ng-deep button mat-icon{font-size:.9em}.date-error-icon{position:relative;pointer-events:all;left:2px}.date-error-icon ::ng-deep .mat-icon{font-size:1em!important}.date-helper-icon{position:absolute!important;width:25px;height:25px;right:55px;pointer-events:all;font-size:12px;top:5px}.date-helper-icon ::ng-deep .mat-icon{font-size:16px!important}.date-ajax-spinner{position:absolute;z-index:1}.field-tooltip-msg{position:absolute;display:block;bottom:50px;width:100%;right:-10px;left:-10px;background:#3d72ea!important;border-radius:.25em;padding:.75em;z-index:2;color:#fff;height:-webkit-fit-content;height:-moz-fit-content;height:fit-content;overflow:hidden;text-align:center}::ng-deep .expanded .mat-datepicker-content{position:relative;left:200px;border-radius:0!important;height:425px;background:var(--background-base);border-top:1px solid #d3d3d3;border-right:1px solid #d3d3d3;border-bottom:1px solid #d3d3d3}::ng-deep .mat-datepicker-content{background:var(--background-base);border:1px solid #d3d3d3}"]
            },] }
];
PopDateRangeComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: OverlayContainer }
];
PopDateRangeComponent.propDecorators = {
    config: [{ type: Input }],
    apply: [{ type: Output }],
    picker: [{ type: ViewChild, args: ['dateRangePicker',] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWRhdGUtcmFuZ2UuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvYmFzZS9wb3AtZmllbGQtaXRlbS9wb3AtZGF0ZS9wb3AtZGF0ZS1yYW5nZS9wb3AtZGF0ZS1yYW5nZS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFDLE1BQU0sRUFBRSxZQUFZLEVBQXFCLFNBQVMsRUFBZ0IsTUFBTSxlQUFlLENBQUM7QUFFOUgsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDdkUsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQzFELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQztBQUU3RCxPQUFPLEVBQUUsZ0NBQWdDLEVBQUUsTUFBTSx3REFBd0QsQ0FBQztBQUMxRyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDN0QsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFDakYsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFPeEQsTUFBTSxPQUFPLHFCQUFzQixTQUFRLHFCQUFxQjtJQVU5RCxZQUFtQixFQUFjLEVBQVcsZ0JBQWtDO1FBQzVFLEtBQUssRUFBRSxDQUFDO1FBRFMsT0FBRSxHQUFGLEVBQUUsQ0FBWTtRQUFXLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFSckUsV0FBTSxHQUFvQixJQUFJLGVBQWUsRUFBRSxDQUFDO1FBQy9DLFVBQUssR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFDO1FBQ3JDLG1CQUFjLEdBQUksZ0NBQWdDLENBQUM7UUFHNUMsU0FBSSxHQUFHLHVC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QUFTO29CQUNaLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxHQUFHLENBQUUsQ0FBTyxFQUFZLEVBQUU7d0JBQ25ELE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQzt3QkFDdkIsbURBQW1EO3dCQUNuRCxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQztvQkFDOUIsQ0FBQyxDQUFDO29CQUNGLE1BQU07Z0JBQ1IsS0FBSyxRQUFRO29CQUNYLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxHQUFHLENBQUUsQ0FBTyxFQUFZLEVBQUU7d0JBQ25ELE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQzt3QkFDdkIsU0FBUzt3QkFDVCxPQUFPLEdBQUcsS0FBSyxDQUFDLENBQUM7b0JBQ25CLENBQUMsQ0FBQztvQkFDRixNQUFNO2dCQUNSO29CQUNFLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQztvQkFDbkMsTUFBTTthQUNUO1NBQ0Y7SUFDSCxDQUFDOzs7WUE5UkYsU0FBUyxTQUFFO2dCQUNWLFFBQVEsRUFBRSxvQkFBb0I7Z0JBQzlCLCszRUFBNEM7O2FBRTdDOzs7WUFmbUIsVUFBVTtZQVNyQixnQkFBZ0I7OztxQkFTdEIsS0FBSztvQkFDTCxNQUFNO3FCQUVOLFNBQVMsU0FBQyxpQkFBaUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEVsZW1lbnRSZWYsIElucHV0LE91dHB1dCwgRXZlbnRFbWl0dGVyLCBPbkRlc3Ryb3ksIE9uSW5pdCwgVmlld0NoaWxkLCBBZnRlclZpZXdJbml0fSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE1hdERhdGVSYW5nZVBpY2tlciB9IGZyb20gXCJAYW5ndWxhci9tYXRlcmlhbC9kYXRlcGlja2VyXCI7XG5pbXBvcnQgeyBQb3BGaWVsZEl0ZW1Db21wb25lbnQgfSBmcm9tICcuLi8uLi9wb3AtZmllbGQtaXRlbS5jb21wb25lbnQnO1xuaW1wb3J0IHsgUG9wRGF0ZSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3BvcC1jb21tb24ubW9kZWwnO1xuaW1wb3J0IHsgSXNPYmplY3QgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9wb3AtY29tbW9uLXV0aWxpdHknO1xuaW1wb3J0IHsgRm9ybUNvbnRyb2wgfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5pbXBvcnQgeyBEYXRlUmFuZ2VFeHBhbnNpb25JdGVtc0NvbXBvbmVudCB9IGZyb20gJy4vZXhwYW5zaW9uLWl0ZW1zL2RhdGUtcmFuZ2UtZXhwYW5zaW9uLWl0ZW1zLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBEYXRlUmFuZ2VDb25maWcgfSBmcm9tICcuL2RhdGUtcmFuZ2UtY29uZmlnLm1vZGVscyc7XG5pbXBvcnQgeyBWYWxpZGF0aW9uRXJyb3JNZXNzYWdlcyB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3NlcnZpY2VzL3BvcC12YWxpZGF0b3JzJztcbmltcG9ydCB7IE92ZXJsYXlDb250YWluZXIgfSBmcm9tICdAYW5ndWxhci9jZGsvb3ZlcmxheSc7XG5cbkBDb21wb25lbnQoIHtcbiAgc2VsZWN0b3I6ICdsaWItcG9wLWRhdGUtcmFuZ2UnLFxuICB0ZW1wbGF0ZVVybDogJ3BvcC1kYXRlLXJhbmdlLmNvbXBvbmVudC5odG1sJyxcbiAgc3R5bGVVcmxzOiBbICdwb3AtZGF0ZS1yYW5nZS5jb21wb25lbnQuc2NzcycgXVxufSApXG5leHBvcnQgY2xhc3MgUG9wRGF0ZVJhbmdlQ29tcG9uZW50IGV4dGVuZHMgUG9wRmllbGRJdGVtQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3ksIEFmdGVyVmlld0luaXQge1xuXG4gIEBJbnB1dCgpIGNvbmZpZzogRGF0ZVJhbmdlQ29uZmlnID0gbmV3IERhdGVSYW5nZUNvbmZpZygpO1xuICBAT3V0cHV0KCkgYXBwbHkgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIEV4cGFuc2lvbkl0ZW1zID0gIERhdGVSYW5nZUV4cGFuc2lvbkl0ZW1zQ29tcG9uZW50O1xuICBAVmlld0NoaWxkKCdkYXRlUmFuZ2VQaWNrZXInKSBwaWNrZXI6IE1hdERhdGVSYW5nZVBpY2tlcjxhbnk+O1xuXG4gIHB1YmxpYyBuYW1lID0gJ1BvcERhdGVSYW5nZUNvbXBvbmVudCc7XG4gIHByaXZhdGUgc2VsZkNsb3NlOiAoKSA9PiB2b2lkO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBlbDogRWxlbWVudFJlZiwgIHByaXZhdGUgb3ZlcmxheUNvbnRhaW5lcjogT3ZlcmxheUNvbnRhaW5lcil7XG4gICAgc3VwZXIoKTtcblxuICAgIC8qKlxuICAgICAqIFRoaXMgc2hvdWxkIHRyYW5zZm9ybSBhbmQgdmFsaWRhdGUgdGhlIGRhdGEuIFRoZSB2aWV3IHNob3VsZCB0cnkgdG8gb25seSB1c2UgZGF0YSB0aGF0IGlzIHN0b3JlZCBvbiB1aSBzbyB0aGF0IGl0IGlzIG5vdCBkZXBlbmRlbnQgb24gdGhlIHN0cnVjdHVyZSBvZiBkYXRhIHRoYXQgY29tZXMgZnJvbSBvdGhlciBzb3VyY2VzLiBUaGUgdWkgc2hvdWxkIGJlIHRoZSBzb3VyY2Ugb2YgdHJ1dGggaGVyZS5cbiAgICAgKi9cbiAgICB0aGlzLmRvbS5jb25maWd1cmUgPSAoKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoICggcmVzb2x2ZSApID0+IHtcblxuICAgICAgICB0aGlzLmNvbmZpZy50cmlnZ2VyT25DaGFuZ2UgPSAoIHZhbHVlOiB7c3RhcnQ6IHN0cmluZyB8IG51bWJlciB8IG51bGwsIGVuZDogIHN0cmluZyB8IG51bWJlciB8IG51bGx9LCBmb3JjZVBhdGNoID0gZmFsc2UgKSA9PiB7XG4gICAgICAgICAgdGhpcy5kb20uc2V0VGltZW91dCggYGNvbmZpZy10cmlnZ2VyLWNoYW5nZWAsICgpID0+IHtcbiAgICAgICAgICAgIC8vIHRoaXMuY2RyLmRldGVjdENoYW5nZXMoKTtcbiAgICAgICAgICAgIHRoaXMub25DaGFuZ2UoICdzdGFydCcsdmFsdWUuc3RhcnQsIGZvcmNlUGF0Y2ggKTtcbiAgICAgICAgICAgIHRoaXMub25DaGFuZ2UoICdlbmQnLHZhbHVlLmVuZCwgZm9yY2VQYXRjaCApO1xuICAgICAgICAgIH0sIDAgKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmNvbmZpZy5jbGVhck1lc3NhZ2UgPSAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5kb20uc2V0VGltZW91dCggYGNvbmZpZy1jbGVhci1tZXNzYWdlYCwgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5jb25maWcubWVzc2FnZSA9ICcnO1xuICAgICAgICAgICAgdGhpcy5jb25maWcuZm9ybUdyb3VwLmdldCgnc3RhcnQnKS5tYXJrQXNQcmlzdGluZSgpO1xuICAgICAgICAgICAgdGhpcy5jb25maWcuZm9ybUdyb3VwLmdldCgnc3RhcnQnKS5tYXJrQXNQcmlzdGluZSgpO1xuICAgICAgICAgICAgdGhpcy5jb25maWcuZm9ybUdyb3VwLmdldCgnZW5kJykubWFya0FzUHJpc3RpbmUoKTtcbiAgICAgICAgICAgIHRoaXMuY29uZmlnLmZvcm1Hcm91cC5nZXQoJ2VuZCcpLm1hcmtBc1ByaXN0aW5lKCk7XG4gICAgICAgICAgICAvLyB0aGlzLmNkci5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgICAgICAgfSwgMCApO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuX3NldEZpbHRlcigpO1xuXG4gICAgICAgIHJldHVybiByZXNvbHZlKCB0cnVlICk7XG4gICAgICB9ICk7XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPbiBpbml0IGhvb2tcbiAgICovXG4gIG5nT25Jbml0KCl7XG4gICAgc3VwZXIubmdPbkluaXQoKTtcbiAgICBpZih0aGlzLmNvbmZpZy50eXBlID09PSAnQmFzaWMnKXtcbiAgICAgIHRoaXMuRXhwYW5zaW9uSXRlbXMgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBZnRlciB2aWV3IGluaXQgaG9va1xuICAgKiAgQmFja3VwIHBpY2tlciBjbG9zZSBtZXRob2RcbiAgICovXG5cbiAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgIHRoaXMuc2VsZkNsb3NlID0gdGhpcy5waWNrZXIuY2xvc2U7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGRhdGUgY29udHJvbCBuYW1lIGZvciBzdGFydCBvciBlbmRcbiAgICogQHBhcmFtIHR5cGU6IHN0YXJ0IG9yIGVuZFxuICAgKi9cblxuICBnZXREYXRlQ29udHJvbE5hbWUodHlwZTogJ3N0YXJ0JyB8ICdlbmQnKXtcbiAgICBpZih0eXBlID09PSAnc3RhcnQnKSByZXR1cm4gT2JqZWN0LmtleXModGhpcy5jb25maWcuZm9ybUdyb3VwLmNvbnRyb2xzKVswXTtcbiAgICBlbHNlIGlmKHR5cGUgPT09ICdlbmQnKSByZXR1cm4gT2JqZWN0LmtleXModGhpcy5jb25maWcuZm9ybUdyb3VwLmNvbnRyb2xzKVsxXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBvbiBPcGVuIEV2ZW50XG4gICAqIE92ZXJ3cml0ZSBwaWNrZXIgY2xvc2UgdG8gcHJldmVudCBhdXRvIGNsb3NpbmdcbiAgICovXG5cbiAgcHVibGljIG9uT3BlbigpIHtcblxuICAgIGNvbnN0IG9sY0NsYXNzZXMgPXRoaXMub3ZlcmxheUNvbnRhaW5lci5nZXRDb250YWluZXJFbGVtZW50KCkuY2xhc3NMaXN0O1xuXG4gICAgaWYodGhpcy5jb25maWcudHlwZSA9PT0gJ0V4cGFuZGVkJyl7XG4gICAgICB0aGlzLnBpY2tlci5jbG9zZSA9ICgpID0+IHt9O1xuXG4gICAgICBvbGNDbGFzc2VzLmFkZCgnZXhwYW5kZWQnKTtcblxuXG4gICAgfWVsc2V7XG4gICAgICB0aGlzLnJlbW92ZUV4cGFuZGVkQ2xhc3MoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyBFeHBhbmRlZCBDbGFzcyBmcm9tIHRoZSBPdmVybGF5IENvbnRhaW5lciBpZiBuZWVkZWRcbiAgICovXG4gIHJlbW92ZUV4cGFuZGVkQ2xhc3MoKXtcbiAgICBjb25zdCBvbGNDbGFzc2VzID10aGlzLm92ZXJsYXlDb250YWluZXIuZ2V0Q29udGFpbmVyRWxlbWVudCgpLmNsYXNzTGlzdDtcbiAgICBpZiAob2xjQ2xhc3Nlcy5jb250YWlucygnZXhwYW5kZWQnKSkge1xuICAgICAgc2V0VGltZW91dCggKCkgPT4gIG9sY0NsYXNzZXMucmVtb3ZlKCdleHBhbmRlZCcpLCAxMDApO1xuXG4gICAgfVxuXG4gIH1cblxuICAvKipcbiAgICogRGV0ZXJtaW5lIHdoZXJlIHRoZSBjbGljayBoYXBwZW5lZC4gUmV0dXJuIHBpY2tlciBjbG9zZSB0byBvcmlnaW5hbCBzdGF0ZVxuICAgKiBAcGFyYW0gJGNsaWNrXG4gICAqL1xuXG5cbiAgb25PdXRzaWRlQ0xpY2soJGNsaWNrKXtcbiAgICBsZXQgaXNEYXRlcGlja2VyQXJlYUNsaWNrID0gJGNsaWNrLnBhdGguc29tZSggcGF0aCA9PiB7XG4gICAgICBpZihwYXRoLmNsYXNzTmFtZSl7XG4gICAgICAgIHJldHVybiBwYXRoLmNsYXNzTmFtZS5pbmNsdWRlcygnbWF0LWRhdGVwaWNrZXInKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmKGlzRGF0ZXBpY2tlckFyZWFDbGljayl7XG4gICAgICBjb25zdCByID0gJGNsaWNrLnBhdGguc29tZSggcGF0aCA9PiB7XG4gICAgICAgIGlmKHBhdGguY2xhc3NOYW1lKXtcbiAgICAgICAgICByZXR1cm4gcGF0aC5jbGFzc05hbWUuaW5jbHVkZXMoJ21hdC1vdmVybGF5Jyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBpZihyKXtcbiAgICAgICAgaXNEYXRlcGlja2VyQXJlYUNsaWNrID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgaXNEYXRlcGlja2VyQ2FuY2VsID0gJGNsaWNrLnBhdGguc29tZSggZWxlID0+e1xuICAgICAgaWYoZWxlLmlkKXtcbiAgICAgICAgcmV0dXJuIGVsZS5pZC5pbmNsdWRlcygnZGF0ZXBpY2tlci1jYW5jZWwnKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGNvbnN0IGlzRGF0ZXBpY2tlckFwcGx5ID0gJGNsaWNrLnBhdGguc29tZSggZWxlID0+e1xuICAgICAgaWYoZWxlLmlkKXtcbiAgICAgICAgcmV0dXJuIGVsZS5pZC5pbmNsdWRlcygnZGF0ZXBpY2tlci1hcHBseScpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYoaXNEYXRlcGlja2VyQ2FuY2VsIHx8IGlzRGF0ZXBpY2tlckFwcGx5KXtcbiAgICAgIHRoaXMub25DaGFuZ2UoJ3N0YXJ0Jyk7XG4gICAgICB0aGlzLm9uQ2hhbmdlKCdlbmQnKTtcbiAgICAgIHRoaXMucGlja2VyLmNsb3NlID0gdGhpcy5zZWxmQ2xvc2U7XG4gICAgICB0aGlzLnBpY2tlci5jbG9zZSgpO1xuICAgICAgdGhpcy5yZW1vdmVFeHBhbmRlZENsYXNzKCk7XG5cbiAgICAgIGlmKGlzRGF0ZXBpY2tlckFwcGx5KXtcbiAgICAgICAgdGhpcy5hcHBseS5lbWl0KHtzdGFydDogdGhpcy5jb25maWcuZm9ybUdyb3VwLmdldCgnc3RhcnQnKS52YWx1ZSwgZW5kOiB0aGlzLmNvbmZpZy5mb3JtR3JvdXAuZ2V0KCdlbmQnKS52YWx1ZX0pO1xuICAgICAgfVxuICAgIH1lbHNlIGlmKCFpc0RhdGVwaWNrZXJBcmVhQ2xpY2spe1xuICAgICAgdGhpcy5waWNrZXIuY2xvc2UgPSB0aGlzLnNlbGZDbG9zZTtcbiAgICAgIHRoaXMucGlja2VyLmNsb3NlKCk7XG4gICAgICB0aGlzLnJlbW92ZUV4cGFuZGVkQ2xhc3MoKTtcbiAgICB9XG5cblxuICB9XG5cbiAgLyoqXG4gICAqIE9uIENoYW5nZSBldmVudFxuICAgKiBAcGFyYW0gY29udHJvbE5hbWVcbiAgICogQHBhcmFtIHZhbHVlXG4gICAqIEBwYXJhbSBmb3JjZVxuICAgKi9cbiAgb25DaGFuZ2UoICBjb250cm9sTmFtZTogJ3N0YXJ0JyB8ICdlbmQnLCAgdmFsdWU/OiBhbnksICBmb3JjZSA9IGZhbHNlLCApe1xuXG4gICB2YWx1ZSA9IHRoaXMuY29uZmlnLmZvcm1Hcm91cC5nZXQodGhpcy5nZXREYXRlQ29udHJvbE5hbWUoY29udHJvbE5hbWUpKS52YWx1ZTtcblxuICAgIGlmKCB2YWx1ZSApe1xuICAgICAgdmFsdWUgPSBQb3BEYXRlLnRvSXNvKCB2YWx1ZSApO1xuICAgIH1lbHNle1xuICAgICAgdmFsdWUgPSBudWxsO1xuICAgIH1cblxuICAgIGlmKCBJc09iamVjdCggdGhpcy5jb25maWcsIFsgJ2Zvcm1Hcm91cCcgXSApICl7XG4gICAgICB0aGlzLmxvZy5pbmZvKCBgb25DaGFuZ2VgLCB2YWx1ZSApO1xuXG5cbiAgICAgIGNvbnN0IGNvbnRyb2wgPSA8Rm9ybUNvbnRyb2w+dGhpcy5jb25maWcuZm9ybUdyb3VwLmdldChjb250cm9sTmFtZSk7XG4gICAgICBpZiggdHlwZW9mIHZhbHVlICE9PSAndW5kZWZpbmVkJyApe1xuICAgICAgICAgY29udHJvbC5zZXRWYWx1ZSggdmFsdWUgKTtcbiAgICAgICAgIGNvbnRyb2wubWFya0FzRGlydHkoKTtcbiAgICAgICAgIGNvbnRyb2wudXBkYXRlVmFsdWVBbmRWYWxpZGl0eSgpO1xuICAgICAgfVxuICAgICAgaWYoIHRoaXMuaXNDaGFuZ2VWYWxpZChjb250cm9sTmFtZSkgKXtcbiAgICAgICAgIHZhbHVlID0gdHlwZW9mIHZhbHVlICE9PSAndW5kZWZpbmVkJyA/IHZhbHVlIDogdGhpcy5jb25maWcuZm9ybUdyb3VwLmdldCh0aGlzLmdldERhdGVDb250cm9sTmFtZShjb250cm9sTmFtZSkpLnZhbHVlO1xuICAgICAgICAgdmFsdWUgPSB0aGlzLl9hcHBseVRyYW5zZm9ybWF0aW9uKCB2YWx1ZSApO1xuICAgICAgICAgaWYoIHRoaXMuY29uZmlnLnBhdGNoICYmICggdGhpcy5jb25maWcucGF0Y2gucGF0aCB8fCB0aGlzLmNvbmZpZy5mYWNhZGUgKSApe1xuICAgICAgICAgICB0aGlzLl9vblBhdGNoKCB2YWx1ZSwgZm9yY2UgKTtcbiAgICAgICAgIH1lbHNle1xuICAgICAgICAgICB0aGlzLm9uQnViYmxlRXZlbnQoICdvbkNoYW5nZScgKTtcbiAgICAgICAgIH1cbiAgICAgICB9ZWxzZXtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBDaGVjayB0byBzZWUgaWYgY2hhbmdlIGlzIHZhbGlkXG4gICAqIEBwYXJhbSBjb250cm9sTmFtZTogc3RhcnQgb3IgZW5kXG4gICAqIEBwcm90ZWN0ZWRcbiAgICovXG5cbiAgcHJvdGVjdGVkIGlzQ2hhbmdlVmFsaWQoY29udHJvbE5hbWU6ICdzdGFydCcgfCAnZW5kJyl7XG5cblxuICAgIGNvbnN0IGNvbnRyb2wgPSA8Rm9ybUNvbnRyb2w+IHRoaXMuY29uZmlnLmZvcm1Hcm91cC5nZXQodGhpcy5nZXREYXRlQ29udHJvbE5hbWUoY29udHJvbE5hbWUpKS52YWx1ZTtcbiAgICBpZihjb250cm9sKXtcbiAgICAgIGlmKCBjb250cm9sLmludmFsaWQgKXtcbiAgICAgICAgaWYoIHRoaXMuY29uZmlnLmRpc3BsYXlFcnJvcnMgKSB0aGlzLl9zZXRNZXNzYWdlKCBWYWxpZGF0aW9uRXJyb3JNZXNzYWdlcyggY29udHJvbC5lcnJvcnMgKSApO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX2NoZWNrUHJldmVudCgpO1xuICB9XG5cblxuICAvKipcbiAgICogUmVzZXQgRm9ybSBldmVudFxuICAgKi9cblxuICBvblJlc2V0Rm9ybSgpOiB2b2lke1xuICAgIHRoaXMuZG9tLnNldFRpbWVvdXQoIGByZXNldC1mb3JtYCwgKCkgPT4ge1xuICAgICAgdGhpcy5jb25maWcuZm9ybUdyb3VwLmdldCgnc3RhcnQnKS5zZXRWYWx1ZSggbnVsbCwgeyBlbWl0RXZlbnQ6IHRydWUgfSApO1xuICAgICAgdGhpcy5jb25maWcuZm9ybUdyb3VwLmdldCgnc3RhcnQnKS51cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KCk7XG4gICAgICB0aGlzLmNvbmZpZy5mb3JtR3JvdXAuZ2V0KCdlbmQnKS5zZXRWYWx1ZSggbnVsbCwgeyBlbWl0RXZlbnQ6IHRydWUgfSApO1xuICAgICAgdGhpcy5jb25maWcuZm9ybUdyb3VwLmdldCgnZW5kJykudXBkYXRlVmFsdWVBbmRWYWxpZGl0eSgpO1xuICAgICAgdGhpcy5vbkNoYW5nZSgnc3RhcnQnKTtcbiAgICAgIHRoaXMuYXBwbHkuZW1pdCh7c3RhcnQ6bnVsbCxlbmQ6bnVsbH0pO1xuICAgIH0sIDAgKTtcblxuICB9XG5cbiAgbmdPbkRlc3Ryb3koKXtcbiAgICBzdXBlci5uZ09uRGVzdHJveSgpO1xuICAgIHRoaXMucmVtb3ZlRXhwYW5kZWRDbGFzcygpO1xuICB9XG5cbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBVbmRlciBUaGUgSG9vZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIFByaXZhdGUgTWV0aG9kICkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiAgcHJvdGVjdGVkIF9zZXRGaWx0ZXIoKTogdm9pZHtcbiAgICBpZiggdHlwZW9mIHRoaXMuY29uZmlnLmZpbHRlclByZWRpY2F0ZSA9PT0gJ3N0cmluZycgKXtcbiAgICAgIHN3aXRjaCggU3RyaW5nKCB0aGlzLmNvbmZpZy5maWx0ZXJQcmVkaWNhdGUgKS50b0xvd2VyQ2FzZSgpICl7XG4gICAgICAgIGNhc2UgJ3dlZWtkYXknOlxuICAgICAgICAgIHRoaXMuY29uZmlnLmZpbHRlclByZWRpY2F0ZSA9ICggZDogRGF0ZSApOiBib29sZWFuID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGRheSA9IGQuZ2V0RGF5KCk7XG4gICAgICAgICAgICAvLyBQcmV2ZW50IFNhdHVyZGF5IGFuZCBTdW5kYXkgZnJvbSBiZWluZyBzZWxlY3RlZC5cbiAgICAgICAgICAgIHJldHVybiBkYXkgIT09IDAgJiYgZGF5ICE9PSA2O1xuICAgICAgICAgIH07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3dlZWtkYXknOlxuICAgICAgICAgIHRoaXMuY29uZmlnLmZpbHRlclByZWRpY2F0ZSA9ICggZDogRGF0ZSApOiBib29sZWFuID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGRheSA9IGQuZ2V0RGF5KCk7XG4gICAgICAgICAgICAvLyBQcmV2ZW50IFNhdHVyZGF5IGFuZCBTdW5kYXkgZnJvbSBiZWluZyBzZWxlY3RlZC5cbiAgICAgICAgICAgIHJldHVybiBkYXkgPj0gMSAmJiBkYXkgPD0gNTtcbiAgICAgICAgICB9O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdtb25kYXknOlxuICAgICAgICAgIHRoaXMuY29uZmlnLmZpbHRlclByZWRpY2F0ZSA9ICggZDogRGF0ZSApOiBib29sZWFuID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGRheSA9IGQuZ2V0RGF5KCk7XG4gICAgICAgICAgICAvLyBtb25kYXlcbiAgICAgICAgICAgIHJldHVybiBkYXkgPT09IDE7XG4gICAgICAgICAgfTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICB0aGlzLmNvbmZpZy5maWx0ZXJQcmVkaWNhdGUgPSBudWxsO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19