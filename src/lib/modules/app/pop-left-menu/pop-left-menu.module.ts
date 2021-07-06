import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PopLeftMenuComponent} from './pop-left-menu.component';
import { PopIndicatorsModule } from '../../base/pop-indicators/pop-indicators.module';

@NgModule({
    declarations: [
        PopLeftMenuComponent,
    ],
    imports: [
        CommonModule,
        RouterModule,
        MatRippleModule,
        MatIconModule,
        MatTooltipModule,
        MatListModule,
        MatButtonModule,
        PopIndicatorsModule
    ],
    exports: [
        PopLeftMenuComponent,
    ],
    providers: [
    ],

})
export class PopLeftMenuModule {
}
