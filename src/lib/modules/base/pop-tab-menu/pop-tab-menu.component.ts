import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  OnDestroy
} from '@angular/core';
import { TabMenuConfig, TabButtonInterface, TabConfig, TabMenuInterface } from './tab-menu.model';
import {
  ActivatedRoute, Router,
} from '@angular/router';
import { PopTabMenuService } from './pop-tab-menu.service';
import { PopExtendComponent } from '../../../pop-extend.component';
import { PopBaseEventInterface, PopTemplate, ServiceInjector } from '../../../pop-common.model';
import { PopDomService } from '../../../services/pop-dom.service';
import { PopRouteHistoryResolver } from '../../../services/pop-route-history.resolver';
import { IsObjectThrowError } from '../../../pop-common-utility';


@Component({
  selector: 'lib-pop-tab-menu',
  templateUrl: './pop-tab-menu.component.html',
  styleUrls: [ './pop-tab-menu.component.scss' ],
})

export class PopTabMenuComponent extends PopExtendComponent implements OnInit, OnDestroy {
  @Input() config: TabMenuConfig;
  @ViewChild('header', { static: true }) header: ElementRef;
  @ViewChild('outlet', { static: true }) outletRef: ElementRef;

  public name = 'PopTabMenuComponent';

  protected srv: {
    history: PopRouteHistoryResolver,
    router: Router,
    tab: PopTabMenuService
  } = {
    history: ServiceInjector.get(PopRouteHistoryResolver),
    router: ServiceInjector.get(Router),
    tab: <PopTabMenuService>undefined
  };



  constructor(
    public el: ElementRef,
    private route: ActivatedRoute,
    protected _domRepo: PopDomService,
    protected _tabRepo: PopTabMenuService,
  ){
    super();

    /**
     * Configure the component tailored to its specific needs
     */
    this.dom.configure = (): Promise<boolean> => {
      return new Promise((resolve) => {
        PopTemplate.turnOffFilter();
        this.config = IsObjectThrowError(this.config, true, `${this.name}:configure: - this.config`) ? this.config : null;
        if( this.config.goBack ) this.config.goBack = this.srv.history.isPreviousHistory();
        this.dom.setHeight(window.innerHeight - 55, 10);
        this.log.info(`Determined height:${this.dom.height.inner}`);
        return resolve(true);
      });
    };

    this.dom.proceed = (): Promise<boolean> => {
      return new Promise((resolve) => {
        this._registerConfig().then(() => {
          setTimeout(() => {
            this.srv.tab.setTabScrollPosition();
            this.srv.tab.registerOutlet(this.outletRef);
          });
          return resolve(true);
        });
      });
    };
  }


  /**
   * This component should have a purpose
   */
  ngOnInit(){
    super.ngOnInit();
  }


  /**
   * Go back in history
   * @returns void
   */
  onBackButtonClick(): void{
    this.srv.tab.clearSession();
    this.srv.history.goBack();
  }


  /**
   * Trigger a menu click event
   * @returns void
   */
  onMenuButtonClick(button: TabButtonInterface): void{
    this.log.info(`${this.name}:button`, button);
    this.dom.setTimeout(`stop-loader`, null, 0)
    this.config.loading = true;
    const eventData: PopBaseEventInterface = {
      source: this.name,
      type: 'button',
      id: button.id,
      name: button.name,
      metadata: ( button.metadata ? button.metadata : false )
    };
    this.onBubbleEvent(eventData);
    this.dom.setTimeout(`stop-loader`, () => {
      this.config.loading = false;
    }, 3000);
  }


  /**
   * Trigger a tab click event
   * @returns void
   */
  onTabMenuClick(tab: TabConfig): void{
    this.log.info(`onTabMenuClick`, tab);
    this.srv.tab.setPathSession(tab);
    const eventData: PopBaseEventInterface = {
      source: this.name,
      type: 'tab',
      id: tab.id,
      name: tab.name,
      metadata: ( tab.metadata ? tab.metadata : false )
    };
    this.onBubbleEvent(eventData);
  }


  /**
   * Event Emitter
   * @returns void
   */
  onBubbleEvent(eventData: PopBaseEventInterface): void{
    this.events.emit(eventData);
  }


  /**
   * Clean up the dom of this component
   *
   * Clear out data stored for this Tab Menu out of the global service
   */
  ngOnDestroy(){
    if( this.core && this.core.params && this.core.params.entityId ) this.core.repo.clearCache('entity', String(this.core.params.entityId), `PopTabMenuComponent:ngOnDestroy`);
    // this.srv.tab.reset();
    super.ngOnDestroy();
  }


  /************************************************************************************************
   *                                                                                              *
   *                                      Under The Hood                                          *
   *                                    ( Private Method )                                        *
   *                                                                                              *
   ************************************************************************************************/




  private _registerConfig(): Promise<boolean>{
    return new Promise((resolve) => {
      this.config = IsObjectThrowError(this.config, true, `${this.name}:registerConfig: - this.config`) ? this.srv.tab.registerConfig(this.core, <TabMenuInterface>this.config, this.dom.repo) : <TabMenuConfig>{};
      resolve(true);
    });
  }


}
