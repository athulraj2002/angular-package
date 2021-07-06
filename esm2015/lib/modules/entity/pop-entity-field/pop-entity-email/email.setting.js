export const EmailFieldSetting = {
    unique_label: {
        name: 'unique_label',
        type: 'boolean',
        defaultValue: true,
    },
    disabled: {
        name: 'disabled',
        type: 'boolean',
        item: 'address',
        defaultValue: false,
    },
    address_pattern: {
        name: 'address_pattern',
        item: 'address',
        type: 'model',
        model: 'pattern',
        value: 'Email',
    },
    make_primary: {
        name: 'make_primary',
        type: 'fixed',
        defaultValue: false,
    },
    email_primary: {
        name: 'email_primary',
        type: 'trait',
        icon: 'email',
        defaultValue: false,
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1haWwuc2V0dGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2VudGl0eS9wb3AtZW50aXR5LWZpZWxkL3BvcC1lbnRpdHktZW1haWwvZW1haWwuc2V0dGluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxNQUFNLENBQUMsTUFBTSxpQkFBaUIsR0FBNEM7SUFDeEUsWUFBWSxFQUFFO1FBQ1osSUFBSSxFQUFFLGNBQWM7UUFDcEIsSUFBSSxFQUFFLFNBQVM7UUFDZixZQUFZLEVBQUUsSUFBSTtLQUNuQjtJQUNELFFBQVEsRUFBRTtRQUNSLElBQUksRUFBRSxVQUFVO1FBQ2hCLElBQUksRUFBRSxTQUFTO1FBQ2YsSUFBSSxFQUFFLFNBQVM7UUFDZixZQUFZLEVBQUUsS0FBSztLQUNwQjtJQUNELGVBQWUsRUFBRTtRQUNmLElBQUksRUFBRSxpQkFBaUI7UUFDdkIsSUFBSSxFQUFFLFNBQVM7UUFDZixJQUFJLEVBQUUsT0FBTztRQUNiLEtBQUssRUFBRSxTQUFTO1FBQ2hCLEtBQUssRUFBRSxPQUFPO0tBQ2Y7SUFDRCxZQUFZLEVBQUU7UUFDWixJQUFJLEVBQUUsY0FBYztRQUNwQixJQUFJLEVBQUUsT0FBTztRQUNiLFlBQVksRUFBRSxLQUFLO0tBQ3BCO0lBRUQsYUFBYSxFQUFFO1FBQ2IsSUFBSSxFQUFFLGVBQWU7UUFDckIsSUFBSSxFQUFFLE9BQU87UUFDYixJQUFJLEVBQUUsT0FBTztRQUNiLFlBQVksRUFBRSxLQUFLO0tBQ3BCO0NBQ0YsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERpY3Rpb25hcnksIEZpZWxkQ3VzdG9tU2V0dGluZ0ludGVyZmFjZSB9IGZyb20gJy4uLy4uLy4uLy4uL3BvcC1jb21tb24ubW9kZWwnO1xuXG5leHBvcnQgY29uc3QgRW1haWxGaWVsZFNldHRpbmcgPSA8RGljdGlvbmFyeTxGaWVsZEN1c3RvbVNldHRpbmdJbnRlcmZhY2U+PntcbiAgdW5pcXVlX2xhYmVsOiB7XG4gICAgbmFtZTogJ3VuaXF1ZV9sYWJlbCcsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHRWYWx1ZTogdHJ1ZSxcbiAgfSxcbiAgZGlzYWJsZWQ6IHtcbiAgICBuYW1lOiAnZGlzYWJsZWQnLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBpdGVtOiAnYWRkcmVzcycsXG4gICAgZGVmYXVsdFZhbHVlOiBmYWxzZSxcbiAgfSxcbiAgYWRkcmVzc19wYXR0ZXJuOiB7XG4gICAgbmFtZTogJ2FkZHJlc3NfcGF0dGVybicsXG4gICAgaXRlbTogJ2FkZHJlc3MnLFxuICAgIHR5cGU6ICdtb2RlbCcsXG4gICAgbW9kZWw6ICdwYXR0ZXJuJyxcbiAgICB2YWx1ZTogJ0VtYWlsJyxcbiAgfSxcbiAgbWFrZV9wcmltYXJ5OiB7XG4gICAgbmFtZTogJ21ha2VfcHJpbWFyeScsXG4gICAgdHlwZTogJ2ZpeGVkJyxcbiAgICBkZWZhdWx0VmFsdWU6IGZhbHNlLFxuICB9LFxuXG4gIGVtYWlsX3ByaW1hcnk6IHtcbiAgICBuYW1lOiAnZW1haWxfcHJpbWFyeScsXG4gICAgdHlwZTogJ3RyYWl0JyxcbiAgICBpY29uOiAnZW1haWwnLFxuICAgIGRlZmF1bHRWYWx1ZTogZmFsc2UsXG4gIH0sXG59O1xuIl19