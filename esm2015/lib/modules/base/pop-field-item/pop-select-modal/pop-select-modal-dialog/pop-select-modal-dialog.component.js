import { Component, ElementRef, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PopFieldItemComponent } from '../../pop-field-item.component';
export class PopSelectModalDialogComponent extends PopFieldItemComponent {
    constructor(el, dialog, data) {
        super();
        this.el = el;
        this.dialog = dialog;
        this.data = data;
        this.name = 'PopSelectModalDialogComponent';
        /**
         * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
         */
        this.dom.configure = () => {
            return new Promise((resolve) => {
                this.dom.height.outer = 570;
                this.dom.height.inner = 520;
                this.config.list.minHeight = 400;
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
    confirm() {
        // this.config.list.control.setValue('', { emitEvent: false });
        this.dom.setTimeout(`dialog-confirm`, () => {
            this.dialog.close(this.config.list);
        }, 0);
    }
    cancel() {
        // this.config.list.control.setValue('', { emitEvent: false });
        this.dom.setTimeout(`dialog-close`, () => {
            this.dialog.close(null);
        }, 0);
    }
    /**
     * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
     */
    ngOnDestroy() {
        super.ngOnDestroy();
    }
}
PopSelectModalDialogComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-select-modal-dialog',
                template: "<div class=\"pop-select-modal-container import-field-item-container\" [style.height.px]=dom.height.outer>\n  <mat-progress-bar [ngClass]=\"{'sw-hidden': dom.state.loaded}\" mode=\"determinate\" [value]=dom.state.progress></mat-progress-bar>\n  <div class=\"pop-select-modal-wrapper\" [style.height.px]=dom.height.inner *ngIf=\"dom.state.loaded\">\n    <div class=\"mat-h2 pop-select-modal-header\">{{config.header}}</div>\n    <div class=\"pop-select-modal-content\">\n      <lib-pop-select-list [config]=config.list></lib-pop-select-list>\n    </div>\n  </div>\n  <div class=\"pop-select-modal-actions\">\n    <button class=\"pop-select-modal-btn\" mat-raised-button (click)=\"cancel()\" cdkFocusInitial>Cancel</button>\n    <button class=\"pop-select-modal-btn\" [disabled]=\"!config.list.control.value\" mat-raised-button (click)=\"confirm()\">Ok</button>\n  </div>\n</div>\n",
                styles: [":host{flex-direction:column}.pop-select-modal-container{position:absolute;top:0;left:0;right:0;padding:0 var(--gap-s);overflow-y:hidden;box-sizing:border-box}.pop-select-modal-wrapper{display:flex;flex-direction:column}.pop-select-modal-wrapper>div{flex:1}.pop-select-modal-header{text-align:center;max-height:35px}.pop-select-modal-content{flex:1 1 100%;flex-direction:column;overflow-y:auto;overflow-x:hidden}.pop-select-modal-actions{display:flex;flex-flow:row;align-items:center;justify-content:flex-end;padding:var(--gap-xs) var(--gap-s);max-height:50px;box-sizing:border-box}.pop-select-modal-btn{min-width:120px;margin-left:var(--gap-s)}:host ::ng-deep .mat-dialog-container{padding:2px!important;border:1px solid!important}"]
            },] }
];
PopSelectModalDialogComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: MatDialogRef },
    { type: undefined, decorators: [{ type: Inject, args: [MAT_DIALOG_DATA,] }] }
];
PopSelectModalDialogComponent.propDecorators = {
    config: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLXNlbGVjdC1tb2RhbC1kaWFsb2cuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvYmFzZS9wb3AtZmllbGQtaXRlbS9wb3Atc2VsZWN0LW1vZGFsL3BvcC1zZWxlY3QtbW9kYWwtZGlhbG9nL3BvcC1zZWxlY3QtbW9kYWwtZGlhbG9nLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFxQixNQUFNLGVBQWUsQ0FBQztBQUN4RixPQUFPLEVBQUUsZUFBZSxFQUFFLFlBQVksRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBSXpFLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBU3ZFLE1BQU0sT0FBTyw2QkFBOEIsU0FBUSxxQkFBcUI7SUFNdEUsWUFDUyxFQUFjLEVBQ2QsTUFBbUQsRUFDMUIsSUFBcUI7UUFFckQsS0FBSyxFQUFFLENBQUM7UUFKRCxPQUFFLEdBQUYsRUFBRSxDQUFZO1FBQ2QsV0FBTSxHQUFOLE1BQU0sQ0FBNkM7UUFDMUIsU0FBSSxHQUFKLElBQUksQ0FBaUI7UUFOaEQsU0FBSSxHQUFFLCtCQUErQixDQUFDO1FBUzNDOztXQUVHO1FBQ0gsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsR0FBcUIsRUFBRTtZQUMxQyxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7Z0JBRTdCLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUM7Z0JBQzVCLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUM7Z0JBQzVCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUM7Z0JBRWpDLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3ZCLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUdEOztPQUVHO0lBQ0gsUUFBUTtRQUNOLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNuQixDQUFDO0lBR0QsT0FBTztRQUNMLCtEQUErRDtRQUMvRCxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsRUFBQyxHQUFHLEVBQUU7WUFDeEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN0QyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFUixDQUFDO0lBR0QsTUFBTTtRQUNKLCtEQUErRDtRQUMvRCxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxjQUFjLEVBQUUsR0FBRyxFQUFFO1lBQ3ZDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzFCLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNSLENBQUM7SUFHRDs7T0FFRztJQUNILFdBQVc7UUFDVCxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDdEIsQ0FBQzs7O1lBL0RGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsNkJBQTZCO2dCQUN2QywwM0JBQXVEOzthQUV4RDs7O1lBYm1CLFVBQVU7WUFDSixZQUFZOzRDQXNCakMsTUFBTSxTQUFDLGVBQWU7OztxQkFSeEIsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgRWxlbWVudFJlZiwgSW5qZWN0LCBJbnB1dCwgT25EZXN0cm95LCBPbkluaXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE1BVF9ESUFMT0dfREFUQSwgTWF0RGlhbG9nUmVmIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvZGlhbG9nJztcbmltcG9ydCB7IFNlbGVjdE1vZGFsQ29uZmlnIH0gZnJvbSAnLi4vc2VsZWN0LW1vZGFsLWNvbmZpZy5tb2RlbCc7XG5pbXBvcnQgeyBGb3JtQ29udHJvbCB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7IFZhbGlkYXRpb25FcnJvck1lc3NhZ2VzIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vc2VydmljZXMvcG9wLXZhbGlkYXRvcnMnO1xuaW1wb3J0IHsgUG9wRmllbGRJdGVtQ29tcG9uZW50IH0gZnJvbSAnLi4vLi4vcG9wLWZpZWxkLWl0ZW0uY29tcG9uZW50JztcbmltcG9ydCB7IERpY3Rpb25hcnkgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9wb3AtY29tbW9uLm1vZGVsJztcblxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdsaWItcG9wLXNlbGVjdC1tb2RhbC1kaWFsb2cnLFxuICB0ZW1wbGF0ZVVybDogJy4vcG9wLXNlbGVjdC1tb2RhbC1kaWFsb2cuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsgJy4vcG9wLXNlbGVjdC1tb2RhbC1kaWFsb2cuY29tcG9uZW50LnNjc3MnIF1cbn0pXG5leHBvcnQgY2xhc3MgUG9wU2VsZWN0TW9kYWxEaWFsb2dDb21wb25lbnQgZXh0ZW5kcyBQb3BGaWVsZEl0ZW1Db21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG4gIEBJbnB1dCgpIGNvbmZpZzogU2VsZWN0TW9kYWxDb25maWc7XG5cbiAgcHVibGljIG5hbWUgPSdQb3BTZWxlY3RNb2RhbERpYWxvZ0NvbXBvbmVudCc7XG5cblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgZWw6IEVsZW1lbnRSZWYsXG4gICAgcHVibGljIGRpYWxvZzogTWF0RGlhbG9nUmVmPFBvcFNlbGVjdE1vZGFsRGlhbG9nQ29tcG9uZW50PixcbiAgICBASW5qZWN0KE1BVF9ESUFMT0dfREFUQSkgcHVibGljIGRhdGE6IERpY3Rpb25hcnk8YW55PixcbiAgKXtcbiAgICBzdXBlcigpO1xuICAgIC8qKlxuICAgICAqIFRoaXMgc2hvdWxkIHRyYW5zZm9ybSBhbmQgdmFsaWRhdGUgdGhlIGRhdGEuIFRoZSB2aWV3IHNob3VsZCB0cnkgdG8gb25seSB1c2UgZGF0YSB0aGF0IGlzIHN0b3JlZCBvbiB1aSBzbyB0aGF0IGl0IGlzIG5vdCBkZXBlbmRlbnQgb24gdGhlIHN0cnVjdHVyZSBvZiBkYXRhIHRoYXQgY29tZXMgZnJvbSBvdGhlciBzb3VyY2VzLiBUaGUgdWkgc2hvdWxkIGJlIHRoZSBzb3VyY2Ugb2YgdHJ1dGggaGVyZS5cbiAgICAgKi9cbiAgICB0aGlzLmRvbS5jb25maWd1cmUgPSAoKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcblxuICAgICAgICB0aGlzLmRvbS5oZWlnaHQub3V0ZXIgPSA1NzA7XG4gICAgICAgIHRoaXMuZG9tLmhlaWdodC5pbm5lciA9IDUyMDtcbiAgICAgICAgdGhpcy5jb25maWcubGlzdC5taW5IZWlnaHQgPSA0MDA7XG5cbiAgICAgICAgcmV0dXJuIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cblxuICAvKipcbiAgICogVGhpcyBjb21wb25lbnQgc2hvdWxkIGhhdmUgYSBzcGVjaWZpYyBwdXJwb3NlXG4gICAqL1xuICBuZ09uSW5pdCgpe1xuICAgIHN1cGVyLm5nT25Jbml0KCk7XG4gIH1cblxuXG4gIGNvbmZpcm0oKXtcbiAgICAvLyB0aGlzLmNvbmZpZy5saXN0LmNvbnRyb2wuc2V0VmFsdWUoJycsIHsgZW1pdEV2ZW50OiBmYWxzZSB9KTtcbiAgICB0aGlzLmRvbS5zZXRUaW1lb3V0KGBkaWFsb2ctY29uZmlybWAsKCkgPT4ge1xuICAgICAgdGhpcy5kaWFsb2cuY2xvc2UodGhpcy5jb25maWcubGlzdCk7XG4gICAgfSwgMCk7XG5cbiAgfVxuXG5cbiAgY2FuY2VsKCl7XG4gICAgLy8gdGhpcy5jb25maWcubGlzdC5jb250cm9sLnNldFZhbHVlKCcnLCB7IGVtaXRFdmVudDogZmFsc2UgfSk7XG4gICAgdGhpcy5kb20uc2V0VGltZW91dChgZGlhbG9nLWNsb3NlYCwgKCkgPT4ge1xuICAgICAgdGhpcy5kaWFsb2cuY2xvc2UobnVsbCk7XG4gICAgfSwgMCk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGUgZG9tIGRlc3Ryb3kgZnVuY3Rpb24gbWFuYWdlcyBhbGwgdGhlIGNsZWFuIHVwIHRoYXQgaXMgbmVjZXNzYXJ5IGlmIHN1YnNjcmlwdGlvbnMsIHRpbWVvdXRzLCBldGMgYXJlIHN0b3JlZCBwcm9wZXJseVxuICAgKi9cbiAgbmdPbkRlc3Ryb3koKXtcbiAgICBzdXBlci5uZ09uRGVzdHJveSgpO1xuICB9XG5cblxuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFVuZGVyIFRoZSBIb29kICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICggUHJvdGVjdGVkIE1ldGhvZCApICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuXG5cblxuXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVW5kZXIgVGhlIEhvb2QgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBQcml2YXRlIE1ldGhvZCApICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xufVxuIl19