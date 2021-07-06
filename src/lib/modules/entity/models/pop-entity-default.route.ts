import { ServiceRoutesInterface } from '../../../pop-common.model';

export const DefaultEntityRoute = <ServiceRoutesInterface>{
  get: {
    entity: {
      path: `#path/{id}`,
      params: {},
    },
    entities: {
      path: `#path`,
      params: {},
    },
    config: {
      path: `apps/configs`,
      params: {},
    },
    history: {
      path: `#path/{id}/history`,
      params: {},
    },
    preference: {
      path: `apps/preferences`,
      params: {},
    },
  },
  patch: {
    entity: {
      path: `#path/{id}`,
      params: {},
    },
  },
  archive: {
    entity: {
      path: `#path/{id}`,
      params: {},
    },
  },
  restore: {
    entity: {
      path: `#path/{id}`,
      params: {},
    },
  }
};
