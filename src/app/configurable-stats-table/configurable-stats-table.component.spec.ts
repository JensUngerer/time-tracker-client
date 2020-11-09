import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigurableStatsTableComponent } from './configurable-stats-table.component';

describe('ConfigurableStatsTableComponent', () => {
  let component: ConfigurableStatsTableComponent;
  let fixture: ComponentFixture<ConfigurableStatsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfigurableStatsTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigurableStatsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
