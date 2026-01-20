import { FormControl, ValidationErrors } from '@angular/forms';

export class CustomValidators {
  static whiteSpaceValidator(control: FormControl): ValidationErrors | null {
    // Check if control.value is null, undefined, not a string, or has content after trimming
    if (!control.value || typeof control.value !== 'string' || control.value.trim().length > 0) {
      return null;
    }

    return { whiteSpace: true };
  }
}
