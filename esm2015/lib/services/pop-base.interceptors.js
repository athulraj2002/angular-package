import { Injectable, isDevMode } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { PopBaseService } from './pop-base.service';
import { tap, catchError } from 'rxjs/operators';
import { PopHref, PopTemplate, SetPopMessage } from '../pop-common.model';
import { GetHttpErrorMsg, IsObject, SetSiteVar } from '../pop-common-utility';
import { Router } from '@angular/router';
export class HeaderInterceptor {
    constructor(base) {
        this.base = base;
    }
    intercept(request, next) {
        let headers;
        // If SkipHeaderInterceptor has been set then skip this interceptor
        if (request.headers.has('SkipAuthHeaderInterceptor')) {
            headers = request.headers.delete('SkipAuthHeaderInterceptor');
            return next.handle(request.clone({ headers }));
        }
        headers = new HttpHeaders({
            'Authorization': this.base.getBearerToken(),
            'X-Popcx-Business': request.headers.get('x-popcx-business'),
            'Content-Type': request.headers.get('content-type') || 'application/json',
            'Api-Version': request.headers.get('api-version') || '1',
        });
        const newReq = request.clone({ headers });
        // send cloned request with header to the next handler.
        return next.handle(newReq);
    }
}
HeaderInterceptor.decorators = [
    { type: Injectable }
];
HeaderInterceptor.ctorParameters = () => [
    { type: PopBaseService }
];
export class Response401Interceptor {
    constructor(baseService, router) {
        this.baseService = baseService;
        this.router = router;
    }
    intercept(request, next) {
        // If SkipResponse401Interceptor has been set then skip this interceptor.
        if (request && request.headers && request.headers.has('SkipResponse401Interceptor')) {
            const headers = request.headers.delete('SkipResponse401Interceptor');
            return next.handle(request.clone({ headers }));
        }
        return next.handle(request).pipe(tap(() => {
            this.baseService.setAuthTime();
        }), catchError((err) => {
            const currentPath = window.location.href.split(PopHref)[1];
            if (err.status >= 500) {
                const message = GetHttpErrorMsg(err);
                if (currentPath && !currentPath.includes('error/500')) {
                    SetPopMessage((isDevMode() ? message : 'Something went wrong!'));
                    this.router.navigate(['system/error/500'], { skipLocationChange: true });
                }
            }
            else if (err.status === 403) {
                const message = GetHttpErrorMsg(err);
                if (message === 'Your email address is not verified.') {
                    if (currentPath && !currentPath.includes('/user/email/resend')) {
                        window.location.href = window.location.protocol + '//' + window.location.host + '/user/email/resend';
                    }
                }
                else {
                    if (currentPath && !currentPath.includes('error/403')) {
                        SetPopMessage(isDevMode() ? message : 'Access Denied!');
                        this.router.navigate(['system/error/403'], { skipLocationChange: true });
                    }
                }
            }
            else if (err.status === 404) {
                const message = GetHttpErrorMsg(err);
                if (currentPath && !currentPath.includes('error/404')) {
                    SetPopMessage(isDevMode() ? message : 'Something went wrong!');
                    this.router.navigate(['system/error/404'], { skipLocationChange: true });
                }
            }
            else if (err.status === 401) {
                if (isDevMode()) {
                    if (IsObject(PopTemplate)) {
                        PopTemplate.error({ code: 401, message: 'UNAUTHENTICATED' });
                    }
                }
                else {
                    SetSiteVar('redirectAfterLogin', window.location.href);
                    this.baseService.clearAuthTime();
                    this.baseService.clearLocalStorage();
                    window.location.href = window.location.protocol + '//' + window.location.host + '/user/legacy/auth/clear';
                }
            }
            else {
                return next.handle(request);
            }
        }));
    }
}
Response401Interceptor.decorators = [
    { type: Injectable }
];
Response401Interceptor.ctorParameters = () => [
    { type: PopBaseService },
    { type: Router }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWJhc2UuaW50ZXJjZXB0b3JzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL3NlcnZpY2VzL3BvcC1iYXNlLmludGVyY2VwdG9ycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUMsVUFBVSxFQUFFLFNBQVMsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNwRCxPQUFPLEVBTUwsV0FBVyxFQUNaLE1BQU0sc0JBQXNCLENBQUM7QUFDOUIsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBRWxELE9BQU8sRUFBQyxHQUFHLEVBQUUsVUFBVSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDL0MsT0FBTyxFQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUUsYUFBYSxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDeEUsT0FBTyxFQUFDLGVBQWUsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDNUUsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBSXZDLE1BQU0sT0FBTyxpQkFBaUI7SUFFNUIsWUFBb0IsSUFBb0I7UUFBcEIsU0FBSSxHQUFKLElBQUksQ0FBZ0I7SUFDeEMsQ0FBQztJQUdELFNBQVMsQ0FBQyxPQUF5QixFQUFFLElBQWlCO1FBRXBELElBQUksT0FBTyxDQUFDO1FBQ1osbUVBQW1FO1FBQ25FLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsMkJBQTJCLENBQUMsRUFBRTtZQUNwRCxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsMkJBQTJCLENBQUMsQ0FBQztZQUM5RCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFDLE9BQU8sRUFBQyxDQUFDLENBQUMsQ0FBQztTQUM5QztRQUVELE9BQU8sR0FB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QUFpQixFQUFFLENBQUM7b0JBQ3JDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxHQUFHLElBQUksR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyx5QkFBeUIsQ0FBQztpQkFDM0c7YUFDRjtpQkFBTTtnQkFDTCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDN0I7UUFDSCxDQUFDLENBQUMsQ0FDSCxDQUFDO0lBQ0osQ0FBQzs7O1lBakVGLFVBQVU7OztZQXRDSCxjQUFjO1lBS2QsTUFBTSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZSwgaXNEZXZNb2RlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7XG4gIEh0dHBFdmVudCxcbiAgSHR0cEludGVyY2VwdG9yLFxuICBIdHRwSGFuZGxlcixcbiAgSHR0cFJlcXVlc3QsXG4gIEh0dHBFcnJvclJlc3BvbnNlLFxuICBIdHRwSGVhZGVyc1xufSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5pbXBvcnQge1BvcEJhc2VTZXJ2aWNlfSBmcm9tICcuL3BvcC1iYXNlLnNlcnZpY2UnO1xuaW1wb3J0IHtPYnNlcnZhYmxlfSBmcm9tICdyeGpzJztcbmltcG9ydCB7dGFwLCBjYXRjaEVycm9yfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQge1BvcEhyZWYsIFBvcFRlbXBsYXRlLCBTZXRQb3BNZXNzYWdlfSBmcm9tICcuLi9wb3AtY29tbW9uLm1vZGVsJztcbmltcG9ydCB7R2V0SHR0cEVycm9yTXNnLCBJc09iamVjdCwgU2V0U2l0ZVZhcn0gZnJvbSAnLi4vcG9wLWNvbW1vbi11dGlsaXR5JztcbmltcG9ydCB7Um91dGVyfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xuXG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBIZWFkZXJJbnRlcmNlcHRvciBpbXBsZW1lbnRzIEh0dHBJbnRlcmNlcHRvciB7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBiYXNlOiBQb3BCYXNlU2VydmljZSkge1xuICB9XG5cblxuICBpbnRlcmNlcHQocmVxdWVzdDogSHR0cFJlcXVlc3Q8YW55PiwgbmV4dDogSHR0cEhhbmRsZXIpIHtcblxuICAgIGxldCBoZWFkZXJzO1xuICAgIC8vIElmIFNraXBIZWFkZXJJbnRlcmNlcHRvciBoYXMgYmVlbiBzZXQgdGhlbiBza2lwIHRoaXMgaW50ZXJjZXB0b3JcbiAgICBpZiAocmVxdWVzdC5oZWFkZXJzLmhhcygnU2tpcEF1dGhIZWFkZXJJbnRlcmNlcHRvcicpKSB7XG4gICAgICBoZWFkZXJzID0gcmVxdWVzdC5oZWFkZXJzLmRlbGV0ZSgnU2tpcEF1dGhIZWFkZXJJbnRlcmNlcHRvcicpO1xuICAgICAgcmV0dXJuIG5leHQuaGFuZGxlKHJlcXVlc3QuY2xvbmUoe2hlYWRlcnN9KSk7XG4gICAgfVxuXG4gICAgaGVhZGVycyA9IG5ldyBIdHRwSGVhZGVycyh7XG4gICAgICAnQXV0aG9yaXphdGlvbic6IHRoaXMuYmFzZS5nZXRCZWFyZXJUb2tlbigpLFxuICAgICAgJ1gtUG9wY3gtQnVzaW5lc3MnOiByZXF1ZXN0LmhlYWRlcnMuZ2V0KCd4LXBvcGN4LWJ1c2luZXNzJyksXG4gICAgICAnQ29udGVudC1UeXBlJzogcmVxdWVzdC5oZWFkZXJzLmdldCgnY29udGVudC10eXBlJykgfHwgJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgJ0FwaS1WZXJzaW9uJzogcmVxdWVzdC5oZWFkZXJzLmdldCgnYXBpLXZlcnNpb24nKSB8fCAnMScsXG4gICAgfSk7XG4gICAgY29uc3QgbmV3UmVxID0gcmVxdWVzdC5jbG9uZSh7aGVhZGVyc30pO1xuXG4gICAgLy8gc2VuZCBjbG9uZWQgcmVxdWVzdCB3aXRoIGhlYWRlciB0byB0aGUgbmV4dCBoYW5kbGVyLlxuICAgIHJldHVybiBuZXh0LmhhbmRsZShuZXdSZXEpO1xuICB9XG59XG5cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFJlc3BvbnNlNDAxSW50ZXJjZXB0b3IgaW1wbGVtZW50cyBIdHRwSW50ZXJjZXB0b3Ige1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgYmFzZVNlcnZpY2U6IFBvcEJhc2VTZXJ2aWNlLFxuICAgIHByaXZhdGUgcm91dGVyOiBSb3V0ZXJcbiAgKSB7XG4gIH1cblxuXG4gIGludGVyY2VwdChyZXF1ZXN0OiBIdHRwUmVxdWVzdDxhbnk+LCBuZXh0OiBIdHRwSGFuZGxlcik6IE9ic2VydmFibGU8SHR0cEV2ZW50PGFueT4+IHtcblxuICAgIC8vIElmIFNraXBSZXNwb25zZTQwMUludGVyY2VwdG9yIGhhcyBiZWVuIHNldCB0aGVuIHNraXAgdGhpcyBpbnRlcmNlcHRvci5cbiAgICBpZiAocmVxdWVzdCAmJiByZXF1ZXN0LmhlYWRlcnMgJiYgcmVxdWVzdC5oZWFkZXJzLmhhcygnU2tpcFJlc3BvbnNlNDAxSW50ZXJjZXB0b3InKSkge1xuICAgICAgY29uc3QgaGVhZGVycyA9IHJlcXVlc3QuaGVhZGVycy5kZWxldGUoJ1NraXBSZXNwb25zZTQwMUludGVyY2VwdG9yJyk7XG4gICAgICByZXR1cm4gbmV4dC5oYW5kbGUocmVxdWVzdC5jbG9uZSh7aGVhZGVyc30pKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV4dC5oYW5kbGUocmVxdWVzdCkucGlwZShcbiAgICAgIHRhcCgoKSA9PiB7XG4gICAgICAgIHRoaXMuYmFzZVNlcnZpY2Uuc2V0QXV0aFRpbWUoKTtcbiAgICAgIH0pLFxuICAgICAgY2F0Y2hFcnJvcigoZXJyOiBIdHRwRXJyb3JSZXNwb25zZSkgPT4ge1xuICAgICAgICBjb25zdCBjdXJyZW50UGF0aCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLnNwbGl0KFBvcEhyZWYpWzFdO1xuICAgICAgICBpZiAoZXJyLnN0YXR1cyA+PSA1MDApIHtcbiAgICAgICAgICBjb25zdCBtZXNzYWdlID0gR2V0SHR0cEVycm9yTXNnKGVycik7XG4gICAgICAgICAgaWYgKGN1cnJlbnRQYXRoICYmICFjdXJyZW50UGF0aC5pbmNsdWRlcygnZXJyb3IvNTAwJykpIHtcbiAgICAgICAgICAgIFNldFBvcE1lc3NhZ2UoKGlzRGV2TW9kZSgpID8gbWVzc2FnZSA6ICdTb21ldGhpbmcgd2VudCB3cm9uZyEnKSk7XG4gICAgICAgICAgICB0aGlzLnJvdXRlci5uYXZpZ2F0ZShbJ3N5c3RlbS9lcnJvci81MDAnXSwge3NraXBMb2NhdGlvbkNoYW5nZTogdHJ1ZX0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChlcnIuc3RhdHVzID09PSA0MDMpIHtcbiAgICAgICAgICBjb25zdCBtZXNzYWdlID0gR2V0SHR0cEVycm9yTXNnKGVycik7XG5cbiAgICAgICAgICBpZiAobWVzc2FnZSA9PT0gJ1lvdXIgZW1haWwgYWRkcmVzcyBpcyBub3QgdmVyaWZpZWQuJykge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRQYXRoICYmICFjdXJyZW50UGF0aC5pbmNsdWRlcygnL3VzZXIvZW1haWwvcmVzZW5kJykpIHtcbiAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSB3aW5kb3cubG9jYXRpb24ucHJvdG9jb2wgKyAnLy8nICsgd2luZG93LmxvY2F0aW9uLmhvc3QgKyAnL3VzZXIvZW1haWwvcmVzZW5kJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRQYXRoICYmICFjdXJyZW50UGF0aC5pbmNsdWRlcygnZXJyb3IvNDAzJykpIHtcbiAgICAgICAgICAgICAgU2V0UG9wTWVzc2FnZShpc0Rldk1vZGUoKSA/IG1lc3NhZ2UgOiAnQWNjZXNzIERlbmllZCEnKTtcbiAgICAgICAgICAgICAgdGhpcy5yb3V0ZXIubmF2aWdhdGUoWydzeXN0ZW0vZXJyb3IvNDAzJ10sIHtza2lwTG9jYXRpb25DaGFuZ2U6IHRydWV9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoZXJyLnN0YXR1cyA9PT0gNDA0KSB7XG4gICAgICAgICAgY29uc3QgbWVzc2FnZSA9IEdldEh0dHBFcnJvck1zZyhlcnIpO1xuICAgICAgICAgIGlmIChjdXJyZW50UGF0aCAmJiAhY3VycmVudFBhdGguaW5jbHVkZXMoJ2Vycm9yLzQwNCcpKSB7XG4gICAgICAgICAgICBTZXRQb3BNZXNzYWdlKGlzRGV2TW9kZSgpID8gbWVzc2FnZSA6ICdTb21ldGhpbmcgd2VudCB3cm9uZyEnKTtcbiAgICAgICAgICAgIHRoaXMucm91dGVyLm5hdmlnYXRlKFsnc3lzdGVtL2Vycm9yLzQwNCddLCB7c2tpcExvY2F0aW9uQ2hhbmdlOiB0cnVlfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGVyci5zdGF0dXMgPT09IDQwMSkge1xuICAgICAgICAgIGlmIChpc0Rldk1vZGUoKSkge1xuICAgICAgICAgICAgaWYgKElzT2JqZWN0KFBvcFRlbXBsYXRlKSkge1xuICAgICAgICAgICAgICBQb3BUZW1wbGF0ZS5lcnJvcih7Y29kZTogNDAxLCBtZXNzYWdlOiAnVU5BVVRIRU5USUNBVEVEJ30pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBTZXRTaXRlVmFyKCdyZWRpcmVjdEFmdGVyTG9naW4nLCB3aW5kb3cubG9jYXRpb24uaHJlZik7XG4gICAgICAgICAgICB0aGlzLmJhc2VTZXJ2aWNlLmNsZWFyQXV0aFRpbWUoKTtcbiAgICAgICAgICAgIHRoaXMuYmFzZVNlcnZpY2UuY2xlYXJMb2NhbFN0b3JhZ2UoKTtcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gd2luZG93LmxvY2F0aW9uLnByb3RvY29sICsgJy8vJyArIHdpbmRvdy5sb2NhdGlvbi5ob3N0ICsgJy91c2VyL2xlZ2FjeS9hdXRoL2NsZWFyJztcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIG5leHQuaGFuZGxlKHJlcXVlc3QpO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICk7XG4gIH1cbn1cblxuIl19