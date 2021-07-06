import { __awaiter } from "tslib";
import { Component, ElementRef, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { PopExtendDynamicComponent } from '../../../../../pop-extend-dynamic.component';
import { PopEntityService } from '../../../services/pop-entity.service';
import { PopFieldEditorService } from '../../pop-entity-field-editor.service';
import { PopRequestService } from '../../../../../services/pop-request.service';
import { FieldLabelParamComponent } from './params/field-label-param.component';
import { FieldTextareaParamComponent } from './params/field-textarea-param.component';
import { FieldRadioParamComponent } from './params/field-radio-param.component';
import { FieldSwitchParamComponent } from './params/field-switch-param.component';
import { FieldSelectParamComponent } from './params/field-select-param.component';
import { FieldInputParamComponent } from './params/field-input-param.component';
import { PopLog, ServiceInjector } from '../../../../../pop-common.model';
import { InputConfig } from '../../../../base/pop-field-item/pop-input/input-config.model';
import { CheckboxConfig } from '../../../../base/pop-field-item/pop-checkbox/checkbox-config.model';
import { PopDomService } from '../../../../../services/pop-dom.service';
import { CleanObject, DynamicSort, IsArray, IsDefined, IsObject, IsObjectThrowError, IsString, SnakeToPascal, TitleCase } from '../../../../../pop-common-utility';
import { FieldItemView, IsValidFieldPatchEvent } from '../../../pop-entity-utility';
import { Validators } from '@angular/forms';
import { FieldNumberParamComponent } from './params/field-number-param.component';
export class PopEntityFieldItemParamsComponent extends PopExtendDynamicComponent {
    constructor(el, _domRepo, _fieldRepo) {
        super();
        this.el = el;
        this._domRepo = _domRepo;
        this._fieldRepo = _fieldRepo;
        this.scheme = null;
        this.name = 'PopEntityFieldItemParamsComponent';
        this.asset = {
            field: undefined,
            viewParams: undefined,
            viewOptions: undefined,
            viewTemplate: undefined,
        };
        this.srv = {
            entity: ServiceInjector.get(PopEntityService),
            field: undefined,
            request: ServiceInjector.get(PopRequestService),
        };
        /**
         * This should transformValue and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
         */
        this.dom.configure = () => {
            return new Promise((resolve) => {
                // #1: Enforce a CoreConfig
                this.core = IsObjectThrowError(this.core, true, `${this.name}:configureDom: - this.core`) ? this.core : null;
                this.field = IsObjectThrowError(this.core.entity, true, ``) ? this.core.entity : null;
                // Set the outer height boundary of the component
                this._setHeight();
                // Set the template container for the field item list
                this.template.attach('container');
                // Set event Handlers
                this.dom.handler.core = (core, event) => this.coreEventHandler(event);
                this.dom.handler.bubble = (core, event) => this.onBubbleEvent(event);
                this.dom.state.showOptions = false;
                this.asset.viewParams = this.srv.field.getViewParams();
                this.asset.viewOptions = this.srv.field.getViewOptions();
                return resolve(true);
            });
        };
    }
    /**
     * We expect the core to represent a field
     * This component allows the user to configure the settings of the specific field attribute item
     * The FieldBuilderItemsComponent is responsible to communicate which field attribute item is active
     */
    ngOnInit() {
        super.ngOnInit();
    }
    /**
     * This handler handles any events that come up from the settings fields
     * @param event
     */
    onBubbleEvent(event) {
        PopLog.event(this.name, `onBubbleEvent`, event);
        if (event.type === 'field' && event.name === 'patch' && event.success) {
            if (IsDefined(event.config.name)) {
                const field = this.dom.active.item;
                const value = event.config.control.value;
                if (event.config.name === 'active') {
                    field.active = +value;
                }
                else if (IsObject(event.config.metadata, ['session'])) {
                    if (IsArray(event.config.metadata.session)) {
                        event.config.metadata.session.map((storage) => {
                            if (IsObject(storage)) {
                                storage[event.config.name] = value;
                            }
                        });
                    }
                    else if (IsObject(event.config.metadata.session)) {
                        event.config.metadata.session[event.config.name] = value;
                    }
                }
            }
            this.dom.setTimeout('update-preview', () => {
                this.core.channel.next({ source: this.name, type: 'component', name: 'update', target: 'PopEntityFieldPreviewComponent' });
            }, 250);
        }
    }
    /**
     * This is action that initiates setting up the preview
     */
    setActiveFieldItem() {
        if (this.dom.active.item) {
            this._setFieldItemOptions();
            this._setFieldItemParams();
        }
    }
    /**
     * This is action that initiates setting up the preview
     */
    setLabelSettings() {
        this.dom.active.item = null;
        this.dom.state.showOptions = false;
        this._configureLabelList().then((paramComponentList) => {
            this.template.render(paramComponentList, [], true);
        });
    }
    /**
     * The user can add entries in to the options that this field should use
     */
    addFieldItemOption() {
        this.dom.active.options.push({
            active: new CheckboxConfig({
                label: null,
                value: 1,
                bubble: true,
            }),
            name: new InputConfig({
                label: null,
                value: '',
                pattern: 'AlphaNumeric',
                bubble: true,
                maxlength: 128,
                minimal: true,
            }),
            value: new InputConfig({
                label: null,
                value: '',
                pattern: 'AlphaNumericNoSpace',
                bubble: true,
                maxlength: 128,
                minimal: true,
            }),
            sort: new InputConfig({
                label: null,
                minimal: true,
                value: this.dom.active.options.length,
                bubble: true,
            }),
        });
    }
    /**
     * The user can remove an existing option that this field is using
     * @param index
     */
    removeFieldItemOption(index) {
        if (index in this.dom.active.options) {
            this.dom.active.options.splice(index, 1);
            this.dom.active.options.map((option, i) => {
                option.sort.control.setValue(i);
            });
        }
        this.triggerSaveFieldOptions({ name: 'onChange' });
    }
    /**
     * This will allow the user to make consecutive changes with minimal api calls
     * @param event
     */
    triggerSaveFieldOptions(event) {
        if (event && (event.name === 'onKeyUp' || event.name === 'onChange')) {
            if (this.dom.delay.saveFieldOptions) {
                clearTimeout(this.dom.delay.saveFieldOptions);
            }
            this.dom.delay.saveFieldOptions = setTimeout(() => {
                this.saveFieldItemOptions();
            }, 500);
        }
    }
    /**
     * Reset the option values with the root source
     * @param event
     */
    onOptionSourceReset(event) {
        const field = this.dom.active.item;
        if (IsArray(field.source, true)) {
            field.options.values = [];
            field.source.map((item, index) => {
                field.options.values.push({
                    active: item.active ? +item.active : 1,
                    name: item.name ? item.name : item.label ? item.label : 'Item ' + (index + 1),
                    value: item.id ? item.id : item.value ? item.value : (index + 1),
                    sort: index
                });
            });
            this._setFieldItemOptions();
            this.triggerSaveFieldOptions({ name: 'onChange' });
        }
    }
    /**
     * This will store the option changes that the user makes
     */
    saveFieldItemOptions() {
        // #1: Create the payload structure
        this.dom.state.saving = true;
        const field = this.dom.active.item;
        const json = JSON.parse(JSON.stringify(field.options));
        json.values = [];
        let opt;
        this.dom.active.options.map((option) => {
            opt = {};
            Object.keys(option).map((key) => {
                opt[key] = option[key].control.value;
            });
            json.values.push(opt);
        });
        const ignore401 = null;
        const version = 1;
        const patch = {
            'options': json
        };
        // #2: Clear/Store the subscriber so that it can be ignored if needed
        this.dom.setSubscriber('options-api-call', this.srv.request.doPatch(`/fields/customs/${field.id}`, patch, version, ignore401).subscribe(res => {
            this.dom.active.item.options.values = json.values;
            this.dom.state.saving = false;
            // #3: Inform the FieldBuilderPreviewComponent to update the new settings
            this.core.channel.next({ source: this.name, type: 'component', name: 'update', target: 'PopEntityFieldPreviewComponent' });
            if (this.dom.subscriber.api)
                this.dom.subscriber.api.unsubscribe();
        }, err => {
            this.dom.state.saving = false;
        }));
    }
    /**
     * This allows the user to sort the list of options that this field uses
     * @param event
     */
    onOptionSortDrop(event) {
        moveItemInArray(this.dom.active.options, event.previousIndex, event.currentIndex);
        this.triggerSaveFieldOptions({ name: 'onChange' });
    }
    /**
     * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
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
     * This handler is for managing any cross-communication between components on the core channel
     * @param event
     */
    coreEventHandler(event) {
        this.log.event(`coreEventHandler`, event);
        if (event.type === 'component') {
            if (event.source === 'PopEntityFieldItemsComponent') {
                if (event.name === 'active-item') {
                    // #1: An event has triggered that the view needs to change the active item,  debounce this trigger so that this action does not get called on top of itself
                    this.dom.setTimeout('reset-view', () => {
                        this.dom.loading();
                        // #2: Transfer in the data package from the event
                        this.dom.active.item = event.data;
                        // this.asset.viewParams = event.data.config;
                        // this.asset.model = event.data.model;
                        // #3: Render the Active Item settings that are available
                        this.setActiveFieldItem();
                        setTimeout(() => {
                            this.dom.ready();
                        }, 0);
                    }, 100);
                }
                else if (event.name === 'label-settings') {
                    // #1: An event has triggered that the view needs to change the active item,  debounce this trigger so that this action does not get called on top of itself
                    if (this.dom.delay.reset)
                        clearTimeout(this.dom.delay.reset);
                    this.dom.delay.reset = setTimeout(() => {
                        this.dom.loading();
                        this.setLabelSettings();
                        setTimeout(() => {
                            this.dom.ready();
                        }, 0);
                    }, 100);
                }
            }
        }
        else if (IsValidFieldPatchEvent(this.core, event)) {
            this._setHeight();
        }
    }
    /**
     * This handles rendering the dynamic list of  param settings into the view
     * @param form
     * @param fieldItem
     * @param params
     */
    _setFieldItemParams() {
        if (IsObject(this.dom.active.item, true)) {
            this._configureParamList().then((paramComponentList) => {
                this.template.render(paramComponentList, [], true);
            });
        }
    }
    /**
     * This will return a list of all the inputs that the settings require
     * @param fieldItem
     * @param params
     */
    _configureParamList() {
        return new Promise((resolve) => {
            const paramComponentList = [];
            let component;
            let configInterface;
            const fieldItem = this.dom.active.item;
            const view = fieldItem.view;
            const rules = fieldItem.rules.sort(DynamicSort('name')).map((rule) => CleanObject(rule));
            const allowed = this.asset.viewParams[view.name];
            const group = this.field.fieldgroup.name;
            const itemCustomSettings = fieldItem.custom_setting;
            // ToDo: Put the custom Settings into the paramList
            // console.log('itemCustomSettings', itemCustomSettings);
            const isScheme = IsObject(this.scheme, ['id']) ? true : false;
            this.log.config(`activeItem`, {
                item: fieldItem,
                rules: rules,
                group: group,
                allowed: allowed,
                settings: itemCustomSettings,
                view: view
            });
            if (this.dom.active.item.name !== 'value') {
                let labelValue = fieldItem.label;
                if (isScheme) {
                    const mapping = this.srv.field.getSchemeFieldItemMapping(this.scheme, +this.field.id, this.dom.active.item.id);
                    if (IsString(mapping.label, true)) {
                        labelValue = mapping.label;
                    }
                }
                const display = {
                    type: this._getParamComponent('display'),
                    inputs: {
                        config: configInterface = Object.assign({
                            value: labelValue,
                            defaultValue: '',
                        }, {
                            label: 'Label',
                            name: 'label',
                            readonly: false,
                            required: true,
                            metadata: {
                                session: fieldItem
                            },
                            facade: isScheme,
                            patch: {
                                field: 'label',
                                path: `fields/customs/${fieldItem.id}`,
                                callback: isScheme ? (core, event) => __awaiter(this, void 0, void 0, function* () {
                                    const session = this.srv.field.getSchemeFieldItemMapping(this.scheme, +this.field.id, this.dom.active.item.id);
                                    session.label = event.config.control.value;
                                    yield this.srv.field.updateSchemeFieldMapping(this.scheme);
                                    // console.log( 'session', session );
                                    // console.log( 'facade', event.config.name, event.config.control.value );
                                }) : null,
                            }
                        })
                    }
                };
                paramComponentList.push(display);
            }
            if (group === 'selection') {
                const display = {
                    type: this._getParamComponent('view'),
                    inputs: {
                        config: configInterface = Object.assign({
                            value: view.id,
                            defaultValue: '',
                        }, {
                            label: 'Template View',
                            name: 'field_view_id',
                            readonly: false,
                            required: true,
                            options: {
                                defaultValue: 2,
                                values: [
                                    { value: 2, name: 'Select', sort_order: 0 },
                                    { value: 10, name: 'Radio', sort_order: 1 },
                                ]
                            },
                            metadata: {
                                session: fieldItem
                            },
                            patch: {
                                field: 'field_view_id',
                                path: `fields/${fieldItem.id}`,
                                callback: (core, event) => {
                                    const session = event.config.metadata.session;
                                    session.view = FieldItemView(event.response.view);
                                }
                            }
                        })
                    }
                };
                paramComponentList.push(display);
            }
            // if(!this.field.multiple){
            //   const helpText = <DynamicComponentInterface>{
            //     type: this._getParamComponent('helpText'),
            //     inputs: {
            //       config: configInterface = {
            //         ...{
            //           value: fieldItem.helpText ? fieldItem.helpText : null,
            //           defaultValue: '',
            //         },
            //         ...{
            //           label: 'Help Text',
            //           name: 'helpText',
            //           readonly: false,
            //           metadata: {
            //             session: fieldItem
            //           },
            //           patch: { field: 'helpText', path: `fields/customs/${fieldItem.id}` }
            //         }
            //       }
            //     }
            //   };
            //   paramComponentList.push(helpText);
            // }
            if (view.name in this.asset.viewParams) {
                const ruleSchemeSession = this.srv.field.getSchemeFieldItemSection(this.scheme, +this.field.id, this.dom.active.item.id, 'rule');
                rules.map((rule) => {
                    //           console.log('rule', rule);
                    let ruleValue = rule.value;
                    if (isScheme) {
                        if (IsDefined(ruleSchemeSession[rule.name])) {
                            ruleValue = ruleSchemeSession[rule.name];
                        }
                    }
                    if (rule.name in allowed) {
                        configInterface = Object.assign(Object.assign({}, rule), {
                            value: ruleValue,
                            name: rule.name,
                            label: TitleCase(SnakeToPascal(rule.name)),
                            metadata: { rule: rule },
                            facade: true,
                            patch: {
                                duration: 0,
                                field: ``,
                                path: ``,
                                callback: (core, event) => __awaiter(this, void 0, void 0, function* () {
                                    if (IsObject(this.scheme, true)) {
                                        if (IsObject(ruleSchemeSession)) {
                                            ruleSchemeSession[rule.name] = event.config.control.value;
                                            yield this.srv.field.updateSchemeFieldMapping(this.scheme);
                                        }
                                    }
                                    else {
                                        this.srv.field.storeFieldItemRule(core, fieldItem, event).then(() => true);
                                    }
                                })
                            }
                        });
                        if (IsObject(rule.options, true)) {
                            configInterface.options = rule.options;
                        }
                        component = {
                            type: this._getParamComponent(rule.name),
                            inputs: {
                                config: configInterface,
                            }
                        };
                        paramComponentList.push(component);
                    }
                });
            }
            if (IsObject(itemCustomSettings, true)) {
                Object.keys(itemCustomSettings).map((settingName) => {
                    const setting = itemCustomSettings[settingName];
                    // console.log('setting', setting);
                    if (setting.type !== 'model') {
                        paramComponentList.push(this.srv.field.getCustomSettingComponent(this.core, this.core.entity, setting, this.scheme));
                    }
                });
            }
            resolve(paramComponentList);
        });
    }
    /**
     * This will return a list of all the inputs that the label settings require
     * @param fieldItem
     * @param params
     */
    _configureLabelList() {
        return new Promise((resolve) => {
            // const paramComponentList: DynamicComponentInterface[] = [];
            //
            // const values = <DynamicComponentInterface>{
            //   type: PopEntityFieldLabelComponent,
            //   inputs: {
            //     core: this.core
            //   }
            // };
            // paramComponentList.push(values);
            //
            //
            resolve([]);
        });
    }
    _setHeight() {
        this.dom.overhead = 125;
        // this.dom.height.outer = +this.dom.repo.position[ this.position ].height - 121;
        // const field = <FieldInterface>this.core.entity;
        // if( false && field.multiple ){
        //   this.dom.height.outer -= 20;
        //   this.dom.height.outer -= ( +field.multiple_min * 60 );
        // } // values box
        //
        // if( this.dom.height.outer < 400 ) this.dom.height.outer = 400;
        // this.dom.height.outer -= 2;
        this.dom.setHeight(399, this.dom.overhead);
    }
    /**
     * Return the the field input component that should be used for the type of setting param;
     * @param form
     */
    _getParamComponent(form) {
        switch (form) {
            case 'label':
                return FieldLabelParamComponent;
                break;
            case 'display':
            case 'api':
            case 'sort_top':
            case 'regex':
            case 'sort':
            case 'helpText':
                return FieldInputParamComponent;
                break;
            case 'select':
            case 'mask':
            case 'pattern':
            case 'validation':
            case 'transformation':
                return FieldSelectParamComponent;
                break;
            case 'hidden':
            case 'visible':
            case 'disabled':
            case 'readonly':
            case 'required':
                return FieldSwitchParamComponent;
                break;
            case 'layout':
                return FieldRadioParamComponent;
                break;
            case 'minlength':
            case 'maxlength':
                return FieldNumberParamComponent;
            case 'metadata':
                return FieldTextareaParamComponent;
                break;
            case 'view':
                return FieldRadioParamComponent;
                break;
            default:
                return FieldLabelParamComponent;
        }
    }
    /**
     * This will make sure the options will get set up properly if the active items uses them
     * @param form
     * @param options
     * @param params
     */
    _setFieldItemOptions() {
        this.dom.state.showOptions = false;
        const field = this.dom.active.item;
        const form = field.view ? field.view.name : null;
        if (!form)
            PopLog.warn(this.name, `_setFieldItemOptions: Invalid Form`, field);
        this.dom.active.options = [];
        if (form && form in this.asset.viewOptions) {
            // if( field.options.fixed ){
            //   field.options.enum = true;
            // }
            if (IsArray(field.source, true)) {
                field.options.enum = true;
                this.dom.state.isOptionSource = true;
            }
            if (!(IsObject(field.options, ['values'])) && !(field.source)) {
                field.options = this.asset.viewOptions[form];
            }
            if (IsObject(field.options, ['values']) && Array.isArray(field.options.values)) {
                field.options.values.map((option, index) => {
                    option.name = option.name ? String(option.name) : 'Item ' + (index + 1);
                    option.value = option.id ? String(option.id) : option.value ? String(option.value) : String((index + 1));
                    option.sort = index;
                    if (typeof option.active !== 'boolean')
                        option.active = true;
                    this.dom.active.options.push({
                        active: new CheckboxConfig({
                            label: null,
                            value: +option.active,
                            bubble: true,
                        }),
                        name: new InputConfig({
                            label: null,
                            value: option.name,
                            transformation: 'title',
                            bubble: this.dom.state.isOptionSource ? false : true,
                            pattern: 'AlphaNumeric',
                            validators: [Validators.required],
                            maxlength: 32,
                            readonly: this.dom.state.isOptionSource ? true : false,
                        }),
                        value: new InputConfig({
                            label: null,
                            value: option.value,
                            bubble: field.options.enum ? false : true,
                            validators: [Validators.required],
                            pattern: 'AlphaNumericNoSpace',
                            transformation: 'lower',
                            maxlength: 32,
                            readonly: field.options.enum ? true : false,
                        }),
                        sort: new InputConfig({
                            label: null,
                            value: option.sort || 0,
                            bubble: true,
                        }),
                    });
                });
                this.dom.state.showOptions = true;
            }
        }
    }
}
PopEntityFieldItemParamsComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-field-builder-items-params',
                template: "<div class=\"entity-field-item-settings-container\" [style.height.px]=dom.height.outer>\n  <div class=\"entity-field-editor-section-wrapper\">\n    <div class=\"field-builder-config-content\" [style.height.px]=\"dom.height.outer\">\n      <ng-container #container></ng-container>\n      <div class=\"field-builder-options-content\" *ngIf=\"dom.state.showOptions\" [style.maxHeight.px]=\"dom.height.inner\">\n        <div class=\"field-builder-source-header\">\n          <label>Options</label>\n          <lib-pop-button\n            *ngIf=\"dom.state.isOptionSource\"\n            [config]=\"{value:'Reset', size: 24, text: 12, color: 'default', bubble: true, event: 'reset-source'}\"\n            (events)=\"onOptionSourceReset($event);\"\n          ></lib-pop-button>\n        </div>\n        <mat-divider *ngIf=\"dom.state.showOptions\"></mat-divider>\n        <div class=\"field-builder-item-options-headers\">\n          <div class=\"field-builder-item-options-sort\">\n            Sort\n          </div>\n          <div class=\"field-builder-item-options-active\">\n            Active\n          </div>\n          <div class=\"field-builder-item-name-input field-builder-mar-rgt\">\n            <label>Name</label>\n          </div>\n          <div class=\"field-builder-item-value-input\">\n            Value\n          </div>\n          <div class=\"field-builder-item-options-icon\" [ngClass]=\"{'sw-hidden':dom.active.item?.options.enum}\">\n            <i class=\"material-icons field-builder-item-options-new sw-pointer sw-hover\" matTooltip=\"Add\"\n               (click)=\"addFieldItemOption()\">\n              add\n            </i>\n          </div>\n        </div>\n        <mat-divider></mat-divider>\n        <div class=\"field-builder-item-options-loader\">\n          <mat-progress-bar *ngIf=\"dom.state.saving\" mode=\"indeterminate\"></mat-progress-bar>\n        </div>\n        <div class=\"field-builder-item-options-container\" cdkDropList (cdkDropListDropped)=\"onOptionSortDrop($event)\">\n          <div class=\"field-builder-item-options-headers\" *ngFor=\"let option of dom.active.options; let i = index;\" cdkDrag cdkDragLockAxis=\"y\" cdkDragBoundary=\".field-builder-item-options-container\">\n            <div class=\"field-builder-item-options-sort\" [ngClass]=\"{'sw-hidden':dom.active.item?.options.fixed}\">\n              <i class=\"material-icons\" cdkDragHandle>\n                drag_indicator\n              </i>\n            </div>\n            <div class=\"field-builder-item-options-active\" [ngClass]=\"{'sw-hidden':dom.active.item?.options.fixed}\">\n              <lib-pop-checkbox (events)=\"triggerSaveFieldOptions($event);\" [config]=\"option.active\"></lib-pop-checkbox>\n            </div>\n            <div class=\"field-builder-item-name-input field-builder-mar-rgt\">\n              <lib-pop-input [config]=\"option.name\" (events)=\"triggerSaveFieldOptions($event);\"></lib-pop-input>\n            </div>\n            <div class=\"field-builder-item-value-input\">\n              <lib-pop-input [config]=\"option.value\" (events)=\"triggerSaveFieldOptions($event);\"></lib-pop-input>\n            </div>\n            <div class=\"field-builder-item-options-icon\" matTooltip=\"Remove\" [ngClass]=\"{'sw-hidden':dom.active.item?.options.enum}\">\n              <i class=\"material-icons field-builder-item-options-new sw-pointer sw-hover\"\n                 (click)=\"removeFieldItemOption(i)\">\n                remove\n              </i>\n            </div>\n            <div class=\"field-builder-item-options-headers\" *cdkDragPreview></div>\n          </div>\n        </div>\n\n      </div>\n    </div>\n  </div>\n</div>\n",
                styles: [".entity-field-editor-header{display:flex;flex-direction:column;height:97px}.entity-field-editor-header-section{position:relative;width:100%;box-sizing:border-box;height:30px;clear:both}.entity-field-editor-container{min-height:100px;position:relative}.entity-field-editor-border{border:1px solid var(--border)}.entity-field-editor-section-header{position:relative;display:flex;flex-direction:row;height:40px;padding:0 5px 0 10px;align-items:center;justify-content:space-between;font-size:1em;font-weight:700;clear:both;box-sizing:border-box;background:var(--darken02)}.entity-field-editor-section-header-helper-icon{width:20px;height:20px;font-size:1em;z-index:2}.entity-field-editor-active-selection{padding-left:0!important;border-left:5px solid var(--primary)}.entity-field-editor-active-config{border-left:5px solid var(--primary)}.entity-field-item-settings-container{min-height:100px;position:relative;border:1px solid var(--border);border-left:none;min-width:200px}.field-builder-config-row{position:relative;height:30px;max-height:30px;min-width:200px;font-size:20px;line-height:20px;flex:1 1 100%;flex-direction:row;margin:4px 0 4px 10px;align-items:center;justify-content:flex-start;clear:both}.field-builder-config-content{padding:5px 15px 10px;box-sizing:border-box;display:flex;flex-flow:column;align-items:stretch;overflow-y:scroll;overflow-x:hidden}.field-builder-options-content{flex:1;flex-grow:1;flex-direction:column;box-sizing:border-box}.field-builder-source-header{position:relative;width:100%;display:flex;align-items:center;justify-content:space-between;box-sizing:border-box;height:35px;margin-top:10px;clear:both}.field-builder-item-options-new{float:right}.field-builder-item-options-headers{display:flex;align-items:center;justify-content:flex-start;margin-top:2px;height:32px}.field-builder-item-options-active{display:flex;width:55px;text-align:center;align-items:center;justify-content:center}.field-builder-item-options-loader{position:relative;display:block;width:100%;height:2px;clear:both;overflow:hidden;margin-bottom:2px}.field-builder-item-options-input{display:flex;width:25%;flex-grow:1}.field-builder-item-options-input lib-pop-input{width:100%}.field-builder-item-name-input{display:flex;width:40%;flex-grow:1}.field-builder-item-name-input lib-pop-input{width:100%}.field-builder-item-value-input{display:flex;width:20%;flex-grow:1}.field-builder-item-value-input lib-pop-input{width:100%}.field-builder-item-options-container{flex:1;flex-direction:column;padding:8px 0;box-sizing:border-box}.field-builder-item-options-sort{display:flex;width:10%;align-items:center;justify-content:center}.field-builder-item-options-sort i{margin-top:var(--gap-xs)}.field-builder-item-options-icon{display:flex;width:40px;align-items:center;justify-content:center}.field-builder-preview-content{position:relative;margin-top:5px;padding:5px}.field-builder-state-selector-wrapper{position:absolute;right:5px;top:-5px;width:50%;height:30px;font-size:12px}.field-builder-mar-rgt{margin-right:5px}:host ::ng-deep .field-builder-param-container{position:relative;display:flex;flex-direction:row;box-sizing:border-box;-moz-box-sizing:border-box;align-items:center;justify-content:flex-start;margin-bottom:4px}:host ::ng-deep .field-builder-param-title-container{display:flex;padding:0 0 0 2%;pointer-events:all;align-items:center;width:30%;max-width:30%;overflow:hidden;box-sizing:border-box;-moz-box-sizing:border-box}:host ::ng-deep .field-builder-param-title{font-size:16px;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}:host ::ng-deep .field-builder-param-config-container{display:flex;padding:0 5%;pointer-events:all;width:70%;max-width:70%;overflow:hidden;box-sizing:border-box;-moz-box-sizing:border-box;overflow-y:scroll;overflow-x:hidden}:host ::ng-deep .field-builder-param-reset-box{position:relative;display:block;margin:0;padding:0;width:100%}:host ::ng-deep .field-builder-param-reset-box .pop-input-container,:host ::ng-deep .field-builder-param-reset-box .pop-select-container,:host ::ng-deep .field-builder-param-reset-box .pop-textarea-container{margin:2px 0}:host ::ng-deep .field-builder-param-spacer-xs{display:flex;flex-grow:1;height:5px;padding:0 1%}:host ::ng-deep .field-builder-param-spacer-sm{display:flex;flex-grow:1;height:10px;padding:0 1%}:host ::ng-deep .field-builder-param-spacer-md{display:flex;flex-grow:1;height:20px;padding:0 1%}:host ::ng-deep .field-builder-param-spacer{display:flex;flex-grow:1;height:30px;padding:0 1%}:host ::ng-deep .field-builder-item-options-container .mat-form-field-infix{width:auto;padding:6px 0!important;margin-top:6px!important;border:0!important;font-size:.8em}:host ::ng-deep .field-builder-item-options-active .pop-checkbox-container{margin:2px;min-height:0;height:20px;margin-top:var(--gap-xs)}:host ::ng-deep .field-builder-item-options-container .pop-input-container{margin:5px 2px 0;min-height:20px}:host ::ng-deep .field-builder-item-options-container .pop-input-feedback-container{margin-top:-4px}.cdk-drag-preview{box-sizing:border-box;border-radius:4px;justify-content:center;align-items:center;box-shadow:0 5px 5px -3px rgba(0,0,0,.2),0 8px 10px 1px rgba(0,0,0,.14),0 3px 14px 2px rgba(0,0,0,.12)}.cdk-drag-placeholder{opacity:.6;background:rgba(0,0,0,.1)}.cdk-drag-animating{transition:transform .25s cubic-bezier(0,0,.2,1)}.field-builder-settings-header{padding-top:3px;position:relative;height:35px}:host ::ng-deep .mat-tab-link{height:35px;padding:5px;min-width:100px}"]
            },] }
];
PopEntityFieldItemParamsComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: PopDomService },
    { type: PopFieldEditorService }
];
PopEntityFieldItemParamsComponent.propDecorators = {
    field: [{ type: Input }],
    scheme: [{ type: Input }],
    container: [{ type: ViewChild, args: ['container', { read: ViewContainerRef, static: true },] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS1maWVsZC1pdGVtLXBhcmFtcy5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9lbnRpdHkvcG9wLWVudGl0eS1maWVsZC1lZGl0b3IvcG9wLWVudGl0eS1maWVsZC1zZXR0aW5ncy9wb3AtZW50aXR5LWZpZWxkLWl0ZW0tcGFyYW1zL3BvcC1lbnRpdHktZmllbGQtaXRlbS1wYXJhbXMuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQXFCLFNBQVMsRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUM3RyxPQUFPLEVBQWUsZUFBZSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDdEUsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sNkNBQTZDLENBQUM7QUFDeEYsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFDeEUsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFDOUUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sNkNBQTZDLENBQUM7QUFDaEYsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFDaEYsT0FBTyxFQUFFLDJCQUEyQixFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFDdEYsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFDaEYsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFDbEYsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFDbEYsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFDaEYsT0FBTyxFQU9M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LEtBQUssRUFBRSxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUM7NEJBQ3ZCLE1BQU0sRUFBRSxJQUFJO3lCQUNiLENBQUU7cUJBQ0osQ0FBRSxDQUFDO2dCQUNOLENBQUMsQ0FBRSxDQUFDO2dCQUNKLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7YUFDbkM7U0FDRjtJQUNILENBQUM7OztZQS9yQkYsU0FBUyxTQUFFO2dCQUNWLFFBQVEsRUFBRSxnQ0FBZ0M7Z0JBQzFDLG1uSEFBNEQ7O2FBRTdEOzs7WUE3Q21CLFVBQVU7WUF3QnJCLGFBQWE7WUFwQmIscUJBQXFCOzs7b0JBMkMzQixLQUFLO3FCQUNMLEtBQUs7d0JBQ0wsU0FBUyxTQUFFLFdBQVcsRUFBRSxFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBJbnB1dCwgT25EZXN0cm95LCBPbkluaXQsIFZpZXdDaGlsZCwgVmlld0NvbnRhaW5lclJlZiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQ2RrRHJhZ0Ryb3AsIG1vdmVJdGVtSW5BcnJheSB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9kcmFnLWRyb3AnO1xuaW1wb3J0IHsgUG9wRXh0ZW5kRHluYW1pY0NvbXBvbmVudCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3BvcC1leHRlbmQtZHluYW1pYy5jb21wb25lbnQnO1xuaW1wb3J0IHsgUG9wRW50aXR5U2VydmljZSB9IGZyb20gJy4uLy4uLy4uL3NlcnZpY2VzL3BvcC1lbnRpdHkuc2VydmljZSc7XG5pbXBvcnQgeyBQb3BGaWVsZEVkaXRvclNlcnZpY2UgfSBmcm9tICcuLi8uLi9wb3AtZW50aXR5LWZpZWxkLWVkaXRvci5zZXJ2aWNlJztcbmltcG9ydCB7IFBvcFJlcXVlc3RTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vc2VydmljZXMvcG9wLXJlcXVlc3Quc2VydmljZSc7XG5pbXBvcnQgeyBGaWVsZExhYmVsUGFyYW1Db21wb25lbnQgfSBmcm9tICcuL3BhcmFtcy9maWVsZC1sYWJlbC1wYXJhbS5jb21wb25lbnQnO1xuaW1wb3J0IHsgRmllbGRUZXh0YXJlYVBhcmFtQ29tcG9uZW50IH0gZnJvbSAnLi9wYXJhbXMvZmllbGQtdGV4dGFyZWEtcGFyYW0uY29tcG9uZW50JztcbmltcG9ydCB7IEZpZWxkUmFkaW9QYXJhbUNvbXBvbmVudCB9IGZyb20gJy4vcGFyYW1zL2ZpZWxkLXJhZGlvLXBhcmFtLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBGaWVsZFN3aXRjaFBhcmFtQ29tcG9uZW50IH0gZnJvbSAnLi9wYXJhbXMvZmllbGQtc3dpdGNoLXBhcmFtLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBGaWVsZFNlbGVjdFBhcmFtQ29tcG9uZW50IH0gZnJvbSAnLi9wYXJhbXMvZmllbGQtc2VsZWN0LXBhcmFtLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBGaWVsZElucHV0UGFyYW1Db21wb25lbnQgfSBmcm9tICcuL3BhcmFtcy9maWVsZC1pbnB1dC1wYXJhbS5jb21wb25lbnQnO1xuaW1wb3J0IHtcbiAgQ29yZUNvbmZpZyxcbiAgRGljdGlvbmFyeSxcbiAgRHluYW1pY0NvbXBvbmVudEludGVyZmFjZSxcbiAgRmllbGRDb25maWcsXG4gIEZpZWxkSW50ZXJmYWNlLFxuICBQb3BCYXNlRXZlbnRJbnRlcmZhY2UsXG4gIFBvcExvZyxcbiAgU2VydmljZUluamVjdG9yXG59IGZyb20gJy4uLy4uLy4uLy4uLy4uL3BvcC1jb21tb24ubW9kZWwnO1xuaW1wb3J0IHsgSW5wdXRDb25maWcgfSBmcm9tICcuLi8uLi8uLi8uLi9iYXNlL3BvcC1maWVsZC1pdGVtL3BvcC1pbnB1dC9pbnB1dC1jb25maWcubW9kZWwnO1xuaW1wb3J0IHsgQ2hlY2tib3hDb25maWcgfSBmcm9tICcuLi8uLi8uLi8uLi9iYXNlL3BvcC1maWVsZC1pdGVtL3BvcC1jaGVja2JveC9jaGVja2JveC1jb25maWcubW9kZWwnO1xuaW1wb3J0IHsgUG9wRG9tU2VydmljZSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3NlcnZpY2VzL3BvcC1kb20uc2VydmljZSc7XG5pbXBvcnQge1xuICBDbGVhbk9iamVjdCxcbiAgRHluYW1pY1NvcnQsXG4gIElzQXJyYXksXG4gIElzRGVmaW5lZCxcbiAgSXNPYmplY3QsXG4gIElzT2JqZWN0VGhyb3dFcnJvciwgSXNTdHJpbmcsXG4gIFNuYWtlVG9QYXNjYWwsXG4gIFRpdGxlQ2FzZVxufSBmcm9tICcuLi8uLi8uLi8uLi8uLi9wb3AtY29tbW9uLXV0aWxpdHknO1xuaW1wb3J0IHsgRmllbGRJdGVtVmlldywgSXNWYWxpZEZpZWxkUGF0Y2hFdmVudCB9IGZyb20gJy4uLy4uLy4uL3BvcC1lbnRpdHktdXRpbGl0eSc7XG5pbXBvcnQgeyBWYWxpZGF0b3JzIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHsgRmllbGROdW1iZXJQYXJhbUNvbXBvbmVudCB9IGZyb20gJy4vcGFyYW1zL2ZpZWxkLW51bWJlci1wYXJhbS5jb21wb25lbnQnO1xuaW1wb3J0IHsgRW50aXR5U2NoZW1lU2VjdGlvbkludGVyZmFjZSB9IGZyb20gJy4uLy4uLy4uL3BvcC1lbnRpdHktc2NoZW1lL3BvcC1lbnRpdHktc2NoZW1lLm1vZGVsJztcblxuXG5AQ29tcG9uZW50KCB7XG4gIHNlbGVjdG9yOiAnbGliLWZpZWxkLWJ1aWxkZXItaXRlbXMtcGFyYW1zJyxcbiAgdGVtcGxhdGVVcmw6ICcuL3BvcC1lbnRpdHktZmllbGQtaXRlbS1wYXJhbXMuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsgJy4vcG9wLWVudGl0eS1maWVsZC1pdGVtLXBhcmFtcy5jb21wb25lbnQuc2NzcycgXSxcbn0gKVxuZXhwb3J0IGNsYXNzIFBvcEVudGl0eUZpZWxkSXRlbVBhcmFtc0NvbXBvbmVudCBleHRlbmRzIFBvcEV4dGVuZER5bmFtaWNDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG4gIEBJbnB1dCgpIGZpZWxkOiBGaWVsZEludGVyZmFjZTtcbiAgQElucHV0KCkgc2NoZW1lOiBFbnRpdHlTY2hlbWVTZWN0aW9uSW50ZXJmYWNlID0gbnVsbDtcbiAgQFZpZXdDaGlsZCggJ2NvbnRhaW5lcicsIHsgcmVhZDogVmlld0NvbnRhaW5lclJlZiwgc3RhdGljOiB0cnVlIH0gKSBwcml2YXRlIGNvbnRhaW5lcjtcbiAgcHVibGljIG5hbWUgPSAnUG9wRW50aXR5RmllbGRJdGVtUGFyYW1zQ29tcG9uZW50JztcblxuICBwcm90ZWN0ZWQgYXNzZXQgPSB7XG4gICAgZmllbGQ6IDxGaWVsZENvbmZpZz51bmRlZmluZWQsXG4gICAgdmlld1BhcmFtczogPERpY3Rpb25hcnk8YW55Pj51bmRlZmluZWQsXG4gICAgdmlld09wdGlvbnM6IDxEaWN0aW9uYXJ5PGFueT4+dW5kZWZpbmVkLFxuICAgIHZpZXdUZW1wbGF0ZTogPERpY3Rpb25hcnk8YW55Pj51bmRlZmluZWQsXG4gIH07XG5cbiAgcHJvdGVjdGVkIHNydiA9IHtcbiAgICBlbnRpdHk6IDxQb3BFbnRpdHlTZXJ2aWNlPlNlcnZpY2VJbmplY3Rvci5nZXQoIFBvcEVudGl0eVNlcnZpY2UgKSxcbiAgICBmaWVsZDogPFBvcEZpZWxkRWRpdG9yU2VydmljZT51bmRlZmluZWQsXG4gICAgcmVxdWVzdDogPFBvcFJlcXVlc3RTZXJ2aWNlPlNlcnZpY2VJbmplY3Rvci5nZXQoIFBvcFJlcXVlc3RTZXJ2aWNlICksXG4gIH07XG5cblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgZWw6IEVsZW1lbnRSZWYsXG4gICAgcHJvdGVjdGVkIF9kb21SZXBvOiBQb3BEb21TZXJ2aWNlLFxuICAgIHByb3RlY3RlZCBfZmllbGRSZXBvOiBQb3BGaWVsZEVkaXRvclNlcnZpY2UsXG4gICl7XG4gICAgc3VwZXIoKTtcblxuICAgIC8qKlxuICAgICAqIFRoaXMgc2hvdWxkIHRyYW5zZm9ybVZhbHVlIGFuZCB2YWxpZGF0ZSB0aGUgZGF0YS4gVGhlIHZpZXcgc2hvdWxkIHRyeSB0byBvbmx5IHVzZSBkYXRhIHRoYXQgaXMgc3RvcmVkIG9uIHVpIHNvIHRoYXQgaXQgaXMgbm90IGRlcGVuZGVudCBvbiB0aGUgc3RydWN0dXJlIG9mIGRhdGEgdGhhdCBjb21lcyBmcm9tIG90aGVyIHNvdXJjZXMuIFRoZSB1aSBzaG91bGQgYmUgdGhlIHNvdXJjZSBvZiB0cnV0aCBoZXJlLlxuICAgICAqL1xuICAgIHRoaXMuZG9tLmNvbmZpZ3VyZSA9ICgpOiBQcm9taXNlPGJvb2xlYW4+ID0+IHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSggKCByZXNvbHZlICkgPT4ge1xuICAgICAgICAvLyAjMTogRW5mb3JjZSBhIENvcmVDb25maWdcbiAgICAgICAgdGhpcy5jb3JlID0gSXNPYmplY3RUaHJvd0Vycm9yKCB0aGlzLmNvcmUsIHRydWUsIGAke3RoaXMubmFtZX06Y29uZmlndXJlRG9tOiAtIHRoaXMuY29yZWAgKSA/IHRoaXMuY29yZSA6IG51bGw7XG4gICAgICAgIHRoaXMuZmllbGQgPSBJc09iamVjdFRocm93RXJyb3IoIHRoaXMuY29yZS5lbnRpdHksIHRydWUsIGBgICkgPyA8RmllbGRJbnRlcmZhY2U+dGhpcy5jb3JlLmVudGl0eSA6IG51bGw7XG4gICAgICAgIC8vIFNldCB0aGUgb3V0ZXIgaGVpZ2h0IGJvdW5kYXJ5IG9mIHRoZSBjb21wb25lbnRcbiAgICAgICAgdGhpcy5fc2V0SGVpZ2h0KCk7XG5cblxuICAgICAgICAvLyBTZXQgdGhlIHRlbXBsYXRlIGNvbnRhaW5lciBmb3IgdGhlIGZpZWxkIGl0ZW0gbGlzdFxuICAgICAgICB0aGlzLnRlbXBsYXRlLmF0dGFjaCggJ2NvbnRhaW5lcicgKTtcblxuICAgICAgICAvLyBTZXQgZXZlbnQgSGFuZGxlcnNcbiAgICAgICAgdGhpcy5kb20uaGFuZGxlci5jb3JlID0gKCBjb3JlOiBDb3JlQ29uZmlnLCBldmVudDogUG9wQmFzZUV2ZW50SW50ZXJmYWNlICkgPT4gdGhpcy5jb3JlRXZlbnRIYW5kbGVyKCBldmVudCApO1xuICAgICAgICB0aGlzLmRvbS5oYW5kbGVyLmJ1YmJsZSA9ICggY29yZTogQ29yZUNvbmZpZywgZXZlbnQ6IFBvcEJhc2VFdmVudEludGVyZmFjZSApID0+IHRoaXMub25CdWJibGVFdmVudCggZXZlbnQgKTtcblxuICAgICAgICB0aGlzLmRvbS5zdGF0ZS5zaG93T3B0aW9ucyA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMuYXNzZXQudmlld1BhcmFtcyA9IHRoaXMuc3J2LmZpZWxkLmdldFZpZXdQYXJhbXMoKTtcbiAgICAgICAgdGhpcy5hc3NldC52aWV3T3B0aW9ucyA9IHRoaXMuc3J2LmZpZWxkLmdldFZpZXdPcHRpb25zKCk7XG5cblxuICAgICAgICByZXR1cm4gcmVzb2x2ZSggdHJ1ZSApO1xuICAgICAgfSApO1xuICAgIH07XG4gIH1cblxuXG4gIC8qKlxuICAgKiBXZSBleHBlY3QgdGhlIGNvcmUgdG8gcmVwcmVzZW50IGEgZmllbGRcbiAgICogVGhpcyBjb21wb25lbnQgYWxsb3dzIHRoZSB1c2VyIHRvIGNvbmZpZ3VyZSB0aGUgc2V0dGluZ3Mgb2YgdGhlIHNwZWNpZmljIGZpZWxkIGF0dHJpYnV0ZSBpdGVtXG4gICAqIFRoZSBGaWVsZEJ1aWxkZXJJdGVtc0NvbXBvbmVudCBpcyByZXNwb25zaWJsZSB0byBjb21tdW5pY2F0ZSB3aGljaCBmaWVsZCBhdHRyaWJ1dGUgaXRlbSBpcyBhY3RpdmVcbiAgICovXG4gIG5nT25Jbml0KCl7XG4gICAgc3VwZXIubmdPbkluaXQoKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgaGFuZGxlciBoYW5kbGVzIGFueSBldmVudHMgdGhhdCBjb21lIHVwIGZyb20gdGhlIHNldHRpbmdzIGZpZWxkc1xuICAgKiBAcGFyYW0gZXZlbnRcbiAgICovXG4gIG9uQnViYmxlRXZlbnQoIGV2ZW50OiBQb3BCYXNlRXZlbnRJbnRlcmZhY2UgKXtcbiAgICBQb3BMb2cuZXZlbnQoIHRoaXMubmFtZSwgYG9uQnViYmxlRXZlbnRgLCBldmVudCApO1xuICAgIGlmKCBldmVudC50eXBlID09PSAnZmllbGQnICYmIGV2ZW50Lm5hbWUgPT09ICdwYXRjaCcgJiYgZXZlbnQuc3VjY2VzcyApe1xuICAgICAgaWYoIElzRGVmaW5lZCggZXZlbnQuY29uZmlnLm5hbWUgKSApe1xuICAgICAgICBjb25zdCBmaWVsZCA9IHRoaXMuZG9tLmFjdGl2ZS5pdGVtO1xuICAgICAgICBjb25zdCB2YWx1ZSA9IGV2ZW50LmNvbmZpZy5jb250cm9sLnZhbHVlO1xuICAgICAgICBpZiggZXZlbnQuY29uZmlnLm5hbWUgPT09ICdhY3RpdmUnICl7XG4gICAgICAgICAgZmllbGQuYWN0aXZlID0gK3ZhbHVlO1xuICAgICAgICB9ZWxzZSBpZiggSXNPYmplY3QoIGV2ZW50LmNvbmZpZy5tZXRhZGF0YSwgWyAnc2Vzc2lvbicgXSApICl7XG4gICAgICAgICAgaWYoIElzQXJyYXkoIGV2ZW50LmNvbmZpZy5tZXRhZGF0YS5zZXNzaW9uICkgKXtcbiAgICAgICAgICAgIGV2ZW50LmNvbmZpZy5tZXRhZGF0YS5zZXNzaW9uLm1hcCggKCBzdG9yYWdlICkgPT4ge1xuICAgICAgICAgICAgICBpZiggSXNPYmplY3QoIHN0b3JhZ2UgKSApe1xuICAgICAgICAgICAgICAgIHN0b3JhZ2VbIGV2ZW50LmNvbmZpZy5uYW1lIF0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSApO1xuICAgICAgICAgIH1lbHNlIGlmKCBJc09iamVjdCggZXZlbnQuY29uZmlnLm1ldGFkYXRhLnNlc3Npb24gKSApe1xuICAgICAgICAgICAgZXZlbnQuY29uZmlnLm1ldGFkYXRhLnNlc3Npb25bIGV2ZW50LmNvbmZpZy5uYW1lIF0gPSB2YWx1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuZG9tLnNldFRpbWVvdXQoICd1cGRhdGUtcHJldmlldycsICgpID0+IHtcbiAgICAgICAgdGhpcy5jb3JlLmNoYW5uZWwubmV4dCggeyBzb3VyY2U6IHRoaXMubmFtZSwgdHlwZTogJ2NvbXBvbmVudCcsIG5hbWU6ICd1cGRhdGUnLCB0YXJnZXQ6ICdQb3BFbnRpdHlGaWVsZFByZXZpZXdDb21wb25lbnQnIH0gKTtcbiAgICAgIH0sIDI1MCApO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgaXMgYWN0aW9uIHRoYXQgaW5pdGlhdGVzIHNldHRpbmcgdXAgdGhlIHByZXZpZXdcbiAgICovXG4gIHNldEFjdGl2ZUZpZWxkSXRlbSgpOiB2b2lke1xuICAgIGlmKCB0aGlzLmRvbS5hY3RpdmUuaXRlbSApe1xuICAgICAgdGhpcy5fc2V0RmllbGRJdGVtT3B0aW9ucygpO1xuICAgICAgdGhpcy5fc2V0RmllbGRJdGVtUGFyYW1zKCk7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogVGhpcyBpcyBhY3Rpb24gdGhhdCBpbml0aWF0ZXMgc2V0dGluZyB1cCB0aGUgcHJldmlld1xuICAgKi9cbiAgc2V0TGFiZWxTZXR0aW5ncygpOiB2b2lke1xuICAgIHRoaXMuZG9tLmFjdGl2ZS5pdGVtID0gbnVsbDtcbiAgICB0aGlzLmRvbS5zdGF0ZS5zaG93T3B0aW9ucyA9IGZhbHNlO1xuICAgIHRoaXMuX2NvbmZpZ3VyZUxhYmVsTGlzdCgpLnRoZW4oICggcGFyYW1Db21wb25lbnRMaXN0OiBEeW5hbWljQ29tcG9uZW50SW50ZXJmYWNlW10gKSA9PiB7XG4gICAgICB0aGlzLnRlbXBsYXRlLnJlbmRlciggcGFyYW1Db21wb25lbnRMaXN0LCBbXSwgdHJ1ZSApO1xuICAgIH0gKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoZSB1c2VyIGNhbiBhZGQgZW50cmllcyBpbiB0byB0aGUgb3B0aW9ucyB0aGF0IHRoaXMgZmllbGQgc2hvdWxkIHVzZVxuICAgKi9cbiAgYWRkRmllbGRJdGVtT3B0aW9uKCk6IHZvaWR7XG4gICAgdGhpcy5kb20uYWN0aXZlLm9wdGlvbnMucHVzaCgge1xuICAgICAgYWN0aXZlOiBuZXcgQ2hlY2tib3hDb25maWcoIHtcbiAgICAgICAgbGFiZWw6IG51bGwsXG4gICAgICAgIHZhbHVlOiAxLFxuICAgICAgICBidWJibGU6IHRydWUsXG4gICAgICB9ICksXG4gICAgICBuYW1lOiBuZXcgSW5wdXRDb25maWcoIHtcbiAgICAgICAgbGFiZWw6IG51bGwsXG4gICAgICAgIHZhbHVlOiAnJyxcbiAgICAgICAgcGF0dGVybjogJ0FscGhhTnVtZXJpYycsXG4gICAgICAgIGJ1YmJsZTogdHJ1ZSxcbiAgICAgICAgbWF4bGVuZ3RoOiAxMjgsXG4gICAgICAgIG1pbmltYWw6IHRydWUsXG4gICAgICB9ICksXG4gICAgICB2YWx1ZTogbmV3IElucHV0Q29uZmlnKCB7XG4gICAgICAgIGxhYmVsOiBudWxsLFxuICAgICAgICB2YWx1ZTogJycsXG4gICAgICAgIHBhdHRlcm46ICdBbHBoYU51bWVyaWNOb1NwYWNlJyxcbiAgICAgICAgYnViYmxlOiB0cnVlLFxuICAgICAgICBtYXhsZW5ndGg6IDEyOCxcbiAgICAgICAgbWluaW1hbDogdHJ1ZSxcbiAgICAgIH0gKSxcbiAgICAgIHNvcnQ6IG5ldyBJbnB1dENvbmZpZygge1xuICAgICAgICBsYWJlbDogbnVsbCxcbiAgICAgICAgbWluaW1hbDogdHJ1ZSxcbiAgICAgICAgdmFsdWU6IHRoaXMuZG9tLmFjdGl2ZS5vcHRpb25zLmxlbmd0aCxcbiAgICAgICAgYnViYmxlOiB0cnVlLFxuICAgICAgfSApLFxuICAgIH0gKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoZSB1c2VyIGNhbiByZW1vdmUgYW4gZXhpc3Rpbmcgb3B0aW9uIHRoYXQgdGhpcyBmaWVsZCBpcyB1c2luZ1xuICAgKiBAcGFyYW0gaW5kZXhcbiAgICovXG4gIHJlbW92ZUZpZWxkSXRlbU9wdGlvbiggaW5kZXg6IG51bWJlciApOiB2b2lke1xuICAgIGlmKCBpbmRleCBpbiB0aGlzLmRvbS5hY3RpdmUub3B0aW9ucyApe1xuICAgICAgdGhpcy5kb20uYWN0aXZlLm9wdGlvbnMuc3BsaWNlKCBpbmRleCwgMSApO1xuICAgICAgdGhpcy5kb20uYWN0aXZlLm9wdGlvbnMubWFwKCAoIG9wdGlvbiwgaSApID0+IHtcbiAgICAgICAgb3B0aW9uLnNvcnQuY29udHJvbC5zZXRWYWx1ZSggaSApO1xuICAgICAgfSApO1xuICAgIH1cbiAgICB0aGlzLnRyaWdnZXJTYXZlRmllbGRPcHRpb25zKCA8UG9wQmFzZUV2ZW50SW50ZXJmYWNlPnsgbmFtZTogJ29uQ2hhbmdlJyB9ICk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIHdpbGwgYWxsb3cgdGhlIHVzZXIgdG8gbWFrZSBjb25zZWN1dGl2ZSBjaGFuZ2VzIHdpdGggbWluaW1hbCBhcGkgY2FsbHNcbiAgICogQHBhcmFtIGV2ZW50XG4gICAqL1xuICB0cmlnZ2VyU2F2ZUZpZWxkT3B0aW9ucyggZXZlbnQ6IFBvcEJhc2VFdmVudEludGVyZmFjZSApOiB2b2lke1xuICAgIGlmKCBldmVudCAmJiAoIGV2ZW50Lm5hbWUgPT09ICdvbktleVVwJyB8fCBldmVudC5uYW1lID09PSAnb25DaGFuZ2UnICkgKXtcbiAgICAgIGlmKCB0aGlzLmRvbS5kZWxheS5zYXZlRmllbGRPcHRpb25zICl7XG4gICAgICAgIGNsZWFyVGltZW91dCggdGhpcy5kb20uZGVsYXkuc2F2ZUZpZWxkT3B0aW9ucyApO1xuICAgICAgfVxuICAgICAgdGhpcy5kb20uZGVsYXkuc2F2ZUZpZWxkT3B0aW9ucyA9IHNldFRpbWVvdXQoICgpID0+IHtcbiAgICAgICAgdGhpcy5zYXZlRmllbGRJdGVtT3B0aW9ucygpO1xuICAgICAgfSwgNTAwICk7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogUmVzZXQgdGhlIG9wdGlvbiB2YWx1ZXMgd2l0aCB0aGUgcm9vdCBzb3VyY2VcbiAgICogQHBhcmFtIGV2ZW50XG4gICAqL1xuICBvbk9wdGlvblNvdXJjZVJlc2V0KCBldmVudDogUG9wQmFzZUV2ZW50SW50ZXJmYWNlICk6IHZvaWR7XG4gICAgY29uc3QgZmllbGQgPSB0aGlzLmRvbS5hY3RpdmUuaXRlbTtcbiAgICBpZiggSXNBcnJheSggZmllbGQuc291cmNlLCB0cnVlICkgKXtcbiAgICAgIGZpZWxkLm9wdGlvbnMudmFsdWVzID0gW107XG4gICAgICBmaWVsZC5zb3VyY2UubWFwKCAoIGl0ZW0sIGluZGV4ICkgPT4ge1xuICAgICAgICBmaWVsZC5vcHRpb25zLnZhbHVlcy5wdXNoKCB7XG4gICAgICAgICAgYWN0aXZlOiBpdGVtLmFjdGl2ZSA/ICtpdGVtLmFjdGl2ZSA6IDEsXG4gICAgICAgICAgbmFtZTogaXRlbS5uYW1lID8gaXRlbS5uYW1lIDogaXRlbS5sYWJlbCA/IGl0ZW0ubGFiZWwgOiAnSXRlbSAnICsgKCBpbmRleCArIDEgKSxcbiAgICAgICAgICB2YWx1ZTogaXRlbS5pZCA/IGl0ZW0uaWQgOiBpdGVtLnZhbHVlID8gaXRlbS52YWx1ZSA6ICggaW5kZXggKyAxICksXG4gICAgICAgICAgc29ydDogaW5kZXhcbiAgICAgICAgfSApO1xuICAgICAgfSApO1xuICAgICAgdGhpcy5fc2V0RmllbGRJdGVtT3B0aW9ucygpO1xuICAgICAgdGhpcy50cmlnZ2VyU2F2ZUZpZWxkT3B0aW9ucyggPFBvcEJhc2VFdmVudEludGVyZmFjZT57IG5hbWU6ICdvbkNoYW5nZScgfSApO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgd2lsbCBzdG9yZSB0aGUgb3B0aW9uIGNoYW5nZXMgdGhhdCB0aGUgdXNlciBtYWtlc1xuICAgKi9cbiAgc2F2ZUZpZWxkSXRlbU9wdGlvbnMoKTogdm9pZHtcbiAgICAvLyAjMTogQ3JlYXRlIHRoZSBwYXlsb2FkIHN0cnVjdHVyZVxuICAgIHRoaXMuZG9tLnN0YXRlLnNhdmluZyA9IHRydWU7XG4gICAgY29uc3QgZmllbGQgPSB0aGlzLmRvbS5hY3RpdmUuaXRlbTtcbiAgICBjb25zdCBqc29uID0gSlNPTi5wYXJzZSggSlNPTi5zdHJpbmdpZnkoIGZpZWxkLm9wdGlvbnMgKSApO1xuICAgIGpzb24udmFsdWVzID0gW107XG4gICAgbGV0IG9wdDtcbiAgICB0aGlzLmRvbS5hY3RpdmUub3B0aW9ucy5tYXAoICggb3B0aW9uICkgPT4ge1xuICAgICAgb3B0ID0ge307XG4gICAgICBPYmplY3Qua2V5cyggb3B0aW9uICkubWFwKCAoIGtleSApID0+IHtcbiAgICAgICAgb3B0WyBrZXkgXSA9IG9wdGlvblsga2V5IF0uY29udHJvbC52YWx1ZTtcbiAgICAgIH0gKTtcbiAgICAgIGpzb24udmFsdWVzLnB1c2goIG9wdCApO1xuICAgIH0gKTtcblxuICAgIGNvbnN0IGlnbm9yZTQwMSA9IG51bGw7XG4gICAgY29uc3QgdmVyc2lvbiA9IDE7XG4gICAgY29uc3QgcGF0Y2ggPSB7XG4gICAgICAnb3B0aW9ucyc6IGpzb25cbiAgICB9O1xuICAgIC8vICMyOiBDbGVhci9TdG9yZSB0aGUgc3Vic2NyaWJlciBzbyB0aGF0IGl0IGNhbiBiZSBpZ25vcmVkIGlmIG5lZWRlZFxuICAgIHRoaXMuZG9tLnNldFN1YnNjcmliZXIoICdvcHRpb25zLWFwaS1jYWxsJywgdGhpcy5zcnYucmVxdWVzdC5kb1BhdGNoKCBgL2ZpZWxkcy9jdXN0b21zLyR7ZmllbGQuaWR9YCwgcGF0Y2gsIHZlcnNpb24sIGlnbm9yZTQwMSApLnN1YnNjcmliZShcbiAgICAgIHJlcyA9PiB7XG4gICAgICAgIHRoaXMuZG9tLmFjdGl2ZS5pdGVtLm9wdGlvbnMudmFsdWVzID0ganNvbi52YWx1ZXM7XG4gICAgICAgIHRoaXMuZG9tLnN0YXRlLnNhdmluZyA9IGZhbHNlO1xuICAgICAgICAvLyAjMzogSW5mb3JtIHRoZSBGaWVsZEJ1aWxkZXJQcmV2aWV3Q29tcG9uZW50IHRvIHVwZGF0ZSB0aGUgbmV3IHNldHRpbmdzXG4gICAgICAgIHRoaXMuY29yZS5jaGFubmVsLm5leHQoIHsgc291cmNlOiB0aGlzLm5hbWUsIHR5cGU6ICdjb21wb25lbnQnLCBuYW1lOiAndXBkYXRlJywgdGFyZ2V0OiAnUG9wRW50aXR5RmllbGRQcmV2aWV3Q29tcG9uZW50JyB9ICk7XG4gICAgICAgIGlmKCB0aGlzLmRvbS5zdWJzY3JpYmVyLmFwaSApIHRoaXMuZG9tLnN1YnNjcmliZXIuYXBpLnVuc3Vic2NyaWJlKCk7XG4gICAgICB9LFxuICAgICAgZXJyID0+IHtcbiAgICAgICAgdGhpcy5kb20uc3RhdGUuc2F2aW5nID0gZmFsc2U7XG4gICAgICB9XG4gICAgKSApO1xuICB9XG5cblxuICAvKipcbiAgICogVGhpcyBhbGxvd3MgdGhlIHVzZXIgdG8gc29ydCB0aGUgbGlzdCBvZiBvcHRpb25zIHRoYXQgdGhpcyBmaWVsZCB1c2VzXG4gICAqIEBwYXJhbSBldmVudFxuICAgKi9cbiAgb25PcHRpb25Tb3J0RHJvcCggZXZlbnQ6IENka0RyYWdEcm9wPHN0cmluZ1tdPiApe1xuICAgIG1vdmVJdGVtSW5BcnJheSggdGhpcy5kb20uYWN0aXZlLm9wdGlvbnMsIGV2ZW50LnByZXZpb3VzSW5kZXgsIGV2ZW50LmN1cnJlbnRJbmRleCApO1xuICAgIHRoaXMudHJpZ2dlclNhdmVGaWVsZE9wdGlvbnMoIDxQb3BCYXNlRXZlbnRJbnRlcmZhY2U+eyBuYW1lOiAnb25DaGFuZ2UnIH0gKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoZSBkb20gZGVzdHJveSBmdW5jdGlvbiBtYW5hZ2VzIGFsbCB0aGUgY2xlYW4gdXAgdGhhdCBpcyBuZWNlc3NhcnkgaWYgc3Vic2NyaXB0aW9ucywgdGltZW91dHMsIGV0YyBhcmUgc3RvcmVkIHByb3Blcmx5XG4gICAqL1xuICBuZ09uRGVzdHJveSgpe1xuICAgIHRoaXMudGVtcGxhdGUuZGVzdHJveSgpO1xuICAgIHN1cGVyLm5nT25EZXN0cm95KCk7XG4gIH1cblxuXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVW5kZXIgVGhlIEhvb2QgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBQcml2YXRlIE1ldGhvZCApICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4gIC8qKlxuICAgKiBUaGlzIGhhbmRsZXIgaXMgZm9yIG1hbmFnaW5nIGFueSBjcm9zcy1jb21tdW5pY2F0aW9uIGJldHdlZW4gY29tcG9uZW50cyBvbiB0aGUgY29yZSBjaGFubmVsXG4gICAqIEBwYXJhbSBldmVudFxuICAgKi9cbiAgcHJpdmF0ZSBjb3JlRXZlbnRIYW5kbGVyKCBldmVudDogUG9wQmFzZUV2ZW50SW50ZXJmYWNlICl7XG4gICAgdGhpcy5sb2cuZXZlbnQoIGBjb3JlRXZlbnRIYW5kbGVyYCwgZXZlbnQgKTtcbiAgICBpZiggZXZlbnQudHlwZSA9PT0gJ2NvbXBvbmVudCcgKXtcbiAgICAgIGlmKCBldmVudC5zb3VyY2UgPT09ICdQb3BFbnRpdHlGaWVsZEl0ZW1zQ29tcG9uZW50JyApe1xuICAgICAgICBpZiggZXZlbnQubmFtZSA9PT0gJ2FjdGl2ZS1pdGVtJyApe1xuICAgICAgICAgIC8vICMxOiBBbiBldmVudCBoYXMgdHJpZ2dlcmVkIHRoYXQgdGhlIHZpZXcgbmVlZHMgdG8gY2hhbmdlIHRoZSBhY3RpdmUgaXRlbSwgIGRlYm91bmNlIHRoaXMgdHJpZ2dlciBzbyB0aGF0IHRoaXMgYWN0aW9uIGRvZXMgbm90IGdldCBjYWxsZWQgb24gdG9wIG9mIGl0c2VsZlxuICAgICAgICAgIHRoaXMuZG9tLnNldFRpbWVvdXQoICdyZXNldC12aWV3JywgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5kb20ubG9hZGluZygpO1xuICAgICAgICAgICAgLy8gIzI6IFRyYW5zZmVyIGluIHRoZSBkYXRhIHBhY2thZ2UgZnJvbSB0aGUgZXZlbnRcbiAgICAgICAgICAgIHRoaXMuZG9tLmFjdGl2ZS5pdGVtID0gZXZlbnQuZGF0YTtcbiAgICAgICAgICAgIC8vIHRoaXMuYXNzZXQudmlld1BhcmFtcyA9IGV2ZW50LmRhdGEuY29uZmlnO1xuICAgICAgICAgICAgLy8gdGhpcy5hc3NldC5tb2RlbCA9IGV2ZW50LmRhdGEubW9kZWw7XG4gICAgICAgICAgICAvLyAjMzogUmVuZGVyIHRoZSBBY3RpdmUgSXRlbSBzZXR0aW5ncyB0aGF0IGFyZSBhdmFpbGFibGVcbiAgICAgICAgICAgIHRoaXMuc2V0QWN0aXZlRmllbGRJdGVtKCk7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCAoKSA9PiB7XG4gICAgICAgICAgICAgIHRoaXMuZG9tLnJlYWR5KCk7XG4gICAgICAgICAgICB9LCAwICk7XG4gICAgICAgICAgfSwgMTAwICk7XG4gICAgICAgIH1lbHNlIGlmKCBldmVudC5uYW1lID09PSAnbGFiZWwtc2V0dGluZ3MnICl7XG4gICAgICAgICAgLy8gIzE6IEFuIGV2ZW50IGhhcyB0cmlnZ2VyZWQgdGhhdCB0aGUgdmlldyBuZWVkcyB0byBjaGFuZ2UgdGhlIGFjdGl2ZSBpdGVtLCAgZGVib3VuY2UgdGhpcyB0cmlnZ2VyIHNvIHRoYXQgdGhpcyBhY3Rpb24gZG9lcyBub3QgZ2V0IGNhbGxlZCBvbiB0b3Agb2YgaXRzZWxmXG4gICAgICAgICAgaWYoIHRoaXMuZG9tLmRlbGF5LnJlc2V0ICkgY2xlYXJUaW1lb3V0KCB0aGlzLmRvbS5kZWxheS5yZXNldCApO1xuICAgICAgICAgIHRoaXMuZG9tLmRlbGF5LnJlc2V0ID0gc2V0VGltZW91dCggKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5kb20ubG9hZGluZygpO1xuICAgICAgICAgICAgdGhpcy5zZXRMYWJlbFNldHRpbmdzKCk7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCAoKSA9PiB7XG4gICAgICAgICAgICAgIHRoaXMuZG9tLnJlYWR5KCk7XG4gICAgICAgICAgICB9LCAwICk7XG4gICAgICAgICAgfSwgMTAwICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9ZWxzZSBpZiggSXNWYWxpZEZpZWxkUGF0Y2hFdmVudCggdGhpcy5jb3JlLCBldmVudCApICl7XG4gICAgICB0aGlzLl9zZXRIZWlnaHQoKTtcbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIGhhbmRsZXMgcmVuZGVyaW5nIHRoZSBkeW5hbWljIGxpc3Qgb2YgIHBhcmFtIHNldHRpbmdzIGludG8gdGhlIHZpZXdcbiAgICogQHBhcmFtIGZvcm1cbiAgICogQHBhcmFtIGZpZWxkSXRlbVxuICAgKiBAcGFyYW0gcGFyYW1zXG4gICAqL1xuICBwcml2YXRlIF9zZXRGaWVsZEl0ZW1QYXJhbXMoKXtcbiAgICBpZiggSXNPYmplY3QoIHRoaXMuZG9tLmFjdGl2ZS5pdGVtLCB0cnVlICkgKXtcbiAgICAgIHRoaXMuX2NvbmZpZ3VyZVBhcmFtTGlzdCgpLnRoZW4oICggcGFyYW1Db21wb25lbnRMaXN0OiBEeW5hbWljQ29tcG9uZW50SW50ZXJmYWNlW10gKSA9PiB7XG4gICAgICAgIHRoaXMudGVtcGxhdGUucmVuZGVyKCBwYXJhbUNvbXBvbmVudExpc3QsIFtdLCB0cnVlICk7XG4gICAgICB9ICk7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogVGhpcyB3aWxsIHJldHVybiBhIGxpc3Qgb2YgYWxsIHRoZSBpbnB1dHMgdGhhdCB0aGUgc2V0dGluZ3MgcmVxdWlyZVxuICAgKiBAcGFyYW0gZmllbGRJdGVtXG4gICAqIEBwYXJhbSBwYXJhbXNcbiAgICovXG4gIF9jb25maWd1cmVQYXJhbUxpc3QoKTogUHJvbWlzZTxEeW5hbWljQ29tcG9uZW50SW50ZXJmYWNlW10+e1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSggKCByZXNvbHZlICkgPT4ge1xuXG4gICAgICBjb25zdCBwYXJhbUNvbXBvbmVudExpc3Q6IER5bmFtaWNDb21wb25lbnRJbnRlcmZhY2VbXSA9IFtdO1xuICAgICAgbGV0IGNvbXBvbmVudDtcbiAgICAgIGxldCBjb25maWdJbnRlcmZhY2U7XG4gICAgICBjb25zdCBmaWVsZEl0ZW0gPSB0aGlzLmRvbS5hY3RpdmUuaXRlbTtcbiAgICAgIGNvbnN0IHZpZXcgPSBmaWVsZEl0ZW0udmlldztcbiAgICAgIGNvbnN0IHJ1bGVzID0gZmllbGRJdGVtLnJ1bGVzLnNvcnQoIER5bmFtaWNTb3J0KCAnbmFtZScgKSApLm1hcCggKCBydWxlICkgPT4gQ2xlYW5PYmplY3QoIHJ1bGUgKSApO1xuICAgICAgY29uc3QgYWxsb3dlZCA9IHRoaXMuYXNzZXQudmlld1BhcmFtc1sgdmlldy5uYW1lIF07XG4gICAgICBjb25zdCBncm91cCA9IHRoaXMuZmllbGQuZmllbGRncm91cC5uYW1lO1xuICAgICAgY29uc3QgaXRlbUN1c3RvbVNldHRpbmdzID0gZmllbGRJdGVtLmN1c3RvbV9zZXR0aW5nO1xuICAgICAgLy8gVG9EbzogUHV0IHRoZSBjdXN0b20gU2V0dGluZ3MgaW50byB0aGUgcGFyYW1MaXN0XG4gICAgICAvLyBjb25zb2xlLmxvZygnaXRlbUN1c3RvbVNldHRpbmdzJywgaXRlbUN1c3RvbVNldHRpbmdzKTtcblxuICAgICAgY29uc3QgaXNTY2hlbWUgPSBJc09iamVjdCggdGhpcy5zY2hlbWUsIFsgJ2lkJyBdICkgPyB0cnVlIDogZmFsc2U7XG5cbiAgICAgIHRoaXMubG9nLmNvbmZpZyggYGFjdGl2ZUl0ZW1gLCB7XG4gICAgICAgIGl0ZW06IGZpZWxkSXRlbSxcbiAgICAgICAgcnVsZXM6IHJ1bGVzLFxuICAgICAgICBncm91cDogZ3JvdXAsXG4gICAgICAgIGFsbG93ZWQ6IGFsbG93ZWQsXG4gICAgICAgIHNldHRpbmdzOiBpdGVtQ3VzdG9tU2V0dGluZ3MsXG4gICAgICAgIHZpZXc6IHZpZXdcbiAgICAgIH0gKTtcblxuICAgICAgaWYoIHRoaXMuZG9tLmFjdGl2ZS5pdGVtLm5hbWUgIT09ICd2YWx1ZScgKXtcbiAgICAgICAgbGV0IGxhYmVsVmFsdWUgPSBmaWVsZEl0ZW0ubGFiZWw7XG4gICAgICAgIGlmKCBpc1NjaGVtZSApe1xuICAgICAgICAgIGNvbnN0IG1hcHBpbmcgPSB0aGlzLnNydi5maWVsZC5nZXRTY2hlbWVGaWVsZEl0ZW1NYXBwaW5nKCB0aGlzLnNjaGVtZSwgK3RoaXMuZmllbGQuaWQsIHRoaXMuZG9tLmFjdGl2ZS5pdGVtLmlkICk7XG4gICAgICAgICAgaWYoIElzU3RyaW5nKCBtYXBwaW5nLmxhYmVsLCB0cnVlICkgKXtcbiAgICAgICAgICAgIGxhYmVsVmFsdWUgPSBtYXBwaW5nLmxhYmVsO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBkaXNwbGF5ID0gPER5bmFtaWNDb21wb25lbnRJbnRlcmZhY2U+e1xuICAgICAgICAgIHR5cGU6IHRoaXMuX2dldFBhcmFtQ29tcG9uZW50KCAnZGlzcGxheScgKSxcbiAgICAgICAgICBpbnB1dHM6IHtcbiAgICAgICAgICAgIGNvbmZpZzogY29uZmlnSW50ZXJmYWNlID0ge1xuICAgICAgICAgICAgICAuLi57XG4gICAgICAgICAgICAgICAgdmFsdWU6IGxhYmVsVmFsdWUsXG4gICAgICAgICAgICAgICAgZGVmYXVsdFZhbHVlOiAnJyxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgLi4ue1xuICAgICAgICAgICAgICAgIGxhYmVsOiAnTGFiZWwnLFxuICAgICAgICAgICAgICAgIG5hbWU6ICdsYWJlbCcsXG4gICAgICAgICAgICAgICAgcmVhZG9ubHk6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHJlcXVpcmVkOiB0cnVlLFxuICAgICAgICAgICAgICAgIG1ldGFkYXRhOiB7XG4gICAgICAgICAgICAgICAgICBzZXNzaW9uOiBmaWVsZEl0ZW1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGZhY2FkZTogaXNTY2hlbWUsXG4gICAgICAgICAgICAgICAgcGF0Y2g6IHtcbiAgICAgICAgICAgICAgICAgIGZpZWxkOiAnbGFiZWwnLFxuICAgICAgICAgICAgICAgICAgcGF0aDogYGZpZWxkcy9jdXN0b21zLyR7ZmllbGRJdGVtLmlkfWAsXG4gICAgICAgICAgICAgICAgICBjYWxsYmFjazogaXNTY2hlbWUgPyBhc3luYyggY29yZTogQ29yZUNvbmZpZywgZXZlbnQ6IFBvcEJhc2VFdmVudEludGVyZmFjZSApID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2Vzc2lvbiA9IHRoaXMuc3J2LmZpZWxkLmdldFNjaGVtZUZpZWxkSXRlbU1hcHBpbmcoIHRoaXMuc2NoZW1lLCArdGhpcy5maWVsZC5pZCwgdGhpcy5kb20uYWN0aXZlLml0ZW0uaWQgKTtcbiAgICAgICAgICAgICAgICAgICAgc2Vzc2lvbi5sYWJlbCA9IGV2ZW50LmNvbmZpZy5jb250cm9sLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnNydi5maWVsZC51cGRhdGVTY2hlbWVGaWVsZE1hcHBpbmcoIHRoaXMuc2NoZW1lICk7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCAnc2Vzc2lvbicsIHNlc3Npb24gKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coICdmYWNhZGUnLCBldmVudC5jb25maWcubmFtZSwgZXZlbnQuY29uZmlnLmNvbnRyb2wudmFsdWUgKTtcbiAgICAgICAgICAgICAgICAgIH0gOiBudWxsLFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcGFyYW1Db21wb25lbnRMaXN0LnB1c2goIGRpc3BsYXkgKTtcbiAgICAgIH1cblxuICAgICAgaWYoIGdyb3VwID09PSAnc2VsZWN0aW9uJyApe1xuICAgICAgICBjb25zdCBkaXNwbGF5ID0gPER5bmFtaWNDb21wb25lbnRJbnRlcmZhY2U+e1xuICAgICAgICAgIHR5cGU6IHRoaXMuX2dldFBhcmFtQ29tcG9uZW50KCAndmlldycgKSxcbiAgICAgICAgICBpbnB1dHM6IHtcbiAgICAgICAgICAgIGNvbmZpZzogY29uZmlnSW50ZXJmYWNlID0ge1xuICAgICAgICAgICAgICAuLi57XG4gICAgICAgICAgICAgICAgdmFsdWU6IHZpZXcuaWQsXG4gICAgICAgICAgICAgICAgZGVmYXVsdFZhbHVlOiAnJyxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgLi4ue1xuICAgICAgICAgICAgICAgIGxhYmVsOiAnVGVtcGxhdGUgVmlldycsXG4gICAgICAgICAgICAgICAgbmFtZTogJ2ZpZWxkX3ZpZXdfaWQnLFxuICAgICAgICAgICAgICAgIHJlYWRvbmx5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICByZXF1aXJlZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgICBkZWZhdWx0VmFsdWU6IDIsXG4gICAgICAgICAgICAgICAgICB2YWx1ZXM6IFtcbiAgICAgICAgICAgICAgICAgICAgeyB2YWx1ZTogMiwgbmFtZTogJ1NlbGVjdCcsIHNvcnRfb3JkZXI6IDAgfSxcbiAgICAgICAgICAgICAgICAgICAgeyB2YWx1ZTogMTAsIG5hbWU6ICdSYWRpbycsIHNvcnRfb3JkZXI6IDEgfSxcbiAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG1ldGFkYXRhOiB7XG4gICAgICAgICAgICAgICAgICBzZXNzaW9uOiBmaWVsZEl0ZW1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHBhdGNoOiB7XG4gICAgICAgICAgICAgICAgICBmaWVsZDogJ2ZpZWxkX3ZpZXdfaWQnLFxuICAgICAgICAgICAgICAgICAgcGF0aDogYGZpZWxkcy8ke2ZpZWxkSXRlbS5pZH1gLFxuICAgICAgICAgICAgICAgICAgY2FsbGJhY2s6ICggY29yZTogQ29yZUNvbmZpZywgZXZlbnQ6IFBvcEJhc2VFdmVudEludGVyZmFjZSApID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2Vzc2lvbiA9IGV2ZW50LmNvbmZpZy5tZXRhZGF0YS5zZXNzaW9uO1xuICAgICAgICAgICAgICAgICAgICBzZXNzaW9uLnZpZXcgPSBGaWVsZEl0ZW1WaWV3KCBldmVudC5yZXNwb25zZS52aWV3ICk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBwYXJhbUNvbXBvbmVudExpc3QucHVzaCggZGlzcGxheSApO1xuICAgICAgfVxuXG5cbiAgICAgIC8vIGlmKCF0aGlzLmZpZWxkLm11bHRpcGxlKXtcbiAgICAgIC8vICAgY29uc3QgaGVscFRleHQgPSA8RHluYW1pY0NvbXBvbmVudEludGVyZmFjZT57XG4gICAgICAvLyAgICAgdHlwZTogdGhpcy5fZ2V0UGFyYW1Db21wb25lbnQoJ2hlbHBUZXh0JyksXG4gICAgICAvLyAgICAgaW5wdXRzOiB7XG4gICAgICAvLyAgICAgICBjb25maWc6IGNvbmZpZ0ludGVyZmFjZSA9IHtcbiAgICAgIC8vICAgICAgICAgLi4ue1xuICAgICAgLy8gICAgICAgICAgIHZhbHVlOiBmaWVsZEl0ZW0uaGVscFRleHQgPyBmaWVsZEl0ZW0uaGVscFRleHQgOiBudWxsLFxuICAgICAgLy8gICAgICAgICAgIGRlZmF1bHRWYWx1ZTogJycsXG4gICAgICAvLyAgICAgICAgIH0sXG4gICAgICAvLyAgICAgICAgIC4uLntcbiAgICAgIC8vICAgICAgICAgICBsYWJlbDogJ0hlbHAgVGV4dCcsXG4gICAgICAvLyAgICAgICAgICAgbmFtZTogJ2hlbHBUZXh0JyxcbiAgICAgIC8vICAgICAgICAgICByZWFkb25seTogZmFsc2UsXG4gICAgICAvLyAgICAgICAgICAgbWV0YWRhdGE6IHtcbiAgICAgIC8vICAgICAgICAgICAgIHNlc3Npb246IGZpZWxkSXRlbVxuICAgICAgLy8gICAgICAgICAgIH0sXG4gICAgICAvLyAgICAgICAgICAgcGF0Y2g6IHsgZmllbGQ6ICdoZWxwVGV4dCcsIHBhdGg6IGBmaWVsZHMvY3VzdG9tcy8ke2ZpZWxkSXRlbS5pZH1gIH1cbiAgICAgIC8vICAgICAgICAgfVxuICAgICAgLy8gICAgICAgfVxuICAgICAgLy8gICAgIH1cbiAgICAgIC8vICAgfTtcbiAgICAgIC8vICAgcGFyYW1Db21wb25lbnRMaXN0LnB1c2goaGVscFRleHQpO1xuICAgICAgLy8gfVxuXG4gICAgICBpZiggdmlldy5uYW1lIGluIHRoaXMuYXNzZXQudmlld1BhcmFtcyApe1xuXG4gICAgICAgIGNvbnN0IHJ1bGVTY2hlbWVTZXNzaW9uID0gdGhpcy5zcnYuZmllbGQuZ2V0U2NoZW1lRmllbGRJdGVtU2VjdGlvbiggdGhpcy5zY2hlbWUsICt0aGlzLmZpZWxkLmlkLCB0aGlzLmRvbS5hY3RpdmUuaXRlbS5pZCwgJ3J1bGUnICk7XG4gICAgICAgIHJ1bGVzLm1hcCggKCBydWxlICkgPT4ge1xuLy8gICAgICAgICAgIGNvbnNvbGUubG9nKCdydWxlJywgcnVsZSk7XG4gICAgICAgICAgbGV0IHJ1bGVWYWx1ZSA9IHJ1bGUudmFsdWU7XG4gICAgICAgICAgaWYoIGlzU2NoZW1lICl7XG4gICAgICAgICAgICBpZiggSXNEZWZpbmVkKCBydWxlU2NoZW1lU2Vzc2lvblsgcnVsZS5uYW1lIF0gKSApe1xuICAgICAgICAgICAgICBydWxlVmFsdWUgPSBydWxlU2NoZW1lU2Vzc2lvblsgcnVsZS5uYW1lIF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmKCBydWxlLm5hbWUgaW4gYWxsb3dlZCApe1xuICAgICAgICAgICAgY29uZmlnSW50ZXJmYWNlID0ge1xuICAgICAgICAgICAgICAuLi5ydWxlLFxuICAgICAgICAgICAgICAuLi57XG4gICAgICAgICAgICAgICAgdmFsdWU6IHJ1bGVWYWx1ZSxcbiAgICAgICAgICAgICAgICBuYW1lOiBydWxlLm5hbWUsXG4gICAgICAgICAgICAgICAgbGFiZWw6IFRpdGxlQ2FzZSggU25ha2VUb1Bhc2NhbCggcnVsZS5uYW1lICkgKSxcbiAgICAgICAgICAgICAgICBtZXRhZGF0YTogeyBydWxlOiBydWxlIH0sXG4gICAgICAgICAgICAgICAgZmFjYWRlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHBhdGNoOiB7XG4gICAgICAgICAgICAgICAgICBkdXJhdGlvbjogMCxcbiAgICAgICAgICAgICAgICAgIGZpZWxkOiBgYCxcbiAgICAgICAgICAgICAgICAgIHBhdGg6IGBgLFxuICAgICAgICAgICAgICAgICAgY2FsbGJhY2s6IGFzeW5jKCBjb3JlOiBDb3JlQ29uZmlnLCBldmVudDogUG9wQmFzZUV2ZW50SW50ZXJmYWNlICkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiggSXNPYmplY3QoIHRoaXMuc2NoZW1lLCB0cnVlICkgKXtcbiAgICAgICAgICAgICAgICAgICAgICBpZiggSXNPYmplY3QoIHJ1bGVTY2hlbWVTZXNzaW9uICkgKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGVTY2hlbWVTZXNzaW9uWyBydWxlLm5hbWUgXSA9IGV2ZW50LmNvbmZpZy5jb250cm9sLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5zcnYuZmllbGQudXBkYXRlU2NoZW1lRmllbGRNYXBwaW5nKCB0aGlzLnNjaGVtZSApO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgdGhpcy5zcnYuZmllbGQuc3RvcmVGaWVsZEl0ZW1SdWxlKCBjb3JlLCBmaWVsZEl0ZW0sIGV2ZW50ICkudGhlbiggKCkgPT4gdHJ1ZSApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBpZiggSXNPYmplY3QoIHJ1bGUub3B0aW9ucywgdHJ1ZSApICl7XG4gICAgICAgICAgICAgIGNvbmZpZ0ludGVyZmFjZS5vcHRpb25zID0gcnVsZS5vcHRpb25zO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29tcG9uZW50ID0gPER5bmFtaWNDb21wb25lbnRJbnRlcmZhY2U+e1xuICAgICAgICAgICAgICB0eXBlOiB0aGlzLl9nZXRQYXJhbUNvbXBvbmVudCggcnVsZS5uYW1lICksXG4gICAgICAgICAgICAgIGlucHV0czoge1xuICAgICAgICAgICAgICAgIGNvbmZpZzogY29uZmlnSW50ZXJmYWNlLFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcGFyYW1Db21wb25lbnRMaXN0LnB1c2goIGNvbXBvbmVudCApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSApO1xuICAgICAgfVxuXG5cbiAgICAgIGlmKCBJc09iamVjdCggaXRlbUN1c3RvbVNldHRpbmdzLCB0cnVlICkgKXtcblxuICAgICAgICBPYmplY3Qua2V5cyggaXRlbUN1c3RvbVNldHRpbmdzICkubWFwKCAoIHNldHRpbmdOYW1lICkgPT4ge1xuXG4gICAgICAgICAgICBjb25zdCBzZXR0aW5nID0gaXRlbUN1c3RvbVNldHRpbmdzWyBzZXR0aW5nTmFtZSBdO1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ3NldHRpbmcnLCBzZXR0aW5nKTtcbiAgICAgICAgICAgIGlmKCBzZXR0aW5nLnR5cGUgIT09ICdtb2RlbCcgKXtcbiAgICAgICAgICAgICAgcGFyYW1Db21wb25lbnRMaXN0LnB1c2goIHRoaXMuc3J2LmZpZWxkLmdldEN1c3RvbVNldHRpbmdDb21wb25lbnQoIHRoaXMuY29yZSwgdGhpcy5jb3JlLmVudGl0eSwgc2V0dGluZywgdGhpcy5zY2hlbWUgKSApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gKTtcbiAgICAgIH1cblxuICAgICAgcmVzb2x2ZSggcGFyYW1Db21wb25lbnRMaXN0ICk7XG4gICAgfSApO1xuICB9XG5cblxuICAvKipcbiAgICogVGhpcyB3aWxsIHJldHVybiBhIGxpc3Qgb2YgYWxsIHRoZSBpbnB1dHMgdGhhdCB0aGUgbGFiZWwgc2V0dGluZ3MgcmVxdWlyZVxuICAgKiBAcGFyYW0gZmllbGRJdGVtXG4gICAqIEBwYXJhbSBwYXJhbXNcbiAgICovXG4gIF9jb25maWd1cmVMYWJlbExpc3QoKTogUHJvbWlzZTxEeW5hbWljQ29tcG9uZW50SW50ZXJmYWNlW10+e1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSggKCByZXNvbHZlICkgPT4ge1xuICAgICAgLy8gY29uc3QgcGFyYW1Db21wb25lbnRMaXN0OiBEeW5hbWljQ29tcG9uZW50SW50ZXJmYWNlW10gPSBbXTtcbiAgICAgIC8vXG4gICAgICAvLyBjb25zdCB2YWx1ZXMgPSA8RHluYW1pY0NvbXBvbmVudEludGVyZmFjZT57XG4gICAgICAvLyAgIHR5cGU6IFBvcEVudGl0eUZpZWxkTGFiZWxDb21wb25lbnQsXG4gICAgICAvLyAgIGlucHV0czoge1xuICAgICAgLy8gICAgIGNvcmU6IHRoaXMuY29yZVxuICAgICAgLy8gICB9XG4gICAgICAvLyB9O1xuICAgICAgLy8gcGFyYW1Db21wb25lbnRMaXN0LnB1c2godmFsdWVzKTtcbiAgICAgIC8vXG4gICAgICAvL1xuICAgICAgcmVzb2x2ZSggW10gKTtcbiAgICB9ICk7XG4gIH1cblxuXG4gIHByaXZhdGUgX3NldEhlaWdodCgpe1xuICAgIHRoaXMuZG9tLm92ZXJoZWFkID0gMTI1O1xuICAgIC8vIHRoaXMuZG9tLmhlaWdodC5vdXRlciA9ICt0aGlzLmRvbS5yZXBvLnBvc2l0aW9uWyB0aGlzLnBvc2l0aW9uIF0uaGVpZ2h0IC0gMTIxO1xuICAgIC8vIGNvbnN0IGZpZWxkID0gPEZpZWxkSW50ZXJmYWNlPnRoaXMuY29yZS5lbnRpdHk7XG4gICAgLy8gaWYoIGZhbHNlICYmIGZpZWxkLm11bHRpcGxlICl7XG4gICAgLy8gICB0aGlzLmRvbS5oZWlnaHQub3V0ZXIgLT0gMjA7XG4gICAgLy8gICB0aGlzLmRvbS5oZWlnaHQub3V0ZXIgLT0gKCArZmllbGQubXVsdGlwbGVfbWluICogNjAgKTtcbiAgICAvLyB9IC8vIHZhbHVlcyBib3hcbiAgICAvL1xuICAgIC8vIGlmKCB0aGlzLmRvbS5oZWlnaHQub3V0ZXIgPCA0MDAgKSB0aGlzLmRvbS5oZWlnaHQub3V0ZXIgPSA0MDA7XG4gICAgLy8gdGhpcy5kb20uaGVpZ2h0Lm91dGVyIC09IDI7XG4gICAgdGhpcy5kb20uc2V0SGVpZ2h0KCAzOTksIHRoaXMuZG9tLm92ZXJoZWFkICk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBSZXR1cm4gdGhlIHRoZSBmaWVsZCBpbnB1dCBjb21wb25lbnQgdGhhdCBzaG91bGQgYmUgdXNlZCBmb3IgdGhlIHR5cGUgb2Ygc2V0dGluZyBwYXJhbTtcbiAgICogQHBhcmFtIGZvcm1cbiAgICovXG4gIHByaXZhdGUgX2dldFBhcmFtQ29tcG9uZW50KCBmb3JtICl7XG4gICAgc3dpdGNoKCBmb3JtICl7XG4gICAgICBjYXNlICdsYWJlbCc6XG4gICAgICAgIHJldHVybiBGaWVsZExhYmVsUGFyYW1Db21wb25lbnQ7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnZGlzcGxheSc6XG4gICAgICBjYXNlICdhcGknOlxuICAgICAgY2FzZSAnc29ydF90b3AnOlxuICAgICAgY2FzZSAncmVnZXgnOlxuICAgICAgY2FzZSAnc29ydCc6XG4gICAgICBjYXNlICdoZWxwVGV4dCc6XG4gICAgICAgIHJldHVybiBGaWVsZElucHV0UGFyYW1Db21wb25lbnQ7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnc2VsZWN0JzpcbiAgICAgIGNhc2UgJ21hc2snOlxuICAgICAgY2FzZSAncGF0dGVybic6XG4gICAgICBjYXNlICd2YWxpZGF0aW9uJzpcbiAgICAgIGNhc2UgJ3RyYW5zZm9ybWF0aW9uJzpcbiAgICAgICAgcmV0dXJuIEZpZWxkU2VsZWN0UGFyYW1Db21wb25lbnQ7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnaGlkZGVuJzpcbiAgICAgIGNhc2UgJ3Zpc2libGUnOlxuICAgICAgY2FzZSAnZGlzYWJsZWQnOlxuICAgICAgY2FzZSAncmVhZG9ubHknOlxuICAgICAgY2FzZSAncmVxdWlyZWQnOlxuICAgICAgICByZXR1cm4gRmllbGRTd2l0Y2hQYXJhbUNvbXBvbmVudDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdsYXlvdXQnOlxuICAgICAgICByZXR1cm4gRmllbGRSYWRpb1BhcmFtQ29tcG9uZW50O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ21pbmxlbmd0aCc6XG4gICAgICBjYXNlICdtYXhsZW5ndGgnOlxuICAgICAgICByZXR1cm4gRmllbGROdW1iZXJQYXJhbUNvbXBvbmVudDtcbiAgICAgIGNhc2UgJ21ldGFkYXRhJzpcbiAgICAgICAgcmV0dXJuIEZpZWxkVGV4dGFyZWFQYXJhbUNvbXBvbmVudDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICd2aWV3JzpcbiAgICAgICAgcmV0dXJuIEZpZWxkUmFkaW9QYXJhbUNvbXBvbmVudDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gRmllbGRMYWJlbFBhcmFtQ29tcG9uZW50O1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgd2lsbCBtYWtlIHN1cmUgdGhlIG9wdGlvbnMgd2lsbCBnZXQgc2V0IHVwIHByb3Blcmx5IGlmIHRoZSBhY3RpdmUgaXRlbXMgdXNlcyB0aGVtXG4gICAqIEBwYXJhbSBmb3JtXG4gICAqIEBwYXJhbSBvcHRpb25zXG4gICAqIEBwYXJhbSBwYXJhbXNcbiAgICovXG4gIHByaXZhdGUgX3NldEZpZWxkSXRlbU9wdGlvbnMoKXtcbiAgICB0aGlzLmRvbS5zdGF0ZS5zaG93T3B0aW9ucyA9IGZhbHNlO1xuICAgIGNvbnN0IGZpZWxkID0gdGhpcy5kb20uYWN0aXZlLml0ZW07XG4gICAgY29uc3QgZm9ybSA9IGZpZWxkLnZpZXcgPyBmaWVsZC52aWV3Lm5hbWUgOiBudWxsO1xuICAgIGlmKCAhZm9ybSApIFBvcExvZy53YXJuKCB0aGlzLm5hbWUsIGBfc2V0RmllbGRJdGVtT3B0aW9uczogSW52YWxpZCBGb3JtYCwgZmllbGQgKTtcblxuXG4gICAgdGhpcy5kb20uYWN0aXZlLm9wdGlvbnMgPSBbXTtcbiAgICBpZiggZm9ybSAmJiBmb3JtIGluIHRoaXMuYXNzZXQudmlld09wdGlvbnMgKXtcblxuICAgICAgLy8gaWYoIGZpZWxkLm9wdGlvbnMuZml4ZWQgKXtcbiAgICAgIC8vICAgZmllbGQub3B0aW9ucy5lbnVtID0gdHJ1ZTtcbiAgICAgIC8vIH1cblxuICAgICAgaWYoIElzQXJyYXkoIGZpZWxkLnNvdXJjZSwgdHJ1ZSApICl7XG4gICAgICAgIGZpZWxkLm9wdGlvbnMuZW51bSA9IHRydWU7XG4gICAgICAgIHRoaXMuZG9tLnN0YXRlLmlzT3B0aW9uU291cmNlID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgaWYoICEoIElzT2JqZWN0KCBmaWVsZC5vcHRpb25zLCBbICd2YWx1ZXMnIF0gKSApICYmICEoIGZpZWxkLnNvdXJjZSApICl7XG4gICAgICAgIGZpZWxkLm9wdGlvbnMgPSB0aGlzLmFzc2V0LnZpZXdPcHRpb25zWyBmb3JtIF07XG4gICAgICB9XG5cbiAgICAgIGlmKCBJc09iamVjdCggZmllbGQub3B0aW9ucywgWyAndmFsdWVzJyBdICkgJiYgQXJyYXkuaXNBcnJheSggZmllbGQub3B0aW9ucy52YWx1ZXMgKSApe1xuICAgICAgICBmaWVsZC5vcHRpb25zLnZhbHVlcy5tYXAoICggb3B0aW9uLCBpbmRleCApID0+IHtcbiAgICAgICAgICBvcHRpb24ubmFtZSA9IG9wdGlvbi5uYW1lID8gU3RyaW5nKCBvcHRpb24ubmFtZSApIDogJ0l0ZW0gJyArICggaW5kZXggKyAxICk7XG4gICAgICAgICAgb3B0aW9uLnZhbHVlID0gb3B0aW9uLmlkID8gU3RyaW5nKCBvcHRpb24uaWQgKSA6IG9wdGlvbi52YWx1ZSA/IFN0cmluZyggb3B0aW9uLnZhbHVlICkgOiBTdHJpbmcoICggaW5kZXggKyAxICkgKTtcbiAgICAgICAgICBvcHRpb24uc29ydCA9IGluZGV4O1xuICAgICAgICAgIGlmKCB0eXBlb2Ygb3B0aW9uLmFjdGl2ZSAhPT0gJ2Jvb2xlYW4nICkgb3B0aW9uLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgdGhpcy5kb20uYWN0aXZlLm9wdGlvbnMucHVzaCgge1xuICAgICAgICAgICAgYWN0aXZlOiBuZXcgQ2hlY2tib3hDb25maWcoIHtcbiAgICAgICAgICAgICAgbGFiZWw6IG51bGwsXG4gICAgICAgICAgICAgIHZhbHVlOiArb3B0aW9uLmFjdGl2ZSxcbiAgICAgICAgICAgICAgYnViYmxlOiB0cnVlLFxuICAgICAgICAgICAgfSApLFxuICAgICAgICAgICAgbmFtZTogbmV3IElucHV0Q29uZmlnKCB7XG4gICAgICAgICAgICAgIGxhYmVsOiBudWxsLFxuICAgICAgICAgICAgICB2YWx1ZTogb3B0aW9uLm5hbWUsXG4gICAgICAgICAgICAgIHRyYW5zZm9ybWF0aW9uOiAndGl0bGUnLFxuICAgICAgICAgICAgICBidWJibGU6IHRoaXMuZG9tLnN0YXRlLmlzT3B0aW9uU291cmNlID8gZmFsc2UgOiB0cnVlLFxuICAgICAgICAgICAgICBwYXR0ZXJuOiAnQWxwaGFOdW1lcmljJyxcbiAgICAgICAgICAgICAgdmFsaWRhdG9yczogWyBWYWxpZGF0b3JzLnJlcXVpcmVkIF0sXG4gICAgICAgICAgICAgIG1heGxlbmd0aDogMzIsXG4gICAgICAgICAgICAgIHJlYWRvbmx5OiB0aGlzLmRvbS5zdGF0ZS5pc09wdGlvblNvdXJjZSA/IHRydWUgOiBmYWxzZSxcbiAgICAgICAgICAgIH0gKSxcbiAgICAgICAgICAgIHZhbHVlOiBuZXcgSW5wdXRDb25maWcoIHtcbiAgICAgICAgICAgICAgbGFiZWw6IG51bGwsXG4gICAgICAgICAgICAgIHZhbHVlOiBvcHRpb24udmFsdWUsXG4gICAgICAgICAgICAgIGJ1YmJsZTogZmllbGQub3B0aW9ucy5lbnVtID8gZmFsc2UgOiB0cnVlLFxuICAgICAgICAgICAgICB2YWxpZGF0b3JzOiBbIFZhbGlkYXRvcnMucmVxdWlyZWQgXSxcbiAgICAgICAgICAgICAgcGF0dGVybjogJ0FscGhhTnVtZXJpY05vU3BhY2UnLFxuICAgICAgICAgICAgICB0cmFuc2Zvcm1hdGlvbjogJ2xvd2VyJyxcbiAgICAgICAgICAgICAgbWF4bGVuZ3RoOiAzMixcbiAgICAgICAgICAgICAgcmVhZG9ubHk6IGZpZWxkLm9wdGlvbnMuZW51bSA/IHRydWUgOiBmYWxzZSxcbiAgICAgICAgICAgIH0gKSxcbiAgICAgICAgICAgIHNvcnQ6IG5ldyBJbnB1dENvbmZpZygge1xuICAgICAgICAgICAgICBsYWJlbDogbnVsbCxcbiAgICAgICAgICAgICAgdmFsdWU6IG9wdGlvbi5zb3J0IHx8IDAsXG4gICAgICAgICAgICAgIGJ1YmJsZTogdHJ1ZSxcbiAgICAgICAgICAgIH0gKSxcbiAgICAgICAgICB9ICk7XG4gICAgICAgIH0gKTtcbiAgICAgICAgdGhpcy5kb20uc3RhdGUuc2hvd09wdGlvbnMgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19