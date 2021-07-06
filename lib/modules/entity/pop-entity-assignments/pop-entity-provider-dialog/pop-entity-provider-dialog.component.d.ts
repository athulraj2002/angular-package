import { OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PopBaseService } from '../../../../services/pop-base.service';
import { PopEntityService } from '../../services/pop-entity.service';
import { Subscription } from 'rxjs';
import { TableConfig } from '../../../base/pop-table/pop-table.model';
import { PopEntityUtilPortalService } from '../../services/pop-entity-util-portal.service';
import { CoreConfig, Entity, PopBaseEventInterface } from '../../../../pop-common.model';
export interface PopEntityProviderDialogInterface {
    display?: string;
    config: CoreConfig;
    table: TableConfig;
    resource: Entity;
}
export declare class PopEntityProviderDialogComponent implements OnInit, OnDestroy {
    private entityUtilRepo;
    private entityPortalRepo;
    private baseRepo;
    private dialogRepo;
    dialog: MatDialogRef<PopEntityProviderDialogComponent>;
    display: string;
    config: CoreConfig;
    table: TableConfig;
    resource: Entity;
    constructor(data: PopEntityProviderDialogInterface, entityUtilRepo: PopEntityService, entityPortalRepo: PopEntityUtilPortalService, baseRepo: PopBaseService, dialogRepo: MatDialog, dialog: MatDialogRef<PopEntityProviderDialogComponent>);
    state: {
        blockModal: boolean;
        assignmentChange: boolean;
        changed: boolean;
    };
    subscriber: {
        crud: Subscription;
        dialog: Subscription;
    };
    ngOnInit(): void;
    getDisplay(): string;
    crudEventHandler(event: PopBaseEventInterface): void;
    eventHandler(event: PopBaseEventInterface): void;
    viewEntityPortal(internal_name: string, id: number): void;
    cancel(): void;
    ngOnDestroy(): void;
}
