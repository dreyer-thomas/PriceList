import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceGroup } from '../pricegroup.model';

describe('PriceGroup', () => {
  let component: PriceGroup;
  let fixture: ComponentFixture<PriceGroup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriceGroup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PriceGroup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
