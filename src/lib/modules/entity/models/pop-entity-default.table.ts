import { EntityModelTableInterface } from '../../../pop-common.model';

export const DefaultEntityTable = <EntityModelTableInterface>{
  setting: {
    columns: {
      id: {
        checkbox: { sort_let: 0, visible: true },
        display: 'ID',
        sort: 4,
        visible: true
      },
      name: {
        display: 'Name',
        sort: 1,
        visible: true
      },
    },
    options: {
      display_header: true,
      column_search: false,
      column_sort: false,
      sticky_header: true,
    }
  },
  permission: {
    allowColumnDisplayToggle: true,
    allowColumnStickyToggle: true,
    allowColumnSearchToggle: true,
    allowColumnSortToggle: true,
    allowHeaderStickyToggle: true,
    allowHeaderDisplayToggle: true,
    allowPaginatorToggle: true,
  },
  button: {
    archived: true,
    clone: true,
    new: true,
    advanced_search: false,
    custom: []
  },
  filter: {
    active: false,
    display: 'default'
  },
};
