import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeeklyWorkingTimeVisualizationComponent } from './weekly-working-time-visualization.component';

describe('WeeklyWorkingTimeVisualizationComponent', () => {
  let component: WeeklyWorkingTimeVisualizationComponent;
  let fixture: ComponentFixture<WeeklyWorkingTimeVisualizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WeeklyWorkingTimeVisualizationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WeeklyWorkingTimeVisualizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
