import { PopDatetimeService } from './../../../services/pop-datetime.service';
import { OnInit, OnDestroy } from '@angular/core';
import { PopExtendComponent } from '../../../pop-extend.component';
import { SwitchConfig } from '../../base/pop-field-item/pop-switch/switch-config.model';
import { PopBaseEventInterface } from '../../../pop-common.model';
import { PopEntityEventService } from '../services/pop-entity-event.service';
import { PopTabMenuService } from '../../base/pop-tab-menu/pop-tab-menu.service';
import { PopDomService } from '../../../services/pop-dom.service';
import { ButtonConfig } from '../../base/pop-field-item/pop-button/button-config.model';
export declare class PopEntityStatusComponent extends PopExtendComponent implements OnInit, OnDestroy {
    protected _domRepo: PopDomService;
    protected _tabRepo: PopTabMenuService;
    name: string;
    ui: {
        archive: SwitchConfig;
        valueButton: ButtonConfig;
        createdDate: string;
        showCopied: boolean;
    };
    protected srv: {
        events: PopEntityEventService;
        tab: PopTabMenuService;
        date: PopDatetimeService;
    };
    constructor(_domRepo: PopDomService, _tabRepo: PopTabMenuService);
    ngOnInit(): void;
    onLabelCopy(): void;
    onArchiveChange(event: PopBaseEventInterface): void;
    ngOnDestroy(): void;
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    private _setDate;
    private _setArchiveSwitch;
    private _handleArchive;
}
