import { Component, ElementRef, isDevMode, OnDestroy, OnInit } from '@angular/core';
import { PopExtendComponent } from '../../../../pop-extend.component';
import { ActivatedRoute, Router } from '@angular/router';
import { PopMessage, PopTemplate, ServiceInjector, SetPopMessage } from '../../../../pop-common.model';
import { PopDomService } from '../../../../services/pop-dom.service';

@Component({
  selector: 'lib-pop-error-redirect',
  templateUrl: './pop-error-redirect.component.html',
  styleUrls: ['./pop-error-redirect.component.scss']
})
export class PopErrorRedirectComponent extends PopExtendComponent implements OnInit, OnDestroy {
  public name = 'PopErrorRedirectComponent';

  protected srv = {
    router: <Router>ServiceInjector.get( Router ),
  };

  public ui = {
    code: <number>undefined,
    message: <string>undefined
  };


  constructor(
    public el: ElementRef,
    protected _domRepo: PopDomService,
    private route: ActivatedRoute
  ){
    super();

    /**
     * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
     */
    this.dom.configure = (): Promise<boolean> => {
      return new Promise( ( resolve ) => {
        this.dom.state.isDevMode = isDevMode();
        this.dom.setHeight(PopTemplate.getContentHeight(), 120);
        this._setRoute();
        resolve( true );
      } );
    };
  }


  /**
   * This component should have a specific purpose
   */
  ngOnInit(){
    super.ngOnInit();
    
  }


  /**
   * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
   */
  ngOnDestroy(){
    SetPopMessage(null);
    super.ngOnDestroy();
  }

  /************************************************************************************************
   *                                                                                              *
   *                                      Under The Hood                                          *
   *                                    ( Private Method )                                        *
   *                                                                                              *
   ************************************************************************************************/

  private _setRoute(){
    this.ui.code = this.route.snapshot.params.code || 404;
    this.ui.message = PopMessage;
  }

}
