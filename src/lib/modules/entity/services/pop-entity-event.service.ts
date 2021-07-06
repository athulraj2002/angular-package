import { EventEmitter, Injectable } from '@angular/core';
import { PopBaseEventInterface } from '../../../pop-common.model';

@Injectable({ providedIn: 'root' })
export class PopEntityEventService {
  events: EventEmitter<PopBaseEventInterface> = new EventEmitter<PopBaseEventInterface>();
  sendEvent(event: PopBaseEventInterface){
    this.events.emit(event);
  }
}



