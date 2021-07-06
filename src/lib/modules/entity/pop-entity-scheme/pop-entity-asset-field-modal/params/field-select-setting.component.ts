import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SelectConfig } from '../../../../base/pop-field-item/pop-select/select-config.model';
import { Subscription } from 'rxjs';
import { PopCommonService } from '../../../../../services/pop-common.service';
import { FieldSettingInterface } from '../../pop-entity-scheme.model';
import { PopBaseEventInterface } from '../../../../../pop-common.model';
import { ConvertArrayToOptionList } from '../../../../../pop-common-utility';


@Component({
  selector: 'lib-field-select-setting',
  template: `
    <lib-pop-select (events)="events.emit($event);" [config]=param></lib-pop-select><div class="sw-mar-vrt-sm sw-clear"></div>`,
})
export class FieldSelectSettingComponent implements OnInit {

  @Input() config: FieldSettingInterface;
  @Output() events: EventEmitter<PopBaseEventInterface> = new EventEmitter<PopBaseEventInterface>();

  param: SelectConfig;

  state = {
    selected: 0,
    system: false,
    loaded: false,
    loading: false,
    error: { code: 0, message: '' },
  };

  subscriber = {
    data: <Subscription>undefined,
  };

  field = {
    type: '',
    items: undefined,
    active: {},
  };

  active = {
    item: undefined
  };

  models = {};

  configs = {};


  ngOnInit(){
    this.param = new SelectConfig({
      label: this.config.label,
      name: this.config.name,
      value: this.config.value ? this.config.value : this.config.default,
      options: {values: ConvertArrayToOptionList(this.config.options.values)},
      patch: this.config.patch
    });
  }
}
