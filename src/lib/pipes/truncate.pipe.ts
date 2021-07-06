import { Pipe, PipeTransform } from '@angular/core';
import { IsString } from '../pop-common-utility';


@Pipe( {
  name: 'truncate'
} )

export class TruncatePipe implements PipeTransform {

  transform( value: string, args: string | number[] ): string{

    if( IsString( value, true ) ){
      const limit = args.length > 0 ? parseInt( args[ 0 ] + '', 10 ) : 20;
      const trail = args.length > 1 ? args[ 1 ] : '...';
      return String( value ).length > limit ? String(value).substring( 0, limit ) + trail : value;
    }
    return value;
  }
}
