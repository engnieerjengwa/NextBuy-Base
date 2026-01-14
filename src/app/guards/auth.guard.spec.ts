import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { of } from 'rxjs';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceMock = jasmine.createSpyObj('AuthService', [], {
      isAuthenticated$: of(false)
    });
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    });
  });

  it('should redirect to home and return false when user is not authenticated', (done) => {
    // Arrange
    TestBed.runInInjectionContext(() => {
      // Act
      const guard = authGuard();

      // Assert
      guard.subscribe(result => {
        expect(result).toBeFalse();
        expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
        done();
      });
    });
  });

  it('should return true when user is authenticated', (done) => {
    // Arrange
    authServiceMock = jasmine.createSpyObj('AuthService', [], {
      isAuthenticated$: of(true)
    });

    TestBed.overrideProvider(AuthService, { useValue: authServiceMock });

    TestBed.runInInjectionContext(() => {
      // Act
      const guard = authGuard();

      // Assert
      guard.subscribe(result => {
        expect(result).toBeTrue();
        expect(routerMock.navigate).not.toHaveBeenCalled();
        done();
      });
    });
  });
});
