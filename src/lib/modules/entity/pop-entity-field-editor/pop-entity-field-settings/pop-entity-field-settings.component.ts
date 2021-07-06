import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { PopExtendComponent } from '../../../../pop-extend.component';
import { PopDomService } from '../../../../services/pop-dom.service';
import { PopFieldEditorService } from '../pop-entity-field-editor.service';
import { IsObject, IsObjectThrowError, StorageGetter, StorageSetter } from '../../../../pop-common-utility';
import { Dictionary, FieldInterface, PopBaseEventInterface } from '../../../../pop-common.model';
import { EntitySchemeSectionInterface } from '../../pop-entity-scheme/pop-entity-scheme.model';


@Component( {
  selector: 'lib-pop-entity-field-settings',
  templateUrl: './pop-entity-field-settings.component.html',
  styleUrls: [ './pop-entity-field-settings.component.scss' ],
} )
export class PopEntityFieldSettingsComponent extends PopExtendComponent implements OnInit, OnDestroy {
  @Input() field: FieldInterface;
  @Input() scheme: EntitySchemeSectionInterface;
  public name = 'PopEntityFieldSettingsComponent';


  protected srv = {
    field: <PopFieldEditorService>undefined,
  };

  protected asset = {
    schemeFieldSetting: <Dictionary<any>>{},
  };


  /**
   * @param el
   * @param _domRepo - transfer
   * @param _fieldRepo - transfer
   */
  constructor(
    public el: ElementRef,
    protected _domRepo: PopDomService,
    protected _fieldRepo: PopFieldEditorService,
  ){
    super();

    /**
     * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
     */
    this.dom.configure = (): Promise<boolean> => {
      return new Promise( ( resolve ) => {
        this.core = IsObjectThrowError( this.core, true, `${this.name}:configure: - this.core` ) ? this.core : null;
        this.field = <FieldInterface>this.core.entity;
        if( StorageGetter( this.dom, [ 'repo', 'position', String( this.position ), 'height' ], false ) ){
          this.dom.overhead = 60;
          this.dom.height.outer = +this.dom.repo.position[ this.position ].height - 300;
          this.dom.setHeight( this.dom.repo.asset[ this.dom.height.outer ], this.dom.overhead );
        }
        if( IsObject( this.scheme ) ){
          this.asset.schemeFieldSetting = this.srv.field.getSchemeFieldSetting( this.scheme, +this.field.id );
//           console.log( 'scheme field', this.asset.schemeFieldSetting );
        }
        this.dom.state.hasScheme = IsObject( this.scheme, true ) ? true : false;
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
   * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
   */
  ngOnDestroy(){
    super.ngOnDestroy();
  }

}
