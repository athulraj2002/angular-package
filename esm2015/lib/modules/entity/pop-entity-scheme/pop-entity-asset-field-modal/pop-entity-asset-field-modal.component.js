import { Component, ElementRef, Input } from '@angular/core';
import { ServiceInjector } from '../../../../pop-common.model';
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
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { PopContainerService } from '../../../../services/pop-container.service';
import { PopExtendDynamicComponent } from '../../../../pop-extend-dynamic.component';
import { PopFieldEditorService } from '../../pop-entity-field-editor/pop-entity-field-editor.service';
import { PopDomService } from '../../../../services/pop-dom.service';
import { ArrayKeyBy, CleanObject, IsArrayThrowError, IsObject, IsObjectThrowError, IsStringError, SnakeToPascal, TitleCase } from '../../../../pop-common-utility';
export class PopEntityAssetFieldModalComponent extends PopExtendDynamicComponent {
    constructor(el, dialogRef, _containerRepo, _domRepo) {
        super();
        this.el = el;
        this.dialogRef = dialogRef;
        this._containerRepo = _containerRepo;
        this._domRepo = _domRepo;
        this.config = {};
        this.name = 'PopEntityAssetFieldModalComponent';
        this.srv = {
            container: undefined,
            field: ServiceInjector.get(PopFieldEditorService),
        };
        this.asset = {
            defaultContentHeight: undefined,
            model: new Map(),
            config: new Map(),
            coreField: undefined,
            coreFields: undefined,
            coreFieldItems: undefined,
            params: undefined,
            map: {}
        };
        this.ui = {
            activeConfigs: {},
            field: undefined,
            name: undefined,
            items: [],
            sections: [],
            map: {
                items: {}
            }
        };
        this.extendServiceContainer();
        this.srv.container.onContainerCreated((container) => {
            this.template.attach(container);
            this._setActiveItemParamConfiguration();
        });
        /**
         * Configure the specifics of this component
         */
        this.dom.configure = () => {
            return new Promise((resolve) => {
                this.internal_name = IsStringError(this.config.asset.fieldgroup.name, true, `${this.name}:configureDom - internal_name`) ? this.config.asset.fieldgroup.name : '';
                const defaultHeight = +(window.innerHeight * .75) - 60;
                this.dom.setHeight(defaultHeight, 50);
                this.dom.height.content = this.dom.height.inner - 200;
                this.dom.active.items = {};
                this.asset.defaultContentHeight = this.dom.height.content;
                this.asset.coreFields = IsArrayThrowError(this.core.resource.fields.data_values, true, `${this.name}: - this.core.entity.resource.fields`) ? ArrayKeyBy(this.core.resource.fields.data_values, 'name') : {};
                this.asset.params = this.srv.field.getViewParams();
                this.asset.coreField = IsObjectThrowError(this.asset.coreFields[this.internal_name], true, `${this.name}: - this.asset.coreFields[ this.internal_name ]`) ? this.asset.coreFields[this.internal_name] : {};
                this.asset.coreFieldItems = IsArrayThrowError(this.asset.coreField.items, true, `${this.name}: - this.asset.coreField.items`) ? ArrayKeyBy(this.asset.coreField.items, 'name') : {};
                this.ui.field = this.config.asset;
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
                        blacklist: ['entries', 'object_name', 'depth_level', 'storage']
                    });
                    const coreFieldItem = this.asset.coreFieldItems[item.name];
                    coreFieldItem.rules = ArrayKeyBy(coreFieldItem.itemrules, 'name');
                    // console.log('coreFieldItem', coreFieldItem);
                    item.required = this.srv.field.getViewRequired(this.asset.coreField.name, item.name);
                    if (item.required)
                        item.active = 1;
                    if (+item.active) {
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
                        if (IsObject(item.view, ['name']))
                            item.model.form = item.view.name;
                        if (IsObject(item.rules, true))
                            item.model = Object.assign(Object.assign({}, item.model), item.rules);
                        if (IsObject(item.settings, true))
                            item.model = Object.assign(Object.assign({}, item.model), item.settings);
                        this.dom.active.items[item.name] = item.active;
                        this.asset.model.set(item.name, item.model);
                        this.asset.config.set(item.name, item.config);
                        this.ui.activeConfigs[item.name] = new CheckboxConfig({
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
                    this.ui.map.items[item.name] = index;
                });
                this.ui.sections = [
                    {
                        id: 'params',
                        name: 'Params',
                        inputs: {},
                        component: null,
                        metadata: {},
                        requireRefresh: false,
                        active: true,
                    },
                    {
                        id: 'options',
                        name: 'Options',
                        inputs: {},
                        component: null,
                        metadata: {},
                        requireRefresh: false,
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
                if (this.ui.items[0]) {
                    // this.onSelection(this.ui.items[ 0 ]);
                    // if( this.dom.active.item ){
                    // setTimeout(() => {
                    this.onActiveItemSelection(this.ui.items[0]);
                    // });
                    // }
                }
                return resolve(true);
            });
        };
    }
    extendServiceContainer() {
        this.srv.container = this._containerRepo;
        delete this._containerRepo;
    }
    /**
     * This component will allow a user to configure custom settings for each of items that it holds
     * The CoreConfig of this component will be a specific scheme
     * The config of this component is expected to be a scheme asset that is of type field
     */
    ngOnInit() {
        super.ngOnInit();
    }
    /**
     * The user will be able to active/deactive a specific item in the list of items for this field
     * @param item
     */
    onItemStatusChange(event) {
        if (event.type === 'field' && event.name === 'patch' && event.success) {
            this.log.event('onItemStatusChange', event);
            this.dom.active.items[event.config.id] = +event.config.control.value;
        }
    }
    /**
     * The user will be able to select from a list of item an active item in which to configure settings
     * @param item
     */
    onActiveItemSelection(item) {
        console.log('onActiveItemSelection', item);
        this.dom.active.item = item;
        if (this.dom.active.item.options)
            this._setActiveItemOptionConfiguration();
        this.dom.active.model = IsObjectThrowError(this.dom.active.item.model, true, `${this.name}:onSelection - model`) ? JSON.parse(JSON.stringify(this.dom.active.item.model)) : {};
        // this.dom.active.params = IsObjectThrowError(this.dom.active.item.config, true, `${this.name}:onSelection - config`) ? JSON.parse(JSON.stringify(this.dom.active.item.config)) : {};
        // this.dom.active.config = IsObjectThrowError(this.config.asset.items[ this.ui.map.items[ item.name ] ].config, true, `${this.name}:onSelection - config`) ? JSON.parse(JSON.stringify(this.config.asset.items[ this.ui.map.items[ item.name ] ].config)) : {};
        if (this.dom.active.item.id && this.dom.session[this.dom.active.item.id]) {
            this.onActiveItemSettingSectionSelection(this.dom.session[this.dom.active.item.id]);
        }
        else {
            this.onActiveItemSettingSectionSelection(this.ui.sections[0]); // params
        }
        this._setActiveItemParamConfiguration();
    }
    /**
     * The user needs the changes it active item options to be saved to the database
     * @param event
     */
    onSaveActiveItemOptions(event) {
        console.log('triggerSaveFieldOptions:stub', event);
    }
    /**
     * There might be multiple tab sections to the setting of this active item
     * @param section
     */
    onActiveItemSettingSectionSelection(section) {
        this.dom.active.section = section.id;
        this.dom.session[this.dom.active.item.id] = section;
    }
    /**
     * The user is able to sort the options that should be used to populate the field, if applicable
     */
    onActiveItemOptionSortDrop(event) {
        moveItemInArray(this.dom.active.options, event.previousIndex, event.currentIndex);
        this.onSaveActiveItemOptions({ name: 'onChange' });
    }
    /**
     * The user should be able to click a button to close the modal
     */
    onModalClose() {
        this.dialogRef.close(0);
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
    _setActiveItemParamConfiguration() {
        if (IsObject(this.dom.active.config, true) && IsObject(this.dom.active.params, true)) {
            this._getParamConfigurationComponentList(this.dom.active.config, this.dom.active.params).then((paramComponentList) => {
                this.template.render(paramComponentList, [], true);
            });
        }
    }
    _getParamConfigurationComponentList(fieldItem, params) {
        return new Promise((resolve) => {
            const paramComponentList = [];
            let component;
            let configInterface;
            if (this.dom.active.model.form in this.asset.params) {
                Object.keys(params).map((paramKey) => {
                    if (paramKey in this.asset.params[this.dom.active.model.form]) {
                        configInterface = Object.assign({
                            name: TitleCase(SnakeToPascal(paramKey)),
                            value: fieldItem[paramKey],
                            column: paramKey,
                            readonly: ['api', 'column'].includes(paramKey) ? true : false,
                            patch: { field: paramKey, path: `${fieldItem.api_path}/config` }
                        }, params[paramKey]);
                        configInterface.patch.path = ''; // ToDo: need to be the correct path to save setting to profile_scheme setting storage????
                        // console.log('configInterface', configInterface);
                        component = {
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
    _determineParamSettingComponent(form) {
        switch (form) {
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
    _setActiveItemOptionConfiguration() {
        this.dom.active.options = [];
        if (this.dom.active.item.options && Array.isArray(this.dom.active.item.options.values)) {
            this.dom.active.item.options.values.map((option, index) => {
                option.sort = index;
                if (typeof option.active !== 'boolean')
                    option.active = true;
                if (typeof option.name !== 'string')
                    option.name = '';
                if (typeof option.value !== 'string')
                    option.value = '';
                this.dom.active.options.push({
                    active: new CheckboxConfig({
                        label: null,
                        value: +option.active,
                        bubble: true,
                    }),
                    name: new InputConfig({
                        label: null,
                        value: option.name,
                        validators: [Validators.required],
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
        }
        else {
            this.onActiveItemSettingSectionSelection(this.ui.sections[0]); // params
        }
    }
}
PopEntityAssetFieldModalComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-entity-asset-field-modal',
                template: "<div class=\"entity-scheme-asset-container\" *ngIf=\"dom.state.loaded\" [style.height.px]=\"dom.height.inner\">\n  <div class=\"entity-scheme-asset-header\">\n    <div class=\"sw-label-container-sm\">Edit Field</div>\n  </div>\n  <div class=\"entity-scheme-asset-row sw-mar-top-md\">\n    <div class=\"entity-scheme-asset-divider sw-disabled\">\n      <h4>{{ui.field.name}}</h4>\n      <!--<lib-pop-input class=\"sw-disabled\" [config]=\"ui.name\"></lib-pop-input>-->\n    </div>\n\n    <div class=\"entity-scheme-asset-divider\"></div>\n  </div>\n  <div class=\"entity-scheme-asset-content\">\n    <div class=\"entity-scheme-asset-section-wrapper\">\n      <div class=\"entity-scheme-asset-header pt-02\">\n        <div>Attributes</div>\n        <div class=\"entity-scheme-asset-item-label-helper\">\n          <div class=\"sw-pop-icon entity-scheme-asset-section-header-helper-icon\"\n               matTooltip=\"{{ui.field.fieldgroup.description}}\"\n               matTooltipPosition=\"left\">X\n          </div>\n        </div>\n      </div>\n      <mat-divider></mat-divider>\n      <div class=\"entity-scheme-asset-item sw-pointer\" [ngClass]=\"{'entity-scheme-asset-active-selection':dom.active['item']?.id === item.id}\" *ngFor=\"let item of ui.items\" (click)=\"onActiveItemSelection(item);\">\n        <div class=\"entity-scheme-asset-item-active-selector\" (click)=\"$event.stopPropagation()\">\n          <lib-pop-checkbox *ngIf=\"ui.activeConfigs[item.name]\" [config]=\"ui.activeConfigs[item.name]\" (events)=\"onItemStatusChange($event);\"></lib-pop-checkbox>\n        </div>\n        <div class=\"entity-scheme-asset-item-label-name\">{{item.name}}</div>\n        <div class=\"entity-scheme-asset-item-label-helper\">\n          <div class=\"sw-pop-icon entity-scheme-asset-item-helper-icon\"\n               matTooltip=\"{{item.display}}\"\n               matTooltipPosition=\"left\">X\n          </div>\n        </div>\n      </div>\n    </div>\n\n    <div class=\"entity-scheme-asset-section-wrapper\">\n      <div class=\"entity-scheme-asset-header pt-02\">\n        <div>{{dom.active.item?.name}} Settings</div>\n        <div class=\"entity-field-editor-item-label-helper\">\n          <div class=\"sw-pop-icon entity-scheme-asset-section-header-helper-icon\"\n               matTooltip=\"{{dom.active.item?.description}}\"\n               matTooltipPosition=\"left\">X\n          </div>\n        </div>\n      </div>\n      <mat-divider></mat-divider>\n      <div class=\"entity-scheme-asset-setting-header\" [ngClass]=\"{'sw-hidden': !dom.active.item?.options}\">\n        <nav mat-tab-nav-bar>\n          <a mat-tab-link\n             *ngFor=\"let section of ui.sections\"\n             (click)=\"onActiveItemSettingSectionSelection(section)\"\n             [ngClass]=\"{'sw-hidden':!section.active}\"\n             [active]=\"dom.active.section === section.id\">\n            {{section.name}}\n          </a>\n        </nav>\n      </div>\n      <div class=\"entity-scheme-asset-setting-content entity-scheme-asset-setting-active-config\">\n        <div class=\"entity-scheme-asset-setting-content\" [ngClass]=\"{'sw-hidden':dom.active.section !== 'params' }\" [style.height.px]=\"dom.height.content\">\n          <ng-container libTemplateContainer></ng-container>\n        </div>\n\n        <div class=\"entity-scheme-asset-setting-content\" [ngClass]=\"{'sw-hidden': dom.active.section !== 'options'}\" [style.height.px]=\"dom.height.content\">\n          <div class=\"entity-scheme-asset-setting-options-headers\">\n            <div class=\"entity-scheme-asset-setting-options-sort\">\n              Sort\n            </div>\n            <div class=\"entity-scheme-asset-setting-options-active\">\n              Active\n            </div>\n            <div class=\"entity-scheme-asset-setting-options-input\">\n              <label>Name</label>\n            </div>\n            <div class=\"entity-scheme-asset-setting-options-input\">\n              Value\n            </div>\n            <div class=\"entity-scheme-asset-setting-options-icon \">\n              <!--<i class=\"material-icons entityId-scheme-asset-setting-options-new sw-pointer sw-hover\" matTooltip=\"Add\"-->\n              <!--(click)=\"addFieldItemOption()\" [ngClass]=\"{'sw-hidden':dom.active.item?.options.enum}\">-->\n              <!--add-->\n              <!--</i>-->\n            </div>\n          </div>\n          <mat-divider></mat-divider>\n          <div class=\"entity-scheme-asset-setting-options-container\" cdkDropList (cdkDropListDropped)=\"onActiveItemOptionSortDrop($event)\">\n            <div class=\"entity-scheme-asset-setting-options-headers\" *ngFor=\"let option of dom.active.options; let i = index;\" cdkDrag cdkDragLockAxis=\"y\" cdkDragBoundary=\".entity-scheme-asset-setting-options-container\">\n              <div class=\"entity-scheme-asset-setting-options-sort\">\n                <i class=\"entity-scheme-asset-handle material-icons\" cdkDragHandle>drag_indicator</i>\n              </div>\n              <div class=\"entity-scheme-asset-setting-options-active\">\n                <lib-pop-checkbox (events)=\"onSaveActiveItemOptions($event);\" [config]=\"option.active\"></lib-pop-checkbox>\n              </div>\n              <div class=\"entity-scheme-asset-setting-options-input sw-mar-rgt-md\">\n                <lib-pop-input [config]=\"option.name\"></lib-pop-input>\n              </div>\n              <div class=\"entity-scheme-asset-setting-options-input\" [ngClass]=\"{'sw-disabled':dom.active.item?.options?.enum}\">\n                <lib-pop-input [config]=\"option.value\"></lib-pop-input>\n              </div>\n              <div class=\"entity-scheme-asset-setting-options-icon \" matTooltip=\"Remove\">\n                <!--<i class=\"material-icons entityId-scheme-asset-setting-options-new sw-pointer sw-hover\"-->\n                <!--(click)=\"removeFieldItemOption(i)\" [ngClass]=\"{'sw-hidden':dom.active.item.options.enum}\">-->\n                <!--remove-->\n                <!--</i>-->\n              </div>\n              <div class=\"entity-scheme-asset-setting-options-headers\" *cdkDragPreview></div>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n\n  </div>\n\n  <div class=\"entity-scheme-asset-row entity-scheme-asset-buttons\">\n    <!--<div class=\"in-pop-table-dialog-cancel\">-->\n    <!--<button mat-raised-button (click)=\"onCancel();\">Cancel</button>-->\n    <!--</div>-->\n\n    <div class=\"in-dialog-other\">\n      <button mat-raised-button (click)=\"onModalClose()\">Close</button>\n    </div>\n  </div>\n\n</div>\n",
                providers: [PopContainerService],
                styles: [".entity-scheme-asset-container{min-width:700px;flex-direction:column}.entity-scheme-asset-container,.entity-scheme-asset-content{position:relative;display:flex;height:100%;box-sizing:border-box}.entity-scheme-asset-content{width:100%;flex-direction:row}.entity-scheme-asset-row{position:relative;display:flex;flex-direction:row;height:40px;align-items:center;clear:both;box-sizing:border-box}.entity-scheme-asset-divider,.entity-scheme-asset-section-wrapper{flex:1;width:300px;margin:15px;box-sizing:border-box}.entity-scheme-asset-section-wrapper{border:1px solid var(--border)}.entity-scheme-asset-item:hover{background-color:var(--darken02)}.entity-scheme-asset-header{position:relative;display:flex;flex-direction:row;height:40px;padding:0 5px 0 15px;align-items:center;justify-content:space-between;font-size:1em;font-weight:700;clear:both;box-sizing:border-box}.entity-scheme-asset-item{display:flex;align-items:center;justify-content:flex-start;border-bottom:1px solid var(--border);box-sizing:border-box;padding-left:5px;-moz-box-sizing:border-box}.entity-scheme-asset-item ::ng-deep .pop-checkbox-container{margin-top:0!important}.entity-scheme-asset-item-active-selector{position:relative;display:flex;flex-direction:row;width:15%;box-sizing:border-box;-moz-box-sizing:border-box;align-items:center;justify-content:center}.entity-scheme-asset-active-selection{padding-left:0!important;border-left:5px solid var(--primary)}.entity-scheme-asset-item-label-name{width:75%;align-items:center;justify-content:start;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.entity-scheme-asset-item-label-helper{display:flex;width:10%;align-items:center;justify-content:center;min-height:40px}.entity-scheme-asset-item-helper-icon{margin-top:10px;margin-right:2px;width:20px;height:20px;font-size:.7em;z-index:2}.entity-scheme-asset-buttons{margin:0 15px 10px;display:flex;justify-content:flex-end}.entity-scheme-asset-buttons .in-dialog-cancel{order:1;flex-grow:1;display:flex;justify-content:flex-start}.entity-scheme-asset-buttons .in-dialog-other{order:2;flex-grow:2;display:flex;justify-content:flex-end;margin-left:10px}.entity-scheme-asset-setting-wrapper{position:relative;flex:1;border:1px solid var(--border);border-bottom:none;box-sizing:border-box;-moz-box-sizing:border-box;overflow-x:hidden;overflow-y:scroll}.entity-scheme-asset-setting-header{position:relative}.entity-scheme-asset-setting-content{flex:1;padding:10px 15px 10px 10px;box-sizing:border-box;min-height:100px;overflow-y:scroll;overflow-x:hidden}.entity-scheme-asset-setting-active-config{border-left:5px solid var(--primary)}.entity-scheme-asset-setting-options-headers{display:flex;align-items:center;justify-content:flex-start;margin-top:2px;height:32px}.entity-scheme-asset-setting-options-sort{display:flex;width:10%;align-items:center;justify-content:center}.entity-scheme-asset-setting-options-active{display:flex;width:75px;text-align:center;align-items:center;justify-content:center}.entity-scheme-asset-setting-options-input{display:flex;width:30%;flex-grow:1}.entity-scheme-asset-setting-options-icon{display:flex;width:50px;align-items:center;justify-content:center}.entity-scheme-asset-setting-options-new{float:right}.entity-scheme-asset-setting-options-container{position:relative;width:100%;min-height:30px;padding:5px 0;box-sizing:border-box}.entity-scheme-asset-handle{cursor:move}.entity-scheme-btm-border{border-bottom:1px solid var(--border)}:host ::ng-deep .entity-scheme-asset-setting-options-container .mat-form-field-infix{width:auto;padding:6px!important;margin-top:6px!important;border:0!important}:host ::ng-deep .entity-scheme-asset-setting-options-container .pop-input-container{margin:2px}:host ::ng-deep .entity-scheme-asset-setting-options-container .pop-input-feedback-container{margin-top:-4px}:host ::ng-deep .entity-scheme-asset-setting-reset-box{position:relative;display:block;margin:0;padding:0;width:100%}:host ::ng-deep .entity-scheme-asset-setting-box .pop-textarea-container,:host ::ng-deep .entity-scheme-asset-setting-reset-box .pop-input-container,:host ::ng-deep .entity-scheme-asset-setting-reset-box .pop-select-container{margin:2px 0}"]
            },] }
];
PopEntityAssetFieldModalComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: MatDialogRef },
    { type: PopContainerService },
    { type: PopDomService }
];
PopEntityAssetFieldModalComponent.propDecorators = {
    config: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS1hc3NldC1maWVsZC1tb2RhbC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9lbnRpdHkvcG9wLWVudGl0eS1zY2hlbWUvcG9wLWVudGl0eS1hc3NldC1maWVsZC1tb2RhbC9wb3AtZW50aXR5LWFzc2V0LWZpZWxkLW1vZGFsLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQXVDLE1BQU0sZUFBZSxDQUFDO0FBQ2xHLE9BQU8sRUFPTCxlQUFlLEVBQ2hCLE1BQU0sOEJBQThCLENBQUM7QUFDdEMsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLGlFQUFpRSxDQUFDO0FBQ2pHLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSwyREFBMkQsQ0FBQztBQUN4RixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDeEQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQzVDLE9BQU8sRUFBRSwwQkFBMEIsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBQ3BGLE9BQU8sRUFBRSwwQkFBMEIsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBQ3BGLE9BQU8sRUFBRSwyQkFBMkIsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBQ3RGLE9BQU8sRUFBRSwyQkFBMkIsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBQ3RGLE9BQU8sRUFBRSwwQkFBMEIsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBQ3BGLE9BQU8sRUFBRSw2QkFBNkIsRUFBRSxNQUFNLDJDQUEyQyxDQUFDO0FBQzFGLE9BQU8sRUFBZSxlQUFlLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUN0RSxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSw0Q0FB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LElBQUk7d0JBQ1gsS0FBSyxFQUFFLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQzt3QkFDdkIsTUFBTSxFQUFFLElBQUk7cUJBQ2IsQ0FBQztpQkFDSCxDQUFDLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQztTQUVKO2FBQUk7WUFDSCxJQUFJLENBQUMsbUNBQW1DLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUUsQ0FBQyxDQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVM7U0FDM0U7SUFDSCxDQUFDOzs7WUFuWkYsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSxrQ0FBa0M7Z0JBQzVDLHUvTUFBNEQ7Z0JBRTVELFNBQVMsRUFBRSxDQUFFLG1CQUFtQixDQUFFOzthQUNuQzs7O1lBNUNtQixVQUFVO1lBWXJCLFlBQVk7WUFTWixtQkFBbUI7WUFHbkIsYUFBYTs7O3FCQXNCbkIsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgRWxlbWVudFJlZiwgSW5wdXQsIE9uRGVzdHJveSwgT25Jbml0LCBWaWV3Q29udGFpbmVyUmVmIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge1xuICBEaWN0aW9uYXJ5LFxuICBEeW5hbWljQ29tcG9uZW50SW50ZXJmYWNlLFxuICBGaWVsZEludGVyZmFjZSxcbiAgRmllbGRJdGVtSW50ZXJmYWNlLFxuICBQb3BCYXNlRXZlbnRJbnRlcmZhY2UsXG4gIFNlY3Rpb25JbnRlcmZhY2UsXG4gIFNlcnZpY2VJbmplY3RvclxufSBmcm9tICcuLi8uLi8uLi8uLi9wb3AtY29tbW9uLm1vZGVsJztcbmltcG9ydCB7IENoZWNrYm94Q29uZmlnIH0gZnJvbSAnLi4vLi4vLi4vYmFzZS9wb3AtZmllbGQtaXRlbS9wb3AtY2hlY2tib3gvY2hlY2tib3gtY29uZmlnLm1vZGVsJztcbmltcG9ydCB7IElucHV0Q29uZmlnIH0gZnJvbSAnLi4vLi4vLi4vYmFzZS9wb3AtZmllbGQtaXRlbS9wb3AtaW5wdXQvaW5wdXQtY29uZmlnLm1vZGVsJztcbmltcG9ydCB7IE1hdERpYWxvZ1JlZiB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2RpYWxvZyc7XG5pbXBvcnQgeyBWYWxpZGF0b3JzIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHsgRmllbGRJbnB1dFNldHRpbmdDb21wb25lbnQgfSBmcm9tICcuL3BhcmFtcy9maWVsZC1pbnB1dC1zZXR0aW5nLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBGaWVsZExhYmVsU2V0dGluZ0NvbXBvbmVudCB9IGZyb20gJy4vcGFyYW1zL2ZpZWxkLWxhYmVsLXNldHRpbmcuY29tcG9uZW50JztcbmltcG9ydCB7IEZpZWxkU2VsZWN0U2V0dGluZ0NvbXBvbmVudCB9IGZyb20gJy4vcGFyYW1zL2ZpZWxkLXNlbGVjdC1zZXR0aW5nLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBGaWVsZFN3aXRjaFNldHRpbmdDb21wb25lbnQgfSBmcm9tICcuL3BhcmFtcy9maWVsZC1zd2l0Y2gtc2V0dGluZy5jb21wb25lbnQnO1xuaW1wb3J0IHsgRmllbGRSYWRpb1NldHRpbmdDb21wb25lbnQgfSBmcm9tICcuL3BhcmFtcy9maWVsZC1yYWRpby1zZXR0aW5nLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBGaWVsZFRleHRhcmVhU2V0dGluZ0NvbXBvbmVudCB9IGZyb20gJy4vcGFyYW1zL2ZpZWxkLXRleHRhcmVhLXNldHRpbmcuY29tcG9uZW50JztcbmltcG9ydCB7IENka0RyYWdEcm9wLCBtb3ZlSXRlbUluQXJyYXkgfSBmcm9tICdAYW5ndWxhci9jZGsvZHJhZy1kcm9wJztcbmltcG9ydCB7IFBvcENvbnRhaW5lclNlcnZpY2UgfSBmcm9tICcuLi8uLi8uLi8uLi9zZXJ2aWNlcy9wb3AtY29udGFpbmVyLnNlcnZpY2UnO1xuaW1wb3J0IHsgUG9wRXh0ZW5kRHluYW1pY0NvbXBvbmVudCB9IGZyb20gJy4uLy4uLy4uLy4uL3BvcC1leHRlbmQtZHluYW1pYy5jb21wb25lbnQnO1xuaW1wb3J0IHsgUG9wRmllbGRFZGl0b3JTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vcG9wLWVudGl0eS1maWVsZC1lZGl0b3IvcG9wLWVudGl0eS1maWVsZC1lZGl0b3Iuc2VydmljZSc7XG5pbXBvcnQgeyBQb3BEb21TZXJ2aWNlIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2VydmljZXMvcG9wLWRvbS5zZXJ2aWNlJztcbmltcG9ydCB7XG4gIEFycmF5S2V5QnksXG4gIEFycmF5TWFwU2V0dGVyLFxuICBDbGVhbk9iamVjdCxcbiAgSXNBcnJheVRocm93RXJyb3IsXG4gIElzT2JqZWN0LFxuICBJc09iamVjdFRocm93RXJyb3IsXG4gIElzU3RyaW5nRXJyb3IsXG4gIFNuYWtlVG9QYXNjYWwsXG4gIFRpdGxlQ2FzZVxufSBmcm9tICcuLi8uLi8uLi8uLi9wb3AtY29tbW9uLXV0aWxpdHknO1xuaW1wb3J0IHsgRW50aXR5U2NoZW1lU2VjdGlvbkludGVyZmFjZSB9IGZyb20gJy4uL3BvcC1lbnRpdHktc2NoZW1lLm1vZGVsJztcblxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdsaWItcG9wLWVudGl0eS1hc3NldC1maWVsZC1tb2RhbCcsXG4gIHRlbXBsYXRlVXJsOiAnLi9wb3AtZW50aXR5LWFzc2V0LWZpZWxkLW1vZGFsLmNvbXBvbmVudC5odG1sJyxcbiAgc3R5bGVVcmxzOiBbICcuL3BvcC1lbnRpdHktYXNzZXQtZmllbGQtbW9kYWwuY29tcG9uZW50LnNjc3MnIF0sXG4gIHByb3ZpZGVyczogWyBQb3BDb250YWluZXJTZXJ2aWNlIF1cbn0pXG5leHBvcnQgY2xhc3MgUG9wRW50aXR5QXNzZXRGaWVsZE1vZGFsQ29tcG9uZW50IGV4dGVuZHMgUG9wRXh0ZW5kRHluYW1pY0NvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcbiAgQElucHV0KCkgY29uZmlnOiBFbnRpdHlTY2hlbWVTZWN0aW9uSW50ZXJmYWNlID0gPEVudGl0eVNjaGVtZVNlY3Rpb25JbnRlcmZhY2U+e307XG4gIHB1YmxpYyBuYW1lID0gJ1BvcEVudGl0eUFzc2V0RmllbGRNb2RhbENvbXBvbmVudCc7XG5cbiAgcHJvdGVjdGVkIHNydjoge1xuICAgIGNvbnRhaW5lcjogUG9wQ29udGFpbmVyU2VydmljZSxcbiAgICBmaWVsZDogUG9wRmllbGRFZGl0b3JTZXJ2aWNlLFxuICB9ID0ge1xuICAgIGNvbnRhaW5lcjogPFBvcENvbnRhaW5lclNlcnZpY2U+dW5kZWZpbmVkLFxuICAgIGZpZWxkOiBTZXJ2aWNlSW5qZWN0b3IuZ2V0KFBvcEZpZWxkRWRpdG9yU2VydmljZSksXG4gIH07XG5cbiAgcHJvdGVjdGVkIGFzc2V0ID0ge1xuICAgIGRlZmF1bHRDb250ZW50SGVpZ2h0OiA8bnVtYmVyPnVuZGVmaW5lZCxcbiAgICBtb2RlbDogbmV3IE1hcCgpLFxuICAgIGNvbmZpZzogbmV3IE1hcCgpLFxuICAgIGNvcmVGaWVsZDogPEZpZWxkSW50ZXJmYWNlPnVuZGVmaW5lZCxcbiAgICBjb3JlRmllbGRzOiA8RGljdGlvbmFyeTxGaWVsZEludGVyZmFjZT4+dW5kZWZpbmVkLFxuICAgIGNvcmVGaWVsZEl0ZW1zOiA8RGljdGlvbmFyeTxGaWVsZEl0ZW1JbnRlcmZhY2U+PnVuZGVmaW5lZCxcbiAgICBwYXJhbXM6IDxEaWN0aW9uYXJ5PGFueT4+dW5kZWZpbmVkLFxuICAgIG1hcDogPERpY3Rpb25hcnk8YW55Pj57fVxuICB9O1xuXG4gIHB1YmxpYyB1aSA9IHtcbiAgICBhY3RpdmVDb25maWdzOiA8RGljdGlvbmFyeTxhbnk+Pnt9LFxuICAgIGZpZWxkOiA8RmllbGRJbnRlcmZhY2U+dW5kZWZpbmVkLFxuICAgIG5hbWU6IDxJbnB1dENvbmZpZz51bmRlZmluZWQsXG4gICAgaXRlbXM6IDxhbnlbXT5bXSxcbiAgICBzZWN0aW9uczogPFNlY3Rpb25JbnRlcmZhY2VbXT5bXSxcbiAgICBtYXA6IHtcbiAgICAgIGl0ZW1zOiA8RGljdGlvbmFyeTxudW1iZXI+Pnt9XG4gICAgfVxuICB9O1xuXG5cbiAgcHJvdGVjdGVkIGV4dGVuZFNlcnZpY2VDb250YWluZXIoKXtcbiAgICB0aGlzLnNydi5jb250YWluZXIgPSB0aGlzLl9jb250YWluZXJSZXBvO1xuICAgIGRlbGV0ZSB0aGlzLl9jb250YWluZXJSZXBvO1xuICB9XG5cblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgZWw6IEVsZW1lbnRSZWYsXG4gICAgcHVibGljIGRpYWxvZ1JlZjogTWF0RGlhbG9nUmVmPFBvcEVudGl0eUFzc2V0RmllbGRNb2RhbENvbXBvbmVudD4sXG4gICAgcHJvdGVjdGVkIF9jb250YWluZXJSZXBvOiBQb3BDb250YWluZXJTZXJ2aWNlLFxuICAgIHByb3RlY3RlZCBfZG9tUmVwbzogUG9wRG9tU2VydmljZSxcbiAgKXtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuZXh0ZW5kU2VydmljZUNvbnRhaW5lcigpO1xuXG4gICAgdGhpcy5zcnYuY29udGFpbmVyLm9uQ29udGFpbmVyQ3JlYXRlZCgoY29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmKSA9PiB7XG4gICAgICB0aGlzLnRlbXBsYXRlLmF0dGFjaChjb250YWluZXIpO1xuICAgICAgdGhpcy5fc2V0QWN0aXZlSXRlbVBhcmFtQ29uZmlndXJhdGlvbigpO1xuICAgIH0pO1xuXG5cbiAgICAvKipcbiAgICAgKiBDb25maWd1cmUgdGhlIHNwZWNpZmljcyBvZiB0aGlzIGNvbXBvbmVudFxuICAgICAqL1xuICAgIHRoaXMuZG9tLmNvbmZpZ3VyZSA9ICgpOiBQcm9taXNlPGJvb2xlYW4+ID0+IHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICB0aGlzLmludGVybmFsX25hbWUgPSBJc1N0cmluZ0Vycm9yKHRoaXMuY29uZmlnLmFzc2V0LmZpZWxkZ3JvdXAubmFtZSwgdHJ1ZSwgYCR7dGhpcy5uYW1lfTpjb25maWd1cmVEb20gLSBpbnRlcm5hbF9uYW1lYCkgPyB0aGlzLmNvbmZpZy5hc3NldC5maWVsZGdyb3VwLm5hbWUgOiAnJztcbiAgICAgICAgY29uc3QgZGVmYXVsdEhlaWdodCA9ICsod2luZG93LmlubmVySGVpZ2h0ICogLjc1KSAtIDYwO1xuICAgICAgICB0aGlzLmRvbS5zZXRIZWlnaHQoZGVmYXVsdEhlaWdodCwgNTApO1xuICAgICAgICAgIHRoaXMuZG9tLmhlaWdodC5jb250ZW50ID0gdGhpcy5kb20uaGVpZ2h0LmlubmVyIC0gMjAwO1xuICAgICAgICAgIHRoaXMuZG9tLmFjdGl2ZS5pdGVtcyA9IHt9O1xuICAgICAgICAgIHRoaXMuYXNzZXQuZGVmYXVsdENvbnRlbnRIZWlnaHQgPSB0aGlzLmRvbS5oZWlnaHQuY29udGVudDtcbiAgICAgICAgICB0aGlzLmFzc2V0LmNvcmVGaWVsZHMgPSBJc0FycmF5VGhyb3dFcnJvcih0aGlzLmNvcmUucmVzb3VyY2UuZmllbGRzLmRhdGFfdmFsdWVzLCB0cnVlLCBgJHt0aGlzLm5hbWV9OiAtIHRoaXMuY29yZS5lbnRpdHkucmVzb3VyY2UuZmllbGRzYCkgPyBBcnJheUtleUJ5KHRoaXMuY29yZS5yZXNvdXJjZS5maWVsZHMuZGF0YV92YWx1ZXMsICduYW1lJykgOiB7fTtcbiAgICAgICAgICB0aGlzLmFzc2V0LnBhcmFtcyA9IHRoaXMuc3J2LmZpZWxkLmdldFZpZXdQYXJhbXMoKTtcbiAgICAgICAgICB0aGlzLmFzc2V0LmNvcmVGaWVsZCA9IElzT2JqZWN0VGhyb3dFcnJvcih0aGlzLmFzc2V0LmNvcmVGaWVsZHNbIHRoaXMuaW50ZXJuYWxfbmFtZSBdLCB0cnVlLCBgJHt0aGlzLm5hbWV9OiAtIHRoaXMuYXNzZXQuY29yZUZpZWxkc1sgdGhpcy5pbnRlcm5hbF9uYW1lIF1gKSA/IHRoaXMuYXNzZXQuY29yZUZpZWxkc1sgdGhpcy5pbnRlcm5hbF9uYW1lIF0gOiB7fTtcbiAgICAgICAgICB0aGlzLmFzc2V0LmNvcmVGaWVsZEl0ZW1zID0gSXNBcnJheVRocm93RXJyb3IodGhpcy5hc3NldC5jb3JlRmllbGQuaXRlbXMsIHRydWUsIGAke3RoaXMubmFtZX06IC0gdGhpcy5hc3NldC5jb3JlRmllbGQuaXRlbXNgKSA/IEFycmF5S2V5QnkoPGFueT50aGlzLmFzc2V0LmNvcmVGaWVsZC5pdGVtcywgJ25hbWUnKSA6IHt9O1xuXG5cbiAgICAgICAgICB0aGlzLnVpLmZpZWxkID0gPEZpZWxkSW50ZXJmYWNlPnRoaXMuY29uZmlnLmFzc2V0O1xuICAgICAgICAgIHRoaXMudWkuc2VjdGlvbnMgPSBbXTtcbiAgICAgICAgICB0aGlzLnVpLm5hbWUgPSBuZXcgSW5wdXRDb25maWcoe1xuICAgICAgICAgICAgdmFsdWU6IHRoaXMudWkuZmllbGQubmFtZSxcbiAgICAgICAgICAgIHJlYWRvbmx5OiB0cnVlXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICB0aGlzLnVpLm1hcC5pdGVtcyA9IHt9O1xuICAgICAgICAgIGNvbnN0IGl0ZW1zID0gSXNBcnJheVRocm93RXJyb3IodGhpcy5jb25maWcuYXNzZXQuaXRlbXMsIHRydWUsIGAke3RoaXMubmFtZX06Y29uZmlndXJlRG9tOiAtIHRoaXMuY29uZmlnLmFzc2V0Lml0ZW1zYCkgPyBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMuY29uZmlnLmFzc2V0Lml0ZW1zKSkgOiBbXTtcbiAgICAgICAgICAvLyBjb25zdCBpdGVtcyA9IHRoaXMuc3J2LmNvbW1vbi5pc0FycmF5KHRoaXMuY29uZmlnLmFzc2V0Lml0ZW1zLCB0cnVlLCBgJHt0aGlzLm5hbWV9OmNvbmZpZ3VyZURvbSAtIGl0ZW1zYCkgPyBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMuYXNzZXQuY29yZUZpZWxkLml0ZW1zKSkgOiB7fTtcbiAgICAgICAgICBpdGVtcy5tYXAoKGl0ZW0sIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBpdGVtID0gQ2xlYW5PYmplY3QoaXRlbSwge1xuICAgICAgICAgICAgICBibGFja2xpc3Q6IFsgJ2VudHJpZXMnLCAnb2JqZWN0X25hbWUnLCAnZGVwdGhfbGV2ZWwnLCAnc3RvcmFnZScgXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjb25zdCBjb3JlRmllbGRJdGVtID0gPGFueT50aGlzLmFzc2V0LmNvcmVGaWVsZEl0ZW1zWyBpdGVtLm5hbWUgXTtcbiAgICAgICAgICAgIGNvcmVGaWVsZEl0ZW0ucnVsZXMgPSBBcnJheUtleUJ5KGNvcmVGaWVsZEl0ZW0uaXRlbXJ1bGVzLCAnbmFtZScpO1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ2NvcmVGaWVsZEl0ZW0nLCBjb3JlRmllbGRJdGVtKTtcbiAgICAgICAgICAgIGl0ZW0ucmVxdWlyZWQgPSB0aGlzLnNydi5maWVsZC5nZXRWaWV3UmVxdWlyZWQodGhpcy5hc3NldC5jb3JlRmllbGQubmFtZSwgaXRlbS5uYW1lKTtcblxuICAgICAgICAgICAgaWYoIGl0ZW0ucmVxdWlyZWQgKSBpdGVtLmFjdGl2ZSA9IDE7XG4gICAgICAgICAgICBpZiggK2l0ZW0uYWN0aXZlICl7XG4gICAgICAgICAgICAgIGl0ZW0ubmFtZSA9IFNuYWtlVG9QYXNjYWwoaXRlbS5uYW1lKTtcbiAgICAgICAgICAgICAgaXRlbS5tb2RlbCA9IHtcbiAgICAgICAgICAgICAgICBpZDogaXRlbS5pZCxcbiAgICAgICAgICAgICAgICBuYW1lOiBpdGVtLm5hbWUsXG4gICAgICAgICAgICAgICAgbGFiZWw6IGl0ZW0ubGFiZWwsXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIGl0ZW0uY29uZmlnID0ge1xuICAgICAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgIHZhbHVlczogaXRlbS5vcHRpb25zXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgIGlmKCBJc09iamVjdChpdGVtLnZpZXcsIFsgJ25hbWUnIF0pICkgaXRlbS5tb2RlbC5mb3JtID0gaXRlbS52aWV3Lm5hbWU7XG4gICAgICAgICAgICAgIGlmKCBJc09iamVjdChpdGVtLnJ1bGVzLCB0cnVlKSApIGl0ZW0ubW9kZWwgPSB7IC4uLml0ZW0ubW9kZWwsIC4uLml0ZW0ucnVsZXMgfTtcbiAgICAgICAgICAgICAgaWYoIElzT2JqZWN0KGl0ZW0uc2V0dGluZ3MsIHRydWUpICkgaXRlbS5tb2RlbCA9IHsgLi4uaXRlbS5tb2RlbCwgLi4uaXRlbS5zZXR0aW5ncyB9O1xuICAgICAgICAgICAgICB0aGlzLmRvbS5hY3RpdmUuaXRlbXNbIGl0ZW0ubmFtZSBdID0gaXRlbS5hY3RpdmU7XG4gICAgICAgICAgICAgIHRoaXMuYXNzZXQubW9kZWwuc2V0KGl0ZW0ubmFtZSwgaXRlbS5tb2RlbCk7XG4gICAgICAgICAgICAgIHRoaXMuYXNzZXQuY29uZmlnLnNldChpdGVtLm5hbWUsIGl0ZW0uY29uZmlnKTtcbiAgICAgICAgICAgICAgdGhpcy51aS5hY3RpdmVDb25maWdzWyBpdGVtLm5hbWUgXSA9IG5ldyBDaGVja2JveENvbmZpZyh7XG4gICAgICAgICAgICAgICAgaWQ6IGl0ZW0uaWQsXG4gICAgICAgICAgICAgICAgbmFtZTogJ2FjdGl2ZScsXG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGl0ZW0ucmVxdWlyZWQgPyB0cnVlIDogZmFsc2UsXG4gICAgICAgICAgICAgICAgdmFsdWU6ICtpdGVtLmFjdGl2ZSxcbiAgICAgICAgICAgICAgICAvLyBwYXRjaDogY29sdW1uLnJlcXVpcmVkID8gbnVsbCA6IHtcbiAgICAgICAgICAgICAgICAvLyAgIGZpZWxkOiAnYWN0aXZlJyxcbiAgICAgICAgICAgICAgICAvLyAgIHBhdGg6IGBjaXMvZmllbGRzLyR7dGhpcy5jb25maWcuaWR9L2l0ZW0vJHtjb2x1bW4uaWR9YCxcbiAgICAgICAgICAgICAgICAvLyAgIGRpc3BsYXlJbmRpY2F0b3I6IGZhbHNlLFxuICAgICAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIHRoaXMudWkuaXRlbXMucHVzaChpdGVtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMudWkubWFwLml0ZW1zWyBpdGVtLm5hbWUgXSA9IGluZGV4O1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgdGhpcy51aS5zZWN0aW9ucyA9IDxTZWN0aW9uSW50ZXJmYWNlW10+W1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBpZDogJ3BhcmFtcycsXG4gICAgICAgICAgICAgIG5hbWU6ICdQYXJhbXMnLFxuICAgICAgICAgICAgICBpbnB1dHM6IHt9LFxuICAgICAgICAgICAgICBjb21wb25lbnQ6IG51bGwsXG4gICAgICAgICAgICAgIG1ldGFkYXRhOiB7fSxcbiAgICAgICAgICAgICAgcmVxdWlyZVJlZnJlc2g6IGZhbHNlLCAgICAgICAgLy8gcmVxdWlyZSBhbiBhcGkgY2FsbCB0byByZWZyZXNoIHRoZSBlbnRpdHkgb24gZXZlcnkgbG9hZFxuICAgICAgICAgICAgICBhY3RpdmU6IHRydWUsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBpZDogJ29wdGlvbnMnLFxuICAgICAgICAgICAgICBuYW1lOiAnT3B0aW9ucycsXG4gICAgICAgICAgICAgIGlucHV0czoge30sXG4gICAgICAgICAgICAgIGNvbXBvbmVudDogbnVsbCxcbiAgICAgICAgICAgICAgbWV0YWRhdGE6IHt9LFxuICAgICAgICAgICAgICByZXF1aXJlUmVmcmVzaDogZmFsc2UsICAgICAgICAvLyByZXF1aXJlIGFuIGFwaSBjYWxsIHRvIHJlZnJlc2ggdGhlIGVudGl0eSBvbiBldmVyeSBsb2FkXG4gICAgICAgICAgICAgIGFjdGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvLyB7XG4gICAgICAgICAgICAvLyAgIGlkOiAnZGVmYXVsdFZhbHVlcycsXG4gICAgICAgICAgICAvLyAgIG5hbWU6ICdEZWZhdWx0IFZhbHVlcycsXG4gICAgICAgICAgICAvLyAgIGlucHV0czoge30sXG4gICAgICAgICAgICAvLyAgIGNvbXBvbmVudDogRGVtb1R3b0NvbXBvbmVudCxcbiAgICAgICAgICAgIC8vICAgbWV0YWRhdGE6IHt9LFxuICAgICAgICAgICAgLy8gICByZXF1aXJlUmVmcmVzaDogZmFsc2UsICAgICAgICAvLyByZXF1aXJlIGFuIGFwaSBjYWxsIHRvIHJlZnJlc2ggdGhlIGVudGl0eSBvbiBldmVyeSBsb2FkXG4gICAgICAgICAgICAvLyB9XG4gICAgICAgICAgXTtcblxuXG4gICAgICAgICAgaWYoIHRoaXMudWkuaXRlbXNbIDAgXSApe1xuICAgICAgICAgICAgLy8gdGhpcy5vblNlbGVjdGlvbih0aGlzLnVpLml0ZW1zWyAwIF0pO1xuICAgICAgICAgICAgLy8gaWYoIHRoaXMuZG9tLmFjdGl2ZS5pdGVtICl7XG4gICAgICAgICAgICAvLyBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMub25BY3RpdmVJdGVtU2VsZWN0aW9uKHRoaXMudWkuaXRlbXNbIDAgXSk7XG4gICAgICAgICAgICAvLyB9KTtcbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIGNvbXBvbmVudCB3aWxsIGFsbG93IGEgdXNlciB0byBjb25maWd1cmUgY3VzdG9tIHNldHRpbmdzIGZvciBlYWNoIG9mIGl0ZW1zIHRoYXQgaXQgaG9sZHNcbiAgICogVGhlIENvcmVDb25maWcgb2YgdGhpcyBjb21wb25lbnQgd2lsbCBiZSBhIHNwZWNpZmljIHNjaGVtZVxuICAgKiBUaGUgY29uZmlnIG9mIHRoaXMgY29tcG9uZW50IGlzIGV4cGVjdGVkIHRvIGJlIGEgc2NoZW1lIGFzc2V0IHRoYXQgaXMgb2YgdHlwZSBmaWVsZFxuICAgKi9cbiAgbmdPbkluaXQoKXtcbiAgICBzdXBlci5uZ09uSW5pdCgpO1xuICB9XG5cblxuICAvKipcbiAgICogVGhlIHVzZXIgd2lsbCBiZSBhYmxlIHRvIGFjdGl2ZS9kZWFjdGl2ZSBhIHNwZWNpZmljIGl0ZW0gaW4gdGhlIGxpc3Qgb2YgaXRlbXMgZm9yIHRoaXMgZmllbGRcbiAgICogQHBhcmFtIGl0ZW1cbiAgICovXG4gIG9uSXRlbVN0YXR1c0NoYW5nZShldmVudDogUG9wQmFzZUV2ZW50SW50ZXJmYWNlKXtcbiAgICBpZiggZXZlbnQudHlwZSA9PT0gJ2ZpZWxkJyAmJiBldmVudC5uYW1lID09PSAncGF0Y2gnICYmIGV2ZW50LnN1Y2Nlc3MgKXtcbiAgICAgIHRoaXMubG9nLmV2ZW50KCdvbkl0ZW1TdGF0dXNDaGFuZ2UnLCBldmVudCk7XG4gICAgICB0aGlzLmRvbS5hY3RpdmUuaXRlbXNbIGV2ZW50LmNvbmZpZy5pZCBdID0gK2V2ZW50LmNvbmZpZy5jb250cm9sLnZhbHVlO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoZSB1c2VyIHdpbGwgYmUgYWJsZSB0byBzZWxlY3QgZnJvbSBhIGxpc3Qgb2YgaXRlbSBhbiBhY3RpdmUgaXRlbSBpbiB3aGljaCB0byBjb25maWd1cmUgc2V0dGluZ3NcbiAgICogQHBhcmFtIGl0ZW1cbiAgICovXG4gIG9uQWN0aXZlSXRlbVNlbGVjdGlvbihpdGVtKXtcbiAgICBjb25zb2xlLmxvZygnb25BY3RpdmVJdGVtU2VsZWN0aW9uJywgaXRlbSk7XG4gICAgdGhpcy5kb20uYWN0aXZlLml0ZW0gPSBpdGVtO1xuICAgIGlmKCB0aGlzLmRvbS5hY3RpdmUuaXRlbS5vcHRpb25zICkgdGhpcy5fc2V0QWN0aXZlSXRlbU9wdGlvbkNvbmZpZ3VyYXRpb24oKTtcbiAgICB0aGlzLmRvbS5hY3RpdmUubW9kZWwgPSBJc09iamVjdFRocm93RXJyb3IodGhpcy5kb20uYWN0aXZlLml0ZW0ubW9kZWwsIHRydWUsIGAke3RoaXMubmFtZX06b25TZWxlY3Rpb24gLSBtb2RlbGApID8gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLmRvbS5hY3RpdmUuaXRlbS5tb2RlbCkpIDoge307XG4gICAgLy8gdGhpcy5kb20uYWN0aXZlLnBhcmFtcyA9IElzT2JqZWN0VGhyb3dFcnJvcih0aGlzLmRvbS5hY3RpdmUuaXRlbS5jb25maWcsIHRydWUsIGAke3RoaXMubmFtZX06b25TZWxlY3Rpb24gLSBjb25maWdgKSA/IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5kb20uYWN0aXZlLml0ZW0uY29uZmlnKSkgOiB7fTtcbiAgICAvLyB0aGlzLmRvbS5hY3RpdmUuY29uZmlnID0gSXNPYmplY3RUaHJvd0Vycm9yKHRoaXMuY29uZmlnLmFzc2V0Lml0ZW1zWyB0aGlzLnVpLm1hcC5pdGVtc1sgaXRlbS5uYW1lIF0gXS5jb25maWcsIHRydWUsIGAke3RoaXMubmFtZX06b25TZWxlY3Rpb24gLSBjb25maWdgKSA/IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5jb25maWcuYXNzZXQuaXRlbXNbIHRoaXMudWkubWFwLml0ZW1zWyBpdGVtLm5hbWUgXSBdLmNvbmZpZykpIDoge307XG4gICAgaWYoIHRoaXMuZG9tLmFjdGl2ZS5pdGVtLmlkICYmIHRoaXMuZG9tLnNlc3Npb25bIHRoaXMuZG9tLmFjdGl2ZS5pdGVtLmlkIF0gKXtcbiAgICAgIHRoaXMub25BY3RpdmVJdGVtU2V0dGluZ1NlY3Rpb25TZWxlY3Rpb24odGhpcy5kb20uc2Vzc2lvblsgdGhpcy5kb20uYWN0aXZlLml0ZW0uaWQgXSk7XG4gICAgfWVsc2V7XG4gICAgICB0aGlzLm9uQWN0aXZlSXRlbVNldHRpbmdTZWN0aW9uU2VsZWN0aW9uKHRoaXMudWkuc2VjdGlvbnNbIDAgXSk7IC8vIHBhcmFtc1xuICAgIH1cbiAgICB0aGlzLl9zZXRBY3RpdmVJdGVtUGFyYW1Db25maWd1cmF0aW9uKCk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGUgdXNlciBuZWVkcyB0aGUgY2hhbmdlcyBpdCBhY3RpdmUgaXRlbSBvcHRpb25zIHRvIGJlIHNhdmVkIHRvIHRoZSBkYXRhYmFzZVxuICAgKiBAcGFyYW0gZXZlbnRcbiAgICovXG4gIG9uU2F2ZUFjdGl2ZUl0ZW1PcHRpb25zKGV2ZW50OiBQb3BCYXNlRXZlbnRJbnRlcmZhY2Upe1xuICAgIGNvbnNvbGUubG9nKCd0cmlnZ2VyU2F2ZUZpZWxkT3B0aW9uczpzdHViJywgZXZlbnQpO1xuICB9XG5cblxuICAvKipcbiAgICogVGhlcmUgbWlnaHQgYmUgbXVsdGlwbGUgdGFiIHNlY3Rpb25zIHRvIHRoZSBzZXR0aW5nIG9mIHRoaXMgYWN0aXZlIGl0ZW1cbiAgICogQHBhcmFtIHNlY3Rpb25cbiAgICovXG4gIG9uQWN0aXZlSXRlbVNldHRpbmdTZWN0aW9uU2VsZWN0aW9uKHNlY3Rpb246IFNlY3Rpb25JbnRlcmZhY2Upe1xuICAgIHRoaXMuZG9tLmFjdGl2ZS5zZWN0aW9uID0gc2VjdGlvbi5pZDtcbiAgICB0aGlzLmRvbS5zZXNzaW9uWyB0aGlzLmRvbS5hY3RpdmUuaXRlbS5pZCBdID0gc2VjdGlvbjtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoZSB1c2VyIGlzIGFibGUgdG8gc29ydCB0aGUgb3B0aW9ucyB0aGF0IHNob3VsZCBiZSB1c2VkIHRvIHBvcHVsYXRlIHRoZSBmaWVsZCwgaWYgYXBwbGljYWJsZVxuICAgKi9cbiAgb25BY3RpdmVJdGVtT3B0aW9uU29ydERyb3AoZXZlbnQ6IENka0RyYWdEcm9wPHN0cmluZ1tdPil7XG4gICAgbW92ZUl0ZW1JbkFycmF5KHRoaXMuZG9tLmFjdGl2ZS5vcHRpb25zLCBldmVudC5wcmV2aW91c0luZGV4LCBldmVudC5jdXJyZW50SW5kZXgpO1xuICAgIHRoaXMub25TYXZlQWN0aXZlSXRlbU9wdGlvbnMoPFBvcEJhc2VFdmVudEludGVyZmFjZT57IG5hbWU6ICdvbkNoYW5nZScgfSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGUgdXNlciBzaG91bGQgYmUgYWJsZSB0byBjbGljayBhIGJ1dHRvbiB0byBjbG9zZSB0aGUgbW9kYWxcbiAgICovXG4gIG9uTW9kYWxDbG9zZSgpe1xuICAgIHRoaXMuZGlhbG9nUmVmLmNsb3NlKDApO1xuICB9XG5cblxuICAvKipcbiAgICogQ2xlYW4gdXAgdGhlIGRvbSBvZiB0aGlzIGNvbXBvbmVudFxuICAgKi9cbiAgbmdPbkRlc3Ryb3koKXtcbiAgICB0aGlzLnRlbXBsYXRlLmRlc3Ryb3koKTtcbiAgICBzdXBlci5uZ09uRGVzdHJveSgpO1xuICB9XG5cblxuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFVuZGVyIFRoZSBIb29kICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICggUHJpdmF0ZSBNZXRob2QgKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuICBwcml2YXRlIF9zZXRBY3RpdmVJdGVtUGFyYW1Db25maWd1cmF0aW9uKCl7XG4gICAgaWYoIElzT2JqZWN0KHRoaXMuZG9tLmFjdGl2ZS5jb25maWcsIHRydWUpICYmIElzT2JqZWN0KHRoaXMuZG9tLmFjdGl2ZS5wYXJhbXMsIHRydWUpICl7XG4gICAgICB0aGlzLl9nZXRQYXJhbUNvbmZpZ3VyYXRpb25Db21wb25lbnRMaXN0KHRoaXMuZG9tLmFjdGl2ZS5jb25maWcsIHRoaXMuZG9tLmFjdGl2ZS5wYXJhbXMpLnRoZW4oKHBhcmFtQ29tcG9uZW50TGlzdDogRHluYW1pY0NvbXBvbmVudEludGVyZmFjZVtdKSA9PiB7XG4gICAgICAgIHRoaXMudGVtcGxhdGUucmVuZGVyKHBhcmFtQ29tcG9uZW50TGlzdCwgW10sIHRydWUpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cblxuICBwcml2YXRlIF9nZXRQYXJhbUNvbmZpZ3VyYXRpb25Db21wb25lbnRMaXN0KGZpZWxkSXRlbTogRGljdGlvbmFyeTxhbnk+LCBwYXJhbXM6IERpY3Rpb25hcnk8YW55Pik6IFByb21pc2U8RHluYW1pY0NvbXBvbmVudEludGVyZmFjZVtdPntcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgIGNvbnN0IHBhcmFtQ29tcG9uZW50TGlzdDogRHluYW1pY0NvbXBvbmVudEludGVyZmFjZVtdID0gW107XG4gICAgICBsZXQgY29tcG9uZW50O1xuICAgICAgbGV0IGNvbmZpZ0ludGVyZmFjZTtcbiAgICAgIGlmKCB0aGlzLmRvbS5hY3RpdmUubW9kZWwuZm9ybSBpbiB0aGlzLmFzc2V0LnBhcmFtcyApe1xuICAgICAgICBPYmplY3Qua2V5cyhwYXJhbXMpLm1hcCgocGFyYW1LZXkpID0+IHtcbiAgICAgICAgICBpZiggcGFyYW1LZXkgaW4gdGhpcy5hc3NldC5wYXJhbXNbIHRoaXMuZG9tLmFjdGl2ZS5tb2RlbC5mb3JtIF0gKXtcbiAgICAgICAgICAgIGNvbmZpZ0ludGVyZmFjZSA9IHtcbiAgICAgICAgICAgICAgLi4ue1xuICAgICAgICAgICAgICAgIG5hbWU6IFRpdGxlQ2FzZShTbmFrZVRvUGFzY2FsKHBhcmFtS2V5KSksXG4gICAgICAgICAgICAgICAgdmFsdWU6IGZpZWxkSXRlbVsgcGFyYW1LZXkgXSxcbiAgICAgICAgICAgICAgICBjb2x1bW46IHBhcmFtS2V5LFxuICAgICAgICAgICAgICAgIHJlYWRvbmx5OiBbICdhcGknLCAnY29sdW1uJyBdLmluY2x1ZGVzKHBhcmFtS2V5KSA/IHRydWUgOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBwYXRjaDogeyBmaWVsZDogcGFyYW1LZXksIHBhdGg6IGAke2ZpZWxkSXRlbS5hcGlfcGF0aH0vY29uZmlnYCB9XG4gICAgICAgICAgICAgIH0sIC4uLnBhcmFtc1sgcGFyYW1LZXkgXVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbmZpZ0ludGVyZmFjZS5wYXRjaC5wYXRoID0gJyc7IC8vIFRvRG86IG5lZWQgdG8gYmUgdGhlIGNvcnJlY3QgcGF0aCB0byBzYXZlIHNldHRpbmcgdG8gcHJvZmlsZV9zY2hlbWUgc2V0dGluZyBzdG9yYWdlPz8/P1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ2NvbmZpZ0ludGVyZmFjZScsIGNvbmZpZ0ludGVyZmFjZSk7XG4gICAgICAgICAgICBjb21wb25lbnQgPSA8RHluYW1pY0NvbXBvbmVudEludGVyZmFjZT57XG4gICAgICAgICAgICAgIHR5cGU6IHRoaXMuX2RldGVybWluZVBhcmFtU2V0dGluZ0NvbXBvbmVudChwYXJhbUtleSksXG4gICAgICAgICAgICAgIGlucHV0czoge1xuICAgICAgICAgICAgICAgIGNvbmZpZzogY29uZmlnSW50ZXJmYWNlLFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcGFyYW1Db21wb25lbnRMaXN0LnB1c2goY29tcG9uZW50KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICByZXNvbHZlKHBhcmFtQ29tcG9uZW50TGlzdCk7XG4gICAgfSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmUgdGhlIGNvcnJlY3QgY29tcG9uZW50IGZvciB0aGUgZm9ybSB0eXBlXG4gICAqIEBwYXJhbSBmb3JtXG4gICAqL1xuICBwcml2YXRlIF9kZXRlcm1pbmVQYXJhbVNldHRpbmdDb21wb25lbnQoZm9ybSl7XG4gICAgc3dpdGNoKCBmb3JtICl7XG4gICAgICBjYXNlICdsYWJlbCc6XG4gICAgICAgIHJldHVybiBGaWVsZExhYmVsU2V0dGluZ0NvbXBvbmVudDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdkaXNwbGF5JzpcbiAgICAgIGNhc2UgJ2FwaSc6XG4gICAgICBjYXNlICdjb2x1bW4nOlxuICAgICAgY2FzZSAnc29ydF90b3AnOlxuICAgICAgY2FzZSAnc29ydCc6XG4gICAgICBjYXNlICdoZWxwVGV4dCc6XG4gICAgICAgIHJldHVybiBGaWVsZElucHV0U2V0dGluZ0NvbXBvbmVudDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdzZWxlY3QnOlxuICAgICAgY2FzZSAnbWFzayc6XG4gICAgICBjYXNlICdwYXR0ZXJuJzpcbiAgICAgIGNhc2UgJ21heGxlbmd0aCc6XG4gICAgICBjYXNlICd0cmFuc2Zvcm1hdGlvbic6XG4gICAgICAgIHJldHVybiBGaWVsZFNlbGVjdFNldHRpbmdDb21wb25lbnQ7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnaGlkZGVuJzpcbiAgICAgIGNhc2UgJ3Zpc2libGUnOlxuICAgICAgY2FzZSAnZGlzYWJsZWQnOlxuICAgICAgY2FzZSAncmVhZG9ubHknOlxuICAgICAgY2FzZSAncmVxdWlyZWQnOlxuICAgICAgICByZXR1cm4gRmllbGRTd2l0Y2hTZXR0aW5nQ29tcG9uZW50O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2xheW91dCc6XG4gICAgICAgIHJldHVybiBGaWVsZFJhZGlvU2V0dGluZ0NvbXBvbmVudDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdtZXRhZGF0YSc6XG4gICAgICAgIHJldHVybiBGaWVsZFRleHRhcmVhU2V0dGluZ0NvbXBvbmVudDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gRmllbGRMYWJlbFNldHRpbmdDb21wb25lbnQ7XG4gICAgfVxuICB9XG5cblxuICBwcml2YXRlIF9zZXRBY3RpdmVJdGVtT3B0aW9uQ29uZmlndXJhdGlvbigpe1xuICAgIHRoaXMuZG9tLmFjdGl2ZS5vcHRpb25zID0gW107XG4gICAgaWYoIHRoaXMuZG9tLmFjdGl2ZS5pdGVtLm9wdGlvbnMgJiYgQXJyYXkuaXNBcnJheSh0aGlzLmRvbS5hY3RpdmUuaXRlbS5vcHRpb25zLnZhbHVlcykgKXtcbiAgICAgIHRoaXMuZG9tLmFjdGl2ZS5pdGVtLm9wdGlvbnMudmFsdWVzLm1hcCgob3B0aW9uLCBpbmRleCkgPT4ge1xuICAgICAgICBvcHRpb24uc29ydCA9IGluZGV4O1xuICAgICAgICBpZiggdHlwZW9mIG9wdGlvbi5hY3RpdmUgIT09ICdib29sZWFuJyApIG9wdGlvbi5hY3RpdmUgPSB0cnVlO1xuICAgICAgICBpZiggdHlwZW9mIG9wdGlvbi5uYW1lICE9PSAnc3RyaW5nJyApIG9wdGlvbi5uYW1lID0gJyc7XG4gICAgICAgIGlmKCB0eXBlb2Ygb3B0aW9uLnZhbHVlICE9PSAnc3RyaW5nJyApIG9wdGlvbi52YWx1ZSA9ICcnO1xuICAgICAgICB0aGlzLmRvbS5hY3RpdmUub3B0aW9ucy5wdXNoKHtcbiAgICAgICAgICBhY3RpdmU6IG5ldyBDaGVja2JveENvbmZpZyh7XG4gICAgICAgICAgICBsYWJlbDogbnVsbCxcbiAgICAgICAgICAgIHZhbHVlOiArb3B0aW9uLmFjdGl2ZSxcbiAgICAgICAgICAgIGJ1YmJsZTogdHJ1ZSxcbiAgICAgICAgICB9KSxcbiAgICAgICAgICBuYW1lOiBuZXcgSW5wdXRDb25maWcoe1xuICAgICAgICAgICAgbGFiZWw6IG51bGwsXG4gICAgICAgICAgICB2YWx1ZTogb3B0aW9uLm5hbWUsXG4gICAgICAgICAgICB2YWxpZGF0b3JzOiBbIFZhbGlkYXRvcnMucmVxdWlyZWQgXSxcbiAgICAgICAgICAgIHRyYW5zZm9ybWF0aW9uOiAndGl0bGUnLFxuICAgICAgICAgICAgYnViYmxlOiB0cnVlLFxuICAgICAgICAgICAgcGF0dGVybjogJ0FscGhhTm9TcGFjZU9ubHlEYXNoJyxcbiAgICAgICAgICAgIG1heGxlbmd0aDogMTIsXG4gICAgICAgICAgICByZWFkb25seTogdHJ1ZVxuICAgICAgICAgIH0pLFxuICAgICAgICAgIHZhbHVlOiBuZXcgSW5wdXRDb25maWcoe1xuICAgICAgICAgICAgbGFiZWw6IG51bGwsXG4gICAgICAgICAgICB2YWx1ZTogb3B0aW9uLnZhbHVlIHx8IDAsXG4gICAgICAgICAgICBidWJibGU6IHRydWUsXG4gICAgICAgICAgICBwYXR0ZXJuOiAnQWxwaGFOdW1lcmljJyxcbiAgICAgICAgICAgIHRyYW5zZm9ybWF0aW9uOiAnbG93ZXInLFxuICAgICAgICAgICAgbWF4bGVuZ3RoOiAxMjgsXG4gICAgICAgICAgICByZWFkb25seTogdHJ1ZVxuICAgICAgICAgIH0pLFxuICAgICAgICAgIHNvcnQ6IG5ldyBJbnB1dENvbmZpZyh7XG4gICAgICAgICAgICBsYWJlbDogbnVsbCxcbiAgICAgICAgICAgIHZhbHVlOiBvcHRpb24uc29ydCB8fCAwLFxuICAgICAgICAgICAgYnViYmxlOiB0cnVlLFxuICAgICAgICAgIH0pLFxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgfWVsc2V7XG4gICAgICB0aGlzLm9uQWN0aXZlSXRlbVNldHRpbmdTZWN0aW9uU2VsZWN0aW9uKHRoaXMudWkuc2VjdGlvbnNbIDAgXSk7IC8vIHBhcmFtc1xuICAgIH1cbiAgfVxufVxuIl19