import {Injectable, isDevMode, OnDestroy} from '@angular/core';
import {KeyMap, PopBusiness, PopHref, SetPopAuth} from '../pop-common.model';
import {GetSiteVar, IsObject, IsString, SetSessionSiteVar, SetSiteVar, StorageGetter} from '../pop-common-utility';
import {AuthUser, Business, BusinessUser, GetAuthStorage, AuthDetails, App} from '../pop-common-token.model';
import {PopExtendService} from './pop-extend.service';


@Injectable({
  providedIn: 'root'
})
export class PopBaseService extends PopExtendService implements OnDestroy {
  public name = 'PopBaseService';

  protected asset = {
    sessionRoot: 'SiteVars',
    businessId: 0,
    authTime: <number>undefined,
  };

  private auth: AuthDetails;


  constructor() {
    super();
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
  public clearLocalStorage(): void {
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
  public clearAuthDetails(caller: string): void {
    SetSessionSiteVar('Login.time', 0);
    this.clearLocalStorage();
    sessionStorage.clear();
  }


  /**
   * Clear the time when an auth was last completed
   */
  public clearAuthTime(): void {
    this.asset.authTime = 0;
    SetSiteVar('Auth.time', 0);
    // localStorage.setItem('Auth-Time', '0');
  }


  /**
   * Return the entire Auth Object
   */
  public getAuthDetails(): AuthDetails {
    if (!IsObject(this.auth, true)) {
      const authStorage = GetAuthStorage();
      this.auth = authStorage.auth;
    }
    return this.auth;
  }


  /**
   * Extract the prime user/ root out of the auth details
   */
  public getAuthPrimeUser(): AuthUser {
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
  public getAuthTime(): number {
    return this.asset.authTime;
  }


  /**
   * Bearer token helper
   * The api will expect an auth token for any authenticated routes
   */
  public getBearerToken(): string {
    if (IsObject(this.auth, ['token'])) {
      return 'Bearer ' + (this.auth.token ? this.auth.token : '123');
    } else {
      return '';
    }
  }


  /**
   * Get all the Business Users that belong to the auth user
   */
  public getAuthUsers(): KeyMap<BusinessUser> {
    return JSON.parse(JSON.stringify(this.auth.users));
  }


  /**
   * Get the current business id that is in user
   */
  public getCurrentBusinessId(): number {
    return this.asset.businessId;
  }


  /**
   * Return the business details for the current business
   */
  public getCurrentBusinessUserId(): number {
    const businessId = this.getCurrentBusinessId();
    if (IsObject(this.auth.users, true) && businessId in this.auth.users) {
      return this.auth.users[businessId].id;
    }
    return 0;
  }


  /**
   * Determine if the last auth has expired
   */
  public isAuthExpired(): boolean {
    let expired = false;

    if (!(IsObject(this.auth, ['token']))) {
      return true;
    }

    const currentTime = Math.round(new Date().getTime() / 1000);
    if (!this.asset.authTime || typeof this.auth.created_at == 'undefined' || !this.getBearerToken()) {
      expired = true;
    } else if (currentTime > ((+this.auth.created_at) + (this.auth.max_ttl * 60))) { // Check if token is passed max_ttl
      expired = true;
      return true;
    } else if (currentTime > (this.asset.authTime + (this.auth.max_ttl * 60))) {// Check if token has timed out.
      expired = true;
    }
    return expired;
  }


  /**
   * Stores a timestamp to track when the last authentication took place
   */
  public setAuthTime(): void {
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
  public setAuthToken(authToken: string): void {
    // localStorage.setItem('Auth-Token', authToken);
    SetSiteVar('Auth.token', authToken);
  }


  /**
   * Store the auth object that the auth/user login route return to the app
   * @param authDetails
   */
  public setAuthDetails(auth: AuthDetails): void {
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
  public setAuthUser(primeUser): void {
    if (IsObject(primeUser, true)) {
      SetSiteVar('Auth.User', primeUser);
    }
  }


  /**
   * Exposes the Auth Popcx Token at the root level of localStorage for convenience
   * @param token
   */
  public setAuthPopcxToken(token: string): void {
    // localStorage.setItem('Auth-Popcx-Token', token);
    SetSiteVar('Auth.popcx-token', token);
  }


  /**
   * Track the current business that has been selected
   * @param id
   */
  public setCurrentBusinessId(id: number): void {
    this.asset.businessId = id;
    SetSessionSiteVar('Business.current', id);
    SetSiteVar('Business.last', id);
  }


  /**
   * Get all the Businesses that the auth user has access to
   */
  public getAuthBusinesses(): KeyMap<Business> {
    return IsObject(this.auth, ['token']) && IsObject(this.auth.businesses) ? JSON.parse(JSON.stringify(this.auth.businesses)) : null;
  }


  /**
   * Switch to a different business
   * @param id
   */
  public switchBusiness(id) {
    this.setCurrentBusinessId(id);
    this.redirect();
  }


  /**
   * Change to a different app with the current business
   * @param appPath
   */
  public switchApps(appPath: string): void {
    window.location.href = window.location.origin + appPath;
  }

  /**
   * Change to a different app with the current business
   * @param appPath
   */
  public checkAppAccess(appName: string, redirect: boolean = false): boolean {
    if (IsObject(PopBusiness, ['id', 'apps']) && IsObject(PopBusiness.apps, true)) {
      if (IsString(appName, true) && appName in PopBusiness.apps) {
        return true;
      }
    }
    if (redirect && !isDevMode()) {
      if(IsString(PopHref) && PopHref !== 'home' ) window.location.href = window.location.protocol + '//' + window.location.host + '/home';
    }
    return false;
  }


  /**
   * Determine the route after a user has authenticated
   */
  public redirect(): void {
    const auth = this.getAuthDetails();
    let url = '';

    // First check if the redirect url was set. This is for if you want to over-ride and take priority over other redirects.
    url = GetSiteVar('App.redirect');
    if (url) SetSiteVar('App.redirect', '');

    // Check if the site was redirected due to a 401.
    if (!url) {
      url = GetSiteVar('App.redirectAfterLogin');
      if (url) SetSiteVar('App.redirectAfterLogin', '');
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
      } else if (this.asset.businessId && IsObject(auth.businesses, true) && typeof auth.businesses[this.asset.businessId] !== 'undefined') {
        if (auth.businesses[this.asset.businessId].homepage) {
          const business = auth.businesses[this.asset.businessId];
          url = window.location.origin + business.homepage;
        } else {
          if (isDevMode()) {
            url = window.location.origin + '/';
          } else {
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
          } else {
            if (isDevMode()) {
              url = window.location.origin + '/' + (IsString(PopHref, true) ? PopHref : '');
            } else {
              url = window.location.origin + '/home';
            }

          }
        }
      }
    }


    if (url) {
      window.location.href = url;
    } else {
      // If still no url then redirect to the users profile page.
      if (isDevMode()) {
        window.location.href = window.location.origin + '/';
      } else {
        window.location.href = window.location.origin + '/home';
      }
    }
  }


  ngOnDestroy() {
    super.ngOnDestroy();
  }


  /************************************************************************************************
   *                                                                                              *
   *                                      Under The Hood                                          *
   *                                    ( Private Method )                                        *
   *                                                                                              *
   ************************************************************************************************/


}

