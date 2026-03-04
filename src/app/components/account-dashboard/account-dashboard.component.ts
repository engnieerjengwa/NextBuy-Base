import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderHistoryService } from '../../services/order-history.service';
import { WishlistService } from '../../services/wishlist.service';
import { SavedAddressService } from '../../services/saved-address.service';
import { OrderHistory } from '../../common/order-history';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-account-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './account-dashboard.component.html',
  styleUrl: './account-dashboard.component.css',
})
export class AccountDashboardComponent implements OnInit {
  userName: string = '';
  userEmail: string = '';
  recentOrders: OrderHistory[] = [];
  wishlistCount: number = 0;
  addressCount: number = 0;
  loading: boolean = true;

  constructor(
    private orderHistoryService: OrderHistoryService,
    private wishlistService: WishlistService,
    private savedAddressService: SavedAddressService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userEmail = currentUser.email || '';
      this.userName =
        `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() ||
        this.userEmail.split('@')[0];
    }

    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    let completed = 0;
    const checkDone = () => {
      if (++completed >= 3) this.loading = false;
    };

    // Load recent orders
    if (this.userEmail) {
      this.orderHistoryService.getOrderHistory(this.userEmail).subscribe({
        next: (data) => {
          const orders = data._embedded?.orders || [];
          orders.sort(
            (a: OrderHistory, b: OrderHistory) =>
              new Date(b.dateCreated).getTime() -
              new Date(a.dateCreated).getTime(),
          );
          this.recentOrders = orders.slice(0, 3);
          checkDone();
        },
        error: () => checkDone(),
      });
    } else {
      checkDone();
    }

    // Load wishlist count
    this.wishlistService.getWishlist().subscribe({
      next: (data) => {
        this.wishlistCount = data.items?.length || 0;
        checkDone();
      },
      error: () => checkDone(),
    });

    // Load address count
    this.savedAddressService.getAddresses().subscribe({
      next: (data) => {
        this.addressCount = data.length;
        checkDone();
      },
      error: () => checkDone(),
    });
  }

  getStatusClass(status: string): string {
    if (!status) return '';
    switch (status.toUpperCase()) {
      case 'DELIVERED':
        return 'status-success';
      case 'SHIPPED':
        return 'status-info';
      case 'PROCESSING':
        return 'status-warning';
      case 'CANCELLED':
        return 'status-danger';
      default:
        return 'status-default';
    }
  }
}
