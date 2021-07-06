import { AbstractControl, ValidatorFn } from '@angular/forms';
import { IsString } from '../pop-common-utility';

// export class CustomValidators{

export function RegexPatterns( pattern ){
  switch( pattern ){
    case 'Alpha':
      return { tester: /^[ a-zA-Z\-\_]+/g, replacer: /[^ a-zA-Z\-\_]+/g };
    case 'AlphaNoSpace':
      return { tester: /^[a-zA-Z]+/g, replacer: /[^a-zA-Z\.\-\_]+/g };
    case 'AlphaNoSpaceOnlyDash':
      return { tester: /^[a-zA-Z]+/g, replacer: /[^a-zA-Z\-]+/g };
    case 'AlphaLowercaseNoSpace':
      return { tester: /^[a-z]+/g, replacer: /[^a-z\.\-\_]+/g };
    case 'AlphaNumeric':
      return { tester: /^[ a-zA-Z0-9\.\-\_]+/g, replacer: /[^ a-zA-Z0-9\.\-\_]+/g };
    case 'AlphaNumericNoUnderscore':
      return { tester: /^[ a-zA-Z0-9\.\-]+/g, replacer: /[^ a-zA-Z0-9\.\-]+/g };
    case 'AlphaNumericNoSpace':
      return { tester: /^[a-zA-Z0-9\.\-\_]+/g, replacer: /[^a-zA-Z0-9\.\-\_]+/g };
    case 'NumericNoSpace':
      return { tester: /^[0-9]+/g, replacer: /[^0-9]+/g };
    case 'NoSpace':
      return { tester: /[^ ]+/g, replacer: /[ ]+/g };
    case 'Default':
      return { tester: /^[a-zA-Z0-9\/\*\?\!\%\@\$\&\,\.\-\(\) ]+/g, replacer: /[^a-zA-Z0-9\/\*\?\!\%\@\$\&\,\.\-\(\) ]+/g };
    case 'NumericWithSpace':
      return { tester: /^[ 0-9]+/g, replacer: /[^ 0-9]+/g };
    case 'Numeric':
      return { tester: /^[0-9]+/g, replacer: /[^0-9]+/g };
    case 'Phone':
      return { tester: /@"^[\d-]+$"/, replacer: /[^\d-]+/g };
    case 'Email':
      return { tester: /^[^@]+@[a-zA-Z0-9._-]+\\.+[a-z._-]+$/, replacer: /[^@a-zA-Z0-9._-]+/g };
    case 'Password':
      return {
        tester: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/,
        replacer: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/
      };
    case 'Username':
      return {
        tester: /^\S[a-zA-Z0-9._\-]{2,}$/g,
        replacer: /[^a-zA-Z0-9._\-]+/g
      };

    case 'Url':
      return {
        tester: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        replacer: /[^\\:a-zA-Z0-9._\\-\\/\\?\\=\\#\\&]+/g
      };

    case 'Zip':
      return {
        tester: /^(\d{5}(-\d{4})?|[A-Z]\d[A-Z] *\d[A-Z]\d)$/,
        replacer: /[^[0-9][A-Z][A-Z]$]+/g
      };

    // case 'NumericSigned': return '^-?[^0-9]+[0-9]';
    // case 'float': return /[^.0-9]+/g;
    // case 'float': return /^(.(?!\d)|\D)+/;
    // case 'floatSigned': return '^-?[^0-9]+\.?[0-9]';
    default:
      return { tester: /^[a-zA-Z0-9\!\%\@\$\&\.\-\(\) ]+/g, replacer: /[^a-zA-Z0-9\!\%\@\$\&\.\-\(\) ]+/g }; // default
  }
}

export function PatternValidation( pattern: string, response: 'value' | 'message' | 'test', value?: string ){

  const regExPattern = RegexPatterns( pattern );

  if( response === 'test' ){

    return regExPattern.tester.test( value.trim() );

  }else if( response === 'value' ){
    if( typeof value !== 'string' ) value = '';
    switch( pattern ){
      case 'Alpha':
        return value.replace( regExPattern.replacer, '' );
      case 'AlphaNoSpace':
        return value.replace( regExPattern.replacer, '' );
      case 'AlphaNoSpaceOnlyDash':
        return value.replace( regExPattern.replacer, '' );
      case 'AlphaLowercaseNoSpace':
        return value.replace( regExPattern.replacer, '' );
      case 'AlphaNumeric':
        return value.replace( regExPattern.replacer, '' );
      case 'AlphaNumericNoUnderscore':
        return value.replace( regExPattern.replacer, '' );
      case 'AlphaNumericNoSpace':
        return value.replace( regExPattern.replacer, '' );
      case 'NoSpace':
        return value.replace( regExPattern.replacer, '' );
      case 'Numeric':
        return value.replace( regExPattern.replacer, '' );
      case 'NumericNoSpace':
        return value.replace( regExPattern.replacer, '' );
      case 'Phone':
        return value.replace( regExPattern.replacer, '' );
      case 'Email':
        return value.replace( regExPattern.replacer, '' );
      case 'Zip':
        return value.replace( regExPattern.replacer, '' );
      case 'Url':
        return value.replace( regExPattern.replacer, '' );
      default:
        return value.replace( regExPattern.replacer, '' );
    }

  }else{

    switch( pattern ){
      case 'Alpha':
        return 'Only letters are allowed.';
      case 'AlphaNoSpace':
        return 'Only letters are allowed.';
      case 'AlphaLowercaseNoSpace':
        return 'Only lowercase letters are allowed.';
      case 'AlphaNumeric':
        return 'Only letters and Numbers are allowed.';
      case 'AlphaNumericNoUnderscore':
        return 'Only letters and Numbers are allowed.';
      case 'AlphaNumericNoSpace':
        return 'Only letters and Numbers are allowed.';
      case 'Blacklist':
        return 'Not allowed';
      case 'NoSpace':
        return 'Spaces not allowed.';
      case 'Numeric':
        return 'Only numbers are allowed.';
      case 'NumericNoSpace':
        return 'Only numbers are allowed.';
      case 'Phone':
        return 'Invalid Phone.';
      case 'Email':
        return 'Invalid Email.';
      case 'Password':
        return 'Must contain a number, letter, special and be > 8 characters.';
      case 'Username':
        return 'Must contain only A-Z 0-9 . - _';
      case 'Url':
        return 'Must be a valid url.';
      default:
        return 'Invalid characters.';
    }
  }
}

export function ValidateBlacklist( blacklist: string[] ): ValidatorFn{
  return ( control: AbstractControl ): { alpha: { message: string | boolean } } | null => {
    let forbidden = false;
    for( const s of blacklist ){
      if( s === control.value ){
        forbidden = true;
      }
    }
    return forbidden ? { alpha: { message: PatternValidation( 'Blacklist', 'message' ) } } : null;
  };
}

export function ValidateAlpha( control: AbstractControl ){
  const pattern = RegexPatterns( 'Alpha' );
  if( !pattern.tester.test( control.value.trim() ) ) return { alpha: { message: PatternValidation( 'Alpha', 'message' ) } };
  return null;
}

export function ValidateAlphaNoSpace( control: AbstractControl ){
  const pattern = RegexPatterns( 'AlphaNoSpace' );
  if( !pattern.tester.test( control.value.trim() ) ) return { alpha: { message: PatternValidation( 'AlphaNoSpace', 'message' ) } };
  return null;
}

export function ValidateAlphaLowercaseNoSpace( control: AbstractControl ){
  const pattern = RegexPatterns( 'AlphaLowercaseNoSpace' );
  if( !pattern.tester.test( control.value.trim() ) ) return { alpha: { message: PatternValidation( 'AlphaLowercaseNoSpace', 'message' ) } };
  return null;
}

export function ValidateAlphaNumeric( control: AbstractControl ){
  const pattern = RegexPatterns( 'AlphaNumeric' );
  if( !pattern.tester.test( control.value.trim() ) ) return { alpha: { message: PatternValidation( 'AlphaNumeric', 'message' ) } };
  return null;
}

export function ValidateAlphaNumericNoUnderscore( control: AbstractControl ){
  const pattern = RegexPatterns( 'AlphaNumericNoUnderscore' );
  if( !pattern.tester.test( control.value.trim() ) ) return { alpha: { message: PatternValidation( 'AlphaNumericNoUnderscore', 'message' ) } };
  return null;
}

export function ValidateAlphaNumericNoSpace( control: AbstractControl ){
  const pattern = RegexPatterns( 'AlphaNumericNoSpace' );
  if( !pattern.tester.test( control.value.trim() ) ) return { alpha: { message: PatternValidation( 'AlphaNumericNoSpace', 'message' ) } };
  return null;
}

export function ValidateNumeric( control: AbstractControl ){
  const pattern = RegexPatterns( 'Numeric' );
  if( !pattern.tester.test( control.value.trim() ) ) return { numeric: { message: PatternValidation( 'Numeric', 'message' ) } };
  return null;
}

export function ValidateNumericNoSpace( control: AbstractControl ){
  const pattern = RegexPatterns( 'NumericNoSpace' );
  if( !pattern.tester.test( control.value ) ) return { numeric: { message: PatternValidation( 'NumericNoSpace', 'message' ) } };
  return null;
}

export function ValidateUsername( control: AbstractControl ){
  const pattern = RegexPatterns( 'Username' );
  if( !pattern.tester.test( control.value ) ) return { username: { message: PatternValidation( 'Username', 'message' ) } };
  return null;
}

export function ValidateEmail( control: AbstractControl ){
  const pattern = RegexPatterns( 'Email' );
  if( !pattern.tester.test( control.value ) ) return { email: { message: PatternValidation( 'Email', 'message' ) } };
  return null;
}


export function ValidatePassword( control: AbstractControl ){
  const pattern = RegexPatterns( 'Password' );
  if( !pattern.tester.test( control.value ) ) return { password: { message: PatternValidation( 'Password', 'message' ) } };
  return null;
}

export function ValidatePhone( control: AbstractControl ){
  const pattern = RegexPatterns( 'Phone' );
  if( !pattern.tester.test( control.value ) ) return { phone: { message: PatternValidation( 'Phone', 'message' ) } };
  return null;
}


export function ValidateZip( control: AbstractControl ){
  const pattern = RegexPatterns( 'Zip' );
  if( !pattern.tester.test( control.value ) ) return { zip: { message: PatternValidation( 'Zip', 'message' ) } };
  return null;
}

export function ValidateUrl( control: AbstractControl ){
  const pattern = RegexPatterns( 'Url' );
  let value = control.value;
  if( IsString( value, true ) ) value = value.trim();
  if( !pattern.tester.test( value ) ) return { url: { message: PatternValidation( 'Url', 'message' ) } };
  return null;
}


export function MatchPassword( control: AbstractControl ){
  const password = control.get( 'password' ).value; // to get value in input tag
  const password_confirmation = control.get( 'password_confirmation' ).value; // to get value in input tag
  if( password !== password_confirmation ){
    control.get( 'password_confirmation' ).setErrors( { MatchPassword: true } );
    if( control.get( 'password_confirmation' ).value ){
      control.get( 'password_confirmation' ).markAsDirty();
    }
  }else{
    return true;
  }
}

export function MatchEmail( control: AbstractControl ){
  const email = control.get( 'email' ).value; // to get value in input tag
  const email_confirmation = control.get( 'email_confirmation' ).value; // to get value in input tag
  if( email !== email_confirmation ){
    control.get( 'email_confirmation' ).setErrors( { MatchEmail: true } );
    if( control.get( 'email_confirmation' ).value ){
      control.get( 'email_confirmation' ).markAsDirty();
    }
  }else{
    return true;
  }
}

export function ValidationErrorMessages( validationError: object ): string{
  let message = '';
  for( const validation in validationError ){
    if( !validationError.hasOwnProperty( validation ) ) continue;
    if( typeof validationError[ validation ].message === 'string' ){
      message += validationError[ validation ].message + ' ';
    }else{
      switch( validation ){
        case 'min':
          message += `Must be greater than or equal to ${validationError[ validation ].min}. `;
          break;
        case 'max':
          message += `Must be less than or equal to ${validationError[ validation ].max}. `;
          break;
        case 'required':
          message += 'Field is required.';
          break;
        case 'email':
          message += 'Invalid email. ';
          break;
        case 'unique':
          message += 'The current value is already in use.';
          break;
        case 'minlength':
          message += `To short, minimum ${validationError[ validation ].requiredLength} characters. `;
          break;
        case 'maxlength':
          message += `To long, maximum ${validationError[ validation ].requiredLength} characters. `;
          break;
        case 'pattern':
          message += 'Invalid characters. ';
          break;
        case 'MatchPassword':
          message = `This field must match the password.`;
          break;
        case 'MatchEmail':
          message = `This field must match the email.`;
          break;
        default:
          message += 'Invalid. ';
          break;
      }
    }
  }
  return message.trim();
}

// }
