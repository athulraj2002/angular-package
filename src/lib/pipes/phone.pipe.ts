import { Pipe, PipeTransform } from '@angular/core';

@Pipe( {
  name: 'phone'
} )
export class PhonePipe implements PipeTransform {
  transform( val, args = null ){

    if( !args ) args = '(XXX) XXX-XXXX';

    if( typeof val === 'string' && String(val).length ){

      let viewVal = String( val ).trim();
      viewVal = viewVal.replace( /^\+/, '' );
      viewVal = viewVal.replace( /[^0-9]/g, '' );
      viewVal = viewVal.slice( 0, ( args.match( /X/g ) || [] ).length );

      let number = args;
      const digits = viewVal.split( '' );
      let index = 0;
      digits.forEach( function( digit ){
        index = number.indexOf( 'X' );
        if( index >= 0 ){
          number = number.substr( 0, index ) + digit + number.substr( index + 1 );
        }
      } );

      let limit = args.length;
      if( index != -1 ) limit = index + 1;
      return number.substr( 0, limit );
    }
    return val;
  }
}
