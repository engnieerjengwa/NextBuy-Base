import { Component } from '@angular/core';
import { SkeletonLoaderComponent } from '../skeleton-loader.component';

@Component({
  selector: 'app-product-card-skeleton',
  standalone: true,
  imports: [SkeletonLoaderComponent],
  template: `
    <div class="product-card-skeleton">
      <app-skeleton
        width="100%"
        height="200px"
        borderRadius="8px 8px 0 0"
        marginBottom="0"
      ></app-skeleton>
      <div class="details">
        <app-skeleton width="70%" height="14px"></app-skeleton>
        <app-skeleton width="100%" height="16px"></app-skeleton>
        <app-skeleton width="40%" height="20px"></app-skeleton>
        <app-skeleton
          width="100%"
          height="36px"
          borderRadius="4px"
        ></app-skeleton>
      </div>
    </div>
  `,
  styles: [
    `
      .product-card-skeleton {
        border: 1px solid #f0f0f0;
        border-radius: 8px;
        overflow: hidden;
      }
      .details {
        padding: 12px;
      }
    `,
  ],
})
export class ProductCardSkeletonComponent {}
