import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Product } from '../../common/product';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
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

import { ProductCardComponent } from '../product-card/product-card.component';
import { PromoBannerGridComponent } from '../promo-banner-grid/promo-banner-grid.component';
import { BrandCarouselComponent } from '../brand-carousel/brand-carousel.component';
import { MembershipBannerComponent } from '../membership-banner/membership-banner.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    HeroBannerComponent,
    ProductCarouselComponent,
    FilterSidebarComponent,
    SortBarComponent,
    SubcategoryNavComponent,
    ProductCardComponent,
    PromoBannerGridComponent,
    BrandCarouselComponent,
    MembershipBannerComponent,
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
})
export class ProductListComponent implements OnInit, AfterViewInit, OnDestroy {
  products: Product[] = [];
  featuredProducts: Product[] = [];
  newArrivals: Product[] = [];
  dealsProducts: Product[] = [];
  trendingProducts: Product[] = [];
  currentCategoryId: number = 1;
  previousCategoryId: number = 1;
  currentCategoryName: string = '';
  searchMode: boolean = false;
  previousKeyword: string = '';
  currentKeyword: string = '';

  // Pagination
  thePageNumber: number = 1;
  thePageSize: number = 20;
  theTotalElements: number = 0;

  // Infinite scroll
  isLoading: boolean = false;
  allLoaded: boolean = false;
  private scrollObserver: IntersectionObserver | null = null;

  @ViewChild('scrollSentinel') scrollSentinel!: ElementRef;

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

  // Active filter label for header display
  activeFilterLabel: string = '';

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    // Load view preference from localStorage
    if (isPlatformBrowser(this.platformId)) {
      const savedView = localStorage.getItem('nexbuy_viewMode');
      if (savedView === 'list' || savedView === 'grid') {
        this.viewMode = savedView;
      }
    }
  }

  ngOnInit() {
    this.route.paramMap.subscribe(() => {
      this.thePageNumber = 1;
      this.allLoaded = false;
      this.listProducts();
    });

    // React to query param changes (e.g. ?filter=new-arrivals)
    this.route.queryParamMap.subscribe((queryParams) => {
      const filter = queryParams.get('filter');
      if (filter === 'new-arrivals') {
        this.activeFilterLabel = 'New Arrivals';
        this.currentFilters = { ...this.currentFilters, isNew: true };
        this.currentSort = 'dateCreatedDesc';
        this.useAdvancedSearch = true;
        this.thePageNumber = 1;
        this.allLoaded = false;
        this.handleAdvancedSearch();
      } else if (filter === 'clearance') {
        this.activeFilterLabel = 'Clearance';
        this.currentSort = 'priceAsc';
        this.useAdvancedSearch = true;
        this.thePageNumber = 1;
        this.allLoaded = false;
        this.handleAdvancedSearch();
      } else {
        this.activeFilterLabel = '';
      }
    });

    this.loadFeaturedProducts();
    this.loadNewArrivals();
    this.loadDealsProducts();
    this.loadTrendingProducts();
  }

  ngAfterViewInit() {
    this.setupInfiniteScroll();
  }

  ngOnDestroy() {
    if (this.scrollObserver) {
      this.scrollObserver.disconnect();
    }
  }

  private setupInfiniteScroll() {
    if (typeof IntersectionObserver === 'undefined') return;

    this.scrollObserver = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !this.isLoading &&
          !this.allLoaded &&
          !this.isHomePage()
        ) {
          this.loadMore();
        }
      },
      { rootMargin: '200px' },
    );

    setTimeout(() => {
      if (this.scrollSentinel?.nativeElement) {
        this.scrollObserver?.observe(this.scrollSentinel.nativeElement);
      }
    });
  }

  loadMore() {
    if (this.isLoading || this.allLoaded || this.isHomePage()) return;
    this.thePageNumber++;
    this.isLoading = true;

    if (this.searchMode) {
      this.handleSearchProducts(true);
    } else {
      this.handleListProducts(true);
    }
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

  loadDealsProducts() {
    this.productService.getFeaturedProducts(0, 10).subscribe({
      next: (response: { content: Product[] }) => {
        this.dealsProducts = response.content || [];
      },
      error: () => {
        // Fallback to random products for deals
        this.productService.getRandomProducts().subscribe({
          next: (products: Product[]) => {
            this.dealsProducts = this.getRandomSubset(products, 8);
          },
          error: () => (this.dealsProducts = []),
        });
      },
    });
  }

  loadTrendingProducts() {
    this.productService.getNewArrivals(0, 10).subscribe({
      next: (response: { content: Product[] }) => {
        this.trendingProducts = response.content || [];
      },
      error: () => {
        // Fallback to random products for trending
        this.productService.getRandomProducts().subscribe({
          next: (products: Product[]) => {
            this.trendingProducts = this.getRandomSubset(products, 8);
          },
          error: () => (this.trendingProducts = []),
        });
      },
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

  handleSearchProducts(append = false) {
    const theKeyword = this.route.snapshot.paramMap.get('keyword')!;
    this.currentKeyword = theKeyword;

    if (!append && this.previousKeyword != theKeyword) {
      this.thePageNumber = 1;
      this.allLoaded = false;
    }
    this.previousKeyword = theKeyword;

    if (this.useAdvancedSearch || this.hasActiveFilters()) {
      this.handleAdvancedSearch(theKeyword, append);
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
              const newProducts = data._embedded.products;
              this.products = append
                ? [...this.products, ...newProducts]
                : newProducts;
              this.thePageNumber = data.page.number + 1;
              this.thePageSize = data.page.size;
              this.theTotalElements = data.page.totalElements;
              const totalPages = Math.ceil(
                data.page.totalElements / data.page.size,
              );
              if (data.page.number + 1 >= totalPages) {
                this.allLoaded = true;
              }
            } else if (!append) {
              this.products = [];
            }
            this.isLoading = false;
          },
          error: () => {
            if (!append) this.products = [];
            this.isLoading = false;
          },
        });
    }
  }

  handleAdvancedSearch(keyword?: string, append = false) {
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
          const newProducts = data.content || [];
          this.products = append
            ? [...this.products, ...newProducts]
            : newProducts;
          this.thePageNumber = data.number + 1;
          this.thePageSize = data.size;
          this.theTotalElements = data.totalElements;
          const totalPages = Math.ceil(data.totalElements / data.size);
          if (data.number + 1 >= totalPages) {
            this.allLoaded = true;
          }
          this.isLoading = false;
        },
        error: () => {
          if (!append) this.products = [];
          this.isLoading = false;
        },
      });
  }

  handleListProducts(append = false) {
    const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id');

    if (hasCategoryId) {
      this.currentCategoryId = +this.route.snapshot.paramMap.get('id')!;
      this.currentCategoryName = this.route.snapshot.paramMap.get('name')!;
    } else {
      this.currentCategoryId = 0;
      this.currentCategoryName = 'All Products';
    }

    if (!append && this.previousCategoryId != this.currentCategoryId) {
      this.thePageNumber = 1;
      this.allLoaded = false;
    }
    this.previousCategoryId = this.currentCategoryId;
    this.currentKeyword = '';

    if (this.hasActiveFilters() || this.currentSort !== 'relevance') {
      this.handleAdvancedSearch(undefined, append);
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
            const newProducts = data._embedded.products;
            this.products = append
              ? [...this.products, ...newProducts]
              : newProducts;
            this.thePageNumber = data.page.number + 1;
            this.thePageSize = data.page.size;
            this.theTotalElements = data.page.totalElements;
            const totalPages = Math.ceil(
              data.page.totalElements / data.page.size,
            );
            if (data.page.number + 1 >= totalPages) {
              this.allLoaded = true;
            }
          } else if (!append) {
            this.products = [];
          }
          this.isLoading = false;
        },
        error: () => {
          if (!append) this.products = [];
          this.isLoading = false;
        },
      });
  }

  onFiltersChanged(filters: FilterState): void {
    this.currentFilters = filters;
    this.useAdvancedSearch = true;
    this.thePageNumber = 1;
    this.allLoaded = false;
    this.products = [];
    this.listProducts();
  }

  onSortChanged(sort: string): void {
    this.currentSort = sort;
    this.useAdvancedSearch = true;
    this.thePageNumber = 1;
    this.allLoaded = false;
    this.products = [];
    this.listProducts();
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('nexbuy_viewMode', this.viewMode);
    }
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
