import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'label', pure: true })
export class LabelPipe implements PipeTransform {

  aliases = [];


  /**
   * Provides the actual name we want displayed to the user.
   * text - The field name coming from the DB.
   * displayInfo - Either a string or object. If object then will look for property display or label. Takes aliases into account. IE: account:ID
   * set - If passed will look in the displayInfo object for this field before falling back to the display or label field.
   * returns {string}
   */
  transform(text: string, displayInfo: any = '', displayField: string = ''){
    let displayString = '';

    if( displayInfo && typeof displayInfo === 'string' ){
      displayString = displayInfo;
    }else if( displayInfo && displayField && displayInfo[ displayField ] ){
      displayString = displayInfo[ displayField ];
    }else if( displayInfo && displayInfo.display ){
      displayString = displayInfo.display;
    }else if( displayInfo && displayInfo.label ){
      displayString = displayInfo.label;
    }

    // Check for aliases.
    if( displayString ){
      if( displayString.includes('alias:') ){
        const aliasArray = displayString.split(':');
        aliasArray.shift();
        const alias = this.getAlias(aliasArray.shift()).toLocaleLowerCase();
        displayString = alias.charAt(0).toUpperCase() + alias.slice(1) + ' ';
        let tempString = '';
        while( tempString = aliasArray.shift() ) displayString += ' ' + tempString;
      }
    }else{
      // Format the string base on the field name.
      const words = text.split('_');
      for( const word of words ){
        if( word === 'id' || word === 'fk' ){
          displayString += 'ID ';
        }else{
          displayString += word.charAt(0).toUpperCase() + word.slice(1) + ' ';
        }
      }
    }

    return displayString.trim();
  }


  public getAlias(entity){
    return ( this.aliases[ entity ] ? this.aliases[ entity ] : entity );
  }
}
