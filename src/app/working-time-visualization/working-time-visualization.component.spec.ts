import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkingTimeVisualizationComponent } from './working-time-visualization.component';

describe('WorkingTimeVisualizationComponent', () => {
  let component: WorkingTimeVisualizationComponent;
  let fixture: ComponentFixture<WorkingTimeVisualizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkingTimeVisualizationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkingTimeVisualizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
