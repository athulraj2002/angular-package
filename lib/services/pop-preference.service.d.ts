import { HttpClient } from '@angular/common/http';
import { PopRequestService } from './pop-request.service';
import { Observable } from 'rxjs';
export declare class PopPreferenceService {
    private http;
    private request;
    constructor(http: HttpClient, request: PopRequestService);
    /**
     * Get preferences at specified level.
     *  - IE: getPreferences('admin', 'users', 'table');
     *
     * @param level1
     * @param level2
     * @param level3
     * @param level4
     * @returns
     */
    getPreferences(level1: string, level2?: string, level3?: string, level4?: string): Observable<any>;
    /**
     * Saves a preferences at the specified level.
     *  - IE: savePreferences('TablePreferences', {some:object}, 'admin', 'users', 'table');
     *
     * @param name
     * @param data
     * @param level1
     * @param level2
     * @param level3
     * @param level4
     * @returns
     */
    savePreferences(name: string, data: any, level1: string, level2?: string, level3?: string, level4?: string): Observable<any>;
    /**
     * Deletes a specified preference. Typically used when resetting to default.
     *  - IE: deletePreferences('TablePreferences', 'admin', 'users', 'table');
     *
     * @param name
     * @param level1
     * @param level2
     * @param level3
     * @param level4
     * @returns
     */
    deletePreferences(name: string, level1: string, level2?: string, level3?: string, level4?: string): Observable<any>;
}
