import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FieldParamInterface, PopBaseEventInterface } from '../../../../../../pop-common.model';
import { SwitchConfig } from '../../../../../base/pop-field-item/pop-switch/switch-config.model';
import { IsDefined} from '../../../../../../pop-common-utility';


@Component({
  selector: 'lib-field-switch-param',
  template: `
    <lib-pop-switch (events)="events.emit($event);" [config]=param></lib-pop-switch>`,
})
export class FieldSwitchParamComponent implements OnInit {
  @Input() config: FieldParamInterface;
  @Output() events: EventEmitter<PopBaseEventInterface> = new EventEmitter<PopBaseEventInterface>();

  param: SwitchConfig;


  ngOnInit(){
    this.param = new SwitchConfig({
      name: this.config.name,
      label: this.config.label,
      labelPosition: 'after',
      value: IsDefined(this.config.value) ? this.config.value : this.config.defaultValue,
      patch: this.config.patch,
      facade: this.config.facade,
      metadata: this.config.metadata ? this.config.metadata : {}
    });
  }
}
