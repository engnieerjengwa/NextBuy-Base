import { DOCUMENT, NgIf, isPlatformBrowser } from '@angular/common';
import {
  Component,
  Inject,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login-status',
  standalone: true,
  imports: [NgIf, RouterLink],
  templateUrl: './login-status.component.html',
  styleUrl: './login-status.component.css',
})
export class LoginStatusComponent implements OnInit, OnDestroy {
  isAuthenticated: boolean = false;
  userName: string | undefined;

  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.authService.isAuthenticated$.subscribe((authenticated: boolean) => {
        this.isAuthenticated = authenticated;
      }),
    );

    this.subscriptions.push(
      this.authService.currentUser$.subscribe((user) => {
        if (user) {
          this.userName = `${user.firstName} ${user.lastName}`;
        } else {
          this.userName = undefined;
        }
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  logout(): void {
    this.authService.logout();
  }
}
