import { Component, Input } from '@angular/core';
import { IsObject } from '../../../pop-common-utility';
export class PopTemplateErrorComponent {
    constructor() {
        if (!IsObject(this.error))
            this.error = { message: 'Something went wrong!', code: 500 };
    }
}
PopTemplateErrorComponent.decorators = [
    { type: Component, args: [{
                template: `
    <div class="pop-template-error">
      <div class="pop-template-error-row">
        <h5>{{error.code}} - {{error.message}}</h5>
      </div>
    </div>
  `,
                styles: [`
    .pop-template-error {
      display: flex;
      flex-direction: column;
      width: 100%;
      min-height: 30px;
      justify-content: center;
      align-items: center;
      font-size: 1em;
      color: white;
      padding: 10px;
      background: red;
      box-sizing: border-box;
    }

    .pop-template-error-row {
      display: flex;
      width: 100%;
      min-height: 30px;
      justify-content: center;
      align-items: center;
      clear: both;
      word-wrap: break-word;
      box-sizing: border-box;
    }
  `]
            },] }
];
PopTemplateErrorComponent.ctorParameters = () => [];
PopTemplateErrorComponent.propDecorators = {
    error: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3IuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL21vZHVsZXMvYXBwL2Fzc2V0cy9lcnJvci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDakQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBc0N2RCxNQUFNLE9BQU8seUJBQXlCO0lBSXBDO1FBQ0UsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUM7SUFDM0YsQ0FBQzs7O1lBekNGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUU7Ozs7OztHQU1UO3lCQUNTOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBeUJUO2FBQ0Y7Ozs7b0JBRUUsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgSW5wdXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IElzT2JqZWN0IH0gZnJvbSAnLi4vLi4vLi4vcG9wLWNvbW1vbi11dGlsaXR5JztcblxuXG5AQ29tcG9uZW50KHtcbiAgdGVtcGxhdGU6IGBcbiAgICA8ZGl2IGNsYXNzPVwicG9wLXRlbXBsYXRlLWVycm9yXCI+XG4gICAgICA8ZGl2IGNsYXNzPVwicG9wLXRlbXBsYXRlLWVycm9yLXJvd1wiPlxuICAgICAgICA8aDU+e3tlcnJvci5jb2RlfX0gLSB7e2Vycm9yLm1lc3NhZ2V9fTwvaDU+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgYCxcbiAgc3R5bGVzOiBbIGBcbiAgICAucG9wLXRlbXBsYXRlLWVycm9yIHtcbiAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgICAgd2lkdGg6IDEwMCU7XG4gICAgICBtaW4taGVpZ2h0OiAzMHB4O1xuICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAgZm9udC1zaXplOiAxZW07XG4gICAgICBjb2xvcjogd2hpdGU7XG4gICAgICBwYWRkaW5nOiAxMHB4O1xuICAgICAgYmFja2dyb3VuZDogcmVkO1xuICAgICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICB9XG5cbiAgICAucG9wLXRlbXBsYXRlLWVycm9yLXJvdyB7XG4gICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgd2lkdGg6IDEwMCU7XG4gICAgICBtaW4taGVpZ2h0OiAzMHB4O1xuICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAgY2xlYXI6IGJvdGg7XG4gICAgICB3b3JkLXdyYXA6IGJyZWFrLXdvcmQ7XG4gICAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgIH1cbiAgYCBdXG59KVxuZXhwb3J0IGNsYXNzIFBvcFRlbXBsYXRlRXJyb3JDb21wb25lbnQge1xuICBASW5wdXQoKSBlcnJvcjogeyBjb2RlOiBudW1iZXIsIG1lc3NhZ2U6IHN0cmluZyB9O1xuXG5cbiAgY29uc3RydWN0b3IoKXtcbiAgICBpZiggIUlzT2JqZWN0KHRoaXMuZXJyb3IpICkgdGhpcy5lcnJvciA9IHsgbWVzc2FnZTogJ1NvbWV0aGluZyB3ZW50IHdyb25nIScsIGNvZGU6IDUwMCB9O1xuICB9XG59XG4iXX0=