import { NgModule } from '@angular/core';
import { MaterialModule } from '../../material/material.module';
import { PopIndicatorsModule } from '../pop-indicators/pop-indicators.module';
import { CommonModule } from '@angular/common';
import { PopConfirmationDialogComponent } from './pop-confirmation-dialog/pop-confirmation-dialog.component';
import { PopNavigationDialogComponent } from './pop-navigation-dialog/pop-navigation-dialog.component';
import { PopTableModule } from '../pop-table/pop-table.module';
import { PopErrorsModule } from '../pop-errors/pop-errors.module';
import { PopFieldItemGroupModule } from '../pop-field-item-group/pop-field-item-group.module';
import { PopTableDialogComponent } from './pop-table-dialog/pop-table-dialog.component';
import { PopActionDialogComponent } from './pop-action-dialog/pop-action-dialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PopSuccessDialogComponent } from './pop-success-dialog/pop-success-dialog.component';
import { PopMessageDialogComponent } from './pop-message-dialog/pop-message-dialog.component';
import { PortalModule } from '@angular/cdk/portal';
export class PopDialogsModule {
}
PopDialogsModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    MaterialModule,
                    CommonModule,
                    FormsModule,
                    ReactiveFormsModule,
                    PortalModule,
                    PopIndicatorsModule,
                    PopTableModule,
                    PopErrorsModule,
                    PopFieldItemGroupModule
                ],
                declarations: [
                    PopConfirmationDialogComponent,
                    PopNavigationDialogComponent,
                    PopTableDialogComponent,
                    PopActionDialogComponent,
                    PopSuccessDialogComponent,
                    PopMessageDialogComponent
                ],
                exports: [
                    PopConfirmationDialogComponent,
                    PopNavigationDialogComponent,
                    PopTableDialogComponent,
                    PopActionDialogComponent,
                    PopSuccessDialogComponent,
                    PopMessageDialogComponent
                ],
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWRpYWxvZ3MubW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvYmFzZS9wb3AtZGlhbG9ncy9wb3AtZGlhbG9ncy5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDaEUsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFDOUUsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQy9DLE9BQU8sRUFBRSw4QkFBOEIsRUFBRSxNQUFNLDZEQUE2RCxDQUFDO0FBQzdHLE9BQU8sRUFBRSw0QkFBNEIsRUFBRSxNQUFNLHlEQUF5RCxDQUFDO0FBQ3ZHLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUMvRCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDbEUsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0scURBQXFELENBQUM7QUFDOUYsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sK0NBQStDLENBQUM7QUFDeEYsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0saURBQWlELENBQUM7QUFDM0YsT0FBTyxFQUFFLFdBQVcsRUFBRSxtQkFBbUIsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ2xFLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLG1EQUFtRCxDQUFDO0FBQzlGLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLG1EQUFtRCxDQUFDO0FBQzlGLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQWdDbkQsTUFBTSxPQUFPLGdCQUFnQjs7O1lBN0I1QixRQUFRLFNBQUM7Z0JBQ1IsT0FBTyxFQUFFO29CQUNQLGNBQWM7b0JBQ2QsWUFBWTtvQkFDWixXQUFXO29CQUNYLG1CQUFtQjtvQkFDbkIsWUFBWTtvQkFDWixtQkFBbUI7b0JBQ25CLGNBQWM7b0JBQ2QsZUFBZTtvQkFDZix1QkFBdUI7aUJBQ3hCO2dCQUNELFlBQVksRUFBRTtvQkFDWiw4QkFBOEI7b0JBQzlCLDRCQUE0QjtvQkFDNUIsdUJBQXVCO29CQUN2Qix3QkFBd0I7b0JBQ3hCLHlCQUF5QjtvQkFDekIseUJBQXlCO2lCQUMxQjtnQkFDRCxPQUFPLEVBQUU7b0JBQ1AsOEJBQThCO29CQUM5Qiw0QkFBNEI7b0JBQzVCLHVCQUF1QjtvQkFDdkIsd0JBQXdCO29CQUN4Qix5QkFBeUI7b0JBQ3pCLHlCQUF5QjtpQkFDMUI7YUFDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5nTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBNYXRlcmlhbE1vZHVsZSB9IGZyb20gJy4uLy4uL21hdGVyaWFsL21hdGVyaWFsLm1vZHVsZSc7XG5pbXBvcnQgeyBQb3BJbmRpY2F0b3JzTW9kdWxlIH0gZnJvbSAnLi4vcG9wLWluZGljYXRvcnMvcG9wLWluZGljYXRvcnMubW9kdWxlJztcbmltcG9ydCB7IENvbW1vbk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQgeyBQb3BDb25maXJtYXRpb25EaWFsb2dDb21wb25lbnQgfSBmcm9tICcuL3BvcC1jb25maXJtYXRpb24tZGlhbG9nL3BvcC1jb25maXJtYXRpb24tZGlhbG9nLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBQb3BOYXZpZ2F0aW9uRGlhbG9nQ29tcG9uZW50IH0gZnJvbSAnLi9wb3AtbmF2aWdhdGlvbi1kaWFsb2cvcG9wLW5hdmlnYXRpb24tZGlhbG9nLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBQb3BUYWJsZU1vZHVsZSB9IGZyb20gJy4uL3BvcC10YWJsZS9wb3AtdGFibGUubW9kdWxlJztcbmltcG9ydCB7IFBvcEVycm9yc01vZHVsZSB9IGZyb20gJy4uL3BvcC1lcnJvcnMvcG9wLWVycm9ycy5tb2R1bGUnO1xuaW1wb3J0IHsgUG9wRmllbGRJdGVtR3JvdXBNb2R1bGUgfSBmcm9tICcuLi9wb3AtZmllbGQtaXRlbS1ncm91cC9wb3AtZmllbGQtaXRlbS1ncm91cC5tb2R1bGUnO1xuaW1wb3J0IHsgUG9wVGFibGVEaWFsb2dDb21wb25lbnQgfSBmcm9tICcuL3BvcC10YWJsZS1kaWFsb2cvcG9wLXRhYmxlLWRpYWxvZy5jb21wb25lbnQnO1xuaW1wb3J0IHsgUG9wQWN0aW9uRGlhbG9nQ29tcG9uZW50IH0gZnJvbSAnLi9wb3AtYWN0aW9uLWRpYWxvZy9wb3AtYWN0aW9uLWRpYWxvZy5jb21wb25lbnQnO1xuaW1wb3J0IHsgRm9ybXNNb2R1bGUsIFJlYWN0aXZlRm9ybXNNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5pbXBvcnQgeyBQb3BTdWNjZXNzRGlhbG9nQ29tcG9uZW50IH0gZnJvbSAnLi9wb3Atc3VjY2Vzcy1kaWFsb2cvcG9wLXN1Y2Nlc3MtZGlhbG9nLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBQb3BNZXNzYWdlRGlhbG9nQ29tcG9uZW50IH0gZnJvbSAnLi9wb3AtbWVzc2FnZS1kaWFsb2cvcG9wLW1lc3NhZ2UtZGlhbG9nLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBQb3J0YWxNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jZGsvcG9ydGFsJztcblxuXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbXG4gICAgTWF0ZXJpYWxNb2R1bGUsXG4gICAgQ29tbW9uTW9kdWxlLFxuICAgIEZvcm1zTW9kdWxlLFxuICAgIFJlYWN0aXZlRm9ybXNNb2R1bGUsXG4gICAgUG9ydGFsTW9kdWxlLFxuICAgIFBvcEluZGljYXRvcnNNb2R1bGUsXG4gICAgUG9wVGFibGVNb2R1bGUsXG4gICAgUG9wRXJyb3JzTW9kdWxlLFxuICAgIFBvcEZpZWxkSXRlbUdyb3VwTW9kdWxlXG4gIF0sXG4gIGRlY2xhcmF0aW9uczogW1xuICAgIFBvcENvbmZpcm1hdGlvbkRpYWxvZ0NvbXBvbmVudCxcbiAgICBQb3BOYXZpZ2F0aW9uRGlhbG9nQ29tcG9uZW50LFxuICAgIFBvcFRhYmxlRGlhbG9nQ29tcG9uZW50LFxuICAgIFBvcEFjdGlvbkRpYWxvZ0NvbXBvbmVudCxcbiAgICBQb3BTdWNjZXNzRGlhbG9nQ29tcG9uZW50LFxuICAgIFBvcE1lc3NhZ2VEaWFsb2dDb21wb25lbnRcbiAgXSxcbiAgZXhwb3J0czogW1xuICAgIFBvcENvbmZpcm1hdGlvbkRpYWxvZ0NvbXBvbmVudCxcbiAgICBQb3BOYXZpZ2F0aW9uRGlhbG9nQ29tcG9uZW50LFxuICAgIFBvcFRhYmxlRGlhbG9nQ29tcG9uZW50LFxuICAgIFBvcEFjdGlvbkRpYWxvZ0NvbXBvbmVudCxcbiAgICBQb3BTdWNjZXNzRGlhbG9nQ29tcG9uZW50LFxuICAgIFBvcE1lc3NhZ2VEaWFsb2dDb21wb25lbnRcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgUG9wRGlhbG9nc01vZHVsZSB7fVxuIl19