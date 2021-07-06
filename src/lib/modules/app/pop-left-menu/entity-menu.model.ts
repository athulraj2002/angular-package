import { IsString } from '../../../pop-common-utility';


export class EntityMenu {
  public id: number;
  public description?: string;
  public entity_id?:number;
  public icon?: string;
  public iconType?: string;
  public name: string;
  public path: string;
  public short_description: string;
  public internal_name: string;
  public sort: number;
  public character_icon: string;
  hasAlias: boolean;
  originalPath: string;
  originalName: string;


  constructor(
    args: {
      id?: number,
      description?: string,
      entity_id?:number,
      icon?: string,
      name: string,
      path: string,
      short_description: string,
      internal_name?: string;
      sort: number,
      hasAlias?: boolean;
      originalPath?: string;
      originalName?: string;
    }
  ){
    this.id = args.id || 0;
    this.description = args.description || '';
    this.name = args.name;
    this.entity_id = args.entity_id || null;
    this.path = args.path;
    this.short_description = args.short_description || '';
    this.sort = args.sort || 0;
    this.internal_name = args.internal_name || null;
    this.hasAlias =  args.hasAlias ? true: false;
    this.originalPath =  args.originalPath;
    this.originalName =  args.originalName;
    if( IsString(args.icon, true) ){
      this.icon = args.icon;
      this._setIcon();
    }
    else{
      this._setCharacters();
    }
  }


  private _setPath(){
    const pathSet = this.path.split("/");
    this.path = '/' + pathSet[ pathSet.length - 1 ];
  }


  private _setIcon(){
    const iconSet = this.icon.split(":");
    if( iconSet.length === 2 ){
      [ this.iconType, this.icon ] = iconSet;
    }
  }


  private _setCharacters(){
    this.character_icon = "";
    const nameArray = this.name.split(" ");
    if( nameArray.length >= 2 ){
      this.character_icon += nameArray[ 0 ].charAt(0).toLocaleUpperCase();
      this.character_icon += nameArray[ 1 ].charAt(0).toLocaleUpperCase();
    }
    else{
      this.character_icon += this.name.charAt(0).toLocaleUpperCase();
      this.character_icon += this.name.charAt(1).toLocaleLowerCase();
    }
  }
}

