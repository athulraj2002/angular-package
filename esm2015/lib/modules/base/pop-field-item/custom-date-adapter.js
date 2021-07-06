import { NativeDateAdapter } from '@angular/material/core';
import { Injectable } from "@angular/core";
/** Adapts the native JS Date for use with cdk-based modules that work with dates. */
export class CustomDateAdapter extends NativeDateAdapter {
    // parse the date from input component as it only expect dates in
    // mm-dd-yyyy format
    // parse(value: any): Date | null {
    //   if ((typeof value === 'string') && (value.indexOf('/') > -1)) {
    //     const str = value.split('/');
    //
    //     const year = Number(str[2]);
    //     const month = Number(str[1]) - 1;
    //     const date = Number(str[0]);
    //
    //     return new Date(year, month, date);
    //   }
    //   const timestamp = typeof value === 'number' ? value : Date.parse(value);
    //   return isNaN(timestamp) ? null : new Date(timestamp);
    // }
    getFirstDayOfWeek() {
        return 1;
    }
}
CustomDateAdapter.decorators = [
    { type: Injectable }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VzdG9tLWRhdGUtYWRhcHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2Jhc2UvcG9wLWZpZWxkLWl0ZW0vY3VzdG9tLWRhdGUtYWRhcHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUMzRCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTNDLHFGQUFxRjtBQUdyRixNQUFNLE9BQU8saUJBQWtCLFNBQVEsaUJBQWlCO0lBRXRELGlFQUFpRTtJQUNqRSxvQkFBb0I7SUFDcEIsbUNBQW1DO0lBQ25DLG9FQUFvRTtJQUNwRSxvQ0FBb0M7SUFDcEMsRUFBRTtJQUNGLG1DQUFtQztJQUNuQyx3Q0FBd0M7SUFDeEMsbUNBQW1DO0lBQ25DLEVBQUU7SUFDRiwwQ0FBMEM7SUFDMUMsTUFBTTtJQUNOLDZFQUE2RTtJQUM3RSwwREFBMEQ7SUFDMUQsSUFBSTtJQUVKLGlCQUFpQjtRQUNmLE9BQU8sQ0FBQyxDQUFDO0lBQ1gsQ0FBQzs7O1lBckJGLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOYXRpdmVEYXRlQWRhcHRlciB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2NvcmUnO1xuaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5cbi8qKiBBZGFwdHMgdGhlIG5hdGl2ZSBKUyBEYXRlIGZvciB1c2Ugd2l0aCBjZGstYmFzZWQgbW9kdWxlcyB0aGF0IHdvcmsgd2l0aCBkYXRlcy4gKi9cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEN1c3RvbURhdGVBZGFwdGVyIGV4dGVuZHMgTmF0aXZlRGF0ZUFkYXB0ZXIge1xuXG4gIC8vIHBhcnNlIHRoZSBkYXRlIGZyb20gaW5wdXQgY29tcG9uZW50IGFzIGl0IG9ubHkgZXhwZWN0IGRhdGVzIGluXG4gIC8vIG1tLWRkLXl5eXkgZm9ybWF0XG4gIC8vIHBhcnNlKHZhbHVlOiBhbnkpOiBEYXRlIHwgbnVsbCB7XG4gIC8vICAgaWYgKCh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSAmJiAodmFsdWUuaW5kZXhPZignLycpID4gLTEpKSB7XG4gIC8vICAgICBjb25zdCBzdHIgPSB2YWx1ZS5zcGxpdCgnLycpO1xuICAvL1xuICAvLyAgICAgY29uc3QgeWVhciA9IE51bWJlcihzdHJbMl0pO1xuICAvLyAgICAgY29uc3QgbW9udGggPSBOdW1iZXIoc3RyWzFdKSAtIDE7XG4gIC8vICAgICBjb25zdCBkYXRlID0gTnVtYmVyKHN0clswXSk7XG4gIC8vXG4gIC8vICAgICByZXR1cm4gbmV3IERhdGUoeWVhciwgbW9udGgsIGRhdGUpO1xuICAvLyAgIH1cbiAgLy8gICBjb25zdCB0aW1lc3RhbXAgPSB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInID8gdmFsdWUgOiBEYXRlLnBhcnNlKHZhbHVlKTtcbiAgLy8gICByZXR1cm4gaXNOYU4odGltZXN0YW1wKSA/IG51bGwgOiBuZXcgRGF0ZSh0aW1lc3RhbXApO1xuICAvLyB9XG5cbiAgZ2V0Rmlyc3REYXlPZldlZWsoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gMTtcbiAgfVxufVxuIl19