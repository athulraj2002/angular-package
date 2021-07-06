import { NgModule } from '@angular/core';
import { MaterialModule } from '../../material/material.module';
import { PopIndicatorsModule } from '../pop-indicators/pop-indicators.module';
import { CommonModule } from '@angular/common';
import { PopConfirmationDialogComponent } from './pop-confirmation-dialog/pop-confirmation-dialog.component';
import { PopNavigationDialogComponent } from './pop-navigation-dialog/pop-navigation-dialog.component';
import { PopTableModule } from '../pop-table/pop-table.module';
import { PopErrorsModule } from '../pop-errors/pop-errors.module';
import { PopFieldItemGroupModule } from '../pop-field-item-group/pop-field-item-group.module';
import { PopTableDialogComponent } from './pop-table-dialog/pop-table-dialog.component';
import { PopActionDialogComponent } from './pop-action-dialog/pop-action-dialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PopSuccessDialogComponent } from './pop-success-dialog/pop-success-dialog.component';
import { PopMessageDialogComponent } from './pop-message-dialog/pop-message-dialog.component';
import { PortalModule } from '@angular/cdk/portal';


@NgModule({
  imports: [
    MaterialModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PortalModule,
    PopIndicatorsModule,
    PopTableModule,
    PopErrorsModule,
    PopFieldItemGroupModule
  ],
  declarations: [
    PopConfirmationDialogComponent,
    PopNavigationDialogComponent,
    PopTableDialogComponent,
    PopActionDialogComponent,
    PopSuccessDialogComponent,
    PopMessageDialogComponent
  ],
  exports: [
    PopConfirmationDialogComponent,
    PopNavigationDialogComponent,
    PopTableDialogComponent,
    PopActionDialogComponent,
    PopSuccessDialogComponent,
    PopMessageDialogComponent
  ],
})
export class PopDialogsModule {}
