import { Injectable } from '@angular/core';
import { DestroyServiceDom, GetServiceDom, GetServiceAssetContainer, } from '../pop-common-dom.models';
import { PopUid } from '../pop-common-utility';
import * as i0 from "@angular/core";
export class PopExtendService {
    // public ui = <ServiceUiContainerInterface>GetServiceUiContainer();
    constructor() {
        this.dom = GetServiceDom();
        this.id = PopUid();
        if (!this.asset)
            this.asset = GetServiceAssetContainer();
        this.dom = Object.assign(Object.assign({}, this.dom), {
            setSubscriber: (subscriptionKey, subscription = null) => {
                if (subscriptionKey && this.dom.subscriber && subscriptionKey in this.dom.subscriber && this.dom.subscriber[subscriptionKey] && typeof this.dom.subscriber[subscriptionKey].unsubscribe === 'function') {
                    this.dom.subscriber[subscriptionKey].unsubscribe();
                }
                if (subscription) {
                    this.dom.subscriber[subscriptionKey] = subscription;
                }
            },
            setTimeout: (timeoutKey, callback = null, delay = 250) => {
                if (timeoutKey && this.dom.delay && timeoutKey in this.dom.delay && this.dom.delay[timeoutKey]) {
                    clearTimeout(this.dom.delay[timeoutKey]);
                }
                if (typeof callback === 'function') {
                    this.dom.delay[timeoutKey] = setTimeout(callback, delay);
                }
            },
        });
    }
    ngOnDestroy() {
        DestroyServiceDom(this.dom);
    }
}
PopExtendService.ɵprov = i0.ɵɵdefineInjectable({ factory: function PopExtendService_Factory() { return new PopExtendService(); }, token: PopExtendService, providedIn: "root" });
PopExtendService.decorators = [
    { type: Injectable, args: [{
                providedIn: 'root'
            },] }
];
PopExtendService.ctorParameters = () => [];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWV4dGVuZC5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL3NlcnZpY2VzL3BvcC1leHRlbmQuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFhLE1BQU0sZUFBZSxDQUFDO0FBRXRELE9BQU8sRUFDTCxpQkFBaUIsRUFFakIsYUFBYSxFQUNiLHdCQUF3QixHQUd6QixNQUFNLDBCQUEwQixDQUFDO0FBRWxDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQzs7QUFNL0MsTUFBTSxPQUFPLGdCQUFnQjtJQU8zQixvRUFBb0U7SUFHcEU7UUFUVSxRQUFHLEdBQUcsYUFBYSxFQUFFLENBQUM7UUFDdEIsT0FBRSxHQUFvQixNQUFNLEVBQUUsQ0FBQztRQVN2QyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUs7WUFBRyxJQUFJLENBQUMsS0FBSyxHQUFtQyx3QkFBd0IsRUFBRSxDQUFDO1FBQzFGLElBQUksQ0FBQyxHQUFHLG1DQUNILElBQUksQ0FBQyxHQUFHLEdBQUs7WUFDZCxhQUFhLEVBQUUsQ0FBQyxlQUF1QixFQUFFLGVBQTZCLElBQUksRUFBRSxFQUFFO2dCQUM1RSxJQUFJLGVBQWUsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSSxlQUFlLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUUsZUFBZSxDQUFFLElBQUksT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBRSxlQUFlLENBQUUsQ0FBQyxXQUFXLEtBQUssVUFBVSxFQUFFO29CQUMxTSxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBRSxlQUFlLENBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztpQkFDdEQ7Z0JBQ0QsSUFBSSxZQUFZLEVBQUU7b0JBQ2hCLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFFLGVBQWUsQ0FBRSxHQUFHLFlBQVksQ0FBQztpQkFDdkQ7WUFDSCxDQUFDO1lBRUQsVUFBVSxFQUFFLENBQUMsVUFBa0IsRUFBRSxRQUFRLEdBQUcsSUFBSSxFQUFFLEtBQUssR0FBRyxHQUFHLEVBQUUsRUFBRTtnQkFDL0QsSUFBSSxVQUFVLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLElBQUksVUFBVSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFFLFVBQVUsQ0FBRSxFQUFFO29CQUNoRyxZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUUsVUFBVSxDQUFFLENBQUMsQ0FBQztpQkFDNUM7Z0JBQ0QsSUFBSSxPQUFPLFFBQVEsS0FBSyxVQUFVLEVBQUU7b0JBQ2xDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFFLFVBQVUsQ0FBRSxHQUFHLFVBQVUsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7aUJBQzVEO1lBQ0gsQ0FBQztTQUNGLENBQ0YsQ0FBQztJQUNKLENBQUM7SUFHRCxXQUFXO1FBQ1QsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzlCLENBQUM7Ozs7WUF6Q0YsVUFBVSxTQUFDO2dCQUNWLFVBQVUsRUFBRSxNQUFNO2FBQ25CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSwgT25EZXN0cm95IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7XG4gIERlc3Ryb3lTZXJ2aWNlRG9tLFxuICBHZXRTZXJ2aWNlVWlDb250YWluZXIsXG4gIEdldFNlcnZpY2VEb20sXG4gIEdldFNlcnZpY2VBc3NldENvbnRhaW5lcixcbiAgU2VydmljZVVpQ29udGFpbmVySW50ZXJmYWNlLFxuICBTZXJ2aWNlQXNzZXRDb250YWluZXJJbnRlcmZhY2UsXG59IGZyb20gJy4uL3BvcC1jb21tb24tZG9tLm1vZGVscyc7XG5pbXBvcnQgeyBTdWJzY3JpcHRpb24gfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IFBvcFVpZCB9IGZyb20gJy4uL3BvcC1jb21tb24tdXRpbGl0eSc7XG5cblxuQEluamVjdGFibGUoe1xuICBwcm92aWRlZEluOiAncm9vdCdcbn0pXG5leHBvcnQgY2xhc3MgUG9wRXh0ZW5kU2VydmljZSBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gIHByb3RlY3RlZCBkb20gPSBHZXRTZXJ2aWNlRG9tKCk7XG4gIHByb3RlY3RlZCBpZDogbnVtYmVyIHwgc3RyaW5nID0gUG9wVWlkKCk7XG4gIHByb3RlY3RlZCBuYW1lO1xuICBwcm90ZWN0ZWQgYXNzZXQ7XG5cblxuICAvLyBwdWJsaWMgdWkgPSA8U2VydmljZVVpQ29udGFpbmVySW50ZXJmYWNlPkdldFNlcnZpY2VVaUNvbnRhaW5lcigpO1xuXG5cbiAgY29uc3RydWN0b3IoKXtcbiAgICBpZiggIXRoaXMuYXNzZXQgKSB0aGlzLmFzc2V0ID0gPFNlcnZpY2VBc3NldENvbnRhaW5lckludGVyZmFjZT5HZXRTZXJ2aWNlQXNzZXRDb250YWluZXIoKTtcbiAgICB0aGlzLmRvbSA9IHtcbiAgICAgIC4uLnRoaXMuZG9tLCAuLi57XG4gICAgICAgIHNldFN1YnNjcmliZXI6IChzdWJzY3JpcHRpb25LZXk6IHN0cmluZywgc3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb24gPSBudWxsKSA9PiB7XG4gICAgICAgICAgaWYoIHN1YnNjcmlwdGlvbktleSAmJiB0aGlzLmRvbS5zdWJzY3JpYmVyICYmIHN1YnNjcmlwdGlvbktleSBpbiB0aGlzLmRvbS5zdWJzY3JpYmVyICYmIHRoaXMuZG9tLnN1YnNjcmliZXJbIHN1YnNjcmlwdGlvbktleSBdICYmIHR5cGVvZiB0aGlzLmRvbS5zdWJzY3JpYmVyWyBzdWJzY3JpcHRpb25LZXkgXS51bnN1YnNjcmliZSA9PT0gJ2Z1bmN0aW9uJyApe1xuICAgICAgICAgICAgdGhpcy5kb20uc3Vic2NyaWJlclsgc3Vic2NyaXB0aW9uS2V5IF0udW5zdWJzY3JpYmUoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYoIHN1YnNjcmlwdGlvbiApe1xuICAgICAgICAgICAgdGhpcy5kb20uc3Vic2NyaWJlclsgc3Vic2NyaXB0aW9uS2V5IF0gPSBzdWJzY3JpcHRpb247XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHNldFRpbWVvdXQ6ICh0aW1lb3V0S2V5OiBzdHJpbmcsIGNhbGxiYWNrID0gbnVsbCwgZGVsYXkgPSAyNTApID0+IHtcbiAgICAgICAgICBpZiggdGltZW91dEtleSAmJiB0aGlzLmRvbS5kZWxheSAmJiB0aW1lb3V0S2V5IGluIHRoaXMuZG9tLmRlbGF5ICYmIHRoaXMuZG9tLmRlbGF5WyB0aW1lb3V0S2V5IF0gKXtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLmRvbS5kZWxheVsgdGltZW91dEtleSBdKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYoIHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJyApe1xuICAgICAgICAgICAgdGhpcy5kb20uZGVsYXlbIHRpbWVvdXRLZXkgXSA9IHNldFRpbWVvdXQoY2FsbGJhY2ssIGRlbGF5KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG5cbiAgbmdPbkRlc3Ryb3koKXtcbiAgICBEZXN0cm95U2VydmljZURvbSh0aGlzLmRvbSk7XG4gIH1cbn1cbiJdfQ==