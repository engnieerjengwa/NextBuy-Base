import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CouponValidationResponse {
  valid: boolean;
  code: string;
  discountType: string;
  discountValue: number;
  message: string;
}

export interface CouponApplyRequest {
  code: string;
  orderAmount: number;
}

export interface CouponApplyResponse {
  code: string;
  discountType: string;
  discountValue: number;
  discountAmount: number;
  finalAmount: number;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class CouponService {
  private baseUrl = `${environment.apiUrl}/coupons`;

  constructor(private httpClient: HttpClient) {}

  validateCoupon(code: string): Observable<CouponValidationResponse> {
    return this.httpClient.post<CouponValidationResponse>(
      `${this.baseUrl}/validate`,
      { code },
    );
  }

  applyCoupon(
    code: string,
    orderAmount: number,
  ): Observable<CouponApplyResponse> {
    return this.httpClient.post<CouponApplyResponse>(`${this.baseUrl}/apply`, {
      code,
      orderAmount,
    });
  }
}
