import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopSideBySideComponent } from './pop-side-by-side.component';
import { MaterialModule } from '../../material/material.module';
import { PopFieldItemModule } from '../pop-field-item/pop-field-item.module';
import { PopIndicatorsModule } from '../pop-indicators/pop-indicators.module';
import { RouterModule } from '@angular/router';
import { PopContextMenuModule } from '../pop-context-menu/pop-context-menu.module';
import { CharacterIconPipe } from '../../../pipes/characterIcon.pipe';
export class PopSideBySideModule {
}
PopSideBySideModule.decorators = [
    { type: NgModule, args: [{
                declarations: [
                    PopSideBySideComponent,
                    CharacterIconPipe
                ],
                imports: [
                    CommonModule,
                    MaterialModule,
                    RouterModule,
                    PopFieldItemModule,
                    PopIndicatorsModule,
                    PopContextMenuModule,
                ],
                exports: [
                    PopSideBySideComponent
                ]
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLXNpZGUtYnktc2lkZS5tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9iYXNlL3BvcC1zaWRlLWJ5LXNpZGUvcG9wLXNpZGUtYnktc2lkZS5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDL0MsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDdEUsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBQ2hFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBQzdFLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBQzlFLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUMvQyxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSw2Q0FBNkMsQ0FBQztBQUNuRixPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQztBQW9CdEUsTUFBTSxPQUFPLG1CQUFtQjs7O1lBbEIvQixRQUFRLFNBQUM7Z0JBQ1IsWUFBWSxFQUFFO29CQUNaLHNCQUFzQjtvQkFDdEIsaUJBQWlCO2lCQUNsQjtnQkFDRCxPQUFPLEVBQUU7b0JBQ1AsWUFBWTtvQkFDWixjQUFjO29CQUNkLFlBQVk7b0JBQ1osa0JBQWtCO29CQUNsQixtQkFBbUI7b0JBQ25CLG9CQUFvQjtpQkFFckI7Z0JBQ0QsT0FBTyxFQUFFO29CQUNQLHNCQUFzQjtpQkFDdkI7YUFDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5nTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBDb21tb25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHsgUG9wU2lkZUJ5U2lkZUNvbXBvbmVudCB9IGZyb20gJy4vcG9wLXNpZGUtYnktc2lkZS5jb21wb25lbnQnO1xuaW1wb3J0IHsgTWF0ZXJpYWxNb2R1bGUgfSBmcm9tICcuLi8uLi9tYXRlcmlhbC9tYXRlcmlhbC5tb2R1bGUnO1xuaW1wb3J0IHsgUG9wRmllbGRJdGVtTW9kdWxlIH0gZnJvbSAnLi4vcG9wLWZpZWxkLWl0ZW0vcG9wLWZpZWxkLWl0ZW0ubW9kdWxlJztcbmltcG9ydCB7IFBvcEluZGljYXRvcnNNb2R1bGUgfSBmcm9tICcuLi9wb3AtaW5kaWNhdG9ycy9wb3AtaW5kaWNhdG9ycy5tb2R1bGUnO1xuaW1wb3J0IHsgUm91dGVyTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcbmltcG9ydCB7IFBvcENvbnRleHRNZW51TW9kdWxlIH0gZnJvbSAnLi4vcG9wLWNvbnRleHQtbWVudS9wb3AtY29udGV4dC1tZW51Lm1vZHVsZSc7XG5pbXBvcnQgeyBDaGFyYWN0ZXJJY29uUGlwZSB9IGZyb20gJy4uLy4uLy4uL3BpcGVzL2NoYXJhY3Rlckljb24ucGlwZSc7XG5cbkBOZ01vZHVsZSh7XG4gIGRlY2xhcmF0aW9uczogW1xuICAgIFBvcFNpZGVCeVNpZGVDb21wb25lbnQsXG4gICAgQ2hhcmFjdGVySWNvblBpcGVcbiAgXSxcbiAgaW1wb3J0czogW1xuICAgIENvbW1vbk1vZHVsZSxcbiAgICBNYXRlcmlhbE1vZHVsZSxcbiAgICBSb3V0ZXJNb2R1bGUsXG4gICAgUG9wRmllbGRJdGVtTW9kdWxlLFxuICAgIFBvcEluZGljYXRvcnNNb2R1bGUsXG4gICAgUG9wQ29udGV4dE1lbnVNb2R1bGUsXG5cbiAgXSxcbiAgZXhwb3J0czogW1xuICAgIFBvcFNpZGVCeVNpZGVDb21wb25lbnRcbiAgXVxufSlcbmV4cG9ydCBjbGFzcyBQb3BTaWRlQnlTaWRlTW9kdWxlIHtcbn1cbiJdfQ==