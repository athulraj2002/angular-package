import { Component, ElementRef, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { PopEntitySchemeService } from '../../pop-entity-scheme.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { PopExtendComponent } from '../../../../../pop-extend.component';
import { PopDomService } from '../../../../../services/pop-dom.service';
import { fadeInOut, slideInOut } from '../../../../../pop-common-animations.model';
import { IsObjectThrowError } from '../../../../../pop-common-utility';
import { EntitySchemeSectionInterface } from '../../pop-entity-scheme.model';
import { InputConfig } from '../../../../base/pop-field-item/pop-input/input-config.model';


@Component( {
  selector: 'lib-entity-scheme-layout-section',
  templateUrl: './entity-scheme-layout-section.component.html',
  styleUrls: [ './entity-scheme-layout-section.component.scss' ],
  animations: [
    fadeInOut,
    slideInOut
  ],
} )
export class EntitySchemeLayoutSectionComponent extends PopExtendComponent implements OnInit, OnDestroy {
  @Input() section: any = <any>{};

  public name = 'EntitySchemeLayoutSectionComponent';

  protected srv: {
    scheme: PopEntitySchemeService
  } = {
    scheme: <PopEntitySchemeService>undefined
  };

  public ui = {
    header: <InputConfig>undefined,
    primaryIds: <number[]>[]
  };


  /**
   * @param el
   * @param _domRepo - transfer
   * @param _schemeRepo - transfer
   */
  constructor(
    public el: ElementRef,
    protected _domRepo: PopDomService,
    protected _schemeRepo: PopEntitySchemeService
  ){
    super();

    this.dom.session.expanded = {};
    this.dom.configure = (): Promise<boolean> => {
      return new Promise( async( resolve ) => {

        // #1: Enforce a CoreConfig
        this.core = IsObjectThrowError( this.core, true, `${this.name}:configureDom: - this.core` ) ? this.core : null;
        this.id = this.section.position;

        this.ui.primaryIds = this.srv.scheme.ui.primaryIds;

        this._buildHeader();
        await this.dom.setWithComponentInnerHeight( 'PopEntityTabColumnComponent', this.section.position, 75, 700 );

        return resolve( true );
      } );
    };
  }


  /**
   * The purpose of this component is to manage a specific section of the scheme layout
   * A user should be able to drag as sort assets, and apply custom settings to an asset
   * An asset is basically refers to something that the user can position in the scheme layout, field, component, etc
   */
  ngOnInit(){
    super.ngOnInit();
  }


  /**
   * A user can dragSort assets from one column to another in the scheme layout
   * @param event
   */
  onAssetSortDrop( event: CdkDragDrop<string[]> ){
    this.srv.scheme.onAssetSortDrop( event );
  }


  /**
   * A user can click on an edit button an edit the config settings of an asset
   * @param asset
   */
  onEditAsset( asset ){
    this.dom.setTimeout( 'edit-asset', async() => {
      await this.srv.scheme.onEditAsset( asset );
      if( this.dom.session.expanded[ asset.id ] ){
        this.onExpandAssetContent( asset );
        this.dom.setTimeout( 'reset-asset', async() => {
          this.onExpandAssetContent( asset );
        }, 0 );
      }
    }, 0 );

  }


  /**z
   * A user can click on a toggle to expand/close the content section of an asset
   * @param asset
   */
  onExpandAssetContent( asset: EntitySchemeSectionInterface ){
    if( asset.id ){
      this.dom.session.expanded[ asset.id ] = !this.dom.session.expanded[ asset.id ];
    }
  }


  /**
   * Triggers when user mouseleaves an asset
   * @param asset
   */
  onHideAssetMenu( asset: EntitySchemeSectionInterface ){
    asset.menu = false;
  }


  /**
   * Triggers when user mouseenters an asset
   * @param asset
   */
  onShowAssetMenu( asset: EntitySchemeSectionInterface ){
    if( asset.asset_type != 'table' ){
      asset.menu = true;
    }
  }


  /**
   * A user can click a remove button to remove an asset/child from the scheme layout
   * @param position
   * @param asset
   */
  onRemoveChildFromLayout( position: number, child: EntitySchemeSectionInterface ){
    // console.log( 'onRemoveChildFromLayout', position, child );
    this.srv.scheme.onRemoveChildFromLayout( position, child ).then( () => {
    } );
  }


  /**
   * Clean up the dom of this component
   */
  ngOnDestroy(){
    super.ngOnDestroy();
  }


  private _buildHeader(){
    this.ui.header = new InputConfig( {
      value: this.section.name,
      label: `Column ${this.section.position}`,
      pattern: 'AlphaNumeric',
      maxlength: 24,
      // hint: true,
      // transformation: 'toTitleCase',
      // hintText: 'This text will appear as a Header',
      patch: {
        field: 'name',
        path: `profile-schemes/${this.section.id}`
      }
    } );
  }


}
