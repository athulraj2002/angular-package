const ɵ0 = {
    ancillary: 1,
    position: 1,
    table: {
        checkbox: {
            visible: true,
            sort: 0
        },
        visible: true,
        sort: 999
    },
    model: {
        form: 'label',
        name: 'id',
        label: 'ID',
        visible: true,
        maxlength: 32,
        copyLabel: true,
        labelButton: true,
        valueButton: true,
        copyLabelBody: '#id',
        copyLabelDisplay: 'ID #id',
        valueButtonDisplay: ':archived',
        valueButtonDisabled: true,
        valueButtonDisplayTransformation: 'toActiveOrArchived',
        subLabel: 'Created',
        subValue: 'created_at'
    },
    sort: 0
};
export const DefaultEntityField = {
    id: ɵ0,
    name: {
        ancillary: 0,
        position: 1,
        table: {
            visible: true,
            sort: 2
        },
        model: {
            form: 'input',
            name: 'name',
            label: 'Name',
            bubble: true,
            pattern: 'Default',
            visible: true,
            required: 1,
            maxlength: 64,
            patch: {
                field: 'name',
                path: '#path/#entityId'
            }
        },
        sort: 2
    },
    description: {
        ancillary: 0,
        position: 1,
        table: {
            visible: true,
            sort: 3
        },
        model: {
            form: 'textarea',
            name: 'description',
            label: 'Description',
            autoSize: false,
            height: 70,
            maxHeight: 150,
            maxlength: 255,
            sort: 3,
            patch: {
                field: 'description',
                path: '#path/#entityId'
            }
        },
        sort: 3
    },
    added_by_user: {
        ancillary: 1,
        position: 1,
        table: {
            visible: false,
            sort: 99
        },
        model: {
            form: 'label',
            name: 'added_by_user',
            label: 'Added By',
            truncate: 64,
        },
        sort: 99,
    },
    archived_by_user: {
        ancillary: 1,
        position: 1,
        table: {
            visible: false,
            sort: 99
        },
        model: {
            form: 'label',
            name: 'archived_by_user',
            label: 'Archived By',
            truncate: 64,
        },
        sort: 99
    },
    created_at: {
        ancillary: 1,
        position: 1,
        table: {
            visible: false,
            sort: 99,
            transformation: {
                arg1: 'date',
                type: 'date'
            },
        },
        model: {
            form: 'label',
            name: 'created_at',
            label: 'Added Date',
            truncate: 64,
            transformation: {
                arg1: 'date',
                type: 'date'
            },
        },
        sort: 99
    },
    created_by_user_id: {
        ancillary: 1,
        position: 1,
        table: {
            visible: false,
            sort: 99
        },
        model: {
            form: 'label',
            name: 'created_by_user_id',
            label: 'Added By ID',
            truncate: 64,
        },
        sort: 99
    },
    deleted_at: {
        ancillary: 1,
        position: 1,
        table: {
            visible: false,
            sort: 99,
            transformation: {
                arg1: 'date',
                type: 'date'
            },
        },
        model: {
            form: 'label',
            name: 'deleted_at',
            label: 'Deleted At',
            transformation: {
                arg1: 'date',
                type: 'date'
            },
            type: 'label',
            action: 'general'
        },
        when: [
            [
                [
                    'entity.deleted_at'
                ]
            ]
        ],
        sort: 99
    },
    deleted_by_user_id: {
        ancillary: 1,
        position: 1,
        table: {
            visible: false,
            sort: 99,
        },
        model: {
            form: 'label',
            name: 'deleted_by_user_id',
            label: 'Archived',
            visible: true,
            maxlength: 32,
            transformation: {
                type: 'toYesNoPipe'
            }
        },
        sort: 99
    },
    updated_at: {
        ancillary: 1,
        position: 1,
        table: {
            visible: false,
            sort: 99,
            transformation: {
                arg1: 'date',
                type: 'date'
            },
        },
        model: {
            form: 'label',
            name: 'updated_at',
            label: 'Last Update',
            transformation: {
                arg1: 'date',
                type: 'date'
            },
            type: 'label',
            action: 'general'
        },
        when: [
            [
                [
                    'entity.updated_at'
                ]
            ]
        ],
        sort: 99
    },
    archived: {
        ancillary: 1,
        position: 1,
        table: {
            visible: true,
            sort: 99,
            transformation: {
                type: 'toYesNoPipe'
            },
        },
        model: {
            form: 'label',
            name: 'archived',
            label: 'Archived',
            transformation: {
                type: 'toYesNoPipe'
            },
            type: 'label',
        },
        when: [
            [
                [
                    'entity.archived'
                ]
            ]
        ],
        sort: 99
    }
};
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWVudGl0eS1kZWZhdWx0LmZpZWxkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvZW50aXR5L21vZGVscy9wb3AtZW50aXR5LWRlZmF1bHQuZmllbGQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IldBQ007SUFDRixTQUFTLEVBQUUsQ0FBQztJQUNaLFFBQVEsRUFBRSxDQUFDO0lBQ1gsS0FBSyxFQUFFO1FBQ0wsUUFBUSxFQUFFO1lBQ1IsT0FBTyxFQUFFLElBQUk7WUFDYixJQUFJLEVBQUUsQ0FBQztTQUNSO1FBQ0QsT0FBTyxFQUFFLElBQUk7UUFDYixJQUFJLEVBQUUsR0FBRztLQUNWO0lBQ0QsS0FBSyxFQUFFO1FBQ0wsSUFBSSxFQUFFLE9BQU87UUFDYixJQUFJLEVBQUUsSUFBSTtRQUNWLEtBQUssRUFBRSxJQUFJO1FBQ1gsT0FBTyxFQUFFLElBQUk7UUFDYixTQUFTLEVBQUUsRUFBRTtRQUNiLFNBQVMsRUFBRSxJQUFJO1FBQ2YsV0FBVyxFQUFFLElBQUk7UUFDakIsV0FBVyxFQUFFLElBQUk7UUFDakIsYUFBYSxFQUFFLEtBQUs7UUFDcEIsZ0JBQWdCLEVBQUUsUUFBUTtRQUMxQixrQkFBa0IsRUFBRSxXQUFXO1FBQy9CLG1CQUFtQixFQUFFLElBQUk7UUFDekIsZ0NBQWdDLEVBQUUsb0JBQW9CO1FBQ3RELFFBQVEsRUFBRSxTQUFTO1FBQ25CLFFBQVEsRUFBRSxZQUFZO0tBQ3ZCO0lBQ0QsSUFBSSxFQUFFLENBQUM7Q0FDUjtBQTlCSCxNQUFNLENBQUMsTUFBTSxrQkFBa0IsR0FBRztJQUNoQyxFQUFFLElBNkJEO0lBQ0QsSUFBSSxFQUFFO1FBQ0osU0FBUyxFQUFFLENBQUM7UUFDWixRQUFRLEVBQUUsQ0FBQztRQUNYLEtBQUssRUFBRTtZQUNMLE9BQU8sRUFBRSxJQUFJO1lBQ2IsSUFBSSxFQUFFLENBQUM7U0FDUjtRQUNE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RTtZQUNMLElBQUksRUFBRSxPQUFPO1lBQ2IsSUFBSSxFQUFFLFlBQVk7WUFDbEIsS0FBSyxFQUFFLGFBQWE7WUFDcEIsY0FBYyxFQUFFO2dCQUNkLElBQUksRUFBRSxNQUFNO2dCQUNaLElBQUksRUFBRSxNQUFNO2FBQ2I7WUFDRCxJQUFJLEVBQUUsT0FBTztZQUNiLE1BQU0sRUFBRSxTQUFTO1NBQ2xCO1FBQ0QsSUFBSSxFQUFFO1lBQ0o7Z0JBQ0U7b0JBQ0UsbUJBQW1CO2lCQUNwQjthQUNGO1NBQ0Y7UUFDRCxJQUFJLEVBQUUsRUFBRTtLQUNUO0lBRUQsUUFBUSxFQUFFO1FBQ1IsU0FBUyxFQUFFLENBQUM7UUFDWixRQUFRLEVBQUUsQ0FBQztRQUNYLEtBQUssRUFBRTtZQUNMLE9BQU8sRUFBRSxJQUFJO1lBQ2IsSUFBSSxFQUFFLEVBQUU7WUFDUixjQUFjLEVBQUU7Z0JBQ2QsSUFBSSxFQUFFLGFBQWE7YUFDcEI7U0FDRjtRQUNELEtBQUssRUFBRTtZQUNMLElBQUksRUFBRSxPQUFPO1lBQ2IsSUFBSSxFQUFFLFVBQVU7WUFDaEIsS0FBSyxFQUFFLFVBQVU7WUFDakIsY0FBYyxFQUFFO2dCQUNkLElBQUksRUFBRSxhQUFhO2FBQ3BCO1lBQ0QsSUFBSSxFQUFFLE9BQU87U0FDZDtRQUNELElBQUksRUFBRTtZQUNKO2dCQUNFO29CQUNFLGlCQUFpQjtpQkFDbEI7YUFDRjtTQUNGO1FBQ0QsSUFBSSxFQUFFLEVBQUU7S0FDVDtDQUNGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY29uc3QgRGVmYXVsdEVudGl0eUZpZWxkID0ge1xuICBpZDoge1xuICAgIGFuY2lsbGFyeTogMSxcbiAgICBwb3NpdGlvbjogMSxcbiAgICB0YWJsZToge1xuICAgICAgY2hlY2tib3g6IHtcbiAgICAgICAgdmlzaWJsZTogdHJ1ZSxcbiAgICAgICAgc29ydDogMFxuICAgICAgfSxcbiAgICAgIHZpc2libGU6IHRydWUsXG4gICAgICBzb3J0OiA5OTlcbiAgICB9LFxuICAgIG1vZGVsOiB7XG4gICAgICBmb3JtOiAnbGFiZWwnLFxuICAgICAgbmFtZTogJ2lkJyxcbiAgICAgIGxhYmVsOiAnSUQnLFxuICAgICAgdmlzaWJsZTogdHJ1ZSxcbiAgICAgIG1heGxlbmd0aDogMzIsXG4gICAgICBjb3B5TGFiZWw6IHRydWUsXG4gICAgICBsYWJlbEJ1dHRvbjogdHJ1ZSxcbiAgICAgIHZhbHVlQnV0dG9uOiB0cnVlLFxuICAgICAgY29weUxhYmVsQm9keTogJyNpZCcsXG4gICAgICBjb3B5TGFiZWxEaXNwbGF5OiAnSUQgI2lkJyxcbiAgICAgIHZhbHVlQnV0dG9uRGlzcGxheTogJzphcmNoaXZlZCcsXG4gICAgICB2YWx1ZUJ1dHRvbkRpc2FibGVkOiB0cnVlLFxuICAgICAgdmFsdWVCdXR0b25EaXNwbGF5VHJhbnNmb3JtYXRpb246ICd0b0FjdGl2ZU9yQXJjaGl2ZWQnLFxuICAgICAgc3ViTGFiZWw6ICdDcmVhdGVkJyxcbiAgICAgIHN1YlZhbHVlOiAnY3JlYXRlZF9hdCdcbiAgICB9LFxuICAgIHNvcnQ6IDBcbiAgfSxcbiAgbmFtZToge1xuICAgIGFuY2lsbGFyeTogMCxcbiAgICBwb3NpdGlvbjogMSxcbiAgICB0YWJsZToge1xuICAgICAgdmlzaWJsZTogdHJ1ZSxcbiAgICAgIHNvcnQ6IDJcbiAgICB9LFxuICAgIG1vZGVsOiB7XG4gICAgICBmb3JtOiAnaW5wdXQnLFxuICAgICAgbmFtZTogJ25hbWUnLFxuICAgICAgbGFiZWw6ICdOYW1lJyxcbiAgICAgIGJ1YmJsZTogdHJ1ZSxcbiAgICAgIHBhdHRlcm46ICdEZWZhdWx0JyxcbiAgICAgIHZpc2libGU6IHRydWUsXG4gICAgICByZXF1aXJlZDogMSxcbiAgICAgIG1heGxlbmd0aDogNjQsXG4gICAgICBwYXRjaDoge1xuICAgICAgICBmaWVsZDogJ25hbWUnLFxuICAgICAgICBwYXRoOiAnI3BhdGgvI2VudGl0eUlkJ1xuICAgICAgfVxuICAgIH0sXG4gICAgc29ydDogMlxuICB9LFxuICBkZXNjcmlwdGlvbjoge1xuICAgIGFuY2lsbGFyeTogMCxcbiAgICBwb3NpdGlvbjogMSxcbiAgICB0YWJsZToge1xuICAgICAgdmlzaWJsZTogdHJ1ZSxcbiAgICAgIHNvcnQ6IDNcbiAgICB9LFxuICAgIG1vZGVsOiB7XG4gICAgICBmb3JtOiAndGV4dGFyZWEnLFxuICAgICAgbmFtZTogJ2Rlc2NyaXB0aW9uJyxcbiAgICAgIGxhYmVsOiAnRGVzY3JpcHRpb24nLFxuICAgICAgYXV0b1NpemU6IGZhbHNlLFxuICAgICAgaGVpZ2h0OiA3MCxcbiAgICAgIG1heEhlaWdodDogMTUwLFxuICAgICAgbWF4bGVuZ3RoOiAyNTUsXG4gICAgICBzb3J0OiAzLFxuICAgICAgcGF0Y2g6IHtcbiAgICAgICAgZmllbGQ6ICdkZXNjcmlwdGlvbicsXG4gICAgICAgIHBhdGg6ICcjcGF0aC8jZW50aXR5SWQnXG4gICAgICB9XG4gICAgfSxcbiAgICBzb3J0OiAzXG4gIH0sXG5cblxuICBhZGRlZF9ieV91c2VyOiB7XG4gICAgYW5jaWxsYXJ5OiAxLFxuICAgIHBvc2l0aW9uOiAxLFxuICAgIHRhYmxlOiB7XG4gICAgICB2aXNpYmxlOiBmYWxzZSxcbiAgICAgIHNvcnQ6IDk5XG4gICAgfSxcbiAgICBtb2RlbDoge1xuICAgICAgZm9ybTogJ2xhYmVsJyxcbiAgICAgIG5hbWU6ICdhZGRlZF9ieV91c2VyJyxcbiAgICAgIGxhYmVsOiAnQWRkZWQgQnknLFxuICAgICAgdHJ1bmNhdGU6IDY0LFxuICAgIH0sXG4gICAgc29ydDogOTksXG4gIH0sXG4gIGFyY2hpdmVkX2J5X3VzZXI6IHtcbiAgICBhbmNpbGxhcnk6IDEsXG4gICAgcG9zaXRpb246IDEsXG4gICAgdGFibGU6IHtcbiAgICAgIHZpc2libGU6IGZhbHNlLFxuICAgICAgc29ydDogOTlcbiAgICB9LFxuICAgIG1vZGVsOiB7XG4gICAgICBmb3JtOiAnbGFiZWwnLFxuICAgICAgbmFtZTogJ2FyY2hpdmVkX2J5X3VzZXInLFxuICAgICAgbGFiZWw6ICdBcmNoaXZlZCBCeScsXG4gICAgICB0cnVuY2F0ZTogNjQsXG4gICAgfSxcbiAgICBzb3J0OiA5OVxuICB9LFxuXG5cbiAgY3JlYXRlZF9hdDoge1xuICAgIGFuY2lsbGFyeTogMSxcbiAgICBwb3NpdGlvbjogMSxcbiAgICB0YWJsZToge1xuICAgICAgdmlzaWJsZTogZmFsc2UsXG4gICAgICBzb3J0OiA5OSxcbiAgICAgIHRyYW5zZm9ybWF0aW9uOiB7XG4gICAgICAgIGFyZzE6ICdkYXRlJyxcbiAgICAgICAgdHlwZTogJ2RhdGUnXG4gICAgICB9LFxuICAgIH0sXG4gICAgbW9kZWw6IHtcbiAgICAgIGZvcm06ICdsYWJlbCcsXG4gICAgICBuYW1lOiAnY3JlYXRlZF9hdCcsXG4gICAgICBsYWJlbDogJ0FkZGVkIERhdGUnLFxuICAgICAgdHJ1bmNhdGU6IDY0LFxuICAgICAgdHJhbnNmb3JtYXRpb246IHtcbiAgICAgICAgYXJnMTogJ2RhdGUnLFxuICAgICAgICB0eXBlOiAnZGF0ZSdcbiAgICAgIH0sXG4gICAgfSxcbiAgICBzb3J0OiA5OVxuICB9LFxuICBjcmVhdGVkX2J5X3VzZXJfaWQ6IHtcbiAgICBhbmNpbGxhcnk6IDEsXG4gICAgcG9zaXRpb246IDEsXG4gICAgdGFibGU6IHtcbiAgICAgIHZpc2libGU6IGZhbHNlLFxuICAgICAgc29ydDogOTlcbiAgICB9LFxuICAgIG1vZGVsOiB7XG4gICAgICBmb3JtOiAnbGFiZWwnLFxuICAgICAgbmFtZTogJ2NyZWF0ZWRfYnlfdXNlcl9pZCcsXG4gICAgICBsYWJlbDogJ0FkZGVkIEJ5IElEJyxcbiAgICAgIHRydW5jYXRlOiA2NCxcbiAgICB9LFxuICAgIHNvcnQ6IDk5XG4gIH0sXG4gIGRlbGV0ZWRfYXQ6IHtcbiAgICBhbmNpbGxhcnk6IDEsXG4gICAgcG9zaXRpb246IDEsXG4gICAgdGFibGU6IHtcbiAgICAgIHZpc2libGU6IGZhbHNlLFxuICAgICAgc29ydDogOTksXG4gICAgICB0cmFuc2Zvcm1hdGlvbjoge1xuICAgICAgICBhcmcxOiAnZGF0ZScsXG4gICAgICAgIHR5cGU6ICdkYXRlJ1xuICAgICAgfSxcbiAgICB9LFxuICAgIG1vZGVsOiB7XG4gICAgICBmb3JtOiAnbGFiZWwnLFxuICAgICAgbmFtZTogJ2RlbGV0ZWRfYXQnLFxuICAgICAgbGFiZWw6ICdEZWxldGVkIEF0JyxcbiAgICAgIHRyYW5zZm9ybWF0aW9uOiB7XG4gICAgICAgIGFyZzE6ICdkYXRlJyxcbiAgICAgICAgdHlwZTogJ2RhdGUnXG4gICAgICB9LFxuICAgICAgdHlwZTogJ2xhYmVsJyxcbiAgICAgIGFjdGlvbjogJ2dlbmVyYWwnXG4gICAgfSxcbiAgICB3aGVuOiBbXG4gICAgICBbXG4gICAgICAgIFtcbiAgICAgICAgICAnZW50aXR5LmRlbGV0ZWRfYXQnXG4gICAgICAgIF1cbiAgICAgIF1cbiAgICBdLFxuICAgIHNvcnQ6IDk5XG4gIH0sXG5cbiAgZGVsZXRlZF9ieV91c2VyX2lkOiB7XG4gICAgYW5jaWxsYXJ5OiAxLFxuICAgIHBvc2l0aW9uOiAxLFxuICAgIHRhYmxlOiB7XG4gICAgICB2aXNpYmxlOiBmYWxzZSxcbiAgICAgIHNvcnQ6IDk5LFxuICAgIH0sXG5cbiAgICBtb2RlbDoge1xuICAgICAgZm9ybTogJ2xhYmVsJyxcbiAgICAgIG5hbWU6ICdkZWxldGVkX2J5X3VzZXJfaWQnLFxuICAgICAgbGFiZWw6ICdBcmNoaXZlZCcsXG4gICAgICB2aXNpYmxlOiB0cnVlLFxuICAgICAgbWF4bGVuZ3RoOiAzMixcbiAgICAgIHRyYW5zZm9ybWF0aW9uOiB7XG4gICAgICAgIHR5cGU6ICd0b1llc05vUGlwZSdcbiAgICAgIH1cbiAgICB9LFxuICAgIHNvcnQ6IDk5XG4gIH0sXG4gIHVwZGF0ZWRfYXQ6IHtcbiAgICBhbmNpbGxhcnk6IDEsXG4gICAgcG9zaXRpb246IDEsXG4gICAgdGFibGU6IHtcbiAgICAgIHZpc2libGU6IGZhbHNlLFxuICAgICAgc29ydDogOTksXG4gICAgICB0cmFuc2Zvcm1hdGlvbjoge1xuICAgICAgICBhcmcxOiAnZGF0ZScsXG4gICAgICAgIHR5cGU6ICdkYXRlJ1xuICAgICAgfSxcbiAgICB9LFxuICAgIG1vZGVsOiB7XG4gICAgICBmb3JtOiAnbGFiZWwnLFxuICAgICAgbmFtZTogJ3VwZGF0ZWRfYXQnLFxuICAgICAgbGFiZWw6ICdMYXN0IFVwZGF0ZScsXG4gICAgICB0cmFuc2Zvcm1hdGlvbjoge1xuICAgICAgICBhcmcxOiAnZGF0ZScsXG4gICAgICAgIHR5cGU6ICdkYXRlJ1xuICAgICAgfSxcbiAgICAgIHR5cGU6ICdsYWJlbCcsXG4gICAgICBhY3Rpb246ICdnZW5lcmFsJ1xuICAgIH0sXG4gICAgd2hlbjogW1xuICAgICAgW1xuICAgICAgICBbXG4gICAgICAgICAgJ2VudGl0eS51cGRhdGVkX2F0J1xuICAgICAgICBdXG4gICAgICBdXG4gICAgXSxcbiAgICBzb3J0OiA5OVxuICB9LFxuXG4gIGFyY2hpdmVkOiB7XG4gICAgYW5jaWxsYXJ5OiAxLFxuICAgIHBvc2l0aW9uOiAxLFxuICAgIHRhYmxlOiB7XG4gICAgICB2aXNpYmxlOiB0cnVlLFxuICAgICAgc29ydDogOTksXG4gICAgICB0cmFuc2Zvcm1hdGlvbjoge1xuICAgICAgICB0eXBlOiAndG9ZZXNOb1BpcGUnXG4gICAgICB9LFxuICAgIH0sXG4gICAgbW9kZWw6IHtcbiAgICAgIGZvcm06ICdsYWJlbCcsXG4gICAgICBuYW1lOiAnYXJjaGl2ZWQnLFxuICAgICAgbGFiZWw6ICdBcmNoaXZlZCcsXG4gICAgICB0cmFuc2Zvcm1hdGlvbjoge1xuICAgICAgICB0eXBlOiAndG9ZZXNOb1BpcGUnXG4gICAgICB9LFxuICAgICAgdHlwZTogJ2xhYmVsJyxcbiAgICB9LFxuICAgIHdoZW46IFtcbiAgICAgIFtcbiAgICAgICAgW1xuICAgICAgICAgICdlbnRpdHkuYXJjaGl2ZWQnXG4gICAgICAgIF1cbiAgICAgIF1cbiAgICBdLFxuICAgIHNvcnQ6IDk5XG4gIH1cbn07XG4iXX0=