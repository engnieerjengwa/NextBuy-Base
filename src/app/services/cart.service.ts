import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CartItem } from '../common/cart-item';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private _cartItems: CartItem[] = [];
  cartItemsSubject: BehaviorSubject<CartItem[]> = new BehaviorSubject<
    CartItem[]
  >([]);
  totalPrice: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  totalQuantity: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  storage: Storage | null = null;

  // Getter for cartItems to maintain backward compatibility
  get cartItems(): CartItem[] {
    return this._cartItems;
  }

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.storage = localStorage;
    }
    this.loadCartItems();
  }

  clearCart() {
    this._cartItems = [];
    this.cartItemsSubject.next([]);
    this.totalPrice.next(0);
    this.totalQuantity.next(0);
    this.storage?.removeItem('cartItems');
  }

  addToCart(theCartItem: CartItem) {
    let alreadyExistsInCart: boolean = false;
    let existingCartItem: CartItem | undefined = undefined;

    if (this._cartItems.length > 0) {
      existingCartItem = this._cartItems.find(
        (tempCartItem) => tempCartItem.id === theCartItem.id,
      );

      alreadyExistsInCart = existingCartItem != undefined;
    }
    if (alreadyExistsInCart && existingCartItem) {
      existingCartItem.quantity++;
    } else {
      this._cartItems.push(theCartItem);
    }

    this.cartItemsSubject.next([...this._cartItems]);
    this.computeCartTotals();
  }

  incrementQuantity(theCartItem: CartItem) {
    theCartItem.quantity++;
    this.cartItemsSubject.next([...this._cartItems]);
    this.computeCartTotals();
  }

  decrementQuantity(theCartItem: CartItem) {
    theCartItem.quantity--;

    if (theCartItem.quantity === 0) {
      this.removeFromCart(theCartItem);
    } else {
      this.cartItemsSubject.next([...this._cartItems]);
      this.computeCartTotals();
    }
  }

  removeFromCart(theCartItem: CartItem) {
    // get index of item in the array
    const itemIndex = this._cartItems.findIndex(
      (tempCartItem) => tempCartItem.id === theCartItem.id,
    );

    // if found, remove the item from the array at the given index
    if (itemIndex > -1) {
      this._cartItems.splice(itemIndex, 1);
      this.cartItemsSubject.next([...this._cartItems]);
      this.computeCartTotals();
    }
  }

  computeCartTotals() {
    let totalPriceValue: number = 0;
    let totalQuantityValue: number = 0;

    for (let currentCartItem of this.cartItems) {
      totalPriceValue += currentCartItem.quantity * currentCartItem.unitPrice;
      totalQuantityValue += currentCartItem.quantity;
    }

    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);

    // persist cart data
    this.persistCartItems();
  }

  persistCartItems() {
    this.storage?.setItem('cartItems', JSON.stringify(this._cartItems));
  }

  loadCartItems() {
    // read data from storage
    const data = this.storage?.getItem('cartItems') ?? null;

    if (data != null) {
      this._cartItems = JSON.parse(data);
      this.cartItemsSubject.next([...this._cartItems]);

      // compute totals based on the data that is read from storage
      this.computeCartTotals();
    }
    // No need for else clause as BehaviorSubject already has initial values
  }
}
