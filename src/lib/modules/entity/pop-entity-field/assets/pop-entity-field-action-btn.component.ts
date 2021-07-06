import {
  Component, EventEmitter,
  Inject,
  Input,
  OnDestroy,
  OnInit, Output,
} from '@angular/core';
import { FieldConfig, PopBaseEventInterface } from '../../../../pop-common.model';
import { TitleCase } from '../../../../pop-common-utility';


@Component({
  selector: 'lib-pop-field-btn',
  template: `
    <div class="field-action-btn" *ngIf="field.multiple">
      <mat-icon class="sw-pointer" matTooltip="{{tooltip}}" matTooltipPosition="above" (click)="callAction();">{{action}}</mat-icon>
    </div>
  `,
  styles: [ '.field-doAction-btn {background: var(--bg-1);border-radius: 50%;width: 14px;height: 14px; mar-top:2px; color: var(--accent);border-width: 1px;border-style: solid;border-color: var(--bg-3);box-shadow: 0 2px 5px 0 var(--darken18), 0 2px 10px 0 var(--darken12) !important; } .field-doAction-btn mat-icon {position:relative; top:-2px; left:1px; width: 12px;height: 12px;font-size: 12px;line-height: 16px;}' ]
})
export class PopEntityFieldActionBtnComponent implements OnInit, OnDestroy {
  @Input() field: FieldConfig;
  @Input() action: 'add' | 'remove';
  @Output() events: EventEmitter<PopBaseEventInterface> = new EventEmitter<PopBaseEventInterface>();

  icon: string;
  tooltip: string;


  constructor(
    @Inject('env') readonly env?
  ){
  }


  ngOnInit(){
    if( !this.action ) this.action = 'add';
    this.tooltip = TitleCase(this.action);
  }


  callAction(){
    this.events.emit({ source: 'PopEntityFieldActionBtnComponent', type: 'field', name: this.action, field: this.field });
  }


  ngOnDestroy(){
  }
}

