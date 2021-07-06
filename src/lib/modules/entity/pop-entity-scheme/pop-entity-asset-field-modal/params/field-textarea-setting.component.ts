import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TextareaConfig } from '../../../../base/pop-field-item/pop-textarea/textarea-config.model';
import { FieldSettingInterface } from '../../pop-entity-scheme.model';
import { PopBaseEventInterface } from '../../../../../pop-common.model';

@Component({
  selector: 'lib-field-textarea-setting',
  template: `<lib-pop-textarea (events)="events.emit($event);" [config]=param></lib-pop-textarea>`,
})
export class FieldTextareaSettingComponent implements OnInit {

  @Input() config: FieldSettingInterface;
  @Output() events: EventEmitter<PopBaseEventInterface> = new EventEmitter<PopBaseEventInterface>();

  param: TextareaConfig;


  constructor(private changeDetectorRef: ChangeDetectorRef){
  }


  ngOnInit(){
    this.param = new TextareaConfig({
      label: this.config.label,
      name: this.config.name,
      value: this.config.value ? this.config.value : this.config.default,
      height: 70,
    });
  }

}
