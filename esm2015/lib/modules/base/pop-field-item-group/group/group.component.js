import { Component, ElementRef, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { ConvertArrayToOptionList, IsArray, IsObject } from '../../../../pop-common-utility';
import { EvaluateWhenCondition, IsValidFieldPatchEvent } from '../../../entity/pop-entity-utility';
import { PopExtendDynamicComponent } from '../../../../pop-extend-dynamic.component';
export class GroupComponent extends PopExtendDynamicComponent {
    constructor(el) {
        super();
        this.el = el;
        this.subscribers = [];
        this.name = 'GroupComponent';
        /**
         * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
         */
        this.dom.configure = () => {
            return new Promise((resolve) => {
                // Attach the container for of the field item list element
                this.template.attach('container'); // container references the @viewChild('container')
                this.core.entity = {
                    id: 0,
                    name: null
                };
                this.config.fieldItemMap = {};
                const fieldItemComponentList = [];
                this.config.fieldItems.map((fieldItem) => {
                    const existingValue = 'control' in fieldItem.config ? fieldItem.config.control.value : null;
                    this.core.entity[fieldItem.model.name] = existingValue;
                });
                this.config.fieldItems.map((fieldItem, index) => {
                    if (fieldItem && IsObject(fieldItem.model, ['name']) && fieldItem.config && fieldItem.component) {
                        this.config.fieldItemMap[fieldItem.model.name] = index;
                        if (this.config.inDialog)
                            fieldItem.config.bubble = true;
                        const component = {
                            type: fieldItem.component,
                            inputs: {
                                config: fieldItem.config,
                                position: fieldItem.config['metadata'].position ? fieldItem.config['metadata'].position : 1,
                                hidden: IsArray(fieldItem.model.when, true) ? !(EvaluateWhenCondition(this.core, fieldItem.model.when, this.core)) : false,
                                when: IsArray(fieldItem.model.when, true) ? fieldItem.model.when : null
                            }
                        };
                        fieldItemComponentList.push(component);
                    }
                });
                this.template.render(fieldItemComponentList, [], true);
                this.dom.handler.bubble = (core, event) => {
                    if (IsValidFieldPatchEvent(this.core, event)) {
                        if (event.config.name in this.core.entity) {
                            const newValue = isNaN(event.config.control.value) ? event.config.control.value : +event.config.control.value;
                            this.core.entity[event.config.name] = newValue;
                            if (this.config.fieldItems.length > 1) {
                                this._resetComponentListHidden();
                                this.dom.setTimeout(`update-relations`, () => {
                                    this._triggerParentChildUpdates(event.config.name);
                                }, 0);
                            }
                        }
                    }
                    if (event.config.bubble || ['patch', 'portal'].includes(event.name)) {
                        this.events.emit(event);
                    }
                };
                this.config.getField = (name) => {
                    if (name && name in this.config.fieldItemMap) {
                        return this.config.fieldItems[this.config.fieldItemMap[name]];
                    }
                    return null;
                };
                this.events.emit({ source: 'GroupComponent', type: 'field_group', name: 'init', id: this.config.id, group: this.config });
                resolve(true);
            });
        };
        this.dom.proceed = () => {
            return new Promise((resolve) => {
                this.dom.setTimeout(`parent-child`, () => {
                    this._triggerParentChildUpdates('client_id');
                });
                return resolve(true);
            });
        };
    }
    /**
     * This component should have a specific purpose
     */
    ngOnInit() {
        super.ngOnInit();
    }
    /**
     * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
     */
    ngOnDestroy() {
        this.subscribers.map(function (subscription) {
            if (subscription)
                subscription.unsubscribe();
        });
        super.ngOnDestroy();
    }
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    /**
     * Get a linear list of the parent child relations from a given point
     * @param self the name to start from (usually the field that has just been changed by user)
     * @param list
     */
    _getRelationList(name, list = []) {
        let item;
        if (name && name in this.config.fieldItemMap) {
            item = this.config.fieldItems[this.config.fieldItemMap[name]];
            if (IsObject(item, ['config', 'model'])) {
                list.push({
                    name: item.config.name,
                    autoFill: this._fieldHasAutoFill(name),
                });
                if (this._fieldHasChild(name)) {
                    this._getRelationList(this.config.fieldItems[this.config.fieldItemMap[name]].model.options.child, list);
                }
            }
        }
        return list;
    }
    /**
     * Determine if field has a child relation in the list
     * @param name
     */
    _fieldHasChild(name) {
        if (name in this.config.fieldItemMap && this.config.fieldItems[this.config.fieldItemMap[name]].model && this.config.fieldItems[this.config.fieldItemMap[name]].model.options) {
            if (this.config.fieldItems[this.config.fieldItemMap[name]].model.options.child) {
                return true;
            }
        }
        return false;
    }
    /**
     * Determine if field should be auto filled with the first item in the list
     * @param name
     */
    _fieldHasAutoFill(name) {
        if (name in this.config.fieldItemMap && this.config.fieldItems[this.config.fieldItemMap[name]].model && this.config.fieldItems[this.config.fieldItemMap[name]].model.options) {
            if (this.config.fieldItems[this.config.fieldItemMap[name]].model.autoFill) {
                return true;
            }
        }
        return false;
    }
    _triggerParentChildUpdates(name) {
        console.log('triggerParentChildUpdates', name);
        if (this._fieldHasChild(name)) {
            let values;
            let child_fk;
            let childField;
            let autoFill = false;
            let set;
            let resource;
            const relations = this._getRelationList(name);
            // console.log('relations', relations);
            relations.some((relation) => {
                if (relation.autoFill) {
                    autoFill = true;
                    return true;
                }
            });
            if (name && name in this.config.fieldItemMap) {
                child_fk = this.config.fieldItems[this.config.fieldItemMap[name]].model.options.child;
                if (child_fk && child_fk in this.config.fieldItemMap) {
                    childField = this.config.fieldItems[this.config.fieldItemMap[child_fk]];
                    // console.log('child field', childField);
                    if (childField.model.form === 'select') {
                        if (childField.model.options.resource) {
                            // console.log('has resource', childField.model.options.resource, this.config.metadata[ childField.model.options.resource ]);
                            if (IsObject(this.config.metadata[childField.model.options.resource], ['data_values'])) {
                                resource = this.config.metadata[childField.model.options.resource].data_values;
                            }
                        }
                        // console.log('resource', resource);
                        if (IsArray(resource, true)) {
                            values = ConvertArrayToOptionList(resource, {
                                // ensure that an option shows up in list in case other conditions remove it, aka it has been archived
                                prevent: [],
                                // parent means this options should all have a common field trait like client_fk, account_fk ....
                                parent: childField.model.options.parent ? {
                                    field: childField.model.options.parent,
                                    value: this.core.entity[childField.model.options.parent]
                                } : null,
                                empty: childField.model.options.empty ? childField.model.options.empty : null,
                            });
                        }
                        else {
                            values = [];
                        }
                        // console.log('values', values);
                        if (autoFill && values.length) {
                            set = values[values.length - 1].value;
                        }
                        else {
                            set = null;
                        }
                        childField.config.options.values = values;
                        autoFill = autoFill && values.length ? values[0].value : null;
                        if (typeof childField.config.triggerOnChange === 'function')
                            childField.config.triggerOnChange(set);
                        this.dom.setTimeout(`clear-message-${child_fk}`, () => {
                            if (typeof childField.config.clearMessage === 'function') {
                                childField.config.clearMessage();
                            }
                        }, 0);
                    }
                }
            }
        }
    }
    /**
     * Whenever a update to the core entity happens the fields in the group should be re-evaluated if there are when conditionals set
     * @private
     */
    _resetComponentListHidden() {
        //     console.log('_resetComponentListHidden', this.template.refs);
        let name;
        this.template.refs.filter((componentRef) => {
            return IsObject(componentRef.instance.config, true) && IsArray(componentRef.instance.when, true);
        }).map((componentRef) => {
            name = componentRef.instance.config.name;
            if (name && name in this.config.fieldItemMap) {
                componentRef.instance.hidden = !EvaluateWhenCondition(this.core, componentRef.instance.when, this.core);
            }
        });
    }
}
GroupComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-group',
                template: "<div class=\"field-group-container import-flex-column\">\n  <template #container></template>\n  <div style=\"width: 100%; display: block; clear:both;\"></div>\n</div>\n\n",
                styles: [".field-group-container{position:relative;display:block;min-height:40px;padding-bottom:15px}"]
            },] }
];
GroupComponent.ctorParameters = () => [
    { type: ElementRef }
];
GroupComponent.propDecorators = {
    container: [{ type: ViewChild, args: ['container', { read: ViewContainerRef, static: true },] }],
    config: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JvdXAuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvYmFzZS9wb3AtZmllbGQtaXRlbS1ncm91cC9ncm91cC9ncm91cC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBNEQsVUFBVSxFQUFFLEtBQUssRUFBcUIsU0FBUyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBSXZLLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDN0YsT0FBTyxFQUFFLHFCQUFxQixFQUFFLHNCQUFzQixFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFDbkcsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sMENBQTBDLENBQUM7QUFRckYsTUFBTSxPQUFPLGNBQWUsU0FBUSx5QkFBeUI7SUFTM0QsWUFDUyxFQUFjO1FBRXJCLEtBQUssRUFBRSxDQUFDO1FBRkQsT0FBRSxHQUFGLEVBQUUsQ0FBWTtRQU52QixnQkFBVyxHQUFtQixFQUFFLENBQUM7UUFFMUIsU0FBSSxHQUFHLGdCQUFnQixDQUFDO1FBUTdCOztXQUVHO1FBQ0gsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsR0FBcUIsRUFBRTtZQUMxQyxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7Z0JBRTdCLDBEQUEwRDtnQkFDMUQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxtREFBbUQ7Z0JBRXRGLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHO29CQUNqQixFQUFFLEVBQUUsQ0FBQztvQkFDTCxJQUFJLEVBQUUsSUFBSTtpQkFDWCxDQUFDO2dCQUVGLElBQUksQ0FBQyxNQUFN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QUFXLEVBQUUsRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRTtxQkFDL0QsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgQ29tcG9uZW50RmFjdG9yeSwgQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyLCBDb21wb25lbnRSZWYsIEVsZW1lbnRSZWYsIElucHV0LCBPbkRlc3Ryb3ksIE9uSW5pdCwgVmlld0NoaWxkLCBWaWV3Q29udGFpbmVyUmVmIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBGaWVsZEl0ZW1Hcm91cENvbmZpZyB9IGZyb20gJy4uL3BvcC1maWVsZC1pdGVtLWdyb3VwLm1vZGVsJztcbmltcG9ydCB7IFN1YnNjcmlwdGlvbiB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgQ29yZUNvbmZpZywgRHluYW1pY0NvbXBvbmVudEludGVyZmFjZSwgUG9wQmFzZUV2ZW50SW50ZXJmYWNlIH0gZnJvbSAnLi4vLi4vLi4vLi4vcG9wLWNvbW1vbi5tb2RlbCc7XG5pbXBvcnQgeyBDb252ZXJ0QXJyYXlUb09wdGlvbkxpc3QsIElzQXJyYXksIElzT2JqZWN0IH0gZnJvbSAnLi4vLi4vLi4vLi4vcG9wLWNvbW1vbi11dGlsaXR5JztcbmltcG9ydCB7IEV2YWx1YXRlV2hlbkNvbmRpdGlvbiwgSXNWYWxpZEZpZWxkUGF0Y2hFdmVudCB9IGZyb20gJy4uLy4uLy4uL2VudGl0eS9wb3AtZW50aXR5LXV0aWxpdHknO1xuaW1wb3J0IHsgUG9wRXh0ZW5kRHluYW1pY0NvbXBvbmVudCB9IGZyb20gJy4uLy4uLy4uLy4uL3BvcC1leHRlbmQtZHluYW1pYy5jb21wb25lbnQnO1xuXG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2xpYi1ncm91cCcsXG4gIHRlbXBsYXRlVXJsOiAnLi9ncm91cC5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWyAnLi9ncm91cC5jb21wb25lbnQuc2NzcycgXVxufSlcbmV4cG9ydCBjbGFzcyBHcm91cENvbXBvbmVudCBleHRlbmRzIFBvcEV4dGVuZER5bmFtaWNDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG4gIEBWaWV3Q2hpbGQoJ2NvbnRhaW5lcicsIHsgcmVhZDogVmlld0NvbnRhaW5lclJlZiwgc3RhdGljOiB0cnVlIH0pIHByaXZhdGUgY29udGFpbmVyO1xuICBASW5wdXQoKSBjb25maWc6IEZpZWxkSXRlbUdyb3VwQ29uZmlnO1xuXG4gIHN1YnNjcmliZXJzOiBTdWJzY3JpcHRpb25bXSA9IFtdO1xuXG4gIHB1YmxpYyBuYW1lID0gJ0dyb3VwQ29tcG9uZW50JztcblxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBlbDogRWxlbWVudFJlZixcbiAgKXtcbiAgICBzdXBlcigpO1xuXG4gICAgLyoqXG4gICAgICogVGhpcyBzaG91bGQgdHJhbnNmb3JtIGFuZCB2YWxpZGF0ZSB0aGUgZGF0YS4gVGhlIHZpZXcgc2hvdWxkIHRyeSB0byBvbmx5IHVzZSBkYXRhIHRoYXQgaXMgc3RvcmVkIG9uIHVpIHNvIHRoYXQgaXQgaXMgbm90IGRlcGVuZGVudCBvbiB0aGUgc3RydWN0dXJlIG9mIGRhdGEgdGhhdCBjb21lcyBmcm9tIG90aGVyIHNvdXJjZXMuIFRoZSB1aSBzaG91bGQgYmUgdGhlIHNvdXJjZSBvZiB0cnV0aCBoZXJlLlxuICAgICAqL1xuICAgIHRoaXMuZG9tLmNvbmZpZ3VyZSA9ICgpOiBQcm9taXNlPGJvb2xlYW4+ID0+IHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuXG4gICAgICAgIC8vIEF0dGFjaCB0aGUgY29udGFpbmVyIGZvciBvZiB0aGUgZmllbGQgaXRlbSBsaXN0IGVsZW1lbnRcbiAgICAgICAgdGhpcy50ZW1wbGF0ZS5hdHRhY2goJ2NvbnRhaW5lcicpOyAvLyBjb250YWluZXIgcmVmZXJlbmNlcyB0aGUgQHZpZXdDaGlsZCgnY29udGFpbmVyJylcblxuICAgICAgICB0aGlzLmNvcmUuZW50aXR5ID0ge1xuICAgICAgICAgIGlkOiAwLFxuICAgICAgICAgIG5hbWU6IG51bGxcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmNvbmZpZy5maWVsZEl0ZW1NYXAgPSB7fTtcbiAgICAgICAgY29uc3QgZmllbGRJdGVtQ29tcG9uZW50TGlzdCA9IDxEeW5hbWljQ29tcG9uZW50SW50ZXJmYWNlW10+W107XG4gICAgICAgIHRoaXMuY29uZmlnLmZpZWxkSXRlbXMubWFwKChmaWVsZEl0ZW0pID0+IHtcbiAgICAgICAgICBjb25zdCBleGlzdGluZ1ZhbHVlID0gJ2NvbnRyb2wnIGluIGZpZWxkSXRlbS5jb25maWcgPyBmaWVsZEl0ZW0uY29uZmlnLmNvbnRyb2wudmFsdWUgOiBudWxsO1xuICAgICAgICAgIHRoaXMuY29yZS5lbnRpdHlbIGZpZWxkSXRlbS5tb2RlbC5uYW1lIF0gPSBleGlzdGluZ1ZhbHVlO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmNvbmZpZy5maWVsZEl0ZW1zLm1hcCgoZmllbGRJdGVtLCBpbmRleCkgPT4ge1xuICAgICAgICAgIGlmKCBmaWVsZEl0ZW0gJiYgSXNPYmplY3QoZmllbGRJdGVtLm1vZGVsLCBbICduYW1lJyBdKSAmJiBmaWVsZEl0ZW0uY29uZmlnICYmIGZpZWxkSXRlbS5jb21wb25lbnQgKXtcbiAgICAgICAgICAgIHRoaXMuY29uZmlnLmZpZWxkSXRlbU1hcFsgZmllbGRJdGVtLm1vZGVsLm5hbWUgXSA9IGluZGV4O1xuXG4gICAgICAgICAgICBpZih0aGlzLmNvbmZpZy5pbkRpYWxvZykgZmllbGRJdGVtLmNvbmZpZy5idWJibGUgPSB0cnVlO1xuXG5cbiAgICAgICAgICAgIGNvbnN0IGNvbXBvbmVudCA9IDxEeW5hbWljQ29tcG9uZW50SW50ZXJmYWNlPntcbiAgICAgICAgICAgICAgdHlwZTogZmllbGRJdGVtLmNvbXBvbmVudCxcbiAgICAgICAgICAgICAgaW5wdXRzOiB7XG4gICAgICAgICAgICAgICAgY29uZmlnOiBmaWVsZEl0ZW0uY29uZmlnLFxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBmaWVsZEl0ZW0uY29uZmlnWyAnbWV0YWRhdGEnIF0ucG9zaXRpb24gPyBmaWVsZEl0ZW0uY29uZmlnWyAnbWV0YWRhdGEnIF0ucG9zaXRpb24gOiAxLFxuICAgICAgICAgICAgICAgIGhpZGRlbjogSXNBcnJheShmaWVsZEl0ZW0ubW9kZWwud2hlbiwgdHJ1ZSkgPyAhKCBFdmFsdWF0ZVdoZW5Db25kaXRpb24odGhpcy5jb3JlLCBmaWVsZEl0ZW0ubW9kZWwud2hlbiwgdGhpcy5jb3JlKSApIDogZmFsc2UsXG4gICAgICAgICAgICAgICAgd2hlbjogSXNBcnJheShmaWVsZEl0ZW0ubW9kZWwud2hlbiwgdHJ1ZSkgPyBmaWVsZEl0ZW0ubW9kZWwud2hlbiA6IG51bGxcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGZpZWxkSXRlbUNvbXBvbmVudExpc3QucHVzaChjb21wb25lbnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy50ZW1wbGF0ZS5yZW5kZXIoZmllbGRJdGVtQ29tcG9uZW50TGlzdCwgW10sIHRydWUpO1xuXG5cbiAgICAgICAgdGhpcy5kb20uaGFuZGxlci5idWJibGUgPSAoY29yZTogQ29yZUNvbmZpZywgZXZlbnQ6IFBvcEJhc2VFdmVudEludGVyZmFjZSkgPT4ge1xuICAgICAgICAgIGlmKCBJc1ZhbGlkRmllbGRQYXRjaEV2ZW50KHRoaXMuY29yZSwgZXZlbnQpICl7XG4gICAgICAgICAgICBpZiggZXZlbnQuY29uZmlnLm5hbWUgaW4gdGhpcy5jb3JlLmVudGl0eSApe1xuICAgICAgICAgICAgICBjb25zdCBuZXdWYWx1ZSA9IGlzTmFOKGV2ZW50LmNvbmZpZy5jb250cm9sLnZhbHVlKSA/IGV2ZW50LmNvbmZpZy5jb250cm9sLnZhbHVlIDogK2V2ZW50LmNvbmZpZy5jb250cm9sLnZhbHVlO1xuICAgICAgICAgICAgICB0aGlzLmNvcmUuZW50aXR5WyBldmVudC5jb25maWcubmFtZSBdID0gbmV3VmFsdWU7XG4gICAgICAgICAgICAgIGlmKCB0aGlzLmNvbmZpZy5maWVsZEl0ZW1zLmxlbmd0aCA+IDEgKXtcbiAgICAgICAgICAgICAgICB0aGlzLl9yZXNldENvbXBvbmVudExpc3RIaWRkZW4oKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRvbS5zZXRUaW1lb3V0KGB1cGRhdGUtcmVsYXRpb25zYCwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgdGhpcy5fdHJpZ2dlclBhcmVudENoaWxkVXBkYXRlcyhldmVudC5jb25maWcubmFtZSk7XG4gICAgICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYoIGV2ZW50LmNvbmZpZy5idWJibGUgfHwgWyAncGF0Y2gnLCAncG9ydGFsJyBdLmluY2x1ZGVzKGV2ZW50Lm5hbWUpICl7XG4gICAgICAgICAgICB0aGlzLmV2ZW50cy5lbWl0KGV2ZW50KTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cblxuICAgICAgICB0aGlzLmNvbmZpZy5nZXRGaWVsZCA9IChuYW1lOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICBpZiggbmFtZSAmJiBuYW1lIGluIHRoaXMuY29uZmlnLmZpZWxkSXRlbU1hcCApe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLmZpZWxkSXRlbXNbIHRoaXMuY29uZmlnLmZpZWxkSXRlbU1hcFsgbmFtZSBdIF07XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZXZlbnRzLmVtaXQoeyBzb3VyY2U6ICdHcm91cENvbXBvbmVudCcsIHR5cGU6ICdmaWVsZF9ncm91cCcsIG5hbWU6ICdpbml0JywgaWQ6IHRoaXMuY29uZmlnLmlkLCBncm91cDogdGhpcy5jb25maWcgfSk7XG4gICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgdGhpcy5kb20ucHJvY2VlZCA9ICgpPT4ge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCAoIHJlc29sdmUgKSA9PiB7XG4gICAgICAgIHRoaXMuZG9tLnNldFRpbWVvdXQoYHBhcmVudC1jaGlsZGAsICgpPT57XG4gICAgICAgICAgdGhpcy5fdHJpZ2dlclBhcmVudENoaWxkVXBkYXRlcygnY2xpZW50X2lkJyk7XG4gICAgICAgIH0pXG4gICAgICAgIHJldHVybiByZXNvbHZlKCB0cnVlICk7XG4gICAgICB9ICk7XG4gICAgfTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgY29tcG9uZW50IHNob3VsZCBoYXZlIGEgc3BlY2lmaWMgcHVycG9zZVxuICAgKi9cbiAgbmdPbkluaXQoKXtcbiAgICBzdXBlci5uZ09uSW5pdCgpO1xuICB9XG5cblxuICAvKipcbiAgICogVGhlIGRvbSBkZXN0cm95IGZ1bmN0aW9uIG1hbmFnZXMgYWxsIHRoZSBjbGVhbiB1cCB0aGF0IGlzIG5lY2Vzc2FyeSBpZiBzdWJzY3JpcHRpb25zLCB0aW1lb3V0cywgZXRjIGFyZSBzdG9yZWQgcHJvcGVybHlcbiAgICovXG4gIG5nT25EZXN0cm95KCl7XG4gICAgdGhpcy5zdWJzY3JpYmVycy5tYXAoZnVuY3Rpb24oc3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb24pe1xuICAgICAgaWYoIHN1YnNjcmlwdGlvbiApIHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgIH0pO1xuICAgIHN1cGVyLm5nT25EZXN0cm95KCk7XG4gIH1cblxuXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVW5kZXIgVGhlIEhvb2QgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBQcml2YXRlIE1ldGhvZCApICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4gIC8qKlxuICAgKiBHZXQgYSBsaW5lYXIgbGlzdCBvZiB0aGUgcGFyZW50IGNoaWxkIHJlbGF0aW9ucyBmcm9tIGEgZ2l2ZW4gcG9pbnRcbiAgICogQHBhcmFtIHNlbGYgdGhlIG5hbWUgdG8gc3RhcnQgZnJvbSAodXN1YWxseSB0aGUgZmllbGQgdGhhdCBoYXMganVzdCBiZWVuIGNoYW5nZWQgYnkgdXNlcilcbiAgICogQHBhcmFtIGxpc3RcbiAgICovXG4gIHByaXZhdGUgX2dldFJlbGF0aW9uTGlzdChuYW1lOiBzdHJpbmcsIGxpc3Q6IGFueVtdID0gW10peyAvLyByZWN1cnNpdmUgbG9vcFxuICAgIGxldCBpdGVtO1xuICAgIGlmKCBuYW1lICYmIG5hbWUgaW4gdGhpcy5jb25maWcuZmllbGRJdGVtTWFwICl7XG4gICAgICBpdGVtID0gdGhpcy5jb25maWcuZmllbGRJdGVtc1sgdGhpcy5jb25maWcuZmllbGRJdGVtTWFwWyBuYW1lIF0gXTtcbiAgICAgIGlmKCBJc09iamVjdChpdGVtLCBbICdjb25maWcnLCAnbW9kZWwnIF0pICl7XG4gICAgICAgIGxpc3QucHVzaCh7XG4gICAgICAgICAgbmFtZTogaXRlbS5jb25maWcubmFtZSxcbiAgICAgICAgICBhdXRvRmlsbDogdGhpcy5fZmllbGRIYXNBdXRvRmlsbChuYW1lKSxcbiAgICAgICAgfSk7XG4gICAgICAgIGlmKCB0aGlzLl9maWVsZEhhc0NoaWxkKG5hbWUpICl7XG4gICAgICAgICAgdGhpcy5fZ2V0UmVsYXRpb25MaXN0KHRoaXMuY29uZmlnLmZpZWxkSXRlbXNbIHRoaXMuY29uZmlnLmZpZWxkSXRlbU1hcFsgbmFtZSBdIF0ubW9kZWwub3B0aW9ucy5jaGlsZCwgbGlzdCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgIH1cbiAgICByZXR1cm4gbGlzdDtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIERldGVybWluZSBpZiBmaWVsZCBoYXMgYSBjaGlsZCByZWxhdGlvbiBpbiB0aGUgbGlzdFxuICAgKiBAcGFyYW0gbmFtZVxuICAgKi9cbiAgcHJpdmF0ZSBfZmllbGRIYXNDaGlsZChuYW1lOiBzdHJpbmcpe1xuICAgIGlmKCBuYW1lIGluIHRoaXMuY29uZmlnLmZpZWxkSXRlbU1hcCAmJiB0aGlzLmNvbmZpZy5maWVsZEl0ZW1zWyB0aGlzLmNvbmZpZy5maWVsZEl0ZW1NYXBbIG5hbWUgXSBdLm1vZGVsICYmIHRoaXMuY29uZmlnLmZpZWxkSXRlbXNbIHRoaXMuY29uZmlnLmZpZWxkSXRlbU1hcFsgbmFtZSBdIF0ubW9kZWwub3B0aW9ucyApe1xuICAgICAgaWYoIHRoaXMuY29uZmlnLmZpZWxkSXRlbXNbIHRoaXMuY29uZmlnLmZpZWxkSXRlbU1hcFsgbmFtZSBdIF0ubW9kZWwub3B0aW9ucy5jaGlsZCApe1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmUgaWYgZmllbGQgc2hvdWxkIGJlIGF1dG8gZmlsbGVkIHdpdGggdGhlIGZpcnN0IGl0ZW0gaW4gdGhlIGxpc3RcbiAgICogQHBhcmFtIG5hbWVcbiAgICovXG4gIHByaXZhdGUgX2ZpZWxkSGFzQXV0b0ZpbGwobmFtZTogc3RyaW5nKXtcbiAgICBpZiggbmFtZSBpbiB0aGlzLmNvbmZpZy5maWVsZEl0ZW1NYXAgJiYgdGhpcy5jb25maWcuZmllbGRJdGVtc1sgdGhpcy5jb25maWcuZmllbGRJdGVtTWFwWyBuYW1lIF0gXS5tb2RlbCAmJiB0aGlzLmNvbmZpZy5maWVsZEl0ZW1zWyB0aGlzLmNvbmZpZy5maWVsZEl0ZW1NYXBbIG5hbWUgXSBdLm1vZGVsLm9wdGlvbnMgKXtcbiAgICAgIGlmKCB0aGlzLmNvbmZpZy5maWVsZEl0ZW1zWyB0aGlzLmNvbmZpZy5maWVsZEl0ZW1NYXBbIG5hbWUgXSBdLm1vZGVsLmF1dG9GaWxsICl7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG5cbiAgcHJpdmF0ZSBfdHJpZ2dlclBhcmVudENoaWxkVXBkYXRlcyhuYW1lOiBzdHJpbmcpe1xuICAgIGNvbnNvbGUubG9nKCd0cmlnZ2VyUGFyZW50Q2hpbGRVcGRhdGVzJywgbmFtZSk7XG5cbiAgICBpZiggdGhpcy5fZmllbGRIYXNDaGlsZChuYW1lKSApe1xuICAgICAgbGV0IHZhbHVlcztcbiAgICAgIGxldCBjaGlsZF9maztcbiAgICAgIGxldCBjaGlsZEZpZWxkO1xuICAgICAgbGV0IGF1dG9GaWxsID0gZmFsc2U7XG4gICAgICBsZXQgc2V0O1xuICAgICAgbGV0IHJlc291cmNlO1xuICAgICAgY29uc3QgcmVsYXRpb25zID0gdGhpcy5fZ2V0UmVsYXRpb25MaXN0KG5hbWUpO1xuICAgICAgLy8gY29uc29sZS5sb2coJ3JlbGF0aW9ucycsIHJlbGF0aW9ucyk7XG4gICAgICByZWxhdGlvbnMuc29tZSgocmVsYXRpb24pID0+IHtcbiAgICAgICAgaWYoIHJlbGF0aW9uLmF1dG9GaWxsICl7XG4gICAgICAgICAgYXV0b0ZpbGwgPSB0cnVlO1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgaWYoIG5hbWUgJiYgbmFtZSBpbiB0aGlzLmNvbmZpZy5maWVsZEl0ZW1NYXAgKXtcbiAgICAgICAgY2hpbGRfZmsgPSB0aGlzLmNvbmZpZy5maWVsZEl0ZW1zWyB0aGlzLmNvbmZpZy5maWVsZEl0ZW1NYXBbIG5hbWUgXSBdLm1vZGVsLm9wdGlvbnMuY2hpbGQ7XG4gICAgICAgIGlmKCBjaGlsZF9mayAmJiBjaGlsZF9mayBpbiB0aGlzLmNvbmZpZy5maWVsZEl0ZW1NYXAgKXtcbiAgICAgICAgICBjaGlsZEZpZWxkID0gdGhpcy5jb25maWcuZmllbGRJdGVtc1sgdGhpcy5jb25maWcuZmllbGRJdGVtTWFwWyBjaGlsZF9mayBdIF07XG4gICAgICAgICAgLy8gY29uc29sZS5sb2coJ2NoaWxkIGZpZWxkJywgY2hpbGRGaWVsZCk7XG4gICAgICAgICAgaWYoIGNoaWxkRmllbGQubW9kZWwuZm9ybSA9PT0gJ3NlbGVjdCcgKXtcbiAgICAgICAgICAgIGlmKCBjaGlsZEZpZWxkLm1vZGVsLm9wdGlvbnMucmVzb3VyY2UgKXtcbiAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ2hhcyByZXNvdXJjZScsIGNoaWxkRmllbGQubW9kZWwub3B0aW9ucy5yZXNvdXJjZSwgdGhpcy5jb25maWcubWV0YWRhdGFbIGNoaWxkRmllbGQubW9kZWwub3B0aW9ucy5yZXNvdXJjZSBdKTtcbiAgICAgICAgICAgICAgaWYoIElzT2JqZWN0KHRoaXMuY29uZmlnLm1ldGFkYXRhWyBjaGlsZEZpZWxkLm1vZGVsLm9wdGlvbnMucmVzb3VyY2UgXSwgWyAnZGF0YV92YWx1ZXMnIF0pICl7XG4gICAgICAgICAgICAgICAgcmVzb3VyY2UgPSB0aGlzLmNvbmZpZy5tZXRhZGF0YVsgY2hpbGRGaWVsZC5tb2RlbC5vcHRpb25zLnJlc291cmNlIF0uZGF0YV92YWx1ZXM7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdyZXNvdXJjZScsIHJlc291cmNlKTtcbiAgICAgICAgICAgIGlmKCBJc0FycmF5KHJlc291cmNlLCB0cnVlKSApe1xuICAgICAgICAgICAgICB2YWx1ZXMgPSBDb252ZXJ0QXJyYXlUb09wdGlvbkxpc3QocmVzb3VyY2UsIHtcbiAgICAgICAgICAgICAgICAvLyBlbnN1cmUgdGhhdCBhbiBvcHRpb24gc2hvd3MgdXAgaW4gbGlzdCBpbiBjYXNlIG90aGVyIGNvbmRpdGlvbnMgcmVtb3ZlIGl0LCBha2EgaXQgaGFzIGJlZW4gYXJjaGl2ZWRcbiAgICAgICAgICAgICAgICBwcmV2ZW50OiBbXSwgLy8gYSBsaXN0IG9mIGlkcyB0aGF0IHNob3VsZCBub3QgYXBwZWFyIGluIHRoZSBsaXN0IGZvciB3aGF0ZXZlciByZWFzb25cbiAgICAgICAgICAgICAgICAvLyBwYXJlbnQgbWVhbnMgdGhpcyBvcHRpb25zIHNob3VsZCBhbGwgaGF2ZSBhIGNvbW1vbiBmaWVsZCB0cmFpdCBsaWtlIGNsaWVudF9maywgYWNjb3VudF9mayAuLi4uXG4gICAgICAgICAgICAgICAgcGFyZW50OiBjaGlsZEZpZWxkLm1vZGVsLm9wdGlvbnMucGFyZW50ID8ge1xuICAgICAgICAgICAgICAgICAgZmllbGQ6IGNoaWxkRmllbGQubW9kZWwub3B0aW9ucy5wYXJlbnQsXG4gICAgICAgICAgICAgICAgICB2YWx1ZTogdGhpcy5jb3JlLmVudGl0eVsgY2hpbGRGaWVsZC5tb2RlbC5vcHRpb25zLnBhcmVudCBdXG4gICAgICAgICAgICAgICAgfSA6IG51bGwsXG4gICAgICAgICAgICAgICAgZW1wdHk6IGNoaWxkRmllbGQubW9kZWwub3B0aW9ucy5lbXB0eSA/IGNoaWxkRmllbGQubW9kZWwub3B0aW9ucy5lbXB0eSA6IG51bGwsXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgIHZhbHVlcyA9IFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ3ZhbHVlcycsIHZhbHVlcyk7XG5cbiAgICAgICAgICAgIGlmKCBhdXRvRmlsbCAmJiB2YWx1ZXMubGVuZ3RoICl7XG4gICAgICAgICAgICAgIHNldCA9IHZhbHVlc1sgdmFsdWVzLmxlbmd0aCAtIDEgXS52YWx1ZTtcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICBzZXQgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2hpbGRGaWVsZC5jb25maWcub3B0aW9ucy52YWx1ZXMgPSB2YWx1ZXM7XG4gICAgICAgICAgICBhdXRvRmlsbCA9IGF1dG9GaWxsICYmIHZhbHVlcy5sZW5ndGggPyB2YWx1ZXNbIDAgXS52YWx1ZSA6IG51bGw7XG4gICAgICAgICAgICBpZiggdHlwZW9mIGNoaWxkRmllbGQuY29uZmlnLnRyaWdnZXJPbkNoYW5nZSA9PT0gJ2Z1bmN0aW9uJyApIGNoaWxkRmllbGQuY29uZmlnLnRyaWdnZXJPbkNoYW5nZShzZXQpO1xuXG4gICAgICAgICAgICB0aGlzLmRvbS5zZXRUaW1lb3V0KGBjbGVhci1tZXNzYWdlLSR7Y2hpbGRfZmt9YCwgKCkgPT4ge1xuICAgICAgICAgICAgICBpZiggdHlwZW9mIGNoaWxkRmllbGQuY29uZmlnLmNsZWFyTWVzc2FnZSA9PT0gJ2Z1bmN0aW9uJyApe1xuICAgICAgICAgICAgICAgIGNoaWxkRmllbGQuY29uZmlnLmNsZWFyTWVzc2FnZSgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCAwKTtcblxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICB9XG5cblxuICAvKipcbiAgICogV2hlbmV2ZXIgYSB1cGRhdGUgdG8gdGhlIGNvcmUgZW50aXR5IGhhcHBlbnMgdGhlIGZpZWxkcyBpbiB0aGUgZ3JvdXAgc2hvdWxkIGJlIHJlLWV2YWx1YXRlZCBpZiB0aGVyZSBhcmUgd2hlbiBjb25kaXRpb25hbHMgc2V0XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBwcml2YXRlIF9yZXNldENvbXBvbmVudExpc3RIaWRkZW4oKXtcbi8vICAgICBjb25zb2xlLmxvZygnX3Jlc2V0Q29tcG9uZW50TGlzdEhpZGRlbicsIHRoaXMudGVtcGxhdGUucmVmcyk7XG4gICAgbGV0IG5hbWU7XG4gICAgdGhpcy50ZW1wbGF0ZS5yZWZzLmZpbHRlcigoY29tcG9uZW50UmVmOiBDb21wb25lbnRSZWY8YW55PikgPT4ge1xuICAgICAgcmV0dXJuIElzT2JqZWN0KGNvbXBvbmVudFJlZi5pbnN0YW5jZS5jb25maWcsIHRydWUpICYmIElzQXJyYXkoY29tcG9uZW50UmVmLmluc3RhbmNlLndoZW4sIHRydWUpO1xuICAgIH0pLm1hcCgoY29tcG9uZW50UmVmOiBDb21wb25lbnRSZWY8YW55PikgPT4ge1xuICAgICAgbmFtZSA9IGNvbXBvbmVudFJlZi5pbnN0YW5jZS5jb25maWcubmFtZTtcbiAgICAgIGlmKCBuYW1lICYmIG5hbWUgaW4gdGhpcy5jb25maWcuZmllbGRJdGVtTWFwICl7XG4gICAgICAgIGNvbXBvbmVudFJlZi5pbnN0YW5jZS5oaWRkZW4gPSAhRXZhbHVhdGVXaGVuQ29uZGl0aW9uKHRoaXMuY29yZSwgY29tcG9uZW50UmVmLmluc3RhbmNlLndoZW4sIHRoaXMuY29yZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==