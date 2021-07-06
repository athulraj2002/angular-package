export const DefaultEntityAction = {
  new: {
    description: 'Add A New Record To #name',
    config: {
      fields: {
        name: {
          required: true,
          pattern: 'Alpha'
        },
      },
      http: 'POST',
      label: 'New #internal_name',
      postUrl: '#path',
      goToUrl: '#path/:id/general',
      submit: 'New',
    },
    active: 1
  },
  advanced_search: {
    description: 'Advanced Search For #internal_name',
    config: {
      fields: {
        name: {
          required: true,
          pattern: 'AlphaNumeric'
        },
      },
      http: 'GET',
      label: 'Advanced Search',
      get_url: '#path',
      goToUrl: null,
      submit: 'Search',
    },
    active: 1
  }
};
