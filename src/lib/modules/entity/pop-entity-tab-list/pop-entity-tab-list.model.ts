import { TableButtonInterface } from '../../base/pop-table/pop-table.model';


export class EntityTabListExtendInterface {
  debug?: boolean;
  can_read?: boolean;
  client_id?:number;
  account_id?:number;
  campaign_id?: number;
  internal_name?: string;
  parent?:string;
  parentId?: string | number;
  table?: {
    route?: string;
    buttons?: TableButtonInterface[];
    linkBehavior?: 'portal';
    advanced_search?: boolean;
  };
  goToUrl?: string;
}
