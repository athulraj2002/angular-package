import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { PopTabMenuComponent } from './pop-tab-menu.component';
import { PopIndicatorsModule } from '../pop-indicators/pop-indicators.module';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PopTabMenuSectionBarComponent } from './pop-tab-menu-section-bar/pop-tab-menu-section-bar.component';
export class PopTabMenuModule {
}
PopTabMenuModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    CommonModule,
                    HttpClientModule,
                    RouterModule,
                    MatIconModule,
                    MatTabsModule,
                    MatButtonModule,
                    MatProgressBarModule,
                    PopIndicatorsModule,
                ],
                declarations: [
                    PopTabMenuComponent,
                    PopTabMenuSectionBarComponent
                ],
                exports: [
                    PopTabMenuComponent
                ],
                providers: [],
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLXRhYi1tZW51Lm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2Jhc2UvcG9wLXRhYi1tZW51L3BvcC10YWItbWVudS5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDL0MsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ3hELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUN2RCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDdkQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQzNELE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQy9ELE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBQzlFLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBQ3RFLE9BQU8sRUFBRSw2QkFBNkIsRUFBRSxNQUFNLCtEQUErRCxDQUFDO0FBd0I5RyxNQUFNLE9BQU8sZ0JBQWdCOzs7WUFyQjVCLFFBQVEsU0FBQztnQkFDUixPQUFPLEVBQUU7b0JBQ1AsWUFBWTtvQkFDWixnQkFBZ0I7b0JBQ2hCLFlBQVk7b0JBQ1osYUFBYTtvQkFDYixhQUFhO29CQUNiLGVBQWU7b0JBQ2Ysb0JBQW9CO29CQUNwQixtQkFBbUI7aUJBQ3BCO2dCQUNELFlBQVksRUFBRTtvQkFDWixtQkFBbUI7b0JBQ25CLDZCQUE2QjtpQkFDOUI7Z0JBQ0QsT0FBTyxFQUFFO29CQUNQLG1CQUFtQjtpQkFDcEI7Z0JBQ0QsU0FBUyxFQUFFLEVBQUU7YUFFZCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5nTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBDb21tb25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHsgUm91dGVyTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcbmltcG9ydCB7IEh0dHBDbGllbnRNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5pbXBvcnQgeyBNYXRJY29uTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvaWNvbic7XG5pbXBvcnQgeyBNYXRUYWJzTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvdGFicyc7XG5pbXBvcnQgeyBNYXRCdXR0b25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9idXR0b24nO1xuaW1wb3J0IHsgUG9wVGFiTWVudUNvbXBvbmVudCB9IGZyb20gJy4vcG9wLXRhYi1tZW51LmNvbXBvbmVudCc7XG5pbXBvcnQgeyBQb3BJbmRpY2F0b3JzTW9kdWxlIH0gZnJvbSAnLi4vcG9wLWluZGljYXRvcnMvcG9wLWluZGljYXRvcnMubW9kdWxlJztcbmltcG9ydCB7IE1hdFByb2dyZXNzQmFyTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvcHJvZ3Jlc3MtYmFyJztcbmltcG9ydCB7IFBvcFRhYk1lbnVTZWN0aW9uQmFyQ29tcG9uZW50IH0gZnJvbSAnLi9wb3AtdGFiLW1lbnUtc2VjdGlvbi1iYXIvcG9wLXRhYi1tZW51LXNlY3Rpb24tYmFyLmNvbXBvbmVudCc7XG5cblxuQE5nTW9kdWxlKHtcbiAgaW1wb3J0czogW1xuICAgIENvbW1vbk1vZHVsZSxcbiAgICBIdHRwQ2xpZW50TW9kdWxlLFxuICAgIFJvdXRlck1vZHVsZSxcbiAgICBNYXRJY29uTW9kdWxlLFxuICAgIE1hdFRhYnNNb2R1bGUsXG4gICAgTWF0QnV0dG9uTW9kdWxlLFxuICAgIE1hdFByb2dyZXNzQmFyTW9kdWxlLFxuICAgIFBvcEluZGljYXRvcnNNb2R1bGUsXG4gIF0sXG4gIGRlY2xhcmF0aW9uczogW1xuICAgIFBvcFRhYk1lbnVDb21wb25lbnQsXG4gICAgUG9wVGFiTWVudVNlY3Rpb25CYXJDb21wb25lbnRcbiAgXSxcbiAgZXhwb3J0czogW1xuICAgIFBvcFRhYk1lbnVDb21wb25lbnRcbiAgXSxcbiAgcHJvdmlkZXJzOiBbXSxcblxufSlcbmV4cG9ydCBjbGFzcyBQb3BUYWJNZW51TW9kdWxlIHtcbn1cbiJdfQ==