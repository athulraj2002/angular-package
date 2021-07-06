import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Dictionary, DynamicComponentInterface, SectionConfig, SectionInterface, ServiceInjector } from '../../../../pop-common.model';
import { PopExtendDynamicComponent } from '../../../../pop-extend-dynamic.component';
import { TabConfig } from '../tab-menu.model';
import { PopDomService } from '../../../../services/pop-dom.service';
import { PopTabMenuService } from '../pop-tab-menu.service';
import { PopTabMenuSectionBarService } from './pop-tab-menu-section-bar.service';
import { ArrayMapSetter, IsArray } from '../../../../pop-common-utility';


@Component( {
  selector: 'lib-pop-tab-section-bar',
  templateUrl: './pop-tab-menu-section-bar.component.html',
  styleUrls: [ './pop-tab-menu-section-bar.component.scss' ],
} )
export class PopTabMenuSectionBarComponent extends PopExtendDynamicComponent implements OnInit, OnDestroy {
  @Input() sections: SectionConfig[];
  @Input() overflow = false;
  @ViewChild( 'container', { read: ViewContainerRef, static: true } ) public container;

  public name = 'PopTabMenuSectionBarComponent';

  protected srv = {
    location: <Location>ServiceInjector.get( Location ),
    router: <Router>ServiceInjector.get( Router ),
    route: <ActivatedRoute>undefined,
    section: <PopTabMenuSectionBarService>ServiceInjector.get( PopTabMenuSectionBarService ),
    tab: <PopTabMenuService>undefined
  };

  public ui = {};

  protected asset = {
    tab: <TabConfig>undefined,
    baseUrl: <string>undefined,
    urlSection: <string>undefined,
    map: <Dictionary<any>>{}
  };


  constructor(
    public el: ElementRef,
    protected _domRepo: PopDomService,
    protected _routeRepo: ActivatedRoute,
    protected _tabRepo: PopTabMenuService,
  ){
    super();

    this.dom.configure = (): Promise<boolean> => {
      return new Promise( async( resolve ) => {

        await this._setCore();
        await this._setRoute();
        await this._setSections();
        await this._setHeight();
        await this._attachContainer();

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
   * This will load the comonent of the selected section into the view container
   * @param section
   */
  onViewSection( section: SectionInterface ){

    this.dom.active.section = section.id;
    this.srv.section.setSectionSession( 'profile', section.id );
    this.srv.location.go( this.asset.baseUrl + '?section=' + section.id );
    this.dom.setTimeout( `view-section`, () => {
      this.template.render( [ <DynamicComponentInterface>{
        type: section.component,
        inputs: section.inputs,
        position: this.position,
      } ] );
    }, 0 );
  }


  /**
   * Clean up the dom of this component
   */
  ngOnDestroy(): void{
    super.ngOnDestroy();
  }


  /************************************************************************************************
   *                                                                                              *
   *                                      Under The Hood                                          *
   *                                    ( Protected Method )                                      *
   *                                                                                              *
   ************************************************************************************************/

  protected _setCore(): Promise<boolean>{
    return new Promise( async( resolve ) => {
      return resolve( true );
    } );
  }


  protected _setRoute(): Promise<boolean>{
    return new Promise( async( resolve ) => {
      const url = String( this.srv.router.url ).split( '?' )[ 0 ];
      const slugs = url.split( '/' );
      this.asset.baseUrl = slugs.join( '/' );
      if( this.srv.section.getPathSession( this.core.params.internal_name ) ) this.asset.urlSection = <string>this.srv.section.getPathSession( this.core.params.internal_name );
      this.dom.setSubscriber( 'query-params', this.srv.route.queryParams.subscribe( params => {
        if( params.section ) this.asset.urlSection = params.section;
      } ) );
      return resolve( true );
    } );

  }


  protected _setSections(): Promise<boolean>{
    return new Promise( async( resolve ) => {
      this.asset.tab = <TabConfig>this.srv.tab.getTab();
      this.dom.active.section = undefined;
      if( !this.sections && this.asset.tab.sections ){
        this.sections = <SectionConfig[]>this.asset.tab.sections;
      }
      this.asset.map.sections = ArrayMapSetter( this.sections, 'id' );
      return resolve( true );
    } );
  }


  protected _setHeight(): Promise<boolean>{
    return new Promise( async( resolve ) => {

      const defaultHeight = window.innerHeight - 230;
      this.dom.setHeight( defaultHeight, 60 );

      return resolve( true );
    } );

  }


  protected _attachContainer(): Promise<boolean>{
    return new Promise( async( resolve ) => {

      this.template.attach( 'container' );
      if( IsArray( this.sections, true ) ){
        if( this.asset.urlSection in this.asset.map.sections ){
          this.onViewSection( this.sections[ this.asset.map.sections [ this.asset.urlSection ] ] );
        }else{
          this.onViewSection( this.sections[ 0 ] );
        }
      }

      return resolve( true );
    } );

  }
}
