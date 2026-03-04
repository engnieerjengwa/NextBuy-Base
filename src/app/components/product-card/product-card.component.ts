import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../common/product';
import { WishlistService } from '../../services/wishlist.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css'],
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Input() showFireSaleBadge: boolean = false;
  @Input() showMoreDealsBadge: boolean = false;
  @Input() showAlotForLessBadge: boolean = false;
  @Input() currencyCode: string = 'USD';
  @Input() currencyPrefix: string = '$';
  @Input() lowStockThreshold: number = 20;
  @Input() showAddToCart: boolean = false;

  @Output() addToCartClicked = new EventEmitter<Product>();

  isInWishlist: boolean = false;
  wishlistLoading: boolean = false;

  constructor(
    private wishlistService: WishlistService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn() && this.product?.id) {
      this.wishlistService.isInWishlist(this.product.id).subscribe({
        next: (res) => (this.isInWishlist = res.inWishlist),
        error: () => {},
      });
    }
  }

  toggleWishlist(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    if (!this.authService.isLoggedIn() || this.wishlistLoading) return;

    this.wishlistLoading = true;
    if (this.isInWishlist) {
      this.wishlistService.removeFromWishlist(this.product.id).subscribe({
        next: () => {
          this.isInWishlist = false;
          this.wishlistLoading = false;
        },
        error: () => {
          this.wishlistLoading = false;
        },
      });
    } else {
      this.wishlistService.addToWishlist(this.product.id).subscribe({
        next: () => {
          this.isInWishlist = true;
          this.wishlistLoading = false;
        },
        error: () => {
          this.wishlistLoading = false;
        },
      });
    }
  }

  get hasDiscount(): boolean {
    return (
      !!this.product?.discountPercentage && this.product.discountPercentage > 0
    );
  }

  get discountBadgeText(): string {
    if (!this.hasDiscount) return '';
    return `${this.product.discountPercentage}% OFF`;
  }

  get hasOriginalPrice(): boolean {
    return (
      !!this.product?.originalPrice &&
      this.product.originalPrice > this.product.unitPrice
    );
  }

  get isLowStock(): boolean {
    return (
      this.product?.unitsInStock > 0 &&
      this.product.unitsInStock <= this.lowStockThreshold
    );
  }

  get hasVariants(): boolean {
    return false; // Extend when variants are loaded
  }

  get ratingDisplay(): string {
    if (!this.product?.averageRating) return '';
    return this.product.averageRating.toFixed(1);
  }

  onAddToCart(): void {
    this.addToCartClicked.emit(this.product);
  }
}
