import { NgModule } from "@angular/core";
import { MaterialModule } from '../../material/material.module';
import { PopErrorsComponent } from './pop-errors.component';
import { ErrorComponent } from './error/error.component';
export class PopErrorsModule {
}
PopErrorsModule.decorators = [
    { type: NgModule, args: [{
                declarations: [
                    PopErrorsComponent,
                    ErrorComponent,
                ],
                imports: [MaterialModule],
                exports: [
                    PopErrorsComponent,
                ],
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVycm9ycy5tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9iYXNlL3BvcC1lcnJvcnMvcG9wLWVycm9ycy5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDaEUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDNUQsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBYXpELE1BQU0sT0FBTyxlQUFlOzs7WUFWM0IsUUFBUSxTQUFDO2dCQUNOLFlBQVksRUFBRTtvQkFDVixrQkFBa0I7b0JBQ2xCLGNBQWM7aUJBQ2pCO2dCQUNELE9BQU8sRUFBRSxDQUFDLGNBQWMsQ0FBQztnQkFDekIsT0FBTyxFQUFFO29CQUNMLGtCQUFrQjtpQkFDckI7YUFDSiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5nTW9kdWxlIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IE1hdGVyaWFsTW9kdWxlIH0gZnJvbSAnLi4vLi4vbWF0ZXJpYWwvbWF0ZXJpYWwubW9kdWxlJztcbmltcG9ydCB7IFBvcEVycm9yc0NvbXBvbmVudCB9IGZyb20gJy4vcG9wLWVycm9ycy5jb21wb25lbnQnO1xuaW1wb3J0IHsgRXJyb3JDb21wb25lbnQgfSBmcm9tICcuL2Vycm9yL2Vycm9yLmNvbXBvbmVudCc7XG5cblxuQE5nTW9kdWxlKHtcbiAgICBkZWNsYXJhdGlvbnM6IFtcbiAgICAgICAgUG9wRXJyb3JzQ29tcG9uZW50LFxuICAgICAgICBFcnJvckNvbXBvbmVudCxcbiAgICBdLFxuICAgIGltcG9ydHM6IFtNYXRlcmlhbE1vZHVsZV0sXG4gICAgZXhwb3J0czogW1xuICAgICAgICBQb3BFcnJvcnNDb21wb25lbnQsXG4gICAgXSxcbn0pXG5leHBvcnQgY2xhc3MgUG9wRXJyb3JzTW9kdWxlIHtcbn1cbiJdfQ==