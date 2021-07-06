import { Dictionary, FieldCustomSettingInterface } from '../../../../pop-common.model';

export const TextareaFieldSetting = <Dictionary<FieldCustomSettingInterface>>{
  disabled: {
    name: 'disabled',
    type: 'boolean',
    item: 'address',
    defaultValue: false,
  },
};
