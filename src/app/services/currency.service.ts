import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export type CurrencyCode = 'USD' | 'ZIG';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rate: number; // Rate relative to USD (USD = 1.0)
  locale: string;
}

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private readonly currencies: Record<CurrencyCode, CurrencyConfig> = {
    USD: {
      code: 'USD',
      symbol: '$',
      name: 'US Dollar',
      rate: 1.0,
      locale: 'en-US',
    },
    ZIG: {
      code: 'ZIG',
      symbol: 'ZiG',
      name: 'Zimbabwe Gold',
      rate: 13.5,
      locale: 'en-ZW',
    },
  };

  private currentCurrencySubject = new BehaviorSubject<CurrencyConfig>(
    this.currencies['USD'],
  );
  currency$ = this.currentCurrencySubject.asObservable();

  private storage: Storage | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.storage = localStorage;
      const saved = this.storage.getItem('nexbuy_currency');
      if (saved && this.currencies[saved as CurrencyCode]) {
        this.currentCurrencySubject.next(
          this.currencies[saved as CurrencyCode],
        );
      }
    }
  }

  get currentCurrency(): CurrencyConfig {
    return this.currentCurrencySubject.value;
  }

  setCurrency(code: CurrencyCode): void {
    const currency = this.currencies[code];
    if (currency) {
      this.currentCurrencySubject.next(currency);
      this.storage?.setItem('nexbuy_currency', code);
    }
  }

  /** Convert a USD amount to the current currency */
  convert(amountInUsd: number): number {
    return amountInUsd * this.currentCurrency.rate;
  }

  /** Format an amount in the current currency */
  format(amountInUsd: number): string {
    const converted = this.convert(amountInUsd);
    return new Intl.NumberFormat(this.currentCurrency.locale, {
      style: 'currency',
      currency:
        this.currentCurrency.code === 'ZIG' ? 'ZWL' : this.currentCurrency.code,
      minimumFractionDigits: 2,
    }).format(converted);
  }

  getAvailableCurrencies(): CurrencyConfig[] {
    return Object.values(this.currencies);
  }
}
