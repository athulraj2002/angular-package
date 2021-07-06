import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ButtonConfig } from './button-config.model';
import { PopBaseEventInterface } from '../../../../pop-common.model';


@Component({
  selector: 'lib-pop-button',
  templateUrl: './pop-button.component.html',
  styleUrls: [ './pop-button.component.scss' ],
})
export class PopButtonComponent implements OnInit, OnDestroy {
  @Input() config: ButtonConfig = new ButtonConfig();
  @Output() events: EventEmitter<PopBaseEventInterface> = new EventEmitter();

  public name ='PopButtonComponent';


  ngOnInit(){
  }


  onClick(event){
    this.emitInputEvent(this.config.event);
  }


  emitInputEvent(name, message: string = null): void{
    if( this.config.bubble ) this.events.emit({ source: this.name, type: 'field', name: name, config: this.config, message: message });
  }


  ngOnDestroy(){
  }
}
