export declare const DefaultEntityField: {
    id: {
        ancillary: number;
        position: number;
        table: {
            checkbox: {
                visible: boolean;
                sort: number;
            };
            visible: boolean;
            sort: number;
        };
        model: {
            form: string;
            name: string;
            label: string;
            visible: boolean;
            maxlength: number;
            copyLabel: boolean;
            labelButton: boolean;
            valueButton: boolean;
            copyLabelBody: string;
            copyLabelDisplay: string;
            valueButtonDisplay: string;
            valueButtonDisabled: boolean;
            valueButtonDisplayTransformation: string;
            subLabel: string;
            subValue: string;
        };
        sort: number;
    };
    name: {
        ancillary: number;
        position: number;
        table: {
            visible: boolean;
            sort: number;
        };
        model: {
            form: string;
            name: string;
            label: string;
            bubble: boolean;
            pattern: string;
            visible: boolean;
            required: number;
            maxlength: number;
            patch: {
                field: string;
                path: string;
            };
        };
        sort: number;
    };
    description: {
        ancillary: number;
        position: number;
        table: {
            visible: boolean;
            sort: number;
        };
        model: {
            form: string;
            name: string;
            label: string;
            autoSize: boolean;
            height: number;
            maxHeight: number;
            maxlength: number;
            sort: number;
            patch: {
                field: string;
                path: string;
            };
        };
        sort: number;
    };
    added_by_user: {
        ancillary: number;
        position: number;
        table: {
            visible: boolean;
            sort: number;
        };
        model: {
            form: string;
            name: string;
            label: string;
            truncate: number;
        };
        sort: number;
    };
    archived_by_user: {
        ancillary: number;
        position: number;
        table: {
            visible: boolean;
            sort: number;
        };
        model: {
            form: string;
            name: string;
            label: string;
            truncate: number;
        };
        sort: number;
    };
    created_at: {
        ancillary: number;
        position: number;
        table: {
            visible: boolean;
            sort: number;
            transformation: {
                arg1: string;
                type: string;
            };
        };
        model: {
            form: string;
            name: string;
            label: string;
            truncate: number;
            transformation: {
                arg1: string;
                type: string;
            };
        };
        sort: number;
    };
    created_by_user_id: {
        ancillary: number;
        position: number;
        table: {
            visible: boolean;
            sort: number;
        };
        model: {
            form: string;
            name: string;
            label: string;
            truncate: number;
        };
        sort: number;
    };
    deleted_at: {
        ancillary: number;
        position: number;
        table: {
            visible: boolean;
            sort: number;
            transformation: {
                arg1: string;
                type: string;
            };
        };
        model: {
            form: string;
            name: string;
            label: string;
            transformation: {
                arg1: string;
                type: string;
            };
            type: string;
            action: string;
        };
        when: string[][][];
        sort: number;
    };
    deleted_by_user_id: {
        ancillary: number;
        position: number;
        table: {
            visible: boolean;
            sort: number;
        };
        model: {
            form: string;
            name: string;
            label: string;
            visible: boolean;
            maxlength: number;
            transformation: {
                type: string;
            };
        };
        sort: number;
    };
    updated_at: {
        ancillary: number;
        position: number;
        table: {
            visible: boolean;
            sort: number;
            transformation: {
                arg1: string;
                type: string;
            };
        };
        model: {
            form: string;
            name: string;
            label: string;
            transformation: {
                arg1: string;
                type: string;
            };
            type: string;
            action: string;
        };
        when: string[][][];
        sort: number;
    };
    archived: {
        ancillary: number;
        position: number;
        table: {
            visible: boolean;
            sort: number;
            transformation: {
                type: string;
            };
        };
        model: {
            form: string;
            name: string;
            label: string;
            transformation: {
                type: string;
            };
            type: string;
        };
        when: string[][][];
        sort: number;
    };
};
