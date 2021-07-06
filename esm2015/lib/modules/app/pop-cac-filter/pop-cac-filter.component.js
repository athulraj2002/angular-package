import { Component, ElementRef, HostBinding, Inject, Input } from '@angular/core';
import { PopExtendComponent } from '../../../pop-extend.component';
import { PopBusiness, ServiceInjector } from '../../../pop-common.model';
import { IsObject, SetSessionSiteVar } from '../../../pop-common-utility';
import { PopCacFilterBarService } from './pop-cac-filter.service';
export class PopCacFilterComponent extends PopExtendComponent {
    constructor(el, APP_GLOBAL) {
        super();
        this.el = el;
        this.APP_GLOBAL = APP_GLOBAL;
        this.hidden = false;
        this.name = 'PopCacFilterComponent';
        // this represents the data to be filtered and given to the filter bar view.
        this.srv = {
            filter: ServiceInjector.get(PopCacFilterBarService),
        };
        this.asset = {
            filter: undefined // the current filter applied to all columns, this is the (finished product) that we want to be stored in the base service
        };
        this.ui = {
            config: undefined,
            entities: []
        };
        this.dom.configure = () => {
            return new Promise((resolve) => {
                this.ui.config = this.srv.filter.getConfig();
                if (!(IsObject(this.ui.config)))
                    this.ui.config = {};
                this.srv.filter.register(el);
                if (IsObject(PopBusiness, ['id']) && this.APP_GLOBAL.isFilterBar()) {
                    if (this.ui.config.active) {
                        this.asset.filter = this.srv.filter.getFilter();
                        this.srv.filter.setActive(!this.hidden);
                    }
                }
                else {
                    this.hidden = true;
                    this.ui.config.active = false;
                    // this.srv.filter.setFilter({});
                }
                return resolve(true);
            });
        };
    }
    /**
     * This component should have a specific purpose
     */
    ngOnInit() {
        super.ngOnInit();
    }
    /**
     * Event Emitter
     */
    onBubbleEvent(event) {
        if (event.type === 'filter') {
            switch (event.name) {
                case 'apply':
                    this.srv.filter.setFilter(event.data);
                    break;
                case 'clear':
                    this.srv.filter.setFilter({});
                    break;
                case 'state':
                    if (event.model === 'open') {
                        SetSessionSiteVar(`Business.${PopBusiness.id}.Filter.open`, event.data);
                        this.dom.setTimeout(`set-filter-height`, () => {
                            const height = this.srv.filter.getElHeight();
                            if (height) {
                                SetSessionSiteVar(`Business.${PopBusiness.id}.Filter.height`, height);
                            }
                        }, 0);
                    }
                    break;
                default:
                    break;
            }
        }
        this.srv.filter.onChange(event);
    }
    /**
     * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
     */
    ngOnDestroy() {
        super.ngOnDestroy();
    }
}
PopCacFilterComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-cac-filter',
                template: `
    <div class="pop-client-filter-container">
      <lib-pop-cac-filter-view *ngIf="ui.config?.active" (events)="onBubbleEvent($event)"></lib-pop-cac-filter-view>
    </div>
  `,
                styles: [`
    .pop-client-filter-container {
      display: flex;
      flex-direction: column;
      width: 100%;
      box-sizing: border-box;
      /*align-items: center;*/
      padding: 0;
    }
  `]
            },] }
];
PopCacFilterComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: undefined, decorators: [{ type: Inject, args: ['APP_GLOBAL',] }] }
];
PopCacFilterComponent.propDecorators = {
    hidden: [{ type: HostBinding, args: ['class.sw-hidden',] }, { type: Input }],
    config: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWNhYy1maWx0ZXIuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvYXBwL3BvcC1jYWMtZmlsdGVyL3BvcC1jYWMtZmlsdGVyLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBcUIsTUFBTSxlQUFlLENBQUM7QUFDckcsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDbkUsT0FBTyxFQUFvRSxXQUFXLEVBQUUsZUFBZSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDM0ksT0FBTyxFQUFFLFFBQVEsRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQzFFLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBc0JsRSxNQUFNLE9BQU8scUJBQXNCLFNBQVEsa0JBQWtCO0lBdUIzRCxZQUNTLEVBQWMsRUFDVyxVQUE4QjtRQUU5RCxLQUFLLEVBQUUsQ0FBQztRQUhELE9BQUUsR0FBRixFQUFFLENBQVk7UUFDVyxlQUFVLEdBQVYsVUFBVSxDQUFvQjtRQXhCdkIsV0FBTSxHQUFHLEtBQUssQ0FBQztRQUdqRCxTQUFJLEdBQUcsdUJBQXVCLENBQUM7UUFDdEMsNEVBQTRFO1FBRWxFLFFBQUcsR0FFVDtZQUNGLE1BQU0sRUFBRSxlQUFlLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDO1NBQ3BELENBQUM7UUFFUSxVQUFLLEdBQUc7WUFDaEIsTUFBTSxFQUFFLFNBQVMsQ0FBQywwSEFBMEg7U0FDN0ksQ0FBQztRQUVLLE9BQUUsR0FBRztZQUNWLE1BQU0sRUFBc0IsU0FBUztZQUNyQyxRQUFRLEVBQTJCLEVBQUU7U0FDdEMsQ0FBQztRQVNBLElB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QUFRLEVBQUUsb0JBQW9CO2dCQUM5QixRQUFRLEVBQUU7Ozs7R0FJVDt5QkFDUzs7Ozs7Ozs7O0dBU1Q7YUFDRjs7O1lBekJtQixVQUFVOzRDQW1EekIsTUFBTSxTQUFFLFlBQVk7OztxQkF4QnRCLFdBQVcsU0FBQyxpQkFBaUIsY0FBRyxLQUFLO3FCQUNyQyxLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBIb3N0QmluZGluZywgSW5qZWN0LCBJbnB1dCwgT25EZXN0cm95LCBPbkluaXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFBvcEV4dGVuZENvbXBvbmVudCB9IGZyb20gJy4uLy4uLy4uL3BvcC1leHRlbmQuY29tcG9uZW50JztcbmltcG9ydCB7IEFwcEdsb2JhbEludGVyZmFjZSwgRW50aXR5RmlsdGVySW50ZXJmYWNlLCBQb3BCYXNlRXZlbnRJbnRlcmZhY2UsIFBvcEJ1c2luZXNzLCBTZXJ2aWNlSW5qZWN0b3IgfSBmcm9tICcuLi8uLi8uLi9wb3AtY29tbW9uLm1vZGVsJztcbmltcG9ydCB7IElzT2JqZWN0LCBTZXRTZXNzaW9uU2l0ZVZhciB9IGZyb20gJy4uLy4uLy4uL3BvcC1jb21tb24tdXRpbGl0eSc7XG5pbXBvcnQgeyBQb3BDYWNGaWx0ZXJCYXJTZXJ2aWNlIH0gZnJvbSAnLi9wb3AtY2FjLWZpbHRlci5zZXJ2aWNlJztcbmltcG9ydCB7IENhY0ZpbHRlckJhckNvbmZpZyB9IGZyb20gJy4vcG9wLWNhYy1maWx0ZXIubW9kZWwnO1xuXG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2xpYi1wb3AtY2FjLWZpbHRlcicsXG4gIHRlbXBsYXRlOiBgXG4gICAgPGRpdiBjbGFzcz1cInBvcC1jbGllbnQtZmlsdGVyLWNvbnRhaW5lclwiPlxuICAgICAgPGxpYi1wb3AtY2FjLWZpbHRlci12aWV3ICpuZ0lmPVwidWkuY29uZmlnPy5hY3RpdmVcIiAoZXZlbnRzKT1cIm9uQnViYmxlRXZlbnQoJGV2ZW50KVwiPjwvbGliLXBvcC1jYWMtZmlsdGVyLXZpZXc+XG4gICAgPC9kaXY+XG4gIGAsXG4gIHN0eWxlczogWyBgXG4gICAgLnBvcC1jbGllbnQtZmlsdGVyLWNvbnRhaW5lciB7XG4gICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICAgIC8qYWxpZ24taXRlbXM6IGNlbnRlcjsqL1xuICAgICAgcGFkZGluZzogMDtcbiAgICB9XG4gIGAgXVxufSlcbmV4cG9ydCBjbGFzcyBQb3BDYWNGaWx0ZXJDb21wb25lbnQgZXh0ZW5kcyBQb3BFeHRlbmRDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG4gIEBIb3N0QmluZGluZygnY2xhc3Muc3ctaGlkZGVuJykgQElucHV0KCkgaGlkZGVuID0gZmFsc2U7XG4gIEBJbnB1dCgpIGNvbmZpZzogQ2FjRmlsdGVyQmFyQ29uZmlnO1xuXG4gIHB1YmxpYyBuYW1lID0gJ1BvcENhY0ZpbHRlckNvbXBvbmVudCc7XG4gIC8vIHRoaXMgcmVwcmVzZW50cyB0aGUgZGF0YSB0byBiZSBmaWx0ZXJlZCBhbmQgZ2l2ZW4gdG8gdGhlIGZpbHRlciBiYXIgdmlldy5cblxuICBwcm90ZWN0ZWQgc3J2OiB7XG4gICAgZmlsdGVyOiBQb3BDYWNGaWx0ZXJCYXJTZXJ2aWNlLFxuICB9ID0ge1xuICAgIGZpbHRlcjogU2VydmljZUluamVjdG9yLmdldChQb3BDYWNGaWx0ZXJCYXJTZXJ2aWNlKSxcbiAgfTtcblxuICBwcm90ZWN0ZWQgYXNzZXQgPSB7XG4gICAgZmlsdGVyOiB1bmRlZmluZWQgLy8gdGhlIGN1cnJlbnQgZmlsdGVyIGFwcGxpZWQgdG8gYWxsIGNvbHVtbnMsIHRoaXMgaXMgdGhlIChmaW5pc2hlZCBwcm9kdWN0KSB0aGF0IHdlIHdhbnQgdG8gYmUgc3RvcmVkIGluIHRoZSBiYXNlIHNlcnZpY2VcbiAgfTtcblxuICBwdWJsaWMgdWkgPSB7XG4gICAgY29uZmlnOiA8Q2FjRmlsdGVyQmFyQ29uZmlnPnVuZGVmaW5lZCxcbiAgICBlbnRpdGllczogPEVudGl0eUZpbHRlckludGVyZmFjZVtdPltdXG4gIH07XG5cblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgZWw6IEVsZW1lbnRSZWYsXG4gICAgQEluamVjdCggJ0FQUF9HTE9CQUwnICkgcHJpdmF0ZSBBUFBfR0xPQkFMOiBBcHBHbG9iYWxJbnRlcmZhY2UsXG4gICl7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuZG9tLmNvbmZpZ3VyZSA9ICgpOiBQcm9taXNlPGJvb2xlYW4+ID0+IHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICB0aGlzLnVpLmNvbmZpZyA9IHRoaXMuc3J2LmZpbHRlci5nZXRDb25maWcoKTtcbiAgICAgICAgaWYoIShJc09iamVjdCh0aGlzLnVpLmNvbmZpZykpKSB0aGlzLnVpLmNvbmZpZyA9IDxDYWNGaWx0ZXJCYXJDb25maWc+e307XG4gICAgICAgIHRoaXMuc3J2LmZpbHRlci5yZWdpc3RlcihlbCk7XG4gICAgICAgIGlmKCBJc09iamVjdChQb3BCdXNpbmVzcywgWyAnaWQnIF0pICYmIHRoaXMuQVBQX0dMT0JBTC5pc0ZpbHRlckJhcigpICl7XG4gICAgICAgICAgaWYoIHRoaXMudWkuY29uZmlnLmFjdGl2ZSApe1xuICAgICAgICAgICAgdGhpcy5hc3NldC5maWx0ZXIgPSB0aGlzLnNydi5maWx0ZXIuZ2V0RmlsdGVyKCk7XG4gICAgICAgICAgICB0aGlzLnNydi5maWx0ZXIuc2V0QWN0aXZlKCF0aGlzLmhpZGRlbik7XG4gICAgICAgICAgfVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICB0aGlzLmhpZGRlbiA9IHRydWU7XG4gICAgICAgICAgdGhpcy51aS5jb25maWcuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgLy8gdGhpcy5zcnYuZmlsdGVyLnNldEZpbHRlcih7fSk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXNvbHZlKHRydWUpO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoaXMgY29tcG9uZW50IHNob3VsZCBoYXZlIGEgc3BlY2lmaWMgcHVycG9zZVxuICAgKi9cbiAgbmdPbkluaXQoKXtcbiAgICBzdXBlci5uZ09uSW5pdCgpO1xuICB9XG5cblxuICAvKipcbiAgICogRXZlbnQgRW1pdHRlclxuICAgKi9cbiAgcHVibGljIG9uQnViYmxlRXZlbnQoZXZlbnQ6IFBvcEJhc2VFdmVudEludGVyZmFjZSl7XG4gICAgaWYoIGV2ZW50LnR5cGUgPT09ICdmaWx0ZXInICl7XG4gICAgICBzd2l0Y2goIGV2ZW50Lm5hbWUgKXtcbiAgICAgICAgY2FzZSAnYXBwbHknOlxuICAgICAgICAgIHRoaXMuc3J2LmZpbHRlci5zZXRGaWx0ZXIoZXZlbnQuZGF0YSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2NsZWFyJzpcbiAgICAgICAgICB0aGlzLnNydi5maWx0ZXIuc2V0RmlsdGVyKHt9KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnc3RhdGUnOlxuICAgICAgICAgIGlmKCBldmVudC5tb2RlbCA9PT0gJ29wZW4nICl7XG4gICAgICAgICAgICBTZXRTZXNzaW9uU2l0ZVZhcihgQnVzaW5lc3MuJHtQb3BCdXNpbmVzcy5pZH0uRmlsdGVyLm9wZW5gLCBldmVudC5kYXRhKTtcbiAgICAgICAgICAgIHRoaXMuZG9tLnNldFRpbWVvdXQoYHNldC1maWx0ZXItaGVpZ2h0YCwgKCkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBoZWlnaHQgPSB0aGlzLnNydi5maWx0ZXIuZ2V0RWxIZWlnaHQoKTtcbiAgICAgICAgICAgICAgaWYoaGVpZ2h0KXtcbiAgICAgICAgICAgICAgICBTZXRTZXNzaW9uU2l0ZVZhcihgQnVzaW5lc3MuJHtQb3BCdXNpbmVzcy5pZH0uRmlsdGVyLmhlaWdodGAsIGhlaWdodCk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnNydi5maWx0ZXIub25DaGFuZ2UoZXZlbnQpO1xuICB9XG5cblxuICAvKipcbiAgICogVGhlIGRvbSBkZXN0cm95IGZ1bmN0aW9uIG1hbmFnZXMgYWxsIHRoZSBjbGVhbiB1cCB0aGF0IGlzIG5lY2Vzc2FyeSBpZiBzdWJzY3JpcHRpb25zLCB0aW1lb3V0cywgZXRjIGFyZSBzdG9yZWQgcHJvcGVybHlcbiAgICovXG4gIG5nT25EZXN0cm95KCl7XG4gICAgc3VwZXIubmdPbkRlc3Ryb3koKTtcbiAgfVxuXG5cbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBVbmRlciBUaGUgSG9vZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIFByaXZhdGUgTWV0aG9kICkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cblxufVxuIl19