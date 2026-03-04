import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrderHistoryService } from '../../services/order-history.service';
import { OrderHistory, OrderHistoryItem } from '../../common/order-history';
import { OrderStatusHistory } from '../../common/order-status-history';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { OrderTrackingTimelineComponent } from '../order-tracking-timeline/order-tracking-timeline.component';
import { AuthService } from '../../services/auth.service';
import { InvoiceService } from '../../services/invoice.service';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    RouterLink,
    OrderTrackingTimelineComponent,
  ],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.css',
})
export class OrderDetailComponent implements OnInit {
  order: OrderHistory | undefined;
  orderId: string = '';
  isLoading: boolean = true;
  errorMessage: string = '';
  calculatedTotal: number = 0;
  deliveryCost: number = 0;
  statusHistory: OrderStatusHistory[] = [];
  cancelLoading: boolean = false;
  reorderLoading: boolean = false;
  invoiceLoading: boolean = false;

  constructor(
    private orderHistoryService: OrderHistoryService,
    private productService: ProductService,
    private authService: AuthService,
    private invoiceService: InvoiceService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('orderId');
      if (id) {
        this.orderId = id;
        this.getOrderDetails();
      } else {
        this.errorMessage = 'Order ID not found in URL';
        this.isLoading = false;
      }
    });
  }

  getOrderDetails() {
    this.isLoading = true;
    this.orderHistoryService.getOrderById(this.orderId).subscribe({
      next: (orderData) => {
        this.order = orderData;

        if (this.order) {
          // Use the actual status from the API response (no longer hardcoded)
          // Set delivery date if delivered and not already set
          if (this.order.status === 'DELIVERED' && !this.order.deliveryDate) {
            const deliveryDate = new Date(this.order.dateCreated);
            deliveryDate.setDate(deliveryDate.getDate() + 3);
            this.order.deliveryDate = deliveryDate;
          }

          // Set signed by information only when order has been delivered
          if (this.order.status === 'DELIVERED') {
            const currentUser = this.authService.getCurrentUser();
            const userName = currentUser
              ? `${currentUser.firstName} ${currentUser.lastName}`.trim()
              : null;
            const userEmail = currentUser?.email || null;

            this.order.signedBy = {
              name:
                userName || (userEmail ? userEmail.split('@')[0] : 'Customer'),
              role: 'CUSTOMER',
            };
          }

          // Fetch product details for each order item
          if (this.order.orderItems && this.order.orderItems.length > 0) {
            this.fetchProductDetails();
            this.calculateOrderTotal();
          }

          // Fetch tracking history
          this.fetchTrackingHistory();
        }

        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = `Error fetching order: ${err.message}`;
        this.isLoading = false;
      },
    });
  }

  /**
   * Fetch product details for each order item to get the product name
   */
  fetchProductDetails() {
    if (!this.order || !this.order.orderItems) return;

    // Create a copy of the order items to avoid modifying the array while iterating
    const orderItems = [...this.order.orderItems];

    // For each order item, fetch the product details
    orderItems.forEach((item: OrderHistoryItem) => {
      this.productService.getProduct(item.productId).subscribe({
        next: (product) => {
          // Find the item in the original array and update its productName
          const index = this.order!.orderItems!.findIndex(
            (i) => i.id === item.id,
          );
          if (index !== -1) {
            this.order!.orderItems![index].productName = product.name;
          }
        },
        error: (err) => {
          console.error(
            `Error fetching product details for product ID ${item.productId}:`,
            err,
          );
        },
      });
    });
  }

  /**
   * Returns CSS class based on order status
   */
  getStatusClass(status: string): string {
    if (!status) return 'status-default';

    switch (status.toUpperCase()) {
      case 'DELIVERED':
        return 'status-success';
      case 'SHIPPED':
        return 'status-info';
      case 'PROCESSING':
        return 'status-warning';
      case 'CANCELLED':
        return 'status-danger';
      case 'RETURNED':
        return 'status-secondary';
      default:
        return 'status-default';
    }
  }

  isEligibleForReturn(): boolean {
    if (!this.order) return false;
    return this.orderHistoryService.isEligibleForReturn(this.order);
  }

  logReturn() {
    this.router.navigate(['/orders', this.orderId, 'return']);
  }

  backToOrderHistory() {
    this.router.navigate(['/orders']);
  }

  viewInvoice() {
    if (!this.orderId) return;
    this.invoiceLoading = true;
    this.invoiceService.downloadInvoice(+this.orderId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoice-${this.orderId}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.invoiceLoading = false;
      },
      error: (err) => {
        this.invoiceLoading = false;
        console.error('Error downloading invoice:', err);
        alert('Failed to download invoice. Please try again.');
      },
    });
  }

  /**
   * Calculate the total price based on order items
   */
  calculateOrderTotal() {
    if (
      !this.order ||
      !this.order.orderItems ||
      this.order.orderItems.length === 0
    ) {
      this.calculatedTotal = 0;
      return;
    }

    this.calculatedTotal = this.order.orderItems.reduce((total, item) => {
      return total + item.unitPrice * item.quantity;
    }, 0);

    // Calculate delivery cost: difference between stored total and items subtotal
    if (this.order.totalPrice && this.order.totalPrice > this.calculatedTotal) {
      this.deliveryCost = this.order.totalPrice - this.calculatedTotal;
    } else {
      this.deliveryCost = 0;
    }
  }

  /**
   * Fetch order tracking / status history
   */
  fetchTrackingHistory() {
    const id = Number(this.orderId);
    if (isNaN(id)) return;

    this.orderHistoryService.getOrderTracking(id).subscribe({
      next: (history) => {
        this.statusHistory = history;
      },
      error: (err) => {
        console.error('Error fetching tracking history:', err);
      },
    });
  }

  /**
   * Cancel the order
   */
  cancelOrder() {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    this.cancelLoading = true;
    const id = Number(this.orderId);

    this.orderHistoryService.cancelOrder(id).subscribe({
      next: () => {
        this.cancelLoading = false;
        if (this.order) {
          this.order.status = 'CANCELLED';
        }
        this.fetchTrackingHistory();
      },
      error: (err) => {
        this.cancelLoading = false;
        console.error('Error cancelling order:', err);
        alert(err.error?.message || 'Failed to cancel order.');
      },
    });
  }

  /**
   * Re-order with same items
   */
  buyAgain() {
    this.reorderLoading = true;
    const id = Number(this.orderId);

    this.orderHistoryService.reorder(id).subscribe({
      next: (response) => {
        this.reorderLoading = false;
        this.router.navigate(['/order-confirmation'], {
          queryParams: { tracking: response.orderTrackingNumber },
        });
      },
      error: (err) => {
        this.reorderLoading = false;
        console.error('Error reordering:', err);
        alert('Failed to reorder. Please try again.');
      },
    });
  }

  /**
   * Check if order can be cancelled
   */
  canCancel(): boolean {
    if (!this.order) return false;
    const status = this.order.status?.toUpperCase();
    return (
      status === 'PROCESSING' || status === 'CONFIRMED' || status === 'PENDING'
    );
  }
}
