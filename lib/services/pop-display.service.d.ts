export declare class PopDisplayService {
    private readonly aliases;
    constructor();
    /**
     * Provides the actual name we want displayed to the user.
     * field - The field name coming from the DB.
     * displayInfo - Either a string or object. If object then will look for property display or label. Takes aliases into account. IE: account:ID
     * set - If passed will look in the displayInfo object for this field before falling back to the display or label field.
     * returns {string}
     */
    set(text: string, displayInfo?: any, displayField?: string): string;
    alias(entity: any): any;
}
