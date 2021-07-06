import { PipeTransform } from '@angular/core';
export declare class ToActiveOrArchivedPipe implements PipeTransform {
    /**
     * If value is true, then that would indicate that is archived
     * @param value
     */
    transform(value: any): "Archived" | "Active";
}
