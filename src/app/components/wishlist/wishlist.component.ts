import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NexbuyCurrencyPipe } from '../../pipes/nexbuy-currency.pipe';
import { WishlistService } from '../../services/wishlist.service';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { Wishlist, WishlistItem } from '../../common/wishlist';
import { CartItem } from '../../common/cart-item';
import { Product } from '../../common/product';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink, NexbuyCurrencyPipe],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css',
})
export class WishlistComponent implements OnInit {
  wishlist: Wishlist | null = null;
  items: WishlistItem[] = [];
  loading: boolean = true;
  removingId: number | null = null;
  movingToCartId: number | null = null;

  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService,
    private productService: ProductService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    this.loadWishlist();
  }

  loadWishlist(): void {
    this.loading = true;
    this.wishlistService.getWishlist().subscribe({
      next: (data) => {
        this.wishlist = data;
        this.items = data.items || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading wishlist', err);
        this.loading = false;
      },
    });
  }

  removeItem(productId: number): void {
    this.removingId = productId;
    this.wishlistService.removeFromWishlist(productId).subscribe({
      next: () => {
        this.items = this.items.filter((item) => item.productId !== productId);
        this.removingId = null;
      },
      error: (err) => {
        console.error('Error removing item', err);
        this.removingId = null;
      },
    });
  }

  moveToCart(item: WishlistItem): void {
    this.movingToCartId = item.productId;
    this.productService.getProduct(item.productId).subscribe({
      next: (product: Product) => {
        const cartItem = new CartItem(product);
        this.cartService.addToCart(cartItem);
        this.removeItem(item.productId);
        this.movingToCartId = null;
      },
      error: (err) => {
        console.error('Error moving to cart', err);
        this.movingToCartId = null;
      },
    });
  }

  getStockClass(inStock: boolean): string {
    return inStock ? 'in-stock' : 'out-of-stock';
  }

  getStockLabel(inStock: boolean): string {
    return inStock ? 'In Stock' : 'Out of Stock';
  }
}
