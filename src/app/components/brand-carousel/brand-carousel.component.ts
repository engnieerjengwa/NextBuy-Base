import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface Brand {
  name: string;
  logoUrl: string;
  link: string;
}

@Component({
  selector: 'app-brand-carousel',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './brand-carousel.component.html',
  styleUrls: ['./brand-carousel.component.css'],
})
export class BrandCarouselComponent {
  @Input() title: string = 'Shop by Brand';

  brands: Brand[] = [
    {
      name: 'Samsung',
      logoUrl: 'images/brands/samsung.png',
      link: '/products',
    },
    { name: 'Apple', logoUrl: 'images/brands/apple.png', link: '/products' },
    { name: 'Nike', logoUrl: 'images/brands/nike.png', link: '/products' },
    { name: 'Sony', logoUrl: 'images/brands/sony.png', link: '/products' },
    { name: 'LG', logoUrl: 'images/brands/lg.png', link: '/products' },
    {
      name: 'Adidas',
      logoUrl: 'images/brands/adidas.png',
      link: '/products',
    },
    {
      name: 'Philips',
      logoUrl: 'images/brands/philips.png',
      link: '/products',
    },
    {
      name: 'Huawei',
      logoUrl: 'images/brands/huawei.png',
      link: '/products',
    },
  ];

  scrollLeft(container: HTMLElement): void {
    container.scrollBy({ left: -300, behavior: 'smooth' });
  }

  scrollRight(container: HTMLElement): void {
    container.scrollBy({ left: 300, behavior: 'smooth' });
  }

  onBrandImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img?.parentElement) {
      img.parentElement.style.display = 'none';
    }
  }
}
