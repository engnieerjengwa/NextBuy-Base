import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Product } from '../common/product';
import { ProductCategory } from '../common/product-category';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  // base URL for products (no query params here)
  private baseUrl = 'http://localhost:8080/api/products';

  private categoryUrl = 'http://localhost:8080/api/product-category';

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
}

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
