import { Component, OnInit, OnDestroy } from '@angular/core';
import { CartItem } from '../../common/cart-item';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { NgFor, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NexbuyCurrencyPipe } from '../../pipes/nexbuy-currency.pipe';
import { Subscription } from 'rxjs';
import {
  CouponService,
  CouponApplyResponse,
} from '../../services/coupon.service';
import {
  DeliveryService,
  DeliveryBreakdown,
} from '../../services/delivery.service';
import { SavedAddressService } from '../../services/saved-address.service';
import { SavedAddress } from '../../common/saved-address';

@Component({
  selector: 'app-cart-details',
  imports: [NexbuyCurrencyPipe, NgFor, NgIf, RouterLink, FormsModule],
  templateUrl: './cart-details.component.html',
  standalone: true,
  styleUrl: './cart-details.component.css',
})
export class CartDetailsComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  totalPrice: number = 0.0;
  totalQuantity: number = 0;

  // Delivery location
  deliveryProvince: string = '';
  deliveryCity: string = '';
  availableProvinces: string[] = [];
  availableCities: string[] = [];
  deliveryBreakdown: DeliveryBreakdown | null = null;
  deliveryLocationSet: boolean = false;

  // Saved addresses
  isUserLoggedIn: boolean = false;
  savedAddresses: SavedAddress[] = [];
  selectedAddressId: number | null = null;
  useManualAddress: boolean = false;

  // Voucher / Coupon
  voucherCode: string = '';
  voucherMessage: string = '';
  voucherError: boolean = false;
  voucherApplied: boolean = false;
  appliedCoupon: CouponApplyResponse | null = null;
  voucherLoading: boolean = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private cartService: CartService,
    private couponService: CouponService,
    private authService: AuthService,
    private router: Router,
    private deliveryService: DeliveryService,
    private savedAddressService: SavedAddressService,
  ) {
    this.availableProvinces = this.deliveryService.provinces;
  }

  ngOnInit() {
    this.isUserLoggedIn = this.authService.isLoggedIn();
    this.listCartDetails();
    this.loadSavedAddresses();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  // ---- Saved addresses & delivery location ----

  /** Load all saved addresses and auto-select the default one */
  private loadSavedAddresses(): void {
    if (!this.isUserLoggedIn) {
      return;
    }
    this.subscriptions.push(
      this.savedAddressService.getAddresses().subscribe({
        next: (addresses) => {
          this.savedAddresses = addresses;
          if (addresses.length > 0) {
            // Pick default address, or most recent (first in list)
            const defaultAddr =
              addresses.find((a) => a.isDefault) || addresses[0];
            this.selectSavedAddress(defaultAddr);
          } else {
            // No saved addresses - fall through to manual entry
            this.useManualAddress = true;
          }
        },
        error: () => {
          this.useManualAddress = true;
        },
      }),
    );
  }

  /** When the user picks a saved address from the dropdown */
  onSavedAddressChange(): void {
    if (!this.selectedAddressId) {
      return;
    }
    const addr = this.savedAddresses.find(
      (a) => a.id === this.selectedAddressId,
    );
    if (addr) {
      this.selectSavedAddress(addr);
    }
  }

  /** Apply a saved address to the delivery location fields */
  private selectSavedAddress(address: SavedAddress): void {
    this.selectedAddressId = address.id;
    this.useManualAddress = false;
    this.deliveryProvince = address.province || '';
    this.onProvinceChange();
    // setTimeout so cities list is populated before we set city
    setTimeout(() => {
      this.deliveryCity = address.city || '';
      this.recalculateDelivery();
    });
  }

  /** User opts to enter a different location manually */
  switchToManualAddress(): void {
    this.useManualAddress = true;
    this.selectedAddressId = null;
    this.deliveryProvince = '';
    this.deliveryCity = '';
    this.availableCities = [];
    this.deliveryLocationSet = false;
    this.deliveryBreakdown = null;
  }

  /** User switches back to choosing a saved address */
  switchToSavedAddress(): void {
    this.useManualAddress = false;
    // Re-select previously selected or default
    if (this.savedAddresses.length > 0) {
      const addr =
        this.savedAddresses.find((a) => a.id === this.selectedAddressId) ||
        this.savedAddresses.find((a) => a.isDefault) ||
        this.savedAddresses[0];
      this.selectSavedAddress(addr);
    }
  }

  get selectedAddress(): SavedAddress | null {
    if (!this.selectedAddressId) return null;
    return (
      this.savedAddresses.find((a) => a.id === this.selectedAddressId) || null
    );
  }

  onProvinceChange(): void {
    this.availableCities = this.deliveryService.getCitiesForProvince(
      this.deliveryProvince,
    );
    // Auto-select first city if only one, or reset
    if (this.availableCities.length === 1) {
      this.deliveryCity = this.availableCities[0];
    } else {
      this.deliveryCity = '';
    }
    this.recalculateDelivery();
  }

  onCityChange(): void {
    this.recalculateDelivery();
  }

  recalculateDelivery(): void {
    if (this.deliveryProvince) {
      this.deliveryLocationSet = true;
      const subtotal = this.subtotalAfterDiscount;
      this.deliveryBreakdown = this.deliveryService.calculateDelivery(
        this.cartItems,
        subtotal,
        this.deliveryProvince,
        this.deliveryCity || this.deliveryProvince,
      );
    } else {
      this.deliveryLocationSet = false;
      this.deliveryBreakdown = null;
    }
  }

  // ---- Cart list ----

  private listCartDetails() {
    this.subscriptions.push(
      this.cartService.cartItemsSubject.subscribe((data) => {
        this.cartItems = data;
        this.recalculateDelivery();
      }),
    );

    this.subscriptions.push(
      this.cartService.totalPrice.subscribe((data) => {
        this.totalPrice = data;
        this.recalculateDelivery();
      }),
    );

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

  // ---- Voucher ----

  applyVoucher() {
    if (!this.voucherCode.trim()) return;
    this.voucherLoading = true;
    this.voucherMessage = '';
    this.voucherError = false;

    this.couponService
      .applyCoupon(this.voucherCode.trim(), this.totalPrice)
      .subscribe({
        next: (response) => {
          this.appliedCoupon = response;
          this.voucherApplied = true;
          this.voucherMessage = response.message;
          this.voucherError = false;
          this.voucherLoading = false;
          this.recalculateDelivery();
        },
        error: (err) => {
          this.voucherMessage =
            err.error?.message || 'Invalid voucher code. Please try again.';
          this.voucherError = true;
          this.voucherApplied = false;
          this.appliedCoupon = null;
          this.voucherLoading = false;
        },
      });
  }

  removeVoucher() {
    this.voucherCode = '';
    this.voucherMessage = '';
    this.voucherError = false;
    this.voucherApplied = false;
    this.appliedCoupon = null;
    this.recalculateDelivery();
  }

  // ---- Computed values ----

  get subtotalAfterDiscount(): number {
    if (this.appliedCoupon) {
      return this.appliedCoupon.finalAmount;
    }
    return this.totalPrice;
  }

  get discountAmount(): number {
    if (this.appliedCoupon) {
      return this.appliedCoupon.discountAmount;
    }
    return 0;
  }

  get deliveryCost(): number {
    return this.deliveryBreakdown?.totalDeliveryCost ?? 0;
  }

  get finalPrice(): number {
    return this.subtotalAfterDiscount + this.deliveryCost;
  }

  get amountToFreeDelivery(): number {
    if (!this.deliveryLocationSet) return 0;
    // Only relevant for same-province
    const sellerProv = (
      this.cartItems[0]?.sellerProvince || 'Harare'
    ).toLowerCase();
    if (sellerProv !== this.deliveryProvince.toLowerCase()) return 0;
    return Math.max(
      0,
      this.deliveryService.FREE_DELIVERY_THRESHOLD - this.subtotalAfterDiscount,
    );
  }

  get deliveryProgressPercent(): number {
    if (!this.deliveryLocationSet) return 0;
    const sellerProv = (
      this.cartItems[0]?.sellerProvince || 'Harare'
    ).toLowerCase();
    if (sellerProv !== this.deliveryProvince.toLowerCase()) return 0;
    return Math.min(
      100,
      (this.subtotalAfterDiscount /
        this.deliveryService.FREE_DELIVERY_THRESHOLD) *
        100,
    );
  }

  get isSameProvince(): boolean {
    if (!this.deliveryLocationSet || !this.cartItems.length) return false;
    const sellerProv = (
      this.cartItems[0]?.sellerProvince || 'Harare'
    ).toLowerCase();
    return sellerProv === this.deliveryProvince.toLowerCase();
  }

  get freeDeliveryThreshold(): number {
    return this.deliveryService.FREE_DELIVERY_THRESHOLD;
  }

  // ---- Navigation ----

  proceedToCheckout(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/checkout']);
    } else {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/checkout' },
      });
    }
  }
}
