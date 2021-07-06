import { ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { TableConfig, TableInterface } from '../../base/pop-table/pop-table.model';
import { PopEntityService } from '../services/pop-entity.service';
import { PopExtendComponent } from '../../../pop-extend.component';
import { CoreConfig, PopBaseEventInterface, PopPipe, PopTemplate, ServiceInjector } from '../../../pop-common.model';
import { PopPipeService } from '../../../services/pop-pipe.service';
import { IsArray, StorageGetter } from '../../../pop-common-utility';
import { GetObjectTransformations } from '../pop-entity-utility';


@Component( {
  selector: 'lib-pop-entity-history',
  templateUrl: './pop-entity-history.component.html',
  styleUrls: [ './pop-entity-history.component.scss' ]
} )
export class PopEntityHistoryComponent extends PopExtendComponent implements OnInit, OnDestroy {
  @Input() config: TableConfig;


  public name = 'PopEntityHistoryComponent';


  constructor(
    public el: ElementRef,
    public cdr: ChangeDetectorRef,
  ){
    super();
    /**
     * This should transform and validate the data. The view should try to only use data that is stored on ui so that it is not dependent on the structure of data that comes from other sources. The ui should be the source of truth here.
     */
    this.dom.configure = (): Promise<boolean> => {
      return new Promise( async( resolve ) => {
        this.dom.setHeight( PopTemplate.getContentHeight(), 100 );
        await this.buildTable();
        this.dom.state.hasData = IsArray(StorageGetter(this.config, ['matData', 'data'], []), true);
        return resolve( true );
      } );
    };
  }


  /**
   * This component should have a specific purpose
   */
  ngOnInit(){
    super.ngOnInit();
  }


  buildTable(): Promise<boolean>{
    return new Promise( ( resolve ) => {
      this.dom.setSubscriber( 'history-api-call', this.core.repo.getHistory( +this.core.params.entityId ).subscribe(
        history => {
          // Build the config.
          // Prepare and load the data.
          history = this._prepareTableData( history, this.core.repo.model.field );
          const tableConfig: TableInterface = {
            height: this.dom.height.inner,
            search: true,
            columnDefinitions: {
              user: { visible: true, order: 1, internal_name: 'user', route: '/admin/users/:user_fk' },
              action: { visible: true, order: 2 },
              message: { visible: true, order: 3 },
              timestamp: { visible: true, order: 4 },
            },
            data: Array.isArray( history ) ? history : [],
          };
          this.config = new TableConfig( tableConfig );
          try{
            this.cdr.detectChanges();
          }catch( e ){
          }
          return resolve( true );

        },
        err => {
          this.dom.error = {
            code: ( err.error ? err.error.code : err.status ),
            message: ( err.error ? err.error.message : err.statusText )
          };
          try{
            this.cdr.detectChanges();
          }catch( e ){
          }
          return resolve( false );
        }
      ) );
    } );
  }


  eventHandler( event: PopBaseEventInterface ){
    if( event.type === 'table' ){
    }
  }


  /**
   * The dom destroy function manages all the clean up that is necessary if subscriptions, timeouts, etc are stored properly
   */
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
   * A method that preps entityId list data for tables
   * @param dataSet
   * @param fieldMap
   */
  private _prepareTableData( dataSet: Array<any>, fieldMap: {} = {}, entityConfig: CoreConfig = null ){
    // Determine which fields should be acted upon.
    const transformations = GetObjectTransformations( fieldMap );
    return IsArray( dataSet, true ) ? dataSet.map( row => PopPipe.transformObjectValues( { ...row }, transformations, entityConfig ) ) : dataSet;
  }
}
