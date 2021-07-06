import { Dictionary, FieldCustomSettingInterface, FieldItemOptions } from '../../../../pop-common.model';

export const PhoneFieldSetting = <Dictionary<FieldCustomSettingInterface>>{
  unique_label: {
    name: 'unique_label',
    type: 'boolean',
    defaultValue: true,
  },

  make_primary: {
    name: 'make_primary',
    type: 'fixed',
    defaultValue: false,
  },

  text_primary: {
    name: 'text_primary',
    type: 'trait',
    icon: 'sms',
    defaultValue: false,
  },

  call_primary: {
    name: 'call_primary',
    type: 'trait',
    icon: 'call',
    defaultValue: false,
  },
};
