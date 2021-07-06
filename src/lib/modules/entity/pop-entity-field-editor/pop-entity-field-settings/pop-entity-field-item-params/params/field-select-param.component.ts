import { Component, EventEmitter, HostBinding, Input, OnInit, Output } from '@angular/core';
import { FieldParamInterface, PopBaseEventInterface } from '../../../../../../pop-common.model';
import { SelectConfig } from '../../../../../base/pop-field-item/pop-select/select-config.model';
import { ConvertArrayToOptionList, IsObject } from '../../../../../../pop-common-utility';


@Component( {
  selector: 'lib-field-select-param',
  template: `
    <lib-pop-select *ngIf="param" (events)="events.emit($event);" [config]=param></lib-pop-select>`,
} )
export class FieldSelectParamComponent implements OnInit {
  @Input() config: FieldParamInterface;
  @Output() events: EventEmitter<PopBaseEventInterface> = new EventEmitter<PopBaseEventInterface>();
  @HostBinding( 'class.sw-hidden' ) @Input() hidden = false;

  param: SelectConfig;


  ngOnInit(){
    if( IsObject( this.config, true ) ){
      this.param = new SelectConfig( {
        label: ( this.config.label ? this.config.label : this.config.name ),
        name: this.config.name,
        value: this.config.value ? this.config.value : this.config.defaultValue,
        options: {
          values: IsObject( this.config.options, [ 'values' ] ) ? ConvertArrayToOptionList( this.config.options.values ) : []
        },
        facade: this.config.facade,
        patch: this.config.patch,
        metadata: this.config.metadata ? this.config.metadata : {}
      } );
    }
    this.hidden = this.param.options.values.length === 0 ? true : false;
  }
}
