import { ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { PopFieldItemComponent } from '../pop-field-item.component';
import { MinMaxConfig } from './min-max.models';
import { PopBaseEventInterface } from '../../../../pop-common.model';
import { IsObjectThrowError } from '../../../../pop-common-utility';


@Component({
  selector: 'lib-pop-min-max',
  templateUrl: './pop-min-max.component.html',
  styleUrls: [ './pop-min-max.component.scss' ]
})
export class PopMinMaxComponent extends PopFieldItemComponent implements OnInit, OnDestroy {
  @Input() config: MinMaxConfig;

  public name = 'PopMinMaxComponent';


  constructor(
    public el: ElementRef,
    protected cdr: ChangeDetectorRef
  ){
    super();

    this.asset.delay = 250;

    /**
     * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
     */
    this.dom.configure = (): Promise<boolean> => {
      return new Promise((resolve) => {
        this.config = IsObjectThrowError(this.config, true, `${this.name}:configure: - this.config`) ? this.config : null;

        this.config.triggerOnChange = (value: string | number | null) => {
          this._setControlValue();
          this.cdr.detectChanges();
          this.onChange(value, true);
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


  onIsMaxEvent(event: PopBaseEventInterface){
    if( this._isFieldChange(event) ){
      this.config.maxConfig.control.setValue(( event.config.control.value ? ( +this.config.control.value[this.config.minColumn] ? +this.config.control.value[this.config.minColumn] : +this.config.maxDefaultValue ) : null ));
      this._triggerMaxChange();
    }
  }


  onIsMinEvent(event: PopBaseEventInterface){
    if( this._isFieldChange(event) ){
      console.log('onIsMinEvent', event.config.control.value);
      this.config.minConfig.control.setValue(( event.config.control.value ? +this.config.minDefaultValue : null ));
    }
  }


  onMinEvent(event: PopBaseEventInterface){
    // console.log('onMinEvent', event);
    if( this._isFieldChange(event) ){
      this._triggerMinChange();
    }
  }


  onMaxEvent(event: PopBaseEventInterface){
    // console.log('onMaxEvent', event);
    if( this._isFieldChange(event) ){
      this._triggerMaxChange();
    }
  }


  onDecrementMin(){
    const control = this.config.minConfig.control;
    const newVal = +this.config.minConfig.control.value - 1;
    if( ( newVal ) >= 1 ){
      control.setValue(newVal);
      this._triggerMinChange();
    }
  }


  onIncrementMin(){
    const control = this.config.minConfig.control;
    const newVal = +this.config.minConfig.control.value + 1;
    const maxVal = +this.config.maxConfig.control.value;
    if( ( newVal ) <= maxVal ){
      control.setValue(newVal);
      this.dom.setTimeout('on-change', () => {
        this._clearMessage();
        this._setControlValue();
        this.onChange(undefined, true);
      }, this.asset.delay);
    }
  }


  onDecrementMax(){
    const control = this.config.maxConfig.control;
    const newVal = +this.config.maxConfig.control.value - 1;
    if( ( newVal ) >= 1 ){
      control.setValue(newVal);
      this._triggerMaxChange();
    }
  }


  onIncrementMax(){
    const control = this.config.maxConfig.control;
    const newVal = +this.config.maxConfig.control.value + 1;
    if( ( newVal ) <= this.config.limit ){
      control.setValue(newVal);
      this._triggerMaxChange();
    }
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


  private _triggerMinChange(){
    this.dom.setTimeout('on-change', () => {
      this._clearMessage();
      this._setControlValue();
      this.onChange(undefined, true);
    }, this.asset.delay);
  }


  private _triggerMaxChange(){
    this.dom.setTimeout('on-change', () => {
      this._clearMessage();
      this._updateMinOptions();
      this._setControlValue();
      this.onChange(undefined, true);
    }, this.asset.delay);
  }


  private _updateMinOptions(){
    // let minLimit = this.config.maxConfig.control.value;
    // const minOptions = [];
    // while( minLimit ){
    //   minOptions.push({ value: minLimit, name: minLimit, sort: minLimit });
    //   minLimit--;
    // }
    // this.config.minConfig.options = minOptions;
  }


  private _setControlValue(){
    const maxValue = this.config.maxConfig.control.value;
    let minValue = this.config.minConfig.control.value;
    if( !this.config.allowNegative && minValue < 0 ){
      minValue = 0;
      this.config.minConfig.control.setValue(minValue);
    }
    if( maxValue && +minValue > +maxValue ){
      minValue = maxValue;
      this.config.minConfig.control.setValue(minValue);
    }

    const value = {};
    value[ this.config.minColumn ] = ( minValue ? +minValue : minValue );
    value[ this.config.maxColumn ] = ( maxValue ? +maxValue : maxValue );
    this.config.control.value = value;
  }
}
