import { ChangeDetectorRef, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { PopBaseService } from '../../../services/pop-base.service';
import { PopEntityService } from '../services/pop-entity.service';
import { PopTabMenuService } from '../../base/pop-tab-menu/pop-tab-menu.service';
import { Dictionary, Entity, EntityParams, PopBaseEventInterface } from '../../../pop-common.model';
import { PopEntityEventService } from '../services/pop-entity-event.service';
import { MatDialog } from '@angular/material/dialog';
import { PopExtendComponent } from '../../../pop-extend.component';
import { PopDomService } from '../../../services/pop-dom.service';
export declare class PopEntityAssignmentsComponent extends PopExtendComponent implements OnInit, OnDestroy {
    el: ElementRef;
    cdr: ChangeDetectorRef;
    protected _domRepo: PopDomService;
    protected _tabRepo: PopTabMenuService;
    private fieldType;
    header: string;
    name: string;
    protected srv: {
        base: PopBaseService;
        dialog: MatDialog;
        events: PopEntityEventService;
        entity: PopEntityService;
        tab: PopTabMenuService;
    };
    protected asset: {
        entityParamsMap: Dictionary<EntityParams>;
        assignedUserMap: any;
    };
    constructor(el: ElementRef, cdr: ChangeDetectorRef, _domRepo: PopDomService, _tabRepo: PopTabMenuService);
    /**
     * This component should have a specific purpose
     */
    ngOnInit(): void;
    buildTable(): void;
    crudEventHandler(event: PopBaseEventInterface): void;
    getKeyInternalName(key: string): string;
    getEntityParams(key: string, id?: number): EntityParams;
    getTableData(): any[];
    assignUsers(users: Entity[], provider: object): void;
    getProvidersName(providers: any[]): string;
    transformRow(key: string, row: Entity): {
        id: number;
        internal_name: string;
        name: any;
        parent: any;
        entity: string;
        direct: boolean;
        type: any;
        providers: any;
        uid: string;
    };
    eventHandler(event: PopBaseEventInterface): void;
    viewEntityPortal(internal_name: string, id: number): void;
    viewRowProviders(row: any): void;
    ngOnDestroy(): void;
    /************************************************************************************************
     *                                                                                              *
     *                                      Under The Hood                                          *
     *                                    ( Private Method )                                        *
     *                                                                                              *
     ************************************************************************************************/
    private _buildTabMenuConfig;
}
