import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { PopCommonService } from '../../../../../../services/pop-common.service';
import { FieldParamInterface, PopBaseEventInterface } from '../../../../../../pop-common.model';
import { RadioConfig } from '../../../../../base/pop-field-item/pop-radio/radio-config.model';


@Component({
  selector: 'lib-field-radio-param',
  template: `<lib-pop-radio (events)="events.emit($event);" [config]=param></lib-pop-radio>`,
})
export class FieldRadioParamComponent implements OnInit, OnDestroy {
  @Input() config: FieldParamInterface;
  @Output() events: EventEmitter<PopBaseEventInterface> = new EventEmitter<PopBaseEventInterface>();

  param: RadioConfig;


  constructor(private commonRepo: PopCommonService,
              private changeDetectorRef: ChangeDetectorRef){
  }


  ngOnInit(){
    this.param = new RadioConfig({
      label: (this.config.label ? this.config.label: this.config.name),
      name: this.config.name,
      layout: 'row',
      value: this.config.value ? this.config.value: this.config.defaultValue,
      patch: this.config.patch,
      options: this.config.options,
      facade: this.config.facade,
      metadata: this.config.metadata ? this.config.metadata : {}
    });
  }


  ngOnDestroy(){
  }

}
