import { Routes, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductDetailsComponent } from './components/product-details/product-details.component';
import { CartDetailsComponent } from './components/cart-details/cart-details.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { OrderHistoryComponent } from './components/order-history/order-history.component';
import { OrderDetailComponent } from './components/order-detail/order-detail.component';
import { LogReturnComponent } from './components/log-return/log-return.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Order routes with authentication
  { path: 'orders', component: OrderHistoryComponent, canActivate: [(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => authGuard(route, state)] },
  { path: 'orders/:orderId', component: OrderDetailComponent, canActivate: [(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => authGuard(route, state)] },
  { path: 'orders/:orderId/return', component: LogReturnComponent, canActivate: [(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => authGuard(route, state)] },

  // Legacy route for backward compatibility
  { path: 'order-history', redirectTo: '/orders', pathMatch: 'full' },

  // Other routes
  { path: 'checkout', component: CheckoutComponent, canActivate: [(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => authGuard(route, state)] },
  { path: 'cart-details', component: CartDetailsComponent },
  { path: 'products/:id', component: ProductDetailsComponent },
  { path: 'search/:keyword', component: ProductListComponent },
  { path: 'category/:id/:name', component: ProductListComponent },
  { path: 'category', component: ProductListComponent },
  { path: 'products', component: ProductListComponent },
  { path: '', redirectTo: '/products', pathMatch: 'full' },
  { path: '**', redirectTo: '/products', pathMatch: 'full' },
];
