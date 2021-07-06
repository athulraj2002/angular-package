import { Dictionary, FieldCustomSettingInterface } from '../../../../pop-common.model';

export const EmailFieldSetting = <Dictionary<FieldCustomSettingInterface>>{
  unique_label: {
    name: 'unique_label',
    type: 'boolean',
    defaultValue: true,
  },
  disabled: {
    name: 'disabled',
    type: 'boolean',
    item: 'address',
    defaultValue: false,
  },
  address_pattern: {
    name: 'address_pattern',
    item: 'address',
    type: 'model',
    model: 'pattern',
    value: 'Email',
  },
  make_primary: {
    name: 'make_primary',
    type: 'fixed',
    defaultValue: false,
  },

  email_primary: {
    name: 'email_primary',
    type: 'trait',
    icon: 'email',
    defaultValue: false,
  },
};
