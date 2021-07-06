import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PopRequestService } from './pop-request.service';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common/http";
import * as i2 from "./pop-request.service";
export class PopPreferenceService {
    constructor(http, request) {
        this.http = http;
        this.request = request;
    }
    /**
     * Get preferences at specified level.
     *  - IE: getPreferences('admin', 'users', 'table');
     *
     * @param level1
     * @param level2
     * @param level3
     * @param level4
     * @returns
     */
    getPreferences(level1, level2 = '', level3 = '', level4 = '') {
        let path = '/preferences/' + level1;
        if (level2)
            path += '/' + level2;
        if (level3)
            path += '/' + level3;
        if (level4)
            path += '/' + level4;
        return this.request.doGet(path, {}, 1);
    }
    /**
     * Saves a preferences at the specified level.
     *  - IE: savePreferences('TablePreferences', {some:object}, 'admin', 'users', 'table');
     *
     * @param name
     * @param data
     * @param level1
     * @param level2
     * @param level3
     * @param level4
     * @returns
     */
    savePreferences(name, data, level1, level2 = '', level3 = '', level4 = '') {
        let path = '/preferences/' + level1;
        if (level2)
            path += '/' + level2;
        if (level3)
            path += '/' + level3;
        if (level4)
            path += '/' + level4;
        return this.request.doPost(path, { name: name, data: data });
    }
    /**
     * Deletes a specified preference. Typically used when resetting to default.
     *  - IE: deletePreferences('TablePreferences', 'admin', 'users', 'table');
     *
     * @param name
     * @param level1
     * @param level2
     * @param level3
     * @param level4
     * @returns
     */
    deletePreferences(name, level1, level2 = '', level3 = '', level4 = '') {
        let path = '/preferences/' + level1;
        if (level2)
            path += '/' + level2;
        if (level3)
            path += '/' + level3;
        if (level4)
            path += '/' + level4;
        path += '/' + name;
        return this.request.doDelete(path);
    }
}
PopPreferenceService.ɵprov = i0.ɵɵdefineInjectable({ factory: function PopPreferenceService_Factory() { return new PopPreferenceService(i0.ɵɵinject(i1.HttpClient), i0.ɵɵinject(i2.PopRequestService)); }, token: PopPreferenceService, providedIn: "root" });
PopPreferenceService.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
PopPreferenceService.ctorParameters = () => [
    { type: HttpClient },
    { type: PopRequestService }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLXByZWZlcmVuY2Uuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9zZXJ2aWNlcy9wb3AtcHJlZmVyZW5jZS5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFlLFVBQVUsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBRS9ELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHVCQUF1QixDQUFDOzs7O0FBSzFELE1BQU0sT0FBTyxvQkFBb0I7SUFFL0IsWUFDVSxJQUFnQixFQUNoQixPQUEwQjtRQUQxQixTQUFJLEdBQUosSUFBSSxDQUFZO1FBQ2hCLFlBQU8sR0FBUCxPQUFPLENBQW1CO0lBRXBDLENBQUM7SUFHRDs7Ozs7Ozs7O09BU0c7SUFDSSxjQUFjLENBQUMsTUFBYyxFQUFFLE1BQU0sR0FBRyxFQUFFLEVBQUUsTUFBTSxHQUFHLEVBQUUsRUFBRSxNQUFNLEdBQUcsRUFBRTtRQUN6RSxJQUFJLElBQUksR0FBRyxlQUFlLEdBQUcsTUFBTSxDQUFDO1FBQ3BDLElBQUksTUFBTTtZQUFHLElBQUksSUFBSSxHQUFHLEdBQUcsTUFBTSxDQUFDO1FBQ2xDLElBQUksTUFBTTtZQUFHLElBQUksSUFBSSxHQUFHLEdBQUcsTUFBTSxDQUFDO1FBQ2xDLElBQUksTUFBTTtZQUFHLElBQUksSUFBSSxHQUFHLEdBQUcsTUFBTSxDQUFDO1FBQ2xDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBR0Q7Ozs7Ozs7Ozs7O09BV0c7SUFDSSxlQUFlLENBQUMsSUFBWSxFQUFFLElBQVMsRUFBRSxNQUFjLEVBQUUsTUFBTSxHQUFHLEVBQUUsRUFBRSxNQUFNLEdBQUcsRUFBRSxFQUFFLE1BQU0sR0FBRyxFQUFFO1FBQ25HLElBQUksSUFBSSxHQUFHLGVBQWUsR0FBRyxNQUFNLENBQUM7UUFDcEMsSUFBSSxNQUFNO1lBQUcsSUFBSSxJQUFJLEdBQUcsR0FBRyxNQUFNLENBQUM7UUFDbEMsSUFBSSxNQUFNO1lBQUcsSUFBSSxJQUFJLEdBQUcsR0FBRyxNQUFNLENBQUM7UUFDbEMsSUFBSSxNQUFNO1lBQUcsSUFBSSxJQUFJLEdBQUcsR0FBRyxNQUFNLENBQUM7UUFFbEMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQy9ELENBQUM7SUFHRDs7Ozs7Ozs7OztPQVVHO0lBQ0ksaUJBQWlCLENBQUMsSUFBWSxFQUFFLE1BQWMsRUFBRSxNQUFNLEdBQUcsRUFBRSxFQUFFLE1BQU0sR0FBRyxFQUFFLEVBQUUsTUFBTSxHQUFHLEVBQUU7UUFDMUYsSUFBSSxJQUFJLEdBQUcsZUFBZSxHQUFHLE1BQU0sQ0FBQztRQUNwQyxJQUFJLE1BQU07WUFBRyxJQUFJLElBQUksR0FBRyxHQUFHLE1BQU0sQ0FBQztRQUNsQyxJQUFJLE1BQU07WUFBRyxJQUFJLElBQUksR0FBRyxHQUFHLE1BQU0sQ0FBQztRQUNsQyxJQUFJLE1BQU07WUFBRyxJQUFJLElBQUksR0FBRyxHQUFHLE1BQU0sQ0FBQztRQUNsQyxJQUFJLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQztRQUVuQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3JDLENBQUM7Ozs7WUF0RUYsVUFBVSxTQUFDLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRTs7O1lBTlosVUFBVTtZQUV2QixpQkFBaUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBIdHRwSGVhZGVycywgSHR0cENsaWVudCB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcbmltcG9ydCB7IFBvcEJhc2VTZXJ2aWNlIH0gZnJvbSAnLi9wb3AtYmFzZS5zZXJ2aWNlJztcbmltcG9ydCB7IFBvcFJlcXVlc3RTZXJ2aWNlIH0gZnJvbSAnLi9wb3AtcmVxdWVzdC5zZXJ2aWNlJztcbmltcG9ydCB7IE9ic2VydmFibGUgfSBmcm9tICdyeGpzJztcblxuXG5ASW5qZWN0YWJsZSh7IHByb3ZpZGVkSW46ICdyb290JyB9KVxuZXhwb3J0IGNsYXNzIFBvcFByZWZlcmVuY2VTZXJ2aWNlIHtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGh0dHA6IEh0dHBDbGllbnQsXG4gICAgcHJpdmF0ZSByZXF1ZXN0OiBQb3BSZXF1ZXN0U2VydmljZVxuICApe1xuICB9XG5cblxuICAvKipcbiAgICogR2V0IHByZWZlcmVuY2VzIGF0IHNwZWNpZmllZCBsZXZlbC5cbiAgICogIC0gSUU6IGdldFByZWZlcmVuY2VzKCdhZG1pbicsICd1c2VycycsICd0YWJsZScpO1xuICAgKlxuICAgKiBAcGFyYW0gbGV2ZWwxXG4gICAqIEBwYXJhbSBsZXZlbDJcbiAgICogQHBhcmFtIGxldmVsM1xuICAgKiBAcGFyYW0gbGV2ZWw0XG4gICAqIEByZXR1cm5zXG4gICAqL1xuICBwdWJsaWMgZ2V0UHJlZmVyZW5jZXMobGV2ZWwxOiBzdHJpbmcsIGxldmVsMiA9ICcnLCBsZXZlbDMgPSAnJywgbGV2ZWw0ID0gJycpOiBPYnNlcnZhYmxlPGFueT57XG4gICAgbGV0IHBhdGggPSAnL3ByZWZlcmVuY2VzLycgKyBsZXZlbDE7XG4gICAgaWYoIGxldmVsMiApIHBhdGggKz0gJy8nICsgbGV2ZWwyO1xuICAgIGlmKCBsZXZlbDMgKSBwYXRoICs9ICcvJyArIGxldmVsMztcbiAgICBpZiggbGV2ZWw0ICkgcGF0aCArPSAnLycgKyBsZXZlbDQ7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdC5kb0dldChwYXRoLCB7fSwgMSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBTYXZlcyBhIHByZWZlcmVuY2VzIGF0IHRoZSBzcGVjaWZpZWQgbGV2ZWwuXG4gICAqICAtIElFOiBzYXZlUHJlZmVyZW5jZXMoJ1RhYmxlUHJlZmVyZW5jZXMnLCB7c29tZTpvYmplY3R9LCAnYWRtaW4nLCAndXNlcnMnLCAndGFibGUnKTtcbiAgICpcbiAgICogQHBhcmFtIG5hbWVcbiAgICogQHBhcmFtIGRhdGFcbiAgICogQHBhcmFtIGxldmVsMVxuICAgKiBAcGFyYW0gbGV2ZWwyXG4gICAqIEBwYXJhbSBsZXZlbDNcbiAgICogQHBhcmFtIGxldmVsNFxuICAgKiBAcmV0dXJuc1xuICAgKi9cbiAgcHVibGljIHNhdmVQcmVmZXJlbmNlcyhuYW1lOiBzdHJpbmcsIGRhdGE6IGFueSwgbGV2ZWwxOiBzdHJpbmcsIGxldmVsMiA9ICcnLCBsZXZlbDMgPSAnJywgbGV2ZWw0ID0gJycpOiBPYnNlcnZhYmxlPGFueT57XG4gICAgbGV0IHBhdGggPSAnL3ByZWZlcmVuY2VzLycgKyBsZXZlbDE7XG4gICAgaWYoIGxldmVsMiApIHBhdGggKz0gJy8nICsgbGV2ZWwyO1xuICAgIGlmKCBsZXZlbDMgKSBwYXRoICs9ICcvJyArIGxldmVsMztcbiAgICBpZiggbGV2ZWw0ICkgcGF0aCArPSAnLycgKyBsZXZlbDQ7XG5cbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0LmRvUG9zdChwYXRoLCB7IG5hbWU6IG5hbWUsIGRhdGE6IGRhdGEgfSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBEZWxldGVzIGEgc3BlY2lmaWVkIHByZWZlcmVuY2UuIFR5cGljYWxseSB1c2VkIHdoZW4gcmVzZXR0aW5nIHRvIGRlZmF1bHQuXG4gICAqICAtIElFOiBkZWxldGVQcmVmZXJlbmNlcygnVGFibGVQcmVmZXJlbmNlcycsICdhZG1pbicsICd1c2VycycsICd0YWJsZScpO1xuICAgKlxuICAgKiBAcGFyYW0gbmFtZVxuICAgKiBAcGFyYW0gbGV2ZWwxXG4gICAqIEBwYXJhbSBsZXZlbDJcbiAgICogQHBhcmFtIGxldmVsM1xuICAgKiBAcGFyYW0gbGV2ZWw0XG4gICAqIEByZXR1cm5zXG4gICAqL1xuICBwdWJsaWMgZGVsZXRlUHJlZmVyZW5jZXMobmFtZTogc3RyaW5nLCBsZXZlbDE6IHN0cmluZywgbGV2ZWwyID0gJycsIGxldmVsMyA9ICcnLCBsZXZlbDQgPSAnJyk6IE9ic2VydmFibGU8YW55PntcbiAgICBsZXQgcGF0aCA9ICcvcHJlZmVyZW5jZXMvJyArIGxldmVsMTtcbiAgICBpZiggbGV2ZWwyICkgcGF0aCArPSAnLycgKyBsZXZlbDI7XG4gICAgaWYoIGxldmVsMyApIHBhdGggKz0gJy8nICsgbGV2ZWwzO1xuICAgIGlmKCBsZXZlbDQgKSBwYXRoICs9ICcvJyArIGxldmVsNDtcbiAgICBwYXRoICs9ICcvJyArIG5hbWU7XG5cbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0LmRvRGVsZXRlKHBhdGgpO1xuICB9XG59XG4iXX0=