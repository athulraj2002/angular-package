import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PopNavigationDialogDataInterface, PopNavigationDialogItemInterface } from '../pop-dialogs.model';
import { Router } from '@angular/router';


@Component({
  selector: 'lib-pop-navigation-dialog',
  templateUrl: './pop-navigation-dialog.component.html',
  styleUrls: [ './pop-navigation-dialog.component.scss' ]
})
export class PopNavigationDialogComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: PopNavigationDialogDataInterface,
    public dialog: MatDialogRef<PopNavigationDialogComponent>,
    private router: Router
  ){
  }


  ngOnInit(){
    if( !this.data.display ) this.data.display = 'Navigation List';
    if( !this.data.list || !Array.isArray(this.data.list) ) this.data.list = [];
    if( !this.data.basePath || !( typeof this.data.basePath === 'string' ) ) this.data.basePath = null;
  }


  navigate(item: PopNavigationDialogItemInterface){
    this.dialog.close();
    if( item.path ){
      this.router.navigateByUrl(item.path).catch(e => false);
    }else if( this.data.basePath && item.id ){
      this.router.navigateByUrl(`${this.data.basePath}/${item.id}/general`).catch(e => false);
    }
  }


  cancel(){
    this.dialog.close(null);
  }
}
