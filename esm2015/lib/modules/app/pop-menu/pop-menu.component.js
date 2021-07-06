import { __awaiter } from "tslib";
import { Component, Inject, ViewChild, isDevMode } from '@angular/core';
import { PopBaseService } from '../../../services/pop-base.service';
import { IsArray, IsObject, IsString, ObjectsMatch, SetSiteVar } from '../../../pop-common-utility';
import { PopAliasRouteMap, PopEnv, PopHref, PopTemplate, ServiceInjector } from '../../../pop-common.model';
import { PopMenuService } from './pop-menu.service';
import { PopCredentialService } from '../../../services/pop-credential.service';
import { PopExtendComponent } from '../../../pop-extend.component';
import { Router } from '@angular/router';
export class PopMenuComponent extends PopExtendComponent {
    constructor(APP_GLOBAL) {
        super();
        this.APP_GLOBAL = APP_GLOBAL;
        this.name = 'PopMenuComponent';
        this.asset = {
            existingBusinesses: undefined
        };
        this.ui = {
            alternate_businesses: [],
            menus: {
                all: [],
                more: []
            },
            user: undefined
        };
        this.srv = {
            base: ServiceInjector.get(PopBaseService),
            credential: ServiceInjector.get(PopCredentialService),
            menu: ServiceInjector.get(PopMenuService),
            router: ServiceInjector.get(Router),
        };
        this.dom.configure = () => {
            // this component set the outer height boundary of this view
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                yield Promise.all([
                    this._setInitialConfig()
                ]);
                return resolve(true);
            }));
        };
        this.dom.proceed = () => {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                if (!this.dom.state.checkedContent && this.mmNavRef) {
                    this.onUpdateMenus();
                    this.dom.state.checkedContent = true;
                }
                return resolve(true);
            }));
        };
    }
    ngOnInit() {
        super.ngOnInit();
    }
    /**
     * The user click to a app nav menu
     * @param appPath
     */
    onChangeApp(appPath) {
        if (isDevMode() && IsString(PopHref)) { // Auto Login/Logout since there is no access to the prime-user-app
            if (appPath === '/login') {
                if (PopEnv.username && PopEnv.password) {
                    PopTemplate.lookBusy(30);
                    this.srv.credential.authenticate({
                        username: PopEnv.username,
                        password: PopEnv.password
                    }).then((auth) => {
                        if (IsObject(auth, true)) {
                            return window.location.reload();
                        }
                        else {
                            PopTemplate.error({ message: String(auth), code: 500 });
                        }
                    });
                }
            }
            else if (appPath === '/logout') {
                PopTemplate.goodbye();
                setTimeout(() => {
                    this.srv.credential.clear().subscribe(() => {
                        this.srv.base.switchApps(`/` + (IsString(PopHref, true) ? PopHref : ''));
                    });
                }, 0);
            }
            else {
                PopTemplate.notify(`You Shall not Pass! Actually this link will take you to nowhere, so its been disabled.`);
            }
        }
        else {
            this.srv.base.switchApps(appPath);
        }
    }
    /**
     * Temporary fx to help test if the menu can auto update itself to external changes
     */
    onAuthVerification() {
        PopTemplate.verify();
    }
    /**
     * A user can select from a list of businesses that their prime user has access to
     * @param appPath
     */
    onChangeBusiness(id) {
        let slugs = window.location.href.split(PopHref + '/').pop().trim();
        slugs = slugs.split('/');
        slugs = slugs.slice(0, 1);
        const path = slugs.join('/');
        const redirect = `${window.location.origin}/${PopHref}/${slugs.join('/')}`;
        const originalRoute = IsObject(PopAliasRouteMap, true) && path in PopAliasRouteMap ? PopAliasRouteMap[path] : null;
        SetSiteVar('App.redirect', (originalRoute ? originalRoute : redirect));
        this.srv.menu.changeBusiness(id);
    }
    /**
     * Determine the presentation of the nav menus
     */
    onUpdateMenus() {
        if (!this.dom.state.authenticated) {
            this.ui.menus.all = [];
            this.ui.menus.more = [];
        }
        else {
            const moreMenus = [];
            let talliedMenuSize = 0;
            const children = this.mmNavRef.nativeElement.children;
            const maxWidth = this.mmNavRef.nativeElement.offsetWidth - 15;
            for (let i = 0; i < children.length; i++) {
                talliedMenuSize += children[i].offsetWidth;
                if (talliedMenuSize < maxWidth) {
                    children[i].style.visibility = 'visible';
                }
                else {
                    children[i].style.visibility = '';
                    moreMenus.push(this.ui.menus.all[i]);
                }
            }
            this.ui.menus.more = moreMenus;
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
    /**
     * Set the initial config for this component
     * @private
     */
    _setInitialConfig() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            this.dom.active.path = `/${window.location.pathname.split('/')[1]}`;
            this.dom.active.business = undefined;
            this.dom.state.authenticated = false;
            this.dom.state.checkedContent = false;
            this.dom.state.isDevMode = isDevMode();
            this._initialize();
            this.dom.setSubscriber('init', this.APP_GLOBAL.init.subscribe((val) => {
                if (val) {
                    this.dom.setTimeout(`init`, () => {
                        this._initialize();
                    }, 100);
                }
            }));
            return resolve(true);
        }));
    }
    /**
     * Initialize the component
     * This is designed so that at any time a verification event can be fired from the Initializer module, and the menu can respond to the business(app)s that is stored in the new Auth Token
     * Future:  A web socket will be able to detect a change in security+access of apps and trigger the menu to auto update
     */
    _initialize() {
        this.dom.state.authenticated = this.srv.menu.isAuthenticated();
        this.ui.user = this.srv.base.getAuthPrimeUser();
        this._loadBusiness();
        setTimeout(() => {
            this.onUpdateMenus();
        }, 0);
    }
    /**
     * Set the menus for the current business, apps across the top
     * @param business
     */
    _loadBusiness() {
        // Token details should contain all the info to populate the menu bar.
        const businesses = this.srv.base.getAuthBusinesses();
        if (IsObject(businesses, true) && !(ObjectsMatch(this.asset.existingBusinesses, businesses))) { // check to see if an update is really required
            this.asset.existingBusinesses = businesses;
            // Set non-business unit stuff.
            // Get the current buId from onSession storage.
            const businessId = this.srv.base.getCurrentBusinessId();
            this.ui.alternate_businesses = [];
            // If a business unit has been found then populate the necessary objects.
            if (businessId) {
                Object.keys(businesses).map((buId) => {
                    const business = businesses[buId];
                    if (business.id === businessId) {
                        this.dom.active.business = {
                            id: business.id,
                            name: business.name,
                            short_name: business.short_name,
                            logo_main_url: business.logo_main_url,
                            logo_small_url: business.logo_small_url,
                        };
                        this._setBusinessAppMenus(business);
                    }
                    else {
                        this.ui.alternate_businesses.push({
                            id: business.id,
                            name: business.name,
                            short_name: business.short_name,
                            logo_main_url: business.logo_main_url,
                            logo_small_url: business.logo_small_url,
                        });
                    }
                });
            }
        }
    }
    /**
     * This set the nav menu across the top of template
     * @param business
     */
    _setBusinessAppMenus(business) {
        if (business) {
            if (IsArray(business.apps, true)) {
                this.ui.menus.all = business.apps.filter((app) => {
                    return +app.active;
                }).sort(function (a, b) {
                    if (a.sort < b.sort)
                        return -1;
                    if (a.sort > b.sort)
                        return 1;
                    return 0;
                }).map((app) => {
                    return this._extractAppMenu(app);
                });
            }
            else if (IsObject(business.apps, true)) {
                this.ui.menus.all = Object.keys(business.apps).map((appKey) => {
                    return this._extractAppMenu(business.apps[appKey]);
                });
            }
        }
    }
    /**
     * This fx will extract the necessary data out of the app data
     * @param app
     * @private
     */
    _extractAppMenu(app) {
        return {
            name: app.label ? app.label : app.name,
            path: `/${String(app.name).toLowerCase()}`,
            description: '',
            short_description: '',
            sort: app.sort,
            icon: '',
        };
    }
}
PopMenuComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-menu',
                template: "<div class=\"mm-sticky-container\" (window:resize)=\"onUpdateMenus()\">\n  <!-- User Not Logged In -->\n  <div *ngIf=\"!dom.state.authenticated\" class=\"mm-container pt-bg-1\">\n    <div class=\"mm-bu\">\n      <div class=\"mm-bu-selected\">\n        <a href=\"/public/\" onclick=\"window.location.reload()\">PopCX</a>\n      </div>\n    </div>\n\n    <div class=\"mm-public\">\n      <div class=\"mm-buttons\">\n        <button mat-raised-button (click)=\"onChangeApp('/login')\" role=\"button\">Login</button>\n      </div>\n      <div class=\"mm-buttons\">\n        <button mat-raised-button (click)=\"onChangeApp('/signup')\" role=\"button\">Sign Up</button>\n      </div>\n    </div>\n\n  </div>\n\n  <!-- User Logged In -->\n  <div class=\"mm-container pt-bg-1\" [ngClass]=\"{'sw-hidden': !dom.state.authenticated}\">\n\n    <div *ngIf=\"!dom.active.business\" class=\"mm-bu\">\n      <div class=\"mm-bu-selected\">\n        <a onclick=\"window.location.reload()\">Welcome to PopCX</a>\n      </div>\n    </div>\n\n    <div *ngIf=\"dom.active.business\" class=\"mm-bu active-business\" >\n      <div *ngIf=\"ui.alternate_businesses.length\" [matMenuTriggerFor]=\"businessUnitMenu\" class=\"mm-bu-more\" >\n        <img *ngIf=\"dom.active.business.logo_main_url\" class=\"mm-bu-selected-img\" src=\"{{dom.active.business.logo_main_url}}\">\n        <span *ngIf=\"!dom.active.business.logo_main_url\" class=\"mm-bu-selected\">{{dom.active.business.name}}</span>\n        <mat-menu #businessUnitMenu=\"matMenu\" [overlapTrigger]=\"false\" class=\"mm-bu-list\">\n          <div *ngFor=\"let business of ui.alternate_businesses\" (click)=\"onChangeBusiness(business.id)\">\n            <img *ngIf=\"business.logo_main_url\" class=\"mm-nav-item-img\" src=\"{{business.logo_main_url}}\">\n            <span *ngIf=\"!business.logo_main_url\" class=\"mm-bu-list-item\">{{business.name}}</span>\n          </div>\n        </mat-menu>\n      </div>\n      <div *ngIf=\"!ui.alternate_businesses.length\">\n        <img *ngIf=\"dom.active.business.logo_main_url\" class=\"mm-bu-selected-img\" src=\"{{dom.active.business.logo_main_url}}\">\n        <span *ngIf=\"!dom.active.business.logo_main_url\" class=\"mm-bu-selected\">{{dom.active.business.name}}</span>\n      </div>\n    </div>\n\n\n\n    <div class=\"mm-nav\" #mmNavRef>\n      <div *ngFor=\"let menu of ui.menus.all\" class=\"mm-nav-item-hidden\">\n        <!-- Fake Div is here to stablize the nav buttons so they do not expand in size when hover trasition is applied-     -->\n        <div class=\"mm-nav-item-fake\"><span>{{menu.name}}</span></div>\n        <div class=\"mm-nav-item mat-h4\" [ngClass]=\"{'mm-nav-item-active' : menu.path == dom.active.path}\" (click)=\"onChangeApp(menu.path)\">\n          <span >{{menu.name}}</span>\n        </div>\n      </div>\n    </div>\n\n    <div class=\"mm-misc\" >\n      <div *ngIf=\"ui.menus.more.length\">\n        <div class=\"mm-misc-more\" [matMenuTriggerFor]=\"moreMenus\">\n          <mat-icon>more_vert</mat-icon>\n        </div>\n        <mat-menu #moreMenus=\"matMenu\" [overlapTrigger]=\"false\" class=\"\">\n          <div *ngFor=\"let menu of ui.menus.more\" class=\"\" (click)=\"onChangeApp(menu.path)\">\n            <span class=\"mm-more-menu-item\">{{menu.name}}</span>\n          </div>\n        </mat-menu>\n      </div>\n\n\n      <div class=\"search-control mm-misc\">\n        <div >\n          <mat-form-field class=\"sw-search\" appearance=\"outline\" >\n            <span matPrefix class=\"search-icon\">\n              <mat-icon>search</mat-icon>\n            </span>\n            <input  matInput placeholder=\"Search\">\n          </mat-form-field>\n        </div>\n      </div>\n\n      <mat-icon class=\"mm-misc-notification\">notifications</mat-icon>\n    </div>\n\n    <div class=\"mm-profile\" [matMenuTriggerFor]=\"profileMenu\" >\n\n      <div class=\"mm-profile-avatar\" *ngIf=\"ui.user\">\n        <img *ngIf=\"ui.user.avatarLink\" class=\"mm-avatar-img\" [src]=\"ui.user.avatarLink\"/>\n        <div *ngIf=\"!ui.user.avatarLink\" class=\"sw-circle-ID\">\n          {{ui.user.initials}}\n        </div>\n      </div>\n\n      <mat-menu #profileMenu=\"matMenu\" [overlapTrigger]=\"false\" class=\"mm-profile-menu\">\n        <!--<div *ngIf=\"dom.state.isDevMode\" class=\"mm-profile-list-item\" (click)=\"onAuthVerification();\">Verify Auth (Temp)</div>-->\n        <div class=\"mm-profile-list-item\" (click)=\"onChangeApp('/user/profile');\">Profile</div>\n        <div class=\"mm-profile-list-item\" (click)=\"onChangeApp('/logout');\">Logout</div>\n      </mat-menu>\n    </div>\n\n  </div>\n</div>\n",
                styles: [".mm-sticky-container{position:fixed;width:100%;z-index:111}.mm-buttons{margin-right:10px}.mm-container{display:flex;flex-wrap:nowrap;justify-content:center;align-items:center;height:48px;margin:0;color:var(--background-base)}.search-icon{color:var(--foreground-base)}.mm-container a{color:var(--background-base)}.mm-public{order:2;flex:1 1 auto;justify-content:flex-end;padding-right:10px}.mm-bu,.mm-public{height:100%;align-items:center;display:inline-flex}.mm-bu{flex:0 0 257px;width:257px;overflow:hidden;flex-wrap:nowrap;justify-content:left;background-color:var(--primary-700);border-bottom:1px solid;border-bottom-color:var(--disabled);border-right:1px solid;border-right-color:var(--disabled);box-sizing:border-box}.active-business,.mm-profile{border:1px ridge var(--primary)}.mm-bu-selected{display:inline-block;font-size:16px;line-height:95%;padding:0 20px;padding:0 0 0 var(--gap-m);color:#fff}.mm-bu-selected a{text-decoration:none}.mat-icon,.mm-bu,.mm-profile-text{transition:font-weight .4s,color .4s;-webkit-transition:font-weight .4s,color .4s}.mm-bu-more{cursor:pointer;height:100%;display:flex;align-items:center}.mm-bu-selected-img{width:216px;padding:0 20px}.mm-bu-list-item,.mm-profile-list-item{width:216px}.mm-bu-list-item,.mm-more-menu-item,.mm-profile-list-item{display:block;padding:10px 20px;font-size:1rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:font-weight .4s,background-color .4s}.mm-bu-list-item:hover,.mm-more-menu-item:hover,.mm-nav-item-img:hover,.mm-profile-list-item:hover{font-weight:500;background-color:var(--darken1);cursor:pointer}.mm-nav{display:flex;flex:1 1 auto;height:100%;align-items:center;overflow:hidden;white-space:nowrap;background-color:var(--background-main-menu);border-bottom:1px solid;border-bottom-color:var(--disabled);box-sizing:border-box}.mm-nav-item{text-align:left;padding:15px 0 15px var(--gap-lm);white-space:nowrap;cursor:pointer;transition:font-weight .4s,color .4s;color:var(--foreground-base)}.mm-nav-item-hidden{visibility:hidden}.mm-nav-item-fake{margin-top:-20px;font-size:1.1rem;padding-left:15px;padding-right:15px;white-space:nowrap;font-weight:500;visibility:hidden}.mm-nav-item-img{width:216px;padding:6px 20px;display:block;transition:background-color 1s}.mm-nav-item-active{color:var(--primary);font-weight:700}.mm-nav-item:hover{font-weight:700}.mm-nav-item:active{font-weight:500;color:var(--primary-700)}.mm-misc{height:100%;display:flex;flex-wrap:nowrap;justify-content:flex-end;align-items:center;background-color:var(--background-main-menu);color:var(--text-2);border-bottom:1px solid;border-bottom-color:var(--disabled);box-sizing:border-box}.mm-misc-notification{font-size:1.25rem;text-align:right;padding:5px var(--gap-m) 0 0;cursor:pointer}.mm-misc-more{display:flex;align-items:center;height:48px;padding-right:10px;cursor:pointer}.mm-misc-more .mat-icon{font-size:2.3em;cursor:pointer;margin-bottom:10px}.mm-profile{max-width:80px;height:100%;display:flex;flex-wrap:nowrap;justify-content:flex-end;align-items:center;cursor:pointer;background-color:var(--primary-700);box-sizing:border-box}.mm-profile-text{width:137px;font-size:1rem;flex:1 1 auto;padding-left:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.mm-profile-avatar{display:flex;align-items:center;justify-content:center;width:40px;height:40px;overflow:hidden;background-color:var(--disabled);border-radius:50%;margin:0 var(--gap-m)}.mm-profile-avatar path{fill:var(--primary-text)}.mm-avatar-img{max-width:50px;max-height:50px;border-radius:50%}.mm-profile-menu{display:flex;flex-direction:column}.mm-line-break{flex:none;width:1px;background-color:var(--lighten-50);height:65%}.search-control{flex-grow:0.5;padding-right:var(--gap-lm);border-bottom:0!important}:host ::ng-deep .search-control .mat-form-field .mat-form-field-infix{width:200px}"]
            },] }
];
PopMenuComponent.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: ['APP_GLOBAL',] }] }
];
PopMenuComponent.propDecorators = {
    mmNavRef: [{ type: ViewChild, args: ['mmNavRef',] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLW1lbnUuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvYXBwL3BvcC1tZW51L3BvcC1tZW51LmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFDLFNBQVMsRUFBRSxNQUFNLEVBQVUsU0FBUyxFQUFjLFNBQVMsRUFBWSxNQUFNLGVBQWUsQ0FBQztBQUNyRyxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sb0NBQW9DLENBQUM7QUFFbEUsT0FBTyxFQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUMsTUFBTSw2QkFBNkIsQ0FBQztBQUNsRyxPQUFPLEVBR0wsZ0JBQWdCLEVBQ2hCLE1BQU0sRUFDTixPQUFPLEVBQ1AsV0FBVyxFQUNYLGVBQWUsRUFDaEIsTUFBTSwyQkFBMkIsQ0FBQztBQUNuQyxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFDbEQsT0FBTyxFQUFDLG9CQUFvQixFQUFDLE1BQU0sMENBQTBDLENBQUM7QUFDOUUsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sK0JBQStCLENBQUM7QUFDakUsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBUXZDLE1BQU0sT0FBTyxnQkFBaUIsU0FBUSxrQkFBa0I7SUF5QnRELFlBQ2dDLFVBQThCO1FBRTVELEtBQUssRUFBRSxDQUFDO1FBRnNCLGVBQVUsR0FBVixVQUFVLENBQW9CO1FBeEJ2RCxTQUFJLEdBQUcsa0JBQWtCLENBQUM7UUFHdkIsVUFBSyxHQUFHO1lBQ2hCLGtCQUFrQixFQUFvQixTQUFTO1NBQ2hELENBQUM7UUFFSyxPQUFFLEdBQUc7WUFDVixvQkFBb0IsRUFBUyxFQUFFO1lBQy9CLEtBQUssRUFBRTtnQkFDTCxHQUFHLEVBQVMs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RSxFQUFFO1lBQ3JCLElBQUksRUFBRSxHQUFHLENBQUMsSUFBSTtZQUNkLElBQUksRUFBRSxFQUFFO1NBQ1QsQ0FBQztJQUNKLENBQUM7OztZQTlSRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLGNBQWM7Z0JBQ3hCLCtpSkFBd0M7O2FBRXpDOzs7NENBMkJJLE1BQU0sU0FBQyxZQUFZOzs7dUJBekJyQixTQUFTLFNBQUMsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q29tcG9uZW50LCBJbmplY3QsIE9uSW5pdCwgVmlld0NoaWxkLCBFbGVtZW50UmVmLCBpc0Rldk1vZGUsIE9uRGVzdHJveX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge1BvcEJhc2VTZXJ2aWNlfSBmcm9tICcuLi8uLi8uLi9zZXJ2aWNlcy9wb3AtYmFzZS5zZXJ2aWNlJztcbmltcG9ydCB7QXBwLCBBcHBNZW51LCBCdXNpbmVzcywgQXV0aERldGFpbHMsIEF1dGhVc2VyfSBmcm9tICcuLi8uLi8uLi9wb3AtY29tbW9uLXRva2VuLm1vZGVsJztcbmltcG9ydCB7SXNBcnJheSwgSXNPYmplY3QsIElzU3RyaW5nLCBPYmplY3RzTWF0Y2gsIFNldFNpdGVWYXJ9IGZyb20gJy4uLy4uLy4uL3BvcC1jb21tb24tdXRpbGl0eSc7XG5pbXBvcnQge1xuICBBcHBHbG9iYWxJbnRlcmZhY2UsXG4gIEtleU1hcCxcbiAgUG9wQWxpYXNSb3V0ZU1hcCxcbiAgUG9wRW52LFxuICBQb3BIcmVmLFxuICBQb3BUZW1wbGF0ZSxcbiAgU2VydmljZUluamVjdG9yXG59IGZyb20gJy4uLy4uLy4uL3BvcC1jb21tb24ubW9kZWwnO1xuaW1wb3J0IHtQb3BNZW51U2VydmljZX0gZnJvbSAnLi9wb3AtbWVudS5zZXJ2aWNlJztcbmltcG9ydCB7UG9wQ3JlZGVudGlhbFNlcnZpY2V9IGZyb20gJy4uLy4uLy4uL3NlcnZpY2VzL3BvcC1jcmVkZW50aWFsLnNlcnZpY2UnO1xuaW1wb3J0IHtQb3BFeHRlbmRDb21wb25lbnR9IGZyb20gJy4uLy4uLy4uL3BvcC1leHRlbmQuY29tcG9uZW50JztcbmltcG9ydCB7Um91dGVyfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xuXG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2xpYi1wb3AtbWVudScsXG4gIHRlbXBsYXRlVXJsOiAnLi9wb3AtbWVudS5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWycuL3BvcC1tZW51LmNvbXBvbmVudC5zY3NzJ11cbn0pXG5leHBvcnQgY2xhc3MgUG9wTWVudUNvbXBvbmVudCBleHRlbmRzIFBvcEV4dGVuZENvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcbiAgQFZpZXdDaGlsZCgnbW1OYXZSZWYnKSBtbU5hdlJlZjogRWxlbWVudFJlZjtcbiAgcHVibGljIG5hbWUgPSAnUG9wTWVudUNvbXBvbmVudCc7XG5cblxuICBwcm90ZWN0ZWQgYXNzZXQgPSB7XG4gICAgZXhpc3RpbmdCdXNpbmVzc2VzOiA8S2V5TWFwPEJ1c2luZXNzPj51bmRlZmluZWRcbiAgfTtcblxuICBwdWJsaWMgdWkgPSB7XG4gICAgYWx0ZXJuYXRlX2J1c2luZXNzZXM6IDxhbnlbXT5bXSxcbiAgICBtZW51czoge1xuICAgICAgYWxsOiA8YW55W10+W10sXG4gICAgICBtb3JlOiA8YW55W10+W11cbiAgICB9LFxuICAgIHVzZXI6IDxBdXRoVXNlcj51bmRlZmluZWRcbiAgfTtcblxuICBwcm90ZWN0ZWQgc3J2ID0ge1xuICAgIGJhc2U6IDxQb3BCYXNlU2VydmljZT5TZXJ2aWNlSW5qZWN0b3IuZ2V0KFBvcEJhc2VTZXJ2aWNlKSxcbiAgICBjcmVkZW50aWFsOiA8UG9wQ3JlZGVudGlhbFNlcnZpY2U+U2VydmljZUluamVjdG9yLmdldChQb3BDcmVkZW50aWFsU2VydmljZSksXG4gICAgbWVudTogPFBvcE1lbnVTZXJ2aWNlPlNlcnZpY2VJbmplY3Rvci5nZXQoUG9wTWVudVNlcnZpY2UpLFxuICAgIHJvdXRlcjogPFJvdXRlcj5TZXJ2aWNlSW5qZWN0b3IuZ2V0KFJvdXRlciksXG4gIH07XG5cbiAgY29uc3RydWN0b3IoXG4gICAgQEluamVjdCgnQVBQX0dMT0JBTCcpIHByaXZhdGUgQVBQX0dMT0JBTDogQXBwR2xvYmFsSW50ZXJmYWNlLFxuICApIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5kb20uY29uZmlndXJlID0gKCk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuXG4gICAgICAvLyB0aGlzIGNvbXBvbmVudCBzZXQgdGhlIG91dGVyIGhlaWdodCBib3VuZGFyeSBvZiB0aGlzIHZpZXdcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZShhc3luYyAocmVzb2x2ZSkgPT4ge1xuICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgICAgdGhpcy5fc2V0SW5pdGlhbENvbmZpZygpXG4gICAgICAgIF0pO1xuICAgICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICB0aGlzLmRvbS5wcm9jZWVkID0gKCk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jIChyZXNvbHZlKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5kb20uc3RhdGUuY2hlY2tlZENvbnRlbnQgJiYgdGhpcy5tbU5hdlJlZikge1xuICAgICAgICAgIHRoaXMub25VcGRhdGVNZW51cygpO1xuICAgICAgICAgIHRoaXMuZG9tLnN0YXRlLmNoZWNrZWRDb250ZW50ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH0pO1xuICAgIH07XG4gIH1cblxuXG4gIG5nT25Jbml0KCkge1xuICAgIHN1cGVyLm5nT25Jbml0KCk7XG4gIH1cblxuXG5cbiAgLyoqXG4gICAqIFRoZSB1c2VyIGNsaWNrIHRvIGEgYXBwIG5hdiBtZW51XG4gICAqIEBwYXJhbSBhcHBQYXRoXG4gICAqL1xuICBvbkNoYW5nZUFwcChhcHBQYXRoOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoaXNEZXZNb2RlKCkgJiYgSXNTdHJpbmcoUG9wSHJlZikpIHsgLy8gQXV0byBMb2dpbi9Mb2dvdXQgc2luY2UgdGhlcmUgaXMgbm8gYWNjZXNzIHRvIHRoZSBwcmltZS11c2VyLWFwcFxuICAgICAgaWYgKGFwcFBhdGggPT09ICcvbG9naW4nKSB7XG4gICAgICAgIGlmIChQb3BFbnYudXNlcm5hbWUgJiYgUG9wRW52LnBhc3N3b3JkKSB7XG4gICAgICAgICAgUG9wVGVtcGxhdGUubG9va0J1c3koMzApO1xuICAgICAgICAgIHRoaXMuc3J2LmNyZWRlbnRpYWwuYXV0aGVudGljYXRlKHtcbiAgICAgICAgICAgIHVzZXJuYW1lOiBQb3BFbnYudXNlcm5hbWUsXG4gICAgICAgICAgICBwYXNzd29yZDogUG9wRW52LnBhc3N3b3JkXG4gICAgICAgICAgfSkudGhlbigoYXV0aDogQXV0aERldGFpbHMpID0+IHtcbiAgICAgICAgICAgIGlmIChJc09iamVjdChhdXRoLCB0cnVlKSkge1xuICAgICAgICAgICAgICByZXR1cm4gd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgUG9wVGVtcGxhdGUuZXJyb3Ioe21lc3NhZ2U6IFN0cmluZyhhdXRoKSwgY29kZTogNTAwfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoYXBwUGF0aCA9PT0gJy9sb2dvdXQnKSB7XG4gICAgICAgIFBvcFRlbXBsYXRlLmdvb2RieWUoKTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgdGhpcy5zcnYuY3JlZGVudGlhbC5jbGVhcigpLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNydi5iYXNlLnN3aXRjaEFwcHMoYC9gICsgKElzU3RyaW5nKFBvcEhyZWYsIHRydWUpID8gUG9wSHJlZiA6ICcnKSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sIDApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgUG9wVGVtcGxhdGUubm90aWZ5KGBZb3UgU2hhbGwgbm90IFBhc3MhIEFjdHVhbGx5IHRoaXMgbGluayB3aWxsIHRha2UgeW91IHRvIG5vd2hlcmUsIHNvIGl0cyBiZWVuIGRpc2FibGVkLmApO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNydi5iYXNlLnN3aXRjaEFwcHMoYXBwUGF0aCk7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogVGVtcG9yYXJ5IGZ4IHRvIGhlbHAgdGVzdCBpZiB0aGUgbWVudSBjYW4gYXV0byB1cGRhdGUgaXRzZWxmIHRvIGV4dGVybmFsIGNoYW5nZXNcbiAgICovXG4gIG9uQXV0aFZlcmlmaWNhdGlvbigpIHtcbiAgICBQb3BUZW1wbGF0ZS52ZXJpZnkoKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEEgdXNlciBjYW4gc2VsZWN0IGZyb20gYSBsaXN0IG9mIGJ1c2luZXNzZXMgdGhhdCB0aGVpciBwcmltZSB1c2VyIGhhcyBhY2Nlc3MgdG9cbiAgICogQHBhcmFtIGFwcFBhdGhcbiAgICovXG4gIG9uQ2hhbmdlQnVzaW5lc3MoaWQ6IG51bWJlcik6IHZvaWQge1xuICAgIGxldCBzbHVncyA9IDxhbnk+d2luZG93LmxvY2F0aW9uLmhyZWYuc3BsaXQoUG9wSHJlZiArICcvJykucG9wKCkudHJpbSgpO1xuICAgIHNsdWdzID0gPHN0cmluZ1tdPnNsdWdzLnNwbGl0KCcvJyk7XG4gICAgc2x1Z3MgPSBzbHVncy5zbGljZSgwLCAxKTtcbiAgICBjb25zdCBwYXRoID0gc2x1Z3Muam9pbignLycpO1xuICAgIGNvbnN0IHJlZGlyZWN0ID0gYCR7d2luZG93LmxvY2F0aW9uLm9yaWdpbn0vJHtQb3BIcmVmfS8ke3NsdWdzLmpvaW4oJy8nKX1gO1xuICAgIGNvbnN0IG9yaWdpbmFsUm91dGUgPSBJc09iamVjdChQb3BBbGlhc1JvdXRlTWFwLCB0cnVlKSAmJiBwYXRoIGluIFBvcEFsaWFzUm91dGVNYXAgPyBQb3BBbGlhc1JvdXRlTWFwW3BhdGhdIDogbnVsbDtcbiAgICBTZXRTaXRlVmFyKCdBcHAucmVkaXJlY3QnLCAob3JpZ2luYWxSb3V0ZSA/IG9yaWdpbmFsUm91dGUgOiByZWRpcmVjdCkpO1xuICAgIHRoaXMuc3J2Lm1lbnUuY2hhbmdlQnVzaW5lc3MoaWQpO1xuICB9XG5cblxuICAvKipcbiAgICogRGV0ZXJtaW5lIHRoZSBwcmVzZW50YXRpb24gb2YgdGhlIG5hdiBtZW51c1xuICAgKi9cbiAgb25VcGRhdGVNZW51cygpIHtcbiAgICBpZiAoIXRoaXMuZG9tLnN0YXRlLmF1dGhlbnRpY2F0ZWQpIHtcbiAgICAgIHRoaXMudWkubWVudXMuYWxsID0gW107XG4gICAgICB0aGlzLnVpLm1lbnVzLm1vcmUgPSBbXTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgbW9yZU1lbnVzID0gW107XG4gICAgICBsZXQgdGFsbGllZE1lbnVTaXplID0gMDtcbiAgICAgIGNvbnN0IGNoaWxkcmVuID0gdGhpcy5tbU5hdlJlZi5uYXRpdmVFbGVtZW50LmNoaWxkcmVuO1xuICAgICAgY29uc3QgbWF4V2lkdGggPSB0aGlzLm1tTmF2UmVmLm5hdGl2ZUVsZW1lbnQub2Zmc2V0V2lkdGggLSAxNTtcblxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICB0YWxsaWVkTWVudVNpemUgKz0gY2hpbGRyZW5baV0ub2Zmc2V0V2lkdGg7XG4gICAgICAgIGlmICh0YWxsaWVkTWVudVNpemUgPCBtYXhXaWR0aCkge1xuICAgICAgICAgIGNoaWxkcmVuW2ldLnN0eWxlLnZpc2liaWxpdHkgPSAndmlzaWJsZSc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2hpbGRyZW5baV0uc3R5bGUudmlzaWJpbGl0eSA9ICcnO1xuICAgICAgICAgIG1vcmVNZW51cy5wdXNoKHRoaXMudWkubWVudXMuYWxsW2ldKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLnVpLm1lbnVzLm1vcmUgPSBtb3JlTWVudXM7XG4gICAgfVxuICB9XG5cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICBzdXBlci5uZ09uRGVzdHJveSgpO1xuICB9XG5cblxuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFVuZGVyIFRoZSBIb29kICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICggUHJpdmF0ZSBNZXRob2QgKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIGluaXRpYWwgY29uZmlnIGZvciB0aGlzIGNvbXBvbmVudFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcHJpdmF0ZSBfc2V0SW5pdGlhbENvbmZpZygpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgKHJlc29sdmUpID0+IHtcblxuICAgICAgdGhpcy5kb20uYWN0aXZlLnBhdGggPSBgLyR7d2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnNwbGl0KCcvJylbMV19YDtcbiAgICAgIHRoaXMuZG9tLmFjdGl2ZS5idXNpbmVzcyA9IDxCdXNpbmVzcz51bmRlZmluZWQ7XG4gICAgICB0aGlzLmRvbS5zdGF0ZS5hdXRoZW50aWNhdGVkID0gZmFsc2U7XG4gICAgICB0aGlzLmRvbS5zdGF0ZS5jaGVja2VkQ29udGVudCA9IGZhbHNlO1xuICAgICAgdGhpcy5kb20uc3RhdGUuaXNEZXZNb2RlID0gaXNEZXZNb2RlKCk7XG5cbiAgICAgIHRoaXMuX2luaXRpYWxpemUoKTtcblxuICAgICAgdGhpcy5kb20uc2V0U3Vic2NyaWJlcignaW5pdCcsIHRoaXMuQVBQX0dMT0JBTC5pbml0LnN1YnNjcmliZSgodmFsOiBib29sZWFuKSA9PiB7XG4gICAgICAgIGlmICh2YWwpIHtcbiAgICAgICAgICB0aGlzLmRvbS5zZXRUaW1lb3V0KGBpbml0YCwgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5faW5pdGlhbGl6ZSgpO1xuICAgICAgICAgIH0sIDEwMCk7XG4gICAgICAgIH1cbiAgICAgIH0pKTtcbiAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemUgdGhlIGNvbXBvbmVudFxuICAgKiBUaGlzIGlzIGRlc2lnbmVkIHNvIHRoYXQgYXQgYW55IHRpbWUgYSB2ZXJpZmljYXRpb24gZXZlbnQgY2FuIGJlIGZpcmVkIGZyb20gdGhlIEluaXRpYWxpemVyIG1vZHVsZSwgYW5kIHRoZSBtZW51IGNhbiByZXNwb25kIHRvIHRoZSBidXNpbmVzcyhhcHApcyB0aGF0IGlzIHN0b3JlZCBpbiB0aGUgbmV3IEF1dGggVG9rZW5cbiAgICogRnV0dXJlOiAgQSB3ZWIgc29ja2V0IHdpbGwgYmUgYWJsZSB0byBkZXRlY3QgYSBjaGFuZ2UgaW4gc2VjdXJpdHkrYWNjZXNzIG9mIGFwcHMgYW5kIHRyaWdnZXIgdGhlIG1lbnUgdG8gYXV0byB1cGRhdGVcbiAgICovXG4gIHByaXZhdGUgX2luaXRpYWxpemUoKSB7XG4gICAgdGhpcy5kb20uc3RhdGUuYXV0aGVudGljYXRlZCA9IHRoaXMuc3J2Lm1lbnUuaXNBdXRoZW50aWNhdGVkKCk7XG4gICAgdGhpcy51aS51c2VyID0gdGhpcy5zcnYuYmFzZS5nZXRBdXRoUHJpbWVVc2VyKCk7XG4gICAgdGhpcy5fbG9hZEJ1c2luZXNzKCk7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLm9uVXBkYXRlTWVudXMoKTtcbiAgICB9LCAwKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFNldCB0aGUgbWVudXMgZm9yIHRoZSBjdXJyZW50IGJ1c2luZXNzLCBhcHBzIGFjcm9zcyB0aGUgdG9wXG4gICAqIEBwYXJhbSBidXNpbmVzc1xuICAgKi9cbiAgcHJpdmF0ZSBfbG9hZEJ1c2luZXNzKCk6IHZvaWQge1xuICAgIC8vIFRva2VuIGRldGFpbHMgc2hvdWxkIGNvbnRhaW4gYWxsIHRoZSBpbmZvIHRvIHBvcHVsYXRlIHRoZSBtZW51IGJhci5cbiAgICBjb25zdCBidXNpbmVzc2VzID0gdGhpcy5zcnYuYmFzZS5nZXRBdXRoQnVzaW5lc3NlcygpO1xuICAgIGlmIChJc09iamVjdChidXNpbmVzc2VzLCB0cnVlKSAmJiAhKE9iamVjdHNNYXRjaCh0aGlzLmFzc2V0LmV4aXN0aW5nQnVzaW5lc3NlcywgYnVzaW5lc3NlcykpKSB7IC8vIGNoZWNrIHRvIHNlZSBpZiBhbiB1cGRhdGUgaXMgcmVhbGx5IHJlcXVpcmVkXG4gICAgICB0aGlzLmFzc2V0LmV4aXN0aW5nQnVzaW5lc3NlcyA9IGJ1c2luZXNzZXM7XG4gICAgICAvLyBTZXQgbm9uLWJ1c2luZXNzIHVuaXQgc3R1ZmYuXG4gICAgICAvLyBHZXQgdGhlIGN1cnJlbnQgYnVJZCBmcm9tIG9uU2Vzc2lvbiBzdG9yYWdlLlxuICAgICAgY29uc3QgYnVzaW5lc3NJZCA9IHRoaXMuc3J2LmJhc2UuZ2V0Q3VycmVudEJ1c2luZXNzSWQoKTtcbiAgICAgIHRoaXMudWkuYWx0ZXJuYXRlX2J1c2luZXNzZXMgPSBbXTtcbiAgICAgIC8vIElmIGEgYnVzaW5lc3MgdW5pdCBoYXMgYmVlbiBmb3VuZCB0aGVuIHBvcHVsYXRlIHRoZSBuZWNlc3Nhcnkgb2JqZWN0cy5cbiAgICAgIGlmIChidXNpbmVzc0lkKSB7XG4gICAgICAgIE9iamVjdC5rZXlzKGJ1c2luZXNzZXMpLm1hcCgoYnVJZCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGJ1c2luZXNzID0gYnVzaW5lc3Nlc1tidUlkXTtcbiAgICAgICAgICBpZiAoYnVzaW5lc3MuaWQgPT09IGJ1c2luZXNzSWQpIHtcbiAgICAgICAgICAgIHRoaXMuZG9tLmFjdGl2ZS5idXNpbmVzcyA9IDxCdXNpbmVzcz57XG4gICAgICAgICAgICAgIGlkOiBidXNpbmVzcy5pZCxcbiAgICAgICAgICAgICAgbmFtZTogYnVzaW5lc3MubmFtZSxcbiAgICAgICAgICAgICAgc2hvcnRfbmFtZTogYnVzaW5lc3Muc2hvcnRfbmFtZSxcbiAgICAgICAgICAgICAgbG9nb19tYWluX3VybDogYnVzaW5lc3MubG9nb19tYWluX3VybCxcbiAgICAgICAgICAgICAgbG9nb19zbWFsbF91cmw6IGJ1c2luZXNzLmxvZ29fc21hbGxfdXJsLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRoaXMuX3NldEJ1c2luZXNzQXBwTWVudXMoYnVzaW5lc3MpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnVpLmFsdGVybmF0ZV9idXNpbmVzc2VzLnB1c2goe1xuICAgICAgICAgICAgICBpZDogYnVzaW5lc3MuaWQsXG4gICAgICAgICAgICAgIG5hbWU6IGJ1c2luZXNzLm5hbWUsXG4gICAgICAgICAgICAgIHNob3J0X25hbWU6IGJ1c2luZXNzLnNob3J0X25hbWUsXG4gICAgICAgICAgICAgIGxvZ29fbWFpbl91cmw6IGJ1c2luZXNzLmxvZ29fbWFpbl91cmwsXG4gICAgICAgICAgICAgIGxvZ29fc21hbGxfdXJsOiBidXNpbmVzcy5sb2dvX3NtYWxsX3VybCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogVGhpcyBzZXQgdGhlIG5hdiBtZW51IGFjcm9zcyB0aGUgdG9wIG9mIHRlbXBsYXRlXG4gICAqIEBwYXJhbSBidXNpbmVzc1xuICAgKi9cbiAgcHJpdmF0ZSBfc2V0QnVzaW5lc3NBcHBNZW51cyhidXNpbmVzczogQnVzaW5lc3MpIHtcbiAgICBpZiAoYnVzaW5lc3MpIHtcbiAgICAgIGlmIChJc0FycmF5KGJ1c2luZXNzLmFwcHMsIHRydWUpKSB7XG4gICAgICAgIHRoaXMudWkubWVudXMuYWxsID0gYnVzaW5lc3MuYXBwcy5maWx0ZXIoKGFwcDogQXBwKSA9PiB7XG4gICAgICAgICAgcmV0dXJuICthcHAuYWN0aXZlO1xuICAgICAgICB9KS5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgaWYgKGEuc29ydCA8IGIuc29ydCkgcmV0dXJuIC0xO1xuICAgICAgICAgIGlmIChhLnNvcnQgPiBiLnNvcnQpIHJldHVybiAxO1xuICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9KS5tYXAoKGFwcDogQXBwKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuX2V4dHJhY3RBcHBNZW51KGFwcCk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIGlmIChJc09iamVjdChidXNpbmVzcy5hcHBzLCB0cnVlKSkge1xuICAgICAgICB0aGlzLnVpLm1lbnVzLmFsbCA9IE9iamVjdC5rZXlzKGJ1c2luZXNzLmFwcHMpLm1hcCgoYXBwS2V5KSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuX2V4dHJhY3RBcHBNZW51KGJ1c2luZXNzLmFwcHNbYXBwS2V5XSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgZnggd2lsbCBleHRyYWN0IHRoZSBuZWNlc3NhcnkgZGF0YSBvdXQgb2YgdGhlIGFwcCBkYXRhXG4gICAqIEBwYXJhbSBhcHBcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHByaXZhdGUgX2V4dHJhY3RBcHBNZW51KGFwcDogQXBwKTogQXBwTWVudSB7XG4gICAgcmV0dXJuIDxBcHBNZW51PntcbiAgICAgIG5hbWU6IGFwcC5sYWJlbCA/IGFwcC5sYWJlbCA6IGFwcC5uYW1lLFxuICAgICAgcGF0aDogYC8ke1N0cmluZyhhcHAubmFtZSkudG9Mb3dlckNhc2UoKX1gLFxuICAgICAgZGVzY3JpcHRpb246ICcnLFxuICAgICAgc2hvcnRfZGVzY3JpcHRpb246ICcnLFxuICAgICAgc29ydDogYXBwLnNvcnQsXG4gICAgICBpY29uOiAnJyxcbiAgICB9O1xuICB9XG59XG5cbiJdfQ==