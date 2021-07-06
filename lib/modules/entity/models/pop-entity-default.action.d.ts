export declare const DefaultEntityAction: {
    new: {
        description: string;
        config: {
            fields: {
                name: {
                    required: boolean;
                    pattern: string;
                };
            };
            http: string;
            label: string;
            postUrl: string;
            goToUrl: string;
            submit: string;
        };
        active: number;
    };
    advanced_search: {
        description: string;
        config: {
            fields: {
                name: {
                    required: boolean;
                    pattern: string;
                };
            };
            http: string;
            label: string;
            get_url: string;
            goToUrl: any;
            submit: string;
        };
        active: number;
    };
};
