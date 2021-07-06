import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';


@Component({
  template: `
    <div class="pop-template-buffer">
      <div class="pop-template-ajax-row" *ngIf="data.expression">
        <h5>{{data.expression}}</h5>
      </div>
      <div class="pop-template-buffer-row">
        <mat-progress-bar
          [color]="color"
          [mode]="mode"
          [value]="value"
          [bufferValue]="bufferValue">
        </mat-progress-bar>
      </div>
    </div>
  `,
  styles: [ `
    .pop-template-buffer {
      display: flex;
      flex-direction: column;
      width: 100%;
      min-height: 30px;
      justify-content: center;
      align-items: center;
      font-size: 1.5em;
      background: var(--background-code);
    }

    .pop-template-buffer-row {
      display: flex;
      width: 100%;
      min-height: 30px;
      justify-content: center;
      align-items: center;
      clear: both;
    }
  ` ]
})
export class PopTemplateBufferComponent implements OnInit, OnDestroy {
  expression;
  color = 'primary';
  mode = 'buffer';
  bufferValue = 100;
  value = 0;
  interval;

  constructor(@Inject(MAT_SNACK_BAR_DATA) public data){
  }


  ngOnInit(){
    this._meterProgress();
  }


  ngOnDestroy(){
    if( this.interval ) clearInterval(this.interval);
  }


  private _meterProgress(){
    this.interval = setInterval(() => {
      this.bufferValue -= 5;
      this.value += 5;
      if( this.value >= 100 ) clearInterval(this.interval);
    }, 175, 50);
  }
}
