import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PopExtendDynamicComponent } from '../../../../pop-extend-dynamic.component';
import { slideInOut } from '../../../../pop-common-animations.model';

@Component({
  selector: 'lib-pop-entity-field-modal',
  templateUrl: './pop-entity-field-modal.component.html',
  styleUrls: ['./pop-entity-field-modal.component.scss'],
  animations: [
    slideInOut
  ]
})
export class PopEntityFieldModalComponent extends PopExtendDynamicComponent implements OnInit, OnDestroy {
  public name = 'PopEntityFieldModalComponent';


  constructor(
    public dialog: MatDialogRef<PopEntityFieldModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    super();
  }

  ngOnInit(): void {
    super.ngOnInit();
  }



  onFormSubmit(){
    if( this.dom.state.validated ){

    }
  }


  onFormCancel(){
    this.dom.state.loaded = false;
    this.dom.setTimeout(`close-modal`, () => {
      this.dialog.close(-1);
    }, 500);

  }

  ngOnDestroy():void{
    super.ngOnDestroy();
  }

}
