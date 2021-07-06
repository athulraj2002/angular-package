import { Dictionary, EntityParamsInterface, KeyMap } from './pop-common.model';
import { GetSessionSiteVar, GetSiteVar, IsObject } from './pop-common-utility';
import { EntityMenu } from './modules/app/pop-left-menu/entity-menu.model';


export interface AuthDetails {
  created?: number;
  max_ttl?: number;
  id: number;
  first_name: string;
  last_name: string;
  name: string;
  initials: string;
  email: string;
  email_verified_at?: string| boolean | number;
  avatarLink?: string;
  business_fk?: number;
  last_login_at?: string;
  legacy_user_id?: number;
  username?: string;
  token?: string;
  x_popcx_token?: string;
  created_at?: number;
  users?: KeyMap<BusinessUser>;
  businesses?: KeyMap<Business>;
}


export interface BusinessUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  business?: Business;
  setting?: Dictionary<any>;
  business_id: number;
  permissions?: Dictionary<any>;
}


export interface Business {
  id: number;
  name: string;
  short_name: string;
  theme: string;
  date_format: string;
  hour_format: '12' | '24';
  homepage?: string;
  logo_small_url?: string;
  logo_main_url?: string;
  timezone_value_id?: number;
  aliases?: any[];
  timezone?: string;
  apps?: App[];
}


export interface App {
  id: number;
  name: string;
  label?: string;
  sort?: number;
  active?: boolean;
  path?: string;
  href?: string;
  menu?: Dictionary<EntityMenu>;

  entities?: EntityParamsInterface[];
}


export interface AppMenu {
  id?: number;
  name: string;
  path: string;
  description: string;
  short_description: string;
  sort: number;
  icon: string;
  entityId?: number;
  hasAlias?: boolean;
  originalPath?: string;
  originalName?: string;
}


export interface AuthUser {
  id?: number;
  name?: string;
  first_name?: string;
  last_name?: string;
  initials?: string;
  email?: string;
  email_verified_at?: string | number | boolean;
  avatarLink?: string;
  username?: string;
  business_fk?: number;
}


export function GetAuthStorage(): { token: string, popcxToken: string, time: number, auth: AuthDetails, businessId: number }{
  return {
    token: GetSiteVar('Auth.token', ''),
    popcxToken: GetSiteVar('Auth.popcx-token', ''),
    time: parseInt(GetSiteVar('Auth.time', 0), 10),
    auth: <AuthDetails>GetSiteVar('Auth.details', {}),
    businessId: parseInt(GetSessionSiteVar('Business.current', 0), 10)
  };
}
