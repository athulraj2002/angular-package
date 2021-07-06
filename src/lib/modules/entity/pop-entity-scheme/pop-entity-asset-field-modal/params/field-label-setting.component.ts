import { ChangeDetectorRef, Component, Input, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { PopCommonService } from '../../../../../services/pop-common.service';
import { FieldSettingInterface } from '../../pop-entity-scheme.model';


@Component({
  selector: 'lib-field-asset-param',
  template: `
    <div class="field-builder-param-container">
      <div class="field-builder-param-title-container mat-h2">
        <div class="field-builder-param-title">{{config.name}}</div>
      </div>
    </div>`,
})
export class FieldLabelSettingComponent implements OnInit {

  @Input() config: FieldSettingInterface;

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

  active ={
    item: undefined
  };

  models = {};

  configs = {};


  constructor(private commonRepo: PopCommonService,
              private changeDetectorRef: ChangeDetectorRef){
  }


  ngOnInit(){

  }
}
