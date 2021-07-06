import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
export class PopTemplateBufferComponent {
    constructor(data) {
        this.data = data;
        this.color = 'primary';
        this.mode = 'buffer';
        this.bufferValue = 100;
        this.value = 0;
    }
    ngOnInit() {
        this._meterProgress();
    }
    ngOnDestroy() {
        if (this.interval)
            clearInterval(this.interval);
    }
    _meterProgress() {
        this.interval = setInterval(() => {
            this.bufferValue -= 5;
            this.value += 5;
            if (this.value >= 100)
                clearInterval(this.interval);
        }, 175, 50);
    }
}
PopTemplateBufferComponent.decorators = [
    { type: Component, args: [{
                template: `
    <div class="pop-template-buffer">
      <div class="pop-template-ajax-row" *ngIf="data.expression">
        <h5>{{data.expression}}</h5>
      </div>
      <div class="pop-template-buffer-row">
        <mat-progress-bar
          [color]="color"
          [mode]="mode"
          [value]="value"
          [bufferValue]="bufferValue">
        </mat-progress-bar>
      </div>
    </div>
  `,
                styles: [`
    .pop-template-buffer {
      display: flex;
      flex-direction: column;
      width: 100%;
      min-height: 30px;
      justify-content: center;
      align-items: center;
      font-size: 1.5em;
      background: var(--background-code);
    }

    .pop-template-buffer-row {
      display: flex;
      width: 100%;
      min-height: 30px;
      justify-content: center;
      align-items: center;
      clear: both;
    }
  `]
            },] }
];
PopTemplateBufferComponent.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [MAT_SNACK_BAR_DATA,] }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVmZmVyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BvcC1jb21tb24vc3JjL2xpYi9tb2R1bGVzL2FwcC9hc3NldHMvYnVmZmVyLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBcUIsTUFBTSxlQUFlLENBQUM7QUFDckUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUF5Q2pFLE1BQU0sT0FBTywwQkFBMEI7SUFRckMsWUFBK0MsSUFBSTtRQUFKLFNBQUksR0FBSixJQUFJLENBQUE7UUFObkQsVUFBSyxHQUFHLFNBQVMsQ0FBQztRQUNsQixTQUFJLEdBQUcsUUFBUSxDQUFDO1FBQ2hCLGdCQUFXLEdBQUcsR0FBRyxDQUFDO1FBQ2xCLFVBQUssR0FBRyxDQUFDLENBQUM7SUFJVixDQUFDO0lBR0QsUUFBUTtRQUNOLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQUN4QixDQUFDO0lBR0QsV0FBVztRQUNULElBQUksSUFBSSxDQUFDLFFBQVE7WUFBRyxhQUFhLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ25ELENBQUM7SUFHTyxjQUFjO1FBQ3BCLElBQUksQ0FBQyxRQUFRLEdBQUcsV0FBVyxDQUFDLEdBQUcsRUFBRTtZQUMvQixJQUFJLENBQUMsV0FBVyxJQUFJLENBQUMsQ0FBQztZQUN0QixJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQztZQUNoQixJQUFJLElBQUksQ0FBQyxLQUFLLElBQUksR0FBRztnQkFBRyxhQUFhLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3ZELENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDZCxDQUFDOzs7WUFsRUYsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRTs7Ozs7Ozs7Ozs7Ozs7R0FjVDt5QkFDUzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FvQlQ7YUFDRjs7OzRDQVNjLE1BQU0sU0FBQyxrQkFBa0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEluamVjdCwgT25EZXN0cm95LCBPbkluaXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE1BVF9TTkFDS19CQVJfREFUQSB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL3NuYWNrLWJhcic7XG5cblxuQENvbXBvbmVudCh7XG4gIHRlbXBsYXRlOiBgXG4gICAgPGRpdiBjbGFzcz1cInBvcC10ZW1wbGF0ZS1idWZmZXJcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJwb3AtdGVtcGxhdGUtYWpheC1yb3dcIiAqbmdJZj1cImRhdGEuZXhwcmVzc2lvblwiPlxuICAgICAgICA8aDU+e3tkYXRhLmV4cHJlc3Npb259fTwvaDU+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJwb3AtdGVtcGxhdGUtYnVmZmVyLXJvd1wiPlxuICAgICAgICA8bWF0LXByb2dyZXNzLWJhclxuICAgICAgICAgIFtjb2xvcl09XCJjb2xvclwiXG4gICAgICAgICAgW21vZGVdPVwibW9kZVwiXG4gICAgICAgICAgW3ZhbHVlXT1cInZhbHVlXCJcbiAgICAgICAgICBbYnVmZmVyVmFsdWVdPVwiYnVmZmVyVmFsdWVcIj5cbiAgICAgICAgPC9tYXQtcHJvZ3Jlc3MtYmFyPlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIGAsXG4gIHN0eWxlczogWyBgXG4gICAgLnBvcC10ZW1wbGF0ZS1idWZmZXIge1xuICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gICAgICB3aWR0aDogMTAwJTtcbiAgICAgIG1pbi1oZWlnaHQ6IDMwcHg7XG4gICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICBmb250LXNpemU6IDEuNWVtO1xuICAgICAgYmFja2dyb3VuZDogdmFyKC0tYmFja2dyb3VuZC1jb2RlKTtcbiAgICB9XG5cbiAgICAucG9wLXRlbXBsYXRlLWJ1ZmZlci1yb3cge1xuICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgbWluLWhlaWdodDogMzBweDtcbiAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgIGNsZWFyOiBib3RoO1xuICAgIH1cbiAgYCBdXG59KVxuZXhwb3J0IGNsYXNzIFBvcFRlbXBsYXRlQnVmZmVyQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xuICBleHByZXNzaW9uO1xuICBjb2xvciA9ICdwcmltYXJ5JztcbiAgbW9kZSA9ICdidWZmZXInO1xuICBidWZmZXJWYWx1ZSA9IDEwMDtcbiAgdmFsdWUgPSAwO1xuICBpbnRlcnZhbDtcblxuICBjb25zdHJ1Y3RvcihASW5qZWN0KE1BVF9TTkFDS19CQVJfREFUQSkgcHVibGljIGRhdGEpe1xuICB9XG5cblxuICBuZ09uSW5pdCgpe1xuICAgIHRoaXMuX21ldGVyUHJvZ3Jlc3MoKTtcbiAgfVxuXG5cbiAgbmdPbkRlc3Ryb3koKXtcbiAgICBpZiggdGhpcy5pbnRlcnZhbCApIGNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcnZhbCk7XG4gIH1cblxuXG4gIHByaXZhdGUgX21ldGVyUHJvZ3Jlc3MoKXtcbiAgICB0aGlzLmludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgdGhpcy5idWZmZXJWYWx1ZSAtPSA1O1xuICAgICAgdGhpcy52YWx1ZSArPSA1O1xuICAgICAgaWYoIHRoaXMudmFsdWUgPj0gMTAwICkgY2xlYXJJbnRlcnZhbCh0aGlzLmludGVydmFsKTtcbiAgICB9LCAxNzUsIDUwKTtcbiAgfVxufVxuIl19