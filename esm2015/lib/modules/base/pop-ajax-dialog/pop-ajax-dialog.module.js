import { NgModule } from "@angular/core";
import { MaterialModule } from '../../material/material.module';
import { PopAjaxDialogComponent } from "./pop-ajax-dialog.component";
import { DialogComponent } from "./dialog/dialog.component";
import { PopIndicatorsModule } from "../pop-indicators/pop-indicators.module";
import { CommonModule } from "@angular/common";
export class PopAjaxDialogModule {
}
PopAjaxDialogModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    MaterialModule,
                    PopIndicatorsModule,
                    CommonModule
                ],
                declarations: [
                    PopAjaxDialogComponent,
                    DialogComponent,
                ],
                exports: [
                    PopAjaxDialogComponent,
                ],
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWFqYXgtZGlhbG9nLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2Jhc2UvcG9wLWFqYXgtZGlhbG9nL3BvcC1hamF4LWRpYWxvZy5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDaEUsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDckUsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQzVELE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBQzlFLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQWlCL0MsTUFBTSxPQUFPLG1CQUFtQjs7O1lBZC9CLFFBQVEsU0FBQztnQkFDUixPQUFPLEVBQUU7b0JBQ1AsY0FBYztvQkFDZCxtQkFBbUI7b0JBQ25CLFlBQVk7aUJBQ2I7Z0JBQ0MsWUFBWSxFQUFFO29CQUNWLHNCQUFzQjtvQkFDdEIsZUFBZTtpQkFDbEI7Z0JBQ0QsT0FBTyxFQUFFO29CQUNMLHNCQUFzQjtpQkFDekI7YUFDSiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5nTW9kdWxlIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IE1hdGVyaWFsTW9kdWxlIH0gZnJvbSAnLi4vLi4vbWF0ZXJpYWwvbWF0ZXJpYWwubW9kdWxlJztcbmltcG9ydCB7IFBvcEFqYXhEaWFsb2dDb21wb25lbnQgfSBmcm9tIFwiLi9wb3AtYWpheC1kaWFsb2cuY29tcG9uZW50XCI7XG5pbXBvcnQgeyBEaWFsb2dDb21wb25lbnQgfSBmcm9tIFwiLi9kaWFsb2cvZGlhbG9nLmNvbXBvbmVudFwiO1xuaW1wb3J0IHsgUG9wSW5kaWNhdG9yc01vZHVsZSB9IGZyb20gXCIuLi9wb3AtaW5kaWNhdG9ycy9wb3AtaW5kaWNhdG9ycy5tb2R1bGVcIjtcbmltcG9ydCB7IENvbW1vbk1vZHVsZSB9IGZyb20gXCJAYW5ndWxhci9jb21tb25cIjtcblxuXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbXG4gICAgTWF0ZXJpYWxNb2R1bGUsXG4gICAgUG9wSW5kaWNhdG9yc01vZHVsZSxcbiAgICBDb21tb25Nb2R1bGVcbiAgXSxcbiAgICBkZWNsYXJhdGlvbnM6IFtcbiAgICAgICAgUG9wQWpheERpYWxvZ0NvbXBvbmVudCxcbiAgICAgICAgRGlhbG9nQ29tcG9uZW50LFxuICAgIF0sXG4gICAgZXhwb3J0czogW1xuICAgICAgICBQb3BBamF4RGlhbG9nQ29tcG9uZW50LFxuICAgIF0sXG59KVxuZXhwb3J0IGNsYXNzIFBvcEFqYXhEaWFsb2dNb2R1bGUge1xufVxuIl19