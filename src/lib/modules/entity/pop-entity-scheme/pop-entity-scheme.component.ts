import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { TabConfig } from '../../base/pop-tab-menu/tab-menu.model';
import { PopEntitySchemeService } from './pop-entity-scheme.service';
import { CoreConfig, PopBaseEventInterface } from '../../../pop-common.model';

import { PopExtendComponent } from '../../../pop-extend.component';
import { PopDomService } from '../../../services/pop-dom.service';
import { PopEntitySchemeAssetPoolComponent } from './pop-entity-scheme-asset-pool/pop-entity-scheme-asset-pool.component';
import { PopEntitySchemeAssetLayoutComponent } from './pop-entity-scheme-asset-layout/pop-entity-scheme-asset-layout.component';
import { PopEntitySchemeDetailsComponent } from './pop-entity-scheme-details/pop-entity-scheme-details.component';
import { PopTabMenuService } from '../../base/pop-tab-menu/pop-tab-menu.service';

@Component( {
  selector: 'lib-customer-scheme',
  template: `
    <lib-main-spinner *ngIf="dom.state.loader"></lib-main-spinner>
    <lib-pop-entity-tab *ngIf="dom.state.loaded" [tab]=ui.tab [core]="core"></lib-pop-entity-tab>`,
  providers: [ PopEntitySchemeService ],
} )
export class PopEntitySchemeComponent extends PopExtendComponent implements OnInit, OnDestroy {
  public name = 'PopEntitySchemeComponent';

  protected srv = {
    scheme: <PopEntitySchemeService>undefined,
    tab: <PopTabMenuService>undefined
  };


  /**
   *
   * @param el
   * @param _domRepo - transfer
   * @param _schemeRepo - transfer
   * @param _tabRepo - transfer
   */
  constructor(
    public el: ElementRef,
    protected _domRepo: PopDomService,
    protected _schemeRepo: PopEntitySchemeService,
    protected _tabRepo: PopTabMenuService
  ){
    super();

    this.dom.configure = (): Promise<boolean> => {
      return new Promise( async( resolve ) => {
        this.ui.tab = new TabConfig( {
          id: 'general',
          positions: {
            1: {
              header: 'Details',
              flex: 1,
              components: [
                {
                  type: PopEntitySchemeDetailsComponent,
                  inputs: {
                    id: 1
                  },
                },
              ]
            },
            2: {
              flex: 1,
              header: 'Available Fields & Components',
              components: [
                {
                  type: PopEntitySchemeAssetPoolComponent,
                  inputs: {
                    id: 2
                  },
                },
              ]
            },
            3: {
              flex: 2,
              header: 'Profile Layout',
              components: [
                {
                  type: PopEntitySchemeAssetLayoutComponent,
                  inputs: {
                    id: 3
                  },
                },
              ]
            },
          },
          wrap: false,
          columnWrap: true,
          overhead: 0,
          onLoad: ( config: CoreConfig, tab: TabConfig ) => {
            // console.log('config', config);
            // console.log('tab', tab);
          },

          onEvent: ( core: CoreConfig, event: PopBaseEventInterface ) => {
            // console.log('event', event);
          },
        } );

        await this.srv.scheme.init( this.core, this.ui.tab );

        return resolve( true );
      } );
    };

    this.dom.proceed = (): Promise<boolean> => {
      return new Promise( ( resolve ) => {
        this.dom.setSubscriber(`refresh`, this.srv.scheme.ui.refresh.subscribe((val: string)=>{
          if(val === 'reload'){
            this.srv.tab.resetTab(true);
            // this.srv.tab.refreshEntity(this.core.params.entityId, this.dom.repo, { bypassCache: true }, this.name).then(async()=>{
            //   await this.srv.scheme.init( this.core, this.ui.tab );
            //   this.srv.tab.resetTab();
            // });
          }
        }));
        return resolve( true );
      } );
    };
  }


  ngOnInit(){
    super.ngOnInit();
  }


  ngOnDestroy(){
    super.ngOnDestroy();
  }
}
