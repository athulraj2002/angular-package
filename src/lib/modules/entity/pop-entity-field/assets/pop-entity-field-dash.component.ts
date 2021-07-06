import { Component } from '@angular/core';


@Component({
  selector: 'lib-pop-entity-field-dash',
  template: `
    <div class="entity-field-dash">
      <mat-icon>
        remove
      </mat-icon>
    </div>
  `,
  styles: [ ':host ::ng-deep mat-icon {width: auto; height: auto; font-size: .9em;} .entityId-field-dash { display: flex;align-items: center; justify-content: center; box-sizing: border-box; height: 100%; }' ],
})
export class PopEntityFieldDashComponent {
}


