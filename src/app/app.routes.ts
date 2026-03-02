import {
  Routes,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductDetailsComponent } from './components/product-details/product-details.component';
import { CartDetailsComponent } from './components/cart-details/cart-details.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { OrderHistoryComponent } from './components/order-history/order-history.component';
import { OrderDetailComponent } from './components/order-detail/order-detail.component';
import { LogReturnComponent } from './components/log-return/log-return.component';
import { OrderConfirmationComponent } from './components/order-confirmation/order-confirmation.component';
import { authGuard } from './guards/auth.guard';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AccountDashboardComponent } from './components/account-dashboard/account-dashboard.component';
import { WishlistComponent } from './components/wishlist/wishlist.component';
import { AddressBookComponent } from './components/address-book/address-book.component';

export const routes: Routes = [
  // Auth routes
  { path: 'login', component: LoginComponent, data: { breadcrumb: 'Login' } },
  {
    path: 'register',
    component: RegisterComponent,
    data: { breadcrumb: 'Register' },
  },

  // Order routes with authentication
  {
    path: 'orders',
    component: OrderHistoryComponent,
    data: { breadcrumb: 'My Orders' },
    canActivate: [
      (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) =>
        authGuard(route, state),
    ],
  },
  {
    path: 'orders/:orderId',
    component: OrderDetailComponent,
    data: { breadcrumb: 'Order Details' },
    canActivate: [
      (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) =>
        authGuard(route, state),
    ],
  },
  {
    path: 'orders/:orderId/return',
    component: LogReturnComponent,
    data: { breadcrumb: 'Log Return' },
    canActivate: [
      (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) =>
        authGuard(route, state),
    ],
  },

  // Legacy route for backward compatibility
  { path: 'order-history', redirectTo: '/orders', pathMatch: 'full' },

  // Order confirmation (no auth guard - allows guest checkout)
  {
    path: 'order-confirmation',
    component: OrderConfirmationComponent,
    data: { breadcrumb: 'Order Confirmation' },
  },

  // Checkout (no auth guard - allows guest checkout)
  {
    path: 'checkout',
    component: CheckoutComponent,
    data: { breadcrumb: 'Checkout' },
  },

  // Account routes
  {
    path: 'account',
    component: AccountDashboardComponent,
    data: { breadcrumb: 'My Account' },
    canActivate: [
      (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) =>
        authGuard(route, state),
    ],
  },
  {
    path: 'account/wishlist',
    component: WishlistComponent,
    data: { breadcrumb: 'My Wishlist' },
    canActivate: [
      (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) =>
        authGuard(route, state),
    ],
  },
  {
    path: 'account/addresses',
    component: AddressBookComponent,
    data: { breadcrumb: 'Address Book' },
    canActivate: [
      (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) =>
        authGuard(route, state),
    ],
  },
  {
    path: 'cart-details',
    component: CartDetailsComponent,
    data: { breadcrumb: 'Cart' },
  },
  {
    path: 'products/:id',
    component: ProductDetailsComponent,
    data: { breadcrumb: 'Product Details' },
  },
  { path: 'search/:keyword', component: ProductListComponent },
  { path: 'category/:id/:name', component: ProductListComponent },
  { path: 'category', component: ProductListComponent },
  { path: 'products', component: ProductListComponent },
  { path: '', redirectTo: '/products', pathMatch: 'full' },
  { path: '**', redirectTo: '/products', pathMatch: 'full' },
];
