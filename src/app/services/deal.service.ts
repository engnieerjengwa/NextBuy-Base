import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SaleEvent } from '../common/sale-event';

export interface DealProduct {
  productId: number;
  productName: string;
  productImageUrl: string;
  originalPrice: number;
  dealPrice: number;
  discountPercentage: number;
}

export interface Deal {
  id: number;
  title: string;
  description: string;
  dealType: string;
  startDate: string;
  endDate: string;
  discountPercentage: number;
  bannerImageUrl: string;
  remainingSeconds: number;
  active: boolean;
  products: DealProduct[];
}

@Injectable({ providedIn: 'root' })
export class DealService {
  private baseUrl = `${environment.apiUrl}/deals`;

  constructor(private httpClient: HttpClient) {}

  getActiveDeals(): Observable<Deal[]> {
    return this.httpClient.get<Deal[]>(this.baseUrl);
  }

  getDailyDeals(): Observable<Deal[]> {
    return this.httpClient.get<Deal[]>(`${this.baseUrl}/daily`);
  }

  getFlashSales(): Observable<Deal[]> {
    return this.httpClient.get<Deal[]>(`${this.baseUrl}/flash-sales`);
  }

  getDealById(dealId: number): Observable<Deal> {
    return this.httpClient.get<Deal>(`${this.baseUrl}/${dealId}`);
  }

  getSaleEvent(slug: string): Observable<SaleEvent> {
    return this.httpClient.get<SaleEvent>(`${this.baseUrl}/events/${slug}`);
  }

  getActiveSaleEvents(): Observable<SaleEvent[]> {
    return this.httpClient.get<SaleEvent[]>(`${this.baseUrl}/events`);
  }
}
