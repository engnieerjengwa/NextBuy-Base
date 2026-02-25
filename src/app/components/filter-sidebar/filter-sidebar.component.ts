import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';

export interface FilterState {
  minPrice: number | null;
  maxPrice: number | null;
  brand: string | null;
  inStock: boolean;
  minRating: number | null;
  isNew: boolean;
}

@Component({
  selector: 'app-filter-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter-sidebar.component.html',
  styleUrls: ['./filter-sidebar.component.css'],
})
export class FilterSidebarComponent implements OnInit, OnChanges {
  @Input() categoryId: number | null = null;
  @Output() filtersChanged = new EventEmitter<FilterState>();

  brands: string[] = [];
  selectedBrand: string | null = null;
  minPrice: number | null = null;
  maxPrice: number | null = null;
  inStockOnly: boolean = false;
  minRating: number | null = null;
  isNew: boolean = false;
  isCollapsed: boolean = false;

  ratingOptions = [4, 3, 2, 1];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadBrands();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categoryId']) {
      this.loadBrands();
    }
  }

  loadBrands(): void {
    this.productService.getBrands(this.categoryId ?? undefined).subscribe({
      next: (brands) => (this.brands = brands),
      error: () => (this.brands = []),
    });
  }

  applyFilters(): void {
    this.filtersChanged.emit({
      minPrice: this.minPrice,
      maxPrice: this.maxPrice,
      brand: this.selectedBrand,
      inStock: this.inStockOnly,
      minRating: this.minRating,
      isNew: this.isNew,
    });
  }

  selectBrand(brand: string | null): void {
    this.selectedBrand = this.selectedBrand === brand ? null : brand;
    this.applyFilters();
  }

  setRating(rating: number | null): void {
    this.minRating = this.minRating === rating ? null : rating;
    this.applyFilters();
  }

  toggleInStock(): void {
    this.inStockOnly = !this.inStockOnly;
    this.applyFilters();
  }

  toggleNew(): void {
    this.isNew = !this.isNew;
    this.applyFilters();
  }

  onPriceChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedBrand = null;
    this.minPrice = null;
    this.maxPrice = null;
    this.inStockOnly = false;
    this.minRating = null;
    this.isNew = false;
    this.applyFilters();
  }

  get hasActiveFilters(): boolean {
    return !!(
      this.selectedBrand ||
      this.minPrice ||
      this.maxPrice ||
      this.inStockOnly ||
      this.minRating ||
      this.isNew
    );
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }
}
