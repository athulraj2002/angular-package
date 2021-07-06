import { TabComponentInterface, TabConfig, TabInterface } from '../../base/pop-tab-menu/tab-menu.model';
import { PopEntityFieldGroupComponent } from '../pop-entity-field-group/pop-entity-field-group.component';
import { PopEntityHistoryComponent } from '../pop-entity-history/pop-entity-history.component';
import { PopEntityAssignmentsComponent } from '../pop-entity-assignments/pop-entity-assignments.component';
import { CoreConfig, PopBaseEventInterface } from '../../../pop-common.model';
import { PopEntitySchemeComponent } from '../pop-entity-scheme/pop-entity-scheme.component';
import { PopEntityFieldEditorComponent } from '../pop-entity-field-editor/pop-entity-field-editor.component';
import { PopEntityStatusComponent } from '../pop-entity-status/pop-entity-status.component';


export const EntityGeneralTab =
  new TabConfig( <TabInterface>{
    id: 'general',
    positions: {
      1: {
        flex: 1,
        components: [
          {
            type: PopEntityStatusComponent,
            inputs: {
              position: 1
            },
          },
          {
            type: PopEntityFieldGroupComponent,
            inputs: {
              position: 1
            },
          },
        ]
      },
      2: {
        flex: 1,
        components: [
          {
            type: PopEntityFieldGroupComponent,
            inputs: {
              position: 2
            },
          },
        ]
      },
      3: {
        flex: 2,
        components: [
          {
            type: PopEntityFieldGroupComponent,
            inputs: {
              position: 2
            },
          },
        ]
      }
    },
  } );


export const EntityAssignmentTab =
  new TabConfig( <TabInterface>{
    id: 'assignments',
    positions: {
      1: {
        header: null,
        flex: 1,
        components: <TabComponentInterface[]>[
          { type: PopEntityAssignmentsComponent, inputs: {} }
        ]
      },
    },
  } );


export const EntitySchemeTab =
  new TabConfig( {
    id: 'general',
    positions: {
      1: {
        flex: 1,
        components: [
          {
            type: PopEntitySchemeComponent,
            inputs: {
              id: '1',
            },
          },
        ]
      },
    },
    columnWrap: false,
    // wrap: false, // turn wrapper off ie. margin,  since  PopProfileSchemeComponent is another tab instance
    onLoad: ( config: CoreConfig, tab: TabConfig ) => {
      // console.log('config', config);
      // console.log('tab', tab);
    },

    onEvent: ( core: CoreConfig, event: PopBaseEventInterface ) => {
      // console.log('event', event);
    },
  } );


export const EntityHistoryTab =
  new TabConfig( <TabInterface>{
    id: 'history',
    positions: {
      1: {
        header: null,
        flex: 1,
        components: <TabComponentInterface[]>[
          {
            type: PopEntityHistoryComponent,
            inputs: {},
          }
        ]
      }
    },
  } );


export const FieldEditorTab =
  new TabConfig( {
    id: 'general',
    syncPositions: false,
    positions: {
      1: {
        flex: 1,
        components: [
          {
            type: PopEntityFieldEditorComponent,
            inputs: {}
          },
        ]
      },
    },
    onLoad: ( config: CoreConfig, tab: TabConfig ) => {
      //       console.log('config', this);
      // console.log('tab', tab);
    },

    onEvent: ( core: CoreConfig, event: PopBaseEventInterface ) => {
      // console.log('event', event);
    },
  } );


