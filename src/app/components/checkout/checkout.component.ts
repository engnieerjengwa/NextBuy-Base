import {
  Component,
  OnInit,
  HostListener,
  OnDestroy,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { CardExpiryService } from '../../services/card-expiry.service';
import { CheckoutService } from '../../services/checkout.service';
import { StripeService } from '../../services/stripe.service';
import { SavedAddressService } from '../../services/saved-address.service';
import { AuthService } from '../../services/auth.service';
import { SavedAddress } from '../../common/saved-address';
import {
  GuestCheckoutRequest,
  GuestAddress,
  GuestOrderItem,
} from '../../common/guest-checkout';
import { CartItem } from '../../common/cart-item';
import { CurrencyPipe, NgFor, NgIf, isPlatformBrowser } from '@angular/common';
import { Country } from '../../common/country';
import { State } from '../../common/state';
import { Order } from '../../common/order';
import { OrderItem } from '../../common/order-item';
import { Purchase } from '../../common/purchase';
import { PaymentInfo } from '../../common/payment-info';
import { Router, RouterLink } from '@angular/router';
import { CustomValidators } from '../../validators/custom-validators';
import { Subscription } from 'rxjs';
import { Stripe } from '@stripe/stripe-js';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe, NgFor, NgIf, RouterLink],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent implements OnInit, OnDestroy {
  checkoutFormGroup!: FormGroup;
  sameAsShipping: boolean = false;
  cartItems: CartItem[] = [];
  totalPrice: number = 0;
  totalQuantity: number = 0;
  showOrderReview: boolean = false;
  sendEmailReceipt: boolean = true;

  // Wizard step management
  currentStep: number = 1;
  totalSteps: number = 4;
  stepLabels: string[] = ['Address', 'Delivery', 'Payment', 'Review'];

  // Saved addresses
  savedAddresses: SavedAddress[] = [];
  selectedSavedAddressId: number | null = null;
  useNewAddress: boolean = true;

  // Delivery method
  selectedDeliveryMethod: string = 'standard';

  // Guest checkout
  isGuestMode: boolean = false;

  // Stripe related properties
  stripe!: Stripe;
  paymentElement: any = null;
  elements: any = null;
  paymentInfo: PaymentInfo = new PaymentInfo(0, 'USD');
  isProcessingPayment: boolean = false;
  paymentError: string = '';
  private subscriptions: Subscription[] = [];

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
    private cardExpiryService: CardExpiryService,
    private checkoutService: CheckoutService,
    private stripeService: StripeService,
    private savedAddressService: SavedAddressService,
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit() {
    // Determine if guest mode
    this.isGuestMode = !this.authService.isLoggedIn();

    // Get user details from session storage (SSR-safe)
    let userNameJson: string | null = null;
    let userEmailJson: string | null = null;
    if (isPlatformBrowser(this.platformId) && !this.isGuestMode) {
      userNameJson = sessionStorage.getItem('userName');
      userEmailJson = sessionStorage.getItem('userEmail');
    }

    // Parse user details
    let firstName = '';
    let lastName = '';
    let email = '';

    if (userNameJson) {
      const userName = JSON.parse(userNameJson);
      if (userName) {
        // Check if userName contains a space (indicating first and last name)
        const nameParts = userName.split(' ');
        firstName = nameParts[0] || '';
        lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      }
    }

    if (userEmailJson) {
      email = JSON.parse(userEmailJson) || '';
    }

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl(firstName, [
          Validators.required,
          Validators.minLength(2),
          CustomValidators.whiteSpaceValidator,
        ]),
        lastName: new FormControl(lastName, [
          Validators.required,
          Validators.minLength(2),
          CustomValidators.whiteSpaceValidator,
        ]),
        email: new FormControl(email, [
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
    });

    const shippingAddressCountryValueChanges = this.checkoutFormGroup.get(
      'shippingAddress.country',
    )?.valueChanges;

    if (shippingAddressCountryValueChanges) {
      this.subscriptions.push(
        shippingAddressCountryValueChanges.subscribe((country) => {
          this.getStates(country.code, this.shippingAddressStates);
        }),
      );
    }

    const billingAddressValueChanges = this.checkoutFormGroup.get(
      'billingAddress.country',
    )?.valueChanges;

    if (billingAddressValueChanges) {
      this.subscriptions.push(
        billingAddressValueChanges.subscribe((country) => {
          this.getStates(country.code, this.billingAddressStates);
        }),
      );
    }

    // Subscribe to shipping address changes
    const shippingAddressValueChanges =
      this.checkoutFormGroup.get('shippingAddress')?.valueChanges;

    if (shippingAddressValueChanges) {
      this.subscriptions.push(
        shippingAddressValueChanges.subscribe((value) => {
          if (this.sameAsShipping) {
            this.checkoutFormGroup.get('billingAddress')?.setValue(value);
            this.billingAddressStates = this.shippingAddressStates;
          }
        }),
      );
    }

    // Get cart items and totals
    this.subscriptions.push(
      this.cartService.cartItemsSubject.subscribe(
        (data) => (this.cartItems = data),
      ),
    );
    this.subscriptions.push(
      this.cartService.totalPrice.subscribe((data) => {
        this.totalPrice = data;
        this.paymentInfo.amount = Math.round(this.totalPrice * 100);
      }),
    );
    this.subscriptions.push(
      this.cartService.totalQuantity.subscribe(
        (data) => (this.totalQuantity = data),
      ),
    );
    this.cartService.computeCartTotals();

    // Populate countries
    this.subscriptions.push(
      this.cardExpiryService.getCountries().subscribe((data) => {
        this.countries = data;

        // Initialize Stripe payment element after form is initialized
        setTimeout(() => this.setupStripePaymentElement(), 1000);
      }),
    );

    // Load saved addresses
    this.loadSavedAddresses();
  }

  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  /**
   * Toggle email receipt option
   * @param event The change event from the checkbox
   */
  toggleEmailReceipt(event: any) {
    this.sendEmailReceipt = event.target.checked;

    // If payment element is already initialized, we need to reinitialize it
    // with the updated receipt email setting
    if (this.stripe && this.elements) {
      this.setupStripePaymentElement();
    }
  }

  /**
   * Initialize Stripe payment elements
   */
  private setupStripePaymentElement() {
    this.isProcessingPayment = true;
    this.paymentError = '';

    // Validate payment amount
    if (this.paymentInfo.amount <= 0) {
      console.error('Payment amount must be greater than 0');
      this.paymentError =
        'Invalid payment amount. Please add items to your cart.';
      this.isProcessingPayment = false;
      return;
    }

    // Set receipt email if the option is enabled
    if (this.sendEmailReceipt) {
      const customerEmail = this.checkoutFormGroup.get('customer.email')?.value;
      if (customerEmail) {
        this.paymentInfo.receiptEmail = customerEmail;
      }
    } else {
      // Clear receipt email if the option is disabled
      this.paymentInfo.receiptEmail = undefined;
    }

    // Create PaymentIntent on the server
    this.checkoutService.createPaymentIntent(this.paymentInfo).subscribe({
      next: (paymentIntentResponse) => {
        // Initialize Stripe elements with the client secret
        this.stripeService
          .initializePaymentElement(
            paymentIntentResponse.client_secret,
            'payment-element',
          )
          .then(({ stripe, elements, paymentElement }) => {
            this.stripe = stripe;
            this.elements = elements;
            this.paymentElement = paymentElement;
            this.isProcessingPayment = false;
          })
          .catch((error) => {
            console.error('Error initializing Stripe elements:', error);
            this.paymentError =
              'Failed to initialize payment system. Please try again later.';
            this.isProcessingPayment = false;
          });
      },
      error: (err) => {
        console.error('Error creating payment intent:', err);
        this.paymentError =
          'Failed to initialize payment. Please try again later.';
        this.isProcessingPayment = false;
      },
    });
  }

  onSubmit() {
    console.log('Handling the submit button');

    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    // If Stripe elements are not initialized, initialize them
    if (!this.stripe || !this.elements) {
      this.setupStripePaymentElement();
      return;
    }

    this.isProcessingPayment = true;
    this.paymentError = '';

    // Process payment with Stripe
    this.processPayment()
      .then((paymentResult) => {
        if (paymentResult.error) {
          // Show error to customer
          this.paymentError =
            paymentResult.error.message ||
            'An error occurred during payment processing.';
          this.isProcessingPayment = false;
          console.error('Payment failed:', paymentResult.error);
        } else if (
          paymentResult.paymentIntent &&
          paymentResult.paymentIntent.status === 'succeeded'
        ) {
          // Payment succeeded, update UI and place the order
          this.isProcessingPayment = false;
          this.placeOrder();
        } else {
          // Payment requires additional action or is processing
          this.handlePaymentStatus(paymentResult);
        }
      })
      .catch((error) => {
        console.error('Error processing payment:', error);
        this.paymentError =
          'An unexpected error occurred during payment processing.';
        this.isProcessingPayment = false;
      });
  }

  /**
   * Process the payment with Stripe
   * @returns Promise that resolves with the payment result
   */
  private async processPayment(): Promise<any> {
    if (!this.stripe || !this.elements) {
      throw new Error('Stripe not initialized');
    }

    // Get the current origin for the return URL
    const returnUrl = window.location.origin + '/order-confirmation';

    // Confirm the payment with Stripe
    return this.stripeService.confirmPayment(
      this.stripe,
      this.elements,
      '', // Client secret is already in the elements
      returnUrl,
    );
  }

  /**
   * Handle different payment statuses
   * @param paymentResult The result from Stripe payment processing
   */
  private handlePaymentStatus(paymentResult: any) {
    if (!paymentResult.paymentIntent) {
      this.paymentError = 'Payment failed. Please try again.';
      this.isProcessingPayment = false;
      return;
    }

    const status = paymentResult.paymentIntent.status;

    switch (status) {
      case 'requires_payment_method':
        this.paymentError =
          'Your payment was not successful. Please try again.';
        break;
      case 'requires_action':
        this.paymentError =
          'Additional authentication required. Please follow the instructions.';
        break;
      case 'processing':
        this.paymentError =
          "Your payment is processing. We'll update you when it completes.";
        break;
      default:
        this.paymentError = 'Payment status: ' + status;
    }

    this.isProcessingPayment = false;
  }

  /**
   * Place the order after successful payment
   */
  private placeOrder() {
    // Capture email before resetting form
    const customerEmail =
      this.checkoutFormGroup.get('customer.email')?.value || '';

    if (this.isGuestMode) {
      this.placeGuestOrder(customerEmail);
      return;
    }

    let order = new Order();
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;

    const cartItems = this.cartItems;

    let orderItems: OrderItem[] = cartItems.map((cartItem) => {
      return new OrderItem(cartItem);
    });

    let purchase = new Purchase();

    purchase.customer = this.checkoutFormGroup.controls['customer'].value;

    // Populate purchase - shipping address
    purchase.shippingAddress =
      this.checkoutFormGroup.controls['shippingAddress'].value;
    if (purchase.shippingAddress) {
      if (purchase.shippingAddress.state) {
        const shippingState: State = JSON.parse(
          JSON.stringify(purchase.shippingAddress.state),
        );
        purchase.shippingAddress.state = shippingState.name;
      }
      if (purchase.shippingAddress.country) {
        const shippingCountry: Country = JSON.parse(
          JSON.stringify(purchase.shippingAddress.country),
        );
        purchase.shippingAddress.country = shippingCountry.name;
      }
    }

    // Populate purchase - billing address
    purchase.billingAddress =
      this.checkoutFormGroup.controls['billingAddress'].value;
    if (purchase.billingAddress) {
      if (purchase.billingAddress.state) {
        const billingState: State = JSON.parse(
          JSON.stringify(purchase.billingAddress.state),
        );
        purchase.billingAddress.state = billingState.name;
      }
      if (purchase.billingAddress.country) {
        const billingCountry: Country = JSON.parse(
          JSON.stringify(purchase.billingAddress.country),
        );
        purchase.billingAddress.country = billingCountry.name;
      }
    }

    // Populate purchase - order and orderItems
    purchase.order = order;
    purchase.orderItems = orderItems;

    this.checkoutService.placeOrder(purchase).subscribe({
      next: (response) => {
        // Navigate to order confirmation page with order details
        this.router.navigate(['/order-confirmation'], {
          queryParams: {
            tracking: response.orderTrackingNumber,
            total: this.totalPrice,
            qty: this.totalQuantity,
            email: customerEmail,
          },
        });
        this.resetCart();
      },
      error: (err) => {
        console.error('Error during checkout:', err);

        let errorMessage = 'An unexpected error occurred during checkout.';

        if (err.error && err.error.message) {
          errorMessage = err.error.message;
        } else if (err.message) {
          errorMessage = err.message;
        }

        this.paymentError = `There was an error processing your order: ${errorMessage}`;
        this.isProcessingPayment = false;
      },
    });
  }

  resetCart() {
    this.cartService.clearCart();

    this.checkoutFormGroup.reset();

    this.checkoutFormGroup.get('customer')?.reset();
    this.checkoutFormGroup.get('shippingAddress')?.reset();
    this.checkoutFormGroup.get('billingAddress')?.reset();

    this.stripe = null as unknown as Stripe;
    this.elements = null;
    this.paymentElement = null;
    this.isProcessingPayment = false;
    this.paymentError = '';
    this.paymentInfo = new PaymentInfo(0, 'USD');

    this.sameAsShipping = false;
    this.showOrderReview = false;
    this.showExpirySelector = false;
    this.formattedExpiryDate = '';
    this.shippingAddressStates = [];
    this.billingAddressStates = [];
    this.sendEmailReceipt = true;
  }

  /**
   * Place order as guest (no authentication)
   */
  private placeGuestOrder(customerEmail: string) {
    const customer = this.checkoutFormGroup.controls['customer'].value;
    const shippingFormValue =
      this.checkoutFormGroup.controls['shippingAddress'].value;
    const billingFormValue =
      this.checkoutFormGroup.controls['billingAddress'].value;

    const shippingAddress: GuestAddress = {
      street: shippingFormValue.street,
      city: shippingFormValue.city,
      state:
        typeof shippingFormValue.state === 'object'
          ? shippingFormValue.state.name
          : shippingFormValue.state,
      country:
        typeof shippingFormValue.country === 'object'
          ? shippingFormValue.country.name
          : shippingFormValue.country,
      zipCode: shippingFormValue.zipCode,
    };

    const billingAddress: GuestAddress = {
      street: billingFormValue.street,
      city: billingFormValue.city,
      state:
        typeof billingFormValue.state === 'object'
          ? billingFormValue.state.name
          : billingFormValue.state,
      country:
        typeof billingFormValue.country === 'object'
          ? billingFormValue.country.name
          : billingFormValue.country,
      zipCode: billingFormValue.zipCode,
    };

    const guestOrderItems: GuestOrderItem[] = this.cartItems.map((item) => ({
      imageUrl: item.imageUrl,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      productId: item.id,
    }));

    const guestRequest: GuestCheckoutRequest = {
      email: customerEmail,
      firstName: customer.firstName,
      lastName: customer.lastName,
      shippingAddress,
      billingAddress,
      totalPrice: this.totalPrice,
      totalQuantity: this.totalQuantity,
      orderItems: guestOrderItems,
    };

    this.checkoutService.placeGuestOrder(guestRequest).subscribe({
      next: (response) => {
        this.router.navigate(['/order-confirmation'], {
          queryParams: {
            tracking: response.orderTrackingNumber,
            total: this.totalPrice,
            qty: this.totalQuantity,
            email: customerEmail,
          },
        });
        this.resetCart();
      },
      error: (err) => {
        console.error('Error during guest checkout:', err);
        let errorMessage = 'An unexpected error occurred during checkout.';
        if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (err.message) {
          errorMessage = err.message;
        }
        this.paymentError = `There was an error processing your order: ${errorMessage}`;
        this.isProcessingPayment = false;
      },
    });
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
        this.checkoutFormGroup.controls['shippingAddress'].value,
      );
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

  getStates(countryCode: string, stateArray: State[]) {
    this.cardExpiryService.getProvinces(countryCode).subscribe(
      (data) => {
        stateArray.length = 0;
        data.forEach((state) => stateArray.push(state));
        console.log(
          `Retrieved states for ${countryCode}: ${JSON.stringify(data)}`,
        );
      },
      (error) => {
        console.error(`Error retrieving states for ${countryCode}: ${error}`);
      },
    );
  }

  toggleExpirySelector() {
    this.showExpirySelector = !this.showExpirySelector;
  }

  // Wizard step navigation
  goToStep(step: number) {
    if (step < 1 || step > this.totalSteps) return;

    // Validate current step before advancing
    if (step > this.currentStep && !this.isStepValid(this.currentStep)) {
      this.markCurrentStepTouched();
      return;
    }

    this.currentStep = step;

    // Initialize Stripe when entering payment step
    if (step === 3 && (!this.stripe || !this.elements)) {
      setTimeout(() => this.setupStripePaymentElement(), 500);
    }
  }

  nextStep() {
    this.goToStep(this.currentStep + 1);
  }

  prevStep() {
    this.goToStep(this.currentStep - 1);
  }

  isStepValid(step: number): boolean {
    switch (step) {
      case 1: // Address
        const customer = this.checkoutFormGroup.get('customer');
        const shipping = this.checkoutFormGroup.get('shippingAddress');
        const billing = this.checkoutFormGroup.get('billingAddress');
        return !!(customer?.valid && shipping?.valid && billing?.valid);
      case 2: // Delivery
        return true; // Delivery method always has a selection
      case 3: // Payment
        return !this.isProcessingPayment;
      case 4: // Review
        return true;
      default:
        return false;
    }
  }

  markCurrentStepTouched() {
    switch (this.currentStep) {
      case 1:
        this.checkoutFormGroup.get('customer')?.markAllAsTouched();
        this.checkoutFormGroup.get('shippingAddress')?.markAllAsTouched();
        if (!this.sameAsShipping) {
          this.checkoutFormGroup.get('billingAddress')?.markAllAsTouched();
        }
        break;
    }
  }

  isStepComplete(step: number): boolean {
    return step < this.currentStep;
  }

  // Saved addresses
  loadSavedAddresses() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.isGuestMode) return;

    const userEmail = sessionStorage.getItem('userEmail');
    if (!userEmail) return;

    this.savedAddressService.getAddresses().subscribe({
      next: (addresses) => {
        this.savedAddresses = addresses;
        // Auto-select default address if available
        const defaultAddr = addresses.find((a) => a.isDefault);
        if (defaultAddr) {
          this.selectSavedAddress(defaultAddr);
        }
      },
      error: () => {
        // Silently fail - user can enter address manually
      },
    });
  }

  selectSavedAddress(address: SavedAddress) {
    this.selectedSavedAddressId = address.id;
    this.useNewAddress = false;

    // Populate shipping address form
    this.checkoutFormGroup.get('shippingAddress')?.patchValue({
      street: address.street,
      city: address.city,
      zipCode: address.zipCode,
    });

    // Find and set country
    const matchedCountry = this.countries.find(
      (c) => c.name === address.country,
    );
    if (matchedCountry) {
      this.checkoutFormGroup
        .get('shippingAddress.country')
        ?.setValue(matchedCountry);
    }
  }

  useManualAddress() {
    this.useNewAddress = true;
    this.selectedSavedAddressId = null;
  }

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
}
