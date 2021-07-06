import { Inject, Injectable } from '@angular/core';
import { PopBaseEventInterface } from '../pop-common.model';


@Injectable({
  providedIn: 'root'
})
export class PopLogService {

  public name = 'PopLogService';


  constructor(
    @Inject('env') public env?
  ){
    if( this.enabled('init', this.name) ) console.log(this.message(`${this.name}:init`), this.color('init'));
  }


  message(message: string){
    return `%c${message}`;
  }


  color(type: string){
    let color = 'aqua';
    switch( type ){
      case 'warn':
        color = 'orange';
        break;
      case 'force':
      case 'error':
      case 'destroy':
        color = 'red';
        break;
      case 'info':
        color = 'aqua';
        break;
      case 'event':
        color = 'yellow';
        break;
      case 'onSession':
      case 'event-trigger':
        color = 'gold';
        break;
      case 'cache-in':
        color = 'green';
        break;
      case 'cache-out':
        color = 'darkgreen';
        break;
      case 'dom':
        color = 'brown';
        break;
      case 'debug':
        color = 'pink';
        break;
      case 'api':
        color = 'darkgreen';
        break;
      case 'config':
        color = 'pink';
        break;
      case 'theme':
        color = 'purple';
        break;
      default:
        color = 'aqua';
        break;
    }
    return `color: ${color}`;
  }


  enabled(type: string = '', component: string = null){
    if( this.env.debug ){
      if( type && Array.isArray(this.env.debugTypes) ){
        if( this.env.debugTypes.includes(type) ) return true;
      }
      if( typeof this.env.debugLevel === 'number' ){
        if( [ 'error', 'onSession' ].includes(type) && this.env.debug >= 1 ){
          return true;
        }
        if( [ 'warning', 'info' ].includes(type) && this.env.debug >= 2 ){
          return true;
        }
        if( [ 'events' ].includes(type) && this.env.debug >= 2 ){
          return true;
        }
      }
      if( component && typeof this.env.debugComponents === 'string' ){
        return this.env.debugComponents.search(component) > -1;
      }
    }
    return false;
  }


  init(componentName: string, message: string, data: any = '', force = false){
    const type = 'init';
    if( this.enabled(type, componentName) || force ) console.log(this.message(`${componentName}:${message}`), this.color(( force ? 'force' : type )), data);
  }

  debug(componentName: string, message: string, data: any = '', force = false){
    const type = 'debug';
    if( this.enabled(type, componentName) || force ) console.log(this.message(`${componentName}:${message}`), this.color(( force ? 'force' : type )), data);
  }


  cache(componentName: string, message: string,  set = true, force = false){
    let type = 'cache';
    if( this.enabled(type, componentName) || force ){
      type = set ? 'cache-in' : 'cache-out';
      console.log(this.message(`${componentName}:${message}`), this.color(( force ? 'force' : type )));
    }
  }


  warn(componentName: string, message: string, data: any = '', force = false){
    const type = 'warn';
    if( this.enabled(type, componentName) || force ) console.log(this.message(`${componentName}:${message}`), this.color(( force ? 'force' : type )), data);
  }


  info(componentName: string, message: string, data: any = '', force = false){
    const type = 'info';
    if( this.enabled(type, componentName) || force ) console.log(this.message(`${componentName}:${message}`), this.color(( force ? 'force' : type )), data);
  }


  theme(componentName: string, message: string, data: any = '', force = false){
    const type = 'theme';
    if( this.enabled(type, componentName) || force ) console.log(this.message(`${componentName}:${message}`), this.color(( force ? 'force' : type )), data);
  }


  event(componentName: string, message: string, event: PopBaseEventInterface, force = false){
    const type = 'event';
    if( this.enabled(type, componentName) || force ) console.log(this.message(`${componentName}:${message}`), this.color(( force ? 'force' : type )), event);
  }


  error(componentName: string, message: string, data: any = '', force = false){
    const type = 'error';
    if( this.enabled(type, componentName) || force ){
      console.log(this.message(`${componentName}:${message}`), this.color(( force ? 'force' : type )), data);
      // throw new Error('message');
    }
  }
}
