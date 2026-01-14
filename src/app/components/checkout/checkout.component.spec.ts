import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { CheckoutComponent } from './checkout.component';
import { CartService } from '../../services/cart.service';
import { CardExpiryService } from '../../services/card-expiry.service';
import { CheckoutService } from '../../services/checkout.service';

describe('CheckoutComponent', () => {
  let component: CheckoutComponent;
  let fixture: ComponentFixture<CheckoutComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockCartService: jasmine.SpyObj<CartService>;
  let mockCardExpiryService: jasmine.SpyObj<CardExpiryService>;
  let mockCheckoutService: jasmine.SpyObj<CheckoutService>;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigateByUrl']);
    mockCartService = jasmine.createSpyObj('CartService', ['computeCartTotals'], {
      totalPrice: of(0),
      totalQuantity: of(0),
      cartItems: []
    });
    mockCardExpiryService = jasmine.createSpyObj('CardExpiryService',
      ['getThisYear', 'getCurrentMonth', 'getCardYear', 'getValidMonths', 'formatExpiryDate', 'getProvinces']);
    mockCheckoutService = jasmine.createSpyObj('CheckoutService', ['placeOrder']);

    // Setup mock return values
    mockCardExpiryService.getThisYear.and.returnValue(2026);
    mockCardExpiryService.getCurrentMonth.and.returnValue(1);
    mockCardExpiryService.getCardYear.and.returnValue(of([2023, 2024, 2025]));
    mockCardExpiryService.getValidMonths.and.returnValue(of([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]));
    mockCardExpiryService.getProvinces.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [CheckoutComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: Router, useValue: mockRouter },
        { provide: CartService, useValue: mockCartService },
        { provide: CardExpiryService, useValue: mockCardExpiryService },
        { provide: CheckoutService, useValue: mockCheckoutService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reset cart and form details and navigate to products page', () => {
    // Setup initial state
    component.sameAsShipping = true;
    component.showOrderReview = true;
    component.showExpirySelector = true;
    component.formattedExpiryDate = '01/23';
    component.shippingAddressStates = [{ id: 1, name: 'Test State' }];
    component.billingAddressStates = [{ id: 2, name: 'Test State 2' }];

    // Call resetCart method
    component.resetCart();

    // Verify cart is reset
    expect(mockCartService.cartItems).toEqual([]);
    expect(mockCartService.totalPrice.next).toHaveBeenCalledWith(0);
    expect(mockCartService.totalQuantity.next).toHaveBeenCalledWith(0);

    // Verify form and UI state variables are reset
    expect(component.sameAsShipping).toBeFalse();
    expect(component.showOrderReview).toBeFalse();
    expect(component.showExpirySelector).toBeFalse();
    expect(component.formattedExpiryDate).toBe('');
    expect(component.shippingAddressStates).toEqual([]);
    expect(component.billingAddressStates).toEqual([]);

    // Verify navigation to products page
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/products');
  });
});
