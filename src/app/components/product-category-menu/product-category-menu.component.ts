import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProductCategory } from '../../common/product-category';
import { CategoryService } from '../../services/category.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-category-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, NgbDropdownModule],
  templateUrl: './product-category-menu.component.html',
  styleUrls: ['./product-category-menu.component.css'],
})
export class ProductCategoryMenuComponent implements OnInit, OnDestroy {
  mainCategories: ProductCategory[] = [];

  subcategoriesMap: Map<number, ProductCategory[]> = new Map();

  activeCategory: number | null = null;

  isMainDropdownOpen = false;

  private categorySubscription: Subscription | null = null;

  constructor(
    private categoryService: CategoryService,
    private productService: ProductService,
  ) {}

  ngOnInit() {
    this.loadCategories();
  }

  ngOnDestroy() {
    if (this.categorySubscription) {
      this.categorySubscription.unsubscribe();
    }
  }

  /**
   * Load all active top-level categories
   */
  loadCategories() {
    console.log('Loading categories using ProductService...');
    this.categorySubscription = this.productService
      .getProductCategories()
      .subscribe(
        (data) => {
          console.log('Categories received from ProductService:', data);
          this.mainCategories = data;
          console.log('mainCategories set:', this.mainCategories);
          // Since we're using the old API, we don't have subcategories
          // So we'll just set an empty array for each category
          this.mainCategories.forEach((category) => {
            this.subcategoriesMap.set(category.id, []);
          });
        },
        (error) => {
          console.error(
            'Error fetching categories from ProductService:',
            error,
          );
        },
      );
  }

  /**
   * Load subcategories for a given parent category
   */
  loadSubcategories(parentId: number) {
    this.categoryService.getActiveSubcategories(parentId).subscribe(
      (data) => {
        this.subcategoriesMap.set(parentId, data);
      },
      (error) => {
        console.error(
          `Error fetching subcategories for parent ${parentId}:`,
          error,
        );
      },
    );
  }

  /**
   * Get subcategories for a given parent category
   */
  getSubcategories(parentId: number): ProductCategory[] {
    return this.subcategoriesMap.get(parentId) || [];
  }

  /**
   * Check if a category has subcategories
   */
  hasSubcategories(categoryId: number): boolean {
    const subcategories = this.subcategoriesMap.get(categoryId);
    return subcategories !== undefined && subcategories.length > 0;
  }

  /**
   * Open the main dropdown menu
   */
  openMainDropdown() {
    this.isMainDropdownOpen = true;
  }

  /**
   * Close the main dropdown menu
   */
  closeMainDropdown() {
    this.isMainDropdownOpen = false;
    this.activeCategory = null;
  }

  /**
   * Toggle the main dropdown menu
   */
  toggleMainDropdown() {
    this.isMainDropdownOpen = !this.isMainDropdownOpen;
    if (!this.isMainDropdownOpen) {
      this.activeCategory = null;
    }
  }

  /**
   * Open a specific category dropdown
   */
  openCategoryDropdown(categoryId: number, event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    this.activeCategory = categoryId;
  }

  /**
   * Close a specific category dropdown
   */
  closeCategoryDropdown(event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    this.activeCategory = null;
  }

  /**
   * Check if a category dropdown is open
   */
  isCategoryDropdownOpen(categoryId: number): boolean {
    return this.activeCategory === categoryId;
  }
}
