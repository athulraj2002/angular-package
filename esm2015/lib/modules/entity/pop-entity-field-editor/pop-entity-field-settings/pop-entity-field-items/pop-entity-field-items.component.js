import { __awaiter } from "tslib";
import { Component, ElementRef, Input } from '@angular/core';
import { PopExtendComponent } from '../../../../../pop-extend.component';
import { CheckboxConfig } from '../../../../base/pop-field-item/pop-checkbox/checkbox-config.model';
import { PopDomService } from '../../../../../services/pop-dom.service';
import { ArrayMapSetter, CleanObject, IsArrayThrowError, IsDefined, IsObject, IsObjectThrowError, IsString } from '../../../../../pop-common-utility';
import { PopFieldEditorService } from '../../pop-entity-field-editor.service';
export class PopEntityFieldItemsComponent extends PopExtendComponent {
    /**
     * @param el
     * @param _domRepo - transfer
     * @param _fieldRepo - transfer
     */
    constructor(el, _domRepo, _fieldRepo) {
        super();
        this.el = el;
        this._domRepo = _domRepo;
        this._fieldRepo = _fieldRepo;
        this.scheme = null;
        this.name = 'PopEntityFieldItemsComponent';
        this.srv = {
            field: undefined
        };
        this.asset = {
            fieldgroup: undefined,
        };
        this.ui = {
            field: undefined,
            coreItems: undefined,
            items: undefined,
            fieldItemHelper: '',
            map: {},
            customSetting: {}
        };
        /**
         * This should transformValue and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
         */
        this.dom.configure = () => {
            return new Promise((resolve) => {
                // #1: Enforce a CoreConfig
                this.core = IsObjectThrowError(this.core, ['entity'], `${this.name}:configureDom: - this.core`) ? this.core : null;
                // Set the height boundary
                if (!this.field)
                    this.field = this.core.entity;
                this._setHeight();
                // Set event Handlers
                this.dom.handler.core = (core, event) => this._coreEventHandler(event);
                // Create a container to track the active items
                this.dom.active.items = {};
                // Transfer any resources for the entityId data
                this.asset.fieldgroup = IsObjectThrowError(this.core.entity, ['fieldgroup'], `${this.name}:: - this.core.entity.fieldgroup`) ? CleanObject(this.core.entity.fieldgroup) : null;
                // this.asset.coreRules = {};  // the settings that can be changed
                // this.asset.coreItemModels = {}; // where the settings that can be changed are stored
                this.ui.coreItems = IsArrayThrowError(this.core.resource.items.data_values, true, `${this.name}:configureDom: - this.core.resource.items`) ? this.core.resource.items.data_values.filter((item) => {
                    return !(this.srv.field.getViewIgnored(this.asset.fieldgroup.name, item.name, this.scheme));
                }).map((value) => CleanObject(value)) : [];
                this.ui.map.coreItems = ArrayMapSetter(this.ui.coreItems, 'name');
                this.ui.fieldItemHelper = `Select which attributes will be part of this ${this.asset.fieldgroup.name} field. Click on a field to edit individual field item settings.`;
                this.ui.items = IsArrayThrowError(this.core.entity.items, true, `${this.name}:: - this.core.entity.items`) ? this.core.entity.items.map((item) => CleanObject(item)) : null;
                if (IsObject(this.scheme)) {
                    this.ui.items = this.ui.items.filter((item) => {
                        return +item.active === 1;
                    });
                }
                this.ui.map.items = ArrayMapSetter(this.ui.items, 'name');
                // Build the custom settings
                this._buildCustomSettings();
                // Build the Active Items for this field
                this._buildActiveItems();
                this._selectDefaultItem();
                // Select the first field attribute item so that the view will have something to render
                return resolve(true);
            });
        };
        this.dom.proceed = () => {
            return new Promise((resolve) => {
                if (this.dom.active.labelSettings) {
                    this.onActiveLabelSelection();
                    setTimeout(() => {
                        this.onActiveLabelSelection();
                    });
                }
                else if (IsObject(this.dom.active.item, ['id'])) {
                    this.onActiveItemSelection(this.dom.active.item);
                    setTimeout(() => {
                        this.onActiveItemSelection(this.dom.active.item);
                    });
                }
                else if (true) {
                    this.onActiveLabelSelection();
                    setTimeout(() => {
                        this.onActiveLabelSelection();
                    });
                }
                else {
                    this._selectDefaultItem();
                }
                return resolve(true);
            });
        };
    }
    /**
     * We expect the core to represent a field
     * This component lists out all of the field attributes that this field has, and allows for the user to active/deactivate specific items.
     */
    ngOnInit() {
        super.ngOnInit();
    }
    /**
     * This handles when a user click on a checkbox to activate/deactivate a specific field attribute
     * @param event
     */
    onItemActiveChange(event) {
        // #1: Make sure that change was stored in the database
        if (event.type === 'field' && event.name === 'patch' && event.success) {
            if (this.log.repo.enabled('event', this.name))
                console.log(this.log.repo.message(`${this.name}:itemActiveHandler`), this.log.repo.color('event'), event);
            // #2: Update the change on the domRepo so other components can now about the change
            this.dom.repo.ui.activeItems[event.config.id] = +event.config.control.value;
            // #3: Send an event to the FieldBuilderPreviewComponent to update that this field attribute was activated/deactivated
            this.core.channel.next({ source: this.name, target: 'PopEntityFieldPreviewComponent', type: 'component', name: 'update' });
        }
    }
    /**
     * This handles when a user click on a checkbox to activate/deactivate a specific field attribute
     * @param event
     */
    onEditLabelChange(event) {
        console.log('onCustomSettingChange', event);
    }
    /**
     * On selection is an event when a user click on a specific field attribute to manage its settings
     * @param item
     */
    onActiveItemSelection(item) {
        this.log.info(`onActiveItemSelection`, item);
        if (!this.dom.state.saving && IsObject(item, ['id'])) {
            this.dom.active.labelSettings = false;
            // #1. Build a data package to send to the FieldBuilderItemSettingsComponent component
            this.dom.active.item = item;
            // #2: Send an event with the data package to the FieldBuilderItemSettingsComponent component
            const event = {
                type: 'component',
                name: 'active-item',
                source: this.name,
                target: 'PopEntityFieldItemParamsComponent',
                data: item
                // data: { item: item, models: itemModels, config: itemConfig }
            };
            this.dom.store('active');
            this.core.channel.emit(event); // core channel is the shared radio between all components on the core
        }
    }
    /**
     * On selection is an event when a user click on a specific field attribute to manage its settings
     * @param item
     */
    onActiveLabelSelection() {
        this.log.info(`onActiveLabelSelection`);
        this.dom.active['item'] = null;
        this.dom.active.labelSettings = true;
        const event = {
            type: 'component',
            name: 'label-settings',
            source: this.name,
            target: 'PopEntityFieldItemParamsComponent',
            data: {}
        };
        this.core.channel.emit(event); // core channel is the shared radio between all components on the core
        this.dom.store('active');
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
    /**
     * Select the the first field item available
     */
    _selectDefaultItem() {
        if (this.ui.coreItems[0]) {
            const coreItem = this.ui.coreItems[0];
            const realItem = this.ui.items[this.ui.map.items[coreItem.name]];
            this.onActiveItemSelection(realItem);
            if (this.dom.active.item) { // seems to need a double tap  to be consistent
                setTimeout(() => {
                    this.onActiveItemSelection(realItem);
                });
            }
        }
    }
    /**
     * This handler is for managing an cross-communication between components on the core channel
     * @param event
     */
    _coreEventHandler(event) {
        this.log.event(`_coreEventHandler`, event);
        // if( IsValidFieldPatchEvent(this.core, event) ){
        //   if( event.config.name === 'multiple' && !event.config.control.value && this.dom.active.labelSettings ){
        //     this._selectDefaultItem();
        //     // this._setHeight();
        //   }
        // }
    }
    /**
     * Build configs that control the active state for each field item
     */
    _buildActiveItems() {
        this.dom.repo.ui.activeItems = {}; // stored on domRepo so that other components can use it
        const isScheme = IsObject(this.scheme, true);
        this.ui.coreItems.map((coreItem, index) => {
            const realItem = this.ui.items[this.ui.map.items[coreItem.name]];
            if (IsObject(realItem, ['id', 'name'])) {
                // item.required = typeof coreItem.required !== 'undefined' ? +coreItem.required : 1;
                // console.log('item', item);
                // console.log('coreItem', coreItem);
                // ToDo:: coreFieldItem needs to have required attribute
                // this.ui.map.items[ item.name ] = index;
                // item.name = SnakeToPascal(item.name);
                coreItem.required = this.srv.field.getViewRequired(this.asset.fieldgroup.name, realItem.name);
                if (coreItem.required)
                    realItem.active = 1;
                let itemActive = +realItem.active;
                if (isScheme) {
                    const schemeFieldItemSession = this.srv.field.getSchemeFieldItemMapping(this.scheme, +this.field.id, realItem.id);
                    console.log('schemeFieldItemSession', realItem.id, schemeFieldItemSession);
                    if (IsDefined(schemeFieldItemSession.active)) {
                        itemActive = +schemeFieldItemSession.active;
                    }
                }
                this.dom.active.items[realItem.id] = new CheckboxConfig({
                    id: realItem.id,
                    name: 'active',
                    align: 'left',
                    disabled: coreItem.required || !this.core.access.can_update ? true : false,
                    value: itemActive,
                    facade: isScheme,
                    patch: coreItem.required ? null : {
                        field: 'active',
                        path: isScheme ? null : `fields/customs/${realItem.id}`,
                        displayIndicator: true,
                        callback: isScheme ? (core, event) => __awaiter(this, void 0, void 0, function* () {
                            const session = this.srv.field.getSchemeFieldItemMapping(this.scheme, +this.field.id, realItem.id);
                            if (IsObject(session)) {
                                session.active = event.config.control.value;
                                yield this.srv.field.updateSchemeFieldMapping(this.scheme);
                            }
                        }) : null
                    },
                });
                this.dom.repo.ui.activeItems[realItem.id] = +realItem.active;
            }
        });
    }
    /**
     * Build the configs for any relevant custom settings
     * @private
     */
    _buildCustomSettings() {
        if (IsObject(this.field.custom_setting, ['edit_label'])) {
            const setting = this.field.custom_setting.edit_label;
            this.ui.customSetting['edit_label'] = new CheckboxConfig({
                id: setting.id,
                align: 'left',
                name: 'edit_label',
                disabled: true,
                value: true,
                metadata: { setting: setting },
                facade: true,
                patch: {
                    field: ``,
                    path: ``,
                    callback: (core, event) => {
                        this.dom.state.saving = true;
                        if (IsObject(this.scheme, true)) {
                            console.log('save setting to a scheme');
                            console.log('event', event);
                            console.log('setting', setting);
                        }
                        else {
                            this.srv.field.storeCustomSetting(core, event).then((res) => {
                                if (IsString(res, true)) {
                                    this.ui.customSetting['edit_label'].message = res;
                                }
                                this.dom.setTimeout('allow-save', () => {
                                    this.dom.state.saving = false;
                                }, 500);
                            });
                        }
                    }
                }
            });
        }
    }
    /**
     * Determine the layout height to control overflow
     *
     */
    _setHeight() {
        this.dom.overhead = 135;
        // this.dom.height.outer = +this.dom.repo.position[ this.position ].height - 121;
        // const field = <FieldInterface>this.core.entity;
        //
        // if( false && field.multiple ){
        //   this.dom.height.outer -= 20;
        //   this.dom.height.outer -= ( +field.multiple_min * 60 );
        // }
        // if( this.dom.height.outer < 400 ) this.dom.height.outer = 400;
        this.dom.setHeight(400, this.dom.overhead);
    }
}
PopEntityFieldItemsComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-field-builder-items',
                template: "<div class=\"entity-field-items-container\" *ngIf=\"dom.state.loaded\" [style.height.px]=dom.height.outer>\n  <!--<div>-->\n    <!--<div class=\"entity-field-editor-item sw-pointer\" [ngClass]=\"{'entity-field-editor-active-selection':dom.active.labelSettings}\" (click)=\"onActiveLabelSelection();\">-->\n      <!--<div class=\"entity-field-editor-item-active-selector\" (click)=\"$event.stopPropagation()\">-->\n        <!--<lib-pop-checkbox [config]=\"ui.customSetting.edit_label\" (events)=\"onEditLabelChange($event);\"></lib-pop-checkbox>-->\n      <!--</div>-->\n      <!--<div class=\"editor-field-editor-item-label-name\">-->\n        <!--<div *ngIf=\"!field?.multiple\">Entry</div>-->\n        <!--<div *ngIf=\"field?.multiple\">Entries</div>-->\n      <!--</div>-->\n      <!--<div class=\"entityId-field-editor-item-label-helper\">-->\n        <!--&lt;!&ndash;<div class=\"sw-pop-icon entityId-field-editor-item-helper-icon\" matTooltip=\"{{realItem.view.description}}\" matTooltipPosition=\"left\">&ndash;&gt;-->\n        <!--&lt;!&ndash;X&ndash;&gt;-->\n        <!--&lt;!&ndash;</div>&ndash;&gt;-->\n      <!--</div>-->\n    <!--</div>-->\n  <!--</div>-->\n  <div *ngFor=\"let coreItem of ui.coreItems\">\n    <div class=\"entity-field-editor-item sw-pointer\" [ngClass]=\"{'entity-field-editor-active-selection':dom.active['item']?.id === realItem.id}\" *ngIf=\"ui.items[ui.map.items[coreItem.name]]; let realItem;\" (click)=\"onActiveItemSelection(realItem);\">\n      <div class=\"entity-field-editor-item-active-selector\" (click)=\"$event.stopPropagation()\">\n        <lib-pop-checkbox *ngIf=\"dom.active['items'][realItem.id]\" [config]=\"dom.active['items'][realItem.id]\" (events)=\"onItemActiveChange($event);\"></lib-pop-checkbox>\n      </div>\n      <div class=\"editor-field-editor-item-label-name\">{{coreItem.label}}</div>\n      <div class=\"entityId-field-editor-item-label-helper\">\n        <!--<div class=\"sw-pop-icon entityId-field-editor-item-helper-icon\" matTooltip=\"{{realItem.view.description}}\" matTooltipPosition=\"left\">-->\n        <!--X-->\n        <!--</div>-->\n      </div>\n    </div>\n  </div>\n\n  <div class=\"entity-field-editor-item-filler\"></div>\n</div>\n",
                styles: [".entity-field-editor-header{display:flex;flex-direction:column;height:97px}.entity-field-editor-header-section{position:relative;width:100%;box-sizing:border-box;height:30px;clear:both}.entity-field-editor-container{min-height:100px;position:relative}.entity-field-editor-border{border:1px solid var(--border)}.entity-field-editor-section-header{position:relative;display:flex;flex-direction:row;height:40px;padding:0 5px 0 10px;align-items:center;justify-content:space-between;font-size:1em;font-weight:700;clear:both;box-sizing:border-box;background:var(--darken02)}.entity-field-editor-section-header-helper-icon{width:20px;height:20px;font-size:1em;z-index:2}.entity-field-editor-active-selection{padding-left:0!important;border-left:5px solid var(--primary)}.entity-field-editor-active-config{border-left:5px solid var(--primary)}.entity-field-items-container{display:flex;flex-direction:column;min-width:200px;overflow-x:hidden;overflow-y:auto}.entity-field-editor-item{display:flex;align-items:center;justify-content:flex-start;box-sizing:border-box;-moz-box-sizing:border-box;border:1px solid transparent;border-right:1px solid var(--border);border-bottom:none;height:40px}.entity-field-editor-item-filler{flex:1;border-right:1px solid var(--border)}.entity-field-editor-item:hover{background-color:var(--darken02)}.entity-field-editor-item-active-selector{position:relative;display:flex;flex-direction:row;width:15%;box-sizing:border-box;-moz-box-sizing:border-box;align-items:center;justify-content:center;padding-left:10px}.editor-field-editor-item-label-name{width:75%;display:flex;align-items:center;justify-content:flex-start;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.entity-field-editor-item-label-helper{display:flex;width:10%;align-items:center;justify-content:center;min-height:40px}.entity-field-editor-item-helper-icon{margin-top:10px;margin-right:2px;width:20px;height:20px;font-size:.7em;z-index:2}.entity-field-editor-active-selection{border:1px solid var(--border)!important;border-right:1px solid transparent!important}:host ::ng-deep .pop-checkbox-container{margin-top:0!important}"]
            },] }
];
PopEntityFieldItemsComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: PopDomService },
    { type: PopFieldEditorService }
];
PopEntityFieldItemsComponent.propDecorators = {
    field: [{ type: Input }],
    scheme: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS1maWVsZC1pdGVtcy5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9lbnRpdHkvcG9wLWVudGl0eS1maWVsZC1lZGl0b3IvcG9wLWVudGl0eS1maWVsZC1zZXR0aW5ncy9wb3AtZW50aXR5LWZpZWxkLWl0ZW1zL3BvcC1lbnRpdHktZmllbGQtaXRlbXMuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQXFCLE1BQU0sZUFBZSxDQUFDO0FBQ2hGLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBR3pFLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxvRUFBb0UsQ0FBQztBQUNwRyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFDeEUsT0FBTyxFQUNMLGNBQWMsRUFDZCxXQUFXLEVBRVgsaUJBQWlCLEVBQ2pCLFNBQVMsRUFDVCxRQUFRLEVBQ1Isa0JBQWtCLEVBQ2xCLFFBQVEsRUFFVCxNQUFNLG1DQUFtQyxDQUFDO0FBQzNDLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBUzlFLE1BQU0sT0FBTyw0QkFBNkIsU0FBUSxrQkFBa0I7SUF1QmxFOzs7O09BSUc7SUFDSCxZQUNTLEVBQWMsRUFDWCxRQUF1QixFQUN2QixVQUFpQztRQUUzQyxLQUFLLEVBQUUsQ0FBQztRQUpELE9BQUUsR0FBRixFQUFFLENBQVk7UUFDWCxhQUFRLEdBQVIsUUFBUSxDQUFlO1FBQ3ZCLGVBQVUsR0FBVixVQUFVLENBQXVCO1FBN0JwQyxXQUFNLEdBQWlDLElBQUksQ0FBQztRQUM5QyxTQUFJLEdBQUcsOEJBQThCLENBQUM7UUFFbkMsUUFBRyxHQUFHO1lBQ2Qs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QUFDOzs7WUF6V0YsU0FBUyxTQUFFO2dCQUNWLFFBQVEsRUFBRSx5QkFBeUI7Z0JBQ25DLHFyRUFBc0Q7O2FBRXZEOzs7WUF6Qm1CLFVBQVU7WUFLckIsYUFBYTtZQVliLHFCQUFxQjs7O29CQVUzQixLQUFLO3FCQUNMLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEVsZW1lbnRSZWYsIElucHV0LCBPbkRlc3Ryb3ksIE9uSW5pdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgUG9wRXh0ZW5kQ29tcG9uZW50IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vcG9wLWV4dGVuZC5jb21wb25lbnQnO1xuaW1wb3J0IHsgQ29yZUNvbmZpZywgRGljdGlvbmFyeSwgRW50aXR5LCBGaWVsZEdyb3VwSW50ZXJmYWNlLCBGaWVsZEludGVyZmFjZSwgRmllbGRJdGVtSW50ZXJmYWNlLCBQb3BCYXNlRXZlbnRJbnRlcmZhY2UsIFBvcFJlcXVlc3QgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9wb3AtY29tbW9uLm1vZGVsJztcblxuaW1wb3J0IHsgQ2hlY2tib3hDb25maWcgfSBmcm9tICcuLi8uLi8uLi8uLi9iYXNlL3BvcC1maWVsZC1pdGVtL3BvcC1jaGVja2JveC9jaGVja2JveC1jb25maWcubW9kZWwnO1xuaW1wb3J0IHsgUG9wRG9tU2VydmljZSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3NlcnZpY2VzL3BvcC1kb20uc2VydmljZSc7XG5pbXBvcnQge1xuICBBcnJheU1hcFNldHRlcixcbiAgQ2xlYW5PYmplY3QsXG4gIEdldEh0dHBSZXN1bHQsXG4gIElzQXJyYXlUaHJvd0Vycm9yLFxuICBJc0RlZmluZWQsXG4gIElzT2JqZWN0LFxuICBJc09iamVjdFRocm93RXJyb3IsXG4gIElzU3RyaW5nLFxuICBTdG9yYWdlU2V0dGVyXG59IGZyb20gJy4uLy4uLy4uLy4uLy4uL3BvcC1jb21tb24tdXRpbGl0eSc7XG5pbXBvcnQgeyBQb3BGaWVsZEVkaXRvclNlcnZpY2UgfSBmcm9tICcuLi8uLi9wb3AtZW50aXR5LWZpZWxkLWVkaXRvci5zZXJ2aWNlJztcbmltcG9ydCB7IEVudGl0eVNjaGVtZVNlY3Rpb25JbnRlcmZhY2UgfSBmcm9tICcuLi8uLi8uLi9wb3AtZW50aXR5LXNjaGVtZS9wb3AtZW50aXR5LXNjaGVtZS5tb2RlbCc7XG5cblxuQENvbXBvbmVudCgge1xuICBzZWxlY3RvcjogJ2xpYi1maWVsZC1idWlsZGVyLWl0ZW1zJyxcbiAgdGVtcGxhdGVVcmw6ICcuL3BvcC1lbnRpdHktZmllbGQtaXRlbXMuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsgJy4vcG9wLWVudGl0eS1maWVsZC1pdGVtcy5jb21wb25lbnQuc2NzcycgXVxufSApXG5leHBvcnQgY2xhc3MgUG9wRW50aXR5RmllbGRJdGVtc0NvbXBvbmVudCBleHRlbmRzIFBvcEV4dGVuZENvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcbiAgQElucHV0KCkgZmllbGQ6IEZpZWxkSW50ZXJmYWNlO1xuICBASW5wdXQoKSBzY2hlbWU6IEVudGl0eVNjaGVtZVNlY3Rpb25JbnRlcmZhY2UgPSBudWxsO1xuICBwdWJsaWMgbmFtZSA9ICdQb3BFbnRpdHlGaWVsZEl0ZW1zQ29tcG9uZW50JztcblxuICBwcm90ZWN0ZWQgc3J2ID0ge1xuICAgIGZpZWxkOiA8UG9wRmllbGRFZGl0b3JTZXJ2aWNlPnVuZGVmaW5lZFxuICB9O1xuXG4gIHByb3RlY3RlZCBhc3NldCA9IHtcbiAgICBmaWVsZGdyb3VwOiA8RW50aXR5PnVuZGVmaW5lZCxcbiAgfTtcblxuICBwdWJsaWMgdWkgPSB7XG4gICAgZmllbGQ6IDxGaWVsZEludGVyZmFjZT51bmRlZmluZWQsXG4gICAgY29yZUl0ZW1zOiA8YW55W10+dW5kZWZpbmVkLFxuICAgIGl0ZW1zOiA8YW55W10+dW5kZWZpbmVkLFxuICAgIGZpZWxkSXRlbUhlbHBlcjogJycsXG4gICAgbWFwOiA8RGljdGlvbmFyeTxhbnk+Pnt9LFxuICAgIGN1c3RvbVNldHRpbmc6IDxEaWN0aW9uYXJ5PGFueT4+e31cbiAgfTtcblxuXG4gIC8qKlxuICAgKiBAcGFyYW0gZWxcbiAgICogQHBhcmFtIF9kb21SZXBvIC0gdHJhbnNmZXJcbiAgICogQHBhcmFtIF9maWVsZFJlcG8gLSB0cmFuc2ZlclxuICAgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIGVsOiBFbGVtZW50UmVmLFxuICAgIHByb3RlY3RlZCBfZG9tUmVwbzogUG9wRG9tU2VydmljZSxcbiAgICBwcm90ZWN0ZWQgX2ZpZWxkUmVwbzogUG9wRmllbGRFZGl0b3JTZXJ2aWNlXG4gICl7XG4gICAgc3VwZXIoKTtcblxuICAgIC8qKlxuICAgICAqIFRoaXMgc2hvdWxkIHRyYW5zZm9ybVZhbHVlIGFuZCB2YWxpZGF0ZSB0aGUgZGF0YS4gVGhlIHZpZXcgc2hvdWxkIHRyeSB0byBvbmx5IHVzZSBkYXRhIHRoYXQgaXMgc3RvcmVkIG9uIHVpIHNvIHRoYXQgaXQgaXMgbm90IGRlcGVuZGVudCBvbiB0aGUgc3RydWN0dXJlIG9mIGRhdGEgdGhhdCBjb21lcyBmcm9tIG90aGVyIHNvdXJjZXMuIFRoZSB1aSBzaG91bGQgYmUgdGhlIHNvdXJjZSBvZiB0cnV0aCBoZXJlLlxuICAgICAqL1xuICAgIHRoaXMuZG9tLmNvbmZpZ3VyZSA9ICgpOiBQcm9taXNlPGJvb2xlYW4+ID0+IHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSggKCByZXNvbHZlICkgPT4ge1xuICAgICAgICAvLyAjMTogRW5mb3JjZSBhIENvcmVDb25maWdcbiAgICAgICAgdGhpcy5jb3JlID0gSXNPYmplY3RUaHJvd0Vycm9yKCB0aGlzLmNvcmUsIFsgJ2VudGl0eScgXSwgYCR7dGhpcy5uYW1lfTpjb25maWd1cmVEb206IC0gdGhpcy5jb3JlYCApID8gdGhpcy5jb3JlIDogbnVsbDtcbiAgICAgICAgLy8gU2V0IHRoZSBoZWlnaHQgYm91bmRhcnlcblxuICAgICAgICBpZiggIXRoaXMuZmllbGQgKSB0aGlzLmZpZWxkID0gdGhpcy5jb3JlLmVudGl0eTtcblxuICAgICAgICB0aGlzLl9zZXRIZWlnaHQoKTtcblxuICAgICAgICAvLyBTZXQgZXZlbnQgSGFuZGxlcnNcbiAgICAgICAgdGhpcy5kb20uaGFuZGxlci5jb3JlID0gKCBjb3JlOiBDb3JlQ29uZmlnLCBldmVudDogUG9wQmFzZUV2ZW50SW50ZXJmYWNlICkgPT4gdGhpcy5fY29yZUV2ZW50SGFuZGxlciggZXZlbnQgKTtcbiAgICAgICAgLy8gQ3JlYXRlIGEgY29udGFpbmVyIHRvIHRyYWNrIHRoZSBhY3RpdmUgaXRlbXNcbiAgICAgICAgdGhpcy5kb20uYWN0aXZlLml0ZW1zID0ge307XG5cblxuICAgICAgICAvLyBUcmFuc2ZlciBhbnkgcmVzb3VyY2VzIGZvciB0aGUgZW50aXR5SWQgZGF0YVxuICAgICAgICB0aGlzLmFzc2V0LmZpZWxkZ3JvdXAgPSBJc09iamVjdFRocm93RXJyb3IoIHRoaXMuY29yZS5lbnRpdHksIFsgJ2ZpZWxkZ3JvdXAnIF0sIGAke3RoaXMubmFtZX06OiAtIHRoaXMuY29yZS5lbnRpdHkuZmllbGRncm91cGAgKSA/IDxFbnRpdHk+Q2xlYW5PYmplY3QoIHRoaXMuY29yZS5lbnRpdHkuZmllbGRncm91cCApIDogbnVsbDtcbiAgICAgICAgLy8gdGhpcy5hc3NldC5jb3JlUnVsZXMgPSB7fTsgIC8vIHRoZSBzZXR0aW5ncyB0aGF0IGNhbiBiZSBjaGFuZ2VkXG4gICAgICAgIC8vIHRoaXMuYXNzZXQuY29yZUl0ZW1Nb2RlbHMgPSB7fTsgLy8gd2hlcmUgdGhlIHNldHRpbmdzIHRoYXQgY2FuIGJlIGNoYW5nZWQgYXJlIHN0b3JlZFxuICAgICAgICB0aGlzLnVpLmNvcmVJdGVtcyA9IElzQXJyYXlUaHJvd0Vycm9yKCB0aGlzLmNvcmUucmVzb3VyY2UuaXRlbXMuZGF0YV92YWx1ZXMsIHRydWUsIGAke3RoaXMubmFtZX06Y29uZmlndXJlRG9tOiAtIHRoaXMuY29yZS5yZXNvdXJjZS5pdGVtc2AgKSA/IHRoaXMuY29yZS5yZXNvdXJjZS5pdGVtcy5kYXRhX3ZhbHVlcy5maWx0ZXIoICggaXRlbSApID0+IHtcbiAgICAgICAgICByZXR1cm4gISggdGhpcy5zcnYuZmllbGQuZ2V0Vmlld0lnbm9yZWQoIHRoaXMuYXNzZXQuZmllbGRncm91cC5uYW1lLCBpdGVtLm5hbWUsIHRoaXMuc2NoZW1lICkgKTtcbiAgICAgICAgfSApLm1hcCggKCB2YWx1ZSApID0+IENsZWFuT2JqZWN0KCB2YWx1ZSApICkgOiBbXTtcblxuICAgICAgICB0aGlzLnVpLm1hcC5jb3JlSXRlbXMgPSBBcnJheU1hcFNldHRlciggdGhpcy51aS5jb3JlSXRlbXMsICduYW1lJyApO1xuXG5cbiAgICAgICAgdGhpcy51aS5maWVsZEl0ZW1IZWxwZXIgPSBgU2VsZWN0IHdoaWNoIGF0dHJpYnV0ZXMgd2lsbCBiZSBwYXJ0IG9mIHRoaXMgJHt0aGlzLmFzc2V0LmZpZWxkZ3JvdXAubmFtZX0gZmllbGQuIENsaWNrIG9uIGEgZmllbGQgdG8gZWRpdCBpbmRpdmlkdWFsIGZpZWxkIGl0ZW0gc2V0dGluZ3MuYDtcbiAgICAgICAgdGhpcy51aS5pdGVtcyA9IElzQXJyYXlUaHJvd0Vycm9yKCB0aGlzLmNvcmUuZW50aXR5Lml0ZW1zLCB0cnVlLCBgJHt0aGlzLm5hbWV9OjogLSB0aGlzLmNvcmUuZW50aXR5Lml0ZW1zYCApID8gdGhpcy5jb3JlLmVudGl0eS5pdGVtcy5tYXAoICggaXRlbSApID0+IENsZWFuT2JqZWN0KCBpdGVtICkgKSA6IG51bGw7XG4gICAgICAgIGlmKCBJc09iamVjdCggdGhpcy5zY2hlbWUgKSApe1xuICAgICAgICAgIHRoaXMudWkuaXRlbXMgPSB0aGlzLnVpLml0ZW1zLmZpbHRlciggKCBpdGVtOiBGaWVsZEl0ZW1JbnRlcmZhY2UgKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gK2l0ZW0uYWN0aXZlID09PSAxO1xuICAgICAgICAgIH0gKTtcblxuICAgICAgICB9XG4gICAgICAgIHRoaXMudWkubWFwLml0ZW1zID0gQXJyYXlNYXBTZXR0ZXIoIHRoaXMudWkuaXRlbXMsICduYW1lJyApO1xuXG4gICAgICAgIC8vIEJ1aWxkIHRoZSBjdXN0b20gc2V0dGluZ3NcbiAgICAgICAgdGhpcy5fYnVpbGRDdXN0b21TZXR0aW5ncygpO1xuICAgICAgICAvLyBCdWlsZCB0aGUgQWN0aXZlIEl0ZW1zIGZvciB0aGlzIGZpZWxkXG4gICAgICAgIHRoaXMuX2J1aWxkQWN0aXZlSXRlbXMoKTtcbiAgICAgICAgdGhpcy5fc2VsZWN0RGVmYXVsdEl0ZW0oKTtcbiAgICAgICAgLy8gU2VsZWN0IHRoZSBmaXJzdCBmaWVsZCBhdHRyaWJ1dGUgaXRlbSBzbyB0aGF0IHRoZSB2aWV3IHdpbGwgaGF2ZSBzb21ldGhpbmcgdG8gcmVuZGVyXG5cblxuICAgICAgICByZXR1cm4gcmVzb2x2ZSggdHJ1ZSApO1xuICAgICAgfSApO1xuXG4gICAgfTtcblxuICAgIHRoaXMuZG9tLnByb2NlZWQgPSAoKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoICggcmVzb2x2ZSApID0+IHtcbiAgICAgICAgaWYoIHRoaXMuZG9tLmFjdGl2ZS5sYWJlbFNldHRpbmdzICl7XG4gICAgICAgICAgdGhpcy5vbkFjdGl2ZUxhYmVsU2VsZWN0aW9uKCk7XG4gICAgICAgICAgc2V0VGltZW91dCggKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5vbkFjdGl2ZUxhYmVsU2VsZWN0aW9uKCk7XG4gICAgICAgICAgfSApO1xuICAgICAgICB9ZWxzZSBpZiggSXNPYmplY3QoIHRoaXMuZG9tLmFjdGl2ZS5pdGVtLCBbICdpZCcgXSApICl7XG4gICAgICAgICAgdGhpcy5vbkFjdGl2ZUl0ZW1TZWxlY3Rpb24oIHRoaXMuZG9tLmFjdGl2ZS5pdGVtICk7XG4gICAgICAgICAgc2V0VGltZW91dCggKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5vbkFjdGl2ZUl0ZW1TZWxlY3Rpb24oIHRoaXMuZG9tLmFjdGl2ZS5pdGVtICk7XG4gICAgICAgICAgfSApO1xuICAgICAgICB9ZWxzZSBpZiggdHJ1ZSApe1xuICAgICAgICAgIHRoaXMub25BY3RpdmVMYWJlbFNlbGVjdGlvbigpO1xuICAgICAgICAgIHNldFRpbWVvdXQoICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMub25BY3RpdmVMYWJlbFNlbGVjdGlvbigpO1xuICAgICAgICAgIH0gKTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgdGhpcy5fc2VsZWN0RGVmYXVsdEl0ZW0oKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzb2x2ZSggdHJ1ZSApO1xuICAgICAgfSApO1xuICAgIH07XG4gIH1cblxuXG4gIC8qKlxuICAgKiBXZSBleHBlY3QgdGhlIGNvcmUgdG8gcmVwcmVzZW50IGEgZmllbGRcbiAgICogVGhpcyBjb21wb25lbnQgbGlzdHMgb3V0IGFsbCBvZiB0aGUgZmllbGQgYXR0cmlidXRlcyB0aGF0IHRoaXMgZmllbGQgaGFzLCBhbmQgYWxsb3dzIGZvciB0aGUgdXNlciB0byBhY3RpdmUvZGVhY3RpdmF0ZSBzcGVjaWZpYyBpdGVtcy5cbiAgICovXG4gIG5nT25Jbml0KCl7XG4gICAgc3VwZXIubmdPbkluaXQoKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgaGFuZGxlcyB3aGVuIGEgdXNlciBjbGljayBvbiBhIGNoZWNrYm94IHRvIGFjdGl2YXRlL2RlYWN0aXZhdGUgYSBzcGVjaWZpYyBmaWVsZCBhdHRyaWJ1dGVcbiAgICogQHBhcmFtIGV2ZW50XG4gICAqL1xuICBvbkl0ZW1BY3RpdmVDaGFuZ2UoIGV2ZW50OiBQb3BCYXNlRXZlbnRJbnRlcmZhY2UgKXtcbiAgICAvLyAjMTogTWFrZSBzdXJlIHRoYXQgY2hhbmdlIHdhcyBzdG9yZWQgaW4gdGhlIGRhdGFiYXNlXG4gICAgaWYoIGV2ZW50LnR5cGUgPT09ICdmaWVsZCcgJiYgZXZlbnQubmFtZSA9PT0gJ3BhdGNoJyAmJiBldmVudC5zdWNjZXNzICl7XG4gICAgICBpZiggdGhpcy5sb2cucmVwby5lbmFibGVkKCAnZXZlbnQnLCB0aGlzLm5hbWUgKSApIGNvbnNvbGUubG9nKCB0aGlzLmxvZy5yZXBvLm1lc3NhZ2UoIGAke3RoaXMubmFtZX06aXRlbUFjdGl2ZUhhbmRsZXJgICksIHRoaXMubG9nLnJlcG8uY29sb3IoICdldmVudCcgKSwgZXZlbnQgKTtcbiAgICAgIC8vICMyOiBVcGRhdGUgdGhlIGNoYW5nZSBvbiB0aGUgZG9tUmVwbyBzbyBvdGhlciBjb21wb25lbnRzIGNhbiBub3cgYWJvdXQgdGhlIGNoYW5nZVxuICAgICAgdGhpcy5kb20ucmVwby51aS5hY3RpdmVJdGVtc1sgZXZlbnQuY29uZmlnLmlkIF0gPSArZXZlbnQuY29uZmlnLmNvbnRyb2wudmFsdWU7XG4gICAgICAvLyAjMzogU2VuZCBhbiBldmVudCB0byB0aGUgRmllbGRCdWlsZGVyUHJldmlld0NvbXBvbmVudCB0byB1cGRhdGUgdGhhdCB0aGlzIGZpZWxkIGF0dHJpYnV0ZSB3YXMgYWN0aXZhdGVkL2RlYWN0aXZhdGVkXG4gICAgICB0aGlzLmNvcmUuY2hhbm5lbC5uZXh0KCB7IHNvdXJjZTogdGhpcy5uYW1lLCB0YXJnZXQ6ICdQb3BFbnRpdHlGaWVsZFByZXZpZXdDb21wb25lbnQnLCB0eXBlOiAnY29tcG9uZW50JywgbmFtZTogJ3VwZGF0ZScgfSApO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgaGFuZGxlcyB3aGVuIGEgdXNlciBjbGljayBvbiBhIGNoZWNrYm94IHRvIGFjdGl2YXRlL2RlYWN0aXZhdGUgYSBzcGVjaWZpYyBmaWVsZCBhdHRyaWJ1dGVcbiAgICogQHBhcmFtIGV2ZW50XG4gICAqL1xuICBvbkVkaXRMYWJlbENoYW5nZSggZXZlbnQ6IFBvcEJhc2VFdmVudEludGVyZmFjZSApe1xuICAgIGNvbnNvbGUubG9nKCAnb25DdXN0b21TZXR0aW5nQ2hhbmdlJywgZXZlbnQgKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIE9uIHNlbGVjdGlvbiBpcyBhbiBldmVudCB3aGVuIGEgdXNlciBjbGljayBvbiBhIHNwZWNpZmljIGZpZWxkIGF0dHJpYnV0ZSB0byBtYW5hZ2UgaXRzIHNldHRpbmdzXG4gICAqIEBwYXJhbSBpdGVtXG4gICAqL1xuICBvbkFjdGl2ZUl0ZW1TZWxlY3Rpb24oIGl0ZW0gKXtcbiAgICB0aGlzLmxvZy5pbmZvKCBgb25BY3RpdmVJdGVtU2VsZWN0aW9uYCwgaXRlbSApO1xuICAgIGlmKCAhdGhpcy5kb20uc3RhdGUuc2F2aW5nICYmIElzT2JqZWN0KCBpdGVtLCBbICdpZCcgXSApICl7XG4gICAgICB0aGlzLmRvbS5hY3RpdmUubGFiZWxTZXR0aW5ncyA9IGZhbHNlO1xuICAgICAgLy8gIzEuIEJ1aWxkIGEgZGF0YSBwYWNrYWdlIHRvIHNlbmQgdG8gdGhlIEZpZWxkQnVpbGRlckl0ZW1TZXR0aW5nc0NvbXBvbmVudCBjb21wb25lbnRcbiAgICAgIHRoaXMuZG9tLmFjdGl2ZS5pdGVtID0gaXRlbTtcbiAgICAgIC8vICMyOiBTZW5kIGFuIGV2ZW50IHdpdGggdGhlIGRhdGEgcGFja2FnZSB0byB0aGUgRmllbGRCdWlsZGVySXRlbVNldHRpbmdzQ29tcG9uZW50IGNvbXBvbmVudFxuICAgICAgY29uc3QgZXZlbnQgPSA8UG9wQmFzZUV2ZW50SW50ZXJmYWNlPntcbiAgICAgICAgdHlwZTogJ2NvbXBvbmVudCcsXG4gICAgICAgIG5hbWU6ICdhY3RpdmUtaXRlbScsXG4gICAgICAgIHNvdXJjZTogdGhpcy5uYW1lLFxuICAgICAgICB0YXJnZXQ6ICdQb3BFbnRpdHlGaWVsZEl0ZW1QYXJhbXNDb21wb25lbnQnLCAvLyB0YXJnZXQgc3BlY2lmaWVzIHRoYXQgc3BlY2lmaWMgY29tcG9uZW50IHRoYXQgc2hvdWxkIGFjdCBvbiB0aGlzIGV2ZW50XG4gICAgICAgIGRhdGE6IGl0ZW1cbiAgICAgICAgLy8gZGF0YTogeyBpdGVtOiBpdGVtLCBtb2RlbHM6IGl0ZW1Nb2RlbHMsIGNvbmZpZzogaXRlbUNvbmZpZyB9XG4gICAgICB9O1xuICAgICAgdGhpcy5kb20uc3RvcmUoICdhY3RpdmUnICk7XG4gICAgICB0aGlzLmNvcmUuY2hhbm5lbC5lbWl0KCBldmVudCApOyAvLyBjb3JlIGNoYW5uZWwgaXMgdGhlIHNoYXJlZCByYWRpbyBiZXR3ZWVuIGFsbCBjb21wb25lbnRzIG9uIHRoZSBjb3JlXG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogT24gc2VsZWN0aW9uIGlzIGFuIGV2ZW50IHdoZW4gYSB1c2VyIGNsaWNrIG9uIGEgc3BlY2lmaWMgZmllbGQgYXR0cmlidXRlIHRvIG1hbmFnZSBpdHMgc2V0dGluZ3NcbiAgICogQHBhcmFtIGl0ZW1cbiAgICovXG4gIG9uQWN0aXZlTGFiZWxTZWxlY3Rpb24oKXtcbiAgICB0aGlzLmxvZy5pbmZvKCBgb25BY3RpdmVMYWJlbFNlbGVjdGlvbmAgKTtcbiAgICB0aGlzLmRvbS5hY3RpdmVbICdpdGVtJyBdID0gbnVsbDtcbiAgICB0aGlzLmRvbS5hY3RpdmUubGFiZWxTZXR0aW5ncyA9IHRydWU7XG4gICAgY29uc3QgZXZlbnQgPSA8UG9wQmFzZUV2ZW50SW50ZXJmYWNlPntcbiAgICAgIHR5cGU6ICdjb21wb25lbnQnLFxuICAgICAgbmFtZTogJ2xhYmVsLXNldHRpbmdzJyxcbiAgICAgIHNvdXJjZTogdGhpcy5uYW1lLFxuICAgICAgdGFyZ2V0OiAnUG9wRW50aXR5RmllbGRJdGVtUGFyYW1zQ29tcG9uZW50JywgLy8gdGFyZ2V0IHNwZWNpZmllcyB0aGF0IHNwZWNpZmljIGNvbXBvbmVudCB0aGF0IHNob3VsZCBhY3Qgb24gdGhpcyBldmVudFxuICAgICAgZGF0YToge31cbiAgICB9O1xuICAgIHRoaXMuY29yZS5jaGFubmVsLmVtaXQoIGV2ZW50ICk7IC8vIGNvcmUgY2hhbm5lbCBpcyB0aGUgc2hhcmVkIHJhZGlvIGJldHdlZW4gYWxsIGNvbXBvbmVudHMgb24gdGhlIGNvcmVcbiAgICB0aGlzLmRvbS5zdG9yZSggJ2FjdGl2ZScgKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoZSBkb20gZGVzdHJveSBmdW5jdGlvbiBtYW5hZ2VzIGFsbCB0aGUgY2xlYW4gdXAgdGhhdCBpcyBuZWNlc3NhcnkgaWYgc3Vic2NyaXB0aW9ucywgdGltZW91dHMsIGV0YyBhcmUgc3RvcmVkIHByb3Blcmx5XG4gICAqL1xuICBuZ09uRGVzdHJveSgpe1xuICAgIHN1cGVyLm5nT25EZXN0cm95KCk7XG4gIH1cblxuXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVW5kZXIgVGhlIEhvb2QgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBQcml2YXRlIE1ldGhvZCApICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4gIC8qKlxuICAgKiBTZWxlY3QgdGhlIHRoZSBmaXJzdCBmaWVsZCBpdGVtIGF2YWlsYWJsZVxuICAgKi9cbiAgcHJpdmF0ZSBfc2VsZWN0RGVmYXVsdEl0ZW0oKXtcbiAgICBpZiggdGhpcy51aS5jb3JlSXRlbXNbIDAgXSApe1xuICAgICAgY29uc3QgY29yZUl0ZW0gPSB0aGlzLnVpLmNvcmVJdGVtc1sgMCBdO1xuICAgICAgY29uc3QgcmVhbEl0ZW0gPSB0aGlzLnVpLml0ZW1zWyB0aGlzLnVpLm1hcC5pdGVtc1sgY29yZUl0ZW0ubmFtZSBdIF07XG4gICAgICB0aGlzLm9uQWN0aXZlSXRlbVNlbGVjdGlvbiggcmVhbEl0ZW0gKTtcbiAgICAgIGlmKCB0aGlzLmRvbS5hY3RpdmUuaXRlbSApeyAvLyBzZWVtcyB0byBuZWVkIGEgZG91YmxlIHRhcCAgdG8gYmUgY29uc2lzdGVudFxuICAgICAgICBzZXRUaW1lb3V0KCAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5vbkFjdGl2ZUl0ZW1TZWxlY3Rpb24oIHJlYWxJdGVtICk7XG4gICAgICAgIH0gKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIGhhbmRsZXIgaXMgZm9yIG1hbmFnaW5nIGFuIGNyb3NzLWNvbW11bmljYXRpb24gYmV0d2VlbiBjb21wb25lbnRzIG9uIHRoZSBjb3JlIGNoYW5uZWxcbiAgICogQHBhcmFtIGV2ZW50XG4gICAqL1xuICBwcml2YXRlIF9jb3JlRXZlbnRIYW5kbGVyKCBldmVudDogUG9wQmFzZUV2ZW50SW50ZXJmYWNlICl7XG4gICAgdGhpcy5sb2cuZXZlbnQoIGBfY29yZUV2ZW50SGFuZGxlcmAsIGV2ZW50ICk7XG4gICAgLy8gaWYoIElzVmFsaWRGaWVsZFBhdGNoRXZlbnQodGhpcy5jb3JlLCBldmVudCkgKXtcbiAgICAvLyAgIGlmKCBldmVudC5jb25maWcubmFtZSA9PT0gJ211bHRpcGxlJyAmJiAhZXZlbnQuY29uZmlnLmNvbnRyb2wudmFsdWUgJiYgdGhpcy5kb20uYWN0aXZlLmxhYmVsU2V0dGluZ3MgKXtcbiAgICAvLyAgICAgdGhpcy5fc2VsZWN0RGVmYXVsdEl0ZW0oKTtcbiAgICAvLyAgICAgLy8gdGhpcy5fc2V0SGVpZ2h0KCk7XG4gICAgLy8gICB9XG4gICAgLy8gfVxuICB9XG5cblxuICAvKipcbiAgICogQnVpbGQgY29uZmlncyB0aGF0IGNvbnRyb2wgdGhlIGFjdGl2ZSBzdGF0ZSBmb3IgZWFjaCBmaWVsZCBpdGVtXG4gICAqL1xuICBwcml2YXRlIF9idWlsZEFjdGl2ZUl0ZW1zKCl7XG4gICAgdGhpcy5kb20ucmVwby51aS5hY3RpdmVJdGVtcyA9IHt9OyAvLyBzdG9yZWQgb24gZG9tUmVwbyBzbyB0aGF0IG90aGVyIGNvbXBvbmVudHMgY2FuIHVzZSBpdFxuXG4gICAgY29uc3QgaXNTY2hlbWUgPSBJc09iamVjdCggdGhpcy5zY2hlbWUsIHRydWUgKTtcblxuICAgIHRoaXMudWkuY29yZUl0ZW1zLm1hcCggKCBjb3JlSXRlbSwgaW5kZXggKSA9PiB7XG4gICAgICBjb25zdCByZWFsSXRlbSA9IHRoaXMudWkuaXRlbXNbIHRoaXMudWkubWFwLml0ZW1zWyBjb3JlSXRlbS5uYW1lIF0gXTtcblxuICAgICAgaWYoIElzT2JqZWN0KCByZWFsSXRlbSwgWyAnaWQnLCAnbmFtZScgXSApICl7XG4gICAgICAgIC8vIGl0ZW0ucmVxdWlyZWQgPSB0eXBlb2YgY29yZUl0ZW0ucmVxdWlyZWQgIT09ICd1bmRlZmluZWQnID8gK2NvcmVJdGVtLnJlcXVpcmVkIDogMTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ2l0ZW0nLCBpdGVtKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ2NvcmVJdGVtJywgY29yZUl0ZW0pO1xuICAgICAgICAvLyBUb0RvOjogY29yZUZpZWxkSXRlbSBuZWVkcyB0byBoYXZlIHJlcXVpcmVkIGF0dHJpYnV0ZVxuXG4gICAgICAgIC8vIHRoaXMudWkubWFwLml0ZW1zWyBpdGVtLm5hbWUgXSA9IGluZGV4O1xuXG4gICAgICAgIC8vIGl0ZW0ubmFtZSA9IFNuYWtlVG9QYXNjYWwoaXRlbS5uYW1lKTtcbiAgICAgICAgY29yZUl0ZW0ucmVxdWlyZWQgPSB0aGlzLnNydi5maWVsZC5nZXRWaWV3UmVxdWlyZWQoIHRoaXMuYXNzZXQuZmllbGRncm91cC5uYW1lLCByZWFsSXRlbS5uYW1lICk7XG4gICAgICAgIGlmKCBjb3JlSXRlbS5yZXF1aXJlZCApIHJlYWxJdGVtLmFjdGl2ZSA9IDE7XG5cbiAgICAgICAgbGV0IGl0ZW1BY3RpdmUgPSArcmVhbEl0ZW0uYWN0aXZlO1xuICAgICAgICBpZiggaXNTY2hlbWUgKXtcbiAgICAgICAgICBjb25zdCBzY2hlbWVGaWVsZEl0ZW1TZXNzaW9uID0gdGhpcy5zcnYuZmllbGQuZ2V0U2NoZW1lRmllbGRJdGVtTWFwcGluZyggdGhpcy5zY2hlbWUsICt0aGlzLmZpZWxkLmlkLCByZWFsSXRlbS5pZCApO1xuICAgICAgICAgIGNvbnNvbGUubG9nKCAnc2NoZW1lRmllbGRJdGVtU2Vzc2lvbicsIHJlYWxJdGVtLmlkLCBzY2hlbWVGaWVsZEl0ZW1TZXNzaW9uICk7XG4gICAgICAgICAgaWYoIElzRGVmaW5lZCggc2NoZW1lRmllbGRJdGVtU2Vzc2lvbi5hY3RpdmUgKSApe1xuICAgICAgICAgICAgaXRlbUFjdGl2ZSA9ICtzY2hlbWVGaWVsZEl0ZW1TZXNzaW9uLmFjdGl2ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5kb20uYWN0aXZlLml0ZW1zWyByZWFsSXRlbS5pZCBdID0gbmV3IENoZWNrYm94Q29uZmlnKCB7XG4gICAgICAgICAgaWQ6IHJlYWxJdGVtLmlkLFxuICAgICAgICAgIG5hbWU6ICdhY3RpdmUnLFxuICAgICAgICAgIGFsaWduOiAnbGVmdCcsXG4gICAgICAgICAgZGlzYWJsZWQ6IGNvcmVJdGVtLnJlcXVpcmVkIHx8ICF0aGlzLmNvcmUuYWNjZXNzLmNhbl91cGRhdGUgPyB0cnVlIDogZmFsc2UsXG4gICAgICAgICAgdmFsdWU6IGl0ZW1BY3RpdmUsXG4gICAgICAgICAgZmFjYWRlOiBpc1NjaGVtZSxcbiAgICAgICAgICBwYXRjaDogY29yZUl0ZW0ucmVxdWlyZWQgPyBudWxsIDoge1xuICAgICAgICAgICAgZmllbGQ6ICdhY3RpdmUnLFxuICAgICAgICAgICAgcGF0aDogaXNTY2hlbWUgPyBudWxsIDogYGZpZWxkcy9jdXN0b21zLyR7cmVhbEl0ZW0uaWR9YCxcbiAgICAgICAgICAgIGRpc3BsYXlJbmRpY2F0b3I6IHRydWUsXG4gICAgICAgICAgICBjYWxsYmFjazogaXNTY2hlbWUgPyBhc3luYyggY29yZTogQ29yZUNvbmZpZywgZXZlbnQgKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IHNlc3Npb24gPSB0aGlzLnNydi5maWVsZC5nZXRTY2hlbWVGaWVsZEl0ZW1NYXBwaW5nKCB0aGlzLnNjaGVtZSwgK3RoaXMuZmllbGQuaWQsIHJlYWxJdGVtLmlkICk7XG4gICAgICAgICAgICAgIGlmKCBJc09iamVjdCggc2Vzc2lvbiApICl7XG4gICAgICAgICAgICAgICAgc2Vzc2lvbi5hY3RpdmUgPSBldmVudC5jb25maWcuY29udHJvbC52YWx1ZTtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnNydi5maWVsZC51cGRhdGVTY2hlbWVGaWVsZE1hcHBpbmcoIHRoaXMuc2NoZW1lICk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gOiBudWxsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSApO1xuXG4gICAgICAgIHRoaXMuZG9tLnJlcG8udWkuYWN0aXZlSXRlbXNbIHJlYWxJdGVtLmlkIF0gPSArcmVhbEl0ZW0uYWN0aXZlO1xuICAgICAgfVxuICAgIH0gKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEJ1aWxkIHRoZSBjb25maWdzIGZvciBhbnkgcmVsZXZhbnQgY3VzdG9tIHNldHRpbmdzXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBwcml2YXRlIF9idWlsZEN1c3RvbVNldHRpbmdzKCl7XG4gICAgaWYoIElzT2JqZWN0KCB0aGlzLmZpZWxkLmN1c3RvbV9zZXR0aW5nLCBbICdlZGl0X2xhYmVsJyBdICkgKXtcbiAgICAgIGNvbnN0IHNldHRpbmcgPSB0aGlzLmZpZWxkLmN1c3RvbV9zZXR0aW5nLmVkaXRfbGFiZWw7XG5cbiAgICAgIHRoaXMudWkuY3VzdG9tU2V0dGluZ1sgJ2VkaXRfbGFiZWwnIF0gPSBuZXcgQ2hlY2tib3hDb25maWcoIHtcbiAgICAgICAgaWQ6IHNldHRpbmcuaWQsXG4gICAgICAgIGFsaWduOiAnbGVmdCcsXG4gICAgICAgIG5hbWU6ICdlZGl0X2xhYmVsJyxcbiAgICAgICAgZGlzYWJsZWQ6IHRydWUsXG4gICAgICAgIHZhbHVlOiB0cnVlLFxuICAgICAgICBtZXRhZGF0YTogeyBzZXR0aW5nOiBzZXR0aW5nIH0sXG4gICAgICAgIGZhY2FkZTogdHJ1ZSxcbiAgICAgICAgcGF0Y2g6IHtcbiAgICAgICAgICBmaWVsZDogYGAsXG4gICAgICAgICAgcGF0aDogYGAsXG4gICAgICAgICAgY2FsbGJhY2s6ICggY29yZTogQ29yZUNvbmZpZywgZXZlbnQ6IFBvcEJhc2VFdmVudEludGVyZmFjZSApID0+IHtcbiAgICAgICAgICAgIHRoaXMuZG9tLnN0YXRlLnNhdmluZyA9IHRydWU7XG4gICAgICAgICAgICBpZiggSXNPYmplY3QoIHRoaXMuc2NoZW1lLCB0cnVlICkgKXtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coICdzYXZlIHNldHRpbmcgdG8gYSBzY2hlbWUnICk7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKCAnZXZlbnQnLCBldmVudCApO1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyggJ3NldHRpbmcnLCBzZXR0aW5nICk7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgdGhpcy5zcnYuZmllbGQuc3RvcmVDdXN0b21TZXR0aW5nKCBjb3JlLCBldmVudCApLnRoZW4oICggcmVzICkgPT4ge1xuICAgICAgICAgICAgICAgIGlmKCBJc1N0cmluZyggcmVzLCB0cnVlICkgKXtcbiAgICAgICAgICAgICAgICAgIHRoaXMudWkuY3VzdG9tU2V0dGluZ1sgJ2VkaXRfbGFiZWwnIF0ubWVzc2FnZSA9IHJlcztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5kb20uc2V0VGltZW91dCggJ2FsbG93LXNhdmUnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICB0aGlzLmRvbS5zdGF0ZS5zYXZpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9LCA1MDAgKTtcbiAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICB9XG4gICAgICB9ICk7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogRGV0ZXJtaW5lIHRoZSBsYXlvdXQgaGVpZ2h0IHRvIGNvbnRyb2wgb3ZlcmZsb3dcbiAgICpcbiAgICovXG4gIHByaXZhdGUgX3NldEhlaWdodCgpe1xuICAgIHRoaXMuZG9tLm92ZXJoZWFkID0gMTM1O1xuICAgIC8vIHRoaXMuZG9tLmhlaWdodC5vdXRlciA9ICt0aGlzLmRvbS5yZXBvLnBvc2l0aW9uWyB0aGlzLnBvc2l0aW9uIF0uaGVpZ2h0IC0gMTIxO1xuICAgIC8vIGNvbnN0IGZpZWxkID0gPEZpZWxkSW50ZXJmYWNlPnRoaXMuY29yZS5lbnRpdHk7XG4gICAgLy9cbiAgICAvLyBpZiggZmFsc2UgJiYgZmllbGQubXVsdGlwbGUgKXtcbiAgICAvLyAgIHRoaXMuZG9tLmhlaWdodC5vdXRlciAtPSAyMDtcbiAgICAvLyAgIHRoaXMuZG9tLmhlaWdodC5vdXRlciAtPSAoICtmaWVsZC5tdWx0aXBsZV9taW4gKiA2MCApO1xuICAgIC8vIH1cbiAgICAvLyBpZiggdGhpcy5kb20uaGVpZ2h0Lm91dGVyIDwgNDAwICkgdGhpcy5kb20uaGVpZ2h0Lm91dGVyID0gNDAwO1xuICAgIHRoaXMuZG9tLnNldEhlaWdodCggNDAwLCB0aGlzLmRvbS5vdmVyaGVhZCApO1xuICB9XG5cbn1cbiJdfQ==