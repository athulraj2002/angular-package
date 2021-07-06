import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { PopMenuModule } from './pop-menu/pop-menu.module';
import { PopTemplateComponent } from './pop-template.component';
import { PopLeftMenuModule } from './pop-left-menu/pop-left-menu.module';
import { PopWidgetBarModule } from './pop-widget-bar/pop-widget-bar.module';
import { RouterModule } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { PopIndicatorsModule } from '../base/pop-indicators/pop-indicators.module';
import { PopTemplateAjaxLoaderComponent } from './assets/ajax-loader.component';
import { PopTemplateWelcomeComponent } from './assets/welcome.component';
import { PopTemplateGoodByeComponent } from './assets/goodbye.component';
import { PopTemplateErrorComponent } from './assets/error.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PopTemplateBufferComponent } from './assets/buffer.component';
import { PopCacFilterModule } from './pop-cac-filter/pop-cac-filter.module';
export class PopTemplateModule {
}
PopTemplateModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    CommonModule,
                    RouterModule,
                    HttpClientModule,
                    PopMenuModule,
                    PopLeftMenuModule,
                    PopWidgetBarModule,
                    PopCacFilterModule,
                    MatSnackBarModule,
                    MatProgressBarModule,
                    PopIndicatorsModule
                ],
                declarations: [
                    PopTemplateComponent,
                    PopTemplateAjaxLoaderComponent,
                    PopTemplateWelcomeComponent,
                    PopTemplateGoodByeComponent,
                    PopTemplateErrorComponent,
                    PopTemplateBufferComponent
                ],
                entryComponents: [
                    PopTemplateAjaxLoaderComponent,
                    PopTemplateWelcomeComponent,
                    PopTemplateGoodByeComponent,
                    PopTemplateErrorComponent,
                    PopTemplateBufferComponent
                ],
                exports: [
                    PopMenuModule,
                    PopLeftMenuModule,
                    PopWidgetBarModule,
                    PopTemplateComponent,
                    PopCacFilterModule
                ]
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLXRlbXBsYXRlLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2FwcC9wb3AtdGVtcGxhdGUubW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDekMsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ3hELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUMzRCxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUNoRSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUN6RSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUM1RSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDL0MsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDaEUsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sOENBQThDLENBQUM7QUFDbkYsT0FBTyxFQUFFLDhCQUE4QixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDaEYsT0FBTyxFQUFFLDJCQUEyQixFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDekUsT0FBTyxFQUFFLDJCQUEyQixFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDekUsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDckUsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDdEUsT0FBTyxFQUFFLDBCQUEwQixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDdkUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUF5QzVFLE1BQU0sT0FBTyxpQkFBaUI7OztZQXJDN0IsUUFBUSxTQUFDO2dCQUNSLE9BQU8sRUFBRTtvQkFDUCxZQUFZO29CQUNaLFlBQVk7b0JBQ1osZ0JBQWdCO29CQUNoQixhQUFhO29CQUNiLGlCQUFpQjtvQkFDakIsa0JBQWtCO29CQUNsQixrQkFBa0I7b0JBQ2xCLGlCQUFpQjtvQkFDakIsb0JBQW9CO29CQUNwQixtQkFBbUI7aUJBRXBCO2dCQUNELFlBQVksRUFBRTtvQkFDWixvQkFBb0I7b0JBQ3BCLDhCQUE4QjtvQkFDOUIsMkJBQTJCO29CQUMzQiwyQkFBMkI7b0JBQzNCLHlCQUF5QjtvQkFDekIsMEJBQTBCO2lCQUMzQjtnQkFDRCxlQUFlLEVBQUU7b0JBQ2YsOEJBQThCO29CQUM5QiwyQkFBMkI7b0JBQzNCLDJCQUEyQjtvQkFDM0IseUJBQXlCO29CQUN6QiwwQkFBMEI7aUJBQzNCO2dCQUNELE9BQU8sRUFBRTtvQkFDUCxhQUFhO29CQUNiLGlCQUFpQjtvQkFDakIsa0JBQWtCO29CQUNsQixvQkFBb0I7b0JBQ3BCLGtCQUFrQjtpQkFDbkI7YUFDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5nTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBDb21tb25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHsgSHR0cENsaWVudE1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcbmltcG9ydCB7IFBvcE1lbnVNb2R1bGUgfSBmcm9tICcuL3BvcC1tZW51L3BvcC1tZW51Lm1vZHVsZSc7XG5pbXBvcnQgeyBQb3BUZW1wbGF0ZUNvbXBvbmVudCB9IGZyb20gJy4vcG9wLXRlbXBsYXRlLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBQb3BMZWZ0TWVudU1vZHVsZSB9IGZyb20gJy4vcG9wLWxlZnQtbWVudS9wb3AtbGVmdC1tZW51Lm1vZHVsZSc7XG5pbXBvcnQgeyBQb3BXaWRnZXRCYXJNb2R1bGUgfSBmcm9tICcuL3BvcC13aWRnZXQtYmFyL3BvcC13aWRnZXQtYmFyLm1vZHVsZSc7XG5pbXBvcnQgeyBSb3V0ZXJNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xuaW1wb3J0IHsgTWF0U25hY2tCYXJNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9zbmFjay1iYXInO1xuaW1wb3J0IHsgUG9wSW5kaWNhdG9yc01vZHVsZSB9IGZyb20gJy4uL2Jhc2UvcG9wLWluZGljYXRvcnMvcG9wLWluZGljYXRvcnMubW9kdWxlJztcbmltcG9ydCB7IFBvcFRlbXBsYXRlQWpheExvYWRlckNvbXBvbmVudCB9IGZyb20gJy4vYXNzZXRzL2FqYXgtbG9hZGVyLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBQb3BUZW1wbGF0ZVdlbGNvbWVDb21wb25lbnQgfSBmcm9tICcuL2Fzc2V0cy93ZWxjb21lLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBQb3BUZW1wbGF0ZUdvb2RCeWVDb21wb25lbnQgfSBmcm9tICcuL2Fzc2V0cy9nb29kYnllLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBQb3BUZW1wbGF0ZUVycm9yQ29tcG9uZW50IH0gZnJvbSAnLi9hc3NldHMvZXJyb3IuY29tcG9uZW50JztcbmltcG9ydCB7IE1hdFByb2dyZXNzQmFyTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvcHJvZ3Jlc3MtYmFyJztcbmltcG9ydCB7IFBvcFRlbXBsYXRlQnVmZmVyQ29tcG9uZW50IH0gZnJvbSAnLi9hc3NldHMvYnVmZmVyLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBQb3BDYWNGaWx0ZXJNb2R1bGUgfSBmcm9tICcuL3BvcC1jYWMtZmlsdGVyL3BvcC1jYWMtZmlsdGVyLm1vZHVsZSc7XG5cblxuXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbXG4gICAgQ29tbW9uTW9kdWxlLFxuICAgIFJvdXRlck1vZHVsZSxcbiAgICBIdHRwQ2xpZW50TW9kdWxlLFxuICAgIFBvcE1lbnVNb2R1bGUsXG4gICAgUG9wTGVmdE1lbnVNb2R1bGUsXG4gICAgUG9wV2lkZ2V0QmFyTW9kdWxlLFxuICAgIFBvcENhY0ZpbHRlck1vZHVsZSxcbiAgICBNYXRTbmFja0Jhck1vZHVsZSxcbiAgICBNYXRQcm9ncmVzc0Jhck1vZHVsZSxcbiAgICBQb3BJbmRpY2F0b3JzTW9kdWxlXG5cbiAgXSxcbiAgZGVjbGFyYXRpb25zOiBbXG4gICAgUG9wVGVtcGxhdGVDb21wb25lbnQsXG4gICAgUG9wVGVtcGxhdGVBamF4TG9hZGVyQ29tcG9uZW50LFxuICAgIFBvcFRlbXBsYXRlV2VsY29tZUNvbXBvbmVudCxcbiAgICBQb3BUZW1wbGF0ZUdvb2RCeWVDb21wb25lbnQsXG4gICAgUG9wVGVtcGxhdGVFcnJvckNvbXBvbmVudCxcbiAgICBQb3BUZW1wbGF0ZUJ1ZmZlckNvbXBvbmVudFxuICBdLFxuICBlbnRyeUNvbXBvbmVudHM6IFtcbiAgICBQb3BUZW1wbGF0ZUFqYXhMb2FkZXJDb21wb25lbnQsXG4gICAgUG9wVGVtcGxhdGVXZWxjb21lQ29tcG9uZW50LFxuICAgIFBvcFRlbXBsYXRlR29vZEJ5ZUNvbXBvbmVudCxcbiAgICBQb3BUZW1wbGF0ZUVycm9yQ29tcG9uZW50LFxuICAgIFBvcFRlbXBsYXRlQnVmZmVyQ29tcG9uZW50XG4gIF0sXG4gIGV4cG9ydHM6IFtcbiAgICBQb3BNZW51TW9kdWxlLFxuICAgIFBvcExlZnRNZW51TW9kdWxlLFxuICAgIFBvcFdpZGdldEJhck1vZHVsZSxcbiAgICBQb3BUZW1wbGF0ZUNvbXBvbmVudCxcbiAgICBQb3BDYWNGaWx0ZXJNb2R1bGVcbiAgXVxufSlcbmV4cG9ydCBjbGFzcyBQb3BUZW1wbGF0ZU1vZHVsZSB7XG5cbn1cbiJdfQ==