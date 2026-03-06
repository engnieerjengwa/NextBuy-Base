import {
  Component,
  OnInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NexbuyCurrencyPipe } from '../../pipes/nexbuy-currency.pipe';
import { Title, Meta } from '@angular/platform-browser';
import { DealService, Deal, DealProduct } from '../../services/deal.service';
import { SaleEvent } from '../../common/sale-event';

@Component({
  selector: 'app-sale-event-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NexbuyCurrencyPipe],
  templateUrl: './sale-event-landing.component.html',
  styleUrl: './sale-event-landing.component.css',
})
export class SaleEventLandingComponent implements OnInit, OnDestroy {
  event: SaleEvent | null = null;
  sortedDeals: Deal[] = [];
  sortBy = 'percentOff';
  isLoading = true;
  private countdownInterval: any;

  // Countdown display
  days = 0;
  hours = 0;
  minutes = 0;
  seconds = 0;

  constructor(
    private route: ActivatedRoute,
    private dealService: DealService,
    private titleService: Title,
    private metaService: Meta,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    this.dealService.getSaleEvent(slug).subscribe({
      next: (event) => {
        this.event = event;
        this.sortedDeals = [...event.deals];
        this.sortDeals();
        this.isLoading = false;

        this.titleService.setTitle(`${event.name} | NexBuy`);
        this.metaService.updateTag({
          name: 'description',
          content: event.description,
        });

        if (event.isActive && isPlatformBrowser(this.platformId)) {
          this.startCountdown(event.timeRemainingMs);
        }
      },
      error: () => {
        this.event = null;
        this.isLoading = false;
      },
    });
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  startCountdown(remainingMs: number): void {
    let remaining = Math.max(0, remainingMs);
    this.updateCountdown(remaining);

    this.countdownInterval = setInterval(() => {
      remaining -= 1000;
      if (remaining <= 0) {
        remaining = 0;
        clearInterval(this.countdownInterval);
        this.onEventExpired();
      }
      this.updateCountdown(remaining);
    }, 1000);
  }

  updateCountdown(ms: number): void {
    const totalSec = Math.floor(ms / 1000);
    this.days = Math.floor(totalSec / 86400);
    this.hours = Math.floor((totalSec % 86400) / 3600);
    this.minutes = Math.floor((totalSec % 3600) / 60);
    this.seconds = totalSec % 60;
  }

  sortDeals(): void {
    if (!this.event) return;
    const deals = [...this.event.deals];

    switch (this.sortBy) {
      case 'percentOff':
        deals.sort((a, b) => b.discountPercentage - a.discountPercentage);
        break;
      case 'priceLow':
        deals.sort((a, b) => {
          const aMin = Math.min(...a.products.map((p) => p.dealPrice));
          const bMin = Math.min(...b.products.map((p) => p.dealPrice));
          return aMin - bMin;
        });
        break;
      case 'priceHigh':
        deals.sort((a, b) => {
          const aMax = Math.max(...a.products.map((p) => p.dealPrice));
          const bMax = Math.max(...b.products.map((p) => p.dealPrice));
          return bMax - aMax;
        });
        break;
      case 'endingSoon':
        deals.sort((a, b) => a.remainingSeconds - b.remainingSeconds);
        break;
    }

    this.sortedDeals = deals;
  }

  onEventExpired(): void {
    if (this.event) {
      this.event.isActive = false;
    }
  }

  getDealHours(deal: Deal): string {
    return String(Math.floor(deal.remainingSeconds / 3600)).padStart(2, '0');
  }

  getDealMinutes(deal: Deal): string {
    return String(Math.floor((deal.remainingSeconds % 3600) / 60)).padStart(
      2,
      '0',
    );
  }

  getDealSeconds(deal: Deal): string {
    return String(deal.remainingSeconds % 60).padStart(2, '0');
  }
}
