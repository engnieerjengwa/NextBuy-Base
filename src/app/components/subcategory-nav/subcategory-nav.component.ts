import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CategoryService } from '../../services/category.service';
import { ProductCategory } from '../../common/product-category';

@Component({
  selector: 'app-subcategory-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './subcategory-nav.component.html',
  styleUrls: ['./subcategory-nav.component.css'],
})
export class SubcategoryNavComponent implements OnChanges {
  @Input() categoryId: number | null = null;

  parentCategory: ProductCategory | null = null;
  subcategories: ProductCategory[] = [];
  expandedIds: Set<number> = new Set();
  loading = false;

  constructor(private categoryService: CategoryService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categoryId'] && this.categoryId) {
      this.loadCategoryTree();
    }
  }

  loadCategoryTree(): void {
    if (!this.categoryId) return;
    this.loading = true;

    // Load current category info
    this.categoryService.getCategoryById(this.categoryId).subscribe({
      next: (category) => {
        this.parentCategory = category;
        // Load subcategories of this category
        this.categoryService.getSubcategories(this.categoryId!).subscribe({
          next: (subs) => {
            this.subcategories = subs.filter((s) => s.isActive);
            this.loading = false;
          },
          error: () => {
            this.subcategories = [];
            this.loading = false;
          },
        });
      },
      error: () => {
        this.parentCategory = null;
        this.subcategories = [];
        this.loading = false;
      },
    });
  }

  toggleExpand(categoryId: number): void {
    if (this.expandedIds.has(categoryId)) {
      this.expandedIds.delete(categoryId);
    } else {
      this.expandedIds.add(categoryId);
    }
  }

  isExpanded(categoryId: number): boolean {
    return this.expandedIds.has(categoryId);
  }

  isActive(categoryId: number): boolean {
    return this.categoryId === categoryId;
  }
}
