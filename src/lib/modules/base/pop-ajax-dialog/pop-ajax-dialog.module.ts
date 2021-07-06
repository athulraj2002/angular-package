import { NgModule } from "@angular/core";
import { MaterialModule } from '../../material/material.module';
import { PopAjaxDialogComponent } from "./pop-ajax-dialog.component";
import { DialogComponent } from "./dialog/dialog.component";
import { PopIndicatorsModule } from "../pop-indicators/pop-indicators.module";
import { CommonModule } from "@angular/common";


@NgModule({
  imports: [
    MaterialModule,
    PopIndicatorsModule,
    CommonModule
  ],
    declarations: [
        PopAjaxDialogComponent,
        DialogComponent,
    ],
    exports: [
        PopAjaxDialogComponent,
    ],
})
export class PopAjaxDialogModule {
}
