import { Component } from '@angular/core';
import { Product } from '../../common/product';
import { ProductService } from '../../services/product.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe, NgIf, NgClass } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../common/cart-item';

@Component({
  selector: 'app-product-details',
  imports: [CurrencyPipe, RouterLink, NgIf, NgClass],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css',
})
export class ProductDetailsComponent {
  product!: Product;
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
    });
  }

  incrementQuantity(): void {
    if (this.quantity < this.product.unitsInStock) {
      this.quantity++;
    }
  }

  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  get isInStock(): boolean {
    return this.product?.unitsInStock > 0;
  }

  get isLowStock(): boolean {
    return this.product?.unitsInStock > 0 && this.product.unitsInStock <= 5;
  }

  get stockBadgeClass(): string {
    if (!this.product) return '';
    if (this.product.unitsInStock === 0) return 'badge-out-of-stock';
    if (this.product.unitsInStock <= 5) return 'badge-low-stock';
    return 'badge-in-stock';
  }

  get stockLabel(): string {
    if (!this.product) return '';
    if (this.product.unitsInStock === 0) return 'Out of Stock';
    if (this.product.unitsInStock <= 5)
      return `Only ${this.product.unitsInStock} left!`;
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
