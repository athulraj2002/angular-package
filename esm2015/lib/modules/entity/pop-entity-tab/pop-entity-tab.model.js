import { TabConfig } from '../../base/pop-tab-menu/tab-menu.model';
import { PopEntityFieldGroupComponent } from '../pop-entity-field-group/pop-entity-field-group.component';
import { PopEntityHistoryComponent } from '../pop-entity-history/pop-entity-history.component';
import { PopEntityAssignmentsComponent } from '../pop-entity-assignments/pop-entity-assignments.component';
import { PopEntitySchemeComponent } from '../pop-entity-scheme/pop-entity-scheme.component';
import { PopEntityFieldEditorComponent } from '../pop-entity-field-editor/pop-entity-field-editor.component';
import { PopEntityStatusComponent } from '../pop-entity-status/pop-entity-status.component';
export const EntityGeneralTab = new TabConfig({
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
});
export const EntityAssignmentTab = new TabConfig({
    id: 'assignments',
    positions: {
        1: {
            header: null,
            flex: 1,
            components: [
                { type: PopEntityAssignmentsComponent, inputs: {} }
            ]
        },
    },
});
export const EntitySchemeTab = new TabConfig({
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
    onLoad: (config, tab) => {
        // console.log('config', config);
        // console.log('tab', tab);
    },
    onEvent: (core, event) => {
        // console.log('event', event);
    },
});
export const EntityHistoryTab = new TabConfig({
    id: 'history',
    positions: {
        1: {
            header: null,
            flex: 1,
            components: [
                {
                    type: PopEntityHistoryComponent,
                    inputs: {},
                }
            ]
        }
    },
});
export const FieldEditorTab = new TabConfig({
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
    onLoad: (config, tab) => {
        //       console.log('config', this);
        // console.log('tab', tab);
    },
    onEvent: (core, event) => {
        // console.log('event', event);
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS10YWIubW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvbW9kdWxlcy9lbnRpdHkvcG9wLWVudGl0eS10YWIvcG9wLWVudGl0eS10YWIubW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUF5QixTQUFTLEVBQWdCLE1BQU0sd0NBQXdDLENBQUM7QUFDeEcsT0FBTyxFQUFFLDRCQUE0QixFQUFFLE1BQU0sNERBQTRELENBQUM7QUFDMUcsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sb0RBQW9ELENBQUM7QUFDL0YsT0FBTyxFQUFFLDZCQUE2QixFQUFFLE1BQU0sNERBQTRELENBQUM7QUFFM0csT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sa0RBQWtELENBQUM7QUFDNUYsT0FBTyxFQUFFLDZCQUE2QixFQUFFLE1BQU0sOERBQThELENBQUM7QUFDN0csT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sa0RBQWtELENBQUM7QUFHNUYsTUFBTSxDQUFDLE1BQU0sZ0JBQWdCLEdBQzNCLElBQUksU0FBUyxDQUFnQjtJQUMzQixFQUFFLEVBQUUsU0FBUztJQUNiLFNBQVMsRUFBRTtRQUNULENBQUMsRUFBRTtZQUNELElBQUksRUFBRSxDQUFDO1lBQ1AsVUFBVSxFQUFFO2dCQUNWO29CQUNFLElBQUksRUFBRSx3QkFBd0I7b0JBQzlCLE1BQU0sRUFBRTt3QkFDTixRQUFRLEVBQUUsQ0FBQztxQkFDWjtpQkFDRjtnQkFDRDtvQkFDRSxJQUFJLEVBQUUsNEJBQTRCO29CQUNsQyxNQUFNLEVBQUU7d0JBQ04sUUFBUSxFQUFFLENBQUM7cUJBQ1o7aUJBQ0Y7YUFDRjtTQUNGO1FBQ0QsQ0FBQyxFQUFFO1lBQ0QsSUFBSSxFQUFFLENBQUM7WUFDUCxVQUFVLEVBQUU7Z0JBQ1Y7b0JBQ0UsSUFBSSxFQUFFLDRCQUE0QjtvQkFDbEMsTUFBTSxFQUFFO3dCQUNOLFFBQVEsRUFBRSxDQUFDO3FCQUNaO2lCQUNGO2FBQ0Y7U0FDRjtRQUNELENBQUMsRUFBRTtZQUNELElBQUksRUFBRSxDQUFDO1lBQ1AsVUFBVSxFQUFFO2dCQUNWO29CQUNFLElBQUksRUFBRSw0QkFBNEI7b0JBQ2xDLE1BQU0sRUFBRTt3QkFDTixRQUFRLEVBQUUsQ0FBQztxQkFDWjtpQkFDRjthQUNGO1NBQ0Y7S0FDRjtDQUNGLENBQUUsQ0FBQztBQUdOLE1BQU0sQ0FBQyxNQUFNLG1CQUFtQixHQUM5QixJQUFJLFNBQVMsQ0FBZ0I7SUFDM0IsRUFBRSxFQUFFLGFBQWE7SUFDakIsU0FBUyxFQUFFO1FBQ1QsQ0FBQyxFQUFFO1lBQ0QsTUFBTSxFQUFFLElBQUk7WUFDWixJQUFJLEVBQUUsQ0FBQztZQUNQLFVBQVUsRUFBMkI7Z0JBQ25DLEVBQUUsSUFBSSxFQUFFLDZCQUE2QixFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUU7YUFDcEQ7U0FDRjtLQUNGO0NBQ0YsQ0FBRSxDQUFDO0FBR04sTUFBTSxDQUFDLE1BQU0sZUFBZSxHQUMxQixJQUFJLFNBQVMsQ0FBRTtJQUNiLEVBQUUsRUFBRSxTQUFTO0lBQ2IsU0FBUyxFQUFFO1FBQ1QsQ0FBQyxFQUFFO1lBQ0QsSUFBSSxFQUFFLENBQUM7WUFDUCxVQUFVLEVBQUU7Z0JBQ1Y7b0JBQ0UsSUFBSSxFQUFFLHdCQUF3QjtvQkFDOUIsTUFBTSxFQUFFO3dCQUNOLEVBQUUsRUFBRSxHQUFHO3FCQUNSO2lCQUNGO2FBQ0Y7U0FDRjtLQUNGO0lBQ0QsVUFBVSxFQUFFLEtBQUs7SUFDakIseUdBQXlHO0lBQ3pHLE1BQU0sRUFBRSxDQUFFLE1BQWtCLEVBQUUsR0FBYyxFQUFHLEVBQUU7UUFDL0MsaUNBQWlDO1FBQ2pDLDJCQUEyQjtJQUM3QixDQUFDO0lBRUQsT0FBTyxFQUFFLENBQUUsSUFBZ0IsRUFBRSxLQUE0QixFQUFHLEVBQUU7UUFDNUQsK0JBQStCO0lBQ2pDLENBQUM7Q0FDRixDQUFFLENBQUM7QUFHTixNQUFNLENBQUMsTUFBTSxnQkFBZ0IsR0FDM0IsSUFBSSxTQUFTLENBQWdCO0lBQzNCLEVBQUUsRUFBRSxTQUFTO0lBQ2IsU0FBUyxFQUFFO1FBQ1QsQ0FBQyxFQUFFO1lBQ0QsTUFBTSxFQUFFLElBQUk7WUFDWixJQUFJLEVBQUUsQ0FBQztZQUNQLFVBQVUsRUFBMkI7Z0JBQ25DO29CQUNFLElBQUksRUFBRSx5QkFBeUI7b0JBQy9CLE1BQU0sRUFBRSxFQUFFO2lCQUNYO2FBQ0Y7U0FDRjtLQUNGO0NBQ0YsQ0FBRSxDQUFDO0FBR04sTUFBTSxDQUFDLE1BQU0sY0FBYyxHQUN6QixJQUFJLFNBQVMsQ0FBRTtJQUNiLEVBQUUsRUFBRSxTQUFTO0lBQ2IsYUFBYSxFQUFFLEtBQUs7SUFDcEIsU0FBUyxFQUFFO1FBQ1QsQ0FBQyxFQUFFO1lBQ0QsSUFBSSxFQUFFLENBQUM7WUFDUCxVQUFVLEVBQUU7Z0JBQ1Y7b0JBQ0UsSUFBSSxFQUFFLDZCQUE2QjtvQkFDbkMsTUFBTSxFQUFFLEVBQUU7aUJBQ1g7YUFDRjtTQUNGO0tBQ0Y7SUFDRCxNQUFNLEVBQUUsQ0FBRSxNQUFrQixFQUFFLEdBQWMsRUFBRyxFQUFFO1FBQy9DLHFDQUFxQztRQUNyQywyQkFBMkI7SUFDN0IsQ0FBQztJQUVELE9BQU8sRUFBRSxDQUFFLElBQWdCLEVBQUUsS0FBNEIsRUFBRyxFQUFFO1FBQzVELCtCQUErQjtJQUNqQyxDQUFDO0NBQ0YsQ0FBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVGFiQ29tcG9uZW50SW50ZXJmYWNlLCBUYWJDb25maWcsIFRhYkludGVyZmFjZSB9IGZyb20gJy4uLy4uL2Jhc2UvcG9wLXRhYi1tZW51L3RhYi1tZW51Lm1vZGVsJztcbmltcG9ydCB7IFBvcEVudGl0eUZpZWxkR3JvdXBDb21wb25lbnQgfSBmcm9tICcuLi9wb3AtZW50aXR5LWZpZWxkLWdyb3VwL3BvcC1lbnRpdHktZmllbGQtZ3JvdXAuY29tcG9uZW50JztcbmltcG9ydCB7IFBvcEVudGl0eUhpc3RvcnlDb21wb25lbnQgfSBmcm9tICcuLi9wb3AtZW50aXR5LWhpc3RvcnkvcG9wLWVudGl0eS1oaXN0b3J5LmNvbXBvbmVudCc7XG5pbXBvcnQgeyBQb3BFbnRpdHlBc3NpZ25tZW50c0NvbXBvbmVudCB9IGZyb20gJy4uL3BvcC1lbnRpdHktYXNzaWdubWVudHMvcG9wLWVudGl0eS1hc3NpZ25tZW50cy5jb21wb25lbnQnO1xuaW1wb3J0IHsgQ29yZUNvbmZpZywgUG9wQmFzZUV2ZW50SW50ZXJmYWNlIH0gZnJvbSAnLi4vLi4vLi4vcG9wLWNvbW1vbi5tb2RlbCc7XG5pbXBvcnQgeyBQb3BFbnRpdHlTY2hlbWVDb21wb25lbnQgfSBmcm9tICcuLi9wb3AtZW50aXR5LXNjaGVtZS9wb3AtZW50aXR5LXNjaGVtZS5jb21wb25lbnQnO1xuaW1wb3J0IHsgUG9wRW50aXR5RmllbGRFZGl0b3JDb21wb25lbnQgfSBmcm9tICcuLi9wb3AtZW50aXR5LWZpZWxkLWVkaXRvci9wb3AtZW50aXR5LWZpZWxkLWVkaXRvci5jb21wb25lbnQnO1xuaW1wb3J0IHsgUG9wRW50aXR5U3RhdHVzQ29tcG9uZW50IH0gZnJvbSAnLi4vcG9wLWVudGl0eS1zdGF0dXMvcG9wLWVudGl0eS1zdGF0dXMuY29tcG9uZW50JztcblxuXG5leHBvcnQgY29uc3QgRW50aXR5R2VuZXJhbFRhYiA9XG4gIG5ldyBUYWJDb25maWcoIDxUYWJJbnRlcmZhY2U+e1xuICAgIGlkOiAnZ2VuZXJhbCcsXG4gICAgcG9zaXRpb25zOiB7XG4gICAgICAxOiB7XG4gICAgICAgIGZsZXg6IDEsXG4gICAgICAgIGNvbXBvbmVudHM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0eXBlOiBQb3BFbnRpdHlTdGF0dXNDb21wb25lbnQsXG4gICAgICAgICAgICBpbnB1dHM6IHtcbiAgICAgICAgICAgICAgcG9zaXRpb246IDFcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0eXBlOiBQb3BFbnRpdHlGaWVsZEdyb3VwQ29tcG9uZW50LFxuICAgICAgICAgICAgaW5wdXRzOiB7XG4gICAgICAgICAgICAgIHBvc2l0aW9uOiAxXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgICAyOiB7XG4gICAgICAgIGZsZXg6IDEsXG4gICAgICAgIGNvbXBvbmVudHM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0eXBlOiBQb3BFbnRpdHlGaWVsZEdyb3VwQ29tcG9uZW50LFxuICAgICAgICAgICAgaW5wdXRzOiB7XG4gICAgICAgICAgICAgIHBvc2l0aW9uOiAyXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgICAzOiB7XG4gICAgICAgIGZsZXg6IDIsXG4gICAgICAgIGNvbXBvbmVudHM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0eXBlOiBQb3BFbnRpdHlGaWVsZEdyb3VwQ29tcG9uZW50LFxuICAgICAgICAgICAgaW5wdXRzOiB7XG4gICAgICAgICAgICAgIHBvc2l0aW9uOiAyXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIF1cbiAgICAgIH1cbiAgICB9LFxuICB9ICk7XG5cblxuZXhwb3J0IGNvbnN0IEVudGl0eUFzc2lnbm1lbnRUYWIgPVxuICBuZXcgVGFiQ29uZmlnKCA8VGFiSW50ZXJmYWNlPntcbiAgICBpZDogJ2Fzc2lnbm1lbnRzJyxcbiAgICBwb3NpdGlvbnM6IHtcbiAgICAgIDE6IHtcbiAgICAgICAgaGVhZGVyOiBudWxsLFxuICAgICAgICBmbGV4OiAxLFxuICAgICAgICBjb21wb25lbnRzOiA8VGFiQ29tcG9uZW50SW50ZXJmYWNlW10+W1xuICAgICAgICAgIHsgdHlwZTogUG9wRW50aXR5QXNzaWdubWVudHNDb21wb25lbnQsIGlucHV0czoge30gfVxuICAgICAgICBdXG4gICAgICB9LFxuICAgIH0sXG4gIH0gKTtcblxuXG5leHBvcnQgY29uc3QgRW50aXR5U2NoZW1lVGFiID1cbiAgbmV3IFRhYkNvbmZpZygge1xuICAgIGlkOiAnZ2VuZXJhbCcsXG4gICAgcG9zaXRpb25zOiB7XG4gICAgICAxOiB7XG4gICAgICAgIGZsZXg6IDEsXG4gICAgICAgIGNvbXBvbmVudHM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0eXBlOiBQb3BFbnRpdHlTY2hlbWVDb21wb25lbnQsXG4gICAgICAgICAgICBpbnB1dHM6IHtcbiAgICAgICAgICAgICAgaWQ6ICcxJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICB9LFxuICAgIGNvbHVtbldyYXA6IGZhbHNlLFxuICAgIC8vIHdyYXA6IGZhbHNlLCAvLyB0dXJuIHdyYXBwZXIgb2ZmIGllLiBtYXJnaW4sICBzaW5jZSAgUG9wUHJvZmlsZVNjaGVtZUNvbXBvbmVudCBpcyBhbm90aGVyIHRhYiBpbnN0YW5jZVxuICAgIG9uTG9hZDogKCBjb25maWc6IENvcmVDb25maWcsIHRhYjogVGFiQ29uZmlnICkgPT4ge1xuICAgICAgLy8gY29uc29sZS5sb2coJ2NvbmZpZycsIGNvbmZpZyk7XG4gICAgICAvLyBjb25zb2xlLmxvZygndGFiJywgdGFiKTtcbiAgICB9LFxuXG4gICAgb25FdmVudDogKCBjb3JlOiBDb3JlQ29uZmlnLCBldmVudDogUG9wQmFzZUV2ZW50SW50ZXJmYWNlICkgPT4ge1xuICAgICAgLy8gY29uc29sZS5sb2coJ2V2ZW50JywgZXZlbnQpO1xuICAgIH0sXG4gIH0gKTtcblxuXG5leHBvcnQgY29uc3QgRW50aXR5SGlzdG9yeVRhYiA9XG4gIG5ldyBUYWJDb25maWcoIDxUYWJJbnRlcmZhY2U+e1xuICAgIGlkOiAnaGlzdG9yeScsXG4gICAgcG9zaXRpb25zOiB7XG4gICAgICAxOiB7XG4gICAgICAgIGhlYWRlcjogbnVsbCxcbiAgICAgICAgZmxleDogMSxcbiAgICAgICAgY29tcG9uZW50czogPFRhYkNvbXBvbmVudEludGVyZmFjZVtdPltcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0eXBlOiBQb3BFbnRpdHlIaXN0b3J5Q29tcG9uZW50LFxuICAgICAgICAgICAgaW5wdXRzOiB7fSxcbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgIH1cbiAgICB9LFxuICB9ICk7XG5cblxuZXhwb3J0IGNvbnN0IEZpZWxkRWRpdG9yVGFiID1cbiAgbmV3IFRhYkNvbmZpZygge1xuICAgIGlkOiAnZ2VuZXJhbCcsXG4gICAgc3luY1Bvc2l0aW9uczogZmFsc2UsXG4gICAgcG9zaXRpb25zOiB7XG4gICAgICAxOiB7XG4gICAgICAgIGZsZXg6IDEsXG4gICAgICAgIGNvbXBvbmVudHM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0eXBlOiBQb3BFbnRpdHlGaWVsZEVkaXRvckNvbXBvbmVudCxcbiAgICAgICAgICAgIGlucHV0czoge31cbiAgICAgICAgICB9LFxuICAgICAgICBdXG4gICAgICB9LFxuICAgIH0sXG4gICAgb25Mb2FkOiAoIGNvbmZpZzogQ29yZUNvbmZpZywgdGFiOiBUYWJDb25maWcgKSA9PiB7XG4gICAgICAvLyAgICAgICBjb25zb2xlLmxvZygnY29uZmlnJywgdGhpcyk7XG4gICAgICAvLyBjb25zb2xlLmxvZygndGFiJywgdGFiKTtcbiAgICB9LFxuXG4gICAgb25FdmVudDogKCBjb3JlOiBDb3JlQ29uZmlnLCBldmVudDogUG9wQmFzZUV2ZW50SW50ZXJmYWNlICkgPT4ge1xuICAgICAgLy8gY29uc29sZS5sb2coJ2V2ZW50JywgZXZlbnQpO1xuICAgIH0sXG4gIH0gKTtcblxuXG4iXX0=