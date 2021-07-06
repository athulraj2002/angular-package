import { EventEmitter } from '@angular/core';
import { PopBaseEventInterface } from '../../../pop-common.model';
export declare class PopEntityEventService {
    events: EventEmitter<PopBaseEventInterface>;
    sendEvent(event: PopBaseEventInterface): void;
}
