import {Component, isDevMode, OnDestroy, OnInit} from '@angular/core';
import {IsObject, IsString, RandomArrayElement, Sleep} from '../../../../pop-common-utility';
import {PopExtendComponent} from '../../../../pop-extend.component';
import {PopBusiness, PopHref} from '../../../../pop-common.model';
import {Route, Router} from '@angular/router';
import {PopBaseService} from "../../../../services/pop-base.service";
import {MainSpinner} from "../../pop-indicators/pop-indicators.model";


@Component({
  selector: 'lib-pop-guard-redirect',
  templateUrl: './pop-guard-redirect.component.html',
  styleUrls: ['./pop-guard-redirect.component.scss']
})
export class PopGuardRedirectComponent extends PopExtendComponent implements OnInit, OnDestroy {

  protected srv = {
    base: <PopBaseService>undefined,
    router: <Router>undefined
  };

  protected asset = {
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
    route: <Route>undefined
  };

  public ui = {
    exclamation: <string>undefined,
    sentiment: <string>undefined,
    spinner: <MainSpinner>undefined,
  };


  constructor(
    protected _baseRepo: PopBaseService,
    protected _routerRepo: Router,
  ) {
    super();

    this.dom.configure = () => {
      return new Promise<boolean>(async (resolve) => {

        await Promise.all([
          this.setInitialConfig()
        ]);

        // this._improveSentiment();
        // this._routeApp();

        return resolve(true);
      });
    };

  }


  ngOnInit(): void {
    super.ngOnInit();
  }


  ngOnDestroy(): void {
    super.ngOnDestroy();
  }


  /************************************************************************************************
   *                                                                                              *
   *                                      Under The Hood                                          *
   *                                    ( Private Method )                                        *
   *                                                                                              *
   ************************************************************************************************/

  private setInitialConfig(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.dom.state.isDevMode = isDevMode();
      this.ui.sentiment = this.asset.sentiments[this.asset.sentimentIndex];
      this.ui.exclamation = RandomArrayElement(this.asset.exclamations);
      this.asset.route = this.srv.router.config.find((r: Route) => {
        return IsString(r.path, true) && !r.canActivate && !r.redirectTo;
      });

      this.ui.spinner = <MainSpinner>{
        color: 'accent'
      };
      return resolve(true);
    });
  }

  private _improveSentiment() {
    this.dom.setTimeout(`improve-sentiment`, () => {
      if (this.asset.sentiments[this.asset.sentimentIndex + 1]) {
        this.asset.sentimentIndex++;
        this.ui.sentiment = this.asset.sentiments[this.asset.sentimentIndex];
        this._improveSentiment();
      } else {
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
  private _routeApp() {
    this.dom.setTimeout(`re-route`, () => {
      if (IsObject(PopBusiness, ['id'])) {
        if (IsObject(this.asset.route, ['path'])) {
          console.log('DIAGNOSE Redirect ISSUE: Redirect Path', this.asset.route.path);
          if (this.srv.base.checkAppAccess(PopHref, true)) {
            this.srv.router.navigateByUrl(this.asset.route.path).catch((e) => console.log('e', e));
          }
        } else {
          if (!this.dom.state.isDevMode && IsString(PopHref, true) && PopHref !== 'home') window.location.href = window.location.protocol + '//' + window.location.host + '/home';
        }
      } else {
        if (!this.dom.state.isDevMode && IsString(PopHref, true) && PopHref !== 'user') window.location.href = window.location.protocol + '//' + window.location.host + '/user/profile';
      }
    }, 400);
  }


}
