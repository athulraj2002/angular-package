import { Subject } from 'rxjs';
import { EventEmitter } from '@angular/core';
import { PopBaseEventInterface } from '../../../pop-common.model';
export interface PopContextMenuConfigInterface {
    options?: PopContextMenuOption[];
    newTabUrl?: string;
}
export declare class PopContextMenuConfig {
    x: number;
    y: number;
    toggle: Subject<boolean>;
    options: PopContextMenuOption[];
    newTabUrl?: string;
    emitter: EventEmitter<PopBaseEventInterface>;
    constructor(config?: PopContextMenuConfigInterface);
    addNewTabOption(url: string): void;
    addPortalOption(internal_name: string, id: number): void;
    addOption(option: PopContextMenuOption): void;
    resetOptions(): void;
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
