import { Component, Input, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Review, ReviewRequest, RatingDistribution } from '../../common/review';
import { ReviewService } from '../../services/review.service';
import { RatingDistributionComponent } from '../rating-distribution/rating-distribution.component';

@Component({
  selector: 'app-review-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RatingDistributionComponent],
  templateUrl: './review-list.component.html',
  styleUrl: './review-list.component.css',
})
export class ReviewListComponent implements OnInit {
  @Input() productId!: number;

  reviews: Review[] = [];
  distribution: RatingDistribution | null = null;
  totalReviews: number = 0;
  currentPage: number = 0;
  pageSize: number = 5;
  totalPages: number = 0;
  sortBy: string = 'dateCreated,desc';
  filterRating: number | null = null;

  sortOptions = [
    { label: 'Most Recent', value: 'dateCreated,desc' },
    { label: 'Oldest First', value: 'dateCreated,asc' },
    { label: 'Highest Rated', value: 'rating,desc' },
    { label: 'Lowest Rated', value: 'rating,asc' },
    { label: 'Most Helpful', value: 'helpfulCount,desc' },
  ];

  // Review form
  showReviewForm: boolean = false;
  reviewRating: number = 0;
  reviewTitle: string = '';
  reviewComment: string = '';
  hoverRating: number = 0;
  editingReviewId: number | null = null;
  submitting: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  isLoggedIn: boolean = false;

  stars: number[] = [1, 2, 3, 4, 5];

  constructor(
    private reviewService: ReviewService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isLoggedIn = !!sessionStorage.getItem('userEmail');
    }
    this.loadReviews();
    this.loadDistribution();
  }

  loadReviews(): void {
    this.reviewService
      .getReviewsByProductId(
        this.productId,
        this.currentPage,
        this.pageSize,
        this.sortBy,
        this.filterRating ?? undefined,
      )
      .subscribe({
        next: (data) => {
          this.reviews = data.content;
          this.totalReviews = data.totalElements;
          this.totalPages = data.totalPages;
        },
        error: (err) => console.error('Error loading reviews', err),
      });
  }

  loadDistribution(): void {
    this.reviewService.getRatingDistribution(this.productId).subscribe({
      next: (data) => (this.distribution = data),
      error: (err) => console.error('Error loading distribution', err),
    });
  }

  onSortChange(): void {
    this.currentPage = 0;
    this.loadReviews();
  }

  onRatingFilter(rating: number): void {
    if (this.filterRating === rating) {
      this.filterRating = null; // toggle off
    } else {
      this.filterRating = rating;
    }
    this.currentPage = 0;
    this.loadReviews();
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadReviews();
    }
  }

  toggleReviewForm(): void {
    this.showReviewForm = !this.showReviewForm;
    if (!this.showReviewForm) this.resetForm();
  }

  setRating(rating: number): void {
    this.reviewRating = rating;
  }

  submitReview(): void {
    if (this.reviewRating === 0) {
      this.errorMessage = 'Please select a rating';
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    const request: ReviewRequest = {
      rating: this.reviewRating,
      title: this.reviewTitle,
      comment: this.reviewComment,
    };

    if (this.editingReviewId) {
      this.reviewService.updateReview(this.editingReviewId, request).subscribe({
        next: () => {
          this.successMessage = 'Review updated successfully!';
          this.resetForm();
          this.loadReviews();
          this.loadDistribution();
          this.submitting = false;
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to update review';
          this.submitting = false;
        },
      });
    } else {
      this.reviewService.createReview(this.productId, request).subscribe({
        next: () => {
          this.successMessage = 'Review submitted successfully!';
          this.resetForm();
          this.loadReviews();
          this.loadDistribution();
          this.submitting = false;
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to submit review';
          this.submitting = false;
        },
      });
    }
  }

  editReview(review: Review): void {
    this.editingReviewId = review.id;
    this.reviewRating = review.rating;
    this.reviewTitle = review.title;
    this.reviewComment = review.comment;
    this.showReviewForm = true;
  }

  deleteReview(reviewId: number): void {
    if (confirm('Are you sure you want to delete this review?')) {
      this.reviewService.deleteReview(reviewId).subscribe({
        next: () => {
          this.loadReviews();
          this.loadDistribution();
        },
        error: (err) => console.error('Error deleting review', err),
      });
    }
  }

  markHelpful(reviewId: number): void {
    this.reviewService.markReviewHelpful(reviewId).subscribe({
      next: () => this.loadReviews(),
      error: (err) => console.error('Error marking helpful', err),
    });
  }

  private resetForm(): void {
    this.showReviewForm = false;
    this.reviewRating = 0;
    this.reviewTitle = '';
    this.reviewComment = '';
    this.hoverRating = 0;
    this.editingReviewId = null;
  }

  getStarArray(): number[] {
    return this.stars;
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const reviewDate = new Date(date);
    const diffMs = now.getTime() - reviewDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }
}
