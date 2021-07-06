import { Injectable, OnDestroy } from '@angular/core';
import {
  CoreConfig, Entity, EntityActionDataInterface, EntityActionInterface, EntityExtendInterface,
  FieldInterface,
  FieldItemPatchInterface, PopLog,
  PopTemplate, ServiceInjector,
} from '../../../pop-common.model';
import { EvaluateWhenConditions, FieldItemModel, ParseLinkUrl, ParseModelValue } from '../pop-entity-utility';
import { FieldItemGroupConfig, FieldItemGroupDialogInterface } from '../../base/pop-field-item-group/pop-field-item-group.model';
import {
  DeepMerge,
  DynamicSort,
  GetHttpResult,
  IsCallableFunction,
  IsDefined,
  IsNumber,
  IsObject,
  IsString,
  JsonCopy,
  SnakeToPascal,
  TitleCase
} from '../../../pop-common-utility';
import { PopEntityUtilFieldService } from './pop-entity-util-field.service';
import { PopExtendService } from '../../../services/pop-extend.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PopActionDialogComponent } from '../../base/pop-dialogs/pop-action-dialog/pop-action-dialog.component';


@Injectable( {
  providedIn: 'root'
} )
export class PopEntityActionService extends PopExtendService implements OnDestroy {
  name = 'PopEntityActionService';


  protected srv = {
    dialog: <MatDialog>ServiceInjector.get( MatDialog ),
    field: <PopEntityUtilFieldService>ServiceInjector.get( PopEntityUtilFieldService )
  };

  protected asset = {
    dialogRef: <MatDialogRef<PopActionDialogComponent>>undefined,
    field: <PopEntityUtilFieldService>ServiceInjector.get( PopEntityUtilFieldService )
  };


  constructor(){
    super();
  }


  do( core: CoreConfig, action: string | EntityActionInterface, extension?: EntityExtendInterface, blockEntity = false ): Promise<Entity>{
    return new Promise<Entity>( async( resolve ) => {
      if( !this.asset.dialogRef && this._checkArgs( core, action ) ){
        this.asset.dialogRef = this.srv.dialog.open( PopActionDialogComponent, {
          disableClose: true,
          width: extension && extension.width ? ( IsNumber( extension.width ) ? `${extension.width}px` : `${extension.width}` ) : '400px',
          data: <EntityActionDataInterface>{
            core: core,
            extension: extension,
            actionName: IsString( action, true ) ? action : null,
            action: IsObject( action, true ) ? action : null,
          },
          panelClass: 'sw-mat-dialog-flex'
        } );

        this.dom.setSubscriber( 'pop-action-dialog-close', this.asset.dialogRef.beforeClosed().subscribe( ( res: any ) => {
          res = GetHttpResult( res );
          this.asset.dialogRef = null;
          return resolve( res );
        } ) );
      }else{
        return resolve( null );
      }
    } );

  }


  private _checkArgs( core: CoreConfig, action: string | EntityActionInterface, extension?: EntityExtendInterface ){
    if( IsObject( core, [ 'params', 'access' ] ) ){
      if( IsString( action, true ) || IsObject( action, [ 'name' ] ) ){
        return true;
      }
    }
    return false;
  }


  /**
   * A helper method that sets up a FieldGroupConfig for a create/new pop-table-dialog
   * @param entityConfig
   * @param goToUrl
   */
  doAction( core: CoreConfig, actionName: string, extension?: EntityExtendInterface ): Promise<FieldItemGroupConfig>{
    return new Promise( async( resolve ) => {
      PopTemplate.buffer();
      if( IsObject( core.repo.model.action, [ actionName ] ) && IsObject( core.repo.model.action[ actionName ], true ) ){

        const action = core.repo.model.action[ actionName ];
        PopLog.info( this.name, `doAction`, { core: core, actionName: actionName, action: action, extension: extension } );
        const actionItems = [];
        let needsResource = false;
        let model;

        const actionFieldItems = {};

        // start with getting fields labeled for new doAction
        if( IsObject( action.fields, true ) ){
          Object.keys( action.fields ).map( ( name ) => {
            let field = <FieldInterface>{};
            if( name in core.repo.model.field ){
              field = <any>core.repo.model.field[ name ];
            }
            model = {};
            if( field.when ) model.when = JsonCopy( field.when );

            if( IsObject( field.model, true ) ){
              model = Object.assign( model, field.model );
            }
            let actionTransformation;
            if( IsObject( action.fields[ name ], true ) ){
              actionTransformation = IsString( action.fields[ name ].transformation, true ) ? action.fields[ name ].transformation : null;
              model = Object.assign( model, action.fields[ name ] );
            }
            // delete model.metadata;
            delete model.transformation;
            if( actionTransformation ) model.transformation = actionTransformation; // only want to apply transformation if it was set directly on action

            model.value = IsDefined( model.value ) ? ParseModelValue( model.value, core ) : null;
            // model.value = IsDefined( model.value ) ? ParseModelValue(model.value, core) : null;
            if( !model.value && IsObject( model.options, [ 'defaultValue' ] ) ){
              model.value = ParseModelValue( model.options.defaultValue, core );
            }
            model.hidden = !EvaluateWhenConditions( core, model.when, core );

            if( IsObject( extension, true ) && model.name in extension ){
              model.value = ParseModelValue( extension[ model.name ] );
              model.readonly = true;
            }

            model.tabOnEnter = true;
            actionFieldItems[ name ] = model;
            if( model.options && model.options.resource ){
              needsResource = true;
            }
          } );
        }

        // if needsMetadata go grab it before you try to build out the fields
        if( needsResource ){
          const resource = await core.repo.getUiResource( core );
          if( IsObject( resource, true ) ) DeepMerge( core.resource, resource );
          PopLog.init( this.name, `doAction:needed resource`, resource );
          Object.keys( actionFieldItems ).map( ( name ) => {
            const actionItemModel = FieldItemModel( core, actionFieldItems[ name ], false );
            const actionItem = this.srv.field.buildCoreFieldItem( core, actionItemModel );
            if( IsObject( actionItem.config, true ) ){
              actionItem.config.facade = true;
              if( IsObject( actionItem.config.patch ) ){
                const patch = <FieldItemPatchInterface>actionItem.config.patch;
                patch.duration = 0;
                patch.path = null;
                patch.displayIndicator = false;
              }
            }
            actionItems.push( actionItem );
          } );

          PopTemplate.clear();
          console.log('actionItems', actionItems);
          return resolve( this.getActionDialogConfig( core, action, actionItems, core.resource, ) );

        }else{
          // no metadata was needed for any of these fields
          Object.keys( actionFieldItems ).map( ( name ) => {
            const actionItemModel = FieldItemModel( core, actionFieldItems[ name ], false );
            const actionItem = this.srv.field.buildCoreFieldItem( core, actionItemModel );

            if( IsObject( actionItem.config, true ) ){
              actionItem.config.facade = true;
              if( IsObject( actionItem.config.patch ) ){
                const patch = <FieldItemPatchInterface>actionItem.config.patch;
                patch.duration = 0;
                patch.path = null;
                patch.displayIndicator = false;
              }
            }
            actionItems.push( actionItem );
          } );
          PopTemplate.clear();
          console.log('actionItems', actionItems);
          const actionConfig = this.getActionDialogConfig( core, action, actionItems, ( IsObject( core.entity, true ) ? core.entity.ui : {} ) )
          PopLog.info( this.name, `doAction: config`, actionConfig );
          return resolve( actionConfig );
        }
      }else{
        PopTemplate.clear();
        PopTemplate.error( { message: `${TitleCase( actionName )} not configured.`, code: 500 } );
        return resolve( null );
      }
    } );
  }


  /**
   * Callback helper to newEntity
   * @param entityConfig
   * @param fields
   * @param metadata
   * @param goToUrl
   */
  getActionDialogConfig( core: CoreConfig, action: EntityActionInterface, actionFieldItems, metadata, extension?: EntityExtendInterface ): FieldItemGroupConfig{
    if( !IsObject( extension ) ) extension = {};
    actionFieldItems.sort( DynamicSort( 'sort' ) );
    let goToUrl = IsString( extension.goToUrl, true ) ? extension.goToUrl : ( action.goToUrl ? action.goToUrl : null );
    if( goToUrl ) goToUrl = ParseModelValue( goToUrl, core, true );

    let postUrl = IsString( extension.postUrl, true ) ? extension.postUrl : ( action.postUrl ? ParseLinkUrl( String( action.postUrl ).slice(), ( IsObject( core.entity, true ) ? core.entity : {} ) ) : core.params.path );
    if( postUrl ) postUrl = ParseModelValue( postUrl, core, true );

    const dialogConfig = new FieldItemGroupConfig( {
      id: action.name,
      params: core.params,
      fieldItems: actionFieldItems,
      metadata: metadata,
      inDialog: <FieldItemGroupDialogInterface>{
        postUrl: postUrl,
        postUrlVersion: 1,
        submit: TitleCase( action.submitText ),
        title: action.header ? action.header : `${TitleCase( action.name )} ${ SnakeToPascal( core.repo.getDisplayName() ) }`,
        goToUrl: goToUrl,
        callback: IsCallableFunction( action.callback ) ? action.callback : null
      }
    } );

    PopLog.init( this.name, `ActionDialog`, dialogConfig );

    return dialogConfig;
  }


  ngOnDestroy(){
    super.ngOnDestroy();
  }


}


