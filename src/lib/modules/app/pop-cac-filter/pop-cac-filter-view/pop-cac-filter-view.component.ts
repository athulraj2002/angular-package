import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { PopExtendComponent } from '../../../../pop-extend.component';
import { Subject } from 'rxjs';
import { PopPipeService } from '../../../../services/pop-pipe.service';
import { Dictionary, PopBusiness, ServiceInjector } from '../../../../pop-common.model';
import { ArrayMapSetter, GetSessionSiteVar, IsArray, IsObject, JsonCopy, ObjectContainsTagSearch } from '../../../../pop-common-utility';
import { fadeInOut, slideInOut } from '../../../../pop-common-animations.model';
import { PopCacFilterBarService } from '../pop-cac-filter.service';
import { CacFilterBarConfig, CacFilterBarEntityConfig } from '../pop-cac-filter.model';


@Component({
  selector: 'lib-pop-cac-filter-view',
  templateUrl: './pop-cac-filter-view.component.html',
  styleUrls: [ './pop-cac-filter-view.component.scss' ],
  animations: [ slideInOut, fadeInOut ]
})
export class PopCacFilterViewComponent extends PopExtendComponent implements OnInit, OnDestroy {
  @Input() channel: Subject<CacFilterBarEntityConfig[]>; // this is the channel of that the parent sends down the configuration

  public name = 'PopCacFilterViewComponent';

  public ui = {
    config: <CacFilterBarConfig>undefined,
    entities: <CacFilterBarEntityConfig[]>undefined,// the configuration used to build the configs for the selects, subject emit's it every time the filters need to be updated,
    map: <Dictionary<any>>{}
  };

  protected asset = {

    filter: undefined // the current filter applied to all columns, this is the (finished product) that we want to be stored in the base service
  };

  protected srv: {
    filter: PopCacFilterBarService,
    pipe: PopPipeService,
  } = {
    filter: ServiceInjector.get(PopCacFilterBarService),
    pipe: ServiceInjector.get(PopPipeService),
  };


  constructor(
    public el: ElementRef,
  ){
    super();

    this.dom.configure = (): Promise<boolean> => {
      return new Promise((resolve) => {
        this.asset.filter = this.srv.filter.getFilter();
        this.ui.entities = this.srv.filter.getEntities();
        this.ui.map.entities = ArrayMapSetter(this.ui.entities, 'internal_name');

        this.ui.config = this.srv.filter.getConfig();
        this._setDefaultState();
        this._setEntityConfig();
        this.dom.setSubscriber(`data-reset`, this.srv.filter.event.data.subscribe((caller: string) => {
          this.dom.setTimeout(`data-reset`, () => {
            if( IsArray(this.ui.entities, true) ){
              const first = this.ui.entities[ 0 ];
              first.options.map((option) => {
                first.display[ option.id ] = true;
              });
              this._checkVisibleForAll(first);
              this._updateEntitySelectedText(first);
              this._onEntityFeedUpdate(first);
            }
            this.ui.entities.map((entity, index) => {
              entity.totalOptions = entity.options.length;
              entity.filter = Object.keys(entity.selected).filter((id) => entity.selected[ id ]);
              entity.totalSelected = entity.filter.length;
            });
            this.onUpdateOptionsDisplay(0);
          }, 0);
        }));
        this.dom.setTimeout('init', () => {
          this.events.emit({ source: this.name, type: 'filter', name: 'init', data: this.asset.filter });
        });
        return resolve(true);
      });
    };
  }


  /**
   * This component should have a specific purpose
   */
  ngOnInit(){
    super.ngOnInit();
  }


  /**
   * Trigger an entity column to apply search
   * @param entity
   */
  onApplySearch(entity: CacFilterBarEntityConfig){
    if( this.dom.state.searchDelay ) clearTimeout(this.dom.state.searchDelay);
    this.dom.setTimeout(`search-delay`, () => {
      entity.options.map((option) => {
        entity.hidden[ option.id ] = ObjectContainsTagSearch(option, entity.search) ? false : true;
      });
      this._onEntityFeedUpdate(entity);
      this._checkVisibleForAll(entity);
    }, 200);
  }


  /**
   * Checks/Unchecks all the options within an entity column
   * @param entity
   */
  onCheckAll(entity: CacFilterBarEntityConfig){
    if( IsObject(entity, true) && !entity.single ){
      entity.options.filter((option) => !entity.hidden[ option.id ]).map((option) => {
        entity.selected[ option.id ] = +entity.display[ option.id ] ? entity.checkAll : false;
      });
      entity.filter = Object.keys(entity.selected).filter((id) => entity.selected[ id ]);
      entity.totalSelected = entity.filter.length;
      entity.allSelected = entity.totalSelected === entity.totalAvailable;
      this._checkVisibleForAll(entity);
      this._updateEntitySelectedText(entity);
      this.onUpdateOptionsDisplay(this.ui.map.entities[ entity.internal_name ]);
      this.dom.state.filterNeedsApplied = true;
    }
  }


  /**
   * Handle when an option selection has changed
   * Detects progmatic changes
   * @param entity
   */
  onCheckboxChange(event, entity, id: number){
    event.preventDefault();
    entity.selected[ id ] = !entity.selected[ id ];
    this.dom.setTimeout(`update-${entity.internal_name}-column`, () => {
      entity.filter = Object.keys(entity.selected).filter((key) => entity.selected[ key ]);
      entity.totalSelected = entity.filter.length;
      entity.allSelected = entity.totalSelected === entity.totalAvailable;
      this._checkVisibleForAll(entity);
      this._updateEntitySelectedText(entity);
      this.onUpdateOptionsDisplay(this.ui.map.entities[ entity.internal_name ]);
      this.dom.state.filterNeedsApplied = true;
    }, 100);
  }


  /**
   * Handle when an option selection has changed
   * Detects manual changes
   * @param entity
   */
  onRadioChange(event, entity, id){
    event.preventDefault();
    if( entity.single ){
      entity.checkAll = false;

      entity.allSelected = false;
      entity.indeterminate = false;
      entity.filter = [ String(id) ];
      entity.totalSelected = entity.filter.length;
      entity.options.map((option) => {
        if( +option.id !== +id ){
          entity.selected[ option.id ] = false;
        }else{
          entity.selected[ option.id ] = true;
          entity.selectedText = option.name;
        }
      });
      this.onUpdateOptionsDisplay(this.ui.map.entities[ entity.internal_name ]);
      this.dom.state.filterNeedsApplied = true;
    }
  }


  /**
   * The menu bar has been opened or closed
   * @param entity
   */
  onToggleOpen(entity: string = null){

    this.dom.state.open = !this.dom.state.open;
    if( this.dom.state.open && entity ){
      setTimeout(() => {
        this.el.nativeElement.querySelector(`#${entity}-search-input`).focus();
      });
    }
    this.events.emit({ source: this.name, type: 'filter', name: 'state', model: 'open', data: this.dom.state.open });
  }


  /**
   * Event handler for the click of the reset button
   * @returns void
   */
  resetFilter(): void{
    this.asset.filter = {};
    this.ui.entities.map((entity, index) => {
      if( entity.single ){
        this._setSingleEntityConfig(entity, index);
      }else{
        this._setMultipleEntityConfig(entity, index);
      }
    });
    this.asset.filter = this._getCurrentFilter();
    this.dom.state.filterNeedsApplied = false;
    this.dom.state.currentFilterRelevant = false;

    this.events.emit({ source: this.name, type: 'filter', name: 'clear', data: this.asset.filter });
  }


  /**
   * Emits the apply filter event, called
   * when the apply filter button is clicked.
   * @returns void
   */
  applyFilter(): void{
    if( !this.ui.config.invalid ){
      this.asset.filter = this._getCurrentFilter();
      this.dom.state.currentFilterRelevant = this._isCurrentFilterRelevant();
      this.dom.state.filterNeedsApplied = false;
      this.events.emit({ source: this.name, type: 'filter', name: 'apply', data: this.asset.filter });
      // close on apply ?
      if( this.ui.config.display !== 'static' ){
        this.dom.state.open = false;
        this.events.emit({ source: this.name, type: 'filter', name: 'state', model: 'open', data: this.dom.state.open });
      }

    }
  }


  trackByFn(index, item){
    if( !item ) return null;
    return item.id;
  }


  ngOnDestroy(){
    super.ngOnDestroy();
  }


  /************************************************************************************************
   *                                                                                              *
   *                                      Under The Hood                                          *
   *                                    ( Private Method )                                        *
   *                                                                                              *
   ************************************************************************************************/


  /**
   * Determne if all the visible options are either all checked or unchecked
   * @param entity
   * @private
   */
  private _checkForIndeterminate(entity: CacFilterBarEntityConfig): void{
    const selectedVisible = entity.options.filter((option) => !entity.hidden[ option.id ] && entity.display[ option.id ] && entity.selected[ option.id ]).length;
    entity.indeterminate = selectedVisible && selectedVisible < entity.totalVisible ? true : false;
  }


  /**
   * Trigger the column list to update with filtered options
   * @param entity
   */
  private _onEntityFeedUpdate(entity: CacFilterBarEntityConfig){
    const list = entity.options.filter(option => entity.display[ option.id ] && !entity.hidden[ option.id ]);
    if( !entity.allSelected ){
      list.sort((a, b) => {
        if( entity.selected[ a.id ] && !entity.selected[ b.id ] ) return -1;
        if( !entity.selected[ a.id ] && entity.selected[ b.id ] ) return 1;
      });
    }

    entity.feed.next(list);
  }


  /**
   * Updates the select configurations based on the filter bar configurations
   * @returns void
   */
  private _setEntityConfig(): void{
    this.dom.state.loading = true;
    this.ui.entities.map((entity, index) => {

      if( entity.single ){
        this._setSingleEntityConfig(entity, index);
      }else{
        this._setMultipleEntityConfig(entity, index);
      }
      entity.totalAvailable = entity.options.length;
      entity.totalOptions = entity.options.length;
      entity.totalVisible = Object.keys(entity.display).filter((id) => entity.display[ id ] && !entity.hidden[ id ]).length;
    });
    this.dom.state.filterNeedsApplied = false;
    this.dom.state.currentFilterRelevant = this._isCurrentFilterRelevant();
    if( !this.dom.state.currentFilterRelevant ){
      this.srv.filter.clearFilters();
    }
  }


  /**
   * Configure a radio enity config
   * @param entity
   * @param index
   * @private
   */
  private _setSingleEntityConfig(entity: CacFilterBarEntityConfig, index: number){
    let first = <any>entity.options[ 0 ];
    entity.checkAll = false;
    entity.indeterminate = false;
    if( IsArray(this.asset.filter[ entity.internal_name ], true) ){
      const asset = this.srv.filter.getAsset(entity.internal_name, +this.asset.filter[ entity.internal_name ][ 0 ]);
      first = { id: this.asset.filter[ entity.internal_name ][ 0 ], name: IsObject(asset, [ 'name' ]) ? asset.name : 'Name' };
    }
    entity.filter = [ first.id ];
    entity.selectedText = first.name;
    entity.totalSelected = 1;

    entity.hidden = {};

    if( index === 0 ){
      entity.options.map((option) => {
        entity.display[ option.id ] = true;
        entity.hidden[ option.id ] = false;
        entity.selected[ option.id ] = false;
      });
      entity.selected[ first.id ] = true;
    }else{
      const prevIndex = +index - 1;
      const prevEntity = this.ui.entities[ prevIndex ];
      entity.options.map((option) => {
        entity.display[ option.id ] = prevEntity.selected[ option.id ];
        entity.hidden[ option.id ] = false;
        entity.selected[ option.id ] = false;
      });
      entity.selected[ first.id ] = true;
    }
    this._onEntityFeedUpdate(entity);
  }


  /**
   * Configure a multiple checkbox entity config
   * @param entity
   * @param index
   * @private
   */
  private _setMultipleEntityConfig(entity: CacFilterBarEntityConfig, index: number){


    const existingFilter = IsArray(this.asset.filter[ entity.internal_name ], true);
    entity.filter = existingFilter ? JsonCopy(this.asset.filter[ entity.internal_name ]) : [];
    // console.log('_setMultipleEntityConfig', entity.name, index, entity.filter.length);
    if( entity.filter.length ){
      entity.checkAll = false;
      entity.indeterminate = true;
    }else{
      entity.checkAll = true;
      entity.indeterminate = false;
    }
    entity.totalSelected = entity.checkAll ? entity.options.length : entity.filter.length;
    if( index === 0 ){
      entity.options.map((option) => {
        entity.selected[ option.id ] = entity.checkAll ? true : entity.filter.includes(String(option.id));
        entity.display[ option.id ] = true;
        entity.hidden[ option.id ] = false;
      });
      entity.totalAvailable = entity.options.length;
      entity.totalSelected = existingFilter ? entity.filter.length : entity.options.length;
      entity.allSelected = entity.totalSelected === entity.totalAvailable;
      this._checkVisibleForAll(entity);
      this._updateEntitySelectedText(entity);
    }else{
      const prevIndex = +index - 1;
      const prevEntity = this.ui.entities[ prevIndex ];
      entity.options.map((option) => {
        entity.selected[ option.id ] = entity.checkAll ? true : prevEntity.filter.includes(String(option[prevEntity.child_link]));
        entity.display[ option.id ] = prevEntity.selected[ option[prevEntity.child_link]];
        entity.hidden[ option.id ] = false;
      });
      entity.totalAvailable = entity.options.length;
      entity.totalSelected = existingFilter ? entity.filter.length : entity.options.length;
      entity.allSelected = entity.totalSelected === entity.totalAvailable;
      this._checkVisibleForAll(entity);
      this._updateEntitySelectedText(entity);
    }
    this._onEntityFeedUpdate(entity);
  }


  /**
   * Cascade changes to all columns of the right of the column that made changes
   * @param entityName
   */
  onUpdateOptionsDisplay(changedIndex){
    this.dom.setTimeout(`options-update-${changedIndex}`, () => {
      let invalid = false;
      this.ui.entities.map((entity, index) => {

        const inView = this.ui.config.view.includes(entity.internal_name);
        if( !entity.totalSelected && inView ) invalid = true;
        if( index > changedIndex ){
          const prevIndex = +index - 1;
          const prevEntity = this.ui.entities[ prevIndex ];
          entity.options.map((option) => {
            entity.display[ option.id ] = prevEntity.allSelected ? true : prevEntity.filter.includes(String(option[prevEntity.child_link]));
            if( !entity.display[ option.id ] ){
              entity.selected[ option.id ] = false;
            }
          });
          this._onEntityFeedUpdate(entity);

          if(!(inView)){
            entity.options.filter((option) => !entity.hidden[ option.id ]).map((option) => {
              entity.selected[ option.id ] = +entity.display[ option.id ] ? true : false;
            });
          }

          entity.filter = Object.keys(entity.selected).filter((id) => entity.selected[ id ]);
          entity.totalSelected = entity.filter.length;
          if( !entity.totalSelected && this.ui.config.view.includes(entity.internal_name) ) invalid = true;
          this._checkVisibleForAll(entity);
          this._updateEntitySelectedText(entity);
        }
      });
      this.ui.config.invalid = invalid;
    }, 50);
  }


  private _setDefaultState(){
    if( this.ui.config.display === 'static' ) this.dom.state.open = true;
    this.dom.state = {
      ...this.dom.state,
      ...{
        differentEntities: false,
        searchDelay: undefined, // debounce for search inputs
        loading: false,
        open: false,
        loaded: false,
        currentFilterRelevant: false, // flags whether an any entityId filter is defined
        filterNeedsApplied: false, // flags when user needs to apply changes to the filter
      }
    };

    this.dom.state.open = IsObject(PopBusiness, [ 'id' ]) ? GetSessionSiteVar(`Business.${PopBusiness.id}.Filter.open`, false) : false;
  }


  /**
   * Update the text appears in the header of each entity column
   * @param entity
   */
  private _updateEntitySelectedText(entity: CacFilterBarEntityConfig){
    entity.totalText = `${entity.totalAvailable} ${entity.name} available.`;
    if( this.ui.map.entities[ entity.internal_name ] > 0 ){
      const index = this.ui.map.entities[ entity.internal_name ];
      let prevIndex = index - 1;
      while( prevIndex > 0 ){
        if( this.ui.entities[ prevIndex ].indeterminate ){
          break;
        }else{
          prevIndex--;
        }
      }

      if( entity.totalAvailable < entity.totalOptions ){
        entity.totalText += `  ${entity.totalOptions - entity.totalAvailable} filtered out by ${this.ui.entities[ prevIndex ].name}.`;
      }
    }
    entity.allSelected = entity.totalSelected === entity.totalAvailable;
    if( entity.allSelected || !entity.totalSelected ){
      entity.selectedText = entity.allSelected ? 'All' : 'None';
    }else{
      const selectedOptions = entity.options.filter((option) => {
        return entity.display[ option.id ] && entity.selected[ option.id ];
      }).map((option) => {
        return option.name;
      });
      entity.selectedText = selectedOptions.length > 4 ? selectedOptions.slice(0, 4).join(', ') + `, ... ${selectedOptions.length - 4} more` : selectedOptions.join(', ');
    }
  }


  /**
   * Determine if all the visible options in an entity column have been selected
   * @param entity
   */
  private _checkVisibleForAll(entity: CacFilterBarEntityConfig){
    if( IsObject(entity, true) && !entity.single ){
      let all = true;
      const visible = Object.keys(entity.display).filter((id) => entity.display[ id ] && !entity.hidden[ id ]);
      entity.totalVisible = visible.length;
      if( visible.length ){
        visible.some(id => {
          if( !entity.selected[ id ] ){
            all = false;
            return true;
          }
        });
      }else{
        all = false;
      }
      entity.checkAll = all;
      this._checkForIndeterminate(entity);

    }
  }


  /**
   * Create a payload for what the filter has generated
   */
  private _getCurrentFilter(){
    const currentFilter = {};
    this.ui.entities.map((entity) => {
      if( !entity.allSelected ){
        if( entity.filter.length ){
          currentFilter[ entity.internal_name ] = entity.filter.filter((id)=>+id>0);
          console.log(entity.internal_name , entity.filter);
          this._onEntityFeedUpdate(entity);
        }
      }
    });

    console.log('currentFilter', currentFilter);

    return currentFilter;
  }


  /**
   * Determine which entity columns are having a filtering effect
   */
  private _isCurrentFilterRelevant(){
    let relevant = false;
    Object.keys(this.asset.filter).some((internal_name: string) => {
      if( Array.isArray(this.asset.filter[ internal_name ]) && this.asset.filter[ internal_name ].length ){
        if( internal_name in this.ui.map.entities && this.ui.entities[ this.ui.map.entities[ internal_name ] ].totalAvailable ){
          if( this.asset.filter[ internal_name ].length < this.ui.entities[ this.ui.map.entities[ internal_name ] ].totalAvailable ){
            relevant = true;
            return true;
          }
        }
      }
    });
    return relevant;
  }
}
