import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingDeclarationComponent } from './booking-declaration.component';

describe('BookingDeclarationComponent', () => {
  let component: BookingDeclarationComponent;
  let fixture: ComponentFixture<BookingDeclarationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BookingDeclarationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BookingDeclarationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
