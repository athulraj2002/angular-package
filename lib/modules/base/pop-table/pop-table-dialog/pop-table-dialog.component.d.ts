import { OnInit, OnDestroy } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { MatDialogRef } from '@angular/material/dialog';
import { PopCommonService } from '../../../../services/pop-common.service';
import { TableOptionsConfig } from '../pop-table.model';
import { SwitchConfig } from '../../pop-field-item/pop-switch/switch-config.model';
import { Dictionary } from '../../../../pop-common.model';
import { PopDisplayService } from '../../../../services/pop-display.service';
import { SelectConfig } from "../../pop-field-item/pop-select/select-config.model";
export interface Toggles {
    allowColumnDisplayToggle?: SwitchConfig;
    allowColumnStickyToggle?: SwitchConfig;
    allowColumnSearchToggle?: SwitchConfig;
    allowColumnSortToggle?: SwitchConfig;
    allowHeaderStickyToggle?: SwitchConfig;
    allowHeaderDisplayToggle?: SwitchConfig;
    allowPaginatorToggle?: SwitchConfig;
}
export declare class PopTableDialogComponent implements OnInit, OnDestroy {
    private tableDialogRef;
    private cs;
    private ds;
    data: any;
    options: TableOptionsConfig;
    toggles: Toggles;
    columns: any;
    lockedColumns: SelectConfig;
    dom: {
        state: Dictionary<string | number | boolean>;
        asset: Dictionary<string | number | boolean>;
        height: Dictionary<number>;
    };
    constructor(tableDialogRef: MatDialogRef<PopTableDialogComponent>, cs: PopCommonService, ds: PopDisplayService, data: any);
    ngOnInit(): void;
    buildLockedColumns(): void;
    updateLockedColumns(value: any): void;
    clearColSticky(): void;
    updateStickyColumns(value: any): void;
    handleInputEvents(event: any): void;
    buildToggles(): void;
    setAllShow(checked: any): void;
    buildColumns(): void;
    handleToggleEvents(event: any): void;
    onSave(): void;
    onResetToDefault(): void;
    onCancel(): void;
    drop(event: CdkDragDrop<string[]>): void;
    ngOnDestroy(): void;
}
