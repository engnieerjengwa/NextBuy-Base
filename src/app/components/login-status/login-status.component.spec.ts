import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { of } from 'rxjs';

import { LoginStatusComponent } from './login-status.component';
import { AuthService } from '@auth0/auth0-angular';

describe('LoginStatusComponent', () => {
  let component: LoginStatusComponent;
  let fixture: ComponentFixture<LoginStatusComponent>;

  beforeEach(async () => {
    const mockAuthService = {
      isAuthenticated$: of(false),
      user$: of(null),
      loginWithRedirect: jasmine.createSpy('loginWithRedirect'),
      logout: jasmine.createSpy('logout')
    };

    await TestBed.configureTestingModule({
      imports: [LoginStatusComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: DOCUMENT, useValue: document }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call loginWithRedirect when login is called', () => {
    const authService = TestBed.inject(AuthService);
    component.login();
    expect(authService.loginWithRedirect).toHaveBeenCalled();
  });

  it('should call logout with correct parameters when logout is called', () => {
    const authService = TestBed.inject(AuthService);
    const document = TestBed.inject(DOCUMENT);
    component.logout();
    expect(authService.logout).toHaveBeenCalledWith({ logoutParams: { returnTo: document.location.origin } });
  });
});
