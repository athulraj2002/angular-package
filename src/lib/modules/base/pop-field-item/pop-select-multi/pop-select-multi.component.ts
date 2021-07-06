import { ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { SelectMultiConfig } from './select-mulit-config.model';
import { PopFieldItemComponent } from '../pop-field-item.component';


@Component( {
  selector: 'lib-pop-select-multi',
  templateUrl: './pop-select-multi.component.html',
  styleUrls: [ './pop-select-multi.component.scss' ]
} )

export class PopSelectMultiComponent extends PopFieldItemComponent implements OnInit, OnDestroy {
  @Input() config: SelectMultiConfig;
  public name = 'PopSelectMultiComponent';


  constructor(
    public el: ElementRef,
  ){
    super();

    /**
     * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
     */
    this.dom.configure = (): Promise<boolean> => {
      return new Promise( ( resolve ) => {

        this.config.triggerOnChange = ( value: string | number | null ) => {
          // this.cdr.detectChanges();
          this.dom.setTimeout( `config-trigger-change`, () => {
            this.onChange( value, true );
          }, 0 );
        };

        this.config.clearMessage = () => {
          this.dom.setTimeout( `config-clear-message`, () => {
            this.config.message = '';
            this.config.message = '';
            this.config.control.markAsPristine();
            this.config.control.markAsUntouched();
            // this.cdr.detectChanges();
          }, 0 );
        };

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
   * On Blur Event
   */
  onBlur(){
    this.onBubbleEvent( 'onBlur' );
  }


  onClose( open: boolean ){
    if( !open ){
      this.onChange();
    }
  }


  /**
   * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
   */
  ngOnDestroy(){
    super.ngOnDestroy();
  }
}
