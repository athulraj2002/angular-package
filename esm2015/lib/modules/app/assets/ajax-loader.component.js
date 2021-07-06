import { Component } from '@angular/core';
import { RandomArrayElement } from '../../../pop-common-utility';
export class PopTemplateAjaxLoaderComponent {
    constructor() {
        const greetings = [
            `Just a sec ...`,
            `Git \'Er Done`,
            `This may take a while ...`,
            `No Problemo`,
        ];
        this.expression = RandomArrayElement(greetings);
    }
}
PopTemplateAjaxLoaderComponent.decorators = [
    { type: Component, args: [{
                template: `
    <div class="pop-template-ajax-loader">
      <div class="pop-template-ajax-row">
        <h5>{{expression}}</h5>
      </div>
      <div class="pop-template-ajax-row">
        <lib-main-spinner
          [options]="{strokeWidth:10, color:'primary', diameter:40}">
        </lib-main-spinner>
      </div>
    </div>
  `,
                styles: [`
    .pop-template-ajax-loader {
      display: flex;
      flex-direction: column;
      width: 100%;
      min-height: 30px;
      justify-content: center;
      align-items: center;
    }

    .pop-template-ajax-row {
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
PopTemplateAjaxLoaderComponent.ctorParameters = () => [];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWpheC1sb2FkZXIuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvYXBwL2Fzc2V0cy9hamF4LWxvYWRlci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMxQyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQW9DakUsTUFBTSxPQUFPLDhCQUE4QjtJQUl6QztRQUNFLE1BQU0sU0FBUyxHQUFHO1lBQ2hCLGdCQUFnQjtZQUNoQixlQUFlO1lBQ2YsMkJBQTJCO1lBQzNCLGFBQWE7U0FDZCxDQUFDO1FBQ0YsSUFBSSxDQUFDLFVBQVUsR0FBRyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUVsRCxDQUFDOzs7WUE5Q0YsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRTs7Ozs7Ozs7Ozs7R0FXVDt5QkFDUzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBa0JUO2FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFJhbmRvbUFycmF5RWxlbWVudCB9IGZyb20gJy4uLy4uLy4uL3BvcC1jb21tb24tdXRpbGl0eSc7XG5cblxuQENvbXBvbmVudCh7XG4gIHRlbXBsYXRlOiBgXG4gICAgPGRpdiBjbGFzcz1cInBvcC10ZW1wbGF0ZS1hamF4LWxvYWRlclwiPlxuICAgICAgPGRpdiBjbGFzcz1cInBvcC10ZW1wbGF0ZS1hamF4LXJvd1wiPlxuICAgICAgICA8aDU+e3tleHByZXNzaW9ufX08L2g1PlxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwicG9wLXRlbXBsYXRlLWFqYXgtcm93XCI+XG4gICAgICAgIDxsaWItbWFpbi1zcGlubmVyXG4gICAgICAgICAgW29wdGlvbnNdPVwie3N0cm9rZVdpZHRoOjEwLCBjb2xvcjoncHJpbWFyeScsIGRpYW1ldGVyOjQwfVwiPlxuICAgICAgICA8L2xpYi1tYWluLXNwaW5uZXI+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgYCxcbiAgc3R5bGVzOiBbIGBcbiAgICAucG9wLXRlbXBsYXRlLWFqYXgtbG9hZGVyIHtcbiAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgICAgd2lkdGg6IDEwMCU7XG4gICAgICBtaW4taGVpZ2h0OiAzMHB4O1xuICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIH1cblxuICAgIC5wb3AtdGVtcGxhdGUtYWpheC1yb3cge1xuICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgbWluLWhlaWdodDogMzBweDtcbiAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgIGNsZWFyOiBib3RoO1xuICAgIH1cbiAgYCBdXG59KVxuZXhwb3J0IGNsYXNzIFBvcFRlbXBsYXRlQWpheExvYWRlckNvbXBvbmVudCB7XG4gIGV4cHJlc3Npb247XG5cblxuICBjb25zdHJ1Y3Rvcigpe1xuICAgIGNvbnN0IGdyZWV0aW5ncyA9IFtcbiAgICAgIGBKdXN0IGEgc2VjIC4uLmAsXG4gICAgICBgR2l0IFxcJ0VyIERvbmVgLFxuICAgICAgYFRoaXMgbWF5IHRha2UgYSB3aGlsZSAuLi5gLFxuICAgICAgYE5vIFByb2JsZW1vYCxcbiAgICBdO1xuICAgIHRoaXMuZXhwcmVzc2lvbiA9IFJhbmRvbUFycmF5RWxlbWVudChncmVldGluZ3MpO1xuXG4gIH1cblxufVxuIl19