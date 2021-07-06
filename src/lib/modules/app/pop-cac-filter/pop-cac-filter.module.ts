import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PopFieldItemModule } from '../../base/pop-field-item/pop-field-item.module';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PopCacFilterComponent } from './pop-cac-filter.component';
import { PopCacFilterViewComponent } from './pop-cac-filter-view/pop-cac-filter-view.component';


@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ScrollingModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatIconModule,
    MatTooltipModule,
    PopFieldItemModule,
    MatProgressBarModule,
    MatDividerModule
  ],
  declarations: [
    PopCacFilterComponent,
    PopCacFilterViewComponent,
  ],
  exports: [
    PopCacFilterComponent,
    PopCacFilterViewComponent,
  ],
  providers: [],

})
export class PopCacFilterModule {
}
