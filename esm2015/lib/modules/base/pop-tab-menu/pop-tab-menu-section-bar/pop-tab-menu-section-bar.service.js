import { Inject, Injectable } from '@angular/core';
import { PopBaseService } from '../../../../services/pop-base.service';
import { PopBusiness } from '../../../../pop-common.model';
import { GetSessionSiteVar, SetSessionSiteVar, TitleCase } from '../../../../pop-common-utility';
import * as i0 from "@angular/core";
import * as i1 from "../../../../services/pop-base.service";
export class PopTabMenuSectionBarService {
    constructor(baseRepo, env) {
        this.baseRepo = baseRepo;
        this.env = env;
    }
    /**
     * Store the current tab into onSession memory
     * @param name
     * @returns void
     */
    setSectionSession(internal_name, slug) {
        if (internal_name)
            SetSessionSiteVar(`Business.${PopBusiness.id}.Entity.${TitleCase(internal_name)}.TabMenu.Main.section`, slug);
    }
    /**
     * Get latest path
     */
    getPathSession(internal_name) {
        return GetSessionSiteVar(`Business.${PopBusiness.id}.Entity.${TitleCase(internal_name)}.TabMenu.Main.section`);
    }
}
PopTabMenuSectionBarService.ɵprov = i0.ɵɵdefineInjectable({ factory: function PopTabMenuSectionBarService_Factory() { return new PopTabMenuSectionBarService(i0.ɵɵinject(i1.PopBaseService), i0.ɵɵinject("env")); }, token: PopTabMenuSectionBarService, providedIn: "root" });
PopTabMenuSectionBarService.decorators = [
    { type: Injectable, args: [{
                providedIn: 'root'
            },] }
];
PopTabMenuSectionBarService.ctorParameters = () => [
    { type: PopBaseService },
    { type: undefined, decorators: [{ type: Inject, args: ['env',] }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLXRhYi1tZW51LXNlY3Rpb24tYmFyLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9iYXNlL3BvcC10YWItbWVudS9wb3AtdGFiLW1lbnUtc2VjdGlvbi1iYXIvcG9wLXRhYi1tZW51LXNlY3Rpb24tYmFyLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDbkQsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBQ3ZFLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUMzRCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsaUJBQWlCLEVBQUUsU0FBUyxFQUFFLE1BQU0sZ0NBQWdDLENBQUM7OztBQU1qRyxNQUFNLE9BQU8sMkJBQTJCO0lBRXRDLFlBQ1UsUUFBd0IsRUFDQSxHQUFJO1FBRDVCLGFBQVEsR0FBUixRQUFRLENBQWdCO1FBQ0EsUUFBRyxHQUFILEdBQUcsQ0FBQztJQUV0QyxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILGlCQUFpQixDQUFDLGFBQXFCLEVBQUUsSUFBWTtRQUNuRCxJQUFJLGFBQWE7WUFBRyxpQkFBaUIsQ0FBQyxZQUFZLFdBQVcsQ0FBQyxFQUFFLFdBQVcsU0FBUyxDQUFDLGFBQWEsQ0FBQyx1QkFBdUIsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNwSSxDQUFDO0lBR0Q7O09BRUc7SUFDSCxjQUFjLENBQUMsYUFBcUI7UUFDbEMsT0FBTyxpQkFBaUIsQ0FBQyxZQUFZLFdBQVcsQ0FBQyxFQUFFLFdBQVcsU0FBUyxDQUFDLGFBQWEsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0lBQ2pILENBQUM7Ozs7WUExQkYsVUFBVSxTQUFDO2dCQUNWLFVBQVUsRUFBRSxNQUFNO2FBQ25COzs7WUFQUSxjQUFjOzRDQVlsQixNQUFNLFNBQUMsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdCwgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgUG9wQmFzZVNlcnZpY2UgfSBmcm9tICcuLi8uLi8uLi8uLi9zZXJ2aWNlcy9wb3AtYmFzZS5zZXJ2aWNlJztcbmltcG9ydCB7IFBvcEJ1c2luZXNzIH0gZnJvbSAnLi4vLi4vLi4vLi4vcG9wLWNvbW1vbi5tb2RlbCc7XG5pbXBvcnQgeyBHZXRTZXNzaW9uU2l0ZVZhciwgU2V0U2Vzc2lvblNpdGVWYXIsIFRpdGxlQ2FzZSB9IGZyb20gJy4uLy4uLy4uLy4uL3BvcC1jb21tb24tdXRpbGl0eSc7XG5cblxuQEluamVjdGFibGUoe1xuICBwcm92aWRlZEluOiAncm9vdCdcbn0pXG5leHBvcnQgY2xhc3MgUG9wVGFiTWVudVNlY3Rpb25CYXJTZXJ2aWNlIHtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGJhc2VSZXBvOiBQb3BCYXNlU2VydmljZSxcbiAgICBASW5qZWN0KCdlbnYnKSBwcml2YXRlIHJlYWRvbmx5IGVudj9cbiAgKXtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdG9yZSB0aGUgY3VycmVudCB0YWIgaW50byBvblNlc3Npb24gbWVtb3J5XG4gICAqIEBwYXJhbSBuYW1lXG4gICAqIEByZXR1cm5zIHZvaWRcbiAgICovXG4gIHNldFNlY3Rpb25TZXNzaW9uKGludGVybmFsX25hbWU6IHN0cmluZywgc2x1Zzogc3RyaW5nKTogdm9pZHtcbiAgICBpZiggaW50ZXJuYWxfbmFtZSApIFNldFNlc3Npb25TaXRlVmFyKGBCdXNpbmVzcy4ke1BvcEJ1c2luZXNzLmlkfS5FbnRpdHkuJHtUaXRsZUNhc2UoaW50ZXJuYWxfbmFtZSl9LlRhYk1lbnUuTWFpbi5zZWN0aW9uYCwgc2x1Zyk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBHZXQgbGF0ZXN0IHBhdGhcbiAgICovXG4gIGdldFBhdGhTZXNzaW9uKGludGVybmFsX25hbWU6IHN0cmluZyl7XG4gICAgcmV0dXJuIEdldFNlc3Npb25TaXRlVmFyKGBCdXNpbmVzcy4ke1BvcEJ1c2luZXNzLmlkfS5FbnRpdHkuJHtUaXRsZUNhc2UoaW50ZXJuYWxfbmFtZSl9LlRhYk1lbnUuTWFpbi5zZWN0aW9uYCk7XG4gIH1cblxufVxuIl19