import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
export class PopTableDialogComponent {
    constructor(dialog, data) {
        this.dialog = dialog;
        this.data = data;
        this.ui = {
            table: undefined,
        };
        this._buildTable();
    }
    ngOnInit() {
    }
    _buildTable() {
        const tableData = this.data.data;
        this.data.table.data = tableData;
        this.ui.table = this.data.table;
    }
    onClose() {
        this.dialog.close(null);
    }
}
PopTableDialogComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-table-dialog',
                template: "<div class=\"container\">\n  <!-- <h2 class=\"confirmation-header\"> {{data.display}} </h2>\n  <div class=\"cpcup-body\"> {{data.body}} </div>\n  <div class=\"pull-right\">\n      <button mat-raised-button class=\"mat-raised-button\" (click)=\"onClose()\" role=\"button\"> CLOSE </button>\n  </div> -->\n  <h1 class=\"cpc-confirmation-dialog-header\">{{data.header}}</h1>\n  <!-- <div [ngClass]=\"{'sw-hidden': !data.body}\" class=\"cpc-confirmation-body pt-10\" [innerHTML]=\"data.body\"></div> -->\n  <p class=\"cpc-confirmation-body\">{{data.message}}</p>\n  <div>\n    <lib-pop-table [config]=\"ui.table\"></lib-pop-table>\n  </div>\n\n  <div class=\"cpc-confirmation-dialog-footer cpc-pull-right\">\n    <button mat-raised-button class=\"mat-raised-button\" (click)=\"onClose()\" role=\"button\"> CLOSE</button>\n  </div>\n</div>\n",
                styles: [".cpc-pull-right{margin-top:var(--gap-lm);float:right}.cpc-pull-right button{margin-right:var(--radius-xl)}:host ::ng-deep .pop-table-container{overflow-y:scroll}.cpc-confirmation-dialog-header{margin-top:0;text-align:center}.cpc-confirmation-body{margin:var(--gap-s) 0 var(--gap-lm) 0;padding:var(--gap-m);overflow-y:auto}.cpc-confirmation-dialog-footer{display:flex;justify-content:space-between;align-items:center}:host ::ng-deep .pop-table-footer{display:none!important}"]
            },] }
];
PopTableDialogComponent.ctorParameters = () => [
    { type: MatDialogRef },
    { type: undefined, decorators: [{ type: Inject, args: [MAT_DIALOG_DATA,] }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLXRhYmxlLWRpYWxvZy5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9iYXNlL3BvcC1kaWFsb2dzL3BvcC10YWJsZS1kaWFsb2cvcG9wLXRhYmxlLWRpYWxvZy5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQVUsTUFBTSxlQUFlLENBQUM7QUFDMUQsT0FBTyxFQUFFLFlBQVksRUFBRSxlQUFlLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQVN6RSxNQUFNLE9BQU8sdUJBQXVCO0lBT2xDLFlBQ1MsTUFBNkMsRUFDbEIsSUFBSTtRQUQvQixXQUFNLEdBQU4sTUFBTSxDQUF1QztRQUNsQixTQUFJLEdBQUosSUFBSSxDQUFBO1FBUGpDLE9BQUUsR0FBRztZQUNWLEtBQUssRUFBZSxTQUFTO1NBQzlCLENBQUM7UUFPQSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDckIsQ0FBQztJQUdELFFBQVE7SUFDUixDQUFDO0lBR08sV0FBVztRQUNqQixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQTtRQUNoQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFBO1FBQ2hDLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQ2xDLENBQUM7SUFHRCxPQUFPO1FBQ0wsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUUsSUFBSSxDQUFFLENBQUM7SUFDNUIsQ0FBQzs7O1lBakNGLFNBQVMsU0FBRTtnQkFDVixRQUFRLEVBQUUsc0JBQXNCO2dCQUNoQyxnMUJBQWdEOzthQUVqRDs7O1lBUlEsWUFBWTs0Q0FrQmhCLE1BQU0sU0FBRSxlQUFlIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBJbmplY3QsIE9uSW5pdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgTWF0RGlhbG9nUmVmLCBNQVRfRElBTE9HX0RBVEEgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9kaWFsb2cnO1xuaW1wb3J0IHsgVGFibGVDb25maWcgfSBmcm9tICcuLi8uLi9wb3AtdGFibGUvcG9wLXRhYmxlLm1vZGVsJztcblxuXG5AQ29tcG9uZW50KCB7XG4gIHNlbGVjdG9yOiAnbGliLXBvcC10YWJsZS1kaWFsb2cnLFxuICB0ZW1wbGF0ZVVybDogJy4vcG9wLXRhYmxlLWRpYWxvZy5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWyAnLi9wb3AtdGFibGUtZGlhbG9nLmNvbXBvbmVudC5zY3NzJyBdXG59IClcbmV4cG9ydCBjbGFzcyBQb3BUYWJsZURpYWxvZ0NvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCB7XG5cbiAgcHVibGljIHVpID0ge1xuICAgIHRhYmxlOiA8VGFibGVDb25maWc+dW5kZWZpbmVkLFxuICB9O1xuXG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIGRpYWxvZzogTWF0RGlhbG9nUmVmPFBvcFRhYmxlRGlhbG9nQ29tcG9uZW50PixcbiAgICBASW5qZWN0KCBNQVRfRElBTE9HX0RBVEEgKSBwdWJsaWMgZGF0YVxuICApe1xuICAgIHRoaXMuX2J1aWxkVGFibGUoKTtcbiAgfVxuXG5cbiAgbmdPbkluaXQoKTogdm9pZHtcbiAgfVxuXG5cbiAgcHJpdmF0ZSBfYnVpbGRUYWJsZSgpe1xuICAgIGNvbnN0IHRhYmxlRGF0YSA9IHRoaXMuZGF0YS5kYXRhXG4gICAgdGhpcy5kYXRhLnRhYmxlLmRhdGEgPSB0YWJsZURhdGFcbiAgICB0aGlzLnVpLnRhYmxlID0gdGhpcy5kYXRhLnRhYmxlO1xuICB9XG5cblxuICBvbkNsb3NlKCl7XG4gICAgdGhpcy5kaWFsb2cuY2xvc2UoIG51bGwgKTtcbiAgfVxufVxuIl19