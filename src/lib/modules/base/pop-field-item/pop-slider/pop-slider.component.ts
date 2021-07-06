import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { PopFieldItemComponent } from '../pop-field-item.component';
import { FormControl } from '@angular/forms';
import { SliderConfig } from './pop-slider.model';
import { PopBaseEventInterface } from '../../../../pop-common.model';


@Component({
  selector: 'lib-pop-slider',
  templateUrl: './pop-slider.component.html',
  styleUrls: [ './pop-slider.component.scss' ]
})
export class PopSliderComponent extends PopFieldItemComponent implements OnInit, OnDestroy {
  @Input() config: SliderConfig = new SliderConfig();
  @Output() events: EventEmitter<PopBaseEventInterface> = new EventEmitter<PopBaseEventInterface>();
  public name = 'PopSliderComponent';


  constructor(){
    super();
    this.dom.state.helper = false;
    this.dom.state.tooltip = false;
  }


  ngOnInit(): void{
    super.ngOnInit();
  }


  /**
   * On Change event
   * @param value
   * @param force
   */
  onChange(value?: any, force = false){
    const control = <FormControl>this.config.control;
    if( typeof value !== 'undefined' ){
      control.setValue(value);
      control.markAsDirty();
      control.updateValueAndValidity();
    }
    if( this._isChangeValid() ){
      value = typeof value !== 'undefined' ? value : this.config.control.value;
      value = this._applyTransformation(value);
      if( this.config.patch && this.config.patch && ( this.config.patch.path || this.config.facade ) ){
        this._onPatch(value, false);
      }else{
        this.onBubbleEvent('onChange');
      }
    }
  }

  getSliderTickInterval(): number | 'auto'{
    if( this.config.showTicks ){
      return this.config.autoTicks ? 'auto' : this.config.tickInterval;
    }

    return 0;
  }


  /**
   * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
   */
  ngOnDestroy(){
    super.ngOnDestroy();
  }

}
