import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoyaltyTransaction {
  id: number;
  points: number;
  type: string;
  source: string;
  description: string;
  orderId: number;
  createdDate: string;
}

export interface LoyaltyStatus {
  tier: string;
  totalPoints: number;
  lifetimePoints: number;
  nextTier: string;
  pointsToNextTier: number;
  progressPercentage: number;
  recentTransactions: LoyaltyTransaction[];
  tierBenefits: { [key: string]: string };
}

export interface LoyaltyRedeemResponse {
  pointsRedeemed: number;
  creditAmount: number;
  remainingPoints: number;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class LoyaltyService {
  private baseUrl = `${environment.apiUrl}/loyalty`;

  constructor(private httpClient: HttpClient) {}

  getLoyaltyStatus(): Observable<LoyaltyStatus> {
    return this.httpClient.get<LoyaltyStatus>(this.baseUrl);
  }

  redeemPoints(points: number): Observable<LoyaltyRedeemResponse> {
    return this.httpClient.post<LoyaltyRedeemResponse>(
      `${this.baseUrl}/redeem`,
      { points },
    );
  }
}
