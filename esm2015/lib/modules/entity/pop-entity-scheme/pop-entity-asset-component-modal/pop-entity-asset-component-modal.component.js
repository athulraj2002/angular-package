import { Component, ElementRef, Input } from '@angular/core';
import { PopExtendComponent } from '../../../../pop-extend.component';
export class PopEntityAssetComponentModalComponent extends PopExtendComponent {
    constructor(el) {
        super();
        this.el = el;
        this.config = {};
        this.name = 'PopEntityAssetComponentModalComponent';
        /**
         * Configure the specifics of this component
         */
        this.dom.configure = () => {
            return new Promise((resolve) => {
                resolve(true);
            });
        };
    }
    /**
     * This component should have a purpose
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
PopEntityAssetComponentModalComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-entity-asset-component-modal',
                template: "<div class=\"profile-scheme-asset-container\" [style.height.px]=\"dom.height.outer\">\n  <div class=\"profile-scheme-asset-header\">\n    <div class=\"sw-label-container-sm\">Edit Component</div>\n  </div>\n\n  <div class=\"profile-scheme-asset-content\">\n    <div class=\"profile-scheme-asset-section-wrapper\">\n      <div class=\"profile-scheme-asset-header pt-02\">\n        <div>{{config.asset.name}} Attributes</div>\n        <!--<div class=\"profile-scheme-asset-item-label-helper\">-->\n        <!--<div class=\"sw-pop-icon profile-scheme-asset-section-header-helper-icon\"-->\n        <!--matTooltip=\"{{dom.asset['fieldItemHelper']}}\"-->\n        <!--matTooltipPosition=\"left\">X-->\n        <!--</div>-->\n        <!--</div>-->\n      </div>\n      <mat-divider></mat-divider>\n      Content\n      <!--<div class=\"profile-scheme-asset-item sw-pointer\" [ngClass]=\"{'profile-scheme-asset-active-selection':dom.active['item']?.entityId === item.entityId}\" (click)=\"onActiveItemSelection(item);\">-->\n        <!--<div class=\"profile-scheme-asset-item-active-selector\" (click)=\"$event.stopPropagation()\">-->\n          <!--&lt;!&ndash;<lib-pop-checkbox *ngIf=\"dom.active['items'][item.entityId]\" [config]=\"dom.active['items'][item.entityId]\" (events)=\"onItemActiveChange($event);\"></lib-pop-checkbox>&ndash;&gt;-->\n        <!--</div>-->\n        <!--<div class=\"profile-scheme-asset-item-label-name\">{{item.name}}</div>-->\n        <!--<div class=\"profile-scheme-asset-item-label-helper\">-->\n          <!--<div class=\"sw-pop-icon profile-scheme-asset-item-helper-icon\"-->\n               <!--matTooltip=\"{{item.display}}\"-->\n               <!--matTooltipPosition=\"left\">X-->\n          <!--</div>-->\n        <!--</div>-->\n      <!--</div>-->\n    </div>\n\n    <div class=\"profile-scheme-asset-section-wrapper\">\n      asDAsd\n    </div>\n\n    <div class=\"profile-scheme-asset-section-wrapper\">\n      SDAFSADF\n    </div>\n\n  </div>\n</div>\n",
                styles: [".profile-scheme-asset-container{min-width:700px;flex-direction:column}.profile-scheme-asset-container,.profile-scheme-asset-content{position:relative;display:flex;height:100%;box-sizing:border-box}.profile-scheme-asset-content{width:100%;flex-direction:row}.profile-scheme-asset-section-wrapper{flex:1;border:1px solid var(--border);width:300px;margin:15px;box-sizing:border-box}.profile-scheme-asset-item:hover{background-color:var(--darken02)}.profile-scheme-asset-header{position:relative;display:flex;flex-direction:row;height:40px;padding:0 5px 0 10px;align-items:center;justify-content:space-between;font-size:1em;font-weight:700;clear:both;box-sizing:border-box}.profile-scheme-asset-item{justify-content:flex-start;border-bottom:1px solid var(--border);padding-left:5px}.profile-scheme-asset-item,.profile-scheme-asset-item-active-selector{display:flex;align-items:center;box-sizing:border-box;-moz-box-sizing:border-box}.profile-scheme-asset-item-active-selector{position:relative;flex-direction:row;width:15%;justify-content:center}.profile-scheme-asset-active-selection{padding-left:0!important;border-left:5px solid var(--primary)}.profile-scheme-asset-item-label-name{width:75%;align-items:center;justify-content:start;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.profile-scheme-asset-item-label-helper{display:flex;width:10%;align-items:center;justify-content:center;min-height:40px}.profile-scheme-asset-item-helper-icon{margin-top:10px;margin-right:2px;width:20px;height:20px;font-size:.7em;z-index:2}"]
            },] }
];
PopEntityAssetComponentModalComponent.ctorParameters = () => [
    { type: ElementRef }
];
PopEntityAssetComponentModalComponent.propDecorators = {
    config: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS1hc3NldC1jb21wb25lbnQtbW9kYWwuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvZW50aXR5L3BvcC1lbnRpdHktc2NoZW1lL3BvcC1lbnRpdHktYXNzZXQtY29tcG9uZW50LW1vZGFsL3BvcC1lbnRpdHktYXNzZXQtY29tcG9uZW50LW1vZGFsLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQXFCLE1BQU0sZUFBZSxDQUFDO0FBRWhGLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGtDQUFrQyxDQUFDO0FBUXRFLE1BQU0sT0FBTyxxQ0FBc0MsU0FBUSxrQkFBa0I7SUFNM0UsWUFDUyxFQUFjO1FBRXJCLEtBQUssRUFBRSxDQUFDO1FBRkQsT0FBRSxHQUFGLEVBQUUsQ0FBWTtRQU5kLFdBQU0sR0FBK0QsRUFBRSxDQUFDO1FBRTFFLFNBQUksR0FBRyx1Q0FBdUMsQ0FBQztRQU9wRDs7V0FFRztRQUNILElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLEdBQXFCLEVBQUU7WUFDMUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO2dCQUM3QixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDaEIsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUM7SUFDSixDQUFDO0lBR0Q7O09BRUc7SUFDSCxRQUFRO1FBQ04sS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ25CLENBQUM7SUFHRDs7T0FFRztJQUNILFdBQVc7UUFDVCxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDdEIsQ0FBQzs7O1lBdkNGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsc0NBQXNDO2dCQUNoRCxrOURBQWdFOzthQUVqRTs7O1lBVG1CLFVBQVU7OztxQkFXM0IsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgRWxlbWVudFJlZiwgSW5wdXQsIE9uRGVzdHJveSwgT25Jbml0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBFbnRpdHlTY2hlbWVTZWN0aW9uSW50ZXJmYWNlIH0gZnJvbSAnLi4vcG9wLWVudGl0eS1zY2hlbWUubW9kZWwnO1xuaW1wb3J0IHsgUG9wRXh0ZW5kQ29tcG9uZW50IH0gZnJvbSAnLi4vLi4vLi4vLi4vcG9wLWV4dGVuZC5jb21wb25lbnQnO1xuXG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2xpYi1wb3AtZW50aXR5LWFzc2V0LWNvbXBvbmVudC1tb2RhbCcsXG4gIHRlbXBsYXRlVXJsOiAnLi9wb3AtZW50aXR5LWFzc2V0LWNvbXBvbmVudC1tb2RhbC5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWyAnLi9wb3AtZW50aXR5LWFzc2V0LWNvbXBvbmVudC1tb2RhbC5jb21wb25lbnQuc2NzcycgXVxufSlcbmV4cG9ydCBjbGFzcyBQb3BFbnRpdHlBc3NldENvbXBvbmVudE1vZGFsQ29tcG9uZW50IGV4dGVuZHMgUG9wRXh0ZW5kQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xuICBASW5wdXQoKSBjb25maWc6IEVudGl0eVNjaGVtZVNlY3Rpb25JbnRlcmZhY2UgPSA8RW50aXR5U2NoZW1lU2VjdGlvbkludGVyZmFjZT57fTtcblxuICBwdWJsaWMgbmFtZSA9ICdQb3BFbnRpdHlBc3NldENvbXBvbmVudE1vZGFsQ29tcG9uZW50JztcblxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBlbDogRWxlbWVudFJlZixcbiAgKXtcbiAgICBzdXBlcigpO1xuICAgIC8qKlxuICAgICAqIENvbmZpZ3VyZSB0aGUgc3BlY2lmaWNzIG9mIHRoaXMgY29tcG9uZW50XG4gICAgICovXG4gICAgdGhpcy5kb20uY29uZmlndXJlID0gKCk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cblxuICAvKipcbiAgICogVGhpcyBjb21wb25lbnQgc2hvdWxkIGhhdmUgYSBwdXJwb3NlXG4gICAqL1xuICBuZ09uSW5pdCgpe1xuICAgIHN1cGVyLm5nT25Jbml0KCk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBDbGVhbiB1cCB0aGUgZG9tIG9mIHRoaXMgY29tcG9uZW50XG4gICAqL1xuICBuZ09uRGVzdHJveSgpe1xuICAgIHN1cGVyLm5nT25EZXN0cm95KCk7XG4gIH1cblxufVxuIl19