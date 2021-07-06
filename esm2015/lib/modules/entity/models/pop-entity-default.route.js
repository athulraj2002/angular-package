export const DefaultEntityRoute = {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS1kZWZhdWx0LnJvdXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvZW50aXR5L21vZGVscy9wb3AtZW50aXR5LWRlZmF1bHQucm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsTUFBTSxDQUFDLE1BQU0sa0JBQWtCLEdBQTJCO0lBQ3hELEdBQUcsRUFBRTtRQUNILE1BQU0sRUFBRTtZQUNOLElBQUksRUFBRSxZQUFZO1lBQ2xCLE1BQU0sRUFBRSxFQUFFO1NBQ1g7UUFDRCxRQUFRLEVBQUU7WUFDUixJQUFJLEVBQUUsT0FBTztZQUNiLE1BQU0sRUFBRSxFQUFFO1NBQ1g7UUFDRCxNQUFNLEVBQUU7WUFDTixJQUFJLEVBQUUsY0FBYztZQUNwQixNQUFNLEVBQUUsRUFBRTtTQUNYO1FBQ0QsT0FBTyxFQUFFO1lBQ1AsSUFBSSxFQUFFLG9CQUFvQjtZQUMxQixNQUFNLEVBQUUsRUFBRTtTQUNYO1FBQ0QsVUFBVSxFQUFFO1lBQ1YsSUFBSSxFQUFFLGtCQUFrQjtZQUN4QixNQUFNLEVBQUUsRUFBRTtTQUNYO0tBQ0Y7SUFDRCxLQUFLLEVBQUU7UUFDTCxNQUFNLEVBQUU7WUFDTixJQUFJLEVBQUUsWUFBWTtZQUNsQixNQUFNLEVBQUUsRUFBRTtTQUNYO0tBQ0Y7SUFDRCxPQUFPLEVBQUU7UUFDUCxNQUFNLEVBQUU7WUFDTixJQUFJLEVBQUUsWUFBWTtZQUNsQixNQUFNLEVBQUUsRUFBRTtTQUNYO0tBQ0Y7SUFDRCxPQUFPLEVBQUU7UUFDUCxNQUFNLEVBQUU7WUFDTixJQUFJLEVBQUUsWUFBWTtZQUNsQixNQUFNLEVBQUUsRUFBRTtTQUNYO0tBQ0Y7Q0FDRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU2VydmljZVJvdXRlc0ludGVyZmFjZSB9IGZyb20gJy4uLy4uLy4uL3BvcC1jb21tb24ubW9kZWwnO1xuXG5leHBvcnQgY29uc3QgRGVmYXVsdEVudGl0eVJvdXRlID0gPFNlcnZpY2VSb3V0ZXNJbnRlcmZhY2U+e1xuICBnZXQ6IHtcbiAgICBlbnRpdHk6IHtcbiAgICAgIHBhdGg6IGAjcGF0aC97aWR9YCxcbiAgICAgIHBhcmFtczoge30sXG4gICAgfSxcbiAgICBlbnRpdGllczoge1xuICAgICAgcGF0aDogYCNwYXRoYCxcbiAgICAgIHBhcmFtczoge30sXG4gICAgfSxcbiAgICBjb25maWc6IHtcbiAgICAgIHBhdGg6IGBhcHBzL2NvbmZpZ3NgLFxuICAgICAgcGFyYW1zOiB7fSxcbiAgICB9LFxuICAgIGhpc3Rvcnk6IHtcbiAgICAgIHBhdGg6IGAjcGF0aC97aWR9L2hpc3RvcnlgLFxuICAgICAgcGFyYW1zOiB7fSxcbiAgICB9LFxuICAgIHByZWZlcmVuY2U6IHtcbiAgICAgIHBhdGg6IGBhcHBzL3ByZWZlcmVuY2VzYCxcbiAgICAgIHBhcmFtczoge30sXG4gICAgfSxcbiAgfSxcbiAgcGF0Y2g6IHtcbiAgICBlbnRpdHk6IHtcbiAgICAgIHBhdGg6IGAjcGF0aC97aWR9YCxcbiAgICAgIHBhcmFtczoge30sXG4gICAgfSxcbiAgfSxcbiAgYXJjaGl2ZToge1xuICAgIGVudGl0eToge1xuICAgICAgcGF0aDogYCNwYXRoL3tpZH1gLFxuICAgICAgcGFyYW1zOiB7fSxcbiAgICB9LFxuICB9LFxuICByZXN0b3JlOiB7XG4gICAgZW50aXR5OiB7XG4gICAgICBwYXRoOiBgI3BhdGgve2lkfWAsXG4gICAgICBwYXJhbXM6IHt9LFxuICAgIH0sXG4gIH1cbn07XG4iXX0=