import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DealService, Deal, DealProduct } from '../../services/deal.service';

@Component({
  selector: 'app-daily-deals',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './daily-deals.component.html',
  styleUrl: './daily-deals.component.css',
})
export class DailyDealsComponent implements OnInit, OnDestroy {
  dailyDeals: Deal[] = [];
  flashSales: Deal[] = [];
  loading: boolean = true;
  error: string = '';
  private countdownInterval: any;

  constructor(private dealService: DealService) {}

  ngOnInit(): void {
    this.loadDeals();
    this.startCountdown();
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  loadDeals(): void {
    this.loading = true;
    this.dealService.getDailyDeals().subscribe({
      next: (deals) => {
        this.dailyDeals = deals;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load daily deals.';
        this.loading = false;
      },
    });

    this.dealService.getFlashSales().subscribe({
      next: (deals) => (this.flashSales = deals),
      error: () => {},
    });
  }

  startCountdown(): void {
    this.countdownInterval = setInterval(() => {
      [...this.dailyDeals, ...this.flashSales].forEach((deal) => {
        if (deal.remainingSeconds > 0) {
          deal.remainingSeconds--;
        }
      });
    }, 1000);
  }

  formatCountdown(seconds: number): string {
    if (seconds <= 0) return 'Expired';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  getHours(seconds: number): string {
    return Math.floor(seconds / 3600)
      .toString()
      .padStart(2, '0');
  }

  getMinutes(seconds: number): string {
    return Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, '0');
  }

  getSeconds(seconds: number): string {
    return (seconds % 60).toString().padStart(2, '0');
  }
}
