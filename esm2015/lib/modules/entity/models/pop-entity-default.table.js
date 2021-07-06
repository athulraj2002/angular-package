export const DefaultEntityTable = {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS1kZWZhdWx0LnRhYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvZW50aXR5L21vZGVscy9wb3AtZW50aXR5LWRlZmF1bHQudGFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsTUFBTSxDQUFDLE1BQU0sa0JBQWtCLEdBQThCO0lBQzNELE9BQU8sRUFBRTtRQUNQLE9BQU8sRUFBRTtZQUNQLEVBQUUsRUFBRTtnQkFDRixRQUFRLEVBQUUsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUU7Z0JBQ3hDLE9BQU8sRUFBRSxJQUFJO2dCQUNiLElBQUksRUFBRSxDQUFDO2dCQUNQLE9BQU8sRUFBRSxJQUFJO2FBQ2Q7WUFDRCxJQUFJLEVBQUU7Z0JBQ0osT0FBTyxFQUFFLE1BQU07Z0JBQ2YsSUFBSSxFQUFFLENBQUM7Z0JBQ1AsT0FBTyxFQUFFLElBQUk7YUFDZDtTQUNGO1FBQ0QsT0FBTyxFQUFFO1lBQ1AsY0FBYyxFQUFFLElBQUk7WUFDcEIsYUFBYSxFQUFFLEtBQUs7WUFDcEIsV0FBVyxFQUFFLEtBQUs7WUFDbEIsYUFBYSxFQUFFLElBQUk7U0FDcEI7S0FDRjtJQUNELFVBQVUsRUFBRTtRQUNWLHdCQUF3QixFQUFFLElBQUk7UUFDOUIsdUJBQXVCLEVBQUUsSUFBSTtRQUM3Qix1QkFBdUIsRUFBRSxJQUFJO1FBQzdCLHFCQUFxQixFQUFFLElBQUk7UUFDM0IsdUJBQXVCLEVBQUUsSUFBSTtRQUM3Qix3QkFBd0IsRUFBRSxJQUFJO1FBQzlCLG9CQUFvQixFQUFFLElBQUk7S0FDM0I7SUFDRCxNQUFNLEVBQUU7UUFDTixRQUFRLEVBQUUsSUFBSTtRQUNkLEtBQUssRUFBRSxJQUFJO1FBQ1gsR0FBRyxFQUFFLElBQUk7UUFDVCxlQUFlLEVBQUUsS0FBSztRQUN0QixNQUFNLEVBQUUsRUFBRTtLQUNYO0lBQ0QsTUFBTSxFQUFFO1FBQ04sTUFBTSxFQUFFLEtBQUs7UUFDYixPQUFPLEVBQUUsU0FBUztLQUNuQjtDQUNGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFbnRpdHlNb2RlbFRhYmxlSW50ZXJmYWNlIH0gZnJvbSAnLi4vLi4vLi4vcG9wLWNvbW1vbi5tb2RlbCc7XG5cbmV4cG9ydCBjb25zdCBEZWZhdWx0RW50aXR5VGFibGUgPSA8RW50aXR5TW9kZWxUYWJsZUludGVyZmFjZT57XG4gIHNldHRpbmc6IHtcbiAgICBjb2x1bW5zOiB7XG4gICAgICBpZDoge1xuICAgICAgICBjaGVja2JveDogeyBzb3J0X2xldDogMCwgdmlzaWJsZTogdHJ1ZSB9LFxuICAgICAgICBkaXNwbGF5OiAnSUQnLFxuICAgICAgICBzb3J0OiA0LFxuICAgICAgICB2aXNpYmxlOiB0cnVlXG4gICAgICB9LFxuICAgICAgbmFtZToge1xuICAgICAgICBkaXNwbGF5OiAnTmFtZScsXG4gICAgICAgIHNvcnQ6IDEsXG4gICAgICAgIHZpc2libGU6IHRydWVcbiAgICAgIH0sXG4gICAgfSxcbiAgICBvcHRpb25zOiB7XG4gICAgICBkaXNwbGF5X2hlYWRlcjogdHJ1ZSxcbiAgICAgIGNvbHVtbl9zZWFyY2g6IGZhbHNlLFxuICAgICAgY29sdW1uX3NvcnQ6IGZhbHNlLFxuICAgICAgc3RpY2t5X2hlYWRlcjogdHJ1ZSxcbiAgICB9XG4gIH0sXG4gIHBlcm1pc3Npb246IHtcbiAgICBhbGxvd0NvbHVtbkRpc3BsYXlUb2dnbGU6IHRydWUsXG4gICAgYWxsb3dDb2x1bW5TdGlja3lUb2dnbGU6IHRydWUsXG4gICAgYWxsb3dDb2x1bW5TZWFyY2hUb2dnbGU6IHRydWUsXG4gICAgYWxsb3dDb2x1bW5Tb3J0VG9nZ2xlOiB0cnVlLFxuICAgIGFsbG93SGVhZGVyU3RpY2t5VG9nZ2xlOiB0cnVlLFxuICAgIGFsbG93SGVhZGVyRGlzcGxheVRvZ2dsZTogdHJ1ZSxcbiAgICBhbGxvd1BhZ2luYXRvclRvZ2dsZTogdHJ1ZSxcbiAgfSxcbiAgYnV0dG9uOiB7XG4gICAgYXJjaGl2ZWQ6IHRydWUsXG4gICAgY2xvbmU6IHRydWUsXG4gICAgbmV3OiB0cnVlLFxuICAgIGFkdmFuY2VkX3NlYXJjaDogZmFsc2UsXG4gICAgY3VzdG9tOiBbXVxuICB9LFxuICBmaWx0ZXI6IHtcbiAgICBhY3RpdmU6IGZhbHNlLFxuICAgIGRpc3BsYXk6ICdkZWZhdWx0J1xuICB9LFxufTtcbiJdfQ==