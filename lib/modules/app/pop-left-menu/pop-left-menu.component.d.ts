import { OnDestroy, OnInit } from '@angular/core';
import { EntityMenu } from './entity-menu.model';
import { AppGlobalInterface, AppMenusInterface } from '../../../pop-common.model';
import { Router } from '@angular/router';
import { PopExtendComponent } from '../../../pop-extend.component';
import { PopEntityUtilParamService } from '../../entity/services/pop-entity-util-param.service';
export declare class PopLeftMenuComponent extends PopExtendComponent implements OnInit, OnDestroy {
    private router;
    private APP_GLOBAL;
    private APP_MENUS;
    entityMenus: EntityMenu[];
    hidden: boolean;
    name: string;
    protected srv: {
        param: PopEntityUtilParamService;
    };
    protected asset: {
        siteVar: string;
    };
    ui: {};
    constructor(router: Router, APP_GLOBAL: AppGlobalInterface, APP_MENUS: AppMenusInterface);
    ngOnInit(): void;
    /**
     * This fx will open/close the left side nav
     */
    onToggleMenu(): void;
    ngOnDestroy(): void;
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
    private _initialize;
    /**
     * Determine the state of this component
     * The component should be open or closed base of the users latest session setting, or should default to open
     * @private
     */
    private _setState;
    /**
     * Create a list of the menus needed for the current app
     * @private
     */
    private _setMenus;
    /**
     * Set a default route for the project
     * @param parent
     * @param config
     * @param routes
     * @private
     */
    private _checkDefaultRoute;
    /**
     * This fx will try to use the first menu item as the default route
     * @private
     */
    private _fallBackMenuRoute;
    /**
     * This fx will attempt to use the current url as the default route
     * @private
     */
    private _fallBackUrlRoute;
    /**
     * This fx will temp redirect and try to find a valid route
     * @private
     */
    private _fallbackSystemRoute;
    /**
     * This fx determines if there is a difference between tow sets of menus(existing, new)
     * @param menus
     * @private
     */
    private _isVerifiedMenusDifferent;
    /**
     * This fx determines if a path is a valid route
     * @param path
     * @private
     */
    private _isValidRoute;
    private _getUrlParams;
}
