import { DateAdapter } from '@angular/material/core';
import { MatDatepicker, MatCalendar } from '@angular/material/datepicker';
declare const datePresets: readonly ["Today", "Last", "Previous", "Next", "Last Month", "Next Month", "Last Year", "Next Year", "Custom"];
declare type DatePreset = typeof datePresets[number];
export declare class CustomPanelComponent<D> {
    private dateAdapter;
    private datePicker;
    private calendar;
    readonly presets: readonly ["Today", "Last", "Previous", "Next", "Last Month", "Next Month", "Last Year", "Next Year", "Custom"];
    selected: DatePreset;
    dayOfWeek: string;
    constructor(dateAdapter: DateAdapter<D>, datePicker: MatDatepicker<D>, calendar: MatCalendar<D>);
    /**
     * Apply the preset to Datepicker and Calendar
     * @param datePreset: Example: Today
     */
    selectDatePreset(datePreset: DatePreset): void;
    /**
     * Calculate date Preset
     * @param datePreset: Example: Today.
     */
    calculateDate(datePreset: DatePreset): any;
    /**
     * Get Today
     * @private
     */
    private get today();
}
export {};
