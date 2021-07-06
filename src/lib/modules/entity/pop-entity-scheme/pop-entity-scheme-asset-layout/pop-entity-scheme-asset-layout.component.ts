import { Component, ElementRef, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { PopEntitySchemeService } from '../pop-entity-scheme.service';
import { PopExtendComponent } from '../../../../pop-extend.component';
import { PopDomService } from '../../../../services/pop-dom.service';


// https://medium.com/codetobe/learn-how-to-drag-drop-items-in-angular-7-20395c262ab0

@Component( {
  selector: 'lib-entity-scheme-asset-layout',
  templateUrl: './pop-entity-scheme-asset-layout.component.html',
  styleUrls: [ './pop-entity-scheme-asset-layout.component.scss' ],
  encapsulation: ViewEncapsulation.None
} )
export class PopEntitySchemeAssetLayoutComponent extends PopExtendComponent implements OnInit, OnDestroy {
  public name = 'PopEntitySchemeAssetLayoutComponent';


  protected srv = {
    scheme: <PopEntitySchemeService>undefined
  };


  constructor(
    public el: ElementRef,
    protected _domRepo: PopDomService,
    protected _schemeRepo: PopEntitySchemeService,
  ){
    super();
    this.dom.configure = (): Promise<boolean> => {
      return new Promise( async( resolve ) => {
        await this.dom.setWithComponentInnerHeight( 'PopEntityTabColumnComponent', this.position, 210, 600 );
        this.ui.sections = this.srv.scheme.ui.sections;
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
   * Clean up the dom of this component
   */
  ngOnDestroy(){
    super.ngOnDestroy();
  }

}
