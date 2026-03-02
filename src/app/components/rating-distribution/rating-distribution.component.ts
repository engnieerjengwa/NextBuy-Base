import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RatingDistribution, RatingCount } from '../../common/review';

@Component({
  selector: 'app-rating-distribution',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rating-distribution.component.html',
  styleUrl: './rating-distribution.component.css',
})
export class RatingDistributionComponent {
  @Input() distribution!: RatingDistribution;
  @Input() activeRating: number | null = null;
  @Output() ratingClicked = new EventEmitter<number>();

  get sortedRatings(): RatingCount[] {
    if (!this.distribution?.ratingCounts) return [];
    return [...this.distribution.ratingCounts].sort(
      (a, b) => b.rating - a.rating,
    );
  }

  getStarArray(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }

  onRatingClick(rating: number): void {
    this.ratingClicked.emit(rating);
  }
}
