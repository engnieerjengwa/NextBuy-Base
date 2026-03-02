import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Wishlist, WishlistItem } from '../common/wishlist';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private wishlistUrl = `${environment.apiUrl}/wishlist`;

  constructor(private httpClient: HttpClient) {}

  getWishlist(): Observable<Wishlist> {
    return this.httpClient.get<Wishlist>(this.wishlistUrl);
  }

  addToWishlist(productId: number): Observable<WishlistItem> {
    const url = `${this.wishlistUrl}/items/${productId}`;
    return this.httpClient.post<WishlistItem>(url, {});
  }

  removeFromWishlist(productId: number): Observable<void> {
    const url = `${this.wishlistUrl}/items/${productId}`;
    return this.httpClient.delete<void>(url);
  }

  isInWishlist(productId: number): Observable<{ inWishlist: boolean }> {
    const url = `${this.wishlistUrl}/items/${productId}/check`;
    return this.httpClient.get<{ inWishlist: boolean }>(url);
  }
}
