import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicTimeEntriesTableComponent } from './dynamic-time-entries-table.component';

describe('DynamicTimeEntriesTableComponent', () => {
  let component: DynamicTimeEntriesTableComponent;
  let fixture: ComponentFixture<DynamicTimeEntriesTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DynamicTimeEntriesTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicTimeEntriesTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
