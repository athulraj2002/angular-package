import { TabButtonInterface, TabConfig, TabMenuConfig, TabMenuInterface, } from './tab-menu.model';
import { ElementRef, Injectable, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { PopEntityService } from '../../entity/services/pop-entity.service';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CoreConfig, Dictionary, Entity, OutletReset, PopLog, QueryParamsInterface, ServiceInjector, SetPopCacheRedirectUrl } from '../../../pop-common.model';
import { PopLogService } from '../../../services/pop-log.service';
import { ArrayMapSetter, GetSessionSiteVar, IsObject, IsString, PopUid, SetSessionSiteVar, StorageGetter, TitleCase } from '../../../pop-common-utility';
import { DetermineEntityName } from '../../entity/pop-entity-utility';
import { PopDomService } from '../../../services/pop-dom.service';
import { PopExtendService } from '../../../services/pop-extend.service';


@Injectable( {
  providedIn: 'root'
} )
export class PopTabMenuService extends PopExtendService implements OnDestroy {
  protected id = PopUid();
  public name = 'PopTabMenuService';

  protected asset = {
    core: <CoreConfig>undefined,
    config: <TabMenuConfig>undefined,
    dom: <PopDomService>undefined,
    id: <string | number>undefined,
    map: <Dictionary<any>>{},
    outlet: <ElementRef>undefined,
    resetOutlet: <OutletReset>undefined,
    route: <ActivatedRoute>undefined,
    path: <string>undefined,
    clearCache: false
  };

  protected srv: {
    dialog: MatDialog,
    entity: PopEntityService,
    log: PopLogService,
    router: Router,
  } = {
    dialog: ServiceInjector.get( MatDialog ),
    entity: ServiceInjector.get( PopEntityService ),
    log: ServiceInjector.get( PopLogService ),
    router: ServiceInjector.get( Router ),
  };

  public ui = {
    entityParams: <Dictionary<any>>undefined
  };

  change = new Subject(); // event emitter

  constructor(){
    super();
    this._setDomExtensions();
    this._initSession();
  }


  private _initSession(){
    this.dom.session = {
      scroll: {},
      path: '',
      fields: {},
      ...this.dom.session
    };
  }


  /**
   * Add Buttons to the Tab Menu
   * @param buttons Array<TabButtonInterface>)
   * @returns void
   */
  addButtons( buttons: Array<TabButtonInterface> ): void{
    if( buttons && buttons.length ){
      this.asset.config.buttons.push( ...buttons );
      this.asset.map.buttons = ArrayMapSetter( this.asset.config.buttons, 'id' );
      this._emitChange( 'buttons' );
    }
  }


  /**
   * Add Tabs to the Tab Menu
   * @param tabs Array<TabInterface>
   * @returns void
   */
  addTabs( tabs: Array<TabConfig> ):
    void{
    if( tabs && tabs.length
    ){
      this.asset.config.tabs.push( ...tabs );
      this.asset.map.tabs = ArrayMapSetter( this.asset.config.tabs, 'id' );
    }
    this._emitChange( 'tabs' );
  }


  /**
   * This fx will cause this srv to remove the cache when it is destroyed
   */
  clearCache(): void{
    this.asset.clearCache = true;
  }


  /**
   * Remove all Buttons from the Tab Menu
   * @param buttons Array<TabButtonInterface>)
   * @returns void
   */
  clearButtons( buttons: Array<TabButtonInterface> ): void{
    this.asset.config.buttons = [];
    this.asset.map.buttons = ArrayMapSetter( this.asset.config.buttons, 'id' );
    this._emitChange( 'buttons' );
  }


  /**
   * Get latest path
   */
  getPathSession(){
    return GetSessionSiteVar( `Entity.${TitleCase( this.asset.core.params.internal_name )}.Menu.path` );
  }


  /**
   * Clear the tab system session
   * Auto called on go back button click
   * @param name
   * @returns void
   */
  clearSession(): void{
    if( this.asset.core && this.asset.core.params && this.asset.core.params.internal_name ){
      SetSessionSiteVar( `Entity.${TitleCase( this.asset.core.params.internal_name )}.Menu`, null );
    }
  }


  /**
   * Get Misc Data for each tab
   * @param path
   * @returns object
   */
  getTab( id ?: string | number ): any{
    if( !this.asset.id ) id = this.asset.path;
    if( this.asset.map.tabs && id in this.asset.map.tabs ){
      return Object.assign( {}, this.asset.config.tabs[ this.asset.map.tabs[ id ] ] );
    }
    return null;
  }


  /**
   * Get the global metadata stored for the Tab Menu
   * If key is passed, return that specific data else entire object
   * @param key string
   * @returns boolean
   */
  getCore(){
    return this.asset.core;
  }


  /**
   * Set the TabMenuConfig of the Tab Menu
   * The Tab Menu Component auto calls this on creation
   * @param config TabMenuConfig
   * @returns void
   */
  registerConfig( core: CoreConfig, config: TabMenuConfig | TabMenuInterface, dom?: PopDomService ): TabMenuConfig{
    if( config ){
      this.asset.core = IsObject( core, true ) ? core : null;
      this.ui.entityParams = IsObject( this.asset.core, [ 'params' ] ) ? this.asset.core.params : null;

      this.asset.config = new TabMenuConfig( <TabMenuInterface>config );
      // get the users access
      this.asset.map.tabs = ArrayMapSetter( this.asset.config.tabs, 'path' );
      this.asset.map.buttons = ArrayMapSetter( this.asset.config.buttons, 'id' );
      if( this.asset.core && this.asset.core.params ) this.dom.session.scroll = GetSessionSiteVar( `Entity.${TitleCase( this.asset.core.params.internal_name )}.Menu.scroll` );
      if( !this.dom.session.scroll ) this.dom.session.scroll = {};


      // Subscribe to the CRUD events
      this.asset.path = window.location.pathname.split( '/' ).pop();
      // bind to router to detect entity change detection .. effective for cloning, navigation changes
      this.dom.setSubscriber( 'route-change', this.srv.router.events.subscribe( ( e ) => this._navigationHandler( e ) ) );
      this.dom.state.loaded = true;

      this._resetMenu();
      this._emitChange( 'config' );
      if( this.srv.log.enabled( 'config', this.name ) ) console.log( this.srv.log.message( `${this.name}:registerConfig` ), this.srv.log.color( 'config' ), this.asset.config );
      return this.asset.config;
    }
  }


  /**
   * Register an outlet to enable scroll session
   * @param outlet ElementRef
   * @returns void
   */
  registerOutlet( outlet: ElementRef ): void{
    this.asset.outlet = outlet;
    this._emitChange( 'outlet' );
  }


  /**
   * Register a route to enable entity change detection and enforce the id on the route
   * @param outlet ElementRef
   * @returns void
   */
  registerRoute( route: ActivatedRoute ){
    if( !this.asset.route ){
      this.asset.route = route;
      this._emitChange( 'route' );
      if( +this.asset.route.snapshot.params.id ){
        if( !this.asset.core.entity || +this.asset.core.entity.id !== +this.asset.route.snapshot.params.id ){
          this.resetTab( true );
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
  registerOutletReset( resetOutlet: OutletReset ){
    this.asset.resetOutlet = resetOutlet;
    this._emitChange( 'outlet-reset' );
  }


  /**
   * This fx will refresh the entity that exist on the this.asset.core
   * @param entityId
   * @param dom
   * @param queryParams
   * @param caller
   */
  refreshEntity( entityId: number = null, dom: PopDomService, queryParams: QueryParamsInterface, caller: string ): Promise<boolean>{
    return new Promise( ( resolve ) => {
      if( this.asset.core ){
        this.showAsLoading( false );
        this.srv.log.warn( this.name, `refreshEntity:${caller}` );
        if( !this.asset.config ){
          this.showAsLoading( false );
          return resolve( false );
        }
        this.dom.setTimeout( 'refresh', () => {
          if( !entityId && this.asset.core.entity && +this.asset.core.entity.id ) entityId = +this.asset.core.entity.id;
          if( +entityId ){
            this.asset.core.params.entityId = entityId;
            this.srv.entity.refreshCoreEntity( this.asset.core, dom, queryParams ).then( ( entity: Entity ) => {
              this._resetMenu();
              this.asset.core.params.refresh = false;
              if( typeof this.asset.resetOutlet === 'function' ){
                setTimeout( () => {
                  this.asset.resetOutlet();
                  this.showAsLoading( false );
                  return resolve( true );
                }, 0 );
              }else{
                return resolve( true );
              }
            } );
          }else{
            this.showAsLoading( false );
            return resolve( false );
          }
        }, 0 );
      }else{
        this.showAsLoading( false );
        return resolve( false );
      }
    } );
  }


  /**
   * This fx will reset the current tab
   * @param clearCache
   */
  resetTab( clearCache = false ){
    if( clearCache ){
      SetPopCacheRedirectUrl( this.srv.router );
    }else{
      this._resetMenu();
      // this.asset.core.params.refresh = false;
      if( typeof this.asset.resetOutlet === 'function' ) this.asset.resetOutlet();
    }
  }


  /**
   * This fx will reset a specific position of the current tab
   * @param position
   */
  reloadTabPosition( position: number = null ){
    if( typeof this.asset.resetOutlet === 'function' ) this.asset.resetOutlet( position );
  }


  /**
   * This will set a flag the the tab will need to refresh
   */
  setTabRefresh(){
    if( this.asset.core && this.asset.core.params ){
      this.asset.core.params.refresh = true;
    }
  }


  /**
   * This fx will set the scroll position of the current tab if was was previously visited
   */
  setTabScrollPosition(){
    if( this.asset.path && this.dom.session.scroll[ this.asset.path ] ){
      this._setTabScrollPosition( this.dom.session.scroll[ this.asset.path ] );
    }
  }


  /**
   * This fx will trigger a loading indicator in the current tab
   * @param value
   */
  showAsLoading( value: boolean ){
    if( IsObject( this.asset.config, true ) ){
      this.asset.config.loading = value ? true : false;
    }
  }


  /**
   * Store the current tab into session memory
   * @param name
   * @returns void
   */
  setPathSession( tab: TabConfig ): void{
    if( this.asset.core && this.asset.core.params ) SetSessionSiteVar( `Entity.${TitleCase( this.asset.core.params.internal_name )}.Menu.path`, tab.path );
  }


  /**
   * Add Tabs to the Tab Menu
   * @param path string
   * @returns void
   */
  removeTab( path: string ):
    void{
    if( path in this.asset.map.tabs
    ){
      this.asset.config.tabs.splice( this.asset.map.tabs[ path ], 1 );
      this.asset.map.tabs = ArrayMapSetter( this.asset.config.tabs, 'id' );
    }
    this._emitChange( 'tabs' );
  }


  /**
   * Toggle whether a Button is hidden
   * If value is set to true(show), false(hide), else toggle
   * @param buttons Array<TabButtonInterface>)
   * @returns boolean
   */
  toggleButton( id: string, value ?: boolean ): boolean{
    if( id in this.asset.map.buttons ){
      if( typeof value !== 'undefined' ){
        this.asset.config.buttons[ this.asset.map.buttons[ id ] ].hidden = value;
      }else{
        this.asset.config.buttons[ this.asset.map.buttons[ id ] ].hidden = !this.asset.config.buttons[ this.asset.map.buttons[ id ] ].hidden;
      }
      this._emitChange( 'buttons' );
      return true;
    }
    return false;
  }


  /**
   * This fx will update main header of the current Tab Menu
   * @param name
   */
  updateName( name: string ): void{
    if( IsString( name, true ) && this.asset && this.asset.config ){
      this.asset.config.name = name;
    }
  }


  ngOnDestroy(){
    if( this.asset.clearCache ){
      if( IsObject( this.asset.core ) ){
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
  private _setDomExtensions(){
    this.dom = {
      ...this.dom, ...{
        setSubscriber: ( subscriptionKey: string, subscription: Subscription = null ) => {
          if( subscriptionKey && this.dom.subscriber && subscriptionKey in this.dom.subscriber && this.dom.subscriber[ subscriptionKey ] && typeof this.dom.subscriber[ subscriptionKey ].unsubscribe === 'function' ){
            this.dom.subscriber[ subscriptionKey ].unsubscribe();
          }
          if( subscription ){
            this.dom.subscriber[ subscriptionKey ] = subscription;
          }
        },

        setTimeout: ( timeoutKey: string, callback = null, delay = 250 ) => {
          if( timeoutKey && this.dom.delay && timeoutKey in this.dom.delay && this.dom.delay[ timeoutKey ] ){
            clearTimeout( this.dom.delay[ timeoutKey ] );
          }
          if( typeof callback === 'function' ){
            this.dom.delay[ timeoutKey ] = setTimeout( callback, delay );
          }
        },
      }
    };
  }


  /**
   * Return to last active tab
   * @returns void
   */
  private _isPathSession(): boolean{
    this.dom.session.path = this.getPathSession();
    if( this.dom.session.path && this.dom.session.path !== this.asset.path && this.dom.session.path in this.asset.map.tabs ){
      return false;
    }
    return true;
  }


  /**
   * Store current tab scroll position
   * @returns void
   */
  private _storeTabScrollPosition(): void{
    if( this.asset.core && this.asset.core.params && this.asset.path ){
      this.dom.session[ this.asset.path ] = this._getTabScrollPosition();
      SetSessionSiteVar( `Entity.${TitleCase( this.asset.core.params.internal_name )}.Menu.scroll`, this.dom.session.scroll );
    }
  }


  /**
   * Set current tab scroll position
   * @returns void
   */
  private _setTabScrollPosition( scrollTop: number ): void{
    if( this.asset.outlet && this.asset.outlet.nativeElement ) this.asset.outlet.nativeElement.scrollTop = scrollTop;
  }


  /**
   * Get the current tab scroll position
   * @returns number
   */
  private _getTabScrollPosition(): number{
    if( this.asset.outlet && this.asset.outlet.nativeElement ) return this.asset.outlet.nativeElement.scrollTop;
    return 0;
  }


  /**
   * Verify the id on the route matches the id of the configuration entity
   * @returns number
   */
  private _checkId(){
    if( this.asset.route && +this.asset.route.snapshot.params.id ){
      if( !this.asset.config && this.srv.log.enabled( 'error', this.name ) ) console.log( this.srv.log.message( `${this.name}:_checkId:error - Could not find config` ), this.srv.log.color( 'error' ) );
      if( this.srv.log.enabled( 'info', this.name ) ) console.log( this.srv.log.message( `${this.name}:_checkId route id(${this.asset.route.snapshot.params.id } matches config(${this.asset.core.entity.id}):refresh is ${+this.asset.route.snapshot.params.id !== +this.asset.core.entity.id}` ), this.srv.log.color( 'info' ) );
      if( !this.asset.core.entity || +this.asset.route.snapshot.params.id !== +this.asset.core.entity.id ){
        this.resetTab( true );
      }
    }
  }


  /**
   * This fx will track the current scroll position of the current tab when navigating away, and session it
   * @param event
   * @private
   */
  private _navigationHandler( event ): void | Promise<boolean>{
    // On a NavigationStart event record the current scroll position of the current tab
    // On a NavigationEnd check to see if a scroll position for the current tab has been stored and apply it
    if( event instanceof NavigationStart && this.asset.path ) this._storeTabScrollPosition();
    if( event instanceof NavigationEnd ){

      this.asset.path = String( event.url ).split( '/' ).pop();
      if( this.asset.route && this._isPathSession() || !this.asset.route ){
        this._checkId();
        if( this.dom.session.scroll[ this.asset.path ] ){
          setTimeout( () => {
            this._setTabScrollPosition( this.dom.session.scroll[ this.asset.path ] );
          }, 0 );
        }
      }else{
        if( this.asset.route ) return this.srv.router.navigate( [ this.dom.session.path ], { relativeTo: this.asset.route } );
      }
    }
  }


  /**
   * This fx will reseet the current menu options
   * @private
   */
  private _resetMenu(){
    if( this.asset.core && this.asset.config ){
      if( this.asset.core.entity && this.asset.core.entity.id ) this.asset.config.name = DetermineEntityName( this.asset.core.entity );
      if( Array.isArray( this.asset.config.buttons ) && this.asset.config.buttons.length && this.asset.core.entity ){
        const archiveKey = <string>StorageGetter( this.asset.core, [ 'repo', 'model', 'menu', 'archiveKey' ], 'archived' );
        const btnMap = ArrayMapSetter( this.asset.config.buttons, 'id' );
        if( 'archive' in btnMap ) this.asset.config.buttons[ btnMap[ 'archive' ] ].hidden = this.asset.core.entity[ archiveKey ] ? true : false;
        if( 'activate' in btnMap ) this.asset.config.buttons[ btnMap[ 'activate' ] ].hidden = this.asset.core.entity[ archiveKey ] ? false : true;
        if( 'close' in btnMap ) this.asset.config.buttons[ btnMap[ 'close' ] ].hidden = this.asset.config.portal ? false : true;

      }
    }
  }


  /**
   * Change detection Emitter
   * @param type strings
   * @returns void
   */
  _emitChange( name: string, data: any = '' ){
    PopLog.info( this.name, name, data );
    this.change.next( { source: this.name, type: 'tab-menu', name: name, data: data } );
  }
}
