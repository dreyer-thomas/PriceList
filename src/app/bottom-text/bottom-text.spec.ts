import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BottomText } from './bottom-text';

describe('BottomText', () => {
  let component: BottomText;
  let fixture: ComponentFixture<BottomText>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottomText]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BottomText);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
