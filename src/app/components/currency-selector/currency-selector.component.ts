import { Component, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  CurrencyService,
  CurrencyCode,
  CurrencyConfig,
} from '../../services/currency.service';

@Component({
  selector: 'app-currency-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './currency-selector.component.html',
  styleUrls: ['./currency-selector.component.css'],
})
export class CurrencySelectorComponent {
  currentCurrency: CurrencyConfig;
  currencies: CurrencyConfig[];
  isOpen = false;

  constructor(
    private currencyService: CurrencyService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.currentCurrency = this.currencyService.currentCurrency;
    this.currencies = this.currencyService.getAvailableCurrencies();

    this.currencyService.currency$.subscribe((c) => {
      this.currentCurrency = c;
    });
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  close(): void {
    this.isOpen = false;
  }

  selectCurrency(code: CurrencyCode): void {
    this.currencyService.setCurrency(code);
    this.isOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const target = event.target as HTMLElement;
    if (!target.closest('.currency-selector')) {
      this.isOpen = false;
    }
  }
}
