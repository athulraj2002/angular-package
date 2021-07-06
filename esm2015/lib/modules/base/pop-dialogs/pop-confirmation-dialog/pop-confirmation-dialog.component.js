import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
export class PopConfirmationDialogComponent {
    constructor(config, dialog) {
        this.config = config;
        this.dialog = dialog;
    }
    ngOnInit() {
        if (!this.config.display)
            this.config.display = 'Confirmation';
        if (!this.config.option)
            this.config.option = { confirmed: 1 };
        if (!this.config.align)
            this.config.align = 'center';
    }
    onConfirm() {
        this.dialog.close(this.config.option);
    }
    onCancel() {
        this.dialog.close(null);
    }
}
PopConfirmationDialogComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-confirmation-dialog',
                template: "<h1 class=\"pop-confirmation-dialog-header\">{{config.display}}</h1>\n\n<div [ngClass]=\"{'sw-hidden': !config.body}\" class=\"pop-confirmation-body pop-confirmation-align-{{config.align}}\" [innerHTML]=\"config.body\"></div>\n\n<mat-divider [style.width.%]=100 [style.marginBottom.px]=15></mat-divider>\n\n<div class=\"pop-confirmation-dialog-footer\">\n  <button class=\"pop-confirmation-btn\" mat-raised-button (click)=\"onCancel()\" cdkFocusInitial>Cancel</button>\n  <button class=\"pop-confirmation-btn\" color=\"accent\" mat-raised-button (click)=\"onConfirm()\">Confirm</button>\n</div>\n\n",
                styles: [".pop-confirmation-dialog-header{margin-top:0;text-align:center}.pop-confirmation-body{margin:var(--gap-s) 0 var(--gap-lm) 0;padding:var(--gap-m);min-height:30px;max-height:400px;overflow-y:auto}.pop-confirmation-align-left{text-align:left}.pop-confirmation-align-center{text-align:center}.pop-confirmation-align-right{text-align:right}.pop-confirmation-dialog-footer{display:flex;min-height:var(--gap-m);justify-content:flex-end;align-items:center}.pop-confirmation-btn{margin-left:var(--gap-s)}"]
            },] }
];
PopConfirmationDialogComponent.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [MAT_DIALOG_DATA,] }] },
    { type: MatDialogRef }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWNvbmZpcm1hdGlvbi1kaWFsb2cuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvYmFzZS9wb3AtZGlhbG9ncy9wb3AtY29uZmlybWF0aW9uLWRpYWxvZy9wb3AtY29uZmlybWF0aW9uLWRpYWxvZy5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQVUsTUFBTSxlQUFlLENBQUM7QUFDMUQsT0FBTyxFQUFFLGVBQWUsRUFBRSxZQUFZLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQVN6RSxNQUFNLE9BQU8sOEJBQThCO0lBQ3pDLFlBQ2tDLE1BQTBDLEVBQ25FLE1BQW9EO1FBRDNCLFdBQU0sR0FBTixNQUFNLENBQW9DO1FBQ25FLFdBQU0sR0FBTixNQUFNLENBQThDO0lBRTdELENBQUM7SUFHRCxRQUFRO1FBQ04sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTztZQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxHQUFHLGNBQWMsQ0FBQztRQUNoRSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNO1lBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDaEUsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSztZQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQztJQUN4RCxDQUFDO0lBR0QsU0FBUztRQUNQLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDeEMsQ0FBQztJQUdELFFBQVE7UUFDTixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMxQixDQUFDOzs7WUEzQkYsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSw2QkFBNkI7Z0JBQ3ZDLGttQkFBdUQ7O2FBRXhEOzs7NENBR0ksTUFBTSxTQUFDLGVBQWU7WUFYRCxZQUFZIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBJbmplY3QsIE9uSW5pdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgTUFUX0RJQUxPR19EQVRBLCBNYXREaWFsb2dSZWYgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9kaWFsb2cnO1xuaW1wb3J0IHsgUG9wQ29uZmlybWF0aW9uRGlhbG9nRGF0YUludGVyZmFjZSB9IGZyb20gJy4uL3BvcC1kaWFsb2dzLm1vZGVsJztcblxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdsaWItcG9wLWNvbmZpcm1hdGlvbi1kaWFsb2cnLFxuICB0ZW1wbGF0ZVVybDogJy4vcG9wLWNvbmZpcm1hdGlvbi1kaWFsb2cuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsgJy4vcG9wLWNvbmZpcm1hdGlvbi1kaWFsb2cuY29tcG9uZW50LnNjc3MnIF1cbn0pXG5leHBvcnQgY2xhc3MgUG9wQ29uZmlybWF0aW9uRGlhbG9nQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0IHtcbiAgY29uc3RydWN0b3IoXG4gICAgQEluamVjdChNQVRfRElBTE9HX0RBVEEpIHB1YmxpYyBjb25maWc6IFBvcENvbmZpcm1hdGlvbkRpYWxvZ0RhdGFJbnRlcmZhY2UsXG4gICAgcHVibGljIGRpYWxvZzogTWF0RGlhbG9nUmVmPFBvcENvbmZpcm1hdGlvbkRpYWxvZ0NvbXBvbmVudD5cbiAgKXtcbiAgfVxuXG5cbiAgbmdPbkluaXQoKXtcbiAgICBpZiggIXRoaXMuY29uZmlnLmRpc3BsYXkgKSB0aGlzLmNvbmZpZy5kaXNwbGF5ID0gJ0NvbmZpcm1hdGlvbic7XG4gICAgaWYoICF0aGlzLmNvbmZpZy5vcHRpb24gKSB0aGlzLmNvbmZpZy5vcHRpb24gPSB7IGNvbmZpcm1lZDogMSB9O1xuICAgIGlmKCAhdGhpcy5jb25maWcuYWxpZ24gKSB0aGlzLmNvbmZpZy5hbGlnbiA9ICdjZW50ZXInO1xuICB9XG5cblxuICBvbkNvbmZpcm0oKXtcbiAgICB0aGlzLmRpYWxvZy5jbG9zZSh0aGlzLmNvbmZpZy5vcHRpb24pO1xuICB9XG5cblxuICBvbkNhbmNlbCgpe1xuICAgIHRoaXMuZGlhbG9nLmNsb3NlKG51bGwpO1xuICB9XG59XG4iXX0=