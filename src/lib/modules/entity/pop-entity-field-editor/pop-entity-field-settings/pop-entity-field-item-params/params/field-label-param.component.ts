import { Component, Input, OnInit } from '@angular/core';
import { FieldParamInterface } from '../../../../../../pop-common.model';

@Component({
  selector: 'lib-field-label-param',
  template: `
    <div class="field-builder-param-container">
      <div class="field-builder-param-title-container mat-h2">
        <div class="field-builder-param-title">{{config.name}}</div>
      </div>
    </div>`,
})
export class FieldLabelParamComponent implements OnInit {
  @Input() config: FieldParamInterface;


  /**
   * This component expects config to be a Label config
   */
  ngOnInit(){

  }
}
