import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Product } from '../../common/product';
import { CurrencyPipe, CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { CartItem } from '../../common/cart-item';
import { CartService } from '../../services/cart.service';
import { HeroBannerComponent } from '../hero-banner/hero-banner.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    RouterLink,
    NgbPagination,
    HeroBannerComponent,
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  featuredProducts: Product[] = [];
  currentCategoryId: number = 1;
  previousCategoryId: number = 1;
  currentCategoryName: string = '';
  searchMode: boolean = false;
  previousKeyword: string = '';

  //properties for pagenation
  thePageNumber: number = 1;
  thePageSize: number = 10;
  theTotalElements: number = 0;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(() => {
      this.listProducts();
    });

    // Load featured products (random products for now)
    this.loadFeaturedProducts();
  }

  /**
   * Load featured products
   * TODO: In the future, this should load actual featured products from the backend
   */
  loadFeaturedProducts() {
    this.productService.getRandomProducts().subscribe({
      next: (products) => {
        // Randomize the products
        this.featuredProducts = this.getRandomSubset(products, 4);
      },
      error: (err) => {
        console.error('Error loading featured products:', err);
        this.featuredProducts = [];
      },
    });
  }

  /**
   * Get a random subset of products
   */
  private getRandomSubset(products: Product[], count: number): Product[] {
    // Make a copy of the array to avoid modifying the original
    const shuffled = [...products];

    // Shuffle the array using Fisher-Yates algorithm
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

    if (this.previousKeyword != theKeyword) {
      this.thePageNumber = 1;
    }
    this.previousKeyword = theKeyword;

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
            console.error('No products found for keyword:', theKeyword);
          }
        },
        error: (err) => {
          console.error('Error searching products:', err);
          this.products = [];
        },
      });
  }

  handleListProducts() {
    // check if "id" parameter is available
    const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id');

    if (hasCategoryId) {
      // get the "id" param string. convert string to a number using the "+" symbol
      this.currentCategoryId = +this.route.snapshot.paramMap.get('id')!;

      // get the "name" param string
      this.currentCategoryName = this.route.snapshot.paramMap.get('name')!;
    } else {
      // not category id available ... default to category id 0 (all products)
      this.currentCategoryId = 0;
      this.currentCategoryName = 'All Products';
    }

    if (this.previousCategoryId != this.currentCategoryId) {
      this.thePageNumber = 1;
    }

    this.previousCategoryId = this.currentCategoryId;

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
            console.error(
              'No products found for category ID:',
              this.currentCategoryId,
            );
          }
        },
        error: (err) => {
          console.error('Error fetching products:', err);
          this.products = [];
        },
      });
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

  /**
   * Determines if the current view is the home page
   * Home page is when there's no category ID in the route parameters and no search keyword
   */
  isHomePage(): boolean {
    return (
      !this.searchMode &&
      (!this.route.snapshot.paramMap.has('id') ||
        this.currentCategoryId === 0 ||
        this.currentCategoryName === 'All Products')
    );
  }
}
