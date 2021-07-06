import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopWidgetBarComponent } from './pop-widget-bar.component';
import { MatButtonModule } from '@angular/material/button';


@NgModule( {
  imports: [
    CommonModule,
    MatButtonModule
  ],
  declarations: [
    PopWidgetBarComponent,
  ],
  exports: [
    PopWidgetBarComponent,
  ],
  providers: [],
} )
export class PopWidgetBarModule{
}
