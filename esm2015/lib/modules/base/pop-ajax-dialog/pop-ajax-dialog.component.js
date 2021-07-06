import { Component, Input, Output, EventEmitter, } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from './dialog/dialog.component';
import { PopBaseService } from '../../../services/pop-base.service';
import { Router } from '@angular/router';
import { SetSiteVar } from '../../../pop-common-utility';
import { PopHref } from '../../../pop-common.model';
export class PopAjaxDialogComponent {
    constructor(dialog, baseService, router) {
        this.dialog = dialog;
        this.baseService = baseService;
        this.router = router;
        this.close = new EventEmitter();
    }
    ngOnInit() {
    }
    ngAfterViewInit() {
        setTimeout(() => {
            this.loadDialog();
        }, 250);
    }
    loadDialog() {
        const dialogBox = this.dialog.open(DialogComponent, {
            width: '500px',
            data: this.ajaxDialogConfig
        });
        dialogBox.afterClosed().subscribe(() => {
            this.close.emit(this.ajaxDialogConfig.response);
            if (this.ajaxDialogConfig.redirect)
                this.redirect();
        });
    }
    redirect() {
        if (this.ajaxDialogConfig.redirect.app == PopHref) {
            this.router.navigateByUrl(`${this.ajaxDialogConfig.redirect.path}`).catch(e => {
            });
        }
        else {
            SetSiteVar('redirect', `/${this.ajaxDialogConfig.redirect.app}/${this.ajaxDialogConfig.redirect.path}`);
            this.baseService.redirect();
        }
    }
}
PopAjaxDialogComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-ajax-dialog',
                template: ''
            },] }
];
PopAjaxDialogComponent.ctorParameters = () => [
    { type: MatDialog },
    { type: PopBaseService },
    { type: Router }
];
PopAjaxDialogComponent.propDecorators = {
    ajaxDialogConfig: [{ type: Input }],
    close: [{ type: Output }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWFqYXgtZGlhbG9nLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2Jhc2UvcG9wLWFqYXgtZGlhbG9nL3BvcC1hamF4LWRpYWxvZy5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQXlCLE1BQU0sRUFBRSxZQUFZLEdBQUcsTUFBTSxlQUFlLENBQUM7QUFFL0YsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ3JELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUM1RCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFDcEUsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ3pDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUN6RCxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFPcEQsTUFBTSxPQUFPLHNCQUFzQjtJQUtqQyxZQUNTLE1BQWlCLEVBQ2hCLFdBQTJCLEVBQzNCLE1BQWM7UUFGZixXQUFNLEdBQU4sTUFBTSxDQUFXO1FBQ2hCLGdCQUFXLEdBQVgsV0FBVyxDQUFnQjtRQUMzQixXQUFNLEdBQU4sTUFBTSxDQUFRO1FBTmQsVUFBSyxHQUFzQixJQUFJLFlBQVksRUFBTyxDQUFDO0lBUTdELENBQUM7SUFHRCxRQUFRO0lBQ1IsQ0FBQztJQUdELGVBQWU7UUFDYixVQUFVLENBQUMsR0FBRyxFQUFFO1lBQ2QsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ3BCLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNWLENBQUM7SUFHTyxVQUFVO1FBQ2hCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRTtZQUNsRCxLQUFLLEVBQUMsT0FBTztZQUNiLElBQUksRUFBRSxJQUFJLENBQUMsZ0JBQWdCO1NBQzVCLENBQUMsQ0FBQztRQUNILFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFO1lBQ3JDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNoRCxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRO2dCQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUN2RCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFHTyxRQUFRO1FBQ2QsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLEdBQUcsSUFBSSxPQUFPLEVBQUM7WUFDaEQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQzlFLENBQUMsQ0FBQyxDQUFDO1NBQ0o7YUFDRztZQUNGLFVBQVUsQ0FBQyxVQUFVLEVBQUUsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7WUFDeEcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztTQUM3QjtJQUNILENBQUM7OztZQWpERixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLHFCQUFxQjtnQkFDL0IsUUFBUSxFQUFFLEVBQUU7YUFDYjs7O1lBWFEsU0FBUztZQUVULGNBQWM7WUFDZCxNQUFNOzs7K0JBVVosS0FBSztvQkFDTCxNQUFNIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBJbnB1dCwgQWZ0ZXJWaWV3SW5pdCwgT25Jbml0LCBPdXRwdXQsIEV2ZW50RW1pdHRlciwgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFBvcEFqYXhEaWFsb2dDb25maWdJbnRlcmZhY2UgfSBmcm9tICcuL3BvcC1hamF4LWRpYWxvZy5tb2RlbCc7XG5pbXBvcnQgeyBNYXREaWFsb2cgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9kaWFsb2cnO1xuaW1wb3J0IHsgRGlhbG9nQ29tcG9uZW50IH0gZnJvbSAnLi9kaWFsb2cvZGlhbG9nLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBQb3BCYXNlU2VydmljZSB9IGZyb20gJy4uLy4uLy4uL3NlcnZpY2VzL3BvcC1iYXNlLnNlcnZpY2UnO1xuaW1wb3J0IHsgUm91dGVyIH0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcbmltcG9ydCB7IFNldFNpdGVWYXIgfSBmcm9tICcuLi8uLi8uLi9wb3AtY29tbW9uLXV0aWxpdHknO1xuaW1wb3J0IHsgUG9wSHJlZiB9IGZyb20gJy4uLy4uLy4uL3BvcC1jb21tb24ubW9kZWwnO1xuXG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2xpYi1wb3AtYWpheC1kaWFsb2cnLFxuICB0ZW1wbGF0ZTogJycsXG59KVxuZXhwb3J0IGNsYXNzIFBvcEFqYXhEaWFsb2dDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIEFmdGVyVmlld0luaXQge1xuICBASW5wdXQoKSBhamF4RGlhbG9nQ29uZmlnOiBQb3BBamF4RGlhbG9nQ29uZmlnSW50ZXJmYWNlO1xuICBAT3V0cHV0KCkgY2xvc2U6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG5cblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgZGlhbG9nOiBNYXREaWFsb2csXG4gICAgcHJpdmF0ZSBiYXNlU2VydmljZTogUG9wQmFzZVNlcnZpY2UsXG4gICAgcHJpdmF0ZSByb3V0ZXI6IFJvdXRlcixcbiAgKXtcbiAgfVxuXG5cbiAgbmdPbkluaXQoKXtcbiAgfVxuXG5cbiAgbmdBZnRlclZpZXdJbml0KCl7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLmxvYWREaWFsb2coKTtcbiAgICB9LCAyNTApO1xuICB9XG5cblxuICBwcml2YXRlIGxvYWREaWFsb2coKTogdm9pZHtcbiAgICBjb25zdCBkaWFsb2dCb3ggPSB0aGlzLmRpYWxvZy5vcGVuKERpYWxvZ0NvbXBvbmVudCwge1xuICAgICAgd2lkdGg6JzUwMHB4JyxcbiAgICAgIGRhdGE6IHRoaXMuYWpheERpYWxvZ0NvbmZpZ1xuICAgIH0pO1xuICAgIGRpYWxvZ0JveC5hZnRlckNsb3NlZCgpLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICB0aGlzLmNsb3NlLmVtaXQodGhpcy5hamF4RGlhbG9nQ29uZmlnLnJlc3BvbnNlKTtcbiAgICAgIGlmKCB0aGlzLmFqYXhEaWFsb2dDb25maWcucmVkaXJlY3QgKSB0aGlzLnJlZGlyZWN0KCk7XG4gICAgfSk7XG4gIH1cblxuXG4gIHByaXZhdGUgcmVkaXJlY3QoKTogdm9pZHtcbiAgICBpZiggdGhpcy5hamF4RGlhbG9nQ29uZmlnLnJlZGlyZWN0LmFwcCA9PSBQb3BIcmVmKXtcbiAgICAgIHRoaXMucm91dGVyLm5hdmlnYXRlQnlVcmwoYCR7dGhpcy5hamF4RGlhbG9nQ29uZmlnLnJlZGlyZWN0LnBhdGh9YCkuY2F0Y2goZSA9PiB7XG4gICAgICB9KTtcbiAgICB9XG4gICAgZWxzZXtcbiAgICAgIFNldFNpdGVWYXIoJ3JlZGlyZWN0JywgYC8ke3RoaXMuYWpheERpYWxvZ0NvbmZpZy5yZWRpcmVjdC5hcHB9LyR7dGhpcy5hamF4RGlhbG9nQ29uZmlnLnJlZGlyZWN0LnBhdGh9YCk7XG4gICAgICB0aGlzLmJhc2VTZXJ2aWNlLnJlZGlyZWN0KCk7XG4gICAgfVxuICB9XG5cblxufVxuIl19