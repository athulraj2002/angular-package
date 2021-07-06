import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FieldParamInterface, PopBaseEventInterface } from '../../../../../../pop-common.model';
import { NumberConfig } from '../../../../../base/pop-field-item/pop-number/number-config.model';
import { IsDefined } from '../../../../../../pop-common-utility';


@Component( {
  selector: 'lib-field-number-param',
  template: `
    <lib-pop-number (events)="events.emit($event);" [config]=param></lib-pop-number>`,
} )
export class FieldNumberParamComponent implements OnInit, OnDestroy {
  @Input() config: FieldParamInterface;
  @Output() events: EventEmitter<PopBaseEventInterface> = new EventEmitter<PopBaseEventInterface>();

  param: NumberConfig;


  constructor(){
  }


  ngOnInit(){
    const defaultValue = IsDefined( this.config.default_value ) ? +this.config.default_value : 255;
    const configInterface = <FieldParamInterface>{
      label: this.config.label,
      name: this.config.name,
      value: this.config.value ? this.config.value : this.config.default_value,
      patch: this.config.patch,
      facade: this.config.facade,
      min: 1,
      max: defaultValue,
      metadata: this.config.metadata ? this.config.metadata : {}
    };
    if( this.config.name === 'maxlength' ){
      configInterface.helpText = `Limit: ${defaultValue}`;
    }

    this.param = new NumberConfig( configInterface );
  }


  ngOnDestroy(){
  }

}
