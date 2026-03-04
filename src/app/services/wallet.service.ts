import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface WalletTransaction {
  id: number;
  amount: number;
  transactionType: string;
  source: string;
  description: string;
  referenceId: string;
  createdDate: string;
}

export interface Wallet {
  id: number;
  balance: number;
  currency: string;
  recentTransactions: WalletTransaction[];
}

@Injectable({ providedIn: 'root' })
export class WalletService {
  private baseUrl = `${environment.apiUrl}/wallet`;

  constructor(private httpClient: HttpClient) {}

  getWallet(): Observable<Wallet> {
    return this.httpClient.get<Wallet>(this.baseUrl);
  }
}
