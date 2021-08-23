import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketHoursComponent } from './ticket-hours.component';

describe('TicketHoursComponent', () => {
  let component: TicketHoursComponent;
  let fixture: ComponentFixture<TicketHoursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TicketHoursComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketHoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
