// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IConfig, NgxMaskModule } from 'ngx-mask';


// Pop Common
import { MaterialModule } from '../../material/material.module';
import { PopIndicatorsModule } from '../pop-indicators/pop-indicators.module';
import { PopInputComponent } from './pop-input/pop-input.component';
import { PopSelectComponent } from './pop-select/pop-select.component';
import { PopSelectMultiComponent } from './pop-select-multi/pop-select-multi.component';
import { PopCheckboxComponent } from './pop-checkbox/pop-checkbox.component';
import { PopRadioComponent } from './pop-radio/pop-radio.component';
import { PopSwitchComponent } from './pop-switch/pop-switch.component';
import { PopTextareaComponent } from './pop-textarea/pop-textarea.component';
import { PopLabelComponent } from './pop-label/pop-label.component';
import { PopSelectFilterComponent } from './pop-select-filter/pop-select-filter.component';
import { ClickOutsideDirective } from './click-outside-directive';
import { PopDateComponent } from './pop-date/pop-date.component';
import { PopDateRangeComponent } from './pop-date/pop-date-range/pop-date-range.component';
import { DateRangeExpansionItemsComponent } from './pop-date/pop-date-range/expansion-items/date-range-expansion-items.component';
import { ExpansionItemsComponent } from './pop-date/datepicker-expansion-items/expansion-items.component';
import { CustomPanelComponent } from './pop-date/datepicker-expansion-items/custom-panel/custom-panel.component';
import { PopTimeComponent } from './pop-time/pop-time.component';
import { PopSelectListComponent } from './pop-select-list/pop-select-list.component';
import { PopSelectModalComponent } from './pop-select-modal/pop-select-modal.component';
import { PopSelectModalDialogComponent } from './pop-select-modal/pop-select-modal-dialog/pop-select-modal-dialog.component';
import { PopButtonComponent } from './pop-button/pop-button.component';
import { PopFieldItemComponent } from './pop-field-item.component';
import { PopMinMaxComponent } from './pop-min-max/pop-min-max.component';
import { PopSliderComponent } from './pop-slider/pop-slider.component';
import { PopNumberComponent } from './pop-number/pop-number.component';
import { PopFieldItemLoaderComponent } from './asset/pop-field-item-loader.component';
import { PopFieldItemHelperComponent } from './asset/pop-field-item-helper.component';
import { PopFieldItemErrorComponent } from './asset/pop-field-item-error.component';
import { PopTextComponent } from './pop-text/pop-text.component';
import { DateRangePanelComponent } from './pop-date/pop-date-range/expansion-items/custom-panel/date-range-panel.component';
import { PopDatePickerComponent } from './pop-datepicker/pop-datepicker.component';

const options: Partial<IConfig> | ( () => Partial<IConfig> ) = undefined;


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PopIndicatorsModule,
    MaterialModule,
    FormsModule,
    NgxMaskModule.forRoot(options)
  ],
  declarations: [
    PopFieldItemLoaderComponent,
    PopFieldItemHelperComponent,
    PopFieldItemErrorComponent,
    PopFieldItemComponent,
    PopButtonComponent,
    PopInputComponent,
    PopNumberComponent,
    PopSelectComponent,
    PopCheckboxComponent,
    PopSelectMultiComponent,
    PopSelectFilterComponent,
    PopSelectListComponent,
    PopSelectModalComponent,
    PopSelectModalDialogComponent,
    PopRadioComponent,
    PopSwitchComponent,
    PopTextareaComponent,
    PopLabelComponent,
    PopDateComponent,
    PopDateRangeComponent,
    DateRangeExpansionItemsComponent,
    ExpansionItemsComponent,
    CustomPanelComponent,
    DateRangePanelComponent,
    PopTimeComponent,
    ClickOutsideDirective,
    PopButtonComponent,
    PopMinMaxComponent,
    PopSliderComponent,
    PopTextComponent,
    PopDatePickerComponent
  ],
  exports: [
    PopFieldItemLoaderComponent,
    PopFieldItemHelperComponent,
    PopFieldItemErrorComponent,
    PopFieldItemComponent,
    PopButtonComponent,
    PopInputComponent,
    PopNumberComponent,
    PopSelectComponent,
    PopSelectMultiComponent,
    PopSelectFilterComponent,
    PopSelectListComponent,
    PopSelectModalComponent,
    PopSelectModalDialogComponent,
    PopCheckboxComponent,
    PopRadioComponent,
    PopSwitchComponent,
    PopTextareaComponent,
    PopDateComponent,
    PopDateRangeComponent,
    DateRangeExpansionItemsComponent,
    ExpansionItemsComponent,
    DateRangePanelComponent,
    CustomPanelComponent,
    PopTimeComponent,
    PopLabelComponent,
    PopButtonComponent,
    PopMinMaxComponent,
    PopSliderComponent,
    PopTextComponent,
    PopDatePickerComponent
  ],
  providers: [],

})
export class PopFieldItemModule {
}
