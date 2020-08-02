import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommitOrBookTableComponent } from './commit-or-book-table.component';

describe('CommitOrBookTableComponent', () => {
  let component: CommitOrBookTableComponent;
  let fixture: ComponentFixture<CommitOrBookTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommitOrBookTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommitOrBookTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
