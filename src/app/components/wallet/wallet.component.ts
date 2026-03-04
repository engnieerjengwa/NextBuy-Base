import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  WalletService,
  WalletTransaction,
} from '../../services/wallet.service';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wallet.component.html',
  styleUrl: './wallet.component.css',
})
export class WalletComponent implements OnInit {
  balance: number = 0;
  transactions: WalletTransaction[] = [];
  isLoading = true;

  constructor(private walletService: WalletService) {}

  ngOnInit(): void {
    this.loadWallet();
  }

  loadWallet(): void {
    this.isLoading = true;
    this.walletService.getWallet().subscribe({
      next: (wallet) => {
        this.balance = wallet.balance;
        this.transactions = wallet.recentTransactions || [];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  getIcon(source: string): string {
    const icons: Record<string, string> = {
      REFUND: '↩️',
      GIFT_CARD: '🎁',
      LOYALTY_REWARD: '⭐',
      MANUAL_ADJUSTMENT: '🔧',
      REFERRAL_REWARD: '👥',
      PURCHASE: '🛒',
    };
    return icons[source] || '💰';
  }
}
