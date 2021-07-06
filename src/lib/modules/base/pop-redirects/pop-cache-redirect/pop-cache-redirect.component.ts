import { Component, OnDestroy, OnInit } from '@angular/core';
import { PopCacheRedirectUrl, PopTemplate, ServiceInjector, SetPopCacheRedirectUrl, SetPopMessage } from '../../../../pop-common.model';
import { PopEntityService } from '../../../entity/services/pop-entity.service';
import { PopExtendComponent } from '../../../../pop-extend.component';
import { Router } from '@angular/router';
import { IsString } from '../../../../pop-common-utility';


@Component( {
  selector: 'lib-pop-cache-redirect',
  templateUrl: './pop-cache-redirect.component.html',
  styleUrls: [ './pop-cache-redirect.component.scss' ]
} )
export class PopCacheRedirectComponent extends PopExtendComponent implements OnInit, OnDestroy {

  public name = 'PopCacheRedirectComponent';

  protected srv = {
    router: <Router>ServiceInjector.get( Router ),
    entity: <PopEntityService>ServiceInjector.get( PopEntityService ),
  };

  public ui = {
    code: <number>undefined,
    message: <string>undefined
  };


  constructor(){
    super();

    /**
     * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
     */
    this.dom.configure = (): Promise<boolean> => {
      return new Promise( async( resolve ) => {
        this.dom.setHeight( PopTemplate.getContentHeight(), 120 );
        PopTemplate.clear();
        this.srv.entity.bustAllCache();
        return resolve( true );
      } );
    };

    this.dom.proceed = () => {
      return new Promise( async( resolve ) => {
        this.dom.setTimeout( `cache-redirect`, () => {
          if(IsString(PopCacheRedirectUrl, true)){
            this.srv.router.navigate( [ PopCacheRedirectUrl ], {skipLocationChange: true} ).then(()=>{
              // console.log('cache redirect success');
              return true;
            });
          } else{
            this.srv.router.navigate(['system/route']);
          }

        }, 250 );

        return resolve( true );
      } );
    };

  }


  /**
   * This component allows a redirect that will clear all cache and then return back to the url
   */
  ngOnInit(){
    super.ngOnInit();
  }


  /**
   * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
   */
  ngOnDestroy(){
    SetPopCacheRedirectUrl( null );
    super.ngOnDestroy();
  }


  /************************************************************************************************
   *                                                                                              *
   *                                      Under The Hood                                          *
   *                                    ( Private Method )                                        *
   *                                                                                              *
   ************************************************************************************************/

}
