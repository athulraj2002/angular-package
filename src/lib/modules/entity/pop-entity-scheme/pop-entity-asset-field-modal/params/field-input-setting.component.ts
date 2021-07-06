import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { InputConfig } from '../../../../base/pop-field-item/pop-input/input-config.model';
import { FieldParamInterface, PopBaseEventInterface } from '../../../../../pop-common.model';
import { PopExtendComponent } from '../../../../../pop-extend.component';
import { IsDefined } from '../../../../../pop-common-utility';


@Component({
  selector: 'lib-field-asset-param',
  template: `
    <lib-pop-input (events)="onBubbleEvent($event);" [config]=ui.param></lib-pop-input><div class="sw-mar-vrt-sm sw-clear"></div>`,
})
export class FieldInputSettingComponent extends PopExtendComponent implements OnInit, OnDestroy {
  @Input() config: FieldParamInterface;

  public name = 'FieldInputSettingComponent';


  constructor(
    public el: ElementRef,
  ){
    super();
    /**
     * Configure the specifics of this component
     */
    this.dom.configure = (): Promise<boolean> => {
      return new Promise((resolve) => {
        this.ui.param = new InputConfig({
          label: this.config.label,
          name: this.config.name,
          value: IsDefined(this.config.value) ? this.config.value : this.config.defaultValue,
          readonly: this.config.readonly,
          patch: this.config.patch
        });

        return resolve(true);
      });
    };
  }


  /**
   * This component will product an html field to capture a field item setting value
   */
  ngOnInit(){
    super.ngOnInit();
  }


  /**
   * Handle events from the data capture
   * @param event
   */
  onBubbleEvent(event: PopBaseEventInterface){
    this.events.emit(event);
  }


  /**
   * Clean up the dom of this component
   */
  ngOnDestroy(){
    super.ngOnDestroy();
  }

}
