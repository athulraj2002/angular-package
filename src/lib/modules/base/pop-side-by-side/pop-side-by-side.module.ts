import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopSideBySideComponent } from './pop-side-by-side.component';
import { MaterialModule } from '../../material/material.module';
import { PopFieldItemModule } from '../pop-field-item/pop-field-item.module';
import { PopIndicatorsModule } from '../pop-indicators/pop-indicators.module';
import { RouterModule } from '@angular/router';
import { PopContextMenuModule } from '../pop-context-menu/pop-context-menu.module';
import { CharacterIconPipe } from '../../../pipes/characterIcon.pipe';

@NgModule({
  declarations: [
    PopSideBySideComponent,
    CharacterIconPipe
  ],
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule,
    PopFieldItemModule,
    PopIndicatorsModule,
    PopContextMenuModule,

  ],
  exports: [
    PopSideBySideComponent
  ]
})
export class PopSideBySideModule {
}
