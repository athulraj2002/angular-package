import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {PopExtendDynamicComponent} from '../../../../pop-extend-dynamic.component';
import {PopEntityService} from '../../services/pop-entity.service';
import {PopFieldEditorService} from '../pop-entity-field-editor.service';
import {
  CoreConfig,
  DynamicComponentInterface,
  Entity,
  FieldConfig, FieldEntry,
  FieldInterface,
  FieldItemInterface,
  PopBaseEventInterface, PopLog, PopTemplate,
  ServiceInjector
} from '../../../../pop-common.model';
import {PopEntityFieldComponent} from '../../pop-entity-field/pop-entity-field.component';
import {SelectConfig} from '../../../base/pop-field-item/pop-select/select-config.model';
import {PopDomService} from '../../../../services/pop-dom.service';
import {DynamicSort, IsArray, IsObject, IsObjectThrowError, SpaceToSnake} from '../../../../pop-common-utility';
import {IsValidFieldPatchEvent} from '../../pop-entity-utility';
import {PopEntityUtilFieldService} from '../../services/pop-entity-util-field.service';


@Component({
  selector: 'lib-field-editor-preview',
  templateUrl: './pop-entity-field-preview.component.html',
  styleUrls: ['./pop-entity-field-preview.component.scss']
})
export class PopEntityFieldPreviewComponent extends PopExtendDynamicComponent implements OnInit, OnDestroy {
  @Input() field: FieldInterface;
  @ViewChild('container', {read: ViewContainerRef, static: true}) private container;
  public name = 'PopEntityFieldPreviewComponent';

  protected asset = {
    field: <FieldInterface>undefined,
    fieldgroup: <Entity>undefined,
    columnKeys: <string[]>undefined,
  };

  public ui = {
    stateSelector: new SelectConfig({
      label: 'State',
      value: 'template_edit',
      options: {
        values: [
          {value: 'template_edit', name: 'Template Access'},
          {value: 'template_readonly', name: 'Template Readonly'},
          {value: 'text_single', name: 'Text Single'},
          {value: 'text_format', name: 'Text Format'},
        ]
      }
    }),
    field: <FieldConfig>undefined
  };

  protected srv = {
    entity: <PopEntityService>ServiceInjector.get(PopEntityService),
    editor: <PopFieldEditorService>ServiceInjector.get(PopFieldEditorService),
    field: <PopEntityUtilFieldService>ServiceInjector.get(PopEntityUtilFieldService),
  };


  constructor(
    public el: ElementRef,
    protected _domRepo: PopDomService
  ) {
    super();


    this.dom.configure = (): Promise<boolean> => {

      return new Promise((resolve) => {


        this.dom.handler.bubble = (core: CoreConfig, event: PopBaseEventInterface) => this.onBubbleEvent(event);

        //  Verify configs
        this.core = IsObjectThrowError(this.core, ['entity'], `${this.name}:configureDom: - this.core`) ? this.core : null;
        this.field = IsObjectThrowError(this.core.entity, ['fieldgroup', 'entries'], `${this.name}:configureDom: - this.core`) ? <FieldInterface>this.core.entity : null;
        this.asset.fieldgroup = this.field.fieldgroup;
        // Create form session container to persist use input values
        this.dom.session.form = {};
        // Attach the container for the preview html
        this.template.attach('container');
        // Get a default set of data to populate the preview field items with
        this.asset.columnKeys = this.core.entity.items.map((item) => {
          return String(SpaceToSnake(item.name)).toLowerCase();
        });
        // this.asset.defaultData = this.srv.field.getDefaultValues(String(this.core.entityId.corefield.internal_name).toLowerCase(), this.asset.columnKeys);

        if (this.dom.session.stateSelector) this.ui.stateSelector.control.setValue(this.dom.session.stateSelector, {emitEvent: true});

        // Handle events
        this.dom.handler.core = (core: CoreConfig, event: PopBaseEventInterface) => {
          this.log.event(`_coreEventHandler`, event);
          if (IsValidFieldPatchEvent(this.core, event) || (event.type === 'component' && (event.name === 'active-item' || event.name === 'update'))) {
            this._triggerFieldPreview();
          } else {
            PopLog.warn(this.name, `Preview did not recognize event`, event);
          }
        };


        this._triggerFieldPreview(250);
        return resolve(true);
      });
    };


    /**
     * This function will call after the dom registration
     */
    this.dom.proceed = (): Promise<boolean> => {
      return new Promise((resolve) => {
        this._setDataSession();
        return resolve(true);
      });
    };
  }


  /**
   * We expect the core to represent a field
   * This component represents what the view of the current field will look like
   * The component relies upon the FieldBuilderItemsComponent && FieldBuilderItemSettingsComponent to communicate when settings are changed so that the view can render the changes
   */
  ngOnInit() {
    super.ngOnInit();
  }


  /**
   * This handler manages events that come up from the preview fields, mostly just to session any values that the user enters, and simulate adding removing value entries
   * The field input is saved because the setFieldPreview destroys the component and is called often, and the user should not have to re-enter test data every time a setting is changed
   * @param event
   */
  onBubbleEvent(event: PopBaseEventInterface) {
    this.log.event(`onBubbleEvent`, event);
    if (IsObject(event, ['type', 'name']) && event.type === 'field') {
      if (event.name === 'onFocus') {
        // stub
      } else if (event.name === 'onBlur' || event.name === 'patch') { // whenever a user blurs out of field save the data that is in it
        if (event.config && event.config.control && event.config.control.value) {
          this.dom.session.form[event.config.name] = event.config.control.value;
          this.dom.store('onSession'); // dom.store must be called to for the dom to transfer its data up to the domRepo
        }
      } else if (event.name === 'add') { // whenever a user blurs out of field save the data that is in it
        this._addFieldValue();
      } else if (event.name === 'remove') { // whenever a user blurs out of field save the data that is in it
        this._removeFieldValue();
      }
    }
  }


  /**
   * Clean up the dom of this component
   */
  ngOnDestroy() {
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
   * Create a new field label
   */
  private _addFieldValue() {
    if (IsObject(this.ui.field, true)) {
      if (this.dom.session.records < this.ui.field.multiple_max_limit) {
        this.dom.session.records++;
        this._triggerFieldPreview(0);
      }

    }
  }


  /**
   * Remove an existing label
   */
  private _removeFieldValue() {
    if (IsObject(this.ui.field, true)) {
      if (this.dom.session.records > this.ui.field.multiple_min) {
        this.dom.session.records--;
        this._triggerFieldPreview(0);
      }
    }
  }


  /**
   * Create sets of mock data for the fields entries
   */
  private _setDataSession() {
    if (!this.dom.session.records) this.dom.session.records = this.field.multiple_min;
    let index = 0;
    if (!this.dom.session.data) {
      this.dom.session.data = new Map();
      while (index < 10) {
        const defaultValues = this.srv.editor.getDefaultValues(String(this.asset.fieldgroup.name).toLowerCase());
        this.dom.session.data.set(index, defaultValues);
        index++;
      }
      this.dom.store('session');
    }
  }


  /**
   * Debounce the requests to reset the preview
   * @param delay
   */
  private _triggerFieldPreview(delay = 250) {
    this.dom.setTimeout('field-preview', () => {
      this._setFieldPreview();
    }, delay);
  }


  /**
   * This will create a facade field that will a dynamically try to replicate how the field will look when it is in use
   */
  private _setFieldPreview() {
    if (this.dom.repo.ui.activeItems) {

      PopTemplate.clear();

      const items = <any[]>this.field.items;

      const entries = IsArray(this.field.entries, true) ? this.field.entries.filter((entry: FieldEntry) => {
        return !entry.orphaned_at;
      }).sort(DynamicSort('sort_order')) : [];

      const fieldInterface = {
        id: 1,
        facade: true, // set to trigger demo like actions
        canAdd: false,
        canRemove: false,
        configs: this.field.configs,
        name: this.field.name,
        label: this.field.label,
        entries: entries,
        fieldgroup: this.asset.fieldgroup,
        internal_name: String(this.asset.fieldgroup.name).toLowerCase(),
        multiple: this.field.multiple,
        // multiple_min: this.field.multiple_min,
        multiple_min: entries.length,
        // multiple_max: this.field.multiple_max,
        multiple_max: entries.length,
        multiple_max_limit: 4,

        data: {},
        show_name: !!this.core.entity.show_name,
        sort: 0,
        state: this.ui.stateSelector.control.value,
        items: <FieldItemInterface[]>[]
      };

      if (fieldInterface.multiple) {
        // if( !fieldInterface.multiple_min ) fieldInterface.multiple_min = 1;
        if (!fieldInterface.multiple_min) fieldInterface.multiple_min = entries.length;
        // let valueIndex = 0;
        let records = this.dom.session.records;
        if (records < +fieldInterface.multiple_min) records = +fieldInterface.multiple_min;
        if (+fieldInterface.multiple_max && records > fieldInterface.multiple_max) records = fieldInterface.multiple_max;
        // while( valueIndex < records ){
        //   fieldInterface.data[ valueIndex ] = this.dom.session.data.get( valueIndex );
        //   valueIndex++;
        // }
        entries.map((entry, index) => {
          fieldInterface.data[entry.id] = this.dom.session.data.get(index);
        });
      } else {
        const singleEntry = entries[0];
        fieldInterface.data[singleEntry.id] = this.dom.session.data.get(0);
      }


      fieldInterface.items = items.filter((item) => {
        return +this.dom.repo.ui.activeItems[item.id] === 1;
      }).map((item) => {
        item.facade = true;
        item.showMask = true;
        item.bubble = true;
        delete item.api;
        return item;
      });

      this.ui.field = this.srv.field.buildCustomField(this.core, fieldInterface);


      if (this.ui.field) {
        const previewComponentList: DynamicComponentInterface[] = [];
        const component = <DynamicComponentInterface>{
          type: PopEntityFieldComponent,
          inputs: {
            core: this.core,
            field: this.ui.field,
          }
        };
        previewComponentList.push(component);
        this.template.render(previewComponentList, [], true);
      }
    }
    this.dom.ready();
  }


}
