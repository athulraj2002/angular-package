import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TableConfig } from '../../pop-table/pop-table.model';


@Component( {
  selector: 'lib-pop-table-dialog',
  templateUrl: './pop-table-dialog.component.html',
  styleUrls: [ './pop-table-dialog.component.scss' ]
} )
export class PopTableDialogComponent implements OnInit {

  public ui = {
    table: <TableConfig>undefined,
  };


  constructor(
    public dialog: MatDialogRef<PopTableDialogComponent>,
    @Inject( MAT_DIALOG_DATA ) public data
  ){
    this._buildTable();
  }


  ngOnInit(): void{
  }


  private _buildTable(){
    const tableData = this.data.data
    this.data.table.data = tableData
    this.ui.table = this.data.table;
  }


  onClose(){
    this.dialog.close( null );
  }
}
