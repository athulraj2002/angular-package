import { NativeDateAdapter } from '@angular/material/core';
/** Adapts the native JS Date for use with cdk-based modules that work with dates. */
export declare class CustomDateAdapter extends NativeDateAdapter {
    getFirstDayOfWeek(): number;
}
