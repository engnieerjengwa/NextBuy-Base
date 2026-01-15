import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { map, tap } from 'rxjs/operators';

export const authGuard = (route?: ActivatedRouteSnapshot, state?: RouterStateSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Store the attempted URL for redirecting
  const url = state?.url || '/checkout';

  return auth.isAuthenticated$.pipe(
    map(isAuthenticated => {
      if (!isAuthenticated) {
        console.log('User is not authenticated, redirecting to login');
        // Redirect to login page or trigger login
        auth.loginWithRedirect({
          appState: { target: url }
        });
        return false;
      }
      return true;
    })
  );
};
