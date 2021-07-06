import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { DateConfig } from './date-config.model';
import { PopFieldItemComponent } from '../pop-field-item.component';
import { IsObject } from '../../../../pop-common-utility';
import { PopDate } from '../../../../pop-common.model';
import { ExpansionItemsComponent } from './datepicker-expansion-items/expansion-items.component';
import { OverlayContainer } from '@angular/cdk/overlay';
export class PopDateComponent extends PopFieldItemComponent {
    constructor(el, overlayContainer) {
        super();
        this.el = el;
        this.overlayContainer = overlayContainer;
        this.config = new DateConfig();
        this.name = 'PopDateComponent';
        this.ExpansionItems = ExpansionItemsComponent;
        /**
         * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
         */
        this.dom.configure = () => {
            return new Promise((resolve) => {
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
                this.onBubbleEvent('onInvalidChange');
            }
        }
    }
    /**
     * Reset the Form
     */
    onResetForm() {
        this.dom.setTimeout(`reset-form`, () => {
            this.config.control.setValue(null, { emitEvent: true });
            this.config.control.updateValueAndValidity();
            this.onChange();
        }, 0);
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
        if (!isDatepickerAreaClick || isDatepickerCancel || isDatepickerApply) {
            this.picker.close = this.selfClose;
            this.picker.close();
            this.removeExpandedClass();
        }
    }
    /**
     * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
     */
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
PopDateComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-date',
                template: "\n<div\n  class=\"import-field-item-container pop-date-container\"\n  (libClickOutside)=\"onOutsideCLick($event);\"\n>\n  <mat-form-field appearance=\"outline\" color=\"accent\" class=\"import-field-item-container-expansion\">\n    <mat-label *ngIf=\"config.label\">{{config.label}}</mat-label>\n    <div *ngIf=\"config.tooltip && config.showTooltip\" class=\"field-tooltip-msg\" [innerHTML]=config.tooltip></div>\n    <input\n      type=\"text\"\n      matTooltipClass=\"input-tooltip-background\"\n      matInput\n      [matDatepicker]=\"datePicker\"\n      [readonly]=\"config.disabled\"\n      [min]=config.min\n      [max]=config.max\n      [matDatepickerFilter]=config.filterPredicate\n      [formControl]=config.control\n      (blur)=\"config.showTooltip=false; onBlur();\"\n      (focus)=\"config.showTooltip=true; onFocus();\"\n      (dateChange)=\"onChange($event.value);\"\n      placeholder=\"\"\n    >\n  </mat-form-field>\n\n    <mat-datepicker #datePicker  [ngClass]=\"{'expanded': config?.type === 'Expanded' }\" [calendarHeaderComponent]=\"ExpansionItems\"  (opened)=\"onOpen()\" >\n    </mat-datepicker >\n\n<!--  <ng-container *ngIf=\"config.type === 'Basic'\">-->\n<!--    <mat-datepicker #datePicker  >-->\n<!--    </mat-datepicker >-->\n<!--  </ng-container>-->\n\n\n  <mat-icon *ngIf=\"!config.disabled\" class=\"sw-pointer date-clear-icon\" (click)=\"onResetForm();\">clear</mat-icon>\n  <mat-datepicker-toggle class=\"date-toggle-icon\"  [for]=\"datePicker\"></mat-datepicker-toggle>\n  <lib-pop-field-item-helper class=\"date-helper-icon\" [hidden]=\"!config.helpText\" [helpText]=config.helpText></lib-pop-field-item-helper>\n\n  <div class=\"date-feedback-container\">\n    <lib-pop-field-item-error class=\"date-error-icon\" [hidden]=\"!config.message\" [message]=\"config.message\"></lib-pop-field-item-error>\n  </div>\n  <lib-pop-field-item-loader [show]=\"config.patch.displayIndicator && config.patch.running\"></lib-pop-field-item-loader>\n</div>\n",
                styles: [".pop-date-container{position:relative;display:block;padding:0;margin:var(--gap-s) 0}.pop-date-container ::ng-deep .mat-form-field-appearance-outline .mat-form-field-subscript-wrapper{display:none}.pop-date-container ::ng-deep .mat-form-field-appearance-outline .mat-form-field-wrapper{padding-bottom:0;margin:0!important}.date-feedback-container{position:absolute;top:var(--gap-xxs);right:var(--gap-xxs);width:var(--gap-m);bottom:var(--gap-xxs);display:flex;padding-top:2px;flex-flow:row;align-items:center;justify-content:center;pointer-events:none}.date-clear-icon{right:42px;top:13px;font-size:1em}.date-clear-icon,.date-toggle-icon{position:absolute!important;width:25px;height:25px;z-index:1}.date-toggle-icon{right:24px;top:8px}.date-toggle-icon ::ng-deep .mat-icon-button{line-height:25px!important}.date-toggle-icon ::ng-deep button{width:25px;height:25px}.date-toggle-icon ::ng-deep button mat-icon{font-size:.9em}.date-error-icon{position:relative;pointer-events:all;left:4px}.date-error-icon ::ng-deep .mat-icon{font-size:1em!important}.date-helper-icon{position:absolute!important;width:25px;height:25px;right:67px;pointer-events:all;font-size:.8em;top:11px}.date-helper-icon ::ng-deep .mat-icon{font-size:.9em!important}.date-ajax-spinner{position:absolute;z-index:1}.field-tooltip-msg{position:absolute;display:block;bottom:50px;width:100%;right:-10px;left:-10px;background:#3d72ea!important;border-radius:.25em;padding:.75em;z-index:2;color:#fff;height:-webkit-fit-content;height:-moz-fit-content;height:fit-content;overflow:hidden;text-align:center}::ng-deep .expanded .mat-datepicker-content{position:relative;left:200px;border-radius:0!important;height:425px;background:var(--background-base);border-top:1px solid #d3d3d3;border-right:1px solid #d3d3d3;border-bottom:1px solid #d3d3d3}::ng-deep .mat-datepicker-content{background:var(--background-base);border:1px solid #d3d3d3}"]
            },] }
];
PopDateComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: OverlayContainer }
];
PopDateComponent.propDecorators = {
    config: [{ type: Input }],
    picker: [{ type: ViewChild, args: ['datePicker',] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWRhdGUuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvYmFzZS9wb3AtZmllbGQtaXRlbS9wb3AtZGF0ZS9wb3AtZGF0ZS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFxQixTQUFTLEVBQWdCLE1BQU0sZUFBZSxDQUFDO0FBRXpHLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUNqRCxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUVwRSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDMUQsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQ3ZELE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLHdEQUF3RCxDQUFDO0FBQ2pHLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBT3hELE1BQU0sT0FBTyxnQkFBaUIsU0FBUSxxQkFBcUI7SUFRekQsWUFBbUIsRUFBYyxFQUFVLGdCQUFrQztRQUMzRSxLQUFLLEVBQUUsQ0FBQztRQURTLE9BQUUsR0FBRixFQUFFLENBQVk7UUFBVSxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBUHBFLFdBQU0sR0FBZSxJQUFJLFVBQVUsRUFBRSxDQUFDO1FBRXhDLFNBQUksR0FBRyxrQkFBa0IsQ0FBQztRQUVqQyxtQkFBYyxHQUFJLHVCQUF1QixDQUFDO1FBTXhDOztXQUVHO1FBQ0gsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsR0FBcUIsRUFBRTtZQUMxQyxPQUFPLElBQUksT0FBTyxDQUFFLENBQUUsT0FBTyxFQUFHLEVBQUU7Z0JBRWhDLElBQUksQ0FBQyxN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ZUFBZSxHQUFHLENBQUUsQ0FBTyxFQUFZLEVBQUU7d0JBQ25ELE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQzt3QkFDdkIsU0FBUzt3QkFDVCxPQUFPLEdBQUcsS0FBSyxDQUFDLENBQUM7b0JBQ25CLENBQUMsQ0FBQztvQkFDRixNQUFNO2dCQUNSO29CQUNFLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQztvQkFDbkMsTUFBTTthQUNUO1NBQ0Y7SUFDSCxDQUFDOzs7WUFqUEYsU0FBUyxTQUFFO2dCQUNWLFFBQVEsRUFBRSxjQUFjO2dCQUN4QiwyOERBQXdDOzthQUV6Qzs7O1lBZG1CLFVBQVU7WUFRckIsZ0JBQWdCOzs7cUJBUXRCLEtBQUs7cUJBQ0wsU0FBUyxTQUFDLFlBQVkiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEVsZW1lbnRSZWYsIElucHV0LCBPbkRlc3Ryb3ksIE9uSW5pdCwgVmlld0NoaWxkLCBBZnRlclZpZXdJbml0fSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE1hdERhdGVwaWNrZXIgfSBmcm9tIFwiQGFuZ3VsYXIvbWF0ZXJpYWwvZGF0ZXBpY2tlclwiO1xuaW1wb3J0IHsgRGF0ZUNvbmZpZyB9IGZyb20gJy4vZGF0ZS1jb25maWcubW9kZWwnO1xuaW1wb3J0IHsgUG9wRmllbGRJdGVtQ29tcG9uZW50IH0gZnJvbSAnLi4vcG9wLWZpZWxkLWl0ZW0uY29tcG9uZW50JztcbmltcG9ydCB7IEZvcm1Db250cm9sIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHsgSXNPYmplY3QgfSBmcm9tICcuLi8uLi8uLi8uLi9wb3AtY29tbW9uLXV0aWxpdHknO1xuaW1wb3J0IHsgUG9wRGF0ZSB9IGZyb20gJy4uLy4uLy4uLy4uL3BvcC1jb21tb24ubW9kZWwnO1xuaW1wb3J0IHsgRXhwYW5zaW9uSXRlbXNDb21wb25lbnQgfSBmcm9tICcuL2RhdGVwaWNrZXItZXhwYW5zaW9uLWl0ZW1zL2V4cGFuc2lvbi1pdGVtcy5jb21wb25lbnQnO1xuaW1wb3J0IHsgT3ZlcmxheUNvbnRhaW5lciB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9vdmVybGF5JztcblxuQENvbXBvbmVudCgge1xuICBzZWxlY3RvcjogJ2xpYi1wb3AtZGF0ZScsXG4gIHRlbXBsYXRlVXJsOiAnLi9wb3AtZGF0ZS5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWyAnLi9wb3AtZGF0ZS5jb21wb25lbnQuc2NzcycgXVxufSApXG5leHBvcnQgY2xhc3MgUG9wRGF0ZUNvbXBvbmVudCBleHRlbmRzIFBvcEZpZWxkSXRlbUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95LCBBZnRlclZpZXdJbml0IHtcbiAgQElucHV0KCkgY29uZmlnOiBEYXRlQ29uZmlnID0gbmV3IERhdGVDb25maWcoKTtcbiAgQFZpZXdDaGlsZCgnZGF0ZVBpY2tlcicpIHBpY2tlcjogTWF0RGF0ZXBpY2tlcjxhbnk+O1xuICBwdWJsaWMgbmFtZSA9ICdQb3BEYXRlQ29tcG9uZW50JztcblxuICBFeHBhbnNpb25JdGVtcyA9ICBFeHBhbnNpb25JdGVtc0NvbXBvbmVudDtcbiAgcHJpdmF0ZSBzZWxmQ2xvc2U6ICgpID0+IHZvaWQ7XG5cbiAgY29uc3RydWN0b3IocHVibGljIGVsOiBFbGVtZW50UmVmLCBwcml2YXRlIG92ZXJsYXlDb250YWluZXI6IE92ZXJsYXlDb250YWluZXIpe1xuICAgIHN1cGVyKCk7XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIHNob3VsZCB0cmFuc2Zvcm0gYW5kIHZhbGlkYXRlIHRoZSBkYXRhLiBUaGUgdmlldyBzaG91bGQgdHJ5IHRvIG9ubHkgdXNlIGRhdGEgdGhhdCBpcyBzdG9yZWQgb24gdWkgc28gdGhhdCBpdCBpcyBub3QgZGVwZW5kZW50IG9uIHRoZSBzdHJ1Y3R1cmUgb2YgZGF0YSB0aGF0IGNvbWVzIGZyb20gb3RoZXIgc291cmNlcy4gVGhlIHVpIHNob3VsZCBiZSB0aGUgc291cmNlIG9mIHRydXRoIGhlcmUuXG4gICAgICovXG4gICAgdGhpcy5kb20uY29uZmlndXJlID0gKCk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCAoIHJlc29sdmUgKSA9PiB7XG5cbiAgICAgICAgdGhpcy5jb25maWcudHJpZ2dlck9uQ2hhbmdlID0gKCB2YWx1ZTogc3RyaW5nIHwgbnVtYmVyIHwgbnVsbCwgZm9yY2VQYXRjaCA9IGZhbHNlICkgPT4ge1xuICAgICAgICAgIHRoaXMuZG9tLnNldFRpbWVvdXQoIGBjb25maWctdHJpZ2dlci1jaGFuZ2VgLCAoKSA9PiB7XG4gICAgICAgICAgICAvLyB0aGlzLmNkci5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgICAgICAgICB0aGlzLm9uQ2hhbmdlKCB2YWx1ZSwgZm9yY2VQYXRjaCApO1xuICAgICAgICAgIH0sIDAgKTtcbiAgICAgICAgfTtcblxuXG4gICAgICAgIHRoaXMuY29uZmlnLmNsZWFyTWVzc2FnZSA9ICgpID0+IHtcbiAgICAgICAgICB0aGlzLmRvbS5zZXRUaW1lb3V0KCBgY29uZmlnLWNsZWFyLW1lc3NhZ2VgLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZy5tZXNzYWdlID0gJyc7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZy5jb250cm9sLm1hcmtBc1ByaXN0aW5lKCk7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZy5jb250cm9sLm1hcmtBc1VudG91Y2hlZCgpO1xuICAgICAgICAgICAgLy8gdGhpcy5jZHIuZGV0ZWN0Q2hhbmdlcygpO1xuICAgICAgICAgIH0sIDAgKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLl9zZXRGaWx0ZXIoKTtcblxuICAgICAgICByZXR1cm4gcmVzb2x2ZSggdHJ1ZSApO1xuICAgICAgfSApO1xuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogT24gaW5pdCBob29rXG4gICAqL1xuICBuZ09uSW5pdCgpe1xuICAgIHN1cGVyLm5nT25Jbml0KCk7XG4gICAgaWYodGhpcy5jb25maWcudHlwZSA9PT0gJ0Jhc2ljJyl7XG4gICAgICB0aGlzLkV4cGFuc2lvbkl0ZW1zID0gbnVsbDtcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBBZnRlciB2aWV3IGluaXQgaG9va1xuICAgKiAgQmFja3VwIHBpY2tlciBjbG9zZSBtZXRob2RcbiAgICovXG5cbiAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgIHRoaXMuc2VsZkNsb3NlID0gdGhpcy5waWNrZXIuY2xvc2U7XG4gIH1cblxuICAvKipcbiAgICogb24gT3BlbiBFdmVudFxuICAgKiBPdmVyd3JpdGUgcGlja2VyIGNsb3NlIHRvIHByZXZlbnQgYXV0byBjbG9zaW5nXG4gICAqL1xuICBwdWJsaWMgb25PcGVuKCkge1xuICAgIGNvbnN0IG9sY0NsYXNzZXMgPXRoaXMub3ZlcmxheUNvbnRhaW5lci5nZXRDb250YWluZXJFbGVtZW50KCkuY2xhc3NMaXN0O1xuXG5cbiAgICBpZih0aGlzLmNvbmZpZy50eXBlID09PSAnRXhwYW5kZWQnKXtcbiAgICAgIHRoaXMucGlja2VyLmNsb3NlID0gKCkgPT4ge307XG5cblxuICAgICAgb2xjQ2xhc3Nlcy5hZGQoJ2V4cGFuZGVkJyk7XG5cblxuICAgIH1lbHNle1xuICAgICAgdGhpcy5yZW1vdmVFeHBhbmRlZENsYXNzKCk7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogUmVtb3ZlcyBFeHBhbmRlZCBDbGFzcyBmcm9tIHRoZSBPdmVybGF5IENvbnRhaW5lciBpZiBuZWVkZWRcbiAgICovXG4gIHJlbW92ZUV4cGFuZGVkQ2xhc3MoKXtcbiAgICBjb25zdCBvbGNDbGFzc2VzID10aGlzLm92ZXJsYXlDb250YWluZXIuZ2V0Q29udGFpbmVyRWxlbWVudCgpLmNsYXNzTGlzdDtcbiAgICBpZiAob2xjQ2xhc3Nlcy5jb250YWlucygnZXhwYW5kZWQnKSkge1xuICAgICAgc2V0VGltZW91dCggKCkgPT4gIG9sY0NsYXNzZXMucmVtb3ZlKCdleHBhbmRlZCcpLCAxMDApO1xuICAgIH1cblxuICB9XG5cbiAgLyoqXG4gICAqIE9uIENoYW5nZSBldmVudFxuICAgKiBAcGFyYW0gdmFsdWVcbiAgICogQHBhcmFtIGZvcmNlXG4gICAqL1xuICBvbkNoYW5nZSggdmFsdWU/OiBhbnksIGZvcmNlID0gZmFsc2UgKXtcblxuICAgIGlmKCB2YWx1ZSApe1xuICAgICAgdmFsdWUgPSBQb3BEYXRlLnRvSXNvKCB2YWx1ZSApO1xuICAgIH1lbHNle1xuICAgICAgdmFsdWUgPSBudWxsO1xuICAgIH1cblxuICAgIGlmKCBJc09iamVjdCggdGhpcy5jb25maWcsIFsgJ2NvbnRyb2wnIF0gKSApe1xuICAgICAgdGhpcy5sb2cuaW5mbyggYG9uQ2hhbmdlYCwgdmFsdWUgKTtcbiAgICAgIGNvbnN0IGNvbnRyb2wgPSA8Rm9ybUNvbnRyb2w+dGhpcy5jb25maWcuY29udHJvbDtcbiAgICAgIGlmKCB0eXBlb2YgdmFsdWUgIT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgIGNvbnRyb2wuc2V0VmFsdWUoIHZhbHVlICk7XG4gICAgICAgIGNvbnRyb2wubWFya0FzRGlydHkoKTtcbiAgICAgICAgY29udHJvbC51cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KCk7XG4gICAgICB9XG4gICAgICBpZiggdGhpcy5faXNDaGFuZ2VWYWxpZCgpICl7XG4gICAgICAgIHZhbHVlID0gdHlwZW9mIHZhbHVlICE9PSAndW5kZWZpbmVkJyA/IHZhbHVlIDogdGhpcy5jb25maWcuY29udHJvbC52YWx1ZTtcbiAgICAgICAgdmFsdWUgPSB0aGlzLl9hcHBseVRyYW5zZm9ybWF0aW9uKCB2YWx1ZSApO1xuICAgICAgICBpZiggdGhpcy5jb25maWcucGF0Y2ggJiYgKCB0aGlzLmNvbmZpZy5wYXRjaC5wYXRoIHx8IHRoaXMuY29uZmlnLmZhY2FkZSApICl7XG4gICAgICAgICAgdGhpcy5fb25QYXRjaCggdmFsdWUsIGZvcmNlICk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHRoaXMub25CdWJibGVFdmVudCggJ29uQ2hhbmdlJyApO1xuICAgICAgICB9XG4gICAgICB9ZWxzZXtcbiAgICAgICAgdGhpcy5vbkJ1YmJsZUV2ZW50KCAnb25JbnZhbGlkQ2hhbmdlJyApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNldCB0aGUgRm9ybVxuICAgKi9cblxuICBvblJlc2V0Rm9ybSgpOiB2b2lke1xuICAgIHRoaXMuZG9tLnNldFRpbWVvdXQoIGByZXNldC1mb3JtYCwgKCkgPT4ge1xuICAgICAgdGhpcy5jb25maWcuY29udHJvbC5zZXRWYWx1ZSggbnVsbCwgeyBlbWl0RXZlbnQ6IHRydWUgfSApO1xuICAgICAgdGhpcy5jb25maWcuY29udHJvbC51cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KCk7XG4gICAgICB0aGlzLm9uQ2hhbmdlKCk7XG4gICAgfSwgMCApO1xuXG4gIH1cblxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmUgd2hlcmUgdGhlIGNsaWNrIGhhcHBlbmVkLiBSZXR1cm4gcGlja2VyIGNsb3NlIHRvIG9yaWdpbmFsIHN0YXRlXG4gICAqIEBwYXJhbSAkY2xpY2tcbiAgICovXG5cbiAgb25PdXRzaWRlQ0xpY2soJGNsaWNrKXtcbiAgICBsZXQgaXNEYXRlcGlja2VyQXJlYUNsaWNrID0gJGNsaWNrLnBhdGguc29tZSggcGF0aCA9PiB7XG4gICAgICBpZihwYXRoLmNsYXNzTmFtZSl7XG4gICAgICAgIHJldHVybiBwYXRoLmNsYXNzTmFtZS5pbmNsdWRlcygnbWF0LWRhdGVwaWNrZXInKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmKGlzRGF0ZXBpY2tlckFyZWFDbGljayl7XG4gICAgICBjb25zdCByID0gJGNsaWNrLnBhdGguc29tZSggcGF0aCA9PiB7XG4gICAgICAgIGlmKHBhdGguY2xhc3NOYW1lKXtcbiAgICAgICAgICByZXR1cm4gcGF0aC5jbGFzc05hbWUuaW5jbHVkZXMoJ21hdC1vdmVybGF5Jyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBpZihyKXtcbiAgICAgICAgaXNEYXRlcGlja2VyQXJlYUNsaWNrID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgaXNEYXRlcGlja2VyQ2FuY2VsID0gJGNsaWNrLnBhdGguc29tZSggZWxlID0+e1xuICAgICAgaWYoZWxlLmlkKXtcbiAgICAgICAgcmV0dXJuIGVsZS5pZC5pbmNsdWRlcygnZGF0ZXBpY2tlci1jYW5jZWwnKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGNvbnN0IGlzRGF0ZXBpY2tlckFwcGx5ID0gJGNsaWNrLnBhdGguc29tZSggZWxlID0+e1xuICAgICAgaWYoZWxlLmlkKXtcbiAgICAgICAgcmV0dXJuIGVsZS5pZC5pbmNsdWRlcygnZGF0ZXBpY2tlci1hcHBseScpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYoIWlzRGF0ZXBpY2tlckFyZWFDbGljayB8fCBpc0RhdGVwaWNrZXJDYW5jZWwgfHwgaXNEYXRlcGlja2VyQXBwbHkpe1xuXG5cblxuICAgICAgdGhpcy5waWNrZXIuY2xvc2UgPSB0aGlzLnNlbGZDbG9zZTtcbiAgICAgIHRoaXMucGlja2VyLmNsb3NlKCk7XG4gICAgICB0aGlzLnJlbW92ZUV4cGFuZGVkQ2xhc3MoKTtcbiAgICB9XG5cbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoZSBkb20gZGVzdHJveSBmdW5jdGlvbiBtYW5hZ2VzIGFsbCB0aGUgY2xlYW4gdXAgdGhhdCBpcyBuZWNlc3NhcnkgaWYgc3Vic2NyaXB0aW9ucywgdGltZW91dHMsIGV0YyBhcmUgc3RvcmVkIHByb3Blcmx5XG4gICAqL1xuICBuZ09uRGVzdHJveSgpe1xuICAgIHN1cGVyLm5nT25EZXN0cm95KCk7XG4gICAgdGhpcy5yZW1vdmVFeHBhbmRlZENsYXNzKCk7XG4gIH1cblxuXG5cbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBVbmRlciBUaGUgSG9vZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIFByaXZhdGUgTWV0aG9kICkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiAgcHJvdGVjdGVkIF9zZXRGaWx0ZXIoKTogdm9pZHtcbiAgICBpZiggdHlwZW9mIHRoaXMuY29uZmlnLmZpbHRlclByZWRpY2F0ZSA9PT0gJ3N0cmluZycgKXtcbiAgICAgIHN3aXRjaCggU3RyaW5nKCB0aGlzLmNvbmZpZy5maWx0ZXJQcmVkaWNhdGUgKS50b0xvd2VyQ2FzZSgpICl7XG4gICAgICAgIGNhc2UgJ3dlZWtkYXknOlxuICAgICAgICAgIHRoaXMuY29uZmlnLmZpbHRlclByZWRpY2F0ZSA9ICggZDogRGF0ZSApOiBib29sZWFuID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGRheSA9IGQuZ2V0RGF5KCk7XG4gICAgICAgICAgICAvLyBQcmV2ZW50IFNhdHVyZGF5IGFuZCBTdW5kYXkgZnJvbSBiZWluZyBzZWxlY3RlZC5cbiAgICAgICAgICAgIHJldHVybiBkYXkgIT09IDAgJiYgZGF5ICE9PSA2O1xuICAgICAgICAgIH07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3dlZWtkYXknOlxuICAgICAgICAgIHRoaXMuY29uZmlnLmZpbHRlclByZWRpY2F0ZSA9ICggZDogRGF0ZSApOiBib29sZWFuID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGRheSA9IGQuZ2V0RGF5KCk7XG4gICAgICAgICAgICAvLyBQcmV2ZW50IFNhdHVyZGF5IGFuZCBTdW5kYXkgZnJvbSBiZWluZyBzZWxlY3RlZC5cbiAgICAgICAgICAgIHJldHVybiBkYXkgPj0gMSAmJiBkYXkgPD0gNTtcbiAgICAgICAgICB9O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdtb25kYXknOlxuICAgICAgICAgIHRoaXMuY29uZmlnLmZpbHRlclByZWRpY2F0ZSA9ICggZDogRGF0ZSApOiBib29sZWFuID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGRheSA9IGQuZ2V0RGF5KCk7XG4gICAgICAgICAgICAvLyBtb25kYXlcbiAgICAgICAgICAgIHJldHVybiBkYXkgPT09IDE7XG4gICAgICAgICAgfTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICB0aGlzLmNvbmZpZy5maWx0ZXJQcmVkaWNhdGUgPSBudWxsO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG59XG4iXX0=