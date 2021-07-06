import { Component, ElementRef, Input } from '@angular/core';
import { PopExtendComponent } from '../../../../../../pop-extend.component';
export class EntitySchemeTableContentComponent extends PopExtendComponent {
    constructor(el) {
        super();
        this.el = el;
        this.config = {};
        this.name = 'EntitySchemeTableContentComponent';
        this.dom.configure = () => {
            return new Promise((resolve) => {
                return resolve(true);
            });
        };
    }
    /**
     * This component is responsible to render the inner contents of table asset
     * A table asset is basically a column that exists on the base table of an entity, ..ie: id, name, description ...
     */
    ngOnInit() {
        super.ngOnInit();
    }
    /**
     * Clean up the dom of this component
     */
    ngOnDestroy() {
        super.ngOnDestroy();
    }
}
EntitySchemeTableContentComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-entity-scheme-table-content',
                template: "<p>\n  profile-scheme-table-asset works!\n</p>\n",
                styles: [""]
            },] }
];
EntitySchemeTableContentComponent.ctorParameters = () => [
    { type: ElementRef }
];
EntitySchemeTableContentComponent.propDecorators = {
    config: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50aXR5LXNjaGVtZS10YWJsZS1jb250ZW50LmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2VudGl0eS9wb3AtZW50aXR5LXNjaGVtZS9wb3AtZW50aXR5LXNjaGVtZS1hc3NldC1sYXlvdXQvZW50aXR5LXNjaGVtZS1sYXlvdXQtc2VjdGlvbi9lbnRpdHktc2NoZW1lLXRhYmxlLWNvbnRlbnQvZW50aXR5LXNjaGVtZS10YWJsZS1jb250ZW50LmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQXFCLE1BQU0sZUFBZSxDQUFDO0FBRWhGLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBUTVFLE1BQU0sT0FBTyxpQ0FBa0MsU0FBUSxrQkFBa0I7SUFLdkUsWUFDUyxFQUFjO1FBRXJCLEtBQUssRUFBRSxDQUFDO1FBRkQsT0FBRSxHQUFGLEVBQUUsQ0FBWTtRQUxkLFdBQU0sR0FBNkQsRUFBRSxDQUFDO1FBRXhFLFNBQUksR0FBRSxtQ0FBbUMsQ0FBQztRQU0vQyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxHQUFxQixFQUFFO1lBQzFDLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtnQkFDN0IsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdkIsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUM7SUFDSixDQUFDO0lBR0Q7OztPQUdHO0lBQ0gsUUFBUTtRQUNOLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNuQixDQUFDO0lBSUQ7O09BRUc7SUFDSCxXQUFXO1FBQ1QsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3RCLENBQUM7OztZQXJDRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLGlDQUFpQztnQkFDM0MsNERBQTJEOzthQUU1RDs7O1lBVG1CLFVBQVU7OztxQkFXM0IsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgRWxlbWVudFJlZiwgSW5wdXQsIE9uRGVzdHJveSwgT25Jbml0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBQcm9maWxlU2NoZW1lRmllbGRJbnRlcmZhY2UgfSBmcm9tICcuLi8uLi8uLi9wb3AtZW50aXR5LXNjaGVtZS5tb2RlbCc7XG5pbXBvcnQgeyBQb3BFeHRlbmRDb21wb25lbnQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi8uLi9wb3AtZXh0ZW5kLmNvbXBvbmVudCc7XG5cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbGliLWVudGl0eS1zY2hlbWUtdGFibGUtY29udGVudCcsXG4gIHRlbXBsYXRlVXJsOiAnLi9lbnRpdHktc2NoZW1lLXRhYmxlLWNvbnRlbnQuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsgJy4vZW50aXR5LXNjaGVtZS10YWJsZS1jb250ZW50LmNvbXBvbmVudC5zY3NzJyBdXG59KVxuZXhwb3J0IGNsYXNzIEVudGl0eVNjaGVtZVRhYmxlQ29udGVudENvbXBvbmVudCBleHRlbmRzIFBvcEV4dGVuZENvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcbiAgQElucHV0KCkgY29uZmlnOiBQcm9maWxlU2NoZW1lRmllbGRJbnRlcmZhY2UgPSA8UHJvZmlsZVNjaGVtZUZpZWxkSW50ZXJmYWNlPnt9O1xuXG4gIHB1YmxpYyBuYW1lID0nRW50aXR5U2NoZW1lVGFibGVDb250ZW50Q29tcG9uZW50JztcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgZWw6IEVsZW1lbnRSZWYsXG4gICl7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmRvbS5jb25maWd1cmUgPSAoKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgcmV0dXJuIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cblxuICAvKipcbiAgICogVGhpcyBjb21wb25lbnQgaXMgcmVzcG9uc2libGUgdG8gcmVuZGVyIHRoZSBpbm5lciBjb250ZW50cyBvZiB0YWJsZSBhc3NldFxuICAgKiBBIHRhYmxlIGFzc2V0IGlzIGJhc2ljYWxseSBhIGNvbHVtbiB0aGF0IGV4aXN0cyBvbiB0aGUgYmFzZSB0YWJsZSBvZiBhbiBlbnRpdHksIC4uaWU6IGlkLCBuYW1lLCBkZXNjcmlwdGlvbiAuLi5cbiAgICovXG4gIG5nT25Jbml0KCl7XG4gICAgc3VwZXIubmdPbkluaXQoKTtcbiAgfVxuXG5cblxuICAvKipcbiAgICogQ2xlYW4gdXAgdGhlIGRvbSBvZiB0aGlzIGNvbXBvbmVudFxuICAgKi9cbiAgbmdPbkRlc3Ryb3koKXtcbiAgICBzdXBlci5uZ09uRGVzdHJveSgpO1xuICB9XG59XG4iXX0=