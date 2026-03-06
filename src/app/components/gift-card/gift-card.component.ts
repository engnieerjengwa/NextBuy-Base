import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NexbuyCurrencyPipe } from '../../pipes/nexbuy-currency.pipe';
import { GiftCardService } from '../../services/gift-card.service';

@Component({
  selector: 'app-gift-card',
  standalone: true,
  imports: [CommonModule, FormsModule, NexbuyCurrencyPipe],
  templateUrl: './gift-card.component.html',
  styleUrl: './gift-card.component.css',
})
export class GiftCardComponent {
  presetAmounts = [10, 25, 50, 100];
  selectedAmount = 25;
  recipientName = '';
  recipientEmail = '';
  personalMessage = '';
  isPurchasing = false;
  purchaseSuccess = false;
  purchaseError = '';
  purchasedCode = '';

  balanceCheckCode = '';
  balanceResult: {
    currentBalance: number;
    expiryDate: string;
    status: string;
  } | null = null;
  balanceError = '';

  constructor(private giftCardService: GiftCardService) {}

  selectAmount(amount: number): void {
    this.selectedAmount = amount;
  }

  canPurchase(): boolean {
    return (
      this.recipientName.trim().length > 0 &&
      this.recipientEmail.trim().length > 0 &&
      this.recipientEmail.includes('@')
    );
  }

  purchaseGiftCard(): void {
    if (!this.canPurchase()) return;
    this.isPurchasing = true;
    this.purchaseError = '';

    this.giftCardService
      .purchaseGiftCard({
        amount: this.selectedAmount,
        recipientEmail: this.recipientEmail,
        recipientName: this.recipientName,
        personalMessage: this.personalMessage,
      })
      .subscribe({
        next: (result) => {
          this.isPurchasing = false;
          this.purchaseSuccess = true;
          this.purchasedCode = result.code;
        },
        error: (err) => {
          this.isPurchasing = false;
          this.purchaseError =
            err.error?.message ||
            'Failed to purchase gift card. Please try again.';
        },
      });
  }

  resetPurchase(): void {
    this.purchaseSuccess = false;
    this.purchasedCode = '';
    this.recipientName = '';
    this.recipientEmail = '';
    this.personalMessage = '';
    this.selectedAmount = 25;
  }

  checkBalance(): void {
    if (!this.balanceCheckCode.trim()) return;
    this.balanceError = '';
    this.balanceResult = null;

    this.giftCardService.checkGiftCard(this.balanceCheckCode.trim()).subscribe({
      next: (result) => {
        this.balanceResult = result;
      },
      error: () => {
        this.balanceError = 'Gift card not found or invalid code.';
      },
    });
  }
}
