import { Subject } from 'rxjs';
import { EventEmitter } from '@angular/core';
import { PopBaseEventInterface, PopPipe } from '../../../pop-common.model';
import { TitleCase } from '../../../pop-common-utility';


export interface PopContextMenuConfigInterface {
  // defaultOptions: string[];
  options?: PopContextMenuOption[];
  newTabUrl?: string;
}


export class PopContextMenuConfig {
  x: number;
  y: number;
  toggle: Subject<boolean>;
  options: PopContextMenuOption[];
  newTabUrl?: string;
  emitter: EventEmitter<PopBaseEventInterface> = new EventEmitter<PopBaseEventInterface>();


  constructor(config?: PopContextMenuConfigInterface){
    this.toggle = new Subject<boolean>();
    this.x = 0;
    this.y = 0;
    this.options = [];
    this.newTabUrl = '';
    if( config != undefined && config.newTabUrl ){
      const newTabOption: PopContextMenuOption = {
        label: 'Open Link in new tab',
        type: 'new_tab',
        url: config.newTabUrl,
      };
      this.options.push(newTabOption);
    }
    if( config != undefined && config.options !== undefined && config.options.length != 0 ){
      for( const option of config.options ) this.options.push(option);
    }
  }


  public addNewTabOption(url: string){
    const newTabOption: PopContextMenuOption = {
      label: 'Open Link in new tab',
      type: 'new_tab',
      url: url,
    };
    this.options.push(newTabOption);
  }


  public addPortalOption(internal_name: string = '', id: number){
    const label = TitleCase(PopPipe.transform(internal_name, {type:'entity', arg1: 'alias', arg2: 'singular'})).replace(/_/g, ' ').trim();
    const newTabOption: PopContextMenuOption = {
      label: `View ${label}`,
      type: 'portal',
      metadata: {
        internal_name: internal_name,
        id: id
      }
    };
    this.options.push(newTabOption);
  }


  public addOption(option: PopContextMenuOption){
    this.options.push(option);
  }


  public resetOptions(){
    this.options = [];
  }
}


export interface PopContextMenuOption {
  label: string;
  type: string;
  url?: string;
  subMenus?: PopContextMenuOption[];
  metadata?: any;
}


export interface PopContextMenuEvent {
  option: PopContextMenuOption;
}
