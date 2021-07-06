import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PopRouteHistoryResolver } from '../../../../services/pop-route-history.resolver';
export class ErrorComponent {
    constructor(data, dialog, history) {
        this.data = data;
        this.dialog = dialog;
        this.history = history;
    }
    goBack() {
        this.history.goBack();
        this.dialog.close();
    }
}
ErrorComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-error',
                template: "<h1>Error: {{data.code}} - {{data.message}}</h1>\n<button mat-raised-button (click)=\"goBack()\">Go Back</button>\n"
            },] }
];
ErrorComponent.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [MAT_DIALOG_DATA,] }] },
    { type: MatDialogRef },
    { type: PopRouteHistoryResolver }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3IuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvYmFzZS9wb3AtZXJyb3JzL2Vycm9yL2Vycm9yLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNsRCxPQUFPLEVBQUUsZUFBZSxFQUFFLFlBQVksRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ3pFLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLGlEQUFpRCxDQUFDO0FBUTFGLE1BQU0sT0FBTyxjQUFjO0lBRXpCLFlBQ2tDLElBQUksRUFDNUIsTUFBb0MsRUFDcEMsT0FBZ0M7UUFGUixTQUFJLEdBQUosSUFBSSxDQUFBO1FBQzVCLFdBQU0sR0FBTixNQUFNLENBQThCO1FBQ3BDLFlBQU8sR0FBUCxPQUFPLENBQXlCO0lBQ3hDLENBQUM7SUFFSCxNQUFNO1FBQ0osSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUN0QixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ3RCLENBQUM7OztZQWhCRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLGVBQWU7Z0JBQ3pCLCtIQUFxQzthQUV0Qzs7OzRDQUlJLE1BQU0sU0FBQyxlQUFlO1lBWkQsWUFBWTtZQUM3Qix1QkFBdUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEluamVjdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgTUFUX0RJQUxPR19EQVRBLCBNYXREaWFsb2dSZWYgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9kaWFsb2cnO1xuaW1wb3J0IHsgUG9wUm91dGVIaXN0b3J5UmVzb2x2ZXIgfSBmcm9tICcuLi8uLi8uLi8uLi9zZXJ2aWNlcy9wb3Atcm91dGUtaGlzdG9yeS5yZXNvbHZlcic7XG5cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbGliLXBvcC1lcnJvcicsXG4gIHRlbXBsYXRlVXJsOiAnLi9lcnJvci5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlczogW11cbn0pXG5leHBvcnQgY2xhc3MgRXJyb3JDb21wb25lbnR7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgQEluamVjdChNQVRfRElBTE9HX0RBVEEpIHB1YmxpYyBkYXRhLFxuICAgIHByaXZhdGUgZGlhbG9nOiBNYXREaWFsb2dSZWY8RXJyb3JDb21wb25lbnQ+LFxuICAgIHByaXZhdGUgaGlzdG9yeTogUG9wUm91dGVIaXN0b3J5UmVzb2x2ZXJcbiAgKXt9XG5cbiAgZ29CYWNrKCl7XG4gICAgdGhpcy5oaXN0b3J5LmdvQmFjaygpO1xuICAgIHRoaXMuZGlhbG9nLmNsb3NlKCk7XG4gIH1cbn1cbiJdfQ==