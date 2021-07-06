import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material/material.module';
import { PopErrorRedirectComponent } from './pop-error-redirect/pop-error-redirect.component';
import { PopCacheRedirectComponent } from './pop-cache-redirect/pop-cache-redirect.component';
import { PopIndicatorsModule } from '../pop-indicators/pop-indicators.module';
import { PopGuardRedirectComponent } from './pop-guard-redirect/pop-guard-redirect.component';


@NgModule({
  declarations: [
    PopErrorRedirectComponent,
    PopCacheRedirectComponent,
    PopGuardRedirectComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    PopIndicatorsModule
  ],
  providers: [],
  exports: [
    PopErrorRedirectComponent,
    PopCacheRedirectComponent,
    PopGuardRedirectComponent
  ]
})
export class PopRedirectsModule {
}
