import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { RadioConfig } from '../../../../base/pop-field-item/pop-radio/radio-config.model';
import { PopCommonService } from '../../../../../services/pop-common.service';
import { FieldSettingInterface } from '../../pop-entity-scheme.model';
import { PopBaseEventInterface } from '../../../../../pop-common.model';


@Component({
  selector: 'lib-field-radio-param',
  template: `<lib-pop-radio (events)="events.emit($event);" [config]=param></lib-pop-radio><div class="sw-mar-vrt-sm sw-clear"></div>`,
})
export class FieldRadioSettingComponent implements OnInit, OnDestroy {
  @Input() config: FieldSettingInterface;
  @Output() events: EventEmitter<PopBaseEventInterface> = new EventEmitter<PopBaseEventInterface>();

  param: RadioConfig;


  constructor(private commonRepo: PopCommonService,
              private changeDetectorRef: ChangeDetectorRef){
  }


  ngOnInit(){
    this.param = new RadioConfig({
      label: this.config.label,
      name: this.config.name,
      layout: 'row',
      value: this.config.value,
      patch: this.config.patch,
      options: this.config.options
    });
  }


  ngOnDestroy(){
  }

}
