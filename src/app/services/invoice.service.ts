import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private baseUrl = `${environment.apiUrl}/orders`;

  constructor(private httpClient: HttpClient) {}

  downloadInvoice(orderId: number): Observable<Blob> {
    return this.httpClient.get(`${this.baseUrl}/${orderId}/invoice`, {
      responseType: 'blob',
    });
  }
}
