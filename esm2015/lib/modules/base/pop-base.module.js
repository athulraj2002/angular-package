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
export class PopBaseModule {
}
PopBaseModule.decorators = [
    { type: NgModule, args: [{
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
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWJhc2UubW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvYmFzZS9wb3AtYmFzZS5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUNoRSxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUUvRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUN0RSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUM1RSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDaEUsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFDN0UsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBQ2pFLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLG9EQUFvRCxDQUFDO0FBQzdGLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLDRDQUE0QyxDQUFDO0FBQ2pGLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUM5RCxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSwwQ0FBMEMsQ0FBQztBQUMvRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUNwRSxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSw0Q0FBNEMsQ0FBQztBQXVCbEYsTUFBTSxPQUFPLGFBQWE7OztZQXBCekIsUUFBUSxTQUFDO2dCQUNSLE9BQU8sRUFBRSxFQUFFO2dCQUNYLFlBQVksRUFBRTtvQkFDWixrQkFBa0I7b0JBQ2xCLHlCQUF5QjtpQkFDMUI7Z0JBQ0QsT0FBTyxFQUFFO29CQUNQLGdCQUFnQjtvQkFDaEIsa0JBQWtCO29CQUNsQixhQUFhO29CQUNiLGNBQWM7b0JBQ2QsbUJBQW1CO29CQUNuQixlQUFlO29CQUNmLHVCQUF1QjtvQkFDdkIsbUJBQW1CO29CQUNuQixtQkFBbUI7b0JBQ25CLGdCQUFnQjtvQkFDaEIsb0JBQW9CO2lCQUNyQjthQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmdNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFBvcEV4dGVuZENvbXBvbmVudCB9IGZyb20gJy4uLy4uL3BvcC1leHRlbmQuY29tcG9uZW50JztcbmltcG9ydCB7IFBvcEV4dGVuZER5bmFtaWNDb21wb25lbnQgfSBmcm9tICcuLi8uLi9wb3AtZXh0ZW5kLWR5bmFtaWMuY29tcG9uZW50JztcblxuaW1wb3J0IHsgUG9wVGFiTWVudU1vZHVsZSB9IGZyb20gJy4vcG9wLXRhYi1tZW51L3BvcC10YWItbWVudS5tb2R1bGUnO1xuaW1wb3J0IHsgUG9wRmllbGRJdGVtTW9kdWxlIH0gZnJvbSAnLi9wb3AtZmllbGQtaXRlbS9wb3AtZmllbGQtaXRlbS5tb2R1bGUnO1xuaW1wb3J0IHsgUG9wTWVudU1vZHVsZSB9IGZyb20gJy4uL2FwcC9wb3AtbWVudS9wb3AtbWVudS5tb2R1bGUnO1xuaW1wb3J0IHsgUG9wSW5kaWNhdG9yc01vZHVsZSB9IGZyb20gJy4vcG9wLWluZGljYXRvcnMvcG9wLWluZGljYXRvcnMubW9kdWxlJztcbmltcG9ydCB7IFBvcEVycm9yc01vZHVsZSB9IGZyb20gJy4vcG9wLWVycm9ycy9wb3AtZXJyb3JzLm1vZHVsZSc7XG5pbXBvcnQgeyBQb3BGaWVsZEl0ZW1Hcm91cE1vZHVsZSB9IGZyb20gJy4vcG9wLWZpZWxkLWl0ZW0tZ3JvdXAvcG9wLWZpZWxkLWl0ZW0tZ3JvdXAubW9kdWxlJztcbmltcG9ydCB7IFBvcFNpZGVCeVNpZGVNb2R1bGUgfSBmcm9tICcuL3BvcC1zaWRlLWJ5LXNpZGUvcG9wLXNpZGUtYnktc2lkZS5tb2R1bGUnO1xuaW1wb3J0IHsgUG9wVGFibGVNb2R1bGUgfSBmcm9tICcuL3BvcC10YWJsZS9wb3AtdGFibGUubW9kdWxlJztcbmltcG9ydCB7IFBvcEFqYXhEaWFsb2dNb2R1bGUgfSBmcm9tICcuL3BvcC1hamF4LWRpYWxvZy9wb3AtYWpheC1kaWFsb2cubW9kdWxlJztcbmltcG9ydCB7IFBvcERpYWxvZ3NNb2R1bGUgfSBmcm9tICcuL3BvcC1kaWFsb2dzL3BvcC1kaWFsb2dzLm1vZHVsZSc7XG5pbXBvcnQgeyBQb3BDb250ZXh0TWVudU1vZHVsZSB9IGZyb20gJy4vcG9wLWNvbnRleHQtbWVudS9wb3AtY29udGV4dC1tZW51Lm1vZHVsZSc7XG5pbXBvcnQgeyBEaWFsb2dDb21wb25lbnQgfSBmcm9tICcuL3BvcC1hamF4LWRpYWxvZy9kaWFsb2cvZGlhbG9nLmNvbXBvbmVudCc7XG5cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFtdLFxuICBkZWNsYXJhdGlvbnM6IFtcbiAgICBQb3BFeHRlbmRDb21wb25lbnQsXG4gICAgUG9wRXh0ZW5kRHluYW1pY0NvbXBvbmVudCxcbiAgXSxcbiAgZXhwb3J0czogW1xuICAgIFBvcFRhYk1lbnVNb2R1bGUsXG4gICAgUG9wRmllbGRJdGVtTW9kdWxlLFxuICAgIFBvcE1lbnVNb2R1bGUsXG4gICAgUG9wVGFibGVNb2R1bGUsXG4gICAgUG9wSW5kaWNhdG9yc01vZHVsZSxcbiAgICBQb3BFcnJvcnNNb2R1bGUsXG4gICAgUG9wRmllbGRJdGVtR3JvdXBNb2R1bGUsXG4gICAgUG9wU2lkZUJ5U2lkZU1vZHVsZSxcbiAgICBQb3BBamF4RGlhbG9nTW9kdWxlLFxuICAgIFBvcERpYWxvZ3NNb2R1bGUsXG4gICAgUG9wQ29udGV4dE1lbnVNb2R1bGUsXG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIFBvcEJhc2VNb2R1bGUge1xuXG59XG4iXX0=