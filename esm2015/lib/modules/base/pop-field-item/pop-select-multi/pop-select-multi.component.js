import { Component, ElementRef, Input } from '@angular/core';
import { PopFieldItemComponent } from '../pop-field-item.component';
export class PopSelectMultiComponent extends PopFieldItemComponent {
    constructor(el) {
        super();
        this.el = el;
        this.name = 'PopSelectMultiComponent';
        /**
         * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
         */
        this.dom.configure = () => {
            return new Promise((resolve) => {
                this.config.triggerOnChange = (value) => {
                    // this.cdr.detectChanges();
                    this.dom.setTimeout(`config-trigger-change`, () => {
                        this.onChange(value, true);
                    }, 0);
                };
                this.config.clearMessage = () => {
                    this.dom.setTimeout(`config-clear-message`, () => {
                        this.config.message = '';
                        this.config.message = '';
                        this.config.control.markAsPristine();
                        this.config.control.markAsUntouched();
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
    /**
     * On Blur Event
     */
    onBlur() {
        this.onBubbleEvent('onBlur');
    }
    onClose(open) {
        if (!open) {
            this.onChange();
        }
    }
    /**
     * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
     */
    ngOnDestroy() {
        super.ngOnDestroy();
    }
}
PopSelectMultiComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-select-multi',
                template: "<div class=\"import-field-item-container pop-select-multi-container\">\n  <mat-form-field appearance=\"outline\" class=\"expand-to-container\" [title]=\"config?.tooltip\">\n    <mat-label *ngIf=\"config.label\">{{config.label}}</mat-label>\n<!--    <div *ngIf=\"config.tooltip && config.showTooltip\" class=\"field-tooltip-msg\" [innerHTML]=config.tooltip></div>-->\n    <mat-select\n      multiple\n      [formControl]=\"config.control\"\n      (blur)=\"config.showTooltip=false; onBlur()\"\n      (focus)=\"config.showTooltip=true; onFocus()\"\n      (change)=\"onChange()\"\n      (openedChange)=\"onClose($event);\">\n      <mat-option *ngFor=\"let option of config.options.values\" [value]=\"option.value\">{{option.name}}</mat-option>\n    </mat-select>\n    <div class=\"pop-select-multi-feedback\" matSuffix *ngIf=\"!config.minimal\">\n      <lib-pop-field-item-error class=\"pop-select-multi-error\" [hidden]=\"!config.message\" [message]=\"config.message\"></lib-pop-field-item-error>\n    </div>\n    <lib-pop-field-item-helper class=\"pop-select-multi-helper\" [helpText]=config.helpText></lib-pop-field-item-helper>\n    <!--<div [ngClass]=\"{'sw-hidden':!this.config.control.value.length}\" class=\"pop-select-multi-count\">{{this.config.control.value.length}}</div>-->\n    <lib-pop-field-item-loader [show]=\"config.patch.displayIndicator && config.patch.running\"></lib-pop-field-item-loader>\n\n  </mat-form-field>\n</div>\n",
                styles: [".pop-select-multi-container{position:relative;display:block;padding:0}.pop-select-multi-container ::ng-deep .mat-form-field-appearance-outline .mat-form-field-wrapper{padding-bottom:0;margin:0!important}.pop-select-multi-container ::ng-deep .mat-form-field-appearance-outline .mat-form-field-infix .mat-select-arrow{margin-top:5px}.pop-select-multi-container ::ng-deep .mat-select-arrow-wrapper{position:relative;top:2px}.expand-to-container{position:relative;width:100%;height:100%}.pop-select-multi-feedback{position:relative;display:flex;justify-content:center;align-items:center;top:0;width:12px;height:20px}.pop-select-multi-count{position:absolute;bottom:1px;right:-7px;font-size:.7em;text-align:right;color:var(--text)}.pop-select-multi-helper{position:absolute;top:8px;right:30px;font-size:.8em}.pop-select-multi-error{top:1px;position:relative;font-size:.8em;left:4px}:host ::ng-deep .mat-form-field-appearance-outline .mat-select-value{padding-right:40px}"]
            },] }
];
PopSelectMultiComponent.ctorParameters = () => [
    { type: ElementRef }
];
PopSelectMultiComponent.propDecorators = {
    config: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLXNlbGVjdC1tdWx0aS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9iYXNlL3BvcC1maWVsZC1pdGVtL3BvcC1zZWxlY3QtbXVsdGkvcG9wLXNlbGVjdC1tdWx0aS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFxQixTQUFTLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBcUIsTUFBTSxlQUFlLENBQUM7QUFFbkcsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFTcEUsTUFBTSxPQUFPLHVCQUF3QixTQUFRLHFCQUFxQjtJQUtoRSxZQUNTLEVBQWM7UUFFckIsS0FBSyxFQUFFLENBQUM7UUFGRCxPQUFFLEdBQUYsRUFBRSxDQUFZO1FBSmhCLFNBQUksR0FBRyx5QkFBeUIsQ0FBQztRQVF0Qzs7V0FFRztRQUNILElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLEdBQXFCLEVBQUU7WUFDMUMsT0FBTyxJQUFJLE9BQU8sQ0FBRSxDQUFFLE9BQU8sRUFBRyxFQUFFO2dCQUVoQyxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsR0FBRyxDQUFFLEtBQTZCLEVBQUcsRUFBRTtvQkFDaEUsNEJBQTRCO29CQUM1QixJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBRSx1QkFBdUIsRUFBRSxHQUFHLEVBQUU7d0JBQ2pELElBQUksQ0FBQyxRQUFRLENBQUUsS0FBSyxFQUFFLElBQUksQ0FBRSxDQUFDO29CQUMvQixDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQUM7Z0JBQ1QsQ0FBQyxDQUFDO2dCQUVGLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxHQUFHLEdBQUcsRUFBRTtvQkFDOUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUUsc0JBQXNCLEVBQUUsR0FBRyxFQUFFO3dCQUNoRCxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7d0JBQ3pCLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQzt3QkFDekIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLENBQUM7d0JBQ3JDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRSxDQUFDO3dCQUN0Qyw0QkFBNEI7b0JBQzlCLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FBQztnQkFDVCxDQUFDLENBQUM7Z0JBRUYsT0FBTyxPQUFPLENBQUUsSUFBSSxDQUFFLENBQUM7WUFDekIsQ0FBQyxDQUFFLENBQUM7UUFDTixDQUFDLENBQUM7SUFDSixDQUFDO0lBR0Q7O09BRUc7SUFDSCxRQUFRO1FBQ04sS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ25CLENBQUM7SUFHRDs7T0FFRztJQUNILE1BQU07UUFDSixJQUFJLENBQUMsYUFBYSxDQUFFLFFBQVEsQ0FBRSxDQUFDO0lBQ2pDLENBQUM7SUFHRCxPQUFPLENBQUUsSUFBYTtRQUNwQixJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ1QsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1NBQ2pCO0lBQ0gsQ0FBQztJQUdEOztPQUVHO0lBQ0gsV0FBVztRQUNULEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN0QixDQUFDOzs7WUF6RUYsU0FBUyxTQUFFO2dCQUNWLFFBQVEsRUFBRSxzQkFBc0I7Z0JBQ2hDLDg2Q0FBZ0Q7O2FBRWpEOzs7WUFUc0MsVUFBVTs7O3FCQVk5QyxLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2hhbmdlRGV0ZWN0b3JSZWYsIENvbXBvbmVudCwgRWxlbWVudFJlZiwgSW5wdXQsIE9uRGVzdHJveSwgT25Jbml0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBTZWxlY3RNdWx0aUNvbmZpZyB9IGZyb20gJy4vc2VsZWN0LW11bGl0LWNvbmZpZy5tb2RlbCc7XG5pbXBvcnQgeyBQb3BGaWVsZEl0ZW1Db21wb25lbnQgfSBmcm9tICcuLi9wb3AtZmllbGQtaXRlbS5jb21wb25lbnQnO1xuXG5cbkBDb21wb25lbnQoIHtcbiAgc2VsZWN0b3I6ICdsaWItcG9wLXNlbGVjdC1tdWx0aScsXG4gIHRlbXBsYXRlVXJsOiAnLi9wb3Atc2VsZWN0LW11bHRpLmNvbXBvbmVudC5odG1sJyxcbiAgc3R5bGVVcmxzOiBbICcuL3BvcC1zZWxlY3QtbXVsdGkuY29tcG9uZW50LnNjc3MnIF1cbn0gKVxuXG5leHBvcnQgY2xhc3MgUG9wU2VsZWN0TXVsdGlDb21wb25lbnQgZXh0ZW5kcyBQb3BGaWVsZEl0ZW1Db21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG4gIEBJbnB1dCgpIGNvbmZpZzogU2VsZWN0TXVsdGlDb25maWc7XG4gIHB1YmxpYyBuYW1lID0gJ1BvcFNlbGVjdE11bHRpQ29tcG9uZW50JztcblxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBlbDogRWxlbWVudFJlZixcbiAgKXtcbiAgICBzdXBlcigpO1xuXG4gICAgLyoqXG4gICAgICogVGhpcyBzaG91bGQgdHJhbnNmb3JtIGFuZCB2YWxpZGF0ZSB0aGUgZGF0YS4gVGhlIHZpZXcgc2hvdWxkIHRyeSB0byBvbmx5IHVzZSBkYXRhIHRoYXQgaXMgc3RvcmVkIG9uIHVpIHNvIHRoYXQgaXQgaXMgbm90IGRlcGVuZGVudCBvbiB0aGUgc3RydWN0dXJlIG9mIGRhdGEgdGhhdCBjb21lcyBmcm9tIG90aGVyIHNvdXJjZXMuIFRoZSB1aSBzaG91bGQgYmUgdGhlIHNvdXJjZSBvZiB0cnV0aCBoZXJlLlxuICAgICAqL1xuICAgIHRoaXMuZG9tLmNvbmZpZ3VyZSA9ICgpOiBQcm9taXNlPGJvb2xlYW4+ID0+IHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSggKCByZXNvbHZlICkgPT4ge1xuXG4gICAgICAgIHRoaXMuY29uZmlnLnRyaWdnZXJPbkNoYW5nZSA9ICggdmFsdWU6IHN0cmluZyB8IG51bWJlciB8IG51bGwgKSA9PiB7XG4gICAgICAgICAgLy8gdGhpcy5jZHIuZGV0ZWN0Q2hhbmdlcygpO1xuICAgICAgICAgIHRoaXMuZG9tLnNldFRpbWVvdXQoIGBjb25maWctdHJpZ2dlci1jaGFuZ2VgLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLm9uQ2hhbmdlKCB2YWx1ZSwgdHJ1ZSApO1xuICAgICAgICAgIH0sIDAgKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmNvbmZpZy5jbGVhck1lc3NhZ2UgPSAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5kb20uc2V0VGltZW91dCggYGNvbmZpZy1jbGVhci1tZXNzYWdlYCwgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5jb25maWcubWVzc2FnZSA9ICcnO1xuICAgICAgICAgICAgdGhpcy5jb25maWcubWVzc2FnZSA9ICcnO1xuICAgICAgICAgICAgdGhpcy5jb25maWcuY29udHJvbC5tYXJrQXNQcmlzdGluZSgpO1xuICAgICAgICAgICAgdGhpcy5jb25maWcuY29udHJvbC5tYXJrQXNVbnRvdWNoZWQoKTtcbiAgICAgICAgICAgIC8vIHRoaXMuY2RyLmRldGVjdENoYW5nZXMoKTtcbiAgICAgICAgICB9LCAwICk7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIHJlc29sdmUoIHRydWUgKTtcbiAgICAgIH0gKTtcbiAgICB9O1xuICB9XG5cblxuICAvKipcbiAgICogVGhpcyBjb21wb25lbnQgc2hvdWxkIGhhdmUgYSBzcGVjaWZpYyBwdXJwb3NlXG4gICAqL1xuICBuZ09uSW5pdCgpe1xuICAgIHN1cGVyLm5nT25Jbml0KCk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBPbiBCbHVyIEV2ZW50XG4gICAqL1xuICBvbkJsdXIoKXtcbiAgICB0aGlzLm9uQnViYmxlRXZlbnQoICdvbkJsdXInICk7XG4gIH1cblxuXG4gIG9uQ2xvc2UoIG9wZW46IGJvb2xlYW4gKXtcbiAgICBpZiggIW9wZW4gKXtcbiAgICAgIHRoaXMub25DaGFuZ2UoKTtcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGUgZG9tIGRlc3Ryb3kgZnVuY3Rpb24gbWFuYWdlcyBhbGwgdGhlIGNsZWFuIHVwIHRoYXQgaXMgbmVjZXNzYXJ5IGlmIHN1YnNjcmlwdGlvbnMsIHRpbWVvdXRzLCBldGMgYXJlIHN0b3JlZCBwcm9wZXJseVxuICAgKi9cbiAgbmdPbkRlc3Ryb3koKXtcbiAgICBzdXBlci5uZ09uRGVzdHJveSgpO1xuICB9XG59XG4iXX0=