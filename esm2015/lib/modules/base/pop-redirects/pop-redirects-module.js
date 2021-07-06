import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material/material.module';
import { PopErrorRedirectComponent } from './pop-error-redirect/pop-error-redirect.component';
import { PopCacheRedirectComponent } from './pop-cache-redirect/pop-cache-redirect.component';
import { PopIndicatorsModule } from '../pop-indicators/pop-indicators.module';
import { PopGuardRedirectComponent } from './pop-guard-redirect/pop-guard-redirect.component';
export class PopRedirectsModule {
}
PopRedirectsModule.decorators = [
    { type: NgModule, args: [{
                declarations: [
                    PopErrorRedirectComponent,
                    PopCacheRedirectComponent,
                    PopGuardRedirectComponent
                ],
                imports: [
                    CommonModule,
                    MaterialModule,
                    PopIndicatorsModule
                ],
                providers: [],
                exports: [
                    PopErrorRedirectComponent,
                    PopCacheRedirectComponent,
                    PopGuardRedirectComponent
                ]
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLXJlZGlyZWN0cy1tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9iYXNlL3BvcC1yZWRpcmVjdHMvcG9wLXJlZGlyZWN0cy1tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDL0MsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBQ2hFLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLG1EQUFtRCxDQUFDO0FBQzlGLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLG1EQUFtRCxDQUFDO0FBQzlGLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBQzlFLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLG1EQUFtRCxDQUFDO0FBcUI5RixNQUFNLE9BQU8sa0JBQWtCOzs7WUFsQjlCLFFBQVEsU0FBQztnQkFDUixZQUFZLEVBQUU7b0JBQ1oseUJBQXlCO29CQUN6Qix5QkFBeUI7b0JBQ3pCLHlCQUF5QjtpQkFDMUI7Z0JBQ0QsT0FBTyxFQUFFO29CQUNQLFlBQVk7b0JBQ1osY0FBYztvQkFDZCxtQkFBbUI7aUJBQ3BCO2dCQUNELFNBQVMsRUFBRSxFQUFFO2dCQUNiLE9BQU8sRUFBRTtvQkFDUCx5QkFBeUI7b0JBQ3pCLHlCQUF5QjtvQkFDekIseUJBQXlCO2lCQUMxQjthQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmdNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IENvbW1vbk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQgeyBNYXRlcmlhbE1vZHVsZSB9IGZyb20gJy4uLy4uL21hdGVyaWFsL21hdGVyaWFsLm1vZHVsZSc7XG5pbXBvcnQgeyBQb3BFcnJvclJlZGlyZWN0Q29tcG9uZW50IH0gZnJvbSAnLi9wb3AtZXJyb3ItcmVkaXJlY3QvcG9wLWVycm9yLXJlZGlyZWN0LmNvbXBvbmVudCc7XG5pbXBvcnQgeyBQb3BDYWNoZVJlZGlyZWN0Q29tcG9uZW50IH0gZnJvbSAnLi9wb3AtY2FjaGUtcmVkaXJlY3QvcG9wLWNhY2hlLXJlZGlyZWN0LmNvbXBvbmVudCc7XG5pbXBvcnQgeyBQb3BJbmRpY2F0b3JzTW9kdWxlIH0gZnJvbSAnLi4vcG9wLWluZGljYXRvcnMvcG9wLWluZGljYXRvcnMubW9kdWxlJztcbmltcG9ydCB7IFBvcEd1YXJkUmVkaXJlY3RDb21wb25lbnQgfSBmcm9tICcuL3BvcC1ndWFyZC1yZWRpcmVjdC9wb3AtZ3VhcmQtcmVkaXJlY3QuY29tcG9uZW50JztcblxuXG5ATmdNb2R1bGUoe1xuICBkZWNsYXJhdGlvbnM6IFtcbiAgICBQb3BFcnJvclJlZGlyZWN0Q29tcG9uZW50LFxuICAgIFBvcENhY2hlUmVkaXJlY3RDb21wb25lbnQsXG4gICAgUG9wR3VhcmRSZWRpcmVjdENvbXBvbmVudFxuICBdLFxuICBpbXBvcnRzOiBbXG4gICAgQ29tbW9uTW9kdWxlLFxuICAgIE1hdGVyaWFsTW9kdWxlLFxuICAgIFBvcEluZGljYXRvcnNNb2R1bGVcbiAgXSxcbiAgcHJvdmlkZXJzOiBbXSxcbiAgZXhwb3J0czogW1xuICAgIFBvcEVycm9yUmVkaXJlY3RDb21wb25lbnQsXG4gICAgUG9wQ2FjaGVSZWRpcmVjdENvbXBvbmVudCxcbiAgICBQb3BHdWFyZFJlZGlyZWN0Q29tcG9uZW50XG4gIF1cbn0pXG5leHBvcnQgY2xhc3MgUG9wUmVkaXJlY3RzTW9kdWxlIHtcbn1cbiJdfQ==