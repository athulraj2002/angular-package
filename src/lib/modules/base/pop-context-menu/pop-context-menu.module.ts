import { NgModule } from '@angular/core';
import { MaterialModule } from '../../material/material.module';
import { CommonModule } from '@angular/common';
import { PopContextMenuComponent } from './pop-context-menu.component';


@NgModule({
  declarations: [
      PopContextMenuComponent
  ],
  imports: [
    MaterialModule,
    CommonModule
  ],
  exports: [
      PopContextMenuComponent
  ],
})
export class PopContextMenuModule {}

