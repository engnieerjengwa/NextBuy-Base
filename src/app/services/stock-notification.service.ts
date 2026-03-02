import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StockNotificationService {
  private baseUrl = environment.apiUrl;

  constructor(private httpClient: HttpClient) {}

  subscribe(productId: number, email: string): Observable<void> {
    const url = `${this.baseUrl}/products/${productId}/notify-restock`;
    return this.httpClient.post<void>(url, { productId, email });
  }

  isSubscribed(
    productId: number,
    email: string,
  ): Observable<{ subscribed: boolean }> {
    const url = `${this.baseUrl}/products/${productId}/notify-restock?email=${email}`;
    return this.httpClient.get<{ subscribed: boolean }>(url);
  }
}
