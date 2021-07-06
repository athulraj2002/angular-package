import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PopBaseService } from '../../../../services/pop-base.service';
import { PopEntityService } from '../../services/pop-entity.service';
import { Subscription } from 'rxjs';
import { TableConfig } from '../../../base/pop-table/pop-table.model';
import { PopEntityEventService } from '../../services/pop-entity-event.service';
import { PopEntityUtilPortalService } from '../../services/pop-entity-util-portal.service';
import { CoreConfig, Entity, PopBaseEventInterface, ServiceInjector } from '../../../../pop-common.model';


export interface PopEntityProviderDialogInterface {
  display?: string;
  config: CoreConfig;
  table: TableConfig;
  resource: Entity;
}


@Component({
  selector: 'lib-pop-entity-provider-dialog',
  templateUrl: './pop-entity-provider-dialog.component.html',
  styleUrls: [ './pop-entity-provider-dialog.component.scss' ]
})
export class PopEntityProviderDialogComponent implements OnInit, OnDestroy {
  display: string;
  config: CoreConfig;
  table: TableConfig;
  resource: Entity;


  constructor(
    @Inject(MAT_DIALOG_DATA) data: PopEntityProviderDialogInterface,
    private entityUtilRepo: PopEntityService,
    private entityPortalRepo: PopEntityUtilPortalService,
    private baseRepo: PopBaseService,
    private dialogRepo: MatDialog,
    public dialog: MatDialogRef<PopEntityProviderDialogComponent>){
    this.display = data.display;
    this.config = data.config;
    this.table = data.table;
    this.resource = data.resource;
  }


  state = {
    blockModal: false,
    assignmentChange: false,
    changed: false
  };

  subscriber = {
    crud: <Subscription>undefined,
    dialog: <Subscription>undefined,
  };


  ngOnInit(){
    if( !this.display ) this.display = this.getDisplay();
    this.subscriber.crud = ServiceInjector.get(PopEntityEventService).events.subscribe((event) => this.crudEventHandler(event));
    this.subscriber.dialog = this.dialog.beforeClosed().subscribe(_ => {
      this.dialog.close(this.state.changed);
    });
  }


  getDisplay(){
    const entityName = this.config.entity.display_name ? this.config.entity.display_name : this.config.entity.name;
    const resourceType = this.resource.entity ? this.resource.entity : 'Entity';
    const resourceName = this.resource.name ? this.resource.name : 'Resource';
    return `${entityName} - (${resourceName} - ${resourceType} ) - Provider List`;
  }


  crudEventHandler(event: PopBaseEventInterface){
    console.log('crudEventHandler', event);
    if( event.method === 'create' || event.method === 'delete' ){
      this.state.changed = true;
    }else{
      if( event.type === 'entity' ){
        if( event.name === 'archive' ){
          this.state.changed = true;
        }
      }else if( event.type === 'field' && event.name === 'patch' ){
        const patch = {};
        patch[ event.config.column ] = event.config.control.value;
        const signature = event.config.metadata;
        const signatureMatches = this.table.matData.data.filter(function(row, i){
          return ( ( row[ 'internal_name' ] === signature.internal_name && +row[ 'id' ] === +signature.id ) );
        });
        if( Array.isArray(signatureMatches) && signatureMatches.length ){
          signatureMatches.map((row) => {
            Object.keys(patch).map((column) => {
              if( column in row ){
                row[ column ] = patch[ column ];
                this.state.changed = true;
              }
            });
          });
        }
      }else if( event.type === 'sidebyside' && event.name === 'patch' ){
        const signature = { ...event.config.metadata };
        const signatureMatches = this.table.matData.data.filter(function(row, i){
          return ( ( row[ 'internal_name' ] === signature.internal_name && +row[ 'id' ] === +signature.id ) );
        });
        if( Array.isArray(signatureMatches) && signatureMatches.length ){
          this.state.changed = true;
          this.state.assignmentChange = true;
        }
      }
    }
  }


  eventHandler(event: PopBaseEventInterface){
    if( event.type === 'table' ){
      switch( event.data.link ){
        case 'provider':
          this.viewEntityPortal(event.data.row.internal_name, +event.data.row.id);
          break;
        default:
          break;
      }
    }
  }


  viewEntityPortal(internal_name: string, id: number){
    // placeholder
    this.entityPortalRepo.view(internal_name, id);
  }


  cancel(){
    this.dialog.close(this.state.changed);
  }


  ngOnDestroy(){
    Object.keys(this.subscriber).map((name) => {
      if( this.subscriber[ name ] ){
        this.subscriber[ name ].unsubscribe();
      }
    });
  }

}
