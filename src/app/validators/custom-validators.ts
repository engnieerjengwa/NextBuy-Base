import { FormControl, ValidationErrors } from '@angular/forms';

export class CustomValidators {
  static whiteSpaceValidator(control: FormControl): ValidationErrors | null {
    // Check if control.value is null, undefined, or not a string
    if (control.value === null || control.value === undefined || typeof control.value !== 'string') {
      return null;
    }

    if (control.value.trim().length === 0) {
      return { whiteSpace: true };
    } else {
      return null;
    }
  }

  /**
   * Validates if a credit card number is authentic using the Luhn algorithm
   * @param control FormControl containing the credit card number
   * @returns ValidationErrors object if invalid, null if valid
   */
  static luhnValidator(control: FormControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }
    const cardNumber = control.value.replace(/\s/g, '');

    // Check if the card number contains only digits
    if (!/^\d+$/.test(cardNumber)) {
      return { luhn: true, message: 'Card number must contain only digits' };
    }

    // Luhn Algorithm implementation
    let sum = 0;
    let shouldDouble = false;

    // Loop through the digits in reverse order
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber.charAt(i));

      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      shouldDouble = !shouldDouble;
    }

    // If the sum is divisible by 10, the card number is valid
    if (sum % 10 !== 0) {
      return { luhn: true, message: 'Invalid card number' };
    }

    return null;
  }

  /**
   * Detects the type of credit card based on its number pattern
   * @param control FormControl containing the credit card number
   * @returns ValidationErrors object with the detected card type or error
   */
  static cardTypeValidator(control: FormControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const cardNumber = control.value.replace(/\s/g, '');

    // Check if the card number contains only digits
    if (!/^\d+$/.test(cardNumber)) {
      return null;
    }

    // Visa: Starts with 4, length 13-16
    if (/^4\d{12}(\d{3})?$/.test(cardNumber)) {
      return { cardType: 'Visa' };
    }

    // Mastercard: Starts with 51-55 or 2221-2720, length 16
    if (/^5[1-5]\d{14}$/.test(cardNumber) || /^(222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[0-1]\d|2720)\d{12}$/.test(cardNumber)) {
      return { cardType: 'MasterCard' };
    }

    // American Express: Starts with 34 or 37, length 15
    if (/^3[47]\d{13}$/.test(cardNumber)) {
      return { cardType: 'AmericanExpress' };
    }

    return { cardType: 'Unknown', message: 'Unrecognized card type' };
  }
}
