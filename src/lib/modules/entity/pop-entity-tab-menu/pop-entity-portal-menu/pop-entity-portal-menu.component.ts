import {
  Component, ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CdkPortalOutlet, ComponentPortal } from '@angular/cdk/portal';
import { PopBaseEventInterface, PopEntity, ServiceInjector } from '../../../../pop-common.model';
import { TabButtonInterface, TabConfig, TabMenuConfig } from '../../../base/pop-tab-menu/tab-menu.model';
import { PopEntityTabComponent } from '../../pop-entity-tab/pop-entity-tab.component';
import { PopTabMenuService } from '../../../base/pop-tab-menu/pop-tab-menu.service';
import { PopDomService } from '../../../../services/pop-dom.service';
import { PopExtendComponent } from '../../../../pop-extend.component';
import { IsArray, IsObjectThrowError } from '../../../../pop-common-utility';
import { PopEntityEventService } from '../../services/pop-entity-event.service';
import { IsValidCoreSignature, IsValidFieldPatchEvent } from '../../pop-entity-utility';


@Component( {
  selector: 'lib-pop-entity-portal-menu',
  templateUrl: './pop-entity-portal-menu.component.html',
  styleUrls: [ './pop-entity-portal-menu.component.scss' ],
  providers: [ PopTabMenuService, PopDomService ],
} )
export class PopEntityPortalMenuComponent extends PopExtendComponent implements OnInit, OnDestroy {
  @Input() config: TabMenuConfig;
  @ViewChild( 'outlet', { static: true } ) outlet: ElementRef;
  @ViewChild( CdkPortalOutlet, { static: true } ) portal: CdkPortalOutlet;

  public name = 'PopTabMenuComponent';


  protected srv: {
    crud: PopEntityEventService,
    tab: PopTabMenuService,
  } = {
    crud: ServiceInjector.get( PopEntityEventService ),
    tab: <PopTabMenuService>undefined
  };


  constructor(
    public el: ElementRef,
    protected _domRepo: PopDomService,
    protected _tabRepo: PopTabMenuService
  ){
    super();

    this.id = 2;
    this.dom.configure = (): Promise<boolean> => {
      return new Promise( async( resolve ) => {
        // set the outer height boundary
        await this.dom.setHeightWithParent( 'cdk-overlay-pane', 100, window.innerHeight - 180 );
        // #1: Enforce a CoreConfig
        this.core = IsObjectThrowError( this.core, true, `${this.name}:configureDom: - this.core` ) ? this.core : null;
        // #2: Enforce a TabMenuConfig
        this.config = IsObjectThrowError( this.config, true, `${this.name}:configureDom: - this.core` ) ? this.config : <TabMenuConfig>{};
        await PopEntity.setCoreDomAssets( this.core, this.dom.repo );
        // #3: Register the outlet with the tabRepo, gives the tabRepo the ability to reset the view if needed
        this.srv.tab.registerOutlet( <ElementRef>this.outlet );
        // #4: Preset a default tab so the view will have something to render
        if( IsArray( this.config.tabs, true ) ) this.onSetPortal( this.config.tabs[ 0 ] );

        this.dom.setSubscriber( 'events', this.srv.crud.events.subscribe( ( event: PopBaseEventInterface ) => {
          if( IsValidCoreSignature( this.core, event ) ){
            if(IsValidFieldPatchEvent(this.core, event)){
              if( event.config.name === 'name' || event.config.name === 'label' ){
                this.config.name = ( event.config.control.value );
              }
            }
          }
        } ) );

        return resolve( true );
      } );
    };
  }


  /**
   * Setup this component
   */
  ngOnInit(){
    super.ngOnInit();
  }


  /**
   * Trigger a portal tab click event
   * @returns void
   */
  onMenuClick( tab: TabConfig ): void{
    this.onSetPortal( tab );
    this.onBubbleEvent( {
      source: this.name,
      type: 'menu',
      id: tab.id,
      name: tab.name,
    } );
  }


  /**
   * Whenever a user click on tab av button, the portal needs reset to that tab
   * Has specific render so does not use the built-in render intentionally
   * @param tab
   */
  onSetPortal( tab: TabConfig ){
    if( this.log.repo.enabled( 'config', this.name ) ) console.log( this.log.repo.message( `${this.name}:setPortal:tab` ), this.log.repo.color( 'config' ), tab );
    if( tab && tab.id ){
      if( this.portal && this.portal.attachedRef ) this.portal.detach();
      this.dom.state.tab = tab;
      Object.keys( this.dom.subscriber ).map( ( name ) => {
        if( this.dom.subscriber[ name ] ){
          this.dom.subscriber[ name ].unsubscribe();
        }
      } );
      const componentRef = this.portal.attach( new ComponentPortal( PopEntityTabComponent ) );
      componentRef.instance[ 'core' ] = this.core;
      componentRef.instance.tab = tab;
      componentRef.changeDetectorRef.detectChanges();

      if( componentRef.instance[ 'events' ] ){
        this.dom.setSubscriber( 'portal', componentRef.instance[ 'events' ].subscribe( ( event: PopBaseEventInterface ) => {
          this.onBubbleEvent( event );
        } ) );
      }
    }
  }


  /**
   * Trigger a button click event
   * @returns void
   */
  onButtonClick( button: TabButtonInterface ): void{
    this.onBubbleEvent( {
      source: this.name,
      type: 'button',
      id: button.id,
      name: button.name,
    } );
  }


  /**
   * This will bubble a event up to a parent component
   * @param event
   */
  onBubbleEvent( event: PopBaseEventInterface ){
    this.events.emit( event );
  }


  /**
   * Clean up the dom of this component
   */
  ngOnDestroy(){
    super.ngOnDestroy();
    this.portal.detach();
  }


  /************************************************************************************************
   *                                                                                              *
   *                                      Under The Hood                                          *
   *                                    ( Private Method )                                        *
   *                                                                                              *
   ************************************************************************************************/

  private _onCrudEvent(event: PopBaseEventInterface){

  }
}
