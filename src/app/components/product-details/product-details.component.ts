import { Component } from '@angular/core';
import { Product, ProductImage, ProductVariant } from '../../common/product';
import { ProductService } from '../../services/product.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  CurrencyPipe,
  NgIf,
  NgClass,
  NgFor,
  DecimalPipe,
} from '@angular/common';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../common/cart-item';
import { ImageGalleryComponent } from '../image-gallery/image-gallery.component';
import { VariantSelectorComponent } from '../variant-selector/variant-selector.component';

@Component({
  selector: 'app-product-details',
  imports: [
    CurrencyPipe,
    DecimalPipe,
    RouterLink,
    NgIf,
    NgClass,
    NgFor,
    ImageGalleryComponent,
    VariantSelectorComponent,
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

  constructor(
    private productService: ProductService,
    private cartService: CartService,
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
}
