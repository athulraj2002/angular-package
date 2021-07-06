import { __awaiter } from "tslib";
import { Component, ElementRef, Inject } from '@angular/core';
import { ServiceInjector } from '../../../../pop-common.model';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PopExtendComponent } from '../../../../pop-extend.component';
export class PopSuccessDialogComponent extends PopExtendComponent {
    constructor(el, dialog, data) {
        super();
        this.el = el;
        this.dialog = dialog;
        this.data = data;
        this.name = 'PopSuccessDialogComponent';
        this.srv = {
            dialog: ServiceInjector.get(MatDialog),
        };
        this.asset = {};
        this.ui = {
            submitText: 'Ok',
            header: 'Success',
            message: 'Action was Successful'
        };
        this.dom.configure = () => {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                this.ui = Object.assign(Object.assign({}, this.ui), this.data);
                return resolve(true);
            }));
        };
        this.dom.proceed = () => {
            return new Promise((resolve) => {
                return resolve(true);
            });
        };
    }
    /**
     * This component should have a specific purpose
     */
    ngOnInit() {
        super.ngOnInit();
    }
    /**
     * The user can click a cancel btn to close the action dialog
     */
    onFormClose() {
        this.dom.setTimeout(`close-modal`, () => {
            this.dialog.close(-1);
        }, 250);
    }
    /**
     * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
     */
    ngOnDestroy() {
        super.ngOnDestroy();
    }
}
PopSuccessDialogComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-success-dialog',
                template: "<div [ngClass]=\"{'sw-hidden': !dom.state.loaded}\" class=\"pop-success-close-btn sw-pointer\" (click)=\"onFormClose();\">\n  <mat-icon>close</mat-icon>\n</div>\n<div [ngClass]=\"{'sw-hidden': !dom.state.loaded}\">\n  <div class=\"pop-success-dialog-header\" *ngIf=\"ui.header\">{{ui.header}}</div>\n  <div class=\"pop-success-dialog-content\">\n    <p class=\"theme-background-success\" [innerHTML]=\"ui.message\"></p>\n  </div>\n  <div class=\"pop-success-dialog-buttons\">\n    <button class=\"pop-success-dialog-other\" mat-raised-button color=\"accent\" (click)=\"onFormClose()\">\n      {{ui.submitText}}\n    </button>\n  </div>\n\n</div>\n<div class=\"pop-success-spinner-box\" *ngIf=\"dom.state.loader\">\n  <lib-main-spinner></lib-main-spinner>\n</div>\n",
                styles: [":host{position:relative;display:block;min-width:350px}.pop-success-close-btn{position:absolute;top:-20px;right:-20px}.pop-success-dialog-header{font-weight:500;text-align:center;margin-bottom:var(--gap-s);color:var(--valid)}.pop-success-dialog-content{position:relative;display:block;width:100%;min-height:30px;margin-bottom:10px}.pop-success-dialog-content .pop-success-dialog-field{margin-bottom:10px}.pop-success-dialog-content .pop-success-dialog-field-lock{pointer-events:none!important}.pop-success-dialog-buttons{margin-top:20px;margin-bottom:10px;display:flex;justify-content:flex-end}.pop-success-dialog-buttons .pop-success-dialog-cancel{order:1;display:flex;align-items:center;justify-content:center;min-height:35px;min-width:120px}.pop-success-dialog-buttons .pop-success-dialog-other{order:2;display:flex;align-items:center;justify-content:center;margin-left:10px;min-width:120px;min-height:35px}.pop-success-dialog-message-layout{display:flex;flex-direction:row;min-height:40px;align-items:center;justify-content:center;text-align:center}.pop-success-dialog-disabled{pointer-events:none}.pop-success-spinner-box{height:150px}"]
            },] }
];
PopSuccessDialogComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: MatDialogRef },
    { type: undefined, decorators: [{ type: Inject, args: [MAT_DIALOG_DATA,] }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLXN1Y2Nlc3MtZGlhbG9nLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2Jhc2UvcG9wLWRpYWxvZ3MvcG9wLXN1Y2Nlc3MtZGlhbG9nL3BvcC1zdWNjZXNzLWRpYWxvZy5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBcUIsTUFBTSxlQUFlLENBQUM7QUFDakYsT0FBTyxFQUVMLGVBQWUsRUFDaEIsTUFBTSw4QkFBOEIsQ0FBQztBQUV0QyxPQUFPLEVBQUUsZUFBZSxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUVwRixPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQVF0RSxNQUFNLE9BQU8seUJBQTBCLFNBQVEsa0JBQWtCO0lBa0IvRCxZQUNTLEVBQWMsRUFDZCxNQUErQyxFQUNwQixJQUFnQztRQUVsRSxLQUFLLEVBQUUsQ0FBQztRQUpELE9BQUUsR0FBRixFQUFFLENBQVk7UUFDZCxXQUFNLEdBQU4sTUFBTSxDQUF5QztRQUNwQixTQUFJLEdBQUosSUFBSSxDQUE0QjtRQWxCcEUsU0FBSSxHQUFHLDJCQUEyQixDQUFDO1FBRXpCLFFBQUcsR0FBRztZQUNkLE1BQU0sRUFBYSxlQUFlLENBQUMsR0FBRyxDQUFFLFNBQVMsQ0FBRTtTQUNwRCxDQUFDO1FBRVEsVUFBSyxHQUFHLEVBQUUsQ0FBQztRQUVkLE9BQUUsR0FBRztZQUNWLFVBQVUsRUFBRSxJQUFJO1lBQ2hCLE1BQU0sRUFBRSxTQUFTO1lBQ2pCLE9BQU8sRUFBRSx1QkFBdUI7U0FDakMsQ0FBQztRQVVBLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLEdBQXFCLEVBQUU7WUFDMUMsT0FBTyxJQUFJLE9BQU8sQ0FBRSxDQUFPLE9BQU8sRUFBRyxFQUFFO2dCQUVyQyxJQUFJLENBQUMsRUFBRSxtQ0FBUSxJQUFJLENBQUMsRUFBRSxHQUFLLElBQUksQ0FBQyxJQUFJLENBQUUsQ0FBQztnQkFFdkMsT0FBTyxPQUFPLENBQUUsSUFBSSxDQUFFLENBQUM7WUFDekIsQ0FBQyxDQUFBLENBQUUsQ0FBQztRQUNOLENBQUMsQ0FBQztRQUVGLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxHQUFHLEdBQXFCLEVBQUU7WUFDeEMsT0FBTyxJQUFJLE9BQU8sQ0FBRSxDQUFFLE9BQU8sRUFBRyxFQUFFO2dCQUdoQyxPQUFPLE9BQU8sQ0FBRSxJQUFJLENBQUUsQ0FBQztZQUN6QixDQUFDLENBQUUsQ0FBQztRQUNOLENBQUMsQ0FBQztJQUNKLENBQUM7SUFHRDs7T0FFRztJQUNILFFBQVE7UUFDTixLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDbkIsQ0FBQztJQUdEOztPQUVHO0lBQ0gsV0FBVztRQUNULElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFFLGFBQWEsRUFBRSxHQUFHLEVBQUU7WUFDdkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUUsQ0FBQyxDQUFDLENBQUUsQ0FBQztRQUMxQixDQUFDLEVBQUUsR0FBRyxDQUFFLENBQUM7SUFDWCxDQUFDO0lBR0Q7O09BRUc7SUFDSCxXQUFXO1FBQ1QsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3RCLENBQUM7OztZQXhFRixTQUFTLFNBQUU7Z0JBQ1YsUUFBUSxFQUFFLHdCQUF3QjtnQkFDbEMsd3dCQUFrRDs7YUFFbkQ7OztZQWZtQixVQUFVO1lBTU8sWUFBWTs0Q0ErQjVDLE1BQU0sU0FBRSxlQUFlIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBJbmplY3QsIE9uRGVzdHJveSwgT25Jbml0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge1xuICBFbnRpdHlTdWNjZXNzRGF0YUludGVyZmFjZSxcbiAgU2VydmljZUluamVjdG9yXG59IGZyb20gJy4uLy4uLy4uLy4uL3BvcC1jb21tb24ubW9kZWwnO1xuXG5pbXBvcnQgeyBNQVRfRElBTE9HX0RBVEEsIE1hdERpYWxvZywgTWF0RGlhbG9nUmVmIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvZGlhbG9nJztcblxuaW1wb3J0IHsgUG9wRXh0ZW5kQ29tcG9uZW50IH0gZnJvbSAnLi4vLi4vLi4vLi4vcG9wLWV4dGVuZC5jb21wb25lbnQnO1xuXG5cbkBDb21wb25lbnQoIHtcbiAgc2VsZWN0b3I6ICdsaWItcG9wLXN1Y2Nlc3MtZGlhbG9nJyxcbiAgdGVtcGxhdGVVcmw6ICcuL3BvcC1zdWNjZXNzLWRpYWxvZy5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWyAnLi9wb3Atc3VjY2Vzcy1kaWFsb2cuY29tcG9uZW50LnNjc3MnIF1cbn0gKVxuZXhwb3J0IGNsYXNzIFBvcFN1Y2Nlc3NEaWFsb2dDb21wb25lbnQgZXh0ZW5kcyBQb3BFeHRlbmRDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG5cblxuICBuYW1lID0gJ1BvcFN1Y2Nlc3NEaWFsb2dDb21wb25lbnQnO1xuXG4gIHByb3RlY3RlZCBzcnYgPSB7XG4gICAgZGlhbG9nOiA8TWF0RGlhbG9nPlNlcnZpY2VJbmplY3Rvci5nZXQoIE1hdERpYWxvZyApLFxuICB9O1xuXG4gIHByb3RlY3RlZCBhc3NldCA9IHt9O1xuXG4gIHB1YmxpYyB1aSA9IHtcbiAgICBzdWJtaXRUZXh0OiAnT2snLFxuICAgIGhlYWRlcjogJ1N1Y2Nlc3MnLFxuICAgIG1lc3NhZ2U6ICdBY3Rpb24gd2FzIFN1Y2Nlc3NmdWwnXG4gIH07XG5cblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgZWw6IEVsZW1lbnRSZWYsXG4gICAgcHVibGljIGRpYWxvZzogTWF0RGlhbG9nUmVmPFBvcFN1Y2Nlc3NEaWFsb2dDb21wb25lbnQ+LFxuICAgIEBJbmplY3QoIE1BVF9ESUFMT0dfREFUQSApIHB1YmxpYyBkYXRhOiBFbnRpdHlTdWNjZXNzRGF0YUludGVyZmFjZSxcbiAgKXtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5kb20uY29uZmlndXJlID0gKCk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCBhc3luYyggcmVzb2x2ZSApID0+IHtcblxuICAgICAgICB0aGlzLnVpID0geyAuLi50aGlzLnVpLCAuLi50aGlzLmRhdGEgfTtcblxuICAgICAgICByZXR1cm4gcmVzb2x2ZSggdHJ1ZSApO1xuICAgICAgfSApO1xuICAgIH07XG5cbiAgICB0aGlzLmRvbS5wcm9jZWVkID0gKCk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCAoIHJlc29sdmUgKSA9PiB7XG5cblxuICAgICAgICByZXR1cm4gcmVzb2x2ZSggdHJ1ZSApO1xuICAgICAgfSApO1xuICAgIH07XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIGNvbXBvbmVudCBzaG91bGQgaGF2ZSBhIHNwZWNpZmljIHB1cnBvc2VcbiAgICovXG4gIG5nT25Jbml0KCl7XG4gICAgc3VwZXIubmdPbkluaXQoKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoZSB1c2VyIGNhbiBjbGljayBhIGNhbmNlbCBidG4gdG8gY2xvc2UgdGhlIGFjdGlvbiBkaWFsb2dcbiAgICovXG4gIG9uRm9ybUNsb3NlKCl7XG4gICAgdGhpcy5kb20uc2V0VGltZW91dCggYGNsb3NlLW1vZGFsYCwgKCkgPT4ge1xuICAgICAgdGhpcy5kaWFsb2cuY2xvc2UoIC0xICk7XG4gICAgfSwgMjUwICk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGUgZG9tIGRlc3Ryb3kgZnVuY3Rpb24gbWFuYWdlcyBhbGwgdGhlIGNsZWFuIHVwIHRoYXQgaXMgbmVjZXNzYXJ5IGlmIHN1YnNjcmlwdGlvbnMsIHRpbWVvdXRzLCBldGMgYXJlIHN0b3JlZCBwcm9wZXJseVxuICAgKi9cbiAgbmdPbkRlc3Ryb3koKXtcbiAgICBzdXBlci5uZ09uRGVzdHJveSgpO1xuICB9XG5cblxuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFVuZGVyIFRoZSBIb29kICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICggUHJvdGVjdGVkIE1ldGhvZCApICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgVGhlc2UgYXJlIHByb3RlY3RlZCBpbnN0ZWFkIG9mIHByaXZhdGUgc28gdGhhdCB0aGV5IGNhbiBiZSBvdmVycmlkZGVuICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG5cbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBVbmRlciBUaGUgSG9vZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIFByaXZhdGUgTWV0aG9kICkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cblxufVxuIl19