import { Component, ElementRef, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { PopExtendComponent } from '../../../../pop-extend.component';
import { Entity, PopEntity } from '../../../../pop-common.model';
import { IsObject } from '../../../../pop-common-utility';


@Component({
  selector: 'lib-pop-entity-advanced-search',
  templateUrl: './pop-entity-advanced-search.component.html',
  styleUrls: [ './pop-entity-advanced-search.component.scss' ]
})
export class PopEntityAdvancedSearchComponent extends PopExtendComponent implements OnInit, OnDestroy {
  public name ='PopEntityAdvancedSearchComponent';
  @Input() internal_name: string;


  constructor(
    public el: ElementRef,
    private advancedSearchDialogRef: MatDialogRef<PopEntityAdvancedSearchComponent>,
    private route: ActivatedRoute,
    @Inject(MAT_DIALOG_DATA) public data,
  ){
    super();
    /**
     * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
     */
    this.dom.configure = (): Promise<boolean> => {
      return new Promise((resolve) => {
        this.internal_name = 'role';

        this.ui.fields = [];
        const searchFields = {};
        let needsMetadata = false;
        let model;
        if( !this.internal_name ) this.internal_name = PopEntity.getRouteInternalName(this.route);

        this.dom.setHeightWithParent(null, 145, 600).then((res) => true);

        PopEntity.getCoreConfig(this.internal_name).then((entityConfig: any) => {
          this.asset.entityId = entityConfig;
          if(IsObject(this.asset.entity.repo.model.field, true)){
            Object.keys(this.asset.entity.repo.model.field).map((column) => {
              if( column in this.asset.entity.repo.model.field[ column ][ 'itemMap' ] ){
                model = Object.assign({}, this.asset.entity.repo.model.field[ column ].items[ entityConfig.fields[ column ][ 'itemMap' ][ column ] ].model);
                delete model.api; // doAction fields don't patch
                delete model.metadata;
                delete model.transformation;
                searchFields[ column ] = model;
                if( model.options && model.options.metadata ){
                  needsMetadata = true;
                }
              }
            });
          }

          // if needsMetadata go grab it before you try to build out the fields
          if( needsMetadata ){
            this.asset.entity.repo.getUiResources(this.core).subscribe((metadata) => {
              if( !this.asset.entity.entity ) this.asset.entity.entityId = <Entity>{};
              this.asset.entity.entity.metadata = metadata;
              Object.keys(searchFields).map((field) => {
                // this.ui.fields.push(this.config.getCoreFieldItem(this.asset.entity, field, searchFields[ field ]));
              });
              this.ui.fields.sort(function(a, b){
                if( a.model.sort_top < b.model.sort_top ) return -1;
                if( a.model.sort_top > b.model.sort_top ) return 1;
                return 0;
              });
              console.log('fields', this.ui.fields);
            });
          }else{
            // no metadata was needed for any of these fields
            Object.keys(searchFields).map((field) => {
              // this.ui.fields.push(this.config.getCoreFieldItem(this.asset.entity, field, searchFields[ field ]));
            });
            this.ui.fields.sort(function(a, b){
              if( a.model.sort_top < b.model.sort_top ) return -1;
              if( a.model.sort_top > b.model.sort_top ) return 1;
              return 0;
            });
            console.log('fields', this.ui.fields);
          }
        });

        resolve(true);
      });
    };
  }


  /**
   * This component should have a specific purpose
   */
  ngOnInit(){
    super.ngOnInit();
  }


  onSearch(): void{
    this.advancedSearchDialogRef.close(this.data);
  }


  onCancel(): void{
    this.advancedSearchDialogRef.close(null);
  }


  /**
   * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
   */
  ngOnDestroy(){
    super.ngOnDestroy();
  }
}
