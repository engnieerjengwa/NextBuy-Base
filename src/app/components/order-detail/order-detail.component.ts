import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrderHistoryService } from '../../services/order-history.service';
import { OrderHistory, OrderHistoryItem } from '../../common/order-history';
import { CommonModule, CurrencyPipe, isPlatformBrowser } from '@angular/common';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.css',
})
export class OrderDetailComponent implements OnInit {
  order: OrderHistory | undefined;
  orderId: string = '';
  isLoading: boolean = true;
  errorMessage: string = '';
  calculatedTotal: number = 0;

  constructor(
    private orderHistoryService: OrderHistoryService,
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
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

          // Set signed by information with the customer's real name
          let userName: string | null = null;
          let userEmail: string | null = null;
          if (isPlatformBrowser(this.platformId)) {
            userName = JSON.parse(sessionStorage.getItem('userName')!);
            userEmail = JSON.parse(sessionStorage.getItem('userEmail')!);
          }

          this.order.signedBy = {
            name:
              userName || (userEmail ? userEmail.split('@')[0] : 'Customer'),
            role: 'CUSTOMER',
          };

          // Fetch product details for each order item
          if (this.order.orderItems && this.order.orderItems.length > 0) {
            this.fetchProductDetails();
            this.calculateOrderTotal();
          }
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
    // Placeholder for future invoice functionality
    alert('View Invoice functionality will be implemented in a future update.');
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
  }
}
