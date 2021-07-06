import { Component, OnDestroy, OnInit } from '@angular/core';
import { PopExtendComponent } from '../../../../pop-extend.component';
import { PopDomService } from '../../../../services/pop-dom.service';
import { PopEntitySchemeService } from '../pop-entity-scheme.service';
import { ButtonConfig } from '../../../base/pop-field-item/pop-button/button-config.model';
import { PopTabMenuService } from '../../../base/pop-tab-menu/pop-tab-menu.service';
import { PopBaseEventInterface } from '../../../../pop-common.model';
import { IsValidFieldPatchEvent } from '../../pop-entity-utility';


@Component( {
  selector: 'lib-entity-scheme-details',
  templateUrl: './pop-entity-scheme-details.component.html',
  styleUrls: [ './pop-entity-scheme-details.component.scss' ]
} )
export class PopEntitySchemeDetailsComponent extends PopExtendComponent implements OnInit, OnDestroy {
  public name = 'PopEntitySchemeDetailsComponent';


  protected srv = {
    scheme: <PopEntitySchemeService>undefined,
    tab: <PopTabMenuService>undefined
  };

  public ui = {
  };


  constructor(
    protected _domRepo: PopDomService,
    protected _tabRepo: PopTabMenuService,
    protected _schemeRepo: PopEntitySchemeService,
  ){
    super();
  }


  ngOnInit(){
    super.ngOnInit();
  }


  onBubbleEvent( event: PopBaseEventInterface ){
    this.log.event( `onBubbleEvent`, event );
    if( IsValidFieldPatchEvent( this.core, event ) || event.type === 'context_menu' ){
      this.log.info( `IsValidFieldPatchEvent`, event );
      this.events.emit( event );
    }
  }


  ngOnDestroy(){
    super.ngOnDestroy();
  }

}
