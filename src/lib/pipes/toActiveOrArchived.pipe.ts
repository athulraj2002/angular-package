import { Pipe, PipeTransform } from '@angular/core';


@Pipe({ name: 'toActiveOrArchived', pure: true })
export class ToActiveOrArchivedPipe implements PipeTransform {
  /**
   * If value is true, then that would indicate that is archived
   * @param value
   */
  transform(value){
    if( value === 'true' || value === '1' ) value = true;
    if( value === 'false' || value === '0' ) value = false;
    return value && value !== null ? 'Archived' : 'Active';
  }
}
