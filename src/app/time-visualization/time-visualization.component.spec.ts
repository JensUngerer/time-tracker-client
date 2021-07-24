import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeVisualizationComponent } from './time-visualization.component';

describe('TimeVisualizationComponent', () => {
  let component: TimeVisualizationComponent;
  let fixture: ComponentFixture<TimeVisualizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimeVisualizationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeVisualizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
