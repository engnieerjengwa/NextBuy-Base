import { Component } from '@angular/core';
import { SkeletonLoaderComponent } from '../skeleton-loader.component';

@Component({
  selector: 'app-order-row-skeleton',
  standalone: true,
  imports: [SkeletonLoaderComponent],
  template: `
    <div class="order-row-skeleton">
      <app-skeleton width="120px" height="14px"></app-skeleton>
      <app-skeleton width="80px" height="14px"></app-skeleton>
      <app-skeleton
        width="60px"
        height="24px"
        borderRadius="12px"
      ></app-skeleton>
      <app-skeleton width="100px" height="14px"></app-skeleton>
    </div>
  `,
  styles: [
    `
      .order-row-skeleton {
        display: flex;
        align-items: center;
        gap: 24px;
        padding: 16px;
        border-bottom: 1px solid #f0f0f0;
      }
    `,
  ],
})
export class OrderRowSkeletonComponent {}
