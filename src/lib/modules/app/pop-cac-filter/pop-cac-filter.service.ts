import { ElementRef, Inject, Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import {
  Entity,
  OptionItem,
  PopBaseEventInterface,
  PopBusiness,
  PopPipe,
  PopLog,
  PopUser,
  SetPopFilter, CoreConfig, PopRequest, AppGlobalInterface, PopEntity,
} from '../../../pop-common.model';
import { GetSessionSiteVar, IsArray, IsNumber, IsObject, IsString, SetSessionSiteVar, StorageGetter } from '../../../pop-common-utility';
import { PopExtendService } from '../../../services/pop-extend.service';
import { CacFilterBarConfig, CacFilterBarEntityConfig } from './pop-cac-filter.model';
import { PopEntityEventService } from '../../entity/services/pop-entity-event.service';
import { IsValidFieldPatchEvent } from '../../entity/pop-entity-utility';
import { PopPipeService } from '../../../services/pop-pipe.service';


@Injectable( {
  providedIn: 'root'
} )
export class PopCacFilterBarService extends PopExtendService implements OnDestroy {
  loading = false;

  public name = 'PopClientFilterBarService';

  private config: CacFilterBarConfig = new CacFilterBarConfig(
    {
      active: false
    }
  );

  protected asset = {
    lookup: {},
    el: <ElementRef<any>>undefined,
    client: < Map<number, Entity> >new Map<number, Entity>(),
    account: < Map<number, Entity> >new Map<number, Entity>(),
    campaign: < Map<number, Entity> >new Map<number, Entity>(),
    triggerFields: [ 'name', 'archived', 'deleted_at', 'client_id', 'account_id', 'campaign_id' ],
    views: [ 'client', 'account', 'campaign' ]
  };

  event = {
    data: new Subject<string>(),
    config: new Subject<CacFilterBarEntityConfig[]>(),
    bubble: new Subject<PopBaseEventInterface>()
  };

  private filter: { client?: number[], account?: number[], campaign?: number[] } = {};

  private readonly entities = <CacFilterBarEntityConfig[]>[
    new CacFilterBarEntityConfig( {
      sort_order: 0,
      internal_name: 'client',
      name: 'Client(s)',
      options: [],
      parent_link: null,
      child_link: 'client_id',
      single: false,
      visible: true
    } ),
    new CacFilterBarEntityConfig( {
      sort_order: 1,
      internal_name: 'account',
      name: 'Account(s)',
      options: [],
      parent_link: 'client_id',
      child_link: 'account_id',
      single: false,
      visible: true,
    } ),
    new CacFilterBarEntityConfig( {
      sort_order: 2,
      internal_name: 'campaign',
      name: 'Campaigns(s)',
      options: [],
      parent_link: 'account_id',
      child_link: null,
      single: false,
      visible: true
    } ),
  ];


  constructor(
    private crud: PopEntityEventService,
    private pipe: PopPipeService,
    @Inject( 'APP_GLOBAL' ) private APP_GLOBAL: AppGlobalInterface,
  ){
    super();
    this._init().then(()=>true);
  }


  private _init(){
    return new Promise<boolean>( async( resolve ) => {
      await this.APP_GLOBAL.isVerified();
      if( IsObject( PopBusiness, [ 'id' ] ) && IsObject( PopUser, [ 'id' ] ) ){
        this._getFilterStorage(); // retrieve any session data
      }else{
        this.config.active = false;
        return resolve( false );
      }
      this.dom.setSubscriber( `crud-events`, this.crud.events.subscribe( ( event ) => {
        if( IsValidFieldPatchEvent( <CoreConfig>{}, event ) ){
          const internalName = StorageGetter( event.config, [ 'metadata', 'internal_name' ], null );
          if( internalName && this.asset.views.includes( internalName ) && this.asset.triggerFields.includes( event.config.name ) ){
            this._triggerDataRefresh( 'Patch' );
          }
        }else{
          if( event.internal_name && event.type === 'entity' && this.asset.views.includes( event.internal_name ) ){
            if( event.method === 'archive' ){
              const entity = this.entities.find( ( e ) => e.internal_name );
              const filter = this.filter[ entity.internal_name ];
              const archive = event.data;
              if( archive ){
                let id;
                if( IsString( event.id, true ) ){
                  if( String(event.id).includes( ',' ) ){
                    id = String( event.id ).split( ',' ).map( x => +x );
                  }else{
                    id = [ +event.id ];
                  }
                }else if( IsNumber( event.id ) ){
                  id = [ +event.data.id ];
                }


                let setFilter = false;
                id.map( ( x ) => {
                  delete entity.hidden[ x ];
                  delete entity.display[ x ];
                  delete entity.selected[ x ];
                  if( IsArray( filter, true ) ){
                    const index = filter.indexOf( String( x ), 0 );
                    if( index > -1 ){
                      setFilter = true;
                      filter.splice( index, 1 );
                    }
                  }
                } );

                if( setFilter ){
                  this.setFilter( this.filter );
                }
              }
              this._triggerDataRefresh( 'archive', 1 );
            }
            if( event.method === 'create' ){
              const entity = this.entities.find( ( e ) => e.internal_name );
              this._triggerDataRefresh( 'create', 1 );
            }
          }
        }
      } ) );

      return resolve( false );
    } );
  }


  public register( el: ElementRef<any> ){
    this.asset.el = el;
  }


  getEntities(): CacFilterBarEntityConfig[]{
    return this.entities;
  }


  getFilter(){
    return this.filter;
  }


  /**
   * Return the filter bar config
   */
  getConfig(): CacFilterBarConfig{
    return this.config;
  }


  public setFilter( filter: { client?: number[], account?: number[], campaign?: number[] } ){
    this.filter = {};
    if( IsObject( PopBusiness, [ 'id' ] ) ){
      if( IsArray( filter.client, true ) ) this.filter.client = filter.client;

      if( this.config.view.includes( 'account' ) && IsArray( filter.account, true ) ){
        this.filter.account = filter.account;
      }else{
        if( IsArray( filter.client, true ) ){
          const clients = filter.client.map( c => +c );
          filter.account = <any>this.entities[ 1 ].options.filter( ( account ) => {
            return +account.client_id  && clients.includes( account.client_id );
          } ).map( a => String( a.id ) );
          this.filter.account = filter.account;
        }
      }
      if( this.config.view.includes( 'campaign' ) && IsArray( filter.campaign, true ) ){
        this.filter.campaign = filter.campaign;
      }else{
        if( IsArray( filter.account, true ) ){
          const accounts = filter.account.map( c => +c );
          filter.campaign = <any>this.entities[ 2 ].options.filter( ( campaign ) => {
            return +campaign.account_id && accounts.includes( campaign.account_id );
          } ).map( c => String( c.id ) );
          console.log('filter.campaign', filter.campaign);
          this.filter.campaign = filter.campaign;
        }
      }
      SetSessionSiteVar( `Business.${PopBusiness.id}.Filter.Entities`, filter );
      SetPopFilter( filter );
    }
  }


  getElHeight(): number{
    if( this.asset.el ){
      return this.asset.el.nativeElement.lastChild.clientHeight;
    }
    return 0;
  }


  getHeight(): number{
    if( IsObject( PopBusiness, [ 'id' ] ) ){
      const open = GetSessionSiteVar( `Business.${PopBusiness.id}.Filter.open`, false );
      if( +open ){
        return 281;
      }else{
        return 101;
      }
    }
    return 0;
  }


  /**
   * Clear any existing filters
   * @param app
   */
  public clearFilters(){
    this.setFilter({});
  }


  /**
   * Trigger update trigger
   * @param type strings
   * @returns void
   */
  onChange( event: PopBaseEventInterface ){
    setTimeout( () => {
      this.event.bubble.next( event );
    }, 0 );
  }


  /**
   * Ask whether the filter bar is active or not
   */
  isActive(): boolean{
    return this.config.active;
  }


  refresh(){
    this.event.bubble.next( {
      source: 'PopFilterBarService',
      type: 'filter',
      name: 'refresh',
    } );
  }


  /**
   * Toggle whether to include archived records
   * @param active
   */
  setArchived( archived: boolean ){
    if( this.config ){
      this.config.archived = archived;
      this.event.bubble.next( {
        source: 'PopFilterBarService',
        type: 'filter',
        name: 'archived',
        data: archived
      } );
    }
  }


  /**
   * Toggle the filer bar on and off
   * @param active
   */
  setActive( active: boolean ){
    if( this.config ){
      this.config.active = active;
      this.event.bubble.next( {
        source: 'PopFilterBarService',
        type: 'filter',
        name: 'state',
        model: 'active'
      } );
    }
  }


  /**
   * Toggle the Loader
   * @param loader
   */
  setLoader( loader: boolean ){
    if( this.config ){
      this.config.loader = loader;
    }
  }


  /**
   * Change the display state of the filter bar
   * @param display
   */
  setDisplay( display: any ){
    if( this.config ){
      if( ![ 'default', 'static', 'float' ].includes( display ) ) display = 'default';
      this.config.display = display;
    }
  }


  /**
   * Change the display state of the filter bar
   * @param display
   */
  setView( view: string[] ){
    if( IsArray( view ) ){
      this.config.view = view;
      this.entities.map( ( entity ) => {
        entity.visible = this.config.view.includes( entity.internal_name );
      } );
    }
  }


  getAsset( internal_name: string, id: number ){
    if( internal_name in this.asset ){
      return this.asset[ internal_name ].get( +id );
    }
    return null;
  }


  setData( caller: string, allowCache = true ): Promise<boolean>{
    PopLog.info( this.name, `setData`, caller );
    return new Promise<boolean>( async( resolve ) => {
      let cache;
      if( allowCache && IsObject( PopBusiness, [ 'id' ] ) ){
        try{
          cache = GetSessionSiteVar( `Business.${PopBusiness.id}.Filter.Data` );
          cache = JSON.parse( atob( cache ) );
        }catch( e ){
        }
      }
      if( IsArray( cache, true ) ){
        this._transFormData( cache );
        this._triggerDataRefresh( 'init' );
        return resolve( true );
      }else{
        // this.config.loader = true;
        const url = `clients?select=id,name,client_id,account_id,campaign_id,allaccounts,allcampaigns&archived=0&with=allaccounts.allcampaigns&limit=500`;
        this.dom.setSubscriber( `data-fetch`, PopRequest.doGet( url, {}, 1, false ).subscribe( ( x ) => {
          if( x.data ) x = x.data;
          if( IsObject( PopBusiness, [ 'id' ] ) ){
            try{
              SetSessionSiteVar( `Business.${PopBusiness.id}.Filter.Data`, btoa( JSON.stringify( x ) ) );
            }catch( e ){
            }
          }
          this._transFormData( x );
          // this.config.loader = false;
          return resolve( true );
        }, () => {
          return resolve( false );
        } ) );
      }
    } );

  }


  setConfigAliases(){
    this.entities.map( ( entity ) => {
      entity.name = PopPipe.transform( entity.internal_name, { type: 'entity', arg1: 'alias', arg2: 'singular' } ) + '(s)';
    } );
  }


  ngOnDestroy(){
    super.ngOnDestroy();
  }


  private _triggerDataRefresh( caller: string, seconds = 10 ): void{
    this.dom.setTimeout( 'lazy-load-filter-data', () => {
      this.setData( `_triggerDataRefresh`, false ).then( () => {
        this.event.data.next( caller );
      } );
    }, ( seconds * 1000 ) );
  }


  private _transFormData( x: any[] ): void{
    const data = this._setDataStructure( x );

    Object.keys( data ).map( key => {
      this.pipe.setAsset( key, data[ key ] );
      PopLog.init( this.name, `Transfer asset to PipeService: ${key}` );
    } );

    this.entities[ 0 ].options = <any>Object.values( data.client ).sort( ( a: OptionItem, b: OptionItem ) => {
      if( a.name < b.name ) return -1;
      if( a.name > b.name ) return 1;
      return 0;
    } );

    this.entities[ 1 ].options = <any>Object.values( data.account ).sort( ( a: OptionItem, b: OptionItem ) => {
      if( a.name < b.name ) return -1;
      if( a.name > b.name ) return 1;
      return 0;
    } );

    this.entities[ 2 ].options = <any>Object.values( data.campaign ).sort( ( a: OptionItem, b: OptionItem ) => {
      if( a.name < b.name ) return -1;
      if( a.name > b.name ) return 1;
      return 0;
    } );
  }


  /************************************************************************************************
   *                                                                                              *
   *                                      Under The Hood                                          *
   *                                    ( Private Method )                                        *
   *                                                                                              *
   ************************************************************************************************/

  /**
   * Retrieves any filter settings from session storage
   */
  private _getFilterStorage(){
    let filter = <{ client?: any[], account?: any[], campaign?: any[] }>{};
    if( IsObject( PopBusiness, [ 'id' ] ) ){
      filter = GetSessionSiteVar( `Business.${PopBusiness.id}.Filter.Entities`, {} );
      if(IsArray(filter.client, true)){
        const client = this.entities[0];
        if(!IsObject(client.selected)) client.selected = {};
        filter.client.map((c)=>{
          client.selected[c.id] = true;
        });
      }
      if(IsArray(filter.account, true)){
        const account = this.entities[1];
        if(!IsObject(account.selected)) account.selected = {};
        filter.account.map((a)=>{
          account.selected[a.id] = true;
        });
      }
      if(IsArray(filter.campaign, true)){
        const campaign = this.entities[2];
        if(!IsObject(campaign.selected)) campaign.selected = {};
        filter.campaign.map((c)=>{
          campaign.selected[c.id] = true;
        });
      }
      // this.asset.views.map((internal_name: string) => {
      //   if( !IsArray(filter[ internal_name ], true) ) delete filter[ internal_name ];
      // });

      SetPopFilter( filter );
    }


    this.filter = filter;
  }


  private _setDataStructure( res ){
    const data = {
      client: {},
      account: {},
      campaign: {}
    };

    if( IsArray( res, true ) ){
      res.map( ( client ) => {
        data.client[ +client.id ] = {
          id: +client.id,
          name: client.name,
          archived: client.archived,
        };
        // this.asset.client.set(+client.id, data.client[ +client.id ]);
        if( IsArray( client.allaccounts, true ) ){
          client.allaccounts.map( ( account: any ) => {
            if( IsObject( account ) ){
              data.account[ +account.id ] = {
                id: +account.id,
                name: account.name,
                client_id: +account.client_id,
                archived: +account.archived,
              };
              // this.asset.account.set(+account.id, data.account[ +account.id ]);
              if( IsArray( account.allcampaigns, true ) ){
                account.allcampaigns.map( ( campaign: any ) => {
                  if( IsObject( campaign ) ){
                    data.campaign[ +campaign.id ] = {
                      id: +campaign.id,
                      name: campaign.name,
                      client_id: +client.id,
                      account_id: +campaign.account_id,
                      archived: +campaign.archived,
                    };
                    // this.asset.campaign.set(+campaign.id, data.campaign[ +campaign.id ]);
                  }
                } );
              }
            }
          } );
        }
      } );
    }
    return data;
  }


}
