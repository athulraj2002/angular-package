import { Dictionary, FieldCustomSettingInterface, FieldInterface, FieldItemPatchInterface, KeyMap } from '../../../pop-common.model';
export interface EntitySchemeSectionInterface {
    id?: number;
    name: string | null;
    asset_id: number;
    asset_type: string;
    asset?: any;
    compact?: boolean | number;
    scheme_id?: number | null;
    container?: boolean;
    field_id?: number;
    flex?: number;
    menu?: boolean;
    expanded?: boolean;
    label?: string | null;
    modified?: boolean;
    position: number;
    primary?: boolean;
    required?: boolean;
    traits?: FieldCustomSettingInterface[];
    sort_order: number;
    children?: EntitySchemeSectionConfig[];
    startIndex?: number;
    mapping?: Dictionary<any>;
}
export interface ProfileSchemeFieldInterface extends EntitySchemeSectionInterface {
    asset: FieldInterface;
}
export interface ProfileSchemeAssetPoolInterface {
    name: string;
    asset_type: string;
    display: string;
    data: KeyMap<any>;
    list: any[];
}
export declare class EntitySchemeSectionConfig {
    id: number;
    name: string | null;
    asset_id: number;
    asset_type: string;
    asset?: any;
    compact?: boolean;
    flex?: number;
    scheme_id: number | null;
    field_id?: number;
    container?: boolean;
    label?: string | null;
    menu?: boolean;
    expanded?: boolean;
    position: number;
    primary?: boolean;
    required?: boolean;
    sort_order: number;
    children?: EntitySchemeSectionConfig[];
    mapping?: Dictionary<any>;
    modified: boolean;
    constructor(params?: EntitySchemeSectionInterface);
}
export interface FieldSettingInterface {
    label: string;
    name: string;
    value: any;
    params: any;
    default: any;
    options?: any;
    patch?: FieldItemPatchInterface;
    readonly: boolean;
}
