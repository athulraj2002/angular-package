import { Component } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { MatDateRangePicker, MatCalendar } from '@angular/material/datepicker';
const datePresets = [
    'Today',
    'So Far This Week',
    'This Week',
    'Last Week',
    'Previous Week',
    'Rest of This Week',
    'Next Week',
    'This Month',
    'Last Month',
    'Next Month'
];
export class DateRangePanelComponent {
    constructor(dateAdapter, datePicker, calendar) {
        this.dateAdapter = dateAdapter;
        this.datePicker = datePicker;
        this.calendar = calendar;
        this.presets = datePresets;
        this.selected = '';
    }
    /**
     * Apply the preset to Datepicker and Calendar
     * @param datePreset: Example: This week
     */
    selectDatePreset(datePreset) {
        this.selected = datePreset;
        const [start, end] = this.calculateDateRange(datePreset);
        // @ts-ignore
        // if only start is selected we need to set end to clear out start and end.
        if ((this.selected.start !== undefined && !this.calendar.selected.end) || (this.calendar.selected.start && !this.calendar.selected.end)) {
            this.datePicker.select(start);
        }
        this.datePicker.select(start);
        this.datePicker.select(end);
        this.calendar.activeDate = end;
    }
    /**
     * Fix calulations to make monday first day of week instead of sunday
     * @param today
     * @private
     */
    adjDayOfWeekToStartOnMonday(today) {
        let dayOfWeek = this.dateAdapter.getDayOfWeek(today);
        dayOfWeek = dayOfWeek === 0 ? 6 : (dayOfWeek - 1);
        return dayOfWeek;
    }
    /**
     * Calculate date range preset
     * @param datePreset: Example: This week.
     */
    calculateDateRange(datePreset) {
        const today = this.today;
        switch (datePreset) {
            case 'Today':
                return [today, today];
            case 'So Far This Week': {
                const dayOfWeek = this.adjDayOfWeekToStartOnMonday(today);
                const start = this.dateAdapter.addCalendarDays(today, -(dayOfWeek));
                return [start, today];
            }
            case 'This Week': return this.calculateWeek(today);
            case 'Last Week': return this.calculateWeek(this.dateAdapter.addCalendarDays(today, -7));
            case 'Previous Week': return this.calculateWeek(this.dateAdapter.addCalendarDays(today, -14));
            case 'Rest of This Week': {
                const dayOfWeek = this.adjDayOfWeekToStartOnMonday(today);
                const end = this.dateAdapter.addCalendarDays(today, (6 - dayOfWeek));
                return [today, end];
            }
            case 'Next Week': {
                const dayOfWeek = this.adjDayOfWeekToStartOnMonday(today);
                const start = this.dateAdapter.addCalendarDays(today, (7 - dayOfWeek));
                return this.calculateWeek(start);
            }
            case 'This Month': return this.calculateMonth(today);
            case 'Last Month': {
                const thisDayLastMonth = this.dateAdapter.addCalendarMonths(today, -1);
                return this.calculateMonth(thisDayLastMonth);
            }
            case 'Next Month': {
                const thisDayLastMonth = this.dateAdapter.addCalendarMonths(today, 1);
                return this.calculateMonth(thisDayLastMonth);
            }
        }
    }
    /**
     * calculate start and end for week
     * @param forDay
     * @private
     */
    calculateWeek(forDay) {
        const deltaStart = this.dateAdapter.getFirstDayOfWeek() -
            this.dateAdapter.getDayOfWeek(forDay);
        const start = this.dateAdapter.addCalendarDays(forDay, deltaStart);
        const end = this.dateAdapter.addCalendarDays(start, 6);
        return [start, end];
    }
    /**
     * Calculate start and end for month
     * @param forDay
     * @private
     */
    calculateMonth(forDay) {
        const year = this.dateAdapter.getYear(forDay);
        const month = this.dateAdapter.getMonth(forDay);
        const start = this.dateAdapter.createDate(year, month, 1);
        const end = this.dateAdapter.addCalendarDays(start, this.dateAdapter.getNumDaysInMonth(forDay) - 1);
        return [start, end];
    }
    /**
     * Get Today
     * @private
     */
    get today() {
        const today = this.dateAdapter.today();
        if (today === null) {
            throw new Error('date creation failed');
        }
        return today;
    }
}
DateRangePanelComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-date-range-panel',
                template: "\n<mat-card class=\"pop-datepicker-panel\" >\n  <button\n    class=\"date-preset-button\"\n    [ngClass]=\"{'selected': item === selected}\"\n    *ngFor=\"let item of presets\"\n    mat-button\n    color=\"accent\"\n    (click)=\"selectDatePreset(item)\"\n  >\n    {{ item }}\n  </button>\n</mat-card>\n",
                styles: [":host{position:absolute;width:200px;left:-200px}.pop-datepicker-panel{position:relative;top:-1px;border-left:1px solid #d3d3d3;border-bottom:1px solid #d3d3d3;border-top:1px solid #d3d3d3;border-radius:0;padding:var(--gap-s);height:405px}.date-preset-button,.selected{width:100%;text-align:left}.selected{background:var(--background-side-menu)}"]
            },] }
];
DateRangePanelComponent.ctorParameters = () => [
    { type: DateAdapter },
    { type: MatDateRangePicker },
    { type: MatCalendar }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZS1yYW5nZS1wYW5lbC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9iYXNlL3BvcC1maWVsZC1pdGVtL3BvcC1kYXRlL3BvcC1kYXRlLXJhbmdlL2V4cGFuc2lvbi1pdGVtcy9jdXN0b20tcGFuZWwvZGF0ZS1yYW5nZS1wYW5lbC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUEyQixTQUFTLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDbkUsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ3JELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxXQUFXLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUcvRSxNQUFNLFdBQVcsR0FBRztJQUNsQixPQUFPO0lBQ1Asa0JBQWtCO0lBQ2xCLFdBQVc7SUFDWCxXQUFXO0lBQ1gsZUFBZTtJQUNmLG1CQUFtQjtJQUNuQixXQUFXO0lBQ1gsWUFBWTtJQUNaLFlBQVk7SUFDWixZQUFZO0NBQ0osQ0FBQztBQVVYLE1BQU0sT0FBTyx1QkFBdUI7SUFLbEMsWUFDVSxXQUEyQixFQUMzQixVQUFpQyxFQUNqQyxRQUF3QjtRQUZ4QixnQkFBVyxHQUFYLFdBQVcsQ0FBZ0I7UUFDM0IsZUFBVSxHQUFWLFVBQVUsQ0FBdUI7UUFDakMsYUFBUSxHQUFSLFFBQVEsQ0FBZ0I7UUFQekIsWUFBTyxHQUFHLFdBQVcsQ0FBQztRQUUvQixhQUFRLEdBQW9CLEVBQUUsQ0FBQztJQVMvQixDQUFDO0lBRUQ7OztPQUdHO0lBRUgsZ0JBQWdCLENBQUMsVUFBc0I7UUFDckMsSUFBSSxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUM7UUFDM0IsTUFBTSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsVUFB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QyxXQUFXLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2hELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDMUQsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQzFDLEtBQUssRUFDTCxJQUFJLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FDL0MsQ0FBQztRQUNGLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDdEIsQ0FBQztJQUVEOzs7T0FHRztJQUVILElBQVksS0FBSztRQUNmLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7UUFFdkMsSUFBSSxLQUFLLEtBQUssSUFBSSxFQUFFO1lBQ2xCLE1BQU0sSUFBSSxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQztTQUN6QztRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQzs7O1lBOUlGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsc0JBQXNCO2dCQUNoQywyVEFBOEM7O2FBRy9DOzs7WUF4QlEsV0FBVztZQUNYLGtCQUFrQjtZQUFFLFdBQVciLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSwgQ29tcG9uZW50IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBEYXRlQWRhcHRlciB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2NvcmUnO1xuaW1wb3J0IHsgTWF0RGF0ZVJhbmdlUGlja2VyLCBNYXRDYWxlbmRhciB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2RhdGVwaWNrZXInO1xuaW1wb3J0IHsgUG9wRmllbGRJdGVtQ29tcG9uZW50IH0gZnJvbSAnLi4vLi4vLi4vLi4vcG9wLWZpZWxkLWl0ZW0uY29tcG9uZW50JztcblxuY29uc3QgZGF0ZVByZXNldHMgPSBbXG4gICdUb2RheScsXG4gICdTbyBGYXIgVGhpcyBXZWVrJyxcbiAgJ1RoaXMgV2VlaycsXG4gICdMYXN0IFdlZWsnLFxuICAnUHJldmlvdXMgV2VlaycsXG4gICdSZXN0IG9mIFRoaXMgV2VlaycsXG4gICdOZXh0IFdlZWsnLFxuICAnVGhpcyBNb250aCcsXG4gICdMYXN0IE1vbnRoJyxcbiAgJ05leHQgTW9udGgnXG5dIGFzIGNvbnN0O1xuXG50eXBlIERhdGVQcmVzZXQgPSB0eXBlb2YgIGRhdGVQcmVzZXRzW251bWJlcl07XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2xpYi1kYXRlLXJhbmdlLXBhbmVsJyxcbiAgdGVtcGxhdGVVcmw6ICdkYXRlLXJhbmdlLXBhbmVsLmNvbXBvbmVudC5odG1sJyxcbiAgc3R5bGVVcmxzOiBbJ2RhdGUtcmFuZ2UtcGFuZWwuY29tcG9uZW50LnNjc3MnXSxcbiAgLy8gY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG59KVxuZXhwb3J0IGNsYXNzIERhdGVSYW5nZVBhbmVsQ29tcG9uZW50PEQ+IHtcbiAgcmVhZG9ubHkgcHJlc2V0cyA9IGRhdGVQcmVzZXRzO1xuXG4gIHNlbGVjdGVkOiBEYXRlUHJlc2V0IHwgJycgPSAnJztcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGRhdGVBZGFwdGVyOiBEYXRlQWRhcHRlcjxEPixcbiAgICBwcml2YXRlIGRhdGVQaWNrZXI6IE1hdERhdGVSYW5nZVBpY2tlcjxEPixcbiAgICBwcml2YXRlIGNhbGVuZGFyOiBNYXRDYWxlbmRhcjxEPixcbiAgKXtcblxuXG4gIH1cblxuICAvKipcbiAgICogQXBwbHkgdGhlIHByZXNldCB0byBEYXRlcGlja2VyIGFuZCBDYWxlbmRhclxuICAgKiBAcGFyYW0gZGF0ZVByZXNldDogRXhhbXBsZTogVGhpcyB3ZWVrXG4gICAqL1xuXG4gIHNlbGVjdERhdGVQcmVzZXQoZGF0ZVByZXNldDogRGF0ZVByZXNldCk6IHZvaWR7XG4gICAgdGhpcy5zZWxlY3RlZCA9IGRhdGVQcmVzZXQ7XG4gICAgY29uc3QgW3N0YXJ0LCBlbmRdID0gdGhpcy5jYWxjdWxhdGVEYXRlUmFuZ2UoZGF0ZVByZXNldCk7XG5cblxuICAgIC8vIEB0cy1pZ25vcmVcbiAgICAvLyBpZiBvbmx5IHN0YXJ0IGlzIHNlbGVjdGVkIHdlIG5lZWQgdG8gc2V0IGVuZCB0byBjbGVhciBvdXQgc3RhcnQgYW5kIGVuZC5cbiAgICBpZigodGhpcy5zZWxlY3RlZC5zdGFydCAhPT0gdW5kZWZpbmVkICYmICF0aGlzLmNhbGVuZGFyLnNlbGVjdGVkLmVuZCkgfHwgKHRoaXMuY2FsZW5kYXIuc2VsZWN0ZWQuc3RhcnQgJiYgICF0aGlzLmNhbGVuZGFyLnNlbGVjdGVkLmVuZCkpe1xuICAgICAgdGhpcy5kYXRlUGlja2VyLnNlbGVjdChzdGFydCk7XG4gICAgfVxuXG4gICAgdGhpcy5kYXRlUGlja2VyLnNlbGVjdChzdGFydCk7XG4gICAgdGhpcy5kYXRlUGlja2VyLnNlbGVjdChlbmQpO1xuXG4gICAgdGhpcy5jYWxlbmRhci5hY3RpdmVEYXRlID0gZW5kO1xuICB9XG5cblxuICAvKipcbiAgICogRml4IGNhbHVsYXRpb25zIHRvIG1ha2UgbW9uZGF5IGZpcnN0IGRheSBvZiB3ZWVrIGluc3RlYWQgb2Ygc3VuZGF5XG4gICAqIEBwYXJhbSB0b2RheVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cblxuICBwcml2YXRlIGFkakRheU9mV2Vla1RvU3RhcnRPbk1vbmRheSh0b2RheTpEKTpudW1iZXJ7XG4gICAgbGV0IGRheU9mV2VlayA9IHRoaXMuZGF0ZUFkYXB0ZXIuZ2V0RGF5T2ZXZWVrKHRvZGF5KTtcbiAgICBkYXlPZldlZWsgPSBkYXlPZldlZWsgPT09IDAgPyA2IDogKGRheU9mV2VlayAtMSk7XG4gICAgcmV0dXJuIGRheU9mV2VlaztcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxjdWxhdGUgZGF0ZSByYW5nZSBwcmVzZXRcbiAgICogQHBhcmFtIGRhdGVQcmVzZXQ6IEV4YW1wbGU6IFRoaXMgd2Vlay5cbiAgICovXG5cbiAgcHJpdmF0ZSBjYWxjdWxhdGVEYXRlUmFuZ2UoZGF0ZVByZXNldDogRGF0ZVByZXNldCk6IGFueXtcbiAgICBjb25zdCB0b2RheSA9IHRoaXMudG9kYXk7XG5cbiAgICBzd2l0Y2goZGF0ZVByZXNldCl7XG4gICAgICBjYXNlICdUb2RheSc6XG4gICAgICAgIHJldHVybiBbdG9kYXksdG9kYXldO1xuICAgICAgY2FzZSAnU28gRmFyIFRoaXMgV2Vlayc6e1xuICAgICAgICAgY29uc3QgZGF5T2ZXZWVrID0gdGhpcy5hZGpEYXlPZldlZWtUb1N0YXJ0T25Nb25kYXkodG9kYXkpO1xuICAgICAgICAgY29uc3Qgc3RhcnQgPSB0aGlzLmRhdGVBZGFwdGVyLmFkZENhbGVuZGFyRGF5cyh0b2RheSwgLShkYXlPZldlZWspKTtcbiAgICAgICAgIHJldHVybiBbc3RhcnQsIHRvZGF5XTtcbiAgICAgIH1cbiAgICAgIGNhc2UgJ1RoaXMgV2Vlayc6IHJldHVybiB0aGlzLmNhbGN1bGF0ZVdlZWsodG9kYXkpO1xuICAgICAgY2FzZSAnTGFzdCBXZWVrJzogcmV0dXJuIHRoaXMuY2FsY3VsYXRlV2Vlayh0aGlzLmRhdGVBZGFwdGVyLmFkZENhbGVuZGFyRGF5cyh0b2RheSwgLTcpKTtcbiAgICAgIGNhc2UgJ1ByZXZpb3VzIFdlZWsnOiByZXR1cm4gdGhpcy5jYWxjdWxhdGVXZWVrKHRoaXMuZGF0ZUFkYXB0ZXIuYWRkQ2FsZW5kYXJEYXlzKHRvZGF5LCAtMTQpKTtcbiAgICAgIGNhc2UgJ1Jlc3Qgb2YgVGhpcyBXZWVrJzoge1xuICAgICAgICBjb25zdCBkYXlPZldlZWsgPSB0aGlzLmFkakRheU9mV2Vla1RvU3RhcnRPbk1vbmRheSh0b2RheSk7XG4gICAgICAgIGNvbnN0IGVuZCA9IHRoaXMuZGF0ZUFkYXB0ZXIuYWRkQ2FsZW5kYXJEYXlzKHRvZGF5LCAoNiAtIGRheU9mV2VlaykpO1xuICAgICAgICByZXR1cm4gW3RvZGF5LCBlbmRdO1xuICAgICAgfVxuICAgICAgY2FzZSAnTmV4dCBXZWVrJzp7XG4gICAgICAgIGNvbnN0IGRheU9mV2VlayA9IHRoaXMuYWRqRGF5T2ZXZWVrVG9TdGFydE9uTW9uZGF5KHRvZGF5KTtcbiAgICAgICAgY29uc3Qgc3RhcnQgPSB0aGlzLmRhdGVBZGFwdGVyLmFkZENhbGVuZGFyRGF5cyh0b2RheSwgKDcgLSBkYXlPZldlZWspKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FsY3VsYXRlV2VlayhzdGFydCk7XG4gICAgICB9XG4gICAgICBjYXNlICdUaGlzIE1vbnRoJzogcmV0dXJuIHRoaXMuY2FsY3VsYXRlTW9udGgodG9kYXkpO1xuICAgICAgY2FzZSAnTGFzdCBNb250aCc6IHtcbiAgICAgICAgY29uc3QgdGhpc0RheUxhc3RNb250aCA9IHRoaXMuZGF0ZUFkYXB0ZXIuYWRkQ2FsZW5kYXJNb250aHModG9kYXksIC0xKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FsY3VsYXRlTW9udGgodGhpc0RheUxhc3RNb250aCk7XG4gICAgICB9XG4gICAgICBjYXNlICdOZXh0IE1vbnRoJzoge1xuICAgICAgICBjb25zdCB0aGlzRGF5TGFzdE1vbnRoID0gdGhpcy5kYXRlQWRhcHRlci5hZGRDYWxlbmRhck1vbnRocyh0b2RheSwgMSk7XG4gICAgICAgIHJldHVybiB0aGlzLmNhbGN1bGF0ZU1vbnRoKHRoaXNEYXlMYXN0TW9udGgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIGNhbGN1bGF0ZSBzdGFydCBhbmQgZW5kIGZvciB3ZWVrXG4gICAqIEBwYXJhbSBmb3JEYXlcbiAgICogQHByaXZhdGVcbiAgICovXG5cbiAgcHJpdmF0ZSBjYWxjdWxhdGVXZWVrKGZvckRheTogRCk6IGFueSB7XG4gICAgY29uc3QgZGVsdGFTdGFydCA9XG4gICAgICB0aGlzLmRhdGVBZGFwdGVyLmdldEZpcnN0RGF5T2ZXZWVrKCkgLVxuICAgICAgdGhpcy5kYXRlQWRhcHRlci5nZXREYXlPZldlZWsoZm9yRGF5KTtcbiAgICBjb25zdCBzdGFydCA9IHRoaXMuZGF0ZUFkYXB0ZXIuYWRkQ2FsZW5kYXJEYXlzKGZvckRheSwgZGVsdGFTdGFydCk7XG4gICAgY29uc3QgZW5kID0gdGhpcy5kYXRlQWRhcHRlci5hZGRDYWxlbmRhckRheXMoc3RhcnQsIDYpO1xuICAgIHJldHVybiBbc3RhcnQsIGVuZF07XG4gIH1cblxuXG4gIC8qKlxuICAgKiBDYWxjdWxhdGUgc3RhcnQgYW5kIGVuZCBmb3IgbW9udGhcbiAgICogQHBhcmFtIGZvckRheVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cblxuICBwcml2YXRlIGNhbGN1bGF0ZU1vbnRoKGZvckRheTogRCk6IGFueSB7XG4gICAgY29uc3QgeWVhciA9IHRoaXMuZGF0ZUFkYXB0ZXIuZ2V0WWVhcihmb3JEYXkpO1xuICAgIGNvbnN0IG1vbnRoID0gdGhpcy5kYXRlQWRhcHRlci5nZXRNb250aChmb3JEYXkpO1xuICAgIGNvbnN0IHN0YXJ0ID0gdGhpcy5kYXRlQWRhcHRlci5jcmVhdGVEYXRlKHllYXIsIG1vbnRoLCAxKTtcbiAgICBjb25zdCBlbmQgPSB0aGlzLmRhdGVBZGFwdGVyLmFkZENhbGVuZGFyRGF5cyhcbiAgICAgIHN0YXJ0LFxuICAgICAgdGhpcy5kYXRlQWRhcHRlci5nZXROdW1EYXlzSW5Nb250aChmb3JEYXkpIC0gMVxuICAgICk7XG4gICAgcmV0dXJuIFtzdGFydCwgZW5kXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgVG9kYXlcbiAgICogQHByaXZhdGVcbiAgICovXG5cbiAgcHJpdmF0ZSBnZXQgdG9kYXkoKTogRCB7XG4gICAgY29uc3QgdG9kYXkgPSB0aGlzLmRhdGVBZGFwdGVyLnRvZGF5KCk7XG5cbiAgICBpZiAodG9kYXkgPT09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignZGF0ZSBjcmVhdGlvbiBmYWlsZWQnKTtcbiAgICB9XG4gICAgcmV0dXJuIHRvZGF5O1xuICB9XG5cblxufVxuIl19