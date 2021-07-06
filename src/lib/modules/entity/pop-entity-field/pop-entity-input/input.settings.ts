import { Dictionary, FieldCustomSettingInterface } from '../../../../pop-common.model';

export const InputFieldSetting = <Dictionary<FieldCustomSettingInterface>>{
  unique_label: {
    name: 'unique_label',
    type: 'boolean',
    defaultValue: true,
  },
  transformation: {
    name: 'transformation',
    type: 'transformation',
    item: 'value',
    defaultValue: '',
    options: {
      empty: { value: '', name: '--- Select One ---' },
      values: [
        { value: 'toTitleCase', name: 'Title Case' },
        { value: 'toUpperCase', name: 'Upper Case' },
        { value: 'toLowerCase', name: 'Lower Case' },
        { value: 'toCurrency', name: 'Currency' },
        { value: 'date', name: 'Date' },
      ]
    }
  },
};
