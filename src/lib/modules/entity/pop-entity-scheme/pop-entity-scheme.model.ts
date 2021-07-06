import { Dictionary, FieldCustomSettingInterface, FieldInterface, FieldItemPatchInterface, KeyMap } from '../../../pop-common.model';
import { TitleCase, ToArray } from '../../../pop-common-utility';


export interface EntitySchemeSectionInterface {
  id?: number;
  name: string | null;
  asset_id: number; // the
  asset_type: string; // the
  asset?: any;
  compact?: boolean | number;
  scheme_id?: number | null;
  container?: boolean;
  field_id?: number;
  flex?: number;
  menu?: boolean; // show menu
  expanded?: boolean;
  label?: string | null;
  modified?: boolean;
  position: number;   // Any metadata desired.
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


export class EntitySchemeSectionConfig {
  id: number;
  name: string | null;
  asset_id: number; // the
  asset_type: string; // the
  asset?: any;
  compact? = true;
  flex?: number;
  scheme_id: number | null;
  field_id?: number;
  container?: boolean;
  label?: string | null;
  menu?: boolean; // show menu
  expanded?: boolean;
  position: number;   // Any metadata desired.
  primary?: boolean;
  required?: boolean;
  sort_order: number;
  children?: EntitySchemeSectionConfig[];
  mapping?: Dictionary<any> = {};
  modified = false;


  constructor( params?: EntitySchemeSectionInterface ){
    if( params ) for( const i in params ) this[ i ] = params[ i ];
  }
}


export interface FieldSettingInterface {
  label: string;
  name: string;   // the base entityId definitions
  value: any;
  params: any;
  default: any;
  options?: any;
  patch?: FieldItemPatchInterface;
  readonly: boolean;
}
