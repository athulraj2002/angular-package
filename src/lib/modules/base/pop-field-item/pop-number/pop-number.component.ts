import { ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { PatternValidation, ValidationErrorMessages } from '../../../../services/pop-validators';
import { PopFieldItemComponent } from '../pop-field-item.component';
import { NumberConfig } from './number-config.model';
import { FieldItemPatchInterface } from '../../../../pop-common.model';
import { FormControl } from '@angular/forms';


@Component({
  selector: 'lib-pop-number',
  templateUrl: './pop-number.component.html',
  styleUrls: [ './pop-number.component.scss' ]
})
export class PopNumberComponent extends PopFieldItemComponent implements OnInit, OnDestroy {
  @Input() config: NumberConfig = new NumberConfig();
  public name = 'PopNumberComponent';


  constructor(
    public el: ElementRef,
    protected cdr: ChangeDetectorRef,
  ){
    super();

    /**
     * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
     */
    this.dom.configure = (): Promise<boolean> => {
      return new Promise((resolve) => {

        this.config.triggerOnChange = (value: string | number | null, forcePatch = false) => {
          this.cdr.detectChanges();
          this.onChange(value, forcePatch);
        };

        this.config.triggerDirectPatch = (value: string | number | null) => {
          this._onPatch(value, true);
        };

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


  /**
   * Test
   * @param event
   */
  onKeyUp(event): void{
    if( event.code === 'Enter' ){
      if( this.config.control.invalid ){
        if( this.config.displayErrors ) this._setMessage(ValidationErrorMessages(this.config.control.errors));
      }else{
        if( this.config.patch && ( this.config.patch.path || this.config.facade ) ){
          if( this.config.control.value !== this.asset.storedValue ){
            if( this._isFieldPatchable() ){
              this.onChange();
            }
          }
        }
      }
    }else{
      this.onBubbleEvent('onKeyUp');
    }
  }


  /**
   * Hook that is called right before a patch
   */
  protected _beforePatch(): Promise<boolean>{
    return new Promise((resolve) => {
      const patch = <FieldItemPatchInterface>this.config.patch;
      const control = <FormControl>this.config.control;

      this._checkValue();


      control.disable();
      patch.running = true;

      return resolve(true);
    });
  }


  /**
   * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
   */
  ngOnDestroy(){
    super.ngOnDestroy();
  }


  private _checkValue(){
    const control = <FormControl>this.config.control;
    if( control.value > this.config.max ){
      control.setValue(this.config.max, { emitEvent: false });
    }else if( control.value < this.config.min ){
      control.setValue(this.config.min, { emitEvent: false });
    }
  }

}
