import { Injectable } from '@angular/core';
import { PopBaseService } from '../../../services/pop-base.service';
import { ServiceInjector } from '../../../pop-common.model';
export class PopMenuService {
    constructor() {
        this.srv = {
            base: ServiceInjector.get(PopBaseService),
        };
    }
    isAuthenticated() {
        return !this.srv.base.isAuthExpired();
    }
    changeBusiness(id) {
        this.srv.base.switchBusiness(id);
    }
}
PopMenuService.decorators = [
    { type: Injectable }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLW1lbnUuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2FwcC9wb3AtbWVudS9wb3AtbWVudS5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBQ3BFLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUk1RCxNQUFNLE9BQU8sY0FBYztJQUQzQjtRQUVZLFFBQUcsR0FFVDtZQUNGLElBQUksRUFBRSxlQUFlLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQztTQUMxQyxDQUFDO0lBVUosQ0FBQztJQVJDLGVBQWU7UUFDYixPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDeEMsQ0FBQztJQUdELGNBQWMsQ0FBQyxFQUFVO1FBQ3ZCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNuQyxDQUFDOzs7WUFmRixVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgUG9wQmFzZVNlcnZpY2UgfSBmcm9tICcuLi8uLi8uLi9zZXJ2aWNlcy9wb3AtYmFzZS5zZXJ2aWNlJztcbmltcG9ydCB7IFNlcnZpY2VJbmplY3RvciB9IGZyb20gJy4uLy4uLy4uL3BvcC1jb21tb24ubW9kZWwnO1xuXG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBQb3BNZW51U2VydmljZSB7XG4gIHByb3RlY3RlZCBzcnY6IHtcbiAgICBiYXNlOiBQb3BCYXNlU2VydmljZSxcbiAgfSA9IHtcbiAgICBiYXNlOiBTZXJ2aWNlSW5qZWN0b3IuZ2V0KFBvcEJhc2VTZXJ2aWNlKSxcbiAgfTtcblxuICBpc0F1dGhlbnRpY2F0ZWQoKXtcbiAgICByZXR1cm4gIXRoaXMuc3J2LmJhc2UuaXNBdXRoRXhwaXJlZCgpO1xuICB9XG5cblxuICBjaGFuZ2VCdXNpbmVzcyhpZDogbnVtYmVyKXtcbiAgICB0aGlzLnNydi5iYXNlLnN3aXRjaEJ1c2luZXNzKGlkKTtcbiAgfVxufVxuIl19