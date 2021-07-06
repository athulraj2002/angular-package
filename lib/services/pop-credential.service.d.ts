import { PopBaseService } from './pop-base.service';
import { AuthDetails } from '../pop-common-token.model';
import { HttpBackend } from '@angular/common/http';
import { AppGlobalInterface } from '../pop-common.model';
export declare class PopCredentialService {
    private base;
    private backend;
    private APP_GLOBAL;
    env?: any;
    name: string;
    private http;
    private readonly baseUrl;
    constructor(base: PopBaseService, backend: HttpBackend, APP_GLOBAL: AppGlobalInterface, env?: any);
    /**
     * Main login function hit after they click the Login button.
     *
     * @param credentials
     * @returns {Observable<void>}
     */
    authenticate(credentials: any): Promise<AuthDetails | string>;
    /**
     * Reset login function hit after password reset
     *
     * @param credentials
     * @returns {Observable<void>}
     */
    reset(credentials: any, businessId?: number): Promise<AuthDetails | string>;
    update(auth: AuthDetails, businessId?: number): Promise<AuthDetails | string>;
    clear(storage?: boolean): import("rxjs").Observable<any>;
    clearAll(storage?: boolean): import("rxjs").Observable<any>;
    /**
     * Verify the current auth storage
     *
     * @param credentials
     * @returns {Observable<void>}
     */
    verify(businessId: number): Promise<AuthDetails>;
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    private _attachBusinesses;
    private _setParams;
    private _transformAuthResponse;
}
