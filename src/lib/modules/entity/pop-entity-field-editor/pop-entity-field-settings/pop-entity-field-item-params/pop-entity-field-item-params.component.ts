import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { PopExtendDynamicComponent } from '../../../../../pop-extend-dynamic.component';
import { PopEntityService } from '../../../services/pop-entity.service';
import { PopFieldEditorService } from '../../pop-entity-field-editor.service';
import { PopRequestService } from '../../../../../services/pop-request.service';
import { FieldLabelParamComponent } from './params/field-label-param.component';
import { FieldTextareaParamComponent } from './params/field-textarea-param.component';
import { FieldRadioParamComponent } from './params/field-radio-param.component';
import { FieldSwitchParamComponent } from './params/field-switch-param.component';
import { FieldSelectParamComponent } from './params/field-select-param.component';
import { FieldInputParamComponent } from './params/field-input-param.component';
import {
  CoreConfig,
  Dictionary,
  DynamicComponentInterface,
  FieldConfig,
  FieldInterface,
  PopBaseEventInterface,
  PopLog,
  ServiceInjector
} from '../../../../../pop-common.model';
import { InputConfig } from '../../../../base/pop-field-item/pop-input/input-config.model';
import { CheckboxConfig } from '../../../../base/pop-field-item/pop-checkbox/checkbox-config.model';
import { PopDomService } from '../../../../../services/pop-dom.service';
import {
  CleanObject,
  DynamicSort,
  IsArray,
  IsDefined,
  IsObject,
  IsObjectThrowError, IsString,
  SnakeToPascal,
  TitleCase
} from '../../../../../pop-common-utility';
import { FieldItemView, IsValidFieldPatchEvent } from '../../../pop-entity-utility';
import { Validators } from '@angular/forms';
import { FieldNumberParamComponent } from './params/field-number-param.component';
import { EntitySchemeSectionInterface } from '../../../pop-entity-scheme/pop-entity-scheme.model';


@Component( {
  selector: 'lib-field-builder-items-params',
  templateUrl: './pop-entity-field-item-params.component.html',
  styleUrls: [ './pop-entity-field-item-params.component.scss' ],
} )
export class PopEntityFieldItemParamsComponent extends PopExtendDynamicComponent implements OnInit, OnDestroy {
  @Input() field: FieldInterface;
  @Input() scheme: EntitySchemeSectionInterface = null;
  @ViewChild( 'container', { read: ViewContainerRef, static: true } ) private container;
  public name = 'PopEntityFieldItemParamsComponent';

  protected asset = {
    field: <FieldConfig>undefined,
    viewParams: <Dictionary<any>>undefined,
    viewOptions: <Dictionary<any>>undefined,
    viewTemplate: <Dictionary<any>>undefined,
  };

  protected srv = {
    entity: <PopEntityService>ServiceInjector.get( PopEntityService ),
    field: <PopFieldEditorService>undefined,
    request: <PopRequestService>ServiceInjector.get( PopRequestService ),
  };


  constructor(
    public el: ElementRef,
    protected _domRepo: PopDomService,
    protected _fieldRepo: PopFieldEditorService,
  ){
    super();

    /**
     * This should transformValue and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
     */
    this.dom.configure = (): Promise<boolean> => {
      return new Promise( ( resolve ) => {
        // #1: Enforce a CoreConfig
        this.core = IsObjectThrowError( this.core, true, `${this.name}:configureDom: - this.core` ) ? this.core : null;
        this.field = IsObjectThrowError( this.core.entity, true, `` ) ? <FieldInterface>this.core.entity : null;
        // Set the outer height boundary of the component
        this._setHeight();


        // Set the template container for the field item list
        this.template.attach( 'container' );

        // Set event Handlers
        this.dom.handler.core = ( core: CoreConfig, event: PopBaseEventInterface ) => this.coreEventHandler( event );
        this.dom.handler.bubble = ( core: CoreConfig, event: PopBaseEventInterface ) => this.onBubbleEvent( event );

        this.dom.state.showOptions = false;

        this.asset.viewParams = this.srv.field.getViewParams();
        this.asset.viewOptions = this.srv.field.getViewOptions();


        return resolve( true );
      } );
    };
  }


  /**
   * We expect the core to represent a field
   * This component allows the user to configure the settings of the specific field attribute item
   * The FieldBuilderItemsComponent is responsible to communicate which field attribute item is active
   */
  ngOnInit(){
    super.ngOnInit();
  }


  /**
   * This handler handles any events that come up from the settings fields
   * @param event
   */
  onBubbleEvent( event: PopBaseEventInterface ){
    PopLog.event( this.name, `onBubbleEvent`, event );
    if( event.type === 'field' && event.name === 'patch' && event.success ){
      if( IsDefined( event.config.name ) ){
        const field = this.dom.active.item;
        const value = event.config.control.value;
        if( event.config.name === 'active' ){
          field.active = +value;
        }else if( IsObject( event.config.metadata, [ 'session' ] ) ){
          if( IsArray( event.config.metadata.session ) ){
            event.config.metadata.session.map( ( storage ) => {
              if( IsObject( storage ) ){
                storage[ event.config.name ] = value;
              }
            } );
          }else if( IsObject( event.config.metadata.session ) ){
            event.config.metadata.session[ event.config.name ] = value;
          }
        }
      }
      this.dom.setTimeout( 'update-preview', () => {
        this.core.channel.next( { source: this.name, type: 'component', name: 'update', target: 'PopEntityFieldPreviewComponent' } );
      }, 250 );
    }
  }


  /**
   * This is action that initiates setting up the preview
   */
  setActiveFieldItem(): void{
    if( this.dom.active.item ){
      this._setFieldItemOptions();
      this._setFieldItemParams();
    }
  }


  /**
   * This is action that initiates setting up the preview
   */
  setLabelSettings(): void{
    this.dom.active.item = null;
    this.dom.state.showOptions = false;
    this._configureLabelList().then( ( paramComponentList: DynamicComponentInterface[] ) => {
      this.template.render( paramComponentList, [], true );
    } );
  }


  /**
   * The user can add entries in to the options that this field should use
   */
  addFieldItemOption(): void{
    this.dom.active.options.push( {
      active: new CheckboxConfig( {
        label: null,
        value: 1,
        bubble: true,
      } ),
      name: new InputConfig( {
        label: null,
        value: '',
        pattern: 'AlphaNumeric',
        bubble: true,
        maxlength: 128,
        minimal: true,
      } ),
      value: new InputConfig( {
        label: null,
        value: '',
        pattern: 'AlphaNumericNoSpace',
        bubble: true,
        maxlength: 128,
        minimal: true,
      } ),
      sort: new InputConfig( {
        label: null,
        minimal: true,
        value: this.dom.active.options.length,
        bubble: true,
      } ),
    } );
  }


  /**
   * The user can remove an existing option that this field is using
   * @param index
   */
  removeFieldItemOption( index: number ): void{
    if( index in this.dom.active.options ){
      this.dom.active.options.splice( index, 1 );
      this.dom.active.options.map( ( option, i ) => {
        option.sort.control.setValue( i );
      } );
    }
    this.triggerSaveFieldOptions( <PopBaseEventInterface>{ name: 'onChange' } );
  }


  /**
   * This will allow the user to make consecutive changes with minimal api calls
   * @param event
   */
  triggerSaveFieldOptions( event: PopBaseEventInterface ): void{
    if( event && ( event.name === 'onKeyUp' || event.name === 'onChange' ) ){
      if( this.dom.delay.saveFieldOptions ){
        clearTimeout( this.dom.delay.saveFieldOptions );
      }
      this.dom.delay.saveFieldOptions = setTimeout( () => {
        this.saveFieldItemOptions();
      }, 500 );
    }
  }


  /**
   * Reset the option values with the root source
   * @param event
   */
  onOptionSourceReset( event: PopBaseEventInterface ): void{
    const field = this.dom.active.item;
    if( IsArray( field.source, true ) ){
      field.options.values = [];
      field.source.map( ( item, index ) => {
        field.options.values.push( {
          active: item.active ? +item.active : 1,
          name: item.name ? item.name : item.label ? item.label : 'Item ' + ( index + 1 ),
          value: item.id ? item.id : item.value ? item.value : ( index + 1 ),
          sort: index
        } );
      } );
      this._setFieldItemOptions();
      this.triggerSaveFieldOptions( <PopBaseEventInterface>{ name: 'onChange' } );
    }
  }


  /**
   * This will store the option changes that the user makes
   */
  saveFieldItemOptions(): void{
    // #1: Create the payload structure
    this.dom.state.saving = true;
    const field = this.dom.active.item;
    const json = JSON.parse( JSON.stringify( field.options ) );
    json.values = [];
    let opt;
    this.dom.active.options.map( ( option ) => {
      opt = {};
      Object.keys( option ).map( ( key ) => {
        opt[ key ] = option[ key ].control.value;
      } );
      json.values.push( opt );
    } );

    const ignore401 = null;
    const version = 1;
    const patch = {
      'options': json
    };
    // #2: Clear/Store the subscriber so that it can be ignored if needed
    this.dom.setSubscriber( 'options-api-call', this.srv.request.doPatch( `/fields/customs/${field.id}`, patch, version, ignore401 ).subscribe(
      res => {
        this.dom.active.item.options.values = json.values;
        this.dom.state.saving = false;
        // #3: Inform the FieldBuilderPreviewComponent to update the new settings
        this.core.channel.next( { source: this.name, type: 'component', name: 'update', target: 'PopEntityFieldPreviewComponent' } );
        if( this.dom.subscriber.api ) this.dom.subscriber.api.unsubscribe();
      },
      err => {
        this.dom.state.saving = false;
      }
    ) );
  }


  /**
   * This allows the user to sort the list of options that this field uses
   * @param event
   */
  onOptionSortDrop( event: CdkDragDrop<string[]> ){
    moveItemInArray( this.dom.active.options, event.previousIndex, event.currentIndex );
    this.triggerSaveFieldOptions( <PopBaseEventInterface>{ name: 'onChange' } );
  }


  /**
   * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
   */
  ngOnDestroy(){
    this.template.destroy();
    super.ngOnDestroy();
  }


  /************************************************************************************************
   *                                                                                              *
   *                                      Under The Hood                                          *
   *                                    ( Private Method )                                        *
   *                                                                                              *
   ************************************************************************************************/

  /**
   * This handler is for managing any cross-communication between components on the core channel
   * @param event
   */
  private coreEventHandler( event: PopBaseEventInterface ){
    this.log.event( `coreEventHandler`, event );
    if( event.type === 'component' ){
      if( event.source === 'PopEntityFieldItemsComponent' ){
        if( event.name === 'active-item' ){
          // #1: An event has triggered that the view needs to change the active item,  debounce this trigger so that this action does not get called on top of itself
          this.dom.setTimeout( 'reset-view', () => {
            this.dom.loading();
            // #2: Transfer in the data package from the event
            this.dom.active.item = event.data;
            // this.asset.viewParams = event.data.config;
            // this.asset.model = event.data.model;
            // #3: Render the Active Item settings that are available
            this.setActiveFieldItem();
            setTimeout( () => {
              this.dom.ready();
            }, 0 );
          }, 100 );
        }else if( event.name === 'label-settings' ){
          // #1: An event has triggered that the view needs to change the active item,  debounce this trigger so that this action does not get called on top of itself
          if( this.dom.delay.reset ) clearTimeout( this.dom.delay.reset );
          this.dom.delay.reset = setTimeout( () => {
            this.dom.loading();
            this.setLabelSettings();
            setTimeout( () => {
              this.dom.ready();
            }, 0 );
          }, 100 );
        }
      }
    }else if( IsValidFieldPatchEvent( this.core, event ) ){
      this._setHeight();
    }
  }


  /**
   * This handles rendering the dynamic list of  param settings into the view
   * @param form
   * @param fieldItem
   * @param params
   */
  private _setFieldItemParams(){
    if( IsObject( this.dom.active.item, true ) ){
      this._configureParamList().then( ( paramComponentList: DynamicComponentInterface[] ) => {
        this.template.render( paramComponentList, [], true );
      } );
    }
  }


  /**
   * This will return a list of all the inputs that the settings require
   * @param fieldItem
   * @param params
   */
  _configureParamList(): Promise<DynamicComponentInterface[]>{
    return new Promise( ( resolve ) => {

      const paramComponentList: DynamicComponentInterface[] = [];
      let component;
      let configInterface;
      const fieldItem = this.dom.active.item;
      const view = fieldItem.view;
      const rules = fieldItem.rules.sort( DynamicSort( 'name' ) ).map( ( rule ) => CleanObject( rule ) );
      const allowed = this.asset.viewParams[ view.name ];
      const group = this.field.fieldgroup.name;
      const itemCustomSettings = fieldItem.custom_setting;
      // ToDo: Put the custom Settings into the paramList
      // console.log('itemCustomSettings', itemCustomSettings);

      const isScheme = IsObject( this.scheme, [ 'id' ] ) ? true : false;

      this.log.config( `activeItem`, {
        item: fieldItem,
        rules: rules,
        group: group,
        allowed: allowed,
        settings: itemCustomSettings,
        view: view
      } );

      if( this.dom.active.item.name !== 'value' ){
        let labelValue = fieldItem.label;
        if( isScheme ){
          const mapping = this.srv.field.getSchemeFieldItemMapping( this.scheme, +this.field.id, this.dom.active.item.id );
          if( IsString( mapping.label, true ) ){
            labelValue = mapping.label;
          }
        }
        const display = <DynamicComponentInterface>{
          type: this._getParamComponent( 'display' ),
          inputs: {
            config: configInterface = {
              ...{
                value: labelValue,
                defaultValue: '',
              },
              ...{
                label: 'Label',
                name: 'label',
                readonly: false,
                required: true,
                metadata: {
                  session: fieldItem
                },
                facade: isScheme,
                patch: {
                  field: 'label',
                  path: `fields/customs/${fieldItem.id}`,
                  callback: isScheme ? async( core: CoreConfig, event: PopBaseEventInterface ) => {
                    const session = this.srv.field.getSchemeFieldItemMapping( this.scheme, +this.field.id, this.dom.active.item.id );
                    session.label = event.config.control.value;
                    await this.srv.field.updateSchemeFieldMapping( this.scheme );
                    // console.log( 'session', session );
                    // console.log( 'facade', event.config.name, event.config.control.value );
                  } : null,
                }
              }
            }
          }
        };
        paramComponentList.push( display );
      }

      if( group === 'selection' ){
        const display = <DynamicComponentInterface>{
          type: this._getParamComponent( 'view' ),
          inputs: {
            config: configInterface = {
              ...{
                value: view.id,
                defaultValue: '',
              },
              ...{
                label: 'Template View',
                name: 'field_view_id',
                readonly: false,
                required: true,
                options: {
                  defaultValue: 2,
                  values: [
                    { value: 2, name: 'Select', sort_order: 0 },
                    { value: 10, name: 'Radio', sort_order: 1 },
                  ]
                },
                metadata: {
                  session: fieldItem
                },
                patch: {
                  field: 'field_view_id',
                  path: `fields/${fieldItem.id}`,
                  callback: ( core: CoreConfig, event: PopBaseEventInterface ) => {
                    const session = event.config.metadata.session;
                    session.view = FieldItemView( event.response.view );
                  }
                }
              }
            }
          }
        };
        paramComponentList.push( display );
      }


      // if(!this.field.multiple){
      //   const helpText = <DynamicComponentInterface>{
      //     type: this._getParamComponent('helpText'),
      //     inputs: {
      //       config: configInterface = {
      //         ...{
      //           value: fieldItem.helpText ? fieldItem.helpText : null,
      //           defaultValue: '',
      //         },
      //         ...{
      //           label: 'Help Text',
      //           name: 'helpText',
      //           readonly: false,
      //           metadata: {
      //             session: fieldItem
      //           },
      //           patch: { field: 'helpText', path: `fields/customs/${fieldItem.id}` }
      //         }
      //       }
      //     }
      //   };
      //   paramComponentList.push(helpText);
      // }

      if( view.name in this.asset.viewParams ){

        const ruleSchemeSession = this.srv.field.getSchemeFieldItemSection( this.scheme, +this.field.id, this.dom.active.item.id, 'rule' );
        rules.map( ( rule ) => {
//           console.log('rule', rule);
          let ruleValue = rule.value;
          if( isScheme ){
            if( IsDefined( ruleSchemeSession[ rule.name ] ) ){
              ruleValue = ruleSchemeSession[ rule.name ];
            }
          }
          if( rule.name in allowed ){
            configInterface = {
              ...rule,
              ...{
                value: ruleValue,
                name: rule.name,
                label: TitleCase( SnakeToPascal( rule.name ) ),
                metadata: { rule: rule },
                facade: true,
                patch: {
                  duration: 0,
                  field: ``,
                  path: ``,
                  callback: async( core: CoreConfig, event: PopBaseEventInterface ) => {
                    if( IsObject( this.scheme, true ) ){
                      if( IsObject( ruleSchemeSession ) ){
                        ruleSchemeSession[ rule.name ] = event.config.control.value;
                        await this.srv.field.updateSchemeFieldMapping( this.scheme );
                      }
                    }else{
                      this.srv.field.storeFieldItemRule( core, fieldItem, event ).then( () => true );
                    }
                  }
                }
              }
            };

            if( IsObject( rule.options, true ) ){
              configInterface.options = rule.options;
            }
            component = <DynamicComponentInterface>{
              type: this._getParamComponent( rule.name ),
              inputs: {
                config: configInterface,
              }
            };
            paramComponentList.push( component );
          }
        } );
      }


      if( IsObject( itemCustomSettings, true ) ){

        Object.keys( itemCustomSettings ).map( ( settingName ) => {

            const setting = itemCustomSettings[ settingName ];
            // console.log('setting', setting);
            if( setting.type !== 'model' ){
              paramComponentList.push( this.srv.field.getCustomSettingComponent( this.core, this.core.entity, setting, this.scheme ) );
            }

        } );
      }

      resolve( paramComponentList );
    } );
  }


  /**
   * This will return a list of all the inputs that the label settings require
   * @param fieldItem
   * @param params
   */
  _configureLabelList(): Promise<DynamicComponentInterface[]>{
    return new Promise( ( resolve ) => {
      // const paramComponentList: DynamicComponentInterface[] = [];
      //
      // const values = <DynamicComponentInterface>{
      //   type: PopEntityFieldLabelComponent,
      //   inputs: {
      //     core: this.core
      //   }
      // };
      // paramComponentList.push(values);
      //
      //
      resolve( [] );
    } );
  }


  private _setHeight(){
    this.dom.overhead = 125;
    // this.dom.height.outer = +this.dom.repo.position[ this.position ].height - 121;
    // const field = <FieldInterface>this.core.entity;
    // if( false && field.multiple ){
    //   this.dom.height.outer -= 20;
    //   this.dom.height.outer -= ( +field.multiple_min * 60 );
    // } // values box
    //
    // if( this.dom.height.outer < 400 ) this.dom.height.outer = 400;
    // this.dom.height.outer -= 2;
    this.dom.setHeight( 399, this.dom.overhead );
  }


  /**
   * Return the the field input component that should be used for the type of setting param;
   * @param form
   */
  private _getParamComponent( form ){
    switch( form ){
      case 'label':
        return FieldLabelParamComponent;
        break;
      case 'display':
      case 'api':
      case 'sort_top':
      case 'regex':
      case 'sort':
      case 'helpText':
        return FieldInputParamComponent;
        break;
      case 'select':
      case 'mask':
      case 'pattern':
      case 'validation':
      case 'transformation':
        return FieldSelectParamComponent;
        break;
      case 'hidden':
      case 'visible':
      case 'disabled':
      case 'readonly':
      case 'required':
        return FieldSwitchParamComponent;
        break;
      case 'layout':
        return FieldRadioParamComponent;
        break;
      case 'minlength':
      case 'maxlength':
        return FieldNumberParamComponent;
      case 'metadata':
        return FieldTextareaParamComponent;
        break;
      case 'view':
        return FieldRadioParamComponent;
        break;
      default:
        return FieldLabelParamComponent;
    }
  }


  /**
   * This will make sure the options will get set up properly if the active items uses them
   * @param form
   * @param options
   * @param params
   */
  private _setFieldItemOptions(){
    this.dom.state.showOptions = false;
    const field = this.dom.active.item;
    const form = field.view ? field.view.name : null;
    if( !form ) PopLog.warn( this.name, `_setFieldItemOptions: Invalid Form`, field );


    this.dom.active.options = [];
    if( form && form in this.asset.viewOptions ){

      // if( field.options.fixed ){
      //   field.options.enum = true;
      // }

      if( IsArray( field.source, true ) ){
        field.options.enum = true;
        this.dom.state.isOptionSource = true;
      }

      if( !( IsObject( field.options, [ 'values' ] ) ) && !( field.source ) ){
        field.options = this.asset.viewOptions[ form ];
      }

      if( IsObject( field.options, [ 'values' ] ) && Array.isArray( field.options.values ) ){
        field.options.values.map( ( option, index ) => {
          option.name = option.name ? String( option.name ) : 'Item ' + ( index + 1 );
          option.value = option.id ? String( option.id ) : option.value ? String( option.value ) : String( ( index + 1 ) );
          option.sort = index;
          if( typeof option.active !== 'boolean' ) option.active = true;
          this.dom.active.options.push( {
            active: new CheckboxConfig( {
              label: null,
              value: +option.active,
              bubble: true,
            } ),
            name: new InputConfig( {
              label: null,
              value: option.name,
              transformation: 'title',
              bubble: this.dom.state.isOptionSource ? false : true,
              pattern: 'AlphaNumeric',
              validators: [ Validators.required ],
              maxlength: 32,
              readonly: this.dom.state.isOptionSource ? true : false,
            } ),
            value: new InputConfig( {
              label: null,
              value: option.value,
              bubble: field.options.enum ? false : true,
              validators: [ Validators.required ],
              pattern: 'AlphaNumericNoSpace',
              transformation: 'lower',
              maxlength: 32,
              readonly: field.options.enum ? true : false,
            } ),
            sort: new InputConfig( {
              label: null,
              value: option.sort || 0,
              bubble: true,
            } ),
          } );
        } );
        this.dom.state.showOptions = true;
      }
    }
  }
}
