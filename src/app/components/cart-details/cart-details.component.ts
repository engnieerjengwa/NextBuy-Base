import { Component, OnInit, OnDestroy } from '@angular/core';
import { CartItem } from '../../common/cart-item';
import { CartService } from '../../services/cart.service';
import { CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cart-details',
  imports: [CurrencyPipe, NgFor, NgIf, RouterLink],
  templateUrl: './cart-details.component.html',
  standalone: true,
  styleUrl: './cart-details.component.css',
})
export class CartDetailsComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  totalPrice: number = 0.0;
  totalQuantity: number = 0;

  private subscriptions: Subscription[] = [];

  constructor(private cartService: CartService) {}

  ngOnInit() {
    this.listCartDetails();
  }

  ngOnDestroy() {
    // Unsubscribe from all subscriptions to prevent memory leaks
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private listCartDetails() {
    // Subscribe to the cart items
    this.subscriptions.push(
      this.cartService.cartItemsSubject.subscribe(
        (data) => (this.cartItems = data),
      ),
    );

    // Subscribe to the cart totalPrice
    this.subscriptions.push(
      this.cartService.totalPrice.subscribe((data) => (this.totalPrice = data)),
    );

    // Subscribe to the cart totalQuantity
    this.subscriptions.push(
      this.cartService.totalQuantity.subscribe(
        (data) => (this.totalQuantity = data),
      ),
    );

    this.cartService.computeCartTotals();
  }

  incrementItem(cartItem: CartItem) {
    this.cartService.incrementQuantity(cartItem);
  }

  decrementItem(cartItem: CartItem) {
    this.cartService.decrementQuantity(cartItem);
  }

  removeItem(cartItem: CartItem) {
    this.cartService.removeFromCart(cartItem);
  }
}
