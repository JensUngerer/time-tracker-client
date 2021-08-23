import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpandTicketHoursComponent } from './expand-ticket-hours.component';

describe('ExpandTicketHoursComponent', () => {
  let component: ExpandTicketHoursComponent;
  let fixture: ComponentFixture<ExpandTicketHoursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExpandTicketHoursComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpandTicketHoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
