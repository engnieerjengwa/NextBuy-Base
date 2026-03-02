import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../common/product';
import { CartItem } from '../../common/cart-item';
import { CartService } from '../../services/cart.service';
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'app-product-carousel',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent],
  templateUrl: './product-carousel.component.html',
  styleUrls: ['./product-carousel.component.css'],
})
export class ProductCarouselComponent {
  @Input() products: Product[] = [];
  @Input() title: string = '';
  @Input() showViewAll: boolean = false;
  @Input() viewAllLink: string = '/products';
  @Input() showFireSale: boolean = false;
  @Input() showMoreDeals: boolean = false;
  @Input() showAlotForLess: boolean = false;
  @Input() actionLabel: string = '';
  @Input() actionLink: string = '';

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

  onAddToCart(product: Product): void {
    const cartItem = new CartItem(product);
    this.cartService.addToCart(cartItem);
  }
}
