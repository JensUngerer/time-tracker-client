import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsByCategoryTableComponent } from './stats-by-category-table.component';

describe('StatsByCategoryTableComponent', () => {
  let component: StatsByCategoryTableComponent;
  let fixture: ComponentFixture<StatsByCategoryTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatsByCategoryTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatsByCategoryTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
