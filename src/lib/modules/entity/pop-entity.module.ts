import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { PortalModule } from '@angular/cdk/portal';
import { RouterModule } from '@angular/router';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { PopTableModule } from '../base/pop-table/pop-table.module';

import { PopFieldItemGroupModule } from '../base/pop-field-item-group/pop-field-item-group.module';
import { PopIndicatorsModule } from '../base/pop-indicators/pop-indicators.module';
import { PopEntityPortalMenuComponent } from './pop-entity-tab-menu/pop-entity-portal-menu/pop-entity-portal-menu.component';
import { PopErrorsModule } from '../base/pop-errors/pop-errors.module';
import { PopEntityListComponent } from './pop-entity-list/pop-entity-list.component';
import { PopEntityTabMenuComponent } from './pop-entity-tab-menu/pop-entity-tab-menu.component';
import { PopTabMenuModule } from '../base/pop-tab-menu/pop-tab-menu.module';
import { PopEntityHistoryComponent } from './pop-entity-history/pop-entity-history.component';
import { PopEntityAccessComponent } from './pop-entity-access/pop-entity-access.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material/material.module';
import { PopFieldItemModule } from '../base/pop-field-item/pop-field-item.module';
import { PopEntityAssignmentsComponent } from './pop-entity-assignments/pop-entity-assignments.component';
import { PopEntityProviderDialogComponent } from './pop-entity-assignments/pop-entity-provider-dialog/pop-entity-provider-dialog.component';
import { MatNativeDateModule } from '@angular/material/core';

import { PopEntityAdvancedSearchComponent } from './pop-entity-list/pop-entity-advanced-search/pop-entity-advanced-search.component';
import { PopEntityFieldGroupComponent } from './pop-entity-field-group/pop-entity-field-group.component';
import { PopEntityTabComponent } from './pop-entity-tab/pop-entity-tab.component';
import { PopEntityEmailComponent } from './pop-entity-field/pop-entity-email/pop-entity-email.component';
import { PopEntityPhoneComponent } from './pop-entity-field/pop-entity-phone/pop-entity-phone.component';
import { PopEntityAddressComponent } from './pop-entity-field/pop-entity-address/pop-entity-address.component';
import { PopEntityDatetimeComponent } from './pop-entity-field/pop-entity-datetime/pop-entity-datetime.component';
import { PopEntityInputComponent } from './pop-entity-field/pop-entity-input/pop-entity-input.component';
import { PopEntityNameComponent } from './pop-entity-field/pop-entity-name/pop-entity-name.component';
import { PopEntityFieldComponent } from './pop-entity-field/pop-entity-field.component';
import { PopEntityFieldActionBtnComponent } from './pop-entity-field/assets/pop-entity-field-action-btn.component';
import { PopEntityFieldEditIconComponent } from './pop-entity-field/assets/pop-entity-field-edit-icon/pop-entity-field-edit-icon.component';
import { PopEntityFieldDashComponent } from './pop-entity-field/assets/pop-entity-field-dash.component';
import { PopEntityFieldSpacerComponent } from './pop-entity-field/assets/pop-entity-field-spacer.component';
import { PopEntitySelectComponent } from './pop-entity-field/pop-entity-select/pop-entity-select.component';
import { PopEntityTextareaComponent } from './pop-entity-field/pop-entity-textarea/pop-entity-textarea.component';
import { PopEntityCheckboxComponent } from './pop-entity-field/pop-entity-checkbox/pop-entity-checkbox.component';
import { PopEntityRadioComponent } from './pop-entity-field/pop-entity-radio/pop-entity-radio.component';
import { PopContextMenuModule } from '../base/pop-context-menu/pop-context-menu.module';
import { PopEntityTabColumnComponent } from './pop-entity-tab/pop-entity-tab-column.component';
import { PopEntitySchemeComponent } from './pop-entity-scheme/pop-entity-scheme.component';

import { PopEntitySchemeDetailsComponent } from './pop-entity-scheme/pop-entity-scheme-details/pop-entity-scheme-details.component';
import { PopEntitySchemeAssetPoolComponent } from './pop-entity-scheme/pop-entity-scheme-asset-pool/pop-entity-scheme-asset-pool.component';
import { PopEntitySchemeAssetLayoutComponent } from './pop-entity-scheme/pop-entity-scheme-asset-layout/pop-entity-scheme-asset-layout.component';
import { FieldInputSettingComponent } from './pop-entity-scheme/pop-entity-asset-field-modal/params/field-input-setting.component';
import { FieldLabelSettingComponent } from './pop-entity-scheme/pop-entity-asset-field-modal/params/field-label-setting.component';
import { FieldRadioSettingComponent } from './pop-entity-scheme/pop-entity-asset-field-modal/params/field-radio-setting.component';
import { FieldSelectSettingComponent } from './pop-entity-scheme/pop-entity-asset-field-modal/params/field-select-setting.component';
import { FieldSwitchSettingComponent } from './pop-entity-scheme/pop-entity-asset-field-modal/params/field-switch-setting.component';
import { FieldTextareaSettingComponent } from './pop-entity-scheme/pop-entity-asset-field-modal/params/field-textarea-setting.component';
import { PopEntityAssetComponentModalComponent } from './pop-entity-scheme/pop-entity-asset-component-modal/pop-entity-asset-component-modal.component';
import { PopEntityAssetFieldModalComponent } from './pop-entity-scheme/pop-entity-asset-field-modal/pop-entity-asset-field-modal.component';
import { EntitySchemeLayoutSectionComponent } from './pop-entity-scheme/pop-entity-scheme-asset-layout/entity-scheme-layout-section/entity-scheme-layout-section.component';
import { PopEntitySchemeCustomComponent } from './pop-entity-scheme/pop-entity-scheme-custom-component/pop-entity-scheme-custom.component';
import { EntitySchemeFieldContentComponent } from './pop-entity-scheme/pop-entity-scheme-asset-layout/entity-scheme-layout-section/entity-scheme-field-content/entity-scheme-field-content.component';
import { EntitySchemeTableContentComponent } from './pop-entity-scheme/pop-entity-scheme-asset-layout/entity-scheme-layout-section/entity-scheme-table-content/entity-scheme-table-content.component';
import { EntitySchemeComponentContentComponent } from './pop-entity-scheme/pop-entity-scheme-asset-layout/entity-scheme-layout-section/entity-scheme-component-content/entity-scheme-component-content.component';

import { PopEntityFieldPreviewComponent } from './pop-entity-field-editor/pop-entity-field-preview/pop-entity-field-preview.component';
import { PopEntityFieldSettingsComponent } from './pop-entity-field-editor/pop-entity-field-settings/pop-entity-field-settings.component';
import { PopEntityFieldItemsComponent } from './pop-entity-field-editor/pop-entity-field-settings/pop-entity-field-items/pop-entity-field-items.component';
import { PopEntityFieldValuesComponent } from './pop-entity-field-editor/pop-entity-field-settings/pop-entity-field-values/pop-entity-field-values.component';
import { PopEntityFieldItemParamsComponent } from './pop-entity-field-editor/pop-entity-field-settings/pop-entity-field-item-params/pop-entity-field-item-params.component';
import { FieldInputParamComponent } from './pop-entity-field-editor/pop-entity-field-settings/pop-entity-field-item-params/params/field-input-param.component';
import { FieldLabelParamComponent } from './pop-entity-field-editor/pop-entity-field-settings/pop-entity-field-item-params/params/field-label-param.component';
import { FieldSelectParamComponent } from './pop-entity-field-editor/pop-entity-field-settings/pop-entity-field-item-params/params/field-select-param.component';
import { FieldTextareaParamComponent } from './pop-entity-field-editor/pop-entity-field-settings/pop-entity-field-item-params/params/field-textarea-param.component';
import { FieldRadioParamComponent } from './pop-entity-field-editor/pop-entity-field-settings/pop-entity-field-item-params/params/field-radio-param.component';
import { FieldSwitchParamComponent } from './pop-entity-field-editor/pop-entity-field-settings/pop-entity-field-item-params/params/field-switch-param.component';
import { PopEntityFieldEditorComponent } from './pop-entity-field-editor/pop-entity-field-editor.component';
import { PopEntityFieldDetailsComponent } from './pop-entity-field-editor/pop-entity-field-details/pop-entity-field-details.component';
import { FieldSliderParamComponent } from './pop-entity-field-editor/pop-entity-field-settings/pop-entity-field-item-params/params/field-slider-param.component';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PopEntityFieldBoilerComponent } from './pop-entity-field/pop-entity-field-boiler.component';
import { PopEntityFieldEntriesComponent } from './pop-entity-field-editor/pop-entity-field-settings/pop-entity-field-entries/pop-entity-field-entries.component';
import { PopDialogsModule } from '../base/pop-dialogs/pop-dialogs.module';
import { FieldNumberParamComponent } from './pop-entity-field-editor/pop-entity-field-settings/pop-entity-field-item-params/params/field-number-param.component';
import { PopEntityTabListComponent } from './pop-entity-tab-list/pop-entity-tab-list.component';
import { PopEntityStatusComponent } from './pop-entity-status/pop-entity-status.component';
import { PopEntityFieldModalComponent } from './pop-entity-field/pop-entity-field-modal/pop-entity-field-modal.component';
import { PopEntityAddressEditComponent } from './pop-entity-field/pop-entity-address/pop-entity-address-edit/pop-entity-address-edit.component';
import { PopEntitySwitchComponent } from './pop-entity-field/pop-entity-switch/pop-entity-switch.component';
import { PopEntitySelectMultiComponent } from './pop-entity-field/pop-entity-select-multi/pop-entity-select-multi.component';
import { PopTabMenuComponent } from '../base/pop-tab-menu/pop-tab-menu.component';
import { PopTableComponent } from '../base/pop-table/pop-table.component';
import { PopTabMenuSectionBarComponent } from '../base/pop-tab-menu/pop-tab-menu-section-bar/pop-tab-menu-section-bar.component';
import { PopEntitySchemeFieldSettingComponent } from './pop-entity-scheme/pop-entity-scheme-field-setting/pop-entity-scheme-field-setting.component';
import { PopEntitySchemeCustomSettingComponent } from './pop-entity-scheme/pop-entity-scheme-custom-setting/pop-entity-scheme-custom-setting.component';





@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    MatFormFieldModule,
    MatInputModule,
    RouterModule,
    PortalModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    DragDropModule,
    PopErrorsModule,
    PopFieldItemModule,
    PopFieldItemGroupModule,
    PopIndicatorsModule,
    PopTableModule,
    PopTabMenuModule,
    MatNativeDateModule,
    PopContextMenuModule,
    PopDialogsModule

  ],
  declarations: [
    PopEntityListComponent,
    PopEntityTabListComponent,
    PopEntityAdvancedSearchComponent,
    PopEntityPortalMenuComponent,
    PopEntityFieldGroupComponent,
    PopEntityPortalMenuComponent,
    PopEntityTabMenuComponent,
    PopEntityTabComponent,
    PopEntityTabColumnComponent,
    PopEntityHistoryComponent,
    PopEntityAssignmentsComponent,
    PopEntityProviderDialogComponent,
    PopEntityAccessComponent,
    PopEntityFieldComponent,
    PopEntityFieldActionBtnComponent,
    PopEntityFieldEditIconComponent,
    PopEntityFieldDashComponent,
    PopEntityFieldSpacerComponent,
    PopEntityFieldBoilerComponent,
    PopEntityFieldModalComponent,
    PopEntityEmailComponent,
    PopEntityPhoneComponent,
    PopEntityAddressComponent,
    PopEntityAddressEditComponent,
    PopEntityDatetimeComponent,
    PopEntityInputComponent,
    PopEntitySelectComponent,
    PopEntitySelectMultiComponent,
    PopEntityCheckboxComponent,
    PopEntityRadioComponent,
    PopEntitySwitchComponent,
    PopEntityNameComponent,
    PopEntityTextareaComponent,
    PopEntityStatusComponent,

    PopEntitySchemeComponent,
    PopEntitySchemeDetailsComponent,
    PopEntitySchemeAssetPoolComponent,
    PopEntitySchemeAssetLayoutComponent,
    EntitySchemeLayoutSectionComponent,
    PopEntitySchemeFieldSettingComponent,
    EntitySchemeFieldContentComponent,
    EntitySchemeComponentContentComponent,
    EntitySchemeTableContentComponent,
    PopEntityAssetComponentModalComponent,
    PopEntityAssetFieldModalComponent,
    FieldInputSettingComponent,
    FieldLabelSettingComponent,
    FieldRadioSettingComponent,
    FieldSelectSettingComponent,
    FieldSwitchSettingComponent,
    FieldTextareaSettingComponent,
    PopEntitySchemeCustomComponent,

    PopEntityFieldEditorComponent,
    PopEntityFieldDetailsComponent,
    PopEntityFieldSettingsComponent,
    PopEntityFieldPreviewComponent,
    PopEntityFieldItemsComponent,
    PopEntityFieldValuesComponent,
    PopEntityFieldEntriesComponent,
    PopEntityFieldItemsComponent,
    PopEntityFieldItemParamsComponent,
    FieldInputParamComponent,
    FieldSelectParamComponent,
    FieldLabelParamComponent,
    FieldSwitchParamComponent,
    FieldTextareaParamComponent,
    FieldRadioParamComponent,
    FieldSliderParamComponent,
    FieldNumberParamComponent,
    PopEntitySchemeCustomSettingComponent,

  ],
  exports: [
    PopEntityListComponent,
    PopEntityTabListComponent,
    PopEntityAdvancedSearchComponent,
    PopEntityPortalMenuComponent,
    PopEntityFieldGroupComponent,
    PopEntityPortalMenuComponent,
    PopEntityTabMenuComponent,
    PopEntityTabComponent,
    PopEntityTabColumnComponent,
    PopEntityHistoryComponent,
    PopEntityAssignmentsComponent,
    PopEntityProviderDialogComponent,
    PopEntityAccessComponent,
    PopEntityFieldComponent,
    PopEntityFieldActionBtnComponent,
    PopEntityFieldEditIconComponent,
    PopEntityFieldDashComponent,
    PopEntityFieldSpacerComponent,
    PopEntityEmailComponent,
    PopEntityPhoneComponent,
    PopEntityFieldModalComponent,
    PopEntityAddressComponent,
    PopEntityAddressEditComponent,
    PopEntityDatetimeComponent,
    PopEntityInputComponent,
    PopEntitySelectComponent,
    PopEntitySelectMultiComponent,
    PopEntityCheckboxComponent,
    PopEntityRadioComponent,
    PopEntitySwitchComponent,
    PopEntityNameComponent,
    PopEntityTextareaComponent,
    PopEntityStatusComponent,

    PopEntitySchemeComponent,
    PopEntitySchemeDetailsComponent,
    PopEntitySchemeAssetPoolComponent,
    PopEntitySchemeAssetLayoutComponent,
    EntitySchemeLayoutSectionComponent,
    PopEntitySchemeFieldSettingComponent,
    EntitySchemeFieldContentComponent,
    EntitySchemeComponentContentComponent,
    EntitySchemeTableContentComponent,
    PopEntityAssetComponentModalComponent,
    PopEntityAssetFieldModalComponent,
    FieldInputSettingComponent,
    FieldLabelSettingComponent,
    FieldRadioSettingComponent,
    FieldSelectSettingComponent,
    FieldSwitchSettingComponent,
    FieldTextareaSettingComponent,
    PopEntitySchemeCustomComponent,

    PopEntityFieldEditorComponent,
    PopEntityFieldDetailsComponent,
    PopEntityFieldSettingsComponent,
    PopEntityFieldPreviewComponent,
    PopEntityFieldItemsComponent,
    PopEntityFieldValuesComponent,
    PopEntityFieldEntriesComponent,
    PopEntityFieldItemsComponent,

    PopEntityFieldItemParamsComponent,
    PopEntityFieldItemParamsComponent,
    FieldInputParamComponent,
    FieldSelectParamComponent,
    FieldLabelParamComponent,
    FieldSwitchParamComponent,
    FieldTextareaParamComponent,
    FieldRadioParamComponent,
    FieldSliderParamComponent,
    FieldNumberParamComponent
  ],
})
export class PopEntityModule {
}
