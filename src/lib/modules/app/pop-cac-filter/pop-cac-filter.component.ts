import { Component, ElementRef, HostBinding, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { PopExtendComponent } from '../../../pop-extend.component';
import { AppGlobalInterface, EntityFilterInterface, PopBaseEventInterface, PopBusiness, ServiceInjector } from '../../../pop-common.model';
import { IsObject, SetSessionSiteVar } from '../../../pop-common-utility';
import { PopCacFilterBarService } from './pop-cac-filter.service';
import { CacFilterBarConfig } from './pop-cac-filter.model';


@Component({
  selector: 'lib-pop-cac-filter',
  template: `
    <div class="pop-client-filter-container">
      <lib-pop-cac-filter-view *ngIf="ui.config?.active" (events)="onBubbleEvent($event)"></lib-pop-cac-filter-view>
    </div>
  `,
  styles: [ `
    .pop-client-filter-container {
      display: flex;
      flex-direction: column;
      width: 100%;
      box-sizing: border-box;
      /*align-items: center;*/
      padding: 0;
    }
  ` ]
})
export class PopCacFilterComponent extends PopExtendComponent implements OnInit, OnDestroy {
  @HostBinding('class.sw-hidden') @Input() hidden = false;
  @Input() config: CacFilterBarConfig;

  public name = 'PopCacFilterComponent';
  // this represents the data to be filtered and given to the filter bar view.

  protected srv: {
    filter: PopCacFilterBarService,
  } = {
    filter: ServiceInjector.get(PopCacFilterBarService),
  };

  protected asset = {
    filter: undefined // the current filter applied to all columns, this is the (finished product) that we want to be stored in the base service
  };

  public ui = {
    config: <CacFilterBarConfig>undefined,
    entities: <EntityFilterInterface[]>[]
  };


  constructor(
    public el: ElementRef,
    @Inject( 'APP_GLOBAL' ) private APP_GLOBAL: AppGlobalInterface,
  ){
    super();

    this.dom.configure = (): Promise<boolean> => {
      return new Promise((resolve) => {
        this.ui.config = this.srv.filter.getConfig();
        if(!(IsObject(this.ui.config))) this.ui.config = <CacFilterBarConfig>{};
        this.srv.filter.register(el);
        if( IsObject(PopBusiness, [ 'id' ]) && this.APP_GLOBAL.isFilterBar() ){
          if( this.ui.config.active ){
            this.asset.filter = this.srv.filter.getFilter();
            this.srv.filter.setActive(!this.hidden);
          }
        }else{
          this.hidden = true;
          this.ui.config.active = false;
          // this.srv.filter.setFilter({});

        }

        return resolve(true);
      });
    };
  }


  /**
   * This component should have a specific purpose
   */
  ngOnInit(){
    super.ngOnInit();
  }


  /**
   * Event Emitter
   */
  public onBubbleEvent(event: PopBaseEventInterface){
    if( event.type === 'filter' ){
      switch( event.name ){
        case 'apply':
          this.srv.filter.setFilter(event.data);
          break;
        case 'clear':
          this.srv.filter.setFilter({});
          break;
        case 'state':
          if( event.model === 'open' ){
            SetSessionSiteVar(`Business.${PopBusiness.id}.Filter.open`, event.data);
            this.dom.setTimeout(`set-filter-height`, () => {
              const height = this.srv.filter.getElHeight();
              if(height){
                SetSessionSiteVar(`Business.${PopBusiness.id}.Filter.height`, height);
              }

            }, 0);
          }
          break;
        default:
          break;
      }
    }
    this.srv.filter.onChange(event);
  }


  /**
   * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
   */
  ngOnDestroy(){
    super.ngOnDestroy();
  }


  /************************************************************************************************
   *                                                                                              *
   *                                      Under The Hood                                          *
   *                                    ( Private Method )                                        *
   *                                                                                              *
   ************************************************************************************************/


}
