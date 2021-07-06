import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { MatDatepicker, MatCalendar } from '@angular/material/datepicker';
const datePresets = [
    'Today',
    'Last',
    'Previous',
    'Next',
    'Last Month',
    'Next Month',
    'Last Year',
    'Next Year',
    'Custom'
];
export class CustomPanelComponent {
    constructor(dateAdapter, datePicker, calendar) {
        this.dateAdapter = dateAdapter;
        this.datePicker = datePicker;
        this.calendar = calendar;
        this.presets = datePresets;
        this.selected = 'Today';
        // Get the day of the week to add to preset. Example: Next Monday
        switch (new Date().getDay()) {
            case 0:
                this.dayOfWeek = "Sunday";
                break;
            case 1:
                this.dayOfWeek = "Monday";
                break;
            case 2:
                this.dayOfWeek = "Tuesday";
                break;
            case 3:
                this.dayOfWeek = "Wednesday";
                break;
            case 4:
                this.dayOfWeek = "Thursday";
                break;
            case 5:
                this.dayOfWeek = "Friday";
                break;
            case 6:
                this.dayOfWeek = "Saturday";
        }
    }
    /**
     * Apply the preset to Datepicker and Calendar
     * @param datePreset: Example: Today
     */
    selectDatePreset(datePreset) {
        this.selected = datePreset;
        const date = this.calculateDate(datePreset);
        this.datePicker.select(date);
        this.calendar.activeDate = date;
    }
    /**
     * Calculate date Preset
     * @param datePreset: Example: Today.
     */
    calculateDate(datePreset) {
        const today = this.today;
        switch (datePreset) {
            case 'Today':
                return today;
            case 'Last':
                return this.dateAdapter.addCalendarDays(today, -7);
            case 'Previous':
                return this.dateAdapter.addCalendarDays(today, -14);
            case 'Next':
                return this.dateAdapter.addCalendarDays(today, 7);
            case 'Last Month':
                return this.dateAdapter.addCalendarMonths(today, -1);
            case 'Next Month':
                return this.dateAdapter.addCalendarMonths(today, 1);
            case 'Last Year':
                return this.dateAdapter.addCalendarYears(today, -1);
            case 'Next Year':
                return this.dateAdapter.addCalendarYears(today, 1);
        }
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
CustomPanelComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-custom-panel',
                template: "\n<mat-card class=\"pop-datepicker-panel\">\n  <button\n    class=\"date-preset-button\"\n    [ngClass]=\"{'selected': item === selected}\"\n    *ngFor=\"let item of presets\"\n    mat-button\n    color=\"accent\"\n    (click)=\"selectDatePreset(item)\"\n  >\n    {{ item }} <span *ngIf=\"item === 'Last' || item === 'Previous' || item === 'Next'\">{{dayOfWeek}}</span>\n  </button>\n</mat-card>\n",
                changeDetection: ChangeDetectionStrategy.OnPush,
                styles: [":host{position:absolute;width:200px;left:-200px}.pop-datepicker-panel{position:relative;top:-1px;border-left:1px solid #d3d3d3;border-bottom:1px solid #d3d3d3;border-top:1px solid #d3d3d3;border-radius:0;padding:var(--gap-s);height:405px}.date-preset-button,.selected{width:100%;text-align:left}.selected{background:var(--background-side-menu)}"]
            },] }
];
CustomPanelComponent.ctorParameters = () => [
    { type: DateAdapter },
    { type: MatDatepicker },
    { type: MatCalendar }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VzdG9tLXBhbmVsLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2Jhc2UvcG9wLWZpZWxkLWl0ZW0vcG9wLWRhdGUvZGF0ZXBpY2tlci1leHBhbnNpb24taXRlbXMvY3VzdG9tLXBhbmVsL2N1c3RvbS1wYW5lbC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLHVCQUF1QixFQUFFLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNuRSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDckQsT0FBTyxFQUFFLGFBQWEsRUFBRyxXQUFXLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUUzRSxNQUFNLFdBQVcsR0FBRztJQUNsQixPQUFPO0lBQ1AsTUFBTTtJQUNOLFVBQVU7SUFDVixNQUFNO0lBQ04sWUFBWTtJQUNaLFlBQVk7SUFDWixXQUFXO0lBQ1gsV0FBVztJQUNYLFFBQVE7Q0FDQSxDQUFDO0FBVVgsTUFBTSxPQUFPLG9CQUFvQjtJQU0vQixZQUNVLFdBQTJCLEVBQzNCLFVBQTRCLEVBQzVCLFFBQXdCO1FBRnhCLGdCQUFXLEdBQVgsV0FBVyxDQUFnQjtRQUMzQixlQUFVLEdBQVYsVUFBVSxDQUFrQjtRQUM1QixhQUFRLEdBQVIsUUFBUSxDQUFnQjtRQVJ6QixZQUFPLEdBQUcsV0FBVyxDQUFDO1FBRS9CLGFBQVEsR0FBZSxPQUFPLENBQUM7UUFTN0IsaUVBQWlFO1FBQ2pFLFFBQVEsSUFBSSxJQUFJLEVBQUUsQ0FBQyxNQUFNLEVBQUUsRUFBRTtZQUMzQixLQUFLLENBQUM7Z0JBQ0osSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7Z0JBQzFCLE1BQU07WUFDUixLQUFLLENBQUM7Z0JBQ0osSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7Z0JBQzFCLE1BQU07WUFDUixLQUFLLENBQUM7Z0JBQ0osSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7Z0JBQzNCLE1BQU07WUFDUixLQUFLLENBQUM7Z0JBQ0osSUFBSSxDQUFDLFNBQVMsR0FBRyxXQUFXLENBQUM7Z0JBQzdCLE1BQU07WUFDUixLQUFLLENBQUM7Z0JBQ0osSUFBSSxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUM7Z0JBQzVCLE1BQU07WUFDUixLQUFLLENBQUM7Z0JBQ0osSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7Z0JBQzFCLE1BQU07WUFDUixLQUFLLENBQUM7Z0JBQ0osSUFBSSxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUM7U0FDL0I7SUFDSCxDQUFDO0lBR0Q7OztPQUdHO0lBRUgsZ0JBQWdCLENBQUMsVUFBc0I7UUFDckMsSUFBSSxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUM7UUFDM0IsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUM1QyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM3QixJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7SUFDbEMsQ0FBQztJQUdEOzs7T0FHRztJQUVILGFBQWEsQ0FBQyxVQUFzQjtRQUNsQyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBRXpCLFFBQU8sVUFBVSxFQUFDO1lBQ2hCLEtBQUssT0FBTztnQkFDVixPQUFPLEtBQUssQ0FBQztZQUNmLEtBQUssTUFBTTtnQkFDVCxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JELEtBQUssVUFBVTtnQkFDYixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3RELEtBQUssTUFBTTtnQkFDVCxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNwRCxLQUFLLFlBQVk7Z0JBQ2YsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZELEtBQUssWUFBWTtnQkFDZixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsaUJBQWlCLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3RELEtBQUssV0FBVztnQkFDZCxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEQsS0FBSyxXQUFXO2dCQUNkLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDdEQ7SUFDSCxDQUFDO0lBR0Q7OztPQUdHO0lBRUgsSUFBWSxLQUFLO1FBQ2YsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUV2QyxJQUFJLEtBQUssS0FBSyxJQUFJLEVBQUU7WUFDbEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1NBQ3pDO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDOzs7WUFsR0YsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSxrQkFBa0I7Z0JBQzVCLHlaQUEwQztnQkFFMUMsZUFBZSxFQUFFLHVCQUF1QixDQUFDLE1BQU07O2FBQ2hEOzs7WUF0QlEsV0FBVztZQUNYLGFBQWE7WUFBRyxXQUFXIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksIENvbXBvbmVudCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgRGF0ZUFkYXB0ZXIgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9jb3JlJztcbmltcG9ydCB7IE1hdERhdGVwaWNrZXIsICBNYXRDYWxlbmRhciB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2RhdGVwaWNrZXInO1xuXG5jb25zdCBkYXRlUHJlc2V0cyA9IFtcbiAgJ1RvZGF5JyxcbiAgJ0xhc3QnLFxuICAnUHJldmlvdXMnLFxuICAnTmV4dCcsXG4gICdMYXN0IE1vbnRoJyxcbiAgJ05leHQgTW9udGgnLFxuICAnTGFzdCBZZWFyJyxcbiAgJ05leHQgWWVhcicsXG4gICdDdXN0b20nXG5dIGFzIGNvbnN0O1xuXG50eXBlIERhdGVQcmVzZXQgPSB0eXBlb2YgIGRhdGVQcmVzZXRzW251bWJlcl07XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2xpYi1jdXN0b20tcGFuZWwnLFxuICB0ZW1wbGF0ZVVybDogJ2N1c3RvbS1wYW5lbC5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWydjdXN0b20tcGFuZWwuY29tcG9uZW50LnNjc3MnXSxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG59KVxuZXhwb3J0IGNsYXNzIEN1c3RvbVBhbmVsQ29tcG9uZW50PEQ+e1xuICByZWFkb25seSBwcmVzZXRzID0gZGF0ZVByZXNldHM7XG5cbiAgc2VsZWN0ZWQ6IERhdGVQcmVzZXQgPSAnVG9kYXknO1xuICBkYXlPZldlZWs6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGRhdGVBZGFwdGVyOiBEYXRlQWRhcHRlcjxEPixcbiAgICBwcml2YXRlIGRhdGVQaWNrZXI6IE1hdERhdGVwaWNrZXI8RD4sXG4gICAgcHJpdmF0ZSBjYWxlbmRhcjogTWF0Q2FsZW5kYXI8RD4sXG4gICl7XG5cbiAgICAvLyBHZXQgdGhlIGRheSBvZiB0aGUgd2VlayB0byBhZGQgdG8gcHJlc2V0LiBFeGFtcGxlOiBOZXh0IE1vbmRheVxuICAgIHN3aXRjaCAobmV3IERhdGUoKS5nZXREYXkoKSkge1xuICAgICAgY2FzZSAwOlxuICAgICAgICB0aGlzLmRheU9mV2VlayA9IFwiU3VuZGF5XCI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAxOlxuICAgICAgICB0aGlzLmRheU9mV2VlayA9IFwiTW9uZGF5XCI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICB0aGlzLmRheU9mV2VlayA9IFwiVHVlc2RheVwiO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgdGhpcy5kYXlPZldlZWsgPSBcIldlZG5lc2RheVwiO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgNDpcbiAgICAgICAgdGhpcy5kYXlPZldlZWsgPSBcIlRodXJzZGF5XCI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA1OlxuICAgICAgICB0aGlzLmRheU9mV2VlayA9IFwiRnJpZGF5XCI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA2OlxuICAgICAgICB0aGlzLmRheU9mV2VlayA9IFwiU2F0dXJkYXlcIjtcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBBcHBseSB0aGUgcHJlc2V0IHRvIERhdGVwaWNrZXIgYW5kIENhbGVuZGFyXG4gICAqIEBwYXJhbSBkYXRlUHJlc2V0OiBFeGFtcGxlOiBUb2RheVxuICAgKi9cblxuICBzZWxlY3REYXRlUHJlc2V0KGRhdGVQcmVzZXQ6IERhdGVQcmVzZXQpOiB2b2lke1xuICAgIHRoaXMuc2VsZWN0ZWQgPSBkYXRlUHJlc2V0O1xuICAgIGNvbnN0IGRhdGUgPSB0aGlzLmNhbGN1bGF0ZURhdGUoZGF0ZVByZXNldCk7XG4gICAgdGhpcy5kYXRlUGlja2VyLnNlbGVjdChkYXRlKTtcbiAgICB0aGlzLmNhbGVuZGFyLmFjdGl2ZURhdGUgPSBkYXRlO1xuICB9XG5cblxuICAvKipcbiAgICogQ2FsY3VsYXRlIGRhdGUgUHJlc2V0XG4gICAqIEBwYXJhbSBkYXRlUHJlc2V0OiBFeGFtcGxlOiBUb2RheS5cbiAgICovXG5cbiAgY2FsY3VsYXRlRGF0ZShkYXRlUHJlc2V0OiBEYXRlUHJlc2V0KTogYW55e1xuICAgIGNvbnN0IHRvZGF5ID0gdGhpcy50b2RheTtcblxuICAgIHN3aXRjaChkYXRlUHJlc2V0KXtcbiAgICAgIGNhc2UgJ1RvZGF5JzpcbiAgICAgICAgcmV0dXJuIHRvZGF5O1xuICAgICAgY2FzZSAnTGFzdCc6XG4gICAgICAgIHJldHVybiB0aGlzLmRhdGVBZGFwdGVyLmFkZENhbGVuZGFyRGF5cyh0b2RheSwgLTcpO1xuICAgICAgY2FzZSAnUHJldmlvdXMnOlxuICAgICAgICByZXR1cm4gdGhpcy5kYXRlQWRhcHRlci5hZGRDYWxlbmRhckRheXModG9kYXksIC0xNCk7XG4gICAgICBjYXNlICdOZXh0JzpcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZUFkYXB0ZXIuYWRkQ2FsZW5kYXJEYXlzKHRvZGF5LCA3KTtcbiAgICAgIGNhc2UgJ0xhc3QgTW9udGgnOlxuICAgICAgICByZXR1cm4gdGhpcy5kYXRlQWRhcHRlci5hZGRDYWxlbmRhck1vbnRocyh0b2RheSwgLTEpO1xuICAgICAgY2FzZSAnTmV4dCBNb250aCc6XG4gICAgICAgIHJldHVybiB0aGlzLmRhdGVBZGFwdGVyLmFkZENhbGVuZGFyTW9udGhzKHRvZGF5LCAxKTtcbiAgICAgIGNhc2UgJ0xhc3QgWWVhcic6XG4gICAgICAgIHJldHVybiB0aGlzLmRhdGVBZGFwdGVyLmFkZENhbGVuZGFyWWVhcnModG9kYXksIC0xKTtcbiAgICAgIGNhc2UgJ05leHQgWWVhcic6XG4gICAgICAgIHJldHVybiB0aGlzLmRhdGVBZGFwdGVyLmFkZENhbGVuZGFyWWVhcnModG9kYXksIDEpO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIEdldCBUb2RheVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cblxuICBwcml2YXRlIGdldCB0b2RheSgpOiBEIHtcbiAgICBjb25zdCB0b2RheSA9IHRoaXMuZGF0ZUFkYXB0ZXIudG9kYXkoKTtcblxuICAgIGlmICh0b2RheSA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdkYXRlIGNyZWF0aW9uIGZhaWxlZCcpO1xuICAgIH1cbiAgICByZXR1cm4gdG9kYXk7XG4gIH1cblxufVxuIl19