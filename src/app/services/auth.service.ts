import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import {
  AuthResponse,
  GoogleAuthRequest,
  LoginRequest,
  RegisterRequest,
  UserInfo,
} from '../common/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = `${environment.apiUrl}/auth`;

  private currentUserSubject = new BehaviorSubject<UserInfo | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  /** Observable of the current user info */
  currentUser$ = this.currentUserSubject.asObservable();

  /** Observable of whether the user is authenticated */
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private storage: Storage | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.storage = localStorage;
      this.loadStoredUser();
    }
  }

  /**
   * Login with email and password
   */
  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, request).pipe(
      tap((response) => this.handleAuthResponse(response)),
      catchError((error) => {
        console.error('Login failed:', error);
        return throwError(() => error);
      }),
    );
  }

  /**
   * Register a new user account
   */
  register(request: RegisterRequest): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(`${this.baseUrl}/register`, request)
      .pipe(
        catchError((error) => {
          console.error('Registration failed:', error);
          return throwError(() => error);
        }),
      );
  }

  /**
   * Login or register with Google ID token
   */
  googleLogin(credential: string): Observable<AuthResponse> {
    const request: GoogleAuthRequest = { credential };
    return this.http.post<AuthResponse>(`${this.baseUrl}/google`, request).pipe(
      tap((response) => this.handleAuthResponse(response)),
      catchError((error) => {
        console.error('Google login failed:', error);
        return throwError(() => error);
      }),
    );
  }

  /**
   * Logout - clear tokens and user state
   */
  logout(): void {
    this.storage?.removeItem('auth_token');
    this.storage?.removeItem('user_info');
    this.storage?.removeItem('userEmail');
    this.storage?.removeItem('userName');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/products']);
  }

  /**
   * Get the stored JWT token
   */
  getToken(): string | null {
    return this.storage?.getItem('auth_token') ?? null;
  }

  /**
   * Check if user is currently authenticated (synchronous)
   */
  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Check if token is expired
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000; // Convert to milliseconds
      return Date.now() < expiry;
    } catch {
      return false;
    }
  }

  /**
   * Get current user info (synchronous)
   */
  getCurrentUser(): UserInfo | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user has a specific role
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.roles?.includes(role) ?? false;
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.hasRole('ROLE_ADMIN');
  }

  /**
   * Check if user is seller
   */
  isSeller(): boolean {
    return this.hasRole('ROLE_SELLER');
  }

  /**
   * Fetch current user info from API
   */
  fetchCurrentUser(): Observable<UserInfo> {
    return this.http.get<UserInfo>(`${this.baseUrl}/me`);
  }

  // --- Private helpers ---

  private handleAuthResponse(response: AuthResponse): void {
    this.storage?.setItem('auth_token', response.token);

    const userInfo: UserInfo = {
      id: response.id,
      email: response.email,
      firstName: response.firstName,
      lastName: response.lastName,
      roles: response.roles,
    };

    this.storage?.setItem('user_info', JSON.stringify(userInfo));
    this.storage?.setItem('userEmail', JSON.stringify(userInfo.email));
    this.storage?.setItem(
      'userName',
      JSON.stringify(`${userInfo.firstName} ${userInfo.lastName}`),
    );

    this.currentUserSubject.next(userInfo);
    this.isAuthenticatedSubject.next(true);
  }

  private loadStoredUser(): void {
    if (!this.isLoggedIn()) {
      this.logout();
      return;
    }

    const stored = this.storage?.getItem('user_info');
    if (stored) {
      try {
        const userInfo: UserInfo = JSON.parse(stored);
        this.currentUserSubject.next(userInfo);
        this.isAuthenticatedSubject.next(true);
      } catch {
        this.logout();
      }
    }
  }
}
