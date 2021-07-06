import {Component, HostBinding, Inject, Input, OnDestroy, OnInit} from '@angular/core';
import {EntityMenu} from './entity-menu.model';
import {
  GetSiteVar,
  IsArray, IsCallableFunction, IsDefined,
  IsObject, IsString,
  ObjectsMatch,
  SetSiteVar,
  SpaceToHyphenLower, TitleCase,
} from '../../../pop-common-utility';
import {
  AppGlobalInterface,
  AppMenusInterface,
  PopApp,
  PopAuth,
  PopHref,
  PopLog,
  ServiceInjector,
  SetPopAliasRouteMap,
} from '../../../pop-common.model';
import {Router} from '@angular/router';
import {PopExtendComponent} from '../../../pop-extend.component';
import {PopEntityUtilParamService} from '../../entity/services/pop-entity-util-param.service';


@Component({
  selector: 'lib-pop-left-menu',
  templateUrl: './pop-left-menu.component.html',
  styleUrls: ['./pop-left-menu.component.scss'],
})
export class PopLeftMenuComponent extends PopExtendComponent implements OnInit, OnDestroy {
  @Input() entityMenus: EntityMenu[] = [];
  @HostBinding('class.sw-hidden') @Input() hidden = false;
  public name = 'PopLeftMenuComponent';

  protected srv = {
    param: <PopEntityUtilParamService>ServiceInjector.get(PopEntityUtilParamService)
  };

  protected asset = {
    siteVar: 'App.LeftMenu.open',
  };

  public ui = {};


  constructor(
    private router: Router,
    @Inject('APP_GLOBAL') private APP_GLOBAL: AppGlobalInterface,
    @Inject('APP_MENUS') private APP_MENUS: AppMenusInterface,
  ) {
    super();

    if (APP_GLOBAL.isOpen()) {
      PopLog.init(this.name, `Public App`, this.entityMenus);
      this.hidden = ((this.APP_GLOBAL.isEntities() && !(IsObject(PopAuth))) || !(this.entityMenus.length)) ? true : false;
    } else {
      this._initialize();
      this.dom.setSubscriber('init', this.APP_GLOBAL.init.subscribe(async (val: boolean) => {
        if (val) {
          this.dom.state.verified = await this.APP_GLOBAL.isVerified();
          this._initialize();
        }
      }));
    }


    this.dom.configure = (): Promise<boolean> => {
      return new Promise(async (resolve) => {

        return resolve(true);
      });
    };

    this.dom.proceed = (): Promise<boolean> => {
      return new Promise(async (resolve) => {
        this._setState();
        return resolve(true);
      });
    };
  }


  ngOnInit() {
    super.ngOnInit();
  }

  /**
   * This fx will open/close the left side nav
   */
  public onToggleMenu(): void {
    this.dom.state.open = !this.dom.state.open;
    this.dom.state.closed = !this.dom.state.open;
    SetSiteVar(this.asset.siteVar, this.dom.state.open);
    window.dispatchEvent(new Event('onWindowResize'));
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
   * This fx will build out the menus for this component
   * @private
   */
  private _initialize() {
    this.dom.setTimeout(`init`, async () => {
      const menus = await this._setMenus();
      PopLog.init(this.name, `Private App`, this.entityMenus);
      if (IsArray(menus, true) && this._isVerifiedMenusDifferent(menus)) {
        this.entityMenus = menus;
      }
      this.hidden = ((this.APP_GLOBAL.isEntities() && !(IsObject(PopAuth))) || !(this.entityMenus.length)) ? true : false;
      if (this.dom.state.verified) {
        await this._checkDefaultRoute();
      }

    }, 5);
  }


  /**
   * Determine the state of this component
   * The component should be open or closed base of the users latest session setting, or should default to open
   * @private
   */
  private _setState() {
    const open = GetSiteVar(this.asset.siteVar, true);
    this.dom.state.open = typeof open === 'boolean' ? open : false;
    this.dom.state.closed = !this.dom.state.open;
  }


  /**
   * Create a list of the menus needed for the current app
   * @private
   */
  private _setMenus(): Promise<EntityMenu[]> {
    return new Promise<EntityMenu[]>(async (resolve) => {
      let menus = [];
      const routeAliasMap = {};
      if (this.APP_GLOBAL.isEntities() && IsObject(PopApp, ['menu'])) {
        for (const menuEntity in PopApp.menu) {
          if (IsObject(PopApp.menu [menuEntity])) {
            const menu = PopApp.menu[menuEntity];
            menu.originalPath = menu.path;
            menu.originalName = menu.name;

            if (menu.entity_id) {
              const params = this.srv.param.getEntityParams(menu.entity_id);
              if (IsObject(params, ['id', 'internal_name']) && this.srv.param.checkAccess(params.internal_name, 'can_read')) {
                menu.id = +menu.entity_id;
                menu.internal_name = params.internal_name;
                if (this.APP_GLOBAL.isAliases() && IsObject(params.alias, ['name', 'plural'])) {
                  const alias = params.alias;
                  menu.hasAlias = true;
                  menu.name = TitleCase(alias.plural);
                  menu.path = SpaceToHyphenLower(alias.plural);
                  routeAliasMap[SpaceToHyphenLower(alias.plural)] = menu.originalPath;
                } else {
                  menu.hasAlias = false;
                }
                menus.push(new EntityMenu(menu));
              } else {
                PopLog.warn(this.name, `Cannot view menu:`, menu);
              }
            } else {
              menus.push(new EntityMenu(menu));
            }
          }
        }
        if (IsCallableFunction(this.APP_MENUS.init)) {
          menus = this.APP_MENUS.init(menus);
        }
        SetPopAliasRouteMap(routeAliasMap);
        this.APP_MENUS.set(menus);
        return resolve(menus);
      } else {
        return resolve(menus);
      }
    });
  }


  /**
   * Set a default route for the project
   * @param parent
   * @param config
   * @param routes
   * @private
   */
  private _checkDefaultRoute(): Promise<boolean> {
    return new Promise<boolean>(async (resolve) => {
      if (this.router.config.length && IsArray(this.entityMenus, true)) {
        const defaultRoute = this.router.config.find((route) => route.path === '**');
        if (!defaultRoute && this._isValidRoute(this.entityMenus[0].path)) {
          this.router.config.push({path: '**', 'redirectTo': this.entityMenus[0].path});
          PopLog.init(this.name, `Default Route Wildcard **`, this.entityMenus[0].path);
        }
        // const activeRouteUrl = ( !this.router.url || this.router.url === '/' ) ? false : true;
        // if( !activeRouteUrl ){
        const currentPath = window.location.href.split(`${PopHref}`)[1];
        if (this._isValidRoute(currentPath)) {
          this._fallBackUrlRoute();
        } else {
          this._fallBackMenuRoute();
        }
        // }
      } else {

      }
      return resolve(true);
    });
  }


  /**
   * This fx will try to use the first menu item as the default route
   * @private
   */
  private _fallBackMenuRoute() {
    PopLog.init(this.name, `Fallback Menu Route`, this.entityMenus[0].path);
    if (IsArray(this.entityMenus, true) && this._isValidRoute(this.entityMenus[0].path)) {
      this.log.info(`Fallback Menu Route`, this.entityMenus[0].path);
      this.router.navigate([this.entityMenus[0].path]).catch((e) => {
        this.log.info(`Could not find route`);
        this._fallbackSystemRoute();
      });
    } else {
      this._fallbackSystemRoute();
    }
  }


  /**
   * This fx will attempt to use the current url as the default route
   * @private
   */
  private _fallBackUrlRoute() {
    let currentPath = window.location.href.split(PopHref)[1];
    currentPath = currentPath.split('?')[0];
    if (this._isValidRoute(currentPath)) {
      PopLog.init(this.name, `Current Route`, currentPath);
      this.router.navigate([currentPath], {queryParams: this._getUrlParams()}).catch((e) => {
        this._fallbackSystemRoute();
      }).then(() => {
        if (!(this.router.url.includes(currentPath))) {
          this._fallbackSystemRoute();
        }
      });
    } else {
      this._fallbackSystemRoute();
    }
  }


  /**
   * This fx will temp redirect and try to find a valid route
   * @private
   */
  private _fallbackSystemRoute() {
    if (this.dom.state.verified) {
      this.router.navigate(['/system/route'], {skipLocationChange: true});
    } else {
      this.router.navigate(['/']);
    }
  }


  /**
   * This fx determines if there is a difference between tow sets of menus(existing, new)
   * @param menus
   * @private
   */
  private _isVerifiedMenusDifferent(menus: EntityMenu[]) {
    return !(ObjectsMatch(this.entityMenus, menus));
  }


  /**
   * This fx determines if a path is a valid route
   * @param path
   * @private
   */
  private _isValidRoute(path: string) {
    return IsDefined(path, false) && IsString(path, true) && path !== '/' && path !== 'null' && !(String(path).includes('/error/'));
  }


  private _getUrlParams() {
    const params = {};
    window.location.search.slice(1).split('&').forEach(elm => {
      if (elm === '') return;
      const spl = elm.split('=');
      const d = decodeURIComponent;
      params[d(spl[0])] = (spl.length >= 2 ? d(spl[1]) : true);
    });

    return params;
  }
}

