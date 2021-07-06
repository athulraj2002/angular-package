import { __awaiter } from "tslib";
import { Component, ElementRef, Inject, Input } from '@angular/core';
import { FIELD_CUSTOM_SETTING, ServiceInjector } from '../../../pop-common.model';
import { PopExtendComponent } from '../../../pop-extend.component';
import { ArrayMapSetter, ConvertArrayToOptionList, DeepCopy, IsArray, IsDefined, IsNumber, IsObject, IsObjectThrowError, } from '../../../pop-common-utility';
import { SelectConfig } from '../../base/pop-field-item/pop-select/select-config.model';
import { InputConfig } from '../../base/pop-field-item/pop-input/input-config.model';
import { PopDomService } from '../../../services/pop-dom.service';
import { IsValidFieldPatchEvent } from '../pop-entity-utility';
import { PopEntityFieldService } from './pop-entity-field.service';
import { Validators } from '@angular/forms';
import { PopConfirmationDialogComponent } from '../../base/pop-dialogs/pop-confirmation-dialog/pop-confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { PopEntityFieldModalComponent } from './pop-entity-field-modal/pop-entity-field-modal.component';
export class PopEntityFieldBoilerComponent extends PopExtendComponent {
    constructor(el, _domRepo, custom_setting = {}) {
        super();
        this.el = el;
        this._domRepo = _domRepo;
        this.custom_setting = custom_setting;
        this.name = 'PopEntityFieldBoilerComponent';
        this.srv = {
            dialog: ServiceInjector.get(MatDialog),
            field: ServiceInjector.get(PopEntityFieldService),
        };
        this.ui = {
            actionBtnWidth: 0,
            asset: undefined,
        };
        /**
         * This should transformValue and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
         */
        this.dom.configure = () => {
            return new Promise((resolve) => {
                // #1: Enforce a CoreConfig
                this.field = IsObjectThrowError(this.field, ['id', 'data_keys'], `${this.name}:configureDom: - this.field`) ? this.field : null;
                this.id = this.field.id;
                this.ui.asset = {};
                this._setInitialConfig();
                this._transformChildren();
                this.field.data_keys.map((dataKey, index) => {
                    this.dom.session[dataKey] = {};
                    this.dom.session[dataKey].display = {};
                    this.dom.state[dataKey] = {
                        open: false,
                        template: this.field.state,
                        footer_adjust: this.field.state,
                        customLabel: false
                    };
                });
                this.dom.setSubscriber(`parent-event-handler`, this.events.subscribe((event) => {
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
        this.dom.proceed = () => {
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
    onActionEvent(event, dataKey) {
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
    onFieldItemEvent(event, dataKey = null, name = null) {
        if (IsValidFieldPatchEvent(this.core, event)) {
            this.onPatch(event, dataKey, name);
        }
        else if (event.type === 'field') {
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
    onAdd(event) {
        // console.log('add lower', this.field.data_keys.length < this.field.entries.length, this.field.entries);
        this.log.event(`onAdd`, event);
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
    onEdit(event, dataKey) {
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
        }
        else {
            this.dom.state.template = 'template_edit';
            this.dom.state.open = true;
            if (IsDefined(dataKey) && this.dom.state[dataKey]) {
                this.dom.state[dataKey].template = 'template_edit';
                this.dom.state[dataKey].open = true;
            }
            else {
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
    onRemove(event, dataKey) {
        this.log.event(`onRemove`, event);
        if (this.field.facade) {
            this.onBubbleEvent('remove', { dataKey: dataKey });
        }
        else {
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
                        this.onBubbleEvent('remove', { dataKey: dataKey });
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
    onClose(event, dataKey) {
        this.log.event(`onClose`, event);
        this.dom.state.open = false;
        this.dom.state.template = 'template_readonly';
        if (dataKey) {
            this.dom.state[dataKey].template = 'template_readonly';
            this.dom.state[dataKey].open = false;
        }
        else {
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
    onPatch(event, dataKey = null, name = null) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            event.data_key = dataKey;
            event.column = name;
            if (this.field.facade) {
                this.onBubbleEvent('onPatch', null, event);
            }
            else {
                if (true) {
                    yield this.srv.field.updateFieldItem(this.core, this.field, event);
                    this.field.data[dataKey][name] = event.config.control.value;
                    this._triggerUpdateAssetDisplay(dataKey);
                }
            }
            return resolve(true);
        }));
    }
    /**
     * Handle the bubble events that come up
     * @param event
     */
    onBubbleEvent(name, extension, event) {
        if (!event)
            event = { source: this.name, type: 'field', name: name };
        if (extension)
            event = Object.assign(Object.assign({}, event), extension);
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
    _setInitialConfig() {
    }
    /**
     * Pass in any session changes
     * The user may change tabs and the state should be restored
     */
    _restoreDomSession() {
        this.field.data_keys.map((dataKey, index) => {
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
    _setAssetConfigs() {
        this.srv.field.setFieldCustomSetting(this.field, this.custom_setting);
        delete this.custom_setting;
        this.field.data_keys.map((dataKey, index) => {
            this._setAssetConfig(+dataKey, index);
        });
    }
    /**
     * Labels are a built in method that all fields should need
     * @param dataKey
     * @param index
     * @private
     */
    _setAssetConfig(dataKey, index) {
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
        if (this.field.setting.custom_label && IsArray(customEntries, true))
            entries.push(customEntries[customEntries.length - 1]);
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
                    options: { values: ConvertArrayToOptionList(entries) },
                    minimal: true,
                    facade: true,
                    patch: {
                        field: ``,
                        path: ``,
                        callback: (core, event) => {
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
                        callback: (core, event) => {
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
    _updateFieldEntry(dataKey, entryId) {
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
    _updateCustomEntryLabel(dataKey, value) {
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
    _updateCustomLabelState(dataKey, entry) {
        if (dataKey && IsObject(entry, ['id', 'type', 'name'])) {
            const isCustom = entry.type === 'custom';
            if (isCustom) {
                this._updateState(dataKey, 'customLabel', (this.field.setting.edit_label && isCustom ? true : false));
                if (!this.ui.asset[dataKey].customLabel.control.value) {
                    this.ui.asset[dataKey].customLabel.control.setValue('Custom', { emitEvent: true });
                    this._updateDisplayField(dataKey, 'label', 'Custom');
                }
                else {
                    const previousCustomLabel = this.ui.asset[dataKey].customLabel.control.value;
                    this._updateDisplayField(dataKey, 'label', previousCustomLabel);
                    if (this.dom.session.entry) {
                        this.dom.session.entry.name = previousCustomLabel;
                    }
                }
                this._updateDisplayLabel(dataKey, this.ui.asset[dataKey].customLabel.control.value);
            }
            else {
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
    _updateDisplayLabel(dataKey, value) {
        const item = this.field.items[dataKey];
        if (IsObject(item, true)) {
            const configs = item.config;
            const valueConfig = IsObject(item.config, ['value']) ? configs.value : null;
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
    _updateAssetDisplay(dataKey) {
        if (this.ui.asset && this.ui.asset[dataKey]) {
            const display = this.ui.asset[dataKey].display;
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
    _triggerUpdateAssetDisplay(dataKey) {
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
    _updateDisplayField(dataKey, field, value) {
        if (IsDefined(dataKey) && IsObject(this.dom.session)) {
            if (!IsObject(this.dom.session[dataKey]))
                this.dom.session[dataKey] = {};
            if (!IsObject(this.dom.session[dataKey].display))
                this.dom.session[dataKey].display = {};
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
    _getDataKey(dataKey, fieldKey) {
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
    _getAssetDisplayStr(dataKey) {
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
    _transformChildren() {
    }
    /**
     * This will be different for each type of field group
     * Intended to be overridden in each class
     */
    _setFieldAttributes() {
        return true;
    }
    /**
     * This will be different for each type of field group
     * Intended to be overridden in each class
     */
    _setFieldItemAttribute(dataKey, index) {
        return true;
    }
    /**
     * Get the item configs for a of a dataKey
     * Pass in a fieldKey if you only want the item config of a certain field
     * @param dataKey
     * @param fieldKey
     */
    _getDataKeyItemConfig(dataKey, fieldKey) {
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
    _getTypeOptionName(value, index) {
        const typeConfig = this._getDataKeyItemConfig(this.field.data_keys[index], 'type');
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
    _getEntryOptionName(value, index) {
        const titleConfig = this._getDataKeyItemConfig(this.field.data_keys[index], 'title');
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
    _getValueEntry(index) {
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
    _updateState(dataKey, field, value) {
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
PopEntityFieldBoilerComponent.decorators = [
    { type: Component, args: [{
                template: '<div>Boiler</div>'
            },] }
];
PopEntityFieldBoilerComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: PopDomService },
    { type: undefined, decorators: [{ type: Inject, args: [FIELD_CUSTOM_SETTING,] }] }
];
PopEntityFieldBoilerComponent.propDecorators = {
    field: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS1maWVsZC1ib2lsZXIuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvZW50aXR5L3BvcC1lbnRpdHktZmllbGQvcG9wLWVudGl0eS1maWVsZC1ib2lsZXIuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFvQixNQUFNLGVBQWUsQ0FBQztBQUV0RixPQUFPLEVBR0wsb0JBQW9CLEVBTXBCLGVBQWUsRUFDaEIsTUFBTSwyQkFBMkIsQ0FBQztBQUNuQyxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQUNqRSxPQUFPLEVBQ0wsY0FBYyxFQUNkLHdCQUF3QixFQUN4QixRQUFRLEVBQ1IsT0FBTyxFQUNQLFNBQVMsRUFDVCxRQUFRLEVBQ1IsUUFBUSxFQUNSLGtCQUFrQixHQUNuQixNQUFNLDZCQUE2QixDQUFDO0FBQ3JDLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSwwREFBMEQsQ0FBQztBQUN0RixPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sd0RBQXdELENBQUM7QUFDbkYsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLG1DQUFtQyxDQUFDO0FBQ2hFLE9BQU8sRUFBQyxzQkFBc0IsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQzdELE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLDRCQUE0QixDQUFDO0FBQ2pFLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUUxQyxPQUFPLEVBQUMsOEJBQThCLEVBQUMsTUFBTSxrRkFBa0YsQ0FBQztBQUNoSSxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFDbkQsT0FBTyxFQUFDLDRCQUE0QixFQUFDLE1BQU0sMkRBQTJELENBQUM7QUFNdkcsTUFBTSxPQUFPLDZCQUE4QixTQUFRLGtCQUFrQjtJQXlCbkUsWUFDUyxFQUFjLEVBQ1gsUUFBdUIsRUFDSSxpQkFBMEQsRUFBRTtRQUVqRyxLQUFLLEVBQUUsQ0FBQztRQUpELE9BQUUsR0FBRixFQUFFLENBQVk7UUFDWCxhQUFRLEdBQVIsUUFBUSxDQUFlO1FBQ0ksbUJBQWMsR0FBZCxjQUFjLENBQThDO1FBMUI1RixTQUFJLEdBQUcsK0JBQStCLENBQUM7UUFFcEMsUUFBRyxHQUdUO1lBQ0YsTUFBTSxFQUFFLGVBQWUsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDO1lBQ3RDLEtBQUssRUFBRSxlQUFlLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDO1NBQ2xELENBQUM7UUFFSyxPQUFFLEdBQUc7WUFDVixjQUFjLEVBQUUsQ0FBQztZQUNqQixLQUFLLEVBT0YsU0FBUztTQUNiLENBQUM7UUFXQTs7V0FFRztRQUNILElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLEdBQXFCLEVBQUU7WUFDMUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO2dCQUM3QiwyQkFBMkI7Z0JBQzNCLElBQUksQ0FBQyxLQUFLLEdBQUcsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLDZCQUE2QixDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztnQkFDaEksSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDeEIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO2dCQUNuQixJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztnQkFDekIsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7Z0JBRzFCLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQWUsRUFBRSxLQUFLLEVBQUUsRUFBRTtvQkFDbEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDO29CQUMvQixJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO29CQUN2QyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRzt3QkFDeEIsSUFBSSxFQUFFLEtBQUs7d0JBQ1gsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSzt3QkFDMUIsYUFBYSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSzt3QkFDL0IsV0FBVyxFQUFFLEtBQUs7cUJBQ25CLENBQUM7Z0JBQ0osQ0FBQyxDQUFDLENBQUM7Z0JBRUgsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsc0JBQXNCLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUE0QixFQUFFLEVBQUU7b0JBQ3BHLElBQUksUUFBUSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRTt3QkFDekIsSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLEtBQUssRUFBRTs0QkFDeEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQzt5QkFDbkI7cUJBQ0Y7Z0JBQ0gsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFSiwwREFBMEQ7Z0JBQzFELDJEQUEyRDtnQkFDM0QsNEJBQTRCO2dCQUM1QixRQUFRO2dCQUNSLE1BQU07Z0JBRU4sT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdkIsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUM7UUFFRixJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sR0FBRyxHQUFxQixFQUFFO1lBQ3hDLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtnQkFDN0IsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7Z0JBQzFCLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO2dCQUN4QixJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztnQkFDM0IsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdkIsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUM7SUFDSixDQUFDO0lBR0QsUUFBUTtRQUNOLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNuQixDQUFDO0lBR0Q7Ozs7T0FJRztJQUNILGFBQWEsQ0FBQyxLQUE0QixFQUFFLE9BQWdCO1FBQzFELElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxPQUFPLEVBQUU7WUFDMUIsUUFBUSxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsRUFBRSxFQUFFO2dCQUN4QyxjQUFjO2dCQUNkLHVCQUF1QjtnQkFDdkIsV0FBVztnQkFDWCxLQUFLLFFBQVE7b0JBQ1gsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7b0JBQzlCLE1BQU07Z0JBQ1IsS0FBSyxNQUFNO29CQUNULElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO29CQUM1QixNQUFNO2dCQUNSLEtBQUssT0FBTztvQkFDVixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztvQkFDN0IsTUFBTTtnQkFDUjtvQkFDRSxNQUFNO2FBQ1Q7U0FDRjtRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUdEOzs7OztPQUtHO0lBQ0gsZ0JBQWdCLENBQUMsS0FBNEIsRUFBRSxVQUFrQixJQUFJLEVBQUUsT0FBZSxJQUFJO1FBQ3hGLElBQUksc0JBQXNCLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRTtZQUM1QyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDcEM7YUFBTSxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssT0FBTyxFQUFFO1lBQ2pDLElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxPQUFPLEVBQUU7Z0JBQzFCLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2FBQzlCO1NBQ0Y7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFHRDs7O09BR0c7SUFDSCxLQUFLLENBQUMsS0FBNEI7UUFDaEMseUdBQXlHO1FBQ3pHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUUsQ0FBQztRQUNoQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUU7WUFDM0QsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztZQUM1QyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDakUsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztZQUN2QixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7WUFFakIsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUM7WUFDdEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUM7WUFHdkMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBRTlDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNsRCxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzNDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxHQUFHLEVBQUU7Z0JBQ25DLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ2pELENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUdOLDJDQUEyQztZQUMzQyxtREFBbUQ7WUFDbkQsdUNBQXVDO1lBQ3ZDLGdCQUFnQjtZQUNoQixnQ0FBZ0M7WUFDaEMscUNBQXFDO1lBQ3JDLHVCQUF1QjtZQUN2QixLQUFLO1NBRU47UUFDRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFHRDs7O09BR0c7SUFFSCxNQUFNLENBQUMsS0FBNkIsRUFBRSxPQUFnQjtRQUVwRCxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDaEMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRTtZQUNwQixPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBRXpCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyw0QkFBNEIsRUFBRTtnQkFDbkUsS0FBSyxFQUFFLEdBQUcsTUFBTSxDQUFDLFVBQVUsR0FBRyxHQUFHLElBQUk7Z0JBQ3JDLE1BQU0sRUFBRSxHQUFHLE1BQU0sQ0FBQyxXQUFXLEdBQUcsR0FBRyxJQUFJO2dCQUN2QyxVQUFVLEVBQUUsYUFBYTtnQkFDekIsSUFBSSxFQUFFO29CQUNKLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtvQkFDZixLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUs7aUJBQ2xCO2FBQ0YsQ0FBQyxDQUFDO1lBR0gsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtnQkFDMUUsSUFBSSxPQUFPLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFO29CQUNyQyw0QkFBNEI7aUJBQzdCO2dCQUNELElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7WUFDcEMsQ0FBQyxDQUFDLENBQUM7U0FDSjthQUFNO1lBQ0wsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLGVBQWUsQ0FBQztZQUMxQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1lBQzNCLElBQUksU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNqRCxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLEdBQUcsZUFBZSxDQUFDO2dCQUNuRCxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO2FBQ3JDO2lCQUFNO2dCQUNMLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtvQkFDdEMsSUFBSSxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7d0JBQ2pCLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsR0FBRyxlQUFlLENBQUM7d0JBQy9DLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7cUJBQ2pDO2dCQUNILENBQUMsQ0FBQyxDQUFDO2FBQ0o7WUFDRCxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN4QixPQUFPLElBQUksQ0FBQztTQUNiO0lBQ0gsQ0FBQztJQUdEOzs7T0FHRztJQUNILFFBQVEsQ0FBQyxLQUE0QixFQUFFLE9BQWU7UUFDcEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ2xDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDckIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsRUFBQyxPQUFPLEVBQUUsT0FBTyxFQUFDLENBQUMsQ0FBQztTQUNsRDthQUFNO1lBQ0wsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLDhCQUE4QixFQUFFO2dCQUNuRCxLQUFLLEVBQUUsT0FBTztnQkFDZCxJQUFJLEVBQUU7b0JBQ0osTUFBTSxFQUFFLElBQUk7b0JBQ1osSUFBSSxFQUFFLDBCQUEwQjtpQkFDakM7YUFDRixDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUNsQyxJQUFJLE1BQU0sSUFBSSxNQUFNLENBQUMsU0FBUyxFQUFFO29CQUM5QixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7d0JBQzNFLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7d0JBQ2hDLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7d0JBQ2pDLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDO3dCQUMzQixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO3dCQUMvQixPQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO3dCQUM5QixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO3dCQUNqQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQzt3QkFDMUIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsRUFBQyxPQUFPLEVBQUUsT0FBTyxFQUFDLENBQUMsQ0FBQztvQkFDbkQsQ0FBQyxDQUFDLENBQUM7aUJBRUo7WUFDSCxDQUFDLENBQUMsQ0FBQztTQUNKO1FBR0QsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBR0Q7OztPQUdHO0lBRUgsT0FBTyxDQUFDLEtBQTRCLEVBQUUsT0FBZ0I7UUFDcEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ2pDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxLQUFLLENBQUM7UUFDNUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLG1CQUFtQixDQUFDO1FBQzlDLElBQUksT0FBTyxFQUFFO1lBQ1gsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxHQUFHLG1CQUFtQixDQUFDO1lBQ3ZELElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksR0FBRyxLQUFLLENBQUM7U0FDdEM7YUFBTTtZQUNMLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtnQkFDdEMsSUFBSSxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7b0JBQ2pCLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsR0FBRyxtQkFBbUIsQ0FBQztvQkFDbkQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQztpQkFDbEM7WUFDSCxDQUFDLENBQUMsQ0FBQztTQUNKO1FBQ0QsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM1QixPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFHRDs7OztPQUlHO0lBQ0gsT0FBTyxDQUFDLEtBQTRCLEVBQUUsVUFBa0IsSUFBSSxFQUFFLE9BQWUsSUFBSTtRQUMvRSxPQUFPLElBQUksT0FBTyxDQUFDLENBQU8sT0FBTyxFQUFFLEVBQUU7WUFDbkMsS0FBSyxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7WUFDekIsS0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7WUFDcEIsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRTtnQkFDckIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQzVDO2lCQUFNO2dCQUNMLElBQUksSUFBSSxFQUFFO29CQUNSLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztvQkFDbkUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO29CQUM1RCxJQUFJLENBQUMsMEJBQTBCLENBQUMsT0FBTyxDQUFDLENBQUM7aUJBQzFDO2FBQ0Y7WUFDRCxPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN2QixDQUFDLENBQUEsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUdEOzs7T0FHRztJQUNILGFBQWEsQ0FBQyxJQUFZLEVBQUUsU0FBMkIsRUFBRSxLQUE2QjtRQUNwRixJQUFJLENBQUMsS0FBSztZQUFFLEtBQUssR0FBRyxFQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBQyxDQUFDO1FBQ25FLElBQUksU0FBUztZQUFFLEtBQUssbUNBQU8sS0FBSyxHQUFLLFNBQVMsQ0FBQyxDQUFDO1FBQ2hELElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNyQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN4QixPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFHRDs7T0FFRztJQUNILFdBQVc7UUFDVCxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDdEIsQ0FBQztJQUdEOzs7OztzR0FLa0c7SUFFbEc7OztPQUdHO0lBQ08saUJBQWlCO0lBQzNCLENBQUM7SUFHRDs7O09BR0c7SUFDTyxrQkFBa0I7UUFDMUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBZSxFQUFFLEtBQUssRUFBRSxFQUFFO1lBQ2xELElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFO2dCQUM3QyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDdkMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQzFDLElBQUksUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFO29CQUNuQyxJQUFJLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUM7aUJBQzVCO2FBQ0Y7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFHRDs7T0FFRztJQUNPLGdCQUFnQjtRQUN4QixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUN0RSxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUM7UUFDM0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBZSxFQUFFLEtBQUssRUFBRSxFQUFFO1lBQ2xELElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDeEMsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBR0Q7Ozs7O09BS0c7SUFDTyxlQUFlLENBQUMsT0FBZSxFQUFFLEtBQWE7UUFFdEQsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7WUFDbEUsT0FBTyxLQUFLLENBQUMsSUFBSSxLQUFLLFFBQVEsQ0FBQztRQUNqQyxDQUFDLENBQUMsQ0FBQztRQUNILE1BQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO1lBQ3BFLE9BQU8sS0FBSyxDQUFDLElBQUksS0FBSyxRQUFRLENBQUM7UUFDakMsQ0FBQyxDQUFDLENBQUM7UUFDSCxNQUFNLE9BQU8sR0FBRyxDQUFDLEdBQUcsZUFBZSxDQUFDLENBQUM7UUFFckMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFdkMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDZixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3BDO1FBRUQsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUU1RCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFFcEksSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsY0FBYyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBRXhELElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsWUFBWSxJQUFJLE9BQU8sQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDO1lBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzNILHlEQUF5RDtRQUN6RCxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFO1lBQzNDLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHO2dCQUN2QixPQUFPLEVBQUUsSUFBSSxXQUFXLENBQUM7b0JBQ3ZCLFFBQVEsRUFBRSxJQUFJO29CQUNkLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUk7b0JBQ3RCLEtBQUssRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDO29CQUN4QyxpQkFBaUI7aUJBQ2xCLENBQUM7Z0JBRUYsS0FBSyxFQUFFLElBQUksWUFBWSxDQUFDO29CQUN0QixLQUFLLEVBQUUsT0FBTztvQkFDZCxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUk7b0JBQ3hDLE9BQU8sRUFBRSxFQUFDLE1BQU0sRUFBRSx3QkFBd0IsQ0FBQyxPQUFPLENBQUMsRUFBQztvQkFDcEQsT0FBTyxFQUFFLElBQUk7b0JBQ2IsTUFBTSxFQUFFLElBQUk7b0JBQ1osS0FBSyxFQUFFO3dCQUNMLEtBQUssRUFBRSxFQUFFO3dCQUNULElBQUksRUFBRSxFQUFFO3dCQUNSLFFBQVEsRUFBRSxDQUFDLElBQWdCLEVBQUUsS0FBNEIsRUFBRSxFQUFFOzRCQUMzRCxJQUFJLHNCQUFzQixDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRTtnQ0FDdkMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDOzZCQUM5RDt3QkFDSCxDQUFDO3FCQUNGO2lCQUNGLENBQUM7Z0JBQ0YsV0FBVyxFQUFFLElBQUksV0FBVyxDQUFDO29CQUMzQixLQUFLLEVBQUUsY0FBYztvQkFDckIsS0FBSyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFO29CQUN6RixRQUFRLEVBQUUsSUFBSTtvQkFDZCxVQUFVLEVBQUUsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDO29CQUNqQyxTQUFTLEVBQUUsRUFBRTtvQkFDYixpQkFBaUI7b0JBQ2pCLE1BQU0sRUFBRSxJQUFJO29CQUNaLEtBQUssRUFBRTt3QkFDTCxLQUFLLEVBQUUsRUFBRTt3QkFDVCxJQUFJLEVBQUUsRUFBRTt3QkFDUixRQUFRLEVBQUUsQ0FBQyxJQUFnQixFQUFFLEtBQTRCLEVBQUUsRUFBRTs0QkFDM0QsSUFBSSxzQkFBc0IsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUU7Z0NBQ3ZDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7NkJBQ25FO3dCQUNILENBQUM7cUJBQ0Y7aUJBQ0YsQ0FBQzthQUNILENBQUM7U0FDSDtRQUVELElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3BELENBQUM7SUFHRDs7OztPQUlHO0lBQ08saUJBQWlCLENBQUMsT0FBZSxFQUFFLE9BQWU7UUFDMUQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdkMsSUFBSSxRQUFRLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFO1lBQ3hCLE1BQU0sV0FBVyxHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztZQUM3RCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUN2RCxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztZQUNuQixJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1lBQ3hDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzFCLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDOUM7SUFDSCxDQUFDO0lBR0Q7Ozs7T0FJRztJQUNPLHVCQUF1QixDQUFDLE9BQWUsRUFBRSxLQUFhO1FBQzlELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3ZDLElBQUksUUFBUSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRTtZQUN4QixJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNsRCxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLENBQUMsRUFBRTtnQkFDN0MsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztnQkFDOUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7YUFFM0I7WUFFRCxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3pDLG1DQUFtQztTQUNwQztJQUNILENBQUM7SUFHRDs7Ozs7T0FLRztJQUNPLHVCQUF1QixDQUFDLE9BQWUsRUFBRSxLQUFpQjtRQUNsRSxJQUFJLE9BQU8sSUFBSSxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFO1lBQ3RELE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxJQUFJLEtBQUssUUFBUSxDQUFDO1lBQ3pDLElBQUksUUFBUSxFQUFFO2dCQUNaLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLGFBQWEsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQVUsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDdEcsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFO29CQUNyRCxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsRUFBQyxTQUFTLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztvQkFDakYsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7aUJBQ3REO3FCQUFNO29CQUNMLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7b0JBQzdFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLG1CQUFtQixDQUFDLENBQUM7b0JBQ2hFLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFO3dCQUMxQixJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLG1CQUFtQixDQUFDO3FCQUNuRDtpQkFDRjtnQkFDRCxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDckY7aUJBQU07Z0JBQ0wsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsYUFBYSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUNqRCxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3ZELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQy9DO1NBQ0Y7SUFDSCxDQUFDO0lBR0Q7Ozs7O09BS0c7SUFDTyxtQkFBbUIsQ0FBQyxPQUFlLEVBQUUsS0FBYTtRQUMxRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN2QyxJQUFJLFFBQVEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUU7WUFDeEIsTUFBTSxPQUFPLEdBQVEsSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUNqQyxNQUFNLFdBQVcsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFjLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUN6RixJQUFJLFFBQVEsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSx1Q0FBdUM7Z0JBQ3hFLFdBQVcsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO2FBQzNCO1lBQ0QsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7U0FDOUM7SUFDSCxDQUFDO0lBR0Q7Ozs7T0FJRztJQUNPLG1CQUFtQixDQUFDLE9BQWU7UUFDM0MsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUMzQyxNQUFNLE9BQU8sR0FBZ0IsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDO1lBQzVELE9BQU8sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ2xELElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLGtCQUFrQixPQUFPLEVBQUUsRUFBRSxHQUFHLEVBQUU7Z0JBQ3BELE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUM7WUFDeEMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQ1A7SUFDSCxDQUFDO0lBR0Q7OztPQUdHO0lBQ08sMEJBQTBCLENBQUMsT0FBZTtRQUNsRCxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsT0FBTyxFQUFFLEVBQUUsR0FBRyxFQUFFO1lBQ25ELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNwQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDVixDQUFDO0lBR0Q7Ozs7Ozs7T0FPRztJQUNPLG1CQUFtQixDQUFDLE9BQWUsRUFBRSxLQUFhLEVBQUUsS0FBYTtRQUN6RSxJQUFJLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUNwRCxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUN6RSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQztnQkFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1lBQ3pGLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUM7WUFDakQsNkJBQTZCO1NBQzlCO0lBQ0gsQ0FBQztJQUdEOzs7OztPQUtHO0lBQ08sV0FBVyxDQUFDLE9BQWUsRUFBRSxRQUFpQjtRQUN0RCxJQUFJLElBQUksR0FBRyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUNsSCxJQUFJLElBQUksSUFBSSxRQUFRLEVBQUU7WUFDcEIsSUFBSSxHQUFHLFFBQVEsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1NBQ2pEO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBR0Q7Ozs7T0FJRztJQUNPLG1CQUFtQixDQUFDLE9BQWU7UUFDM0MsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO1FBQ2IsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3BELE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDaEMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzdCLElBQUksTUFBTSxDQUFDLE9BQU8sSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRTtnQkFDMUMsR0FBRyxJQUFJLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDckM7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUNILE9BQU8sTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQzVCLENBQUM7SUFHRDs7O09BR0c7SUFDTyxrQkFBa0I7SUFFNUIsQ0FBQztJQUdEOzs7T0FHRztJQUNPLG1CQUFtQjtRQUUzQixPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFHRDs7O09BR0c7SUFDTyxzQkFBc0IsQ0FBQyxPQUFlLEVBQUUsS0FBYTtRQUU3RCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFHRDs7Ozs7T0FLRztJQUNPLHFCQUFxQixDQUFDLE9BQWUsRUFBRSxRQUFpQjtRQUNoRSxNQUFNLElBQUksR0FBRyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQ3BJLElBQUksUUFBUSxFQUFFO1lBQ1osTUFBTSxNQUFNLEdBQUcsa0JBQWtCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxvQkFBb0IsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQzFJLE9BQU8sTUFBTSxDQUFDO1NBQ2Y7UUFDRCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDckIsQ0FBQztJQUdEOzs7O09BSUc7SUFDTyxrQkFBa0IsQ0FBQyxLQUFhLEVBQUUsS0FBYTtRQUN2RCxNQUFNLFVBQVUsR0FBaUIsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ2pHLElBQUksVUFBVSxDQUFDLE9BQU8sRUFBRTtZQUN0QixNQUFNLFVBQVUsR0FBRyxjQUFjLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDdEUsTUFBTSxNQUFNLEdBQUcsS0FBSyxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUN6RixJQUFJLE1BQU0sRUFBRTtnQkFDVixPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUM7YUFDcEI7WUFDRCxPQUFPLEtBQUssQ0FBQztTQUNkO1FBQ0QsT0FBTyxFQUFFLENBQUM7SUFDWixDQUFDO0lBR0Q7Ozs7T0FJRztJQUNPLG1CQUFtQixDQUFDLEtBQWEsRUFBRSxLQUFhO1FBQ3hELE1BQU0sV0FBVyxHQUFpQixJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDbkcsSUFBSSxXQUFXLENBQUMsT0FBTyxFQUFFO1lBQ3ZCLE1BQU0sVUFBVSxHQUFHLGNBQWMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztZQUN2RSxNQUFNLE1BQU0sR0FBRyxLQUFLLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQzFGLElBQUksTUFBTSxFQUFFO2dCQUNWLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQzthQUNwQjtZQUNELE9BQU8sS0FBSyxDQUFDO1NBQ2Q7UUFDRCxPQUFPLEVBQUUsQ0FBQztJQUNaLENBQUM7SUFHRDs7O09BR0c7SUFDTyxjQUFjLENBQUMsS0FBYTtRQUNwQyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsRUFBRTtZQUNyQyxPQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3RHO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBR0Q7Ozs7O09BS0c7SUFDTyxZQUFZLENBQUMsT0FBZSxFQUFFLEtBQWEsRUFBRSxLQUFnQztRQUNyRixJQUFJLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUNsRCxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUU7Z0JBQ3RDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHO29CQUN4QixJQUFJLEVBQUUsS0FBSztvQkFDWCxRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLO29CQUMxQixhQUFhLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLO29CQUMvQixXQUFXLEVBQUUsS0FBSztpQkFDbkIsQ0FBQzthQUNIO1lBQ0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsS0FBSyxDQUFDO1NBQ3hDO0lBQ0gsQ0FBQzs7O1lBbHVCRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLG1CQUFtQjthQUM5Qjs7O1lBdENrQixVQUFVO1lBMEJyQixhQUFhOzRDQXlDaEIsTUFBTSxTQUFDLG9CQUFvQjs7O29CQTNCN0IsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q29tcG9uZW50LCBFbGVtZW50UmVmLCBJbmplY3QsIElucHV0LCBPbkRlc3Ryb3ksIE9uSW5pdH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0VudGl0eUZpZWxkQ29tcG9uZW50SW50ZXJmYWNlfSBmcm9tICcuL3BvcC1lbnRpdHktZmllbGQubW9kZWwnO1xuaW1wb3J0IHtcbiAgQ29yZUNvbmZpZyxcbiAgRGljdGlvbmFyeSxcbiAgRklFTERfQ1VTVE9NX1NFVFRJTkcsXG4gIEZpZWxkQ29uZmlnLFxuICBGaWVsZEN1c3RvbVNldHRpbmdJbnRlcmZhY2UsXG4gIEZpZWxkRW50cnksXG4gIEtleU1hcCxcbiAgUG9wQmFzZUV2ZW50SW50ZXJmYWNlLFxuICBTZXJ2aWNlSW5qZWN0b3Jcbn0gZnJvbSAnLi4vLi4vLi4vcG9wLWNvbW1vbi5tb2RlbCc7XG5pbXBvcnQge1BvcEV4dGVuZENvbXBvbmVudH0gZnJvbSAnLi4vLi4vLi4vcG9wLWV4dGVuZC5jb21wb25lbnQnO1xuaW1wb3J0IHtcbiAgQXJyYXlNYXBTZXR0ZXIsXG4gIENvbnZlcnRBcnJheVRvT3B0aW9uTGlzdCxcbiAgRGVlcENvcHksXG4gIElzQXJyYXksXG4gIElzRGVmaW5lZCxcbiAgSXNOdW1iZXIsXG4gIElzT2JqZWN0LFxuICBJc09iamVjdFRocm93RXJyb3IsXG59IGZyb20gJy4uLy4uLy4uL3BvcC1jb21tb24tdXRpbGl0eSc7XG5pbXBvcnQge1NlbGVjdENvbmZpZ30gZnJvbSAnLi4vLi4vYmFzZS9wb3AtZmllbGQtaXRlbS9wb3Atc2VsZWN0L3NlbGVjdC1jb25maWcubW9kZWwnO1xuaW1wb3J0IHtJbnB1dENvbmZpZ30gZnJvbSAnLi4vLi4vYmFzZS9wb3AtZmllbGQtaXRlbS9wb3AtaW5wdXQvaW5wdXQtY29uZmlnLm1vZGVsJztcbmltcG9ydCB7UG9wRG9tU2VydmljZX0gZnJvbSAnLi4vLi4vLi4vc2VydmljZXMvcG9wLWRvbS5zZXJ2aWNlJztcbmltcG9ydCB7SXNWYWxpZEZpZWxkUGF0Y2hFdmVudH0gZnJvbSAnLi4vcG9wLWVudGl0eS11dGlsaXR5JztcbmltcG9ydCB7UG9wRW50aXR5RmllbGRTZXJ2aWNlfSBmcm9tICcuL3BvcC1lbnRpdHktZmllbGQuc2VydmljZSc7XG5pbXBvcnQge1ZhbGlkYXRvcnN9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7QnV0dG9uQ29uZmlnfSBmcm9tICcuLi8uLi9iYXNlL3BvcC1maWVsZC1pdGVtL3BvcC1idXR0b24vYnV0dG9uLWNvbmZpZy5tb2RlbCc7XG5pbXBvcnQge1BvcENvbmZpcm1hdGlvbkRpYWxvZ0NvbXBvbmVudH0gZnJvbSAnLi4vLi4vYmFzZS9wb3AtZGlhbG9ncy9wb3AtY29uZmlybWF0aW9uLWRpYWxvZy9wb3AtY29uZmlybWF0aW9uLWRpYWxvZy5jb21wb25lbnQnO1xuaW1wb3J0IHtNYXREaWFsb2d9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2RpYWxvZyc7XG5pbXBvcnQge1BvcEVudGl0eUZpZWxkTW9kYWxDb21wb25lbnR9IGZyb20gJy4vcG9wLWVudGl0eS1maWVsZC1tb2RhbC9wb3AtZW50aXR5LWZpZWxkLW1vZGFsLmNvbXBvbmVudCc7XG5cblxuQENvbXBvbmVudCh7XG4gIHRlbXBsYXRlOiAnPGRpdj5Cb2lsZXI8L2Rpdj4nLFxufSlcbmV4cG9ydCBjbGFzcyBQb3BFbnRpdHlGaWVsZEJvaWxlckNvbXBvbmVudCBleHRlbmRzIFBvcEV4dGVuZENvbXBvbmVudCBpbXBsZW1lbnRzIEVudGl0eUZpZWxkQ29tcG9uZW50SW50ZXJmYWNlLCBPbkluaXQsIE9uRGVzdHJveSB7XG4gIEBJbnB1dCgpIGZpZWxkOiBGaWVsZENvbmZpZztcbiAgcHVibGljIG5hbWUgPSAnUG9wRW50aXR5RmllbGRCb2lsZXJDb21wb25lbnQnO1xuXG4gIHByb3RlY3RlZCBzcnY6IHtcbiAgICBkaWFsb2c6IE1hdERpYWxvZyxcbiAgICBmaWVsZDogUG9wRW50aXR5RmllbGRTZXJ2aWNlLFxuICB9ID0ge1xuICAgIGRpYWxvZzogU2VydmljZUluamVjdG9yLmdldChNYXREaWFsb2cpLFxuICAgIGZpZWxkOiBTZXJ2aWNlSW5qZWN0b3IuZ2V0KFBvcEVudGl0eUZpZWxkU2VydmljZSksXG4gIH07XG5cbiAgcHVibGljIHVpID0ge1xuICAgIGFjdGlvbkJ0bldpZHRoOiAwLFxuICAgIGFzc2V0OiA8S2V5TWFwPHtcbiAgICAgIGRpc3BsYXk6IElucHV0Q29uZmlnLFxuICAgICAgZW50cnk6IFNlbGVjdENvbmZpZyxcbiAgICAgIGN1c3RvbUxhYmVsOiBJbnB1dENvbmZpZyxcbiAgICAgIGFjdGlvbkJ0bldpZHRoPzogbnVtYmVyLFxuICAgICAgY2FuQ2FsbEJ0bj86IEJ1dHRvbkNvbmZpZyxcbiAgICAgIGNhblRleHRCdG4/OiBCdXR0b25Db25maWcsXG4gICAgfT4+dW5kZWZpbmVkLFxuICB9O1xuXG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIGVsOiBFbGVtZW50UmVmLFxuICAgIHByb3RlY3RlZCBfZG9tUmVwbzogUG9wRG9tU2VydmljZSxcbiAgICBASW5qZWN0KEZJRUxEX0NVU1RPTV9TRVRUSU5HKSBwdWJsaWMgY3VzdG9tX3NldHRpbmc6IERpY3Rpb25hcnk8RmllbGRDdXN0b21TZXR0aW5nSW50ZXJmYWNlPiA9IHt9XG4gICkge1xuICAgIHN1cGVyKCk7XG5cblxuICAgIC8qKlxuICAgICAqIFRoaXMgc2hvdWxkIHRyYW5zZm9ybVZhbHVlIGFuZCB2YWxpZGF0ZSB0aGUgZGF0YS4gVGhlIHZpZXcgc2hvdWxkIHRyeSB0byBvbmx5IHVzZSBkYXRhIHRoYXQgaXMgc3RvcmVkIG9uIHVpIHNvIHRoYXQgaXQgaXMgbm90IGRlcGVuZGVudCBvbiB0aGUgc3RydWN0dXJlIG9mIGRhdGEgdGhhdCBjb21lcyBmcm9tIG90aGVyIHNvdXJjZXMuIFRoZSB1aSBzaG91bGQgYmUgdGhlIHNvdXJjZSBvZiB0cnV0aCBoZXJlLlxuICAgICAqL1xuICAgIHRoaXMuZG9tLmNvbmZpZ3VyZSA9ICgpOiBQcm9taXNlPGJvb2xlYW4+ID0+IHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAvLyAjMTogRW5mb3JjZSBhIENvcmVDb25maWdcbiAgICAgICAgdGhpcy5maWVsZCA9IElzT2JqZWN0VGhyb3dFcnJvcih0aGlzLmZpZWxkLCBbJ2lkJywgJ2RhdGFfa2V5cyddLCBgJHt0aGlzLm5hbWV9OmNvbmZpZ3VyZURvbTogLSB0aGlzLmZpZWxkYCkgPyB0aGlzLmZpZWxkIDogbnVsbDtcbiAgICAgICAgdGhpcy5pZCA9IHRoaXMuZmllbGQuaWQ7XG4gICAgICAgIHRoaXMudWkuYXNzZXQgPSB7fTtcbiAgICAgICAgdGhpcy5fc2V0SW5pdGlhbENvbmZpZygpO1xuICAgICAgICB0aGlzLl90cmFuc2Zvcm1DaGlsZHJlbigpO1xuXG5cbiAgICAgICAgdGhpcy5maWVsZC5kYXRhX2tleXMubWFwKChkYXRhS2V5OiBudW1iZXIsIGluZGV4KSA9PiB7XG4gICAgICAgICAgdGhpcy5kb20uc2Vzc2lvbltkYXRhS2V5XSA9IHt9O1xuICAgICAgICAgIHRoaXMuZG9tLnNlc3Npb25bZGF0YUtleV0uZGlzcGxheSA9IHt9O1xuICAgICAgICAgIHRoaXMuZG9tLnN0YXRlW2RhdGFLZXldID0ge1xuICAgICAgICAgICAgb3BlbjogZmFsc2UsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogdGhpcy5maWVsZC5zdGF0ZSxcbiAgICAgICAgICAgIGZvb3Rlcl9hZGp1c3Q6IHRoaXMuZmllbGQuc3RhdGUsXG4gICAgICAgICAgICBjdXN0b21MYWJlbDogZmFsc2VcbiAgICAgICAgICB9O1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmRvbS5zZXRTdWJzY3JpYmVyKGBwYXJlbnQtZXZlbnQtaGFuZGxlcmAsIHRoaXMuZXZlbnRzLnN1YnNjcmliZSgoZXZlbnQ6IFBvcEJhc2VFdmVudEludGVyZmFjZSkgPT4ge1xuICAgICAgICAgIGlmIChJc09iamVjdChldmVudCwgdHJ1ZSkpIHtcbiAgICAgICAgICAgIGlmIChldmVudC5uYW1lID09PSAnYWRkJykge1xuICAgICAgICAgICAgICB0aGlzLm9uQWRkKGV2ZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pKTtcblxuICAgICAgICAvLyB0aGlzLnNydi5maWVsZC5zZXRGaWVsZEVudHJpZXModGhpcy5maWVsZCkudGhlbigoKSA9PiB7XG4gICAgICAgIC8vICAgdGhpcy5zcnYuZmllbGQuc2V0RmllbGRWYWx1ZXModGhpcy5maWVsZCkudGhlbigoKSA9PiB7XG4gICAgICAgIC8vICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgLy8gICB9KTtcbiAgICAgICAgLy8gfSk7XG5cbiAgICAgICAgcmV0dXJuIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgdGhpcy5kb20ucHJvY2VlZCA9ICgpOiBQcm9taXNlPGJvb2xlYW4+ID0+IHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICB0aGlzLl9yZXN0b3JlRG9tU2Vzc2lvbigpO1xuICAgICAgICB0aGlzLl9zZXRBc3NldENvbmZpZ3MoKTtcbiAgICAgICAgdGhpcy5fc2V0RmllbGRBdHRyaWJ1dGVzKCk7XG4gICAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfVxuXG5cbiAgbmdPbkluaXQoKSB7XG4gICAgc3VwZXIubmdPbkluaXQoKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEhhbmRsZSBjbGljayBvZiBhY3Rpb24gYnV0dG9uXG4gICAqIEBwYXJhbSBldmVudFxuICAgKiBAcGFyYW0gZGF0YUtleVxuICAgKi9cbiAgb25BY3Rpb25FdmVudChldmVudDogUG9wQmFzZUV2ZW50SW50ZXJmYWNlLCBkYXRhS2V5PzogbnVtYmVyKSB7XG4gICAgaWYgKGV2ZW50LnR5cGUgPT09ICdmaWVsZCcpIHtcbiAgICAgIHN3aXRjaCAoU3RyaW5nKGV2ZW50Lm5hbWUpLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgICAgLy8gY2FzZSAnYWRkJzpcbiAgICAgICAgLy8gICB0aGlzLm9uQWRkKGV2ZW50KTtcbiAgICAgICAgLy8gICBicmVhaztcbiAgICAgICAgY2FzZSAncmVtb3ZlJzpcbiAgICAgICAgICB0aGlzLm9uUmVtb3ZlKGV2ZW50LCBkYXRhS2V5KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZWRpdCc6XG4gICAgICAgICAgdGhpcy5vbkVkaXQoZXZlbnQsIGRhdGFLZXkpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdjbG9zZSc6XG4gICAgICAgICAgdGhpcy5vbkNsb3NlKGV2ZW50LCBkYXRhS2V5KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBoYW5kbGUgSW5wdXQgQ2hhbmdlcyBmcm9tIHRoZSBmaWVsZCBpdGVtc1xuICAgKiBAcGFyYW0gZXZlbnRcbiAgICogQHBhcmFtIGRhdGFLZXlcbiAgICogQHBhcmFtIG5hbWVcbiAgICovXG4gIG9uRmllbGRJdGVtRXZlbnQoZXZlbnQ6IFBvcEJhc2VFdmVudEludGVyZmFjZSwgZGF0YUtleTogbnVtYmVyID0gbnVsbCwgbmFtZTogc3RyaW5nID0gbnVsbCkge1xuICAgIGlmIChJc1ZhbGlkRmllbGRQYXRjaEV2ZW50KHRoaXMuY29yZSwgZXZlbnQpKSB7XG4gICAgICB0aGlzLm9uUGF0Y2goZXZlbnQsIGRhdGFLZXksIG5hbWUpO1xuICAgIH0gZWxzZSBpZiAoZXZlbnQudHlwZSA9PT0gJ2ZpZWxkJykge1xuICAgICAgaWYgKGV2ZW50Lm5hbWUgPT09ICdjbG9zZScpIHtcbiAgICAgICAgdGhpcy5vbkNsb3NlKGV2ZW50LCBkYXRhS2V5KTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBVc2VyIHdhbnRzIHRvIGFkZCBhIHZhbHVlIGVudHJ5ICBpbnRvIHRoZSBmaWVsZFxuICAgKiBAcGFyYW0gZXZlbnRcbiAgICovXG4gIG9uQWRkKGV2ZW50OiBQb3BCYXNlRXZlbnRJbnRlcmZhY2UpIHtcbiAgICAvLyBjb25zb2xlLmxvZygnYWRkIGxvd2VyJywgdGhpcy5maWVsZC5kYXRhX2tleXMubGVuZ3RoIDwgdGhpcy5maWVsZC5lbnRyaWVzLmxlbmd0aCwgdGhpcy5maWVsZC5lbnRyaWVzKTtcbiAgICB0aGlzLmxvZy5ldmVudChgb25BZGRgLCBldmVudCwpO1xuICAgIGlmICh0aGlzLmZpZWxkLmRhdGFfa2V5cy5sZW5ndGggPCB0aGlzLmZpZWxkLmVudHJpZXMubGVuZ3RoKSB7XG4gICAgICBjb25zdCBpbmRleCA9IHRoaXMuZmllbGQuZW50cmllcy5sZW5ndGggLSAxO1xuICAgICAgY29uc3QgaXRlbSA9IHRoaXMuc3J2LmZpZWxkLmFkZEVudHJ5VmFsdWUodGhpcy5jb3JlLCB0aGlzLmZpZWxkKTtcbiAgICAgIGNvbnN0IGRhdGEgPSBpdGVtLmRhdGE7XG4gICAgICBkZWxldGUgaXRlbS5kYXRhO1xuXG4gICAgICB0aGlzLmZpZWxkLmRhdGFbaXRlbS5lbnRyeS5pZF0gPSBkYXRhO1xuICAgICAgdGhpcy5maWVsZC5pdGVtc1tpdGVtLmVudHJ5LmlkXSA9IGl0ZW07XG5cblxuICAgICAgdGhpcy5maWVsZC5kYXRhX2tleXMucHVzaChpdGVtLmVudHJ5LmlkICsgJycpO1xuXG4gICAgICB0aGlzLl9zZXRGaWVsZEl0ZW1BdHRyaWJ1dGUoaXRlbS5lbnRyeS5pZCwgaW5kZXgpO1xuICAgICAgdGhpcy5fc2V0QXNzZXRDb25maWcoaXRlbS5lbnRyeS5pZCwgaW5kZXgpO1xuICAgICAgdGhpcy5kb20uc2V0VGltZW91dCgnb3Blbi1uZXcnLCAoKSA9PiB7XG4gICAgICAgIHRoaXMuX3VwZGF0ZVN0YXRlKGl0ZW0uZW50cnkuaWQsICdvcGVuJywgdHJ1ZSk7XG4gICAgICB9LCAwKTtcblxuXG4gICAgICAvLyB0aGlzLmRvbS5zZXNzaW9uWyB2YWx1ZS5lbnRyeS5pZCBdID0ge307XG4gICAgICAvLyB0aGlzLmRvbS5zZXNzaW9uWyB2YWx1ZS5lbnRyeS5pZCBdLmRpc3BsYXkgPSB7fTtcbiAgICAgIC8vIHRoaXMuZG9tLnN0YXRlWyB2YWx1ZS5lbnRyeS5pZCBdID0ge1xuICAgICAgLy8gICBvcGVuOiB0cnVlLFxuICAgICAgLy8gICB0ZW1wbGF0ZTogdGhpcy5maWVsZC5zdGF0ZSxcbiAgICAgIC8vICAgZm9vdGVyX2FkanVzdDogdGhpcy5maWVsZC5zdGF0ZSxcbiAgICAgIC8vICAgY3VzdG9tTGFiZWw6IGZhbHNlXG4gICAgICAvLyB9O1xuXG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cblxuICAvKipcbiAgICogVXNlciB3YW50cyB0byBvcGVuIHRoZSB2YWx1ZSBlbnRyeSBhbmQgbWFrZSBlZGl0c1xuICAgKiBAcGFyYW0gZXZlbnRcbiAgICovXG5cbiAgb25FZGl0KGV2ZW50PzogUG9wQmFzZUV2ZW50SW50ZXJmYWNlLCBkYXRhS2V5PzogbnVtYmVyKSB7XG5cbiAgICB0aGlzLmxvZy5ldmVudChgb25FZGl0YCwgZXZlbnQpO1xuICAgIGlmICh0aGlzLmZpZWxkLm1vZGFsKSB7XG4gICAgICBjb25zb2xlLmxvZygnaGFzIG1vZGFsJyk7XG5cbiAgICAgIGNvbnN0IGRpYWxvZ1JlZiA9IHRoaXMuc3J2LmRpYWxvZy5vcGVuKFBvcEVudGl0eUZpZWxkTW9kYWxDb21wb25lbnQsIHtcbiAgICAgICAgd2lkdGg6IGAke3dpbmRvdy5pbm5lcldpZHRoICogLjUwfXB4YCxcbiAgICAgICAgaGVpZ2h0OiBgJHt3aW5kb3cuaW5uZXJIZWlnaHQgKiAuNTB9cHhgLFxuICAgICAgICBwYW5lbENsYXNzOiAnc3ctcmVsYXRpdmUnLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgY29yZTogdGhpcy5jb3JlLFxuICAgICAgICAgIGZpZWxkOiB0aGlzLmZpZWxkXG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG5cbiAgICAgIHRoaXMuZG9tLnN1YnNjcmliZXIuZGlhbG9nID0gZGlhbG9nUmVmLmJlZm9yZUNsb3NlZCgpLnN1YnNjcmliZSgoY2hhbmdlZCkgPT4ge1xuICAgICAgICBpZiAoY2hhbmdlZCB8fCB0aGlzLmRvbS5zdGF0ZS5yZWZyZXNoKSB7XG4gICAgICAgICAgLy8gdGhpcy5fY29uZmlndXJlVGFibGUoKTt1cFxuICAgICAgICB9XG4gICAgICAgIHRoaXMuZG9tLnN0YXRlLmJsb2NrTW9kYWwgPSBmYWxzZTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmRvbS5zdGF0ZS50ZW1wbGF0ZSA9ICd0ZW1wbGF0ZV9lZGl0JztcbiAgICAgIHRoaXMuZG9tLnN0YXRlLm9wZW4gPSB0cnVlO1xuICAgICAgaWYgKElzRGVmaW5lZChkYXRhS2V5KSAmJiB0aGlzLmRvbS5zdGF0ZVtkYXRhS2V5XSkge1xuICAgICAgICB0aGlzLmRvbS5zdGF0ZVtkYXRhS2V5XS50ZW1wbGF0ZSA9ICd0ZW1wbGF0ZV9lZGl0JztcbiAgICAgICAgdGhpcy5kb20uc3RhdGVbZGF0YUtleV0ub3BlbiA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBPYmplY3Qua2V5cyh0aGlzLmRvbS5zdGF0ZSkubWFwKChrZXkpID0+IHtcbiAgICAgICAgICBpZiAoSXNOdW1iZXIoa2V5KSkge1xuICAgICAgICAgICAgdGhpcy5kb20uc3RhdGVba2V5XS50ZW1wbGF0ZSA9ICd0ZW1wbGF0ZV9lZGl0JztcbiAgICAgICAgICAgIHRoaXMuZG9tLnN0YXRlW2tleV0ub3BlbiA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHRoaXMuZG9tLnN0b3JlKCdzdGF0ZScpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogVXNlciB3YW50cyB0byByZW1vdmUgYSB2YWx1ZSBlbnRyeVxuICAgKiBAcGFyYW0gZXZlbnRcbiAgICovXG4gIG9uUmVtb3ZlKGV2ZW50OiBQb3BCYXNlRXZlbnRJbnRlcmZhY2UsIGRhdGFLZXk6IG51bWJlcikge1xuICAgIHRoaXMubG9nLmV2ZW50KGBvblJlbW92ZWAsIGV2ZW50KTtcbiAgICBpZiAodGhpcy5maWVsZC5mYWNhZGUpIHtcbiAgICAgIHRoaXMub25CdWJibGVFdmVudCgncmVtb3ZlJywge2RhdGFLZXk6IGRhdGFLZXl9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zcnYuZGlhbG9nLm9wZW4oUG9wQ29uZmlybWF0aW9uRGlhbG9nQ29tcG9uZW50LCB7XG4gICAgICAgIHdpZHRoOiAnMzUwcHgnLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgb3B0aW9uOiBudWxsLFxuICAgICAgICAgIGJvZHk6IGBEZWxldGUgdGhpcyBmaWVsZCB2YWx1ZT9gXG4gICAgICAgIH1cbiAgICAgIH0pLmFmdGVyQ2xvc2VkKCkuc3Vic2NyaWJlKG9wdGlvbiA9PiB7XG4gICAgICAgIGlmIChvcHRpb24gJiYgb3B0aW9uLmNvbmZpcm1lZCkge1xuICAgICAgICAgIHRoaXMuc3J2LmZpZWxkLnJlbW92ZUVudHJ5VmFsdWUodGhpcy5jb3JlLCB0aGlzLmZpZWxkLCBkYXRhS2V5KS50aGVuKChyZXMpID0+IHtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLmZpZWxkLmRhdGFbZGF0YUtleV07XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5maWVsZC5pdGVtc1tkYXRhS2V5XTtcbiAgICAgICAgICAgIHRoaXMuZmllbGQuZGF0YV9rZXlzLnBvcCgpO1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMuZG9tLnN0YXRlW2RhdGFLZXldO1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMudWkuYXNzZXRbZGF0YUtleV07XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5kb20uc2Vzc2lvbltkYXRhS2V5XTtcbiAgICAgICAgICAgIHRoaXMuZG9tLnN0b3JlKCdzZXNzaW9uJyk7XG4gICAgICAgICAgICB0aGlzLm9uQnViYmxlRXZlbnQoJ3JlbW92ZScsIHtkYXRhS2V5OiBkYXRhS2V5fSk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFVzZXIgY2xvc2VzIHRoZSBlZGl0IGFiaWxpdHkgb2YgdGhlIHZhbHVlIGVudHJpZXNcbiAgICogQHBhcmFtIGV2ZW50XG4gICAqL1xuXG4gIG9uQ2xvc2UoZXZlbnQ6IFBvcEJhc2VFdmVudEludGVyZmFjZSwgZGF0YUtleT86IG51bWJlcikge1xuICAgIHRoaXMubG9nLmV2ZW50KGBvbkNsb3NlYCwgZXZlbnQpO1xuICAgIHRoaXMuZG9tLnN0YXRlLm9wZW4gPSBmYWxzZTtcbiAgICB0aGlzLmRvbS5zdGF0ZS50ZW1wbGF0ZSA9ICd0ZW1wbGF0ZV9yZWFkb25seSc7XG4gICAgaWYgKGRhdGFLZXkpIHtcbiAgICAgIHRoaXMuZG9tLnN0YXRlW2RhdGFLZXldLnRlbXBsYXRlID0gJ3RlbXBsYXRlX3JlYWRvbmx5JztcbiAgICAgIHRoaXMuZG9tLnN0YXRlW2RhdGFLZXldLm9wZW4gPSBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgT2JqZWN0LmtleXModGhpcy5kb20uc3RhdGUpLm1hcCgoa2V5KSA9PiB7XG4gICAgICAgIGlmIChJc051bWJlcihrZXkpKSB7XG4gICAgICAgICAgdGhpcy5kb20uc3RhdGVba2V5XS50ZW1wbGF0ZSA9ICd0ZW1wbGF0ZV9yZWFkb25seSc7XG4gICAgICAgICAgdGhpcy5kb20uc3RhdGVba2V5XS5vcGVuID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICB0aGlzLm9uQnViYmxlRXZlbnQoJ2Nsb3NlJyk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBBIG1ldGhvZCB0byByZW1vdmUgYW4gYWRkaXRpb25hbCB2YWx1ZXMgZnJvbSB0aGlzIGZpZWxkXG4gICAqIEBwYXJhbSBpZFxuICAgKiBAcGFyYW0gYXJjaGl2ZVxuICAgKi9cbiAgb25QYXRjaChldmVudDogUG9wQmFzZUV2ZW50SW50ZXJmYWNlLCBkYXRhS2V5OiBudW1iZXIgPSBudWxsLCBuYW1lOiBzdHJpbmcgPSBudWxsKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jIChyZXNvbHZlKSA9PiB7XG4gICAgICBldmVudC5kYXRhX2tleSA9IGRhdGFLZXk7XG4gICAgICBldmVudC5jb2x1bW4gPSBuYW1lO1xuICAgICAgaWYgKHRoaXMuZmllbGQuZmFjYWRlKSB7XG4gICAgICAgIHRoaXMub25CdWJibGVFdmVudCgnb25QYXRjaCcsIG51bGwsIGV2ZW50KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh0cnVlKSB7XG4gICAgICAgICAgYXdhaXQgdGhpcy5zcnYuZmllbGQudXBkYXRlRmllbGRJdGVtKHRoaXMuY29yZSwgdGhpcy5maWVsZCwgZXZlbnQpO1xuICAgICAgICAgIHRoaXMuZmllbGQuZGF0YVtkYXRhS2V5XVtuYW1lXSA9IGV2ZW50LmNvbmZpZy5jb250cm9sLnZhbHVlO1xuICAgICAgICAgIHRoaXMuX3RyaWdnZXJVcGRhdGVBc3NldERpc3BsYXkoZGF0YUtleSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgIH0pO1xuICB9XG5cblxuICAvKipcbiAgICogSGFuZGxlIHRoZSBidWJibGUgZXZlbnRzIHRoYXQgY29tZSB1cFxuICAgKiBAcGFyYW0gZXZlbnRcbiAgICovXG4gIG9uQnViYmxlRXZlbnQobmFtZTogc3RyaW5nLCBleHRlbnNpb24/OiBEaWN0aW9uYXJ5PGFueT4sIGV2ZW50PzogUG9wQmFzZUV2ZW50SW50ZXJmYWNlKTogYm9vbGVhbiB7XG4gICAgaWYgKCFldmVudCkgZXZlbnQgPSB7c291cmNlOiB0aGlzLm5hbWUsIHR5cGU6ICdmaWVsZCcsIG5hbWU6IG5hbWV9O1xuICAgIGlmIChleHRlbnNpb24pIGV2ZW50ID0gey4uLmV2ZW50LCAuLi5leHRlbnNpb259O1xuICAgIHRoaXMubG9nLmV2ZW50KGBidWJibGVFdmVudGAsIGV2ZW50KTtcbiAgICB0aGlzLmV2ZW50cy5lbWl0KGV2ZW50KTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIENsZWFuIHVwIGRvbSBzdWJzY3JpYmVycywgaW50ZXJ2YWwsIHRpbWVvdXRzLCAuLmV0Y1xuICAgKi9cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgc3VwZXIubmdPbkRlc3Ryb3koKTtcbiAgfVxuXG5cbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCYXNlIFByb3RlY3RlZCBNZXRob2RzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIFByb3RlY3RlZCBNZXRob2QgKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiAgLyoqXG4gICAqIFNldCB0aGUgaW5pdGlhbCBjb25maWdcbiAgICogSW50ZW5kZWQgdG8gYmUgb3ZlcnJpZGRlbiBwZXIgZmllbGRcbiAgICovXG4gIHByb3RlY3RlZCBfc2V0SW5pdGlhbENvbmZpZygpOiB2b2lkIHtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFBhc3MgaW4gYW55IHNlc3Npb24gY2hhbmdlc1xuICAgKiBUaGUgdXNlciBtYXkgY2hhbmdlIHRhYnMgYW5kIHRoZSBzdGF0ZSBzaG91bGQgYmUgcmVzdG9yZWRcbiAgICovXG4gIHByb3RlY3RlZCBfcmVzdG9yZURvbVNlc3Npb24oKSB7XG4gICAgdGhpcy5maWVsZC5kYXRhX2tleXMubWFwKChkYXRhS2V5OiBudW1iZXIsIGluZGV4KSA9PiB7XG4gICAgICBpZiAoSXNPYmplY3QodGhpcy5kb20uc2Vzc2lvbltkYXRhS2V5XSwgdHJ1ZSkpIHtcbiAgICAgICAgY29uc3QgaXRlbSA9IHRoaXMuZmllbGQuaXRlbXNbZGF0YUtleV07XG4gICAgICAgIGNvbnN0IHNlc3Npb24gPSB0aGlzLmRvbS5zZXNzaW9uW2RhdGFLZXldO1xuICAgICAgICBpZiAoSXNPYmplY3Qoc2Vzc2lvbi5lbnRyeSwgWydpZCddKSkge1xuICAgICAgICAgIGl0ZW0uZW50cnkgPSBzZXNzaW9uLmVudHJ5O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBCdWlsZCB0aGUgZGVmYXVsdCBjb25maWdzIHRoYXQgYXJlIGFjcm9zcyBhbGwgdGhlIGZpZWVsZHNcbiAgICovXG4gIHByb3RlY3RlZCBfc2V0QXNzZXRDb25maWdzKCkge1xuICAgIHRoaXMuc3J2LmZpZWxkLnNldEZpZWxkQ3VzdG9tU2V0dGluZyh0aGlzLmZpZWxkLCB0aGlzLmN1c3RvbV9zZXR0aW5nKTtcbiAgICBkZWxldGUgdGhpcy5jdXN0b21fc2V0dGluZztcbiAgICB0aGlzLmZpZWxkLmRhdGFfa2V5cy5tYXAoKGRhdGFLZXk6IG51bWJlciwgaW5kZXgpID0+IHtcbiAgICAgIHRoaXMuX3NldEFzc2V0Q29uZmlnKCtkYXRhS2V5LCBpbmRleCk7XG4gICAgfSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBMYWJlbHMgYXJlIGEgYnVpbHQgaW4gbWV0aG9kIHRoYXQgYWxsIGZpZWxkcyBzaG91bGQgbmVlZFxuICAgKiBAcGFyYW0gZGF0YUtleVxuICAgKiBAcGFyYW0gaW5kZXhcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHByb3RlY3RlZCBfc2V0QXNzZXRDb25maWcoZGF0YUtleTogbnVtYmVyLCBpbmRleDogbnVtYmVyKSB7XG5cbiAgICBjb25zdCBjdXN0b21FbnRyaWVzID0gRGVlcENvcHkodGhpcy5maWVsZC5lbnRyaWVzKS5maWx0ZXIoKGVudHJ5KSA9PiB7XG4gICAgICByZXR1cm4gZW50cnkudHlwZSA9PT0gJ2N1c3RvbSc7XG4gICAgfSk7XG4gICAgY29uc3QgcHJvdmlkZWRFbnRyaWVzID0gRGVlcENvcHkodGhpcy5maWVsZC5lbnRyaWVzKS5maWx0ZXIoKGVudHJ5KSA9PiB7XG4gICAgICByZXR1cm4gZW50cnkudHlwZSAhPT0gJ2N1c3RvbSc7XG4gICAgfSk7XG4gICAgY29uc3QgZW50cmllcyA9IFsuLi5wcm92aWRlZEVudHJpZXNdO1xuXG4gICAgY29uc3QgaXRlbSA9IHRoaXMuZmllbGQuaXRlbXNbZGF0YUtleV07XG5cbiAgICBpZiAoIWl0ZW0uZW50cnkpIHtcbiAgICAgIGl0ZW0uZW50cnkgPSB0aGlzLmZpZWxkLmVudHJpZXNbMF07XG4gICAgfVxuXG4gICAgdGhpcy5fdXBkYXRlRGlzcGxheUZpZWxkKGRhdGFLZXksICdsYWJlbCcsIGl0ZW0uZW50cnkubmFtZSk7XG5cbiAgICBjb25zdCBjdXN0b21MYWJlbCA9IHRoaXMuZmllbGQuc2V0dGluZy5lZGl0X2xhYmVsICYmIHRoaXMuZmllbGQuc2V0dGluZy5jdXN0b21fbGFiZWwgJiYgaXRlbS5lbnRyeS50eXBlID09PSAnY3VzdG9tJyA/IHRydWUgOiBmYWxzZTtcblxuICAgIHRoaXMuX3VwZGF0ZVN0YXRlKGRhdGFLZXksICdjdXN0b21fbGFiZWwnLCBjdXN0b21MYWJlbCk7XG5cbiAgICBpZiAodGhpcy5maWVsZC5zZXR0aW5nLmN1c3RvbV9sYWJlbCAmJiBJc0FycmF5KGN1c3RvbUVudHJpZXMsIHRydWUpKSBlbnRyaWVzLnB1c2goY3VzdG9tRW50cmllc1tjdXN0b21FbnRyaWVzLmxlbmd0aCAtIDFdKTtcbiAgICAvLyBUb0RvOjogQWRkIGFwaSBjYWxscyB0byBzdG9yZSB2YWx1ZXMgZm9yIHRoZXNlIGNvbmZpZ3NcbiAgICBpZiAoIUlzT2JqZWN0KHRoaXMudWkuYXNzZXRbZGF0YUtleV0sIHRydWUpKSB7XG4gICAgICB0aGlzLnVpLmFzc2V0W2RhdGFLZXldID0ge1xuICAgICAgICBkaXNwbGF5OiBuZXcgSW5wdXRDb25maWcoe1xuICAgICAgICAgIHJlYWRvbmx5OiB0cnVlLFxuICAgICAgICAgIGxhYmVsOiBpdGVtLmVudHJ5Lm5hbWUsXG4gICAgICAgICAgdmFsdWU6IHRoaXMuX2dldEFzc2V0RGlzcGxheVN0cihkYXRhS2V5KSxcbiAgICAgICAgICAvLyBtaW5pbWFsOiB0cnVlLFxuICAgICAgICB9KSxcblxuICAgICAgICBlbnRyeTogbmV3IFNlbGVjdENvbmZpZyh7XG4gICAgICAgICAgbGFiZWw6ICdMYWJlbCcsXG4gICAgICAgICAgdmFsdWU6IGl0ZW0uZW50cnkgPyBpdGVtLmVudHJ5LmlkIDogbnVsbCxcbiAgICAgICAgICBvcHRpb25zOiB7dmFsdWVzOiBDb252ZXJ0QXJyYXlUb09wdGlvbkxpc3QoZW50cmllcyl9LFxuICAgICAgICAgIG1pbmltYWw6IHRydWUsXG4gICAgICAgICAgZmFjYWRlOiB0cnVlLFxuICAgICAgICAgIHBhdGNoOiB7XG4gICAgICAgICAgICBmaWVsZDogYGAsXG4gICAgICAgICAgICBwYXRoOiBgYCxcbiAgICAgICAgICAgIGNhbGxiYWNrOiAoY29yZTogQ29yZUNvbmZpZywgZXZlbnQ6IFBvcEJhc2VFdmVudEludGVyZmFjZSkgPT4ge1xuICAgICAgICAgICAgICBpZiAoSXNWYWxpZEZpZWxkUGF0Y2hFdmVudChjb3JlLCBldmVudCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGVGaWVsZEVudHJ5KGRhdGFLZXksICtldmVudC5jb25maWcuY29udHJvbC52YWx1ZSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pLFxuICAgICAgICBjdXN0b21MYWJlbDogbmV3IElucHV0Q29uZmlnKHtcbiAgICAgICAgICBsYWJlbDogJ0N1c3RvbSBMYWJlbCcsXG4gICAgICAgICAgdmFsdWU6IHRoaXMuZG9tLnNlc3Npb25bZGF0YUtleV0uY3VzdG9tTGFiZWwgPyB0aGlzLmRvbS5zZXNzaW9uW2RhdGFLZXldLmN1c3RvbUxhYmVsIDogJycsXG4gICAgICAgICAgcmVxdWlyZWQ6IHRydWUsXG4gICAgICAgICAgdmFsaWRhdG9yczogW1ZhbGlkYXRvcnMucmVxdWlyZWRdLFxuICAgICAgICAgIG1heGxlbmd0aDogMjQsXG4gICAgICAgICAgLy8gbWluaW1hbDogdHJ1ZSxcbiAgICAgICAgICBmYWNhZGU6IHRydWUsXG4gICAgICAgICAgcGF0Y2g6IHtcbiAgICAgICAgICAgIGZpZWxkOiBgYCxcbiAgICAgICAgICAgIHBhdGg6IGBgLFxuICAgICAgICAgICAgY2FsbGJhY2s6IChjb3JlOiBDb3JlQ29uZmlnLCBldmVudDogUG9wQmFzZUV2ZW50SW50ZXJmYWNlKSA9PiB7XG4gICAgICAgICAgICAgIGlmIChJc1ZhbGlkRmllbGRQYXRjaEV2ZW50KGNvcmUsIGV2ZW50KSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZUN1c3RvbUVudHJ5TGFiZWwoZGF0YUtleSwgZXZlbnQuY29uZmlnLmNvbnRyb2wudmFsdWUpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfTtcbiAgICB9XG5cbiAgICB0aGlzLl91cGRhdGVDdXN0b21MYWJlbFN0YXRlKGRhdGFLZXksIGl0ZW0uZW50cnkpO1xuICB9XG5cblxuICAvKipcbiAgICogVXBkYXRlcyB3aGVuIGEgdmFsdWVzIGNoYW5nZXMgaXQgbGFiZWwvZW50cnlcbiAgICogQHBhcmFtIGRhdGFLZXlcbiAgICogQHBhcmFtIGVudHJ5SWRcbiAgICovXG4gIHByb3RlY3RlZCBfdXBkYXRlRmllbGRFbnRyeShkYXRhS2V5OiBudW1iZXIsIGVudHJ5SWQ6IG51bWJlcikge1xuICAgIGNvbnN0IGl0ZW0gPSB0aGlzLmZpZWxkLml0ZW1zW2RhdGFLZXldO1xuICAgIGlmIChJc09iamVjdChpdGVtLCB0cnVlKSkge1xuICAgICAgY29uc3QgZW50cnlMb29rdXAgPSBBcnJheU1hcFNldHRlcih0aGlzLmZpZWxkLmVudHJpZXMsICdpZCcpO1xuICAgICAgY29uc3QgZW50cnkgPSB0aGlzLmZpZWxkLmVudHJpZXNbZW50cnlMb29rdXBbZW50cnlJZF1dO1xuICAgICAgaXRlbS5lbnRyeSA9IGVudHJ5O1xuICAgICAgdGhpcy5kb20uc2Vzc2lvbltkYXRhS2V5XS5lbnRyeSA9IGVudHJ5O1xuICAgICAgdGhpcy5kb20uc3RvcmUoJ3Nlc3Npb24nKTtcbiAgICAgIHRoaXMuX3VwZGF0ZUN1c3RvbUxhYmVsU3RhdGUoZGF0YUtleSwgZW50cnkpO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIGN1c3RvbSBsYWJlbCBpZiB0aGUgdXNlciBjaG9vc2VzIHRvIG1ha2UgYSBjdXN0b20gZW50cnkgbGFiZWxcbiAgICogQHBhcmFtIGRhdGFLZXlcbiAgICogQHBhcmFtIHZhbHVlXG4gICAqL1xuICBwcm90ZWN0ZWQgX3VwZGF0ZUN1c3RvbUVudHJ5TGFiZWwoZGF0YUtleTogbnVtYmVyLCB2YWx1ZTogc3RyaW5nKSB7XG4gICAgY29uc3QgaXRlbSA9IHRoaXMuZmllbGQuaXRlbXNbZGF0YUtleV07XG4gICAgaWYgKElzT2JqZWN0KGl0ZW0sIHRydWUpKSB7XG4gICAgICB0aGlzLl91cGRhdGVEaXNwbGF5RmllbGQoZGF0YUtleSwgJ2xhYmVsJywgdmFsdWUpO1xuICAgICAgaWYgKElzT2JqZWN0KHRoaXMuZG9tLnNlc3Npb25bZGF0YUtleV0sIHRydWUpKSB7XG4gICAgICAgIHRoaXMuZG9tLnNlc3Npb25bZGF0YUtleV0uY3VzdG9tTGFiZWwgPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5kb20uc3RvcmUoJ3Nlc3Npb24nKTtcblxuICAgICAgfVxuXG4gICAgICB0aGlzLl91cGRhdGVEaXNwbGF5TGFiZWwoZGF0YUtleSwgdmFsdWUpO1xuICAgICAgLy8gVG9Ebzo6IEZpZ3VyZSB3aGVyZSB0byBzYXZlIHRoaXNcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBFbnN1cmUgdGhlIHN0YXRlIG9mIHRoZSB2aWV3IG1hdGNoZXMgdXAgYWNjb3JkaW5nIHRvIHRoZSBzdG9yZWQgZW50cnkvbGFiZWxcbiAgICogQ3VzdG9tIExhYmVscyBuZWVkIHNwZWNpYWwgaGFuZGxpbmdcbiAgICogQHBhcmFtIGRhdGFLZXlcbiAgICogQHBhcmFtIGVudHJ5XG4gICAqL1xuICBwcm90ZWN0ZWQgX3VwZGF0ZUN1c3RvbUxhYmVsU3RhdGUoZGF0YUtleTogbnVtYmVyLCBlbnRyeTogRmllbGRFbnRyeSkge1xuICAgIGlmIChkYXRhS2V5ICYmIElzT2JqZWN0KGVudHJ5LCBbJ2lkJywgJ3R5cGUnLCAnbmFtZSddKSkge1xuICAgICAgY29uc3QgaXNDdXN0b20gPSBlbnRyeS50eXBlID09PSAnY3VzdG9tJztcbiAgICAgIGlmIChpc0N1c3RvbSkge1xuICAgICAgICB0aGlzLl91cGRhdGVTdGF0ZShkYXRhS2V5LCAnY3VzdG9tTGFiZWwnLCAodGhpcy5maWVsZC5zZXR0aW5nLmVkaXRfbGFiZWwgJiYgaXNDdXN0b20gPyB0cnVlIDogZmFsc2UpKTtcbiAgICAgICAgaWYgKCF0aGlzLnVpLmFzc2V0W2RhdGFLZXldLmN1c3RvbUxhYmVsLmNvbnRyb2wudmFsdWUpIHtcbiAgICAgICAgICB0aGlzLnVpLmFzc2V0W2RhdGFLZXldLmN1c3RvbUxhYmVsLmNvbnRyb2wuc2V0VmFsdWUoJ0N1c3RvbScsIHtlbWl0RXZlbnQ6IHRydWV9KTtcbiAgICAgICAgICB0aGlzLl91cGRhdGVEaXNwbGF5RmllbGQoZGF0YUtleSwgJ2xhYmVsJywgJ0N1c3RvbScpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IHByZXZpb3VzQ3VzdG9tTGFiZWwgPSB0aGlzLnVpLmFzc2V0W2RhdGFLZXldLmN1c3RvbUxhYmVsLmNvbnRyb2wudmFsdWU7XG4gICAgICAgICAgdGhpcy5fdXBkYXRlRGlzcGxheUZpZWxkKGRhdGFLZXksICdsYWJlbCcsIHByZXZpb3VzQ3VzdG9tTGFiZWwpO1xuICAgICAgICAgIGlmICh0aGlzLmRvbS5zZXNzaW9uLmVudHJ5KSB7XG4gICAgICAgICAgICB0aGlzLmRvbS5zZXNzaW9uLmVudHJ5Lm5hbWUgPSBwcmV2aW91c0N1c3RvbUxhYmVsO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLl91cGRhdGVEaXNwbGF5TGFiZWwoZGF0YUtleSwgdGhpcy51aS5hc3NldFtkYXRhS2V5XS5jdXN0b21MYWJlbC5jb250cm9sLnZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3VwZGF0ZVN0YXRlKGRhdGFLZXksICdjdXN0b21MYWJlbCcsIGZhbHNlKTtcbiAgICAgICAgdGhpcy5fdXBkYXRlRGlzcGxheUZpZWxkKGRhdGFLZXksICdsYWJlbCcsIGVudHJ5Lm5hbWUpO1xuICAgICAgICB0aGlzLl91cGRhdGVEaXNwbGF5TGFiZWwoZGF0YUtleSwgZW50cnkubmFtZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogVXBkYXRlIHRoZSBkaXNwbGF5IGxhYmVsIG9mIHRoZSB2YWx1ZSBjb25maWdcbiAgICogU29tZSBmaWVsZHMgb25seSB1c2UgYSBzaW5nbGUgZmllbGQgaXRlbSB0aGF0IGlzIGRlZmF1bHRlZCB0byB0aGUgdmFsdWUgY29sdW1uXG4gICAqIEBwYXJhbSBkYXRhS2V5XG4gICAqIEBwYXJhbSB2YWx1ZVxuICAgKi9cbiAgcHJvdGVjdGVkIF91cGRhdGVEaXNwbGF5TGFiZWwoZGF0YUtleTogbnVtYmVyLCB2YWx1ZTogc3RyaW5nKSB7XG4gICAgY29uc3QgaXRlbSA9IHRoaXMuZmllbGQuaXRlbXNbZGF0YUtleV07XG4gICAgaWYgKElzT2JqZWN0KGl0ZW0sIHRydWUpKSB7XG4gICAgICBjb25zdCBjb25maWdzID0gPGFueT5pdGVtLmNvbmZpZztcbiAgICAgIGNvbnN0IHZhbHVlQ29uZmlnID0gSXNPYmplY3QoaXRlbS5jb25maWcsIFsndmFsdWUnXSkgPyA8SW5wdXRDb25maWc+Y29uZmlncy52YWx1ZSA6IG51bGw7XG4gICAgICBpZiAoSXNPYmplY3QodmFsdWVDb25maWcsIHRydWUpKSB7IC8vIHRoaXMgbWVhbnMgdGhhdCBpdCBhIGEgc2ltcGxlIGZpZWxkLFxuICAgICAgICB2YWx1ZUNvbmZpZy5sYWJlbCA9IHZhbHVlO1xuICAgICAgfVxuICAgICAgdGhpcy51aS5hc3NldFtkYXRhS2V5XS5kaXNwbGF5LmxhYmVsID0gdmFsdWU7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogU2V0IHRoZSBEaXNwbGF5IG9mIGEgc3BlY2lmaWMgdmFsdWUgZW50cnlcbiAgICogU29tZXRpbWUgYSBkaXNwbGF5IGlucHV0IGlzIHVzZWQgdG8gY29tYmluZSBhbGwgdGhlIHZhbHVlcyBpbnRvIG9uZSwgaXQgYXBwZWFycyBpbiB0aGUgcmVhZG9ubHkgc3RhdGVcbiAgICogQHBhcmFtIGRhdGFLZXlcbiAgICovXG4gIHByb3RlY3RlZCBfdXBkYXRlQXNzZXREaXNwbGF5KGRhdGFLZXk6IG51bWJlcikge1xuICAgIGlmICh0aGlzLnVpLmFzc2V0ICYmIHRoaXMudWkuYXNzZXRbZGF0YUtleV0pIHtcbiAgICAgIGNvbnN0IGRpc3BsYXkgPSA8SW5wdXRDb25maWc+dGhpcy51aS5hc3NldFtkYXRhS2V5XS5kaXNwbGF5O1xuICAgICAgZGlzcGxheS52YWx1ZSA9IHRoaXMuX2dldEFzc2V0RGlzcGxheVN0cihkYXRhS2V5KTtcbiAgICAgIHRoaXMuZG9tLnNldFRpbWVvdXQoYGRpc3BsYXktdXBkYXRlLSR7ZGF0YUtleX1gLCAoKSA9PiB7XG4gICAgICAgIGRpc3BsYXkuY29udHJvbC52YWx1ZSA9IGRpc3BsYXkudmFsdWU7XG4gICAgICB9LCAwKTtcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBEZWJvdW5jZSByZXF1ZXN0cyBmb3Igc2V0IHBob25lIGRpc3BsYXlcbiAgICogQHBhcmFtIGRhdGFLZXlcbiAgICovXG4gIHByb3RlY3RlZCBfdHJpZ2dlclVwZGF0ZUFzc2V0RGlzcGxheShkYXRhS2V5OiBudW1iZXIpIHtcbiAgICB0aGlzLmRvbS5zZXRUaW1lb3V0KGBmaWVsZC1kaXNwbGF5LSR7ZGF0YUtleX1gLCAoKSA9PiB7XG4gICAgICB0aGlzLl91cGRhdGVBc3NldERpc3BsYXkoZGF0YUtleSk7XG4gICAgfSwgMTAwKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFNlc3Npb24gdGhlIGRpc3BsYXkgdmFsdWUgZm9yIGEgZmllbGQgaXRlbSBjaGFuZ2VcbiAgICogSW4gc29tZSBjYXNlcyB0aGUgdmFsdWUgdGhhdCBpcyBzZWxlY3RlZCBpcyBub3QgbmVjZXNzYXJpbHkgd2hhdCBzaG91bGQgYmUgcHJlc2VudGVkLCBzbyB3ZSB0cmFjayBpdCBzZXBhcmF0ZWx5IGp1c3QgaW4gY2FzZVxuICAgKiBJZSAuLi4gd2hlbiBhbiBpZCBpcyBzZWxlY3RlZCB3aGVuIG5lZWQgdG8gc2hvdyB0aGUgYXBwcm9wcmlhdGUgbGFiZWwgdGhhdCBzaG91bGQgZ28gd2l0aCBpdCBub3QgdGhlIGlkIGl0c2VsZlxuICAgKiBAcGFyYW0gZGF0YUtleVxuICAgKiBAcGFyYW0gZmllbGRcbiAgICogQHBhcmFtIHZhbHVlXG4gICAqL1xuICBwcm90ZWN0ZWQgX3VwZGF0ZURpc3BsYXlGaWVsZChkYXRhS2V5OiBudW1iZXIsIGZpZWxkOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpIHtcbiAgICBpZiAoSXNEZWZpbmVkKGRhdGFLZXkpICYmIElzT2JqZWN0KHRoaXMuZG9tLnNlc3Npb24pKSB7XG4gICAgICBpZiAoIUlzT2JqZWN0KHRoaXMuZG9tLnNlc3Npb25bZGF0YUtleV0pKSB0aGlzLmRvbS5zZXNzaW9uW2RhdGFLZXldID0ge307XG4gICAgICBpZiAoIUlzT2JqZWN0KHRoaXMuZG9tLnNlc3Npb25bZGF0YUtleV0uZGlzcGxheSkpIHRoaXMuZG9tLnNlc3Npb25bZGF0YUtleV0uZGlzcGxheSA9IHt9O1xuICAgICAgdGhpcy5kb20uc2Vzc2lvbltkYXRhS2V5XS5kaXNwbGF5W2ZpZWxkXSA9IHZhbHVlO1xuICAgICAgLy8gdGhpcy5kb20uc3RvcmUoJ3Nlc3Npb24nKTtcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGFjdHVhbCBkYXRhIG9iamVjdCBmb3IgYSBzcGVjaWZpYyBrZXlcbiAgICogUGFzcyBpbiBhIGZpZWxkIGtleSBpZiB5b3Ugd2FudCBhIG9ubHkgYSBjZXJ0YWluIGZpZWxkIHZhbHVlXG4gICAqIEBwYXJhbSBkYXRhS2V5XG4gICAqIEBwYXJhbSBmaWVsZEtleVxuICAgKi9cbiAgcHJvdGVjdGVkIF9nZXREYXRhS2V5KGRhdGFLZXk6IG51bWJlciwgZmllbGRLZXk/OiBzdHJpbmcpIHtcbiAgICBsZXQgZGF0YSA9IElzT2JqZWN0VGhyb3dFcnJvcih0aGlzLmZpZWxkLmRhdGEsIHRydWUsIGAke3RoaXMubmFtZX06Z2V0RGF0YUtleWApID8gdGhpcy5maWVsZC5kYXRhW2RhdGFLZXldIDogbnVsbDtcbiAgICBpZiAoZGF0YSAmJiBmaWVsZEtleSkge1xuICAgICAgZGF0YSA9IGZpZWxkS2V5IGluIGRhdGEgPyBkYXRhW2ZpZWxkS2V5XSA6IG51bGw7XG4gICAgfVxuICAgIHJldHVybiBkYXRhO1xuICB9XG5cblxuICAvKipcbiAgICogQnVpbGRzIHRoZSBkaXNwbGF5IHN0cmluZ1xuICAgKiBPdmVycmlkZSBpbiBlYWNoIGZpZWxkIGNvbXBvbmVudCBhcyBuZWNlc3NhcnlcbiAgICogQHBhcmFtIGRhdGFLZXlcbiAgICovXG4gIHByb3RlY3RlZCBfZ2V0QXNzZXREaXNwbGF5U3RyKGRhdGFLZXk6IG51bWJlcik6IHN0cmluZyB7XG4gICAgbGV0IHN0ciA9ICcnO1xuICAgIGNvbnN0IGNvbmZpZ3MgPSB0aGlzLl9nZXREYXRhS2V5SXRlbUNvbmZpZyhkYXRhS2V5KTtcbiAgICBPYmplY3Qua2V5cyhjb25maWdzKS5tYXAoKG5hbWUpID0+IHtcbiAgICAgIGNvbnN0IGNvbmZpZyA9IGNvbmZpZ3NbbmFtZV07XG4gICAgICBpZiAoY29uZmlnLmNvbnRyb2wgJiYgY29uZmlnLmNvbnRyb2wudmFsdWUpIHtcbiAgICAgICAgc3RyICs9ICgnICcgKyBjb25maWcuY29udHJvbC52YWx1ZSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIFN0cmluZyhzdHIpLnRyaW0oKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgd2lsbCBiZSBkaWZmZXJlbnQgZm9yIGVhY2ggdHlwZSBvZiBmaWVsZCBncm91cFxuICAgKiBJbnRlbmRlZCB0byBiZSBvdmVycmlkZGVuIGluIGVhY2ggY2xhc3MsIGdpdmVzIHRoZSBtdXRhdGUvdHJhbnNmb3JtIHJlc291cmNlcyBpZiBuZWVkZWRcbiAgICovXG4gIHByb3RlY3RlZCBfdHJhbnNmb3JtQ2hpbGRyZW4oKSB7XG5cbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgd2lsbCBiZSBkaWZmZXJlbnQgZm9yIGVhY2ggdHlwZSBvZiBmaWVsZCBncm91cFxuICAgKiBJbnRlbmRlZCB0byBiZSBvdmVycmlkZGVuIGluIGVhY2ggY2xhc3NcbiAgICovXG4gIHByb3RlY3RlZCBfc2V0RmllbGRBdHRyaWJ1dGVzKCk6IGJvb2xlYW4ge1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIHdpbGwgYmUgZGlmZmVyZW50IGZvciBlYWNoIHR5cGUgb2YgZmllbGQgZ3JvdXBcbiAgICogSW50ZW5kZWQgdG8gYmUgb3ZlcnJpZGRlbiBpbiBlYWNoIGNsYXNzXG4gICAqL1xuICBwcm90ZWN0ZWQgX3NldEZpZWxkSXRlbUF0dHJpYnV0ZShkYXRhS2V5OiBudW1iZXIsIGluZGV4OiBudW1iZXIpOiBib29sZWFuIHtcblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cblxuICAvKipcbiAgICogR2V0IHRoZSBpdGVtIGNvbmZpZ3MgZm9yIGEgb2YgYSBkYXRhS2V5XG4gICAqIFBhc3MgaW4gYSBmaWVsZEtleSBpZiB5b3Ugb25seSB3YW50IHRoZSBpdGVtIGNvbmZpZyBvZiBhIGNlcnRhaW4gZmllbGRcbiAgICogQHBhcmFtIGRhdGFLZXlcbiAgICogQHBhcmFtIGZpZWxkS2V5XG4gICAqL1xuICBwcm90ZWN0ZWQgX2dldERhdGFLZXlJdGVtQ29uZmlnKGRhdGFLZXk6IG51bWJlciwgZmllbGRLZXk/OiBzdHJpbmcpIHtcbiAgICBjb25zdCBkYXRhID0gSXNPYmplY3RUaHJvd0Vycm9yKHRoaXMuZmllbGQuaXRlbXNbZGF0YUtleV0sIHRydWUsIGAke3RoaXMubmFtZX06X2dldERhdGFLZXlJdGVtYCkgPyB0aGlzLmZpZWxkLml0ZW1zW2RhdGFLZXldIDogbnVsbDtcbiAgICBpZiAoZmllbGRLZXkpIHtcbiAgICAgIGNvbnN0IGNvbmZpZyA9IElzT2JqZWN0VGhyb3dFcnJvcihkYXRhLmNvbmZpZ1tmaWVsZEtleV0sIHRydWUsIGAke3RoaXMubmFtZX06X2dldERhdGFLZXlJdGVtOiR7ZmllbGRLZXl9YCkgPyBkYXRhLmNvbmZpZ1tmaWVsZEtleV0gOiBudWxsO1xuICAgICAgcmV0dXJuIGNvbmZpZztcbiAgICB9XG4gICAgcmV0dXJuIGRhdGEuY29uZmlnO1xuICB9XG5cblxuICAvKipcbiAgICogUmVzb2x2ZSBhIHZhbHVlIHRvIHRoZSBuYW1lIHRoYXQgZ29lcyB3aXRoIGl0IGZyb20gdGhlIG9wdGlvbiBsaXN0XG4gICAqIEBwYXJhbSB2YWx1ZVxuICAgKiBAcGFyYW0gaW5kZXhcbiAgICovXG4gIHByb3RlY3RlZCBfZ2V0VHlwZU9wdGlvbk5hbWUodmFsdWU6IHN0cmluZywgaW5kZXg6IG51bWJlcik6IHN0cmluZyB7XG4gICAgY29uc3QgdHlwZUNvbmZpZyA9IDxTZWxlY3RDb25maWc+dGhpcy5fZ2V0RGF0YUtleUl0ZW1Db25maWcodGhpcy5maWVsZC5kYXRhX2tleXNbaW5kZXhdLCAndHlwZScpO1xuICAgIGlmICh0eXBlQ29uZmlnLm9wdGlvbnMpIHtcbiAgICAgIGNvbnN0IG9wdGlvbnNNYXAgPSBBcnJheU1hcFNldHRlcih0eXBlQ29uZmlnLm9wdGlvbnMudmFsdWVzLCAndmFsdWUnKTtcbiAgICAgIGNvbnN0IG9wdGlvbiA9IHZhbHVlIGluIG9wdGlvbnNNYXAgPyB0eXBlQ29uZmlnLm9wdGlvbnMudmFsdWVzW29wdGlvbnNNYXBbdmFsdWVdXSA6IG51bGw7XG4gICAgICBpZiAob3B0aW9uKSB7XG4gICAgICAgIHJldHVybiBvcHRpb24ubmFtZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuICcnO1xuICB9XG5cblxuICAvKipcbiAgICogUmVzb2x2ZSBhIHZhbHVlIHRvIHRoZSBuYW1lIHRoYXQgZ29lcyB3aXRoIGl0IGZyb20gdGhlIG9wdGlvbiBsaXN0XG4gICAqIEBwYXJhbSB2YWx1ZVxuICAgKiBAcGFyYW0gaW5kZXhcbiAgICovXG4gIHByb3RlY3RlZCBfZ2V0RW50cnlPcHRpb25OYW1lKHZhbHVlOiBzdHJpbmcsIGluZGV4OiBudW1iZXIpOiBzdHJpbmcge1xuICAgIGNvbnN0IHRpdGxlQ29uZmlnID0gPFNlbGVjdENvbmZpZz50aGlzLl9nZXREYXRhS2V5SXRlbUNvbmZpZyh0aGlzLmZpZWxkLmRhdGFfa2V5c1tpbmRleF0sICd0aXRsZScpO1xuICAgIGlmICh0aXRsZUNvbmZpZy5vcHRpb25zKSB7XG4gICAgICBjb25zdCBvcHRpb25zTWFwID0gQXJyYXlNYXBTZXR0ZXIodGl0bGVDb25maWcub3B0aW9ucy52YWx1ZXMsICd2YWx1ZScpO1xuICAgICAgY29uc3Qgb3B0aW9uID0gdmFsdWUgaW4gb3B0aW9uc01hcCA/IHRpdGxlQ29uZmlnLm9wdGlvbnMudmFsdWVzW29wdGlvbnNNYXBbdmFsdWVdXSA6IG51bGw7XG4gICAgICBpZiAob3B0aW9uKSB7XG4gICAgICAgIHJldHVybiBvcHRpb24ubmFtZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuICcnO1xuICB9XG5cblxuICAvKipcbiAgICogR2V0IHRoZSB2YWx1ZSBlbnRyeSBvZiBhIHNwZWNpZmljIGluZGV4XG4gICAqIEBwYXJhbSBpbmRleFxuICAgKi9cbiAgcHJvdGVjdGVkIF9nZXRWYWx1ZUVudHJ5KGluZGV4OiBudW1iZXIpOiBGaWVsZEVudHJ5IHtcbiAgICBpZiAoSXNBcnJheSh0aGlzLmZpZWxkLmVudHJpZXMsIHRydWUpKSB7XG4gICAgICByZXR1cm4gSXNPYmplY3QodGhpcy5maWVsZC5lbnRyaWVzW2luZGV4XSwgdHJ1ZSkgPyB0aGlzLmZpZWxkLmVudHJpZXNbaW5kZXhdIDogdGhpcy5maWVsZC5lbnRyaWVzWzBdO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEhlbHBlciBtZXRob2QgdG8gdXBkYXRlIGEgc3RhdGUgdmFyaWFibGUsIGFuZCBtYWtlIHN1cmUgdGhhdCBhIHN0YXRlIG9iamVjdCBleGl0cyBmb3IgZWFjaCBkYXRhIGtleVxuICAgKiBAcGFyYW0gZGF0YUtleVxuICAgKiBAcGFyYW0gZmllbGRcbiAgICogQHBhcmFtIHZhbHVlXG4gICAqL1xuICBwcm90ZWN0ZWQgX3VwZGF0ZVN0YXRlKGRhdGFLZXk6IG51bWJlciwgZmllbGQ6IHN0cmluZywgdmFsdWU6IHN0cmluZyB8IGJvb2xlYW4gfCBudW1iZXIpIHtcbiAgICBpZiAoSXNEZWZpbmVkKGRhdGFLZXkpICYmIElzT2JqZWN0KHRoaXMuZG9tLnN0YXRlKSkge1xuICAgICAgaWYgKCFJc09iamVjdCh0aGlzLmRvbS5zdGF0ZVtkYXRhS2V5XSkpIHtcbiAgICAgICAgdGhpcy5kb20uc3RhdGVbZGF0YUtleV0gPSB7XG4gICAgICAgICAgb3BlbjogZmFsc2UsXG4gICAgICAgICAgdGVtcGxhdGU6IHRoaXMuZmllbGQuc3RhdGUsXG4gICAgICAgICAgZm9vdGVyX2FkanVzdDogdGhpcy5maWVsZC5zdGF0ZSxcbiAgICAgICAgICBjdXN0b21MYWJlbDogZmFsc2VcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHRoaXMuZG9tLnN0YXRlW2RhdGFLZXldW2ZpZWxkXSA9IHZhbHVlO1xuICAgIH1cbiAgfVxuXG59XG5cbiJdfQ==