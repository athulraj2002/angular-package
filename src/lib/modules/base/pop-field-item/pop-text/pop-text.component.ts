import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { PopExtendComponent } from '../../../../pop-extend.component';
import { TextConfig } from './text-config.model';

@Component({
  selector: 'lib-pop-text',
  templateUrl: './pop-text.component.html',
  styleUrls: ['./pop-text.component.scss']
})
export class PopTextComponent extends PopExtendComponent implements OnInit, OnDestroy {
  @Input() config: TextConfig;
  public name = 'PopTextComponent';


  constructor(
    public el: ElementRef,
  ){
    super();

    /**
     * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
     */
    this.dom.configure = (): Promise<boolean> => {
      return new Promise( ( resolve ) => {

        return resolve( true );
      } );
    };
  }


  /**
   * This component should have a specific purpose
   */
  ngOnInit(){
    super.ngOnInit();
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
   *                                    ( Private Method )                                        *
   *                                                                                              *
   ************************************************************************************************/

}
