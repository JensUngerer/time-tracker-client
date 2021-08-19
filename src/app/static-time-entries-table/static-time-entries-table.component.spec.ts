import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaticTimeEntriesTableComponent } from './static-time-entries-table.component';

describe('StaticTimeEntriesTableComponent', () => {
  let component: StaticTimeEntriesTableComponent;
  let fixture: ComponentFixture<StaticTimeEntriesTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StaticTimeEntriesTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StaticTimeEntriesTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
