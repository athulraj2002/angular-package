import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { MatDateRangePicker, MatCalendar } from '@angular/material/datepicker';
import { PopFieldItemComponent } from '../../../../pop-field-item.component';

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
] as const;

type DatePreset = typeof  datePresets[number];

@Component({
  selector: 'lib-date-range-panel',
  templateUrl: 'date-range-panel.component.html',
  styleUrls: ['date-range-panel.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateRangePanelComponent<D> {
  readonly presets = datePresets;

  selected: DatePreset | '' = '';

  constructor(
    private dateAdapter: DateAdapter<D>,
    private datePicker: MatDateRangePicker<D>,
    private calendar: MatCalendar<D>,
  ){


  }

  /**
   * Apply the preset to Datepicker and Calendar
   * @param datePreset: Example: This week
   */

  selectDatePreset(datePreset: DatePreset): void{
    this.selected = datePreset;
    const [start, end] = this.calculateDateRange(datePreset);


    // @ts-ignore
    // if only start is selected we need to set end to clear out start and end.
    if((this.selected.start !== undefined && !this.calendar.selected.end) || (this.calendar.selected.start &&  !this.calendar.selected.end)){
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

  private adjDayOfWeekToStartOnMonday(today:D):number{
    let dayOfWeek = this.dateAdapter.getDayOfWeek(today);
    dayOfWeek = dayOfWeek === 0 ? 6 : (dayOfWeek -1);
    return dayOfWeek;
  }

  /**
   * Calculate date range preset
   * @param datePreset: Example: This week.
   */

  private calculateDateRange(datePreset: DatePreset): any{
    const today = this.today;

    switch(datePreset){
      case 'Today':
        return [today,today];
      case 'So Far This Week':{
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
      case 'Next Week':{
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

  private calculateWeek(forDay: D): any {
    const deltaStart =
      this.dateAdapter.getFirstDayOfWeek() -
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

  private calculateMonth(forDay: D): any {
    const year = this.dateAdapter.getYear(forDay);
    const month = this.dateAdapter.getMonth(forDay);
    const start = this.dateAdapter.createDate(year, month, 1);
    const end = this.dateAdapter.addCalendarDays(
      start,
      this.dateAdapter.getNumDaysInMonth(forDay) - 1
    );
    return [start, end];
  }

  /**
   * Get Today
   * @private
   */

  private get today(): D {
    const today = this.dateAdapter.today();

    if (today === null) {
      throw new Error('date creation failed');
    }
    return today;
  }


}
