import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PopRouteHistoryResolver } from '../../../../services/pop-route-history.resolver';
import { PopRequestService } from '../../../../services/pop-request.service';
export class DialogComponent {
    constructor(data, dialog, history, requestService) {
        this.data = data;
        this.dialog = dialog;
        this.history = history;
        this.requestService = requestService;
    }
    ngOnInit() {
        this.setSpinnerOptions();
        if (this.data.patch)
            this.makeRequest();
        else
            this.closeDialogAfterDelay();
    }
    makeRequest() {
        this.loading = true;
        switch (this.data.patch.type) {
            case 'delete':
                this.doDelete();
                break;
            case 'get':
                this.doGet();
                break;
            case 'patch':
                this.doPatch();
                break;
            case 'post':
                this.doPost();
                break;
        }
    }
    doPatch() {
        this.requestService.doPatch(this.data.patch.path, this.data.patch.body, this.data.patch.version, false).subscribe(res => {
            this.data.response = res;
            this.loading = false;
            this.closeDialogAfterDelay();
        }, err => {
            this.loading = false;
            this.httpError = {
                error: typeof err.error !== 'undefined' ? err.error.message : err.statusText,
                code: err.status
            };
        });
    }
    doDelete() {
        this.requestService.doDelete(this.data.patch.path, this.data.patch.body, this.data.patch.version, false).subscribe(res => {
            this.data.response = res;
            this.loading = false;
            this.closeDialogAfterDelay();
        }, err => {
            this.loading = false;
            this.httpError.error = typeof err.error !== 'undefined' ? err.error.message : err.statusText;
            this.httpError.code = err.status;
        });
    }
    doPost() {
        this.requestService.doPost(this.data.patch.path, this.data.patch.body, this.data.patch.version, false).subscribe(res => {
            this.data.response = res;
            this.loading = false;
            this.closeDialogAfterDelay();
        }, err => {
            this.loading = false;
            this.httpError.error = typeof err.error !== 'undefined' ? err.error.message : err.statusText;
            this.httpError.code = err.status;
        });
    }
    doGet() {
        this.requestService.doGet(this.data.patch.path, {}, this.data.patch.version, false).subscribe(res => {
            this.loading = false;
            this.data.response = res;
            this.closeDialogAfterDelay();
        }, err => {
            this.loading = false;
            this.httpError.error = typeof err.error !== 'undefined' ? err.error.message : err.statusText;
            this.httpError.code = err.status;
        });
    }
    close() {
        this.dialog.close();
    }
    closeDialogAfterDelay() {
        setTimeout(() => {
            this.dialog.close();
        }, this.data.timeDelay ? this.data.timeDelay : 1000);
    }
    setSpinnerOptions() {
        this.mainSpinner = {
            diameter: 100,
            strokeWidth: 10,
        };
    }
}
DialogComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-dialog',
                template: "<lib-main-spinner *ngIf=\"loading\" [options]=\"mainSpinner\"></lib-main-spinner>\n\n<h1 *ngIf=\"!loading && data.message && !httpError\">{{data.message}} </h1>\n<h2 *ngIf=\"!loading && data.body && !httpError\" class=\"dc-data-body\"> {{data.body}} </h2>\n<h2 *ngIf=\"!loading && httpError\">Error: {{httpError.code}} - {{httpError.error}}</h2>\n<button *ngIf=\"!loading && httpError\" mat-raised-button (click)=\"close()\">Close</button>\n",
                styles: [".dc-data-body{font-size:var(--text-lg);text-transform:capitalize}"]
            },] }
];
DialogComponent.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [MAT_DIALOG_DATA,] }] },
    { type: MatDialogRef },
    { type: PopRouteHistoryResolver },
    { type: PopRequestService }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2Jhc2UvcG9wLWFqYXgtZGlhbG9nL2RpYWxvZy9kaWFsb2cuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQVUsTUFBTSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzFELE9BQU8sRUFBRSxlQUFlLEVBQUUsWUFBWSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFFekUsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0saURBQWlELENBQUM7QUFHMUYsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sMENBQTBDLENBQUM7QUFRN0UsTUFBTSxPQUFPLGVBQWU7SUFNMUIsWUFDa0MsSUFBa0MsRUFDMUQsTUFBNEMsRUFDNUMsT0FBZ0MsRUFDaEMsY0FBaUM7UUFIVCxTQUFJLEdBQUosSUFBSSxDQUE4QjtRQUMxRCxXQUFNLEdBQU4sTUFBTSxDQUFzQztRQUM1QyxZQUFPLEdBQVAsT0FBTyxDQUF5QjtRQUNoQyxtQkFBYyxHQUFkLGNBQWMsQ0FBbUI7SUFFM0MsQ0FBQztJQUdELFFBQVE7UUFDTixJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUN6QixJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSztZQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQzs7WUFDcEMsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7SUFDcEMsQ0FBQztJQUdPLFdBQVc7UUFDakIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7UUFDcEIsUUFBUSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUU7WUFDNUIsS0FBSyxRQUFRO2dCQUNYLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDaEIsTUFBTTtZ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ZCxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3RCLENBQUMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3ZELENBQUM7SUFHTyxpQkFBaUI7UUFDdkIsSUFBSSxDQUFDLFdBQVcsR0FBRztZQUNqQixRQUFRLEVBQUUsR0FBRztZQUNiLFdBQVcsRUFBRSxFQUFFO1NBQ2hCLENBQUM7SUFDSixDQUFDOzs7WUF4SEYsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSxZQUFZO2dCQUN0QixxY0FBc0M7O2FBRXZDOzs7NENBUUksTUFBTSxTQUFDLGVBQWU7WUFwQkQsWUFBWTtZQUU3Qix1QkFBdUI7WUFHdkIsaUJBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBPbkluaXQsIEluamVjdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgTUFUX0RJQUxPR19EQVRBLCBNYXREaWFsb2dSZWYgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9kaWFsb2cnO1xuaW1wb3J0IHsgUG9wQWpheERpYWxvZ0NvbXBvbmVudCB9IGZyb20gJy4uL3BvcC1hamF4LWRpYWxvZy5jb21wb25lbnQnO1xuaW1wb3J0IHsgUG9wUm91dGVIaXN0b3J5UmVzb2x2ZXIgfSBmcm9tICcuLi8uLi8uLi8uLi9zZXJ2aWNlcy9wb3Atcm91dGUtaGlzdG9yeS5yZXNvbHZlcic7XG5pbXBvcnQgeyBQb3BBamF4RGlhbG9nQ29uZmlnSW50ZXJmYWNlIH0gZnJvbSAnLi4vcG9wLWFqYXgtZGlhbG9nLm1vZGVsJztcbmltcG9ydCB7IE1haW5TcGlubmVyIH0gZnJvbSAnLi4vLi4vcG9wLWluZGljYXRvcnMvcG9wLWluZGljYXRvcnMubW9kZWwnO1xuaW1wb3J0IHsgUG9wUmVxdWVzdFNlcnZpY2UgfSBmcm9tICcuLi8uLi8uLi8uLi9zZXJ2aWNlcy9wb3AtcmVxdWVzdC5zZXJ2aWNlJztcblxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdsaWItZGlhbG9nJyxcbiAgdGVtcGxhdGVVcmw6ICcuL2RpYWxvZy5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWyAnLi9kaWFsb2cuY29tcG9uZW50LnNjc3MnIF1cbn0pXG5leHBvcnQgY2xhc3MgRGlhbG9nQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0IHtcbiAgbWFpblNwaW5uZXI6IE1haW5TcGlubmVyO1xuICBsb2FkaW5nOiBib29sZWFuO1xuICBodHRwRXJyb3I6IHsgZXJyb3I6IHN0cmluZywgY29kZTogbnVtYmVyIH07XG5cblxuICBjb25zdHJ1Y3RvcihcbiAgICBASW5qZWN0KE1BVF9ESUFMT0dfREFUQSkgcHVibGljIGRhdGE6IFBvcEFqYXhEaWFsb2dDb25maWdJbnRlcmZhY2UsXG4gICAgcHJpdmF0ZSBkaWFsb2c6IE1hdERpYWxvZ1JlZjxQb3BBamF4RGlhbG9nQ29tcG9uZW50PixcbiAgICBwcml2YXRlIGhpc3Rvcnk6IFBvcFJvdXRlSGlzdG9yeVJlc29sdmVyLFxuICAgIHByaXZhdGUgcmVxdWVzdFNlcnZpY2U6IFBvcFJlcXVlc3RTZXJ2aWNlLFxuICApe1xuICB9XG5cblxuICBuZ09uSW5pdCgpe1xuICAgIHRoaXMuc2V0U3Bpbm5lck9wdGlvbnMoKTtcbiAgICBpZiggdGhpcy5kYXRhLnBhdGNoICkgdGhpcy5tYWtlUmVxdWVzdCgpO1xuICAgIGVsc2UgdGhpcy5jbG9zZURpYWxvZ0FmdGVyRGVsYXkoKTtcbiAgfVxuXG5cbiAgcHJpdmF0ZSBtYWtlUmVxdWVzdCgpOiB2b2lke1xuICAgIHRoaXMubG9hZGluZyA9IHRydWU7XG4gICAgc3dpdGNoKCB0aGlzLmRhdGEucGF0Y2gudHlwZSApe1xuICAgICAgY2FzZSAnZGVsZXRlJzpcbiAgICAgICAgdGhpcy5kb0RlbGV0ZSgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2dldCc6XG4gICAgICAgIHRoaXMuZG9HZXQoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdwYXRjaCc6XG4gICAgICAgIHRoaXMuZG9QYXRjaCgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3Bvc3QnOlxuICAgICAgICB0aGlzLmRvUG9zdCgpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuXG4gIHByaXZhdGUgZG9QYXRjaCgpOiB2b2lke1xuICAgIHRoaXMucmVxdWVzdFNlcnZpY2UuZG9QYXRjaCh0aGlzLmRhdGEucGF0Y2gucGF0aCwgdGhpcy5kYXRhLnBhdGNoLmJvZHksIHRoaXMuZGF0YS5wYXRjaC52ZXJzaW9uLCBmYWxzZSkuc3Vic2NyaWJlKHJlcyA9PiB7XG4gICAgICB0aGlzLmRhdGEucmVzcG9uc2UgPSByZXM7XG4gICAgICB0aGlzLmxvYWRpbmcgPSBmYWxzZTtcbiAgICAgIHRoaXMuY2xvc2VEaWFsb2dBZnRlckRlbGF5KCk7XG4gICAgfSwgZXJyID0+IHtcbiAgICAgIHRoaXMubG9hZGluZyA9IGZhbHNlO1xuICAgICAgdGhpcy5odHRwRXJyb3IgPSB7XG4gICAgICAgIGVycm9yOiB0eXBlb2YgZXJyLmVycm9yICE9PSAndW5kZWZpbmVkJyA/IGVyci5lcnJvci5tZXNzYWdlIDogZXJyLnN0YXR1c1RleHQsXG4gICAgICAgIGNvZGU6IGVyci5zdGF0dXNcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuXG4gIHByaXZhdGUgZG9EZWxldGUoKTogdm9pZHtcbiAgICB0aGlzLnJlcXVlc3RTZXJ2aWNlLmRvRGVsZXRlKHRoaXMuZGF0YS5wYXRjaC5wYXRoLCB0aGlzLmRhdGEucGF0Y2guYm9keSwgdGhpcy5kYXRhLnBhdGNoLnZlcnNpb24sIGZhbHNlKS5zdWJzY3JpYmUocmVzID0+IHtcbiAgICAgIHRoaXMuZGF0YS5yZXNwb25zZSA9IHJlcztcbiAgICAgIHRoaXMubG9hZGluZyA9IGZhbHNlO1xuICAgICAgdGhpcy5jbG9zZURpYWxvZ0FmdGVyRGVsYXkoKTtcbiAgICB9LCBlcnIgPT4ge1xuICAgICAgdGhpcy5sb2FkaW5nID0gZmFsc2U7XG4gICAgICB0aGlzLmh0dHBFcnJvci5lcnJvciA9IHR5cGVvZiBlcnIuZXJyb3IgIT09ICd1bmRlZmluZWQnID8gZXJyLmVycm9yLm1lc3NhZ2UgOiBlcnIuc3RhdHVzVGV4dDtcbiAgICAgIHRoaXMuaHR0cEVycm9yLmNvZGUgPSBlcnIuc3RhdHVzO1xuICAgIH0pO1xuXG4gIH1cblxuXG4gIHByaXZhdGUgZG9Qb3N0KCk6IHZvaWR7XG4gICAgdGhpcy5yZXF1ZXN0U2VydmljZS5kb1Bvc3QodGhpcy5kYXRhLnBhdGNoLnBhdGgsIHRoaXMuZGF0YS5wYXRjaC5ib2R5LCB0aGlzLmRhdGEucGF0Y2gudmVyc2lvbiwgZmFsc2UpLnN1YnNjcmliZShyZXMgPT4ge1xuICAgICAgdGhpcy5kYXRhLnJlc3BvbnNlID0gcmVzO1xuICAgICAgdGhpcy5sb2FkaW5nID0gZmFsc2U7XG4gICAgICB0aGlzLmNsb3NlRGlhbG9nQWZ0ZXJEZWxheSgpO1xuICAgIH0sIGVyciA9PiB7XG4gICAgICB0aGlzLmxvYWRpbmcgPSBmYWxzZTtcbiAgICAgIHRoaXMuaHR0cEVycm9yLmVycm9yID0gdHlwZW9mIGVyci5lcnJvciAhPT0gJ3VuZGVmaW5lZCcgPyBlcnIuZXJyb3IubWVzc2FnZSA6IGVyci5zdGF0dXNUZXh0O1xuICAgICAgdGhpcy5odHRwRXJyb3IuY29kZSA9IGVyci5zdGF0dXM7XG4gICAgfSk7XG5cbiAgfVxuXG5cbiAgcHJpdmF0ZSBkb0dldCgpOiB2b2lke1xuICAgIHRoaXMucmVxdWVzdFNlcnZpY2UuZG9HZXQodGhpcy5kYXRhLnBhdGNoLnBhdGgsIHt9LHRoaXMuZGF0YS5wYXRjaC52ZXJzaW9uLCBmYWxzZSkuc3Vic2NyaWJlKHJlcyA9PiB7XG4gICAgICB0aGlzLmxvYWRpbmcgPSBmYWxzZTtcbiAgICAgIHRoaXMuZGF0YS5yZXNwb25zZSA9IHJlcztcbiAgICAgIHRoaXMuY2xvc2VEaWFsb2dBZnRlckRlbGF5KCk7XG4gICAgfSwgZXJyID0+IHtcbiAgICAgIHRoaXMubG9hZGluZyA9IGZhbHNlO1xuICAgICAgdGhpcy5odHRwRXJyb3IuZXJyb3IgPSB0eXBlb2YgZXJyLmVycm9yICE9PSAndW5kZWZpbmVkJyA/IGVyci5lcnJvci5tZXNzYWdlIDogZXJyLnN0YXR1c1RleHQ7XG4gICAgICB0aGlzLmh0dHBFcnJvci5jb2RlID0gZXJyLnN0YXR1cztcbiAgICB9KTtcblxuICB9XG5cblxuICBwdWJsaWMgY2xvc2UoKTogdm9pZHtcbiAgICB0aGlzLmRpYWxvZy5jbG9zZSgpO1xuICB9XG5cblxuICBwcml2YXRlIGNsb3NlRGlhbG9nQWZ0ZXJEZWxheSgpOiB2b2lke1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5kaWFsb2cuY2xvc2UoKTtcbiAgICB9LCB0aGlzLmRhdGEudGltZURlbGF5ID8gdGhpcy5kYXRhLnRpbWVEZWxheSA6IDEwMDApO1xuICB9XG5cblxuICBwcml2YXRlIHNldFNwaW5uZXJPcHRpb25zKCk6IHZvaWR7XG4gICAgdGhpcy5tYWluU3Bpbm5lciA9IHtcbiAgICAgIGRpYW1ldGVyOiAxMDAsXG4gICAgICBzdHJva2VXaWR0aDogMTAsXG4gICAgfTtcbiAgfVxufVxuIl19