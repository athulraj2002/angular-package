import { Component, ElementRef, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SelectModalConfig } from '../select-modal-config.model';
import { FormControl } from '@angular/forms';
import { ValidationErrorMessages } from '../../../../../services/pop-validators';
import { PopFieldItemComponent } from '../../pop-field-item.component';
import { Dictionary } from '../../../../../pop-common.model';


@Component({
  selector: 'lib-pop-select-modal-dialog',
  templateUrl: './pop-select-modal-dialog.component.html',
  styleUrls: [ './pop-select-modal-dialog.component.scss' ]
})
export class PopSelectModalDialogComponent extends PopFieldItemComponent implements OnInit, OnDestroy {
  @Input() config: SelectModalConfig;

  public name ='PopSelectModalDialogComponent';


  constructor(
    public el: ElementRef,
    public dialog: MatDialogRef<PopSelectModalDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Dictionary<any>,
  ){
    super();
    /**
     * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
     */
    this.dom.configure = (): Promise<boolean> => {
      return new Promise((resolve) => {

        this.dom.height.outer = 570;
        this.dom.height.inner = 520;
        this.config.list.minHeight = 400;

        return resolve(true);
      });
    };
  }


  /**
   * This component should have a specific purpose
   */
  ngOnInit(){
    super.ngOnInit();
  }


  confirm(){
    // this.config.list.control.setValue('', { emitEvent: false });
    this.dom.setTimeout(`dialog-confirm`,() => {
      this.dialog.close(this.config.list);
    }, 0);

  }


  cancel(){
    // this.config.list.control.setValue('', { emitEvent: false });
    this.dom.setTimeout(`dialog-close`, () => {
      this.dialog.close(null);
    }, 0);
  }


  /**
   * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
   */
  ngOnDestroy(){
    super.ngOnDestroy();
  }


  /************************************************************************************************
   *                                                                                              *
   *                                      Under The Hood                                          *
   *                                    ( Protected Method )                                      *
   *                                                                                              *
   ************************************************************************************************/





  /************************************************************************************************
   *                                                                                              *
   *                                      Under The Hood                                          *
   *                                    ( Private Method )                                        *
   *                                                                                              *
   ************************************************************************************************/
}
