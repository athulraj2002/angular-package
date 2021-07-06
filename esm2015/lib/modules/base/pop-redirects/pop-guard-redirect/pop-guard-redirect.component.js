import { __awaiter } from "tslib";
import { Component, isDevMode } from '@angular/core';
import { IsObject, IsString, RandomArrayElement } from '../../../../pop-common-utility';
import { PopExtendComponent } from '../../../../pop-extend.component';
import { PopBusiness, PopHref } from '../../../../pop-common.model';
import { Router } from '@angular/router';
import { PopBaseService } from "../../../../services/pop-base.service";
export class PopGuardRedirectComponent extends PopExtendComponent {
    constructor(_baseRepo, _routerRepo) {
        super();
        this._baseRepo = _baseRepo;
        this._routerRepo = _routerRepo;
        this.srv = {
            base: undefined,
            router: undefined
        };
        this.asset = {
            sentimentIndex: 0,
            sentiments: [
                'sentiment_very_dissatisfied',
                'sentiment_dissatisfied',
                'sentiment_satisfied',
                'sentiment_satisfied_alt',
                'sentiment_very_satisfied',
            ],
            exclamations: [
                `DUH!`,
                `THIS SUCKS!`,
                `TRY AGAIN!`,
                `WASN'T ME!`,
                `SHOOT!`,
                `GO HOME, I'M DRUNK!`,
                `Y U NO FIND ROUTE!`,
                `WHERE AM I!`,
            ],
            route: undefined
        };
        this.ui = {
            exclamation: undefined,
            sentiment: undefined,
            spinner: undefined,
        };
        this.dom.configure = () => {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                yield Promise.all([
                    this.setInitialConfig()
                ]);
                // this._improveSentiment();
                // this._routeApp();
                return resolve(true);
            }));
        };
    }
    ngOnInit() {
        super.ngOnInit();
    }
    ngOnDestroy() {
        super.ngOnDestroy();
    }
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    setInitialConfig() {
        return new Promise((resolve) => {
            this.dom.state.isDevMode = isDevMode();
            this.ui.sentiment = this.asset.sentiments[this.asset.sentimentIndex];
            this.ui.exclamation = RandomArrayElement(this.asset.exclamations);
            this.asset.route = this.srv.router.config.find((r) => {
                return IsString(r.path, true) && !r.canActivate && !r.redirectTo;
            });
            this.ui.spinner = {
                color: 'accent'
            };
            return resolve(true);
        });
    }
    _improveSentiment() {
        this.dom.setTimeout(`improve-sentiment`, () => {
            if (this.asset.sentiments[this.asset.sentimentIndex + 1]) {
                this.asset.sentimentIndex++;
                this.ui.sentiment = this.asset.sentiments[this.asset.sentimentIndex];
                this._improveSentiment();
            }
            else {
                this.dom.setTimeout(`improve-sentiment`, null);
                this.ui.exclamation = 'ALL GOOD!';
                this._routeApp();
            }
        }, 400);
    }
    /**
     *
     * @private
     */
    _routeApp() {
        this.dom.setTimeout(`re-route`, () => {
            if (IsObject(PopBusiness, ['id'])) {
                if (IsObject(this.asset.route, ['path'])) {
                    console.log('DIAGNOSE Redirect ISSUE: Redirect Path', this.asset.route.path);
                    if (this.srv.base.checkAppAccess(PopHref, true)) {
                        this.srv.router.navigateByUrl(this.asset.route.path).catch((e) => console.log('e', e));
                    }
                }
                else {
                    if (!this.dom.state.isDevMode && IsString(PopHref, true) && PopHref !== 'home')
                        window.location.href = window.location.protocol + '//' + window.location.host + '/home';
                }
            }
            else {
                if (!this.dom.state.isDevMode && IsString(PopHref, true) && PopHref !== 'user')
                    window.location.href = window.location.protocol + '//' + window.location.host + '/user/profile';
            }
        }, 400);
    }
}
PopGuardRedirectComponent.decorators = [
    { type: Component, args: [{
                selector: 'lib-pop-guard-redirect',
                template: "<!--  <mat-icon class=\"pgr-icon\">{{ui.sentiment}}</mat-icon>-->\n<!--  <div class=\"pgr-message\">{{ui.exclamation}}</div>-->\n<div class=\"pgr-container\" *ngIf=\"dom.state.isDevMode\">\n  <mat-card>\n    <mat-card-content>\n      <div class=\"pcg-spinner-box\">\n        <!-- <lib-main-spinner [options]=\"ui.spinner\"></lib-main-spinner> -->\n\n      </div>\n    </mat-card-content>\n  </mat-card>\n</div>\n\n<div class=\"pcr-container\" *ngIf=\"!dom.state.isDevMode\">\n  <mat-card>\n    <mat-card-content>\n      <div class=\"pgr-spinner-box\">\n        <lib-main-spinner></lib-main-spinner>\n      </div>\n    </mat-card-content>\n  </mat-card>\n</div>\n\n",
                styles: [".pgr-container{display:flex;flex-direction:column;padding:var(--gap-s);box-sizing:border-box;justify-content:center;align-items:center;height:calc(100vh - 90px)}.pgr-container mat-card{width:300px}.pgr-container mat-card-title{text-align:center;margin-bottom:var(--gap-m)!important}.pgr-container form{margin:var(--gap-s) 0!important}.pgr-icon{position:relative;font-size:250px;color:var(--accent);width:250px;height:250px;top:-125px}.pgr-message{padding:var(--gap-s);width:400px;height:20px;display:flex;flex-direction:column;justify-content:center;align-items:center;font-size:var(--gap-lm)}.pcg-spinner-box{height:80vh}"]
            },] }
];
PopGuardRedirectComponent.ctorParameters = () => [
    { type: PopBaseService },
    { type: Router }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWd1YXJkLXJlZGlyZWN0LmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2Jhc2UvcG9wLXJlZGlyZWN0cy9wb3AtZ3VhcmQtcmVkaXJlY3QvcG9wLWd1YXJkLXJlZGlyZWN0LmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFDLFNBQVMsRUFBRSxTQUFTLEVBQW9CLE1BQU0sZUFBZSxDQUFDO0FBQ3RFLE9BQU8sRUFBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLGtCQUFrQixFQUFRLE1BQU0sZ0NBQWdDLENBQUM7QUFDN0YsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sa0NBQWtDLENBQUM7QUFDcEUsT0FBTyxFQUFDLFdBQVcsRUFBRSxPQUFPLEVBQUMsTUFBTSw4QkFBOEIsQ0FBQztBQUNsRSxPQUFPLEVBQVEsTUFBTSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDOUMsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLHVDQUF1QyxDQUFDO0FBU3JFLE1BQU0sT0FBTyx5QkFBMEIsU0FBUSxrQkFBa0I7SUFvQy9ELFlBQ1ksU0FBeUIsRUFDekIsV0FBbUI7UUFFN0IsS0FBSyxFQUFFLENBQUM7UUFIRSxjQUFTLEdBQVQsU0FBUyxDQUFnQjtRQUN6QixnQkFBVyxHQUFYLFdBQVcsQ0FBUTtRQXBDckIsUUFBRyxHQUFHO1lBQ2QsSUFBSSxFQUFrQixTQUFTO1lBQy9CLE1BQU0sRUFBVSxTQUFTO1NBQzFCLENBQUM7UUFFUSxVQUFLLEdBQUc7WUFDaEIsY0FBYyxFQUFFLENBQUM7WUFDakIsVUFBVSxFQUFFO2dCQUNWLDZCQUE2QjtnQkFDN0Isd0JBQXdCO2dCQUN4QixxQkFBcUI7Z0JBQ3JCLHlCQUF5QjtnQkFDekIsMEJBQTBCO2FBQzNCO1lBQ0QsWUFBWSxFQUFFO2dCQUNaLE1BQU07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QUFJLENBQUMsSUFBSSxPQUFPLEtBQUssTUFBTTtvQkFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsR0FBRyxJQUFJLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsZUFBZSxDQUFDO2FBQ2pMO1FBQ0gsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ1YsQ0FBQzs7O1lBbElGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsd0JBQXdCO2dCQUNsQyxvcUJBQWtEOzthQUVuRDs7O1lBUk8sY0FBYztZQURQLE1BQU0iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NvbXBvbmVudCwgaXNEZXZNb2RlLCBPbkRlc3Ryb3ksIE9uSW5pdH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0lzT2JqZWN0LCBJc1N0cmluZywgUmFuZG9tQXJyYXlFbGVtZW50LCBTbGVlcH0gZnJvbSAnLi4vLi4vLi4vLi4vcG9wLWNvbW1vbi11dGlsaXR5JztcbmltcG9ydCB7UG9wRXh0ZW5kQ29tcG9uZW50fSBmcm9tICcuLi8uLi8uLi8uLi9wb3AtZXh0ZW5kLmNvbXBvbmVudCc7XG5pbXBvcnQge1BvcEJ1c2luZXNzLCBQb3BIcmVmfSBmcm9tICcuLi8uLi8uLi8uLi9wb3AtY29tbW9uLm1vZGVsJztcbmltcG9ydCB7Um91dGUsIFJvdXRlcn0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcbmltcG9ydCB7UG9wQmFzZVNlcnZpY2V9IGZyb20gXCIuLi8uLi8uLi8uLi9zZXJ2aWNlcy9wb3AtYmFzZS5zZXJ2aWNlXCI7XG5pbXBvcnQge01haW5TcGlubmVyfSBmcm9tIFwiLi4vLi4vcG9wLWluZGljYXRvcnMvcG9wLWluZGljYXRvcnMubW9kZWxcIjtcblxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdsaWItcG9wLWd1YXJkLXJlZGlyZWN0JyxcbiAgdGVtcGxhdGVVcmw6ICcuL3BvcC1ndWFyZC1yZWRpcmVjdC5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWycuL3BvcC1ndWFyZC1yZWRpcmVjdC5jb21wb25lbnQuc2NzcyddXG59KVxuZXhwb3J0IGNsYXNzIFBvcEd1YXJkUmVkaXJlY3RDb21wb25lbnQgZXh0ZW5kcyBQb3BFeHRlbmRDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG5cbiAgcHJvdGVjdGVkIHNydiA9IHtcbiAgICBiYXNlOiA8UG9wQmFzZVNlcnZpY2U+dW5kZWZpbmVkLFxuICAgIHJvdXRlcjogPFJvdXRlcj51bmRlZmluZWRcbiAgfTtcblxuICBwcm90ZWN0ZWQgYXNzZXQgPSB7XG4gICAgc2VudGltZW50SW5kZXg6IDAsXG4gICAgc2VudGltZW50czogW1xuICAgICAgJ3NlbnRpbWVudF92ZXJ5X2Rpc3NhdGlzZmllZCcsXG4gICAgICAnc2VudGltZW50X2Rpc3NhdGlzZmllZCcsXG4gICAgICAnc2VudGltZW50X3NhdGlzZmllZCcsXG4gICAgICAnc2VudGltZW50X3NhdGlzZmllZF9hbHQnLFxuICAgICAgJ3NlbnRpbWVudF92ZXJ5X3NhdGlzZmllZCcsXG4gICAgXSxcbiAgICBleGNsYW1hdGlvbnM6IFtcbiAgICAgIGBEVUghYCxcbiAgICAgIGBUSElTIFNVQ0tTIWAsXG4gICAgICBgVFJZIEFHQUlOIWAsXG4gICAgICBgV0FTTidUIE1FIWAsXG4gICAgICBgU0hPT1QhYCxcbiAgICAgIGBHTyBIT01FLCBJJ00gRFJVTkshYCxcbiAgICAgIGBZIFUgTk8gRklORCBST1VURSFgLFxuICAgICAgYFdIRVJFIEFNIEkhYCxcbiAgICBdLFxuICAgIHJvdXRlOiA8Um91dGU+dW5kZWZpbmVkXG4gIH07XG5cbiAgcHVibGljIHVpID0ge1xuICAgIGV4Y2xhbWF0aW9uOiA8c3RyaW5nPnVuZGVmaW5lZCxcbiAgICBzZW50aW1lbnQ6IDxzdHJpbmc+dW5kZWZpbmVkLFxuICAgIHNwaW5uZXI6IDxNYWluU3Bpbm5lcj51bmRlZmluZWQsXG4gIH07XG5cblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcm90ZWN0ZWQgX2Jhc2VSZXBvOiBQb3BCYXNlU2VydmljZSxcbiAgICBwcm90ZWN0ZWQgX3JvdXRlclJlcG86IFJvdXRlcixcbiAgKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuZG9tLmNvbmZpZ3VyZSA9ICgpID0+IHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxib29sZWFuPihhc3luYyAocmVzb2x2ZSkgPT4ge1xuXG4gICAgICAgIGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgICB0aGlzLnNldEluaXRpYWxDb25maWcoKVxuICAgICAgICBdKTtcblxuICAgICAgICAvLyB0aGlzLl9pbXByb3ZlU2VudGltZW50KCk7XG4gICAgICAgIC8vIHRoaXMuX3JvdXRlQXBwKCk7XG5cbiAgICAgICAgcmV0dXJuIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gIH1cblxuXG4gIG5nT25Jbml0KCk6IHZvaWQge1xuICAgIHN1cGVyLm5nT25Jbml0KCk7XG4gIH1cblxuXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIHN1cGVyLm5nT25EZXN0cm95KCk7XG4gIH1cblxuXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVW5kZXIgVGhlIEhvb2QgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBQcml2YXRlIE1ldGhvZCApICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4gIHByaXZhdGUgc2V0SW5pdGlhbENvbmZpZygpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8Ym9vbGVhbj4oKHJlc29sdmUpID0+IHtcbiAgICAgIHRoaXMuZG9tLnN0YXRlLmlzRGV2TW9kZSA9IGlzRGV2TW9kZSgpO1xuICAgICAgdGhpcy51aS5zZW50aW1lbnQgPSB0aGlzLmFzc2V0LnNlbnRpbWVudHNbdGhpcy5hc3NldC5zZW50aW1lbnRJbmRleF07XG4gICAgICB0aGlzLnVpLmV4Y2xhbWF0aW9uID0gUmFuZG9tQXJyYXlFbGVtZW50KHRoaXMuYXNzZXQuZXhjbGFtYXRpb25zKTtcbiAgICAgIHRoaXMuYXNzZXQucm91dGUgPSB0aGlzLnNydi5yb3V0ZXIuY29uZmlnLmZpbmQoKHI6IFJvdXRlKSA9PiB7XG4gICAgICAgIHJldHVybiBJc1N0cmluZyhyLnBhdGgsIHRydWUpICYmICFyLmNhbkFjdGl2YXRlICYmICFyLnJlZGlyZWN0VG87XG4gICAgICB9KTtcblxuICAgICAgdGhpcy51aS5zcGlubmVyID0gPE1haW5TcGlubmVyPntcbiAgICAgICAgY29sb3I6ICdhY2NlbnQnXG4gICAgICB9O1xuICAgICAgcmV0dXJuIHJlc29sdmUodHJ1ZSk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9pbXByb3ZlU2VudGltZW50KCkge1xuICAgIHRoaXMuZG9tLnNldFRpbWVvdXQoYGltcHJvdmUtc2VudGltZW50YCwgKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuYXNzZXQuc2VudGltZW50c1t0aGlzLmFzc2V0LnNlbnRpbWVudEluZGV4ICsgMV0pIHtcbiAgICAgICAgdGhpcy5hc3NldC5zZW50aW1lbnRJbmRleCsrO1xuICAgICAgICB0aGlzLnVpLnNlbnRpbWVudCA9IHRoaXMuYXNzZXQuc2VudGltZW50c1t0aGlzLmFzc2V0LnNlbnRpbWVudEluZGV4XTtcbiAgICAgICAgdGhpcy5faW1wcm92ZVNlbnRpbWVudCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5kb20uc2V0VGltZW91dChgaW1wcm92ZS1zZW50aW1lbnRgLCBudWxsKTtcbiAgICAgICAgdGhpcy51aS5leGNsYW1hdGlvbiA9ICdBTEwgR09PRCEnO1xuICAgICAgICB0aGlzLl9yb3V0ZUFwcCgpO1xuICAgICAgfVxuICAgIH0sIDQwMCk7XG4gIH1cblxuICAvKipcbiAgICpcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHByaXZhdGUgX3JvdXRlQXBwKCkge1xuICAgIHRoaXMuZG9tLnNldFRpbWVvdXQoYHJlLXJvdXRlYCwgKCkgPT4ge1xuICAgICAgaWYgKElzT2JqZWN0KFBvcEJ1c2luZXNzLCBbJ2lkJ10pKSB7XG4gICAgICAgIGlmIChJc09iamVjdCh0aGlzLmFzc2V0LnJvdXRlLCBbJ3BhdGgnXSkpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnRElBR05PU0UgUmVkaXJlY3QgSVNTVUU6IFJlZGlyZWN0IFBhdGgnLCB0aGlzLmFzc2V0LnJvdXRlLnBhdGgpO1xuICAgICAgICAgIGlmICh0aGlzLnNydi5iYXNlLmNoZWNrQXBwQWNjZXNzKFBvcEhyZWYsIHRydWUpKSB7XG4gICAgICAgICAgICB0aGlzLnNydi5yb3V0ZXIubmF2aWdhdGVCeVVybCh0aGlzLmFzc2V0LnJvdXRlLnBhdGgpLmNhdGNoKChlKSA9PiBjb25zb2xlLmxvZygnZScsIGUpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKCF0aGlzLmRvbS5zdGF0ZS5pc0Rldk1vZGUgJiYgSXNTdHJpbmcoUG9wSHJlZiwgdHJ1ZSkgJiYgUG9wSHJlZiAhPT0gJ2hvbWUnKSB3aW5kb3cubG9jYXRpb24uaHJlZiA9IHdpbmRvdy5sb2NhdGlvbi5wcm90b2NvbCArICcvLycgKyB3aW5kb3cubG9jYXRpb24uaG9zdCArICcvaG9tZSc7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICghdGhpcy5kb20uc3RhdGUuaXNEZXZNb2RlICYmIElzU3RyaW5nKFBvcEhyZWYsIHRydWUpICYmIFBvcEhyZWYgIT09ICd1c2VyJykgd2luZG93LmxvY2F0aW9uLmhyZWYgPSB3aW5kb3cubG9jYXRpb24ucHJvdG9jb2wgKyAnLy8nICsgd2luZG93LmxvY2F0aW9uLmhvc3QgKyAnL3VzZXIvcHJvZmlsZSc7XG4gICAgICB9XG4gICAgfSwgNDAwKTtcbiAgfVxuXG5cbn1cbiJdfQ==