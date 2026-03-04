import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FrequentlyBoughtTogetherService } from '../../services/frequently-bought-together.service';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../common/cart-item';
import { Product } from '../../common/product';

interface BundleProduct {
  productId: number;
  productName: string;
  productImageUrl: string;
  unitPrice: number;
  bundlePrice: number;
  discountPercentage: number;
  selected: boolean;
}

@Component({
  selector: 'app-frequently-bought-together',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './frequently-bought-together.component.html',
  styleUrl: './frequently-bought-together.component.css',
})
export class FrequentlyBoughtTogetherComponent implements OnChanges {
  @Input() productId!: number;
  @Input() currentProduct!: {
    name: string;
    imageUrl: string;
    unitPrice: number;
  };

  bundleProducts: BundleProduct[] = [];
  bundleTotal = 0;
  bundleSavings = 0;
  selectedCount = 0;
  isAdding = false;
  showSuccess = false;
  isLoading = false;

  constructor(
    private fbtService: FrequentlyBoughtTogetherService,
    private cartService: CartService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productId'] && this.productId) {
      this.loadBundleProducts();
    }
  }

  loadBundleProducts(): void {
    this.isLoading = true;
    this.showSuccess = false;
    this.fbtService.getFrequentlyBoughtTogether(this.productId).subscribe({
      next: (items) => {
        this.bundleProducts = items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          productImageUrl: item.productImageUrl,
          unitPrice: item.unitPrice,
          bundlePrice: item.bundlePrice,
          discountPercentage: item.discountPercentage,
          selected: true,
        }));
        this.recalculateTotal();
        this.isLoading = false;
      },
      error: () => {
        this.bundleProducts = [];
        this.isLoading = false;
      },
    });
  }

  toggleProduct(index: number): void {
    this.bundleProducts[index].selected = !this.bundleProducts[index].selected;
    this.recalculateTotal();
  }

  recalculateTotal(): void {
    const selected = this.bundleProducts.filter((p) => p.selected);
    this.selectedCount = selected.length + 1; // +1 for current product

    const selectedBundleTotal = selected.reduce(
      (sum, p) => sum + p.bundlePrice,
      0,
    );
    this.bundleTotal = this.currentProduct.unitPrice + selectedBundleTotal;

    const fullPriceTotal = selected.reduce((sum, p) => sum + p.unitPrice, 0);
    this.bundleSavings =
      this.currentProduct.unitPrice + fullPriceTotal - this.bundleTotal;
  }

  addAllToCart(): void {
    this.isAdding = true;

    // Add current product
    const currentAsProduct = new Product(
      this.productId,
      '',
      this.currentProduct.name,
      '',
      this.currentProduct.unitPrice,
      this.currentProduct.imageUrl,
      true,
      0,
      new Date(),
      new Date(),
    );
    this.cartService.addToCart(new CartItem(currentAsProduct));

    // Add selected bundle products
    const selected = this.bundleProducts.filter((p) => p.selected);
    for (const item of selected) {
      const asProduct = new Product(
        item.productId,
        '',
        item.productName,
        '',
        item.bundlePrice,
        item.productImageUrl,
        true,
        0,
        new Date(),
        new Date(),
      );
      this.cartService.addToCart(new CartItem(asProduct));
    }

    this.isAdding = false;
    this.showSuccess = true;
    setTimeout(() => (this.showSuccess = false), 3000);
  }

  hasSalePrice(product: BundleProduct): boolean {
    return product.bundlePrice < product.unitPrice;
  }
}
