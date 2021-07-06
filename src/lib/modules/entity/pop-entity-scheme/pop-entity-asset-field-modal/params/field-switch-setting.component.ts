import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SwitchConfig } from '../../../../base/pop-field-item/pop-switch/switch-config.model';
import { PopCommonService } from '../../../../../services/pop-common.service';
import { FieldSettingInterface } from '../../pop-entity-scheme.model';
import { PopBaseEventInterface } from '../../../../../pop-common.model';


@Component({
  selector: 'lib-field-switch-setting',
  template: `<lib-pop-switch (events)="events.emit($event);" [config]=param></lib-pop-switch>`,
})
export class FieldSwitchSettingComponent implements OnInit {

  @Input() config: FieldSettingInterface;
  @Output() events: EventEmitter<PopBaseEventInterface> = new EventEmitter<PopBaseEventInterface>();

  param: SwitchConfig;


  constructor(private commonRepo: PopCommonService,
              private changeDetectorRef: ChangeDetectorRef){
  }


  ngOnInit(){
    this.param = new SwitchConfig({
      label: this.config.label,
      name: this.config.name,
      value: this.config.value,
      patch: this.config.patch
    });
  }


}
