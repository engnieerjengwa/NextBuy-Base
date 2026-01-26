import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductCategory } from '../common/product-category';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private baseUrl = 'http://localhost:8080/api/categories';

  constructor(private httpClient: HttpClient) { }

  /**
   * Get all categories
   * @returns Observable of all categories
   */
  getAllCategories(): Observable<ProductCategory[]> {
    return this.httpClient.get<ProductCategory[]>(this.baseUrl);
  }

  /**
   * Get a category by ID
   * @param id The category ID
   * @returns Observable of the category
   */
  getCategoryById(id: number): Observable<ProductCategory> {
    return this.httpClient.get<ProductCategory>(`${this.baseUrl}/${id}`);
  }

  /**
   * Get a category by slug
   * @param slug The category slug
   * @returns Observable of the category
   */
  getCategoryBySlug(slug: string): Observable<ProductCategory> {
    return this.httpClient.get<ProductCategory>(`${this.baseUrl}/slug/${slug}`);
  }

  /**
   * Get all top-level categories (categories with no parent)
   * @returns Observable of top-level categories
   */
  getTopLevelCategories(): Observable<ProductCategory[]> {
    return this.httpClient.get<ProductCategory[]>(`${this.baseUrl}/top-level`);
  }

  /**
   * Get all active top-level categories
   * @returns Observable of active top-level categories
   */
  getActiveTopLevelCategories(): Observable<ProductCategory[]> {
    return this.httpClient.get<ProductCategory[]>(`${this.baseUrl}/top-level/active`);
  }

  /**
   * Get all subcategories of a given parent category
   * @param parentId The parent category ID
   * @returns Observable of subcategories
   */
  getSubcategories(parentId: number): Observable<ProductCategory[]> {
    return this.httpClient.get<ProductCategory[]>(`${this.baseUrl}/subcategories/${parentId}`);
  }

  /**
   * Get all active subcategories of a given parent category
   * @param parentId The parent category ID
   * @returns Observable of active subcategories
   */
  getActiveSubcategories(parentId: number): Observable<ProductCategory[]> {
    return this.httpClient.get<ProductCategory[]>(`${this.baseUrl}/subcategories/${parentId}/active`);
  }

  /**
   * Get the complete category tree
   * @returns Observable of the category tree
   */
  getCategoryTree(): Observable<ProductCategory[]> {
    return this.httpClient.get<ProductCategory[]>(`${this.baseUrl}/tree`);
  }

  /**
   * Create a new category
   * @param category The category to create
   * @returns Observable of the created category
   */
  createCategory(category: ProductCategory): Observable<ProductCategory> {
    return this.httpClient.post<ProductCategory>(this.baseUrl, category);
  }

  /**
   * Update an existing category
   * @param id The category ID
   * @param category The updated category data
   * @returns Observable of the updated category
   */
  updateCategory(id: number, category: ProductCategory): Observable<ProductCategory> {
    return this.httpClient.put<ProductCategory>(`${this.baseUrl}/${id}`, category);
  }

  /**
   * Delete a category
   * @param id The category ID
   * @returns Observable of the HTTP response
   */
  deleteCategory(id: number): Observable<any> {
    return this.httpClient.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Update the display order of categories
   * @param categoryIds List of category IDs in the desired order
   * @returns Observable of the HTTP response
   */
  updateCategoryOrder(categoryIds: number[]): Observable<any> {
    return this.httpClient.put(`${this.baseUrl}/order`, categoryIds);
  }

  /**
   * Generate a slug from a category name
   * @param name The category name
   * @returns Observable of the generated slug
   */
  generateSlug(name: string): Observable<{ slug: string }> {
    return this.httpClient.post<{ slug: string }>(`${this.baseUrl}/generate-slug`, { name });
  }
}
