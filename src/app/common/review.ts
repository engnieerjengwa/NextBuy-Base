export interface Review {
  id: number;
  productId: number;
  customerId: number;
  customerFirstName: string;
  customerLastName: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
  dateCreated: Date;
}

export interface ReviewRequest {
  productId?: number;
  rating: number;
  title: string;
  comment: string;
}

export interface RatingDistribution {
  averageRating: number;
  totalReviews: number;
  ratingCounts: RatingCount[];
}

export interface RatingCount {
  rating: number;
  count: number;
  percentage: number;
}
