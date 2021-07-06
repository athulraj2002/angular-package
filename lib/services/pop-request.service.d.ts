import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
export declare class PopRequestService {
    private http;
    private env?;
    private readonly offsetLimit;
    private baseUrl;
    constructor(http: HttpClient, env?: any);
    getHeaders(version: any, businessId?: number): {
        'X-Popcx-Business': string;
        'Content-Type': string;
        'Api-Version': any;
    };
    getBaseUrl(): string;
    setBaseUrl(baseUrl: string): void;
    getOffsetLimit(): number;
    doGet(url: string, params?: object, version?: number, ignore401?: boolean, businessId?: number): Observable<any>;
    doDelete(url: string, body?: object, version?: number, ignore401?: boolean, businessId?: number): Observable<any>;
    doPatch(url: string, data: object, version?: number, ignore401?: boolean, businessId?: number): Observable<any>;
    doPost(url: string, data: object, version?: number, ignore401?: boolean, businessId?: number): Observable<any>;
    transform(value: string | number, transformation: any): string | number;
    private _setParams;
}
