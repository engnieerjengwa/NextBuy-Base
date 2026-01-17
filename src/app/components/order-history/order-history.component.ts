import { Component, OnInit } from '@angular/core';
import { OrderHistoryService } from '../../services/order-history.service';
import { OrderHistory, OrderHistoryItem } from '../../common/order-history';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.css'
})
export class OrderHistoryComponent implements OnInit {

  orderHistoryList: OrderHistory[] = [];
  allOrdersList: OrderHistory[] = [];
  storage: Storage = sessionStorage;
  isFiltered: boolean = false;
  selectedPeriod: number = 3;
  filterOptions = [
    { value: 1, label: 'Last 30 days' },
    { value: 3, label: 'Last 3 months' },
    { value: 6, label: 'Last 6 months' },
    { value: 12, label: 'Last year' }
  ];

  constructor(
    private orderHistoryService: OrderHistoryService,
    private productService: ProductService
  ) { }

  ngOnInit(): void {
    this.handleOrderHistory();
  }

  handleOrderHistory() {
    const theEmail = JSON.parse(this.storage.getItem('userEmail')!);
    const userName = JSON.parse(this.storage.getItem('userName')!);

    // Only fetch order history if email is available
    if (theEmail) {
      // Retrieve data from the service
      this.orderHistoryService.getOrderHistory(theEmail).subscribe(
        data => {
          this.allOrdersList = data._embedded.orders;

          // Treat all orders as delivered and signed for by the customer
          this.allOrdersList.forEach(order => {
            // Set status to DELIVERED
            order.status = 'DELIVERED';

            // Set delivery date (using order creation date if not already set)
            if (!order.deliveryDate) {
              // Set delivery date to 3 days after order creation
              const deliveryDate = new Date(order.dateCreated);
              deliveryDate.setDate(deliveryDate.getDate() + 3);
              order.deliveryDate = deliveryDate;
            }

            // Set signed by information with the customer's real name
            order.signedBy = {
              name: userName || theEmail.split('@')[0], // Use username or first part of email if name not available
              role: 'CUSTOMER'
            };

            // Fetch product details for each order if it has order items
            if (order.orderItems && order.orderItems.length > 0) {
              this.fetchProductDetails(order);
            }
          });

          this.filterOrdersByPeriod();
        }
      );
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
          const index = order.orderItems!.findIndex(i => i.id === item.id);
          if (index !== -1) {
            order.orderItems![index].productName = product.name;
          }
        },
        error: (err) => {
          console.error(`Error fetching product details for product ID ${item.productId}:`, err);
        }
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
    this.orderHistoryList = this.allOrdersList.filter(order => {
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
   * Returns CSS class based on order status
   */
  getStatusClass(status: string): string {
    if (!status) return 'status-default';

    switch(status.toUpperCase()) {
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
}
