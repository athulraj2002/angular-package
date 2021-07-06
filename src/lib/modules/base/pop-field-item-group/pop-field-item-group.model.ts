import { Entity, EntityParams, EventPromiseCallback, FieldItemInterface } from '../../../pop-common.model';


export interface FieldItemGroupDialogInterface {
  submit: string;           // The value that the submit button should display.
  title?: string;           // The display of the popup pop-table-dialog box.
  cancel?: boolean;         // If the cancel button should be displayed. Default is true.
  postUrlVersion?: number;  // The version the form post should use. Default to 1.
  goToUrl?: string;         // If set, the url to load after successful form post. IE: Add User = users/:entityId
  postUrl?: string;         // If set, the url to call the api with when creating an entity
  callback?: EventPromiseCallback;
}


export interface FieldItemGroupInterface {
  id: string | number;
  params: EntityParams;
  fieldItems: Array<FieldItemInterface>;
  position?: string;
  metadata?: object;   // Any metadata desired.
  http?: 'POST' | 'PATCH';
  inDialog?: FieldItemGroupDialogInterface;
  layout?: 'row' | 'column';
  debug?: boolean;
}


export class FieldItemGroupConfig {
  id: string | number;
  params: EntityParams;
  fieldItems = <FieldItemInterface[]>[];
  layout = 'column';
  metadata;
  inDialog = <FieldItemGroupDialogInterface>undefined;
  fieldItemMap;
  position = 1;
  getField;
  resetFields;
  entity: Entity = null;
  http = 'POST';
  debug = false;


  constructor( config?: FieldItemGroupInterface ){
    for( const i in config ) this[ i ] = config[ i ];
    if( !config.inDialog ) this.inDialog = null;
    if( config.inDialog && config.inDialog.cancel !== false ) config.inDialog.cancel = true;
  }
}
