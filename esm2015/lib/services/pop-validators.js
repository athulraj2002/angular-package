import { IsString } from '../pop-common-utility';
// export class CustomValidators{
export function RegexPatterns(pattern) {
    switch (pattern) {
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
export function PatternValidation(pattern, response, value) {
    const regExPattern = RegexPatterns(pattern);
    if (response === 'test') {
        return regExPattern.tester.test(value.trim());
    }
    else if (response === 'value') {
        if (typeof value !== 'string')
            value = '';
        switch (pattern) {
            case 'Alpha':
                return value.replace(regExPattern.replacer, '');
            case 'AlphaNoSpace':
                return value.replace(regExPattern.replacer, '');
            case 'AlphaNoSpaceOnlyDash':
                return value.replace(regExPattern.replacer, '');
            case 'AlphaLowercaseNoSpace':
                return value.replace(regExPattern.replacer, '');
            case 'AlphaNumeric':
                return value.replace(regExPattern.replacer, '');
            case 'AlphaNumericNoUnderscore':
                return value.replace(regExPattern.replacer, '');
            case 'AlphaNumericNoSpace':
                return value.replace(regExPattern.replacer, '');
            case 'NoSpace':
                return value.replace(regExPattern.replacer, '');
            case 'Numeric':
                return value.replace(regExPattern.replacer, '');
            case 'NumericNoSpace':
                return value.replace(regExPattern.replacer, '');
            case 'Phone':
                return value.replace(regExPattern.replacer, '');
            case 'Email':
                return value.replace(regExPattern.replacer, '');
            case 'Zip':
                return value.replace(regExPattern.replacer, '');
            case 'Url':
                return value.replace(regExPattern.replacer, '');
            default:
                return value.replace(regExPattern.replacer, '');
        }
    }
    else {
        switch (pattern) {
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
export function ValidateBlacklist(blacklist) {
    return (control) => {
        let forbidden = false;
        for (const s of blacklist) {
            if (s === control.value) {
                forbidden = true;
            }
        }
        return forbidden ? { alpha: { message: PatternValidation('Blacklist', 'message') } } : null;
    };
}
export function ValidateAlpha(control) {
    const pattern = RegexPatterns('Alpha');
    if (!pattern.tester.test(control.value.trim()))
        return { alpha: { message: PatternValidation('Alpha', 'message') } };
    return null;
}
export function ValidateAlphaNoSpace(control) {
    const pattern = RegexPatterns('AlphaNoSpace');
    if (!pattern.tester.test(control.value.trim()))
        return { alpha: { message: PatternValidation('AlphaNoSpace', 'message') } };
    return null;
}
export function ValidateAlphaLowercaseNoSpace(control) {
    const pattern = RegexPatterns('AlphaLowercaseNoSpace');
    if (!pattern.tester.test(control.value.trim()))
        return { alpha: { message: PatternValidation('AlphaLowercaseNoSpace', 'message') } };
    return null;
}
export function ValidateAlphaNumeric(control) {
    const pattern = RegexPatterns('AlphaNumeric');
    if (!pattern.tester.test(control.value.trim()))
        return { alpha: { message: PatternValidation('AlphaNumeric', 'message') } };
    return null;
}
export function ValidateAlphaNumericNoUnderscore(control) {
    const pattern = RegexPatterns('AlphaNumericNoUnderscore');
    if (!pattern.tester.test(control.value.trim()))
        return { alpha: { message: PatternValidation('AlphaNumericNoUnderscore', 'message') } };
    return null;
}
export function ValidateAlphaNumericNoSpace(control) {
    const pattern = RegexPatterns('AlphaNumericNoSpace');
    if (!pattern.tester.test(control.value.trim()))
        return { alpha: { message: PatternValidation('AlphaNumericNoSpace', 'message') } };
    return null;
}
export function ValidateNumeric(control) {
    const pattern = RegexPatterns('Numeric');
    if (!pattern.tester.test(control.value.trim()))
        return { numeric: { message: PatternValidation('Numeric', 'message') } };
    return null;
}
export function ValidateNumericNoSpace(control) {
    const pattern = RegexPatterns('NumericNoSpace');
    if (!pattern.tester.test(control.value))
        return { numeric: { message: PatternValidation('NumericNoSpace', 'message') } };
    return null;
}
export function ValidateUsername(control) {
    const pattern = RegexPatterns('Username');
    if (!pattern.tester.test(control.value))
        return { username: { message: PatternValidation('Username', 'message') } };
    return null;
}
export function ValidateEmail(control) {
    const pattern = RegexPatterns('Email');
    if (!pattern.tester.test(control.value))
        return { email: { message: PatternValidation('Email', 'message') } };
    return null;
}
export function ValidatePassword(control) {
    const pattern = RegexPatterns('Password');
    if (!pattern.tester.test(control.value))
        return { password: { message: PatternValidation('Password', 'message') } };
    return null;
}
export function ValidatePhone(control) {
    const pattern = RegexPatterns('Phone');
    if (!pattern.tester.test(control.value))
        return { phone: { message: PatternValidation('Phone', 'message') } };
    return null;
}
export function ValidateZip(control) {
    const pattern = RegexPatterns('Zip');
    if (!pattern.tester.test(control.value))
        return { zip: { message: PatternValidation('Zip', 'message') } };
    return null;
}
export function ValidateUrl(control) {
    const pattern = RegexPatterns('Url');
    let value = control.value;
    if (IsString(value, true))
        value = value.trim();
    if (!pattern.tester.test(value))
        return { url: { message: PatternValidation('Url', 'message') } };
    return null;
}
export function MatchPassword(control) {
    const password = control.get('password').value; // to get value in input tag
    const password_confirmation = control.get('password_confirmation').value; // to get value in input tag
    if (password !== password_confirmation) {
        control.get('password_confirmation').setErrors({ MatchPassword: true });
        if (control.get('password_confirmation').value) {
            control.get('password_confirmation').markAsDirty();
        }
    }
    else {
        return true;
    }
}
export function MatchEmail(control) {
    const email = control.get('email').value; // to get value in input tag
    const email_confirmation = control.get('email_confirmation').value; // to get value in input tag
    if (email !== email_confirmation) {
        control.get('email_confirmation').setErrors({ MatchEmail: true });
        if (control.get('email_confirmation').value) {
            control.get('email_confirmation').markAsDirty();
        }
    }
    else {
        return true;
    }
}
export function ValidationErrorMessages(validationError) {
    let message = '';
    for (const validation in validationError) {
        if (!validationError.hasOwnProperty(validation))
            continue;
        if (typeof validationError[validation].message === 'string') {
            message += validationError[validation].message + ' ';
        }
        else {
            switch (validation) {
                case 'min':
                    message += `Must be greater than or equal to ${validationError[validation].min}. `;
                    break;
                case 'max':
                    message += `Must be less than or equal to ${validationError[validation].max}. `;
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
                    message += `To short, minimum ${validationError[validation].requiredLength} characters. `;
                    break;
                case 'maxlength':
                    message += `To long, maximum ${validationError[validation].requiredLength} characters. `;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wLXZhbGlkYXRvcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9wb3AtY29tbW9uL3NyYy9saWIvc2VydmljZXMvcG9wLXZhbGlkYXRvcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBRWpELGlDQUFpQztBQUVqQyxNQUFNLFVBQVUsYUFBYSxDQUFFLE9BQU87SUFDcEMsUUFBUSxPQUFPLEVBQUU7UUFDZixLQUFLLE9BQU87WUFDVixPQUFPLEVBQUUsTUFBTSxFQUFFLGtCQUFrQixFQUFFLFFBQVEsRUFBRSxrQkFBa0IsRUFBRSxDQUFDO1FBQ3RFLEtBQUssY0FBYztZQUNqQixPQUFPLEVBQUUsTUFBTSxFQUFFLGFBQWEsRUFBRSxRQUFRLEVBQUUsbUJBQW1CLEVBQUUsQ0FBQztRQUNsRSxLQUFLLHNCQUFzQjtZQUN6QixPQUFPLEVBQUUsTUFBTSxFQUFFLGFBQWEsRUFBRSxRQUFRLEVBQUUsZUFBZSxFQUFFLENBQUM7UUFDOUQsS0FBSyx1QkFBdUI7WUFDMUIsT0FBTyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLGdCQUFnQixFQUFFLENBQUM7UUFDNUQsS0FBSyxjQUFjO1lBQ2pCLE9BQU8sRUFBRSxNQUFNLEVBQUUsdUJBQXVCLEVBQUUsUUFBUSxFQUFFLHVCQUF1QixFQUFFLENBQUM7UUFDaEYsS0FBSywwQkFBMEI7WUFDN0IsT0FBTyxFQUFFLE1BQU0sRUFBRSxxQkFBcUIsRUFBRSxRQUFRLEVBQUUscUJBQXFCLEVBQUUsQ0FBQztRQUM1RSxLQUFLLHFCQUFxQjtZQUN4QixPQUFPLEVBQUUsTUFBTSxFQUFFLHNCQUFzQixFQUFFLFFBQVEsRUFBRSxzQkFBc0IsRUFBRSxDQUFDO1FBQzlFLEtBQUssZ0JBQWdCO1lBQ25CLE9BQU8sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxV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QkFBaUIsQ0FBQztvQkFDN0IsTUFBTTtnQkFDUixLQUFLLFFBQVE7b0JBQ1gsT0FBTyxJQUFJLHNDQUFzQyxDQUFDO29CQUNsRCxNQUFNO2dCQUNSLEtBQUssV0FBVztvQkFDZCxPQUFPLElBQUkscUJBQXFCLGVBQWUsQ0FBRSxVQUFVLENBQUUsQ0FBQyxjQUFjLGVBQWUsQ0FBQztvQkFDNUYsTUFBTTtnQkFDUixLQUFLLFdBQVc7b0JBQ2QsT0FBTyxJQUFJLG9CQUFvQixlQUFlLENBQUUsVUFBVSxDQUFFLENBQUMsY0FBYyxlQUFlLENBQUM7b0JBQzNGLE1BQU07Z0JBQ1IsS0FBSyxTQUFTO29CQUNaLE9BQU8sSUFBSSxzQkFBc0IsQ0FBQztvQkFDbEMsTUFBTTtnQkFDUixLQUFLLGVBQWU7b0JBQ2xCLE9BQU8sR0FBRyxxQ0FBcUMsQ0FBQztvQkFDaEQsTUFBTTtnQkFDUixLQUFLLFlBQVk7b0JBQ2YsT0FBTyxHQUFHLGtDQUFrQyxDQUFDO29CQUM3QyxNQUFNO2dCQUNSO29CQUNFLE9BQU8sSUFBSSxXQUFXLENBQUM7b0JBQ3ZCLE1BQU07YUFDVDtTQUNGO0tBQ0Y7SUFDRCxPQUFPLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUN4QixDQUFDO0FBRUQsSUFBSSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFic3RyYWN0Q29udHJvbCwgVmFsaWRhdG9yRm4gfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5pbXBvcnQgeyBJc1N0cmluZyB9IGZyb20gJy4uL3BvcC1jb21tb24tdXRpbGl0eSc7XG5cbi8vIGV4cG9ydCBjbGFzcyBDdXN0b21WYWxpZGF0b3Jze1xuXG5leHBvcnQgZnVuY3Rpb24gUmVnZXhQYXR0ZXJucyggcGF0dGVybiApe1xuICBzd2l0Y2goIHBhdHRlcm4gKXtcbiAgICBjYXNlICdBbHBoYSc6XG4gICAgICByZXR1cm4geyB0ZXN0ZXI6IC9eWyBhLXpBLVpcXC1cXF9dKy9nLCByZXBsYWNlcjogL1teIGEtekEtWlxcLVxcX10rL2cgfTtcbiAgICBjYXNlICdBbHBoYU5vU3BhY2UnOlxuICAgICAgcmV0dXJuIHsgdGVzdGVyOiAvXlthLXpBLVpdKy9nLCByZXBsYWNlcjogL1teYS16QS1aXFwuXFwtXFxfXSsvZyB9O1xuICAgIGNhc2UgJ0FscGhhTm9TcGFjZU9ubHlEYXNoJzpcbiAgICAgIHJldHVybiB7IHRlc3RlcjogL15bYS16QS1aXSsvZywgcmVwbGFjZXI6IC9bXmEtekEtWlxcLV0rL2cgfTtcbiAgICBjYXNlICdBbHBoYUxvd2VyY2FzZU5vU3BhY2UnOlxuICAgICAgcmV0dXJuIHsgdGVzdGVyOiAvXlthLXpdKy9nLCByZXBsYWNlcjogL1teYS16XFwuXFwtXFxfXSsvZyB9O1xuICAgIGNhc2UgJ0FscGhhTnVtZXJpYyc6XG4gICAgICByZXR1cm4geyB0ZXN0ZXI6IC9eWyBhLXpBLVowLTlcXC5cXC1cXF9dKy9nLCByZXBsYWNlcjogL1teIGEtekEtWjAtOVxcLlxcLVxcX10rL2cgfTtcbiAgICBjYXNlICdBbHBoYU51bWVyaWNOb1VuZGVyc2NvcmUnOlxuICAgICAgcmV0dXJuIHsgdGVzdGVyOiAvXlsgYS16QS1aMC05XFwuXFwtXSsvZywgcmVwbGFjZXI6IC9bXiBhLXpBLVowLTlcXC5cXC1dKy9nIH07XG4gICAgY2FzZSAnQWxwaGFOdW1lcmljTm9TcGFjZSc6XG4gICAgICByZXR1cm4geyB0ZXN0ZXI6IC9eW2EtekEtWjAtOVxcLlxcLVxcX10rL2csIHJlcGxhY2VyOiAvW15hLXpBLVowLTlcXC5cXC1cXF9dKy9nIH07XG4gICAgY2FzZSAnTnVtZXJpY05vU3BhY2UnOlxuICAgICAgcmV0dXJuIHsgdGVzdGVyOiAvXlswLTldKy9nLCByZXBsYWNlcjogL1teMC05XSsvZyB9O1xuICAgIGNhc2UgJ05vU3BhY2UnOlxuICAgICAgcmV0dXJuIHsgdGVzdGVyOiAvW14gXSsvZywgcmVwbGFjZXI6IC9bIF0rL2cgfTtcbiAgICBjYXNlICdEZWZhdWx0JzpcbiAgICAgIHJldHVybiB7IHRlc3RlcjogL15bYS16QS1aMC05XFwvXFwqXFw/XFwhXFwlXFxAXFwkXFwmXFwsXFwuXFwtXFwoXFwpIF0rL2csIHJlcGxhY2VyOiAvW15hLXpBLVowLTlcXC9cXCpcXD9cXCFcXCVcXEBcXCRcXCZcXCxcXC5cXC1cXChcXCkgXSsvZyB9O1xuICAgIGNhc2UgJ051bWVyaWNXaXRoU3BhY2UnOlxuICAgICAgcmV0dXJuIHsgdGVzdGVyOiAvXlsgMC05XSsvZywgcmVwbGFjZXI6IC9bXiAwLTldKy9nIH07XG4gICAgY2FzZSAnTnVtZXJpYyc6XG4gICAgICByZXR1cm4geyB0ZXN0ZXI6IC9eWzAtOV0rL2csIHJlcGxhY2VyOiAvW14wLTldKy9nIH07XG4gICAgY2FzZSAnUGhvbmUnOlxuICAgICAgcmV0dXJuIHsgdGVzdGVyOiAvQFwiXltcXGQtXSskXCIvLCByZXBsYWNlcjogL1teXFxkLV0rL2cgfTtcbiAgICBjYXNlICdFbWFpbCc6XG4gICAgICByZXR1cm4geyB0ZXN0ZXI6IC9eW15AXStAW2EtekEtWjAtOS5fLV0rXFxcXC4rW2Etei5fLV0rJC8sIHJlcGxhY2VyOiAvW15AYS16QS1aMC05Ll8tXSsvZyB9O1xuICAgIGNhc2UgJ1Bhc3N3b3JkJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRlc3RlcjogL14oPz0uKltBLVphLXpdKSg/PS4qXFxkKSg/PS4qWyRAJCElKiM/Jl0pW0EtWmEtelxcZCRAJCElKiM/Jl17OCx9JC8sXG4gICAgICAgIHJlcGxhY2VyOiAvXig/PS4qW0EtWmEtel0pKD89LipcXGQpKD89LipbJEAkISUqIz8mXSlbQS1aYS16XFxkJEAkISUqIz8mXXs4LH0kL1xuICAgICAgfTtcbiAgICBjYXNlICdVc2VybmFtZSc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0ZXN0ZXI6IC9eXFxTW2EtekEtWjAtOS5fXFwtXXsyLH0kL2csXG4gICAgICAgIHJlcGxhY2VyOiAvW15hLXpBLVowLTkuX1xcLV0rL2dcbiAgICAgIH07XG5cbiAgICBjYXNlICdVcmwnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGVzdGVyOiAvaHR0cHM/OlxcL1xcLyh3d3dcXC4pP1stYS16QS1aMC05QDolLl9cXCt+Iz1dezEsMjU2fVxcLlthLXpBLVowLTkoKV17MSw2fVxcYihbLWEtekEtWjAtOSgpQDolX1xcKy5+Iz8mLy89XSopLyxcbiAgICAgICAgcmVwbGFjZXI6IC9bXlxcXFw6YS16QS1aMC05Ll9cXFxcLVxcXFwvXFxcXD9cXFxcPVxcXFwjXFxcXCZdKy9nXG4gICAgICB9O1xuXG4gICAgY2FzZSAnWmlwJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRlc3RlcjogL14oXFxkezV9KC1cXGR7NH0pP3xbQS1aXVxcZFtBLVpdICpcXGRbQS1aXVxcZCkkLyxcbiAgICAgICAgcmVwbGFjZXI6IC9bXlswLTldW0EtWl1bQS1aXSRdKy9nXG4gICAgICB9O1xuXG4gICAgLy8gY2FzZSAnTnVtZXJpY1NpZ25lZCc6IHJldHVybiAnXi0/W14wLTldK1swLTldJztcbiAgICAvLyBjYXNlICdmbG9hdCc6IHJldHVybiAvW14uMC05XSsvZztcbiAgICAvLyBjYXNlICdmbG9hdCc6IHJldHVybiAvXiguKD8hXFxkKXxcXEQpKy87XG4gICAgLy8gY2FzZSAnZmxvYXRTaWduZWQnOiByZXR1cm4gJ14tP1teMC05XStcXC4/WzAtOV0nO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4geyB0ZXN0ZXI6IC9eW2EtekEtWjAtOVxcIVxcJVxcQFxcJFxcJlxcLlxcLVxcKFxcKSBdKy9nLCByZXBsYWNlcjogL1teYS16QS1aMC05XFwhXFwlXFxAXFwkXFwmXFwuXFwtXFwoXFwpIF0rL2cgfTsgLy8gZGVmYXVsdFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBQYXR0ZXJuVmFsaWRhdGlvbiggcGF0dGVybjogc3RyaW5nLCByZXNwb25zZTogJ3ZhbHVlJyB8ICdtZXNzYWdlJyB8ICd0ZXN0JywgdmFsdWU/OiBzdHJpbmcgKXtcblxuICBjb25zdCByZWdFeFBhdHRlcm4gPSBSZWdleFBhdHRlcm5zKCBwYXR0ZXJuICk7XG5cbiAgaWYoIHJlc3BvbnNlID09PSAndGVzdCcgKXtcblxuICAgIHJldHVybiByZWdFeFBhdHRlcm4udGVzdGVyLnRlc3QoIHZhbHVlLnRyaW0oKSApO1xuXG4gIH1lbHNlIGlmKCByZXNwb25zZSA9PT0gJ3ZhbHVlJyApe1xuICAgIGlmKCB0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnICkgdmFsdWUgPSAnJztcbiAgICBzd2l0Y2goIHBhdHRlcm4gKXtcbiAgICAgIGNhc2UgJ0FscGhhJzpcbiAgICAgICAgcmV0dXJuIHZhbHVlLnJlcGxhY2UoIHJlZ0V4UGF0dGVybi5yZXBsYWNlciwgJycgKTtcbiAgICAgIGNhc2UgJ0FscGhhTm9TcGFjZSc6XG4gICAgICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKCByZWdFeFBhdHRlcm4ucmVwbGFjZXIsICcnICk7XG4gICAgICBjYXNlICdBbHBoYU5vU3BhY2VPbmx5RGFzaCc6XG4gICAgICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKCByZWdFeFBhdHRlcm4ucmVwbGFjZXIsICcnICk7XG4gICAgICBjYXNlICdBbHBoYUxvd2VyY2FzZU5vU3BhY2UnOlxuICAgICAgICByZXR1cm4gdmFsdWUucmVwbGFjZSggcmVnRXhQYXR0ZXJuLnJlcGxhY2VyLCAnJyApO1xuICAgICAgY2FzZSAnQWxwaGFOdW1lcmljJzpcbiAgICAgICAgcmV0dXJuIHZhbHVlLnJlcGxhY2UoIHJlZ0V4UGF0dGVybi5yZXBsYWNlciwgJycgKTtcbiAgICAgIGNhc2UgJ0FscGhhTnVtZXJpY05vVW5kZXJzY29yZSc6XG4gICAgICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKCByZWdFeFBhdHRlcm4ucmVwbGFjZXIsICcnICk7XG4gICAgICBjYXNlICdBbHBoYU51bWVyaWNOb1NwYWNlJzpcbiAgICAgICAgcmV0dXJuIHZhbHVlLnJlcGxhY2UoIHJlZ0V4UGF0dGVybi5yZXBsYWNlciwgJycgKTtcbiAgICAgIGNhc2UgJ05vU3BhY2UnOlxuICAgICAgICByZXR1cm4gdmFsdWUucmVwbGFjZSggcmVnRXhQYXR0ZXJuLnJlcGxhY2VyLCAnJyApO1xuICAgICAgY2FzZSAnTnVtZXJpYyc6XG4gICAgICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKCByZWdFeFBhdHRlcm4ucmVwbGFjZXIsICcnICk7XG4gICAgICBjYXNlICdOdW1lcmljTm9TcGFjZSc6XG4gICAgICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKCByZWdFeFBhdHRlcm4ucmVwbGFjZXIsICcnICk7XG4gICAgICBjYXNlICdQaG9uZSc6XG4gICAgICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKCByZWdFeFBhdHRlcm4ucmVwbGFjZXIsICcnICk7XG4gICAgICBjYXNlICdFbWFpbCc6XG4gICAgICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKCByZWdFeFBhdHRlcm4ucmVwbGFjZXIsICcnICk7XG4gICAgICBjYXNlICdaaXAnOlxuICAgICAgICByZXR1cm4gdmFsdWUucmVwbGFjZSggcmVnRXhQYXR0ZXJuLnJlcGxhY2VyLCAnJyApO1xuICAgICAgY2FzZSAnVXJsJzpcbiAgICAgICAgcmV0dXJuIHZhbHVlLnJlcGxhY2UoIHJlZ0V4UGF0dGVybi5yZXBsYWNlciwgJycgKTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKCByZWdFeFBhdHRlcm4ucmVwbGFjZXIsICcnICk7XG4gICAgfVxuXG4gIH1lbHNle1xuXG4gICAgc3dpdGNoKCBwYXR0ZXJuICl7XG4gICAgICBjYXNlICdBbHBoYSc6XG4gICAgICAgIHJldHVybiAnT25seSBsZXR0ZXJzIGFyZSBhbGxvd2VkLic7XG4gICAgICBjYXNlICdBbHBoYU5vU3BhY2UnOlxuICAgICAgICByZXR1cm4gJ09ubHkgbGV0dGVycyBhcmUgYWxsb3dlZC4nO1xuICAgICAgY2FzZSAnQWxwaGFMb3dlcmNhc2VOb1NwYWNlJzpcbiAgICAgICAgcmV0dXJuICdPbmx5IGxvd2VyY2FzZSBsZXR0ZXJzIGFyZSBhbGxvd2VkLic7XG4gICAgICBjYXNlICdBbHBoYU51bWVyaWMnOlxuICAgICAgICByZXR1cm4gJ09ubHkgbGV0dGVycyBhbmQgTnVtYmVycyBhcmUgYWxsb3dlZC4nO1xuICAgICAgY2FzZSAnQWxwaGFOdW1lcmljTm9VbmRlcnNjb3JlJzpcbiAgICAgICAgcmV0dXJuICdPbmx5IGxldHRlcnMgYW5kIE51bWJlcnMgYXJlIGFsbG93ZWQuJztcbiAgICAgIGNhc2UgJ0FscGhhTnVtZXJpY05vU3BhY2UnOlxuICAgICAgICByZXR1cm4gJ09ubHkgbGV0dGVycyBhbmQgTnVtYmVycyBhcmUgYWxsb3dlZC4nO1xuICAgICAgY2FzZSAnQmxhY2tsaXN0JzpcbiAgICAgICAgcmV0dXJuICdOb3QgYWxsb3dlZCc7XG4gICAgICBjYXNlICdOb1NwYWNlJzpcbiAgICAgICAgcmV0dXJuICdTcGFjZXMgbm90IGFsbG93ZWQuJztcbiAgICAgIGNhc2UgJ051bWVyaWMnOlxuICAgICAgICByZXR1cm4gJ09ubHkgbnVtYmVycyBhcmUgYWxsb3dlZC4nO1xuICAgICAgY2FzZSAnTnVtZXJpY05vU3BhY2UnOlxuICAgICAgICByZXR1cm4gJ09ubHkgbnVtYmVycyBhcmUgYWxsb3dlZC4nO1xuICAgICAgY2FzZSAnUGhvbmUnOlxuICAgICAgICByZXR1cm4gJ0ludmFsaWQgUGhvbmUuJztcbiAgICAgIGNhc2UgJ0VtYWlsJzpcbiAgICAgICAgcmV0dXJuICdJbnZhbGlkIEVtYWlsLic7XG4gICAgICBjYXNlICdQYXNzd29yZCc6XG4gICAgICAgIHJldHVybiAnTXVzdCBjb250YWluIGEgbnVtYmVyLCBsZXR0ZXIsIHNwZWNpYWwgYW5kIGJlID4gOCBjaGFyYWN0ZXJzLic7XG4gICAgICBjYXNlICdVc2VybmFtZSc6XG4gICAgICAgIHJldHVybiAnTXVzdCBjb250YWluIG9ubHkgQS1aIDAtOSAuIC0gXyc7XG4gICAgICBjYXNlICdVcmwnOlxuICAgICAgICByZXR1cm4gJ011c3QgYmUgYSB2YWxpZCB1cmwuJztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiAnSW52YWxpZCBjaGFyYWN0ZXJzLic7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBWYWxpZGF0ZUJsYWNrbGlzdCggYmxhY2tsaXN0OiBzdHJpbmdbXSApOiBWYWxpZGF0b3JGbntcbiAgcmV0dXJuICggY29udHJvbDogQWJzdHJhY3RDb250cm9sICk6IHsgYWxwaGE6IHsgbWVzc2FnZTogc3RyaW5nIHwgYm9vbGVhbiB9IH0gfCBudWxsID0+IHtcbiAgICBsZXQgZm9yYmlkZGVuID0gZmFsc2U7XG4gICAgZm9yKCBjb25zdCBzIG9mIGJsYWNrbGlzdCApe1xuICAgICAgaWYoIHMgPT09IGNvbnRyb2wudmFsdWUgKXtcbiAgICAgICAgZm9yYmlkZGVuID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZvcmJpZGRlbiA/IHsgYWxwaGE6IHsgbWVzc2FnZTogUGF0dGVyblZhbGlkYXRpb24oICdCbGFja2xpc3QnLCAnbWVzc2FnZScgKSB9IH0gOiBudWxsO1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gVmFsaWRhdGVBbHBoYSggY29udHJvbDogQWJzdHJhY3RDb250cm9sICl7XG4gIGNvbnN0IHBhdHRlcm4gPSBSZWdleFBhdHRlcm5zKCAnQWxwaGEnICk7XG4gIGlmKCAhcGF0dGVybi50ZXN0ZXIudGVzdCggY29udHJvbC52YWx1ZS50cmltKCkgKSApIHJldHVybiB7IGFscGhhOiB7IG1lc3NhZ2U6IFBhdHRlcm5WYWxpZGF0aW9uKCAnQWxwaGEnLCAnbWVzc2FnZScgKSB9IH07XG4gIHJldHVybiBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gVmFsaWRhdGVBbHBoYU5vU3BhY2UoIGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCApe1xuICBjb25zdCBwYXR0ZXJuID0gUmVnZXhQYXR0ZXJucyggJ0FscGhhTm9TcGFjZScgKTtcbiAgaWYoICFwYXR0ZXJuLnRlc3Rlci50ZXN0KCBjb250cm9sLnZhbHVlLnRyaW0oKSApICkgcmV0dXJuIHsgYWxwaGE6IHsgbWVzc2FnZTogUGF0dGVyblZhbGlkYXRpb24oICdBbHBoYU5vU3BhY2UnLCAnbWVzc2FnZScgKSB9IH07XG4gIHJldHVybiBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gVmFsaWRhdGVBbHBoYUxvd2VyY2FzZU5vU3BhY2UoIGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCApe1xuICBjb25zdCBwYXR0ZXJuID0gUmVnZXhQYXR0ZXJucyggJ0FscGhhTG93ZXJjYXNlTm9TcGFjZScgKTtcbiAgaWYoICFwYXR0ZXJuLnRlc3Rlci50ZXN0KCBjb250cm9sLnZhbHVlLnRyaW0oKSApICkgcmV0dXJuIHsgYWxwaGE6IHsgbWVzc2FnZTogUGF0dGVyblZhbGlkYXRpb24oICdBbHBoYUxvd2VyY2FzZU5vU3BhY2UnLCAnbWVzc2FnZScgKSB9IH07XG4gIHJldHVybiBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gVmFsaWRhdGVBbHBoYU51bWVyaWMoIGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCApe1xuICBjb25zdCBwYXR0ZXJuID0gUmVnZXhQYXR0ZXJucyggJ0FscGhhTnVtZXJpYycgKTtcbiAgaWYoICFwYXR0ZXJuLnRlc3Rlci50ZXN0KCBjb250cm9sLnZhbHVlLnRyaW0oKSApICkgcmV0dXJuIHsgYWxwaGE6IHsgbWVzc2FnZTogUGF0dGVyblZhbGlkYXRpb24oICdBbHBoYU51bWVyaWMnLCAnbWVzc2FnZScgKSB9IH07XG4gIHJldHVybiBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gVmFsaWRhdGVBbHBoYU51bWVyaWNOb1VuZGVyc2NvcmUoIGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCApe1xuICBjb25zdCBwYXR0ZXJuID0gUmVnZXhQYXR0ZXJucyggJ0FscGhhTnVtZXJpY05vVW5kZXJzY29yZScgKTtcbiAgaWYoICFwYXR0ZXJuLnRlc3Rlci50ZXN0KCBjb250cm9sLnZhbHVlLnRyaW0oKSApICkgcmV0dXJuIHsgYWxwaGE6IHsgbWVzc2FnZTogUGF0dGVyblZhbGlkYXRpb24oICdBbHBoYU51bWVyaWNOb1VuZGVyc2NvcmUnLCAnbWVzc2FnZScgKSB9IH07XG4gIHJldHVybiBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gVmFsaWRhdGVBbHBoYU51bWVyaWNOb1NwYWNlKCBjb250cm9sOiBBYnN0cmFjdENvbnRyb2wgKXtcbiAgY29uc3QgcGF0dGVybiA9IFJlZ2V4UGF0dGVybnMoICdBbHBoYU51bWVyaWNOb1NwYWNlJyApO1xuICBpZiggIXBhdHRlcm4udGVzdGVyLnRlc3QoIGNvbnRyb2wudmFsdWUudHJpbSgpICkgKSByZXR1cm4geyBhbHBoYTogeyBtZXNzYWdlOiBQYXR0ZXJuVmFsaWRhdGlvbiggJ0FscGhhTnVtZXJpY05vU3BhY2UnLCAnbWVzc2FnZScgKSB9IH07XG4gIHJldHVybiBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gVmFsaWRhdGVOdW1lcmljKCBjb250cm9sOiBBYnN0cmFjdENvbnRyb2wgKXtcbiAgY29uc3QgcGF0dGVybiA9IFJlZ2V4UGF0dGVybnMoICdOdW1lcmljJyApO1xuICBpZiggIXBhdHRlcm4udGVzdGVyLnRlc3QoIGNvbnRyb2wudmFsdWUudHJpbSgpICkgKSByZXR1cm4geyBudW1lcmljOiB7IG1lc3NhZ2U6IFBhdHRlcm5WYWxpZGF0aW9uKCAnTnVtZXJpYycsICdtZXNzYWdlJyApIH0gfTtcbiAgcmV0dXJuIG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBWYWxpZGF0ZU51bWVyaWNOb1NwYWNlKCBjb250cm9sOiBBYnN0cmFjdENvbnRyb2wgKXtcbiAgY29uc3QgcGF0dGVybiA9IFJlZ2V4UGF0dGVybnMoICdOdW1lcmljTm9TcGFjZScgKTtcbiAgaWYoICFwYXR0ZXJuLnRlc3Rlci50ZXN0KCBjb250cm9sLnZhbHVlICkgKSByZXR1cm4geyBudW1lcmljOiB7IG1lc3NhZ2U6IFBhdHRlcm5WYWxpZGF0aW9uKCAnTnVtZXJpY05vU3BhY2UnLCAnbWVzc2FnZScgKSB9IH07XG4gIHJldHVybiBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gVmFsaWRhdGVVc2VybmFtZSggY29udHJvbDogQWJzdHJhY3RDb250cm9sICl7XG4gIGNvbnN0IHBhdHRlcm4gPSBSZWdleFBhdHRlcm5zKCAnVXNlcm5hbWUnICk7XG4gIGlmKCAhcGF0dGVybi50ZXN0ZXIudGVzdCggY29udHJvbC52YWx1ZSApICkgcmV0dXJuIHsgdXNlcm5hbWU6IHsgbWVzc2FnZTogUGF0dGVyblZhbGlkYXRpb24oICdVc2VybmFtZScsICdtZXNzYWdlJyApIH0gfTtcbiAgcmV0dXJuIG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBWYWxpZGF0ZUVtYWlsKCBjb250cm9sOiBBYnN0cmFjdENvbnRyb2wgKXtcbiAgY29uc3QgcGF0dGVybiA9IFJlZ2V4UGF0dGVybnMoICdFbWFpbCcgKTtcbiAgaWYoICFwYXR0ZXJuLnRlc3Rlci50ZXN0KCBjb250cm9sLnZhbHVlICkgKSByZXR1cm4geyBlbWFpbDogeyBtZXNzYWdlOiBQYXR0ZXJuVmFsaWRhdGlvbiggJ0VtYWlsJywgJ21lc3NhZ2UnICkgfSB9O1xuICByZXR1cm4gbnVsbDtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gVmFsaWRhdGVQYXNzd29yZCggY29udHJvbDogQWJzdHJhY3RDb250cm9sICl7XG4gIGNvbnN0IHBhdHRlcm4gPSBSZWdleFBhdHRlcm5zKCAnUGFzc3dvcmQnICk7XG4gIGlmKCAhcGF0dGVybi50ZXN0ZXIudGVzdCggY29udHJvbC52YWx1ZSApICkgcmV0dXJuIHsgcGFzc3dvcmQ6IHsgbWVzc2FnZTogUGF0dGVyblZhbGlkYXRpb24oICdQYXNzd29yZCcsICdtZXNzYWdlJyApIH0gfTtcbiAgcmV0dXJuIG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBWYWxpZGF0ZVBob25lKCBjb250cm9sOiBBYnN0cmFjdENvbnRyb2wgKXtcbiAgY29uc3QgcGF0dGVybiA9IFJlZ2V4UGF0dGVybnMoICdQaG9uZScgKTtcbiAgaWYoICFwYXR0ZXJuLnRlc3Rlci50ZXN0KCBjb250cm9sLnZhbHVlICkgKSByZXR1cm4geyBwaG9uZTogeyBtZXNzYWdlOiBQYXR0ZXJuVmFsaWRhdGlvbiggJ1Bob25lJywgJ21lc3NhZ2UnICkgfSB9O1xuICByZXR1cm4gbnVsbDtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gVmFsaWRhdGVaaXAoIGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCApe1xuICBjb25zdCBwYXR0ZXJuID0gUmVnZXhQYXR0ZXJucyggJ1ppcCcgKTtcbiAgaWYoICFwYXR0ZXJuLnRlc3Rlci50ZXN0KCBjb250cm9sLnZhbHVlICkgKSByZXR1cm4geyB6aXA6IHsgbWVzc2FnZTogUGF0dGVyblZhbGlkYXRpb24oICdaaXAnLCAnbWVzc2FnZScgKSB9IH07XG4gIHJldHVybiBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gVmFsaWRhdGVVcmwoIGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCApe1xuICBjb25zdCBwYXR0ZXJuID0gUmVnZXhQYXR0ZXJucyggJ1VybCcgKTtcbiAgbGV0IHZhbHVlID0gY29udHJvbC52YWx1ZTtcbiAgaWYoIElzU3RyaW5nKCB2YWx1ZSwgdHJ1ZSApICkgdmFsdWUgPSB2YWx1ZS50cmltKCk7XG4gIGlmKCAhcGF0dGVybi50ZXN0ZXIudGVzdCggdmFsdWUgKSApIHJldHVybiB7IHVybDogeyBtZXNzYWdlOiBQYXR0ZXJuVmFsaWRhdGlvbiggJ1VybCcsICdtZXNzYWdlJyApIH0gfTtcbiAgcmV0dXJuIG51bGw7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIE1hdGNoUGFzc3dvcmQoIGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCApe1xuICBjb25zdCBwYXNzd29yZCA9IGNvbnRyb2wuZ2V0KCAncGFzc3dvcmQnICkudmFsdWU7IC8vIHRvIGdldCB2YWx1ZSBpbiBpbnB1dCB0YWdcbiAgY29uc3QgcGFzc3dvcmRfY29uZmlybWF0aW9uID0gY29udHJvbC5nZXQoICdwYXNzd29yZF9jb25maXJtYXRpb24nICkudmFsdWU7IC8vIHRvIGdldCB2YWx1ZSBpbiBpbnB1dCB0YWdcbiAgaWYoIHBhc3N3b3JkICE9PSBwYXNzd29yZF9jb25maXJtYXRpb24gKXtcbiAgICBjb250cm9sLmdldCggJ3Bhc3N3b3JkX2NvbmZpcm1hdGlvbicgKS5zZXRFcnJvcnMoIHsgTWF0Y2hQYXNzd29yZDogdHJ1ZSB9ICk7XG4gICAgaWYoIGNvbnRyb2wuZ2V0KCAncGFzc3dvcmRfY29uZmlybWF0aW9uJyApLnZhbHVlICl7XG4gICAgICBjb250cm9sLmdldCggJ3Bhc3N3b3JkX2NvbmZpcm1hdGlvbicgKS5tYXJrQXNEaXJ0eSgpO1xuICAgIH1cbiAgfWVsc2V7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIE1hdGNoRW1haWwoIGNvbnRyb2w6IEFic3RyYWN0Q29udHJvbCApe1xuICBjb25zdCBlbWFpbCA9IGNvbnRyb2wuZ2V0KCAnZW1haWwnICkudmFsdWU7IC8vIHRvIGdldCB2YWx1ZSBpbiBpbnB1dCB0YWdcbiAgY29uc3QgZW1haWxfY29uZmlybWF0aW9uID0gY29udHJvbC5nZXQoICdlbWFpbF9jb25maXJtYXRpb24nICkudmFsdWU7IC8vIHRvIGdldCB2YWx1ZSBpbiBpbnB1dCB0YWdcbiAgaWYoIGVtYWlsICE9PSBlbWFpbF9jb25maXJtYXRpb24gKXtcbiAgICBjb250cm9sLmdldCggJ2VtYWlsX2NvbmZpcm1hdGlvbicgKS5zZXRFcnJvcnMoIHsgTWF0Y2hFbWFpbDogdHJ1ZSB9ICk7XG4gICAgaWYoIGNvbnRyb2wuZ2V0KCAnZW1haWxfY29uZmlybWF0aW9uJyApLnZhbHVlICl7XG4gICAgICBjb250cm9sLmdldCggJ2VtYWlsX2NvbmZpcm1hdGlvbicgKS5tYXJrQXNEaXJ0eSgpO1xuICAgIH1cbiAgfWVsc2V7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFZhbGlkYXRpb25FcnJvck1lc3NhZ2VzKCB2YWxpZGF0aW9uRXJyb3I6IG9iamVjdCApOiBzdHJpbmd7XG4gIGxldCBtZXNzYWdlID0gJyc7XG4gIGZvciggY29uc3QgdmFsaWRhdGlvbiBpbiB2YWxpZGF0aW9uRXJyb3IgKXtcbiAgICBpZiggIXZhbGlkYXRpb25FcnJvci5oYXNPd25Qcm9wZXJ0eSggdmFsaWRhdGlvbiApICkgY29udGludWU7XG4gICAgaWYoIHR5cGVvZiB2YWxpZGF0aW9uRXJyb3JbIHZhbGlkYXRpb24gXS5tZXNzYWdlID09PSAnc3RyaW5nJyApe1xuICAgICAgbWVzc2FnZSArPSB2YWxpZGF0aW9uRXJyb3JbIHZhbGlkYXRpb24gXS5tZXNzYWdlICsgJyAnO1xuICAgIH1lbHNle1xuICAgICAgc3dpdGNoKCB2YWxpZGF0aW9uICl7XG4gICAgICAgIGNhc2UgJ21pbic6XG4gICAgICAgICAgbWVzc2FnZSArPSBgTXVzdCBiZSBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gJHt2YWxpZGF0aW9uRXJyb3JbIHZhbGlkYXRpb24gXS5taW59LiBgO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdtYXgnOlxuICAgICAgICAgIG1lc3NhZ2UgKz0gYE11c3QgYmUgbGVzcyB0aGFuIG9yIGVxdWFsIHRvICR7dmFsaWRhdGlvbkVycm9yWyB2YWxpZGF0aW9uIF0ubWF4fS4gYDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAncmVxdWlyZWQnOlxuICAgICAgICAgIG1lc3NhZ2UgKz0gJ0ZpZWxkIGlzIHJlcXVpcmVkLic7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2VtYWlsJzpcbiAgICAgICAgICBtZXNzYWdlICs9ICdJbnZhbGlkIGVtYWlsLiAnO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICd1bmlxdWUnOlxuICAgICAgICAgIG1lc3NhZ2UgKz0gJ1RoZSBjdXJyZW50IHZhbHVlIGlzIGFscmVhZHkgaW4gdXNlLic7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ21pbmxlbmd0aCc6XG4gICAgICAgICAgbWVzc2FnZSArPSBgVG8gc2hvcnQsIG1pbmltdW0gJHt2YWxpZGF0aW9uRXJyb3JbIHZhbGlkYXRpb24gXS5yZXF1aXJlZExlbmd0aH0gY2hhcmFjdGVycy4gYDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnbWF4bGVuZ3RoJzpcbiAgICAgICAgICBtZXNzYWdlICs9IGBUbyBsb25nLCBtYXhpbXVtICR7dmFsaWRhdGlvbkVycm9yWyB2YWxpZGF0aW9uIF0ucmVxdWlyZWRMZW5ndGh9IGNoYXJhY3RlcnMuIGA7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3BhdHRlcm4nOlxuICAgICAgICAgIG1lc3NhZ2UgKz0gJ0ludmFsaWQgY2hhcmFjdGVycy4gJztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnTWF0Y2hQYXNzd29yZCc6XG4gICAgICAgICAgbWVzc2FnZSA9IGBUaGlzIGZpZWxkIG11c3QgbWF0Y2ggdGhlIHBhc3N3b3JkLmA7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ01hdGNoRW1haWwnOlxuICAgICAgICAgIG1lc3NhZ2UgPSBgVGhpcyBmaWVsZCBtdXN0IG1hdGNoIHRoZSBlbWFpbC5gO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIG1lc3NhZ2UgKz0gJ0ludmFsaWQuICc7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBtZXNzYWdlLnRyaW0oKTtcbn1cblxuLy8gfVxuIl19