import { Dictionary, FieldCustomSettingInterface } from '../../../../pop-common.model';
import {FieldSwitchParamComponent} from "../../pop-entity-field-editor/pop-entity-field-settings/pop-entity-field-item-params/params/field-switch-param.component";

export const AddressFieldSetting = <Dictionary<FieldCustomSettingInterface>>{
  show_name: null,
  unique_label: {
    name: 'unique_label',
    type: 'boolean',
    defaultValue: true,
  },
  primary_can_text: {
    name: 'primary_can_text',
    label: 'Primary Text',
    type: 'primary',
    defaultValue: true,
  },
  primary_can_call: {
    name: 'primary_can_call',
    label: 'Primary Call',
    type: 'primary',
    defaultValue: true,
  },
  make_primary: {
    name: 'make_primary',
    type: 'fixed',
    defaultValue: false,
  },
  shipping_primary: {
    name: 'shipping_primary',
    type: 'trait',
    icon: 'local_shipping',
    defaultValue: false,
  },
  billing_primary: {
    name: 'billing_primary',
    type: 'trait',
    icon: 'local_post_office',
    component: FieldSwitchParamComponent,
    defaultValue: false,
  },
  allow_canada: {
    name: 'allow_canada',
    type: 'boolean',
    item: 'zip',
    defaultValue: false,
  },
  auto_fill: {
    name: 'auto_fill',
    type: 'boolean',
    item: 'zip',
    component: FieldSwitchParamComponent,
    defaultValue: true,
  },
};
