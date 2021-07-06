import { Component, ElementRef, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { PopExtendDynamicComponent } from '../../../../pop-extend-dynamic.component';
import { PopEntityService } from '../../services/pop-entity.service';
import { PopFieldEditorService } from '../pop-entity-field-editor.service';
import { PopLog, PopTemplate, ServiceInjector } from '../../../../pop-common.model';
import { PopEntityFieldComponent } from '../../pop-entity-field/pop-entity-field.component';
import { SelectConfig } from '../../../base/pop-field-item/pop-select/select-config.model';
import { PopDomService } from '../../../../services/pop-dom.service';
import { DynamicSort, IsArray, IsObject, IsObjectThrowError, SpaceToSnake } from '../../../../pop-common-utility';
import { IsValidFieldPatchEvent } from '../../pop-entity-utility';
import { PopEntityUtilFieldService } from '../../services/pop-entity-util-field.service';
export class PopEntityFieldPreviewComponent extends PopExtendDynamicComponent {
    constructor(el, _domRepo) {
        super();
        this.el = el;
        this._domRepo = _domRepo;
        this.name = 'PopEntityFieldPreviewComponent';
        this.asset = {
            field: undefined,
            fieldgroup: undefined,
            columnKeys: undefined,
        };
        this.ui = {
            stateSelector: new SelectConfig({
                label: 'State',
                value: 'template_edit',
                options: {
                    values: [
                        { value: 'template_edit', name: 'Template Access' },
                        { value: 'template_readonly', name: 'Template Readonly' },
                        { value: 'text_single', name: 'Text Single' },
                        { value: 'text_format', name: 'Text Format' },
                    ]
                }
            }),
            field: undefined
        };
        this.srv = {
            entity: ServiceInjector.get(PopEntityService),
            editor: ServiceInjector.get(PopFieldEditorService),
            field: ServiceInjector.get(PopEntityUtilFieldService),
        };
        this.dom.configure = () => {
            return new Promise((resolve) => {
                this.dom.handler.bubble = (core, event) => this.onBubbleEvent(event);
                //  Verify configs
                this.core = IsObjectThrowError(this.core, ['entity'], `${this.name}:configureDom: - this.core`) ? this.core : null;
                this.field = IsObjectThrowError(this.core.entity, ['fieldgroup', 'entries'], `${this.name}:configureDom: - this.core`) ? this.core.entity : null;
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
                if (this.dom.session.stateSelector)
                    this.ui.stateSelector.control.setValue(this.dom.session.stateSelector, { emitEvent: true });
                // Handle events
                this.dom.handler.core = (core, event) => {
                    this.log.event(`_coreEventHandler`, event);
                    if (IsValidFieldPatchEvent(this.core, event) || (event.type === 'component' && (event.name === 'active-item' || event.name === 'update'))) {
                        this._triggerFieldPreview();
                    }
                    else {
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
        this.dom.proceed = () => {
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
    onBubbleEvent(event) {
        this.log.event(`onBubbleEvent`, event);
        if (IsObject(event, ['type', 'name']) && event.type === 'field') {
            if (event.name === 'onFocus') {
                // stub
            }
            else if (event.name === 'onBlur' || event.name === 'patch') { // whenever a user blurs out of field save the data that is in it
                if (event.config && event.config.control && event.config.control.value) {
                    this.dom.session.form[event.config.name] = event.config.control.value;
                    this.dom.store('onSession'); // dom.store must be called to for the dom to transfer its data up to the domRepo
                }
            }
            else if (event.name === 'add') { // whenever a user blurs out of field save the data that is in it
                this._addFieldValue();
            }
            else if (event.name === 'remove') { // whenever a user blurs out of field save the data that is in it
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
    _addFieldValue() {
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
    _removeFieldValue() {
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
    _setDataSession() {
        if (!this.dom.session.records)
            this.dom.session.records = this.field.multiple_min;
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
    _triggerFieldPreview(delay = 250) {
        this.dom.setTimeout('field-preview', () => {
            this._setFieldPreview();
        }, delay);
    }
    /**
     * This will create a facade field that will a dynamically try to replicate how the field will look when it is in use
     */
    _setFieldPreview() {
        if (this.dom.repo.ui.activeItems) {
            PopTemplate.clear();
            const items = this.field.items;
            const entries = IsArray(this.field.entries, true) ? this.field.entries.filter((entry) => {
                return !entry.orphaned_at;
            }).sort(DynamicSort('sort_order')) : [];
            const fieldInterface = {
                id: 1,
                facade: true,
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
                items: []
            };
            if (fieldInterface.multiple) {
                // if( !fieldInterface.multiple_min ) fieldInterface.multiple_min = 1;
                if (!fieldInterface.multiple_min)
                    fieldInterface.multiple_min = entries.length;
                // let valueIndex = 0;
                let records = this.dom.session.records;
                if (records < +fieldInterface.multiple_min)
                    records = +fieldInterface.multiple_min;
                if (+fieldInterface.multiple_max && records > fieldInterface.multiple_max)
                    records = fieldInterface.multiple_max;
                // while( valueIndex < records ){
                //   fieldInterface.data[ valueIndex ] = this.dom.session.data.get( valueIndex );
                //   valueIndex++;
                // }
                entries.map((entry, index) => {
                    fieldInterface.data[entry.id] = this.dom.session.data.get(index);
                });
            }
            else {
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
                const previewComponentList = [];
                const component = {
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
PopEntityFieldPreviewComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-field-editor-preview',
                template: "<div class=\"entity-field-editor-header\">\n  <div class=\"pop-entity-field-editor-header-section\">\n    <div class=\"sw-label-container-sm\">Field Preview</div>\n  </div>\n  <div class=\"pop-entity-field-editor-header-section\">\n    <!--<p>Assign field value and attributes for this field.</p>-->\n  </div>\n</div>\n<div class=\"entity-field-preview-container\">\n  <div class=\"entity-field-preview-content\">\n    <ng-container #container></ng-container>\n  </div>\n</div>\n",
                styles: [".entity-field-editor-header{display:flex;flex-direction:column;height:97px}.entity-field-editor-header-section{position:relative;width:100%;box-sizing:border-box;height:30px;clear:both}.entity-field-editor-container{min-height:100px;position:relative}.entity-field-editor-border{border:1px solid var(--border)}.entity-field-editor-section-header{position:relative;display:flex;flex-direction:row;height:40px;padding:0 5px 0 10px;align-items:center;justify-content:space-between;font-size:1em;font-weight:700;clear:both;box-sizing:border-box;background:var(--darken02)}.entity-field-editor-section-header-helper-icon{width:20px;height:20px;font-size:1em;z-index:2}.entity-field-editor-active-selection{padding-left:0!important;border-left:5px solid var(--primary)}.entity-field-editor-active-config{border-left:5px solid var(--primary)}.entity-field-preview-container{position:relative;border:1px solid var(--border)}.entity-field-preview-content{padding:0 var(--gap-s) var(--gap-s) var(--gap-s)}"]
            },] }
];
PopEntityFieldPreviewComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: PopDomService }
];
PopEntityFieldPreviewComponent.propDecorators = {
    field: [{ type: Input }],
    container: [{ type: ViewChild, args: ['container', { read: ViewContainerRef, static: true },] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS1maWVsZC1wcmV2aWV3LmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2VudGl0eS9wb3AtZW50aXR5LWZpZWxkLWVkaXRvci9wb3AtZW50aXR5LWZpZWxkLXByZXZpZXcvcG9wLWVudGl0eS1maWVsZC1wcmV2aWV3LmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQXFCLFNBQVMsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUMzRyxPQUFPLEVBQUMseUJBQXlCLEVBQUMsTUFBTSwwQ0FBMEMsQ0FBQztBQUNuRixPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxtQ0FBbUMsQ0FBQztBQUNuRSxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSxvQ0FBb0MsQ0FBQztBQUN6RSxPQUFPLEVBT2tCLE1BQU0sRUFBRSxXQUFXLEVBQzFDLGVBQWUsRUFDaEIsTUFBTSw4QkFBOEIsQ0FBQztBQUN0QyxPQUFPLEVBQUMsdUJBQXVCLEVBQUMsTUFBTSxtREFBbUQsQ0FBQztBQUMxRixPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sNkRBQTZELENBQUM7QUFDekYsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLHNDQUFzQyxDQUFDO0FBQ25FLE9BQU8sRUFBQyxXQUFXLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxrQkFBa0IsRUFBRSxZQUFZLEVBQUMsTUFBTSxnQ0FBZ0MsQ0FBQztBQUNoSCxPQUFPLEVBQUMsc0JBQXNCLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUNoRSxPQUFPLEVBQUMseUJBQXlCLEVBQUMsTUFBTSw4Q0FBOEMsQ0FBQztBQVF2RixNQUFNLE9BQU8sOEJBQStCLFNBQVEseUJBQXlCO0lBa0MzRSxZ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Qzs7O1lBblNGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsMEJBQTBCO2dCQUNwQywyZUFBd0Q7O2FBRXpEOzs7WUExQmtCLFVBQVU7WUFnQnJCLGFBQWE7OztvQkFZbEIsS0FBSzt3QkFDTCxTQUFTLFNBQUMsV0FBVyxFQUFFLEVBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NvbXBvbmVudCwgRWxlbWVudFJlZiwgSW5wdXQsIE9uRGVzdHJveSwgT25Jbml0LCBWaWV3Q2hpbGQsIFZpZXdDb250YWluZXJSZWZ9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtQb3BFeHRlbmREeW5hbWljQ29tcG9uZW50fSBmcm9tICcuLi8uLi8uLi8uLi9wb3AtZXh0ZW5kLWR5bmFtaWMuY29tcG9uZW50JztcbmltcG9ydCB7UG9wRW50aXR5U2VydmljZX0gZnJvbSAnLi4vLi4vc2VydmljZXMvcG9wLWVudGl0eS5zZXJ2aWNlJztcbmltcG9ydCB7UG9wRmllbGRFZGl0b3JTZXJ2aWNlfSBmcm9tICcuLi9wb3AtZW50aXR5LWZpZWxkLWVkaXRvci5zZXJ2aWNlJztcbmltcG9ydCB7XG4gIENvcmVDb25maWcsXG4gIER5bmFtaWNDb21wb25lbnRJbnRlcmZhY2UsXG4gIEVudGl0eSxcbiAgRmllbGRDb25maWcsIEZpZWxkRW50cnksXG4gIEZpZWxkSW50ZXJmYWNlLFxuICBGaWVsZEl0ZW1JbnRlcmZhY2UsXG4gIFBvcEJhc2VFdmVudEludGVyZmFjZSwgUG9wTG9nLCBQb3BUZW1wbGF0ZSxcbiAgU2VydmljZUluamVjdG9yXG59IGZyb20gJy4uLy4uLy4uLy4uL3BvcC1jb21tb24ubW9kZWwnO1xuaW1wb3J0IHtQb3BFbnRpdHlGaWVsZENvbXBvbmVudH0gZnJvbSAnLi4vLi4vcG9wLWVudGl0eS1maWVsZC9wb3AtZW50aXR5LWZpZWxkLmNvbXBvbmVudCc7XG5pbXBvcnQge1NlbGVjdENvbmZpZ30gZnJvbSAnLi4vLi4vLi4vYmFzZS9wb3AtZmllbGQtaXRlbS9wb3Atc2VsZWN0L3NlbGVjdC1jb25maWcubW9kZWwnO1xuaW1wb3J0IHtQb3BEb21TZXJ2aWNlfSBmcm9tICcuLi8uLi8uLi8uLi9zZXJ2aWNlcy9wb3AtZG9tLnNlcnZpY2UnO1xuaW1wb3J0IHtEeW5hbWljU29ydCwgSXNBcnJheSwgSXNPYmplY3QsIElzT2JqZWN0VGhyb3dFcnJvciwgU3BhY2VUb1NuYWtlfSBmcm9tICcuLi8uLi8uLi8uLi9wb3AtY29tbW9uLXV0aWxpdHknO1xuaW1wb3J0IHtJc1ZhbGlkRmllbGRQYXRjaEV2ZW50fSBmcm9tICcuLi8uLi9wb3AtZW50aXR5LXV0aWxpdHknO1xuaW1wb3J0IHtQb3BFbnRpdHlVdGlsRmllbGRTZXJ2aWNlfSBmcm9tICcuLi8uLi9zZXJ2aWNlcy9wb3AtZW50aXR5LXV0aWwtZmllbGQuc2VydmljZSc7XG5cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbGliLWZpZWxkLWVkaXRvci1wcmV2aWV3JyxcbiAgdGVtcGxhdGVVcmw6ICcuL3BvcC1lbnRpdHktZmllbGQtcHJldmlldy5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWycuL3BvcC1lbnRpdHktZmllbGQtcHJldmlldy5jb21wb25lbnQuc2NzcyddXG59KVxuZXhwb3J0IGNsYXNzIFBvcEVudGl0eUZpZWxkUHJldmlld0NvbXBvbmVudCBleHRlbmRzIFBvcEV4dGVuZER5bmFtaWNDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG4gIEBJbnB1dCgpIGZpZWxkOiBGaWVsZEludGVyZmFjZTtcbiAgQFZpZXdDaGlsZCgnY29udGFpbmVyJywge3JlYWQ6IFZpZXdDb250YWluZXJSZWYsIHN0YXRpYzogdHJ1ZX0pIHByaXZhdGUgY29udGFpbmVyO1xuICBwdWJsaWMgbmFtZSA9ICdQb3BFbnRpdHlGaWVsZFByZXZpZXdDb21wb25lbnQnO1xuXG4gIHByb3RlY3RlZCBhc3NldCA9IHtcbiAgICBmaWVsZDogPEZpZWxkSW50ZXJmYWNlPnVuZGVmaW5lZCxcbiAgICBmaWVsZGdyb3VwOiA8RW50aXR5PnVuZGVmaW5lZCxcbiAgICBjb2x1bW5LZXlzOiA8c3RyaW5nW10+dW5kZWZpbmVkLFxuICB9O1xuXG4gIHB1YmxpYyB1aSA9IHtcbiAgICBzdGF0ZVNlbGVjdG9yOiBuZXcgU2VsZWN0Q29uZmlnKHtcbiAgICAgIGxhYmVsOiAnU3RhdGUnLFxuICAgICAgdmFsdWU6ICd0ZW1wbGF0ZV9lZGl0JyxcbiAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgdmFsdWVzOiBbXG4gICAgICAgICAge3ZhbHVlOiAndGVtcGxhdGVfZWRpdCcsIG5hbWU6ICdUZW1wbGF0ZSBBY2Nlc3MnfSxcbiAgICAgICAgICB7dmFsdWU6ICd0ZW1wbGF0ZV9yZWFkb25seScsIG5hbWU6ICdUZW1wbGF0ZSBSZWFkb25seSd9LFxuICAgICAgICAgIHt2YWx1ZTogJ3RleHRfc2luZ2xlJywgbmFtZTogJ1RleHQgU2luZ2xlJ30sXG4gICAgICAgICAge3ZhbHVlOiAndGV4dF9mb3JtYXQnLCBuYW1lOiAnVGV4dCBGb3JtYXQnfSxcbiAgICAgICAgXVxuICAgICAgfVxuICAgIH0pLFxuICAgIGZpZWxkOiA8RmllbGRDb25maWc+dW5kZWZpbmVkXG4gIH07XG5cbiAgcHJvdGVjdGVkIHNydiA9IHtcbiAgICBlbnRpdHk6IDxQb3BFbnRpdHlTZXJ2aWNlPlNlcnZpY2VJbmplY3Rvci5nZXQoUG9wRW50aXR5U2VydmljZSksXG4gICAgZWRpdG9yOiA8UG9wRmllbGRFZGl0b3JTZXJ2aWNlPlNlcnZpY2VJbmplY3Rvci5nZXQoUG9wRmllbGRFZGl0b3JTZXJ2aWNlKSxcbiAgICBmaWVsZDogPFBvcEVudGl0eVV0aWxGaWVsZFNlcnZpY2U+U2VydmljZUluamVjdG9yLmdldChQb3BFbnRpdHlVdGlsRmllbGRTZXJ2aWNlKSxcbiAgfTtcblxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBlbDogRWxlbWVudFJlZixcbiAgICBwcm90ZWN0ZWQgX2RvbVJlcG86IFBvcERvbVNlcnZpY2VcbiAgKSB7XG4gICAgc3VwZXIoKTtcblxuXG4gICAgdGhpcy5kb20uY29uZmlndXJlID0gKCk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuXG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcblxuXG4gICAgICAgIHRoaXMuZG9tLmhhbmRsZXIuYnViYmxlID0gKGNvcmU6IENvcmVDb25maWcsIGV2ZW50OiBQb3BCYXNlRXZlbnRJbnRlcmZhY2UpID0+IHRoaXMub25CdWJibGVFdmVudChldmVudCk7XG5cbiAgICAgICAgLy8gIFZlcmlmeSBjb25maWdzXG4gICAgICAgIHRoaXMuY29yZSA9IElzT2JqZWN0VGhyb3dFcnJvcih0aGlzLmNvcmUsIFsnZW50aXR5J10sIGAke3RoaXMubmFtZX06Y29uZmlndXJlRG9tOiAtIHRoaXMuY29yZWApID8gdGhpcy5jb3JlIDogbnVsbDtcbiAgICAgICAgdGhpcy5maWVsZCA9IElzT2JqZWN0VGhyb3dFcnJvcih0aGlzLmNvcmUuZW50aXR5LCBbJ2ZpZWxkZ3JvdXAnLCAnZW50cmllcyddLCBgJHt0aGlzLm5hbWV9OmNvbmZpZ3VyZURvbTogLSB0aGlzLmNvcmVgKSA/IDxGaWVsZEludGVyZmFjZT50aGlzLmNvcmUuZW50aXR5IDogbnVsbDtcbiAgICAgICAgdGhpcy5hc3NldC5maWVsZGdyb3VwID0gdGhpcy5maWVsZC5maWVsZGdyb3VwO1xuICAgICAgICAvLyBDcmVhdGUgZm9ybSBzZXNzaW9uIGNvbnRhaW5lciB0byBwZXJzaXN0IHVzZSBpbnB1dCB2YWx1ZXNcbiAgICAgICAgdGhpcy5kb20uc2Vzc2lvbi5mb3JtID0ge307XG4gICAgICAgIC8vIEF0dGFjaCB0aGUgY29udGFpbmVyIGZvciB0aGUgcHJldmlldyBodG1sXG4gICAgICAgIHRoaXMudGVtcGxhdGUuYXR0YWNoKCdjb250YWluZXInKTtcbiAgICAgICAgLy8gR2V0IGEgZGVmYXVsdCBzZXQgb2YgZGF0YSB0byBwb3B1bGF0ZSB0aGUgcHJldmlldyBmaWVsZCBpdGVtcyB3aXRoXG4gICAgICAgIHRoaXMuYXNzZXQuY29sdW1uS2V5cyA9IHRoaXMuY29yZS5lbnRpdHkuaXRlbXMubWFwKChpdGVtKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIFN0cmluZyhTcGFjZVRvU25ha2UoaXRlbS5uYW1lKSkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIHRoaXMuYXNzZXQuZGVmYXVsdERhdGEgPSB0aGlzLnNydi5maWVsZC5nZXREZWZhdWx0VmFsdWVzKFN0cmluZyh0aGlzLmNvcmUuZW50aXR5SWQuY29yZWZpZWxkLmludGVybmFsX25hbWUpLnRvTG93ZXJDYXNlKCksIHRoaXMuYXNzZXQuY29sdW1uS2V5cyk7XG5cbiAgICAgICAgaWYgKHRoaXMuZG9tLnNlc3Npb24uc3RhdGVTZWxlY3RvcikgdGhpcy51aS5zdGF0ZVNlbGVjdG9yLmNvbnRyb2wuc2V0VmFsdWUodGhpcy5kb20uc2Vzc2lvbi5zdGF0ZVNlbGVjdG9yLCB7ZW1pdEV2ZW50OiB0cnVlfSk7XG5cbiAgICAgICAgLy8gSGFuZGxlIGV2ZW50c1xuICAgICAgICB0aGlzLmRvbS5oYW5kbGVyLmNvcmUgPSAoY29yZTogQ29yZUNvbmZpZywgZXZlbnQ6IFBvcEJhc2VFdmVudEludGVyZmFjZSkgPT4ge1xuICAgICAgICAgIHRoaXMubG9nLmV2ZW50KGBfY29yZUV2ZW50SGFuZGxlcmAsIGV2ZW50KTtcbiAgICAgICAgICBpZiAoSXNWYWxpZEZpZWxkUGF0Y2hFdmVudCh0aGlzLmNvcmUsIGV2ZW50KSB8fCAoZXZlbnQudHlwZSA9PT0gJ2NvbXBvbmVudCcgJiYgKGV2ZW50Lm5hbWUgPT09ICdhY3RpdmUtaXRlbScgfHwgZXZlbnQubmFtZSA9PT0gJ3VwZGF0ZScpKSkge1xuICAgICAgICAgICAgdGhpcy5fdHJpZ2dlckZpZWxkUHJldmlldygpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBQb3BMb2cud2Fybih0aGlzLm5hbWUsIGBQcmV2aWV3IGRpZCBub3QgcmVjb2duaXplIGV2ZW50YCwgZXZlbnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuXG4gICAgICAgIHRoaXMuX3RyaWdnZXJGaWVsZFByZXZpZXcoMjUwKTtcbiAgICAgICAgcmV0dXJuIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9KTtcbiAgICB9O1xuXG5cbiAgICAvKipcbiAgICAgKiBUaGlzIGZ1bmN0aW9uIHdpbGwgY2FsbCBhZnRlciB0aGUgZG9tIHJlZ2lzdHJhdGlvblxuICAgICAqL1xuICAgIHRoaXMuZG9tLnByb2NlZWQgPSAoKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgdGhpcy5fc2V0RGF0YVNlc3Npb24oKTtcbiAgICAgICAgcmV0dXJuIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cblxuICAvKipcbiAgICogV2UgZXhwZWN0IHRoZSBjb3JlIHRvIHJlcHJlc2VudCBhIGZpZWxkXG4gICAqIFRoaXMgY29tcG9uZW50IHJlcHJlc2VudHMgd2hhdCB0aGUgdmlldyBvZiB0aGUgY3VycmVudCBmaWVsZCB3aWxsIGxvb2sgbGlrZVxuICAgKiBUaGUgY29tcG9uZW50IHJlbGllcyB1cG9uIHRoZSBGaWVsZEJ1aWxkZXJJdGVtc0NvbXBvbmVudCAmJiBGaWVsZEJ1aWxkZXJJdGVtU2V0dGluZ3NDb21wb25lbnQgdG8gY29tbXVuaWNhdGUgd2hlbiBzZXR0aW5ncyBhcmUgY2hhbmdlZCBzbyB0aGF0IHRoZSB2aWV3IGNhbiByZW5kZXIgdGhlIGNoYW5nZXNcbiAgICovXG4gIG5nT25Jbml0KCkge1xuICAgIHN1cGVyLm5nT25Jbml0KCk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIGhhbmRsZXIgbWFuYWdlcyBldmVudHMgdGhhdCBjb21lIHVwIGZyb20gdGhlIHByZXZpZXcgZmllbGRzLCBtb3N0bHkganVzdCB0byBzZXNzaW9uIGFueSB2YWx1ZXMgdGhhdCB0aGUgdXNlciBlbnRlcnMsIGFuZCBzaW11bGF0ZSBhZGRpbmcgcmVtb3ZpbmcgdmFsdWUgZW50cmllc1xuICAgKiBUaGUgZmllbGQgaW5wdXQgaXMgc2F2ZWQgYmVjYXVzZSB0aGUgc2V0RmllbGRQcmV2aWV3IGRlc3Ryb3lzIHRoZSBjb21wb25lbnQgYW5kIGlzIGNhbGxlZCBvZnRlbiwgYW5kIHRoZSB1c2VyIHNob3VsZCBub3QgaGF2ZSB0byByZS1lbnRlciB0ZXN0IGRhdGEgZXZlcnkgdGltZSBhIHNldHRpbmcgaXMgY2hhbmdlZFxuICAgKiBAcGFyYW0gZXZlbnRcbiAgICovXG4gIG9uQnViYmxlRXZlbnQoZXZlbnQ6IFBvcEJhc2VFdmVudEludGVyZmFjZSkge1xuICAgIHRoaXMubG9nLmV2ZW50KGBvbkJ1YmJsZUV2ZW50YCwgZXZlbnQpO1xuICAgIGlmIChJc09iamVjdChldmVudCwgWyd0eXBlJywgJ25hbWUnXSkgJiYgZXZlbnQudHlwZSA9PT0gJ2ZpZWxkJykge1xuICAgICAgaWYgKGV2ZW50Lm5hbWUgPT09ICdvbkZvY3VzJykge1xuICAgICAgICAvLyBzdHViXG4gICAgICB9IGVsc2UgaWYgKGV2ZW50Lm5hbWUgPT09ICdvbkJsdXInIHx8IGV2ZW50Lm5hbWUgPT09ICdwYXRjaCcpIHsgLy8gd2hlbmV2ZXIgYSB1c2VyIGJsdXJzIG91dCBvZiBmaWVsZCBzYXZlIHRoZSBkYXRhIHRoYXQgaXMgaW4gaXRcbiAgICAgICAgaWYgKGV2ZW50LmNvbmZpZyAmJiBldmVudC5jb25maWcuY29udHJvbCAmJiBldmVudC5jb25maWcuY29udHJvbC52YWx1ZSkge1xuICAgICAgICAgIHRoaXMuZG9tLnNlc3Npb24uZm9ybVtldmVudC5jb25maWcubmFtZV0gPSBldmVudC5jb25maWcuY29udHJvbC52YWx1ZTtcbiAgICAgICAgICB0aGlzLmRvbS5zdG9yZSgnb25TZXNzaW9uJyk7IC8vIGRvbS5zdG9yZSBtdXN0IGJlIGNhbGxlZCB0byBmb3IgdGhlIGRvbSB0byB0cmFuc2ZlciBpdHMgZGF0YSB1cCB0byB0aGUgZG9tUmVwb1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGV2ZW50Lm5hbWUgPT09ICdhZGQnKSB7IC8vIHdoZW5ldmVyIGEgdXNlciBibHVycyBvdXQgb2YgZmllbGQgc2F2ZSB0aGUgZGF0YSB0aGF0IGlzIGluIGl0XG4gICAgICAgIHRoaXMuX2FkZEZpZWxkVmFsdWUoKTtcbiAgICAgIH0gZWxzZSBpZiAoZXZlbnQubmFtZSA9PT0gJ3JlbW92ZScpIHsgLy8gd2hlbmV2ZXIgYSB1c2VyIGJsdXJzIG91dCBvZiBmaWVsZCBzYXZlIHRoZSBkYXRhIHRoYXQgaXMgaW4gaXRcbiAgICAgICAgdGhpcy5fcmVtb3ZlRmllbGRWYWx1ZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIENsZWFuIHVwIHRoZSBkb20gb2YgdGhpcyBjb21wb25lbnRcbiAgICovXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMudGVtcGxhdGUuZGVzdHJveSgpO1xuICAgIHN1cGVyLm5nT25EZXN0cm95KCk7XG4gIH1cblxuXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVW5kZXIgVGhlIEhvb2QgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBQcml2YXRlIE1ldGhvZCApICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBmaWVsZCBsYWJlbFxuICAgKi9cbiAgcHJpdmF0ZSBfYWRkRmllbGRWYWx1ZSgpIHtcbiAgICBpZiAoSXNPYmplY3QodGhpcy51aS5maWVsZCwgdHJ1ZSkpIHtcbiAgICAgIGlmICh0aGlzLmRvbS5zZXNzaW9uLnJlY29yZHMgPCB0aGlzLnVpLmZpZWxkLm11bHRpcGxlX21heF9saW1pdCkge1xuICAgICAgICB0aGlzLmRvbS5zZXNzaW9uLnJlY29yZHMrKztcbiAgICAgICAgdGhpcy5fdHJpZ2dlckZpZWxkUHJldmlldygwKTtcbiAgICAgIH1cblxuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhbiBleGlzdGluZyBsYWJlbFxuICAgKi9cbiAgcHJpdmF0ZSBfcmVtb3ZlRmllbGRWYWx1ZSgpIHtcbiAgICBpZiAoSXNPYmplY3QodGhpcy51aS5maWVsZCwgdHJ1ZSkpIHtcbiAgICAgIGlmICh0aGlzLmRvbS5zZXNzaW9uLnJlY29yZHMgPiB0aGlzLnVpLmZpZWxkLm11bHRpcGxlX21pbikge1xuICAgICAgICB0aGlzLmRvbS5zZXNzaW9uLnJlY29yZHMtLTtcbiAgICAgICAgdGhpcy5fdHJpZ2dlckZpZWxkUHJldmlldygwKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBDcmVhdGUgc2V0cyBvZiBtb2NrIGRhdGEgZm9yIHRoZSBmaWVsZHMgZW50cmllc1xuICAgKi9cbiAgcHJpdmF0ZSBfc2V0RGF0YVNlc3Npb24oKSB7XG4gICAgaWYgKCF0aGlzLmRvbS5zZXNzaW9uLnJlY29yZHMpIHRoaXMuZG9tLnNlc3Npb24ucmVjb3JkcyA9IHRoaXMuZmllbGQubXVsdGlwbGVfbWluO1xuICAgIGxldCBpbmRleCA9IDA7XG4gICAgaWYgKCF0aGlzLmRvbS5zZXNzaW9uLmRhdGEpIHtcbiAgICAgIHRoaXMuZG9tLnNlc3Npb24uZGF0YSA9IG5ldyBNYXAoKTtcbiAgICAgIHdoaWxlIChpbmRleCA8IDEwKSB7XG4gICAgICAgIGNvbnN0IGRlZmF1bHRWYWx1ZXMgPSB0aGlzLnNydi5lZGl0b3IuZ2V0RGVmYXVsdFZhbHVlcyhTdHJpbmcodGhpcy5hc3NldC5maWVsZGdyb3VwLm5hbWUpLnRvTG93ZXJDYXNlKCkpO1xuICAgICAgICB0aGlzLmRvbS5zZXNzaW9uLmRhdGEuc2V0KGluZGV4LCBkZWZhdWx0VmFsdWVzKTtcbiAgICAgICAgaW5kZXgrKztcbiAgICAgIH1cbiAgICAgIHRoaXMuZG9tLnN0b3JlKCdzZXNzaW9uJyk7XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogRGVib3VuY2UgdGhlIHJlcXVlc3RzIHRvIHJlc2V0IHRoZSBwcmV2aWV3XG4gICAqIEBwYXJhbSBkZWxheVxuICAgKi9cbiAgcHJpdmF0ZSBfdHJpZ2dlckZpZWxkUHJldmlldyhkZWxheSA9IDI1MCkge1xuICAgIHRoaXMuZG9tLnNldFRpbWVvdXQoJ2ZpZWxkLXByZXZpZXcnLCAoKSA9PiB7XG4gICAgICB0aGlzLl9zZXRGaWVsZFByZXZpZXcoKTtcbiAgICB9LCBkZWxheSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIHdpbGwgY3JlYXRlIGEgZmFjYWRlIGZpZWxkIHRoYXQgd2lsbCBhIGR5bmFtaWNhbGx5IHRyeSB0byByZXBsaWNhdGUgaG93IHRoZSBmaWVsZCB3aWxsIGxvb2sgd2hlbiBpdCBpcyBpbiB1c2VcbiAgICovXG4gIHByaXZhdGUgX3NldEZpZWxkUHJldmlldygpIHtcbiAgICBpZiAodGhpcy5kb20ucmVwby51aS5hY3RpdmVJdGVtcykge1xuXG4gICAgICBQb3BUZW1wbGF0ZS5jbGVhcigpO1xuXG4gICAgICBjb25zdCBpdGVtcyA9IDxhbnlbXT50aGlzLmZpZWxkLml0ZW1zO1xuXG4gICAgICBjb25zdCBlbnRyaWVzID0gSXNBcnJheSh0aGlzLmZpZWxkLmVudHJpZXMsIHRydWUpID8gdGhpcy5maWVsZC5lbnRyaWVzLmZpbHRlcigoZW50cnk6IEZpZWxkRW50cnkpID0+IHtcbiAgICAgICAgcmV0dXJuICFlbnRyeS5vcnBoYW5lZF9hdDtcbiAgICAgIH0pLnNvcnQoRHluYW1pY1NvcnQoJ3NvcnRfb3JkZXInKSkgOiBbXTtcblxuICAgICAgY29uc3QgZmllbGRJbnRlcmZhY2UgPSB7XG4gICAgICAgIGlkOiAxLFxuICAgICAgICBmYWNhZGU6IHRydWUsIC8vIHNldCB0byB0cmlnZ2VyIGRlbW8gbGlrZSBhY3Rpb25zXG4gICAgICAgIGNhbkFkZDogZmFsc2UsXG4gICAgICAgIGNhblJlbW92ZTogZmFsc2UsXG4gICAgICAgIGNvbmZpZ3M6IHRoaXMuZmllbGQuY29uZmlncyxcbiAgICAgICAgbmFtZTogdGhpcy5maWVsZC5uYW1lLFxuICAgICAgICBsYWJlbDogdGhpcy5maWVsZC5sYWJlbCxcbiAgICAgICAgZW50cmllczogZW50cmllcyxcbiAgICAgICAgZmllbGRncm91cDogdGhpcy5hc3NldC5maWVsZGdyb3VwLFxuICAgICAgICBpbnRlcm5hbF9uYW1lOiBTdHJpbmcodGhpcy5hc3NldC5maWVsZGdyb3VwLm5hbWUpLnRvTG93ZXJDYXNlKCksXG4gICAgICAgIG11bHRpcGxlOiB0aGlzLmZpZWxkLm11bHRpcGxlLFxuICAgICAgICAvLyBtdWx0aXBsZV9taW46IHRoaXMuZmllbGQubXVsdGlwbGVfbWluLFxuICAgICAgICBtdWx0aXBsZV9taW46IGVudHJpZXMubGVuZ3RoLFxuICAgICAgICAvLyBtdWx0aXBsZV9tYXg6IHRoaXMuZmllbGQubXVsdGlwbGVfbWF4LFxuICAgICAgICBtdWx0aXBsZV9tYXg6IGVudHJpZXMubGVuZ3RoLFxuICAgICAgICBtdWx0aXBsZV9tYXhfbGltaXQ6IDQsXG5cbiAgICAgICAgZGF0YToge30sXG4gICAgICAgIHNob3dfbmFtZTogISF0aGlzLmNvcmUuZW50aXR5LnNob3dfbmFtZSxcbiAgICAgICAgc29ydDogMCxcbiAgICAgICAgc3RhdGU6IHRoaXMudWkuc3RhdGVTZWxlY3Rvci5jb250cm9sLnZhbHVlLFxuICAgICAgICBpdGVtczogPEZpZWxkSXRlbUludGVyZmFjZVtdPltdXG4gICAgICB9O1xuXG4gICAgICBpZiAoZmllbGRJbnRlcmZhY2UubXVsdGlwbGUpIHtcbiAgICAgICAgLy8gaWYoICFmaWVsZEludGVyZmFjZS5tdWx0aXBsZV9taW4gKSBmaWVsZEludGVyZmFjZS5tdWx0aXBsZV9taW4gPSAxO1xuICAgICAgICBpZiAoIWZpZWxkSW50ZXJmYWNlLm11bHRpcGxlX21pbikgZmllbGRJbnRlcmZhY2UubXVsdGlwbGVfbWluID0gZW50cmllcy5sZW5ndGg7XG4gICAgICAgIC8vIGxldCB2YWx1ZUluZGV4ID0gMDtcbiAgICAgICAgbGV0IHJlY29yZHMgPSB0aGlzLmRvbS5zZXNzaW9uLnJlY29yZHM7XG4gICAgICAgIGlmIChyZWNvcmRzIDwgK2ZpZWxkSW50ZXJmYWNlLm11bHRpcGxlX21pbikgcmVjb3JkcyA9ICtmaWVsZEludGVyZmFjZS5tdWx0aXBsZV9taW47XG4gICAgICAgIGlmICgrZmllbGRJbnRlcmZhY2UubXVsdGlwbGVfbWF4ICYmIHJlY29yZHMgPiBmaWVsZEludGVyZmFjZS5tdWx0aXBsZV9tYXgpIHJlY29yZHMgPSBmaWVsZEludGVyZmFjZS5tdWx0aXBsZV9tYXg7XG4gICAgICAgIC8vIHdoaWxlKCB2YWx1ZUluZGV4IDwgcmVjb3JkcyApe1xuICAgICAgICAvLyAgIGZpZWxkSW50ZXJmYWNlLmRhdGFbIHZhbHVlSW5kZXggXSA9IHRoaXMuZG9tLnNlc3Npb24uZGF0YS5nZXQoIHZhbHVlSW5kZXggKTtcbiAgICAgICAgLy8gICB2YWx1ZUluZGV4Kys7XG4gICAgICAgIC8vIH1cbiAgICAgICAgZW50cmllcy5tYXAoKGVudHJ5LCBpbmRleCkgPT4ge1xuICAgICAgICAgIGZpZWxkSW50ZXJmYWNlLmRhdGFbZW50cnkuaWRdID0gdGhpcy5kb20uc2Vzc2lvbi5kYXRhLmdldChpbmRleCk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3Qgc2luZ2xlRW50cnkgPSBlbnRyaWVzWzBdO1xuICAgICAgICBmaWVsZEludGVyZmFjZS5kYXRhW3NpbmdsZUVudHJ5LmlkXSA9IHRoaXMuZG9tLnNlc3Npb24uZGF0YS5nZXQoMCk7XG4gICAgICB9XG5cblxuICAgICAgZmllbGRJbnRlcmZhY2UuaXRlbXMgPSBpdGVtcy5maWx0ZXIoKGl0ZW0pID0+IHtcbiAgICAgICAgcmV0dXJuICt0aGlzLmRvbS5yZXBvLnVpLmFjdGl2ZUl0ZW1zW2l0ZW0uaWRdID09PSAxO1xuICAgICAgfSkubWFwKChpdGVtKSA9PiB7XG4gICAgICAgIGl0ZW0uZmFjYWRlID0gdHJ1ZTtcbiAgICAgICAgaXRlbS5zaG93TWFzayA9IHRydWU7XG4gICAgICAgIGl0ZW0uYnViYmxlID0gdHJ1ZTtcbiAgICAgICAgZGVsZXRlIGl0ZW0uYXBpO1xuICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLnVpLmZpZWxkID0gdGhpcy5zcnYuZmllbGQuYnVpbGRDdXN0b21GaWVsZCh0aGlzLmNvcmUsIGZpZWxkSW50ZXJmYWNlKTtcblxuXG4gICAgICBpZiAodGhpcy51aS5maWVsZCkge1xuICAgICAgICBjb25zdCBwcmV2aWV3Q29tcG9uZW50TGlzdDogRHluYW1pY0NvbXBvbmVudEludGVyZmFjZVtdID0gW107XG4gICAgICAgIGNvbnN0IGNvbXBvbmVudCA9IDxEeW5hbWljQ29tcG9uZW50SW50ZXJmYWNlPntcbiAgICAgICAgICB0eXBlOiBQb3BFbnRpdHlGaWVsZENvbXBvbmVudCxcbiAgICAgICAgICBpbnB1dHM6IHtcbiAgICAgICAgICAgIGNvcmU6IHRoaXMuY29yZSxcbiAgICAgICAgICAgIGZpZWxkOiB0aGlzLnVpLmZpZWxkLFxuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcHJldmlld0NvbXBvbmVudExpc3QucHVzaChjb21wb25lbnQpO1xuICAgICAgICB0aGlzLnRlbXBsYXRlLnJlbmRlcihwcmV2aWV3Q29tcG9uZW50TGlzdCwgW10sIHRydWUpO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmRvbS5yZWFkeSgpO1xuICB9XG5cblxufVxuIl19