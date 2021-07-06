import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'characterIcon' , pure: true })
export class CharacterIconPipe implements PipeTransform {

  
  transform(name:string):string{
    let character_icon = "";
    const nameArray = name.split(" ");
    if( nameArray.length >= 2 ){
      character_icon += nameArray[ 0 ].charAt(0).toLocaleUpperCase();
      character_icon += nameArray[ 1 ].charAt(0).toLocaleUpperCase();
    }
    else{
        character_icon += name.charAt(0).toLocaleUpperCase();
        character_icon += name.charAt(1).toLocaleLowerCase();
    } 
    return(character_icon)
  }
}
