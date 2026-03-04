import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface QuickLink {
  label: string;
  route: string;
  icon?: string;
  cssClass?: string;
  queryParams?: { [key: string]: string | boolean | number };
}

@Component({
  selector: 'app-quick-links-bar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './quick-links-bar.component.html',
  styleUrls: ['./quick-links-bar.component.css'],
})
export class QuickLinksBarComponent {
  quickLinks: QuickLink[] = [
    { label: 'Deals', route: '/deals', icon: 'fas fa-tag' },
    {
      label: 'New Arrivals',
      route: '/products',
      icon: 'fas fa-sparkles',
      queryParams: { filter: 'new-arrivals' },
    },
    {
      label: 'Fire Sale',
      route: '/deals',
      icon: 'fas fa-fire',
      cssClass: 'fire-sale',
    },
    { label: 'Brands Store', route: '/brands', icon: 'fas fa-store' },
    {
      label: 'Clearance',
      route: '/products',
      icon: 'fas fa-percent',
      queryParams: { filter: 'clearance' },
    },
  ];
}
