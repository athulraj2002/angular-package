import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from "@angular/material/button";
import { PopMenuComponent} from './pop-menu.component';
import { PopMenuService } from './pop-menu.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatInputModule} from '@angular/material/input';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    MatMenuModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  declarations: [
    PopMenuComponent,
  ],
  providers: [
    PopMenuService,
  ],
  exports: [
    PopMenuComponent
  ]
})
export class PopMenuModule { }
