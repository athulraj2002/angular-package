import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'toYesNo', pure: true})
export class ToYesNoPipe implements PipeTransform {
  transform(value) {
    return value ? 'Yes' : 'No';
  }
}
