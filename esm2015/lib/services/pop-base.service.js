import { Injectable, isDevMode } from '@angular/core';
import { PopBusiness, PopHref, SetPopAuth } from '../pop-common.model';
import { GetSiteVar, IsObject, IsString, SetSessionSiteVar, SetSiteVar, StorageGetter } from '../pop-common-utility';
import { GetAuthStorage } from '../pop-common-token.model';
import { PopExtendService } from './pop-extend.service';
import * as i0 from "@angular/core";
export class PopBaseService extends PopExtendService {
    constructor() {
        super();
        this.name = 'PopBaseService';
        this.asset = {
            sessionRoot: 'SiteVars',
            businessId: 0,
            authTime: undefined,
        };
        const authStorage = GetAuthStorage();
        this.auth = authStorage.auth;
        this.asset.businessId = authStorage.businessId;
        this.asset.authTime = authStorage.time;
        if (!this.asset.businessId) {
            const lastBusinessId = parseInt(GetSiteVar('Business.last') || '0', 10);
            if (lastBusinessId) {
                this.setCurrentBusinessId(lastBusinessId);
            }
        }
    }
    /************************************************************************************************
     *                                                                                              *
     *                                      Local Storage                                           *
     *                                                                                              *
     ************************************************************************************************/
    /**
     * Clear localStorage data
     */
    clearLocalStorage() {
        localStorage.clear();
        this.auth = null;
        this.asset.authTime = 0;
        this.asset.businessId = 0;
    }
    /************************************************************************************************
     *                                                                                              *
     *                                      Auth Details                                            *
     *                                                                                              *
     ************************************************************************************************/
    /**
     * Remove any user auth relics
     */
    clearAuthDetails(caller) {
        SetSessionSiteVar('Login.time', 0);
        this.clearLocalStorage();
        sessionStorage.clear();
    }
    /**
     * Clear the time when an auth was last completed
     */
    clearAuthTime() {
        this.asset.authTime = 0;
        SetSiteVar('Auth.time', 0);
        // localStorage.setItem('Auth-Time', '0');
    }
    /**
     * Return the entire Auth Object
     */
    getAuthDetails() {
        if (!IsObject(this.auth, true)) {
            const authStorage = GetAuthStorage();
            this.auth = authStorage.auth;
        }
        return this.auth;
    }
    /**
     * Extract the prime user/ root out of the auth details
     */
    getAuthPrimeUser() {
        if (IsObject(this.auth, ['id', 'email'])) {
            return {
                id: this.auth.id,
                name: this.auth.name,
                first_name: this.auth.first_name,
                last_name: this.auth.last_name,
                initials: this.auth.initials,
                avatarLink: StorageGetter(this.auth, ['profile', 'avatar_link'], null),
                email: this.auth.email,
                business_fk: this.auth.business_fk,
            };
        }
        return null;
    }
    /**
     * Return the time when the last authentication took place
     */
    getAuthTime() {
        return this.asset.authTime;
    }
    /**
     * Bearer token helper
     * The api will expect an auth token for any authenticated routes
     */
    getBearerToken() {
        if (IsObject(this.auth, ['token'])) {
            return 'Bearer ' + (this.auth.token ? this.auth.token : '123');
        }
        else {
            return '';
        }
    }
    /**
     * Get all the Business Users that belong to the auth user
     */
    getAuthUsers() {
        return JSON.parse(JSON.stringify(this.auth.users));
    }
    /**
     * Get the current business id that is in user
     */
    getCurrentBusinessId() {
        return this.asset.businessId;
    }
    /**
     * Return the business details for the current business
     */
    getCurrentBusinessUserId() {
        const businessId = this.getCurrentBusinessId();
        if (IsObject(this.auth.users, true) && businessId in this.auth.users) {
            return this.auth.users[businessId].id;
        }
        return 0;
    }
    /**
     * Determine if the last auth has expired
     */
    isAuthExpired() {
        let expired = false;
        if (!(IsObject(this.auth, ['token']))) {
            return true;
        }
        const currentTime = Math.round(new Date().getTime() / 1000);
        if (!this.asset.authTime || typeof this.auth.created_at == 'undefined' || !this.getBearerToken()) {
            expired = true;
        }
        else if (currentTime > ((+this.auth.created_at) + (this.auth.max_ttl * 60))) { // Check if token is passed max_ttl
            expired = true;
            return true;
        }
        else if (currentTime > (this.asset.authTime + (this.auth.max_ttl * 60))) { // Check if token has timed out.
            expired = true;
        }
        return expired;
    }
    /**
     * Stores a timestamp to track when the last authentication took place
     */
    setAuthTime() {
        // This gets set when there is a new token. It will calculate this and the tokendetails TTL / timeout to decide if the token
        // is expired without having to make an ajax call to know.
        this.asset.authTime = Math.round(new Date().getTime() / 1000);
        // localStorage.setItem('Auth-Time', this.asset.authTime.toString());
        SetSiteVar('Auth.time', this.asset.authTime.toString());
    }
    /**
     * Exposes the Auth Token at the root level of localStorage for convenience
     * @param token
     */
    setAuthToken(authToken) {
        // localStorage.setItem('Auth-Token', authToken);
        SetSiteVar('Auth.token', authToken);
    }
    /**
     * Store the auth object that the auth/user login route return to the app
     * @param authDetails
     */
    setAuthDetails(auth) {
        if (IsObject(auth, ['id', 'token'])) {
            const existingAuthDetailsDetails = this.auth;
            if (existingAuthDetailsDetails && +existingAuthDetailsDetails.id && +existingAuthDetailsDetails.id !== +auth.id) {
                // this.clearAuthDetails('setAuthDetails');
            }
            this.auth = auth;
            this.setAuthToken(this.auth.token);
            this.setAuthPopcxToken(this.auth.x_popcx_token);
            this.setAuthTime();
            SetPopAuth({
                id: auth.id,
                name: auth.name,
                first_name: auth.first_name,
                last_name: auth.last_name,
                initials: auth.initials,
                email: auth.email,
                email_verified_at: auth.email_verified_at,
                avatarLink: StorageGetter(this.auth, ['profile', 'avatar_link'], null),
                username: auth.username,
                created_at: auth.created_at
            });
            SetSiteVar('Auth.details', auth);
        }
    }
    /**
     * Exposes the Auth User at the root level of localStorage for convenience
     * @param token
     */
    setAuthUser(primeUser) {
        if (IsObject(primeUser, true)) {
            SetSiteVar('Auth.User', primeUser);
        }
    }
    /**
     * Exposes the Auth Popcx Token at the root level of localStorage for convenience
     * @param token
     */
    setAuthPopcxToken(token) {
        // localStorage.setItem('Auth-Popcx-Token', token);
        SetSiteVar('Auth.popcx-token', token);
    }
    /**
     * Track the current business that has been selected
     * @param id
     */
    setCurrentBusinessId(id) {
        this.asset.businessId = id;
        SetSessionSiteVar('Business.current', id);
        SetSiteVar('Business.last', id);
    }
    /**
     * Get all the Businesses that the auth user has access to
     */
    getAuthBusinesses() {
        return IsObject(this.auth, ['token']) && IsObject(this.auth.businesses) ? JSON.parse(JSON.stringify(this.auth.businesses)) : null;
    }
    /**
     * Switch to a different business
     * @param id
     */
    switchBusiness(id) {
        this.setCurrentBusinessId(id);
        this.redirect();
    }
    /**
     * Change to a different app with the current business
     * @param appPath
     */
    switchApps(appPath) {
        window.location.href = window.location.origin + appPath;
    }
    /**
     * Change to a different app with the current business
     * @param appPath
     */
    checkAppAccess(appName, redirect = false) {
        if (IsObject(PopBusiness, ['id', 'apps']) && IsObject(PopBusiness.apps, true)) {
            if (IsString(appName, true) && appName in PopBusiness.apps) {
                return true;
            }
        }
        if (redirect && !isDevMode()) {
            if (IsString(PopHref) && PopHref !== 'home')
                window.location.href = window.location.protocol + '//' + window.location.host + '/home';
        }
        return false;
    }
    /**
     * Determine the route after a user has authenticated
     */
    redirect() {
        const auth = this.getAuthDetails();
        let url = '';
        // First check if the redirect url was set. This is for if you want to over-ride and take priority over other redirects.
        url = GetSiteVar('App.redirect');
        if (url)
            SetSiteVar('App.redirect', '');
        // Check if the site was redirected due to a 401.
        if (!url) {
            url = GetSiteVar('App.redirectAfterLogin');
            if (url)
                SetSiteVar('App.redirectAfterLogin', '');
        }
        if (!auth.email_verified_at) {
            url = window.location.origin + '/user/confirm-email-resend';
        }
        // Check if there is a current business unit for this onSession and a corresponding default page.
        if (!url) {
            // const currentBuId = this.asset.businessId;
            // If their current B.U. is no longer available then make sure the settings are zero'd out.
            if (this.asset.businessId && IsObject(auth.businesses, true) && typeof auth.businesses[this.asset.businessId] === 'undefined') {
                this.setCurrentBusinessId(0);
            }
            else if (this.asset.businessId && IsObject(auth.businesses, true) && typeof auth.businesses[this.asset.businessId] !== 'undefined') {
                if (auth.businesses[this.asset.businessId].homepage) {
                    const business = auth.businesses[this.asset.businessId];
                    url = window.location.origin + business.homepage;
                }
                else {
                    if (isDevMode()) {
                        url = window.location.origin + '/';
                    }
                    else {
                        url = window.location.origin + '/home';
                    }
                }
            }
        }
        // Check if there is a home page set for the default business unit.
        if (!url) {
            if (IsObject(auth.businesses, true)) {
                if (auth.business_fk && typeof auth.businesses[auth.business_fk] !== 'undefined') {
                    if (auth.businesses[auth.business_fk].homepage) {
                        url = window.location.origin + auth.businesses[auth.business_fk].homepage;
                    }
                    else {
                        if (isDevMode()) {
                            url = window.location.origin + '/' + (IsString(PopHref, true) ? PopHref : '');
                        }
                        else {
                            url = window.location.origin + '/home';
                        }
                    }
                }
            }
        }
        if (url) {
            window.location.href = url;
        }
        else {
            // If still no url then redirect to the users profile page.
            if (isDevMode()) {
                window.location.href = window.location.origin + '/';
            }
            else {
                window.location.href = window.location.origin + '/home';
            }
        }
    }
    ngOnDestroy() {
        super.ngOnDestroy();
    }
}
PopBaseService.ɵprov = i0.ɵɵdefineInjectable({ factory: function PopBaseService_Factory() { return new PopBaseService(); }, token: PopBaseService, providedIn: "root" });
PopBaseService.decorators = [
    { type: Injectable, args: [{
                providedIn: 'root'
            },] }
];
PopBaseService.ctorParameters = () => [];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWJhc2Uuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9zZXJ2aWNlcy9wb3AtYmFzZS5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBQyxVQUFVLEVBQUUsU0FBUyxFQUFZLE1BQU0sZUFBZSxDQUFDO0FBQy9ELE9BQU8sRUFBUyxXQUFXLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQzdFLE9BQU8sRUFBQyxVQUFVLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxpQkFBaUIsRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDbkgsT0FBTyxFQUFtQyxjQUFjLEVBQW1CLE1BQU0sMkJBQTJCLENBQUM7QUFDN0csT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sc0JBQXNCLENBQUM7O0FBTXRELE1BQU0sT0FBTyxjQUFlLFNBQVEsZ0JBQWdCO0lBWWxEO1FBQ0UsS0FBSyxFQUFFLENBQUM7UUFaSCxTQUFJLEdBQUcsZ0JBQWdCLENBQUM7UUFFckIsVUFBSyxHQUFHO1lBQ2hCLFdBQVcsRUFBRSxVQUFVO1lBQ3ZCLFVBQVUsRUFBRSxDQUFDO1lBQ2IsUUFBUSxFQUFVLFNBQVM7U0FDNUIsQ0FBQztRQU9BLE1BQU0sV0FBVyxHQUFHLGNBQWMsRUFBRSxDQUFDO1FBQ3JDLElBQUksQ0FBQyxJQUFJLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQztRQUM3QixJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxXQUFXLENBQUMsVUFBVSxDQUFDO1FBQy9DLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUM7UUFHdkMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFO1lBQzFCLE1BQU0sY0FBYyxHQUFH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QUU7d0JBQzlDLEdBQUcsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxRQUFRLENBQUM7cUJBQzNFO3lCQUFNO3dCQUNMLElBQUksU0FBUyxFQUFFLEVBQUU7NEJBQ2YsR0FBRyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7eUJBQy9FOzZCQUFNOzRCQUNMLEdBQUcsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUM7eUJBQ3hDO3FCQUVGO2lCQUNGO2FBQ0Y7U0FDRjtRQUdELElBQUksR0FBRyxFQUFFO1lBQ1AsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDO1NBQzVCO2FBQU07WUFDTCwyREFBMkQ7WUFDM0QsSUFBSSxTQUFTLEVBQUUsRUFBRTtnQkFDZixNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUM7YUFDckQ7aUJBQU07Z0JBQ0wsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDO2FBQ3pEO1NBQ0Y7SUFDSCxDQUFDO0lBR0QsV0FBVztRQUNULEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN0QixDQUFDOzs7O1lBallGLFVBQVUsU0FBQztnQkFDVixVQUFVLEVBQUUsTUFBTTthQUNuQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZSwgaXNEZXZNb2RlLCBPbkRlc3Ryb3l9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtLZXlNYXAsIFBvcEJ1c2luZXNzLCBQb3BIcmVmLCBTZXRQb3BBdXRofSBmcm9tICcuLi9wb3AtY29tbW9uLm1vZGVsJztcbmltcG9ydCB7R2V0U2l0ZVZhciwgSXNPYmplY3QsIElzU3RyaW5nLCBTZXRTZXNzaW9uU2l0ZVZhciwgU2V0U2l0ZVZhciwgU3RvcmFnZUdldHRlcn0gZnJvbSAnLi4vcG9wLWNvbW1vbi11dGlsaXR5JztcbmltcG9ydCB7QXV0aFVzZXIsIEJ1c2luZXNzLCBCdXNpbmVzc1VzZXIsIEdldEF1dGhTdG9yYWdlLCBBdXRoRGV0YWlscywgQXBwfSBmcm9tICcuLi9wb3AtY29tbW9uLXRva2VuLm1vZGVsJztcbmltcG9ydCB7UG9wRXh0ZW5kU2VydmljZX0gZnJvbSAnLi9wb3AtZXh0ZW5kLnNlcnZpY2UnO1xuXG5cbkBJbmplY3RhYmxlKHtcbiAgcHJvdmlkZWRJbjogJ3Jvb3QnXG59KVxuZXhwb3J0IGNsYXNzIFBvcEJhc2VTZXJ2aWNlIGV4dGVuZHMgUG9wRXh0ZW5kU2VydmljZSBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gIHB1YmxpYyBuYW1lID0gJ1BvcEJhc2VTZXJ2aWNlJztcblxuICBwcm90ZWN0ZWQgYXNzZXQgPSB7XG4gICAgc2Vzc2lvblJvb3Q6ICdTaXRlVmFycycsXG4gICAgYnVzaW5lc3NJZDogMCxcbiAgICBhdXRoVGltZTogPG51bWJlcj51bmRlZmluZWQsXG4gIH07XG5cbiAgcHJpdmF0ZSBhdXRoOiBBdXRoRGV0YWlscztcblxuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gICAgY29uc3QgYXV0aFN0b3JhZ2UgPSBHZXRBdXRoU3RvcmFnZSgpO1xuICAgIHRoaXMuYXV0aCA9IGF1dGhTdG9yYWdlLmF1dGg7XG4gICAgdGhpcy5hc3NldC5idXNpbmVzc0lkID0gYXV0aFN0b3JhZ2UuYnVzaW5lc3NJZDtcbiAgICB0aGlzLmFzc2V0LmF1dGhUaW1lID0gYXV0aFN0b3JhZ2UudGltZTtcblxuXG4gICAgaWYgKCF0aGlzLmFzc2V0LmJ1c2luZXNzSWQpIHtcbiAgICAgIGNvbnN0IGxhc3RCdXNpbmVzc0lkID0gcGFyc2VJbnQoR2V0U2l0ZVZhcignQnVzaW5lc3MubGFzdCcpIHx8ICcwJywgMTApO1xuICAgICAgaWYgKGxhc3RCdXNpbmVzc0lkKSB7XG4gICAgICAgIHRoaXMuc2V0Q3VycmVudEJ1c2luZXNzSWQobGFzdEJ1c2luZXNzSWQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBMb2NhbCBTdG9yYWdlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG5cbiAgLyoqXG4gICAqIENsZWFyIGxvY2FsU3RvcmFnZSBkYXRhXG4gICAqL1xuICBwdWJsaWMgY2xlYXJMb2NhbFN0b3JhZ2UoKTogdm9pZCB7XG4gICAgbG9jYWxTdG9yYWdlLmNsZWFyKCk7XG4gICAgdGhpcy5hdXRoID0gbnVsbDtcbiAgICB0aGlzLmFzc2V0LmF1dGhUaW1lID0gMDtcbiAgICB0aGlzLmFzc2V0LmJ1c2luZXNzSWQgPSAwO1xuICB9XG5cblxuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEF1dGggRGV0YWlscyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cblxuICAvKipcbiAgICogUmVtb3ZlIGFueSB1c2VyIGF1dGggcmVsaWNzXG4gICAqL1xuICBwdWJsaWMgY2xlYXJBdXRoRGV0YWlscyhjYWxsZXI6IHN0cmluZyk6IHZvaWQge1xuICAgIFNldFNlc3Npb25TaXRlVmFyKCdMb2dpbi50aW1lJywgMCk7XG4gICAgdGhpcy5jbGVhckxvY2FsU3RvcmFnZSgpO1xuICAgIHNlc3Npb25TdG9yYWdlLmNsZWFyKCk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBDbGVhciB0aGUgdGltZSB3aGVuIGFuIGF1dGggd2FzIGxhc3QgY29tcGxldGVkXG4gICAqL1xuICBwdWJsaWMgY2xlYXJBdXRoVGltZSgpOiB2b2lkIHtcbiAgICB0aGlzLmFzc2V0LmF1dGhUaW1lID0gMDtcbiAgICBTZXRTaXRlVmFyKCdBdXRoLnRpbWUnLCAwKTtcbiAgICAvLyBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnQXV0aC1UaW1lJywgJzAnKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFJldHVybiB0aGUgZW50aXJlIEF1dGggT2JqZWN0XG4gICAqL1xuICBwdWJsaWMgZ2V0QXV0aERldGFpbHMoKTogQXV0aERldGFpbHMge1xuICAgIGlmICghSXNPYmplY3QodGhpcy5hdXRoLCB0cnVlKSkge1xuICAgICAgY29uc3QgYXV0aFN0b3JhZ2UgPSBHZXRBdXRoU3RvcmFnZSgpO1xuICAgICAgdGhpcy5hdXRoID0gYXV0aFN0b3JhZ2UuYXV0aDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuYXV0aDtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEV4dHJhY3QgdGhlIHByaW1lIHVzZXIvIHJvb3Qgb3V0IG9mIHRoZSBhdXRoIGRldGFpbHNcbiAgICovXG4gIHB1YmxpYyBnZXRBdXRoUHJpbWVVc2VyKCk6IEF1dGhVc2VyIHtcbiAgICBpZiAoSXNPYmplY3QodGhpcy5hdXRoLCBbJ2lkJywgJ2VtYWlsJ10pKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBpZDogdGhpcy5hdXRoLmlkLFxuICAgICAgICBuYW1lOiB0aGlzLmF1dGgubmFtZSxcbiAgICAgICAgZmlyc3RfbmFtZTogdGhpcy5hdXRoLmZpcnN0X25hbWUsXG4gICAgICAgIGxhc3RfbmFtZTogdGhpcy5hdXRoLmxhc3RfbmFtZSxcbiAgICAgICAgaW5pdGlhbHM6IHRoaXMuYXV0aC5pbml0aWFscyxcbiAgICAgICAgYXZhdGFyTGluazogU3RvcmFnZUdldHRlcih0aGlzLmF1dGgsIFsncHJvZmlsZScsICdhdmF0YXJfbGluayddLCBudWxsKSxcbiAgICAgICAgZW1haWw6IHRoaXMuYXV0aC5lbWFpbCxcbiAgICAgICAgYnVzaW5lc3NfZms6IHRoaXMuYXV0aC5idXNpbmVzc19mayxcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cblxuICAvKipcbiAgICogUmV0dXJuIHRoZSB0aW1lIHdoZW4gdGhlIGxhc3QgYXV0aGVudGljYXRpb24gdG9vayBwbGFjZVxuICAgKi9cbiAgcHVibGljIGdldEF1dGhUaW1lKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuYXNzZXQuYXV0aFRpbWU7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBCZWFyZXIgdG9rZW4gaGVscGVyXG4gICAqIFRoZSBhcGkgd2lsbCBleHBlY3QgYW4gYXV0aCB0b2tlbiBmb3IgYW55IGF1dGhlbnRpY2F0ZWQgcm91dGVzXG4gICAqL1xuICBwdWJsaWMgZ2V0QmVhcmVyVG9rZW4oKTogc3RyaW5nIHtcbiAgICBpZiAoSXNPYmplY3QodGhpcy5hdXRoLCBbJ3Rva2VuJ10pKSB7XG4gICAgICByZXR1cm4gJ0JlYXJlciAnICsgKHRoaXMuYXV0aC50b2tlbiA/IHRoaXMuYXV0aC50b2tlbiA6ICcxMjMnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIEdldCBhbGwgdGhlIEJ1c2luZXNzIFVzZXJzIHRoYXQgYmVsb25nIHRvIHRoZSBhdXRoIHVzZXJcbiAgICovXG4gIHB1YmxpYyBnZXRBdXRoVXNlcnMoKTogS2V5TWFwPEJ1c2luZXNzVXNlcj4ge1xuICAgIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMuYXV0aC51c2VycykpO1xuICB9XG5cblxuICAvKipcbiAgICogR2V0IHRoZSBjdXJyZW50IGJ1c2luZXNzIGlkIHRoYXQgaXMgaW4gdXNlclxuICAgKi9cbiAgcHVibGljIGdldEN1cnJlbnRCdXNpbmVzc0lkKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuYXNzZXQuYnVzaW5lc3NJZDtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFJldHVybiB0aGUgYnVzaW5lc3MgZGV0YWlscyBmb3IgdGhlIGN1cnJlbnQgYnVzaW5lc3NcbiAgICovXG4gIHB1YmxpYyBnZXRDdXJyZW50QnVzaW5lc3NVc2VySWQoKTogbnVtYmVyIHtcbiAgICBjb25zdCBidXNpbmVzc0lkID0gdGhpcy5nZXRDdXJyZW50QnVzaW5lc3NJZCgpO1xuICAgIGlmIChJc09iamVjdCh0aGlzLmF1dGgudXNlcnMsIHRydWUpICYmIGJ1c2luZXNzSWQgaW4gdGhpcy5hdXRoLnVzZXJzKSB7XG4gICAgICByZXR1cm4gdGhpcy5hdXRoLnVzZXJzW2J1c2luZXNzSWRdLmlkO1xuICAgIH1cbiAgICByZXR1cm4gMDtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIERldGVybWluZSBpZiB0aGUgbGFzdCBhdXRoIGhhcyBleHBpcmVkXG4gICAqL1xuICBwdWJsaWMgaXNBdXRoRXhwaXJlZCgpOiBib29sZWFuIHtcbiAgICBsZXQgZXhwaXJlZCA9IGZhbHNlO1xuXG4gICAgaWYgKCEoSXNPYmplY3QodGhpcy5hdXRoLCBbJ3Rva2VuJ10pKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgY29uc3QgY3VycmVudFRpbWUgPSBNYXRoLnJvdW5kKG5ldyBEYXRlKCkuZ2V0VGltZSgpIC8gMTAwMCk7XG4gICAgaWYgKCF0aGlzLmFzc2V0LmF1dGhUaW1lIHx8IHR5cGVvZiB0aGlzLmF1dGguY3JlYXRlZF9hdCA9PSAndW5kZWZpbmVkJyB8fCAhdGhpcy5nZXRCZWFyZXJUb2tlbigpKSB7XG4gICAgICBleHBpcmVkID0gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKGN1cnJlbnRUaW1lID4gKCgrdGhpcy5hdXRoLmNyZWF0ZWRfYXQpICsgKHRoaXMuYXV0aC5tYXhfdHRsICogNjApKSkgeyAvLyBDaGVjayBpZiB0b2tlbiBpcyBwYXNzZWQgbWF4X3R0bFxuICAgICAgZXhwaXJlZCA9IHRydWU7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKGN1cnJlbnRUaW1lID4gKHRoaXMuYXNzZXQuYXV0aFRpbWUgKyAodGhpcy5hdXRoLm1heF90dGwgKiA2MCkpKSB7Ly8gQ2hlY2sgaWYgdG9rZW4gaGFzIHRpbWVkIG91dC5cbiAgICAgIGV4cGlyZWQgPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZXhwaXJlZDtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFN0b3JlcyBhIHRpbWVzdGFtcCB0byB0cmFjayB3aGVuIHRoZSBsYXN0IGF1dGhlbnRpY2F0aW9uIHRvb2sgcGxhY2VcbiAgICovXG4gIHB1YmxpYyBzZXRBdXRoVGltZSgpOiB2b2lkIHtcbiAgICAvLyBUaGlzIGdldHMgc2V0IHdoZW4gdGhlcmUgaXMgYSBuZXcgdG9rZW4uIEl0IHdpbGwgY2FsY3VsYXRlIHRoaXMgYW5kIHRoZSB0b2tlbmRldGFpbHMgVFRMIC8gdGltZW91dCB0byBkZWNpZGUgaWYgdGhlIHRva2VuXG4gICAgLy8gaXMgZXhwaXJlZCB3aXRob3V0IGhhdmluZyB0byBtYWtlIGFuIGFqYXggY2FsbCB0byBrbm93LlxuICAgIHRoaXMuYXNzZXQuYXV0aFRpbWUgPSBNYXRoLnJvdW5kKG5ldyBEYXRlKCkuZ2V0VGltZSgpIC8gMTAwMCk7XG4gICAgLy8gbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ0F1dGgtVGltZScsIHRoaXMuYXNzZXQuYXV0aFRpbWUudG9TdHJpbmcoKSk7XG4gICAgU2V0U2l0ZVZhcignQXV0aC50aW1lJywgdGhpcy5hc3NldC5hdXRoVGltZS50b1N0cmluZygpKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEV4cG9zZXMgdGhlIEF1dGggVG9rZW4gYXQgdGhlIHJvb3QgbGV2ZWwgb2YgbG9jYWxTdG9yYWdlIGZvciBjb252ZW5pZW5jZVxuICAgKiBAcGFyYW0gdG9rZW5cbiAgICovXG4gIHB1YmxpYyBzZXRBdXRoVG9rZW4oYXV0aFRva2VuOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAvLyBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnQXV0aC1Ub2tlbicsIGF1dGhUb2tlbik7XG4gICAgU2V0U2l0ZVZhcignQXV0aC50b2tlbicsIGF1dGhUb2tlbik7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBTdG9yZSB0aGUgYXV0aCBvYmplY3QgdGhhdCB0aGUgYXV0aC91c2VyIGxvZ2luIHJvdXRlIHJldHVybiB0byB0aGUgYXBwXG4gICAqIEBwYXJhbSBhdXRoRGV0YWlsc1xuICAgKi9cbiAgcHVibGljIHNldEF1dGhEZXRhaWxzKGF1dGg6IEF1dGhEZXRhaWxzKTogdm9pZCB7XG4gICAgaWYgKElzT2JqZWN0KGF1dGgsIFsnaWQnLCAndG9rZW4nXSkpIHtcbiAgICAgIGNvbnN0IGV4aXN0aW5nQXV0aERldGFpbHNEZXRhaWxzID0gdGhpcy5hdXRoO1xuICAgICAgaWYgKGV4aXN0aW5nQXV0aERldGFpbHNEZXRhaWxzICYmICtleGlzdGluZ0F1dGhEZXRhaWxzRGV0YWlscy5pZCAmJiArZXhpc3RpbmdBdXRoRGV0YWlsc0RldGFpbHMuaWQgIT09ICthdXRoLmlkKSB7XG4gICAgICAgIC8vIHRoaXMuY2xlYXJBdXRoRGV0YWlscygnc2V0QXV0aERldGFpbHMnKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuYXV0aCA9IGF1dGg7XG4gICAgICB0aGlzLnNldEF1dGhUb2tlbih0aGlzLmF1dGgudG9rZW4pO1xuICAgICAgdGhpcy5zZXRBdXRoUG9wY3hUb2tlbih0aGlzLmF1dGgueF9wb3BjeF90b2tlbik7XG4gICAgICB0aGlzLnNldEF1dGhUaW1lKCk7XG4gICAgICBTZXRQb3BBdXRoKHtcbiAgICAgICAgaWQ6IGF1dGguaWQsXG4gICAgICAgIG5hbWU6IGF1dGgubmFtZSxcbiAgICAgICAgZmlyc3RfbmFtZTogYXV0aC5maXJzdF9uYW1lLFxuICAgICAgICBsYXN0X25hbWU6IGF1dGgubGFzdF9uYW1lLFxuICAgICAgICBpbml0aWFsczogYXV0aC5pbml0aWFscyxcbiAgICAgICAgZW1haWw6IGF1dGguZW1haWwsXG4gICAgICAgIGVtYWlsX3ZlcmlmaWVkX2F0OiBhdXRoLmVtYWlsX3ZlcmlmaWVkX2F0LFxuICAgICAgICBhdmF0YXJMaW5rOiBTdG9yYWdlR2V0dGVyKHRoaXMuYXV0aCwgWydwcm9maWxlJywgJ2F2YXRhcl9saW5rJ10sIG51bGwpLFxuICAgICAgICB1c2VybmFtZTogYXV0aC51c2VybmFtZSxcbiAgICAgICAgY3JlYXRlZF9hdDogYXV0aC5jcmVhdGVkX2F0XG4gICAgICB9KTtcbiAgICAgIFNldFNpdGVWYXIoJ0F1dGguZGV0YWlscycsIGF1dGgpO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIEV4cG9zZXMgdGhlIEF1dGggVXNlciBhdCB0aGUgcm9vdCBsZXZlbCBvZiBsb2NhbFN0b3JhZ2UgZm9yIGNvbnZlbmllbmNlXG4gICAqIEBwYXJhbSB0b2tlblxuICAgKi9cbiAgcHVibGljIHNldEF1dGhVc2VyKHByaW1lVXNlcik6IHZvaWQge1xuICAgIGlmIChJc09iamVjdChwcmltZVVzZXIsIHRydWUpKSB7XG4gICAgICBTZXRTaXRlVmFyKCdBdXRoLlVzZXInLCBwcmltZVVzZXIpO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIEV4cG9zZXMgdGhlIEF1dGggUG9wY3ggVG9rZW4gYXQgdGhlIHJvb3QgbGV2ZWwgb2YgbG9jYWxTdG9yYWdlIGZvciBjb252ZW5pZW5jZVxuICAgKiBAcGFyYW0gdG9rZW5cbiAgICovXG4gIHB1YmxpYyBzZXRBdXRoUG9wY3hUb2tlbih0b2tlbjogc3RyaW5nKTogdm9pZCB7XG4gICAgLy8gbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ0F1dGgtUG9wY3gtVG9rZW4nLCB0b2tlbik7XG4gICAgU2V0U2l0ZVZhcignQXV0aC5wb3BjeC10b2tlbicsIHRva2VuKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRyYWNrIHRoZSBjdXJyZW50IGJ1c2luZXNzIHRoYXQgaGFzIGJlZW4gc2VsZWN0ZWRcbiAgICogQHBhcmFtIGlkXG4gICAqL1xuICBwdWJsaWMgc2V0Q3VycmVudEJ1c2luZXNzSWQoaWQ6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuYXNzZXQuYnVzaW5lc3NJZCA9IGlkO1xuICAgIFNldFNlc3Npb25TaXRlVmFyKCdCdXNpbmVzcy5jdXJyZW50JywgaWQpO1xuICAgIFNldFNpdGVWYXIoJ0J1c2luZXNzLmxhc3QnLCBpZCk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBHZXQgYWxsIHRoZSBCdXNpbmVzc2VzIHRoYXQgdGhlIGF1dGggdXNlciBoYXMgYWNjZXNzIHRvXG4gICAqL1xuICBwdWJsaWMgZ2V0QXV0aEJ1c2luZXNzZXMoKTogS2V5TWFwPEJ1c2luZXNzPiB7XG4gICAgcmV0dXJuIElzT2JqZWN0KHRoaXMuYXV0aCwgWyd0b2tlbiddKSAmJiBJc09iamVjdCh0aGlzLmF1dGguYnVzaW5lc3NlcykgPyBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMuYXV0aC5idXNpbmVzc2VzKSkgOiBudWxsO1xuICB9XG5cblxuICAvKipcbiAgICogU3dpdGNoIHRvIGEgZGlmZmVyZW50IGJ1c2luZXNzXG4gICAqIEBwYXJhbSBpZFxuICAgKi9cbiAgcHVibGljIHN3aXRjaEJ1c2luZXNzKGlkKSB7XG4gICAgdGhpcy5zZXRDdXJyZW50QnVzaW5lc3NJZChpZCk7XG4gICAgdGhpcy5yZWRpcmVjdCgpO1xuICB9XG5cblxuICAvKipcbiAgICogQ2hhbmdlIHRvIGEgZGlmZmVyZW50IGFwcCB3aXRoIHRoZSBjdXJyZW50IGJ1c2luZXNzXG4gICAqIEBwYXJhbSBhcHBQYXRoXG4gICAqL1xuICBwdWJsaWMgc3dpdGNoQXBwcyhhcHBQYXRoOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4gKyBhcHBQYXRoO1xuICB9XG5cbiAgLyoqXG4gICAqIENoYW5nZSB0byBhIGRpZmZlcmVudCBhcHAgd2l0aCB0aGUgY3VycmVudCBidXNpbmVzc1xuICAgKiBAcGFyYW0gYXBwUGF0aFxuICAgKi9cbiAgcHVibGljIGNoZWNrQXBwQWNjZXNzKGFwcE5hbWU6IHN0cmluZywgcmVkaXJlY3Q6IGJvb2xlYW4gPSBmYWxzZSk6IGJvb2xlYW4ge1xuICAgIGlmIChJc09iamVjdChQb3BCdXNpbmVzcywgWydpZCcsICdhcHBzJ10pICYmIElzT2JqZWN0KFBvcEJ1c2luZXNzLmFwcHMsIHRydWUpKSB7XG4gICAgICBpZiAoSXNTdHJpbmcoYXBwTmFtZSwgdHJ1ZSkgJiYgYXBwTmFtZSBpbiBQb3BCdXNpbmVzcy5hcHBzKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAocmVkaXJlY3QgJiYgIWlzRGV2TW9kZSgpKSB7XG4gICAgICBpZihJc1N0cmluZyhQb3BIcmVmKSAmJiBQb3BIcmVmICE9PSAnaG9tZScgKSB3aW5kb3cubG9jYXRpb24uaHJlZiA9IHdpbmRvdy5sb2NhdGlvbi5wcm90b2NvbCArICcvLycgKyB3aW5kb3cubG9jYXRpb24uaG9zdCArICcvaG9tZSc7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIERldGVybWluZSB0aGUgcm91dGUgYWZ0ZXIgYSB1c2VyIGhhcyBhdXRoZW50aWNhdGVkXG4gICAqL1xuICBwdWJsaWMgcmVkaXJlY3QoKTogdm9pZCB7XG4gICAgY29uc3QgYXV0aCA9IHRoaXMuZ2V0QXV0aERldGFpbHMoKTtcbiAgICBsZXQgdXJsID0gJyc7XG5cbiAgICAvLyBGaXJzdCBjaGVjayBpZiB0aGUgcmVkaXJlY3QgdXJsIHdhcyBzZXQuIFRoaXMgaXMgZm9yIGlmIHlvdSB3YW50IHRvIG92ZXItcmlkZSBhbmQgdGFrZSBwcmlvcml0eSBvdmVyIG90aGVyIHJlZGlyZWN0cy5cbiAgICB1cmwgPSBHZXRTaXRlVmFyKCdBcHAucmVkaXJlY3QnKTtcbiAgICBpZiAodXJsKSBTZXRTaXRlVmFyKCdBcHAucmVkaXJlY3QnLCAnJyk7XG5cbiAgICAvLyBDaGVjayBpZiB0aGUgc2l0ZSB3YXMgcmVkaXJlY3RlZCBkdWUgdG8gYSA0MDEuXG4gICAgaWYgKCF1cmwpIHtcbiAgICAgIHVybCA9IEdldFNpdGVWYXIoJ0FwcC5yZWRpcmVjdEFmdGVyTG9naW4nKTtcbiAgICAgIGlmICh1cmwpIFNldFNpdGVWYXIoJ0FwcC5yZWRpcmVjdEFmdGVyTG9naW4nLCAnJyk7XG4gICAgfVxuXG4gICAgaWYgKCFhdXRoLmVtYWlsX3ZlcmlmaWVkX2F0KSB7XG4gICAgICB1cmwgPSB3aW5kb3cubG9jYXRpb24ub3JpZ2luICsgJy91c2VyL2NvbmZpcm0tZW1haWwtcmVzZW5kJztcbiAgICB9XG5cbiAgICAvLyBDaGVjayBpZiB0aGVyZSBpcyBhIGN1cnJlbnQgYnVzaW5lc3MgdW5pdCBmb3IgdGhpcyBvblNlc3Npb24gYW5kIGEgY29ycmVzcG9uZGluZyBkZWZhdWx0IHBhZ2UuXG4gICAgaWYgKCF1cmwpIHtcbiAgICAgIC8vIGNvbnN0IGN1cnJlbnRCdUlkID0gdGhpcy5hc3NldC5idXNpbmVzc0lkO1xuICAgICAgLy8gSWYgdGhlaXIgY3VycmVudCBCLlUuIGlzIG5vIGxvbmdlciBhdmFpbGFibGUgdGhlbiBtYWtlIHN1cmUgdGhlIHNldHRpbmdzIGFyZSB6ZXJvJ2Qgb3V0LlxuICAgICAgaWYgKHRoaXMuYXNzZXQuYnVzaW5lc3NJZCAmJiBJc09iamVjdChhdXRoLmJ1c2luZXNzZXMsIHRydWUpICYmIHR5cGVvZiBhdXRoLmJ1c2luZXNzZXNbdGhpcy5hc3NldC5idXNpbmVzc0lkXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgdGhpcy5zZXRDdXJyZW50QnVzaW5lc3NJZCgwKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5hc3NldC5idXNpbmVzc0lkICYmIElzT2JqZWN0KGF1dGguYnVzaW5lc3NlcywgdHJ1ZSkgJiYgdHlwZW9mIGF1dGguYnVzaW5lc3Nlc1t0aGlzLmFzc2V0LmJ1c2luZXNzSWRdICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBpZiAoYXV0aC5idXNpbmVzc2VzW3RoaXMuYXNzZXQuYnVzaW5lc3NJZF0uaG9tZXBhZ2UpIHtcbiAgICAgICAgICBjb25zdCBidXNpbmVzcyA9IGF1dGguYnVzaW5lc3Nlc1t0aGlzLmFzc2V0LmJ1c2luZXNzSWRdO1xuICAgICAgICAgIHVybCA9IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4gKyBidXNpbmVzcy5ob21lcGFnZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoaXNEZXZNb2RlKCkpIHtcbiAgICAgICAgICAgIHVybCA9IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4gKyAnLyc7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHVybCA9IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4gKyAnL2hvbWUnO1xuICAgICAgICAgIH1cblxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgaWYgdGhlcmUgaXMgYSBob21lIHBhZ2Ugc2V0IGZvciB0aGUgZGVmYXVsdCBidXNpbmVzcyB1bml0LlxuICAgIGlmICghdXJsKSB7XG4gICAgICBpZiAoSXNPYmplY3QoYXV0aC5idXNpbmVzc2VzLCB0cnVlKSkge1xuICAgICAgICBpZiAoYXV0aC5idXNpbmVzc19mayAmJiB0eXBlb2YgYXV0aC5idXNpbmVzc2VzW2F1dGguYnVzaW5lc3NfZmtdICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIGlmIChhdXRoLmJ1c2luZXNzZXNbYXV0aC5idXNpbmVzc19ma10uaG9tZXBhZ2UpIHtcbiAgICAgICAgICAgIHVybCA9IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4gKyBhdXRoLmJ1c2luZXNzZXNbYXV0aC5idXNpbmVzc19ma10uaG9tZXBhZ2U7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChpc0Rldk1vZGUoKSkge1xuICAgICAgICAgICAgICB1cmwgPSB3aW5kb3cubG9jYXRpb24ub3JpZ2luICsgJy8nICsgKElzU3RyaW5nKFBvcEhyZWYsIHRydWUpID8gUG9wSHJlZiA6ICcnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHVybCA9IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4gKyAnL2hvbWUnO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG5cbiAgICBpZiAodXJsKSB7XG4gICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IHVybDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSWYgc3RpbGwgbm8gdXJsIHRoZW4gcmVkaXJlY3QgdG8gdGhlIHVzZXJzIHByb2ZpbGUgcGFnZS5cbiAgICAgIGlmIChpc0Rldk1vZGUoKSkge1xuICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4gKyAnLyc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4gKyAnL2hvbWUnO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgc3VwZXIubmdPbkRlc3Ryb3koKTtcbiAgfVxuXG5cbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBVbmRlciBUaGUgSG9vZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIFByaXZhdGUgTWV0aG9kICkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cblxufVxuXG4iXX0=