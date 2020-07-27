import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommitTableComponent } from './commit-table.component';

describe('CommitTableComponent', () => {
  let component: CommitTableComponent;
  let fixture: ComponentFixture<CommitTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommitTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommitTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
