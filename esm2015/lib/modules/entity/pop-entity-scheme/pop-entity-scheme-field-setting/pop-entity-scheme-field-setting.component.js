import { __awaiter } from "tslib";
import { Component, ElementRef, HostListener, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { PopExtendDynamicComponent } from '../../../../pop-extend-dynamic.component';
import { PopDomService } from '../../../../services/pop-dom.service';
import { InputConfig } from '../../../base/pop-field-item/pop-input/input-config.model';
import { PopEntity, PopPipe } from '../../../../pop-common.model';
import { PopFieldEditorService } from '../../pop-entity-field-editor/pop-entity-field-editor.service';
import { SwitchConfig } from '../../../base/pop-field-item/pop-switch/switch-config.model';
import { IsArray, IsNumber, IsObject, IsString, StorageGetter } from '../../../../pop-common-utility';
import { MatDialogRef } from '@angular/material/dialog';
import { PopEntityFieldSettingsComponent } from '../../pop-entity-field-editor/pop-entity-field-settings/pop-entity-field-settings.component';
import { PopEntityUtilFieldService } from '../../services/pop-entity-util-field.service';
export class PopEntitySchemeFieldSettingComponent extends PopExtendDynamicComponent {
    constructor(el, dialog, _domRepo, _fieldRepo, _utilFieldRepo) {
        super();
        this.el = el;
        this.dialog = dialog;
        this._domRepo = _domRepo;
        this._fieldRepo = _fieldRepo;
        this._utilFieldRepo = _utilFieldRepo;
        this.config = {};
        this.name = 'PopEntitySchemeFieldSettingComponent';
        this.srv = {
            field: undefined,
            utilField: undefined,
        };
        this.asset = {
            currentFieldTraitEntryMapping: undefined,
            currentPrimary: undefined,
            fieldTraitEntryMapping: undefined,
            fieldCore: undefined,
            field: undefined,
            scheme: undefined,
            storage: undefined,
        };
        this.ui = {
            name: undefined,
            makePrimary: undefined,
            showName: undefined,
            showNameCore: undefined,
            profileRequired: undefined,
        };
        /**
         * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
         */
        this.dom.configure = () => {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                yield this._setInitialConfig();
                this.template.attach('container');
                this._templateRender();
                return resolve(true);
            }));
        };
    }
    onEscapeHandler(event) {
        console.log('esc', event);
        this.onFormClose();
    }
    onFormClose() {
        if (IsObject(this.dialog)) {
            this.dialog.close(this.core.entity);
        }
    }
    onOutsideCLick() {
        console.log('onOutsideCLick');
        // if( IsObject( this.dialog ) ){
        //   this.dialog.close(this.config);
        // }
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
        super.ngOnDestroy();
    }
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    _setInitialConfig() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            this.asset.fieldCore = yield PopEntity.getCoreConfig('field', this.config.asset_id);
            this.asset.field = this.asset.fieldCore.entity;
            this.asset.scheme = this.core.entity;
            // this.asset.scheme.traits = this.srv.field.getFieldTraits( this.asset.field.fieldgroup.name );
            this.dom.state.isMultipleValues = +this.asset.field.multiple === 1;
            yield this.srv.field.register(this.asset.fieldCore, this.dom.repo, this.asset.scheme);
            this.ui.showName = StorageGetter(this.dom.repo, 'ui.customSetting.show_name.inputs.config'.split('.'), null);
            this.ui.showNameCore = StorageGetter(this.dom.repo, 'ui.customSetting.show_name.inputs.core'.split('.'), null);
            this.srv.utilField.clearCustomFieldCache(+this.core.entity.id);
            this.ui.name = new InputConfig({
                name: 'label',
                label: 'Name',
                value: this.config.asset.label,
                readonly: true,
                facade: true,
                patch: {
                    field: 'label',
                    path: ''
                }
            });
            if ('make_primary' in this.asset.field.setting) {
                const primary = this.srv.field.getSchemePrimary(this.asset.scheme);
                const fieldGroupName = StorageGetter(this.asset.field, ['fieldgroup', 'name']);
                const isPrimary = +primary[fieldGroupName] === +this.asset.field.id;
                this.asset.currentPrimary = IsNumber(primary[fieldGroupName]) ? +primary[fieldGroupName] : null;
                this.asset.currentFieldTraitEntryMapping = this.srv.field.getSchemeFieldSection(this.asset.scheme, +this.asset.field.id, 'trait_entry');
                this.asset.storage = this.srv.field.getSchemeFieldSetting(this.asset.scheme, +this.asset.field.id);
                // console.log( 'currentPrimary', this.asset.currentPrimary );
                // console.log( 'currentFieldEntityMapping', this.asset.currentFieldTraitEntryMapping );
                this.asset.fieldTraitEntryMapping = {};
                if (IsArray(this.asset.field.trait, true)) {
                    this.asset.field.trait.map((trait) => {
                        this.asset.fieldTraitEntryMapping[trait.name] = this.asset.field.entries[0].id;
                    });
                }
                // console.log( 'fieldTraitEntryMapping', this.asset.fieldTraitEntryMapping );
                if (IsObject(primary) && IsString(fieldGroupName, true)) {
                    this.ui.makePrimary = new SwitchConfig({
                        label: `Primary ${this.asset.field.fieldgroup.label}`,
                        value: isPrimary,
                        disabled: isPrimary,
                        facade: true,
                        patch: {
                            field: '',
                            path: '',
                            callback: (core, event) => __awaiter(this, void 0, void 0, function* () {
                                this.dom.setTimeout(`update-primary`, () => __awaiter(this, void 0, void 0, function* () {
                                    if (event.config.control.value) {
                                        primary[fieldGroupName] = +this.asset.field.id;
                                        this.asset.storage.entity_trait = this.asset.fieldTraitEntryMapping;
                                    }
                                    else {
                                        primary[fieldGroupName] = this.asset.currentPrimary;
                                        this.asset.storage.entity_trait = this.asset.currentFieldTraitEntryMapping;
                                    }
                                    yield this.srv.field.updateSchemePrimaryMapping(this.asset.scheme);
                                    this._templateRender();
                                }));
                            })
                        }
                    });
                }
            }
            const required = this.srv.field.getSchemeRequired(this.asset.scheme);
            const isRequired = required.includes(+this.asset.field.id);
            this.ui.profileRequired = new SwitchConfig({
                label: `Required To Save ${PopPipe.transform('profile', { type: 'entity', arg1: 'alias', arg2: 'singular' })}`,
                value: isRequired,
                facade: true,
                patch: {
                    field: '',
                    path: '',
                    callback: (core, event) => {
                        if (event.config.control.value) {
                            required.push(+this.asset.field.id);
                        }
                        else {
                            required.splice(required.indexOf(+this.asset.field.id));
                        }
                        this.srv.field.updateSchemeRequiredMapping(this.asset.scheme);
                    }
                }
            });
            return resolve(true);
        }));
    }
    /**
     * Helper function that renders the list of dynamic components
     *
     */
    _templateRender() {
        this.template.render([{
                type: PopEntityFieldSettingsComponent,
                inputs: {
                    core: this.asset.fieldCore,
                    field: this.asset.field,
                    scheme: this.asset.scheme
                }
            }], [], true);
    }
}
PopEntitySchemeFieldSettingComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-entity-scheme-field-setting',
                template: "<div class=\"entity-scheme-field-loader\" *ngIf=\"dom.state.loader\">\n  <lib-main-spinner></lib-main-spinner>\n</div>\n<div class=\"import-flex-column import-flex-item-full\" [ngClass]=\"{'sw-hidden': !dom.state.loaded}\">\n  <div class=\"import-flex-row import-flex-end-center\">\n    <div class=\"sw-pointer\" (click)=\"onFormClose();\">\n      <mat-icon>close</mat-icon>\n    </div>\n  </div>\n  <div class=\"import-flex-row\">\n    <div class=\"import-flex-column-md\">\n      <lib-pop-input *ngIf=\"ui.name\" [config]=\"ui.name\"></lib-pop-input>\n    </div>\n    <div class=\"import-flex-column-md import-flex-end-center\">\n    </div>\n  </div>\n  <div class=\"entity-scheme-field-setting-container import-flex-column\" (libClickOutside)=\"onOutsideCLick();\">\n    <div class=\"import-flex-row\">\n      <div class=\"import-flex-column-md\">\n        <lib-pop-switch *ngIf=\"!dom.state.isMultipleValues && ui.showName\" [core]=\"ui.showNameCore\" [config]=\"ui.showName\"></lib-pop-switch>\n        <lib-pop-switch *ngIf=\"ui.makePrimary\" [core]=\"ui.showNameCore\" [config]=\"ui.makePrimary\"></lib-pop-switch>\n        <lib-pop-switch *ngIf=\"ui.profileRequired\" [core]=\"ui.profileRequired\" [config]=\"ui.profileRequired\"></lib-pop-switch>\n      </div>\n      <div class=\"import-flex-column-md\">\n      </div>\n    </div>\n    <mat-divider [style.width.%]=\"100\" [style.marginTop.px]=\"5\"></mat-divider>\n    <div class=\"import-flex-row import-flex-item-full\">\n      <ng-template #container></ng-template>\n      <!--<lib-pop-entity-field-settings [core]=ui.fieldCore [field]=\"ui.field\" [scheme]=\"ui.scheme\"></lib-pop-entity-field-settings>-->\n    </div>\n  </div>\n\n  <div class=\"entity-scheme-dialog-buttons\" *ngIf=\"dom.state.loaded\">\n    <button class=\"entity-scheme-dialog-cancel\" mat-raised-button (click)=\"onFormClose();\" [disabled]=\"dom.state.pending\">\n      Close\n    </button>\n  </div>\n</div>\n\n",
                providers: [PopFieldEditorService, PopDomService],
                styles: [".entity-scheme-field-setting-container{flex:1;min-width:650px;border:1px solid var(--border);padding:0 var(--gap-m);margin-top:var(--gap-m);box-sizing:border-box}.entity-scheme-field-loader{height:800px}.entity-scheme-close-btn{position:absolute;top:-20px;right:-20px}.entity-scheme-dialog-buttons{margin-top:20px;margin-bottom:10px;display:flex;justify-content:flex-end}.entity-scheme-dialog-buttons .entity-scheme-dialog-close{order:1;display:flex;align-items:center;justify-content:center;min-height:35px;min-width:120px}"]
            },] }
];
PopEntitySchemeFieldSettingComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: MatDialogRef },
    { type: PopDomService },
    { type: PopFieldEditorService },
    { type: PopEntityUtilFieldService }
];
PopEntitySchemeFieldSettingComponent.propDecorators = {
    container: [{ type: ViewChild, args: ['container', { read: ViewContainerRef, static: true },] }],
    config: [{ type: Input }],
    onEscapeHandler: [{ type: HostListener, args: ['document:keydown.escape', ['$event'],] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS1zY2hlbWUtZmllbGQtc2V0dGluZy5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9lbnRpdHkvcG9wLWVudGl0eS1zY2hlbWUvcG9wLWVudGl0eS1zY2hlbWUtZmllbGQtc2V0dGluZy9wb3AtZW50aXR5LXNjaGVtZS1maWVsZC1zZXR0aW5nLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBcUIsU0FBUyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNILE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLDBDQUEwQyxDQUFDO0FBQ3JGLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUVyRSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sMkRBQTJELENBQUM7QUFDeEYsT0FBTyxFQUE4RixTQUFTLEVBQUUsT0FBTyxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDOUosT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sK0RBQStELENBQUM7QUFDdEcsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDZEQUE2RCxDQUFDO0FBQzNGLE9BQU8sRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsYUFBYSxFQUFpQixNQUFNLGdDQUFnQyxDQUFDO0FBRXJILE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUN4RCxPQUFPLEVBQUUsK0JBQStCLEVBQUUsTUFBTSw2RkFBNkYsQ0FBQztBQUM5SSxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSw4Q0FBOEMsQ0FBQztBQVN6RixNQUFNLE9BQU8sb0NBQXFDLFNBQVEseUJBQXlC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LFdBQVcsRUFBRSxFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFO3FCQUNoRSxLQUFLOzhCQStCTCxZQUFZLFNBQUUseUJBQXlCLEVBQUUsQ0FBRSxRQUFRLENBQUUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEVsZW1lbnRSZWYsIEhvc3RMaXN0ZW5lciwgSW5wdXQsIE9uRGVzdHJveSwgT25Jbml0LCBWaWV3Q2hpbGQsIFZpZXdDb250YWluZXJSZWYgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFBvcEV4dGVuZER5bmFtaWNDb21wb25lbnQgfSBmcm9tICcuLi8uLi8uLi8uLi9wb3AtZXh0ZW5kLWR5bmFtaWMuY29tcG9uZW50JztcbmltcG9ydCB7IFBvcERvbVNlcnZpY2UgfSBmcm9tICcuLi8uLi8uLi8uLi9zZXJ2aWNlcy9wb3AtZG9tLnNlcnZpY2UnO1xuaW1wb3J0IHsgRW50aXR5U2NoZW1lU2VjdGlvbkludGVyZmFjZSB9IGZyb20gJy4uL3BvcC1lbnRpdHktc2NoZW1lLm1vZGVsJztcbmltcG9ydCB7IElucHV0Q29uZmlnIH0gZnJvbSAnLi4vLi4vLi4vYmFzZS9wb3AtZmllbGQtaXRlbS9wb3AtaW5wdXQvaW5wdXQtY29uZmlnLm1vZGVsJztcbmltcG9ydCB7IENvcmVDb25maWcsIERpY3Rpb25hcnksIEZpZWxkQ3VzdG9tU2V0dGluZ0ludGVyZmFjZSwgRmllbGRJbnRlcmZhY2UsIFBvcEJhc2VFdmVudEludGVyZmFjZSwgUG9wRW50aXR5LCBQb3BQaXBlIH0gZnJvbSAnLi4vLi4vLi4vLi4vcG9wLWNvbW1vbi5tb2RlbCc7XG5pbXBvcnQgeyBQb3BGaWVsZEVkaXRvclNlcnZpY2UgfSBmcm9tICcuLi8uLi9wb3AtZW50aXR5LWZpZWxkLWVkaXRvci9wb3AtZW50aXR5LWZpZWxkLWVkaXRvci5zZXJ2aWNlJztcbmltcG9ydCB7IFN3aXRjaENvbmZpZyB9IGZyb20gJy4uLy4uLy4uL2Jhc2UvcG9wLWZpZWxkLWl0ZW0vcG9wLXN3aXRjaC9zd2l0Y2gtY29uZmlnLm1vZGVsJztcbmltcG9ydCB7IElzQXJyYXksIElzTnVtYmVyLCBJc09iamVjdCwgSXNTdHJpbmcsIFN0b3JhZ2VHZXR0ZXIsIFN0b3JhZ2VTZXR0ZXIgfSBmcm9tICcuLi8uLi8uLi8uLi9wb3AtY29tbW9uLXV0aWxpdHknO1xuaW1wb3J0IHsgUG9wRW50aXR5U2NoZW1lU2VydmljZSB9IGZyb20gJy4uL3BvcC1lbnRpdHktc2NoZW1lLnNlcnZpY2UnO1xuaW1wb3J0IHsgTWF0RGlhbG9nUmVmIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvZGlhbG9nJztcbmltcG9ydCB7IFBvcEVudGl0eUZpZWxkU2V0dGluZ3NDb21wb25lbnQgfSBmcm9tICcuLi8uLi9wb3AtZW50aXR5LWZpZWxkLWVkaXRvci9wb3AtZW50aXR5LWZpZWxkLXNldHRpbmdzL3BvcC1lbnRpdHktZmllbGQtc2V0dGluZ3MuY29tcG9uZW50JztcbmltcG9ydCB7IFBvcEVudGl0eVV0aWxGaWVsZFNlcnZpY2UgfSBmcm9tICcuLi8uLi9zZXJ2aWNlcy9wb3AtZW50aXR5LXV0aWwtZmllbGQuc2VydmljZSc7XG5cblxuQENvbXBvbmVudCgge1xuICBzZWxlY3RvcjogJ2xpYi1wb3AtZW50aXR5LXNjaGVtZS1maWVsZC1zZXR0aW5nJyxcbiAgdGVtcGxhdGVVcmw6ICcuL3BvcC1lbnRpdHktc2NoZW1lLWZpZWxkLXNldHRpbmcuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsgJy4vcG9wLWVudGl0eS1zY2hlbWUtZmllbGQtc2V0dGluZy5jb21wb25lbnQuc2NzcycgXSxcbiAgcHJvdmlkZXJzOiBbIFBvcEZpZWxkRWRpdG9yU2VydmljZSwgUG9wRG9tU2VydmljZSBdLFxufSApXG5leHBvcnQgY2xhc3MgUG9wRW50aXR5U2NoZW1lRmllbGRTZXR0aW5nQ29tcG9uZW50IGV4dGVuZHMgUG9wRXh0ZW5kRHluYW1pY0NvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcbiAgQFZpZXdDaGlsZCggJ2NvbnRhaW5lcicsIHsgcmVhZDogVmlld0NvbnRhaW5lclJlZiwgc3RhdGljOiB0cnVlIH0gKSBwdWJsaWMgY29udGFpbmVyO1xuICBASW5wdXQoKSBjb25maWc6IEVudGl0eVNjaGVtZVNlY3Rpb25JbnRlcmZhY2UgPSA8RW50aXR5U2NoZW1lU2VjdGlvbkludGVyZmFjZT57fTtcblxuICBwdWJsaWMgbmFtZSA9ICdQb3BFbnRpdHlTY2hlbWVGaWVsZFNldHRpbmdDb21wb25lbnQnO1xuXG5cbiAgcHJvdGVjdGVkIHNydiA9IHtcbiAgICBmaWVsZDogPFBvcEZpZWxkRWRpdG9yU2VydmljZT51bmRlZmluZWQsXG4gICAgdXRpbEZpZWxkOiA8UG9wRW50aXR5VXRpbEZpZWxkU2VydmljZT51bmRlZmluZWQsXG4gIH07XG5cbiAgcHJvdGVjdGVkIGFzc2V0ID0ge1xuICAgIGN1cnJlbnRGaWVsZFRyYWl0RW50cnlNYXBwaW5nOiA8YW55PnVuZGVmaW5lZCxcbiAgICBjdXJyZW50UHJpbWFyeTogPGFueT51bmRlZmluZWQsXG4gICAgZmllbGRUcmFpdEVudHJ5TWFwcGluZzogPGFueT51bmRlZmluZWQsXG4gICAgZmllbGRDb3JlOiA8Q29yZUNvbmZpZz51bmRlZmluZWQsXG4gICAgZmllbGQ6IDxGaWVsZEludGVyZmFjZT51bmRlZmluZWQsXG4gICAgc2NoZW1lOiA8RW50aXR5U2NoZW1lU2VjdGlvbkludGVyZmFjZT51bmRlZmluZWQsXG4gICAgc3RvcmFnZTogPGFueT51bmRlZmluZWQsXG4gIH07XG5cbiAgcHVibGljIHVpID0ge1xuICAgIG5hbWU6IDxJbnB1dENvbmZpZz51bmRlZmluZWQsXG5cbiAgICBtYWtlUHJpbWFyeTogPFN3aXRjaENvbmZpZz51bmRlZmluZWQsXG5cbiAgICBzaG93TmFtZTogPFN3aXRjaENvbmZpZz51bmRlZmluZWQsXG4gICAgc2hvd05hbWVDb3JlOiA8Q29yZUNvbmZpZz51bmRlZmluZWQsXG4gICAgcHJvZmlsZVJlcXVpcmVkOiA8U3dpdGNoQ29uZmlnPnVuZGVmaW5lZCxcbiAgfTtcblxuXG4gIEBIb3N0TGlzdGVuZXIoICdkb2N1bWVudDprZXlkb3duLmVzY2FwZScsIFsgJyRldmVudCcgXSApIG9uRXNjYXBlSGFuZGxlciggZXZlbnQ6IEtleWJvYXJkRXZlbnQgKXtcbiAgICBjb25zb2xlLmxvZyggJ2VzYycsIGV2ZW50ICk7XG4gICAgdGhpcy5vbkZvcm1DbG9zZSgpO1xuICB9XG5cblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgZWw6IEVsZW1lbnRSZWYsXG4gICAgcHVibGljIGRpYWxvZzogTWF0RGlhbG9nUmVmPFBvcEVudGl0eVNjaGVtZUZpZWxkU2V0dGluZ0NvbXBvbmVudD4sXG4gICAgcHJvdGVjdGVkIF9kb21SZXBvOiBQb3BEb21TZXJ2aWNlLFxuICAgIHByb3RlY3RlZCBfZmllbGRSZXBvOiBQb3BGaWVsZEVkaXRvclNlcnZpY2UsXG4gICAgcHJvdGVjdGVkIF91dGlsRmllbGRSZXBvOiBQb3BFbnRpdHlVdGlsRmllbGRTZXJ2aWNlLFxuICApe1xuICAgIHN1cGVyKCk7XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIHNob3VsZCB0cmFuc2Zvcm0gYW5kIHZhbGlkYXRlIHRoZSBkYXRhLiBUaGUgdmlldyBzaG91bGQgdHJ5IHRvIG9ubHkgdXNlIGRhdGEgdGhhdCBpcyBzdG9yZWQgb24gdWkgc28gdGhhdCBpdCBpcyBub3QgZGVwZW5kZW50IG9uIHRoZSBzdHJ1Y3R1cmUgb2YgZGF0YSB0aGF0IGNvbWVzIGZyb20gb3RoZXIgc291cmNlcy4gVGhlIHVpIHNob3VsZCBiZSB0aGUgc291cmNlIG9mIHRydXRoIGhlcmUuXG4gICAgICovXG4gICAgdGhpcy5kb20uY29uZmlndXJlID0gKCk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCBhc3luYyggcmVzb2x2ZSApID0+IHtcblxuICAgICAgICBhd2FpdCB0aGlzLl9zZXRJbml0aWFsQ29uZmlnKCk7XG4gICAgICAgIHRoaXMudGVtcGxhdGUuYXR0YWNoKCAnY29udGFpbmVyJyApO1xuXG5cbiAgICAgICAgdGhpcy5fdGVtcGxhdGVSZW5kZXIoKTtcblxuXG4gICAgICAgIHJldHVybiByZXNvbHZlKCB0cnVlICk7XG4gICAgICB9ICk7XG4gICAgfTtcblxuXG4gIH1cblxuXG4gIG9uRm9ybUNsb3NlKCl7XG4gICAgaWYoIElzT2JqZWN0KCB0aGlzLmRpYWxvZyApICl7XG4gICAgICB0aGlzLmRpYWxvZy5jbG9zZSggdGhpcy5jb3JlLmVudGl0eSApO1xuICAgIH1cbiAgfVxuXG5cbiAgb25PdXRzaWRlQ0xpY2soKXtcbiAgICBjb25zb2xlLmxvZyggJ29uT3V0c2lkZUNMaWNrJyApO1xuICAgIC8vIGlmKCBJc09iamVjdCggdGhpcy5kaWFsb2cgKSApe1xuICAgIC8vICAgdGhpcy5kaWFsb2cuY2xvc2UodGhpcy5jb25maWcpO1xuICAgIC8vIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgY29tcG9uZW50IHNob3VsZCBoYXZlIGEgc3BlY2lmaWMgcHVycG9zZVxuICAgKi9cbiAgbmdPbkluaXQoKXtcbiAgICBzdXBlci5uZ09uSW5pdCgpO1xuICB9XG5cblxuICAvKipcbiAgICogVGhlIGRvbSBkZXN0cm95IGZ1bmN0aW9uIG1hbmFnZXMgYWxsIHRoZSBjbGVhbiB1cCB0aGF0IGlzIG5lY2Vzc2FyeSBpZiBzdWJzY3JpcHRpb25zLCB0aW1lb3V0cywgZXRjIGFyZSBzdG9yZWQgcHJvcGVybHlcbiAgICovXG4gIG5nT25EZXN0cm95KCl7XG4gICAgc3VwZXIubmdPbkRlc3Ryb3koKTtcbiAgfVxuXG5cbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBVbmRlciBUaGUgSG9vZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIFByaXZhdGUgTWV0aG9kICkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cblxuICBwcml2YXRlIF9zZXRJbml0aWFsQ29uZmlnKCk6IFByb21pc2U8Ym9vbGVhbj57XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKCBhc3luYyggcmVzb2x2ZSApID0+IHtcblxuICAgICAgdGhpcy5hc3NldC5maWVsZENvcmUgPSBhd2FpdCBQb3BFbnRpdHkuZ2V0Q29yZUNvbmZpZyggJ2ZpZWxkJywgdGhpcy5jb25maWcuYXNzZXRfaWQgKTtcbiAgICAgIHRoaXMuYXNzZXQuZmllbGQgPSA8RmllbGRJbnRlcmZhY2U+dGhpcy5hc3NldC5maWVsZENvcmUuZW50aXR5O1xuICAgICAgdGhpcy5hc3NldC5zY2hlbWUgPSA8RW50aXR5U2NoZW1lU2VjdGlvbkludGVyZmFjZT50aGlzLmNvcmUuZW50aXR5O1xuICAgICAgLy8gdGhpcy5hc3NldC5zY2hlbWUudHJhaXRzID0gdGhpcy5zcnYuZmllbGQuZ2V0RmllbGRUcmFpdHMoIHRoaXMuYXNzZXQuZmllbGQuZmllbGRncm91cC5uYW1lICk7XG4gICAgICB0aGlzLmRvbS5zdGF0ZS5pc011bHRpcGxlVmFsdWVzID0gK3RoaXMuYXNzZXQuZmllbGQubXVsdGlwbGUgPT09IDE7XG4gICAgICBhd2FpdCB0aGlzLnNydi5maWVsZC5yZWdpc3RlciggdGhpcy5hc3NldC5maWVsZENvcmUsIHRoaXMuZG9tLnJlcG8sIHRoaXMuYXNzZXQuc2NoZW1lICk7XG4gICAgICB0aGlzLnVpLnNob3dOYW1lID0gU3RvcmFnZUdldHRlciggdGhpcy5kb20ucmVwbywgJ3VpLmN1c3RvbVNldHRpbmcuc2hvd19uYW1lLmlucHV0cy5jb25maWcnLnNwbGl0KCAnLicgKSwgbnVsbCApO1xuICAgICAgdGhpcy51aS5zaG93TmFtZUNvcmUgPSBTdG9yYWdlR2V0dGVyKCB0aGlzLmRvbS5yZXBvLCAndWkuY3VzdG9tU2V0dGluZy5zaG93X25hbWUuaW5wdXRzLmNvcmUnLnNwbGl0KCAnLicgKSwgbnVsbCApO1xuXG4gICAgICB0aGlzLnNydi51dGlsRmllbGQuY2xlYXJDdXN0b21GaWVsZENhY2hlKCArdGhpcy5jb3JlLmVudGl0eS5pZCApO1xuXG5cbiAgICAgIHRoaXMudWkubmFtZSA9IG5ldyBJbnB1dENvbmZpZygge1xuICAgICAgICBuYW1lOiAnbGFiZWwnLFxuICAgICAgICBsYWJlbDogJ05hbWUnLFxuICAgICAgICB2YWx1ZTogdGhpcy5jb25maWcuYXNzZXQubGFiZWwsXG4gICAgICAgIHJlYWRvbmx5OiB0cnVlLFxuICAgICAgICBmYWNhZGU6IHRydWUsXG4gICAgICAgIHBhdGNoOiB7XG4gICAgICAgICAgZmllbGQ6ICdsYWJlbCcsXG4gICAgICAgICAgcGF0aDogJydcbiAgICAgICAgfVxuICAgICAgfSApO1xuXG4gICAgICBpZiggJ21ha2VfcHJpbWFyeScgaW4gdGhpcy5hc3NldC5maWVsZC5zZXR0aW5nICl7XG4gICAgICAgIGNvbnN0IHByaW1hcnkgPSB0aGlzLnNydi5maWVsZC5nZXRTY2hlbWVQcmltYXJ5KCB0aGlzLmFzc2V0LnNjaGVtZSApO1xuICAgICAgICBjb25zdCBmaWVsZEdyb3VwTmFtZSA9IFN0b3JhZ2VHZXR0ZXIoIHRoaXMuYXNzZXQuZmllbGQsIFsgJ2ZpZWxkZ3JvdXAnLCAnbmFtZScgXSApO1xuICAgICAgICBjb25zdCBpc1ByaW1hcnkgPSArcHJpbWFyeVsgZmllbGRHcm91cE5hbWUgXSA9PT0gK3RoaXMuYXNzZXQuZmllbGQuaWQ7XG4gICAgICAgIHRoaXMuYXNzZXQuY3VycmVudFByaW1hcnkgPSBJc051bWJlciggcHJpbWFyeVsgZmllbGRHcm91cE5hbWUgXSApID8gK3ByaW1hcnlbIGZpZWxkR3JvdXBOYW1lIF0gOiBudWxsO1xuICAgICAgICB0aGlzLmFzc2V0LmN1cnJlbnRGaWVsZFRyYWl0RW50cnlNYXBwaW5nID0gdGhpcy5zcnYuZmllbGQuZ2V0U2NoZW1lRmllbGRTZWN0aW9uKCB0aGlzLmFzc2V0LnNjaGVtZSwgK3RoaXMuYXNzZXQuZmllbGQuaWQsICd0cmFpdF9lbnRyeScgKTtcbiAgICAgICAgdGhpcy5hc3NldC5zdG9yYWdlID0gdGhpcy5zcnYuZmllbGQuZ2V0U2NoZW1lRmllbGRTZXR0aW5nKCB0aGlzLmFzc2V0LnNjaGVtZSwgK3RoaXMuYXNzZXQuZmllbGQuaWQgKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coICdjdXJyZW50UHJpbWFyeScsIHRoaXMuYXNzZXQuY3VycmVudFByaW1hcnkgKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coICdjdXJyZW50RmllbGRFbnRpdHlNYXBwaW5nJywgdGhpcy5hc3NldC5jdXJyZW50RmllbGRUcmFpdEVudHJ5TWFwcGluZyApO1xuXG5cbiAgICAgICAgdGhpcy5hc3NldC5maWVsZFRyYWl0RW50cnlNYXBwaW5nID0ge307XG4gICAgICAgIGlmKCBJc0FycmF5KCB0aGlzLmFzc2V0LmZpZWxkLnRyYWl0LCB0cnVlICkgKXtcbiAgICAgICAgICB0aGlzLmFzc2V0LmZpZWxkLnRyYWl0Lm1hcCggKCB0cmFpdCApID0+IHtcbiAgICAgICAgICAgIHRoaXMuYXNzZXQuZmllbGRUcmFpdEVudHJ5TWFwcGluZ1sgdHJhaXQubmFtZSBdID0gdGhpcy5hc3NldC5maWVsZC5lbnRyaWVzWyAwIF0uaWQ7XG4gICAgICAgICAgfSApO1xuICAgICAgICB9XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCAnZmllbGRUcmFpdEVudHJ5TWFwcGluZycsIHRoaXMuYXNzZXQuZmllbGRUcmFpdEVudHJ5TWFwcGluZyApO1xuICAgICAgICBpZiggSXNPYmplY3QoIHByaW1hcnkgKSAmJiBJc1N0cmluZyggZmllbGRHcm91cE5hbWUsIHRydWUgKSApe1xuICAgICAgICAgIHRoaXMudWkubWFrZVByaW1hcnkgPSBuZXcgU3dpdGNoQ29uZmlnKCB7XG4gICAgICAgICAgICBsYWJlbDogYFByaW1hcnkgJHt0aGlzLmFzc2V0LmZpZWxkLmZpZWxkZ3JvdXAubGFiZWx9YCxcbiAgICAgICAgICAgIHZhbHVlOiBpc1ByaW1hcnksXG4gICAgICAgICAgICBkaXNhYmxlZDogaXNQcmltYXJ5LFxuICAgICAgICAgICAgZmFjYWRlOiB0cnVlLFxuICAgICAgICAgICAgcGF0Y2g6IHtcbiAgICAgICAgICAgICAgZmllbGQ6ICcnLFxuICAgICAgICAgICAgICBwYXRoOiAnJyxcbiAgICAgICAgICAgICAgY2FsbGJhY2s6IGFzeW5jKCBjb3JlOiBDb3JlQ29uZmlnLCBldmVudDogUG9wQmFzZUV2ZW50SW50ZXJmYWNlICkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuZG9tLnNldFRpbWVvdXQoIGB1cGRhdGUtcHJpbWFyeWAsIGFzeW5jKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgaWYoIGV2ZW50LmNvbmZpZy5jb250cm9sLnZhbHVlICl7XG4gICAgICAgICAgICAgICAgICAgIHByaW1hcnlbIGZpZWxkR3JvdXBOYW1lIF0gPSArdGhpcy5hc3NldC5maWVsZC5pZDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hc3NldC5zdG9yYWdlLmVudGl0eV90cmFpdCA9IHRoaXMuYXNzZXQuZmllbGRUcmFpdEVudHJ5TWFwcGluZztcbiAgICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5WyBmaWVsZEdyb3VwTmFtZSBdID0gdGhpcy5hc3NldC5jdXJyZW50UHJpbWFyeTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hc3NldC5zdG9yYWdlLmVudGl0eV90cmFpdCA9IHRoaXMuYXNzZXQuY3VycmVudEZpZWxkVHJhaXRFbnRyeU1hcHBpbmc7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnNydi5maWVsZC51cGRhdGVTY2hlbWVQcmltYXJ5TWFwcGluZyggdGhpcy5hc3NldC5zY2hlbWUgKTtcbiAgICAgICAgICAgICAgICAgIHRoaXMuX3RlbXBsYXRlUmVuZGVyKCk7XG4gICAgICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9ICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNvbnN0IHJlcXVpcmVkID0gPG51bWJlcltdPnRoaXMuc3J2LmZpZWxkLmdldFNjaGVtZVJlcXVpcmVkKCB0aGlzLmFzc2V0LnNjaGVtZSApO1xuICAgICAgY29uc3QgaXNSZXF1aXJlZCA9IHJlcXVpcmVkLmluY2x1ZGVzKCArdGhpcy5hc3NldC5maWVsZC5pZCApO1xuICAgICAgdGhpcy51aS5wcm9maWxlUmVxdWlyZWQgPSBuZXcgU3dpdGNoQ29uZmlnKCB7XG4gICAgICAgIGxhYmVsOiBgUmVxdWlyZWQgVG8gU2F2ZSAke1BvcFBpcGUudHJhbnNmb3JtKCAncHJvZmlsZScsIHsgdHlwZTogJ2VudGl0eScsIGFyZzE6ICdhbGlhcycsIGFyZzI6ICdzaW5ndWxhcicgfSApfWAsXG4gICAgICAgIHZhbHVlOiBpc1JlcXVpcmVkLFxuICAgICAgICBmYWNhZGU6IHRydWUsXG4gICAgICAgIHBhdGNoOiB7XG4gICAgICAgICAgZmllbGQ6ICcnLFxuICAgICAgICAgIHBhdGg6ICcnLFxuICAgICAgICAgIGNhbGxiYWNrOiAoIGNvcmU6IENvcmVDb25maWcsIGV2ZW50OiBQb3BCYXNlRXZlbnRJbnRlcmZhY2UgKSA9PiB7XG4gICAgICAgICAgICBpZiggZXZlbnQuY29uZmlnLmNvbnRyb2wudmFsdWUgKXtcbiAgICAgICAgICAgICAgcmVxdWlyZWQucHVzaCggK3RoaXMuYXNzZXQuZmllbGQuaWQgKTtcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICByZXF1aXJlZC5zcGxpY2UoIHJlcXVpcmVkLmluZGV4T2YoICt0aGlzLmFzc2V0LmZpZWxkLmlkICkgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc3J2LmZpZWxkLnVwZGF0ZVNjaGVtZVJlcXVpcmVkTWFwcGluZyggdGhpcy5hc3NldC5zY2hlbWUgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gKTtcblxuICAgICAgcmV0dXJuIHJlc29sdmUoIHRydWUgKTtcbiAgICB9ICk7XG5cbiAgfVxuXG5cbiAgLyoqXG4gICAqIEhlbHBlciBmdW5jdGlvbiB0aGF0IHJlbmRlcnMgdGhlIGxpc3Qgb2YgZHluYW1pYyBjb21wb25lbnRzXG4gICAqXG4gICAqL1xuICBwcml2YXRlIF90ZW1wbGF0ZVJlbmRlcigpe1xuICAgIHRoaXMudGVtcGxhdGUucmVuZGVyKCBbIHtcbiAgICAgIHR5cGU6IFBvcEVudGl0eUZpZWxkU2V0dGluZ3NDb21wb25lbnQsXG4gICAgICBpbnB1dHM6IHtcbiAgICAgICAgY29yZTogdGhpcy5hc3NldC5maWVsZENvcmUsXG4gICAgICAgIGZpZWxkOiB0aGlzLmFzc2V0LmZpZWxkLFxuICAgICAgICBzY2hlbWU6IHRoaXMuYXNzZXQuc2NoZW1lXG4gICAgICB9XG4gICAgfSBdLCBbXSwgdHJ1ZSApO1xuICB9XG5cbn1cbiJdfQ==