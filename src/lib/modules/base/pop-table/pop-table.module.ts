import { NgModule } from '@angular/core';

import {DragDropModule} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../material/material.module';

import { MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { PopTableComponent } from './pop-table.component';
import { PopFieldItemModule } from '../pop-field-item/pop-field-item.module';
import { PopContextMenuModule } from '../pop-context-menu/pop-context-menu.module';
import { PopTableViewComponent } from './pop-table-view/pop-table-view.component';
import { PopTableDialogComponent } from './pop-table-dialog/pop-table-dialog.component';


@NgModule({
  declarations: [
    PopTableComponent,
    PopTableDialogComponent,
    PopTableViewComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    MatTableModule,
    MatDialogModule,
    MatSortModule,
    MatPaginatorModule,
    PopFieldItemModule,
    PopContextMenuModule,
    DragDropModule
  ],
  exports: [
    PopTableComponent,
    PopTableViewComponent,
    DragDropModule
  ],
})
export class PopTableModule {
}
