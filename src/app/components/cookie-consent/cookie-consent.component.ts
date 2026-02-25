import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cookie-consent.component.html',
  styleUrl: './cookie-consent.component.css',
})
export class CookieConsentComponent implements OnInit {
  showBanner = false;
  private readonly COOKIE_CONSENT_KEY = 'nexbuy_cookie_consent';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const consent = localStorage.getItem(this.COOKIE_CONSENT_KEY);
      if (!consent) {
        this.showBanner = true;
      }
    }
  }

  acceptCookies(): void {
    this.saveConsent('accepted');
  }

  rejectCookies(): void {
    this.saveConsent('rejected');
  }

  private saveConsent(value: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.COOKIE_CONSENT_KEY, value);
    }
    this.showBanner = false;
  }
}
