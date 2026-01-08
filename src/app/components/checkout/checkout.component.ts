import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { CardExpiryService } from '../../services/card-expiry.service';
import { CartItem } from '../../common/cart-item';
import { CurrencyPipe, NgFor, NgIf, NgClass } from '@angular/common';
import { Country } from '../../common/country';
import { State } from '../../common/state';

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

    if (this.showExpirySelector &&
        expirySelector &&
        expiryDisplay &&
        !expirySelector.contains(target) &&
        !expiryDisplay.contains(target)) {
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
        firstName: [''],
        lastName: [''],
        email: [''],
      }),
      shippingAddress: this.formBuilder.group({
        country: [''],
        state: [''],
        city: [''],
        street: [''],
        zipCode: [''],
      }),
      billingAddress: this.formBuilder.group({
        country: [''],
        state: [''],
        city: [''],
        street: [''],
        zipCode: [''],
      }),
      cardDetails: this.formBuilder.group({
        cardType: [''],
        nameOnCard: [''],
        cardNumber: [''],
        securityCode: [''],
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
      ?.valueChanges.subscribe(
        country => {
          this.getStates(country.code, this.shippingAddressStates);
        }
      );

    // Subscribe to billing address country changes
    this.checkoutFormGroup
      .get('billingAddress.country')
      ?.valueChanges.subscribe(
        country => {
          this.getStates(country.code, this.billingAddressStates);
        }
      );

    // Subscribe to shipping address changes
    this.checkoutFormGroup
      .get('shippingAddress')
      ?.valueChanges.subscribe((value) => {
        if (this.sameAsShipping) {
          this.checkoutFormGroup.get('billingAddress')?.setValue(value);
          this.billingAddressStates = this.shippingAddressStates;
        }
      });

    // Get cart items and totals
    this.cartItems = this.cartService.cartItems;
    this.cartService.totalPrice.subscribe((data) => (this.totalPrice = data));
    this.cartService.totalQuantity.subscribe(
      (data) => (this.totalQuantity = data)
    );
    this.cartService.computeCartTotals();

    // Populate countries
    this.cardExpiryService.getCountries().subscribe(
      data => {
        this.countries = data;
        console.log('Retrieved countries: ' + JSON.stringify(data));
      }
    );
  }

  onSubmit() {
    console.log('Handling the submit button');
    console.log(this.checkoutFormGroup.get('customer')?.value);
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

  // Set up card expiry data (months and years)
  setupCardExpiryData() {
    const currentYear: number = this.cardExpiryService.getThisYear();
    const currentMonth: number = this.cardExpiryService.getCurrentMonth();

    this.displayYear = currentYear;
    this.selectedYear = currentYear;
    this.selectedMonth = currentMonth;

    this.cardExpiryService.getCardYear().subscribe(
      (data: number[]) => {
        this.cardYears = data;
      }
    );

    this.cardExpiryService.getValidMonths(currentYear).subscribe(
      (data: number[]) => {
        this.cardMonths = data;
      }
    );
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
      this.checkoutFormGroup.get('cardDetails.expiryYear')?.setValue(this.displayYear);
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
    return this.selectedMonth === month && this.selectedYear === this.displayYear;
  }

  // Get the month name from the month number
  getMonthName(month: number): string {
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr',
      'May', 'Jun', 'Jul', 'Aug',
      'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return monthNames[month - 1];
  }

  // Update the card expires value and formatted display
  updateCardExpiresValue() {
    const month = +this.checkoutFormGroup.get('cardDetails.expiryMonth')?.value;
    const year = +this.checkoutFormGroup.get('cardDetails.expiryYear')?.value;

    if (month && year) {
      const formattedDate: string = this.cardExpiryService.formatExpiryDate(month, year);
      this.checkoutFormGroup.get('cardDetails.cardExpires')?.setValue(formattedDate);
      this.formattedExpiryDate = formattedDate;
    }
  }

  /**
   * Get states/provinces for the given country code
   * @param countryCode The country code to get states for
   * @param stateArray The array to populate with states
   */
  getStates(countryCode: string, stateArray: State[]) {
    this.cardExpiryService.getProvinces(countryCode).subscribe(
      data => {
        stateArray.length = 0; // Clear the array
        data.forEach(state => stateArray.push(state));
        console.log(`Retrieved states for ${countryCode}: ${JSON.stringify(data)}`);
      },
      error => {
        console.error(`Error retrieving states for ${countryCode}: ${error}`);
      }
    );
  }
}
