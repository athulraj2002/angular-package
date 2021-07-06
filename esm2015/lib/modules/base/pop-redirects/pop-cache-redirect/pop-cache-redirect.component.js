import { __awaiter } from "tslib";
import { Component } from '@angular/core';
import { PopCacheRedirectUrl, PopTemplate, ServiceInjector, SetPopCacheRedirectUrl } from '../../../../pop-common.model';
import { PopEntityService } from '../../../entity/services/pop-entity.service';
import { PopExtendComponent } from '../../../../pop-extend.component';
import { Router } from '@angular/router';
import { IsString } from '../../../../pop-common-utility';
export class PopCacheRedirectComponent extends PopExtendComponent {
    constructor() {
        super();
        this.name = 'PopCacheRedirectComponent';
        this.srv = {
            router: ServiceInjector.get(Router),
            entity: ServiceInjector.get(PopEntityService),
        };
        this.ui = {
            code: undefined,
            message: undefined
        };
        /**
         * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
         */
        this.dom.configure = () => {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                this.dom.setHeight(PopTemplate.getContentHeight(), 120);
                PopTemplate.clear();
                this.srv.entity.bustAllCache();
                return resolve(true);
            }));
        };
        this.dom.proceed = () => {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                this.dom.setTimeout(`cache-redirect`, () => {
                    if (IsString(PopCacheRedirectUrl, true)) {
                        this.srv.router.navigate([PopCacheRedirectUrl], { skipLocationChange: true }).then(() => {
                            // console.log('cache redirect success');
                            return true;
                        });
                    }
                    else {
                        this.srv.router.navigate(['system/route']);
                    }
                }, 250);
                return resolve(true);
            }));
        };
    }
    /**
     * This component allows a redirect that will clear all cache and then return back to the url
     */
    ngOnInit() {
        super.ngOnInit();
    }
    /**
     * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
     */
    ngOnDestroy() {
        SetPopCacheRedirectUrl(null);
        super.ngOnDestroy();
    }
}
PopCacheRedirectComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-cache-redirect',
                template: "<div class=\"pcr-container\">\n  <mat-card>\n    <mat-card-content>\n      <div class=\"pcr-spinner-box\">\n        <lib-main-spinner></lib-main-spinner>\n      </div>\n    </mat-card-content>\n  </mat-card>\n</div>\n",
                styles: [".pcr-container{position:relative;display:flex;flex-direction:row;padding:var(--gap-s) var(--gap-lm) var(--gap-lm) var(--gap-lm);box-sizing:border-box;justify-content:center;align-items:flex-start;min-height:200px}.pcr-container mat-card{width:300px}.pcr-container mat-card-title{text-align:center;margin-bottom:var(--gap-m)!important}.pcr-container form{margin:var(--gap-s) 0!important}.pcr-spinner-box{height:80vh}"]
            },] }
];
PopCacheRedirectComponent.ctorParameters = () => [];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWNhY2hlLXJlZGlyZWN0LmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2Jhc2UvcG9wLXJlZGlyZWN0cy9wb3AtY2FjaGUtcmVkaXJlY3QvcG9wLWNhY2hlLXJlZGlyZWN0LmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBcUIsTUFBTSxlQUFlLENBQUM7QUFDN0QsT0FBTyxFQUFFLG1CQUFtQixFQUFFLFdBQVcsRUFBRSxlQUFlLEVBQUUsc0JBQXNCLEVBQWlCLE1BQU0sOEJBQThCLENBQUM7QUFDeEksT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sNkNBQTZDLENBQUM7QUFDL0UsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sa0NBQWtDLENBQUM7QUFDdEUsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ3pDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQVExRCxNQUFNLE9BQU8seUJBQTBCLFNBQVEsa0JBQWtCO0lBZS9EO1FBQ0UsS0FBSyxFQUFFLENBQUM7UUFkSCxTQUFJLEdBQUcsMkJBQTJCLENBQUM7UUFFaEMsUUFBRyxHQUFHO1lBQ2QsTUFBTSxFQUFVLGVBQWUsQ0FBQyxHQUFHLENBQUUsTUFBTSxDQUFFO1lBQzdDLE1BQU0sRUFBb0IsZUFBZSxDQUFDLEdBQUcsQ0FBRSxnQkFBZ0IsQ0FBRTtTQUNsRSxDQUFDO1FBRUssT0FBRSxHQUFHO1lBQ1YsSUFBSSxFQUFVLFNBQVM7WUFDdkIsT0FBTyxFQUFVLFNBQVM7U0FDM0IsQ0FBQztRQU1BOztXQUVHO1FBQ0gsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsR0FBcUIsRUFBRTtZQUMxQyxPQUFPLElBQUksT0FBTyxDQUFFLENBQU8sT0FBTyxFQUFHLEVBQUU7Z0JBQ3JDLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFFLFdBQVcsQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLEdBQUcsQ0FBRSxDQUFDO2dCQUMxRCxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ3BCLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUMvQixPQUFPLE9BQU8sQ0FBRSxJQUFJLENBQUUsQ0FBQztZQUN6QixDQUFDLENBQUEsQ0FBRSxDQUFDO1FBQ04sQ0FBQyxDQUFDO1FBRUYsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEdBQUcsR0FBRyxFQUFFO1lBQ3RCLE9BQU8sSUFBSSxPQUFPLENBQUUsQ0FBTyxPQUFPLEVBQUcsRUFBRTtnQkFDckMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUUsZ0JBQWdCLEVBQUUsR0FBRyxFQUFFO29CQUMxQyxJQUFHLFFBQVEsQ0FBQyxtQkFBbUIsRUFBRSxJQUFJLENBQUMsRUFBQzt3QkFDckMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFFLENBQUUsbUJBQW1CLENBQUUsRUFBRSxFQUFDLGtCQUFrQixFQUFFLElBQUksRUFBQyxDQUFFLENBQUMsSUFBSSxDQUFDLEdBQUUsRUFBRTs0QkFDdkYseUNBQXlDOzRCQUN6QyxPQUFPLElBQUksQ0FBQzt3QkFDZCxDQUFDLENBQUMsQ0FBQztxQkFDSjt5QkFBSzt3QkFDSixJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO3FCQUM1QztnQkFFSCxDQUFDLEVBQUUsR0FBRyxDQUFFLENBQUM7Z0JBRVQsT0FBTyxPQUFPLENBQUUsSUFBSSxDQUFFLENBQUM7WUFDekIsQ0FBQyxDQUFBLENBQUUsQ0FBQztRQUNOLENBQUMsQ0FBQztJQUVKLENBQUM7SUFHRDs7T0FFRztJQUNILFFBQVE7UUFDTixLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDbkIsQ0FBQztJQUdEOztPQUVHO0lBQ0gsV0FBVztRQUNULHNCQUFzQixDQUFFLElBQUksQ0FBRSxDQUFDO1FBQy9CLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN0QixDQUFDOzs7WUF0RUYsU0FBUyxTQUFFO2dCQUNWLFFBQVEsRUFBRSx3QkFBd0I7Z0JBQ2xDLHFPQUFrRDs7YUFFbkQiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIE9uRGVzdHJveSwgT25Jbml0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBQb3BDYWNoZVJlZGlyZWN0VXJsLCBQb3BUZW1wbGF0ZSwgU2VydmljZUluamVjdG9yLCBTZXRQb3BDYWNoZVJlZGlyZWN0VXJsLCBTZXRQb3BNZXNzYWdlIH0gZnJvbSAnLi4vLi4vLi4vLi4vcG9wLWNvbW1vbi5tb2RlbCc7XG5pbXBvcnQgeyBQb3BFbnRpdHlTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vLi4vZW50aXR5L3NlcnZpY2VzL3BvcC1lbnRpdHkuc2VydmljZSc7XG5pbXBvcnQgeyBQb3BFeHRlbmRDb21wb25lbnQgfSBmcm9tICcuLi8uLi8uLi8uLi9wb3AtZXh0ZW5kLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBSb3V0ZXIgfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xuaW1wb3J0IHsgSXNTdHJpbmcgfSBmcm9tICcuLi8uLi8uLi8uLi9wb3AtY29tbW9uLXV0aWxpdHknO1xuXG5cbkBDb21wb25lbnQoIHtcbiAgc2VsZWN0b3I6ICdsaWItcG9wLWNhY2hlLXJlZGlyZWN0JyxcbiAgdGVtcGxhdGVVcmw6ICcuL3BvcC1jYWNoZS1yZWRpcmVjdC5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWyAnLi9wb3AtY2FjaGUtcmVkaXJlY3QuY29tcG9uZW50LnNjc3MnIF1cbn0gKVxuZXhwb3J0IGNsYXNzIFBvcENhY2hlUmVkaXJlY3RDb21wb25lbnQgZXh0ZW5kcyBQb3BFeHRlbmRDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG5cbiAgcHVibGljIG5hbWUgPSAnUG9wQ2FjaGVSZWRpcmVjdENvbXBvbmVudCc7XG5cbiAgcHJvdGVjdGVkIHNydiA9IHtcbiAgICByb3V0ZXI6IDxSb3V0ZXI+U2VydmljZUluamVjdG9yLmdldCggUm91dGVyICksXG4gICAgZW50aXR5OiA8UG9wRW50aXR5U2VydmljZT5TZXJ2aWNlSW5qZWN0b3IuZ2V0KCBQb3BFbnRpdHlTZXJ2aWNlICksXG4gIH07XG5cbiAgcHVibGljIHVpID0ge1xuICAgIGNvZGU6IDxudW1iZXI+dW5kZWZpbmVkLFxuICAgIG1lc3NhZ2U6IDxzdHJpbmc+dW5kZWZpbmVkXG4gIH07XG5cblxuICBjb25zdHJ1Y3Rvcigpe1xuICAgIHN1cGVyKCk7XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIHNob3VsZCB0cmFuc2Zvcm0gYW5kIHZhbGlkYXRlIHRoZSBkYXRhLiBUaGUgdmlldyBzaG91bGQgdHJ5IHRvIG9ubHkgdXNlIGRhdGEgdGhhdCBpcyBzdG9yZWQgb24gdWkgc28gdGhhdCBpdCBpcyBub3QgZGVwZW5kZW50IG9uIHRoZSBzdHJ1Y3R1cmUgb2YgZGF0YSB0aGF0IGNvbWVzIGZyb20gb3RoZXIgc291cmNlcy4gVGhlIHVpIHNob3VsZCBiZSB0aGUgc291cmNlIG9mIHRydXRoIGhlcmUuXG4gICAgICovXG4gICAgdGhpcy5kb20uY29uZmlndXJlID0gKCk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCBhc3luYyggcmVzb2x2ZSApID0+IHtcbiAgICAgICAgdGhpcy5kb20uc2V0SGVpZ2h0KCBQb3BUZW1wbGF0ZS5nZXRDb250ZW50SGVpZ2h0KCksIDEyMCApO1xuICAgICAgICBQb3BUZW1wbGF0ZS5jbGVhcigpO1xuICAgICAgICB0aGlzLnNydi5lbnRpdHkuYnVzdEFsbENhY2hlKCk7XG4gICAgICAgIHJldHVybiByZXNvbHZlKCB0cnVlICk7XG4gICAgICB9ICk7XG4gICAgfTtcblxuICAgIHRoaXMuZG9tLnByb2NlZWQgPSAoKSA9PiB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoIGFzeW5jKCByZXNvbHZlICkgPT4ge1xuICAgICAgICB0aGlzLmRvbS5zZXRUaW1lb3V0KCBgY2FjaGUtcmVkaXJlY3RgLCAoKSA9PiB7XG4gICAgICAgICAgaWYoSXNTdHJpbmcoUG9wQ2FjaGVSZWRpcmVjdFVybCwgdHJ1ZSkpe1xuICAgICAgICAgICAgdGhpcy5zcnYucm91dGVyLm5hdmlnYXRlKCBbIFBvcENhY2hlUmVkaXJlY3RVcmwgXSwge3NraXBMb2NhdGlvbkNoYW5nZTogdHJ1ZX0gKS50aGVuKCgpPT57XG4gICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdjYWNoZSByZWRpcmVjdCBzdWNjZXNzJyk7XG4gICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBlbHNle1xuICAgICAgICAgICAgdGhpcy5zcnYucm91dGVyLm5hdmlnYXRlKFsnc3lzdGVtL3JvdXRlJ10pO1xuICAgICAgICAgIH1cblxuICAgICAgICB9LCAyNTAgKTtcblxuICAgICAgICByZXR1cm4gcmVzb2x2ZSggdHJ1ZSApO1xuICAgICAgfSApO1xuICAgIH07XG5cbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgY29tcG9uZW50IGFsbG93cyBhIHJlZGlyZWN0IHRoYXQgd2lsbCBjbGVhciBhbGwgY2FjaGUgYW5kIHRoZW4gcmV0dXJuIGJhY2sgdG8gdGhlIHVybFxuICAgKi9cbiAgbmdPbkluaXQoKXtcbiAgICBzdXBlci5uZ09uSW5pdCgpO1xuICB9XG5cblxuICAvKipcbiAgICogVGhlIGRvbSBkZXN0cm95IGZ1bmN0aW9uIG1hbmFnZXMgYWxsIHRoZSBjbGVhbiB1cCB0aGF0IGlzIG5lY2Vzc2FyeSBpZiBzdWJzY3JpcHRpb25zLCB0aW1lb3V0cywgZXRjIGFyZSBzdG9yZWQgcHJvcGVybHlcbiAgICovXG4gIG5nT25EZXN0cm95KCl7XG4gICAgU2V0UG9wQ2FjaGVSZWRpcmVjdFVybCggbnVsbCApO1xuICAgIHN1cGVyLm5nT25EZXN0cm95KCk7XG4gIH1cblxuXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVW5kZXIgVGhlIEhvb2QgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBQcml2YXRlIE1ldGhvZCApICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG59XG4iXX0=