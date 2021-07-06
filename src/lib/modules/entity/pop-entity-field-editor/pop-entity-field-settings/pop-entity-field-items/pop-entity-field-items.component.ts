import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { PopExtendComponent } from '../../../../../pop-extend.component';
import { CoreConfig, Dictionary, Entity, FieldGroupInterface, FieldInterface, FieldItemInterface, PopBaseEventInterface, PopRequest } from '../../../../../pop-common.model';

import { CheckboxConfig } from '../../../../base/pop-field-item/pop-checkbox/checkbox-config.model';
import { PopDomService } from '../../../../../services/pop-dom.service';
import {
  ArrayMapSetter,
  CleanObject,
  GetHttpResult,
  IsArrayThrowError,
  IsDefined,
  IsObject,
  IsObjectThrowError,
  IsString,
  StorageSetter
} from '../../../../../pop-common-utility';
import { PopFieldEditorService } from '../../pop-entity-field-editor.service';
import { EntitySchemeSectionInterface } from '../../../pop-entity-scheme/pop-entity-scheme.model';


@Component( {
  selector: 'lib-field-builder-items',
  templateUrl: './pop-entity-field-items.component.html',
  styleUrls: [ './pop-entity-field-items.component.scss' ]
} )
export class PopEntityFieldItemsComponent extends PopExtendComponent implements OnInit, OnDestroy {
  @Input() field: FieldInterface;
  @Input() scheme: EntitySchemeSectionInterface = null;
  public name = 'PopEntityFieldItemsComponent';

  protected srv = {
    field: <PopFieldEditorService>undefined
  };

  protected asset = {
    fieldgroup: <Entity>undefined,
  };

  public ui = {
    field: <FieldInterface>undefined,
    coreItems: <any[]>undefined,
    items: <any[]>undefined,
    fieldItemHelper: '',
    map: <Dictionary<any>>{},
    customSetting: <Dictionary<any>>{}
  };


  /**
   * @param el
   * @param _domRepo - transfer
   * @param _fieldRepo - transfer
   */
  constructor(
    public el: ElementRef,
    protected _domRepo: PopDomService,
    protected _fieldRepo: PopFieldEditorService
  ){
    super();

    /**
     * This should transformValue and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
     */
    this.dom.configure = (): Promise<boolean> => {
      return new Promise( ( resolve ) => {
        // #1: Enforce a CoreConfig
        this.core = IsObjectThrowError( this.core, [ 'entity' ], `${this.name}:configureDom: - this.core` ) ? this.core : null;
        // Set the height boundary

        if( !this.field ) this.field = this.core.entity;

        this._setHeight();

        // Set event Handlers
        this.dom.handler.core = ( core: CoreConfig, event: PopBaseEventInterface ) => this._coreEventHandler( event );
        // Create a container to track the active items
        this.dom.active.items = {};


        // Transfer any resources for the entityId data
        this.asset.fieldgroup = IsObjectThrowError( this.core.entity, [ 'fieldgroup' ], `${this.name}:: - this.core.entity.fieldgroup` ) ? <Entity>CleanObject( this.core.entity.fieldgroup ) : null;
        // this.asset.coreRules = {};  // the settings that can be changed
        // this.asset.coreItemModels = {}; // where the settings that can be changed are stored
        this.ui.coreItems = IsArrayThrowError( this.core.resource.items.data_values, true, `${this.name}:configureDom: - this.core.resource.items` ) ? this.core.resource.items.data_values.filter( ( item ) => {
          return !( this.srv.field.getViewIgnored( this.asset.fieldgroup.name, item.name, this.scheme ) );
        } ).map( ( value ) => CleanObject( value ) ) : [];

        this.ui.map.coreItems = ArrayMapSetter( this.ui.coreItems, 'name' );


        this.ui.fieldItemHelper = `Select which attributes will be part of this ${this.asset.fieldgroup.name} field. Click on a field to edit individual field item settings.`;
        this.ui.items = IsArrayThrowError( this.core.entity.items, true, `${this.name}:: - this.core.entity.items` ) ? this.core.entity.items.map( ( item ) => CleanObject( item ) ) : null;
        if( IsObject( this.scheme ) ){
          this.ui.items = this.ui.items.filter( ( item: FieldItemInterface ) => {
            return +item.active === 1;
          } );

        }
        this.ui.map.items = ArrayMapSetter( this.ui.items, 'name' );

        // Build the custom settings
        this._buildCustomSettings();
        // Build the Active Items for this field
        this._buildActiveItems();
        this._selectDefaultItem();
        // Select the first field attribute item so that the view will have something to render


        return resolve( true );
      } );

    };

    this.dom.proceed = (): Promise<boolean> => {
      return new Promise( ( resolve ) => {
        if( this.dom.active.labelSettings ){
          this.onActiveLabelSelection();
          setTimeout( () => {
            this.onActiveLabelSelection();
          } );
        }else if( IsObject( this.dom.active.item, [ 'id' ] ) ){
          this.onActiveItemSelection( this.dom.active.item );
          setTimeout( () => {
            this.onActiveItemSelection( this.dom.active.item );
          } );
        }else if( true ){
          this.onActiveLabelSelection();
          setTimeout( () => {
            this.onActiveLabelSelection();
          } );
        }else{
          this._selectDefaultItem();
        }
        return resolve( true );
      } );
    };
  }


  /**
   * We expect the core to represent a field
   * This component lists out all of the field attributes that this field has, and allows for the user to active/deactivate specific items.
   */
  ngOnInit(){
    super.ngOnInit();
  }


  /**
   * This handles when a user click on a checkbox to activate/deactivate a specific field attribute
   * @param event
   */
  onItemActiveChange( event: PopBaseEventInterface ){
    // #1: Make sure that change was stored in the database
    if( event.type === 'field' && event.name === 'patch' && event.success ){
      if( this.log.repo.enabled( 'event', this.name ) ) console.log( this.log.repo.message( `${this.name}:itemActiveHandler` ), this.log.repo.color( 'event' ), event );
      // #2: Update the change on the domRepo so other components can now about the change
      this.dom.repo.ui.activeItems[ event.config.id ] = +event.config.control.value;
      // #3: Send an event to the FieldBuilderPreviewComponent to update that this field attribute was activated/deactivated
      this.core.channel.next( { source: this.name, target: 'PopEntityFieldPreviewComponent', type: 'component', name: 'update' } );
    }
  }


  /**
   * This handles when a user click on a checkbox to activate/deactivate a specific field attribute
   * @param event
   */
  onEditLabelChange( event: PopBaseEventInterface ){
    console.log( 'onCustomSettingChange', event );
  }


  /**
   * On selection is an event when a user click on a specific field attribute to manage its settings
   * @param item
   */
  onActiveItemSelection( item ){
    this.log.info( `onActiveItemSelection`, item );
    if( !this.dom.state.saving && IsObject( item, [ 'id' ] ) ){
      this.dom.active.labelSettings = false;
      // #1. Build a data package to send to the FieldBuilderItemSettingsComponent component
      this.dom.active.item = item;
      // #2: Send an event with the data package to the FieldBuilderItemSettingsComponent component
      const event = <PopBaseEventInterface>{
        type: 'component',
        name: 'active-item',
        source: this.name,
        target: 'PopEntityFieldItemParamsComponent', // target specifies that specific component that should act on this event
        data: item
        // data: { item: item, models: itemModels, config: itemConfig }
      };
      this.dom.store( 'active' );
      this.core.channel.emit( event ); // core channel is the shared radio between all components on the core
    }
  }


  /**
   * On selection is an event when a user click on a specific field attribute to manage its settings
   * @param item
   */
  onActiveLabelSelection(){
    this.log.info( `onActiveLabelSelection` );
    this.dom.active[ 'item' ] = null;
    this.dom.active.labelSettings = true;
    const event = <PopBaseEventInterface>{
      type: 'component',
      name: 'label-settings',
      source: this.name,
      target: 'PopEntityFieldItemParamsComponent', // target specifies that specific component that should act on this event
      data: {}
    };
    this.core.channel.emit( event ); // core channel is the shared radio between all components on the core
    this.dom.store( 'active' );
  }


  /**
   * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
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

  /**
   * Select the the first field item available
   */
  private _selectDefaultItem(){
    if( this.ui.coreItems[ 0 ] ){
      const coreItem = this.ui.coreItems[ 0 ];
      const realItem = this.ui.items[ this.ui.map.items[ coreItem.name ] ];
      this.onActiveItemSelection( realItem );
      if( this.dom.active.item ){ // seems to need a double tap  to be consistent
        setTimeout( () => {
          this.onActiveItemSelection( realItem );
        } );
      }
    }
  }


  /**
   * This handler is for managing an cross-communication between components on the core channel
   * @param event
   */
  private _coreEventHandler( event: PopBaseEventInterface ){
    this.log.event( `_coreEventHandler`, event );
    // if( IsValidFieldPatchEvent(this.core, event) ){
    //   if( event.config.name === 'multiple' && !event.config.control.value && this.dom.active.labelSettings ){
    //     this._selectDefaultItem();
    //     // this._setHeight();
    //   }
    // }
  }


  /**
   * Build configs that control the active state for each field item
   */
  private _buildActiveItems(){
    this.dom.repo.ui.activeItems = {}; // stored on domRepo so that other components can use it

    const isScheme = IsObject( this.scheme, true );

    this.ui.coreItems.map( ( coreItem, index ) => {
      const realItem = this.ui.items[ this.ui.map.items[ coreItem.name ] ];

      if( IsObject( realItem, [ 'id', 'name' ] ) ){
        // item.required = typeof coreItem.required !== 'undefined' ? +coreItem.required : 1;
        // console.log('item', item);
        // console.log('coreItem', coreItem);
        // ToDo:: coreFieldItem needs to have required attribute

        // this.ui.map.items[ item.name ] = index;

        // item.name = SnakeToPascal(item.name);
        coreItem.required = this.srv.field.getViewRequired( this.asset.fieldgroup.name, realItem.name );
        if( coreItem.required ) realItem.active = 1;

        let itemActive = +realItem.active;
        if( isScheme ){
          const schemeFieldItemSession = this.srv.field.getSchemeFieldItemMapping( this.scheme, +this.field.id, realItem.id );
          console.log( 'schemeFieldItemSession', realItem.id, schemeFieldItemSession );
          if( IsDefined( schemeFieldItemSession.active ) ){
            itemActive = +schemeFieldItemSession.active;
          }
        }
        this.dom.active.items[ realItem.id ] = new CheckboxConfig( {
          id: realItem.id,
          name: 'active',
          align: 'left',
          disabled: coreItem.required || !this.core.access.can_update ? true : false,
          value: itemActive,
          facade: isScheme,
          patch: coreItem.required ? null : {
            field: 'active',
            path: isScheme ? null : `fields/customs/${realItem.id}`,
            displayIndicator: true,
            callback: isScheme ? async( core: CoreConfig, event ) => {
              const session = this.srv.field.getSchemeFieldItemMapping( this.scheme, +this.field.id, realItem.id );
              if( IsObject( session ) ){
                session.active = event.config.control.value;
                await this.srv.field.updateSchemeFieldMapping( this.scheme );
              }
            } : null
          },
        } );

        this.dom.repo.ui.activeItems[ realItem.id ] = +realItem.active;
      }
    } );
  }


  /**
   * Build the configs for any relevant custom settings
   * @private
   */
  private _buildCustomSettings(){
    if( IsObject( this.field.custom_setting, [ 'edit_label' ] ) ){
      const setting = this.field.custom_setting.edit_label;

      this.ui.customSetting[ 'edit_label' ] = new CheckboxConfig( {
        id: setting.id,
        align: 'left',
        name: 'edit_label',
        disabled: true,
        value: true,
        metadata: { setting: setting },
        facade: true,
        patch: {
          field: ``,
          path: ``,
          callback: ( core: CoreConfig, event: PopBaseEventInterface ) => {
            this.dom.state.saving = true;
            if( IsObject( this.scheme, true ) ){
              console.log( 'save setting to a scheme' );
              console.log( 'event', event );
              console.log( 'setting', setting );
            }else{
              this.srv.field.storeCustomSetting( core, event ).then( ( res ) => {
                if( IsString( res, true ) ){
                  this.ui.customSetting[ 'edit_label' ].message = res;
                }
                this.dom.setTimeout( 'allow-save', () => {
                  this.dom.state.saving = false;
                }, 500 );
              } );
            }
          }

        }
      } );
    }
  }


  /**
   * Determine the layout height to control overflow
   *
   */
  private _setHeight(){
    this.dom.overhead = 135;
    // this.dom.height.outer = +this.dom.repo.position[ this.position ].height - 121;
    // const field = <FieldInterface>this.core.entity;
    //
    // if( false && field.multiple ){
    //   this.dom.height.outer -= 20;
    //   this.dom.height.outer -= ( +field.multiple_min * 60 );
    // }
    // if( this.dom.height.outer < 400 ) this.dom.height.outer = 400;
    this.dom.setHeight( 400, this.dom.overhead );
  }

}
