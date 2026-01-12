import { Component, OnInit, HostListener } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { CardExpiryService } from '../../services/card-expiry.service';
import { CartItem } from '../../common/cart-item';
import { CurrencyPipe, NgFor, NgIf, NgClass } from '@angular/common';
import { Country } from '../../common/country';
import { State } from '../../common/state';
import { CustomValidators } from '../../validators/custom-validators';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe, NgFor, NgIf, NgClass],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent implements OnInit {
  checkoutFormGroup!: FormGroup;
  sameAsShipping: boolean = false;
  cartItems: CartItem[] = [];
  totalPrice: number = 0;
  totalQuantity: number = 0;
  showOrderReview: boolean = false;

  // Credit card form
  cardYears: number[] = [];
  cardMonths: number[] = [];
  selectedYear: number = 0;
  selectedMonth: number = 0;

  // Month/Year selector
  showExpirySelector: boolean = false;
  displayYear: number = 0;
  monthsGrid: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  formattedExpiryDate: string = '';

  countries: Country[] = [];
  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  // Click outside listener to close the expiry selector
  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    const target = event.target as HTMLElement;
    const expirySelector = document.querySelector('.expiry-selector-popup');
    const expiryDisplay = document.querySelector('.expiry-display');

    if (
      this.showExpirySelector &&
      expirySelector &&
      expiryDisplay &&
      !expirySelector.contains(target) &&
      !expiryDisplay.contains(target)
    ) {
      this.showExpirySelector = false;
    }
  }

  constructor(
    private formBuilder: FormBuilder,
    private cartService: CartService,
    private cardExpiryService: CardExpiryService
  ) {}

  ngOnInit() {
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          CustomValidators.whiteSpaceValidator,
        ]),
        lastName: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          CustomValidators.whiteSpaceValidator,
        ]),
        email: new FormControl('', [
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$'),
        ]),
      }),

      // Shipping address is required, so it's set to required too'
      shippingAddress: this.formBuilder.group({
        country: new FormControl('', [Validators.required]),
        state: new FormControl('', [Validators.required]),
        city: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          CustomValidators.whiteSpaceValidator,
        ]),
        street: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          CustomValidators.whiteSpaceValidator,
        ]),
        zipCode: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          CustomValidators.whiteSpaceValidator,
        ]),
      }),

      // Billing address is optional, so it's set to optional too'
      billingAddress: this.formBuilder.group({
        country: new FormControl('', [Validators.required]),
        state: new FormControl('', [Validators.required]),
        city: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          CustomValidators.whiteSpaceValidator,
        ]),
        street: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          CustomValidators.whiteSpaceValidator,
        ]),
        zipCode: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          CustomValidators.whiteSpaceValidator,
        ]),
      }),

      // Credit card details are optional, so they're set to optional too'
      cardDetails: this.formBuilder.group({
        cardType: new FormControl('', [Validators.required]),
        nameOnCard: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          CustomValidators.whiteSpaceValidator,
        ]),
        cardNumber: new FormControl('', [
          Validators.required,
          Validators.pattern('[0-9]{16}'),
          CustomValidators.luhnValidator,
        ]),
        securityCode: new FormControl('', [
          Validators.required,
          Validators.pattern('[0-9]{3}'),
        ]),
        cardExpires: ['', [Validators.required]],
        expiryMonth: ['', [Validators.required]],
        expiryYear: ['', [Validators.required]],
      }),
    });

    // Initialize credit card form data
    this.setupCardExpiryData();

    // Subscribe to shipping address country changes
    this.checkoutFormGroup
      .get('shippingAddress.country')
      ?.valueChanges.subscribe((country) => {
        this.getStates(country.code, this.shippingAddressStates);
      });

    // Subscribe to billing address country changes
    this.checkoutFormGroup
      .get('billingAddress.country')
      ?.valueChanges.subscribe((country) => {
        this.getStates(country.code, this.billingAddressStates);
      });

    // Subscribe to shipping address changes
    this.checkoutFormGroup
      .get('shippingAddress')
      ?.valueChanges.subscribe((value) => {
        if (this.sameAsShipping) {
          this.checkoutFormGroup.get('billingAddress')?.setValue(value);
          this.billingAddressStates = this.shippingAddressStates;
        }
      });

    // Subscribe to card number changes to detect card type
    this.checkoutFormGroup
      .get('cardDetails.cardNumber')
      ?.valueChanges.subscribe((cardNumber) => {
        this.detectAndSetCardType(cardNumber);
      });

    // Get cart items and totals
    this.cartItems = this.cartService.cartItems;
    this.cartService.totalPrice.subscribe((data) => (this.totalPrice = data));
    this.cartService.totalQuantity.subscribe(
      (data) => (this.totalQuantity = data)
    );
    this.cartService.computeCartTotals();

    // Populate countries
    this.cardExpiryService.getCountries().subscribe((data) => {
      this.countries = data;
      console.log('Retrieved countries: ' + JSON.stringify(data));
    });
  }

  onSubmit() {
    console.log('Handling the submit button');
    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
    }
    console.log(this.checkoutFormGroup.get('customer')?.value);
  }

  // Customer getters
  get firstName() {
    return this.checkoutFormGroup.get('customer.firstName')!;
  }
  get lastName() {
    return this.checkoutFormGroup.get('customer.lastName')!;
  }
  get email() {
    return this.checkoutFormGroup.get('customer.email')!;
  }

  // Shipping Address getters
  get shippingAddressStreet() {
    return this.checkoutFormGroup.get('shippingAddress.street')!;
  }
  get shippingAddressCity() {
    return this.checkoutFormGroup.get('shippingAddress.city')!;
  }
  get shippingAddressState() {
    return this.checkoutFormGroup.get('shippingAddress.state')!;
  }
  get shippingAddressCountry() {
    return this.checkoutFormGroup.get('shippingAddress.country')!;
  }
  get shippingAddressZipCode() {
    return this.checkoutFormGroup.get('shippingAddress.zipCode')!;
  }

  // Billing Address getters
  get billingAddressStreet() {
    return this.checkoutFormGroup.get('billingAddress.street')!;
  }
  get billingAddressCity() {
    return this.checkoutFormGroup.get('billingAddress.city')!;
  }
  get billingAddressState() {
    return this.checkoutFormGroup.get('billingAddress.state')!;
  }
  get billingAddressCountry() {
    return this.checkoutFormGroup.get('billingAddress.country')!;
  }
  get billingAddressZipCode() {
    return this.checkoutFormGroup.get('billingAddress.zipCode')!;
  }

  // Card Details getters
  get cardType() {
    return this.checkoutFormGroup.get('cardDetails.cardType')!;
  }
  get nameOnCard() {
    return this.checkoutFormGroup.get('cardDetails.nameOnCard')!;
  }
  get cardNumber() {
    return this.checkoutFormGroup.get('cardDetails.cardNumber')!;
  }
  get securityCode() {
    return this.checkoutFormGroup.get('cardDetails.securityCode')!;
  }
  get cardExpires() {
    return this.checkoutFormGroup.get('cardDetails.cardExpires')!;
  }

  copyShippingToBilling(event: any) {
    this.sameAsShipping = event.target.checked;

    if (this.sameAsShipping) {
      this.checkoutFormGroup.controls['billingAddress'].setValue(
        this.checkoutFormGroup.controls['shippingAddress'].value
      );
      // Copy shipping address states to billing address states
      this.billingAddressStates = [...this.shippingAddressStates];
    } else {
      this.checkoutFormGroup.controls['billingAddress'].reset();
      this.billingAddressStates = [];
    }
  }

  toggleOrderReview() {
    this.showOrderReview = !this.showOrderReview;
  }

  getProductSubtotal(cartItem: CartItem): number {
    return cartItem.quantity * cartItem.unitPrice;
  }

  incrementQuantity(cartItem: CartItem) {
    this.cartService.incrementQuantity(cartItem);
  }

  decrementQuantity(cartItem: CartItem) {
    this.cartService.decrementQuantity(cartItem);
  }

  removeFromCart(cartItem: CartItem) {
    this.cartService.removeFromCart(cartItem);
  }

  // Set up card expiry data (months and years)
  setupCardExpiryData() {
    const currentYear: number = this.cardExpiryService.getThisYear();
    const currentMonth: number = this.cardExpiryService.getCurrentMonth();

    this.displayYear = currentYear;
    this.selectedYear = currentYear;
    this.selectedMonth = currentMonth;

    this.cardExpiryService.getCardYear().subscribe((data: number[]) => {
      this.cardYears = data;
    });

    this.cardExpiryService
      .getValidMonths(currentYear)
      .subscribe((data: number[]) => {
        this.cardMonths = data;
      });
  }

  toggleExpirySelector() {
    this.showExpirySelector = !this.showExpirySelector;
    if (this.showExpirySelector) {
      this.displayYear = this.selectedYear;
    }
  }

  navigateYear(direction: number) {
    this.displayYear += direction;
  }

  canNavigateToPreviousYear(): boolean {
    const currentYear = this.cardExpiryService.getThisYear();
    return this.displayYear > currentYear;
  }

  selectMonth(month: number) {
    if (this.isMonthSelectable(month)) {
      this.selectedMonth = month;
      this.selectedYear = this.displayYear;
      this.checkoutFormGroup.get('cardDetails.expiryMonth')?.setValue(month);
      this.checkoutFormGroup
        .get('cardDetails.expiryYear')
        ?.setValue(this.displayYear);
      this.updateCardExpiresValue();
      this.showExpirySelector = false;
    }
  }

  isMonthSelectable(month: number): boolean {
    const currentYear = this.cardExpiryService.getThisYear();
    const currentMonth = this.cardExpiryService.getCurrentMonth();

    if (this.displayYear > currentYear) {
      return true;
    } else if (this.displayYear === currentYear) {
      return month >= currentMonth;
    }
    return false;
  }

  // Check if a month is selected
  isMonthSelected(month: number): boolean {
    return (
      this.selectedMonth === month && this.selectedYear === this.displayYear
    );
  }

  // Get the month name from the month number
  getMonthName(month: number): string {
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return monthNames[month - 1];
  }

  // Update the card expires value and formatted display
  updateCardExpiresValue() {
    const month = +this.checkoutFormGroup.get('cardDetails.expiryMonth')?.value;
    const year = +this.checkoutFormGroup.get('cardDetails.expiryYear')?.value;

    if (month && year) {
      const formattedDate: string = this.cardExpiryService.formatExpiryDate(
        month,
        year
      );
      this.checkoutFormGroup
        .get('cardDetails.cardExpires')
        ?.setValue(formattedDate);
      this.formattedExpiryDate = formattedDate;
    }
  }

  getStates(countryCode: string, stateArray: State[]) {
    this.cardExpiryService.getProvinces(countryCode).subscribe(
      (data) => {
        stateArray.length = 0;
        data.forEach((state) => stateArray.push(state));
        console.log(
          `Retrieved states for ${countryCode}: ${JSON.stringify(data)}`
        );
      },
      (error) => {
        console.error(`Error retrieving states for ${countryCode}: ${error}`);
      }
    );
  }

  /**
   * Detects the card type based on the card number and sets the card type field
   * @param cardNumber The credit card number
   */
  detectAndSetCardType(cardNumber: string) {
    if (!cardNumber) {
      return;
    }

    // Remove any spaces or non-digit characters
    const cleanCardNumber = cardNumber.replace(/\D/g, '');

    // Only proceed if we have at least 4 digits (enough to identify card type)
    if (cleanCardNumber.length < 4) {
      return;
    }

    let cardType = 'Unknown';

    // Visa: Starts with 4
    if (/^4/.test(cleanCardNumber)) {
      cardType = 'Visa';
    }
    // Mastercard: Starts with 51-55 or 2221-2720
    else if (/^5[1-5]/.test(cleanCardNumber) ||
             /^(222[1-9]|22[3-9]|2[3-6]\d|27[0-1]\d|2720)/.test(cleanCardNumber)) {
      cardType = 'MasterCard';
    }
    // American Express: Starts with 34 or 37
    else if (/^3[47]/.test(cleanCardNumber)) {
      cardType = 'AmericanExpress';
    }

    // Set the card type in the form
    this.checkoutFormGroup.get('cardDetails.cardType')?.setValue(cardType);
  }
}
