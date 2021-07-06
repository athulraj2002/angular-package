import { PopDatetimeService } from './../../../services/pop-datetime.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { PopExtendComponent } from '../../../pop-extend.component';
import { SwitchConfig } from '../../base/pop-field-item/pop-switch/switch-config.model';
import { PopBaseEventInterface, PopEntity, PopTemplate, ServiceInjector } from '../../../pop-common.model';
import { PopEntityEventService } from '../services/pop-entity-event.service';
import { PopTabMenuService } from '../../base/pop-tab-menu/pop-tab-menu.service';
import { PopDomService } from '../../../services/pop-dom.service';
import { ButtonConfig } from '../../base/pop-field-item/pop-button/button-config.model';
import { IsValidChangeEvent } from '../pop-entity-utility';
import { GetHttpErrorMsg } from '../../../pop-common-utility';

@Component( {
  selector: 'lib-pop-entity-status',
  templateUrl: './pop-entity-status.component.html',
  styleUrls: [ './pop-entity-status.component.scss' ],
} )
export class PopEntityStatusComponent extends PopExtendComponent implements OnInit, OnDestroy {
  name = 'PopEntityStatusComponent';

  public ui = {
    archive: <SwitchConfig>undefined,
    valueButton: <ButtonConfig>undefined,
    createdDate: <string>undefined,
    showCopied: false
  };

  protected srv: {
    events: PopEntityEventService,
    tab: PopTabMenuService,
    date: PopDatetimeService,
  } = {
    events: ServiceInjector.get( PopEntityEventService ),
    tab: <PopTabMenuService>undefined,
    date: ServiceInjector.get( PopDatetimeService )
  };


  constructor(
    protected _domRepo: PopDomService,
    protected _tabRepo: PopTabMenuService,
  ){
    super();
    this.dom.configure = (): Promise<boolean> => {

      // this component set the outer height boundary of this view
      return new Promise( async( resolve ) => {
        // Ensure that a CoreConfig exists for this component
        this.dom.state.archived = this.core.entity.archived ? true : false;
        this._setDate( this.core.entity.created_at );
        this._setArchiveSwitch();
        this.srv.tab.showAsLoading( false );

        this.id = this.core.params.internal_name;
        return resolve( true );

      } );
    };
  }


  ngOnInit(): void{
    super.ngOnInit();
  }


  onLabelCopy(): void{
    const nav = <any>navigator;
    const body = String( this.core.entity.id ).slice();
    nav.clipboard.writeText( body );

    this.ui.showCopied = true;

    setTimeout(()=>{
      this.ui.showCopied = false;
    },3000);
  }


  onArchiveChange( event: PopBaseEventInterface ){
    if( IsValidChangeEvent( this.core, event ) ){
      this._handleArchive( !event.config.control.value );
    }
  }


  ngOnDestroy(): void{
    super.ngOnDestroy();
  }

  /************************************************************************************************
   *                                                                                              *
   *                                      Under The Hood                                          *
   *                                    ( Private Method )                                        *
   *                                                                                              *
   ************************************************************************************************/


  private _setDate( date ){
    this.ui.createdDate = this.srv.date.transform( date, 'date' );
  }


  private _setArchiveSwitch(){
    this.ui.valueButton = new ButtonConfig( {
      icon: 'file_copy',
      value: `ID ${ this.core.entity.id }`,
      size: 20,
      radius: 5,
      text: 12,
      bubble: true,
      event: 'click',
      type: 'mat-flat-button'
    } );
    this.ui.archive = new SwitchConfig( {
      name: 'archived',
      bubble: true,
      label: this.core.entity.archived ? 'ACTIVE' : 'ACTIVE',
      labelPosition: 'before',
      value: !this.core.entity.archived ? true : false,
      patch: {
        duration: 0,
        field: '',
        path: '',
      },
    } );
  }


  private _handleArchive( archive: boolean ){
    console.log('_handleArchive', archive);
    this.dom.state.archived = archive;
    this.ui.archive.label = archive ? 'ACTIVE' : 'ACTIVE';
    this.core.entity.archived = archive;
    this.ui.archive.control.disable();
    this.srv.tab.showAsLoading( true );
    this.dom.setSubscriber( 'archive-entity', this.core.repo.archiveEntity( this.core.params.entityId, archive ).subscribe( () => {
      this.srv.events.sendEvent( {
        source: this.name,
        method: 'archive',
        type: 'entity',
        name: this.core.params.name,
        internal_name: this.core.params.internal_name,
        id: this.core.params.entityId,
        data: archive
      } );
      this.srv.tab.showAsLoading( false );
      this.ui.archive.control.enable();
      this.srv.tab.resetTab(true);
      // this.srv.tab.refreshEntity( null, this.dom.repo, {}, `${this.name}:setArchived` ).then( () => PopTemplate.clear() );

    }, err => {
      this.dom.error.code = err.error.code;
      this.dom.error.message = GetHttpErrorMsg(err);
      this.ui.archive.control.enable();
      this.srv.tab.showAsLoading( false );
    } ) );

  }
}
