import { Entity, EntityParams, EventPromiseCallback, FieldItemInterface } from '../../../pop-common.model';
export interface FieldItemGroupDialogInterface {
    submit: string;
    title?: string;
    cancel?: boolean;
    postUrlVersion?: number;
    goToUrl?: string;
    postUrl?: string;
    callback?: EventPromiseCallback;
}
export interface FieldItemGroupInterface {
    id: string | number;
    params: EntityParams;
    fieldItems: Array<FieldItemInterface>;
    position?: string;
    metadata?: object;
    http?: 'POST' | 'PATCH';
    inDialog?: FieldItemGroupDialogInterface;
    layout?: 'row' | 'column';
    debug?: boolean;
}
export declare class FieldItemGroupConfig {
    id: string | number;
    params: EntityParams;
    fieldItems: FieldItemInterface[];
    layout: string;
    metadata: any;
    inDialog: FieldItemGroupDialogInterface;
    fieldItemMap: any;
    position: number;
    getField: any;
    resetFields: any;
    entity: Entity;
    http: string;
    debug: boolean;
    constructor(config?: FieldItemGroupInterface);
}
