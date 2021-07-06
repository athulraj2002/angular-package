import { Component, ElementRef, Input } from '@angular/core';
import { PopDomService } from '../../../../services/pop-dom.service';
import { PopExtendComponent } from '../../../../pop-extend.component';
import { PopFieldEditorService } from '../pop-entity-field-editor.service';
import { FieldItemModel, FieldItemModelConfig, IsValidFieldPatchEvent, SessionEntityFieldUpdate } from '../../pop-entity-utility';
import { IsObject, IsObjectThrowError, JsonCopy, StorageGetter } from '../../../../pop-common-utility';
import { SwitchConfig } from '../../../base/pop-field-item/pop-switch/switch-config.model';
export class PopEntityFieldDetailsComponent extends PopExtendComponent {
    constructor(el, _domRepo, fieldRepo) {
        super();
        this.el = el;
        this._domRepo = _domRepo;
        this.fieldRepo = fieldRepo;
        this.name = 'PopEntityFieldDetailsComponent';
        this.asset = {};
        this.ui = {
            field: undefined,
            customSetting: {},
            multiple: undefined,
        };
        this.extendServiceContainer();
        this.dom.configure = () => {
            return new Promise((resolve) => {
                this.core = IsObjectThrowError(this.core, true, `${this.name}:configureDom: - this.core`) ? this.core : null;
                if (!this.field)
                    this.field = IsObjectThrowError(this.core, ['entity'], `Invalid Core`) && IsObjectThrowError(this.core.entity, ['id', 'fieldgroup'], `Invalid Field`) ? this.core.entity : null;
                this._buildCustomSettings();
                return resolve(true);
            });
        };
        this.dom.proceed = () => {
            return new Promise((resolve) => {
                return resolve(true);
            });
        };
    }
    extendServiceContainer() {
        this.srv = {
            field: this.fieldRepo,
        };
        delete this.fieldRepo;
    }
    ngOnInit() {
        super.ngOnInit();
    }
    /**
     * Event handler for the parent tab to tell this name to reset itself
     * @param reset
     */
    onBubbleEvent(event) {
        this.log.event(`onBubbleEvent`, event);
        if (IsValidFieldPatchEvent(this.core, event)) {
            this.events.emit(event);
        }
    }
    // /**
    //  * Catch changes on custom setting fields and update them
    //  * @param event
    //  */
    // onCustomSettingEvent(event: PopBaseEventInterface){
    //   if( IsValidFieldPatchEvent(this.core, event) ){
    //     this.dom.setTimeout(event.config.name, () => {
    //       this.srv.field.storeCustomSetting(this.core, event).then(() => true);
    //     }, 250);
    //   }
    // }
    ngOnDestroy() {
        super.ngOnDestroy();
    }
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    _buildCustomSettings() {
        const allowMultiple = this.srv.field.getViewMultiple(this.field.fieldgroup.name);
        if (allowMultiple) {
            let multiple = StorageGetter(this.core.repo, ['model', 'field', 'multiple']);
            if (IsObject(multiple, ['model'])) {
                multiple = JsonCopy(multiple);
                this.ui.multiple = new SwitchConfig(FieldItemModelConfig(this.core, FieldItemModel(this.core, multiple.model)));
                this.ui.multiple.patch.callback = (core, event) => {
                    SessionEntityFieldUpdate(this.core, event);
                    this.srv.field.triggerFieldPreviewUpdate();
                };
            }
        }
        // if( IsObject(this.ui.field.custom_setting, true) ){
        //   Object.keys(this.ui.field.custom_setting).map((settingName) => {
        //     const setting = this.ui.field.custom_setting[ settingName ];
        //     const component = this.srv.field.getCustomSettingComponent(this.core, this.ui.field, setting);
        //     component.position = this.position;
        //     this.ui.customSetting[ setting.name ] = component;
        //   });
        // }
    }
}
PopEntityFieldDetailsComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-entity-field-details',
                template: "<div class=\"entity-field-details-container\" *ngIf=\"dom.state.loaded\">\n  <lib-pop-entity-status [core]=\"core\"></lib-pop-entity-status>\n  <lib-pop-entity-field-group [core]=\"core\" (events)=\"onBubbleEvent($event);\"></lib-pop-entity-field-group>\n  <lib-pop-switch *ngIf=\"ui.multiple\" [config]=\"ui.multiple\"></lib-pop-switch>\n  <lib-pop-switch *ngIf=\"!field.multiple && dom.repo.ui.customSetting.show_name\" [config]=\"dom.repo.ui.customSetting.show_name.inputs.config\"></lib-pop-switch>\n  <!--<lib-pop-switch *ngIf=\"!ui.field.multiple && ui.customSetting.show_name\" [config]=\"ui.customSetting.show_name.inputs.config\" (events)=\"onCustomSettingEvent($event)\"></lib-pop-switch>-->\n  <!--<lib-pop-min-max *ngIf=\"ui.field.multiple\" (events)=\"onMinMaxSetting($event);\" [config]=ui.customSetting.minMax></lib-pop-min-max>-->\n\n</div>\n",
                styles: [".import-flex-row,.import-flex-row-wrap{display:flex;flex-direction:row}.import-flex-row-wrap{flex-wrap:wrap;padding:0;flex-basis:100%;box-sizing:border-box}.import-flex-row-break{flex-basis:100%;height:0}.import-flex-column-break{flex-basis:100%;width:0}.import-flex-item-icon{min-width:var(--field-icon-width);height:var(--field-icon-height);display:flex;justify-content:center;align-items:center}.import-flex-column-xs{display:flex;flex-direction:column;width:12.5%;min-height:30px}.import-flex-column-sm{flex:1;flex-direction:column;width:25%;min-height:30px}.import-flex-column-md{flex:1;flex-direction:column;width:50%}.import-flex-column-lg{flex:1;flex-direction:column;width:75%;min-height:30px}.import-flex-item-xs{flex-basis:12.5%}.import-flex-item-sm{flex-basis:25%}.import-flex-item-md{flex-basis:50%}.import-flex-item-full{flex-basis:100%}.import-flex-grow-xs{flex-grow:1}.import-flex-grow-sm{flex-grow:2}.import-flex-grow-md{flex-grow:3}.import-flex-grow-lg{flex-grow:4}.import-flex-column{display:flex;flex-direction:column}.import-flex-center{display:flex;align-items:center;justify-content:center}.import-flex-space-center{justify-content:space-around;align-items:center}.import-flex-space-between-center{justify-content:space-between;align-items:center}.import-flex-center-start{display:flex;justify-content:center;align-items:flex-start}.import-flex-start-center{display:flex;justify-content:flex-start;align-items:center}.import-flex-end-center{display:flex;justify-content:flex-end;align-items:center}.import-flex-end{display:flex;align-items:flex-end;justify-content:flex-end}.import-flex-align-end{display:flex;align-self:flex-end}.import-flex-stretch-center{display:flex;justify-content:stretch;align-items:center}.entity-field-details-container{max-width:var(--field-max-width)}.entity-field-details-row{display:flex;flex-direction:row;height:35px;margin-top:1px}"]
            },] }
];
PopEntityFieldDetailsComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: PopDomService },
    { type: PopFieldEditorService }
];
PopEntityFieldDetailsComponent.propDecorators = {
    field: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS1maWVsZC1kZXRhaWxzLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2VudGl0eS9wb3AtZW50aXR5LWZpZWxkLWVkaXRvci9wb3AtZW50aXR5LWZpZWxkLWRldGFpbHMvcG9wLWVudGl0eS1maWVsZC1kZXRhaWxzLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQXFCLE1BQU0sZUFBZSxDQUFDO0FBQ2hGLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUNyRSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUN0RSxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUUzRSxPQUFPLEVBQUUsY0FBYyxFQUFFLG9CQUFvQixFQUFFLHNCQUFzQixFQUFFLHdCQUF3QixFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDbEksT0FBTyxFQUFFLFFBQVEsRUFBRSxrQkFBa0IsRUFBRSxRQUFRLEVBQUUsYUFBYSxFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDdkcsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDZEQUE2RCxDQUFDO0FBUTNGLE1BQU0sT0FBTyw4QkFBK0IsU0FBUSxrQkFBa0I7SUEyQnBFLFlBQ1MsRUFBYyxFQUNYLFFBQXVCLEVBQ3pCLFNBQWdDO1FBRXhDLEtBQUssRUFBRSxDQUFDO1FBSkQsT0FBRSxHQUFGLEVBQUUsQ0FBWTtRQUNYLGFBQVEsR0FBUixRQUFRLENBQWU7UUFDekIsY0FBUyxHQUFULFNBQVMsQ0FBdUI7UUEzQm5DLFNBQUksR0FBRyxnQ0FBZ0MsQ0FBQztRQU9yQyxVQUFLLEdBQUcsRUFBRSxDQUFDO1FBRWQsT0FBRSxHQUFH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QUU7Z0JBQ3JDLFFBQVEsR0FBRyxRQUFRLENBQUUsUUFBUSxDQUFFLENBQUM7Z0JBQ2hDLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxHQUFHLElBQUksWUFBWSxDQUFFLG9CQUFvQixDQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsY0FBYyxDQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLEtBQUssQ0FBRSxDQUFFLENBQUUsQ0FBQztnQkFDdEgsSUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxDQUFFLElBQWdCLEVBQUUsS0FBNEIsRUFBRyxFQUFFO29CQUNyRix3QkFBd0IsQ0FBRSxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBRSxDQUFDO29CQUM3QyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO2dCQUM3QyxDQUFDLENBQUM7YUFDSDtTQUNGO1FBRUQsc0RBQXNEO1FBQ3RELHFFQUFxRTtRQUNyRSxtRUFBbUU7UUFDbkUscUdBQXFHO1FBQ3JHLDBDQUEwQztRQUMxQyx5REFBeUQ7UUFDekQsUUFBUTtRQUNSLElBQUk7SUFDTixDQUFDOzs7WUE1SEYsU0FBUyxTQUFFO2dCQUNWLFFBQVEsRUFBRSw4QkFBOEI7Z0JBQ3hDLHMyQkFBd0Q7O2FBRXpEOzs7WUFkbUIsVUFBVTtZQUNyQixhQUFhO1lBRWIscUJBQXFCOzs7b0JBYTNCLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEVsZW1lbnRSZWYsIElucHV0LCBPbkRlc3Ryb3ksIE9uSW5pdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgUG9wRG9tU2VydmljZSB9IGZyb20gJy4uLy4uLy4uLy4uL3NlcnZpY2VzL3BvcC1kb20uc2VydmljZSc7XG5pbXBvcnQgeyBQb3BFeHRlbmRDb21wb25lbnQgfSBmcm9tICcuLi8uLi8uLi8uLi9wb3AtZXh0ZW5kLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBQb3BGaWVsZEVkaXRvclNlcnZpY2UgfSBmcm9tICcuLi9wb3AtZW50aXR5LWZpZWxkLWVkaXRvci5zZXJ2aWNlJztcbmltcG9ydCB7IENvcmVDb25maWcsIERpY3Rpb25hcnksIEZpZWxkSW50ZXJmYWNlLCBQb3BCYXNlRXZlbnRJbnRlcmZhY2UsIFNlcnZpY2VJbmplY3RvciB9IGZyb20gJy4uLy4uLy4uLy4uL3BvcC1jb21tb24ubW9kZWwnO1xuaW1wb3J0IHsgRmllbGRJdGVtTW9kZWwsIEZpZWxkSXRlbU1vZGVsQ29uZmlnLCBJc1ZhbGlkRmllbGRQYXRjaEV2ZW50LCBTZXNzaW9uRW50aXR5RmllbGRVcGRhdGUgfSBmcm9tICcuLi8uLi9wb3AtZW50aXR5LXV0aWxpdHknO1xuaW1wb3J0IHsgSXNPYmplY3QsIElzT2JqZWN0VGhyb3dFcnJvciwgSnNvbkNvcHksIFN0b3JhZ2VHZXR0ZXIgfSBmcm9tICcuLi8uLi8uLi8uLi9wb3AtY29tbW9uLXV0aWxpdHknO1xuaW1wb3J0IHsgU3dpdGNoQ29uZmlnIH0gZnJvbSAnLi4vLi4vLi4vYmFzZS9wb3AtZmllbGQtaXRlbS9wb3Atc3dpdGNoL3N3aXRjaC1jb25maWcubW9kZWwnO1xuXG5cbkBDb21wb25lbnQoIHtcbiAgc2VsZWN0b3I6ICdsaWItcG9wLWVudGl0eS1maWVsZC1kZXRhaWxzJyxcbiAgdGVtcGxhdGVVcmw6ICcuL3BvcC1lbnRpdHktZmllbGQtZGV0YWlscy5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWyAnLi9wb3AtZW50aXR5LWZpZWxkLWRldGFpbHMuY29tcG9uZW50LnNjc3MnIF1cbn0gKVxuZXhwb3J0IGNsYXNzIFBvcEVudGl0eUZpZWxkRGV0YWlsc0NvbXBvbmVudCBleHRlbmRzIFBvcEV4dGVuZENvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcbiAgQElucHV0KCkgZmllbGQ6IEZpZWxkSW50ZXJmYWNlO1xuXG4gIHB1YmxpYyBuYW1lID0gJ1BvcEVudGl0eUZpZWxkRGV0YWlsc0NvbXBvbmVudCc7XG5cblxuICBwcm90ZWN0ZWQgc3J2OiB7XG4gICAgZmllbGQ6IFBvcEZpZWxkRWRpdG9yU2VydmljZSxcbiAgfTtcblxuICBwcm90ZWN0ZWQgYXNzZXQgPSB7fTtcblxuICBwdWJsaWMgdWkgPSB7XG4gICAgZmllbGQ6IDxGaWVsZEludGVyZmFjZT51bmRlZmluZWQsXG4gICAgY3VzdG9tU2V0dGluZzogPERpY3Rpb25hcnk8YW55Pj57fSxcbiAgICBtdWx0aXBsZTogPFN3aXRjaENvbmZpZz51bmRlZmluZWQsXG4gIH07XG5cblxuICBwcm90ZWN0ZWQgZXh0ZW5kU2VydmljZUNvbnRhaW5lcigpe1xuICAgIHRoaXMuc3J2ID0ge1xuICAgICAgZmllbGQ6IHRoaXMuZmllbGRSZXBvLFxuICAgIH07XG4gICAgZGVsZXRlIHRoaXMuZmllbGRSZXBvO1xuICB9XG5cblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgZWw6IEVsZW1lbnRSZWYsXG4gICAgcHJvdGVjdGVkIF9kb21SZXBvOiBQb3BEb21TZXJ2aWNlLFxuICAgIHByaXZhdGUgZmllbGRSZXBvOiBQb3BGaWVsZEVkaXRvclNlcnZpY2UsXG4gICl7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuZXh0ZW5kU2VydmljZUNvbnRhaW5lcigpO1xuXG4gICAgdGhpcy5kb20uY29uZmlndXJlID0gKCk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCAoIHJlc29sdmUgKSA9PiB7XG4gICAgICAgIHRoaXMuY29yZSA9IElzT2JqZWN0VGhyb3dFcnJvciggdGhpcy5jb3JlLCB0cnVlLCBgJHt0aGlzLm5hbWV9OmNvbmZpZ3VyZURvbTogLSB0aGlzLmNvcmVgICkgPyB0aGlzLmNvcmUgOiBudWxsO1xuICAgICAgICBpZiggIXRoaXMuZmllbGQgKSB0aGlzLmZpZWxkID0gSXNPYmplY3RUaHJvd0Vycm9yKCB0aGlzLmNvcmUsIFsgJ2VudGl0eScgXSwgYEludmFsaWQgQ29yZWAgKSAmJiBJc09iamVjdFRocm93RXJyb3IoIHRoaXMuY29yZS5lbnRpdHksIFsgJ2lkJywgJ2ZpZWxkZ3JvdXAnIF0sIGBJbnZhbGlkIEZpZWxkYCApID8gPEZpZWxkSW50ZXJmYWNlPnRoaXMuY29yZS5lbnRpdHkgOiBudWxsO1xuICAgICAgICB0aGlzLl9idWlsZEN1c3RvbVNldHRpbmdzKCk7XG4gICAgICAgIHJldHVybiByZXNvbHZlKCB0cnVlICk7XG4gICAgICB9ICk7XG4gICAgfTtcblxuICAgIHRoaXMuZG9tLnByb2NlZWQgPSAoKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoICggcmVzb2x2ZSApID0+IHtcbiAgICAgICAgcmV0dXJuIHJlc29sdmUoIHRydWUgKTtcbiAgICAgIH0gKTtcbiAgICB9O1xuXG5cbiAgfVxuXG5cbiAgbmdPbkluaXQoKXtcbiAgICBzdXBlci5uZ09uSW5pdCgpO1xuICB9XG5cblxuICAvKipcbiAgICogRXZlbnQgaGFuZGxlciBmb3IgdGhlIHBhcmVudCB0YWIgdG8gdGVsbCB0aGlzIG5hbWUgdG8gcmVzZXQgaXRzZWxmXG4gICAqIEBwYXJhbSByZXNldFxuICAgKi9cbiAgb25CdWJibGVFdmVudCggZXZlbnQ6IFBvcEJhc2VFdmVudEludGVyZmFjZSApe1xuICAgIHRoaXMubG9nLmV2ZW50KCBgb25CdWJibGVFdmVudGAsIGV2ZW50ICk7XG4gICAgaWYoIElzVmFsaWRGaWVsZFBhdGNoRXZlbnQoIHRoaXMuY29yZSwgZXZlbnQgKSApe1xuICAgICAgdGhpcy5ldmVudHMuZW1pdCggZXZlbnQgKTtcbiAgICB9XG4gIH1cblxuXG4gIC8vIC8qKlxuICAvLyAgKiBDYXRjaCBjaGFuZ2VzIG9uIGN1c3RvbSBzZXR0aW5nIGZpZWxkcyBhbmQgdXBkYXRlIHRoZW1cbiAgLy8gICogQHBhcmFtIGV2ZW50XG4gIC8vICAqL1xuICAvLyBvbkN1c3RvbVNldHRpbmdFdmVudChldmVudDogUG9wQmFzZUV2ZW50SW50ZXJmYWNlKXtcbiAgLy8gICBpZiggSXNWYWxpZEZpZWxkUGF0Y2hFdmVudCh0aGlzLmNvcmUsIGV2ZW50KSApe1xuICAvLyAgICAgdGhpcy5kb20uc2V0VGltZW91dChldmVudC5jb25maWcubmFtZSwgKCkgPT4ge1xuICAvLyAgICAgICB0aGlzLnNydi5maWVsZC5zdG9yZUN1c3RvbVNldHRpbmcodGhpcy5jb3JlLCBldmVudCkudGhlbigoKSA9PiB0cnVlKTtcbiAgLy8gICAgIH0sIDI1MCk7XG4gIC8vICAgfVxuICAvLyB9XG5cblxuICBuZ09uRGVzdHJveSgpe1xuICAgIHN1cGVyLm5nT25EZXN0cm95KCk7XG4gIH1cblxuXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVW5kZXIgVGhlIEhvb2QgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBQcml2YXRlIE1ldGhvZCApICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4gIHByaXZhdGUgX2J1aWxkQ3VzdG9tU2V0dGluZ3MoKXtcbiAgICBjb25zdCBhbGxvd011bHRpcGxlID0gdGhpcy5zcnYuZmllbGQuZ2V0Vmlld011bHRpcGxlKCB0aGlzLmZpZWxkLmZpZWxkZ3JvdXAubmFtZSApO1xuICAgIGlmKCBhbGxvd011bHRpcGxlICl7XG4gICAgICBsZXQgbXVsdGlwbGUgPSBTdG9yYWdlR2V0dGVyKCB0aGlzLmNvcmUucmVwbywgWyAnbW9kZWwnLCAnZmllbGQnLCAnbXVsdGlwbGUnIF0gKTtcbiAgICAgIGlmKCBJc09iamVjdCggbXVsdGlwbGUsIFsgJ21vZGVsJyBdICkgKXtcbiAgICAgICAgbXVsdGlwbGUgPSBKc29uQ29weSggbXVsdGlwbGUgKTtcbiAgICAgICAgdGhpcy51aS5tdWx0aXBsZSA9IG5ldyBTd2l0Y2hDb25maWcoIEZpZWxkSXRlbU1vZGVsQ29uZmlnKCB0aGlzLmNvcmUsIEZpZWxkSXRlbU1vZGVsKCB0aGlzLmNvcmUsIG11bHRpcGxlLm1vZGVsICkgKSApO1xuICAgICAgICB0aGlzLnVpLm11bHRpcGxlLnBhdGNoLmNhbGxiYWNrID0gKCBjb3JlOiBDb3JlQ29uZmlnLCBldmVudDogUG9wQmFzZUV2ZW50SW50ZXJmYWNlICkgPT4ge1xuICAgICAgICAgIFNlc3Npb25FbnRpdHlGaWVsZFVwZGF0ZSggdGhpcy5jb3JlLCBldmVudCApO1xuICAgICAgICAgIHRoaXMuc3J2LmZpZWxkLnRyaWdnZXJGaWVsZFByZXZpZXdVcGRhdGUoKTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBpZiggSXNPYmplY3QodGhpcy51aS5maWVsZC5jdXN0b21fc2V0dGluZywgdHJ1ZSkgKXtcbiAgICAvLyAgIE9iamVjdC5rZXlzKHRoaXMudWkuZmllbGQuY3VzdG9tX3NldHRpbmcpLm1hcCgoc2V0dGluZ05hbWUpID0+IHtcbiAgICAvLyAgICAgY29uc3Qgc2V0dGluZyA9IHRoaXMudWkuZmllbGQuY3VzdG9tX3NldHRpbmdbIHNldHRpbmdOYW1lIF07XG4gICAgLy8gICAgIGNvbnN0IGNvbXBvbmVudCA9IHRoaXMuc3J2LmZpZWxkLmdldEN1c3RvbVNldHRpbmdDb21wb25lbnQodGhpcy5jb3JlLCB0aGlzLnVpLmZpZWxkLCBzZXR0aW5nKTtcbiAgICAvLyAgICAgY29tcG9uZW50LnBvc2l0aW9uID0gdGhpcy5wb3NpdGlvbjtcbiAgICAvLyAgICAgdGhpcy51aS5jdXN0b21TZXR0aW5nWyBzZXR0aW5nLm5hbWUgXSA9IGNvbXBvbmVudDtcbiAgICAvLyAgIH0pO1xuICAgIC8vIH1cbiAgfVxuXG5cbn1cbiJdfQ==