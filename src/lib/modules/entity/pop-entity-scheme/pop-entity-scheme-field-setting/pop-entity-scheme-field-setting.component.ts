import { Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { PopExtendDynamicComponent } from '../../../../pop-extend-dynamic.component';
import { PopDomService } from '../../../../services/pop-dom.service';
import { EntitySchemeSectionInterface } from '../pop-entity-scheme.model';
import { InputConfig } from '../../../base/pop-field-item/pop-input/input-config.model';
import { CoreConfig, Dictionary, FieldCustomSettingInterface, FieldInterface, PopBaseEventInterface, PopEntity, PopPipe } from '../../../../pop-common.model';
import { PopFieldEditorService } from '../../pop-entity-field-editor/pop-entity-field-editor.service';
import { SwitchConfig } from '../../../base/pop-field-item/pop-switch/switch-config.model';
import { IsArray, IsNumber, IsObject, IsString, StorageGetter, StorageSetter } from '../../../../pop-common-utility';
import { PopEntitySchemeService } from '../pop-entity-scheme.service';
import { MatDialogRef } from '@angular/material/dialog';
import { PopEntityFieldSettingsComponent } from '../../pop-entity-field-editor/pop-entity-field-settings/pop-entity-field-settings.component';
import { PopEntityUtilFieldService } from '../../services/pop-entity-util-field.service';


@Component( {
  selector: 'lib-pop-entity-scheme-field-setting',
  templateUrl: './pop-entity-scheme-field-setting.component.html',
  styleUrls: [ './pop-entity-scheme-field-setting.component.scss' ],
  providers: [ PopFieldEditorService, PopDomService ],
} )
export class PopEntitySchemeFieldSettingComponent extends PopExtendDynamicComponent implements OnInit, OnDestroy {
  @ViewChild( 'container', { read: ViewContainerRef, static: true } ) public container;
  @Input() config: EntitySchemeSectionInterface = <EntitySchemeSectionInterface>{};

  public name = 'PopEntitySchemeFieldSettingComponent';


  protected srv = {
    field: <PopFieldEditorService>undefined,
    utilField: <PopEntityUtilFieldService>undefined,
  };

  protected asset = {
    currentFieldTraitEntryMapping: <any>undefined,
    currentPrimary: <any>undefined,
    fieldTraitEntryMapping: <any>undefined,
    fieldCore: <CoreConfig>undefined,
    field: <FieldInterface>undefined,
    scheme: <EntitySchemeSectionInterface>undefined,
    storage: <any>undefined,
  };

  public ui = {
    name: <InputConfig>undefined,

    makePrimary: <SwitchConfig>undefined,

    showName: <SwitchConfig>undefined,
    showNameCore: <CoreConfig>undefined,
    profileRequired: <SwitchConfig>undefined,
  };


  @HostListener( 'document:keydown.escape', [ '$event' ] ) onEscapeHandler( event: KeyboardEvent ){
    console.log( 'esc', event );
    this.onFormClose();
  }


  constructor(
    public el: ElementRef,
    public dialog: MatDialogRef<PopEntitySchemeFieldSettingComponent>,
    protected _domRepo: PopDomService,
    protected _fieldRepo: PopFieldEditorService,
    protected _utilFieldRepo: PopEntityUtilFieldService,
  ){
    super();

    /**
     * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
     */
    this.dom.configure = (): Promise<boolean> => {
      return new Promise( async( resolve ) => {

        await this._setInitialConfig();
        this.template.attach( 'container' );


        this._templateRender();


        return resolve( true );
      } );
    };


  }


  onFormClose(){
    if( IsObject( this.dialog ) ){
      this.dialog.close( this.core.entity );
    }
  }


  onOutsideCLick(){
    console.log( 'onOutsideCLick' );
    // if( IsObject( this.dialog ) ){
    //   this.dialog.close(this.config);
    // }
  }


  /**
   * This component should have a specific purpose
   */
  ngOnInit(){
    super.ngOnInit();
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


  private _setInitialConfig(): Promise<boolean>{
    return new Promise( async( resolve ) => {

      this.asset.fieldCore = await PopEntity.getCoreConfig( 'field', this.config.asset_id );
      this.asset.field = <FieldInterface>this.asset.fieldCore.entity;
      this.asset.scheme = <EntitySchemeSectionInterface>this.core.entity;
      // this.asset.scheme.traits = this.srv.field.getFieldTraits( this.asset.field.fieldgroup.name );
      this.dom.state.isMultipleValues = +this.asset.field.multiple === 1;
      await this.srv.field.register( this.asset.fieldCore, this.dom.repo, this.asset.scheme );
      this.ui.showName = StorageGetter( this.dom.repo, 'ui.customSetting.show_name.inputs.config'.split( '.' ), null );
      this.ui.showNameCore = StorageGetter( this.dom.repo, 'ui.customSetting.show_name.inputs.core'.split( '.' ), null );

      this.srv.utilField.clearCustomFieldCache( +this.core.entity.id );


      this.ui.name = new InputConfig( {
        name: 'label',
        label: 'Name',
        value: this.config.asset.label,
        readonly: true,
        facade: true,
        patch: {
          field: 'label',
          path: ''
        }
      } );

      if( 'make_primary' in this.asset.field.setting ){
        const primary = this.srv.field.getSchemePrimary( this.asset.scheme );
        const fieldGroupName = StorageGetter( this.asset.field, [ 'fieldgroup', 'name' ] );
        const isPrimary = +primary[ fieldGroupName ] === +this.asset.field.id;
        this.asset.currentPrimary = IsNumber( primary[ fieldGroupName ] ) ? +primary[ fieldGroupName ] : null;
        this.asset.currentFieldTraitEntryMapping = this.srv.field.getSchemeFieldSection( this.asset.scheme, +this.asset.field.id, 'trait_entry' );
        this.asset.storage = this.srv.field.getSchemeFieldSetting( this.asset.scheme, +this.asset.field.id );
        // console.log( 'currentPrimary', this.asset.currentPrimary );
        // console.log( 'currentFieldEntityMapping', this.asset.currentFieldTraitEntryMapping );


        this.asset.fieldTraitEntryMapping = {};
        if( IsArray( this.asset.field.trait, true ) ){
          this.asset.field.trait.map( ( trait ) => {
            this.asset.fieldTraitEntryMapping[ trait.name ] = this.asset.field.entries[ 0 ].id;
          } );
        }
        // console.log( 'fieldTraitEntryMapping', this.asset.fieldTraitEntryMapping );
        if( IsObject( primary ) && IsString( fieldGroupName, true ) ){
          this.ui.makePrimary = new SwitchConfig( {
            label: `Primary ${this.asset.field.fieldgroup.label}`,
            value: isPrimary,
            disabled: isPrimary,
            facade: true,
            patch: {
              field: '',
              path: '',
              callback: async( core: CoreConfig, event: PopBaseEventInterface ) => {
                this.dom.setTimeout( `update-primary`, async() => {
                  if( event.config.control.value ){
                    primary[ fieldGroupName ] = +this.asset.field.id;
                    this.asset.storage.entity_trait = this.asset.fieldTraitEntryMapping;
                  }else{
                    primary[ fieldGroupName ] = this.asset.currentPrimary;
                    this.asset.storage.entity_trait = this.asset.currentFieldTraitEntryMapping;
                  }
                  await this.srv.field.updateSchemePrimaryMapping( this.asset.scheme );
                  this._templateRender();
                } );

              }
            }
          } );
        }
      }
      const required = <number[]>this.srv.field.getSchemeRequired( this.asset.scheme );
      const isRequired = required.includes( +this.asset.field.id );
      this.ui.profileRequired = new SwitchConfig( {
        label: `Required To Save ${PopPipe.transform( 'profile', { type: 'entity', arg1: 'alias', arg2: 'singular' } )}`,
        value: isRequired,
        facade: true,
        patch: {
          field: '',
          path: '',
          callback: ( core: CoreConfig, event: PopBaseEventInterface ) => {
            if( event.config.control.value ){
              required.push( +this.asset.field.id );
            }else{
              required.splice( required.indexOf( +this.asset.field.id ) );
            }
            this.srv.field.updateSchemeRequiredMapping( this.asset.scheme );
          }
        }
      } );

      return resolve( true );
    } );

  }


  /**
   * Helper function that renders the list of dynamic components
   *
   */
  private _templateRender(){
    this.template.render( [ {
      type: PopEntityFieldSettingsComponent,
      inputs: {
        core: this.asset.fieldCore,
        field: this.asset.field,
        scheme: this.asset.scheme
      }
    } ], [], true );
  }

}
