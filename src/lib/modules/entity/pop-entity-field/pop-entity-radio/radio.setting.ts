import { Dictionary, FieldCustomSettingInterface } from '../../../../pop-common.model';

export const RadioFieldSetting = <Dictionary<FieldCustomSettingInterface>>{
  unique_label: {
    name: 'unique_label',
    type: 'boolean',
    defaultValue: true,
  },
};
