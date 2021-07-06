import { NgModule } from '@angular/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../material/material.module';
import { MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { PopTableComponent } from './pop-table.component';
import { PopFieldItemModule } from '../pop-field-item/pop-field-item.module';
import { PopContextMenuModule } from '../pop-context-menu/pop-context-menu.module';
import { PopTableViewComponent } from './pop-table-view/pop-table-view.component';
import { PopTableDialogComponent } from './pop-table-dialog/pop-table-dialog.component';
export class PopTableModule {
}
PopTableModule.decorators = [
    { type: NgModule, args: [{
                declarations: [
                    PopTableComponent,
                    PopTableDialogComponent,
                    PopTableViewComponent,
                ],
                imports: [
                    CommonModule,
                    FormsModule,
                    MaterialModule,
                    MatTableModule,
                    MatDialogModule,
                    MatSortModule,
                    MatPaginatorModule,
                    PopFieldItemModule,
                    PopContextMenuModule,
                    DragDropModule
                ],
                exports: [
                    PopTableComponent,
                    PopTableViewComponent,
                    DragDropModule
                ],
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLXRhYmxlLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2Jhc2UvcG9wLXRhYmxlL3BvcC10YWJsZS5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUV6QyxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDdEQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUM3QyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFFaEUsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQzNELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQ2pFLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUN2RCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDekQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDMUQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFDN0UsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sNkNBQTZDLENBQUM7QUFDbkYsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sMkNBQTJDLENBQUM7QUFDbEYsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sK0NBQStDLENBQUM7QUEyQnhGLE1BQU0sT0FBTyxjQUFjOzs7WUF4QjFCLFFBQVEsU0FBQztnQkFDUixZQUFZLEVBQUU7b0JBQ1osaUJBQWlCO29CQUNqQix1QkFBdUI7b0JBQ3ZCLHFCQUFxQjtpQkFDdEI7Z0JBQ0QsT0FBTyxFQUFFO29CQUNQLFlBQVk7b0JBQ1osV0FBVztvQkFDWCxjQUFjO29CQUNkLGNBQWM7b0JBQ2QsZUFBZTtvQkFDZixhQUFhO29CQUNiLGtCQUFrQjtvQkFDbEIsa0JBQWtCO29CQUNsQixvQkFBb0I7b0JBQ3BCLGNBQWM7aUJBQ2Y7Z0JBQ0QsT0FBTyxFQUFFO29CQUNQLGlCQUFpQjtvQkFDakIscUJBQXFCO29CQUNyQixjQUFjO2lCQUNmO2FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZ01vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge0RyYWdEcm9wTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jZGsvZHJhZy1kcm9wJztcbmltcG9ydCB7IENvbW1vbk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQgeyBGb3Jtc01vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7IE1hdGVyaWFsTW9kdWxlIH0gZnJvbSAnLi4vLi4vbWF0ZXJpYWwvbWF0ZXJpYWwubW9kdWxlJztcblxuaW1wb3J0IHsgTWF0RGlhbG9nTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvZGlhbG9nJztcbmltcG9ydCB7IE1hdFBhZ2luYXRvck1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL3BhZ2luYXRvcic7XG5pbXBvcnQgeyBNYXRTb3J0TW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvc29ydCc7XG5pbXBvcnQgeyBNYXRUYWJsZU1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL3RhYmxlJztcbmltcG9ydCB7IFBvcFRhYmxlQ29tcG9uZW50IH0gZnJvbSAnLi9wb3AtdGFibGUuY29tcG9uZW50JztcbmltcG9ydCB7IFBvcEZpZWxkSXRlbU1vZHVsZSB9IGZyb20gJy4uL3BvcC1maWVsZC1pdGVtL3BvcC1maWVsZC1pdGVtLm1vZHVsZSc7XG5pbXBvcnQgeyBQb3BDb250ZXh0TWVudU1vZHVsZSB9IGZyb20gJy4uL3BvcC1jb250ZXh0LW1lbnUvcG9wLWNvbnRleHQtbWVudS5tb2R1bGUnO1xuaW1wb3J0IHsgUG9wVGFibGVWaWV3Q29tcG9uZW50IH0gZnJvbSAnLi9wb3AtdGFibGUtdmlldy9wb3AtdGFibGUtdmlldy5jb21wb25lbnQnO1xuaW1wb3J0IHsgUG9wVGFibGVEaWFsb2dDb21wb25lbnQgfSBmcm9tICcuL3BvcC10YWJsZS1kaWFsb2cvcG9wLXRhYmxlLWRpYWxvZy5jb21wb25lbnQnO1xuXG5cbkBOZ01vZHVsZSh7XG4gIGRlY2xhcmF0aW9uczogW1xuICAgIFBvcFRhYmxlQ29tcG9uZW50LFxuICAgIFBvcFRhYmxlRGlhbG9nQ29tcG9uZW50LFxuICAgIFBvcFRhYmxlVmlld0NvbXBvbmVudCxcbiAgXSxcbiAgaW1wb3J0czogW1xuICAgIENvbW1vbk1vZHVsZSxcbiAgICBGb3Jtc01vZHVsZSxcbiAgICBNYXRlcmlhbE1vZHVsZSxcbiAgICBNYXRUYWJsZU1vZHVsZSxcbiAgICBNYXREaWFsb2dNb2R1bGUsXG4gICAgTWF0U29ydE1vZHVsZSxcbiAgICBNYXRQYWdpbmF0b3JNb2R1bGUsXG4gICAgUG9wRmllbGRJdGVtTW9kdWxlLFxuICAgIFBvcENvbnRleHRNZW51TW9kdWxlLFxuICAgIERyYWdEcm9wTW9kdWxlXG4gIF0sXG4gIGV4cG9ydHM6IFtcbiAgICBQb3BUYWJsZUNvbXBvbmVudCxcbiAgICBQb3BUYWJsZVZpZXdDb21wb25lbnQsXG4gICAgRHJhZ0Ryb3BNb2R1bGVcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgUG9wVGFibGVNb2R1bGUge1xufVxuIl19