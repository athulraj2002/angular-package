import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { PopBaseService } from './pop-base.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
export declare class HeaderInterceptor implements HttpInterceptor {
    private base;
    constructor(base: PopBaseService);
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>;
}
export declare class Response401Interceptor implements HttpInterceptor {
    private baseService;
    private router;
    constructor(baseService: PopBaseService, router: Router);
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>;
}
