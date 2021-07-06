import { OnInit, ElementRef, OnDestroy } from '@angular/core';
import { PopBaseService } from '../../../services/pop-base.service';
import { Business, AuthUser } from '../../../pop-common-token.model';
import { AppGlobalInterface, KeyMap } from '../../../pop-common.model';
import { PopMenuService } from './pop-menu.service';
import { PopCredentialService } from '../../../services/pop-credential.service';
import { PopExtendComponent } from '../../../pop-extend.component';
import { Router } from '@angular/router';
export declare class PopMenuComponent extends PopExtendComponent implements OnInit, OnDestroy {
    private APP_GLOBAL;
    mmNavRef: ElementRef;
    name: string;
    protected asset: {
        existingBusinesses: KeyMap<Business>;
    };
    ui: {
        alternate_businesses: any[];
        menus: {
            all: any[];
            more: any[];
        };
        user: AuthUser;
    };
    protected srv: {
        base: PopBaseService;
        credential: PopCredentialService;
        menu: PopMenuService;
        router: Router;
    };
    constructor(APP_GLOBAL: AppGlobalInterface);
    ngOnInit(): void;
    /**
     * The user click to a app nav menu
     * @param appPath
     */
    onChangeApp(appPath: string): void;
    /**
     * Temporary fx to help test if the menu can auto update itself to external changes
     */
    onAuthVerification(): void;
    /**
     * A user can select from a list of businesses that their prime user has access to
     * @param appPath
     */
    onChangeBusiness(id: number): void;
    /**
     * Determine the presentation of the nav menus
     */
    onUpdateMenus(): void;
    ngOnDestroy(): void;
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
    private _setInitialConfig;
    /**
     * Initialize the component
     * This is designed so that at any time a verification event can be fired from the Initializer module, and the menu can respond to the business(app)s that is stored in the new Auth Token
     * Future:  A web socket will be able to detect a change in security+access of apps and trigger the menu to auto update
     */
    private _initialize;
    /**
     * Set the menus for the current business, apps across the top
     * @param business
     */
    private _loadBusiness;
    /**
     * This set the nav menu across the top of template
     * @param business
     */
    private _setBusinessAppMenus;
    /**
     * This fx will extract the necessary data out of the app data
     * @param app
     * @private
     */
    private _extractAppMenu;
}
