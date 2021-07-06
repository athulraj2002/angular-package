import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { MatDatepicker,  MatCalendar } from '@angular/material/datepicker';

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
] as const;

type DatePreset = typeof  datePresets[number];

@Component({
  selector: 'lib-custom-panel',
  templateUrl: 'custom-panel.component.html',
  styleUrls: ['custom-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomPanelComponent<D>{
  readonly presets = datePresets;

  selected: DatePreset = 'Today';
  dayOfWeek: string;

  constructor(
    private dateAdapter: DateAdapter<D>,
    private datePicker: MatDatepicker<D>,
    private calendar: MatCalendar<D>,
  ){

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

  selectDatePreset(datePreset: DatePreset): void{
    this.selected = datePreset;
    const date = this.calculateDate(datePreset);
    this.datePicker.select(date);
    this.calendar.activeDate = date;
  }


  /**
   * Calculate date Preset
   * @param datePreset: Example: Today.
   */

  calculateDate(datePreset: DatePreset): any{
    const today = this.today;

    switch(datePreset){
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

  private get today(): D {
    const today = this.dateAdapter.today();

    if (today === null) {
      throw new Error('date creation failed');
    }
    return today;
  }

}
