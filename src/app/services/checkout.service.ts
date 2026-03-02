import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Purchase } from '../common/purchase';
import { PurchaseResponse } from '../common/purchase-response';
import { PaymentInfo } from '../common/payment-info';
import { GuestCheckoutRequest } from '../common/guest-checkout';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  private purchaseUrl = `${environment.apiUrl}/checkout/purchase`;
  private guestCheckoutUrl = `${environment.apiUrl}/checkout/guest`;
  private paymentIntentUrl = `${environment.apiUrl}/checkout/payment-intent`;

  constructor(private httpClient: HttpClient) {}

  placeOrder(purchase: Purchase): Observable<PurchaseResponse> {
    return this.httpClient.post<PurchaseResponse>(this.purchaseUrl, purchase);
  }

  placeGuestOrder(request: GuestCheckoutRequest): Observable<PurchaseResponse> {
    return this.httpClient.post<PurchaseResponse>(
      this.guestCheckoutUrl,
      request,
    );
  }

  createPaymentIntent(paymentInfo: PaymentInfo): Observable<any> {
    return this.httpClient.post<any>(this.paymentIntentUrl, paymentInfo);
  }
}
