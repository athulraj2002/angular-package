import { Injectable, OnDestroy } from '@angular/core';

import {
  DestroyServiceDom,
  GetServiceUiContainer,
  GetServiceDom,
  GetServiceAssetContainer,
  ServiceUiContainerInterface,
  ServiceAssetContainerInterface,
} from '../pop-common-dom.models';
import { Subscription } from 'rxjs';
import { PopUid } from '../pop-common-utility';


@Injectable({
  providedIn: 'root'
})
export class PopExtendService implements OnDestroy {
  protected dom = GetServiceDom();
  protected id: number | string = PopUid();
  protected name;
  protected asset;


  // public ui = <ServiceUiContainerInterface>GetServiceUiContainer();


  constructor(){
    if( !this.asset ) this.asset = <ServiceAssetContainerInterface>GetServiceAssetContainer();
    this.dom = {
      ...this.dom, ...{
        setSubscriber: (subscriptionKey: string, subscription: Subscription = null) => {
          if( subscriptionKey && this.dom.subscriber && subscriptionKey in this.dom.subscriber && this.dom.subscriber[ subscriptionKey ] && typeof this.dom.subscriber[ subscriptionKey ].unsubscribe === 'function' ){
            this.dom.subscriber[ subscriptionKey ].unsubscribe();
          }
          if( subscription ){
            this.dom.subscriber[ subscriptionKey ] = subscription;
          }
        },

        setTimeout: (timeoutKey: string, callback = null, delay = 250) => {
          if( timeoutKey && this.dom.delay && timeoutKey in this.dom.delay && this.dom.delay[ timeoutKey ] ){
            clearTimeout(this.dom.delay[ timeoutKey ]);
          }
          if( typeof callback === 'function' ){
            this.dom.delay[ timeoutKey ] = setTimeout(callback, delay);
          }
        },
      }
    };
  }


  ngOnDestroy(){
    DestroyServiceDom(this.dom);
  }
}
