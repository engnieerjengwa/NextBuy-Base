import { Component, Input, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StockNotificationService } from '../../services/stock-notification.service';

@Component({
  selector: 'app-stock-notification',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stock-notification.component.html',
  styleUrl: './stock-notification.component.css',
})
export class StockNotificationComponent implements OnInit {
  @Input() productId!: number;
  @Input() isOutOfStock: boolean = false;

  email: string = '';
  subscribed: boolean = false;
  submitting: boolean = false;
  message: string = '';
  isError: boolean = false;

  constructor(
    private stockNotificationService: StockNotificationService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const savedEmail = sessionStorage.getItem('userEmail');
      if (savedEmail) {
        this.email = JSON.parse(savedEmail);
        this.checkSubscription();
      }
    }
  }

  checkSubscription(): void {
    if (!this.email) return;
    this.stockNotificationService
      .isSubscribed(this.productId, this.email)
      .subscribe({
        next: (data) => (this.subscribed = data.subscribed),
        error: () => {},
      });
  }

  subscribe(): void {
    if (!this.email) {
      this.message = 'Please enter your email address';
      this.isError = true;
      return;
    }

    this.submitting = true;
    this.message = '';

    this.stockNotificationService
      .subscribe(this.productId, this.email)
      .subscribe({
        next: () => {
          this.subscribed = true;
          this.message =
            "You'll be notified when this product is back in stock!";
          this.isError = false;
          this.submitting = false;
        },
        error: (err) => {
          this.message =
            err.error?.message || 'Failed to subscribe. Please try again.';
          this.isError = true;
          this.submitting = false;
        },
      });
  }
}
