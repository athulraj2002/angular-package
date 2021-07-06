import { DateAdapter } from '@angular/material/core';
import { MatDateRangePicker, MatCalendar } from '@angular/material/datepicker';
declare const datePresets: readonly ["Today", "So Far This Week", "This Week", "Last Week", "Previous Week", "Rest of This Week", "Next Week", "This Month", "Last Month", "Next Month"];
declare type DatePreset = typeof datePresets[number];
export declare class DateRangePanelComponent<D> {
    private dateAdapter;
    private datePicker;
    private calendar;
    readonly presets: readonly ["Today", "So Far This Week", "This Week", "Last Week", "Previous Week", "Rest of This Week", "Next Week", "This Month", "Last Month", "Next Month"];
    selected: DatePreset | '';
    constructor(dateAdapter: DateAdapter<D>, datePicker: MatDateRangePicker<D>, calendar: MatCalendar<D>);
    /**
     * Apply the preset to Datepicker and Calendar
     * @param datePreset: Example: This week
     */
    selectDatePreset(datePreset: DatePreset): void;
    /**
     * Fix calulations to make monday first day of week instead of sunday
     * @param today
     * @private
     */
    private adjDayOfWeekToStartOnMonday;
    /**
     * Calculate date range preset
     * @param datePreset: Example: This week.
     */
    private calculateDateRange;
    /**
     * calculate start and end for week
     * @param forDay
     * @private
     */
    private calculateWeek;
    /**
     * Calculate start and end for month
     * @param forDay
     * @private
     */
    private calculateMonth;
    /**
     * Get Today
     * @private
     */
    private get today();
}
export {};
