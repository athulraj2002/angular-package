import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { PopFieldItemComponent } from '../pop-field-item.component';
export class PopSwitchComponent extends PopFieldItemComponent {
    constructor(el) {
        super();
        this.el = el;
        this.events = new EventEmitter();
        this.name = 'PopSwitchComponent';
        /**
         * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
         */
        this.dom.configure = () => {
            return new Promise((resolve) => {
                this.switchRef.checked = !!this.config.control.value;
                this.config.switchRef = this.switchRef;
                this.asset.storedValue = this.config.control.value;
                this.config.triggerOnChange = (value) => {
                    this.dom.setTimeout(`trigger-change`, () => {
                        this.onSelection({ checked: value });
                    }, 0);
                };
                this.config.setValue = (value) => {
                    this.dom.setTimeout(`set-value`, () => {
                        this.asset.change = value;
                        this.config.control.setValue(value, { emitEvent: false });
                        this.config.control.updateValueAndValidity();
                        this.config.control.markAsPristine();
                        this.switchRef.checked = value;
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
    onEnter(event) {
        if (this.config.tabOnEnter) {
            this.dom.focusNextInput(this.el);
        }
    }
    onSelection(change) {
        this.asset.change = change;
        this.onChange(change.checked);
    }
    /************************************************************************************************
     *                                                                                              *
     *                                    Base Class Overrides                                      *
     *                                    ( Protected Method )                                      *
     *               These are protected instead of private so that they can be overridden          *
     *                                                                                              *
     ************************************************************************************************/
    _beforePatch() {
        return new Promise((resolve) => {
            const patch = this.config.patch;
            const control = this.config.control;
            control.disable();
            patch.running = true;
            return resolve(true);
        });
    }
    /**
     * Called after a successful patch
     */
    _afterPatch() {
        return new Promise((resolve) => {
            const patch = this.config.patch;
            const control = this.config.control;
            control.enable();
            patch.running = false;
            this.switchRef.checked = this.asset.storedValue;
            return resolve(true);
        });
    }
    /**
     * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
     */
    ngOnDestroy() {
        super.ngOnDestroy();
    }
}
PopSwitchComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-switch',
                template: "<div class=\"pop-switch-container import-field-item-container\" [title]=\"config?.tooltip ?  config?.tooltip : '' \" [style.padding]=config.padding [ngClass]=\"{ 'pop-switch-has-label':config.label, 'pop-switch-no-label': !config.label, 'pop-switch-label-before': config.label && config.labelPosition === 'before', 'pop-switch-label-after': config.label && config.labelPosition === 'after', 'pop-switch-wrap-text': config.label && config.textOverflow === 'wrap', 'pop-switch-wrap-ellipsis': config.label && config.textOverflow === 'ellipsis'}\">\n  <mat-slide-toggle\n    #switch\n    [ngClass]=\"{'pop-switch-no-pointer': config.patch.running}\"\n    [labelPosition]=\"config.labelPosition\"\n    [disableRipple]=1\n    [disabled]=config?.disabled\n    [name]=\"config.label\"\n    (keyup.enter)=\"onEnter($event)\"\n    (change)=\"onSelection($event)\">\n\n\n    <div class=\"mat-body\">\n      <div class=\"pop-switch-feedback-container\" *ngIf=\"config.label\">\n        <lib-pop-field-item-error class=\"pop-switch-error\" [hidden]=\"!config.message\" [message]=\"config.message\"></lib-pop-field-item-error>\n        <lib-pop-field-item-helper class=\"pop-switch-helper\" [hidden]=\"config.message\" [helpText]=config.helpText></lib-pop-field-item-helper>\n      </div>\n      <h4>{{config.label}}</h4>\n    </div>\n\n  </mat-slide-toggle>\n\n  <lib-pop-field-item-loader [show]=\"config.patch.displayIndicator && config.patch.running\"></lib-pop-field-item-loader>\n</div>\n",
                styles: [":host{width:100%}.pop-switch-container{position:relative;display:flex;flex-direction:row;width:100%;min-height:40px;align-items:center;box-sizing:border-box}.pop-switch-has-label{justify-content:flex-start}.pop-switch-no-label{justify-content:center}.pop-switch-label{padding:5px 2px}.pop-switch-spacer{position:relative;display:flex;min-width:10px;box-sizing:border-box;background:pink}:host ::ng-deep .pop-switch-has-label .mat-slide-toggle{flex:1}:host ::ng-deep .pop-switch-label-before .mat-slide-toggle-content{display:flex;flex-grow:1;margin-right:5px;width:100%}.pop-switch-feedback-container{position:relative;display:flex;flex-direction:column;justify-content:center;align-items:center;min-width:25px;min-height:35px}:host ::ng-deep .pop-switch-label-before .mat-body{flex-direction:row-reverse!important}:host ::ng-deep .pop-switch-label-after .mat-slide-toggle-bar{margin-right:5px}:host ::ng-deep .pop-switch-label-after .mat-body h4{padding-left:var(--gap-xs)}:host ::ng-deep .pop-switch-has-label .mat-body{display:flex;flex-grow:1;box-sizing:border-box;min-width:0;align-items:center}:host ::ng-deep .pop-switch-wrap-text .mat-body h4{overflow-wrap:break-spaces!important;word-wrap:break-spaces!important;white-space:normal!important}:host ::ng-deep .pop-switch-wrap-ellipsis .mat-body h4{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}:host ::ng-deep .pop-switch-has-label.pop-switch-wrap-text .mat-slide-toggle{min-height:24px!important;height:auto!important}.pop-switch-ajax-spinner{position:absolute;cursor:pointer;z-index:1}.pop-switch-hover:hover{background:var(--accent-shade)!important}.pop-switch-no-pointer{pointer-events:none}:host ::ng-deep h4{margin:0;flex:1}.pop-switch-error{position:relative;top:2px;left:2px}:host ::ng-deep .pop-switch-error mat-icon{font-size:.98em}.pop-switch-helper{position:relative;top:2px;left:2px;font-size:.7em}"]
            },] }
];
PopSwitchComponent.ctorParameters = () => [
    { type: ElementRef }
];
PopSwitchComponent.propDecorators = {
    switchRef: [{ type: ViewChild, args: ['switch', { static: true },] }],
    feedbackRef: [{ type: ViewChild, args: ['feedback', { static: true },] }],
    config: [{ type: Input }],
    events: [{ type: Output }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLXN3aXRjaC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9iYXNlL3BvcC1maWVsZC1pdGVtL3BvcC1zd2l0Y2gvcG9wLXN3aXRjaC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBcUIsTUFBTSxFQUFFLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUlqSCxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQVNwRSxNQUFNLE9BQU8sa0JBQW1CLFNBQVEscUJBQXFCO0lBUTNELFlBQ1MsRUFBYztRQUVyQixLQUFLLEVBQUUsQ0FBQztRQUZELE9BQUUsR0FBRixFQUFFLENBQVk7UUFMYixXQUFNLEdBQXdDLElBQUksWUFBWSxFQUF5QixDQUFDO1FBQzNGLFNBQUksR0FBRyxvQkFBb0IsQ0FBQztRQVFqQzs7V0FFRztRQUNILElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLEdBQXFCLEVBQUU7WUFDMUMsT0FBTyxJQUFJLE9BQU8sQ0FBRSxDQUFFLE9BQU8sRUFBRyxFQUFFO2dCQUVoQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO2dCQUNyRCxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO2dCQUN2QyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7Z0JBQ25ELElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxHQUFHLENBQUUsS0FBYyxFQUFHLEVBQUU7b0JBQ2pE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RUFBRSxnQkFBZ0I7Z0JBQzFCLHE5Q0FBMEM7O2FBRTNDOzs7WUFabUIsVUFBVTs7O3dCQWMzQixTQUFTLFNBQUUsUUFBUSxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRTswQkFDckMsU0FBUyxTQUFFLFVBQVUsRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUU7cUJBQ3ZDLEtBQUs7cUJBQ0wsTUFBTSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgRWxlbWVudFJlZiwgRXZlbnRFbWl0dGVyLCBJbnB1dCwgT25EZXN0cm95LCBPbkluaXQsIE91dHB1dCwgVmlld0NoaWxkIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBNYXRTbGlkZVRvZ2dsZSB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL3NsaWRlLXRvZ2dsZSc7XG5pbXBvcnQgeyBTd2l0Y2hDb25maWcgfSBmcm9tICcuL3N3aXRjaC1jb25maWcubW9kZWwnO1xuaW1wb3J0IHsgRmllbGRJdGVtUGF0Y2hJbnRlcmZhY2UsIFBvcEJhc2VFdmVudEludGVyZmFjZSB9IGZyb20gJy4uLy4uLy4uLy4uL3BvcC1jb21tb24ubW9kZWwnO1xuaW1wb3J0IHsgUG9wRmllbGRJdGVtQ29tcG9uZW50IH0gZnJvbSAnLi4vcG9wLWZpZWxkLWl0ZW0uY29tcG9uZW50JztcbmltcG9ydCB7IEZvcm1Db250cm9sIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuXG5cbkBDb21wb25lbnQoIHtcbiAgc2VsZWN0b3I6ICdsaWItcG9wLXN3aXRjaCcsXG4gIHRlbXBsYXRlVXJsOiAnLi9wb3Atc3dpdGNoLmNvbXBvbmVudC5odG1sJyxcbiAgc3R5bGVVcmxzOiBbICcuL3BvcC1zd2l0Y2guY29tcG9uZW50LnNjc3MnIF0sXG59IClcbmV4cG9ydCBjbGFzcyBQb3BTd2l0Y2hDb21wb25lbnQgZXh0ZW5kcyBQb3BGaWVsZEl0ZW1Db21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG4gIEBWaWV3Q2hpbGQoICdzd2l0Y2gnLCB7IHN0YXRpYzogdHJ1ZSB9ICkgcHJpdmF0ZSBzd2l0Y2hSZWY6IE1hdFNsaWRlVG9nZ2xlO1xuICBAVmlld0NoaWxkKCAnZmVlZGJhY2snLCB7IHN0YXRpYzogdHJ1ZSB9ICkgcHJpdmF0ZSBmZWVkYmFja1JlZjogRWxlbWVudFJlZjtcbiAgQElucHV0KCkgY29uZmlnOiBTd2l0Y2hDb25maWc7XG4gIEBPdXRwdXQoKSBldmVudHM6IEV2ZW50RW1pdHRlcjxQb3BCYXNlRXZlbnRJbnRlcmZhY2U+ID0gbmV3IEV2ZW50RW1pdHRlcjxQb3BCYXNlRXZlbnRJbnRlcmZhY2U+KCk7XG4gIHB1YmxpYyBuYW1lID0gJ1BvcFN3aXRjaENvbXBvbmVudCc7XG5cblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgZWw6IEVsZW1lbnRSZWYsXG4gICl7XG4gICAgc3VwZXIoKTtcblxuICAgIC8qKlxuICAgICAqIFRoaXMgc2hvdWxkIHRyYW5zZm9ybSBhbmQgdmFsaWRhdGUgdGhlIGRhdGEuIFRoZSB2aWV3IHNob3VsZCB0cnkgdG8gb25seSB1c2UgZGF0YSB0aGF0IGlzIHN0b3JlZCBvbiB1aSBzbyB0aGF0IGl0IGlzIG5vdCBkZXBlbmRlbnQgb24gdGhlIHN0cnVjdHVyZSBvZiBkYXRhIHRoYXQgY29tZXMgZnJvbSBvdGhlciBzb3VyY2VzLiBUaGUgdWkgc2hvdWxkIGJlIHRoZSBzb3VyY2Ugb2YgdHJ1dGggaGVyZS5cbiAgICAgKi9cbiAgICB0aGlzLmRvbS5jb25maWd1cmUgPSAoKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoICggcmVzb2x2ZSApID0+IHtcblxuICAgICAgICB0aGlzLnN3aXRjaFJlZi5jaGVja2VkID0gISF0aGlzLmNvbmZpZy5jb250cm9sLnZhbHVlO1xuICAgICAgICB0aGlzLmNvbmZpZy5zd2l0Y2hSZWYgPSB0aGlzLnN3aXRjaFJlZjtcbiAgICAgICAgdGhpcy5hc3NldC5zdG9yZWRWYWx1ZSA9IHRoaXMuY29uZmlnLmNvbnRyb2wudmFsdWU7XG4gICAgICAgIHRoaXMuY29uZmlnLnRyaWdnZXJPbkNoYW5nZSA9ICggdmFsdWU6IGJvb2xlYW4gKSA9PiB7XG4gICAgICAgICAgdGhpcy5kb20uc2V0VGltZW91dCggYHRyaWdnZXItY2hhbmdlYCwgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5vblNlbGVjdGlvbiggeyBjaGVja2VkOiB2YWx1ZSB9ICk7XG4gICAgICAgICAgfSwgMCApO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuY29uZmlnLnNldFZhbHVlID0gKCB2YWx1ZTogYm9vbGVhbiApID0+IHtcbiAgICAgICAgICB0aGlzLmRvbS5zZXRUaW1lb3V0KCBgc2V0LXZhbHVlYCwgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5hc3NldC5jaGFuZ2UgPSB2YWx1ZTtcbiAgICAgICAgICAgIHRoaXMuY29uZmlnLmNvbnRyb2wuc2V0VmFsdWUoIHZhbHVlLCB7IGVtaXRFdmVudDogZmFsc2UgfSApO1xuICAgICAgICAgICAgdGhpcy5jb25maWcuY29udHJvbC51cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KCk7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZy5jb250cm9sLm1hcmtBc1ByaXN0aW5lKCk7XG4gICAgICAgICAgICB0aGlzLnN3aXRjaFJlZi5jaGVja2VkID0gdmFsdWU7XG4gICAgICAgICAgfSwgMCApO1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiByZXNvbHZlKCB0cnVlICk7XG4gICAgICB9ICk7XG4gICAgfTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgY29tcG9uZW50IHNob3VsZCBoYXZlIGEgc3BlY2lmaWMgcHVycG9zZVxuICAgKi9cbiAgbmdPbkluaXQoKXtcbiAgICBzdXBlci5uZ09uSW5pdCgpO1xuICB9XG5cblxuICBvbkVudGVyKCBldmVudCApe1xuICAgIGlmKCB0aGlzLmNvbmZpZy50YWJPbkVudGVyICl7XG4gICAgICB0aGlzLmRvbS5mb2N1c05leHRJbnB1dCggdGhpcy5lbCApO1xuICAgIH1cbiAgfVxuXG5cbiAgb25TZWxlY3Rpb24oIGNoYW5nZTogeyBjaGVja2VkOiBib29sZWFuIH0gKXtcbiAgICB0aGlzLmFzc2V0LmNoYW5nZSA9IGNoYW5nZTtcbiAgICB0aGlzLm9uQ2hhbmdlKCBjaGFuZ2UuY2hlY2tlZCApO1xuICB9XG5cblxuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCYXNlIENsYXNzIE92ZXJyaWRlcyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICggUHJvdGVjdGVkIE1ldGhvZCApICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgVGhlc2UgYXJlIHByb3RlY3RlZCBpbnN0ZWFkIG9mIHByaXZhdGUgc28gdGhhdCB0aGV5IGNhbiBiZSBvdmVycmlkZGVuICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG5cbiAgcHJvdGVjdGVkIF9iZWZvcmVQYXRjaCgpOiBQcm9taXNlPGJvb2xlYW4+e1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSggKCByZXNvbHZlICkgPT4ge1xuICAgICAgY29uc3QgcGF0Y2ggPSA8RmllbGRJdGVtUGF0Y2hJbnRlcmZhY2U+dGhpcy5jb25maWcucGF0Y2g7XG4gICAgICBjb25zdCBjb250cm9sID0gPEZvcm1Db250cm9sPnRoaXMuY29uZmlnLmNvbnRyb2w7XG5cbiAgICAgIGNvbnRyb2wuZGlzYWJsZSgpO1xuICAgICAgcGF0Y2gucnVubmluZyA9IHRydWU7XG5cbiAgICAgIHJldHVybiByZXNvbHZlKCB0cnVlICk7XG4gICAgfSApO1xuICB9XG5cblxuICAvKipcbiAgICogQ2FsbGVkIGFmdGVyIGEgc3VjY2Vzc2Z1bCBwYXRjaFxuICAgKi9cbiAgcHJvdGVjdGVkIF9hZnRlclBhdGNoKCk6IFByb21pc2U8Ym9vbGVhbj57XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKCAoIHJlc29sdmUgKSA9PiB7XG4gICAgICBjb25zdCBwYXRjaCA9IDxGaWVsZEl0ZW1QYXRjaEludGVyZmFjZT50aGlzLmNvbmZpZy5wYXRjaDtcbiAgICAgIGNvbnN0IGNvbnRyb2wgPSA8Rm9ybUNvbnRyb2w+dGhpcy5jb25maWcuY29udHJvbDtcblxuICAgICAgY29udHJvbC5lbmFibGUoKTtcbiAgICAgIHBhdGNoLnJ1bm5pbmcgPSBmYWxzZTtcblxuICAgICAgdGhpcy5zd2l0Y2hSZWYuY2hlY2tlZCA9IHRoaXMuYXNzZXQuc3RvcmVkVmFsdWU7XG5cbiAgICAgIHJldHVybiByZXNvbHZlKCB0cnVlICk7XG4gICAgfSApO1xuICB9XG5cblxuICAvKipcbiAgICogVGhlIGRvbSBkZXN0cm95IGZ1bmN0aW9uIG1hbmFnZXMgYWxsIHRoZSBjbGVhbiB1cCB0aGF0IGlzIG5lY2Vzc2FyeSBpZiBzdWJzY3JpcHRpb25zLCB0aW1lb3V0cywgZXRjIGFyZSBzdG9yZWQgcHJvcGVybHlcbiAgICovXG4gIG5nT25EZXN0cm95KCl7XG4gICAgc3VwZXIubmdPbkRlc3Ryb3koKTtcbiAgfVxuXG5cbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBVbmRlciBUaGUgSG9vZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIFByaXZhdGUgTWV0aG9kICkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbn1cbiJdfQ==