import { ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { TableConfig } from '../../base/pop-table/pop-table.model';
import { PopBaseService } from '../../../services/pop-base.service';
import { PopEntityTabMenuComponent } from '../pop-entity-tab-menu/pop-entity-tab-menu.component';
import { PopEntityService } from '../services/pop-entity.service';
import { PopTabMenuService } from '../../base/pop-tab-menu/pop-tab-menu.service';
import { PopEntityProviderDialogComponent, PopEntityProviderDialogInterface } from './pop-entity-provider-dialog/pop-entity-provider-dialog.component';
import { CoreConfig, Dictionary, Entity, EntityParams, PopBaseEventInterface, PopPipe, PopTemplate, ServiceInjector } from '../../../pop-common.model';
import { PopEntityEventService } from '../services/pop-entity-event.service';
import { MatDialog } from '@angular/material/dialog';
import { PopExtendComponent } from '../../../pop-extend.component';
import { PopDomService } from '../../../services/pop-dom.service';
import {
  ArrayOnlyUnique,
  ArrayRemoveDupliates,
  DeepCopy,
  IsArray,
  IsObject,
  IsObjectThrowError,
  IsString,
  SnakeToPascal,
  StorageGetter,
  TitleCase
} from '../../../pop-common-utility';
import { GetTabMenuConfig } from '../pop-entity-utility';


@Component( {
  selector: 'lib-pop-entity-assignments',
  templateUrl: './pop-entity-assignments.component.html',
  styleUrls: [ './pop-entity-assignments.component.scss' ],

} )
export class PopEntityAssignmentsComponent extends PopExtendComponent implements OnInit, OnDestroy {
  @Input() private fieldType: string;
  @Input() public header: string;

  public name = 'PopEntityAssignmentsComponent';

  protected srv = {
    base: <PopBaseService>ServiceInjector.get( PopBaseService ),
    dialog: <MatDialog>ServiceInjector.get( MatDialog ),
    events: <PopEntityEventService>ServiceInjector.get( PopEntityEventService ),
    entity: <PopEntityService>ServiceInjector.get( PopEntityService ),
    tab: <PopTabMenuService>undefined,
  };

  protected asset = {
    entityParamsMap: <Dictionary<EntityParams>>{},
    assignedUserMap: undefined
  };


  constructor(
    public el: ElementRef,
    public  cdr: ChangeDetectorRef,
    protected _domRepo: PopDomService,
    protected _tabRepo: PopTabMenuService,
  ){
    super();
    /**
     * This should transformValue and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
     */
    this.dom.configure = (): Promise<boolean> => {
      return new Promise( async( resolve ) => {


        // #1: Enforce a CoreConfig
        this.core = IsObjectThrowError( this.core, true, `${this.name}:configureDom: - this.core` ) ? this.core : null;
        this.dom.state = {
          ...this.dom.state, ...{
            directBaseline: false,
            dataHasDirect: false,
            dataHasParent: false,
            dataHasProviders: false,
            dataHasType: false,
            blockModal: false,
            loaded: false,
            loading: true,
            error: { code: 0, message: '' },
          }
        };
        this.ui.table = {
          config: <TableConfig>undefined,
        };
        this.dom.setHeight( PopTemplate.getContentHeight(), 100 );
        this.buildTable();
        this.dom.state.hasData = IsArray(StorageGetter(this.ui.table.config, ['matData', 'data'], []), true);
        return resolve( true );
      } );
    };

  }


  /**
   * This component should have a specific purpose
   */
  ngOnInit(){
    super.ngOnInit();
  }


  buildTable(){
    let parentLabel;
    const isDialogLimit = this.srv.dialog.openDialogs.length > 3;
    if( this.core && this.core.params ) this.core.params.refresh = false;
    const columnDefinitions = {};
    // this.subscribers.entity = this.entityRepo.events.subscribe((e) => this.crudEventHandler(e));
    if( this.fieldType && String( this.fieldType ).includes( 'assigned_' ) === false ) this.fieldType = `assigned_${this.fieldType}`;
    // this.fieldType should reference a entity.metadata key <'assigned_XXXXXX'> if not this.fieldType grab anything with the 'assigned_' prefix in entity.metadata;
    const data = this.getTableData();
    if( this.fieldType && this.dom.state.dataHasParent ){
      parentLabel = TitleCase( SnakeToPascal( PopPipe.transform( data[ 0 ].parent.internal_name, { type: 'entity', arg1: 'alias', arg2: 'singular' } ) ) ).trim();
    }

    this.ui.table.config = new TableConfig( {
      height: this.dom.height.outer,
      paginator: false,
      search: data.length >= 10 ? true : false,
      searchColumns: false,
      columnDefinitions: {
        name: {
          visible: true,
          helper: isDialogLimit ? null : { text: 'Jump To: <name>', position: 'right' },
          link: isDialogLimit ? false : 'entity',
          order: 0,
        },
        entity: {
          visible: !this.fieldType ? true : false,
          order: 1,
        },

        direct: {
          visible: this.dom.state.dataHasDirect ? true : false,
          order: 2,
        },
        type: {
          visible: this.dom.state.dataHasType ? true : false,
          order: 3,
        },
        parent_name: {
          visible: this.fieldType && this.dom.state.dataHasParent && parentLabel ? true : false,
          display: parentLabel,
          link: 'parent',
          order: 4,
        },
        has_providers: {
          display: 'Provider',
          visible: this.dom.state.dataHasProviders ? true : false,
          link: 'providers',
          // helper: { text: 'Jump To: <name>', position: 'right' },
          order: 5,
        },
        // assigned: {
        //   visible: true,
        //   link: 'section_users',
        //   // helper: { text: 'Jump To: <name>', position: 'right' },
        //   order: 4,
        // },
        // id: {
        //   visible: this.fieldType ? true : false,
        //   order: 100,
        // },
      },
      data: data,
    } );
    this.dom.state.loading = false;
    this.dom.state.loaded = true;
    try{
      this.cdr.detectChanges();
    }catch( e ){
    }
  }


  crudEventHandler( event: PopBaseEventInterface ){
    if( this.dom.subscriber.dialog ){
      if( event.method === 'create' || event.method === 'delete' ){
        if( this.core && this.core.params ) this.core.params.refresh = true;
      }else if( event.method === 'update' ){
        if( event.type === 'entity' ){
          if( event.name === 'archive' ){
            if( this.core && this.core.params ) this.core.params.refresh = true;
          }
        }else if( ( event.type === 'field' || event.type === 'sidebyside' ) && event.name === 'patch' ){
          if( this.core && this.core.params ) this.core.params.refresh = true;
        }
      }
    }
  }


  getKeyInternalName( key: string ){
    return String( key ).replace( /(pt_leader|pt_member|_fk|assigned_)/g, '' );
  }


  getEntityParams( key: string, id: number = null ): EntityParams{
    let entityParams;
    key = this.getKeyInternalName( key );
    if( key in this.asset.entityParamsMap ){
      return this.asset.entityParamsMap[ key ];
    }
    if( key === 'user' ){
      entityParams = <EntityParams>{
        app: 'admin',
        internal_name: 'user',
        api: 'user',
      };
    }else{
      entityParams = this.srv.entity.getEntityParams( key );
    }
    if( !entityParams ){
      entityParams = this.srv.entity.getEntityParamsWithPath( key );
    }
    this.asset.entityParamsMap[ key ] = entityParams;

    if( this.log.repo.enabled() ) console.log( this.log.repo.message( 'PopEntityAssignmentsComponent:entityParams' ), this.log.repo.color( 'info' ), DeepCopy( this.asset.entityParamsMap[ key ] ) );
    return DeepCopy( this.asset.entityParamsMap[ key ] );
  }


  getTableData(){
    this.asset.assignedUserMap = {};
    const data = [];
    let rows;
    let userRows = [];
    let user;
    if( this.core && this.core.entity && IsObject( this.core.entity.metadata, true ) ){
      if( IsString( this.fieldType, true ) ){
        if( IsArray( this.core.entity.metadata[ this.fieldType ], true ) ){
          rows = this.core.entity.metadata[ this.fieldType ].map( ( row ) => {
            return this.transformRow( this.fieldType, row );
          } );
          if( this.fieldType.includes( 'user' ) === false ){ // users are handled special because they inherit assignments from multiple sources
            data.push( ...rows );
          }else{
            userRows = rows;
          }
        }
      }else{
        Object.keys( this.core.entity.metadata ).map( ( key: string ) => {
          if( key && String( key ).includes( 'assigned_' ) && this.getEntityParams( key ) && IsArray( this.core.entity.metadata[ key ], true ) ){
            rows = this.core.entity.metadata[ key ].map( ( row ) => {
              return this.transformRow( key, row );
            } );
            if( key.includes( 'user' ) === false ){ // users are handled special because they inherit assignments from multiple sources
              data.push( ...rows );
            }else{
              userRows = rows;
            }
          }
        } );
      }
    }
    if( IsArray( userRows, true ) ){
      userRows.map( ( row ) => {
        if( row.id in this.asset.assignedUserMap ) this.asset.assignedUserMap[ row.id ].direct = true;
      } );
    }

    if( IsObject( this.asset.assignedUserMap, true ) ){
      rows = Object.keys( this.asset.assignedUserMap ).map( ( id ) => {
        user = this.asset.assignedUserMap[ id ];
        return {
          id: +id,
          internal_name: 'user',
          name: user.name,
          entity: 'User',
          direct: user.direct,
          providers: user.providers,

        };
      } );
      data.push( ...rows );

    }

    data.sort( function( a, b ){
      // Sort by Entity
      if( a.entity > b.entity ) return 1;
      if( a.entity < b.entity ) return -1;
      // Sort by Title
      if( a.name > b.name ) return 1;
      if( a.name < b.name ) return -1;
    } );
    data.map( ( row ) => {
      if( !this.dom.state.directBaseline ) this.dom.state.directBaseline = row.direct;
      if( row.direct !== this.dom.state.directBaseline ) this.dom.state.dataHasDirect = true;
      if( row.parent ){
        row.parent_name = row.parent.name;
        this.dom.state.dataHasParent = true;
      }
      row.has_providers = IsArray( row.providers, true ) ? 'Yes' : null;
      if( row.has_providers ){
        this.dom.state.dataHasProviders = true;
        row.providers = ArrayRemoveDupliates( row.providers, 'uid' );
        row.has_providers = this.getProvidersName( row.providers );
        row.providers.map( ( provider ) => {
          if( provider.internal_name ) provider.entityId = TitleCase( SnakeToPascal( PopPipe.transform( provider.internal_name, {
            type: 'entity',
            arg1: 'alias',
            arg2: 'singular'
          } ) ) ).trim();
          if( provider.type ) provider.type = TitleCase( SnakeToPascal( provider.type ) ).trim();
          if( provider.direct ) row.direct = true;
        } );
      }
      row.direct = row.direct ? 'Yes' : 'No';
      if( row.type ){
        this.dom.state.dataHasType = true;
        row.type = TitleCase( SnakeToPascal( row.type ) ).trim();
      }
    } );
    if( this.log.repo.enabled() ) console.log( this.log.repo.message( 'PopEntityAssignmentsComponent:data' ), this.log.repo.color( 'data' ), data );
    return data;
  }


  assignUsers( users: Entity[], provider: object ){
    if( IsArray( users, true ) ){
      users.map( ( user ) => {
        if( +user.id && user.name ){
          if( !this.asset.assignedUserMap[ user.id ] ) this.asset.assignedUserMap[ user.id ] = { id: user.id, name: user.name, direct: false, providers: [] };
          this.asset.assignedUserMap[ user.id ].providers.push( provider );
        }
      } );
    }
  }


  getProvidersName( providers: any[] ){
    let types = [];
    if( IsArray( providers, true ) ){
      providers.map( ( provider ) => {
        if( provider.internal_name ) types.push( TitleCase( SnakeToPascal( PopPipe.transform( provider.internal_name, {
          type: 'entity',
          arg1: 'alias',
          arg2: 'singular'
        } ) ) ).trim() );
      } );
      types = ArrayOnlyUnique( types );
      types.sort();
    }
    if( this.log.repo.enabled() ) console.log( this.log.repo.message( 'PopEntityAssignmentsComponent:providersName' ), this.log.repo.color( 'info' ), IsArray( types, true ) ? types.join( ', ' ) : 'Yes' );
    return IsArray( types, true ) ? types.join( ', ' ) : 'Yes';
  }


  transformRow( key: string, row: Entity ){
    const entityParams = this.getEntityParams( key );
    // entityParams.entity = row.id;
    // console.log('entityParams', entityParams);
    let direct = row.direct ? true : false;

    let providers = IsArray( row.providers, true ) ? row.providers : [];
    let provider;
    const keyInternalName = this.getKeyInternalName( key );
    row.internal_name = keyInternalName;
    const entity = TitleCase( SnakeToPascal( PopPipe.transform( keyInternalName, { type: 'entity', arg1: 'alias', arg2: 'singular' } ) ) ).trim();
    let type = row.type ? row.type : '';
    if( entityParams.internal_name ){
      const matches = Object.keys( row ).filter( ( field: string ) => {
        if( field.includes( this.core.params.internal_name ) && +row[ field ] === +this.core.params.entityId ){
          return true;
        }
      } );

      switch( row.internal_name ){
        case 'pod_type':
          if( IsArray( matches, true ) ){
            direct = true;
          }
          if( IsArray( row.pods ) ){
            row.pods.map( ( pod ) => {
              if( pod.assigned_leaders ) this.assignUsers( pod.assigned_leaders, {
                id: +pod.id,
                name: pod.name,
                entity: entity,
                type: 'Leader',
                internal_name: 'pod',
                uid: `pod_${pod.id}_leader`
              } );
              if( pod.assigned_members ) this.assignUsers( pod.assigned_members, {
                id: +pod.id,
                name: pod.name,
                entity: entity,
                type: 'Member',
                internal_name: 'pod',
                uid: `pod_${pod.id}_member`
              } );
            } );
          }
          break;
        case 'pod':
          matches.map( ( matchFieldName ) => {
            if( IsArray( matches, true ) ){
              if( this.core.params.internal_name === 'security_profile' ){
                type = String( matchFieldName ).includes( 'leader' ) ? 'Leader' : 'Member';
                if( String( matchFieldName ).includes( 'pt_' ) ){
                  provider = { id: row.pod_type_fk, name: row.pod_type, internal_name: 'pod_type', type: type, uid: `pod_type_${row.pod_type_fk}_${type}` };
                  providers = [ provider ];
                }else{
                  direct = true;
                }
              }
            }

            if( row.assigned_leaders ) this.assignUsers( row.assigned_leaders, {
              id: row.id,
              name: row.name,
              entity: entity,
              type: 'Leader',
              internal_name: 'pod',
              uid: `pod_${row.id}_leader`
            } );
            if( row.assigned_members ) this.assignUsers( row.assigned_members, {
              id: row.id,
              name: row.name,
              entity: entity,
              type: 'Member',
              internal_name: 'pod',
              uid: `pod_${row.id}_member`
            } );
          } );
          break;
        case 'role':
          if( IsArray( matches, true ) ){
            direct = true;
            if( row.assigned_user ) this.assignUsers( row.assigned_user, {
              id: +row.id,
              name: row.name,
              entity: entity,
              internal_name: 'role',
              uid: `role_${row.id}`
            } );
          }

          break;
        case 'user':
          if( IsArray( matches, true ) ){
            direct = true;
            this.assignUsers( [ row ], { id: +row.id, name: row.name, entity: entity, internal_name: 'user', type: 'User', uid: `user_${row.id}_${type}` } );
          }
          break;
        default:
          break;
      }
    }

    return {
      id: row.id,
      internal_name: row.internal_name,
      name: row.display_name ? row.display_name : row.name,
      parent: row.parent,
      entity: TitleCase( SnakeToPascal( PopPipe.transform( keyInternalName, { type: 'entity', arg1: 'alias', arg2: 'singular' } ) ) ).trim(),
      direct: direct,
      type: type,
      providers: providers,
      uid: type ? `${keyInternalName}_${row.id}_${type}` : `${keyInternalName}_${row.id}`
    };
  }


  eventHandler( event: PopBaseEventInterface ){
    if( event.type === 'table' ){
      if( this.log.repo.enabled() ) console.log( this.log.repo.message( 'PopEntityAssignmentsComponent:event' ), this.log.repo.color( 'event' ), event );
      switch( event.data.link ){
        case 'entity':
          this.viewEntityPortal( event.data.row.internal_name, +event.data.row.id );
          break;
        case 'parent':
          if( event.data.row && event.data.row.parent ){
            this.viewEntityPortal( event.data.row.parent.internal_name, +event.data.row.parent.id );
          }
          break;
        case 'providers':
          this.viewRowProviders( event.data.row );
          break;
        default:
          break;
      }
    }
  }


  viewEntityPortal( internal_name: string, id: number ){
    // placeholder
    if( !this.dom.state.blockModal ){
      this.dom.state.blockModal = true;
      if( internal_name && +id ){
        this.srv.entity.getCoreConfig( internal_name, +id ).then( ( entityConfig: CoreConfig ) => {
          let tabMenuConfig = this._buildTabMenuConfig( entityConfig );
          tabMenuConfig.portal = true;
          let dialogRef = this.srv.dialog.open( PopEntityTabMenuComponent, {
            width: `${window.innerWidth - 20}px`,
            height: `${window.innerHeight - 50}px`,
            data: entityConfig,
            panelClass: 'sw-relative'
          } );
          let component = <PopEntityTabMenuComponent>dialogRef.componentInstance;
          component.registerTabMenuConfig( tabMenuConfig );
          this.dom.subscriber.dialog = dialogRef.beforeClosed().subscribe( () => {
            this.dom.state.blockModal = false;
            this.srv.tab.refreshEntity( this.core.params.entityId, null, {}, 'PopEntityAssignmentsComponent:viewEntityPortal' ).then( () => {
              dialogRef = null;
              tabMenuConfig = null;
              component = null;
            } );
          } );
        } );
      }
    }
  }


  viewRowProviders( row: any ){
    if( !this.dom.state.blockModal ){
      this.dom.state.blockModal = true;
      const data = [];
      const tableConfig = new TableConfig( {
        search: false,
        searchColumns: false,
        headerSticky: true,
        // paginator: 5,
        columnDefinitions: {
          name: {
            visible: true,
            helper: { text: 'Jump To: <name>', position: 'right' },
            link: 'provider',
            order: 0,
          },

          entity: {
            visible: true,
            // link: 'assigned',
            // helper: { text: 'Jump To: <name>', position: 'right' },
            order: 1,
          },

          type: {
            visible: true,
            // link: 'assigned',
            // helper: { text: 'Jump To: <name>', position: 'right' },
            order: 2,
          },
          id: {
            visible: true,
            order: 100,
          },
        },
        data: row.providers
      } );


      const dialogRef = this.srv.dialog.open( PopEntityProviderDialogComponent, {
        data: <PopEntityProviderDialogInterface>{
          table: tableConfig,
          config: this.core,
          resource: row,
        }
      } );

      this.dom.setSubscriber( 'pop-table-dialog-close', dialogRef.beforeClosed().subscribe( ( changed ) => {
        this.dom.state.blockModal = false;
        if( true ){
          this.srv.tab.refreshEntity( null, this.dom.repo, {}, 'PopEntityAssignmentsComponent:viewRowProviders' ).then( () => true );
        }
      } ) );
    }
  }


  ngOnDestroy(){
    super.ngOnDestroy();
  }


  /************************************************************************************************
   *                                                                                              *
   *                                      Under The Hood                                          *
   *                                    ( Private Method )                                        *
   *                                                                                              *
   ************************************************************************************************/

  private _buildTabMenuConfig( core: CoreConfig ){
    return GetTabMenuConfig( core, this.srv.entity.getEntityTabs( core ) );
  }


}
