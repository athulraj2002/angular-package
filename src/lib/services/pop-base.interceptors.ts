import {Injectable, isDevMode} from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
  HttpHeaders
} from '@angular/common/http';
import {PopBaseService} from './pop-base.service';
import {Observable} from 'rxjs';
import {tap, catchError} from 'rxjs/operators';
import {PopHref, PopTemplate, SetPopMessage} from '../pop-common.model';
import {GetHttpErrorMsg, IsObject, SetSiteVar} from '../pop-common-utility';
import {Router} from '@angular/router';


@Injectable()
export class HeaderInterceptor implements HttpInterceptor {

  constructor(private base: PopBaseService) {
  }


  intercept(request: HttpRequest<any>, next: HttpHandler) {

    let headers;
    // If SkipHeaderInterceptor has been set then skip this interceptor
    if (request.headers.has('SkipAuthHeaderInterceptor')) {
      headers = request.headers.delete('SkipAuthHeaderInterceptor');
      return next.handle(request.clone({headers}));
    }

    headers = new HttpHeaders({
      'Authorization': this.base.getBearerToken(),
      'X-Popcx-Business': request.headers.get('x-popcx-business'),
      'Content-Type': request.headers.get('content-type') || 'application/json',
      'Api-Version': request.headers.get('api-version') || '1',
    });
    const newReq = request.clone({headers});

    // send cloned request with header to the next handler.
    return next.handle(newReq);
  }
}


@Injectable()
export class Response401Interceptor implements HttpInterceptor {

  constructor(
    private baseService: PopBaseService,
    private router: Router
  ) {
  }


  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    // If SkipResponse401Interceptor has been set then skip this interceptor.
    if (request && request.headers && request.headers.has('SkipResponse401Interceptor')) {
      const headers = request.headers.delete('SkipResponse401Interceptor');
      return next.handle(request.clone({headers}));
    }

    return next.handle(request).pipe(
      tap(() => {
        this.baseService.setAuthTime();
      }),
      catchError((err: HttpErrorResponse) => {
        const currentPath = window.location.href.split(PopHref)[1];
        if (err.status >= 500) {
          const message = GetHttpErrorMsg(err);
          if (currentPath && !currentPath.includes('error/500')) {
            SetPopMessage((isDevMode() ? message : 'Something went wrong!'));
            this.router.navigate(['system/error/500'], {skipLocationChange: true});
          }
        } else if (err.status === 403) {
          const message = GetHttpErrorMsg(err);

          if (message === 'Your email address is not verified.') {
            if (currentPath && !currentPath.includes('/user/email/resend')) {
              window.location.href = window.location.protocol + '//' + window.location.host + '/user/email/resend';
            }
          } else {
            if (currentPath && !currentPath.includes('error/403')) {
              SetPopMessage(isDevMode() ? message : 'Access Denied!');
              this.router.navigate(['system/error/403'], {skipLocationChange: true});
            }
          }
        } else if (err.status === 404) {
          const message = GetHttpErrorMsg(err);
          if (currentPath && !currentPath.includes('error/404')) {
            SetPopMessage(isDevMode() ? message : 'Something went wrong!');
            this.router.navigate(['system/error/404'], {skipLocationChange: true});
          }
        } else if (err.status === 401) {
          if (isDevMode()) {
            if (IsObject(PopTemplate)) {
              PopTemplate.error({code: 401, message: 'UNAUTHENTICATED'});
            }
          } else {
            SetSiteVar('redirectAfterLogin', window.location.href);
            this.baseService.clearAuthTime();
            this.baseService.clearLocalStorage();
            window.location.href = window.location.protocol + '//' + window.location.host + '/user/legacy/auth/clear';
          }
        } else {
          return next.handle(request);
        }
      })
    );
  }
}

