import { ErrorHandler, Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(
    private router: Router,
    private zone: NgZone,
  ) {}

  handleError(error: any): void {
    // Log the error to the console (replace with Sentry/monitoring in DO-2)
    console.error('Unhandled error:', error);

    // Navigate to the server error page within Angular's zone
    this.zone.run(() => {
      this.router.navigate(['/error']);
    });
  }
}
