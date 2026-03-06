import { Component, OnInit, OnDestroy } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { NexbuyCurrencyPipe } from '../../pipes/nexbuy-currency.pipe';
import { CartItem } from '../../common/cart-item';
import { Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-cart-status',
  imports: [NexbuyCurrencyPipe, RouterLink, NgFor, NgIf, TranslateModule],
  templateUrl: './cart-status.component.html',
  styleUrl: './cart-status.component.css',
})
export class CartStatusComponent implements OnInit, OnDestroy {
  totalPrice: number = 0.0;
  totalQuantity: number = 0;
  cartItems: CartItem[] = [];
  isHovering: boolean = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private cartService: CartService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.updateCartStatus();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    if (this.hideDropdownTimer) {
      clearTimeout(this.hideDropdownTimer);
      this.hideDropdownTimer = null;
    }
  }

  updateCartStatus(): void {
    this.subscriptions.push(
      this.cartService.totalPrice.subscribe((data) => (this.totalPrice = data)),
    );

    this.subscriptions.push(
      this.cartService.totalQuantity.subscribe(
        (data) => (this.totalQuantity = data),
      ),
    );

    this.subscriptions.push(
      this.cartService.cartItemsSubject.subscribe(
        (data) => (this.cartItems = data),
      ),
    );
  }

  toggleHover(): void {
    this.isHovering = !this.isHovering;
  }

  closeDropdown(): void {
    this.isHovering = false;
    if (this.hideDropdownTimer) {
      clearTimeout(this.hideDropdownTimer);
      this.hideDropdownTimer = null;
    }
  }

  private hideDropdownTimer: any;

  handleMouseEnter(): void {
    if (this.hideDropdownTimer) {
      clearTimeout(this.hideDropdownTimer);
      this.hideDropdownTimer = null;
    }
    this.isHovering = true;
  }

  handleMouseLeave(): void {
    this.hideDropdownTimer = setTimeout(() => {
      this.isHovering = false;
    }, 400);
  }
}
