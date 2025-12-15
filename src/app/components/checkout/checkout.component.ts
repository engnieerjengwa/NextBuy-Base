import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../common/cart-item';
import { CurrencyPipe, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe, NgFor, NgIf],
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

  constructor(
    private formBuilder: FormBuilder,
    private cartService: CartService
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
        expirationMonth: [''],
        expirationYear: [''],
      }),
    });

    // Subscribe to shipping address changes
    this.checkoutFormGroup
      .get('shippingAddress')
      ?.valueChanges.subscribe((value) => {
        if (this.sameAsShipping) {
          this.checkoutFormGroup.get('billingAddress')?.setValue(value);
        }
      });

    // Get cart items and totals
    this.cartItems = this.cartService.cartItems;
    this.cartService.totalPrice.subscribe((data) => (this.totalPrice = data));
    this.cartService.totalQuantity.subscribe(
      (data) => (this.totalQuantity = data)
    );
    this.cartService.computeCartTotals();
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
    } else {
      this.checkoutFormGroup.controls['billingAddress'].reset();
    }
  }

  toggleOrderReview() {
    this.showOrderReview = !this.showOrderReview;
  }

  getProductSubtotal(cartItem: CartItem): number {
    return cartItem.quantity * cartItem.unitPrice;
  }
}
