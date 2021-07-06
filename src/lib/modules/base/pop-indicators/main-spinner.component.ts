import { Component, Input, OnInit } from '@angular/core';
import { MainSpinner } from './pop-indicators.model';


@Component({
  selector: 'lib-main-spinner',
  templateUrl: 'main-spinner.component.html',
  styleUrls: ['main-spinner.component.scss']
})
export class MainSpinnerComponent implements OnInit {
  @Input() options: MainSpinner;
  color: string;
  mode: string;
  diameter: number;
  strokeWidth: number;


  ngOnInit(){
    if( !this.options ) this.options = {};
    this.color = this.options.color ? this.options.color : 'primary';
    this.mode = this.options.mode ? this.options.mode : 'indeterminate';
    this.diameter = this.options.diameter ? this.options.diameter : 75;
    this.strokeWidth = this.options.strokeWidth ? this.options.strokeWidth : 12;
  }
}
