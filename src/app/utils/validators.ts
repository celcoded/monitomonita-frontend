import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function validUrlPattern(): ValidatorFn {
    const urlRegex = /^(https?:\/\/)?([\w\-]+\.)+[a-z]{2,}(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/i;

    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value;
        if (!value) return null;

        return urlRegex.test(value) ? null : { invalidUrlPattern: 'Invalid website URL pattern' };
    };
}