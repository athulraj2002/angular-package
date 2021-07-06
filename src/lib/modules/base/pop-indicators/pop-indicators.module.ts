import { NgModule } from "@angular/core";
import {MaterialModule} from '../../material/material.module';
import {MainSpinnerComponent} from './main-spinner.component';

@NgModule({
  declarations: [MainSpinnerComponent],
  imports: [MaterialModule],
  exports: [MainSpinnerComponent],
})
export class PopIndicatorsModule { }
