import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionTimeVisualizationComponent } from './session-time-visualization.component';

describe('SessionTimeVisualizationComponent', () => {
  let component: SessionTimeVisualizationComponent;
  let fixture: ComponentFixture<SessionTimeVisualizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SessionTimeVisualizationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SessionTimeVisualizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
