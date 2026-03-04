import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ReferralDetail {
  refereeEmail: string;
  status: string;
  rewardAmount: number;
  createdDate: string;
  completedDate: string;
}

export interface ReferralInfo {
  referralCode: string;
  shareUrl: string;
  totalReferrals: number;
  completedReferrals: number;
  totalEarned: number;
  referrals: ReferralDetail[];
}

export interface ReferralApplyResponse {
  message: string;
  rewardAmount: number;
}

@Injectable({ providedIn: 'root' })
export class ReferralService {
  private baseUrl = `${environment.apiUrl}/referrals`;

  constructor(private httpClient: HttpClient) {}

  getReferralInfo(): Observable<ReferralInfo> {
    return this.httpClient.get<ReferralInfo>(this.baseUrl);
  }

  applyReferralCode(referralCode: string): Observable<ReferralApplyResponse> {
    return this.httpClient.post<ReferralApplyResponse>(
      `${this.baseUrl}/apply`,
      {
        referralCode,
      },
    );
  }
}
