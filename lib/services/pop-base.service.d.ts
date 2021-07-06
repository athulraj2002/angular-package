import { OnDestroy } from '@angular/core';
import { KeyMap } from '../pop-common.model';
import { AuthUser, Business, BusinessUser, AuthDetails } from '../pop-common-token.model';
import { PopExtendService } from './pop-extend.service';
export declare class PopBaseService extends PopExtendService implements OnDestroy {
    name: string;
    protected asset: {
        sessionRoot: string;
        businessId: number;
        authTime: number;
    };
    private auth;
    constructor();
    /************************************************************************************************
     *                                                                                              *
     *                                      Local Storage                                           *
     *                                                                                              *
     ************************************************************************************************/
    /**
     * Clear localStorage data
     */
    clearLocalStorage(): void;
    /************************************************************************************************
     *                                                                                              *
     *                                      Auth Details                                            *
     *                                                                                              *
     ************************************************************************************************/
    /**
     * Remove any user auth relics
     */
    clearAuthDetails(caller: string): void;
    /**
     * Clear the time when an auth was last completed
     */
    clearAuthTime(): void;
    /**
     * Return the entire Auth Object
     */
    getAuthDetails(): AuthDetails;
    /**
     * Extract the prime user/ root out of the auth details
     */
    getAuthPrimeUser(): AuthUser;
    /**
     * Return the time when the last authentication took place
     */
    getAuthTime(): number;
    /**
     * Bearer token helper
     * The api will expect an auth token for any authenticated routes
     */
    getBearerToken(): string;
    /**
     * Get all the Business Users that belong to the auth user
     */
    getAuthUsers(): KeyMap<BusinessUser>;
    /**
     * Get the current business id that is in user
     */
    getCurrentBusinessId(): number;
    /**
     * Return the business details for the current business
     */
    getCurrentBusinessUserId(): number;
    /**
     * Determine if the last auth has expired
     */
    isAuthExpired(): boolean;
    /**
     * Stores a timestamp to track when the last authentication took place
     */
    setAuthTime(): void;
    /**
     * Exposes the Auth Token at the root level of localStorage for convenience
     * @param token
     */
    setAuthToken(authToken: string): void;
    /**
     * Store the auth object that the auth/user login route return to the app
     * @param authDetails
     */
    setAuthDetails(auth: AuthDetails): void;
    /**
     * Exposes the Auth User at the root level of localStorage for convenience
     * @param token
     */
    setAuthUser(primeUser: any): void;
    /**
     * Exposes the Auth Popcx Token at the root level of localStorage for convenience
     * @param token
     */
    setAuthPopcxToken(token: string): void;
    /**
     * Track the current business that has been selected
     * @param id
     */
    setCurrentBusinessId(id: number): void;
    /**
     * Get all the Businesses that the auth user has access to
     */
    getAuthBusinesses(): KeyMap<Business>;
    /**
     * Switch to a different business
     * @param id
     */
    switchBusiness(id: any): void;
    /**
     * Change to a different app with the current business
     * @param appPath
     */
    switchApps(appPath: string): void;
    /**
     * Change to a different app with the current business
     * @param appPath
     */
    checkAppAccess(appName: string, redirect?: boolean): boolean;
    /**
     * Determine the route after a user has authenticated
     */
    redirect(): void;
    ngOnDestroy(): void;
}
