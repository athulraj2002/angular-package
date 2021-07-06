import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
export class PopNavigationDialogComponent {
    constructor(data, dialog, router) {
        this.data = data;
        this.dialog = dialog;
        this.router = router;
    }
    ngOnInit() {
        if (!this.data.display)
            this.data.display = 'Navigation List';
        if (!this.data.list || !Array.isArray(this.data.list))
            this.data.list = [];
        if (!this.data.basePath || !(typeof this.data.basePath === 'string'))
            this.data.basePath = null;
    }
    navigate(item) {
        this.dialog.close();
        if (item.path) {
            this.router.navigateByUrl(item.path).catch(e => false);
        }
        else if (this.data.basePath && item.id) {
            this.router.navigateByUrl(`${this.data.basePath}/${item.id}/general`).catch(e => false);
        }
    }
    cancel() {
        this.dialog.close(null);
    }
}
PopNavigationDialogComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-navigation-dialog',
                template: "<h1 class=\"navigation-header\">{{data.display}}</h1>\n<mat-nav-list class=\"pt-10\">\n  <mat-list-item matRipple *ngFor=\"let item of data.list\" (click)=\"navigate(item);\"> {{item.name}}</mat-list-item>\n</mat-nav-list>\n",
                styles: [".navigation-header{text-align:center}mat-list-item{padding:2px 20px}mat-dialog-container{padding:12px!important}mat-nav-list{padding:2px!important;min-height:30px;max-height:400px;overflow-y:auto}"]
            },] }
];
PopNavigationDialogComponent.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [MAT_DIALOG_DATA,] }] },
    { type: MatDialogRef },
    { type: Router }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLW5hdmlnYXRpb24tZGlhbG9nLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2Jhc2UvcG9wLWRpYWxvZ3MvcG9wLW5hdmlnYXRpb24tZGlhbG9nL3BvcC1uYXZpZ2F0aW9uLWRpYWxvZy5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQVUsTUFBTSxlQUFlLENBQUM7QUFDMUQsT0FBTyxFQUFFLGVBQWUsRUFBRSxZQUFZLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUV6RSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFRekMsTUFBTSxPQUFPLDRCQUE0QjtJQUV2QyxZQUNrQyxJQUFzQyxFQUMvRCxNQUFrRCxFQUNqRCxNQUFjO1FBRlUsU0FBSSxHQUFKLElBQUksQ0FBa0M7UUFDL0QsV0FBTSxHQUFOLE1BQU0sQ0FBNEM7UUFDakQsV0FBTSxHQUFOLE1BQU0sQ0FBUTtJQUV4QixDQUFDO0lBR0QsUUFBUTtRQUNOLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU87WUFBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxpQkFBaUIsQ0FBQztRQUMvRCxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQzVFLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLENBQUUsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsS0FBSyxRQUFRLENBQUU7WUFBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7SUFDckcsQ0FBQztJQUdELFFBQVEsQ0FBQyxJQUFzQztRQUM3QyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3BCLElBQUksSUFBSSxDQUFDLElBQUksRUFBRTtZQUNiLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUN4RDthQUFLLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLEVBQUUsRUFBRTtZQUN2QyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ3pGO0lBQ0gsQ0FBQztJQUdELE1BQU07UUFDSixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMxQixDQUFDOzs7WUFsQ0YsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSwyQkFBMkI7Z0JBQ3JDLDRPQUFxRDs7YUFFdEQ7Ozs0Q0FJSSxNQUFNLFNBQUMsZUFBZTtZQWJELFlBQVk7WUFFN0IsTUFBTSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgSW5qZWN0LCBPbkluaXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE1BVF9ESUFMT0dfREFUQSwgTWF0RGlhbG9nUmVmIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvZGlhbG9nJztcbmltcG9ydCB7IFBvcE5hdmlnYXRpb25EaWFsb2dEYXRhSW50ZXJmYWNlLCBQb3BOYXZpZ2F0aW9uRGlhbG9nSXRlbUludGVyZmFjZSB9IGZyb20gJy4uL3BvcC1kaWFsb2dzLm1vZGVsJztcbmltcG9ydCB7IFJvdXRlciB9IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XG5cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbGliLXBvcC1uYXZpZ2F0aW9uLWRpYWxvZycsXG4gIHRlbXBsYXRlVXJsOiAnLi9wb3AtbmF2aWdhdGlvbi1kaWFsb2cuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsgJy4vcG9wLW5hdmlnYXRpb24tZGlhbG9nLmNvbXBvbmVudC5zY3NzJyBdXG59KVxuZXhwb3J0IGNsYXNzIFBvcE5hdmlnYXRpb25EaWFsb2dDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQge1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIEBJbmplY3QoTUFUX0RJQUxPR19EQVRBKSBwdWJsaWMgZGF0YTogUG9wTmF2aWdhdGlvbkRpYWxvZ0RhdGFJbnRlcmZhY2UsXG4gICAgcHVibGljIGRpYWxvZzogTWF0RGlhbG9nUmVmPFBvcE5hdmlnYXRpb25EaWFsb2dDb21wb25lbnQ+LFxuICAgIHByaXZhdGUgcm91dGVyOiBSb3V0ZXJcbiAgKXtcbiAgfVxuXG5cbiAgbmdPbkluaXQoKXtcbiAgICBpZiggIXRoaXMuZGF0YS5kaXNwbGF5ICkgdGhpcy5kYXRhLmRpc3BsYXkgPSAnTmF2aWdhdGlvbiBMaXN0JztcbiAgICBpZiggIXRoaXMuZGF0YS5saXN0IHx8ICFBcnJheS5pc0FycmF5KHRoaXMuZGF0YS5saXN0KSApIHRoaXMuZGF0YS5saXN0ID0gW107XG4gICAgaWYoICF0aGlzLmRhdGEuYmFzZVBhdGggfHwgISggdHlwZW9mIHRoaXMuZGF0YS5iYXNlUGF0aCA9PT0gJ3N0cmluZycgKSApIHRoaXMuZGF0YS5iYXNlUGF0aCA9IG51bGw7XG4gIH1cblxuXG4gIG5hdmlnYXRlKGl0ZW06IFBvcE5hdmlnYXRpb25EaWFsb2dJdGVtSW50ZXJmYWNlKXtcbiAgICB0aGlzLmRpYWxvZy5jbG9zZSgpO1xuICAgIGlmKCBpdGVtLnBhdGggKXtcbiAgICAgIHRoaXMucm91dGVyLm5hdmlnYXRlQnlVcmwoaXRlbS5wYXRoKS5jYXRjaChlID0+IGZhbHNlKTtcbiAgICB9ZWxzZSBpZiggdGhpcy5kYXRhLmJhc2VQYXRoICYmIGl0ZW0uaWQgKXtcbiAgICAgIHRoaXMucm91dGVyLm5hdmlnYXRlQnlVcmwoYCR7dGhpcy5kYXRhLmJhc2VQYXRofS8ke2l0ZW0uaWR9L2dlbmVyYWxgKS5jYXRjaChlID0+IGZhbHNlKTtcbiAgICB9XG4gIH1cblxuXG4gIGNhbmNlbCgpe1xuICAgIHRoaXMuZGlhbG9nLmNsb3NlKG51bGwpO1xuICB9XG59XG4iXX0=