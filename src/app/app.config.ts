import { ApplicationConfig, provideZoneChangeDetection, inject } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { provideHttpClient, withInterceptors, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { provideAuth0, authHttpInterceptorFn } from '@auth0/auth0-angular';
import { AuthInterceptorService } from './services/auth-interceptor.service';
import { environment } from '../environments/environment';

// Adapter function to convert class-based interceptor to functional interceptor
export function authInterceptorFn(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const interceptor = inject(AuthInterceptorService);
  // Create a proper HttpHandler that wraps the HttpHandlerFn
  const handler = {
    handle: (request: HttpRequest<any>) => next(request)
  };
  return interceptor.intercept(req, handler);
}

// Auth0 configuration
const auth0Config = {
  domain: environment.auth0.domain,
  clientId: environment.auth0.clientId,
  authorizationParams: {
    redirect_uri: environment.auth0.redirectUri,
    audience: environment.auth0.audience,
  },
  httpInterceptor: {
    allowedList: [
      `${environment.apiUrl}/orders/**`,
      `${environment.apiUrl}/checkout/purchase`
    ],
  },
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withInterceptors([authHttpInterceptorFn, authInterceptorFn])),
    provideAuth0(auth0Config),
  ],
};

// Export the Auth0 configuration for use in other parts of the application
export default auth0Config;
