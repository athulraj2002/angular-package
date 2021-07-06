import { EventEmitter } from "@angular/core";
export declare class LibTrackCapsLockDirective {
    capsLock: EventEmitter<Boolean>;
    onKeyDown(event: KeyboardEvent): void;
    onKeyUp(event: KeyboardEvent): void;
}
