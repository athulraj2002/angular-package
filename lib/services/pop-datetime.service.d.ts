import * as spacetime from 'spacetime/builds/spacetime.min';
export declare class PopDatetimeService {
    private timezone;
    private hourFormat;
    private dateFormat;
    protected srv: {
        spacetime: typeof spacetime;
    };
    constructor();
    transform(value: any, format?: string, seconds?: boolean): any;
    toIso(timestamp: any): any;
    toIsoShort(timestamp: any): any;
    getTommorow(date: any): any;
    add(date: any, direction?: number, unit?: string): any;
    subtract(date: any, direction?: number, unit?: string): any;
    getYesterday(date: any): any;
    getLatest(dates: any[]): any;
    getEarliest(dates: any[]): any;
    setCurrentBusinessUnitSettings(): void;
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    /**
     * Formats a datetime string to the correct datetime according to the timezone and formats for the user.
     *  - format enum: [date, time, datetime]
     */
    private _display;
    private _displayFormat;
}
