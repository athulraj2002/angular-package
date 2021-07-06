import { __awaiter } from "tslib";
import { Component, ElementRef, Input } from '@angular/core';
import { PopFieldEditorService } from '../../pop-entity-field-editor.service';
import { PopDate, PopLog, PopRequest, ServiceInjector } from '../../../../../pop-common.model';
import { PopExtendComponent } from '../../../../../pop-extend.component';
import { PopDomService } from '../../../../../services/pop-dom.service';
import { MinMaxConfig } from '../../../../base/pop-field-item/pop-min-max/min-max.models';
import { ArrayMapSetter, DeepCopy, GetHttpErrorMsg, GetHttpObjectResult, IsArray, IsArrayThrowError, IsDefined, IsObject, IsObjectThrowError, IsString, IsUndefined, SnakeToPascal, StorageGetter, TitleCase } from '../../../../../pop-common-utility';
import { forkJoin } from 'rxjs';
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
import { moveItemInArray } from '@angular/cdk/drag-drop';
export class PopEntityFieldEntriesComponent extends PopExtendComponent {
    constructor(el, _domRepo, _fieldRepo, _tabRepo) {
        super();
        this.el = el;
        this._domRepo = _domRepo;
        this._fieldRepo = _fieldRepo;
        this._tabRepo = _tabRepo;
        this.scheme = null;
        this.name = 'PopEntityFieldEntriesComponent';
        this.srv = {
            action: ServiceInjector.get(PopEntityActionService),
            dialog: ServiceInjector.get(MatDialog),
            field: undefined,
            request: ServiceInjector.get(PopRequestService),
            tab: ServiceInjector.get(PopTabMenuService),
        };
        this.asset = {
            basePath: undefined,
            entries: [],
            entriesMap: {},
            schemeFieldStorage: undefined,
            type: undefined,
            typeOption: undefined,
        };
        this.ui = {
            label: undefined,
            minMax: undefined,
            editLabel: undefined,
            uniqueLabel: undefined,
            customLabel: undefined,
            entries: [],
            map: {},
            entryLimit: 4
        };
        this.extendServiceContainer();
        /**
         * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
         */
        this.dom.configure = () => {
            return new Promise((resolve) => {
                this.core = IsObjectThrowError(this.core, true, `${this.name}:configureDom: - this.core`) ? this.core : null;
                if (!this.field)
                    this.field = IsObjectThrowError(this.core, ['entity'], `Invalid Core`) && IsObjectThrowError(this.core.entity, ['id', 'fieldgroup'], `Invalid Field`) ? this.core.entity : null;
                this.asset.type = this.field.fieldgroup.name; // the field group name , ie.. address, phone
                this.asset.typeOption = this.srv.field.getDefaultLabelTypeOptions(); // the select options that belong to the types
                this.asset.basePath = `fields/${this.field.id}/entries`; // api endpoint to hit for field entries
                this._setCustomTraits();
                this.ui.entries = IsArrayThrowError(this.core.entity.entries, false, `Invalid Field Entries`) ? this.core.entity.entries : null;
                this.dom.session.controls = new Map(); // store the entry configs so that changes are not lost when the tabs are changed
                this._buildCustomSettings();
                return resolve(true);
            });
        };
        this.dom.proceed = () => {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                if (IsObject(this.scheme, true)) {
                    this.asset.schemeFieldStorage = this.srv.field.getSchemeFieldSetting(this.scheme, +this.field.id);
                    this.dom.state.hasScheme = IsObject(this.scheme, true) ? true : false;
                    const primary = this.srv.field.getSchemePrimary(this.scheme);
                    this.dom.state.isPrimary = this.field.fieldgroup.name in primary && +primary[this.field.fieldgroup.name] == this.field.id ? true : false;
                }
                else {
                    this.dom.state.hasScheme = false;
                    this.dom.state.isPrimary = false;
                }
                yield this._showEntries();
                return resolve(true);
            }));
        };
    }
    extendServiceContainer() {
        this.srv.field = this._fieldRepo;
        // delete this._fieldRepo;
    }
    /**
     * This component should have a specific purpose
     */
    ngOnInit() {
        super.ngOnInit();
    }
    /**
     * This allows the user to sort the list of options that this field uses
     * @param event
     */
    onOptionSortDrop(event) {
        moveItemInArray(this.ui.entries, event.previousIndex, event.currentIndex);
        this.dom.setTimeout(`update-sort-order`, () => __awaiter(this, void 0, void 0, function* () {
            const requests = [];
            this.ui.entries.map((entry, index) => {
                requests.push(PopRequest.doPatch(`${this.asset.basePath}/${entry.id}`, { sort_order: index, orphaned: -1 }, 1, false));
                const session = this.field.entries.find((e) => +e.id === +entry.id);
                if (IsObject(session, true)) {
                    session.sort_order = index;
                }
                entry.increment = index + 1;
            });
            if (requests.length) {
                this.srv.tab.showAsLoading(true);
                this.dom.setSubscriber(`update-sort-order`, forkJoin(requests).subscribe((res) => {
                    this.srv.field.triggerFieldPreviewUpdate();
                    this.srv.tab.showAsLoading(false);
                }, (err) => {
                    this.dom.setError(err, true);
                    this.srv.tab.showAsLoading(false);
                }));
            }
        }), 0);
        // this.triggerSaveFieldOptions( <PopBaseEventInterface>{ name: 'onChange' } );
    }
    /**
     * When the type of an entry is changed in the database, make sure the changes is updated locally
     * This is will  be removed since we don't want to do types
     * @param index
     * @param event
     */
    onEntryTypeChange(index, event) {
        if (IsValidFieldPatchEvent(this.core, event)) {
            const config = this.ui.entries[index];
            const entry = this.field.entries[index];
            const session = this.dom.session.controls.get(index);
            if (entry && session) {
                entry.type = config.type.control.value;
                this._updateEntryTypeSession(session.type, entry);
                this.dom.session.controls.set(index, session);
                this.setDomSession(index, session);
            }
            setTimeout(() => {
                this.srv.field.triggerFieldPreviewUpdate();
            }, 0);
        }
    }
    /**
     * When the display/label of an entry is changed in the database, make sure the changes is updated locally
     * @param index
     * @param event
     */
    onEntryDisplayChange(index, event) {
        if (index === 0)
            this.ui.label.control.setValue(event.config.control.value, { emitEvent: false });
        if (IsValidFieldPatchEvent(this.core, event)) {
            // PopTemplate.buffer();
            const entry = this.field.entries[index];
            const session = this.dom.session.controls.get(index);
            if (entry && session) {
                entry.name = event.config.control.value;
                this._updateEntryDisplaySession(session.display, entry);
                this.dom.session.controls.set(index, session);
                this.setDomSession(index, session);
            }
        }
        setTimeout(() => {
            this.srv.field.triggerFieldPreviewUpdate();
        }, 0);
    }
    /**
     * When the display/label of an entry is changed in the database, make sure the changes is updated locally
     * @param index
     * @param event
     */
    onEntryActiveChange(index, event) {
        if (IsObject(this.scheme, ['id'])) {
            // here
        }
        else {
            const entry = this.field.entries[index];
            if (entry) {
                if (event.config.control.value) {
                    entry.orphaned = false;
                    entry.orphaned_at = null;
                }
                else {
                    entry.orphaned = true;
                    entry.orphaned_at = PopDate.toIso(new Date());
                }
            }
            setTimeout(() => {
                this._handleMultipleEntries();
                this.srv.field.triggerFieldPreviewUpdate();
            }, 0);
            this.log.info(`onEntryActiveChange`, event);
        }
    }
    onEntryTraitChange(index, trait) {
        this.dom.setTimeout(`entry-trait-${index}`, () => __awaiter(this, void 0, void 0, function* () {
            this.ui.entries.map((entry, entryIndex) => {
                const entryTrait = entry.traits.find((t) => t.name === trait.name);
                if (IsObject(entryTrait, true)) {
                    if (+entryIndex !== +index) {
                        entryTrait.selected = false;
                    }
                    else {
                        entryTrait.selected = true;
                        if (IsObject(this.scheme, ['mapping'])) {
                            if (IsObject(this.asset.schemeFieldStorage, ['trait_entry'])) {
                                this.asset.schemeFieldStorage.trait_entry[entryTrait.name] = entry.id;
                            }
                        }
                    }
                }
            });
            yield this.srv.field.updateSchemeFieldMapping(this.scheme);
            this.log.info(`onEntryTraitChange`);
        }));
    }
    _handleMultipleEntries() {
        this.log.info(`_handleMultipleEntries`);
        this.dom.session.multipleActiveEntries = this._isMultipleActiveEntries();
        if (!(this.dom.session.multipleActiveEntries)) {
            this._disableActiveEntries();
        }
        else {
            this._enableActiveEntries();
        }
    }
    /**
     * A User will be able to add as many labels as they like
     */
    onAddEntryValue() {
        this.dom.setTimeout(`add-entry`, () => __awaiter(this, void 0, void 0, function* () {
            const action = {
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
                        prevent: this.ui.entries.map((entry) => {
                            return StorageGetter(entry, ['display', 'control', 'value'], 'Undefined');
                        })
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
            const res = yield this.srv.action.do(this.core, action);
            if (IsObject(res, ['name'])) {
                yield this._addEntry(res.name);
            }
        }), 0);
    }
    _addEntry(name) {
        return new Promise((resolve) => {
            this.srv.tab.showAsLoading(true);
            this.dom.state.pending = true;
            const sessionIndex = this.field.entries.filter((x) => x.type !== 'custom').length;
            const increment = sessionIndex + 1;
            const session = this.dom.session.controls.get(sessionIndex);
            if (!name) {
                name = session ? session.display.value : TitleCase(`${(this.field.name ? this.field.name : this.asset.type)} ${increment}`);
            }
            const entry = {
                name: name,
                type: this.asset.typeOption.defaultValue,
                orphaned_at: null,
                sort_order: sessionIndex
            };
            this._makeApiRequests([
                this.srv.request.doPost(`${this.asset.basePath}`, entry, 1, false),
                this.srv.request.doPatch(`fields/${this.field.id}`, { multiple_min: increment, multiple_max: increment }, 1, false),
            ]).then((res) => {
                this._setEntrySessionControls(this.field.entries.filter((x) => x.type !== 'custom')).then((entries) => {
                    this._setEntries(entries).then(() => {
                        this.dom.state.pending = false;
                        setTimeout(() => {
                            // For now I want the amount of field entries to dictate what min/max should be
                            this.field.multiple_min = increment;
                            this.field.multiple_max = increment;
                            this.ui.minMax.minConfig.max = this.field.entries.length;
                            this.ui.minMax.minConfig.min = this.field.entries.length;
                            this.ui.minMax.minConfig.control.setValue(this.field.entries.length);
                            this.ui.minMax.maxConfig.max = this.field.entries.length;
                            this.ui.minMax.maxConfig.min = this.field.entries.length;
                            this.ui.minMax.maxConfig.control.setValue(this.field.entries.length);
                            // this.ui.minMax.triggerOnChange();
                            this.srv.field.triggerFieldPreviewUpdate();
                            this.srv.tab.showAsLoading(false);
                            return resolve(true);
                        }, 0);
                    });
                });
            }, (err) => {
                this.dom.setError(err, true);
                this.srv.tab.showAsLoading(false);
                return resolve(false);
            });
        });
    }
    _collectNewEntryName() {
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
        const actionConfig = {
            header: 'Add New Field Entry',
            name: 'campaign',
            fields: Object.assign({}, fields),
            submitText: 'Submit',
            postUrl: null,
            blockEntity: true, // implies that fields should not be inherited from the original field.ts file
        };
        this.dom.setTimeout(`collect-name`, () => __awaiter(this, void 0, void 0, function* () {
            const setCampaign = yield this.srv.action.do(this.core, actionConfig);
            this.log.info('setCampaign', setCampaign);
            this.srv.tab.showAsLoading(false);
        }), 0);
    }
    /**
     * A User will be able to remove labels as they like
     */
    onRemoveEntryValue(entry) {
        if (entry && entry.id) {
            this.srv.dialog.open(PopConfirmationDialogComponent, {
                width: '500px',
                data: {
                    option: null,
                    body: `Deleting ${entry.display.control.value} will result in any collected values on this entry being permanently removed.<br><br>Do you wish to continue?`,
                    align: 'left'
                }
            }).afterClosed().subscribe(res => {
                if (res && res.confirmed) {
                    // PopTemplate.buffer();
                    this.dom.state.pending = true;
                    const decrement = this.field.entries.length - 1;
                    this.srv.request.doDelete(`${this.asset.basePath}/${entry.id}`);
                    this._makeApiRequests([
                        this.srv.request.doDelete(`${this.asset.basePath}/${entry.id}`),
                        this.srv.request.doPatch(`fields/${this.field.id}`, { multiple_min: decrement, multiple_max: decrement }, 1, false),
                    ]).then(() => {
                        this._setEntrySessionControls(this.field.entries.filter((x) => x.type !== 'custom')).then((entries) => {
                            this._setEntries(entries).then(() => {
                                this.dom.state.pending = false;
                                setTimeout(() => {
                                    // For now I want the amount of field entries to dictate what min/max should be
                                    this.field.multiple_min = decrement;
                                    this.field.multiple_max = decrement;
                                    this.ui.minMax.minConfig.max = this.field.entries.length;
                                    this.ui.minMax.minConfig.min = this.field.entries.length;
                                    this.ui.minMax.minConfig.control.setValue(this.field.entries.length);
                                    this.ui.minMax.maxConfig.max = this.field.entries.length;
                                    this.ui.minMax.maxConfig.min = this.field.entries.length;
                                    this.ui.minMax.maxConfig.control.setValue(this.field.entries.length);
                                    // Tmp Block ^
                                    this.srv.field.triggerFieldPreviewUpdate();
                                }, 0);
                            });
                        });
                    });
                }
            });
        }
    }
    onMinMaxSetting(event) {
        if (IsValidFieldPatchEvent(this.core, event)) {
            this.srv.field.triggerFieldPreviewUpdate();
        }
    }
    /**
     * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
     */
    ngOnDestroy() {
        super.ngOnDestroy();
    }
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    _setCustomTraits() {
        this.field.trait.map((trait) => {
            if (!trait.label)
                trait.label = TitleCase(SnakeToPascal(trait.name));
        });
    }
    /**
     * Build the configs for the set of custom settings that this component uses
     * @private
     */
    _buildCustomSettings() {
        this.ui.minMax = new MinMaxConfig({
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
                callback: (core, event) => {
                    const newValue = event.config.control.value;
                    Object.keys(newValue).map((key) => {
                        this.field[key] = newValue[key];
                    });
                }
            }
        });
        this.ui.label = new InputConfig(// Piggy back off of the first entry label
        {
            label: 'Label',
            value: this.field.entries[0].name,
            facade: false,
            maxlength: 24,
            patch: {
                field: `name`,
                path: `fields/${this.field.id}/entries/${this.field.entries[0].id}`,
                callback: (core, event) => {
                    this.onEntryDisplayChange(0, event);
                }
            }
        });
        // The edit label setting will determine if the end-user is able to change the the label
        const editLabelSetting = IsObject(this.field.custom_setting.edit_label, true) ? this.field.custom_setting.edit_label : null;
        if (editLabelSetting) {
            this.ui.editLabel = new SwitchConfig({
                name: 'edit_label',
                helpText: editLabelSetting.helpText,
                label: editLabelSetting.label,
                labelPosition: 'after',
                value: editLabelSetting.value,
                metadata: {
                    setting: editLabelSetting,
                },
                facade: true,
                patch: {
                    field: 'value',
                    path: ``,
                    callback: (core, event) => {
                        this.srv.field.storeCustomSetting(this.core, event).then((res) => {
                            if (IsString(res)) {
                                this.ui.editLabel.message = res;
                            }
                            else {
                                this.srv.field.triggerFieldPreviewUpdate();
                            }
                        });
                    }
                }
            });
        }
        // The custom label setting will allow the user to add their own custom label to fit their needs, should only show if edit label setting is true
        const customLabelSetting = IsObject(this.field.custom_setting.custom_label, true) ? this.field.custom_setting.custom_label : null;
        if (customLabelSetting) {
            this.ui.customLabel = new CheckboxConfig({
                name: 'custom_label',
                facade: true,
                helpText: customLabelSetting.helpText,
                label: customLabelSetting.label,
                labelPosition: 'after',
                value: customLabelSetting.value,
                metadata: {
                    setting: customLabelSetting,
                },
                patch: {
                    field: 'value',
                    path: ``,
                    callback: (core, event) => {
                        this.srv.field.storeCustomSetting(this.core, event).then((res) => {
                            if (IsString(res)) {
                                this.ui.customLabel.message = res;
                            }
                            else {
                                this._onCustomLabelChange(this.ui.customLabel.control.value).then(() => {
                                    this.srv.field.triggerFieldPreviewUpdate();
                                });
                            }
                        });
                    }
                }
            });
        }
        // The unique label setting will force all of the field values to use a unique label, should only show if edit label setting is true
        const uniqueLabelSetting = IsObject(this.field.custom_setting.unique_label, true) ? this.field.custom_setting.unique_label : null;
        if (uniqueLabelSetting) {
            this.ui.uniqueLabel = new CheckboxConfig({
                name: 'unique_label',
                facade: true,
                helpText: uniqueLabelSetting.helpText,
                label: uniqueLabelSetting.label,
                labelPosition: 'after',
                value: uniqueLabelSetting.value,
                metadata: {
                    setting: uniqueLabelSetting,
                },
                patch: {
                    field: 'value',
                    path: ``,
                    callback: (core, event) => {
                        this.srv.field.storeCustomSetting(this.core, event).then((res) => {
                            if (IsString(res)) {
                                this.ui.uniqueLabel.message = res;
                            }
                            else {
                                this.srv.field.triggerFieldPreviewUpdate();
                            }
                        });
                    }
                }
            });
        }
    }
    /**
     * A User will be able to add as many labels as they like
     */
    _onCustomLabelChange(value) {
        return new Promise((resolve) => {
            this.dom.state.pending = true;
            if (value) {
                let hasCustom = false;
                this.field.entries.map((item) => {
                    if (item.type == 'custom')
                        hasCustom = true;
                });
                if (!hasCustom) {
                    const entry = {
                        name: 'Custom',
                        type: 'custom'
                    };
                    this._makeApiRequests([this.srv.request.doPost(`${this.asset.basePath}`, entry, 1, false)]).then((res) => {
                        this._setEntrySessionControls(this.field.entries.filter((x) => x.type !== 'custom')).then((entries) => {
                            this._setEntries(entries).then(() => {
                                this.dom.state.pending = false;
                                setTimeout(() => {
                                    this.srv.field.triggerFieldPreviewUpdate();
                                    return resolve(true);
                                }, 0);
                            });
                        });
                    });
                }
                else {
                    setTimeout(() => {
                        this.dom.state.pending = false;
                        this.srv.field.triggerFieldPreviewUpdate();
                        return resolve(true);
                    }, 0);
                }
            }
            else {
                const requests = [];
                this.field.entries.filter((entry) => {
                    if (entry.type === 'custom') {
                        requests.push(this.srv.request.doDelete(`${this.asset.basePath}/${entry.id}`, null, 1, false));
                        return false;
                    }
                    else {
                        return true;
                    }
                });
                if (requests.length) {
                    this._makeApiRequests(requests).then((res) => {
                        this._setEntrySessionControls(this.field.entries.filter((x) => x.type !== 'custom')).then((entries) => {
                            this._setEntries(entries).then(() => {
                                this.dom.state.pending = false;
                                setTimeout(() => {
                                    this.srv.field.triggerFieldPreviewUpdate();
                                }, 0);
                            });
                        });
                    });
                }
                return resolve(true);
            }
        });
    }
    /**
     * Produce a list of the entry values for this field
     */
    _showEntries() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            this._setValueEntries().then((entries) => {
                this._setEntrySessionControls(entries).then((res) => {
                    this._setEntries(res).then(() => {
                        this.dom.state.pending = false;
                        return resolve(true);
                    });
                });
            });
        }));
    }
    /**
     * Ensure that the database records match the min/max settings
     * This will remove any excess records in the database that exceed the multiple_min
     * This will create records for an entries that are needed in the database
     * @param patch
     */
    _setValueEntries() {
        return new Promise((resolve) => {
            const provided = DeepCopy(this.field.entries).filter((entry) => {
                return entry.type !== 'custom';
            });
            const entries = [...provided];
            return resolve(entries);
        });
    }
    /**
     * Will make all of the needed api requests
     * @param requests
     * @private
     */
    _makeApiRequests(requests) {
        return new Promise((resolve) => {
            // PopTemplate.buffer();
            forkJoin(requests).subscribe(() => {
                this.srv.request.doGet(this.asset.basePath).subscribe((res) => {
                    res = res.data ? res.data : res;
                    this.field.entries = IsArray(res, true) ? res : [];
                    this.core.entity.entries = JSON.parse(JSON.stringify(this.field.entries));
                    resolve(res);
                });
            }, (err) => {
                PopLog.error(this.name, `_makeApiRequests`, GetHttpErrorMsg(err));
                resolve([]);
            });
        });
    }
    /**
     * Store a set of controls that can store values as the user changes the settings
     * @private
     */
    _setEntrySessionControls(entries) {
        return new Promise((resolve) => {
            let index = 0;
            entries.map((entry) => {
                if (entry.type !== 'custom') {
                    if (!(IsDefined(entry.orphaned)))
                        entry.orphaned = IsDefined(entry.orphaned_at, false);
                    const session = this.dom.session.controls.has(index) ? this.dom.session.controls.get(index) : {
                        id: entry ? entry.id : null,
                        type: this._getEntryTypeConfig(entry),
                        display: this._getEntryDisplayConfig(entry),
                        active: this._getEntryActiveConfig(entry),
                        increment: index + 1,
                    };
                    this._updateSessionControl(index, session, entry);
                    index++;
                }
            });
            return resolve(entries);
        });
    }
    /**
     * Update the entry config to use the stored record, and update the sessions for it
     * @param index
     * @param session
     * @param entry
     * @private
     */
    _updateSessionControl(index, session, entry = null) {
        session.increment = index + 1;
        session.id = entry ? entry.id : null;
        this._updateEntryTypeSession(session.type, entry);
        this._updateEntryDisplaySession(session.display, entry);
        this.dom.session.controls.set(index, session);
        this.setDomSession(index, session);
        return session;
    }
    /**
     * Update the entry type config to use correct value and path
     * @param config
     * @param entry
     * @private
     */
    _updateEntryTypeSession(config, entry = null) {
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
    _updateEntryDisplaySession(config, entry = null) {
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
    _updateEntryActiveSession(config, entry = null) {
    }
    /**
     * Store each entry config in a dom session so that it can be restored when the users is switching tabs
     * @param index
     * @param session
     */
    setDomSession(index, session) {
        const domStorage = StorageGetter(this.dom.repo, ['components', this.name, this.id + '', 'session']);
        if (IsObject(domStorage, ['controls'])) {
            const controls = domStorage.controls;
            controls.set(index, session);
        }
    }
    /**
     * Set entry config objects that will be used in the html template
     * @private
     */
    _setEntries(entries) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            this.ui.entries = [];
            this.asset.entries = IsArray(entries, true) ? entries.filter((e) => e.type !== 'custom') : [];
            this.asset.entriesMap = ArrayMapSetter(this.asset.entries, 'id');
            this.dom.state.hasMultipleEntries = this.asset.entries.length > 1;
            yield this._checkFieldEntryTraits();
            return resolve(true);
        }));
    }
    /**
     * Manage the type of each entry
     * @param ind
     * @private
     */
    _getEntryTypeConfig(entry) {
        let disabled = false;
        let options = this.asset.type in this.asset.typeOption ? this.asset.typeOption[this.asset.type].options : [];
        if (!IsArray(options, true)) {
            options = [{ value: 'n/a', name: 'N/A' }];
            disabled = true;
        }
        return new SelectConfig({
            label: 'Type',
            options: { values: options },
            disabled: disabled,
            patch: {
                field: 'type',
                path: entry && entry.id ? `${this.asset.basePath}/${entry.id}` : null,
            }
        });
    }
    /**
     * Manage the type of each entry
     * @param ind
     * @private
     */
    _getSessionEntryTraits(entry) {
        const traits = [];
        if (IsObject(this.scheme, ['id', 'mapping'])) {
            const traitEntryMapping = this.asset.schemeFieldStorage.trait_entry;
            const disabledEntries = this.asset.schemeFieldStorage.disabled_entries;
            if (IsObject(this.field, true) && IsArray(this.field.trait, true)) {
                this.field.trait.map((trait) => {
                    traits.push({
                        name: trait.name,
                        disabled: disabledEntries.includes(entry.id),
                        selected: +traitEntryMapping[trait.name] === entry.id
                    });
                });
            }
        }
        return traits;
    }
    _checkFieldEntryTraits() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            if (this.dom.state.isPrimary && IsArray(this.field.trait, true)) {
                let updateNeeded = false;
                const disabledEntries = this.asset.schemeFieldStorage.disabled_entries;
                const activeEntry = IsArray(this.asset.entries, true) ? this.asset.entries.find(entry => {
                    return !(disabledEntries.includes(entry.id)) && !entry.orphaned_at;
                }) : null;
                if (IsObject(activeEntry, ['id'])) {
                    const traitEntryMapping = this.asset.schemeFieldStorage.trait_entry;
                    this.field.trait.map((trait) => {
                        if (IsUndefined(traitEntryMapping[trait.name]) || !(traitEntryMapping[trait.name] in this.asset.entriesMap) || disabledEntries.includes(+traitEntryMapping[trait.name])) {
                            traitEntryMapping[trait.name] = activeEntry.id;
                            updateNeeded = true;
                        }
                    });
                    if (updateNeeded) {
                        yield this.srv.field.updateSchemeFieldMapping(this.scheme);
                    }
                }
                if (this.dom.session.controls) {
                    this.ui.entries = [];
                    // this.dom.setTimeout( `reset-entries`, () => {
                    this.asset.entries.map((entry, index) => {
                        const sessionEntry = this.dom.session.controls.get(index);
                        if (this.dom.state.isPrimary)
                            sessionEntry.traits = this._getSessionEntryTraits(entry);
                        if (!this.scheme || !entry.orphaned_at)
                            this.ui.entries.push(sessionEntry);
                    });
                    this._handleMultipleEntries();
                    return resolve(true);
                    // }, 0 );
                }
            }
            else {
                if (this.dom.session.controls) {
                    this.ui.entries = [];
                    this.asset.entries.map((entry, index) => {
                        const sessionEntry = this.dom.session.controls.get(index);
                        if (!this.scheme || !entry.orphaned_at)
                            this.ui.entries.push(sessionEntry);
                    });
                    this._handleMultipleEntries();
                }
                return resolve(true);
            }
        }));
    }
    /**
     * Manage the type of each entry
     * @param ind
     * @private
     */
    _getEntryActiveConfig(entry) {
        let value = !entry.orphaned;
        if (IsObject(this.scheme, true)) {
            if (this.asset.schemeFieldStorage.disabled_entries.includes(entry.id)) {
                value = false;
            }
        }
        return new SwitchConfig({
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
                callback: (core, event) => __awaiter(this, void 0, void 0, function* () {
                    this.srv.tab.showAsLoading(true);
                    if (IsObject(this.scheme, ['id'])) {
                        if (event.config.control.value) { // remove from disabled
                            this.asset.schemeFieldStorage.disabled_entries.splice(this.asset.schemeFieldStorage.disabled_entries.indexOf(+entry.id), 1);
                        }
                        else { // add to disabled
                            this.asset.schemeFieldStorage.disabled_entries.push(+entry.id);
                        }
                        console.log('here', entry.id, this.asset.schemeFieldStorage.disabled_entries);
                        yield this._checkFieldEntryTraits();
                        yield this.srv.field.updateSchemeFieldMapping(this.scheme);
                        this.srv.tab.showAsLoading(false);
                    }
                    else {
                        const orphaned = event.config.control.value ? null : true;
                        this.dom.setTimeout(`update-orphaned-at-${entry.id}`, PopRequest.doPatch(`${this.asset.basePath}/${entry.id}`, { orphaned: orphaned }, 1, false).subscribe((res) => {
                            res = GetHttpObjectResult(res);
                            this.log.info(`_getEntryActiveConfig`, res);
                            this.srv.tab.showAsLoading(false);
                        }, (err) => {
                            this.dom.setError(err, true);
                            this.srv.tab.showAsLoading(false);
                        }));
                    }
                })
            }
        });
    }
    /**
     * Manage the display of each entry
     * @param index
     * @private
     */
    _getEntryDisplayConfig(entry) {
        //     console.log( '_getEntryDisplayConfig', entry );
        return new InputConfig({
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
        });
    }
    _isMultipleActiveEntries() {
        let active = 0;
        this.ui.entries.map((entry) => {
            if (StorageGetter(entry, ['active', 'control', 'value'], false)) {
                active++;
            }
        });
        this.log.info(`_isMultipleActiveEntries`, active);
        return active > 1;
    }
    _disableActiveEntries() {
        this.log.info(`_disableActiveEntries`);
        this.ui.entries.map((entry) => {
            if (StorageGetter(entry, ['active', 'control', 'value'], false)) {
                entry.active.disabled = true;
                entry.active.control.disable();
            }
        });
    }
    _enableActiveEntries() {
        this.log.info(`_enableActiveEntries`);
        this.ui.entries.map((entry) => {
            if (StorageGetter(entry, ['active', 'control', 'value'], false)) {
                entry.active.disabled = false;
                entry.active.control.enable();
            }
        });
    }
}
PopEntityFieldEntriesComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-entity-field-entries',
                template: "<div class=\"entity-field-value-container\" *ngIf=\"dom.state.loaded\">\n  <div class=\"import-flex-row\">\n    <div class=\"import-flex-column import-flex-item-md\">\n      <!--<div class=\"import-flex-row import-field-border-btm import-flex-item-full\">-->\n      <!--&lt;!&ndash;<div class=\"entity-field-value-label import-flex-item-md import-flex-grow-md\">&ndash;&gt;-->\n      <!--&lt;!&ndash;Entries&ndash;&gt;-->\n      <!--&lt;!&ndash;</div>&ndash;&gt;-->\n      <!--<div class=\"import-flex-item-xs entity-field-value-icon import-flex-center\">-->\n      <!--<i class=\"material-icons sw-pointer sw-hover\"-->\n      <!--*ngIf=\"field.multiple\"-->\n      <!--matTooltip=\"Add\"-->\n      <!--[ngClass]=\"{'sw-disabled': dom.state.pending}\"-->\n      <!--(click)=\"onAddEntryValue();\">-->\n      <!--add-->\n      <!--</i>-->\n      <!--</div>-->\n      <!--</div>-->\n      <div class=\"entity-field-value-content\" *ngIf=\"!field.multiple && ui.entries[0]; let entry;\" [ngClass]=\"{'sw-disabled': dom.state.pending}\">\n        <div class=\"entity-field-value-row\" *ngIf=\"entry && entry.display\">\n          <!--<div class=\"import-flex-item-xs entity-field-value-icon import-flex-center\">-->\n          <!--<div>{{entry.increment}}.</div>-->\n          <!--</div>-->\n          <div class=\"import-flex-item-sm import-flex-grow-xs\">\n            <lib-pop-input class=\"import-flex-item-full\" [config]=\"entry.display\" (events)=\"onEntryDisplayChange(0, $event)\"></lib-pop-input>\n          </div>\n          <div class=\"import-flex-item-sm import-flex-grow-xs\" [style.maxWidth.px]=\"100\">\n            <!--<lib-pop-switch class=\"import-flex-item-full\" [config]=\"entry.active\" (events)=\"onEntryActiveChange(0, $event)\"></lib-pop-switch>-->\n          </div>\n        </div>\n      </div>\n      <div class=\"entity-field-value-content import-flex-item-md\" *ngIf=\"field.multiple\" [ngClass]=\"{'sw-disabled': dom.state.pending}\" cdkDropList (cdkDropListDropped)=\"onOptionSortDrop($event)\">\n\n        <div class=\"import-flex-row import-flex-item-full import-flex-space-between-center field-entries-section-label\">\n          <div class=\"import-flex-item-sm  import-flex-start-center\">\n            <label>Entries</label>\n          </div>\n          <div class=\"import-flex-item-sm import-flex-grow-xs\">\n          </div>\n          <div class=\"import-flex-item-sm import-flex-grow-xs import-flex-center\" [style.maxWidth.px]=\"75\">\n          </div>\n          <div class=\"import-flex-item-sm import-flex-grow-xs import-flex-center\" [style.maxWidth.px]=\"30\">\n            <i class=\"material-icons sw-pointer sw-hover\"\n               matTooltip=\"Add Field Entry\"\n               *ngIf=\"!dom.state.hasScheme\"\n               [ngClass]=\"{'sw-disabled': dom.state.pending}\"\n               (click)=\"onAddEntryValue();\">\n              add\n            </i>\n          </div>\n        </div>\n\n        <div class=\"field-entries-item\" *ngFor=\"let entry of ui.entries; let i = index; last as isLast\" cdkDrag cdkDragLockAxis=\"y\" cdkDragBoundary=\".entity-field-value-content\">\n          <div class=\"entity-field-value-row\" *ngIf=\"entry && entry.display\">\n            <div class=\"import-flex-item-xs entity-field-value-icon import-flex-center\" [ngClass]=\"{'sw-hidden': !dom.state.hasMultipleEntries}\" [style.maxWidth.px]=\"30\">\n              <div>{{entry.increment}}.</div>\n            </div>\n            <div class=\"field-entries-sort\" [ngClass]=\"{'sw-hidden': !dom.state.hasMultipleEntries || dom.state.hasScheme}\" [style.maxWidth.px]=\"50\">\n              <i class=\"material-icons\" cdkDragHandle>\n                drag_indicator\n              </i>\n            </div>\n            <div class=\"import-flex-item-sm import-flex-grow-xs\">\n              <lib-pop-input class=\"import-flex-item-full\" [config]=\"entry.display\" (events)=\"onEntryDisplayChange(i, $event)\"></lib-pop-input>\n            </div>\n            <div class=\"import-flex-item-sm import-flex-grow-xs import-flex-center\" [style.maxWidth.px]=\"75\">\n              <lib-pop-switch [ngClass]=\"{'sw-hidden': !dom.state.hasMultipleEntries}\" class=\"import-flex-item-full\" [config]=\"entry.active\" (events)=\"onEntryActiveChange(i, $event)\"></lib-pop-switch>\n            </div>\n            <div class=\"import-flex-item-sm import-flex-grow-xs import-flex-center\" [style.maxWidth.px]=\"30\">\n              <i class=\"material-icons  sw-pointer sw-hover\"\n                 [ngClass]=\"{'sw-hidden': !dom.state.hasMultipleEntries || dom.state.hasScheme}\"\n                 matTooltip=\"Remove\"\n                 (click)=\"onRemoveEntryValue(entry);\">\n                remove\n              </i>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n    <div class=\"entity-field-value-content import-flex-item-md\">\n      <div class=\"import-flex-row import-flex-item-md\">\n        <div class=\"import-flex-column\" *ngIf=\"dom.state.isPrimary\">\n          <div class=\"import-flex-row import-flex-item-full import-flex-space-around-center field-entries-section-label\">\n            <div class=\"import-flex-item-sm entity-field-trait\" *ngFor=\"let trait of field.trait\">\n              <label>{{trait.label}}</label>\n            </div>\n          </div>\n          <div class=\"entity-field-value-row import-flex-space-around-center field-entries-section-label\" *ngFor=\"let entry of ui.entries; let i = index; last as isLast\">\n            <div class=\"import-flex-item-sm entity-field-trait\" *ngFor=\"let trait of entry.traits;\">\n              <div class=\"entity-field-trait-radio\">\n                <mat-icon [ngClass]=\"{'sw-hidden': trait.selected,'sw-disabled': trait.disabled,'sw-pointer': !trait.disabled}\" (click)=\"onEntryTraitChange(i,trait)\">\n                  radio_button_unchecked\n                </mat-icon>\n                <mat-icon class=\"entity-field-trait-checked\" [ngClass]=\"{'sw-hidden': !trait.selected, 'sw-disabled': trait.disabled, 'sw-pointer': !trait.disabled}\" (click)=\"onEntryTraitChange(i,trait)\">\n                  radio_button_checked\n                </mat-icon>\n              </div>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n\n  </div>\n</div>\n\n\n<!--<div class=\"import-flex-row import-flex-item-full\" *ngIf=\"field.multiple && field.custom_setting.edit_label\">-->\n<!--<lib-pop-checkbox [config]=\"ui.editLabel\"></lib-pop-checkbox>-->\n<!--</div>-->\n\n<!--<div class=\"import-flex-row import-flex-item-full\" *ngIf=\"field.custom_setting.unique_label && field.setting.edit_label\">-->\n<!--<lib-pop-checkbox [config]=\"ui.customLabel\"></lib-pop-checkbox>-->\n<!--</div>-->\n",
                styles: [".import-flex-row,.import-flex-row-wrap{display:flex;flex-direction:row}.import-flex-row-wrap{flex-wrap:wrap;padding:0;flex-basis:100%;box-sizing:border-box}.import-flex-row-break{flex-basis:100%;height:0}.import-flex-column-break{flex-basis:100%;width:0}.import-flex-item-icon{min-width:var(--field-icon-width);height:var(--field-icon-height);display:flex;justify-content:center;align-items:center}.import-flex-column-xs{display:flex;flex-direction:column;width:12.5%;min-height:30px}.import-flex-column-sm{flex:1;flex-direction:column;width:25%;min-height:30px}.import-flex-column-md{flex:1;flex-direction:column;width:50%}.import-flex-column-lg{flex:1;flex-direction:column;width:75%;min-height:30px}.import-flex-item-xs{flex-basis:12.5%}.import-flex-item-sm{flex-basis:25%}.import-flex-item-md{flex-basis:50%}.import-flex-item-full{flex-basis:100%}.import-flex-grow-xs{flex-grow:1}.import-flex-grow-sm{flex-grow:2}.import-flex-grow-md{flex-grow:3}.import-flex-grow-lg{flex-grow:4}.import-flex-column{display:flex;flex-direction:column}.import-flex-center{display:flex;align-items:center;justify-content:center}.import-flex-space-center{justify-content:space-around;align-items:center}.import-flex-space-between-center{justify-content:space-between;align-items:center}.import-flex-center-start{display:flex;justify-content:center;align-items:flex-start}.import-flex-start-center{display:flex;justify-content:flex-start;align-items:center}.import-flex-end-center{display:flex;justify-content:flex-end;align-items:center}.import-flex-end{display:flex;align-items:flex-end;justify-content:flex-end}.import-flex-align-end{display:flex;align-self:flex-end}.import-flex-stretch-center{display:flex;justify-content:stretch;align-items:center}.sw-mar-xs{margin:var(--xs)}.sw-mar-sm{margin:var(--sm)}.sw-mar-md{margin:var(--md)}.sw-mar-lg{margin:var(--lg)}.sw-mar-xlg{margin:var(--xlg)}.sw-mar-hrz-xs{margin-left:var(--xs);margin-right:var(--xs)}.sw-mar-hrz-md,.sw-mar-hrz-sm{margin-left:var(--md);margin-right:var(--md)}.sw-mar-hrz-lg{margin-left:var(--lg);margin-right:var(--lg)}.sw-mar-hrz-xlg{margin-left:var(--xlg);margin-right:var(--xlg)}.sw-mar-vrt-xs{margin-top:var(--xs);margin-bottom:var(--xs)}.sw-mar-vrt-md,.sw-mar-vrt-sm{margin-top:var(--md);margin-bottom:var(--md)}.sw-mar-vrt-lg{margin-top:var(--lg);margin-bottom:var(--lg)}.sw-mar-vrt-xlg{margin-top:var(--xlg);margin-bottom:var(--xlg)}.sw-mar-lft-xs{margin-left:var(--xs)}.sw-mar-lft-sm{margin-left:var(--sm)}.sw-mar-lft-md{margin-left:var(--md)}.sw-mar-lft-lg{margin-left:var(--lg)}.sw-mar-lft-xlg{margin-left:var(--xlg)}.sw-mar-rgt-xs{margin-right:var(--xs)}.sw-mar-rgt-sm{margin-right:var(--sm)}.sw-mar-rgt-md{margin-right:var(--md)}.sw-mar-rgt-lg{margin-right:var(--lg)}.sw-mar-rgt-xlg{margin-right:var(--xlg)}.sw-mar-btm-xs{margin-bottom:var(--xs)}.sw-mar-btm-sm{margin-bottom:var(--sm)}.sw-mar-btm-md{margin-bottom:var(--md)}.sw-mar-btm-lg{margin-bottom:var(--lg)}.sw-mar-btm-xlg{margin-bottom:var(--xlg)}.sw-mar-top-xs{margin-top:var(--xs)}.sw-mar-top-sm{margin-top:var(--sm)}.sw-mar-top-md{margin-top:var(--md)}.sw-mar-top-lg{margin-top:var(--lg)}.sw-mar-top-xlg{margin-top:var(--xlg)}.sw-pad-xs{padding:var(--xs)}.sw-pad-md,.sw-pad-sm{padding:var(--md)}.sw-pad-lg{padding:var(--lg)}.sw-pad-xlg{padding:var(--xlg)}.sw-pad-hrz-xs{padding-left:var(--xs);padding-right:var(--xs)}.sw-pad-hrz-sm{padding-left:var(--sm);padding-right:var(--sm)}.sw-pad-hrz-md{padding-left:var(--md);padding-right:var(--md)}.sw-pad-hrz-lg{padding-left:var(--lg);padding-right:var(--lg)}.sw-pad-hrz-xlg{padding-left:var(--xlg);padding-right:var(--xlg)}.sw-pad-vrt-xs{padding-top:var(--xs);padding-bottom:var(--xs)}.sw-pad-vrt-md,.sw-pad-vrt-sm{padding-top:var(--md);padding-bottom:var(--md)}.sw-pad-vrt-lg{padding-top:var(--lg);padding-bottom:var(--lg)}.sw-pad-vrt-xlg{padding-top:var(--xlg);padding-bottom:var(--xlg)}.sw-pad-lft-xs{padding-left:var(--xs)}.sw-pad-lft-sm{padding-left:var(--sm)}.sw-pad-lft-md{padding-left:var(--md)}.sw-pad-lft-lg{padding-left:var(--lg)}.sw-pad-lft-xlg{padding-left:var(--xlg)}.sw-pad-rgt-xs{padding-right:var(--xs)}.sw-pad-rgt-sm{padding-right:var(--sm)}.sw-pad-rgt-md{padding-right:var(--md)}.sw-pad-rgt-lg{padding-right:var(--lg)}.sw-pad-rgt-xlg{padding-right:var(--xlg)}.sw-pad-btm-xs{padding-bottom:var(--xs)}.sw-pad-btm-sm{padding-bottom:var(--sm)}.sw-pad-btm-md{padding-bottom:var(--md)}.sw-pad-btm-lg{padding-bottom:var(--lg)}.sw-pad-btm-xlg{padding-bottom:var(--xlg)}.sw-pad-top-xs{padding-top:var(--xs)}.sw-pad-top-sm{padding-top:var(--sm)}.sw-pad-top-md{padding-top:var(--md)}.sw-pad-top-lg{padding-top:var(--lg)}.sw-pad-top-xlg{padding-top:var(--xlg)}.import-field-border{border:1px solid var(--border)}.import-field-border-top{border-top:1px solid var(--border)}.import-field-border-rgt{border-right:1px solid var(--border)}.import-field-border-btm{border-bottom:1px solid var(--border)}.import-field-border-lft{border-left:1px solid var(--border)}.import-field-border-trans-top{border-top:1px solid transparent}.import-field-border-trans-rgt{border-right:1px solid transparent}.import-field-border-trans-btm{border-bottom:1px solid transparent}.import-field-border-trans-lft{border-left:1px solid transparent}.import-field-border-top-clr{border-top:0!important}.import-field-border-rgt-clr{border-right:0!important}.import-field-border-btm-clr{border-bottom:0!important}.import-field-border-lft-clr{border-left:0!important}:host{width:100%}.entity-field-value-container,.entity-field-value-content{display:flex;flex-direction:column;margin-bottom:5px}.entity-field-value-content{width:100%;position:relative;box-sizing:border-box;min-height:30px;padding-top:var(--gap-s);padding-bottom:var(--gap-s)}.entity-field-value-icon{display:flex;align-items:center;justify-content:center;height:35px;width:35px;font-size:.9em;padding-top:0}.entity-field-value-icon i{font-size:1.3em}.entity-field-value-row{display:flex;flex-direction:row;align-items:center;height:50px;margin-top:1px}.field-entries-section-label{min-height:30px}.entity-field-value-label{text-align:center}.entity-field-value-label,.field-entries-sort{display:flex;justify-content:center;align-items:center}.field-entries-sort{width:10%;cursor:move}.entity-field-trait{display:flex;justify-content:center;align-items:center;min-width:130px;text-align:center;min-height:25px}:host ::ng-deep .entity-field-trait-checked.mat-icon{color:var(--background-focused-button)!important}:host ::ng-deep .entity-field-value-row .import-field-item-container{margin:0!important}:host ::ng-deep .cdk-drag-preview .import-field-item-container{margin:0!important}"]
            },] }
];
PopEntityFieldEntriesComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: PopDomService },
    { type: PopFieldEditorService },
    { type: PopTabMenuService }
];
PopEntityFieldEntriesComponent.propDecorators = {
    field: [{ type: Input }],
    scheme: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS1maWVsZC1lbnRyaWVzLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2VudGl0eS9wb3AtZW50aXR5LWZpZWxkLWVkaXRvci9wb3AtZW50aXR5LWZpZWxkLXNldHRpbmdzL3BvcC1lbnRpdHktZmllbGQtZW50cmllcy9wb3AtZW50aXR5LWZpZWxkLWVudHJpZXMuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQXFCLE1BQU0sZUFBZSxDQUFDO0FBQ2hGLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBQzlFLE9BQU8sRUFNa0IsT0FBTyxFQUM5QixNQUFNLEVBQUUsVUFBVSxFQUNsQixlQUFlLEVBQ2hCLE1BQU0saUNBQWlDLENBQUM7QUFDekMsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFDekUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBQ3hFLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSw0REFBNEQsQ0FBQztBQUMxRixPQUFPLEVBQ0wsY0FBYyxFQUNkLFFBQVEsRUFDUixlQUFlLEVBQUUsbUJBQW1CLEVBQ3BDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxTQUFTLEVBQ3JDLFFBQVEsRUFDUixrQkFBa0IsRUFDbEIsUUFBUSxFQUFFLFdBQVcsRUFBRSxhQUFhLEVBQ3BDLGFBQWEsRUFDYixTQUFTLEVBQ1YsTUFBTSxtQ0FBbUMsQ0FBQztBQUMzQyxPQUFPLEVBQUUsUUFBUSxFQUFjLE1BQU0sTUFBTSxDQUFDO0FBQzVDLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxnRUFBZ0UsQ0FBQztBQUM5RixPQUFPLEVBQUUsV0FBVyxF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cUI7WUFtQ3JCLGlCQUFpQjs7O29CQVd2QixLQUFLO3FCQUNMLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEVsZW1lbnRSZWYsIElucHV0LCBPbkRlc3Ryb3ksIE9uSW5pdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgUG9wRmllbGRFZGl0b3JTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vcG9wLWVudGl0eS1maWVsZC1lZGl0b3Iuc2VydmljZSc7XG5pbXBvcnQge1xuICBDb3JlQ29uZmlnLFxuICBEaWN0aW9uYXJ5LCBFbnRpdHlBY3Rpb25JbnRlcmZhY2UsIEZpZWxkQ3VzdG9tU2V0dGluZ0ludGVyZmFjZSxcbiAgRmllbGRFbnRyeSxcbiAgRmllbGRJbnRlcmZhY2UsXG4gIEZpZWxkSXRlbU9wdGlvbiwgS2V5TWFwLFxuICBQb3BCYXNlRXZlbnRJbnRlcmZhY2UsIFBvcERhdGUsXG4gIFBvcExvZywgUG9wUmVxdWVzdCxcbiAgU2VydmljZUluamVjdG9yXG59IGZyb20gJy4uLy4uLy4uLy4uLy4uL3BvcC1jb21tb24ubW9kZWwnO1xuaW1wb3J0IHsgUG9wRXh0ZW5kQ29tcG9uZW50IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vcG9wLWV4dGVuZC5jb21wb25lbnQnO1xuaW1wb3J0IHsgUG9wRG9tU2VydmljZSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3NlcnZpY2VzL3BvcC1kb20uc2VydmljZSc7XG5pbXBvcnQgeyBNaW5NYXhDb25maWcgfSBmcm9tICcuLi8uLi8uLi8uLi9iYXNlL3BvcC1maWVsZC1pdGVtL3BvcC1taW4tbWF4L21pbi1tYXgubW9kZWxzJztcbmltcG9ydCB7XG4gIEFycmF5TWFwU2V0dGVyLFxuICBEZWVwQ29weSxcbiAgR2V0SHR0cEVycm9yTXNnLCBHZXRIdHRwT2JqZWN0UmVzdWx0LFxuICBJc0FycmF5LCBJc0FycmF5VGhyb3dFcnJvciwgSXNEZWZpbmVkLFxuICBJc09iamVjdCxcbiAgSXNPYmplY3RUaHJvd0Vycm9yLFxuICBJc1N0cmluZywgSXNVbmRlZmluZWQsIFNuYWtlVG9QYXNjYWwsXG4gIFN0b3JhZ2VHZXR0ZXIsXG4gIFRpdGxlQ2FzZVxufSBmcm9tICcuLi8uLi8uLi8uLi8uLi9wb3AtY29tbW9uLXV0aWxpdHknO1xuaW1wb3J0IHsgZm9ya0pvaW4sIE9ic2VydmFibGUgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IFNlbGVjdENvbmZpZyB9IGZyb20gJy4uLy4uLy4uLy4uL2Jhc2UvcG9wLWZpZWxkLWl0ZW0vcG9wLXNlbGVjdC9zZWxlY3QtY29uZmlnLm1vZGVsJztcbmltcG9ydCB7IElucHV0Q29uZmlnIH0gZnJvbSAnLi4vLi4vLi4vLi4vYmFzZS9wb3AtZmllbGQtaXRlbS9wb3AtaW5wdXQvaW5wdXQtY29uZmlnLm1vZGVsJztcbmltcG9ydCB7IFBvcFJlcXVlc3RTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vc2VydmljZXMvcG9wLXJlcXVlc3Quc2VydmljZSc7XG5pbXBvcnQgeyBDaGVja2JveENvbmZpZyB9IGZyb20gJy4uLy4uLy4uLy4uL2Jhc2UvcG9wLWZpZWxkLWl0ZW0vcG9wLWNoZWNrYm94L2NoZWNrYm94LWNvbmZpZy5tb2RlbCc7XG5pbXBvcnQgeyBTd2l0Y2hDb25maWcgfSBmcm9tICcuLi8uLi8uLi8uLi9iYXNlL3BvcC1maWVsZC1pdGVtL3BvcC1zd2l0Y2gvc3dpdGNoLWNvbmZpZy5tb2RlbCc7XG5pbXBvcnQgeyBJc1ZhbGlkRmllbGRQYXRjaEV2ZW50IH0gZnJvbSAnLi4vLi4vLi4vcG9wLWVudGl0eS11dGlsaXR5JztcbmltcG9ydCB7IFBvcENvbmZpcm1hdGlvbkRpYWxvZ0NvbXBvbmVudCB9IGZyb20gJy4uLy4uLy4uLy4uL2Jhc2UvcG9wLWRpYWxvZ3MvcG9wLWNvbmZpcm1hdGlvbi1kaWFsb2cvcG9wLWNvbmZpcm1hdGlvbi1kaWFsb2cuY29tcG9uZW50JztcbmltcG9ydCB7IE1hdERpYWxvZyB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2RpYWxvZyc7XG5pbXBvcnQgeyBQb3BFbnRpdHlBY3Rpb25TZXJ2aWNlIH0gZnJvbSAnLi4vLi4vLi4vc2VydmljZXMvcG9wLWVudGl0eS1hY3Rpb24uc2VydmljZSc7XG5pbXBvcnQgeyBQb3BUYWJNZW51U2VydmljZSB9IGZyb20gJy4uLy4uLy4uLy4uL2Jhc2UvcG9wLXRhYi1tZW51L3BvcC10YWItbWVudS5zZXJ2aWNlJztcbmltcG9ydCB7IENka0RyYWdEcm9wLCBtb3ZlSXRlbUluQXJyYXkgfSBmcm9tICdAYW5ndWxhci9jZGsvZHJhZy1kcm9wJztcbmltcG9ydCB7IEVudGl0eVNjaGVtZVNlY3Rpb25JbnRlcmZhY2UgfSBmcm9tICcuLi8uLi8uLi9wb3AtZW50aXR5LXNjaGVtZS9wb3AtZW50aXR5LXNjaGVtZS5tb2RlbCc7XG5cblxuQENvbXBvbmVudCgge1xuICBzZWxlY3RvcjogJ2xpYi1wb3AtZW50aXR5LWZpZWxkLWVudHJpZXMnLFxuICB0ZW1wbGF0ZVVybDogJy4vcG9wLWVudGl0eS1maWVsZC1lbnRyaWVzLmNvbXBvbmVudC5odG1sJyxcbiAgc3R5bGVVcmxzOiBbICcuL3BvcC1lbnRpdHktZmllbGQtZW50cmllcy5jb21wb25lbnQuc2NzcycgXVxufSApXG5leHBvcnQgY2xhc3MgUG9wRW50aXR5RmllbGRFbnRyaWVzQ29tcG9uZW50IGV4dGVuZHMgUG9wRXh0ZW5kQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xuICBASW5wdXQoKSBmaWVsZDogRmllbGRJbnRlcmZhY2U7XG4gIEBJbnB1dCgpIHNjaGVtZTogRW50aXR5U2NoZW1lU2VjdGlvbkludGVyZmFjZSA9IG51bGw7XG4gIHB1YmxpYyBuYW1lID0gJ1BvcEVudGl0eUZpZWxkRW50cmllc0NvbXBvbmVudCc7XG5cbiAgcHJvdGVjdGVkIHNydiA9IHtcbiAgICBhY3Rpb246IDxQb3BFbnRpdHlBY3Rpb25TZXJ2aWNlPlNlcnZpY2VJbmplY3Rvci5nZXQoIFBvcEVudGl0eUFjdGlvblNlcnZpY2UgKSxcbiAgICBkaWFsb2c6IDxNYXREaWFsb2c+U2VydmljZUluamVjdG9yLmdldCggTWF0RGlhbG9nICksXG4gICAgZmllbGQ6IDxQb3BGaWVsZEVkaXRvclNlcnZpY2U+dW5kZWZpbmVkLFxuICAgIHJlcXVlc3Q6IDxQb3BSZXF1ZXN0U2VydmljZT5TZXJ2aWNlSW5qZWN0b3IuZ2V0KCBQb3BSZXF1ZXN0U2VydmljZSApLFxuICAgIHRhYjogPFBvcFRhYk1lbnVTZXJ2aWNlPlNlcnZpY2VJbmplY3Rvci5nZXQoIFBvcFRhYk1lbnVTZXJ2aWNlICksXG4gIH07XG5cbiAgcHJvdGVjdGVkIGFzc2V0ID0ge1xuICAgIGJhc2VQYXRoOiA8c3RyaW5nPnVuZGVmaW5lZCxcbiAgICBlbnRyaWVzOiA8RmllbGRFbnRyeVtdPltdLFxuICAgIGVudHJpZXNNYXA6IDxLZXlNYXA8bnVtYmVyPj57fSxcbiAgICBzY2hlbWVGaWVsZFN0b3JhZ2U6IDxhbnk+dW5kZWZpbmVkLFxuICAgIHR5cGU6IDxzdHJpbmc+dW5kZWZpbmVkLFxuICAgIHR5cGVPcHRpb246IDxEaWN0aW9uYXJ5PHsgZGVmYXVsdFZhbHVlOiBzdHJpbmcgfCBudW1iZXIsIG9wdGlvbnM6IEZpZWxkSXRlbU9wdGlvbltdIH0+PnVuZGVmaW5lZCxcbiAgfTtcblxuICBwdWJsaWMgdWkgPSB7XG4gICAgbGFiZWw6IDxJbnB1dENvbmZpZz51bmRlZmluZWQsXG4gICAgbWluTWF4OiA8TWluTWF4Q29uZmlnPnVuZGVmaW5lZCxcbiAgICBlZGl0TGFiZWw6IDxTd2l0Y2hDb25maWc+dW5kZWZpbmVkLFxuICAgIHVuaXF1ZUxhYmVsOiA8Q2hlY2tib3hDb25maWc+dW5kZWZpbmVkLFxuICAgIGN1c3RvbUxhYmVsOiA8Q2hlY2tib3hDb25maWc+dW5kZWZpbmVkLFxuICAgIGVudHJpZXM6IDxGaWVsZEVudHJ5U2Vzc2lvbltdPltdLFxuICAgIG1hcDogPCBEaWN0aW9uYXJ5PGFueT4+e30sXG4gICAgZW50cnlMaW1pdDogNFxuICB9O1xuXG5cbiAgcHJvdGVjdGVkIGV4dGVuZFNlcnZpY2VDb250YWluZXIoKXtcbiAgICB0aGlzLnNydi5maWVsZCA9IHRoaXMuX2ZpZWxkUmVwbztcbiAgICAvLyBkZWxldGUgdGhpcy5fZmllbGRSZXBvO1xuICB9XG5cblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgZWw6IEVsZW1lbnRSZWYsXG4gICAgcHJvdGVjdGVkIF9kb21SZXBvOiBQb3BEb21TZXJ2aWNlLFxuICAgIHByb3RlY3RlZCBfZmllbGRSZXBvOiBQb3BGaWVsZEVkaXRvclNlcnZpY2UsXG4gICAgcHJvdGVjdGVkIF90YWJSZXBvOiBQb3BUYWJNZW51U2VydmljZVxuICApe1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLmV4dGVuZFNlcnZpY2VDb250YWluZXIoKTtcbiAgICAvKipcbiAgICAgKiBUaGlzIHNob3VsZCB0cmFuc2Zvcm0gYW5kIHZhbGlkYXRlIHRoZSBkYXRhLiBUaGUgdmlldyBzaG91bGQgdHJ5IHRvIG9ubHkgdXNlIGRhdGEgdGhhdCBpcyBzdG9yZWQgb24gdWkgc28gdGhhdCBpdCBpcyBub3QgZGVwZW5kZW50IG9uIHRoZSBzdHJ1Y3R1cmUgb2YgZGF0YSB0aGF0IGNvbWVzIGZyb20gb3RoZXIgc291cmNlcy4gVGhlIHVpIHNob3VsZCBiZSB0aGUgc291cmNlIG9mIHRydXRoIGhlcmUuXG4gICAgICovXG4gICAgdGhpcy5kb20uY29uZmlndXJlID0gKCk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCAoIHJlc29sdmUgKSA9PiB7XG4gICAgICAgIHRoaXMuY29yZSA9IElzT2JqZWN0VGhyb3dFcnJvciggdGhpcy5jb3JlLCB0cnVlLCBgJHt0aGlzLm5hbWV9OmNvbmZpZ3VyZURvbTogLSB0aGlzLmNvcmVgICkgPyB0aGlzLmNvcmUgOiBudWxsO1xuICAgICAgICBpZiggIXRoaXMuZmllbGQgKSB0aGlzLmZpZWxkID0gSXNPYmplY3RUaHJvd0Vycm9yKCB0aGlzLmNvcmUsIFsgJ2VudGl0eScgXSwgYEludmFsaWQgQ29yZWAgKSAmJiBJc09iamVjdFRocm93RXJyb3IoIHRoaXMuY29yZS5lbnRpdHksIFsgJ2lkJywgJ2ZpZWxkZ3JvdXAnIF0sIGBJbnZhbGlkIEZpZWxkYCApID8gPEZpZWxkSW50ZXJmYWNlPnRoaXMuY29yZS5lbnRpdHkgOiBudWxsO1xuICAgICAgICB0aGlzLmFzc2V0LnR5cGUgPSB0aGlzLmZpZWxkLmZpZWxkZ3JvdXAubmFtZTsgLy8gdGhlIGZpZWxkIGdyb3VwIG5hbWUgLCBpZS4uIGFkZHJlc3MsIHBob25lXG4gICAgICAgIHRoaXMuYXNzZXQudHlwZU9wdGlvbiA9IHRoaXMuc3J2LmZpZWxkLmdldERlZmF1bHRMYWJlbFR5cGVPcHRpb25zKCk7IC8vIHRoZSBzZWxlY3Qgb3B0aW9ucyB0aGF0IGJlbG9uZyB0byB0aGUgdHlwZXNcbiAgICAgICAgdGhpcy5hc3NldC5iYXNlUGF0aCA9IGBmaWVsZHMvJHt0aGlzLmZpZWxkLmlkfS9lbnRyaWVzYDsgLy8gYXBpIGVuZHBvaW50IHRvIGhpdCBmb3IgZmllbGQgZW50cmllc1xuXG4gICAgICAgIHRoaXMuX3NldEN1c3RvbVRyYWl0cygpO1xuXG4gICAgICAgIHRoaXMudWkuZW50cmllcyA9IElzQXJyYXlUaHJvd0Vycm9yKCB0aGlzLmNvcmUuZW50aXR5LmVudHJpZXMsIGZhbHNlLCBgSW52YWxpZCBGaWVsZCBFbnRyaWVzYCApID8gdGhpcy5jb3JlLmVudGl0eS5lbnRyaWVzIDogbnVsbDtcblxuXG4gICAgICAgIHRoaXMuZG9tLnNlc3Npb24uY29udHJvbHMgPSBuZXcgTWFwKCk7IC8vIHN0b3JlIHRoZSBlbnRyeSBjb25maWdzIHNvIHRoYXQgY2hhbmdlcyBhcmUgbm90IGxvc3Qgd2hlbiB0aGUgdGFicyBhcmUgY2hhbmdlZFxuXG4gICAgICAgIHRoaXMuX2J1aWxkQ3VzdG9tU2V0dGluZ3MoKTtcblxuXG4gICAgICAgIHJldHVybiByZXNvbHZlKCB0cnVlICk7XG4gICAgICB9ICk7XG4gICAgfTtcblxuICAgIHRoaXMuZG9tLnByb2NlZWQgPSAoKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoIGFzeW5jKCByZXNvbHZlICkgPT4ge1xuXG4gICAgICAgIGlmKCBJc09iamVjdCggdGhpcy5zY2hlbWUsIHRydWUgKSApe1xuICAgICAgICAgIHRoaXMuYXNzZXQuc2NoZW1lRmllbGRTdG9yYWdlID0gdGhpcy5zcnYuZmllbGQuZ2V0U2NoZW1lRmllbGRTZXR0aW5nKCB0aGlzLnNjaGVtZSwgK3RoaXMuZmllbGQuaWQgKTtcbiAgICAgICAgICB0aGlzLmRvbS5zdGF0ZS5oYXNTY2hlbWUgPSBJc09iamVjdCggdGhpcy5zY2hlbWUsIHRydWUgKSA/IHRydWUgOiBmYWxzZTtcbiAgICAgICAgICBjb25zdCBwcmltYXJ5ID0gdGhpcy5zcnYuZmllbGQuZ2V0U2NoZW1lUHJpbWFyeSggdGhpcy5zY2hlbWUgKTtcblxuICAgICAgICAgIHRoaXMuZG9tLnN0YXRlLmlzUHJpbWFyeSA9IHRoaXMuZmllbGQuZmllbGRncm91cC5uYW1lIGluIHByaW1hcnkgJiYgK3ByaW1hcnlbIHRoaXMuZmllbGQuZmllbGRncm91cC5uYW1lIF0gPT0gdGhpcy5maWVsZC5pZCA/IHRydWUgOiBmYWxzZTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgdGhpcy5kb20uc3RhdGUuaGFzU2NoZW1lID0gZmFsc2U7XG4gICAgICAgICAgdGhpcy5kb20uc3RhdGUuaXNQcmltYXJ5ID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgYXdhaXQgdGhpcy5fc2hvd0VudHJpZXMoKTtcblxuICAgICAgICByZXR1cm4gcmVzb2x2ZSggdHJ1ZSApO1xuICAgICAgfSApO1xuICAgIH07XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIGNvbXBvbmVudCBzaG91bGQgaGF2ZSBhIHNwZWNpZmljIHB1cnBvc2VcbiAgICovXG4gIG5nT25Jbml0KCl7XG4gICAgc3VwZXIubmdPbkluaXQoKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgYWxsb3dzIHRoZSB1c2VyIHRvIHNvcnQgdGhlIGxpc3Qgb2Ygb3B0aW9ucyB0aGF0IHRoaXMgZmllbGQgdXNlc1xuICAgKiBAcGFyYW0gZXZlbnRcbiAgICovXG4gIG9uT3B0aW9uU29ydERyb3AoIGV2ZW50OiBDZGtEcmFnRHJvcDxzdHJpbmdbXT4gKXtcbiAgICBtb3ZlSXRlbUluQXJyYXkoIHRoaXMudWkuZW50cmllcywgZXZlbnQucHJldmlvdXNJbmRleCwgZXZlbnQuY3VycmVudEluZGV4ICk7XG4gICAgdGhpcy5kb20uc2V0VGltZW91dCggYHVwZGF0ZS1zb3J0LW9yZGVyYCwgYXN5bmMoKSA9PiB7XG4gICAgICBjb25zdCByZXF1ZXN0cyA9IFtdO1xuICAgICAgdGhpcy51aS5lbnRyaWVzLm1hcCggKCBlbnRyeTogRmllbGRFbnRyeVNlc3Npb24sIGluZGV4ICkgPT4ge1xuICAgICAgICByZXF1ZXN0cy5wdXNoKCBQb3BSZXF1ZXN0LmRvUGF0Y2goIGAke3RoaXMuYXNzZXQuYmFzZVBhdGh9LyR7ZW50cnkuaWR9YCwgeyBzb3J0X29yZGVyOiBpbmRleCwgb3JwaGFuZWQ6IC0xIH0sIDEsIGZhbHNlICkgKTtcbiAgICAgICAgY29uc3Qgc2Vzc2lvbiA9IHRoaXMuZmllbGQuZW50cmllcy5maW5kKCAoIGU6IEZpZWxkRW50cnkgKSA9PiArZS5pZCA9PT0gK2VudHJ5LmlkICk7XG4gICAgICAgIGlmKCBJc09iamVjdCggc2Vzc2lvbiwgdHJ1ZSApICl7XG4gICAgICAgICAgc2Vzc2lvbi5zb3J0X29yZGVyID0gaW5kZXg7XG4gICAgICAgIH1cbiAgICAgICAgZW50cnkuaW5jcmVtZW50ID0gaW5kZXggKyAxO1xuICAgICAgfSApO1xuICAgICAgaWYoIHJlcXVlc3RzLmxlbmd0aCApe1xuICAgICAgICB0aGlzLnNydi50YWIuc2hvd0FzTG9hZGluZyggdHJ1ZSApO1xuICAgICAgICB0aGlzLmRvbS5zZXRTdWJzY3JpYmVyKCBgdXBkYXRlLXNvcnQtb3JkZXJgLCBmb3JrSm9pbiggcmVxdWVzdHMgKS5zdWJzY3JpYmUoICggcmVzICkgPT4ge1xuICAgICAgICAgIHRoaXMuc3J2LmZpZWxkLnRyaWdnZXJGaWVsZFByZXZpZXdVcGRhdGUoKTtcbiAgICAgICAgICB0aGlzLnNydi50YWIuc2hvd0FzTG9hZGluZyggZmFsc2UgKTtcbiAgICAgICAgfSwgKCBlcnIgKSA9PiB7XG4gICAgICAgICAgdGhpcy5kb20uc2V0RXJyb3IoIGVyciwgdHJ1ZSApO1xuICAgICAgICAgIHRoaXMuc3J2LnRhYi5zaG93QXNMb2FkaW5nKCBmYWxzZSApO1xuICAgICAgICB9ICkgKTtcbiAgICAgIH1cbiAgICB9LCAwICk7XG5cbiAgICAvLyB0aGlzLnRyaWdnZXJTYXZlRmllbGRPcHRpb25zKCA8UG9wQmFzZUV2ZW50SW50ZXJmYWNlPnsgbmFtZTogJ29uQ2hhbmdlJyB9ICk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBXaGVuIHRoZSB0eXBlIG9mIGFuIGVudHJ5IGlzIGNoYW5nZWQgaW4gdGhlIGRhdGFiYXNlLCBtYWtlIHN1cmUgdGhlIGNoYW5nZXMgaXMgdXBkYXRlZCBsb2NhbGx5XG4gICAqIFRoaXMgaXMgd2lsbCAgYmUgcmVtb3ZlZCBzaW5jZSB3ZSBkb24ndCB3YW50IHRvIGRvIHR5cGVzXG4gICAqIEBwYXJhbSBpbmRleFxuICAgKiBAcGFyYW0gZXZlbnRcbiAgICovXG4gIG9uRW50cnlUeXBlQ2hhbmdlKCBpbmRleDogbnVtYmVyLCBldmVudDogUG9wQmFzZUV2ZW50SW50ZXJmYWNlICl7XG4gICAgaWYoIElzVmFsaWRGaWVsZFBhdGNoRXZlbnQoIHRoaXMuY29yZSwgZXZlbnQgKSApe1xuICAgICAgY29uc3QgY29uZmlnID0gdGhpcy51aS5lbnRyaWVzWyBpbmRleCBdO1xuICAgICAgY29uc3QgZW50cnkgPSB0aGlzLmZpZWxkLmVudHJpZXNbIGluZGV4IF07XG4gICAgICBjb25zdCBzZXNzaW9uID0gdGhpcy5kb20uc2Vzc2lvbi5jb250cm9scy5nZXQoIGluZGV4ICk7XG4gICAgICBpZiggZW50cnkgJiYgc2Vzc2lvbiApe1xuICAgICAgICBlbnRyeS50eXBlID0gY29uZmlnLnR5cGUuY29udHJvbC52YWx1ZTtcbiAgICAgICAgdGhpcy5fdXBkYXRlRW50cnlUeXBlU2Vzc2lvbiggc2Vzc2lvbi50eXBlLCBlbnRyeSApO1xuICAgICAgICB0aGlzLmRvbS5zZXNzaW9uLmNvbnRyb2xzLnNldCggaW5kZXgsIHNlc3Npb24gKTtcbiAgICAgICAgdGhpcy5zZXREb21TZXNzaW9uKCBpbmRleCwgc2Vzc2lvbiApO1xuICAgICAgfVxuICAgICAgc2V0VGltZW91dCggKCkgPT4ge1xuICAgICAgICB0aGlzLnNydi5maWVsZC50cmlnZ2VyRmllbGRQcmV2aWV3VXBkYXRlKCk7XG4gICAgICB9LCAwICk7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogV2hlbiB0aGUgZGlzcGxheS9sYWJlbCBvZiBhbiBlbnRyeSBpcyBjaGFuZ2VkIGluIHRoZSBkYXRhYmFzZSwgbWFrZSBzdXJlIHRoZSBjaGFuZ2VzIGlzIHVwZGF0ZWQgbG9jYWxseVxuICAgKiBAcGFyYW0gaW5kZXhcbiAgICogQHBhcmFtIGV2ZW50XG4gICAqL1xuICBvbkVudHJ5RGlzcGxheUNoYW5nZSggaW5kZXg6IG51bWJlciwgZXZlbnQ6IFBvcEJhc2VFdmVudEludGVyZmFjZSApe1xuICAgIGlmKCBpbmRleCA9PT0gMCApIHRoaXMudWkubGFiZWwuY29udHJvbC5zZXRWYWx1ZSggZXZlbnQuY29uZmlnLmNvbnRyb2wudmFsdWUsIHsgZW1pdEV2ZW50OiBmYWxzZSB9ICk7XG4gICAgaWYoIElzVmFsaWRGaWVsZFBhdGNoRXZlbnQoIHRoaXMuY29yZSwgZXZlbnQgKSApe1xuICAgICAgLy8gUG9wVGVtcGxhdGUuYnVmZmVyKCk7XG4gICAgICBjb25zdCBlbnRyeSA9IHRoaXMuZmllbGQuZW50cmllc1sgaW5kZXggXTtcbiAgICAgIGNvbnN0IHNlc3Npb24gPSB0aGlzLmRvbS5zZXNzaW9uLmNvbnRyb2xzLmdldCggaW5kZXggKTtcbiAgICAgIGlmKCBlbnRyeSAmJiBzZXNzaW9uICl7XG4gICAgICAgIGVudHJ5Lm5hbWUgPSBldmVudC5jb25maWcuY29udHJvbC52YWx1ZTtcbiAgICAgICAgdGhpcy5fdXBkYXRlRW50cnlEaXNwbGF5U2Vzc2lvbiggc2Vzc2lvbi5kaXNwbGF5LCBlbnRyeSApO1xuICAgICAgICB0aGlzLmRvbS5zZXNzaW9uLmNvbnRyb2xzLnNldCggaW5kZXgsIHNlc3Npb24gKTtcbiAgICAgICAgdGhpcy5zZXREb21TZXNzaW9uKCBpbmRleCwgc2Vzc2lvbiApO1xuICAgICAgfVxuICAgIH1cbiAgICBzZXRUaW1lb3V0KCAoKSA9PiB7XG4gICAgICB0aGlzLnNydi5maWVsZC50cmlnZ2VyRmllbGRQcmV2aWV3VXBkYXRlKCk7XG4gICAgfSwgMCApO1xuICB9XG5cblxuICAvKipcbiAgICogV2hlbiB0aGUgZGlzcGxheS9sYWJlbCBvZiBhbiBlbnRyeSBpcyBjaGFuZ2VkIGluIHRoZSBkYXRhYmFzZSwgbWFrZSBzdXJlIHRoZSBjaGFuZ2VzIGlzIHVwZGF0ZWQgbG9jYWxseVxuICAgKiBAcGFyYW0gaW5kZXhcbiAgICogQHBhcmFtIGV2ZW50XG4gICAqL1xuICBvbkVudHJ5QWN0aXZlQ2hhbmdlKCBpbmRleDogbnVtYmVyLCBldmVudDogUG9wQmFzZUV2ZW50SW50ZXJmYWNlICl7XG4gICAgaWYoIElzT2JqZWN0KCB0aGlzLnNjaGVtZSwgWyAnaWQnIF0gKSApe1xuICAgICAgLy8gaGVyZVxuICAgIH1lbHNle1xuICAgICAgY29uc3QgZW50cnkgPSB0aGlzLmZpZWxkLmVudHJpZXNbIGluZGV4IF07XG4gICAgICBpZiggZW50cnkgKXtcbiAgICAgICAgaWYoIGV2ZW50LmNvbmZpZy5jb250cm9sLnZhbHVlICl7XG4gICAgICAgICAgZW50cnkub3JwaGFuZWQgPSBmYWxzZTtcbiAgICAgICAgICBlbnRyeS5vcnBoYW5lZF9hdCA9IG51bGw7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGVudHJ5Lm9ycGhhbmVkID0gdHJ1ZTtcbiAgICAgICAgICBlbnRyeS5vcnBoYW5lZF9hdCA9IFBvcERhdGUudG9Jc28oIG5ldyBEYXRlKCkgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgc2V0VGltZW91dCggKCkgPT4ge1xuICAgICAgICB0aGlzLl9oYW5kbGVNdWx0aXBsZUVudHJpZXMoKTtcbiAgICAgICAgdGhpcy5zcnYuZmllbGQudHJpZ2dlckZpZWxkUHJldmlld1VwZGF0ZSgpO1xuICAgICAgfSwgMCApO1xuICAgICAgdGhpcy5sb2cuaW5mbyggYG9uRW50cnlBY3RpdmVDaGFuZ2VgLCBldmVudCApO1xuICAgIH1cbiAgfVxuXG5cbiAgb25FbnRyeVRyYWl0Q2hhbmdlKCBpbmRleDogbnVtYmVyLCB0cmFpdDogeyBuYW1lOiBzdHJpbmcsIHNlbGVjdGVkOiBib29sZWFuIH0gKXtcbiAgICB0aGlzLmRvbS5zZXRUaW1lb3V0KCBgZW50cnktdHJhaXQtJHtpbmRleH1gLCBhc3luYygpID0+IHtcbiAgICAgIHRoaXMudWkuZW50cmllcy5tYXAoICggZW50cnk6IEZpZWxkRW50cnlTZXNzaW9uLCBlbnRyeUluZGV4OiBudW1iZXIgKSA9PiB7XG4gICAgICAgIGNvbnN0IGVudHJ5VHJhaXQgPSBlbnRyeS50cmFpdHMuZmluZCggKCB0ICkgPT4gdC5uYW1lID09PSB0cmFpdC5uYW1lICk7XG4gICAgICAgIGlmKCBJc09iamVjdCggZW50cnlUcmFpdCwgdHJ1ZSApICl7XG4gICAgICAgICAgaWYoICtlbnRyeUluZGV4ICE9PSAraW5kZXggKXtcbiAgICAgICAgICAgIGVudHJ5VHJhaXQuc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIGVudHJ5VHJhaXQuc2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgaWYoIElzT2JqZWN0KCB0aGlzLnNjaGVtZSwgWyAnbWFwcGluZycgXSApICl7XG4gICAgICAgICAgICAgIGlmKCBJc09iamVjdCggdGhpcy5hc3NldC5zY2hlbWVGaWVsZFN0b3JhZ2UsIFsgJ3RyYWl0X2VudHJ5JyBdICkgKXtcbiAgICAgICAgICAgICAgICB0aGlzLmFzc2V0LnNjaGVtZUZpZWxkU3RvcmFnZS50cmFpdF9lbnRyeVsgZW50cnlUcmFpdC5uYW1lIF0gPSBlbnRyeS5pZDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSApO1xuXG4gICAgICBhd2FpdCB0aGlzLnNydi5maWVsZC51cGRhdGVTY2hlbWVGaWVsZE1hcHBpbmcoIHRoaXMuc2NoZW1lICk7XG5cbiAgICAgIHRoaXMubG9nLmluZm8oIGBvbkVudHJ5VHJhaXRDaGFuZ2VgICk7XG4gICAgfSApO1xuXG4gIH1cblxuXG4gIHByaXZhdGUgX2hhbmRsZU11bHRpcGxlRW50cmllcygpe1xuICAgIHRoaXMubG9nLmluZm8oIGBfaGFuZGxlTXVsdGlwbGVFbnRyaWVzYCApO1xuICAgIHRoaXMuZG9tLnNlc3Npb24ubXVsdGlwbGVBY3RpdmVFbnRyaWVzID0gdGhpcy5faXNNdWx0aXBsZUFjdGl2ZUVudHJpZXMoKTtcbiAgICBpZiggISggdGhpcy5kb20uc2Vzc2lvbi5tdWx0aXBsZUFjdGl2ZUVudHJpZXMgKSApe1xuICAgICAgdGhpcy5fZGlzYWJsZUFjdGl2ZUVudHJpZXMoKTtcbiAgICB9ZWxzZXtcbiAgICAgIHRoaXMuX2VuYWJsZUFjdGl2ZUVudHJpZXMoKTtcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBBIFVzZXIgd2lsbCBiZSBhYmxlIHRvIGFkZCBhcyBtYW55IGxhYmVscyBhcyB0aGV5IGxpa2VcbiAgICovXG4gIG9uQWRkRW50cnlWYWx1ZSgpe1xuICAgIHRoaXMuZG9tLnNldFRpbWVvdXQoIGBhZGQtZW50cnlgLCBhc3luYygpID0+IHtcbiAgICAgIGNvbnN0IGFjdGlvbiA9IDxFbnRpdHlBY3Rpb25JbnRlcmZhY2U+e1xuICAgICAgICBuYW1lOiAnZW50cnknLFxuICAgICAgICBoZWFkZXI6ICdBZGQgRW50cnknLFxuICAgICAgICBmYWNhZGU6IHRydWUsXG4gICAgICAgIC8vIGNvbXBvbmVudDoge1xuICAgICAgICAvLyAgIHR5cGU6IERlbW9PbmVDb21wb25lbnRcbiAgICAgICAgLy8gfSxcbiAgICAgICAgZmllbGRzOiB7XG4gICAgICAgICAgbmFtZToge1xuICAgICAgICAgICAgZm9ybTogJ2lucHV0JyxcbiAgICAgICAgICAgIHBhdHRlcm46ICdEZWZhdWx0JyxcbiAgICAgICAgICAgIG5hbWU6ICduYW1lJyxcbiAgICAgICAgICAgIGhpbnQ6IHRydWUsXG4gICAgICAgICAgICBsYWJlbDogJ05hbWUnLFxuICAgICAgICAgICAgcmVxdWlyZWQ6IHRydWUsXG4gICAgICAgICAgICBidWJibGU6IGZhbHNlLFxuICAgICAgICAgICAgbm9Jbml0aWFsVmFsdWU6IHRydWUsXG4gICAgICAgICAgICB0cmFuc2Zvcm1hdGlvbjogJ3RvVGl0bGVDYXNlJyxcbiAgICAgICAgICAgIG1heGxlbmd0aDogMzIsXG4gICAgICAgICAgICBwcmV2ZW50OiB0aGlzLnVpLmVudHJpZXMubWFwKCAoIGVudHJ5OiBGaWVsZEVudHJ5U2Vzc2lvbiApID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIFN0b3JhZ2VHZXR0ZXIoIGVudHJ5LCBbICdkaXNwbGF5JywgJ2NvbnRyb2wnLCAndmFsdWUnIF0sICdVbmRlZmluZWQnICk7XG4gICAgICAgICAgICB9IClcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8vIG9uRXZlbnQ6IChjb3JlOiBDb3JlQ29uZmlnLCBldmVudDogUG9wQmFzZUV2ZW50SW50ZXJmYWNlKTpQcm9taXNlPGJvb2xlYW4+PT57XG4gICAgICAgIC8vICAgcmV0dXJuIG5ldyBQcm9taXNlPGJvb2xlYW4+KChvbkV2ZW50UmVzb2x2ZXIpPT57XG4gICAgICAgIC8vICAgICByZXR1cm4gb25FdmVudFJlc29sdmVyKHRydWUpO1xuICAgICAgICAvLyAgIH0pO1xuICAgICAgICAvLyB9LFxuICAgICAgICBidWJibGVBbGw6IHRydWUsXG4gICAgICAgIGJsb2NrRW50aXR5OiB0cnVlXG4gICAgICB9O1xuICAgICAgY29uc3QgcmVzID0gYXdhaXQgdGhpcy5zcnYuYWN0aW9uLmRvKCB0aGlzLmNvcmUsIGFjdGlvbiApO1xuICAgICAgaWYoIElzT2JqZWN0KCByZXMsIFsgJ25hbWUnIF0gKSApe1xuICAgICAgICBhd2FpdCB0aGlzLl9hZGRFbnRyeSggcmVzLm5hbWUgKTtcbiAgICAgIH1cbiAgICB9LCAwICk7XG5cbiAgfVxuXG5cbiAgcHJpdmF0ZSBfYWRkRW50cnkoIG5hbWU/OiBzdHJpbmcgKTogUHJvbWlzZTxib29sZWFuPntcbiAgICByZXR1cm4gbmV3IFByb21pc2U8Ym9vbGVhbj4oICggcmVzb2x2ZSApID0+IHtcbiAgICAgIHRoaXMuc3J2LnRhYi5zaG93QXNMb2FkaW5nKCB0cnVlICk7XG4gICAgICB0aGlzLmRvbS5zdGF0ZS5wZW5kaW5nID0gdHJ1ZTtcbiAgICAgIGNvbnN0IHNlc3Npb25JbmRleCA9IHRoaXMuZmllbGQuZW50cmllcy5maWx0ZXIoICggeCApID0+IHgudHlwZSAhPT0gJ2N1c3RvbScgKS5sZW5ndGg7XG4gICAgICBjb25zdCBpbmNyZW1lbnQgPSBzZXNzaW9uSW5kZXggKyAxO1xuICAgICAgY29uc3Qgc2Vzc2lvbiA9IHRoaXMuZG9tLnNlc3Npb24uY29udHJvbHMuZ2V0KCBzZXNzaW9uSW5kZXggKTtcbiAgICAgIGlmKCAhbmFtZSApe1xuICAgICAgICBuYW1lID0gc2Vzc2lvbiA/IHNlc3Npb24uZGlzcGxheS52YWx1ZSA6IFRpdGxlQ2FzZSggYCR7KCB0aGlzLmZpZWxkLm5hbWUgPyB0aGlzLmZpZWxkLm5hbWUgOiB0aGlzLmFzc2V0LnR5cGUgKX0gJHtpbmNyZW1lbnR9YCApXG4gICAgICB9XG4gICAgICBjb25zdCBlbnRyeSA9IHtcbiAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgdHlwZTogdGhpcy5hc3NldC50eXBlT3B0aW9uLmRlZmF1bHRWYWx1ZSxcbiAgICAgICAgb3JwaGFuZWRfYXQ6IG51bGwsXG4gICAgICAgIHNvcnRfb3JkZXI6IHNlc3Npb25JbmRleFxuICAgICAgfTtcbiAgICAgIHRoaXMuX21ha2VBcGlSZXF1ZXN0cyggW1xuICAgICAgICB0aGlzLnNydi5yZXF1ZXN0LmRvUG9zdCggYCR7dGhpcy5hc3NldC5iYXNlUGF0aH1gLCBlbnRyeSwgMSwgZmFsc2UgKSxcbiAgICAgICAgdGhpcy5zcnYucmVxdWVzdC5kb1BhdGNoKCBgZmllbGRzLyR7dGhpcy5maWVsZC5pZH1gLCB7IG11bHRpcGxlX21pbjogaW5jcmVtZW50LCBtdWx0aXBsZV9tYXg6IGluY3JlbWVudCB9LCAxLCBmYWxzZSApLFxuICAgICAgXSApLnRoZW4oICggcmVzICkgPT4ge1xuICAgICAgICB0aGlzLl9zZXRFbnRyeVNlc3Npb25Db250cm9scyggdGhpcy5maWVsZC5lbnRyaWVzLmZpbHRlciggKCB4ICkgPT4geC50eXBlICE9PSAnY3VzdG9tJyApICkudGhlbiggKCBlbnRyaWVzOiBGaWVsZEVudHJ5W10gKSA9PiB7XG4gICAgICAgICAgdGhpcy5fc2V0RW50cmllcyggZW50cmllcyApLnRoZW4oICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZG9tLnN0YXRlLnBlbmRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoICgpID0+IHtcbiAgICAgICAgICAgICAgLy8gRm9yIG5vdyBJIHdhbnQgdGhlIGFtb3VudCBvZiBmaWVsZCBlbnRyaWVzIHRvIGRpY3RhdGUgd2hhdCBtaW4vbWF4IHNob3VsZCBiZVxuICAgICAgICAgICAgICB0aGlzLmZpZWxkLm11bHRpcGxlX21pbiA9IGluY3JlbWVudDtcbiAgICAgICAgICAgICAgdGhpcy5maWVsZC5tdWx0aXBsZV9tYXggPSBpbmNyZW1lbnQ7XG5cbiAgICAgICAgICAgICAgdGhpcy51aS5taW5NYXgubWluQ29uZmlnLm1heCA9IHRoaXMuZmllbGQuZW50cmllcy5sZW5ndGg7XG4gICAgICAgICAgICAgIHRoaXMudWkubWluTWF4Lm1pbkNvbmZpZy5taW4gPSB0aGlzLmZpZWxkLmVudHJpZXMubGVuZ3RoO1xuICAgICAgICAgICAgICB0aGlzLnVpLm1pbk1heC5taW5Db25maWcuY29udHJvbC5zZXRWYWx1ZSggdGhpcy5maWVsZC5lbnRyaWVzLmxlbmd0aCApO1xuXG5cbiAgICAgICAgICAgICAgdGhpcy51aS5taW5NYXgubWF4Q29uZmlnLm1heCA9IHRoaXMuZmllbGQuZW50cmllcy5sZW5ndGg7XG4gICAgICAgICAgICAgIHRoaXMudWkubWluTWF4Lm1heENvbmZpZy5taW4gPSB0aGlzLmZpZWxkLmVudHJpZXMubGVuZ3RoO1xuICAgICAgICAgICAgICB0aGlzLnVpLm1pbk1heC5tYXhDb25maWcuY29udHJvbC5zZXRWYWx1ZSggdGhpcy5maWVsZC5lbnRyaWVzLmxlbmd0aCApO1xuXG4gICAgICAgICAgICAgIC8vIHRoaXMudWkubWluTWF4LnRyaWdnZXJPbkNoYW5nZSgpO1xuICAgICAgICAgICAgICB0aGlzLnNydi5maWVsZC50cmlnZ2VyRmllbGRQcmV2aWV3VXBkYXRlKCk7XG4gICAgICAgICAgICAgIHRoaXMuc3J2LnRhYi5zaG93QXNMb2FkaW5nKCBmYWxzZSApO1xuICAgICAgICAgICAgICByZXR1cm4gcmVzb2x2ZSggdHJ1ZSApO1xuICAgICAgICAgICAgfSwgMCApO1xuICAgICAgICAgIH0gKTtcbiAgICAgICAgfSApO1xuICAgICAgfSwgKCBlcnIgKSA9PiB7XG4gICAgICAgIHRoaXMuZG9tLnNldEVycm9yKCBlcnIsIHRydWUgKTtcbiAgICAgICAgdGhpcy5zcnYudGFiLnNob3dBc0xvYWRpbmcoIGZhbHNlICk7XG4gICAgICAgIHJldHVybiByZXNvbHZlKCBmYWxzZSApO1xuICAgICAgfSApO1xuICAgIH0gKTtcbiAgfVxuXG5cbiAgcHJpdmF0ZSBfY29sbGVjdE5ld0VudHJ5TmFtZSgpe1xuICAgIGNvbnN0IGZpZWxkcyA9IHtcbiAgICAgIGNsaWVudF9pZDoge1xuICAgICAgICBmb3JtOiAnc2VsZWN0JyxcbiAgICAgICAgbmFtZTogJ2NsaWVudF9pZCcsXG4gICAgICAgIGxhYmVsOiAnQ2xpZW50JyxcbiAgICAgICAgYnViYmxlOiB0cnVlLFxuICAgICAgICBkaXNhYmxlZDogZmFsc2UsXG4gICAgICAgIHJlcXVpcmVkOiB0cnVlLFxuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgcmVzb3VyY2U6ICdjbGllbnRzJyxcbiAgICAgICAgICBjaGlsZDogJ2FjY291bnRfaWQnXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH07XG5cbiAgICBjb25zdCBhY3Rpb25Db25maWc6IEVudGl0eUFjdGlvbkludGVyZmFjZSA9IHtcbiAgICAgIGhlYWRlcjogJ0FkZCBOZXcgRmllbGQgRW50cnknLFxuICAgICAgbmFtZTogJ2NhbXBhaWduJyxcbiAgICAgIGZpZWxkczoge1xuICAgICAgICAuLi5maWVsZHNcbiAgICAgIH0sXG4gICAgICBzdWJtaXRUZXh0OiAnU3VibWl0JyxcbiAgICAgIHBvc3RVcmw6IG51bGwsXG4gICAgICBibG9ja0VudGl0eTogdHJ1ZSwgLy8gaW1wbGllcyB0aGF0IGZpZWxkcyBzaG91bGQgbm90IGJlIGluaGVyaXRlZCBmcm9tIHRoZSBvcmlnaW5hbCBmaWVsZC50cyBmaWxlXG4gICAgfTtcblxuICAgIHRoaXMuZG9tLnNldFRpbWVvdXQoIGBjb2xsZWN0LW5hbWVgLCBhc3luYygpID0+IHtcbiAgICAgIGNvbnN0IHNldENhbXBhaWduID0gYXdhaXQgdGhpcy5zcnYuYWN0aW9uLmRvKCB0aGlzLmNvcmUsIGFjdGlvbkNvbmZpZyApO1xuICAgICAgdGhpcy5sb2cuaW5mbyggJ3NldENhbXBhaWduJywgc2V0Q2FtcGFpZ24gKTtcblxuICAgICAgdGhpcy5zcnYudGFiLnNob3dBc0xvYWRpbmcoIGZhbHNlICk7XG4gICAgfSwgMCApO1xuICB9XG5cblxuICAvKipcbiAgICogQSBVc2VyIHdpbGwgYmUgYWJsZSB0byByZW1vdmUgbGFiZWxzIGFzIHRoZXkgbGlrZVxuICAgKi9cbiAgb25SZW1vdmVFbnRyeVZhbHVlKCBlbnRyeTogRmllbGRFbnRyeVNlc3Npb24gKXtcbiAgICBpZiggZW50cnkgJiYgZW50cnkuaWQgKXtcbiAgICAgIHRoaXMuc3J2LmRpYWxvZy5vcGVuKCBQb3BDb25maXJtYXRpb25EaWFsb2dDb21wb25lbnQsIHtcbiAgICAgICAgd2lkdGg6ICc1MDBweCcsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICBvcHRpb246IG51bGwsXG4gICAgICAgICAgYm9keTogYERlbGV0aW5nICR7ZW50cnkuZGlzcGxheS5jb250cm9sLnZhbHVlfSB3aWxsIHJlc3VsdCBpbiBhbnkgY29sbGVjdGVkIHZhbHVlcyBvbiB0aGlzIGVudHJ5IGJlaW5nIHBlcm1hbmVudGx5IHJlbW92ZWQuPGJyPjxicj5EbyB5b3Ugd2lzaCB0byBjb250aW51ZT9gLFxuICAgICAgICAgIGFsaWduOiAnbGVmdCdcbiAgICAgICAgfVxuICAgICAgfSApLmFmdGVyQ2xvc2VkKCkuc3Vic2NyaWJlKCByZXMgPT4ge1xuICAgICAgICBpZiggcmVzICYmIHJlcy5jb25maXJtZWQgKXtcbiAgICAgICAgICAvLyBQb3BUZW1wbGF0ZS5idWZmZXIoKTtcbiAgICAgICAgICB0aGlzLmRvbS5zdGF0ZS5wZW5kaW5nID0gdHJ1ZTtcbiAgICAgICAgICBjb25zdCBkZWNyZW1lbnQgPSB0aGlzLmZpZWxkLmVudHJpZXMubGVuZ3RoIC0gMTtcbiAgICAgICAgICB0aGlzLnNydi5yZXF1ZXN0LmRvRGVsZXRlKCBgJHt0aGlzLmFzc2V0LmJhc2VQYXRofS8ke2VudHJ5LmlkfWAgKTtcbiAgICAgICAgICB0aGlzLl9tYWtlQXBpUmVxdWVzdHMoIFtcbiAgICAgICAgICAgIHRoaXMuc3J2LnJlcXVlc3QuZG9EZWxldGUoIGAke3RoaXMuYXNzZXQuYmFzZVBhdGh9LyR7ZW50cnkuaWR9YCApLFxuICAgICAgICAgICAgdGhpcy5zcnYucmVxdWVzdC5kb1BhdGNoKCBgZmllbGRzLyR7dGhpcy5maWVsZC5pZH1gLCB7IG11bHRpcGxlX21pbjogZGVjcmVtZW50LCBtdWx0aXBsZV9tYXg6IGRlY3JlbWVudCB9LCAxLCBmYWxzZSApLFxuICAgICAgICAgIF0gKS50aGVuKCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLl9zZXRFbnRyeVNlc3Npb25Db250cm9scyggdGhpcy5maWVsZC5lbnRyaWVzLmZpbHRlciggKCB4ICkgPT4geC50eXBlICE9PSAnY3VzdG9tJyApICkudGhlbiggKCBlbnRyaWVzOiBGaWVsZEVudHJ5W10gKSA9PiB7XG4gICAgICAgICAgICAgIHRoaXMuX3NldEVudHJpZXMoIGVudHJpZXMgKS50aGVuKCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5kb20uc3RhdGUucGVuZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoICgpID0+IHtcbiAgICAgICAgICAgICAgICAgIC8vIEZvciBub3cgSSB3YW50IHRoZSBhbW91bnQgb2YgZmllbGQgZW50cmllcyB0byBkaWN0YXRlIHdoYXQgbWluL21heCBzaG91bGQgYmVcbiAgICAgICAgICAgICAgICAgIHRoaXMuZmllbGQubXVsdGlwbGVfbWluID0gZGVjcmVtZW50O1xuICAgICAgICAgICAgICAgICAgdGhpcy5maWVsZC5tdWx0aXBsZV9tYXggPSBkZWNyZW1lbnQ7XG5cbiAgICAgICAgICAgICAgICAgIHRoaXMudWkubWluTWF4Lm1pbkNvbmZpZy5tYXggPSB0aGlzLmZpZWxkLmVudHJpZXMubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgdGhpcy51aS5taW5NYXgubWluQ29uZmlnLm1pbiA9IHRoaXMuZmllbGQuZW50cmllcy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICB0aGlzLnVpLm1pbk1heC5taW5Db25maWcuY29udHJvbC5zZXRWYWx1ZSggdGhpcy5maWVsZC5lbnRyaWVzLmxlbmd0aCApO1xuXG5cbiAgICAgICAgICAgICAgICAgIHRoaXMudWkubWluTWF4Lm1heENvbmZpZy5tYXggPSB0aGlzLmZpZWxkLmVudHJpZXMubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgdGhpcy51aS5taW5NYXgubWF4Q29uZmlnLm1pbiA9IHRoaXMuZmllbGQuZW50cmllcy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICB0aGlzLnVpLm1pbk1heC5tYXhDb25maWcuY29udHJvbC5zZXRWYWx1ZSggdGhpcy5maWVsZC5lbnRyaWVzLmxlbmd0aCApO1xuICAgICAgICAgICAgICAgICAgLy8gVG1wIEJsb2NrIF5cblxuICAgICAgICAgICAgICAgICAgdGhpcy5zcnYuZmllbGQudHJpZ2dlckZpZWxkUHJldmlld1VwZGF0ZSgpO1xuICAgICAgICAgICAgICAgIH0sIDAgKTtcbiAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgfSApO1xuICAgICAgICAgIH0gKTtcbiAgICAgICAgfVxuICAgICAgfSApO1xuXG4gICAgfVxuICB9XG5cblxuICBvbk1pbk1heFNldHRpbmcoIGV2ZW50OiBQb3BCYXNlRXZlbnRJbnRlcmZhY2UgKXtcbiAgICBpZiggSXNWYWxpZEZpZWxkUGF0Y2hFdmVudCggdGhpcy5jb3JlLCBldmVudCApICl7XG4gICAgICB0aGlzLnNydi5maWVsZC50cmlnZ2VyRmllbGRQcmV2aWV3VXBkYXRlKCk7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogVGhlIGRvbSBkZXN0cm95IGZ1bmN0aW9uIG1hbmFnZXMgYWxsIHRoZSBjbGVhbiB1cCB0aGF0IGlzIG5lY2Vzc2FyeSBpZiBzdWJzY3JpcHRpb25zLCB0aW1lb3V0cywgZXRjIGFyZSBzdG9yZWQgcHJvcGVybHlcbiAgICovXG4gIG5nT25EZXN0cm95KCl7XG4gICAgc3VwZXIubmdPbkRlc3Ryb3koKTtcbiAgfVxuXG5cbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBVbmRlciBUaGUgSG9vZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIFByaXZhdGUgTWV0aG9kICkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiAgcHJpdmF0ZSBfc2V0Q3VzdG9tVHJhaXRzKCl7XG4gICAgdGhpcy5maWVsZC50cmFpdC5tYXAoICggdHJhaXQ6IEZpZWxkQ3VzdG9tU2V0dGluZ0ludGVyZmFjZSApID0+IHtcbiAgICAgIGlmKCAhdHJhaXQubGFiZWwgKSB0cmFpdC5sYWJlbCA9IFRpdGxlQ2FzZSggU25ha2VUb1Bhc2NhbCggdHJhaXQubmFtZSApICk7XG4gICAgfSApO1xuICB9XG5cblxuICAvKipcbiAgICogQnVpbGQgdGhlIGNvbmZpZ3MgZm9yIHRoZSBzZXQgb2YgY3VzdG9tIHNldHRpbmdzIHRoYXQgdGhpcyBjb21wb25lbnQgdXNlc1xuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcHJpdmF0ZSBfYnVpbGRDdXN0b21TZXR0aW5ncygpe1xuXG4gICAgdGhpcy51aS5taW5NYXggPSBuZXcgTWluTWF4Q29uZmlnKFxuICAgICAge1xuICAgICAgICBidWJibGU6IHRydWUsXG4gICAgICAgIGhlbHBUZXh0OiAnU2V0IHRoZSBtaW5pbXVtIHZhbHVlcyB0aGF0IHRoaXMgZmllbGQgc2hvdWxkIGhhdmUsIHRoZSBtYXhpbXVtIGFtb3VudCBvZiB2YWx1ZXMgd2lsbCBiZSB0aGUgdG90YWwgZW50cmllcyBkZWZpbmVkLicsXG4gICAgICAgIGxhYmVsOiAnRW50cnkgVmFsdWVzJyxcbiAgICAgICAgbWluUmVxdWlyZWQ6IHRydWUsXG4gICAgICAgIG1heFJlcXVpcmVkOiB0cnVlLFxuICAgICAgICBtaW5WYWx1ZTogdGhpcy5maWVsZC5lbnRyaWVzLmxlbmd0aCxcbiAgICAgICAgbWF4VmFsdWU6IHRoaXMuZmllbGQuZW50cmllcy5sZW5ndGgsXG4gICAgICAgIG1pbjogdGhpcy5maWVsZC5lbnRyaWVzLmxlbmd0aCxcbiAgICAgICAgbWF4OiB0aGlzLmZpZWxkLmVudHJpZXMubGVuZ3RoLFxuICAgICAgICBsaW1pdDogMTAsXG4gICAgICAgIG1pbkxhYmVsOiAnTWluaW11bScsXG4gICAgICAgIG1heExhYmVsOiAnTWF4aW11bScsXG4gICAgICAgIG1heENvbHVtbjogJ211bHRpcGxlX21heCcsXG4gICAgICAgIG1pbkNvbHVtbjogJ211bHRpcGxlX21pbicsXG4gICAgICAgIG1heFJlYWRvbmx5OiB0cnVlLFxuICAgICAgICBwYXRjaDoge1xuICAgICAgICAgIGZpZWxkOiAnbi9hJyxcbiAgICAgICAgICBwYXRoOiBgZmllbGRzLyR7dGhpcy5maWVsZC5pZH1gLFxuICAgICAgICAgIGNhbGxiYWNrOiAoIGNvcmU6IENvcmVDb25maWcsIGV2ZW50OiBQb3BCYXNlRXZlbnRJbnRlcmZhY2UgKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXdWYWx1ZSA9IGV2ZW50LmNvbmZpZy5jb250cm9sLnZhbHVlO1xuICAgICAgICAgICAgT2JqZWN0LmtleXMoIG5ld1ZhbHVlICkubWFwKCAoIGtleTogc3RyaW5nICkgPT4ge1xuICAgICAgICAgICAgICB0aGlzLmZpZWxkWyBrZXkgXSA9IG5ld1ZhbHVlWyBrZXkgXTtcbiAgICAgICAgICAgIH0gKTtcblxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSApO1xuXG5cbiAgICB0aGlzLnVpLmxhYmVsID0gbmV3IElucHV0Q29uZmlnKC8vIFBpZ2d5IGJhY2sgb2ZmIG9mIHRoZSBmaXJzdCBlbnRyeSBsYWJlbFxuICAgICAge1xuICAgICAgICBsYWJlbDogJ0xhYmVsJyxcbiAgICAgICAgdmFsdWU6IHRoaXMuZmllbGQuZW50cmllc1sgMCBdLm5hbWUsXG4gICAgICAgIGZhY2FkZTogZmFsc2UsXG4gICAgICAgIG1heGxlbmd0aDogMjQsXG4gICAgICAgIHBhdGNoOiB7XG4gICAgICAgICAgZmllbGQ6IGBuYW1lYCxcbiAgICAgICAgICBwYXRoOiBgZmllbGRzLyR7dGhpcy5maWVsZC5pZH0vZW50cmllcy8ke3RoaXMuZmllbGQuZW50cmllc1sgMCBdLmlkfWAsXG4gICAgICAgICAgY2FsbGJhY2s6ICggY29yZTogQ29yZUNvbmZpZywgZXZlbnQ6IFBvcEJhc2VFdmVudEludGVyZmFjZSApID0+IHtcbiAgICAgICAgICAgIHRoaXMub25FbnRyeURpc3BsYXlDaGFuZ2UoIDAsIGV2ZW50ICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9ICk7XG5cbiAgICAvLyBUaGUgZWRpdCBsYWJlbCBzZXR0aW5nIHdpbGwgZGV0ZXJtaW5lIGlmIHRoZSBlbmQtdXNlciBpcyBhYmxlIHRvIGNoYW5nZSB0aGUgdGhlIGxhYmVsXG4gICAgY29uc3QgZWRpdExhYmVsU2V0dGluZyA9IElzT2JqZWN0KCB0aGlzLmZpZWxkLmN1c3RvbV9zZXR0aW5nLmVkaXRfbGFiZWwsIHRydWUgKSA/IHRoaXMuZmllbGQuY3VzdG9tX3NldHRpbmcuZWRpdF9sYWJlbCA6IG51bGw7XG4gICAgaWYoIGVkaXRMYWJlbFNldHRpbmcgKXtcbiAgICAgIHRoaXMudWkuZWRpdExhYmVsID0gbmV3IFN3aXRjaENvbmZpZyhcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6ICdlZGl0X2xhYmVsJyxcbiAgICAgICAgICBoZWxwVGV4dDogZWRpdExhYmVsU2V0dGluZy5oZWxwVGV4dCxcbiAgICAgICAgICBsYWJlbDogZWRpdExhYmVsU2V0dGluZy5sYWJlbCxcbiAgICAgICAgICBsYWJlbFBvc2l0aW9uOiAnYWZ0ZXInLFxuICAgICAgICAgIHZhbHVlOiA8Ym9vbGVhbj5lZGl0TGFiZWxTZXR0aW5nLnZhbHVlLFxuICAgICAgICAgIG1ldGFkYXRhOiB7XG4gICAgICAgICAgICBzZXR0aW5nOiBlZGl0TGFiZWxTZXR0aW5nLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgZmFjYWRlOiB0cnVlLFxuICAgICAgICAgIHBhdGNoOiB7XG4gICAgICAgICAgICBmaWVsZDogJ3ZhbHVlJyxcbiAgICAgICAgICAgIHBhdGg6IGBgLFxuICAgICAgICAgICAgY2FsbGJhY2s6ICggY29yZTogQ29yZUNvbmZpZywgZXZlbnQ6IFBvcEJhc2VFdmVudEludGVyZmFjZSApID0+IHtcbiAgICAgICAgICAgICAgdGhpcy5zcnYuZmllbGQuc3RvcmVDdXN0b21TZXR0aW5nKCB0aGlzLmNvcmUsIGV2ZW50ICkudGhlbiggKCByZXMgKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYoIElzU3RyaW5nKCByZXMgKSApe1xuICAgICAgICAgICAgICAgICAgdGhpcy51aS5lZGl0TGFiZWwubWVzc2FnZSA9IDxzdHJpbmc+cmVzO1xuICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgdGhpcy5zcnYuZmllbGQudHJpZ2dlckZpZWxkUHJldmlld1VwZGF0ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSApO1xuICAgIH1cblxuICAgIC8vIFRoZSBjdXN0b20gbGFiZWwgc2V0dGluZyB3aWxsIGFsbG93IHRoZSB1c2VyIHRvIGFkZCB0aGVpciBvd24gY3VzdG9tIGxhYmVsIHRvIGZpdCB0aGVpciBuZWVkcywgc2hvdWxkIG9ubHkgc2hvdyBpZiBlZGl0IGxhYmVsIHNldHRpbmcgaXMgdHJ1ZVxuICAgIGNvbnN0IGN1c3RvbUxhYmVsU2V0dGluZyA9IElzT2JqZWN0KCB0aGlzLmZpZWxkLmN1c3RvbV9zZXR0aW5nLmN1c3RvbV9sYWJlbCwgdHJ1ZSApID8gdGhpcy5maWVsZC5jdXN0b21fc2V0dGluZy5jdXN0b21fbGFiZWwgOiBudWxsO1xuICAgIGlmKCBjdXN0b21MYWJlbFNldHRpbmcgKXtcbiAgICAgIHRoaXMudWkuY3VzdG9tTGFiZWwgPSBuZXcgQ2hlY2tib3hDb25maWcoXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAnY3VzdG9tX2xhYmVsJyxcbiAgICAgICAgICBmYWNhZGU6IHRydWUsXG4gICAgICAgICAgaGVscFRleHQ6IGN1c3RvbUxhYmVsU2V0dGluZy5oZWxwVGV4dCxcbiAgICAgICAgICBsYWJlbDogY3VzdG9tTGFiZWxTZXR0aW5nLmxhYmVsLFxuICAgICAgICAgIGxhYmVsUG9zaXRpb246ICdhZnRlcicsXG4gICAgICAgICAgdmFsdWU6IDxib29sZWFuPmN1c3RvbUxhYmVsU2V0dGluZy52YWx1ZSxcbiAgICAgICAgICBtZXRhZGF0YToge1xuICAgICAgICAgICAgc2V0dGluZzogY3VzdG9tTGFiZWxTZXR0aW5nLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgcGF0Y2g6IHtcbiAgICAgICAgICAgIGZpZWxkOiAndmFsdWUnLFxuICAgICAgICAgICAgcGF0aDogYGAsXG4gICAgICAgICAgICBjYWxsYmFjazogKCBjb3JlOiBDb3JlQ29uZmlnLCBldmVudDogUG9wQmFzZUV2ZW50SW50ZXJmYWNlICkgPT4ge1xuICAgICAgICAgICAgICB0aGlzLnNydi5maWVsZC5zdG9yZUN1c3RvbVNldHRpbmcoIHRoaXMuY29yZSwgZXZlbnQgKS50aGVuKCAoIHJlcyApID0+IHtcbiAgICAgICAgICAgICAgICBpZiggSXNTdHJpbmcoIHJlcyApICl7XG4gICAgICAgICAgICAgICAgICB0aGlzLnVpLmN1c3RvbUxhYmVsLm1lc3NhZ2UgPSA8c3RyaW5nPnJlcztcbiAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgIHRoaXMuX29uQ3VzdG9tTGFiZWxDaGFuZ2UoIHRoaXMudWkuY3VzdG9tTGFiZWwuY29udHJvbC52YWx1ZSApLnRoZW4oICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zcnYuZmllbGQudHJpZ2dlckZpZWxkUHJldmlld1VwZGF0ZSgpO1xuICAgICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSApO1xuICAgIH1cblxuICAgIC8vIFRoZSB1bmlxdWUgbGFiZWwgc2V0dGluZyB3aWxsIGZvcmNlIGFsbCBvZiB0aGUgZmllbGQgdmFsdWVzIHRvIHVzZSBhIHVuaXF1ZSBsYWJlbCwgc2hvdWxkIG9ubHkgc2hvdyBpZiBlZGl0IGxhYmVsIHNldHRpbmcgaXMgdHJ1ZVxuICAgIGNvbnN0IHVuaXF1ZUxhYmVsU2V0dGluZyA9IElzT2JqZWN0KCB0aGlzLmZpZWxkLmN1c3RvbV9zZXR0aW5nLnVuaXF1ZV9sYWJlbCwgdHJ1ZSApID8gdGhpcy5maWVsZC5jdXN0b21fc2V0dGluZy51bmlxdWVfbGFiZWwgOiBudWxsO1xuICAgIGlmKCB1bmlxdWVMYWJlbFNldHRpbmcgKXtcblxuICAgICAgdGhpcy51aS51bmlxdWVMYWJlbCA9IG5ldyBDaGVja2JveENvbmZpZyhcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6ICd1bmlxdWVfbGFiZWwnLFxuICAgICAgICAgIGZhY2FkZTogdHJ1ZSxcbiAgICAgICAgICBoZWxwVGV4dDogdW5pcXVlTGFiZWxTZXR0aW5nLmhlbHBUZXh0LFxuICAgICAgICAgIGxhYmVsOiB1bmlxdWVMYWJlbFNldHRpbmcubGFiZWwsXG4gICAgICAgICAgbGFiZWxQb3NpdGlvbjogJ2FmdGVyJyxcbiAgICAgICAgICB2YWx1ZTogPGJvb2xlYW4+dW5pcXVlTGFiZWxTZXR0aW5nLnZhbHVlLFxuICAgICAgICAgIG1ldGFkYXRhOiB7XG4gICAgICAgICAgICBzZXR0aW5nOiB1bmlxdWVMYWJlbFNldHRpbmcsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBwYXRjaDoge1xuICAgICAgICAgICAgZmllbGQ6ICd2YWx1ZScsXG4gICAgICAgICAgICBwYXRoOiBgYCxcbiAgICAgICAgICAgIGNhbGxiYWNrOiAoIGNvcmU6IENvcmVDb25maWcsIGV2ZW50OiBQb3BCYXNlRXZlbnRJbnRlcmZhY2UgKSA9PiB7XG4gICAgICAgICAgICAgIHRoaXMuc3J2LmZpZWxkLnN0b3JlQ3VzdG9tU2V0dGluZyggdGhpcy5jb3JlLCBldmVudCApLnRoZW4oICggcmVzICkgPT4ge1xuICAgICAgICAgICAgICAgIGlmKCBJc1N0cmluZyggcmVzICkgKXtcbiAgICAgICAgICAgICAgICAgIHRoaXMudWkudW5pcXVlTGFiZWwubWVzc2FnZSA9IDxzdHJpbmc+cmVzO1xuICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgdGhpcy5zcnYuZmllbGQudHJpZ2dlckZpZWxkUHJldmlld1VwZGF0ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSApO1xuICAgIH1cblxuICB9XG5cblxuICAvKipcbiAgICogQSBVc2VyIHdpbGwgYmUgYWJsZSB0byBhZGQgYXMgbWFueSBsYWJlbHMgYXMgdGhleSBsaWtlXG4gICAqL1xuICBwcml2YXRlIF9vbkN1c3RvbUxhYmVsQ2hhbmdlKCB2YWx1ZTogYm9vbGVhbiApOiBQcm9taXNlPGJvb2xlYW4+e1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxib29sZWFuPiggKCByZXNvbHZlICkgPT4ge1xuICAgICAgdGhpcy5kb20uc3RhdGUucGVuZGluZyA9IHRydWU7XG5cbiAgICAgIGlmKCB2YWx1ZSApe1xuICAgICAgICBsZXQgaGFzQ3VzdG9tID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZmllbGQuZW50cmllcy5tYXAoICggaXRlbTogRmllbGRFbnRyeSApID0+IHtcbiAgICAgICAgICBpZiggaXRlbS50eXBlID09ICdjdXN0b20nICkgaGFzQ3VzdG9tID0gdHJ1ZTtcbiAgICAgICAgfSApO1xuICAgICAgICBpZiggIWhhc0N1c3RvbSApe1xuICAgICAgICAgIGNvbnN0IGVudHJ5ID0ge1xuICAgICAgICAgICAgbmFtZTogJ0N1c3RvbScsXG4gICAgICAgICAgICB0eXBlOiAnY3VzdG9tJ1xuICAgICAgICAgIH07XG4gICAgICAgICAgdGhpcy5fbWFrZUFwaVJlcXVlc3RzKCBbIHRoaXMuc3J2LnJlcXVlc3QuZG9Qb3N0KCBgJHt0aGlzLmFzc2V0LmJhc2VQYXRofWAsIGVudHJ5LCAxLCBmYWxzZSApIF0gKS50aGVuKCAoIHJlcyApID0+IHtcbiAgICAgICAgICAgIHRoaXMuX3NldEVudHJ5U2Vzc2lvbkNvbnRyb2xzKCB0aGlzLmZpZWxkLmVudHJpZXMuZmlsdGVyKCAoIHggKSA9PiB4LnR5cGUgIT09ICdjdXN0b20nICkgKS50aGVuKCAoIGVudHJpZXM6IEZpZWxkRW50cnlbXSApID0+IHtcbiAgICAgICAgICAgICAgdGhpcy5fc2V0RW50cmllcyggZW50cmllcyApLnRoZW4oICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmRvbS5zdGF0ZS5wZW5kaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCggKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgdGhpcy5zcnYuZmllbGQudHJpZ2dlckZpZWxkUHJldmlld1VwZGF0ZSgpO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoIHRydWUgKTtcbiAgICAgICAgICAgICAgICB9LCAwICk7XG4gICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICB9ICk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHNldFRpbWVvdXQoICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZG9tLnN0YXRlLnBlbmRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuc3J2LmZpZWxkLnRyaWdnZXJGaWVsZFByZXZpZXdVcGRhdGUoKTtcbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlKCB0cnVlICk7XG4gICAgICAgICAgfSwgMCApO1xuICAgICAgICB9XG5cbiAgICAgIH1lbHNle1xuICAgICAgICBjb25zdCByZXF1ZXN0cyA9IFtdO1xuICAgICAgICB0aGlzLmZpZWxkLmVudHJpZXMuZmlsdGVyKCAoIGVudHJ5ICkgPT4ge1xuICAgICAgICAgIGlmKCBlbnRyeS50eXBlID09PSAnY3VzdG9tJyApe1xuICAgICAgICAgICAgcmVxdWVzdHMucHVzaCggdGhpcy5zcnYucmVxdWVzdC5kb0RlbGV0ZSggYCR7dGhpcy5hc3NldC5iYXNlUGF0aH0vJHtlbnRyeS5pZH1gLCBudWxsLCAxLCBmYWxzZSApICk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gKTtcbiAgICAgICAgaWYoIHJlcXVlc3RzLmxlbmd0aCApe1xuICAgICAgICAgIHRoaXMuX21ha2VBcGlSZXF1ZXN0cyggcmVxdWVzdHMgKS50aGVuKCAoIHJlcyApID0+IHtcbiAgICAgICAgICAgIHRoaXMuX3NldEVudHJ5U2Vzc2lvbkNvbnRyb2xzKCB0aGlzLmZpZWxkLmVudHJpZXMuZmlsdGVyKCAoIHggKSA9PiB4LnR5cGUgIT09ICdjdXN0b20nICkgKS50aGVuKCAoIGVudHJpZXM6IEZpZWxkRW50cnlbXSApID0+IHtcbiAgICAgICAgICAgICAgdGhpcy5fc2V0RW50cmllcyggZW50cmllcyApLnRoZW4oICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmRvbS5zdGF0ZS5wZW5kaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCggKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgdGhpcy5zcnYuZmllbGQudHJpZ2dlckZpZWxkUHJldmlld1VwZGF0ZSgpO1xuICAgICAgICAgICAgICAgIH0sIDAgKTtcbiAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgfSApO1xuICAgICAgICAgIH0gKTtcbiAgICAgICAgfVxuXG5cbiAgICAgICAgcmV0dXJuIHJlc29sdmUoIHRydWUgKTtcbiAgICAgIH1cbiAgICB9ICk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBQcm9kdWNlIGEgbGlzdCBvZiB0aGUgZW50cnkgdmFsdWVzIGZvciB0aGlzIGZpZWxkXG4gICAqL1xuICBwcml2YXRlIF9zaG93RW50cmllcygpOiBQcm9taXNlPGJvb2xlYW4+e1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxib29sZWFuPiggYXN5bmMoIHJlc29sdmUgKSA9PiB7XG4gICAgICB0aGlzLl9zZXRWYWx1ZUVudHJpZXMoKS50aGVuKCAoIGVudHJpZXM6IEZpZWxkRW50cnlbXSApID0+IHtcbiAgICAgICAgdGhpcy5fc2V0RW50cnlTZXNzaW9uQ29udHJvbHMoIGVudHJpZXMgKS50aGVuKCAoIHJlczogRmllbGRFbnRyeVtdICkgPT4ge1xuICAgICAgICAgIHRoaXMuX3NldEVudHJpZXMoIHJlcyApLnRoZW4oICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZG9tLnN0YXRlLnBlbmRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlKCB0cnVlICk7XG4gICAgICAgICAgfSApO1xuICAgICAgICB9ICk7XG4gICAgICB9ICk7XG5cbiAgICB9ICk7XG5cbiAgfVxuXG5cbiAgLyoqXG4gICAqIEVuc3VyZSB0aGF0IHRoZSBkYXRhYmFzZSByZWNvcmRzIG1hdGNoIHRoZSBtaW4vbWF4IHNldHRpbmdzXG4gICAqIFRoaXMgd2lsbCByZW1vdmUgYW55IGV4Y2VzcyByZWNvcmRzIGluIHRoZSBkYXRhYmFzZSB0aGF0IGV4Y2VlZCB0aGUgbXVsdGlwbGVfbWluXG4gICAqIFRoaXMgd2lsbCBjcmVhdGUgcmVjb3JkcyBmb3IgYW4gZW50cmllcyB0aGF0IGFyZSBuZWVkZWQgaW4gdGhlIGRhdGFiYXNlXG4gICAqIEBwYXJhbSBwYXRjaFxuICAgKi9cbiAgcHJpdmF0ZSBfc2V0VmFsdWVFbnRyaWVzKCk6IFByb21pc2U8RmllbGRFbnRyeVtdPntcbiAgICByZXR1cm4gbmV3IFByb21pc2U8RmllbGRFbnRyeVtdPiggKCByZXNvbHZlICkgPT4ge1xuICAgICAgY29uc3QgcHJvdmlkZWQgPSBEZWVwQ29weSggdGhpcy5maWVsZC5lbnRyaWVzICkuZmlsdGVyKCAoIGVudHJ5ICkgPT4ge1xuICAgICAgICByZXR1cm4gZW50cnkudHlwZSAhPT0gJ2N1c3RvbSc7XG4gICAgICB9ICk7XG4gICAgICBjb25zdCBlbnRyaWVzID0gWyAuLi5wcm92aWRlZCBdO1xuICAgICAgcmV0dXJuIHJlc29sdmUoIGVudHJpZXMgKTtcbiAgICB9ICk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBXaWxsIG1ha2UgYWxsIG9mIHRoZSBuZWVkZWQgYXBpIHJlcXVlc3RzXG4gICAqIEBwYXJhbSByZXF1ZXN0c1xuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcHJpdmF0ZSBfbWFrZUFwaVJlcXVlc3RzKCByZXF1ZXN0czogT2JzZXJ2YWJsZTxhbnk+W10gKTogUHJvbWlzZTxGaWVsZEVudHJ5W10+e1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxGaWVsZEVudHJ5W10+KCAoIHJlc29sdmUgKSA9PiB7XG4gICAgICAvLyBQb3BUZW1wbGF0ZS5idWZmZXIoKTtcbiAgICAgIGZvcmtKb2luKCByZXF1ZXN0cyApLnN1YnNjcmliZSggKCkgPT4ge1xuICAgICAgICB0aGlzLnNydi5yZXF1ZXN0LmRvR2V0KCB0aGlzLmFzc2V0LmJhc2VQYXRoICkuc3Vic2NyaWJlKCAoIHJlcyApID0+IHtcbiAgICAgICAgICByZXMgPSByZXMuZGF0YSA/IHJlcy5kYXRhIDogcmVzO1xuICAgICAgICAgIHRoaXMuZmllbGQuZW50cmllcyA9IElzQXJyYXkoIHJlcywgdHJ1ZSApID8gPEZpZWxkRW50cnlbXT5yZXMgOiBbXTtcbiAgICAgICAgICB0aGlzLmNvcmUuZW50aXR5LmVudHJpZXMgPSBKU09OLnBhcnNlKCBKU09OLnN0cmluZ2lmeSggdGhpcy5maWVsZC5lbnRyaWVzICkgKVxuICAgICAgICAgIHJlc29sdmUoIHJlcyApO1xuICAgICAgICB9ICk7XG4gICAgICB9LCAoIGVyciApID0+IHtcbiAgICAgICAgUG9wTG9nLmVycm9yKCB0aGlzLm5hbWUsIGBfbWFrZUFwaVJlcXVlc3RzYCwgR2V0SHR0cEVycm9yTXNnKCBlcnIgKSApO1xuICAgICAgICByZXNvbHZlKCBbXSApO1xuICAgICAgfSApO1xuICAgIH0gKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFN0b3JlIGEgc2V0IG9mIGNvbnRyb2xzIHRoYXQgY2FuIHN0b3JlIHZhbHVlcyBhcyB0aGUgdXNlciBjaGFuZ2VzIHRoZSBzZXR0aW5nc1xuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcHJpdmF0ZSBfc2V0RW50cnlTZXNzaW9uQ29udHJvbHMoIGVudHJpZXM6IEZpZWxkRW50cnlbXSApOiBQcm9taXNlPEZpZWxkRW50cnlbXT57XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKCAoIHJlc29sdmUgKSA9PiB7XG4gICAgICBsZXQgaW5kZXggPSAwO1xuICAgICAgZW50cmllcy5tYXAoICggZW50cnk6IEZpZWxkRW50cnkgKSA9PiB7XG4gICAgICAgIGlmKCBlbnRyeS50eXBlICE9PSAnY3VzdG9tJyApe1xuICAgICAgICAgIGlmKCAhKCBJc0RlZmluZWQoIGVudHJ5Lm9ycGhhbmVkICkgKSApIGVudHJ5Lm9ycGhhbmVkID0gSXNEZWZpbmVkKCBlbnRyeS5vcnBoYW5lZF9hdCwgZmFsc2UgKTtcbiAgICAgICAgICBjb25zdCBzZXNzaW9uID0gdGhpcy5kb20uc2Vzc2lvbi5jb250cm9scy5oYXMoIGluZGV4ICkgPyB0aGlzLmRvbS5zZXNzaW9uLmNvbnRyb2xzLmdldCggaW5kZXggKSA6IHtcbiAgICAgICAgICAgIGlkOiBlbnRyeSA/IGVudHJ5LmlkIDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IHRoaXMuX2dldEVudHJ5VHlwZUNvbmZpZyggZW50cnkgKSxcbiAgICAgICAgICAgIGRpc3BsYXk6IHRoaXMuX2dldEVudHJ5RGlzcGxheUNvbmZpZyggZW50cnkgKSxcbiAgICAgICAgICAgIGFjdGl2ZTogdGhpcy5fZ2V0RW50cnlBY3RpdmVDb25maWcoIGVudHJ5ICksXG4gICAgICAgICAgICBpbmNyZW1lbnQ6IGluZGV4ICsgMSxcbiAgICAgICAgICB9O1xuICAgICAgICAgIHRoaXMuX3VwZGF0ZVNlc3Npb25Db250cm9sKCBpbmRleCwgc2Vzc2lvbiwgZW50cnkgKTtcbiAgICAgICAgICBpbmRleCsrO1xuICAgICAgICB9XG4gICAgICB9ICk7XG5cblxuICAgICAgcmV0dXJuIHJlc29sdmUoIGVudHJpZXMgKTtcbiAgICB9ICk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIGVudHJ5IGNvbmZpZyB0byB1c2UgdGhlIHN0b3JlZCByZWNvcmQsIGFuZCB1cGRhdGUgdGhlIHNlc3Npb25zIGZvciBpdFxuICAgKiBAcGFyYW0gaW5kZXhcbiAgICogQHBhcmFtIHNlc3Npb25cbiAgICogQHBhcmFtIGVudHJ5XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBwcml2YXRlIF91cGRhdGVTZXNzaW9uQ29udHJvbCggaW5kZXg6IG51bWJlciwgc2Vzc2lvbjogRmllbGRFbnRyeVNlc3Npb24sIGVudHJ5OiBGaWVsZEVudHJ5ID0gbnVsbCApe1xuICAgIHNlc3Npb24uaW5jcmVtZW50ID0gaW5kZXggKyAxO1xuICAgIHNlc3Npb24uaWQgPSBlbnRyeSA/IGVudHJ5LmlkIDogbnVsbDtcbiAgICB0aGlzLl91cGRhdGVFbnRyeVR5cGVTZXNzaW9uKCBzZXNzaW9uLnR5cGUsIGVudHJ5ICk7XG4gICAgdGhpcy5fdXBkYXRlRW50cnlEaXNwbGF5U2Vzc2lvbiggc2Vzc2lvbi5kaXNwbGF5LCBlbnRyeSApO1xuICAgIHRoaXMuZG9tLnNlc3Npb24uY29udHJvbHMuc2V0KCBpbmRleCwgc2Vzc2lvbiApO1xuICAgIHRoaXMuc2V0RG9tU2Vzc2lvbiggaW5kZXgsIHNlc3Npb24gKTtcbiAgICByZXR1cm4gc2Vzc2lvbjtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFVwZGF0ZSB0aGUgZW50cnkgdHlwZSBjb25maWcgdG8gdXNlIGNvcnJlY3QgdmFsdWUgYW5kIHBhdGhcbiAgICogQHBhcmFtIGNvbmZpZ1xuICAgKiBAcGFyYW0gZW50cnlcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHByaXZhdGUgX3VwZGF0ZUVudHJ5VHlwZVNlc3Npb24oIGNvbmZpZzogU2VsZWN0Q29uZmlnLCBlbnRyeTogRmllbGRFbnRyeSA9IG51bGwgKXtcbiAgICAvLyBjb25maWcudmFsdWUgPSBlbnRyeSA/IGVudHJ5LnR5cGUgOiB0aGlzLmFzc2V0LnR5cGUgaW4gdGhpcy5hc3NldC50eXBlT3B0aW9uID8gdGhpcy5hc3NldC50eXBlT3B0aW9uWyB0aGlzLmFzc2V0LnR5cGUgXS5kZWZhdWx0VmFsdWUgOiAnbi9hJztcbiAgICAvLyBjb25maWcuY29udHJvbC5zZXRWYWx1ZSggY29uZmlnLnZhbHVlLCB7IGVtaXRFdmVudDogZmFsc2UgfSApO1xuICAgIC8vIGNvbmZpZy5wYXRjaC5wYXRoID0gZW50cnkgPyBgJHt0aGlzLmFzc2V0LmJhc2VQYXRofS8ke2VudHJ5LmlkfWAgOiBudWxsO1xuICB9XG5cblxuICAvKipcbiAgICogVXBkYXRlIHRoZSBlbnRyeSBkaXNwbGF5IGNvbmZpZyB0byB1c2UgY29ycmVjdCB2YWx1ZSBhbmQgcGF0aFxuICAgKiBAcGFyYW0gY29uZmlnXG4gICAqIEBwYXJhbSBlbnRyeVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcHJpdmF0ZSBfdXBkYXRlRW50cnlEaXNwbGF5U2Vzc2lvbiggY29uZmlnOiBJbnB1dENvbmZpZywgZW50cnk6IEZpZWxkRW50cnkgPSBudWxsICl7XG4gICAgLy8gY29uZmlnLnZhbHVlID0gZW50cnkgPyBlbnRyeS5uYW1lIDogJyc7XG4gICAgLy8gY29uZmlnLmNvbnRyb2wuc2V0VmFsdWUoIGNvbmZpZy52YWx1ZSwgeyBlbWl0RXZlbnQ6IGZhbHNlIH0gKTtcbiAgICAvLyBjb25maWcucGF0Y2gucGF0aCA9IGVudHJ5ID8gYCR7dGhpcy5hc3NldC5iYXNlUGF0aH0vJHtlbnRyeS5pZH1gIDogbnVsbDtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFVwZGF0ZSB0aGUgZW50cnkgYWN0aXZlIGNvbmZpZyB0byB1c2UgY29ycmVjdCB2YWx1ZSBhbmQgcGF0aFxuICAgKiBAcGFyYW0gY29uZmlnXG4gICAqIEBwYXJhbSBlbnRyeVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcHJpdmF0ZSBfdXBkYXRlRW50cnlBY3RpdmVTZXNzaW9uKCBjb25maWc6IElucHV0Q29uZmlnLCBlbnRyeTogRmllbGRFbnRyeSA9IG51bGwgKXtcblxuICB9XG5cblxuICAvKipcbiAgICogU3RvcmUgZWFjaCBlbnRyeSBjb25maWcgaW4gYSBkb20gc2Vzc2lvbiBzbyB0aGF0IGl0IGNhbiBiZSByZXN0b3JlZCB3aGVuIHRoZSB1c2VycyBpcyBzd2l0Y2hpbmcgdGFic1xuICAgKiBAcGFyYW0gaW5kZXhcbiAgICogQHBhcmFtIHNlc3Npb25cbiAgICovXG4gIHByaXZhdGUgc2V0RG9tU2Vzc2lvbiggaW5kZXg6IG51bWJlciwgc2Vzc2lvbjogRmllbGRFbnRyeVNlc3Npb24gKXtcbiAgICBjb25zdCBkb21TdG9yYWdlID0gPGFueT5TdG9yYWdlR2V0dGVyKCB0aGlzLmRvbS5yZXBvLCBbICdjb21wb25lbnRzJywgdGhpcy5uYW1lLCB0aGlzLmlkICsgJycsICdzZXNzaW9uJyBdICk7XG4gICAgaWYoIElzT2JqZWN0KCBkb21TdG9yYWdlLCBbICdjb250cm9scycgXSApICl7XG4gICAgICBjb25zdCBjb250cm9scyA9IDxNYXA8bnVtYmVyLCBGaWVsZEVudHJ5U2Vzc2lvbj4+ZG9tU3RvcmFnZS5jb250cm9scztcbiAgICAgIGNvbnRyb2xzLnNldCggaW5kZXgsIHNlc3Npb24gKTtcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBTZXQgZW50cnkgY29uZmlnIG9iamVjdHMgdGhhdCB3aWxsIGJlIHVzZWQgaW4gdGhlIGh0bWwgdGVtcGxhdGVcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHByaXZhdGUgX3NldEVudHJpZXMoIGVudHJpZXM6IEZpZWxkRW50cnlbXSApOiBQcm9taXNlPGJvb2xlYW4+e1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxib29sZWFuPiggYXN5bmMoIHJlc29sdmUgKSA9PiB7XG4gICAgICB0aGlzLnVpLmVudHJpZXMgPSBbXTtcbiAgICAgIHRoaXMuYXNzZXQuZW50cmllcyA9IElzQXJyYXkoIGVudHJpZXMsIHRydWUgKSA/IGVudHJpZXMuZmlsdGVyKCAoIGUgKSA9PiBlLnR5cGUgIT09ICdjdXN0b20nICkgOiBbXTtcbiAgICAgIHRoaXMuYXNzZXQuZW50cmllc01hcCA9IEFycmF5TWFwU2V0dGVyKCB0aGlzLmFzc2V0LmVudHJpZXMsICdpZCcgKTtcbiAgICAgIHRoaXMuZG9tLnN0YXRlLmhhc011bHRpcGxlRW50cmllcyA9IHRoaXMuYXNzZXQuZW50cmllcy5sZW5ndGggPiAxO1xuICAgICAgYXdhaXQgdGhpcy5fY2hlY2tGaWVsZEVudHJ5VHJhaXRzKCk7XG5cbiAgICAgIHJldHVybiByZXNvbHZlKCB0cnVlICk7XG4gICAgfSApO1xuXG4gIH1cblxuXG4gIC8qKlxuICAgKiBNYW5hZ2UgdGhlIHR5cGUgb2YgZWFjaCBlbnRyeVxuICAgKiBAcGFyYW0gaW5kXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBwcml2YXRlIF9nZXRFbnRyeVR5cGVDb25maWcoIGVudHJ5OiBGaWVsZEVudHJ5ICl7XG4gICAgbGV0IGRpc2FibGVkID0gZmFsc2U7XG4gICAgbGV0IG9wdGlvbnMgPSB0aGlzLmFzc2V0LnR5cGUgaW4gdGhpcy5hc3NldC50eXBlT3B0aW9uID8gdGhpcy5hc3NldC50eXBlT3B0aW9uWyB0aGlzLmFzc2V0LnR5cGUgXS5vcHRpb25zIDogW107XG4gICAgaWYoICFJc0FycmF5KCBvcHRpb25zLCB0cnVlICkgKXtcbiAgICAgIG9wdGlvbnMgPSBbIHsgdmFsdWU6ICduL2EnLCBuYW1lOiAnTi9BJyB9IF07XG4gICAgICBkaXNhYmxlZCA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiBuZXcgU2VsZWN0Q29uZmlnKCB7XG4gICAgICBsYWJlbDogJ1R5cGUnLFxuICAgICAgb3B0aW9uczogeyB2YWx1ZXM6IG9wdGlvbnMgfSxcbiAgICAgIGRpc2FibGVkOiBkaXNhYmxlZCxcbiAgICAgIHBhdGNoOiB7XG4gICAgICAgIGZpZWxkOiAndHlwZScsXG4gICAgICAgIHBhdGg6IGVudHJ5ICYmIGVudHJ5LmlkID8gYCR7dGhpcy5hc3NldC5iYXNlUGF0aH0vJHtlbnRyeS5pZH1gIDogbnVsbCxcbiAgICAgIH1cbiAgICB9ICk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBNYW5hZ2UgdGhlIHR5cGUgb2YgZWFjaCBlbnRyeVxuICAgKiBAcGFyYW0gaW5kXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBwcml2YXRlIF9nZXRTZXNzaW9uRW50cnlUcmFpdHMoIGVudHJ5OiBGaWVsZEVudHJ5ICl7XG4gICAgY29uc3QgdHJhaXRzID0gW107XG4gICAgaWYoIElzT2JqZWN0KCB0aGlzLnNjaGVtZSwgWyAnaWQnLCAnbWFwcGluZycgXSApICl7XG4gICAgICBjb25zdCB0cmFpdEVudHJ5TWFwcGluZyA9IHRoaXMuYXNzZXQuc2NoZW1lRmllbGRTdG9yYWdlLnRyYWl0X2VudHJ5O1xuICAgICAgY29uc3QgZGlzYWJsZWRFbnRyaWVzID0gdGhpcy5hc3NldC5zY2hlbWVGaWVsZFN0b3JhZ2UuZGlzYWJsZWRfZW50cmllcztcbiAgICAgIGlmKCBJc09iamVjdCggdGhpcy5maWVsZCwgdHJ1ZSApICYmIElzQXJyYXkoIHRoaXMuZmllbGQudHJhaXQsIHRydWUgKSApe1xuICAgICAgICB0aGlzLmZpZWxkLnRyYWl0Lm1hcCggKCB0cmFpdDogRmllbGRDdXN0b21TZXR0aW5nSW50ZXJmYWNlICkgPT4ge1xuICAgICAgICAgIHRyYWl0cy5wdXNoKCB7XG4gICAgICAgICAgICBuYW1lOiB0cmFpdC5uYW1lLFxuICAgICAgICAgICAgZGlzYWJsZWQ6IGRpc2FibGVkRW50cmllcy5pbmNsdWRlcyhlbnRyeS5pZCksXG4gICAgICAgICAgICBzZWxlY3RlZDogK3RyYWl0RW50cnlNYXBwaW5nWyB0cmFpdC5uYW1lIF0gPT09IGVudHJ5LmlkXG4gICAgICAgICAgfSApO1xuICAgICAgICB9ICk7XG5cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRyYWl0cztcbiAgfVxuXG5cbiAgcHJpdmF0ZSBfY2hlY2tGaWVsZEVudHJ5VHJhaXRzKCk6IFByb21pc2U8Ym9vbGVhbj57XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKCBhc3luYyggcmVzb2x2ZSApID0+IHtcbiAgICAgIGlmKCB0aGlzLmRvbS5zdGF0ZS5pc1ByaW1hcnkgJiYgSXNBcnJheSggdGhpcy5maWVsZC50cmFpdCwgdHJ1ZSApICl7XG4gICAgICAgIGxldCB1cGRhdGVOZWVkZWQgPSBmYWxzZTtcbiAgICAgICAgY29uc3QgZGlzYWJsZWRFbnRyaWVzID0gdGhpcy5hc3NldC5zY2hlbWVGaWVsZFN0b3JhZ2UuZGlzYWJsZWRfZW50cmllcztcbiAgICAgICAgY29uc3QgYWN0aXZlRW50cnkgPSBJc0FycmF5KCB0aGlzLmFzc2V0LmVudHJpZXMsIHRydWUgKSA/IHRoaXMuYXNzZXQuZW50cmllcy5maW5kKCBlbnRyeSA9PiB7XG4gICAgICAgICAgcmV0dXJuICEoIGRpc2FibGVkRW50cmllcy5pbmNsdWRlcyggZW50cnkuaWQgKSApICYmICFlbnRyeS5vcnBoYW5lZF9hdDtcbiAgICAgICAgfSApIDogbnVsbDtcbiAgICAgICAgaWYoIElzT2JqZWN0KCBhY3RpdmVFbnRyeSwgWyAnaWQnIF0gKSApe1xuXG4gICAgICAgICAgY29uc3QgdHJhaXRFbnRyeU1hcHBpbmcgPSB0aGlzLmFzc2V0LnNjaGVtZUZpZWxkU3RvcmFnZS50cmFpdF9lbnRyeTtcbiAgICAgICAgICB0aGlzLmZpZWxkLnRyYWl0Lm1hcCggKCB0cmFpdCApID0+IHtcbiAgICAgICAgICAgIGlmKCBJc1VuZGVmaW5lZCggdHJhaXRFbnRyeU1hcHBpbmdbIHRyYWl0Lm5hbWUgXSApIHx8ICEoIHRyYWl0RW50cnlNYXBwaW5nWyB0cmFpdC5uYW1lIF0gaW4gdGhpcy5hc3NldC5lbnRyaWVzTWFwICkgfHwgZGlzYWJsZWRFbnRyaWVzLmluY2x1ZGVzKCArdHJhaXRFbnRyeU1hcHBpbmdbIHRyYWl0Lm5hbWUgXSApICl7XG4gICAgICAgICAgICAgIHRyYWl0RW50cnlNYXBwaW5nWyB0cmFpdC5uYW1lIF0gPSBhY3RpdmVFbnRyeS5pZDtcbiAgICAgICAgICAgICAgdXBkYXRlTmVlZGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9ICk7XG4gICAgICAgICAgaWYoIHVwZGF0ZU5lZWRlZCApe1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5zcnYuZmllbGQudXBkYXRlU2NoZW1lRmllbGRNYXBwaW5nKCB0aGlzLnNjaGVtZSApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmKCB0aGlzLmRvbS5zZXNzaW9uLmNvbnRyb2xzICl7XG4gICAgICAgICAgdGhpcy51aS5lbnRyaWVzID0gW107XG4gICAgICAgICAgLy8gdGhpcy5kb20uc2V0VGltZW91dCggYHJlc2V0LWVudHJpZXNgLCAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5hc3NldC5lbnRyaWVzLm1hcCggKCBlbnRyeSwgaW5kZXggKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzZXNzaW9uRW50cnkgPSB0aGlzLmRvbS5zZXNzaW9uLmNvbnRyb2xzLmdldCggaW5kZXggKTtcbiAgICAgICAgICAgIGlmKCB0aGlzLmRvbS5zdGF0ZS5pc1ByaW1hcnkgKSBzZXNzaW9uRW50cnkudHJhaXRzID0gdGhpcy5fZ2V0U2Vzc2lvbkVudHJ5VHJhaXRzKCBlbnRyeSApO1xuICAgICAgICAgICAgaWYoICF0aGlzLnNjaGVtZSB8fCAhZW50cnkub3JwaGFuZWRfYXQgKSB0aGlzLnVpLmVudHJpZXMucHVzaCggc2Vzc2lvbkVudHJ5ICk7XG4gICAgICAgICAgfSApO1xuICAgICAgICAgIHRoaXMuX2hhbmRsZU11bHRpcGxlRW50cmllcygpO1xuICAgICAgICAgIHJldHVybiByZXNvbHZlKCB0cnVlICk7XG4gICAgICAgICAgLy8gfSwgMCApO1xuXG4gICAgICAgIH1cbiAgICAgIH1lbHNle1xuICAgICAgICBpZiggdGhpcy5kb20uc2Vzc2lvbi5jb250cm9scyApe1xuICAgICAgICAgIHRoaXMudWkuZW50cmllcyA9IFtdO1xuICAgICAgICAgIHRoaXMuYXNzZXQuZW50cmllcy5tYXAoICggZW50cnksIGluZGV4ICkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc2Vzc2lvbkVudHJ5ID0gdGhpcy5kb20uc2Vzc2lvbi5jb250cm9scy5nZXQoIGluZGV4ICk7XG4gICAgICAgICAgICBpZiggIXRoaXMuc2NoZW1lIHx8ICFlbnRyeS5vcnBoYW5lZF9hdCApIHRoaXMudWkuZW50cmllcy5wdXNoKCBzZXNzaW9uRW50cnkgKTtcbiAgICAgICAgICB9ICk7XG4gICAgICAgICAgdGhpcy5faGFuZGxlTXVsdGlwbGVFbnRyaWVzKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc29sdmUoIHRydWUgKTtcbiAgICAgIH1cblxuICAgIH0gKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIE1hbmFnZSB0aGUgdHlwZSBvZiBlYWNoIGVudHJ5XG4gICAqIEBwYXJhbSBpbmRcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHByaXZhdGUgX2dldEVudHJ5QWN0aXZlQ29uZmlnKCBlbnRyeTogRmllbGRFbnRyeSApe1xuICAgIGxldCB2YWx1ZSA9ICFlbnRyeS5vcnBoYW5lZDtcbiAgICBpZiggSXNPYmplY3QoIHRoaXMuc2NoZW1lLCB0cnVlICkgKXtcbiAgICAgIGlmKCB0aGlzLmFzc2V0LnNjaGVtZUZpZWxkU3RvcmFnZS5kaXNhYmxlZF9lbnRyaWVzLmluY2x1ZGVzKCBlbnRyeS5pZCApICl7XG4gICAgICAgIHZhbHVlID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZXcgU3dpdGNoQ29uZmlnKCB7XG4gICAgICBsYWJlbDogJycsXG4gICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICBlbXB0eTogJ0NvbnZlcnRFbXB0eVRvTnVsbCcsXG4gICAgICB0b29sdGlwOiAnVG9nZ2xlIFZpc2liaWxpdHknLFxuICAgICAgZmFjYWRlOiB0cnVlLFxuICAgICAgbWV0YWRhdGE6IHtcbiAgICAgICAgZW50cnk6IGVudHJ5XG4gICAgICB9LFxuICAgICAgLy8gZGlzYWJsZWQ6IHRoaXMuZG9tLnN0YXRlLmhhc1NjaGVtZSA/IHRydWUgOiBmYWxzZSxcbiAgICAgIHBhdGNoOiB7XG4gICAgICAgIGZpZWxkOiAnb3JwaGFuZWRfYXQnLFxuICAgICAgICBwYXRoOiAnJyxcbiAgICAgICAgZHVyYXRpb246IDAsXG4gICAgICAgIGRpc3BsYXlJbmRpY2F0b3I6IGZhbHNlLFxuICAgICAgICBjYWxsYmFjazogYXN5bmMoIGNvcmU6IENvcmVDb25maWcsIGV2ZW50OiBQb3BCYXNlRXZlbnRJbnRlcmZhY2UgKSA9PiB7XG4gICAgICAgICAgdGhpcy5zcnYudGFiLnNob3dBc0xvYWRpbmcoIHRydWUgKTtcbiAgICAgICAgICBpZiggSXNPYmplY3QoIHRoaXMuc2NoZW1lLCBbICdpZCcgXSApICl7XG4gICAgICAgICAgICBpZiggZXZlbnQuY29uZmlnLmNvbnRyb2wudmFsdWUgKXsgLy8gcmVtb3ZlIGZyb20gZGlzYWJsZWRcbiAgICAgICAgICAgICAgdGhpcy5hc3NldC5zY2hlbWVGaWVsZFN0b3JhZ2UuZGlzYWJsZWRfZW50cmllcy5zcGxpY2UoICggPG51bWJlcltdPnRoaXMuYXNzZXQuc2NoZW1lRmllbGRTdG9yYWdlLmRpc2FibGVkX2VudHJpZXMgKS5pbmRleE9mKCArZW50cnkuaWQgKSwgMSApO1xuXG4gICAgICAgICAgICB9ZWxzZXsgLy8gYWRkIHRvIGRpc2FibGVkXG4gICAgICAgICAgICAgIHRoaXMuYXNzZXQuc2NoZW1lRmllbGRTdG9yYWdlLmRpc2FibGVkX2VudHJpZXMucHVzaCggK2VudHJ5LmlkICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLmxvZyggJ2hlcmUnLCBlbnRyeS5pZCwgdGhpcy5hc3NldC5zY2hlbWVGaWVsZFN0b3JhZ2UuZGlzYWJsZWRfZW50cmllcyApO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5fY2hlY2tGaWVsZEVudHJ5VHJhaXRzKCk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnNydi5maWVsZC51cGRhdGVTY2hlbWVGaWVsZE1hcHBpbmcoIHRoaXMuc2NoZW1lICk7XG4gICAgICAgICAgICB0aGlzLnNydi50YWIuc2hvd0FzTG9hZGluZyggZmFsc2UgKTtcblxuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgY29uc3Qgb3JwaGFuZWQgPSBldmVudC5jb25maWcuY29udHJvbC52YWx1ZSA/IG51bGwgOiB0cnVlO1xuICAgICAgICAgICAgdGhpcy5kb20uc2V0VGltZW91dCggYHVwZGF0ZS1vcnBoYW5lZC1hdC0ke2VudHJ5LmlkfWAsIFBvcFJlcXVlc3QuZG9QYXRjaCggYCR7dGhpcy5hc3NldC5iYXNlUGF0aH0vJHtlbnRyeS5pZH1gLCB7IG9ycGhhbmVkOiBvcnBoYW5lZCB9LCAxLCBmYWxzZSApLnN1YnNjcmliZSggKCByZXMgKSA9PiB7XG4gICAgICAgICAgICAgIHJlcyA9IEdldEh0dHBPYmplY3RSZXN1bHQoIHJlcyApO1xuICAgICAgICAgICAgICB0aGlzLmxvZy5pbmZvKCBgX2dldEVudHJ5QWN0aXZlQ29uZmlnYCwgcmVzICk7XG4gICAgICAgICAgICAgIHRoaXMuc3J2LnRhYi5zaG93QXNMb2FkaW5nKCBmYWxzZSApO1xuICAgICAgICAgICAgfSwgKCBlcnIgKSA9PiB7XG4gICAgICAgICAgICAgIHRoaXMuZG9tLnNldEVycm9yKCBlcnIsIHRydWUgKTtcbiAgICAgICAgICAgICAgdGhpcy5zcnYudGFiLnNob3dBc0xvYWRpbmcoIGZhbHNlICk7XG4gICAgICAgICAgICB9ICkgKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIE1hbmFnZSB0aGUgZGlzcGxheSBvZiBlYWNoIGVudHJ5XG4gICAqIEBwYXJhbSBpbmRleFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcHJpdmF0ZSBfZ2V0RW50cnlEaXNwbGF5Q29uZmlnKCBlbnRyeTogRmllbGRFbnRyeSApe1xuLy8gICAgIGNvbnNvbGUubG9nKCAnX2dldEVudHJ5RGlzcGxheUNvbmZpZycsIGVudHJ5ICk7XG4gICAgcmV0dXJuIG5ldyBJbnB1dENvbmZpZygge1xuICAgICAgbGFiZWw6ICdFbnRyeSBOYW1lJyxcbiAgICAgIHZhbHVlOiBlbnRyeSAmJiBlbnRyeS5uYW1lID8gZW50cnkubmFtZSA6ICcnLFxuICAgICAgdHJhbnNmb3JtYXRpb246ICd0b1RpdGxlQ2FzZScsXG4gICAgICBkaXNhYmxlZDogdGhpcy5kb20uc3RhdGUuaGFzU2NoZW1lID8gdHJ1ZSA6IGZhbHNlLFxuICAgICAgcGF0Y2g6IHtcbiAgICAgICAgZmllbGQ6ICduYW1lJyxcbiAgICAgICAgcGF0aDogZW50cnkgJiYgZW50cnkuaWQgPyBgJHt0aGlzLmFzc2V0LmJhc2VQYXRofS8ke2VudHJ5LmlkfWAgOiBudWxsLFxuICAgICAgICBtZXRhZGF0YToge1xuICAgICAgICAgIG9ycGhhbmVkOiAtMVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgbWF4bGVuZ3RoOiAyMCxcbiAgICAgIC8vIHZhbGlkYXRvcnM6IFsgVmFsaWRhdG9ycy5yZXF1aXJlZCBdLFxuICAgICAgLy8gbWluaW1hbDogdHJ1ZVxuICAgIH0gKTtcbiAgfVxuXG5cbiAgcHJpdmF0ZSBfaXNNdWx0aXBsZUFjdGl2ZUVudHJpZXMoKTogYm9vbGVhbntcbiAgICBsZXQgYWN0aXZlID0gMDtcbiAgICB0aGlzLnVpLmVudHJpZXMubWFwKCAoIGVudHJ5ICkgPT4ge1xuICAgICAgaWYoIFN0b3JhZ2VHZXR0ZXIoIGVudHJ5LCBbICdhY3RpdmUnLCAnY29udHJvbCcsICd2YWx1ZScgXSwgZmFsc2UgKSApe1xuICAgICAgICBhY3RpdmUrKztcbiAgICAgIH1cbiAgICB9ICk7XG4gICAgdGhpcy5sb2cuaW5mbyggYF9pc011bHRpcGxlQWN0aXZlRW50cmllc2AsIGFjdGl2ZSApO1xuICAgIHJldHVybiBhY3RpdmUgPiAxO1xuICB9XG5cblxuICBwcml2YXRlIF9kaXNhYmxlQWN0aXZlRW50cmllcygpe1xuICAgIHRoaXMubG9nLmluZm8oIGBfZGlzYWJsZUFjdGl2ZUVudHJpZXNgICk7XG4gICAgdGhpcy51aS5lbnRyaWVzLm1hcCggKCBlbnRyeTogRmllbGRFbnRyeVNlc3Npb24gKSA9PiB7XG4gICAgICBpZiggU3RvcmFnZUdldHRlciggZW50cnksIFsgJ2FjdGl2ZScsICdjb250cm9sJywgJ3ZhbHVlJyBdLCBmYWxzZSApICl7XG4gICAgICAgIGVudHJ5LmFjdGl2ZS5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgIGVudHJ5LmFjdGl2ZS5jb250cm9sLmRpc2FibGUoKTtcbiAgICAgIH1cbiAgICB9ICk7XG4gIH1cblxuXG4gIHByaXZhdGUgX2VuYWJsZUFjdGl2ZUVudHJpZXMoKXtcbiAgICB0aGlzLmxvZy5pbmZvKCBgX2VuYWJsZUFjdGl2ZUVudHJpZXNgICk7XG4gICAgdGhpcy51aS5lbnRyaWVzLm1hcCggKCBlbnRyeTogRmllbGRFbnRyeVNlc3Npb24gKSA9PiB7XG4gICAgICBpZiggU3RvcmFnZUdldHRlciggZW50cnksIFsgJ2FjdGl2ZScsICdjb250cm9sJywgJ3ZhbHVlJyBdLCBmYWxzZSApICl7XG4gICAgICAgIGVudHJ5LmFjdGl2ZS5kaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgICBlbnRyeS5hY3RpdmUuY29udHJvbC5lbmFibGUoKTtcbiAgICAgIH1cbiAgICB9ICk7XG4gIH1cbn1cblxuXG5leHBvcnQgaW50ZXJmYWNlIEZpZWxkRW50cnlTZXNzaW9uIHtcbiAgaWQ6IG51bWJlcjtcbiAgdHlwZTogU2VsZWN0Q29uZmlnO1xuICBkaXNwbGF5OiBJbnB1dENvbmZpZztcbiAgYWN0aXZlOiBTd2l0Y2hDb25maWc7XG4gIHRyYWl0cz86IHsgbmFtZTogc3RyaW5nLCBzZWxlY3RlZDogYm9vbGVhbiB9W107XG4gIGluY3JlbWVudDogbnVtYmVyO1xufVxuIl19