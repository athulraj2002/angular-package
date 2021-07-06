import { Component, Inject } from '@angular/core';
import { MatCalendar, MatDatepicker, MatDateRangePicker } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS, MatDateFormats } from '@angular/material/core';

@Component({
  selector: 'lib-custom-header',
  templateUrl: 'date-range-expansion-items.component.html',
  styleUrls: ['date-range-expansion-items.component.scss']
})
export class DateRangeExpansionItemsComponent<D>{

  constructor(
    private calendar: MatCalendar<D>,
    private dateAdapter: DateAdapter<D>,
    @Inject(MAT_DATE_FORMATS) private dateFormat: MatDateFormats,
  ){
  }

  /**
   * Toggle Calendar between Month and Multiple Year
   */

  toggleCalView(){
    this.calendar.currentView = this.calendar.currentView === 'month' ? 'multi-year' : 'month';
  }

  /**
   * Get the date month and year label. Example: May 2021.
   */

  get periodLabel(): string {
    return this.dateAdapter.format(this.calendar.activeDate, this.dateFormat.display.monthYearA11yLabel);
  }

  /**
   * Change the month or year by -1
   * @param mode month or year
   */

  previousClicked(mode: 'month' | 'year'): void{
    this.changeDate(mode, -1);
  }

  /**
   * Change the month or year 1
   * @param mode
   */


  nextClicked(mode: 'month' | 'year'): void {
    this.changeDate(mode, 1);
  }


  /**
   * Change the month or year by -1 or 1
   * @param mode : year or month
   * @param amount -1 or 1
   * @private
   */
  private changeDate(mode: 'month' | 'year', amount: -1 | 1): void {
    this.calendar.activeDate = mode === 'month' ?  this.dateAdapter.addCalendarMonths(this.calendar.activeDate, amount)
      : this.dateAdapter.addCalendarYears(this.calendar.activeDate, amount);
  }
}
