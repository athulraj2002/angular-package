import {Component, Inject, OnInit, ViewChild, ElementRef, isDevMode, OnDestroy} from '@angular/core';
import {PopBaseService} from '../../../services/pop-base.service';
import {App, AppMenu, Business, AuthDetails, AuthUser} from '../../../pop-common-token.model';
import {IsArray, IsObject, IsString, ObjectsMatch, SetSiteVar} from '../../../pop-common-utility';
import {
  AppGlobalInterface,
  KeyMap,
  PopAliasRouteMap,
  PopEnv,
  PopHref,
  PopTemplate,
  ServiceInjector
} from '../../../pop-common.model';
import {PopMenuService} from './pop-menu.service';
import {PopCredentialService} from '../../../services/pop-credential.service';
import {PopExtendComponent} from '../../../pop-extend.component';
import {Router} from '@angular/router';


@Component({
  selector: 'lib-pop-menu',
  templateUrl: './pop-menu.component.html',
  styleUrls: ['./pop-menu.component.scss']
})
export class PopMenuComponent extends PopExtendComponent implements OnInit, OnDestroy {
  @ViewChild('mmNavRef') mmNavRef: ElementRef;
  public name = 'PopMenuComponent';


  protected asset = {
    existingBusinesses: <KeyMap<Business>>undefined
  };

  public ui = {
    alternate_businesses: <any[]>[],
    menus: {
      all: <any[]>[],
      more: <any[]>[]
    },
    user: <AuthUser>undefined
  };

  protected srv = {
    base: <PopBaseService>ServiceInjector.get(PopBaseService),
    credential: <PopCredentialService>ServiceInjector.get(PopCredentialService),
    menu: <PopMenuService>ServiceInjector.get(PopMenuService),
    router: <Router>ServiceInjector.get(Router),
  };

  constructor(
    @Inject('APP_GLOBAL') private APP_GLOBAL: AppGlobalInterface,
  ) {
    super();

    this.dom.configure = (): Promise<boolean> => {

      // this component set the outer height boundary of this view
      return new Promise(async (resolve) => {
        await Promise.all([
          this._setInitialConfig()
        ]);
        return resolve(true);
      });
    };

    this.dom.proceed = (): Promise<boolean> => {
      return new Promise(async (resolve) => {
        if (!this.dom.state.checkedContent && this.mmNavRef) {
          this.onUpdateMenus();
          this.dom.state.checkedContent = true;
        }
        return resolve(true);
      });
    };
  }


  ngOnInit() {
    super.ngOnInit();
  }



  /**
   * The user click to a app nav menu
   * @param appPath
   */
  onChangeApp(appPath: string): void {
    if (isDevMode() && IsString(PopHref)) { // Auto Login/Logout since there is no access to the prime-user-app
      if (appPath === '/login') {
        if (PopEnv.username && PopEnv.password) {
          PopTemplate.lookBusy(30);
          this.srv.credential.authenticate({
            username: PopEnv.username,
            password: PopEnv.password
          }).then((auth: AuthDetails) => {
            if (IsObject(auth, true)) {
              return window.location.reload();
            } else {
              PopTemplate.error({message: String(auth), code: 500});
            }
          });
        }
      } else if (appPath === '/logout') {
        PopTemplate.goodbye();
        setTimeout(() => {
          this.srv.credential.clear().subscribe(() => {
            this.srv.base.switchApps(`/` + (IsString(PopHref, true) ? PopHref : ''));
          });
        }, 0);
      } else {
        PopTemplate.notify(`You Shall not Pass! Actually this link will take you to nowhere, so its been disabled.`);
      }
    } else {
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
  onChangeBusiness(id: number): void {
    let slugs = <any>window.location.href.split(PopHref + '/').pop().trim();
    slugs = <string[]>slugs.split('/');
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
    } else {
      const moreMenus = [];
      let talliedMenuSize = 0;
      const children = this.mmNavRef.nativeElement.children;
      const maxWidth = this.mmNavRef.nativeElement.offsetWidth - 15;

      for (let i = 0; i < children.length; i++) {
        talliedMenuSize += children[i].offsetWidth;
        if (talliedMenuSize < maxWidth) {
          children[i].style.visibility = 'visible';
        } else {
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
  private _setInitialConfig() {
    return new Promise(async (resolve) => {

      this.dom.active.path = `/${window.location.pathname.split('/')[1]}`;
      this.dom.active.business = <Business>undefined;
      this.dom.state.authenticated = false;
      this.dom.state.checkedContent = false;
      this.dom.state.isDevMode = isDevMode();

      this._initialize();

      this.dom.setSubscriber('init', this.APP_GLOBAL.init.subscribe((val: boolean) => {
        if (val) {
          this.dom.setTimeout(`init`, () => {
            this._initialize();
          }, 100);
        }
      }));
      return resolve(true);
    });
  }

  /**
   * Initialize the component
   * This is designed so that at any time a verification event can be fired from the Initializer module, and the menu can respond to the business(app)s that is stored in the new Auth Token
   * Future:  A web socket will be able to detect a change in security+access of apps and trigger the menu to auto update
   */
  private _initialize() {
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
  private _loadBusiness(): void {
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
            this.dom.active.business = <Business>{
              id: business.id,
              name: business.name,
              short_name: business.short_name,
              logo_main_url: business.logo_main_url,
              logo_small_url: business.logo_small_url,
            };
            this._setBusinessAppMenus(business);
          } else {
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
  private _setBusinessAppMenus(business: Business) {
    if (business) {
      if (IsArray(business.apps, true)) {
        this.ui.menus.all = business.apps.filter((app: App) => {
          return +app.active;
        }).sort(function (a, b) {
          if (a.sort < b.sort) return -1;
          if (a.sort > b.sort) return 1;
          return 0;
        }).map((app: App) => {
          return this._extractAppMenu(app);
        });
      } else if (IsObject(business.apps, true)) {
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
  private _extractAppMenu(app: App): AppMenu {
    return <AppMenu>{
      name: app.label ? app.label : app.name,
      path: `/${String(app.name).toLowerCase()}`,
      description: '',
      short_description: '',
      sort: app.sort,
      icon: '',
    };
  }
}

