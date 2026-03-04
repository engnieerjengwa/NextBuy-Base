import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-brand-showcase',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './brand-showcase.component.html',
  styleUrl: './brand-showcase.component.css',
})
export class BrandShowcaseComponent implements OnInit {
  brands: string[] = [];
  loading: boolean = true;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadBrands();
  }

  loadBrands(): void {
    this.loading = true;
    this.productService.getBrands().subscribe({
      next: (brands) => {
        this.brands = brands.filter((b) => b && b.trim().length > 0);
        this.loading = false;
      },
      error: () => {
        this.brands = [];
        this.loading = false;
      },
    });
  }

  getBrandInitial(brand: string): string {
    return brand.charAt(0).toUpperCase();
  }

  getBrandColor(brand: string): string {
    const colors = [
      '#0b79bf',
      '#e74c3c',
      '#2ecc71',
      '#f39c12',
      '#9b59b6',
      '#1abc9c',
      '#e67e22',
      '#3498db',
      '#e91e63',
      '#00bcd4',
    ];
    let hash = 0;
    for (let i = 0; i < brand.length; i++) {
      hash = brand.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }
}
