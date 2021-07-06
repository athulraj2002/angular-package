import { MatCalendar } from '@angular/material/datepicker';
import { DateAdapter, MatDateFormats } from '@angular/material/core';
export declare class ExpansionItemsComponent<D> {
    private calendar;
    private dateAdapter;
    private dateFormat;
    constructor(calendar: MatCalendar<D>, dateAdapter: DateAdapter<D>, dateFormat: MatDateFormats);
    /**
     * Toggle Calendar between Month and Multiple Year
     */
    toggleCalView(): void;
    /**
     * Get the date month and year label. Example: May 2021.
     */
    get periodLabel(): string;
    /**
     * Change the month or year by -1
     * @param mode month or year
     */
    previousClicked(mode: 'month' | 'year'): void;
    /**
     * Change the month or year 1
     * @param mode
     */
    nextClicked(mode: 'month' | 'year'): void;
    /**
     * Change the month or year by -1 or 1
     * @param mode : year or month
     * @param amount -1 or 1
     * @private
     */
    private changeDate;
}
