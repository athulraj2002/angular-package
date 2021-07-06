import { Component, Inject } from '@angular/core';
import { MatCalendar } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
export class ExpansionItemsComponent {
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
        return this.dateAdapter.format(this.calendar.activeDate, this.dateFormat.display.monthYearLabel);
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
ExpansionItemsComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-custom-header',
                template: "<lib-custom-panel></lib-custom-panel>\n<div class=\"example-header\">\n  <span class=\"header-label mat-body\" (click)=\"toggleCalView()\">{{ periodLabel }} <mat-icon class=\"view-nav\" >arrow_drop_down</mat-icon></span>\n  <button class=\"nav-button\" mat-icon-button (click)=\"previousClicked('month')\">\n    <mat-icon>keyboard_arrow_left</mat-icon>\n  </button>\n\n  <button class=\"nav-button\" mat-icon-button (click)=\"nextClicked('month')\">\n    <mat-icon>keyboard_arrow_right</mat-icon>\n  </button>\n\n</div>\n<div class=\"date-custom-footer\">\n  <button id=\"datepicker-cancel\" class=\"date-action-button\" mat-raised-button>CANCEL</button>\n  <button id=\"datepicker-apply\" mat-flat-button color=\"accent\" >APPLY</button>\n</div>\n",
                styles: [".example-header{display:flex;align-items:center;padding:var(--gap-m) var(--gap-m) 0 var(--gap-m)}.nav-button{color:var(--foreground-disabled)}.view-nav{position:relative;top:7px}.header-label{position:relative;top:-5px;flex:1;font-size:14px;color:var(--foreground-disabled);text-align:left;cursor:pointer}.example-double-arrow .mat-icon{color:var(--foreground-disabled);margin:-22%}.date-custom-footer{position:relative;top:320px;float:right;padding-right:var(--gap-m)}.date-action-button{margin-right:var(--gap-s)}"]
            },] }
];
ExpansionItemsComponent.ctorParameters = () => [
    { type: MatCalendar },
    { type: DateAdapter },
    { type: undefined, decorators: [{ type: Inject, args: [MAT_DATE_FORMATS,] }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwYW5zaW9uLWl0ZW1zLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2Jhc2UvcG9wLWZpZWxkLWl0ZW0vcG9wLWRhdGUvZGF0ZXBpY2tlci1leHBhbnNpb24taXRlbXMvZXhwYW5zaW9uLWl0ZW1zLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNsRCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDM0QsT0FBTyxFQUFFLFdBQVcsRUFBRSxnQkFBZ0IsRUFBa0IsTUFBTSx3QkFBd0IsQ0FBQztBQU92RixNQUFNLE9BQU8sdUJBQXVCO0lBRWxDLFlBQ1UsUUFBd0IsRUFDeEIsV0FBMkIsRUFDRCxVQUEwQjtRQUZwRCxhQUFRLEdBQVIsUUFBUSxDQUFnQjtRQUN4QixnQkFBVyxHQUFYLFdBQVcsQ0FBZ0I7UUFDRCxlQUFVLEdBQVYsVUFBVSxDQUFnQjtJQUU5RCxDQUFDO0lBR0Q7O09BRUc7SUFFSCxhQUFhO1FBQ1gsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztJQUM3RixDQUFDO0lBRUQ7O09BRUc7SUFFSCxJQUFJLFdBQVc7UUFDYixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQ25HLENBQUM7SUFHRDs7O09BR0c7SUFFSCxlQUFlLENBQUMsSUFBc0I7UUFDcEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBR0Q7OztPQUdHO0lBRUgsV0FBVyxDQUFDLElBQXNCO1FBQ2hDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFHRDs7Ozs7T0FLRztJQUVLLFVBQVUsQ0FBQyxJQUFzQixFQUFFLE1BQWM7UUFDdkQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEdBQUcsSUFBSSxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUM7WUFDakgsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDMUUsQ0FBQzs7O1lBOURGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsbUJBQW1CO2dCQUM3Qix3dkJBQTZDOzthQUU5Qzs7O1lBUFEsV0FBVztZQUNYLFdBQVc7NENBWWYsTUFBTSxTQUFDLGdCQUFnQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgSW5qZWN0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBNYXRDYWxlbmRhciB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2RhdGVwaWNrZXInO1xuaW1wb3J0IHsgRGF0ZUFkYXB0ZXIsIE1BVF9EQVRFX0ZPUk1BVFMsIE1hdERhdGVGb3JtYXRzIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvY29yZSc7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2xpYi1jdXN0b20taGVhZGVyJyxcbiAgdGVtcGxhdGVVcmw6ICdleHBhbnNpb24taXRlbXMuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsnZXhwYW5zaW9uLWl0ZW1zLmNvbXBvbmVudC5zY3NzJ11cbn0pXG5leHBvcnQgY2xhc3MgRXhwYW5zaW9uSXRlbXNDb21wb25lbnQ8RD57XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBjYWxlbmRhcjogTWF0Q2FsZW5kYXI8RD4sXG4gICAgcHJpdmF0ZSBkYXRlQWRhcHRlcjogRGF0ZUFkYXB0ZXI8RD4sXG4gICAgQEluamVjdChNQVRfREFURV9GT1JNQVRTKSBwcml2YXRlIGRhdGVGb3JtYXQ6IE1hdERhdGVGb3JtYXRzLFxuICApe1xuICB9XG5cblxuICAvKipcbiAgICogVG9nZ2xlIENhbGVuZGFyIGJldHdlZW4gTW9udGggYW5kIE11bHRpcGxlIFllYXJcbiAgICovXG5cbiAgdG9nZ2xlQ2FsVmlldygpe1xuICAgIHRoaXMuY2FsZW5kYXIuY3VycmVudFZpZXcgPSB0aGlzLmNhbGVuZGFyLmN1cnJlbnRWaWV3ID09PSAnbW9udGgnID8gJ211bHRpLXllYXInIDogJ21vbnRoJztcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGRhdGUgbW9udGggYW5kIHllYXIgbGFiZWwuIEV4YW1wbGU6IE1heSAyMDIxLlxuICAgKi9cblxuICBnZXQgcGVyaW9kTGFiZWwoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5kYXRlQWRhcHRlci5mb3JtYXQodGhpcy5jYWxlbmRhci5hY3RpdmVEYXRlLCB0aGlzLmRhdGVGb3JtYXQuZGlzcGxheS5tb250aFllYXJMYWJlbCk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBDaGFuZ2UgdGhlIG1vbnRoIG9yIHllYXIgYnkgLTFcbiAgICogQHBhcmFtIG1vZGUgbW9udGggb3IgeWVhclxuICAgKi9cblxuICBwcmV2aW91c0NsaWNrZWQobW9kZTogJ21vbnRoJyB8ICd5ZWFyJyk6IHZvaWR7XG4gICAgdGhpcy5jaGFuZ2VEYXRlKG1vZGUsIC0xKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIENoYW5nZSB0aGUgbW9udGggb3IgeWVhciAxXG4gICAqIEBwYXJhbSBtb2RlXG4gICAqL1xuXG4gIG5leHRDbGlja2VkKG1vZGU6ICdtb250aCcgfCAneWVhcicpOiB2b2lkIHtcbiAgICB0aGlzLmNoYW5nZURhdGUobW9kZSwgMSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBDaGFuZ2UgdGhlIG1vbnRoIG9yIHllYXIgYnkgLTEgb3IgMVxuICAgKiBAcGFyYW0gbW9kZSA6IHllYXIgb3IgbW9udGhcbiAgICogQHBhcmFtIGFtb3VudCAtMSBvciAxXG4gICAqIEBwcml2YXRlXG4gICAqL1xuXG4gIHByaXZhdGUgY2hhbmdlRGF0ZShtb2RlOiAnbW9udGgnIHwgJ3llYXInLCBhbW91bnQ6IC0xIHwgMSk6IHZvaWQge1xuICAgIHRoaXMuY2FsZW5kYXIuYWN0aXZlRGF0ZSA9IG1vZGUgPT09ICdtb250aCcgPyAgdGhpcy5kYXRlQWRhcHRlci5hZGRDYWxlbmRhck1vbnRocyh0aGlzLmNhbGVuZGFyLmFjdGl2ZURhdGUsIGFtb3VudClcbiAgICAgIDogdGhpcy5kYXRlQWRhcHRlci5hZGRDYWxlbmRhclllYXJzKHRoaXMuY2FsZW5kYXIuYWN0aXZlRGF0ZSwgYW1vdW50KTtcbiAgfVxufVxuIl19