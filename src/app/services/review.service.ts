import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review, ReviewRequest, RatingDistribution } from '../common/review';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private baseUrl = environment.apiUrl;

  constructor(private httpClient: HttpClient) {}

  getReviewsByProductId(
    productId: number,
    page: number = 0,
    size: number = 5,
    sort: string = 'dateCreated,desc',
    rating?: number,
  ): Observable<GetResponseReviews> {
    const url = `${this.baseUrl}/products/${productId}/reviews`;
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);
    if (rating) {
      params = params.set('rating', rating.toString());
    }
    return this.httpClient.get<GetResponseReviews>(url, { params });
  }

  getRatingDistribution(productId: number): Observable<RatingDistribution> {
    const url = `${this.baseUrl}/products/${productId}/reviews/distribution`;
    return this.httpClient.get<RatingDistribution>(url);
  }

  getMyReviews(
    page: number = 0,
    size: number = 10,
  ): Observable<GetResponseReviews> {
    const url = `${this.baseUrl}/reviews/my`;
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.httpClient.get<GetResponseReviews>(url, { params });
  }

  createReview(productId: number, review: ReviewRequest): Observable<Review> {
    const url = `${this.baseUrl}/products/${productId}/reviews`;
    return this.httpClient.post<Review>(url, review);
  }

  updateReview(reviewId: number, review: ReviewRequest): Observable<Review> {
    const url = `${this.baseUrl}/reviews/${reviewId}`;
    return this.httpClient.put<Review>(url, review);
  }

  deleteReview(reviewId: number): Observable<void> {
    const url = `${this.baseUrl}/reviews/${reviewId}`;
    return this.httpClient.delete<void>(url);
  }

  markReviewHelpful(reviewId: number): Observable<void> {
    const url = `${this.baseUrl}/reviews/${reviewId}/helpful`;
    return this.httpClient.post<void>(url, {});
  }
}

interface GetResponseReviews {
  content: Review[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
