export const EntityFieldSetting = {
  show_name: {
    name: 'show_name',
    label: 'Show Name',
    helpText: 'Show the name of the field as a Header',
    type: 'boolean',
    defaultValue: false,
  },
  edit_label: {
    name: 'edit_label',
    label: 'Allow Label Changes',
    helpText: 'The User will be able to see the label, but should they be allowed to change it?',
    type: 'boolean',
    group: 'label',
    defaultValue: true
  },
  custom_label: {
    name: 'custom_label',
    label: 'Allow Custom Label',
    helpText: 'The user will be able to select \'Custom\' from the dropdown and enter their own label',
    type: 'boolean',
    group: 'label',
    defaultValue: false,
  },
  unique_label: {
    name: 'unique_label',
    label: 'Require Unique Label',
    helpText: 'Each Value entry will be required to use a select a different label',
    type: 'boolean',
    group: 'label',
    defaultValue: false,
  },
};

