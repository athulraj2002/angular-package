import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopWidgetBarComponent } from './pop-widget-bar.component';
import { MatButtonModule } from '@angular/material/button';
export class PopWidgetBarModule {
}
PopWidgetBarModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    CommonModule,
                    MatButtonModule
                ],
                declarations: [
                    PopWidgetBarComponent,
                ],
                exports: [
                    PopWidgetBarComponent,
                ],
                providers: [],
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLXdpZGdldC1iYXIubW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvYXBwL3BvcC13aWRnZXQtYmFyL3BvcC13aWRnZXQtYmFyLm1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUMvQyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUNuRSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFnQjNELE1BQU0sT0FBTyxrQkFBa0I7OztZQWI5QixRQUFRLFNBQUU7Z0JBQ1QsT0FBTyxFQUFFO29CQUNQLFlBQVk7b0JBQ1osZUFBZTtpQkFDaEI7Z0JBQ0QsWUFBWSxFQUFFO29CQUNaLHFCQUFxQjtpQkFDdEI7Z0JBQ0QsT0FBTyxFQUFFO29CQUNQLHFCQUFxQjtpQkFDdEI7Z0JBQ0QsU0FBUyxFQUFFLEVBQUU7YUFDZCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5nTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBDb21tb25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHsgUG9wV2lkZ2V0QmFyQ29tcG9uZW50IH0gZnJvbSAnLi9wb3Atd2lkZ2V0LWJhci5jb21wb25lbnQnO1xuaW1wb3J0IHsgTWF0QnV0dG9uTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvYnV0dG9uJztcblxuXG5ATmdNb2R1bGUoIHtcbiAgaW1wb3J0czogW1xuICAgIENvbW1vbk1vZHVsZSxcbiAgICBNYXRCdXR0b25Nb2R1bGVcbiAgXSxcbiAgZGVjbGFyYXRpb25zOiBbXG4gICAgUG9wV2lkZ2V0QmFyQ29tcG9uZW50LFxuICBdLFxuICBleHBvcnRzOiBbXG4gICAgUG9wV2lkZ2V0QmFyQ29tcG9uZW50LFxuICBdLFxuICBwcm92aWRlcnM6IFtdLFxufSApXG5leHBvcnQgY2xhc3MgUG9wV2lkZ2V0QmFyTW9kdWxle1xufVxuIl19