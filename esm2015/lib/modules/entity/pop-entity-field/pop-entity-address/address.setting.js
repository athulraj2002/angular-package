import { FieldSwitchParamComponent } from "../../pop-entity-field-editor/pop-entity-field-settings/pop-entity-field-item-params/params/field-switch-param.component";
export const AddressFieldSetting = {
    show_name: null,
    unique_label: {
        name: 'unique_label',
        type: 'boolean',
        defaultValue: true,
    },
    primary_can_text: {
        name: 'primary_can_text',
        label: 'Primary Text',
        type: 'primary',
        defaultValue: true,
    },
    primary_can_call: {
        name: 'primary_can_call',
        label: 'Primary Call',
        type: 'primary',
        defaultValue: true,
    },
    make_primary: {
        name: 'make_primary',
        type: 'fixed',
        defaultValue: false,
    },
    shipping_primary: {
        name: 'shipping_primary',
        type: 'trait',
        icon: 'local_shipping',
        defaultValue: false,
    },
    billing_primary: {
        name: 'billing_primary',
        type: 'trait',
        icon: 'local_post_office',
        component: FieldSwitchParamComponent,
        defaultValue: false,
    },
    allow_canada: {
        name: 'allow_canada',
        type: 'boolean',
        item: 'zip',
        defaultValue: false,
    },
    auto_fill: {
        name: 'auto_fill',
        type: 'boolean',
        item: 'zip',
        component: FieldSwitchParamComponent,
        defaultValue: true,
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkcmVzcy5zZXR0aW5nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvZW50aXR5L3BvcC1lbnRpdHktZmllbGQvcG9wLWVudGl0eS1hZGRyZXNzL2FkZHJlc3Muc2V0dGluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUMseUJBQXlCLEVBQUMsTUFBTSwwSEFBMEgsQ0FBQztBQUVuSyxNQUFNLENBQUMsTUFBTSxtQkFBbUIsR0FBNEM7SUFDMUUsU0FBUyxFQUFFLElBQUk7SUFDZixZQUFZLEVBQUU7UUFDWixJQUFJLEVBQUUsY0FBYztRQUNwQixJQUFJLEVBQUUsU0FBUztRQUNmLFlBQVksRUFBRSxJQUFJO0tBQ25CO0lBQ0QsZ0JBQWdCLEVBQUU7UUFDaEIsSUFBSSxFQUFFLGtCQUFrQjtRQUN4QixLQUFLLEVBQUUsY0FBYztRQUNyQixJQUFJLEVBQUUsU0FBUztRQUNmLFlBQVksRUFBRSxJQUFJO0tBQ25CO0lBQ0QsZ0JBQWdCLEVBQUU7UUFDaEIsSUFBSSxFQUFFLGtCQUFrQjtRQUN4QixLQUFLLEVBQUUsY0FBYztRQUNyQixJQUFJLEVBQUUsU0FBUztRQUNmLFlBQVksRUFBRSxJQUFJO0tBQ25CO0lBQ0QsWUFBWSxFQUFFO1FBQ1osSUFBSSxFQUFFLGNBQWM7UUFDcEIsSUFBSSxFQUFFLE9BQU87UUFDYixZQUFZLEVBQUUsS0FBSztLQUNwQjtJQUNELGdCQUFnQixFQUFFO1FBQ2hCLElBQUksRUFBRSxrQkFBa0I7UUFDeEIsSUFBSSxFQUFFLE9BQU87UUFDYixJQUFJLEVBQUUsZ0JBQWdCO1FBQ3RCLFlBQVksRUFBRSxLQUFLO0tBQ3BCO0lBQ0QsZUFBZSxFQUFFO1FBQ2YsSUFBSSxFQUFFLGlCQUFpQjtRQUN2QixJQUFJLEVBQUUsT0FBTztRQUNiLElBQUksRUFBRSxtQkFBbUI7UUFDekIsU0FBUyxFQUFFLHlCQUF5QjtRQUNwQyxZQUFZLEVBQUUsS0FBSztLQUNwQjtJQUNELFlBQVksRUFBRTtRQUNaLElBQUksRUFBRSxjQUFjO1FBQ3BCLElBQUksRUFBRSxTQUFTO1FBQ2YsSUFBSSxFQUFFLEtBQUs7UUFDWCxZQUFZLEVBQUUsS0FBSztLQUNwQjtJQUNELFNBQVMsRUFBRTtRQUNULElBQUksRUFBRSxXQUFXO1FBQ2pCLElBQUksRUFBRSxTQUFTO1FBQ2YsSUFBSSxFQUFFLEtBQUs7UUFDWCxTQUFTLEVBQUUseUJBQXlCO1FBQ3BDLFlBQVksRUFBRSxJQUFJO0tBQ25CO0NBQ0YsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERpY3Rpb25hcnksIEZpZWxkQ3VzdG9tU2V0dGluZ0ludGVyZmFjZSB9IGZyb20gJy4uLy4uLy4uLy4uL3BvcC1jb21tb24ubW9kZWwnO1xuaW1wb3J0IHtGaWVsZFN3aXRjaFBhcmFtQ29tcG9uZW50fSBmcm9tIFwiLi4vLi4vcG9wLWVudGl0eS1maWVsZC1lZGl0b3IvcG9wLWVudGl0eS1maWVsZC1zZXR0aW5ncy9wb3AtZW50aXR5LWZpZWxkLWl0ZW0tcGFyYW1zL3BhcmFtcy9maWVsZC1zd2l0Y2gtcGFyYW0uY29tcG9uZW50XCI7XG5cbmV4cG9ydCBjb25zdCBBZGRyZXNzRmllbGRTZXR0aW5nID0gPERpY3Rpb25hcnk8RmllbGRDdXN0b21TZXR0aW5nSW50ZXJmYWNlPj57XG4gIHNob3dfbmFtZTogbnVsbCxcbiAgdW5pcXVlX2xhYmVsOiB7XG4gICAgbmFtZTogJ3VuaXF1ZV9sYWJlbCcsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHRWYWx1ZTogdHJ1ZSxcbiAgfSxcbiAgcHJpbWFyeV9jYW5fdGV4dDoge1xuICAgIG5hbWU6ICdwcmltYXJ5X2Nhbl90ZXh0JyxcbiAgICBsYWJlbDogJ1ByaW1hcnkgVGV4dCcsXG4gICAgdHlwZTogJ3ByaW1hcnknLFxuICAgIGRlZmF1bHRWYWx1ZTogdHJ1ZSxcbiAgfSxcbiAgcHJpbWFyeV9jYW5fY2FsbDoge1xuICAgIG5hbWU6ICdwcmltYXJ5X2Nhbl9jYWxsJyxcbiAgICBsYWJlbDogJ1ByaW1hcnkgQ2FsbCcsXG4gICAgdHlwZTogJ3ByaW1hcnknLFxuICAgIGRlZmF1bHRWYWx1ZTogdHJ1ZSxcbiAgfSxcbiAgbWFrZV9wcmltYXJ5OiB7XG4gICAgbmFtZTogJ21ha2VfcHJpbWFyeScsXG4gICAgdHlwZTogJ2ZpeGVkJyxcbiAgICBkZWZhdWx0VmFsdWU6IGZhbHNlLFxuICB9LFxuICBzaGlwcGluZ19wcmltYXJ5OiB7XG4gICAgbmFtZTogJ3NoaXBwaW5nX3ByaW1hcnknLFxuICAgIHR5cGU6ICd0cmFpdCcsXG4gICAgaWNvbjogJ2xvY2FsX3NoaXBwaW5nJyxcbiAgICBkZWZhdWx0VmFsdWU6IGZhbHNlLFxuICB9LFxuICBiaWxsaW5nX3ByaW1hcnk6IHtcbiAgICBuYW1lOiAnYmlsbGluZ19wcmltYXJ5JyxcbiAgICB0eXBlOiAndHJhaXQnLFxuICAgIGljb246ICdsb2NhbF9wb3N0X29mZmljZScsXG4gICAgY29tcG9uZW50OiBGaWVsZFN3aXRjaFBhcmFtQ29tcG9uZW50LFxuICAgIGRlZmF1bHRWYWx1ZTogZmFsc2UsXG4gIH0sXG4gIGFsbG93X2NhbmFkYToge1xuICAgIG5hbWU6ICdhbGxvd19jYW5hZGEnLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBpdGVtOiAnemlwJyxcbiAgICBkZWZhdWx0VmFsdWU6IGZhbHNlLFxuICB9LFxuICBhdXRvX2ZpbGw6IHtcbiAgICBuYW1lOiAnYXV0b19maWxsJyxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgaXRlbTogJ3ppcCcsXG4gICAgY29tcG9uZW50OiBGaWVsZFN3aXRjaFBhcmFtQ29tcG9uZW50LFxuICAgIGRlZmF1bHRWYWx1ZTogdHJ1ZSxcbiAgfSxcbn07XG4iXX0=