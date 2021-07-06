import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { PopTabMenuComponent } from './pop-tab-menu.component';
import { PopIndicatorsModule } from '../pop-indicators/pop-indicators.module';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PopTabMenuSectionBarComponent } from './pop-tab-menu-section-bar/pop-tab-menu-section-bar.component';


@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule,
    MatIconModule,
    MatTabsModule,
    MatButtonModule,
    MatProgressBarModule,
    PopIndicatorsModule,
  ],
  declarations: [
    PopTabMenuComponent,
    PopTabMenuSectionBarComponent
  ],
  exports: [
    PopTabMenuComponent
  ],
  providers: [],

})
export class PopTabMenuModule {
}
