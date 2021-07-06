export declare class EntityMenu {
    id: number;
    description?: string;
    entity_id?: number;
    icon?: string;
    iconType?: string;
    name: string;
    path: string;
    short_description: string;
    internal_name: string;
    sort: number;
    character_icon: string;
    hasAlias: boolean;
    originalPath: string;
    originalName: string;
    constructor(args: {
        id?: number;
        description?: string;
        entity_id?: number;
        icon?: string;
        name: string;
        path: string;
        short_description: string;
        internal_name?: string;
        sort: number;
        hasAlias?: boolean;
        originalPath?: string;
        originalName?: string;
    });
    private _setPath;
    private _setIcon;
    private _setCharacters;
}
