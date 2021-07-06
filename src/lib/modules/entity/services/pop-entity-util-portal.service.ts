import { Injectable } from '@angular/core';
import { PopEntityTabMenuComponent } from '../pop-entity-tab-menu/pop-entity-tab-menu.component';
import { MatDialog } from '@angular/material/dialog';


@Injectable( { providedIn: 'root' } )
export class PopEntityUtilPortalService {


  state = {
    blockModal: false,
  };


  constructor(
    private dialogRepo: MatDialog,
  ){
  }


  view( internal_name: string, id: number ): Promise<boolean>{
    return new Promise( async( resolve ) => {
      if( !this.state.blockModal ){
        this.state.blockModal = true;
        if( internal_name && id ){
          let dialogRef = this.dialogRepo.open( PopEntityTabMenuComponent, {
            width: `${window.innerWidth - 20}px`,
            height: `${window.innerHeight - 50}px`,
            panelClass: 'sw-portal'
          } );
          let component = <PopEntityTabMenuComponent>dialogRef.componentInstance;
          component.portal = { internal_name: internal_name, entity_id: id };
          component.cdr.detectChanges();
          dialogRef.afterClosed().subscribe( ( changed ) => {
            this.state.blockModal = false;
            component.core.repo.clearAllCache();
            dialogRef = null;
            component = null;
            resolve( true );
          } );
        }else{
          resolve( false );
        }
      }else{
        console.log( 'blockModal' );
        resolve( false );
      }
    } );
  }


  /************************************************************************************************
   *                                                                                              *
   *                                      Under The Hood                                          *
   *                                    ( Private Method )                                        *
   *                                                                                              *
   ************************************************************************************************/

}
