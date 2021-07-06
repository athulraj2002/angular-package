import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { PopFieldEditorService } from '../../pop-entity-field-editor.service';
import {
  CoreConfig,
  Dictionary, EntityActionInterface, FieldCustomSettingInterface,
  FieldEntry,
  FieldInterface,
  FieldItemOption, KeyMap,
  PopBaseEventInterface, PopDate,
  PopLog, PopRequest,
  ServiceInjector
} from '../../../../../pop-common.model';
import { PopExtendComponent } from '../../../../../pop-extend.component';
import { PopDomService } from '../../../../../services/pop-dom.service';
import { MinMaxConfig } from '../../../../base/pop-field-item/pop-min-max/min-max.models';
import {
  ArrayMapSetter,
  DeepCopy,
  GetHttpErrorMsg, GetHttpObjectResult,
  IsArray, IsArrayThrowError, IsDefined,
  IsObject,
  IsObjectThrowError,
  IsString, IsUndefined, SnakeToPascal,
  StorageGetter,
  TitleCase
} from '../../../../../pop-common-utility';
import { forkJoin, Observable } from 'rxjs';
import { SelectConfig } from '../../../../base/pop-field-item/pop-select/select-config.model';
import { InputConfig } from '../../../../base/pop-field-item/pop-input/input-config.model';
import { PopRequestService } from '../../../../../services/pop-request.service';
import { CheckboxConfig } from '../../../../base/pop-field-item/pop-checkbox/checkbox-config.model';
import { SwitchConfig } from '../../../../base/pop-field-item/pop-switch/switch-config.model';
import { IsValidFieldPatchEvent } from '../../../pop-entity-utility';
import { PopConfirmationDialogComponent } from '../../../../base/pop-dialogs/pop-confirmation-dialog/pop-confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { PopEntityActionService } from '../../../services/pop-entity-action.service';
import { PopTabMenuService } from '../../../../base/pop-tab-menu/pop-tab-menu.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { EntitySchemeSectionInterface } from '../../../pop-entity-scheme/pop-entity-scheme.model';


@Component( {
  selector: 'lib-pop-entity-field-entries',
  templateUrl: './pop-entity-field-entries.component.html',
  styleUrls: [ './pop-entity-field-entries.component.scss' ]
} )
export class PopEntityFieldEntriesComponent extends PopExtendComponent implements OnInit, OnDestroy {
  @Input() field: FieldInterface;
  @Input() scheme: EntitySchemeSectionInterface = null;
  public name = 'PopEntityFieldEntriesComponent';

  protected srv = {
    action: <PopEntityActionService>ServiceInjector.get( PopEntityActionService ),
    dialog: <MatDialog>ServiceInjector.get( MatDialog ),
    field: <PopFieldEditorService>undefined,
    request: <PopRequestService>ServiceInjector.get( PopRequestService ),
    tab: <PopTabMenuService>ServiceInjector.get( PopTabMenuService ),
  };

  protected asset = {
    basePath: <string>undefined,
    entries: <FieldEntry[]>[],
    entriesMap: <KeyMap<number>>{},
    schemeFieldStorage: <any>undefined,
    type: <string>undefined,
    typeOption: <Dictionary<{ defaultValue: string | number, options: FieldItemOption[] }>>undefined,
  };

  public ui = {
    label: <InputConfig>undefined,
    minMax: <MinMaxConfig>undefined,
    editLabel: <SwitchConfig>undefined,
    uniqueLabel: <CheckboxConfig>undefined,
    customLabel: <CheckboxConfig>undefined,
    entries: <FieldEntrySession[]>[],
    map: < Dictionary<any>>{},
    entryLimit: 4
  };


  protected extendServiceContainer(){
    this.srv.field = this._fieldRepo;
    // delete this._fieldRepo;
  }


  constructor(
    public el: ElementRef,
    protected _domRepo: PopDomService,
    protected _fieldRepo: PopFieldEditorService,
    protected _tabRepo: PopTabMenuService
  ){
    super();

    this.extendServiceContainer();
    /**
     * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
     */
    this.dom.configure = (): Promise<boolean> => {
      return new Promise( ( resolve ) => {
        this.core = IsObjectThrowError( this.core, true, `${this.name}:configureDom: - this.core` ) ? this.core : null;
        if( !this.field ) this.field = IsObjectThrowError( this.core, [ 'entity' ], `Invalid Core` ) && IsObjectThrowError( this.core.entity, [ 'id', 'fieldgroup' ], `Invalid Field` ) ? <FieldInterface>this.core.entity : null;
        this.asset.type = this.field.fieldgroup.name; // the field group name , ie.. address, phone
        this.asset.typeOption = this.srv.field.getDefaultLabelTypeOptions(); // the select options that belong to the types
        this.asset.basePath = `fields/${this.field.id}/entries`; // api endpoint to hit for field entries

        this._setCustomTraits();

        this.ui.entries = IsArrayThrowError( this.core.entity.entries, false, `Invalid Field Entries` ) ? this.core.entity.entries : null;


        this.dom.session.controls = new Map(); // store the entry configs so that changes are not lost when the tabs are changed

        this._buildCustomSettings();


        return resolve( true );
      } );
    };

    this.dom.proceed = (): Promise<boolean> => {
      return new Promise( async( resolve ) => {

        if( IsObject( this.scheme, true ) ){
          this.asset.schemeFieldStorage = this.srv.field.getSchemeFieldSetting( this.scheme, +this.field.id );
          this.dom.state.hasScheme = IsObject( this.scheme, true ) ? true : false;
          const primary = this.srv.field.getSchemePrimary( this.scheme );

          this.dom.state.isPrimary = this.field.fieldgroup.name in primary && +primary[ this.field.fieldgroup.name ] == this.field.id ? true : false;
        }else{
          this.dom.state.hasScheme = false;
          this.dom.state.isPrimary = false;
        }
        await this._showEntries();

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


  /**
   * This allows the user to sort the list of options that this field uses
   * @param event
   */
  onOptionSortDrop( event: CdkDragDrop<string[]> ){
    moveItemInArray( this.ui.entries, event.previousIndex, event.currentIndex );
    this.dom.setTimeout( `update-sort-order`, async() => {
      const requests = [];
      this.ui.entries.map( ( entry: FieldEntrySession, index ) => {
        requests.push( PopRequest.doPatch( `${this.asset.basePath}/${entry.id}`, { sort_order: index, orphaned: -1 }, 1, false ) );
        const session = this.field.entries.find( ( e: FieldEntry ) => +e.id === +entry.id );
        if( IsObject( session, true ) ){
          session.sort_order = index;
        }
        entry.increment = index + 1;
      } );
      if( requests.length ){
        this.srv.tab.showAsLoading( true );
        this.dom.setSubscriber( `update-sort-order`, forkJoin( requests ).subscribe( ( res ) => {
          this.srv.field.triggerFieldPreviewUpdate();
          this.srv.tab.showAsLoading( false );
        }, ( err ) => {
          this.dom.setError( err, true );
          this.srv.tab.showAsLoading( false );
        } ) );
      }
    }, 0 );

    // this.triggerSaveFieldOptions( <PopBaseEventInterface>{ name: 'onChange' } );
  }


  /**
   * When the type of an entry is changed in the database, make sure the changes is updated locally
   * This is will  be removed since we don't want to do types
   * @param index
   * @param event
   */
  onEntryTypeChange( index: number, event: PopBaseEventInterface ){
    if( IsValidFieldPatchEvent( this.core, event ) ){
      const config = this.ui.entries[ index ];
      const entry = this.field.entries[ index ];
      const session = this.dom.session.controls.get( index );
      if( entry && session ){
        entry.type = config.type.control.value;
        this._updateEntryTypeSession( session.type, entry );
        this.dom.session.controls.set( index, session );
        this.setDomSession( index, session );
      }
      setTimeout( () => {
        this.srv.field.triggerFieldPreviewUpdate();
      }, 0 );
    }
  }


  /**
   * When the display/label of an entry is changed in the database, make sure the changes is updated locally
   * @param index
   * @param event
   */
  onEntryDisplayChange( index: number, event: PopBaseEventInterface ){
    if( index === 0 ) this.ui.label.control.setValue( event.config.control.value, { emitEvent: false } );
    if( IsValidFieldPatchEvent( this.core, event ) ){
      // PopTemplate.buffer();
      const entry = this.field.entries[ index ];
      const session = this.dom.session.controls.get( index );
      if( entry && session ){
        entry.name = event.config.control.value;
        this._updateEntryDisplaySession( session.display, entry );
        this.dom.session.controls.set( index, session );
        this.setDomSession( index, session );
      }
    }
    setTimeout( () => {
      this.srv.field.triggerFieldPreviewUpdate();
    }, 0 );
  }


  /**
   * When the display/label of an entry is changed in the database, make sure the changes is updated locally
   * @param index
   * @param event
   */
  onEntryActiveChange( index: number, event: PopBaseEventInterface ){
    if( IsObject( this.scheme, [ 'id' ] ) ){
      // here
    }else{
      const entry = this.field.entries[ index ];
      if( entry ){
        if( event.config.control.value ){
          entry.orphaned = false;
          entry.orphaned_at = null;
        }else{
          entry.orphaned = true;
          entry.orphaned_at = PopDate.toIso( new Date() );
        }
      }
      setTimeout( () => {
        this._handleMultipleEntries();
        this.srv.field.triggerFieldPreviewUpdate();
      }, 0 );
      this.log.info( `onEntryActiveChange`, event );
    }
  }


  onEntryTraitChange( index: number, trait: { name: string, selected: boolean } ){
    this.dom.setTimeout( `entry-trait-${index}`, async() => {
      this.ui.entries.map( ( entry: FieldEntrySession, entryIndex: number ) => {
        const entryTrait = entry.traits.find( ( t ) => t.name === trait.name );
        if( IsObject( entryTrait, true ) ){
          if( +entryIndex !== +index ){
            entryTrait.selected = false;
          }else{
            entryTrait.selected = true;
            if( IsObject( this.scheme, [ 'mapping' ] ) ){
              if( IsObject( this.asset.schemeFieldStorage, [ 'trait_entry' ] ) ){
                this.asset.schemeFieldStorage.trait_entry[ entryTrait.name ] = entry.id;
              }
            }
          }
        }
      } );

      await this.srv.field.updateSchemeFieldMapping( this.scheme );

      this.log.info( `onEntryTraitChange` );
    } );

  }


  private _handleMultipleEntries(){
    this.log.info( `_handleMultipleEntries` );
    this.dom.session.multipleActiveEntries = this._isMultipleActiveEntries();
    if( !( this.dom.session.multipleActiveEntries ) ){
      this._disableActiveEntries();
    }else{
      this._enableActiveEntries();
    }
  }


  /**
   * A User will be able to add as many labels as they like
   */
  onAddEntryValue(){
    this.dom.setTimeout( `add-entry`, async() => {
      const action = <EntityActionInterface>{
        name: 'entry',
        header: 'Add Entry',
        facade: true,
        // component: {
        //   type: DemoOneComponent
        // },
        fields: {
          name: {
            form: 'input',
            pattern: 'Default',
            name: 'name',
            hint: true,
            label: 'Name',
            required: true,
            bubble: false,
            noInitialValue: true,
            transformation: 'toTitleCase',
            maxlength: 32,
            prevent: this.ui.entries.map( ( entry: FieldEntrySession ) => {
              return StorageGetter( entry, [ 'display', 'control', 'value' ], 'Undefined' );
            } )
          }
        },
        // onEvent: (core: CoreConfig, event: PopBaseEventInterface):Promise<boolean>=>{
        //   return new Promise<boolean>((onEventResolver)=>{
        //     return onEventResolver(true);
        //   });
        // },
        bubbleAll: true,
        blockEntity: true
      };
      const res = await this.srv.action.do( this.core, action );
      if( IsObject( res, [ 'name' ] ) ){
        await this._addEntry( res.name );
      }
    }, 0 );

  }


  private _addEntry( name?: string ): Promise<boolean>{
    return new Promise<boolean>( ( resolve ) => {
      this.srv.tab.showAsLoading( true );
      this.dom.state.pending = true;
      const sessionIndex = this.field.entries.filter( ( x ) => x.type !== 'custom' ).length;
      const increment = sessionIndex + 1;
      const session = this.dom.session.controls.get( sessionIndex );
      if( !name ){
        name = session ? session.display.value : TitleCase( `${( this.field.name ? this.field.name : this.asset.type )} ${increment}` )
      }
      const entry = {
        name: name,
        type: this.asset.typeOption.defaultValue,
        orphaned_at: null,
        sort_order: sessionIndex
      };
      this._makeApiRequests( [
        this.srv.request.doPost( `${this.asset.basePath}`, entry, 1, false ),
        this.srv.request.doPatch( `fields/${this.field.id}`, { multiple_min: increment, multiple_max: increment }, 1, false ),
      ] ).then( ( res ) => {
        this._setEntrySessionControls( this.field.entries.filter( ( x ) => x.type !== 'custom' ) ).then( ( entries: FieldEntry[] ) => {
          this._setEntries( entries ).then( () => {
            this.dom.state.pending = false;
            setTimeout( () => {
              // For now I want the amount of field entries to dictate what min/max should be
              this.field.multiple_min = increment;
              this.field.multiple_max = increment;

              this.ui.minMax.minConfig.max = this.field.entries.length;
              this.ui.minMax.minConfig.min = this.field.entries.length;
              this.ui.minMax.minConfig.control.setValue( this.field.entries.length );


              this.ui.minMax.maxConfig.max = this.field.entries.length;
              this.ui.minMax.maxConfig.min = this.field.entries.length;
              this.ui.minMax.maxConfig.control.setValue( this.field.entries.length );

              // this.ui.minMax.triggerOnChange();
              this.srv.field.triggerFieldPreviewUpdate();
              this.srv.tab.showAsLoading( false );
              return resolve( true );
            }, 0 );
          } );
        } );
      }, ( err ) => {
        this.dom.setError( err, true );
        this.srv.tab.showAsLoading( false );
        return resolve( false );
      } );
    } );
  }


  private _collectNewEntryName(){
    const fields = {
      client_id: {
        form: 'select',
        name: 'client_id',
        label: 'Client',
        bubble: true,
        disabled: false,
        required: true,
        options: {
          resource: 'clients',
          child: 'account_id'
        },
      },
    };

    const actionConfig: EntityActionInterface = {
      header: 'Add New Field Entry',
      name: 'campaign',
      fields: {
        ...fields
      },
      submitText: 'Submit',
      postUrl: null,
      blockEntity: true, // implies that fields should not be inherited from the original field.ts file
    };

    this.dom.setTimeout( `collect-name`, async() => {
      const setCampaign = await this.srv.action.do( this.core, actionConfig );
      this.log.info( 'setCampaign', setCampaign );

      this.srv.tab.showAsLoading( false );
    }, 0 );
  }


  /**
   * A User will be able to remove labels as they like
   */
  onRemoveEntryValue( entry: FieldEntrySession ){
    if( entry && entry.id ){
      this.srv.dialog.open( PopConfirmationDialogComponent, {
        width: '500px',
        data: {
          option: null,
          body: `Deleting ${entry.display.control.value} will result in any collected values on this entry being permanently removed.<br><br>Do you wish to continue?`,
          align: 'left'
        }
      } ).afterClosed().subscribe( res => {
        if( res && res.confirmed ){
          // PopTemplate.buffer();
          this.dom.state.pending = true;
          const decrement = this.field.entries.length - 1;
          this.srv.request.doDelete( `${this.asset.basePath}/${entry.id}` );
          this._makeApiRequests( [
            this.srv.request.doDelete( `${this.asset.basePath}/${entry.id}` ),
            this.srv.request.doPatch( `fields/${this.field.id}`, { multiple_min: decrement, multiple_max: decrement }, 1, false ),
          ] ).then( () => {
            this._setEntrySessionControls( this.field.entries.filter( ( x ) => x.type !== 'custom' ) ).then( ( entries: FieldEntry[] ) => {
              this._setEntries( entries ).then( () => {
                this.dom.state.pending = false;
                setTimeout( () => {
                  // For now I want the amount of field entries to dictate what min/max should be
                  this.field.multiple_min = decrement;
                  this.field.multiple_max = decrement;

                  this.ui.minMax.minConfig.max = this.field.entries.length;
                  this.ui.minMax.minConfig.min = this.field.entries.length;
                  this.ui.minMax.minConfig.control.setValue( this.field.entries.length );


                  this.ui.minMax.maxConfig.max = this.field.entries.length;
                  this.ui.minMax.maxConfig.min = this.field.entries.length;
                  this.ui.minMax.maxConfig.control.setValue( this.field.entries.length );
                  // Tmp Block ^

                  this.srv.field.triggerFieldPreviewUpdate();
                }, 0 );
              } );
            } );
          } );
        }
      } );

    }
  }


  onMinMaxSetting( event: PopBaseEventInterface ){
    if( IsValidFieldPatchEvent( this.core, event ) ){
      this.srv.field.triggerFieldPreviewUpdate();
    }
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

  private _setCustomTraits(){
    this.field.trait.map( ( trait: FieldCustomSettingInterface ) => {
      if( !trait.label ) trait.label = TitleCase( SnakeToPascal( trait.name ) );
    } );
  }


  /**
   * Build the configs for the set of custom settings that this component uses
   * @private
   */
  private _buildCustomSettings(){

    this.ui.minMax = new MinMaxConfig(
      {
        bubble: true,
        helpText: 'Set the minimum values that this field should have, the maximum amount of values will be the total entries defined.',
        label: 'Entry Values',
        minRequired: true,
        maxRequired: true,
        minValue: this.field.entries.length,
        maxValue: this.field.entries.length,
        min: this.field.entries.length,
        max: this.field.entries.length,
        limit: 10,
        minLabel: 'Minimum',
        maxLabel: 'Maximum',
        maxColumn: 'multiple_max',
        minColumn: 'multiple_min',
        maxReadonly: true,
        patch: {
          field: 'n/a',
          path: `fields/${this.field.id}`,
          callback: ( core: CoreConfig, event: PopBaseEventInterface ) => {
            const newValue = event.config.control.value;
            Object.keys( newValue ).map( ( key: string ) => {
              this.field[ key ] = newValue[ key ];
            } );

          }
        }
      } );


    this.ui.label = new InputConfig(// Piggy back off of the first entry label
      {
        label: 'Label',
        value: this.field.entries[ 0 ].name,
        facade: false,
        maxlength: 24,
        patch: {
          field: `name`,
          path: `fields/${this.field.id}/entries/${this.field.entries[ 0 ].id}`,
          callback: ( core: CoreConfig, event: PopBaseEventInterface ) => {
            this.onEntryDisplayChange( 0, event );
          }
        }
      } );

    // The edit label setting will determine if the end-user is able to change the the label
    const editLabelSetting = IsObject( this.field.custom_setting.edit_label, true ) ? this.field.custom_setting.edit_label : null;
    if( editLabelSetting ){
      this.ui.editLabel = new SwitchConfig(
        {
          name: 'edit_label',
          helpText: editLabelSetting.helpText,
          label: editLabelSetting.label,
          labelPosition: 'after',
          value: <boolean>editLabelSetting.value,
          metadata: {
            setting: editLabelSetting,
          },
          facade: true,
          patch: {
            field: 'value',
            path: ``,
            callback: ( core: CoreConfig, event: PopBaseEventInterface ) => {
              this.srv.field.storeCustomSetting( this.core, event ).then( ( res ) => {
                if( IsString( res ) ){
                  this.ui.editLabel.message = <string>res;
                }else{
                  this.srv.field.triggerFieldPreviewUpdate();
                }
              } );
            }
          }
        } );
    }

    // The custom label setting will allow the user to add their own custom label to fit their needs, should only show if edit label setting is true
    const customLabelSetting = IsObject( this.field.custom_setting.custom_label, true ) ? this.field.custom_setting.custom_label : null;
    if( customLabelSetting ){
      this.ui.customLabel = new CheckboxConfig(
        {
          name: 'custom_label',
          facade: true,
          helpText: customLabelSetting.helpText,
          label: customLabelSetting.label,
          labelPosition: 'after',
          value: <boolean>customLabelSetting.value,
          metadata: {
            setting: customLabelSetting,
          },
          patch: {
            field: 'value',
            path: ``,
            callback: ( core: CoreConfig, event: PopBaseEventInterface ) => {
              this.srv.field.storeCustomSetting( this.core, event ).then( ( res ) => {
                if( IsString( res ) ){
                  this.ui.customLabel.message = <string>res;
                }else{
                  this._onCustomLabelChange( this.ui.customLabel.control.value ).then( () => {
                    this.srv.field.triggerFieldPreviewUpdate();
                  } );
                }
              } );
            }
          }
        } );
    }

    // The unique label setting will force all of the field values to use a unique label, should only show if edit label setting is true
    const uniqueLabelSetting = IsObject( this.field.custom_setting.unique_label, true ) ? this.field.custom_setting.unique_label : null;
    if( uniqueLabelSetting ){

      this.ui.uniqueLabel = new CheckboxConfig(
        {
          name: 'unique_label',
          facade: true,
          helpText: uniqueLabelSetting.helpText,
          label: uniqueLabelSetting.label,
          labelPosition: 'after',
          value: <boolean>uniqueLabelSetting.value,
          metadata: {
            setting: uniqueLabelSetting,
          },
          patch: {
            field: 'value',
            path: ``,
            callback: ( core: CoreConfig, event: PopBaseEventInterface ) => {
              this.srv.field.storeCustomSetting( this.core, event ).then( ( res ) => {
                if( IsString( res ) ){
                  this.ui.uniqueLabel.message = <string>res;
                }else{
                  this.srv.field.triggerFieldPreviewUpdate();
                }
              } );
            }
          }
        } );
    }

  }


  /**
   * A User will be able to add as many labels as they like
   */
  private _onCustomLabelChange( value: boolean ): Promise<boolean>{
    return new Promise<boolean>( ( resolve ) => {
      this.dom.state.pending = true;

      if( value ){
        let hasCustom = false;
        this.field.entries.map( ( item: FieldEntry ) => {
          if( item.type == 'custom' ) hasCustom = true;
        } );
        if( !hasCustom ){
          const entry = {
            name: 'Custom',
            type: 'custom'
          };
          this._makeApiRequests( [ this.srv.request.doPost( `${this.asset.basePath}`, entry, 1, false ) ] ).then( ( res ) => {
            this._setEntrySessionControls( this.field.entries.filter( ( x ) => x.type !== 'custom' ) ).then( ( entries: FieldEntry[] ) => {
              this._setEntries( entries ).then( () => {
                this.dom.state.pending = false;
                setTimeout( () => {
                  this.srv.field.triggerFieldPreviewUpdate();
                  return resolve( true );
                }, 0 );
              } );
            } );
          } );
        }else{
          setTimeout( () => {
            this.dom.state.pending = false;
            this.srv.field.triggerFieldPreviewUpdate();
            return resolve( true );
          }, 0 );
        }

      }else{
        const requests = [];
        this.field.entries.filter( ( entry ) => {
          if( entry.type === 'custom' ){
            requests.push( this.srv.request.doDelete( `${this.asset.basePath}/${entry.id}`, null, 1, false ) );
            return false;
          }else{
            return true;
          }
        } );
        if( requests.length ){
          this._makeApiRequests( requests ).then( ( res ) => {
            this._setEntrySessionControls( this.field.entries.filter( ( x ) => x.type !== 'custom' ) ).then( ( entries: FieldEntry[] ) => {
              this._setEntries( entries ).then( () => {
                this.dom.state.pending = false;
                setTimeout( () => {
                  this.srv.field.triggerFieldPreviewUpdate();
                }, 0 );
              } );
            } );
          } );
        }


        return resolve( true );
      }
    } );
  }


  /**
   * Produce a list of the entry values for this field
   */
  private _showEntries(): Promise<boolean>{
    return new Promise<boolean>( async( resolve ) => {
      this._setValueEntries().then( ( entries: FieldEntry[] ) => {
        this._setEntrySessionControls( entries ).then( ( res: FieldEntry[] ) => {
          this._setEntries( res ).then( () => {
            this.dom.state.pending = false;
            return resolve( true );
          } );
        } );
      } );

    } );

  }


  /**
   * Ensure that the database records match the min/max settings
   * This will remove any excess records in the database that exceed the multiple_min
   * This will create records for an entries that are needed in the database
   * @param patch
   */
  private _setValueEntries(): Promise<FieldEntry[]>{
    return new Promise<FieldEntry[]>( ( resolve ) => {
      const provided = DeepCopy( this.field.entries ).filter( ( entry ) => {
        return entry.type !== 'custom';
      } );
      const entries = [ ...provided ];
      return resolve( entries );
    } );
  }


  /**
   * Will make all of the needed api requests
   * @param requests
   * @private
   */
  private _makeApiRequests( requests: Observable<any>[] ): Promise<FieldEntry[]>{
    return new Promise<FieldEntry[]>( ( resolve ) => {
      // PopTemplate.buffer();
      forkJoin( requests ).subscribe( () => {
        this.srv.request.doGet( this.asset.basePath ).subscribe( ( res ) => {
          res = res.data ? res.data : res;
          this.field.entries = IsArray( res, true ) ? <FieldEntry[]>res : [];
          this.core.entity.entries = JSON.parse( JSON.stringify( this.field.entries ) )
          resolve( res );
        } );
      }, ( err ) => {
        PopLog.error( this.name, `_makeApiRequests`, GetHttpErrorMsg( err ) );
        resolve( [] );
      } );
    } );
  }


  /**
   * Store a set of controls that can store values as the user changes the settings
   * @private
   */
  private _setEntrySessionControls( entries: FieldEntry[] ): Promise<FieldEntry[]>{
    return new Promise( ( resolve ) => {
      let index = 0;
      entries.map( ( entry: FieldEntry ) => {
        if( entry.type !== 'custom' ){
          if( !( IsDefined( entry.orphaned ) ) ) entry.orphaned = IsDefined( entry.orphaned_at, false );
          const session = this.dom.session.controls.has( index ) ? this.dom.session.controls.get( index ) : {
            id: entry ? entry.id : null,
            type: this._getEntryTypeConfig( entry ),
            display: this._getEntryDisplayConfig( entry ),
            active: this._getEntryActiveConfig( entry ),
            increment: index + 1,
          };
          this._updateSessionControl( index, session, entry );
          index++;
        }
      } );


      return resolve( entries );
    } );
  }


  /**
   * Update the entry config to use the stored record, and update the sessions for it
   * @param index
   * @param session
   * @param entry
   * @private
   */
  private _updateSessionControl( index: number, session: FieldEntrySession, entry: FieldEntry = null ){
    session.increment = index + 1;
    session.id = entry ? entry.id : null;
    this._updateEntryTypeSession( session.type, entry );
    this._updateEntryDisplaySession( session.display, entry );
    this.dom.session.controls.set( index, session );
    this.setDomSession( index, session );
    return session;
  }


  /**
   * Update the entry type config to use correct value and path
   * @param config
   * @param entry
   * @private
   */
  private _updateEntryTypeSession( config: SelectConfig, entry: FieldEntry = null ){
    // config.value = entry ? entry.type : this.asset.type in this.asset.typeOption ? this.asset.typeOption[ this.asset.type ].defaultValue : 'n/a';
    // config.control.setValue( config.value, { emitEvent: false } );
    // config.patch.path = entry ? `${this.asset.basePath}/${entry.id}` : null;
  }


  /**
   * Update the entry display config to use correct value and path
   * @param config
   * @param entry
   * @private
   */
  private _updateEntryDisplaySession( config: InputConfig, entry: FieldEntry = null ){
    // config.value = entry ? entry.name : '';
    // config.control.setValue( config.value, { emitEvent: false } );
    // config.patch.path = entry ? `${this.asset.basePath}/${entry.id}` : null;
  }


  /**
   * Update the entry active config to use correct value and path
   * @param config
   * @param entry
   * @private
   */
  private _updateEntryActiveSession( config: InputConfig, entry: FieldEntry = null ){

  }


  /**
   * Store each entry config in a dom session so that it can be restored when the users is switching tabs
   * @param index
   * @param session
   */
  private setDomSession( index: number, session: FieldEntrySession ){
    const domStorage = <any>StorageGetter( this.dom.repo, [ 'components', this.name, this.id + '', 'session' ] );
    if( IsObject( domStorage, [ 'controls' ] ) ){
      const controls = <Map<number, FieldEntrySession>>domStorage.controls;
      controls.set( index, session );
    }
  }


  /**
   * Set entry config objects that will be used in the html template
   * @private
   */
  private _setEntries( entries: FieldEntry[] ): Promise<boolean>{
    return new Promise<boolean>( async( resolve ) => {
      this.ui.entries = [];
      this.asset.entries = IsArray( entries, true ) ? entries.filter( ( e ) => e.type !== 'custom' ) : [];
      this.asset.entriesMap = ArrayMapSetter( this.asset.entries, 'id' );
      this.dom.state.hasMultipleEntries = this.asset.entries.length > 1;
      await this._checkFieldEntryTraits();

      return resolve( true );
    } );

  }


  /**
   * Manage the type of each entry
   * @param ind
   * @private
   */
  private _getEntryTypeConfig( entry: FieldEntry ){
    let disabled = false;
    let options = this.asset.type in this.asset.typeOption ? this.asset.typeOption[ this.asset.type ].options : [];
    if( !IsArray( options, true ) ){
      options = [ { value: 'n/a', name: 'N/A' } ];
      disabled = true;
    }
    return new SelectConfig( {
      label: 'Type',
      options: { values: options },
      disabled: disabled,
      patch: {
        field: 'type',
        path: entry && entry.id ? `${this.asset.basePath}/${entry.id}` : null,
      }
    } );
  }


  /**
   * Manage the type of each entry
   * @param ind
   * @private
   */
  private _getSessionEntryTraits( entry: FieldEntry ){
    const traits = [];
    if( IsObject( this.scheme, [ 'id', 'mapping' ] ) ){
      const traitEntryMapping = this.asset.schemeFieldStorage.trait_entry;
      const disabledEntries = this.asset.schemeFieldStorage.disabled_entries;
      if( IsObject( this.field, true ) && IsArray( this.field.trait, true ) ){
        this.field.trait.map( ( trait: FieldCustomSettingInterface ) => {
          traits.push( {
            name: trait.name,
            disabled: disabledEntries.includes(entry.id),
            selected: +traitEntryMapping[ trait.name ] === entry.id
          } );
        } );

      }
    }
    return traits;
  }


  private _checkFieldEntryTraits(): Promise<boolean>{
    return new Promise( async( resolve ) => {
      if( this.dom.state.isPrimary && IsArray( this.field.trait, true ) ){
        let updateNeeded = false;
        const disabledEntries = this.asset.schemeFieldStorage.disabled_entries;
        const activeEntry = IsArray( this.asset.entries, true ) ? this.asset.entries.find( entry => {
          return !( disabledEntries.includes( entry.id ) ) && !entry.orphaned_at;
        } ) : null;
        if( IsObject( activeEntry, [ 'id' ] ) ){

          const traitEntryMapping = this.asset.schemeFieldStorage.trait_entry;
          this.field.trait.map( ( trait ) => {
            if( IsUndefined( traitEntryMapping[ trait.name ] ) || !( traitEntryMapping[ trait.name ] in this.asset.entriesMap ) || disabledEntries.includes( +traitEntryMapping[ trait.name ] ) ){
              traitEntryMapping[ trait.name ] = activeEntry.id;
              updateNeeded = true;
            }
          } );
          if( updateNeeded ){
            await this.srv.field.updateSchemeFieldMapping( this.scheme );
          }
        }

        if( this.dom.session.controls ){
          this.ui.entries = [];
          // this.dom.setTimeout( `reset-entries`, () => {
          this.asset.entries.map( ( entry, index ) => {
            const sessionEntry = this.dom.session.controls.get( index );
            if( this.dom.state.isPrimary ) sessionEntry.traits = this._getSessionEntryTraits( entry );
            if( !this.scheme || !entry.orphaned_at ) this.ui.entries.push( sessionEntry );
          } );
          this._handleMultipleEntries();
          return resolve( true );
          // }, 0 );

        }
      }else{
        if( this.dom.session.controls ){
          this.ui.entries = [];
          this.asset.entries.map( ( entry, index ) => {
            const sessionEntry = this.dom.session.controls.get( index );
            if( !this.scheme || !entry.orphaned_at ) this.ui.entries.push( sessionEntry );
          } );
          this._handleMultipleEntries();
        }
        return resolve( true );
      }

    } );
  }


  /**
   * Manage the type of each entry
   * @param ind
   * @private
   */
  private _getEntryActiveConfig( entry: FieldEntry ){
    let value = !entry.orphaned;
    if( IsObject( this.scheme, true ) ){
      if( this.asset.schemeFieldStorage.disabled_entries.includes( entry.id ) ){
        value = false;
      }
    }
    return new SwitchConfig( {
      label: '',
      value: value,
      empty: 'ConvertEmptyToNull',
      tooltip: 'Toggle Visibility',
      facade: true,
      metadata: {
        entry: entry
      },
      // disabled: this.dom.state.hasScheme ? true : false,
      patch: {
        field: 'orphaned_at',
        path: '',
        duration: 0,
        displayIndicator: false,
        callback: async( core: CoreConfig, event: PopBaseEventInterface ) => {
          this.srv.tab.showAsLoading( true );
          if( IsObject( this.scheme, [ 'id' ] ) ){
            if( event.config.control.value ){ // remove from disabled
              this.asset.schemeFieldStorage.disabled_entries.splice( ( <number[]>this.asset.schemeFieldStorage.disabled_entries ).indexOf( +entry.id ), 1 );

            }else{ // add to disabled
              this.asset.schemeFieldStorage.disabled_entries.push( +entry.id );
            }
            console.log( 'here', entry.id, this.asset.schemeFieldStorage.disabled_entries );
            await this._checkFieldEntryTraits();
            await this.srv.field.updateSchemeFieldMapping( this.scheme );
            this.srv.tab.showAsLoading( false );

          }else{
            const orphaned = event.config.control.value ? null : true;
            this.dom.setTimeout( `update-orphaned-at-${entry.id}`, PopRequest.doPatch( `${this.asset.basePath}/${entry.id}`, { orphaned: orphaned }, 1, false ).subscribe( ( res ) => {
              res = GetHttpObjectResult( res );
              this.log.info( `_getEntryActiveConfig`, res );
              this.srv.tab.showAsLoading( false );
            }, ( err ) => {
              this.dom.setError( err, true );
              this.srv.tab.showAsLoading( false );
            } ) );
          }

        }
      }
    } );
  }


  /**
   * Manage the display of each entry
   * @param index
   * @private
   */
  private _getEntryDisplayConfig( entry: FieldEntry ){
//     console.log( '_getEntryDisplayConfig', entry );
    return new InputConfig( {
      label: 'Entry Name',
      value: entry && entry.name ? entry.name : '',
      transformation: 'toTitleCase',
      disabled: this.dom.state.hasScheme ? true : false,
      patch: {
        field: 'name',
        path: entry && entry.id ? `${this.asset.basePath}/${entry.id}` : null,
        metadata: {
          orphaned: -1
        }
      },
      maxlength: 20,
      // validators: [ Validators.required ],
      // minimal: true
    } );
  }


  private _isMultipleActiveEntries(): boolean{
    let active = 0;
    this.ui.entries.map( ( entry ) => {
      if( StorageGetter( entry, [ 'active', 'control', 'value' ], false ) ){
        active++;
      }
    } );
    this.log.info( `_isMultipleActiveEntries`, active );
    return active > 1;
  }


  private _disableActiveEntries(){
    this.log.info( `_disableActiveEntries` );
    this.ui.entries.map( ( entry: FieldEntrySession ) => {
      if( StorageGetter( entry, [ 'active', 'control', 'value' ], false ) ){
        entry.active.disabled = true;
        entry.active.control.disable();
      }
    } );
  }


  private _enableActiveEntries(){
    this.log.info( `_enableActiveEntries` );
    this.ui.entries.map( ( entry: FieldEntrySession ) => {
      if( StorageGetter( entry, [ 'active', 'control', 'value' ], false ) ){
        entry.active.disabled = false;
        entry.active.control.enable();
      }
    } );
  }
}


export interface FieldEntrySession {
  id: number;
  type: SelectConfig;
  display: InputConfig;
  active: SwitchConfig;
  traits?: { name: string, selected: boolean }[];
  increment: number;
}
