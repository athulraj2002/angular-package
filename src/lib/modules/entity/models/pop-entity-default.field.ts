export const DefaultEntityField = {
  id: {
    ancillary: 1,
    position: 1,
    table: {
      checkbox: {
        visible: true,
        sort: 0
      },
      visible: true,
      sort: 999
    },
    model: {
      form: 'label',
      name: 'id',
      label: 'ID',
      visible: true,
      maxlength: 32,
      copyLabel: true,
      labelButton: true,
      valueButton: true,
      copyLabelBody: '#id',
      copyLabelDisplay: 'ID #id',
      valueButtonDisplay: ':archived',
      valueButtonDisabled: true,
      valueButtonDisplayTransformation: 'toActiveOrArchived',
      subLabel: 'Created',
      subValue: 'created_at'
    },
    sort: 0
  },
  name: {
    ancillary: 0,
    position: 1,
    table: {
      visible: true,
      sort: 2
    },
    model: {
      form: 'input',
      name: 'name',
      label: 'Name',
      bubble: true,
      pattern: 'Default',
      visible: true,
      required: 1,
      maxlength: 64,
      patch: {
        field: 'name',
        path: '#path/#entityId'
      }
    },
    sort: 2
  },
  description: {
    ancillary: 0,
    position: 1,
    table: {
      visible: true,
      sort: 3
    },
    model: {
      form: 'textarea',
      name: 'description',
      label: 'Description',
      autoSize: false,
      height: 70,
      maxHeight: 150,
      maxlength: 255,
      sort: 3,
      patch: {
        field: 'description',
        path: '#path/#entityId'
      }
    },
    sort: 3
  },


  added_by_user: {
    ancillary: 1,
    position: 1,
    table: {
      visible: false,
      sort: 99
    },
    model: {
      form: 'label',
      name: 'added_by_user',
      label: 'Added By',
      truncate: 64,
    },
    sort: 99,
  },
  archived_by_user: {
    ancillary: 1,
    position: 1,
    table: {
      visible: false,
      sort: 99
    },
    model: {
      form: 'label',
      name: 'archived_by_user',
      label: 'Archived By',
      truncate: 64,
    },
    sort: 99
  },


  created_at: {
    ancillary: 1,
    position: 1,
    table: {
      visible: false,
      sort: 99,
      transformation: {
        arg1: 'date',
        type: 'date'
      },
    },
    model: {
      form: 'label',
      name: 'created_at',
      label: 'Added Date',
      truncate: 64,
      transformation: {
        arg1: 'date',
        type: 'date'
      },
    },
    sort: 99
  },
  created_by_user_id: {
    ancillary: 1,
    position: 1,
    table: {
      visible: false,
      sort: 99
    },
    model: {
      form: 'label',
      name: 'created_by_user_id',
      label: 'Added By ID',
      truncate: 64,
    },
    sort: 99
  },
  deleted_at: {
    ancillary: 1,
    position: 1,
    table: {
      visible: false,
      sort: 99,
      transformation: {
        arg1: 'date',
        type: 'date'
      },
    },
    model: {
      form: 'label',
      name: 'deleted_at',
      label: 'Deleted At',
      transformation: {
        arg1: 'date',
        type: 'date'
      },
      type: 'label',
      action: 'general'
    },
    when: [
      [
        [
          'entity.deleted_at'
        ]
      ]
    ],
    sort: 99
  },

  deleted_by_user_id: {
    ancillary: 1,
    position: 1,
    table: {
      visible: false,
      sort: 99,
    },

    model: {
      form: 'label',
      name: 'deleted_by_user_id',
      label: 'Archived',
      visible: true,
      maxlength: 32,
      transformation: {
        type: 'toYesNoPipe'
      }
    },
    sort: 99
  },
  updated_at: {
    ancillary: 1,
    position: 1,
    table: {
      visible: false,
      sort: 99,
      transformation: {
        arg1: 'date',
        type: 'date'
      },
    },
    model: {
      form: 'label',
      name: 'updated_at',
      label: 'Last Update',
      transformation: {
        arg1: 'date',
        type: 'date'
      },
      type: 'label',
      action: 'general'
    },
    when: [
      [
        [
          'entity.updated_at'
        ]
      ]
    ],
    sort: 99
  },

  archived: {
    ancillary: 1,
    position: 1,
    table: {
      visible: true,
      sort: 99,
      transformation: {
        type: 'toYesNoPipe'
      },
    },
    model: {
      form: 'label',
      name: 'archived',
      label: 'Archived',
      transformation: {
        type: 'toYesNoPipe'
      },
      type: 'label',
    },
    when: [
      [
        [
          'entity.archived'
        ]
      ]
    ],
    sort: 99
  }
};
