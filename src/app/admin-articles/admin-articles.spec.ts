import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminArticles } from './admin-articles';

describe('AdminArticles', () => {
  let component: AdminArticles;
  let fixture: ComponentFixture<AdminArticles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminArticles]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminArticles);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
