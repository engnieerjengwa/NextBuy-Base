import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgbCarousel, NgbSlide } from '@ng-bootstrap/ng-bootstrap';
import { HeroBannerService } from '../../services/hero-banner.service';
import { HeroBanner } from '../../common/hero-banner';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-hero-banner',
  standalone: true,
  imports: [CommonModule, RouterLink, NgbCarousel, NgbSlide],
  templateUrl: './hero-banner.component.html',
  styleUrls: ['./hero-banner.component.css'],
})
export class HeroBannerComponent implements OnInit, OnDestroy {
  heroBanners: HeroBanner[] = [];
  private subscription: Subscription = new Subscription();
  loading: boolean = true;
  error: string | null = null;

  constructor(private heroBannerService: HeroBannerService) {}

  ngOnInit(): void {
    this.loadHeroBanners();
  }

  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    this.subscription.unsubscribe();
  }

  loadHeroBanners(): void {
    this.loading = true;
    this.error = null;

    // Get currently active hero banners (based on dates)
    this.subscription = this.heroBannerService
      .getCurrentlyActiveHeroBanners()
      .subscribe({
        next: (data) => {
          this.heroBanners = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error fetching hero banners:', err);
          this.error = 'Failed to load hero banners. Please try again later.';
          this.loading = false;
        },
      });
  }
}
