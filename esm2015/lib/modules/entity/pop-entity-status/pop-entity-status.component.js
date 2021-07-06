import { __awaiter } from "tslib";
import { PopDatetimeService } from './../../../services/pop-datetime.service';
import { Component } from '@angular/core';
import { PopExtendComponent } from '../../../pop-extend.component';
import { SwitchConfig } from '../../base/pop-field-item/pop-switch/switch-config.model';
import { ServiceInjector } from '../../../pop-common.model';
import { PopEntityEventService } from '../services/pop-entity-event.service';
import { PopTabMenuService } from '../../base/pop-tab-menu/pop-tab-menu.service';
import { PopDomService } from '../../../services/pop-dom.service';
import { ButtonConfig } from '../../base/pop-field-item/pop-button/button-config.model';
import { IsValidChangeEvent } from '../pop-entity-utility';
import { GetHttpErrorMsg } from '../../../pop-common-utility';
export class PopEntityStatusComponent extends PopExtendComponent {
    constructor(_domRepo, _tabRepo) {
        super();
        this._domRepo = _domRepo;
        this._tabRepo = _tabRepo;
        this.name = 'PopEntityStatusComponent';
        this.ui = {
            archive: undefined,
            valueButton: undefined,
            createdDate: undefined,
            showCopied: false
        };
        this.srv = {
            events: ServiceInjector.get(PopEntityEventService),
            tab: undefined,
            date: ServiceInjector.get(PopDatetimeService)
        };
        this.dom.configure = () => {
            // this component set the outer height boundary of this view
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                // Ensure that a CoreConfig exists for this component
                this.dom.state.archived = this.core.entity.archived ? true : false;
                this._setDate(this.core.entity.created_at);
                this._setArchiveSwitch();
                this.srv.tab.showAsLoading(false);
                this.id = this.core.params.internal_name;
                return resolve(true);
            }));
        };
    }
    ngOnInit() {
        super.ngOnInit();
    }
    onLabelCopy() {
        const nav = navigator;
        const body = String(this.core.entity.id).slice();
        nav.clipboard.writeText(body);
        this.ui.showCopied = true;
        setTimeout(() => {
            this.ui.showCopied = false;
        }, 3000);
    }
    onArchiveChange(event) {
        if (IsValidChangeEvent(this.core, event)) {
            this._handleArchive(!event.config.control.value);
        }
    }
    ngOnDestroy() {
        super.ngOnDestroy();
    }
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    _setDate(date) {
        this.ui.createdDate = this.srv.date.transform(date, 'date');
    }
    _setArchiveSwitch() {
        this.ui.valueButton = new ButtonConfig({
            icon: 'file_copy',
            value: `ID ${this.core.entity.id}`,
            size: 20,
            radius: 5,
            text: 12,
            bubble: true,
            event: 'click',
            type: 'mat-flat-button'
        });
        this.ui.archive = new SwitchConfig({
            name: 'archived',
            bubble: true,
            label: this.core.entity.archived ? 'ACTIVE' : 'ACTIVE',
            labelPosition: 'before',
            value: !this.core.entity.archived ? true : false,
            patch: {
                duration: 0,
                field: '',
                path: '',
            },
        });
    }
    _handleArchive(archive) {
        console.log('_handleArchive', archive);
        this.dom.state.archived = archive;
        this.ui.archive.label = archive ? 'ACTIVE' : 'ACTIVE';
        this.core.entity.archived = archive;
        this.ui.archive.control.disable();
        this.srv.tab.showAsLoading(true);
        this.dom.setSubscriber('archive-entity', this.core.repo.archiveEntity(this.core.params.entityId, archive).subscribe(() => {
            this.srv.events.sendEvent({
                source: this.name,
                method: 'archive',
                type: 'entity',
                name: this.core.params.name,
                internal_name: this.core.params.internal_name,
                id: this.core.params.entityId,
                data: archive
            });
            this.srv.tab.showAsLoading(false);
            this.ui.archive.control.enable();
            this.srv.tab.resetTab(true);
            // this.srv.tab.refreshEntity( null, this.dom.repo, {}, `${this.name}:setArchived` ).then( () => PopTemplate.clear() );
        }, err => {
            this.dom.error.code = err.error.code;
            this.dom.error.message = GetHttpErrorMsg(err);
            this.ui.archive.control.enable();
            this.srv.tab.showAsLoading(false);
        }));
    }
}
PopEntityStatusComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-entity-status',
                template: "<div class=\"pop-entity-status-container import-field-item-container\">\n  <div>\n    <div class=\"copied-signal site-shadow-04\" *ngIf=\"ui.showCopied\">Copied!</div>\n    <lib-pop-button\n      *ngIf=\"ui.valueButton; let config;\"\n      class=\"pop-entity-status-label\"\n      (click)=\"onLabelCopy()\"\n      [config]=\"config\">\n    </lib-pop-button>\n  </div>\n  <div class=\"pop-entity-archive-container\" [ngClass]=\"dom.state.archived ? 'pop-entity-status-archived' :'pop-entity-status-active'\">\n    <lib-pop-switch\n      *ngIf=\"ui.archive; let config\"\n      [config]=\"config\"\n      (events)=\"onArchiveChange($event)\">\n    </lib-pop-switch>\n  </div>\n</div>\n<div class=\"pop-entity-status-row mat-caption\">\n  <span>Created</span> <span>{{ui.createdDate}}</span>\n</div>\n<lib-pop-errors *ngIf=\"dom.error?.message\" [error]=\"dom.error\"></lib-pop-errors>\n",
                styles: [".pop-entity-status-container{position:relative;display:flex;flex-direction:row;align-items:center;justify-content:space-between;box-sizing:border-box;-moz-box-sizing:border-box;margin:0!important;font-size:12px}.pop-entity-status-container .pop-entity-archive-container{display:flex;flex-direction:row;align-items:center;justify-content:stretch;color:#fff!important;box-shadow:none!important;text-transform:none!important;padding-left:8px;padding-right:8px;border-radius:5px;margin:0!important;box-sizing:border-box}.pop-entity-status-container ::ng-deep .pop-switch-container{min-height:15px!important;max-height:20px}.pop-entity-status-container ::ng-deep .import-field-item-container{margin:0!important}.pop-entity-status-container ::ng-deep .pop-entity-status-active .mat-slide-toggle-thumb{background-color:var(--background-base)!important}.pop-entity-status-container ::ng-deep .pop-entity-status-active .mat-slide-toggle-bar{background-color:var(--background-selected-disabled-button)!important}.pop-entity-status-container ::ng-deep .mat-icon{position:relative;top:-1px;color:var(--background-base)}.pop-entity-status-container ::ng-deep .mat-slide-toggle{display:flex!important;flex-grow:1!important;width:100%;box-sizing:border-box}:host ::ng-deep .pop-entity-archive-container h4{font-size:12px}.pop-entity-status-label{min-width:100px!important;display:flex;flex-direction:row;align-items:center}.pop-entity-status-label ::ng-deep button{background-color:var(--background-code);color:var(--background-base);min-width:100px!important}.pop-entity-status-label ::ng-deep button span{position:relative;top:-1px}.pop-entity-status-row{position:relative;display:flex;flex-direction:row;align-items:center;justify-content:space-between;box-sizing:border-box;-moz-box-sizing:border-box;margin:0;font-size:12px;color:var(--foreground-base);max-width:var(--field-max-width)}.pop-entity-status-active{background:var(--valid)!important}.pop-entity-status-archived{background:var(--background-border)!important}lib-pop-switch ::ng-deep span.mat-body{font-size:12px;line-height:12px;color:var(--background-base)}lib-pop-switch ::ng-deep .mat-slide-toggle-bar{height:10px;width:30px}lib-pop-switch ::ng-deep .mat-slide-toggle-bar .mat-slide-toggle-thumb{height:16px;width:16px}div.copied-signal{border-radius:var(--radius-xs);position:absolute;left:0;top:0;z-index:1;font-size:12px;min-height:var(--gap-sm);padding:3px var(--gap-xs) 2px var(--gap-xs);color:var(--foreground-base);background-color:var(--background-base);border:1px solid var(--foreground-disabled)}"]
            },] }
];
PopEntityStatusComponent.ctorParameters = () => [
    { type: PopDomService },
    { type: PopTabMenuService }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS1zdGF0dXMuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvZW50aXR5L3BvcC1lbnRpdHktc3RhdHVzL3BvcC1lbnRpdHktc3RhdHVzLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sMENBQTBDLENBQUM7QUFDOUUsT0FBTyxFQUFFLFNBQVMsRUFBcUIsTUFBTSxlQUFlLENBQUM7QUFDN0QsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDbkUsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDBEQUEwRCxDQUFDO0FBQ3hGLE9BQU8sRUFBaUQsZUFBZSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDM0csT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFDN0UsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sOENBQThDLENBQUM7QUFDakYsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBQ2xFLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwwREFBMEQsQ0FBQztBQUN4RixPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUMzRCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFPOUQsTUFBTSxPQUFPLHdCQUF5QixTQUFRLGtCQUFrQjtJQXFCOUQsWUFDWSxRQUF1QixFQUN2QixRQUEyQjtRQUVyQyxLQUFLLEVBQUUsQ0FBQztRQUhFLGFBQVEsR0FBUixRQUFRLENBQWU7UUFDdkIsYUFBUSxHQUFSLFFBQVEsQ0FBbUI7UUF0QnZDLFNBQUksR0FBRywwQkFBMEIsQ0FBQztRQUUzQixPQUFFLEdBQUc7WUFDVixPQUFPLEVBQWdC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YSxDQUFFLEtBQUssQ0FBRSxDQUFDO1FBQ3RDLENBQUMsQ0FBRSxDQUFFLENBQUM7SUFFUixDQUFDOzs7WUFsSkYsU0FBUyxTQUFFO2dCQUNWLFFBQVEsRUFBRSx1QkFBdUI7Z0JBQ2pDLGk0QkFBaUQ7O2FBRWxEOzs7WUFUUSxhQUFhO1lBRGIsaUJBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUG9wRGF0ZXRpbWVTZXJ2aWNlIH0gZnJvbSAnLi8uLi8uLi8uLi9zZXJ2aWNlcy9wb3AtZGF0ZXRpbWUuc2VydmljZSc7XG5pbXBvcnQgeyBDb21wb25lbnQsIE9uSW5pdCwgT25EZXN0cm95IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBQb3BFeHRlbmRDb21wb25lbnQgfSBmcm9tICcuLi8uLi8uLi9wb3AtZXh0ZW5kLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBTd2l0Y2hDb25maWcgfSBmcm9tICcuLi8uLi9iYXNlL3BvcC1maWVsZC1pdGVtL3BvcC1zd2l0Y2gvc3dpdGNoLWNvbmZpZy5tb2RlbCc7XG5pbXBvcnQgeyBQb3BCYXNlRXZlbnRJbnRlcmZhY2UsIFBvcEVudGl0eSwgUG9wVGVtcGxhdGUsIFNlcnZpY2VJbmplY3RvciB9IGZyb20gJy4uLy4uLy4uL3BvcC1jb21tb24ubW9kZWwnO1xuaW1wb3J0IHsgUG9wRW50aXR5RXZlbnRTZXJ2aWNlIH0gZnJvbSAnLi4vc2VydmljZXMvcG9wLWVudGl0eS1ldmVudC5zZXJ2aWNlJztcbmltcG9ydCB7IFBvcFRhYk1lbnVTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vYmFzZS9wb3AtdGFiLW1lbnUvcG9wLXRhYi1tZW51LnNlcnZpY2UnO1xuaW1wb3J0IHsgUG9wRG9tU2VydmljZSB9IGZyb20gJy4uLy4uLy4uL3NlcnZpY2VzL3BvcC1kb20uc2VydmljZSc7XG5pbXBvcnQgeyBCdXR0b25Db25maWcgfSBmcm9tICcuLi8uLi9iYXNlL3BvcC1maWVsZC1pdGVtL3BvcC1idXR0b24vYnV0dG9uLWNvbmZpZy5tb2RlbCc7XG5pbXBvcnQgeyBJc1ZhbGlkQ2hhbmdlRXZlbnQgfSBmcm9tICcuLi9wb3AtZW50aXR5LXV0aWxpdHknO1xuaW1wb3J0IHsgR2V0SHR0cEVycm9yTXNnIH0gZnJvbSAnLi4vLi4vLi4vcG9wLWNvbW1vbi11dGlsaXR5JztcblxuQENvbXBvbmVudCgge1xuICBzZWxlY3RvcjogJ2xpYi1wb3AtZW50aXR5LXN0YXR1cycsXG4gIHRlbXBsYXRlVXJsOiAnLi9wb3AtZW50aXR5LXN0YXR1cy5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWyAnLi9wb3AtZW50aXR5LXN0YXR1cy5jb21wb25lbnQuc2NzcycgXSxcbn0gKVxuZXhwb3J0IGNsYXNzIFBvcEVudGl0eVN0YXR1c0NvbXBvbmVudCBleHRlbmRzIFBvcEV4dGVuZENvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcbiAgbmFtZSA9ICdQb3BFbnRpdHlTdGF0dXNDb21wb25lbnQnO1xuXG4gIHB1YmxpYyB1aSA9IHtcbiAgICBhcmNoaXZlOiA8U3dpdGNoQ29uZmlnPnVuZGVmaW5lZCxcbiAgICB2YWx1ZUJ1dHRvbjogPEJ1dHRvbkNvbmZpZz51bmRlZmluZWQsXG4gICAgY3JlYXRlZERhdGU6IDxzdHJpbmc+dW5kZWZpbmVkLFxuICAgIHNob3dDb3BpZWQ6IGZhbHNlXG4gIH07XG5cbiAgcHJvdGVjdGVkIHNydjoge1xuICAgIGV2ZW50czogUG9wRW50aXR5RXZlbnRTZXJ2aWNlLFxuICAgIHRhYjogUG9wVGFiTWVudVNlcnZpY2UsXG4gICAgZGF0ZTogUG9wRGF0ZXRpbWVTZXJ2aWNlLFxuICB9ID0ge1xuICAgIGV2ZW50czogU2VydmljZUluamVjdG9yLmdldCggUG9wRW50aXR5RXZlbnRTZXJ2aWNlICksXG4gICAgdGFiOiA8UG9wVGFiTWVudVNlcnZpY2U+dW5kZWZpbmVkLFxuICAgIGRhdGU6IFNlcnZpY2VJbmplY3Rvci5nZXQoIFBvcERhdGV0aW1lU2VydmljZSApXG4gIH07XG5cblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcm90ZWN0ZWQgX2RvbVJlcG86IFBvcERvbVNlcnZpY2UsXG4gICAgcHJvdGVjdGVkIF90YWJSZXBvOiBQb3BUYWJNZW51U2VydmljZSxcbiAgKXtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuZG9tLmNvbmZpZ3VyZSA9ICgpOiBQcm9taXNlPGJvb2xlYW4+ID0+IHtcblxuICAgICAgLy8gdGhpcyBjb21wb25lbnQgc2V0IHRoZSBvdXRlciBoZWlnaHQgYm91bmRhcnkgb2YgdGhpcyB2aWV3XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoIGFzeW5jKCByZXNvbHZlICkgPT4ge1xuICAgICAgICAvLyBFbnN1cmUgdGhhdCBhIENvcmVDb25maWcgZXhpc3RzIGZvciB0aGlzIGNvbXBvbmVudFxuICAgICAgICB0aGlzLmRvbS5zdGF0ZS5hcmNoaXZlZCA9IHRoaXMuY29yZS5lbnRpdHkuYXJjaGl2ZWQgPyB0cnVlIDogZmFsc2U7XG4gICAgICAgIHRoaXMuX3NldERhdGUoIHRoaXMuY29yZS5lbnRpdHkuY3JlYXRlZF9hdCApO1xuICAgICAgICB0aGlzLl9zZXRBcmNoaXZlU3dpdGNoKCk7XG4gICAgICAgIHRoaXMuc3J2LnRhYi5zaG93QXNMb2FkaW5nKCBmYWxzZSApO1xuXG4gICAgICAgIHRoaXMuaWQgPSB0aGlzLmNvcmUucGFyYW1zLmludGVybmFsX25hbWU7XG4gICAgICAgIHJldHVybiByZXNvbHZlKCB0cnVlICk7XG5cbiAgICAgIH0gKTtcbiAgICB9O1xuICB9XG5cblxuICBuZ09uSW5pdCgpOiB2b2lke1xuICAgIHN1cGVyLm5nT25Jbml0KCk7XG4gIH1cblxuXG4gIG9uTGFiZWxDb3B5KCk6IHZvaWR7XG4gICAgY29uc3QgbmF2ID0gPGFueT5uYXZpZ2F0b3I7XG4gICAgY29uc3QgYm9keSA9IFN0cmluZyggdGhpcy5jb3JlLmVudGl0eS5pZCApLnNsaWNlKCk7XG4gICAgbmF2LmNsaXBib2FyZC53cml0ZVRleHQoIGJvZHkgKTtcblxuICAgIHRoaXMudWkuc2hvd0NvcGllZCA9IHRydWU7XG5cbiAgICBzZXRUaW1lb3V0KCgpPT57XG4gICAgICB0aGlzLnVpLnNob3dDb3BpZWQgPSBmYWxzZTtcbiAgICB9LDMwMDApO1xuICB9XG5cblxuICBvbkFyY2hpdmVDaGFuZ2UoIGV2ZW50OiBQb3BCYXNlRXZlbnRJbnRlcmZhY2UgKXtcbiAgICBpZiggSXNWYWxpZENoYW5nZUV2ZW50KCB0aGlzLmNvcmUsIGV2ZW50ICkgKXtcbiAgICAgIHRoaXMuX2hhbmRsZUFyY2hpdmUoICFldmVudC5jb25maWcuY29udHJvbC52YWx1ZSApO1xuICAgIH1cbiAgfVxuXG5cbiAgbmdPbkRlc3Ryb3koKTogdm9pZHtcbiAgICBzdXBlci5uZ09uRGVzdHJveSgpO1xuICB9XG5cbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBVbmRlciBUaGUgSG9vZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIFByaXZhdGUgTWV0aG9kICkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cblxuICBwcml2YXRlIF9zZXREYXRlKCBkYXRlICl7XG4gICAgdGhpcy51aS5jcmVhdGVkRGF0ZSA9IHRoaXMuc3J2LmRhdGUudHJhbnNmb3JtKCBkYXRlLCAnZGF0ZScgKTtcbiAgfVxuXG5cbiAgcHJpdmF0ZSBfc2V0QXJjaGl2ZVN3aXRjaCgpe1xuICAgIHRoaXMudWkudmFsdWVCdXR0b24gPSBuZXcgQnV0dG9uQ29uZmlnKCB7XG4gICAgICBpY29uOiAnZmlsZV9jb3B5JyxcbiAgICAgIHZhbHVlOiBgSUQgJHsgdGhpcy5jb3JlLmVudGl0eS5pZCB9YCxcbiAgICAgIHNpemU6IDIwLFxuICAgICAgcmFkaXVzOiA1LFxuICAgICAgdGV4dDogMTIsXG4gICAgICBidWJibGU6IHRydWUsXG4gICAgICBldmVudDogJ2NsaWNrJyxcbiAgICAgIHR5cGU6ICdtYXQtZmxhdC1idXR0b24nXG4gICAgfSApO1xuICAgIHRoaXMudWkuYXJjaGl2ZSA9IG5ldyBTd2l0Y2hDb25maWcoIHtcbiAgICAgIG5hbWU6ICdhcmNoaXZlZCcsXG4gICAgICBidWJibGU6IHRydWUsXG4gICAgICBsYWJlbDogdGhpcy5jb3JlLmVudGl0eS5hcmNoaXZlZCA/ICdBQ1RJVkUnIDogJ0FDVElWRScsXG4gICAgICBsYWJlbFBvc2l0aW9uOiAnYmVmb3JlJyxcbiAgICAgIHZhbHVlOiAhdGhpcy5jb3JlLmVudGl0eS5hcmNoaXZlZCA/IHRydWUgOiBmYWxzZSxcbiAgICAgIHBhdGNoOiB7XG4gICAgICAgIGR1cmF0aW9uOiAwLFxuICAgICAgICBmaWVsZDogJycsXG4gICAgICAgIHBhdGg6ICcnLFxuICAgICAgfSxcbiAgICB9ICk7XG4gIH1cblxuXG4gIHByaXZhdGUgX2hhbmRsZUFyY2hpdmUoIGFyY2hpdmU6IGJvb2xlYW4gKXtcbiAgICBjb25zb2xlLmxvZygnX2hhbmRsZUFyY2hpdmUnLCBhcmNoaXZlKTtcbiAgICB0aGlzLmRvbS5zdGF0ZS5hcmNoaXZlZCA9IGFyY2hpdmU7XG4gICAgdGhpcy51aS5hcmNoaXZlLmxhYmVsID0gYXJjaGl2ZSA/ICdBQ1RJVkUnIDogJ0FDVElWRSc7XG4gICAgdGhpcy5jb3JlLmVudGl0eS5hcmNoaXZlZCA9IGFyY2hpdmU7XG4gICAgdGhpcy51aS5hcmNoaXZlLmNvbnRyb2wuZGlzYWJsZSgpO1xuICAgIHRoaXMuc3J2LnRhYi5zaG93QXNMb2FkaW5nKCB0cnVlICk7XG4gICAgdGhpcy5kb20uc2V0U3Vic2NyaWJlciggJ2FyY2hpdmUtZW50aXR5JywgdGhpcy5jb3JlLnJlcG8uYXJjaGl2ZUVudGl0eSggdGhpcy5jb3JlLnBhcmFtcy5lbnRpdHlJZCwgYXJjaGl2ZSApLnN1YnNjcmliZSggKCkgPT4ge1xuICAgICAgdGhpcy5zcnYuZXZlbnRzLnNlbmRFdmVudCgge1xuICAgICAgICBzb3VyY2U6IHRoaXMubmFtZSxcbiAgICAgICAgbWV0aG9kOiAnYXJjaGl2ZScsXG4gICAgICAgIHR5cGU6ICdlbnRpdHknLFxuICAgICAgICBuYW1lOiB0aGlzLmNvcmUucGFyYW1zLm5hbWUsXG4gICAgICAgIGludGVybmFsX25hbWU6IHRoaXMuY29yZS5wYXJhbXMuaW50ZXJuYWxfbmFtZSxcbiAgICAgICAgaWQ6IHRoaXMuY29yZS5wYXJhbXMuZW50aXR5SWQsXG4gICAgICAgIGRhdGE6IGFyY2hpdmVcbiAgICAgIH0gKTtcbiAgICAgIHRoaXMuc3J2LnRhYi5zaG93QXNMb2FkaW5nKCBmYWxzZSApO1xuICAgICAgdGhpcy51aS5hcmNoaXZlLmNvbnRyb2wuZW5hYmxlKCk7XG4gICAgICB0aGlzLnNydi50YWIucmVzZXRUYWIodHJ1ZSk7XG4gICAgICAvLyB0aGlzLnNydi50YWIucmVmcmVzaEVudGl0eSggbnVsbCwgdGhpcy5kb20ucmVwbywge30sIGAke3RoaXMubmFtZX06c2V0QXJjaGl2ZWRgICkudGhlbiggKCkgPT4gUG9wVGVtcGxhdGUuY2xlYXIoKSApO1xuXG4gICAgfSwgZXJyID0+IHtcbiAgICAgIHRoaXMuZG9tLmVycm9yLmNvZGUgPSBlcnIuZXJyb3IuY29kZTtcbiAgICAgIHRoaXMuZG9tLmVycm9yLm1lc3NhZ2UgPSBHZXRIdHRwRXJyb3JNc2coZXJyKTtcbiAgICAgIHRoaXMudWkuYXJjaGl2ZS5jb250cm9sLmVuYWJsZSgpO1xuICAgICAgdGhpcy5zcnYudGFiLnNob3dBc0xvYWRpbmcoIGZhbHNlICk7XG4gICAgfSApICk7XG5cbiAgfVxufVxuIl19