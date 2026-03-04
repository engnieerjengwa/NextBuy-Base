import { Component, Input } from '@angular/core';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [NgStyle],
  template: `<div class="skeleton" [ngStyle]="styles"></div>`,
  styles: [
    `
      .skeleton {
        background: linear-gradient(
          90deg,
          #f0f0f0 25%,
          #e0e0e0 50%,
          #f0f0f0 75%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
        border-radius: 4px;
      }
      @keyframes shimmer {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .skeleton {
          animation: none;
          background: #f0f0f0;
        }
      }
    `,
  ],
})
export class SkeletonLoaderComponent {
  @Input() width: string = '100%';
  @Input() height: string = '16px';
  @Input() borderRadius: string = '4px';
  @Input() marginBottom: string = '8px';

  get styles() {
    return {
      width: this.width,
      height: this.height,
      borderRadius: this.borderRadius,
      marginBottom: this.marginBottom,
    };
  }
}
