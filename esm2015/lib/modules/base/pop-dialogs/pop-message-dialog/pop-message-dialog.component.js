import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
export class PopMessageDialogComponent {
    constructor(config, dialog) {
        this.config = config;
        this.dialog = dialog;
    }
    ngOnInit() {
    }
    onCancel() {
        this.dialog.close(null);
    }
}
PopMessageDialogComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-message-dialog',
                template: "<h1 class=\"pop-confirmation-dialog-header\">{{config.heading}}</h1>\n<div class=\"pop-confirmation-body\" [innerHTML]=\"config.message\"></div>\n\n<mat-divider [style.width.%]=100 [style.marginBottom.px]=15></mat-divider>\n\n<div class=\"pop-confirmation-dialog-footer\">\n  <button class=\"pop-confirmation-btn\" mat-raised-button (click)=\"onCancel()\" cdkFocusInitial>Close</button>\n</div>\n\n",
                styles: [".pop-confirmation-dialog-header{margin-top:0;text-align:center}.pop-confirmation-body{margin:var(--gap-s) 0 var(--gap-lm) 0;padding:var(--gap-m);min-height:30px;max-height:400px;overflow-y:auto;text-align:center}.pop-confirmation-dialog-footer{display:flex;min-height:var(--gap-m);justify-content:flex-end;align-items:center}.pop-confirmation-btn{margin-left:var(--gap-s)}"]
            },] }
];
PopMessageDialogComponent.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [MAT_DIALOG_DATA,] }] },
    { type: MatDialogRef }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLW1lc3NhZ2UtZGlhbG9nLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2Jhc2UvcG9wLWRpYWxvZ3MvcG9wLW1lc3NhZ2UtZGlhbG9nL3BvcC1tZXNzYWdlLWRpYWxvZy5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQVUsTUFBTSxlQUFlLENBQUM7QUFDMUQsT0FBTyxFQUFFLFlBQVksRUFBRSxlQUFlLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQVF6RSxNQUFNLE9BQU8seUJBQXlCO0lBRXBDLFlBQ2tDLE1BQW9DLEVBQzdELE1BQStDO1FBRHRCLFdBQU0sR0FBTixNQUFNLENBQThCO1FBQzdELFdBQU0sR0FBTixNQUFNLENBQXlDO0lBQ3BELENBQUM7SUFFTCxRQUFRO0lBQ1IsQ0FBQztJQUVELFFBQVE7UUFDTixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMxQixDQUFDOzs7WUFqQkYsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSx3QkFBd0I7Z0JBQ2xDLDBaQUFrRDs7YUFFbkQ7Ozs0Q0FJSSxNQUFNLFNBQUMsZUFBZTtZQVhsQixZQUFZIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBJbmplY3QsIE9uSW5pdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgTWF0RGlhbG9nUmVmLCBNQVRfRElBTE9HX0RBVEEgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9kaWFsb2cnO1xuaW1wb3J0IHsgUG9wTWVzc2FnZURpYWxvZ0RhdGFJbnRlcmZhY2UgfSBmcm9tICcuLi9wb3AtZGlhbG9ncy5tb2RlbCc7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2xpYi1wb3AtbWVzc2FnZS1kaWFsb2cnLFxuICB0ZW1wbGF0ZVVybDogJy4vcG9wLW1lc3NhZ2UtZGlhbG9nLmNvbXBvbmVudC5odG1sJyxcbiAgc3R5bGVVcmxzOiBbJy4vcG9wLW1lc3NhZ2UtZGlhbG9nLmNvbXBvbmVudC5zY3NzJ11cbn0pXG5leHBvcnQgY2xhc3MgUG9wTWVzc2FnZURpYWxvZ0NvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCB7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgQEluamVjdChNQVRfRElBTE9HX0RBVEEpIHB1YmxpYyBjb25maWc6UG9wTWVzc2FnZURpYWxvZ0RhdGFJbnRlcmZhY2UgLFxuICAgIHB1YmxpYyBkaWFsb2c6IE1hdERpYWxvZ1JlZjxQb3BNZXNzYWdlRGlhbG9nQ29tcG9uZW50PlxuICApIHsgfVxuXG4gIG5nT25Jbml0KCk6IHZvaWQge1xuICB9XG5cbiAgb25DYW5jZWwoKXtcbiAgICB0aGlzLmRpYWxvZy5jbG9zZShudWxsKTtcbiAgfVxuICBcbn1cbiJdfQ==