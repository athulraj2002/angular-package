import {
  ComponentFactoryResolver,
  Inject,
  Injector,
  isDevMode,
  ModuleWithProviders,
  NgModule,
  OnDestroy,
  Renderer2
} from '@angular/core';
import {BehaviorSubject, forkJoin, Subject, Subscription} from 'rxjs';
import {PopBaseService} from '../services/pop-base.service';
import {PopCacFilterBarService} from './app/pop-cac-filter/pop-cac-filter.service';
import {PopDatetimeService} from '../services/pop-datetime.service';
import {PopEntityService} from './entity/services/pop-entity.service';
import {PopLogService} from '../services/pop-log.service';
import {PopRouteHistoryResolver} from '../services/pop-route-history.resolver';
import {PopPipeService} from '../services/pop-pipe.service';
import {PopEntityUtilPortalService} from './entity/services/pop-entity-util-portal.service';
import {PopRequestService} from '../services/pop-request.service';
import {PopTemplateService} from './app/pop-template.service';
import {PlatformLocation} from '@angular/common';
import {
  SetServiceInjector,
  SetPopApp,
  SetPopAuth,
  SetPopBusiness,
  SetPopDate,
  SetPopEntity,
  SetPopHistory,
  SetPopHref,
  SetPopLogger,
  SetPopPipe,
  SetPopPortal,
  SetPopRequest,
  SetPopUser,
  PopBusiness,
  PopEntity,
  PopHref,
  PopLog,
  PopTask,
  AppMenusInterface,
  SetPopRouteAliasMap,
  Entity,
  AppGlobalInterface,
  AppWidgetsInterface,
  PopUser,
  AppGlobalParamInterface,
  PopAuth,
  PopPipe,
  SetPopTemplate,
  AppThemeInterface,
  SetPopExternalApi,
  SetPopSchemeComponent,
  SetPopComponentResolver,
  SetPopEnv, PopApp, PopTemplate,
} from '../pop-common.model';
import {
  GetSessionSiteVar,
  GetSiteVar,
  IsArray,
  IsCallableFunction, IsDefined,
  IsObject, IsString,
  IsUndefined, SetSessionSiteVar, Sleep,
  SpaceToHyphenLower, StorageGetter,
  StringReplaceAll
} from '../pop-common-utility';
import {App, AuthDetails} from '../pop-common-token.model';

import {EntityGeneralTab, EntityHistoryTab} from './entity/pop-entity-tab/pop-entity-tab.model';
import {Router} from '@angular/router';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {HeaderInterceptor, Response401Interceptor} from '../services/pop-base.interceptors';
import {DateAdapter} from '@angular/material/core';
import {CustomDateAdapter} from './base/pop-field-item/custom-date-adapter';
import {MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
import {PopCredentialService} from '../services/pop-credential.service';
import {EntityMenu} from './app/pop-left-menu/entity-menu.model';
import {ParseModuleRoutesForAliases} from './entity/pop-entity-utility';
import {PopErrorRedirectComponent} from './base/pop-redirects/pop-error-redirect/pop-error-redirect.component';
import {PopRedirectsModule} from './base/pop-redirects/pop-redirects-module';
import {PopRedirectGuard} from './base/pop-redirects/pop-redirect.guard';
import {PopCacheRedirectComponent} from './base/pop-redirects/pop-cache-redirect/pop-cache-redirect.component';
import {PopCacheRedirectGuard} from './base/pop-redirects/pop-cache-redirect.guard';
import {PopGuardRedirectComponent} from './base/pop-redirects/pop-guard-redirect/pop-guard-redirect.component';
import {PopRequestExternalService} from '../services/pop-request-external.service';
import {PopEntitySchemeComponentService} from "./entity/services/pop-entity-scheme-component.service";


export class AppMenus implements AppMenusInterface {
  private _menus = [];


  get(): EntityMenu[] {
    return this._menus;
  }


  set(menus: EntityMenu[]) {
    this._menus = menus;
  }


  init(menus: EntityMenu[]): EntityMenu[] {
    return menus;
  }
}


export class AppWidgets implements AppWidgetsInterface {
  private _widgets = [];


  get(): any[] {
    return this._widgets;
  }


  set(widgets: any[]) {
    this._widgets = widgets;
  }
}


export class AppTheme implements AppThemeInterface {
  private _theme = 'default';
  private _contrast: 'light' | 'dark' = 'light';
  private _name = 'default-light.css';
  public init = new BehaviorSubject<boolean>(false);


  get(): string {
    return this._name;
  }


  set(theme: string = 'default', contrast: 'light' | 'dark' = 'light') {
    this._theme = theme;
    this._contrast = contrast;
    this._name = `${this._theme}-${this._contrast}.css`;
    const themeLink = (document.getElementById('themeFileEle') as HTMLLinkElement);
    if (themeLink) {
      const existingTheme = StringReplaceAll(themeLink.href.split(PopHref).pop(), '/', '');
      if (this._name !== existingTheme) {
        themeLink.href = this._name;
      }
    } else {
      const themeFile = document.createElement('link');
      themeFile.setAttribute('rel', 'stylesheet');
      themeFile.setAttribute('type', 'text/css');
      themeFile.setAttribute('href', this._name);
      themeFile.setAttribute('id', 'themeFileEle');
      themeFile.onload = () => {
        this.init.next(true);
      };
      if (typeof themeFile != 'undefined') document.getElementsByTagName('head')[0].appendChild(themeFile);
    }
  }


  isLoaded() {
    return this.init.getValue();
  }
}


export class AppGlobal implements AppGlobalInterface {
  private _verified = false;
  private _modals = 0;
  private _filter;
  private _pipes;
  private _aliases;
  private _entities;
  private _security;
  private _permissions;
  private _open = false;
  public init = new BehaviorSubject<boolean>(false);
  public verification = new Subject<boolean>();
  public _unload = new Subject<boolean>();


  isVerified(): Promise<boolean> {
    return new Promise<boolean>(async (resolve) => {
      const wait = setInterval(() => {
        if (this._verified) {
          clearInterval(wait);
          return resolve(true);
        }
      }, 5, 5);
    });
  }


  setVerified(): void {
    this._verified = true;
  }


  setModal(): void {
    this._modals++;
  }


  isModal(): number {
    return this._modals;
  }


  removeModal(): void {
    if (this._modals) {
      this._modals--;
    }
  }


  isFilterBar(): boolean {
    return this._filter;
  }


  setFilterBar(value: boolean): void {
    this._filter = value;
  }


  isPipes(): boolean {
    return this._pipes;
  }


  setPipes(value: boolean): void {
    this._pipes = value;
  }


  isAliases(): boolean {
    return this._aliases;
  }


  setAliases(value: boolean): void {
    this._aliases = value;
  }


  isEntities(): boolean {
    return this._entities;
  }


  setEntities(value: boolean): void {
    this._entities = value;
  }


  setSecurity(value: boolean): void {
    this._security = value;
  }


  isSecurity(): boolean {
    return this._security;
  }

  isPermissions(): boolean {
    return this._permissions;
  }

  setPermissions(value: boolean): void {
    this._permissions = value;
  }


  isOpen(): boolean {
    return this._open;
  }


  setOpen(value: boolean): void {
    this._open = value;
  }
}


@NgModule({
  imports: [
    PopRedirectsModule
  ],
  declarations: [],
  exports: [],
  providers: [PopCredentialService]
})


export class PopInitializerModule {

  private name = `PopInitializerModule`;

  private businessId;

  private verification = {
    pending: false,
    subscription: <Subscription>undefined,
    debouncer: undefined,
    trigger: () => {
      if (this.verification.debouncer) clearTimeout(this.verification.debouncer);
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

  private unload = {
    pending: false,
    subscription: <Subscription>undefined,
    debouncer: undefined,
    trigger: () => {
      if (this.unload.debouncer) clearTimeout(this.unload.debouncer);
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


  static forRoot(tasks: PopTask[] = [], appGlobalsParams: AppGlobalParamInterface = {}): ModuleWithProviders<PopInitializerModule> {
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
        {provide: HTTP_INTERCEPTORS, useClass: HeaderInterceptor, multi: true},
        {provide: HTTP_INTERCEPTORS, useClass: Response401Interceptor, multi: true},
        {provide: DateAdapter, useClass: CustomDateAdapter},
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


  constructor(
    private base: PopBaseService,
    private cacFilter: PopCacFilterBarService,
    private componentFactoryResolver: ComponentFactoryResolver,
    private credential: PopCredentialService,
    private date: PopDatetimeService,
    private entity: PopEntityService,
    private externalApi: PopRequestExternalService,
    private log: PopLogService,
    private history: PopRouteHistoryResolver,
    private iconRegistry: MatIconRegistry,
    private pipe: PopPipeService,
    private portal: PopEntityUtilPortalService,
    private request: PopRequestService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private schemeComponent: PopEntitySchemeComponentService,
    private template: PopTemplateService,
    private platform: PlatformLocation,
    @Inject(Injector) private injector,
    @Inject('APP_INITIALIZER_TASKS') public tasks: PopTask[],
    @Inject('APP_GLOBAL') public APP_GLOBAL: AppGlobalInterface,
    @Inject('APP_GLOBAL_PARAMS') public APP_GLOBAL_PARAMS: AppGlobalParamInterface,
    @Inject('APP_THEME') public APP_THEME: AppThemeInterface,
    @Inject('env') private env?,
  ) {
    this.iconRegistry.addSvgIcon('admin', this.sanitizer.bypassSecurityTrustResourceUrl('assets/images/admin.svg'));

    const setup = new Promise<boolean>(async (resolve) => {
      const auth = this.base.getAuthDetails();
      const login = GetSessionSiteVar('Login.time', 0);

      try {
        this._setBusinessId(auth);
      } catch (e) {
        console.log(e);
      }

      const publicFacingApp = this.APP_GLOBAL_PARAMS.open ? true : false;
      if (!publicFacingApp && IsObject(auth, ['id', 'businesses', 'users', 'token', 'email_verified_at']) && !(this.base.isAuthExpired())) {
        await this._loadAppTheme();
        await this._init(auth);
        PopLog.init(this.name, `:publicFacingApp`, publicFacingApp);
        /** This is experimental testing if app can be speed up  **/
        if (this.businessId && StorageGetter(auth, ['businesses', this.businessId, 'apps']) && !login) {
          PopLog.init(this.name, `:fire app early?`);
          this.APP_GLOBAL.setVerified();
          this.APP_GLOBAL.init.next(true);
        }
        /** *********************** **/

        const verified = await this._verifyAuthStorage();
        if (!verified) {
          if (!isDevMode()) {
            if (false) {
              this.base.clearAuthDetails(`PopInitializerModule:setup`);
              window.location.href = window.location.protocol + '//' + window.location.host + '/user/legacy/auth/clear';
            } else {
              PopLog.init(this.name, `:verification failed`);
              this.APP_GLOBAL.setVerified();
              this.APP_GLOBAL.init.next(true);
              return resolve(true);
            }

          } else {
            PopLog.init(this.name, `:verification failed`);
            this.APP_GLOBAL.init.next(true);
            return resolve(true);
          }
        } else {
          this._welcome();

          return resolve(true);
        }

        // if(this.APP_GLOBAL.isSecurity() && IsString(PopHref, true)) {
        //   this.base.checkAppAccess(PopHref, true);
        // }
      } else {
        SetSessionSiteVar('App.theme', null);
        SetSessionSiteVar('App.themeContrast', null);
        await this._loadAppTheme();
        await this._setDependencies(false, null);
        if (this.APP_GLOBAL.isOpen()) {
          this.APP_GLOBAL.setVerified();
          this.APP_GLOBAL.init.next(true);
          return resolve(true);
        } else {
          this.APP_GLOBAL.init.next(true);
          return resolve(true);
        }
      }
    });

    setup.catch((e) => {
      if (isDevMode()) console.log('e', e);
      this.APP_GLOBAL.init.next(true);
    });
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
  private _setDependencies(authenticated: boolean, auth: AuthDetails): Promise<boolean> {
    return new Promise<boolean>(async (resolve) => {
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
        await Promise.all([
          this._setRouteCacheClear(),
          this._setRouteErrorHandling(),
          this._setBusinessAssets(auth),
          this._loadPipeResources(),
        ]);
        await this._loadFilterData();

      }
      return resolve(true);
    });
  }


  private _init(auth: AuthDetails): Promise<boolean> {
    return new Promise<boolean>(async (resolve) => {
      await this._setDependencies(true, auth);
      await this._setAncillary(auth);
      await this._configure(auth);
      this.APP_GLOBAL.init.next(true);
      if (!this.unload.subscription) {
        PopLog.init(this.name, `registering unload request subscription`);
        this.unload.subscription = this.APP_GLOBAL._unload.subscribe(() => {
          PopLog.init(this.name, `unload: requested`);
          this.unload.trigger();
        });
      }
      return resolve(true);
    });
  }


  private _setAncillary(auth: AuthDetails): Promise<boolean> {
    return new Promise(async (resolve) => {
      await this._tasks();
      return resolve(true);
    });
  }


  private _configure(auth: AuthDetails) {
    return new Promise<boolean>(async (resolve) => {
      if (IsObject(auth, ['id', 'businesses', 'users', 'token']) && !(this.base.isAuthExpired()) && PopHref) {
        if (IsObject(PopBusiness, ['id'])) {
          await Promise.all([
            this._setBusinessUserSettings(),
            this._setFilterAliases(),
            this._setRouteAliasMap(),
            this._setDefaultTabs(),
          ]);
          return resolve(true);
        } else {
          PopLog.init(this.name, `No Business Found`);
          return resolve(true);
        }
      } else {
        return resolve(true);
      }
    });
  }


  private _tasks() {
    return new Promise<boolean>(async (resolve) => {
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
    });
  }


  private _setAuthGlobal(auth: AuthDetails) {
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


  private _setBusinessId(auth: AuthDetails) {
    if (IsUndefined(this.businessId)) this.businessId = 0;
    if (IsObject(auth.businesses, true)) {
      if (!this.businessId) this.businessId = String(GetSiteVar('Business.last', 0));
      if (!(+this.businessId && this.businessId in auth.businesses)) {
        this.businessId = this.base.getCurrentBusinessId();
      }
      if (+this.businessId && this.businessId in auth.businesses) {
        this.businessId = +this.businessId;
      } else if (+auth.business_fk && auth.business_fk in auth.businesses) {
        this.businessId = +auth.business_fk;
      } else {
        this.businessId = IsObject(auth.businesses, true) ? +Object.keys(auth.businesses)[0] : 0;
      }
    }
  }


  /**
   * Verify that the current auth storage is still relevant
   * @private
   */
  private _verifyAuthStorage(): Promise<boolean> {
    return new Promise(async (resolve) => {
      if (IsObject(PopAuth, ['created_at']) && IsDefined(PopAuth.email_verified_at, false) && !this.verification.pending) {
        PopLog.init(this.name, `Verification: In Progress`);
        if (!this.businessId) {
          PopLog.init(this.name, `Verification:Complete - no business`);
          this.APP_GLOBAL.setVerified();
          return resolve(true);
        }
        this.verification.pending = true;
        const auth = await this.credential.verify(this.businessId);
        if (auth) {
          this._setAuthGlobal(auth);
          this._setBusinessId(auth);
          await Promise.all([
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
        } else {
          return resolve(false);
        }
      } else {
        return resolve(false);
      }

    });
  }


  /**
   * This fx will set up all the necessary business assets that are needed
   * @param auth
   * @private
   */
  private _setBusinessAssets(auth: AuthDetails) {
    return new Promise(async (resolve) => {
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
        await this._setBusinessAppEntities();
      }
      return resolve(true);
    });
  }


  /**
   * This fx will loop through all the apps in the current business, and for each entity in that business register the details
   */
  private _setBusinessAppEntities() {
    return new Promise(async (resolve) => {
      const auth = this.base.getAuthDetails();
      if (IsObject(PopBusiness, ['id', 'apps']) && IsObject(PopBusiness.apps, true)) {
        const inaccessibleApps = [];
        const permanentApps = ['library', 'home'];
        // console.log('PopUser', PopUser);
        Object.keys(PopBusiness.apps).map((appName) => {
          const app = PopBusiness.apps[appName];
          app.hasCreateAccess = false;
          if (IsObject(app, true) && IsObject(app.entities, true)) {
            Object.keys(app.entities).map((name: string) => {
              if (IsObject(app.entities[name], ['id', 'name', 'internal_name'])) {
                const entity = app.entities[name];
                entity.access = {};

                if (IsObject(PopUser, ['permissions']) && IsObject(PopUser.permissions, true) && entity.internal_name in PopUser.permissions) {
                  entity.access = PopUser.permissions[entity.internal_name];
                  // console.log(entity.internal_name, entity.access.can_read);
                }
                if (entity.access.can_create) app.hasCreateAccess = true;
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
          inaccessibleApps.map((appName2: string) => {
            delete PopBusiness.apps[appName2];
            delete auth.businesses[PopBusiness.id].apps[appName2];
          });
        }
        this.base.setAuthDetails(auth);
      }
      return resolve(true);
    });
  }


  /**
   * Load the client,account,campaign data required for the filter bar
   * @param business
   */
  private _setBusinessUserSettings(): Promise<boolean> {
    return new Promise<boolean>(async (resolve) => {
      if (IsObject(PopBusiness, ['id'])) {
        this.date.setCurrentBusinessUnitSettings();
        PopLog.init(this.name, `:BusinessUserSettings`);
        return resolve(true);
      } else {
        return resolve(true);
      }
    });
  }


  private _welcome() {
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
  private _loadFilterData() {
    return new Promise(async (resolve) => {

      if (this.APP_GLOBAL.isFilterBar() && IsObject(PopBusiness, ['id'])) {
        if (PopEntity.checkAccess('client', 'can_read')) {
          await this.cacFilter.setData(this.name);
          PopLog.init(this.name, `:Filter Data Set`);
        } else {
          PopTemplate.turnOffFilter();
        }
        return resolve(true);
      } else {
        return resolve(true);
      }
    });
  }


  /**
   * Load the resources needed for the PopPipe service
   * @param business
   */
  private _loadPipeResources() {
    return new Promise(async (resolve) => {
      if (this.APP_GLOBAL.isPipes() && IsObject(PopBusiness, ['id'])) {
        this.pipe.loadResources().then(() => {
          PopLog.init(this.name, `:Pipe Resources Set`);
          return resolve(true);
        });
      } else {
        return resolve(false);
      }
    });
  }


  /**
   * Set any aliases on the filter columns
   * @private
   */
  private _setFilterAliases(): Promise<boolean> {
    return new Promise<boolean>(async (resolve) => {
      if (this.APP_GLOBAL.isFilterBar() && this.APP_GLOBAL.isEntities() && this.APP_GLOBAL.isAliases()) this.cacFilter.setConfigAliases();
      return resolve(true);
    });
  }


  /**
   * Create a map lookup for route aliases
   * @private
   */
  private _setRouteAliasMap(): Promise<boolean> {
    return new Promise<boolean>(async (resolve) => {
      const aliasMap: { client?: string; account?: string, campaign?: string, profile?: string } = {};
      if (this.APP_GLOBAL.isEntities() && this.APP_GLOBAL.isAliases()) {
        const auth = <AuthDetails>GetSiteVar('Auth.details', {});
        if (+this.businessId && IsObject(auth, ['businesses']) && IsObject(auth.businesses[this.businessId], ['apps'])) {
          if (IsObject(auth.businesses[this.businessId].apps, true)) {
            Object.keys(auth.businesses[this.businessId].apps).map((appName) => {
              const app = <App>auth.businesses[this.businessId].apps[appName];
              if (IsObject(app.entities, true)) {
                Object.keys(app.entities).map((key) => {
                  const entity = <Entity>app.entities[key];
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
    });
  }


  /**
   * Get the router.config and load all lazy module using the configLoader
   */
  private _setRouteAliases() {
    return new Promise<boolean>(async (resolve) => {
      if (this.APP_GLOBAL.isEntities() && this.APP_GLOBAL.isAliases()) {
        this.router.config = ParseModuleRoutesForAliases(this.router.config);
        this.router.config.reduce(
          (acc, route: any) => {
            if (route.loadChildren && route.data && route.data.routeAliases) {
              (<any>this.router).configLoader.load(this.injector, route).subscribe({
                next: (moduleConf) => {
                  route._loadedConfig = moduleConf;
                  ParseModuleRoutesForAliases(moduleConf.routes);
                  return route.path;
                }
              });
            }
            return acc;
          }, []
        );
        await Sleep(5);
        return resolve(true);
      } else {
        await Sleep(5);
        return resolve(true);
      }
    });
  }

  /**
   * Get the router.config and load all lazy module using the configLoader
   */
  private _setRouteCacheClear() {
    return new Promise<boolean>(async (resolve) => {
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
      } else {
        return resolve(true);
      }
    });
  }


  /**
   * Get the router.config and load all lazy module using the configLoader
   */
  private _setRouteErrorHandling() {
    return new Promise<boolean>(async (resolve) => {
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
      } else {
        return resolve(true);
      }
    });
  }


  /**
   * Load the theme of the business and apply the theme contrast the user has specified
   * @param business
   */
  private _loadAppTheme() {
    return new Promise(async (resolve) => {

      let businessTheme = IsObject(PopUser, ['id']) ? StorageGetter(PopUser, ['setting', 'theme'], null) : null;
      if (!businessTheme) businessTheme = GetSessionSiteVar(`App.theme`, 'default');
      let userThemeContrast = IsObject(PopUser, ['id']) ? StorageGetter(PopUser, ['setting', 'theme_contrast'], null) : null;
      if (!userThemeContrast) userThemeContrast = GetSessionSiteVar(`App.themeContrast`, 'light');
      SetSessionSiteVar('App.theme', businessTheme);
      SetSessionSiteVar('App.themeContrast', userThemeContrast);

      this.APP_THEME.set(businessTheme, userThemeContrast);

      return resolve(true);
    });
  }


  /**
   * Set a default set of tabs that an entity should have, intended to be overridden
   * @param business
   */
  private _setDefaultTabs() {
    return new Promise(async (resolve) => {
      if (this.APP_GLOBAL.isEntities()) PopEntity.setEntityTabs('default', [EntityGeneralTab, EntityHistoryTab]);
      return resolve(true);
    });
  }
}
