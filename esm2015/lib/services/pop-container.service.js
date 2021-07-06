import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
// https://medium.com/angular-in-depth/here-is-how-to-get-viewcontainerref-before-viewchild-query-is-evaluated-f649e51315fb
export class PopContainerService {
    constructor() {
        this.createListeners = [];
        this.destroyListeners = [];
        this.onContainerCreated = (fn) => {
            this.createListeners.push(fn);
        };
        this.onContainerDestroyed = (fn) => {
            this.destroyListeners.push(fn);
        };
        this.registerContainer = (container) => {
            this.createListeners.forEach((fn) => {
                fn(container);
            });
        };
        this.destroyContainer = (container) => {
            this.destroyListeners.forEach((fn) => {
                fn(container);
            });
        };
    }
}
PopContainerService.ɵprov = i0.ɵɵdefineInjectable({ factory: function PopContainerService_Factory() { return new PopContainerService(); }, token: PopContainerService, providedIn: "root" });
PopContainerService.decorators = [
    { type: Injectable, args: [{
                providedIn: 'root'
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLWNvbnRhaW5lci5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvcG9wLWNvbW1vbi9zcmMvbGliL3NlcnZpY2VzL3BvcC1jb250YWluZXIuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFvQixNQUFNLGVBQWUsQ0FBQzs7QUFHN0QsMkhBQTJIO0FBSzNILE1BQU0sT0FBTyxtQkFBbUI7SUFIaEM7UUFJRSxvQkFBZSxHQUFVLEVBQUUsQ0FBQztRQUM1QixxQkFBZ0IsR0FBVSxFQUFFLENBQUM7UUFFN0IsdUJBQWtCLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRTtZQUMxQixJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNoQyxDQUFDLENBQUE7UUFFRCx5QkFBb0IsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFO1lBQzVCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDakMsQ0FBQyxDQUFBO1FBRUQsc0JBQWlCLEdBQUcsQ0FBQyxTQUEyQixFQUFFLEVBQUU7WUFDbEQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRTtnQkFDbEMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ2hCLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDO1FBRUYscUJBQWdCLEdBQUcsQ0FBQyxTQUEyQixFQUFFLEVBQUU7WUFDakQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFO2dCQUNuQyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDaEIsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUE7S0FDRjs7OztZQTFCQSxVQUFVLFNBQUM7Z0JBQ1YsVUFBVSxFQUFFLE1BQU07YUFDbkIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlLCBWaWV3Q29udGFpbmVyUmVmIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cblxuLy8gaHR0cHM6Ly9tZWRpdW0uY29tL2FuZ3VsYXItaW4tZGVwdGgvaGVyZS1pcy1ob3ctdG8tZ2V0LXZpZXdjb250YWluZXJyZWYtYmVmb3JlLXZpZXdjaGlsZC1xdWVyeS1pcy1ldmFsdWF0ZWQtZjY0OWU1MTMxNWZiXG5cbkBJbmplY3RhYmxlKHtcbiAgcHJvdmlkZWRJbjogJ3Jvb3QnXG59KVxuZXhwb3J0IGNsYXNzIFBvcENvbnRhaW5lclNlcnZpY2Uge1xuICBjcmVhdGVMaXN0ZW5lcnM6IGFueVtdID0gW107XG4gIGRlc3Ryb3lMaXN0ZW5lcnM6IGFueVtdID0gW107XG5cbiAgb25Db250YWluZXJDcmVhdGVkID0gKGZuKSA9PiB7XG4gICAgdGhpcy5jcmVhdGVMaXN0ZW5lcnMucHVzaChmbik7XG4gIH1cblxuICBvbkNvbnRhaW5lckRlc3Ryb3llZCA9IChmbikgPT4ge1xuICAgIHRoaXMuZGVzdHJveUxpc3RlbmVycy5wdXNoKGZuKTtcbiAgfVxuXG4gIHJlZ2lzdGVyQ29udGFpbmVyID0gKGNvbnRhaW5lcjogVmlld0NvbnRhaW5lclJlZikgPT4ge1xuICAgIHRoaXMuY3JlYXRlTGlzdGVuZXJzLmZvckVhY2goKGZuKSA9PiB7XG4gICAgICBmbihjb250YWluZXIpO1xuICAgIH0pO1xuICB9O1xuXG4gIGRlc3Ryb3lDb250YWluZXIgPSAoY29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmKSA9PiB7XG4gICAgdGhpcy5kZXN0cm95TGlzdGVuZXJzLmZvckVhY2goKGZuKSA9PiB7XG4gICAgICBmbihjb250YWluZXIpO1xuICAgIH0pO1xuICB9XG59XG4iXX0=