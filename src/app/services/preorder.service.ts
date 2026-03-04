import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PreOrderProduct {
  id: number;
  name: string;
  imageUrl: string;
  unitPrice: number;
  preorderReleaseDate: string;
  preorderMessage: string;
}

export interface PreOrderStatus {
  productId: number;
  productName: string;
  isPreorder: boolean;
  preorderReleaseDate: string;
  preorderMessage: string;
  availableForPreorder: boolean;
}

@Injectable({ providedIn: 'root' })
export class PreorderService {
  private baseUrl = `${environment.apiUrl}/preorders`;

  constructor(private httpClient: HttpClient) {}

  getPreOrderProducts(page: number = 0, size: number = 20): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.httpClient.get(this.baseUrl, { params });
  }

  getPreOrderStatus(productId: number): Observable<PreOrderStatus> {
    return this.httpClient.get<PreOrderStatus>(
      `${this.baseUrl}/${productId}/status`,
    );
  }

  placePreOrder(productId: number, quantity: number = 1): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}/${productId}`, null, {
      params: new HttpParams().set('quantity', quantity.toString()),
    });
  }
}
