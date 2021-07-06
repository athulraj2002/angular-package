import { __awaiter } from "tslib";
import { Component, ElementRef, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { PopExtendDynamicComponent } from "../../../../pop-extend-dynamic.component";
import { MatDialog } from "@angular/material/dialog";
import { PopSchemeComponent, SchemeComponentConfig, ServiceInjector } from "../../../../pop-common.model";
import { PopEntityActionService } from "../../services/pop-entity-action.service";
import { PopTabMenuService } from "../../../base/pop-tab-menu/pop-tab-menu.service";
import { PopDomService } from "../../../../services/pop-dom.service";
import { IsObject, IsString, JsonCopy, PopUid, StorageGetter } from "../../../../pop-common-utility";
export class PopEntitySchemeCustomComponent extends PopExtendDynamicComponent {
    constructor(el, _domRepo, _tabRepo) {
        super();
        this.el = el;
        this._domRepo = _domRepo;
        this._tabRepo = _tabRepo;
        this.name = 'PopEntitySchemeCustomComponent';
        this.srv = {
            dialog: ServiceInjector.get(MatDialog),
            action: ServiceInjector.get(PopEntityActionService),
            tab: undefined,
        };
        this.asset = {
            dialogRef: undefined
        };
        this.dom.configure = () => {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                this.template.attach('container');
                yield this._setInitialConfig();
                yield this._setInitialState();
                return resolve(true);
            }));
        };
        this.dom.proceed = () => {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                if (IsObject(this.config, true)) {
                    yield this._setInitialProceed();
                    yield this._renderComponent();
                }
                return resolve(true);
            }));
        };
    }
    /**
     * INit
     */
    ngOnInit() {
        super.ngOnInit();
    }
    /**
     * This fx will present a pop up for the user to configure the options of this widget
     */
    onEditComponentOptions() {
        // TODO implement like edit popup
        this.dom.setTimeout(`edit-item`, () => __awaiter(this, void 0, void 0, function* () {
            if (StorageGetter(this.config, ['option', 'component', 'type'], null)) {
                const actionConfig = {
                    name: 'widgets',
                    header: 'Edit Widget',
                    component: {
                        type: this.config.option.component.type,
                        inputs: {
                            config: JsonCopy(this.config)
                        }
                    },
                    // onEvent: (core: CoreConfig, event: PopBaseEventInterface): Promise<boolean> => {
                    //   return new Promise(async(resolve) => {
                    //     return resolve(true);
                    //   });
                    // },
                    submitText: 'SAVE',
                    facade: true,
                    postUrl: null,
                    blockEntity: true,
                    responseType: 'store', // track all the key-value pairs that are updated
                };
                const result = yield this.srv.action.do(this.core, actionConfig);
                console.log('result', result);
                if (IsObject(result, true)) {
                    this.dom.setTimeout(`reset-component`, () => __awaiter(this, void 0, void 0, function* () {
                        yield this._renderComponent();
                        this.log.info(`options-reset:complete`);
                    }), 0);
                }
            }
            else {
                // ToDo:: handle this case
            }
        }));
    }
    /**
     * This user can click on a refresh icon to refresh the widget
     */
    onRefreshComponent() {
        this.dom.state.loaded = false;
        this.dom.state.loader = true;
        this.template.clear();
        this.dom.setTimeout(`refresh-component`, () => __awaiter(this, void 0, void 0, function* () {
            yield this._renderComponent();
        }), 500);
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
     * Clean up the dom of this component
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
        return new Promise((resolve) => {
            this.id = IsObject(this.config, ['id']) ? this.config.id : PopUid();
            if (!IsString(this.internal_name))
                this.internal_name = 'profile_specialist_1';
            if (!IsObject(this.config, true)) {
                const params = PopSchemeComponent.getParams(this.internal_name);
                this.config = new SchemeComponentConfig({
                    name: params.name ? params.name : 'Custom Component',
                    internal_name: this.internal_name,
                    component_id: this.componentId,
                    component: PopSchemeComponent.getComponent(this.internal_name),
                    option: PopSchemeComponent.getOption(this.internal_name),
                    setting: PopSchemeComponent.getOption(this.internal_name),
                    resource: PopSchemeComponent.getResource(this.internal_name),
                    param: PopSchemeComponent.getResource(this.internal_name),
                });
            }
            return resolve(true);
        });
    }
    /**
     * Set the initial config
     * Intended to be overridden per field
     */
    _setInitialState() {
        return new Promise((resolve) => {
            const isOptionComponent = StorageGetter(this.config, ['option', 'component']);
            this.dom.state.hasOptions = this.config.setting.edit && isOptionComponent && isOptionComponent.type ? true : false;
            this.dom.state.hasRefresh = this.config.setting.refresh;
            this.dom.state.isEditable = this.config.setting.edit ? true : false;
            // const userPreferences = StorageGetter( this.core, ['preference', this.config.id], {} );
            // if( IsObject( userPreferences, true ) ){
            //   this.config.option = { ...this.config.option, ...userPreferences.option };
            // }
            return resolve(true);
        });
    }
    /**
     * Set the initial config
     * Intended to be overridden per field
     */
    _setInitialProceed() {
        return new Promise((resolve) => {
            return resolve(true);
        });
    }
    /**
     * This fx will render the custom component for this widget
     * @private
     */
    _renderComponent() {
        return new Promise((resolve) => {
            this.dom.setTimeout(`render-widget`, () => {
                if (IsObject(this.config.component, ['type'])) {
                    this.template.render([this.config.component], ['core', 'position', 'config']);
                }
                this.dom.ready();
            }, 0);
            return resolve(true);
        });
    }
}
PopEntitySchemeCustomComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-entity-scheme-custom-component',
                template: "<div class=\"entity-custom-component-container import-flex-column\">\n  <div class=\"entity-custom-component-header mat-body\" style=\"flex-grow:0\">\n    <div class=\"entity-custom-component-title\">{{config?.name}}</div>\n    <div class=\"entity-custom-component-spacer\"></div>\n    <div class=\"entity-custom-component-refresh\" *ngIf=\"dom.state.hasRefresh\">\n      <mat-icon class=\"sw-pointer\" (mousedown)=\"onRefreshComponent()\">refresh</mat-icon>\n    </div>\n    <div class=\"entity-custom-component-edit\" *ngIf=\"dom.state.hasOptions\">\n      <mat-icon class=\"sw-pointer\" (mousedown)=\"onEditComponentOptions()\">settings</mat-icon>\n    </div>\n\n  </div>\n  <div class=\"entity-custom-component-loader\" *ngIf=\"dom.state.loader\">\n    <lib-main-spinner></lib-main-spinner>\n  </div>\n  <div class=\"entity-custom-component-content\">\n    <ng-template #container></ng-template>\n  </div>\n</div>\n",
                styles: [".entity-custom-component-container{position:relative;flex:1;min-height:300px;margin-top:var(--gap-m);margin-bottom:var(--gap-m);padding:var(--gap-xs);border:1px solid var(--border)}.entity-custom-component-header{display:flex;flex-grow:1;min-height:50px;align-items:center;justify-content:space-between;box-sizing:border-box;clear:both;background:var(--background-main-menu);color:var(--foreground-base);padding:0 var(--gap-sm)}.entity-custom-component-title{font-weight:700}.entity-custom-component-delete mat-icon,.entity-custom-component-edit mat-icon,.entity-custom-component-refresh mat-icon{font-size:20px;color:var(--foreground-disabled);position:relative;top:-2px;cursor:pointer}.entity-custom-component-spacer{flex-grow:1}.entity-custom-component-content{flex:1;overflow-x:hidden;overflow-y:auto;padding:var(--gap-sm)}.entity-custom-component-loader{height:150px}"]
            },] }
];
PopEntitySchemeCustomComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: PopDomService },
    { type: PopTabMenuService }
];
PopEntitySchemeCustomComponent.propDecorators = {
    container: [{ type: ViewChild, args: ['container', { read: ViewContainerRef, static: true },] }],
    componentId: [{ type: Input }],
    config: [{ type: Input }],
    section: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS1zY2hlbWUtY3VzdG9tLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2VudGl0eS9wb3AtZW50aXR5LXNjaGVtZS9wb3AtZW50aXR5LXNjaGVtZS1jdXN0b20tY29tcG9uZW50L3BvcC1lbnRpdHktc2NoZW1lLWN1c3RvbS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBcUIsU0FBUyxFQUFFLGdCQUFnQixFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRTNHLE9BQU8sRUFBQyx5QkFBeUIsRUFBQyxNQUFNLDBDQUEwQyxDQUFDO0FBQ25GLE9BQU8sRUFBQyxTQUFTLEVBQWUsTUFBTSwwQkFBMEIsQ0FBQztBQUNqRSxPQUFPLEVBSUwsa0JBQWtCLEVBQ2xCLHFCQUFxQixFQUVyQixlQUFlLEVBQ2hCLE1BQU0sOEJBQThCLENBQUM7QUFDdEMsT0FBTyxFQUFDLHNCQUFzQixFQUFDLE1BQU0sMENBQTBDLENBQUM7QUFDaEYsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0saURBQWlELENBQUM7QUFDbEYsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLHNDQUFzQyxDQUFDO0FBQ25FLE9BQU8sRUFBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFDLE1BQU0sZ0NBQWdDLENBQUM7QUFPbkcsTUFBTSxPQUFPLDhCQUErQixTQUFRLHlCQUF5QjtJQW1CM0UsWUFDUyxFQUFjLEVBQ1gsUUFBdUIsRUFDdkIsUUFBMkI7UUFFckMsS0FBSyxFQUFFLENBQUM7UUFKRCxPQUFFLEdBQUYsRUFBRSxDQUFZO1FBQ1gsYUFBUSxHQUFSLFFBQVEsQ0FBZTtRQUN2QixhQUFRLEdBQVIsUUFBUSxDQUFt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LENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUdEOzs7T0FHRztJQUNLLGdCQUFnQjtRQUN0QixPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDN0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsZUFBZSxFQUFFLEdBQUcsRUFBRTtnQkFDeEMsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFO29CQUM3QyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7aUJBQy9FO2dCQUNELElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDbkIsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ04sT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdkIsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDOzs7WUE1TkYsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSxvQ0FBb0M7Z0JBQzlDLG02QkFBd0Q7O2FBRXpEOzs7WUF0QmtCLFVBQVU7WUFlckIsYUFBYTtZQURiLGlCQUFpQjs7O3dCQVV0QixTQUFTLFNBQUMsV0FBVyxFQUFFLEVBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUM7MEJBQzdELEtBQUs7cUJBQ0wsS0FBSztzQkFDTCxLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDb21wb25lbnQsIEVsZW1lbnRSZWYsIElucHV0LCBPbkRlc3Ryb3ksIE9uSW5pdCwgVmlld0NoaWxkLCBWaWV3Q29udGFpbmVyUmVmfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7RW50aXR5U2NoZW1lU2VjdGlvbkludGVyZmFjZX0gZnJvbSAnLi4vcG9wLWVudGl0eS1zY2hlbWUubW9kZWwnO1xuaW1wb3J0IHtQb3BFeHRlbmREeW5hbWljQ29tcG9uZW50fSBmcm9tIFwiLi4vLi4vLi4vLi4vcG9wLWV4dGVuZC1keW5hbWljLmNvbXBvbmVudFwiO1xuaW1wb3J0IHtNYXREaWFsb2csIE1hdERpYWxvZ1JlZn0gZnJvbSBcIkBhbmd1bGFyL21hdGVyaWFsL2RpYWxvZ1wiO1xuaW1wb3J0IHtcbiAgRGljdGlvbmFyeSxcbiAgRHluYW1pY0NvbXBvbmVudEludGVyZmFjZSxcbiAgRW50aXR5QWN0aW9uSW50ZXJmYWNlLCBQb3BCYXNlRXZlbnRJbnRlcmZhY2UsXG4gIFBvcFNjaGVtZUNvbXBvbmVudCxcbiAgU2NoZW1lQ29tcG9uZW50Q29uZmlnLFxuICBTY2hlbWVDb21wb25lbnRDb25maWdJbnRlcmZhY2UsXG4gIFNlcnZpY2VJbmplY3RvclxufSBmcm9tIFwiLi4vLi4vLi4vLi4vcG9wLWNvbW1vbi5tb2RlbFwiO1xuaW1wb3J0IHtQb3BFbnRpdHlBY3Rpb25TZXJ2aWNlfSBmcm9tIFwiLi4vLi4vc2VydmljZXMvcG9wLWVudGl0eS1hY3Rpb24uc2VydmljZVwiO1xuaW1wb3J0IHtQb3BUYWJNZW51U2VydmljZX0gZnJvbSBcIi4uLy4uLy4uL2Jhc2UvcG9wLXRhYi1tZW51L3BvcC10YWItbWVudS5zZXJ2aWNlXCI7XG5pbXBvcnQge1BvcERvbVNlcnZpY2V9IGZyb20gXCIuLi8uLi8uLi8uLi9zZXJ2aWNlcy9wb3AtZG9tLnNlcnZpY2VcIjtcbmltcG9ydCB7SXNPYmplY3QsIElzU3RyaW5nLCBKc29uQ29weSwgUG9wVWlkLCBTdG9yYWdlR2V0dGVyfSBmcm9tIFwiLi4vLi4vLi4vLi4vcG9wLWNvbW1vbi11dGlsaXR5XCI7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2xpYi1lbnRpdHktc2NoZW1lLWN1c3RvbS1jb21wb25lbnQnLFxuICB0ZW1wbGF0ZVVybDogJy4vcG9wLWVudGl0eS1zY2hlbWUtY3VzdG9tLmNvbXBvbmVudC5odG1sJyxcbiAgc3R5bGVVcmxzOiBbJy4vcG9wLWVudGl0eS1zY2hlbWUtY3VzdG9tLmNvbXBvbmVudC5zY3NzJ11cbn0pXG5leHBvcnQgY2xhc3MgUG9wRW50aXR5U2NoZW1lQ3VzdG9tQ29tcG9uZW50IGV4dGVuZHMgUG9wRXh0ZW5kRHluYW1pY0NvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcbiAgQFZpZXdDaGlsZCgnY29udGFpbmVyJywge3JlYWQ6IFZpZXdDb250YWluZXJSZWYsIHN0YXRpYzogdHJ1ZX0pIHByaXZhdGUgY29udGFpbmVyO1xuICBASW5wdXQoKSBjb21wb25lbnRJZDogbnVtYmVyO1xuICBASW5wdXQoKSBjb25maWc6IFNjaGVtZUNvbXBvbmVudENvbmZpZztcbiAgQElucHV0KCkgc2VjdGlvbjogRW50aXR5U2NoZW1lU2VjdGlvbkludGVyZmFjZTtcblxuICBwdWJsaWMgbmFtZSA9ICdQb3BFbnRpdHlTY2hlbWVDdXN0b21Db21wb25lbnQnO1xuXG4gIHByb3RlY3RlZCBzcnYgPSB7XG4gICAgZGlhbG9nOiA8TWF0RGlhbG9nPlNlcnZpY2VJbmplY3Rvci5nZXQoTWF0RGlhbG9nKSxcbiAgICBhY3Rpb246IDxQb3BFbnRpdHlBY3Rpb25TZXJ2aWNlPlNlcnZpY2VJbmplY3Rvci5nZXQoUG9wRW50aXR5QWN0aW9uU2VydmljZSksXG4gICAgdGFiOiA8UG9wVGFiTWVudVNlcnZpY2U+dW5kZWZpbmVkLFxuICB9O1xuXG4gIHByb3RlY3RlZCBhc3NldCA9IHtcbiAgICBkaWFsb2dSZWY6IDxNYXREaWFsb2dSZWY8YW55Pj51bmRlZmluZWRcbiAgfTtcblxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBlbDogRWxlbWVudFJlZixcbiAgICBwcm90ZWN0ZWQgX2RvbVJlcG86IFBvcERvbVNlcnZpY2UsXG4gICAgcHJvdGVjdGVkIF90YWJSZXBvOiBQb3BUYWJNZW51U2VydmljZVxuICApIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5kb20uY29uZmlndXJlID0gKCk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jIChyZXNvbHZlKSA9PiB7XG4gICAgICAgIHRoaXMudGVtcGxhdGUuYXR0YWNoKCdjb250YWluZXInKTtcblxuICAgICAgICBhd2FpdCB0aGlzLl9zZXRJbml0aWFsQ29uZmlnKCk7XG4gICAgICAgIGF3YWl0IHRoaXMuX3NldEluaXRpYWxTdGF0ZSgpO1xuXG4gICAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIHRoaXMuZG9tLnByb2NlZWQgPSAoKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgKHJlc29sdmUpID0+IHtcblxuICAgICAgICBpZiAoSXNPYmplY3QodGhpcy5jb25maWcsIHRydWUpKSB7XG4gICAgICAgICAgYXdhaXQgdGhpcy5fc2V0SW5pdGlhbFByb2NlZWQoKTtcbiAgICAgICAgICBhd2FpdCB0aGlzLl9yZW5kZXJDb21wb25lbnQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJTml0XG4gICAqL1xuICBuZ09uSW5pdCgpIHtcbiAgICBzdXBlci5uZ09uSW5pdCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgZnggd2lsbCBwcmVzZW50IGEgcG9wIHVwIGZvciB0aGUgdXNlciB0byBjb25maWd1cmUgdGhlIG9wdGlvbnMgb2YgdGhpcyB3aWRnZXRcbiAgICovXG4gIG9uRWRpdENvbXBvbmVudE9wdGlvbnMoKSB7XG5cbiAgICAvLyBUT0RPIGltcGxlbWVudCBsaWtlIGVkaXQgcG9wdXBcbiAgICB0aGlzLmRvbS5zZXRUaW1lb3V0KGBlZGl0LWl0ZW1gLCBhc3luYyAoKSA9PiB7XG4gICAgICBpZiAoU3RvcmFnZUdldHRlcih0aGlzLmNvbmZpZywgWydvcHRpb24nLCAnY29tcG9uZW50JywgJ3R5cGUnXSwgbnVsbCkpIHtcblxuICAgICAgICBjb25zdCBhY3Rpb25Db25maWc6IEVudGl0eUFjdGlvbkludGVyZmFjZSA9IHtcbiAgICAgICAgICBuYW1lOiAnd2lkZ2V0cycsXG4gICAgICAgICAgaGVhZGVyOiAnRWRpdCBXaWRnZXQnLFxuICAgICAgICAgIGNvbXBvbmVudDogPER5bmFtaWNDb21wb25lbnRJbnRlcmZhY2U+e1xuICAgICAgICAgICAgdHlwZTogdGhpcy5jb25maWcub3B0aW9uLmNvbXBvbmVudC50eXBlLFxuICAgICAgICAgICAgaW5wdXRzOiB7XG4gICAgICAgICAgICAgIGNvbmZpZzogSnNvbkNvcHkodGhpcy5jb25maWcpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICAvLyBvbkV2ZW50OiAoY29yZTogQ29yZUNvbmZpZywgZXZlbnQ6IFBvcEJhc2VFdmVudEludGVyZmFjZSk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgICAgICAgIC8vICAgcmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jKHJlc29sdmUpID0+IHtcbiAgICAgICAgICAvLyAgICAgcmV0dXJuIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgLy8gICB9KTtcbiAgICAgICAgICAvLyB9LFxuICAgICAgICAgIHN1Ym1pdFRleHQ6ICdTQVZFJyxcbiAgICAgICAgICBmYWNhZGU6IHRydWUsXG4gICAgICAgICAgcG9zdFVybDogbnVsbCxcbiAgICAgICAgICBibG9ja0VudGl0eTogdHJ1ZSwgLy8gaW1wbGllcyB0aGF0IGZpZWxkcyBzaG91bGQgbm90IGJlIGluaGVyaXRlZCBmcm9tIHRoZSBvcmlnaW5hbCBmaWVsZC50cyBmaWxlXG4gICAgICAgICAgcmVzcG9uc2VUeXBlOiAnc3RvcmUnLCAvLyB0cmFjayBhbGwgdGhlIGtleS12YWx1ZSBwYWlycyB0aGF0IGFyZSB1cGRhdGVkXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuc3J2LmFjdGlvbi5kbyh0aGlzLmNvcmUsIGFjdGlvbkNvbmZpZyk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdyZXN1bHQnLCByZXN1bHQpO1xuICAgICAgICBpZiAoSXNPYmplY3QocmVzdWx0LCB0cnVlKSkge1xuICAgICAgICAgIHRoaXMuZG9tLnNldFRpbWVvdXQoYHJlc2V0LWNvbXBvbmVudGAsIGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuX3JlbmRlckNvbXBvbmVudCgpO1xuICAgICAgICAgICAgdGhpcy5sb2cuaW5mbyhgb3B0aW9ucy1yZXNldDpjb21wbGV0ZWApO1xuICAgICAgICAgIH0sIDApO1xuXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFRvRG86OiBoYW5kbGUgdGhpcyBjYXNlXG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyB1c2VyIGNhbiBjbGljayBvbiBhIHJlZnJlc2ggaWNvbiB0byByZWZyZXNoIHRoZSB3aWRnZXRcbiAgICovXG4gIG9uUmVmcmVzaENvbXBvbmVudCgpIHtcbiAgICB0aGlzLmRvbS5zdGF0ZS5sb2FkZWQgPSBmYWxzZTtcbiAgICB0aGlzLmRvbS5zdGF0ZS5sb2FkZXIgPSB0cnVlO1xuICAgIHRoaXMudGVtcGxhdGUuY2xlYXIoKTtcbiAgICB0aGlzLmRvbS5zZXRUaW1lb3V0KGByZWZyZXNoLWNvbXBvbmVudGAsIGFzeW5jICgpID0+IHtcbiAgICAgIGF3YWl0IHRoaXMuX3JlbmRlckNvbXBvbmVudCgpO1xuICAgIH0sIDUwMCk7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlIHRoZSBidWJibGUgZXZlbnRzIHRoYXQgY29tZSB1cFxuICAgKiBAcGFyYW0gZXZlbnRcbiAgICovXG4gIG9uQnViYmxlRXZlbnQobmFtZTogc3RyaW5nLCBleHRlbnNpb24/OiBEaWN0aW9uYXJ5PGFueT4sIGV2ZW50PzogUG9wQmFzZUV2ZW50SW50ZXJmYWNlKTogYm9vbGVhbiB7XG4gICAgaWYgKCFldmVudCkgZXZlbnQgPSB7c291cmNlOiB0aGlzLm5hbWUsIHR5cGU6ICdmaWVsZCcsIG5hbWU6IG5hbWV9O1xuICAgIGlmIChleHRlbnNpb24pIGV2ZW50ID0gey4uLmV2ZW50LCAuLi5leHRlbnNpb259O1xuICAgIHRoaXMubG9nLmV2ZW50KGBidWJibGVFdmVudGAsIGV2ZW50KTtcbiAgICB0aGlzLmV2ZW50cy5lbWl0KGV2ZW50KTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhbiB1cCB0aGUgZG9tIG9mIHRoaXMgY29tcG9uZW50XG4gICAqL1xuICBuZ09uRGVzdHJveSgpIHtcbiAgICBzdXBlci5uZ09uRGVzdHJveSgpO1xuICB9XG5cbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBCYXNlIFByb3RlY3RlZCBNZXRob2RzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIFByb3RlY3RlZCBNZXRob2QgKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiAgLyoqXG4gICAqIFNldCB0aGUgaW5pdGlhbCBjb25maWdcbiAgICogSW50ZW5kZWQgdG8gYmUgb3ZlcnJpZGRlbiBwZXIgZmllbGRcbiAgICovXG4gIHByb3RlY3RlZCBfc2V0SW5pdGlhbENvbmZpZygpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgIHRoaXMuaWQgPSBJc09iamVjdCh0aGlzLmNvbmZpZywgWydpZCddKSA/IHRoaXMuY29uZmlnLmlkIDogUG9wVWlkKCk7XG4gICAgICBpZiAoIUlzU3RyaW5nKHRoaXMuaW50ZXJuYWxfbmFtZSkpIHRoaXMuaW50ZXJuYWxfbmFtZSA9ICdwcm9maWxlX3NwZWNpYWxpc3RfMSc7XG4gICAgICBpZiAoIUlzT2JqZWN0KHRoaXMuY29uZmlnLCB0cnVlKSkge1xuICAgICAgICBjb25zdCBwYXJhbXMgPSBQb3BTY2hlbWVDb21wb25lbnQuZ2V0UGFyYW1zKHRoaXMuaW50ZXJuYWxfbmFtZSk7XG4gICAgICAgIHRoaXMuY29uZmlnID0gbmV3IFNjaGVtZUNvbXBvbmVudENvbmZpZyg8U2NoZW1lQ29tcG9uZW50Q29uZmlnSW50ZXJmYWNlPntcbiAgICAgICAgICBuYW1lOiBwYXJhbXMubmFtZSA/IHBhcmFtcy5uYW1lIDogJ0N1c3RvbSBDb21wb25lbnQnLFxuICAgICAgICAgIGludGVybmFsX25hbWU6IHRoaXMuaW50ZXJuYWxfbmFtZSxcbiAgICAgICAgICBjb21wb25lbnRfaWQ6IHRoaXMuY29tcG9uZW50SWQsXG4gICAgICAgICAgY29tcG9uZW50OiBQb3BTY2hlbWVDb21wb25lbnQuZ2V0Q29tcG9uZW50KHRoaXMuaW50ZXJuYWxfbmFtZSksXG4gICAgICAgICAgb3B0aW9uOiBQb3BTY2hlbWVDb21wb25lbnQuZ2V0T3B0aW9uKHRoaXMuaW50ZXJuYWxfbmFtZSksXG4gICAgICAgICAgc2V0dGluZzogUG9wU2NoZW1lQ29tcG9uZW50LmdldE9wdGlvbih0aGlzLmludGVybmFsX25hbWUpLFxuICAgICAgICAgIHJlc291cmNlOiBQb3BTY2hlbWVDb21wb25lbnQuZ2V0UmVzb3VyY2UodGhpcy5pbnRlcm5hbF9uYW1lKSxcbiAgICAgICAgICBwYXJhbTogUG9wU2NoZW1lQ29tcG9uZW50LmdldFJlc291cmNlKHRoaXMuaW50ZXJuYWxfbmFtZSksXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIGluaXRpYWwgY29uZmlnXG4gICAqIEludGVuZGVkIHRvIGJlIG92ZXJyaWRkZW4gcGVyIGZpZWxkXG4gICAqL1xuICBwcm90ZWN0ZWQgX3NldEluaXRpYWxTdGF0ZSgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcblxuICAgICAgY29uc3QgaXNPcHRpb25Db21wb25lbnQgPSBTdG9yYWdlR2V0dGVyKHRoaXMuY29uZmlnLCBbJ29wdGlvbicsICdjb21wb25lbnQnXSk7XG4gICAgICB0aGlzLmRvbS5zdGF0ZS5oYXNPcHRpb25zID0gdGhpcy5jb25maWcuc2V0dGluZy5lZGl0ICYmIGlzT3B0aW9uQ29tcG9uZW50ICYmIGlzT3B0aW9uQ29tcG9uZW50LnR5cGUgPyB0cnVlIDogZmFsc2U7XG4gICAgICB0aGlzLmRvbS5zdGF0ZS5oYXNSZWZyZXNoID0gdGhpcy5jb25maWcuc2V0dGluZy5yZWZyZXNoO1xuICAgICAgdGhpcy5kb20uc3RhdGUuaXNFZGl0YWJsZSA9IHRoaXMuY29uZmlnLnNldHRpbmcuZWRpdCA/IHRydWUgOiBmYWxzZTtcblxuXG4gICAgICAvLyBjb25zdCB1c2VyUHJlZmVyZW5jZXMgPSBTdG9yYWdlR2V0dGVyKCB0aGlzLmNvcmUsIFsncHJlZmVyZW5jZScsIHRoaXMuY29uZmlnLmlkXSwge30gKTtcbiAgICAgIC8vIGlmKCBJc09iamVjdCggdXNlclByZWZlcmVuY2VzLCB0cnVlICkgKXtcbiAgICAgIC8vICAgdGhpcy5jb25maWcub3B0aW9uID0geyAuLi50aGlzLmNvbmZpZy5vcHRpb24sIC4uLnVzZXJQcmVmZXJlbmNlcy5vcHRpb24gfTtcbiAgICAgIC8vIH1cblxuXG4gICAgICByZXR1cm4gcmVzb2x2ZSh0cnVlKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIGluaXRpYWwgY29uZmlnXG4gICAqIEludGVuZGVkIHRvIGJlIG92ZXJyaWRkZW4gcGVyIGZpZWxkXG4gICAqL1xuICBwcm90ZWN0ZWQgX3NldEluaXRpYWxQcm9jZWVkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuXG5cbiAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgIH0pO1xuICB9XG5cblxuICAvKipcbiAgICogVGhpcyBmeCB3aWxsIHJlbmRlciB0aGUgY3VzdG9tIGNvbXBvbmVudCBmb3IgdGhpcyB3aWRnZXRcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHByaXZhdGUgX3JlbmRlckNvbXBvbmVudCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgIHRoaXMuZG9tLnNldFRpbWVvdXQoYHJlbmRlci13aWRnZXRgLCAoKSA9PiB7XG4gICAgICAgIGlmIChJc09iamVjdCh0aGlzLmNvbmZpZy5jb21wb25lbnQsIFsndHlwZSddKSkge1xuICAgICAgICAgIHRoaXMudGVtcGxhdGUucmVuZGVyKFt0aGlzLmNvbmZpZy5jb21wb25lbnRdLCBbJ2NvcmUnLCAncG9zaXRpb24nLCAnY29uZmlnJ10pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZG9tLnJlYWR5KCk7XG4gICAgICB9LCAwKTtcbiAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgIH0pO1xuICB9XG5cblxufVxuIl19