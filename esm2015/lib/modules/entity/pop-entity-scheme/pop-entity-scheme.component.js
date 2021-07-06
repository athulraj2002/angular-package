import { __awaiter } from "tslib";
import { Component, ElementRef } from '@angular/core';
import { TabConfig } from '../../base/pop-tab-menu/tab-menu.model';
import { PopEntitySchemeService } from './pop-entity-scheme.service';
import { PopExtendComponent } from '../../../pop-extend.component';
import { PopDomService } from '../../../services/pop-dom.service';
import { PopEntitySchemeAssetPoolComponent } from './pop-entity-scheme-asset-pool/pop-entity-scheme-asset-pool.component';
import { PopEntitySchemeAssetLayoutComponent } from './pop-entity-scheme-asset-layout/pop-entity-scheme-asset-layout.component';
import { PopEntitySchemeDetailsComponent } from './pop-entity-scheme-details/pop-entity-scheme-details.component';
import { PopTabMenuService } from '../../base/pop-tab-menu/pop-tab-menu.service';
export class PopEntitySchemeComponent extends PopExtendComponent {
    /**
     *
     * @param el
     * @param _domRepo - transfer
     * @param _schemeRepo - transfer
     * @param _tabRepo - transfer
     */
    constructor(el, _domRepo, _schemeRepo, _tabRepo) {
        super();
        this.el = el;
        this._domRepo = _domRepo;
        this._schemeRepo = _schemeRepo;
        this._tabRepo = _tabRepo;
        this.name = 'PopEntitySchemeComponent';
        this.srv = {
            scheme: undefined,
            tab: undefined
        };
        this.dom.configure = () => {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                this.ui.tab = new TabConfig({
                    id: 'general',
                    positions: {
                        1: {
                            header: 'Details',
                            flex: 1,
                            components: [
                                {
                                    type: PopEntitySchemeDetailsComponent,
                                    inputs: {
                                        id: 1
                                    },
                                },
                            ]
                        },
                        2: {
                            flex: 1,
                            header: 'Available Fields & Components',
                            components: [
                                {
                                    type: PopEntitySchemeAssetPoolComponent,
                                    inputs: {
                                        id: 2
                                    },
                                },
                            ]
                        },
                        3: {
                            flex: 2,
                            header: 'Profile Layout',
                            components: [
                                {
                                    type: PopEntitySchemeAssetLayoutComponent,
                                    inputs: {
                                        id: 3
                                    },
                                },
                            ]
                        },
                    },
                    wrap: false,
                    columnWrap: true,
                    overhead: 0,
                    onLoad: (config, tab) => {
                        // console.log('config', config);
                        // console.log('tab', tab);
                    },
                    onEvent: (core, event) => {
                        // console.log('event', event);
                    },
                });
                yield this.srv.scheme.init(this.core, this.ui.tab);
                return resolve(true);
            }));
        };
        this.dom.proceed = () => {
            return new Promise((resolve) => {
                this.dom.setSubscriber(`refresh`, this.srv.scheme.ui.refresh.subscribe((val) => {
                    if (val === 'reload') {
                        this.srv.tab.resetTab(true);
                        // this.srv.tab.refreshEntity(this.core.params.entityId, this.dom.repo, { bypassCache: true }, this.name).then(async()=>{
                        //   await this.srv.scheme.init( this.core, this.ui.tab );
                        //   this.srv.tab.resetTab();
                        // });
                    }
                }));
                return resolve(true);
            });
        };
    }
    ngOnInit() {
        super.ngOnInit();
    }
    ngOnDestroy() {
        super.ngOnDestroy();
    }
}
PopEntitySchemeComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-customer-scheme',
                template: `
    <lib-main-spinner *ngIf="dom.state.loader"></lib-main-spinner>
    <lib-pop-entity-tab *ngIf="dom.state.loaded" [tab]=ui.tab [core]="core"></lib-pop-entity-tab>`,
                providers: [PopEntitySchemeService]
            },] }
];
PopEntitySchemeComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: PopDomService },
    { type: PopEntitySchemeService },
    { type: PopTabMenuService }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS1zY2hlbWUuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvZW50aXR5L3BvcC1lbnRpdHktc2NoZW1lL3BvcC1lbnRpdHktc2NoZW1lLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQXFCLE1BQU0sZUFBZSxDQUFDO0FBQ3pFLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUNuRSxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUdyRSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUNuRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFDbEUsT0FBTyxFQUFFLGlDQUFpQyxFQUFFLE1BQU0sdUVBQXVFLENBQUM7QUFDMUgsT0FBTyxFQUFFLG1DQUFtQyxFQUFFLE1BQU0sMkVBQTJFLENBQUM7QUFDaEksT0FBTyxFQUFFLCtCQUErQixFQUFFLE1BQU0saUVBQWlFLENBQUM7QUFDbEgsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sOENBQThDLENBQUM7QUFTakYsTUFBTSxPQUFPLHdCQUF5QixTQUFRLGtCQUFrQjtJQVM5RDs7Ozs7O09BTUc7SUFDSCxZQUNTLEVBQWMsRUFDWCxRQUF1QixFQUN2QixXQUFtQyxFQUNuQyxRQUEyQjtRQUVyQyxLQUFLLEVBQUUsQ0FBQztRQUxELE9BQUUsR0FBRixFQUFFLENBQVk7UUFDWCxhQUFRLEdBQVIsUUFBUSxDQUFlO1FBQ3ZCLGdCQUFXLEdBQVgsV0FBVyxDQUF3QjtRQUNuQyxhQUFRLEdBQVIsUUFBUSxDQUFtQjtRQW5CaEMsU0FBSSxHQUFHLDBCQUEwQixDQUFDO1FBRS9CLFFBQUcsR0FBRztZ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UUFBUSxFQUFFOztrR0FFc0Y7Z0JBQ2hHLFNBQVMsRUFBRSxDQUFFLHNCQUFzQixDQUFFO2FBQ3RDOzs7WUFsQm1CLFVBQVU7WUFNckIsYUFBYTtZQUpiLHNCQUFzQjtZQVF0QixpQkFBaUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEVsZW1lbnRSZWYsIE9uRGVzdHJveSwgT25Jbml0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBUYWJDb25maWcgfSBmcm9tICcuLi8uLi9iYXNlL3BvcC10YWItbWVudS90YWItbWVudS5tb2RlbCc7XG5pbXBvcnQgeyBQb3BFbnRpdHlTY2hlbWVTZXJ2aWNlIH0gZnJvbSAnLi9wb3AtZW50aXR5LXNjaGVtZS5zZXJ2aWNlJztcbmltcG9ydCB7IENvcmVDb25maWcsIFBvcEJhc2VFdmVudEludGVyZmFjZSB9IGZyb20gJy4uLy4uLy4uL3BvcC1jb21tb24ubW9kZWwnO1xuXG5pbXBvcnQgeyBQb3BFeHRlbmRDb21wb25lbnQgfSBmcm9tICcuLi8uLi8uLi9wb3AtZXh0ZW5kLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBQb3BEb21TZXJ2aWNlIH0gZnJvbSAnLi4vLi4vLi4vc2VydmljZXMvcG9wLWRvbS5zZXJ2aWNlJztcbmltcG9ydCB7IFBvcEVudGl0eVNjaGVtZUFzc2V0UG9vbENvbXBvbmVudCB9IGZyb20gJy4vcG9wLWVudGl0eS1zY2hlbWUtYXNzZXQtcG9vbC9wb3AtZW50aXR5LXNjaGVtZS1hc3NldC1wb29sLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBQb3BFbnRpdHlTY2hlbWVBc3NldExheW91dENvbXBvbmVudCB9IGZyb20gJy4vcG9wLWVudGl0eS1zY2hlbWUtYXNzZXQtbGF5b3V0L3BvcC1lbnRpdHktc2NoZW1lLWFzc2V0LWxheW91dC5jb21wb25lbnQnO1xuaW1wb3J0IHsgUG9wRW50aXR5U2NoZW1lRGV0YWlsc0NvbXBvbmVudCB9IGZyb20gJy4vcG9wLWVudGl0eS1zY2hlbWUtZGV0YWlscy9wb3AtZW50aXR5LXNjaGVtZS1kZXRhaWxzLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBQb3BUYWJNZW51U2VydmljZSB9IGZyb20gJy4uLy4uL2Jhc2UvcG9wLXRhYi1tZW51L3BvcC10YWItbWVudS5zZXJ2aWNlJztcblxuQENvbXBvbmVudCgge1xuICBzZWxlY3RvcjogJ2xpYi1jdXN0b21lci1zY2hlbWUnLFxuICB0ZW1wbGF0ZTogYFxuICAgIDxsaWItbWFpbi1zcGlubmVyICpuZ0lmPVwiZG9tLnN0YXRlLmxvYWRlclwiPjwvbGliLW1haW4tc3Bpbm5lcj5cbiAgICA8bGliLXBvcC1lbnRpdHktdGFiICpuZ0lmPVwiZG9tLnN0YXRlLmxvYWRlZFwiIFt0YWJdPXVpLnRhYiBbY29yZV09XCJjb3JlXCI+PC9saWItcG9wLWVudGl0eS10YWI+YCxcbiAgcHJvdmlkZXJzOiBbIFBvcEVudGl0eVNjaGVtZVNlcnZpY2UgXSxcbn0gKVxuZXhwb3J0IGNsYXNzIFBvcEVudGl0eVNjaGVtZUNvbXBvbmVudCBleHRlbmRzIFBvcEV4dGVuZENvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcbiAgcHVibGljIG5hbWUgPSAnUG9wRW50aXR5U2NoZW1lQ29tcG9uZW50JztcblxuICBwcm90ZWN0ZWQgc3J2ID0ge1xuICAgIHNjaGVtZTogPFBvcEVudGl0eVNjaGVtZVNlcnZpY2U+dW5kZWZpbmVkLFxuICAgIHRhYjogPFBvcFRhYk1lbnVTZXJ2aWNlPnVuZGVmaW5lZFxuICB9O1xuXG5cbiAgLyoqXG4gICAqXG4gICAqIEBwYXJhbSBlbFxuICAgKiBAcGFyYW0gX2RvbVJlcG8gLSB0cmFuc2ZlclxuICAgKiBAcGFyYW0gX3NjaGVtZVJlcG8gLSB0cmFuc2ZlclxuICAgKiBAcGFyYW0gX3RhYlJlcG8gLSB0cmFuc2ZlclxuICAgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIGVsOiBFbGVtZW50UmVmLFxuICAgIHByb3RlY3RlZCBfZG9tUmVwbzogUG9wRG9tU2VydmljZSxcbiAgICBwcm90ZWN0ZWQgX3NjaGVtZVJlcG86IFBvcEVudGl0eVNjaGVtZVNlcnZpY2UsXG4gICAgcHJvdGVjdGVkIF90YWJSZXBvOiBQb3BUYWJNZW51U2VydmljZVxuICApe1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLmRvbS5jb25maWd1cmUgPSAoKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoIGFzeW5jKCByZXNvbHZlICkgPT4ge1xuICAgICAgICB0aGlzLnVpLnRhYiA9IG5ldyBUYWJDb25maWcoIHtcbiAgICAgICAgICBpZDogJ2dlbmVyYWwnLFxuICAgICAgICAgIHBvc2l0aW9uczoge1xuICAgICAgICAgICAgMToge1xuICAgICAgICAgICAgICBoZWFkZXI6ICdEZXRhaWxzJyxcbiAgICAgICAgICAgICAgZmxleDogMSxcbiAgICAgICAgICAgICAgY29tcG9uZW50czogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIHR5cGU6IFBvcEVudGl0eVNjaGVtZURldGFpbHNDb21wb25lbnQsXG4gICAgICAgICAgICAgICAgICBpbnB1dHM6IHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6IDFcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIDI6IHtcbiAgICAgICAgICAgICAgZmxleDogMSxcbiAgICAgICAgICAgICAgaGVhZGVyOiAnQXZhaWxhYmxlIEZpZWxkcyAmIENvbXBvbmVudHMnLFxuICAgICAgICAgICAgICBjb21wb25lbnRzOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgdHlwZTogUG9wRW50aXR5U2NoZW1lQXNzZXRQb29sQ29tcG9uZW50LFxuICAgICAgICAgICAgICAgICAgaW5wdXRzOiB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAyXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAzOiB7XG4gICAgICAgICAgICAgIGZsZXg6IDIsXG4gICAgICAgICAgICAgIGhlYWRlcjogJ1Byb2ZpbGUgTGF5b3V0JyxcbiAgICAgICAgICAgICAgY29tcG9uZW50czogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIHR5cGU6IFBvcEVudGl0eVNjaGVtZUFzc2V0TGF5b3V0Q29tcG9uZW50LFxuICAgICAgICAgICAgICAgICAgaW5wdXRzOiB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAzXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICB3cmFwOiBmYWxzZSxcbiAgICAgICAgICBjb2x1bW5XcmFwOiB0cnVlLFxuICAgICAgICAgIG92ZXJoZWFkOiAwLFxuICAgICAgICAgIG9uTG9hZDogKCBjb25maWc6IENvcmVDb25maWcsIHRhYjogVGFiQ29uZmlnICkgPT4ge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ2NvbmZpZycsIGNvbmZpZyk7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygndGFiJywgdGFiKTtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgb25FdmVudDogKCBjb3JlOiBDb3JlQ29uZmlnLCBldmVudDogUG9wQmFzZUV2ZW50SW50ZXJmYWNlICkgPT4ge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ2V2ZW50JywgZXZlbnQpO1xuICAgICAgICAgIH0sXG4gICAgICAgIH0gKTtcblxuICAgICAgICBhd2FpdCB0aGlzLnNydi5zY2hlbWUuaW5pdCggdGhpcy5jb3JlLCB0aGlzLnVpLnRhYiApO1xuXG4gICAgICAgIHJldHVybiByZXNvbHZlKCB0cnVlICk7XG4gICAgICB9ICk7XG4gICAgfTtcblxuICAgIHRoaXMuZG9tLnByb2NlZWQgPSAoKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoICggcmVzb2x2ZSApID0+IHtcbiAgICAgICAgdGhpcy5kb20uc2V0U3Vic2NyaWJlcihgcmVmcmVzaGAsIHRoaXMuc3J2LnNjaGVtZS51aS5yZWZyZXNoLnN1YnNjcmliZSgodmFsOiBzdHJpbmcpPT57XG4gICAgICAgICAgaWYodmFsID09PSAncmVsb2FkJyl7XG4gICAgICAgICAgICB0aGlzLnNydi50YWIucmVzZXRUYWIodHJ1ZSk7XG4gICAgICAgICAgICAvLyB0aGlzLnNydi50YWIucmVmcmVzaEVudGl0eSh0aGlzLmNvcmUucGFyYW1zLmVudGl0eUlkLCB0aGlzLmRvbS5yZXBvLCB7IGJ5cGFzc0NhY2hlOiB0cnVlIH0sIHRoaXMubmFtZSkudGhlbihhc3luYygpPT57XG4gICAgICAgICAgICAvLyAgIGF3YWl0IHRoaXMuc3J2LnNjaGVtZS5pbml0KCB0aGlzLmNvcmUsIHRoaXMudWkudGFiICk7XG4gICAgICAgICAgICAvLyAgIHRoaXMuc3J2LnRhYi5yZXNldFRhYigpO1xuICAgICAgICAgICAgLy8gfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KSk7XG4gICAgICAgIHJldHVybiByZXNvbHZlKCB0cnVlICk7XG4gICAgICB9ICk7XG4gICAgfTtcbiAgfVxuXG5cbiAgbmdPbkluaXQoKXtcbiAgICBzdXBlci5uZ09uSW5pdCgpO1xuICB9XG5cblxuICBuZ09uRGVzdHJveSgpe1xuICAgIHN1cGVyLm5nT25EZXN0cm95KCk7XG4gIH1cbn1cbiJdfQ==