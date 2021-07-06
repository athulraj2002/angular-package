import {Inject, Injectable, isDevMode} from '@angular/core';
import {catchError, map} from 'rxjs/operators';

import {PopBaseService} from './pop-base.service';
import {AuthDetails, Business, BusinessUser} from '../pop-common-token.model';
import {forkJoin, of} from 'rxjs';
import {
  ArrayKeyBy,
  GetHttpErrorMsg, GetHttpResult,
  GetStringAbbrv,
  IsArray,
  IsDefined,
  IsObject,
  IsString,
  IsUndefined, SetSessionSiteVar,
  SetSiteVar
} from '../pop-common-utility';
import {HttpBackend, HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {AppGlobalInterface, PopRequest, PopUser, SetPopAuth, SetPopBusiness} from '../pop-common.model';


@Injectable() @Injectable({
  providedIn: 'root'
})
export class PopCredentialService {
  public name = 'PopCredentialService';
  private http: HttpClient;


  private readonly baseUrl;


  constructor(
    private base: PopBaseService,
    private backend: HttpBackend,
    @Inject('APP_GLOBAL') private APP_GLOBAL: AppGlobalInterface,
    @Inject('env') public env?,
  ) {
    if (!this.baseUrl) {
      const envUrl = isDevMode() && this.env && this.env.apiBaseUrl ? this.env.apiBaseUrl : null;
      this.baseUrl = (envUrl ? envUrl : `${window.location.protocol}//api.${window.location.host}`);
    }
    this.http = new HttpClient(this.backend); // bypass the default interceptors
  }


  /**
   * Main login function hit after they click the Login button.
   *
   * @param credentials
   * @returns {Observable<void>}
   */
  authenticate(credentials): Promise<AuthDetails | string> {
    return new Promise<AuthDetails | string>(resolve => {
      this.base.clearAuthDetails(`${this.name}:authenticate`);
      this.http.post(`${this.baseUrl}/auth/login`, credentials).pipe(
        map((auth: any) => {
          auth = auth.data ? auth.data : auth;
          auth = this._transformAuthResponse(auth);
          // this.base.setAuthDetails( auth );
          SetSiteVar('Legacy.remember_me', credentials.remember_me);
          SetSiteVar('Legacy.remembered_username', (credentials.remember_me ? credentials.username : null));
          return auth;
        })
      ).subscribe(async (auth) => {
          auth = await this._attachBusinesses(auth);
          this.base.setAuthDetails(auth);
          SetSessionSiteVar('Login.time', new Date().getTime());
          return resolve(auth);
        },
        (err) => {
          return resolve(GetHttpErrorMsg(err));
        });
    });
  }


  /**
   * Reset login function hit after password reset
   *
   * @param credentials
   * @returns {Observable<void>}
   */

  reset(credentials, businessId: number = 0): Promise<AuthDetails | string> {
    return new Promise<AuthDetails | string>((resolve, reject) => {
      this.base.clearLocalStorage();
      this.http.post(`${this.baseUrl}/auth/password/reset`, credentials).pipe(
        map((auth: any) => {
          auth = auth.data ? auth.data : auth;
          auth = this._transformAuthResponse(auth);
          this.base.setAuthDetails(auth);
          return auth;
        })
      ).subscribe(async (auth) => {
          if (IsObject(auth), ['token', 'id']) {
            auth = auth.data ? <AuthDetails>auth.data : <AuthDetails>auth;
            auth = await this._attachBusinesses(auth, businessId);
            this.base.setAuthDetails(auth);
            return resolve(auth);
          } else {
            return reject(auth);
          }

        },
        err => {
          return resolve(GetHttpErrorMsg(err));
        });
    });
  }


  update(auth: AuthDetails, businessId: number = 0): Promise<AuthDetails | string> {
    return new Promise<AuthDetails | string>(async (resolve) => {
      this.base.clearLocalStorage();
      auth = this._transformAuthResponse(auth);
      auth = await this._attachBusinesses(auth, businessId);
      this.base.setAuthDetails(auth);
      return resolve(auth);
    });
  }


  clear(storage = true) {
    return PopRequest.doPost(`auth/logout`, {}).pipe(
      map((res: any) => {
        res = res.data ? res.data : res;
        if (storage) {
          this.base.clearAuthDetails(`${this.name}:clear`);
        }

        return res;
      })
    );
  }


  clearAll(storage = true) {
    return PopRequest.doPost(`auth/logout`, {logoutAll: true}).pipe(
      map((res: any) => {
        res = res.data ? res.data : res;
        if (storage) {
          SetPopAuth(null);
          SetPopBusiness(null);
          this.base.clearAuthDetails(`${this.name}:clearAll`);
        }
        return res;
      })
    );
  }


  /**
   * Verify the current auth storage
   *
   * @param credentials
   * @returns {Observable<void>}
   */
  verify(businessId: number): Promise<AuthDetails> {
    return new Promise<AuthDetails>(async (resolve) => {
      if (!businessId || this.base.isAuthExpired()) {
        return resolve(null);
      }
      let checkedPermission = false;
      const initRequests = [
        PopRequest.doGet(`/auth/user`).pipe(
          map((auth: any) => {
            auth = auth.data ? auth.data : auth;
            auth = this._transformAuthResponse(auth);
            if (+businessId) {
              let tmp = IsObject(auth.businesses[businessId], true) ? auth.businesses[businessId] : null;
              auth.businesses = {};
              if (tmp) {
                auth.businesses[businessId] = tmp;
              }

              tmp = IsObject(auth.users[businessId], true) ? auth.users[businessId] : null;
              auth.users = {};
              if (tmp) {
                auth.users[businessId] = tmp;
              }
            }
            return auth;
          })
        )
      ];
      if (IsObject(PopUser, ['id']) && this.APP_GLOBAL.isPermissions()) {
        checkedPermission = true;
        initRequests.push(PopRequest.doPatch(`/businesses/${businessId}/users/${PopUser.id}/permissions`, {
          with: ''
        }, 1, true));
      }

      forkJoin(initRequests).subscribe((results) => {
        const auth = <AuthDetails>results[0];
        const existing = <AuthDetails>this.base.getAuthDetails();
        existing.users = {...existing.users, ...auth.users};
        existing.businesses = {...existing.businesses, ...auth.businesses};

        if (checkedPermission) {

          const user = GetHttpResult(results[1]);
          if (businessId in existing.users) {
            existing.users[businessId].permissions = user.permissions;
          }
        }
        if (+businessId) {
          forkJoin([
            PopRequest.doGet(`/businesses/${businessId}`, {with: 'apps'}, 1, false, businessId).pipe(
              catchError(error => of(error)),
              map((res: any) => {
                if (res.data) res = res.data;
                if (IsArray(res)) {
                  return res.pop();
                } else {
                  return res;
                }

              })),
            PopRequest.doGet(`/apps/user/${auth.users[businessId].id}/settings`, {}, 1, false, businessId).pipe(
              catchError(error => of(error)),
              map((res: any) => {
                if (res.data) res = res.data;
                return res;
              })),
          ]).subscribe((data: any) => {
            if (!(IsObject(existing.businesses[businessId], true)) || !(existing.users[businessId])) {
              return resolve(null);
            }

            existing.businesses[businessId] = data[0];
            existing.users[businessId].setting = {};
            if (IsArray(data[1], true)) {
              data[1].map((item) => {
                if (IsObject(item, true)) {
                  existing.users[businessId].setting[item.name] = item.setting.value ? item.setting.value : item.defaultValue;
                }
              });
            }
            // existing.users[businessId] = auth.users[businessId];
            // existing.businesses[businessId] = auth.businesses[businessId];
            this.base.setAuthDetails(existing);
            return resolve(existing);
          }, () => {
            return resolve(existing);
          });
        } else {
          this.base.setAuthDetails(existing);
          return resolve(existing);
        }

      }, () => {
        return resolve(null);
      });
    });
  }


  /************************************************************************************************
   *                                                                                              *
   *                                      Under The Hood                                          *
   *                                    ( Private Method )                                        *
   *                                                                                              *
   ************************************************************************************************/


  private _attachBusinesses(auth: AuthDetails, defaultBusinessId: number = 0): Promise<AuthDetails> {
    return new Promise<AuthDetails>(async (resolve) => {
      const businessIds = Object.keys(auth.users).map((id) => +id);
      if (!defaultBusinessId) defaultBusinessId = +auth.business_fk && businessIds.includes(+auth.business_fk) ? +auth.business_fk : (IsArray(businessIds, true) ? +businessIds[0] : 0);
      if (+defaultBusinessId > 0) {
        this.base.setCurrentBusinessId(defaultBusinessId);
        this.http.get(`${this.baseUrl}/businesses`, {
          headers: new HttpHeaders(
            {
              'Authorization': `Bearer ${auth.token}`,
              'X-Popcx-Business': defaultBusinessId + '',
              'Content-Type': 'application/json',
              'Api-Version': '1'
            }
          ),
          params: this._setParams({
            id: businessIds
          })
        }).subscribe((res: any) => {
          const businesses = res.data ? res.data : res;
          auth.businesses = {};
          if (IsArray(businesses, true)) {
            businesses.map((business: Business) => {
              auth.businesses[business.id] = business;
            });
          }
          // Check if this app was public facing, and turn it off
          if (this.APP_GLOBAL.isOpen()) this.APP_GLOBAL.setOpen(false);
          return resolve(auth);
        });
      } else {
        auth.businesses = {};
        auth.users = {};
        return resolve(auth);
      }
    });
  }


  private _setParams(body) {
    let params: HttpParams = new HttpParams();
    for (const key of Object.keys(body)) {
      if (body[key]) {
        if (body[key] instanceof Array) {
          body[key].forEach((item) => {
            params = params.append(`${key.toString()}[]`, item);
          });
        } else {
          params = params.append(key.toString(), body[key]);
        }
      }
    }
    return params;
  }


  private _transformAuthResponse(auth: any): AuthDetails {
    const existingAuth = this.base.getAuthDetails();
    if (!(IsObject(auth.businesses))) {
      auth.businesses = {};
    }
    if (IsArray(auth.users, true)) {
      auth.users.map((user: BusinessUser) => {
        auth.businesses[user.business_id] = user.business;
        delete user.business;
      });
      auth.users = ArrayKeyBy(auth.users, 'business_id');
    }
    if (IsString(auth.first_name, true) && IsString(auth.last_name, true)) {
      auth.initials = GetStringAbbrv(`${auth.first_name} ${auth.last_name}`);
    } else if (IsString(auth.name, true)) {
      auth.initials = GetStringAbbrv(auth.name);
    } else if (auth.first_name || auth.last_name) {
      if (auth.first_name) {
        auth.initials = GetStringAbbrv(auth.first_name);
      } else {
        auth.initials = GetStringAbbrv(auth.last_name);
      }
    } else {
      auth.initials = '?';
    }
    if (IsDefined(auth.created_at)) auth.created_at = Math.floor((new Date(auth.created_at)).getTime() / 1000);
    if (IsDefined(auth.last_login_at)) auth.last_login_at = Math.floor(new Date(auth.last_login_at).getTime() / 1000);
    if (IsString(auth.email_verified_at, true)) auth.email_verified_at = Math.floor(new Date(auth.email_verified_at).getTime() / 1000);
    if (IsDefined(auth.token_created_at) && IsUndefined(auth.created_at)) auth.created_at = auth.token_created_at;
    if (IsUndefined(auth.max_ttl)) auth.max_ttl = 720;
    if (!(IsString(auth.token, true)) && IsObject(existingAuth, ['token'])) auth.token = existingAuth.token;
    if (IsDefined(existingAuth.created_at)) auth.created_at = existingAuth.created_at;


    return <AuthDetails>auth;
  }

}
