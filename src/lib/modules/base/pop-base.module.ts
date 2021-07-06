import { NgModule } from '@angular/core';
import { PopExtendComponent } from '../../pop-extend.component';
import { PopExtendDynamicComponent } from '../../pop-extend-dynamic.component';

import { PopTabMenuModule } from './pop-tab-menu/pop-tab-menu.module';
import { PopFieldItemModule } from './pop-field-item/pop-field-item.module';
import { PopMenuModule } from '../app/pop-menu/pop-menu.module';
import { PopIndicatorsModule } from './pop-indicators/pop-indicators.module';
import { PopErrorsModule } from './pop-errors/pop-errors.module';
import { PopFieldItemGroupModule } from './pop-field-item-group/pop-field-item-group.module';
import { PopSideBySideModule } from './pop-side-by-side/pop-side-by-side.module';
import { PopTableModule } from './pop-table/pop-table.module';
import { PopAjaxDialogModule } from './pop-ajax-dialog/pop-ajax-dialog.module';
import { PopDialogsModule } from './pop-dialogs/pop-dialogs.module';
import { PopContextMenuModule } from './pop-context-menu/pop-context-menu.module';
import { DialogComponent } from './pop-ajax-dialog/dialog/dialog.component';

@NgModule({
  imports: [],
  declarations: [
    PopExtendComponent,
    PopExtendDynamicComponent,
  ],
  exports: [
    PopTabMenuModule,
    PopFieldItemModule,
    PopMenuModule,
    PopTableModule,
    PopIndicatorsModule,
    PopErrorsModule,
    PopFieldItemGroupModule,
    PopSideBySideModule,
    PopAjaxDialogModule,
    PopDialogsModule,
    PopContextMenuModule,
  ],
})
export class PopBaseModule {

}
