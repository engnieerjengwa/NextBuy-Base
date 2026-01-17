import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReturnService {

  private returnUrl = environment.apiUrl + '/returns';

  constructor(private httpClient: HttpClient) { }

  // Create a new return request
  createReturnRequest(returnRequest: any): Observable<any> {
    return this.httpClient.post<any>(this.returnUrl, returnRequest);
  }

  // Get a return request by ID
  getReturnRequestById(id: string): Observable<any> {
    return this.httpClient.get<any>(`${this.returnUrl}/${id}`);
  }

  // Get all return requests for an order
  getReturnRequestsByOrderId(orderId: string): Observable<any> {
    return this.httpClient.get<any>(`${this.returnUrl}/order/${orderId}`);
  }

  // Get all return requests for a customer
  getReturnRequestsByCustomerEmail(email: string): Observable<any> {
    return this.httpClient.get<any>(`${this.returnUrl}/customer?email=${email}`);
  }

  // Update the status of a return request
  updateReturnRequestStatus(id: string, status: string): Observable<any> {
    return this.httpClient.patch<any>(`${this.returnUrl}/${id}/status?status=${status}`, {});
  }
}
