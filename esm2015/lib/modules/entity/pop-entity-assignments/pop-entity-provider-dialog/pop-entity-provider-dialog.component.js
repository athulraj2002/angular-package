import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PopBaseService } from '../../../../services/pop-base.service';
import { PopEntityService } from '../../services/pop-entity.service';
import { PopEntityEventService } from '../../services/pop-entity-event.service';
import { PopEntityUtilPortalService } from '../../services/pop-entity-util-portal.service';
import { ServiceInjector } from '../../../../pop-common.model';
export class PopEntityProviderDialogComponent {
    constructor(data, entityUtilRepo, entityPortalRepo, baseRepo, dialogRepo, dialog) {
        this.entityUtilRepo = entityUtilRepo;
        this.entityPortalRepo = entityPortalRepo;
        this.baseRepo = baseRepo;
        this.dialogRepo = dialogRepo;
        this.dialog = dialog;
        this.state = {
            blockModal: false,
            assignmentChange: false,
            changed: false
        };
        this.subscriber = {
            crud: undefined,
            dialog: undefined,
        };
        this.display = data.display;
        this.config = data.config;
        this.table = data.table;
        this.resource = data.resource;
    }
    ngOnInit() {
        if (!this.display)
            this.display = this.getDisplay();
        this.subscriber.crud = ServiceInjector.get(PopEntityEventService).events.subscribe((event) => this.crudEventHandler(event));
        this.subscriber.dialog = this.dialog.beforeClosed().subscribe(_ => {
            this.dialog.close(this.state.changed);
        });
    }
    getDisplay() {
        const entityName = this.config.entity.display_name ? this.config.entity.display_name : this.config.entity.name;
        const resourceType = this.resource.entity ? this.resource.entity : 'Entity';
        const resourceName = this.resource.name ? this.resource.name : 'Resource';
        return `${entityName} - (${resourceName} - ${resourceType} ) - Provider List`;
    }
    crudEventHandler(event) {
        console.log('crudEventHandler', event);
        if (event.method === 'create' || event.method === 'delete') {
            this.state.changed = true;
        }
        else {
            if (event.type === 'entity') {
                if (event.name === 'archive') {
                    this.state.changed = true;
                }
            }
            else if (event.type === 'field' && event.name === 'patch') {
                const patch = {};
                patch[event.config.column] = event.config.control.value;
                const signature = event.config.metadata;
                const signatureMatches = this.table.matData.data.filter(function (row, i) {
                    return ((row['internal_name'] === signature.internal_name && +row['id'] === +signature.id));
                });
                if (Array.isArray(signatureMatches) && signatureMatches.length) {
                    signatureMatches.map((row) => {
                        Object.keys(patch).map((column) => {
                            if (column in row) {
                                row[column] = patch[column];
                                this.state.changed = true;
                            }
                        });
                    });
                }
            }
            else if (event.type === 'sidebyside' && event.name === 'patch') {
                const signature = Object.assign({}, event.config.metadata);
                const signatureMatches = this.table.matData.data.filter(function (row, i) {
                    return ((row['internal_name'] === signature.internal_name && +row['id'] === +signature.id));
                });
                if (Array.isArray(signatureMatches) && signatureMatches.length) {
                    this.state.changed = true;
                    this.state.assignmentChange = true;
                }
            }
        }
    }
    eventHandler(event) {
        if (event.type === 'table') {
            switch (event.data.link) {
                case 'provider':
                    this.viewEntityPortal(event.data.row.internal_name, +event.data.row.id);
                    break;
                default:
                    break;
            }
        }
    }
    viewEntityPortal(internal_name, id) {
        // placeholder
        this.entityPortalRepo.view(internal_name, id);
    }
    cancel() {
        this.dialog.close(this.state.changed);
    }
    ngOnDestroy() {
        Object.keys(this.subscriber).map((name) => {
            if (this.subscriber[name]) {
                this.subscriber[name].unsubscribe();
            }
        });
    }
}
PopEntityProviderDialogComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-entity-provider-dialog',
                template: "<h2 *ngIf=\"display\">{{display}}</h2>\n<lib-pop-table *ngIf=\"table\" (events)=\"eventHandler($event);\" [config]=\"table\"></lib-pop-table>\n<div class=\"buttons\">\n  <div class=\"cancel\">\n    <button mat-raised-button (click)=\"cancel()\">Close</button>\n  </div>\n</div>",
                styles: [":host{flex:1 1 100%;min-width:200px;min-height:200px}::ng-deep mat-dialog-container{position:relative}.buttons{margin:10px 0;display:flex;justify-content:space-between}.buttons .cancel{order:1;flex-grow:1;display:flex;justify-content:flex-end}"]
            },] }
];
PopEntityProviderDialogComponent.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [MAT_DIALOG_DATA,] }] },
    { type: PopEntityService },
    { type: PopEntityUtilPortalService },
    { type: PopBaseService },
    { type: MatDialog },
    { type: MatDialogRef }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS1wcm92aWRlci1kaWFsb2cuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvZW50aXR5L3BvcC1lbnRpdHktYXNzaWdubWVudHMvcG9wLWVudGl0eS1wcm92aWRlci1kaWFsb2cvcG9wLWVudGl0eS1wcm92aWRlci1kaWFsb2cuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFxQixNQUFNLGVBQWUsQ0FBQztBQUNyRSxPQUFPLEVBQUUsZUFBZSxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUNwRixPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFDdkUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFHckUsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFDaEYsT0FBTyxFQUFFLDBCQUEwQixFQUFFLE1BQU0sK0NBQStDLENBQUM7QUFDM0YsT0FBTyxFQUE2QyxlQUFlLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQWdCMUcsTUFBTSxPQUFPLGdDQUFnQztJQU8zQyxZQUMyQixJQUFzQyxFQUN2RCxjQUFnQyxFQUNoQyxnQkFBNEMsRUFDNUMsUUFBd0IsRUFDeEIsVUFBcUIsRUFDdEIsTUFBc0Q7UUFKckQsbUJBQWMsR0FBZCxjQUFjLENBQWtCO1FBQ2hDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBNEI7UUFDNUMsYUFBUSxHQUFSLFFBQVEsQ0FBZ0I7UUFDeEIsZUFBVSxHQUFWLFVBQVUsQ0FBVztRQUN0QixXQUFNLEdBQU4sTUFBTSxDQUFnRDtRQVEvRCxVQUFLLEdBQUc7WUFDTixVQUFVLEVBQUUsS0FBSztZQUNqQixnQkFBZ0Is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SSxJQUFJLENBQUMsVUFBVSxDQUFFLElBQUksQ0FBRSxFQUFFO2dCQUMzQixJQUFJLENBQUMsVUFBVSxDQUFFLElBQUksQ0FBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO2FBQ3ZDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDOzs7WUE3SEYsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSxnQ0FBZ0M7Z0JBQzFDLGlTQUEwRDs7YUFFM0Q7Ozs0Q0FTSSxNQUFNLFNBQUMsZUFBZTtZQTdCbEIsZ0JBQWdCO1lBSWhCLDBCQUEwQjtZQUwxQixjQUFjO1lBREcsU0FBUztZQUFFLFlBQVkiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEluamVjdCwgT25EZXN0cm95LCBPbkluaXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE1BVF9ESUFMT0dfREFUQSwgTWF0RGlhbG9nLCBNYXREaWFsb2dSZWYgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9kaWFsb2cnO1xuaW1wb3J0IHsgUG9wQmFzZVNlcnZpY2UgfSBmcm9tICcuLi8uLi8uLi8uLi9zZXJ2aWNlcy9wb3AtYmFzZS5zZXJ2aWNlJztcbmltcG9ydCB7IFBvcEVudGl0eVNlcnZpY2UgfSBmcm9tICcuLi8uLi9zZXJ2aWNlcy9wb3AtZW50aXR5LnNlcnZpY2UnO1xuaW1wb3J0IHsgU3Vic2NyaXB0aW9uIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBUYWJsZUNvbmZpZyB9IGZyb20gJy4uLy4uLy4uL2Jhc2UvcG9wLXRhYmxlL3BvcC10YWJsZS5tb2RlbCc7XG5pbXBvcnQgeyBQb3BFbnRpdHlFdmVudFNlcnZpY2UgfSBmcm9tICcuLi8uLi9zZXJ2aWNlcy9wb3AtZW50aXR5LWV2ZW50LnNlcnZpY2UnO1xuaW1wb3J0IHsgUG9wRW50aXR5VXRpbFBvcnRhbFNlcnZpY2UgfSBmcm9tICcuLi8uLi9zZXJ2aWNlcy9wb3AtZW50aXR5LXV0aWwtcG9ydGFsLnNlcnZpY2UnO1xuaW1wb3J0IHsgQ29yZUNvbmZpZywgRW50aXR5LCBQb3BCYXNlRXZlbnRJbnRlcmZhY2UsIFNlcnZpY2VJbmplY3RvciB9IGZyb20gJy4uLy4uLy4uLy4uL3BvcC1jb21tb24ubW9kZWwnO1xuXG5cbmV4cG9ydCBpbnRlcmZhY2UgUG9wRW50aXR5UHJvdmlkZXJEaWFsb2dJbnRlcmZhY2Uge1xuICBkaXNwbGF5Pzogc3RyaW5nO1xuICBjb25maWc6IENvcmVDb25maWc7XG4gIHRhYmxlOiBUYWJsZUNvbmZpZztcbiAgcmVzb3VyY2U6IEVudGl0eTtcbn1cblxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdsaWItcG9wLWVudGl0eS1wcm92aWRlci1kaWFsb2cnLFxuICB0ZW1wbGF0ZVVybDogJy4vcG9wLWVudGl0eS1wcm92aWRlci1kaWFsb2cuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsgJy4vcG9wLWVudGl0eS1wcm92aWRlci1kaWFsb2cuY29tcG9uZW50LnNjc3MnIF1cbn0pXG5leHBvcnQgY2xhc3MgUG9wRW50aXR5UHJvdmlkZXJEaWFsb2dDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG4gIGRpc3BsYXk6IHN0cmluZztcbiAgY29uZmlnOiBDb3JlQ29uZmlnO1xuICB0YWJsZTogVGFibGVDb25maWc7XG4gIHJlc291cmNlOiBFbnRpdHk7XG5cblxuICBjb25zdHJ1Y3RvcihcbiAgICBASW5qZWN0KE1BVF9ESUFMT0dfREFUQSkgZGF0YTogUG9wRW50aXR5UHJvdmlkZXJEaWFsb2dJbnRlcmZhY2UsXG4gICAgcHJpdmF0ZSBlbnRpdHlVdGlsUmVwbzogUG9wRW50aXR5U2VydmljZSxcbiAgICBwcml2YXRlIGVudGl0eVBvcnRhbFJlcG86IFBvcEVudGl0eVV0aWxQb3J0YWxTZXJ2aWNlLFxuICAgIHByaXZhdGUgYmFzZVJlcG86IFBvcEJhc2VTZXJ2aWNlLFxuICAgIHByaXZhdGUgZGlhbG9nUmVwbzogTWF0RGlhbG9nLFxuICAgIHB1YmxpYyBkaWFsb2c6IE1hdERpYWxvZ1JlZjxQb3BFbnRpdHlQcm92aWRlckRpYWxvZ0NvbXBvbmVudD4pe1xuICAgIHRoaXMuZGlzcGxheSA9IGRhdGEuZGlzcGxheTtcbiAgICB0aGlzLmNvbmZpZyA9IGRhdGEuY29uZmlnO1xuICAgIHRoaXMudGFibGUgPSBkYXRhLnRhYmxlO1xuICAgIHRoaXMucmVzb3VyY2UgPSBkYXRhLnJlc291cmNlO1xuICB9XG5cblxuICBzdGF0ZSA9IHtcbiAgICBibG9ja01vZGFsOiBmYWxzZSxcbiAgICBhc3NpZ25tZW50Q2hhbmdlOiBmYWxzZSxcbiAgICBjaGFuZ2VkOiBmYWxzZVxuICB9O1xuXG4gIHN1YnNjcmliZXIgPSB7XG4gICAgY3J1ZDogPFN1YnNjcmlwdGlvbj51bmRlZmluZWQsXG4gICAgZGlhbG9nOiA8U3Vic2NyaXB0aW9uPnVuZGVmaW5lZCxcbiAgfTtcblxuXG4gIG5nT25Jbml0KCl7XG4gICAgaWYoICF0aGlzLmRpc3BsYXkgKSB0aGlzLmRpc3BsYXkgPSB0aGlzLmdldERpc3BsYXkoKTtcbiAgICB0aGlzLnN1YnNjcmliZXIuY3J1ZCA9IFNlcnZpY2VJbmplY3Rvci5nZXQoUG9wRW50aXR5RXZlbnRTZXJ2aWNlKS5ldmVudHMuc3Vic2NyaWJlKChldmVudCkgPT4gdGhpcy5jcnVkRXZlbnRIYW5kbGVyKGV2ZW50KSk7XG4gICAgdGhpcy5zdWJzY3JpYmVyLmRpYWxvZyA9IHRoaXMuZGlhbG9nLmJlZm9yZUNsb3NlZCgpLnN1YnNjcmliZShfID0+IHtcbiAgICAgIHRoaXMuZGlhbG9nLmNsb3NlKHRoaXMuc3RhdGUuY2hhbmdlZCk7XG4gICAgfSk7XG4gIH1cblxuXG4gIGdldERpc3BsYXkoKXtcbiAgICBjb25zdCBlbnRpdHlOYW1lID0gdGhpcy5jb25maWcuZW50aXR5LmRpc3BsYXlfbmFtZSA/IHRoaXMuY29uZmlnLmVudGl0eS5kaXNwbGF5X25hbWUgOiB0aGlzLmNvbmZpZy5lbnRpdHkubmFtZTtcbiAgICBjb25zdCByZXNvdXJjZVR5cGUgPSB0aGlzLnJlc291cmNlLmVudGl0eSA/IHRoaXMucmVzb3VyY2UuZW50aXR5IDogJ0VudGl0eSc7XG4gICAgY29uc3QgcmVzb3VyY2VOYW1lID0gdGhpcy5yZXNvdXJjZS5uYW1lID8gdGhpcy5yZXNvdXJjZS5uYW1lIDogJ1Jlc291cmNlJztcbiAgICByZXR1cm4gYCR7ZW50aXR5TmFtZX0gLSAoJHtyZXNvdXJjZU5hbWV9IC0gJHtyZXNvdXJjZVR5cGV9ICkgLSBQcm92aWRlciBMaXN0YDtcbiAgfVxuXG5cbiAgY3J1ZEV2ZW50SGFuZGxlcihldmVudDogUG9wQmFzZUV2ZW50SW50ZXJmYWNlKXtcbiAgICBjb25zb2xlLmxvZygnY3J1ZEV2ZW50SGFuZGxlcicsIGV2ZW50KTtcbiAgICBpZiggZXZlbnQubWV0aG9kID09PSAnY3JlYXRlJyB8fCBldmVudC5tZXRob2QgPT09ICdkZWxldGUnICl7XG4gICAgICB0aGlzLnN0YXRlLmNoYW5nZWQgPSB0cnVlO1xuICAgIH1lbHNle1xuICAgICAgaWYoIGV2ZW50LnR5cGUgPT09ICdlbnRpdHknICl7XG4gICAgICAgIGlmKCBldmVudC5uYW1lID09PSAnYXJjaGl2ZScgKXtcbiAgICAgICAgICB0aGlzLnN0YXRlLmNoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9ZWxzZSBpZiggZXZlbnQudHlwZSA9PT0gJ2ZpZWxkJyAmJiBldmVudC5uYW1lID09PSAncGF0Y2gnICl7XG4gICAgICAgIGNvbnN0IHBhdGNoID0ge307XG4gICAgICAgIHBhdGNoWyBldmVudC5jb25maWcuY29sdW1uIF0gPSBldmVudC5jb25maWcuY29udHJvbC52YWx1ZTtcbiAgICAgICAgY29uc3Qgc2lnbmF0dXJlID0gZXZlbnQuY29uZmlnLm1ldGFkYXRhO1xuICAgICAgICBjb25zdCBzaWduYXR1cmVNYXRjaGVzID0gdGhpcy50YWJsZS5tYXREYXRhLmRhdGEuZmlsdGVyKGZ1bmN0aW9uKHJvdywgaSl7XG4gICAgICAgICAgcmV0dXJuICggKCByb3dbICdpbnRlcm5hbF9uYW1lJyBdID09PSBzaWduYXR1cmUuaW50ZXJuYWxfbmFtZSAmJiArcm93WyAnaWQnIF0gPT09ICtzaWduYXR1cmUuaWQgKSApO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYoIEFycmF5LmlzQXJyYXkoc2lnbmF0dXJlTWF0Y2hlcykgJiYgc2lnbmF0dXJlTWF0Y2hlcy5sZW5ndGggKXtcbiAgICAgICAgICBzaWduYXR1cmVNYXRjaGVzLm1hcCgocm93KSA9PiB7XG4gICAgICAgICAgICBPYmplY3Qua2V5cyhwYXRjaCkubWFwKChjb2x1bW4pID0+IHtcbiAgICAgICAgICAgICAgaWYoIGNvbHVtbiBpbiByb3cgKXtcbiAgICAgICAgICAgICAgICByb3dbIGNvbHVtbiBdID0gcGF0Y2hbIGNvbHVtbiBdO1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUuY2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9ZWxzZSBpZiggZXZlbnQudHlwZSA9PT0gJ3NpZGVieXNpZGUnICYmIGV2ZW50Lm5hbWUgPT09ICdwYXRjaCcgKXtcbiAgICAgICAgY29uc3Qgc2lnbmF0dXJlID0geyAuLi5ldmVudC5jb25maWcubWV0YWRhdGEgfTtcbiAgICAgICAgY29uc3Qgc2lnbmF0dXJlTWF0Y2hlcyA9IHRoaXMudGFibGUubWF0RGF0YS5kYXRhLmZpbHRlcihmdW5jdGlvbihyb3csIGkpe1xuICAgICAgICAgIHJldHVybiAoICggcm93WyAnaW50ZXJuYWxfbmFtZScgXSA9PT0gc2lnbmF0dXJlLmludGVybmFsX25hbWUgJiYgK3Jvd1sgJ2lkJyBdID09PSArc2lnbmF0dXJlLmlkICkgKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmKCBBcnJheS5pc0FycmF5KHNpZ25hdHVyZU1hdGNoZXMpICYmIHNpZ25hdHVyZU1hdGNoZXMubGVuZ3RoICl7XG4gICAgICAgICAgdGhpcy5zdGF0ZS5jaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgICB0aGlzLnN0YXRlLmFzc2lnbm1lbnRDaGFuZ2UgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cblxuICBldmVudEhhbmRsZXIoZXZlbnQ6IFBvcEJhc2VFdmVudEludGVyZmFjZSl7XG4gICAgaWYoIGV2ZW50LnR5cGUgPT09ICd0YWJsZScgKXtcbiAgICAgIHN3aXRjaCggZXZlbnQuZGF0YS5saW5rICl7XG4gICAgICAgIGNhc2UgJ3Byb3ZpZGVyJzpcbiAgICAgICAgICB0aGlzLnZpZXdFbnRpdHlQb3J0YWwoZXZlbnQuZGF0YS5yb3cuaW50ZXJuYWxfbmFtZSwgK2V2ZW50LmRhdGEucm93LmlkKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuXG4gIHZpZXdFbnRpdHlQb3J0YWwoaW50ZXJuYWxfbmFtZTogc3RyaW5nLCBpZDogbnVtYmVyKXtcbiAgICAvLyBwbGFjZWhvbGRlclxuICAgIHRoaXMuZW50aXR5UG9ydGFsUmVwby52aWV3KGludGVybmFsX25hbWUsIGlkKTtcbiAgfVxuXG5cbiAgY2FuY2VsKCl7XG4gICAgdGhpcy5kaWFsb2cuY2xvc2UodGhpcy5zdGF0ZS5jaGFuZ2VkKTtcbiAgfVxuXG5cbiAgbmdPbkRlc3Ryb3koKXtcbiAgICBPYmplY3Qua2V5cyh0aGlzLnN1YnNjcmliZXIpLm1hcCgobmFtZSkgPT4ge1xuICAgICAgaWYoIHRoaXMuc3Vic2NyaWJlclsgbmFtZSBdICl7XG4gICAgICAgIHRoaXMuc3Vic2NyaWJlclsgbmFtZSBdLnVuc3Vic2NyaWJlKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxufVxuIl19