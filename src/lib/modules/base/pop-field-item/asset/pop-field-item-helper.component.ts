import { Component, HostBinding, Input, OnInit } from '@angular/core';


@Component({
  selector: 'lib-pop-field-item-helper',
  template: `
    <span class="pop-field-item-help-text material-icons sw-pointer"
          *ngIf="!hidden && helpText"
          (mouseenter)="helper = true"
          (mouseleave)="helper = false"
          matTooltip="{{helpText}}"
          matTooltipPosition="above">help_outline
    </span>
  `,
  styles: [ `
    .pop-field-item-help-text {
      position: relative;
      font-size: 1.5em;
      color: var(--text-disabled);
      z-index: 2;
    }` ]
})
export class PopFieldItemHelperComponent implements OnInit {
  @Input() helpText;
  @HostBinding('class.sw-hidden') @Input() hidden = false;
  helper;


  constructor(){
    if( !this.helpText ) this.helpText = '';
  }


  ngOnInit(){
  }

}
