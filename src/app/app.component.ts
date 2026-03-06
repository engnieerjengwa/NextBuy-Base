import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { ProductCategoryMenuComponent } from './components/product-category-menu/product-category-menu.component';
import { SearchComponent } from './components/search/search.component';
import { CartStatusComponent } from './components/cart-status/cart-status.component';
import { LoginStatusComponent } from './components/login-status/login-status.component';
import { CommonModule } from '@angular/common';
import { CookieConsentComponent } from './components/cookie-consent/cookie-consent.component';
import { ScrollToTopComponent } from './components/scroll-to-top/scroll-to-top.component';
import { CurrencySelectorComponent } from './components/currency-selector/currency-selector.component';
import { MobileBottomNavComponent } from './components/mobile-bottom-nav/mobile-bottom-nav.component';
import { LanguageSelectorComponent } from './components/language-selector/language-selector.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    ProductCategoryMenuComponent,
    SearchComponent,
    CartStatusComponent,
    LoginStatusComponent,
    CookieConsentComponent,
    ScrollToTopComponent,
    CurrencySelectorComponent,
    MobileBottomNavComponent,
    LanguageSelectorComponent,
    TranslateModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'base-ecommerce';
  isMobileMenuOpen = false;

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }
}
