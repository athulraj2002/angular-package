import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PopFieldItemComponent } from '../pop-field-item.component';
import { SliderConfig } from './pop-slider.model';
export class PopSliderComponent extends PopFieldItemComponent {
    constructor() {
        super();
        this.config = new SliderConfig();
        this.events = new EventEmitter();
        this.name = 'PopSliderComponent';
        this.dom.state.helper = false;
        this.dom.state.tooltip = false;
    }
    ngOnInit() {
        super.ngOnInit();
    }
    /**
     * On Change event
     * @param value
     * @param force
     */
    onChange(value, force = false) {
        const control = this.config.control;
        if (typeof value !== 'undefined') {
            control.setValue(value);
            control.markAsDirty();
            control.updateValueAndValidity();
        }
        if (this._isChangeValid()) {
            value = typeof value !== 'undefined' ? value : this.config.control.value;
            value = this._applyTransformation(value);
            if (this.config.patch && this.config.patch && (this.config.patch.path || this.config.facade)) {
                this._onPatch(value, false);
            }
            else {
                this.onBubbleEvent('onChange');
            }
        }
    }
    getSliderTickInterval() {
        if (this.config.showTicks) {
            return this.config.autoTicks ? 'auto' : this.config.tickInterval;
        }
        return 0;
    }
    /**
     * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
     */
    ngOnDestroy() {
        super.ngOnDestroy();
    }
}
PopSliderComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-slider',
                template: "<div class=\"pop-slider-container import-field-item-container\">\n  <mat-label>Maxlength</mat-label>\n  <div class=\"pop-slider-display\">{{config.value}}</div>\n  <div class=\"pop-slider-feedback-container\">\n    <div class=\"pop-slider-error-icon\"\n         [ngClass]=\"{'sw-hidden': !config.message}\"\n         matTooltipPosition=\"left\"\n         [matTooltip]=config.message>\n      <mat-icon color=\"warn\">info</mat-icon>\n    </div>\n    <!--<lib-main-spinner-->\n      <!--class=\"pop-slider-ajax-spinner\"-->\n      <!--[ngClass]=\"{'sw-hidden': !config.patch || !config.patch.displayIndicator || !config.patch.running}\"-->\n      <!--[options]=\"{strokeWidth:3, color:'accent', diameter:19}\">-->\n    <!--</lib-main-spinner>-->\n  </div>\n  <mat-slider [min]=config.min [step]=config.step (change)=\"onChange($event.value);\" [tickInterval]=\"getSliderTickInterval()\" [max]=config.max [(ngModel)]=\"config.value\" [thumbLabel]=\"config.thumbLabel\"></mat-slider>\n  <lib-pop-field-item-loader [show]=\"config.patch.displayIndicator && config.patch.running\"></lib-pop-field-item-loader>\n</div>\n",
                styles: [".pop-slider-container{display:flex;flex-direction:row;flex-grow:1;justify-content:flex-start;align-items:center;width:100%;box-sizing:border-box;height:40px}:host ::ng-deep mat-label{width:75px}.pop-slider-display{display:flex;min-width:10px;padding:0 2px;text-align:right}.pop-slider-error-icon{position:absolute;z-index:2;margin-top:3px}.pop-slider-feedback-container{position:relative;display:flex;width:30px;height:20px;padding-top:2px;flex-flow:row;align-items:center;justify-content:center}:host ::ng-deep mat-slider{padding:0;vertical-align:top;display:block}:host ::ng-deep .mat-slider-horizontal{display:flex;flex-grow:1}"]
            },] }
];
PopSliderComponent.ctorParameters = () => [];
PopSliderComponent.propDecorators = {
    config: [{ type: Input }],
    events: [{ type: Output }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLXNsaWRlci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9iYXNlL3BvcC1maWVsZC1pdGVtL3BvcC1zbGlkZXIvcG9wLXNsaWRlci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFxQixNQUFNLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDMUYsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFFcEUsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBU2xELE1BQU0sT0FBTyxrQkFBbUIsU0FBUSxxQkFBcUI7SUFNM0Q7UUFDRSxLQUFLLEVBQUUsQ0FBQztRQU5ELFdBQU0sR0FBaUIsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUN6QyxXQUFNLEdBQXdDLElBQUksWUFBWSxFQUF5QixDQUFDO1FBQzNGLFNBQUksR0FBRyxvQkFBb0IsQ0FBQztRQUtqQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1FBQzlCLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7SUFDakMsQ0FBQztJQUdELFFBQVE7UUFDTixLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDbkIsQ0FBQztJQUdEOzs7O09BSUc7SUFDSCxRQUFRLENBQUMsS0FBVyxFQUFFLEtBQUssR0FBRyxLQUFLO1FBQ2pDLE1BQU0sT0FBTyxHQUFnQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQztRQUNqRCxJQUFJLE9BQU8sS0FBSyxLQUFLLFdBQVcsRUFBRTtZQUNoQyxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3hCLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN0QixPQUFPLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztTQUNsQztRQUNELElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRSxFQUFFO1lBQ3pCLEtBQUssR0FBRyxPQUFPLEtBQUssS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO1lBQ3pFLEtBQUssR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDekMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssSUFBSSxDQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBRSxFQUFFO2dCQUM5RixJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQzthQUM3QjtpQkFBSTtnQkFDSCxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQ2hDO1NBQ0Y7SUFDSCxDQUFDO0lBRUQscUJBQXFCO1FBQ25CLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUU7WUFDekIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQztTQUNsRTtRQUVELE9BQU8sQ0FBQyxDQUFDO0lBQ1gsQ0FBQztJQUdEOztPQUVHO0lBQ0gsV0FBVztRQUNULEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN0QixDQUFDOzs7WUE1REYsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSxnQkFBZ0I7Z0JBQzFCLHFtQ0FBMEM7O2FBRTNDOzs7O3FCQUVFLEtBQUs7cUJBQ0wsTUFBTSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgRXZlbnRFbWl0dGVyLCBJbnB1dCwgT25EZXN0cm95LCBPbkluaXQsIE91dHB1dCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgUG9wRmllbGRJdGVtQ29tcG9uZW50IH0gZnJvbSAnLi4vcG9wLWZpZWxkLWl0ZW0uY29tcG9uZW50JztcbmltcG9ydCB7IEZvcm1Db250cm9sIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHsgU2xpZGVyQ29uZmlnIH0gZnJvbSAnLi9wb3Atc2xpZGVyLm1vZGVsJztcbmltcG9ydCB7IFBvcEJhc2VFdmVudEludGVyZmFjZSB9IGZyb20gJy4uLy4uLy4uLy4uL3BvcC1jb21tb24ubW9kZWwnO1xuXG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2xpYi1wb3Atc2xpZGVyJyxcbiAgdGVtcGxhdGVVcmw6ICcuL3BvcC1zbGlkZXIuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsgJy4vcG9wLXNsaWRlci5jb21wb25lbnQuc2NzcycgXVxufSlcbmV4cG9ydCBjbGFzcyBQb3BTbGlkZXJDb21wb25lbnQgZXh0ZW5kcyBQb3BGaWVsZEl0ZW1Db21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG4gIEBJbnB1dCgpIGNvbmZpZzogU2xpZGVyQ29uZmlnID0gbmV3IFNsaWRlckNvbmZpZygpO1xuICBAT3V0cHV0KCkgZXZlbnRzOiBFdmVudEVtaXR0ZXI8UG9wQmFzZUV2ZW50SW50ZXJmYWNlPiA9IG5ldyBFdmVudEVtaXR0ZXI8UG9wQmFzZUV2ZW50SW50ZXJmYWNlPigpO1xuICBwdWJsaWMgbmFtZSA9ICdQb3BTbGlkZXJDb21wb25lbnQnO1xuXG5cbiAgY29uc3RydWN0b3IoKXtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuZG9tLnN0YXRlLmhlbHBlciA9IGZhbHNlO1xuICAgIHRoaXMuZG9tLnN0YXRlLnRvb2x0aXAgPSBmYWxzZTtcbiAgfVxuXG5cbiAgbmdPbkluaXQoKTogdm9pZHtcbiAgICBzdXBlci5uZ09uSW5pdCgpO1xuICB9XG5cblxuICAvKipcbiAgICogT24gQ2hhbmdlIGV2ZW50XG4gICAqIEBwYXJhbSB2YWx1ZVxuICAgKiBAcGFyYW0gZm9yY2VcbiAgICovXG4gIG9uQ2hhbmdlKHZhbHVlPzogYW55LCBmb3JjZSA9IGZhbHNlKXtcbiAgICBjb25zdCBjb250cm9sID0gPEZvcm1Db250cm9sPnRoaXMuY29uZmlnLmNvbnRyb2w7XG4gICAgaWYoIHR5cGVvZiB2YWx1ZSAhPT0gJ3VuZGVmaW5lZCcgKXtcbiAgICAgIGNvbnRyb2wuc2V0VmFsdWUodmFsdWUpO1xuICAgICAgY29udHJvbC5tYXJrQXNEaXJ0eSgpO1xuICAgICAgY29udHJvbC51cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KCk7XG4gICAgfVxuICAgIGlmKCB0aGlzLl9pc0NoYW5nZVZhbGlkKCkgKXtcbiAgICAgIHZhbHVlID0gdHlwZW9mIHZhbHVlICE9PSAndW5kZWZpbmVkJyA/IHZhbHVlIDogdGhpcy5jb25maWcuY29udHJvbC52YWx1ZTtcbiAgICAgIHZhbHVlID0gdGhpcy5fYXBwbHlUcmFuc2Zvcm1hdGlvbih2YWx1ZSk7XG4gICAgICBpZiggdGhpcy5jb25maWcucGF0Y2ggJiYgdGhpcy5jb25maWcucGF0Y2ggJiYgKCB0aGlzLmNvbmZpZy5wYXRjaC5wYXRoIHx8IHRoaXMuY29uZmlnLmZhY2FkZSApICl7XG4gICAgICAgIHRoaXMuX29uUGF0Y2godmFsdWUsIGZhbHNlKTtcbiAgICAgIH1lbHNle1xuICAgICAgICB0aGlzLm9uQnViYmxlRXZlbnQoJ29uQ2hhbmdlJyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZ2V0U2xpZGVyVGlja0ludGVydmFsKCk6IG51bWJlciB8ICdhdXRvJ3tcbiAgICBpZiggdGhpcy5jb25maWcuc2hvd1RpY2tzICl7XG4gICAgICByZXR1cm4gdGhpcy5jb25maWcuYXV0b1RpY2tzID8gJ2F1dG8nIDogdGhpcy5jb25maWcudGlja0ludGVydmFsO1xuICAgIH1cblxuICAgIHJldHVybiAwO1xuICB9XG5cblxuICAvKipcbiAgICogVGhlIGRvbSBkZXN0cm95IGZ1bmN0aW9uIG1hbmFnZXMgYWxsIHRoZSBjbGVhbiB1cCB0aGF0IGlzIG5lY2Vzc2FyeSBpZiBzdWJzY3JpcHRpb25zLCB0aW1lb3V0cywgZXRjIGFyZSBzdG9yZWQgcHJvcGVybHlcbiAgICovXG4gIG5nT25EZXN0cm95KCl7XG4gICAgc3VwZXIubmdPbkRlc3Ryb3koKTtcbiAgfVxuXG59XG4iXX0=