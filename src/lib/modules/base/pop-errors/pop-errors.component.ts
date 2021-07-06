import { AfterViewInit, Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ErrorComponent } from './error/error.component';

@Component({
  selector: 'lib-pop-errors',
  templateUrl: './pop-errors.component.html',
  styleUrls: ['./pop-errors.component.scss']
})
export class PopErrorsComponent implements AfterViewInit{

  @Input() error: { code:number, message:string };

  constructor(public dialog: MatDialog){}

  ngAfterViewInit(){
    setTimeout(()=>{
      this.loadErrorDialog();
    }, 500);
  }

  loadErrorDialog(){
    this.dialog.open(ErrorComponent, { data: { code: this.error.code, message: this.error.message } } );
  }
}
