import { NgModule } from "@angular/core";
import { MaterialModule } from '../../material/material.module';
import { InDialogComponent } from './in-dialog/in-dialog.component';
import { CommonModule } from '@angular/common';
import { PopIndicatorsModule } from '../pop-indicators/pop-indicators.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PopFieldItemModule } from '../pop-field-item/pop-field-item.module';
import { GroupComponent } from './group/group.component';
import { PopSideBySideModule } from '../pop-side-by-side/pop-side-by-side.module';
import { PopFieldItemGroupComponent } from './pop-field-item-group.component';
export class PopFieldItemGroupModule {
}
PopFieldItemGroupModule.decorators = [
    { type: NgModule, args: [{
                declarations: [
                    PopFieldItemGroupComponent,
                    InDialogComponent,
                    GroupComponent
                ],
                imports: [
                    CommonModule,
                    FormsModule,
                    ReactiveFormsModule,
                    MaterialModule,
                    PopIndicatorsModule,
                    PopFieldItemModule,
                    PopSideBySideModule,
                ],
                exports: [
                    PopFieldItemGroupComponent,
                ],
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWZpZWxkLWl0ZW0tZ3JvdXAubW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvYmFzZS9wb3AtZmllbGQtaXRlbS1ncm91cC9wb3AtZmllbGQtaXRlbS1ncm91cC5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDaEUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDcEUsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBQzlFLE9BQU8sRUFBRSxXQUFXLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUNsRSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSx5Q0FBeUMsQ0FBQztBQUM3RSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDekQsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sNkNBQTZDLENBQUM7QUFDbEYsT0FBTyxFQUFFLDBCQUEwQixFQUFFLE1BQU0sa0NBQWtDLENBQUM7QUFzQjlFLE1BQU0sT0FBTyx1QkFBdUI7OztZQW5CbkMsUUFBUSxTQUFDO2dCQUNSLFlBQVksRUFBRTtvQkFDWiwwQkFBMEI7b0JBQzFCLGlCQUFpQjtvQkFDakIsY0FBYztpQkFDZjtnQkFDRCxPQUFPLEVBQUU7b0JBQ1AsWUFBWTtvQkFDWixXQUFXO29CQUNYLG1CQUFtQjtvQkFDbkIsY0FBYztvQkFDZCxtQkFBbUI7b0JBQ25CLGtCQUFrQjtvQkFDbEIsbUJBQW1CO2lCQUNwQjtnQkFDRCxPQUFPLEVBQUU7b0JBQ1AsMEJBQTBCO2lCQUMzQjthQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmdNb2R1bGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgTWF0ZXJpYWxNb2R1bGUgfSBmcm9tICcuLi8uLi9tYXRlcmlhbC9tYXRlcmlhbC5tb2R1bGUnO1xuaW1wb3J0IHsgSW5EaWFsb2dDb21wb25lbnQgfSBmcm9tICcuL2luLWRpYWxvZy9pbi1kaWFsb2cuY29tcG9uZW50JztcbmltcG9ydCB7IENvbW1vbk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQgeyBQb3BJbmRpY2F0b3JzTW9kdWxlIH0gZnJvbSAnLi4vcG9wLWluZGljYXRvcnMvcG9wLWluZGljYXRvcnMubW9kdWxlJztcbmltcG9ydCB7IEZvcm1zTW9kdWxlLCBSZWFjdGl2ZUZvcm1zTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHsgUG9wRmllbGRJdGVtTW9kdWxlIH0gZnJvbSAnLi4vcG9wLWZpZWxkLWl0ZW0vcG9wLWZpZWxkLWl0ZW0ubW9kdWxlJztcbmltcG9ydCB7IEdyb3VwQ29tcG9uZW50IH0gZnJvbSAnLi9ncm91cC9ncm91cC5jb21wb25lbnQnO1xuaW1wb3J0IHsgUG9wU2lkZUJ5U2lkZU1vZHVsZSB9IGZyb20gJy4uL3BvcC1zaWRlLWJ5LXNpZGUvcG9wLXNpZGUtYnktc2lkZS5tb2R1bGUnO1xuaW1wb3J0IHsgUG9wRmllbGRJdGVtR3JvdXBDb21wb25lbnQgfSBmcm9tICcuL3BvcC1maWVsZC1pdGVtLWdyb3VwLmNvbXBvbmVudCc7XG5cblxuQE5nTW9kdWxlKHtcbiAgZGVjbGFyYXRpb25zOiBbXG4gICAgUG9wRmllbGRJdGVtR3JvdXBDb21wb25lbnQsXG4gICAgSW5EaWFsb2dDb21wb25lbnQsXG4gICAgR3JvdXBDb21wb25lbnRcbiAgXSxcbiAgaW1wb3J0czogW1xuICAgIENvbW1vbk1vZHVsZSxcbiAgICBGb3Jtc01vZHVsZSxcbiAgICBSZWFjdGl2ZUZvcm1zTW9kdWxlLFxuICAgIE1hdGVyaWFsTW9kdWxlLFxuICAgIFBvcEluZGljYXRvcnNNb2R1bGUsXG4gICAgUG9wRmllbGRJdGVtTW9kdWxlLFxuICAgIFBvcFNpZGVCeVNpZGVNb2R1bGUsXG4gIF0sXG4gIGV4cG9ydHM6IFtcbiAgICBQb3BGaWVsZEl0ZW1Hcm91cENvbXBvbmVudCxcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgUG9wRmllbGRJdGVtR3JvdXBNb2R1bGUge1xufVxuIl19