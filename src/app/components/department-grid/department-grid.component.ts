import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { ProductCategory } from '../../common/product-category';

@Component({
  selector: 'app-department-grid',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './department-grid.component.html',
  styleUrls: ['./department-grid.component.css'],
})
export class DepartmentGridComponent implements OnInit {
  departments: ProductCategory[] = [];
  loading = true;

  // Default category icons when iconUrl is not available
  private defaultIcons: Record<string, string> = {
    books: 'fa-book',
    'coffee mugs': 'fa-coffee',
    'mouse pads': 'fa-mouse-pointer',
    'luggage tags': 'fa-tag',
    electronics: 'fa-laptop',
    clothing: 'fa-tshirt',
    sports: 'fa-futbol',
    toys: 'fa-puzzle-piece',
    home: 'fa-home',
    garden: 'fa-tree',
    beauty: 'fa-magic',
    food: 'fa-utensils',
  };

  // Default category colors
  private categoryColors: string[] = [
    '#0da8e4',
    '#e74c3c',
    '#2ecc71',
    '#f39c12',
    '#9b59b6',
    '#1abc9c',
    '#e67e22',
    '#3498db',
    '#e91e63',
    '#00bcd4',
    '#ff9800',
    '#8bc34a',
  ];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.productService.getProductCategories().subscribe({
      next: (categories) => {
        this.departments = categories.filter((c) => c.isActive !== false);
        this.loading = false;
      },
      error: () => {
        this.departments = [];
        this.loading = false;
      },
    });
  }

  getIconClass(category: ProductCategory): string {
    const name = category.categoryName.toLowerCase();
    for (const [key, icon] of Object.entries(this.defaultIcons)) {
      if (name.includes(key)) return icon;
    }
    return 'fa-th-large';
  }

  getColor(index: number): string {
    return this.categoryColors[index % this.categoryColors.length];
  }

  hasImage(category: ProductCategory): boolean {
    return !!(category.iconUrl && category.iconUrl.trim().length > 0);
  }
}
