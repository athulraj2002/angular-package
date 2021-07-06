import { ChangeDetectorRef, Component, ElementRef, HostListener, Inject, Input, OnDestroy, OnInit, Optional, ViewChild, ViewContainerRef } from '@angular/core';
import { TabMenuConfig, TabMenuPortalInterface } from '../../base/pop-tab-menu/tab-menu.model';
import { PopTabMenuService } from '../../base/pop-tab-menu/pop-tab-menu.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Route } from '@angular/router';
import { AppGlobalInterface, CoreConfig, EntityExtendInterface, PopBaseEventInterface, PopEntity, PopTemplate, ServiceInjector } from '../../../pop-common.model';
import { PopEntityEventService } from '../services/pop-entity-event.service';
import { PopDomService } from '../../../services/pop-dom.service';
import { PopExtendDynamicComponent } from '../../../pop-extend-dynamic.component';
import { PopTabMenuComponent } from '../../base/pop-tab-menu/pop-tab-menu.component';
import { PopEntityPortalMenuComponent } from './pop-entity-portal-menu/pop-entity-portal-menu.component';
import { PopEntityActionService } from '../services/pop-entity-action.service';
import { GetRouteAlias, IsObject, IsObjectThrowError, IsString, TitleCase } from '../../../pop-common-utility';
import { PopCacFilterBarService } from '../../app/pop-cac-filter/pop-cac-filter.service';
import { GetSingularName, GetTabMenuConfig, IsAliasable, IsEntity, IsValidFieldPatchEvent } from '../pop-entity-utility';


@Component( {
  selector: 'lib-pop-entity-tab-menu',
  templateUrl: './pop-entity-tab-menu.component.html',
  styleUrls: [ './pop-entity-tab-menu.component.scss' ],
  providers: [ PopTabMenuService, PopDomService ],
} )
export class PopEntityTabMenuComponent extends PopExtendDynamicComponent implements OnInit, OnDestroy {
  @Input() config: TabMenuConfig;
  @Input() extension: EntityExtendInterface;
  @Input() portal: TabMenuPortalInterface;
  @ViewChild( 'container', { read: ViewContainerRef, static: true } ) private container;


  public name = 'PopEntityTabMenuComponent';

  protected srv = {
    action: <PopEntityActionService>ServiceInjector.get( PopEntityActionService ),
    dialog: <MatDialog>ServiceInjector.get( MatDialog ),
    events: <PopEntityEventService>ServiceInjector.get( PopEntityEventService ),
    tab: <PopTabMenuService>undefined
  };


  constructor(
    public el: ElementRef,
    public cdr: ChangeDetectorRef,
    public route: ActivatedRoute,
    protected _domRepo: PopDomService,
    protected _tabRepo: PopTabMenuService,
    @Inject( 'APP_GLOBAL' ) public APP_GLOBAL: AppGlobalInterface,
    @Optional() public dialogRef: MatDialogRef<PopEntityTabMenuComponent>
  ){
    super();

    this.dom.configure = (): Promise<boolean> => {
      return new Promise( async( resolve ) => {
        await this.APP_GLOBAL.isVerified();
        if( !IsObject( this.extension, true ) ) this.extension = {};
        if( !this.extension.goToUrl ) this.extension.goToUrl = null;
        if( this.route.snapshot.data && Object.keys( this.route.snapshot.data ).length ){
          Object.keys( this.route.snapshot.data ).map( ( key ) => {
            this.extension[ key ] = this.route.snapshot.data[ key ];
          } );
        }
        return resolve( true );
      } );
    };

    this.dom.proceed = (): Promise<boolean> => {
      return new Promise( async( resolve ) => {
        // Require a CoreConfig
        await this._setCore();
        this.core = IsObjectThrowError( this.core, true, `${this.name}:configureDom: - this.core` ) ? this.core : null;
        if( this.core.flag.routeCheck ){ // check this child routes for any aliasing
          this.route.routeConfig.children.map( ( childRoute: Route ) => {
            const internal_name = GetSingularName( childRoute.path );
            if( IsAliasable( childRoute.path ) && IsEntity( TitleCase( internal_name ) ) ){
              childRoute.path = GetRouteAlias( internal_name );
            }
          } );
          this.core.flag.routeCheck = false;
        }

        this.log.info( 'tab-menu config', this.config );
        this.dom.height.default = window.innerHeight - 100;
        this.dom.setHeight( this.dom.height.default, 100 );
        // this component set the outer height boundary
        this.log.info( `Determined height:${this.dom.height.inner}` );
        // Bind events to handlers
        this.dom.handler.bubble = ( core: CoreConfig, event: PopBaseEventInterface ) => this.onBubbleEvent( event );
        // Require a TabMenuConfig, and pull in extension params from the route
        await this._setTabMenuConfig();
        if( this.config.portal ) this.dom.height.inner = this.dom.height.inner - 50;
        //  Attach Template Container
        this.template.attach( 'container' );
        //  Render the dynamic list of components
        this._templateRender();
        return resolve( true );
      } );
    };
  }


  /**
   * Helper function that renders the list of dynamic components
   *
   */
  private _templateRender(){
    if( this.config.portal ){
      this.asset.component = this.template.render( [ {
        type: PopEntityPortalMenuComponent,
        inputs: {
          config: this.config
        }
      } ] );
      // componentRef.instance.events.subscribe((event: PopBaseEventInterface) => {
      //   if( typeof this.dom.handler.bubble === 'function' ){
      //     this.dom.handler.bubble(event);
      //   }else{
      //     if( this.trait.bubble ) this.events.emit(event);
      //   }
      // })
    }else{
      this.template.render( [ {
        type: PopTabMenuComponent,
        inputs: {
          config: this.config
        }
      } ] );
    }
  }


  ngOnInit(){
    super.ngOnInit();
  }


  /**
   * Tie in for a parent component to pass in a TabMenuConfig
   * @param config
   */
  registerTabMenuConfig( config: TabMenuConfig ){ // use for programmatic/dynamic implementations
    this.config = IsObjectThrowError( config, true, `${this.name}:registerTabMenuConfig: - config` ) ? config : <TabMenuConfig>{};
    this.dom.setSubscriber( 'config-change', this.srv.tab.change.subscribe( ( event ) => {
    } ) );
    try{
      this.cdr.detectChanges();
    }catch( e ){
    }
    this._registerTabMenuConfig();
  }


  /**
   * A TabMenu  will generate a slew of action and event triggers
   * @param event
   */
  onBubbleEvent( event: PopBaseEventInterface ): void{
    this.log.event( `onBubbleEvent`, event );
    if( IsValidFieldPatchEvent( this.core, event ) ){
      if( event.config.name === 'name' || event.config.name === 'label' ){
        this.config.name = event.config.control.value;
      }
    }else{
      switch( event.type ){
        case 'button':
          switch( event.id ){
            case 'reset':
              this.srv.tab.refreshEntity( null, this.dom.repo, {}, 'PopEntityTabMenuComponent:handleMenuEvent:reset' ).then( () => true );
              break;
            // case 'archive':
            //   this.onArchiveButtonClicked(true);
            //   break;
            // case 'activate':
            //   this.onArchiveButtonClicked(false);
            //   break;
            case 'clone':
              this.onCloneButtonClicked();
              break;
            case 'close':
              if( this.dialogRef ) this.dialogRef.close();
              break;
            default:
              this.events.emit( event );
              break;
          }
          break;
        case 'portal':
          break;
        case 'default':
          break;
      }
    }
  }


  /**
   * A user can click on an archive/active button to change the status of this active entity
   * @param archive
   */
  onArchiveButtonClicked( archive: boolean ){
    if( this.dom.subscriber.entity ) this.dom.subscriber.entity.unsubscribe();
    this.dom.subscriber.entityId = this.core.repo.archiveEntity( this.core.params.entityId, archive ).subscribe( () => {
      PopEntity.bustAllCache();
      this.srv.events.sendEvent( {
        source: this.name,
        method: 'archive',
        type: 'entity',
        name: this.core.params.name,
        internal_name: this.core.params.internal_name,
        id: this.core.params.entityId,
        data: archive
      } );
      if( archive && !this.config.portal ){
        if( false ){ // Disabled navigation back to the entity list for now
          this.core.repo.navigateToEntities().catch( e => {
            this.srv.tab.refreshEntity( null, this.dom.repo, {}, 'PopEntityTabMenuComponent:setArchived' ).then( () => PopTemplate.clear() );
          } );
        }else{
          this.srv.tab.refreshEntity( null, this.dom.repo, {}, 'PopEntityTabMenuComponent:setArchived' ).then( () => PopTemplate.clear() );
        }
      }else{
        this.srv.tab.refreshEntity( null, this.dom.repo, {}, 'PopEntityTabMenuComponent:setArchived' ).then( () => PopTemplate.clear() );
      }
    }, err => {
      this.dom.error.code = err.error.code;
      this.dom.error.message = err.error.message;
    } );
  }


  /**
   * A user can click a clone button to trigger this active entity to be cloned
   */
  onCloneButtonClicked(){
    // this.dom.setTimeout( `clone-action`, async() => {
    //   const actionConfig = await this.srv.action.doAction( <CoreConfig>this.core, 'clone', this.extension );
    //   this.ui[ 'actionModal' ] = IsObject( actionConfig, true ) ? actionConfig : null;
    // }, 0 );
    this.dom.setTimeout(`do-action`, async()=>{
      await this.srv.action.do(this.core, 'clone', this.extension);
    }, 0);

  }


  /**
   * When the modal to clone the active entity is closed the asset needs to be cleared
   */
  onActionModalClose(){
    this.ui[ 'actionModal' ] = null;
  }


  /**
   * Cleanup the do of this component
   */
  ngOnDestroy(){
    if( this.core && this.core.params && this.core.params.entityId ) this.core.repo.clearCache( 'entity', String( this.core.params.entityId ), 'PopEntityTabMenuComponent:ngOnDestroy' );
    // this.srv.tab.reset();
    super.ngOnDestroy();
  }


  /************************************************************************************************
   *                                                                                              *
   *                                      Under The Hood                                          *
   *                                    ( Private Method )                                        *
   *                                                                                              *
   ************************************************************************************************/


  /**
   * This allows a CoreConfig to be passed in else it will generate one
   *
   */
  private _setCore(): Promise<boolean>{
    return new Promise( async( resolve ) => {
      if( !( IsObject( this.core, true ) ) ){
        if( IsObject( this.portal, [ 'internal_name', 'entity_id' ] ) ){
          this.core = await PopEntity.getCoreConfig( this.portal.internal_name, this.portal.entity_id );
          return resolve( true );
        }else if( IsObject( this.route.snapshot.data.core, true ) ){
          this.core = this.route.snapshot.data.core;
          await PopEntity.setCoreDomAssets( this.core, this.dom.repo );
          return resolve( true );
        }else{
          this.core = await PopEntity.getCoreConfig( PopEntity.getRouteInternalName( this.route, this.extension ), this.route.snapshot.params.id, this.dom.repo );
          return resolve( true );
        }
      }else{
        return resolve( true );
      }
    } );
  }


  /**
   * This allows a TabMenuConfig to be passed in else it will generate one
   *
   */
  private _setTabMenuConfig(): Promise<boolean>{
    return new Promise( async( resolve ) => {
      if( !IsObject( this.config, true ) ){
        this.config = GetTabMenuConfig( this.core, PopEntity.getEntityTabs( this.core ) );
        this.config = IsObjectThrowError( this.config, true, `${this.name}:configureDom: - this.config` ) ? this.config : <TabMenuConfig>{};
        this._registerTabMenuConfig();
        return resolve( true );
      }else{
        this._registerTabMenuConfig();
        return resolve( true );
      }
    } );
  }


  /**
   * This will transfer the TabMenuConfig up to the tabRepo so other components can communicate with it
   *
   */
  private _registerTabMenuConfig(){
    if( this.core && this.config ){
      // turn off the filter bar (unless a portal dialog) since it is wasted space
      if( IsObject( this.portal, [ 'internal_name' ] ) ){
        this.config.portal = true;
      }
      if( !this.config.portal ) ServiceInjector.get( PopCacFilterBarService ).setActive( false );

      if( typeof this.extension === 'object' && Object.keys( this.extension ).length ){
        Object.keys( this.extension ).map( ( key ) => {
          if( key in this.config ){
            this.config[ key ] = this.extension[ key ];
          }
        } );
      }
      // Register the config on the Tab Menu Service since it is the master control
      // We store the config of the Tab Menu since other components(Tabs,...) interact with it
      this.config = this.srv.tab.registerConfig( this.core, <TabMenuConfig>this.config, this.dom.repo );
      this.srv.tab.registerRoute( this.route );
      try{
        this.cdr.detectChanges();
      }catch( e ){
      }
    }
  }

}

