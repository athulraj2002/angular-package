import { OnInit } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { PopContextMenuConfig, PopContextMenuOption } from './pop-context-menu.model';
export declare class PopContextMenuComponent implements OnInit {
    config: PopContextMenuConfig;
    trigger: MatMenuTrigger;
    constructor();
    ngOnInit(): void;
    onMenuClick(option: PopContextMenuOption): void;
}
