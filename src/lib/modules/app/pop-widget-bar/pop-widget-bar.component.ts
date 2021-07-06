import { Component, HostBinding, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { AppGlobalInterface, AppWidgetsInterface, PopAuth } from '../../../pop-common.model';
import { PopExtendDynamicComponent } from '../../../pop-extend-dynamic.component';
import { EntityMenu } from '../pop-left-menu/entity-menu.model';
import { IsObject } from '../../../pop-common-utility';


@Component({
  selector: 'lib-pop-widget-bar',
  templateUrl: './pop-widget-bar.component.html',
  styleUrls: [ './pop-widget-bar.component.scss' ],
})
export class PopWidgetBarComponent extends PopExtendDynamicComponent implements OnInit, OnDestroy {
  @HostBinding('class.sw-hidden') @Input() hidden = false;
  @Input() widgets: any[] = [];
  public name =  'PopWidgetBarComponent';

  public ui = {};

  protected asset = {};

  constructor(
    @Inject( 'APP_GLOBAL' ) private APP_GLOBAL: AppGlobalInterface,
    @Inject( 'APP_WIDGETS' ) private APP_WIDGETS: AppWidgetsInterface,
  ){
    super();

    this.dom.configure = (): Promise<boolean> => {
      return new Promise( async( resolve ) => {
        this.dom.state.open = false;
        this.dom.state.closed = true;

        this.dom.setSubscriber( 'init', this.APP_GLOBAL.init.subscribe( ( val: boolean ) => {
          if( val ) this._initialize();
        } ) );
        return resolve( true );
      } );
    };
  }


  ngOnInit(){
    super.ngOnInit();
  }


  public onToggleMenu(): void{
    this.dom.state.open = !this.dom.state.open;
    this.dom.state.closed = !this.dom.state.open;
    window.dispatchEvent(new Event('onWindowResize'));
  }

  ngOnDestroy(){
    super.ngOnDestroy();
  }

  private _initialize(){
    this.hidden = ( ( this.APP_GLOBAL.isEntities() && !( IsObject( PopAuth ) ) ) || !( this.widgets.length ) ) ? true : false;
    return true;
  }
}
