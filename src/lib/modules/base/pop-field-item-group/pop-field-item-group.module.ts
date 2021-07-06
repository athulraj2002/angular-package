import { NgModule } from "@angular/core";
import { MaterialModule } from '../../material/material.module';
import { InDialogComponent } from './in-dialog/in-dialog.component';
import { CommonModule } from '@angular/common';
import { PopIndicatorsModule } from '../pop-indicators/pop-indicators.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PopFieldItemModule } from '../pop-field-item/pop-field-item.module';
import { GroupComponent } from './group/group.component';
import { PopSideBySideModule } from '../pop-side-by-side/pop-side-by-side.module';
import { PopFieldItemGroupComponent } from './pop-field-item-group.component';


@NgModule({
  declarations: [
    PopFieldItemGroupComponent,
    InDialogComponent,
    GroupComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    PopIndicatorsModule,
    PopFieldItemModule,
    PopSideBySideModule,
  ],
  exports: [
    PopFieldItemGroupComponent,
  ],
})
export class PopFieldItemGroupModule {
}
