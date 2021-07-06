import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { PopEntitySchemeService } from '../pop-entity-scheme.service';
import { ButtonConfig } from '../../../base/pop-field-item/pop-button/button-config.model';
import { PopExtendComponent } from '../../../../pop-extend.component';
import { PopDomService } from '../../../../services/pop-dom.service';
import { IsArray, IsArrayThrowError, IsObject, IsObjectThrowError, ObjectContainsTagSearch, TitleCase, ToArray } from '../../../../pop-common-utility';
import { EntitySchemeSectionConfig, EntitySchemeSectionInterface, ProfileSchemeAssetPoolInterface } from '../pop-entity-scheme.model';
import { Dictionary, KeyMap, PopEntity, PopPortal, ServiceInjector } from '../../../../pop-common.model';
import { CheckboxConfig } from '../../../base/pop-field-item/pop-checkbox/checkbox-config.model';
import { PopTabMenuService } from '../../../base/pop-tab-menu/pop-tab-menu.service';
import { Router } from '@angular/router';


@Component( {
  selector: 'lib-entity-scheme-asset-pool',
  templateUrl: './pop-entity-scheme-asset-pool.component.html',
  styleUrls: [ './pop-entity-scheme-asset-pool.component.scss' ]
} )
export class PopEntitySchemeAssetPoolComponent extends PopExtendComponent implements OnInit, OnDestroy {
  public name = 'PopEntitySchemeAssetPoolComponent';


  public ui = {
    sections: <EntitySchemeSectionInterface[]>undefined,
    assignBtnConfigs: <ButtonConfig[]>undefined,
    assignableConfigs: <Dictionary<KeyMap<CheckboxConfig>>>undefined,
    assetPool: <ProfileSchemeAssetPoolInterface[]>undefined,
    section_keys: <number[]>undefined
  };

  protected asset = {
    primaryIds: <number[]>[]
  };


  protected srv = {
    scheme: <PopEntitySchemeService>undefined,
    tab: <PopTabMenuService>undefined,
    router: <Router>ServiceInjector.get( Router )
  };


  /**
   *
   * @param el
   * @param _domRepo - transfer
   * @param _schemeRepo - transfer
   * @param _tabRepo - transfer
   */
  constructor(
    public el: ElementRef,
    protected _domRepo: PopDomService,
    protected _schemeRepo: PopEntitySchemeService,
    protected _tabRepo: PopTabMenuService
  ){
    super();


    this.dom.configure = (): Promise<boolean> => {
      return new Promise( async( resolve ) => {
        this.dom.session.searchValue = '';
        // #1: Transfer in misc assets from the schemeRepo
        this.dom.state.searching = false;

        this.asset.primaryIds = this.srv.scheme.ui.primaryIds;

        await this.dom.setWithComponentInnerHeight( 'PopEntityTabColumnComponent', this.position, 230, 600 );
        this.dom.height.content = this.dom.height.inner - 95;
        this._setUiAssets();
        return resolve( true );
      } );
    };

    this.dom.proceed = (): Promise<boolean> => {
      return new Promise( async( resolve ) => {
        // #5: Reapply any onSession search that may have existed
        this.onApplyUiSearch( this.dom.session.searchValue );

        // #6: Disable the ui assign buttons for the initial view
        this.onDisableUiAssignButtons();

        return resolve( true );
      } );
    };
  }


  /**
   * The purpose of this component is to provide the user with lists of all available types that they can assign into a scheme layout
   */
  ngOnInit(){
    super.ngOnInit();
  }


  private _setUiAssets(){
    this.ui.sections = this.srv.scheme.ui.sections;  // transfer sections from schemeRepo
    this.ui.assignableConfigs = this.srv.scheme.ui.assignableConfigs;  // transfer assignableConfigs for attaching assets from pools
    // #2: Build the config for the buttons that the user will push to assign items to a layout position
    this.ui.assignBtnConfigs = []; // create a button for each section to assign assets from the pools with
    this.ui.sections.map( ( section ) => {
      this.ui.assignBtnConfigs[ section.position ] = new ButtonConfig( {
        bubble: true,
        event: 'assign',
        value: 'Column ' + ( +section.position ),
        size: 30,
        text: 16,
        icon: null,
      } );
    } );


    // #4: Configure the asset ppol items that a user can choose from to position in the layout
    let assetPool = IsObjectThrowError( this.srv.scheme.ui.assetPool, true, `${this.name}:configureDom: - this.srv.scheme.asset.asset_pool` ) ? JSON.parse( JSON.stringify( this.srv.scheme.ui.assetPool ) ) : {}; // transfer asset_pools from schemeRepo and mutate
    assetPool = Object.keys( assetPool ).map( ( assetTypeKey ) => {
      this.dom.state[ assetTypeKey ] = {
        expanded: true,
        visible: {}, // used with the search mechanism
        attach: {}, // used with the search mechanism
      };
      return <ProfileSchemeAssetPoolInterface>{
        name: assetTypeKey,
        asset_type: assetTypeKey,
        display: TitleCase( assetTypeKey ),
        data: assetPool[ assetTypeKey ],
        list: ToArray( assetPool[ assetTypeKey ] )
      };
    } );

    this.ui.assetPool = IsArrayThrowError( assetPool, true, `${this.name}:configureDom: - pools` ) ? assetPool : [];
  }


  /**
   * Cear the search input and reset the asset pool list
   */
  onUiSearchValueClear(){
    this.dom.session.searchValue = '';
    this.onApplyUiSearch( this.dom.session.searchValue );
  }


  /**
   * Apply the search value the user entered to the asset pool list
   * @param searchValue
   * @param col
   */
  onApplyUiSearch( searchValue: string, col = '' ){
    if( this.dom.delay.search ) clearTimeout( this.dom.delay.search );
    this.dom.delay.search = setTimeout( () => {
      if( searchValue.length ){
        this.ui.assetPool.map( ( pool ) => {
          if( IsObject( this.dom.state[ pool.name ] ) ){
            pool.list.map( ( item ) => {
              this.dom.state[ pool.name ].visible[ item.id ] = ObjectContainsTagSearch( {
                id: item.id,
                name: item.name,
              }, searchValue ) === true;
            } );
          }
        } );
        setTimeout( () => {
          this.dom.state.searching = true;
        } );

      }else{
        this.ui.assetPool.map( ( pool ) => {

          if( IsObject( this.dom.state[ pool.name ] ) ){
            pool.list.map( ( item ) => {
              this.dom.state[ pool.name ].visible[ item.id ] = 1;
            } );
          }
        } );
        this.dom.state.searching = false;
      }
    }, 200 );
  }


  /**
   * The user can expand an asset pool type to be open or closed
   * @param pool
   */
  onTogglePoolExpansion( pool ){
    if( pool && pool.name in this.dom.state ){
      this.dom.state[ pool.name ].expanded = !this.dom.state[ pool.name ].expanded;
    }
  }


  /**
   * This is triggered when a user selects a checkbox indicating that it will be assigned to a position of the layout
   * @param asset_type
   * @param itemId
   * @param value
   */
  onAssetPoolItemAttaching( asset_type: string, itemId: number, value: boolean ){
    this.srv.scheme.onAssetAttaching( asset_type, itemId, value );
    this.onEnableUiAssignButtons();
  }


  /**
   * This is triggered when a user selects a position button indicating they want the selected asset pool items moved to a position of the layout
   * @param section
   * @param $event
   */
  onSectionAttachingItems( section: EntitySchemeSectionInterface, $event ){
    this.onDisableUiAssignButtons();
    section.modified = true;
    this.srv.tab.showAsLoading( true );
    this.srv.scheme.onAttachingAssetsToPosition( section ).then( ( children: EntitySchemeSectionConfig[] ) => {
      if( IsArray( children, true ) ){
        section.children = children;
        this.srv.scheme.onUpdate( [ section ] ).then( () => {
          // console.log( 'done with add ', section );
          this.srv.tab.showAsLoading( false );
          this.onDisableUiAssignButtons();
        } );
      }else{
        // console.log( 'update section failed', section );
        this.srv.tab.showAsLoading( false );
        this.onDisableUiAssignButtons();
      }
    } );
  }


  /**
   * This is triggered every time the user selects a checkbox of an asset pool item
   * This should determine which positions of the layout are eligible base on the set of the items selected
   * Asset Pool items should be designated as compact or not, the last position of the layout is reserved for larger modules and compact items should not go in it
   */
  onEnableUiAssignButtons(){
    if( !this.ui.section_keys ){
      this.ui.section_keys = this.ui.sections.map( ( s, i ) => s.position );
    }
    if( this.dom.delay.configure_buttons ) clearTimeout( this.dom.delay.configure_buttons );
    this.dom.delay.configure_buttons = setTimeout( () => {
      const items = this.srv.scheme._getAssetsToAttach();
      let notCompact;
      const assetTypes = Object.keys( items );
      assetTypes.some( ( assetType: string ) => {
        notCompact = Object.keys( items[ assetType ] ).filter( ( assetID ) => {
          if( assetType === 'component' ){
            return !items[ assetType ][ assetID ].compact;
          }
          return false;
        } ).length;
        if( notCompact ) return true;
      } );
      const positionKeys = this.ui.section_keys.slice();
      if( notCompact ){
        let lastPositionKey;
        if( positionKeys.length ){
          lastPositionKey = positionKeys.pop();
        }
        positionKeys.map( ( positionKey ) => {
          this.ui.assignBtnConfigs[ positionKey ].disabled = true;
        } );
        if( lastPositionKey ) this.ui.assignBtnConfigs[ lastPositionKey ].disabled = false;
      }else{
        positionKeys.map( ( positionKey ) => {
          this.ui.assignBtnConfigs[ positionKey ].disabled = false;
          this.ui.assignBtnConfigs[ positionKey ].color = 'accent';
        } );
      }
    }, 100 );
  }


  /**
   * This will disable or clear the position assign buttons
   */
  onDisableUiAssignButtons(){
    this.core.entity.children.map( ( section ) => {
      if( section.position ){
        this.ui.assignBtnConfigs[ section.position ].disabled = true;
        this.ui.assignBtnConfigs[ section.position ].color = 'default';
      }
    } );
  }


  onAssetLink( type: string, id: number ){
    if( type === 'field' ){
      this.srv.router.navigateByUrl( `/cis/fields/${id}` ).catch( ( e ) => {
        console.log( 'e', e );
      } );
    }
  }


  /**
   * A user can click on an item in the asset pool to view a modal of that specific entityId item
   * @param internal_namea
   * @param id
   */
  onViewEntityPortal( internal_name: string, id: number ){
    if( internal_name === 'field' ){
      this.core.channel.emit( { source: this.name, target: 'PopEntityTabColumnComponent', type: 'component', name: 'scrollTo' } );
      PopPortal.view( internal_name, id ).then( () => {
        this.srv.scheme.ui.refresh.next( 'reload' );
      } );
    }
  }


  /**
   * Clean up the dom of this component
   */
  ngOnDestroy(){
    super.ngOnDestroy();
  }
}
