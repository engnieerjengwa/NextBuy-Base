import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NexbuyCurrencyPipe } from '../../pipes/nexbuy-currency.pipe';
import {
  LoyaltyService,
  LoyaltyStatus,
  LoyaltyTransaction,
} from '../../services/loyalty.service';

type TierName = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

const TIER_CONFIG: Record<
  TierName,
  { threshold: number; multiplier: number; color: string; icon: string }
> = {
  BRONZE: { threshold: 0, multiplier: 1.0, color: '#CD7F32', icon: '🥉' },
  SILVER: { threshold: 500, multiplier: 1.25, color: '#C0C0C0', icon: '🥈' },
  GOLD: { threshold: 2000, multiplier: 1.5, color: '#FFD700', icon: '🥇' },
  PLATINUM: { threshold: 5000, multiplier: 2.0, color: '#E5E4E2', icon: '💎' },
};

@Component({
  selector: 'app-loyalty-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NexbuyCurrencyPipe],
  templateUrl: './loyalty-dashboard.component.html',
  styleUrl: './loyalty-dashboard.component.css',
})
export class LoyaltyDashboardComponent implements OnInit {
  program: LoyaltyStatus | null = null;
  transactions: LoyaltyTransaction[] = [];
  isLoading = true;
  redeemAmount = 100;
  isRedeeming = false;
  redeemSuccess = '';
  redeemError = '';

  tiers = [
    { name: 'BRONZE', ...TIER_CONFIG.BRONZE },
    { name: 'SILVER', ...TIER_CONFIG.SILVER },
    { name: 'GOLD', ...TIER_CONFIG.GOLD },
    { name: 'PLATINUM', ...TIER_CONFIG.PLATINUM },
  ];

  constructor(private loyaltyService: LoyaltyService) {}

  ngOnInit(): void {
    this.loadLoyaltyData();
  }

  loadLoyaltyData(): void {
    this.isLoading = true;
    this.loyaltyService.getLoyaltyStatus().subscribe({
      next: (data) => {
        this.program = data;
        this.transactions = data.recentTransactions || [];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  get tierIcon(): string {
    if (!this.program) return '';
    return TIER_CONFIG[this.program.tier as TierName]?.icon || '🥉';
  }

  get tierColor(): string {
    if (!this.program) return '#CD7F32';
    return TIER_CONFIG[this.program.tier as TierName]?.color || '#CD7F32';
  }

  get pointsValue(): number {
    if (!this.program) return 0;
    return this.program.totalPoints / 100;
  }

  get progressPercentage(): number {
    if (!this.program || !this.program.nextTier) return 100;
    const currentTierConfig = TIER_CONFIG[this.program.tier as TierName];
    const nextTierConfig = TIER_CONFIG[this.program.nextTier as TierName];
    if (!nextTierConfig) return 100;
    const range = nextTierConfig.threshold - currentTierConfig.threshold;
    const progress = this.program.lifetimePoints - currentTierConfig.threshold;
    return Math.min(100, (progress / range) * 100);
  }

  isAchieved(tierName: string): boolean {
    if (!this.program) return false;
    const tierOrder: TierName[] = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'];
    const currentIdx = tierOrder.indexOf(this.program.tier as TierName);
    const tierIdx = tierOrder.indexOf(tierName as TierName);
    return tierIdx <= currentIdx;
  }

  canRedeem(): boolean {
    return (
      this.redeemAmount >= 100 &&
      this.redeemAmount <= (this.program?.totalPoints || 0) &&
      this.redeemAmount % 100 === 0
    );
  }

  redeemPoints(): void {
    if (!this.canRedeem()) return;
    this.isRedeeming = true;
    this.redeemSuccess = '';
    this.redeemError = '';

    this.loyaltyService.redeemPoints(this.redeemAmount).subscribe({
      next: (result) => {
        this.isRedeeming = false;
        this.redeemSuccess = `Successfully redeemed ${this.redeemAmount} points for $${(this.redeemAmount / 100).toFixed(2)} store credit!`;
        if (this.program) {
          this.program = {
            ...this.program,
            totalPoints: result.remainingPoints,
          };
        }
        this.redeemAmount = 100;
      },
      error: (err) => {
        this.isRedeeming = false;
        this.redeemError =
          err.error?.message || 'Failed to redeem points. Please try again.';
      },
    });
  }
}
