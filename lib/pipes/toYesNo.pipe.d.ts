import { PipeTransform } from '@angular/core';
export declare class ToYesNoPipe implements PipeTransform {
    transform(value: any): "Yes" | "No";
}
