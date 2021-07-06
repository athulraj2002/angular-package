import { Component, ElementRef, HostBinding, Inject, Input, OnDestroy, OnInit, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { EntityMenu } from './pop-left-menu/entity-menu.model';
import { PopTemplateService } from './pop-template.service';
import {
  AppGlobalInterface, AppThemeInterface,
} from '../../pop-common.model';
import { PopExtendComponent } from '../../pop-extend.component';
import { Router } from '@angular/router';
import { fadeInOut } from '../../pop-common-animations.model';


@Component( {
  selector: 'lib-pop-template',
  templateUrl: './pop-template.component.html',
  styleUrls: [ './pop-template.component.scss' ],
  encapsulation: ViewEncapsulation.None,
} )
export class PopTemplateComponent extends PopExtendComponent implements OnInit, OnDestroy {
  @ViewChild( 'header' ) header: ElementRef;
  @ViewChild( 'content' ) content: ElementRef;
  @HostBinding( 'class.pop-template-backdrop' ) @Input() backdrop = true;
  @Input() menus: EntityMenu[] = [];
  @Input() widgets: any[] = [];
  @Input() filter = true;
  @Input() left = true;
  @Input() right = true;
  @Input() displayMenu = true;


  public name = 'PopTemplateComponent';


  constructor(
    public el: ElementRef,
    private router: Router,
    private template: PopTemplateService,
    private renderer: Renderer2,
    @Inject( 'APP_GLOBAL' ) private APP_GLOBAL: AppGlobalInterface,
    @Inject( 'APP_THEME' ) private APP_THEME: AppThemeInterface,
  ){
    super();

    this.dom.configure = (): Promise<boolean> => {
      return new Promise( async( resolve ) => {
        this.dom.setSubscriber( 'theme', this.APP_THEME.init.subscribe( ( val: boolean ) => {
          this.dom.setTimeout(`remove-backdrop`, ()=>{
            this.renderer.removeClass(document.body, 'site-backdrop-dark');
          }, 0);
          if( val ) this.backdrop = !val;
        } ) );
        this.dom.setSubscriber( 'init', this.APP_GLOBAL.init.subscribe( ( val: boolean ) => {
          if( val ) this._initialize();
        } ) );

        window.onbeforeunload = () =>{
          try {
            this.APP_GLOBAL._unload.next(true);
          } catch(e){
            console.log(e);
          }
        };

        return resolve( true );
      } );
    };

    this.dom.proceed = (): Promise<boolean> => {
      return new Promise( async( resolve ) => {
        this.template.setContentEl( this.content );
        return resolve( true );
      } );
    };
  }


  ngOnInit(): void{
    super.ngOnInit();
  }


  ngOnDestroy(){
    super.ngOnDestroy();
  }

  /************************************************************************************************
   *                                                                                              *
   *                                      Under The Hood                                          *
   *                                    ( Private Method )                                        *
   *                                                                                              *
   ************************************************************************************************/

  private _initialize(){

    return true;
  }


}
