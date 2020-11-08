import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DaySelectComponent } from './day-select.component';

describe('DaySelectComponent', () => {
  let component: DaySelectComponent;
  let fixture: ComponentFixture<DaySelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DaySelectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DaySelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
