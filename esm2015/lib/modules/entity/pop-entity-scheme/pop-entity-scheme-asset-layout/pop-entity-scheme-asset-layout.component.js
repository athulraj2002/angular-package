import { __awaiter } from "tslib";
import { Component, ElementRef, ViewEncapsulation } from '@angular/core';
import { PopEntitySchemeService } from '../pop-entity-scheme.service';
import { PopExtendComponent } from '../../../../pop-extend.component';
import { PopDomService } from '../../../../services/pop-dom.service';
// https://medium.com/codetobe/learn-how-to-drag-drop-items-in-angular-7-20395c262ab0
export class PopEntitySchemeAssetLayoutComponent extends PopExtendComponent {
    constructor(el, _domRepo, _schemeRepo) {
        super();
        this.el = el;
        this._domRepo = _domRepo;
        this._schemeRepo = _schemeRepo;
        this.name = 'PopEntitySchemeAssetLayoutComponent';
        this.srv = {
            scheme: undefined
        };
        this.dom.configure = () => {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                yield this.dom.setWithComponentInnerHeight('PopEntityTabColumnComponent', this.position, 210, 600);
                this.ui.sections = this.srv.scheme.ui.sections;
                return resolve(true);
            }));
        };
    }
    /**
     * Setup this component
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
PopEntitySchemeAssetLayoutComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-entity-scheme-asset-layout',
                template: "<div class=\"entity-scheme-asset-layout-container\"  [style.height.px]=\"dom.height.inner\" cdkDropListGroup >\n  <lib-entity-scheme-layout-section *ngFor=\"let section of ui.sections\" [core]=core [section]=section [style.flexGrow]=section.flex></lib-entity-scheme-layout-section>\n</div>\n",
                encapsulation: ViewEncapsulation.None,
                styles: [".entity-scheme-asset-layout-container{display:flex;flex-direction:row;border-top:1px solid var(--border);border-left:1px solid var(--border);border-bottom:1px solid var(--border);box-sizing:border-box;overflow:hidden}lib-entity-scheme-layout-section{flex:1;flex-basis:150px;border-right:1px solid var(--border)}.entity-scheme-asset-layout-section{flex:1}.entity-scheme-asset-list-content{overflow-y:auto;overflow-x:hidden}.entity-scheme-asset{box-sizing:border-box;margin:10px;border:1px solid var(--border);background:var(--bg-3);font-size:12px}.entity-scheme-asset-menu{position:absolute;justify-content:space-around;top:15px;right:5px;opacity:.8;width:55px;padding-left:5px;z-index:2}.entity-scheme-asset-menu,.entity-scheme-asset-menu-icon{display:flex;align-items:center;height:20px;background:var(--bg-3)}.entity-scheme-asset-menu-icon{justify-content:center;opacity:1!important;width:20px}.entity-scheme-asset-menu-icon .material-icons{font-size:18px}.entity-scheme-asset-handle{position:relative;box-sizing:border-box;cursor:move;width:100%;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.entity-scheme-asset-handle-disabled{pointer-events:none;cursor:none}.entity-scheme-asset-field-container{display:flex;flex-direction:column}.entity-scheme-asset-layout-row{position:relative;display:flex;box-sizing:border-box;width:100%;flex-direction:row;justify-content:flex-start;align-items:center;height:25px;font-size:14px;padding:0 10px;z-index:1}.entity-scheme-asset-layout-row-expanded{border-bottom:1px solid var(--border)}.entity-scheme-asset-layout-subrow{position:relative;display:flex;box-sizing:border-box;width:100%;flex-direction:row;justify-content:flex-start;align-items:flex-start;height:20px;color:var(--disabled);padding:0 10px;font-size:12px;top:2px}.entity-scheme-asset-layout-content-row{position:relative;display:flex;box-sizing:border-box;width:100%;flex-direction:column;min-height:30px}.entity-scheme-asset-item-row{justify-content:flex-start;height:30px;padding:0 10px;border-top:1px solid var(--border);z-index:1}.entity-scheme-asset-item-row,.entity-scheme-asset-toggle-row{position:relative;display:flex;box-sizing:border-box;width:100%;flex-direction:row;align-items:center}.entity-scheme-asset-toggle-row{justify-content:center;height:10px;margin-bottom:5px;overflow:hidden;z-index:3}.entity-scheme-asset-toggle-row .material-icons{position:relative;top:2px;outline:0;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;font-size:18px}.entity-scheme-primary{color:var(--primary-background)}.entity-scheme-required{color:var(--error);font-size:30px;line-height:0px;margin:0;width:10px;position:relative;top:20px;z-index:2}.cdk-drag-preview{overflow:hidden;box-shadow:0 5px 5px -3px rgba(0,0,0,.2),0 8px 10px 1px rgba(0,0,0,.14),0 3px 14px 2px rgba(0,0,0,.12);height:35px}.cdk-drag-preview .entity-scheme-asset-handle{box-sizing:border-box}.cdk-drag-preview .entity-scheme-asset-menu{display:none!important}.cdk-drag-placeholder{opacity:0}.cdk-drag-animating,.entity-scheme-asset-list.cdk-drop-list-dragging .entity-scheme-asset:not(.cdk-drag-placeholder){transition:transform .25s cubic-bezier(0,0,.2,1)}"]
            },] }
];
PopEntitySchemeAssetLayoutComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: PopDomService },
    { type: PopEntitySchemeService }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS1zY2hlbWUtYXNzZXQtbGF5b3V0LmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2VudGl0eS9wb3AtZW50aXR5LXNjaGVtZS9wb3AtZW50aXR5LXNjaGVtZS1hc3NldC1sYXlvdXQvcG9wLWVudGl0eS1zY2hlbWUtYXNzZXQtbGF5b3V0LmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQXFCLGlCQUFpQixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzVGLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQ3RFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGtDQUFrQyxDQUFDO0FBQ3RFLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUdyRSxxRkFBcUY7QUFRckYsTUFBTSxPQUFPLG1DQUFvQyxTQUFRLGtCQUFrQjtJQVN6RSxZQUNTLEVBQWMsRUFDWCxRQUF1QixFQUN2QixXQUFtQztRQUU3QyxLQUFLLEVBQUUsQ0FBQztRQUpELE9BQUUsR0FBRixFQUFFLENBQVk7UUFDWCxhQUFRLEdBQVIsUUFBUSxDQUFlO1FBQ3ZCLGdCQUFXLEdBQVgsV0FBVyxDQUF3QjtRQVh4QyxTQUFJLEdBQUcscUNBQXFDLENBQUM7UUFHMUMsUUFBRyxHQUFHO1lBQ2QsTUFBTSxFQUEwQixTQUFTO1NBQzFDLENBQUM7UUFTQSxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxHQUFxQixFQUFFO1lBQzFDLE9BQU8sSUFBSSxPQUFPLENBQUUsQ0FBTyxPQUFPLEVBQUcsRUFBRTtnQkFDckMsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLDJCQUEyQixDQUFFLDZCQUE2QixFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBRSxDQUFDO2dCQUNyRyxJQUFJLENBQUMsRUFBRSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDO2dCQUMvQyxPQUFPLE9BQU8sQ0FBRSxJQUFJLENBQUUsQ0FBQztZQUN6QixDQUFDLENBQUEsQ0FBRSxDQUFDO1FBQ04sQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUdEOztPQUVHO0lBQ0gsUUFBUTtRQUNOLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNuQixDQUFDO0lBR0Q7O09BRUc7SUFDSCxXQUFXO1FBQ1QsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3RCLENBQUM7OztZQTVDRixTQUFTLFNBQUU7Z0JBQ1YsUUFBUSxFQUFFLGdDQUFnQztnQkFDMUMsK1NBQThEO2dCQUU5RCxhQUFhLEVBQUUsaUJBQWlCLENBQUMsSUFBSTs7YUFDdEM7OztZQWJtQixVQUFVO1lBR3JCLGFBQWE7WUFGYixzQkFBc0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEVsZW1lbnRSZWYsIE9uRGVzdHJveSwgT25Jbml0LCBWaWV3RW5jYXBzdWxhdGlvbiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgUG9wRW50aXR5U2NoZW1lU2VydmljZSB9IGZyb20gJy4uL3BvcC1lbnRpdHktc2NoZW1lLnNlcnZpY2UnO1xuaW1wb3J0IHsgUG9wRXh0ZW5kQ29tcG9uZW50IH0gZnJvbSAnLi4vLi4vLi4vLi4vcG9wLWV4dGVuZC5jb21wb25lbnQnO1xuaW1wb3J0IHsgUG9wRG9tU2VydmljZSB9IGZyb20gJy4uLy4uLy4uLy4uL3NlcnZpY2VzL3BvcC1kb20uc2VydmljZSc7XG5cblxuLy8gaHR0cHM6Ly9tZWRpdW0uY29tL2NvZGV0b2JlL2xlYXJuLWhvdy10by1kcmFnLWRyb3AtaXRlbXMtaW4tYW5ndWxhci03LTIwMzk1YzI2MmFiMFxuXG5AQ29tcG9uZW50KCB7XG4gIHNlbGVjdG9yOiAnbGliLWVudGl0eS1zY2hlbWUtYXNzZXQtbGF5b3V0JyxcbiAgdGVtcGxhdGVVcmw6ICcuL3BvcC1lbnRpdHktc2NoZW1lLWFzc2V0LWxheW91dC5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWyAnLi9wb3AtZW50aXR5LXNjaGVtZS1hc3NldC1sYXlvdXQuY29tcG9uZW50LnNjc3MnIF0sXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmVcbn0gKVxuZXhwb3J0IGNsYXNzIFBvcEVudGl0eVNjaGVtZUFzc2V0TGF5b3V0Q29tcG9uZW50IGV4dGVuZHMgUG9wRXh0ZW5kQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xuICBwdWJsaWMgbmFtZSA9ICdQb3BFbnRpdHlTY2hlbWVBc3NldExheW91dENvbXBvbmVudCc7XG5cblxuICBwcm90ZWN0ZWQgc3J2ID0ge1xuICAgIHNjaGVtZTogPFBvcEVudGl0eVNjaGVtZVNlcnZpY2U+dW5kZWZpbmVkXG4gIH07XG5cblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgZWw6IEVsZW1lbnRSZWYsXG4gICAgcHJvdGVjdGVkIF9kb21SZXBvOiBQb3BEb21TZXJ2aWNlLFxuICAgIHByb3RlY3RlZCBfc2NoZW1lUmVwbzogUG9wRW50aXR5U2NoZW1lU2VydmljZSxcbiAgKXtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuZG9tLmNvbmZpZ3VyZSA9ICgpOiBQcm9taXNlPGJvb2xlYW4+ID0+IHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSggYXN5bmMoIHJlc29sdmUgKSA9PiB7XG4gICAgICAgIGF3YWl0IHRoaXMuZG9tLnNldFdpdGhDb21wb25lbnRJbm5lckhlaWdodCggJ1BvcEVudGl0eVRhYkNvbHVtbkNvbXBvbmVudCcsIHRoaXMucG9zaXRpb24sIDIxMCwgNjAwICk7XG4gICAgICAgIHRoaXMudWkuc2VjdGlvbnMgPSB0aGlzLnNydi5zY2hlbWUudWkuc2VjdGlvbnM7XG4gICAgICAgIHJldHVybiByZXNvbHZlKCB0cnVlICk7XG4gICAgICB9ICk7XG4gICAgfTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFNldHVwIHRoaXMgY29tcG9uZW50XG4gICAqL1xuICBuZ09uSW5pdCgpe1xuICAgIHN1cGVyLm5nT25Jbml0KCk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBDbGVhbiB1cCB0aGUgZG9tIG9mIHRoaXMgY29tcG9uZW50XG4gICAqL1xuICBuZ09uRGVzdHJveSgpe1xuICAgIHN1cGVyLm5nT25EZXN0cm95KCk7XG4gIH1cblxufVxuIl19