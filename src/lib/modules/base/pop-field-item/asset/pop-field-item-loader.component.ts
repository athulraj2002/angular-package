import { Component, Input, OnInit } from '@angular/core';


@Component({
  selector: 'lib-pop-field-item-loader',
  template: `
    <mat-progress-bar
      class="pop-field-item-loader"
      *ngIf="show"
      [style.height.px]="1"
      [mode]="'query'"
    >
    </mat-progress-bar>
  `,
  styles: [ ':host { position: absolute; bottom:0; left: 0; right: 0 }' ]
})
export class PopFieldItemLoaderComponent implements OnInit {
  @Input() show = false;


  ngOnInit(){
  }

}
