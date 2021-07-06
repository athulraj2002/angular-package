import { Component, ElementRef, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { PopExtendComponent } from '../../../pop-extend.component';
import { PopFieldEditorService } from './pop-entity-field-editor.service';
import { PopDomService } from '../../../services/pop-dom.service';
import { TabConfig } from '../../base/pop-tab-menu/tab-menu.model';
import { CoreConfig, PopBaseEventInterface, PopHref, ServiceInjector } from '../../../pop-common.model';
import { PopEntityFieldSettingsComponent } from './pop-entity-field-settings/pop-entity-field-settings.component';
import { PopEntityFieldDetailsComponent } from './pop-entity-field-details/pop-entity-field-details.component';
import { PopTabMenuService } from '../../base/pop-tab-menu/pop-tab-menu.service';
import { IsObject, StorageGetter } from '../../../pop-common-utility';
import { PopEntityFieldPreviewComponent } from './pop-entity-field-preview/pop-entity-field-preview.component';
import { PopRouteHistoryResolver } from '../../../services/pop-route-history.resolver';
import { PopEntityUtilFieldService } from '../services/pop-entity-util-field.service';


@Component( {
  selector: 'lib-field-editor',
  template: `
    <lib-pop-entity-tab *ngIf="dom.state.loaded" [tab]=ui.tab [core]="core"></lib-pop-entity-tab>`,
  styleUrls: [ './pop-entity-field-editor.scss' ],
  providers: [ PopFieldEditorService ],
  encapsulation: ViewEncapsulation.None,
} )
export class PopEntityFieldEditorComponent extends PopExtendComponent implements OnInit, OnDestroy {

  public name = 'PopEntityFieldEditorComponent';


  protected srv = {
    field: <PopFieldEditorService>undefined,
    utilField: <PopEntityUtilFieldService>undefined,
    history: <PopRouteHistoryResolver>ServiceInjector.get( PopRouteHistoryResolver ),
    tab: <PopTabMenuService>undefined,
  };


  /**
   * @param el
   * @param _domRepo
   * @param _fieldRepo
   * @param _tabRepo
   */
  constructor(
    public el: ElementRef,
    protected _domRepo: PopDomService,
    protected _fieldRepo: PopFieldEditorService,
    protected _utilFieldRepo: PopEntityUtilFieldService,
    protected _tabRepo: PopTabMenuService,
  ){
    super();

    /**
     * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
     */
    this.dom.configure = (): Promise<boolean> => {
      return new Promise( ( resolve ) => {
        if( !( IsObject( this.core, true ) ) ) this.core = this.srv.tab.getCore();
        const fieldgroup = StorageGetter( this.core, [ 'entity', 'fieldgroup', 'name' ] );
        if( fieldgroup ){
          this.ui.tab = new TabConfig( {
            id: 'general',
            positions: {
              1: {
                header: 'Details',
                flex: 1,
                components: [
                  {
                    type: PopEntityFieldDetailsComponent,
                    inputs: {
                      id: 1
                    },
                  },
                ]
              },
              2: {
                flex: 2,
                components: [
                  {
                    type: PopEntityFieldSettingsComponent,
                    inputs: {
                      id: 2
                    },
                  },
                ]
              },
              3: {
                flex: 1,
                components: [
                  {
                    type: PopEntityFieldPreviewComponent,
                    inputs: {
                      id: 3
                    },
                  },
                ]
              },
            },
            wrap: true,
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
          this.srv.field.register( this.core, this.dom.repo ).then( () => {
            this.srv.utilField.clearCustomFieldCache( +this.core.entity.id );
            return resolve( true );
          } );

        }else{
          window.location.href = window.location.origin + '/' + PopHref;
        }
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
    super.ngOnDestroy();
  }

}
