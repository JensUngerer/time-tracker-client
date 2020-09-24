import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryTimeBoundariesComponent } from './query-time-boundaries.component';

describe('QueryTimeBoundariesComponent', () => {
  let component: QueryTimeBoundariesComponent;
  let fixture: ComponentFixture<QueryTimeBoundariesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QueryTimeBoundariesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryTimeBoundariesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
