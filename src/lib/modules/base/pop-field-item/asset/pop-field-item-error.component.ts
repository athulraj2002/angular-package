import { Component, HostBinding, Input, OnInit } from '@angular/core';


@Component({
  selector: 'lib-pop-field-item-error',
  template: `
    <div class="sw-pointer pop-field-item-error"
         *ngIf="!hidden && message"
         matTooltipPosition="left"
         [matTooltip]=message>
      <mat-icon color="warn">error</mat-icon>
    </div>
  `,
  styles: [ `.pop-field-item-error {
    width: 20px;
    height: 20px;
    font-size: 1.1em;
    z-index: 2;
  }` ]
})
export class PopFieldItemErrorComponent implements OnInit {
  @Input() message: string;
  @HostBinding('class.sw-hidden') @Input() hidden = false;
  helper;


  constructor(){
    if( !this.message ) this.message = '';
  }


  ngOnInit(){
  }

}
