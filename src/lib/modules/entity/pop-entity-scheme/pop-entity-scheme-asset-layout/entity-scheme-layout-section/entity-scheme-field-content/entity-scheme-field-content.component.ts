import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { EntitySchemeSectionInterface, ProfileSchemeFieldInterface } from '../../../pop-entity-scheme.model';
import { PopExtendComponent } from '../../../../../../pop-extend.component';
import { ArrayMapSetter, DynamicSort, IsArray, IsObject, SnakeToPascal, TitleCase } from '../../../../../../pop-common-utility';
import { PopEntitySchemeService } from '../../../pop-entity-scheme.service';
import { PopFieldEditorService } from '../../../../pop-entity-field-editor/pop-entity-field-editor.service';
import { Dictionary, FieldCustomSettingInterface, FieldEntry, FieldInterface, KeyMap } from '../../../../../../pop-common.model';


@Component( {
  selector: 'lib-entity-scheme-field-content',
  templateUrl: './entity-scheme-field-content.component.html',
  styleUrls: [ './entity-scheme-field-content.component.scss' ]
} )
export class EntitySchemeFieldContentComponent extends PopExtendComponent implements OnInit, OnDestroy {
  @Input() config: ProfileSchemeFieldInterface = <ProfileSchemeFieldInterface>{};

  public name = 'EntitySchemeFieldContentComponent';

  protected srv = {
    scheme: <PopEntitySchemeService>undefined,
    field: <PopFieldEditorService>undefined,
  };

  protected asset = {
    field: <FieldInterface>undefined,
    groupName: <string>undefined,
    mapping: <any>undefined,
    primary: <any>undefined,
    traits: <FieldCustomSettingInterface[]>undefined,
    traitMap: <Dictionary<number>>{},
    entryTraitMap: <KeyMap<string[]>>{},
  };

  public ui = {
    entries: <FieldEntry[]>[],
    traits: <FieldCustomSettingInterface[]>[],
  };


  /**
   * @param el
   * @param _schemeRepo - transfer
   * @param _fieldRepo - transfer
   */
  constructor(
    public el: ElementRef,
    protected _schemeRepo: PopEntitySchemeService,
    protected _fieldRepo: PopFieldEditorService
  ){
    super();
    this.dom.configure = (): Promise<boolean> => {
      return new Promise( async( resolve ) => {

        await this._setInitialConfig();
        await this._setEntryTraitMap();
        await this._setEntries();

        return resolve( true );
      } );
    };
  }


  /**
   * This component is responsible to render the inner contents of field asset
   * A field asset is custom field that has been created on an entity in the business unit
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
   * Set the initial config of this component
   * @private
   */
  private _setInitialConfig(): Promise<boolean>{
    return new Promise( ( resolve ) => {

      this.asset.field = this.config.asset;
      this.asset.groupName = this.config.asset.fieldgroup.name;
      this.asset.mapping = this.srv.scheme.getFieldMapping( +this.config.asset_id );
      this.asset.primary = this.srv.field.getSchemePrimary( <EntitySchemeSectionInterface>this.core.entity );
      this.dom.state.isPrimary = +this.config.asset_id === this.asset.primary[ this.asset.groupName ];
      this.asset.traits = this.srv.field.getFieldTraits( this.asset.field.fieldgroup.name ).sort( DynamicSort( 'name' ) );
      this.asset.traitMap = ArrayMapSetter( this.asset.traits, 'name' );

      return resolve( true );
    } );
  }


  /**
   * Organizes the trait that should be assigned on this field
   * @private
   */
  private _setEntryTraitMap(): Promise<boolean>{
    return new Promise( ( resolve ) => {
      this.asset.entryTraitMap = {};
      if( IsArray( this.asset.traits, true ) && IsObject( this.asset.mapping.trait_entry, true ) ){
        Object.keys( this.asset.mapping.trait_entry ).map( ( traitName: string ) => {
          const entryId = +this.asset.mapping.trait_entry[ traitName ];
          if( +entryId ){
            if( !( IsArray( this.asset.entryTraitMap[ entryId ] ) ) ){
              this.asset.entryTraitMap[ entryId ] = [];
            }
            this.asset.entryTraitMap[ entryId ].push( traitName );
          }
        } );
      }
      return resolve( true );
    } );
  }


  /**
   * Set the entries of this field
   * @private
   */
  private _setEntries(): Promise<boolean>{
    return new Promise( ( resolve ) => {
      this.ui.entries = [];
      this.ui.entries.push( ...this.asset.field.entries );
      if( IsObject( this.config, [ 'asset' ] ) ){
        if( IsArray( this.ui.entries, true ) ){
          this.ui.entries.map( ( entry:FieldEntry ) => {
            entry.disabled = IsArray( this.asset.mapping.disabled_entries, true ) && this.asset.mapping.disabled_entries.includes( +entry.id );
            entry.traits = this._getEntryTraits( entry );
          } );
          this.ui.entries.sort( DynamicSort( 'sort_order' ) );
        }
      }
      return resolve( true );
    } );
  }


  /**
   * Set the traits that belong to a field entry
   * @param entry
   * @private
   */
  private _getEntryTraits( entry: FieldEntry ): FieldCustomSettingInterface[]{
    const traits = [];
    if( IsObject( entry, [ 'id' ] ) && IsArray( this.asset.traits, true ) && this.dom.state.isPrimary ){
      if( entry.id in this.asset.entryTraitMap && IsArray( this.asset.entryTraitMap[ entry.id ], true ) ){
        this.asset.entryTraitMap[ entry.id ].map( ( traitName: string ) => {
          if( traitName in this.asset.traitMap ){
            const trait = this.asset.traits[ this.asset.traitMap[ traitName ] ];
            if( IsObject( trait, [ 'icon', 'name' ] ) ){
              if( !trait.label ) trait.label = TitleCase( SnakeToPascal( trait.name ) );
              traits.push( trait );
            }
          }
        } );
      }
    }

    return traits;
  }
}
