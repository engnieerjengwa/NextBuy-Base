import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PromoBanner } from '../../common/promo-banner';

@Component({
  selector: 'app-promo-banner-grid',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './promo-banner-grid.component.html',
  styleUrls: ['./promo-banner-grid.component.css'],
})
export class PromoBannerGridComponent {
  @Input() banners: PromoBanner[] = [];
  @Input() title: string = '';

  defaultBanners: PromoBanner[] = [
    {
      imageUrl: 'images/banners/promo-electronics.jpg',
      title: 'Electronics',
      subtitle: 'Up to 40% off',
      category: 'Electronics',
      linkUrl: '/category/1/Electronics',
      backgroundColor: '#e8f4fd',
    },
    {
      imageUrl: 'images/banners/promo-fashion.jpg',
      title: 'Fashion',
      subtitle: 'New Season Arrivals',
      category: 'Fashion',
      linkUrl: '/category/2/Fashion',
      backgroundColor: '#fde8f0',
    },
    {
      imageUrl: 'images/banners/promo-home.jpg',
      title: 'Home & Living',
      subtitle: 'Refresh Your Space',
      category: 'Home',
      linkUrl: '/category/3/Home',
      backgroundColor: '#e8fde8',
    },
    {
      imageUrl: 'images/banners/promo-sports.jpg',
      title: 'Sports & Outdoors',
      subtitle: 'Get Active',
      category: 'Sports',
      linkUrl: '/category/4/Sports',
      backgroundColor: '#fdf8e8',
    },
  ];

  get displayBanners(): PromoBanner[] {
    return this.banners.length > 0 ? this.banners : this.defaultBanners;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.style.display = 'none';
    }
  }
}
