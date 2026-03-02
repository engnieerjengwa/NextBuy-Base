import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface BrowsingHistoryItem {
  productId: number;
  categoryId?: number;
  timestamp: number;
}

@Injectable({
  providedIn: 'root',
})
export class BrowsingHistoryService {
  private readonly storageKey = 'nexbuy_browsing_history';
  private readonly maxItems = 50;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  addToHistory(productId: number, categoryId?: number): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const history = this.getHistory();

    // Remove existing entry for same product
    const filtered = history.filter((item) => item.productId !== productId);

    // Add new entry at beginning
    filtered.unshift({
      productId,
      categoryId,
      timestamp: Date.now(),
    });

    // Trim to max items
    const trimmed = filtered.slice(0, this.maxItems);

    localStorage.setItem(this.storageKey, JSON.stringify(trimmed));
  }

  getRecentProductIds(limit: number = 20): number[] {
    return this.getHistory()
      .slice(0, limit)
      .map((item) => item.productId);
  }

  getRecentCategoryId(): number | null {
    const history = this.getHistory();
    const withCategory = history.find((item) => item.categoryId != null);
    return withCategory?.categoryId ?? null;
  }

  clearHistory(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.removeItem(this.storageKey);
  }

  getHistoryCount(): number {
    return this.getHistory().length;
  }

  private getHistory(): BrowsingHistoryItem[] {
    if (!isPlatformBrowser(this.platformId)) return [];

    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
}
