import { animate, group, state, style, transition, trigger } from '@angular/animations';

export const slideInOut = trigger('slideInOut', [
  state('in', style({ height: '*', opacity: 0 })),
  transition(':leave', [
    style({ height: '*', opacity: 1 }),

    group([
      animate(300, style({ height: 0 })),
      animate('200ms ease-in-out', style({ 'opacity': '0' }))
    ])

  ]),
  transition(':enter', [
    style({ height: '0', opacity: 0 }),

    group([
      animate(300, style({ height: '*' })),
      animate('400ms ease-in-out', style({ 'opacity': '1' }))
    ])

  ])
]);


export const fadeInOut = trigger('fadeInOut', [

  // the "in" style determines the "resting" state of the element when it is visible.
  state('in', style({ opacity: 1 })),

  // fade in when created. this could also be written as transition('void => *')
  transition(':enter', [
    style({ opacity: 0 }),
    animate(600)
  ]),

  // fade out when destroyed. this could also be written as transition('void => *')
  transition(':leave',
    animate(600, style({ opacity: 0 })))
]);
