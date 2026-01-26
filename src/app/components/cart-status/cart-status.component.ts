import { Component, OnInit, OnDestroy } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartItem } from '../../common/cart-item';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cart-status',
  imports: [CurrencyPipe, RouterLink, NgFor, NgIf],
  templateUrl: './cart-status.component.html',
  styleUrl: './cart-status.component.css',
})
export class CartStatusComponent implements OnInit, OnDestroy {
  totalPrice: number = 0.0;
  totalQuantity: number = 0;
  cartItems: CartItem[] = [];
  isHovering: boolean = false;

  private subscriptions: Subscription[] = [];

  constructor(private cartService: CartService) {}

  ngOnInit() {
    this.updateCartStatus();
  }

  ngOnDestroy() {
    // Unsubscribe from all subscriptions to prevent memory leaks
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  updateCartStatus(): void {
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

    // Subscribe to the cart items
    this.subscriptions.push(
      this.cartService.cartItemsSubject.subscribe(
        (data) => (this.cartItems = data),
      ),
    );
  }

  // Method to toggle hover state for testing on mobile
  toggleHover(): void {
    this.isHovering = !this.isHovering;
  }
}
