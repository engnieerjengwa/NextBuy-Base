import { Component } from '@angular/core';
import { Product, ProductImage, ProductVariant } from '../../common/product';
import { ProductService } from '../../services/product.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIf, NgClass, DecimalPipe, DatePipe } from '@angular/common';
import { NexbuyCurrencyPipe } from '../../pipes/nexbuy-currency.pipe';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../common/cart-item';
import { ImageGalleryComponent } from '../image-gallery/image-gallery.component';
import { VariantSelectorComponent } from '../variant-selector/variant-selector.component';
import { BrowsingHistoryService } from '../../services/browsing-history.service';
import { WishlistService } from '../../services/wishlist.service';
import { ReviewListComponent } from '../review-list/review-list.component';
import { ProductQaComponent } from '../product-qa/product-qa.component';
import { StockNotificationComponent } from '../stock-notification/stock-notification.component';
import { PreorderService } from '../../services/preorder.service';
import { PreOrderBadgeComponent } from '../pre-order-badge/pre-order-badge.component';
import { FrequentlyBoughtTogetherComponent } from '../frequently-bought-together/frequently-bought-together.component';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-product-details',
  imports: [
    NexbuyCurrencyPipe,
    DecimalPipe,
    DatePipe,
    RouterLink,
    NgIf,
    NgClass,
    ImageGalleryComponent,
    VariantSelectorComponent,
    ReviewListComponent,
    ProductQaComponent,
    StockNotificationComponent,
    PreOrderBadgeComponent,
    FrequentlyBoughtTogetherComponent,
  ],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css',
})
export class ProductDetailsComponent {
  product!: Product;
  productImages: ProductImage[] = [];
  productVariants: ProductVariant[] = [];
  selectedVariant: ProductVariant | null = null;
  quantity: number = 1;
  isInWishlist: boolean = false;
  wishlistLoading: boolean = false;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private browsingHistoryService: BrowsingHistoryService,
    private wishlistService: WishlistService,
    private preorderService: PreorderService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(() => {
      this.handleProductDetails();
    });
  }

  handleProductDetails() {
    const theProductId: number = +this.route.snapshot.paramMap.get('id')!;

    this.productService.getProduct(theProductId).subscribe((data) => {
      this.product = data;
      this.quantity = 1;
      this.selectedVariant = null;

      // Track browsing history
      this.browsingHistoryService.addToHistory(theProductId);

      // Load product images
      this.productService.getProductImages(theProductId).subscribe({
        next: (images) => (this.productImages = images),
        error: () => (this.productImages = []),
      });

      // Load product variants
      this.productService.getProductVariants(theProductId).subscribe({
        next: (variants) => (this.productVariants = variants),
        error: () => (this.productVariants = []),
      });

      // Check wishlist status
      if (this.authService.isLoggedIn()) {
        this.wishlistService.isInWishlist(theProductId).subscribe({
          next: (res) => (this.isInWishlist = res.inWishlist),
          error: () => (this.isInWishlist = false),
        });
      }
    });
  }

  onVariantSelected(variant: ProductVariant | null): void {
    this.selectedVariant = variant;
  }

  get effectivePrice(): number {
    if (!this.product) return 0;
    let price = this.product.unitPrice;
    if (this.selectedVariant?.priceAdjustment) {
      price += this.selectedVariant.priceAdjustment;
    }
    return price;
  }

  get effectiveStock(): number {
    if (this.selectedVariant) {
      return this.selectedVariant.unitsInStock;
    }
    return this.product?.unitsInStock ?? 0;
  }

  incrementQuantity(): void {
    if (this.quantity < this.effectiveStock) {
      this.quantity++;
    }
  }

  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  get isInStock(): boolean {
    return this.effectiveStock > 0;
  }

  get isLowStock(): boolean {
    return this.effectiveStock > 0 && this.effectiveStock <= 5;
  }

  get stockBadgeClass(): string {
    if (!this.product) return '';
    if (this.effectiveStock === 0) return 'badge-out-of-stock';
    if (this.effectiveStock <= 5) return 'badge-low-stock';
    return 'badge-in-stock';
  }

  get stockLabel(): string {
    if (!this.product) return '';
    if (this.effectiveStock === 0) return 'Out of Stock';
    if (this.effectiveStock <= 5) return `Only ${this.effectiveStock} left!`;
    return 'In Stock';
  }

  addToCart() {
    if (!this.isInStock) return;
    const theCartItem = new CartItem(this.product);
    for (let i = 0; i < this.quantity; i++) {
      this.cartService.addToCart(theCartItem);
    }
  }

  toggleWishlist(): void {
    if (this.wishlistLoading) return;
    this.wishlistLoading = true;

    if (this.isInWishlist) {
      this.wishlistService.removeFromWishlist(this.product.id).subscribe({
        next: () => {
          this.isInWishlist = false;
          this.wishlistLoading = false;
        },
        error: () => (this.wishlistLoading = false),
      });
    } else {
      this.wishlistService.addToWishlist(this.product.id).subscribe({
        next: () => {
          this.isInWishlist = true;
          this.wishlistLoading = false;
        },
        error: () => (this.wishlistLoading = false),
      });
    }
  }

  // Pre-order
  isPreordering = false;
  showConfirmation = false;
  confirmationData: any = null;

  placePreOrder(): void {
    this.isPreordering = true;
    this.preorderService
      .placePreOrder(this.product.id, this.quantity)
      .subscribe({
        next: (response) => {
          this.isPreordering = false;
          this.confirmationData = response;
          this.showConfirmation = true;
        },
        error: () => {
          this.isPreordering = false;
        },
      });
  }

  viewOrder(): void {
    this.showConfirmation = false;
    this.router.navigate(['/order-history']);
  }
}
