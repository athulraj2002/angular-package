import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FieldParamInterface, PopBaseEventInterface, PopLog } from '../../../../../../pop-common.model';
import { SliderConfig, SliderConfigInterface } from '../../../../../base/pop-field-item/pop-slider/pop-slider.model';


@Component({
  selector: 'lib-field-slider-param',
  template: `
    <lib-pop-slider (events)="events.emit($event);" [config]=param></lib-pop-slider>
  `,
})
export class FieldSliderParamComponent implements OnInit {
  @Input() config: FieldParamInterface;
  @Output() events: EventEmitter<PopBaseEventInterface> = new EventEmitter<PopBaseEventInterface>();
  public name = 'FieldSliderParamComponent';

  param: SliderConfig;


  /**
   * This component expects config to be a Label config
   */
  ngOnInit(){
    if( !this.config.value ) this.config.value = this.config.defaultValue;
    this.param = new SliderConfig(<SliderConfigInterface>{
      name: this.config.name,
      label: this.config.label,
      column: this.config.column,
      value: this.config.value ? this.config.value : this.config.defaultValue,
      min: this.config.min ? this.config.min : 1,
      max: this.config.defaultValue,
      facade: this.config.facade,
      patch: this.config.patch,
      metadata: this.config.metadata ? this.config.metadata : {}
    });
    PopLog.init(this.name, `init`, this);
  }
}
