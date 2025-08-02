import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminGeneral } from './admin-general';

describe('AdminGeneral', () => {
  let component: AdminGeneral;
  let fixture: ComponentFixture<AdminGeneral>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminGeneral]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminGeneral);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
