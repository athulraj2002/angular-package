import { TabMenuConfig, } from './tab-menu.model';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { PopEntityService } from '../../entity/services/pop-entity.service';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { PopLog, ServiceInjector, SetPopCacheRedirectUrl } from '../../../pop-common.model';
import { PopLogService } from '../../../services/pop-log.service';
import { ArrayMapSetter, GetSessionSiteVar, IsObject, IsString, PopUid, SetSessionSiteVar, StorageGetter, TitleCase } from '../../../pop-common-utility';
import { DetermineEntityName } from '../../entity/pop-entity-utility';
import { PopExtendService } from '../../../services/pop-extend.service';
import * as i0 from "@angular/core";
export class PopTabMenuService extends PopExtendService {
    constructor() {
        super();
        this.id = PopUid();
        this.name = 'PopTabMenuService';
        this.asset = {
            core: undefined,
            config: undefined,
            dom: undefined,
            id: undefined,
            map: {},
            outlet: undefined,
            resetOutlet: undefined,
            route: undefined,
            path: undefined,
            clearCache: false
        };
        this.srv = {
            dialog: ServiceInjector.get(MatDialog),
            entity: ServiceInjector.get(PopEntityService),
            log: ServiceInjector.get(PopLogService),
            router: ServiceInjector.get(Router),
        };
        this.ui = {
            entityParams: undefined
        };
        this.change = new Subject(); // event emitter
        this._setDomExtensions();
        this._initSession();
    }
    _initSession() {
        this.dom.session = Object.assign({ scroll: {}, path: '', fields: {} }, this.dom.session);
    }
    /**
     * Add Buttons to the Tab Menu
     * @param buttons Array<TabButtonInterface>)
     * @returns void
     */
    addButtons(buttons) {
        if (buttons && buttons.length) {
            this.asset.config.buttons.push(...buttons);
            this.asset.map.buttons = ArrayMapSetter(this.asset.config.buttons, 'id');
            this._emitChange('buttons');
        }
    }
    /**
     * Add Tabs to the Tab Menu
     * @param tabs Array<TabInterface>
     * @returns void
     */
    addTabs(tabs) {
        if (tabs && tabs.length) {
            this.asset.config.tabs.push(...tabs);
            this.asset.map.tabs = ArrayMapSetter(this.asset.config.tabs, 'id');
        }
        this._emitChange('tabs');
    }
    /**
     * This fx will cause this srv to remove the cache when it is destroyed
     */
    clearCache() {
        this.asset.clearCache = true;
    }
    /**
     * Remove all Buttons from the Tab Menu
     * @param buttons Array<TabButtonInterface>)
     * @returns void
     */
    clearButtons(buttons) {
        this.asset.config.buttons = [];
        this.asset.map.buttons = ArrayMapSetter(this.asset.config.buttons, 'id');
        this._emitChange('buttons');
    }
    /**
     * Get latest path
     */
    getPathSession() {
        return GetSessionSiteVar(`Entity.${TitleCase(this.asset.core.params.internal_name)}.Menu.path`);
    }
    /**
     * Clear the tab system session
     * Auto called on go back button click
     * @param name
     * @returns void
     */
    clearSession() {
        if (this.asset.core && this.asset.core.params && this.asset.core.params.internal_name) {
            SetSessionSiteVar(`Entity.${TitleCase(this.asset.core.params.internal_name)}.Menu`, null);
        }
    }
    /**
     * Get Misc Data for each tab
     * @param path
     * @returns object
     */
    getTab(id) {
        if (!this.asset.id)
            id = this.asset.path;
        if (this.asset.map.tabs && id in this.asset.map.tabs) {
            return Object.assign({}, this.asset.config.tabs[this.asset.map.tabs[id]]);
        }
        return null;
    }
    /**
     * Get the global metadata stored for the Tab Menu
     * If key is passed, return that specific data else entire object
     * @param key string
     * @returns boolean
     */
    getCore() {
        return this.asset.core;
    }
    /**
     * Set the TabMenuConfig of the Tab Menu
     * The Tab Menu Component auto calls this on creation
     * @param config TabMenuConfig
     * @returns void
     */
    registerConfig(core, config, dom) {
        if (config) {
            this.asset.core = IsObject(core, true) ? core : null;
            this.ui.entityParams = IsObject(this.asset.core, ['params']) ? this.asset.core.params : null;
            this.asset.config = new TabMenuConfig(config);
            // get the users access
            this.asset.map.tabs = ArrayMapSetter(this.asset.config.tabs, 'path');
            this.asset.map.buttons = ArrayMapSetter(this.asset.config.buttons, 'id');
            if (this.asset.core && this.asset.core.params)
                this.dom.session.scroll = GetSessionSiteVar(`Entity.${TitleCase(this.asset.core.params.internal_name)}.Menu.scroll`);
            if (!this.dom.session.scroll)
                this.dom.session.scroll = {};
            // Subscribe to the CRUD events
            this.asset.path = window.location.pathname.split('/').pop();
            // bind to router to detect entity change detection .. effective for cloning, navigation changes
            this.dom.setSubscriber('route-change', this.srv.router.events.subscribe((e) => this._navigationHandler(e)));
            this.dom.state.loaded = true;
            this._resetMenu();
            this._emitChange('config');
            if (this.srv.log.enabled('config', this.name))
                console.log(this.srv.log.message(`${this.name}:registerConfig`), this.srv.log.color('config'), this.asset.config);
            return this.asset.config;
        }
    }
    /**
     * Register an outlet to enable scroll session
     * @param outlet ElementRef
     * @returns void
     */
    registerOutlet(outlet) {
        this.asset.outlet = outlet;
        this._emitChange('outlet');
    }
    /**
     * Register a route to enable entity change detection and enforce the id on the route
     * @param outlet ElementRef
     * @returns void
     */
    registerRoute(route) {
        if (!this.asset.route) {
            this.asset.route = route;
            this._emitChange('route');
            if (+this.asset.route.snapshot.params.id) {
                if (!this.asset.core.entity || +this.asset.core.entity.id !== +this.asset.route.snapshot.params.id) {
                    this.resetTab(true);
                    // this.refreshEntity( this.asset.route.snapshot.params.id, this.asset.dom, null, `${this.name}:registerRoute:conflict` ).then( () => this.resetTab()  );
                }
            }
        }
    }
    /**
     * Register a outletReset function that you want called when on crud operations
     * @param outlet ElementRef
     * @returns void
     */
    registerOutletReset(resetOutlet) {
        this.asset.resetOutlet = resetOutlet;
        this._emitChange('outlet-reset');
    }
    /**
     * This fx will refresh the entity that exist on the this.asset.core
     * @param entityId
     * @param dom
     * @param queryParams
     * @param caller
     */
    refreshEntity(entityId = null, dom, queryParams, caller) {
        return new Promise((resolve) => {
            if (this.asset.core) {
                this.showAsLoading(false);
                this.srv.log.warn(this.name, `refreshEntity:${caller}`);
                if (!this.asset.config) {
                    this.showAsLoading(false);
                    return resolve(false);
                }
                this.dom.setTimeout('refresh', () => {
                    if (!entityId && this.asset.core.entity && +this.asset.core.entity.id)
                        entityId = +this.asset.core.entity.id;
                    if (+entityId) {
                        this.asset.core.params.entityId = entityId;
                        this.srv.entity.refreshCoreEntity(this.asset.core, dom, queryParams).then((entity) => {
                            this._resetMenu();
                            this.asset.core.params.refresh = false;
                            if (typeof this.asset.resetOutlet === 'function') {
                                setTimeout(() => {
                                    this.asset.resetOutlet();
                                    this.showAsLoading(false);
                                    return resolve(true);
                                }, 0);
                            }
                            else {
                                return resolve(true);
                            }
                        });
                    }
                    else {
                        this.showAsLoading(false);
                        return resolve(false);
                    }
                }, 0);
            }
            else {
                this.showAsLoading(false);
                return resolve(false);
            }
        });
    }
    /**
     * This fx will reset the current tab
     * @param clearCache
     */
    resetTab(clearCache = false) {
        if (clearCache) {
            SetPopCacheRedirectUrl(this.srv.router);
        }
        else {
            this._resetMenu();
            // this.asset.core.params.refresh = false;
            if (typeof this.asset.resetOutlet === 'function')
                this.asset.resetOutlet();
        }
    }
    /**
     * This fx will reset a specific position of the current tab
     * @param position
     */
    reloadTabPosition(position = null) {
        if (typeof this.asset.resetOutlet === 'function')
            this.asset.resetOutlet(position);
    }
    /**
     * This will set a flag the the tab will need to refresh
     */
    setTabRefresh() {
        if (this.asset.core && this.asset.core.params) {
            this.asset.core.params.refresh = true;
        }
    }
    /**
     * This fx will set the scroll position of the current tab if was was previously visited
     */
    setTabScrollPosition() {
        if (this.asset.path && this.dom.session.scroll[this.asset.path]) {
            this._setTabScrollPosition(this.dom.session.scroll[this.asset.path]);
        }
    }
    /**
     * This fx will trigger a loading indicator in the current tab
     * @param value
     */
    showAsLoading(value) {
        if (IsObject(this.asset.config, true)) {
            this.asset.config.loading = value ? true : false;
        }
    }
    /**
     * Store the current tab into session memory
     * @param name
     * @returns void
     */
    setPathSession(tab) {
        if (this.asset.core && this.asset.core.params)
            SetSessionSiteVar(`Entity.${TitleCase(this.asset.core.params.internal_name)}.Menu.path`, tab.path);
    }
    /**
     * Add Tabs to the Tab Menu
     * @param path string
     * @returns void
     */
    removeTab(path) {
        if (path in this.asset.map.tabs) {
            this.asset.config.tabs.splice(this.asset.map.tabs[path], 1);
            this.asset.map.tabs = ArrayMapSetter(this.asset.config.tabs, 'id');
        }
        this._emitChange('tabs');
    }
    /**
     * Toggle whether a Button is hidden
     * If value is set to true(show), false(hide), else toggle
     * @param buttons Array<TabButtonInterface>)
     * @returns boolean
     */
    toggleButton(id, value) {
        if (id in this.asset.map.buttons) {
            if (typeof value !== 'undefined') {
                this.asset.config.buttons[this.asset.map.buttons[id]].hidden = value;
            }
            else {
                this.asset.config.buttons[this.asset.map.buttons[id]].hidden = !this.asset.config.buttons[this.asset.map.buttons[id]].hidden;
            }
            this._emitChange('buttons');
            return true;
        }
        return false;
    }
    /**
     * This fx will update main header of the current Tab Menu
     * @param name
     */
    updateName(name) {
        if (IsString(name, true) && this.asset && this.asset.config) {
            this.asset.config.name = name;
        }
    }
    ngOnDestroy() {
        if (this.asset.clearCache) {
            if (IsObject(this.asset.core)) {
                this.asset.core.repo.clearAllCache();
            }
        }
        super.ngOnDestroy();
    }
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    /**
     * If you do not extend of an extension service these have to be set manually
     */
    _setDomExtensions() {
        this.dom = Object.assign(Object.assign({}, this.dom), {
            setSubscriber: (subscriptionKey, subscription = null) => {
                if (subscriptionKey && this.dom.subscriber && subscriptionKey in this.dom.subscriber && this.dom.subscriber[subscriptionKey] && typeof this.dom.subscriber[subscriptionKey].unsubscribe === 'function') {
                    this.dom.subscriber[subscriptionKey].unsubscribe();
                }
                if (subscription) {
                    this.dom.subscriber[subscriptionKey] = subscription;
                }
            },
            setTimeout: (timeoutKey, callback = null, delay = 250) => {
                if (timeoutKey && this.dom.delay && timeoutKey in this.dom.delay && this.dom.delay[timeoutKey]) {
                    clearTimeout(this.dom.delay[timeoutKey]);
                }
                if (typeof callback === 'function') {
                    this.dom.delay[timeoutKey] = setTimeout(callback, delay);
                }
            },
        });
    }
    /**
     * Return to last active tab
     * @returns void
     */
    _isPathSession() {
        this.dom.session.path = this.getPathSession();
        if (this.dom.session.path && this.dom.session.path !== this.asset.path && this.dom.session.path in this.asset.map.tabs) {
            return false;
        }
        return true;
    }
    /**
     * Store current tab scroll position
     * @returns void
     */
    _storeTabScrollPosition() {
        if (this.asset.core && this.asset.core.params && this.asset.path) {
            this.dom.session[this.asset.path] = this._getTabScrollPosition();
            SetSessionSiteVar(`Entity.${TitleCase(this.asset.core.params.internal_name)}.Menu.scroll`, this.dom.session.scroll);
        }
    }
    /**
     * Set current tab scroll position
     * @returns void
     */
    _setTabScrollPosition(scrollTop) {
        if (this.asset.outlet && this.asset.outlet.nativeElement)
            this.asset.outlet.nativeElement.scrollTop = scrollTop;
    }
    /**
     * Get the current tab scroll position
     * @returns number
     */
    _getTabScrollPosition() {
        if (this.asset.outlet && this.asset.outlet.nativeElement)
            return this.asset.outlet.nativeElement.scrollTop;
        return 0;
    }
    /**
     * Verify the id on the route matches the id of the configuration entity
     * @returns number
     */
    _checkId() {
        if (this.asset.route && +this.asset.route.snapshot.params.id) {
            if (!this.asset.config && this.srv.log.enabled('error', this.name))
                console.log(this.srv.log.message(`${this.name}:_checkId:error - Could not find config`), this.srv.log.color('error'));
            if (this.srv.log.enabled('info', this.name))
                console.log(this.srv.log.message(`${this.name}:_checkId route id(${this.asset.route.snapshot.params.id} matches config(${this.asset.core.entity.id}):refresh is ${+this.asset.route.snapshot.params.id !== +this.asset.core.entity.id}`), this.srv.log.color('info'));
            if (!this.asset.core.entity || +this.asset.route.snapshot.params.id !== +this.asset.core.entity.id) {
                this.resetTab(true);
            }
        }
    }
    /**
     * This fx will track the current scroll position of the current tab when navigating away, and session it
     * @param event
     * @private
     */
    _navigationHandler(event) {
        // On a NavigationStart event record the current scroll position of the current tab
        // On a NavigationEnd check to see if a scroll position for the current tab has been stored and apply it
        if (event instanceof NavigationStart && this.asset.path)
            this._storeTabScrollPosition();
        if (event instanceof NavigationEnd) {
            this.asset.path = String(event.url).split('/').pop();
            if (this.asset.route && this._isPathSession() || !this.asset.route) {
                this._checkId();
                if (this.dom.session.scroll[this.asset.path]) {
                    setTimeout(() => {
                        this._setTabScrollPosition(this.dom.session.scroll[this.asset.path]);
                    }, 0);
                }
            }
            else {
                if (this.asset.route)
                    return this.srv.router.navigate([this.dom.session.path], { relativeTo: this.asset.route });
            }
        }
    }
    /**
     * This fx will reseet the current menu options
     * @private
     */
    _resetMenu() {
        if (this.asset.core && this.asset.config) {
            if (this.asset.core.entity && this.asset.core.entity.id)
                this.asset.config.name = DetermineEntityName(this.asset.core.entity);
            if (Array.isArray(this.asset.config.buttons) && this.asset.config.buttons.length && this.asset.core.entity) {
                const archiveKey = StorageGetter(this.asset.core, ['repo', 'model', 'menu', 'archiveKey'], 'archived');
                const btnMap = ArrayMapSetter(this.asset.config.buttons, 'id');
                if ('archive' in btnMap)
                    this.asset.config.buttons[btnMap['archive']].hidden = this.asset.core.entity[archiveKey] ? true : false;
                if ('activate' in btnMap)
                    this.asset.config.buttons[btnMap['activate']].hidden = this.asset.core.entity[archiveKey] ? false : true;
                if ('close' in btnMap)
                    this.asset.config.buttons[btnMap['close']].hidden = this.asset.config.portal ? false : true;
            }
        }
    }
    /**
     * Change detection Emitter
     * @param type strings
     * @returns void
     */
    _emitChange(name, data = '') {
        PopLog.info(this.name, name, data);
        this.change.next({ source: this.name, type: 'tab-menu', name: name, data: data });
    }
}
PopTabMenuService.ɵprov = i0.ɵɵdefineInjectable({ factory: function PopTabMenuService_Factory() { return new PopTabMenuService(); }, token: PopTabMenuService, providedIn: "root" });
PopTabMenuService.decorators = [
    { type: Injectable, args: [{
                providedIn: 'root'
            },] }
];
PopTabMenuService.ctorParameters = () => [];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLXRhYi1tZW51LnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9iYXNlL3BvcC10YWItbWVudS9wb3AtdGFiLW1lbnUuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQWlDLGFBQWEsR0FBcUIsTUFBTSxrQkFBa0IsQ0FBQztBQUNuRyxPQUFPLEVBQWMsVUFBVSxFQUFhLE1BQU0sZUFBZSxDQUFDO0FBQ2xFLE9BQU8sRUFBRSxPQUFPLEVBQWdCLE1BQU0sTUFBTSxDQUFDO0FBQzdDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLDBDQUEwQyxDQUFDO0FBQzVFLE9BQU8sRUFBa0IsYUFBYSxFQUFFLGVBQWUsRUFBRSxNQUFNLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUN6RixPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDckQsT0FBTyxFQUErQyxNQUFNLEVBQXdCLGVBQWUsRUFBRSxzQkFBc0IsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQy9KLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQztBQUNsRSxPQUFPLEVBQUUsY0FBYyxFQUFFLGlCQUFpQixFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLGlCQUFpQixFQUFFLGFBQWEsRUFBRSxTQUFTLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUN6SixPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUV0RSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQzs7QUFNeEUsTUFBTSxPQUFPLGlCQUFrQixTQUFRLGdCQUFnQjtJQW1DckQ7UUFDRSxLQUFLLEVBQUUsQ0FBQztRQW5DQSxPQUFFLEdBQUcsTUFBTSxFQUFFLENBQUM7UUFDakIsU0FBSSxH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TUFBTSxDQUFFLFVBQVUsQ0FBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztnQkFDeEksSUFBSSxVQUFVLElBQUksTUFBTTtvQkFBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUUsTUFBTSxDQUFFLFVBQVUsQ0FBRSxDQUFFLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBRSxVQUFVLENBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQzFJLElBQUksT0FBTyxJQUFJLE1BQU07b0JBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFFLE1BQU0sQ0FBRSxPQUFPLENBQUUsQ0FBRSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO2FBRXpIO1NBQ0Y7SUFDSCxDQUFDO0lBR0Q7Ozs7T0FJRztJQUNILFdBQVcsQ0FBRSxJQUFZLEVBQUUsT0FBWSxFQUFFO1FBQ3ZDLE1BQU0sQ0FBQyxJQUFJLENBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFFLENBQUM7UUFDckMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFFLENBQUM7SUFDdEYsQ0FBQzs7OztZQTVoQkYsVUFBVSxTQUFFO2dCQUNYLFVBQVUsRUFBRSxNQUFNO2FBQ25CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVGFiQnV0dG9uSW50ZXJmYWNlLCBUYWJDb25maWcsIFRhYk1lbnVDb25maWcsIFRhYk1lbnVJbnRlcmZhY2UsIH0gZnJvbSAnLi90YWItbWVudS5tb2RlbCc7XG5pbXBvcnQgeyBFbGVtZW50UmVmLCBJbmplY3RhYmxlLCBPbkRlc3Ryb3kgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFN1YmplY3QsIFN1YnNjcmlwdGlvbiB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgUG9wRW50aXR5U2VydmljZSB9IGZyb20gJy4uLy4uL2VudGl0eS9zZXJ2aWNlcy9wb3AtZW50aXR5LnNlcnZpY2UnO1xuaW1wb3J0IHsgQWN0aXZhdGVkUm91dGUsIE5hdmlnYXRpb25FbmQsIE5hdmlnYXRpb25TdGFydCwgUm91dGVyIH0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcbmltcG9ydCB7IE1hdERpYWxvZyB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2RpYWxvZyc7XG5pbXBvcnQgeyBDb3JlQ29uZmlnLCBEaWN0aW9uYXJ5LCBFbnRpdHksIE91dGxldFJlc2V0LCBQb3BMb2csIFF1ZXJ5UGFyYW1zSW50ZXJmYWNlLCBTZXJ2aWNlSW5qZWN0b3IsIFNldFBvcENhY2hlUmVkaXJlY3RVcmwgfSBmcm9tICcuLi8uLi8uLi9wb3AtY29tbW9uLm1vZGVsJztcbmltcG9ydCB7IFBvcExvZ1NlcnZpY2UgfSBmcm9tICcuLi8uLi8uLi9zZXJ2aWNlcy9wb3AtbG9nLnNlcnZpY2UnO1xuaW1wb3J0IHsgQXJyYXlNYXBTZXR0ZXIsIEdldFNlc3Npb25TaXRlVmFyLCBJc09iamVjdCwgSXNTdHJpbmcsIFBvcFVpZCwgU2V0U2Vzc2lvblNpdGVWYXIsIFN0b3JhZ2VHZXR0ZXIsIFRpdGxlQ2FzZSB9IGZyb20gJy4uLy4uLy4uL3BvcC1jb21tb24tdXRpbGl0eSc7XG5pbXBvcnQgeyBEZXRlcm1pbmVFbnRpdHlOYW1lIH0gZnJvbSAnLi4vLi4vZW50aXR5L3BvcC1lbnRpdHktdXRpbGl0eSc7XG5pbXBvcnQgeyBQb3BEb21TZXJ2aWNlIH0gZnJvbSAnLi4vLi4vLi4vc2VydmljZXMvcG9wLWRvbS5zZXJ2aWNlJztcbmltcG9ydCB7IFBvcEV4dGVuZFNlcnZpY2UgfSBmcm9tICcuLi8uLi8uLi9zZXJ2aWNlcy9wb3AtZXh0ZW5kLnNlcnZpY2UnO1xuXG5cbkBJbmplY3RhYmxlKCB7XG4gIHByb3ZpZGVkSW46ICdyb290J1xufSApXG5leHBvcnQgY2xhc3MgUG9wVGFiTWVudVNlcnZpY2UgZXh0ZW5kcyBQb3BFeHRlbmRTZXJ2aWNlIGltcGxlbWVudHMgT25EZXN0cm95IHtcbiAgcHJvdGVjdGVkIGlkID0gUG9wVWlkKCk7XG4gIHB1YmxpYyBuYW1lID0gJ1BvcFRhYk1lbnVTZXJ2aWNlJztcblxuICBwcm90ZWN0ZWQgYXNzZXQgPSB7XG4gICAgY29yZTogPENvcmVDb25maWc+dW5kZWZpbmVkLFxuICAgIGNvbmZpZzogPFRhYk1lbnVDb25maWc+dW5kZWZpbmVkLFxuICAgIGRvbTogPFBvcERvbVNlcnZpY2U+dW5kZWZpbmVkLFxuICAgIGlkOiA8c3RyaW5nIHwgbnVtYmVyPnVuZGVmaW5lZCxcbiAgICBtYXA6IDxEaWN0aW9uYXJ5PGFueT4+e30sXG4gICAgb3V0bGV0OiA8RWxlbWVudFJlZj51bmRlZmluZWQsXG4gICAgcmVzZXRPdXRsZXQ6IDxPdXRsZXRSZXNldD51bmRlZmluZWQsXG4gICAgcm91dGU6IDxBY3RpdmF0ZWRSb3V0ZT51bmRlZmluZWQsXG4gICAgcGF0aDogPHN0cmluZz51bmRlZmluZWQsXG4gICAgY2xlYXJDYWNoZTogZmFsc2VcbiAgfTtcblxuICBwcm90ZWN0ZWQgc3J2OiB7XG4gICAgZGlhbG9nOiBNYXREaWFsb2csXG4gICAgZW50aXR5OiBQb3BFbnRpdHlTZXJ2aWNlLFxuICAgIGxvZzogUG9wTG9nU2VydmljZSxcbiAgICByb3V0ZXI6IFJvdXRlcixcbiAgfSA9IHtcbiAgICBkaWFsb2c6IFNlcnZpY2VJbmplY3Rvci5nZXQoIE1hdERpYWxvZyApLFxuICAgIGVudGl0eTogU2VydmljZUluamVjdG9yLmdldCggUG9wRW50aXR5U2VydmljZSApLFxuICAgIGxvZzogU2VydmljZUluamVjdG9yLmdldCggUG9wTG9nU2VydmljZSApLFxuICAgIHJvdXRlcjogU2VydmljZUluamVjdG9yLmdldCggUm91dGVyICksXG4gIH07XG5cbiAgcHVibGljIHVpID0ge1xuICAgIGVudGl0eVBhcmFtczogPERpY3Rpb25hcnk8YW55Pj51bmRlZmluZWRcbiAgfTtcblxuICBjaGFuZ2UgPSBuZXcgU3ViamVjdCgpOyAvLyBldmVudCBlbWl0dGVyXG5cbiAgY29uc3RydWN0b3IoKXtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX3NldERvbUV4dGVuc2lvbnMoKTtcbiAgICB0aGlzLl9pbml0U2Vzc2lvbigpO1xuICB9XG5cblxuICBwcml2YXRlIF9pbml0U2Vzc2lvbigpe1xuICAgIHRoaXMuZG9tLnNlc3Npb24gPSB7XG4gICAgICBzY3JvbGw6IHt9LFxuICAgICAgcGF0aDogJycsXG4gICAgICBmaWVsZHM6IHt9LFxuICAgICAgLi4udGhpcy5kb20uc2Vzc2lvblxuICAgIH07XG4gIH1cblxuXG4gIC8qKlxuICAgKiBBZGQgQnV0dG9ucyB0byB0aGUgVGFiIE1lbnVcbiAgICogQHBhcmFtIGJ1dHRvbnMgQXJyYXk8VGFiQnV0dG9uSW50ZXJmYWNlPilcbiAgICogQHJldHVybnMgdm9pZFxuICAgKi9cbiAgYWRkQnV0dG9ucyggYnV0dG9uczogQXJyYXk8VGFiQnV0dG9uSW50ZXJmYWNlPiApOiB2b2lke1xuICAgIGlmKCBidXR0b25zICYmIGJ1dHRvbnMubGVuZ3RoICl7XG4gICAgICB0aGlzLmFzc2V0LmNvbmZpZy5idXR0b25zLnB1c2goIC4uLmJ1dHRvbnMgKTtcbiAgICAgIHRoaXMuYXNzZXQubWFwLmJ1dHRvbnMgPSBBcnJheU1hcFNldHRlciggdGhpcy5hc3NldC5jb25maWcuYnV0dG9ucywgJ2lkJyApO1xuICAgICAgdGhpcy5fZW1pdENoYW5nZSggJ2J1dHRvbnMnICk7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogQWRkIFRhYnMgdG8gdGhlIFRhYiBNZW51XG4gICAqIEBwYXJhbSB0YWJzIEFycmF5PFRhYkludGVyZmFjZT5cbiAgICogQHJldHVybnMgdm9pZFxuICAgKi9cbiAgYWRkVGFicyggdGFiczogQXJyYXk8VGFiQ29uZmlnPiApOlxuICAgIHZvaWR7XG4gICAgaWYoIHRhYnMgJiYgdGFicy5sZW5ndGhcbiAgICApe1xuICAgICAgdGhpcy5hc3NldC5jb25maWcudGFicy5wdXNoKCAuLi50YWJzICk7XG4gICAgICB0aGlzLmFzc2V0Lm1hcC50YWJzID0gQXJyYXlNYXBTZXR0ZXIoIHRoaXMuYXNzZXQuY29uZmlnLnRhYnMsICdpZCcgKTtcbiAgICB9XG4gICAgdGhpcy5fZW1pdENoYW5nZSggJ3RhYnMnICk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIGZ4IHdpbGwgY2F1c2UgdGhpcyBzcnYgdG8gcmVtb3ZlIHRoZSBjYWNoZSB3aGVuIGl0IGlzIGRlc3Ryb3llZFxuICAgKi9cbiAgY2xlYXJDYWNoZSgpOiB2b2lke1xuICAgIHRoaXMuYXNzZXQuY2xlYXJDYWNoZSA9IHRydWU7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYWxsIEJ1dHRvbnMgZnJvbSB0aGUgVGFiIE1lbnVcbiAgICogQHBhcmFtIGJ1dHRvbnMgQXJyYXk8VGFiQnV0dG9uSW50ZXJmYWNlPilcbiAgICogQHJldHVybnMgdm9pZFxuICAgKi9cbiAgY2xlYXJCdXR0b25zKCBidXR0b25zOiBBcnJheTxUYWJCdXR0b25JbnRlcmZhY2U+ICk6IHZvaWR7XG4gICAgdGhpcy5hc3NldC5jb25maWcuYnV0dG9ucyA9IFtdO1xuICAgIHRoaXMuYXNzZXQubWFwLmJ1dHRvbnMgPSBBcnJheU1hcFNldHRlciggdGhpcy5hc3NldC5jb25maWcuYnV0dG9ucywgJ2lkJyApO1xuICAgIHRoaXMuX2VtaXRDaGFuZ2UoICdidXR0b25zJyApO1xuICB9XG5cblxuICAvKipcbiAgICogR2V0IGxhdGVzdCBwYXRoXG4gICAqL1xuICBnZXRQYXRoU2Vzc2lvbigpe1xuICAgIHJldHVybiBHZXRTZXNzaW9uU2l0ZVZhciggYEVudGl0eS4ke1RpdGxlQ2FzZSggdGhpcy5hc3NldC5jb3JlLnBhcmFtcy5pbnRlcm5hbF9uYW1lICl9Lk1lbnUucGF0aGAgKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIENsZWFyIHRoZSB0YWIgc3lzdGVtIHNlc3Npb25cbiAgICogQXV0byBjYWxsZWQgb24gZ28gYmFjayBidXR0b24gY2xpY2tcbiAgICogQHBhcmFtIG5hbWVcbiAgICogQHJldHVybnMgdm9pZFxuICAgKi9cbiAgY2xlYXJTZXNzaW9uKCk6IHZvaWR7XG4gICAgaWYoIHRoaXMuYXNzZXQuY29yZSAmJiB0aGlzLmFzc2V0LmNvcmUucGFyYW1zICYmIHRoaXMuYXNzZXQuY29yZS5wYXJhbXMuaW50ZXJuYWxfbmFtZSApe1xuICAgICAgU2V0U2Vzc2lvblNpdGVWYXIoIGBFbnRpdHkuJHtUaXRsZUNhc2UoIHRoaXMuYXNzZXQuY29yZS5wYXJhbXMuaW50ZXJuYWxfbmFtZSApfS5NZW51YCwgbnVsbCApO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIEdldCBNaXNjIERhdGEgZm9yIGVhY2ggdGFiXG4gICAqIEBwYXJhbSBwYXRoXG4gICAqIEByZXR1cm5zIG9iamVjdFxuICAgKi9cbiAgZ2V0VGFiKCBpZCA/OiBzdHJpbmcgfCBudW1iZXIgKTogYW55e1xuICAgIGlmKCAhdGhpcy5hc3NldC5pZCApIGlkID0gdGhpcy5hc3NldC5wYXRoO1xuICAgIGlmKCB0aGlzLmFzc2V0Lm1hcC50YWJzICYmIGlkIGluIHRoaXMuYXNzZXQubWFwLnRhYnMgKXtcbiAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKCB7fSwgdGhpcy5hc3NldC5jb25maWcudGFic1sgdGhpcy5hc3NldC5tYXAudGFic1sgaWQgXSBdICk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cblxuICAvKipcbiAgICogR2V0IHRoZSBnbG9iYWwgbWV0YWRhdGEgc3RvcmVkIGZvciB0aGUgVGFiIE1lbnVcbiAgICogSWYga2V5IGlzIHBhc3NlZCwgcmV0dXJuIHRoYXQgc3BlY2lmaWMgZGF0YSBlbHNlIGVudGlyZSBvYmplY3RcbiAgICogQHBhcmFtIGtleSBzdHJpbmdcbiAgICogQHJldHVybnMgYm9vbGVhblxuICAgKi9cbiAgZ2V0Q29yZSgpe1xuICAgIHJldHVybiB0aGlzLmFzc2V0LmNvcmU7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIFRhYk1lbnVDb25maWcgb2YgdGhlIFRhYiBNZW51XG4gICAqIFRoZSBUYWIgTWVudSBDb21wb25lbnQgYXV0byBjYWxscyB0aGlzIG9uIGNyZWF0aW9uXG4gICAqIEBwYXJhbSBjb25maWcgVGFiTWVudUNvbmZpZ1xuICAgKiBAcmV0dXJucyB2b2lkXG4gICAqL1xuICByZWdpc3RlckNvbmZpZyggY29yZTogQ29yZUNvbmZpZywgY29uZmlnOiBUYWJNZW51Q29uZmlnIHwgVGFiTWVudUludGVyZmFjZSwgZG9tPzogUG9wRG9tU2VydmljZSApOiBUYWJNZW51Q29uZmlne1xuICAgIGlmKCBjb25maWcgKXtcbiAgICAgIHRoaXMuYXNzZXQuY29yZSA9IElzT2JqZWN0KCBjb3JlLCB0cnVlICkgPyBjb3JlIDogbnVsbDtcbiAgICAgIHRoaXMudWkuZW50aXR5UGFyYW1zID0gSXNPYmplY3QoIHRoaXMuYXNzZXQuY29yZSwgWyAncGFyYW1zJyBdICkgPyB0aGlzLmFzc2V0LmNvcmUucGFyYW1zIDogbnVsbDtcblxuICAgICAgdGhpcy5hc3NldC5jb25maWcgPSBuZXcgVGFiTWVudUNvbmZpZyggPFRhYk1lbnVJbnRlcmZhY2U+Y29uZmlnICk7XG4gICAgICAvLyBnZXQgdGhlIHVzZXJzIGFjY2Vzc1xuICAgICAgdGhpcy5hc3NldC5tYXAudGFicyA9IEFycmF5TWFwU2V0dGVyKCB0aGlzLmFzc2V0LmNvbmZpZy50YWJzLCAncGF0aCcgKTtcbiAgICAgIHRoaXMuYXNzZXQubWFwLmJ1dHRvbnMgPSBBcnJheU1hcFNldHRlciggdGhpcy5hc3NldC5jb25maWcuYnV0dG9ucywgJ2lkJyApO1xuICAgICAgaWYoIHRoaXMuYXNzZXQuY29yZSAmJiB0aGlzLmFzc2V0LmNvcmUucGFyYW1zICkgdGhpcy5kb20uc2Vzc2lvbi5zY3JvbGwgPSBHZXRTZXNzaW9uU2l0ZVZhciggYEVudGl0eS4ke1RpdGxlQ2FzZSggdGhpcy5hc3NldC5jb3JlLnBhcmFtcy5pbnRlcm5hbF9uYW1lICl9Lk1lbnUuc2Nyb2xsYCApO1xuICAgICAgaWYoICF0aGlzLmRvbS5zZXNzaW9uLnNjcm9sbCApIHRoaXMuZG9tLnNlc3Npb24uc2Nyb2xsID0ge307XG5cblxuICAgICAgLy8gU3Vic2NyaWJlIHRvIHRoZSBDUlVEIGV2ZW50c1xuICAgICAgdGhpcy5hc3NldC5wYXRoID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnNwbGl0KCAnLycgKS5wb3AoKTtcbiAgICAgIC8vIGJpbmQgdG8gcm91dGVyIHRvIGRldGVjdCBlbnRpdHkgY2hhbmdlIGRldGVjdGlvbiAuLiBlZmZlY3RpdmUgZm9yIGNsb25pbmcsIG5hdmlnYXRpb24gY2hhbmdlc1xuICAgICAgdGhpcy5kb20uc2V0U3Vic2NyaWJlciggJ3JvdXRlLWNoYW5nZScsIHRoaXMuc3J2LnJvdXRlci5ldmVudHMuc3Vic2NyaWJlKCAoIGUgKSA9PiB0aGlzLl9uYXZpZ2F0aW9uSGFuZGxlciggZSApICkgKTtcbiAgICAgIHRoaXMuZG9tLnN0YXRlLmxvYWRlZCA9IHRydWU7XG5cbiAgICAgIHRoaXMuX3Jlc2V0TWVudSgpO1xuICAgICAgdGhpcy5fZW1pdENoYW5nZSggJ2NvbmZpZycgKTtcbiAgICAgIGlmKCB0aGlzLnNydi5sb2cuZW5hYmxlZCggJ2NvbmZpZycsIHRoaXMubmFtZSApICkgY29uc29sZS5sb2coIHRoaXMuc3J2LmxvZy5tZXNzYWdlKCBgJHt0aGlzLm5hbWV9OnJlZ2lzdGVyQ29uZmlnYCApLCB0aGlzLnNydi5sb2cuY29sb3IoICdjb25maWcnICksIHRoaXMuYXNzZXQuY29uZmlnICk7XG4gICAgICByZXR1cm4gdGhpcy5hc3NldC5jb25maWc7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogUmVnaXN0ZXIgYW4gb3V0bGV0IHRvIGVuYWJsZSBzY3JvbGwgc2Vzc2lvblxuICAgKiBAcGFyYW0gb3V0bGV0IEVsZW1lbnRSZWZcbiAgICogQHJldHVybnMgdm9pZFxuICAgKi9cbiAgcmVnaXN0ZXJPdXRsZXQoIG91dGxldDogRWxlbWVudFJlZiApOiB2b2lke1xuICAgIHRoaXMuYXNzZXQub3V0bGV0ID0gb3V0bGV0O1xuICAgIHRoaXMuX2VtaXRDaGFuZ2UoICdvdXRsZXQnICk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBSZWdpc3RlciBhIHJvdXRlIHRvIGVuYWJsZSBlbnRpdHkgY2hhbmdlIGRldGVjdGlvbiBhbmQgZW5mb3JjZSB0aGUgaWQgb24gdGhlIHJvdXRlXG4gICAqIEBwYXJhbSBvdXRsZXQgRWxlbWVudFJlZlxuICAgKiBAcmV0dXJucyB2b2lkXG4gICAqL1xuICByZWdpc3RlclJvdXRlKCByb3V0ZTogQWN0aXZhdGVkUm91dGUgKXtcbiAgICBpZiggIXRoaXMuYXNzZXQucm91dGUgKXtcbiAgICAgIHRoaXMuYXNzZXQucm91dGUgPSByb3V0ZTtcbiAgICAgIHRoaXMuX2VtaXRDaGFuZ2UoICdyb3V0ZScgKTtcbiAgICAgIGlmKCArdGhpcy5hc3NldC5yb3V0ZS5zbmFwc2hvdC5wYXJhbXMuaWQgKXtcbiAgICAgICAgaWYoICF0aGlzLmFzc2V0LmNvcmUuZW50aXR5IHx8ICt0aGlzLmFzc2V0LmNvcmUuZW50aXR5LmlkICE9PSArdGhpcy5hc3NldC5yb3V0ZS5zbmFwc2hvdC5wYXJhbXMuaWQgKXtcbiAgICAgICAgICB0aGlzLnJlc2V0VGFiKCB0cnVlICk7XG4gICAgICAgICAgLy8gdGhpcy5yZWZyZXNoRW50aXR5KCB0aGlzLmFzc2V0LnJvdXRlLnNuYXBzaG90LnBhcmFtcy5pZCwgdGhpcy5hc3NldC5kb20sIG51bGwsIGAke3RoaXMubmFtZX06cmVnaXN0ZXJSb3V0ZTpjb25mbGljdGAgKS50aGVuKCAoKSA9PiB0aGlzLnJlc2V0VGFiKCkgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBSZWdpc3RlciBhIG91dGxldFJlc2V0IGZ1bmN0aW9uIHRoYXQgeW91IHdhbnQgY2FsbGVkIHdoZW4gb24gY3J1ZCBvcGVyYXRpb25zXG4gICAqIEBwYXJhbSBvdXRsZXQgRWxlbWVudFJlZlxuICAgKiBAcmV0dXJucyB2b2lkXG4gICAqL1xuICByZWdpc3Rlck91dGxldFJlc2V0KCByZXNldE91dGxldDogT3V0bGV0UmVzZXQgKXtcbiAgICB0aGlzLmFzc2V0LnJlc2V0T3V0bGV0ID0gcmVzZXRPdXRsZXQ7XG4gICAgdGhpcy5fZW1pdENoYW5nZSggJ291dGxldC1yZXNldCcgKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgZnggd2lsbCByZWZyZXNoIHRoZSBlbnRpdHkgdGhhdCBleGlzdCBvbiB0aGUgdGhpcy5hc3NldC5jb3JlXG4gICAqIEBwYXJhbSBlbnRpdHlJZFxuICAgKiBAcGFyYW0gZG9tXG4gICAqIEBwYXJhbSBxdWVyeVBhcmFtc1xuICAgKiBAcGFyYW0gY2FsbGVyXG4gICAqL1xuICByZWZyZXNoRW50aXR5KCBlbnRpdHlJZDogbnVtYmVyID0gbnVsbCwgZG9tOiBQb3BEb21TZXJ2aWNlLCBxdWVyeVBhcmFtczogUXVlcnlQYXJhbXNJbnRlcmZhY2UsIGNhbGxlcjogc3RyaW5nICk6IFByb21pc2U8Ym9vbGVhbj57XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKCAoIHJlc29sdmUgKSA9PiB7XG4gICAgICBpZiggdGhpcy5hc3NldC5jb3JlICl7XG4gICAgICAgIHRoaXMuc2hvd0FzTG9hZGluZyggZmFsc2UgKTtcbiAgICAgICAgdGhpcy5zcnYubG9nLndhcm4oIHRoaXMubmFtZSwgYHJlZnJlc2hFbnRpdHk6JHtjYWxsZXJ9YCApO1xuICAgICAgICBpZiggIXRoaXMuYXNzZXQuY29uZmlnICl7XG4gICAgICAgICAgdGhpcy5zaG93QXNMb2FkaW5nKCBmYWxzZSApO1xuICAgICAgICAgIHJldHVybiByZXNvbHZlKCBmYWxzZSApO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZG9tLnNldFRpbWVvdXQoICdyZWZyZXNoJywgKCkgPT4ge1xuICAgICAgICAgIGlmKCAhZW50aXR5SWQgJiYgdGhpcy5hc3NldC5jb3JlLmVudGl0eSAmJiArdGhpcy5hc3NldC5jb3JlLmVudGl0eS5pZCApIGVudGl0eUlkID0gK3RoaXMuYXNzZXQuY29yZS5lbnRpdHkuaWQ7XG4gICAgICAgICAgaWYoICtlbnRpdHlJZCApe1xuICAgICAgICAgICAgdGhpcy5hc3NldC5jb3JlLnBhcmFtcy5lbnRpdHlJZCA9IGVudGl0eUlkO1xuICAgICAgICAgICAgdGhpcy5zcnYuZW50aXR5LnJlZnJlc2hDb3JlRW50aXR5KCB0aGlzLmFzc2V0LmNvcmUsIGRvbSwgcXVlcnlQYXJhbXMgKS50aGVuKCAoIGVudGl0eTogRW50aXR5ICkgPT4ge1xuICAgICAgICAgICAgICB0aGlzLl9yZXNldE1lbnUoKTtcbiAgICAgICAgICAgICAgdGhpcy5hc3NldC5jb3JlLnBhcmFtcy5yZWZyZXNoID0gZmFsc2U7XG4gICAgICAgICAgICAgIGlmKCB0eXBlb2YgdGhpcy5hc3NldC5yZXNldE91dGxldCA9PT0gJ2Z1bmN0aW9uJyApe1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoICgpID0+IHtcbiAgICAgICAgICAgICAgICAgIHRoaXMuYXNzZXQucmVzZXRPdXRsZXQoKTtcbiAgICAgICAgICAgICAgICAgIHRoaXMuc2hvd0FzTG9hZGluZyggZmFsc2UgKTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiByZXNvbHZlKCB0cnVlICk7XG4gICAgICAgICAgICAgICAgfSwgMCApO1xuICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzb2x2ZSggdHJ1ZSApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9ICk7XG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICB0aGlzLnNob3dBc0xvYWRpbmcoIGZhbHNlICk7XG4gICAgICAgICAgICByZXR1cm4gcmVzb2x2ZSggZmFsc2UgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIDAgKTtcbiAgICAgIH1lbHNle1xuICAgICAgICB0aGlzLnNob3dBc0xvYWRpbmcoIGZhbHNlICk7XG4gICAgICAgIHJldHVybiByZXNvbHZlKCBmYWxzZSApO1xuICAgICAgfVxuICAgIH0gKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgZnggd2lsbCByZXNldCB0aGUgY3VycmVudCB0YWJcbiAgICogQHBhcmFtIGNsZWFyQ2FjaGVcbiAgICovXG4gIHJlc2V0VGFiKCBjbGVhckNhY2hlID0gZmFsc2UgKXtcbiAgICBpZiggY2xlYXJDYWNoZSApe1xuICAgICAgU2V0UG9wQ2FjaGVSZWRpcmVjdFVybCggdGhpcy5zcnYucm91dGVyICk7XG4gICAgfWVsc2V7XG4gICAgICB0aGlzLl9yZXNldE1lbnUoKTtcbiAgICAgIC8vIHRoaXMuYXNzZXQuY29yZS5wYXJhbXMucmVmcmVzaCA9IGZhbHNlO1xuICAgICAgaWYoIHR5cGVvZiB0aGlzLmFzc2V0LnJlc2V0T3V0bGV0ID09PSAnZnVuY3Rpb24nICkgdGhpcy5hc3NldC5yZXNldE91dGxldCgpO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgZnggd2lsbCByZXNldCBhIHNwZWNpZmljIHBvc2l0aW9uIG9mIHRoZSBjdXJyZW50IHRhYlxuICAgKiBAcGFyYW0gcG9zaXRpb25cbiAgICovXG4gIHJlbG9hZFRhYlBvc2l0aW9uKCBwb3NpdGlvbjogbnVtYmVyID0gbnVsbCApe1xuICAgIGlmKCB0eXBlb2YgdGhpcy5hc3NldC5yZXNldE91dGxldCA9PT0gJ2Z1bmN0aW9uJyApIHRoaXMuYXNzZXQucmVzZXRPdXRsZXQoIHBvc2l0aW9uICk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIHdpbGwgc2V0IGEgZmxhZyB0aGUgdGhlIHRhYiB3aWxsIG5lZWQgdG8gcmVmcmVzaFxuICAgKi9cbiAgc2V0VGFiUmVmcmVzaCgpe1xuICAgIGlmKCB0aGlzLmFzc2V0LmNvcmUgJiYgdGhpcy5hc3NldC5jb3JlLnBhcmFtcyApe1xuICAgICAgdGhpcy5hc3NldC5jb3JlLnBhcmFtcy5yZWZyZXNoID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIGZ4IHdpbGwgc2V0IHRoZSBzY3JvbGwgcG9zaXRpb24gb2YgdGhlIGN1cnJlbnQgdGFiIGlmIHdhcyB3YXMgcHJldmlvdXNseSB2aXNpdGVkXG4gICAqL1xuICBzZXRUYWJTY3JvbGxQb3NpdGlvbigpe1xuICAgIGlmKCB0aGlzLmFzc2V0LnBhdGggJiYgdGhpcy5kb20uc2Vzc2lvbi5zY3JvbGxbIHRoaXMuYXNzZXQucGF0aCBdICl7XG4gICAgICB0aGlzLl9zZXRUYWJTY3JvbGxQb3NpdGlvbiggdGhpcy5kb20uc2Vzc2lvbi5zY3JvbGxbIHRoaXMuYXNzZXQucGF0aCBdICk7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogVGhpcyBmeCB3aWxsIHRyaWdnZXIgYSBsb2FkaW5nIGluZGljYXRvciBpbiB0aGUgY3VycmVudCB0YWJcbiAgICogQHBhcmFtIHZhbHVlXG4gICAqL1xuICBzaG93QXNMb2FkaW5nKCB2YWx1ZTogYm9vbGVhbiApe1xuICAgIGlmKCBJc09iamVjdCggdGhpcy5hc3NldC5jb25maWcsIHRydWUgKSApe1xuICAgICAgdGhpcy5hc3NldC5jb25maWcubG9hZGluZyA9IHZhbHVlID8gdHJ1ZSA6IGZhbHNlO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIFN0b3JlIHRoZSBjdXJyZW50IHRhYiBpbnRvIHNlc3Npb24gbWVtb3J5XG4gICAqIEBwYXJhbSBuYW1lXG4gICAqIEByZXR1cm5zIHZvaWRcbiAgICovXG4gIHNldFBhdGhTZXNzaW9uKCB0YWI6IFRhYkNvbmZpZyApOiB2b2lke1xuICAgIGlmKCB0aGlzLmFzc2V0LmNvcmUgJiYgdGhpcy5hc3NldC5jb3JlLnBhcmFtcyApIFNldFNlc3Npb25TaXRlVmFyKCBgRW50aXR5LiR7VGl0bGVDYXNlKCB0aGlzLmFzc2V0LmNvcmUucGFyYW1zLmludGVybmFsX25hbWUgKX0uTWVudS5wYXRoYCwgdGFiLnBhdGggKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEFkZCBUYWJzIHRvIHRoZSBUYWIgTWVudVxuICAgKiBAcGFyYW0gcGF0aCBzdHJpbmdcbiAgICogQHJldHVybnMgdm9pZFxuICAgKi9cbiAgcmVtb3ZlVGFiKCBwYXRoOiBzdHJpbmcgKTpcbiAgICB2b2lke1xuICAgIGlmKCBwYXRoIGluIHRoaXMuYXNzZXQubWFwLnRhYnNcbiAgICApe1xuICAgICAgdGhpcy5hc3NldC5jb25maWcudGFicy5zcGxpY2UoIHRoaXMuYXNzZXQubWFwLnRhYnNbIHBhdGggXSwgMSApO1xuICAgICAgdGhpcy5hc3NldC5tYXAudGFicyA9IEFycmF5TWFwU2V0dGVyKCB0aGlzLmFzc2V0LmNvbmZpZy50YWJzLCAnaWQnICk7XG4gICAgfVxuICAgIHRoaXMuX2VtaXRDaGFuZ2UoICd0YWJzJyApO1xuICB9XG5cblxuICAvKipcbiAgICogVG9nZ2xlIHdoZXRoZXIgYSBCdXR0b24gaXMgaGlkZGVuXG4gICAqIElmIHZhbHVlIGlzIHNldCB0byB0cnVlKHNob3cpLCBmYWxzZShoaWRlKSwgZWxzZSB0b2dnbGVcbiAgICogQHBhcmFtIGJ1dHRvbnMgQXJyYXk8VGFiQnV0dG9uSW50ZXJmYWNlPilcbiAgICogQHJldHVybnMgYm9vbGVhblxuICAgKi9cbiAgdG9nZ2xlQnV0dG9uKCBpZDogc3RyaW5nLCB2YWx1ZSA/OiBib29sZWFuICk6IGJvb2xlYW57XG4gICAgaWYoIGlkIGluIHRoaXMuYXNzZXQubWFwLmJ1dHRvbnMgKXtcbiAgICAgIGlmKCB0eXBlb2YgdmFsdWUgIT09ICd1bmRlZmluZWQnICl7XG4gICAgICAgIHRoaXMuYXNzZXQuY29uZmlnLmJ1dHRvbnNbIHRoaXMuYXNzZXQubWFwLmJ1dHRvbnNbIGlkIF0gXS5oaWRkZW4gPSB2YWx1ZTtcbiAgICAgIH1lbHNle1xuICAgICAgICB0aGlzLmFzc2V0LmNvbmZpZy5idXR0b25zWyB0aGlzLmFzc2V0Lm1hcC5idXR0b25zWyBpZCBdIF0uaGlkZGVuID0gIXRoaXMuYXNzZXQuY29uZmlnLmJ1dHRvbnNbIHRoaXMuYXNzZXQubWFwLmJ1dHRvbnNbIGlkIF0gXS5oaWRkZW47XG4gICAgICB9XG4gICAgICB0aGlzLl9lbWl0Q2hhbmdlKCAnYnV0dG9ucycgKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIGZ4IHdpbGwgdXBkYXRlIG1haW4gaGVhZGVyIG9mIHRoZSBjdXJyZW50IFRhYiBNZW51XG4gICAqIEBwYXJhbSBuYW1lXG4gICAqL1xuICB1cGRhdGVOYW1lKCBuYW1lOiBzdHJpbmcgKTogdm9pZHtcbiAgICBpZiggSXNTdHJpbmcoIG5hbWUsIHRydWUgKSAmJiB0aGlzLmFzc2V0ICYmIHRoaXMuYXNzZXQuY29uZmlnICl7XG4gICAgICB0aGlzLmFzc2V0LmNvbmZpZy5uYW1lID0gbmFtZTtcbiAgICB9XG4gIH1cblxuXG4gIG5nT25EZXN0cm95KCl7XG4gICAgaWYoIHRoaXMuYXNzZXQuY2xlYXJDYWNoZSApe1xuICAgICAgaWYoIElzT2JqZWN0KCB0aGlzLmFzc2V0LmNvcmUgKSApe1xuICAgICAgICB0aGlzLmFzc2V0LmNvcmUucmVwby5jbGVhckFsbENhY2hlKCk7XG4gICAgICB9XG4gICAgfVxuICAgIHN1cGVyLm5nT25EZXN0cm95KCk7XG4gIH1cblxuXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVW5kZXIgVGhlIEhvb2QgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBQcml2YXRlIE1ldGhvZCApICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4gIC8qKlxuICAgKiBJZiB5b3UgZG8gbm90IGV4dGVuZCBvZiBhbiBleHRlbnNpb24gc2VydmljZSB0aGVzZSBoYXZlIHRvIGJlIHNldCBtYW51YWxseVxuICAgKi9cbiAgcHJpdmF0ZSBfc2V0RG9tRXh0ZW5zaW9ucygpe1xuICAgIHRoaXMuZG9tID0ge1xuICAgICAgLi4udGhpcy5kb20sIC4uLntcbiAgICAgICAgc2V0U3Vic2NyaWJlcjogKCBzdWJzY3JpcHRpb25LZXk6IHN0cmluZywgc3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb24gPSBudWxsICkgPT4ge1xuICAgICAgICAgIGlmKCBzdWJzY3JpcHRpb25LZXkgJiYgdGhpcy5kb20uc3Vic2NyaWJlciAmJiBzdWJzY3JpcHRpb25LZXkgaW4gdGhpcy5kb20uc3Vic2NyaWJlciAmJiB0aGlzLmRvbS5zdWJzY3JpYmVyWyBzdWJzY3JpcHRpb25LZXkgXSAmJiB0eXBlb2YgdGhpcy5kb20uc3Vic2NyaWJlclsgc3Vic2NyaXB0aW9uS2V5IF0udW5zdWJzY3JpYmUgPT09ICdmdW5jdGlvbicgKXtcbiAgICAgICAgICAgIHRoaXMuZG9tLnN1YnNjcmliZXJbIHN1YnNjcmlwdGlvbktleSBdLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmKCBzdWJzY3JpcHRpb24gKXtcbiAgICAgICAgICAgIHRoaXMuZG9tLnN1YnNjcmliZXJbIHN1YnNjcmlwdGlvbktleSBdID0gc3Vic2NyaXB0aW9uO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzZXRUaW1lb3V0OiAoIHRpbWVvdXRLZXk6IHN0cmluZywgY2FsbGJhY2sgPSBudWxsLCBkZWxheSA9IDI1MCApID0+IHtcbiAgICAgICAgICBpZiggdGltZW91dEtleSAmJiB0aGlzLmRvbS5kZWxheSAmJiB0aW1lb3V0S2V5IGluIHRoaXMuZG9tLmRlbGF5ICYmIHRoaXMuZG9tLmRlbGF5WyB0aW1lb3V0S2V5IF0gKXtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCggdGhpcy5kb20uZGVsYXlbIHRpbWVvdXRLZXkgXSApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiggdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nICl7XG4gICAgICAgICAgICB0aGlzLmRvbS5kZWxheVsgdGltZW91dEtleSBdID0gc2V0VGltZW91dCggY2FsbGJhY2ssIGRlbGF5ICk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgfVxuICAgIH07XG4gIH1cblxuXG4gIC8qKlxuICAgKiBSZXR1cm4gdG8gbGFzdCBhY3RpdmUgdGFiXG4gICAqIEByZXR1cm5zIHZvaWRcbiAgICovXG4gIHByaXZhdGUgX2lzUGF0aFNlc3Npb24oKTogYm9vbGVhbntcbiAgICB0aGlzLmRvbS5zZXNzaW9uLnBhdGggPSB0aGlzLmdldFBhdGhTZXNzaW9uKCk7XG4gICAgaWYoIHRoaXMuZG9tLnNlc3Npb24ucGF0aCAmJiB0aGlzLmRvbS5zZXNzaW9uLnBhdGggIT09IHRoaXMuYXNzZXQucGF0aCAmJiB0aGlzLmRvbS5zZXNzaW9uLnBhdGggaW4gdGhpcy5hc3NldC5tYXAudGFicyApe1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFN0b3JlIGN1cnJlbnQgdGFiIHNjcm9sbCBwb3NpdGlvblxuICAgKiBAcmV0dXJucyB2b2lkXG4gICAqL1xuICBwcml2YXRlIF9zdG9yZVRhYlNjcm9sbFBvc2l0aW9uKCk6IHZvaWR7XG4gICAgaWYoIHRoaXMuYXNzZXQuY29yZSAmJiB0aGlzLmFzc2V0LmNvcmUucGFyYW1zICYmIHRoaXMuYXNzZXQucGF0aCApe1xuICAgICAgdGhpcy5kb20uc2Vzc2lvblsgdGhpcy5hc3NldC5wYXRoIF0gPSB0aGlzLl9nZXRUYWJTY3JvbGxQb3NpdGlvbigpO1xuICAgICAgU2V0U2Vzc2lvblNpdGVWYXIoIGBFbnRpdHkuJHtUaXRsZUNhc2UoIHRoaXMuYXNzZXQuY29yZS5wYXJhbXMuaW50ZXJuYWxfbmFtZSApfS5NZW51LnNjcm9sbGAsIHRoaXMuZG9tLnNlc3Npb24uc2Nyb2xsICk7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogU2V0IGN1cnJlbnQgdGFiIHNjcm9sbCBwb3NpdGlvblxuICAgKiBAcmV0dXJucyB2b2lkXG4gICAqL1xuICBwcml2YXRlIF9zZXRUYWJTY3JvbGxQb3NpdGlvbiggc2Nyb2xsVG9wOiBudW1iZXIgKTogdm9pZHtcbiAgICBpZiggdGhpcy5hc3NldC5vdXRsZXQgJiYgdGhpcy5hc3NldC5vdXRsZXQubmF0aXZlRWxlbWVudCApIHRoaXMuYXNzZXQub3V0bGV0Lm5hdGl2ZUVsZW1lbnQuc2Nyb2xsVG9wID0gc2Nyb2xsVG9wO1xuICB9XG5cblxuICAvKipcbiAgICogR2V0IHRoZSBjdXJyZW50IHRhYiBzY3JvbGwgcG9zaXRpb25cbiAgICogQHJldHVybnMgbnVtYmVyXG4gICAqL1xuICBwcml2YXRlIF9nZXRUYWJTY3JvbGxQb3NpdGlvbigpOiBudW1iZXJ7XG4gICAgaWYoIHRoaXMuYXNzZXQub3V0bGV0ICYmIHRoaXMuYXNzZXQub3V0bGV0Lm5hdGl2ZUVsZW1lbnQgKSByZXR1cm4gdGhpcy5hc3NldC5vdXRsZXQubmF0aXZlRWxlbWVudC5zY3JvbGxUb3A7XG4gICAgcmV0dXJuIDA7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBWZXJpZnkgdGhlIGlkIG9uIHRoZSByb3V0ZSBtYXRjaGVzIHRoZSBpZCBvZiB0aGUgY29uZmlndXJhdGlvbiBlbnRpdHlcbiAgICogQHJldHVybnMgbnVtYmVyXG4gICAqL1xuICBwcml2YXRlIF9jaGVja0lkKCl7XG4gICAgaWYoIHRoaXMuYXNzZXQucm91dGUgJiYgK3RoaXMuYXNzZXQucm91dGUuc25hcHNob3QucGFyYW1zLmlkICl7XG4gICAgICBpZiggIXRoaXMuYXNzZXQuY29uZmlnICYmIHRoaXMuc3J2LmxvZy5lbmFibGVkKCAnZXJyb3InLCB0aGlzLm5hbWUgKSApIGNvbnNvbGUubG9nKCB0aGlzLnNydi5sb2cubWVzc2FnZSggYCR7dGhpcy5uYW1lfTpfY2hlY2tJZDplcnJvciAtIENvdWxkIG5vdCBmaW5kIGNvbmZpZ2AgKSwgdGhpcy5zcnYubG9nLmNvbG9yKCAnZXJyb3InICkgKTtcbiAgICAgIGlmKCB0aGlzLnNydi5sb2cuZW5hYmxlZCggJ2luZm8nLCB0aGlzLm5hbWUgKSApIGNvbnNvbGUubG9nKCB0aGlzLnNydi5sb2cubWVzc2FnZSggYCR7dGhpcy5uYW1lfTpfY2hlY2tJZCByb3V0ZSBpZCgke3RoaXMuYXNzZXQucm91dGUuc25hcHNob3QucGFyYW1zLmlkIH0gbWF0Y2hlcyBjb25maWcoJHt0aGlzLmFzc2V0LmNvcmUuZW50aXR5LmlkfSk6cmVmcmVzaCBpcyAkeyt0aGlzLmFzc2V0LnJvdXRlLnNuYXBzaG90LnBhcmFtcy5pZCAhPT0gK3RoaXMuYXNzZXQuY29yZS5lbnRpdHkuaWR9YCApLCB0aGlzLnNydi5sb2cuY29sb3IoICdpbmZvJyApICk7XG4gICAgICBpZiggIXRoaXMuYXNzZXQuY29yZS5lbnRpdHkgfHwgK3RoaXMuYXNzZXQucm91dGUuc25hcHNob3QucGFyYW1zLmlkICE9PSArdGhpcy5hc3NldC5jb3JlLmVudGl0eS5pZCApe1xuICAgICAgICB0aGlzLnJlc2V0VGFiKCB0cnVlICk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogVGhpcyBmeCB3aWxsIHRyYWNrIHRoZSBjdXJyZW50IHNjcm9sbCBwb3NpdGlvbiBvZiB0aGUgY3VycmVudCB0YWIgd2hlbiBuYXZpZ2F0aW5nIGF3YXksIGFuZCBzZXNzaW9uIGl0XG4gICAqIEBwYXJhbSBldmVudFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcHJpdmF0ZSBfbmF2aWdhdGlvbkhhbmRsZXIoIGV2ZW50ICk6IHZvaWQgfCBQcm9taXNlPGJvb2xlYW4+e1xuICAgIC8vIE9uIGEgTmF2aWdhdGlvblN0YXJ0IGV2ZW50IHJlY29yZCB0aGUgY3VycmVudCBzY3JvbGwgcG9zaXRpb24gb2YgdGhlIGN1cnJlbnQgdGFiXG4gICAgLy8gT24gYSBOYXZpZ2F0aW9uRW5kIGNoZWNrIHRvIHNlZSBpZiBhIHNjcm9sbCBwb3NpdGlvbiBmb3IgdGhlIGN1cnJlbnQgdGFiIGhhcyBiZWVuIHN0b3JlZCBhbmQgYXBwbHkgaXRcbiAgICBpZiggZXZlbnQgaW5zdGFuY2VvZiBOYXZpZ2F0aW9uU3RhcnQgJiYgdGhpcy5hc3NldC5wYXRoICkgdGhpcy5fc3RvcmVUYWJTY3JvbGxQb3NpdGlvbigpO1xuICAgIGlmKCBldmVudCBpbnN0YW5jZW9mIE5hdmlnYXRpb25FbmQgKXtcblxuICAgICAgdGhpcy5hc3NldC5wYXRoID0gU3RyaW5nKCBldmVudC51cmwgKS5zcGxpdCggJy8nICkucG9wKCk7XG4gICAgICBpZiggdGhpcy5hc3NldC5yb3V0ZSAmJiB0aGlzLl9pc1BhdGhTZXNzaW9uKCkgfHwgIXRoaXMuYXNzZXQucm91dGUgKXtcbiAgICAgICAgdGhpcy5fY2hlY2tJZCgpO1xuICAgICAgICBpZiggdGhpcy5kb20uc2Vzc2lvbi5zY3JvbGxbIHRoaXMuYXNzZXQucGF0aCBdICl7XG4gICAgICAgICAgc2V0VGltZW91dCggKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5fc2V0VGFiU2Nyb2xsUG9zaXRpb24oIHRoaXMuZG9tLnNlc3Npb24uc2Nyb2xsWyB0aGlzLmFzc2V0LnBhdGggXSApO1xuICAgICAgICAgIH0sIDAgKTtcbiAgICAgICAgfVxuICAgICAgfWVsc2V7XG4gICAgICAgIGlmKCB0aGlzLmFzc2V0LnJvdXRlICkgcmV0dXJuIHRoaXMuc3J2LnJvdXRlci5uYXZpZ2F0ZSggWyB0aGlzLmRvbS5zZXNzaW9uLnBhdGggXSwgeyByZWxhdGl2ZVRvOiB0aGlzLmFzc2V0LnJvdXRlIH0gKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIGZ4IHdpbGwgcmVzZWV0IHRoZSBjdXJyZW50IG1lbnUgb3B0aW9uc1xuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcHJpdmF0ZSBfcmVzZXRNZW51KCl7XG4gICAgaWYoIHRoaXMuYXNzZXQuY29yZSAmJiB0aGlzLmFzc2V0LmNvbmZpZyApe1xuICAgICAgaWYoIHRoaXMuYXNzZXQuY29yZS5lbnRpdHkgJiYgdGhpcy5hc3NldC5jb3JlLmVudGl0eS5pZCApIHRoaXMuYXNzZXQuY29uZmlnLm5hbWUgPSBEZXRlcm1pbmVFbnRpdHlOYW1lKCB0aGlzLmFzc2V0LmNvcmUuZW50aXR5ICk7XG4gICAgICBpZiggQXJyYXkuaXNBcnJheSggdGhpcy5hc3NldC5jb25maWcuYnV0dG9ucyApICYmIHRoaXMuYXNzZXQuY29uZmlnLmJ1dHRvbnMubGVuZ3RoICYmIHRoaXMuYXNzZXQuY29yZS5lbnRpdHkgKXtcbiAgICAgICAgY29uc3QgYXJjaGl2ZUtleSA9IDxzdHJpbmc+U3RvcmFnZUdldHRlciggdGhpcy5hc3NldC5jb3JlLCBbICdyZXBvJywgJ21vZGVsJywgJ21lbnUnLCAnYXJjaGl2ZUtleScgXSwgJ2FyY2hpdmVkJyApO1xuICAgICAgICBjb25zdCBidG5NYXAgPSBBcnJheU1hcFNldHRlciggdGhpcy5hc3NldC5jb25maWcuYnV0dG9ucywgJ2lkJyApO1xuICAgICAgICBpZiggJ2FyY2hpdmUnIGluIGJ0bk1hcCApIHRoaXMuYXNzZXQuY29uZmlnLmJ1dHRvbnNbIGJ0bk1hcFsgJ2FyY2hpdmUnIF0gXS5oaWRkZW4gPSB0aGlzLmFzc2V0LmNvcmUuZW50aXR5WyBhcmNoaXZlS2V5IF0gPyB0cnVlIDogZmFsc2U7XG4gICAgICAgIGlmKCAnYWN0aXZhdGUnIGluIGJ0bk1hcCApIHRoaXMuYXNzZXQuY29uZmlnLmJ1dHRvbnNbIGJ0bk1hcFsgJ2FjdGl2YXRlJyBdIF0uaGlkZGVuID0gdGhpcy5hc3NldC5jb3JlLmVudGl0eVsgYXJjaGl2ZUtleSBdID8gZmFsc2UgOiB0cnVlO1xuICAgICAgICBpZiggJ2Nsb3NlJyBpbiBidG5NYXAgKSB0aGlzLmFzc2V0LmNvbmZpZy5idXR0b25zWyBidG5NYXBbICdjbG9zZScgXSBdLmhpZGRlbiA9IHRoaXMuYXNzZXQuY29uZmlnLnBvcnRhbCA/IGZhbHNlIDogdHJ1ZTtcblxuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIENoYW5nZSBkZXRlY3Rpb24gRW1pdHRlclxuICAgKiBAcGFyYW0gdHlwZSBzdHJpbmdzXG4gICAqIEByZXR1cm5zIHZvaWRcbiAgICovXG4gIF9lbWl0Q2hhbmdlKCBuYW1lOiBzdHJpbmcsIGRhdGE6IGFueSA9ICcnICl7XG4gICAgUG9wTG9nLmluZm8oIHRoaXMubmFtZSwgbmFtZSwgZGF0YSApO1xuICAgIHRoaXMuY2hhbmdlLm5leHQoIHsgc291cmNlOiB0aGlzLm5hbWUsIHR5cGU6ICd0YWItbWVudScsIG5hbWU6IG5hbWUsIGRhdGE6IGRhdGEgfSApO1xuICB9XG59XG4iXX0=