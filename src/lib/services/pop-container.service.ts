import { Injectable, ViewContainerRef } from '@angular/core';


// https://medium.com/angular-in-depth/here-is-how-to-get-viewcontainerref-before-viewchild-query-is-evaluated-f649e51315fb

@Injectable({
  providedIn: 'root'
})
export class PopContainerService {
  createListeners: any[] = [];
  destroyListeners: any[] = [];

  onContainerCreated = (fn) => {
    this.createListeners.push(fn);
  }

  onContainerDestroyed = (fn) => {
    this.destroyListeners.push(fn);
  }

  registerContainer = (container: ViewContainerRef) => {
    this.createListeners.forEach((fn) => {
      fn(container);
    });
  };

  destroyContainer = (container: ViewContainerRef) => {
    this.destroyListeners.forEach((fn) => {
      fn(container);
    });
  }
}
