import { Component, ElementRef, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TableConfig } from '../../base/pop-table/pop-table.model';
import { EntityTabListExtendInterface } from './pop-entity-tab-list.model';
import { PopDomService } from '../../../services/pop-dom.service';
import { AppGlobalInterface, CoreConfig, Entity, PopBusiness, PopEntity, PopPipe, PopTemplate } from '../../../pop-common.model';
import {
  GetHttpObjectResult,
  GetSessionSiteVar,
  IsArray,
  IsObject,
  TitleCase
} from '../../../pop-common-utility';
import { PopEntityListComponent } from '../pop-entity-list/pop-entity-list.component';
import { PopTabMenuService } from '../../base/pop-tab-menu/pop-tab-menu.service';


@Component( {
  selector: 'lib-pop-entity-tab-list',
  styleUrls: [ './pop-entity-tab-list.component.scss' ],
  templateUrl: './pop-entity-tab-list.component.html',
} )
export class PopEntityTabListComponent extends PopEntityListComponent implements OnInit, OnDestroy {
  @Input() internal_name: string;
  @Input() parentId: number;
  @Input() parent: string;
  @Input() param: string;
  @Input() extension: EntityTabListExtendInterface;

  public name = 'PopEntityTabListComponent';


  constructor(
    public el: ElementRef,
    protected route: ActivatedRoute,
    protected _domRepo: PopDomService,
    protected _tabRepo: PopTabMenuService,
    @Inject( 'APP_GLOBAL' ) public APP_GLOBAL: AppGlobalInterface,
  ){
    super( el, route, _domRepo, APP_GLOBAL );
  }


  /**
   * This component will display a list of entities that the user can interact with
   */
  ngOnInit(){
    super.ngOnInit();
  }


  /**
   * Clean up the dom of this component
   */
  ngOnDestroy(){
    super.ngOnDestroy();

  }


  /************************************************************************************************
   *                                                                                              *
   *                                      Under The Hood                                          *
   *                                    ( Protected Method )                                        *
   *                                                                                              *
   ************************************************************************************************/
  /**
   * Allow for a CoreConfig to be passed in
   * If a CoreConfig does not exits this component needs to be able to create it for itself, uses the internal_name that comes directly for the route
   * or tries to extrapolate it from the current url of the app
   *
   */
  protected _setCoreConfig(): Promise<boolean>{
    // console.log(this.route);
    return new Promise( async( resolve ) => {
      this.srv.entity.getCoreConfig( this.internal_name, 0 ).then( ( core: CoreConfig ) => {
        this.core = core;
        this.id = `${this.parent}_${this.core.params.internal_name}`;
        this.log.info( `_setCore: initial`, core );
        return resolve( true );
      }, () => {
        return resolve( false );
      } );
    } );
  }


  /**
   * Setup basic config
   * Intended to be overridden
   * @private
   */
  protected _setConfig(): Promise<boolean>{
    return new Promise( async( resolve ) => {

      if( !this.parentId ) this.parentId = this.srv.entity.getRouteParentId( this.route );
      if( !this.internal_name ) this.internal_name = this.srv.entity.getRouteInternalName( this.route );

      if( this.parent === 'client' ){
        this.extension.client_id = +this.parentId;
      }else if( this.parent === 'account' ){
        const account = this.srv.tab.getCore().entity;
        this.extension.client_id = +account.client_id;
        this.extension.account_id = +account.id;
      }
      return resolve( true );
    } );
  }


  /**
   * Manage the sessionStorage settings
   * @private
   */
  protected _setSessionSettings(): Promise<boolean>{
    return new Promise( async( resolve ) => {
      // Set session path for variables
      this.asset.tabMenuSessionPath = `Entity.${TitleCase( this.core.params.internal_name )}.Menu`;
      this.asset.showArchivedSessionPath = `Business.${PopBusiness.id}.Entity.${TitleCase( this.parent )}.Table.${TitleCase( this.internal_name )}.showArchived`;
      this.asset.searchValueSessionPath = `Business.${PopBusiness.id}.Entity.${TitleCase( this.parent )}.Table.${TitleCase( this.internal_name )}.searchValue`;

      // Set any session variables
      // SetSessionSiteVar(this.asset.tabMenuSessionPath, null); // remove any menu session data for this entity
      this.dom.state.showArchived = GetSessionSiteVar( this.asset.showArchivedSessionPath, false );

      return resolve( true );
    } );
  }


  /**z
   * Determine the height of the table
   * @private
   */
  protected _setHeight(): Promise<boolean>{
    return new Promise( async( resolve ) => {
      // Determine height of the table - have to account if filter bar is enabled
      const overhead = 50; // trial and error , increase to make component shorter, lower to increase height
      this.dom.setHeight( window.innerHeight - 200, overhead );
      return resolve( true );
    } );
  }


  protected _fetchData( update = false ){
    if( !update ) this.dom.setTimeout( `lazy-load-fresh-data`, null );
    return new Promise( async( resolve, reject ) => {
      if( this.dataFactory ){
        this.dataFactory( this.parentId, this.dom.state.showArchived ? 1 : 0 ).then( ( data ) => {
          // console.log('data', data);
          data = this._transformData( data );
          if( update && this.table.config && typeof this.table.config.updateData === 'function' ){
            this.table.config.updateData( data );
          }
          PopTemplate.clear();
          resolve( data );
        }, () => {
          reject( [] );
        } );
      }else{
        const params = {};
        params[ `${this.parent}_id` ] = this.parentId;
        // console.log(params);
        this.core.repo.getEntities( { archived: ( this.dom.state.showArchived ? 1 : 0 ), ...params } ).then( ( list: Entity[] ) => {
          list = this._transformData( list )
          // this.core.repo.setCache('table', this.internal_name, data, 5);
          if( update && this.table.config && typeof this.table.config.updateData === 'function' ){
            this.table.config.updateData( list );
          }
          PopTemplate.clear();
          resolve( list );
        }, () => {
          reject( [] );
        } );
      }

    } );
  }


  protected _transformData( data: any[] ){
    if( !( IsObject( this.asset.fieldKeys, true ) ) ) this._setFieldKeys( data[ 0 ] );
    if( !( IsObject( this.asset.transformations, true ) ) ) this._setFieldTableTransformations();
    data = this._prepareTableData( data );
    this.core.repo.setCache( 'table', this.parent, data, 5 );

    return data;
  }


  /**
   * Retrieves the data set that this view will represent
   * @param hardReset
   *
   */
  protected _getTableData( hardReset = false ){
    return new Promise( ( resolve, reject ) => {
      if( this.dom.delay.data ) clearTimeout( this.dom.delay.data );
      this.core.repo.getCache( 'table', this.parent ).then( ( cache ) => {
        if( IsArray( cache, true ) ){
          this._triggerDataFetch();
          return resolve( { data: cache } );
        }else{
          this._fetchData( false ).then( ( data ) => {
            return resolve( { data: data } );
          } );
        }
      } );
    } );
  }


  protected _configureFilterBar(): Promise<boolean>{
    return new Promise( async( resolve ) => {
      this.srv.filter.setActive( false );
      return resolve( true );
    } );
  }


  /**
   * Generates a table config that will be used by the nested view component
   * @param reset
   *
   */
  protected _configureTable( reset = false ): Promise<boolean>{
    return new Promise( async( resolve ) => {
      if( !this.table.config ){
        this._getTableData( reset ).then( ( tableData: any ) => {
          if( IsArray( tableData.data, true ) ){
            this.asset.blueprint = tableData.data[ 0 ];
          }
          this._getTableInterface().then( () => {
            this.asset.tableInterface.paginator = false;
            this.table.config = new TableConfig( { ...this.asset.tableInterface, ...tableData } );
          } );
        } );
      }else{
        this.table.config.loading = true;
        this._getTableData().then( ( result: { data: Entity[] } ) => {
          if( IsArray( result.data, true ) ) this.asset.blueprint = result.data[ 0 ];
          this.table.config.buttons = this._buildTableButtons();
          if( reset ){
            this.table.config.reset( result.data );
          }else{
            this.table.config.updateData( result.data );
          }
          this.table.config.loading = false;
          this.dom.state.refresh = false;
          this.core.params.refresh = false;

        } );
      }
      return resolve( true );
    } );
  }


  /************************************************************************************************
   *                                                                                              *
   *                                      Under The Hood                                          *
   *                                    ( Private Method )                                        *
   *                                                                                              *
   ************************************************************************************************/


}

