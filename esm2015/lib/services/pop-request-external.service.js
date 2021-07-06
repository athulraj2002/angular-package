import { HttpBackend, HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { IsString } from '../pop-common-utility';
import { PopExtendService } from './pop-extend.service';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common/http";
export class PopRequestExternalService extends PopExtendService {
    constructor(httpBackend) {
        super();
        this.httpBackend = httpBackend;
        this.name = 'PopRequestExternalService';
        this.urlRegex = new RegExp('^(https?:\\/\\/)?' + // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
            '(\\#[-a-z\\d_]*)?$', 'i');
        this.http = new HttpClient(this.httpBackend);
    }
    getBaseUrl() {
        return this.baseUrl.slice();
    }
    setBaseUrl(baseUrl) {
        if (IsString(baseUrl, true)) {
            this.baseUrl = baseUrl;
        }
    }
    doGet(url, params = {}, headers = {}) {
        if (this._checkUrl(url)) {
            const options = {
                headers: new HttpHeaders(headers),
                params: this._setParams(params)
            };
            return this.http.get(`${url}`, options);
        }
        else {
            return of(null);
        }
    }
    doDelete(url, body = null, headers = {}) {
        if (this._checkUrl(url)) {
            const options = {
                headers: new HttpHeaders(headers),
                body: body,
            };
            return this.http.delete(url, options);
        }
        else {
            return of(null);
        }
    }
    doPatch(url, data, headers = {}) {
        if (this._checkUrl(url)) {
            const options = {
                headers: new HttpHeaders(headers),
            };
            return this.http.patch(url, JSON.stringify(data), options);
        }
        else {
            return of(null);
        }
    }
    doPost(url, data, headers = {}) {
        if (this._checkUrl(url)) {
            const options = {
                headers: new HttpHeaders(headers),
            };
            return this.http.post(url, JSON.stringify(data), options);
        }
        else {
            return of(null);
        }
    }
    _setParams(body) {
        let params = new HttpParams();
        for (const key of Object.keys(body)) {
            if (body[key]) {
                if (body[key] instanceof Array) {
                    body[key].forEach((item) => {
                        params = params.append(`${key.toString()}[]`, item);
                    });
                }
                else {
                    params = params.append(key.toString(), body[key]);
                }
            }
        }
        return params;
    }
    _checkUrl(url) {
        const valid = !!this.urlRegex.test(url);
        if (!valid) {
            throw new Error(`Invalid Url: ${url}`);
        }
        return true;
    }
}
PopRequestExternalService.ɵprov = i0.ɵɵdefineInjectable({ factory: function PopRequestExternalService_Factory() { return new PopRequestExternalService(i0.ɵɵinject(i1.HttpBackend)); }, token: PopRequestExternalService, providedIn: "root" });
PopRequestExternalService.decorators = [
    { type: Injectable, args: [{
                providedIn: 'root'
            },] }
];
PopRequestExternalService.ctorParameters = () => [
    { type: HttpBackend }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLXJlcXVlc3QtZXh0ZXJuYWwuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9zZXJ2aWNlcy9wb3AtcmVxdWVzdC1leHRlcm5hbC5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUN4RixPQUFPLEVBQVUsVUFBVSxFQUFhLE1BQU0sZUFBZSxDQUFDO0FBQzlELE9BQU8sRUFBYyxFQUFFLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDdEMsT0FBTyxFQUF5QyxRQUFRLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUV4RixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQzs7O0FBTXhELE1BQU0sT0FBTyx5QkFBMEIsU0FBUSxnQkFBZ0I7SUFhN0QsWUFDVSxXQUF3QjtRQUVoQyxLQUFLLEVBQUUsQ0FBQztRQUZBLGdCQUFXLEdBQVgsV0FBVyxDQUFhO1FBYnhCLFNBQUksR0FBRywyQkFBMkIsQ0FBQztRQUlyQyxhQUFRLEdBQUcsSUFBSSxNQUFNLENBQUUsbUJBQW1CLEdBQUcsV0FBVztZQUM5RCxrREFBa0QsR0FBRyxjQUFjO1lBQ25FLDZCQUE2QixHQUFHLHFCQUFxQjtZQUNyRCxpQ0FBaUMsR0FBRyxnQkFBZ0I7WUFDcEQsMEJBQTBCLEdBQUcsZUFBZTtZQUM1QyxvQkFBb0IsRUFBRSxHQUFHLENBQUUsQ0FBQztRQU81QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksVUFBVSxDQUFFLElBQUksQ0FBQyxXQUFXLENBQUUsQ0FBQztJQUNqRCxDQUFDO0lBR00sVUFBVTtRQUNmLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUM5QixDQUFDO0lBR00sVUFBVSxDQUFFLE9B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QUM7aUJBQ0w7cUJBQUk7b0JBQ0gsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUUsR0FBRyxDQUFDLFFBQVEsRUFBRSxFQUFFLElBQUksQ0FBRSxHQUFHLENBQUUsQ0FBRSxDQUFDO2lCQUN2RDthQUNGO1NBQ0Y7UUFDRCxPQUFPLE1BQU0sQ0FBQztJQUNoQixDQUFDO0lBR08sU0FBUyxDQUFFLEdBQVc7UUFDNUIsTUFBTSxLQUFLLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFFLEdBQUcsQ0FBRSxDQUFDO1FBQzFDLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDVixNQUFNLElBQUksS0FBSyxDQUFFLGdCQUFnQixHQUFHLEVBQUUsQ0FBRSxDQUFDO1NBQzFDO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDOzs7O1lBL0dGLFVBQVUsU0FBRTtnQkFDWCxVQUFVLEVBQUUsTUFBTTthQUNuQjs7O1lBVlEsV0FBVyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEh0dHBCYWNrZW5kLCBIdHRwQ2xpZW50LCBIdHRwSGVhZGVycywgSHR0cFBhcmFtcyB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcbmltcG9ydCB7IEluamVjdCwgSW5qZWN0YWJsZSwgaXNEZXZNb2RlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBvZiB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgQ29udmVydE9iamVjdFRvVXJpLCBJc0FycmF5LCBJc09iamVjdCwgSXNTdHJpbmcgfSBmcm9tICcuLi9wb3AtY29tbW9uLXV0aWxpdHknO1xuaW1wb3J0IHsgUG9wQnVzaW5lc3MgfSBmcm9tICcuLi9wb3AtY29tbW9uLm1vZGVsJztcbmltcG9ydCB7IFBvcEV4dGVuZFNlcnZpY2UgfSBmcm9tICcuL3BvcC1leHRlbmQuc2VydmljZSc7XG5cblxuQEluamVjdGFibGUoIHtcbiAgcHJvdmlkZWRJbjogJ3Jvb3QnXG59IClcbmV4cG9ydCBjbGFzcyBQb3BSZXF1ZXN0RXh0ZXJuYWxTZXJ2aWNlIGV4dGVuZHMgUG9wRXh0ZW5kU2VydmljZSB7XG4gIHByb3RlY3RlZCBuYW1lID0gJ1BvcFJlcXVlc3RFeHRlcm5hbFNlcnZpY2UnO1xuICBwcml2YXRlIGJhc2VVcmw6IHN0cmluZztcbiAgcHJpdmF0ZSBodHRwOiBIdHRwQ2xpZW50O1xuXG4gIHByaXZhdGUgdXJsUmVnZXggPSBuZXcgUmVnRXhwKCAnXihodHRwcz86XFxcXC9cXFxcLyk/JyArIC8vIHByb3RvY29sXG4gICAgJygoKFthLXpcXFxcZF0oW2EtelxcXFxkLV0qW2EtelxcXFxkXSkqKVxcXFwuKStbYS16XXsyLH18JyArIC8vIGRvbWFpbiBuYW1lXG4gICAgJygoXFxcXGR7MSwzfVxcXFwuKXszfVxcXFxkezEsM30pKScgKyAvLyBPUiBpcCAodjQpIGFkZHJlc3NcbiAgICAnKFxcXFw6XFxcXGQrKT8oXFxcXC9bLWEtelxcXFxkJV8ufitdKikqJyArIC8vIHBvcnQgYW5kIHBhdGhcbiAgICAnKFxcXFw/WzsmYS16XFxcXGQlXy5+Kz0tXSopPycgKyAvLyBxdWVyeSBzdHJpbmdcbiAgICAnKFxcXFwjWy1hLXpcXFxcZF9dKik/JCcsICdpJyApO1xuXG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBodHRwQmFja2VuZDogSHR0cEJhY2tlbmRcbiAgKXtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuaHR0cCA9IG5ldyBIdHRwQ2xpZW50KCB0aGlzLmh0dHBCYWNrZW5kICk7XG4gIH1cblxuXG4gIHB1YmxpYyBnZXRCYXNlVXJsKCl7XG4gICAgcmV0dXJuIHRoaXMuYmFzZVVybC5zbGljZSgpO1xuICB9XG5cblxuICBwdWJsaWMgc2V0QmFzZVVybCggYmFzZVVybDogc3RyaW5nICk6IHZvaWR7XG4gICAgaWYoIElzU3RyaW5nKCBiYXNlVXJsLCB0cnVlICkgKXtcbiAgICAgIHRoaXMuYmFzZVVybCA9IGJhc2VVcmw7XG4gICAgfVxuICB9XG5cblxuICBkb0dldCggdXJsOiBzdHJpbmcsIHBhcmFtczogb2JqZWN0ID0ge30sIGhlYWRlcnM6IHsgWyBuYW1lOiBzdHJpbmcgXTogc3RyaW5nIHwgc3RyaW5nW10gfSA9IHt9ICk6IE9ic2VydmFibGU8YW55PntcbiAgICBpZiggdGhpcy5fY2hlY2tVcmwoIHVybCApICl7XG4gICAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICBoZWFkZXJzOiBuZXcgSHR0cEhlYWRlcnMoIGhlYWRlcnMgKSxcbiAgICAgICAgcGFyYW1zOiB0aGlzLl9zZXRQYXJhbXMoIHBhcmFtcyApXG4gICAgICB9O1xuXG4gICAgICByZXR1cm4gdGhpcy5odHRwLmdldDxhbnk+KCBgJHsgdXJsIH1gLCBvcHRpb25zICk7XG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4gb2YoIG51bGwgKTtcbiAgICB9XG4gIH1cblxuXG4gIGRvRGVsZXRlKCB1cmw6IHN0cmluZywgYm9keTogb2JqZWN0ID0gbnVsbCwgaGVhZGVyczogeyBbIG5hbWU6IHN0cmluZyBdOiBzdHJpbmcgfCBzdHJpbmdbXSB9ID0ge30gKTogT2JzZXJ2YWJsZTxhbnk+e1xuICAgIGlmKCB0aGlzLl9jaGVja1VybCggdXJsICkgKXtcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICAgIGhlYWRlcnM6IG5ldyBIdHRwSGVhZGVycyggaGVhZGVycyApLFxuICAgICAgICBib2R5OiBib2R5LFxuICAgICAgfTtcbiAgICAgIHJldHVybiB0aGlzLmh0dHAuZGVsZXRlPGFueT4oIHVybCwgb3B0aW9ucyApO1xuICAgIH1lbHNle1xuICAgICAgcmV0dXJuIG9mKCBudWxsICk7XG4gICAgfVxuICB9XG5cblxuICBkb1BhdGNoKCB1cmw6IHN0cmluZywgZGF0YTogb2JqZWN0LCBoZWFkZXJzOiB7IFsgbmFtZTogc3RyaW5nIF06IHN0cmluZyB8IHN0cmluZ1tdIH0gPSB7fSApOiBPYnNlcnZhYmxlPGFueT57XG4gICAgaWYoIHRoaXMuX2NoZWNrVXJsKCB1cmwgKSApe1xuICAgICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgICAgaGVhZGVyczogbmV3IEh0dHBIZWFkZXJzKCBoZWFkZXJzICksXG4gICAgICB9O1xuICAgICAgcmV0dXJuIHRoaXMuaHR0cC5wYXRjaCggdXJsLCBKU09OLnN0cmluZ2lmeSggZGF0YSApLCBvcHRpb25zICk7XG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4gb2YoIG51bGwgKTtcbiAgICB9XG4gIH1cblxuXG4gIGRvUG9zdCggdXJsOiBzdHJpbmcsIGRhdGE6IG9iamVjdCwgaGVhZGVyczogeyBbIG5hbWU6IHN0cmluZyBdOiBzdHJpbmcgfCBzdHJpbmdbXSB9ID0ge30gKTogT2JzZXJ2YWJsZTxhbnk+e1xuICAgIGlmKCB0aGlzLl9jaGVja1VybCggdXJsICkgKXtcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICAgIGhlYWRlcnM6IG5ldyBIdHRwSGVhZGVycyggaGVhZGVycyApLFxuICAgICAgfTtcbiAgICAgIHJldHVybiB0aGlzLmh0dHAucG9zdDxhbnk+KCB1cmwsIEpTT04uc3RyaW5naWZ5KCBkYXRhICksIG9wdGlvbnMgKTtcbiAgICB9ZWxzZXtcbiAgICAgIHJldHVybiBvZiggbnVsbCApO1xuICAgIH1cblxuICB9XG5cblxuICBwcml2YXRlIF9zZXRQYXJhbXMoIGJvZHkgKXtcbiAgICBsZXQgcGFyYW1zOiBIdHRwUGFyYW1zID0gbmV3IEh0dHBQYXJhbXMoKTtcbiAgICBmb3IoIGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyggYm9keSApICl7XG4gICAgICBpZiggYm9keVsga2V5IF0gKXtcbiAgICAgICAgaWYoIGJvZHlbIGtleSBdIGluc3RhbmNlb2YgQXJyYXkgKXtcbiAgICAgICAgICBib2R5WyBrZXkgXS5mb3JFYWNoKCAoIGl0ZW0gKSA9PiB7XG4gICAgICAgICAgICBwYXJhbXMgPSBwYXJhbXMuYXBwZW5kKCBgJHtrZXkudG9TdHJpbmcoKX1bXWAsIGl0ZW0gKTtcbiAgICAgICAgICB9ICk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHBhcmFtcyA9IHBhcmFtcy5hcHBlbmQoIGtleS50b1N0cmluZygpLCBib2R5WyBrZXkgXSApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBwYXJhbXM7XG4gIH1cblxuXG4gIHByaXZhdGUgX2NoZWNrVXJsKCB1cmw6IHN0cmluZyApOiBib29sZWFue1xuICAgIGNvbnN0IHZhbGlkID0gISF0aGlzLnVybFJlZ2V4LnRlc3QoIHVybCApO1xuICAgIGlmKCAhdmFsaWQgKXtcbiAgICAgIHRocm93IG5ldyBFcnJvciggYEludmFsaWQgVXJsOiAke3VybH1gICk7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG59XG5cbiJdfQ==