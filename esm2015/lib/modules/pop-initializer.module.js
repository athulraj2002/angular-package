import { __awaiter } from "tslib";
import { ComponentFactoryResolver, Inject, Injector, isDevMode, NgModule } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { PopBaseService } from '../services/pop-base.service';
import { PopCacFilterBarService } from './app/pop-cac-filter/pop-cac-filter.service';
import { PopDatetimeService } from '../services/pop-datetime.service';
import { PopEntityService } from './entity/services/pop-entity.service';
import { PopLogService } from '../services/pop-log.service';
import { PopRouteHistoryResolver } from '../services/pop-route-history.resolver';
import { PopPipeService } from '../services/pop-pipe.service';
import { PopEntityUtilPortalService } from './entity/services/pop-entity-util-portal.service';
import { PopRequestService } from '../services/pop-request.service';
import { PopTemplateService } from './app/pop-template.service';
import { PlatformLocation } from '@angular/common';
import { SetServiceInjector, SetPopApp, SetPopAuth, SetPopBusiness, SetPopDate, SetPopEntity, SetPopHistory, SetPopHref, SetPopLogger, SetPopPipe, SetPopPortal, SetPopRequest, SetPopUser, PopBusiness, PopEntity, PopHref, PopLog, SetPopRouteAliasMap, PopUser, PopAuth, PopPipe, SetPopTemplate, SetPopExternalApi, SetPopSchemeComponent, SetPopComponentResolver, SetPopEnv, PopTemplate, } from '../pop-common.model';
import { GetSessionSiteVar, GetSiteVar, IsArray, IsCallableFunction, IsDefined, IsObject, IsUndefined, SetSessionSiteVar, Sleep, SpaceToHyphenLower, StorageGetter, StringReplaceAll } from '../pop-common-utility';
import { EntityGeneralTab, EntityHistoryTab } from './entity/pop-entity-tab/pop-entity-tab.model';
import { Router } from '@angular/router';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HeaderInterceptor, Response401Interceptor } from '../services/pop-base.interceptors';
import { DateAdapter } from '@angular/material/core';
import { CustomDateAdapter } from './base/pop-field-item/custom-date-adapter';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { PopCredentialService } from '../services/pop-credential.service';
import { ParseModuleRoutesForAliases } from './entity/pop-entity-utility';
import { PopErrorRedirectComponent } from './base/pop-redirects/pop-error-redirect/pop-error-redirect.component';
import { PopRedirectsModule } from './base/pop-redirects/pop-redirects-module';
import { PopRedirectGuard } from './base/pop-redirects/pop-redirect.guard';
import { PopCacheRedirectComponent } from './base/pop-redirects/pop-cache-redirect/pop-cache-redirect.component';
import { PopCacheRedirectGuard } from './base/pop-redirects/pop-cache-redirect.guard';
import { PopGuardRedirectComponent } from './base/pop-redirects/pop-guard-redirect/pop-guard-redirect.component';
import { PopRequestExternalService } from '../services/pop-request-external.service';
import { PopEntitySchemeComponentService } from "./entity/services/pop-entity-scheme-component.service";
export class AppMenus {
    constructor() {
        this._menus = [];
    }
    get() {
        return this._menus;
    }
    set(menus) {
        this._menus = menus;
    }
    init(menus) {
        return menus;
    }
}
export class AppWidgets {
    constructor() {
        this._widgets = [];
    }
    get() {
        return this._widgets;
    }
    set(widgets) {
        this._widgets = widgets;
    }
}
export class AppTheme {
    constructor() {
        this._theme = 'default';
        this._contrast = 'light';
        this._name = 'default-light.css';
        this.init = new BehaviorSubject(false);
    }
    get() {
        return this._name;
    }
    set(theme = 'default', contrast = 'light') {
        this._theme = theme;
        this._contrast = contrast;
        this._name = `${this._theme}-${this._contrast}.css`;
        const themeLink = document.getElementById('themeFileEle');
        if (themeLink) {
            const existingTheme = StringReplaceAll(themeLink.href.split(PopHref).pop(), '/', '');
            if (this._name !== existingTheme) {
                themeLink.href = this._name;
            }
        }
        else {
            const themeFile = document.createElement('link');
            themeFile.setAttribute('rel', 'stylesheet');
            themeFile.setAttribute('type', 'text/css');
            themeFile.setAttribute('href', this._name);
            themeFile.setAttribute('id', 'themeFileEle');
            themeFile.onload = () => {
                this.init.next(true);
            };
            if (typeof themeFile != 'undefined')
                document.getElementsByTagName('head')[0].appendChild(themeFile);
        }
    }
    isLoaded() {
        return this.init.getValue();
    }
}
export class AppGlobal {
    constructor() {
        this._verified = false;
        this._modals = 0;
        this._open = false;
        this.init = new BehaviorSubject(false);
        this.verification = new Subject();
        this._unload = new Subject();
    }
    isVerified() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            const wait = setInterval(() => {
                if (this._verified) {
                    clearInterval(wait);
                    return resolve(true);
                }
            }, 5, 5);
        }));
    }
    setVerified() {
        this._verified = true;
    }
    setModal() {
        this._modals++;
    }
    isModal() {
        return this._modals;
    }
    removeModal() {
        if (this._modals) {
            this._modals--;
        }
    }
    isFilterBar() {
        return this._filter;
    }
    setFilterBar(value) {
        this._filter = value;
    }
    isPipes() {
        return this._pipes;
    }
    setPipes(value) {
        this._pipes = value;
    }
    isAliases() {
        return this._aliases;
    }
    setAliases(value) {
        this._aliases = value;
    }
    isEntities() {
        return this._entities;
    }
    setEntities(value) {
        this._entities = value;
    }
    setSecurity(value) {
        this._security = value;
    }
    isSecurity() {
        return this._security;
    }
    isPermissions() {
        return this._permissions;
    }
    setPermissions(value) {
        this._permissions = value;
    }
    isOpen() {
        return this._open;
    }
    setOpen(value) {
        this._open = value;
    }
}
export class PopInitializerModule {
    constructor(base, cacFilter, componentFactoryResolver, credential, date, entity, externalApi, log, history, iconRegistry, pipe, portal, request, router, sanitizer, schemeComponent, template, platform, injector, tasks, APP_GLOBAL, APP_GLOBAL_PARAMS, APP_THEME, env) {
        this.base = base;
        this.cacFilter = cacFilter;
        this.componentFactoryResolver = componentFactoryResolver;
        this.credential = credential;
        this.date = date;
        this.entity = entity;
        this.externalApi = externalApi;
        this.log = log;
        this.history = history;
        this.iconRegistry = iconRegistry;
        this.pipe = pipe;
        this.portal = portal;
        this.request = request;
        this.router = router;
        this.sanitizer = sanitizer;
        this.schemeComponent = schemeComponent;
        this.template = template;
        this.platform = platform;
        this.injector = injector;
        this.tasks = tasks;
        this.APP_GLOBAL = APP_GLOBAL;
        this.APP_GLOBAL_PARAMS = APP_GLOBAL_PARAMS;
        this.APP_THEME = APP_THEME;
        this.env = env;
        this.name = `PopInitializerModule`;
        this.verification = {
            pending: false,
            subscription: undefined,
            debouncer: undefined,
            trigger: () => {
                if (this.verification.debouncer)
                    clearTimeout(this.verification.debouncer);
                this.verification.debouncer = setTimeout(() => {
                    return this._verifyAuthStorage();
                }, 5);
            },
            unload: () => {
                if (this.verification.subscription) {
                    this.verification.subscription.unsubscribe();
                }
                if (this.verification.debouncer) {
                    clearTimeout(this.verification.debouncer);
                }
            }
        };
        this.unload = {
            pending: false,
            subscription: undefined,
            debouncer: undefined,
            trigger: () => {
                if (this.unload.debouncer)
                    clearTimeout(this.unload.debouncer);
                this.unload.debouncer = setTimeout(() => {
                    this.unload.run();
                }, 0);
            },
            run: () => {
                if (this.unload.subscription) {
                    this.unload.subscription.unsubscribe();
                }
                this.verification.unload();
            }
        };
        this.iconRegistry.addSvgIcon('admin', this.sanitizer.bypassSecurityTrustResourceUrl('assets/images/admin.svg'));
        const setup = new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            const auth = this.base.getAuthDetails();
            const login = GetSessionSiteVar('Login.time', 0);
            try {
                this._setBusinessId(auth);
            }
            catch (e) {
                console.log(e);
            }
            const publicFacingApp = this.APP_GLOBAL_PARAMS.open ? true : false;
            if (!publicFacingApp && IsObject(auth, ['id', 'businesses', 'users', 'token', 'email_verified_at']) && !(this.base.isAuthExpired())) {
                yield this._loadAppTheme();
                yield this._init(auth);
                PopLog.init(this.name, `:publicFacingApp`, publicFacingApp);
                /** This is experimental testing if app can be speed up  **/
                if (this.businessId && StorageGetter(auth, ['businesses', this.businessId, 'apps']) && !login) {
                    PopLog.init(this.name, `:fire app early?`);
                    this.APP_GLOBAL.setVerified();
                    this.APP_GLOBAL.init.next(true);
                }
                /** *********************** **/
                const verified = yield this._verifyAuthStorage();
                if (!verified) {
                    if (!isDevMode()) {
                        if (false) {
                            this.base.clearAuthDetails(`PopInitializerModule:setup`);
                            window.location.href = window.location.protocol + '//' + window.location.host + '/user/legacy/auth/clear';
                        }
                        else {
                            PopLog.init(this.name, `:verification failed`);
                            this.APP_GLOBAL.setVerified();
                            this.APP_GLOBAL.init.next(true);
                            return resolve(true);
                        }
                    }
                    else {
                        PopLog.init(this.name, `:verification failed`);
                        this.APP_GLOBAL.init.next(true);
                        return resolve(true);
                    }
                }
                else {
                    this._welcome();
                    return resolve(true);
                }
                // if(this.APP_GLOBAL.isSecurity() && IsString(PopHref, true)) {
                //   this.base.checkAppAccess(PopHref, true);
                // }
            }
            else {
                SetSessionSiteVar('App.theme', null);
                SetSessionSiteVar('App.themeContrast', null);
                yield this._loadAppTheme();
                yield this._setDependencies(false, null);
                if (this.APP_GLOBAL.isOpen()) {
                    this.APP_GLOBAL.setVerified();
                    this.APP_GLOBAL.init.next(true);
                    return resolve(true);
                }
                else {
                    this.APP_GLOBAL.init.next(true);
                    return resolve(true);
                }
            }
        }));
        setup.catch((e) => {
            if (isDevMode())
                console.log('e', e);
            this.APP_GLOBAL.init.next(true);
        });
    }
    static forRoot(tasks = [], appGlobalsParams = {}) {
        return {
            ngModule: PopInitializerModule,
            providers: [
                {
                    provide: 'APP_GLOBAL',
                    useClass: AppGlobal
                },
                {
                    provide: 'APP_GLOBAL_PARAMS',
                    useValue: appGlobalsParams
                },
                { provide: HTTP_INTERCEPTORS, useClass: HeaderInterceptor, multi: true },
                { provide: HTTP_INTERCEPTORS, useClass: Response401Interceptor, multi: true },
                { provide: DateAdapter, useClass: CustomDateAdapter },
                {
                    provide: 'APP_INITIALIZER_TASKS',
                    useValue: tasks
                },
                {
                    provide: 'APP_MENUS',
                    useClass: AppMenus
                },
                {
                    provide: 'APP_WIDGETS',
                    useClass: AppWidgets
                },
                {
                    provide: 'APP_THEME',
                    useClass: AppTheme
                },
            ]
        };
    }
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    /**
     * Load the app dependencies
     * @param business
     */
    _setDependencies(authenticated, auth) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            this.APP_GLOBAL.setAliases(IsDefined(this.env.aliases) ? this.env.aliases : (IsDefined(this.APP_GLOBAL_PARAMS.aliases) ? this.APP_GLOBAL_PARAMS.aliases : true));
            this.APP_GLOBAL.setFilterBar(IsDefined(this.env.filter) ? this.env.filter : (IsDefined(this.APP_GLOBAL_PARAMS.filter) ? this.APP_GLOBAL_PARAMS.aliases : true));
            this.APP_GLOBAL.setPipes(IsDefined(this.env.pipes) ? this.env.pipes : (IsDefined(this.APP_GLOBAL_PARAMS.pipes) ? this.APP_GLOBAL_PARAMS.pipes : true));
            this.APP_GLOBAL.setEntities(IsDefined(this.env.entities) ? this.env.entities : (IsDefined(this.APP_GLOBAL_PARAMS.entities) ? this.APP_GLOBAL_PARAMS.entities : true));
            this.APP_GLOBAL.setOpen(IsDefined(this.env.open) ? this.env.open : (IsDefined(this.APP_GLOBAL_PARAMS.open) ? this.APP_GLOBAL_PARAMS.open : false));
            this.APP_GLOBAL.setSecurity(IsDefined(this.env.security) ? this.env.security : (IsDefined(this.APP_GLOBAL_PARAMS.security) ? this.APP_GLOBAL_PARAMS.security : false));
            this.APP_GLOBAL.setPermissions(IsDefined(this.env.permissions) ? this.env.permissions : (IsDefined(this.APP_GLOBAL_PARAMS.permissions) ? this.APP_GLOBAL_PARAMS.permissions : false));
            SetServiceInjector(this.injector);
            SetPopEnv(this.env ? this.env : {});
            SetPopExternalApi(this.externalApi);
            SetPopHref(StringReplaceAll(this.platform.getBaseHrefFromDOM(), '/', ''));
            SetPopLogger(this.log);
            SetPopRequest(this.request);
            SetPopTemplate(this.template);
            SetPopComponentResolver(this.componentFactoryResolver);
            if (authenticated) {
                SetPopDate(this.date);
                SetPopHistory(this.history);
                SetPopEntity(this.entity);
                SetPopPipe(this.pipe);
                SetPopPortal(this.portal);
                SetPopSchemeComponent(this.schemeComponent);
                this._setAuthGlobal(auth);
                this._setBusinessId(auth);
                yield Promise.all([
                    this._setRouteCacheClear(),
                    this._setRouteErrorHandling(),
                    this._setBusinessAssets(auth),
                    this._loadPipeResources(),
                ]);
                yield this._loadFilterData();
            }
            return resolve(true);
        }));
    }
    _init(auth) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            yield this._setDependencies(true, auth);
            yield this._setAncillary(auth);
            yield this._configure(auth);
            this.APP_GLOBAL.init.next(true);
            if (!this.unload.subscription) {
                PopLog.init(this.name, `registering unload request subscription`);
                this.unload.subscription = this.APP_GLOBAL._unload.subscribe(() => {
                    PopLog.init(this.name, `unload: requested`);
                    this.unload.trigger();
                });
            }
            return resolve(true);
        }));
    }
    _setAncillary(auth) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            yield this._tasks();
            return resolve(true);
        }));
    }
    _configure(auth) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            if (IsObject(auth, ['id', 'businesses', 'users', 'token']) && !(this.base.isAuthExpired()) && PopHref) {
                if (IsObject(PopBusiness, ['id'])) {
                    yield Promise.all([
                        this._setBusinessUserSettings(),
                        this._setFilterAliases(),
                        this._setRouteAliasMap(),
                        this._setDefaultTabs(),
                    ]);
                    return resolve(true);
                }
                else {
                    PopLog.init(this.name, `No Business Found`);
                    return resolve(true);
                }
            }
            else {
                return resolve(true);
            }
        }));
    }
    _tasks() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            if (IsObject(PopBusiness, true)) {
                if (IsArray(this.tasks, true)) {
                    this.tasks.map((task) => {
                        if (IsCallableFunction(task)) {
                            task();
                        }
                    });
                }
            }
            return resolve(true);
        }));
    }
    _setAuthGlobal(auth) {
        SetPopAuth({
            id: auth.id,
            name: auth.name,
            first_name: auth.first_name,
            last_name: auth.last_name,
            initials: auth.initials,
            email: auth.email,
            email_verified_at: auth.email_verified_at,
            avatarLink: StorageGetter(auth, ['profile', 'avatar_link'], null),
            username: auth.username,
            created_at: auth.created_at
        });
    }
    _setBusinessId(auth) {
        if (IsUndefined(this.businessId))
            this.businessId = 0;
        if (IsObject(auth.businesses, true)) {
            if (!this.businessId)
                this.businessId = String(GetSiteVar('Business.last', 0));
            if (!(+this.businessId && this.businessId in auth.businesses)) {
                this.businessId = this.base.getCurrentBusinessId();
            }
            if (+this.businessId && this.businessId in auth.businesses) {
                this.businessId = +this.businessId;
            }
            else if (+auth.business_fk && auth.business_fk in auth.businesses) {
                this.businessId = +auth.business_fk;
            }
            else {
                this.businessId = IsObject(auth.businesses, true) ? +Object.keys(auth.businesses)[0] : 0;
            }
        }
    }
    /**
     * Verify that the current auth storage is still relevant
     * @private
     */
    _verifyAuthStorage() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            if (IsObject(PopAuth, ['created_at']) && IsDefined(PopAuth.email_verified_at, false) && !this.verification.pending) {
                PopLog.init(this.name, `Verification: In Progress`);
                if (!this.businessId) {
                    PopLog.init(this.name, `Verification:Complete - no business`);
                    this.APP_GLOBAL.setVerified();
                    return resolve(true);
                }
                this.verification.pending = true;
                const auth = yield this.credential.verify(this.businessId);
                if (auth) {
                    this._setAuthGlobal(auth);
                    this._setBusinessId(auth);
                    yield Promise.all([
                        this._setBusinessAssets(auth),
                        this._loadAppTheme(),
                        this._setAncillary(auth),
                        this._configure(auth),
                        this._setRouteAliases()
                    ]);
                    this.APP_GLOBAL.setVerified();
                    PopLog.init(this.name, `Verification: Complete`);
                    this.verification.pending = false;
                    this.APP_GLOBAL.init.next(true);
                    if (!this.verification.subscription) {
                        PopLog.init(this.name, `registering verification request subscription`);
                        this.verification.subscription = this.APP_GLOBAL.verification.subscribe(() => {
                            PopLog.init(this.name, `_verifyAuthStorage: requested`);
                            this.verification.trigger();
                        });
                    }
                    return resolve(true);
                }
                else {
                    return resolve(false);
                }
            }
            else {
                return resolve(false);
            }
        }));
    }
    /**
     * This fx will set up all the necessary business assets that are needed
     * @param auth
     * @private
     */
    _setBusinessAssets(auth) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            if (+this.businessId && IsObject(auth, ['id', 'businesses', 'users', 'token'])) {
                this.base.setCurrentBusinessId(+this.businessId);
                SetPopUser(IsObject(auth.users, true) && this.businessId in auth.users ? auth.users[this.businessId] : null);
                SetPopBusiness(IsObject(auth.businesses, true) && this.businessId in auth.businesses ? auth.businesses[this.businessId] : null);
                SetPopApp(IsObject(PopBusiness.apps, [PopHref]) ? PopBusiness.apps[PopHref] : null);
                // if (!IsObject(PopApp, ['id', 'name'])) {
                //   if (!isDevMode()) {
                //     window.location.href = window.location.protocol + '//' + window.location.host + '/home';
                //   }
                // }
                yield this._setBusinessAppEntities();
            }
            return resolve(true);
        }));
    }
    /**
     * This fx will loop through all the apps in the current business, and for each entity in that business register the details
     */
    _setBusinessAppEntities() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            const auth = this.base.getAuthDetails();
            if (IsObject(PopBusiness, ['id', 'apps']) && IsObject(PopBusiness.apps, true)) {
                const inaccessibleApps = [];
                const permanentApps = ['library', 'home'];
                // console.log('PopUser', PopUser);
                Object.keys(PopBusiness.apps).map((appName) => {
                    const app = PopBusiness.apps[appName];
                    app.hasCreateAccess = false;
                    if (IsObject(app, true) && IsObject(app.entities, true)) {
                        Object.keys(app.entities).map((name) => {
                            if (IsObject(app.entities[name], ['id', 'name', 'internal_name'])) {
                                const entity = app.entities[name];
                                entity.access = {};
                                if (IsObject(PopUser, ['permissions']) && IsObject(PopUser.permissions, true) && entity.internal_name in PopUser.permissions) {
                                    entity.access = PopUser.permissions[entity.internal_name];
                                    // console.log(entity.internal_name, entity.access.can_read);
                                }
                                if (entity.access.can_create)
                                    app.hasCreateAccess = true;
                                PopEntity.setEntityParams(entity);
                                PopPipe.updateEntityAlias(entity.id, entity.alias);
                            }
                        });
                    }
                    if (this.APP_GLOBAL.isEntities() && !app.hasCreateAccess) {
                        if (!(permanentApps.includes((app.name)))) {
                            inaccessibleApps.push(app.name);
                        }
                    }
                });
                // console.log('inaccessibleApps', inaccessibleApps);
                if (IsArray(inaccessibleApps, true)) {
                    inaccessibleApps.map((appName2) => {
                        delete PopBusiness.apps[appName2];
                        delete auth.businesses[PopBusiness.id].apps[appName2];
                    });
                }
                this.base.setAuthDetails(auth);
            }
            return resolve(true);
        }));
    }
    /**
     * Load the client,account,campaign data required for the filter bar
     * @param business
     */
    _setBusinessUserSettings() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            if (IsObject(PopBusiness, ['id'])) {
                this.date.setCurrentBusinessUnitSettings();
                PopLog.init(this.name, `:BusinessUserSettings`);
                return resolve(true);
            }
            else {
                return resolve(true);
            }
        }));
    }
    _welcome() {
        if (IsObject(PopAuth, ['created_at'])) {
            const now = new Date().getTime() / 1000;
            const loginTime = new Date(PopAuth.created_at).getTime() / 1000;
            const secondsSinceLogin = (now - loginTime);
            const welcome = +secondsSinceLogin && +secondsSinceLogin < 20;
            if (welcome) {
                this.template.welcome();
            }
        }
    }
    /**
     * Load the client,account,campaign data required for the filter bar
     * @param business
     */
    _loadFilterData() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            if (this.APP_GLOBAL.isFilterBar() && IsObject(PopBusiness, ['id'])) {
                if (PopEntity.checkAccess('client', 'can_read')) {
                    yield this.cacFilter.setData(this.name);
                    PopLog.init(this.name, `:Filter Data Set`);
                }
                else {
                    PopTemplate.turnOffFilter();
                }
                return resolve(true);
            }
            else {
                return resolve(true);
            }
        }));
    }
    /**
     * Load the resources needed for the PopPipe service
     * @param business
     */
    _loadPipeResources() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            if (this.APP_GLOBAL.isPipes() && IsObject(PopBusiness, ['id'])) {
                this.pipe.loadResources().then(() => {
                    PopLog.init(this.name, `:Pipe Resources Set`);
                    return resolve(true);
                });
            }
            else {
                return resolve(false);
            }
        }));
    }
    /**
     * Set any aliases on the filter columns
     * @private
     */
    _setFilterAliases() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            if (this.APP_GLOBAL.isFilterBar() && this.APP_GLOBAL.isEntities() && this.APP_GLOBAL.isAliases())
                this.cacFilter.setConfigAliases();
            return resolve(true);
        }));
    }
    /**
     * Create a map lookup for route aliases
     * @private
     */
    _setRouteAliasMap() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            const aliasMap = {};
            if (this.APP_GLOBAL.isEntities() && this.APP_GLOBAL.isAliases()) {
                const auth = GetSiteVar('Auth.details', {});
                if (+this.businessId && IsObject(auth, ['businesses']) && IsObject(auth.businesses[this.businessId], ['apps'])) {
                    if (IsObject(auth.businesses[this.businessId].apps, true)) {
                        Object.keys(auth.businesses[this.businessId].apps).map((appName) => {
                            const app = auth.businesses[this.businessId].apps[appName];
                            if (IsObject(app.entities, true)) {
                                Object.keys(app.entities).map((key) => {
                                    const entity = app.entities[key];
                                    if (IsObject(app.entities[key], true) && IsObject(app.entities[key].alias, ['plural'])) {
                                        aliasMap[entity.internal_name] = {
                                            singular: SpaceToHyphenLower(app.entities[key].alias.name),
                                            plural: SpaceToHyphenLower(app.entities[key].alias.plural)
                                        };
                                    }
                                });
                            }
                        });
                    }
                }
            }
            SetPopRouteAliasMap(aliasMap);
            return resolve(true);
        }));
    }
    /**
     * Get the router.config and load all lazy module using the configLoader
     */
    _setRouteAliases() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            if (this.APP_GLOBAL.isEntities() && this.APP_GLOBAL.isAliases()) {
                this.router.config = ParseModuleRoutesForAliases(this.router.config);
                this.router.config.reduce((acc, route) => {
                    if (route.loadChildren && route.data && route.data.routeAliases) {
                        this.router.configLoader.load(this.injector, route).subscribe({
                            next: (moduleConf) => {
                                route._loadedConfig = moduleConf;
                                ParseModuleRoutesForAliases(moduleConf.routes);
                                return route.path;
                            }
                        });
                    }
                    return acc;
                }, []);
                yield Sleep(5);
                return resolve(true);
            }
            else {
                yield Sleep(5);
                return resolve(true);
            }
        }));
    }
    /**
     * Get the router.config and load all lazy module using the configLoader
     */
    _setRouteCacheClear() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            if (true) {
                const cacheRoute = this.router.config.find((route) => route.path === 'system/cache/clear');
                if (!cacheRoute) {
                    this.router.config = [...this.router.config, ...[{
                                path: 'system/cache/clear',
                                pathMatch: 'full',
                                canActivate: [PopCacheRedirectGuard],
                                component: PopCacheRedirectComponent
                            }]];
                }
                return resolve(true);
            }
            else {
                return resolve(true);
            }
        }));
    }
    /**
     * Get the router.config and load all lazy module using the configLoader
     */
    _setRouteErrorHandling() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            if (true) {
                const guardBlockRoute = this.router.config.find((route) => route.path === 'system/route');
                if (!guardBlockRoute) {
                    this.router.config = [...this.router.config, ...[{
                                path: 'system/route',
                                pathMatch: 'full',
                                component: PopGuardRedirectComponent
                            }]];
                }
                const errorRoute = this.router.config.find((route) => route.path === 'system/error/:code');
                if (!errorRoute) {
                    this.router.config = [...this.router.config, ...[{
                                path: 'system/error/:code',
                                pathMatch: 'full',
                                canActivate: [PopRedirectGuard],
                                component: PopErrorRedirectComponent
                            }]];
                }
                return resolve(true);
            }
            else {
                return resolve(true);
            }
        }));
    }
    /**
     * Load the theme of the business and apply the theme contrast the user has specified
     * @param business
     */
    _loadAppTheme() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            let businessTheme = IsObject(PopUser, ['id']) ? StorageGetter(PopUser, ['setting', 'theme'], null) : null;
            if (!businessTheme)
                businessTheme = GetSessionSiteVar(`App.theme`, 'default');
            let userThemeContrast = IsObject(PopUser, ['id']) ? StorageGetter(PopUser, ['setting', 'theme_contrast'], null) : null;
            if (!userThemeContrast)
                userThemeContrast = GetSessionSiteVar(`App.themeContrast`, 'light');
            SetSessionSiteVar('App.theme', businessTheme);
            SetSessionSiteVar('App.themeContrast', userThemeContrast);
            this.APP_THEME.set(businessTheme, userThemeContrast);
            return resolve(true);
        }));
    }
    /**
     * Set a default set of tabs that an entity should have, intended to be overridden
     * @param business
     */
    _setDefaultTabs() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            if (this.APP_GLOBAL.isEntities())
                PopEntity.setEntityTabs('default', [EntityGeneralTab, EntityHistoryTab]);
            return resolve(true);
        }));
    }
}
PopInitializerModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    PopRedirectsModule
                ],
                declarations: [],
                exports: [],
                providers: [PopCredentialService]
            },] }
];
PopInitializerModule.ctorParameters = () => [
    { type: PopBaseService },
    { type: PopCacFilterBarService },
    { type: ComponentFactoryResolver },
    { type: PopCredentialService },
    { type: PopDatetimeService },
    { type: PopEntityService },
    { type: PopRequestExternalService },
    { type: PopLogService },
    { type: PopRouteHistoryResolver },
    { type: MatIconRegistry },
    { type: PopPipeService },
    { type: PopEntityUtilPortalService },
    { type: PopRequestService },
    { type: Router },
    { type: DomSanitizer },
    { type: PopEntitySchemeComponentService },
    { type: PopTemplateService },
    { type: PlatformLocation },
    { type: undefined, decorators: [{ type: Inject, args: [Injector,] }] },
    { type: Array, decorators: [{ type: Inject, args: ['APP_INITIALIZER_TASKS',] }] },
    { type: undefined, decorators: [{ type: Inject, args: ['APP_GLOBAL',] }] },
    { type: undefined, decorators: [{ type: Inject, args: ['APP_GLOBAL_PARAMS',] }] },
    { type: undefined, decorators: [{ type: Inject, args: ['APP_THEME',] }] },
    { type: undefined, decorators: [{ type: Inject, args: ['env',] }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWluaXRpYWxpemVyLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL3BvcC1pbml0aWFsaXplci5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFDTCx3QkFBd0IsRUFDeEIsTUFBTSxFQUNOLFFBQVEsRUFDUixTQUFTLEVBRVQsUUFBUSxFQUdULE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQyxlQUFlLEVBQVksT0FBTyxFQUFlLE1BQU0sTUFBTSxDQUFDO0FBQ3RFLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSw4QkFBOEIsQ0FBQztBQUM1RCxPQUFPLEVBQUMsc0JBQXNCLEVBQUMsTUFBTSw2Q0FBNkMsQ0FBQztBQUNuRixPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSxrQ0FBa0MsQ0FBQztBQUNwRSxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxzQ0FBc0MsQ0FBQztBQUN0RSxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sNkJBQTZCLENBQUM7QUFDMUQsT0FBTyxFQUFDLHVCQUF1QixFQUFDLE1BQU0sd0NBQXdDLENBQUM7QUFDL0UsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLDhCQUE4QixDQUFDO0FBQzVELE9BQU8sRUFBQywwQkFBMEIsRUFBQyxNQUFNLGtEQUFrRCxDQUFDO0FBQzVGLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLGlDQUFpQyxDQUFDO0FBQ2xFLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLDRCQUE0QixDQUFDO0FBQzlELE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ2pELE9BQU8sRUFDTCxrQkFBa0IsRUFDbEIsU0FBUyxFQUNULFVBQVUsRUFDVixjQUFjLEVBQ2QsVUFBVSxFQUNWLFlBQVksRUFDWixhQUFhLEVBQ2IsVUFBVSxFQUNW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Q0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDdkosSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDdEssSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDbkosSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDdkssSUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENB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ekIsYUFBYTtZQUNiLHVCQUF1QjtZQTJEdkIsZUFBZTtZQTFEZixjQUFjO1lBQ2QsMEJBQTBCO1lBQzFCLGlCQUFpQjtZQW1EakIsTUFBTTtZQU1OLFlBQVk7WUFXWiwrQkFBK0I7WUFuRS9CLGtCQUFrQjtZQUNsQixnQkFBZ0I7NENBMFhuQixNQUFNLFNBQUMsUUFBUTt3Q0FDZixNQUFNLFNBQUMsdUJBQXVCOzRDQUM5QixNQUFNLFNBQUMsWUFBWTs0Q0FDbkIsTUFBTSxTQUFDLG1CQUFtQjs0Q0FDMUIsTUFBTSxTQUFDLFdBQVc7NENBQ2xCLE1BQU0sU0FBQyxLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyLFxuICBJbmplY3QsXG4gIEluamVjdG9yLFxuICBpc0Rldk1vZGUsXG4gIE1vZHVsZVdpdGhQcm92aWRlcnMsXG4gIE5nTW9kdWxlLFxuICBPbkRlc3Ryb3ksXG4gIFJlbmRlcmVyMlxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7QmVoYXZpb3JTdWJqZWN0LCBmb3JrSm9pbiwgU3ViamVjdCwgU3Vic2NyaXB0aW9ufSBmcm9tICdyeGpzJztcbmltcG9ydCB7UG9wQmFzZVNlcnZpY2V9IGZyb20gJy4uL3NlcnZpY2VzL3BvcC1iYXNlLnNlcnZpY2UnO1xuaW1wb3J0IHtQb3BDYWNGaWx0ZXJCYXJTZXJ2aWNlfSBmcm9tICcuL2FwcC9wb3AtY2FjLWZpbHRlci9wb3AtY2FjLWZpbHRlci5zZXJ2aWNlJztcbmltcG9ydCB7UG9wRGF0ZXRpbWVTZXJ2aWNlfSBmcm9tICcuLi9zZXJ2aWNlcy9wb3AtZGF0ZXRpbWUuc2VydmljZSc7XG5pbXBvcnQge1BvcEVudGl0eVNlcnZpY2V9IGZyb20gJy4vZW50aXR5L3NlcnZpY2VzL3BvcC1lbnRpdHkuc2VydmljZSc7XG5pbXBvcnQge1BvcExvZ1NlcnZpY2V9IGZyb20gJy4uL3NlcnZpY2VzL3BvcC1sb2cuc2VydmljZSc7XG5pbXBvcnQge1BvcFJvdXRlSGlzdG9yeVJlc29sdmVyfSBmcm9tICcuLi9zZXJ2aWNlcy9wb3Atcm91dGUtaGlzdG9yeS5yZXNvbHZlcic7XG5pbXBvcnQge1BvcFBpcGVTZXJ2aWNlfSBmcm9tICcuLi9zZXJ2aWNlcy9wb3AtcGlwZS5zZXJ2aWNlJztcbmltcG9ydCB7UG9wRW50aXR5VXRpbFBvcnRhbFNlcnZpY2V9IGZyb20gJy4vZW50aXR5L3NlcnZpY2VzL3BvcC1lbnRpdHktdXRpbC1wb3J0YWwuc2VydmljZSc7XG5pbXBvcnQge1BvcFJlcXVlc3RTZXJ2aWNlfSBmcm9tICcuLi9zZXJ2aWNlcy9wb3AtcmVxdWVzdC5zZXJ2aWNlJztcbmltcG9ydCB7UG9wVGVtcGxhdGVTZXJ2aWNlfSBmcm9tICcuL2FwcC9wb3AtdGVtcGxhdGUuc2VydmljZSc7XG5pbXBvcnQge1BsYXRmb3JtTG9jYXRpb259IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge1xuICBTZXRTZXJ2aWNlSW5qZWN0b3IsXG4gIFNldFBvcEFwcCxcbiAgU2V0UG9wQXV0aCxcbiAgU2V0UG9wQnVzaW5lc3MsXG4gIFNldFBvcERhdGUsXG4gIFNldFBvcEVudGl0eSxcbiAgU2V0UG9wSGlzdG9yeSxcbiAgU2V0UG9wSHJlZixcbiAgU2V0UG9wTG9nZ2VyLFxuICBTZXRQb3BQaXBlLFxuICBTZXRQb3BQb3J0YWwsXG4gIFNldFBvcFJlcXVlc3QsXG4gIFNldFBvcFVzZXIsXG4gIFBvcEJ1c2luZXNzLFxuICBQb3BFbnRpdHksXG4gIFBvcEhyZWYsXG4gIFBvcExvZyxcbiAgUG9wVGFzayxcbiAgQXBwTWVudXNJbnRlcmZhY2UsXG4gIFNldFBvcFJvdXRlQWxpYXNNYXAsXG4gIEVudGl0eSxcbiAgQXBwR2xvYmFsSW50ZXJmYWNlLFxuICBBcHBXaWRnZXRzSW50ZXJmYWNlLFxuICBQb3BVc2VyLFxuICBBcHBHbG9iYWxQYXJhbUludGVyZmFjZSxcbiAgUG9wQXV0aCxcbiAgUG9wUGlwZSxcbiAgU2V0UG9wVGVtcGxhdGUsXG4gIEFwcFRoZW1lSW50ZXJmYWNlLFxuICBTZXRQb3BFeHRlcm5hbEFwaSxcbiAgU2V0UG9wU2NoZW1lQ29tcG9uZW50LFxuICBTZXRQb3BDb21wb25lbnRSZXNvbHZlcixcbiAgU2V0UG9wRW52LCBQb3BBcHAsIFBvcFRlbXBsYXRlLFxufSBmcm9tICcuLi9wb3AtY29tbW9uLm1vZGVsJztcbmltcG9ydCB7XG4gIEdldFNlc3Npb25TaXRlVmFyLFxuICBHZXRTaXRlVmFyLFxuICBJc0FycmF5LFxuICBJc0NhbGxhYmxlRnVuY3Rpb24sIElzRGVmaW5lZCxcbiAgSXNPYmplY3QsIElzU3RyaW5nLFxuICBJc1VuZGVmaW5lZCwgU2V0U2Vzc2lvblNpdGVWYXIsIFNsZWVwLFxuICBTcGFjZVRvSHlwaGVuTG93ZXIsIFN0b3JhZ2VHZXR0ZXIsXG4gIFN0cmluZ1JlcGxhY2VBbGxcbn0gZnJvbSAnLi4vcG9wLWNvbW1vbi11dGlsaXR5JztcbmltcG9ydCB7QXBwLCBBdXRoRGV0YWlsc30gZnJvbSAnLi4vcG9wLWNvbW1vbi10b2tlbi5tb2RlbCc7XG5cbmltcG9ydCB7RW50aXR5R2VuZXJhbFRhYiwgRW50aXR5SGlzdG9yeVRhYn0gZnJvbSAnLi9lbnRpdHkvcG9wLWVudGl0eS10YWIvcG9wLWVudGl0eS10YWIubW9kZWwnO1xuaW1wb3J0IHtSb3V0ZXJ9IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XG5pbXBvcnQge0hUVFBfSU5URVJDRVBUT1JTfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5pbXBvcnQge0hlYWRlckludGVyY2VwdG9yLCBSZXNwb25zZTQwMUludGVyY2VwdG9yfSBmcm9tICcuLi9zZXJ2aWNlcy9wb3AtYmFzZS5pbnRlcmNlcHRvcnMnO1xuaW1wb3J0IHtEYXRlQWRhcHRlcn0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvY29yZSc7XG5pbXBvcnQge0N1c3RvbURhdGVBZGFwdGVyfSBmcm9tICcuL2Jhc2UvcG9wLWZpZWxkLWl0ZW0vY3VzdG9tLWRhdGUtYWRhcHRlcic7XG5pbXBvcnQge01hdEljb25SZWdpc3RyeX0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvaWNvbic7XG5pbXBvcnQge0RvbVNhbml0aXplcn0gZnJvbSAnQGFuZ3VsYXIvcGxhdGZvcm0tYnJvd3Nlcic7XG5pbXBvcnQge1BvcENyZWRlbnRpYWxTZXJ2aWNlfSBmcm9tICcuLi9zZXJ2aWNlcy9wb3AtY3JlZGVudGlhbC5zZXJ2aWNlJztcbmltcG9ydCB7RW50aXR5TWVudX0gZnJvbSAnLi9hcHAvcG9wLWxlZnQtbWVudS9lbnRpdHktbWVudS5tb2RlbCc7XG5pbXBvcnQge1BhcnNlTW9kdWxlUm91dGVzRm9yQWxpYXNlc30gZnJvbSAnLi9lbnRpdHkvcG9wLWVudGl0eS11dGlsaXR5JztcbmltcG9ydCB7UG9wRXJyb3JSZWRpcmVjdENvbXBvbmVudH0gZnJvbSAnLi9iYXNlL3BvcC1yZWRpcmVjdHMvcG9wLWVycm9yLXJlZGlyZWN0L3BvcC1lcnJvci1yZWRpcmVjdC5jb21wb25lbnQnO1xuaW1wb3J0IHtQb3BSZWRpcmVjdHNNb2R1bGV9IGZyb20gJy4vYmFzZS9wb3AtcmVkaXJlY3RzL3BvcC1yZWRpcmVjdHMtbW9kdWxlJztcbmltcG9ydCB7UG9wUmVkaXJlY3RHdWFyZH0gZnJvbSAnLi9iYXNlL3BvcC1yZWRpcmVjdHMvcG9wLXJlZGlyZWN0Lmd1YXJkJztcbmltcG9ydCB7UG9wQ2FjaGVSZWRpcmVjdENvbXBvbmVudH0gZnJvbSAnLi9iYXNlL3BvcC1yZWRpcmVjdHMvcG9wLWNhY2hlLXJlZGlyZWN0L3BvcC1jYWNoZS1yZWRpcmVjdC5jb21wb25lbnQnO1xuaW1wb3J0IHtQb3BDYWNoZVJlZGlyZWN0R3VhcmR9IGZyb20gJy4vYmFzZS9wb3AtcmVkaXJlY3RzL3BvcC1jYWNoZS1yZWRpcmVjdC5ndWFyZCc7XG5pbXBvcnQge1BvcEd1YXJkUmVkaXJlY3RDb21wb25lbnR9IGZyb20gJy4vYmFzZS9wb3AtcmVkaXJlY3RzL3BvcC1ndWFyZC1yZWRpcmVjdC9wb3AtZ3VhcmQtcmVkaXJlY3QuY29tcG9uZW50JztcbmltcG9ydCB7UG9wUmVxdWVzdEV4dGVybmFsU2VydmljZX0gZnJvbSAnLi4vc2VydmljZXMvcG9wLXJlcXVlc3QtZXh0ZXJuYWwuc2VydmljZSc7XG5pbXBvcnQge1BvcEVudGl0eVNjaGVtZUNvbXBvbmVudFNlcnZpY2V9IGZyb20gXCIuL2VudGl0eS9zZXJ2aWNlcy9wb3AtZW50aXR5LXNjaGVtZS1jb21wb25lbnQuc2VydmljZVwiO1xuXG5cbmV4cG9ydCBjbGFzcyBBcHBNZW51cyBpbXBsZW1lbnRzIEFwcE1lbnVzSW50ZXJmYWNlIHtcbiAgcHJpdmF0ZSBfbWVudXMgPSBbXTtcblxuXG4gIGdldCgpOiBFbnRpdHlNZW51W10ge1xuICAgIHJldHVybiB0aGlzLl9tZW51cztcbiAgfVxuXG5cbiAgc2V0KG1lbnVzOiBFbnRpdHlNZW51W10pIHtcbiAgICB0aGlzLl9tZW51cyA9IG1lbnVzO1xuICB9XG5cblxuICBpbml0KG1lbnVzOiBFbnRpdHlNZW51W10pOiBFbnRpdHlNZW51W10ge1xuICAgIHJldHVybiBtZW51cztcbiAgfVxufVxuXG5cbmV4cG9ydCBjbGFzcyBBcHBXaWRnZXRzIGltcGxlbWVudHMgQXBwV2lkZ2V0c0ludGVyZmFjZSB7XG4gIHByaXZhdGUgX3dpZGdldHMgPSBbXTtcblxuXG4gIGdldCgpOiBhbnlbXSB7XG4gICAgcmV0dXJuIHRoaXMuX3dpZGdldHM7XG4gIH1cblxuXG4gIHNldCh3aWRnZXRzOiBhbnlbXSkge1xuICAgIHRoaXMuX3dpZGdldHMgPSB3aWRnZXRzO1xuICB9XG59XG5cblxuZXhwb3J0IGNsYXNzIEFwcFRoZW1lIGltcGxlbWVudHMgQXBwVGhlbWVJbnRlcmZhY2Uge1xuICBwcml2YXRlIF90aGVtZSA9ICdkZWZhdWx0JztcbiAgcHJpdmF0ZSBfY29udHJhc3Q6ICdsaWdodCcgfCAnZGFyaycgPSAnbGlnaHQnO1xuICBwcml2YXRlIF9uYW1lID0gJ2RlZmF1bHQtbGlnaHQuY3NzJztcbiAgcHVibGljIGluaXQgPSBuZXcgQmVoYXZpb3JTdWJqZWN0PGJvb2xlYW4+KGZhbHNlKTtcblxuXG4gIGdldCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9uYW1lO1xuICB9XG5cblxuICBzZXQodGhlbWU6IHN0cmluZyA9ICdkZWZhdWx0JywgY29udHJhc3Q6ICdsaWdodCcgfCAnZGFyaycgPSAnbGlnaHQnKSB7XG4gICAgdGhpcy5fdGhlbWUgPSB0aGVtZTtcbiAgICB0aGlzLl9jb250cmFzdCA9IGNvbnRyYXN0O1xuICAgIHRoaXMuX25hbWUgPSBgJHt0aGlzLl90aGVtZX0tJHt0aGlzLl9jb250cmFzdH0uY3NzYDtcbiAgICBjb25zdCB0aGVtZUxpbmsgPSAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RoZW1lRmlsZUVsZScpIGFzIEhUTUxMaW5rRWxlbWVudCk7XG4gICAgaWYgKHRoZW1lTGluaykge1xuICAgICAgY29uc3QgZXhpc3RpbmdUaGVtZSA9IFN0cmluZ1JlcGxhY2VBbGwodGhlbWVMaW5rLmhyZWYuc3BsaXQoUG9wSHJlZikucG9wKCksICcvJywgJycpO1xuICAgICAgaWYgKHRoaXMuX25hbWUgIT09IGV4aXN0aW5nVGhlbWUpIHtcbiAgICAgICAgdGhlbWVMaW5rLmhyZWYgPSB0aGlzLl9uYW1lO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCB0aGVtZUZpbGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW5rJyk7XG4gICAgICB0aGVtZUZpbGUuc2V0QXR0cmlidXRlKCdyZWwnLCAnc3R5bGVzaGVldCcpO1xuICAgICAgdGhlbWVGaWxlLnNldEF0dHJpYnV0ZSgndHlwZScsICd0ZXh0L2NzcycpO1xuICAgICAgdGhlbWVGaWxlLnNldEF0dHJpYnV0ZSgnaHJlZicsIHRoaXMuX25hbWUpO1xuICAgICAgdGhlbWVGaWxlLnNldEF0dHJpYnV0ZSgnaWQnLCAndGhlbWVGaWxlRWxlJyk7XG4gICAgICB0aGVtZUZpbGUub25sb2FkID0gKCkgPT4ge1xuICAgICAgICB0aGlzLmluaXQubmV4dCh0cnVlKTtcbiAgICAgIH07XG4gICAgICBpZiAodHlwZW9mIHRoZW1lRmlsZSAhPSAndW5kZWZpbmVkJykgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXS5hcHBlbmRDaGlsZCh0aGVtZUZpbGUpO1xuICAgIH1cbiAgfVxuXG5cbiAgaXNMb2FkZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5pdC5nZXRWYWx1ZSgpO1xuICB9XG59XG5cblxuZXhwb3J0IGNsYXNzIEFwcEdsb2JhbCBpbXBsZW1lbnRzIEFwcEdsb2JhbEludGVyZmFjZSB7XG4gIHByaXZhdGUgX3ZlcmlmaWVkID0gZmFsc2U7XG4gIHByaXZhdGUgX21vZGFscyA9IDA7XG4gIHByaXZhdGUgX2ZpbHRlcjtcbiAgcHJpdmF0ZSBfcGlwZXM7XG4gIHByaXZhdGUgX2FsaWFzZXM7XG4gIHByaXZhdGUgX2VudGl0aWVzO1xuICBwcml2YXRlIF9zZWN1cml0eTtcbiAgcHJpdmF0ZSBfcGVybWlzc2lvbnM7XG4gIHByaXZhdGUgX29wZW4gPSBmYWxzZTtcbiAgcHVibGljIGluaXQgPSBuZXcgQmVoYXZpb3JTdWJqZWN0PGJvb2xlYW4+KGZhbHNlKTtcbiAgcHVibGljIHZlcmlmaWNhdGlvbiA9IG5ldyBTdWJqZWN0PGJvb2xlYW4+KCk7XG4gIHB1YmxpYyBfdW5sb2FkID0gbmV3IFN1YmplY3Q8Ym9vbGVhbj4oKTtcblxuXG4gIGlzVmVyaWZpZWQoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGJvb2xlYW4+KGFzeW5jIChyZXNvbHZlKSA9PiB7XG4gICAgICBjb25zdCB3YWl0ID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5fdmVyaWZpZWQpIHtcbiAgICAgICAgICBjbGVhckludGVydmFsKHdhaXQpO1xuICAgICAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgICAgICB9XG4gICAgICB9LCA1LCA1KTtcbiAgICB9KTtcbiAgfVxuXG5cbiAgc2V0VmVyaWZpZWQoKTogdm9pZCB7XG4gICAgdGhpcy5fdmVyaWZpZWQgPSB0cnVlO1xuICB9XG5cblxuICBzZXRNb2RhbCgpOiB2b2lkIHtcbiAgICB0aGlzLl9tb2RhbHMrKztcbiAgfVxuXG5cbiAgaXNNb2RhbCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9tb2RhbHM7XG4gIH1cblxuXG4gIHJlbW92ZU1vZGFsKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9tb2RhbHMpIHtcbiAgICAgIHRoaXMuX21vZGFscy0tO1xuICAgIH1cbiAgfVxuXG5cbiAgaXNGaWx0ZXJCYXIoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2ZpbHRlcjtcbiAgfVxuXG5cbiAgc2V0RmlsdGVyQmFyKHZhbHVlOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5fZmlsdGVyID0gdmFsdWU7XG4gIH1cblxuXG4gIGlzUGlwZXMoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3BpcGVzO1xuICB9XG5cblxuICBzZXRQaXBlcyh2YWx1ZTogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuX3BpcGVzID0gdmFsdWU7XG4gIH1cblxuXG4gIGlzQWxpYXNlcygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fYWxpYXNlcztcbiAgfVxuXG5cbiAgc2V0QWxpYXNlcyh2YWx1ZTogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuX2FsaWFzZXMgPSB2YWx1ZTtcbiAgfVxuXG5cbiAgaXNFbnRpdGllcygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fZW50aXRpZXM7XG4gIH1cblxuXG4gIHNldEVudGl0aWVzKHZhbHVlOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5fZW50aXRpZXMgPSB2YWx1ZTtcbiAgfVxuXG5cbiAgc2V0U2VjdXJpdHkodmFsdWU6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLl9zZWN1cml0eSA9IHZhbHVlO1xuICB9XG5cblxuICBpc1NlY3VyaXR5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9zZWN1cml0eTtcbiAgfVxuXG4gIGlzUGVybWlzc2lvbnMoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3Blcm1pc3Npb25zO1xuICB9XG5cbiAgc2V0UGVybWlzc2lvbnModmFsdWU6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLl9wZXJtaXNzaW9ucyA9IHZhbHVlO1xuICB9XG5cblxuICBpc09wZW4oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX29wZW47XG4gIH1cblxuXG4gIHNldE9wZW4odmFsdWU6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLl9vcGVuID0gdmFsdWU7XG4gIH1cbn1cblxuXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbXG4gICAgUG9wUmVkaXJlY3RzTW9kdWxlXG4gIF0sXG4gIGRlY2xhcmF0aW9uczogW10sXG4gIGV4cG9ydHM6IFtdLFxuICBwcm92aWRlcnM6IFtQb3BDcmVkZW50aWFsU2VydmljZV1cbn0pXG5cblxuZXhwb3J0IGNsYXNzIFBvcEluaXRpYWxpemVyTW9kdWxlIHtcblxuICBwcml2YXRlIG5hbWUgPSBgUG9wSW5pdGlhbGl6ZXJNb2R1bGVgO1xuXG4gIHByaXZhdGUgYnVzaW5lc3NJZDtcblxuICBwcml2YXRlIHZlcmlmaWNhdGlvbiA9IHtcbiAgICBwZW5kaW5nOiBmYWxzZSxcbiAgICBzdWJzY3JpcHRpb246IDxTdWJzY3JpcHRpb24+dW5kZWZpbmVkLFxuICAgIGRlYm91bmNlcjogdW5kZWZpbmVkLFxuICAgIHRyaWdnZXI6ICgpID0+IHtcbiAgICAgIGlmICh0aGlzLnZlcmlmaWNhdGlvbi5kZWJvdW5jZXIpIGNsZWFyVGltZW91dCh0aGlzLnZlcmlmaWNhdGlvbi5kZWJvdW5jZXIpO1xuICAgICAgdGhpcy52ZXJpZmljYXRpb24uZGVib3VuY2VyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLl92ZXJpZnlBdXRoU3RvcmFnZSgpO1xuICAgICAgfSwgNSk7XG4gICAgfSxcbiAgICB1bmxvYWQ6ICgpID0+IHtcbiAgICAgIGlmICh0aGlzLnZlcmlmaWNhdGlvbi5zdWJzY3JpcHRpb24pIHtcbiAgICAgICAgdGhpcy52ZXJpZmljYXRpb24uc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy52ZXJpZmljYXRpb24uZGVib3VuY2VyKSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnZlcmlmaWNhdGlvbi5kZWJvdW5jZXIpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBwcml2YXRlIHVubG9hZCA9IHtcbiAgICBwZW5kaW5nOiBmYWxzZSxcbiAgICBzdWJzY3JpcHRpb246IDxTdWJzY3JpcHRpb24+dW5kZWZpbmVkLFxuICAgIGRlYm91bmNlcjogdW5kZWZpbmVkLFxuICAgIHRyaWdnZXI6ICgpID0+IHtcbiAgICAgIGlmICh0aGlzLnVubG9hZC5kZWJvdW5jZXIpIGNsZWFyVGltZW91dCh0aGlzLnVubG9hZC5kZWJvdW5jZXIpO1xuICAgICAgdGhpcy51bmxvYWQuZGVib3VuY2VyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMudW5sb2FkLnJ1bigpO1xuICAgICAgfSwgMCk7XG4gICAgfSxcbiAgICBydW46ICgpID0+IHtcbiAgICAgIGlmICh0aGlzLnVubG9hZC5zdWJzY3JpcHRpb24pIHtcbiAgICAgICAgdGhpcy51bmxvYWQuc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgICB9XG4gICAgICB0aGlzLnZlcmlmaWNhdGlvbi51bmxvYWQoKTtcbiAgICB9XG4gIH07XG5cblxuICBzdGF0aWMgZm9yUm9vdCh0YXNrczogUG9wVGFza1tdID0gW10sIGFwcEdsb2JhbHNQYXJhbXM6IEFwcEdsb2JhbFBhcmFtSW50ZXJmYWNlID0ge30pOiBNb2R1bGVXaXRoUHJvdmlkZXJzPFBvcEluaXRpYWxpemVyTW9kdWxlPiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5nTW9kdWxlOiBQb3BJbml0aWFsaXplck1vZHVsZSxcblxuICAgICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBwcm92aWRlOiAnQVBQX0dMT0JBTCcsXG4gICAgICAgICAgdXNlQ2xhc3M6IEFwcEdsb2JhbFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgcHJvdmlkZTogJ0FQUF9HTE9CQUxfUEFSQU1TJyxcbiAgICAgICAgICB1c2VWYWx1ZTogYXBwR2xvYmFsc1BhcmFtc1xuICAgICAgICB9LFxuICAgICAgICB7cHJvdmlkZTogSFRUUF9JTlRFUkNFUFRPUlMsIHVzZUNsYXNzOiBIZWFkZXJJbnRlcmNlcHRvciwgbXVsdGk6IHRydWV9LFxuICAgICAgICB7cHJvdmlkZTogSFRUUF9JTlRFUkNFUFRPUlMsIHVzZUNsYXNzOiBSZXNwb25zZTQwMUludGVyY2VwdG9yLCBtdWx0aTogdHJ1ZX0sXG4gICAgICAgIHtwcm92aWRlOiBEYXRlQWRhcHRlciwgdXNlQ2xhc3M6IEN1c3RvbURhdGVBZGFwdGVyfSxcbiAgICAgICAge1xuICAgICAgICAgIHByb3ZpZGU6ICdBUFBfSU5JVElBTElaRVJfVEFTS1MnLFxuICAgICAgICAgIHVzZVZhbHVlOiB0YXNrc1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgcHJvdmlkZTogJ0FQUF9NRU5VUycsXG4gICAgICAgICAgdXNlQ2xhc3M6IEFwcE1lbnVzXG4gICAgICAgIH0sXG5cbiAgICAgICAge1xuICAgICAgICAgIHByb3ZpZGU6ICdBUFBfV0lER0VUUycsXG4gICAgICAgICAgdXNlQ2xhc3M6IEFwcFdpZGdldHNcbiAgICAgICAgfSxcblxuICAgICAgICB7XG4gICAgICAgICAgcHJvdmlkZTogJ0FQUF9USEVNRScsXG4gICAgICAgICAgdXNlQ2xhc3M6IEFwcFRoZW1lXG4gICAgICAgIH0sXG5cbiAgICAgIF1cbiAgICB9O1xuICB9XG5cblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGJhc2U6IFBvcEJhc2VTZXJ2aWNlLFxuICAgIHByaXZhdGUgY2FjRmlsdGVyOiBQb3BDYWNGaWx0ZXJCYXJTZXJ2aWNlLFxuICAgIHByaXZhdGUgY29tcG9uZW50RmFjdG9yeVJlc29sdmVyOiBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsXG4gICAgcHJpdmF0ZSBjcmVkZW50aWFsOiBQb3BDcmVkZW50aWFsU2VydmljZSxcbiAgICBwcml2YXRlIGRhdGU6IFBvcERhdGV0aW1lU2VydmljZSxcbiAgICBwcml2YXRlIGVudGl0eTogUG9wRW50aXR5U2VydmljZSxcbiAgICBwcml2YXRlIGV4dGVybmFsQXBpOiBQb3BSZXF1ZXN0RXh0ZXJuYWxTZXJ2aWNlLFxuICAgIHByaXZhdGUgbG9nOiBQb3BMb2dTZXJ2aWNlLFxuICAgIHByaXZhdGUgaGlzdG9yeTogUG9wUm91dGVIaXN0b3J5UmVzb2x2ZXIsXG4gICAgcHJpdmF0ZSBpY29uUmVnaXN0cnk6IE1hdEljb25SZWdpc3RyeSxcbiAgICBwcml2YXRlIHBpcGU6IFBvcFBpcGVTZXJ2aWNlLFxuICAgIHByaXZhdGUgcG9ydGFsOiBQb3BFbnRpdHlVdGlsUG9ydGFsU2VydmljZSxcbiAgICBwcml2YXRlIHJlcXVlc3Q6IFBvcFJlcXVlc3RTZXJ2aWNlLFxuICAgIHByaXZhdGUgcm91dGVyOiBSb3V0ZXIsXG4gICAgcHJpdmF0ZSBzYW5pdGl6ZXI6IERvbVNhbml0aXplcixcbiAgICBwcml2YXRlIHNjaGVtZUNvbXBvbmVudDogUG9wRW50aXR5U2NoZW1lQ29tcG9uZW50U2VydmljZSxcbiAgICBwcml2YXRlIHRlbXBsYXRlOiBQb3BUZW1wbGF0ZVNlcnZpY2UsXG4gICAgcHJpdmF0ZSBwbGF0Zm9ybTogUGxhdGZvcm1Mb2NhdGlvbixcbiAgICBASW5qZWN0KEluamVjdG9yKSBwcml2YXRlIGluamVjdG9yLFxuICAgIEBJbmplY3QoJ0FQUF9JTklUSUFMSVpFUl9UQVNLUycpIHB1YmxpYyB0YXNrczogUG9wVGFza1tdLFxuICAgIEBJbmplY3QoJ0FQUF9HTE9CQUwnKSBwdWJsaWMgQVBQX0dMT0JBTDogQXBwR2xvYmFsSW50ZXJmYWNlLFxuICAgIEBJbmplY3QoJ0FQUF9HTE9CQUxfUEFSQU1TJykgcHVibGljIEFQUF9HTE9CQUxfUEFSQU1TOiBBcHBHbG9iYWxQYXJhbUludGVyZmFjZSxcbiAgICBASW5qZWN0KCdBUFBfVEhFTUUnKSBwdWJsaWMgQVBQX1RIRU1FOiBBcHBUaGVtZUludGVyZmFjZSxcbiAgICBASW5qZWN0KCdlbnYnKSBwcml2YXRlIGVudj8sXG4gICkge1xuICAgIHRoaXMuaWNvblJlZ2lzdHJ5LmFkZFN2Z0ljb24oJ2FkbWluJywgdGhpcy5zYW5pdGl6ZXIuYnlwYXNzU2VjdXJpdHlUcnVzdFJlc291cmNlVXJsKCdhc3NldHMvaW1hZ2VzL2FkbWluLnN2ZycpKTtcblxuICAgIGNvbnN0IHNldHVwID0gbmV3IFByb21pc2U8Ym9vbGVhbj4oYXN5bmMgKHJlc29sdmUpID0+IHtcbiAgICAgIGNvbnN0IGF1dGggPSB0aGlzLmJhc2UuZ2V0QXV0aERldGFpbHMoKTtcbiAgICAgIGNvbnN0IGxvZ2luID0gR2V0U2Vzc2lvblNpdGVWYXIoJ0xvZ2luLnRpbWUnLCAwKTtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgdGhpcy5fc2V0QnVzaW5lc3NJZChhdXRoKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5sb2coZSk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHB1YmxpY0ZhY2luZ0FwcCA9IHRoaXMuQVBQX0dMT0JBTF9QQVJBTVMub3BlbiA/IHRydWUgOiBmYWxzZTtcbiAgICAgIGlmICghcHVibGljRmFjaW5nQXBwICYmIElzT2JqZWN0KGF1dGgsIFsnaWQnLCAnYnVzaW5lc3NlcycsICd1c2VycycsICd0b2tlbicsICdlbWFpbF92ZXJpZmllZF9hdCddKSAmJiAhKHRoaXMuYmFzZS5pc0F1dGhFeHBpcmVkKCkpKSB7XG4gICAgICAgIGF3YWl0IHRoaXMuX2xvYWRBcHBUaGVtZSgpO1xuICAgICAgICBhd2FpdCB0aGlzLl9pbml0KGF1dGgpO1xuICAgICAgICBQb3BMb2cuaW5pdCh0aGlzLm5hbWUsIGA6cHVibGljRmFjaW5nQXBwYCwgcHVibGljRmFjaW5nQXBwKTtcbiAgICAgICAgLyoqIFRoaXMgaXMgZXhwZXJpbWVudGFsIHRlc3RpbmcgaWYgYXBwIGNhbiBiZSBzcGVlZCB1cCAgKiovXG4gICAgICAgIGlmICh0aGlzLmJ1c2luZXNzSWQgJiYgU3RvcmFnZUdldHRlcihhdXRoLCBbJ2J1c2luZXNzZXMnLCB0aGlzLmJ1c2luZXNzSWQsICdhcHBzJ10pICYmICFsb2dpbikge1xuICAgICAgICAgIFBvcExvZy5pbml0KHRoaXMubmFtZSwgYDpmaXJlIGFwcCBlYXJseT9gKTtcbiAgICAgICAgICB0aGlzLkFQUF9HTE9CQUwuc2V0VmVyaWZpZWQoKTtcbiAgICAgICAgICB0aGlzLkFQUF9HTE9CQUwuaW5pdC5uZXh0KHRydWUpO1xuICAgICAgICB9XG4gICAgICAgIC8qKiAqKioqKioqKioqKioqKioqKioqKioqKiAqKi9cblxuICAgICAgICBjb25zdCB2ZXJpZmllZCA9IGF3YWl0IHRoaXMuX3ZlcmlmeUF1dGhTdG9yYWdlKCk7XG4gICAgICAgIGlmICghdmVyaWZpZWQpIHtcbiAgICAgICAgICBpZiAoIWlzRGV2TW9kZSgpKSB7XG4gICAgICAgICAgICBpZiAoZmFsc2UpIHtcbiAgICAgICAgICAgICAgdGhpcy5iYXNlLmNsZWFyQXV0aERldGFpbHMoYFBvcEluaXRpYWxpemVyTW9kdWxlOnNldHVwYCk7XG4gICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gd2luZG93LmxvY2F0aW9uLnByb3RvY29sICsgJy8vJyArIHdpbmRvdy5sb2NhdGlvbi5ob3N0ICsgJy91c2VyL2xlZ2FjeS9hdXRoL2NsZWFyJztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIFBvcExvZy5pbml0KHRoaXMubmFtZSwgYDp2ZXJpZmljYXRpb24gZmFpbGVkYCk7XG4gICAgICAgICAgICAgIHRoaXMuQVBQX0dMT0JBTC5zZXRWZXJpZmllZCgpO1xuICAgICAgICAgICAgICB0aGlzLkFQUF9HTE9CQUwuaW5pdC5uZXh0KHRydWUpO1xuICAgICAgICAgICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBQb3BMb2cuaW5pdCh0aGlzLm5hbWUsIGA6dmVyaWZpY2F0aW9uIGZhaWxlZGApO1xuICAgICAgICAgICAgdGhpcy5BUFBfR0xPQkFMLmluaXQubmV4dCh0cnVlKTtcbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl93ZWxjb21lKCk7XG5cbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlmKHRoaXMuQVBQX0dMT0JBTC5pc1NlY3VyaXR5KCkgJiYgSXNTdHJpbmcoUG9wSHJlZiwgdHJ1ZSkpIHtcbiAgICAgICAgLy8gICB0aGlzLmJhc2UuY2hlY2tBcHBBY2Nlc3MoUG9wSHJlZiwgdHJ1ZSk7XG4gICAgICAgIC8vIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIFNldFNlc3Npb25TaXRlVmFyKCdBcHAudGhlbWUnLCBudWxsKTtcbiAgICAgICAgU2V0U2Vzc2lvblNpdGVWYXIoJ0FwcC50aGVtZUNvbnRyYXN0JywgbnVsbCk7XG4gICAgICAgIGF3YWl0IHRoaXMuX2xvYWRBcHBUaGVtZSgpO1xuICAgICAgICBhd2FpdCB0aGlzLl9zZXREZXBlbmRlbmNpZXMoZmFsc2UsIG51bGwpO1xuICAgICAgICBpZiAodGhpcy5BUFBfR0xPQkFMLmlzT3BlbigpKSB7XG4gICAgICAgICAgdGhpcy5BUFBfR0xPQkFMLnNldFZlcmlmaWVkKCk7XG4gICAgICAgICAgdGhpcy5BUFBfR0xPQkFMLmluaXQubmV4dCh0cnVlKTtcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLkFQUF9HTE9CQUwuaW5pdC5uZXh0KHRydWUpO1xuICAgICAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBzZXR1cC5jYXRjaCgoZSkgPT4ge1xuICAgICAgaWYgKGlzRGV2TW9kZSgpKSBjb25zb2xlLmxvZygnZScsIGUpO1xuICAgICAgdGhpcy5BUFBfR0xPQkFMLmluaXQubmV4dCh0cnVlKTtcbiAgICB9KTtcbiAgfVxuXG5cbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBVbmRlciBUaGUgSG9vZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIFByaXZhdGUgTWV0aG9kICkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cblxuICAvKipcbiAgICogTG9hZCB0aGUgYXBwIGRlcGVuZGVuY2llc1xuICAgKiBAcGFyYW0gYnVzaW5lc3NcbiAgICovXG4gIHByaXZhdGUgX3NldERlcGVuZGVuY2llcyhhdXRoZW50aWNhdGVkOiBib29sZWFuLCBhdXRoOiBBdXRoRGV0YWlscyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxib29sZWFuPihhc3luYyAocmVzb2x2ZSkgPT4ge1xuICAgICAgdGhpcy5BUFBfR0xPQkFMLnNldEFsaWFzZXMoSXNEZWZpbmVkKHRoaXMuZW52LmFsaWFzZXMpID8gdGhpcy5lbnYuYWxpYXNlcyA6IChJc0RlZmluZWQodGhpcy5BUFBfR0xPQkFMX1BBUkFNUy5hbGlhc2VzKSA/IHRoaXMuQVBQX0dMT0JBTF9QQVJBTVMuYWxpYXNlcyA6IHRydWUpKTtcbiAgICAgIHRoaXMuQVBQX0dMT0JBTC5zZXRGaWx0ZXJCYXIoSXNEZWZpbmVkKHRoaXMuZW52LmZpbHRlcikgPyB0aGlzLmVudi5maWx0ZXIgOiAoSXNEZWZpbmVkKHRoaXMuQVBQX0dMT0JBTF9QQVJBTVMuZmlsdGVyKSA/IHRoaXMuQVBQX0dMT0JBTF9QQVJBTVMuYWxpYXNlcyA6IHRydWUpKTtcbiAgICAgIHRoaXMuQVBQX0dMT0JBTC5zZXRQaXBlcyhJc0RlZmluZWQodGhpcy5lbnYucGlwZXMpID8gdGhpcy5lbnYucGlwZXMgOiAoSXNEZWZpbmVkKHRoaXMuQVBQX0dMT0JBTF9QQVJBTVMucGlwZXMpID8gdGhpcy5BUFBfR0xPQkFMX1BBUkFNUy5waXBlcyA6IHRydWUpKTtcbiAgICAgIHRoaXMuQVBQX0dMT0JBTC5zZXRFbnRpdGllcyhJc0RlZmluZWQodGhpcy5lbnYuZW50aXRpZXMpID8gdGhpcy5lbnYuZW50aXRpZXMgOiAoSXNEZWZpbmVkKHRoaXMuQVBQX0dMT0JBTF9QQVJBTVMuZW50aXRpZXMpID8gdGhpcy5BUFBfR0xPQkFMX1BBUkFNUy5lbnRpdGllcyA6IHRydWUpKTtcbiAgICAgIHRoaXMuQVBQX0dMT0JBTC5zZXRPcGVuKElzRGVmaW5lZCh0aGlzLmVudi5vcGVuKSA/IHRoaXMuZW52Lm9wZW4gOiAoSXNEZWZpbmVkKHRoaXMuQVBQX0dMT0JBTF9QQVJBTVMub3BlbikgPyB0aGlzLkFQUF9HTE9CQUxfUEFSQU1TLm9wZW4gOiBmYWxzZSkpO1xuICAgICAgdGhpcy5BUFBfR0xPQkFMLnNldFNlY3VyaXR5KElzRGVmaW5lZCh0aGlzLmVudi5zZWN1cml0eSkgPyB0aGlzLmVudi5zZWN1cml0eSA6IChJc0RlZmluZWQodGhpcy5BUFBfR0xPQkFMX1BBUkFNUy5zZWN1cml0eSkgPyB0aGlzLkFQUF9HTE9CQUxfUEFSQU1TLnNlY3VyaXR5IDogZmFsc2UpKTtcbiAgICAgIHRoaXMuQVBQX0dMT0JBTC5zZXRQZXJtaXNzaW9ucyhJc0RlZmluZWQodGhpcy5lbnYucGVybWlzc2lvbnMpID8gdGhpcy5lbnYucGVybWlzc2lvbnMgOiAoSXNEZWZpbmVkKHRoaXMuQVBQX0dMT0JBTF9QQVJBTVMucGVybWlzc2lvbnMpID8gdGhpcy5BUFBfR0xPQkFMX1BBUkFNUy5wZXJtaXNzaW9ucyA6IGZhbHNlKSk7XG5cbiAgICAgIFNldFNlcnZpY2VJbmplY3Rvcih0aGlzLmluamVjdG9yKTtcbiAgICAgIFNldFBvcEVudih0aGlzLmVudiA/IHRoaXMuZW52IDoge30pO1xuICAgICAgU2V0UG9wRXh0ZXJuYWxBcGkodGhpcy5leHRlcm5hbEFwaSk7XG4gICAgICBTZXRQb3BIcmVmKFN0cmluZ1JlcGxhY2VBbGwodGhpcy5wbGF0Zm9ybS5nZXRCYXNlSHJlZkZyb21ET00oKSwgJy8nLCAnJykpO1xuICAgICAgU2V0UG9wTG9nZ2VyKHRoaXMubG9nKTtcbiAgICAgIFNldFBvcFJlcXVlc3QodGhpcy5yZXF1ZXN0KTtcbiAgICAgIFNldFBvcFRlbXBsYXRlKHRoaXMudGVtcGxhdGUpO1xuICAgICAgU2V0UG9wQ29tcG9uZW50UmVzb2x2ZXIodGhpcy5jb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIpO1xuICAgICAgaWYgKGF1dGhlbnRpY2F0ZWQpIHtcbiAgICAgICAgU2V0UG9wRGF0ZSh0aGlzLmRhdGUpO1xuICAgICAgICBTZXRQb3BIaXN0b3J5KHRoaXMuaGlzdG9yeSk7XG4gICAgICAgIFNldFBvcEVudGl0eSh0aGlzLmVudGl0eSk7XG4gICAgICAgIFNldFBvcFBpcGUodGhpcy5waXBlKTtcbiAgICAgICAgU2V0UG9wUG9ydGFsKHRoaXMucG9ydGFsKTtcbiAgICAgICAgU2V0UG9wU2NoZW1lQ29tcG9uZW50KHRoaXMuc2NoZW1lQ29tcG9uZW50KTtcbiAgICAgICAgdGhpcy5fc2V0QXV0aEdsb2JhbChhdXRoKTtcbiAgICAgICAgdGhpcy5fc2V0QnVzaW5lc3NJZChhdXRoKTtcbiAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAgIHRoaXMuX3NldFJvdXRlQ2FjaGVDbGVhcigpLFxuICAgICAgICAgIHRoaXMuX3NldFJvdXRlRXJyb3JIYW5kbGluZygpLFxuICAgICAgICAgIHRoaXMuX3NldEJ1c2luZXNzQXNzZXRzKGF1dGgpLFxuICAgICAgICAgIHRoaXMuX2xvYWRQaXBlUmVzb3VyY2VzKCksXG4gICAgICAgIF0pO1xuICAgICAgICBhd2FpdCB0aGlzLl9sb2FkRmlsdGVyRGF0YSgpO1xuXG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICB9KTtcbiAgfVxuXG5cbiAgcHJpdmF0ZSBfaW5pdChhdXRoOiBBdXRoRGV0YWlscyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxib29sZWFuPihhc3luYyAocmVzb2x2ZSkgPT4ge1xuICAgICAgYXdhaXQgdGhpcy5fc2V0RGVwZW5kZW5jaWVzKHRydWUsIGF1dGgpO1xuICAgICAgYXdhaXQgdGhpcy5fc2V0QW5jaWxsYXJ5KGF1dGgpO1xuICAgICAgYXdhaXQgdGhpcy5fY29uZmlndXJlKGF1dGgpO1xuICAgICAgdGhpcy5BUFBfR0xPQkFMLmluaXQubmV4dCh0cnVlKTtcbiAgICAgIGlmICghdGhpcy51bmxvYWQuc3Vic2NyaXB0aW9uKSB7XG4gICAgICAgIFBvcExvZy5pbml0KHRoaXMubmFtZSwgYHJlZ2lzdGVyaW5nIHVubG9hZCByZXF1ZXN0IHN1YnNjcmlwdGlvbmApO1xuICAgICAgICB0aGlzLnVubG9hZC5zdWJzY3JpcHRpb24gPSB0aGlzLkFQUF9HTE9CQUwuX3VubG9hZC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICAgIFBvcExvZy5pbml0KHRoaXMubmFtZSwgYHVubG9hZDogcmVxdWVzdGVkYCk7XG4gICAgICAgICAgdGhpcy51bmxvYWQudHJpZ2dlcigpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgIH0pO1xuICB9XG5cblxuICBwcml2YXRlIF9zZXRBbmNpbGxhcnkoYXV0aDogQXV0aERldGFpbHMpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgKHJlc29sdmUpID0+IHtcbiAgICAgIGF3YWl0IHRoaXMuX3Rhc2tzKCk7XG4gICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICB9KTtcbiAgfVxuXG5cbiAgcHJpdmF0ZSBfY29uZmlndXJlKGF1dGg6IEF1dGhEZXRhaWxzKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGJvb2xlYW4+KGFzeW5jIChyZXNvbHZlKSA9PiB7XG4gICAgICBpZiAoSXNPYmplY3QoYXV0aCwgWydpZCcsICdidXNpbmVzc2VzJywgJ3VzZXJzJywgJ3Rva2VuJ10pICYmICEodGhpcy5iYXNlLmlzQXV0aEV4cGlyZWQoKSkgJiYgUG9wSHJlZikge1xuICAgICAgICBpZiAoSXNPYmplY3QoUG9wQnVzaW5lc3MsIFsnaWQnXSkpIHtcbiAgICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgICAgICB0aGlzLl9zZXRCdXNpbmVzc1VzZXJTZXR0aW5ncygpLFxuICAgICAgICAgICAgdGhpcy5fc2V0RmlsdGVyQWxpYXNlcygpLFxuICAgICAgICAgICAgdGhpcy5fc2V0Um91dGVBbGlhc01hcCgpLFxuICAgICAgICAgICAgdGhpcy5fc2V0RGVmYXVsdFRhYnMoKSxcbiAgICAgICAgICBdKTtcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBQb3BMb2cuaW5pdCh0aGlzLm5hbWUsIGBObyBCdXNpbmVzcyBGb3VuZGApO1xuICAgICAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG5cbiAgcHJpdmF0ZSBfdGFza3MoKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGJvb2xlYW4+KGFzeW5jIChyZXNvbHZlKSA9PiB7XG4gICAgICBpZiAoSXNPYmplY3QoUG9wQnVzaW5lc3MsIHRydWUpKSB7XG4gICAgICAgIGlmIChJc0FycmF5KHRoaXMudGFza3MsIHRydWUpKSB7XG4gICAgICAgICAgdGhpcy50YXNrcy5tYXAoKHRhc2spID0+IHtcbiAgICAgICAgICAgIGlmIChJc0NhbGxhYmxlRnVuY3Rpb24odGFzaykpIHtcbiAgICAgICAgICAgICAgdGFzaygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICB9KTtcbiAgfVxuXG5cbiAgcHJpdmF0ZSBfc2V0QXV0aEdsb2JhbChhdXRoOiBBdXRoRGV0YWlscykge1xuICAgIFNldFBvcEF1dGgoe1xuICAgICAgaWQ6IGF1dGguaWQsXG4gICAgICBuYW1lOiBhdXRoLm5hbWUsXG4gICAgICBmaXJzdF9uYW1lOiBhdXRoLmZpcnN0X25hbWUsXG4gICAgICBsYXN0X25hbWU6IGF1dGgubGFzdF9uYW1lLFxuICAgICAgaW5pdGlhbHM6IGF1dGguaW5pdGlhbHMsXG4gICAgICBlbWFpbDogYXV0aC5lbWFpbCxcbiAgICAgIGVtYWlsX3ZlcmlmaWVkX2F0OiBhdXRoLmVtYWlsX3ZlcmlmaWVkX2F0LFxuICAgICAgYXZhdGFyTGluazogU3RvcmFnZUdldHRlcihhdXRoLCBbJ3Byb2ZpbGUnLCAnYXZhdGFyX2xpbmsnXSwgbnVsbCksXG4gICAgICB1c2VybmFtZTogYXV0aC51c2VybmFtZSxcbiAgICAgIGNyZWF0ZWRfYXQ6IGF1dGguY3JlYXRlZF9hdFxuICAgIH0pO1xuICB9XG5cblxuICBwcml2YXRlIF9zZXRCdXNpbmVzc0lkKGF1dGg6IEF1dGhEZXRhaWxzKSB7XG4gICAgaWYgKElzVW5kZWZpbmVkKHRoaXMuYnVzaW5lc3NJZCkpIHRoaXMuYnVzaW5lc3NJZCA9IDA7XG4gICAgaWYgKElzT2JqZWN0KGF1dGguYnVzaW5lc3NlcywgdHJ1ZSkpIHtcbiAgICAgIGlmICghdGhpcy5idXNpbmVzc0lkKSB0aGlzLmJ1c2luZXNzSWQgPSBTdHJpbmcoR2V0U2l0ZVZhcignQnVzaW5lc3MubGFzdCcsIDApKTtcbiAgICAgIGlmICghKCt0aGlzLmJ1c2luZXNzSWQgJiYgdGhpcy5idXNpbmVzc0lkIGluIGF1dGguYnVzaW5lc3NlcykpIHtcbiAgICAgICAgdGhpcy5idXNpbmVzc0lkID0gdGhpcy5iYXNlLmdldEN1cnJlbnRCdXNpbmVzc0lkKCk7XG4gICAgICB9XG4gICAgICBpZiAoK3RoaXMuYnVzaW5lc3NJZCAmJiB0aGlzLmJ1c2luZXNzSWQgaW4gYXV0aC5idXNpbmVzc2VzKSB7XG4gICAgICAgIHRoaXMuYnVzaW5lc3NJZCA9ICt0aGlzLmJ1c2luZXNzSWQ7XG4gICAgICB9IGVsc2UgaWYgKCthdXRoLmJ1c2luZXNzX2ZrICYmIGF1dGguYnVzaW5lc3NfZmsgaW4gYXV0aC5idXNpbmVzc2VzKSB7XG4gICAgICAgIHRoaXMuYnVzaW5lc3NJZCA9ICthdXRoLmJ1c2luZXNzX2ZrO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5idXNpbmVzc0lkID0gSXNPYmplY3QoYXV0aC5idXNpbmVzc2VzLCB0cnVlKSA/ICtPYmplY3Qua2V5cyhhdXRoLmJ1c2luZXNzZXMpWzBdIDogMDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBWZXJpZnkgdGhhdCB0aGUgY3VycmVudCBhdXRoIHN0b3JhZ2UgaXMgc3RpbGwgcmVsZXZhbnRcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHByaXZhdGUgX3ZlcmlmeUF1dGhTdG9yYWdlKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShhc3luYyAocmVzb2x2ZSkgPT4ge1xuICAgICAgaWYgKElzT2JqZWN0KFBvcEF1dGgsIFsnY3JlYXRlZF9hdCddKSAmJiBJc0RlZmluZWQoUG9wQXV0aC5lbWFpbF92ZXJpZmllZF9hdCwgZmFsc2UpICYmICF0aGlzLnZlcmlmaWNhdGlvbi5wZW5kaW5nKSB7XG4gICAgICAgIFBvcExvZy5pbml0KHRoaXMubmFtZSwgYFZlcmlmaWNhdGlvbjogSW4gUHJvZ3Jlc3NgKTtcbiAgICAgICAgaWYgKCF0aGlzLmJ1c2luZXNzSWQpIHtcbiAgICAgICAgICBQb3BMb2cuaW5pdCh0aGlzLm5hbWUsIGBWZXJpZmljYXRpb246Q29tcGxldGUgLSBubyBidXNpbmVzc2ApO1xuICAgICAgICAgIHRoaXMuQVBQX0dMT0JBTC5zZXRWZXJpZmllZCgpO1xuICAgICAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudmVyaWZpY2F0aW9uLnBlbmRpbmcgPSB0cnVlO1xuICAgICAgICBjb25zdCBhdXRoID0gYXdhaXQgdGhpcy5jcmVkZW50aWFsLnZlcmlmeSh0aGlzLmJ1c2luZXNzSWQpO1xuICAgICAgICBpZiAoYXV0aCkge1xuICAgICAgICAgIHRoaXMuX3NldEF1dGhHbG9iYWwoYXV0aCk7XG4gICAgICAgICAgdGhpcy5fc2V0QnVzaW5lc3NJZChhdXRoKTtcbiAgICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgICAgICB0aGlzLl9zZXRCdXNpbmVzc0Fzc2V0cyhhdXRoKSxcbiAgICAgICAgICAgIHRoaXMuX2xvYWRBcHBUaGVtZSgpLFxuICAgICAgICAgICAgdGhpcy5fc2V0QW5jaWxsYXJ5KGF1dGgpLFxuICAgICAgICAgICAgdGhpcy5fY29uZmlndXJlKGF1dGgpLFxuICAgICAgICAgICAgdGhpcy5fc2V0Um91dGVBbGlhc2VzKClcbiAgICAgICAgICBdKTtcblxuICAgICAgICAgIHRoaXMuQVBQX0dMT0JBTC5zZXRWZXJpZmllZCgpO1xuICAgICAgICAgIFBvcExvZy5pbml0KHRoaXMubmFtZSwgYFZlcmlmaWNhdGlvbjogQ29tcGxldGVgKTtcbiAgICAgICAgICB0aGlzLnZlcmlmaWNhdGlvbi5wZW5kaW5nID0gZmFsc2U7XG4gICAgICAgICAgdGhpcy5BUFBfR0xPQkFMLmluaXQubmV4dCh0cnVlKTtcbiAgICAgICAgICBpZiAoIXRoaXMudmVyaWZpY2F0aW9uLnN1YnNjcmlwdGlvbikge1xuICAgICAgICAgICAgUG9wTG9nLmluaXQodGhpcy5uYW1lLCBgcmVnaXN0ZXJpbmcgdmVyaWZpY2F0aW9uIHJlcXVlc3Qgc3Vic2NyaXB0aW9uYCk7XG4gICAgICAgICAgICB0aGlzLnZlcmlmaWNhdGlvbi5zdWJzY3JpcHRpb24gPSB0aGlzLkFQUF9HTE9CQUwudmVyaWZpY2F0aW9uLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgICAgICAgIFBvcExvZy5pbml0KHRoaXMubmFtZSwgYF92ZXJpZnlBdXRoU3RvcmFnZTogcmVxdWVzdGVkYCk7XG4gICAgICAgICAgICAgIHRoaXMudmVyaWZpY2F0aW9uLnRyaWdnZXIoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiByZXNvbHZlKGZhbHNlKTtcbiAgICAgIH1cblxuICAgIH0pO1xuICB9XG5cblxuICAvKipcbiAgICogVGhpcyBmeCB3aWxsIHNldCB1cCBhbGwgdGhlIG5lY2Vzc2FyeSBidXNpbmVzcyBhc3NldHMgdGhhdCBhcmUgbmVlZGVkXG4gICAqIEBwYXJhbSBhdXRoXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBwcml2YXRlIF9zZXRCdXNpbmVzc0Fzc2V0cyhhdXRoOiBBdXRoRGV0YWlscykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShhc3luYyAocmVzb2x2ZSkgPT4ge1xuICAgICAgaWYgKCt0aGlzLmJ1c2luZXNzSWQgJiYgSXNPYmplY3QoYXV0aCwgWydpZCcsICdidXNpbmVzc2VzJywgJ3VzZXJzJywgJ3Rva2VuJ10pKSB7XG4gICAgICAgIHRoaXMuYmFzZS5zZXRDdXJyZW50QnVzaW5lc3NJZCgrdGhpcy5idXNpbmVzc0lkKTtcbiAgICAgICAgU2V0UG9wVXNlcihJc09iamVjdChhdXRoLnVzZXJzLCB0cnVlKSAmJiB0aGlzLmJ1c2luZXNzSWQgaW4gYXV0aC51c2VycyA/IGF1dGgudXNlcnNbdGhpcy5idXNpbmVzc0lkXSA6IG51bGwpO1xuICAgICAgICBTZXRQb3BCdXNpbmVzcyhJc09iamVjdChhdXRoLmJ1c2luZXNzZXMsIHRydWUpICYmIHRoaXMuYnVzaW5lc3NJZCBpbiBhdXRoLmJ1c2luZXNzZXMgPyBhdXRoLmJ1c2luZXNzZXNbdGhpcy5idXNpbmVzc0lkXSA6IG51bGwpO1xuICAgICAgICBTZXRQb3BBcHAoSXNPYmplY3QoUG9wQnVzaW5lc3MuYXBwcywgW1BvcEhyZWZdKSA/IFBvcEJ1c2luZXNzLmFwcHNbUG9wSHJlZl0gOiBudWxsKTtcbiAgICAgICAgLy8gaWYgKCFJc09iamVjdChQb3BBcHAsIFsnaWQnLCAnbmFtZSddKSkge1xuICAgICAgICAvLyAgIGlmICghaXNEZXZNb2RlKCkpIHtcbiAgICAgICAgLy8gICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gd2luZG93LmxvY2F0aW9uLnByb3RvY29sICsgJy8vJyArIHdpbmRvdy5sb2NhdGlvbi5ob3N0ICsgJy9ob21lJztcbiAgICAgICAgLy8gICB9XG4gICAgICAgIC8vIH1cbiAgICAgICAgYXdhaXQgdGhpcy5fc2V0QnVzaW5lc3NBcHBFbnRpdGllcygpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc29sdmUodHJ1ZSk7XG4gICAgfSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIGZ4IHdpbGwgbG9vcCB0aHJvdWdoIGFsbCB0aGUgYXBwcyBpbiB0aGUgY3VycmVudCBidXNpbmVzcywgYW5kIGZvciBlYWNoIGVudGl0eSBpbiB0aGF0IGJ1c2luZXNzIHJlZ2lzdGVyIHRoZSBkZXRhaWxzXG4gICAqL1xuICBwcml2YXRlIF9zZXRCdXNpbmVzc0FwcEVudGl0aWVzKCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShhc3luYyAocmVzb2x2ZSkgPT4ge1xuICAgICAgY29uc3QgYXV0aCA9IHRoaXMuYmFzZS5nZXRBdXRoRGV0YWlscygpO1xuICAgICAgaWYgKElzT2JqZWN0KFBvcEJ1c2luZXNzLCBbJ2lkJywgJ2FwcHMnXSkgJiYgSXNPYmplY3QoUG9wQnVzaW5lc3MuYXBwcywgdHJ1ZSkpIHtcbiAgICAgICAgY29uc3QgaW5hY2Nlc3NpYmxlQXBwcyA9IFtdO1xuICAgICAgICBjb25zdCBwZXJtYW5lbnRBcHBzID0gWydsaWJyYXJ5JywgJ2hvbWUnXTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ1BvcFVzZXInLCBQb3BVc2VyKTtcbiAgICAgICAgT2JqZWN0LmtleXMoUG9wQnVzaW5lc3MuYXBwcykubWFwKChhcHBOYW1lKSA9PiB7XG4gICAgICAgICAgY29uc3QgYXBwID0gUG9wQnVzaW5lc3MuYXBwc1thcHBOYW1lXTtcbiAgICAgICAgICBhcHAuaGFzQ3JlYXRlQWNjZXNzID0gZmFsc2U7XG4gICAgICAgICAgaWYgKElzT2JqZWN0KGFwcCwgdHJ1ZSkgJiYgSXNPYmplY3QoYXBwLmVudGl0aWVzLCB0cnVlKSkge1xuICAgICAgICAgICAgT2JqZWN0LmtleXMoYXBwLmVudGl0aWVzKS5tYXAoKG5hbWU6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICBpZiAoSXNPYmplY3QoYXBwLmVudGl0aWVzW25hbWVdLCBbJ2lkJywgJ25hbWUnLCAnaW50ZXJuYWxfbmFtZSddKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVudGl0eSA9IGFwcC5lbnRpdGllc1tuYW1lXTtcbiAgICAgICAgICAgICAgICBlbnRpdHkuYWNjZXNzID0ge307XG5cbiAgICAgICAgICAgICAgICBpZiAoSXNPYmplY3QoUG9wVXNlciwgWydwZXJtaXNzaW9ucyddKSAmJiBJc09iamVjdChQb3BVc2VyLnBlcm1pc3Npb25zLCB0cnVlKSAmJiBlbnRpdHkuaW50ZXJuYWxfbmFtZSBpbiBQb3BVc2VyLnBlcm1pc3Npb25zKSB7XG4gICAgICAgICAgICAgICAgICBlbnRpdHkuYWNjZXNzID0gUG9wVXNlci5wZXJtaXNzaW9uc1tlbnRpdHkuaW50ZXJuYWxfbmFtZV07XG4gICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhlbnRpdHkuaW50ZXJuYWxfbmFtZSwgZW50aXR5LmFjY2Vzcy5jYW5fcmVhZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChlbnRpdHkuYWNjZXNzLmNhbl9jcmVhdGUpIGFwcC5oYXNDcmVhdGVBY2Nlc3MgPSB0cnVlO1xuICAgICAgICAgICAgICAgIFBvcEVudGl0eS5zZXRFbnRpdHlQYXJhbXMoZW50aXR5KTtcbiAgICAgICAgICAgICAgICBQb3BQaXBlLnVwZGF0ZUVudGl0eUFsaWFzKGVudGl0eS5pZCwgZW50aXR5LmFsaWFzKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh0aGlzLkFQUF9HTE9CQUwuaXNFbnRpdGllcygpICYmICFhcHAuaGFzQ3JlYXRlQWNjZXNzKSB7XG5cbiAgICAgICAgICAgIGlmICghKHBlcm1hbmVudEFwcHMuaW5jbHVkZXMoKGFwcC5uYW1lKSkpKSB7XG4gICAgICAgICAgICAgIGluYWNjZXNzaWJsZUFwcHMucHVzaChhcHAubmFtZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICAvLyBjb25zb2xlLmxvZygnaW5hY2Nlc3NpYmxlQXBwcycsIGluYWNjZXNzaWJsZUFwcHMpO1xuICAgICAgICBpZiAoSXNBcnJheShpbmFjY2Vzc2libGVBcHBzLCB0cnVlKSkge1xuICAgICAgICAgIGluYWNjZXNzaWJsZUFwcHMubWFwKChhcHBOYW1lMjogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICBkZWxldGUgUG9wQnVzaW5lc3MuYXBwc1thcHBOYW1lMl07XG4gICAgICAgICAgICBkZWxldGUgYXV0aC5idXNpbmVzc2VzW1BvcEJ1c2luZXNzLmlkXS5hcHBzW2FwcE5hbWUyXTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmJhc2Uuc2V0QXV0aERldGFpbHMoYXV0aCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICB9KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIExvYWQgdGhlIGNsaWVudCxhY2NvdW50LGNhbXBhaWduIGRhdGEgcmVxdWlyZWQgZm9yIHRoZSBmaWx0ZXIgYmFyXG4gICAqIEBwYXJhbSBidXNpbmVzc1xuICAgKi9cbiAgcHJpdmF0ZSBfc2V0QnVzaW5lc3NVc2VyU2V0dGluZ3MoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGJvb2xlYW4+KGFzeW5jIChyZXNvbHZlKSA9PiB7XG4gICAgICBpZiAoSXNPYmplY3QoUG9wQnVzaW5lc3MsIFsnaWQnXSkpIHtcbiAgICAgICAgdGhpcy5kYXRlLnNldEN1cnJlbnRCdXNpbmVzc1VuaXRTZXR0aW5ncygpO1xuICAgICAgICBQb3BMb2cuaW5pdCh0aGlzLm5hbWUsIGA6QnVzaW5lc3NVc2VyU2V0dGluZ3NgKTtcbiAgICAgICAgcmV0dXJuIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG5cbiAgcHJpdmF0ZSBfd2VsY29tZSgpIHtcbiAgICBpZiAoSXNPYmplY3QoUG9wQXV0aCwgWydjcmVhdGVkX2F0J10pKSB7XG4gICAgICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKSAvIDEwMDA7XG4gICAgICBjb25zdCBsb2dpblRpbWUgPSBuZXcgRGF0ZShQb3BBdXRoLmNyZWF0ZWRfYXQpLmdldFRpbWUoKSAvIDEwMDA7XG4gICAgICBjb25zdCBzZWNvbmRzU2luY2VMb2dpbiA9IChub3cgLSBsb2dpblRpbWUpO1xuICAgICAgY29uc3Qgd2VsY29tZSA9ICtzZWNvbmRzU2luY2VMb2dpbiAmJiArc2Vjb25kc1NpbmNlTG9naW4gPCAyMDtcbiAgICAgIGlmICh3ZWxjb21lKSB7XG4gICAgICAgIHRoaXMudGVtcGxhdGUud2VsY29tZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIExvYWQgdGhlIGNsaWVudCxhY2NvdW50LGNhbXBhaWduIGRhdGEgcmVxdWlyZWQgZm9yIHRoZSBmaWx0ZXIgYmFyXG4gICAqIEBwYXJhbSBidXNpbmVzc1xuICAgKi9cbiAgcHJpdmF0ZSBfbG9hZEZpbHRlckRhdGEoKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jIChyZXNvbHZlKSA9PiB7XG5cbiAgICAgIGlmICh0aGlzLkFQUF9HTE9CQUwuaXNGaWx0ZXJCYXIoKSAmJiBJc09iamVjdChQb3BCdXNpbmVzcywgWydpZCddKSkge1xuICAgICAgICBpZiAoUG9wRW50aXR5LmNoZWNrQWNjZXNzKCdjbGllbnQnLCAnY2FuX3JlYWQnKSkge1xuICAgICAgICAgIGF3YWl0IHRoaXMuY2FjRmlsdGVyLnNldERhdGEodGhpcy5uYW1lKTtcbiAgICAgICAgICBQb3BMb2cuaW5pdCh0aGlzLm5hbWUsIGA6RmlsdGVyIERhdGEgU2V0YCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgUG9wVGVtcGxhdGUudHVybk9mZkZpbHRlcigpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBMb2FkIHRoZSByZXNvdXJjZXMgbmVlZGVkIGZvciB0aGUgUG9wUGlwZSBzZXJ2aWNlXG4gICAqIEBwYXJhbSBidXNpbmVzc1xuICAgKi9cbiAgcHJpdmF0ZSBfbG9hZFBpcGVSZXNvdXJjZXMoKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jIChyZXNvbHZlKSA9PiB7XG4gICAgICBpZiAodGhpcy5BUFBfR0xPQkFMLmlzUGlwZXMoKSAmJiBJc09iamVjdChQb3BCdXNpbmVzcywgWydpZCddKSkge1xuICAgICAgICB0aGlzLnBpcGUubG9hZFJlc291cmNlcygpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIFBvcExvZy5pbml0KHRoaXMubmFtZSwgYDpQaXBlIFJlc291cmNlcyBTZXRgKTtcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcmVzb2x2ZShmYWxzZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBTZXQgYW55IGFsaWFzZXMgb24gdGhlIGZpbHRlciBjb2x1bW5zXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBwcml2YXRlIF9zZXRGaWx0ZXJBbGlhc2VzKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxib29sZWFuPihhc3luYyAocmVzb2x2ZSkgPT4ge1xuICAgICAgaWYgKHRoaXMuQVBQX0dMT0JBTC5pc0ZpbHRlckJhcigpICYmIHRoaXMuQVBQX0dMT0JBTC5pc0VudGl0aWVzKCkgJiYgdGhpcy5BUFBfR0xPQkFMLmlzQWxpYXNlcygpKSB0aGlzLmNhY0ZpbHRlci5zZXRDb25maWdBbGlhc2VzKCk7XG4gICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICB9KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG1hcCBsb29rdXAgZm9yIHJvdXRlIGFsaWFzZXNcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHByaXZhdGUgX3NldFJvdXRlQWxpYXNNYXAoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGJvb2xlYW4+KGFzeW5jIChyZXNvbHZlKSA9PiB7XG4gICAgICBjb25zdCBhbGlhc01hcDogeyBjbGllbnQ/OiBzdHJpbmc7IGFjY291bnQ/OiBzdHJpbmcsIGNhbXBhaWduPzogc3RyaW5nLCBwcm9maWxlPzogc3RyaW5nIH0gPSB7fTtcbiAgICAgIGlmICh0aGlzLkFQUF9HTE9CQUwuaXNFbnRpdGllcygpICYmIHRoaXMuQVBQX0dMT0JBTC5pc0FsaWFzZXMoKSkge1xuICAgICAgICBjb25zdCBhdXRoID0gPEF1dGhEZXRhaWxzPkdldFNpdGVWYXIoJ0F1dGguZGV0YWlscycsIHt9KTtcbiAgICAgICAgaWYgKCt0aGlzLmJ1c2luZXNzSWQgJiYgSXNPYmplY3QoYXV0aCwgWydidXNpbmVzc2VzJ10pICYmIElzT2JqZWN0KGF1dGguYnVzaW5lc3Nlc1t0aGlzLmJ1c2luZXNzSWRdLCBbJ2FwcHMnXSkpIHtcbiAgICAgICAgICBpZiAoSXNPYmplY3QoYXV0aC5idXNpbmVzc2VzW3RoaXMuYnVzaW5lc3NJZF0uYXBwcywgdHJ1ZSkpIHtcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGF1dGguYnVzaW5lc3Nlc1t0aGlzLmJ1c2luZXNzSWRdLmFwcHMpLm1hcCgoYXBwTmFtZSkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBhcHAgPSA8QXBwPmF1dGguYnVzaW5lc3Nlc1t0aGlzLmJ1c2luZXNzSWRdLmFwcHNbYXBwTmFtZV07XG4gICAgICAgICAgICAgIGlmIChJc09iamVjdChhcHAuZW50aXRpZXMsIHRydWUpKSB7XG4gICAgICAgICAgICAgICAgT2JqZWN0LmtleXMoYXBwLmVudGl0aWVzKS5tYXAoKGtleSkgPT4ge1xuICAgICAgICAgICAgICAgICAgY29uc3QgZW50aXR5ID0gPEVudGl0eT5hcHAuZW50aXRpZXNba2V5XTtcbiAgICAgICAgICAgICAgICAgIGlmIChJc09iamVjdChhcHAuZW50aXRpZXNba2V5XSwgdHJ1ZSkgJiYgSXNPYmplY3QoYXBwLmVudGl0aWVzW2tleV0uYWxpYXMsIFsncGx1cmFsJ10pKSB7XG4gICAgICAgICAgICAgICAgICAgIGFsaWFzTWFwW2VudGl0eS5pbnRlcm5hbF9uYW1lXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICBzaW5ndWxhcjogU3BhY2VUb0h5cGhlbkxvd2VyKGFwcC5lbnRpdGllc1trZXldLmFsaWFzLm5hbWUpLFxuICAgICAgICAgICAgICAgICAgICAgIHBsdXJhbDogU3BhY2VUb0h5cGhlbkxvd2VyKGFwcC5lbnRpdGllc1trZXldLmFsaWFzLnBsdXJhbClcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBTZXRQb3BSb3V0ZUFsaWFzTWFwKGFsaWFzTWFwKTtcbiAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgIH0pO1xuICB9XG5cblxuICAvKipcbiAgICogR2V0IHRoZSByb3V0ZXIuY29uZmlnIGFuZCBsb2FkIGFsbCBsYXp5IG1vZHVsZSB1c2luZyB0aGUgY29uZmlnTG9hZGVyXG4gICAqL1xuICBwcml2YXRlIF9zZXRSb3V0ZUFsaWFzZXMoKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGJvb2xlYW4+KGFzeW5jIChyZXNvbHZlKSA9PiB7XG4gICAgICBpZiAodGhpcy5BUFBfR0xPQkFMLmlzRW50aXRpZXMoKSAmJiB0aGlzLkFQUF9HTE9CQUwuaXNBbGlhc2VzKCkpIHtcbiAgICAgICAgdGhpcy5yb3V0ZXIuY29uZmlnID0gUGFyc2VNb2R1bGVSb3V0ZXNGb3JBbGlhc2VzKHRoaXMucm91dGVyLmNvbmZpZyk7XG4gICAgICAgIHRoaXMucm91dGVyLmNvbmZpZy5yZWR1Y2UoXG4gICAgICAgICAgKGFjYywgcm91dGU6IGFueSkgPT4ge1xuICAgICAgICAgICAgaWYgKHJvdXRlLmxvYWRDaGlsZHJlbiAmJiByb3V0ZS5kYXRhICYmIHJvdXRlLmRhdGEucm91dGVBbGlhc2VzKSB7XG4gICAgICAgICAgICAgICg8YW55PnRoaXMucm91dGVyKS5jb25maWdMb2FkZXIubG9hZCh0aGlzLmluamVjdG9yLCByb3V0ZSkuc3Vic2NyaWJlKHtcbiAgICAgICAgICAgICAgICBuZXh0OiAobW9kdWxlQ29uZikgPT4ge1xuICAgICAgICAgICAgICAgICAgcm91dGUuX2xvYWRlZENvbmZpZyA9IG1vZHVsZUNvbmY7XG4gICAgICAgICAgICAgICAgICBQYXJzZU1vZHVsZVJvdXRlc0ZvckFsaWFzZXMobW9kdWxlQ29uZi5yb3V0ZXMpO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHJvdXRlLnBhdGg7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBhY2M7XG4gICAgICAgICAgfSwgW11cbiAgICAgICAgKTtcbiAgICAgICAgYXdhaXQgU2xlZXAoNSk7XG4gICAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXdhaXQgU2xlZXAoNSk7XG4gICAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgcm91dGVyLmNvbmZpZyBhbmQgbG9hZCBhbGwgbGF6eSBtb2R1bGUgdXNpbmcgdGhlIGNvbmZpZ0xvYWRlclxuICAgKi9cbiAgcHJpdmF0ZSBfc2V0Um91dGVDYWNoZUNsZWFyKCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxib29sZWFuPihhc3luYyAocmVzb2x2ZSkgPT4ge1xuICAgICAgaWYgKHRydWUpIHtcbiAgICAgICAgY29uc3QgY2FjaGVSb3V0ZSA9IHRoaXMucm91dGVyLmNvbmZpZy5maW5kKChyb3V0ZSkgPT4gcm91dGUucGF0aCA9PT0gJ3N5c3RlbS9jYWNoZS9jbGVhcicpO1xuICAgICAgICBpZiAoIWNhY2hlUm91dGUpIHtcbiAgICAgICAgICB0aGlzLnJvdXRlci5jb25maWcgPSBbLi4udGhpcy5yb3V0ZXIuY29uZmlnLCAuLi5be1xuICAgICAgICAgICAgcGF0aDogJ3N5c3RlbS9jYWNoZS9jbGVhcicsXG4gICAgICAgICAgICBwYXRoTWF0Y2g6ICdmdWxsJyxcbiAgICAgICAgICAgIGNhbkFjdGl2YXRlOiBbUG9wQ2FjaGVSZWRpcmVjdEd1YXJkXSxcbiAgICAgICAgICAgIGNvbXBvbmVudDogUG9wQ2FjaGVSZWRpcmVjdENvbXBvbmVudFxuICAgICAgICAgIH1dXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cblxuICAvKipcbiAgICogR2V0IHRoZSByb3V0ZXIuY29uZmlnIGFuZCBsb2FkIGFsbCBsYXp5IG1vZHVsZSB1c2luZyB0aGUgY29uZmlnTG9hZGVyXG4gICAqL1xuICBwcml2YXRlIF9zZXRSb3V0ZUVycm9ySGFuZGxpbmcoKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGJvb2xlYW4+KGFzeW5jIChyZXNvbHZlKSA9PiB7XG4gICAgICBpZiAodHJ1ZSkge1xuICAgICAgICBjb25zdCBndWFyZEJsb2NrUm91dGUgPSB0aGlzLnJvdXRlci5jb25maWcuZmluZCgocm91dGUpID0+IHJvdXRlLnBhdGggPT09ICdzeXN0ZW0vcm91dGUnKTtcbiAgICAgICAgaWYgKCFndWFyZEJsb2NrUm91dGUpIHtcbiAgICAgICAgICB0aGlzLnJvdXRlci5jb25maWcgPSBbLi4udGhpcy5yb3V0ZXIuY29uZmlnLCAuLi5be1xuICAgICAgICAgICAgcGF0aDogJ3N5c3RlbS9yb3V0ZScsXG4gICAgICAgICAgICBwYXRoTWF0Y2g6ICdmdWxsJyxcbiAgICAgICAgICAgIGNvbXBvbmVudDogUG9wR3VhcmRSZWRpcmVjdENvbXBvbmVudFxuICAgICAgICAgIH1dXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGVycm9yUm91dGUgPSB0aGlzLnJvdXRlci5jb25maWcuZmluZCgocm91dGUpID0+IHJvdXRlLnBhdGggPT09ICdzeXN0ZW0vZXJyb3IvOmNvZGUnKTtcbiAgICAgICAgaWYgKCFlcnJvclJvdXRlKSB7XG4gICAgICAgICAgdGhpcy5yb3V0ZXIuY29uZmlnID0gWy4uLnRoaXMucm91dGVyLmNvbmZpZywgLi4uW3tcbiAgICAgICAgICAgIHBhdGg6ICdzeXN0ZW0vZXJyb3IvOmNvZGUnLFxuICAgICAgICAgICAgcGF0aE1hdGNoOiAnZnVsbCcsXG4gICAgICAgICAgICBjYW5BY3RpdmF0ZTogW1BvcFJlZGlyZWN0R3VhcmRdLFxuICAgICAgICAgICAgY29tcG9uZW50OiBQb3BFcnJvclJlZGlyZWN0Q29tcG9uZW50XG4gICAgICAgICAgfV1dO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBMb2FkIHRoZSB0aGVtZSBvZiB0aGUgYnVzaW5lc3MgYW5kIGFwcGx5IHRoZSB0aGVtZSBjb250cmFzdCB0aGUgdXNlciBoYXMgc3BlY2lmaWVkXG4gICAqIEBwYXJhbSBidXNpbmVzc1xuICAgKi9cbiAgcHJpdmF0ZSBfbG9hZEFwcFRoZW1lKCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShhc3luYyAocmVzb2x2ZSkgPT4ge1xuXG4gICAgICBsZXQgYnVzaW5lc3NUaGVtZSA9IElzT2JqZWN0KFBvcFVzZXIsIFsnaWQnXSkgPyBTdG9yYWdlR2V0dGVyKFBvcFVzZXIsIFsnc2V0dGluZycsICd0aGVtZSddLCBudWxsKSA6IG51bGw7XG4gICAgICBpZiAoIWJ1c2luZXNzVGhlbWUpIGJ1c2luZXNzVGhlbWUgPSBHZXRTZXNzaW9uU2l0ZVZhcihgQXBwLnRoZW1lYCwgJ2RlZmF1bHQnKTtcbiAgICAgIGxldCB1c2VyVGhlbWVDb250cmFzdCA9IElzT2JqZWN0KFBvcFVzZXIsIFsnaWQnXSkgPyBTdG9yYWdlR2V0dGVyKFBvcFVzZXIsIFsnc2V0dGluZycsICd0aGVtZV9jb250cmFzdCddLCBudWxsKSA6IG51bGw7XG4gICAgICBpZiAoIXVzZXJUaGVtZUNvbnRyYXN0KSB1c2VyVGhlbWVDb250cmFzdCA9IEdldFNlc3Npb25TaXRlVmFyKGBBcHAudGhlbWVDb250cmFzdGAsICdsaWdodCcpO1xuICAgICAgU2V0U2Vzc2lvblNpdGVWYXIoJ0FwcC50aGVtZScsIGJ1c2luZXNzVGhlbWUpO1xuICAgICAgU2V0U2Vzc2lvblNpdGVWYXIoJ0FwcC50aGVtZUNvbnRyYXN0JywgdXNlclRoZW1lQ29udHJhc3QpO1xuXG4gICAgICB0aGlzLkFQUF9USEVNRS5zZXQoYnVzaW5lc3NUaGVtZSwgdXNlclRoZW1lQ29udHJhc3QpO1xuXG4gICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICB9KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFNldCBhIGRlZmF1bHQgc2V0IG9mIHRhYnMgdGhhdCBhbiBlbnRpdHkgc2hvdWxkIGhhdmUsIGludGVuZGVkIHRvIGJlIG92ZXJyaWRkZW5cbiAgICogQHBhcmFtIGJ1c2luZXNzXG4gICAqL1xuICBwcml2YXRlIF9zZXREZWZhdWx0VGFicygpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgKHJlc29sdmUpID0+IHtcbiAgICAgIGlmICh0aGlzLkFQUF9HTE9CQUwuaXNFbnRpdGllcygpKSBQb3BFbnRpdHkuc2V0RW50aXR5VGFicygnZGVmYXVsdCcsIFtFbnRpdHlHZW5lcmFsVGFiLCBFbnRpdHlIaXN0b3J5VGFiXSk7XG4gICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICB9KTtcbiAgfVxufVxuIl19