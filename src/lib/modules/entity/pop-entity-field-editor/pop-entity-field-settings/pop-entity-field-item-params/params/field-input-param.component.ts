import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FieldParamInterface, PopBaseEventInterface } from '../../../../../../pop-common.model';
import { InputConfig } from '../../../../../base/pop-field-item/pop-input/input-config.model';
import { Validators } from '@angular/forms';


@Component({
  selector: 'lib-field-input-param',
  template: `
    <lib-pop-input (events)="events.emit($event);" [config]=param></lib-pop-input>`,
})
export class FieldInputParamComponent implements OnInit {
  @Input() config: FieldParamInterface;
  @Output() events: EventEmitter<PopBaseEventInterface> = new EventEmitter<PopBaseEventInterface>();

  param: InputConfig;


  constructor(){
  }


  ngOnInit(){
    const validators = [];
    if( this.config.required ) validators.push(Validators.required);
    this.param = new InputConfig({
      name: this.config.name,
      label: this.config.label,
      value: this.config.value ? this.config.value : this.config.defaultValue,
      readonly: this.config.readonly,
      validators: validators,
      patch: this.config.patch,
      facade: this.config.facade,
      metadata: this.config.metadata ? this.config.metadata : {}
    });
  }
}
