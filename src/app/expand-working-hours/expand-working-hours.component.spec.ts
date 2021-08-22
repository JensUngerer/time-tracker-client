import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpandWorkingHoursComponent } from './expand-working-hours.component';

describe('ExpandWorkingHoursComponent', () => {
  let component: ExpandWorkingHoursComponent;
  let fixture: ComponentFixture<ExpandWorkingHoursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExpandWorkingHoursComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpandWorkingHoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
