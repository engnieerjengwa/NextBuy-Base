import { Component, inject, PLATFORM_ID, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-mobile-bottom-nav',
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './mobile-bottom-nav.component.html',
  styleUrls: ['./mobile-bottom-nav.component.css'],
})
export class MobileBottomNavComponent {
  cartCount = 0;
  isVisible = true;

  private readonly cartService = inject(CartService);
  private readonly platformId = inject(PLATFORM_ID);
  private lastScrollY = 0;
  private scrollThreshold = 10;

  constructor() {
    this.cartService.totalQuantity.subscribe((qty) => (this.cartCount = qty));
  }

  @HostListener('window:scroll')
  onScroll() {
    if (!isPlatformBrowser(this.platformId)) return;

    const currentScrollY = window.scrollY;

    if (Math.abs(currentScrollY - this.lastScrollY) < this.scrollThreshold)
      return;

    this.isVisible = currentScrollY < this.lastScrollY || currentScrollY < 50;
    this.lastScrollY = currentScrollY;
  }
}
