import { HttpBackend } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PopExtendService } from './pop-extend.service';
export declare class PopRequestExternalService extends PopExtendService {
    private httpBackend;
    protected name: string;
    private baseUrl;
    private http;
    private urlRegex;
    constructor(httpBackend: HttpBackend);
    getBaseUrl(): string;
    setBaseUrl(baseUrl: string): void;
    doGet(url: string, params?: object, headers?: {
        [name: string]: string | string[];
    }): Observable<any>;
    doDelete(url: string, body?: object, headers?: {
        [name: string]: string | string[];
    }): Observable<any>;
    doPatch(url: string, data: object, headers?: {
        [name: string]: string | string[];
    }): Observable<any>;
    doPost(url: string, data: object, headers?: {
        [name: string]: string | string[];
    }): Observable<any>;
    private _setParams;
    private _checkUrl;
}
