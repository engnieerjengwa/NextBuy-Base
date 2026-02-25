import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Product } from '../../common/product';
import { CurrencyPipe, CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { CartItem } from '../../common/cart-item';
import { CartService } from '../../services/cart.service';
import { HeroBannerComponent } from '../hero-banner/hero-banner.component';
import { ProductCarouselComponent } from '../product-carousel/product-carousel.component';
import {
  FilterSidebarComponent,
  FilterState,
} from '../filter-sidebar/filter-sidebar.component';
import { SortBarComponent } from '../sort-bar/sort-bar.component';
import { SubcategoryNavComponent } from '../subcategory-nav/subcategory-nav.component';
import { DepartmentGridComponent } from '../department-grid/department-grid.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    RouterLink,
    NgbPagination,
    HeroBannerComponent,
    ProductCarouselComponent,
    FilterSidebarComponent,
    SortBarComponent,
    SubcategoryNavComponent,
    DepartmentGridComponent,
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  featuredProducts: Product[] = [];
  newArrivals: Product[] = [];
  currentCategoryId: number = 1;
  previousCategoryId: number = 1;
  currentCategoryName: string = '';
  searchMode: boolean = false;
  previousKeyword: string = '';
  currentKeyword: string = '';

  // Pagination
  thePageNumber: number = 1;
  thePageSize: number = 10;
  theTotalElements: number = 0;

  // View mode
  viewMode: 'grid' | 'list' = 'grid';

  // Sort & Filter
  currentSort: string = 'relevance';
  currentFilters: FilterState = {
    minPrice: null,
    maxPrice: null,
    brand: null,
    inStock: false,
    minRating: null,
    isNew: false,
  };
  useAdvancedSearch: boolean = false;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private route: ActivatedRoute,
  ) {
    // Load view preference from localStorage
    const savedView = localStorage.getItem('nexbuy_viewMode');
    if (savedView === 'list' || savedView === 'grid') {
      this.viewMode = savedView;
    }
  }

  ngOnInit() {
    this.route.paramMap.subscribe(() => {
      this.listProducts();
    });

    this.loadFeaturedProducts();
    this.loadNewArrivals();
  }

  loadFeaturedProducts() {
    this.productService.getFeaturedProducts(0, 10).subscribe({
      next: (response) => {
        this.featuredProducts = response.content || [];
      },
      error: () => {
        // Fallback to random products
        this.productService.getRandomProducts().subscribe({
          next: (products) => {
            this.featuredProducts = this.getRandomSubset(products, 8);
          },
          error: () => (this.featuredProducts = []),
        });
      },
    });
  }

  loadNewArrivals() {
    this.productService.getNewArrivals(0, 10).subscribe({
      next: (response) => {
        this.newArrivals = response.content || [];
      },
      error: () => (this.newArrivals = []),
    });
  }

  private getRandomSubset(products: Product[], count: number): Product[] {
    const shuffled = [...products];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
  }

  listProducts() {
    this.searchMode = this.route.snapshot.paramMap.has('keyword');

    if (this.searchMode) {
      this.handleSearchProducts();
    } else {
      this.handleListProducts();
    }
  }

  handleSearchProducts() {
    const theKeyword = this.route.snapshot.paramMap.get('keyword')!;
    this.currentKeyword = theKeyword;

    if (this.previousKeyword != theKeyword) {
      this.thePageNumber = 1;
    }
    this.previousKeyword = theKeyword;

    if (this.useAdvancedSearch || this.hasActiveFilters()) {
      this.handleAdvancedSearch(theKeyword);
    } else {
      this.productService
        .searchProductsPagenation(
          this.thePageNumber - 1,
          this.thePageSize,
          theKeyword,
        )
        .subscribe({
          next: (data) => {
            if (data && data._embedded && data._embedded.products) {
              this.products = data._embedded.products;
              this.thePageNumber = data.page.number + 1;
              this.thePageSize = data.page.size;
              this.theTotalElements = data.page.totalElements;
            } else {
              this.products = [];
            }
          },
          error: () => (this.products = []),
        });
    }
  }

  handleAdvancedSearch(keyword?: string) {
    this.productService
      .searchProductsAdvanced({
        q: keyword || undefined,
        brand: this.currentFilters.brand || undefined,
        categoryId:
          this.currentCategoryId > 0 ? this.currentCategoryId : undefined,
        minPrice: this.currentFilters.minPrice || undefined,
        maxPrice: this.currentFilters.maxPrice || undefined,
        inStock: this.currentFilters.inStock || undefined,
        minRating: this.currentFilters.minRating || undefined,
        isNew: this.currentFilters.isNew || undefined,
        sort: this.currentSort !== 'relevance' ? this.currentSort : undefined,
        page: this.thePageNumber - 1,
        size: this.thePageSize,
      })
      .subscribe({
        next: (data) => {
          this.products = data.content || [];
          this.thePageNumber = data.number + 1;
          this.thePageSize = data.size;
          this.theTotalElements = data.totalElements;
        },
        error: () => (this.products = []),
      });
  }

  handleListProducts() {
    const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id');

    if (hasCategoryId) {
      this.currentCategoryId = +this.route.snapshot.paramMap.get('id')!;
      this.currentCategoryName = this.route.snapshot.paramMap.get('name')!;
    } else {
      this.currentCategoryId = 0;
      this.currentCategoryName = 'All Products';
    }

    if (this.previousCategoryId != this.currentCategoryId) {
      this.thePageNumber = 1;
    }
    this.previousCategoryId = this.currentCategoryId;
    this.currentKeyword = '';

    if (this.hasActiveFilters() || this.currentSort !== 'relevance') {
      this.handleAdvancedSearch();
      return;
    }

    this.productService
      .getProductListPagenation(
        this.thePageNumber - 1,
        this.thePageSize,
        this.currentCategoryId,
      )
      .subscribe({
        next: (data) => {
          if (data && data._embedded && data._embedded.products) {
            this.products = data._embedded.products;
            this.thePageNumber = data.page.number + 1;
            this.thePageSize = data.page.size;
            this.theTotalElements = data.page.totalElements;
          } else {
            this.products = [];
          }
        },
        error: () => (this.products = []),
      });
  }

  onFiltersChanged(filters: FilterState): void {
    this.currentFilters = filters;
    this.useAdvancedSearch = true;
    this.thePageNumber = 1;
    this.listProducts();
  }

  onSortChanged(sort: string): void {
    this.currentSort = sort;
    this.useAdvancedSearch = true;
    this.thePageNumber = 1;
    this.listProducts();
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
    localStorage.setItem('nexbuy_viewMode', this.viewMode);
  }

  private hasActiveFilters(): boolean {
    return !!(
      this.currentFilters.brand ||
      this.currentFilters.minPrice ||
      this.currentFilters.maxPrice ||
      this.currentFilters.inStock ||
      this.currentFilters.minRating ||
      this.currentFilters.isNew
    );
  }

  updatePageSize(pageSize: string) {
    this.thePageSize = +pageSize;
    this.thePageNumber = 1;
    this.listProducts();
  }

  addToCart(theProduct: Product) {
    const theCartItem = new CartItem(theProduct);
    this.cartService.addToCart(theCartItem);
  }

  isHomePage(): boolean {
    return (
      !this.searchMode &&
      (!this.route.snapshot.paramMap.has('id') ||
        this.currentCategoryId === 0 ||
        this.currentCategoryName === 'All Products')
    );
  }

  getDiscountBadge(product: Product): string | null {
    if (product.discountPercentage && product.discountPercentage > 0) {
      return `-${product.discountPercentage}%`;
    }
    return null;
  }
}
