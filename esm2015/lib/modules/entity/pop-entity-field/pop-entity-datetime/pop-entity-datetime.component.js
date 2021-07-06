import { Component, ElementRef, Input } from '@angular/core';
import { PopExtendComponent } from '../../../../pop-extend.component';
import { TimeConfig } from '../../../base/pop-field-item/pop-time/time-config.model';
import { DateConfig } from '../../../base/pop-field-item/pop-date/date-config.model';
import { ConvertDateFormat, ConvertDateToTimeFormat } from '../../../../pop-common-utility';
export class PopEntityDatetimeComponent extends PopExtendComponent {
    constructor(el) {
        super();
        this.el = el;
        this.name = 'PopEntityDatetimeComponent';
        /**
         * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
         */
        this.dom.configure = () => {
            return new Promise((resolve) => {
                this.id = this.field.id;
                this.trait.bubble = true;
                this.dom.state.open = false;
                this.dom.state.footer_adjust = false;
                this.dom.state.row1 = {
                    first: true,
                    visible: true,
                };
                this.setDateItem();
                this.setTimeItem();
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
    setDateItem() {
        let dateValue = this.field.items['datetime'].value ? ConvertDateFormat(this.field.items['datetime'].value, 'mm/dd/yyyy') : null;
        dateValue = dateValue === '12/31/1969' ? null : dateValue;
        // console.log(dateValue, 'dateValue');
        this.field.items['date'] = new DateConfig({
            label: 'Date',
            value: dateValue,
        });
    }
    setTimeItem() {
        const timeValue = this.field.items['datetime'].value ? ConvertDateToTimeFormat(this.field.items['datetime'].value) : null;
        this.field.items['time'] = new TimeConfig({
            label: 'Time',
            time: 12,
            interval: 1,
            value: timeValue,
        });
    }
    emitInputEvent(name, config, message = null, success = null) {
        if (this.field.options.bubble)
            this.events.emit({ source: this.name, type: 'field', name: name, config: config, success: success, message: message });
    }
    handleDateEvent(event) {
        const items = this.field.items;
        if (items['datetime'] && items['time'] && items['time'].value) {
            const datetimeValue = ConvertDateFormat(items['date'].control.value, 'yyyy-mm-dd') + ' ' + items['time'].control.value;
            // console.log(datetimeValue, 'datetimeValue');
            items['datetime'].triggerOnChange(datetimeValue);
        }
        if (this.field.options.bubble) {
            this.emitInputEvent(event.name, this.field.items['date']);
        }
        // this.events.emit(event);
    }
    handleEvent(event) {
        // console.log(event, 'handleEventEmail');
        this.events.emit(event);
    }
    handleTimeEvent(event) {
        if (event.type === 'field' && event.name === 'onChange') {
            const items = this.field.items;
            if (items['datetime'] && items['date'] && items['date'].value) {
                const datetimeValue = ConvertDateFormat(items['date'].control.value, 'yyyy-mm-dd') + ' ' + items['time'].control.value;
                console.log(datetimeValue, 'datetimeValue');
                items['datetime'].triggerOnChange(datetimeValue);
            }
        }
        if (this.field.options.bubble) {
            this.emitInputEvent(event.name, this.field.items['time']);
        }
    }
    /**
     * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
     */
    ngOnDestroy() {
        super.ngOnDestroy();
    }
}
PopEntityDatetimeComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-entity-datetime',
                template: "<div class=\"pop-entity-datetime-field pop-datetime-container\" [ngClass]=\"{'pop-datetime-container-wrapper': field.options.legend}\">\n  <div *ngIf=\"field.options.legend\" class=\"pop-datetime-container-legend\">{{field.name}}</div>\n  <div *ngIf=\"dom.state.row1.visible\" class=\"pop-datetime-row-container\"\n       [ngClass]=\"{'pop-datetime-first-row': dom.state.row1.first}\">\n    <div *ngIf=\"field.items['date']\" class=\"pop-datetime-date-wrapper\">\n      <lib-pop-date [config]=\"field.items['date']\" (events)=\"handleDateEvent($event);\"></lib-pop-date>\n    </div>\n    <div *ngIf=\"field.items['time']\" class=\"pop-datetime-time-wrapper\">\n      <lib-pop-time [config]=\"field.items['time']\" (events)=\"handleTimeEvent($event);\"></lib-pop-time>\n    </div>\n  </div>\n  <div class=\"pop-datetime-row-container\">\n    <div *ngIf=\"field.items['timezone']\" class=\"pop-datetime-time-zone-wrapper\">\n      <lib-pop-select [config]=\"field.items['timezone']\"></lib-pop-select>\n    </div>\n    <lib-pop-input [config]=\"field.items['datetime']\" (events)=\"handleEvent($event);\"></lib-pop-input>\n  </div>\n</div>\n",
                styles: [":host{position:relative;display:block;width:100%;margin:10px 0}.pop-datetime-container{position:relative;display:block;padding:0;min-height:40px}.pop-datetime-container-wrapper{border:1px solid var(--darken4);padding:5px;border-radius:3px}.pop-datetime-container-legend{position:relative;margin-top:-15px;margin-bottom:-5px;clear:both;z-index:1;width:-webkit-fit-content;width:-moz-fit-content;width:fit-content;color:var(--darken4);background:var(--bg-3)}.pop-datetime-row-container{position:relative;display:flex;flex:1 1 100%;margin-top:10px;padding:0;flex-direction:row;justify-content:flex-start;align-items:center;background:var(--bg-3)}.pop-datetime-first-row{margin-top:10px!important}.pop-datetime-date-wrapper{width:25%}.pop-datetime-date-wrapper,.pop-datetime-time-wrapper{position:relative;display:flex;flex-direction:column;flex-grow:1;margin-right:2px}.pop-datetime-time-wrapper{width:27%;height:31px;border:1px solid var(--text-2);padding:5px;border-radius:3px}.pop-datetime-datetime-wrapper,.pop-datetime-time-zone-wrapper{position:relative;display:flex;flex-direction:column;width:25%;flex-grow:1;margin-right:2px}"]
            },] }
];
PopEntityDatetimeComponent.ctorParameters = () => [
    { type: ElementRef }
];
PopEntityDatetimeComponent.propDecorators = {
    field: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS1kYXRldGltZS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9lbnRpdHkvcG9wLWVudGl0eS1maWVsZC9wb3AtZW50aXR5LWRhdGV0aW1lL3BvcC1lbnRpdHktZGF0ZXRpbWUuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBcUIsTUFBTSxlQUFlLENBQUM7QUFDaEYsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sa0NBQWtDLENBQUM7QUFFdEUsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHlEQUF5RCxDQUFDO0FBQ3JGLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSx5REFBeUQsQ0FBQztBQUNyRixPQUFPLEVBQUUsaUJBQWlCLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQVE1RixNQUFNLE9BQU8sMEJBQTJCLFNBQVEsa0JBQWtCO0lBTWhFLFlBQ1MsRUFBYztRQUVyQixLQUFLLEVBQUUsQ0FBQztRQUZELE9BQUUsR0FBRixFQUFFLENBQVk7UUFKaEIsU0FBSSxHQUFFLDRCQUE0QixDQUFDO1FBT3hDOztXQUVHO1FBQ0gsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsR0FBcUIsRUFBRTtZQUMxQyxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7Z0JBQzdCLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7Z0JBQ3hCLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztnQkFDekIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQztnQkFDNUIsSUFBSSxDQUFD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SyxDQUFDLEtBQUssQ0FBRSxNQUFNLENBQUUsQ0FBQyxDQUFDO1NBQzdEO0lBQ0gsQ0FBQztJQUdEOztPQUVHO0lBQ0gsV0FBVztRQUNULEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN0QixDQUFDOzs7WUFqSEYsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSx5QkFBeUI7Z0JBQ25DLCtuQ0FBbUQ7O2FBRXBEOzs7WUFabUIsVUFBVTs7O29CQWMzQixLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBJbnB1dCwgT25EZXN0cm95LCBPbkluaXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFBvcEV4dGVuZENvbXBvbmVudCB9IGZyb20gJy4uLy4uLy4uLy4uL3BvcC1leHRlbmQuY29tcG9uZW50JztcbmltcG9ydCB7IEZpZWxkQ29uZmlnLCBQb3BCYXNlRXZlbnRJbnRlcmZhY2UgfSBmcm9tICcuLi8uLi8uLi8uLi9wb3AtY29tbW9uLm1vZGVsJztcbmltcG9ydCB7IFRpbWVDb25maWcgfSBmcm9tICcuLi8uLi8uLi9iYXNlL3BvcC1maWVsZC1pdGVtL3BvcC10aW1lL3RpbWUtY29uZmlnLm1vZGVsJztcbmltcG9ydCB7IERhdGVDb25maWcgfSBmcm9tICcuLi8uLi8uLi9iYXNlL3BvcC1maWVsZC1pdGVtL3BvcC1kYXRlL2RhdGUtY29uZmlnLm1vZGVsJztcbmltcG9ydCB7IENvbnZlcnREYXRlRm9ybWF0LCBDb252ZXJ0RGF0ZVRvVGltZUZvcm1hdCB9IGZyb20gJy4uLy4uLy4uLy4uL3BvcC1jb21tb24tdXRpbGl0eSc7XG5cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbGliLXBvcC1lbnRpdHktZGF0ZXRpbWUnLFxuICB0ZW1wbGF0ZVVybDogJy4vcG9wLWVudGl0eS1kYXRldGltZS5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWyAnLi9wb3AtZW50aXR5LWRhdGV0aW1lLmNvbXBvbmVudC5zY3NzJyBdXG59KVxuZXhwb3J0IGNsYXNzIFBvcEVudGl0eURhdGV0aW1lQ29tcG9uZW50IGV4dGVuZHMgUG9wRXh0ZW5kQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xuICBASW5wdXQoKSBmaWVsZDogRmllbGRDb25maWc7XG5cbiAgcHVibGljIG5hbWUgPSdQb3BFbnRpdHlEYXRldGltZUNvbXBvbmVudCc7XG5cblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgZWw6IEVsZW1lbnRSZWYsXG4gICl7XG4gICAgc3VwZXIoKTtcbiAgICAvKipcbiAgICAgKiBUaGlzIHNob3VsZCB0cmFuc2Zvcm0gYW5kIHZhbGlkYXRlIHRoZSBkYXRhLiBUaGUgdmlldyBzaG91bGQgdHJ5IHRvIG9ubHkgdXNlIGRhdGEgdGhhdCBpcyBzdG9yZWQgb24gdWkgc28gdGhhdCBpdCBpcyBub3QgZGVwZW5kZW50IG9uIHRoZSBzdHJ1Y3R1cmUgb2YgZGF0YSB0aGF0IGNvbWVzIGZyb20gb3RoZXIgc291cmNlcy4gVGhlIHVpIHNob3VsZCBiZSB0aGUgc291cmNlIG9mIHRydXRoIGhlcmUuXG4gICAgICovXG4gICAgdGhpcy5kb20uY29uZmlndXJlID0gKCk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIHRoaXMuaWQgPSB0aGlzLmZpZWxkLmlkO1xuICAgICAgICB0aGlzLnRyYWl0LmJ1YmJsZSA9IHRydWU7XG4gICAgICAgIHRoaXMuZG9tLnN0YXRlLm9wZW4gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5kb20uc3RhdGUuZm9vdGVyX2FkanVzdCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmRvbS5zdGF0ZS5yb3cxID0ge1xuICAgICAgICAgIGZpcnN0OiB0cnVlLFxuICAgICAgICAgIHZpc2libGU6IHRydWUsXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuc2V0RGF0ZUl0ZW0oKTtcbiAgICAgICAgdGhpcy5zZXRUaW1lSXRlbSgpO1xuICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgY29tcG9uZW50IHNob3VsZCBoYXZlIGEgc3BlY2lmaWMgcHVycG9zZVxuICAgKi9cbiAgbmdPbkluaXQoKXtcbiAgICBzdXBlci5uZ09uSW5pdCgpO1xuICB9XG5cblxuICBzZXREYXRlSXRlbSgpOiB2b2lke1xuICAgIGxldCBkYXRlVmFsdWUgPSB0aGlzLmZpZWxkLml0ZW1zWyAnZGF0ZXRpbWUnIF0udmFsdWUgPyBDb252ZXJ0RGF0ZUZvcm1hdCh0aGlzLmZpZWxkLml0ZW1zWyAnZGF0ZXRpbWUnIF0udmFsdWUsICdtbS9kZC95eXl5JykgOiBudWxsO1xuICAgIGRhdGVWYWx1ZSA9IGRhdGVWYWx1ZSA9PT0gJzEyLzMxLzE5NjknID8gbnVsbCA6IGRhdGVWYWx1ZTtcbiAgICAvLyBjb25zb2xlLmxvZyhkYXRlVmFsdWUsICdkYXRlVmFsdWUnKTtcbiAgICB0aGlzLmZpZWxkLml0ZW1zWyAnZGF0ZScgXSA9IG5ldyBEYXRlQ29uZmlnKHtcbiAgICAgIGxhYmVsOiAnRGF0ZScsXG4gICAgICB2YWx1ZTogZGF0ZVZhbHVlLFxuICAgIH0pO1xuICB9XG5cblxuICBzZXRUaW1lSXRlbSgpOiB2b2lke1xuICAgIGNvbnN0IHRpbWVWYWx1ZSA9IHRoaXMuZmllbGQuaXRlbXNbICdkYXRldGltZScgXS52YWx1ZSA/IENvbnZlcnREYXRlVG9UaW1lRm9ybWF0KHRoaXMuZmllbGQuaXRlbXNbICdkYXRldGltZScgXS52YWx1ZSkgOiBudWxsO1xuICAgIHRoaXMuZmllbGQuaXRlbXNbICd0aW1lJyBdID0gbmV3IFRpbWVDb25maWcoe1xuICAgICAgbGFiZWw6ICdUaW1lJyxcbiAgICAgIHRpbWU6IDEyLFxuICAgICAgaW50ZXJ2YWw6IDEsXG4gICAgICB2YWx1ZTogdGltZVZhbHVlLFxuICAgIH0pO1xuICB9XG5cblxuICBlbWl0SW5wdXRFdmVudChuYW1lLCBjb25maWc6IGFueSwgbWVzc2FnZTogc3RyaW5nID0gbnVsbCwgc3VjY2VzczogYm9vbGVhbiA9IG51bGwpOiB2b2lke1xuICAgIGlmKCB0aGlzLmZpZWxkLm9wdGlvbnMuYnViYmxlICkgdGhpcy5ldmVudHMuZW1pdCh7IHNvdXJjZTogdGhpcy5uYW1lLCB0eXBlOiAnZmllbGQnLCBuYW1lOiBuYW1lLCBjb25maWc6IGNvbmZpZywgc3VjY2Vzczogc3VjY2VzcywgbWVzc2FnZTogbWVzc2FnZSB9KTtcbiAgfVxuXG5cbiAgaGFuZGxlRGF0ZUV2ZW50KGV2ZW50KTogdm9pZHtcbiAgICBjb25zdCBpdGVtcyA9IHRoaXMuZmllbGQuaXRlbXM7XG4gICAgaWYoIGl0ZW1zWyAnZGF0ZXRpbWUnIF0gJiYgaXRlbXNbICd0aW1lJyBdICYmIGl0ZW1zWyAndGltZScgXS52YWx1ZSApe1xuICAgICAgY29uc3QgZGF0ZXRpbWVWYWx1ZSA9IENvbnZlcnREYXRlRm9ybWF0KGl0ZW1zWyAnZGF0ZScgXS5jb250cm9sLnZhbHVlLCAneXl5eS1tbS1kZCcpICsgJyAnICsgaXRlbXNbICd0aW1lJyBdLmNvbnRyb2wudmFsdWU7XG4gICAgICAvLyBjb25zb2xlLmxvZyhkYXRldGltZVZhbHVlLCAnZGF0ZXRpbWVWYWx1ZScpO1xuICAgICAgaXRlbXNbICdkYXRldGltZScgXS50cmlnZ2VyT25DaGFuZ2UoZGF0ZXRpbWVWYWx1ZSk7XG4gICAgfVxuICAgIGlmKCB0aGlzLmZpZWxkLm9wdGlvbnMuYnViYmxlICl7XG4gICAgICB0aGlzLmVtaXRJbnB1dEV2ZW50KGV2ZW50Lm5hbWUsIHRoaXMuZmllbGQuaXRlbXNbICdkYXRlJyBdKTtcbiAgICB9XG4gICAgLy8gdGhpcy5ldmVudHMuZW1pdChldmVudCk7XG4gIH1cblxuXG4gIGhhbmRsZUV2ZW50KGV2ZW50OiBQb3BCYXNlRXZlbnRJbnRlcmZhY2UpOiB2b2lke1xuICAgIC8vIGNvbnNvbGUubG9nKGV2ZW50LCAnaGFuZGxlRXZlbnRFbWFpbCcpO1xuXG4gICAgdGhpcy5ldmVudHMuZW1pdChldmVudCk7XG4gIH1cblxuXG4gIGhhbmRsZVRpbWVFdmVudChldmVudCl7XG4gICAgaWYoIGV2ZW50LnR5cGUgPT09ICdmaWVsZCcgJiYgZXZlbnQubmFtZSA9PT0gJ29uQ2hhbmdlJyApe1xuICAgICAgY29uc3QgaXRlbXMgPSB0aGlzLmZpZWxkLml0ZW1zO1xuICAgICAgaWYoIGl0ZW1zWyAnZGF0ZXRpbWUnIF0gJiYgaXRlbXNbICdkYXRlJyBdICYmIGl0ZW1zWyAnZGF0ZScgXS52YWx1ZSApe1xuICAgICAgICBjb25zdCBkYXRldGltZVZhbHVlID0gQ29udmVydERhdGVGb3JtYXQoaXRlbXNbICdkYXRlJyBdLmNvbnRyb2wudmFsdWUsICd5eXl5LW1tLWRkJykgKyAnICcgKyBpdGVtc1sgJ3RpbWUnIF0uY29udHJvbC52YWx1ZTtcbiAgICAgICAgY29uc29sZS5sb2coZGF0ZXRpbWVWYWx1ZSwgJ2RhdGV0aW1lVmFsdWUnKTtcbiAgICAgICAgaXRlbXNbICdkYXRldGltZScgXS50cmlnZ2VyT25DaGFuZ2UoZGF0ZXRpbWVWYWx1ZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYoIHRoaXMuZmllbGQub3B0aW9ucy5idWJibGUgKXtcbiAgICAgIHRoaXMuZW1pdElucHV0RXZlbnQoZXZlbnQubmFtZSwgdGhpcy5maWVsZC5pdGVtc1sgJ3RpbWUnIF0pO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoZSBkb20gZGVzdHJveSBmdW5jdGlvbiBtYW5hZ2VzIGFsbCB0aGUgY2xlYW4gdXAgdGhhdCBpcyBuZWNlc3NhcnkgaWYgc3Vic2NyaXB0aW9ucywgdGltZW91dHMsIGV0YyBhcmUgc3RvcmVkIHByb3Blcmx5XG4gICAqL1xuICBuZ09uRGVzdHJveSgpe1xuICAgIHN1cGVyLm5nT25EZXN0cm95KCk7XG4gIH1cblxufVxuIl19