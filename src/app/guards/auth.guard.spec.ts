import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceMock = jasmine.createSpyObj('AuthService', ['isLoggedIn']);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });
  });

  it('should redirect to login and return false when user is not authenticated', () => {
    authServiceMock.isLoggedIn.and.returnValue(false);

    TestBed.runInInjectionContext(() => {
      const result = authGuard({} as any, { url: '/orders' } as any);

      expect(result).toBeFalse();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/login'], {
        queryParams: { returnUrl: '/orders' },
      });
    });
  });

  it('should return true when user is authenticated', () => {
    authServiceMock.isLoggedIn.and.returnValue(true);

    TestBed.runInInjectionContext(() => {
      const result = authGuard({} as any, { url: '/orders' } as any);

      expect(result).toBeTrue();
      expect(routerMock.navigate).not.toHaveBeenCalled();
    });
  });
});
