import { NgModule } from "@angular/core";
import { MaterialModule } from '../../material/material.module';
import { PopErrorsComponent } from './pop-errors.component';
import { ErrorComponent } from './error/error.component';


@NgModule({
    declarations: [
        PopErrorsComponent,
        ErrorComponent,
    ],
    imports: [MaterialModule],
    exports: [
        PopErrorsComponent,
    ],
})
export class PopErrorsModule {
}
