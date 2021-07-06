import { __awaiter } from "tslib";
import { ChangeDetectorRef, Component, ElementRef, Input } from '@angular/core';
import { TableConfig } from '../../base/pop-table/pop-table.model';
import { PopExtendComponent } from '../../../pop-extend.component';
import { PopPipe, PopTemplate } from '../../../pop-common.model';
import { IsArray, StorageGetter } from '../../../pop-common-utility';
import { GetObjectTransformations } from '../pop-entity-utility';
export class PopEntityHistoryComponent extends PopExtendComponent {
    constructor(el, cdr) {
        super();
        this.el = el;
        this.cdr = cdr;
        this.name = 'PopEntityHistoryComponent';
        /**
         * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
         */
        this.dom.configure = () => {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                this.dom.setHeight(PopTemplate.getContentHeight(), 100);
                yield this.buildTable();
                this.dom.state.hasData = IsArray(StorageGetter(this.config, ['matData', 'data'], []), true);
                return resolve(true);
            }));
        };
    }
    /**
     * This component should have a specific purpose
     */
    ngOnInit() {
        super.ngOnInit();
    }
    buildTable() {
        return new Promise((resolve) => {
            this.dom.setSubscriber('history-api-call', this.core.repo.getHistory(+this.core.params.entityId).subscribe(history => {
                // Build the config.
                // Prepare and load the data.
                history = this._prepareTableData(history, this.core.repo.model.field);
                const tableConfig = {
                    height: this.dom.height.inner,
                    search: true,
                    columnDefinitions: {
                        user: { visible: true, order: 1, internal_name: 'user', route: '/admin/users/:user_fk' },
                        action: { visible: true, order: 2 },
                        message: { visible: true, order: 3 },
                        timestamp: { visible: true, order: 4 },
                    },
                    data: Array.isArray(history) ? history : [],
                };
                this.config = new TableConfig(tableConfig);
                try {
                    this.cdr.detectChanges();
                }
                catch (e) {
                }
                return resolve(true);
            }, err => {
                this.dom.error = {
                    code: (err.error ? err.error.code : err.status),
                    message: (err.error ? err.error.message : err.statusText)
                };
                try {
                    this.cdr.detectChanges();
                }
                catch (e) {
                }
                return resolve(false);
            }));
        });
    }
    eventHandler(event) {
        if (event.type === 'table') {
        }
    }
    /**
     * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
     */
    ngOnDestroy() {
        super.ngOnDestroy();
    }
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    /**
     * A method that preps entityId list data for tables
     * @param dataSet
     * @param fieldMap
     */
    _prepareTableData(dataSet, fieldMap = {}, entityConfig = null) {
        // Determine which fields should be acted upon.
        const transformations = GetObjectTransformations(fieldMap);
        return IsArray(dataSet, true) ? dataSet.map(row => PopPipe.transformObjectValues(Object.assign({}, row), transformations, entityConfig)) : dataSet;
    }
}
PopEntityHistoryComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-entity-history',
                template: "<div class=\"entity-history-container\">\n  <div class=\"entity-history-loader-bar\" *ngIf=\"dom.state.loading\">\n    <mat-progress-bar mode=\"indeterminate\"></mat-progress-bar>\n  </div>\n  <div *ngIf=\"!dom.state.hasData\" class=\"entity-history-empty-container\">\n    <div class=\"entity-history-row\">\n      <mat-icon class=\"sw-helper-icon\" [style.marginLeft]=\"'-24px'\">sentiment_dissatisfied</mat-icon>\n    </div>\n    <div class=\"sw-label-container\" [style.textAlign]=\"'center'\">Such Empty!</div>\n  </div>\n  <lib-pop-table *ngIf=\"dom.state.hasData\"  (events)=\"eventHandler($event);\" [config]=\"config\"></lib-pop-table>\n</div>\n<lib-pop-errors *ngIf=\"dom.error.code\" [error]=\"dom.error\"></lib-pop-errors>\n",
                styles: [".entity-history-container{display:flex;width:100%;height:100%;flex-direction:column;justify-content:stretch}.entity-history-container>lib-pop-table{flex:1}.entity-history-empty-container{flex:1 1;min-height:200px;flex-direction:column;justify-content:stretch;align-items:center}.entity-history-row{flex:1 1;min-height:200px;flex-direction:row;justify-content:center;align-items:center;min-height:30px;text-align:center}.entity-history-loader-bar{position:absolute;left:0;right:0;bottom:0}::ng-deep td,:host ::ng-deep th{min-width:50px;max-width:300px;text-overflow:ellipsis;white-space:nowrap;overflow:hidden;height:48px;max-height:48px}:host ::ng-deep th>.mat-sort-header-container{display:flex;min-width:50px;max-width:300px}:host ::ng-deep td[class*=fk],:host ::ng-deep th[class*=fk]{min-width:50px;max-width:100px;text-align:center!important;justify-content:center}:host ::ng-deep th[class*=fk]>.mat-sort-header-container{min-width:50px!important;max-width:100px!important;justify-content:center!important;text-align:center!important}:host ::ng-deep td[class*=id],:host ::ng-deep th[class*=id]{min-width:50px;max-width:100px;text-align:center!important;justify-content:center}:host ::ng-deep th[class*=id]>.mat-sort-header-container{min-width:100px!important;max-width:100px!important;justify-content:center!important;text-align:center!important}:host ::ng-deep td[class*=-message],:host ::ng-deep th[class*=-name]{text-align:left!important;padding-left:20px!important;min-width:50px!important;max-width:500px!important}:host ::ng-deep th[class*=-message] .mat-sort-header-container{min-width:50px!important;max-width:500px!important;padding-left:0!important;justify-content:left!important}:host ::ng-deep td[class*=-description],:host ::ng-deep th[class*=-name]{text-align:left!important;padding-left:20px!important;min-width:50px!important;max-width:500px!important}:host ::ng-deep th[class*=-description] .mat-sort-header-container{min-width:50px!important;max-width:500px!important;padding-left:0!important;justify-content:left!important}"]
            },] }
];
PopEntityHistoryComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: ChangeDetectorRef }
];
PopEntityHistoryComponent.propDecorators = {
    config: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS1oaXN0b3J5LmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2VudGl0eS9wb3AtZW50aXR5LWhpc3RvcnkvcG9wLWVudGl0eS1oaXN0b3J5LmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLGlCQUFpQixFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFxQixNQUFNLGVBQWUsQ0FBQztBQUNuRyxPQUFPLEVBQUUsV0FBVyxFQUFrQixNQUFNLHNDQUFzQyxDQUFDO0FBRW5GLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQ25FLE9BQU8sRUFBcUMsT0FBTyxFQUFFLFdBQVcsRUFBbUIsTUFBTSwyQkFBMkIsQ0FBQztBQUVySCxPQUFPLEVBQUUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQ3JFLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBUWpFLE1BQU0sT0FBTyx5QkFBMEIsU0FBUSxrQkFBa0I7SUFPL0QsWUFDUyxFQUFjLEVBQ2QsR0FBc0I7UUFFN0IsS0FBSyxFQUFFLENBQUM7UUFIRCxPQUFFLEdBQUYsRUFBRSxDQUFZO1FBQ2QsUUFBRyxHQUFILEdBQUcsQ0FBbUI7UUFMeEIsU0FBSSxHQUFHLDJCQUEyQixDQUFDO1FBUXhDOztXQUVHO1FBQ0gsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsR0FBcUIsRUFBRTtZQUMxQyxPQUFPLElBQUksT0FBTyxDQUFFLENBQU8sT0FBTyxFQUFHLEVBQUU7Z0JBQ3JDLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFFLFdBQVcsQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLEdBQUcsQ0FBRSxDQUFDO2dCQUMxRCxNQUFNLElBQUks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LENBQUM7UUFDTixDQUFDLENBQUUsQ0FBQztJQUNOLENBQUM7SUFHRCxZQUFZLENBQUUsS0FBNEI7UUFDeEMsSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLE9BQU8sRUFBRTtTQUMzQjtJQUNILENBQUM7SUFHRDs7T0FFRztJQUNILFdBQVc7UUFDVCxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDdEIsQ0FBQztJQUdEOzs7OztzR0FLa0c7SUFHbEc7Ozs7T0FJRztJQUNLLGlCQUFpQixDQUFFLE9BQW1CLEVBQUUsV0FBZSxFQUFFLEVBQUUsZUFBMkIsSUFBSTtRQUNoRywrQ0FBK0M7UUFDL0MsTUFBTSxlQUFlLEdBQUcsd0JBQXdCLENBQUUsUUFBUSxDQUFFLENBQUM7UUFDN0QsT0FBTyxPQUFPLENBQUUsT0FBTyxFQUFFLElBQUksQ0FBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLHFCQUFxQixtQkFBTyxHQUFHLEdBQUksZUFBZSxFQUFFLFlBQVksQ0FBRSxDQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztJQUMvSSxDQUFDOzs7WUFoSEYsU0FBUyxTQUFFO2dCQUNWLFFBQVEsRUFBRSx3QkFBd0I7Z0JBQ2xDLDR1QkFBa0Q7O2FBRW5EOzs7WUFkc0MsVUFBVTtZQUF4QyxpQkFBaUI7OztxQkFnQnZCLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDaGFuZ2VEZXRlY3RvclJlZiwgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBJbnB1dCwgT25EZXN0cm95LCBPbkluaXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFRhYmxlQ29uZmlnLCBUYWJsZUludGVyZmFjZSB9IGZyb20gJy4uLy4uL2Jhc2UvcG9wLXRhYmxlL3BvcC10YWJsZS5tb2RlbCc7XG5pbXBvcnQgeyBQb3BFbnRpdHlTZXJ2aWNlIH0gZnJvbSAnLi4vc2VydmljZXMvcG9wLWVudGl0eS5zZXJ2aWNlJztcbmltcG9ydCB7IFBvcEV4dGVuZENvbXBvbmVudCB9IGZyb20gJy4uLy4uLy4uL3BvcC1leHRlbmQuY29tcG9uZW50JztcbmltcG9ydCB7IENvcmVDb25maWcsIFBvcEJhc2VFdmVudEludGVyZmFjZSwgUG9wUGlwZSwgUG9wVGVtcGxhdGUsIFNlcnZpY2VJbmplY3RvciB9IGZyb20gJy4uLy4uLy4uL3BvcC1jb21tb24ubW9kZWwnO1xuaW1wb3J0IHsgUG9wUGlwZVNlcnZpY2UgfSBmcm9tICcuLi8uLi8uLi9zZXJ2aWNlcy9wb3AtcGlwZS5zZXJ2aWNlJztcbmltcG9ydCB7IElzQXJyYXksIFN0b3JhZ2VHZXR0ZXIgfSBmcm9tICcuLi8uLi8uLi9wb3AtY29tbW9uLXV0aWxpdHknO1xuaW1wb3J0IHsgR2V0T2JqZWN0VHJhbnNmb3JtYXRpb25zIH0gZnJvbSAnLi4vcG9wLWVudGl0eS11dGlsaXR5JztcblxuXG5AQ29tcG9uZW50KCB7XG4gIHNlbGVjdG9yOiAnbGliLXBvcC1lbnRpdHktaGlzdG9yeScsXG4gIHRlbXBsYXRlVXJsOiAnLi9wb3AtZW50aXR5LWhpc3RvcnkuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsgJy4vcG9wLWVudGl0eS1oaXN0b3J5LmNvbXBvbmVudC5zY3NzJyBdXG59IClcbmV4cG9ydCBjbGFzcyBQb3BFbnRpdHlIaXN0b3J5Q29tcG9uZW50IGV4dGVuZHMgUG9wRXh0ZW5kQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xuICBASW5wdXQoKSBjb25maWc6IFRhYmxlQ29uZmlnO1xuXG5cbiAgcHVibGljIG5hbWUgPSAnUG9wRW50aXR5SGlzdG9yeUNvbXBvbmVudCc7XG5cblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgZWw6IEVsZW1lbnRSZWYsXG4gICAgcHVibGljIGNkcjogQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gICl7XG4gICAgc3VwZXIoKTtcbiAgICAvKipcbiAgICAgKiBUaGlzIHNob3VsZCB0cmFuc2Zvcm0gYW5kIHZhbGlkYXRlIHRoZSBkYXRhLiBUaGUgdmlldyBzaG91bGQgdHJ5IHRvIG9ubHkgdXNlIGRhdGEgdGhhdCBpcyBzdG9yZWQgb24gdWkgc28gdGhhdCBpdCBpcyBub3QgZGVwZW5kZW50IG9uIHRoZSBzdHJ1Y3R1cmUgb2YgZGF0YSB0aGF0IGNvbWVzIGZyb20gb3RoZXIgc291cmNlcy4gVGhlIHVpIHNob3VsZCBiZSB0aGUgc291cmNlIG9mIHRydXRoIGhlcmUuXG4gICAgICovXG4gICAgdGhpcy5kb20uY29uZmlndXJlID0gKCk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCBhc3luYyggcmVzb2x2ZSApID0+IHtcbiAgICAgICAgdGhpcy5kb20uc2V0SGVpZ2h0KCBQb3BUZW1wbGF0ZS5nZXRDb250ZW50SGVpZ2h0KCksIDEwMCApO1xuICAgICAgICBhd2FpdCB0aGlzLmJ1aWxkVGFibGUoKTtcbiAgICAgICAgdGhpcy5kb20uc3RhdGUuaGFzRGF0YSA9IElzQXJyYXkoU3RvcmFnZUdldHRlcih0aGlzLmNvbmZpZywgWydtYXREYXRhJywgJ2RhdGEnXSwgW10pLCB0cnVlKTtcbiAgICAgICAgcmV0dXJuIHJlc29sdmUoIHRydWUgKTtcbiAgICAgIH0gKTtcbiAgICB9O1xuICB9XG5cblxuICAvKipcbiAgICogVGhpcyBjb21wb25lbnQgc2hvdWxkIGhhdmUgYSBzcGVjaWZpYyBwdXJwb3NlXG4gICAqL1xuICBuZ09uSW5pdCgpe1xuICAgIHN1cGVyLm5nT25Jbml0KCk7XG4gIH1cblxuXG4gIGJ1aWxkVGFibGUoKTogUHJvbWlzZTxib29sZWFuPntcbiAgICByZXR1cm4gbmV3IFByb21pc2UoICggcmVzb2x2ZSApID0+IHtcbiAgICAgIHRoaXMuZG9tLnNldFN1YnNjcmliZXIoICdoaXN0b3J5LWFwaS1jYWxsJywgdGhpcy5jb3JlLnJlcG8uZ2V0SGlzdG9yeSggK3RoaXMuY29yZS5wYXJhbXMuZW50aXR5SWQgKS5zdWJzY3JpYmUoXG4gICAgICAgIGhpc3RvcnkgPT4ge1xuICAgICAgICAgIC8vIEJ1aWxkIHRoZSBjb25maWcuXG4gICAgICAgICAgLy8gUHJlcGFyZSBhbmQgbG9hZCB0aGUgZGF0YS5cbiAgICAgICAgICBoaXN0b3J5ID0gdGhpcy5fcHJlcGFyZVRhYmxlRGF0YSggaGlzdG9yeSwgdGhpcy5jb3JlLnJlcG8ubW9kZWwuZmllbGQgKTtcbiAgICAgICAgICBjb25zdCB0YWJsZUNvbmZpZzogVGFibGVJbnRlcmZhY2UgPSB7XG4gICAgICAgICAgICBoZWlnaHQ6IHRoaXMuZG9tLmhlaWdodC5pbm5lcixcbiAgICAgICAgICAgIHNlYXJjaDogdHJ1ZSxcbiAgICAgICAgICAgIGNvbHVtbkRlZmluaXRpb25zOiB7XG4gICAgICAgICAgICAgIHVzZXI6IHsgdmlzaWJsZTogdHJ1ZSwgb3JkZXI6IDEsIGludGVybmFsX25hbWU6ICd1c2VyJywgcm91dGU6ICcvYWRtaW4vdXNlcnMvOnVzZXJfZmsnIH0sXG4gICAgICAgICAgICAgIGFjdGlvbjogeyB2aXNpYmxlOiB0cnVlLCBvcmRlcjogMiB9LFxuICAgICAgICAgICAgICBtZXNzYWdlOiB7IHZpc2libGU6IHRydWUsIG9yZGVyOiAzIH0sXG4gICAgICAgICAgICAgIHRpbWVzdGFtcDogeyB2aXNpYmxlOiB0cnVlLCBvcmRlcjogNCB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRhdGE6IEFycmF5LmlzQXJyYXkoIGhpc3RvcnkgKSA/IGhpc3RvcnkgOiBbXSxcbiAgICAgICAgICB9O1xuICAgICAgICAgIHRoaXMuY29uZmlnID0gbmV3IFRhYmxlQ29uZmlnKCB0YWJsZUNvbmZpZyApO1xuICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgIHRoaXMuY2RyLmRldGVjdENoYW5nZXMoKTtcbiAgICAgICAgICB9Y2F0Y2goIGUgKXtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUoIHRydWUgKTtcblxuICAgICAgICB9LFxuICAgICAgICBlcnIgPT4ge1xuICAgICAgICAgIHRoaXMuZG9tLmVycm9yID0ge1xuICAgICAgICAgICAgY29kZTogKCBlcnIuZXJyb3IgPyBlcnIuZXJyb3IuY29kZSA6IGVyci5zdGF0dXMgKSxcbiAgICAgICAgICAgIG1lc3NhZ2U6ICggZXJyLmVycm9yID8gZXJyLmVycm9yLm1lc3NhZ2UgOiBlcnIuc3RhdHVzVGV4dCApXG4gICAgICAgICAgfTtcbiAgICAgICAgICB0cnl7XG4gICAgICAgICAgICB0aGlzLmNkci5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgICAgICAgfWNhdGNoKCBlICl7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByZXNvbHZlKCBmYWxzZSApO1xuICAgICAgICB9XG4gICAgICApICk7XG4gICAgfSApO1xuICB9XG5cblxuICBldmVudEhhbmRsZXIoIGV2ZW50OiBQb3BCYXNlRXZlbnRJbnRlcmZhY2UgKXtcbiAgICBpZiggZXZlbnQudHlwZSA9PT0gJ3RhYmxlJyApe1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoZSBkb20gZGVzdHJveSBmdW5jdGlvbiBtYW5hZ2VzIGFsbCB0aGUgY2xlYW4gdXAgdGhhdCBpcyBuZWNlc3NhcnkgaWYgc3Vic2NyaXB0aW9ucywgdGltZW91dHMsIGV0YyBhcmUgc3RvcmVkIHByb3Blcmx5XG4gICAqL1xuICBuZ09uRGVzdHJveSgpe1xuICAgIHN1cGVyLm5nT25EZXN0cm95KCk7XG4gIH1cblxuXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVW5kZXIgVGhlIEhvb2QgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBQcml2YXRlIE1ldGhvZCApICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG5cbiAgLyoqXG4gICAqIEEgbWV0aG9kIHRoYXQgcHJlcHMgZW50aXR5SWQgbGlzdCBkYXRhIGZvciB0YWJsZXNcbiAgICogQHBhcmFtIGRhdGFTZXRcbiAgICogQHBhcmFtIGZpZWxkTWFwXG4gICAqL1xuICBwcml2YXRlIF9wcmVwYXJlVGFibGVEYXRhKCBkYXRhU2V0OiBBcnJheTxhbnk+LCBmaWVsZE1hcDoge30gPSB7fSwgZW50aXR5Q29uZmlnOiBDb3JlQ29uZmlnID0gbnVsbCApe1xuICAgIC8vIERldGVybWluZSB3aGljaCBmaWVsZHMgc2hvdWxkIGJlIGFjdGVkIHVwb24uXG4gICAgY29uc3QgdHJhbnNmb3JtYXRpb25zID0gR2V0T2JqZWN0VHJhbnNmb3JtYXRpb25zKCBmaWVsZE1hcCApO1xuICAgIHJldHVybiBJc0FycmF5KCBkYXRhU2V0LCB0cnVlICkgPyBkYXRhU2V0Lm1hcCggcm93ID0+IFBvcFBpcGUudHJhbnNmb3JtT2JqZWN0VmFsdWVzKCB7IC4uLnJvdyB9LCB0cmFuc2Zvcm1hdGlvbnMsIGVudGl0eUNvbmZpZyApICkgOiBkYXRhU2V0O1xuICB9XG59XG4iXX0=