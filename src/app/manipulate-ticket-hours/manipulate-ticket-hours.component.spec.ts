import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManipulateTicketHoursComponent } from './manipulate-ticket-hours.component';

describe('ManipulateTicketHoursComponent', () => {
  let component: ManipulateTicketHoursComponent;
  let fixture: ComponentFixture<ManipulateTicketHoursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManipulateTicketHoursComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManipulateTicketHoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
