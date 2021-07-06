import { PipeTransform } from '@angular/core';
export declare class LabelPipe implements PipeTransform {
    aliases: any[];
    /**
     * Provides the actual name we want displayed to the user.
     * text - The field name coming from the DB.
     * displayInfo - Either a string or object. If object then will look for property display or label. Takes aliases into account. IE: account:ID
     * set - If passed will look in the displayInfo object for this field before falling back to the display or label field.
     * returns {string}
     */
    transform(text: string, displayInfo?: any, displayField?: string): string;
    getAlias(entity: any): any;
}
