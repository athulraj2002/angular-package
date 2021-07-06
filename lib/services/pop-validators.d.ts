import { AbstractControl, ValidatorFn } from '@angular/forms';
export declare function RegexPatterns(pattern: any): {
    tester: RegExp;
    replacer: RegExp;
};
export declare function PatternValidation(pattern: string, response: 'value' | 'message' | 'test', value?: string): string | boolean;
export declare function ValidateBlacklist(blacklist: string[]): ValidatorFn;
export declare function ValidateAlpha(control: AbstractControl): {
    alpha: {
        message: string | boolean;
    };
};
export declare function ValidateAlphaNoSpace(control: AbstractControl): {
    alpha: {
        message: string | boolean;
    };
};
export declare function ValidateAlphaLowercaseNoSpace(control: AbstractControl): {
    alpha: {
        message: string | boolean;
    };
};
export declare function ValidateAlphaNumeric(control: AbstractControl): {
    alpha: {
        message: string | boolean;
    };
};
export declare function ValidateAlphaNumericNoUnderscore(control: AbstractControl): {
    alpha: {
        message: string | boolean;
    };
};
export declare function ValidateAlphaNumericNoSpace(control: AbstractControl): {
    alpha: {
        message: string | boolean;
    };
};
export declare function ValidateNumeric(control: AbstractControl): {
    numeric: {
        message: string | boolean;
    };
};
export declare function ValidateNumericNoSpace(control: AbstractControl): {
    numeric: {
        message: string | boolean;
    };
};
export declare function ValidateUsername(control: AbstractControl): {
    username: {
        message: string | boolean;
    };
};
export declare function ValidateEmail(control: AbstractControl): {
    email: {
        message: string | boolean;
    };
};
export declare function ValidatePassword(control: AbstractControl): {
    password: {
        message: string | boolean;
    };
};
export declare function ValidatePhone(control: AbstractControl): {
    phone: {
        message: string | boolean;
    };
};
export declare function ValidateZip(control: AbstractControl): {
    zip: {
        message: string | boolean;
    };
};
export declare function ValidateUrl(control: AbstractControl): {
    url: {
        message: string | boolean;
    };
};
export declare function MatchPassword(control: AbstractControl): boolean;
export declare function MatchEmail(control: AbstractControl): boolean;
export declare function ValidationErrorMessages(validationError: object): string;
