import { TestBed } from '@angular/core/testing';

import { CardExpiryService } from './card-expiry.service';

describe('CardExpiryService', () => {
  let service: CardExpiryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardExpiryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
