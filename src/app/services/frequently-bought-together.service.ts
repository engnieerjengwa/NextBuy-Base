import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface FrequentlyBoughtTogetherItem {
  productId: number;
  productName: string;
  productImageUrl: string;
  unitPrice: number;
  bundlePrice: number;
  discountPercentage: number;
  coPurchaseCount: number;
}

@Injectable({ providedIn: 'root' })
export class FrequentlyBoughtTogetherService {
  private baseUrl = `${environment.apiUrl}/products`;

  constructor(private httpClient: HttpClient) {}

  getFrequentlyBoughtTogether(
    productId: number,
  ): Observable<FrequentlyBoughtTogetherItem[]> {
    return this.httpClient.get<FrequentlyBoughtTogetherItem[]>(
      `${this.baseUrl}/${productId}/frequently-bought-together`,
    );
  }
}
