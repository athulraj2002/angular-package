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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS1kZWZhdWx0LmFjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2VudGl0eS9tb2RlbHMvcG9wLWVudGl0eS1kZWZhdWx0LmFjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLENBQUMsTUFBTSxtQkFBbUIsR0FBRztJQUNqQyxHQUFHLEVBQUU7UUFDSCxXQUFXLEVBQUUsMkJBQTJCO1FBQ3hDLE1BQU0sRUFBRTtZQUNOLE1BQU0sRUFBRTtnQkFDTixJQUFJLEVBQUU7b0JBQ0osUUFBUSxFQUFFLElBQUk7b0JBQ2QsT0FBTyxFQUFFLE9BQU87aUJBQ2pCO2FBQ0Y7WUFDRCxJQUFJLEVBQUUsTUFBTTtZQUNaLEtBQUssRUFBRSxvQkFBb0I7WUFDM0IsT0FBTyxFQUFFLE9BQU87WUFDaEIsT0FBTyxFQUFFLG1CQUFtQjtZQUM1QixNQUFNLEVBQUUsS0FBSztTQUNkO1FBQ0QsTUFBTSxFQUFFLENBQUM7S0FDVjtJQUNELGVBQWUsRUFBRTtRQUNmLFdBQVcsRUFBRSxvQ0FBb0M7UUFDakQsTUFBTSxFQUFFO1lBQ04sTUFBTSxFQUFFO2dCQUNOLElBQUksRUFBRTtvQkFDSixRQUFRLEVBQUUsSUFBSTtvQkFDZCxPQUFPLEVBQUUsY0FBYztpQkFDeEI7YUFDRjtZQUNELElBQUksRUFBRSxLQUFLO1lBQ1gsS0FBSyxFQUFFLGlCQUFpQjtZQUN4QixPQUFPLEVBQUUsT0FBTztZQUNoQixPQUFPLEVBQUUsSUFBSTtZQUNiLE1BQU0sRUFBRSxRQUFRO1NBQ2pCO1FBQ0QsTUFBTSxFQUFFLENBQUM7S0FDVjtDQUNGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY29uc3QgRGVmYXVsdEVudGl0eUFjdGlvbiA9IHtcbiAgbmV3OiB7XG4gICAgZGVzY3JpcHRpb246ICdBZGQgQSBOZXcgUmVjb3JkIFRvICNuYW1lJyxcbiAgICBjb25maWc6IHtcbiAgICAgIGZpZWxkczoge1xuICAgICAgICBuYW1lOiB7XG4gICAgICAgICAgcmVxdWlyZWQ6IHRydWUsXG4gICAgICAgICAgcGF0dGVybjogJ0FscGhhJ1xuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGh0dHA6ICdQT1NUJyxcbiAgICAgIGxhYmVsOiAnTmV3ICNpbnRlcm5hbF9uYW1lJyxcbiAgICAgIHBvc3RVcmw6ICcjcGF0aCcsXG4gICAgICBnb1RvVXJsOiAnI3BhdGgvOmlkL2dlbmVyYWwnLFxuICAgICAgc3VibWl0OiAnTmV3JyxcbiAgICB9LFxuICAgIGFjdGl2ZTogMVxuICB9LFxuICBhZHZhbmNlZF9zZWFyY2g6IHtcbiAgICBkZXNjcmlwdGlvbjogJ0FkdmFuY2VkIFNlYXJjaCBGb3IgI2ludGVybmFsX25hbWUnLFxuICAgIGNvbmZpZzoge1xuICAgICAgZmllbGRzOiB7XG4gICAgICAgIG5hbWU6IHtcbiAgICAgICAgICByZXF1aXJlZDogdHJ1ZSxcbiAgICAgICAgICBwYXR0ZXJuOiAnQWxwaGFOdW1lcmljJ1xuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGh0dHA6ICdHRVQnLFxuICAgICAgbGFiZWw6ICdBZHZhbmNlZCBTZWFyY2gnLFxuICAgICAgZ2V0X3VybDogJyNwYXRoJyxcbiAgICAgIGdvVG9Vcmw6IG51bGwsXG4gICAgICBzdWJtaXQ6ICdTZWFyY2gnLFxuICAgIH0sXG4gICAgYWN0aXZlOiAxXG4gIH1cbn07XG4iXX0=