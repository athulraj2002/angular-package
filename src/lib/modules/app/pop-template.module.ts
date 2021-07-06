import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { PopMenuModule } from './pop-menu/pop-menu.module';
import { PopTemplateComponent } from './pop-template.component';
import { PopLeftMenuModule } from './pop-left-menu/pop-left-menu.module';
import { PopWidgetBarModule } from './pop-widget-bar/pop-widget-bar.module';
import { RouterModule } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { PopIndicatorsModule } from '../base/pop-indicators/pop-indicators.module';
import { PopTemplateAjaxLoaderComponent } from './assets/ajax-loader.component';
import { PopTemplateWelcomeComponent } from './assets/welcome.component';
import { PopTemplateGoodByeComponent } from './assets/goodbye.component';
import { PopTemplateErrorComponent } from './assets/error.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PopTemplateBufferComponent } from './assets/buffer.component';
import { PopCacFilterModule } from './pop-cac-filter/pop-cac-filter.module';



@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule,
    PopMenuModule,
    PopLeftMenuModule,
    PopWidgetBarModule,
    PopCacFilterModule,
    MatSnackBarModule,
    MatProgressBarModule,
    PopIndicatorsModule

  ],
  declarations: [
    PopTemplateComponent,
    PopTemplateAjaxLoaderComponent,
    PopTemplateWelcomeComponent,
    PopTemplateGoodByeComponent,
    PopTemplateErrorComponent,
    PopTemplateBufferComponent
  ],
  entryComponents: [
    PopTemplateAjaxLoaderComponent,
    PopTemplateWelcomeComponent,
    PopTemplateGoodByeComponent,
    PopTemplateErrorComponent,
    PopTemplateBufferComponent
  ],
  exports: [
    PopMenuModule,
    PopLeftMenuModule,
    PopWidgetBarModule,
    PopTemplateComponent,
    PopCacFilterModule
  ]
})
export class PopTemplateModule {

}
