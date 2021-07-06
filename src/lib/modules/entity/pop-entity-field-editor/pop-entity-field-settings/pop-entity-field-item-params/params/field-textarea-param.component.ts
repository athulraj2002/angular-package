import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FieldParamInterface, PopBaseEventInterface } from '../../../../../../pop-common.model';
import { TextareaConfig } from '../../../../../base/pop-field-item/pop-textarea/textarea-config.model';
import { IsDefined } from '../../../../../../pop-common-utility';


@Component({
  selector: 'lib-field-textarea-param',
  template: `
    <lib-pop-textarea (events)="events.emit($event);" [config]=param></lib-pop-textarea>`,
})
export class FieldTextareaParamComponent implements OnInit {
  @Input() config: FieldParamInterface;
  @Output() events: EventEmitter<PopBaseEventInterface> = new EventEmitter<PopBaseEventInterface>();

  param: TextareaConfig;


  ngOnInit(){
    this.param = new TextareaConfig({
      name: this.config.name,
      label: this.config.label,
      column: this.config.column,
      value: IsDefined(this.config.value) ? this.config.value : this.config.defaultValue,
      height: 70,
      facade: this.config.facade,
      patch: this.config.patch,
      metadata: this.config.metadata ? this.config.metadata : {}
    });
  }
}
