import { __awaiter } from "tslib";
import { Inject, Injectable, isDevMode } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { PopBaseService } from './pop-base.service';
import { forkJoin, of } from 'rxjs';
import { ArrayKeyBy, GetHttpErrorMsg, GetHttpResult, GetStringAbbrv, IsArray, IsDefined, IsObject, IsString, IsUndefined, SetSessionSiteVar, SetSiteVar } from '../pop-common-utility';
import { HttpBackend, HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { PopRequest, PopUser, SetPopAuth, SetPopBusiness } from '../pop-common.model';
import * as i0 from "@angular/core";
import * as i1 from "./pop-base.service";
import * as i2 from "@angular/common/http";
export class PopCredentialService {
    constructor(base, backend, APP_GLOBAL, env) {
        this.base = base;
        this.backend = backend;
        this.APP_GLOBAL = APP_GLOBAL;
        this.env = env;
        this.name = 'PopCredentialService';
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
    authenticate(credentials) {
        return new Promise(resolve => {
            this.base.clearAuthDetails(`${this.name}:authenticate`);
            this.http.post(`${this.baseUrl}/auth/login`, credentials).pipe(map((auth) => {
                auth = auth.data ? auth.data : auth;
                auth = this._transformAuthResponse(auth);
                // this.base.setAuthDetails( auth );
                SetSiteVar('Legacy.remember_me', credentials.remember_me);
                SetSiteVar('Legacy.remembered_username', (credentials.remember_me ? credentials.username : null));
                return auth;
            })).subscribe((auth) => __awaiter(this, void 0, void 0, function* () {
                auth = yield this._attachBusinesses(auth);
                this.base.setAuthDetails(auth);
                SetSessionSiteVar('Login.time', new Date().getTime());
                return resolve(auth);
            }), (err) => {
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
    reset(credentials, businessId = 0) {
        return new Promise((resolve, reject) => {
            this.base.clearLocalStorage();
            this.http.post(`${this.baseUrl}/auth/password/reset`, credentials).pipe(map((auth) => {
                auth = auth.data ? auth.data : auth;
                auth = this._transformAuthResponse(auth);
                this.base.setAuthDetails(auth);
                return auth;
            })).subscribe((auth) => __awaiter(this, void 0, void 0, function* () {
                if (IsObject(auth), ['token', 'id']) {
                    auth = auth.data ? auth.data : auth;
                    auth = yield this._attachBusinesses(auth, businessId);
                    this.base.setAuthDetails(auth);
                    return resolve(auth);
                }
                else {
                    return reject(auth);
                }
            }), err => {
                return resolve(GetHttpErrorMsg(err));
            });
        });
    }
    update(auth, businessId = 0) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            this.base.clearLocalStorage();
            auth = this._transformAuthResponse(auth);
            auth = yield this._attachBusinesses(auth, businessId);
            this.base.setAuthDetails(auth);
            return resolve(auth);
        }));
    }
    clear(storage = true) {
        return PopRequest.doPost(`auth/logout`, {}).pipe(map((res) => {
            res = res.data ? res.data : res;
            if (storage) {
                this.base.clearAuthDetails(`${this.name}:clear`);
            }
            return res;
        }));
    }
    clearAll(storage = true) {
        return PopRequest.doPost(`auth/logout`, { logoutAll: true }).pipe(map((res) => {
            res = res.data ? res.data : res;
            if (storage) {
                SetPopAuth(null);
                SetPopBusiness(null);
                this.base.clearAuthDetails(`${this.name}:clearAll`);
            }
            return res;
        }));
    }
    /**
     * Verify the current auth storage
     *
     * @param credentials
     * @returns {Observable<void>}
     */
    verify(businessId) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            if (!businessId || this.base.isAuthExpired()) {
                return resolve(null);
            }
            let checkedPermission = false;
            const initRequests = [
                PopRequest.doGet(`/auth/user`).pipe(map((auth) => {
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
                }))
            ];
            if (IsObject(PopUser, ['id']) && this.APP_GLOBAL.isPermissions()) {
                checkedPermission = true;
                initRequests.push(PopRequest.doPatch(`/businesses/${businessId}/users/${PopUser.id}/permissions`, {
                    with: ''
                }, 1, true));
            }
            forkJoin(initRequests).subscribe((results) => {
                const auth = results[0];
                const existing = this.base.getAuthDetails();
                existing.users = Object.assign(Object.assign({}, existing.users), auth.users);
                existing.businesses = Object.assign(Object.assign({}, existing.businesses), auth.businesses);
                if (checkedPermission) {
                    const user = GetHttpResult(results[1]);
                    if (businessId in existing.users) {
                        existing.users[businessId].permissions = user.permissions;
                    }
                }
                if (+businessId) {
                    forkJoin([
                        PopRequest.doGet(`/businesses/${businessId}`, { with: 'apps' }, 1, false, businessId).pipe(catchError(error => of(error)), map((res) => {
                            if (res.data)
                                res = res.data;
                            if (IsArray(res)) {
                                return res.pop();
                            }
                            else {
                                return res;
                            }
                        })),
                        PopRequest.doGet(`/apps/user/${auth.users[businessId].id}/settings`, {}, 1, false, businessId).pipe(catchError(error => of(error)), map((res) => {
                            if (res.data)
                                res = res.data;
                            return res;
                        })),
                    ]).subscribe((data) => {
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
                }
                else {
                    this.base.setAuthDetails(existing);
                    return resolve(existing);
                }
            }, () => {
                return resolve(null);
            });
        }));
    }
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    _attachBusinesses(auth, defaultBusinessId = 0) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            const businessIds = Object.keys(auth.users).map((id) => +id);
            if (!defaultBusinessId)
                defaultBusinessId = +auth.business_fk && businessIds.includes(+auth.business_fk) ? +auth.business_fk : (IsArray(businessIds, true) ? +businessIds[0] : 0);
            if (+defaultBusinessId > 0) {
                this.base.setCurrentBusinessId(defaultBusinessId);
                this.http.get(`${this.baseUrl}/businesses`, {
                    headers: new HttpHeaders({
                        'Authorization': `Bearer ${auth.token}`,
                        'X-Popcx-Business': defaultBusinessId + '',
                        'Content-Type': 'application/json',
                        'Api-Version': '1'
                    }),
                    params: this._setParams({
                        id: businessIds
                    })
                }).subscribe((res) => {
                    const businesses = res.data ? res.data : res;
                    auth.businesses = {};
                    if (IsArray(businesses, true)) {
                        businesses.map((business) => {
                            auth.businesses[business.id] = business;
                        });
                    }
                    // Check if this app was public facing, and turn it off
                    if (this.APP_GLOBAL.isOpen())
                        this.APP_GLOBAL.setOpen(false);
                    return resolve(auth);
                });
            }
            else {
                auth.businesses = {};
                auth.users = {};
                return resolve(auth);
            }
        }));
    }
    _setParams(body) {
        let params = new HttpParams();
        for (const key of Object.keys(body)) {
            if (body[key]) {
                if (body[key] instanceof Array) {
                    body[key].forEach((item) => {
                        params = params.append(`${key.toString()}[]`, item);
                    });
                }
                else {
                    params = params.append(key.toString(), body[key]);
                }
            }
        }
        return params;
    }
    _transformAuthResponse(auth) {
        const existingAuth = this.base.getAuthDetails();
        if (!(IsObject(auth.businesses))) {
            auth.businesses = {};
        }
        if (IsArray(auth.users, true)) {
            auth.users.map((user) => {
                auth.businesses[user.business_id] = user.business;
                delete user.business;
            });
            auth.users = ArrayKeyBy(auth.users, 'business_id');
        }
        if (IsString(auth.first_name, true) && IsString(auth.last_name, true)) {
            auth.initials = GetStringAbbrv(`${auth.first_name} ${auth.last_name}`);
        }
        else if (IsString(auth.name, true)) {
            auth.initials = GetStringAbbrv(auth.name);
        }
        else if (auth.first_name || auth.last_name) {
            if (auth.first_name) {
                auth.initials = GetStringAbbrv(auth.first_name);
            }
            else {
                auth.initials = GetStringAbbrv(auth.last_name);
            }
        }
        else {
            auth.initials = '?';
        }
        if (IsDefined(auth.created_at))
            auth.created_at = Math.floor((new Date(auth.created_at)).getTime() / 1000);
        if (IsDefined(auth.last_login_at))
            auth.last_login_at = Math.floor(new Date(auth.last_login_at).getTime() / 1000);
        if (IsString(auth.email_verified_at, true))
            auth.email_verified_at = Math.floor(new Date(auth.email_verified_at).getTime() / 1000);
        if (IsDefined(auth.token_created_at) && IsUndefined(auth.created_at))
            auth.created_at = auth.token_created_at;
        if (IsUndefined(auth.max_ttl))
            auth.max_ttl = 720;
        if (!(IsString(auth.token, true)) && IsObject(existingAuth, ['token']))
            auth.token = existingAuth.token;
        if (IsDefined(existingAuth.created_at))
            auth.created_at = existingAuth.created_at;
        return auth;
    }
}
PopCredentialService.ɵprov = i0.ɵɵdefineInjectable({ factory: function PopCredentialService_Factory() { return new PopCredentialService(i0.ɵɵinject(i1.PopBaseService), i0.ɵɵinject(i2.HttpBackend), i0.ɵɵinject("APP_GLOBAL"), i0.ɵɵinject("env")); }, token: PopCredentialService, providedIn: "root" });
PopCredentialService.decorators = [
    { type: Injectable },
    { type: Injectable, args: [{
                providedIn: 'root'
            },] }
];
PopCredentialService.ctorParameters = () => [
    { type: PopBaseService },
    { type: HttpBackend },
    { type: undefined, decorators: [{ type: Inject, args: ['APP_GLOBAL',] }] },
    { type: undefined, decorators: [{ type: Inject, args: ['env',] }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWNyZWRlbnRpYWwuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9zZXJ2aWNlcy9wb3AtY3JlZGVudGlhbC5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDNUQsT0FBTyxFQUFDLFVBQVUsRUFBRSxHQUFHLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUUvQyxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFFbEQsT0FBTyxFQUFDLFFBQVEsRUFBRSxFQUFFLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDbEMsT0FBTyxFQUNMLFVBQVUsRUFDVixlQUFlLEVBQUUsYUFBYSxFQUM5QixjQUFjLEVBQ2QsT0FBTyxFQUNQLFNBQVMsRUFDVCxRQUFRLEVBQ1IsUUFBUSxFQUNSLFdBQVcsRUFBRSxpQkFBaUIsRUFDOUIsVUFBVSxFQUNYLE1BQU0sdUJBQXVCLENBQUM7QUFDL0IsT0FBTyxFQUFDLFdBQVcsRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQ3RGLE9BQU8sRUFBcUIsVUFBVSxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsY0FBYyxFQUFDLE1BQU0scUJBQXFCLENBQUM7Ozs7QUFNeEcsTUFBTSxPQUFPLG9CQUFvQjtJQVEvQixZQUNVLElBQW9CLEVBQ3BCLE9BQW9CLEVBQ0UsVUFBOEIsRUFDdEMsR0FBSTtRQUhsQixTQUFJLEdBQUosSUFBSSxDQUFnQjtRQUNwQixZQUFPLEdBQVAsT0FBTyxDQUFhO1FBQ0UsZUFBVSxHQUFWLFVBQVUsQ0FBb0I7UUFDdEMsUUFBRyxHQUFILEdBQUcsQ0FBQztRQVhyQixTQUFJLEdBQUcsc0JBQXNCLENBQUM7UUFhbkMsSUFB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QUFNO2FBQ25COzs7WUFwQk8sY0FBYztZQWNkLFdBQVc7NENBa0JkLE1BQU0sU0FBQyxZQUFZOzRDQUNuQixNQUFNLFNBQUMsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0LCBJbmplY3RhYmxlLCBpc0Rldk1vZGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtjYXRjaEVycm9yLCBtYXB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHtQb3BCYXNlU2VydmljZX0gZnJvbSAnLi9wb3AtYmFzZS5zZXJ2aWNlJztcbmltcG9ydCB7QXV0aERldGFpbHMsIEJ1c2luZXNzLCBCdXNpbmVzc1VzZXJ9IGZyb20gJy4uL3BvcC1jb21tb24tdG9rZW4ubW9kZWwnO1xuaW1wb3J0IHtmb3JrSm9pbiwgb2Z9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtcbiAgQXJyYXlLZXlCeSxcbiAgR2V0SHR0cEVycm9yTXNnLCBHZXRIdHRwUmVzdWx0LFxuICBHZXRTdHJpbmdBYmJydixcbiAgSXNBcnJheSxcbiAgSXNEZWZpbmVkLFxuICBJc09iamVjdCxcbiAgSXNTdHJpbmcsXG4gIElzVW5kZWZpbmVkLCBTZXRTZXNzaW9uU2l0ZVZhcixcbiAgU2V0U2l0ZVZhclxufSBmcm9tICcuLi9wb3AtY29tbW9uLXV0aWxpdHknO1xuaW1wb3J0IHtIdHRwQmFja2VuZCwgSHR0cENsaWVudCwgSHR0cEhlYWRlcnMsIEh0dHBQYXJhbXN9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcbmltcG9ydCB7QXBwR2xvYmFsSW50ZXJmYWNlLCBQb3BSZXF1ZXN0LCBQb3BVc2VyLCBTZXRQb3BBdXRoLCBTZXRQb3BCdXNpbmVzc30gZnJvbSAnLi4vcG9wLWNvbW1vbi5tb2RlbCc7XG5cblxuQEluamVjdGFibGUoKSBASW5qZWN0YWJsZSh7XG4gIHByb3ZpZGVkSW46ICdyb290J1xufSlcbmV4cG9ydCBjbGFzcyBQb3BDcmVkZW50aWFsU2VydmljZSB7XG4gIHB1YmxpYyBuYW1lID0gJ1BvcENyZWRlbnRpYWxTZXJ2aWNlJztcbiAgcHJpdmF0ZSBodHRwOiBIdHRwQ2xpZW50O1xuXG5cbiAgcHJpdmF0ZSByZWFkb25seSBiYXNlVXJsO1xuXG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBiYXNlOiBQb3BCYXNlU2VydmljZSxcbiAgICBwcml2YXRlIGJhY2tlbmQ6IEh0dHBCYWNrZW5kLFxuICAgIEBJbmplY3QoJ0FQUF9HTE9CQUwnKSBwcml2YXRlIEFQUF9HTE9CQUw6IEFwcEdsb2JhbEludGVyZmFjZSxcbiAgICBASW5qZWN0KCdlbnYnKSBwdWJsaWMgZW52PyxcbiAgKSB7XG4gICAgaWYgKCF0aGlzLmJhc2VVcmwpIHtcbiAgICAgIGNvbnN0IGVudlVybCA9IGlzRGV2TW9kZSgpICYmIHRoaXMuZW52ICYmIHRoaXMuZW52LmFwaUJhc2VVcmwgPyB0aGlzLmVudi5hcGlCYXNlVXJsIDogbnVsbDtcbiAgICAgIHRoaXMuYmFzZVVybCA9IChlbnZVcmwgPyBlbnZVcmwgOiBgJHt3aW5kb3cubG9jYXRpb24ucHJvdG9jb2x9Ly9hcGkuJHt3aW5kb3cubG9jYXRpb24uaG9zdH1gKTtcbiAgICB9XG4gICAgdGhpcy5odHRwID0gbmV3IEh0dHBDbGllbnQodGhpcy5iYWNrZW5kKTsgLy8gYnlwYXNzIHRoZSBkZWZhdWx0IGludGVyY2VwdG9yc1xuICB9XG5cblxuICAvKipcbiAgICogTWFpbiBsb2dpbiBmdW5jdGlvbiBoaXQgYWZ0ZXIgdGhleSBjbGljayB0aGUgTG9naW4gYnV0dG9uLlxuICAgKlxuICAgKiBAcGFyYW0gY3JlZGVudGlhbHNcbiAgICogQHJldHVybnMge09ic2VydmFibGU8dm9pZD59XG4gICAqL1xuICBhdXRoZW50aWNhdGUoY3JlZGVudGlhbHMpOiBQcm9taXNlPEF1dGhEZXRhaWxzIHwgc3RyaW5nPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPEF1dGhEZXRhaWxzIHwgc3RyaW5nPihyZXNvbHZlID0+IHtcbiAgICAgIHRoaXMuYmFzZS5jbGVhckF1dGhEZXRhaWxzKGAke3RoaXMubmFtZX06YXV0aGVudGljYXRlYCk7XG4gICAgICB0aGlzLmh0dHAucG9zdChgJHt0aGlzLmJhc2VVcmx9L2F1dGgvbG9naW5gLCBjcmVkZW50aWFscykucGlwZShcbiAgICAgICAgbWFwKChhdXRoOiBhbnkpID0+IHtcbiAgICAgICAgICBhdXRoID0gYXV0aC5kYXRhID8gYXV0aC5kYXRhIDogYXV0aDtcbiAgICAgICAgICBhdXRoID0gdGhpcy5fdHJhbnNmb3JtQXV0aFJlc3BvbnNlKGF1dGgpO1xuICAgICAgICAgIC8vIHRoaXMuYmFzZS5zZXRBdXRoRGV0YWlscyggYXV0aCApO1xuICAgICAgICAgIFNldFNpdGVWYXIoJ0xlZ2FjeS5yZW1lbWJlcl9tZScsIGNyZWRlbnRpYWxzLnJlbWVtYmVyX21lKTtcbiAgICAgICAgICBTZXRTaXRlVmFyKCdMZWdhY3kucmVtZW1iZXJlZF91c2VybmFtZScsIChjcmVkZW50aWFscy5yZW1lbWJlcl9tZSA/IGNyZWRlbnRpYWxzLnVzZXJuYW1lIDogbnVsbCkpO1xuICAgICAgICAgIHJldHVybiBhdXRoO1xuICAgICAgICB9KVxuICAgICAgKS5zdWJzY3JpYmUoYXN5bmMgKGF1dGgpID0+IHtcbiAgICAgICAgICBhdXRoID0gYXdhaXQgdGhpcy5fYXR0YWNoQnVzaW5lc3NlcyhhdXRoKTtcbiAgICAgICAgICB0aGlzLmJhc2Uuc2V0QXV0aERldGFpbHMoYXV0aCk7XG4gICAgICAgICAgU2V0U2Vzc2lvblNpdGVWYXIoJ0xvZ2luLnRpbWUnLCBuZXcgRGF0ZSgpLmdldFRpbWUoKSk7XG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUoYXV0aCk7XG4gICAgICAgIH0sXG4gICAgICAgIChlcnIpID0+IHtcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZShHZXRIdHRwRXJyb3JNc2coZXJyKSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cblxuICAvKipcbiAgICogUmVzZXQgbG9naW4gZnVuY3Rpb24gaGl0IGFmdGVyIHBhc3N3b3JkIHJlc2V0XG4gICAqXG4gICAqIEBwYXJhbSBjcmVkZW50aWFsc1xuICAgKiBAcmV0dXJucyB7T2JzZXJ2YWJsZTx2b2lkPn1cbiAgICovXG5cbiAgcmVzZXQoY3JlZGVudGlhbHMsIGJ1c2luZXNzSWQ6IG51bWJlciA9IDApOiBQcm9taXNlPEF1dGhEZXRhaWxzIHwgc3RyaW5nPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPEF1dGhEZXRhaWxzIHwgc3RyaW5nPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLmJhc2UuY2xlYXJMb2NhbFN0b3JhZ2UoKTtcbiAgICAgIHRoaXMuaHR0cC5wb3N0KGAke3RoaXMuYmFzZVVybH0vYXV0aC9wYXNzd29yZC9yZXNldGAsIGNyZWRlbnRpYWxzKS5waXBlKFxuICAgICAgICBtYXAoKGF1dGg6IGFueSkgPT4ge1xuICAgICAgICAgIGF1dGggPSBhdXRoLmRhdGEgPyBhdXRoLmRhdGEgOiBhdXRoO1xuICAgICAgICAgIGF1dGggPSB0aGlzLl90cmFuc2Zvcm1BdXRoUmVzcG9uc2UoYXV0aCk7XG4gICAgICAgICAgdGhpcy5iYXNlLnNldEF1dGhEZXRhaWxzKGF1dGgpO1xuICAgICAgICAgIHJldHVybiBhdXRoO1xuICAgICAgICB9KVxuICAgICAgKS5zdWJzY3JpYmUoYXN5bmMgKGF1dGgpID0+IHtcbiAgICAgICAgICBpZiAoSXNPYmplY3QoYXV0aCksIFsndG9rZW4nLCAnaWQnXSkge1xuICAgICAgICAgICAgYXV0aCA9IGF1dGguZGF0YSA/IDxBdXRoRGV0YWlscz5hdXRoLmRhdGEgOiA8QXV0aERldGFpbHM+YXV0aDtcbiAgICAgICAgICAgIGF1dGggPSBhd2FpdCB0aGlzLl9hdHRhY2hCdXNpbmVzc2VzKGF1dGgsIGJ1c2luZXNzSWQpO1xuICAgICAgICAgICAgdGhpcy5iYXNlLnNldEF1dGhEZXRhaWxzKGF1dGgpO1xuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoYXV0aCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiByZWplY3QoYXV0aCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgIH0sXG4gICAgICAgIGVyciA9PiB7XG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUoR2V0SHR0cEVycm9yTXNnKGVycikpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG5cbiAgdXBkYXRlKGF1dGg6IEF1dGhEZXRhaWxzLCBidXNpbmVzc0lkOiBudW1iZXIgPSAwKTogUHJvbWlzZTxBdXRoRGV0YWlscyB8IHN0cmluZz4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxBdXRoRGV0YWlscyB8IHN0cmluZz4oYXN5bmMgKHJlc29sdmUpID0+IHtcbiAgICAgIHRoaXMuYmFzZS5jbGVhckxvY2FsU3RvcmFnZSgpO1xuICAgICAgYXV0aCA9IHRoaXMuX3RyYW5zZm9ybUF1dGhSZXNwb25zZShhdXRoKTtcbiAgICAgIGF1dGggPSBhd2FpdCB0aGlzLl9hdHRhY2hCdXNpbmVzc2VzKGF1dGgsIGJ1c2luZXNzSWQpO1xuICAgICAgdGhpcy5iYXNlLnNldEF1dGhEZXRhaWxzKGF1dGgpO1xuICAgICAgcmV0dXJuIHJlc29sdmUoYXV0aCk7XG4gICAgfSk7XG4gIH1cblxuXG4gIGNsZWFyKHN0b3JhZ2UgPSB0cnVlKSB7XG4gICAgcmV0dXJuIFBvcFJlcXVlc3QuZG9Qb3N0KGBhdXRoL2xvZ291dGAsIHt9KS5waXBlKFxuICAgICAgbWFwKChyZXM6IGFueSkgPT4ge1xuICAgICAgICByZXMgPSByZXMuZGF0YSA/IHJlcy5kYXRhIDogcmVzO1xuICAgICAgICBpZiAoc3RvcmFnZSkge1xuICAgICAgICAgIHRoaXMuYmFzZS5jbGVhckF1dGhEZXRhaWxzKGAke3RoaXMubmFtZX06Y2xlYXJgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXM7XG4gICAgICB9KVxuICAgICk7XG4gIH1cblxuXG4gIGNsZWFyQWxsKHN0b3JhZ2UgPSB0cnVlKSB7XG4gICAgcmV0dXJuIFBvcFJlcXVlc3QuZG9Qb3N0KGBhdXRoL2xvZ291dGAsIHtsb2dvdXRBbGw6IHRydWV9KS5waXBlKFxuICAgICAgbWFwKChyZXM6IGFueSkgPT4ge1xuICAgICAgICByZXMgPSByZXMuZGF0YSA/IHJlcy5kYXRhIDogcmVzO1xuICAgICAgICBpZiAoc3RvcmFnZSkge1xuICAgICAgICAgIFNldFBvcEF1dGgobnVsbCk7XG4gICAgICAgICAgU2V0UG9wQnVzaW5lc3MobnVsbCk7XG4gICAgICAgICAgdGhpcy5iYXNlLmNsZWFyQXV0aERldGFpbHMoYCR7dGhpcy5uYW1lfTpjbGVhckFsbGApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgICB9KVxuICAgICk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBWZXJpZnkgdGhlIGN1cnJlbnQgYXV0aCBzdG9yYWdlXG4gICAqXG4gICAqIEBwYXJhbSBjcmVkZW50aWFsc1xuICAgKiBAcmV0dXJucyB7T2JzZXJ2YWJsZTx2b2lkPn1cbiAgICovXG4gIHZlcmlmeShidXNpbmVzc0lkOiBudW1iZXIpOiBQcm9taXNlPEF1dGhEZXRhaWxzPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPEF1dGhEZXRhaWxzPihhc3luYyAocmVzb2x2ZSkgPT4ge1xuICAgICAgaWYgKCFidXNpbmVzc0lkIHx8IHRoaXMuYmFzZS5pc0F1dGhFeHBpcmVkKCkpIHtcbiAgICAgICAgcmV0dXJuIHJlc29sdmUobnVsbCk7XG4gICAgICB9XG4gICAgICBsZXQgY2hlY2tlZFBlcm1pc3Npb24gPSBmYWxzZTtcbiAgICAgIGNvbnN0IGluaXRSZXF1ZXN0cyA9IFtcbiAgICAgICAgUG9wUmVxdWVzdC5kb0dldChgL2F1dGgvdXNlcmApLnBpcGUoXG4gICAgICAgICAgbWFwKChhdXRoOiBhbnkpID0+IHtcbiAgICAgICAgICAgIGF1dGggPSBhdXRoLmRhdGEgPyBhdXRoLmRhdGEgOiBhdXRoO1xuICAgICAgICAgICAgYXV0aCA9IHRoaXMuX3RyYW5zZm9ybUF1dGhSZXNwb25zZShhdXRoKTtcbiAgICAgICAgICAgIGlmICgrYnVzaW5lc3NJZCkge1xuICAgICAgICAgICAgICBsZXQgdG1wID0gSXNPYmplY3QoYXV0aC5idXNpbmVzc2VzW2J1c2luZXNzSWRdLCB0cnVlKSA/IGF1dGguYnVzaW5lc3Nlc1tidXNpbmVzc0lkXSA6IG51bGw7XG4gICAgICAgICAgICAgIGF1dGguYnVzaW5lc3NlcyA9IHt9O1xuICAgICAgICAgICAgICBpZiAodG1wKSB7XG4gICAgICAgICAgICAgICAgYXV0aC5idXNpbmVzc2VzW2J1c2luZXNzSWRdID0gdG1wO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgdG1wID0gSXNPYmplY3QoYXV0aC51c2Vyc1tidXNpbmVzc0lkXSwgdHJ1ZSkgPyBhdXRoLnVzZXJzW2J1c2luZXNzSWRdIDogbnVsbDtcbiAgICAgICAgICAgICAgYXV0aC51c2VycyA9IHt9O1xuICAgICAgICAgICAgICBpZiAodG1wKSB7XG4gICAgICAgICAgICAgICAgYXV0aC51c2Vyc1tidXNpbmVzc0lkXSA9IHRtcDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGF1dGg7XG4gICAgICAgICAgfSlcbiAgICAgICAgKVxuICAgICAgXTtcbiAgICAgIGlmIChJc09iamVjdChQb3BVc2VyLCBbJ2lkJ10pICYmIHRoaXMuQVBQX0dMT0JBTC5pc1Blcm1pc3Npb25zKCkpIHtcbiAgICAgICAgY2hlY2tlZFBlcm1pc3Npb24gPSB0cnVlO1xuICAgICAgICBpbml0UmVxdWVzdHMucHVzaChQb3BSZXF1ZXN0LmRvUGF0Y2goYC9idXNpbmVzc2VzLyR7YnVzaW5lc3NJZH0vdXNlcnMvJHtQb3BVc2VyLmlkfS9wZXJtaXNzaW9uc2AsIHtcbiAgICAgICAgICB3aXRoOiAnJ1xuICAgICAgICB9LCAxLCB0cnVlKSk7XG4gICAgICB9XG5cbiAgICAgIGZvcmtKb2luKGluaXRSZXF1ZXN0cykuc3Vic2NyaWJlKChyZXN1bHRzKSA9PiB7XG4gICAgICAgIGNvbnN0IGF1dGggPSA8QXV0aERldGFpbHM+cmVzdWx0c1swXTtcbiAgICAgICAgY29uc3QgZXhpc3RpbmcgPSA8QXV0aERldGFpbHM+dGhpcy5iYXNlLmdldEF1dGhEZXRhaWxzKCk7XG4gICAgICAgIGV4aXN0aW5nLnVzZXJzID0gey4uLmV4aXN0aW5nLnVzZXJzLCAuLi5hdXRoLnVzZXJzfTtcbiAgICAgICAgZXhpc3RpbmcuYnVzaW5lc3NlcyA9IHsuLi5leGlzdGluZy5idXNpbmVzc2VzLCAuLi5hdXRoLmJ1c2luZXNzZXN9O1xuXG4gICAgICAgIGlmIChjaGVja2VkUGVybWlzc2lvbikge1xuXG4gICAgICAgICAgY29uc3QgdXNlciA9IEdldEh0dHBSZXN1bHQocmVzdWx0c1sxXSk7XG4gICAgICAgICAgaWYgKGJ1c2luZXNzSWQgaW4gZXhpc3RpbmcudXNlcnMpIHtcbiAgICAgICAgICAgIGV4aXN0aW5nLnVzZXJzW2J1c2luZXNzSWRdLnBlcm1pc3Npb25zID0gdXNlci5wZXJtaXNzaW9ucztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCtidXNpbmVzc0lkKSB7XG4gICAgICAgICAgZm9ya0pvaW4oW1xuICAgICAgICAgICAgUG9wUmVxdWVzdC5kb0dldChgL2J1c2luZXNzZXMvJHtidXNpbmVzc0lkfWAsIHt3aXRoOiAnYXBwcyd9LCAxLCBmYWxzZSwgYnVzaW5lc3NJZCkucGlwZShcbiAgICAgICAgICAgICAgY2F0Y2hFcnJvcihlcnJvciA9PiBvZihlcnJvcikpLFxuICAgICAgICAgICAgICBtYXAoKHJlczogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHJlcy5kYXRhKSByZXMgPSByZXMuZGF0YTtcbiAgICAgICAgICAgICAgICBpZiAoSXNBcnJheShyZXMpKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gcmVzLnBvcCgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICB9KSksXG4gICAgICAgICAgICBQb3BSZXF1ZXN0LmRvR2V0KGAvYXBwcy91c2VyLyR7YXV0aC51c2Vyc1tidXNpbmVzc0lkXS5pZH0vc2V0dGluZ3NgLCB7fSwgMSwgZmFsc2UsIGJ1c2luZXNzSWQpLnBpcGUoXG4gICAgICAgICAgICAgIGNhdGNoRXJyb3IoZXJyb3IgPT4gb2YoZXJyb3IpKSxcbiAgICAgICAgICAgICAgbWFwKChyZXM6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChyZXMuZGF0YSkgcmVzID0gcmVzLmRhdGE7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgICAgICAgfSkpLFxuICAgICAgICAgIF0pLnN1YnNjcmliZSgoZGF0YTogYW55KSA9PiB7XG4gICAgICAgICAgICBpZiAoIShJc09iamVjdChleGlzdGluZy5idXNpbmVzc2VzW2J1c2luZXNzSWRdLCB0cnVlKSkgfHwgIShleGlzdGluZy51c2Vyc1tidXNpbmVzc0lkXSkpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUobnVsbCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGV4aXN0aW5nLmJ1c2luZXNzZXNbYnVzaW5lc3NJZF0gPSBkYXRhWzBdO1xuICAgICAgICAgICAgZXhpc3RpbmcudXNlcnNbYnVzaW5lc3NJZF0uc2V0dGluZyA9IHt9O1xuICAgICAgICAgICAgaWYgKElzQXJyYXkoZGF0YVsxXSwgdHJ1ZSkpIHtcbiAgICAgICAgICAgICAgZGF0YVsxXS5tYXAoKGl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoSXNPYmplY3QoaXRlbSwgdHJ1ZSkpIHtcbiAgICAgICAgICAgICAgICAgIGV4aXN0aW5nLnVzZXJzW2J1c2luZXNzSWRdLnNldHRpbmdbaXRlbS5uYW1lXSA9IGl0ZW0uc2V0dGluZy52YWx1ZSA/IGl0ZW0uc2V0dGluZy52YWx1ZSA6IGl0ZW0uZGVmYXVsdFZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBleGlzdGluZy51c2Vyc1tidXNpbmVzc0lkXSA9IGF1dGgudXNlcnNbYnVzaW5lc3NJZF07XG4gICAgICAgICAgICAvLyBleGlzdGluZy5idXNpbmVzc2VzW2J1c2luZXNzSWRdID0gYXV0aC5idXNpbmVzc2VzW2J1c2luZXNzSWRdO1xuICAgICAgICAgICAgdGhpcy5iYXNlLnNldEF1dGhEZXRhaWxzKGV4aXN0aW5nKTtcbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlKGV4aXN0aW5nKTtcbiAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcmVzb2x2ZShleGlzdGluZyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5iYXNlLnNldEF1dGhEZXRhaWxzKGV4aXN0aW5nKTtcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZShleGlzdGluZyk7XG4gICAgICAgIH1cblxuICAgICAgfSwgKCkgPT4ge1xuICAgICAgICByZXR1cm4gcmVzb2x2ZShudWxsKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cblxuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFVuZGVyIFRoZSBIb29kICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICggUHJpdmF0ZSBNZXRob2QgKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuXG4gIHByaXZhdGUgX2F0dGFjaEJ1c2luZXNzZXMoYXV0aDogQXV0aERldGFpbHMsIGRlZmF1bHRCdXNpbmVzc0lkOiBudW1iZXIgPSAwKTogUHJvbWlzZTxBdXRoRGV0YWlscz4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxBdXRoRGV0YWlscz4oYXN5bmMgKHJlc29sdmUpID0+IHtcbiAgICAgIGNvbnN0IGJ1c2luZXNzSWRzID0gT2JqZWN0LmtleXMoYXV0aC51c2VycykubWFwKChpZCkgPT4gK2lkKTtcbiAgICAgIGlmICghZGVmYXVsdEJ1c2luZXNzSWQpIGRlZmF1bHRCdXNpbmVzc0lkID0gK2F1dGguYnVzaW5lc3NfZmsgJiYgYnVzaW5lc3NJZHMuaW5jbHVkZXMoK2F1dGguYnVzaW5lc3NfZmspID8gK2F1dGguYnVzaW5lc3NfZmsgOiAoSXNBcnJheShidXNpbmVzc0lkcywgdHJ1ZSkgPyArYnVzaW5lc3NJZHNbMF0gOiAwKTtcbiAgICAgIGlmICgrZGVmYXVsdEJ1c2luZXNzSWQgPiAwKSB7XG4gICAgICAgIHRoaXMuYmFzZS5zZXRDdXJyZW50QnVzaW5lc3NJZChkZWZhdWx0QnVzaW5lc3NJZCk7XG4gICAgICAgIHRoaXMuaHR0cC5nZXQoYCR7dGhpcy5iYXNlVXJsfS9idXNpbmVzc2VzYCwge1xuICAgICAgICAgIGhlYWRlcnM6IG5ldyBIdHRwSGVhZGVycyhcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgJ0F1dGhvcml6YXRpb24nOiBgQmVhcmVyICR7YXV0aC50b2tlbn1gLFxuICAgICAgICAgICAgICAnWC1Qb3BjeC1CdXNpbmVzcyc6IGRlZmF1bHRCdXNpbmVzc0lkICsgJycsXG4gICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgICAgICdBcGktVmVyc2lvbic6ICcxJ1xuICAgICAgICAgICAgfVxuICAgICAgICAgICksXG4gICAgICAgICAgcGFyYW1zOiB0aGlzLl9zZXRQYXJhbXMoe1xuICAgICAgICAgICAgaWQ6IGJ1c2luZXNzSWRzXG4gICAgICAgICAgfSlcbiAgICAgICAgfSkuc3Vic2NyaWJlKChyZXM6IGFueSkgPT4ge1xuICAgICAgICAgIGNvbnN0IGJ1c2luZXNzZXMgPSByZXMuZGF0YSA/IHJlcy5kYXRhIDogcmVzO1xuICAgICAgICAgIGF1dGguYnVzaW5lc3NlcyA9IHt9O1xuICAgICAgICAgIGlmIChJc0FycmF5KGJ1c2luZXNzZXMsIHRydWUpKSB7XG4gICAgICAgICAgICBidXNpbmVzc2VzLm1hcCgoYnVzaW5lc3M6IEJ1c2luZXNzKSA9PiB7XG4gICAgICAgICAgICAgIGF1dGguYnVzaW5lc3Nlc1tidXNpbmVzcy5pZF0gPSBidXNpbmVzcztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBDaGVjayBpZiB0aGlzIGFwcCB3YXMgcHVibGljIGZhY2luZywgYW5kIHR1cm4gaXQgb2ZmXG4gICAgICAgICAgaWYgKHRoaXMuQVBQX0dMT0JBTC5pc09wZW4oKSkgdGhpcy5BUFBfR0xPQkFMLnNldE9wZW4oZmFsc2UpO1xuICAgICAgICAgIHJldHVybiByZXNvbHZlKGF1dGgpO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGF1dGguYnVzaW5lc3NlcyA9IHt9O1xuICAgICAgICBhdXRoLnVzZXJzID0ge307XG4gICAgICAgIHJldHVybiByZXNvbHZlKGF1dGgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cblxuICBwcml2YXRlIF9zZXRQYXJhbXMoYm9keSkge1xuICAgIGxldCBwYXJhbXM6IEh0dHBQYXJhbXMgPSBuZXcgSHR0cFBhcmFtcygpO1xuICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKGJvZHkpKSB7XG4gICAgICBpZiAoYm9keVtrZXldKSB7XG4gICAgICAgIGlmIChib2R5W2tleV0gaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgIGJvZHlba2V5XS5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgICAgICBwYXJhbXMgPSBwYXJhbXMuYXBwZW5kKGAke2tleS50b1N0cmluZygpfVtdYCwgaXRlbSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcGFyYW1zID0gcGFyYW1zLmFwcGVuZChrZXkudG9TdHJpbmcoKSwgYm9keVtrZXldKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcGFyYW1zO1xuICB9XG5cblxuICBwcml2YXRlIF90cmFuc2Zvcm1BdXRoUmVzcG9uc2UoYXV0aDogYW55KTogQXV0aERldGFpbHMge1xuICAgIGNvbnN0IGV4aXN0aW5nQXV0aCA9IHRoaXMuYmFzZS5nZXRBdXRoRGV0YWlscygpO1xuICAgIGlmICghKElzT2JqZWN0KGF1dGguYnVzaW5lc3NlcykpKSB7XG4gICAgICBhdXRoLmJ1c2luZXNzZXMgPSB7fTtcbiAgICB9XG4gICAgaWYgKElzQXJyYXkoYXV0aC51c2VycywgdHJ1ZSkpIHtcbiAgICAgIGF1dGgudXNlcnMubWFwKCh1c2VyOiBCdXNpbmVzc1VzZXIpID0+IHtcbiAgICAgICAgYXV0aC5idXNpbmVzc2VzW3VzZXIuYnVzaW5lc3NfaWRdID0gdXNlci5idXNpbmVzcztcbiAgICAgICAgZGVsZXRlIHVzZXIuYnVzaW5lc3M7XG4gICAgICB9KTtcbiAgICAgIGF1dGgudXNlcnMgPSBBcnJheUtleUJ5KGF1dGgudXNlcnMsICdidXNpbmVzc19pZCcpO1xuICAgIH1cbiAgICBpZiAoSXNTdHJpbmcoYXV0aC5maXJzdF9uYW1lLCB0cnVlKSAmJiBJc1N0cmluZyhhdXRoLmxhc3RfbmFtZSwgdHJ1ZSkpIHtcbiAgICAgIGF1dGguaW5pdGlhbHMgPSBHZXRTdHJpbmdBYmJydihgJHthdXRoLmZpcnN0X25hbWV9ICR7YXV0aC5sYXN0X25hbWV9YCk7XG4gICAgfSBlbHNlIGlmIChJc1N0cmluZyhhdXRoLm5hbWUsIHRydWUpKSB7XG4gICAgICBhdXRoLmluaXRpYWxzID0gR2V0U3RyaW5nQWJicnYoYXV0aC5uYW1lKTtcbiAgICB9IGVsc2UgaWYgKGF1dGguZmlyc3RfbmFtZSB8fCBhdXRoLmxhc3RfbmFtZSkge1xuICAgICAgaWYgKGF1dGguZmlyc3RfbmFtZSkge1xuICAgICAgICBhdXRoLmluaXRpYWxzID0gR2V0U3RyaW5nQWJicnYoYXV0aC5maXJzdF9uYW1lKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGF1dGguaW5pdGlhbHMgPSBHZXRTdHJpbmdBYmJydihhdXRoLmxhc3RfbmFtZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGF1dGguaW5pdGlhbHMgPSAnPyc7XG4gICAgfVxuICAgIGlmIChJc0RlZmluZWQoYXV0aC5jcmVhdGVkX2F0KSkgYXV0aC5jcmVhdGVkX2F0ID0gTWF0aC5mbG9vcigobmV3IERhdGUoYXV0aC5jcmVhdGVkX2F0KSkuZ2V0VGltZSgpIC8gMTAwMCk7XG4gICAgaWYgKElzRGVmaW5lZChhdXRoLmxhc3RfbG9naW5fYXQpKSBhdXRoLmxhc3RfbG9naW5fYXQgPSBNYXRoLmZsb29yKG5ldyBEYXRlKGF1dGgubGFzdF9sb2dpbl9hdCkuZ2V0VGltZSgpIC8gMTAwMCk7XG4gICAgaWYgKElzU3RyaW5nKGF1dGguZW1haWxfdmVyaWZpZWRfYXQsIHRydWUpKSBhdXRoLmVtYWlsX3ZlcmlmaWVkX2F0ID0gTWF0aC5mbG9vcihuZXcgRGF0ZShhdXRoLmVtYWlsX3ZlcmlmaWVkX2F0KS5nZXRUaW1lKCkgLyAxMDAwKTtcbiAgICBpZiAoSXNEZWZpbmVkKGF1dGgudG9rZW5fY3JlYXRlZF9hdCkgJiYgSXNVbmRlZmluZWQoYXV0aC5jcmVhdGVkX2F0KSkgYXV0aC5jcmVhdGVkX2F0ID0gYXV0aC50b2tlbl9jcmVhdGVkX2F0O1xuICAgIGlmIChJc1VuZGVmaW5lZChhdXRoLm1heF90dGwpKSBhdXRoLm1heF90dGwgPSA3MjA7XG4gICAgaWYgKCEoSXNTdHJpbmcoYXV0aC50b2tlbiwgdHJ1ZSkpICYmIElzT2JqZWN0KGV4aXN0aW5nQXV0aCwgWyd0b2tlbiddKSkgYXV0aC50b2tlbiA9IGV4aXN0aW5nQXV0aC50b2tlbjtcbiAgICBpZiAoSXNEZWZpbmVkKGV4aXN0aW5nQXV0aC5jcmVhdGVkX2F0KSkgYXV0aC5jcmVhdGVkX2F0ID0gZXhpc3RpbmdBdXRoLmNyZWF0ZWRfYXQ7XG5cblxuICAgIHJldHVybiA8QXV0aERldGFpbHM+YXV0aDtcbiAgfVxuXG59XG4iXX0=