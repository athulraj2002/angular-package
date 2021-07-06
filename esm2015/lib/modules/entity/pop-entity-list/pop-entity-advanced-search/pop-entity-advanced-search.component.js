import { Component, ElementRef, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { PopExtendComponent } from '../../../../pop-extend.component';
import { PopEntity } from '../../../../pop-common.model';
import { IsObject } from '../../../../pop-common-utility';
export class PopEntityAdvancedSearchComponent extends PopExtendComponent {
    constructor(el, advancedSearchDialogRef, route, data) {
        super();
        this.el = el;
        this.advancedSearchDialogRef = advancedSearchDialogRef;
        this.route = route;
        this.data = data;
        this.name = 'PopEntityAdvancedSearchComponent';
        /**
         * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
         */
        this.dom.configure = () => {
            return new Promise((resolve) => {
                this.internal_name = 'role';
                this.ui.fields = [];
                const searchFields = {};
                let needsMetadata = false;
                let model;
                if (!this.internal_name)
                    this.internal_name = PopEntity.getRouteInternalName(this.route);
                this.dom.setHeightWithParent(null, 145, 600).then((res) => true);
                PopEntity.getCoreConfig(this.internal_name).then((entityConfig) => {
                    this.asset.entityId = entityConfig;
                    if (IsObject(this.asset.entity.repo.model.field, true)) {
                        Object.keys(this.asset.entity.repo.model.field).map((column) => {
                            if (column in this.asset.entity.repo.model.field[column]['itemMap']) {
                                model = Object.assign({}, this.asset.entity.repo.model.field[column].items[entityConfig.fields[column]['itemMap'][column]].model);
                                delete model.api; // doAction fields don't patch
                                delete model.metadata;
                                delete model.transformation;
                                searchFields[column] = model;
                                if (model.options && model.options.metadata) {
                                    needsMetadata = true;
                                }
                            }
                        });
                    }
                    // if needsMetadata go grab it before you try to build out the fields
                    if (needsMetadata) {
                        this.asset.entity.repo.getUiResources(this.core).subscribe((metadata) => {
                            if (!this.asset.entity.entity)
                                this.asset.entity.entityId = {};
                            this.asset.entity.entity.metadata = metadata;
                            Object.keys(searchFields).map((field) => {
                                // this.ui.fields.push(this.config.getCoreFieldItem(this.asset.entity, field, searchFields[ field ]));
                            });
                            this.ui.fields.sort(function (a, b) {
                                if (a.model.sort_top < b.model.sort_top)
                                    return -1;
                                if (a.model.sort_top > b.model.sort_top)
                                    return 1;
                                return 0;
                            });
                            console.log('fields', this.ui.fields);
                        });
                    }
                    else {
                        // no metadata was needed for any of these fields
                        Object.keys(searchFields).map((field) => {
                            // this.ui.fields.push(this.config.getCoreFieldItem(this.asset.entity, field, searchFields[ field ]));
                        });
                        this.ui.fields.sort(function (a, b) {
                            if (a.model.sort_top < b.model.sort_top)
                                return -1;
                            if (a.model.sort_top > b.model.sort_top)
                                return 1;
                            return 0;
                        });
                        console.log('fields', this.ui.fields);
                    }
                });
                resolve(true);
            });
        };
    }
    /**
     * This component should have a specific purpose
     */
    ngOnInit() {
        super.ngOnInit();
    }
    onSearch() {
        this.advancedSearchDialogRef.close(this.data);
    }
    onCancel() {
        this.advancedSearchDialogRef.close(null);
    }
    /**
     * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
     */
    ngOnDestroy() {
        super.ngOnDestroy();
    }
}
PopEntityAdvancedSearchComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-entity-advanced-search',
                template: "<div class=\"pop-entity-advanced-search-container\">\n  <div class=\"pop-entity-advanced-search-header\"><h3>Entity Advanced Search</h3></div>\n  <div class=\"pop-entity-advanced-search-content\" [style.height.px]=dom.height.inner>\n    <mat-list class=\"field-builder-items\">\n      <mat-list-item *ngFor=\"let field of ui.fields\">\n        {{field.model.display}}\n      </mat-list-item>\n    </mat-list>\n  </div>\n  <div class=\"pop-entity-advanced-search-buttons\">\n    <div class=\"pop-entity-advanced-search-cancel\">\n      <button class=\"pop-entity-advanced-search-button\" mat-raised-button (click)=\"onCancel()\">Cancel</button>\n    </div>\n    <button class=\"pop-entity-advanced-search-button\" mat-raised-button (click)=\"onSearch()\" color=\"accent\">Search\n    </button>\n  </div>\n</div>\n\n",
                styles: [".mat-dialog-container{padding:0!important}.pop-entity-advanced-search-container{position:relative;flex:1 1 100%;background:pink}.pop-entity-advanced-search-header{background:#00f;min-height:35px;border-bottom:1px solid var(--border)}.pop-entity-advanced-search-header h3{margin:0;font-weight:500;text-align:center;padding-bottom:5px}.pop-entity-advanced-search-content{flex:1 1 100%;background:green;overflow:hidden;overflow-y:scroll;overflow-x:hidden}.pop-entity-advanced-search-buttons{display:flex;flex-direction:row;flex-wrap:nowrap;justify-content:flex-end;background:red;height:40px;padding:10px 20px}.pop-entity-advanced-search-button{margin-left:10px}.pop-entity-advanced-search-cancel{margin-left:-10px;display:flex;flex-grow:2}:host ::ng-deep .mat-list-base{padding-top:0;margin-right:5px;margin-left:1px;margin-top:1px}:host ::ng-deep .mat-list-item{margin-bottom:1px}"]
            },] }
];
PopEntityAdvancedSearchComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: MatDialogRef },
    { type: ActivatedRoute },
    { type: undefined, decorators: [{ type: Inject, args: [MAT_DIALOG_DATA,] }] }
];
PopEntityAdvancedSearchComponent.propDecorators = {
    internal_name: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS1hZHZhbmNlZC1zZWFyY2guY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvZW50aXR5L3BvcC1lbnRpdHktbGlzdC9wb3AtZW50aXR5LWFkdmFuY2VkLXNlYXJjaC9wb3AtZW50aXR5LWFkdmFuY2VkLXNlYXJjaC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBcUIsTUFBTSxlQUFlLENBQUM7QUFDeEYsT0FBTyxFQUFFLGVBQWUsRUFBRSxZQUFZLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUN6RSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDakQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sa0NBQWtDLENBQUM7QUFDdEUsT0FBTyxFQUFVLFNBQVMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQ2pFLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQVExRCxNQUFNLE9BQU8sZ0NBQWlDLFNBQVEsa0JBQWtCO0lBS3RFLFlBQ1MsRUFBYyxFQUNiLHVCQUF1RSxFQUN2RSxLQUFxQixFQUNHLElBQUk7UUFFcEMsS0FBSyxFQUFFLENBQUM7UUFMRCxPQUFFLEdBQUYsRUFBRSxDQUFZO1FBQ2IsNEJBQXVCLEdBQXZCLHVCQUF1QixDQUFnRDtRQUN2RSxVQUFLLEdBQUwsS0FBSyxDQUFnQjtRQUNHLFNBQUksR0FBSixJQUFJLENBQUE7UUFSL0IsU0FBSSxHQUFFLGtDQUFrQyxDQUFDO1FBVzlDOztXQUVHO1FBQ0gsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsR0FBcUIsRUFBRTtZQUMxQyxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxF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QkFFSCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDaEIsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUM7SUFDSixDQUFDO0lBR0Q7O09BRUc7SUFDSCxRQUFRO1FBQ04sS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ25CLENBQUM7SUFHRCxRQUFRO1FBQ04sSUFBSSxDQUFDLHVCQUF1QixDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUdELFFBQVE7UUFDTixJQUFJLENBQUMsdUJBQXVCLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzNDLENBQUM7SUFHRDs7T0FFRztJQUNILFdBQVc7UUFDVCxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDdEIsQ0FBQzs7O1lBM0dGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsZ0NBQWdDO2dCQUMxQywwekJBQTBEOzthQUUzRDs7O1lBWm1CLFVBQVU7WUFDSixZQUFZO1lBQzdCLGNBQWM7NENBb0JsQixNQUFNLFNBQUMsZUFBZTs7OzRCQVB4QixLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBJbmplY3QsIElucHV0LCBPbkRlc3Ryb3ksIE9uSW5pdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgTUFUX0RJQUxPR19EQVRBLCBNYXREaWFsb2dSZWYgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9kaWFsb2cnO1xuaW1wb3J0IHsgQWN0aXZhdGVkUm91dGUgfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xuaW1wb3J0IHsgUG9wRXh0ZW5kQ29tcG9uZW50IH0gZnJvbSAnLi4vLi4vLi4vLi4vcG9wLWV4dGVuZC5jb21wb25lbnQnO1xuaW1wb3J0IHsgRW50aXR5LCBQb3BFbnRpdHkgfSBmcm9tICcuLi8uLi8uLi8uLi9wb3AtY29tbW9uLm1vZGVsJztcbmltcG9ydCB7IElzT2JqZWN0IH0gZnJvbSAnLi4vLi4vLi4vLi4vcG9wLWNvbW1vbi11dGlsaXR5JztcblxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdsaWItcG9wLWVudGl0eS1hZHZhbmNlZC1zZWFyY2gnLFxuICB0ZW1wbGF0ZVVybDogJy4vcG9wLWVudGl0eS1hZHZhbmNlZC1zZWFyY2guY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsgJy4vcG9wLWVudGl0eS1hZHZhbmNlZC1zZWFyY2guY29tcG9uZW50LnNjc3MnIF1cbn0pXG5leHBvcnQgY2xhc3MgUG9wRW50aXR5QWR2YW5jZWRTZWFyY2hDb21wb25lbnQgZXh0ZW5kcyBQb3BFeHRlbmRDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG4gIHB1YmxpYyBuYW1lID0nUG9wRW50aXR5QWR2YW5jZWRTZWFyY2hDb21wb25lbnQnO1xuICBASW5wdXQoKSBpbnRlcm5hbF9uYW1lOiBzdHJpbmc7XG5cblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgZWw6IEVsZW1lbnRSZWYsXG4gICAgcHJpdmF0ZSBhZHZhbmNlZFNlYXJjaERpYWxvZ1JlZjogTWF0RGlhbG9nUmVmPFBvcEVudGl0eUFkdmFuY2VkU2VhcmNoQ29tcG9uZW50PixcbiAgICBwcml2YXRlIHJvdXRlOiBBY3RpdmF0ZWRSb3V0ZSxcbiAgICBASW5qZWN0KE1BVF9ESUFMT0dfREFUQSkgcHVibGljIGRhdGEsXG4gICl7XG4gICAgc3VwZXIoKTtcbiAgICAvKipcbiAgICAgKiBUaGlzIHNob3VsZCB0cmFuc2Zvcm0gYW5kIHZhbGlkYXRlIHRoZSBkYXRhLiBUaGUgdmlldyBzaG91bGQgdHJ5IHRvIG9ubHkgdXNlIGRhdGEgdGhhdCBpcyBzdG9yZWQgb24gdWkgc28gdGhhdCBpdCBpcyBub3QgZGVwZW5kZW50IG9uIHRoZSBzdHJ1Y3R1cmUgb2YgZGF0YSB0aGF0IGNvbWVzIGZyb20gb3RoZXIgc291cmNlcy4gVGhlIHVpIHNob3VsZCBiZSB0aGUgc291cmNlIG9mIHRydXRoIGhlcmUuXG4gICAgICovXG4gICAgdGhpcy5kb20uY29uZmlndXJlID0gKCk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIHRoaXMuaW50ZXJuYWxfbmFtZSA9ICdyb2xlJztcblxuICAgICAgICB0aGlzLnVpLmZpZWxkcyA9IFtdO1xuICAgICAgICBjb25zdCBzZWFyY2hGaWVsZHMgPSB7fTtcbiAgICAgICAgbGV0IG5lZWRzTWV0YWRhdGEgPSBmYWxzZTtcbiAgICAgICAgbGV0IG1vZGVsO1xuICAgICAgICBpZiggIXRoaXMuaW50ZXJuYWxfbmFtZSApIHRoaXMuaW50ZXJuYWxfbmFtZSA9IFBvcEVudGl0eS5nZXRSb3V0ZUludGVybmFsTmFtZSh0aGlzLnJvdXRlKTtcblxuICAgICAgICB0aGlzLmRvbS5zZXRIZWlnaHRXaXRoUGFyZW50KG51bGwsIDE0NSwgNjAwKS50aGVuKChyZXMpID0+IHRydWUpO1xuXG4gICAgICAgIFBvcEVudGl0eS5nZXRDb3JlQ29uZmlnKHRoaXMuaW50ZXJuYWxfbmFtZSkudGhlbigoZW50aXR5Q29uZmlnOiBhbnkpID0+IHtcbiAgICAgICAgICB0aGlzLmFzc2V0LmVudGl0eUlkID0gZW50aXR5Q29uZmlnO1xuICAgICAgICAgIGlmKElzT2JqZWN0KHRoaXMuYXNzZXQuZW50aXR5LnJlcG8ubW9kZWwuZmllbGQsIHRydWUpKXtcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKHRoaXMuYXNzZXQuZW50aXR5LnJlcG8ubW9kZWwuZmllbGQpLm1hcCgoY29sdW1uKSA9PiB7XG4gICAgICAgICAgICAgIGlmKCBjb2x1bW4gaW4gdGhpcy5hc3NldC5lbnRpdHkucmVwby5tb2RlbC5maWVsZFsgY29sdW1uIF1bICdpdGVtTWFwJyBdICl7XG4gICAgICAgICAgICAgICAgbW9kZWwgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmFzc2V0LmVudGl0eS5yZXBvLm1vZGVsLmZpZWxkWyBjb2x1bW4gXS5pdGVtc1sgZW50aXR5Q29uZmlnLmZpZWxkc1sgY29sdW1uIF1bICdpdGVtTWFwJyBdWyBjb2x1bW4gXSBdLm1vZGVsKTtcbiAgICAgICAgICAgICAgICBkZWxldGUgbW9kZWwuYXBpOyAvLyBkb0FjdGlvbiBmaWVsZHMgZG9uJ3QgcGF0Y2hcbiAgICAgICAgICAgICAgICBkZWxldGUgbW9kZWwubWV0YWRhdGE7XG4gICAgICAgICAgICAgICAgZGVsZXRlIG1vZGVsLnRyYW5zZm9ybWF0aW9uO1xuICAgICAgICAgICAgICAgIHNlYXJjaEZpZWxkc1sgY29sdW1uIF0gPSBtb2RlbDtcbiAgICAgICAgICAgICAgICBpZiggbW9kZWwub3B0aW9ucyAmJiBtb2RlbC5vcHRpb25zLm1ldGFkYXRhICl7XG4gICAgICAgICAgICAgICAgICBuZWVkc01ldGFkYXRhID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIGlmIG5lZWRzTWV0YWRhdGEgZ28gZ3JhYiBpdCBiZWZvcmUgeW91IHRyeSB0byBidWlsZCBvdXQgdGhlIGZpZWxkc1xuICAgICAgICAgIGlmKCBuZWVkc01ldGFkYXRhICl7XG4gICAgICAgICAgICB0aGlzLmFzc2V0LmVudGl0eS5yZXBvLmdldFVpUmVzb3VyY2VzKHRoaXMuY29yZSkuc3Vic2NyaWJlKChtZXRhZGF0YSkgPT4ge1xuICAgICAgICAgICAgICBpZiggIXRoaXMuYXNzZXQuZW50aXR5LmVudGl0eSApIHRoaXMuYXNzZXQuZW50aXR5LmVudGl0eUlkID0gPEVudGl0eT57fTtcbiAgICAgICAgICAgICAgdGhpcy5hc3NldC5lbnRpdHkuZW50aXR5Lm1ldGFkYXRhID0gbWV0YWRhdGE7XG4gICAgICAgICAgICAgIE9iamVjdC5rZXlzKHNlYXJjaEZpZWxkcykubWFwKChmaWVsZCkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIHRoaXMudWkuZmllbGRzLnB1c2godGhpcy5jb25maWcuZ2V0Q29yZUZpZWxkSXRlbSh0aGlzLmFzc2V0LmVudGl0eSwgZmllbGQsIHNlYXJjaEZpZWxkc1sgZmllbGQgXSkpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgdGhpcy51aS5maWVsZHMuc29ydChmdW5jdGlvbihhLCBiKXtcbiAgICAgICAgICAgICAgICBpZiggYS5tb2RlbC5zb3J0X3RvcCA8IGIubW9kZWwuc29ydF90b3AgKSByZXR1cm4gLTE7XG4gICAgICAgICAgICAgICAgaWYoIGEubW9kZWwuc29ydF90b3AgPiBiLm1vZGVsLnNvcnRfdG9wICkgcmV0dXJuIDE7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZygnZmllbGRzJywgdGhpcy51aS5maWVsZHMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAvLyBubyBtZXRhZGF0YSB3YXMgbmVlZGVkIGZvciBhbnkgb2YgdGhlc2UgZmllbGRzXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhzZWFyY2hGaWVsZHMpLm1hcCgoZmllbGQpID0+IHtcbiAgICAgICAgICAgICAgLy8gdGhpcy51aS5maWVsZHMucHVzaCh0aGlzLmNvbmZpZy5nZXRDb3JlRmllbGRJdGVtKHRoaXMuYXNzZXQuZW50aXR5LCBmaWVsZCwgc2VhcmNoRmllbGRzWyBmaWVsZCBdKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMudWkuZmllbGRzLnNvcnQoZnVuY3Rpb24oYSwgYil7XG4gICAgICAgICAgICAgIGlmKCBhLm1vZGVsLnNvcnRfdG9wIDwgYi5tb2RlbC5zb3J0X3RvcCApIHJldHVybiAtMTtcbiAgICAgICAgICAgICAgaWYoIGEubW9kZWwuc29ydF90b3AgPiBiLm1vZGVsLnNvcnRfdG9wICkgcmV0dXJuIDE7XG4gICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnZmllbGRzJywgdGhpcy51aS5maWVsZHMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH0pO1xuICAgIH07XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIGNvbXBvbmVudCBzaG91bGQgaGF2ZSBhIHNwZWNpZmljIHB1cnBvc2VcbiAgICovXG4gIG5nT25Jbml0KCl7XG4gICAgc3VwZXIubmdPbkluaXQoKTtcbiAgfVxuXG5cbiAgb25TZWFyY2goKTogdm9pZHtcbiAgICB0aGlzLmFkdmFuY2VkU2VhcmNoRGlhbG9nUmVmLmNsb3NlKHRoaXMuZGF0YSk7XG4gIH1cblxuXG4gIG9uQ2FuY2VsKCk6IHZvaWR7XG4gICAgdGhpcy5hZHZhbmNlZFNlYXJjaERpYWxvZ1JlZi5jbG9zZShudWxsKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoZSBkb20gZGVzdHJveSBmdW5jdGlvbiBtYW5hZ2VzIGFsbCB0aGUgY2xlYW4gdXAgdGhhdCBpcyBuZWNlc3NhcnkgaWYgc3Vic2NyaXB0aW9ucywgdGltZW91dHMsIGV0YyBhcmUgc3RvcmVkIHByb3Blcmx5XG4gICAqL1xuICBuZ09uRGVzdHJveSgpe1xuICAgIHN1cGVyLm5nT25EZXN0cm95KCk7XG4gIH1cbn1cbiJdfQ==