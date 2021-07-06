import { EntityModelMenuInterface } from '../../../pop-common.model';

export const DefaultEntityMenu = <EntityModelMenuInterface>{
  button: {
    archive: true,
    clone: false,
    custom: [],
    delete: false,
    goBack: true
  },
  archiveKey: 'archived'
};
