import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { from, lastValueFrom, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthInterceptorService implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    return from(this.handleAccess(request, next));
  }

  private async handleAccess(
    request: HttpRequest<any>,
    next: HttpHandler,
  ): Promise<HttpEvent<any>> {
    const securedEndpoints = [
      'http://localhost:8080/api/orders',
      'http://localhost:8080/api/checkout/purchase',
      'http://localhost:8080/api/checkout/payment-intent',
    ];

    // Check if the URL starts with any of the secured endpoints
    if (securedEndpoints.some((url) => request.urlWithParams.startsWith(url))) {
      try {
        const token = await lastValueFrom(this.auth.getAccessTokenSilently());
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error('Error getting access token:', error);
      }
    }

    return await lastValueFrom(next.handle(request));
  }
}
