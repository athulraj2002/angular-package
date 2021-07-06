import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { SideBySideConfig, SideBySideOptionInterface } from './pop-side-by-side.model';
import { PopConfirmationDialogComponent } from '../pop-dialogs/pop-confirmation-dialog/pop-confirmation-dialog.component';
import { of } from 'rxjs';
import { PopContextMenuConfig } from '../pop-context-menu/pop-context-menu.model';
import { PopExtendComponent } from '../../../pop-extend.component';
import { Dictionary, PopBaseEventInterface, PopRequest, PopTemplate, ServiceInjector } from '../../../pop-common.model';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { PopDomService } from '../../../services/pop-dom.service';
import { ArrayMapSetter, GetHttpErrorMsg, InterpolateString, IsArray, IsCallableFunction, IsObject, ObjectContainsTagSearch, PopUid, Sleep } from '../../../pop-common-utility';
import { PopEntityUtilParamService } from '../../entity/services/pop-entity-util-param.service';
import { PopTableDialogComponent } from '../pop-dialogs/pop-table-dialog/pop-table-dialog.component';


@Component( {
  selector: 'lib-pop-side-by-side',
  templateUrl: './pop-side-by-side.component.html',
  styleUrls: [ './pop-side-by-side.component.scss' ],
} )
export class PopSideBySideComponent extends PopExtendComponent implements OnInit, OnDestroy {
  @Input() config: SideBySideConfig;

  public name = 'PopSideBySideComponent';

  protected srv: {
    dialog: MatDialog,
    router: Router,
    param: PopEntityUtilParamService,
  } = {
    dialog: ServiceInjector.get( MatDialog ),
    param: ServiceInjector.get( PopEntityUtilParamService ),
    router: ServiceInjector.get( Router ),
  };

  availableFilterValue = '';
  assignedFilterValue = '';

  constructor(
    public el: ElementRef,
    protected _domRepo: PopDomService,
  ){
    super();


    this.dom.configure = (): Promise<boolean> => {
      return new Promise( async( resolve ) => {
        this.id = this.config.id ? this.config.id : PopUid();
        this._trackAssignedOptions();
        this._setHooks();
        this._setContextMenu();
        this._checkForAssignedOptions();
        return resolve( true );
      } );
    };

    this.dom.proceed = (): Promise<boolean> => {
      return new Promise( async( resolve ) => {
        await this._setHeight();
        return resolve( true );
      } );
    };
  }


  /**
   * This component should have a purpose
   */
  ngOnInit(){
    super.ngOnInit();
  }


  /**
   * Filter Utility
   * @param type
   * @param filter
   */
  onApplyFilter( type: string, filter: string ){
    this.dom.setTimeout( 'apply-filter', () => {
      if( this.config.filterBoth ){
        this.onFilterBoth( filter );
        this.assignedFilterValue = filter;
        this.availableFilterValue = filter;
      }else{
        if( type === 'assigned' ){
          this._filterAssignedOptions( filter );
          this.assignedFilterValue = filter;
        }else{
          this._filterAvailableOptions( filter );
          this.availableFilterValue = filter;
        }
      }
      this.onBubbleEvent( 'apply-filter', null, { method: type, value: filter } );
    }, 200 );
  }


  /**
   * Filter both columns
   */
  onFilterBoth( filter: string ){
    this.config.options.values.map( option => {
      option.assignedFilter = option.optionFilter = !ObjectContainsTagSearch( option, filter );
    } );
  }


  /**
   * Assign a specific option
   */
  onOptionAssign( option: SideBySideOptionInterface, confirmed = false ): Promise<boolean>{
    return new Promise<boolean>( async( resolve ) => {
      if(!this.config.disabled){
      if( IsObject( option, true ) && !this.ui.assigned[ option.value ] && !option.optionBlock && !option.optionFilter ){
        if( this.config.facadeEvent ){
          this.onBubbleEvent( 'facadeEvent', 'Facade Event has been triggered', {
            method: 'remove',
            options: [ option ],
            ids: [ +option.value ]
          }, true );
          return resolve( true );
        }else{
          await this._assign( [ option ], confirmed );
          return resolve( true );
        }
      }else{
        return resolve( true );
      }}
    } );
  }


  /**
   * Assign all options
   */
  onAssignAllOptions( confirmed = false ): Promise<boolean>{
    return new Promise<boolean>( async( resolve ) => {
      const options = this.config.options.values.filter( option => {
        return !this.ui.assigned[ option.value ] && !option.optionBlock && !option.optionFilter;
      } );
      if( !options.length ){
        return resolve( true );
      }
      if( this.config.facadeEvent ){
        this.onBubbleEvent( 'facadeEvent', 'Facade Event has been triggered', {
          method: 'assign',
          options: options,
          ids: options.map( o => +o.value )
        }, true );
        return resolve( true );
      }else{
        await this._assign( options, confirmed );
        return resolve( true );
      }
    } );
  }


  /**
   * Remove an option that is assigned
   * @param option
   * @param confirmed
   */
  onRemoveOption( option: SideBySideOptionInterface, confirmed = false ): Promise<boolean>{
    return new Promise<boolean>( async( resolve ) => {
      if(!this.config.disabled){
      if( IsObject( option ) ){
        if( this.config.facadeEvent ){
          this.onBubbleEvent( 'facadeEvent', 'Facade Event has been triggered', {
            method: 'remove',
            options: [ option ],
            ids: [ +option.value ]
          }, true );
          return resolve( true );
        }else{
          await this._remove( [ option ], confirmed );
          return resolve( true );
        }
      }else{
        return resolve( true );
      }
    }
    } );
  }


  /**
   * Remove all options that are assigned
   */
  onRemoveAllOptions( confirmed = false ): Promise<boolean>{
    return new Promise<boolean>( async( resolve ) => {
      this.config.patch.removeErrMessage = '';
      const options = [];
      this.config.options.values.map( option => {
        if( this.ui.assigned[ option.value ] && !option.assignedFilter ){
          option.patching = true;
          options.push( option );
        }
      } );
      if( !options.length ){
        return resolve( true );
      }
      if( this.config.facadeEvent ){
        this.onBubbleEvent( 'facadeEvent', 'Facade Event has been triggered', {
          method: 'remove',
          options: options,
          ids: options.map( o => +o.value )
        }, true );
        return resolve( true );
      }else{
        await this._remove( options, confirmed );
        return resolve( true );
      }
    } );
  }


  /**
   * Go to linked route of option
   * @param option
   */
  onNavigateToOptionRoute( option: SideBySideOptionInterface ){
    if( this.config.route ){
      let route = this.config.route.slice();
      route = String( route ).replace( /:value/g, '' + option.value ).replace( /:name/g, option.name );

      this.srv.router.navigateByUrl( route ).then( data => {
      } )
        .catch( e => {
          // const errMessage = 'Route not found:' + route;
          // console.log(e);
          this.events.emit( { source: this.name, type: 'context_menu', name: 'portal', data: route, config: this.config } );
          // option.errMessage = errMessage;
          // setTimeout(() => {
          //   if( option.errMessage === errMessage ) option.errMessage = '';
          // }, 2000);
        } );
    }
  }


  /**
   * Intercept the user right mouse click to show a context menu for this component
   * @param option
   * @param event
   */
  onMouseRightClick( option, event: MouseEvent ){
    let route = this.config.route.slice();
    route = String( route ).replace( /:value/g, '' + option.value ).replace( /:name/g, option.name );

    if( !route ) return false;

    // if we haven't returned, prevent the default behavior of the right click.
    event.preventDefault();

    const context = this.dom.contextMenu.config;

    // reset the context menu, and configure it to load at the position clicked.
    context.resetOptions();

    // if(this.config.internal_name) this.dom.contextMenu.addPortalOption(this.config.internal_name, +row.entityId);
    const api_path = route.split( '/' )[ 0 ];
    const entityParams = this.srv.param.getEntityParamsWithPath( api_path, option.value );
    if( entityParams ) context.addPortalOption( entityParams.internal_name, entityParams.entityId );

    context.addNewTabOption( route );

    context.x = event.clientX;
    context.y = event.clientY;
    context.toggle.next( true );
  }


  onBubbleEvent( eventName: string, message: string = null, extend: Dictionary<any> = {}, force = false ): PopBaseEventInterface{
    const event = <PopBaseEventInterface>{
      type: 'field',
      name: eventName,
      source: this.name
    };
    if( this.config ) event.config = this.config;
    if( message ) event.message = message;
    Object.keys( extend ).map( ( key ) => {
      event[ key ] = extend[ key ];
    } );
    this.log.event( `onBubbleEvent`, event );
    if( this.config.bubble || force ){
      this.events.emit( event );
    }

    return event;
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
   *                                    ( Private Method )                                        *
   *                                                                                              *
   ************************************************************************************************/

  private _assign( options: SideBySideOptionInterface[], confirmed = false ): Promise<any>{
    return new Promise<boolean>( async( resolve ) => {
      this._beforePatch( options );
      if( this.config.facade ){
        await Sleep( 500 );
        this._onAssignSuccess( options );
        return resolve( true );
      }else if( this.config.patch.path && this.config.patch.field ){
        const request = this._getRequest( 'assign', this._getRequestBody( 'assign', options, confirmed ) );
        request.subscribe( async( res: any ) => {
          if( res.data ) res = res.data;
          if( res.confirmation ){
            const isConfirmed = await this._confirmAction( res.confirmation );
            if( isConfirmed ){
              this._assign( options, true ).then( () => true );
            }
          }else{
            this._onAssignSuccess( options );
            this.onBubbleEvent( 'patch', 'Patched', {
              success: true,
              method: 'assign',
              ids: options.map( o => o.value ),
              value: this.config.assigned
            }, true );
          }
          return resolve( res );
        }, ( err ) => {
          this._handleAssignError( err );
          this._onAssignFail( options );
          return resolve( false );
        } );
      }else{
        this._onAssignSuccess( options );
        return resolve( true );
      }
    } );
  }


  private _remove( options: SideBySideOptionInterface[] = [], confirmed = false ): Promise<any>{
    return new Promise<boolean>( async( resolve ) => {
      this._beforePatch( options );
      if( this.config.facade ){
        await Sleep( 500 );
        this._onRemoveSuccess( options );
        return resolve( true );
      }else if( this.config.patch.path && this.config.patch.field ){
        if(!confirmed && this.config.patch.conflictPath){


          const value = options[0].value;
          // const path = 'users/12/roles/1/conflicts';

          const path = InterpolateString( this.config.patch.conflictPath,{value:value});
          // users/{entityId}/roles/{value}/conflicts
          PopRequest.doPost(path , {}).subscribe( async (res:any)=>{
            if(res.data) res=res.data;
            if(IsArray(res,true)){
              options.map( ( option ) => {
                option.patching = false;
              } );
              const isConfirmed = await this._confirmAction( res[0] );
              if( isConfirmed ){
                this._remove( options, true ).then( () => true );
              }
            } else {
              this._remove( options, true ).then( () => true );
            }

          })

        } else {
          const request = this._getRequest( 'remove', this._getRequestBody( 'remove', options, confirmed ) );
          request.subscribe( async( res: any ) => {
            if( res.data ) res = res.data;

              this._onRemoveSuccess( options );
              this.onBubbleEvent( 'patch', 'Patched', {
                success: true,
                method: 'remove',
                ids: options.map( o => o.value ),
                value: this.config.assigned
              }, true );


            return resolve( res );
          }, ( err ) => {
            this._handleRemoveError( err );
            this._onRemoveFail( options );
          } );
        }

      }else{
        this._onRemoveSuccess( options );
        return resolve( true );
      }
    } );
  }

  private _getRequestBody( method: 'assign' | 'remove', options: SideBySideOptionInterface[], confirmed = false ){

    if( this.config.patch.field ){

    }
    const body = {};
    if( this.config.patch.metadata ){
      for( const i in this.config.patch.metadata ){
        if( !this.config.patch.metadata.hasOwnProperty( i ) ) continue;
        body[ i ] = this.config.patch.metadata[ i ];
      }
    }
    body[ this.config.patch.field ] = options.map( o => o.value );
    body[ 'method' ] = method;
    body[ 'confirmed' ] = confirmed;

    return body;
  }


  private _getRequest( method: 'assign' | 'remove', body: object = {} ){
    let path = this.config.patch.path;
    const ignore401 = ( this.config.patch.ignore401 ? true : null );
    const version = ( this.config.patch.version ? this.config.patch.version : 1 );
    const post = {};
    if( this.config.patch.metadata ){
      for( const i in this.config.patch.metadata ){
        if( !this.config.patch.metadata.hasOwnProperty( i ) ) continue;
        post[ i ] = this.config.patch.metadata[ i ];
      }
    }
    if(this.config.patch.addId){
      const id =  body[ this.config.patch.field ][0] ;
      path = InterpolateString( this.config.patch.path,{id:id});

    }

    if( method === 'assign' ){
      switch( String( this.config.patch.assignMethod ).toLowerCase() ){
        case 'patch':
          return PopRequest.doPatch( `${ path}`, body, version, ignore401 );
          break;
        case 'post':
          return PopRequest.doPost( `${ path }`, body, version, ignore401 );
          break;
        default:
          return PopRequest.doPost( `${ path}`, body, version, ignore401 );
          break;
      }

    }else{
      switch( String( this.config.patch.removedMethod ).toLowerCase() ){
        case 'patch':
          return PopRequest.doPatch( `${ path}`, body, version, ignore401 );
          break;
        case 'post':
          return PopRequest.doPost( `${ path}`, body, version, ignore401 );
          break;
        case 'delete':
          return PopRequest.doDelete( `${ path}`, body, version, ignore401 );
          break;
        default:
          return PopRequest.doDelete( `${ path}`, body, version, ignore401 );
          break;
      }
      return PopRequest.doDelete( `${ path}`, body, version, ignore401 );
    }
  }


  private _handleAssignError( err: any ){
    this.config.patch.assignErrMessage = GetHttpErrorMsg( err );
    this.config.patch.running = false;
  }


  private _handleRemoveError( err: any ){
    this.config.patch.removeErrMessage = GetHttpErrorMsg( err );
    this.config.patch.running = false;
  }


  private _onAssignSuccess( options: any[] = [] ){
    this.config.patch.running = false;
    options.map( option => {
      this.ui.assigned[ option.value ] = 1;
      option.patching = false;
    } );
    this._checkForAssignedOptions();
    const event = this.onBubbleEvent( 'assign', 'Assigned', {
      method: 'assign',
      ids: options.map( o => o.value ),
      value: this.config.assigned
    } );
    if( IsCallableFunction( this.config.patch.callback ) ){
      this.config.patch.callback(this.core, event );
    }
  }


  private _beforePatch( options: SideBySideOptionInterface[] = [] ){
    this.config.patch.removeErrMessage = '';
    this.config.patch.running = true;
    options.map( ( option ) => {
      option.patching = true;
      option.errMessage = '';
    } );
  }

  private _formatConflictData(conflictData:any[]){
    const tableData = conflictData.map(pods=>{
      return {  pod:pods.name, title:pods.pivot.is_leader?'Leader':'Member'}
    });
    return tableData;
  }
  private _confirmAction( conflictData:any[]): Promise<boolean>{
    return new Promise<boolean>( ( resolve ) => {
      const tableData = this._formatConflictData(conflictData);
      this.srv.dialog.open( PopTableDialogComponent, {
        width: '500px',
        data: {
          data: tableData,
          type:'sideBySide',
          table:this.config.patch.conflictTableConfig,
          message: this.config.patch.conflictMessage,
          header:this.config.patch.conflictHeader?this.config.patch.conflictHeader:''
        }
      } ).afterClosed().subscribe( res => {
        return resolve( res ? true : false );
      } );
    } );
  }


  private _onAssignFail( options: SideBySideOptionInterface[] = [] ){
    this.config.patch.running = false;
    options.map( option => {
      delete this.ui.assigned[ option.value ];
      option.patching = false;
    } );
    this._checkForAssignedOptions();
  }


  private _onRemoveFail( options: SideBySideOptionInterface[] = [] ){
    this.config.patch.running = false;
    options.map( option => {
      this.ui.assigned[ option.value ] = 1;
      option.patching = false;
    } );
    this._checkForAssignedOptions();
  }


  private _onRemoveSuccess( options: SideBySideOptionInterface[] = [] ){
    this.config.patch.running = false;
    options.map( option => {
      delete this.ui.assigned[ option.value ];
      option.patching = false;
    } );
    this._checkForAssignedOptions();

    const event = this.onBubbleEvent( 'remove', 'Removed',
      {
        method: 'remove',
        ids: options.map( o => o.value ),
        value: this.config.assigned
      }
    );
    if( IsCallableFunction( this.config.patch.callback ) ){
      this.config.patch.callback( this.core, event );
    }
  }


  /**
   * Helper function that naivgates the complexity of the setting the heights needed in this component
   */
  private _setHeight(){
    return new Promise( ( resolve ) => {
      this.dom.overhead = 2;
      if( this.config.hasHeader ) this.dom.overhead += 38;
      if( this.config.hasFilterRow ) this.dom.overhead += 49;
      if( this.config.hasLabelRow ) this.dom.overhead += 45;

      if( !this.config.height ) this.config.height = PopTemplate.getContentHeight( false, 270 );


      let tabColumnHeight = this.dom.repo.getComponentHeight( 'PopEntityTabColumnComponent', this.position );
      if( !tabColumnHeight ) tabColumnHeight = this.dom.repo.getComponentHeight( 'PopTabMenuComponent', 1 );
      if( tabColumnHeight && tabColumnHeight.inner ){
        this.dom.height.default = tabColumnHeight.inner - 20;
      }else{
        this.dom.height.default = PopTemplate.getContentHeight( false, this.dom.overhead );
      }

      if( this.config.parentClassName ){
        this.dom.overhead = this.dom.overhead + ( Math.abs( this.el.nativeElement.offsetTop ) + 100 );
        this.dom.setHeightWithParent( this.config.parentClassName, this.dom.overhead, this.dom.height.default ).then( ( res ) => {
          this.log.info( `setHeight with ${ this.config.parentClassName }` );
          return resolve( true );
        } );
      }else{
        if( this.config.height ){
          // if( this.config.height < ( this.dom.overhead * 2 ) ) this.config.height = this.dom.overhead * 2;
          this.dom.setHeight( this.config.height, this.dom.overhead );
          this.log.info( `setHeight with config.height:${ this.config.height } - overhead:${ this.dom.overhead }` );
        }else if( this.config.bucketHeight ){
          this.config.height = this.config.bucketHeight + this.dom.overhead;
          this.dom.setHeight( +this.config.height, this.dom.overhead );
          this.log.info( `setHeight with config.bucketHeight:${ this.config.bucketHeight } - overhead:${ this.dom.overhead }` );
        }else if( this.config.bucketLimit ){
          this.config.bucketLimit = this.config.bucketLimit > this.config.options.values.length ? this.config.options.values.length : this.config.bucketLimit;
          this.config.bucketHeight = ( this.config.bucketLimit * 30.5 );
          this.config.height = this.config.bucketHeight + this.dom.overhead;
          this.dom.setHeight( +this.config.height, this.dom.overhead );
          this.log.info( `setHeight with config.bucketLimit:${ this.config.bucketLimit } - overhead:${ this.dom.overhead }` );
        }else{
          this.log.info( `setHeight with defaultHeight:${ this.dom.height.default } - overhead:${ this.dom.overhead }` );
          this.dom.setHeight( this.dom.height.default, this.dom.overhead );
        }
        return resolve( true );
      }

    } );
  }


  /**
   * This will block certain options from being available
   * @param bucket
   * @param ids
   */
  private _blockBucketOptions( bucket: string, ids: any[] ){
    if( [ 'assign', 'option', 'both' ].includes( bucket ) ){
      const map = ArrayMapSetter( this.config.options.values, 'value' );
      ids.map( ( id ) => {
        if( id in map ){
          if( bucket === 'assign' ){
            this.config.options.values[ map[ id ] ].assignBlock = true;
          }else if( bucket === 'option' ){
            this.config.options.values[ map[ id ] ].optionBlock = true;
          }else{
            this.config.options.values[ map[ id ] ].assignBlock = true;
            this.config.options.values[ map[ id ] ].optionBlock = true;
          }
        }
      } );
    }
  }


  /**
   * This will un-block certain options from being available
   * @param bucket
   * @param ids
   */
  private _unblockBucketOptions( bucket: string, ids: any[] ){
    if( [ 'assign', 'option', 'both' ].includes( bucket ) ){
      const map = ArrayMapSetter( this.config.options.values, 'value' );
      ids.map( ( id ) => {
        if( id in map ){
          if( bucket === 'assign' ){
            this.config.options.values[ map[ id ] ].assignBlock = false;
          }else if( bucket === 'option' ){
            this.config.options.values[ map[ id ] ].optionBlock = false;
          }else{
            this.config.options.values[ map[ id ] ].assignBlock = false;
            this.config.options.values[ map[ id ] ].optionBlock = false;
          }
        }
      } );
    }
  }


  /**
   * Allow other modules to trigger certain functionality
   * @param option
   * @param event
   */
  private _setHooks(){
    this.config.assign = ( options: SideBySideOptionInterface[], confirmed = false ) => {
      return this._assign( options, confirmed );
    };

    this.config.remove = ( options: SideBySideOptionInterface[], confirmed = false ) => {
      return this._remove( options, confirmed );
    };
    this.config.removeAllOptions = () => {
      return of( this.onRemoveAllOptions() );
    };
    this.config.addAllOptions = () => {
      return of( this.onAssignAllOptions() );
    };
    this.config.applyFilter = ( type, filter ) => {
      this.onApplyFilter( type, filter );
    };

    this.config.getAssigned = () => {
      return this.config.assigned.slice();
    };

    this.config.block = ( bucket: string, ids: any[] ) => {
      this._blockBucketOptions( bucket, ids );
    };
    this.config.unblock = ( bucket: string, ids: any[] ) => {
      this._unblockBucketOptions( bucket, ids );
    };
  }


  /**
   * Intercept the user right mouse click to show a context menu for this component
   * @param option
   * @param event
   */
  private _setContextMenu(){
    this.dom.contextMenu.config = new PopContextMenuConfig();
    this.dom.setSubscriber( 'context-menu', this.dom.contextMenu.config.emitter.subscribe( ( event: PopBaseEventInterface ) => {
      this.log.event( `context-menu`, event );
      this.events.emit( event );
    } ) );
  }


  /**
   * Get the count of assigned options
   */
  private _checkForAssignedOptions(){
    this.config.assigned = Object.keys( this.ui.assigned );
    this.ui.assignedCount = this.config.assigned.length;
    this.ui.optionsCount = this.config.options.values.length;
    if(this.ui.assignedCount == this.ui.optionsCount) this.ui.optionsCount = 0
  }


  /**
   * Filter assigned options
   * @param filter
   */
  private _filterAssignedOptions( filter: string ){

    this.config.options.values.map( option => {
      option.assignedFilter = !ObjectContainsTagSearch( option, filter );
    } );


  }


  /**
   * Filter un-assigned options
   * @param filter
   */
  private _filterAvailableOptions( filter: string ){
    this.config.options.values.map( option => {
      option.optionFilter = !ObjectContainsTagSearch( option, filter );
    } );
  }


  /**
   * Set the intial state of the assigned options
   */
  private _trackAssignedOptions(){
    this.ui.assigned = {};
    this.config.assigned.map( optionID => {
      this.ui.assigned[ optionID ] = 1;
    } );
  }


}
