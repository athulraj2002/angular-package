import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { TabPositionInterface } from '../../base/pop-tab-menu/tab-menu.model';
import { CoreConfig, DynamicComponentInterface, EntityExtendInterface, PopBaseEventInterface } from '../../../pop-common.model';
import { PopTabMenuService } from '../../base/pop-tab-menu/pop-tab-menu.service';
import { PopExtendDynamicComponent } from '../../../pop-extend-dynamic.component';
import { PopDomService } from '../../../services/pop-dom.service';
import { IsArray, IsObject, IsObjectThrowError, StorageGetter } from '../../../pop-common-utility';
import { EvaluateWhenConditions, IsValidFieldPatchEvent } from '../pop-entity-utility';


@Component( {
  selector: 'lib-pop-entity-tab-column',
  template: '<ng-template #container></ng-template>',
} )
export class PopEntityTabColumnComponent extends PopExtendDynamicComponent implements OnInit, OnDestroy {
  @Input() column: TabPositionInterface;
  @ViewChild( 'container', { read: ViewContainerRef, static: true } ) public container;
  @Input() extension: EntityExtendInterface; // allows the route to override certain settings

  public name = 'PopEntityTabColumnComponent';
  protected srv: {
    tab: PopTabMenuService,
  } = {
    tab: <PopTabMenuService>undefined
  };


  public ui = {
    tabId: <number>undefined,
  };


  constructor(
    public el: ElementRef,
    protected _domRepo: PopDomService,
    protected _tabRepo: PopTabMenuService,
  ){
    super();

    this.dom.configure = (): Promise<boolean> => {
      return new Promise( ( resolve ) => {
        //  Enforce CoreConfig
        this.core = IsObjectThrowError( this.core, true, `${this.name}:: - this.core` ) ? this.core : null;
        //  Set Attributes
        this.position = +this.column.id;
        this.id = this.column.id;
        // Event Handlers
        this.trait.bubble = true; // passes bubble events up to parent

        this.dom.handler.bubble = ( core: CoreConfig, event: PopBaseEventInterface ) => {
          this.onBubbleEvent( event );
        };

        const tab = this.srv.tab.getTab();
        if( tab && tab.id ){
          this.ui.tabId = tab.id;
        }

        return resolve( true );
      } );
    };

    this.dom.proceed = (): Promise<boolean> => {
      return new Promise( ( resolve ) => {


        this.dom.setSubscriber( 'name-reset', this.column.reset.subscribe( ( e: string | boolean ) => this._onColumnResetEvent( e ) ) );

        this._determineHeight();
        // Attach Template Container
        this.template.attach( 'container' );
        //  Render the dynamic list of components
        this._templateRender();

        return resolve( true );
      } );
    };
  }


  /**
   * The component should take a specific section/column of a defined tab, and dynamically render all of the components that belong in that section
   */
  ngOnInit(){
    super.ngOnInit();
  }


  /**
   * Event handler for the parent tab to tell this column to reset itself
   * @param reset
   */
  onBubbleEvent( event: PopBaseEventInterface ){
    this.log.event( `onBubbleEvent`, event );
    if( IsValidFieldPatchEvent( this.core, event ) || event.type === 'context_menu' ){
      this.events.emit( event );
    }
  }


  /**
   * Clean up the dom of this component
   */
  ngOnDestroy(){
    this._setScrollTop();
    super.ngOnDestroy();
  }


  /************************************************************************************************
   *                                                                                              *
   *                                      Under The Hood                                          *
   *                                    ( Private Method )                                        *
   *                                                                                              *
   ************************************************************************************************/


  /**
   * Event handler for the parent tab to tell this column to reset itself
   * @param reset
   */
  private _onColumnResetEvent( reset: string | boolean ){
    if( reset && typeof reset === 'boolean' ){
      if( this.dom.delay.render ) clearTimeout( this.dom.delay.render );
      this.dom.delay.render = setTimeout( () => {
        this._templateRender();
      }, 250 );
    }else if( typeof reset === 'string' ){
      if( reset === 'scrollTop' ){
        this._setScrollTop();
      }
    }
  }


  /**
   * Helper function that determines what the height of this component should be
   *
   */
  private _determineHeight(){
    this.dom.state.hasHeader = this.column.header ? true : false;
    const columnHeight = StorageGetter( this.dom.repo, [ 'position', String( this.column.id ), 'height' ], 650 );
    this.dom.height.outer = +columnHeight;
    this.dom.height.inner = this.dom.height.outer - 30;
  }


  /**
   * Helper function that renders the list of dynamic components
   *
   */
  private _templateRender(){
    const transfer = [ 'core', 'position' ];
    if( IsObject( this.column.extension, true ) ){
      this.extension = this.column.extension;
      transfer.push( 'extension' );
    }
    const components = IsArray( this.column.components, true ) ? this.column.components : [];
    this.template.render( components, transfer );
    this._applyScrollTop();
  }


  /**
   * Reaches up to the parent container and sets the current scroll position
   * The parent container component uses an *ngIf that prevents using @viewChild to do this
   */
  private _applyScrollTop(){
    setTimeout( () => {
      if( this.dom.session.scroll && this.ui.tabId && this.dom.session.scroll[ this.ui.tabId ] ){
        this.el.nativeElement.parentElement.scrollTop = this.dom.session.scroll[ this.ui.tabId ];
      }
    }, 0 );
  }


  /**
   * Reaches up to the parent container and stores the current scroll position
   * The parent container component uses an *ngIf that prevents using @viewChild to do this
   */
  private _setScrollTop(){
    if( !this.dom.session.scroll ) this.dom.session.scroll = {};
    if( this.ui.tabId ){
      this.dom.session.scroll[ this.ui.tabId ] = this.el.nativeElement.parentElement.scrollTop;
    }
  }
}
