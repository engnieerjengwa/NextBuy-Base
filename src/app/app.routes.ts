import {
  Routes,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { ServerErrorComponent } from './components/server-error/server-error.component';

export const routes: Routes = [
  // Auth routes (lazy)
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then(
        (m) => m.LoginComponent,
      ),
    data: { breadcrumb: 'Login' },
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./components/register/register.component').then(
        (m) => m.RegisterComponent,
      ),
    data: { breadcrumb: 'Register' },
  },

  // Order routes with authentication (lazy)
  {
    path: 'orders',
    loadComponent: () =>
      import('./components/order-history/order-history.component').then(
        (m) => m.OrderHistoryComponent,
      ),
    data: { breadcrumb: 'My Orders' },
    canActivate: [
      (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) =>
        authGuard(route, state),
    ],
  },
  {
    path: 'orders/:orderId',
    loadComponent: () =>
      import('./components/order-detail/order-detail.component').then(
        (m) => m.OrderDetailComponent,
      ),
    data: { breadcrumb: 'Order Details' },
    canActivate: [
      (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) =>
        authGuard(route, state),
    ],
  },
  {
    path: 'orders/:orderId/return',
    loadComponent: () =>
      import('./components/log-return/log-return.component').then(
        (m) => m.LogReturnComponent,
      ),
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
    loadComponent: () =>
      import('./components/order-confirmation/order-confirmation.component').then(
        (m) => m.OrderConfirmationComponent,
      ),
    data: { breadcrumb: 'Order Confirmation' },
  },

  // Checkout (requires authentication, lazy)
  {
    path: 'checkout',
    loadComponent: () =>
      import('./components/checkout/checkout.component').then(
        (m) => m.CheckoutComponent,
      ),
    data: { breadcrumb: 'Checkout' },
    canActivate: [
      (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) =>
        authGuard(route, state),
    ],
  },

  // Account routes (lazy)
  {
    path: 'account',
    loadComponent: () =>
      import('./components/account-dashboard/account-dashboard.component').then(
        (m) => m.AccountDashboardComponent,
      ),
    data: { breadcrumb: 'My Account' },
    canActivate: [
      (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) =>
        authGuard(route, state),
    ],
  },
  {
    path: 'account/wishlist',
    loadComponent: () =>
      import('./components/wishlist/wishlist.component').then(
        (m) => m.WishlistComponent,
      ),
    data: { breadcrumb: 'My Wishlist' },
    canActivate: [
      (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) =>
        authGuard(route, state),
    ],
  },
  {
    path: 'account/addresses',
    loadComponent: () =>
      import('./components/address-book/address-book.component').then(
        (m) => m.AddressBookComponent,
      ),
    data: { breadcrumb: 'Address Book' },
    canActivate: [
      (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) =>
        authGuard(route, state),
    ],
  },
  {
    path: 'cart-details',
    loadComponent: () =>
      import('./components/cart-details/cart-details.component').then(
        (m) => m.CartDetailsComponent,
      ),
    data: { breadcrumb: 'Cart' },
  },
  {
    path: 'products/:id',
    loadComponent: () =>
      import('./components/product-details/product-details.component').then(
        (m) => m.ProductDetailsComponent,
      ),
    data: { breadcrumb: 'Product Details' },
  },
  {
    path: 'search/:keyword',
    loadComponent: () =>
      import('./components/product-list/product-list.component').then(
        (m) => m.ProductListComponent,
      ),
  },
  {
    path: 'category/:id/:name',
    loadComponent: () =>
      import('./components/product-list/product-list.component').then(
        (m) => m.ProductListComponent,
      ),
  },
  {
    path: 'category',
    loadComponent: () =>
      import('./components/product-list/product-list.component').then(
        (m) => m.ProductListComponent,
      ),
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./components/product-list/product-list.component').then(
        (m) => m.ProductListComponent,
      ),
  },

  // Phase 4: Deals, Promotions & Growth (lazy)
  {
    path: 'deals',
    loadComponent: () =>
      import('./components/daily-deals/daily-deals.component').then(
        (m) => m.DailyDealsComponent,
      ),
    data: { breadcrumb: 'Daily Deals' },
  },
  {
    path: 'brands',
    loadComponent: () =>
      import('./components/brand-showcase/brand-showcase.component').then(
        (m) => m.BrandShowcaseComponent,
      ),
    data: { breadcrumb: 'Brands' },
  },
  {
    path: 'gift-cards',
    loadComponent: () =>
      import('./components/gift-card/gift-card.component').then(
        (m) => m.GiftCardComponent,
      ),
    data: { breadcrumb: 'Gift Cards' },
  },
  {
    path: 'account/wallet',
    loadComponent: () =>
      import('./components/wallet/wallet.component').then(
        (m) => m.WalletComponent,
      ),
    data: { breadcrumb: 'Wallet' },
    canActivate: [
      (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) =>
        authGuard(route, state),
    ],
  },
  {
    path: 'account/loyalty',
    loadComponent: () =>
      import('./components/loyalty-dashboard/loyalty-dashboard.component').then(
        (m) => m.LoyaltyDashboardComponent,
      ),
    data: { breadcrumb: 'Loyalty Rewards' },
    canActivate: [
      (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) =>
        authGuard(route, state),
    ],
  },
  {
    path: 'sale/:slug',
    loadComponent: () =>
      import('./components/sale-event-landing/sale-event-landing.component').then(
        (m) => m.SaleEventLandingComponent,
      ),
    data: { breadcrumb: 'Sale' },
  },

  { path: '', redirectTo: '/products', pathMatch: 'full' },

  // Error pages (kept eager — tiny components, needed for error handling)
  {
    path: 'error',
    component: ServerErrorComponent,
    data: { breadcrumb: 'Error' },
  },
  {
    path: 'not-found',
    component: NotFoundComponent,
    data: { breadcrumb: 'Page Not Found' },
  },

  // Wildcard — must be last
  { path: '**', component: NotFoundComponent },
];
