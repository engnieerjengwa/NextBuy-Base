import { Component, OnInit } from '@angular/core';
import { OrderHistoryService } from '../../services/order-history.service';
import { OrderHistory, OrderHistoryItem } from '../../common/order-history';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { InvoiceService } from '../../services/invoice.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.css',
})
export class OrderHistoryComponent implements OnInit {
  orderHistoryList: OrderHistory[] = [];
  allOrdersList: OrderHistory[] = [];
  isFiltered: boolean = false;
  selectedPeriod: number = 3;
  filterOptions = [
    { value: 1, label: 'Last 30 days' },
    { value: 3, label: 'Last 3 months' },
    { value: 6, label: 'Last 6 months' },
    { value: 12, label: 'Last year' },
  ];

  reorderLoading: { [orderId: string]: boolean } = {};
  invoiceLoading: { [orderId: string]: boolean } = {};

  constructor(
    private orderHistoryService: OrderHistoryService,
    private productService: ProductService,
    private invoiceService: InvoiceService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.handleOrderHistory();
  }

  handleOrderHistory() {
    const currentUser = this.authService.getCurrentUser();
    const theEmail = currentUser?.email || null;
    const userName = currentUser
      ? `${currentUser.firstName} ${currentUser.lastName}`.trim()
      : null;

    // Only fetch order history if email is available
    if (theEmail) {
      // Retrieve data from the service
      this.orderHistoryService.getOrderHistory(theEmail).subscribe((data) => {
        this.allOrdersList = data._embedded.orders;

        // Sort orders by date in descending order (latest first)
        this.allOrdersList.sort(
          (a, b) =>
            new Date(b.dateCreated).getTime() -
            new Date(a.dateCreated).getTime(),
        );

        // Use actual order statuses from API — set delivery date if delivered
        this.allOrdersList.forEach((order) => {
          // Set delivery date if delivered and not already set
          if (order.status === 'DELIVERED' && !order.deliveryDate) {
            const deliveryDate = new Date(order.dateCreated);
            deliveryDate.setDate(deliveryDate.getDate() + 3);
            order.deliveryDate = deliveryDate;
          }

          // Set signed by information with the customer's real name
          order.signedBy = {
            name: userName || theEmail.split('@')[0],
            role: 'CUSTOMER',
          };

          // Fetch product details for each order if it has order items
          if (order.orderItems && order.orderItems.length > 0) {
            this.fetchProductDetails(order);
          }
        });

        this.filterOrdersByPeriod();
      });
    }
  }

  /**
   * Fetch product details for each order item to get the product name
   */
  fetchProductDetails(order: OrderHistory) {
    if (!order.orderItems || order.orderItems.length === 0) return;

    // Create a copy of the order items to avoid modifying the array while iterating
    const orderItems = [...order.orderItems];

    // For each order item, fetch the product details
    orderItems.forEach((item: OrderHistoryItem) => {
      this.productService.getProduct(item.productId).subscribe({
        next: (product) => {
          // Find the item in the original array and update its productName
          const index = order.orderItems!.findIndex((i) => i.id === item.id);
          if (index !== -1) {
            order.orderItems![index].productName = product.name;
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
   * Filter orders to show only those from the selected time period
   */
  filterOrdersByPeriod() {
    // Create a date for the selected period ago
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - this.selectedPeriod);

    // Filter orders based on the selected period
    this.orderHistoryList = this.allOrdersList.filter((order) => {
      const orderDate = new Date(order.dateCreated);
      return orderDate >= cutoffDate;
    });

    this.isFiltered = true;
  }

  /**
   * Reset filters to show all orders
   */
  resetFilters() {
    this.orderHistoryList = this.allOrdersList;
    this.isFiltered = false;
  }

  /**
   * Handle period change from dropdown
   */
  onPeriodChange() {
    this.filterOrdersByPeriod();
  }

  /**
   * Re-order: creates a new order with the same items
   */
  buyAgain(orderId: string) {
    this.reorderLoading[orderId] = true;
    this.orderHistoryService.reorder(+orderId).subscribe({
      next: (response) => {
        this.reorderLoading[orderId] = false;
        this.router.navigate(['/order-confirmation'], {
          queryParams: { tracking: response.orderTrackingNumber },
        });
      },
      error: (err) => {
        this.reorderLoading[orderId] = false;
        console.error('Error reordering:', err);
        alert('Failed to reorder. Please try again.');
      },
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

  downloadInvoice(orderId: string): void {
    this.invoiceLoading[orderId] = true;
    this.invoiceService.downloadInvoice(+orderId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoice-${orderId}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.invoiceLoading[orderId] = false;
      },
      error: (err) => {
        this.invoiceLoading[orderId] = false;
        console.error('Error downloading invoice:', err);
        alert('Failed to download invoice. Please try again.');
      },
    });
  }
}
