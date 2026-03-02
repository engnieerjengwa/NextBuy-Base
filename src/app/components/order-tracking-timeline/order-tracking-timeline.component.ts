import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  OrderStatusHistory,
  ORDER_STATUS_FLOW,
} from '../../common/order-status-history';

interface TimelineStep {
  status: string;
  label: string;
  icon: string;
  reached: boolean;
  active: boolean;
  date?: Date;
  notes?: string;
}

@Component({
  selector: 'app-order-tracking-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-tracking-timeline.component.html',
  styleUrl: './order-tracking-timeline.component.css',
})
export class OrderTrackingTimelineComponent implements OnInit, OnChanges {
  @Input() statusHistory: OrderStatusHistory[] = [];
  @Input() currentStatus: string = '';

  steps: TimelineStep[] = [];

  private statusIcons: Record<string, string> = {
    PLACED: 'fa-shopping-cart',
    CONFIRMED: 'fa-check',
    PROCESSING: 'fa-cog',
    SHIPPED: 'fa-truck',
    OUT_FOR_DELIVERY: 'fa-shipping-fast',
    DELIVERED: 'fa-check-circle',
  };

  private statusLabels: Record<string, string> = {
    PLACED: 'Order Placed',
    CONFIRMED: 'Confirmed',
    PROCESSING: 'Processing',
    SHIPPED: 'Shipped',
    OUT_FOR_DELIVERY: 'Out for Delivery',
    DELIVERED: 'Delivered',
  };

  ngOnInit(): void {
    this.buildTimeline();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['statusHistory'] || changes['currentStatus']) {
      this.buildTimeline();
    }
  }

  buildTimeline(): void {
    // Build a map of status -> history entry
    const historyMap = new Map<string, OrderStatusHistory>();
    for (const entry of this.statusHistory) {
      historyMap.set(entry.status, entry);
    }

    // Determine current status index
    const currentIdx = ORDER_STATUS_FLOW.indexOf(this.currentStatus);

    this.steps = ORDER_STATUS_FLOW.map((status, index) => {
      const historyEntry = historyMap.get(status);
      const reached = index <= currentIdx;
      const active = status === this.currentStatus;

      return {
        status,
        label: this.statusLabels[status] || status,
        icon: this.statusIcons[status] || 'fa-circle',
        reached,
        active,
        date: historyEntry?.createdAt,
        notes: historyEntry?.note,
      };
    });
  }

  isCancelled(): boolean {
    return this.currentStatus === 'CANCELLED';
  }
}
