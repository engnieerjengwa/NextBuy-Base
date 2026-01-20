import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { map } from 'rxjs/operators';

export const authGuard = (route?: ActivatedRouteSnapshot, state?: RouterStateSnapshot) => {
  const auth = inject(AuthService);

  // Store the attempted URL for redirecting
  const url = state?.url || '/checkout';

  return auth.isAuthenticated$.pipe(
    map(isAuthenticated => {
      if (!isAuthenticated) {
        console.log('User is not authenticated, redirecting to login');
        auth.loginWithRedirect({
          appState: { target: url }
        });
        return false;
      }
      return true;
    })
  );
};
