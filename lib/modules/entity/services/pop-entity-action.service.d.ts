import { OnDestroy } from '@angular/core';
import { CoreConfig, Entity, EntityActionInterface, EntityExtendInterface } from '../../../pop-common.model';
import { FieldItemGroupConfig } from '../../base/pop-field-item-group/pop-field-item-group.model';
import { PopEntityUtilFieldService } from './pop-entity-util-field.service';
import { PopExtendService } from '../../../services/pop-extend.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PopActionDialogComponent } from '../../base/pop-dialogs/pop-action-dialog/pop-action-dialog.component';
export declare class PopEntityActionService extends PopExtendService implements OnDestroy {
    name: string;
    protected srv: {
        dialog: MatDialog;
        field: PopEntityUtilFieldService;
    };
    protected asset: {
        dialogRef: MatDialogRef<PopActionDialogComponent, any>;
        field: PopEntityUtilFieldService;
    };
    constructor();
    do(core: CoreConfig, action: string | EntityActionInterface, extension?: EntityExtendInterface, blockEntity?: boolean): Promise<Entity>;
    private _checkArgs;
    /**
     * A helper method that sets up a FieldGroupConfig for a create/new pop-table-dialog
     * @param entityConfig
     * @param goToUrl
     */
    doAction(core: CoreConfig, actionName: string, extension?: EntityExtendInterface): Promise<FieldItemGroupConfig>;
    /**
     * Callback helper to newEntity
     * @param entityConfig
     * @param fields
     * @param metadata
     * @param goToUrl
     */
    getActionDialogConfig(core: CoreConfig, action: EntityActionInterface, actionFieldItems: any, metadata: any, extension?: EntityExtendInterface): FieldItemGroupConfig;
    ngOnDestroy(): void;
}
