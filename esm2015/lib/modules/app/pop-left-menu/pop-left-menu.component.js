import { __awaiter } from "tslib";
import { Component, HostBinding, Inject, Input } from '@angular/core';
import { EntityMenu } from './entity-menu.model';
import { GetSiteVar, IsArray, IsCallableFunction, IsDefined, IsObject, IsString, ObjectsMatch, SetSiteVar, SpaceToHyphenLower, TitleCase, } from '../../../pop-common-utility';
import { PopApp, PopAuth, PopHref, PopLog, ServiceInjector, SetPopAliasRouteMap, } from '../../../pop-common.model';
import { Router } from '@angular/router';
import { PopExtendComponent } from '../../../pop-extend.component';
import { PopEntityUtilParamService } from '../../entity/services/pop-entity-util-param.service';
export class PopLeftMenuComponent extends PopExtendComponent {
    constructor(router, APP_GLOBAL, APP_MENUS) {
        super();
        this.router = router;
        this.APP_GLOBAL = APP_GLOBAL;
        this.APP_MENUS = APP_MENUS;
        this.entityMenus = [];
        this.hidden = false;
        this.name = 'PopLeftMenuComponent';
        this.srv = {
            param: ServiceInjector.get(PopEntityUtilParamService)
        };
        this.asset = {
            siteVar: 'App.LeftMenu.open',
        };
        this.ui = {};
        if (APP_GLOBAL.isOpen()) {
            PopLog.init(this.name, `Public App`, this.entityMenus);
            this.hidden = ((this.APP_GLOBAL.isEntities() && !(IsObject(PopAuth))) || !(this.entityMenus.length)) ? true : false;
        }
        else {
            this._initialize();
            this.dom.setSubscriber('init', this.APP_GLOBAL.init.subscribe((val) => __awaiter(this, void 0, void 0, function* () {
                if (val) {
                    this.dom.state.verified = yield this.APP_GLOBAL.isVerified();
                    this._initialize();
                }
            })));
        }
        this.dom.configure = () => {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                return resolve(true);
            }));
        };
        this.dom.proceed = () => {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                this._setState();
                return resolve(true);
            }));
        };
    }
    ngOnInit() {
        super.ngOnInit();
    }
    /**
     * This fx will open/close the left side nav
     */
    onToggleMenu() {
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
    _initialize() {
        this.dom.setTimeout(`init`, () => __awaiter(this, void 0, void 0, function* () {
            const menus = yield this._setMenus();
            PopLog.init(this.name, `Private App`, this.entityMenus);
            if (IsArray(menus, true) && this._isVerifiedMenusDifferent(menus)) {
                this.entityMenus = menus;
            }
            this.hidden = ((this.APP_GLOBAL.isEntities() && !(IsObject(PopAuth))) || !(this.entityMenus.length)) ? true : false;
            if (this.dom.state.verified) {
                yield this._checkDefaultRoute();
            }
        }), 5);
    }
    /**
     * Determine the state of this component
     * The component should be open or closed base of the users latest session setting, or should default to open
     * @private
     */
    _setState() {
        const open = GetSiteVar(this.asset.siteVar, true);
        this.dom.state.open = typeof open === 'boolean' ? open : false;
        this.dom.state.closed = !this.dom.state.open;
    }
    /**
     * Create a list of the menus needed for the current app
     * @private
     */
    _setMenus() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            let menus = [];
            const routeAliasMap = {};
            if (this.APP_GLOBAL.isEntities() && IsObject(PopApp, ['menu'])) {
                for (const menuEntity in PopApp.menu) {
                    if (IsObject(PopApp.menu[menuEntity])) {
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
                                }
                                else {
                                    menu.hasAlias = false;
                                }
                                menus.push(new EntityMenu(menu));
                            }
                            else {
                                PopLog.warn(this.name, `Cannot view menu:`, menu);
                            }
                        }
                        else {
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
            }
            else {
                return resolve(menus);
            }
        }));
    }
    /**
     * Set a default route for the project
     * @param parent
     * @param config
     * @param routes
     * @private
     */
    _checkDefaultRoute() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            if (this.router.config.length && IsArray(this.entityMenus, true)) {
                const defaultRoute = this.router.config.find((route) => route.path === '**');
                if (!defaultRoute && this._isValidRoute(this.entityMenus[0].path)) {
                    this.router.config.push({ path: '**', 'redirectTo': this.entityMenus[0].path });
                    PopLog.init(this.name, `Default Route Wildcard **`, this.entityMenus[0].path);
                }
                // const activeRouteUrl = ( !this.router.url || this.router.url === '/' ) ? false : true;
                // if( !activeRouteUrl ){
                const currentPath = window.location.href.split(`${PopHref}`)[1];
                if (this._isValidRoute(currentPath)) {
                    this._fallBackUrlRoute();
                }
                else {
                    this._fallBackMenuRoute();
                }
                // }
            }
            else {
            }
            return resolve(true);
        }));
    }
    /**
     * This fx will try to use the first menu item as the default route
     * @private
     */
    _fallBackMenuRoute() {
        PopLog.init(this.name, `Fallback Menu Route`, this.entityMenus[0].path);
        if (IsArray(this.entityMenus, true) && this._isValidRoute(this.entityMenus[0].path)) {
            this.log.info(`Fallback Menu Route`, this.entityMenus[0].path);
            this.router.navigate([this.entityMenus[0].path]).catch((e) => {
                this.log.info(`Could not find route`);
                this._fallbackSystemRoute();
            });
        }
        else {
            this._fallbackSystemRoute();
        }
    }
    /**
     * This fx will attempt to use the current url as the default route
     * @private
     */
    _fallBackUrlRoute() {
        let currentPath = window.location.href.split(PopHref)[1];
        currentPath = currentPath.split('?')[0];
        if (this._isValidRoute(currentPath)) {
            PopLog.init(this.name, `Current Route`, currentPath);
            this.router.navigate([currentPath], { queryParams: this._getUrlParams() }).catch((e) => {
                this._fallbackSystemRoute();
            }).then(() => {
                if (!(this.router.url.includes(currentPath))) {
                    this._fallbackSystemRoute();
                }
            });
        }
        else {
            this._fallbackSystemRoute();
        }
    }
    /**
     * This fx will temp redirect and try to find a valid route
     * @private
     */
    _fallbackSystemRoute() {
        if (this.dom.state.verified) {
            this.router.navigate(['/system/route'], { skipLocationChange: true });
        }
        else {
            this.router.navigate(['/']);
        }
    }
    /**
     * This fx determines if there is a difference between tow sets of menus(existing, new)
     * @param menus
     * @private
     */
    _isVerifiedMenusDifferent(menus) {
        return !(ObjectsMatch(this.entityMenus, menus));
    }
    /**
     * This fx determines if a path is a valid route
     * @param path
     * @private
     */
    _isValidRoute(path) {
        return IsDefined(path, false) && IsString(path, true) && path !== '/' && path !== 'null' && !(String(path).includes('/error/'));
    }
    _getUrlParams() {
        const params = {};
        window.location.search.slice(1).split('&').forEach(elm => {
            if (elm === '')
                return;
            const spl = elm.split('=');
            const d = decodeURIComponent;
            params[d(spl[0])] = (spl.length >= 2 ? d(spl[1]) : true);
        });
        return params;
    }
}
PopLeftMenuComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-left-menu',
                template: "<div class=\"pop-left-menu\" [ngClass]=\"{'pop-left-menu-closed': dom.state.closed, 'pop-left-menu-open': dom.state.open}\">\n  <mat-nav-list>\n    <div class=\"pop-left-menu-item\" *ngFor=\"let menu of entityMenus\">\n      <a class=\"pop-left-menu-item-header\" [routerLink]=\"menu.path\" matRipple routerLinkActive=\"pop-left-menu-item-header-active\">\n        <div class=\"pop-left-menu-icon-container\">\n          <mat-icon *ngIf=\" menu.iconType && menu.iconType === 'materials'\" [matTooltip]=menu.name [matTooltipPosition]=\"'right'\" [matTooltipDisabled]=\"dom.state.open\">\n            {{menu.icon}}\n          </mat-icon>\n          <span *ngIf=\" menu.iconType && menu.iconType === 'pop'\" class=\"sw-pop-icon\" [matTooltip]=menu.name [matTooltipPosition]=\"'right'\" [matTooltipDisabled]=\"dom.state.open\">\n              {{menu.icon}}\n          </span>\n          <div class=\"sw-circle-ID mat-body-2\" *ngIf=\"!menu.iconType && menu.character_icon\" [matTooltip]=menu.name [matTooltipPosition]=\"'right'\" [matTooltipDisabled]=\"dom.state.open\">\n            {{menu.character_icon}}\n          </div>\n        </div>\n        <div class=\"pop-left-menu-label-container\">\n          <span class=\"mat-body\">{{menu.name}}</span>\n        </div>\n      </a>\n    </div>\n  </mat-nav-list>\n  <lib-main-spinner *ngIf=\"dom.state.loader\"></lib-main-spinner>\n  <button class=\"pop-left-menu-toggle\" mat-icon-button (click)=\"onToggleMenu();\">\n    <span class=\"sw-pop-icon\" *ngIf=\"dom.state.open\" id=\"left-nav-open\">H</span>\n    <span class=\"sw-pop-icon\" *ngIf=\"dom.state.closed\" id=\"left-nav-close\">I</span>\n  </button>\n</div>\n",
                styles: [".pop-left-menu{height:100vh;padding:20px 0 0;margin:0;overflow-x:hidden;overflow-y:auto}.pop-left-menu-open{width:256px;transition:width .5s}.pop-left-menu-closed{width:80px;transition:width .5s}.pop-left-menu-item{position:relative;display:block;min-height:var(--gap-xl);padding:0;margin:0;cursor:pointer;outline:0;white-space:nowrap;overflow:hidden}.pop-left-menu-item-header{position:relative;display:flex;height:var(--gap-xl);width:256px;padding:0;margin:0;align-items:center;box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;clear:both;border-left:4px solid transparent;transition:background-color .35s,border-color .35s;border-left:var(--gap-xxs) solid transparent}.pop-left-menu-item-header-active{border-left-width:var(--gap-xxs);border-left-style:solid;border-left-color:var(--primary-500)!important;background-color:var(background-item-menu)!important;height:var(--gap-xl)}.pop-left-menu-item-header-active span.mat-body{font-weight:700}.pop-left-menu-label-container{flex-grow:1;padding:12px 0 0;text-align:left;color:var(--text)}.pop-left-menu-icon-container,.pop-left-menu-label-container{position:relative;height:40px;margin:0;box-sizing:border-box;overflow:hidden;float:left}.pop-left-menu-icon-container{width:80px;padding-left:var(--gap-lm);padding-right:var(--gap-s)}.pop-left-menu-icon-container .sw-circle-ID{position:absolute;top:4px}.pop-left-menu-item-header:hover{background:var(--background-item-menu)!important}.pop-left-menu-toggle{position:fixed;width:40px;height:40px;padding:10px 30px 30px 26px;margin:0 0 30px;box-sizing:border-box;overflow:hidden;float:left;bottom:0;border-radius:50%;background:transparent}"]
            },] }
];
PopLeftMenuComponent.ctorParameters = () => [
    { type: Router },
    { type: undefined, decorators: [{ type: Inject, args: ['APP_GLOBAL',] }] },
    { type: undefined, decorators: [{ type: Inject, args: ['APP_MENUS',] }] }
];
PopLeftMenuComponent.propDecorators = {
    entityMenus: [{ type: Input }],
    hidden: [{ type: HostBinding, args: ['class.sw-hidden',] }, { type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWxlZnQtbWVudS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9hcHAvcG9wLWxlZnQtbWVudS9wb3AtbGVmdC1tZW51LmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFDLFNBQVMsRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBb0IsTUFBTSxlQUFlLENBQUM7QUFDdkYsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQy9DLE9BQU8sRUFDTCxVQUFVLEVBQ1YsT0FBTyxFQUFFLGtCQUFrQixFQUFFLFNBQVMsRUFDdEMsUUFBUSxFQUFFLFFBQVEsRUFDbEIsWUFBWSxFQUNaLFVBQVUsRUFDVixrQkFBa0IsRUFBRSxTQUFTLEdBQzlCLE1BQU0sNkJBQTZCLENBQUM7QUFDckMsT0FBTyxFQUdMLE1BQU0sRUFDTixPQUFPLEVBQ1AsT0FBTyxFQUNQLE1BQU0sRUFDTixlQUFlLEVBQ2YsbUJBQW1CLEdBQ3BCLE1BQU0sMkJBQTJCLENBQUM7QUFDbkMsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ3ZDLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLCtCQUErQixDQUFDO0FBQ2pFLE9BQU8sRUFBQyx5QkFBeUIsRUFBQyxNQUFNLHFEQUFxRCxDQUFDO0FBUTlGLE1BQU0sT0FBTyxvQkFBcUIsU0FBUSxrQkFBa0I7SUFnQjFELFlBQ1UsTUFBYyxFQUNRLFVBQThCLEVBQy9CLFNBQTRCO1FBRXpELEtBQUssRUFBRSxDQUFDO1FBSkEsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUNRLGVBQVUsR0FBVixVQUFVLENBQW9CO1FBQy9CLGNBQVMsR0FBVCxTQUFTLENBQW1CO1FBbEJsRCxnQkFBVyxHQUFpQixFQUFFLENBQUM7UUFDQyxXQUFNLEdBQUcsS0FBSyxDQUFDO1FBQ2pELFNBQUksR0FBRyxzQkFBc0IsQ0FBQztRQUUzQixRQUFHLEdBQUc7WUFDZCxLQUFLLEVBQTZCLGVBQWUsQ0FBQyxHQUFHLENBQUMseUJBQXlCLENBQUM7U0FDakYsQ0FBQztRQUVRLFVBQUssR0FBRztZQUNoQixPQUFPLEVBQUUsbUJBQW1CO1NBQzdCLENBQUM7UUFFSyxPQUFFLEdBQUcsRUFBRSxDQUFDO1FBVWIsSUFBSSxVQUFVLENBQUMsTUFBTSxFQUFFLEVBQUU7WUFDdkIsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDdkQsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztTQUNySDthQUFNO1lBQ0wsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ25CLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBTyxHQUFZLEVBQUUsRUFBRTtnQkFDbkYsSUFBSSxHQUFHLEVBQUU7b0JBQ1AsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsQ0FBQztvQkFDN0QsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO2lCQUNwQjtZQUNILENBQUMsQ0FBQSxDQUFDLENBQUMsQ0FBQztTQUNMO1FBR0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsR0FBcUIsRUFBRTtZQUMxQyxPQUFPLElBQUksT0FBTyxDQUFDLENBQU8sT0FBTyxFQUFFLEVBQUU7Z0JBRW5DLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3ZCLENBQUMsQ0FBQSxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUM7UUFFRixJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sR0FBRyxHQUFxQixFQUFFO1lBQ3hDLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBTyxPQUFPLEVBQUUsRUFBRTtnQkFDbkMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUNqQixPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN2QixDQUFDLENBQUEsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUdELFFBQVE7UUFDTixLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDbkIsQ0FBQztJQUVEOztPQUVHO0lBQ0ksWUFBWTtRQUNqQixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7UUFDM0MsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO1FBQzdDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNwRCxNQUFNLENBQUMsYUFBYSxDQUFDLElBQUksS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztJQUNwRCxDQUFDO0lBRUQsV0FBVztRQUNULEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN0QixDQUFDO0lBSUQ7Ozs7O3NHQUtrRztJQUdsRzs7O09BR0c7SUFDSyxXQUFXO1FBQ2pCLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxHQUFTLEVBQUU7WUFDckMsTUFBTSxLQUFLLEdBQUcsTUFBTSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDckMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDeEQsSUFBSSxPQUFPLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDakUsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7YUFDMUI7WUFDRCxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1lBQ3BILElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFO2dCQUMzQixNQUFNLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO2FBQ2pDO1FBRUgsQ0FBQyxDQUFBLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDUixDQUFDO0lBR0Q7Ozs7T0FJRztJQUNLLFNBQVM7UUFDZixNQUFNLElBQUksR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDbEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLE9BQU8sSUFBSSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDL0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO0lBQy9DLENBQUM7SUFHRDs7O09BR0c7SUFDSyxTQUFTO1FBQ2YsT0FBTyxJQUFJLE9BQU8sQ0FBZSxDQUFPLE9BQU8sRUFBRSxFQUFFO1lBQ2pELElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztZQUNmLE1BQU0sYUFBYSxHQUFHLEVBQUUsQ0FBQztZQUN6QixJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLElBQUksUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUU7Z0JBQzlELEtBQUssTUFBTSxVQUFVLElBQUksTUFBTSxDQUFDLElBQUksRUFBRTtvQkFDcEMsSUFBSSxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBRSxVQUFVLENBQUMsQ0FBQyxFQUFFO3dCQUN0QyxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO3dCQUNyQyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7d0JBQzlCLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQzt3QkFFOUIsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFOzRCQUNsQixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDOzRCQUM5RCxJQUFJLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLEVBQUUsZUFBZSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxVQUFVLENBQUMsRUFBRTtnQ0FDN0csSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7Z0NBQzFCLElBQUksQ0FBQyxhQUFhLEdBQUcsTUFBTSxDQUFDLGFBQWEsQ0FBQztnQ0FDMUMsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxJQUFJLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDLEVBQUU7b0NBQzdFLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7b0NBQzNCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO29DQUNyQixJQUFJLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7b0NBQ3BDLElBQUksQ0FBQyxJQUFJLEdBQUcsa0JBQWtCLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO29DQUM3QyxhQUFhLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQztpQ0FDckU7cUNBQU07b0NBQ0wsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7aUNBQ3ZCO2dDQUNELEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzs2QkFDbEM7aUNBQU07Z0NBQ0wsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLG1CQUFtQixFQUFFLElBQUksQ0FBQyxDQUFDOzZCQUNuRDt5QkFDRjs2QkFBTTs0QkFDTCxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7eUJBQ2xDO3FCQUNGO2lCQUNGO2dCQUNELElBQUksa0JBQWtCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDM0MsS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUNwQztnQkFDRCxtQkFBbUIsQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFDbkMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzFCLE9BQU8sT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ3ZCO2lCQUFNO2dCQUNMLE9BQU8sT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ3ZCO1FBQ0gsQ0FBQyxDQUFBLENBQUMsQ0FBQztJQUNMLENBQUM7SUFHRDs7Ozs7O09BTUc7SUFDSyxrQkFBa0I7UUFDeEIsT0FBTyxJQUFJLE9BQU8sQ0FBVSxDQUFPLE9BQU8sRUFBRSxFQUFFO1lBQzVDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxFQUFFO2dCQUNoRSxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLENBQUM7Z0JBQzdFLElBQUksQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFO29CQUNqRSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBQyxDQUFDLENBQUM7b0JBQzlFLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSwyQkFBMkIsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUMvRTtnQkFDRCx5RkFBeUY7Z0JBQ3pGLHlCQUF5QjtnQkFDekIsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDaEUsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxFQUFFO29CQUNuQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztpQkFDMUI7cUJBQU07b0JBQ0wsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7aUJBQzNCO2dCQUNELElBQUk7YUFDTDtpQkFBTTthQUVOO1lBQ0QsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdkIsQ0FBQyxDQUFBLENBQUMsQ0FBQztJQUNMLENBQUM7SUFHRDs7O09BR0c7SUFDSyxrQkFBa0I7UUFDeEIsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLHFCQUFxQixFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDeEUsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDbkYsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMscUJBQXFCLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMvRCxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtnQkFDM0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQztnQkFDdEMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7WUFDOUIsQ0FBQyxDQUFDLENBQUM7U0FDSjthQUFNO1lBQ0wsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7U0FDN0I7SUFDSCxDQUFDO0lBR0Q7OztPQUdHO0lBQ0ssaUJBQWlCO1FBQ3ZCLElBQUksV0FBVyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN6RCxXQUFXLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN4QyxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLEVBQUU7WUFDbkMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUNyRCxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxFQUFFLEVBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsRUFBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7Z0JBQ25GLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1lBQzlCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7Z0JBQ1gsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUU7b0JBQzVDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO2lCQUM3QjtZQUNILENBQUMsQ0FBQyxDQUFDO1NBQ0o7YUFBTTtZQUNMLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1NBQzdCO0lBQ0gsQ0FBQztJQUdEOzs7T0FHRztJQUNLLG9CQUFvQjtRQUMxQixJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRTtZQUMzQixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxFQUFFLEVBQUMsa0JBQWtCLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztTQUNyRTthQUFNO1lBQ0wsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1NBQzdCO0lBQ0gsQ0FBQztJQUdEOzs7O09BSUc7SUFDSyx5QkFBeUIsQ0FBQyxLQUFtQjtRQUNuRCxPQUFPLENBQUMsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFHRDs7OztPQUlHO0lBQ0ssYUFBYSxDQUFDLElBQVk7UUFDaEMsT0FBTyxTQUFTLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJLFFBQVEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksSUFBSSxLQUFLLEdBQUcsSUFBSSxJQUFJLEtBQUssTUFBTSxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7SUFDbEksQ0FBQztJQUdPLGFBQWE7UUFDbkIsTUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2xCLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ3ZELElBQUksR0FBRyxLQUFLLEVBQUU7Z0JBQUUsT0FBTztZQUN2QixNQUFNLEdBQUcsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzNCLE1BQU0sQ0FBQyxHQUFHLGtCQUFrQixDQUFDO1lBQzdCLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNELENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyxNQUFNLENBQUM7SUFDaEIsQ0FBQzs7O1lBNVJGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsbUJBQW1CO2dCQUM3Qiw2b0RBQTZDOzthQUU5Qzs7O1lBVE8sTUFBTTs0Q0E0QlQsTUFBTSxTQUFDLFlBQVk7NENBQ25CLE1BQU0sU0FBQyxXQUFXOzs7MEJBbEJwQixLQUFLO3FCQUNMLFdBQVcsU0FBQyxpQkFBaUIsY0FBRyxLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDb21wb25lbnQsIEhvc3RCaW5kaW5nLCBJbmplY3QsIElucHV0LCBPbkRlc3Ryb3ksIE9uSW5pdH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0VudGl0eU1lbnV9IGZyb20gJy4vZW50aXR5LW1lbnUubW9kZWwnO1xuaW1wb3J0IHtcbiAgR2V0U2l0ZVZhcixcbiAgSXNBcnJheSwgSXNDYWxsYWJsZUZ1bmN0aW9uLCBJc0RlZmluZWQsXG4gIElzT2JqZWN0LCBJc1N0cmluZyxcbiAgT2JqZWN0c01hdGNoLFxuICBTZXRTaXRlVmFyLFxuICBTcGFjZVRvSHlwaGVuTG93ZXIsIFRpdGxlQ2FzZSxcbn0gZnJvbSAnLi4vLi4vLi4vcG9wLWNvbW1vbi11dGlsaXR5JztcbmltcG9ydCB7XG4gIEFwcEdsb2JhbEludGVyZmFjZSxcbiAgQXBwTWVudXNJbnRlcmZhY2UsXG4gIFBvcEFwcCxcbiAgUG9wQXV0aCxcbiAgUG9wSHJlZixcbiAgUG9wTG9nLFxuICBTZXJ2aWNlSW5qZWN0b3IsXG4gIFNldFBvcEFsaWFzUm91dGVNYXAsXG59IGZyb20gJy4uLy4uLy4uL3BvcC1jb21tb24ubW9kZWwnO1xuaW1wb3J0IHtSb3V0ZXJ9IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XG5pbXBvcnQge1BvcEV4dGVuZENvbXBvbmVudH0gZnJvbSAnLi4vLi4vLi4vcG9wLWV4dGVuZC5jb21wb25lbnQnO1xuaW1wb3J0IHtQb3BFbnRpdHlVdGlsUGFyYW1TZXJ2aWNlfSBmcm9tICcuLi8uLi9lbnRpdHkvc2VydmljZXMvcG9wLWVudGl0eS11dGlsLXBhcmFtLnNlcnZpY2UnO1xuXG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2xpYi1wb3AtbGVmdC1tZW51JyxcbiAgdGVtcGxhdGVVcmw6ICcuL3BvcC1sZWZ0LW1lbnUuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsnLi9wb3AtbGVmdC1tZW51LmNvbXBvbmVudC5zY3NzJ10sXG59KVxuZXhwb3J0IGNsYXNzIFBvcExlZnRNZW51Q29tcG9uZW50IGV4dGVuZHMgUG9wRXh0ZW5kQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xuICBASW5wdXQoKSBlbnRpdHlNZW51czogRW50aXR5TWVudVtdID0gW107XG4gIEBIb3N0QmluZGluZygnY2xhc3Muc3ctaGlkZGVuJykgQElucHV0KCkgaGlkZGVuID0gZmFsc2U7XG4gIHB1YmxpYyBuYW1lID0gJ1BvcExlZnRNZW51Q29tcG9uZW50JztcblxuICBwcm90ZWN0ZWQgc3J2ID0ge1xuICAgIHBhcmFtOiA8UG9wRW50aXR5VXRpbFBhcmFtU2VydmljZT5TZXJ2aWNlSW5qZWN0b3IuZ2V0KFBvcEVudGl0eVV0aWxQYXJhbVNlcnZpY2UpXG4gIH07XG5cbiAgcHJvdGVjdGVkIGFzc2V0ID0ge1xuICAgIHNpdGVWYXI6ICdBcHAuTGVmdE1lbnUub3BlbicsXG4gIH07XG5cbiAgcHVibGljIHVpID0ge307XG5cblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIHJvdXRlcjogUm91dGVyLFxuICAgIEBJbmplY3QoJ0FQUF9HTE9CQUwnKSBwcml2YXRlIEFQUF9HTE9CQUw6IEFwcEdsb2JhbEludGVyZmFjZSxcbiAgICBASW5qZWN0KCdBUFBfTUVOVVMnKSBwcml2YXRlIEFQUF9NRU5VUzogQXBwTWVudXNJbnRlcmZhY2UsXG4gICkge1xuICAgIHN1cGVyKCk7XG5cbiAgICBpZiAoQVBQX0dMT0JBTC5pc09wZW4oKSkge1xuICAgICAgUG9wTG9nLmluaXQodGhpcy5uYW1lLCBgUHVibGljIEFwcGAsIHRoaXMuZW50aXR5TWVudXMpO1xuICAgICAgdGhpcy5oaWRkZW4gPSAoKHRoaXMuQVBQX0dMT0JBTC5pc0VudGl0aWVzKCkgJiYgIShJc09iamVjdChQb3BBdXRoKSkpIHx8ICEodGhpcy5lbnRpdHlNZW51cy5sZW5ndGgpKSA/IHRydWUgOiBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5faW5pdGlhbGl6ZSgpO1xuICAgICAgdGhpcy5kb20uc2V0U3Vic2NyaWJlcignaW5pdCcsIHRoaXMuQVBQX0dMT0JBTC5pbml0LnN1YnNjcmliZShhc3luYyAodmFsOiBib29sZWFuKSA9PiB7XG4gICAgICAgIGlmICh2YWwpIHtcbiAgICAgICAgICB0aGlzLmRvbS5zdGF0ZS52ZXJpZmllZCA9IGF3YWl0IHRoaXMuQVBQX0dMT0JBTC5pc1ZlcmlmaWVkKCk7XG4gICAgICAgICAgdGhpcy5faW5pdGlhbGl6ZSgpO1xuICAgICAgICB9XG4gICAgICB9KSk7XG4gICAgfVxuXG5cbiAgICB0aGlzLmRvbS5jb25maWd1cmUgPSAoKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgKHJlc29sdmUpID0+IHtcblxuICAgICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICB0aGlzLmRvbS5wcm9jZWVkID0gKCk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jIChyZXNvbHZlKSA9PiB7XG4gICAgICAgIHRoaXMuX3NldFN0YXRlKCk7XG4gICAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfVxuXG5cbiAgbmdPbkluaXQoKSB7XG4gICAgc3VwZXIubmdPbkluaXQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIGZ4IHdpbGwgb3Blbi9jbG9zZSB0aGUgbGVmdCBzaWRlIG5hdlxuICAgKi9cbiAgcHVibGljIG9uVG9nZ2xlTWVudSgpOiB2b2lkIHtcbiAgICB0aGlzLmRvbS5zdGF0ZS5vcGVuID0gIXRoaXMuZG9tLnN0YXRlLm9wZW47XG4gICAgdGhpcy5kb20uc3RhdGUuY2xvc2VkID0gIXRoaXMuZG9tLnN0YXRlLm9wZW47XG4gICAgU2V0U2l0ZVZhcih0aGlzLmFzc2V0LnNpdGVWYXIsIHRoaXMuZG9tLnN0YXRlLm9wZW4pO1xuICAgIHdpbmRvdy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnb25XaW5kb3dSZXNpemUnKSk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICBzdXBlci5uZ09uRGVzdHJveSgpO1xuICB9XG5cblxuXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVW5kZXIgVGhlIEhvb2QgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBQcml2YXRlIE1ldGhvZCApICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG5cbiAgLyoqXG4gICAqIFRoaXMgZnggd2lsbCBidWlsZCBvdXQgdGhlIG1lbnVzIGZvciB0aGlzIGNvbXBvbmVudFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcHJpdmF0ZSBfaW5pdGlhbGl6ZSgpIHtcbiAgICB0aGlzLmRvbS5zZXRUaW1lb3V0KGBpbml0YCwgYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgbWVudXMgPSBhd2FpdCB0aGlzLl9zZXRNZW51cygpO1xuICAgICAgUG9wTG9nLmluaXQodGhpcy5uYW1lLCBgUHJpdmF0ZSBBcHBgLCB0aGlzLmVudGl0eU1lbnVzKTtcbiAgICAgIGlmIChJc0FycmF5KG1lbnVzLCB0cnVlKSAmJiB0aGlzLl9pc1ZlcmlmaWVkTWVudXNEaWZmZXJlbnQobWVudXMpKSB7XG4gICAgICAgIHRoaXMuZW50aXR5TWVudXMgPSBtZW51cztcbiAgICAgIH1cbiAgICAgIHRoaXMuaGlkZGVuID0gKCh0aGlzLkFQUF9HTE9CQUwuaXNFbnRpdGllcygpICYmICEoSXNPYmplY3QoUG9wQXV0aCkpKSB8fCAhKHRoaXMuZW50aXR5TWVudXMubGVuZ3RoKSkgPyB0cnVlIDogZmFsc2U7XG4gICAgICBpZiAodGhpcy5kb20uc3RhdGUudmVyaWZpZWQpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5fY2hlY2tEZWZhdWx0Um91dGUoKTtcbiAgICAgIH1cblxuICAgIH0sIDUpO1xuICB9XG5cblxuICAvKipcbiAgICogRGV0ZXJtaW5lIHRoZSBzdGF0ZSBvZiB0aGlzIGNvbXBvbmVudFxuICAgKiBUaGUgY29tcG9uZW50IHNob3VsZCBiZSBvcGVuIG9yIGNsb3NlZCBiYXNlIG9mIHRoZSB1c2VycyBsYXRlc3Qgc2Vzc2lvbiBzZXR0aW5nLCBvciBzaG91bGQgZGVmYXVsdCB0byBvcGVuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBwcml2YXRlIF9zZXRTdGF0ZSgpIHtcbiAgICBjb25zdCBvcGVuID0gR2V0U2l0ZVZhcih0aGlzLmFzc2V0LnNpdGVWYXIsIHRydWUpO1xuICAgIHRoaXMuZG9tLnN0YXRlLm9wZW4gPSB0eXBlb2Ygb3BlbiA9PT0gJ2Jvb2xlYW4nID8gb3BlbiA6IGZhbHNlO1xuICAgIHRoaXMuZG9tLnN0YXRlLmNsb3NlZCA9ICF0aGlzLmRvbS5zdGF0ZS5vcGVuO1xuICB9XG5cblxuICAvKipcbiAgICogQ3JlYXRlIGEgbGlzdCBvZiB0aGUgbWVudXMgbmVlZGVkIGZvciB0aGUgY3VycmVudCBhcHBcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHByaXZhdGUgX3NldE1lbnVzKCk6IFByb21pc2U8RW50aXR5TWVudVtdPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPEVudGl0eU1lbnVbXT4oYXN5bmMgKHJlc29sdmUpID0+IHtcbiAgICAgIGxldCBtZW51cyA9IFtdO1xuICAgICAgY29uc3Qgcm91dGVBbGlhc01hcCA9IHt9O1xuICAgICAgaWYgKHRoaXMuQVBQX0dMT0JBTC5pc0VudGl0aWVzKCkgJiYgSXNPYmplY3QoUG9wQXBwLCBbJ21lbnUnXSkpIHtcbiAgICAgICAgZm9yIChjb25zdCBtZW51RW50aXR5IGluIFBvcEFwcC5tZW51KSB7XG4gICAgICAgICAgaWYgKElzT2JqZWN0KFBvcEFwcC5tZW51IFttZW51RW50aXR5XSkpIHtcbiAgICAgICAgICAgIGNvbnN0IG1lbnUgPSBQb3BBcHAubWVudVttZW51RW50aXR5XTtcbiAgICAgICAgICAgIG1lbnUub3JpZ2luYWxQYXRoID0gbWVudS5wYXRoO1xuICAgICAgICAgICAgbWVudS5vcmlnaW5hbE5hbWUgPSBtZW51Lm5hbWU7XG5cbiAgICAgICAgICAgIGlmIChtZW51LmVudGl0eV9pZCkge1xuICAgICAgICAgICAgICBjb25zdCBwYXJhbXMgPSB0aGlzLnNydi5wYXJhbS5nZXRFbnRpdHlQYXJhbXMobWVudS5lbnRpdHlfaWQpO1xuICAgICAgICAgICAgICBpZiAoSXNPYmplY3QocGFyYW1zLCBbJ2lkJywgJ2ludGVybmFsX25hbWUnXSkgJiYgdGhpcy5zcnYucGFyYW0uY2hlY2tBY2Nlc3MocGFyYW1zLmludGVybmFsX25hbWUsICdjYW5fcmVhZCcpKSB7XG4gICAgICAgICAgICAgICAgbWVudS5pZCA9ICttZW51LmVudGl0eV9pZDtcbiAgICAgICAgICAgICAgICBtZW51LmludGVybmFsX25hbWUgPSBwYXJhbXMuaW50ZXJuYWxfbmFtZTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5BUFBfR0xPQkFMLmlzQWxpYXNlcygpICYmIElzT2JqZWN0KHBhcmFtcy5hbGlhcywgWyduYW1lJywgJ3BsdXJhbCddKSkge1xuICAgICAgICAgICAgICAgICAgY29uc3QgYWxpYXMgPSBwYXJhbXMuYWxpYXM7XG4gICAgICAgICAgICAgICAgICBtZW51Lmhhc0FsaWFzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgIG1lbnUubmFtZSA9IFRpdGxlQ2FzZShhbGlhcy5wbHVyYWwpO1xuICAgICAgICAgICAgICAgICAgbWVudS5wYXRoID0gU3BhY2VUb0h5cGhlbkxvd2VyKGFsaWFzLnBsdXJhbCk7XG4gICAgICAgICAgICAgICAgICByb3V0ZUFsaWFzTWFwW1NwYWNlVG9IeXBoZW5Mb3dlcihhbGlhcy5wbHVyYWwpXSA9IG1lbnUub3JpZ2luYWxQYXRoO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBtZW51Lmhhc0FsaWFzID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG1lbnVzLnB1c2gobmV3IEVudGl0eU1lbnUobWVudSkpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIFBvcExvZy53YXJuKHRoaXMubmFtZSwgYENhbm5vdCB2aWV3IG1lbnU6YCwgbWVudSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIG1lbnVzLnB1c2gobmV3IEVudGl0eU1lbnUobWVudSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoSXNDYWxsYWJsZUZ1bmN0aW9uKHRoaXMuQVBQX01FTlVTLmluaXQpKSB7XG4gICAgICAgICAgbWVudXMgPSB0aGlzLkFQUF9NRU5VUy5pbml0KG1lbnVzKTtcbiAgICAgICAgfVxuICAgICAgICBTZXRQb3BBbGlhc1JvdXRlTWFwKHJvdXRlQWxpYXNNYXApO1xuICAgICAgICB0aGlzLkFQUF9NRU5VUy5zZXQobWVudXMpO1xuICAgICAgICByZXR1cm4gcmVzb2x2ZShtZW51cyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcmVzb2x2ZShtZW51cyk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBTZXQgYSBkZWZhdWx0IHJvdXRlIGZvciB0aGUgcHJvamVjdFxuICAgKiBAcGFyYW0gcGFyZW50XG4gICAqIEBwYXJhbSBjb25maWdcbiAgICogQHBhcmFtIHJvdXRlc1xuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcHJpdmF0ZSBfY2hlY2tEZWZhdWx0Um91dGUoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGJvb2xlYW4+KGFzeW5jIChyZXNvbHZlKSA9PiB7XG4gICAgICBpZiAodGhpcy5yb3V0ZXIuY29uZmlnLmxlbmd0aCAmJiBJc0FycmF5KHRoaXMuZW50aXR5TWVudXMsIHRydWUpKSB7XG4gICAgICAgIGNvbnN0IGRlZmF1bHRSb3V0ZSA9IHRoaXMucm91dGVyLmNvbmZpZy5maW5kKChyb3V0ZSkgPT4gcm91dGUucGF0aCA9PT0gJyoqJyk7XG4gICAgICAgIGlmICghZGVmYXVsdFJvdXRlICYmIHRoaXMuX2lzVmFsaWRSb3V0ZSh0aGlzLmVudGl0eU1lbnVzWzBdLnBhdGgpKSB7XG4gICAgICAgICAgdGhpcy5yb3V0ZXIuY29uZmlnLnB1c2goe3BhdGg6ICcqKicsICdyZWRpcmVjdFRvJzogdGhpcy5lbnRpdHlNZW51c1swXS5wYXRofSk7XG4gICAgICAgICAgUG9wTG9nLmluaXQodGhpcy5uYW1lLCBgRGVmYXVsdCBSb3V0ZSBXaWxkY2FyZCAqKmAsIHRoaXMuZW50aXR5TWVudXNbMF0ucGF0aCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gY29uc3QgYWN0aXZlUm91dGVVcmwgPSAoICF0aGlzLnJvdXRlci51cmwgfHwgdGhpcy5yb3V0ZXIudXJsID09PSAnLycgKSA/IGZhbHNlIDogdHJ1ZTtcbiAgICAgICAgLy8gaWYoICFhY3RpdmVSb3V0ZVVybCApe1xuICAgICAgICBjb25zdCBjdXJyZW50UGF0aCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLnNwbGl0KGAke1BvcEhyZWZ9YClbMV07XG4gICAgICAgIGlmICh0aGlzLl9pc1ZhbGlkUm91dGUoY3VycmVudFBhdGgpKSB7XG4gICAgICAgICAgdGhpcy5fZmFsbEJhY2tVcmxSb3V0ZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX2ZhbGxCYWNrTWVudVJvdXRlKCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gfVxuICAgICAgfSBlbHNlIHtcblxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc29sdmUodHJ1ZSk7XG4gICAgfSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIGZ4IHdpbGwgdHJ5IHRvIHVzZSB0aGUgZmlyc3QgbWVudSBpdGVtIGFzIHRoZSBkZWZhdWx0IHJvdXRlXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBwcml2YXRlIF9mYWxsQmFja01lbnVSb3V0ZSgpIHtcbiAgICBQb3BMb2cuaW5pdCh0aGlzLm5hbWUsIGBGYWxsYmFjayBNZW51IFJvdXRlYCwgdGhpcy5lbnRpdHlNZW51c1swXS5wYXRoKTtcbiAgICBpZiAoSXNBcnJheSh0aGlzLmVudGl0eU1lbnVzLCB0cnVlKSAmJiB0aGlzLl9pc1ZhbGlkUm91dGUodGhpcy5lbnRpdHlNZW51c1swXS5wYXRoKSkge1xuICAgICAgdGhpcy5sb2cuaW5mbyhgRmFsbGJhY2sgTWVudSBSb3V0ZWAsIHRoaXMuZW50aXR5TWVudXNbMF0ucGF0aCk7XG4gICAgICB0aGlzLnJvdXRlci5uYXZpZ2F0ZShbdGhpcy5lbnRpdHlNZW51c1swXS5wYXRoXSkuY2F0Y2goKGUpID0+IHtcbiAgICAgICAgdGhpcy5sb2cuaW5mbyhgQ291bGQgbm90IGZpbmQgcm91dGVgKTtcbiAgICAgICAgdGhpcy5fZmFsbGJhY2tTeXN0ZW1Sb3V0ZSgpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2ZhbGxiYWNrU3lzdGVtUm91dGUoKTtcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIGZ4IHdpbGwgYXR0ZW1wdCB0byB1c2UgdGhlIGN1cnJlbnQgdXJsIGFzIHRoZSBkZWZhdWx0IHJvdXRlXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBwcml2YXRlIF9mYWxsQmFja1VybFJvdXRlKCkge1xuICAgIGxldCBjdXJyZW50UGF0aCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLnNwbGl0KFBvcEhyZWYpWzFdO1xuICAgIGN1cnJlbnRQYXRoID0gY3VycmVudFBhdGguc3BsaXQoJz8nKVswXTtcbiAgICBpZiAodGhpcy5faXNWYWxpZFJvdXRlKGN1cnJlbnRQYXRoKSkge1xuICAgICAgUG9wTG9nLmluaXQodGhpcy5uYW1lLCBgQ3VycmVudCBSb3V0ZWAsIGN1cnJlbnRQYXRoKTtcbiAgICAgIHRoaXMucm91dGVyLm5hdmlnYXRlKFtjdXJyZW50UGF0aF0sIHtxdWVyeVBhcmFtczogdGhpcy5fZ2V0VXJsUGFyYW1zKCl9KS5jYXRjaCgoZSkgPT4ge1xuICAgICAgICB0aGlzLl9mYWxsYmFja1N5c3RlbVJvdXRlKCk7XG4gICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgaWYgKCEodGhpcy5yb3V0ZXIudXJsLmluY2x1ZGVzKGN1cnJlbnRQYXRoKSkpIHtcbiAgICAgICAgICB0aGlzLl9mYWxsYmFja1N5c3RlbVJvdXRlKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9mYWxsYmFja1N5c3RlbVJvdXRlKCk7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogVGhpcyBmeCB3aWxsIHRlbXAgcmVkaXJlY3QgYW5kIHRyeSB0byBmaW5kIGEgdmFsaWQgcm91dGVcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHByaXZhdGUgX2ZhbGxiYWNrU3lzdGVtUm91dGUoKSB7XG4gICAgaWYgKHRoaXMuZG9tLnN0YXRlLnZlcmlmaWVkKSB7XG4gICAgICB0aGlzLnJvdXRlci5uYXZpZ2F0ZShbJy9zeXN0ZW0vcm91dGUnXSwge3NraXBMb2NhdGlvbkNoYW5nZTogdHJ1ZX0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJvdXRlci5uYXZpZ2F0ZShbJy8nXSk7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogVGhpcyBmeCBkZXRlcm1pbmVzIGlmIHRoZXJlIGlzIGEgZGlmZmVyZW5jZSBiZXR3ZWVuIHRvdyBzZXRzIG9mIG1lbnVzKGV4aXN0aW5nLCBuZXcpXG4gICAqIEBwYXJhbSBtZW51c1xuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcHJpdmF0ZSBfaXNWZXJpZmllZE1lbnVzRGlmZmVyZW50KG1lbnVzOiBFbnRpdHlNZW51W10pIHtcbiAgICByZXR1cm4gIShPYmplY3RzTWF0Y2godGhpcy5lbnRpdHlNZW51cywgbWVudXMpKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgZnggZGV0ZXJtaW5lcyBpZiBhIHBhdGggaXMgYSB2YWxpZCByb3V0ZVxuICAgKiBAcGFyYW0gcGF0aFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcHJpdmF0ZSBfaXNWYWxpZFJvdXRlKHBhdGg6IHN0cmluZykge1xuICAgIHJldHVybiBJc0RlZmluZWQocGF0aCwgZmFsc2UpICYmIElzU3RyaW5nKHBhdGgsIHRydWUpICYmIHBhdGggIT09ICcvJyAmJiBwYXRoICE9PSAnbnVsbCcgJiYgIShTdHJpbmcocGF0aCkuaW5jbHVkZXMoJy9lcnJvci8nKSk7XG4gIH1cblxuXG4gIHByaXZhdGUgX2dldFVybFBhcmFtcygpIHtcbiAgICBjb25zdCBwYXJhbXMgPSB7fTtcbiAgICB3aW5kb3cubG9jYXRpb24uc2VhcmNoLnNsaWNlKDEpLnNwbGl0KCcmJykuZm9yRWFjaChlbG0gPT4ge1xuICAgICAgaWYgKGVsbSA9PT0gJycpIHJldHVybjtcbiAgICAgIGNvbnN0IHNwbCA9IGVsbS5zcGxpdCgnPScpO1xuICAgICAgY29uc3QgZCA9IGRlY29kZVVSSUNvbXBvbmVudDtcbiAgICAgIHBhcmFtc1tkKHNwbFswXSldID0gKHNwbC5sZW5ndGggPj0gMiA/IGQoc3BsWzFdKSA6IHRydWUpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHBhcmFtcztcbiAgfVxufVxuXG4iXX0=