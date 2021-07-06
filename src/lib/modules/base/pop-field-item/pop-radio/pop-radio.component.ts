import { Component, ElementRef, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { MatRadioChange } from '@angular/material/radio';
import { RadioConfig } from './radio-config.model';
import { PopFieldItemComponent } from '../pop-field-item.component';


@Component({
  selector: 'lib-pop-radio',
  templateUrl: './pop-radio.component.html',
  styleUrls: [ './pop-radio.component.scss' ],
})
export class PopRadioComponent extends PopFieldItemComponent implements OnInit, OnDestroy {
  @Input() config: RadioConfig;
  public name = 'PopRadioComponent';


  constructor(
    public el: ElementRef,
  ){
    super();

    /**
     * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
     */
    this.dom.configure = (): Promise<boolean> => {
      return new Promise((resolve) => {
        this.asset.storedValue = this.config.control.value;
        this.asset.spinnerRef = this.el.nativeElement.querySelector('.radio-ajax-spinner'); // would use a @viewChild but it returns a component model instead of an element.. weird

        this.config.triggerOnChange = ( value: string | number | null ) => {
          this.dom.setTimeout( `config-trigger-change`, () => {
            this.onChange( value, true );
          }, 0 );
        };

        this.config.clearMessage = () => {
          this.dom.setTimeout( `config-clear-message`, () => {
            this.config.message = '';
            this.config.control.markAsPristine();
            this.config.control.markAsUntouched();
            // this.cdr.detectChanges();
          }, 0 );
        };

        resolve(true);
      });
    };
  }


  /**
   * This component should have a specific purpose
   */
  ngOnInit(){
    super.ngOnInit();
  }
  

  onSelection(change: MatRadioChange){
    this.asset.change = change;
    this.onChange();
  }


  /**
   * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
   */
  ngOnDestroy(){
    super.ngOnDestroy();
  }
}
