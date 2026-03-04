import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface GiftCard {
  id: number;
  code: string;
  initialBalance: number;
  currentBalance: number;
  purchaserEmail: string;
  recipientEmail: string;
  recipientName: string;
  personalMessage: string;
  status: string;
  expiryDate: string;
  createdDate: string;
}

export interface GiftCardPurchaseRequest {
  amount: number;
  recipientEmail: string;
  recipientName: string;
  personalMessage: string;
}

export interface GiftCardRedeemRequest {
  code: string;
}

export interface GiftCardCheckResponse {
  code: string;
  currentBalance: number;
  status: string;
  expiryDate: string;
  valid: boolean;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class GiftCardService {
  private baseUrl = `${environment.apiUrl}/gift-cards`;

  constructor(private httpClient: HttpClient) {}

  purchaseGiftCard(request: GiftCardPurchaseRequest): Observable<GiftCard> {
    return this.httpClient.post<GiftCard>(`${this.baseUrl}/purchase`, request);
  }

  redeemGiftCard(code: string): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}/redeem`, { code });
  }

  checkGiftCard(code: string): Observable<GiftCardCheckResponse> {
    return this.httpClient.get<GiftCardCheckResponse>(
      `${this.baseUrl}/check/${code}`,
    );
  }

  getMyGiftCards(): Observable<GiftCard[]> {
    return this.httpClient.get<GiftCard[]>(`${this.baseUrl}/my-cards`);
  }
}
