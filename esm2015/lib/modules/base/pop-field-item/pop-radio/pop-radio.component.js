import { Component, ElementRef, Input } from '@angular/core';
import { PopFieldItemComponent } from '../pop-field-item.component';
export class PopRadioComponent extends PopFieldItemComponent {
    constructor(el) {
        super();
        this.el = el;
        this.name = 'PopRadioComponent';
        /**
         * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
         */
        this.dom.configure = () => {
            return new Promise((resolve) => {
                this.asset.storedValue = this.config.control.value;
                this.asset.spinnerRef = this.el.nativeElement.querySelector('.radio-ajax-spinner'); // would use a @viewChild but it returns a component model instead of an element.. weird
                this.config.triggerOnChange = (value) => {
                    this.dom.setTimeout(`config-trigger-change`, () => {
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
                resolve(true);
            });
        };
    }
    /**
     * This component should have a specific purpose
     */
    ngOnInit() {
        super.ngOnInit();
    }
    onSelection(change) {
        this.asset.change = change;
        this.onChange();
    }
    /**
     * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
     */
    ngOnDestroy() {
        super.ngOnDestroy();
    }
}
PopRadioComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-radio',
                template: "<div class=\"import-field-item-container pop-radio-container {{ config.labelPosition === 'inline' ? 'pop-radio-container-row' : 'pop-radio-container-column'}}\">\n  <div class=\"pop-radio-label-layout\">\n    <div>\n      {{config.label}}\n      <span\n        *ngIf=\"config.helpText\"\n        class=\"pop-radio-helper-icon sw-pointer sw-pop-icon\"\n        (mouseenter)=\"dom.state.helper = true\"\n        (mouseleave)=\"dom.state.helper = false\"\n        matTooltip=\"{{config.helpText}}\"\n        matTooltipPosition=\"right\">X\n      </span>\n    </div>\n    <mat-icon\n      *ngIf=\"config.message\"\n      class=\"pop-radio-error-icon\"\n      matTooltipPosition=\"right\"\n      [matTooltip]=config.message\n      [color]=\"'warn'\">info\n    </mat-icon>\n  </div>\n  <div class=\"{{ config.labelPosition === 'inline' ? 'pop-radio-inline' : '' }}\">\n    <mat-radio-group\n      [formControl]=\"config.control\"\n      [ngClass]=\"{'pop-radio-column-layout': config.layout === 'column', 'pop-radio-row-layout': config.layout === 'row'}\"\n      (change)=\"onSelection($event);\"\n      disableRipple>\n      <mat-radio-button class=\"pop-radio-option\" *ngFor=\"let option of config.options.values\" disableRipple [value]=\"option.value\">\n        <span>{{option.name}}</span>\n      </mat-radio-button>\n    </mat-radio-group>\n  </div>\n  <lib-pop-field-item-loader [show]=\"config.patch.displayIndicator && config.patch.running\"></lib-pop-field-item-loader>\n</div>\n\n\n",
                styles: [".pop-radio-container-row{display:flex;justify-content:space-between}.pop-radio-container-column{display:flex;flex-direction:column}.pop-radio-inline{display:flex;justify-content:flex-end}.pop-radio-label-layout{display:inline-flex}.pop-radio-row-layout{display:inline-flex;flex-direction:row;align-items:center;justify-content:space-around;overflow-x:auto;overflow-y:hidden;width:100%;box-sizing:border-box}.pop-radio-helper-icon{font-size:.6em}.radio-error-icon{margin-left:5px;padding-top:6px;font-size:16px}.pop-radio-column-layout{display:inline-flex;flex-direction:column}.pop-radio-option{margin:5px;display:flex}.radio-ajax-spinner{position:absolute;cursor:pointer}.pop-radio-error-icon{position:relative;bottom:-2px;left:5px;font-size:16px;cursor:pointer}"]
            },] }
];
PopRadioComponent.ctorParameters = () => [
    { type: ElementRef }
];
PopRadioComponent.propDecorators = {
    config: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLXJhZGlvLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2Jhc2UvcG9wLWZpZWxkLWl0ZW0vcG9wLXJhZGlvL3BvcC1yYWRpby5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFnQyxNQUFNLGVBQWUsQ0FBQztBQUczRixPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQVFwRSxNQUFNLE9BQU8saUJBQWtCLFNBQVEscUJBQXFCO0lBSzFELFlBQ1MsRUFBYztRQUVyQixLQUFLLEVBQUUsQ0FBQztRQUZELE9BQUUsR0FBRixFQUFFLENBQVk7UUFKaEIsU0FBSSxHQUFHLG1CQUFtQixDQUFDO1FBUWhDOztXQUVHO1FBQ0gsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsR0FBcUIsRUFBRTtZQUMxQyxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7Z0JBQzdCLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztnQkFDbkQsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyx3RkFBd0Y7Z0JBRTVLLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxHQUFHLENBQUUsS0FBNkIsRUFBRyxFQUFFO29CQUNoRSxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBRSx1QkFBdUIsRUFBRSxHQUFHLEVBQUU7d0JBQ2pELElBQUksQ0FBQyxRQUFRLENBQUUsS0FBSyxFQUFFLElBQUksQ0FBRSxDQUFDO29CQUMvQixDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQUM7Z0JBQ1QsQ0FBQyxDQUFDO2dCQUVGLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxHQUFHLEdBQUcsRUFBRTtvQkFDOUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUUsc0JBQXNCLEVBQUUsR0FBRyxFQUFFO3dCQUNoRCxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7d0JBQ3pCLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxDQUFDO3dCQUNyQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUUsQ0FBQzt3QkFDdEMsNEJBQTRCO29CQUM5QixDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQUM7Z0JBQ1QsQ0FBQyxDQUFDO2dCQUVGLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNoQixDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQztJQUNKLENBQUM7SUFHRDs7T0FFRztJQUNILFFBQVE7UUFDTixLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDbkIsQ0FBQztJQUdELFdBQVcsQ0FBQyxNQUFzQjtRQUNoQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDM0IsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ2xCLENBQUM7SUFHRDs7T0FFRztJQUNILFdBQVc7UUFDVCxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDdEIsQ0FBQzs7O1lBL0RGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsZUFBZTtnQkFDekIsNDlDQUF5Qzs7YUFFMUM7OztZQVZtQixVQUFVOzs7cUJBWTNCLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEVsZW1lbnRSZWYsIElucHV0LCBPbkRlc3Ryb3ksIE9uSW5pdCwgUmVuZGVyZXIyIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBNYXRSYWRpb0NoYW5nZSB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL3JhZGlvJztcbmltcG9ydCB7IFJhZGlvQ29uZmlnIH0gZnJvbSAnLi9yYWRpby1jb25maWcubW9kZWwnO1xuaW1wb3J0IHsgUG9wRmllbGRJdGVtQ29tcG9uZW50IH0gZnJvbSAnLi4vcG9wLWZpZWxkLWl0ZW0uY29tcG9uZW50JztcblxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdsaWItcG9wLXJhZGlvJyxcbiAgdGVtcGxhdGVVcmw6ICcuL3BvcC1yYWRpby5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWyAnLi9wb3AtcmFkaW8uY29tcG9uZW50LnNjc3MnIF0sXG59KVxuZXhwb3J0IGNsYXNzIFBvcFJhZGlvQ29tcG9uZW50IGV4dGVuZHMgUG9wRmllbGRJdGVtQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xuICBASW5wdXQoKSBjb25maWc6IFJhZGlvQ29uZmlnO1xuICBwdWJsaWMgbmFtZSA9ICdQb3BSYWRpb0NvbXBvbmVudCc7XG5cblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgZWw6IEVsZW1lbnRSZWYsXG4gICl7XG4gICAgc3VwZXIoKTtcblxuICAgIC8qKlxuICAgICAqIFRoaXMgc2hvdWxkIHRyYW5zZm9ybSBhbmQgdmFsaWRhdGUgdGhlIGRhdGEuIFRoZSB2aWV3IHNob3VsZCB0cnkgdG8gb25seSB1c2UgZGF0YSB0aGF0IGlzIHN0b3JlZCBvbiB1aSBzbyB0aGF0IGl0IGlzIG5vdCBkZXBlbmRlbnQgb24gdGhlIHN0cnVjdHVyZSBvZiBkYXRhIHRoYXQgY29tZXMgZnJvbSBvdGhlciBzb3VyY2VzLiBUaGUgdWkgc2hvdWxkIGJlIHRoZSBzb3VyY2Ugb2YgdHJ1dGggaGVyZS5cbiAgICAgKi9cbiAgICB0aGlzLmRvbS5jb25maWd1cmUgPSAoKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgdGhpcy5hc3NldC5zdG9yZWRWYWx1ZSA9IHRoaXMuY29uZmlnLmNvbnRyb2wudmFsdWU7XG4gICAgICAgIHRoaXMuYXNzZXQuc3Bpbm5lclJlZiA9IHRoaXMuZWwubmF0aXZlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcucmFkaW8tYWpheC1zcGlubmVyJyk7IC8vIHdvdWxkIHVzZSBhIEB2aWV3Q2hpbGQgYnV0IGl0IHJldHVybnMgYSBjb21wb25lbnQgbW9kZWwgaW5zdGVhZCBvZiBhbiBlbGVtZW50Li4gd2VpcmRcblxuICAgICAgICB0aGlzLmNvbmZpZy50cmlnZ2VyT25DaGFuZ2UgPSAoIHZhbHVlOiBzdHJpbmcgfCBudW1iZXIgfCBudWxsICkgPT4ge1xuICAgICAgICAgIHRoaXMuZG9tLnNldFRpbWVvdXQoIGBjb25maWctdHJpZ2dlci1jaGFuZ2VgLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLm9uQ2hhbmdlKCB2YWx1ZSwgdHJ1ZSApO1xuICAgICAgICAgIH0sIDAgKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmNvbmZpZy5jbGVhck1lc3NhZ2UgPSAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5kb20uc2V0VGltZW91dCggYGNvbmZpZy1jbGVhci1tZXNzYWdlYCwgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5jb25maWcubWVzc2FnZSA9ICcnO1xuICAgICAgICAgICAgdGhpcy5jb25maWcuY29udHJvbC5tYXJrQXNQcmlzdGluZSgpO1xuICAgICAgICAgICAgdGhpcy5jb25maWcuY29udHJvbC5tYXJrQXNVbnRvdWNoZWQoKTtcbiAgICAgICAgICAgIC8vIHRoaXMuY2RyLmRldGVjdENoYW5nZXMoKTtcbiAgICAgICAgICB9LCAwICk7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH0pO1xuICAgIH07XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIGNvbXBvbmVudCBzaG91bGQgaGF2ZSBhIHNwZWNpZmljIHB1cnBvc2VcbiAgICovXG4gIG5nT25Jbml0KCl7XG4gICAgc3VwZXIubmdPbkluaXQoKTtcbiAgfVxuICBcblxuICBvblNlbGVjdGlvbihjaGFuZ2U6IE1hdFJhZGlvQ2hhbmdlKXtcbiAgICB0aGlzLmFzc2V0LmNoYW5nZSA9IGNoYW5nZTtcbiAgICB0aGlzLm9uQ2hhbmdlKCk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGUgZG9tIGRlc3Ryb3kgZnVuY3Rpb24gbWFuYWdlcyBhbGwgdGhlIGNsZWFuIHVwIHRoYXQgaXMgbmVjZXNzYXJ5IGlmIHN1YnNjcmlwdGlvbnMsIHRpbWVvdXRzLCBldGMgYXJlIHN0b3JlZCBwcm9wZXJseVxuICAgKi9cbiAgbmdPbkRlc3Ryb3koKXtcbiAgICBzdXBlci5uZ09uRGVzdHJveSgpO1xuICB9XG59XG4iXX0=