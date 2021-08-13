import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryDateComponent } from './query-date.component';

describe('QueryDateComponent', () => {
  let component: QueryDateComponent;
  let fixture: ComponentFixture<QueryDateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QueryDateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
