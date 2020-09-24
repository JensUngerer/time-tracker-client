import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsVisualizationComponent } from './stats-visualization.component';

describe('StatsVisualizationComponent', () => {
  let component: StatsVisualizationComponent;
  let fixture: ComponentFixture<StatsVisualizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatsVisualizationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatsVisualizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
