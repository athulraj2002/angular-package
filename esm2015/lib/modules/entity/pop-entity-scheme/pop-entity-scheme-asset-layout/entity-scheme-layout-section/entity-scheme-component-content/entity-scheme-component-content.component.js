import { Component, ElementRef, Input } from '@angular/core';
import { PopExtendComponent } from '../../../../../../pop-extend.component';
export class EntitySchemeComponentContentComponent extends PopExtendComponent {
    constructor(el) {
        super();
        this.el = el;
        this.config = {};
        this.name = 'EntitySchemeComponentContentComponent';
        this.dom.configure = () => {
            return new Promise((resolve) => {
                resolve(true);
            });
        };
    }
    /**
     * This component is responsible to render the inner contents of component asset
     * A component asset is custom widget that has been created for the entityId
     */
    ngOnInit() {
        super.ngOnInit();
        this.dom.configure().then(() => {
            this.dom.register();
            this.dom.ready();
        });
    }
    /**
     * Clean up the dom of this component
     */
    ngOnDestroy() {
        super.ngOnDestroy();
    }
}
EntitySchemeComponentContentComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-entity-scheme-component-content',
                template: "<p>\n  profile-scheme-component-asset works!\n</p>\n",
                styles: [".entity-scheme-asset-layout-container{display:flex;flex-direction:row;border-top:1px solid var(--border);border-left:1px solid var(--border);border-bottom:1px solid var(--border);box-sizing:border-box;overflow:hidden}lib-entity-scheme-layout-section{flex:1;flex-basis:150px;border-right:1px solid var(--border)}.entity-scheme-asset-layout-section{flex:1}.entity-scheme-asset-list-content{overflow-y:auto;overflow-x:hidden}.entity-scheme-asset{box-sizing:border-box;margin:10px;border:1px solid var(--border);background:var(--bg-3);font-size:12px}.entity-scheme-asset-menu{position:absolute;justify-content:space-around;top:15px;right:5px;opacity:.8;width:55px;padding-left:5px;z-index:2}.entity-scheme-asset-menu,.entity-scheme-asset-menu-icon{display:flex;align-items:center;height:20px;background:var(--bg-3)}.entity-scheme-asset-menu-icon{justify-content:center;opacity:1!important;width:20px}.entity-scheme-asset-menu-icon .material-icons{font-size:18px}.entity-scheme-asset-handle{position:relative;box-sizing:border-box;cursor:move;width:100%;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.entity-scheme-asset-handle-disabled{pointer-events:none;cursor:none}.entity-scheme-asset-field-container{display:flex;flex-direction:column}.entity-scheme-asset-layout-row{position:relative;display:flex;box-sizing:border-box;width:100%;flex-direction:row;justify-content:flex-start;align-items:center;height:25px;font-size:14px;padding:0 10px;z-index:1}.entity-scheme-asset-layout-row-expanded{border-bottom:1px solid var(--border)}.entity-scheme-asset-layout-subrow{position:relative;display:flex;box-sizing:border-box;width:100%;flex-direction:row;justify-content:flex-start;align-items:flex-start;height:20px;color:var(--disabled);padding:0 10px;font-size:12px;top:2px}.entity-scheme-asset-layout-content-row{position:relative;display:flex;box-sizing:border-box;width:100%;flex-direction:column;min-height:30px}.entity-scheme-asset-item-row{justify-content:flex-start;height:30px;padding:0 10px;border-top:1px solid var(--border);z-index:1}.entity-scheme-asset-item-row,.entity-scheme-asset-toggle-row{position:relative;display:flex;box-sizing:border-box;width:100%;flex-direction:row;align-items:center}.entity-scheme-asset-toggle-row{justify-content:center;height:10px;margin-bottom:5px;overflow:hidden;z-index:3}.entity-scheme-asset-toggle-row .material-icons{position:relative;top:2px;outline:0;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;font-size:18px}.entity-scheme-primary{color:var(--primary-background)}.entity-scheme-required{color:var(--error);font-size:30px;line-height:0px;margin:0;width:10px;position:relative;top:20px;z-index:2}.cdk-drag-preview{overflow:hidden;box-shadow:0 5px 5px -3px rgba(0,0,0,.2),0 8px 10px 1px rgba(0,0,0,.14),0 3px 14px 2px rgba(0,0,0,.12);height:35px}.cdk-drag-preview .entity-scheme-asset-handle{box-sizing:border-box}.cdk-drag-preview .entity-scheme-asset-menu{display:none!important}.cdk-drag-placeholder{opacity:0}.cdk-drag-animating,.entity-scheme-asset-list.cdk-drop-list-dragging .entity-scheme-asset:not(.cdk-drag-placeholder){transition:transform .25s cubic-bezier(0,0,.2,1)}.entity-scheme-asset-field-container{background:#000}"]
            },] }
];
EntitySchemeComponentContentComponent.ctorParameters = () => [
    { type: ElementRef }
];
EntitySchemeComponentContentComponent.propDecorators = {
    config: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50aXR5LXNjaGVtZS1jb21wb25lbnQtY29udGVudC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9lbnRpdHkvcG9wLWVudGl0eS1zY2hlbWUvcG9wLWVudGl0eS1zY2hlbWUtYXNzZXQtbGF5b3V0L2VudGl0eS1zY2hlbWUtbGF5b3V0LXNlY3Rpb24vZW50aXR5LXNjaGVtZS1jb21wb25lbnQtY29udGVudC9lbnRpdHktc2NoZW1lLWNvbXBvbmVudC1jb250ZW50LmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQXFCLE1BQU0sZUFBZSxDQUFDO0FBQ2hGLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBUTVFLE1BQU0sT0FBTyxxQ0FBc0MsU0FBUSxrQkFBa0I7SUFNM0UsWUFDUyxFQUFjO1FBRXJCLEtBQUssRUFBRSxDQUFDO1FBRkQsT0FBRSxHQUFGLEVBQUUsQ0FBWTtRQU5kLFdBQU0sR0FBUSxFQUFFLENBQUM7UUFFbkIsU0FBSSxHQUFFLHVDQUF1QyxDQUFDO1FBUW5ELElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLEdBQXFCLEVBQUU7WUFDMUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO2dCQUM3QixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDaEIsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUM7SUFDSixDQUFDO0lBR0Q7OztPQUdHO0lBQ0gsUUFBUTtRQUNOLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNqQixJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDN0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNwQixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ25CLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUdEOztPQUVHO0lBQ0gsV0FBVztRQUNULEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN0QixDQUFDOzs7WUExQ0YsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSxxQ0FBcUM7Z0JBQy9DLGdFQUErRDs7YUFFaEU7OztZQVJtQixVQUFVOzs7cUJBVTNCLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEVsZW1lbnRSZWYsIElucHV0LCBPbkRlc3Ryb3ksIE9uSW5pdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgUG9wRXh0ZW5kQ29tcG9uZW50IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vLi4vcG9wLWV4dGVuZC5jb21wb25lbnQnO1xuXG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2xpYi1lbnRpdHktc2NoZW1lLWNvbXBvbmVudC1jb250ZW50JyxcbiAgdGVtcGxhdGVVcmw6ICcuL2VudGl0eS1zY2hlbWUtY29tcG9uZW50LWNvbnRlbnQuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsgJy4vZW50aXR5LXNjaGVtZS1jb21wb25lbnQtY29udGVudC5jb21wb25lbnQuc2NzcycgXVxufSlcbmV4cG9ydCBjbGFzcyBFbnRpdHlTY2hlbWVDb21wb25lbnRDb250ZW50Q29tcG9uZW50IGV4dGVuZHMgUG9wRXh0ZW5kQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xuICBASW5wdXQoKSBjb25maWc6IGFueSA9IHt9O1xuXG4gIHB1YmxpYyBuYW1lID0nRW50aXR5U2NoZW1lQ29tcG9uZW50Q29udGVudENvbXBvbmVudCc7XG5cblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgZWw6IEVsZW1lbnRSZWYsXG4gICl7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuZG9tLmNvbmZpZ3VyZSA9ICgpOiBQcm9taXNlPGJvb2xlYW4+ID0+IHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgY29tcG9uZW50IGlzIHJlc3BvbnNpYmxlIHRvIHJlbmRlciB0aGUgaW5uZXIgY29udGVudHMgb2YgY29tcG9uZW50IGFzc2V0XG4gICAqIEEgY29tcG9uZW50IGFzc2V0IGlzIGN1c3RvbSB3aWRnZXQgdGhhdCBoYXMgYmVlbiBjcmVhdGVkIGZvciB0aGUgZW50aXR5SWRcbiAgICovXG4gIG5nT25Jbml0KCl7XG4gICAgc3VwZXIubmdPbkluaXQoKTtcbiAgICB0aGlzLmRvbS5jb25maWd1cmUoKS50aGVuKCgpID0+IHtcbiAgICAgIHRoaXMuZG9tLnJlZ2lzdGVyKCk7XG4gICAgICB0aGlzLmRvbS5yZWFkeSgpO1xuICAgIH0pO1xuICB9XG5cblxuICAvKipcbiAgICogQ2xlYW4gdXAgdGhlIGRvbSBvZiB0aGlzIGNvbXBvbmVudFxuICAgKi9cbiAgbmdPbkRlc3Ryb3koKXtcbiAgICBzdXBlci5uZ09uRGVzdHJveSgpO1xuICB9XG59XG4iXX0=