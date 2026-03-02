import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OrderHistory } from '../common/order-history';
import { OrderStatusHistory } from '../common/order-status-history';
import { PurchaseResponse } from '../common/purchase-response';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OrderHistoryService {
  private orderUrl = environment.apiUrl + '/orders';

  constructor(private httpClient: HttpClient) {}

  getOrderHistory(email: string): Observable<GetResponseOrderHistory> {
    // Build URL based on the customer email
    const orderHistoryUrl = `${this.orderUrl}/search/findByCustomerEmail?email=${email}`;

    return this.httpClient.get<GetResponseOrderHistory>(orderHistoryUrl);
  }

  getOrderById(orderId: string): Observable<OrderHistory> {
    // Build URL based on the order ID
    const orderUrl = `${this.orderUrl}/${orderId}`;

    return this.httpClient.get<OrderHistory>(orderUrl);
  }

  getOrderTracking(orderId: number): Observable<OrderStatusHistory[]> {
    const url = `${this.orderUrl}/${orderId}/tracking`;
    return this.httpClient.get<OrderStatusHistory[]>(url);
  }

  cancelOrder(orderId: number): Observable<any> {
    const url = `${this.orderUrl}/${orderId}/cancel`;
    return this.httpClient.patch<any>(url, {});
  }

  reorder(orderId: number): Observable<PurchaseResponse> {
    const url = `${this.orderUrl}/${orderId}/reorder`;
    return this.httpClient.post<PurchaseResponse>(url, {});
  }

  // Check if an order is eligible for return
  isEligibleForReturn(order: OrderHistory): boolean {
    // Order must be delivered
    if (order.status !== 'DELIVERED') {
      return false;
    }

    // Order must not be already returned
    if (order.isReturned) {
      return false;
    }

    // Check if order is within return window (e.g., 30 days)
    if (order.deliveryDate) {
      const deliveryDate = new Date(order.deliveryDate);
      const returnDeadline = new Date(deliveryDate);
      returnDeadline.setDate(returnDeadline.getDate() + 30); // 30-day return window

      if (new Date() > returnDeadline) {
        return false; // Return window has expired
      }
    } else {
      return false; // No delivery date, can't determine eligibility
    }

    return true;
  }
}

interface GetResponseOrderHistory {
  _embedded: {
    orders: OrderHistory[];
  };
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

// This interface is used to map the response from the backend to the frontend model
// It ensures that order items are properly included in the OrderHistory objects
