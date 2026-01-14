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
  domain: 'dev-tbkwe1ticmyodaoi.us.auth0.com',
  clientId: 'xt4EDZM5AovUrzYGseQoXtkc880iDpxb',
  authorizationParams: {
    redirect_uri: 'http://localhost:4200/login/callback',
    audience: 'http://localhost:8080',
  },
  httpInterceptor: {
    allowedList: [
      'http://localhost:8080/api/orders/**',
      'http://localhost:8080/api/checkout/purchase'
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
