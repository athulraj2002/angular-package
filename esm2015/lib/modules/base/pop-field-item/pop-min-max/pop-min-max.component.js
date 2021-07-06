import { ChangeDetectorRef, Component, ElementRef, Input } from '@angular/core';
import { PopFieldItemComponent } from '../pop-field-item.component';
import { IsObjectThrowError } from '../../../../pop-common-utility';
export class PopMinMaxComponent extends PopFieldItemComponent {
    constructor(el, cdr) {
        super();
        this.el = el;
        this.cdr = cdr;
        this.name = 'PopMinMaxComponent';
        this.asset.delay = 250;
        /**
         * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
         */
        this.dom.configure = () => {
            return new Promise((resolve) => {
                this.config = IsObjectThrowError(this.config, true, `${this.name}:configure: - this.config`) ? this.config : null;
                this.config.triggerOnChange = (value) => {
                    this._setControlValue();
                    this.cdr.detectChanges();
                    this.onChange(value, true);
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
    onIsMaxEvent(event) {
        if (this._isFieldChange(event)) {
            this.config.maxConfig.control.setValue((event.config.control.value ? (+this.config.control.value[this.config.minColumn] ? +this.config.control.value[this.config.minColumn] : +this.config.maxDefaultValue) : null));
            this._triggerMaxChange();
        }
    }
    onIsMinEvent(event) {
        if (this._isFieldChange(event)) {
            console.log('onIsMinEvent', event.config.control.value);
            this.config.minConfig.control.setValue((event.config.control.value ? +this.config.minDefaultValue : null));
        }
    }
    onMinEvent(event) {
        // console.log('onMinEvent', event);
        if (this._isFieldChange(event)) {
            this._triggerMinChange();
        }
    }
    onMaxEvent(event) {
        // console.log('onMaxEvent', event);
        if (this._isFieldChange(event)) {
            this._triggerMaxChange();
        }
    }
    onDecrementMin() {
        const control = this.config.minConfig.control;
        const newVal = +this.config.minConfig.control.value - 1;
        if ((newVal) >= 1) {
            control.setValue(newVal);
            this._triggerMinChange();
        }
    }
    onIncrementMin() {
        const control = this.config.minConfig.control;
        const newVal = +this.config.minConfig.control.value + 1;
        const maxVal = +this.config.maxConfig.control.value;
        if ((newVal) <= maxVal) {
            control.setValue(newVal);
            this.dom.setTimeout('on-change', () => {
                this._clearMessage();
                this._setControlValue();
                this.onChange(undefined, true);
            }, this.asset.delay);
        }
    }
    onDecrementMax() {
        const control = this.config.maxConfig.control;
        const newVal = +this.config.maxConfig.control.value - 1;
        if ((newVal) >= 1) {
            control.setValue(newVal);
            this._triggerMaxChange();
        }
    }
    onIncrementMax() {
        const control = this.config.maxConfig.control;
        const newVal = +this.config.maxConfig.control.value + 1;
        if ((newVal) <= this.config.limit) {
            control.setValue(newVal);
            this._triggerMaxChange();
        }
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
    _triggerMinChange() {
        this.dom.setTimeout('on-change', () => {
            this._clearMessage();
            this._setControlValue();
            this.onChange(undefined, true);
        }, this.asset.delay);
    }
    _triggerMaxChange() {
        this.dom.setTimeout('on-change', () => {
            this._clearMessage();
            this._updateMinOptions();
            this._setControlValue();
            this.onChange(undefined, true);
        }, this.asset.delay);
    }
    _updateMinOptions() {
        // let minLimit = this.config.maxConfig.control.value;
        // const minOptions = [];
        // while( minLimit ){
        //   minOptions.push({ value: minLimit, name: minLimit, sort: minLimit });
        //   minLimit--;
        // }
        // this.config.minConfig.options = minOptions;
    }
    _setControlValue() {
        const maxValue = this.config.maxConfig.control.value;
        let minValue = this.config.minConfig.control.value;
        if (!this.config.allowNegative && minValue < 0) {
            minValue = 0;
            this.config.minConfig.control.setValue(minValue);
        }
        if (maxValue && +minValue > +maxValue) {
            minValue = maxValue;
            this.config.minConfig.control.setValue(minValue);
        }
        const value = {};
        value[this.config.minColumn] = (minValue ? +minValue : minValue);
        value[this.config.maxColumn] = (maxValue ? +maxValue : maxValue);
        this.config.control.value = value;
    }
}
PopMinMaxComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-min-max',
                template: "<div class=\"pop-minmax-container import-field-item-container import-flex-column\">\n  <div class=\"pop-minmax-feedback\" *ngIf=\"!config.minimal\">\n    <div class=\"pop-minmax-error-icon sw-pointer\"\n      [ngClass]=\"{'sw-hidden': !config.message}\"\n      matTooltipPosition=\"left\"\n      [matTooltip]=config.message>\n      <mat-icon color=\"warn\">info</mat-icon>\n    </div>\n  </div>\n  <div class=\"import-flex-row\">\n    {{config.label}}\n    <span\n      *ngIf=\"config.helpText\"\n      class=\"pop-minmax-helper-icon sw-pointer sw-pop-icon\"\n      (mouseenter)=\"dom.state.helper = true\"\n      (mouseleave)=\"dom.state.helper = false\"\n      matTooltip=\"{{config.helpText}}\"\n      matTooltipPosition=\"right\">X\n      </span>\n  </div>\n  <div class=\"import-flex-column pop-minmax-content\" [ngClass]=\"{'sw-disabled': config.patch.running}\">\n    <div class=\"import-flex-row import-flex-item-full\">\n      <div class=\"import-flex-item-md import-flex-grow-xs\">\n        <lib-pop-switch [config]=config.isMinConfig (events)=\"onIsMinEvent($event);\"></lib-pop-switch>\n      </div>\n      <div class=\"import-flex-item-xs sw-relative\">\n      </div>\n      <div class=\"import-flex-item-sm\">\n        <lib-pop-number *ngIf=\"config.isMinConfig.control.value\" [config]=config.minConfig (events)=\"onMaxEvent($event);\"></lib-pop-number>\n      </div>\n      <div class=\"import-flex-item-xs sw-relative\">\n      </div>\n    </div>\n\n    <div class=\"import-flex-row import-flex-item-full\">\n      <div class=\"import-flex-item-md import-flex-grow-xs\">\n        <lib-pop-switch [config]=config.isMaxConfig (events)=\"onIsMaxEvent($event);\"></lib-pop-switch>\n      </div>\n\n      <div class=\"import-flex-item-xs sw-relative\">\n      </div>\n\n      <div class=\"import-flex-item-sm\">\n        <lib-pop-number [ngClass]=\"{'sw-disabled': !config.isMaxConfig.control.value}\" [config]=config.maxConfig (events)=\"onMaxEvent($event);\"></lib-pop-number>\n      </div>\n      <div class=\"import-flex-item-xs sw-relative\">\n      </div>\n    </div>\n  </div>\n  <lib-pop-field-item-loader [show]=\"config.patch.displayIndicator && config.patch.running\"></lib-pop-field-item-loader>\n</div>\n",
                styles: [".import-text-xs{font-size:.8em}.import-text-sm{font-size:.9em}.import-text-md{font-size:1em}.import-text-lg{font-size:1.1em}.import-text-xlg{font-size:1.2em}.sw-pad-xs{padding:var(--xs)}.sw-pad-md,.sw-pad-sm{padding:var(--md)}.sw-pad-lg{padding:var(--lg)}.sw-pad-xlg{padding:var(--xlg)}.sw-pad-hrz-xs{padding-left:var(--xs);padding-right:var(--xs)}.sw-pad-hrz-sm{padding-left:var(--sm);padding-right:var(--sm)}.sw-pad-hrz-md{padding-left:var(--md);padding-right:var(--md)}.sw-pad-hrz-lg{padding-left:var(--lg);padding-right:var(--lg)}.sw-pad-hrz-xlg{padding-left:var(--xlg);padding-right:var(--xlg)}.sw-pad-vrt-xs{padding-top:var(--xs);padding-bottom:var(--xs)}.sw-pad-vrt-md,.sw-pad-vrt-sm{padding-top:var(--md);padding-bottom:var(--md)}.sw-pad-vrt-lg{padding-top:var(--lg);padding-bottom:var(--lg)}.sw-pad-vrt-xlg{padding-top:var(--xlg);padding-bottom:var(--xlg)}.sw-pad-lft-xs{padding-left:var(--xs)}.sw-pad-lft-sm{padding-left:var(--sm)}.sw-pad-lft-md{padding-left:var(--md)}.sw-pad-lft-lg{padding-left:var(--lg)}.sw-pad-lft-xlg{padding-left:var(--xlg)}.sw-pad-rgt-xs{padding-right:var(--xs)}.sw-pad-rgt-sm{padding-right:var(--sm)}.sw-pad-rgt-md{padding-right:var(--md)}.sw-pad-rgt-lg{padding-right:var(--lg)}.sw-pad-rgt-xlg{padding-right:var(--xlg)}.sw-pad-btm-xs{padding-bottom:var(--xs)}.sw-pad-btm-sm{padding-bottom:var(--sm)}.sw-pad-btm-md{padding-bottom:var(--md)}.sw-pad-btm-lg{padding-bottom:var(--lg)}.sw-pad-btm-xlg{padding-bottom:var(--xlg)}.sw-pad-top-xs{padding-top:var(--xs)}.sw-pad-top-sm{padding-top:var(--sm)}.sw-pad-top-md{padding-top:var(--md)}.sw-pad-top-lg{padding-top:var(--lg)}.sw-pad-top-xlg{padding-top:var(--xlg)}.sw-mar-xs{margin:var(--xs)}.sw-mar-sm{margin:var(--sm)}.sw-mar-md{margin:var(--md)}.sw-mar-lg{margin:var(--lg)}.sw-mar-xlg{margin:var(--xlg)}.sw-mar-hrz-xs{margin-left:var(--xs);margin-right:var(--xs)}.sw-mar-hrz-md,.sw-mar-hrz-sm{margin-left:var(--md);margin-right:var(--md)}.sw-mar-hrz-lg{margin-left:var(--lg);margin-right:var(--lg)}.sw-mar-hrz-xlg{margin-left:var(--xlg);margin-right:var(--xlg)}.sw-mar-vrt-xs{margin-top:var(--xs);margin-bottom:var(--xs)}.sw-mar-vrt-md,.sw-mar-vrt-sm{margin-top:var(--md);margin-bottom:var(--md)}.sw-mar-vrt-lg{margin-top:var(--lg);margin-bottom:var(--lg)}.sw-mar-vrt-xlg{margin-top:var(--xlg);margin-bottom:var(--xlg)}.sw-mar-lft-xs{margin-left:var(--xs)}.sw-mar-lft-sm{margin-left:var(--sm)}.sw-mar-lft-md{margin-left:var(--md)}.sw-mar-lft-lg{margin-left:var(--lg)}.sw-mar-lft-xlg{margin-left:var(--xlg)}.sw-mar-rgt-xs{margin-right:var(--xs)}.sw-mar-rgt-sm{margin-right:var(--sm)}.sw-mar-rgt-md{margin-right:var(--md)}.sw-mar-rgt-lg{margin-right:var(--lg)}.sw-mar-rgt-xlg{margin-right:var(--xlg)}.sw-mar-btm-xs{margin-bottom:var(--xs)}.sw-mar-btm-sm{margin-bottom:var(--sm)}.sw-mar-btm-md{margin-bottom:var(--md)}.sw-mar-btm-lg{margin-bottom:var(--lg)}.sw-mar-btm-xlg{margin-bottom:var(--xlg)}.sw-mar-top-xs{margin-top:var(--xs)}.sw-mar-top-sm{margin-top:var(--sm)}.sw-mar-top-md{margin-top:var(--md)}.sw-mar-top-lg{margin-top:var(--lg)}.sw-mar-top-xlg{margin-top:var(--xlg)}:host{position:relative;display:block;width:100%;box-sizing:border-box}.pop-minmax-container ::ng-deep .mat-slide-toggle-content{padding-right:5px!important}.pop-minmax-container ::ng-deep .pop-minmax-content .mat-form-field-infix{width:auto;padding:6px 0!important;margin-top:6px!important;border:0!important;font-size:.9em}.pop-minmax-label{display:flex;justify-content:flex-start;align-items:center}.pop-minmax-content{min-height:40px;clear:both;font-size:.9em}.pop-minmax-content-section{min-height:40px}.pop-minmax-helper-icon{position:relative;top:4px;margin-left:5px;font-size:.7em;z-index:2}.pop-minmax-feedback{position:absolute;top:0;right:5px;width:20px;height:20px}.pop-minmax-error-icon{position:relative;z-index:2;top:-2px}"]
            },] }
];
PopMinMaxComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: ChangeDetectorRef }
];
PopMinMaxComponent.propDecorators = {
    config: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLW1pbi1tYXguY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvYmFzZS9wb3AtZmllbGQtaXRlbS9wb3AtbWluLW1heC9wb3AtbWluLW1heC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGlCQUFpQixFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFxQixNQUFNLGVBQWUsQ0FBQztBQUNuRyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUdwRSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQVFwRSxNQUFNLE9BQU8sa0JBQW1CLFNBQVEscUJBQXFCO0lBTTNELFlBQ1MsRUFBYyxFQUNYLEdBQXNCO1FBRWhDLEtBQUssRUFBRSxDQUFDO1FBSEQsT0FBRSxHQUFGLEVBQUUsQ0FBWTtRQUNYLFFBQUcsR0FBSCxHQUFHLENBQW1CO1FBTDNCLFNBQUksR0FBRyxvQkFBb0IsQ0FBQztRQVNqQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUM7UUFFdkI7O1dBRUc7UUFDSCxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxHQUFxQixFQUFFO1lBQzFDLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtnQkFDN0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLDJCQUEyQixDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztnQkFFbEgsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEdBQUcsQ0FBQyxLQUE2QixFQUFF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QztRQUNyRCxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO1FBQ25ELElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsSUFBSSxRQUFRLEdBQUcsQ0FBQyxFQUFFO1lBQzlDLFFBQVEsR0FBRyxDQUFDLENBQUM7WUFDYixJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ2xEO1FBQ0QsSUFBSSxRQUFRLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxRQUFRLEVBQUU7WUFDckMsUUFBUSxHQUFHLFFBQVEsQ0FBQztZQUNwQixJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ2xEO1FBRUQsTUFBTSxLQUFLLEdBQUcsRUFBRSxDQUFDO1FBQ2pCLEtBQUssQ0FBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBRSxHQUFHLENBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFFLENBQUM7UUFDckUsS0FBSyxDQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFFLEdBQUcsQ0FBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUUsQ0FBQztRQUNyRSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ3BDLENBQUM7OztZQXpMRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLGlCQUFpQjtnQkFDM0IsaXNFQUEyQzs7YUFFNUM7OztZQVhzQyxVQUFVO1lBQXhDLGlCQUFpQjs7O3FCQWF2QixLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2hhbmdlRGV0ZWN0b3JSZWYsIENvbXBvbmVudCwgRWxlbWVudFJlZiwgSW5wdXQsIE9uRGVzdHJveSwgT25Jbml0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBQb3BGaWVsZEl0ZW1Db21wb25lbnQgfSBmcm9tICcuLi9wb3AtZmllbGQtaXRlbS5jb21wb25lbnQnO1xuaW1wb3J0IHsgTWluTWF4Q29uZmlnIH0gZnJvbSAnLi9taW4tbWF4Lm1vZGVscyc7XG5pbXBvcnQgeyBQb3BCYXNlRXZlbnRJbnRlcmZhY2UgfSBmcm9tICcuLi8uLi8uLi8uLi9wb3AtY29tbW9uLm1vZGVsJztcbmltcG9ydCB7IElzT2JqZWN0VGhyb3dFcnJvciB9IGZyb20gJy4uLy4uLy4uLy4uL3BvcC1jb21tb24tdXRpbGl0eSc7XG5cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbGliLXBvcC1taW4tbWF4JyxcbiAgdGVtcGxhdGVVcmw6ICcuL3BvcC1taW4tbWF4LmNvbXBvbmVudC5odG1sJyxcbiAgc3R5bGVVcmxzOiBbICcuL3BvcC1taW4tbWF4LmNvbXBvbmVudC5zY3NzJyBdXG59KVxuZXhwb3J0IGNsYXNzIFBvcE1pbk1heENvbXBvbmVudCBleHRlbmRzIFBvcEZpZWxkSXRlbUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcbiAgQElucHV0KCkgY29uZmlnOiBNaW5NYXhDb25maWc7XG5cbiAgcHVibGljIG5hbWUgPSAnUG9wTWluTWF4Q29tcG9uZW50JztcblxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBlbDogRWxlbWVudFJlZixcbiAgICBwcm90ZWN0ZWQgY2RyOiBDaGFuZ2VEZXRlY3RvclJlZlxuICApe1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLmFzc2V0LmRlbGF5ID0gMjUwO1xuXG4gICAgLyoqXG4gICAgICogVGhpcyBzaG91bGQgdHJhbnNmb3JtIGFuZCB2YWxpZGF0ZSB0aGUgZGF0YS4gVGhlIHZpZXcgc2hvdWxkIHRyeSB0byBvbmx5IHVzZSBkYXRhIHRoYXQgaXMgc3RvcmVkIG9uIHVpIHNvIHRoYXQgaXQgaXMgbm90IGRlcGVuZGVudCBvbiB0aGUgc3RydWN0dXJlIG9mIGRhdGEgdGhhdCBjb21lcyBmcm9tIG90aGVyIHNvdXJjZXMuIFRoZSB1aSBzaG91bGQgYmUgdGhlIHNvdXJjZSBvZiB0cnV0aCBoZXJlLlxuICAgICAqL1xuICAgIHRoaXMuZG9tLmNvbmZpZ3VyZSA9ICgpOiBQcm9taXNlPGJvb2xlYW4+ID0+IHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICB0aGlzLmNvbmZpZyA9IElzT2JqZWN0VGhyb3dFcnJvcih0aGlzLmNvbmZpZywgdHJ1ZSwgYCR7dGhpcy5uYW1lfTpjb25maWd1cmU6IC0gdGhpcy5jb25maWdgKSA/IHRoaXMuY29uZmlnIDogbnVsbDtcblxuICAgICAgICB0aGlzLmNvbmZpZy50cmlnZ2VyT25DaGFuZ2UgPSAodmFsdWU6IHN0cmluZyB8IG51bWJlciB8IG51bGwpID0+IHtcbiAgICAgICAgICB0aGlzLl9zZXRDb250cm9sVmFsdWUoKTtcbiAgICAgICAgICB0aGlzLmNkci5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgICAgICAgdGhpcy5vbkNoYW5nZSh2YWx1ZSwgdHJ1ZSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH0pO1xuICAgIH07XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIGNvbXBvbmVudCBzaG91bGQgaGF2ZSBhIHNwZWNpZmljIHB1cnBvc2VcbiAgICovXG4gIG5nT25Jbml0KCl7XG4gICAgc3VwZXIubmdPbkluaXQoKTtcbiAgfVxuXG5cbiAgb25Jc01heEV2ZW50KGV2ZW50OiBQb3BCYXNlRXZlbnRJbnRlcmZhY2Upe1xuICAgIGlmKCB0aGlzLl9pc0ZpZWxkQ2hhbmdlKGV2ZW50KSApe1xuICAgICAgdGhpcy5jb25maWcubWF4Q29uZmlnLmNvbnRyb2wuc2V0VmFsdWUoKCBldmVudC5jb25maWcuY29udHJvbC52YWx1ZSA/ICggK3RoaXMuY29uZmlnLmNvbnRyb2wudmFsdWVbdGhpcy5jb25maWcubWluQ29sdW1uXSA/ICt0aGlzLmNvbmZpZy5jb250cm9sLnZhbHVlW3RoaXMuY29uZmlnLm1pbkNvbHVtbl0gOiArdGhpcy5jb25maWcubWF4RGVmYXVsdFZhbHVlICkgOiBudWxsICkpO1xuICAgICAgdGhpcy5fdHJpZ2dlck1heENoYW5nZSgpO1xuICAgIH1cbiAgfVxuXG5cbiAgb25Jc01pbkV2ZW50KGV2ZW50OiBQb3BCYXNlRXZlbnRJbnRlcmZhY2Upe1xuICAgIGlmKCB0aGlzLl9pc0ZpZWxkQ2hhbmdlKGV2ZW50KSApe1xuICAgICAgY29uc29sZS5sb2coJ29uSXNNaW5FdmVudCcsIGV2ZW50LmNvbmZpZy5jb250cm9sLnZhbHVlKTtcbiAgICAgIHRoaXMuY29uZmlnLm1pbkNvbmZpZy5jb250cm9sLnNldFZhbHVlKCggZXZlbnQuY29uZmlnLmNvbnRyb2wudmFsdWUgPyArdGhpcy5jb25maWcubWluRGVmYXVsdFZhbHVlIDogbnVsbCApKTtcbiAgICB9XG4gIH1cblxuXG4gIG9uTWluRXZlbnQoZXZlbnQ6IFBvcEJhc2VFdmVudEludGVyZmFjZSl7XG4gICAgLy8gY29uc29sZS5sb2coJ29uTWluRXZlbnQnLCBldmVudCk7XG4gICAgaWYoIHRoaXMuX2lzRmllbGRDaGFuZ2UoZXZlbnQpICl7XG4gICAgICB0aGlzLl90cmlnZ2VyTWluQ2hhbmdlKCk7XG4gICAgfVxuICB9XG5cblxuICBvbk1heEV2ZW50KGV2ZW50OiBQb3BCYXNlRXZlbnRJbnRlcmZhY2Upe1xuICAgIC8vIGNvbnNvbGUubG9nKCdvbk1heEV2ZW50JywgZXZlbnQpO1xuICAgIGlmKCB0aGlzLl9pc0ZpZWxkQ2hhbmdlKGV2ZW50KSApe1xuICAgICAgdGhpcy5fdHJpZ2dlck1heENoYW5nZSgpO1xuICAgIH1cbiAgfVxuXG5cbiAgb25EZWNyZW1lbnRNaW4oKXtcbiAgICBjb25zdCBjb250cm9sID0gdGhpcy5jb25maWcubWluQ29uZmlnLmNvbnRyb2w7XG4gICAgY29uc3QgbmV3VmFsID0gK3RoaXMuY29uZmlnLm1pbkNvbmZpZy5jb250cm9sLnZhbHVlIC0gMTtcbiAgICBpZiggKCBuZXdWYWwgKSA+PSAxICl7XG4gICAgICBjb250cm9sLnNldFZhbHVlKG5ld1ZhbCk7XG4gICAgICB0aGlzLl90cmlnZ2VyTWluQ2hhbmdlKCk7XG4gICAgfVxuICB9XG5cblxuICBvbkluY3JlbWVudE1pbigpe1xuICAgIGNvbnN0IGNvbnRyb2wgPSB0aGlzLmNvbmZpZy5taW5Db25maWcuY29udHJvbDtcbiAgICBjb25zdCBuZXdWYWwgPSArdGhpcy5jb25maWcubWluQ29uZmlnLmNvbnRyb2wudmFsdWUgKyAxO1xuICAgIGNvbnN0IG1heFZhbCA9ICt0aGlzLmNvbmZpZy5tYXhDb25maWcuY29udHJvbC52YWx1ZTtcbiAgICBpZiggKCBuZXdWYWwgKSA8PSBtYXhWYWwgKXtcbiAgICAgIGNvbnRyb2wuc2V0VmFsdWUobmV3VmFsKTtcbiAgICAgIHRoaXMuZG9tLnNldFRpbWVvdXQoJ29uLWNoYW5nZScsICgpID0+IHtcbiAgICAgICAgdGhpcy5fY2xlYXJNZXNzYWdlKCk7XG4gICAgICAgIHRoaXMuX3NldENvbnRyb2xWYWx1ZSgpO1xuICAgICAgICB0aGlzLm9uQ2hhbmdlKHVuZGVmaW5lZCwgdHJ1ZSk7XG4gICAgICB9LCB0aGlzLmFzc2V0LmRlbGF5KTtcbiAgICB9XG4gIH1cblxuXG4gIG9uRGVjcmVtZW50TWF4KCl7XG4gICAgY29uc3QgY29udHJvbCA9IHRoaXMuY29uZmlnLm1heENvbmZpZy5jb250cm9sO1xuICAgIGNvbnN0IG5ld1ZhbCA9ICt0aGlzLmNvbmZpZy5tYXhDb25maWcuY29udHJvbC52YWx1ZSAtIDE7XG4gICAgaWYoICggbmV3VmFsICkgPj0gMSApe1xuICAgICAgY29udHJvbC5zZXRWYWx1ZShuZXdWYWwpO1xuICAgICAgdGhpcy5fdHJpZ2dlck1heENoYW5nZSgpO1xuICAgIH1cbiAgfVxuXG5cbiAgb25JbmNyZW1lbnRNYXgoKXtcbiAgICBjb25zdCBjb250cm9sID0gdGhpcy5jb25maWcubWF4Q29uZmlnLmNvbnRyb2w7XG4gICAgY29uc3QgbmV3VmFsID0gK3RoaXMuY29uZmlnLm1heENvbmZpZy5jb250cm9sLnZhbHVlICsgMTtcbiAgICBpZiggKCBuZXdWYWwgKSA8PSB0aGlzLmNvbmZpZy5saW1pdCApe1xuICAgICAgY29udHJvbC5zZXRWYWx1ZShuZXdWYWwpO1xuICAgICAgdGhpcy5fdHJpZ2dlck1heENoYW5nZSgpO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoZSBkb20gZGVzdHJveSBmdW5jdGlvbiBtYW5hZ2VzIGFsbCB0aGUgY2xlYW4gdXAgdGhhdCBpcyBuZWNlc3NhcnkgaWYgc3Vic2NyaXB0aW9ucywgdGltZW91dHMsIGV0YyBhcmUgc3RvcmVkIHByb3Blcmx5XG4gICAqL1xuICBuZ09uRGVzdHJveSgpe1xuICAgIHN1cGVyLm5nT25EZXN0cm95KCk7XG4gIH1cblxuXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVW5kZXIgVGhlIEhvb2QgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBQcml2YXRlIE1ldGhvZCApICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG5cbiAgcHJpdmF0ZSBfdHJpZ2dlck1pbkNoYW5nZSgpe1xuICAgIHRoaXMuZG9tLnNldFRpbWVvdXQoJ29uLWNoYW5nZScsICgpID0+IHtcbiAgICAgIHRoaXMuX2NsZWFyTWVzc2FnZSgpO1xuICAgICAgdGhpcy5fc2V0Q29udHJvbFZhbHVlKCk7XG4gICAgICB0aGlzLm9uQ2hhbmdlKHVuZGVmaW5lZCwgdHJ1ZSk7XG4gICAgfSwgdGhpcy5hc3NldC5kZWxheSk7XG4gIH1cblxuXG4gIHByaXZhdGUgX3RyaWdnZXJNYXhDaGFuZ2UoKXtcbiAgICB0aGlzLmRvbS5zZXRUaW1lb3V0KCdvbi1jaGFuZ2UnLCAoKSA9PiB7XG4gICAgICB0aGlzLl9jbGVhck1lc3NhZ2UoKTtcbiAgICAgIHRoaXMuX3VwZGF0ZU1pbk9wdGlvbnMoKTtcbiAgICAgIHRoaXMuX3NldENvbnRyb2xWYWx1ZSgpO1xuICAgICAgdGhpcy5vbkNoYW5nZSh1bmRlZmluZWQsIHRydWUpO1xuICAgIH0sIHRoaXMuYXNzZXQuZGVsYXkpO1xuICB9XG5cblxuICBwcml2YXRlIF91cGRhdGVNaW5PcHRpb25zKCl7XG4gICAgLy8gbGV0IG1pbkxpbWl0ID0gdGhpcy5jb25maWcubWF4Q29uZmlnLmNvbnRyb2wudmFsdWU7XG4gICAgLy8gY29uc3QgbWluT3B0aW9ucyA9IFtdO1xuICAgIC8vIHdoaWxlKCBtaW5MaW1pdCApe1xuICAgIC8vICAgbWluT3B0aW9ucy5wdXNoKHsgdmFsdWU6IG1pbkxpbWl0LCBuYW1lOiBtaW5MaW1pdCwgc29ydDogbWluTGltaXQgfSk7XG4gICAgLy8gICBtaW5MaW1pdC0tO1xuICAgIC8vIH1cbiAgICAvLyB0aGlzLmNvbmZpZy5taW5Db25maWcub3B0aW9ucyA9IG1pbk9wdGlvbnM7XG4gIH1cblxuXG4gIHByaXZhdGUgX3NldENvbnRyb2xWYWx1ZSgpe1xuICAgIGNvbnN0IG1heFZhbHVlID0gdGhpcy5jb25maWcubWF4Q29uZmlnLmNvbnRyb2wudmFsdWU7XG4gICAgbGV0IG1pblZhbHVlID0gdGhpcy5jb25maWcubWluQ29uZmlnLmNvbnRyb2wudmFsdWU7XG4gICAgaWYoICF0aGlzLmNvbmZpZy5hbGxvd05lZ2F0aXZlICYmIG1pblZhbHVlIDwgMCApe1xuICAgICAgbWluVmFsdWUgPSAwO1xuICAgICAgdGhpcy5jb25maWcubWluQ29uZmlnLmNvbnRyb2wuc2V0VmFsdWUobWluVmFsdWUpO1xuICAgIH1cbiAgICBpZiggbWF4VmFsdWUgJiYgK21pblZhbHVlID4gK21heFZhbHVlICl7XG4gICAgICBtaW5WYWx1ZSA9IG1heFZhbHVlO1xuICAgICAgdGhpcy5jb25maWcubWluQ29uZmlnLmNvbnRyb2wuc2V0VmFsdWUobWluVmFsdWUpO1xuICAgIH1cblxuICAgIGNvbnN0IHZhbHVlID0ge307XG4gICAgdmFsdWVbIHRoaXMuY29uZmlnLm1pbkNvbHVtbiBdID0gKCBtaW5WYWx1ZSA/ICttaW5WYWx1ZSA6IG1pblZhbHVlICk7XG4gICAgdmFsdWVbIHRoaXMuY29uZmlnLm1heENvbHVtbiBdID0gKCBtYXhWYWx1ZSA/ICttYXhWYWx1ZSA6IG1heFZhbHVlICk7XG4gICAgdGhpcy5jb25maWcuY29udHJvbC52YWx1ZSA9IHZhbHVlO1xuICB9XG59XG4iXX0=