import { TestBed } from '@angular/core/testing';

import { PriceGroup } from './price-group';

describe('PriceGroup', () => {
  let service: PriceGroup;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PriceGroup);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
