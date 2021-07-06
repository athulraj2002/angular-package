import {Component, ElementRef, Inject, Input, OnDestroy, OnInit} from '@angular/core';
import {EntityFieldComponentInterface} from './pop-entity-field.model';
import {
  CoreConfig,
  Dictionary,
  FIELD_CUSTOM_SETTING,
  FieldConfig,
  FieldCustomSettingInterface,
  FieldEntry,
  KeyMap,
  PopBaseEventInterface,
  ServiceInjector
} from '../../../pop-common.model';
import {PopExtendComponent} from '../../../pop-extend.component';
import {
  ArrayMapSetter,
  ConvertArrayToOptionList,
  DeepCopy,
  IsArray,
  IsDefined,
  IsNumber,
  IsObject,
  IsObjectThrowError,
} from '../../../pop-common-utility';
import {SelectConfig} from '../../base/pop-field-item/pop-select/select-config.model';
import {InputConfig} from '../../base/pop-field-item/pop-input/input-config.model';
import {PopDomService} from '../../../services/pop-dom.service';
import {IsValidFieldPatchEvent} from '../pop-entity-utility';
import {PopEntityFieldService} from './pop-entity-field.service';
import {Validators} from '@angular/forms';
import {ButtonConfig} from '../../base/pop-field-item/pop-button/button-config.model';
import {PopConfirmationDialogComponent} from '../../base/pop-dialogs/pop-confirmation-dialog/pop-confirmation-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {PopEntityFieldModalComponent} from './pop-entity-field-modal/pop-entity-field-modal.component';


@Component({
  template: '<div>Boiler</div>',
})
export class PopEntityFieldBoilerComponent extends PopExtendComponent implements EntityFieldComponentInterface, OnInit, OnDestroy {
  @Input() field: FieldConfig;
  public name = 'PopEntityFieldBoilerComponent';

  protected srv: {
    dialog: MatDialog,
    field: PopEntityFieldService,
  } = {
    dialog: ServiceInjector.get(MatDialog),
    field: ServiceInjector.get(PopEntityFieldService),
  };

  public ui = {
    actionBtnWidth: 0,
    asset: <KeyMap<{
      display: InputConfig,
      entry: SelectConfig,
      customLabel: InputConfig,
      actionBtnWidth?: number,
      canCallBtn?: ButtonConfig,
      canTextBtn?: ButtonConfig,
    }>>undefined,
  };


  constructor(
    public el: ElementRef,
    protected _domRepo: PopDomService,
    @Inject(FIELD_CUSTOM_SETTING) public custom_setting: Dictionary<FieldCustomSettingInterface> = {}
  ) {
    super();


    /**
     * This should transformValue and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
     */
    this.dom.configure = (): Promise<boolean> => {
      return new Promise((resolve) => {
        // #1: Enforce a CoreConfig
        this.field = IsObjectThrowError(this.field, ['id', 'data_keys'], `${this.name}:configureDom: - this.field`) ? this.field : null;
        this.id = this.field.id;
        this.ui.asset = {};
        this._setInitialConfig();
        this._transformChildren();


        this.field.data_keys.map((dataKey: number, index) => {
          this.dom.session[dataKey] = {};
          this.dom.session[dataKey].display = {};
          this.dom.state[dataKey] = {
            open: false,
            template: this.field.state,
            footer_adjust: this.field.state,
            customLabel: false
          };
        });

        this.dom.setSubscriber(`parent-event-handler`, this.events.subscribe((event: PopBaseEventInterface) => {
          if (IsObject(event, true)) {
            if (event.name === 'add') {
              this.onAdd(event);
            }
          }
        }));

        // this.srv.field.setFieldEntries(this.field).then(() => {
        //   this.srv.field.setFieldValues(this.field).then(() => {
        //     return resolve(true);
        //   });
        // });

        return resolve(true);
      });
    };

    this.dom.proceed = (): Promise<boolean> => {
      return new Promise((resolve) => {
        this._restoreDomSession();
        this._setAssetConfigs();
        this._setFieldAttributes();
        return resolve(true);
      });
    };
  }


  ngOnInit() {
    super.ngOnInit();
  }


  /**
   * Handle click of action button
   * @param event
   * @param dataKey
   */
  onActionEvent(event: PopBaseEventInterface, dataKey?: number) {
    if (event.type === 'field') {
      switch (String(event.name).toLowerCase()) {
        // case 'add':
        //   this.onAdd(event);
        //   break;
        case 'remove':
          this.onRemove(event, dataKey);
          break;
        case 'edit':
          this.onEdit(event, dataKey);
          break;
        case 'close':
          this.onClose(event, dataKey);
          break;
        default:
          break;
      }
    }
    return true;
  }


  /**
   * handle Input Changes from the field items
   * @param event
   * @param dataKey
   * @param name
   */
  onFieldItemEvent(event: PopBaseEventInterface, dataKey: number = null, name: string = null) {
    if (IsValidFieldPatchEvent(this.core, event)) {
      this.onPatch(event, dataKey, name);
    } else if (event.type === 'field') {
      if (event.name === 'close') {
        this.onClose(event, dataKey);
      }
    }
    return true;
  }


  /**
   * User wants to add a value entry  into the field
   * @param event
   */
  onAdd(event: PopBaseEventInterface) {
    // console.log('add lower', this.field.data_keys.length < this.field.entries.length, this.field.entries);
    this.log.event(`onAdd`, event,);
    if (this.field.data_keys.length < this.field.entries.length) {
      const index = this.field.entries.length - 1;
      const item = this.srv.field.addEntryValue(this.core, this.field);
      const data = item.data;
      delete item.data;

      this.field.data[item.entry.id] = data;
      this.field.items[item.entry.id] = item;


      this.field.data_keys.push(item.entry.id + '');

      this._setFieldItemAttribute(item.entry.id, index);
      this._setAssetConfig(item.entry.id, index);
      this.dom.setTimeout('open-new', () => {
        this._updateState(item.entry.id, 'open', true);
      }, 0);


      // this.dom.session[ value.entry.id ] = {};
      // this.dom.session[ value.entry.id ].display = {};
      // this.dom.state[ value.entry.id ] = {
      //   open: true,
      //   template: this.field.state,
      //   footer_adjust: this.field.state,
      //   customLabel: false
      // };

    }
    return true;
  }


  /**
   * User wants to open the value entry and make edits
   * @param event
   */

  onEdit(event?: PopBaseEventInterface, dataKey?: number) {

    this.log.event(`onEdit`, event);
    if (this.field.modal) {
      console.log('has modal');

      const dialogRef = this.srv.dialog.open(PopEntityFieldModalComponent, {
        width: `${window.innerWidth * .50}px`,
        height: `${window.innerHeight * .50}px`,
        panelClass: 'sw-relative',
        data: {
          core: this.core,
          field: this.field
        }
      });


      this.dom.subscriber.dialog = dialogRef.beforeClosed().subscribe((changed) => {
        if (changed || this.dom.state.refresh) {
          // this._configureTable();up
        }
        this.dom.state.blockModal = false;
      });
    } else {
      this.dom.state.template = 'template_edit';
      this.dom.state.open = true;
      if (IsDefined(dataKey) && this.dom.state[dataKey]) {
        this.dom.state[dataKey].template = 'template_edit';
        this.dom.state[dataKey].open = true;
      } else {
        Object.keys(this.dom.state).map((key) => {
          if (IsNumber(key)) {
            this.dom.state[key].template = 'template_edit';
            this.dom.state[key].open = true;
          }
        });
      }
      this.dom.store('state');
      return true;
    }
  }


  /**
   * User wants to remove a value entry
   * @param event
   */
  onRemove(event: PopBaseEventInterface, dataKey: number) {
    this.log.event(`onRemove`, event);
    if (this.field.facade) {
      this.onBubbleEvent('remove', {dataKey: dataKey});
    } else {
      this.srv.dialog.open(PopConfirmationDialogComponent, {
        width: '350px',
        data: {
          option: null,
          body: `Delete this field value?`
        }
      }).afterClosed().subscribe(option => {
        if (option && option.confirmed) {
          this.srv.field.removeEntryValue(this.core, this.field, dataKey).then((res) => {
            delete this.field.data[dataKey];
            delete this.field.items[dataKey];
            this.field.data_keys.pop();
            delete this.dom.state[dataKey];
            delete this.ui.asset[dataKey];
            delete this.dom.session[dataKey];
            this.dom.store('session');
            this.onBubbleEvent('remove', {dataKey: dataKey});
          });

        }
      });
    }


    return true;
  }


  /**
   * User closes the edit ability of the value entries
   * @param event
   */

  onClose(event: PopBaseEventInterface, dataKey?: number) {
    this.log.event(`onClose`, event);
    this.dom.state.open = false;
    this.dom.state.template = 'template_readonly';
    if (dataKey) {
      this.dom.state[dataKey].template = 'template_readonly';
      this.dom.state[dataKey].open = false;
    } else {
      Object.keys(this.dom.state).map((key) => {
        if (IsNumber(key)) {
          this.dom.state[key].template = 'template_readonly';
          this.dom.state[key].open = false;
        }
      });
    }
    this.onBubbleEvent('close');
    return true;
  }


  /**
   * A method to remove an additional values from this field
   * @param id
   * @param archive
   */
  onPatch(event: PopBaseEventInterface, dataKey: number = null, name: string = null): Promise<boolean> {
    return new Promise(async (resolve) => {
      event.data_key = dataKey;
      event.column = name;
      if (this.field.facade) {
        this.onBubbleEvent('onPatch', null, event);
      } else {
        if (true) {
          await this.srv.field.updateFieldItem(this.core, this.field, event);
          this.field.data[dataKey][name] = event.config.control.value;
          this._triggerUpdateAssetDisplay(dataKey);
        }
      }
      return resolve(true);
    });
  }


  /**
   * Handle the bubble events that come up
   * @param event
   */
  onBubbleEvent(name: string, extension?: Dictionary<any>, event?: PopBaseEventInterface): boolean {
    if (!event) event = {source: this.name, type: 'field', name: name};
    if (extension) event = {...event, ...extension};
    this.log.event(`bubbleEvent`, event);
    this.events.emit(event);
    return true;
  }


  /**
   * Clean up dom subscribers, interval, timeouts, ..etc
   */
  ngOnDestroy() {
    super.ngOnDestroy();
  }


  /************************************************************************************************
   *                                                                                              *
   *                                   Base Protected Methods                                     *
   *                                    ( Protected Method )                                      *
   *                                                                                              *
   ************************************************************************************************/

  /**
   * Set the initial config
   * Intended to be overridden per field
   */
  protected _setInitialConfig(): void {
  }


  /**
   * Pass in any session changes
   * The user may change tabs and the state should be restored
   */
  protected _restoreDomSession() {
    this.field.data_keys.map((dataKey: number, index) => {
      if (IsObject(this.dom.session[dataKey], true)) {
        const item = this.field.items[dataKey];
        const session = this.dom.session[dataKey];
        if (IsObject(session.entry, ['id'])) {
          item.entry = session.entry;
        }
      }
    });
  }


  /**
   * Build the default configs that are across all the fieelds
   */
  protected _setAssetConfigs() {
    this.srv.field.setFieldCustomSetting(this.field, this.custom_setting);
    delete this.custom_setting;
    this.field.data_keys.map((dataKey: number, index) => {
      this._setAssetConfig(+dataKey, index);
    });
  }


  /**
   * Labels are a built in method that all fields should need
   * @param dataKey
   * @param index
   * @private
   */
  protected _setAssetConfig(dataKey: number, index: number) {

    const customEntries = DeepCopy(this.field.entries).filter((entry) => {
      return entry.type === 'custom';
    });
    const providedEntries = DeepCopy(this.field.entries).filter((entry) => {
      return entry.type !== 'custom';
    });
    const entries = [...providedEntries];

    const item = this.field.items[dataKey];

    if (!item.entry) {
      item.entry = this.field.entries[0];
    }

    this._updateDisplayField(dataKey, 'label', item.entry.name);

    const customLabel = this.field.setting.edit_label && this.field.setting.custom_label && item.entry.type === 'custom' ? true : false;

    this._updateState(dataKey, 'custom_label', customLabel);

    if (this.field.setting.custom_label && IsArray(customEntries, true)) entries.push(customEntries[customEntries.length - 1]);
    // ToDo:: Add api calls to store values for these configs
    if (!IsObject(this.ui.asset[dataKey], true)) {
      this.ui.asset[dataKey] = {
        display: new InputConfig({
          readonly: true,
          label: item.entry.name,
          value: this._getAssetDisplayStr(dataKey),
          // minimal: true,
        }),

        entry: new SelectConfig({
          label: 'Label',
          value: item.entry ? item.entry.id : null,
          options: {values: ConvertArrayToOptionList(entries)},
          minimal: true,
          facade: true,
          patch: {
            field: ``,
            path: ``,
            callback: (core: CoreConfig, event: PopBaseEventInterface) => {
              if (IsValidFieldPatchEvent(core, event)) {
                this._updateFieldEntry(dataKey, +event.config.control.value);
              }
            }
          }
        }),
        customLabel: new InputConfig({
          label: 'Custom Label',
          value: this.dom.session[dataKey].customLabel ? this.dom.session[dataKey].customLabel : '',
          required: true,
          validators: [Validators.required],
          maxlength: 24,
          // minimal: true,
          facade: true,
          patch: {
            field: ``,
            path: ``,
            callback: (core: CoreConfig, event: PopBaseEventInterface) => {
              if (IsValidFieldPatchEvent(core, event)) {
                this._updateCustomEntryLabel(dataKey, event.config.control.value);
              }
            }
          }
        })
      };
    }

    this._updateCustomLabelState(dataKey, item.entry);
  }


  /**
   * Updates when a values changes it label/entry
   * @param dataKey
   * @param entryId
   */
  protected _updateFieldEntry(dataKey: number, entryId: number) {
    const item = this.field.items[dataKey];
    if (IsObject(item, true)) {
      const entryLookup = ArrayMapSetter(this.field.entries, 'id');
      const entry = this.field.entries[entryLookup[entryId]];
      item.entry = entry;
      this.dom.session[dataKey].entry = entry;
      this.dom.store('session');
      this._updateCustomLabelState(dataKey, entry);
    }
  }


  /**
   * Updates the custom label if the user chooses to make a custom entry label
   * @param dataKey
   * @param value
   */
  protected _updateCustomEntryLabel(dataKey: number, value: string) {
    const item = this.field.items[dataKey];
    if (IsObject(item, true)) {
      this._updateDisplayField(dataKey, 'label', value);
      if (IsObject(this.dom.session[dataKey], true)) {
        this.dom.session[dataKey].customLabel = value;
        this.dom.store('session');

      }

      this._updateDisplayLabel(dataKey, value);
      // ToDo:: Figure where to save this
    }
  }


  /**
   * Ensure the state of the view matches up according to the stored entry/label
   * Custom Labels need special handling
   * @param dataKey
   * @param entry
   */
  protected _updateCustomLabelState(dataKey: number, entry: FieldEntry) {
    if (dataKey && IsObject(entry, ['id', 'type', 'name'])) {
      const isCustom = entry.type === 'custom';
      if (isCustom) {
        this._updateState(dataKey, 'customLabel', (this.field.setting.edit_label && isCustom ? true : false));
        if (!this.ui.asset[dataKey].customLabel.control.value) {
          this.ui.asset[dataKey].customLabel.control.setValue('Custom', {emitEvent: true});
          this._updateDisplayField(dataKey, 'label', 'Custom');
        } else {
          const previousCustomLabel = this.ui.asset[dataKey].customLabel.control.value;
          this._updateDisplayField(dataKey, 'label', previousCustomLabel);
          if (this.dom.session.entry) {
            this.dom.session.entry.name = previousCustomLabel;
          }
        }
        this._updateDisplayLabel(dataKey, this.ui.asset[dataKey].customLabel.control.value);
      } else {
        this._updateState(dataKey, 'customLabel', false);
        this._updateDisplayField(dataKey, 'label', entry.name);
        this._updateDisplayLabel(dataKey, entry.name);
      }
    }
  }


  /**
   * Update the display label of the value config
   * Some fields only use a single field item that is defaulted to the value column
   * @param dataKey
   * @param value
   */
  protected _updateDisplayLabel(dataKey: number, value: string) {
    const item = this.field.items[dataKey];
    if (IsObject(item, true)) {
      const configs = <any>item.config;
      const valueConfig = IsObject(item.config, ['value']) ? <InputConfig>configs.value : null;
      if (IsObject(valueConfig, true)) { // this means that it a a simple field,
        valueConfig.label = value;
      }
      this.ui.asset[dataKey].display.label = value;
    }
  }


  /**
   * Set the Display of a specific value entry
   * Sometime a display input is used to combine all the values into one, it appears in the readonly state
   * @param dataKey
   */
  protected _updateAssetDisplay(dataKey: number) {
    if (this.ui.asset && this.ui.asset[dataKey]) {
      const display = <InputConfig>this.ui.asset[dataKey].display;
      display.value = this._getAssetDisplayStr(dataKey);
      this.dom.setTimeout(`display-update-${dataKey}`, () => {
        display.control.value = display.value;
      }, 0);
    }
  }


  /**
   * Debounce requests for set phone display
   * @param dataKey
   */
  protected _triggerUpdateAssetDisplay(dataKey: number) {
    this.dom.setTimeout(`field-display-${dataKey}`, () => {
      this._updateAssetDisplay(dataKey);
    }, 100);
  }


  /**
   * Session the display value for a field item change
   * In some cases the value that is selected is not necessarily what should be presented, so we track it separately just in case
   * Ie ... when an id is selected when need to show the appropriate label that should go with it not the id itself
   * @param dataKey
   * @param field
   * @param value
   */
  protected _updateDisplayField(dataKey: number, field: string, value: string) {
    if (IsDefined(dataKey) && IsObject(this.dom.session)) {
      if (!IsObject(this.dom.session[dataKey])) this.dom.session[dataKey] = {};
      if (!IsObject(this.dom.session[dataKey].display)) this.dom.session[dataKey].display = {};
      this.dom.session[dataKey].display[field] = value;
      // this.dom.store('session');
    }
  }


  /**
   * Get the actual data object for a specific key
   * Pass in a field key if you want a only a certain field value
   * @param dataKey
   * @param fieldKey
   */
  protected _getDataKey(dataKey: number, fieldKey?: string) {
    let data = IsObjectThrowError(this.field.data, true, `${this.name}:getDataKey`) ? this.field.data[dataKey] : null;
    if (data && fieldKey) {
      data = fieldKey in data ? data[fieldKey] : null;
    }
    return data;
  }


  /**
   * Builds the display string
   * Override in each field component as necessary
   * @param dataKey
   */
  protected _getAssetDisplayStr(dataKey: number): string {
    let str = '';
    const configs = this._getDataKeyItemConfig(dataKey);
    Object.keys(configs).map((name) => {
      const config = configs[name];
      if (config.control && config.control.value) {
        str += (' ' + config.control.value);
      }
    });
    return String(str).trim();
  }


  /**
   * This will be different for each type of field group
   * Intended to be overridden in each class, gives the mutate/transform resources if needed
   */
  protected _transformChildren() {

  }


  /**
   * This will be different for each type of field group
   * Intended to be overridden in each class
   */
  protected _setFieldAttributes(): boolean {

    return true;
  }


  /**
   * This will be different for each type of field group
   * Intended to be overridden in each class
   */
  protected _setFieldItemAttribute(dataKey: number, index: number): boolean {

    return true;
  }


  /**
   * Get the item configs for a of a dataKey
   * Pass in a fieldKey if you only want the item config of a certain field
   * @param dataKey
   * @param fieldKey
   */
  protected _getDataKeyItemConfig(dataKey: number, fieldKey?: string) {
    const data = IsObjectThrowError(this.field.items[dataKey], true, `${this.name}:_getDataKeyItem`) ? this.field.items[dataKey] : null;
    if (fieldKey) {
      const config = IsObjectThrowError(data.config[fieldKey], true, `${this.name}:_getDataKeyItem:${fieldKey}`) ? data.config[fieldKey] : null;
      return config;
    }
    return data.config;
  }


  /**
   * Resolve a value to the name that goes with it from the option list
   * @param value
   * @param index
   */
  protected _getTypeOptionName(value: string, index: number): string {
    const typeConfig = <SelectConfig>this._getDataKeyItemConfig(this.field.data_keys[index], 'type');
    if (typeConfig.options) {
      const optionsMap = ArrayMapSetter(typeConfig.options.values, 'value');
      const option = value in optionsMap ? typeConfig.options.values[optionsMap[value]] : null;
      if (option) {
        return option.name;
      }
      return value;
    }
    return '';
  }


  /**
   * Resolve a value to the name that goes with it from the option list
   * @param value
   * @param index
   */
  protected _getEntryOptionName(value: string, index: number): string {
    const titleConfig = <SelectConfig>this._getDataKeyItemConfig(this.field.data_keys[index], 'title');
    if (titleConfig.options) {
      const optionsMap = ArrayMapSetter(titleConfig.options.values, 'value');
      const option = value in optionsMap ? titleConfig.options.values[optionsMap[value]] : null;
      if (option) {
        return option.name;
      }
      return value;
    }
    return '';
  }


  /**
   * Get the value entry of a specific index
   * @param index
   */
  protected _getValueEntry(index: number): FieldEntry {
    if (IsArray(this.field.entries, true)) {
      return IsObject(this.field.entries[index], true) ? this.field.entries[index] : this.field.entries[0];
    }
    return null;
  }


  /**
   * Helper method to update a state variable, and make sure that a state object exits for each data key
   * @param dataKey
   * @param field
   * @param value
   */
  protected _updateState(dataKey: number, field: string, value: string | boolean | number) {
    if (IsDefined(dataKey) && IsObject(this.dom.state)) {
      if (!IsObject(this.dom.state[dataKey])) {
        this.dom.state[dataKey] = {
          open: false,
          template: this.field.state,
          footer_adjust: this.field.state,
          customLabel: false
        };
      }
      this.dom.state[dataKey][field] = value;
    }
  }

}

