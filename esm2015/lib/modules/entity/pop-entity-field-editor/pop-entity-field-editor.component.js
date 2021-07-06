import { Component, ElementRef, ViewEncapsulation } from '@angular/core';
import { PopExtendComponent } from '../../../pop-extend.component';
import { PopFieldEditorService } from './pop-entity-field-editor.service';
import { PopDomService } from '../../../services/pop-dom.service';
import { TabConfig } from '../../base/pop-tab-menu/tab-menu.model';
import { PopHref, ServiceInjector } from '../../../pop-common.model';
import { PopEntityFieldSettingsComponent } from './pop-entity-field-settings/pop-entity-field-settings.component';
import { PopEntityFieldDetailsComponent } from './pop-entity-field-details/pop-entity-field-details.component';
import { PopTabMenuService } from '../../base/pop-tab-menu/pop-tab-menu.service';
import { IsObject, StorageGetter } from '../../../pop-common-utility';
import { PopEntityFieldPreviewComponent } from './pop-entity-field-preview/pop-entity-field-preview.component';
import { PopRouteHistoryResolver } from '../../../services/pop-route-history.resolver';
import { PopEntityUtilFieldService } from '../services/pop-entity-util-field.service';
export class PopEntityFieldEditorComponent extends PopExtendComponent {
    /**
     * @param el
     * @param _domRepo
     * @param _fieldRepo
     * @param _tabRepo
     */
    constructor(el, _domRepo, _fieldRepo, _utilFieldRepo, _tabRepo) {
        super();
        this.el = el;
        this._domRepo = _domRepo;
        this._fieldRepo = _fieldRepo;
        this._utilFieldRepo = _utilFieldRepo;
        this._tabRepo = _tabRepo;
        this.name = 'PopEntityFieldEditorComponent';
        this.srv = {
            field: undefined,
            utilField: undefined,
            history: ServiceInjector.get(PopRouteHistoryResolver),
            tab: undefined,
        };
        /**
         * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
         */
        this.dom.configure = () => {
            return new Promise((resolve) => {
                if (!(IsObject(this.core, true)))
                    this.core = this.srv.tab.getCore();
                const fieldgroup = StorageGetter(this.core, ['entity', 'fieldgroup', 'name']);
                if (fieldgroup) {
                    this.ui.tab = new TabConfig({
                        id: 'general',
                        positions: {
                            1: {
                                header: 'Details',
                                flex: 1,
                                components: [
                                    {
                                        type: PopEntityFieldDetailsComponent,
                                        inputs: {
                                            id: 1
                                        },
                                    },
                                ]
                            },
                            2: {
                                flex: 2,
                                components: [
                                    {
                                        type: PopEntityFieldSettingsComponent,
                                        inputs: {
                                            id: 2
                                        },
                                    },
                                ]
                            },
                            3: {
                                flex: 1,
                                components: [
                                    {
                                        type: PopEntityFieldPreviewComponent,
                                        inputs: {
                                            id: 3
                                        },
                                    },
                                ]
                            },
                        },
                        wrap: true,
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
                    this.srv.field.register(this.core, this.dom.repo).then(() => {
                        this.srv.utilField.clearCustomFieldCache(+this.core.entity.id);
                        return resolve(true);
                    });
                }
                else {
                    window.location.href = window.location.origin + '/' + PopHref;
                }
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
     * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
     */
    ngOnDestroy() {
        super.ngOnDestroy();
    }
}
PopEntityFieldEditorComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-field-editor',
                template: `
    <lib-pop-entity-tab *ngIf="dom.state.loaded" [tab]=ui.tab [core]="core"></lib-pop-entity-tab>`,
                providers: [PopFieldEditorService],
                encapsulation: ViewEncapsulation.None,
                styles: [".entity-field-editor-header{display:flex;flex-direction:column;height:97px}.entity-field-editor-header-section{position:relative;width:100%;box-sizing:border-box;height:30px;clear:both}.entity-field-editor-container{min-height:100px;position:relative}.entity-field-editor-border{border:1px solid var(--border)}.entity-field-editor-section-header{position:relative;display:flex;flex-direction:row;height:40px;padding:0 5px 0 10px;align-items:center;justify-content:space-between;font-size:1em;font-weight:700;clear:both;box-sizing:border-box;background:var(--darken02)}.entity-field-editor-section-header-helper-icon{width:20px;height:20px;font-size:1em;z-index:2}.entity-field-editor-active-selection{padding-left:0!important;border-left:5px solid var(--primary)}.entity-field-editor-active-config{border-left:5px solid var(--primary)}"]
            },] }
];
PopEntityFieldEditorComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: PopDomService },
    { type: PopFieldEditorService },
    { type: PopEntityUtilFieldService },
    { type: PopTabMenuService }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS1maWVsZC1lZGl0b3IuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvZW50aXR5L3BvcC1lbnRpdHktZmllbGQtZWRpdG9yL3BvcC1lbnRpdHktZmllbGQtZWRpdG9yLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBcUIsaUJBQWlCLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDNUYsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDbkUsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFDMUUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBQ2xFLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUNuRSxPQUFPLEVBQXFDLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUN4RyxPQUFPLEVBQUUsK0JBQStCLEVBQUUsTUFBTSxpRUFBaUUsQ0FBQztBQUNsSCxPQUFPLEVBQUUsOEJBQThCLEVBQUUsTUFBTSwrREFBK0QsQ0FBQztBQUMvRyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSw4Q0FBOEMsQ0FBQztBQUNqRixPQUFPLEVBQUUsUUFBUSxFQUFFLGFBQWEsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQ3RFLE9BQU8sRUFBRSw4QkFBOEIsRUFBRSxNQUFNLCtEQUErRCxDQUFDO0FBQy9HLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLDhDQUE4QyxDQUFDO0FBQ3ZGLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLDJDQUEyQyxDQUFDO0FBV3RGLE1BQU0sT0FBTyw2QkFBOEIsU0FBUSxrQkFBa0I7SUFhbkU7Ozs7O09B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ekIsQ0FBQyxDQUFFLENBQUM7aUJBRUw7cUJBQUk7b0JBQ0gsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsR0FBRyxHQUFHLE9BQU8sQ0FBQztpQkFDL0Q7WUFDSCxDQUFDLENBQUUsQ0FBQztRQUNOLENBQUMsQ0FBQztJQUNKLENBQUM7SUFHRDs7T0FFRztJQUNILFFBQVE7UUFDTixLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDbkIsQ0FBQztJQUdEOztPQUVHO0lBQ0gsV0FBVztRQUNULEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN0QixDQUFDOzs7WUF4SEYsU0FBUyxTQUFFO2dCQUNWLFFBQVEsRUFBRSxrQkFBa0I7Z0JBQzVCLFFBQVEsRUFBRTtrR0FDc0Y7Z0JBRWhHLFNBQVMsRUFBRSxDQUFFLHFCQUFxQixDQUFFO2dCQUNwQyxhQUFhLEVBQUUsaUJBQWlCLENBQUMsSUFBSTs7YUFDdEM7OztZQXRCbUIsVUFBVTtZQUdyQixhQUFhO1lBRGIscUJBQXFCO1lBVXJCLHlCQUF5QjtZQUp6QixpQkFBaUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEVsZW1lbnRSZWYsIE9uRGVzdHJveSwgT25Jbml0LCBWaWV3RW5jYXBzdWxhdGlvbiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgUG9wRXh0ZW5kQ29tcG9uZW50IH0gZnJvbSAnLi4vLi4vLi4vcG9wLWV4dGVuZC5jb21wb25lbnQnO1xuaW1wb3J0IHsgUG9wRmllbGRFZGl0b3JTZXJ2aWNlIH0gZnJvbSAnLi9wb3AtZW50aXR5LWZpZWxkLWVkaXRvci5zZXJ2aWNlJztcbmltcG9ydCB7IFBvcERvbVNlcnZpY2UgfSBmcm9tICcuLi8uLi8uLi9zZXJ2aWNlcy9wb3AtZG9tLnNlcnZpY2UnO1xuaW1wb3J0IHsgVGFiQ29uZmlnIH0gZnJvbSAnLi4vLi4vYmFzZS9wb3AtdGFiLW1lbnUvdGFiLW1lbnUubW9kZWwnO1xuaW1wb3J0IHsgQ29yZUNvbmZpZywgUG9wQmFzZUV2ZW50SW50ZXJmYWNlLCBQb3BIcmVmLCBTZXJ2aWNlSW5qZWN0b3IgfSBmcm9tICcuLi8uLi8uLi9wb3AtY29tbW9uLm1vZGVsJztcbmltcG9ydCB7IFBvcEVudGl0eUZpZWxkU2V0dGluZ3NDb21wb25lbnQgfSBmcm9tICcuL3BvcC1lbnRpdHktZmllbGQtc2V0dGluZ3MvcG9wLWVudGl0eS1maWVsZC1zZXR0aW5ncy5jb21wb25lbnQnO1xuaW1wb3J0IHsgUG9wRW50aXR5RmllbGREZXRhaWxzQ29tcG9uZW50IH0gZnJvbSAnLi9wb3AtZW50aXR5LWZpZWxkLWRldGFpbHMvcG9wLWVudGl0eS1maWVsZC1kZXRhaWxzLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBQb3BUYWJNZW51U2VydmljZSB9IGZyb20gJy4uLy4uL2Jhc2UvcG9wLXRhYi1tZW51L3BvcC10YWItbWVudS5zZXJ2aWNlJztcbmltcG9ydCB7IElzT2JqZWN0LCBTdG9yYWdlR2V0dGVyIH0gZnJvbSAnLi4vLi4vLi4vcG9wLWNvbW1vbi11dGlsaXR5JztcbmltcG9ydCB7IFBvcEVudGl0eUZpZWxkUHJldmlld0NvbXBvbmVudCB9IGZyb20gJy4vcG9wLWVudGl0eS1maWVsZC1wcmV2aWV3L3BvcC1lbnRpdHktZmllbGQtcHJldmlldy5jb21wb25lbnQnO1xuaW1wb3J0IHsgUG9wUm91dGVIaXN0b3J5UmVzb2x2ZXIgfSBmcm9tICcuLi8uLi8uLi9zZXJ2aWNlcy9wb3Atcm91dGUtaGlzdG9yeS5yZXNvbHZlcic7XG5pbXBvcnQgeyBQb3BFbnRpdHlVdGlsRmllbGRTZXJ2aWNlIH0gZnJvbSAnLi4vc2VydmljZXMvcG9wLWVudGl0eS11dGlsLWZpZWxkLnNlcnZpY2UnO1xuXG5cbkBDb21wb25lbnQoIHtcbiAgc2VsZWN0b3I6ICdsaWItZmllbGQtZWRpdG9yJyxcbiAgdGVtcGxhdGU6IGBcbiAgICA8bGliLXBvcC1lbnRpdHktdGFiICpuZ0lmPVwiZG9tLnN0YXRlLmxvYWRlZFwiIFt0YWJdPXVpLnRhYiBbY29yZV09XCJjb3JlXCI+PC9saWItcG9wLWVudGl0eS10YWI+YCxcbiAgc3R5bGVVcmxzOiBbICcuL3BvcC1lbnRpdHktZmllbGQtZWRpdG9yLnNjc3MnIF0sXG4gIHByb3ZpZGVyczogWyBQb3BGaWVsZEVkaXRvclNlcnZpY2UgXSxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbn0gKVxuZXhwb3J0IGNsYXNzIFBvcEVudGl0eUZpZWxkRWRpdG9yQ29tcG9uZW50IGV4dGVuZHMgUG9wRXh0ZW5kQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xuXG4gIHB1YmxpYyBuYW1lID0gJ1BvcEVudGl0eUZpZWxkRWRpdG9yQ29tcG9uZW50JztcblxuXG4gIHByb3RlY3RlZCBzcnYgPSB7XG4gICAgZmllbGQ6IDxQb3BGaWVsZEVkaXRvclNlcnZpY2U+dW5kZWZpbmVkLFxuICAgIHV0aWxGaWVsZDogPFBvcEVudGl0eVV0aWxGaWVsZFNlcnZpY2U+dW5kZWZpbmVkLFxuICAgIGhpc3Rvcnk6IDxQb3BSb3V0ZUhpc3RvcnlSZXNvbHZlcj5TZXJ2aWNlSW5qZWN0b3IuZ2V0KCBQb3BSb3V0ZUhpc3RvcnlSZXNvbHZlciApLFxuICAgIHRhYjogPFBvcFRhYk1lbnVTZXJ2aWNlPnVuZGVmaW5lZCxcbiAgfTtcblxuXG4gIC8qKlxuICAgKiBAcGFyYW0gZWxcbiAgICogQHBhcmFtIF9kb21SZXBvXG4gICAqIEBwYXJhbSBfZmllbGRSZXBvXG4gICAqIEBwYXJhbSBfdGFiUmVwb1xuICAgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIGVsOiBFbGVtZW50UmVmLFxuICAgIHByb3RlY3RlZCBfZG9tUmVwbzogUG9wRG9tU2VydmljZSxcbiAgICBwcm90ZWN0ZWQgX2ZpZWxkUmVwbzogUG9wRmllbGRFZGl0b3JTZXJ2aWNlLFxuICAgIHByb3RlY3RlZCBfdXRpbEZpZWxkUmVwbzogUG9wRW50aXR5VXRpbEZpZWxkU2VydmljZSxcbiAgICBwcm90ZWN0ZWQgX3RhYlJlcG86IFBvcFRhYk1lbnVTZXJ2aWNlLFxuICApe1xuICAgIHN1cGVyKCk7XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIHNob3VsZCB0cmFuc2Zvcm0gYW5kIHZhbGlkYXRlIHRoZSBkYXRhLiBUaGUgdmlldyBzaG91bGQgdHJ5IHRvIG9ubHkgdXNlIGRhdGEgdGhhdCBpcyBzdG9yZWQgb24gdWkgc28gdGhhdCBpdCBpcyBub3QgZGVwZW5kZW50IG9uIHRoZSBzdHJ1Y3R1cmUgb2YgZGF0YSB0aGF0IGNvbWVzIGZyb20gb3RoZXIgc291cmNlcy4gVGhlIHVpIHNob3VsZCBiZSB0aGUgc291cmNlIG9mIHRydXRoIGhlcmUuXG4gICAgICovXG4gICAgdGhpcy5kb20uY29uZmlndXJlID0gKCk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCAoIHJlc29sdmUgKSA9PiB7XG4gICAgICAgIGlmKCAhKCBJc09iamVjdCggdGhpcy5jb3JlLCB0cnVlICkgKSApIHRoaXMuY29yZSA9IHRoaXMuc3J2LnRhYi5nZXRDb3JlKCk7XG4gICAgICAgIGNvbnN0IGZpZWxkZ3JvdXAgPSBTdG9yYWdlR2V0dGVyKCB0aGlzLmNvcmUsIFsgJ2VudGl0eScsICdmaWVsZGdyb3VwJywgJ25hbWUnIF0gKTtcbiAgICAgICAgaWYoIGZpZWxkZ3JvdXAgKXtcbiAgICAgICAgICB0aGlzLnVpLnRhYiA9IG5ldyBUYWJDb25maWcoIHtcbiAgICAgICAgICAgIGlkOiAnZ2VuZXJhbCcsXG4gICAgICAgICAgICBwb3NpdGlvbnM6IHtcbiAgICAgICAgICAgICAgMToge1xuICAgICAgICAgICAgICAgIGhlYWRlcjogJ0RldGFpbHMnLFxuICAgICAgICAgICAgICAgIGZsZXg6IDEsXG4gICAgICAgICAgICAgICAgY29tcG9uZW50czogW1xuICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBQb3BFbnRpdHlGaWVsZERldGFpbHNDb21wb25lbnQsXG4gICAgICAgICAgICAgICAgICAgIGlucHV0czoge1xuICAgICAgICAgICAgICAgICAgICAgIGlkOiAxXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgMjoge1xuICAgICAgICAgICAgICAgIGZsZXg6IDIsXG4gICAgICAgICAgICAgICAgY29tcG9uZW50czogW1xuICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBQb3BFbnRpdHlGaWVsZFNldHRpbmdzQ29tcG9uZW50LFxuICAgICAgICAgICAgICAgICAgICBpbnB1dHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICBpZDogMlxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIDM6IHtcbiAgICAgICAgICAgICAgICBmbGV4OiAxLFxuICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IFtcbiAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogUG9wRW50aXR5RmllbGRQcmV2aWV3Q29tcG9uZW50LFxuICAgICAgICAgICAgICAgICAgICBpbnB1dHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICBpZDogM1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgd3JhcDogdHJ1ZSxcbiAgICAgICAgICAgIGNvbHVtbldyYXA6IHRydWUsXG4gICAgICAgICAgICBvdmVyaGVhZDogMCxcbiAgICAgICAgICAgIG9uTG9hZDogKCBjb25maWc6IENvcmVDb25maWcsIHRhYjogVGFiQ29uZmlnICkgPT4ge1xuICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnY29uZmlnJywgY29uZmlnKTtcbiAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ3RhYicsIHRhYik7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBvbkV2ZW50OiAoIGNvcmU6IENvcmVDb25maWcsIGV2ZW50OiBQb3BCYXNlRXZlbnRJbnRlcmZhY2UgKSA9PiB7XG4gICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdldmVudCcsIGV2ZW50KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSApO1xuICAgICAgICAgIHRoaXMuc3J2LmZpZWxkLnJlZ2lzdGVyKCB0aGlzLmNvcmUsIHRoaXMuZG9tLnJlcG8gKS50aGVuKCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNydi51dGlsRmllbGQuY2xlYXJDdXN0b21GaWVsZENhY2hlKCArdGhpcy5jb3JlLmVudGl0eS5pZCApO1xuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoIHRydWUgKTtcbiAgICAgICAgICB9ICk7XG5cbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSB3aW5kb3cubG9jYXRpb24ub3JpZ2luICsgJy8nICsgUG9wSHJlZjtcbiAgICAgICAgfVxuICAgICAgfSApO1xuICAgIH07XG4gIH1cblxuXG4gIC8qKlxuICAgKiBUaGlzIGNvbXBvbmVudCBzaG91bGQgaGF2ZSBhIHNwZWNpZmljIHB1cnBvc2VcbiAgICovXG4gIG5nT25Jbml0KCl7XG4gICAgc3VwZXIubmdPbkluaXQoKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFRoZSBkb20gZGVzdHJveSBmdW5jdGlvbiBtYW5hZ2VzIGFsbCB0aGUgY2xlYW4gdXAgdGhhdCBpcyBuZWNlc3NhcnkgaWYgc3Vic2NyaXB0aW9ucywgdGltZW91dHMsIGV0YyBhcmUgc3RvcmVkIHByb3Blcmx5XG4gICAqL1xuICBuZ09uRGVzdHJveSgpe1xuICAgIHN1cGVyLm5nT25EZXN0cm95KCk7XG4gIH1cblxufVxuIl19