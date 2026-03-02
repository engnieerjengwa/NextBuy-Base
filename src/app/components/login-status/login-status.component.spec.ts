import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';

import { LoginStatusComponent } from './login-status.component';
import { AuthService } from '../../services/auth.service';

describe('LoginStatusComponent', () => {
  let component: LoginStatusComponent;
  let fixture: ComponentFixture<LoginStatusComponent>;

  beforeEach(async () => {
    const mockAuthService = {
      isAuthenticated$: new BehaviorSubject<boolean>(false),
      currentUser$: new BehaviorSubject<any>(null),
      isLoggedIn: jasmine.createSpy('isLoggedIn').and.returnValue(false),
      logout: jasmine.createSpy('logout'),
    };

    await TestBed.configureTestingModule({
      imports: [LoginStatusComponent, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call logout when logout is called', () => {
    const authService = TestBed.inject(AuthService);
    component.logout();
    expect(authService.logout).toHaveBeenCalled();
  });
});
