import { Component, ElementRef, Input, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import {
  Dictionary,
  DynamicComponentInterface,
  FieldInterface,
  FieldItemInterface,
  PopBaseEventInterface,
  SectionInterface,
  ServiceInjector
} from '../../../../pop-common.model';
import { CheckboxConfig } from '../../../base/pop-field-item/pop-checkbox/checkbox-config.model';
import { InputConfig } from '../../../base/pop-field-item/pop-input/input-config.model';
import { MatDialogRef } from '@angular/material/dialog';
import { Validators } from '@angular/forms';
import { FieldInputSettingComponent } from './params/field-input-setting.component';
import { FieldLabelSettingComponent } from './params/field-label-setting.component';
import { FieldSelectSettingComponent } from './params/field-select-setting.component';
import { FieldSwitchSettingComponent } from './params/field-switch-setting.component';
import { FieldRadioSettingComponent } from './params/field-radio-setting.component';
import { FieldTextareaSettingComponent } from './params/field-textarea-setting.component';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { PopContainerService } from '../../../../services/pop-container.service';
import { PopExtendDynamicComponent } from '../../../../pop-extend-dynamic.component';
import { PopFieldEditorService } from '../../pop-entity-field-editor/pop-entity-field-editor.service';
import { PopDomService } from '../../../../services/pop-dom.service';
import {
  ArrayKeyBy,
  ArrayMapSetter,
  CleanObject,
  IsArrayThrowError,
  IsObject,
  IsObjectThrowError,
  IsStringError,
  SnakeToPascal,
  TitleCase
} from '../../../../pop-common-utility';
import { EntitySchemeSectionInterface } from '../pop-entity-scheme.model';


@Component({
  selector: 'lib-pop-entity-asset-field-modal',
  templateUrl: './pop-entity-asset-field-modal.component.html',
  styleUrls: [ './pop-entity-asset-field-modal.component.scss' ],
  providers: [ PopContainerService ]
})
export class PopEntityAssetFieldModalComponent extends PopExtendDynamicComponent implements OnInit, OnDestroy {
  @Input() config: EntitySchemeSectionInterface = <EntitySchemeSectionInterface>{};
  public name = 'PopEntityAssetFieldModalComponent';

  protected srv: {
    container: PopContainerService,
    field: PopFieldEditorService,
  } = {
    container: <PopContainerService>undefined,
    field: ServiceInjector.get(PopFieldEditorService),
  };

  protected asset = {
    defaultContentHeight: <number>undefined,
    model: new Map(),
    config: new Map(),
    coreField: <FieldInterface>undefined,
    coreFields: <Dictionary<FieldInterface>>undefined,
    coreFieldItems: <Dictionary<FieldItemInterface>>undefined,
    params: <Dictionary<any>>undefined,
    map: <Dictionary<any>>{}
  };

  public ui = {
    activeConfigs: <Dictionary<any>>{},
    field: <FieldInterface>undefined,
    name: <InputConfig>undefined,
    items: <any[]>[],
    sections: <SectionInterface[]>[],
    map: {
      items: <Dictionary<number>>{}
    }
  };


  protected extendServiceContainer(){
    this.srv.container = this._containerRepo;
    delete this._containerRepo;
  }


  constructor(
    public el: ElementRef,
    public dialogRef: MatDialogRef<PopEntityAssetFieldModalComponent>,
    protected _containerRepo: PopContainerService,
    protected _domRepo: PopDomService,
  ){
    super();
    this.extendServiceContainer();

    this.srv.container.onContainerCreated((container: ViewContainerRef) => {
      this.template.attach(container);
      this._setActiveItemParamConfiguration();
    });


    /**
     * Configure the specifics of this component
     */
    this.dom.configure = (): Promise<boolean> => {
      return new Promise((resolve) => {
        this.internal_name = IsStringError(this.config.asset.fieldgroup.name, true, `${this.name}:configureDom - internal_name`) ? this.config.asset.fieldgroup.name : '';
        const defaultHeight = +(window.innerHeight * .75) - 60;
        this.dom.setHeight(defaultHeight, 50);
          this.dom.height.content = this.dom.height.inner - 200;
          this.dom.active.items = {};
          this.asset.defaultContentHeight = this.dom.height.content;
          this.asset.coreFields = IsArrayThrowError(this.core.resource.fields.data_values, true, `${this.name}: - this.core.entity.resource.fields`) ? ArrayKeyBy(this.core.resource.fields.data_values, 'name') : {};
          this.asset.params = this.srv.field.getViewParams();
          this.asset.coreField = IsObjectThrowError(this.asset.coreFields[ this.internal_name ], true, `${this.name}: - this.asset.coreFields[ this.internal_name ]`) ? this.asset.coreFields[ this.internal_name ] : {};
          this.asset.coreFieldItems = IsArrayThrowError(this.asset.coreField.items, true, `${this.name}: - this.asset.coreField.items`) ? ArrayKeyBy(<any>this.asset.coreField.items, 'name') : {};


          this.ui.field = <FieldInterface>this.config.asset;
          this.ui.sections = [];
          this.ui.name = new InputConfig({
            value: this.ui.field.name,
            readonly: true
          });

          this.ui.map.items = {};
          const items = IsArrayThrowError(this.config.asset.items, true, `${this.name}:configureDom: - this.config.asset.items`) ? JSON.parse(JSON.stringify(this.config.asset.items)) : [];
          // const items = this.srv.common.isArray(this.config.asset.items, true, `${this.name}:configureDom - items`) ? JSON.parse(JSON.stringify(this.asset.coreField.items)) : {};
          items.map((item, index) => {
            item = CleanObject(item, {
              blacklist: [ 'entries', 'object_name', 'depth_level', 'storage' ]
            });
            const coreFieldItem = <any>this.asset.coreFieldItems[ item.name ];
            coreFieldItem.rules = ArrayKeyBy(coreFieldItem.itemrules, 'name');
            // console.log('coreFieldItem', coreFieldItem);
            item.required = this.srv.field.getViewRequired(this.asset.coreField.name, item.name);

            if( item.required ) item.active = 1;
            if( +item.active ){
              item.name = SnakeToPascal(item.name);
              item.model = {
                id: item.id,
                name: item.name,
                label: item.label,
              };
              item.config = {
                options: {
                  values: item.options
                }
              };

              if( IsObject(item.view, [ 'name' ]) ) item.model.form = item.view.name;
              if( IsObject(item.rules, true) ) item.model = { ...item.model, ...item.rules };
              if( IsObject(item.settings, true) ) item.model = { ...item.model, ...item.settings };
              this.dom.active.items[ item.name ] = item.active;
              this.asset.model.set(item.name, item.model);
              this.asset.config.set(item.name, item.config);
              this.ui.activeConfigs[ item.name ] = new CheckboxConfig({
                id: item.id,
                name: 'active',
                disabled: item.required ? true : false,
                value: +item.active,
                // patch: column.required ? null : {
                //   field: 'active',
                //   path: `cis/fields/${this.config.id}/item/${column.id}`,
                //   displayIndicator: false,
                // }
              });
              this.ui.items.push(item);
            }
            this.ui.map.items[ item.name ] = index;
          });

          this.ui.sections = <SectionInterface[]>[
            {
              id: 'params',
              name: 'Params',
              inputs: {},
              component: null,
              metadata: {},
              requireRefresh: false,        // require an api call to refresh the entity on every load
              active: true,
            },
            {
              id: 'options',
              name: 'Options',
              inputs: {},
              component: null,
              metadata: {},
              requireRefresh: false,        // require an api call to refresh the entity on every load
              active: true,
            },
            // {
            //   id: 'defaultValues',
            //   name: 'Default Values',
            //   inputs: {},
            //   component: DemoTwoComponent,
            //   metadata: {},
            //   requireRefresh: false,        // require an api call to refresh the entity on every load
            // }
          ];


          if( this.ui.items[ 0 ] ){
            // this.onSelection(this.ui.items[ 0 ]);
            // if( this.dom.active.item ){
            // setTimeout(() => {
            this.onActiveItemSelection(this.ui.items[ 0 ]);
            // });
            // }
          }
          return resolve(true);
        });
    };
  }


  /**
   * This component will allow a user to configure custom settings for each of items that it holds
   * The CoreConfig of this component will be a specific scheme
   * The config of this component is expected to be a scheme asset that is of type field
   */
  ngOnInit(){
    super.ngOnInit();
  }


  /**
   * The user will be able to active/deactive a specific item in the list of items for this field
   * @param item
   */
  onItemStatusChange(event: PopBaseEventInterface){
    if( event.type === 'field' && event.name === 'patch' && event.success ){
      this.log.event('onItemStatusChange', event);
      this.dom.active.items[ event.config.id ] = +event.config.control.value;
    }
  }


  /**
   * The user will be able to select from a list of item an active item in which to configure settings
   * @param item
   */
  onActiveItemSelection(item){
    console.log('onActiveItemSelection', item);
    this.dom.active.item = item;
    if( this.dom.active.item.options ) this._setActiveItemOptionConfiguration();
    this.dom.active.model = IsObjectThrowError(this.dom.active.item.model, true, `${this.name}:onSelection - model`) ? JSON.parse(JSON.stringify(this.dom.active.item.model)) : {};
    // this.dom.active.params = IsObjectThrowError(this.dom.active.item.config, true, `${this.name}:onSelection - config`) ? JSON.parse(JSON.stringify(this.dom.active.item.config)) : {};
    // this.dom.active.config = IsObjectThrowError(this.config.asset.items[ this.ui.map.items[ item.name ] ].config, true, `${this.name}:onSelection - config`) ? JSON.parse(JSON.stringify(this.config.asset.items[ this.ui.map.items[ item.name ] ].config)) : {};
    if( this.dom.active.item.id && this.dom.session[ this.dom.active.item.id ] ){
      this.onActiveItemSettingSectionSelection(this.dom.session[ this.dom.active.item.id ]);
    }else{
      this.onActiveItemSettingSectionSelection(this.ui.sections[ 0 ]); // params
    }
    this._setActiveItemParamConfiguration();
  }


  /**
   * The user needs the changes it active item options to be saved to the database
   * @param event
   */
  onSaveActiveItemOptions(event: PopBaseEventInterface){
    console.log('triggerSaveFieldOptions:stub', event);
  }


  /**
   * There might be multiple tab sections to the setting of this active item
   * @param section
   */
  onActiveItemSettingSectionSelection(section: SectionInterface){
    this.dom.active.section = section.id;
    this.dom.session[ this.dom.active.item.id ] = section;
  }


  /**
   * The user is able to sort the options that should be used to populate the field, if applicable
   */
  onActiveItemOptionSortDrop(event: CdkDragDrop<string[]>){
    moveItemInArray(this.dom.active.options, event.previousIndex, event.currentIndex);
    this.onSaveActiveItemOptions(<PopBaseEventInterface>{ name: 'onChange' });
  }


  /**
   * The user should be able to click a button to close the modal
   */
  onModalClose(){
    this.dialogRef.close(0);
  }


  /**
   * Clean up the dom of this component
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

  private _setActiveItemParamConfiguration(){
    if( IsObject(this.dom.active.config, true) && IsObject(this.dom.active.params, true) ){
      this._getParamConfigurationComponentList(this.dom.active.config, this.dom.active.params).then((paramComponentList: DynamicComponentInterface[]) => {
        this.template.render(paramComponentList, [], true);
      });
    }
  }


  private _getParamConfigurationComponentList(fieldItem: Dictionary<any>, params: Dictionary<any>): Promise<DynamicComponentInterface[]>{
    return new Promise((resolve) => {
      const paramComponentList: DynamicComponentInterface[] = [];
      let component;
      let configInterface;
      if( this.dom.active.model.form in this.asset.params ){
        Object.keys(params).map((paramKey) => {
          if( paramKey in this.asset.params[ this.dom.active.model.form ] ){
            configInterface = {
              ...{
                name: TitleCase(SnakeToPascal(paramKey)),
                value: fieldItem[ paramKey ],
                column: paramKey,
                readonly: [ 'api', 'column' ].includes(paramKey) ? true : false,
                patch: { field: paramKey, path: `${fieldItem.api_path}/config` }
              }, ...params[ paramKey ]
            };
            configInterface.patch.path = ''; // ToDo: need to be the correct path to save setting to profile_scheme setting storage????
            // console.log('configInterface', configInterface);
            component = <DynamicComponentInterface>{
              type: this._determineParamSettingComponent(paramKey),
              inputs: {
                config: configInterface,
              }
            };
            paramComponentList.push(component);
          }
        });
      }

      resolve(paramComponentList);
    });
  }


  /**
   * Determine the correct component for the form type
   * @param form
   */
  private _determineParamSettingComponent(form){
    switch( form ){
      case 'label':
        return FieldLabelSettingComponent;
        break;
      case 'display':
      case 'api':
      case 'column':
      case 'sort_top':
      case 'sort':
      case 'helpText':
        return FieldInputSettingComponent;
        break;
      case 'select':
      case 'mask':
      case 'pattern':
      case 'maxlength':
      case 'transformation':
        return FieldSelectSettingComponent;
        break;
      case 'hidden':
      case 'visible':
      case 'disabled':
      case 'readonly':
      case 'required':
        return FieldSwitchSettingComponent;
        break;
      case 'layout':
        return FieldRadioSettingComponent;
        break;
      case 'metadata':
        return FieldTextareaSettingComponent;
        break;
      default:
        return FieldLabelSettingComponent;
    }
  }


  private _setActiveItemOptionConfiguration(){
    this.dom.active.options = [];
    if( this.dom.active.item.options && Array.isArray(this.dom.active.item.options.values) ){
      this.dom.active.item.options.values.map((option, index) => {
        option.sort = index;
        if( typeof option.active !== 'boolean' ) option.active = true;
        if( typeof option.name !== 'string' ) option.name = '';
        if( typeof option.value !== 'string' ) option.value = '';
        this.dom.active.options.push({
          active: new CheckboxConfig({
            label: null,
            value: +option.active,
            bubble: true,
          }),
          name: new InputConfig({
            label: null,
            value: option.name,
            validators: [ Validators.required ],
            transformation: 'title',
            bubble: true,
            pattern: 'AlphaNoSpaceOnlyDash',
            maxlength: 12,
            readonly: true
          }),
          value: new InputConfig({
            label: null,
            value: option.value || 0,
            bubble: true,
            pattern: 'AlphaNumeric',
            transformation: 'lower',
            maxlength: 128,
            readonly: true
          }),
          sort: new InputConfig({
            label: null,
            value: option.sort || 0,
            bubble: true,
          }),
        });
      });

    }else{
      this.onActiveItemSettingSectionSelection(this.ui.sections[ 0 ]); // params
    }
  }
}
