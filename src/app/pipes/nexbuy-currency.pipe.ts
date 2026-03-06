import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyService } from '../services/currency.service';

@Pipe({
  name: 'nexbuyCurrency',
  standalone: true,
  pure: false, // Impure to react to currency changes
})
export class NexbuyCurrencyPipe implements PipeTransform {
  private currentRate: number = 1;
  private currentCode: string = 'USD';
  private currentLocale: string = 'en-US';

  constructor(private currencyService: CurrencyService) {
    this.currencyService.currency$.subscribe((c) => {
      this.currentRate = c.rate;
      this.currentCode = c.code === 'ZIG' ? 'ZWL' : c.code;
      this.currentLocale = c.locale;
    });
  }

  transform(amountInUsd: number | null | undefined): string {
    if (amountInUsd == null) return '';
    const converted = amountInUsd * this.currentRate;
    return new Intl.NumberFormat(this.currentLocale, {
      style: 'currency',
      currency: this.currentCode,
      minimumFractionDigits: 2,
    }).format(converted);
  }
}
