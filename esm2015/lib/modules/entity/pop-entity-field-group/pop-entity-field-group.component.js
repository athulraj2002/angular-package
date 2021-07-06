import { __awaiter } from "tslib";
import { Component, ElementRef, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { PopExtendDynamicComponent } from '../../../pop-extend-dynamic.component';
import { ServiceInjector } from '../../../pop-common.model';
import { PopEntityUtilFieldService } from '../services/pop-entity-util-field.service';
import { EvaluateWhenCondition, IsValidFieldPatchEvent } from '../pop-entity-utility';
import { ConvertArrayToOptionList, IsArray, IsObject, IsObjectThrowError, StorageGetter } from '../../../pop-common-utility';
import { PopDomService } from '../../../services/pop-dom.service';
import { PopTabMenuService } from '../../base/pop-tab-menu/pop-tab-menu.service';
export class PopEntityFieldGroupComponent extends PopExtendDynamicComponent {
    constructor(el, _domRepo, _tabRepo) {
        super();
        this.el = el;
        this._domRepo = _domRepo;
        this._tabRepo = _tabRepo;
        this.name = 'PopEntityFieldGroupComponent';
        this.position = 1;
        this.fieldType = null;
        this.srv = {
            field: ServiceInjector.get(PopEntityUtilFieldService),
            tab: undefined
        };
        this.dom.configure = () => {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                this.core = IsObjectThrowError(this.core, true, `${this.name}:configure: - this.core`) ? this.core : null;
                // handles events
                this.trait.bubble = true;
                this.dom.handler.bubble = (core, event) => this.onBubbleEvent(event);
                // this.dom.handler.core = ( core: CoreConfig, event: PopBaseEventInterface ) => this._coreEventHandler( event );
                this.id = this.position;
                return resolve(true);
            }));
        };
        this.dom.proceed = () => {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                this.dom.overhead = this.interface && this.interface.header ? 60 : 0;
                this.dom.setHeightWithParent(null, this.dom.overhead, 600).then(() => true);
                // Get the list of fields and render them into the view
                const fieldComponentList = yield this._getFieldComponentList();
                this.template.attach('container');
                this.template.render(fieldComponentList);
                return resolve(true);
            }));
        };
    }
    /**
     * This component receives a list of fields to render
     */
    ngOnInit() {
        super.ngOnInit();
    }
    /**
     * Clean up the dom of this component
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
     * This will retrieve any fields that have been marked for the position of this field group
     */
    _getFieldComponentList() {
        return new Promise((resolve) => {
            let fields = this.srv.field.getDomFields(this.position, this.dom.repo);
            if (this.fieldType === 'custom') {
                fields = fields.filter((field) => {
                    return field.custom;
                });
            }
            else if (this.fieldType === 'table') {
                fields = fields.filter((field) => {
                    return !(field.custom);
                });
            }
            this.asset.fields = {};
            fields.map((field) => {
                const config = StorageGetter(field, ['inputs', 'config'], null);
                if (config) {
                    this.asset.fields[config.name] = config;
                }
            });
            const componentList = fields;
            return resolve(componentList);
        });
    }
    /**
     * The fields will trigger a slew of events
     * @param event
     */
    onBubbleEvent(event) {
        this.log.event(`onBubbleEvent`, event);
        if (IsValidFieldPatchEvent(this.core, event) || event.type === 'context_menu') {
            this.log.info(`IsValidFieldPatchEvent`, event);
            if (event.type === 'field' && event.config.name in this.core.entity) {
                const newValue = isNaN(event.config.control.value) ? event.config.control.value : +event.config.control.value;
                this.core.entity[event.config.name] = newValue;
                if (Object.keys(this.asset.fields).length > 1) {
                    this.dom.setTimeout('reset-hidden', () => {
                        this._triggerParentChildUpdates(event.config.name);
                        // this._resetComponentListHidden();
                    }, 0);
                }
                else {
                    this.dom.setTimeout('reset-hidden', () => {
                        // this._resetComponentListHidden();
                    }, 0);
                }
            }
            this.events.emit(event);
            this.srv.tab.clearCache();
        }
    }
    //
    // /**
    //  * This handler handles any events that come across the core cross channel
    //  * @param event
    //  * @private
    //  */
    // private _coreEventHandler( event: PopBaseEventInterface ){
    //   this.log.event(`_coreEventHandler`, event);
    //   if( IsValidFieldPatchEvent( this.core, event ) ){
    //     // A values has been patched recheck the list of fields to see if any of them should be hidden
    //
    //   }
    // }
    /**
     * Whenever a _update to the core entity happens the fields in the group should be re-evaluated if there are when conditionals set
     * @private
     */
    _resetComponentListHidden() {
        let name, def;
        const Fields = this.dom.repo.ui.fields;
        this.template.refs.filter((componentRef) => {
            return IsObject(componentRef.instance.config, true) && IsArray(componentRef.instance.when, true);
        }).map((componentRef) => {
            name = componentRef.instance.config.name;
            if (name) {
                def = Fields.get(name);
                if (def) {
                    componentRef.instance.hidden = def.inputs.hidden = !EvaluateWhenCondition(this.core, componentRef.instance.when, this.core);
                    Fields.set(name, def);
                }
            }
        });
    }
    /**
     * This will update the option values of related parent/child fields
     * @param name
     * @private
     */
    _triggerParentChildUpdates(name) {
        this.log.info(`_triggerParentChildUpdates`, name);
        if (this._fieldHasChild(name)) {
            let values;
            let child_fk;
            let childField;
            let autoFill = false;
            let set;
            const relations = this._getRelationList(name);
            relations.some((relation) => {
                if (relation.autoFill) {
                    autoFill = true;
                    return true;
                }
            });
            if (name && name in this.asset.fields) {
                child_fk = this.asset.fields[name].options.child;
                if (child_fk && child_fk in this.asset.fields) {
                    childField = this.asset.fields[child_fk];
                    if (IsArray(childField.options.rawValues)) {
                        values = ConvertArrayToOptionList(childField.options.rawValues, {
                            // ensure that an option shows up in list in case other conditions remove it, aka it has been archived
                            prevent: [],
                            // parent means this options should all have a common field trait like client_fk, account_fk ....
                            parent: childField.options.parent ? {
                                field: childField.options.parent,
                                value: this.core.entity[childField.options.parent]
                            } : null,
                            empty: childField.options.empty ? childField.options.empty : null,
                        });
                        if (autoFill && values.length) {
                            set = values[values.length - 1].value;
                        }
                        else {
                            set = null;
                        }
                        childField.options.values = values;
                        autoFill = autoFill && values.length ? values[0].value : null;
                        this.dom.setTimeout(`clear-message-${child_fk}`, () => {
                            if (typeof childField.triggerOnChange === 'function')
                                childField.triggerOnChange(set);
                            if (typeof childField.clearMessage === 'function') {
                                childField.clearMessage();
                            }
                        }, 0);
                    }
                }
            }
        }
    }
    /**
     * Get a linear list of the parent child relations from a given point
     * @param self the name to start from (usually the field that has just been changed by user)
     * @param list
     */
    _getRelationList(name, list = []) {
        let item;
        if (name && name in this.asset.fields) {
            item = this.asset.fields[name];
            if (IsObject(item, true)) {
                list.push({
                    name: item.name,
                    autoFill: this._fieldHasAutoFill(name),
                });
                if (this._fieldHasChild(name)) {
                    this._getRelationList(item.options.child, list);
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
        if (name in this.asset.fields && this.asset.fields[name].options) {
            if (this.asset.fields[name].options.child) {
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
        if (name in this.asset.fields && this.asset.fields[name]) {
            if (this.asset.fields[name].autoFill) {
                return true;
            }
        }
        return false;
    }
}
PopEntityFieldGroupComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-entity-field-group',
                template: "<div class=\"pop-entity-field-group-container\">\n  <ng-container #container></ng-container>\n</div>\n",
                styles: [".pop-entity-field-group-container{max-width:450px}"]
            },] }
];
PopEntityFieldGroupComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: PopDomService },
    { type: PopTabMenuService }
];
PopEntityFieldGroupComponent.propDecorators = {
    position: [{ type: Input }],
    fieldType: [{ type: Input }],
    interface: [{ type: Input }],
    container: [{ type: ViewChild, args: ['container', { read: ViewContainerRef, static: true },] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS1maWVsZC1ncm91cC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9lbnRpdHkvcG9wLWVudGl0eS1maWVsZC1ncm91cC9wb3AtZW50aXR5LWZpZWxkLWdyb3VwLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBZ0IsVUFBVSxFQUFFLEtBQUssRUFBcUIsU0FBUyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNILE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBQ2xGLE9BQU8sRUFNTCxlQUFlLEVBQ2hCLE1BQU0sMkJBQTJCLENBQUM7QUFDbkMsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sMkNBQTJDLENBQUM7QUFDdEYsT0FBTyxFQUFFLHFCQUFxQixFQUFFLHNCQUFzQixFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDdEYsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsa0JBQWtCLEVBQUUsYUFBYSxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDN0gsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBQ2xFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDhDQUE4QyxDQUFDO0FBUWpGLE1BQU0sT0FBTyw0QkFBNkIsU0FBUSx5QkFBeUI7SUFjekUsWUFDUyxFQUFjLEVBQ1gsUUFBdUIsRUFDdkIsUUFBMkI7UUFFckMsS0FBSyxFQUFFLENBQUM7UUFKRCxPQUFFLEdBQUYsRUFBRSxDQUFZO1FBQ1gsYUFBUSxHQUFSLFFBQVEsQ0FBZTtRQUN2QixhQUFRLEdBQVIsUUFBUSxDQUFtQjtRQWhCaEMsU0FBSSxHQUFHLDhCQUE4QixDQUFDO1FBQ3BDLGFBQVEsR0FB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RSxJQUFJLENBQUUsQ0FBQyxRQUFRLEVBQUU7Z0JBQ3RDLE9BQU8sSUFBSSxDQUFDO2FBQ2I7U0FDRjtRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQzs7O1lBMVJGLFNBQVMsU0FBRTtnQkFDVixRQUFRLEVBQUUsNEJBQTRCO2dCQUN0QyxrSEFBc0Q7O2FBRXZEOzs7WUFyQmlDLFVBQVU7WUFhbkMsYUFBYTtZQUNiLGlCQUFpQjs7O3VCQVV2QixLQUFLO3dCQUNMLEtBQUs7d0JBQ0wsS0FBSzt3QkFDTCxTQUFTLFNBQUUsV0FBVyxFQUFFLEVBQUUsSUFBSSxFQUFFLGdCQUFnQixFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIENvbXBvbmVudFJlZiwgRWxlbWVudFJlZiwgSW5wdXQsIE9uRGVzdHJveSwgT25Jbml0LCBWaWV3Q2hpbGQsIFZpZXdDb250YWluZXJSZWYgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFBvcEV4dGVuZER5bmFtaWNDb21wb25lbnQgfSBmcm9tICcuLi8uLi8uLi9wb3AtZXh0ZW5kLWR5bmFtaWMuY29tcG9uZW50JztcbmltcG9ydCB7XG4gIENvcmVDb25maWcsXG4gIER5bmFtaWNDb21wb25lbnRJbnRlcmZhY2UsXG4gIEZpZWxkR3JvdXBJbnRlcmZhY2UsXG4gIEZpZWxkSW50ZXJmYWNlLFxuICBQb3BCYXNlRXZlbnRJbnRlcmZhY2UsXG4gIFNlcnZpY2VJbmplY3RvclxufSBmcm9tICcuLi8uLi8uLi9wb3AtY29tbW9uLm1vZGVsJztcbmltcG9ydCB7IFBvcEVudGl0eVV0aWxGaWVsZFNlcnZpY2UgfSBmcm9tICcuLi9zZXJ2aWNlcy9wb3AtZW50aXR5LXV0aWwtZmllbGQuc2VydmljZSc7XG5pbXBvcnQgeyBFdmFsdWF0ZVdoZW5Db25kaXRpb24sIElzVmFsaWRGaWVsZFBhdGNoRXZlbnQgfSBmcm9tICcuLi9wb3AtZW50aXR5LXV0aWxpdHknO1xuaW1wb3J0IHsgQ29udmVydEFycmF5VG9PcHRpb25MaXN0LCBJc0FycmF5LCBJc09iamVjdCwgSXNPYmplY3RUaHJvd0Vycm9yLCBTdG9yYWdlR2V0dGVyIH0gZnJvbSAnLi4vLi4vLi4vcG9wLWNvbW1vbi11dGlsaXR5JztcbmltcG9ydCB7IFBvcERvbVNlcnZpY2UgfSBmcm9tICcuLi8uLi8uLi9zZXJ2aWNlcy9wb3AtZG9tLnNlcnZpY2UnO1xuaW1wb3J0IHsgUG9wVGFiTWVudVNlcnZpY2UgfSBmcm9tICcuLi8uLi9iYXNlL3BvcC10YWItbWVudS9wb3AtdGFiLW1lbnUuc2VydmljZSc7XG5cblxuQENvbXBvbmVudCgge1xuICBzZWxlY3RvcjogJ2xpYi1wb3AtZW50aXR5LWZpZWxkLWdyb3VwJyxcbiAgdGVtcGxhdGVVcmw6ICcuL3BvcC1lbnRpdHktZmllbGQtZ3JvdXAuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsgJy4vcG9wLWVudGl0eS1maWVsZC1ncm91cC5jb21wb25lbnQuc2NzcycgXVxufSApXG5leHBvcnQgY2xhc3MgUG9wRW50aXR5RmllbGRHcm91cENvbXBvbmVudCBleHRlbmRzIFBvcEV4dGVuZER5bmFtaWNDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG4gIHB1YmxpYyBuYW1lID0gJ1BvcEVudGl0eUZpZWxkR3JvdXBDb21wb25lbnQnO1xuICBASW5wdXQoKSBwb3NpdGlvbiA9IDE7XG4gIEBJbnB1dCgpIGZpZWxkVHlwZTogJ2N1c3RvbScgfCAndGFibGUnID0gbnVsbDtcbiAgQElucHV0KCkgcHVibGljIGludGVyZmFjZTogRmllbGRHcm91cEludGVyZmFjZTsgLy8gcmVsaWVzIG9uIHRvcCBsZXZlbCBjb21wb25lbnQgdG8gc2V0XG4gIEBWaWV3Q2hpbGQoICdjb250YWluZXInLCB7IHJlYWQ6IFZpZXdDb250YWluZXJSZWYsIHN0YXRpYzogdHJ1ZSB9ICkgcHJpdmF0ZSBjb250YWluZXI7XG5cblxuICBwcm90ZWN0ZWQgc3J2ID0ge1xuICAgIGZpZWxkOiA8UG9wRW50aXR5VXRpbEZpZWxkU2VydmljZT5TZXJ2aWNlSW5qZWN0b3IuZ2V0KCBQb3BFbnRpdHlVdGlsRmllbGRTZXJ2aWNlICksXG4gICAgdGFiOiA8UG9wVGFiTWVudVNlcnZpY2U+dW5kZWZpbmVkXG4gIH07XG5cblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgZWw6IEVsZW1lbnRSZWYsXG4gICAgcHJvdGVjdGVkIF9kb21SZXBvOiBQb3BEb21TZXJ2aWNlLFxuICAgIHByb3RlY3RlZCBfdGFiUmVwbzogUG9wVGFiTWVudVNlcnZpY2UsXG4gICl7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuZG9tLmNvbmZpZ3VyZSA9ICgpOiBQcm9taXNlPGJvb2xlYW4+ID0+IHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSggYXN5bmMoIHJlc29sdmUgKSA9PiB7XG4gICAgICAgIHRoaXMuY29yZSA9IElzT2JqZWN0VGhyb3dFcnJvciggdGhpcy5jb3JlLCB0cnVlLCBgJHt0aGlzLm5hbWV9OmNvbmZpZ3VyZTogLSB0aGlzLmNvcmVgICkgPyB0aGlzLmNvcmUgOiBudWxsO1xuICAgICAgICAvLyBoYW5kbGVzIGV2ZW50c1xuICAgICAgICB0aGlzLnRyYWl0LmJ1YmJsZSA9IHRydWU7XG4gICAgICAgIHRoaXMuZG9tLmhhbmRsZXIuYnViYmxlID0gKCBjb3JlOiBDb3JlQ29uZmlnLCBldmVudDogUG9wQmFzZUV2ZW50SW50ZXJmYWNlICkgPT4gdGhpcy5vbkJ1YmJsZUV2ZW50KCBldmVudCApO1xuICAgICAgICAvLyB0aGlzLmRvbS5oYW5kbGVyLmNvcmUgPSAoIGNvcmU6IENvcmVDb25maWcsIGV2ZW50OiBQb3BCYXNlRXZlbnRJbnRlcmZhY2UgKSA9PiB0aGlzLl9jb3JlRXZlbnRIYW5kbGVyKCBldmVudCApO1xuICAgICAgICB0aGlzLmlkID0gdGhpcy5wb3NpdGlvbjtcbiAgICAgICAgcmV0dXJuIHJlc29sdmUoIHRydWUgKTtcbiAgICAgIH0gKTtcbiAgICB9O1xuXG4gICAgdGhpcy5kb20ucHJvY2VlZCA9ICgpOiBQcm9taXNlPGJvb2xlYW4+ID0+IHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSggYXN5bmMoIHJlc29sdmUgKSA9PiB7XG4gICAgICAgIHRoaXMuZG9tLm92ZXJoZWFkID0gdGhpcy5pbnRlcmZhY2UgJiYgdGhpcy5pbnRlcmZhY2UuaGVhZGVyID8gNjAgOiAwO1xuICAgICAgICB0aGlzLmRvbS5zZXRIZWlnaHRXaXRoUGFyZW50KCBudWxsLCB0aGlzLmRvbS5vdmVyaGVhZCwgNjAwICkudGhlbiggKCkgPT4gdHJ1ZSApO1xuICAgICAgICAvLyBHZXQgdGhlIGxpc3Qgb2YgZmllbGRzIGFuZCByZW5kZXIgdGhlbSBpbnRvIHRoZSB2aWV3XG5cbiAgICAgICAgY29uc3QgZmllbGRDb21wb25lbnRMaXN0ID0gYXdhaXQgdGhpcy5fZ2V0RmllbGRDb21wb25lbnRMaXN0KCk7XG4gICAgICAgIHRoaXMudGVtcGxhdGUuYXR0YWNoKCAnY29udGFpbmVyJyApO1xuICAgICAgICB0aGlzLnRlbXBsYXRlLnJlbmRlciggZmllbGRDb21wb25lbnRMaXN0ICk7XG4gICAgICAgIHJldHVybiByZXNvbHZlKCB0cnVlICk7XG4gICAgICB9ICk7XG4gICAgfTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgY29tcG9uZW50IHJlY2VpdmVzIGEgbGlzdCBvZiBmaWVsZHMgdG8gcmVuZGVyXG4gICAqL1xuICBuZ09uSW5pdCgpe1xuICAgIHN1cGVyLm5nT25Jbml0KCk7XG4gIH1cblxuXG5cbiAgLyoqXG4gICAqIENsZWFuIHVwIHRoZSBkb20gb2YgdGhpcyBjb21wb25lbnRcbiAgICovXG4gIG5nT25EZXN0cm95KCl7XG4gICAgc3VwZXIubmdPbkRlc3Ryb3koKTtcbiAgfVxuXG5cbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBVbmRlciBUaGUgSG9vZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIFByaXZhdGUgTWV0aG9kICkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4gIC8qKlxuICAgKiBUaGlzIHdpbGwgcmV0cmlldmUgYW55IGZpZWxkcyB0aGF0IGhhdmUgYmVlbiBtYXJrZWQgZm9yIHRoZSBwb3NpdGlvbiBvZiB0aGlzIGZpZWxkIGdyb3VwXG4gICAqL1xuICBwcml2YXRlIF9nZXRGaWVsZENvbXBvbmVudExpc3QoKTogUHJvbWlzZTxEeW5hbWljQ29tcG9uZW50SW50ZXJmYWNlW10+e1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSggKCByZXNvbHZlICkgPT4ge1xuICAgICAgbGV0IGZpZWxkcyA9IHRoaXMuc3J2LmZpZWxkLmdldERvbUZpZWxkcyggdGhpcy5wb3NpdGlvbiwgdGhpcy5kb20ucmVwbyApO1xuICAgICAgaWYoIHRoaXMuZmllbGRUeXBlID09PSAnY3VzdG9tJyApe1xuICAgICAgICBmaWVsZHMgPSBmaWVsZHMuZmlsdGVyKCAoIGZpZWxkICkgPT4ge1xuICAgICAgICAgIHJldHVybiBmaWVsZC5jdXN0b207XG4gICAgICAgIH0gKTtcbiAgICAgIH1lbHNlIGlmKCB0aGlzLmZpZWxkVHlwZSA9PT0gJ3RhYmxlJyApe1xuICAgICAgICBmaWVsZHMgPSBmaWVsZHMuZmlsdGVyKCAoIGZpZWxkICkgPT4ge1xuICAgICAgICAgIHJldHVybiAhKCBmaWVsZC5jdXN0b20gKTtcbiAgICAgICAgfSApO1xuICAgICAgfVxuICAgICAgdGhpcy5hc3NldC5maWVsZHMgPSB7fTtcbiAgICAgIGZpZWxkcy5tYXAoICggZmllbGQ6IEZpZWxkSW50ZXJmYWNlICkgPT4ge1xuICAgICAgICBjb25zdCBjb25maWcgPSBTdG9yYWdlR2V0dGVyKCBmaWVsZCwgWyAnaW5wdXRzJywgJ2NvbmZpZycgXSwgbnVsbCApO1xuICAgICAgICBpZiggY29uZmlnICl7XG4gICAgICAgICAgdGhpcy5hc3NldC5maWVsZHNbIGNvbmZpZy5uYW1lIF0gPSBjb25maWc7XG4gICAgICAgIH1cbiAgICAgIH0gKTtcbiAgICAgIGNvbnN0IGNvbXBvbmVudExpc3Q6IER5bmFtaWNDb21wb25lbnRJbnRlcmZhY2VbXSA9IGZpZWxkcztcblxuICAgICAgcmV0dXJuIHJlc29sdmUoIGNvbXBvbmVudExpc3QgKTtcbiAgICB9ICk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGUgZmllbGRzIHdpbGwgdHJpZ2dlciBhIHNsZXcgb2YgZXZlbnRzXG4gICAqIEBwYXJhbSBldmVudFxuICAgKi9cbiAgb25CdWJibGVFdmVudCggZXZlbnQ6IFBvcEJhc2VFdmVudEludGVyZmFjZSApe1xuICAgIHRoaXMubG9nLmV2ZW50KCBgb25CdWJibGVFdmVudGAsIGV2ZW50ICk7XG4gICAgaWYoIElzVmFsaWRGaWVsZFBhdGNoRXZlbnQoIHRoaXMuY29yZSwgZXZlbnQgKSB8fCBldmVudC50eXBlID09PSAnY29udGV4dF9tZW51JyApe1xuICAgICAgdGhpcy5sb2cuaW5mbyggYElzVmFsaWRGaWVsZFBhdGNoRXZlbnRgLCBldmVudCApO1xuXG4gICAgICBpZiggZXZlbnQudHlwZSA9PT0gJ2ZpZWxkJyAmJiBldmVudC5jb25maWcubmFtZSBpbiB0aGlzLmNvcmUuZW50aXR5ICl7XG4gICAgICAgIGNvbnN0IG5ld1ZhbHVlID0gaXNOYU4oIGV2ZW50LmNvbmZpZy5jb250cm9sLnZhbHVlICkgPyBldmVudC5jb25maWcuY29udHJvbC52YWx1ZSA6ICtldmVudC5jb25maWcuY29udHJvbC52YWx1ZTtcbiAgICAgICAgdGhpcy5jb3JlLmVudGl0eVsgZXZlbnQuY29uZmlnLm5hbWUgXSA9IG5ld1ZhbHVlO1xuICAgICAgICBpZiggT2JqZWN0LmtleXMoIHRoaXMuYXNzZXQuZmllbGRzICkubGVuZ3RoID4gMSApe1xuICAgICAgICAgIHRoaXMuZG9tLnNldFRpbWVvdXQoICdyZXNldC1oaWRkZW4nLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLl90cmlnZ2VyUGFyZW50Q2hpbGRVcGRhdGVzKCBldmVudC5jb25maWcubmFtZSApO1xuICAgICAgICAgICAgLy8gdGhpcy5fcmVzZXRDb21wb25lbnRMaXN0SGlkZGVuKCk7XG5cbiAgICAgICAgICB9LCAwICk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHRoaXMuZG9tLnNldFRpbWVvdXQoICdyZXNldC1oaWRkZW4nLCAoKSA9PiB7XG4gICAgICAgICAgICAvLyB0aGlzLl9yZXNldENvbXBvbmVudExpc3RIaWRkZW4oKTtcbiAgICAgICAgICB9LCAwICk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5ldmVudHMuZW1pdCggZXZlbnQgKTtcbiAgICAgIHRoaXMuc3J2LnRhYi5jbGVhckNhY2hlKCk7XG4gICAgfVxuICB9XG5cbiAgLy9cbiAgLy8gLyoqXG4gIC8vICAqIFRoaXMgaGFuZGxlciBoYW5kbGVzIGFueSBldmVudHMgdGhhdCBjb21lIGFjcm9zcyB0aGUgY29yZSBjcm9zcyBjaGFubmVsXG4gIC8vICAqIEBwYXJhbSBldmVudFxuICAvLyAgKiBAcHJpdmF0ZVxuICAvLyAgKi9cbiAgLy8gcHJpdmF0ZSBfY29yZUV2ZW50SGFuZGxlciggZXZlbnQ6IFBvcEJhc2VFdmVudEludGVyZmFjZSApe1xuICAvLyAgIHRoaXMubG9nLmV2ZW50KGBfY29yZUV2ZW50SGFuZGxlcmAsIGV2ZW50KTtcbiAgLy8gICBpZiggSXNWYWxpZEZpZWxkUGF0Y2hFdmVudCggdGhpcy5jb3JlLCBldmVudCApICl7XG4gIC8vICAgICAvLyBBIHZhbHVlcyBoYXMgYmVlbiBwYXRjaGVkIHJlY2hlY2sgdGhlIGxpc3Qgb2YgZmllbGRzIHRvIHNlZSBpZiBhbnkgb2YgdGhlbSBzaG91bGQgYmUgaGlkZGVuXG4gIC8vXG4gIC8vICAgfVxuICAvLyB9XG5cblxuICAvKipcbiAgICogV2hlbmV2ZXIgYSBfdXBkYXRlIHRvIHRoZSBjb3JlIGVudGl0eSBoYXBwZW5zIHRoZSBmaWVsZHMgaW4gdGhlIGdyb3VwIHNob3VsZCBiZSByZS1ldmFsdWF0ZWQgaWYgdGhlcmUgYXJlIHdoZW4gY29uZGl0aW9uYWxzIHNldFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcHJpdmF0ZSBfcmVzZXRDb21wb25lbnRMaXN0SGlkZGVuKCl7XG4gICAgbGV0IG5hbWUsIGRlZjtcbiAgICBjb25zdCBGaWVsZHMgPSB0aGlzLmRvbS5yZXBvLnVpLmZpZWxkcztcbiAgICB0aGlzLnRlbXBsYXRlLnJlZnMuZmlsdGVyKCAoIGNvbXBvbmVudFJlZjogQ29tcG9uZW50UmVmPGFueT4gKSA9PiB7XG4gICAgICByZXR1cm4gSXNPYmplY3QoIGNvbXBvbmVudFJlZi5pbnN0YW5jZS5jb25maWcsIHRydWUgKSAmJiBJc0FycmF5KCBjb21wb25lbnRSZWYuaW5zdGFuY2Uud2hlbiwgdHJ1ZSApO1xuICAgIH0gKS5tYXAoICggY29tcG9uZW50UmVmOiBDb21wb25lbnRSZWY8YW55PiApID0+IHtcbiAgICAgIG5hbWUgPSBjb21wb25lbnRSZWYuaW5zdGFuY2UuY29uZmlnLm5hbWU7XG4gICAgICBpZiggbmFtZSApe1xuICAgICAgICBkZWYgPSBGaWVsZHMuZ2V0KCBuYW1lICk7XG4gICAgICAgIGlmKCBkZWYgKXtcbiAgICAgICAgICBjb21wb25lbnRSZWYuaW5zdGFuY2UuaGlkZGVuID0gZGVmLmlucHV0cy5oaWRkZW4gPSAhRXZhbHVhdGVXaGVuQ29uZGl0aW9uKCB0aGlzLmNvcmUsIGNvbXBvbmVudFJlZi5pbnN0YW5jZS53aGVuLCB0aGlzLmNvcmUgKTtcbiAgICAgICAgICBGaWVsZHMuc2V0KCBuYW1lLCBkZWYgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgd2lsbCB1cGRhdGUgdGhlIG9wdGlvbiB2YWx1ZXMgb2YgcmVsYXRlZCBwYXJlbnQvY2hpbGQgZmllbGRzXG4gICAqIEBwYXJhbSBuYW1lXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBwcml2YXRlIF90cmlnZ2VyUGFyZW50Q2hpbGRVcGRhdGVzKCBuYW1lOiBzdHJpbmcgKXtcbiAgICB0aGlzLmxvZy5pbmZvKGBfdHJpZ2dlclBhcmVudENoaWxkVXBkYXRlc2AsIG5hbWUpO1xuICAgIGlmKCB0aGlzLl9maWVsZEhhc0NoaWxkKCBuYW1lICkgKXtcbiAgICAgIGxldCB2YWx1ZXM7XG4gICAgICBsZXQgY2hpbGRfZms7XG4gICAgICBsZXQgY2hpbGRGaWVsZDtcbiAgICAgIGxldCBhdXRvRmlsbCA9IGZhbHNlO1xuICAgICAgbGV0IHNldDtcbiAgICAgIGNvbnN0IHJlbGF0aW9ucyA9IHRoaXMuX2dldFJlbGF0aW9uTGlzdCggbmFtZSApO1xuICAgICAgcmVsYXRpb25zLnNvbWUoICggcmVsYXRpb24gKSA9PiB7XG4gICAgICAgIGlmKCByZWxhdGlvbi5hdXRvRmlsbCApe1xuICAgICAgICAgIGF1dG9GaWxsID0gdHJ1ZTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSApO1xuXG5cbiAgICAgIGlmKCBuYW1lICYmIG5hbWUgaW4gdGhpcy5hc3NldC5maWVsZHMgKXtcbiAgICAgICAgY2hpbGRfZmsgPSB0aGlzLmFzc2V0LmZpZWxkc1sgbmFtZSBdLm9wdGlvbnMuY2hpbGQ7XG4gICAgICAgIGlmKCBjaGlsZF9mayAmJiBjaGlsZF9mayBpbiB0aGlzLmFzc2V0LmZpZWxkcyApe1xuICAgICAgICAgIGNoaWxkRmllbGQgPSB0aGlzLmFzc2V0LmZpZWxkc1sgY2hpbGRfZmsgXTtcbiAgICAgICAgICBpZiggSXNBcnJheSggY2hpbGRGaWVsZC5vcHRpb25zLnJhd1ZhbHVlcyApICl7XG5cbiAgICAgICAgICAgIHZhbHVlcyA9IENvbnZlcnRBcnJheVRvT3B0aW9uTGlzdCggY2hpbGRGaWVsZC5vcHRpb25zLnJhd1ZhbHVlcywge1xuICAgICAgICAgICAgICAvLyBlbnN1cmUgdGhhdCBhbiBvcHRpb24gc2hvd3MgdXAgaW4gbGlzdCBpbiBjYXNlIG90aGVyIGNvbmRpdGlvbnMgcmVtb3ZlIGl0LCBha2EgaXQgaGFzIGJlZW4gYXJjaGl2ZWRcbiAgICAgICAgICAgICAgcHJldmVudDogW10sIC8vIGEgbGlzdCBvZiBpZHMgdGhhdCBzaG91bGQgbm90IGFwcGVhciBpbiB0aGUgbGlzdCBmb3Igd2hhdGV2ZXIgcmVhc29uXG4gICAgICAgICAgICAgIC8vIHBhcmVudCBtZWFucyB0aGlzIG9wdGlvbnMgc2hvdWxkIGFsbCBoYXZlIGEgY29tbW9uIGZpZWxkIHRyYWl0IGxpa2UgY2xpZW50X2ZrLCBhY2NvdW50X2ZrIC4uLi5cbiAgICAgICAgICAgICAgcGFyZW50OiBjaGlsZEZpZWxkLm9wdGlvbnMucGFyZW50ID8ge1xuICAgICAgICAgICAgICAgIGZpZWxkOiBjaGlsZEZpZWxkLm9wdGlvbnMucGFyZW50LFxuICAgICAgICAgICAgICAgIHZhbHVlOiB0aGlzLmNvcmUuZW50aXR5WyBjaGlsZEZpZWxkLm9wdGlvbnMucGFyZW50IF1cbiAgICAgICAgICAgICAgfSA6IG51bGwsXG4gICAgICAgICAgICAgIGVtcHR5OiBjaGlsZEZpZWxkLm9wdGlvbnMuZW1wdHkgPyBjaGlsZEZpZWxkLm9wdGlvbnMuZW1wdHkgOiBudWxsLFxuICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICBpZiggYXV0b0ZpbGwgJiYgdmFsdWVzLmxlbmd0aCApe1xuICAgICAgICAgICAgICBzZXQgPSB2YWx1ZXNbIHZhbHVlcy5sZW5ndGggLSAxIF0udmFsdWU7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgc2V0ID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNoaWxkRmllbGQub3B0aW9ucy52YWx1ZXMgPSB2YWx1ZXM7XG4gICAgICAgICAgICBhdXRvRmlsbCA9IGF1dG9GaWxsICYmIHZhbHVlcy5sZW5ndGggPyB2YWx1ZXNbIDAgXS52YWx1ZSA6IG51bGw7XG5cbiAgICAgICAgICAgIHRoaXMuZG9tLnNldFRpbWVvdXQoIGBjbGVhci1tZXNzYWdlLSR7Y2hpbGRfZmt9YCwgKCkgPT4ge1xuICAgICAgICAgICAgICBpZiggdHlwZW9mIGNoaWxkRmllbGQudHJpZ2dlck9uQ2hhbmdlID09PSAnZnVuY3Rpb24nICkgY2hpbGRGaWVsZC50cmlnZ2VyT25DaGFuZ2UoIHNldCApO1xuICAgICAgICAgICAgICBpZiggdHlwZW9mIGNoaWxkRmllbGQuY2xlYXJNZXNzYWdlID09PSAnZnVuY3Rpb24nICl7XG4gICAgICAgICAgICAgICAgY2hpbGRGaWVsZC5jbGVhck1lc3NhZ2UoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgMCApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIEdldCBhIGxpbmVhciBsaXN0IG9mIHRoZSBwYXJlbnQgY2hpbGQgcmVsYXRpb25zIGZyb20gYSBnaXZlbiBwb2ludFxuICAgKiBAcGFyYW0gc2VsZiB0aGUgbmFtZSB0byBzdGFydCBmcm9tICh1c3VhbGx5IHRoZSBmaWVsZCB0aGF0IGhhcyBqdXN0IGJlZW4gY2hhbmdlZCBieSB1c2VyKVxuICAgKiBAcGFyYW0gbGlzdFxuICAgKi9cbiAgcHJpdmF0ZSBfZ2V0UmVsYXRpb25MaXN0KCBuYW1lOiBzdHJpbmcsIGxpc3Q6IGFueVtdID0gW10gKXsgLy8gcmVjdXJzaXZlIGxvb3BcbiAgICBsZXQgaXRlbTtcbiAgICBpZiggbmFtZSAmJiBuYW1lIGluIHRoaXMuYXNzZXQuZmllbGRzICl7XG4gICAgICBpdGVtID0gdGhpcy5hc3NldC5maWVsZHNbIG5hbWUgXTtcbiAgICAgIGlmKCBJc09iamVjdCggaXRlbSwgdHJ1ZSApICl7XG4gICAgICAgIGxpc3QucHVzaCgge1xuICAgICAgICAgIG5hbWU6IGl0ZW0ubmFtZSxcbiAgICAgICAgICBhdXRvRmlsbDogdGhpcy5fZmllbGRIYXNBdXRvRmlsbCggbmFtZSApLFxuICAgICAgICB9ICk7XG4gICAgICAgIGlmKCB0aGlzLl9maWVsZEhhc0NoaWxkKCBuYW1lICkgKXtcbiAgICAgICAgICB0aGlzLl9nZXRSZWxhdGlvbkxpc3QoIGl0ZW0ub3B0aW9ucy5jaGlsZCwgbGlzdCApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICB9XG4gICAgcmV0dXJuIGxpc3Q7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmUgaWYgZmllbGQgaGFzIGEgY2hpbGQgcmVsYXRpb24gaW4gdGhlIGxpc3RcbiAgICogQHBhcmFtIG5hbWVcbiAgICovXG4gIHByaXZhdGUgX2ZpZWxkSGFzQ2hpbGQoIG5hbWU6IHN0cmluZyApe1xuICAgIGlmKCBuYW1lIGluIHRoaXMuYXNzZXQuZmllbGRzICYmIHRoaXMuYXNzZXQuZmllbGRzWyBuYW1lIF0ub3B0aW9ucyApe1xuICAgICAgaWYoIHRoaXMuYXNzZXQuZmllbGRzWyBuYW1lIF0ub3B0aW9ucy5jaGlsZCApe1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmUgaWYgZmllbGQgc2hvdWxkIGJlIGF1dG8gZmlsbGVkIHdpdGggdGhlIGZpcnN0IGl0ZW0gaW4gdGhlIGxpc3RcbiAgICogQHBhcmFtIG5hbWVcbiAgICovXG4gIHByaXZhdGUgX2ZpZWxkSGFzQXV0b0ZpbGwoIG5hbWU6IHN0cmluZyApe1xuICAgIGlmKCBuYW1lIGluIHRoaXMuYXNzZXQuZmllbGRzICYmIHRoaXMuYXNzZXQuZmllbGRzWyBuYW1lIF0gKXtcbiAgICAgIGlmKCB0aGlzLmFzc2V0LmZpZWxkc1sgbmFtZSBdLmF1dG9GaWxsICl7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxufVxuIl19