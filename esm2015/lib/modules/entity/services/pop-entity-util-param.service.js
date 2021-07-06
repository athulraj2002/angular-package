import { Injectable } from '@angular/core';
import { DeepMerge, IsNumber, IsObject, SpaceToHyphenLower } from '../../../pop-common-utility';
import * as i0 from "@angular/core";
export class PopEntityUtilParamService {
    constructor() {
        this.store = new Map();
        this.mapById = new Map();
        this.mapByRoute = new Map();
        this.setEntityParams({
            id: 0,
            alias: null,
            access: {
                can_create: 1,
                can_read: 1,
                can_update: 1,
                can_delete: 0,
                can_destroy: 0,
            },
            can_extend: false,
            path: '/auth/user',
            param: '',
            api: '/auth/user',
            internal_name: 'prime_user',
            name: 'Prime User',
        });
    }
    getEntityParamsWithPath(path, entityId = null) {
        let entity;
        let entityParams = undefined;
        const internal_name = this.mapByRoute.get(path);
        if (internal_name && this.store.has(internal_name))
            entity = this.store.get(internal_name);
        if (entity) {
            entityParams = {
                alias: entity.alias,
                api: entity.api,
                app: entity.app,
                id: entity.id,
                can_extend: entity.can_extend,
                internal_name: entity.internal_name,
                name: entity.name,
                path: entity.path,
                param: entity.param,
            };
            if (entityId)
                entityParams.entityId = entityId;
        }
        return entityParams;
    }
    setEntityParams(params) {
        if (IsObject(params, true)) {
            if (!(IsObject(params.access, true))) {
                params.access = { can_create: 0, can_read: 0, can_update: 0, can_delete: 0, can_destroy: 0 };
            }
            else {
                Object.keys(params.access).map((accessName) => {
                    params.access[accessName] = +params.access[accessName];
                });
            }
            this.mapById.set(+params.id, params.internal_name);
            this.mapByRoute.set(SpaceToHyphenLower(params.name), params.internal_name);
            if (this.store.has(params.internal_name)) {
                let existingParams = this.store.get(params.internal_name);
                existingParams = DeepMerge(existingParams, params);
                this.store.set(params.internal_name, existingParams);
            }
            else {
                this.store.set(params.internal_name, params);
            }
        }
    }
    getEntityParams(internal_name, entityId = null) {
        let entityParams = undefined;
        if (IsNumber(internal_name)) {
            internal_name = this.mapById.get(+internal_name);
        }
        const entity = this.store.get(internal_name + '');
        if (entity) {
            entityParams = {
                alias: entity.alias,
                api: entity.api,
                app: entity.app,
                id: entity.id,
                can_extend: entity.can_extend,
                internal_name: entity.internal_name,
                name: entity.name,
                path: entity.path,
                param: entity.param,
            };
            if (entityId)
                entityParams.entityId = entityId;
        }
        return entityParams;
    }
    getAccess(internal_name, accessType) {
        let access = null;
        if (IsNumber(internal_name))
            internal_name = this.mapById.get(+internal_name);
        if (this.store.has(internal_name + '')) {
            const entity = this.store.get(internal_name + '');
            if (accessType && accessType in entity.access) {
                access = entity.access[accessType];
            }
            else {
                access = entity.access;
            }
        }
        return access;
    }
    getAlias(internal_name, accessType) {
        let alias = null;
        if (IsNumber(internal_name))
            internal_name = this.mapById.get(+internal_name);
        if (this.store.has(internal_name + '')) {
            const entity = this.store.get(internal_name + '');
            if (IsObject(entity.alias, true)) {
                alias = entity.alias;
            }
        }
        return alias;
    }
    /**
     * Checks if the user has permissons to the specific type of an entity depending upon the local token details.
     *
     * @param appName - The name of the app to check. IE: admin, cis, etc...
     * @param entityName - The name of the entity inside the app to check: IE: For the admin app, users.
     * @param accessType - The type of permissons to check. Enum [can_create, can_read, can_update, can_delete]
     */
    checkAccess(internal_name, accessType) {
        if (IsNumber(internal_name))
            internal_name = this.mapById.get(+internal_name);
        if (this.store.has(internal_name + '')) {
            const entity = this.store.get(internal_name + '');
            return !!entity.access[accessType];
        }
        return false;
    }
}
PopEntityUtilParamService.ɵprov = i0.ɵɵdefineInjectable({ factory: function PopEntityUtilParamService_Factory() { return new PopEntityUtilParamService(); }, token: PopEntityUtilParamService, providedIn: "root" });
PopEntityUtilParamService.decorators = [
    { type: Injectable, args: [{
                providedIn: 'root'
            },] }
];
PopEntityUtilParamService.ctorParameters = () => [];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS11dGlsLXBhcmFtLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9lbnRpdHkvc2VydmljZXMvcG9wLWVudGl0eS11dGlsLXBhcmFtLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUV6QyxPQUFPLEVBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsa0JBQWtCLEVBQUMsTUFBTSw2QkFBNkIsQ0FBQzs7QUFNOUYsTUFBTSxPQUFPLHlCQUF5QjtJQU9wQztRQUxRLFVBQUssR0FBdUMsSUFBSSxHQUFHLEVBQWlDLENBQUM7UUFDckYsWUFBTyxHQUF3QixJQUFJLEdBQUcsRUFBa0IsQ0FBQztRQUN6RCxlQUFVLEdBQXdCLElBQUksR0FBRyxFQUFrQixDQUFDO1FBSWxFLElBQUksQ0FBQyxlQUFlLENBQUM7WUFDbkIsRUFBRSxFQUFFLENBQUM7WUFDTCxLQUFLLEVBQUUsSUFBSTtZQUNYLE1BQU0sRUFBRTtnQkFDTixVQUFVLEVBQUUsQ0FBQztnQkFDYixRQUFRLEVBQUUsQ0FBQztnQkFDWCxVQUFVLEVBQUUsQ0FBQztnQkFDYixVQUFVLEVBQUUsQ0FBQztnQkFDYixXQUFXLEVBQUUsQ0FBQzthQUNmO1lBQ0QsVUFBVSxFQUFFLEtBQUs7WUFDakIsSUFBSSxFQUFFLFlBQVk7WUFDbEIsS0FBSyxFQUFFLEVBQUU7WUFDVCxHQUFHLEVBQUUsWUFBWTtZQUNqQixhQUFhLEVBQUUsWUFBWTtZQUMzQixJQUFJLEVBQUUsWUFBWTtTQUNuQixDQUFDLENBQUM7SUFDTCxDQUFDO0lBR00sdUJBQXVCLENBQUMsSUFBWSxFQUFFLFdBQW1CLElBQUk7UUFDbEUsSUFBSSxNQUFNLENBQUM7UUFDWCxJQUFJLFlBQVksR0FBaUIsU0FBUyxD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TyxLQUFLLENBQUM7SUFDZixDQUFDOzs7O1lBOUlGLFVBQVUsU0FBQztnQkFDVixVQUFVLEVBQUUsTUFBTTthQUNuQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0VudGl0eUFjY2Vzc0ludGVyZmFjZSwgRW50aXR5UGFyYW1zLCBFbnRpdHlQYXJhbXNJbnRlcmZhY2V9IGZyb20gJy4uLy4uLy4uL3BvcC1jb21tb24ubW9kZWwnO1xuaW1wb3J0IHtEZWVwTWVyZ2UsIElzTnVtYmVyLCBJc09iamVjdCwgU3BhY2VUb0h5cGhlbkxvd2VyfSBmcm9tICcuLi8uLi8uLi9wb3AtY29tbW9uLXV0aWxpdHknO1xuXG5cbkBJbmplY3RhYmxlKHtcbiAgcHJvdmlkZWRJbjogJ3Jvb3QnXG59KVxuZXhwb3J0IGNsYXNzIFBvcEVudGl0eVV0aWxQYXJhbVNlcnZpY2Uge1xuXG4gIHByaXZhdGUgc3RvcmUgPSA8TWFwPHN0cmluZywgRW50aXR5UGFyYW1zSW50ZXJmYWNlPj5uZXcgTWFwPHN0cmluZywgRW50aXR5UGFyYW1zSW50ZXJmYWNlPigpO1xuICBwcml2YXRlIG1hcEJ5SWQgPSA8TWFwPG51bWJlciwgc3RyaW5nPj5uZXcgTWFwPG51bWJlciwgc3RyaW5nPigpO1xuICBwcml2YXRlIG1hcEJ5Um91dGUgPSA8TWFwPHN0cmluZywgc3RyaW5nPj5uZXcgTWFwPHN0cmluZywgc3RyaW5nPigpO1xuXG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5zZXRFbnRpdHlQYXJhbXMoe1xuICAgICAgaWQ6IDAsXG4gICAgICBhbGlhczogbnVsbCxcbiAgICAgIGFjY2Vzczoge1xuICAgICAgICBjYW5fY3JlYXRlOiAxLFxuICAgICAgICBjYW5fcmVhZDogMSxcbiAgICAgICAgY2FuX3VwZGF0ZTogMSxcbiAgICAgICAgY2FuX2RlbGV0ZTogMCxcbiAgICAgICAgY2FuX2Rlc3Ryb3k6IDAsXG4gICAgICB9LFxuICAgICAgY2FuX2V4dGVuZDogZmFsc2UsXG4gICAgICBwYXRoOiAnL2F1dGgvdXNlcicsXG4gICAgICBwYXJhbTogJycsXG4gICAgICBhcGk6ICcvYXV0aC91c2VyJyxcbiAgICAgIGludGVybmFsX25hbWU6ICdwcmltZV91c2VyJyxcbiAgICAgIG5hbWU6ICdQcmltZSBVc2VyJyxcbiAgICB9KTtcbiAgfVxuXG5cbiAgcHVibGljIGdldEVudGl0eVBhcmFtc1dpdGhQYXRoKHBhdGg6IHN0cmluZywgZW50aXR5SWQ6IG51bWJlciA9IG51bGwsKTogRW50aXR5UGFyYW1zIHtcbiAgICBsZXQgZW50aXR5O1xuICAgIGxldCBlbnRpdHlQYXJhbXMgPSA8RW50aXR5UGFyYW1zPnVuZGVmaW5lZDtcbiAgICBjb25zdCBpbnRlcm5hbF9uYW1lID0gdGhpcy5tYXBCeVJvdXRlLmdldChwYXRoKTtcbiAgICBpZiAoaW50ZXJuYWxfbmFtZSAmJiB0aGlzLnN0b3JlLmhhcyhpbnRlcm5hbF9uYW1lKSkgZW50aXR5ID0gdGhpcy5zdG9yZS5nZXQoaW50ZXJuYWxfbmFtZSk7XG4gICAgaWYgKGVudGl0eSkge1xuICAgICAgZW50aXR5UGFyYW1zID0gPEVudGl0eVBhcmFtcz57XG4gICAgICAgIGFsaWFzOiBlbnRpdHkuYWxpYXMsXG4gICAgICAgIGFwaTogZW50aXR5LmFwaSxcbiAgICAgICAgYXBwOiBlbnRpdHkuYXBwLFxuICAgICAgICBpZDogZW50aXR5LmlkLFxuICAgICAgICBjYW5fZXh0ZW5kOiBlbnRpdHkuY2FuX2V4dGVuZCxcbiAgICAgICAgaW50ZXJuYWxfbmFtZTogZW50aXR5LmludGVybmFsX25hbWUsXG4gICAgICAgIG5hbWU6IGVudGl0eS5uYW1lLFxuICAgICAgICBwYXRoOiBlbnRpdHkucGF0aCxcbiAgICAgICAgcGFyYW06IGVudGl0eS5wYXJhbSxcbiAgICAgIH07XG4gICAgICBpZiAoZW50aXR5SWQpIGVudGl0eVBhcmFtcy5lbnRpdHlJZCA9IGVudGl0eUlkO1xuICAgIH1cblxuICAgIHJldHVybiBlbnRpdHlQYXJhbXM7XG4gIH1cblxuXG4gIHB1YmxpYyBzZXRFbnRpdHlQYXJhbXMocGFyYW1zOiBFbnRpdHlQYXJhbXNJbnRlcmZhY2UpOiB2b2lkIHtcbiAgICBpZiAoSXNPYmplY3QocGFyYW1zLCB0cnVlKSkge1xuICAgICAgaWYgKCEoSXNPYmplY3QocGFyYW1zLmFjY2VzcywgdHJ1ZSkpKSB7XG4gICAgICAgIHBhcmFtcy5hY2Nlc3MgPSB7Y2FuX2NyZWF0ZTogMCwgY2FuX3JlYWQ6IDAsIGNhbl91cGRhdGU6IDAsIGNhbl9kZWxldGU6IDAsIGNhbl9kZXN0cm95OiAwfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIE9iamVjdC5rZXlzKHBhcmFtcy5hY2Nlc3MpLm1hcCgoYWNjZXNzTmFtZSkgPT4ge1xuICAgICAgICAgIHBhcmFtcy5hY2Nlc3NbYWNjZXNzTmFtZV0gPSArcGFyYW1zLmFjY2Vzc1thY2Nlc3NOYW1lXTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICB0aGlzLm1hcEJ5SWQuc2V0KCtwYXJhbXMuaWQsIHBhcmFtcy5pbnRlcm5hbF9uYW1lKTtcbiAgICAgIHRoaXMubWFwQnlSb3V0ZS5zZXQoU3BhY2VUb0h5cGhlbkxvd2VyKHBhcmFtcy5uYW1lKSwgcGFyYW1zLmludGVybmFsX25hbWUpO1xuICAgICAgaWYgKHRoaXMuc3RvcmUuaGFzKHBhcmFtcy5pbnRlcm5hbF9uYW1lKSkge1xuICAgICAgICBsZXQgZXhpc3RpbmdQYXJhbXMgPSB0aGlzLnN0b3JlLmdldChwYXJhbXMuaW50ZXJuYWxfbmFtZSk7XG4gICAgICAgIGV4aXN0aW5nUGFyYW1zID0gRGVlcE1lcmdlKGV4aXN0aW5nUGFyYW1zLCBwYXJhbXMpO1xuICAgICAgICB0aGlzLnN0b3JlLnNldChwYXJhbXMuaW50ZXJuYWxfbmFtZSwgZXhpc3RpbmdQYXJhbXMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zdG9yZS5zZXQocGFyYW1zLmludGVybmFsX25hbWUsIHBhcmFtcyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cblxuICBwdWJsaWMgZ2V0RW50aXR5UGFyYW1zKGludGVybmFsX25hbWU6IHN0cmluZyB8IG51bWJlciwgZW50aXR5SWQ6IG51bWJlciA9IG51bGwsKTogRW50aXR5UGFyYW1zSW50ZXJmYWNlIHtcbiAgICBsZXQgZW50aXR5UGFyYW1zID0gPEVudGl0eVBhcmFtcz51bmRlZmluZWQ7XG4gICAgaWYgKElzTnVtYmVyKGludGVybmFsX25hbWUpKSB7XG4gICAgICBpbnRlcm5hbF9uYW1lID0gdGhpcy5tYXBCeUlkLmdldCgraW50ZXJuYWxfbmFtZSk7XG4gICAgfVxuICAgIGNvbnN0IGVudGl0eSA9IHRoaXMuc3RvcmUuZ2V0KGludGVybmFsX25hbWUgKyAnJyk7XG4gICAgaWYgKGVudGl0eSkge1xuICAgICAgZW50aXR5UGFyYW1zID0gPEVudGl0eVBhcmFtcz57XG4gICAgICAgIGFsaWFzOiBlbnRpdHkuYWxpYXMsXG4gICAgICAgIGFwaTogZW50aXR5LmFwaSxcbiAgICAgICAgYXBwOiBlbnRpdHkuYXBwLFxuICAgICAgICBpZDogZW50aXR5LmlkLFxuICAgICAgICBjYW5fZXh0ZW5kOiBlbnRpdHkuY2FuX2V4dGVuZCxcbiAgICAgICAgaW50ZXJuYWxfbmFtZTogZW50aXR5LmludGVybmFsX25hbWUsXG4gICAgICAgIG5hbWU6IGVudGl0eS5uYW1lLFxuICAgICAgICBwYXRoOiBlbnRpdHkucGF0aCxcbiAgICAgICAgcGFyYW06IGVudGl0eS5wYXJhbSxcbiAgICAgIH07XG4gICAgICBpZiAoZW50aXR5SWQpIGVudGl0eVBhcmFtcy5lbnRpdHlJZCA9IGVudGl0eUlkO1xuICAgIH1cbiAgICByZXR1cm4gZW50aXR5UGFyYW1zO1xuICB9XG5cblxuICBwdWJsaWMgZ2V0QWNjZXNzKGludGVybmFsX25hbWU6IHN0cmluZyB8IG51bWJlciwgYWNjZXNzVHlwZT86IHN0cmluZyk6IEVudGl0eUFjY2Vzc0ludGVyZmFjZSB8IG51bGwge1xuICAgIGxldCBhY2Nlc3MgPSBudWxsO1xuICAgIGlmIChJc051bWJlcihpbnRlcm5hbF9uYW1lKSkgaW50ZXJuYWxfbmFtZSA9IHRoaXMubWFwQnlJZC5nZXQoK2ludGVybmFsX25hbWUpO1xuICAgIGlmICh0aGlzLnN0b3JlLmhhcyhpbnRlcm5hbF9uYW1lICsgJycpKSB7XG4gICAgICBjb25zdCBlbnRpdHkgPSB0aGlzLnN0b3JlLmdldChpbnRlcm5hbF9uYW1lICsgJycpO1xuICAgICAgaWYgKGFjY2Vzc1R5cGUgJiYgYWNjZXNzVHlwZSBpbiBlbnRpdHkuYWNjZXNzKSB7XG4gICAgICAgIGFjY2VzcyA9IGVudGl0eS5hY2Nlc3NbYWNjZXNzVHlwZV07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhY2Nlc3MgPSBlbnRpdHkuYWNjZXNzO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYWNjZXNzO1xuICB9XG5cbiAgcHVibGljIGdldEFsaWFzKGludGVybmFsX25hbWU6IHN0cmluZyB8IG51bWJlciwgYWNjZXNzVHlwZT86IHN0cmluZyk6IEVudGl0eUFjY2Vzc0ludGVyZmFjZSB8IG51bGwge1xuICAgIGxldCBhbGlhcyA9IG51bGw7XG4gICAgaWYgKElzTnVtYmVyKGludGVybmFsX25hbWUpKSBpbnRlcm5hbF9uYW1lID0gdGhpcy5tYXBCeUlkLmdldCgraW50ZXJuYWxfbmFtZSk7XG4gICAgaWYgKHRoaXMuc3RvcmUuaGFzKGludGVybmFsX25hbWUgKyAnJykpIHtcbiAgICAgIGNvbnN0IGVudGl0eSA9IHRoaXMuc3RvcmUuZ2V0KGludGVybmFsX25hbWUgKyAnJyk7XG4gICAgICBpZiAoSXNPYmplY3QoZW50aXR5LmFsaWFzLCB0cnVlKSkge1xuICAgICAgICBhbGlhcyA9IGVudGl0eS5hbGlhcztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGFsaWFzO1xuICB9XG5cblxuICAvKipcbiAgICogQ2hlY2tzIGlmIHRoZSB1c2VyIGhhcyBwZXJtaXNzb25zIHRvIHRoZSBzcGVjaWZpYyB0eXBlIG9mIGFuIGVudGl0eSBkZXBlbmRpbmcgdXBvbiB0aGUgbG9jYWwgdG9rZW4gZGV0YWlscy5cbiAgICpcbiAgICogQHBhcmFtIGFwcE5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgYXBwIHRvIGNoZWNrLiBJRTogYWRtaW4sIGNpcywgZXRjLi4uXG4gICAqIEBwYXJhbSBlbnRpdHlOYW1lIC0gVGhlIG5hbWUgb2YgdGhlIGVudGl0eSBpbnNpZGUgdGhlIGFwcCB0byBjaGVjazogSUU6IEZvciB0aGUgYWRtaW4gYXBwLCB1c2Vycy5cbiAgICogQHBhcmFtIGFjY2Vzc1R5cGUgLSBUaGUgdHlwZSBvZiBwZXJtaXNzb25zIHRvIGNoZWNrLiBFbnVtIFtjYW5fY3JlYXRlLCBjYW5fcmVhZCwgY2FuX3VwZGF0ZSwgY2FuX2RlbGV0ZV1cbiAgICovXG4gIHB1YmxpYyBjaGVja0FjY2VzcyhpbnRlcm5hbF9uYW1lOiBzdHJpbmcgfCBudW1iZXIsIGFjY2Vzc1R5cGU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGlmIChJc051bWJlcihpbnRlcm5hbF9uYW1lKSkgaW50ZXJuYWxfbmFtZSA9IHRoaXMubWFwQnlJZC5nZXQoK2ludGVybmFsX25hbWUpO1xuICAgIGlmICh0aGlzLnN0b3JlLmhhcyhpbnRlcm5hbF9uYW1lICsgJycpKSB7XG4gICAgICBjb25zdCBlbnRpdHkgPSB0aGlzLnN0b3JlLmdldChpbnRlcm5hbF9uYW1lICsgJycpO1xuICAgICAgcmV0dXJuICEhZW50aXR5LmFjY2Vzc1thY2Nlc3NUeXBlXTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cblxufVxuIl19