import { Dictionary, FieldCustomSettingInterface } from '../../../../pop-common.model';

export const NameFieldSetting = <Dictionary<FieldCustomSettingInterface>>{
  unique_label: {
    name: 'unique_label',
    type: 'boolean',
    defaultValue: true,
  },
  disabled: {
    name: 'disabled',
    type: 'boolean',
    defaultValue: false,
  },
  make_primary: {
    name: 'make_primary',
    type: 'fixed',
    defaultValue: false,
  },
  name_primary: {
    name: 'name_primary',
    type: 'trait',
    icon: 'api',
    defaultValue: false,
  },
};
