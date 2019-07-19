import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompletedTimeEntryComponent } from './completed-time-entry.component';

describe('CompletedTimeEntryComponent', () => {
  let component: CompletedTimeEntryComponent;
  let fixture: ComponentFixture<CompletedTimeEntryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompletedTimeEntryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompletedTimeEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
