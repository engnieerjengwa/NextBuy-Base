import {
  ApplicationConfig,
  provideZoneChangeDetection,
  inject,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import {
  provideHttpClient,
  withInterceptors,
  HttpHandlerFn,
  HttpRequest,
} from '@angular/common/http';
import { AuthInterceptorService } from './services/auth-interceptor.service';

// Adapter function to convert class-based interceptor to functional interceptor
export function authInterceptorFn(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) {
  const interceptor = inject(AuthInterceptorService);
  const handler = {
    handle: (request: HttpRequest<any>) => next(request),
  };
  return interceptor.intercept(req, handler);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withInterceptors([authInterceptorFn])),
  ],
};
