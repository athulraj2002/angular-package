import { __awaiter } from "tslib";
import { Injectable } from '@angular/core';
import { PopEntityTabMenuComponent } from '../pop-entity-tab-menu/pop-entity-tab-menu.component';
import { MatDialog } from '@angular/material/dialog';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/dialog";
export class PopEntityUtilPortalService {
    constructor(dialogRepo) {
        this.dialogRepo = dialogRepo;
        this.state = {
            blockModal: false,
        };
    }
    view(internal_name, id) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            if (!this.state.blockModal) {
                this.state.blockModal = true;
                if (internal_name && id) {
                    let dialogRef = this.dialogRepo.open(PopEntityTabMenuComponent, {
                        width: `${window.innerWidth - 20}px`,
                        height: `${window.innerHeight - 50}px`,
                        panelClass: 'sw-portal'
                    });
                    let component = dialogRef.componentInstance;
                    component.portal = { internal_name: internal_name, entity_id: id };
                    component.cdr.detectChanges();
                    dialogRef.afterClosed().subscribe((changed) => {
                        this.state.blockModal = false;
                        component.core.repo.clearAllCache();
                        dialogRef = null;
                        component = null;
                        resolve(true);
                    });
                }
                else {
                    resolve(false);
                }
            }
            else {
                console.log('blockModal');
                resolve(false);
            }
        }));
    }
}
PopEntityUtilPortalService.ɵprov = i0.ɵɵdefineInjectable({ factory: function PopEntityUtilPortalService_Factory() { return new PopEntityUtilPortalService(i0.ɵɵinject(i1.MatDialog)); }, token: PopEntityUtilPortalService, providedIn: "root" });
PopEntityUtilPortalService.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
PopEntityUtilPortalService.ctorParameters = () => [
    { type: MatDialog }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS11dGlsLXBvcnRhbC5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvZW50aXR5L3NlcnZpY2VzL3BvcC1lbnRpdHktdXRpbC1wb3J0YWwuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSxzREFBc0QsQ0FBQztBQUNqRyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sMEJBQTBCLENBQUM7OztBQUlyRCxNQUFNLE9BQU8sMEJBQTBCO0lBUXJDLFlBQ1UsVUFBcUI7UUFBckIsZUFBVSxHQUFWLFVBQVUsQ0FBVztRQU4vQixVQUFLLEdBQUc7WUFDTixVQUFVLEVBQUUsS0FBSztTQUNsQixDQUFDO0lBTUYsQ0FBQztJQUdELElBQUksQ0FBRSxhQUFxQixFQUFFLEVBQVU7UUFDckMsT0FBTyxJQUFJLE9BQU8sQ0FBRSxDQUFPLE9BQU8sRUFBRyxFQUFFO1lBQ3JDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRTtnQkFDMUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO2dCQUM3QixJQUFJLGFBQWEsSUFBSSxFQUFFLEVBQUU7b0JBQ3ZCLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFFLHlCQUF5QixFQUFFO3dCQUMvRCxLQUFLLEVBQUUsR0FBRyxNQUFNLENBQUMsVUFBVSxHQUFHLEVBQUUsSUFBSTt3QkFDcEMsTUFBTSxFQUFFLEdBQUcsTUFBTSxDQUFDLFdBQVcsR0FBRyxFQUFFLElBQUk7d0JBQ3RDLFVBQVUsRUFBRSxXQUFXO3FCQUN4QixDQUFFLENBQUM7b0JBQ0osSUFBSSxTQUFTLEdBQThCLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQztvQkFDdkUsU0FBUyxDQUFDLE1BQU0sR0FBRyxFQUFFLGFBQWEsRUFBRSxhQUFhLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRSxDQUFDO29CQUNuRSxTQUFTLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxDQUFDO29CQUM5QixTQUFTLENBQUMsV0FBVyxFQUFFLENBQUMsU0FBUyxDQUFFLENBQUUsT0FBTyxFQUFHLEVBQUU7d0JBQy9DLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQzt3QkFDOUIsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7d0JBQ3BDLFNBQVMsR0FBRyxJQUFJLENBQUM7d0JBQ2pCLFNBQVMsR0FBRyxJQUFJLENBQUM7d0JBQ2pCLE9BQU8sQ0FBRSxJQUFJLENBQUUsQ0FBQztvQkFDbEIsQ0FBQyxDQUFFLENBQUM7aUJBQ0w7cUJBQUk7b0JBQ0gsT0FBTyxDQUFFLEtBQUssQ0FBRSxDQUFDO2lCQUNsQjthQUNGO2lCQUFJO2dCQUNILE9BQU8sQ0FBQyxHQUFHLENBQUUsWUFBWSxDQUFFLENBQUM7Z0JBQzVCLE9BQU8sQ0FBRSxLQUFLLENBQUUsQ0FBQzthQUNsQjtRQUNILENBQUMsQ0FBQSxDQUFFLENBQUM7SUFDTixDQUFDOzs7O1lBM0NGLFVBQVUsU0FBRSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUU7OztZQUgxQixTQUFTIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgUG9wRW50aXR5VGFiTWVudUNvbXBvbmVudCB9IGZyb20gJy4uL3BvcC1lbnRpdHktdGFiLW1lbnUvcG9wLWVudGl0eS10YWItbWVudS5jb21wb25lbnQnO1xuaW1wb3J0IHsgTWF0RGlhbG9nIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvZGlhbG9nJztcblxuXG5ASW5qZWN0YWJsZSggeyBwcm92aWRlZEluOiAncm9vdCcgfSApXG5leHBvcnQgY2xhc3MgUG9wRW50aXR5VXRpbFBvcnRhbFNlcnZpY2Uge1xuXG5cbiAgc3RhdGUgPSB7XG4gICAgYmxvY2tNb2RhbDogZmFsc2UsXG4gIH07XG5cblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGRpYWxvZ1JlcG86IE1hdERpYWxvZyxcbiAgKXtcbiAgfVxuXG5cbiAgdmlldyggaW50ZXJuYWxfbmFtZTogc3RyaW5nLCBpZDogbnVtYmVyICk6IFByb21pc2U8Ym9vbGVhbj57XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKCBhc3luYyggcmVzb2x2ZSApID0+IHtcbiAgICAgIGlmKCAhdGhpcy5zdGF0ZS5ibG9ja01vZGFsICl7XG4gICAgICAgIHRoaXMuc3RhdGUuYmxvY2tNb2RhbCA9IHRydWU7XG4gICAgICAgIGlmKCBpbnRlcm5hbF9uYW1lICYmIGlkICl7XG4gICAgICAgICAgbGV0IGRpYWxvZ1JlZiA9IHRoaXMuZGlhbG9nUmVwby5vcGVuKCBQb3BFbnRpdHlUYWJNZW51Q29tcG9uZW50LCB7XG4gICAgICAgICAgICB3aWR0aDogYCR7d2luZG93LmlubmVyV2lkdGggLSAyMH1weGAsXG4gICAgICAgICAgICBoZWlnaHQ6IGAke3dpbmRvdy5pbm5lckhlaWdodCAtIDUwfXB4YCxcbiAgICAgICAgICAgIHBhbmVsQ2xhc3M6ICdzdy1wb3J0YWwnXG4gICAgICAgICAgfSApO1xuICAgICAgICAgIGxldCBjb21wb25lbnQgPSA8UG9wRW50aXR5VGFiTWVudUNvbXBvbmVudD5kaWFsb2dSZWYuY29tcG9uZW50SW5zdGFuY2U7XG4gICAgICAgICAgY29tcG9uZW50LnBvcnRhbCA9IHsgaW50ZXJuYWxfbmFtZTogaW50ZXJuYWxfbmFtZSwgZW50aXR5X2lkOiBpZCB9O1xuICAgICAgICAgIGNvbXBvbmVudC5jZHIuZGV0ZWN0Q2hhbmdlcygpO1xuICAgICAgICAgIGRpYWxvZ1JlZi5hZnRlckNsb3NlZCgpLnN1YnNjcmliZSggKCBjaGFuZ2VkICkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zdGF0ZS5ibG9ja01vZGFsID0gZmFsc2U7XG4gICAgICAgICAgICBjb21wb25lbnQuY29yZS5yZXBvLmNsZWFyQWxsQ2FjaGUoKTtcbiAgICAgICAgICAgIGRpYWxvZ1JlZiA9IG51bGw7XG4gICAgICAgICAgICBjb21wb25lbnQgPSBudWxsO1xuICAgICAgICAgICAgcmVzb2x2ZSggdHJ1ZSApO1xuICAgICAgICAgIH0gKTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgcmVzb2x2ZSggZmFsc2UgKTtcbiAgICAgICAgfVxuICAgICAgfWVsc2V7XG4gICAgICAgIGNvbnNvbGUubG9nKCAnYmxvY2tNb2RhbCcgKTtcbiAgICAgICAgcmVzb2x2ZSggZmFsc2UgKTtcbiAgICAgIH1cbiAgICB9ICk7XG4gIH1cblxuXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVW5kZXIgVGhlIEhvb2QgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBQcml2YXRlIE1ldGhvZCApICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG59XG4iXX0=