import { ChangeDetectorRef, Component, ElementRef, Input } from '@angular/core';
import { TimeConfig } from './time-config.model';
import { PopFieldItemComponent } from '../pop-field-item.component';
export class PopTimeComponent extends PopFieldItemComponent {
    constructor(el, cdr) {
        super();
        this.el = el;
        this.cdr = cdr;
        this.config = new TimeConfig();
        this.name = 'PopTimeComponent';
        /**
         * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
         */
        this.dom.configure = () => {
            return new Promise((resolve) => {
                this.config.time = 12;
                this.ui.time = {
                    12: {
                        hours: [],
                        minutes: [],
                        periods: ['AM', 'PM']
                    },
                    24: {
                        hours: [],
                        minutes: [],
                        periods: []
                    },
                    selectedHour: '12',
                    selectedMinute: '00',
                    selectedPeriod: 'AM',
                };
                this.setHoursAndMinutes();
                this.setSelectedValues();
                this.config.triggerOnChange = (value) => {
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
    setSelectedValues() {
        const time = this.ui.time;
        const timeValue = this.config.control.value;
        const minuteValue = timeValue.slice(2, 5).replace(/[^a-zA-Z0-9]/g, '').padStart(2, '0');
        let hourValue = timeValue.slice(0, 2).replace(/[^a-zA-Z0-9]/g, '').padStart(2, '0');
        hourValue = ((hourValue % 12) || 12).toString(10).padStart(2, '0');
        if (Number(hourValue) > 12 && this.config.time === 12)
            time.selectedPeriod = 'PM';
        if (timeValue)
            time.selectedHour = hourValue;
        time.selectedMinute = minuteValue;
    }
    setHoursAndMinutes() {
        let i;
        const hourLimit = this.config.time === 12 ? 12 : 23;
        for (i = 1; i <= hourLimit; i++) {
            this.ui.time[this.config.time].hours.push(i.toString().padStart(2, '0'));
        }
        for (i = 0; i < 60; i += this.config.interval) {
            this.ui.time[this.config.time].minutes.push(i.toString().padStart(2, '0'));
        }
    }
    setTimeValue() {
        let selectedHour = this.ui.time.selectedHour;
        if (this.ui.time.selectedPeriod === 'AM' && Number(selectedHour) === 12)
            selectedHour = '00';
        if (this.ui.time.selectedPeriod === 'PM' && Number(selectedHour) > 12)
            selectedHour = (12 + Number(selectedHour)).toString(10);
        const selectedTime = selectedHour + ':' + this.ui.time.selectedMinute + ':00';
        this.config.control.setValue(selectedTime, { emitEvent: false });
    }
}
PopTimeComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-time',
                template: "<div class=\"pop-time-container\">\n  <div *ngIf=\"config.label\" class=\"pop-time-container-legend import-field-item-container\">{{config.label}}</div>\n  <div class=\"pop-time-row-container\">\n    <mat-label class=\"time-column column-height\">\n      <mat-icon>schedule</mat-icon>\n    </mat-label>\n    <mat-form-field class=\"time-column align-column\">\n      <mat-select [(value)]=\"ui.time.selectedHour\"\n                  (selectionChange)=\"onChange();\">\n        <mat-option *ngFor=\"let hour of ui.time[config.time].hours\" [value]=hour>\n          {{hour}}\n        </mat-option>\n      </mat-select>\n    </mat-form-field>\n    <mat-label class=\"time-column column-height\">:</mat-label>\n    <mat-form-field class=\"time-column align-column\">\n      <mat-select [(value)]=\"ui.time.selectedMinute\"\n                  (selectionChange)=\"onChange();\">\n        <mat-option *ngFor=\"let minute of ui.time[config.time].minutes\" [value]=minute>\n          {{minute}}\n        </mat-option>\n      </mat-select>\n    </mat-form-field>\n    <mat-form-field *ngIf=\"ui.time[config.time].periods.length\" class=\"time-column align-column\">\n      <mat-select [(value)]=\"ui.time.selectedPeriod\"\n                  (selectionChange)=\"onChange();\">\n        <mat-option *ngFor=\"let period of ui.time[config.time].periods\" [value]=period>\n          {{period}}\n        </mat-option>\n      </mat-select>\n    </mat-form-field>\n  </div>\n</div>\n\n",
                styles: [".pop-time-container ::ng-deep .mat-form-field-appearance-outline .mat-form-field-subscript-wrapper{display:none}.pop-time-container ::ng-deep .mat-form-field-appearance-outline .mat-form-field-wrapper{padding-bottom:0;margin:0!important}.pop-time-container ::ng-deep .mat-form-field-appearance-outline .mat-form-field-infix{padding:8px 20px 13px 0}.pop-time-container ::ng-deep .mat-form-field-underline{display:none}.pop-time-container ::ng-deep .date-column .mat-form-field-infix{padding-left:3px}:host ::ng-deep .mat-form-field-appearance-outline .mat-form-field-wrapper{padding-bottom:unset}.pop-time-container-legend{font-size:11px;position:relative;margin-top:-15px;margin-bottom:-5px;clear:both;z-index:1;width:-webkit-fit-content;width:-moz-fit-content;width:fit-content;color:var(--text-2);background:var(--bg-3)}.pop-time-row-container{text-align:center;position:relative;display:flex;flex:1 1 100%;padding:0;flex-direction:row;justify-content:flex-start;align-items:center}.time-column{position:relative;display:flex;top:-8px;flex-direction:column;width:26%;flex-grow:1;margin-right:2px}.column-height{height:27px}.align-column{text-align:center}"]
            },] }
];
PopTimeComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: ChangeDetectorRef }
];
PopTimeComponent.propDecorators = {
    config: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLXRpbWUuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvYmFzZS9wb3AtZmllbGQtaXRlbS9wb3AtdGltZS9wb3AtdGltZS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGlCQUFpQixFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFxQixNQUFNLGVBQWUsQ0FBQztBQUNuRyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDakQsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFRcEUsTUFBTSxPQUFPLGdCQUFpQixTQUFRLHFCQUFxQjtJQUt6RCxZQUNTLEVBQWMsRUFDWCxHQUFzQjtRQUVoQyxLQUFLLEVBQUUsQ0FBQztRQUhELE9BQUUsR0FBRixFQUFFLENBQVk7UUFDWCxRQUFHLEdBQUgsR0FBRyxDQUFtQjtRQU56QixXQUFNLEdBQWUsSUFBSSxVQUFVLEVBQUUsQ0FBQztRQUN4QyxTQUFJLEdBQUcsa0JBQWtCLENBQUM7UUFTL0I7O1dBRUc7UUFDSCxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxHQUFxQixFQUFFO1lBQzFDLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtnQkFFN0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO2dCQUN0QixJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksR0FBRztvQkFDYixFQUFFLEVBQUU7d0JBQ0YsS0FBSyxFQUFFLEVBQUU7d0JBQ1QsT0FBTyxFQUFFLEVBQUU7d0JBQ1gsT0FBTyxFQUFFLENBQUUsSUFBSSxFQUFFLElBQUksQ0FBRTtxQkFFeEI7b0JBQ0QsRUFBRSxFQUFFO3dCQUNGLEtBQUssRUFBRSxFQUFFO3dC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SUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7U0FDOUU7SUFDSCxDQUFDO0lBR1MsWUFBWTtRQUNwQixJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUM7UUFDN0MsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLEtBQUssSUFBSSxJQUFJLE1BQU0sQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFO1lBQUcsWUFBWSxHQUFHLElBQUksQ0FBQztRQUM5RixJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGNBQWMsS0FBSyxJQUFJLElBQUksTUFBTSxDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQUU7WUFBRyxZQUFZLEdBQUcsQ0FBRSxFQUFFLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2xJLE1BQU0sWUFBWSxHQUFHLFlBQVksR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQztRQUM5RSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7SUFDbkUsQ0FBQzs7O1lBMUdGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsY0FBYztnQkFDeEIsdThDQUF3Qzs7YUFFekM7OztZQVRzQyxVQUFVO1lBQXhDLGlCQUFpQjs7O3FCQVd2QixLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2hhbmdlRGV0ZWN0b3JSZWYsIENvbXBvbmVudCwgRWxlbWVudFJlZiwgSW5wdXQsIE9uRGVzdHJveSwgT25Jbml0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBUaW1lQ29uZmlnIH0gZnJvbSAnLi90aW1lLWNvbmZpZy5tb2RlbCc7XG5pbXBvcnQgeyBQb3BGaWVsZEl0ZW1Db21wb25lbnQgfSBmcm9tICcuLi9wb3AtZmllbGQtaXRlbS5jb21wb25lbnQnO1xuXG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2xpYi1wb3AtdGltZScsXG4gIHRlbXBsYXRlVXJsOiAnLi9wb3AtdGltZS5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWyAnLi9wb3AtdGltZS5jb21wb25lbnQuc2NzcycgXVxufSlcbmV4cG9ydCBjbGFzcyBQb3BUaW1lQ29tcG9uZW50IGV4dGVuZHMgUG9wRmllbGRJdGVtQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xuICBASW5wdXQoKSBjb25maWc6IFRpbWVDb25maWcgPSBuZXcgVGltZUNvbmZpZygpO1xuICBwdWJsaWMgbmFtZSA9ICdQb3BUaW1lQ29tcG9uZW50JztcblxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBlbDogRWxlbWVudFJlZixcbiAgICBwcm90ZWN0ZWQgY2RyOiBDaGFuZ2VEZXRlY3RvclJlZlxuICApe1xuICAgIHN1cGVyKCk7XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIHNob3VsZCB0cmFuc2Zvcm0gYW5kIHZhbGlkYXRlIHRoZSBkYXRhLiBUaGUgdmlldyBzaG91bGQgdHJ5IHRvIG9ubHkgdXNlIGRhdGEgdGhhdCBpcyBzdG9yZWQgb24gdWkgc28gdGhhdCBpdCBpcyBub3QgZGVwZW5kZW50IG9uIHRoZSBzdHJ1Y3R1cmUgb2YgZGF0YSB0aGF0IGNvbWVzIGZyb20gb3RoZXIgc291cmNlcy4gVGhlIHVpIHNob3VsZCBiZSB0aGUgc291cmNlIG9mIHRydXRoIGhlcmUuXG4gICAgICovXG4gICAgdGhpcy5kb20uY29uZmlndXJlID0gKCk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG5cbiAgICAgICAgdGhpcy5jb25maWcudGltZSA9IDEyO1xuICAgICAgICB0aGlzLnVpLnRpbWUgPSB7XG4gICAgICAgICAgMTI6IHtcbiAgICAgICAgICAgIGhvdXJzOiBbXSxcbiAgICAgICAgICAgIG1pbnV0ZXM6IFtdLFxuICAgICAgICAgICAgcGVyaW9kczogWyAnQU0nLCAnUE0nIF1cblxuICAgICAgICAgIH0sXG4gICAgICAgICAgMjQ6IHtcbiAgICAgICAgICAgIGhvdXJzOiBbXSxcbiAgICAgICAgICAgIG1pbnV0ZXM6IFtdLFxuICAgICAgICAgICAgcGVyaW9kczogW11cbiAgICAgICAgICB9LFxuICAgICAgICAgIHNlbGVjdGVkSG91cjogJzEyJyxcbiAgICAgICAgICBzZWxlY3RlZE1pbnV0ZTogJzAwJyxcbiAgICAgICAgICBzZWxlY3RlZFBlcmlvZDogJ0FNJyxcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnNldEhvdXJzQW5kTWludXRlcygpO1xuICAgICAgICB0aGlzLnNldFNlbGVjdGVkVmFsdWVzKCk7XG4gICAgICAgIHRoaXMuY29uZmlnLnRyaWdnZXJPbkNoYW5nZSA9ICh2YWx1ZTogc3RyaW5nIHwgbnVtYmVyIHwgbnVsbCkgPT4ge1xuICAgICAgICAgIHRoaXMuY2RyLmRldGVjdENoYW5nZXMoKTtcbiAgICAgICAgICB0aGlzLm9uQ2hhbmdlKHZhbHVlLCB0cnVlKTtcbiAgICAgICAgfTtcblxuICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgY29tcG9uZW50IHNob3VsZCBoYXZlIGEgc3BlY2lmaWMgcHVycG9zZVxuICAgKi9cbiAgbmdPbkluaXQoKXtcbiAgICBzdXBlci5uZ09uSW5pdCgpO1xuICB9XG5cblxuICAvKipcbiAgICogVGhlIGRvbSBkZXN0cm95IGZ1bmN0aW9uIG1hbmFnZXMgYWxsIHRoZSBjbGVhbiB1cCB0aGF0IGlzIG5lY2Vzc2FyeSBpZiBzdWJzY3JpcHRpb25zLCB0aW1lb3V0cywgZXRjIGFyZSBzdG9yZWQgcHJvcGVybHlcbiAgICovXG4gIG5nT25EZXN0cm95KCl7XG4gICAgc3VwZXIubmdPbkRlc3Ryb3koKTtcbiAgfVxuXG5cbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBVbmRlciBUaGUgSG9vZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIFByaXZhdGUgTWV0aG9kICkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiAgcHJvdGVjdGVkIHNldFNlbGVjdGVkVmFsdWVzKCk6IHZvaWR7XG4gICAgY29uc3QgdGltZSA9IHRoaXMudWkudGltZTtcbiAgICBjb25zdCB0aW1lVmFsdWUgPSB0aGlzLmNvbmZpZy5jb250cm9sLnZhbHVlO1xuICAgIGNvbnN0IG1pbnV0ZVZhbHVlID0gdGltZVZhbHVlLnNsaWNlKDIsIDUpLnJlcGxhY2UoL1teYS16QS1aMC05XS9nLCAnJykucGFkU3RhcnQoMiwgJzAnKTtcbiAgICBsZXQgaG91clZhbHVlID0gdGltZVZhbHVlLnNsaWNlKDAsIDIpLnJlcGxhY2UoL1teYS16QS1aMC05XS9nLCAnJykucGFkU3RhcnQoMiwgJzAnKTtcbiAgICBob3VyVmFsdWUgPSAoICggaG91clZhbHVlICUgMTIgKSB8fCAxMiApLnRvU3RyaW5nKDEwKS5wYWRTdGFydCgyLCAnMCcpO1xuICAgIGlmKCBOdW1iZXIoaG91clZhbHVlKSA+IDEyICYmIHRoaXMuY29uZmlnLnRpbWUgPT09IDEyICkgdGltZS5zZWxlY3RlZFBlcmlvZCA9ICdQTSc7XG4gICAgaWYoIHRpbWVWYWx1ZSApIHRpbWUuc2VsZWN0ZWRIb3VyID0gaG91clZhbHVlO1xuICAgIHRpbWUuc2VsZWN0ZWRNaW51dGUgPSBtaW51dGVWYWx1ZTtcbiAgfVxuXG5cbiAgcHJvdGVjdGVkIHNldEhvdXJzQW5kTWludXRlcygpOiB2b2lke1xuICAgIGxldCBpO1xuICAgIGNvbnN0IGhvdXJMaW1pdCA9IHRoaXMuY29uZmlnLnRpbWUgPT09IDEyID8gMTIgOiAyMztcbiAgICBmb3IoIGkgPSAxOyBpIDw9IGhvdXJMaW1pdDsgaSsrICl7XG4gICAgICB0aGlzLnVpLnRpbWVbIHRoaXMuY29uZmlnLnRpbWUgXS5ob3Vycy5wdXNoKGkudG9TdHJpbmcoKS5wYWRTdGFydCgyLCAnMCcpKTtcbiAgICB9XG4gICAgZm9yKCBpID0gMDsgaSA8IDYwOyBpICs9IHRoaXMuY29uZmlnLmludGVydmFsICl7XG4gICAgICB0aGlzLnVpLnRpbWVbIHRoaXMuY29uZmlnLnRpbWUgXS5taW51dGVzLnB1c2goaS50b1N0cmluZygpLnBhZFN0YXJ0KDIsICcwJykpO1xuICAgIH1cbiAgfVxuXG5cbiAgcHJvdGVjdGVkIHNldFRpbWVWYWx1ZSgpOiB2b2lke1xuICAgIGxldCBzZWxlY3RlZEhvdXIgPSB0aGlzLnVpLnRpbWUuc2VsZWN0ZWRIb3VyO1xuICAgIGlmKCB0aGlzLnVpLnRpbWUuc2VsZWN0ZWRQZXJpb2QgPT09ICdBTScgJiYgTnVtYmVyKHNlbGVjdGVkSG91cikgPT09IDEyICkgc2VsZWN0ZWRIb3VyID0gJzAwJztcbiAgICBpZiggdGhpcy51aS50aW1lLnNlbGVjdGVkUGVyaW9kID09PSAnUE0nICYmIE51bWJlcihzZWxlY3RlZEhvdXIpID4gMTIgKSBzZWxlY3RlZEhvdXIgPSAoIDEyICsgTnVtYmVyKHNlbGVjdGVkSG91cikgKS50b1N0cmluZygxMCk7XG4gICAgY29uc3Qgc2VsZWN0ZWRUaW1lID0gc2VsZWN0ZWRIb3VyICsgJzonICsgdGhpcy51aS50aW1lLnNlbGVjdGVkTWludXRlICsgJzowMCc7XG4gICAgdGhpcy5jb25maWcuY29udHJvbC5zZXRWYWx1ZShzZWxlY3RlZFRpbWUsIHsgZW1pdEV2ZW50OiBmYWxzZSB9KTtcbiAgfVxufVxuIl19