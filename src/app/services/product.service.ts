import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import {
  Product,
  ProductImage,
  ProductVariant,
  ProductSearchResult,
} from '../common/product';
import { ProductCategory } from '../common/product-category';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  // base URL for products (no query params here)
  private baseUrl = `${environment.apiUrl}/products`;

  private categoryUrl = `${environment.apiUrl}/product-category`;

  constructor(private httpClient: HttpClient) {}

  getProductList(theCategoryId: number): Observable<Product[]> {
    // Spring Data REST exposes the repository search endpoint as:
    // /api/products/search/findByCategoryId?id={id}&size={size}
    const searchUrl = `${this.baseUrl}/search/findByCategoryId?id=${theCategoryId}`;

    return this.getProducts(searchUrl);
  }

  getProductListPagenation(
    thePage: number,
    thePageSize: number,
    theCategoryId: number,
  ): Observable<GetResponseProducts> {
    // Spring Data REST exposes the repository search endpoint as:
    // /api/products/search/findByCategoryId?id={id}&size={size}
    let searchUrl = '';

    if (theCategoryId === 0) {
      // If category ID is 0, get all products
      searchUrl = `${this.baseUrl}?page=${thePage}&size=${thePageSize}`;
    } else {
      // Get products for specific category
      searchUrl = `${this.baseUrl}/search/findByCategoryId?id=${theCategoryId}&page=${thePage}&size=${thePageSize}`;
    }

    return this.httpClient.get<GetResponseProducts>(searchUrl);
  }

  searchProducts(theKeyword: string): Observable<Product[]> {
    const searchUrl = `${this.baseUrl}/search/findByNameContaining?name=${theKeyword}`;

    return this.getProducts(searchUrl);
  }

  private getProducts(searchUrl: string): Observable<Product[]> {
    return this.httpClient
      .get<GetResponseProducts>(searchUrl)
      .pipe(
        map(
          (response: { _embedded: { products: any } }) =>
            response._embedded.products,
        ),
      );
  }

  searchProductsPagenation(
    thePage: number,
    thePageSize: number,
    theKeyword: string,
  ): Observable<GetResponseProducts> {
    // Spring Data REST exposes the repository search endpoint as:
    // /api/products/search/findByCategoryId?id={id}&size={size}
    const searchUrl =
      `${this.baseUrl}/search/findByNameContaining?name=${theKeyword}` +
      `&page=${thePage}&size=${thePageSize}`;

    return this.httpClient.get<GetResponseProducts>(searchUrl);
  }

  getProduct(theProductId: number): Observable<Product> {
    const productUrl = `${this.baseUrl}/${theProductId}`;
    return this.httpClient.get<Product>(productUrl);
  }

  getProductCategories(): Observable<ProductCategory[]> {
    return this.httpClient
      .get<GetResponseProductCategory>(this.categoryUrl)
      .pipe(
        map((response) => {
          console.log('Raw API response:', response);
          if (
            response &&
            response._embedded &&
            response._embedded.productCategory
          ) {
            return response._embedded.productCategory;
          } else {
            console.error('Unexpected API response structure:', response);
            return [];
          }
        }),
      );
  }

  /**
   * Get random products for featured products section
   * TODO: In the future, this should be replaced with a proper API endpoint for featured products
   */
  getRandomProducts(count: number = 4): Observable<Product[]> {
    // For now, just get a page of products and we'll randomize them in the component
    const searchUrl = `${this.baseUrl}?size=20`;

    return this.httpClient.get<GetResponseProducts>(searchUrl).pipe(
      map((response) => {
        if (response && response._embedded && response._embedded.products) {
          return response._embedded.products;
        } else {
          console.error('Unexpected API response structure:', response);
          return [];
        }
      }),
    );
  }

  // ── Phase 2: Advanced Search & Filtering ──

  searchProductsAdvanced(params: {
    q?: string;
    brand?: string;
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    minRating?: number;
    isNew?: boolean;
    sort?: string;
    page?: number;
    size?: number;
  }): Observable<SearchResponsePage> {
    let httpParams = new HttpParams();
    if (params.q) httpParams = httpParams.set('q', params.q);
    if (params.brand) httpParams = httpParams.set('brand', params.brand);
    if (params.categoryId != null)
      httpParams = httpParams.set('categoryId', params.categoryId.toString());
    if (params.minPrice != null)
      httpParams = httpParams.set('minPrice', params.minPrice.toString());
    if (params.maxPrice != null)
      httpParams = httpParams.set('maxPrice', params.maxPrice.toString());
    if (params.inStock != null)
      httpParams = httpParams.set('inStock', params.inStock.toString());
    if (params.minRating != null)
      httpParams = httpParams.set('minRating', params.minRating.toString());
    if (params.isNew != null)
      httpParams = httpParams.set('isNew', params.isNew.toString());
    if (params.sort) httpParams = httpParams.set('sort', params.sort);
    if (params.page != null)
      httpParams = httpParams.set('page', params.page.toString());
    if (params.size != null)
      httpParams = httpParams.set('size', params.size.toString());

    return this.httpClient.get<SearchResponsePage>(
      `${environment.apiUrl}/products/search`,
      { params: httpParams },
    );
  }

  autocomplete(
    query: string,
    limit: number = 5,
  ): Observable<ProductSearchResult[]> {
    const params = new HttpParams()
      .set('q', query)
      .set('limit', limit.toString());
    return this.httpClient.get<ProductSearchResult[]>(
      `${environment.apiUrl}/products/autocomplete`,
      { params },
    );
  }

  getBrands(categoryId?: number): Observable<string[]> {
    let params = new HttpParams();
    if (categoryId != null)
      params = params.set('categoryId', categoryId.toString());
    return this.httpClient.get<string[]>(
      `${environment.apiUrl}/products/brands`,
      { params },
    );
  }

  getProductImages(productId: number): Observable<ProductImage[]> {
    return this.httpClient.get<ProductImage[]>(
      `${environment.apiUrl}/products/${productId}/images`,
    );
  }

  getProductVariants(productId: number): Observable<ProductVariant[]> {
    return this.httpClient.get<ProductVariant[]>(
      `${environment.apiUrl}/products/${productId}/variants`,
    );
  }

  getFeaturedProducts(
    page: number = 0,
    size: number = 10,
  ): Observable<SearchResponsePage> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.httpClient.get<SearchResponsePage>(
      `${environment.apiUrl}/products/featured`,
      { params },
    );
  }

  getNewArrivals(
    page: number = 0,
    size: number = 10,
  ): Observable<SearchResponsePage> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.httpClient.get<SearchResponsePage>(
      `${environment.apiUrl}/products/new-arrivals`,
      { params },
    );
  }

  validateStock(
    items: { productId: number; quantity: number }[],
  ): Observable<StockValidationResult> {
    return this.httpClient.post<StockValidationResult>(
      `${environment.apiUrl}/checkout/validate-stock`,
      { items },
    );
  }
}

// ── Response interfaces ──

interface GetResponseProducts {
  _embedded: {
    products: Product[];
  };
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

interface GetResponseProductCategory {
  _embedded: {
    productCategory: ProductCategory[];
  };
}

export interface SearchResponsePage {
  content: Product[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface StockValidationResult {
  valid: boolean;
  errors: {
    productId: number;
    productName: string;
    requestedQuantity: number;
    availableQuantity: number;
  }[];
}
