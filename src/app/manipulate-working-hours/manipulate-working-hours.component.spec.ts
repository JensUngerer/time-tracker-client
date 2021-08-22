import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManipulateWorkingHoursComponent } from './manipulate-working-hours.component';

describe('ManipulateWorkingHoursComponent', () => {
  let component: ManipulateWorkingHoursComponent;
  let fixture: ComponentFixture<ManipulateWorkingHoursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManipulateWorkingHoursComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManipulateWorkingHoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
