import { Component, Inject } from '@angular/core';
import { MatCalendar } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
export class DateRangeExpansionItemsComponent {
    constructor(calendar, dateAdapter, dateFormat) {
        this.calendar = calendar;
        this.dateAdapter = dateAdapter;
        this.dateFormat = dateFormat;
    }
    /**
     * Toggle Calendar between Month and Multiple Year
     */
    toggleCalView() {
        this.calendar.currentView = this.calendar.currentView === 'month' ? 'multi-year' : 'month';
    }
    /**
     * Get the date month and year label. Example: May 2021.
     */
    get periodLabel() {
        return this.dateAdapter.format(this.calendar.activeDate, this.dateFormat.display.monthYearA11yLabel);
    }
    /**
     * Change the month or year by -1
     * @param mode month or year
     */
    previousClicked(mode) {
        this.changeDate(mode, -1);
    }
    /**
     * Change the month or year 1
     * @param mode
     */
    nextClicked(mode) {
        this.changeDate(mode, 1);
    }
    /**
     * Change the month or year by -1 or 1
     * @param mode : year or month
     * @param amount -1 or 1
     * @private
     */
    changeDate(mode, amount) {
        this.calendar.activeDate = mode === 'month' ? this.dateAdapter.addCalendarMonths(this.calendar.activeDate, amount)
            : this.dateAdapter.addCalendarYears(this.calendar.activeDate, amount);
    }
}
DateRangeExpansionItemsComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-custom-header',
                template: "<lib-date-range-panel></lib-date-range-panel>\n<div class=\"example-header\">\n  <span class=\"header-label mat-body\" (click)=\"toggleCalView()\">{{ periodLabel }} <mat-icon class=\"view-nav\" >arrow_drop_down</mat-icon></span>\n  <button class=\"nav-button\" mat-icon-button (click)=\"previousClicked('month')\">\n    <mat-icon>keyboard_arrow_left</mat-icon>\n  </button>\n\n  <button class=\"nav-button\" mat-icon-button (click)=\"nextClicked('month')\">\n    <mat-icon>keyboard_arrow_right</mat-icon>\n  </button>\n\n</div>\n<div class=\"date-custom-footer\">\n  <button id=\"datepicker-cancel\" class=\"date-action-button\" mat-raised-button>CANCEL</button>\n  <button id=\"datepicker-apply\" mat-flat-button color=\"accent\" >APPLY</button>\n</div>\n",
                styles: [".example-header{display:flex;align-items:center;padding:var(--gap-m) var(--gap-m) 0 var(--gap-m)}.nav-button{color:var(--foreground-disabled)}.view-nav{position:relative;top:7px}.header-label{position:relative;top:-5px;flex:1;font-size:14px;color:var(--foreground-disabled);text-align:left;cursor:pointer}.example-double-arrow .mat-icon{color:var(--foreground-disabled);margin:-22%}.date-custom-footer{position:relative;top:320px;float:right;padding-right:var(--gap-m)}.date-action-button{margin-right:var(--gap-s)}::ng-deep .mat-calendar-body-in-range:not(.mat-calendar-body-range-start):not(.mat-calendar-body-range-end):before{background:var(--accent-selected)}::ng-deep td.mat-calendar-body-cell.mat-calendar-body-in-range.ng-star-inserted:last-child:before{border-top-right-radius:999px;border-bottom-right-radius:999px}::ng-deep tr:last-child td.mat-calendar-body-cell.mat-calendar-body-in-range.ng-star-inserted:last-child:before{border-top-right-radius:999px;border-bottom-right-radius:999px}::ng-deep td.mat-calendar-body-cell.mat-calendar-body-in-range.ng-star-inserted[data-mat-col=\"0\"]:before{border-top-left-radius:999px;border-bottom-left-radius:999px}::ng-deep .mat-calendar-body-range-start:before{border-top-left-radius:999px;border-bottom-left-radius:999px;background:var(--accent-selected)}::ng-deep .mat-calendar-body-range-end:before{border-top-right-radius:999px;border-bottom-right-radius:999px;background:var(--accent-selected)}"]
            },] }
];
DateRangeExpansionItemsComponent.ctorParameters = () => [
    { type: MatCalendar },
    { type: DateAdapter },
    { type: undefined, decorators: [{ type: Inject, args: [MAT_DATE_FORMATS,] }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZS1yYW5nZS1leHBhbnNpb24taXRlbXMuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvYmFzZS9wb3AtZmllbGQtaXRlbS9wb3AtZGF0ZS9wb3AtZGF0ZS1yYW5nZS9leHBhbnNpb24taXRlbXMvZGF0ZS1yYW5nZS1leHBhbnNpb24taXRlbXMuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ2xELE9BQU8sRUFBRSxXQUFXLEVBQXFDLE1BQU0sOEJBQThCLENBQUM7QUFDOUYsT0FBTyxFQUFFLFdBQVcsRUFBRSxnQkFBZ0IsRUFBa0IsTUFBTSx3QkFBd0IsQ0FBQztBQU92RixNQUFNLE9BQU8sZ0NBQWdDO0lBRTNDLFlBQ1UsUUFBd0IsRUFDeEIsV0FBMkIsRUFDRCxVQUEwQjtRQUZwRCxhQUFRLEdBQVIsUUFBUSxDQUFnQjtRQUN4QixnQkFBVyxHQUFYLFdBQVcsQ0FBZ0I7UUFDRCxlQUFVLEdBQVYsVUFBVSxDQUFnQjtJQUU5RCxDQUFDO0lBRUQ7O09BRUc7SUFFSCxhQUFhO1FBQ1gsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztJQUM3RixDQUFDO0lBRUQ7O09BRUc7SUFFSCxJQUFJLFdBQVc7UUFDYixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDdkcsQ0FBQztJQUVEOzs7T0FHRztJQUVILGVBQWUsQ0FBQyxJQUFzQjtRQUNwQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFFRDs7O09BR0c7SUFHSCxXQUFXLENBQUMsSUFBc0I7UUFDaEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDM0IsQ0FBQztJQUdEOzs7OztPQUtHO0lBQ0ssVUFBVSxDQUFDLElBQXNCLEVBQUUsTUFBYztRQUN2RCxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsR0FBRyxJQUFJLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBRSxJQUFJLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQztZQUNqSCxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUMxRSxDQUFDOzs7WUEzREYsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSxtQkFBbUI7Z0JBQzdCLGd3QkFBd0Q7O2FBRXpEOzs7WUFQUSxXQUFXO1lBQ1gsV0FBVzs0Q0FZZixNQUFNLFNBQUMsZ0JBQWdCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBJbmplY3QgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE1hdENhbGVuZGFyLCBNYXREYXRlcGlja2VyLCBNYXREYXRlUmFuZ2VQaWNrZXIgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9kYXRlcGlja2VyJztcbmltcG9ydCB7IERhdGVBZGFwdGVyLCBNQVRfREFURV9GT1JNQVRTLCBNYXREYXRlRm9ybWF0cyB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2NvcmUnO1xuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdsaWItY3VzdG9tLWhlYWRlcicsXG4gIHRlbXBsYXRlVXJsOiAnZGF0ZS1yYW5nZS1leHBhbnNpb24taXRlbXMuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsnZGF0ZS1yYW5nZS1leHBhbnNpb24taXRlbXMuY29tcG9uZW50LnNjc3MnXVxufSlcbmV4cG9ydCBjbGFzcyBEYXRlUmFuZ2VFeHBhbnNpb25JdGVtc0NvbXBvbmVudDxEPntcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGNhbGVuZGFyOiBNYXRDYWxlbmRhcjxEPixcbiAgICBwcml2YXRlIGRhdGVBZGFwdGVyOiBEYXRlQWRhcHRlcjxEPixcbiAgICBASW5qZWN0KE1BVF9EQVRFX0ZPUk1BVFMpIHByaXZhdGUgZGF0ZUZvcm1hdDogTWF0RGF0ZUZvcm1hdHMsXG4gICl7XG4gIH1cblxuICAvKipcbiAgICogVG9nZ2xlIENhbGVuZGFyIGJldHdlZW4gTW9udGggYW5kIE11bHRpcGxlIFllYXJcbiAgICovXG5cbiAgdG9nZ2xlQ2FsVmlldygpe1xuICAgIHRoaXMuY2FsZW5kYXIuY3VycmVudFZpZXcgPSB0aGlzLmNhbGVuZGFyLmN1cnJlbnRWaWV3ID09PSAnbW9udGgnID8gJ211bHRpLXllYXInIDogJ21vbnRoJztcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGRhdGUgbW9udGggYW5kIHllYXIgbGFiZWwuIEV4YW1wbGU6IE1heSAyMDIxLlxuICAgKi9cblxuICBnZXQgcGVyaW9kTGFiZWwoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5kYXRlQWRhcHRlci5mb3JtYXQodGhpcy5jYWxlbmRhci5hY3RpdmVEYXRlLCB0aGlzLmRhdGVGb3JtYXQuZGlzcGxheS5tb250aFllYXJBMTF5TGFiZWwpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoYW5nZSB0aGUgbW9udGggb3IgeWVhciBieSAtMVxuICAgKiBAcGFyYW0gbW9kZSBtb250aCBvciB5ZWFyXG4gICAqL1xuXG4gIHByZXZpb3VzQ2xpY2tlZChtb2RlOiAnbW9udGgnIHwgJ3llYXInKTogdm9pZHtcbiAgICB0aGlzLmNoYW5nZURhdGUobW9kZSwgLTEpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoYW5nZSB0aGUgbW9udGggb3IgeWVhciAxXG4gICAqIEBwYXJhbSBtb2RlXG4gICAqL1xuXG5cbiAgbmV4dENsaWNrZWQobW9kZTogJ21vbnRoJyB8ICd5ZWFyJyk6IHZvaWQge1xuICAgIHRoaXMuY2hhbmdlRGF0ZShtb2RlLCAxKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIENoYW5nZSB0aGUgbW9udGggb3IgeWVhciBieSAtMSBvciAxXG4gICAqIEBwYXJhbSBtb2RlIDogeWVhciBvciBtb250aFxuICAgKiBAcGFyYW0gYW1vdW50IC0xIG9yIDFcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHByaXZhdGUgY2hhbmdlRGF0ZShtb2RlOiAnbW9udGgnIHwgJ3llYXInLCBhbW91bnQ6IC0xIHwgMSk6IHZvaWQge1xuICAgIHRoaXMuY2FsZW5kYXIuYWN0aXZlRGF0ZSA9IG1vZGUgPT09ICdtb250aCcgPyAgdGhpcy5kYXRlQWRhcHRlci5hZGRDYWxlbmRhck1vbnRocyh0aGlzLmNhbGVuZGFyLmFjdGl2ZURhdGUsIGFtb3VudClcbiAgICAgIDogdGhpcy5kYXRlQWRhcHRlci5hZGRDYWxlbmRhclllYXJzKHRoaXMuY2FsZW5kYXIuYWN0aXZlRGF0ZSwgYW1vdW50KTtcbiAgfVxufVxuIl19