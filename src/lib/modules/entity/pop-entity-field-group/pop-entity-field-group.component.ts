import { Component, ComponentRef, ElementRef, Input, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { PopExtendDynamicComponent } from '../../../pop-extend-dynamic.component';
import {
  CoreConfig,
  DynamicComponentInterface,
  FieldGroupInterface,
  FieldInterface,
  PopBaseEventInterface,
  ServiceInjector
} from '../../../pop-common.model';
import { PopEntityUtilFieldService } from '../services/pop-entity-util-field.service';
import { EvaluateWhenCondition, IsValidFieldPatchEvent } from '../pop-entity-utility';
import { ConvertArrayToOptionList, IsArray, IsObject, IsObjectThrowError, StorageGetter } from '../../../pop-common-utility';
import { PopDomService } from '../../../services/pop-dom.service';
import { PopTabMenuService } from '../../base/pop-tab-menu/pop-tab-menu.service';


@Component( {
  selector: 'lib-pop-entity-field-group',
  templateUrl: './pop-entity-field-group.component.html',
  styleUrls: [ './pop-entity-field-group.component.scss' ]
} )
export class PopEntityFieldGroupComponent extends PopExtendDynamicComponent implements OnInit, OnDestroy {
  public name = 'PopEntityFieldGroupComponent';
  @Input() position = 1;
  @Input() fieldType: 'custom' | 'table' = null;
  @Input() public interface: FieldGroupInterface; // relies on top level component to set
  @ViewChild( 'container', { read: ViewContainerRef, static: true } ) private container;


  protected srv = {
    field: <PopEntityUtilFieldService>ServiceInjector.get( PopEntityUtilFieldService ),
    tab: <PopTabMenuService>undefined
  };


  constructor(
    public el: ElementRef,
    protected _domRepo: PopDomService,
    protected _tabRepo: PopTabMenuService,
  ){
    super();

    this.dom.configure = (): Promise<boolean> => {
      return new Promise( async( resolve ) => {
        this.core = IsObjectThrowError( this.core, true, `${this.name}:configure: - this.core` ) ? this.core : null;
        // handles events
        this.trait.bubble = true;
        this.dom.handler.bubble = ( core: CoreConfig, event: PopBaseEventInterface ) => this.onBubbleEvent( event );
        // this.dom.handler.core = ( core: CoreConfig, event: PopBaseEventInterface ) => this._coreEventHandler( event );
        this.id = this.position;
        return resolve( true );
      } );
    };

    this.dom.proceed = (): Promise<boolean> => {
      return new Promise( async( resolve ) => {
        this.dom.overhead = this.interface && this.interface.header ? 60 : 0;
        this.dom.setHeightWithParent( null, this.dom.overhead, 600 ).then( () => true );
        // Get the list of fields and render them into the view

        const fieldComponentList = await this._getFieldComponentList();
        this.template.attach( 'container' );
        this.template.render( fieldComponentList );
        return resolve( true );
      } );
    };
  }


  /**
   * This component receives a list of fields to render
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
   *                                    ( Private Method )                                        *
   *                                                                                              *
   ************************************************************************************************/
  /**
   * This will retrieve any fields that have been marked for the position of this field group
   */
  private _getFieldComponentList(): Promise<DynamicComponentInterface[]>{
    return new Promise( ( resolve ) => {
      let fields = this.srv.field.getDomFields( this.position, this.dom.repo );
      if( this.fieldType === 'custom' ){
        fields = fields.filter( ( field ) => {
          return field.custom;
        } );
      }else if( this.fieldType === 'table' ){
        fields = fields.filter( ( field ) => {
          return !( field.custom );
        } );
      }
      this.asset.fields = {};
      fields.map( ( field: FieldInterface ) => {
        const config = StorageGetter( field, [ 'inputs', 'config' ], null );
        if( config ){
          this.asset.fields[ config.name ] = config;
        }
      } );
      const componentList: DynamicComponentInterface[] = fields;

      return resolve( componentList );
    } );
  }


  /**
   * The fields will trigger a slew of events
   * @param event
   */
  onBubbleEvent( event: PopBaseEventInterface ){
    this.log.event( `onBubbleEvent`, event );
    if( IsValidFieldPatchEvent( this.core, event ) || event.type === 'context_menu' ){
      this.log.info( `IsValidFieldPatchEvent`, event );

      if( event.type === 'field' && event.config.name in this.core.entity ){
        const newValue = isNaN( event.config.control.value ) ? event.config.control.value : +event.config.control.value;
        this.core.entity[ event.config.name ] = newValue;
        if( Object.keys( this.asset.fields ).length > 1 ){
          this.dom.setTimeout( 'reset-hidden', () => {
            this._triggerParentChildUpdates( event.config.name );
            // this._resetComponentListHidden();

          }, 0 );
        }else{
          this.dom.setTimeout( 'reset-hidden', () => {
            // this._resetComponentListHidden();
          }, 0 );
        }
      }

      this.events.emit( event );
      this.srv.tab.clearCache();
    }
  }

  //
  // /**
  //  * This handler handles any events that come across the core cross channel
  //  * @param event
  //  * @private
  //  */
  // private _coreEventHandler( event: PopBaseEventInterface ){
  //   this.log.event(`_coreEventHandler`, event);
  //   if( IsValidFieldPatchEvent( this.core, event ) ){
  //     // A values has been patched recheck the list of fields to see if any of them should be hidden
  //
  //   }
  // }


  /**
   * Whenever a _update to the core entity happens the fields in the group should be re-evaluated if there are when conditionals set
   * @private
   */
  private _resetComponentListHidden(){
    let name, def;
    const Fields = this.dom.repo.ui.fields;
    this.template.refs.filter( ( componentRef: ComponentRef<any> ) => {
      return IsObject( componentRef.instance.config, true ) && IsArray( componentRef.instance.when, true );
    } ).map( ( componentRef: ComponentRef<any> ) => {
      name = componentRef.instance.config.name;
      if( name ){
        def = Fields.get( name );
        if( def ){
          componentRef.instance.hidden = def.inputs.hidden = !EvaluateWhenCondition( this.core, componentRef.instance.when, this.core );
          Fields.set( name, def );
        }
      }
    } );
  }


  /**
   * This will update the option values of related parent/child fields
   * @param name
   * @private
   */
  private _triggerParentChildUpdates( name: string ){
    this.log.info(`_triggerParentChildUpdates`, name);
    if( this._fieldHasChild( name ) ){
      let values;
      let child_fk;
      let childField;
      let autoFill = false;
      let set;
      const relations = this._getRelationList( name );
      relations.some( ( relation ) => {
        if( relation.autoFill ){
          autoFill = true;
          return true;
        }
      } );


      if( name && name in this.asset.fields ){
        child_fk = this.asset.fields[ name ].options.child;
        if( child_fk && child_fk in this.asset.fields ){
          childField = this.asset.fields[ child_fk ];
          if( IsArray( childField.options.rawValues ) ){

            values = ConvertArrayToOptionList( childField.options.rawValues, {
              // ensure that an option shows up in list in case other conditions remove it, aka it has been archived
              prevent: [], // a list of ids that should not appear in the list for whatever reason
              // parent means this options should all have a common field trait like client_fk, account_fk ....
              parent: childField.options.parent ? {
                field: childField.options.parent,
                value: this.core.entity[ childField.options.parent ]
              } : null,
              empty: childField.options.empty ? childField.options.empty : null,
            } );

            if( autoFill && values.length ){
              set = values[ values.length - 1 ].value;
            }else{
              set = null;
            }
            childField.options.values = values;
            autoFill = autoFill && values.length ? values[ 0 ].value : null;

            this.dom.setTimeout( `clear-message-${child_fk}`, () => {
              if( typeof childField.triggerOnChange === 'function' ) childField.triggerOnChange( set );
              if( typeof childField.clearMessage === 'function' ){
                childField.clearMessage();
              }
            }, 0 );
          }
        }
      }
    }
  }


  /**
   * Get a linear list of the parent child relations from a given point
   * @param self the name to start from (usually the field that has just been changed by user)
   * @param list
   */
  private _getRelationList( name: string, list: any[] = [] ){ // recursive loop
    let item;
    if( name && name in this.asset.fields ){
      item = this.asset.fields[ name ];
      if( IsObject( item, true ) ){
        list.push( {
          name: item.name,
          autoFill: this._fieldHasAutoFill( name ),
        } );
        if( this._fieldHasChild( name ) ){
          this._getRelationList( item.options.child, list );
        }
      }

    }
    return list;
  }


  /**
   * Determine if field has a child relation in the list
   * @param name
   */
  private _fieldHasChild( name: string ){
    if( name in this.asset.fields && this.asset.fields[ name ].options ){
      if( this.asset.fields[ name ].options.child ){
        return true;
      }
    }

    return false;
  }


  /**
   * Determine if field should be auto filled with the first item in the list
   * @param name
   */
  private _fieldHasAutoFill( name: string ){
    if( name in this.asset.fields && this.asset.fields[ name ] ){
      if( this.asset.fields[ name ].autoFill ){
        return true;
      }
    }
    return false;
  }

}
