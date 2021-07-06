import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { PopDomService } from '../../../../services/pop-dom.service';
import { PopExtendComponent } from '../../../../pop-extend.component';
import { PopFieldEditorService } from '../pop-entity-field-editor.service';
import { CoreConfig, Dictionary, FieldInterface, PopBaseEventInterface, ServiceInjector } from '../../../../pop-common.model';
import { FieldItemModel, FieldItemModelConfig, IsValidFieldPatchEvent, SessionEntityFieldUpdate } from '../../pop-entity-utility';
import { IsObject, IsObjectThrowError, JsonCopy, StorageGetter } from '../../../../pop-common-utility';
import { SwitchConfig } from '../../../base/pop-field-item/pop-switch/switch-config.model';


@Component( {
  selector: 'lib-pop-entity-field-details',
  templateUrl: './pop-entity-field-details.component.html',
  styleUrls: [ './pop-entity-field-details.component.scss' ]
} )
export class PopEntityFieldDetailsComponent extends PopExtendComponent implements OnInit, OnDestroy {
  @Input() field: FieldInterface;

  public name = 'PopEntityFieldDetailsComponent';


  protected srv: {
    field: PopFieldEditorService,
  };

  protected asset = {};

  public ui = {
    field: <FieldInterface>undefined,
    customSetting: <Dictionary<any>>{},
    multiple: <SwitchConfig>undefined,
  };


  protected extendServiceContainer(){
    this.srv = {
      field: this.fieldRepo,
    };
    delete this.fieldRepo;
  }


  constructor(
    public el: ElementRef,
    protected _domRepo: PopDomService,
    private fieldRepo: PopFieldEditorService,
  ){
    super();

    this.extendServiceContainer();

    this.dom.configure = (): Promise<boolean> => {
      return new Promise( ( resolve ) => {
        this.core = IsObjectThrowError( this.core, true, `${this.name}:configureDom: - this.core` ) ? this.core : null;
        if( !this.field ) this.field = IsObjectThrowError( this.core, [ 'entity' ], `Invalid Core` ) && IsObjectThrowError( this.core.entity, [ 'id', 'fieldgroup' ], `Invalid Field` ) ? <FieldInterface>this.core.entity : null;
        this._buildCustomSettings();
        return resolve( true );
      } );
    };

    this.dom.proceed = (): Promise<boolean> => {
      return new Promise( ( resolve ) => {
        return resolve( true );
      } );
    };


  }


  ngOnInit(){
    super.ngOnInit();
  }


  /**
   * Event handler for the parent tab to tell this name to reset itself
   * @param reset
   */
  onBubbleEvent( event: PopBaseEventInterface ){
    this.log.event( `onBubbleEvent`, event );
    if( IsValidFieldPatchEvent( this.core, event ) ){
      this.events.emit( event );
    }
  }


  // /**
  //  * Catch changes on custom setting fields and update them
  //  * @param event
  //  */
  // onCustomSettingEvent(event: PopBaseEventInterface){
  //   if( IsValidFieldPatchEvent(this.core, event) ){
  //     this.dom.setTimeout(event.config.name, () => {
  //       this.srv.field.storeCustomSetting(this.core, event).then(() => true);
  //     }, 250);
  //   }
  // }


  ngOnDestroy(){
    super.ngOnDestroy();
  }


  /************************************************************************************************
   *                                                                                              *
   *                                      Under The Hood                                          *
   *                                    ( Private Method )                                        *
   *                                                                                              *
   ************************************************************************************************/

  private _buildCustomSettings(){
    const allowMultiple = this.srv.field.getViewMultiple( this.field.fieldgroup.name );
    if( allowMultiple ){
      let multiple = StorageGetter( this.core.repo, [ 'model', 'field', 'multiple' ] );
      if( IsObject( multiple, [ 'model' ] ) ){
        multiple = JsonCopy( multiple );
        this.ui.multiple = new SwitchConfig( FieldItemModelConfig( this.core, FieldItemModel( this.core, multiple.model ) ) );
        this.ui.multiple.patch.callback = ( core: CoreConfig, event: PopBaseEventInterface ) => {
          SessionEntityFieldUpdate( this.core, event );
          this.srv.field.triggerFieldPreviewUpdate();
        };
      }
    }

    // if( IsObject(this.ui.field.custom_setting, true) ){
    //   Object.keys(this.ui.field.custom_setting).map((settingName) => {
    //     const setting = this.ui.field.custom_setting[ settingName ];
    //     const component = this.srv.field.getCustomSettingComponent(this.core, this.ui.field, setting);
    //     component.position = this.position;
    //     this.ui.customSetting[ setting.name ] = component;
    //   });
    // }
  }


}
