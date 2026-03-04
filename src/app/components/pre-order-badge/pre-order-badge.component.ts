import { Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-pre-order-badge',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="preorder-badge">
      <span class="badge-icon">📦</span>
      <div class="badge-content">
        <span class="badge-label">PRE-ORDER</span>
        @if (releaseDate) {
          <span class="badge-date"
            >Expected: {{ releaseDate | date: 'mediumDate' }}</span
          >
        }
      </div>
    </div>
  `,
  styles: [
    `
      .preorder-badge {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 16px;
        background: #fff3e0;
        border: 1px solid #ff9800;
        border-radius: 8px;
        margin-bottom: 16px;
      }
      .badge-icon {
        font-size: 24px;
      }
      .badge-label {
        font-weight: 700;
        color: #e65100;
        font-size: 13px;
        letter-spacing: 1px;
      }
      .badge-date {
        font-size: 13px;
        color: #666;
        display: block;
      }
    `,
  ],
})
export class PreOrderBadgeComponent {
  @Input() releaseDate: string = '';
}
