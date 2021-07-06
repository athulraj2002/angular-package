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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS1maWVsZC5zZXR0aW5nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvZW50aXR5L3BvcC1lbnRpdHktZmllbGQvcG9wLWVudGl0eS1maWVsZC5zZXR0aW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE1BQU0sQ0FBQyxNQUFNLGtCQUFrQixHQUFHO0lBQ2hDLFNBQVMsRUFBRTtRQUNULElBQUksRUFBRSxXQUFXO1FBQ2pCLEtBQUssRUFBRSxXQUFXO1FBQ2xCLFFBQVEsRUFBRSx3Q0FBd0M7UUFDbEQsSUFBSSxFQUFFLFNBQVM7UUFDZixZQUFZLEVBQUUsS0FBSztLQUNwQjtJQUNELFVBQVUsRUFBRTtRQUNWLElBQUksRUFBRSxZQUFZO1FBQ2xCLEtBQUssRUFBRSxxQkFBcUI7UUFDNUIsUUFBUSxFQUFFLGtGQUFrRjtRQUM1RixJQUFJLEVBQUUsU0FBUztRQUNmLEtBQUssRUFBRSxPQUFPO1FBQ2QsWUFBWSxFQUFFLElBQUk7S0FDbkI7SUFDRCxZQUFZLEVBQUU7UUFDWixJQUFJLEVBQUUsY0FBYztRQUNwQixLQUFLLEVBQUUsb0JBQW9CO1FBQzNCLFFBQVEsRUFBRSx3RkFBd0Y7UUFDbEcsSUFBSSxFQUFFLFNBQVM7UUFDZixLQUFLLEVBQUUsT0FBTztRQUNkLFlBQVksRUFBRSxLQUFLO0tBQ3BCO0lBQ0QsWUFBWSxFQUFFO1FBQ1osSUFBSSxFQUFFLGNBQWM7UUFDcEIsS0FBSyxFQUFFLHNCQUFzQjtRQUM3QixRQUFRLEVBQUUscUVBQXFFO1FBQy9FLElBQUksRUFBRSxTQUFTO1FBQ2YsS0FBSyxFQUFFLE9BQU87UUFDZCxZQUFZLEVBQUUsS0FBSztLQUNwQjtDQUNGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY29uc3QgRW50aXR5RmllbGRTZXR0aW5nID0ge1xuICBzaG93X25hbWU6IHtcbiAgICBuYW1lOiAnc2hvd19uYW1lJyxcbiAgICBsYWJlbDogJ1Nob3cgTmFtZScsXG4gICAgaGVscFRleHQ6ICdTaG93IHRoZSBuYW1lIG9mIHRoZSBmaWVsZCBhcyBhIEhlYWRlcicsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHRWYWx1ZTogZmFsc2UsXG4gIH0sXG4gIGVkaXRfbGFiZWw6IHtcbiAgICBuYW1lOiAnZWRpdF9sYWJlbCcsXG4gICAgbGFiZWw6ICdBbGxvdyBMYWJlbCBDaGFuZ2VzJyxcbiAgICBoZWxwVGV4dDogJ1RoZSBVc2VyIHdpbGwgYmUgYWJsZSB0byBzZWUgdGhlIGxhYmVsLCBidXQgc2hvdWxkIHRoZXkgYmUgYWxsb3dlZCB0byBjaGFuZ2UgaXQ/JyxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZ3JvdXA6ICdsYWJlbCcsXG4gICAgZGVmYXVsdFZhbHVlOiB0cnVlXG4gIH0sXG4gIGN1c3RvbV9sYWJlbDoge1xuICAgIG5hbWU6ICdjdXN0b21fbGFiZWwnLFxuICAgIGxhYmVsOiAnQWxsb3cgQ3VzdG9tIExhYmVsJyxcbiAgICBoZWxwVGV4dDogJ1RoZSB1c2VyIHdpbGwgYmUgYWJsZSB0byBzZWxlY3QgXFwnQ3VzdG9tXFwnIGZyb20gdGhlIGRyb3Bkb3duIGFuZCBlbnRlciB0aGVpciBvd24gbGFiZWwnLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBncm91cDogJ2xhYmVsJyxcbiAgICBkZWZhdWx0VmFsdWU6IGZhbHNlLFxuICB9LFxuICB1bmlxdWVfbGFiZWw6IHtcbiAgICBuYW1lOiAndW5pcXVlX2xhYmVsJyxcbiAgICBsYWJlbDogJ1JlcXVpcmUgVW5pcXVlIExhYmVsJyxcbiAgICBoZWxwVGV4dDogJ0VhY2ggVmFsdWUgZW50cnkgd2lsbCBiZSByZXF1aXJlZCB0byB1c2UgYSBzZWxlY3QgYSBkaWZmZXJlbnQgbGFiZWwnLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBncm91cDogJ2xhYmVsJyxcbiAgICBkZWZhdWx0VmFsdWU6IGZhbHNlLFxuICB9LFxufTtcblxuIl19