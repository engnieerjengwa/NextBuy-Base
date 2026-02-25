import { Component, Input } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../common/product';
import { CartItem } from '../../common/cart-item';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-carousel',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './product-carousel.component.html',
  styleUrls: ['./product-carousel.component.css'],
})
export class ProductCarouselComponent {
  @Input() products: Product[] = [];
  @Input() title: string = '';
  @Input() showViewAll: boolean = false;
  @Input() viewAllLink: string = '/products';

  scrollPosition = 0;
  private readonly scrollAmount = 300;

  constructor(private cartService: CartService) {}

  scrollLeft(container: HTMLElement): void {
    container.scrollBy({ left: -this.scrollAmount, behavior: 'smooth' });
  }

  scrollRight(container: HTMLElement): void {
    container.scrollBy({ left: this.scrollAmount, behavior: 'smooth' });
  }

  canScrollLeft(container: HTMLElement): boolean {
    return container.scrollLeft > 0;
  }

  canScrollRight(container: HTMLElement): boolean {
    return (
      container.scrollLeft < container.scrollWidth - container.clientWidth - 1
    );
  }

  onScroll(container: HTMLElement): void {
    this.scrollPosition = container.scrollLeft;
  }

  addToCart(product: Product): void {
    const cartItem = new CartItem(product);
    this.cartService.addToCart(cartItem);
  }

  getDiscountBadge(product: Product): string | null {
    if (product.discountPercentage && product.discountPercentage > 0) {
      return `-${product.discountPercentage}%`;
    }
    return null;
  }
}
